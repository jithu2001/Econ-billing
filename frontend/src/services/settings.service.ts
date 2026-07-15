// frontend/src/services/settings.service.ts
import { SettingsAPI } from '@/lib/bindings'
import type { Settings } from '@/types'

export const settingsService = {
  get: () => SettingsAPI.Get() as unknown as Promise<Settings>,
  save: (s: Omit<Settings, 'id' | 'created_at' | 'updated_at'>) =>
    SettingsAPI.Save({
      lodge_name: s.lodge_name, address: s.address, phone: s.phone,
      gst_number: s.gst_number, state_name: s.state_name, state_code: s.state_code,
      gst_invoice_prefix: s.gst_invoice_prefix,
      gst_invoice_next_number: s.gst_invoice_next_number,
      non_gst_invoice_prefix: s.non_gst_invoice_prefix,
      non_gst_invoice_next_number: s.non_gst_invoice_next_number,
    }) as unknown as Promise<Settings>,
}
