import { Navigate, Outlet } from 'react-router-dom'
import { authClient } from '../../lib/neonAuth'
import Loader from '../Loader'

export default function ProtectedRoute() {
  const session = authClient.useSession()

  if (session.isPending) {
    return <Loader />
  }

  if (!session.data?.user) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
