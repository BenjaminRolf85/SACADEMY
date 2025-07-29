import { useState, useEffect } from 'react'
import { 
  Save, 
  RefreshCw, 
  Bell, 
  Shield, 
  Globe, 
  MessageSquare,
  Award,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    supportEmail: string
    timezone: string
    language: string
    maintenanceMode: boolean
  }
  authentication: {
    allowRegistration: boolean
    requireEmailConfirmation: boolean
    passwordMinLength: number
    sessionTimeout: number
    maxLoginAttempts: number
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    smsNotifications: boolean
    adminAlerts: boolean
    userWelcomeEmail: boolean
  }
  learning: {
    defaultQuizPassingScore: number
    maxQuizAttempts: number
    certificateEnabled: boolean
    pointsPerQuiz: number
    pointsPerCompletion: number
  }
  forum: {
    moderationRequired: boolean
    allowAnonymousPosts: boolean
    maxPostLength: number
    autoApproveTrainerPosts: boolean
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'Sales Academy',
      siteDescription: 'Sebastian Bunde Vertriebstraining Platform',
      supportEmail: 'support@sales-academy.com',
      timezone: 'Europe/Berlin',
      language: 'de',
      maintenanceMode: false
    },
    authentication: {
      allowRegistration: true,
      requireEmailConfirmation: false,
      passwordMinLength: 8,
      sessionTimeout: 24,
      maxLoginAttempts: 5
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      adminAlerts: true,
      userWelcomeEmail: true
    },
    learning: {
      defaultQuizPassingScore: 70,
      maxQuizAttempts: 3,
      certificateEnabled: true,
      pointsPerQuiz: 10,
      pointsPerCompletion: 50
    },
    forum: {
      moderationRequired: true,
      allowAnonymousPosts: false,
      maxPostLength: 2000,
      autoApproveTrainerPosts: true
    }
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // In a real app, load from backend
      // For now, use localStorage
      const savedSettings = localStorage.getItem('sales_academy_settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      setError('Fehler beim Laden der Einstellungen')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // In a real app, save to backend
      localStorage.setItem('sales_academy_settings', JSON.stringify(settings))
      
      setSuccessMessage('Einstellungen erfolgreich gespeichert!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Fehler beim Speichern der Einstellungen')
      setTimeout(() => setError(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    if (!confirm('Sind Sie sicher, dass Sie alle Einstellungen auf die Standardwerte zurücksetzen möchten?')) {
      return
    }

    // Reset to default values
    setSettings({
      general: {
        siteName: 'Sales Academy',
        siteDescription: 'Sebastian Bunde Vertriebstraining Platform',
        supportEmail: 'support@sales-academy.com',
        timezone: 'Europe/Berlin',
        language: 'de',
        maintenanceMode: false
      },
      authentication: {
        allowRegistration: true,
        requireEmailConfirmation: false,
        passwordMinLength: 8,
        sessionTimeout: 24,
        maxLoginAttempts: 5
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
        adminAlerts: true,
        userWelcomeEmail: true
      },
      learning: {
        defaultQuizPassingScore: 70,
        maxQuizAttempts: 3,
        certificateEnabled: true,
        pointsPerQuiz: 10,
        pointsPerCompletion: 50
      },
      forum: {
        moderationRequired: true,
        allowAnonymousPosts: false,
        maxPostLength: 2000,
        autoApproveTrainerPosts: true
      }
    })
  }

  const updateSettings = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const tabs = [
    { id: 'general', name: 'Allgemein', icon: Globe },
    { id: 'authentication', name: 'Authentifizierung', icon: Shield },
    { id: 'notifications', name: 'Benachrichtigungen', icon: Bell },
    { id: 'learning', name: 'Lernen', icon: Award },
    { id: 'forum', name: 'Forum', icon: MessageSquare }
  ]

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
            <h1 className="text-2xl font-bold text-primary-800">System-Einstellungen</h1>
            <p className="text-gray-600">Konfiguration der Sales Academy Plattform</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetToDefaults}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw size={16} className="mr-2" />
              Zurücksetzen
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
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

      {/* Settings Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site-Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Support E-Mail
                  </label>
                  <input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSettings('general', 'supportEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site-Beschreibung
                </label>
                <textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zeitzone
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => updateSettings('general', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Europe/Berlin">Europa/Berlin</option>
                    <option value="Europe/Vienna">Europa/Wien</option>
                    <option value="Europe/Zurich">Europa/Zürich</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sprache
                  </label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => updateSettings('general', 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => updateSettings('general', 'maintenanceMode', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="maintenanceMode" className="text-sm text-gray-700">
                  Wartungsmodus aktivieren
                </label>
              </div>
            </div>
          )}

          {/* Authentication Settings */}
          {activeTab === 'authentication' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimale Passwort-Länge
                  </label>
                  <input
                    type="number"
                    value={settings.authentication.passwordMinLength}
                    onChange={(e) => updateSettings('authentication', 'passwordMinLength', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="6"
                    max="20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session-Timeout (Stunden)
                  </label>
                  <input
                    type="number"
                    value={settings.authentication.sessionTimeout}
                    onChange={(e) => updateSettings('authentication', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    max="168"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max. Anmelde-Versuche
                </label>
                <input
                  type="number"
                  value={settings.authentication.maxLoginAttempts}
                  onChange={(e) => updateSettings('authentication', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  min="3"
                  max="10"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowRegistration"
                    checked={settings.authentication.allowRegistration}
                    onChange={(e) => updateSettings('authentication', 'allowRegistration', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="allowRegistration" className="text-sm text-gray-700">
                    Registrierung erlauben
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireEmailConfirmation"
                    checked={settings.authentication.requireEmailConfirmation}
                    onChange={(e) => updateSettings('authentication', 'requireEmailConfirmation', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="requireEmailConfirmation" className="text-sm text-gray-700">
                    E-Mail-Bestätigung erforderlich
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">E-Mail-Benachrichtigungen</div>
                    <div className="text-sm text-gray-500">Benachrichtigungen per E-Mail senden</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => updateSettings('notifications', 'emailNotifications', e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Push-Benachrichtigungen</div>
                    <div className="text-sm text-gray-500">Browser-Push-Benachrichtigungen</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => updateSettings('notifications', 'pushNotifications', e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">SMS-Benachrichtigungen</div>
                    <div className="text-sm text-gray-500">Wichtige Updates per SMS</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => updateSettings('notifications', 'smsNotifications', e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Admin-Warnungen</div>
                    <div className="text-sm text-gray-500">Kritische System-Warnungen</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.adminAlerts}
                    onChange={(e) => updateSettings('notifications', 'adminAlerts', e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Willkommens-E-Mail</div>
                    <div className="text-sm text-gray-500">Automatische Begrüßung neuer Benutzer</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.userWelcomeEmail}
                    onChange={(e) => updateSettings('notifications', 'userWelcomeEmail', e.target.checked)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Learning Settings */}
          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standard Quiz-Bestehensnote (%)
                  </label>
                  <input
                    type="number"
                    value={settings.learning.defaultQuizPassingScore}
                    onChange={(e) => updateSettings('learning', 'defaultQuizPassingScore', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="50"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max. Quiz-Versuche
                  </label>
                  <input
                    type="number"
                    value={settings.learning.maxQuizAttempts}
                    onChange={(e) => updateSettings('learning', 'maxQuizAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Punkte pro Quiz
                  </label>
                  <input
                    type="number"
                    value={settings.learning.pointsPerQuiz}
                    onChange={(e) => updateSettings('learning', 'pointsPerQuiz', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Punkte pro Kurs-Abschluss
                  </label>
                  <input
                    type="number"
                    value={settings.learning.pointsPerCompletion}
                    onChange={(e) => updateSettings('learning', 'pointsPerCompletion', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="10"
                    max="500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="certificateEnabled"
                  checked={settings.learning.certificateEnabled}
                  onChange={(e) => updateSettings('learning', 'certificateEnabled', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="certificateEnabled" className="text-sm text-gray-700">
                  Zertifikate aktivieren
                </label>
              </div>
            </div>
          )}

          {/* Forum Settings */}
          {activeTab === 'forum' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max. Post-Länge (Zeichen)
                </label>
                <input
                  type="number"
                  value={settings.forum.maxPostLength}
                  onChange={(e) => updateSettings('forum', 'maxPostLength', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  min="100"
                  max="10000"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Moderation erforderlich</div>
                    <div className="text-sm text-gray-500">Alle Posts müssen vor Veröffentlichung genehmigt werden</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.forum.moderationRequired}
                    onChange={(e) => updateSettings('forum', 'moderationRequired', e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Anonyme Posts erlauben</div>
                    <div className="text-sm text-gray-500">Benutzer können anonym posten</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.forum.allowAnonymousPosts}
                    onChange={(e) => updateSettings('forum', 'allowAnonymousPosts', e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Trainer-Posts automatisch genehmigen</div>
                    <div className="text-sm text-gray-500">Posts von Trainern werden ohne Moderation veröffentlicht</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.forum.autoApproveTrainerPosts}
                    onChange={(e) => updateSettings('forum', 'autoApproveTrainerPosts', e.target.checked)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}