import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { MessageSquare, Star, Clock, CheckCircle, ArrowLeft } from 'lucide-react'

interface Survey {
  id: string
  title: string
  description: string
  questions: SurveyQuestion[]
  createdBy: string
  createdByName: string
  createdAt: string
  groupId?: string
  groupName?: string
  status: 'active' | 'draft' | 'completed'
  totalQuestions: number
  estimatedTime: string
}

interface SurveyQuestion {
  id: string
  question: string
  type: 'radio' | 'checkbox' | 'scale' | 'text' | 'email'
  options?: string[]
  scaleMin?: number
  scaleMax?: number
  scaleLabels?: { min: string; max: string }
  required: boolean
}

interface SurveyResponse {
  id: string
  surveyId: string
  userId: string
  answers: { [questionId: string]: any }
  submittedAt: string
  email?: string
}

export default function SurveysPage() {
  const { user } = useAuth()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [currentAnswers, setCurrentAnswers] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadSurveys()
  }, [user])

  const loadSurveys = async () => {
    try {
      setLoading(true)

      // Mock surveys - like the "Abschluss SBMasterclass" example
      const mockSurveys: Survey[] = [
        {
          id: 'survey-1',
          title: 'Abschluss SBMasterclass Wütschner',
          description: 'Bewerten Sie Ihre Erfahrung mit der Masterclass und geben Sie uns Feedback',
          questions: [
            {
              id: 'q1',
              question: 'Schaue zurück auf 12 Wochen Masterclass und Deine verkäuferische Entwicklung: Hat es sich für Dich gelohnt?',
              type: 'radio',
              options: ['Ja klar!', 'Eher nicht!'],
              required: true
            },
            {
              id: 'q2',
              question: 'Welche der Themen waren für Dich am wertvollsten?',
              type: 'checkbox',
              options: [
                'Tagesplan erstellen',
                'Offene Fragen stellen',
                'Hypothetische Fragen stellen',
                'Verständnisfragen stellen',
                'Komplette Bedarfsanalyse',
                'Kaufsignale beachten',
                'Abschlussfragen stellen',
                'Angebote nachverfolgen',
                'Kunden NEIN sagen lassen',
                'Einwandvorwegnahme',
                'Einwand wegstellen (Mal angesehen davon...)',
                'Value-Story/Nutzenargumentation (4-Step)'
              ],
              required: true
            },
            {
              id: 'q3',
              question: 'Zur Weiterentwicklung gehört es, seine Komfortzone Regelmäßig zu verlassen. Wie oft bist Du an Deine Grenzen gestoßen dabei?',
              type: 'scale',
              scaleMin: 0,
              scaleMax: 10,
              scaleLabels: { min: 'Ganz selten', max: 'Sehr häufig' },
              required: true
            },
            {
              id: 'q4',
              question: 'Wieviel besser vorbereitet hast Du Dich mit einem Tagesplan gefühlt?',
              type: 'scale',
              scaleMin: 0,
              scaleMax: 10,
              scaleLabels: { min: 'Gar nicht', max: 'Sehr viel besser' },
              required: true
            },
            {
              id: 'q5',
              question: 'Um wieviel Prozent haben sich Deine Fähigkeiten im Bereich der Selbstorganisation (Tagesplanung, Dokumentation etc...) verbessert?',
              type: 'scale',
              scaleMin: 0,
              scaleMax: 10,
              scaleLabels: { min: '0%', max: '100%' },
              required: true
            },
            {
              id: 'q11',
              question: 'Was hat Dich daran gehindert, die Aufgaben der Masterclass 100% #UMZUSETZEN?',
              type: 'text',
              required: true
            },
            {
              id: 'q12',
              question: 'Was hätte Deine #UMSETZUNG noch besser unterstützt und wäre für Dich wertvoll gewesen im Alltag?',
              type: 'text',
              required: true
            },
            {
              id: 'q13',
              question: 'Was hat Dich an der Masterclass begeistert?',
              type: 'text',
              required: true
            },
            {
              id: 'q14',
              question: 'Wenn Du nochmals teilnehmen würdest, was müssen wir bis dahin verbessern?',
              type: 'text',
              required: true
            },
            {
              id: 'q15',
              question: 'Was war die für Dich wertvollste Erkenntnis im Verlauf der Masterclass?',
              type: 'text',
              required: true
            },
            {
              id: 'q16',
              question: 'Würdest Du die Masterclass weiterempfehlen?',
              type: 'radio',
              options: ['Ja klar!', 'Eher nicht!'],
              required: true
            }
          ],
          createdBy: 'trainer-1',
          createdByName: 'Sebastian Bunde',
          createdAt: new Date().toISOString(),
          groupId: 'group-1',
          groupName: 'Advanced Sales Techniques',
          status: 'active',
          totalQuestions: 16,
          estimatedTime: '15-20 Min'
        },
        {
          id: 'survey-2',
          title: 'Trainer-Bewertung: Digital Sales Kurs',
          description: 'Bewerten Sie die Leistung Ihres Trainers',
          questions: [
            {
              id: 'tq1',
              question: 'Wie bewerten Sie die Kompetenz des Trainers?',
              type: 'scale',
              scaleMin: 1,
              scaleMax: 5,
              scaleLabels: { min: 'Sehr schlecht', max: 'Ausgezeichnet' },
              required: true
            },
            {
              id: 'tq2',
              question: 'Wie hilfreich waren die bereitgestellten Materialien?',
              type: 'scale',
              scaleMin: 1,
              scaleMax: 5,
              scaleLabels: { min: 'Nicht hilfreich', max: 'Sehr hilfreich' },
              required: true
            },
            {
              id: 'tq3',
              question: 'Was könnten wir am Kurs verbessern?',
              type: 'text',
              required: false
            }
          ],
          createdBy: 'trainer-1',
          createdByName: 'Sebastian Bunde',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          groupId: 'group-2',
          groupName: 'Digital Sales Mastery',
          status: 'active',
          totalQuestions: 3,
          estimatedTime: '5 Min'
        }
      ]

      setSurveys(mockSurveys)

      // Mock responses
      const mockResponses: SurveyResponse[] = [
        {
          id: 'resp-1',
          surveyId: 'survey-2',
          userId: user?.id || '',
          answers: { 'tq1': 5, 'tq2': 4, 'tq3': 'Mehr praktische Übungen wären toll!' },
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
          email: user?.email
        }
      ]

      setResponses(mockResponses)
    } catch (error) {
      console.error('Error loading surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmitSurvey = async () => {
    if (!selectedSurvey) return

    setSubmitting(true)
    try {
      // Check required questions
      const missingRequired = selectedSurvey.questions.filter(q => 
        q.required && !currentAnswers[q.id]
      )

      if (missingRequired.length > 0) {
        alert(`Bitte beantworten Sie alle Pflichtfragen (${missingRequired.length} fehlen noch)`)
        setSubmitting(false)
        return
      }

      const newResponse: SurveyResponse = {
        id: `resp-${Date.now()}`,
        surveyId: selectedSurvey.id,
        userId: user?.id || '',
        answers: currentAnswers,
        submittedAt: new Date().toISOString(),
        email: user?.email
      }

      setResponses([...responses, newResponse])
      setSelectedSurvey(null)
      setCurrentAnswers({})
      
      alert('Umfrage erfolgreich eingereicht! Vielen Dank für Ihr Feedback.')
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('Fehler beim Einreichen der Umfrage')
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question: SurveyQuestion, index: number) => {
    console.log('Rendering question', index) // Use index to avoid TS6133
    switch (question.type) {
      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option, optIndex) => (
              <label key={optIndex} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={currentAnswers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option, optIndex) => (
              <label key={optIndex} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  value={option}
                  checked={currentAnswers[question.id]?.includes(option)}
                  onChange={(e) => {
                    const currentValues = currentAnswers[question.id] || []
                    if (e.target.checked) {
                      handleAnswerChange(question.id, [...currentValues, option])
                    } else {
                      handleAnswerChange(question.id, currentValues.filter((v: string) => v !== option))
                    }
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'scale':
        return (
          <div className="space-y-3">
            {question.scaleLabels && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>{question.scaleLabels.min}</span>
                <span>{question.scaleLabels.max}</span>
              </div>
            )}
            <div className="flex justify-between">
              {Array.from({ length: (question.scaleMax || 10) - (question.scaleMin || 0) + 1 }, (_, i) => {
                const value = (question.scaleMin || 0) + i
                return (
                  <button
                    key={value}
                    onClick={() => handleAnswerChange(question.id, value)}
                    className={`w-10 h-10 rounded-lg border-2 font-medium ${
                      currentAnswers[question.id] === value
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 'text':
        return (
          <textarea
            value={currentAnswers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="Bitte geben Sie Ihre Antwort ein..."
            maxLength={300}
          />
        )

      case 'email':
        return (
          <input
            type="email"
            value={currentAnswers[question.id] || user?.email || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="ihre@email.com"
          />
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Survey Taking View
  if (selectedSurvey) {
    const completedQuestions = selectedSurvey.questions.filter(q => currentAnswers[q.id]).length
    const progress = (completedQuestions / selectedSurvey.questions.length) * 100

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedSurvey(null)}
            className="flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Zurück zu Umfragen
          </button>
          <div className="text-sm text-gray-500">
            {completedQuestions} von {selectedSurvey.questions.length} Fragen beantwortet
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedSurvey.title}</h1>
            <p className="text-gray-600 mb-4">{selectedSurvey.description}</p>
            <div className="text-sm text-gray-500 mb-4">
              {selectedSurvey.totalQuestions} Fragen • Geschätzte Zeit: {selectedSurvey.estimatedTime}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Email Field (if not pre-filled) */}
          {!user?.email && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={currentAnswers['email'] || ''}
                onChange={(e) => handleAnswerChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="ihre@email.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                Ihre E-Mail-Adresse wird mit dem Umfrage-Eigentümer geteilt.
              </p>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-8">
            {selectedSurvey.questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-100 pb-8 last:border-b-0">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {index + 1}. {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                {renderQuestion(question, index)}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSubmitSurvey}
              disabled={submitting}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Wird eingereicht...' : 'Umfrage einreichen'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Survey List View
  const completedSurveyIds = responses.map(r => r.surveyId)
  const availableSurveys = surveys.filter(s => s.status === 'active')
  const completedSurveys = surveys.filter(s => completedSurveyIds.includes(s.id))

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-2 text-primary-800">
          Umfragen
        </h1>
        <p className="text-lg text-gray-700">
          Teilen Sie Ihr Feedback und helfen Sie uns, unsere Kurse zu verbessern
        </p>
      </div>

      {/* Available Surveys */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Verfügbare Umfragen</h2>
        
        {availableSurveys.filter(s => !completedSurveyIds.includes(s.id)).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableSurveys.filter(s => !completedSurveyIds.includes(s.id)).map((survey) => (
              <div key={survey.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{survey.title}</h3>
                    <p className="text-gray-600 mb-4">{survey.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{survey.estimatedTime} • {survey.totalQuestions} Fragen</span>
                      </div>
                      {survey.groupName && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2" />
                          <span>Kurs: {survey.groupName}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span>Von: {survey.createdByName}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedSurvey(survey)}
                      className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-medium"
                    >
                      Umfrage starten
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine neuen Umfragen</h3>
            <p className="text-gray-500">Derzeit sind keine neuen Umfragen zum Ausfüllen verfügbar.</p>
          </div>
        )}
      </div>

      {/* Completed Surveys */}
      {completedSurveys.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Abgeschlossene Umfragen</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedSurveys.map((survey) => {
              const response = responses.find(r => r.surveyId === survey.id)
              return (
                <div key={survey.id} className="bg-white rounded-lg shadow-sm border p-6 opacity-75">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{survey.title}</h3>
                      <p className="text-gray-600 mb-2">{survey.description}</p>
                      
                      {response && (
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            <span>Abgeschlossen am {new Date(response.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}