import { useState } from 'react';
import api from '../services/api';

const INITIAL = { annualIncome: '', loanAmount: '', existingDebt: '', employmentYears: '' };

export default function LoanForm({ onResult }) {
  const [form, setForm]   = useState(INITIAL);
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const { annualIncome, loanAmount, existingDebt, employmentYears } = form;
    if (+annualIncome < 1000)               return 'Annual income must be at least $1,000';
    if (+loanAmount   < 500)                return 'Loan amount must be at least $500';
    if (+loanAmount   > +annualIncome * 10) return 'Loan amount cannot exceed 10× annual income';
    if (+existingDebt < 0)                  return 'Existing debt cannot be negative';
    if (+employmentYears < 0 || +employmentYears > 50) return 'Employment years must be 0–50';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const err = validate();
    if (err) { setError(err); return; }

    setBusy(true);
    try {
      const result = await api.submitLoan({
        annualIncome:   +form.annualIncome,
        loanAmount:     +form.loanAmount,
        existingDebt:   +form.existingDebt,
        employmentYears: +form.employmentYears,
      });
      onResult(result);
      setForm(INITIAL);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">📏 New Loan Application</div>
      <div className="card-body">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Annual Income ($)</label>
              <input type="number" name="annualIncome" value={form.annualIncome}
                     onChange={set} placeholder="75 000" required min="0" step="any" />
            </div>
            <div className="form-group">
              <label>Loan Amount ($)</label>
              <input type="number" name="loanAmount" value={form.loanAmount}
                     onChange={set} placeholder="25 000" required min="0" step="any" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Existing Debt ($)</label>
              <input type="number" name="existingDebt" value={form.existingDebt}
                     onChange={set} placeholder="10 000" required min="0" step="any" />
            </div>
            <div className="form-group">
              <label>Employment History (years)</label>
              <input type="number" name="employmentYears" value={form.employmentYears}
                     onChange={set} placeholder="5" required min="0" max="50" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={busy}>
            {busy ? <><span className="spinner" />Analyzing…</> : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}