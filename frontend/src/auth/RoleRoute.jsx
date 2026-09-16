import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth.js'
export default function RoleRoute({role}) {
 const {user} = useAuth()
 return user?.role === role ? <Outlet /> : <Navigate to="/access-denied" replace />
}
