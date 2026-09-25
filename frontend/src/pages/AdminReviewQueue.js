import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Alert from '../components/common/Alert';
import ProgressBar from '../components/common/ProgressBar';

const Q_LABELS = ['REJECT', 'APPROVE 8%', 'APPROVE 12%', 'APPROVE 16%', 'REVIEW'];

const CONFIDENCE_STYLE = {
  HIGH:   { bg: 'var(--success-light)',  color: 'var(--success)', border: 'var(--success)' },
  MEDIUM: { bg: 'var(--warning-light)',  color: 'var(--warning)', border: 'var(--warning)' },
  LOW:    { bg: 'var(--danger-light)',   color: 'var(--danger)',  border: 'var(--danger)'  },
};

export default function AdminReviewQueue() {
  const [queue, setQueue]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [notes, setNotes]       = useState({});
  const [rates, setRates]       = useState({});
  const [msg, setMsg]           = useState('');
  const [err, setErr]           = useState('');
  const [busy, setBusy]         = useState(null);

  const fetchQueue = useCallback(async () => {
    try { setQueue(await api.getReviewQueue()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const handleReview = async (loanId, decision) => {
    setBusy(loanId);
    setErr(''); setMsg('');
    try {
      await api.reviewLoan({
        loanId,
        decision,
        notes: notes[loanId] || '',
        overrideInterestRate: rates[loanId] ? parseFloat(rates[loanId]) : null,
      });
      setMsg(`Application ${decision.toLowerCase()}d successfully. User has been notified.`);
      fetchQueue();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  const fmt = (v) => '₹' + Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <span>Admin</span> <span className="sep">/</span> <span>Review Queue</span>
        </div>
        <h1>⚠️ Escalated Applications ({queue.length})</h1>
        <p>
          These applications were escalated because the RL agent's confidence was
          below the threshold. Your decision will be used to train the agent.
        </p>
      </div>

      {msg && <Alert type="success">{msg}</Alert>}
      {err && <Alert type="error">{err}</Alert>}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner-lg" style={{ margin: '0 auto' }} /></div>
      ) : queue.length === 0 ? (
        <Card>
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <h3>No Pending Reviews</h3>
            <p>All escalated applications have been reviewed. Check back later.</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {queue.map(loan => {
            const isExpanded = expanded === loan.id;
            const confStyle = CONFIDENCE_STYLE[loan.confidenceLevel] || CONFIDENCE_STYLE.LOW;

            return (
              <div key={loan.id} className="card" style={{ overflow: 'visible' }}>
                <div style={{
                  padding: '16px 24px', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', cursor: 'pointer',
                  borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                }} onClick={() => setExpanded(isExpanded ? null : loan.id)}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: confStyle.bg, border: `2px solid ${confStyle.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-mono)',
                      color: confStyle.color,
                    }}>
                      {loan.confidence ? (loan.confidence * 100).toFixed(0) : '?'}%
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>
                        {loan.applicationRef}
                        <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                          by {loan.userName}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {fmt(loan.loanAmount)} loan · {fmt(loan.annualIncome)} income ·
                        {loan.employmentYears} yrs employed
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`badge badge-sm ${confStyle.color.includes('danger') ? 'badge-red' : confStyle.color.includes('warning') ? 'badge-yellow' : 'badge-green'}`}
                      style={{ padding: '4px 12px' }}>
                      {loan.confidenceLevel} Confidence
                    </span>
                    <span className="badge badge-blue badge-sm">
                      RL suggests: {loan.rlSuggestedAction?.replace(/_/g, ' ')}
                    </span>
                    <span className="material-icons-outlined" style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                      expand_more
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: 24, animation: 'fadeUp 0.3s ease both' }}>
                    <div className="grid-2" style={{ gap: 24 }}>
                      <div>
                        <div style={{
                          padding: 16, borderRadius: 10, marginBottom: 20,
                          background: confStyle.bg, border: `1px solid ${confStyle.border}`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span className="material-icons-outlined" style={{ fontSize: 20, color: confStyle.color }}>warning_amber</span>
                            <strong style={{ fontSize: 14, color: confStyle.color }}>Escalation Reason</strong>
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {loan.escalationReason}
                          </p>
                        </div>

                        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Applicant Financials
                        </h4>
                        <div className="result-details-grid" style={{ marginBottom: 20 }}>
                          <div className="result-detail-item">
                            <label>Annual Income</label><span>{fmt(loan.annualIncome)}</span>
                          </div>
                          <div className="result-detail-item">
                            <label>Loan Amount</label><span>{fmt(loan.loanAmount)}</span>
                          </div>
                          <div className="result-detail-item">
                            <label>Existing Debt</label><span>{fmt(loan.existingDebt)}</span>
                          </div>
                          <div className="result-detail-item">
                            <label>Employment</label><span>{loan.employmentYears} yrs</span>
                          </div>
                        </div>

                        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Risk Metrics
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                          <ProgressBar
                            value={(loan.defaultProbability || 0) * 100}
                            color={loan.defaultProbability < 0.3 ? 'green' : loan.defaultProbability < 0.6 ? 'yellow' : 'red'}
                            label="Default Probability"
                          />
                          <ProgressBar
                            value={(loan.existingDebt / loan.annualIncome) * 100}
                            color="blue" label="Debt-to-Income Ratio"
                          />
                          <ProgressBar
                            value={(loan.loanAmount / loan.annualIncome) * 100}
                            color="blue" label="Loan-to-Income Ratio"
                          />
                        </div>

                        {loan.qValues && loan.qValues.length > 0 && (
                          <>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              RL Agent Q-Values
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {loan.qValues.map((q, i) => {
                                const maxQ = Math.max(...loan.qValues.map(Math.abs), 1);
                                const isSuggested = Q_LABELS[i]?.includes(
                                  loan.rlSuggestedAction?.replace('APPROVE_STANDARD', 'APPROVE 8%')
                                    .replace('APPROVE_MODERATE', 'APPROVE 12%')
                                    .replace('APPROVE_HIGH', 'APPROVE 16%')
                                    .replace('MANUAL_REVIEW', 'REVIEW')
                                );
                                return (
                                  <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                      <span style={{ fontSize: 12, fontWeight: isSuggested ? 700 : 500, color: isSuggested ? 'var(--clr-primary-600)' : 'var(--text-muted)' }}>
                                        {isSuggested && '★ '}{Q_LABELS[i]}
                                      </span>
                                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: q >= 0 ? 'var(--clr-success-600)' : 'var(--clr-danger-600)' }}>
                                        {q >= 0 ? '+' : ''}{q.toFixed(3)}
                                      </span>
                                    </div>
                                    <div className="progress-bar" style={{ height: 5 }}>
                                      <div className={`progress-bar-fill ${q >= 0 ? 'green' : 'red'}`} style={{ width: `${(Math.abs(q) / maxQ) * 100}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <div style={{
                          padding: 16, borderRadius: 10, marginBottom: 20,
                          background: 'var(--bg)', border: '1px solid var(--border)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span className="material-icons-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>smart_toy</span>
                            <strong style={{ fontSize: 14 }}>RL Agent Notes for Admin</strong>
                          </div>
                          <pre style={{
                            fontSize: 12, fontFamily: 'var(--font-mono)',
                            color: 'var(--text-secondary)', lineHeight: 1.6,
                            whiteSpace: 'pre-wrap', margin: 0,
                          }}>
                            {loan.adminNote}
                          </pre>
                        </div>

                        <div style={{
                          padding: 20, borderRadius: 12,
                          background: 'linear-gradient(135deg, var(--primary-light), white)',
                          border: '1px solid var(--primary)',
                        }}>
                          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                            <span className="material-icons-outlined" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8 }}>gavel</span>
                            Your Decision
                          </h4>

                          <div className="form-group">
                            <label className="form-label">Override Interest Rate (optional)</label>
                            <div className="form-input-suffix">
                              <input type="number" className="form-input"
                                value={rates[loan.id] || ''}
                                onChange={e => setRates({ ...rates, [loan.id]: e.target.value })}
                                placeholder={loan.offeredInterestRate > 0 ? `${loan.offeredInterestRate}` : '8.0'}
                                min="0" max="30" step="0.5" />
                              <span className="suffix">%</span>
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="form-label">Review Notes</label>
                            <textarea className="form-input"
                              value={notes[loan.id] || ''}
                              onChange={e => setNotes({ ...notes, [loan.id]: e.target.value })}
                              placeholder="Explain your decision (visible to applicant)..."
                              rows={3}
                              style={{ resize: 'vertical' }}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                            <button
                              className="btn btn-lg"
                              style={{
                                flex: 1, background: 'linear-gradient(135deg, var(--success), var(--primary))',
                                color: 'white', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                              }}
                              disabled={busy === loan.id}
                              onClick={() => handleReview(loan.id, 'APPROVE')}
                            >
                              {busy === loan.id ? <><span className="spinner" /> Processing...</> : (
                                <><span className="material-icons-outlined" style={{ fontSize: 20 }}>check_circle</span> Approve Loan</>
                              )}
                            </button>

                            <button
                              className="btn btn-lg"
                              style={{
                                flex: 1, background: 'linear-gradient(135deg, var(--danger), var(--danger-dark))',
                                color: 'white', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                              }}
                              disabled={busy === loan.id}
                              onClick={() => handleReview(loan.id, 'REJECT')}
                            >
                              {busy === loan.id ? <><span className="spinner" /> Processing...</> : (
                                <><span className="material-icons-outlined" style={{ fontSize: 20 }}>cancel</span> Reject Loan</>
                              )}
                            </button>
                          </div>

                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
                            Your decision will be used as feedback to improve the RL agent's future accuracy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
