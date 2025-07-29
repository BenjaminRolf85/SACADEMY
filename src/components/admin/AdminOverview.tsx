import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseService } from '../../lib/supabaseService'
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeTrainers: number
  totalGroups: number
  pendingApprovals: number
  activeEvents: number
  completedQuizzes: number
  pendingQuizzes: number
}

export default function AdminOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeTrainers: 0,
    totalGroups: 0,
    pendingApprovals: 0,
    activeEvents: 0,
    completedQuizzes: 0,
    pendingQuizzes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Load basic stats from Supabase
      const users = await supabaseService.getUsers()
      const groups = await supabaseService.getGroups()
      const posts = await supabaseService.getPosts()
      
      setStats({
        totalUsers: users.length,
        activeTrainers: users.filter(u => u.role === 'trainer').length,
        totalGroups: groups.length,
        pendingApprovals: posts.filter(p => p.status === 'pending').length,
        activeEvents: 0, // TODO: Implement events
        completedQuizzes: 0, // TODO: Implement quiz attempts
      pendingQuizzes: 0 // Corrected duplicate entry
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Gesamt Benutzer',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+3 diese Woche'
    },
    {
      name: 'Aktive Trainer',
      value: stats.activeTrainers,
      icon: Star,
      color: 'bg-green-500',
      change: '2 online'
    },
    {
      name: 'Gruppen',
      value: stats.totalGroups,
      icon: BookOpen,
      color: 'bg-purple-500',
      change: 'Aktiv'
    },
    {
      name: 'Ausstehende Quizzes',
      value: stats.pendingQuizzes || 0,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      change: 'Zur Review'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-brand rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-2">
          Willkommen zurück, {user?.name}!
        </h2>
        <p className="text-primary-100">
          Hier ist Ihre Sales Academy Übersicht
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ServerStatus</span>
              <span className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Datenbankverbindung</span>
              <span className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Verbunden
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Letzte Sicherung</span>
              <span className="text-sm text-gray-500">vor 2 Stunden</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Letzte Aktivitäten</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">3 neue Benutzer registriert</p>
                <p className="text-xs text-gray-500">vor 2 Stunden</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">5 neue Forum-Beiträge</p>
                <p className="text-xs text-gray-500">vor 4 Stunden</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Neue Gruppe erstellt</p>
                <p className="text-xs text-gray-500">vor 6 Stunden</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Schnellaktionen</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Users className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Benutzer hinzufügen</h4>
            <p className="text-sm text-gray-500">Neuen Benutzer zum System hinzufügen</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <BookOpen className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Gruppe erstellen</h4>
            <p className="text-sm text-gray-500">Neue Trainingsgruppe erstellen</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <MessageSquare className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Beiträge moderieren</h4>
            <p className="text-sm text-gray-500">Ausstehende Beiträge überprüfen</p>
          </button>
        </div>
      </div>
    </div>
  )
}