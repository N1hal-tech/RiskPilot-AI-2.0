import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Alert from '../common/Alert';
import ThemeToggle from '../common/ThemeToggle';

export default function AdminRegister() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '', orgId: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (!form.orgId) { setError('Organization ID is required'); return; }

    setBusy(true);
    try {
      await api.register({ fullName: form.fullName, email: form.email, password: form.password, role: 'ADMIN' });
      navigate('/login', { state: { message: 'Admin account created! Please sign in.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #0a0f1e, #1a1f35)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle size="small" />
      </div>

      <div style={{ maxWidth: 500, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <div style={{ fontSize: 50, marginBottom: 'var(--space-4)' }}>⚙️</div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#818cf8', marginBottom: 'var(--space-2)' }}>
            Administrator
          </h1>
          <p style={{ color: '#a5b4fc', fontSize: 'var(--font-size-sm)' }}>
            Enterprise portfolio & system management
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #131c31, #1a2540)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--space-8)',
          boxShadow: '0 4px 6px rgba(99, 102, 241, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
          border: '1px solid rgba(129, 140, 248, 0.2)',
        }}>
          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#f1f5f9' }}>Full Name</label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon" style={{ color: '#a5b4fc' }}>person_outline</span>
                <input name="fullName" className="form-input" style={{ background: 'rgba(26, 37, 64, 0.8)', borderColor: 'rgba(129, 140, 248, 0.2)', color: '#f1f5f9' }} value={form.fullName} onChange={set} placeholder="Administrator Name" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#f1f5f9' }}>Corporate Email</label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon" style={{ color: '#a5b4fc' }}>mail_outline</span>
                <input type="email" name="email" className="form-input" style={{ background: 'rgba(26, 37, 64, 0.8)', borderColor: 'rgba(129, 140, 248, 0.2)', color: '#f1f5f9' }} value={form.email} onChange={set} placeholder="admin@financecorp.com" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#f1f5f9' }}>Organization ID</label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon" style={{ color: '#a5b4fc' }}>domain_verification</span>
                <input name="orgId" className="form-input" style={{ background: 'rgba(26, 37, 64, 0.8)', borderColor: 'rgba(129, 140, 248, 0.2)', color: '#f1f5f9' }} value={form.orgId} onChange={set} placeholder="ORG-2024-0001" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ color: '#f1f5f9' }}>Master Password</label>
                <div className="form-input-icon">
                  <span className="material-icons-outlined input-icon" style={{ color: '#a5b4fc' }}>lock_outline</span>
                  <input type="password" name="password" className="form-input" style={{ background: 'rgba(26, 37, 64, 0.8)', borderColor: 'rgba(129, 140, 248, 0.2)', color: '#f1f5f9' }} value={form.password} onChange={set} placeholder="Min 6 chars" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#f1f5f9' }}>Confirm</label>
                <div className="form-input-icon">
                  <span className="material-icons-outlined input-icon" style={{ color: '#a5b4fc' }}>lock_outline</span>
                  <input type="password" name="confirm" className="form-input" style={{ background: 'rgba(26, 37, 64, 0.8)', borderColor: 'rgba(129, 140, 248, 0.2)', color: '#f1f5f9' }} value={form.confirm} onChange={set} placeholder="Repeat" required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-full btn-lg" style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: 'white', marginTop: 'var(--space-6)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }} disabled={busy}>
              {busy ? <><span className="spinner" />Creating…</> : 'Create Admin Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: '#a5b4fc' }}>
            Already have an account? <Link to="/login" style={{ color: '#818cf8', fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
