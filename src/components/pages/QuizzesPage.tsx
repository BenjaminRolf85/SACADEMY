import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, ArrowLeft, Brain } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: number;
  duration: number;
  points: number;
  difficulty: string;
  completed?: boolean;
  score?: number;
}


const QuizzesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState<{score: number, passed: boolean} | null>(null);

  // Only 3 simple business quizzes
  const quizzes: Quiz[] = [
    {
      id: 'quiz-1',
      title: 'Digital Sales Fundamentals',
      description: 'Grundlagen des digitalen Verkaufsprozesses',
      questions: 15,
      duration: 20,
      points: 100,
      difficulty: 'Beginner',
      completed: true,
      score: 88
    },
    {
      id: 'quiz-2', 
      title: 'CRM & Lead Management',
      description: 'Kundenbeziehungen digital verwalten',
      questions: 18,
      duration: 25,
      points: 120,
      difficulty: 'Intermediate',
      completed: true,
      score: 82
    },
    {
      id: 'quiz-3',
      title: 'Social Selling Strategies',
      description: 'Verkaufen über soziale Medien',
      questions: 22,
      duration: 30,
      points: 150,
      difficulty: 'Advanced',
      completed: false
    }
  ];

  useEffect(() => {
    setLoading(false);
  }, []);

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuizId(quiz.id);
  };

  // Quiz Completion Component
  const QuizCompletion = ({ score, passed, onBack, onFeedback }: {
    score: number, 
    passed: boolean, 
    onBack: () => void,
    onFeedback: (feedback: string) => void
  }) => {
    const [feedback, setFeedback] = useState('');

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Zurück
          </button>

          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Quiz abgeschlossen!</h1>
            
            <div className="mb-8">
              <p className="text-xl mb-4">
                Ihre Note: <span className="font-bold text-2xl text-primary-600">{score}%</span>
              </p>
              
              <div className="flex items-center justify-center mb-6">
                {passed ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                    <p className="text-xl text-green-600 font-semibold">
                      Herzlichen Glückwunsch! Sie haben bestanden!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 text-red-600 mr-3">✗</div>
                    <p className="text-xl text-red-600 font-semibold">
                      Nicht bestanden. Versuchen Sie es erneut!
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ihr Feedback zum Quiz</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Teilen Sie uns Ihre Gedanken zum Quiz mit..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => onFeedback(feedback)}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
              >
                Feedback senden
              </button>
              <button
                onClick={onBack}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Zurück zu Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedQuizId && !showCompletion) {
    return <QuizAttemptPage 
      quizId={selectedQuizId} 
      onBack={() => setSelectedQuizId(null)}
      onComplete={(score, passed) => {
        setCompletionData({ score, passed });
        setShowCompletion(true);
      }}
    />;
  }

  if (showCompletion && completionData) {
    return <QuizCompletion 
      score={completionData.score}
      passed={completionData.passed}
      onBack={() => {
        setShowCompletion(false);
        setSelectedQuizId(null);
        setCompletionData(null);
      }}
      onFeedback={(feedback) => {
        console.log('Feedback submitted:', feedback);
        alert('Feedback erfolgreich gesendet!');
        setShowCompletion(false);
        setSelectedQuizId(null);
        setCompletionData(null);
      }}
    />;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const completedQuizzes = quizzes.filter(q => q.completed).length;
  const totalPoints = quizzes.filter(q => q.completed).reduce((sum, q) => sum + q.points, 0);
  const avgScore = quizzes.filter(q => q.completed && q.score).reduce((sum, q) => sum + (q.score || 0), 0) / completedQuizzes || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-2 text-primary-800">
          Digital Sales Quizzes
        </h1>
        <p className="text-lg text-gray-700">
          Testen Sie Ihr Wissen in digitalen Verkaufstechniken
        </p>
      </div>

      {/* Progress Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Ihr Fortschritt</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">{completedQuizzes}/3</div>
            <div className="text-sm text-gray-600">Abgeschlossen</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">{Math.round(avgScore)}%</div>
            <div className="text-sm text-gray-600">Durchschnitt</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">{totalPoints}</div>
            <div className="text-sm text-gray-600">Punkte</div>
          </div>
        </div>
      </div>

      {/* Simple Business Quiz Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {quiz.title}
                </h3>
                <Brain className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-gray-600 text-sm mb-3">
                {quiz.description}
              </p>
              <div className="text-xs text-gray-500 mb-3">
                {quiz.difficulty} • {quiz.questions} Fragen • {quiz.duration} Min
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Punkte</span>
                <span className="font-medium text-primary-600">{quiz.points}</span>
              </div>

              {quiz.completed && quiz.score && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Ihre Note</span>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    <span className="font-medium text-green-600">{quiz.score}%</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => startQuiz(quiz)}
              className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              {quiz.completed ? 'Wiederholen' : 'Quiz starten'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Quiz Attempt Component
interface QuizAttemptPageProps {
  quizId: string;
  onBack: () => void;
  onComplete: (score: number, passed: boolean) => void;
}

const QuizAttemptPage: React.FC<QuizAttemptPageProps> = ({ quizId, onBack, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions] = useState([
    {
      id: 'q1',
      question: 'Was ist der wichtigste Schritt im digitalen Verkaufsprozess?',
      options: ['Social Media Präsenz', 'E-Mail Marketing', 'Lead-Qualifizierung', 'Website-Optimierung'],
      correct_answer: 'Lead-Qualifizierung',
      explanation: 'Die Qualifizierung ist entscheidend, um die digitalen Bedürfnisse des Kunden zu verstehen.'
    },
    {
      id: 'q2', 
      question: 'CRM-Systeme sind für den digitalen Verkauf unverzichtbar',
      options: ['Wahr', 'Falsch'],
      correct_answer: 'Wahr',
      explanation: 'CRM-Systeme helfen dabei, Kundeninteraktionen digital zu verwalten und zu verfolgen.'
    },
    {
      id: 'q3',
      question: 'Welche Methode ist am effektivsten für Social Selling?',
      options: ['Direktwerbung', 'Beziehungen aufbauen', 'Massenmarketing', 'Preisvergleiche'],
      correct_answer: 'Beziehungen aufbauen',
      explanation: 'Vertrauen und Beziehungen sind die Grundlage für erfolgreiches Social Selling.'
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setQuiz({
      id: quizId,
      title: 'Digital Sales Quiz',
      description: 'Test your digital sales knowledge',
      passing_score: 70
    });
    setLoading(false);
  }, [quizId]);

  const handleAnswerSelect = (answer: string) => {
    if (!selectedAnswer && questions[currentQuestionIndex]) {
      setSelectedAnswer(answer);
      setAnswers({ ...answers, [questions[currentQuestionIndex].id]: answer });
      const correct = answer === questions[currentQuestionIndex].correct_answer;
      setIsCorrect(correct);
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[questions[currentQuestionIndex + 1].id] || null);
      setShowExplanation(false);
      setIsCorrect(null);
    } else {
      completeQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[questions[currentQuestionIndex - 1].id] || null);
      setShowExplanation(false);
      setIsCorrect(null);
    }
  };

  const completeQuiz = () => {
    let correctAnswers = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    const passed = finalScore >= (quiz?.passing_score ?? 70);
    
    onComplete(finalScore, passed);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-primary-600 hover:text-primary-700"
        >
          ← Zurück zu Quizzes
        </button>
        <div className="text-sm text-gray-500">
          Frage {currentQuestionIndex + 1} von {questions.length}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">{currentQuestion.question}</h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={selectedAnswer !== null}
                className={`w-full text-left p-4 rounded-lg border ${
                  selectedAnswer === option
                    ? isCorrect 
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-red-500 bg-red-50 text-red-700'
                    : selectedAnswer
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-primary-500 hover:bg-primary-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {selectedAnswer === option && (
                    isCorrect 
                      ? <CheckCircle className="text-green-500" size={20} />
                      : <div className="text-red-500">✗</div>
                  )}
                  {option === currentQuestion.correct_answer && selectedAnswer && selectedAnswer !== option && (
                    <CheckCircle className="text-green-500" size={20} />
                  )}
                </div>
              </button>
            ))}
          </div>

          {showExplanation && (
            <div className={`mt-6 p-4 rounded-lg ${
              isCorrect ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-start">
                {isCorrect 
                  ? <CheckCircle className="text-green-500 mt-1 mr-2" size={20} />
                  : <div className="text-red-500 mt-1 mr-2">✗</div>
                }
                <div>
                  <h3 className={`text-sm font-medium mb-1 ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect ? 'Richtig!' : 'Falsch'}
                  </h3>
                  <p className={`text-sm ${
                    isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 border border-gray-300 rounded-lg ${
              currentQuestionIndex === 0
                ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            Zurück
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className={`px-4 py-2 rounded-lg ${
              selectedAnswer
                ? 'text-white bg-primary-600 hover:bg-primary-700'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Quiz beenden' : 'Weiter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizzesPage;