import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/common/Card';
import Alert from '../components/common/Alert';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm]       = useState({ fullName: '', phone: '', address: '' });
  const [msg, setMsg]         = useState('');
  const [err, setErr]         = useState('');

  useEffect(() => {
    api.getProfile().then(p => {
      setProfile(p);
      setForm({ fullName: p.fullName || '', phone: p.phone || '', address: p.address || '' });
    });
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      const updated = await api.updateProfile(form);
      setProfile(updated);
      setMsg('Profile updated successfully');
    } catch (e) { setErr(e.message); }
  };

  return (
    <>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div className="grid-2">
        <Card title="Profile Information" icon="person">
          {msg && <Alert type="success">{msg}</Alert>}
          {err && <Alert type="error">{err}</Alert>}
          <form onSubmit={updateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={profile?.email || ''} disabled
                style={{ background: 'var(--clr-slate-50)' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City" />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </Card>

        <Card title="Authentication" icon="lock">
          <Alert type="success">This account uses Google sign-in only. Password changes are disabled.</Alert>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
            If you need to change your email, sign out and use the provider account you want to keep linked.
          </p>
        </Card>
      </div>
    </>
  );
}
