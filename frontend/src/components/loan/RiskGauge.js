export default function RiskGauge({ probability, confidence }) {
  const pct = (probability * 100).toFixed(1);
  const level = probability < 0.3 ? 'green' : probability < 0.6 ? 'yellow' : 'red';
  const status = level === 'green' ? 'Low Risk' : level === 'yellow' ? 'Medium Risk' : 'High Risk';
  const statusColor = level === 'green' ? 'var(--clr-success-600)' : level === 'yellow' ? 'var(--clr-warning-600)' : 'var(--clr-danger-600)';

  return (
    <div className="risk-gauge animate-fadeUp">
      <div className={`risk-gauge-circle ${level}`}>
        <div className="risk-gauge-value">{pct}%</div>
        <div className="risk-gauge-label">Default Risk</div>
      </div>
      <div className="risk-gauge-status" style={{ color: statusColor }}>{status}</div>
      {confidence !== undefined && (
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
          Agent Confidence: <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}