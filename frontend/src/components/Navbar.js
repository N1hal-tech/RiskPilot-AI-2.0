import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    try { await api.logout(); } catch { /* swallow */ }
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div>
          <span className="logo">🛡️</span> RiskPilot AI
        </div>
        <div className="brand-tagline">
          Built and maintained by <strong>Kaipu Nihal reddy™</strong>
        </div>
      </div>
      <div className="navbar-right">
        <span className="user-name">👤 {user.fullName}</span>
        <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
      </div>
    </nav>
  );
}