"use client";

import { useEffect, useRef } from "react";

/**
 * Thin scan-style bar across the top of the page tracking scroll position.
 *
 * Writes straight to the node's transform inside a rAF-throttled scroll
 * handler. scaleX only touches compositing, so scrolling stays smooth and
 * React never re-renders while the user scrolls.
 */
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const bar = barRef.current;
      if (!bar) return;

      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollable = scrollHeight - clientHeight;
      const progress =
        scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;

      bar.style.transform = `scaleX(${progress})`;
      bar.style.opacity = progress > 0.001 ? "1" : "0";
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span ref={barRef} className="scroll-progress__bar" />
    </div>
  );
}
