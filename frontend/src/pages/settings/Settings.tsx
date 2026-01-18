import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Building2, MapPin, Phone, FileText, Map, Save, CheckCircle } from 'lucide-react'
import { settingsService } from '@/services'
import type { Settings } from '@/types'
import { handleApiError } from '@/lib/api'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<Settings>({
    lodge_name: '',
    address: '',
    phone: '',
    gst_number: '',
    state_name: '',
    state_code: '',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsService.get()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaved(false)

    try {
      setSaving(true)
      await settingsService.save({
        lodge_name: settings.lodge_name,
        address: settings.address,
        phone: settings.phone,
        gst_number: settings.gst_number,
        state_name: settings.state_name,
        state_code: settings.state_code,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      setError(handleApiError(error))
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gray-100 rounded-xl">
            <SettingsIcon className="w-6 h-6 text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-500">Configure your lodge details for bill generation</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-600 font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <span className="text-red-600">{error}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Lodge Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-600" />
            Lodge Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Lodge Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Lodge Name *
              </label>
              <input
                type="text"
                value={settings.lodge_name}
                onChange={(e) => handleChange('lodge_name', e.target.value)}
                placeholder="Enter your lodge name"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Address
              </label>
              <textarea
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none resize-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none"
              />
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                GSTIN/UIN
              </label>
              <input
                type="text"
                value={settings.gst_number}
                onChange={(e) => handleChange('gst_number', e.target.value.toUpperCase())}
                placeholder="e.g., 19ATGPM6881Q1ZL"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none uppercase"
              />
            </div>
          </div>
        </div>

        {/* State Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Map className="w-5 h-5 text-gray-600" />
            State Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* State Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                State Name
              </label>
              <input
                type="text"
                value={settings.state_name}
                onChange={(e) => handleChange('state_name', e.target.value)}
                placeholder="e.g., West Bengal"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none"
              />
            </div>

            {/* State Code */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                State Code
              </label>
              <input
                type="text"
                value={settings.state_code}
                onChange={(e) => handleChange('state_code', e.target.value)}
                placeholder="e.g., 19"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gray-900 rounded-xl font-semibold text-white hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
