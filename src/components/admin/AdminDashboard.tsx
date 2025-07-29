import { useState } from 'react'
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Trophy, 
  FileText, 
  Settings, 
  BarChart3,
  Shield,
  UserCheck,
  GraduationCap
} from 'lucide-react'

// Import all admin page components
import UserAccessManagement from './UserAccessManagement'
import AdminForumPage from './AdminForumPage'
import AdminQuizPage from './AdminQuizPage'
import AdminGroupsPage from './AdminGroupsPage'
import AdminOverview from './AdminOverview'
import AdminTrainersPage from './AdminTrainersPage'
import AdminCalendarPage from './AdminCalendarPage'
import AdminChallengesPage from './AdminChallengesPage'
import AdminAnalyticsPage from './AdminAnalyticsPage'
import AdminSettingsPage from './AdminSettingsPage'
import AdminTermsPage from './AdminTermsPage'
import AdminActivitiesPage from './AdminActivitiesPage'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const adminTabs = [
    { id: 'overview', name: 'Übersicht', icon: BarChart3, component: AdminOverview },
    { id: 'users', name: 'Zugriffsverwaltung', icon: UserCheck, component: UserAccessManagement },
    { id: 'forum', name: 'Forum', icon: MessageSquare, component: AdminForumPage },
    { id: 'quiz', name: 'Quiz-Verwaltung', icon: FileText, component: AdminQuizPage },
    { id: 'groups', name: 'Gruppen', icon: Users, component: AdminGroupsPage },
    { id: 'trainers', name: 'Trainer', icon: GraduationCap, component: AdminTrainersPage },
    { id: 'calendar', name: 'Kalender', icon: Calendar, component: AdminCalendarPage },
    { id: 'challenges', name: 'Herausforderungen', icon: Trophy, component: AdminChallengesPage },
    { id: 'activities', name: 'Aktivitäten-Tracking', icon: Trophy, component: AdminActivitiesPage },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, component: AdminAnalyticsPage },
    { id: 'settings', name: 'Einstellungen', icon: Settings, component: AdminSettingsPage },
    { id: 'terms', name: 'AGB', icon: FileText, component: AdminTermsPage }
  ]

  const currentTab = adminTabs.find(tab => tab.id === activeTab)
  const CurrentComponent = currentTab?.component || AdminOverview

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-primary-800">Admin Dashboard</h1>
            <p className="text-gray-600">Verwaltung der Sales Academy Plattform</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
        <CurrentComponent />
      </div>
    </div>
  )
}