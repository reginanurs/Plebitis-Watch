import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/** Keeps an already-authenticated demo session from seeing the login page again. */
function GuestOnlyRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

export default GuestOnlyRoute
