import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Spinner from '../components/Spinner'
import api from '../api/client'

export default function ResolveTicketPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ticket, setTicket]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState({ resolution_summary: '', resolved_meter_serial: '' })
  const [errors, setErrors]   = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/tickets/${id}/`)
      .then(res => setTicket(res.data))
      .finally(() => setLoading(false))
  }, [id])

  const serialMatch = form.resolved_meter_serial.trim().toUpperCase() ===
                      ticket?.meter_serial_number?.trim().toUpperCase()
  const charCount = form.resolution_summary.length
  const canSubmit = charCount >= 10 && form.resolved_meter_serial.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({}); setSubmitting(true)
    try {
      await api.post(`/tickets/${id}/resolve/`, form)
      navigate('/tickets', { state: { toast: 'Ticket resolved successfully.' } })
    } catch (err) {
      const data = err.response?.data || {}
      setErrors({
        resolution_summary: Array.isArray(data.resolution_summary)
          ? data.resolution_summary[0]
          : data.resolution_summary,
        resolved_meter_serial: Array.isArray(data.resolved_meter_serial)
          ? data.resolved_meter_serial[0]
          : data.resolved_meter_serial,
        general: data.message && data.message !== 'Validation error.' 
          ? data.message 
          : null,
      })
  }finally { setSubmitting(false) }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-white">

        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-3.5 border-b border-[#EAEAE4] sticky top-0 bg-white z-10">
          <button
            className="btn btn-ghost btn-sm p-1.5"
            onClick={() => navigate(`/tickets/${id}`)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-[#1A1A18]">Resolve Ticket</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <div className="max-w-lg mx-auto px-6 py-8">

            {/* Reminder banner */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[12px] font-semibold text-amber-800 mb-0.5">
                    Meter verification required
                  </p>
                  <p className="text-[12px] text-amber-700">
                    Enter the serial number exactly as shown on the physical meter.
                  </p>
                </div>
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-[12px]
                              rounded-lg px-3 py-2.5 mb-4">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Resolution summary */}
              <div className="field-wrap">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="field-label mb-0">Resolution Summary</label>
                  <span className={`text-[11px] font-mono ${charCount >= 10 ? 'text-emerald-500' : 'text-[#A8A89C]'}`}>
                    {charCount} / min 10
                  </span>
                </div>
                <textarea
                  className="field-textarea"
                  placeholder="Describe exactly what was found and what was fixed..."
                  value={form.resolution_summary}
                  onChange={e => setForm({ ...form, resolution_summary: e.target.value })}
                  rows={5}
                  required
                />
                {errors.resolution_summary && (
                  <p className="field-error">{errors.resolution_summary}</p>
                )}
              </div>

              {/* Meter serial */}
              <div className="field-wrap">
                <label className="field-label">Meter Serial Number</label>
                <div className="relative">
                  <input
                    className="field-input font-mono pr-10"
                    type="text"
                    placeholder="e.g. MTR-2024-001"
                    value={form.resolved_meter_serial}
                    onChange={e => setForm({ ...form, resolved_meter_serial: e.target.value })}
                    required
                  />
                  {form.resolved_meter_serial.trim() && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {serialMatch ? (
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
                {errors.resolved_meter_serial ? (
                  <p className="field-error">{errors.resolved_meter_serial}</p>
                ) : form.resolved_meter_serial.trim() && !serialMatch ? (
                  <p className="field-error">Serial does not match ticket record.</p>
                ) : null}
              </div>

              <button
                type="submit"
                className="btn btn-orange w-full"
                disabled={submitting || !canSubmit}
              >
                {submitting ? <Spinner /> : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {submitting ? 'Submitting...' : 'Confirm Resolution'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
