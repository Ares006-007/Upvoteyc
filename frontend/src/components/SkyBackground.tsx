'use client';

import React, { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react';
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
  disableOnMobile?: boolean;
}

export interface SkyBackgroundProps extends VantaCloudsOptions {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  showOverlay?: boolean;
  overlayOpacity?: number;
}

/**
 * SkyBackground (Next.js & React Component)
 * 
 * Performance-tuned, client-only animated hero background using Vanta CLOUDS with Three.js.
 * Safe for Next.js App Router / SSR, with dynamic lazy chunking and mobile fallback.
 */
export const SkyBackground: React.FC<SkyBackgroundProps> = ({
  children,
  className = '',
  style = {},
  // High-contrast dusk palette
  backgroundColor = 0x7fa9c9,
  skyColor = 0x6cbede,
  cloudColor = 0xb4c7e3,
  cloudShadowColor = 0x1a3956,
  sunColor = 0xf49620,
  sunGlareColor = 0xff6835,
  sunlightColor = 0xf99632,
  // Aggressive performance settings
  speed = 0.3,
  mouseControls = false,
  touchControls = false,
  gyroControls = false,
  minHeight = 200,
  minWidth = 200,
  scale = 0.8,
  scaleMobile = 0.55,
  disableOnMobile = true,
  showOverlay = true,
  overlayOpacity = 0.05,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);
  const [isVantaActive, setIsVantaActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = disableOnMobile && (window.innerWidth < 768 || window.matchMedia('(max-width: 768px)').matches);

    if (prefersReducedMotion || isMobile) {
      return;
    }

    let isSubscribed = true;

    const loadEffect = async () => {
      try {
        const [THREE, vantaModule] = await Promise.all([
          import('three'),
          import('vanta/dist/vanta.clouds.min')
        ]);

        if (!isSubscribed || !canvasRef.current || effectRef.current) return;

        (window as any).THREE = THREE;
        const initVanta = (vantaModule as any).default || vantaModule;

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
      } catch (err) {
        console.warn('[SkyBackground] Dynamic WebGL initialization skipped:', err);
      }
    };

    if ('requestIdleCallback' in window) {
      const idleId = (window as any).requestIdleCallback(() => {
        loadEffect();
      }, { timeout: 1000 });
      return () => {
        isSubscribed = false;
        (window as any).cancelIdleCallback(idleId);
        if (effectRef.current && typeof effectRef.current.destroy === 'function') {
          effectRef.current.destroy();
          effectRef.current = null;
        }
      };
    } else {
      const timer = setTimeout(loadEffect, 50);
      return () => {
        isSubscribed = false;
        clearTimeout(timer);
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
    minHeight, minWidth, scale, scaleMobile, disableOnMobile
  ]);

  return (
    <section
      ref={containerRef}
      className={`vanta-hero-wrapper ${className}`}
      style={style}
    >
      <div className="vanta-static-fallback" aria-hidden="true" />
      <div
        ref={canvasRef}
        className={`vanta-canvas-layer ${isVantaActive ? 'is-ready' : ''}`}
        aria-hidden="true"
      />
      {showOverlay && (
        <div
          className="vanta-contrast-overlay"
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
          aria-hidden="true"
        />
      )}
      {children && <div className="vanta-foreground">{children}</div>}
    </section>
  );
};

export default SkyBackground;
