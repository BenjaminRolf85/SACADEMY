// import { useState } from 'react' // useState is not used in this component
import { Group } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { Trophy, Calendar, CheckCircle, Clock, Target } from 'lucide-react'

interface GroupChallengesProps {
  group: Group
}

interface Challenge {
  id: string
  title: string
  description: string
  points: number
  deadline: string
  status: 'active' | 'completed' | 'expired'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  submissions?: number
  maxSubmissions?: number
}

export default function GroupChallenges({ group }: GroupChallengesProps) {
  const { user: _user } = useAuth()  // eslint-disable-line @typescript-eslint/no-unused-vars
  
  // Mock challenges for demonstration
  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'AI Training Challenge',
      description: 'Submit the weekly AI Training.',
      points: 100,
      deadline: '2025-05-13',
      status: 'completed',
      difficulty: 'intermediate'
    },
    {
      id: '2',
      title: 'Test Challenge',
      description: 'Complete the monthly assessment test and score above 80%.',
      points: 100,
      deadline: '2025-05-26',
      status: 'completed',
      difficulty: 'beginner'
    },
    {
      id: '3',
      title: 'Cold Calling Mastery',
      description: 'Complete 50 successful cold calls with at least 20% conversion rate.',
      points: 150,
      deadline: '2025-06-30',
      status: 'active',
      difficulty: 'advanced',
      submissions: 35,
      maxSubmissions: 50
    },
    {
      id: '4',
      title: 'Client Presentation Excellence',
      description: 'Deliver a perfect client presentation and get approval from trainer.',
      points: 200,
      deadline: '2025-06-15',
      status: 'active',
      difficulty: 'advanced'
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'expired': return <Clock className="h-5 w-5 text-red-600" />
      case 'active': return <Target className="h-5 w-5 text-blue-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
            Kursinhalt & Übungen
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Gruppe: {group.name}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Bearbeiten Sie Kursübungen und Aufgaben als Teil Ihres Trainings
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
          Alle Herausforderungen
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
          Aktive Herausforderungen
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
          Beendete Herausforderungen
        </button>
      </div>

      {/* Active Challenges */}
      <div className="space-y-4">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  {getStatusIcon(challenge.status)}
                  <h4 className="text-lg font-semibold text-gray-900">{challenge.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  {challenge.status === 'completed' && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      Herausforderung beendet
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4">{challenge.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-primary-600">{challenge.points} Points</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {challenge.status === 'completed' ? 'Beendet am' : 'Beendet am'} {new Date(challenge.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {challenge.submissions && challenge.maxSubmissions && (
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>{challenge.submissions}/{challenge.maxSubmissions} abgeschlossen</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar for Active Challenges */}
                {challenge.status === 'active' && challenge.submissions && challenge.maxSubmissions && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${(challenge.submissions / challenge.maxSubmissions) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ml-6 flex flex-col items-end">
                {challenge.status === 'completed' ? (
                  <div className="text-center">
                    <div className="text-sm text-green-600 font-medium mb-1">✓ Herausforderung beendet</div>
                  </div>
                ) : (
                  <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                    Herausforderung beendet
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {challenges.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Herausforderungen verfügbar</h3>
          <p className="text-gray-500">Ihr Trainer hat noch keine Herausforderungen für diese Gruppe erstellt.</p>
        </div>
      )}
    </div>
  )
}