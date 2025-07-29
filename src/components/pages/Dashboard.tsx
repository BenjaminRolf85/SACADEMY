import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Group } from '../../types'
import { Clock, Calendar, MessageSquare, MessageCircle, Heart, Download, FileText, Trophy, BookOpen, Send, ThumbsUp, Share2, MoreHorizontal, ImageIcon, Video, Smile, X, CheckCircle } from 'lucide-react'
import Avatar from '../common/Avatar'
import { supabaseService } from '../../lib/supabaseService'
import GroupChat from './GroupChat'

interface Post {
  id: string
  userName: string
  content: string
  timestamp: string
  likes: number
  comments: number
  isLiked: boolean
  image?: string
  commentsData?: Array<{
    id: string
    userName: string
    content: string
    timestamp: string
    isTrainer?: boolean
  }>
  isTrainer?: boolean
}

const mockPosts: Post[] = [
  {
    id: '1',
    userName: 'Adam Mathew',
    content: 'Großartiges Training heute! 🚀 Die neuen Verkaufstechniken sind wirklich hilfreich.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 12,
    comments: 3,
    isLiked: false,
    image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
    commentsData: [
      {
        id: 'c1',
        userName: 'John Smith',
        content: 'Freue mich auch darauf!',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'c2',
        userName: 'Maria Garcia',
        content: 'Das Training war wirklich sehr hilfreich!',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: '2',
    userName: 'Sebastian Bunde',
    content: 'Neues Trainingsprogramm für fortgeschrittene Verkaufstechniken startet nächste Woche! 🎯',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likes: 18,
    comments: 6,
    isLiked: false,
    isTrainer: true,
    commentsData: []
  }
]

export default function Dashboard() {
  const { user } = useAuth()
  const [group, setGroup] = useState<Group | null>(null)
  const [activeTab, setActiveTab] = useState<'feed' | 'materials' | 'calendar' | 'chat' | 'quizzes'>('feed')
  const [newPost, setNewPost] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [expandedComments, setExpandedComments] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>(mockPosts as Post[])
  const [quickActionLoading] = useState<string | null>(null)
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({})

  // Emoji collection
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '👍', '👎', '👌', '🤝', '👏', '🙌', '👊', '✊', '🤛', '🤜',
    '💪', '🦾', '🖕', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟',
    '💯', '🔥', '⚡', '💥', '💫', '💢', '💨', '💦', '💤', '🕳️',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '🚀', '🎯', '💡', '💼', '📈', '📊', '🎓', '🏅', '💎', '🌟'
  ]
  // Chat Interface Component
  const ChatInterface = ({ group }: { group: Group | null }) => {
    if (!group) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Gruppe verfügbar</h3>
            <p className="text-gray-500">Du bist noch keiner Gruppe zugeordnet.</p>
          </div>
        </div>
      )
    }
    
    return <GroupChat group={group} />
  }

  useEffect(() => {
    loadData()
    setPosts(mockPosts as Post[])
  }, [user])

  const loadData = async () => {
    try {
      if (user) {
        const userGroups = await supabaseService.getUserGroups(user.id, user.role)
        if (userGroups.length > 0) {
          // Add mock materials if none exist
          const groupWithMaterials = {
            ...userGroups[0],
            materials: userGroups[0].materials?.length ? userGroups[0].materials : [
              {
                id: 'mat-1',
                name: 'Sales Fundamentals Guide',
                type: 'pdf' as const,
                url: '/materials/sales-guide.pdf',
                uploadDate: new Date().toISOString()
              },
              {
                id: 'mat-2', 
                name: 'Advanced Techniques Video',
                type: 'video' as const,
                url: '/materials/advanced-video.mp4',
                uploadDate: new Date().toISOString()
              },
              {
                id: 'mat-3',
                name: 'Industry Research',
                type: 'link' as const,
                url: 'https://sales-research.com',
                uploadDate: new Date().toISOString()
              }
            ]
          }
          setGroup(groupWithMaterials)
        } else {
          setGroup(userGroups[0])
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  // Helper function to format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 1) return 'gerade eben'
    if (diffMinutes < 60) return `vor ${diffMinutes} Min`
    if (diffHours < 24) return `vor ${diffHours} Std`
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`
    return time.toLocaleDateString('de-DE')
  }

  const removeMedia = () => {
    setSelectedImage(null)
    setSelectedVideo(null)
    setImagePreview(null)
    setVideoPreview(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedVideo(file)
      const reader = new FileReader()
      reader.onload = () => {
        setVideoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addEmoji = (emoji: string) => {
    setNewPost(newPost + emoji)
    setShowEmojiPicker(false)
  }

  const handleCreatePost = () => {
    if (!newPost.trim() && !selectedImage && !selectedVideo) return
    
    // Create new post with media
    const newPostObj = {
      id: `post-${Date.now()}`,
      userName: user?.name || 'Anonymous',
      content: newPost,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false,
      image: imagePreview || undefined,
      video: videoPreview || undefined,
      commentsData: []
    }
    
    setPosts([newPostObj, ...posts])
    
    // Reset form
    setNewPost('')
    removeMedia()
  }

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
      }
      return post
    }))
  }

  const handleToggleComments = (postId: string) => {
    setExpandedComments(expandedComments === postId ? null : postId)
    if (!commentText[postId]) {
      setCommentText({ ...commentText, [postId]: '' })
    }
  }

  const handleAddComment = (postId: string) => {
    const comment = commentText[postId]
    if (!comment?.trim()) return
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newCommentObj = {
          id: `c${Date.now()}`,
          userName: user?.name || 'Anonymous',
          content: comment,
          timestamp: new Date().toISOString()
        }
        return {
          ...post,
          comments: post.comments + 1,
          commentsData: [...(post.commentsData || []), newCommentObj]
        }
      }
      return post
    }))
    
    setCommentText({ ...commentText, [postId]: '' })
  }

  const handleSharePost = (postId: string) => {
    // Mock share functionality
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
    alert('Post-Link in die Zwischenablage kopiert!')
  }

  // Update user statistics with progress indicators
  const quickActions = [
    {
      id: 'quizzes',
      name: 'Quiz starten',
      description: 'Neue Bewertung',
      icon: FileText,
      color: 'bg-blue-500',
      action: () => console.log('Quiz starten')
    },
    {
      id: 'materials',
      name: 'Materialien',
      description: 'Lerninhalte',
      icon: BookOpen,
      color: 'bg-green-500',
      action: () => console.log('Materialien')
    },
    {
      id: 'calendar',
      name: 'Termine',
      description: 'Nächste Events',
      icon: Calendar,
      color: 'bg-purple-500',
      action: () => console.log('Termine')
    },
    {
      id: 'message',
      name: 'Nachrichten',
      description: 'Gruppenchat',
      icon: MessageCircle,
      color: 'bg-yellow-500',
      action: () => console.log('Nachrichten')
    }
  ]
  
  // Mock upcoming events
  const upcomingEvents = [
    {
      id: 'event-1',
      title: 'Weekly Sales Meeting',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      time: '14:00',
      description: 'Review progress and discuss strategies'
    },
    {
      id: 'event-2',
      title: 'Advanced Training Session',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      time: '10:00',
      description: 'Deep dive into advanced sales techniques'
    },
    {
      id: 'event-3',
      title: 'Client Presentation Workshop',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      time: '15:30',
      description: 'Learn to create compelling presentations'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <div className="space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-start space-x-3">
                <Avatar 
                  name={user?.name || 'U'} 
                  avatarUrl={user?.avatarUrl} 
                  role={user?.role || 'user'} 
                  size="lg" 
                />
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder={`Was denkst du, ${user?.name?.split(' ')[0]}?`}
                    className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[80px] text-lg"
                    rows={3}
                  />
                  
                  {/* Media Previews */}
                  {imagePreview && (
                    <div className="mt-3 relative inline-block">
                      <img src={imagePreview} alt="Preview" className="max-w-xs rounded-lg" />
                      <button
                        onClick={removeMedia}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {videoPreview && (
                    <div className="mt-3 relative inline-block">
                      <video src={videoPreview} controls className="max-w-xs rounded-lg" />
                      <button
                        onClick={removeMedia}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors relative"
                      >
                        <Smile className="h-5 w-5" />
                        <span className="text-sm font-medium">Emoji</span>
                      </button>
                      
                      {/* Emoji Picker */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-16 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-80">
                          <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                            {emojis.map((emoji, index) => (
                              <button
                                key={index}
                                onClick={() => addEmoji(emoji)}
                                className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <label className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors cursor-pointer">
                        <ImageIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      
                      <label className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors cursor-pointer">
                        <Video className="h-5 w-5" />
                        <span className="text-sm font-medium">Video</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPost.trim() && !selectedImage && !selectedVideo}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      Posten
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border p-6">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar name={post.userName} role="user" size="lg" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.userName}</h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <span>{formatRelativeTime(post.timestamp)}</span>
                        {post.isTrainer && (
                          <>
                            <span className="mx-1">•</span>
                            <span className="text-secondary-600 font-medium">Trainer</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-800 text-lg leading-relaxed">{post.content}</p>
                </div>
                
                {/* Post Image */}
                {post.image && (
                  <div className="mb-4">
                    <img
                      src={post.image}
                      alt="Post content"
                      className="w-full rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                    />
                  </div>
                )}
                
                {/* Post Video */}
                {(post as any).video && (
                  <div className="mb-4">
                    <video
                      src={(post as any).video}
                      controls
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
                
                {/* Like Count */}
                {post.likes > 0 && (
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center -space-x-1">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <ThumbsUp className="h-3 w-3 text-white" />
                        </div>
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <Heart className="h-3 w-3 text-white fill-current" />
                        </div>
                      </div>
                      <span>{post.likes} Personen</span>
                    </div>
                    {post.comments > 0 && (
                      <button 
                        onClick={() => handleToggleComments(post.id)}
                        className="hover:underline"
                      >
                        {post.comments} Kommentar{post.comments !== 1 ? 'e' : ''}
                      </button>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1 w-full">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors ${
                        post.isLiked ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      <ThumbsUp className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span className="font-medium">Gefällt mir</span>
                    </button>
                    
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="font-medium">Kommentieren</span>
                    </button>
                    
                    <button
                      onClick={() => handleSharePost(post.id)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="font-medium">Teilen</span>
                    </button>
                  </div>
                </div>
                
                {/* Comments Section */}
                {expandedComments === post.id && (
                  <div className="border-t border-gray-100 pt-3">
                    {/* Existing Comments */}
                    {post.commentsData && post.commentsData.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {post.commentsData.map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <Avatar name={comment.userName} size="sm" />
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-2xl px-4 py-2 inline-block">
                                <div className="font-medium text-sm text-gray-900">{comment.userName}</div>
                                <p className="text-gray-800">{comment.content}</p>
                              </div>
                              <div className="flex items-center space-x-4 mt-1 ml-4">
                                <button className="text-xs text-gray-500 hover:underline font-medium">
                                  Gefällt mir
                                </button>
                                <button className="text-xs text-gray-500 hover:underline font-medium">
                                  Antworten
                                </button>
                                <span className="text-xs text-gray-500">
                                  {formatRelativeTime(comment.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add Comment */}
                    <div className="flex items-start space-x-3">
                      <Avatar 
                        name={user?.name || 'U'} 
                        avatarUrl={user?.avatarUrl} 
                        role={user?.role || 'user'} 
                        size="sm" 
                      />
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={commentText[post.id] || ''}
                          onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                          placeholder="Schreibe einen Kommentar..."
                          className="w-full bg-gray-100 rounded-full px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddComment(post.id)
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentText[post.id]?.trim()}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Load More */}
            <div className="flex items-center justify-center py-6">
              <button
                onClick={() => {
                  // Add more mock posts or load from API
                  const newMockPost = {
                    id: `${Date.now()}`,
                    userName: 'Maria Schmidt',
                    content: 'Erfolgreicher Verkaufsabschluss heute! Die Techniken aus dem Training haben wirklich geholfen. 🎯',
                    timestamp: new Date().toISOString(),
                    likes: 8,
                    comments: 2,
                    isLiked: false,
                    commentsData: []
                  }
                  setPosts([...posts, newMockPost])
                }}
                className="bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Weitere Beiträge laden
              </button>
            </div>
          </div>
        )
      case 'materials':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Schulungsmaterialien</h3>
                <span className="text-sm text-gray-500">
                  {group?.materials?.length || 0} Materialien verfügbar
                </span>
              </div>
              
              {group?.materials && group.materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.materials.map((material) => {
                    const getIcon = (type: string) => {
                      switch (type) {
                        case 'pdf': return <FileText className="h-8 w-8 text-red-600" />
                        case 'video': return <Video className="h-8 w-8 text-blue-600" />
                        case 'link': return <MessageSquare className="h-8 w-8 text-green-600" />
                        default: return <FileText className="h-8 w-8 text-gray-600" />
                      }
                    }
                    
                    return (
                      <div key={material.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getIcon(material.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{material.name}</h4>
                            <p className="text-sm text-gray-500 mb-2">
                              {material.type.toUpperCase()} • {new Date(material.uploadDate).toLocaleDateString('de-DE')}
                            </p>
                            <button 
                              onClick={() => window.open(material.url, '_blank')}
                              className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                            >
                              <Download className="h-4 w-4" />
                              <span>
                                {material.type === 'link' ? 'Öffnen' : 'Herunterladen'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Materialien verfügbar</h3>
                  <p className="text-gray-500">Der Trainer hat noch keine Materialien hochgeladen.</p>
                </div>
              )}
            </div>
          </div>
        )
      case 'calendar':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Kommende Termine</h3>
                <span className="text-sm text-gray-500">
                  {upcomingEvents.length} Termine geplant
                </span>
              </div>
              
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      </div>
                      <p className="text-gray-700 mb-3">{event.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.date).toLocaleDateString('de-DE')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      case 'chat':
        return (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <ChatInterface group={group} />
          </div>
        )
      case 'quizzes':
        return (
          <div className="space-y-6">
            {/* Quiz Header & Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Bewertungen & Quizzes</h3>
                  <p className="text-blue-100">Teste dein Verkaufswissen und sammle Punkte</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{user?.points || 700}</div>
                  <div className="text-blue-200 text-sm">Gesamt Punkte</div>
                </div>
              </div>
              
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="text-2xl font-bold">8/12</div>
                  <div className="text-blue-200 text-sm">Abgeschlossen</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="text-2xl font-bold">87%</div>
                  <div className="text-blue-200 text-sm">Ø Score</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-blue-200 text-sm">Verfügbar</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="text-2xl font-bold">Level {user?.level || 4}</div>
                  <div className="text-blue-200 text-sm">Aktuell</div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="flex items-center space-x-1 p-1">
                {[
                  { id: 'all', name: 'Alle Quizzes', count: 12 },
                  { id: 'available', name: 'Verfügbar', count: 4 },
                  { id: 'completed', name: 'Abgeschlossen', count: 8 },
                  { id: 'featured', name: 'Empfohlen', count: 3 }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium text-sm transition-all bg-gray-50 text-gray-600 hover:bg-gray-100"
                  >
                    <span>{filter.name}</span>
                    <span className="bg-gray-200 text-gray-600 py-1 px-2 rounded-full text-xs">
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Quiz */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
                      ⭐ Empfohlen
                    </span>
                    <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
                      🔥 Neu
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold mb-2">Advanced Sales Psychology</h4>
                  <p className="text-purple-100 mb-4">Meistere die psychologischen Aspekte des Verkaufens und erhöhe deine Abschlussrate um 40%</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>25 Min</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4" />
                      <span>150 Punkte</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>20 Fragen</span>
                    </span>
                  </div>
                </div>
                <div className="ml-6">
                  <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors shadow-lg">
                    Jetzt starten
                  </button>
                </div>
              </div>
            </div>

            {/* Quiz Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  id: 'quiz-1',
                  title: 'Sales Fundamentals',
                  description: 'Grundlagen des modernen Verkaufens',
                  questions: 15,
                  timeEstimate: 20,
                  difficulty: 'Beginner',
                  points: 100,
                  completed: true,
                  score: 92,
                  lastAttempt: '2024-07-28',
                  category: 'Grundlagen',
                  icon: '📚',
                  color: 'from-green-400 to-emerald-500'
                },
                {
                  id: 'quiz-2',
                  title: 'Objection Handling Mastery',
                  description: 'Einwände professionell behandeln',
                  questions: 18,
                  timeEstimate: 25,
                  difficulty: 'Advanced',
                  points: 150,
                  completed: true,
                  score: 85,
                  lastAttempt: '2024-07-26',
                  category: 'Fortgeschritten',
                  icon: '🛡️',
                  color: 'from-blue-400 to-indigo-500'
                },
                {
                  id: 'quiz-3',
                  title: 'Digital Sales Techniques',
                  description: 'Online-Verkauf und digitale Kanäle',
                  questions: 22,
                  timeEstimate: 30,
                  difficulty: 'Intermediate',
                  points: 120,
                  completed: false,
                  inProgress: true,
                  progress: 45,
                  category: 'Digital',
                  icon: '💻',
                  color: 'from-cyan-400 to-blue-500'
                },
                {
                  id: 'quiz-4',
                  title: 'Closing Techniques Pro',
                  description: 'Fortgeschrittene Abschlusstechniken',
                  questions: 16,
                  timeEstimate: 22,
                  difficulty: 'Expert',
                  points: 200,
                  completed: false,
                  locked: false,
                  category: 'Expert',
                  icon: '🎯',
                  color: 'from-orange-400 to-red-500'
                },
                {
                  id: 'quiz-5',
                  title: 'Customer Psychology',
                  description: 'Kundenverhalten verstehen und nutzen',
                  questions: 20,
                  timeEstimate: 28,
                  difficulty: 'Advanced',
                  points: 180,
                  completed: false,
                  locked: true,
                  requiredLevel: 5,
                  category: 'Psychologie',
                  icon: '🧠',
                  color: 'from-purple-400 to-pink-500'
                },
                {
                  id: 'quiz-6',
                  title: 'B2B Sales Mastery',
                  description: 'Business-to-Business Verkaufsstrategien',
                  questions: 24,
                  timeEstimate: 35,
                  difficulty: 'Expert',
                  points: 250,
                  completed: false,
                  locked: true,
                  requiredLevel: 6,
                  category: 'B2B',
                  icon: '🏢',
                  color: 'from-gray-400 to-slate-500'
                }
              ].map((quiz) => (
                <div
                  key={quiz.id}
                  className={`bg-white rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    quiz.locked ? 'opacity-75' : 'hover:-translate-y-1'
                  }`}
                >
                  {/* Quiz Header */}
                  <div className={`bg-gradient-to-r ${quiz.color} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 text-8xl">
                      {quiz.icon}
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
                          {quiz.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: quiz.difficulty === 'Beginner' ? 1 : quiz.difficulty === 'Intermediate' ? 2 : quiz.difficulty === 'Advanced' ? 3 : 4 }).map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                          ))}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                      <p className="text-white/80 text-sm">{quiz.description}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Progress Bar for In-Progress Quiz */}
                    {quiz.inProgress && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Fortschritt</span>
                          <span className="text-blue-600 font-medium">{quiz.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all" 
                            style={{ width: `${quiz.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Quiz Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{quiz.questions}</div>
                        <div className="text-sm text-gray-500">Fragen</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{quiz.timeEstimate}</div>
                        <div className="text-sm text-gray-500">Minuten</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">{quiz.points}</div>
                        <div className="text-sm text-gray-500">Punkte</div>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        quiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        quiz.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                        quiz.difficulty === 'Advanced' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </div>

                    {/* Completion Status */}
                    {quiz.completed && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-green-800">Abgeschlossen</div>
                            <div className="text-sm text-green-600">Score: {quiz.score}%</div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-green-600">
                          <div className="text-sm text-green-600">Letzter Versuch</div>
                          <div className="text-sm font-medium text-green-800">{quiz.lastAttempt}</div>
                        </div>
                      </div>
                    )}

                    {/* Locked Status */}
                    {quiz.locked && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            🔒
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700">Level {quiz.requiredLevel} erforderlich</div>
                            <div className="text-sm text-gray-500">Erreiche Level {quiz.requiredLevel} um dieses Quiz freizuschalten</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      disabled={quiz.locked}
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors ${
                        quiz.locked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : quiz.completed
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : quiz.inProgress
                              ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                              : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg'
                      }`}
                    >
                      {quiz.locked
                        ? '🔒 Gesperrt'
                        : quiz.completed
                          ? '🔄 Wiederholen'
                          : quiz.inProgress
                            ? '▶️ Fortsetzen'
                            : '🚀 Starten'
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements Section */}
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
                Erfolge & Auszeichnungen
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Erste Schritte', description: 'Erstes Quiz abgeschlossen', icon: '🎯', unlocked: true },
                  { name: 'Perfektionist', description: '100% in einem Quiz erreicht', icon: '💯', unlocked: false },
                  { name: 'Experte', description: 'Alle Grundlagen-Quizzes abgeschlossen', icon: '🏆', unlocked: true }
                ].map((achievement, index) => (
                  <div key={index} className={`p-4 rounded-xl border ${achievement.unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <div className={`font-semibold ${achievement.unlocked ? 'text-yellow-800' : 'text-gray-500'}`}>
                        {achievement.name}
                      </div>
                      <div className={`text-sm ${achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'}`}>
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Willkommen zurück, {user?.name?.split(' ')[0]}!</h1>
              <p className="text-primary-100 mt-1">
                {group ? `Gruppe: ${group.name}` : 'Lade Gruppendaten...'}
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{user?.points || 700}</div>
                <div className="text-primary-200 text-sm">Punkte</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Level {user?.level || 4}</div>
                <div className="text-primary-200 text-sm">Aktuell</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">85%</div>
                <div className="text-primary-200 text-sm">Fortschritt</div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="hidden lg:flex flex-col space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  disabled={quickActionLoading === action.id}
                  className="bg-white/10 backdrop-blur hover:bg-white/20 p-4 rounded-xl transition-all duration-200 group"
                >
                  <action.icon className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">{action.name}</div>
                  {quickActionLoading === action.id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto mt-1"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'feed', name: 'Feed', icon: MessageSquare, badge: mockPosts.length },
              { id: 'materials', name: 'Materialien', icon: BookOpen, badge: group?.materials?.length || 0 },
              { id: 'calendar', name: 'Termine', icon: Calendar, badge: upcomingEvents.length },
              { id: 'chat', name: 'Gruppenchat', icon: MessageCircle, badge: null },
              { id: 'quizzes', name: 'Quiz', icon: FileText, badge: 3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="bg-primary-100 text-primary-800 py-1 px-2.5 rounded-full text-xs font-medium min-w-[20px] text-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}