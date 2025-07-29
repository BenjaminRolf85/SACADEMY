import { useState } from 'react';
import { Star, MessageSquare, Calendar, Users, TrendingUp, BarChart3 } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: number;
  completed: number;
  rating: number;
  createdAt: string;
  status: 'active' | 'draft' | 'archived' | 'completed';
  createdBy?: string;
  courseName?: string;
  attempts?: number;
}

const AdminQuizPage: React.FC = () => {
  const [quizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'Sales Fundamentals Assessment',
      description: 'Basic sales knowledge test for Advanced Sales course',
      questions: 15,
      completed: 45,
      rating: 4.2,
      createdAt: '2025-01-15',
      status: 'active',
      createdBy: 'Sebastian Bunde',
      courseName: 'Advanced Sales Techniques',
      attempts: 67
    },
    {
      id: '2',
      title: 'Digital Sales Mastery Quiz',
      description: 'Advanced digital sales techniques assessment',
      questions: 12,
      completed: 23,
      rating: 4.6,
      createdAt: '2025-01-10',
      status: 'active',
      createdBy: 'Brigitte Müller',
      courseName: 'Digital Sales Mastery',
      attempts: 34
    },
    {
      id: '3',
      title: 'Customer Relations Quiz',
      description: 'Customer relationship management assessment',
      questions: 10,
      completed: 67,
      rating: 3.8,
      createdAt: '2025-01-05',
      status: 'completed',
      createdBy: 'Sebastian Bunde',
      courseName: 'Customer Relationship Excellence',
      attempts: 89
    }
  ]);

  const [selectedTab, setSelectedTab] = useState('overview');

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Verwaltung (Bewertungen)</h1>
          <p className="text-gray-600">Übersicht aller von Trainern erstellten Quizzes</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
          <span>📋 Nur Trainer können Quizzes erstellen</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Quiz-Übersicht', icon: BarChart3 },
            { key: 'active', label: 'Aktive Quizzes', icon: MessageSquare },
            { key: 'analytics', label: 'Quiz-Analytics', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                selectedTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Stats Cards */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Gesamt Quizzes', value: '23', change: 'Von Trainern erstellt', icon: MessageSquare, color: 'blue' },
            { label: 'Durchschnitt Rating', value: '4.2', change: '+0.3', icon: Star, color: 'yellow' },
            { label: 'Aktive Quizzes', value: '8', change: 'Laufend', icon: Calendar, color: 'green' },
            { label: 'Quiz-Versuche', value: '190', change: 'Gesamt Attempts', icon: Users, color: 'purple' }
          ].map(({ label, value, change, icon: Icon, color }) => (
            <div key={label} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-green-600">{change}</p>
                </div>
                <Icon className={`w-8 h-8 text-${color}-600`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Von Trainern erstellte Quizzes</h2>
        </div>
        <div className="divide-y">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{quiz.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quiz.status)}`}>
                      {quiz.status === 'active' ? 'Aktiv' : quiz.status === 'draft' ? 'Entwurf' : 'Archiviert'}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{quiz.description}</p>
                  <div className="flex items-center space-x-6 mt-3">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{quiz.questions} Fragen</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{quiz.completed} Teilnehmer</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(quiz.rating)}
                      <span className="text-sm text-gray-600 ml-2">{quiz.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{quiz.createdAt}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-700">Trainer:</span>
                      <span className="text-sm text-gray-600">{quiz.createdBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-700">Kurs:</span>
                      <span className="text-sm text-gray-600">{quiz.courseName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600" title="Quiz-Ergebnisse anzeigen">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600" title="Quiz-Details anzeigen">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Information</h3>
        <p className="text-sm text-blue-700">
          Nur Trainer können Quizzes für ihre eigenen Kurse erstellen und verwalten. 
          Als Administrator können Sie hier alle Quizzes überwachen und Ergebnisse einsehen.
        </p>
      </div>
    </div>
  );
};

export default AdminQuizPage;