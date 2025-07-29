import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseService } from '../../lib/supabaseService'
import { Group, Post } from '../../types'
import {
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Calendar, 
  Trophy, 
  BookOpen,
  Send,
  Heart,
  MessageCircle,
  Download,
  Star
} from 'lucide-react'

interface GroupDetailProps {
  groupId: string
  onBack: () => void
}

export default function GroupDetail({ groupId, onBack }: GroupDetailProps) {
  const { user } = useAuth()
  const [group, setGroup] = useState<Group | null>(null)
  const [activeTab, setActiveTab] = useState('feed')
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGroupData()
  }, [groupId])

  const loadGroupData = async () => {
    try {
      const groups = await supabaseService.getGroups()
      const foundGroup = groups.find((g: any) => g.id === groupId)
      if (!foundGroup) return

      setGroup(foundGroup)
      
      // Load group posts
      const groupPosts = await supabaseService.getGroupPosts(groupId)
      setPosts(groupPosts)
    } catch (error) {
      console.error('Error loading group data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.trim()) return
    
    try {
      await supabaseService.createPost(newPost, user?.id || '', groupId)
      setNewPost('')
      loadGroupData()
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      await supabaseService.likePost(postId, user?.id || '')
      loadGroupData()
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const tabs = [
    { id: 'feed', name: 'Feed', icon: MessageSquare },
    { id: 'materials', name: 'Schulungsmaterialien', icon: BookOpen },
    { id: 'calendar', name: 'Lernkalender', icon: Calendar },
    { id: 'challenges', name: 'Herausforderungen', icon: Trophy },
    { id: 'chat', name: 'Chat', icon: MessageSquare },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Gruppe nicht gefunden</p>
        <button onClick={onBack} className="mt-4 text-primary-600 hover:text-primary-700">
          Zurück zu Gruppen
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600">{group.description}</p>
          </div>
        </div>
      </div>

      {/* Group Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {group.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{group.name}</h2>
              <p className="text-gray-600">{group.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {group.trainers?.[0] || group.trainer || 'Kein Trainer'}
                </span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {group.memberCount} Mitglieder
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        <div className="p-6">
          {/* Feed Tab */}
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {/* Create Post */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Neuen Beitrag erstellen</h3>
                <div className="space-y-3">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Was möchtest du mit der Gruppe teilen?"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPost.trim()}
                      className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Posten
                    </button>
                  </div>
                </div>
              </div>

              {/* Posts */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                          {post.userName.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{post.userName}</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(post.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-800 mb-3">{post.content}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center space-x-1 hover:text-red-500 ${
                              post.isLiked ? 'text-red-500' : ''
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-500">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Schulungsmaterialien</h3>
                <p className="text-sm text-gray-500">
                  {group.materials?.length || 0} Materialien verfügbar
                </p>
              </div>

              {group.materials && group.materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.materials.map((material) => (
                    <div key={material.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                            {material.name.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{material.name}</h4>
                          <p className="text-sm text-gray-500 mb-2">
                            {material.type.toUpperCase()} • {new Date(material.uploadDate).toLocaleDateString()}
                          </p>
                          <button className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700">
                            <Download className="h-4 w-4" />
                            <span>
                              {material.type === 'link' ? 'Öffnen' : 'Herunterladen'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Materialien verfügbar</h3>
                  <p className="text-gray-500">Der Trainer hat noch keine Materialien hochgeladen.</p>
                </div>
              )}
            </div>
          )}

          {/* Other tabs - placeholder */}
          {activeTab !== 'feed' && activeTab !== 'materials' && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {tabs.find(t => t.id === activeTab)?.name} wird geladen...
              </h3>
              <p className="text-gray-500">Diese Funktion wird bald verfügbar sein.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}