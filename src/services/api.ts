import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/supabase-js';

// removed node-only top-level imports to avoid browser/runtime bundling errors
// import fetch from 'node-fetch';
// import IORedis from 'ioredis';

type DocstringRequest = {
  userId?: string;
  ip?: string;
  code: string;
  filename?: string;
  language?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  cacheKey?: string;
};

type DocstringResponse = {
  docstring: string;
  modelUsed: string;
  raw?: Record<string, unknown>;
  tokensUsed?: number;
};

type DocstringRecord = {
  id?: string;
  user_id?: string | null;
  filename?: string | null;
  code: string;
  docstring: string;
  model: string;
  created_at?: string;
  meta?: Record<string, any> | null;
};

type ApiError = {
  message: string;
  status?: number;
  code?: string;
  original?: any;
};

type RateLimitOptions = {
  points: number;
  windowSeconds: number;
};

class Logger {
  static debug(...args: any[]) {
    if (process.env.NODE_ENV !== 'production') console.debug('[DEBUG]', ...args);
  }
  static info(...args: any[]) {
    console.info('[INFO]', ...args);
  }
  static warn(...args: any[]) {
    console.warn('[WARN]', ...args);
  }
  static error(...args: any[]) {
    console.error('[ERROR]', ...args);
  }
}

/**
 * Simple LRU cache with TTL in-memory for caching docstring responses.
 */
class LRUCache<T> {
  private maxSize: number;
  private ttlMs: number;
  private map: Map<string, { value: T; expiresAt: number }>;

  constructor(maxSize = 1000, ttlSeconds = 300) {
    this.maxSize = maxSize;
    this.ttlMs = ttlSeconds * 1000;
    this.map = new Map();
  }

  get(key: string): T | undefined {
    const item = this.map.get(key);
    if (!item) return undefined;
    if (Date.now() > item.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    // refresh to mark as most recently used
    this.map.delete(key);
    this.map.set(key, item);
    return item.value;
  }

  set(key: string, value: T) {
    if (this.map.has(key)) this.map.delete(key);
    while (this.map.size >= this.maxSize) {
      // remove oldest
      const oldestKey = this.map.keys().next().value as string;
      this.map.delete(oldestKey);
    }
    this.map.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  delete(key: string) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}

/**
 * Rate limiter abstraction - in-memory token-bucket
 */
class RateLimiter {
  private memoryBuckets: Map<string, { tokens: number; lastRefill: number }>;
  private points: number;
  private windowSeconds: number;
  private refillRatePerMs: number;

  constructor(options: RateLimitOptions) {
    this.points = options.points;
    this.windowSeconds = options.windowSeconds;
    this.memoryBuckets = new Map();
    this.refillRatePerMs = options.points / (options.windowSeconds * 1000);
  }

  private refillBucket(bucket: { tokens: number; lastRefill: number }) {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const refill = elapsed * this.refillRatePerMs;
    bucket.tokens = Math.min(this.points, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  async isAllowed(key: string, cost = 1): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    let bucket = this.memoryBuckets.get(key);
    if (!bucket) {
      bucket = { tokens: this.points, lastRefill: now };
      this.memoryBuckets.set(key, bucket);
    }
    this.refillBucket(bucket);
    if (bucket.tokens < cost) {
      return { allowed: false, remaining: Math.floor(bucket.tokens) };
    }
    bucket.tokens -= cost;
    return { allowed: true, remaining: Math.floor(bucket.tokens) };
  }
}

class ApiService {
  private supabase: SupabaseClient;
  private geminiEndpoint: string;
  private geminiApiKey?: string;
  private cache: LRUCache<DocstringResponse>;
  private rateLimiter: RateLimiter;
  private defaultModel: string;
  private maxRetries: number;

  constructor() {
    // Use VITE_* env vars (Vite / frontend friendly)
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) {
      Logger.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in your .env file.');
      throw new Error('Supabase config missing: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
    }
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // Gemini config (use REST endpoint); key via VITE_GEMINI_API_KEY
    this.geminiEndpoint = process.env.VITE_GEMINI_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta2/models/{model}:generateText';
    this.geminiApiKey = process.env.VITE_GEMINI_API_KEY;
    if (!this.geminiApiKey) {
      Logger.warn('VITE_GEMINI_API_KEY not set; Gemini calls will fail until configured.');
    }

    const rateLimitPoints = Number(process.env.RATE_LIMIT_POINTS || 20);
    const rateLimitWindow = Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 60);
    this.rateLimiter = new RateLimiter({ points: rateLimitPoints, windowSeconds: rateLimitWindow });

    const cacheSize = Number(process.env.CACHE_MAX_ITEMS || 1000);
    const cacheTTL = Number(process.env.CACHE_TTL_SECONDS || 300);
    this.cache = new LRUCache<DocstringResponse>(cacheSize, cacheTTL);

    this.defaultModel = process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
    this.maxRetries = Number(process.env.API_MAX_RETRIES || 3);
  }

  // exported initializer
  static initializeSupabase(): SupabaseClient {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required to initialize Supabase.');
    }
    return createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  }

  private buildCacheKey(req: DocstringRequest) {
    if (req.cacheKey) return `doc:${req.cacheKey}`;
    const normalized = `${req.language || 'auto'}|${req.filename || ''}|${(req.code || '').trim()}|${req.model || this.defaultModel}|${req.temperature ?? 0}|${req.maxOutputTokens ?? 256}`;
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const chr = normalized.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return `doc:${hash}`;
  }

  private async retry<T>(fn: () => Promise<T>, attempts = this.maxRetries, baseDelay = 300): Promise<T> {
    let lastErr: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        const delay = baseDelay * Math.pow(2, i);
        Logger.warn(`Retry attempt ${i + 1} failed, retrying in ${delay}ms`, (err as any)?.message ?? err);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastErr;
  }

  // dynamic fetch helper to support browser and Node environments
  private async getFetch(): Promise<typeof fetch> {
    if (typeof (globalThis as any).fetch === 'function') return (globalThis as any).fetch;
    try {
      // dynamic require to avoid bundling node-fetch in browser
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nf = require('node-fetch') as typeof import('node-fetch');
      return (nf as any).default ?? (nf as any);
    } catch (err) {
      throw { message: 'fetch not available and node-fetch failed to load', original: err } as ApiError;
    }
  }

  private async callGemini(prompt: string, model?: string, temperature = 0.0, maxOutputTokens = 256): Promise<any> {
    if (!this.geminiApiKey) {
      throw { message: 'Gemini API key not configured (VITE_GEMINI_API_KEY)' } as ApiError;
    }
    const modelToUse = model || this.defaultModel;
    const url = this.geminiEndpoint.replace('{model}', modelToUse);

    const payload = {
      prompt,
      temperature,
      maxOutputTokens,
      model: modelToUse,
    };

    return this.retry(async () => {
      const fetchFn = await this.getFetch();
      const res = await fetchFn(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.geminiApiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'ai-docstring-generator/1.0',
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => '');
      let parsed: any = {};
      try {
        parsed = text ? JSON.parse(text) : {};
      } catch {
        parsed = { raw: text };
      }

      if (!res.ok) {
        const err: ApiError = {
          message: parsed?.error?.message || parsed?.message || `Gemini API error: ${res.status}`,
          status: res.status,
          original: parsed,
        };
        Logger.error('Gemini API returned error', err);
        throw err;
      }

      return parsed;
    });
  }

  private async saveGenerationHistoryToSupabase(record: DocstringRecord): Promise<DocstringRecord> {
    const insert = async () => {
      // uses generation_history table per project spec
      const { data, error } = await this.supabase.from('generation_history').insert(record).select().single();
      if (error) {
        Logger.error('Supabase insert error', error);
        throw error;
      }
      return data as DocstringRecord;
    };
    return this.retry(insert);
  }

  private async queryGenerationHistory(userId?: string, limit = 50, offset = 0): Promise<DocstringRecord[]> {
    const query = async () => {
      const from = offset;
      const to = offset + limit - 1;
      let q = this.supabase.from('generation_history').select('*').order('created_at', { ascending: false }).range(from, to);
      if (userId) q = q.eq('user_id', userId);
      const { data, error } = await q;
      if (error) {
        Logger.error('Supabase select error', error);
        throw error;
      }
      return (data || []) as DocstringRecord[];
    };
    return this.retry(query);
  }

  async generateDocstring(code: string, language?: string, functionName?: string, options?: { style?: string; includeTypes?: boolean; includeExamples?: boolean; includeRaises?: boolean; temperature?: number; maxOutputTokens?: number; userId?: string; filename?: string; ip?: string; }): Promise<{ success: boolean; docstring?: string; error?: string; tokensUsed?: number }> {
    // simple validation
    if (!code || `${code}`.trim() === '') {
      return { success: false, error: 'code is required' };
    }

    const rateKey = options?.userId ? `user:${options.userId}` : `ip:${options?.ip ?? 'anon'}`;
    const { allowed } = await this.rateLimiter.isAllowed(rateKey, 1);
    if (!allowed) return { success: false, error: 'rate limit exceeded' };

    const req: DocstringRequest = {
      userId: options?.userId,
      ip: options?.ip,
      code,
      filename: options?.filename,
      language,
      model: this.defaultModel,
      temperature: options?.temperature,
      maxOutputTokens: options?.maxOutputTokens,
    };

    const cacheKey = this.buildCacheKey(req);
    const cached = this.cache.get(cacheKey);
    if (cached) return { success: true, docstring: cached.docstring, tokensUsed: cached.tokensUsed };

    // build prompt per spec
    const style = options?.style ?? 'google';
    const includeTypes = options?.includeTypes ?? true;
    const includeExamples = options?.includeExamples ?? false;
    const includeRaises = options?.includeRaises ?? false;
    const prompt = `Generate a ${style} style docstring for this ${language ?? 'unknown'} function named ${functionName ?? 'unknown'}. Include type hints: ${includeTypes}. Include examples: ${includeExamples}. Include exception documentation: ${includeRaises}. Code: ${code}. Return only the docstring without code fences or explanations.`;

    let raw;
    try {
      raw = await this.callGemini(prompt, this.defaultModel, options?.temperature ?? 0.0, options?.maxOutputTokens ?? 256);
    } catch (err: any) {
      Logger.error('Gemini call failed', err);
      return { success: false, error: err?.message ?? 'Gemini call failed' };
    }

    const docstring = this.extractDocstringFromGeminiResponse(raw);
    const tokensUsed = (raw?.usage?.totalTokens as number) ?? (raw?.usage?.promptTokens as number) ?? undefined;

    // cache Gemini response
    this.cache.set(cacheKey, { docstring, modelUsed: this.defaultModel, raw, tokensUsed });

    // persist history (best-effort)
    try {
      const record: DocstringRecord = {
        user_id: options?.userId ?? null,
        filename: options?.filename ?? null,
        code,
        docstring,
        model: this.defaultModel,
        meta: { language, functionName, style, tokensUsed },
      };
      await this.saveGenerationHistoryToSupabase(record);
    } catch (err) {
      Logger.warn('Failed to save generation history (non-fatal)', err);
    }

    return { success: true, docstring, tokensUsed };
  }

  async saveGenerationHistory(user_id: string | null, file_name: string | null, language: string | null, function_name: string | null, original_code: string, generated_docstring: string, style: string, tokens_used: number) {
    if (!original_code || !generated_docstring) throw { message: 'original_code and generated_docstring required' } as ApiError;
    const rec: DocstringRecord = {
      user_id,
      filename: file_name,
      code: original_code,
      docstring: generated_docstring,
      model: this.defaultModel,
      meta: { language, function_name, style, tokens_used },
    };
    return this.saveGenerationHistoryToSupabase(rec);
  }

  async getGenerationHistory(user_id: string, limit = 50, page = 0) {
    if (!user_id) throw { message: 'user_id required' } as ApiError;
    const offset = page * limit;
    return this.queryGenerationHistory(user_id, limit, offset);
  }

  async getUserPreferences(user_id: string) {
    if (!user_id) throw { message: 'user_id required' } as ApiError;
    const cacheKey = `preferences:${user_id}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.raw) return cached.raw;

    try {
      const { data, error } = await this.supabase.from('user_preferences').select('*').eq('user_id', user_id).single();
      if (error && (error as PostgrestError).message !== 'No rows found') {
        throw error;
      }
      const prefs = (data as Record<string, unknown>) ?? {
        default_style: 'google',
        default_include_types: true,
        default_include_examples: false,
        default_include_raises: false,
      };
      this.cache.set(cacheKey, { docstring: '', modelUsed: '', raw: prefs });
      return prefs;
    } catch (err) {
      Logger.warn('Failed to load preferences, returning defaults', err);
      return {
        default_style: 'google',
        default_include_types: true,
        default_include_examples: false,
        default_include_raises: false,
      };
    }
  }

  async updateUserPreferences(user_id: string, preferences: { default_style: string; default_include_types: boolean; default_include_examples: boolean; default_include_raises: boolean; }) {
    if (!user_id) throw { message: 'user_id required' } as ApiError;
    const payload = { user_id, ...preferences };
    const { data, error } = await this.supabase.from('user_preferences').upsert(payload, { onConflict: 'user_id' }).select().single();
    if (error) {
      Logger.error('Failed to upsert preferences', error);
      throw error;
    }
    const cacheKey = `preferences:${user_id}`;
    this.cache.delete(cacheKey);
    this.cache.set(cacheKey, { docstring: '', modelUsed: '', raw: data as Record<string, unknown> });
    return data;
  }

  async deleteHistoryItem(history_id: string, user_id: string) {
    if (!history_id || !user_id) throw { message: 'history_id and user_id required' } as ApiError;
    const { error } = await this.supabase.from('generation_history').delete().eq('id', history_id).eq('user_id', user_id);
    if (error) {
      Logger.error('Failed to delete history item', error);
      throw error;
    }
    return true;
  }

  async batchGenerateDocstrings(functions: { code: string; functionName?: string }[], language?: string, options?: { style?: string; includeTypes?: boolean; includeExamples?: boolean; includeRaises?: boolean; temperature?: number; maxOutputTokens?: number; userId?: string; filename?: string; ip?: string; }) {
    if (!Array.isArray(functions)) throw { message: 'functions must be an array' } as ApiError;
    const concurrent = Math.min(10, Number(process.env.BATCH_CONCURRENT || 5));
    const delayMs = Number(process.env.BATCH_DELAY_MS || 200);

    const results: { success: boolean; docstring?: string; error?: string }[] = [];
    const queue: Promise<void>[] = [];
    for (const fn of functions) {
      const task = async () => {
        try {
          const res = await this.generateDocstring(fn.code, language, fn.functionName, { ...(options ?? {}), userId: options?.userId, filename: options?.filename, ip: options?.ip, temperature: options?.temperature, maxOutputTokens: options?.maxOutputTokens });
          results.push({ success: !!res.success, docstring: res.docstring, error: res.error });
        } catch (err: any) {
          Logger.warn('batch item failed', err?.message ?? err);
          results.push({ success: false, error: err?.message ?? String(err) });
        }
      };

      queue.push(task());
      if (queue.length >= concurrent) {
        await Promise.race(queue).catch(() => undefined);
        // small delay to avoid burst
        await new Promise((r) => setTimeout(r, delayMs));
        // compact queue by awaiting settled ones (we keep simple)
        await Promise.allSettled(queue.splice(0, concurrent));
      }
    }
    await Promise.allSettled(queue);
    return results;
  }

  private buildPrompt(req: DocstringRequest) {
    const header = `You are an AI assistant that writes precise, concise, and idiomatic docstrings/comments for code. Provide only the docstring or comment block without additional explanation.`;
    const instructions = `Language: ${req.language || 'detect'}\nFilename: ${req.filename || 'unknown'}\nReturn only the docstring formatted appropriately for the language (include proper delimiters). Preserve code semantics; do not modify code.\n`;
    const examples = `Example (Python):\n\"\"\"Sort a list of integers in-place using Timsort (Python's built-in sort).\"\"\"\n`;
    return `${header}\n${instructions}\n${examples}\nCode:\n${req.code}\n\nDocstring:`;
  }

  private extractDocstringFromGeminiResponse(response: any): string {
    if (!response) return '';
    if (typeof response === 'string') return response;
    if (response.outputText && typeof response.outputText === 'string') return response.outputText;
    if (response.text && typeof response.text === 'string') return response.text;
    if (response.choices && Array.isArray(response.choices) && response.choices.length) {
      const choice = response.choices[0];
      if (choice.text) return String(choice.text);
      if (choice.message && choice.message.content) return String(choice.message.content);
      if (choice.output) return String(choice.output);
    }
    if (response.candidates && Array.isArray(response.candidates) && response.candidates[0]) {
      const cand = response.candidates[0];
      if (cand.output) return String(cand.output);
      if (cand.content) {
        if (typeof cand.content === 'string') return cand.content;
        if (Array.isArray(cand.content)) return cand.content.map((c: any) => c.text || '').join('');
      }
    }
    try {
      return JSON.stringify(response);
    } catch {
      return String(response);
    }
  }

  async healthCheck(): Promise<{ ok: boolean; details: any }> {
    const details: any = {};
    try {
      const sel = await this.supabase.from('generation_history').select('id').limit(1);
      details.supabase = { ok: !sel.error };
      if (sel.error) details.supabase.error = sel.error.message;
    } catch (err) {
      details.supabase = { ok: false, error: String(err) };
    }

    details.gemini = { ok: !!this.geminiApiKey, reason: this.geminiApiKey ? undefined : 'VITE_GEMINI_API_KEY not set' };

    const ok = Object.values(details).every((d: any) => d && d.ok);
    return { ok: !!ok, details };
  }
}

// singleton
const apiService = new ApiService();

// named exports per spec
export function initializeSupabase() {
  return ApiService.initializeSupabase();
}

export async function generateDocstring(code: string, language?: string, functionName?: string, options?: { style?: string; includeTypes?: boolean; includeExamples?: boolean; includeRaises?: boolean; temperature?: number; maxOutputTokens?: number; userId?: string; filename?: string; ip?: string; }) {
  return apiService.generateDocstring(code, language, functionName, options);
}

export async function saveGenerationHistory(user_id: string | null, file_name: string | null, language: string | null, function_name: string | null, original_code: string, generated_docstring: string, style: string, tokens_used: number) {
  return apiService.saveGenerationHistory(user_id, file_name, language, function_name, original_code, generated_docstring, style, tokens_used);
}

export async function getGenerationHistory(user_id: string, limit = 50, page = 0) {
  return apiService.getGenerationHistory(user_id, limit, page);
}

export async function getUserPreferences(user_id: string) {
  return apiService.getUserPreferences(user_id);
}

export async function updateUserPreferences(user_id: string, preferences: { default_style: string; default_include_types: boolean; default_include_examples: boolean; default_include_raises: boolean; }) {
  return apiService.updateUserPreferences(user_id, preferences);
}

export async function deleteHistoryItem(history_id: string, user_id: string) {
  return apiService.deleteHistoryItem(history_id, user_id);
}

export async function batchGenerateDocstrings(functions: { code: string; functionName?: string }[], language?: string, options?: { style?: string; includeTypes?: boolean; includeExamples?: boolean; includeRaises?: boolean; temperature?: number; maxOutputTokens?: number; userId?: string; filename?: string; ip?: string; }) {
  return apiService.batchGenerateDocstrings(functions, language, options);
}

export default {
  initializeSupabase,
  generateDocstring,
  saveGenerationHistory,
  getGenerationHistory,
  getUserPreferences,
  updateUserPreferences,
  deleteHistoryItem,
  batchGenerateDocstrings,
};