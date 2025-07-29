import { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Save, 
  X, 
  CheckCircle, 
  Users,
  AlertTriangle
} from 'lucide-react'

interface TermsVersion {
  id: string
  version: string
  title: string
  content: string
  createdAt: string
  isActive: boolean
  acceptances: TermsAcceptance[]
}

interface TermsAcceptance {
  id: string
  userId: string
  userName?: string
  termsVersionId: string
  acceptedAt: string
  ipAddress: string
}

interface TermsFormData {
  title: string
  content: string
  version: string
}

export default function AdminTermsPage() {
  const [termsVersions, setTermsVersions] = useState<TermsVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTerms, setEditingTerms] = useState<TermsVersion | null>(null)
  const [viewingTerms, setViewingTerms] = useState<TermsVersion | null>(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [termsForm, setTermsForm] = useState<TermsFormData>({
    title: '',
    content: '',
    version: ''
  })

  useEffect(() => {
    loadTermsVersions()
  }, [])

  const loadTermsVersions = async () => {
    try {
      setLoading(true)
      
      // Load from localStorage for now
      const savedTerms = localStorage.getItem('sales_academy_terms_versions')
      if (savedTerms) {
        const terms = JSON.parse(savedTerms)
        
        // Mock user data for acceptances
        const mockUsers = [
          { id: 'admin-1', name: 'Admin User' },
          { id: 'trainer-1', name: 'Sebastian Bunde' },
          { id: 'user-1', name: 'Max Mustermann' },
          { id: 'user-2', name: 'Anna Schmidt' }
        ]
        
        const termsWithUsers = terms.map((term: any) => ({
          ...term,
          acceptances: term.acceptances?.map((acceptance: any) => ({
            ...acceptance,
            userName: mockUsers.find(u => u.id === acceptance.userId)?.name || 'Unbekannter Benutzer'
          })) || []
        }))
        
        setTermsVersions(termsWithUsers)
      } else {
        // Initialize with default terms
        const defaultTerms: TermsVersion = {
          id: 'terms-1',
          version: '1.0',
          title: 'Sales Academy Nutzungsbedingungen',
          content: `# Sales Academy Nutzungsbedingungen

## 1. Geltungsbereich
Diese Nutzungsbedingungen gelten für die Nutzung der Sales Academy Plattform.

## 2. Registrierung und Zugang
- Die Registrierung ist kostenlos
- Sie müssen wahrheitsgemäße Angaben machen
- Ihr Zugang ist persönlich und nicht übertragbar

## 3. Nutzungsregeln
- Respektvoller Umgang mit anderen Teilnehmern
- Keine Verbreitung von unangemessenen Inhalten
- Beachtung der Urheberrechte

## 4. Datenschutz
Ihre personenbezogenen Daten werden gemäß unserer Datenschutzerklärung verarbeitet.

## 5. Haftung
Die Sales Academy haftet nur für vorsätzliche oder grob fahrlässige Pflichtverletzungen.

## 6. Änderungen
Wir behalten uns vor, diese Bedingungen zu ändern. Sie werden über Änderungen informiert.

## 7. Schlussbestimmungen
Es gilt deutsches Recht. Gerichtsstand ist München.`,
          createdAt: new Date().toISOString(),
          isActive: true,
          acceptances: [
            {
              id: 'accept-1',
              userId: 'admin-1',
              userName: 'Admin User',
              termsVersionId: 'terms-1',
              acceptedAt: new Date().toISOString(),
              ipAddress: '127.0.0.1'
            }
          ]
        }
        
        setTermsVersions([defaultTerms])
        localStorage.setItem('sales_academy_terms_versions', JSON.stringify([defaultTerms]))
      }
    } catch (err) {
      console.error('Error loading terms:', err)
      setError('Fehler beim Laden der Nutzungsbedingungen')
    } finally {
      setLoading(false)
    }
  }

  const saveTerms = async () => {
    try {
      setSaving(true)
      
      if (!termsForm.title || !termsForm.content || !termsForm.version) {
        setError('Bitte füllen Sie alle Felder aus')
        return
      }

      if (editingTerms) {
        // Update existing terms
        const updatedTerms = termsVersions.map(terms =>
          terms.id === editingTerms.id
            ? { ...terms, ...termsForm }
            : terms
        )
        setTermsVersions(updatedTerms)
        localStorage.setItem('sales_academy_terms_versions', JSON.stringify(updatedTerms))
        setEditingTerms(null)
      } else {
        // Create new terms
        const newTerms: TermsVersion = {
          id: `terms-${Date.now()}`,
          ...termsForm,
          createdAt: new Date().toISOString(),
          isActive: false,
          acceptances: []
        }
        
        const updatedTerms = [...termsVersions, newTerms]
        setTermsVersions(updatedTerms)
        localStorage.setItem('sales_academy_terms_versions', JSON.stringify(updatedTerms))
      }
      
      setShowCreateModal(false)
      resetForm()
      setSuccessMessage('Nutzungsbedingungen erfolgreich gespeichert!')
      setTimeout(() => setSuccessMessage(null), 3000)
      
    } catch (err) {
      console.error('Error saving terms:', err)
      setError('Fehler beim Speichern der Nutzungsbedingungen')
      setTimeout(() => setError(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const activateTerms = async (termsId: string) => {
    try {
      // Deactivate all other terms and activate the selected one
      const updatedTerms = termsVersions.map(terms => ({
        ...terms,
        isActive: terms.id === termsId
      }))
      
      setTermsVersions(updatedTerms)
      localStorage.setItem('sales_academy_terms_versions', JSON.stringify(updatedTerms))
      
      setSuccessMessage('Nutzungsbedingungen aktiviert!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error activating terms:', err)
      setError('Fehler beim Aktivieren der Nutzungsbedingungen')
      setTimeout(() => setError(null), 3000)
    }
  }

  const deleteTerms = async (termsId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Nutzungsbedingungen löschen möchten?')) {
      return
    }

    try {
      const termsToDelete = termsVersions.find(t => t.id === termsId)
      if (termsToDelete?.isActive) {
        setError('Aktive Nutzungsbedingungen können nicht gelöscht werden')
        setTimeout(() => setError(null), 3000)
        return
      }

      const updatedTerms = termsVersions.filter(terms => terms.id !== termsId)
      setTermsVersions(updatedTerms)
      localStorage.setItem('sales_academy_terms_versions', JSON.stringify(updatedTerms))
      
      setSuccessMessage('Nutzungsbedingungen gelöscht!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error deleting terms:', err)
      setError('Fehler beim Löschen der Nutzungsbedingungen')
      setTimeout(() => setError(null), 3000)
    }
  }

  const startEdit = (terms: TermsVersion) => {
    setEditingTerms(terms)
    setTermsForm({
      title: terms.title,
      content: terms.content,
      version: terms.version
    })
    setShowCreateModal(true)
  }

  const resetForm = () => {
    setTermsForm({
      title: '',
      content: '',
      version: ''
    })
    setEditingTerms(null)
  }

  const getNextVersion = () => {
    if (termsVersions.length === 0) return '1.0'
    
    const versions = termsVersions.map(t => t.version).sort()
    const lastVersion = versions[versions.length - 1]
    const [major, minor] = lastVersion.split('.').map(Number)
    
    return `${major}.${minor + 1}`
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
            <h1 className="text-2xl font-bold text-primary-800">AGB-Verwaltung</h1>
            <p className="text-gray-600">Nutzungsbedingungen erstellen und verwalten</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setTermsForm(prev => ({ ...prev, version: getNextVersion() }))
              setShowCreateModal(true)
            }}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus size={16} className="mr-2" />
            Neue Version erstellen
          </button>
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

      {/* Terms Versions List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Alle Versionen ({termsVersions.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {termsVersions.map((terms) => (
            <div key={terms.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{terms.title}</h3>
                    <span className="text-sm text-gray-500">v{terms.version}</span>
                    {terms.isActive && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1" />
                        Aktiv
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    Erstellt am {new Date(terms.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{terms.acceptances.length} Akzeptanzen</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>{terms.content.length} Zeichen</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setViewingTerms(terms)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Ansehen"
                  >
                    <Eye size={16} />
                  </button>
                  
                  <button
                    onClick={() => startEdit(terms)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                    title="Bearbeiten"
                  >
                    <Edit size={16} />
                  </button>
                  
                  {!terms.isActive && (
                    <button
                      onClick={() => activateTerms(terms.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      title="Aktivieren"
                    >
                      Aktivieren
                    </button>
                  )}
                  
                  {!terms.isActive && (
                    <button
                      onClick={() => deleteTerms(terms.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Löschen"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Acceptances Preview */}
              {terms.acceptances.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Neueste Akzeptanzen:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {terms.acceptances.slice(0, 6).map((acceptance) => (
                      <div key={acceptance.id} className="text-xs bg-gray-50 p-2 rounded">
                        <div className="font-medium">{acceptance.userName}</div>
                        <div className="text-gray-500">
                          {new Date(acceptance.acceptedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  {terms.acceptances.length > 6 && (
                    <div className="text-xs text-gray-500 mt-2">
                      +{terms.acceptances.length - 6} weitere Akzeptanzen
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {termsVersions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Nutzungsbedingungen vorhanden</h3>
            <p className="mt-1 text-sm text-gray-500">Erstellen Sie Ihre ersten Nutzungsbedingungen.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingTerms ? 'Nutzungsbedingungen bearbeiten' : 'Neue Nutzungsbedingungen erstellen'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
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
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={termsForm.title}
                    onChange={(e) => setTermsForm({ ...termsForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="z.B. Sales Academy Nutzungsbedingungen"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version *
                  </label>
                  <input
                    type="text"
                    value={termsForm.version}
                    onChange={(e) => setTermsForm({ ...termsForm, version: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="z.B. 1.0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inhalt * (Markdown wird unterstützt)
                </label>
                <textarea
                  value={termsForm.content}
                  onChange={(e) => setTermsForm({ ...termsForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                  rows={20}
                  placeholder="Inhalt der Nutzungsbedingungen..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Abbrechen
              </button>
              <button
                onClick={saveTerms}
                disabled={saving || !termsForm.title || !termsForm.content || !termsForm.version}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Speichern...' : editingTerms ? 'Aktualisieren' : 'Erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{viewingTerms.title}</h2>
                  <p className="text-sm text-gray-500">Version {viewingTerms.version}</p>
                </div>
                <button
                  onClick={() => setViewingTerms(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                  {viewingTerms.content}
                </pre>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">
                Akzeptanzen ({viewingTerms.acceptances.length})
              </h3>
              {viewingTerms.acceptances.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {viewingTerms.acceptances.map((acceptance) => (
                    <div key={acceptance.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{acceptance.userName}</span>
                      <div className="text-sm text-gray-500">
                        {new Date(acceptance.acceptedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Noch keine Akzeptanzen vorhanden.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}