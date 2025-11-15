import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import FileUpload from '@/components/FileUpload'
import CodeEditor from '@/components/CodeEditor'
import FunctionList from '@/components/FunctionList'
import AuthModal from '@/components/AuthModal'
import { parsePythonCode, parseJavaScriptCode, insertDocstrings } from '@/utils/codeParser'
import { generateDocstrings, saveToHistory } from '@/services/api'
import { FunctionMetadata, Language, DocstringFormat } from '@/types'
import { Download, Sparkles, AlertCircle } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState<Language>('python')
  const [functions, setFunctions] = useState<FunctionMetadata[]>([])
  const [generatedDocstrings, setGeneratedDocstrings] = useState<Map<string, string>>(new Map())
  const [modifiedCode, setModifiedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [docFormat, setDocFormat] = useState<DocstringFormat>('google')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [useOfflineMode, setUseOfflineMode] = useState(false)

  const handleFileSelect = (selectedFile: File, content: string) => {
    setFile(selectedFile)
    setCode(content)
    setModifiedCode('')
    setError(null)
    setGeneratedDocstrings(new Map())

    // Detect language from file extension
    const ext = selectedFile.name.split('.').pop()?.toLowerCase()
    const detectedLanguage: Language =
      ext === 'py' ? 'python' : ext === 'js' || ext === 'ts' ? 'javascript' : 'python'
    setLanguage(detectedLanguage)

    // Parse functions
    const parsedFunctions =
      detectedLanguage === 'python' ? parsePythonCode(content) : parseJavaScriptCode(content)
    setFunctions(parsedFunctions)
  }

  const handleGenerateDocstrings = async () => {
    if (functions.length === 0) {
      setError('No functions detected in the file.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await generateDocstrings({
        language,
        functions: functions.map((f) => ({
          name: f.name,
          params: f.params,
          body: f.body,
          type: f.type,
        })),
        format: docFormat,
      })

      const docstringMap = new Map(response.docstrings.map((d) => [d.name, d.docstring]))
      setGeneratedDocstrings(docstringMap)

      // Insert docstrings into code
      const updated = insertDocstrings(code, language, response.docstrings)
      setModifiedCode(updated)

      // Save to history if user is logged in
      if (user && !useOfflineMode) {
        try {
          await saveToHistory({
            user_id: user.id,
            filename: file?.name || 'untitled',
            language,
            content_before: code,
            content_after: updated,
          })
        } catch (err) {
          console.error('Failed to save history:', err)
          // Don't fail the whole operation if history save fails
        }
      } else if (!user && !useOfflineMode) {
        // Store in localStorage
        const history = JSON.parse(localStorage.getItem('docgen_history') || '[]')
        history.unshift({
          id: Date.now().toString(),
          filename: file?.name || 'untitled',
          language,
          content_before: code,
          content_after: updated,
          created_at: new Date().toISOString(),
        })
        localStorage.setItem('docgen_history', JSON.stringify(history.slice(0, 50))) // Keep last 50
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate docstrings')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!modifiedCode) return

    const blob = new Blob([modifiedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file?.name || 'code_with_docstrings.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          AI Docstring Generator
        </h1>
        <p className="text-lg text-gray-300">
          Automatically generate professional docstrings for your Python and JavaScript code using
          Gemini 2.0 Pro
        </p>
      </div>

      {!user && (
        <div className="card border-white/20">
          <p className="text-gray-300 text-center">
            <button
              onClick={() => setShowAuthModal(true)}
              className="font-semibold underline hover:text-white"
            >
              Sign in
            </button>{' '}
            to save your generation history, or continue in offline mode.
          </p>
        </div>
      )}

      {error && (
        <div className="card border-red-500/50 bg-red-500/10">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {!code ? (
            <FileUpload onFileSelect={handleFileSelect} />
          ) : (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {file?.name || 'Code Editor'}
                  </h2>
                  <div className="flex items-center space-x-4">
                    <select
                      value={docFormat}
                      onChange={(e) => setDocFormat(e.target.value as DocstringFormat)}
                      className="px-3 py-2 border border-white/20 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white text-sm backdrop-blur-xl"
                    >
                      <option value="google">Google Style</option>
                      <option value="numpy">NumPy Style</option>
                      <option value="sphinx">Sphinx Style</option>
                      {language === 'javascript' && <option value="jsdoc">JSDoc</option>}
                    </select>
                    <button
                      onClick={handleGenerateDocstrings}
                      disabled={loading || functions.length === 0}
                      className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {loading ? 'Generating...' : 'Generate Docstrings'}
                    </button>
                  </div>
                </div>
                <CodeEditor
                  value={modifiedCode || code}
                  onChange={(value) => !modifiedCode && setCode(value || '')}
                  language={language === 'python' ? 'python' : 'javascript'}
                  readOnly={!!modifiedCode}
                />
              </div>

              {modifiedCode && (
                <div className="flex justify-end">
                  <button onClick={handleDownload} className="btn-primary flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          <FunctionList functions={functions} generatedDocstrings={generatedDocstrings} />
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
