export default function Alert({ type = 'error', children }) {
  const icons = { error: 'error_outline', success: 'check_circle_outline', warning: 'warning_amber', info: 'info_outline' };

  return (
    <div className={`alert alert-${type}`}>
      <span className="material-icons-outlined" style={{ fontSize: 18, flexShrink: 0 }}>
        {icons[type]}
      </span>
      {children}
    </div>
  );
}