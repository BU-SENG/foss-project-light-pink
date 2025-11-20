import { supabase } from '@/lib/supabase'
import { GenerateDocstringRequest, GenerateDocstringResponse, DocgenHistory } from '@/types'

export async function generateDocstrings(
  request: GenerateDocstringRequest
): Promise<GenerateDocstringResponse> {
  if (!supabase) {
    throw new Error(
      'Supabase not configured. Please set up your .env file with Supabase credentials.'
    )
  }

  const { data, error } = await supabase.functions.invoke('generate-docstring', {
    body: request,
  })

  if (error) {
    throw new Error(`Failed to generate docstrings: ${error.message}`)
  }

  return data
}

export async function saveToHistory(history: Omit<DocgenHistory, 'id' | 'created_at'>) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase.from('docgen_history').insert(history).select().single()

  if (error) {
    throw new Error(`Failed to save history: ${error.message}`)
  }

  return data
}

export async function getHistory(userId: string): Promise<DocgenHistory[]> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

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
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { error } = await supabase.from('docgen_history').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete history item: ${error.message}`)
  }
}
