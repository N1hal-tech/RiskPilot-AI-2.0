const ICON   = { GREEN: '', YELLOW: '⚠', RED: '✕' };
const LABEL  = { APPROVED: 'Loan Approved', UNDER_REVIEW: 'Under Review', REJECTED: 'Loan Rejected' };

export default function LoanResult({ result, onClose }) {
  if (!result) return null;

  const color = result.riskLevel.toLowerCase();   // "green" | "yellow" | "red"
  const fmt   = (v) => '₹' + Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="result-card" onClick={(e) => e.stopPropagation()}>

        <div className={`result-icon ${color}`}>{ICON[result.riskLevel]}</div>
        <div className="result-status">{LABEL[result.status] || result.status}</div>
        <div className="result-prob">
          Default Probability: {(result.defaultProbability * 100).toFixed(1)}%
        </div>

        <div className="result-msg">{result.advisoryMessage}</div>

        <div className="result-details">
          <div className="result-detail">
            <label>Income</label><span>{fmt(result.annualIncome)}</span>
          </div>
          <div className="result-detail">
            <label>Loan</label><span>{fmt(result.loanAmount)}</span>
          </div>
          <div className="result-detail">
            <label>Debt</label><span>{fmt(result.existingDebt)}</span>
          </div>
          <div className="result-detail">
            <label>Employed</label><span>{result.employmentYears} yrs</span>
          </div>
        </div>

        <button className="btn btn-primary btn-full" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}