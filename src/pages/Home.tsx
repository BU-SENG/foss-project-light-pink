import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import FileUpload from '@/components/FileUpload'
import CodeEditor from '@/components/CodeEditor'
import FunctionList from '@/components/FunctionList'
import AuthModal from '@/components/AuthModal'
import { parsePythonCode, parseJavaScriptCode, insertDocstrings } from '@/utils/codeParser'
import { generateDocstrings, saveToHistory } from '@/services/api'
import { FunctionMetadata, Language, DocstringFormat } from '@/types'
import { Download, Sparkles, AlertCircle, CheckCircle, Info, X } from 'lucide-react'

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [docFormat, setDocFormat] = useState<DocstringFormat>('google')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [useOfflineMode, setUseOfflineMode] = useState(false)

  const handleCancelFile = () => {
    setFile(null)
    setCode('')
    setModifiedCode('')
    setError(null)
    setSuccessMessage(null)
    setInfoMessage(null)
    setGeneratedDocstrings(new Map())
    setFunctions([])
  }

  const handleFileSelect = (selectedFile: File, content: string) => {
    setFile(selectedFile)
    setCode(content)
    setModifiedCode('')
    setError(null)
    setSuccessMessage(null)
    setInfoMessage(null)
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
    setSuccessMessage(null)
    setInfoMessage(null)

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

      setSuccessMessage(`Successfully generated ${response.docstrings.length} docstring${response.docstrings.length > 1 ? 's' : ''}!`)

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
          setInfoMessage('Saved to your history')
        } catch (err) {
          console.error('Failed to save history:', err)
          // Don't show error for history save failure
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate docstrings'
      setError(errorMsg)
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
        <h1 className="text-4xl font-bold text-white mb-4">AI Docstring Generator</h1>
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

      {successMessage && (
        <div className="card border-green-500/50 bg-green-500/10">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
              <p className="text-green-300">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {infoMessage && (
        <div className="card border-blue-500/50 bg-blue-500/10">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
              <p className="text-blue-300">{infoMessage}</p>
            </div>
            <button
              onClick={() => setInfoMessage(null)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="card border-red-500/50 bg-red-500/10">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
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
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-white">{file?.name || 'Code Editor'}</h2>
                    <button
                      onClick={handleCancelFile}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Remove file and start over"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <select
                        value={docFormat}
                        onChange={(e) => setDocFormat(e.target.value as DocstringFormat)}
                        className="appearance-none px-4 py-2.5 pr-10 border border-white/20 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white text-sm hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                        style={{
                          backgroundImage: 'none'
                        }}
                      >
                        <option value="google" className="bg-gray-900 text-white">Google Style</option>
                        <option value="numpy" className="bg-gray-900 text-white">NumPy Style</option>
                        <option value="sphinx" className="bg-gray-900 text-white">Sphinx Style</option>
                        {language === 'javascript' && <option value="jsdoc" className="bg-gray-900 text-white">JSDoc</option>}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white opacity-70">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
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
