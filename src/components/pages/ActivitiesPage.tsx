import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseService } from '../../lib/supabaseService'
import { 
  Clock, 
  Trophy, 
  CheckCircle, 
  FileText,
  Mic,
  Video,
  Users,
  Target,
} from 'lucide-react'

interface WeeklyProgress {
  monday: { tagesplan: boolean; feedback: boolean; meeting_or_reflection: boolean }
  tuesday: { tagesplan: boolean; feedback: boolean; meeting_or_reflection: boolean }
  wednesday: { tagesplan: boolean; feedback: boolean; meeting_or_reflection: boolean }
  thursday: { tagesplan: boolean; feedback: boolean; meeting_or_reflection: boolean }
  friday: { tagesplan: boolean; feedback: boolean; meeting_or_reflection: boolean }
}

export default function ActivitiesPage() {
  const { user } = useAuth()
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress>({
    monday: { tagesplan: false, feedback: false, meeting_or_reflection: false },
    tuesday: { tagesplan: false, feedback: false, meeting_or_reflection: false },
    wednesday: { tagesplan: false, feedback: false, meeting_or_reflection: false },
    thursday: { tagesplan: false, feedback: false, meeting_or_reflection: false },
    friday: { tagesplan: false, feedback: false, meeting_or_reflection: false }
  })
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [submissionText, setSubmissionText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [weeklyPoints, setWeeklyPoints] = useState(0)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWeeklyProgress()
  }, [user])

  const loadWeeklyProgress = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const weeklyActivities = await supabaseService.getWeeklyActivities(user.id)
      
      // Calculate weekly points
      const points = weeklyActivities.reduce((sum: number, activity: any) => sum + activity.points, 0)
      setWeeklyPoints(points)
      setActivities(weeklyActivities)
      
      // Update progress state based on activities
      const progress: WeeklyProgress = {
        monday: { tagesplan: false, feedback: false, meeting_or_reflection: false },
        tuesday: { tagesplan: false, feedback: false, meeting_or_reflection: false },
        wednesday: { tagesplan: false, feedback: false, meeting_or_reflection: false },
        thursday: { tagesplan: false, feedback: false, meeting_or_reflection: false },
        friday: { tagesplan: false, feedback: false, meeting_or_reflection: false }
      }
      
      // Map activities to days and types
      weeklyActivities.forEach((activity: any) => {
        const date = new Date(activity.createdAt)
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const dayName = dayNames[date.getDay()] as keyof WeeklyProgress
        
        if (progress[dayName]) {
          if (activity.type === 'tagesplan') {
            progress[dayName].tagesplan = true
          } else if (activity.type === 'feedback_voice' || activity.type === 'feedback_video') {
            progress[dayName].feedback = true
          } else if (activity.type === 'live_meeting' || activity.type === 'selbstreflexion') {
            progress[dayName].meeting_or_reflection = true
          }
        }
      })
      
      setWeeklyProgress(progress)
    } catch (error) {
      console.error('Error loading weekly progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitActivity = async (activityType: string, day: string) => {
    if (!user) return
    
    try {
      setUploading(true)
      
      const activityData = {
        day,
        content: submissionText,
        submittedAt: new Date().toISOString()
      }
      
      await supabaseService.submitActivity(user.id, activityType, activityData)
      
      setSelectedActivity(null)
      setSubmissionText('')
      await loadWeeklyProgress()
      
      alert('Aktivität erfolgreich eingereicht!')
    } catch (error) {
      console.error('Error submitting activity:', error)
      alert('Fehler beim Einreichen der Aktivität')
    } finally {
      setUploading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tagesplan': return <FileText className="h-5 w-5" />
      case 'feedback_voice': return <Mic className="h-5 w-5" />
      case 'feedback_video': return <Video className="h-5 w-5" />
      case 'live_meeting': return <Users className="h-5 w-5" />
      case 'selbstreflexion': return <Target className="h-5 w-5" />
      default: return <Clock className="h-5 w-5" />
    }
  }

  const getActivityPoints = (type: string) => {
    const pointValues = {
      'tagesplan': 2,
      'feedback_voice': 4,
      'feedback_video': 6,
      'live_meeting': 6,
      'selbstreflexion': 6,
      'entschuldigt': 1,
      'unentschuldigt': 0
    }
    return pointValues[type as keyof typeof pointValues] || 0
  }

  const dayRequirements = {
    tuesday: { tagesplan: true, feedback: true, meeting_or_reflection: false },
    wednesday: { tagesplan: true, feedback: true, meeting_or_reflection: false },
    thursday: { tagesplan: true, feedback: true, meeting_or_reflection: false },
    friday: { tagesplan: true, feedback: false, meeting_or_reflection: true }
  }

  const maxWeeklyPoints = 2 * 4 + 4 * 3 + 6 * 1 // Tagesplan (4x) + Feedback (3x) + Meeting/Reflection (1x) = 26 points

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Wöchentliche Aktivitäten</h1>
            <p className="text-primary-100">Sammle Punkte durch tägliche Trainingsaktivitäten</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{weeklyPoints}</div>
            <div className="text-primary-200 text-sm">/ {maxWeeklyPoints} Punkte</div>
            <div className="text-primary-200 text-xs">diese Woche</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-primary-800 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all" 
              style={{ width: `${Math.min((weeklyPoints / maxWeeklyPoints) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Points System Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Punktesystem</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: 'tagesplan', name: 'Tagesplan', points: 2, icon: FileText },
            { type: 'feedback_voice', name: 'Feedback Voice', points: 4, icon: Mic },
            { type: 'feedback_video', name: 'Feedback Video', points: 6, icon: Video },
            { type: 'live_meeting', name: 'Live Meeting', points: 6, icon: Users },
            { type: 'selbstreflexion', name: 'Selbstreflexion', points: 6, icon: Target },
            { type: 'entschuldigt', name: 'Entschuldigt', points: 1, icon: CheckCircle }
          ].map((activity) => (
            <div key={activity.type} className="text-center p-3 bg-gray-50 rounded-lg">
              <activity.icon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
              <div className="font-medium text-sm">{activity.name}</div>
              <div className="text-primary-600 font-bold">{activity.points} Punkte</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Wochenplan</h2>
        <div className="space-y-4">
          {Object.entries(dayRequirements).map(([day, requirements]) => {
            const dayProgress = weeklyProgress[day as keyof WeeklyProgress]
            const dayName = {
              tuesday: 'Dienstag',
              wednesday: 'Mittwoch', 
              thursday: 'Donnerstag',
              friday: 'Freitag'
            }[day]
            
            return (
              <div key={day} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{dayName}</h3>
                  <div className="flex items-center space-x-2">
                    {requirements.tagesplan && (
                      <div className={`p-2 rounded ${dayProgress?.tagesplan ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <FileText className="h-4 w-4" />
                      </div>
                    )}
                    {requirements.feedback && (
                      <div className={`p-2 rounded ${dayProgress?.feedback ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <Mic className="h-4 w-4" />
                      </div>
                    )}
                    {requirements.meeting_or_reflection && (
                      <div className={`p-2 rounded ${dayProgress?.meeting_or_reflection ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <Users className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {requirements.tagesplan && (
                    <button
                      onClick={() => setSelectedActivity(`tagesplan-${day}`)}
                      disabled={dayProgress?.tagesplan}
                      className={`p-3 rounded-lg border text-left ${
                        dayProgress?.tagesplan 
                          ? 'bg-green-50 border-green-200 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Tagesplan</span>
                        {dayProgress?.tagesplan ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <span className="text-primary-600 font-bold">2 Punkte</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {dayProgress?.tagesplan ? 'Abgeschlossen' : 'Tagesplan einreichen'}
                      </div>
                    </button>
                  )}
                  
                  {requirements.feedback && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedActivity(`feedback_voice-${day}`)}
                        disabled={dayProgress?.feedback}
                        className={`w-full p-3 rounded-lg border text-left ${
                          dayProgress?.feedback 
                            ? 'bg-green-50 border-green-200 cursor-not-allowed'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Voice Feedback</span>
                          {dayProgress?.feedback ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <span className="text-primary-600 font-bold">4 Punkte</span>
                          )}
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setSelectedActivity(`feedback_video-${day}`)}
                        disabled={dayProgress?.feedback}
                        className={`w-full p-3 rounded-lg border text-left ${
                          dayProgress?.feedback 
                            ? 'bg-green-50 border-green-200 cursor-not-allowed'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Video Feedback</span>
                          {dayProgress?.feedback ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <span className="text-primary-600 font-bold">6 Punkte</span>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                  
                  {requirements.meeting_or_reflection && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedActivity(`live_meeting-${day}`)}
                        disabled={dayProgress?.meeting_or_reflection}
                        className={`w-full p-3 rounded-lg border text-left ${
                          dayProgress?.meeting_or_reflection 
                            ? 'bg-green-50 border-green-200 cursor-not-allowed'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Live Meeting</span>
                          {dayProgress?.meeting_or_reflection ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <span className="text-primary-600 font-bold">6 Punkte</span>
                          )}
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setSelectedActivity(`selbstreflexion-${day}`)}
                        disabled={dayProgress?.meeting_or_reflection}
                        className={`w-full p-3 rounded-lg border text-left ${
                          dayProgress?.meeting_or_reflection 
                            ? 'bg-green-50 border-green-200 cursor-not-allowed'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Selbstreflexion</span>
                          {dayProgress?.meeting_or_reflection ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <span className="text-primary-600 font-bold">6 Punkte</span>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Aktuelle Aktivitäten</h2>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getActivityIcon(activity.type)}
                  <div>
                    <div className="font-medium">{activity.type.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(activity.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="font-bold text-primary-600">+{activity.points}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>Noch keine Aktivitäten diese Woche</p>
            <p className="text-sm">Beginnen Sie mit Ihrem ersten Tagesplan!</p>
          </div>
        )}
      </div>

      {/* Activity Submission Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {selectedActivity.split('-')[0].replace('_', ' ')} einreichen
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung oder Notizen
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  placeholder="Beschreiben Sie Ihre Aktivität..."
                />
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>Punkte für diese Aktivität:</span>
                <span className="font-bold text-primary-600">
                  +{getActivityPoints(selectedActivity.split('-')[0])} Punkte
                </span>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleSubmitActivity(
                  selectedActivity.split('-')[0], 
                  selectedActivity.split('-')[1]
                )}
                disabled={uploading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {uploading ? 'Wird eingereicht...' : 'Einreichen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}