import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import PortalSidebar from './PortalSidebar.jsx'
import PortalTopbar from './PortalTopbar.jsx'
import './portal.css'

const mobileQuery = '(max-width: 760px)'
const storageKey = 'steam-portal-sidebar-collapsed'

export default function PortalShell({ children, discovery = false }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(mobileQuery).matches)
  const [openRoute, setOpenRoute] = useState(null)
  const open = openRoute === location.key
  const [collapsed, setCollapsed] = useState(() => {
    try { return window.sessionStorage.getItem(storageKey) === 'true' } catch { return false }
  })
  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    try { window.sessionStorage.setItem(storageKey, String(next)) } catch { /* Storage may be disabled. */ }
  }
  const menuButton = useRef(null)
  const drawer = useRef(null)
  const content = useRef(null)
  const closeButton = useRef(null)
  const returnFocus = useRef(false)

  const dismiss = () => {
    setOpenRoute(null)
  }

  useEffect(() => {
    const media = window.matchMedia(mobileQuery)
    const update = () => { setMobile(media.matches); setOpenRoute(null) }
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !mobile || !open) return
    const body = document.body
    const savedStyles = Object.fromEntries(['overflow', 'position', 'top', 'left', 'width'].map(name => [name, body.style[name]]))
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const mainContent = content.current
    const trigger = menuButton.current
    mainContent.inert = true
    Object.assign(body.style, { overflow: 'hidden', position: 'fixed', top: `-${scrollY}px`, left: `-${scrollX}px`, width: '100%' })
    let touchY = null
    const blockBackground = event => {
      const nav = drawer.current?.querySelector('.steam-portal-navigation')
      if (!nav?.contains(event.target)) { event.preventDefault(); return }
      const delta = event.type === 'wheel' ? event.deltaY : touchY === null ? 0 : touchY - event.touches[0].clientY
      if (event.type === 'touchmove') touchY = event.touches[0].clientY
      if (nav.scrollHeight <= nav.clientHeight || (delta < 0 && nav.scrollTop <= 0) || (delta > 0 && nav.scrollTop + nav.clientHeight >= nav.scrollHeight)) event.preventDefault()
    }
    const onTouchStart = event => { touchY = event.touches[0].clientY }
    document.addEventListener('wheel', blockBackground, { passive: false })
    document.addEventListener('touchmove', blockBackground, { passive: false })
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    closeButton.current?.focus()
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpenRoute(null)
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key) || (event.key === ' ' && !event.target.closest?.('button'))) event.preventDefault()
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
      Object.assign(body.style, savedStyles)
      window.scrollTo(scrollX, scrollY)
      document.removeEventListener('wheel', blockBackground)
      document.removeEventListener('touchmove', blockBackground)
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('keydown', onKeyDown)
      trigger?.focus({ preventScroll: true })
      returnFocus.current = true
    }
  }, [isAuthenticated, mobile, open])

  useEffect(() => {
    if (open || !mobile || !returnFocus.current) return
    const trigger = menuButton.current
    // App and destination hash effects also move focus after navigation.
    const frame = window.requestAnimationFrame(() => {
      returnFocus.current = false
      if (trigger?.isConnected) trigger.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open, mobile, location.key])

  const Content = discovery ? 'div' : 'main'
  if (!isAuthenticated) return null

  return (
    <div className={`steam-portal-shell${collapsed ? ' steam-portal-collapsed' : ''}`}>
      {!mobile && <aside className="steam-portal-sidebar">
        <button className="steam-portal-toggle" type="button" onClick={toggleCollapsed} aria-expanded={!collapsed} aria-controls="steam-portal-desktop-navigation" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? 'Expand →' : '← Collapse'}</button>
        <PortalSidebar user={user} collapsed={collapsed} id="steam-portal-desktop-navigation" />
      </aside>}
      {mobile && <div className="steam-portal-drawer-layer" hidden={!open}>
        <div className="steam-portal-backdrop" onClick={dismiss} />
        <div ref={drawer} id="steam-portal-drawer" className="steam-portal-drawer" role="dialog" aria-modal="true" aria-label="Portal menu">
          <button ref={closeButton} type="button" onClick={dismiss}>Close menu</button>
          {open && <PortalSidebar user={user} onNavigate={dismiss} />}
        </div>
      </div>}
      <div ref={content} className="steam-portal-workspace">
        <PortalTopbar mobile={mobile} menuOpen={open} onOpenMenu={() => setOpenRoute(location.key)} menuButtonRef={menuButton} />
        <Content className={`steam-portal-content${discovery ? ' steam-portal-discovery' : ''}`} tabIndex={-1}>{children ?? <Outlet />}</Content>
      </div>
    </div>
  )
}
