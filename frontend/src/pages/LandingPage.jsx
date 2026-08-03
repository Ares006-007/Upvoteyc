import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ColorBlock } from '../components/ColorBlock';
import { MarqueeStrip } from '../components/Layout';
import { ArrowRight, Search, Zap, CheckCircle2 } from 'lucide-react';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <MarqueeStrip text="" />

      <div className="container">
        <section className="hero-section">
          <h1 className="hero-headline text-display-xl">
            AI-Powered Venture Intelligence for Early-Stage Sourcing & Diligence.
          </h1>
          <p className="hero-subhead text-body-lg">
            OpenVC scans web signals, developer activity, and market momentum to help venture capital teams discover breakout startups, map emerging sectors, and build rigorous investment memos in minutes.
          </p>
          <div className="hero-actions">
            <Button variant="primary" onClick={() => navigate('/research')}>
              Run Sector Diligence
            </Button>
            <Button variant="secondary" onClick={() => navigate('/discover')}>
              Source Market Signals
            </Button>
          </div>
        </section>

        <ColorBlock color="lime">
          <div className="text-eyebrow" style={{ marginBottom: '24px' }}>Diligence & Sourcing</div>
          <div className="preview-section">
            <div className="preview-content">
              <h2 className="text-display-lg" style={{ marginBottom: '24px' }}>
                Extract clear investment thesis from noisy web signals.
              </h2>
              <p className="text-subhead">
                Eliminate manual market mapping. Our multi-agent intelligence engine aggregates signals across public discussions, news sentiment, and digital momentum to evaluate startup viability and market pull.
              </p>
            </div>
            <div className="preview-image">
              <div className="preview-mock">
                <div className="text-eyebrow" style={{ color: 'var(--color-semantic-success)', marginBottom: '12px' }}>
                  Verdict: High Conviction (GO)
                </div>
                <h3 className="text-card-title" style={{ marginBottom: '16px' }}>SafeRide Fleet Intelligence</h3>
                <p className="text-body-sm" style={{ marginBottom: '16px' }}>
                  <strong>Target Market:</strong> Public school transit operations ($50–100M TAM) with increasing regulatory compliance pressures.
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CheckCircle2 size={16} color="var(--color-semantic-success)" />
                  <span className="text-body-sm">Validated by 35 Public Market Signals</span>
                </div>
              </div>
            </div>
          </div>
        </ColorBlock>

        <ColorBlock color="lilac">
          <div className="text-eyebrow" style={{ marginBottom: '24px' }}>Intelligence Pipeline</div>
          <h2 className="text-display-lg" style={{ marginBottom: '48px', maxWidth: '800px' }}>
            Autonomous multi-agent research built for investment teams.
          </h2>
          <div className="workflow-grid">
            <div className="workflow-card">
              <Search size={24} style={{ marginBottom: '16px' }} />
              <h3 className="text-card-title" style={{ marginBottom: '8px' }}>1. Signal Sourcing</h3>
              <p className="text-body-sm">Continuously tracks developer discussions, product complaints, and public digital exhaust to detect emerging inflection points.</p>
            </div>
            <div className="workflow-card">
              <Zap size={24} style={{ marginBottom: '16px' }} />
              <h3 className="text-card-title" style={{ marginBottom: '8px' }}>2. Deep Diligence</h3>
              <p className="text-body-sm">Evaluates competitive moats, pricing power, customer acquisition channels, and past category failures.</p>
            </div>
            <div className="workflow-card">
              <ArrowRight size={24} style={{ marginBottom: '16px' }} />
              <h3 className="text-card-title" style={{ marginBottom: '8px' }}>3. Investment Memo</h3>
              <p className="text-body-sm">Synthesizes structured diligence memos with risk vectors, market sizing indicators, and conviction scores.</p>
            </div>
          </div>
        </ColorBlock>
      </div>
    </>
  );
}
