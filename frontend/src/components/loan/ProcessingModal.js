import { useState, useEffect, useRef, useCallback } from 'react';

/* ── Step Definitions ────────────────────────────────────────── */

const STEPS = [
  {
    id: 1,
    title: 'Validating Financial Data',
    icon: 'fact_check',
    color: '#3b82f6',
    duration: 1200,
    getDetail: (f) => [
      `Income: ₹${Number(f.annualIncome).toLocaleString()} ✓`,
      `Loan: ₹${Number(f.loanAmount).toLocaleString()} ✓`,
      `Debt: ₹${Number(f.existingDebt).toLocaleString()} ✓`,
      `Employment: ${f.employmentYears} years ✓`,
    ],
  },
  {
    id: 2,
    title: 'Computing Risk Features',
    icon: 'calculate',
    color: '#8b5cf6',
    duration: 1800,
    getDetail: (f) => [
      `DTI: ${(f.existingDebt / f.annualIncome).toFixed(4)}`,
      `LTI: ${(f.loanAmount / f.annualIncome).toFixed(4)}`,
      `Total Obligation: ${((+f.existingDebt + +f.loanAmount) / f.annualIncome).toFixed(4)}`,
      `Stability: ${Math.min(f.employmentYears / 10, 1).toFixed(2)}`,
    ],
  },
  {
    id: 3,
    title: 'RL Agent Analyzing State',
    icon: 'psychology',
    color: '#06b6d4',
    duration: 2000,
    getDetail: (f) => {
      const i = f.annualIncome;
      const d = f.existingDebt / i;
      const l = f.loanAmount / i;
      const e = f.employmentYears;
      const ib = i < 30000 ? 0 : i < 50000 ? 1 : i < 80000 ? 2 : i < 120000 ? 3 : 4;
      const db = d < 0.1 ? 0 : d < 0.25 ? 1 : d < 0.4 ? 2 : d < 0.6 ? 3 : 4;
      const lb = l < 0.15 ? 0 : l < 0.3 ? 1 : l < 0.5 ? 2 : l < 0.8 ? 3 : 4;
      const eb = e < 2 ? 0 : e < 5 ? 1 : e < 10 ? 2 : e < 15 ? 3 : 4;
      return [
        `Income → Bucket ${ib}`,
        `DTI → Bucket ${db}`,
        `LTI → Bucket ${lb}`,
        `Employment → Bucket ${eb}`,
        `State: (${ib}, ${db}, ${lb}, ${eb})`,
      ];
    },
  },
  {
    id: 4,
    title: 'Querying Q-Table',
    icon: 'table_chart',
    color: '#f59e0b',
    duration: 2200,
    getDetail: () => [
      'Loading trained policy...',
      'Searching 625 possible states...',
      'Retrieving Q-values for 5 actions...',
    ],
  },
  {
    id: 5,
    title: 'Evaluating Actions',
    icon: 'compare_arrows',
    color: '#10b981',
    duration: 2500,
    getDetail: () => [
      '→ REJECT: computing penalty...',
      '→ APPROVE 8%: computing profit...',
      '→ APPROVE 12%: risk-adjusted...',
      '→ APPROVE 16%: high premium...',
      '→ REVIEW: deferral value...',
      'Selecting max Q-value action',
    ],
  },
  {
    id: 6,
    title: 'Confidence Check',
    icon: 'verified',
    color: '#6366f1',
    duration: 1800,
    getDetail: (f) => {
      const dti = f.existingDebt / f.annualIncome;
      const lti = f.loanAmount / f.annualIncome;
      const risky = dti > 0.4 || lti > 0.5;
      const safe = dti < 0.15 && lti < 0.2;
      if (safe) return ['Q-value spread: LARGE', 'Confidence: HIGH (>75%)', '✓ Auto-decision enabled'];
      if (risky) return ['Q-value spread: SMALL', 'Confidence: LOW (<50%)', '⚠️ Escalating to admin'];
      return ['Q-value spread: MODERATE', 'Confidence: MEDIUM', '⚠️ Suggesting admin review'];
    },
  },
  {
    id: 7,
    title: 'Computing Default Probability',
    icon: 'trending_up',
    color: '#ef4444',
    duration: 1500,
    getDetail: (f) => {
      const dti = f.existingDebt / f.annualIncome;
      const lti = f.loanAmount / f.annualIncome;
      const z = -2.0 + 3.0 * dti + 2.5 * lti - 0.08 * f.employmentYears;
      const p = (1 / (1 + Math.exp(-z)) * 100).toFixed(1);
      return [`z = ${z.toFixed(4)}`, `Sigmoid → P(default) = ${p}%`];
    },
  },
  {
    id: 8,
    title: 'Finalizing Decision',
    icon: 'save',
    color: '#22c55e',
    duration: 1200,
    getDetail: () => ['Generating reference...', 'Saving to database...', 'Creating notification...', 'Done ✓'],
  },
];

const TOTAL_DURATION = STEPS.reduce((s, step) => s + step.duration, 0);

/* ── Pie Chart SVG Component ─────────────────────────────────── */

function AnimatedPieChart({ steps, currentStep, completedSteps, overallProgress, allDone, result }) {
  const size = 280;
  const center = size / 2;
  const radius = 110;
  const innerRadius = 75;

  // Build pie segments
  const segmentAngle = 360 / steps.length;

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--pie-track)" strokeWidth="32" />

        {/* Pie segments */}
        {steps.map((step, idx) => {
          const startAngle = idx * segmentAngle;
          const endAngle = startAngle + segmentAngle - 2;
          const isComplete = completedSteps.includes(idx);
          const isCurrent = idx === currentStep && !allDone;

          let opacity = 0.15;
          let strokeWidth = 30;
          if (isComplete) { opacity = 1; strokeWidth = 32; }
          else if (isCurrent) { opacity = 0.7; strokeWidth = 34; }

          return (
            <path
              key={step.id}
              d={describeArc(center, center, radius, startAngle, endAngle)}
              fill="none"
              stroke={step.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={opacity}
              style={{ transition: 'opacity 0.5s ease, stroke-width 0.3s ease' }}
            />
          );
        })}

        {/* Inner background */}
        <circle cx={center} cy={center} r={innerRadius} fill="var(--pie-bg)" />

        {/* Rotating scanner line (during processing) */}
        {!allDone && (
          <line
            x1={center} y1={center}
            x2={center} y2={center - radius - 5}
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="2"
            style={{
              transformOrigin: `${center}px ${center}px`,
              animation: 'scannerRotate 3s linear infinite',
            }}
          />
        )}
      </svg>

      {/* Center Content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {allDone && result ? (
          /* ── RESULT DISPLAY ── */
          <div style={{ textAlign: 'center', animation: 'scaleIn 0.5s ease both' }}>
            <div style={{
              fontSize: 36, fontWeight: 900, fontFamily: 'var(--font-mono)',
              letterSpacing: '-0.03em',
              color: result.defaultProbability < 0.3 ? 'var(--clr-success-600)' :
                result.defaultProbability < 0.6 ? 'var(--clr-warning-600)' : 'var(--clr-danger-600)',
            }}>
              {((result.defaultProbability || 0) * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Default Risk
            </div>
          </div>
        ) : allDone ? (
          <div style={{ textAlign: 'center', animation: 'scaleIn 0.4s ease both' }}>
            <span className="material-icons-outlined" style={{ fontSize: 40, color: 'var(--clr-success-500)' }}>check_circle</span>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-success-600)', marginTop: 4 }}>Complete</div>
          </div>
        ) : (
          /* ── PROGRESS DISPLAY ── */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)', letterSpacing: '-0.03em',
            }}>
              {Math.round(overallProgress)}%
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Analyzing
            </div>
          </div>
        )}
      </div>

      {/* Step Icons around the pie */}
      {steps.map((step, idx) => {
        const angle = ((idx * segmentAngle + segmentAngle / 2) - 90) * Math.PI / 180;
        const iconRadius = radius + 28;
        const x = center + iconRadius * Math.cos(angle);
        const y = center + iconRadius * Math.sin(angle);
        const isComplete = completedSteps.includes(idx);
        const isCurrent = idx === currentStep && !allDone;

        return (
          <div key={step.id} style={{
            position: 'absolute',
            left: x - 14, top: y - 14,
            width: 28, height: 28, borderRadius: '50%',
            background: isComplete ? step.color : isCurrent ? 'white' : 'var(--clr-slate-100)',
            border: `2px solid ${isComplete ? step.color : isCurrent ? step.color : 'var(--clr-slate-300)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.4s ease',
            boxShadow: isCurrent ? `0 0 0 4px ${step.color}33` : 'none',
          }}>
            {isComplete ? (
              <span style={{ fontSize: 14, color: 'white' }}>&#10003;</span>
            ) : (
              <span className="material-icons-outlined" style={{
                fontSize: 14,
                color: isCurrent ? step.color : 'var(--clr-slate-400)',
              }}>{step.icon}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Result Pie Chart (after completion) ─────────────────────── */

function ResultPieChart({ result }) {
  const size = 280;
  const center = size / 2;
  const radius = 110;

  if (!result) return null;

  const prob = (result.defaultProbability || 0);
  const repayProb = 1 - prob;

  const segments = [
    { label: 'Repayment', value: repayProb, color: '#22c55e' },
    { label: 'Default Risk', value: prob, color: '#ef4444' },
  ];

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  let currentAngle = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={75} fill="var(--pie-bg)" />

        {segments.map((seg, idx) => {
          const segAngle = seg.value * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + segAngle;
          currentAngle = endAngle;

          if (segAngle < 1) return null;

          const start = polarToCartesian(center, center, radius, endAngle);
          const end = polarToCartesian(center, center, radius, startAngle);
          const largeArc = segAngle > 180 ? 1 : 0;

          return (
            <path
              key={idx}
              d={`M ${center} ${center} L ${end.x} ${end.y} A ${radius} ${radius} 0 ${largeArc} 1 ${start.x} ${start.y} Z`}
              fill={seg.color}
              opacity={0.85}
              style={{
                animation: `pieSliceIn 0.8s ease both`,
                animationDelay: `${idx * 0.2}s`,
              }}
            />
          );
        })}

        <circle cx={center} cy={center} r={75} fill="var(--pie-bg)" />
      </svg>

      {/* Center Result */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        animation: 'scaleIn 0.6s ease both',
        animationDelay: '0.3s',
      }}>
        <div style={{
          fontSize: 36, fontWeight: 900, fontFamily: 'var(--font-mono)',
          color: prob < 0.3 ? 'var(--clr-success-600)' :
            prob < 0.6 ? 'var(--clr-warning-600)' : 'var(--clr-danger-600)',
          letterSpacing: '-0.03em',
        }}>
          {(prob * 100).toFixed(1)}%
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Default Risk
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 20, animation: 'fadeUp 0.5s ease both', animationDelay: '0.5s',
      }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              {seg.label}: {(seg.value * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Processing Modal ───────────────────────────────────── */

export default function ProcessingModal({ formData, onComplete, onClose, result: apiResult }) {
  const [currentStep, setCurrentStep]   = useState(0);
  const [completedSteps, setCompleted]  = useState([]);
  const [visibleDetails, setDetails]    = useState({});
  const [overallProgress, setProgress]  = useState(0);
  const [allDone, setAllDone]           = useState(false);
  const [showResult, setShowResult]     = useState(false);
  const timeoutsRef = useRef([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  const addTimeout = useCallback((fn, delay) => {
    const t = setTimeout(fn, delay);
    timeoutsRef.current.push(t);
    return t;
  }, []);

  useEffect(() => {
    let elapsed = 0;

    // Schedule all steps
    STEPS.forEach((step, idx) => {
      const stepStart = elapsed;
      const details = step.getDetail(formData);
      const detailInterval = step.duration / (details.length + 1);

      // Start step
      addTimeout(() => {
        setCurrentStep(idx);
      }, stepStart);

      // Reveal details one by one
      details.forEach((detail, di) => {
        addTimeout(() => {
          setDetails(prev => ({
            ...prev,
            [idx]: [...(prev[idx] || []), detail],
          }));
        }, stepStart + detailInterval * (di + 1));
      });

      // Complete step
      addTimeout(() => {
        setCompleted(prev => [...prev, idx]);
      }, stepStart + step.duration);

      elapsed += step.duration;
    });

    // All done
    addTimeout(() => {
      setAllDone(true);
    }, elapsed);

    // Show result after brief pause
    addTimeout(() => {
      setShowResult(true);
    }, elapsed + 800);

    // Overall progress timer
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(progressInterval); return 100; }
        return prev + (100 / (TOTAL_DURATION / 50));
      });
    }, 50);

    return () => {
      clearAllTimeouts();
      clearInterval(progressInterval);
    };
  }, [formData, addTimeout, clearAllTimeouts]);

  const isCompleted = (idx) => completedSteps.includes(idx);
  const isCurrent   = (idx) => idx === currentStep && !allDone;

  return (
    <div className="modal-overlay animate-fadeIn" style={{ zIndex: 3000 }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--border-radius-xl)',
        maxWidth: 780, width: '100%', maxHeight: '92vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-2xl)', animation: 'scaleIn 0.35s ease both',
        margin: 16,
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px', borderBottom: '1px solid var(--border-default)',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800 }}>
            {showResult && apiResult ? '📊 Analysis Complete' : '🔄 Processing Your Application'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {showResult && apiResult
              ? 'Here is your risk breakdown and decision'
              : 'Our RL agent is analyzing your financial profile...'}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

            {/* Left: Pie Chart */}
            <div style={{ flexShrink: 0, width: 320, paddingTop: 8 }}>
              {showResult && apiResult ? (
                <ResultPieChart result={apiResult} />
              ) : (
                <AnimatedPieChart
                  steps={STEPS}
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  overallProgress={Math.min(overallProgress, 100)}
                  allDone={allDone}
                  result={apiResult}
                />
              )}

              {/* Status Below Pie */}
              {showResult && apiResult && (
                <div style={{
                  textAlign: 'center', marginTop: 72,
                  animation: 'fadeUp 0.5s ease both', animationDelay: '0.6s',
                }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 20px', borderRadius: 30,
                    background: apiResult.status === 'APPROVED' ? 'var(--clr-success-50)' :
                      apiResult.status === 'REJECTED' ? 'var(--clr-danger-50)' : 'var(--clr-warning-50)',
                    border: `2px solid ${apiResult.status === 'APPROVED' ? 'var(--clr-success-300)' :
                      apiResult.status === 'REJECTED' ? 'var(--clr-danger-300)' : 'var(--clr-warning-300)'}`,
                  }}>
                    <span className="material-icons-outlined" style={{
                      fontSize: 22,
                      color: apiResult.status === 'APPROVED' ? 'var(--clr-success-600)' :
                        apiResult.status === 'REJECTED' ? 'var(--clr-danger-600)' : 'var(--clr-warning-600)',
                    }}>
                      {apiResult.status === 'APPROVED' ? 'check_circle' :
                        apiResult.status === 'REJECTED' ? 'cancel' : 'hourglass_top'}
                    </span>
                    <span style={{
                      fontSize: 16, fontWeight: 800,
                      color: apiResult.status === 'APPROVED' ? 'var(--clr-success-700)' :
                        apiResult.status === 'REJECTED' ? 'var(--clr-danger-700)' : 'var(--clr-warning-700)',
                    }}>
                      {apiResult.status === 'APPROVED' ? 'APPROVED' :
                        apiResult.status === 'REJECTED' ? 'REJECTED' : 'UNDER REVIEW'}
                    </span>
                  </div>

                  {apiResult.offeredInterestRate > 0 && apiResult.status === 'APPROVED' && (
                    <div style={{
                      marginTop: 12, fontSize: 14, fontWeight: 700,
                      fontFamily: 'var(--font-mono)', color: 'var(--text-primary)',
                    }}>
                      Interest Rate: {apiResult.offeredInterestRate}%
                    </div>
                  )}

                  {apiResult.confidenceLevel && (
                    <div style={{
                      marginTop: 8, fontSize: 12, fontWeight: 600,
                      color: apiResult.confidenceLevel === 'HIGH' ? 'var(--clr-success-600)' :
                        apiResult.confidenceLevel === 'MEDIUM' ? 'var(--clr-warning-600)' : 'var(--clr-danger-600)',
                    }}>
                      Agent Confidence: {apiResult.confidenceLevel}
                      {apiResult.needsAdminReview && ' — Escalated to Admin'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Steps List */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {showResult && apiResult ? (
                <div style={{ animation: 'fadeUp 0.5s ease both' }}>
                  <div style={{
                    padding: 16, borderRadius: 10, marginBottom: 16,
                    background: apiResult.status === 'APPROVED' ? 'var(--clr-success-50)' :
                      apiResult.status === 'REJECTED' ? 'var(--clr-danger-50)' : 'var(--clr-warning-50)',
                    border: `1px solid ${apiResult.status === 'APPROVED' ? 'var(--clr-success-200)' :
                      apiResult.status === 'REJECTED' ? 'var(--clr-danger-200)' : 'var(--clr-warning-200)'}`,
                  }}>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                      {apiResult.advisoryMessage}
                    </p>
                  </div>

                  <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Application Summary
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {[
                      { label: 'Income', value: `₹${Number(apiResult.annualIncome).toLocaleString()}` },
                      { label: 'Loan', value: `₹${Number(apiResult.loanAmount).toLocaleString()}` },
                      { label: 'Debt', value: `₹${Number(apiResult.existingDebt).toLocaleString()}` },
                      { label: 'Employment', value: `${apiResult.employmentYears} yrs` },
                    ].map((item, i) => (
                      <div key={i} style={{
                        padding: '10px 12px', background: 'var(--clr-slate-50)',
                        borderRadius: 8, textAlign: 'center',
                        animation: 'fadeUp 0.3s ease both', animationDelay: `${0.6 + i * 0.1}s`,
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Risk Breakdown
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {[
                      { label: 'Default Probability', value: (apiResult.defaultProbability || 0) * 100, color: apiResult.defaultProbability < 0.3 ? '#22c55e' : apiResult.defaultProbability < 0.6 ? '#f59e0b' : '#ef4444' },
                      { label: 'Debt-to-Income', value: (apiResult.existingDebt / apiResult.annualIncome) * 100, color: '#3b82f6' },
                      { label: 'Loan-to-Income', value: (apiResult.loanAmount / apiResult.annualIncome) * 100, color: '#8b5cf6' },
                    ].map((bar, i) => (
                      <div key={i} style={{ animation: 'fadeUp 0.3s ease both', animationDelay: `${0.8 + i * 0.1}s` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{bar.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{bar.value.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--clr-slate-100)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 3, background: bar.color,
                            width: `${Math.min(bar.value, 100)}%`,
                            transition: 'width 1s ease', animationDelay: `${0.8 + i * 0.1}s`,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {apiResult.qValues && apiResult.qValues.length > 0 && (
                    <>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        RL Q-Values
                      </h4>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 16, animation: 'fadeUp 0.3s ease both', animationDelay: '1.1s' }}>
                        {['REJ', '8%', '12%', '16%', 'REV'].map((label, i) => {
                          const q = apiResult.qValues[i] || 0;
                          const maxQ = Math.max(...apiResult.qValues.map(Math.abs), 1);
                          const isMax = q === Math.max(...apiResult.qValues);
                          return (
                            <div key={i} style={{
                              flex: 1, textAlign: 'center', padding: '6px 4px',
                              background: isMax ? (q >= 0 ? 'var(--clr-success-50)' : 'var(--clr-danger-50)') : 'var(--clr-slate-50)',
                              borderRadius: 6,
                              border: isMax ? `2px solid ${q >= 0 ? 'var(--clr-success-300)' : 'var(--clr-danger-300)'}` : '1px solid var(--border-default)',
                            }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</div>
                              <div style={{
                                fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
                                color: q >= 0 ? 'var(--clr-success-600)' : 'var(--clr-danger-600)',
                              }}>
                                {q >= 0 ? '+' : ''}{q.toFixed(1)}
                              </div>
                              {isMax && <div style={{ fontSize: 9, color: 'var(--clr-primary-500)', fontWeight: 700 }}>★ BEST</div>}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {apiResult.needsAdminReview && (
                    <div style={{
                      padding: 14, borderRadius: 10, marginBottom: 16,
                      background: 'var(--clr-warning-50)', border: '1px solid var(--clr-warning-200)',
                      animation: 'fadeUp 0.3s ease both', animationDelay: '1.2s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span className="material-icons-outlined" style={{ fontSize: 18, color: 'var(--clr-warning-600)' }}>admin_panel_settings</span>
                        <strong style={{ fontSize: 13, color: 'var(--clr-warning-700)' }}>Escalated to Admin Review</strong>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        The RL agent is not confident enough. A loan officer will review and you'll be notified.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {STEPS.map((step, idx) => {
                    const done = isCompleted(idx);
                    const active = isCurrent(idx);
                    const pending = idx > currentStep;

                    return (
                      <div key={step.id} style={{
                        opacity: pending ? 0.3 : 1,
                        transition: 'opacity 0.3s ease',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                            background: done ? step.color : active ? `${step.color}20` : 'var(--clr-slate-100)',
                            border: `2px solid ${done ? step.color : active ? step.color : 'var(--clr-slate-300)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.3s ease',
                          }}>
                            {done ? (
                              <span style={{ fontSize: 12, color: 'white', fontWeight: 700 }}>✓</span>
                            ) : active ? (
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: step.color, animation: 'pulse 1s ease infinite' }} />
                            ) : null}
                          </div>

                          <span style={{
                            fontSize: 13, fontWeight: done ? 600 : active ? 700 : 500,
                            color: done ? 'var(--text-primary)' : active ? step.color : 'var(--text-muted)',
                            flex: 1,
                          }}>
                            {step.title}
                          </span>

                          {done && (
                            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              {(step.duration / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>

                        {(visibleDetails[idx] || []).length > 0 && (
                          <div style={{
                            marginLeft: 34, marginTop: 4, padding: '6px 10px',
                            borderLeft: `2px solid ${step.color}40`,
                            fontSize: 11, fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted)', lineHeight: 1.7,
                          }}>
                            {(visibleDetails[idx] || []).map((d, i) => (
                              <div key={i} style={{ animation: 'fadeUp 0.2s ease both' }}>
                                <span style={{ color: step.color, marginRight: 4 }}>›</span>{d}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {showResult && apiResult && (
          <div style={{
            padding: '16px 32px', borderTop: '1px solid var(--border-default)',
            display: 'flex', justifyContent: 'center', gap: 12,
            background: 'var(--clr-slate-50)',
            animation: 'fadeUp 0.4s ease both', animationDelay: '1.3s',
          }}>
            <button className="btn btn-primary btn-lg" onClick={onComplete} style={{ minWidth: 220 }}>
              <span className="material-icons-outlined" style={{ fontSize: 20 }}>done_all</span>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
