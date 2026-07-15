import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { handleApiError } from '@/lib/bindings'
import { Eye, EyeOff, CheckCircle2, AlertCircle, Landmark } from 'lucide-react'

/** Warm mountain/forest scene for the login splash panel. */
function LodgeScene() {
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(28 75% 52%)" />
          <stop offset="55%" stopColor="hsl(25 70% 42%)" />
          <stop offset="100%" stopColor="hsl(22 55% 28%)" />
        </linearGradient>
        <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(150 40% 32%)" />
          <stop offset="100%" stopColor="hsl(155 45% 22%)" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#sky)" />
      {/* sun */}
      <circle cx="300" cy="130" r="48" fill="hsl(40 95% 75%)" opacity="0.9" />
      {/* far mountains */}
      <path d="M0 360 L110 230 L210 360 Z" fill="hsl(22 45% 30%)" opacity="0.85" />
      <path d="M150 360 L270 210 L400 360 Z" fill="hsl(22 50% 26%)" opacity="0.9" />
      {/* snow caps */}
      <path d="M88 262 L110 230 L133 262 L118 256 L104 268 Z" fill="hsl(40 30% 94%)" opacity="0.9" />
      <path d="M248 240 L270 210 L293 240 L276 234 L262 246 Z" fill="hsl(40 30% 94%)" opacity="0.9" />
      {/* hills */}
      <path d="M0 600 L0 380 Q200 320 400 390 L400 600 Z" fill="url(#hill)" />
      {/* trees */}
      {[40, 80, 130, 330, 360].map((x, i) => (
        <g key={i} transform={`translate(${x} ${430 + (i % 3) * 14})`}>
          <path d="M0 0 L14 30 L-14 30 Z" fill="hsl(155 45% 20%)" />
          <path d="M0 14 L16 46 L-16 46 Z" fill="hsl(152 42% 18%)" />
          <rect x="-2" y="46" width="4" height="10" fill="hsl(25 40% 22%)" />
        </g>
      ))}
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [registrationToken, setRegistrationToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

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
        await authService.register({ username, password, role: 'ADMIN', registration_token: registrationToken })
        setSuccess('Account created successfully! Redirecting to dashboard...')
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        await authService.login({ username, password })
        navigate('/dashboard')
      }
    } catch (err) {
      setError(handleApiError(err))
      setIsLoading(false)
    }
  }

  const setMode = (signUp: boolean) => {
    setIsSignUp(signUp)
    setError('')
    setSuccess('')
    setPassword('')
    setConfirmPassword('')
    setRegistrationToken('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <div className="flex h-full">
      {/* Left — illustration */}
      <div className="relative hidden w-1/2 lg:block">
        <LodgeScene />
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Landmark className="h-5 w-5" />
            </span>
            <span className="text-2xl font-semibold">Econ</span>
          </div>
          <h2 className="max-w-sm text-3xl font-semibold leading-tight">
            Run your lodge with calm and confidence.
          </h2>
          <p className="mt-2 max-w-sm text-white/80">
            Reservations, billing, and guests — all in one warm, simple place.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex w-full items-center justify-center overflow-y-auto bg-background px-4 py-8 lg:w-1/2">
        <div className="my-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: 'hsl(var(--primary))' }}>
                <Landmark className="h-6 w-6" />
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">Econ</h1>
            <p className="text-sm text-gray-500">Lodge Management System</p>
          </div>

          <div className="rounded-2xl border bg-white p-8 shadow-sm" style={{ boxShadow: '0 16px 48px hsla(25,40%,20%,0.10)' }}>
            {/* Animated tab slider */}
            <div className="relative mb-6 grid grid-cols-2 rounded-xl bg-muted p-1">
              <span
                className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-white shadow-sm transition-transform duration-300"
                style={{
                  transform: isSignUp ? 'translateX(100%)' : 'translateX(0)',
                  transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
                }}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setMode(false)}
                className={`relative z-10 rounded-lg py-2 text-sm font-medium transition-colors ${!isSignUp ? 'text-gray-900' : 'text-gray-500'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode(true)}
                className={`relative z-10 rounded-lg py-2 text-sm font-medium transition-colors ${isSignUp ? 'text-gray-900' : 'text-gray-500'}`}
              >
                Sign Up
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="text-sm text-gray-500">{isSignUp ? 'Sign up to get started' : 'Sign in to continue'}</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="animate-slide-down flex items-center gap-2 rounded-xl border p-3 text-sm" style={{ background: 'hsl(var(--status-red)/0.08)', borderColor: 'hsl(var(--status-red)/0.3)', color: 'hsl(5 72% 38%)' }}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="animate-slide-down flex items-center gap-2 rounded-xl border p-3 text-sm" style={{ background: 'hsl(var(--status-green)/0.10)', borderColor: 'hsl(var(--status-green)/0.3)', color: 'hsl(152 50% 28%)' }}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-600">Username</label>
                <input
                  id="username" name="username" type="text" required
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  className="field-input" placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-600">Password</label>
                <div className="relative">
                  <input
                    id="password" name="password" type={showPassword ? 'text' : 'password'} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="field-input pr-12" placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="animate-slide-down space-y-5">
                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-600">Confirm Password</label>
                    <div className="relative">
                      <input
                        id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="field-input pr-12" placeholder="Confirm your password"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-gray-600">
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="registrationToken" className="mb-2 block text-sm font-medium text-gray-600">Registration Token</label>
                    <input
                      id="registrationToken" name="registrationToken" type="text" required
                      value={registrationToken} onChange={(e) => setRegistrationToken(e.target.value)}
                      placeholder="Enter registration token" className="field-input"
                    />
                    <p className="mt-2 text-xs text-gray-500">Required security token provided by administrator</p>
                  </div>
                </div>
              )}

              <button
                type="submit" disabled={isLoading}
                className="btn-primary w-full rounded-xl py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </span>
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">Powered by Econ</p>
        </div>
      </div>
    </div>
  )
}
