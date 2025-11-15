import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FileCode2, History, LogOut, LogIn } from 'lucide-react'

export default function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                to="/"
                className="flex items-center px-2 py-2 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <FileCode2 className="h-6 w-6 mr-2" />
                <span className="font-bold text-xl">AI Docstring Generator</span>
              </Link>
              <div className="ml-6 flex space-x-4 items-center">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Home
                </Link>
                {user && (
                  <Link
                    to="/history"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
