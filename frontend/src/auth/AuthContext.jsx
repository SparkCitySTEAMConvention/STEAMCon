import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService.js'
import { AuthContext } from './useAuth.js'
export default function AuthProvider({children}) {
 const [session,setSession] = useState(() => authService.restore())
 const [isLoading,setLoading] = useState(false)
 const navigate = useNavigate()
 useEffect(() => {
  if (!session) return
  const timer = setTimeout(() => { void authService.logout(); setSession(null) },Math.max(0,Date.parse(session.expiresAt)-Date.now()))
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
 return <AuthContext.Provider value={{user:session?.user ?? null,authSource:session?.source ?? null,isAuthenticated:!!session,isLoading,login:credentials => authenticate(() => authService.login(credentials)),loginAsDemo:role => authenticate(() => authService.loginAsDemo(role)),logout}}>{children}</AuthContext.Provider>
}
