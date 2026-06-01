import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // save the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Outlet — nested protected routes yahan render honge
  return <Outlet />
}