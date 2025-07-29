import { Group } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { Download, FileText, Video, Link, BookOpen } from 'lucide-react'

interface GroupMaterialsProps {
  group: Group
}

export default function GroupMaterials({ group }: GroupMaterialsProps) {
  const { user } = useAuth()
  
  // Check if current user is a trainer for this group
  const isTrainer = user?.role === 'trainer' && (
    group.trainerId === user.id || group.trainerIds?.includes(user.id)
  )

  const handleDownload = (material: any) => {
    // For now, just open the URL
    if (material.url) {
      window.open(material.url, '_blank')
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-8 w-8 text-red-600" />
      case 'video': return <Video className="h-8 w-8 text-blue-600" />
      case 'link': return <Link className="h-8 w-8 text-green-600" />
      default: return <FileText className="h-8 w-8 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Schulungsmaterialien</h3>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-500">
            {group.materials?.length || 0} Materialien verfügbar
          </p>
          {isTrainer && (
            <button
              onClick={() => {
                // Navigate to trainer materials page
                alert('Materialien-Verwaltung wird geöffnet...')
              }}
              className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700"
            >
              Materialien verwalten
            </button>
          )}
        </div>
      </div>

      {group.materials && group.materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {group.materials.map((material) => (
            <div key={material.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getIcon(material.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{material.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {material.type.toUpperCase()} • {new Date(material.uploadDate).toLocaleDateString()}
                  </p>
                  <button 
                    onClick={() => handleDownload(material)}
                    className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Download className="h-4 w-4" />
                    <span>
                      {material.type === 'link' ? 'Öffnen' : 'Herunterladen'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Materialien verfügbar</h3>
          <p className="text-gray-500">Der Trainer hat noch keine Materialien hochgeladen.</p>
        </div>
      )}
    </div>
  )
}