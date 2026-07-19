import React from 'react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import './ReportPage.css';

export function ReportPage() {
  const location = useLocation();
  const reportData = location.state?.reportData;

  if (!reportData) {
    return <Navigate to="/research" />;
  }

  const { pain, analysis, idea, val_result, posts_count } = reportData;
  const isGo = val_result?.verdict === 'GO';

  return (
    <div className="container">
      <div className="report-page">
        <Link to="/research" className="text-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <ArrowLeft size={20} />
          Back to Research
        </Link>

        <header className="report-header">
          <div className={`verdict-chip text-eyebrow ${!isGo ? 'nogo' : ''}`}>
            {isGo ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            Verdict: {val_result?.verdict || 'NO-GO'} (Confidence: {val_result?.confidence || 0}%)
          </div>
          <h1 className="report-title text-display-lg">{idea?.name || 'Unknown Idea'}</h1>
          <p className="report-subtitle text-subhead">{idea?.tagline || 'No tagline generated.'}</p>
        </header>

        <section className="report-section">
          <h2 className="report-section-title text-card-title">Opportunity Summary</h2>
          <p className="text-body">
            {idea?.how_it_works || 'No description provided.'}
          </p>
          {val_result?.unfair_advantage && (
            <p className="text-body" style={{ marginTop: '16px' }}>
              <strong>Unfair Advantage:</strong> {val_result.unfair_advantage}
            </p>
          )}
        </section>

        <section className="report-section">
          <h2 className="report-section-title text-card-title">Problem Evidence</h2>
          <div className="evidence-block">
            <p className="evidence-quote text-body-lg">
              "{pain?.evidence || pain?.description || 'No specific evidence found.'}"
            </p>
            <p className="text-body-sm" style={{ opacity: 0.7 }}>— Aggregated from {posts_count || 0} public signals</p>
          </div>
          <p className="text-body">
            <strong>Pain Point:</strong> {pain?.pain_point || 'Unknown'} (Severity: {pain?.rage_score || 0}/10)
          </p>
          <p className="text-body" style={{ marginTop: '8px' }}>
            <strong>Root Cause:</strong> {analysis?.root_cause || 'Unknown'}
          </p>
          {analysis?.hidden_insight && (
            <p className="text-body" style={{ marginTop: '8px' }}>
              <strong>Hidden Insight:</strong> {analysis.hidden_insight}
            </p>
          )}
        </section>

        <section className="report-section">
          <h2 className="report-section-title text-card-title">Market & Customer</h2>
          <div className="data-row">
            <div className="data-label text-body">Real Customer:</div>
            <div className="data-value text-body">{analysis?.customer || 'Unknown'}</div>
          </div>
          <div className="data-row">
            <div className="data-label text-body">Pricing Model:</div>
            <div className="data-value text-body">{idea?.pricing_model || 'Unknown'}</div>
          </div>
          <div className="data-row">
            <div className="data-label text-body">Will They Pay?</div>
            <div className="data-value text-body">{analysis?.pricing || 'Unknown'}</div>
          </div>
        </section>

        <section className="report-section">
          <h2 className="report-section-title text-card-title">Competition & Failures</h2>
          <p className="text-body" style={{ marginBottom: '16px' }}>
            <strong>What Failed Before:</strong> {analysis?.failures || 'None found.'}
          </p>
          <p className="text-body">
            <strong>Rationale:</strong> {val_result?.rationale || 'None provided.'}
          </p>
        </section>

        <section className="report-section">
          <h2 className="report-section-title text-card-title">Founder Risks</h2>
          <ul className="risk-list text-body">
            {analysis?.founder_risks && analysis.founder_risks.length > 0 ? (
              analysis.founder_risks.map((risk, idx) => (
                <li key={idx}>{risk}</li>
              ))
            ) : (
              <li>{val_result?.biggest_risk || 'No major risks identified.'}</li>
            )}
          </ul>
        </section>

        <div className="action-plan">
          <div className="text-eyebrow" style={{ marginBottom: '24px' }}>Next 30 Days</div>
          {idea?.['30_day_plan'] && Array.isArray(idea['30_day_plan']) ? (
            idea['30_day_plan'].map((step, idx) => {
              // Sometimes the step is just a string, sometimes it's formatted. We'll handle plain strings.
              return (
                <div className="action-step" key={idx}>
                  <div className="action-number">{idx + 1}</div>
                  <div>
                    <p className="text-body">{step}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-body">No specific execution plan provided.</p>
          )}
        </div>

      </div>
    </div>
  );
}
