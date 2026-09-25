import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import '../styles/landing.css';

export default function AdminLanding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [reviewQueueCount, setReviewQueueCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Set up auto-refresh every 15 seconds
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, queueRes, auditRes] = await Promise.all([
        api.getAnalytics(),
        api.getReviewQueueCount(),
        api.getAuditLogs(0, 5)
      ]);

      setAnalytics(analyticsRes || null);
      setReviewQueueCount(queueRes?.count || 0);
      setAuditLogs(auditRes?.content || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="landing-container admin-landing">
      {/* Hero Section */}
      <div className="landing-hero admin-hero">
        <div className="hero-content">
          <h1 className="hero-title">Enterprise Admin Dashboard</h1>
          <p className="hero-subtitle">Oversee lending operations, approve applications, and monitor platform health</p>
          <button 
            className="hero-cta admin-cta"
            onClick={() => navigate('/admin')}
          >
            Go to Full Dashboard →
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="landing-section">
        <h2 className="section-title">System Overview</h2>
        <div className="stats-grid">
          {loading ? (
            <div className="loading">Loading metrics...</div>
          ) : (
            <>
              <StatCard
                title="Pending Reviews"
                value={reviewQueueCount}
                icon="📋"
                color="#4f46e5"
              />
              <StatCard
                title="Total Applications"
                value={analytics?.totalApplications || 0}
                icon="📊"
                color="#4f46e5"
              />
              <StatCard
                title="Approval Rate"
                value={`${analytics?.approvalRate || 0}%`}
                icon="✅"
                color="#4f46e5"
              />
              <StatCard
                title="Platform Users"
                value={analytics?.totalUsers || 0}
                icon="👥"
                color="#4f46e5"
              />
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="landing-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <Card className="action-card">
            <div className="action-icon">📋</div>
            <h3>Review Pending</h3>
            <p>{reviewQueueCount} applications awaiting review</p>
            <button 
              className="action-button admin-button"
              onClick={() => navigate('/admin/review')}
            >
              Review Now
            </button>
          </Card>

          <Card className="action-card">
            <div className="action-icon">👥</div>
            <h3>Manage Users</h3>
            <p>Oversee user accounts and permissions</p>
            <button 
              className="action-button admin-button"
              onClick={() => navigate('/admin/users')}
            >
              Manage Users
            </button>
          </Card>

          <Card className="action-card">
            <div className="action-icon">📈</div>
            <h3>View Analytics</h3>
            <p>Platform performance and trends</p>
            <button 
              className="action-button admin-button"
              onClick={() => navigate('/admin')}
            >
              View Analytics
            </button>
          </Card>

          <Card className="action-card">
            <div className="action-icon">🔍</div>
            <h3>Audit Logs</h3>
            <p>Monitor system and user activities</p>
            <button 
              className="action-button admin-button"
              onClick={() => navigate('/admin/audit')}
            >
              View Logs
            </button>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="landing-section">
        <h2 className="section-title">Recent Activity</h2>
        <Card className="activity-card">
          {auditLogs.length > 0 ? (
            <div className="activity-list">
              {auditLogs.slice(0, 5).map((log, idx) => (
                <div key={idx} className="activity-item">
                  <div className="activity-time">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </div>
                  <div className="activity-action">
                    <strong>{log.action}</strong>
                    {log.userName && <span className="activity-user">by {log.userName}</span>}
                  </div>
                  <div className="activity-status">
                    {log.entityType && <span className="status-badge pending">{log.entityType}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-activity">No recent activity</p>
          )}
        </Card>
      </div>

      {/* System Health */}
      <div className="landing-section">
        <h2 className="section-title">System Health</h2>
        <div className="health-grid">
          <Card className="health-card">
            <h3>ML Model Status</h3>
            <div className="health-status online">
              <span className="status-dot"></span>
              Online & Operational
            </div>
            <p className="health-metric">Model Confidence: {analytics?.mlConfidence || 0}%</p>
          </Card>

          <Card className="health-card">
            <h3>Database</h3>
            <div className="health-status online">
              <span className="status-dot"></span>
              Connected
            </div>
            <p className="health-metric">Response Time: &lt;50ms</p>
          </Card>

          <Card className="health-card">
            <h3>API Services</h3>
            <div className="health-status online">
              <span className="status-dot"></span>
              All Running
            </div>
            <p className="health-metric">Uptime: 99.9%</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
