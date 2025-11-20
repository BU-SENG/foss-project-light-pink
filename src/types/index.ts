export interface FunctionMetadata {
  name: string
  params: string[]
  body: string
  startLine: number
  endLine: number
  type: 'function' | 'class' | 'method'
  docstring?: string
}

export interface GenerateDocstringRequest {
  language: 'python' | 'javascript'
  functions: Array<{
    name: string
    params: string[]
    body: string
    type?: string
  }>
  format?: 'google' | 'numpy' | 'sphinx' | 'jsdoc'
}

export interface GenerateDocstringResponse {
  docstrings: Array<{
    name: string
    docstring: string
  }>
}

export interface DocgenHistory {
  id: string
  user_id: string
  filename: string
  language: string
  content_before: string
  content_after: string
  created_at: string
}

export type Language = 'python' | 'javascript'
export type DocstringFormat = 'google' | 'numpy' | 'sphinx' | 'jsdoc'
