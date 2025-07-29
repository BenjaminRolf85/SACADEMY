import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseService } from '../../lib/supabaseService'
import { Group, Post } from '../../types'
import Avatar from '../common/Avatar'
import { Send, Heart, MessageCircle, X, Bold, Italic, Underline, Link, Smile, AtSign, Paperclip, ImageIcon, VideoIcon } from 'lucide-react'

interface GroupFeedProps {
  group: Group
}

export default function GroupFeed({ group }: GroupFeedProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewingImage, setViewingImage] = useState<string | null>(null)

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
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️'
  ]

  useEffect(() => {
    loadPosts()
  }, [group.id])

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

  const removeMedia = () => {
    setSelectedImage(null)
    setSelectedVideo(null)
    setImagePreview(null)
    setVideoPreview(null)
  }

  const loadPosts = async () => {
    try {
      const groupPosts = await supabaseService.getGroupPosts(group.id)
      setPosts(groupPosts)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.trim()) return
    
    try {
      // In a real app, you'd upload the media first and get URLs
      const imageUrl = imagePreview || undefined
      const videoUrl = videoPreview || undefined
      
      await supabaseService.createPost(newPost, user?.id || '', group.id, imageUrl, videoUrl)
      setNewPost('')
      removeMedia()
      loadPosts()
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      await supabaseService.likePost(postId, user?.id || '')
      loadPosts()
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleCreatePost()
    }
  }

  const mockPosts = [
    {
      id: 'post-1',
      userId: 'user-1',
      userName: 'Adam Mathew',
      content: 'Sales training tomo!',
      timestamp: '2025-05-30T12:00:00Z',
      likes: 12,
      comments: 3,
      isLiked: false,
      image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
      profiles: { name: 'Adam Mathew' }
    }
  ]

  const allPosts = [...mockPosts, ...posts]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Group Info Bar */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{group.name}</h2>
            <p className="text-gray-300">{group.description}</p>
            <div className="flex flex-wrap gap-2 mt-2 text-sm">
              <span className="bg-gray-600 px-2 py-1 rounded">Digital Sales</span>
              <span className="bg-gray-600 px-2 py-1 rounded">Sales Professional</span>
              <span className="bg-gray-600 px-2 py-1 rounded">Advanced Sales Training</span>
              <span className="bg-gray-600 px-2 py-1 rounded">Gruppe Brigitte</span>
              <span className="bg-gray-600 px-2 py-1 rounded">Professional Training</span>
              <span className="bg-gray-600 px-2 py-1 rounded">Training Group</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-4 text-sm">
              <div>
                <div className="font-semibold">Zugewiesener Trainer</div>
                <div className="text-gray-300">Trainer Sebastian</div>
              </div>
              <div>
                <div className="font-semibold">Gruppenmitglieder</div>
                <div className="text-gray-300">{group.memberCount || 3} Mitglieder</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Creation */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <Avatar 
            name={user?.name || 'Unknown User'} 
            avatarUrl={user?.avatarUrl} 
            role={user?.role || 'user'} 
            size="lg" 
          />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Was möchtest du teilen?"
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px]"
              rows={4}
            />
            
            {/* Media Previews */}
            {imagePreview && (
              <div className="mt-3 relative inline-block">
                <img src={imagePreview} alt="Preview" className="max-w-xs rounded-lg" />
                <button
                  onClick={removeMedia}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </div>
            )}
            
            {videoPreview && (
              <div className="mt-3 relative inline-block">
                <video src={videoPreview} controls className="max-w-xs rounded-lg" />
                <button
                  onClick={removeMedia}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </div>
            )}
            
            {/* Rich Text Toolbar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                  <Bold className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                  <Italic className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                  <Underline className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                  <Link className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded relative"
                >
                  <Smile className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                  <AtSign className="h-4 w-4" />
                </button>
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-80">
                    <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => addEmoji(emoji)}
                          className="p-1 hover:bg-gray-100 rounded text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="flex items-center text-gray-500 hover:text-gray-700 text-sm cursor-pointer">
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Bild
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                
                <label className="flex items-center text-gray-500 hover:text-gray-700 text-sm cursor-pointer">
                  <VideoIcon className="h-4 w-4 mr-1" />
                  Video
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
                
                <button className="flex items-center text-gray-500 hover:text-gray-700 text-sm">
                  <Paperclip className="h-4 w-4 mr-1" />
                  Datei
                </button>
                
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim() && !selectedImage && !selectedVideo}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Posten
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {allPosts.map((post) => (
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
                    {new Date(post.timestamp).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <p className="text-gray-800 mb-3">{post.content}</p>
                
                {/* Post Image */}
                {post.image && (
                  <div className="mb-3">
                    <img
                      src={post.image}
                      alt="Post content"
                      className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setViewingImage(post.image || null)}
                    />
                  </div>
                )}
                
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

      {/* Image Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-4xl p-4">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={viewingImage}
              alt="Enlarged post content"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {allPosts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Noch keine Beiträge in dieser Gruppe. Sei der Erste!
        </div>
      )}
    </div>
  )
}