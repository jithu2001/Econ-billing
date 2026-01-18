import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { handleApiError } from '@/lib/api'
import { Building2 } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-16 h-16 text-gray-900" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Econ</h1>
          <p className="text-gray-500 text-sm">Lodge Management System</p>
        </div>

        {/* Login/Signup Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          {/* Top border accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-900 rounded-t-xl" />

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="text-sm text-red-600 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  {error}
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="text-sm text-green-600 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {success}
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-300 outline-none"
                placeholder="Enter your username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-300 outline-none"
                placeholder="Enter your password"
              />
            </div>

            {/* Sign Up Additional Fields */}
            {isSignUp && (
              <div className="space-y-5">
                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-300 outline-none"
                    placeholder="Confirm your password"
                  />
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-600 mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'ADMIN' | 'STAFF')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-300 outline-none cursor-pointer"
                  >
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {/* Registration Token */}
                <div>
                  <label htmlFor="registrationToken" className="block text-sm font-medium text-gray-600 mb-2">
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-300 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">Required security token provided by administrator</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gray-900 rounded-xl font-semibold text-white hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
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
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Powered by Trinity Lodge Management System
          </p>
        </div>
      </div>
    </div>
  )
}
