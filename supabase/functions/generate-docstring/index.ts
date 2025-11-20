// Supabase Edge Function: generate-docstring
// Generates docstrings for functions using Gemini 2.0 Pro

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

interface FunctionInfo {
  name: string
  params: string[]
  body: string
  type?: string
}

interface RequestBody {
  language: 'python' | 'javascript'
  functions: FunctionInfo[]
  format?: 'google' | 'numpy' | 'sphinx' | 'jsdoc'
}

interface DocstringResponse {
  docstrings: Array<{
    name: string
    docstring: string
  }>
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in Supabase secrets')
    }

    const { language, functions, format = 'google' }: RequestBody = await req.json()

    if (!language || !functions || functions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: language and functions' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const docstrings: Array<{ name: string; docstring: string }> = []

    // Process each function
    for (const func of functions) {
      const prompt = generatePrompt(language, func, format)
      
      const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      })

      if (!geminiResponse.ok) {
        const error = await geminiResponse.text()
        console.error('Gemini API error:', error)
        throw new Error(`Gemini API request failed: ${geminiResponse.statusText}`)
      }

      const geminiData = await geminiResponse.json()
      const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        throw new Error('No response from Gemini API')
      }

      // Clean up the generated docstring
      const docstring = cleanDocstring(generatedText, language, format)
      
      docstrings.push({
        name: func.name,
        docstring,
      })
    }

    const response: DocstringResponse = { docstrings }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

function generatePrompt(language: string, func: FunctionInfo, format: string): string {
  const formatInstructions = {
    google: `Use Google style docstrings with Args:, Returns:, and Raises: sections.`,
    numpy: `Use NumPy style docstrings with Parameters, Returns, and Raises sections.`,
    sphinx: `Use Sphinx style docstrings with :param, :type, :return, and :rtype directives.`,
    jsdoc: `Use JSDoc style comments with @param, @returns, and @throws tags.`,
  }

  const instruction = formatInstructions[format] || formatInstructions.google

  if (language === 'python') {
    return `You are a documentation expert for Python code. Generate a professional, clear, and concise docstring for the following ${func.type || 'function'}. ${instruction}

Function name: ${func.name}
Parameters: ${func.params.join(', ') || 'none'}
Function body:
\`\`\`python
${func.body}
\`\`\`

Generate ONLY the docstring content (the text that goes inside the triple quotes), without the triple quotes themselves, without any code, and without any additional explanation. Be concise but informative. Focus on what the function does, what parameters it accepts, and what it returns.`
  } else {
    return `You are a documentation expert for JavaScript/TypeScript code. Generate a professional, clear, and concise documentation comment for the following ${func.type || 'function'}. ${instruction}

Function name: ${func.name}
Parameters: ${func.params.join(', ') || 'none'}
Function body:
\`\`\`javascript
${func.body}
\`\`\`

Generate ONLY the documentation content (the text that goes inside the comment block), without the comment delimiters (/** */), without any code, and without any additional explanation. Be concise but informative. Focus on what the function does, what parameters it accepts, and what it returns.`
  }
}

function cleanDocstring(text: string, language: string, format: string): string {
  // Remove code blocks
  let cleaned = text.replace(/```[\s\S]*?```/g, '')
  
  // Remove triple quotes if present
  cleaned = cleaned.replace(/"""/g, '')
  cleaned = cleaned.replace(/'''/g, '')
  
  // Remove JSDoc comment markers if present
  cleaned = cleaned.replace(/\/\*\*/g, '')
  cleaned = cleaned.replace(/\*\//g, '')
  cleaned = cleaned.replace(/^\s*\*\s?/gm, '')
  
  // Trim each line and remove excessive blank lines
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter((line, index, arr) => {
      // Keep non-empty lines
      if (line) return true
      // Keep one empty line between sections
      if (index > 0 && index < arr.length - 1 && arr[index - 1] && arr[index + 1]) {
        return true
      }
      return false
    })
    .join('\n')
  
  return cleaned.trim()
}
