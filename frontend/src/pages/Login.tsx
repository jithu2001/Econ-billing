import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { handleApiError } from '@/lib/api'
import { Building2, Sparkles } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF')
  const [registrationToken, setRegistrationToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation for sign up
    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        return
      }
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        await authService.register({ username, password, role, registration_token: registrationToken })
        setSuccess('Account created successfully! Redirecting to dashboard...')
        // Wait 1.5 seconds before redirecting to show success message
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        await authService.login({ username, password })
        navigate('/dashboard')
      }
    } catch (err) {
      setError(handleApiError(err))
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setSuccess('')
    setPassword('')
    setConfirmPassword('')
    setRegistrationToken('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8 fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Building2 className="w-16 h-16 text-purple-400 drop-shadow-[0_0_15px_rgba(167,139,250,0.6)]" />
              <Sparkles className="w-6 h-6 text-pink-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-2">Trinity Lodge</h1>
          <p className="text-slate-400 text-sm">Next-Generation Hotel Management</p>
        </div>

        {/* Login/Signup Card */}
        <div className="glass-card fade-in-scale p-8 relative overflow-hidden">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="slide-in-left bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="text-sm text-red-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  {error}
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="slide-in-left bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="text-sm text-green-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {success}
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-slate-800/70 transition-all duration-300 outline-none"
                placeholder="Enter your username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-slate-800/70 transition-all duration-300 outline-none"
                placeholder="Enter your password"
              />
            </div>

            {/* Sign Up Additional Fields */}
            {isSignUp && (
              <div className="space-y-5 fade-in">
                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-slate-800/70 transition-all duration-300 outline-none"
                    placeholder="Confirm your password"
                  />
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'ADMIN' | 'STAFF')}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 outline-none cursor-pointer"
                  >
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {/* Registration Token */}
                <div>
                  <label htmlFor="registrationToken" className="block text-sm font-medium text-slate-300 mb-2">
                    Registration Token
                  </label>
                  <input
                    id="registrationToken"
                    name="registrationToken"
                    type="text"
                    required
                    value={registrationToken}
                    onChange={(e) => setRegistrationToken(e.target.value)}
                    placeholder="Enter registration token"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-slate-800/70 transition-all duration-300 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-2">Required security token provided by administrator</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />

              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>{isSignUp ? 'Create Account' : 'Sign In'}</>
                )}
              </span>
            </button>

            {/* Toggle Mode */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium"
              >
                {isSignUp ? '← Already have an account? Sign in' : "Don't have an account? Sign up →"}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <p className="text-slate-500 text-sm">
            Powered by Trinity Lodge Management System
          </p>
        </div>
      </div>
    </div>
  )
}
