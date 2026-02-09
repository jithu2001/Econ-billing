import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Building2, MapPin, Phone, FileText, Map, Save, CheckCircle, Receipt, Hash, X, AlertCircle } from 'lucide-react'
import { settingsService } from '@/services'
import type { Settings } from '@/types'
import { handleApiError } from '@/lib/api'

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg animate-slide-up ${
      type === 'success'
        ? 'bg-gray-900 text-white'
        : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-green-400" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [settings, setSettings] = useState<Settings>({
    lodge_name: '',
    address: '',
    phone: '',
    gst_number: '',
    state_name: '',
    state_code: '',
    gst_invoice_prefix: 'GST',
    gst_invoice_next_number: 1,
    non_gst_invoice_prefix: 'INV',
    non_gst_invoice_next_number: 1,
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
    setToast(null)

    try {
      setSaving(true)
      await settingsService.save({
        lodge_name: settings.lodge_name,
        address: settings.address,
        phone: settings.phone,
        gst_number: settings.gst_number,
        state_name: settings.state_name,
        state_code: settings.state_code,
        gst_invoice_prefix: settings.gst_invoice_prefix,
        gst_invoice_next_number: settings.gst_invoice_next_number,
        non_gst_invoice_prefix: settings.non_gst_invoice_prefix,
        non_gst_invoice_next_number: settings.non_gst_invoice_next_number,
      })
      setToast({ message: 'Settings saved successfully!', type: 'success' })
    } catch (error) {
      setToast({ message: handleApiError(error), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Settings, value: string | number) => {
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
      <div className="slide-in-left">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gray-100 rounded-xl">
            <SettingsIcon className="w-6 h-6 text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-500">Configure your lodge details for bill generation</p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Lodge Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
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
        <div className="bg-white border border-gray-200 rounded-xl p-6 fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
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

        {/* Invoice Number Configuration */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-gray-600" />
            Invoice Number Configuration
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Configure separate invoice number series for GST and Non-GST bills. You can set a starting number if you have existing bills.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* GST Invoice Settings */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                GST Invoice Series
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.gst_invoice_prefix}
                    onChange={(e) => handleChange('gst_invoice_prefix', e.target.value.toUpperCase())}
                    placeholder="e.g., GST"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Next Invoice Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.gst_invoice_next_number}
                    onChange={(e) => handleChange('gst_invoice_next_number', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Next bill: {settings.gst_invoice_prefix}-{String(settings.gst_invoice_next_number).padStart(4, '0')}
                  </p>
                </div>
              </div>
            </div>

            {/* Non-GST Invoice Settings */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Non-GST Invoice Series
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.non_gst_invoice_prefix}
                    onChange={(e) => handleChange('non_gst_invoice_prefix', e.target.value.toUpperCase())}
                    placeholder="e.g., INV"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Next Invoice Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.non_gst_invoice_next_number}
                    onChange={(e) => handleChange('non_gst_invoice_next_number', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Next bill: {settings.non_gst_invoice_prefix}-{String(settings.non_gst_invoice_next_number).padStart(4, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end fade-in" style={{ animationDelay: '0.4s', opacity: 0 }}>
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

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
