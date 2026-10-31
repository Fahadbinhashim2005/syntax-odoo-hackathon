import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { UserRole } from '../types'

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="screen-loading">Loading your workspace…</div>
  if (!user) return <Navigate to={roles?.includes('admin') ? '/admin/login' : '/customer/login'} replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) {
    const destination = user.role === 'admin' ? '/admin/dashboard' : user.role === 'customer' ? '/customer/dashboard' : user.role === 'developer_team' ? '/developer/dashboard' : '/dashboard'
    return <Navigate to={destination} replace />
  }
  if (user.role === 'admin' && user.must_change_password && location.pathname !== '/admin/change-password') {
    return <Navigate to="/admin/change-password" replace />
  }
  if (user.role === 'admin' && !user.must_change_password && location.pathname === '/admin/change-password') {
    return <Navigate to="/admin/dashboard" replace />
  }
  return <Outlet />
}
