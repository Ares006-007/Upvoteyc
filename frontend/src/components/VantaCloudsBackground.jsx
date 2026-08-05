import React, { useEffect, useRef, useState } from 'react';
import './VantaCloudsBackground.css';

/**
 * VantaCloudsBackground
 * 
 * Performance-optimized animated 3D hero background for Vercel/Next.js/React deployments.
 * 
 * Performance Optimizations:
 * 1. Code-splitting: Three.js and Vanta are dynamically imported ONLY on the client after mount,
 *    keeping the initial JS bundle ultra-light (<50kB).
 * 2. Mobile & Low-Power Skip: Skips heavy WebGL initialization on mobile screens (<768px) and
 *    'prefers-reduced-motion' users, falling back to a CSS dusk gradient.
 * 3. Aggressive Render Tuning:
 *    - mouseControls: false, touchControls: false, gyroControls: false (zero event overhead)
 *    - scale: 0.8, scaleMobile: 0.55 (reduced GPU fill-rate)
 *    - speed: 0.3 (calm, low-CPU continuous drift)
 * 4. Zero Layout Shift: Instant high-fidelity static CSS gradient backdrop from frame 0.
 * 5. Lifecycle Safety: Strict single instance with cleanup/destroy on unmount.
 */
export function VantaCloudsBackground({
  children,
  className = '',
  style = {},
  // High-contrast cinematic dusk palette
  backgroundColor = 0x7fa9c9,
  skyColor = 0x6cbede,
  cloudColor = 0xb4c7e3,
  cloudShadowColor = 0x1a3956,
  sunColor = 0xf49620,
  sunGlareColor = 0xff6835,
  sunlightColor = 0xf99632,
  // Performance-optimized defaults
  speed = 0.3,
  mouseControls = false,
  touchControls = false,
  gyroControls = false,
  minHeight = 200,
  minWidth = 200,
  scale = 0.8,
  scaleMobile = 0.55,
  disableOnMobile = true,
  // Overlay
  showOverlay = true,
  overlayOpacity = 0.05,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const effectRef = useRef(null);
  const [isVantaActive, setIsVantaActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current) return;

    // Check device capabilities
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileDevice = disableOnMobile && (window.innerWidth < 768 || window.matchMedia('(max-width: 768px)').matches);

    // Skip WebGL entirely on mobile or reduced-motion environments
    if (prefersReducedMotion || isMobileDevice) {
      return;
    }

    let isSubscribed = true;

    // Dynamic import Three.js and Vanta asynchronously to prevent initial bundle bloat
    const loadAndInitVanta = async () => {
      try {
        const [THREE, vantaModule] = await Promise.all([
          import('three'),
          import('vanta/dist/vanta.clouds.min')
        ]);

        if (!isSubscribed || !canvasRef.current || effectRef.current) return;

        window.THREE = THREE;
        const initVanta = vantaModule.default || vantaModule;

        if (typeof initVanta === 'function') {
          effectRef.current = initVanta({
            el: canvasRef.current,
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
            speed,
          });

          if (isSubscribed) {
            setIsVantaActive(true);
          }
        }
      } catch (error) {
        console.warn('[VantaClouds] Dynamic load or WebGL init skipped, using static fallback:', error);
      }
    };

    // Initialize after the browser has completed critical rendering
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => {
        loadAndInitVanta();
      }, { timeout: 1000 });
      return () => {
        isSubscribed = false;
        window.cancelIdleCallback(idleId);
        if (effectRef.current && typeof effectRef.current.destroy === 'function') {
          effectRef.current.destroy();
          effectRef.current = null;
        }
      };
    } else {
      const timerId = setTimeout(loadAndInitVanta, 50);
      return () => {
        isSubscribed = false;
        clearTimeout(timerId);
        if (effectRef.current && typeof effectRef.current.destroy === 'function') {
          effectRef.current.destroy();
          effectRef.current = null;
        }
      };
    }
  }, [
    backgroundColor, skyColor, cloudColor, cloudShadowColor,
    sunColor, sunGlareColor, sunlightColor, speed,
    mouseControls, touchControls, gyroControls,
    minHeight, minWidth, scale, scaleMobile, disableOnMobile,
  ]);

  return (
    <section
      ref={containerRef}
      className={`vanta-hero-wrapper ${className}`}
      style={style}
    >
      {/* Static CSS Dusk Gradient Fallback (Zero CLS, instant paint) */}
      <div className="vanta-static-fallback" aria-hidden="true" />

      {/* Dynamic Vanta WebGL Canvas (Fades in over static fallback when ready) */}
      <div
        ref={canvasRef}
        className={`vanta-canvas-layer ${isVantaActive ? 'is-ready' : ''}`}
        aria-hidden="true"
      />

      {/* Subtle Text Contrast Overlay */}
      {showOverlay && (
        <div
          className="vanta-contrast-overlay"
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
          aria-hidden="true"
        />
      )}

      {/* Hero Foreground Content */}
      {children && (
        <div className="vanta-foreground">
          {children}
        </div>
      )}
    </section>
  );
}

export default VantaCloudsBackground;
