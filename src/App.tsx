import { useEffect } from 'react'
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/auth/Login'
import Layout from './components/Layout'
import Dashboard from './components/pages/Dashboard'
import Groups from './components/pages/Groups'
import Messages from './components/pages/Messages'
import Profile from './components/pages/Profile'
import QuizzesPage from './components/pages/QuizzesPage'
import SurveysPage from './components/pages/SurveysPage'
import AdminDashboard from './components/admin/AdminDashboard'
import TrainerDashboard from './components/trainer/TrainerDashboard'

function AppRoutes() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState(
    user?.role === 'admin' ? 'admin' : 'dashboard'
  )

  // Set default page based on user role - moved before conditional returns
  useEffect(() => {
    if (user) {
      setCurrentPage(user.role === 'admin' ? 'admin' : 'dashboard')
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Sales Academy wird geladen...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return user?.role === 'admin' ? <AdminDashboard /> : 
               user?.role === 'trainer' ? <TrainerDashboard /> : <Dashboard />
      case 'groups':
        return <Groups />
      case 'surveys':
        return <SurveysPage />
      case 'quizzes':
        return <QuizzesPage />
      case 'messages':
        return <Messages />
      case 'profile':
        return <Profile />
      case 'admin':
        return user.role === 'admin' ? <AdminDashboard /> : <Dashboard />
      default:
        return user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />
    }
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}