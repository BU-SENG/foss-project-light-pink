import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange?: (value: string | undefined) => void
  language: 'python' | 'javascript' | 'typescript'
  readOnly?: boolean
  height?: string
}

export default function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = '500px',
}: CodeEditorProps) {
  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: language === 'python' ? 4 : 2,
        }}
      />
    </div>
  )
}
