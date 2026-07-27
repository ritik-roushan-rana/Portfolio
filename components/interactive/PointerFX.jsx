"use client";

import { useEffect } from "react";

/**
 * Renders the crosshair reticle that replaces the native cursor, and publishes
 * the smoothed pointer position as --px / --py on <html>.
 *
 * Those variables are the single source of pointer position for the whole page:
 * the reticle and the matrix background spotlight both consume them in CSS, so
 * there is one listener and one animation frame loop no matter how many
 * effects react to the cursor. Nothing here triggers a React re-render.
 *
 * Skipped entirely on touch/coarse pointers and when the user has asked for
 * reduced motion, which also leaves the native cursor visible.
 */
export default function PointerFX() {
  useEffect(() => {
    const root = document.documentElement;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reducedMotion.matches) return undefined;

    root.classList.add("has-custom-cursor");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;

    const publish = () => {
      root.style.setProperty("--px", `${currentX.toFixed(2)}px`);
      root.style.setProperty("--py", `${currentY.toFixed(2)}px`);
    };

    // Ease toward the pointer for a slight trailing feel, then park the loop
    // once it has caught up so an idle cursor costs nothing.
    const tick = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;

      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        currentX = targetX;
        currentY = targetY;
        publish();
        frame = 0;
        return;
      }

      currentX += dx * 0.2;
      currentY += dy * 0.2;
      publish();
      frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const handleMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      root.classList.add("pointer-visible");
      wake();
    };

    // Scale the reticle over anything actionable, plus the profile photo.
    const handleOver = (event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest("a, button, [data-cursor-target]")
          : null;
      root.dataset.cursor = target ? "active" : "idle";
    };

    const handleDown = () => {
      root.dataset.cursorPressed = "true";
    };

    const handleUp = () => {
      delete root.dataset.cursorPressed;
    };

    const handleLeave = () => {
      root.classList.remove("pointer-visible");
    };

    publish();

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerover", handleOver, { passive: true });
    window.addEventListener("pointerdown", handleDown, { passive: true });
    window.addEventListener("pointerup", handleUp, { passive: true });
    document.addEventListener("pointerleave", handleLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handleOver);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointerleave", handleLeave);
      root.classList.remove("has-custom-cursor", "pointer-visible");
      delete root.dataset.cursor;
      delete root.dataset.cursorPressed;
      root.style.removeProperty("--px");
      root.style.removeProperty("--py");
    };
  }, []);

  return (
    <div className="cursor-reticle" aria-hidden="true">
      <span className="cursor-reticle__ring" />
      <span className="cursor-reticle__dot" />
      <span className="cursor-reticle__tick cursor-reticle__tick--n" />
      <span className="cursor-reticle__tick cursor-reticle__tick--s" />
      <span className="cursor-reticle__tick cursor-reticle__tick--w" />
      <span className="cursor-reticle__tick cursor-reticle__tick--e" />
    </div>
  );
}
