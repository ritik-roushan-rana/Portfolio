"use client";

import { useEffect, useState } from "react";

/** Never hold the page longer than this, however slow an asset is. */
const MAX_WAIT_MS = 4000;

/** Signal other components can wait on for their entrance animation. */
export const APP_READY_EVENT = "portfolio:ready";

/**
 * True once the preloader has finished (or was never shown).
 *
 * Starts false on the server so markup matches, then resolves on mount: either
 * immediately, if the preloader already completed or reduced motion is on, or
 * when the ready event fires.
 */
export function useAppReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (
      document.documentElement.dataset.loaded === "true" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setReady(true);
      return undefined;
    }

    const onReady = () => setReady(true);
    window.addEventListener(APP_READY_EVENT, onReady);
    return () => window.removeEventListener(APP_READY_EVENT, onReady);
  }, []);

  return ready;
}

/**
 * Full-screen loading overlay with a counter driven by real asset progress.
 *
 * Progress is measured from the document's images plus font loading rather than
 * a fixed timer, so the number reflects something true. The displayed value is
 * eased toward the measured value each frame so it counts smoothly instead of
 * jumping, and it is never allowed to stall: MAX_WAIT_MS forces completion.
 *
 * The overlay also carries a pure-CSS failsafe animation that hides it even if
 * this component never runs, so a script error cannot leave the page covered.
 */
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    const finish = () => {
      root.dataset.loaded = "true";
      window.dispatchEvent(new Event(APP_READY_EVENT));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHidden(true);
      finish();
      return undefined;
    }

    let frame = 0;
    let fadeTimer = 0;
    let cancelled = false;
    let shown = 0;
    let fontsDone = false;

    const measure = () => {
      const images = Array.from(document.images);
      const loadedImages = images.filter((img) => img.complete).length;
      // Fonts count as one unit alongside the images.
      const total = images.length + 1;
      const done = loadedImages + (fontsDone ? 1 : 0);
      return total > 0 ? done / total : 1;
    };

    const started = performance.now();

    const tick = () => {
      if (cancelled) return;

      const elapsed = performance.now() - started;
      const target = elapsed >= MAX_WAIT_MS ? 1 : measure();

      // Ease toward target so the counter never jumps in large steps.
      shown += (target * 100 - shown) * 0.12;

      if (target >= 1 && shown > 99.4) shown = 100;

      setProgress(Math.round(shown));

      if (shown >= 100) {
        finish();
        // Let 100% register before fading out.
        fadeTimer = window.setTimeout(() => {
          if (!cancelled) setHidden(true);
        }, 260);
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    document.fonts?.ready
      .then(() => {
        fontsDone = true;
      })
      .catch(() => {
        fontsDone = true;
      });

    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, []);

  return (
    <div
      className={`preloader${hidden ? " preloader--hidden" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="preloader__inner">
        <span className="preloader__count">
          {progress}
          <span className="preloader__pct">%</span>
        </span>
        <span className="preloader__track">
          <span
            className="preloader__bar"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </span>
      </div>
    </div>
  );
}
