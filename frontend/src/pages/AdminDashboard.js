import { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);
  const [nextRefresh, setNextRefresh] = useState(10);
  const [auditEvents, setAuditEvents] = useState([]);

  const fetchData = async () => {
    try {
      const result = await api.getAnalytics();
      const review = await api.getReviewQueueCount();
      const audit = await api.getAuditLogs(0, 8);
      setData(result);
      setReviewCount(review.count || 0);
      setAuditEvents(audit?.content || []);
    } catch (err) {
      console.error('Admin dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
      setNextRefresh(10);
    }, 10000);
    const ticker = setInterval(() => setNextRefresh(prev => Math.max(0, prev - 1)), 1000);
    return () => { clearInterval(interval); clearInterval(ticker); };
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner-lg" /></div>;
  if (!data) {
    // Show default empty state instead of blank
    data = {
      totalApplications: 0,
      totalApproved: 0,
      totalRejected: 0,
      totalUnderReview: 0,
      totalRepaid: 0,
      totalDefaulted: 0,
      totalPending: 0,
      totalUsers: 0,
      avgDefaultProbability: 0,
      avgInterestRate: 0,
      totalApprovedAmount: 0,
      avgReward: 0,
      approvalRate: 0,
      defaultRate: 0,
      repaymentRate: 0
    };
  }

  return (
    <>
      <div className="page-header">
        <h1>System Analytics</h1>
        <p>Enterprise-wide loan portfolio and RL agent performance</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Live refresh in {nextRefresh} second{nextRefresh === 1 ? '' : 's'}.
        </p>
        <button className="btn btn-sm" onClick={fetchData} style={{ minWidth: 110 }}>
          <span className="material-icons-outlined" style={{ fontSize: 18, marginRight: 6 }}>refresh</span>
          Refresh now
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon="description" label="Total Applications" value={data.totalApplications} color="blue" />
        <StatCard icon="group" label="Total Users" value={data.totalUsers} color="blue" />
        <StatCard icon="check_circle" label="Approved" value={data.totalApproved} color="green" />
        <StatCard icon="hourglass_top" label="Under Review" value={data.totalUnderReview} color="amber" />
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <StatCard icon="paid" label="Repaid" value={data.totalRepaid} color="green" />
        <StatCard icon="money_off" label="Defaulted" value={data.totalDefaulted} color="red" />
        <StatCard icon="priority_high" label="Escalated Queue" value={reviewCount} color={reviewCount > 0 ? 'danger' : 'green'} />
      </div>

      <div className="grid-2">
        <Card title="Key Metrics" icon="analytics">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ProgressBar value={data.approvalRate} color="green" label="Approval Rate" />
            <ProgressBar value={data.repaymentRate} color="blue" label="Repayment Rate" />
            <ProgressBar value={data.defaultRate} color="red" label="Default Rate" />
            <ProgressBar value={(data.avgDefaultProbability || 0) * 100} color="yellow" label="Avg Default Probability" />
          </div>
        </Card>

        <Card title="Escalated Loans" icon="rate_review" action={
          <a href="/admin/review" className="btn btn-secondary btn-sm">Go to review queue</a>
        }>
          <div style={{ minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h2 style={{ fontSize: 40, margin: 0, color: reviewCount > 0 ? 'var(--danger)' : 'var(--success)' }}>{reviewCount}</h2>
            <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
              applications awaiting manual admin review
            </p>
          </div>
        </Card>

        <Card title="Financial Summary" icon="account_balance">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-default)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Total Approved Amount</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 16 }}>
                ₹{(data.totalApprovedAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-default)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Avg Interest Rate</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 16 }}>
                {(data.avgInterestRate || 0).toFixed(1)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Avg RL Agent Reward</span>
              <span style={{
                fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 16,
                color: (data.avgReward || 0) >= 0 ? 'var(--clr-success-600)' : 'var(--clr-danger-600)',
              }}>
                {(data.avgReward || 0) >= 0 ? '+' : ''}{(data.avgReward || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Recent Audit Events" icon="history_edu" action={
        <a href="/admin/audit" className="btn btn-secondary btn-sm">View all</a>
      }>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {auditEvents.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No events in the last hour.</p>
          ) : (
            <table className="data-table" style={{ width: '100%', marginBottom: 0 }}>
              <thead>
                <tr>
                  <th>Time</th><th>User</th><th>Action</th><th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditEvents.map(evt => (
                  <tr key={evt.id}>
                    <td>{new Date(evt.createdAt).toLocaleString()}</td>
                    <td>{evt.userName || 'System'}</td>
                    <td>{evt.action}</td>
                    <td>{evt.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </>
  );
}
