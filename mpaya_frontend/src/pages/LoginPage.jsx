import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Spinner from '../components/Spinner'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/tickets')
    } catch {
      setError('Invalid username or password.')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-mark">M</div>
          <p className="login-logo-title">M-Paya Energy</p>
          <p className="login-logo-sub">Sign in to your workspace</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-[12px]
                          rounded-lg px-3 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="field-wrap">
            <label className="field-label">Username</label>
            <input
              className="field-input"
              type="text"
              placeholder="your username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required autoFocus autoComplete="username"
            />
          </div>

          <div className="field-wrap">
            <label className="field-label">Password</label>
            <div className="relative">
              <input
                className="field-input pr-10"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A89C]
                           hover:text-[#52524A] transition-colors"
              >
                {showPw ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                         a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878
                         l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59
                         m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7
                         a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                         -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-orange w-full mt-1" disabled={loading}>
            {loading ? <Spinner /> : null}
            {loading ? 'Signing in...' : 'Continue →'}
          </button>
        </form>
      </div>
    </div>
  )
}
