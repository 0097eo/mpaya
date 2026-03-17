import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage          from './pages/LoginPage'
import TicketsPage        from './pages/TicketsPage'
import ResolveTicketPage  from './pages/ResolveTicketPage'
import CreateTicketPage   from './pages/CreateTicketPage'
import TeamPage from './pages/TeamPage'
import Spinner            from './components/Spinner'

function Guard({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
      <Spinner />
    </div>
  )
  
  if (!user) return <Navigate to="/login" replace />

  // If allowedRoles is provided, check if user's role is included
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/tickets" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/tickets" element={<Guard><TicketsPage /></Guard>} />
      <Route path="/tickets/:id" element={<Guard><TicketsPage /></Guard>} />  {/* add this */}

      <Route path="/tickets/create" element={
        <Guard allowedRoles={['admin', 'support']}><CreateTicketPage /></Guard>
      } />

      <Route path="/tickets/:id/resolve" element={
        <Guard allowedRoles={['technician']}><ResolveTicketPage /></Guard>
      } />

      <Route path="/team" element={
        <Guard allowedRoles={['admin']}><TeamPage /></Guard>
      } />

      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  )
}