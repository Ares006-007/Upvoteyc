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
            <h4 className="pres-label">OpenVc</h4>
            <h1 className="pres-title">Automated Venture Research.</h1>
            <div className="pres-highlight-block block-cream">
              <p className="pres-subtitle">Turning raw public frustration into structured opportunity.</p>
            </div>
          </div>
        </div>

        {/* SLIDE 1: Problem */}
        <div className="pres-slide slide-problem">
          <div className="slide-content text-center">
            <h2 className="pres-heading">The Problem</h2>
            <div className="pres-grid-2">
              <div className="pres-card block-lime">
                <h3>Founders are guessing.</h3>
                <p>Most ideas are built on random opinions rather than structured evidence of real pain points.</p>
              </div>
              <div className="pres-card block-lilac">
                <h3>Research is manual.</h3>
                <p>Market research is slow, fragmented, and expensive. Validating an idea takes weeks of manual scraping.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 2: Solution */}
        <div className="pres-slide slide-solution">
          <div className="slide-content text-center">
            <h2 className="pres-heading">The Solution</h2>
            <div className="pres-highlight-block block-lilac text-center">
              <p className="pres-lead">An AI-powered intelligence layer that discovers, validates, and researches startup ideas natively.</p>
              <div className="pres-feature-list">
                <div className="pres-pill block-cream">Automated Signal Discovery</div>
                <div className="pres-pill block-cream">Idea Validation</div>
                <div className="pres-pill block-cream">Investor-Style Outputs</div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 3: How it Works */}
        <div className="pres-slide slide-architecture">
          <div className="slide-content">
            <h2 className="pres-heading text-center">How It Works</h2>
            <div className="pres-arch-flow">
              <div className="arch-box block-cream">Aggregator</div>
              <div className="arch-arrow">→</div>
              <div className="arch-col">
                <div className="arch-box bordered">Pain Finder</div>
                <div className="arch-box bordered">Market Worker</div>
              </div>
              <div className="arch-arrow">→</div>
              <div className="arch-box block-lime">Supervisor & Validator</div>
              <div className="arch-arrow">→</div>
              <div className="arch-box block-lilac">Pitcher / Report</div>
            </div>
          </div>
        </div>

        {/* SLIDE 4: Product Modes */}
        <div className="pres-slide slide-modes">
          <div className="slide-content">
            <h2 className="pres-heading text-center">Two Ways to Play</h2>
            <div className="pres-split">
              <div className="pres-pane block-lime">
                <h3>Discover Ideas</h3>
                <p>Scrape Reddit, HackerNews, and Twitter for live complaints and automatically generate verified startup ideas.</p>
              </div>
              <div className="pres-pane block-cream">
                <h3>Research My Idea</h3>
                <p>Submit your own idea and get deep market research, competitor analysis, and risk profiles in minutes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 5: Roadmap */}
        <div className="pres-slide slide-roadmap">
          <div className="slide-content">
            <h2 className="pres-heading text-center" style={{ color: 'white' }}>The Evolution</h2>
            <div className="pres-timeline">
              <div className="timeline-item past">
                <div className="tl-phase">Phase 0</div>
                <div className="tl-desc">Slack-based multi-agent ideation.</div>
              </div>
              <div className="timeline-item current block-lime">
                <div className="tl-phase">Phase 1 (Now)</div>
                <div className="tl-desc">Web frontend, stronger research flow, investor outputs.</div>
              </div>
              <div className="timeline-item future">
                <div className="tl-phase">Phase 2</div>
                <div className="tl-desc">Expanded data sources & richer context.</div>
              </div>
              <div className="timeline-item future">
                <div className="tl-phase">Phase 3</div>
                <div className="tl-desc">Macro trend & financial signal analysis.</div>
              </div>
              <div className="timeline-item future">
                <div className="tl-phase">Phase 4+</div>
                <div className="tl-desc">Broader intelligence platform for VCs and Strategy teams.</div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 6: Why It Matters */}
        <div className="pres-slide slide-matters">
          <div className="slide-content text-center">
            <div className="pres-highlight-block block-lime text-center" style={{ padding: '5rem', borderRadius: '40px' }}>
              <h1 className="pres-title">Speed is a feature.</h1>
              <p className="pres-subtitle">OpenVc helps founders move faster, replacing messy manual research with structured, actionable opportunity.</p>
            </div>
          </div>
        </div>

        {/* SLIDE 7: Live Demo Transition */}
        <div className="pres-slide slide-transition">
          <div className="slide-content text-center">
            <h2 className="pres-heading">Enough talk.</h2>
            <br />
            <button className="pres-cta-btn" onClick={exitPresentation}>
              Now let's see it live.
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
