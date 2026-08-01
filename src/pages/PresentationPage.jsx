import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import './PresentationPage.css';

export function PresentationPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 8; // 0 to 7

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, navigate]);

  const exitPresentation = () => navigate('/research');

  return (
    <div className="presentation-container">
      {/* Slide Navigation Context */}
      <div className="presentation-controls">
        <button className="pres-btn" onClick={() => navigate('/')}>Exit</button>
        <div className="pres-progress">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              className={`pres-dot ${i === currentSlide ? 'active' : ''} ${i < currentSlide ? 'done' : ''}`}
              onClick={() => setCurrentSlide(i)}
            />
          ))}
        </div>
      </div>

      <div className="presentation-slider" style={{ transform: `translateX(-${currentSlide * 100}vw)` }}>

        {/* SLIDE 0: Intro */}
        <div className="pres-slide slide-intro">
          <div className="slide-content text-center">
            <h4 className="pres-label">OpenVC</h4>
            <h1 className="pres-title">Autonomous Venture Intelligence.</h1>
            <div className="pres-highlight-block block-cream">
              <p className="pres-subtitle">Transforming noisy public signals into high-conviction investment memos.</p>
            </div>
          </div>
        </div>

        {/* SLIDE 1: Problem */}
        <div className="pres-slide slide-problem">
          <div className="slide-content text-center">
            <h2 className="pres-heading">The Sourcing & Diligence Bottleneck</h2>
            <div className="pres-grid-2">
              <div className="pres-card block-lime">
                <h3>Sourcing is reactive.</h3>
                <p>Investment teams rely on inbound pitch decks and lagging announcements rather than real-time demand signals.</p>
              </div>
              <div className="pres-card block-lilac">
                <h3>Market mapping is manual.</h3>
                <p>Associates spend 20+ hours per sector pulling fragmented data across forums, news, and competitor registries.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 2: Solution */}
        <div className="pres-slide slide-solution">
          <div className="slide-content text-center">
            <h2 className="pres-heading">The Solution</h2>
            <div className="pres-highlight-block block-lilac text-center">
              <p className="pres-lead">An autonomous intelligence engine built specifically for venture capital partners, associates, and analysts.</p>
              <div className="pres-feature-list">
                <div className="pres-pill block-cream">Continuous Signal Mining</div>
                <div className="pres-pill block-cream">Competitive Moat Analysis</div>
                <div className="pres-pill block-cream">Investment Committee Memos</div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 3: How it Works */}
        <div className="pres-slide slide-architecture">
          <div className="slide-content">
            <h2 className="pres-heading text-center">Multi-Agent Intelligence Architecture</h2>
            <div className="pres-arch-flow">
              <div className="arch-box block-cream">Signal Aggregator</div>
              <div className="arch-arrow">→</div>
              <div className="arch-col">
                <div className="arch-box bordered">Demand Intensity</div>
                <div className="arch-box bordered">Competitive Moats</div>
              </div>
              <div className="arch-arrow">→</div>
              <div className="arch-box block-lime">Supervisor & Validator</div>
              <div className="arch-arrow">→</div>
              <div className="arch-box block-lilac">Investment Memo</div>
            </div>
          </div>
        </div>

        {/* SLIDE 4: Product Modes */}
        <div className="pres-slide slide-modes">
          <div className="slide-content">
            <h2 className="pres-heading text-center">Dual Operating Modes for Investment Teams</h2>
            <div className="pres-split">
              <div className="pres-pane block-lime">
                <h3>Market Signal Discovery</h3>
                <p>Scan open web signals, developer ecosystems, and emerging demand across sectors to map white spaces top-down.</p>
              </div>
              <div className="pres-pane block-cream">
                <h3>Company & Thesis Diligence</h3>
                <p>Input any company, sector thesis, or seed-stage pitch to generate a rigorous, evidence-backed diligence memorandum.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 5: Roadmap */}
        <div className="pres-slide slide-roadmap">
          <div className="slide-content">
            <h2 className="pres-heading text-center" style={{ color: 'white' }}>Platform Roadmap</h2>
            <div className="pres-timeline">
              <div className="timeline-item past">
                <div className="tl-phase">Phase 0</div>
                <div className="tl-desc">Multi-agent research prototype.</div>
              </div>
              <div className="timeline-item current block-lime">
                <div className="tl-phase">Phase 1 (Active)</div>
                <div className="tl-desc">Web signal scraping, multi-worker diligence, institutional memos.</div>
              </div>
              <div className="timeline-item future">
                <div className="tl-phase">Phase 2</div>
                <div className="tl-desc">CRM/pipeline integration & custom fund watchlists.</div>
              </div>
              <div className="timeline-item future">
                <div className="tl-phase">Phase 3</div>
                <div className="tl-desc">Talent graph & code velocity telemetry.</div>
              </div>
              <div className="timeline-item future">
                <div className="tl-phase">Phase 4+</div>
                <div className="tl-desc">Autonomous sourcing engine & portfolio market radar.</div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 6: Why It Matters */}
        <div className="pres-slide slide-matters">
          <div className="slide-content text-center">
            <div className="pres-highlight-block block-lime text-center" style={{ padding: '5rem', borderRadius: '40px' }}>
              <h1 className="pres-title">Analyst leverage & earlier conviction.</h1>
              <p className="pres-subtitle">OpenVC compresses weeks of market research into minutes, giving investment teams proprietary depth and earlier entry.</p>
            </div>
          </div>
        </div>

        {/* SLIDE 7: Live Demo Transition */}
        <div className="pres-slide slide-transition">
          <div className="slide-content text-center">
            <h2 className="pres-heading">Explore the Platform</h2>
            <br />
            <button className="pres-cta-btn" onClick={exitPresentation}>
              Launch Diligence Console
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
