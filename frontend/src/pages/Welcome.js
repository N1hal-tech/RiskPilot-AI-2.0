import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const roles = [
    {
      id: 'user',
      title: 'Borrower Portal',
      desc: 'Apply for loans, track your application history, and view live status updates.',
      icon: '👤',
      color: '#2563eb',
      loginPath: '/auth',
      registerPath: '/auth',
      dashboardPath: '/dashboard/user',
      features: ['Loan applications', 'Application history', 'Notifications & profile']
    },
    {
      id: 'officer',
      title: 'Loan Officer Workspace',
      desc: 'Review escalated applications, monitor approval flow, and manage the portfolio.',
      icon: '👨‍💼',
      color: '#059669',
      loginPath: '/auth',
      registerPath: '/auth',
      dashboardPath: '/dashboard/officer',
      features: ['Review queue', 'Approval metrics', 'Loan oversight tools']
    },
    {
      id: 'admin',
      title: 'Administrator Console',
      desc: 'Access system analytics, audit logs, portfolio health, and enterprise controls.',
      icon: '⚙️',
      color: '#4f46e5',
      loginPath: '/auth',
      registerPath: '/auth',
      dashboardPath: '/dashboard/admin',
      features: ['Enterprise analytics', 'Audit activity', 'User & risk governance']
    },
  ];

  const dashboardForCurrentUser = !user
    ? '/auth'
    : user.role === 'ADMIN'
      ? '/dashboard/admin'
      : user.role === 'LOAN_OFFICER'
        ? '/dashboard/officer'
        : '/dashboard/user';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--bg-page), var(--clr-slate-50))',
      padding: 'var(--space-6)',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle size="small" />
      </div>

      <div style={{ maxWidth: 1240, width: '100%', margin: '0 auto', paddingTop: 'var(--space-12)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: 'var(--space-8)',
          alignItems: 'center',
          marginBottom: 'var(--space-12)',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              background: 'rgba(37, 99, 235, 0.08)',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 'var(--space-4)',
            }}>
              <span>🛡️</span>
              Role-based access hub
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
            }}>
              Different dashboards and login pages for every role.
            </h1>

            <p style={{
              fontSize: 'var(--font-size-md)',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: 680,
              marginBottom: 'var(--space-6)',
            }}>
              Access borrower, loan officer, and administrator experiences directly from this main landing page. Each portal now uses Google sign-in and routes you to the correct dashboard automatically.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate(dashboardForCurrentUser)}
              >
                {user ? 'Open My Dashboard' : 'Continue to Sign In'}
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/auth')}
              >
                Continue with Google
              </button>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--border-radius-xl)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
            padding: 'var(--space-8)',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
              Quick access from one place
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {roles.map(role => (
                <div key={role.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-secondary)',
                  borderLeft: `4px solid ${role.color}`,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{role.icon} {role.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {role.loginPath} • {role.dashboardPath}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm"
                    style={{ background: role.color, color: 'white' }}
                    onClick={() => navigate(role.loginPath)}
                  >
                    Enter
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-12)',
        }}>
          {roles.map(role => (
            <div
              key={role.id}
              style={{
                padding: 'var(--space-8)',
                borderRadius: 'var(--border-radius-lg)',
                background: 'var(--bg-card)',
                border: `2px solid ${role.color}22`,
                transition: 'all var(--transition-base)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 24px ${role.color}22`;
                e.currentTarget.style.borderColor = role.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = `${role.color}22`;
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: role.color }} />
              <div style={{ fontSize: 40, marginBottom: 'var(--space-4)' }}>{role.icon}</div>

              <h2 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)',
              }}>
                {role.title}
              </h2>

              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: 'var(--space-5)',
              }}>
                {role.desc}
              </p>

              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 'var(--space-6)' }}>
                {role.features.map(feature => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <button
                  className="btn btn-sm"
                  style={{ background: role.color, color: 'white' }}
                  onClick={() => navigate(role.loginPath)}
                >
                  Continue
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(role.registerPath)}
                >
                  Provider sign-in
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(role.loginPath)}
                  style={{ color: role.color }}
                >
                  Dashboard access →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
