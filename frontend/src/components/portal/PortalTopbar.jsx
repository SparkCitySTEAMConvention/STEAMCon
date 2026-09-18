import AccountNavigation from '../../auth/AccountNavigation.jsx'

export default function PortalTopbar({ mobile, menuOpen, onOpenMenu, menuButtonRef }) {
  return (
    <header className="steam-portal-topbar">
      {mobile && <button ref={menuButtonRef} type="button" aria-expanded={menuOpen} aria-controls="steam-portal-drawer" onClick={onOpenMenu}>Menu</button>}
      <span className="steam-portal-title">Your workspace</span>
      <AccountNavigation />
    </header>
  )
}
