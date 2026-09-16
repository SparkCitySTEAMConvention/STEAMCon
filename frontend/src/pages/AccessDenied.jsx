import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { portalFor, useAuth } from '../auth/useAuth.js'
import './Authentication.css'
export default function AccessDenied() {
 const {user,logout} = useAuth()
 const portal = portalFor(user?.role)
 return <><Header /><main tabIndex={-1} className="container section auth-page"><p className="eyebrow">STEAM Con / Access denied</p><h1>Access denied</h1><p>{portal ? 'Your account does not have access to this portal.' : user ? 'You are signed in, but the backend does not yet provide the role required to open a portal.' : 'Log in with an attendee or speaker account to open a portal.'}</p><div className="button-group">{portal && <Link className="button button-dark" to={portal}>Open your portal</Link>}<Link className="button button-paper" to="/">Return Home</Link><button className="button button-paper" onClick={logout}>Log out and use another account</button></div></main></>
}
