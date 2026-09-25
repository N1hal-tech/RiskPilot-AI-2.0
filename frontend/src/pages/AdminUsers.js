import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const toggle = async (id) => {
    await api.toggleUserActive(id);
    setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  return (
    <>
      <div className="page-header"><h1>User Management</h1><p>View and manage all registered users</p></div>
      <Card noPad>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner-lg" style={{ margin: '0 auto' }} /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                  <td className="mono" style={{ fontSize: 13 }}>{u.email}</td>
                  <td><span className={`badge badge-sm ${u.role === 'ADMIN' ? 'badge-red' : u.role === 'LOAN_OFFICER' ? 'badge-yellow' : 'badge-blue'}`}>
                    {u.role}
                  </span></td>
                  <td><span className={`badge badge-sm badge-dot ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span></td>
                  <td className="mono" style={{ fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => toggle(u.id)} style={{ fontSize: 11 }}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
