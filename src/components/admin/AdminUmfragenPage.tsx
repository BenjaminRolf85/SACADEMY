import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Edit, Trash2, BarChart3, Users, Star, Calendar, Eye } from 'lucide-react';

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: number;
  responses: number;
  avgRating: number;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  status: 'active' | 'draft' | 'completed';
  type: string;
  groupId?: string;
  groupName?: string;
}

const AdminUmfragenPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all');

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      // Mock survey data based on the screenshots
      const mockSurveys: Survey[] = [
        {
          id: 'survey-1',
          title: 'Abschluss SBMasterclass Wütschner',
          description: 'Bewertung der 12-wöchigen Masterclass und verkäuferischen Entwicklung',
          questions: 16,
          responses: 12,
          avgRating: 4.8,
          createdAt: '2025-01-15',
          createdBy: 'trainer-1',
          createdByName: 'Sebastian Bunde',
          status: 'active',
          type: 'Kurs-Abschluss',
          groupId: 'group-1',
          groupName: 'Advanced Sales Techniques'
        },
        {
          id: 'survey-2',
          title: 'Trainer Feedback - Digital Sales',
          description: 'Bewertung der Trainingsqualität und Verbesserungsvorschläge',
          questions: 10,
          responses: 15,
          avgRating: 4.5,
          createdAt: '2025-01-10',
          createdBy: 'trainer-2',
          createdByName: 'Brigitte Müller',
          status: 'active',
          type: 'Trainer-Bewertung',
          groupId: 'group-2',
          groupName: 'Digital Sales Mastery'
        },
        {
          id: 'survey-3',
          title: 'Kursinhalt Bewertung - CRM',
          description: 'Feedback zu Kursmaterialien und Lerninhalten',
          questions: 8,
          responses: 18,
          avgRating: 4.2,
          createdAt: '2025-01-05',
          createdBy: 'trainer-1',
          createdByName: 'Sebastian Bunde',
          status: 'completed',
          type: 'Inhalt-Bewertung',
          groupId: 'group-3',
          groupName: 'Customer Relationship Excellence'
        },
        {
          id: 'survey-4',
          title: 'Selbsteinschätzung Verkaufsfähigkeiten',
          description: 'Fortschrittsbewertung und Kompetenz-Selbsteinschätzung',
          questions: 12,
          responses: 8,
          avgRating: 4.1,
          createdAt: '2025-01-20',
          createdBy: 'trainer-2',
          createdByName: 'Brigitte Müller',
          status: 'draft',
          type: 'Selbsteinschätzung',
          groupId: 'group-2',
          groupName: 'Digital Sales Mastery'
        }
      ];
      
      setSurveys(mockSurveys);
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktiv</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Abgeschlossen</span>;
      case 'draft':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Entwurf</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unbekannt</span>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Kurs-Abschluss': return 'bg-purple-50 text-purple-700';
      case 'Trainer-Bewertung': return 'bg-blue-50 text-blue-700';
      case 'Inhalt-Bewertung': return 'bg-green-50 text-green-700';
      case 'Selbsteinschätzung': return 'bg-orange-50 text-orange-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const filteredSurveys = surveys.filter(survey => {
    if (selectedFilter === 'all') return true;
    return survey.status === selectedFilter;
  });

  const stats = {
    total: surveys.length,
    active: surveys.filter(s => s.status === 'active').length,
    completed: surveys.filter(s => s.status === 'completed').length,
    avgRating: surveys.reduce((sum, s) => sum + s.avgRating, 0) / surveys.length,
    totalResponses: surveys.reduce((sum, s) => sum + s.responses, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">Umfragen-Verwaltung</h1>
            <p className="text-gray-600">Verwalten Sie Kurs-Umfragen und Feedback-Formulare</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="h-5 w-5 mr-2" />
            Neue Umfrage
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="mt-4 flex space-x-2">
          {[
            { id: 'all', name: 'Alle' },
            { id: 'active', name: 'Aktiv' },
            { id: 'completed', name: 'Abgeschlossen' },
            { id: 'draft', name: 'Entwürfe' }
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gesamt Umfragen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gesamt Antworten</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ø Bewertung</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive Umfragen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abgeschlossen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Surveys List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Alle Umfragen ({filteredSurveys.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredSurveys.map((survey) => (
            <div key={survey.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{survey.title}</h3>
                    {getStatusBadge(survey.status)}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(survey.type)}`}>
                      {survey.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{survey.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span>{survey.questions} Fragen</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{survey.responses} Antworten</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>{survey.avgRating} Sterne</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center">
                      <span className="font-medium">Gruppe:</span>
                      <span className="ml-1">{survey.groupName}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Erstellt von:</span> {survey.createdByName}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                    title="Antworten anzeigen"
                  >
                    <BarChart3 size={16} />
                  </button>
                  
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Umfrage ansehen"
                  >
                    <Eye size={16} />
                  </button>
                  
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                    title="Umfrage bearbeiten"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Umfrage löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Response Preview */}
              {survey.responses > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Letzte Antworten:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="font-medium text-green-800">Sehr zufrieden</div>
                      <div className="text-green-600">{Math.floor(survey.responses * 0.7)} Teilnehmer (70%)</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="font-medium text-yellow-800">Zufrieden</div>
                      <div className="text-yellow-600">{Math.floor(survey.responses * 0.25)} Teilnehmer (25%)</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="font-medium text-red-800">Verbesserung nötig</div>
                      <div className="text-red-600">{Math.floor(survey.responses * 0.05)} Teilnehmer (5%)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {filteredSurveys.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Umfragen gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedFilter === 'all' ? 'Erstellen Sie Ihre erste Umfrage.' : `Keine ${selectedFilter} Umfragen verfügbar.`}
            </p>
          </div>
        )}
      </div>

      {/* Survey Templates Info */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">📋 Umfrage-Typen</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-700">
          <div>
            <strong>Kurs-Abschluss:</strong> Bewertung nach Kursende
          </div>
          <div>
            <strong>Trainer-Bewertung:</strong> Feedback zur Trainingsqualität
          </div>
          <div>
            <strong>Inhalt-Bewertung:</strong> Bewertung von Materialien
          </div>
          <div>
            <strong>Selbsteinschätzung:</strong> Fortschrittsbewertung der Teilnehmer
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUmfragenPage;