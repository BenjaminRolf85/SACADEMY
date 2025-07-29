import { useState, useEffect } from 'react'
import { supabaseService } from '../../lib/supabaseService'
import { 
  Trophy, 
  Users,
  TrendingUp,
  Mic,
  Video,
  Target,
  Download,
  BarChart3,
  FileText,
  Clock
} from 'lucide-react'

interface ActivitySummary {
  userId: string
  userName: string
  weeklyPoints: number
  totalPoints: number
  level: number
  thisWeekActivities: any[]
  completionRate: number
  lastActivity: string
}

interface ActivityStats {
  totalActivities: number
  totalPoints: number
  avgWeeklyPoints: number
  topPerformers: ActivitySummary[]
  activityDistribution: { [key: string]: number }
}

export default function AdminActivitiesPage() {
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [userActivities, setUserActivities] = useState<ActivitySummary[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivityData()
  }, [selectedTimeframe])

  const loadActivityData = async () => {
    try {
      setLoading(true)
      
      const users = await supabaseService.getUsers()
      const allActivities = supabaseService.getActivities()
      
      // Calculate user summaries
      const summaries: ActivitySummary[] = await Promise.all(
        users.map(async (user) => {
          const userActivities = await supabaseService.getUserActivities(user.id)
          const weeklyActivities = await supabaseService.getWeeklyActivities(user.id)
          
          const weeklyPoints = weeklyActivities.reduce((sum: number, act: any) => sum + act.points, 0)
          const completionRate = calculateCompletionRate(weeklyActivities)
          const lastActivity = userActivities.length > 0 
            ? userActivities[userActivities.length - 1].createdAt 
            : ''
          
          return {
            userId: user.id,
            userName: user.name,
            weeklyPoints,
            totalPoints: user.points || 0,
            level: user.level || 1,
            thisWeekActivities: weeklyActivities,
            completionRate,
            lastActivity
          }
        })
      )
      
      setUserActivities(summaries)
      
      // Calculate overall stats
      const totalActivities = allActivities.length
      const totalPoints = allActivities.reduce((sum: number, act: any) => sum + act.points, 0)
      const avgWeeklyPoints = summaries.reduce((sum, user) => sum + user.weeklyPoints, 0) / summaries.length
      
      // Activity distribution
      const distribution: { [key: string]: number } = {}
      allActivities.forEach((activity: any) => {
        distribution[activity.type] = (distribution[activity.type] || 0) + 1
      })
      
      const topPerformers = summaries
        .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
        .slice(0, 5)
      
      setStats({
        totalActivities,
        totalPoints,
        avgWeeklyPoints,
        topPerformers,
        activityDistribution: distribution
      })
      
    } catch (error) {
      console.error('Error loading activity data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCompletionRate = (weeklyActivities: any[]) => {
    const requiredActivities = 4 + 3 + 1 // 4 Tagespläne + 3 Feedback + 1 Meeting/Reflection
    const completedActivities = weeklyActivities.length
    return Math.min((completedActivities / requiredActivities) * 100, 100)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tagesplan': return <FileText className="h-4 w-4" />
      case 'feedback_voice': return <Mic className="h-4 w-4" />
      case 'feedback_video': return <Video className="h-4 w-4" />
      case 'live_meeting': return <Users className="h-4 w-4" />
      case 'selbstreflexion': return <Target className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getActivityName = (type: string) => {
    const names = {
      'tagesplan': 'Tagesplan',
      'feedback_voice': 'Voice Feedback',
      'feedback_video': 'Video Feedback', 
      'live_meeting': 'Live Meeting',
      'selbstreflexion': 'Selbstreflexion',
      'entschuldigt': 'Entschuldigt',
      'unentschuldigt': 'Unentschuldigt'
    }
    return names[type as keyof typeof names] || type
  }

  const exportActivityData = () => {
    if (!stats || !userActivities) return
    
    const csvData = [
      ['Name', 'Wöchentliche Punkte', 'Gesamt Punkte', 'Level', 'Completion Rate %', 'Letzte Aktivität'],
      ...userActivities.map(user => [
        user.userName,
        user.weeklyPoints,
        user.totalPoints,
        user.level,
        user.completionRate.toFixed(1),
        user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'Keine'
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aktivitaeten-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">Aktivitäten-Tracking</h1>
            <p className="text-gray-600">Überwachung der wöchentlichen Trainingsaktivitäten aller Benutzer</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="week">Diese Woche</option>
              <option value="month">Dieser Monat</option>
              <option value="all">Alle Zeit</option>
            </select>
            <button
              onClick={exportActivityData}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamt Aktivitäten</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamt Punkte</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPoints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ø Wöchentliche Punkte</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgWeeklyPoints.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive Benutzer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userActivities.filter(u => u.thisWeekActivities.length > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Distribution */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Aktivitätsverteilung</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.activityDistribution).map(([type, count]) => (
              <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  {getActivityIcon(type)}
                </div>
                <div className="font-medium">{getActivityName(type)}</div>
                <div className="text-2xl font-bold text-primary-600">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Activities Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Benutzer-Aktivitäten</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benutzer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wöchentliche Punkte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gesamt Punkte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktivitäten diese Woche
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Letzte Aktivität
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userActivities.map((user) => (
                <tr key={user.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {user.userName.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                        <div className="text-sm text-gray-500">Level {user.level}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{user.weeklyPoints}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{user.totalPoints}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            user.completionRate >= 80 ? 'bg-green-600' :
                            user.completionRate >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${user.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{user.completionRate.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {user.thisWeekActivities.slice(0, 5).map((activity, index) => (
                        <div key={index} className="p-1 bg-gray-100 rounded">
                          {getActivityIcon(activity.type)}
                        </div>
                      ))}
                      {user.thisWeekActivities.length > 5 && (
                        <span className="text-xs text-gray-500">+{user.thisWeekActivities.length - 5}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastActivity 
                      ? new Date(user.lastActivity).toLocaleDateString('de-DE')
                      : 'Keine Aktivität'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {userActivities.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Aktivitätsdaten</h3>
            <p className="mt-1 text-sm text-gray-500">Benutzer haben noch keine Aktivitäten eingereicht.</p>
          </div>
        )}
      </div>

      {/* Weekly Requirements Info */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">📅 Wöchentlicher Zeitplan</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-700">
          <div>
            <strong>Dienstag:</strong> Tagesplan + Feedback
          </div>
          <div>
            <strong>Mittwoch:</strong> Tagesplan + Feedback
          </div>
          <div>
            <strong>Donnerstag:</strong> Tagesplan + Feedback
          </div>
          <div>
            <strong>Freitag:</strong> Tagesplan + Meeting/Reflexion
          </div>
        </div>
        <p className="text-sm text-blue-600 mt-3">
          Max. Punkte pro Woche: 26 (4×2 Tagesplan + 3×4-6 Feedback + 1×6 Meeting/Reflexion)
        </p>
      </div>
    </div>
  )
}