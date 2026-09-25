import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import ThemeToggle from '../common/ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const loc = useLocation();

  if (!user) return null;

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    logout();
    navigate('/login');
  };

  const initials = user.fullName
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'LOAN_OFFICER';
  const dashboardPath = user?.role === 'ADMIN'
    ? '/dashboard/admin'
    : user?.role === 'LOAN_OFFICER'
      ? '/dashboard/officer'
      : '/dashboard/user';
  const links = [
    { to: dashboardPath, label: 'Dashboard', icon: 'dashboard' },
    { to: '/apply',      label: 'Apply',     icon: 'add_card'  },
    { to: '/history',    label: 'History',   icon: 'history'   },
  ];
  if (isAdmin) {
    links.unshift({ to: '/admin', label: 'Admin', icon: 'analytics' });
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="logo-icon">🛡️</div>
        RiskPilot AI
      </div>

      <div className="navbar-center">
        {links.map(l => (
          <Link
            key={l.to} to={l.to}
            className={`navbar-link ${loc.pathname === l.to ? 'active' : ''}`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="navbar-right">
        <ThemeToggle size="small" />
        <div className="navbar-user">
          <div className="navbar-avatar">{initials}</div>
          <div>
            <div className="navbar-user-name">{user.fullName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
              {user.role?.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}