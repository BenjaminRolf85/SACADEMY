import React, { useState, useEffect } from 'react';
import { supabaseService } from '../../lib/supabaseService';
import { Clock, Ban, CheckCircle, AlertTriangle, Users, Search, X, RefreshCw, ShieldAlert, Star, User as UserIcon } from 'lucide-react';
import { User, Group } from '../../types';

const UserAccessManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignGroupModal, setShowAssignGroupModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [assigningGroup, setAssigningGroup] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<{ id: string; name: string; currentRole: string } | null>(null);
  const [changingRole, setChangingRole] = useState(false);

  // Get trainer name for a group
  const getTrainerName = (group: Group) => {
    if (group.trainerId) {
      const trainer = users.find(u => u.id === group.trainerId);
      return trainer?.name || 'Unknown Trainer';
    }
    if (group.trainer) {
      return group.trainer;
    }
    return 'Kein Trainer';
  };

  useEffect(() => {
    fetchUsers();
    fetchGroups();
    
    // Force data refresh to ensure users are available
    if (typeof window !== 'undefined' && window.localStorage) {
      const hasUsers = localStorage.getItem('sales_academy_users')
      if (!hasUsers) {
        console.log('🔄 No users found, forcing data refresh')
        if (window.localStorage.refreshData) {
          window.localStorage.refreshData()
        }
      }
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use localStorage service to get users
      const usersData = await supabaseService.getUsers();
      console.log('📊 Loaded users for admin:', usersData.length);
      
      // If no users, try to initialize with default data
      if (usersData.length === 0) {
        console.log('⚠️ No users found, initializing default users');
        // Reload the page to initialize default data
        window.location.reload();
        return;
      }
      
      // Map users to include group information
      const groupsData = await supabaseService.getGroups();
      const usersWithGroups = usersData.map(user => {
        let userGroups = groupsData.filter(group => 
          group.memberIds?.includes(user.id) || 
          group.trainerId === user.id ||
          group.trainerIds?.includes(user.id)
        );

        // For trainers, show groups they're assigned to
        if (user.role === 'trainer') {
          userGroups = groupsData.filter(group => 
            group.trainerId === user.id || group.trainerIds?.includes(user.id)
          );
        }
        // For regular users, show groups they're members of
        else if (user.role === 'user') {
          userGroups = groupsData.filter(group => 
            group.memberIds?.includes(user.id)
          );
        }
        // For admins, no group assignments needed
        else {
          userGroups = [];
        }

        return {
          ...user,
          groups: userGroups.map(group => ({
            id: group.id,
            name: group.name,
            trainer: getTrainerName(group),
            memberCount: group.memberCount || 0
          })),
          access_expires_at: null,
          is_suspended: user.status === 'suspended'
        };
      });

      setUsers(usersWithGroups);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Fehler beim Laden der Benutzer');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const groupsData = await supabaseService.getGroups();
      setGroups(groupsData);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Fehler beim Laden der Gruppen');
    }
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUsers(),
      fetchGroups()
    ]);
    setRefreshing(false);
  };

  const handleToggleSuspension = async (userId: string, suspend: boolean) => {
    try {
      // Check if trying to suspend an admin
      const user = users.find(u => u.id === userId);
      if (user?.role === 'admin' && suspend) {
        setError('Administratoren können nicht gesperrt werden');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Update user status using localStorage service
      await supabaseService.updateUser(userId, {
        status: suspend ? 'suspended' : 'active'
      });

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: suspend ? 'suspended' : 'active', is_suspended: suspend }
          : user
      ));

      setSuccessMessage(`Benutzer wurde erfolgreich ${suspend ? 'gesperrt' : 'entsperrt'}`);
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      console.error('Error toggling suspension:', err);
      setError('Fehler beim Aktualisieren des Sperrstatus');
      setTimeout(() => setError(null), 3000);
    }
  };

  const openAssignGroupModal = (userId: string, userName: string) => {
    const user = users.find(u => u.id === userId);
    
    // Don't allow group assignment for admins and trainers
    if (user?.role === 'admin' || user?.role === 'trainer') {
      setError('Administratoren und Trainer können keinen Gruppen zugewiesen werden');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    const currentGroupIds = user?.groups?.map(g => g.id) || [];
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSelectedGroupIds(currentGroupIds);
    setShowAssignGroupModal(true);
  };

  const handleAssignGroup = async () => {
    if (!selectedUserId) return;

    try {
      setAssigningGroup(true);

      // Update groups in localStorage
      const allGroups = await supabaseService.getGroups();
      const updatedGroups = allGroups.map(group => {
        // Remove user from all groups first
        const memberIds = (group.memberIds || []).filter(id => id !== selectedUserId);
        const members = (group.members || []).filter(member => 
          !member.includes(users.find(u => u.id === selectedUserId)?.name || '')
        );

        // Add user to selected groups
        if (selectedGroupIds.includes(group.id)) {
          const user = users.find(u => u.id === selectedUserId);
          if (user) {
            memberIds.push(selectedUserId);
            members.push(user.name);
          }
        }

        return {
          ...group,
          memberIds,
          members,
          memberCount: memberIds.length
        };
      });

      // Update all groups
      for (const group of updatedGroups) {
        await supabaseService.updateGroup(group.id, group);
      }

      // Update local user state
      const assignedGroups = updatedGroups
        .filter(group => group.memberIds?.includes(selectedUserId))
        .map(group => ({ id: group.id, name: group.name }));

      setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === selectedUserId) {
          return {
            ...user,
            groups: assignedGroups
          };
        }
        return user;
      }));

      setShowAssignGroupModal(false);
      setSelectedUserId(null);
      setSelectedUserName('');
      setSelectedGroupIds([]);
      setSuccessMessage('Gruppen wurden erfolgreich aktualisiert!');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      console.error('Error updating group assignments:', err);
      setError('Fehler beim Aktualisieren der Gruppen');
      setTimeout(() => setError(null), 3000);
    } finally {
      setAssigningGroup(false);
    }
  };

  const openRoleModal = (userId: string, userName: string, currentRole: string) => {
    // Don't allow changing admin roles
    if (currentRole === 'admin') {
      setError('Administrator-Rollen können nicht geändert werden');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setSelectedUserForRole({ id: userId, name: userName, currentRole });
    setShowRoleModal(true);
  };

  const handleRoleChange = async (newRole: 'user' | 'trainer') => {
    if (!selectedUserForRole) return;

    try {
      setChangingRole(true);

      // Update user role
      await supabaseService.updateUser(selectedUserForRole.id, { role: newRole });

      // If changing from trainer to user, remove from trainer assignments
      if (selectedUserForRole.currentRole === 'trainer' && newRole === 'user') {
        const allGroups = await supabaseService.getGroups();
        const updatedGroups = allGroups.map(group => {
          const trainerIds = (group.trainerIds || []).filter(id => id !== selectedUserForRole.id);
          const trainers = (group.trainers || []).filter(trainer => 
            !trainer.includes(selectedUserForRole.name)
          );

          return {
            ...group,
            trainerId: group.trainerId === selectedUserForRole.id ? undefined : group.trainerId,
            trainer: group.trainer === selectedUserForRole.name ? undefined : group.trainer,
            trainerIds,
            trainers
          };
        });

        // Update all affected groups
        for (const group of updatedGroups) {
          if (group.trainerId !== selectedUserForRole.id && !group.trainerIds?.includes(selectedUserForRole.id)) {
            await supabaseService.updateGroup(group.id, group);
          }
        }
      }

      // Update local user state
      setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === selectedUserForRole.id) {
          return {
            ...user,
            role: newRole,
            // Clear trainer-specific fields if changing to user
            ...(newRole === 'user' ? {
              specializations: undefined,
              trainerLevel: undefined
            } : {})
          };
        }
        return user;
      }));

      setShowRoleModal(false);
      setSelectedUserForRole(null);
      setSuccessMessage(`Benutzerrolle wurde erfolgreich auf "${newRole === 'trainer' ? 'Trainer' : 'Benutzer'}" geändert`);
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Fehler beim Aktualisieren der Benutzerrolle');
      setTimeout(() => setError(null), 3000);
    } finally {
      setChangingRole(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldAlert size={16} className="text-primary-600" />;
      case 'trainer': return <Star size={16} className="text-secondary-600" />;
      default: return <UserIcon size={16} className="text-gray-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">Administrator</span>;
      case 'trainer':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">Trainer</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Benutzer</span>;
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-1 text-primary-800">
                Benutzerzugriff verwalten
              </h1>
              <p className="text-gray-600">Benutzerzugriff und Gruppenzuweisungen verwalten</p>
            </div>
            <button 
              onClick={handleRefreshData}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Daten aktualisieren
            </button>
          </div>
        </div>
      </div>
      
      {successMessage && (
        <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-lg flex items-center">
          <CheckCircle className="mr-2" size={20} />
          {successMessage}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Benutzer nach Namen oder E-Mail suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <AlertTriangle className="mr-2" size={20} />
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benutzer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kurse/Gruppen & Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const canSuspend = user.role !== 'admin';
                
                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-3">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.position && (
                            <div className="text-xs text-gray-400">{user.position}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status === 'suspended' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Ban size={12} className="mr-1" />
                          Gesperrt
                        </span>
                      ) : user.status === 'expired' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Clock size={12} className="mr-1" />
                          Abgelaufen
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Aktiv
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="min-w-0">
                        {user.role === 'admin' ? (
                          <div className="flex items-center text-gray-400 italic">
                            <Users size={16} className="mr-2" />
                            <span>Administrator - Zugriff auf alle Kurse</span>
                          </div>
                        ) : user.role === 'trainer' ? (
                          <div className="space-y-1">
                            <div className="flex items-center text-gray-700 font-medium">
                              <Users size={16} className="text-secondary-600 mr-2" />
                              <span>Zugewiesene Kurse ({user.groups?.length || 0}):</span>
                            </div>
                            {user.groups && user.groups.length > 0 ? (
                              <div className="space-y-1">
                                {user.groups.map((group) => (
                                  <div key={group.id} className="pl-6 text-sm">
                                    <div className="font-medium text-gray-900">{group.name}</div>
                                    <div className="text-gray-500">{group.memberCount} Studierende</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="pl-6 text-sm text-gray-500 italic">Keine Kurse zugewiesen</div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center text-gray-700 font-medium">
                              <Users size={16} className="text-primary-600 mr-2" />
                              <span>Eingeschrieben in:</span>
                            </div>
                            {user.groups && user.groups.length > 0 ? (
                              <div className="space-y-2">
                                {user.groups.map((group) => (
                                  <div key={group.id} className="pl-6 text-sm bg-gray-50 rounded p-2">
                                    <div className="font-medium text-gray-900">{group.name}</div>
                                    <div className="text-gray-600 flex items-center">
                                      <span className="mr-4">👨‍🏫 Trainer: {group.trainer}</span>
                                      <span>👥 {group.memberCount} Studierende</span>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  onClick={() => openAssignGroupModal(user.id, user.name)}
                                  className="text-xs text-primary-600 hover:text-primary-800 hover:underline pl-6"
                                >
                                  Kurse ändern
                                </button>
                              </div>
                            ) : (
                              <div className="pl-6">
                                <div className="text-sm text-gray-500 italic mb-2">Nicht eingeschrieben</div>
                                <button
                                  onClick={() => openAssignGroupModal(user.id, user.name)}
                                  className="text-xs text-primary-600 hover:text-primary-800 hover:underline"
                                >
                                  Kurs zuweisen
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-gray-600">
                          Level: {user.level} • Punkte: {user.points}
                        </div>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => openRoleModal(user.id, user.name, user.role)}
                            className="px-3 py-1 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md text-sm font-medium w-fit"
                          >
                            Rolle ändern
                          </button>
                        )}
                        {canSuspend && (
                          <button
                            onClick={() => handleToggleSuspension(user.id, !user.is_suspended)}
                            className={`px-3 py-1 rounded-md text-sm font-medium w-fit ${
                              user.is_suspended
                                ? 'text-green-700 bg-green-100 hover:bg-green-200'
                                : 'text-red-700 bg-red-100 hover:bg-red-200'
                            }`}
                          >
                            {user.is_suspended ? 'Entsperren' : 'Sperren'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 bg-yellow-50 rounded-lg">
              <Users className="mx-auto h-12 w-12 text-yellow-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Benutzer gefunden</h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                {searchTerm ? 'Keine Benutzer entsprechen Ihrer Suche.' : 'Benutzer werden geladen...'}
              </p>
              <button
                onClick={handleRefreshData}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <RefreshCw size={16} className="mr-2" />
                Daten neu laden
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Assign Group Modal */}
      {showAssignGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full group-modal">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Gruppen zuweisen für {selectedUserName}</h2>
                <button
                  onClick={() => setShowAssignGroupModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gruppen auswählen
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {groups.map((group: Group) => (
                    <label key={group.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.includes(group.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGroupIds([...selectedGroupIds, group.id]);
                          } else {
                            setSelectedGroupIds(selectedGroupIds.filter(id => id !== group.id));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-900">{group.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAssignGroupModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAssignGroup}
                  disabled={assigningGroup}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigningGroup ? 'Aktualisierung...' : 'Gruppen aktualisieren'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUserForRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Rolle ändern für {selectedUserForRole.name}
                </h2>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Aktuelle Rolle: <span className="font-medium">{selectedUserForRole.currentRole === 'trainer' ? 'Trainer' : 'Benutzer'}</span>
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Benutzer</div>
                      <div className="text-sm text-gray-500">Standard-Benutzerrolle mit Zugriff auf Trainings</div>
                    </div>
                    <button
                      onClick={() => handleRoleChange('user')}
                      disabled={changingRole || selectedUserForRole.currentRole === 'user'}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        selectedUserForRole.currentRole === 'user'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {selectedUserForRole.currentRole === 'user' ? 'Aktuelle Rolle' : 'Als Benutzer festlegen'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Trainer</div>
                      <div className="text-sm text-gray-500">Kann Gruppen verwalten und Trainings durchführen</div>
                    </div>
                    <button
                      onClick={() => handleRoleChange('trainer')}
                      disabled={changingRole || selectedUserForRole.currentRole === 'trainer'}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        selectedUserForRole.currentRole === 'trainer'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {selectedUserForRole.currentRole === 'trainer' ? 'Aktuelle Rolle' : 'Als Trainer festlegen'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccessManagement;