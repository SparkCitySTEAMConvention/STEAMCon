import { Link, useLocation } from 'react-router-dom'
import { getPortalNavigation, isPortalDestinationActive } from './portalNavigation.js'

export default function PortalSidebar({ user, onNavigate }) {
  const location = useLocation()
  const navigation = getPortalNavigation(user)
  const groups = [...new Set(navigation.map(item => item.group))]
  return (
    <nav className="steam-portal-navigation" aria-label="Portal navigation">
      <Link className="steam-portal-brand" to="/" onClick={onNavigate}>STEAM Con <span>Home ↗</span></Link>
      {groups.map(group => (
        <section key={group} aria-label={group}>
          <h2>{group}</h2>
          <ul>{navigation.filter(item => item.group === group).map(item => (
            <li key={item.id}>
              {item.to ? (
                <Link to={item.to} onClick={onNavigate} aria-current={isPortalDestinationActive(item.to, location, item.activePaths) ? 'page' : undefined}>
                  <span>{item.label}</span>
                  {item.description && <small>{item.description}</small>}
                </Link>
              ) : (
                <span className="steam-portal-unavailable">{item.label}<small>Unavailable · {item.unavailable}</small></span>
              )}
            </li>
          ))}</ul>
        </section>
      ))}
    </nav>
  )
}
