import React, { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react';
import * as THREE from 'three';
import CLOUDS from 'vanta/dist/vanta.clouds.min';
import './VantaCloudsBackground.css';

export interface VantaCloudsOptions {
  backgroundColor?: number;
  skyColor?: number;
  cloudColor?: number;
  cloudShadowColor?: number;
  sunColor?: number;
  sunGlareColor?: number;
  sunlightColor?: number;
  speed?: number;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
}

export interface SkyBackgroundProps extends VantaCloudsOptions {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  showOverlay?: boolean;
  overlayGradient?: string;
  overlayClassName?: string;
}

/**
 * SkyBackground (TypeScript)
 * Cinematic animated dusk sky hero background powered by Vanta CLOUDS and Three.js.
 */
export const SkyBackground: React.FC<SkyBackgroundProps> = ({
  children,
  className = '',
  style = {},
  // Cinematic Dusk Default Palette
  backgroundColor = 0x7fa9c9,
  skyColor = 0x87b5d6,
  cloudColor = 0xc7d2de,
  cloudShadowColor = 0x6e7c8c,
  sunColor = 0xf6a04d,
  sunGlareColor = 0xffd2a6,
  sunlightColor = 0xffb86b,
  speed = 0.7,
  mouseControls = true,
  touchControls = true,
  gyroControls = false,
  minHeight = 200.0,
  minWidth = 200.0,
  scale = 1.0,
  scaleMobile = 1.0,
  showOverlay = true,
  overlayGradient = 'linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.45) 100%)',
  overlayClassName = '',
}) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !vantaRef.current) return;

    // Attach THREE to window for Vanta bundle compatibility
    (window as any).THREE = THREE;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const activeSpeed = prefersReducedMotion ? 0.05 : speed;

    try {
      const initVanta = (CLOUDS as any).default || CLOUDS;
      if (typeof initVanta === 'function') {
        effectRef.current = initVanta({
          el: vantaRef.current,
          THREE,
          backgroundColor,
          skyColor,
          cloudColor,
          cloudShadowColor,
          sunColor,
          sunGlareColor,
          sunlightColor,
          speed: activeSpeed,
          mouseControls,
          touchControls,
          gyroControls,
          minHeight,
          minWidth,
          scale,
          scaleMobile,
        });
        setIsMounted(true);
      }
    } catch (error) {
      console.error('SkyBackground initialization failed:', error);
    }

    // Teardown / memory cleanup
    return () => {
      if (effectRef.current && typeof effectRef.current.destroy === 'function') {
        try {
          effectRef.current.destroy();
        } catch (err) {
          console.warn('SkyBackground destroy error:', err);
        }
        effectRef.current = null;
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

  const fallbackColor = `#${backgroundColor.toString(16).padStart(6, '0')}`;

  return (
    <section
      className={`vanta-hero-wrapper ${className}`}
      style={{ backgroundColor: fallbackColor, ...style }}
    >
      <div
        ref={vantaRef}
        className={`vanta-canvas-container ${isMounted ? 'is-loaded' : ''}`}
        aria-hidden="true"
      />
      {showOverlay && (
        <div
          className={`vanta-overlay ${overlayClassName}`}
          style={{ background: overlayGradient }}
          aria-hidden="true"
        />
      )}
      {children && <div className="vanta-content-container">{children}</div>}
    </section>
  );
};

export default SkyBackground;
