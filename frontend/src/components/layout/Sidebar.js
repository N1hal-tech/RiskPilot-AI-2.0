import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Sidebar() {
  const loc = useLocation();
  const { user } = useAuth();
  const [reviewCount, setReviewCount] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'LOAN_OFFICER';
  const dashboardPath = user?.role === 'ADMIN'
    ? '/dashboard/admin'
    : user?.role === 'LOAN_OFFICER'
      ? '/dashboard/officer'
      : '/dashboard/user';

  useEffect(() => {
    if (isAdmin) {
      api.getReviewQueueCount()
        .then(data => setReviewCount(data.count || 0))
        .catch(() => {});
    }
    api.getUnreadCount()
      .then(data => setUnreadNotifs(data.count || 0))
      .catch(() => {});

    const interval = setInterval(() => {
      if (isAdmin) {
        api.getReviewQueueCount()
          .then(data => setReviewCount(data.count || 0))
          .catch(() => {});
      }
      api.getUnreadCount()
        .then(data => setUnreadNotifs(data.count || 0))
        .catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  const userNav = [
    { section: 'Main', items: [
      { to: dashboardPath,    label: 'Dashboard',        icon: 'dashboard',     badge: null },
      { to: '/apply',         label: 'New Loan',         icon: 'add_card',      badge: null },
      { to: '/history',       label: 'My Loans',         icon: 'receipt_long',  badge: null },
      { to: '/risk',          label: 'Risk Intelligence', icon: 'insights',      badge: null },
      { to: '/notifications', label: 'Notifications',    icon: 'notifications', badge: unreadNotifs > 0 ? unreadNotifs : null },
      { to: '/profile',       label: 'Profile',          icon: 'person',        badge: null },
    ]},
  ];

  const adminNav = [
    { section: 'Administration', items: [
      { to: '/admin',         label: 'Analytics',     icon: 'analytics',     badge: null },
      { to: '/admin/review',  label: 'Review Queue',  icon: 'rate_review',   badge: reviewCount > 0 ? reviewCount : null },
      { to: '/admin/loans',   label: 'All Loans',     icon: 'folder_open',   badge: null },
      { to: '/admin/users',   label: 'Users',         icon: 'group',         badge: null },
      { to: '/admin/audit',   label: 'Audit Log',     icon: 'history_edu',   badge: null },
    ]},
  ];

  const nav = isAdmin ? [...userNav, ...adminNav] : userNav;

  return (
    <aside className="sidebar">
      {nav.map(group => (
        <div className="sidebar-section" key={group.section}>
          <div className="sidebar-label">{group.section}</div>
          {group.items.map(item => (
            <Link
              key={item.to} to={item.to}
              className={`sidebar-link ${loc.pathname === item.to ? 'active' : ''}`}
            >
              <span className="material-icons-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      ))}

      <div className="sidebar-bottom">
        <div className="sidebar-bottom-text">
          RiskPilot AI v3.0<br />
          RL-Powered Risk Platform
          {isAdmin && <><br/><span style={{ color: 'var(--clr-primary-400)' }}>Admin Mode</span></>}
        </div>
      </div>
    </aside>
  );
}