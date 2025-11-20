import { supabase as supabaseClient } from '@/lib/supabase'
import { GenerateDocstringRequest, GenerateDocstringResponse, DocgenHistory } from '@/types'

function getSupabase() {
  if (!supabaseClient) {
    throw new Error('Supabase not configured')
  }
  return supabaseClient
}

export async function generateDocstrings(
  request: GenerateDocstringRequest
): Promise<GenerateDocstringResponse> {
  const supabase = getSupabase()

  const { data, error } = await supabase.functions.invoke('generate-docstring', {
    body: request,
  })

  if (error) {
    throw new Error(`Failed to generate docstrings: ${error.message}`)
  }

  return data
}

export async function saveToHistory(history: Omit<DocgenHistory, 'id' | 'created_at'>) {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('docgen_history')
    .insert([history as any])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save history: ${error.message}`)
  }

  return data
}

export async function getHistory(userId: string): Promise<DocgenHistory[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('docgen_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch history: ${error.message}`)
  }

  return data || []
}

export async function deleteHistoryItem(id: string) {
  const supabase = getSupabase()

  const { error } = await supabase.from('docgen_history').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete history item: ${error.message}`)
  }
}
