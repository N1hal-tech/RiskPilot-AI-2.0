import { useState } from 'react';
import Badge from '../common/Badge';
import api from '../../services/api';

const ACTIONS_DISPLAY = {
  APPROVE_STANDARD: '8%',
  APPROVE_MODERATE: '12%',
  APPROVE_HIGH:     '16%',
  REJECT:           '—',
  MANUAL_REVIEW:    '—',
};

export default function HistoryTable({ data, onFeedbackSent }) {
  const [busy, setBusy] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📄</div>
        <h3>No applications yet</h3>
        <p>Submit your first loan application to see RL agent decisions here.</p>
      </div>
    );
  }

  const sendFeedback = async (loanId, defaulted) => {
    setBusy(loanId);
    try {
      await api.submitFeedback({ loanId, defaulted });
      if (onFeedbackSent) onFeedbackSent();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Income</th>
            <th>Loan</th>
            <th>RL Action</th>
            <th>Rate</th>
            <th>Risk</th>
            <th>Status</th>
            <th>Outcome</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {data.map(a => (
            <tr key={a.id}>
              <td className="mono">
                {new Date(a.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </td>
              <td className="amount">₹{Number(a.annualIncome).toLocaleString()}</td>
              <td className="amount">₹{Number(a.loanAmount).toLocaleString()}</td>
              <td>
                <span className="badge badge-blue badge-sm">
                  {a.rlAction?.replace(/_/g, ' ') || 'N/A'}
                </span>
              </td>
              <td className="mono">
                {a.offeredInterestRate > 0 ? `${a.offeredInterestRate}%` : '—'}
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 50 }}>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div
                        className={`progress-bar-fill ${
                          a.riskLevel === 'GREEN' ? 'green' :
                          a.riskLevel === 'YELLOW' ? 'yellow' : 'red'
                        }`}
                        style={{ width: `${((a.defaultProbability || 0) * 100).toFixed(0)}%` }}
                      />
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
                    {((a.defaultProbability || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </td>
              <td><Badge level={a.riskLevel} status={a.status} /></td>
              <td>
                {a.actualOutcome === 'REPAID' && (
                  <span className="badge badge-green badge-sm badge-dot">Repaid</span>
                )}
                {a.actualOutcome === 'DEFAULTED' && (
                  <span className="badge badge-red badge-sm badge-dot">Defaulted</span>
                )}
                {a.actualOutcome === 'PENDING' && (
                  <span className="badge badge-gray badge-sm">Pending</span>
                )}
              </td>
              <td>
                {a.feedbackGiven ? (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    ✓ Sent {a.rewardReceived != null && (
                      <span style={{
                        fontWeight: 700,
                        color: a.rewardReceived >= 0 ? 'var(--clr-success-600)' : 'var(--clr-danger-600)'
                      }}>
                        ({a.rewardReceived >= 0 ? '+' : ''}{a.rewardReceived?.toFixed(1)})
                      </span>
                    )}
                  </span>
                ) : a.status === 'APPROVED' ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--clr-success-50)', color: 'var(--clr-success-700)', border: '1px solid var(--clr-success-200)' }}
                      disabled={busy === a.id}
                      onClick={() => sendFeedback(a.id, false)}
                    >
                      {busy === a.id ? '...' : 'Repaid'}
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--clr-danger-50)', color: 'var(--clr-danger-700)', border: '1px solid var(--clr-danger-200)' }}
                      disabled={busy === a.id}
                      onClick={() => sendFeedback(a.id, true)}
                    >
                      {busy === a.id ? '...' : 'Defaulted'}
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}