'use client';

import React, { useEffect, useRef, useState, useCallback, ReactNode, CSSProperties } from 'react';
import * as THREE from 'three';
import vantaCloudsModule from 'vanta/dist/vanta.clouds.min';
import './VantaCloudsBackground.css';

function resolveCloudsFunction() {
  if (typeof vantaCloudsModule === 'function') {
    return vantaCloudsModule;
  }
  if (vantaCloudsModule && typeof (vantaCloudsModule as any).default === 'function') {
    return (vantaCloudsModule as any).default;
  }
  if (typeof window !== 'undefined' && (window as any).VANTA && typeof (window as any).VANTA.CLOUDS === 'function') {
    return (window as any).VANTA.CLOUDS;
  }
  return null;
}

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
 * Pauses automatically when offscreen (IntersectionObserver) or when tab is inactive.
 */
export const SkyBackground: React.FC<SkyBackgroundProps> = ({
  children,
  className = '',
  style = {},
  // Visual Palette
  backgroundColor = 0x7fa9c9,
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
  const [isVantaActive, setIsVantaActive] = useState<boolean>(false);

  const destroyEffect = useCallback(() => {
    if (effectRef.current && typeof effectRef.current.destroy === 'function') {
      try {
        effectRef.current.destroy();
      } catch (err) {
        // clean catch
      }
      effectRef.current = null;
      setIsVantaActive(false);
    }
  }, []);

  const initEffect = useCallback(() => {
    if (!canvasRef.current || effectRef.current) return;
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (disableOnMobile && (window.innerWidth < 768 || window.matchMedia('(max-width: 768px)').matches)) {
      return;
    }

    try {
      (window as any).THREE = THREE;
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
      }
    } catch (err) {
      console.warn('[SkyBackground] WebGL fallback active:', err);
    }
  }, [
    backgroundColor, skyColor, cloudColor, cloudShadowColor,
    sunColor, sunGlareColor, sunlightColor, speed,
    mouseControls, touchControls, gyroControls,
    minHeight, minWidth, scale, scaleMobile, disableOnMobile
  ]);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      initEffect();
    });

    let observer: IntersectionObserver | undefined;
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

    const handleVisibility = () => {
      if (document.hidden) {
        destroyEffect();
      } else {
        initEffect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let resizeObserver: ResizeObserver | undefined;
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
      <div className="vanta-static-fallback" aria-hidden="true" />
      <div
        ref={canvasRef}
        className="vanta-canvas-layer"
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
