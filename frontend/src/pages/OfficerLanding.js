import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';

export default function OfficerLanding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const analytics = await api.getAnalytics();
        const queue = await api.getReviewQueueCount();
        setStats({ analytics, queue: queue.count || 0 });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) return <div className="page-loader"><div className="spinner-lg" /></div>;

  const { analytics, queue } = stats;

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, #059669, #047857)',
        borderRadius: 'var(--border-radius-lg)',
        padding: 'var(--space-10)',
        marginBottom: 'var(--space-8)',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-6)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
              Welcome, {user?.fullName?.split(' ')[0]}! 👨‍💼
            </h1>
            <p style={{ fontSize: 'var(--font-size-base)', opacity: 0.9, marginBottom: 'var(--space-4)' }}>
              Professional loan review & portfolio management
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <button
                className="btn btn-lg"
                onClick={() => navigate('/admin/review')}
                style={{
                  background: 'white',
                  color: '#059669',
                  fontWeight: 700,
                }}
              >
                <span className="material-icons-outlined" style={{ fontSize: 20 }}>rate_review</span>
                Review Queue ({queue})
              </button>
              <button
                className="btn btn-lg"
                onClick={() => navigate('/admin/loans')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid white',
                  fontWeight: 700,
                }}
              >
                <span className="material-icons-outlined" style={{ fontSize: 20 }}>folder_open</span>
                All Loans
              </button>
            </div>
          </div>
          <div style={{ fontSize: 80, opacity: 0.2 }}>📊</div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        <StatCard icon="description" label="Total Applications" value={analytics.totalApplications} color="green" />
        <StatCard icon="check_circle" label="Approved" value={analytics.totalApproved} color="green" />
        <StatCard icon="priority_high" label="Review Queue" value={queue} color={queue > 0 ? 'red' : 'green'} />
        <StatCard icon="cancel" label="Rejected" value={analytics.totalRejected} color="red" />
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-8)' }}>
        <Card
          title="Quick Actions"
          icon="rate_review"
          noPad
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <button
              onClick={() => navigate('/admin/review')}
              style={{
                padding: 'var(--space-4)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontWeight: 600,
                color: '#059669',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-default)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              ⏳ Go to Review Queue
            </button>
            <button
              onClick={() => navigate('/admin/loans')}
              style={{
                padding: 'var(--space-4)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontWeight: 600,
                color: '#059669',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-default)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              📋 View All Loans
            </button>
            <button
              onClick={() => navigate('/admin/audit')}
              style={{
                padding: 'var(--space-4)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontWeight: 600,
                color: '#059669',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              📜 Audit Log
            </button>
          </div>
        </Card>

        <Card
          title="Portfolio Summary"
          icon="trending_up"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                Approval Rate
              </p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#059669' }}>
                {analytics.approvalRate.toFixed(1)}%
              </p>
            </div>
            <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                Repayment Rate
              </p>
              <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#0891b2' }}>
                {analytics.repaymentRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card
          title="Loan Portfolio"
          icon="account_balance"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-default)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Total Approved</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                ₹{(analytics.totalApprovedAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-default)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Avg Interest</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {(analytics.avgInterestRate || 0).toFixed(2)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Default Rate</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ef4444' }}>
                {analytics.defaultRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        <Card
          title="Pending Reviews"
          icon="hourglass_empty"
          action={
            queue > 0 && (
              <button className="btn btn-danger btn-sm" onClick={() => navigate('/admin/review')}>
                Review Now
              </button>
            )
          }
        >
          <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <div style={{
              fontSize: 48,
              fontWeight: 800,
              color: queue > 0 ? '#ef4444' : '#059669',
              marginBottom: 'var(--space-3)',
            }}>
              {queue}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
              {queue === 0 ? 'All caught up! ✓' : 'applications require manual review'}
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
