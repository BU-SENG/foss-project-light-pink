import React from "react";
import { Editor } from "@monaco-editor/react";

// Supported languages
type SupportedLanguage = "python" | "javascript" | "typescript";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  language: SupportedLanguage;
  readOnly?: boolean;
  height?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  readOnly = false,
  height = "400px",
}) => {
  // Fallback textarea when Monaco fails
  const fallback = (
    <textarea
      className="w-full h-full bg-gray-900 text-gray-200 p-4 rounded-lg border border-gray-700"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
    />
  );

  const handleChange: (val: string | undefined) => void = (val) => {
    onChange?.(val);
  };

  // Validate language
  const safeLanguage: SupportedLanguage = [
    "python",
    "javascript",
    "typescript",
  ].includes(language)
    ? language
    : "javascript";

  // Tab size rule
  const tabSize: number = safeLanguage === "python" ? 4 : 2;

  return (
    <div
      className="w-full border border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm bg-gray-900/50 shadow-lg"
      style={{ height }}
      aria-label="Code editor"
    >
      <Editor
        height="100%"
        language={safeLanguage}
        value={value}
        onChange={handleChange}
        theme="vs-dark"
        loading={<div className="flex items-center justify-center h-full text-gray-400">Loading editor...</div>}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize,
        }}
        onMount={(editor) => {
          editor.focus();
        }}
        fallback={fallback}
      />
    </div>
  );
};

export default React.memo(CodeEditor);
