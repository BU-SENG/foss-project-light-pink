import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getHistory, deleteHistoryItem } from '@/services/api'
import { DocgenHistory } from '@/types'
import { Trash2, Eye, Download, Calendar } from 'lucide-react'
import CodeEditor from '@/components/CodeEditor'

export default function History() {
  const { user } = useAuth()
  const [history, setHistory] = useState<DocgenHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<DocgenHistory | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [user])

  const loadHistory = async () => {
    setLoading(true)
    setError(null)

    try {
      if (user) {
        const data = await getHistory(user.id)
        setHistory(data)
      } else {
        // Load from localStorage
        const localHistory = JSON.parse(localStorage.getItem('docgen_history') || '[]')
        setHistory(localHistory)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      if (user) {
        await deleteHistoryItem(id)
      } else {
        const localHistory = JSON.parse(localStorage.getItem('docgen_history') || '[]')
        const filtered = localHistory.filter((item: DocgenHistory) => item.id !== id)
        localStorage.setItem('docgen_history', JSON.stringify(filtered))
      }
      setHistory((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }

  const handleView = (item: DocgenHistory) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleDownload = (item: DocgenHistory) => {
    const blob = new Blob([item.content_after], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = item.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!user) {
    return (
      <div className="card text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Sign In Required
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please sign in to view your generation history.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
        <p className="text-red-800 dark:text-red-200 text-center">{error}</p>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="card text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No History Yet</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your generation history will appear here after you generate docstrings.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Generation History</h1>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {history.length} {history.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="grid gap-4">
        {history.map((item) => (
          <div key={item.id} className="card hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.filename}
                </h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                    {item.language}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleView(item)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  title="View"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDownload(item)}
                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedItem.filename}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Before
                  </h3>
                  <CodeEditor
                    value={selectedItem.content_before}
                    language={selectedItem.language as 'python' | 'javascript'}
                    readOnly
                    height="500px"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    After
                  </h3>
                  <CodeEditor
                    value={selectedItem.content_after}
                    language={selectedItem.language as 'python' | 'javascript'}
                    readOnly
                    height="500px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
