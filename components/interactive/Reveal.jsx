"use client";

import { useEffect, useRef } from "react";

/**
 * Fades and slides its children up once they scroll into view.
 *
 * Uses IntersectionObserver rather than a scroll handler so there is no
 * per-frame work, and disconnects after the first reveal so each section is
 * observed exactly once. Under reduced motion the content is shown immediately.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-revealed");
      return undefined;
    }

    // Already in view on load (the hero, mainly) - reveal without waiting.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            node.classList.add("is-revealed");
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
