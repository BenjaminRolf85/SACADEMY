export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'trainer' | 'admin'
  company?: string | null
  position?: string
  bio?: string
  phone?: string
  location?: string
  avatarUrl?: string
  status?: 'active' | 'suspended' | 'expired'
  points?: number
  level?: number
  specializations?: string[]
  trainerLevel?: number
  acceptedTerms?: boolean
  lastLogin?: string
  createdAt: string
  groups?: { id: string; name: string; trainer?: string; memberCount?: number; }[]
  access_expires_at?: string | null
  is_suspended?: boolean
}

export interface Group {
  id: string
  name: string
  description: string
  memberCount: number
  trainer?: string
  trainerId?: string
  trainers?: string[]
  trainerIds?: string[]
  company?: string
  startDate?: string
  endDate?: string
  status: 'active' | 'completed' | 'upcoming'
  capacity?: number
  materials?: Material[]
  members?: string[]
  memberIds?: string[]
}

export interface Material {
  id: string
  name: string
  type: 'pdf' | 'video' | 'link' | 'quiz' | 'image'
  url: string
  uploadDate: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  totalPoints: number
  passingScore: number
  timeLimit?: number
  feedback?: string
  createdBy?: string
  createdAt: string
  groupId?: string
  completed?: number
  rating?: number
  attempts?: number
  status?: 'active' | 'draft' | 'archived' | 'completed'
  courseName?: string
}

export interface QuizQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'short_answer'
  options?: string[]
  correctAnswer: string | number
  points: number
  feedback?: string
}

export interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  trainer: string
  trainerId: string
  groupId?: string
  capacity: number
  attendees: string[]
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: string
  }
  materials?: string[]
  members?: string[]
  memberIds?: string[]
}

export interface Challenge {
  id: string
  title: string
  description: string
  points: number
  deadline: string
  type: 'individual' | 'group'
  submissions: ChallengeSubmission[]
  createdBy: string
  createdAt: string
  groupId?: string
}

export interface ChallengeSubmission {
  id: string
  challengeId: string
  userId: string
  userName: string
  content: string
  attachments?: string[]
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  feedback?: string
  score?: number
}

export interface ForumPost {
  id: string
  title: string
  content: string
  userId: string
  userName: string
  groupId?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  replies: ForumReply[]
  likes: number
  isLiked: boolean
}

export interface ForumReply {
  id: string
  postId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export interface Survey {
  id: string
  title: string
  description: string
  questions: SurveyQuestion[]
  createdBy: string
  createdAt: string
  groupId?: string
  status: 'active' | 'draft' | 'completed'
  responses: SurveyResponse[]
}

export interface SurveyQuestion {
  id: string
  question: string
  type: 'radio' | 'checkbox' | 'scale' | 'text' | 'email'
  options?: string[]
  scaleMin?: number
  scaleMax?: number
  scaleLabels?: { min: string; max: string }
  required: boolean
}

export interface SurveyResponse {
  id: string
  surveyId: string
  userId: string
  userName: string
  answers: { [questionId: string]: any }
  submittedAt: string
  email?: string
}

export interface TermsVersion {
  id: string
  version: string
  title: string
  content: string
  createdAt: string
  isActive: boolean
  acceptances: TermsAcceptance[]
}

export interface TermsAcceptance {
  id: string
  userId: string
  termsVersionId: string
  acceptedAt: string
  ipAddress: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  type?: 'text' | 'file' | 'system'
  attachments?: string[]
}

export interface Conversation {
  id: string
  participants: string[]
  participantNames: string[]
  title: string
  type: 'direct' | 'group' | 'support' | 'trainer'
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  priority?: 'low' | 'medium' | 'high'
}

export interface Post {
  id: string
  userId: string
  userName: string
  content: string
  image?: string | null
  video?: string
  timestamp: string
  likes: number
  comments: number
  isLiked: boolean
  groupId?: string
  status: 'pending' | 'approved' | 'rejected'
  likedBy?: string[]
  commentsData?: Array<{
    id: string
    userName: string
    content: string
    timestamp: string
  }>
  isTrainer?: boolean
}


export interface LoginForm {
  email: string
  password: string
}

export interface AdminStats {
  totalUsers: number
  activeTrainers: number
  totalGroups: number
  pendingApprovals: number
  activeEvents: number
  completedQuizzes: number
  pendingQuizzes: number
}

export interface Activity {
  id: string
  userId: string
  userName: string
  type: 'tagesplan' | 'feedback_voice' | 'feedback_video' | 'live_meeting' | 'selbstreflexion' | 'entschuldigt' | 'unentschuldigt' | 'new_post' | 'new_member' | 'achievement' | 'message' | 'quiz_completed' | 'event_created'
  points: number
  data?: any
  createdAt: string
  user?: string
  action?: string
  time?: string
  icon?: string
  color?: string
  details?: any
}

export interface WeeklyRequirement {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
  activities: string[]
  completed: boolean
}

export interface WeeklyProgress {
  userId: string
  weekStart: string
  activities: {
    [day: string]: {
      tagesplan?: boolean
      feedback?: boolean
      meeting_or_reflection?: boolean
    }
  }
  totalPoints: number
  completed: boolean
}