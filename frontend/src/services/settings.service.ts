import { apiClient } from '@/lib/api'
import type { Settings } from '@/types'

export const settingsService = {
  async get(): Promise<Settings> {
    const response = await apiClient.get<Settings>('/api/settings')
    return response.data
  },

  async save(settings: Omit<Settings, 'id' | 'created_at' | 'updated_at'>): Promise<Settings> {
    const response = await apiClient.post<Settings>('/api/settings', settings)
    return response.data
  },
}
