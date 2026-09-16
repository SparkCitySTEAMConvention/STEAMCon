import { demoAccounts, demoEnabled } from '../auth/demoConfig.js'
const key = 'steamcon.auth'
export class AuthError extends Error {
 constructor(message, code = 'general') { super(message); this.code = code }
}
const cleanup = () => sessionStorage.removeItem(key)
const save = session => { sessionStorage.setItem(key, JSON.stringify(session)); return session }
const valid = session => session?.user && Number.isFinite(Date.parse(session.expiresAt)) && Date.parse(session.expiresAt) > Date.now()
function restore() {
 try {
  const session = JSON.parse(sessionStorage.getItem(key))
  if (valid(session) && session.source === 'demo' && demoEnabled) {
   const account = demoAccounts[session.user.role]
   if (account && account.email === session.user.email) return {...session, user: identity(account)}
  }
 } catch { /* Discard corrupt storage. */ }
 // Backend A has no current-user endpoint: never trust a cached backend identity.
 cleanup(); return null
}
const identity = account => ({id:`demo-${account.role}`,email:account.email,displayName:account.displayName,role:account.role})
async function login({email,password}) {
 const account = demoEnabled && Object.values(demoAccounts).find(a => a.email === email && a.password === password)
 if (account) return save({source:'demo',expiresAt:new Date(Date.now()+28800000).toISOString(),user:identity(account)})
 if (demoEnabled && Object.values(demoAccounts).some(a => a.email === email)) throw new AuthError('Invalid email or password.','credentials')
 let response
 try { response = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}) }
 catch { throw new AuthError('Unable to reach the login service. Please try again.') }
 if (!response.ok) {
  const message = await response.text()
  if ([401,403].includes(response.status) || /Invalid email or password/i.test(message)) throw new AuthError('Invalid email or password.','credentials')
  throw new AuthError('The login service could not complete your request. Please try again.')
 }
 let session
 try { session = await response.json() } catch { throw new AuthError('The login service returned an unreadable response.') }
 if (!session.id || !session.userId || session.status !== 'ACTIVE' || !valid({...session,user:{}})) throw new AuthError('The login service returned an invalid session.')
 // AuthSession has no role or display name; never infer a production role.
 return save({source:'backend',sessionId:session.id,expiresAt:session.expiresAt,user:{id:session.userId,role:null}})
}
export const authService = {
 login, restore,
 loginAsDemo(role) {
  if (!demoEnabled || !demoAccounts[role]) throw new AuthError('Demo authentication is unavailable.')
  return login(demoAccounts[role])
 },
 async logout() { cleanup() }, // Local only: no backend logout endpoint exists.
 hasValidBackendSession() {
  try {
   const session = JSON.parse(sessionStorage.getItem(key))
   const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
   return valid(session) && session.source === 'backend' && uuid.test(session.sessionId || '') && uuid.test(session.user.id || '')
  } catch { return false }
 },
 headers() {
  try {
   const session = JSON.parse(sessionStorage.getItem(key))
   return valid(session) && session.source === 'backend' ? {'X-Session-Id':session.sessionId} : {}
  } catch { return {} }
 },
}
export function authenticatedFetch(url,options={}) {
 const target = new URL(url,window.location.origin)
 if (target.origin !== window.location.origin) throw new AuthError('Authenticated requests must use the application API origin.')
 const headers = new Headers(options.headers)
 Object.entries(authService.headers()).forEach(([name,value]) => headers.set(name,value))
 return fetch(url,{...options,headers})
}
