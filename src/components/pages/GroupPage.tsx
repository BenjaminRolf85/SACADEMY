import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseService } from '../../lib/supabaseService'
import GroupSelector from './GroupSelector'
import GroupFeed from './GroupFeed'
import GroupMaterials from './GroupMaterials'
import GroupCalendar from './GroupCalendar'
import GroupChat from './GroupChat'
import GroupChallenges from './GroupChallenges'
import { Group } from '../../types'
import { WifiOff, AlertCircle } from 'lucide-react'

export default function GroupPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [activeTab, setActiveTab] = useState<'feed' | 'materials' | 'calendar' | 'challenges' | 'chat'>('feed')
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
    setActiveTab('feed') // Reset to feed when switching groups
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
      case 'materials':
        return <GroupMaterials group={selectedGroup} />
      case 'calendar':
        return <GroupCalendar group={selectedGroup} />
      case 'challenges':
        return <GroupChallenges group={selectedGroup} />
      case 'chat':
        return <GroupChat group={selectedGroup} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Group Selector */}
      <GroupSelector
        groups={groups}
        selectedGroup={selectedGroup}
        onGroupSelect={handleGroupSelect}
      />

      {selectedGroup && (
        <>
          {/* Tab Navigation */}
          {console.log('🎯 Rendering tabs for group:', selectedGroup.name)}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'feed', name: 'Feed', count: 0 },
                  { id: 'materials', name: 'Schulungsmaterialien', count: selectedGroup.materials?.length || 0 },
                  { id: 'calendar', name: 'Lernkalender', count: 0 },
                  { id: 'challenges', name: 'Herausforderungen', count: 0 },
                  { id: 'chat', name: 'Chat', count: 0 }
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
                    <span>{tab.name}</span>
                    {tab.count > 0 && (
                      <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {(() => {
                console.log('🎯 Rendering tab content for:', activeTab)
                return renderTabContent()
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  )
}