import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotifications().then(setNotifs).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.markNotifRead(id);
    setNotifs(notifs.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await api.markAllNotifsRead();
    setNotifs(notifs.map(n => ({ ...n, isRead: true })));
  };

  const TYPE_ICON = { APPROVED: 'check_circle', REJECTED: 'cancel', UNDER_REVIEW: 'hourglass_top' };
  const TYPE_CLR  = { APPROVED: 'var(--clr-success-600)', REJECTED: 'var(--clr-danger-600)', UNDER_REVIEW: 'var(--clr-warning-600)' };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Notifications</h1><p>Stay updated on your loan applications</p></div>
        <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark All Read</button>
      </div>

      <Card noPad>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner-lg" style={{ margin: '0 auto' }} /></div>
        ) : notifs.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔔</div><h3>No notifications</h3></div>
        ) : (
          <div>
            {notifs.map(n => (
              <div key={n.id} onClick={() => !n.isRead && markRead(n.id)}
                style={{
                  padding: '16px 24px', borderBottom: '1px solid var(--border-default)',
                  background: n.isRead ? 'transparent' : 'var(--clr-primary-50)',
                  cursor: n.isRead ? 'default' : 'pointer', display: 'flex', gap: 16, alignItems: 'flex-start',
                  transition: 'background 0.2s',
                }}>
                <span className="material-icons-outlined"
                  style={{ fontSize: 24, color: TYPE_CLR[n.type] || 'var(--text-muted)', marginTop: 2 }}>
                  {TYPE_ICON[n.type] || 'notifications'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 15, marginBottom: 4 }}>{n.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--clr-primary-500)', marginTop: 8 }} />}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
