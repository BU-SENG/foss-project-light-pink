/**
 * API request and response types for docstring generation and code parsing.
 * Ensures type safety for all API interactions.
 */
import { SupportedLanguage, GenerationOptions, FunctionInfo } from './code.types';

/**
 * Request payload for generating a docstring.
 */
export interface GenerateDocstringRequest {
  /** Source code to analyze */
  code: string;
  /** Programming language */
  language: SupportedLanguage;
  /** Name of the function to generate docstring for */
  functionName: string;
  /** Docstring generation options */
  options: GenerationOptions;
}

/**
 * Response payload for docstring generation.
 */
export interface GenerateDocstringResponse {
  /** Whether the generation was successful */
  success: boolean;
  /** Generated docstring (optional) */
  docstring?: string;
  /** Error message (optional) */
  error?: string;
  /** Number of tokens used (optional) */
  tokensUsed?: number;
}

/**
 * Request payload for parsing a code file.
 */
export interface ParseFileRequest {
  /** File content as string */
  fileContent: string;
  /** File name */
  fileName: string;
  /** Programming language */
  language: SupportedLanguage;
}

/**
 * Response payload for code file parsing.
 */
export interface ParseFileResponse {
  /** Whether parsing was successful */
  success: boolean;
  /** List of parsed functions (optional) */
  functions?: FunctionInfo[];
  /** Error message (optional) */
  error?: string;
}

/**
 * Standard API error structure.
 */
export interface APIError {
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** HTTP status code */
  statusCode: number;
}
