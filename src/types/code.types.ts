/**
 * Types and interfaces for code parsing and extraction.
 * Used for handling uploaded files, extracting functions, and managing code metadata.
 */

/**
 * Supported programming languages for code parsing.
 */
export enum SupportedLanguage {
  Python = 'python',
  JavaScript = 'javascript',
}

/**
 * Supported docstring/comment styles for generation.
 * Workaround for enum restriction: use a const object and type union.
 */
export const DocstringStyle = {
  Google: 'google',
  NumPy: 'numpy',
  Sphinx: 'sphinx',
  JSDoc: 'jsdoc',
} as const;
/**
 * DocstringStyle type union for allowed values.
 */
export type DocstringStyle = typeof DocstringStyle[keyof typeof DocstringStyle];

/**
 * Metadata for an uploaded code file.
 */
export interface CodeFile {
  /** Unique identifier for the file */
  id: string;
  /** Original filename */
  name: string;
  /** File content as string */
  content: string;
  /** Programming language of the file */
  language: SupportedLanguage;
  /** Upload timestamp */
  uploadedAt: Date;
}

/**
 * Represents a parameter in a function signature.
 */
export interface Parameter {
  /** Parameter name */
  name: string;
  /** Parameter type (optional) */
  type?: string;
  /** Default value (optional) */
  defaultValue?: string;
}

/**
 * Represents a function extracted from a code file.
 */
export interface ExtractedFunction {
  /** Name of the function */
  name: string;
  /** Start line number in the file */
  startLine: number;
  /** End line number in the file */
  endLine: number;
  /** Function code as string */
  code: string;
  /** Programming language */
  language: SupportedLanguage;
  /** Parent file ID */
  fileId: string;
}

/**
 * Detailed information about a function in a code file.
 */
export interface FunctionInfo {
  /** Function name */
  name: string;
  /** List of parameters */
  parameters: Parameter[];
  /** Return type (optional) */
  returnType?: string;
  /** Existing docstring (optional) */
  docstring?: string;
  /** Start line number */
  startLine: number;
  /** End line number */
  endLine: number;
  /** Original code for the function */
  originalCode: string;
  /** Generated docstring (optional) */
  generatedDocstring?: string;
  /** Whether the function is selected for docstring generation (default true) */
  isSelected: boolean;
}

/**
 * Options for docstring generation.
 */
export interface GenerationOptions {
  /** Docstring style to use */
  style: DocstringStyle;
  /** Include type annotations */
  includeTypes: boolean;
  /** Include example usage */
  includeExamples: boolean;
  /** Include raised exceptions */
  includeRaises: boolean;
}

/**
 * Represents a parsed code file and its extracted functions.
 */
export interface ParsedFile {
  /** File name */
  fileName: string;
  /** Programming language */
  language: SupportedLanguage;
  /** List of functions in the file */
  functions: FunctionInfo[];
  /** Raw file content */
  rawContent: string;
  /** Upload timestamp */
  uploadedAt: Date;
}

/**
 * Result of code parsing and function extraction.
 */
export interface CodeParseResult {
  /** The parsed file metadata */
  file: CodeFile;
  /** List of extracted functions */
  functions: ExtractedFunction[];
}
