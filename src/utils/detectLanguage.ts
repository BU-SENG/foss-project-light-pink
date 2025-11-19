import { SupportedLanguage } from '@/types';

/**
 * Detects language from a filename's extension.
 * Returns SupportedLanguage.Python for `.py`, SupportedLanguage.JavaScript for `.js`/`.ts`.
 * Defaults to JavaScript for unknown extensions.
 */
export function detectLanguage(fileName: string): SupportedLanguage {
  if (!fileName) return SupportedLanguage.JavaScript;
  const name = fileName.toLowerCase();
  if (name.endsWith('.py')) return SupportedLanguage.Python;
  if (name.endsWith('.js') || name.endsWith('.jsx') || name.endsWith('.mjs')) return SupportedLanguage.JavaScript;
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return SupportedLanguage.JavaScript;
  return SupportedLanguage.JavaScript;
}

export default detectLanguage;
