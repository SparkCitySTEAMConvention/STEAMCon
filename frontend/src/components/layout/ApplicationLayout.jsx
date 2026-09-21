import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import PortalShell from '../portal/PortalShell.jsx'
import { PresentationContext } from './PresentationContext.js'

const discoveryPaths = new Set(['/', '/events', '/tracks', '/speakers', '/travel'])

export default function ApplicationLayout() {
  const { isAuthenticated } = useAuth()
  const { pathname } = useLocation()
  return (
    <PresentationContext.Provider value={isAuthenticated}>
      {isAuthenticated ? <PortalShell discovery={discoveryPaths.has(pathname)} /> : <Outlet />}
    </PresentationContext.Provider>
  )
}
