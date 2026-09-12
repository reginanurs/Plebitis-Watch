import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import RouteLoadingScreen from './RouteLoadingScreen'

/** Keeps an already-authenticated session from seeing the login page again. */
function GuestOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <RouteLoadingScreen />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

export default GuestOnlyRoute
