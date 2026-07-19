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
            Research startup ideas like a venture fund.
          </h1>
          <p className="hero-subhead text-body-lg">
            UpvoteVC is your AI venture research copilot. Discover real problems from public signals, validate your ideas, and generate investor-grade memos in minutes.
          </p>
          <div className="hero-actions">
            <Button variant="primary" onClick={() => navigate('/research')}>
              Research My Idea
            </Button>
            <Button variant="secondary" onClick={() => navigate('/discover')}>
              Discover Ideas
            </Button>
          </div>
        </section>

        <ColorBlock color="lime">
          <div className="text-eyebrow" style={{ marginBottom: '24px' }}>Validate</div>
          <div className="preview-section">
            <div className="preview-content">
              <h2 className="text-display-lg" style={{ marginBottom: '24px' }}>
                Paste an idea. Get the founder memo.
              </h2>
              <p className="text-subhead">
                Stop guessing what the market wants. Our multi-agent pipeline aggregates Reddit complaints, News, and Trends to cross-validate your startup idea against real human frustration.
              </p>
            </div>
            <div className="preview-image">
              <div className="preview-mock">
                <div className="text-eyebrow" style={{ color: 'var(--color-semantic-success)', marginBottom: '12px' }}>
                  Verdict: GO
                </div>
                <h3 className="text-card-title" style={{ marginBottom: '16px' }}>SafeRide Monitor</h3>
                <p className="text-body-sm" style={{ marginBottom: '16px' }}>
                  <strong>Real Customer:</strong> Public school districts with $50–100M budgets prioritizing legal risk reduction.
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CheckCircle2 size={16} color="var(--color-semantic-success)" />
                  <span className="text-body-sm">Aligned with 35 Reddit signals</span>
                </div>
              </div>
            </div>
          </div>
        </ColorBlock>

        <ColorBlock color="lilac">
          <div className="text-eyebrow" style={{ marginBottom: '24px' }}>How it works</div>
          <h2 className="text-display-lg" style={{ marginBottom: '48px', maxWidth: '800px' }}>
            A rigorous multi-agent pipeline working for you.
          </h2>
          <div className="workflow-grid">
            <div className="workflow-card">
              <Search size={24} style={{ marginBottom: '16px' }} />
              <h3 className="text-card-title" style={{ marginBottom: '8px' }}>1. Aggregate</h3>
              <p className="text-body-sm">We mine Reddit, News, and Trends to find real pain points matching your idea.</p>
            </div>
            <div className="workflow-card">
              <Zap size={24} style={{ marginBottom: '16px' }} />
              <h3 className="text-card-title" style={{ marginBottom: '8px' }}>2. Analyze</h3>
              <p className="text-body-sm">Our AI digs into root causes, willingness to pay, and reasons why previous startups failed.</p>
            </div>
            <div className="workflow-card">
              <ArrowRight size={24} style={{ marginBottom: '16px' }} />
              <h3 className="text-card-title" style={{ marginBottom: '8px' }}>3. Pitch</h3>
              <p className="text-body-sm">You receive a beautifully formatted investor-style memo with a Go / No-Go verdict.</p>
            </div>
          </div>
        </ColorBlock>
      </div>
    </>
  );
}
