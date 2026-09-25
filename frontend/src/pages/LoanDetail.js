import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import RiskGauge from '../components/loan/RiskGauge';
import DecisionCard from '../components/loan/DecisionCard';
import ProgressBar from '../components/common/ProgressBar';

export default function LoanDetail() {
  const { id } = useParams();
  const [loan, setLoan]         = useState(null);
  const [comments, setComments] = useState([]);
  const [docs, setDocs]         = useState([]);
  const [newComment, setNew]    = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.getLoanDetail(id),
      api.getComments(id),
      api.getDocs(id),
    ]).then(([l, c, d]) => { setLoan(l); setComments(c); setDocs(d); })
      .finally(() => setLoading(false));
  }, [id]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    const c = await api.addComment({ loanId: Number(id), comment: newComment, isInternal: false });
    setComments([...comments, c]);
    setNew('');
  };

  if (loading) return <div className="page-loader"><div className="spinner-lg" /></div>;
  if (!loan) return <div>Loan not found</div>;

  const fmt = v => '₹' + Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <span>RiskPilot AI</span> <span className="sep">/</span>
          <span>Loans</span> <span className="sep">/</span>
          <span>{loan.applicationRef}</span>
        </div>
        <h1>Application {loan.applicationRef}</h1>
        <p>Submitted on {new Date(loan.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <Card title="RL Agent Decision" icon="smart_toy">
          <RiskGauge probability={loan.defaultProbability || 0} />
          <DecisionCard status={loan.status} message={loan.advisoryMessage}
            rlAction={loan.rlAction} interestRate={loan.offeredInterestRate} />
        </Card>

        <Card title="Application Details" icon="description">
          <div className="result-details-grid">
            <div className="result-detail-item"><label>Income</label><span>{fmt(loan.annualIncome)}</span></div>
            <div className="result-detail-item"><label>Loan</label><span>{fmt(loan.loanAmount)}</span></div>
            <div className="result-detail-item"><label>Debt</label><span>{fmt(loan.existingDebt)}</span></div>
            <div className="result-detail-item"><label>Employment</label><span>{loan.employmentYears} yrs</span></div>
            <div className="result-detail-item"><label>Purpose</label><span>{loan.loanPurpose || 'N/A'}</span></div>
            <div className="result-detail-item"><label>Term</label><span>{loan.loanTermMonths} months</span></div>
            <div className="result-detail-item"><label>Status</label><Badge level={loan.riskLevel} status={loan.status} /></div>
            <div className="result-detail-item"><label>Outcome</label><span>{loan.actualOutcome}</span></div>
          </div>

          {loan.reviewedBy && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--clr-slate-50)', borderRadius: 8, fontSize: 13 }}>
              <strong>Reviewed by:</strong> {loan.reviewedBy}<br/>
              <strong>Notes:</strong> {loan.reviewNotes || 'N/A'}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <ProgressBar value={(loan.defaultProbability || 0) * 100}
              color={loan.riskLevel === 'GREEN' ? 'green' : loan.riskLevel === 'YELLOW' ? 'yellow' : 'red'}
              label="Default Probability" />
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card title={`Comments (${comments.length})`} icon="chat">
          {comments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No comments yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {comments.map(c => (
                <div key={c.id} style={{ padding: 12, background: 'var(--clr-slate-50)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13 }}>{c.userName}</strong>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{c.comment}</p>
                  {c.isInternal && <span className="badge badge-gray badge-sm" style={{ marginTop: 4 }}>Internal</span>}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={newComment} onChange={e => setNew(e.target.value)}
              placeholder="Add a comment..." style={{ flex: 1 }} />
            <button className="btn btn-primary btn-sm" onClick={submitComment}>Send</button>
          </div>
        </Card>

        <Card title={`Documents (${docs.length})`} icon="attach_file">
          {docs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No documents uploaded</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {docs.map(d => (
                <div key={d.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 12, background: 'var(--clr-slate-50)', borderRadius: 8,
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{d.fileName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {d.docType} · {(d.fileSize / 1024).toFixed(0)} KB
                    </div>
                  </div>
                  {d.verified
                    ? <span className="badge badge-green badge-sm">✓ Verified</span>
                    : <span className="badge badge-gray badge-sm">Pending</span>
                  }
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
