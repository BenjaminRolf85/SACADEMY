import { useState, useEffect } from 'react'
import { supabaseService } from '../../lib/supabaseService'
import { 
  Users, 
  Activity, 
  Award,
  Target,
  RefreshCw,
  Download
} from 'lucide-react'

interface AnalyticsData {
  userGrowth: {
    total: number
    thisMonth: number
    lastMonth: number
    growthRate: number
  }
  engagement: {
    activeUsers: number
    totalSessions: number
    avgSessionTime: number
    messagesSent: number
  }
  learning: {
    quizzesCompleted: number
    averageScore: number
    coursesCompleted: number
    certificationsEarned: number
  }
  groupStats: {
    totalGroups: number
    activeGroups: number
    avgGroupSize: number
    completionRate: number
  }
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Get data from services
      const [users, groups, posts] = await Promise.all([
        supabaseService.getUsers(),
        supabaseService.getGroups(),
        supabaseService.getPosts()
      ])

      // Calculate analytics
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      
      const thisMonthUsers = users.filter(u => new Date(u.createdAt) >= thisMonth).length
      const lastMonthUsers = users.filter(u => {
        const created = new Date(u.createdAt)
        return created >= lastMonth && created < thisMonth
      }).length
      
      const growthRate = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0

      const analyticsData: AnalyticsData = {
        userGrowth: {
          total: users.length,
          thisMonth: thisMonthUsers,
          lastMonth: lastMonthUsers,
          growthRate
        },
        engagement: {
          activeUsers: users.filter(u => u.status === 'active').length,
          totalSessions: users.length * 12, // Mock data
          avgSessionTime: 24, // Mock: 24 minutes
          messagesSent: posts.length + 150 // Mock additional messages
        },
        learning: {
          quizzesCompleted: users.length * 3, // Mock: avg 3 quizzes per user
          averageScore: 78.5, // Mock score
          coursesCompleted: groups.filter(g => g.status === 'completed').length * 8,
          certificationsEarned: users.filter(u => (u.level || 0) >= 5).length
        },
        groupStats: {
          totalGroups: groups.length,
          activeGroups: groups.filter(g => g.status === 'active').length,
          avgGroupSize: groups.reduce((sum, g) => sum + (g.memberCount || 0), 0) / groups.length,
          completionRate: 85.3 // Mock completion rate
        }
      }

      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalytics()
    setRefreshing(false)
  }

  const exportData = () => {
    if (!analytics) return
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Users', analytics.userGrowth.total],
      ['Active Users', analytics.engagement.activeUsers],
      ['Total Groups', analytics.groupStats.totalGroups],
      ['Active Groups', analytics.groupStats.activeGroups],
      ['Quizzes Completed', analytics.learning.quizzesCompleted],
      ['Average Score', analytics.learning.averageScore],
      ['Messages Sent', analytics.engagement.messagesSent]
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-academy-analytics-${new Date().toISOString().split('T')[0]}.csv`
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

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-600">Fehler beim Laden der Analytics-Daten</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">Analytics Dashboard</h1>
            <p className="text-gray-600">Umfassende Einblicke in die Plattform-Performance</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="7d">Letzte 7 Tage</option>
              <option value="30d">Letzte 30 Tage</option>
              <option value="90d">Letzte 90 Tage</option>
              <option value="1y">Letztes Jahr</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Aktualisieren
            </button>
            <button
              onClick={exportData}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Benutzer-Wachstum</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.userGrowth.total}</p>
              <p className={`text-sm ${analytics.userGrowth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.userGrowth.growthRate >= 0 ? '+' : ''}{analytics.userGrowth.growthRate.toFixed(1)}% vs. letzter Monat
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktive Benutzer</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.engagement.activeUsers}</p>
              <p className="text-sm text-gray-500">
                Ø {analytics.engagement.avgSessionTime} Min./Session
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quiz-Abschlüsse</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.learning.quizzesCompleted}</p>
              <p className="text-sm text-gray-500">
                Ø {analytics.learning.averageScore}% Score
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Group Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktive Gruppen</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.groupStats.activeGroups}</p>
              <p className="text-sm text-gray-500">
                {analytics.groupStats.completionRate}% Abschlussrate
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Benutzer-Aktivität</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Neue Registrierungen</span>
              <span className="text-lg font-bold text-blue-600">{analytics.userGrowth.thisMonth}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Aktive Sessions</span>
              <span className="text-lg font-bold text-green-600">{analytics.engagement.totalSessions}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Gesendete Nachrichten</span>
              <span className="text-lg font-bold text-purple-600">{analytics.engagement.messagesSent}</span>
            </div>
          </div>
        </div>

        {/* Learning Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Lern-Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Abgeschlossene Kurse</span>
              <span className="text-lg font-bold text-blue-600">{analytics.learning.coursesCompleted}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Zertifizierungen</span>
              <span className="text-lg font-bold text-yellow-600">{analytics.learning.certificationsEarned}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Durchschnittliche Gruppengröße</span>
              <span className="text-lg font-bold text-green-600">{analytics.groupStats.avgGroupSize.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Top-Performer</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Beste Trainer</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Sebastian Bunde</span>
                <span className="text-sm font-medium text-green-600">⭐ 4.9</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Brigitte Müller</span>
                <span className="text-sm font-medium text-green-600">⭐ 4.8</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Michael Weber</span>
                <span className="text-sm font-medium text-green-600">⭐ 4.7</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Aktivste Gruppen</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Training Group</span>
                <span className="text-sm font-medium text-blue-600">15 Mitglieder</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Sales Group</span>
                <span className="text-sm font-medium text-blue-600">12 Mitglieder</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Professional Training</span>
                <span className="text-sm font-medium text-blue-600">10 Mitglieder</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Top-Lernende</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Adam Mathew</span>
                <span className="text-sm font-medium text-yellow-600">700 Punkte</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">John Smith</span>
                <span className="text-sm font-medium text-yellow-600">640 Punkte</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Maria Garcia</span>
                <span className="text-sm font-medium text-yellow-600">560 Punkte</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">System-Gesundheit</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">1.2s</div>
            <div className="text-sm text-gray-600">Avg. Response Time</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-gray-600">Critical Errors</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">98.5%</div>
            <div className="text-sm text-gray-600">User Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  )
}