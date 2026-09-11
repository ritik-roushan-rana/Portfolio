"use client";

import { useEffect, useState } from "react";

/**
 * Opening title card: a counter runs to 100, then the plate splits into five
 * columns that wipe upward on staggered delays.
 *
 * It locks scrolling while it runs so the reader always starts at the hero, and
 * it unmounts itself afterwards rather than lingering as an invisible overlay.
 *
 * Reduced-motion visitors skip it entirely — nothing here carries information,
 * so there is nothing to preserve for them.
 */
const DURATION = 1500;

export default function Preloader() {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState("counting"); // counting -> out -> done

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return undefined;
    }

    document.body.style.overflow = "hidden";
    const start = performance.now();
    let frameId = 0;

    // The counter is animated with rAF because it should be smooth, but the
    // exit is scheduled up front on timers. Browsers throttle rAF to a stop in
    // a background tab, and a purely frame-driven preloader would sit there
    // with scrolling locked until the tab was focused.
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      // Ease-out so the counter sprints early and settles on 100, instead of
      // crawling at a constant rate.
      setCount(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    const exitTimer = window.setTimeout(() => {
      setCount(100);
      setPhase("out");
    }, DURATION + 220);
    // Matches the panel transition (1s) plus the largest stagger (240ms).
    const doneTimer = window.setTimeout(() => setPhase("done"), DURATION + 1560);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase === "done") document.body.style.overflow = "";
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`preloader ${phase === "out" ? "preloader--out" : ""}`}
      aria-hidden="true"
    >
      <div className="preloader__panels">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="preloader__panel" />
        ))}
      </div>

      <span className="preloader__name">
        Ritik Roushan Rana — Portfolio 2026
      </span>
      <span className="preloader__count">{count}</span>

      <span className="preloader__bar" style={{ width: `${count}%` }} />
    </div>
  );
}
