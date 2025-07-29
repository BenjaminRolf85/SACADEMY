import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseService } from '../../lib/supabaseService'
import { Group } from '../../types'
import GroupChat from './GroupChat'
import GroupFeed from './GroupFeed'
import { Users, MessageSquare, WifiOff, AlertCircle } from 'lucide-react'

export default function Groups() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [activeTab, setActiveTab] = useState<'feed' | 'chat'>('chat')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserGroups()
  }, [user])

  const loadUserGroups = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Loading groups for user:', user.id, 'role:', user.role)
      
      const userGroups = await supabaseService.getUserGroups(user.id, user.role)
      console.log('📊 Loaded user groups:', userGroups.length, userGroups)
      setGroups(userGroups)
      
      if (userGroups.length > 0 && !selectedGroup) {
        console.log('✅ Setting selected group:', userGroups[0].name)
        setSelectedGroup(userGroups[0])
      }
    } catch (err) {
      console.error('Error loading groups:', err)
      setError('Fehler beim Laden der Gruppen')
    } finally {
      setLoading(false)
    }
  }

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group)
    setActiveTab('chat') // Default to chat when switching groups
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg flex items-center space-x-3">
          <WifiOff size={24} />
          <div>
            <p className="font-medium">{error}</p>
            <button
              onClick={loadUserGroups}
              className="mt-2 text-sm bg-red-100 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 text-yellow-800 p-6 rounded-lg flex items-center space-x-3">
          <AlertCircle size={24} />
          <div>
            <p className="font-medium">Sie sind keiner Gruppe zugeordnet</p>
            <p className="text-sm mt-1">Bitte kontaktieren Sie Ihren Administrator, um einer Gruppe zugeordnet zu werden.</p>
          </div>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    if (!selectedGroup) return null

    switch (activeTab) {
      case 'feed':
        return <GroupFeed group={selectedGroup} />
      case 'chat':
        return <GroupChat group={selectedGroup} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Group Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Meine Gruppen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleGroupSelect(group)}
              className={`text-left p-4 rounded-lg border transition-colors ${
                selectedGroup?.id === group.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-25'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {group.name.charAt(0)}
                </div>
                <span className="text-sm text-gray-500 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {group.memberCount}
                </span>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-1">{group.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{group.description}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedGroup && (
        <>
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'chat', name: 'Gruppenchat', icon: MessageSquare },
                  { id: 'feed', name: 'Feed', icon: Users }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
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

            {/* Tab Content */}
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </>
      )}
    </div>
  )
}