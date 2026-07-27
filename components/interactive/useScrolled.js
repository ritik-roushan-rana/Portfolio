"use client";

import { useEffect, useState } from "react";

/**
 * Returns true once the page is scrolled past `threshold` pixels.
 *
 * State is a boolean rather than a scroll offset, so the consuming component
 * re-renders only when the threshold is crossed instead of on every frame.
 */
export default function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > threshold);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);

  return scrolled;
}
