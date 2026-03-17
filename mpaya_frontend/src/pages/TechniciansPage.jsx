import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import api from '../api/client'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function InitialsAvatar({ name, size = 'md' }) {
  const initials = (name || '?').slice(0, 2).toUpperCase()
  const sz = size === 'sm'
    ? 'w-7 h-7 text-[10px]'
    : 'w-9 h-9 text-[12px]'
  return (
    <div className={`${sz} rounded-full bg-[#F97316] flex items-center
                     justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  )
}

function ConfirmModal({ technician, onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl border border-[#EAEAE4] shadow-lg
                   p-6 w-full max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center
                        justify-center mb-4">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4
                 c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-[15px] font-semibold text-[#1A1A18] mb-1.5">
          Deactivate technician?
        </h3>
        <p className="text-[13px] text-[#7A7A70] mb-5 leading-relaxed">
          <span className="font-medium text-[#1A1A18]">{technician?.username}</span> will
          no longer be able to log in or be assigned tickets. This can be reversed
          from the Django admin.
        </p>
        <div className="flex gap-2.5">
          <button
            className="flex-1 btn btn-ghost text-[13px]"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="flex-1 btn bg-red-500 hover:bg-red-600 text-white text-[13px]"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Spinner /> : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSubmitting(true)
    try {
      const res = await api.post('/auth/technicians/', form)
      onSuccess(res.data)
    } catch (err) {
      const data = err.response?.data || {}
      const errs = {}
      Object.entries(data).forEach(([k, v]) => {
        errs[k] = Array.isArray(v) ? v[0] : v
      })
      setErrors(errs)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-[#FAFAF8] border border-[#EAEAE4] rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-[#1A1A18]">New Technician</h3>
        <button
          onClick={onCancel}
          className="text-[#A8A89C] hover:text-[#52524A] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {errors.non_field_errors && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-[12px]
                        rounded-lg px-3 py-2.5 mb-4">
          {errors.non_field_errors}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="field-wrap mb-0">
            <label className="field-label">Username *</label>
            <input
              className="field-input"
              type="text"
              placeholder="e.g. jmwangi"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
              autoFocus
            />
            {errors.username && <p className="field-error">{errors.username}</p>}
          </div>

          <div className="field-wrap mb-0">
            <label className="field-label">Email</label>
            <input
              className="field-input"
              type="email"
              placeholder="technician@mpaya.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
        </div>

        <div className="field-wrap mb-0">
          <label className="field-label">Password *</label>
          <div className="relative">
            <input
              className="field-input pr-10"
              type={showPw ? 'text' : 'password'}
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-[#A8A89C] hover:text-[#52524A] transition-colors"
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
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="flex justify-end gap-2.5 pt-1">
          <button type="button" className="btn btn-ghost text-[13px]" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-orange text-[13px]" disabled={submitting}>
            {submitting ? <Spinner /> : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            {submitting ? 'Creating...' : 'Create Technician'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function TechniciansPage() {
  const navigate = useNavigate()
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [deactivating, setDeactivating]   = useState(false)
  const [toast, setToast]             = useState('')

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/auth/technicians/')
      setTechnicians(res.data.results ?? res.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTechnicians() }, [])

  const handleCreated = (newTech) => {
    setTechnicians(prev => [newTech, ...prev])
    setShowForm(false)
    setToast(`${newTech.username} added successfully.`)
  }

  const handleDeactivate = async () => {
    setDeactivating(true)
    try {
      await api.delete(`/auth/technicians/${confirmTarget.id}/`)
      setTechnicians(prev => prev.filter(t => t.id !== confirmTarget.id))
      setToast(`${confirmTarget.username} has been deactivated.`)
      setConfirmTarget(null)
    } catch {
      setToast('Failed to deactivate technician.')
      setConfirmTarget(null)
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5
                        border-b border-[#EAEAE4] shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="btn btn-ghost btn-sm p-1.5 md:hidden"
              onClick={() => navigate('/tickets')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-[15px] font-semibold text-[#1A1A18] leading-tight">
                Technicians
              </h1>
              <p className="text-[11px] text-[#A8A89C] mt-0.5">
                {technicians.length} member{technicians.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            className="btn btn-orange text-[13px]"
            onClick={() => setShowForm(v => !v)}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Technician
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 max-w-2xl">

          {showForm && (
            <CreateForm
              onSuccess={handleCreated}
              onCancel={() => setShowForm(false)}
            />
          )}

          {loading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : technicians.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 bg-[#F0F0EA] rounded-2xl flex items-center
                              justify-center mb-4">
                <svg className="w-5 h-5 text-[#C4C4BA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
                       M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
                       m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-[13px] font-medium text-[#52524A]">No technicians yet</p>
              <p className="text-[12px] text-[#A8A89C] mt-1">
                Add a technician to start assigning tickets.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F0]">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-3 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A8A89C]">
                  Username
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A8A89C]">
                  Joined
                </span>
                <span className="w-8" />
              </div>

              {technicians.map(tech => (
                <div
                  key={tech.id}
                  className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center
                             px-3 py-3.5 hover:bg-[#FAFAF8] rounded-lg transition-colors"
                >
                  {/* Identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <InitialsAvatar name={tech.username} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[#1A1A18] truncate">
                        {tech.username}
                      </p>
                      <p className="text-[11px] text-[#A8A89C] truncate">
                        {tech.email || 'No email'}
                      </p>
                    </div>
                  </div>

                  {/* Joined */}
                  <span className="text-[12px] text-[#7A7A70]">
                    {fmtDate(tech.date_joined)}
                  </span>

                  {/* Actions */}
                  <button
                    onClick={() => setConfirmTarget(tech)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg
                               text-[#C4C4BA] hover:bg-red-50 hover:text-red-400
                               transition-colors"
                    title="Deactivate technician"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636
                           m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmTarget && (
        <ConfirmModal
          technician={confirmTarget}
          onConfirm={handleDeactivate}
          onCancel={() => setConfirmTarget(null)}
          loading={deactivating}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}