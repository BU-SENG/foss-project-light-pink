import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FileCode2, History, LogOut, LogIn } from 'lucide-react'
import { useState } from 'react'
import AuthModal from './AuthModal'

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignInClick = () => {
    setShowAuthModal(true)
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="glass border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center px-2 py-2 text-white hover:text-gray-300 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all mr-3">
                  <FileCode2 className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg">AI Docstring Generator</span>
              </Link>
              <div className="ml-8 flex space-x-2 items-center">
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  Home
                </Link>
                {user && (
                  <Link
                    to="/history"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center"
                  >
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Link>
                )}
              </div>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
