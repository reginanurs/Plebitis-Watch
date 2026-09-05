import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/** Centralizes the auth gate so individual pages never need their own check. */
function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}

export default ProtectedRoute
