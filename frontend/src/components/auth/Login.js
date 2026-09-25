import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Alert from '../common/Alert';
import ThemeToggle from '../common/ThemeToggle';

export default function Login({
  defaultRole = 'USER',
  lockRole = false,
  title = 'Welcome back',
  subtitle = 'Sign in to access your risk dashboard',
  signupPath = '/register',
  signupLabel = 'Create one',
}) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState(defaultRole);
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  const { login } = useAuth();
  const navigate   = useNavigate();
  const isAdminTier = role === 'ADMIN' || role === 'LOAN_OFFICER';
  const roleLabels = {
    USER: 'Borrower Portal',
    LOAN_OFFICER: 'Loan Officer Portal',
    ADMIN: 'Administrator Portal',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api.login({ email, password });
      const resolvedRole = data.role || role || 'USER';
      login(
        { id: data.userId, fullName: data.fullName, email: data.email, role: resolvedRole },
        data.token,
      );
      // Redirect to role-specific landing pages
      const landingPath = resolvedRole === 'ADMIN' ? '/dashboard/admin' : 
                         resolvedRole === 'LOAN_OFFICER' ? '/dashboard/officer' : 
                         '/dashboard/user';
      navigate(landingPath);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`auth-layout ${isAdminTier ? 'auth-layout-enterprise' : ''}`}>
      {/* Left Panel */}
      <div className="auth-left" style={isAdminTier ? { background: 'linear-gradient(135deg, #0a3b64, #1b4f7f)' } : {}}>
        <div className="auth-left-content animate-fadeUp" style={isAdminTier ? { color: 'white' } : {}}>
          <div className="hero-logo">🛡️</div>
          <h1>{isAdminTier ? 'RiskPilot AI Enterprise' : 'RiskPilot AI'}</h1>
          <p>
            {isAdminTier
              ? 'Admin portal: monitor the portfolio, triage escalated applications, and keep compliance controls tight.'
              : 'Leverage AI-powered analytics to evaluate loan applications with precision, speed, and transparency.'}
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <span className="material-icons-outlined">psychology</span>
              </div>
              <div className="auth-feature-text">
                <strong>ML-Powered Scoring</strong>
                RL Agent trained on financial patterns
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <span className="material-icons-outlined">traffic</span>
              </div>
              <div className="auth-feature-text">
                <strong>Traffic Light System</strong>
                Green, Yellow, Red risk classification for clear decisions
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <span className="material-icons-outlined">speed</span>
              </div>
              <div className="auth-feature-text">
                <strong>Instant Decisions</strong>
                Automated approval with detailed advisory messages
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
          <ThemeToggle size="small" />
        </div>
        <div className="auth-form-container animate-fadeUp">
          <div className="auth-form-header">
            <div className="logo-sm">
              <div className="logo-icon-sm">🛡️</div>
              <span>RiskPilot AI</span>
            </div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{lockRole ? 'Portal' : 'Login as'}</label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon">supervisor_account</span>
                {lockRole ? (
                  <div className="form-input" style={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                    {roleLabels[role]}
                  </div>
                ) : (
                  <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="USER">User</option>
                    <option value="LOAN_OFFICER">Loan Officer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                )}
              </div>
              <small style={{ color: 'var(--text-secondary)', marginTop: 6, display: 'block' }}>
                {lockRole
                  ? `You are signing into the ${roleLabels[role]}.`
                  : 'Choose the portal that matches your account role.'}
              </small>
            </div>

          <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon">mail_outline</span>
                <input
                  type="email" className="form-input" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" required
                />
              </div>
          </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon">lock_outline</span>
                <input
                  type="password" className="form-input" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={busy}>
              {busy ? <><span className="spinner" />Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to={signupPath}>{signupLabel}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}