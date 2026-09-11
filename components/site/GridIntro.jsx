"use client";

import { useEffect, useState } from "react";

/**
 * The opening: a grid draws itself across the dark page, then the picture
 * appears inside it.
 *
 * Three beats, all on timers so a throttled tab still finishes on schedule:
 *   1. lines   — thin vertical rules grow down from the top, horizontal ones
 *                sweep in from the left, each on a small stagger
 *   2. cells   — the dark plate is a grid of tiles; they clear one by one on
 *                a diagonal, and the hero's painting shows through the frame
 *   3. out     — the rules fade and the layer unmounts; the hero's caption
 *                is timed to enter as this happens
 *
 * Reduced-motion visitors skip it: the page simply starts on the painting.
 */
export const COLS = 6;
export const ROWS = 4;
const LINES = 700;   // rules drawn
const CELLS = 1500;  // last tile cleared (lines + tile stagger + fade)
const DONE = 2100;   // rules faded, layer gone

export default function GridIntro() {
  const [phase, setPhase] = useState("lines"); // lines -> cells -> out -> done

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return undefined;
    }
    document.body.style.overflow = "hidden";
    const t1 = window.setTimeout(() => setPhase("cells"), LINES - 150);
    const t2 = window.setTimeout(() => setPhase("out"), CELLS);
    const t3 = window.setTimeout(() => setPhase("done"), DONE);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase === "done") document.body.style.overflow = "";
  }, [phase]);

  if (phase === "done") return null;

  const cells = Array.from({ length: COLS * ROWS }, (_, i) => {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    // Diagonal order from the top-left, 55ms per step.
    return <span key={i} className="gintro__cell" style={{ "--d": `${(c + r) * 55}ms` }} />;
  });

  return (
    <div className={`gintro gintro--${phase}`} aria-hidden="true">
      <div className="gintro__cells">{cells}</div>
      <div className="gintro__lines">
        {Array.from({ length: COLS - 1 }, (_, i) => (
          <span
            key={`v${i}`}
            className="gintro__v"
            style={{ left: `${((i + 1) / COLS) * 100}%`, "--d": `${i * 70}ms` }}
          />
        ))}
        {Array.from({ length: ROWS - 1 }, (_, i) => (
          <span
            key={`h${i}`}
            className="gintro__h"
            style={{ top: `${((i + 1) / ROWS) * 100}%`, "--d": `${150 + i * 90}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
