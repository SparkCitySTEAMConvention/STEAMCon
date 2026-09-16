import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService.js'
import { AuthContext } from './useAuth.js'
export default function AuthProvider({children}) {
 const [session,setSession] = useState(null)
 const [isLoading,setLoading] = useState(true)
 const navigate = useNavigate()
 useEffect(() => {
  let active = true
  authService.restore().then(restored => { if (active) { setSession(restored); setLoading(false) } })
  return () => { active = false }
 },[])
 useEffect(() => {
  if (!session) return
  const timer = setTimeout(() => { void authService.logout().catch(() => {}); setSession(null) },Math.max(0,Date.parse(session.expiresAt)-Date.now()))
  return () => clearTimeout(timer)
 },[session])
 const authenticate = async action => {
  setLoading(true)
  try { const next = await action(); setSession(next); return next.user }
  finally { setLoading(false) }
 }
 const logout = async () => {
  try { await authService.logout() }
  finally { setSession(null); navigate('/') }
 }
 return <AuthContext.Provider value={{user:session?.user ?? null,authSource:session?.source ?? null,hasBackendSession:session?.source === 'backend' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session?.sessionId || ''),isAuthenticated:!!session,isLoading,login:credentials => authenticate(() => authService.login(credentials)),loginAsDemo:role => authenticate(() => authService.loginAsDemo(role)),logout}}>{children}</AuthContext.Provider>
}
