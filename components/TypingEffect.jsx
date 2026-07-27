"use client";

import { useEffect, useState } from "react";

/**
 * Types `text` out character by character with a blinking terminal caret.
 *
 * Renders from a slice of the source string rather than accumulating into
 * state, so a changed `text` prop restarts cleanly instead of appending to the
 * previous run. The visible span is hidden from assistive tech and the full
 * sentence is exposed once via sr-only, so screen readers are not fed a
 * partial string on every tick.
 */
export default function TypingEffect({ text, speed = 50, className = "" }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleCount(text.length);
      setIsComplete(true);
      return undefined;
    }

    setVisibleCount(0);
    setIsComplete(false);

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setVisibleCount(index);

      if (index >= text.length) {
        clearInterval(timer);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={`font-mono ${className}`}>
      <span aria-hidden="true">{text.slice(0, visibleCount)}</span>
      <span className="sr-only">{text}</span>
      <span
        aria-hidden="true"
        className={`typing-caret${isComplete ? " typing-caret--resting" : ""}`}
      >
        |
      </span>
    </span>
  );
}
