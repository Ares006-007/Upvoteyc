import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import CLOUDS from 'vanta/dist/vanta.clouds.min';
import './VantaCloudsBackground.css';

/**
 * VantaCloudsBackground
 * Production-ready animated 3D dusk sky hero background using Vanta CLOUDS with Three.js.
 * 
 * Features:
 * - Client-only initialization with Three.js explicit binding
 * - Configurable colors (sky, clouds, shadows, sun, glare, sunlight)
 * - Mouse & touch parallax interaction (gyro disabled)
 * - Safe lifecycle management with .destroy() on unmount (zero memory leaks)
 * - Respects 'prefers-reduced-motion'
 * - Graceful fallback base color without layout shift
 * - Optional customizable gradient contrast wash overlay
 */
export function VantaCloudsBackground({
  children,
  className = '',
  style = {},
  // Vanta Color Palette (Cinematic Dusk Defaults)
  backgroundColor = 0x7fa9c9,
  skyColor = 0x87b5d6,
  cloudColor = 0xc7d2de,
  cloudShadowColor = 0x6e7c8c,
  sunColor = 0xf6a04d,
  sunGlareColor = 0xffd2a6,
  sunlightColor = 0xffb86b,
  // Motion & Sizing
  speed = 0.7,
  mouseControls = true,
  touchControls = true,
  gyroControls = false,
  minHeight = 200.0,
  minWidth = 200.0,
  scale = 1.0,
  scaleMobile = 1.0,
  // Overlay options
  showOverlay = true,
  overlayGradient = 'linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.4) 100%)',
  overlayClassName = '',
}) {
  const vantaContainerRef = useRef(null);
  const vantaEffectRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only execute on client
    if (typeof window === 'undefined' || !vantaContainerRef.current) return;

    // Ensure THREE is globally available if Vanta looks for window.THREE
    window.THREE = THREE;

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const effectiveSpeed = prefersReducedMotion ? 0.05 : speed;

    try {
      const initVanta = CLOUDS.default || CLOUDS;
      if (typeof initVanta === 'function') {
        vantaEffectRef.current = initVanta({
          el: vantaContainerRef.current,
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
          speed: effectiveSpeed,
        });
        setIsLoaded(true);
      }
    } catch (err) {
      console.error('Failed to initialize Vanta CLOUDS effect:', err);
    }

    // Cleanup instance on unmount to avoid memory leaks
    return () => {
      if (vantaEffectRef.current && typeof vantaEffectRef.current.destroy === 'function') {
        try {
          vantaEffectRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying Vanta instance:', e);
        }
        vantaEffectRef.current = null;
      }
    };
  }, [
    backgroundColor,
    skyColor,
    cloudColor,
    cloudShadowColor,
    sunColor,
    sunGlareColor,
    sunlightColor,
    speed,
    mouseControls,
    touchControls,
    gyroControls,
    minHeight,
    minWidth,
    scale,
    scaleMobile,
  ]);

  // Convert hex color to CSS hex for fallback background
  const hexBgColor = `#${backgroundColor.toString(16).padStart(6, '0')}`;

  return (
    <div
      className={`vanta-hero-wrapper ${className}`}
      style={{
        backgroundColor: hexBgColor,
        ...style,
      }}
    >
      {/* Absolute canvas background container */}
      <div
        ref={vantaContainerRef}
        className={`vanta-canvas-container ${isLoaded ? 'is-loaded' : ''}`}
        aria-hidden="true"
      />

      {/* Optional contrast wash overlay */}
      {showOverlay && (
        <div
          className={`vanta-overlay ${overlayClassName}`}
          style={{ background: overlayGradient }}
          aria-hidden="true"
        />
      )}

      {/* Hero Foreground Content */}
      {children && <div className="vanta-content-container">{children}</div>}
    </div>
  );
}

export default VantaCloudsBackground;
