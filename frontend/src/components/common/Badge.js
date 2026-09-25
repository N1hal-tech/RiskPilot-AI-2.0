const MAP = { GREEN: 'green', YELLOW: 'yellow', RED: 'red' };

export default function Badge({ level, status }) {
  const cls = MAP[level] || 'gray';
  const text = status
    ? status === 'APPROVED' ? 'Approved' : status === 'UNDER_REVIEW' ? 'Under Review' : 'Rejected'
    : level;

  return (
    <span className={`badge badge-dot badge-${cls}`}>{text}</span>
  );
}