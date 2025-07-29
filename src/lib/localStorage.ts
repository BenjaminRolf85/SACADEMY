import { 
  User, Group, Message, Conversation, Post, Activity, Quiz, Event, 
  Challenge, ForumPost, TermsVersion, Material, AdminStats
} from '../types'

class LocalStorageManager {
  readonly KEYS = {
    USERS: 'sales_academy_users',
    CURRENT_USER: 'sales_academy_current_user',
    GROUPS: 'sales_academy_groups',
    MESSAGES: 'sales_academy_messages',
    CONVERSATIONS: 'sales_academy_conversations',
    POSTS: 'sales_academy_posts', // Added missing key
    ACTIVITIES: 'sales_academy_activities', // Added missing key
    QUIZZES: 'sales_academy_quizzes',
    EVENTS: 'sales_academy_events',
    CHALLENGES: 'sales_academy_challenges',
    FORUM_POSTS: 'sales_academy_forum_posts',
    TERMS_VERSIONS: 'sales_academy_terms_versions'
  }

  constructor() {
    this.initializeData()
  }

  private initializeData() {
    if (!this.getItem(this.KEYS.USERS) || this.getUsers().length === 0) {
      this.initializeDummyData()
    }
  }

  private initializeDummyData() {
    const initialUsers: User[] = [
      {
        id: 'admin-1',
        email: 'admin@testsales.com',
        name: 'Admin User',
        role: 'admin',
        company: 'Sales Academy',
        position: 'System Administrator',
        status: 'active',
        points: 1000,
        level: 10,
        acceptedTerms: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'trainer-1',
        email: 'trainer@testsales.com',
        name: 'Trainer Sebastian',
        role: 'trainer',
        company: 'Sales Academy',
        position: 'Senior Sales Trainer',
        status: 'active',
        points: 850,
        level: 8,
        specializations: ['B2B Sales', 'Cold Calling', 'Negotiation'],
        trainerLevel: 3,
        acceptedTerms: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-1',
        email: 'user@testsales.com',
        name: 'Max Mustermann',
        role: 'user',
        company: 'TestCorp GmbH',
        position: 'Sales Representative',
        status: 'active',
        points: 450,
        level: 3,
        acceptedTerms: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ]
    this.setItem(this.KEYS.USERS, initialUsers)

    const initialGroups: Group[] = [
      {
        id: 'group-1',
        name: 'Advanced Sales Techniques',
        description: 'Master advanced sales strategies',
        memberCount: 15,
        trainer: 'Sebastian Bunde',
        trainerId: 'trainer-1',
        trainers: ['Sebastian Bunde'],
        trainerIds: ['trainer-1'],
        company: 'TestCorp GmbH',
        startDate: '2025-01-15',
        endDate: '2025-06-15',
        status: 'active',
        capacity: 20,
        members: ['Max Mustermann'],
        memberIds: ['user-1'],
        materials: []
      }
    ]
    this.setItem(this.KEYS.GROUPS, initialGroups)

    const initialPosts: Post[] = [
      {
        id: 'post-1',
        userId: 'user-1',
        userName: 'Max Mustermann',
        content: 'Great training session today!',
        timestamp: new Date().toISOString(),
        likes: 12,
        comments: 3,
        isLiked: false,
        status: 'approved'
      }
    ]
    this.setItem(this.KEYS.POSTS, initialPosts)

    this.setItem(this.KEYS.CONVERSATIONS, [])
    this.setItem(this.KEYS.MESSAGES, [])
    this.setItem(this.KEYS.QUIZZES, [])
    this.setItem(this.KEYS.EVENTS, [])
    this.setItem(this.KEYS.CHALLENGES, [])
    this.setItem(this.KEYS.FORUM_POSTS, [])
    this.setItem(this.KEYS.TERMS_VERSIONS, [])
  }

  private getItem<T>(key: string): T | null {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<User | null> {
    const users = this.getItem<User[]>(this.KEYS.USERS) || []
    
    if (password === 'demo123') {
      const user = users.find(u => u.email === email && u.status !== 'suspended')
      if (user) {
        user.lastLogin = new Date().toISOString()
        this.setItem(this.KEYS.USERS, users)
        this.setItem(this.KEYS.CURRENT_USER, user)
        return user
      }
    }
    
    return null
  }

  getCurrentUser(): User | null {
    return this.getItem<User>(this.KEYS.CURRENT_USER)
  }

  async logout(): Promise<void> {
    window.localStorage.removeItem(this.KEYS.CURRENT_USER)
  }

  // Add public methods for supabaseService to use
  public setItemPublic<T>(key: string, value: T): void {
    this.setItem(key, value)
  }

  public getKeys() {
    return this.KEYS
  }

  async register(email: string, userData: { fullName: string; company?: string; position?: string; role?: 'user' | 'trainer' | 'admin' }): Promise<User> { // Removed password parameter
    const users = this.getUsers()
    
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: userData.fullName,
      role: userData.role || 'user',
      company: userData.company || '',
      position: userData.position || '',
      status: 'active',
      points: 0,
      level: 1,
      acceptedTerms: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    this.setItem(this.KEYS.USERS, users)
    this.setItem(this.KEYS.CURRENT_USER, newUser)
    
    return newUser
  }

  // User methods
  getUsers(): User[] {
    return this.getItem<User[]>(this.KEYS.USERS) || []
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const users = this.getUsers()
    const userIndex = users.findIndex(u => u.id === userId)
    if (userIndex === -1) throw new Error('User not found')
    
    const updatedUser = { ...users[userIndex], ...updates }
    users[userIndex] = updatedUser
    this.setItem(this.KEYS.USERS, users)
    
    const currentUser = this.getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      this.setItem(this.KEYS.CURRENT_USER, updatedUser)
    }
    
    return updatedUser
  }

  // Group methods
  getGroups(): Group[] {
    return this.getItem<Group[]>(this.KEYS.GROUPS) || []
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<Group | null> {
    const groups = this.getGroups()
    const groupIndex = groups.findIndex(g => g.id === groupId)
    if (groupIndex === -1) return null

    groups[groupIndex] = { ...groups[groupIndex], ...updates }
    this.setItem(this.KEYS.GROUPS, groups)
    return groups[groupIndex]
  }

  // Post methods
  getPosts(): Post[] {
    return this.getItem<Post[]>(this.KEYS.POSTS) || []
  }

  getPost(postId: string): Post | null {
    const posts = this.getPosts()
    return posts.find(p => p.id === postId) || null
  }

  async createPost(content: string, image?: string): Promise<Post> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) throw new Error('No user logged in')

    const posts = this.getPosts()
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      content,
      image,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false,
      status: currentUser.role === 'admin' ? 'approved' : 'pending'
    }

    posts.unshift(newPost)
    this.setItem(this.KEYS.POSTS, posts)
    
    return newPost
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<Post | null> {
    const posts = this.getPosts()
    const postIndex = posts.findIndex(p => p.id === postId)
    if (postIndex === -1) return null

    posts[postIndex] = { ...posts[postIndex], ...updates }
    this.setItem(this.KEYS.POSTS, posts)
    return posts[postIndex]
  }

  async approvePost(postId: string): Promise<void> {
    const posts = this.getPosts()
    const postIndex = posts.findIndex(p => p.id === postId)
    if (postIndex !== -1) {
      posts[postIndex].status = 'approved'
      this.setItem(this.KEYS.POSTS, posts)
    }
  }

  async rejectPost(postId: string): Promise<void> {
    const posts = this.getPosts()
    const postIndex = posts.findIndex(p => p.id === postId)
    if (postIndex !== -1) {
      posts[postIndex].status = 'rejected'
      this.setItem(this.KEYS.POSTS, posts)
    }
  }

  // Other methods
  getQuizzes(): Quiz[] {
    return this.getItem<Quiz[]>(this.KEYS.QUIZZES) || []
  }

  getEvents(): Event[] {
    return this.getItem<Event[]>(this.KEYS.EVENTS) || []
  }

  getChallenges(): Challenge[] {
    return this.getItem<Challenge[]>(this.KEYS.CHALLENGES) || []
  }

  getForumPosts(): ForumPost[] {
    return this.getItem<ForumPost[]>(this.KEYS.FORUM_POSTS) || []
  }

  getTermsVersions(): TermsVersion[] {
    return this.getItem<TermsVersion[]>(this.KEYS.TERMS_VERSIONS) || []
  }

  getMaterials(): Material[] {
    const groups = this.getGroups()
    const materials: Material[] = []
    groups.forEach(group => {
      if (group.materials) {
        materials.push(...group.materials)
      }
    })
    return materials
  }

  getConversations(): Conversation[] {
    return this.getItem<Conversation[]>(this.KEYS.CONVERSATIONS) || []
  }

  getMessages(conversationId: string): Message[] {
    const messages = this.getItem<Message[]>(this.KEYS.MESSAGES) || []
    return messages.filter(m => m.conversationId === conversationId)
  }

  getAdminStats(): AdminStats {
    const users = this.getUsers()
    const groups = this.getGroups()
    const events = this.getEvents()
    const posts = this.getPosts()
    
    return {
      totalUsers: users.length,
      activeTrainers: users.filter(u => u.role === 'trainer' && u.status === 'active').length,
      totalGroups: groups.length,
      pendingApprovals: posts.filter(p => p.status === 'pending').length,
      activeEvents: events.filter(e => new Date(e.startDate) > new Date()).length,
      completedQuizzes: 0,
      pendingQuizzes: 0
    }
  }

  getRecentActivities(): Activity[] {
    const posts = this.getPosts()
    const activities: Activity[] = []

    posts.slice(0, 5).forEach(post => {
      activities.push({
        id: `activity-${post.id}`,
        userId: post.userId,
        userName: post.userName,
        type: 'new_post',
        points: 10,
        createdAt: post.timestamp
      })
    })

    return activities
  }
}

export const localStorage = new LocalStorageManager()