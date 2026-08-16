import { NavLink, Outlet } from 'react-router-dom'
import { formatLongDate, todayISO } from '../lib/date'
import { useAppState } from '../state/store'
import Companion from './Companion'

const NAV = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/workout', label: 'Workout', icon: '🏋️' },
  { to: '/nutrition', label: 'Nutrition', icon: '🥗' },
  { to: '/habits', label: 'Habits', icon: '🔥' },
  { to: '/progress', label: 'Progress', icon: '📈' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

export default function Layout() {
  const state = useAppState()
  const firstName = state.profile?.name.split(' ')[0]

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              S
            </span>
            <span className="brand-name">Sarv</span>
          </NavLink>
          <div className="row" style={{ gap: 8 }}>
            <span className="tiny muted nowrap">{formatLongDate(todayISO())}</span>
            {firstName ? (
              <span className="pill" title="Signed in locally">
                {firstName}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <nav className="nav" aria-label="Main">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="app-main">
        <Outlet />
      </main>

      <Companion />
    </div>
  )
}
