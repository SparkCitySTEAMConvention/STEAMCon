import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import PortalSidebar from './PortalSidebar.jsx'
import PortalTopbar from './PortalTopbar.jsx'
import './portal.css'

const mobileQuery = '(max-width: 760px)'

export default function PortalShell({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(mobileQuery).matches)
  const [open, setOpen] = useState(false)
  const menuButton = useRef(null)
  const drawer = useRef(null)
  const content = useRef(null)
  const closeButton = useRef(null)

  const dismiss = () => {
    setOpen(false)
  }

  useEffect(() => {
    const media = window.matchMedia(mobileQuery)
    const update = () => { setMobile(media.matches); setOpen(false) }
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !mobile || !open) return
    const previousOverflow = document.body.style.overflow
    const mainContent = content.current
    const trigger = menuButton.current
    mainContent.inert = true
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }
      if (event.key === 'Tab') {
        const controls = [...drawer.current.querySelectorAll('a[href], button:not([disabled])')]
        const first = controls[0]
        const last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      mainContent.inert = false
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      trigger?.focus()
    }
  }, [isAuthenticated, mobile, open])

  if (!isAuthenticated) return null

  return (
    <div className="steam-portal-shell">
      {!mobile && <aside className="steam-portal-sidebar"><PortalSidebar user={user} /></aside>}
      {mobile && <div className="steam-portal-drawer-layer" hidden={!open}>
        <div className="steam-portal-backdrop" onClick={dismiss} />
        <div ref={drawer} id="steam-portal-drawer" className="steam-portal-drawer" role="dialog" aria-modal="true" aria-label="Portal menu">
          <button ref={closeButton} type="button" onClick={dismiss}>Close menu</button>
          {open && <PortalSidebar user={user} onNavigate={dismiss} />}
        </div>
      </div>}
      <div ref={content} className="steam-portal-workspace">
        <PortalTopbar mobile={mobile} menuOpen={open} onOpenMenu={() => setOpen(true)} menuButtonRef={menuButton} />
        <main className="steam-portal-content" tabIndex={-1}>{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}
