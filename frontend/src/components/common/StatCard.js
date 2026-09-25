export default function StatCard({ icon, label, value, color = 'blue', trend }) {
  return (
    <div className={`stat-card ${color} animate-fadeUp`}>
      <div className="stat-card-top">
        <div className="stat-card-icon">
          <span className="material-icons-outlined">{icon}</span>
        </div>
        {trend && (
          <span className={`stat-card-trend ${trend > 0 ? 'up' : 'down'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}