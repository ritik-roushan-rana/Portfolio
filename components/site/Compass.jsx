"use client";

import { useEffect, useState } from "react";
import { scrollToSection } from "@/lib/smooth-scroll";

/**
 * Right-edge section rail. Each entry is a tick that grows and takes the accent
 * colour while its section holds the viewport, with the label sliding in.
 *
 * Scroll-spy is an IntersectionObserver with a band-shaped rootMargin rather
 * than a scroll-position calculation: the band is a horizontal strip across the
 * middle of the viewport, so the active section is whichever one occupies the
 * reader's centre of attention, regardless of how tall it is.
 */
export default function Compass({ sections }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        // Several sections can straddle the band during a fast scroll; the one
        // showing the most of itself wins.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  // The rail is redundant on the first section — it would be pointing at the
  // screen you are already looking at — and at the hero it collides with the
  // panel pinned to the right edge. It fades in once you start reading.
  const atTop = active === sections[0]?.id;

  return (
    <nav
      className={`compass ${atTop ? "compass--idle" : ""}`}
      aria-label="Sections"
    >
      <ul className="compass__list">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => scrollToSection(section.id)}
              aria-current={active === section.id ? "true" : undefined}
              className={`compass__item ${
                active === section.id ? "compass__item--active" : ""
              }`}
            >
              <span className="compass__label">{section.label}</span>
              <span className="compass__tick" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
