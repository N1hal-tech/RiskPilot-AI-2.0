const CONFIG = {
  APPROVED:     { cls: 'approved', icon: 'check_circle', title: 'Loan Approved' },
  UNDER_REVIEW: { cls: 'review',   icon: 'hourglass_top', title: 'Escalated to Admin Review' },
  REJECTED:     { cls: 'rejected', icon: 'cancel', title: 'Loan Rejected' },
};

const ACTION_LABELS = {
  APPROVE_STANDARD: 'Approved at Standard Rate',
  APPROVE_MODERATE: 'Approved at Moderate Rate',
  APPROVE_HIGH:     'Approved at High Rate',
  REJECT:           'Application Rejected',
  MANUAL_REVIEW:    'Sent to Manual Review',
};

const interestRateLabel = (rate) => {
  if (rate == null || rate <= 0) return '';
  if (rate <= 11) return `Approved at Standard Rate (${rate.toFixed(1)}%)`;
  if (rate <= 14) return `Approved at Moderate Rate (${rate.toFixed(1)}%)`;
  return `Approved at High Rate (${rate.toFixed(1)}%)`;
};

export default function DecisionCard({ status, message, rlAction, interestRate, confidenceLevel, needsAdminReview, escalationReason }) {
  const c = CONFIG[status] || CONFIG.REJECTED;

  return (
    <div className={`decision-card ${c.cls} animate-fadeUp`}>
      <div className="decision-card-icon">
        <span className="material-icons-outlined">{c.icon}</span>
      </div>
      <h3>
        {needsAdminReview
          ? 'Escalated to Admin Review'
          : (status === 'APPROVED' && interestRate > 0 ? interestRateLabel(interestRate) : ACTION_LABELS[rlAction] || c.title)}
      </h3>

      {confidenceLevel && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 14px', borderRadius: 20, marginBottom: 12,
          background: confidenceLevel === 'HIGH' ? 'var(--success-light)' :
            confidenceLevel === 'MEDIUM' ? 'var(--warning-light)' : 'var(--danger-light)',
          border: `1px solid ${confidenceLevel === 'HIGH' ? 'var(--success)' : confidenceLevel === 'MEDIUM' ? 'var(--warning)' : 'var(--danger)'}`,
          fontSize: 13, fontWeight: 700,
          color: confidenceLevel === 'HIGH' ? 'var(--success)' : confidenceLevel === 'MEDIUM' ? 'var(--warning)' : 'var(--danger)',
        }}>
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>
            {confidenceLevel === 'HIGH' ? 'verified' : confidenceLevel === 'MEDIUM' ? 'help_outline' : 'error_outline'}
          </span>
          Agent Confidence: {confidenceLevel}
        </div>
      )}

      {interestRate > 0 && !needsAdminReview && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 20, marginBottom: 12, marginLeft: 8,
          background: 'rgba(0,0,0,0.05)', fontSize: 14, fontWeight: 700,
          fontFamily: 'var(--font-mono)',
        }}>
          Interest Rate: {interestRate}%
        </div>
      )}

      <p>{message}</p>

      {needsAdminReview && (
        <div style={{
          marginTop: 16, padding: 16, borderRadius: 10,
          background: 'var(--warning-light)', border: '1px solid var(--warning)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="material-icons-outlined" style={{ fontSize: 20, color: 'var(--warning)' }}>
              admin_panel_settings
            </span>
            <strong style={{ fontSize: 14, color: 'var(--warning)' }}>
              Admin Review Required
            </strong>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            The RL agent's confidence is not high enough to make an automatic decision
            for your profile. A loan officer will review the application and agent suggestion.
          </p>
          {rlAction && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              <strong>Agent's suggestion:</strong> {ACTION_LABELS[rlAction] || rlAction}
              {interestRate > 0 && ` at ${interestRate}%`}
            </p>
          )}
          {escalationReason && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}><em>{escalationReason}</em></p>
          )}
        </div>
      )}
    </div>
  );
}