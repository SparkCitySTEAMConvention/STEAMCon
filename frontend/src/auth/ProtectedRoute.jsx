import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'
export default function ProtectedRoute() {
 const {isAuthenticated,isLoading} = useAuth()
 const location = useLocation()
 if (isLoading) return <main tabIndex={-1} className="container section" role="status">Signing in…</main>
 return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{from:location.pathname+location.search+location.hash}} />
}
