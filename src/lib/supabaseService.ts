import { localStorage as customLocalStorage } from './localStorage'
import { User, Group, Post } from '../types'
import { supabase } from './supabase'

class SupabaseService {
  private storage = customLocalStorage

  // Authentication
  async signUp(email: string, _password: string, userData: { 
    name: string
    role: 'user' | 'trainer' | 'admin' // Keep password for signup, but localStorage register doesn't use it
    company?: string
    position?: string 
  }) {
    // Use localStorage for demo mode
    return this.storage.register(email, {
      fullName: userData.name,
      company: userData.company,
      position: userData.position,
      role: userData.role
    })
  }

  async signUpWithSupabase(email: string, password: string, userData: { 
    name: string
    role: 'user' | 'trainer' | 'admin'
    company?: string
    position?: string 
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          company: userData.company,
          position: userData.position
        }
      }
    })
    
    if (error) throw error
    return data
  }

  async signIn(email: string, password: string) {
    // Use localStorage for demo mode
    return this.storage.login(email, password)
  }

  async signInWithSupabase(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  async signOut() {
    // Use localStorage for demo mode
    return this.storage.logout()
  }

  async signOutWithSupabase() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Points and Activities System
  async updateUserPoints(userId: string, pointsToAdd: number, activityType: string, activityData?: any) {
    try {
      const users = customLocalStorage.getUsers()
      const userIndex = users.findIndex(u => u.id === userId)
      if (userIndex === -1) throw new Error('User not found')
      
      const user = users[userIndex]
      const newPoints = (user.points || 0) + pointsToAdd
      const newLevel = Math.floor(newPoints / 200) + 1 // Level up every 200 points
      
      // Update user points and level
      users[userIndex] = {
        ...user,
        points: newPoints,
        level: newLevel
      }
      
      // Save activity record using setItemPublic
      const currentActivities = this.getActivities()
      const newActivity = {
        id: `activity-${Date.now()}`,
        userId,
        userName: user.name,
        type: activityType,
        points: pointsToAdd,
        data: activityData,
        createdAt: new Date().toISOString()
      }
      currentActivities.unshift(newActivity) // Add to beginning for recent activities
      
      this.storage.setItemPublic(this.storage.getKeys().USERS, users)
      this.storage.setItemPublic(this.storage.getKeys().ACTIVITIES, currentActivities)

      console.log('✅ Updated user points:', userId, '+', pointsToAdd, 'points for', activityType)
      return { user: users[userIndex], activity: newActivity }
    } catch (error) {
      console.error('Error updating user points:', error)
      throw error
    }
  }

  private setData(key: string, value: any) { // This method is correct
    const keyMap = {
      'USERS': 'sales_academy_users',
      'ACTIVITIES': 'sales_academy_activities',
      'POSTS': 'sales_academy_posts',
      'GROUPS': 'sales_academy_groups'
    }
    const storageKey = keyMap[key as keyof typeof keyMap] // Use keyMap to get the actual localStorage key
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(value))
    }
  }

  async submitActivity(userId: string, activityType: string, activityData: any) {
    const pointValues = {
      'tagesplan': 2,
      'feedback_voice': 4,
      'feedback_video': 6,
      'live_meeting': 6,
      'selbstreflexion': 6,
      'entschuldigt': 1,
      'unentschuldigt': 0
    }
    
    const points = pointValues[activityType as keyof typeof pointValues] || 0
    return this.updateUserPoints(userId, points, activityType, activityData)
  }

  getActivities() {
    try {
      const activities = JSON.parse(localStorage.getItem('sales_academy_activities') || '[]')
      return activities
    } catch {
      return []
    }
  }

  async getUserActivities(userId: string) {
    const activities = this.getActivities()
    return activities.filter((activity: any) => activity.userId === userId)
  }

  async getWeeklyActivities(userId: string) {
    const activities = await this.getUserActivities(userId)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    return activities.filter((activity: any) => 
      new Date(activity.createdAt) >= oneWeekAgo
    )
  }

  async createTrainer(trainerData: Omit<User, 'id'>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        ...trainerData,
        role: 'trainer'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile
  }

  // Profiles
  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateUser(userId: string, updates: Partial<User>) {
    try {
      const users = customLocalStorage.getUsers()
      const userIndex = users.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates }
        this.setData('USERS', users) // Use setData
      this.storage.setItemPublic(this.storage.getKeys().USERS, users)
        return users[userIndex]
      }
      throw new Error('User not found')
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }
  async getUsers() {
    try {
      const users = customLocalStorage.getUsers()
      console.log('📊 Loaded users from localStorage:', users.length)
      
      // If no users found, initialize default data
      if (users.length === 0) {
        console.log('⚠️ No users found, initializing default data...')
        // Return empty array and let the component handle reloading
        return []
      }
      
      return users
    } catch (error) {
      console.error('Error getting users:', error)
      return []
    }
  }

  // Groups
  async getGroups() {
    try {
      const groups = customLocalStorage.getGroups()
      console.log('📊 Loaded groups:', groups.length)
      return groups
    } catch (error) {
      console.error('Error getting groups:', error)
      return []
    }
  }

  async getUserGroups(userId: string, userRole: string) {
    try {
      const allGroups = customLocalStorage.getGroups() || []
      console.log('📊 All groups:', allGroups.length, 'for user:', userId, 'role:', userRole)
      
      // For testing, show all groups for now
      if (userRole === 'admin') {
        console.log('👑 Admin user - showing all groups')
        return allGroups
      }
      
      // For trainers, show groups they are assigned to
      if (userRole === 'trainer') {
        const trainerGroups = allGroups.filter(group => 
          group.trainerId === userId || group.trainerIds?.includes(userId)
        )
        console.log('👨‍🏫 Trainer groups:', trainerGroups.length)
        return trainerGroups
      }
      
      // For users, show only the ONE group they are enrolled in
      let filteredGroups = allGroups.filter(group => {
        return group.memberIds?.includes(userId) || group.members?.includes(userId)
      })

      // Users should only be in ONE group max
      if (filteredGroups.length > 1) {
        console.log('⚠️ User in multiple groups, showing only first one')
        filteredGroups = [filteredGroups[0]]
      }

      console.log('📊 Filtered groups for user:', filteredGroups.length)
      return filteredGroups
    } catch (error) {
      console.error('Error getting user groups:', error)
      return []
    }
  }

  async createGroup(groupData: Omit<Group, 'id'>) {
    const { data, error } = await supabase
      .from('groups')
      .insert(groupData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateGroup(groupId: string, updates: Partial<Group>) {
    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteGroup(groupId: string) {
    const groups = customLocalStorage.getGroups()
    const filteredGroups = groups.filter(g => g.id !== groupId)
    this.setData('GROUPS', filteredGroups) // Use setData
  }

  async deleteUser(userId: string) {
    const users = customLocalStorage.getUsers()
    const filteredUsers = users.filter(u => u.id !== userId)
    this.setData('USERS', filteredUsers)
  }

  async joinGroup(groupId: string, userId: string) {
    const { data, error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async assignTrainer(groupId: string, trainerId: string) {
    const { data, error } = await supabase
      .from('group_trainers')
      .insert({ group_id: groupId, trainer_id: trainerId })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Posts
  async getPosts() {
    try {
      const posts = customLocalStorage.getPosts() || []
      console.log('📊 Loaded posts:', posts.length)
      return posts
    } catch (error) {
      console.error('Error getting posts:', error)
      return []
    }
  }

  async getGroupPosts(groupId: string) {
    try {
      const allPosts = customLocalStorage.getPosts() || []
      const groupPosts = allPosts.filter(post => 
        post.groupId === groupId && post.status === 'approved'
      )
      console.log('📊 Loaded group posts for', groupId, ':', groupPosts.length)
      return groupPosts
    } catch (error) {
      console.error('Error getting group posts:', error)
      return []
    }
  }

  async createPost(content: string, userId: string, groupId?: string, imageUrl?: string, videoUrl?: string) {
    try {
      const posts = customLocalStorage.getPosts() || []
      const users = customLocalStorage.getUsers()
      const user = users.find(u => u.id === userId)
      
      const newPost = {
        id: `post-${Date.now()}`,
        userId,
        userName: user?.name || 'Unknown User',
        content,
        image: imageUrl,
        video: videoUrl,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        isLiked: false,
        groupId,
        status: 'approved' as const,
        likedBy: []
      }
      posts.unshift(newPost) // Add to beginning for recent posts // Use setData
      this.setData('POSTS', posts)
      console.log('✅ Created post:', newPost.id)
      return newPost
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  async approvePost(postId: string) {
    try {
      const posts = customLocalStorage.getPosts() || []
      const postIndex = posts.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts[postIndex].status = 'approved' as const // Use setData
        this.setData('POSTS', posts)
        console.log('✅ Approved post:', postId)
        return posts[postIndex]
      }
      throw new Error('Post not found')
    } catch (error) {
      console.error('Error approving post:', error)
      throw error
    }
  }

  async rejectPost(postId: string) {
    try {
      const posts = customLocalStorage.getPosts() || []
      const postIndex = posts.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts[postIndex].status = 'rejected' as const // Use setData
        this.setData('POSTS', posts)
        console.log('❌ Rejected post:', postId)
        return posts[postIndex]
      }
      throw new Error('Post not found')
    } catch (error) {
      console.error('Error rejecting post:', error)
      throw error
    }
  }

  async likePost(postId: string, userId: string) {
    try {
      const posts = this.storage.getPosts() || []
      const postIndex = posts.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        const post = posts[postIndex]
        const extendedPost = post as Post & { likedBy?: string[] }
        const likedBy = extendedPost.likedBy || []
        
        if (likedBy.includes(userId)) {
          // Unlike
          extendedPost.likedBy = likedBy.filter((id: string) => id !== userId)
          post.likes = Math.max(0, (post.likes || 0) - 1)
          post.isLiked = false
          console.log('👎 Unliked post:', postId)
        } else {
          // Like
          extendedPost.likedBy = [...likedBy, userId]
          post.likes = (post.likes || 0) + 1
          post.isLiked = true
          console.log('👍 Liked post:', postId)
        }
        this.setData('POSTS', posts)
        return post
      }
      throw new Error('Post not found')
    } catch (error) {
      console.error('Error liking post:', error)
      throw error
    }
  }

  // Messaging
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants(
          user_id,
          profiles(name)
        ),
        messages(
          content,
          created_at
        )
      `)
      .eq('conversation_participants.user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createConversation(participantIds: string[], type: string, title?: string) {
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        title: title || 'New Conversation',
        type,
        created_by: participantIds[0]
      })
      .select()
      .single()

    if (convError) throw convError

    // Add participants
    const participants = participantIds.map(userId => ({
      conversation_id: conversation.id,
      user_id: userId
    }))

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants)

    if (participantsError) throw participantsError

    return conversation
  }

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles(name)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content
      })
      .select()
      .single()

    if (error) throw error

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data
  }

  // Materials
  async uploadMaterial(file: File, groupId: string, uploadedBy: string) {
    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('materials')
      .getPublicUrl(fileName)

    // Save material record
    const { data, error } = await supabase
      .from('materials')
      .insert({
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : file.type.includes('video') ? 'video' : 'link',
        url: publicUrl,
        file_path: fileName,
        group_id: groupId,
        uploaded_by: uploadedBy
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getMaterials(groupId: string) {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('group_id', groupId)
      .order('upload_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Real-time subscriptions
  subscribeToMessages(conversationId: string, callback: (message: any) => void) {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        callback
      )
      .subscribe()
  }

  subscribeToPostUpdates(callback: (post: any) => void) {
    return supabase
      .channel('posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        callback
      )
      .subscribe()
  }
}

export const supabaseService = new SupabaseService()