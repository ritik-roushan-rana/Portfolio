"use client";

import { useEffect, useState } from "react";

/**
 * Fixed vertical section indicator on the right edge.
 *
 * Active section comes from IntersectionObserver rather than scroll maths. The
 * -45% top/bottom root margin narrows the trigger area to a band across the
 * middle of the viewport, so the highlight changes when a section reaches the
 * centre instead of the moment it peeks in at the edge.
 */
export default function SectionDots({ sections }) {
  const [active, setActive] = useState(sections[0]?.id ?? null);

  useEffect(() => {
    const nodes = sections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);

    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  const goTo = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="section-dots" aria-label="Section navigation">
      <ul className="section-dots__list">
        {sections.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id} className="section-dots__item">
              <button
                type="button"
                onClick={() => goTo(id)}
                className={`section-dots__dot${
                  isActive ? " section-dots__dot--active" : ""
                }`}
                aria-label={`Go to ${label}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="section-dots__label">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
