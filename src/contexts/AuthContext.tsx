import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { User } from '../types'
import { localStorage as customLocalStorage } from '../lib/localStorage'

interface AuthContextType {
  user: User | null
  loading: boolean // Keep loading as it's used
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (email: string, userData: { name: string; role: 'user' | 'trainer'; company?: string; position?: string }) => Promise<void> // Removed password from register
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<User>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing user in localStorage
    const currentUser = customLocalStorage.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    const loggedInUser = await customLocalStorage.login(credentials.email, credentials.password)
    if (!loggedInUser) {
      throw new Error('Invalid login credentials')
    }
    setUser(loggedInUser)
  }

  const register = async (email: string, userData: { name: string; role: 'user' | 'trainer'; company?: string; position?: string }) => {
    const registeredUser = await customLocalStorage.register(email, {
      fullName: userData.name,
      company: userData.company,
      position: userData.position,
      role: userData.role
    })
    setUser(registeredUser)
  }

  const logout = async () => {
    await customLocalStorage.logout()
    setUser(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in')
    const updatedUser = await customLocalStorage.updateUser(user.id, updates)
    setUser(updatedUser)
    return updatedUser
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}