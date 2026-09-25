import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';

export default function AdminAudit() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const [total, setTotal]     = useState(0);

  const fetchLogs = async (p = 0) => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs(p, 30);
      setLogs(data.content);
      setTotal(data.totalPages);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const ACTION_CLR = {
    LOAN_APPLIED: 'badge-blue', FEEDBACK_GIVEN: 'badge-green',
    LOAN_REVIEWED: 'badge-yellow', LOGIN: 'badge-gray',
  };

  return (
    <>
      <div className="page-header"><h1>Audit Log</h1><p>Complete trail of all system actions</p></div>
      <Card noPad>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner-lg" style={{ margin: '0 auto' }} /></div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th><th>IP</th></tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td className="mono" style={{ fontSize: 11 }}>{new Date(l.createdAt).toLocaleString()}</td>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{l.userName}</td>
                    <td><span className={`badge badge-sm ${ACTION_CLR[l.action] || 'badge-gray'}`}>{l.action}</span></td>
                    <td style={{ fontSize: 13 }}>{l.entityType} {l.entityId && `#${l.entityId}`}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.details}
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>{l.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button className="btn btn-sm btn-secondary" disabled={page === 0} onClick={() => fetchLogs(page - 1)}>Previous</button>
              <span style={{ padding: '6px 12px', fontSize: 13 }}>Page {page + 1} of {total}</span>
              <button className="btn btn-sm btn-secondary" disabled={page >= total - 1} onClick={() => fetchLogs(page + 1)}>Next</button>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
