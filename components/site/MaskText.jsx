"use client";

import { useEffect, useRef } from "react";

/**
 * Line-by-line mask reveal: each line slides up out of its own clipping box.
 *
 * `lines` is an array of ReactNodes so a line can carry inline markup (the
 * serif-italic accents in the hero, for instance) rather than plain strings.
 *
 * The per-line delay is applied as an inline transition-delay, and the whole
 * block is triggered once by an IntersectionObserver that disconnects on the
 * first hit — these are entrances, not scroll-linked effects.
 */
export default function MaskText({
  lines,
  className = "",
  as: Tag = "span",
  delay = 0,
  step = 110,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reveal = () =>
      node.querySelectorAll(".mask-line").forEach((line) => line.classList.add("is-in"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal();
          observer.disconnect();
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, index) => (
        <span key={index} className="mask-line">
          <span style={{ transitionDelay: `${delay + index * step}ms` }}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
