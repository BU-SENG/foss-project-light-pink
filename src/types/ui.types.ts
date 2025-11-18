/**
 * UI component prop types and enums for the application.
 * Used for type-safe props and UI state management.
 */
import { SupportedLanguage } from './code.types';
import { ReactNode } from 'react';

/**
 * Toast notification types.
 */
export enum ToastType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

/**
 * Toast notification interface.
 */
export interface Toast {
  /** Unique toast ID */
  id: string;
  /** Toast type */
  type: ToastType;
  /** Toast message */
  message: string;
  /** Duration in ms (optional, default 3000) */
  duration?: number;
}

/**
 * Loading state for UI components.
 */
export interface LoadingState {
  /** Is loading? */
  isLoading: boolean;
  /** Loading message (optional) */
  message?: string;
}

/**
 * Modal component props.
 */
export interface ModalProps {
  /** Is modal open? */
  isOpen: boolean;
  /** Function to close modal */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal content */
  children: ReactNode;
}

/**
 * File upload component props.
 */
export interface FileUploadProps {
  /** Function called when file is selected */
  onFileSelect: (file: File) => void;
  /** Accepted file formats */
  acceptedFormats: string[];
  /** Maximum file size in bytes (optional) */
  maxSize?: number;
}

/**
 * Code editor component props.
 */
export interface CodeEditorProps {
  /** Code content */
  code: string;
  /** Programming language */
  language: SupportedLanguage;
  /** Function called on code change */
  onChange: (code: string) => void;
  /** Is editor read-only? (optional, default false) */
  readOnly?: boolean;
  /** Editor height (optional, default 400px) */
  height?: string;
}
