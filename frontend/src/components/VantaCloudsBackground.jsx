import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import CLOUDS from 'vanta/dist/vanta.clouds.min';
import './VantaCloudsBackground.css';

/**
 * VantaCloudsBackground
 * 
 * Renders a full-viewport animated 3D sky using Vanta CLOUDS + Three.js.
 * The canvas is mounted into a dedicated absolutely-positioned div that
 * fills the hero wrapper. Foreground content sits in a separate z-20 container.
 *
 * Key fixes vs. previous implementation:
 * - Canvas container uses z-index: 0 (not negative) to stay visible in stacking context
 * - Canvas container keeps pointer-events so mouse parallax works
 * - Resize observer calls effect.resize() when container dimensions change
 * - Deferred initialization waits one frame to guarantee non-zero container size
 * - Overlay is very subtle (5% black) — does NOT wash out the clouds
 * - Default palette uses high tonal separation for visible cloud depth
 */
export function VantaCloudsBackground({
  children,
  className = '',
  style = {},
  // High-contrast cinematic dusk palette (clouds clearly visible)
  backgroundColor = 0x7fa9c9,
  skyColor = 0x6cbede,
  cloudColor = 0xb4c7e3,
  cloudShadowColor = 0x1a3956,
  sunColor = 0xf49620,
  sunGlareColor = 0xff6835,
  sunlightColor = 0xf99632,
  // Motion & Sizing
  speed = 1.0,
  mouseControls = true,
  touchControls = true,
  gyroControls = false,
  minHeight = 200,
  minWidth = 200,
  scale = 1,
  scaleMobile = 1,
  // Overlay — very subtle, must not wash out clouds
  showOverlay = true,
  overlayOpacity = 0.05,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const effectRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Memoized init function
  const initEffect = useCallback(() => {
    if (!canvasRef.current || effectRef.current) return;

    const el = canvasRef.current;
    // Vanta requires the target element to have real dimensions
    if (el.offsetWidth === 0 || el.offsetHeight === 0) return;

    window.THREE = THREE;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      const initVanta = CLOUDS.default || CLOUDS;
      if (typeof initVanta === 'function') {
        effectRef.current = initVanta({
          el,
          THREE,
          mouseControls,
          touchControls,
          gyroControls,
          minHeight,
          minWidth,
          scale,
          scaleMobile,
          backgroundColor,
          skyColor,
          cloudColor,
          cloudShadowColor,
          sunColor,
          sunGlareColor,
          sunlightColor,
          speed: prefersReducedMotion ? 0.1 : speed,
        });
        setReady(true);
      }
    } catch (err) {
      console.error('[VantaClouds] Init failed:', err);
    }
  }, [
    backgroundColor, skyColor, cloudColor, cloudShadowColor,
    sunColor, sunGlareColor, sunlightColor, speed,
    mouseControls, touchControls, gyroControls,
    minHeight, minWidth, scale, scaleMobile,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Wait one animation frame so the container has layout dimensions
    const rafId = requestAnimationFrame(() => {
      initEffect();
    });

    // Resize observer — call effect.resize() when container size changes
    let resizeObserver;
    if (canvasRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (effectRef.current && typeof effectRef.current.resize === 'function') {
          effectRef.current.resize();
        }
      });
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      if (effectRef.current && typeof effectRef.current.destroy === 'function') {
        try {
          effectRef.current.destroy();
        } catch (e) {
          console.warn('[VantaClouds] Destroy error:', e);
        }
        effectRef.current = null;
      }
    };
  }, [initEffect]);

  const hexBg = `#${backgroundColor.toString(16).padStart(6, '0')}`;

  return (
    <section
      ref={containerRef}
      className={`vanta-hero-wrapper ${className}`}
      style={{ backgroundColor: hexBg, ...style }}
    >
      {/* z-0: Vanta canvas target — full-bleed, receives pointer events */}
      <div
        ref={canvasRef}
        className={`vanta-canvas-layer ${ready ? 'is-ready' : ''}`}
        aria-hidden="true"
      />

      {/* z-10: Very subtle darkening overlay for text contrast (NOT heavy) */}
      {showOverlay && (
        <div
          className="vanta-contrast-overlay"
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
          aria-hidden="true"
        />
      )}

      {/* z-20: Foreground hero content */}
      {children && (
        <div className="vanta-foreground">
          {children}
        </div>
      )}
    </section>
  );
}

export default VantaCloudsBackground;
