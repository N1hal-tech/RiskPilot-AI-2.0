const BADGE = { GREEN: 'badge-green', YELLOW: 'badge-yellow', RED: 'badge-red' };
const STATUS = { APPROVED: 'Approved', UNDER_REVIEW: 'Under Review', REJECTED: 'Rejected' };

export default function LoanHistory({ history, loading }) {
  return (
    <div className="card">
      <div className="card-header">📋 Application History ({loading ? '…' : history.length})</div>

      {loading ? (
        <div className="card-body" style={{ textAlign: 'center', color: '#64748b' }}>Loading…</div>
      ) : history.length === 0 ? (
        <div className="card-body">
          <div className="empty-state">
            <div className="icon">📄</div>
            <p>No applications yet — submit your first loan above!</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Default&nbsp;%</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td>₹{Number(a.loanAmount).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${BADGE[a.riskLevel]}`}>
                      {(a.defaultProbability * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${BADGE[a.riskLevel]}`}>
                      {STATUS[a.status] || a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}