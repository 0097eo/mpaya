import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage          from './pages/LoginPage'
import TicketsPage        from './pages/TicketsPage'
import ResolveTicketPage  from './pages/ResolveTicketPage'
import CreateTicketPage   from './pages/CreateTicketPage'
import TechniciansPage    from './pages/TechniciansPage'
import Spinner            from './components/Spinner'

function Guard({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
      <Spinner />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/tickets" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/tickets" element={
        <Guard><TicketsPage /></Guard>
      } />
      <Route path="/tickets/:id" element={
        <Guard><TicketsPage /></Guard>
      } />
      <Route path="/tickets/:id/resolve" element={
        <Guard><ResolveTicketPage /></Guard>
      } />
      <Route path="/tickets/create" element={
        <Guard adminOnly><CreateTicketPage /></Guard>
      } />
      <Route path="/technicians" element={
        <Guard adminOnly><TechniciansPage /></Guard>
      } />

      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  )
}