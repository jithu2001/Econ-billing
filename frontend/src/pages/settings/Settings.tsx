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
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="slide-in-left">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <SettingsIcon className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        </div>
        <p className="text-slate-400">Configure your lodge details for bill generation</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl fade-in">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl fade-in">
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Lodge Information */}
        <div className="glass-card p-6 rounded-xl fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            Lodge Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Lodge Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lodge Name *
              </label>
              <input
                type="text"
                value={settings.lodge_name}
                onChange={(e) => handleChange('lodge_name', e.target.value)}
                placeholder="Enter your lodge name"
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Address
              </label>
              <textarea
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none resize-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
              />
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                GSTIN/UIN
              </label>
              <input
                type="text"
                value={settings.gst_number}
                onChange={(e) => handleChange('gst_number', e.target.value.toUpperCase())}
                placeholder="e.g., 19ATGPM6881Q1ZL"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none uppercase"
              />
            </div>
          </div>
        </div>

        {/* State Information */}
        <div className="glass-card p-6 rounded-xl fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
          <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <Map className="w-5 h-5 text-pink-400" />
            State Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* State Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                State Name
              </label>
              <input
                type="text"
                value={settings.state_name}
                onChange={(e) => handleChange('state_name', e.target.value)}
                placeholder="e.g., West Bengal"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
              />
            </div>

            {/* State Code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                State Code
              </label>
              <input
                type="text"
                value={settings.state_code}
                onChange={(e) => handleChange('state_code', e.target.value)}
                placeholder="e.g., 19"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity" />
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
