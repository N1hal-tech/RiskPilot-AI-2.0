import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';

export default function AdminLoans() {
  const [loans, setLoans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const [total, setTotal]     = useState(0);
  const [reviewId, setReviewId] = useState(null);
  const [notes, setNotes]     = useState('');
  const [msg, setMsg]         = useState('');

  const fetchLoans = async (p = 0) => {
    setLoading(true);
    try {
      const data = await api.getAllLoans(p, 15);
      setLoans(data.content);
      setTotal(data.totalPages);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLoans(); }, []);

  const review = async (loanId, decision) => {
    try {
      await api.reviewLoan({ loanId, decision, notes });
      setMsg(`Loan ${decision.toLowerCase()}d successfully`);
      setReviewId(null); setNotes('');
      fetchLoans(page);
    } catch (e) { setMsg(e.message); }
  };

  return (
    <>
      <div className="page-header"><h1>All Loan Applications</h1><p>Review and manage system-wide applications</p></div>
      {msg && <Alert type="success">{msg}</Alert>}

      <Card noPad>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner-lg" style={{ margin: '0 auto' }} /></div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref</th><th>Applicant</th><th>Amount</th><th>RL Action</th>
                  <th>Risk</th><th>Status</th><th>Outcome</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l.id}>
                    <td className="mono" style={{ fontSize: 12 }}>{l.applicationRef}</td>
                    <td>{l.userName}</td>
                    <td className="amount">₹{Number(l.loanAmount).toLocaleString()}</td>
                    <td><span className="badge badge-blue badge-sm">{l.rlAction?.replace(/_/g, ' ')}</span></td>
                    <td>{((l.defaultProbability || 0) * 100).toFixed(1)}%</td>
                    <td><Badge level={l.riskLevel} status={l.status} /></td>
                    <td><span className={`badge badge-sm ${l.actualOutcome === 'REPAID' ? 'badge-green' : l.actualOutcome === 'DEFAULTED' ? 'badge-red' : 'badge-gray'}`}>
                      {l.actualOutcome}
                    </span></td>
                    <td>
                      {l.status === 'UNDER_REVIEW' && (
                        reviewId === l.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)}
                              placeholder="Review notes..." style={{ fontSize: 12, padding: 6 }} />
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-sm" style={{ background: 'var(--clr-success-50)', color: 'var(--clr-success-700)' }}
                                onClick={() => review(l.id, 'APPROVE')}>Approve</button>
                              <button className="btn btn-sm" style={{ background: 'var(--clr-danger-50)', color: 'var(--clr-danger-700)' }}
                                onClick={() => review(l.id, 'REJECT')}>Reject</button>
                              <button className="btn btn-sm btn-ghost" onClick={() => setReviewId(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button className="btn btn-sm btn-secondary" onClick={() => setReviewId(l.id)}>Review</button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button className="btn btn-sm btn-secondary" disabled={page === 0} onClick={() => fetchLoans(page - 1)}>Previous</button>
              <span style={{ padding: '6px 12px', fontSize: 13 }}>Page {page + 1} of {total}</span>
              <button className="btn btn-sm btn-secondary" disabled={page >= total - 1} onClick={() => fetchLoans(page + 1)}>Next</button>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
