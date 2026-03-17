import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Sidebar from '../components/Sidebar'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import api from '../api/client'

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}
function fmtFull(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
function todayLabel() {
  return new Date().toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

// ── Mobile header ──────────────────────────────────────────────────────────
function MobileHeader({ user, onLogout, isAdmin }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAEAE4] bg-[#F5F5F0] md:hidden shrink-0">
      <div className="flex items-center gap-0.5">
        <span className="text-[14px] font-bold text-[#1B3A6B] tracking-tight">m</span>
        <svg width="9" height="12" viewBox="0 0 10 14" fill="none">
          <path d="M6 1L1 8h4.5L4 13l6-7H5.5L6 1z" fill="#F97316"/>
        </svg>
        <span className="text-[14px] font-bold text-[#1B3A6B] tracking-tight">paya</span>
      </div>
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#EAEAE4] transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-[#F97316] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {user?.username?.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-[#52524A]">{user?.username}</span>
          <svg className="w-3 h-3 text-[#A8A89C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-[#EAEAE4] rounded-xl shadow-md z-40 py-1">
              <div className="px-3 py-2.5 border-b border-[#EAEAE4]">
                <p className="text-xs font-semibold text-[#1A1A18]">{user?.username}</p>
                <p className="text-[10px] text-[#A8A89C] capitalize mt-0.5">{user?.role}</p>
              </div>
              <div className="px-2 py-1 border-b border-[#EAEAE4]">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#C4C4BA]">Workspace</p>
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#F5F5F0] cursor-pointer text-[13px] text-[#52524A]"
                  onClick={() => { setOpen(false); navigate('/tickets') }}>
                  <svg className="w-3.5 h-3.5 text-[#A8A89C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  All Tickets
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#F5F5F0] cursor-pointer text-[13px] text-[#52524A]"
                    onClick={() => { setOpen(false); navigate('/tickets/create') }}>
                    <svg className="w-3.5 h-3.5 text-[#A8A89C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
                    </svg>
                    New Ticket
                  </div>
                )}
                {isAdmin && (
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#F5F5F0] cursor-pointer text-[13px] text-[#52524A]"
                    onClick={() => { setOpen(false); navigate('/technicians') }}>
                    <svg className="w-3.5 h-3.5 text-[#A8A89C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Technicians
                  </div>
                )}
              </div>
              <div className="px-2 py-1">
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-red-50 cursor-pointer text-[13px] text-red-500"
                  onClick={() => { setOpen(false); onLogout() }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Admin filter bar ───────────────────────────────────────────────────────
function AdminFilters({ filters, onChange, onClear, hasActive }) {
  return (
    <div className="px-3 py-2.5 border-b border-[#EAEAE4] space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A8A89C]">
          Filters
        </span>
        {hasActive && (
          <button
            onClick={onClear}
            className="text-[10px] text-[#F97316] font-medium hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Status */}
      <div className="flex gap-1.5 flex-wrap">
        {['all', 'pending', 'in_progress', 'resolved'].map(s => (
          <button
            key={s}
            onClick={() => onChange('status', s === 'all' ? '' : s)}
            className={`filter-chip ${
              (s === 'all' && !filters.status) || filters.status === s ? 'active' : ''
            }`}
          >
            {{ all: 'All', pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved' }[s]}
          </button>
        ))}
      </div>

      {/* Date + Technician */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="date"
            value={filters.date}
            onChange={e => onChange('date', e.target.value)}
            className="field-input text-[12px] py-1.5 pr-7 w-full"
          />
          {filters.date && (
            <button
              onClick={() => onChange('date', '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A8A89C] hover:text-[#52524A]"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Technician..."
            value={filters.technician}
            onChange={e => onChange('technician', e.target.value)}
            className="field-input text-[12px] py-1.5 pr-7 w-full"
          />
          {filters.technician && (
            <button
              onClick={() => onChange('technician', '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A8A89C] hover:text-[#52524A]"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Ticket list column ─────────────────────────────────────────────────────
function TicketList({
  tickets,
  loading,
  selectedId,
  onSelect,
  isTech,
  adminFilters,
  onAdminFilterChange,
  onAdminFilterClear,
  pagination,
  onPageChange,
}) {
  const techFilters = ['all', 'pending', 'in_progress', 'resolved']
  const fLabel = { all: 'All', pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved' }
  const [techFilter, setTechFilter] = useState('all')

  const displayed = isTech
    ? (techFilter === 'all' ? tickets : tickets.filter(t => t.status === techFilter))
    : tickets

  const hasActiveAdminFilters = !!(adminFilters.status || adminFilters.date || adminFilters.technician)
  const totalPages = pagination?.count ? Math.ceil(pagination.count / 20) : 0

  if (loading) return (
    <div className="list-column">
      <div className="list-header">
        <span className="list-header-title">Tickets</span>
      </div>
      <div className="flex justify-center py-16"><Spinner /></div>
    </div>
  )

  return (
    <div className="list-column">
      <div className="list-header">
        <div className="flex flex-col gap-0.5">
          <span className="list-header-title">
            Tickets
            {!isTech && pagination?.count > 0 ? (
              <span className="count-pill">{pagination.count}</span>
            ) : displayed.length > 0 ? (
              <span className="count-pill">{displayed.length}</span>
            ) : null}
          </span>
          {isTech && (
            <span className="text-[10px] text-[#A8A89C]">{todayLabel()}</span>
          )}
        </div>
      </div>

      {/* Technician status filter chips */}
      {isTech && (
        <div className="filter-bar">
          {techFilters.map(f => (
            <button
              key={f}
              className={`filter-chip ${techFilter === f ? 'active' : ''}`}
              onClick={() => setTechFilter(f)}
            >
              {fLabel[f]}
            </button>
          ))}
        </div>
      )}

      {/* Admin filters */}
      {!isTech && (
        <AdminFilters
          filters={adminFilters}
          onChange={onAdminFilterChange}
          onClear={onAdminFilterClear}
          hasActive={hasActiveAdminFilters}
        />
      )}

      <div className="ticket-list">
        {displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-5 h-5 text-[#C4C4BA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-[#52524A]">No tickets</p>
            <p className="text-[12px] mt-0.5">
              {isTech ? 'No tickets assigned to you today.' : 'Nothing matches your filters.'}
            </p>
          </div>
        ) : (
          displayed.map(ticket => (
            <div
              key={ticket.id}
              className={`ticket-row ${selectedId === ticket.id ? 'selected' : ''}`}
              onClick={() => onSelect(ticket)}
            >
              <p className="ticket-row-title">{ticket.title}</p>
              <div className="ticket-row-meta">
                {ticket.meter_serial_number && (
                  <span className="ticket-row-serial">{ticket.meter_serial_number}</span>
                )}
                <StatusBadge status={ticket.status} />
                <span className="ticket-row-date">{fmt(ticket.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination footer — admin only, when more than one page */}
      {!isTech && totalPages > 1 &&  (
        <div className="flex items-center justify-between px-3 py-2.5 border-t border-[#EAEAE4] shrink-0">
          <span className="text-[11px] text-[#A8A89C]">
            Page {pagination.page} of {totalPages}
            <span className="ml-1 text-[#C4C4BA]">({pagination.count})</span>
          </span>
          <div className="flex gap-1.5">
            <button
              disabled={!pagination.previous}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-[#EAEAE4]
                         disabled:opacity-30 disabled:cursor-not-allowed
                         hover:bg-[#F5F5F0] transition-colors text-[#52524A]"
            >
              ← Prev
            </button>
            <button
              disabled={!pagination.next}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-[#EAEAE4]
                         disabled:opacity-30 disabled:cursor-not-allowed
                         hover:bg-[#F5F5F0] transition-colors text-[#52524A]"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Property row ────────────────────────────────────────────────────────────
function PropRow({ label, children }) {
  return (
    <div className="prop-row">
      <span className="prop-label">{label}</span>
      <div className="prop-value">{children}</div>
    </div>
  )
}

// ── Detail panel ────────────────────────────────────────────────────────────
function TicketDetail({ ticket, detailLoading, onRefresh, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [updating, setUpdating] = useState(false)
  const [error, setError]       = useState('')

  if (detailLoading) return (
    <div className="detail-panel">
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    </div>
  )

  if (!ticket) return (
    <div className="detail-panel">
      <div className="empty-state h-full">
        <div className="empty-icon">
          <svg className="w-5 h-5 text-[#C4C4BA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
        </div>
        <p className="text-[13px] font-medium text-[#52524A]">Select a ticket</p>
        <p className="text-[12px] mt-0.5">Click any ticket to view details.</p>
      </div>
    </div>
  )

  const isTech       = user?.role === 'technician'
  const isPending    = ticket.status === 'pending'
  const isInProgress = ticket.status === 'in_progress'
  const isResolved   = ticket.status === 'resolved'

  const handleMarkInProgress = async () => {
    setUpdating(true); setError('')
    try {
      await api.patch(`/tickets/${ticket.id}/status/`, { status: 'in_progress' })
      onRefresh()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update.')
    } finally { setUpdating(false) }
  }

  return (
    <div className="detail-panel">
      <div className="detail-topbar">
        <div className="flex items-center gap-3">
          {onClose && (
            <button className="btn btn-ghost btn-sm p-1.5" onClick={onClose}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <StatusBadge status={ticket.status} />
        </div>
        <div className="text-[11px] text-[#A8A89C]">{fmtFull(ticket.created_at)}</div>
      </div>

      <div className="detail-body">
        <h1 className="detail-title">{ticket.title}</h1>

        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#A8A89C] mb-2">
          Description
        </p>
        <div className="description-block">
          {ticket.description || <span className="text-[#C4C4BA]">No description provided.</span>}
        </div>

        <table className="prop-table">
          <tbody>
            {!isTech && (
              <PropRow label="Meter Serial">
                <span className="prop-mono">{ticket.meter_serial_number}</span>
              </PropRow>
            )}
            {ticket.assigned_to && (
              <PropRow label="Assigned To">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#F97316]/15 flex items-center justify-center text-[#F97316] text-[9px] font-bold">
                    {ticket.assigned_to.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <span>{ticket.assigned_to.username}</span>
                </div>
              </PropRow>
            )}
            {ticket.created_by && (
              <PropRow label="Created By">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#EAEAE4] flex items-center justify-center text-[#7A7A70] text-[9px] font-bold">
                    {ticket.created_by.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <span>{ticket.created_by.username}</span>
                </div>
              </PropRow>
            )}
            <PropRow label="Created">{fmtFull(ticket.created_at)}</PropRow>
            {isResolved && (
              <PropRow label="Resolved">{fmtFull(ticket.resolved_at)}</PropRow>
            )}
          </tbody>
        </table>

        {isResolved && (
          <div className="resolution-block">
            <p className="resolution-block-title">Resolution</p>
            <div style={{ display: 'flex', gap: '1rem', padding: '6px 0', borderBottom: '1px solid #D4EDDA' }}>
              <span className="prop-label" style={{ color: '#2D6A4F', opacity: 0.8 }}>Summary</span>
              <span style={{ fontSize: '13px', color: '#14532D', flex: 1, lineHeight: 1.6 }}>
                {ticket.resolution_summary}
              </span>
            </div>
            {isTech && (
              <div style={{ display: 'flex', gap: '1rem', padding: '6px 0', borderBottom: '1px solid #D4EDDA' }}>
                <span className="prop-label" style={{ color: '#2D6A4F', opacity: 0.8 }}>Meter Serial</span>
                <span className="prop-mono">{ticket.meter_serial_number}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', padding: '6px 0' }}>
              <span className="prop-label" style={{ color: '#2D6A4F', opacity: 0.8 }}>Verified Serial</span>
              <span className="prop-mono" style={{ background: '#DCFCE7', color: '#166534' }}>
                {ticket.resolved_meter_serial}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-[12px] bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}
      </div>

      {isTech && (
        <div className="action-bar">
          {isPending && (
            <button className="btn btn-orange" onClick={handleMarkInProgress} disabled={updating}>
              {updating ? <Spinner /> : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              Mark In Progress
            </button>
          )}
          {isInProgress && (
            <button className="btn btn-orange" onClick={() => navigate(`/tickets/${ticket.id}/resolve`)}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Resolve Ticket
            </button>
          )}
          {isResolved && (
            <div className="flex items-center gap-2 text-emerald-600 text-[13px] font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Resolved
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function TicketsPage() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { id }    = useParams()

  const [tickets, setTickets]             = useState([])
  const [selected, setSelected]           = useState(null)
  const [loading, setLoading]             = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [toast, setToast]                 = useState('')
  const [mobileDetail, setMobileDetail]   = useState(false)
  const [adminFilters, setAdminFilters]   = useState({ status: '', date: '', technician: '' })
  const [pagination, setPagination]       = useState({ count: 0, page: 1, next: null, previous: null })

  const isAdmin = user?.role === 'admin'
  const isTech  = user?.role === 'technician'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const buildAdminParams = (filters) => {
    const params = {}
    if (filters.status)     params.status     = filters.status
    if (filters.date)       params.date       = filters.date
    if (filters.technician) params.technician = filters.technician
    return params
  }

  const fetchTickets = async (filters = adminFilters, page = 1) => {
    try {
      const params = isAdmin ? buildAdminParams(filters) : {}
      if (page > 1) params.page = page
      const res  = await api.get('/tickets/', { params })
      const data = res.data
      if (data.results !== undefined) {
        setPagination({ count: data.count, page, next: data.next, previous: data.previous })
        return data.results
      }
      return data
    } catch (e) {
      console.error('Failed to load tickets:', e)
      return []
    }
  }

  useEffect(() => {
    const load = async () => {
      const list = await fetchTickets()
      setTickets(list)

      if (id) {
        setDetailLoading(true)
        try {
          const detail = await api.get(`/tickets/${id}/`)
          setSelected(detail.data)
          setMobileDetail(true)
        } catch (e) {
          console.error('Failed to load ticket detail:', e)
        } finally {
          setDetailLoading(false)
        }
      }

      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast)
      window.history.replaceState({}, '')
    }
  }, [location])

  const handleAdminFilterChange = async (key, value) => {
    const updated = { ...adminFilters, [key]: value }
    setAdminFilters(updated)
    const list = await fetchTickets(updated, 1)
    setTickets(list)
  }

  const handleAdminFilterClear = async () => {
    const cleared = { status: '', date: '', technician: '' }
    setAdminFilters(cleared)
    const list = await fetchTickets(cleared, 1)
    setTickets(list)
  }

  const handlePageChange = async (newPage) => {
    setLoading(true)
    const list = await fetchTickets(adminFilters, newPage)
    setTickets(list)
    setLoading(false)
  }

  const handleSelect = async (ticket) => {
    setSelected(null)
    setDetailLoading(true)
    setMobileDetail(true)
    navigate(`/tickets/${ticket.id}`, { replace: true })
    try {
      const res = await api.get(`/tickets/${ticket.id}/`)
      setSelected(res.data)
    } catch (e) {
      console.error('Failed to load ticket detail:', e)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleRefresh = async () => {
    const list = await fetchTickets(adminFilters, pagination.page)
    setTickets(list)
    if (selected) {
      try {
        const detail = await api.get(`/tickets/${selected.id}/`)
        setSelected(detail.data)
      } catch (e) {
        console.error('Refresh failed:', e)
      }
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <MobileHeader user={user} onLogout={handleLogout} isAdmin={isAdmin} />

        <div className="main-area">
          <TicketList
            tickets={tickets}
            loading={loading}
            selectedId={selected?.id}
            onSelect={handleSelect}
            isTech={isTech}
            adminFilters={adminFilters}
            onAdminFilterChange={handleAdminFilterChange}
            onAdminFilterClear={handleAdminFilterClear}
            pagination={pagination}
            onPageChange={handlePageChange}
          />

          <div className={`detail-panel ${mobileDetail ? 'visible-mobile' : 'hidden-mobile'} md:flex md:translate-x-0`}>
            <TicketDetail
              ticket={selected}
              detailLoading={detailLoading}
              onRefresh={handleRefresh}
              onClose={() => {
                setMobileDetail(false)
                setSelected(null)
                navigate('/tickets', { replace: true })
              }}
            />
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}