import React, { useEffect, useRef, useState, useCallback } from 'react';
import './VantaCloudsBackground.css';

/* ================================================================
   VantaCloudsBackground — Performance-Optimized WebGL Cloud Hero
   ================================================================
   Key optimizations over the original implementation:

   1. DYNAMIC IMPORT — Three.js + Vanta (~615KB) are code-split into
      a separate chunk via dynamic import(). The static CSS gradient
      fallback paints instantly while WebGL loads in the background.

   2. PAUSE/RESUME — When the hero scrolls off-screen or the tab is
      hidden, we cancel the rAF loop (cheap) instead of destroying
      the entire WebGL context and recreating it (expensive + causes
      visible flicker).

   3. PIXEL RATIO CAP — Limits the WebGL canvas resolution to 1.5×
      on desktop and 1.0× on mobile, avoiding 2×–3× Retina rendering
      that most users can't distinguish but costs 4×–9× GPU fill rate.

   4. FPS THROTTLE — Monkey-patches Vanta's animationLoop to skip
      frames and target ~30 FPS instead of 60 FPS. Halves GPU workload
      with no perceptible quality loss on a slow-moving cloud scene.

   5. LIVE THEME UPDATES — Uses Vanta's setOptions() + updateUniforms()
      to change cloud colors/speed live without destroying and
      recreating the WebGL context. Zero flicker on theme switch.

   6. STABLE DEPS — All Vanta config is stored in a ref, keeping the
      main useEffect's dependency array minimal. React re-renders from
      parent state changes no longer trigger effect re-initialization.

   7. DEVICE DETECTION — Automatically detects low-performance devices
      (low CPU cores, low memory, mobile) and degrades gracefully:
      lower scale, slower speed, lower pixel ratio.
   ================================================================ */

// ─── Module-level lazy-loading cache ──────────────────────────────
let _loadPromise = null;

function loadVantaDeps() {
  if (_loadPromise) return _loadPromise;
  _loadPromise = Promise.all([
    import('three'),
    import('vanta/dist/vanta.clouds.min'),
  ]).then(([threeModule, vantaModule]) => {
    // Resolve THREE (handles ESM default vs namespace export)
    const THREE = threeModule.default || threeModule;
    // Resolve the CLOUDS factory function
    const mod = vantaModule.default || vantaModule;
    const cloudsFn =
      typeof mod === 'function'
        ? mod
        : typeof mod?.default === 'function'
          ? mod.default
          : typeof window !== 'undefined' && window.VANTA?.CLOUDS
            ? window.VANTA.CLOUDS
            : null;
    return { THREE, cloudsFn };
  });
  return _loadPromise;
}

// ─── Performance detection ────────────────────────────────────────
function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

function isLowPerformanceDevice() {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4; // GB, Chrome-only
  const mobile = isMobileViewport();
  // Low-end: ≤2 cores, ≤2GB RAM, or mobile with ≤4 cores
  return cores <= 2 || memory <= 2 || (mobile && cores <= 4);
}

function getOptimalPixelRatio() {
  const dpr = window.devicePixelRatio || 1;
  if (isLowPerformanceDevice()) return Math.min(dpr, 1.0);
  if (isMobileViewport()) return Math.min(dpr, 1.0);
  return Math.min(dpr, 1.5);
}

// ─── FPS Throttle ─────────────────────────────────────────────────
function applyFpsThrottle(effect, targetFps) {
  if (!effect || typeof effect.animationLoop !== 'function') return;

  const originalLoop = effect.animationLoop;
  const frameInterval = 1000 / targetFps;
  let lastFrameTime = 0;

  effect.animationLoop = function throttledLoop() {
    const now = performance.now();
    const delta = now - lastFrameTime;

    if (delta < frameInterval) {
      // Skip this frame — schedule next check
      this.req = window.requestAnimationFrame(this.animationLoop);
      return;
    }
    // Drift-corrected timestamp
    lastFrameTime = now - (delta % frameInterval);
    // Run the actual Vanta render (which also schedules next frame)
    originalLoop.call(this);
  }.bind(effect);

  // Restart the loop with the throttled version
  window.cancelAnimationFrame(effect.req);
  effect.req = window.requestAnimationFrame(effect.animationLoop);
}

/**
 * VantaCloudsBackground
 *
 * Production-ready, performance-optimized animated 3D hero background.
 * Uses Vanta CLOUDS with Three.js, code-split and throttled.
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
  const isPausedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const inViewportRef = useRef(true);

  // Store ALL config in a ref so the main useEffect has stable deps.
  // Config changes are applied live via setOptions, not via re-init.
  const configRef = useRef({
    backgroundColor, skyColor, cloudColor, cloudShadowColor,
    sunColor, sunGlareColor, sunlightColor, speed,
    mouseControls, touchControls, gyroControls,
    minHeight, minWidth, scale, scaleMobile,
  });

  // ─── Live theme/config updates (no destroy/recreate!) ───────────
  useEffect(() => {
    const newConfig = {
      backgroundColor, skyColor, cloudColor, cloudShadowColor,
      sunColor, sunGlareColor, sunlightColor, speed,
      mouseControls, touchControls, gyroControls,
      minHeight, minWidth, scale, scaleMobile,
    };
    const prev = configRef.current;
    configRef.current = newConfig;

    // If effect exists, apply changes live via Vanta's setOptions API
    const effect = effectRef.current;
    if (effect && typeof effect.setOptions === 'function') {
      // Check if any visual property actually changed
      const changed = Object.keys(newConfig).some(
        (k) => newConfig[k] !== prev[k]
      );
      if (changed) {
        effect.setOptions(newConfig);
        // setOptions calls updateUniforms internally for ShaderBase,
        // which pushes new color values to the GPU shader uniforms
        // live — no restart needed.
      }
    }
  }, [
    backgroundColor, skyColor, cloudColor, cloudShadowColor,
    sunColor, sunGlareColor, sunlightColor, speed,
    mouseControls, touchControls, gyroControls,
    minHeight, minWidth, scale, scaleMobile,
  ]);

  // ─── Pause: cancel rAF without destroying WebGL context ─────────
  const pauseEffect = useCallback(() => {
    const effect = effectRef.current;
    if (!effect || isPausedRef.current) return;
    if (effect.req) {
      window.cancelAnimationFrame(effect.req);
      effect.req = null;
    }
    isPausedRef.current = true;
  }, []);

  // ─── Resume: restart the rAF loop ──────────────────────────────
  const resumeEffect = useCallback(() => {
    const effect = effectRef.current;
    if (!effect || !isPausedRef.current) return;
    isPausedRef.current = false;
    // Reset prevNow so elapsed-time calc doesn't spike after a long pause
    effect.prevNow = performance.now();
    if (typeof effect.animationLoop === 'function') {
      effect.req = window.requestAnimationFrame(effect.animationLoop);
    }
  }, []);

  // ─── Destroy: full cleanup (only on unmount) ───────────────────
  const destroyEffect = useCallback(() => {
    const effect = effectRef.current;
    if (!effect) return;
    try {
      if (effect.req) window.cancelAnimationFrame(effect.req);
      if (typeof effect.destroy === 'function') effect.destroy();
    } catch (_) { /* clean catch */ }
    effectRef.current = null;
    isPausedRef.current = false;
  }, []);

  // ─── Main initialization (runs once, stable deps) ──────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Accessibility: respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Optional mobile skip
    if (disableOnMobile && isMobileViewport()) return;

    let cancelled = false;

    const init = async () => {
      if (effectRef.current || isInitializingRef.current || !canvasRef.current) return;
      isInitializingRef.current = true;

      try {
        const { THREE, cloudsFn } = await loadVantaDeps();

        // Guard: component may have unmounted during async load
        if (cancelled || effectRef.current) {
          isInitializingRef.current = false;
          return;
        }

        if (typeof cloudsFn !== 'function') {
          console.warn('[VantaClouds] Could not resolve CLOUDS function');
          isInitializingRef.current = false;
          return;
        }

        window.THREE = THREE;
        const config = configRef.current;
        const lowPerf = isLowPerformanceDevice();

        effectRef.current = cloudsFn({
          el: canvasRef.current,
          THREE,
          mouseControls: config.mouseControls,
          touchControls: config.touchControls,
          gyroControls: config.gyroControls,
          minHeight: config.minHeight,
          minWidth: config.minWidth,
          // Reduce complexity on low-end devices
          scale: lowPerf ? Math.min(config.scale, 0.5) : config.scale,
          scaleMobile: config.scaleMobile,
          backgroundColor: config.backgroundColor,
          skyColor: config.skyColor,
          cloudColor: config.cloudColor,
          cloudShadowColor: config.cloudShadowColor,
          sunColor: config.sunColor,
          sunGlareColor: config.sunGlareColor,
          sunlightColor: config.sunlightColor,
          speed: lowPerf ? Math.min(config.speed, 0.18) : config.speed,
        });

        if (cancelled) {
          // Race condition: unmounted right after init
          destroyEffect();
          isInitializingRef.current = false;
          return;
        }

        // POST-INIT OPTIMIZATION 1: Cap pixel ratio
        if (effectRef.current?.renderer) {
          const optimalDPR = getOptimalPixelRatio();
          effectRef.current.renderer.setPixelRatio(optimalDPR);
          // Disable antialiasing cannot be changed post-creation,
          // but the pixel ratio reduction greatly reduces fill rate.
        }

        // POST-INIT OPTIMIZATION 2: FPS throttle
        const targetFps = lowPerf ? 20 : 30;
        applyFpsThrottle(effectRef.current, targetFps);

        isPausedRef.current = false;
      } catch (err) {
        console.warn('[VantaClouds] WebGL init failed, using static fallback:', err);
      } finally {
        isInitializingRef.current = false;
      }
    };

    // Delay init by 1 frame so container dimensions are non-zero
    const rafId = requestAnimationFrame(() => {
      if (!cancelled) init();
    });

    // ─── IntersectionObserver: PAUSE when off-screen ────────────
    let observer;
    if (typeof IntersectionObserver !== 'undefined' && containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          const isVisible = entries[0].isIntersecting;
          inViewportRef.current = isVisible;
          if (isVisible) {
            if (effectRef.current) {
              resumeEffect();
            } else if (!isInitializingRef.current) {
              init();
            }
          } else {
            pauseEffect();
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    }

    // ─── Visibility: pause when tab is hidden ───────────────────
    const handleVisibility = () => {
      if (document.hidden) {
        pauseEffect();
      } else if (inViewportRef.current) {
        // Only resume if hero is also in viewport
        resumeEffect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // ─── ResizeObserver: debounced resize ────────────────────────
    let resizeTimer;
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && canvasRef.current) {
      resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (effectRef.current && typeof effectRef.current.resize === 'function') {
            // Re-apply our pixel ratio cap (Vanta's resize() resets to devicePixelRatio)
            if (effectRef.current.renderer) {
              effectRef.current.renderer.setPixelRatio(getOptimalPixelRatio());
            }
            effectRef.current.resize();
          }
        }, 200);
      });
      resizeObserver.observe(canvasRef.current);
    }

    // ─── Cleanup ────────────────────────────────────────────────
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (observer) observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      destroyEffect();
    };
  }, [disableOnMobile, pauseEffect, resumeEffect, destroyEffect]);
  // ^ Minimal deps — config changes are handled by the separate useEffect above

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
