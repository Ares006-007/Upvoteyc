'use client';

import React, { useEffect, useRef, useState, useCallback, ReactNode, CSSProperties } from 'react';
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
 * Smooth, production-safe animated hero background using Vanta CLOUDS and Three.js.
 * Pauses automatically when offscreen (IntersectionObserver) or when the tab is inactive.
 */
export const SkyBackground: React.FC<SkyBackgroundProps> = ({
  children,
  className = '',
  style = {},
  // Visual Palette
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
  showOverlay = true,
  overlayOpacity = 0.05,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);
  const isVisibleRef = useRef<boolean>(true);
  const [isVantaActive, setIsVantaActive] = useState<boolean>(false);

  const destroyVanta = useCallback(() => {
    if (effectRef.current && typeof effectRef.current.destroy === 'function') {
      try {
        effectRef.current.destroy();
      } catch (err) {
        console.warn('[SkyBackground] Destruction notice:', err);
      }
      effectRef.current = null;
      setIsVantaActive(false);
    }
  }, []);

  const initVanta = useCallback(async () => {
    if (!canvasRef.current || effectRef.current || !isVisibleRef.current) return;
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const isMobile = disableOnMobile && (window.innerWidth < 768 || window.matchMedia('(max-width: 768px)').matches);
    if (isMobile) return;

    try {
      const [THREE, vantaModule] = await Promise.all([
        import('three'),
        import('vanta/dist/vanta.clouds.min')
      ]);

      if (!canvasRef.current || effectRef.current || !isVisibleRef.current) return;

      (window as any).THREE = THREE;
      const cloudsFn = (vantaModule as any).default || vantaModule;

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
      console.warn('[SkyBackground] WebGL fallback active:', err);
    }
  }, [
    skyColor, cloudColor, cloudShadowColor,
    sunColor, sunGlareColor, sunlightColor,
    speed, mouseControls, touchControls, gyroControls,
    minHeight, minWidth, scale, scaleMobile, disableOnMobile
  ]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

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

    let observer: IntersectionObserver | undefined;
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

    let resizeObserver: ResizeObserver | undefined;
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
