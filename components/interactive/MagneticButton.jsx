"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../ui/Button";

let rippleId = 0;

/**
 * Wraps the existing Button so styling and props carry over unchanged, adding:
 *  - a magnetic pull that nudges the button toward the cursor
 *  - an expanding ripple from the click point
 *
 * The pull is applied to a wrapper via transform only, so the button never
 * changes size and surrounding layout is untouched. Listeners live on the
 * wrapper rather than the window, so cost scales with buttons actually hovered.
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 0.28,
  maxOffset = 10,
  onClick,
  ...buttonProps
}) {
  const wrapperRef = useRef(null);
  const frameRef = useRef(0);
  const enabledRef = useRef(false);
  const [ripples, setRipples] = useState([]);

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
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);

      const clamp = (value) =>
        Math.max(-maxOffset, Math.min(maxOffset, value * strength));

      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0;
        wrapper.style.transform = `translate3d(${clamp(offsetX).toFixed(2)}px, ${clamp(
          offsetY
        ).toFixed(2)}px, 0)`;
      });
    },
    [maxOffset, strength]
  );

  const handlePointerLeave = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    wrapper.style.transform = "translate3d(0, 0, 0)";
  }, []);

  const handleClick = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const id = ++rippleId;

      setRipples((current) => [
        ...current,
        {
          id,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      ]);

      onClick?.(event);
    },
    [onClick]
  );

  const removeRipple = useCallback((id) => {
    setRipples((current) => current.filter((ripple) => ripple.id !== id));
  }, []);

  return (
    <span
      ref={wrapperRef}
      className="magnetic"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Button
        {...buttonProps}
        onClick={handleClick}
        className={`magnetic__button ${className}`}
      >
        {children}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="magnetic__ripple"
            style={{ left: ripple.x, top: ripple.y }}
            onAnimationEnd={() => removeRipple(ripple.id)}
          />
        ))}
      </Button>
    </span>
  );
}
