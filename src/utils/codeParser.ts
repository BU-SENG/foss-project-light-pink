import { FunctionMetadata } from '@/types'

export function parsePythonCode(code: string): FunctionMetadata[] {
  const functions: FunctionMetadata[] = []
  const lines = code.split('\n')
  
  // Regex patterns
  const funcPattern = /^\s*(async\s+)?def\s+(\w+)\s*\((.*?)\)\s*:/
  const classPattern = /^\s*class\s+(\w+)(\(.*?\))?\s*:/
  const docstringPattern = /^\s*"""([\s\S]*?)"""/m
  
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    
    // Check for function definition
    const funcMatch = line.match(funcPattern)
    if (funcMatch) {
      const name = funcMatch[2]
      const paramsStr = funcMatch[3]
      const params = paramsStr
        .split(',')
        .map(p => p.trim().split('=')[0].split(':')[0].trim())
        .filter(p => p && p !== 'self')
      
      const startLine = i
      let endLine = i + 1
      let indent = line.search(/\S/)
      let body = ''
      
      // Extract function body
      while (endLine < lines.length) {
        const nextLine = lines[endLine]
        const nextIndent = nextLine.search(/\S/)
        
        if (nextLine.trim() && nextIndent <= indent) {
          break
        }
        body += nextLine + '\n'
        endLine++
      }
      
      // Check for existing docstring
      const docstringMatch = body.match(docstringPattern)
      const docstring = docstringMatch ? docstringMatch[1].trim() : undefined
      
      functions.push({
        name,
        params,
        body: body.trim(),
        startLine,
        endLine: endLine - 1,
        type: 'function',
        docstring
      })
      
      i = endLine
      continue
    }
    
    // Check for class definition
    const classMatch = line.match(classPattern)
    if (classMatch) {
      const name = classMatch[1]
      const startLine = i
      let endLine = i + 1
      let indent = line.search(/\S/)
      let body = ''
      
      // Extract class body
      while (endLine < lines.length) {
        const nextLine = lines[endLine]
        const nextIndent = nextLine.search(/\S/)
        
        if (nextLine.trim() && nextIndent <= indent) {
          break
        }
        body += nextLine + '\n'
        endLine++
      }
      
      // Check for existing docstring
      const docstringMatch = body.match(docstringPattern)
      const docstring = docstringMatch ? docstringMatch[1].trim() : undefined
      
      functions.push({
        name,
        params: [],
        body: body.trim(),
        startLine,
        endLine: endLine - 1,
        type: 'class',
        docstring
      })
      
      i = endLine
      continue
    }
    
    i++
  }
  
  return functions
}

export function parseJavaScriptCode(code: string): FunctionMetadata[] {
  const functions: FunctionMetadata[] = []
  const lines = code.split('\n')
  
  // Regex patterns
  const funcPattern = /^\s*(export\s+)?(async\s+)?function\s+(\w+)\s*\((.*?)\)/
  const arrowPattern = /^\s*(export\s+)?(const|let|var)\s+(\w+)\s*=\s*(async\s*)?\((.*?)\)\s*=>/
  const methodPattern = /^\s*(async\s+)?(\w+)\s*\((.*?)\)\s*{/
  const classPattern = /^\s*(export\s+)?class\s+(\w+)/
  const jsDocPattern = /\/\*\*([\s\S]*?)\*\//
  
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    
    // Check for function declaration
    const funcMatch = line.match(funcPattern)
    if (funcMatch) {
      const name = funcMatch[3]
      const paramsStr = funcMatch[4]
      const params = paramsStr
        .split(',')
        .map(p => p.trim().split('=')[0].split(':')[0].trim())
        .filter(p => p)
      
      const startLine = i
      let endLine = i + 1
      let braceCount = 1
      let body = ''
      
      // Find opening brace if not on same line
      while (endLine < lines.length && !lines[startLine].includes('{')) {
        if (lines[endLine].includes('{')) break
        endLine++
      }
      
      // Extract function body
      while (endLine < lines.length && braceCount > 0) {
        const nextLine = lines[endLine]
        body += nextLine + '\n'
        braceCount += (nextLine.match(/{/g) || []).length
        braceCount -= (nextLine.match(/}/g) || []).length
        endLine++
      }
      
      // Check for JSDoc
      let docstring: string | undefined
      if (i > 0) {
        const prevLines = lines.slice(Math.max(0, i - 10), i).join('\n')
        const docMatch = prevLines.match(jsDocPattern)
        if (docMatch) {
          docstring = docMatch[1].trim()
        }
      }
      
      functions.push({
        name,
        params,
        body: body.trim(),
        startLine,
        endLine: endLine - 1,
        type: 'function',
        docstring
      })
      
      i = endLine
      continue
    }
    
    // Check for arrow function
    const arrowMatch = line.match(arrowPattern)
    if (arrowMatch) {
      const name = arrowMatch[3]
      const paramsStr = arrowMatch[5]
      const params = paramsStr
        .split(',')
        .map(p => p.trim().split('=')[0].split(':')[0].trim())
        .filter(p => p)
      
      const startLine = i
      let endLine = i + 1
      let body = ''
      
      // For single-line arrow functions
      if (line.includes('=>') && !line.trim().endsWith('=>')) {
        body = line.substring(line.indexOf('=>') + 2).trim()
      } else {
        // Multi-line arrow functions
        let braceCount = 1
        while (endLine < lines.length && braceCount > 0) {
          const nextLine = lines[endLine]
          body += nextLine + '\n'
          braceCount += (nextLine.match(/{/g) || []).length
          braceCount -= (nextLine.match(/}/g) || []).length
          endLine++
        }
      }
      
      // Check for JSDoc
      let docstring: string | undefined
      if (i > 0) {
        const prevLines = lines.slice(Math.max(0, i - 10), i).join('\n')
        const docMatch = prevLines.match(jsDocPattern)
        if (docMatch) {
          docstring = docMatch[1].trim()
        }
      }
      
      functions.push({
        name,
        params,
        body: body.trim(),
        startLine,
        endLine: endLine - 1,
        type: 'function',
        docstring
      })
      
      i = endLine
      continue
    }
    
    // Check for class definition
    const classMatch = line.match(classPattern)
    if (classMatch) {
      const name = classMatch[2]
      const startLine = i
      let endLine = i + 1
      let braceCount = 0
      let body = ''
      
      // Find opening brace
      while (endLine < lines.length) {
        if (lines[endLine].includes('{')) {
          braceCount = 1
          break
        }
        endLine++
      }
      
      // Extract class body
      while (endLine < lines.length && braceCount > 0) {
        const nextLine = lines[endLine]
        body += nextLine + '\n'
        braceCount += (nextLine.match(/{/g) || []).length
        braceCount -= (nextLine.match(/}/g) || []).length
        endLine++
      }
      
      // Check for JSDoc
      let docstring: string | undefined
      if (i > 0) {
        const prevLines = lines.slice(Math.max(0, i - 10), i).join('\n')
        const docMatch = prevLines.match(jsDocPattern)
        if (docMatch) {
          docstring = docMatch[1].trim()
        }
      }
      
      functions.push({
        name,
        params: [],
        body: body.trim(),
        startLine,
        endLine: endLine - 1,
        type: 'class',
        docstring
      })
      
      i = endLine
      continue
    }
    
    i++
  }
  
  return functions
}

export function insertDocstrings(
  code: string,
  language: 'python' | 'javascript',
  docstrings: Array<{ name: string; docstring: string }>
): string {
  const functions = language === 'python' 
    ? parsePythonCode(code) 
    : parseJavaScriptCode(code)
  
  const lines = code.split('\n')
  const docstringMap = new Map(docstrings.map(d => [d.name, d.docstring]))
  
  // Process in reverse order to maintain line numbers
  for (let i = functions.length - 1; i >= 0; i--) {
    const func = functions[i]
    const newDocstring = docstringMap.get(func.name)
    
    if (!newDocstring) continue
    
    const indent = ' '.repeat(lines[func.startLine].search(/\S/) + (language === 'python' ? 4 : 2))
    
    if (language === 'python') {
      const formattedDocstring = `${indent}"""\n${indent}${newDocstring.split('\n').join('\n' + indent)}\n${indent}"""`
      
      // Find where to insert (after function definition)
      let insertLine = func.startLine + 1
      
      // Check if there's already a docstring
      if (func.docstring) {
        // Find and replace existing docstring
        let j = insertLine
        let inDocstring = false
        while (j < lines.length) {
          if (lines[j].trim().startsWith('"""')) {
            if (inDocstring) {
              // End of docstring, remove up to here
              lines.splice(insertLine, j - insertLine + 1)
              break
            }
            inDocstring = true
          }
          j++
        }
      }
      
      lines.splice(insertLine, 0, formattedDocstring)
    } else {
      const formattedDocstring = `${indent}/**\n${indent} * ${newDocstring.split('\n').join('\n' + indent + ' * ')}\n${indent} */`
      
      // Check if there's already a JSDoc comment before the function
      let insertLine = func.startLine
      let hasExistingDoc = false
      
      for (let j = func.startLine - 1; j >= Math.max(0, func.startLine - 10); j--) {
        if (lines[j].trim().includes('*/')) {
          hasExistingDoc = true
          // Remove existing JSDoc
          let k = j
          while (k >= 0 && !lines[k].trim().includes('/**')) {
            k--
          }
          lines.splice(k, j - k + 1)
          insertLine = k
          break
        }
      }
      
      lines.splice(insertLine, 0, formattedDocstring)
    }
  }
  
  return lines.join('\n')
}
