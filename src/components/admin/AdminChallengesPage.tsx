import { useState, useEffect } from 'react'
import { supabaseService } from '../../lib/supabaseService'
import { Trophy, Plus, Edit, Trash2, X, Save, Target, Calendar, Users } from 'lucide-react'
import { Group } from '../../types'

interface Challenge {
  id: string
  title: string
  description: string
  points: number
  deadline: string
  type: 'individual' | 'group'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'active' | 'completed' | 'archived'
  createdBy: string
  createdByName: string
  createdAt: string
  groupId?: string
  groupName?: string
  submissions: ChallengeSubmission[]
  maxSubmissions?: number
}

interface ChallengeSubmission {
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

interface ChallengeFormData {
  title: string
  description: string
  points: number
  deadline: string
  type: 'individual' | 'group'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  groupId: string
  maxSubmissions?: number
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all')
  
  const [challengeForm, setChallengeForm] = useState<ChallengeFormData>({
    title: '',
    description: '',
    points: 100,
    deadline: '',
    type: 'individual',
    difficulty: 'intermediate',
    groupId: '',
    maxSubmissions: undefined
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [groupsData] = await Promise.all([
        supabaseService.getGroups(),
        supabaseService.getUsers()
      ])
      
      setGroups(groupsData)
      
      // Mock challenges for demonstration
      const mockChallenges: Challenge[] = [
        {
          id: 'challenge-1',
          title: 'Monthly Sales Target',
          description: 'Erreichen Sie Ihr monatliches Verkaufsziel von €50,000',
          points: 200,
          deadline: new Date(Date.now() + 86400000 * 15).toISOString(),
          type: 'individual',
          difficulty: 'intermediate',
          status: 'active',
          createdBy: 'trainer-1',
          createdByName: 'Sebastian Bunde',
          createdAt: new Date().toISOString(),
          groupId: 'group-1',
          groupName: 'Training Group',
          submissions: [
            {
              id: 'sub-1',
              challengeId: 'challenge-1',
              userId: 'user-1',
              userName: 'Max Mustermann',
              content: 'Ich habe bereits €35,000 erreicht diesen Monat!',
              submittedAt: new Date().toISOString(),
              status: 'pending'
            }
          ]
        },
        {
          id: 'challenge-2',
          title: 'Cold Calling Mastery',
          description: 'Führen Sie 50 erfolgreiche Kaltakquise-Gespräche durch',
          points: 150,
          deadline: new Date(Date.now() + 86400000 * 30).toISOString(),
          type: 'individual',
          difficulty: 'advanced',
          status: 'active',
          createdBy: 'trainer-2',
          createdByName: 'Brigitte Müller',
          createdAt: new Date().toISOString(),
          groupId: 'group-2',
          groupName: 'Sales Group',
          maxSubmissions: 50,
          submissions: []
        },
        {
          id: 'challenge-3',
          title: 'Team Presentation Excellence',
          description: 'Erstellen Sie eine perfekte Teampräsentation für Kunden',
          points: 250,
          deadline: new Date(Date.now() - 86400000 * 5).toISOString(),
          type: 'group',
          difficulty: 'advanced',
          status: 'completed',
          createdBy: 'trainer-1',
          createdByName: 'Sebastian Bunde',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          groupId: 'group-1',
          groupName: 'Training Group',
          submissions: [
            {
              id: 'sub-2',
              challengeId: 'challenge-3',
              userId: 'user-2',
              userName: 'Anna Schmidt',
              content: 'Unsere Teampräsentation wurde erfolgreich abgehalten!',
              submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
              status: 'approved',
              score: 95,
              feedback: 'Ausgezeichnete Arbeit! Sehr professionelle Präsentation.'
            }
          ]
        }
      ]
      
      setChallenges(mockChallenges)
    } catch (error) {
      console.error('Error loading challenges data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChallenge = async () => {
    try {
      const group = groups.find(g => g.id === challengeForm.groupId)
      
      const newChallenge: Challenge = {
        id: `challenge-${Date.now()}`,
        ...challengeForm,
        status: 'active',
        createdBy: 'admin-1', // Would be current user ID
        createdByName: 'Admin User',
        createdAt: new Date().toISOString(),
        groupName: group?.name,
        submissions: []
      }

      setChallenges([...challenges, newChallenge])
      setShowCreateModal(false)
      resetForm()
      alert('Herausforderung erfolgreich erstellt!')
    } catch (error) {
      console.error('Error creating challenge:', error)
      alert('Fehler beim Erstellen der Herausforderung')
    }
  }

  const handleUpdateChallenge = async () => {
    if (!editingChallenge) return

    try {
      const group = groups.find(g => g.id === challengeForm.groupId)
      
      const updatedChallenge: Challenge = {
        ...editingChallenge,
        ...challengeForm,
        groupName: group?.name
      }

      setChallenges(challenges.map(c => c.id === editingChallenge.id ? updatedChallenge : c))
      setEditingChallenge(null)
      setShowCreateModal(false)
      resetForm()
      alert('Herausforderung erfolgreich aktualisiert!')
    } catch (error) {
      console.error('Error updating challenge:', error)
      alert('Fehler beim Aktualisieren der Herausforderung')
    }
  }

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Herausforderung löschen möchten?')) {
      return
    }

    try {
      setChallenges(challenges.filter(c => c.id !== challengeId))
      alert('Herausforderung erfolgreich gelöscht!')
    } catch (error) {
      console.error('Error deleting challenge:', error)
      alert('Fehler beim Löschen der Herausforderung')
    }
  }

  const handleUpdateSubmissionStatus = async (challengeId: string, submissionId: string, status: 'approved' | 'rejected', feedback?: string, score?: number) => {
    try {
      setChallenges(challenges.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            submissions: challenge.submissions.map(submission => 
              submission.id === submissionId 
                ? { ...submission, status, feedback, score }
                : submission
            )
          }
        }
        return challenge
      }))
      
      alert(`Einreichung ${status === 'approved' ? 'genehmigt' : 'abgelehnt'}!`)
    } catch (error) {
      console.error('Error updating submission:', error)
      alert('Fehler beim Aktualisieren der Einreichung')
    }
  }

  const resetForm = () => {
    setChallengeForm({
      title: '',
      description: '',
      points: 100,
      deadline: '',
      type: 'individual',
      difficulty: 'intermediate',
      groupId: '',
      maxSubmissions: undefined
    })
  }

  const startEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge)
    setChallengeForm({
      title: challenge.title,
      description: challenge.description,
      points: challenge.points,
      deadline: challenge.deadline,
      type: challenge.type,
      difficulty: challenge.difficulty,
      groupId: challenge.groupId || '',
      maxSubmissions: challenge.maxSubmissions
    })
    setShowCreateModal(true)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredChallenges = challenges.filter(challenge => {
    if (selectedFilter === 'all') return true
    return challenge.status === selectedFilter
  })

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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">Herausforderungen-Verwaltung</h1>
            <p className="text-gray-600">Erstellen und verwalten Sie Herausforderungen für Trainingsgruppen</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Neue Herausforderung
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="mt-4 flex space-x-2">
          {[
            { id: 'all', name: 'Alle' },
            { id: 'active', name: 'Aktiv' },
            { id: 'completed', name: 'Abgeschlossen' },
            { id: 'archived', name: 'Archiviert' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedFilter === filter.id
                  ? 'bg-primary-100 text-primary-800'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Herausforderungen ({filteredChallenges.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredChallenges.map((challenge) => (
            <div key={challenge.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{challenge.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
                      {challenge.status === 'active' ? 'Aktiv' : 
                       challenge.status === 'completed' ? 'Abgeschlossen' : 'Archiviert'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{challenge.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-yellow-600" />
                      <span>{challenge.points} Punkte</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(challenge.deadline).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      <span>{challenge.type === 'individual' ? 'Einzeln' : 'Gruppe'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{challenge.submissions.length} Einreichungen</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Erstellt von:</span> {challenge.createdByName}
                    {challenge.groupName && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="font-medium">Gruppe:</span> {challenge.groupName}
                      </>
                    )}
                    <span className="mx-2">•</span>
                    <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Submissions */}
                  {challenge.submissions.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Einreichungen:</h4>
                      <div className="space-y-2">
                        {challenge.submissions.map((submission) => (
                          <div key={submission.id} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{submission.userName}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {submission.status === 'approved' ? 'Genehmigt' :
                                     submission.status === 'rejected' ? 'Abgelehnt' : 'Ausstehend'}
                                  </span>
                                  {submission.score && (
                                    <span className="text-sm text-gray-600">
                                      Score: {submission.score}/100
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700">{submission.content}</p>
                                {submission.feedback && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    <strong>Feedback:</strong> {submission.feedback}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(submission.submittedAt).toLocaleString()}
                                </p>
                              </div>
                              
                              {submission.status === 'pending' && (
                                <div className="flex space-x-1 ml-2">
                                  <button
                                    onClick={() => {
                                      const feedback = prompt('Feedback (optional):')
                                      const scoreStr = prompt('Score (0-100, optional):')
                                      const score = scoreStr ? parseInt(scoreStr) : undefined
                                      handleUpdateSubmissionStatus(challenge.id, submission.id, 'approved', feedback || undefined, score)
                                    }}
                                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                  >
                                    Genehmigen
                                  </button>
                                  <button
                                    onClick={() => {
                                      const feedback = prompt('Ablehnungsgrund:')
                                      if (feedback) {
                                        handleUpdateSubmissionStatus(challenge.id, submission.id, 'rejected', feedback)
                                      }
                                    }}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                  >
                                    Ablehnen
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => startEditChallenge(challenge)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Herausforderung bearbeiten"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteChallenge(challenge.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Herausforderung löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Herausforderungen gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedFilter === 'all' ? 'Erstellen Sie Ihre erste Herausforderung.' : `Keine ${selectedFilter} Herausforderungen verfügbar.`}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingChallenge ? 'Herausforderung bearbeiten' : 'Neue Herausforderung erstellen'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingChallenge(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={challengeForm.title}
                    onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Herausforderung-Titel"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Punkte *
                  </label>
                  <input
                    type="number"
                    value={challengeForm.points}
                    onChange={(e) => setChallengeForm({ ...challengeForm, points: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung *
                </label>
                <textarea
                  value={challengeForm.description}
                  onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Beschreibung der Herausforderung..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fristablauf *
                  </label>
                  <input
                    type="date"
                    value={challengeForm.deadline.slice(0, 10)}
                    onChange={(e) => setChallengeForm({ ...challengeForm, deadline: e.target.value + 'T23:59:59.000Z' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ
                  </label>
                  <select
                    value={challengeForm.type}
                    onChange={(e) => setChallengeForm({ ...challengeForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="individual">Einzeln</option>
                    <option value="group">Gruppe</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schwierigkeit
                  </label>
                  <select
                    value={challengeForm.difficulty}
                    onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="beginner">Anfänger</option>
                    <option value="intermediate">Fortgeschritten</option>
                    <option value="advanced">Experte</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gruppe *
                  </label>
                  <select
                    value={challengeForm.groupId}
                    onChange={(e) => setChallengeForm({ ...challengeForm, groupId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Gruppe auswählen</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max. Einreichungen (optional)
                  </label>
                  <input
                    type="number"
                    value={challengeForm.maxSubmissions || ''}
                    onChange={(e) => setChallengeForm({ ...challengeForm, maxSubmissions: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    placeholder="Unbegrenzt"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingChallenge(null)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Abbrechen
              </button>
              <button
                onClick={editingChallenge ? handleUpdateChallenge : handleCreateChallenge}
                disabled={!challengeForm.title || !challengeForm.description || !challengeForm.deadline || !challengeForm.groupId}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingChallenge ? 'Aktualisieren' : 'Erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}