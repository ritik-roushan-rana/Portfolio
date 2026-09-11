"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Two-part pointer: a dot pinned to the real cursor position and a ring that
 * eases toward it a few frames behind. The lag is what sells it — a ring that
 * tracks exactly just looks like a bigger cursor.
 *
 * Any element carrying `data-cursor` enlarges the ring while hovered, and the
 * attribute's value (if any) is shown as a label inside it, so a card can say
 * "VIEW" without needing its own hover chrome.
 *
 * Positions are written straight to the DOM inside the rAF loop rather than
 * held in state: this runs every frame, and re-rendering React 60 times a
 * second to move two absolutely-positioned elements would be wasteful.
 */
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return undefined;

    setEnabled(true);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { ...target };
    let frameId = 0;

    const onMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;

      const dot = dotRef.current;
      if (dot) {
        dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      }
    };

    // Delegated rather than per-element listeners, so markup added later (or
    // conditionally rendered) picks up the behaviour with no extra wiring.
    const onOver = (event) => {
      const hit = event.target.closest("[data-cursor], a, button");
      if (!hit) return;
      const node = ringRef.current;
      if (node) node.dataset.state = "hover";
      setLabel(hit.getAttribute("data-cursor") || "");
    };

    const onOut = (event) => {
      if (event.relatedTarget && event.relatedTarget.closest?.("[data-cursor], a, button")) {
        return;
      }
      const node = ringRef.current;
      if (node) node.dataset.state = "idle";
      setLabel("");
    };

    const tick = () => {
      ring.x += (target.x - ring.x) * 0.16;
      ring.y += (target.y - ring.y) * 0.16;
      const node = ringRef.current;
      if (node) {
        node.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" data-state="idle" aria-hidden="true">
        <span className="cursor-ring__label">{label}</span>
      </div>
    </>
  );
}
