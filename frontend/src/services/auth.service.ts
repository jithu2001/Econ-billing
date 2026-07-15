// frontend/src/services/auth.service.ts
import { AuthAPI } from '@/lib/bindings'

export interface LoginRequest { username: string; password: string }
export interface RegisterRequest {
  username: string; password: string; role: 'ADMIN' | 'STAFF'; registration_token: string
}
export interface User { id: string; username: string; role: 'ADMIN' | 'STAFF' }
export interface AuthResponse { user: User }

const USER_KEY = 'econ_user_cache'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = (await AuthAPI.Login(data.username, data.password)) as unknown as AuthResponse
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    return res
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = (await AuthAPI.Register(data.username, data.password, data.role, data.registration_token)) as unknown as AuthResponse
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    return res
  },

  async logout() {
    await AuthAPI.Logout()
    localStorage.removeItem(USER_KEY)
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  },

  async isAuthenticated(): Promise<boolean> {
    return await AuthAPI.IsAuthenticated()
  },
}
