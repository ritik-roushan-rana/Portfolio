"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Tilts its children in 3D toward the cursor while hovered.
 *
 * Rotation is written to CSS custom properties and consumed by a single
 * transform in globals.css, so each pointer move costs one style write and a
 * compositor update. Disabled on touch devices and under reduced motion.
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 10,
  ...rest
}) {
  const ref = useRef(null);
  const frameRef = useRef(0);
  const enabledRef = useRef(false);

  useEffect(() => {
    enabledRef.current =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      if (!enabledRef.current) return;
      const node = ref.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      // Normalise pointer position within the element to -1..1.
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0;
        node.style.setProperty("--tilt-y", `${(px * maxTilt * 2).toFixed(2)}deg`);
        node.style.setProperty("--tilt-x", `${(-py * maxTilt * 2).toFixed(2)}deg`);
      });
    },
    [maxTilt]
  );

  const handlePointerLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
  }, []);

  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      <div className="tilt__inner">{children}</div>
    </div>
  );
}
