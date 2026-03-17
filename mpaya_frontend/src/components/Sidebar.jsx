import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function SidebarItem({ icon, label, to, active }) {
  const navigate = useNavigate()
  return (
    <div
      className={`sidebar-item ${active ? 'active' : ''}`}
      onClick={() => navigate(to)}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

const Icons = {
  tickets: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
           M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  create: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
    </svg>
  ),
  technicians: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
           M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
           m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isAdmin    = user?.role === 'admin'
  const isSupport  = user?.role === 'support'
  const initials   = user?.username?.slice(0, 2).toUpperCase() || 'U'
  const path       = location.pathname

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            <span className="text-[15px] font-bold text-[#1B3A6B] tracking-tight">m</span>
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
              <path d="M6 1L1 8h4.5L4 13l6-7H5.5L6 1z" fill="#F97316"/>
            </svg>
            <span className="text-[15px] font-bold text-[#1B3A6B] tracking-tight">paya</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      {/* Nav */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">Workspace</p>

        {/* Visible to both Admin and Support */}
        <SidebarItem
          icon={Icons.tickets}
          label="All Tickets"
          to="/tickets"
          active={path === '/tickets'}
        />

        {/* "New Ticket" visible to both roles, using consistent 'create' icon */}
        {(isAdmin || isSupport) && (
          <SidebarItem
            icon={Icons.create}
            label="New Ticket"
            to="/tickets/create"
            active={path === '/tickets/create'}
          />
        )}

        {/* "Team" only visible to Admin */}
        {isAdmin && (
          <SidebarItem
            icon={Icons.technicians}
            label="Team"
            to="/team"
            active={path === '/team'}
          />
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-chip" onClick={handleLogout} title="Sign out">
          <div className="user-avatar">{initials}</div>
          <div className="user-chip-text">
            <span className="user-chip-name">{user?.username}</span>
            <span className="user-chip-role">{user?.role}</span>
          </div>
          <svg className="w-3 h-3 text-[#A8A89C] ml-auto shrink-0"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7" />
          </svg>
        </div>
      </div>
    </aside>
  )
}