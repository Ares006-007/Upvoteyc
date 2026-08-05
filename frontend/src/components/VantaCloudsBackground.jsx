import React, { useEffect, useRef, useState, useCallback } from 'react';
import './VantaCloudsBackground.css';

/**
 * VantaCloudsBackground
 * 
 * Production-ready, smooth, lag-free animated 3D hero background.
 * Uses Vanta CLOUDS with Three.js with active viewport and tab visibility pausing.
 * 
 * Performance & Production Safety:
 * 1. IntersectionObserver: Pauses and destroys WebGL instance when the hero is offscreen.
 * 2. Document Visibility: Pauses rendering when browser tab is inactive (document.hidden).
 * 3. Dynamic Code-Splitting: Loads Three.js and Vanta asynchronously on demand.
 * 4. Aggressive Render Tuning:
 *    - mouseControls: false, touchControls: false, gyroControls: false
 *    - scale: 0.8, scaleMobile: 0.5 (reduced GPU fill cost)
 *    - speed: 0.28 (ultra-smooth, calm drift)
 * 5. High-Tonal Contrast: Clear 3D cloud separation without flat wash.
 * 6. Zero Layout Shift: Instant CSS static dusk sky fallback.
 */
export function VantaCloudsBackground({
  children,
  className = '',
  style = {},
  // Visual Palette (High-Contrast Dusk)
  skyColor = 0x6cbede,
  cloudColor = 0xb4c7e3,
  cloudShadowColor = 0x1a3956,
  sunColor = 0xf49620,
  sunGlareColor = 0xff6835,
  sunlightColor = 0xf99632,
  // Optimized Motion & Sizing
  speed = 0.28,
  mouseControls = false,
  touchControls = false,
  gyroControls = false,
  minHeight = 200,
  minWidth = 200,
  scale = 0.8,
  scaleMobile = 0.5,
  disableOnMobile = false,
  // Overlay
  showOverlay = true,
  overlayOpacity = 0.05,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const effectRef = useRef(null);
  const isVisibleRef = useRef(true);
  const [isVantaActive, setIsVantaActive] = useState(false);

  // Safely destroy existing Vanta instance to free WebGL memory & GPU cycles
  const destroyVanta = useCallback(() => {
    if (effectRef.current && typeof effectRef.current.destroy === 'function') {
      try {
        effectRef.current.destroy();
      } catch (err) {
        console.warn('[VantaClouds] Clean destruction:', err);
      }
      effectRef.current = null;
      setIsVantaActive(false);
    }
  }, []);

  // Initialize or resume Vanta CLOUDS
  const initVanta = useCallback(async () => {
    if (!canvasRef.current || effectRef.current || !isVisibleRef.current) return;

    if (typeof window === 'undefined') return;

    // Accessibility check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Mobile check if explicitly disabled
    const isMobile = disableOnMobile && (window.innerWidth < 768 || window.matchMedia('(max-width: 768px)').matches);
    if (isMobile) return;

    try {
      const [THREE, vantaModule] = await Promise.all([
        import('three'),
        import('vanta/dist/vanta.clouds.min')
      ]);

      if (!canvasRef.current || effectRef.current || !isVisibleRef.current) return;

      window.THREE = THREE;
      const cloudsFn = vantaModule.default || vantaModule;

      if (typeof cloudsFn === 'function') {
        effectRef.current = cloudsFn({
          el: canvasRef.current,
          THREE,
          mouseControls,
          touchControls,
          gyroControls,
          minHeight,
          minWidth,
          scale,
          scaleMobile,
          skyColor,
          cloudColor,
          cloudShadowColor,
          sunColor,
          sunGlareColor,
          sunlightColor,
          speed,
        });

        setIsVantaActive(true);
      }
    } catch (err) {
      console.warn('[VantaClouds] WebGL init fallback:', err);
    }
  }, [
    skyColor, cloudColor, cloudShadowColor,
    sunColor, sunGlareColor, sunlightColor,
    speed, mouseControls, touchControls, gyroControls,
    minHeight, minWidth, scale, scaleMobile, disableOnMobile
  ]);

  // Viewport intersection & Tab visibility management
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // 1. Tab visibility listener (pause on hidden tab)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisibleRef.current = false;
        destroyVanta();
      } else {
        isVisibleRef.current = true;
        initVanta();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 2. IntersectionObserver (pause when hero is scrolled out of viewport)
    let observer;
    if ('IntersectionObserver' in window && containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !document.hidden) {
            isVisibleRef.current = true;
            initVanta();
          } else {
            isVisibleRef.current = false;
            destroyVanta();
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    } else {
      initVanta();
    }

    // 3. ResizeObserver (recalculate canvas size if container dimensions change)
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
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      destroyVanta();
    };
  }, [initVanta, destroyVanta]);

  return (
    <section
      ref={containerRef}
      className={`vanta-hero-wrapper ${className}`}
      style={style}
    >
      {/* Static Dusk Sky Fallback (0ms instant paint, active during offscreen/tab-sleep) */}
      <div className="vanta-static-fallback" aria-hidden="true" />

      {/* Absolute z-0: Dedicated WebGL Vanta Canvas Layer */}
      <div
        ref={canvasRef}
        className={`vanta-canvas-layer ${isVantaActive ? 'is-ready' : ''}`}
        aria-hidden="true"
      />

      {/* Absolute z-10: Subtle Contrast Overlay (bg-black/5) */}
      {showOverlay && (
        <div
          className="vanta-contrast-overlay"
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
          aria-hidden="true"
        />
      )}

      {/* Relative z-20: Foreground Hero Content */}
      {children && (
        <div className="vanta-foreground">
          {children}
        </div>
      )}
    </section>
  );
}

export default VantaCloudsBackground;
