import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-400">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  return <Outlet />
}

/**
 * Like AuthGuard, but lets logged-out visitors through instead of
 * redirecting to /signin. Pages behind this route render demo data +
 * a "Sign in" prompt instead of the real thing. Used for the public
 * landing/preview pages (deploy, dashboard, servers, secrets, billing,
 * usage) — everything else still requires the hard AuthGuard.
 */
export function PublicGuard() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-400">Loading…</p>
      </div>
    )
  }

  return <Outlet />
}
