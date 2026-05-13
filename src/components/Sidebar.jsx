import { NavLink } from 'react-router-dom';
import useStore from '../store/offboardingStore';

const NAV_ITEMS = [
  { to: '/',              icon: '🏠', label: 'Dashboard'      },
  { to: '/offboarding',   icon: '🚪', label: 'Offboarding'    },
  { to: '/new',           icon: '➕', label: 'New Request'    },
];

export default function Sidebar() {
  const { currentUser } = useStore();

  const initials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h3>EMS Offboarding</h3>
        <span>Employee Management Suite</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="name">{currentUser.name}</div>
            <div className="role">{currentUser.designation}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}