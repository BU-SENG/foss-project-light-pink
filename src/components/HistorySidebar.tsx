import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getHistory, deleteHistoryItem } from '@/services/api'
import { DocgenHistory } from '@/types'
import { Trash2, Clock, FileCode } from 'lucide-react'

interface HistorySidebarProps {
  onSelectHistory?: (item: DocgenHistory) => void
}

export default function HistorySidebar({ onSelectHistory }: HistorySidebarProps) {
  const { user } = useAuth()
  const [history, setHistory] = useState<DocgenHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [user])

  const loadHistory = async () => {
    setLoading(true)

    try {
      if (user) {
        const data = await getHistory(user.id)
        setHistory(data.slice(0, 10)) // Show last 10 items
      } else {
        // Load from localStorage
        const localHistory = JSON.parse(localStorage.getItem('docgen_history') || '[]')
        setHistory(localHistory.slice(0, 10))
      }
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Delete this item?')) return

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
      console.error('Failed to delete item:', err)
    }
  }

  if (!user && history.length === 0) {
    return (
      <div className="glass p-6 text-center">
        <Clock className="h-12 w-12 text-gray-500 mx-auto mb-3" />
        <p className="text-sm text-gray-400">No history yet</p>
        <p className="text-xs text-gray-500 mt-1">Sign in to save your work</p>
      </div>
    )
  }

  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent History
        </h3>
        <span className="text-xs text-gray-400">{history.length} items</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8">
          <FileCode className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No history yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectHistory?.(item)}
              className="group p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.filename}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-white/10 border border-white/20 rounded text-gray-300">
                      {item.language}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all"
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
  )
}
