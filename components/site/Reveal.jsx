"use client";

import { useEffect, useRef } from "react";

/**
 * Reveals content on scroll: fade plus upward slide.
 *
 * With `stagger`, the wrapper itself stays put and its direct children animate
 * in sequence instead. The per-child delays are plain nth-child rules in CSS
 * (see globals.css), so no JS touches individual children and children can be
 * any markup, including server components.
 *
 * IntersectionObserver rather than a scroll listener, disconnecting after the
 * first reveal so each block is observed exactly once.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  stagger = false,
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
      className={`${stagger ? "reveal-stagger" : "reveal"} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
