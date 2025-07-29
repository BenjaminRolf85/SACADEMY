import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import TrainerMaterialsPage from './TrainerMaterialsPage'
import { Group } from '../../types'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Award,
  TrendingUp,
  Plus,
  ChevronDown,
  FileText,
  Heart,
  MessageCircle,
  Settings,
  BarChart3,
  Target,
  Edit,
  Eye
} from 'lucide-react'

export default function TrainerDashboard() {
  const { user } = useAuth()
  const [selectedCourse, setSelectedCourse] = useState<Group | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'verwaltung' | 'feed' | 'materials' | 'quiz-management' | 'analytics'>('dashboard')
  const [loading, setLoading] = useState(true)
  const [showCourseSelector, setShowCourseSelector] = useState(false)

  // Mock trainer courses data
  const trainerCourses: Group[] = [
    {
      id: 'course-1',
      name: 'Advanced Sales Techniques',
      description: 'Master advanced sales strategies and closing techniques',
      memberCount: 15,
      trainerId: user?.id || '',
      trainer: user?.name || '',
      status: 'active',
      capacity: 20,
      startDate: '2025-01-15',
      endDate: '2025-03-15',
      materials: [
        { id: 'm1', name: 'Sales Psychology Guide', type: 'pdf', url: '/materials/sales-psychology.pdf', uploadDate: '2025-01-15T10:00:00Z' },
        { id: 'm2', name: 'Closing Techniques Video', type: 'video', url: '/materials/closing-video.mp4', uploadDate: '2025-01-16T14:00:00Z' },
        { id: 'm3', name: 'Industry Research', type: 'link', url: 'https://sales-research.com', uploadDate: '2025-01-17T09:00:00Z' }
      ],
      members: ['Max Mustermann', 'Anna Schmidt', 'John Doe', 'Maria Garcia', 'Alex Johnson'],
      memberIds: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5']
    },
    {
      id: 'course-2',
      name: 'Digital Sales Mastery',
      description: 'Learn modern digital sales channels and techniques',
      memberCount: 12,
      trainerId: user?.id || '',
      trainer: user?.name || '',
      status: 'active',
      capacity: 18,
      startDate: '2025-01-20',
      endDate: '2025-04-20',
      materials: [
        { id: 'm4', name: 'Digital Sales Handbook', type: 'pdf', url: '/materials/digital-sales.pdf', uploadDate: '2025-01-20T10:00:00Z' },
        { id: 'm5', name: 'CRM Best Practices', type: 'video', url: '/materials/crm-video.mp4', uploadDate: '2025-01-21T14:00:00Z' }
      ],
      members: ['Lisa Weber', 'Tom Schmidt', 'Sarah Mueller', 'David Brown'],
      memberIds: ['user-6', 'user-7', 'user-8', 'user-9']
    },
    {
      id: 'course-3',
      name: 'Customer Relationship Excellence',
      description: 'Build lasting customer relationships and maximize retention',
      memberCount: 8,
      trainerId: user?.id || '',
      trainer: user?.name || '',
      status: 'upcoming',
      capacity: 15,
      startDate: '2025-02-01',
      endDate: '2025-05-01',
      materials: [
        { id: 'm6', name: 'Customer Psychology', type: 'pdf', url: '/materials/customer-psychology.pdf', uploadDate: '2025-01-25T10:00:00Z' }
      ],
      members: ['Emma Wilson', 'James Taylor', 'Sophie Anderson'],
      memberIds: ['user-10', 'user-11', 'user-12']
    }
  ]

  const [courses] = useState<Group[]>(trainerCourses)

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0])
    }
    setLoading(false)
  }, [])

  // Mock posts from students
  const mockPosts = [
    {
      id: 'post-1',
      userId: 'user-1',
      userName: 'Max Mustermann',
      content: 'Großartiges Training heute! Die neuen Verkaufstechniken haben mir sehr geholfen. 🚀',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 8,
      comments: 2,
      isLiked: false,
      groupId: selectedCourse?.id || 'course-1',
      status: 'approved' as const
    },
    {
      id: 'post-2',
      userId: 'user-2',
      userName: 'Anna Schmidt',
      content: 'Frage: Wie wende ich die ABC-Analyse bei der Kundenpriorisierung an? 🤔',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      likes: 12,
      comments: 5,
      isLiked: false,
      groupId: selectedCourse?.id || 'course-1',
      status: 'approved' as const
    }
  ]

  // Mock analytics data
  const analyticsData = {
    totalStudents: courses.reduce((sum, course) => sum + course.memberCount, 0),
    activeCourses: courses.filter(c => c.status === 'active').length,
    completionRate: 87,
    avgRating: 4.6,
    thisWeekEngagement: 23,
    materialsShared: courses.reduce((sum, course) => sum + (course.materials?.length || 0), 0)
  }

  const upcomingEvents = [
    {
      id: 'event-1',
      title: 'Sales Workshop Session',
      course: selectedCourse?.name || 'Advanced Sales Techniques',
      date: '2025-01-28',
      time: '14:00',
      attendees: selectedCourse?.memberCount || 15
    },
    {
      id: 'event-2',
      title: 'Q&A Session',
      course: 'Digital Sales Mastery',
      date: '2025-01-30',
      time: '16:00',
      attendees: 12
    }
  ]

  const handleCourseSelect = (course: Group) => {
    setSelectedCourse(course)
    setShowCourseSelector(false)
    setActiveTab('dashboard')
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gesamt Studierende</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive Kurse</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.activeCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bewertung</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.avgRating}⭐</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abschlussrate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Aktuelle Beiträge</h3>
          <div className="space-y-4">
            {mockPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="border-l-4 border-primary-500 pl-4">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-sm">{post.userName}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{post.content}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Kommende Termine</h3>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-secondary-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <p className="text-xs text-gray-600">{event.course}</p>
                  <p className="text-xs text-gray-500">{event.date} • {event.time}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{event.attendees}</div>
                  <div className="text-xs text-gray-500">Teilnehmer</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderKursVerwaltung = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Kurs-Verwaltung</h3>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="h-5 w-5 mr-2" />
          Neuen Kurs erstellen
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Studierende:</span>
                    <span className="font-medium">{course.memberCount}/{course.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'active' ? 'bg-green-100 text-green-800' :
                      course.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status === 'active' ? 'Aktiv' : 
                       course.status === 'upcoming' ? 'Geplant' : 'Abgeschlossen'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Materialien:</span>
                    <span className="font-medium">{course.materials?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCourse(course)}
                className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
              >
                Verwalten
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                <Edit className="h-4 w-4" />
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderFeed = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Kurs-Feed: {selectedCourse?.name}</h3>
        
        <div className="space-y-4">
          {mockPosts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                  {post.userName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{post.userName}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-3">{post.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </span>
                    <button className="text-primary-600 hover:text-primary-700">
                      Antworten
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMaterials = () => (
    <TrainerMaterialsPage />
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Kurs-Analytics: {selectedCourse?.name}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analyticsData.completionRate}%</div>
            <div className="text-sm text-gray-600">Abschlussrate</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analyticsData.thisWeekEngagement}</div>
            <div className="text-sm text-gray-600">Aktivitäten diese Woche</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{analyticsData.avgRating}</div>
            <div className="text-sm text-gray-600">Durchschnittsbewertung</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="font-semibold mb-4">Studierenden-Fortschritt</h4>
        <div className="space-y-3">
          {selectedCourse?.members?.slice(0, 5).map((member, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {member.charAt(0)}
                </div>
                <span className="font-medium">{member}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{Math.floor(Math.random() * 40 + 60)}%</span>
              </div>
            </div>
          )) || []}
        </div>
      </div>
    </div>
  )

  const renderQuizManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Quiz-Verwaltung: {selectedCourse?.name}</h3>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="h-5 w-5 mr-2" />
          Neues Quiz erstellen
        </button>
      </div>

      {/* Quiz Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">5</div>
            <div className="text-sm text-gray-600">Aktive Quizzes</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">87%</div>
            <div className="text-sm text-gray-600">Ø Erfolgsrate</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">142</div>
            <div className="text-sm text-gray-600">Abgeschlossen</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">4.6</div>
            <div className="text-sm text-gray-600">Ø Bewertung</div>
          </div>
        </div>
      </div>

      {/* Quiz List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="font-semibold mb-4">Quizzes für {selectedCourse?.name}</h4>
        <div className="space-y-4">
          {[
            {
              id: 'quiz-1',
              title: 'Sales Fundamentals Assessment',
              description: 'Test basic sales knowledge and techniques',
              questions: 15,
              completions: 12,
              avgScore: 85,
              status: 'active'
            },
            {
              id: 'quiz-2',
              title: 'Advanced Negotiation Skills',
              description: 'Master the art of negotiation in sales',
              questions: 12,
              completions: 8,
              avgScore: 78,
              status: 'active'
            },
            {
              id: 'quiz-3',
              title: 'Customer Relationship Management',
              description: 'Learn to build lasting customer relationships',
              questions: 10,
              completions: 15,
              avgScore: 92,
              status: 'completed'
            }
          ].map((quiz) => (
            <div key={quiz.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h5 className="font-medium text-gray-900">{quiz.title}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      quiz.status === 'active' ? 'bg-green-100 text-green-800' :
                      quiz.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quiz.status === 'active' ? 'Aktiv' : 
                       quiz.status === 'completed' ? 'Abgeschlossen' : 'Entwurf'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{quiz.questions} Fragen</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{quiz.completions} Abschlüsse</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Award className="h-4 w-4 mr-2" />
                      <span>Ø {quiz.avgScore}% Score</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Target className="h-4 w-4 mr-2" />
                      <span>{Math.floor(quiz.avgScore/10)} Level</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md" title="Quiz bearbeiten">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-md" title="Ergebnisse anzeigen">
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-md" title="Quiz-Einstellungen">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Quick Results Preview */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-medium text-green-800">Bestanden</div>
                    <div className="text-green-600">{Math.floor(quiz.completions * 0.8)} Studierende</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="font-medium text-orange-800">Durchgefallen</div>
                    <div className="text-orange-600">{Math.floor(quiz.completions * 0.2)} Studierende</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-medium text-blue-800">Ausstehend</div>
                    <div className="text-blue-600">{(selectedCourse?.memberCount || 15) - quiz.completions} Studierende</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard()
      case 'verwaltung': return renderKursVerwaltung()
      case 'feed': return renderFeed()
      case 'materials': return renderMaterials()
      case 'quiz-management': return renderQuizManagement()
      case 'analytics': return renderAnalytics()
      default: return renderDashboard()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Course Selector */}
      <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Trainer Dashboard</h1>
            <p className="text-secondary-100">Willkommen zurück, {user?.name}!</p>
          </div>
          
          {/* Course Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCourseSelector(!showCourseSelector)}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">
                {selectedCourse ? selectedCourse.name : 'Kurs auswählen'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showCourseSelector && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-10">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Ihre Kurse ({courses.length})</h3>
                  <div className="space-y-2">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => handleCourseSelect(course)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedCourse?.id === course.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{course.name}</h4>
                            <p className="text-sm text-gray-600">{course.memberCount} Studierende</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            course.status === 'active' ? 'bg-green-100 text-green-800' :
                            course.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {course.status === 'active' ? 'Aktiv' : 
                             course.status === 'upcoming' ? 'Geplant' : 'Abgeschlossen'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'verwaltung', name: 'Kurs-Verwaltung', icon: Settings },
              { id: 'feed', name: 'Kurs-Feed', icon: MessageSquare },
              { id: 'materials', name: 'Materialien', icon: BookOpen },
              { id: 'quiz-management', name: 'Quiz-Verwaltung', icon: FileText },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-secondary-500 text-secondary-600'
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
    </div>
  )
}