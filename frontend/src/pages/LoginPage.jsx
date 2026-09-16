import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { portalFor, useAuth } from '../auth/useAuth.js'
import { demoAccounts } from '../auth/demoConfig.js'
import './Authentication.css'
export default function LoginPage() {
 const [portal,setPortal] = useState('')
 const [email,setEmail] = useState('')
 const [password,setPassword] = useState('')
 const [show,setShow] = useState(false)
 const [error,setError] = useState('')
 const [notice,setNotice] = useState('')
 const errorRef = useRef(null)
 const {login,isLoading} = useAuth()
 const navigate = useNavigate()
 const populate = role => {
  setPortal(role)
  if (!role) return
  setEmail(demoAccounts[role].email); setPassword(demoAccounts[role].password); setError('')
  setNotice('Portal credentials selected. You can edit or delete both values.')
 }
 const submit = async event => {
  event.preventDefault(); setError('')
  try {
   const user = await login({email,password})
   navigate(portalFor(user.role) || '/access-denied',{replace:true})
  } catch (error) { setError(error.message); requestAnimationFrame(() => errorRef.current?.focus()) }
 }
 return <><a className="skip-link" href="#login-main">Skip to login</a><Header /><main id="login-main" tabIndex={-1} className="container section auth-page">
  <p className="eyebrow">STEAM Con / Shared login</p><h1>Log in to your portal.</h1><p>Use your account credentials to continue as an attendee or speaker.</p>
  <form onSubmit={submit} aria-busy={isLoading}>
   <label htmlFor="login-portal">Choose your portal</label>
   <select id="login-portal" value={portal} disabled={isLoading} onChange={e => populate(e.target.value)}>
    <option value="">Select a portal</option>
    <option value="ATTENDEE">Attendee Portal</option>
    <option value="SPEAKER">Speaker Portal</option>
   </select>
   <label htmlFor="login-email">Email</label><input id="login-email" type="email" autoComplete="username" required value={email} disabled={isLoading} onChange={e => setEmail(e.target.value)} />
   <label htmlFor="login-password">Password</label><input id="login-password" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} disabled={isLoading} onChange={e => setPassword(e.target.value)} />
   <button type="button" className="button button-paper" aria-controls="login-password" aria-pressed={show} onClick={() => setShow(!show)}>{show ? 'Hide password' : 'Show password'}</button>
   {error && <p ref={errorRef} tabIndex={-1} role="alert">{error}</p>}
   <button className="button button-dark" type="submit" disabled={isLoading}>{isLoading ? 'Signing in…' : 'Log in'}</button>
   <p role="status" aria-live="polite">{isLoading ? 'Signing in…' : notice}</p>
  </form>

 </main><Footer /></>
}
