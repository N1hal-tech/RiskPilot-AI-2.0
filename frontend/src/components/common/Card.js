export default function Card({ title, icon, action, children, className = '', noPad = false }) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="card-header">
          <div className="card-header-title">
            {icon && <span className="material-icons-outlined">{icon}</span>}
            {title}
          </div>
          {action}
        </div>
      )}
      <div className={`card-body ${noPad ? 'no-pad' : ''}`}>
        {children}
      </div>
    </div>
  );
}