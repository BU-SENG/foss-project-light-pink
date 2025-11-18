/**
 * Supabase database schema types for generation history and user preferences.
 * Used for type-safe database operations.
 */
import { SupportedLanguage, DocstringStyle } from './code.types';

/**
 * Represents a single docstring generation history record.
 */
export interface GenerationHistory {
  /** Unique record ID */
  id: string;
  /** User ID */
  user_id: string;
  /** Name of the file */
  file_name: string;
  /** Programming language */
  language: SupportedLanguage;
  /** Name of the function */
  function_name: string;
  /** Original code for the function */
  original_code: string;
  /** Generated docstring */
  generated_docstring: string;
  /** Docstring style used */
  docstring_style: DocstringStyle;
  /** Number of tokens used */
  tokens_used: number;
  /** Creation timestamp */
  created_at: string;
}

/**
 * User preferences for docstring generation.
 */
export interface UserPreferences {
  /** Unique preference ID */
  id: string;
  /** User ID */
  user_id: string;
  /** Default docstring style */
  default_style: DocstringStyle;
  /** Default: include type annotations */
  default_include_types: boolean;
  /** Default: include example usage */
  default_include_examples: boolean;
  /** Default: include raised exceptions */
  default_include_raises: boolean;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Supabase public schema database interface.
 */
export interface Database {
  public: {
    Tables: {
      generation_history: {
        Row: GenerationHistory;
      };
      user_preferences: {
        Row: UserPreferences;
      };
    };
  };
}
