import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FileCode2, Menu, X, LogOut, LogIn, Trash2, Eye, Download, Calendar, History as HistoryIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import AuthModal from './AuthModal'
import { getHistory, deleteHistoryItem } from '@/services/api'
import { DocgenHistory } from '@/types'
import CodeEditor from './CodeEditor'
import toast from 'react-hot-toast'

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [history, setHistory] = useState<DocgenHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DocgenHistory | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleSignInClick = () => {
    setShowAuthModal(true)
  }

  useEffect(() => {
    if (sidebarOpen && user) {
      loadHistory()
    }
  }, [sidebarOpen, user])

  const loadHistory = async () => {
    setLoading(true)
    try {
      if (user) {
        const data = await getHistory(user.id)
        setHistory(data)
      }
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      if (user) {
        await deleteHistoryItem(id)
      }
      setHistory((prev) => prev.filter((item) => item.id !== id))
      toast.success('History item deleted', {
        duration: 2000,
        style: {
          background: 'rgba(34, 197, 94, 0.1)',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        },
      })
    } catch (err) {
      console.error('Failed to delete item:', err)
      toast.error('Failed to delete item', {
        duration: 3000,
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        },
      })
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
    toast.success(`Downloaded ${item.filename}`, {
      duration: 2000,
      style: {
        background: 'rgba(34, 197, 94, 0.1)',
        backdropFilter: 'blur(10px)',
        color: '#fff',
        border: '1px solid rgba(34, 197, 94, 0.3)',
      },
    })
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="glass border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              {user && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg text-white hover:bg-white/10 transition-all"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <Link
                to="/"
                className="flex items-center px-2 py-2 text-white hover:text-gray-300 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all mr-3">
                  <FileCode2 className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg">AI Docstring Generator</span>
              </Link>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-sm text-gray-300">{user.email}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignInClick}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-96 glass border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center">
              <HistoryIcon className="h-5 w-5 mr-2" />
              History
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4 inline-block">
                  <HistoryIcon className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-300">No history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="glass glass-hover p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-white mb-2 truncate">{item.filename}</h3>
                    <div className="flex items-center text-xs text-gray-300 mb-3">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      <span className="ml-2 px-2 py-0.5 bg-white/10 border border-white/20 rounded text-xs">
                        {item.language}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(item)}
                        className="flex-1 p-2 text-blue-400 hover:bg-white/10 rounded-lg transition-colors text-xs flex items-center justify-center"
                        title="View"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-2 text-green-400 hover:bg-white/10 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* History Item Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{selectedItem.filename}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-300 hover:text-white transition-colors text-2xl font-light"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Before</h3>
                  <CodeEditor
                    value={selectedItem.content_before}
                    language={selectedItem.language as 'python' | 'javascript'}
                    readOnly
                    height="500px"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">After</h3>
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
