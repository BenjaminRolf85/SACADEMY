import { useState, useCallback } from 'react'
import { User, LoginForm } from '../types'
import { localStorage as customLocalStorage } from '../lib/localStorage'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(customLocalStorage.getCurrentUser())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (formData: LoginForm) => {
    setLoading(true)
    setError(null)
    
    try {
      const foundUser = await customLocalStorage.login(formData.email, formData.password)
      if (!foundUser) {
        throw new Error('Ungültige E-Mail oder Passwort')
      }
      
      setUser(foundUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, userData: { fullName: string; company?: string; position?: string }) => {
    setLoading(true)
    setError(null)
    
    try {
      const newUser = await customLocalStorage.register(email, userData)
      setUser(newUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setUser(null)
      await customLocalStorage.logout()
      window.location.href = '/login'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Abmelden')
    }
  }, [])

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const updatedUser = await customLocalStorage.updateUser(user.id, updates)
      setUser(updatedUser)
      return updatedUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Profils')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile
  }
}