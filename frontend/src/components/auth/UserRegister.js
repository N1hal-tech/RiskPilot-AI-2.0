import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Alert from '../common/Alert';
import ThemeToggle from '../common/ThemeToggle';

export default function UserRegister() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }

    setBusy(true);
    try {
      await api.register({ fullName: form.fullName, email: form.email, password: form.password, role: 'USER' });
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle size="small" />
      </div>

      <div style={{ maxWidth: 500, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <div style={{ fontSize: 50, marginBottom: 'var(--space-4)' }}>👤</div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#2563eb', marginBottom: 'var(--space-2)' }}>
            Borrower Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Apply for loans with instant decisions
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--space-8)',
          boxShadow: '0 4px 6px rgba(37, 99, 235, 0.1)',
          border: '1px solid rgba(37, 99, 235, 0.15)',
        }}>
          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon">person_outline</span>
                <input name="fullName" className="form-input" value={form.fullName} onChange={set} placeholder="John Doe" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon">mail_outline</span>
                <input type="email" name="email" className="form-input" value={form.email} onChange={set} placeholder="you@example.com" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-icon">
                  <span className="material-icons-outlined input-icon">lock_outline</span>
                  <input type="password" name="password" className="form-input" value={form.password} onChange={set} placeholder="Min 6 chars" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm</label>
                <div className="form-input-icon">
                  <span className="material-icons-outlined input-icon">lock_outline</span>
                  <input type="password" name="confirm" className="form-input" value={form.confirm} onChange={set} placeholder="Repeat" required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-full btn-lg" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', marginTop: 'var(--space-6)' }} disabled={busy}>
              {busy ? <><span className="spinner" />Creating…</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
