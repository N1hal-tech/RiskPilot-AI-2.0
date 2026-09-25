import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Alert from '../common/Alert';
import ThemeToggle from '../common/ThemeToggle';

export default function OfficerRegister() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '', licenseId: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (!form.licenseId) { setError('License/Credential ID is required'); return; }

    setBusy(true);
    try {
      await api.register({ fullName: form.fullName, email: form.email, password: form.password, role: 'LOAN_OFFICER' });
      navigate('/login', { state: { message: 'Officer account created! Please sign in.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle size="small" />
      </div>

      <div style={{ maxWidth: 500, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <div style={{ fontSize: 50, marginBottom: 'var(--space-4)' }}>👨‍💼</div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#059669', marginBottom: 'var(--space-2)' }}>
            Loan Officer
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Professional loan review and management
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--space-8)',
          boxShadow: '0 4px 6px rgba(5, 150, 105, 0.1)',
          border: '1px solid rgba(5, 150, 105, 0.15)',
        }}>
          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon">person_outline</span>
                <input name="fullName" className="form-input" value={form.fullName} onChange={set} placeholder="Officer Name" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Email</label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon">mail_outline</span>
                <input type="email" name="email" className="form-input" value={form.email} onChange={set} placeholder="officer@bank.com" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">License / Credential ID</label>
              <div className="form-input-icon">
                <span className="material-icons-outlined input-icon">verified_user</span>
                <input name="licenseId" className="form-input" value={form.licenseId} onChange={set} placeholder="e.g. LOI-2024-001234" required />
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

            <button type="submit" className="btn btn-full btn-lg" style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', marginTop: 'var(--space-6)' }} disabled={busy}>
              {busy ? <><span className="spinner" />Creating…</> : 'Create Officer Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: '#059669', fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
