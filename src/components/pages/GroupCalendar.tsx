import { Group } from '../../types'
import { Calendar, Clock, MapPin } from 'lucide-react'

interface GroupCalendarProps {
  group: Group  // eslint-disable-line @typescript-eslint/no-unused-vars
}

export default function GroupCalendar({ group: _group }: GroupCalendarProps) {
  // Mock events for now
  const events = [
    {
      id: '1',
      title: 'Weekly Training Session',
      date: '2025-01-25',
      time: '14:00',
      location: 'Conference Room A',
      type: 'training'
    },
    {
      id: '2',
      title: 'Team Meeting',
      date: '2025-01-27',
      time: '10:00',
      location: 'Virtual',
      type: 'meeting'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gruppenkalender</h3>
      </div>

      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-secondary-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                  <div className="space-y-1 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Termine geplant</h3>
          <p className="text-gray-500">Es sind noch keine Termine für diese Gruppe geplant.</p>
        </div>
      )}
    </div>
  )
}