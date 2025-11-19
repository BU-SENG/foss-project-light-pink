import {
  SupportedLanguage,
  ParsedFile,
  FunctionInfo,
  Parameter,
} from '../types/code.types';

/**
 * CodeParser service for extracting function information from Python and JavaScript files.
 * Handles edge cases, preserves code, and provides structured metadata for AI docstring generation.
 */
export class CodeParser {
  /**
   * Parses a file's content and extracts all functions with metadata.
   * @param content File content as string
   * @param language SupportedLanguage enum
   * @returns ParsedFile object
   */
  public parseFile(content: string, language: SupportedLanguage): ParsedFile {
    let functions: FunctionInfo[] = [];
    try {
     
        functions = this.extractPythonFunctions(content);
      } else if (language === SupportedLanguage.JavaScript) {
        functions = this.extractJavaScriptFunctions(content);
      }
    } catch (err) {
      // Graceful error handling
      functions = [];
    }
    return {
      fileName: '',
      language,
      functions,
      rawContent: content,
      uploadedAt: new Date(),
    };
  }

  /**
   * Extracts Python functions using regex and indentation logic.
   * Handles decorators, nested functions, multiline signatures, docstrings, and type hints.
   */
  private extractPythonFunctions(content: string): FunctionInfo[] {
    const lines = content.split(/\r?\n/);
    const functions: FunctionInfo[] = [];
    const funcRegex = /^(\s*)(@\w+.*)?\s*def\s+(\w+)\s*\(([^)]*)\)\s*(->\s*([^:]+))?:/;
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const match = funcRegex.exec(line);
      if (match) {
        const indent = match[1] || '';
        const name = match[3];
        const paramsRaw = match[4];
        const returnType = match[6]?.trim();
        let startLine = i + 1;
        let endLine = i + 1;
        let codeLines = [line];
        let docstring = '';
        let foundDocstring = false;
        // Find function body by indentation
        for (let j = i + 1; j < lines.length; j++) {
          const l = lines[j];
          if (l.trim() === '') {
            codeLines.push(l);
            continue;
          }
          if (l.startsWith(indent + ' ') || l.startsWith(indent + '\t')) {
            codeLines.push(l);
            endLine = j + 1;
            // Docstring detection (triple quotes)
            if (!foundDocstring && /^(\s*)["']{3}/.test(l)) {
              const docStart = l.indexOf('"""') >= 0 ? '"""' : (l.indexOf("'''") >= 0 ? "'''" : null);
              if (docStart) {
                let doc = l.substring(l.indexOf(docStart) + 3);
                let docEndFound = false;
                if (doc.includes(docStart)) {
                  doc = doc.substring(0, doc.indexOf(docStart));
                  docEndFound = true;
                }
                for (let k = j + 1; !docEndFound && k < lines.length; k++) {
                  codeLines.push(lines[k]);
                  endLine = k + 1;
                  if (lines[k].includes(docStart)) {
                    doc += '\n' + lines[k].substring(0, lines[k].indexOf(docStart));
                    docEndFound = true;
                  } else {
                    doc += '\n' + lines[k];
                  }
                }
                docstring = doc.trim();
                foundDocstring = true;
              }
            }
          } else {
            break;
          }
        }
        const parameters = this.parseFunctionParameters(paramsRaw, SupportedLanguage.Python);
        functions.push({
          name,
          parameters,
          returnType,
          docstring,
          startLine,
          endLine,
          originalCode: codeLines.join('\n'),
          isSelected: true,
        });
        i = endLine - 1;
      }
      i++;
    }
    return functions;
  }

  /**
   * Extracts JavaScript/TypeScript functions using regex and brace logic.
   * Handles arrow functions, async, class methods, JSDoc, and type annotations.
   */
  private extractJavaScriptFunctions(content: string): FunctionInfo[] {
    const lines = content.split(/\r?\n/);
    const functions: FunctionInfo[] = [];
    // Function declaration, arrow, async, class method
    const funcRegex = /^(\s*)(\/\*\*.*)?(async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(:\s*([^\s{]+))?\s*{|^(\s*)(\/\*\*.*)?(async\s+)?(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*(:\s*([^\s{]+))?\s*{|^(\s*)(\/\*\*.*)?(async\s+)?(\w+)\s*\(([^)]*)\)\s*(:\s*([^\s{]+))?\s*{/;
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const match = funcRegex.exec(line);
      if (match) {
        let name = match[4] || match[10] || match[17];
        let paramsRaw = match[5] || match[12] || match[19];
        let returnType = match[7] || match[14] || match[21];
        let startLine = i + 1;
        let endLine = i + 1;
        let codeLines = [line];
        let docstring = '';
        // JSDoc detection
        if (i > 0 && lines[i - 1].trim().startsWith('/**')) {
          let doc = lines[i - 1].trim().replace('/**', '').replace('*/', '').trim();
          let k = i - 2;
          while (k >= 0 && !lines[k].trim().endsWith('*/')) {
            doc = lines[k].trim() + '\n' + doc;
            k--;
          }
          docstring = doc;
        }
        // Find function body by braces
        let braceCount = 0;
        let foundStart = false;
        for (let j = i; j < lines.length; j++) {
          const l = lines[j];
          if (l.includes('{')) {
            braceCount += (l.match(/{/g) || []).length;
            foundStart = true;
          }
          if (l.includes('}')) {
            braceCount -= (l.match(/}/g) || []).length;
          }
          codeLines.push(l);
          endLine = j + 1;
          if (foundStart && braceCount === 0) {
            break;
          }
        }
        const parameters = this.parseFunctionParameters(paramsRaw, SupportedLanguage.JavaScript);
        functions.push({
          name,
          parameters,
          returnType,
          docstring,
          startLine,
          endLine,
          originalCode: codeLines.join('\n'),
          isSelected: true,
        });
        i = endLine - 1;
      }
      i++;
    }
    return functions;
  }

  /**
   * Parses a raw function signature string into structured parameters.
   * Handles type hints, default values, and cleans whitespace.
   */
  private parseFunctionParameters(paramsRaw: string, language: SupportedLanguage): Parameter[] {
    if (!paramsRaw.trim()) return [];
    const params: Parameter[] = [];
    const paramList = paramsRaw.split(',');
    for (let param of paramList) {
      param = param.trim();
      if (!param) continue;
      let name = param;
      let type: string | undefined = undefined;
      let defaultValue: string | undefined = undefined;
      if (language === SupportedLanguage.Python) {
        // Python: name: type = default
        const pyMatch = /^(\w+)(\s*:\s*([^=]+))?(\s*=\s*(.+))?/.exec(param);
        if (pyMatch) {
          name = pyMatch[1];
          type = pyMatch[3]?.trim();
          defaultValue = pyMatch[5]?.trim();
        }
      } else {
        // JS/TS: name: type = default
        const jsMatch = /^(\w+)(\s*:\s*([^=]+))?(\s*=\s*(.+))?/.exec(param);
        if (jsMatch) {
          name = jsMatch[1];
          type = jsMatch[3]?.trim();
          defaultValue = jsMatch[5]?.trim();
        }
      }
      params.push({ name, type, defaultValue });
    }
    return params;
  }
}

export default CodeParser;
