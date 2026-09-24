import { createContext, useContext } from 'react'
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)
export const portalFor = role => role === 'SPEAKER' ? '/speaker' : role === 'ATTENDEE' ? '/attendee' : null
