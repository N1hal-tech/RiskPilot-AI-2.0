import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import HistoryTable from '../components/loan/HistoryTable';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');

  const fetchHistory = useCallback(async () => {
    try   { setHistory(await api.getLoanHistory()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = filter === 'ALL' ? history : history.filter(h => h.status === filter);

  const total     = history.length;
  const approved  = history.filter(h => h.status === 'APPROVED').length;
  const reviewing = history.filter(h => h.status === 'UNDER_REVIEW').length;
  const rejected  = history.filter(h => h.status === 'REJECTED').length;

  const filters = [
    { key: 'ALL',          label: 'All',           count: total },
    { key: 'APPROVED',     label: 'Approved',       count: approved },
    { key: 'UNDER_REVIEW', label: 'Under Review',   count: reviewing },
    { key: 'REJECTED',     label: 'Rejected',       count: rejected },
  ];

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <span>RiskPilot AI</span> <span className="sep">/</span> <span>History</span>
        </div>
        <h1>Application History</h1>
        <p>Track all your past loan applications and their outcomes</p>
      </div>

      {/* Summary Stats */}
      <div className="history-summary">
        <StatCard icon="description" label="Total"     value={total}     color="blue" />
        <StatCard icon="check_circle" label="Approved"  value={approved} color="green" />
        <StatCard icon="hourglass_top" label="Reviewing" value={reviewing} color="amber" />
        <StatCard icon="cancel" label="Rejected"        value={rejected} color="red" />
      </div>

      {/* Filter Tabs + Table */}
      <Card noPad>
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-default)' }}>
          <div className="history-filters">
            {filters.map(f => (
              <button
                key={f.key}
                className={`btn ${filter === f.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                <span style={{
                  marginLeft: 6, padding: '1px 7px', borderRadius: 10,
                  fontSize: 11, fontWeight: 700,
                  background: filter === f.key ? 'rgba(255,255,255,0.2)' : 'var(--clr-slate-100)',
                  color: filter === f.key ? 'white' : 'var(--text-muted)',
                }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <div className="spinner-lg" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <HistoryTable data={filtered} />
        )}
      </Card>
    </>
  );
}