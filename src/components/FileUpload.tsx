import React, { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { SupportedLanguage, FileUploadProps as BaseFileUploadProps } from '@/types';
import detectLanguage from '@/utils/detectLanguage';

type FileUploadProps = Omit<BaseFileUploadProps, 'onFileSelect'> & {
  onFileSelect: (file: File, content: string, language: SupportedLanguage) => void;
  acceptedFormats?: string[];
  maxSize?: number;
  disabled?: boolean;
};

const DEFAULT_FORMATS = ['py', 'js', 'ts'];
const DEFAULT_MAX = 5 * 1024 * 1024; // 5MB

const humanFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedFormats = DEFAULT_FORMATS,
  maxSize = DEFAULT_MAX,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const resetError = () => setError(null);

  const validateAndRead = (file: File) => {
    resetError();
    if (!file) return;
    const lower = file.name.toLowerCase();
    const ext = lower.split('.').pop() || '';
    if (!acceptedFormats.map((f) => f.toLowerCase()).includes(ext)) {
      setError(`Unsupported file type: .${ext}. Supported: ${acceptedFormats.join(', ')}`);
      return;
    }
    if (file.size > maxSize) {
      setError(`File too large: ${humanFileSize(file.size)} (limit ${humanFileSize(maxSize)})`);
      return;
    }
    // Some browsers don't set file.type for .py - allow by extension
    if (file.type && !file.type.startsWith('text') && !['.py', '.js', '.ts'].some((s) => lower.endsWith(s))) {
      setError('File does not appear to be a text file');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? '');
      const language = detectLanguage(file.name);
      setFileName(file.name);
      setFileSize(file.size);
      try {
        onFileSelect(file, content, language);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to process file');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setLoading(false);
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndRead(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndRead(file);
    // reset input so same file can be selected again
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div
        aria-disabled={disabled}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => { if (!disabled) { setIsDragging(true); resetError(); } }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative min-h-[200px] flex items-center justify-center transition-all rounded-md p-6 border-2 border-dashed ${isDragging ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200'} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => { if (!disabled) inputRef.current?.click(); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedFormats.map((f) => `.${f}`).join(',')}
          onChange={handleChange}
          aria-hidden={disabled}
          disabled={disabled}
        />

        <div className="flex flex-col items-center text-center">
          <UploadCloud className="w-12 h-12 text-indigo-600 mb-3" />
          <div className="text-lg font-medium">Drag & drop a file here or click to browse</div>
          <div className="text-sm text-gray-500 mt-1">Supported: {acceptedFormats.join(', ')} • Max {humanFileSize(maxSize)}</div>
          {fileName && (
            <div className="mt-3 flex items-center space-x-3 text-sm text-gray-700">
              <div className="font-medium">{fileName}</div>
              <div className="text-gray-400">{fileSize ? humanFileSize(fileSize) : ''}</div>
              <button
                aria-label="Clear file"
                onClick={(e) => { e.stopPropagation(); setFileName(null); setFileSize(null); setError(null); }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}
      </div>

      {error && <div role="alert" className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default FileUpload;
