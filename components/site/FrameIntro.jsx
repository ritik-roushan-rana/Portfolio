"use client";

import { useEffect, useState } from "react";

/**
 * The opening: a small framed window onto the painting, in the middle of a
 * dark page, that opens outward until the painting fills the screen.
 *
 * The window is a fixed, transparent box with a hairline border and a giant
 * box-shadow, so everything outside it is covered by the page's ground; its
 * `inset` animates from a small centred rectangle to 0. Timers, not frames,
 * drive the phases so a throttled tab still finishes on schedule, and
 * reduced-motion visitors skip it.
 */
const OPEN = 450;   // frame has appeared; start opening
const DONE = 1900;  // fully open, border gone; unmount (the CSS opens faster on phones; the layer is invisible by then either way)

export default function FrameIntro() {
  const [phase, setPhase] = useState("closed"); // closed -> open -> done

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return undefined;
    }
    document.body.style.overflow = "hidden";
    const t1 = window.setTimeout(() => setPhase("open"), OPEN);
    const t2 = window.setTimeout(() => setPhase("done"), DONE);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase === "done") document.body.style.overflow = "";
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div className={`fintro fintro--${phase}`} aria-hidden="true">
      <div className="fintro__window" />
    </div>
  );
}
