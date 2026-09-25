import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoanForm    from './LoanForm';
import LoanHistory from './LoanHistory';
import LoanResult  from './LoanResult';

export default function Dashboard() {
  const { user } = useAuth();
  const [result, setResult]           = useState(null);
  const [history, setHistory]         = useState([]);
  const [historyLoading, setLoading]  = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setHistory(await api.getLoanHistory());
    } catch (err) {
      console.error('History fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleResult = (r) => {
    setResult(r);
    fetchHistory();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user.fullName}</h1>
        <p>Submit a new loan application or review your history</p>
      </div>

      <div className="dashboard-grid">
        <LoanForm onResult={handleResult} />
        <LoanHistory history={history} loading={historyLoading} />
      </div>

      {result && <LoanResult result={result} onClose={() => setResult(null)} />}
    </div>
  );
}