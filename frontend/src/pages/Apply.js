import { useState } from 'react';
import ApplicationForm from '../components/loan/ApplicationForm';
import RiskGauge from '../components/loan/RiskGauge';
import DecisionCard from '../components/loan/DecisionCard';
import Modal from '../components/common/Modal';
import ProgressBar from '../components/common/ProgressBar';

const Q_LABELS = ['REJECT', 'APPROVE 8%', 'APPROVE 12%', 'APPROVE 16%', 'REVIEW'];

export default function Apply() {
  const [result, setResult] = useState(null);

  const fmt = (v) => '₹' + Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <span>RiskPilot AI</span> <span className="sep">/</span> <span>Apply</span>
        </div>
        <h1>New Loan Application</h1>
        <p>Submit your financial details — our RL agent will decide the optimal lending action</p>
      </div>

      <div className="apply-grid">
        <ApplicationForm onResult={setResult} />

        <div>
          <div className="apply-sidebar-card animate-fadeUp">
            <h3>🤖 How the RL Agent Works</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.6 }}>
              Our Reinforcement Learning agent has been trained through 100,000+
              simulated loan scenarios. It learned the optimal lending strategy
              by receiving rewards for successful repayments and penalties for
              defaults.
            </p>

            <div className="risk-legend-item">
              <div className="risk-legend-dot green" />
              <div>
                <h4>Approve at Standard Rate (8%)</h4>
                <p>Low-risk profile. Agent learned these borrowers reliably repay.</p>
              </div>
            </div>
            <div className="risk-legend-item">
              <div className="risk-legend-dot yellow" />
              <div>
                <h4>Approve at Higher Rate (12–16%)</h4>
                <p>Moderate risk. Agent prices the risk into the interest rate.</p>
              </div>
            </div>
            <div className="risk-legend-item">
              <div className="risk-legend-dot red" />
              <div>
                <h4>Reject Application</h4>
                <p>Agent learned that lending to this profile leads to net losses.</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-header">
              <div className="card-header-title">
                <span className="material-icons-outlined">school</span>
                RL Agent Learning Loop
              </div>
            </div>
            <div className="card-body">
              <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, counterReset: 'step' }}>
                {[
                  { icon: 'visibility', text: 'Agent observes your financial state' },
                  { icon: 'psychology', text: 'Chooses action based on learned Q-values' },
                  { icon: 'schedule', text: 'Waits for repayment or default outcome' },
                  { icon: 'update', text: 'Updates its policy based on the reward' },
                  { icon: 'trending_up', text: 'Gets better at lending decisions over time' },
                ].map((step, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <span className="material-icons-outlined" style={{ fontSize: 20, color: 'var(--clr-primary-500)', marginTop: 1 }}>{step.icon}</span>
                    <span><strong>Step {i + 1}:</strong> {step.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="result-modal">
          <Modal
            title="RL Agent Decision"
            onClose={() => setResult(null)}
            footer={<button className="btn btn-primary" onClick={() => setResult(null)}>Close</button>}
          >
            <RiskGauge probability={result.defaultProbability} />

            <DecisionCard
              status={result.status}
              message={result.advisoryMessage}
              rlAction={result.rlAction}
              interestRate={result.offeredInterestRate}
              confidenceLevel={result.confidenceLevel}
              needsAdminReview={result.needsAdminReview}
              escalationReason={result.escalationReason}
            />

            <div style={{ marginTop: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>
                APPLICATION DETAILS
              </h4>
              <div className="result-details-grid">
                <div className="result-detail-item">
                  <label>Annual Income</label>
                  <span>{fmt(result.annualIncome)}</span>
                </div>
                <div className="result-detail-item">
                  <label>Loan Amount</label>
                  <span>{fmt(result.loanAmount)}</span>
                </div>
                <div className="result-detail-item">
                  <label>Existing Debt</label>
                  <span>{fmt(result.existingDebt)}</span>
                </div>
                <div className="result-detail-item">
                  <label>Employment</label>
                  <span>{result.employmentYears} years</span>
                </div>
              </div>
            </div>

            {/* Q-Values Visualization */}
            {result.qValues && result.qValues.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>
                  RL AGENT Q-VALUES (Learned Action Scores)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.qValues.map((q, i) => {
                    const maxQ = Math.max(...result.qValues.map(Math.abs), 1);
                    const isChosen = Q_LABELS[i]?.includes(
                      result.rlAction?.replace('APPROVE_STANDARD', 'APPROVE 8%')
                        .replace('APPROVE_MODERATE', 'APPROVE 12%')
                        .replace('APPROVE_HIGH', 'APPROVE 16%')
                        .replace('MANUAL_REVIEW', 'REVIEW')
                    );
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{
                            fontSize: 12, fontWeight: isChosen ? 700 : 500,
                            color: isChosen ? 'var(--clr-primary-600)' : 'var(--text-muted)',
                          }}>
                            {isChosen && '★ '}{Q_LABELS[i] || `Action ${i}`}
                          </span>
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: q >= 0 ? 'var(--clr-success-600)' : 'var(--clr-danger-600)',
                          }}>
                            {q >= 0 ? '+' : ''}{q.toFixed(2)}
                          </span>
                        </div>
                        <div className="progress-bar" style={{ height: 6 }}>
                          <div
                            className={`progress-bar-fill ${q >= 0 ? 'green' : 'red'}`}
                            style={{ width: `${(Math.abs(q) / maxQ) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  ★ = chosen action. Higher Q-value = agent expects better long-term reward.
                </p>
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>
                RISK METRICS
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ProgressBar
                  value={(result.defaultRisk ?? result.defaultProbability ?? 0) * 100}
                  color={result.riskLevel === 'GREEN' ? 'green' : result.riskLevel === 'YELLOW' ? 'yellow' : 'red'}
                  label="Default Probability"
                />
                <ProgressBar
                  value={result.dti ?? ((result.existingDebt / result.annualIncome) * 100)}
                  color="blue"
                  label="Debt-to-Income Ratio"
                />
                <ProgressBar
                  value={result.lti ?? ((result.loanAmount / result.annualIncome) * 100)}
                  color="blue"
                  label="Loan-to-Income Ratio"
                />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)' }}>
                "What this means" summary
              </h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{result.decisionExplanation}</p>
              {result.improvementSuggestions && result.improvementSuggestions.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <h5 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Top improvement suggestions</h5>
                  <ul style={{ paddingLeft: 18, color: 'var(--text-muted)', fontSize: 13 }}>
                    {result.improvementSuggestions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Modal>
        </div>
      )}
    </>
  );
}