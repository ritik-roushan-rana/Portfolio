"use client";

import { useEffect, useRef } from "react";

/**
 * Hairline read-progress bar across the top of the viewport.
 *
 * Scaled with a transform written directly to the node inside a rAF-throttled
 * scroll handler: this updates on every frame of a scroll, and putting it in
 * React state would re-render the tree for a value nothing else reads.
 *
 * The page height is measured by a ResizeObserver, not read in the handler:
 * `scrollHeight` forces a synchronous layout, and read on every frame right
 * after the deck has written its transforms it turned each scroll frame into
 * a layout pass.
 */
export default function Progress() {
  const barRef = useRef(null);

  useEffect(() => {
    let frameId = 0;
    let max = 0;

    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
    };
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.documentElement);

    const update = () => {
      frameId = 0;
      const ratio = max > 0 ? window.scrollY / max : 0;
      const node = barRef.current;
      if (node) node.style.transform = `scaleX(${Math.min(1, ratio)})`;
    };

    const onScroll = () => {
      if (!frameId) frameId = requestAnimationFrame(update);
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      ro.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="progress" aria-hidden="true">
      <span ref={barRef} className="progress__bar" />
    </div>
  );
}
