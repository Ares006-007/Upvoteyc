import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import vantaCloudsModule from 'vanta/dist/vanta.clouds.min';
import './VantaCloudsBackground.css';

/**
 * Robust helper to resolve the Vanta CLOUDS function across ESM / CJS / UMD bundlers
 */
function resolveCloudsFunction() {
  if (typeof vantaCloudsModule === 'function') {
    return vantaCloudsModule;
  }
  if (vantaCloudsModule && typeof vantaCloudsModule.default === 'function') {
    return vantaCloudsModule.default;
  }
  if (typeof window !== 'undefined' && window.VANTA && typeof window.VANTA.CLOUDS === 'function') {
    return window.VANTA.CLOUDS;
  }
  return null;
}

/**
 * VantaCloudsBackground
 * 
 * Production-ready, silky-smooth animated 3D hero background.
 * Uses Vanta CLOUDS with Three.js.
 */
export function VantaCloudsBackground({
  children,
  className = '',
  style = {},
  // Visual Palette (Cinematic High-Contrast Dusk)
  backgroundColor = 0x7fa9c9,
  skyColor = 0x6cbede,
  cloudColor = 0xb4c7e3,
  cloudShadowColor = 0x1a3956,
  sunColor = 0xf49620,
  sunGlareColor = 0xff6835,
  sunlightColor = 0xf99632,
  // Optimized Performance Settings
  speed = 0.28,
  mouseControls = false,
  touchControls = false,
  gyroControls = false,
  minHeight = 200,
  minWidth = 200,
  scale = 0.8,
  scaleMobile = 0.5,
  disableOnMobile = false,
  showOverlay = true,
  overlayOpacity = 0.05,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const effectRef = useRef(null);
  const [isVantaActive, setIsVantaActive] = useState(false);

  // Destroy Vanta instance cleanly
  const destroyEffect = useCallback(() => {
    if (effectRef.current && typeof effectRef.current.destroy === 'function') {
      try {
        effectRef.current.destroy();
      } catch (e) {
        // clean catch
      }
      effectRef.current = null;
      setIsVantaActive(false);
    }
  }, []);

  // Initialize Vanta CLOUDS
  const initEffect = useCallback(() => {
    if (!canvasRef.current || effectRef.current) return;
    if (typeof window === 'undefined') return;

    // Accessibility check
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Optional mobile skip
    if (disableOnMobile && (window.innerWidth < 768 || window.matchMedia('(max-width: 768px)').matches)) {
      return;
    }

    try {
      window.THREE = THREE;
      const cloudsFn = resolveCloudsFunction();

      if (typeof cloudsFn === 'function') {
        effectRef.current = cloudsFn({
          el: canvasRef.current,
          THREE: THREE,
          mouseControls: mouseControls,
          touchControls: touchControls,
          gyroControls: gyroControls,
          minHeight: minHeight,
          minWidth: minWidth,
          scale: scale,
          scaleMobile: scaleMobile,
          backgroundColor: backgroundColor,
          skyColor: skyColor,
          cloudColor: cloudColor,
          cloudShadowColor: cloudShadowColor,
          sunColor: sunColor,
          sunGlareColor: sunGlareColor,
          sunlightColor: sunlightColor,
          speed: speed,
        });

        setIsVantaActive(true);
      } else {
        console.warn('[VantaClouds] Cloud initialization function could not be resolved from module');
      }
    } catch (err) {
      console.warn('[VantaClouds] WebGL fallback active:', err);
    }
  }, [
    backgroundColor, skyColor, cloudColor, cloudShadowColor,
    sunColor, sunGlareColor, sunlightColor, speed,
    mouseControls, touchControls, gyroControls,
    minHeight, minWidth, scale, scaleMobile, disableOnMobile
  ]);

  useEffect(() => {
    // Schedule init after 1 frame so container dimensions are non-zero
    const rafId = requestAnimationFrame(() => {
      initEffect();
    });

    // IntersectionObserver: Pause when hero is scrolled out of viewport
    let observer;
    if (typeof IntersectionObserver !== 'undefined' && containerRef.current) {
      observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          initEffect();
        } else {
          destroyEffect();
        }
      }, { threshold: 0.05 });
      observer.observe(containerRef.current);
    }

    // Visibility listener: Pause when tab is inactive
    const handleVisibility = () => {
      if (document.hidden) {
        destroyEffect();
      } else {
        initEffect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // ResizeObserver: Adapt canvas on container resize
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && canvasRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (effectRef.current && typeof effectRef.current.resize === 'function') {
          effectRef.current.resize();
        }
      });
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (observer) observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      destroyEffect();
    };
  }, [initEffect, destroyEffect]);

  return (
    <section
      ref={containerRef}
      className={`vanta-hero-wrapper ${className}`}
      style={style}
    >
      {/* Static Fallback Dusk Sky (Active before WebGL or if reduced-motion) */}
      <div className="vanta-static-fallback" aria-hidden="true" />

      {/* Absolute z-0: Dedicated WebGL Canvas Container */}
      <div
        ref={canvasRef}
        className="vanta-canvas-layer"
        aria-hidden="true"
      />

      {/* Absolute z-10: Subtle Contrast Layer (5% tint) */}
      {showOverlay && (
        <div
          className="vanta-contrast-overlay"
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
          aria-hidden="true"
        />
      )}

      {/* Relative z-20: Hero Content */}
      {children && (
        <div className="vanta-foreground">
          {children}
        </div>
      )}
    </section>
  );
}

export default VantaCloudsBackground;
