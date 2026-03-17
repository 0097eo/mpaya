import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Spinner from '../components/Spinner'
import api from '../api/client'

export default function CreateTicketPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', meter_serial_number: '', assigned_to: ''
  })
  const [technicians, setTechnicians] = useState([])
  const [errors, setErrors]           = useState({})
  const [submitting, setSubmitting]   = useState(false)
  const [loadingTechs, setLoadingTechs] = useState(true)
  const [techOpen, setTechOpen]       = useState(false)

  const selectedTech = technicians.find(t => t.id === form.assigned_to)

  useEffect(() => {
    api.get('/tickets/technicians/')
      .then(res => setTechnicians(res.data))
      .finally(() => setLoadingTechs(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({}); setSubmitting(true)
    try {
      await api.post('/tickets/', form)
      navigate('/tickets', { state: { toast: 'Ticket created successfully.' } })
    } catch (err) {
      const data = err.response?.data || {}
      if (typeof data === 'object') {
        const errs = {}
        Object.entries(data).forEach(([k, v]) => { errs[k] = Array.isArray(v) ? v[0] : v })
        setErrors(errs)
      } else {
        setErrors({ general: 'Something went wrong.' })
      }
    } finally { setSubmitting(false) }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-white">

        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-3.5 border-b border-[#EAEAE4] sticky top-0 bg-white z-10">
          <button
            className="btn btn-ghost btn-sm p-1.5"
            onClick={() => navigate('/tickets')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-[#1A1A18]">New Ticket</span>
        </div>

        <div className="max-w-lg mx-auto px-6 py-8">

          {errors.general && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-[12px]
                            rounded-lg px-3 py-2.5 mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="field-wrap">
              <label className="field-label">Title</label>
              <input
                className="field-input"
                placeholder="e.g. Meter fault at Unit 4B"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
              {errors.title && <p className="field-error">{errors.title}</p>}
            </div>

            <div className="field-wrap">
              <label className="field-label">Description</label>
              <textarea
                className="field-textarea"
                placeholder="Describe the issue in detail..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
                required
              />
              {errors.description && <p className="field-error">{errors.description}</p>}
            </div>

            <div className="field-wrap">
              <label className="field-label">Meter Serial Number</label>
              <input
                className="field-input font-mono"
                placeholder="e.g. MTR-2024-001"
                value={form.meter_serial_number}
                onChange={e => setForm({ ...form, meter_serial_number: e.target.value })}
                required
              />
              {errors.meter_serial_number && (
                <p className="field-error">{errors.meter_serial_number}</p>
              )}
            </div>

            <div className="field-wrap">
              <label className="field-label">Assign To</label>
              {loadingTechs ? (
                <div className="flex items-center gap-2 text-[#A8A89C] text-[12px] py-2">
                  <Spinner /> Loading technicians...
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    className="field-input flex items-center justify-between text-left w-full"
                    onClick={() => setTechOpen(v => !v)}
                  >
                    <span className={selectedTech ? 'text-[#1A1A18]' : 'text-[#A8A89C]'}>
                      {selectedTech ? selectedTech.username : 'Select a technician'}
                    </span>
                    <svg
                      className={`w-4 h-4 text-[#A8A89C] shrink-0 transition-transform duration-150
                                  ${techOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {techOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setTechOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border
                                      border-[#EAEAE4] rounded-lg shadow-md z-20 overflow-hidden">
                        {technicians.length === 0 ? (
                          <div className="px-3 py-2.5 text-[12px] text-[#A8A89C]">
                            No technicians available
                          </div>
                        ) : (
                          technicians.map(t => (
                            <div
                              key={t.id}
                              className={`px-3 py-2.5 text-[13px] cursor-pointer transition-colors
                                ${form.assigned_to === t.id
                                  ? 'bg-[#FFEDD5] text-[#F97316] font-medium'
                                  : 'text-[#1A1A18] hover:bg-[#F5F5F0]'
                                }`}
                              onClick={() => {
                                setForm({ ...form, assigned_to: t.id })
                                setTechOpen(false)
                              }}
                            >
                              {t.username}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
              {errors.assigned_to && <p className="field-error">{errors.assigned_to}</p>}
            </div>

            <div className="border-t border-[#EAEAE4] pt-4">
              <button
                type="submit"
                className="btn btn-orange"
                disabled={submitting || loadingTechs}
              >
                {submitting ? <Spinner /> : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
                {submitting ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}