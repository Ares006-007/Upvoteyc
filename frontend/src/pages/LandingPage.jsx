import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ColorBlock } from '../components/ColorBlock';
import { MarqueeStrip } from '../components/Layout';
import { VantaCloudsBackground } from '../components/VantaCloudsBackground';
import { ArrowRight, Search, Zap, CheckCircle2, Sparkles, Sliders, Sun } from 'lucide-react';
import './LandingPage.css';

// High-contrast palettes — cloud/shadow separation is the key to visibility
const CLOUD_THEMES = {
  dusk: {
    name: 'Cinematic Dusk',
    backgroundColor: 0x7fa9c9,
    skyColor: 0x6cbede,
    cloudColor: 0xb4c7e3,
    cloudShadowColor: 0x1a3956,
    sunColor: 0xf49620,
    sunGlareColor: 0xff6835,
    sunlightColor: 0xf99632,
    speed: 1.0,
  },
  vivid: {
    name: 'Vivid Sky',
    backgroundColor: 0x4a90c4,
    skyColor: 0x4faee0,
    cloudColor: 0xd9e6f2,
    cloudShadowColor: 0x10243a,
    sunColor: 0xffa033,
    sunGlareColor: 0xffc27a,
    sunlightColor: 0xffb347,
    speed: 1.2,
  },
  goldenHour: {
    name: 'Golden Sunset',
    backgroundColor: 0x2c3e50,
    skyColor: 0x4a6984,
    cloudColor: 0xf8b195,
    cloudShadowColor: 0x0f1e2e,
    sunColor: 0xff6f59,
    sunGlareColor: 0xffcc80,
    sunlightColor: 0xffaa5e,
    speed: 0.8,
  },
  twilight: {
    name: 'Deep Twilight',
    backgroundColor: 0x1b263b,
    skyColor: 0x415a77,
    cloudColor: 0x8ea4bf,
    cloudShadowColor: 0x050d18,
    sunColor: 0xe0a96d,
    sunGlareColor: 0xf5d6ba,
    sunlightColor: 0xcca47c,
    speed: 0.6,
  },
};

export function LandingPage() {
  const navigate = useNavigate();
  const [currentThemeKey, setCurrentThemeKey] = useState('dusk');
  const [showTuner, setShowTuner] = useState(false);
  const activeTheme = CLOUD_THEMES[currentThemeKey];

  return (
    <>
      <MarqueeStrip text="" />

      {/* Hero with Vanta CLOUDS 3D animated background */}
      <VantaCloudsBackground
        className="hero-vanta-container"
        backgroundColor={activeTheme.backgroundColor}
        skyColor={activeTheme.skyColor}
        cloudColor={activeTheme.cloudColor}
        cloudShadowColor={activeTheme.cloudShadowColor}
        sunColor={activeTheme.sunColor}
        sunGlareColor={activeTheme.sunGlareColor}
        sunlightColor={activeTheme.sunlightColor}
        speed={activeTheme.speed}
        mouseControls={true}
        touchControls={true}
        gyroControls={false}
        minHeight={200}
        minWidth={200}
        scale={1}
        scaleMobile={1}
        showOverlay={true}
        overlayOpacity={0.05}
      >
        <section className="hero-section">
          {/* Glassmorphic badge */}
          <div className="hero-pill-badge">
            <Sparkles size={14} className="hero-badge-icon" />
            <span>Multi-Agent Venture Intelligence</span>
          </div>

          <h1 className="hero-headline text-display-xl hero-light-text">
            AI-Powered Venture Intelligence for Early-Stage Sourcing &amp; Diligence.
          </h1>
          <p className="hero-subhead text-body-lg hero-subhead-light">
            OpenVC scans web signals, developer activity, and market momentum to help
            venture capital teams discover breakout startups, map emerging sectors, and
            build rigorous investment memos in minutes.
          </p>
          <div className="hero-actions">
            <Button variant="primary" onClick={() => navigate('/research')}>
              Run Sector Diligence
            </Button>
            <Button variant="secondary" onClick={() => navigate('/discover')}>
              Source Market Signals
            </Button>
            <button
              className="vanta-theme-toggle-btn"
              onClick={() => setShowTuner(!showTuner)}
              title="Customize Sky Palette"
            >
              <Sliders size={16} />
              <span>Sky Palette</span>
            </button>
          </div>

          {/* Theme selector */}
          {showTuner && (
            <div className="vanta-tuner-panel">
              <div className="vanta-tuner-header">
                <Sun size={16} />
                <span>Atmospheric Presets</span>
              </div>
              <div className="vanta-theme-options">
                {Object.entries(CLOUD_THEMES).map(([key, theme]) => (
                  <button
                    key={key}
                    className={`vanta-theme-chip ${currentThemeKey === key ? 'active' : ''}`}
                    onClick={() => setCurrentThemeKey(key)}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </VantaCloudsBackground>

      <div className="container">
        <ColorBlock color="lime">
          <div className="text-eyebrow" style={{ marginBottom: '24px' }}>Diligence & Sourcing</div>
          <div className="preview-section">
            <div className="preview-content">
              <h2 className="text-display-lg" style={{ marginBottom: '24px' }}>
                Extract clear investment thesis from noisy web signals.
              </h2>
              <p className="text-subhead">
                Eliminate manual market mapping. Our multi-agent intelligence engine
                aggregates signals across public discussions, news sentiment, and digital
                momentum to evaluate startup viability and market pull.
              </p>
            </div>
            <div className="preview-image">
              <div className="preview-mock">
                <div className="text-eyebrow" style={{ color: 'var(--color-semantic-success)', marginBottom: '12px' }}>
                  Verdict: High Conviction (GO)
                </div>
                <h3 className="text-card-title" style={{ marginBottom: '16px' }}>SafeRide Fleet Intelligence</h3>
                <p className="text-body-sm" style={{ marginBottom: '16px' }}>
                  <strong>Target Market:</strong> Public school transit operations ($50–100M TAM)
                  with increasing regulatory compliance pressures.
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

export default LandingPage;
