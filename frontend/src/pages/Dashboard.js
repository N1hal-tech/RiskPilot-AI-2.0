import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import HistoryTable from '../components/loan/HistoryTable';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setHistory(await api.getLoanHistory());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  // Stats
  const total     = history.length;
  const approved  = history.filter(h => h.status === 'APPROVED').length;
  const reviewing = history.filter(h => h.status === 'UNDER_REVIEW').length;
  const rejected  = history.filter(h => h.status === 'REJECTED').length;
  const avgRisk   = total > 0
    ? (history.reduce((s, h) => s + h.defaultProbability, 0) / total * 100).toFixed(1)
    : '0.0';

  return (
    <>
      {/* Hero Banner */}
      <div className="dashboard-hero animate-fadeUp">
        <div>
          <h1>Welcome back, {user?.fullName?.split(' ')[0]}</h1>
          <p>Here is an overview of your loan applications and risk profile</p>
        </div>
        <div className="dashboard-hero-cta">
          <button className="btn btn-xl" onClick={() => navigate('/apply')}>
            <span className="material-icons-outlined" style={{ fontSize: 20 }}>add</span>
            New Application
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        <StatCard icon="description" label="Total Applications" value={total}      color="blue" />
        <StatCard icon="check_circle" label="Approved"           value={approved}  color="green" />
        <StatCard icon="hourglass_top" label="Under Review"      value={reviewing} color="amber" />
        <StatCard icon="trending_down" label="Rejected"          value={rejected}  color="red" />
      </div>

      {/* Recent Applications */}
      <Card
        title="Recent Applications"
        icon="receipt_long"
        action={
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>
            View All
          </button>
        }
        noPad
      >
        {loading ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
            <div className="spinner-lg" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <HistoryTable data={history.slice(0, 5)} />
        )}
      </Card>
    </>
  );
}