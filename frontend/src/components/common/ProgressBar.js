export default function ProgressBar({ value, max = 100, color = 'blue', label }) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{pct.toFixed(1)}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div className={`progress-bar-fill ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}