import { useState, useEffect } from 'react'
import { supabaseService } from '../../lib/supabaseService'
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, X, Save } from 'lucide-react'
import { Group, User } from '../../types'

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  trainerId: string
  trainerName: string
  groupId?: string
  groupName?: string
  capacity: number
  attendees: string[]
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: string
  }
}

interface EventFormData {
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  trainerId: string
  groupId: string
  capacity: number
  recurring: boolean
  recurringType: 'daily' | 'weekly' | 'monthly'
  recurringInterval: number
  recurringEndDate: string
}

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [trainers, setTrainers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedView, setSelectedView] = useState<'month' | 'week' | 'list'>('list')
  
  const [eventForm, setEventForm] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    trainerId: '',
    groupId: '',
    capacity: 20,
    recurring: false,
    recurringType: 'weekly',
    recurringInterval: 1,
    recurringEndDate: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [groupsData, usersData] = await Promise.all([
        supabaseService.getGroups(),
        supabaseService.getUsers()
      ])
      
      setGroups(groupsData)
      setTrainers(usersData.filter(user => user.role === 'trainer'))
      
      // Mock events for demonstration
      const mockEvents: Event[] = [
        {
          id: 'event-1',
          title: 'Weekly Sales Meeting',
          description: 'Review progress and discuss strategies',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 86400000 + 3600000).toISOString(),
          location: 'Conference Room A',
          trainerId: 'trainer-1',
          trainerName: 'Sebastian Bunde',
          groupId: 'group-1',
          groupName: 'Training Group',
          capacity: 20,
          attendees: ['user-1', 'user-2'],
          recurring: {
            type: 'weekly',
            interval: 1,
            endDate: new Date(Date.now() + 86400000 * 90).toISOString()
          }
        },
        {
          id: 'event-2',
          title: 'Advanced Sales Training',
          description: 'Deep dive into advanced sales techniques',
          startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          endDate: new Date(Date.now() + 86400000 * 3 + 7200000).toISOString(),
          location: 'Training Room B',
          trainerId: 'trainer-2',
          trainerName: 'Brigitte Müller',
          groupId: 'group-2',
          groupName: 'Sales Group',
          capacity: 15,
          attendees: ['user-3', 'user-4', 'user-5']
        },
        {
          id: 'event-3',
          title: 'Customer Relationship Workshop',
          description: 'Building lasting customer relationships',
          startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          endDate: new Date(Date.now() + 86400000 * 7 + 5400000).toISOString(),
          location: 'Virtual Meeting',
          trainerId: 'trainer-1',
          trainerName: 'Sebastian Bunde',
          capacity: 25,
          attendees: []
        }
      ]
      
      setEvents(mockEvents)
    } catch (error) {
      console.error('Error loading calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    try {
      const trainer = trainers.find(t => t.id === eventForm.trainerId)
      const group = groups.find(g => g.id === eventForm.groupId)
      
      const newEvent: Event = {
        id: `event-${Date.now()}`,
        title: eventForm.title,
        description: eventForm.description,
        startDate: eventForm.startDate,
        endDate: eventForm.endDate,
        location: eventForm.location,
        trainerId: eventForm.trainerId,
        trainerName: trainer?.name || '',
        groupId: eventForm.groupId || undefined,
        groupName: group?.name || undefined,
        capacity: eventForm.capacity,
        attendees: [],
        recurring: eventForm.recurring ? {
          type: eventForm.recurringType,
          interval: eventForm.recurringInterval,
          endDate: eventForm.recurringEndDate || undefined
        } : undefined
      }

      setEvents([...events, newEvent])
      setShowCreateModal(false)
      resetForm()
      alert('Termin erfolgreich erstellt!')
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Fehler beim Erstellen des Termins')
    }
  }

  const handleUpdateEvent = async () => {
    if (!editingEvent) return

    try {
      const trainer = trainers.find(t => t.id === eventForm.trainerId)
      const group = groups.find(g => g.id === eventForm.groupId)
      
      const updatedEvent: Event = {
        ...editingEvent,
        title: eventForm.title,
        description: eventForm.description,
        startDate: eventForm.startDate,
        endDate: eventForm.endDate,
        location: eventForm.location,
        trainerId: eventForm.trainerId,
        trainerName: trainer?.name || '',
        groupId: eventForm.groupId || undefined,
        groupName: group?.name || undefined,
        capacity: eventForm.capacity,
        recurring: eventForm.recurring ? {
          type: eventForm.recurringType,
          interval: eventForm.recurringInterval,
          endDate: eventForm.recurringEndDate || undefined
        } : undefined
      }

      setEvents(events.map(e => e.id === editingEvent.id ? updatedEvent : e))
      setEditingEvent(null)
      resetForm()
      alert('Termin erfolgreich aktualisiert!')
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Fehler beim Aktualisieren des Termins')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Termin löschen möchten?')) {
      return
    }

    try {
      setEvents(events.filter(e => e.id !== eventId))
      alert('Termin erfolgreich gelöscht!')
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Fehler beim Löschen des Termins')
    }
  }

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      trainerId: '',
      groupId: '',
      capacity: 20,
      recurring: false,
      recurringType: 'weekly',
      recurringInterval: 1,
      recurringEndDate: ''
    })
  }

  const startEditEvent = (event: Event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      trainerId: event.trainerId,
      groupId: event.groupId || '',
      capacity: event.capacity,
      recurring: !!event.recurring,
      recurringType: event.recurring?.type || 'weekly',
      recurringInterval: event.recurring?.interval || 1,
      recurringEndDate: event.recurring?.endDate || ''
    })
    setShowCreateModal(true)
  }

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
            <h1 className="text-2xl font-bold text-primary-800">Kalender-Verwaltung</h1>
            <p className="text-gray-600">Termine und Veranstaltungen verwalten</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Neuer Termin
          </button>
        </div>

        {/* View Toggle */}
        <div className="mt-4 flex space-x-2">
          {[
            { id: 'list', name: 'Liste' },
            { id: 'week', name: 'Woche' },
            { id: 'month', name: 'Monat' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedView === view.id
                  ? 'bg-primary-100 text-primary-800'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {view.name}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Kommende Termine ({events.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {events.map((event) => (
            <div key={event.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                    {event.recurring && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Wiederkehrend
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{event.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{event.attendees.length} / {event.capacity}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Trainer:</span> {event.trainerName}
                    {event.groupName && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="font-medium">Gruppe:</span> {event.groupName}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => startEditEvent(event)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Termin bearbeiten"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Termin löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Termine geplant</h3>
            <p className="mt-1 text-sm text-gray-500">Erstellen Sie Ihren ersten Termin.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingEvent ? 'Termin bearbeiten' : 'Neuen Termin erstellen'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingEvent(null)
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
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Termin-Titel"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standort *
                  </label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Conference Room A"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Beschreibung des Termins..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Startdatum und -zeit *
                  </label>
                  <input
                    type="datetime-local"
                    value={eventForm.startDate.slice(0, 16)}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value + ':00.000Z' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enddatum und -zeit *
                  </label>
                  <input
                    type="datetime-local"
                    value={eventForm.endDate.slice(0, 16)}
                    onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value + ':00.000Z' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trainer *
                  </label>
                  <select
                    value={eventForm.trainerId}
                    onChange={(e) => setEventForm({ ...eventForm, trainerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Trainer auswählen</option>
                    {trainers.map(trainer => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gruppe (optional)
                  </label>
                  <select
                    value={eventForm.groupId}
                    onChange={(e) => setEventForm({ ...eventForm, groupId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Keine Gruppe</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kapazität
                </label>
                <input
                  type="number"
                  value={eventForm.capacity}
                  onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) || 20 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  min="1"
                  max="100"
                />
              </div>
              
              {/* Recurring Options */}
              <div className="border-t pt-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={eventForm.recurring}
                    onChange={(e) => setEventForm({ ...eventForm, recurring: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                    Wiederkehrender Termin
                  </label>
                </div>
                
                {eventForm.recurring && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wiederholung
                      </label>
                      <select
                        value={eventForm.recurringType}
                        onChange={(e) => setEventForm({ ...eventForm, recurringType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="daily">Täglich</option>
                        <option value="weekly">Wöchentlich</option>
                        <option value="monthly">Monatlich</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alle (Anzahl)
                      </label>
                      <input
                        type="number"
                        value={eventForm.recurringInterval}
                        onChange={(e) => setEventForm({ ...eventForm, recurringInterval: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        min="1"
                        max="30"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endet am
                      </label>
                      <input
                        type="date"
                        value={eventForm.recurringEndDate.slice(0, 10)}
                        onChange={(e) => setEventForm({ ...eventForm, recurringEndDate: e.target.value + 'T00:00:00.000Z' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingEvent(null)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Abbrechen
              </button>
              <button
                onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                disabled={!eventForm.title || !eventForm.startDate || !eventForm.endDate || !eventForm.trainerId}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingEvent ? 'Aktualisieren' : 'Erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}