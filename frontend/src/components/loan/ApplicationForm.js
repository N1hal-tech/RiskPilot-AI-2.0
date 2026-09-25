import { useState } from 'react';
import api from '../../services/api';
import Alert from '../common/Alert';
import ProcessingModal from './ProcessingModal';

const INITIAL = { annualIncome: '', loanAmount: '', existingDebt: '', employmentYears: '', loanPurpose: '', loanTermMonths: '36' };

export default function ApplicationForm({ onResult }) {
  const [form, setForm]             = useState(INITIAL);
  const [error, setError]           = useState('');
  const [processing, setProcessing] = useState(false);
  const [pendingResult, setPending] = useState(null);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const safeLoanMax = form.annualIncome ? (+form.annualIncome * 0.35) : null;
  const safeDebtMax = form.annualIncome ? (+form.annualIncome * 0.25) : null;
  const currentDti = form.annualIncome ? ((+form.existingDebt / +form.annualIncome) * 100) : null;
  const currentLti = form.annualIncome ? ((+form.loanAmount / +form.annualIncome) * 100) : null;

  const validate = () => {
    if (+form.annualIncome < 1000)                  return 'Annual income must be at least ₹1,000';
    if (+form.loanAmount < 500)                     return 'Loan amount must be at least ₹500';
    if (+form.loanAmount > +form.annualIncome * 10) return 'Loan amount cannot exceed 10× annual income';
    if (+form.existingDebt < 0)                     return 'Existing debt cannot be negative';
    if (+form.employmentYears < 0 || +form.employmentYears > 50) return 'Employment years must be 0–50';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }

    setProcessing(true);

    try {
      const result = await api.submitLoan({
        annualIncome:    +form.annualIncome,
        loanAmount:      +form.loanAmount,
        existingDebt:    +form.existingDebt,
        employmentYears: +form.employmentYears,
        loanPurpose:     form.loanPurpose || null,
        loanTermMonths:  +form.loanTermMonths || 36,
      });
      setPending(result);
    } catch (err) {
      setProcessing(false);
      setError(err.message);
    }
  };

  const handleProcessingComplete = () => {
    setProcessing(false);
    if (pendingResult) {
      onResult(pendingResult);
      setPending(null);
      setForm(INITIAL);
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="card-header-title">
            <span className="material-icons-outlined">add_card</span>
            Loan Application
          </div>
          <span className="badge badge-blue badge-sm">RL-Powered</span>
        </div>
        <div className="card-body">
          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Annual Income <span className="required">*</span></label>
              <div className="form-input-suffix">
                <input type="number" name="annualIncome" className="form-input"
                  value={form.annualIncome} onChange={set} placeholder="75,000" required min="0" step="any" />
                <span className="suffix">₹</span>
              </div>
              <div className="form-input-hint">Your total annual income before taxes</div>
              {safeLoanMax && (
                <div className="form-input-hint" style={{ color: 'var(--success)' }}>
                  Suggested safe loan amount: up to ₹{Math.round(safeLoanMax).toLocaleString()}
                </div>
              )}
              {safeDebtMax && (
                <div className="form-input-hint" style={{ color: 'var(--success)' }}>
                  Suggested healthy debt max: ₹{Math.round(safeDebtMax).toLocaleString()}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Loan Amount <span className="required">*</span></label>
              <div className="form-input-suffix">
                <input type="number" name="loanAmount" className="form-input"
                  value={form.loanAmount} onChange={set} placeholder="25,000" required min="0" step="any" />
                <span className="suffix">₹</span>
              </div>
              <div className="form-input-hint">Amount you wish to borrow</div>
              {currentLti != null && (
                <div className="form-input-hint" style={{ color: currentLti > 40 ? 'var(--danger)' : 'var(--success)' }}>
                  Loan-to-income ratio: {currentLti.toFixed(1)}% (recommended below 40%)
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Existing Debt <span className="required">*</span></label>
                <div className="form-input-suffix">
                  <input type="number" name="existingDebt" className="form-input"
                    value={form.existingDebt} onChange={set} placeholder="10,000" required min="0" step="any" />
                  <span className="suffix">₹</span>
                </div>
                {currentDti != null && (
                  <div className="form-input-hint" style={{ color: currentDti > 30 ? 'var(--danger)' : 'var(--success)' }}>
                    Debt-to-income ratio: {currentDti.toFixed(1)}% (recommended below 30%)
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Employment <span className="required">*</span></label>
                <div className="form-input-suffix">
                  <input type="number" name="employmentYears" className="form-input"
                    value={form.employmentYears} onChange={set} placeholder="5" required min="0" max="50" />
                  <span className="suffix">years</span>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Loan Purpose</label>
                <select name="loanPurpose" className="form-input" value={form.loanPurpose} onChange={set} style={{ appearance: 'auto' }}>
                  <option value="">Select purpose...</option>
                  <option value="HOME">Home Purchase</option>
                  <option value="CAR">Vehicle Purchase</option>
                  <option value="EDUCATION">Education</option>
                  <option value="BUSINESS">Business</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="MEDICAL">Medical</option>
                  <option value="DEBT_CONSOLIDATION">Debt Consolidation</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Loan Term</label>
                <div className="form-input-suffix">
                  <input type="number" name="loanTermMonths" className="form-input"
                    value={form.loanTermMonths} onChange={set} placeholder="36" min="6" max="360" />
                  <span className="suffix">months</span>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-xl" disabled={processing} style={{ marginTop: 8 }}>
              {processing
                ? <><span className="spinner" /> Processing...</>
                : <><span className="material-icons-outlined" style={{ fontSize: 20 }}>bolt</span> Submit Application</>
              }
            </button>
          </form>
        </div>
      </div>

      {processing && (
        <ProcessingModal
          formData={{
            annualIncome:    +form.annualIncome,
            loanAmount:      +form.loanAmount,
            existingDebt:    +form.existingDebt,
            employmentYears: +form.employmentYears,
          }}
          result={pendingResult}
          onComplete={handleProcessingComplete}
          onClose={handleProcessingComplete}
        />
      )}
    </>
  );
}