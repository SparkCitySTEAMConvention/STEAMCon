import { Link } from 'react-router-dom'
import { portalFor, useAuth } from './useAuth.js'
import '../pages/Authentication.css'
export default function AccountNavigation() {
 const {user,logout} = useAuth()
 return <nav className="auth-account-navigation" aria-label="Account navigation"><span>{user?.displayName || 'Account'}</span>{portalFor(user?.role) && <Link to={portalFor(user.role)}>Your portal</Link>}<button type="button" onClick={logout}>Log out</button></nav>
}
