import { Group } from '../../types'
import { Users, Star } from 'lucide-react'

interface GroupSelectorProps {
  groups: Group[]
  selectedGroup: Group | null
  onGroupSelect: (group: Group) => void
}

export default function GroupSelector({ groups, selectedGroup, onGroupSelect }: GroupSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Meine Gruppen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => onGroupSelect(group)}
            className={`text-left p-4 rounded-lg border transition-colors ${
              selectedGroup?.id === group.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300 hover:bg-primary-25'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                {group.name.charAt(0)}
              </div>
              <span className="text-sm text-gray-500 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {group.memberCount}
              </span>
            </div>
            
            <h3 className="font-medium text-gray-900 mb-1">{group.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{group.description}</p>
            
            {group.trainer && (
              <div className="flex items-center text-sm text-gray-500">
                <Star className="h-4 w-4 mr-1" />
                <span>{group.trainer}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}