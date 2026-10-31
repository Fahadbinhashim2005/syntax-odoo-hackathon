import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { UserRole } from '../types'

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="screen-loading">Loading your workspace…</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
