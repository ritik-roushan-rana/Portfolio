"use client";

import { useEffect } from "react";

/**
 * Spring tuning: settles in roughly 150-200ms with a trace of overshoot, so
 * followers feel weighted rather than glued to the pointer.
 */
const STIFFNESS = 0.14;
const DAMPING = 0.78;

/**
 * Publishes the eased pointer position on <html> and renders nothing.
 *
 * Two representations are written each frame:
 *   --px / --py    viewport pixels, consumed by the spotlight layers
 *   --pnx / --pny  normalised -1..1 from viewport centre, consumed by the
 *                  profile photo parallax
 *
 * Everything cursor-reactive on the page reads these, so there is exactly one
 * listener and one animation frame loop regardless of how many effects follow
 * the cursor. Nothing here triggers a React re-render, and the loop parks
 * itself once the spring settles so an idle pointer costs nothing.
 *
 * The native cursor is left untouched. Inactive on coarse pointers and under
 * reduced motion.
 */
export default function PointerTracker() {
  useEffect(() => {
    const root = document.documentElement;
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reducedMotion.matches) return undefined;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let velocityX = 0;
    let velocityY = 0;
    let frame = 0;

    const publish = () => {
      root.style.setProperty("--px", `${currentX.toFixed(2)}px`);
      root.style.setProperty("--py", `${currentY.toFixed(2)}px`);

      // Normalised to -1..1 so CSS can scale it into px and deg itself.
      const nx = (currentX / window.innerWidth) * 2 - 1;
      const ny = (currentY / window.innerHeight) * 2 - 1;
      root.style.setProperty("--pnx", nx.toFixed(4));
      root.style.setProperty("--pny", ny.toFixed(4));
    };

    const tick = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;

      velocityX = (velocityX + dx * STIFFNESS) * DAMPING;
      velocityY = (velocityY + dy * STIFFNESS) * DAMPING;

      currentX += velocityX;
      currentY += velocityY;

      const settled =
        Math.abs(dx) < 0.05 &&
        Math.abs(dy) < 0.05 &&
        Math.abs(velocityX) < 0.05 &&
        Math.abs(velocityY) < 0.05;

      if (settled) {
        currentX = targetX;
        currentY = targetY;
        velocityX = 0;
        velocityY = 0;
        publish();
        frame = 0;
        return;
      }

      publish();
      frame = requestAnimationFrame(tick);
    };

    // Pointer events are already coalesced to roughly one per frame, so the
    // handler only records the target; the loop does the work.
    const handleMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      root.classList.add("pointer-active");
      if (!frame) frame = requestAnimationFrame(tick);
    };

    publish();
    window.addEventListener("pointermove", handleMove, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      root.classList.remove("pointer-active");
      ["--px", "--py", "--pnx", "--pny"].forEach((prop) =>
        root.style.removeProperty(prop)
      );
    };
  }, []);

  return null;
}
