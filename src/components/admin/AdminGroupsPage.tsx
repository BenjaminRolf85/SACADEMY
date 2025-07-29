import React, { useState, useEffect } from 'react';
import { supabaseService } from '../../lib/supabaseService';
import { Plus, Edit, Trash2, Save, X, Users, Star, Calendar, MapPin, Search, RefreshCw } from 'lucide-react';
import { Group, User } from '../../types';

interface GroupFormData {
  name: string;
  description: string;
  company_id?: string;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'completed' | 'upcoming';
  capacity: number;
  trainer_id?: string;
}

const AdminGroupsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const [newGroup, setNewGroup] = useState<GroupFormData>({
    name: '',
    description: '',
    status: 'upcoming',
    capacity: 20
  });

  useEffect(() => {
    // Check data integrity on load
    if (typeof window !== 'undefined' && window.localStorage) {
      const hasTrainers = localStorage.getUsers?.().some((u: any) => u.role === 'trainer') || false
      if (!hasTrainers) {
        console.log('🔄 Refreshing data to ensure trainers are available')
        localStorage.refreshData?.()
      }
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [groupsData, usersData] = await Promise.all([
        supabaseService.getGroups(),
        supabaseService.getUsers()
      ]);
      
      setGroups(groupsData);
      setUsers(usersData);
      
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

  const handleCreateGroup = async () => {
    try {
      if (!newGroup.name.trim()) {
        setError('Gruppenname ist erforderlich');
        return;
      }

      const groupData = {
        ...newGroup,
        memberCount: 0,
        members: [],
        memberIds: [],
        materials: []
      };

      await supabaseService.createGroup(groupData);
      
      setShowCreateModal(false);
      setNewGroup({
        name: '',
        description: '',
        status: 'upcoming',
        capacity: 20
      });
      
      setSuccessMessage('Gruppe erfolgreich erstellt!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      loadData();
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Fehler beim Erstellen der Gruppe');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;

    try {
      await supabaseService.updateGroup(editingGroup.id, editingGroup);
      
      setEditingGroup(null);
      setSuccessMessage('Gruppe erfolgreich aktualisiert!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      loadData();
    } catch (err) {
      console.error('Error updating group:', err);
      setError('Fehler beim Aktualisieren der Gruppe');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Gruppe löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      await supabaseService.deleteGroup(groupId);
      
      setSuccessMessage('Gruppe erfolgreich gelöscht!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      loadData();
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Fehler beim Löschen der Gruppe');
      setTimeout(() => setError(null), 3000);
    }
  };


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Aktiv' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Abgeschlossen' },
      upcoming: { color: 'bg-blue-100 text-blue-800', label: 'Geplant' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const trainers = users.filter(user => user.role === 'trainer');
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl font-bold text-primary-800">Gruppen-Verwaltung</h1>
            <p className="text-gray-600">Trainingsgruppen erstellen und verwalten</p>
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
              Neue Gruppe
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
            placeholder="Gruppen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Groups List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Alle Gruppen ({filteredGroups.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredGroups.map((group) => (
            <div key={group.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                    {getStatusBadge(group.status)}
                  </div>
                  <p className="text-gray-600 mb-3">{group.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{group.memberCount || 0} / {group.capacity || 20} Mitglieder</span>
                    </div>
                    
                    <div className="flex items-center text-gray-500">
                      <Star className="h-4 w-4 mr-2" />
                      <span>{group.trainer || group.trainers?.[0] || 'Kein Trainer'}</span>
                    </div>
                    
                    {group.startDate && (
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(group.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {group.company && (
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{group.company}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setEditingGroup(group)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Gruppe bearbeiten"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Gruppe löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Gruppen gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Keine Gruppen entsprechen Ihrer Suche.' : 'Erstellen Sie Ihre erste Trainingsgruppe.'}
            </p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Neue Gruppe erstellen</h2>
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
                    Gruppenname *
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="z.B. Advanced Sales Training"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newGroup.status}
                    onChange={(e) => setNewGroup({ ...newGroup, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="upcoming">Geplant</option>
                    <option value="active">Aktiv</option>
                    <option value="completed">Abgeschlossen</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Beschreibung der Gruppe und des Trainings..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapazität
                  </label>
                  <input
                    type="number"
                    value={newGroup.capacity}
                    onChange={(e) => setNewGroup({ ...newGroup, capacity: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trainer zuweisen
                  </label>
                  <select
                    value={newGroup.trainer_id || ''}
                    onChange={(e) => setNewGroup({ ...newGroup, trainer_id: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Kein Trainer</option>
                    {trainers.map(trainer => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Startdatum
                  </label>
                  <input
                    type="date"
                    value={newGroup.start_date || ''}
                    onChange={(e) => setNewGroup({ ...newGroup, start_date: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enddatum
                  </label>
                  <input
                    type="date"
                    value={newGroup.end_date || ''}
                    onChange={(e) => setNewGroup({ ...newGroup, end_date: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
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
                onClick={handleCreateGroup}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Gruppe erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gruppe bearbeiten</h2>
                <button
                  onClick={() => setEditingGroup(null)}
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
                    Gruppenname *
                  </label>
                  <input
                    type="text"
                    value={editingGroup.name}
                    onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingGroup.status}
                    onChange={(e) => setEditingGroup({ ...editingGroup, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="upcoming">Geplant</option>
                    <option value="active">Aktiv</option>
                    <option value="completed">Abgeschlossen</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={editingGroup.description}
                  onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapazität
                  </label>
                  <input
                    type="number"
                    value={editingGroup.capacity || 20}
                    onChange={(e) => setEditingGroup({ ...editingGroup, capacity: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trainer
                  </label>
                  <select
                    value={editingGroup.trainerId || ''}
                    onChange={(e) => setEditingGroup({ ...editingGroup, trainerId: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Kein Trainer</option>
                    {trainers.map(trainer => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Startdatum
                  </label>
                  <input
                    type="date"
                    value={editingGroup.startDate || ''}
                    onChange={(e) => setEditingGroup({ ...editingGroup, startDate: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enddatum
                  </label>
                  <input
                    type="date"
                    value={editingGroup.endDate || ''}
                    onChange={(e) => setEditingGroup({ ...editingGroup, endDate: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setEditingGroup(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleUpdateGroup}
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

export default AdminGroupsPage;