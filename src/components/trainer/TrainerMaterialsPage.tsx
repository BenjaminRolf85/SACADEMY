import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseService } from '../../lib/supabaseService'
import { Group, Material } from '../../types'
import { Upload, FileText, Video, Link, Trash2, Download, Plus, X } from 'lucide-react'

export default function TrainerMaterialsPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'pdf' as 'pdf' | 'video' | 'link',
    url: '',
    file: null as File | null
  })

  useEffect(() => {
    loadTrainerGroups()
  }, [user])

  const loadTrainerGroups = async () => {
    if (!user) return

    try {
      const userGroups = await supabaseService.getUserGroups(user.id, user.role)
      const trainerGroups = userGroups.filter(group => 
        group.trainerId === user.id || group.trainerIds?.includes(user.id)
      )
      setGroups(trainerGroups)
      
      if (trainerGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(trainerGroups[0])
      }
    } catch (error) {
      console.error('Error loading trainer groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadForm({
        ...uploadForm,
        file,
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 
              file.type.includes('video') ? 'video' : 'pdf'
      })
    }
  }

  const handleUploadMaterial = async () => {
    if (!selectedGroup || (!uploadForm.file && !uploadForm.url)) {
      alert('Bitte wählen Sie eine Datei oder geben Sie eine URL ein')
      return
    }

    setUploading(true)
    try {
      let materialUrl = uploadForm.url

      // If file is selected, simulate upload (in real app, upload to storage)
      if (uploadForm.file) {
        // For demo, we'll create a mock URL
        materialUrl = `/materials/${uploadForm.file.name}`
      }

      const newMaterial: Material = {
        id: `material-${Date.now()}`,
        name: uploadForm.name,
        type: uploadForm.type,
        url: materialUrl,
        uploadDate: new Date().toISOString()
      }

      // Update the group's materials
      const updatedGroup = {
        ...selectedGroup,
        materials: [...(selectedGroup.materials || []), newMaterial]
      }

      await supabaseService.updateGroup(selectedGroup.id, updatedGroup)
      
      setSelectedGroup(updatedGroup)
      setGroups(groups.map(g => g.id === selectedGroup.id ? updatedGroup : g))
      
      setShowUploadModal(false)
      setUploadForm({
        name: '',
        type: 'pdf',
        url: '',
        file: null
      })

      alert('Material erfolgreich hochgeladen!')
    } catch (error) {
      console.error('Error uploading material:', error)
      alert('Fehler beim Hochladen des Materials')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (!selectedGroup || !confirm('Sind Sie sicher, dass Sie dieses Material löschen möchten?')) {
      return
    }

    try {
      const updatedMaterials = selectedGroup.materials?.filter(m => m.id !== materialId) || []
      const updatedGroup = {
        ...selectedGroup,
        materials: updatedMaterials
      }

      await supabaseService.updateGroup(selectedGroup.id, updatedGroup)
      
      setSelectedGroup(updatedGroup)
      setGroups(groups.map(g => g.id === selectedGroup.id ? updatedGroup : g))

      alert('Material erfolgreich gelöscht!')
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Fehler beim Löschen des Materials')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-8 w-8 text-red-600" />
      case 'video': return <Video className="h-8 w-8 text-blue-600" />
      case 'link': return <Link className="h-8 w-8 text-green-600" />
      default: return <FileText className="h-8 w-8 text-gray-600" />
    }
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
            <h1 className="text-2xl font-bold text-primary-800">Materialien verwalten</h1>
            <p className="text-gray-600">Laden Sie Schulungsmaterialien für Ihre Gruppen hoch</p>
          </div>
          {selectedGroup && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Material hinzufügen
            </button>
          )}
        </div>
      </div>

      {/* Group Selector */}
      {groups.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Gruppe auswählen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`text-left p-4 rounded-lg border transition-colors ${
                  selectedGroup?.id === group.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <h3 className="font-medium text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {group.materials?.length || 0} Materialien
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Materials List */}
      {selectedGroup && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Materialien für "{selectedGroup.name}"
            </h2>
            <span className="text-sm text-gray-500">
              {selectedGroup.materials?.length || 0} Materialien
            </span>
          </div>

          {selectedGroup.materials && selectedGroup.materials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedGroup.materials.map((material) => (
                <div key={material.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0">
                        {getTypeIcon(material.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{material.name}</h4>
                        <p className="text-sm text-gray-500">
                          {material.type.toUpperCase()} • {new Date(material.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => window.open(material.url, '_blank')}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Herunterladen/Öffnen"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Materialien hochgeladen</h3>
              <p className="text-gray-500">Laden Sie Ihr erstes Schulungsmaterial hoch.</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Material hochladen</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material-Name
                </label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="z.B. Verkaufstraining Grundlagen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material-Typ
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="pdf">PDF Dokument</option>
                  <option value="video">Video</option>
                    <option value="image">Bild</option>
                  <option value="link">Externer Link</option>
                </select>
              </div>

              {uploadForm.type !== 'link' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datei auswählen
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept={
                      uploadForm.type === 'pdf' ? '.pdf' : 
                      uploadForm.type === 'video' ? 'video/*' : 
                      uploadForm.type === 'image' ? 'image/*' : 
                      '*'
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {uploadForm.file && (
                    <p className="text-sm text-gray-500 mt-1">
                      Ausgewählte Datei: {uploadForm.file.name}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={uploadForm.url}
                    onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/resource"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Abbrechen
              </button>
              <button
                onClick={handleUploadMaterial}
                disabled={uploading || !uploadForm.name || (!uploadForm.file && !uploadForm.url)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Hochladen...' : 'Material hochladen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {groups.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-8">
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Gruppen zugewiesen</h3>
            <p className="text-gray-500">Sie sind derzeit keinen Trainingsgruppen als Trainer zugewiesen.</p>
          </div>
        </div>
      )}
    </div>
  )
}