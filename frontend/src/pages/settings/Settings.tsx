import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Building2, MapPin, Phone, FileText, Map, Save, CheckCircle, Receipt, Hash, X, AlertCircle } from 'lucide-react'
import { settingsService } from '@/services'
import type { Settings } from '@/types'
import { handleApiError } from '@/lib/bindings'
import { PageHeader, SectionCard, Button } from '@/components/common'

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const palette = type === 'success'
    ? { background: 'hsl(152 50% 32%)' }
    : { background: 'hsl(5 70% 48%)' }

  return (
    <div className="animate-slide-up fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-4 text-white shadow-lg" style={palette}>
      {type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} aria-label="Dismiss" className="ml-2 rounded-lg p-1 transition-colors hover:bg-white/15">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/** Mini invoice-styled preview of the next number in a series. */
function InvoicePreview({ title, prefix, next }: { title: string; prefix: string; next: number }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between border-b pb-2">
        <span className="col-label">{title}</span>
        <Receipt className="h-4 w-4 text-gray-300" />
      </div>
      <p className="text-xs text-gray-400">Next invoice number</p>
      <p className="font-mono text-lg font-semibold tracking-wide" style={{ color: 'hsl(var(--primary))' }}>
        {prefix}-{String(next).padStart(4, '0')}
      </p>
    </div>
  )
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [settings, setSettings] = useState<Settings>({
    lodge_name: '', address: '', phone: '', gst_number: '', state_name: '', state_code: '',
    gst_invoice_prefix: 'GST', gst_invoice_next_number: 1,
    non_gst_invoice_prefix: 'INV', non_gst_invoice_next_number: 1,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setSettings(await settingsService.get())
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
      await settingsService.save({ ...settings })
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
      <div className="flex h-64 items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Configure your lodge details for bill generation"
        icon={
          <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'hsl(var(--primary)/0.10)' }}>
            <SettingsIcon className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
          </span>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Lodge Information */}
        <SectionCard title="Lodge Information" icon={Building2} className="animate-fade-up">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-600">Lodge Name *</label>
              <input type="text" value={settings.lodge_name} onChange={(e) => handleChange('lodge_name', e.target.value)} placeholder="Enter your lodge name" required className="field-input" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-600"><MapPin className="mr-1 inline h-4 w-4" />Address</label>
              <textarea value={settings.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Enter complete address" rows={3} className="field-input resize-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600"><Phone className="mr-1 inline h-4 w-4" />Phone Number</label>
              <input type="tel" value={settings.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="Enter phone number" className="field-input" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600"><FileText className="mr-1 inline h-4 w-4" />GSTIN/UIN</label>
              <input type="text" value={settings.gst_number} onChange={(e) => handleChange('gst_number', e.target.value.toUpperCase())} placeholder="e.g., 19ATGPM6881Q1ZL" className="field-input uppercase" />
            </div>
          </div>
        </SectionCard>

        {/* State Information */}
        <SectionCard title="State Information" icon={Map} className="animate-fade-up">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">State Name</label>
              <input type="text" value={settings.state_name} onChange={(e) => handleChange('state_name', e.target.value)} placeholder="e.g., West Bengal" className="field-input" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">State Code</label>
              <input type="text" value={settings.state_code} onChange={(e) => handleChange('state_code', e.target.value)} placeholder="e.g., 19" className="field-input" />
            </div>
          </div>
        </SectionCard>

        {/* Invoice Number Configuration */}
        <SectionCard title="Invoice Number Configuration" subtitle="Separate number series for GST and Non-GST bills." icon={Receipt} className="animate-fade-up">
          <div className="grid gap-6 md:grid-cols-2">
            {/* GST */}
            <div className="rounded-xl border bg-surface-raised p-4">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700"><Hash className="h-4 w-4" />GST Invoice Series</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-600">Prefix</label>
                  <input type="text" value={settings.gst_invoice_prefix} onChange={(e) => handleChange('gst_invoice_prefix', e.target.value.toUpperCase())} placeholder="e.g., GST" className="field-input uppercase" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-600">Next Invoice Number</label>
                  <input type="number" min="1" value={settings.gst_invoice_next_number} onChange={(e) => handleChange('gst_invoice_next_number', parseInt(e.target.value) || 1)} className="field-input" />
                </div>
                <InvoicePreview title="GST Preview" prefix={settings.gst_invoice_prefix} next={settings.gst_invoice_next_number} />
              </div>
            </div>
            {/* Non-GST */}
            <div className="rounded-xl border bg-surface-raised p-4">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700"><Hash className="h-4 w-4" />Non-GST Invoice Series</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-600">Prefix</label>
                  <input type="text" value={settings.non_gst_invoice_prefix} onChange={(e) => handleChange('non_gst_invoice_prefix', e.target.value.toUpperCase())} placeholder="e.g., INV" className="field-input uppercase" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-600">Next Invoice Number</label>
                  <input type="number" min="1" value={settings.non_gst_invoice_next_number} onChange={(e) => handleChange('non_gst_invoice_next_number', parseInt(e.target.value) || 1)} className="field-input" />
                </div>
                <InvoicePreview title="Non-GST Preview" prefix={settings.non_gst_invoice_prefix} next={settings.non_gst_invoice_next_number} />
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <Button type="submit" icon={Save} loading={saving} className="rounded-xl px-8 py-3">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
