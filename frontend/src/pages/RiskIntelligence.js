import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './RiskIntelligence.css';

const TABS = ['Simulator', 'History', 'AI Assistant'];

function RiskBadge({ level }) {
  const colors = { GREEN: '#10b981', YELLOW: '#f59e0b', RED: '#ef4444' };
  return (
    <span className="ri-badge" style={{ background: colors[level] || '#6b7280' }}>
      {level || 'N/A'}
    </span>
  );
}

function HistoryCard({ item }) {
  const fp = item.financialProfile || {};
  const rr = item.riskResult || {};
  const dti = fp.annualIncome > 0 ? ((fp.existingDebt / fp.annualIncome) * 100).toFixed(1) : 'N/A';
  const lti = fp.annualIncome > 0 ? ((fp.loanAmount   / fp.annualIncome) * 100).toFixed(1) : 'N/A';

  return (
    <div className={`ri-history-card ${item.type === 'SIMULATION' ? 'sim' : 'actual'}`}>
      <div className="ri-history-header">
        <span className="ri-type-tag">{item.type === 'SIMULATION' ? '🔬 Simulation' : '📋 Assessment'}</span>
        {item.loanRef && <span className="ri-ref">Ref: {item.loanRef}</span>}
        <span className="ri-date">{new Date(item.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
      </div>

      <div className="ri-history-body">
        <div className="ri-section">
          <h4>Financial Profile</h4>
          <div className="ri-grid">
            <div><label>Annual Income</label><span>₹{Number(fp.annualIncome || 0).toLocaleString('en-IN')}</span></div>
            <div><label>Loan Amount</label><span>₹{Number(fp.loanAmount || 0).toLocaleString('en-IN')}</span></div>
            <div><label>Existing Debt</label><span>₹{Number(fp.existingDebt || 0).toLocaleString('en-IN')}</span></div>
            <div><label>Employment</label><span>{fp.employmentYears || 0} yrs</span></div>
            <div><label>DTI</label><span>{dti}%</span></div>
            <div><label>LTI</label><span>{lti}%</span></div>
          </div>
        </div>
        <div className="ri-section">
          <h4>Risk Result</h4>
          <div className="ri-grid">
            <div><label>Risk Level</label><RiskBadge level={rr.riskLevel} /></div>
            <div><label>Default Prob.</label><span>{rr.defaultProbability != null ? (rr.defaultProbability * 100).toFixed(1) + '%' : 'N/A'}</span></div>
            <div><label>Confidence</label><span>{rr.confidenceLevel || 'N/A'}</span></div>
            <div><label>Interest Rate</label><span>{rr.offeredInterestRate != null ? rr.offeredInterestRate.toFixed(1) + '%' : 'N/A'}</span></div>
            <div><label>RL Decision</label><span className="ri-action">{rr.rlAction || 'N/A'}</span></div>
          </div>
          {rr.advisoryMessage && <p className="ri-advisory">💡 {rr.advisoryMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default function RiskIntelligence() {
  const [activeTab, setActiveTab] = useState(0);

  // ── Simulator ──
  const [sim, setSim] = useState({ annualIncome: '', loanAmount: '', existingDebt: '', employmentYears: '', loanTermMonths: 36, loanPurpose: 'PERSONAL' });
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');

  // ── History ──
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histError, setHistError] = useState('');
  const [histFilter, setHistFilter] = useState('ALL');

  // ── AI Assistant ──
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '👋 Hi! I\'m your RiskPilot AI financial advisor. Ask me anything about your loan risk, DTI, interest rates, or how to improve your financial profile.' }
  ]);
  const [question, setQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (activeTab === 1) loadHistory();
  }, [activeTab]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  async function loadHistory() {
    setHistLoading(true); setHistError('');
    try { setHistory(await api.getRiskHistory()); }
    catch (e) { setHistError(e.message); }
    finally { setHistLoading(false); }
  }

  async function runSim(e) {
    e.preventDefault(); setSimLoading(true); setSimError(''); setSimResult(null);
    try {
      const result = await api.simulate({
        annualIncome:    parseFloat(sim.annualIncome),
        loanAmount:      parseFloat(sim.loanAmount),
        existingDebt:    parseFloat(sim.existingDebt),
        employmentYears: parseInt(sim.employmentYears),
        loanTermMonths:  parseInt(sim.loanTermMonths),
        loanPurpose:     sim.loanPurpose,
      });
      setSimResult(result);
    } catch (e) { setSimError(e.message); }
    finally { setSimLoading(false); }
  }

  async function sendQuestion(e) {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question.trim();
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setQuestion(''); setAiLoading(true);
    try {
      const res = await api.askAI(q);
      setMessages(prev => [...prev, { role: 'assistant', text: res.answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ ' + e.message }]);
    } finally { setAiLoading(false); }
  }

  const filteredHistory = histFilter === 'ALL' ? history : history.filter(h => h.type === histFilter);

  return (
    <div className="ri-page">
      <div className="ri-header">
        <h1>Risk Intelligence</h1>
        <p>Simulate scenarios, review your assessment history, and get personalized AI guidance.</p>
      </div>

      <div className="ri-tabs">
        {TABS.map((t, i) => (
          <button key={t} className={`ri-tab${activeTab === i ? ' active' : ''}`} onClick={() => setActiveTab(i)}>{t}</button>
        ))}
      </div>

      {/* ── SIMULATOR TAB ── */}
      {activeTab === 0 && (
        <div className="ri-tab-content">
          <div className="ri-sim-layout">
            <form className="ri-sim-form ri-card" onSubmit={runSim}>
              <h2>What-If Simulator</h2>
              <p className="ri-sub">Test hypothetical scenarios without submitting a real loan application.</p>

              <div className="ri-field">
                <label>Annual Income (₹)</label>
                <input type="number" placeholder="e.g. 800000" required value={sim.annualIncome} onChange={e => setSim({...sim, annualIncome: e.target.value})} />
              </div>
              <div className="ri-field">
                <label>Loan Amount Requested (₹)</label>
                <input type="number" placeholder="e.g. 200000" required value={sim.loanAmount} onChange={e => setSim({...sim, loanAmount: e.target.value})} />
              </div>
              <div className="ri-field">
                <label>Existing Debt (₹)</label>
                <input type="number" placeholder="e.g. 50000" required min="0" value={sim.existingDebt} onChange={e => setSim({...sim, existingDebt: e.target.value})} />
              </div>
              <div className="ri-field">
                <label>Employment Years</label>
                <input type="number" placeholder="e.g. 3" required min="0" value={sim.employmentYears} onChange={e => setSim({...sim, employmentYears: e.target.value})} />
              </div>
              <div className="ri-field-row">
                <div className="ri-field">
                  <label>Loan Term (Months)</label>
                  <select value={sim.loanTermMonths} onChange={e => setSim({...sim, loanTermMonths: e.target.value})}>
                    {[12, 24, 36, 48, 60, 84].map(m => <option key={m} value={m}>{m} months</option>)}
                  </select>
                </div>
                <div className="ri-field">
                  <label>Loan Purpose</label>
                  <select value={sim.loanPurpose} onChange={e => setSim({...sim, loanPurpose: e.target.value})}>
                    {['PERSONAL','HOME','VEHICLE','EDUCATION','BUSINESS','MEDICAL'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {simError && <div className="ri-error">{simError}</div>}
              <button type="submit" className="ri-btn-primary" disabled={simLoading}>
                {simLoading ? '⏳ Simulating...' : '🚀 Run Simulation'}
              </button>
            </form>

            {simResult && (
              <div className="ri-sim-result ri-card">
                <h2>Simulation Result</h2>
                <div className="ri-result-hero">
                  <div className="ri-result-risk">
                    <RiskBadge level={simResult.riskLevel} />
                    <span className="ri-result-prob">{(simResult.defaultProbability * 100).toFixed(1)}% default risk</span>
                  </div>
                  <div className="ri-result-rate">
                    <span className="ri-rate-big">{simResult.offeredInterestRate?.toFixed(1)}%</span>
                    <span className="ri-rate-label">Interest Rate</span>
                  </div>
                </div>

                <div className="ri-result-grid">
                  <div><label>RL Decision</label><span className="ri-action">{simResult.rlAction}</span></div>
                  <div><label>Confidence</label><span>{simResult.confidenceLevel}</span></div>
                  <div><label>DTI</label><span>{simResult.dti?.toFixed(1)}%</span></div>
                  <div><label>LTI</label><span>{simResult.lti?.toFixed(1)}%</span></div>
                </div>

                {simResult.advisoryMessage && (
                  <div className="ri-advisory">💡 {simResult.advisoryMessage}</div>
                )}

                {simResult.needsAdminReview && (
                  <div className="ri-warning">⚠️ This profile would require manual admin review before a decision is made.</div>
                )}
              </div>
            )}

            {!simResult && !simLoading && (
              <div className="ri-sim-placeholder ri-card">
                <div className="ri-placeholder-icon">🔬</div>
                <h3>Run a Simulation</h3>
                <p>Fill in the form and click "Run Simulation" to see how the AI model evaluates your financial scenario instantly — without creating a real application.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 1 && (
        <div className="ri-tab-content">
          <div className="ri-hist-toolbar">
            <div className="ri-filter-tabs">
              {['ALL','ACTUAL','SIMULATION'].map(f => (
                <button key={f} className={`ri-filter-tab${histFilter === f ? ' active' : ''}`} onClick={() => setHistFilter(f)}>
                  {f === 'ALL' ? 'All' : f === 'ACTUAL' ? '📋 Assessments' : '🔬 Simulations'}
                </button>
              ))}
            </div>
            <button className="ri-btn-sm" onClick={loadHistory} disabled={histLoading}>🔄 Refresh</button>
          </div>

          {histLoading && <div className="ri-loading">Loading history...</div>}
          {histError  && <div className="ri-error">{histError}</div>}
          {!histLoading && !histError && filteredHistory.length === 0 && (
            <div className="ri-empty">
              <div className="ri-placeholder-icon">📂</div>
              <h3>No {histFilter === 'ALL' ? '' : histFilter.toLowerCase()} records yet</h3>
              <p>{histFilter === 'SIMULATION' ? 'Run a simulation from the Simulator tab.' : 'Submit a loan application to create your first assessment.'}</p>
            </div>
          )}
          <div className="ri-history-list">
            {filteredHistory.map(item => <HistoryCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {/* ── AI ASSISTANT TAB ── */}
      {activeTab === 2 && (
        <div className="ri-tab-content ri-chat-layout">
          <div className="ri-chat-card ri-card">
            <div className="ri-chat-header">
              <div className="ri-chat-avatar">🤖</div>
              <div>
                <h3>AI Financial Advisor</h3>
                <p>Powered by Gemini · Grounded in your financial profile</p>
              </div>
            </div>

            <div className="ri-chat-messages" ref={chatRef}>
              {messages.map((m, i) => (
                <div key={i} className={`ri-msg ${m.role}`}>
                  <div className="ri-msg-bubble">{m.text}</div>
                </div>
              ))}
              {aiLoading && (
                <div className="ri-msg assistant">
                  <div className="ri-msg-bubble ri-typing"><span/><span/><span/></div>
                </div>
              )}
            </div>

            <form className="ri-chat-input" onSubmit={sendQuestion}>
              <input
                type="text"
                placeholder="Ask about your risk, DTI, interest rate, or how to improve..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                disabled={aiLoading}
              />
              <button type="submit" disabled={aiLoading || !question.trim()}>
                {aiLoading ? '⏳' : '➤'}
              </button>
            </form>

            <div className="ri-suggestions">
              {['How can I lower my risk?', 'What is DTI?', 'When will I get approved?', 'How to reduce interest rate?'].map(q => (
                <button key={q} className="ri-suggestion" onClick={() => setQuestion(q)}>{q}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
