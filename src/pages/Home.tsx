import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import FileUpload from '@/components/FileUpload'
import CodeEditor from '@/components/CodeEditor'
import FunctionList from '@/components/FunctionList'
import AuthModal from '@/components/AuthModal'
import HistorySidebar from '@/components/HistorySidebar'
import { parsePythonCode, parseJavaScriptCode, insertDocstrings } from '@/utils/codeParser'
import { generateDocstrings, saveToHistory } from '@/services/api'
import { FunctionMetadata, Language, DocstringFormat, DocgenHistory } from '@/types'
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
        <h1 className="text-4xl font-bold text-white mb-4">AI Docstring Generator</h1>
        <p className="text-lg text-gray-300">
          Automatically generate professional docstrings for your Python and JavaScript code using
          Gemini 2.0 Pro
        </p>
      </div>

      {user ? (
        <div className="glass border-green-500/30 bg-green-500/10">
          <p className="text-green-300 text-center">
            ✓ Signed in as <span className="font-semibold">{user.email}</span>. Your generation
            history will be saved automatically.
          </p>
        </div>
      ) : (
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
              {functions.length === 0 && (
                <div className="card border-yellow-500/50 bg-yellow-500/10">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-yellow-300 font-semibold mb-1">
                        No functions or classes detected
                      </p>
                      <p className="text-yellow-200 text-sm">
                        Make sure your file contains function definitions or class declarations. For
                        Python, use <code className="bg-black/30 px-1 rounded">def</code> or{' '}
                        <code className="bg-black/30 px-1 rounded">class</code>. For JavaScript, use{' '}
                        <code className="bg-black/30 px-1 rounded">function</code>,{' '}
                        <code className="bg-black/30 px-1 rounded">const</code>, or{' '}
                        <code className="bg-black/30 px-1 rounded">class</code>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-white">{file?.name || 'Code Editor'}</h2>
                    <button
                      onClick={() => {
                        setFile(null)
                        setCode('')
                        setModifiedCode('')
                        setFunctions([])
                        setGeneratedDocstrings(new Map())
                        setError(null)
                      }}
                      className="text-sm text-gray-400 hover:text-white hover:underline transition-colors"
                      title="Remove file and upload another"
                    >
                      ✕ Remove
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={docFormat}
                      onChange={(e) => setDocFormat(e.target.value as DocstringFormat)}
                      className="px-4 py-2 border border-white/20 bg-black/50 backdrop-blur-xl rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 text-white text-sm hover:bg-white/5 transition-all cursor-pointer appearance-none pr-10"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '16px',
                      }}
                    >
                      <option value="google" className="bg-black text-white">
                        Google Style
                      </option>
                      <option value="numpy" className="bg-black text-white">
                        NumPy Style
                      </option>
                      <option value="sphinx" className="bg-black text-white">
                        Sphinx Style
                      </option>
                      {language === 'javascript' && (
                        <option value="jsdoc" className="bg-black text-white">
                          JSDoc
                        </option>
                      )}
                    </select>
                    <button
                      onClick={handleGenerateDocstrings}
                      disabled={loading || functions.length === 0}
                      className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        functions.length === 0
                          ? 'No functions detected in the uploaded file'
                          : 'Generate docstrings with AI'
                      }
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {loading
                        ? 'Generating...'
                        : functions.length === 0
                        ? 'No Functions Found'
                        : 'Generate Docstrings'}
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
          <HistorySidebar
            onSelectHistory={(item: DocgenHistory) => {
              // Load history item into editor
              setFile(new File([item.content_before], item.filename))
              setCode(item.content_before)
              setModifiedCode(item.content_after)
              setLanguage(item.language as Language)
              
              // Parse functions from the loaded code
              const parsedFunctions =
                item.language === 'python'
                  ? parsePythonCode(item.content_before)
                  : parseJavaScriptCode(item.content_before)
              setFunctions(parsedFunctions)
            }}
          />
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
