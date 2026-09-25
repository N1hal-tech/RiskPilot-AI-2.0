import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Alert from '../common/Alert';
import ThemeToggle from '../common/ThemeToggle';

export default function Register() {
  const [form, setForm]   = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);
  const navigate = useNavigate();

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6)       { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm)  { setError('Passwords do not match'); return; }

    setBusy(true);
    try {
      await api.register({ fullName: form.fullName, email: form.email, password: form.password });
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="auth-left-content animate-fadeUp">
          <div className="hero-logo">🛡️</div>
          <h1>Join RiskPilot AI</h1>
          <p>
            Create your account and start evaluating loan risk
            with enterprise-grade AI analytics.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <span className="material-icons-outlined">verified_user</span>
              </div>
              <div className="auth-feature-text">
                <strong>Secure & Encrypted</strong>
                Your data is hashed and stored safely
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <span className="material-icons-outlined">auto_graph</span>
              </div>
              <div className="auth-feature-text">
                <strong>Data-Driven Decisions</strong>
                No subjective bias — purely analytical results
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <span className="material-icons-outlined">history</span>
              </div>
              <div className="auth-feature-text">
                <strong>Full Audit Trail</strong>
                Every application tracked and stored
              </div>
            </div>
          </div>
        </div>
      </div>

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
            <h2>Create your account</h2>
            <p>Start assessing loan applications in minutes</p>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon">person_outline</span>
                <input name="fullName" className="form-input" value={form.fullName}
                       onChange={set} placeholder="John Doe" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon">mail_outline</span>
                <input type="email" name="email" className="form-input" value={form.email}
                       onChange={set} placeholder="you@company.com" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password <span className="required">*</span></label>
                <div className="form-input-icon">
                  <span className="material-icons-outlined input-icon">lock_outline</span>
                  <input type="password" name="password" className="form-input" value={form.password}
                         onChange={set} placeholder="Min 6 chars" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm <span className="required">*</span></label>
                <div className="form-input-icon">
                  <span className="material-icons-outlined input-icon">lock_outline</span>
                  <input type="password" name="confirm" className="form-input" value={form.confirm}
                         onChange={set} placeholder="Repeat" required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={busy}>
              {busy ? <><span className="spinner" />Creating…</> : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}