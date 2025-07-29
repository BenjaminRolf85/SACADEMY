import { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  MessageSquare, 
  User, 
  LogOut,
  Menu,
  X,
  Users,
  Shield
} from 'lucide-react'
import { useState } from 'react'
import Logo from './Logo'

interface LayoutProps {
  children: ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: user?.role === 'trainer' ? 'Trainer Dashboard' : 'Dashboard', page: 'dashboard', icon: Home },
    { name: 'Gruppenchat', page: 'groups', icon: Users },
    { name: 'Nachrichten', page: 'messages', icon: MessageSquare },
    { name: 'Profil', page: 'profile', icon: User },
  ]

  // Only add Bewertungen for non-trainer users
  if (user?.role !== 'trainer') {
    navigation.splice(2, 0, { name: 'Umfragen', page: 'surveys', icon: MessageSquare })
  }

  if (user?.role === 'admin') {
    navigation.unshift({ name: 'Admin Dashboard', page: 'admin', icon: Shield })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white shadow">
          <Logo size="sm" />
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-brand-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b lg:justify-center">
          <Logo size="sm" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-neutral-500 hover:text-neutral-600 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  onPageChange(item.page)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === item.page
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-800'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                user?.role === 'admin' ? 'bg-primary-700' : 
                user?.role === 'trainer' ? 'bg-secondary-600' : 
                'bg-primary-600'
              }`}>
                {user?.name.charAt(0)}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-700">{user?.name}</p>
              <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Abmelden
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}