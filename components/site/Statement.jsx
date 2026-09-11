"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * A sentence that lights up word by word as it crosses the viewport.
 *
 * Progress is measured from the element's own position: 0 when its top reaches
 * 85% of the viewport height, 1 when it reaches 35%. That window is short
 * enough that the whole line finishes lighting well before it leaves the
 * screen, rather than completing only at the very bottom of the scroll.
 *
 * `lit` is a single integer in state, not one boolean per word, so a scroll
 * frame that does not cross a word boundary costs no re-render at all.
 *
 * The scroll listener is attached only while the sentence is near the
 * viewport (an IntersectionObserver turns it on and off). It has to read its
 * own position each frame, and that read forces layout — acceptable while it
 * is on screen, wasted on every frame of the project deck below it.
 */
export default function Statement({ text, className = "" }) {
  const ref = useRef(null);
  const words = useMemo(() => text.split(" "), [text]);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLit(words.length);
      return undefined;
    }

    let frameId = 0;

    const update = () => {
      frameId = 0;
      const { top } = node.getBoundingClientRect();
      const start = window.innerHeight * 0.85;
      const end = window.innerHeight * 0.35;
      const progress = Math.max(0, Math.min(1, (start - top) / (start - end)));
      setLit(Math.round(progress * words.length));
    };

    const onScroll = () => {
      if (!frameId) frameId = requestAnimationFrame(update);
    };

    let listening = false;
    const listen = (on) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => listen(entry.isIntersecting),
      { rootMargin: "20% 0px 20% 0px" }
    );
    io.observe(node);
    update();

    return () => {
      io.disconnect();
      listen(false);
    };
  }, [words.length]);

  return (
    <p ref={ref} className={`statement ${className}`}>
      {words.map((word, index) => (
        <span
          key={index}
          className={`statement__word ${index < lit ? "statement__word--lit" : ""}`}
        >
          {word}
        </span>
      ))}
    </p>
  );
}
