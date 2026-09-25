import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import HistoryTable from '../components/loan/HistoryTable';

export default function UserLanding() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const total = history.length;
  const approved = history.filter(h => h.status === 'APPROVED').length;
  const reviewing = history.filter(h => h.status === 'UNDER_REVIEW').length;
  const rejected = history.filter(h => h.status === 'REJECTED').length;

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        borderRadius: 'var(--border-radius-lg)',
        padding: 'var(--space-10)',
        marginBottom: 'var(--space-8)',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-6)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
              Welcome, {user?.fullName?.split(' ')[0]}! 👋
            </h1>
            <p style={{ fontSize: 'var(--font-size-base)', opacity: 0.9, marginBottom: 'var(--space-4)' }}>
              Apply for loans with instant AI-powered decisions
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <button
                className="btn btn-lg"
                onClick={() => navigate('/apply')}
                style={{
                  background: 'white',
                  color: '#2563eb',
                  fontWeight: 700,
                }}
              >
                <span className="material-icons-outlined" style={{ fontSize: 20 }}>add_circle</span>
                New Loan Application
              </button>
              <button
                className="btn btn-lg"
                onClick={() => navigate('/history')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid white',
                  fontWeight: 700,
                }}
              >
                <span className="material-icons-outlined" style={{ fontSize: 20 }}>history</span>
                View History
              </button>
            </div>
          </div>
          <div style={{ fontSize: 80, opacity: 0.2 }}>💰</div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        <StatCard icon="description" label="Total Applications" value={total} color="blue" />
        <StatCard icon="check_circle" label="Approved" value={approved} color="green" />
        <StatCard icon="hourglass_top" label="Under Review" value={reviewing} color="amber" />
        <StatCard icon="trending_down" label="Rejected" value={rejected} color="red" />
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-8)' }}>
        <Card
          title="Quick Actions"
          icon="lightning_bolt"
          noPad
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <button
              onClick={() => navigate('/apply')}
              style={{
                padding: 'var(--space-4)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontWeight: 600,
                color: '#2563eb',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-default)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              + Start New Loan Application
            </button>
            <button
              onClick={() => navigate('/history')}
              style={{
                padding: 'var(--space-4)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontWeight: 600,
                color: '#2563eb',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-default)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              📋 Check Application Status
            </button>
            <button
              onClick={() => navigate('/notifications')}
              style={{
                padding: 'var(--space-4)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontWeight: 600,
                color: '#2563eb',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              🔔 View Notifications
            </button>
          </div>
        </Card>

        <Card
          title="Account Balance"
          icon="account_balance_wallet"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                Current Approved Loans
              </p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#2563eb' }}>
                ₹{history.filter(h => h.status === 'APPROVED').reduce((sum, h) => sum + (h.loanAmount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                Average Interest Rate
              </p>
              <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#059669' }}>
                {history.length > 0
                  ? (history.reduce((sum, h) => sum + (h.offeredInterestRate || 0), 0) / history.length).toFixed(2)
                  : '—'}%
              </p>
            </div>
          </div>
        </Card>
      </div>

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
        ) : history.length === 0 ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No applications yet. Start by creating a new loan application.</p>
          </div>
        ) : (
          <HistoryTable data={history.slice(0, 5)} />
        )}
      </Card>
    </>
  );
}
