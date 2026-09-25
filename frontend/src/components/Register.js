import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm]   = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);
  const navigate = useNavigate();

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6)          { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm)     { setError('Passwords do not match');                 return; }

    setBusy(true);
    try {
      await api.register({ fullName: form.fullName, email: form.email, password: form.password });
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join RiskPilot AI to get started</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="fullName" value={form.fullName} onChange={set}
                   placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={form.email} onChange={set}
                   placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={set}
                   placeholder="At least 6 characters" required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirm" value={form.confirm} onChange={set}
                   placeholder="Re-enter your password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={busy}>
            {busy ? <><span className="spinner" />Creating…</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}