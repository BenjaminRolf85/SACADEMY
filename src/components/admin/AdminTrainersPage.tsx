import React, { useState, useEffect } from 'react';
import { supabaseService } from '../../lib/supabaseService';
import { Plus, Edit, Trash2, Save, X, Users, Star, GraduationCap, Search, RefreshCw, BookOpen, MapPin, Mail, Phone, AlertTriangle, CheckCircle } from 'lucide-react';
import { User, Group } from '../../types';

interface TrainerFormData {
  name: string;
  email: string;
  company?: string;
  position?: string;
  specializations: string[];
  trainerLevel: number;
  bio?: string;
  phone?: string;
  location?: string;
}

interface TrainerStats {
  activeGroups: number;
  totalStudents: number;
  completedCourses: number;
  averageRating: number;
}

const AdminTrainersPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [trainerStats, setTrainerStats] = useState<{[key: string]: TrainerStats}>({});
  
  const [newTrainer, setNewTrainer] = useState<TrainerFormData>({
    name: '',
    email: '',
    company: 'Sales Academy',
    position: 'Sales Trainer',
    specializations: [],
    trainerLevel: 1,
    bio: '',
    phone: '',
    location: ''
  });

  const availableSpecializations = [
    'B2B Sales',
    'B2C Sales', 
    'Cold Calling',
    'Negotiation',
    'Customer Relations',
    'Presentation Skills',
    'Leadership',
    'Team Management',
    'Strategic Sales',
    'Digital Sales',
    'Account Management',
    'Sales Psychology',
    'Closing Techniques',
    'Pipeline Management'
  ];

  useEffect(() => {
    // Ensure data integrity on component mount
    if (typeof window !== 'undefined' && window.localStorage) {
      const checkIntegrity = localStorage.checkDataIntegrity?.()
      if (!checkIntegrity) {
        console.log('🔄 Data integrity check failed, data has been refreshed')
      }
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [trainersData, groupsData] = await Promise.all([
        supabaseService.getUsers(),
        supabaseService.getGroups()
      ]);
      
      // Filter only trainers
      const trainerUsers = trainersData.filter(user => user.role === 'trainer');
      setTrainers(trainerUsers);
      setGroups(groupsData);
      
      // Calculate stats for each trainer
      const stats: {[key: string]: TrainerStats} = {};
      trainerUsers.forEach(trainer => {
        const trainerGroups = groupsData.filter(group => 
          group.trainerId === trainer.id || group.trainerIds?.includes(trainer.id)
        );
        
        stats[trainer.id] = {
          activeGroups: trainerGroups.filter(g => g.status === 'active').length,
          totalStudents: trainerGroups.reduce((sum, group) => sum + (group.memberCount || 0), 0),
          completedCourses: trainerGroups.filter(g => g.status === 'completed').length,
          averageRating: 4.2 + Math.random() * 0.8 // Mock rating
        };
      });
      setTrainerStats(stats);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateTrainer = async () => {
    try {
      if (!newTrainer.name.trim() || !newTrainer.email.trim()) {
        setError('Name und E-Mail sind erforderlich');
        return;
      }

      const trainerData = {
        ...newTrainer,
        role: 'trainer' as const,
        status: 'active' as const,
        points: 0,
        level: 1,
        acceptedTerms: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      await supabaseService.createTrainer(trainerData);
      
      setShowCreateModal(false);
      setNewTrainer({
        name: '',
        email: '',
        company: 'Sales Academy',
        position: 'Sales Trainer',
        specializations: [],
        trainerLevel: 1,
        bio: '',
        phone: '',
        location: ''
      });
      
      setSuccessMessage('Trainer erfolgreich erstellt!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      loadData();
    } catch (err) {
      console.error('Error creating trainer:', err);
      setError('Fehler beim Erstellen des Trainers');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateTrainer = async () => {
    if (!editingTrainer) return;

    try {
      await supabaseService.updateUser(editingTrainer.id, editingTrainer);
      
      setEditingTrainer(null);
      setSuccessMessage('Trainer erfolgreich aktualisiert!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      loadData();
    } catch (err) {
      console.error('Error updating trainer:', err);
      setError('Fehler beim Aktualisieren des Trainers');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteTrainer = async (trainerId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Trainer löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      // Check if trainer has active groups
      const trainerGroups = groups.filter(group => 
        group.trainerId === trainerId || group.trainerIds?.includes(trainerId)
      );
      
      if (trainerGroups.length > 0) {
        setError('Trainer kann nicht gelöscht werden - hat noch aktive Gruppen zugewiesen');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // In a real app, this would call the actual delete API
      console.log('Would delete trainer:', trainerId);
      
      setSuccessMessage('Trainer erfolgreich gelöscht!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      loadData();
    } catch (err) {
      console.error('Error deleting trainer:', err);
      setError('Fehler beim Löschen des Trainers');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggleStatus = async (trainerId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await supabaseService.updateUser(trainerId, { status: newStatus });
      
      setSuccessMessage(`Trainer-Status erfolgreich auf "${newStatus}" geändert!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      loadData();
    } catch (err) {
      console.error('Error updating trainer status:', err);
      setError('Fehler beim Aktualisieren des Status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Aktiv' },
      suspended: { color: 'bg-red-100 text-red-800', label: 'Gesperrt' },
      expired: { color: 'bg-orange-100 text-orange-800', label: 'Abgelaufen' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTrainerLevelBadge = (level: number) => {
    const colors = {
      1: 'bg-gray-100 text-gray-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-purple-100 text-purple-800',
      4: 'bg-yellow-100 text-yellow-800',
      5: 'bg-red-100 text-red-800'
    };
    
    const color = colors[level as keyof typeof colors] || colors[1];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Star className="w-3 h-3 mr-1" />
        Level {level}
      </span>
    );
  };

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.specializations?.some(spec => 
      spec.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">Trainer-Verwaltung</h1>
            <p className="text-gray-600">Trainer erstellen, bearbeiten und verwalten</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Aktualisieren
            </button>
            <button
              onClick={() => {
                if (confirm('Reset all data to defaults?')) {
                  localStorage.forceRefreshAllData();
                  window.location.reload();
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reset Data
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus size={16} className="mr-2" />
              Neuer Trainer
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Trainer durchsuchen (Name, E-Mail, Spezialisierung)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center">
          <CheckCircle className="mr-2" size={20} />
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <AlertTriangle className="mr-2" size={20} />
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gesamt Trainer</p>
              <p className="text-2xl font-bold text-gray-900">{trainers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive Trainer</p>
              <p className="text-2xl font-bold text-gray-900">
                {trainers.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive Gruppen</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.filter(g => g.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gesamt Studierende</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(trainerStats).reduce((sum, stats) => sum + stats.totalStudents, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trainers List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Alle Trainer ({filteredTrainers.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTrainers.map((trainer) => {
            const stats = trainerStats[trainer.id] || {
              activeGroups: 0,
              totalStudents: 0,
              completedCourses: 0,
              averageRating: 0
            };
            
            return (
              <div key={trainer.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {trainer.name.charAt(0)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{trainer.name}</h3>
                        {getStatusBadge(trainer.status || 'active')}
                        {getTrainerLevelBadge(trainer.trainerLevel || 1)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{trainer.email}</span>
                        </div>
                        
                        {trainer.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{trainer.phone}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{trainer.position} bei {trainer.company}</span>
                        </div>
                        
                        {trainer.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{trainer.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {trainer.specializations && trainer.specializations.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Spezialisierungen:</p>
                          <div className="flex flex-wrap gap-1">
                            {trainer.specializations.map((spec, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {trainer.bio && (
                        <p className="mt-2 text-sm text-gray-600">{trainer.bio}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleStatus(trainer.id, trainer.status || 'active')}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        trainer.status === 'active'
                          ? 'text-orange-700 bg-orange-100 hover:bg-orange-200'
                          : 'text-green-700 bg-green-100 hover:bg-green-200'
                      }`}
                    >
                      {trainer.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                    
                    <button
                      onClick={() => setEditingTrainer(trainer)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Trainer bearbeiten"
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTrainer(trainer.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Trainer löschen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Trainer Statistics */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{stats.activeGroups}</div>
                    <div className="text-sm text-gray-500">Aktive Gruppen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{stats.totalStudents}</div>
                    <div className="text-sm text-gray-500">Studierende</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{stats.completedCourses}</div>
                    <div className="text-sm text-gray-500">Abgeschlossene Kurse</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{stats.averageRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">⭐ Bewertung</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredTrainers.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Trainer gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Keine Trainer entsprechen Ihrer Suche.' : 'Erstellen Sie Ihren ersten Trainer.'}
            </p>
          </div>
        )}
      </div>

      {/* Create Trainer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Neuen Trainer erstellen</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vollständiger Name *
                  </label>
                  <input
                    type="text"
                    value={newTrainer.name}
                    onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="z.B. Sebastian Bunde"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    value={newTrainer.email}
                    onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="trainer@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unternehmen
                  </label>
                  <input
                    type="text"
                    value={newTrainer.company}
                    onChange={(e) => setNewTrainer({ ...newTrainer, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Sales Academy"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={newTrainer.position}
                    onChange={(e) => setNewTrainer({ ...newTrainer, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Sales Trainer"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={newTrainer.phone}
                    onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+49 123 456789"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standort
                  </label>
                  <input
                    type="text"
                    value={newTrainer.location}
                    onChange={(e) => setNewTrainer({ ...newTrainer, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="München, Deutschland"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trainer Level
                </label>
                <select
                  value={newTrainer.trainerLevel}
                  onChange={(e) => setNewTrainer({ ...newTrainer, trainerLevel: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={1}>Level 1 - Junior Trainer</option>
                  <option value={2}>Level 2 - Trainer</option>
                  <option value={3}>Level 3 - Senior Trainer</option>
                  <option value={4}>Level 4 - Lead Trainer</option>
                  <option value={5}>Level 5 - Master Trainer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spezialisierungen
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {availableSpecializations.map(spec => (
                    <label key={spec} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newTrainer.specializations.includes(spec)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTrainer({
                              ...newTrainer,
                              specializations: [...newTrainer.specializations, spec]
                            });
                          } else {
                            setNewTrainer({
                              ...newTrainer,
                              specializations: newTrainer.specializations.filter(s => s !== spec)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={newTrainer.bio}
                  onChange={(e) => setNewTrainer({ ...newTrainer, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Kurze Beschreibung des Trainers..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateTrainer}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Trainer erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trainer Modal */}
      {editingTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Trainer bearbeiten</h2>
                <button
                  onClick={() => setEditingTrainer(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vollständiger Name *
                  </label>
                  <input
                    type="text"
                    value={editingTrainer.name}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    value={editingTrainer.email}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unternehmen
                  </label>
                  <input
                    type="text"
                    value={editingTrainer.company || ''}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={editingTrainer.position || ''}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={editingTrainer.phone || ''}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standort
                  </label>
                  <input
                    type="text"
                    value={editingTrainer.location || ''}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trainer Level
                </label>
                <select
                  value={editingTrainer.trainerLevel || 1}
                  onChange={(e) => setEditingTrainer({ ...editingTrainer, trainerLevel: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={1}>Level 1 - Junior Trainer</option>
                  <option value={2}>Level 2 - Trainer</option>
                  <option value={3}>Level 3 - Senior Trainer</option>
                  <option value={4}>Level 4 - Lead Trainer</option>
                  <option value={5}>Level 5 - Master Trainer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spezialisierungen
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {availableSpecializations.map(spec => (
                    <label key={spec} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingTrainer.specializations?.includes(spec) || false}
                        onChange={(e) => {
                          const currentSpecs = editingTrainer.specializations || [];
                          if (e.target.checked) {
                            setEditingTrainer({
                              ...editingTrainer,
                              specializations: [...currentSpecs, spec]
                            });
                          } else {
                            setEditingTrainer({
                              ...editingTrainer,
                              specializations: currentSpecs.filter(s => s !== spec)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={editingTrainer.bio || ''}
                  onChange={(e) => setEditingTrainer({ ...editingTrainer, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Kurze Beschreibung des Trainers..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setEditingTrainer(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleUpdateTrainer}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                <Save size={16} className="mr-2" />
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrainersPage;