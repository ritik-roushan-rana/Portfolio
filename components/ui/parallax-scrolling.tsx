"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { cn } from "@/lib/utils";
import { setSmoothScroll } from "@/lib/smooth-scroll";

/**
 * Section shell with a full-bleed background slot, plus the host for the page's
 * Lenis smooth scrolling.
 *
 * This previously stacked three drifting SVG art layers (a GSAP ScrollTrigger
 * parallax). Those were removed: the section's background is now a single
 * full-bleed element passed via `background` — currently AnimatedGradient — with
 * nothing layered over it. The layer-drift timeline went with them, since it had
 * no targets left, which is also why gsap and ScrollTrigger are no longer
 * imported here. Lenis is driven by its own requestAnimationFrame loop instead
 * of gsap.ticker.
 */
interface ParallaxComponentProps {
  /** Rendered above the background. This is the section's real content. */
  children?: React.ReactNode;
  /**
   * Rendered as the section's only background layer, filling it. Intended for a
   * full-bleed element such as AnimatedGradient.
   */
  background?: React.ReactNode;
  /** Applied to the <section>, so nav anchors and scroll-spy can target it. */
  id?: string;
  className?: string;
}

export function ParallaxComponent({
  children,
  background,
  id,
  className,
}: ParallaxComponentProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Reduced-motion visitors keep the browser's own scrolling.
    // scrollToSection() falls back to native smooth scroll when no instance is
    // registered, so in-page nav works either way.
    if (reducedMotion) return;

    const lenis = new Lenis({
      // Slightly softer than the 0.1 default: the glide is the point here.
      lerp: 0.085,
      smoothWheel: true,
    });
    setSmoothScroll(lenis);

    let frameId = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      setSmoothScroll(null);
    };
  }, []);

  return (
    <div ref={parallaxRef} className="relative">
      {/* Height is content-driven with a viewport floor, rather than a fixed
          100svh: the children are a real section and would be clipped by
          overflow-hidden on a short viewport. */}
      <section
        id={id}
        className={cn(
          "relative isolate min-h-svh w-full overflow-hidden py-16 sm:py-24",
          className,
        )}
      >
        {/* The section's only background layer. */}
        {background}

        {/* Blends the background's bottom edge into the page ground so the next
            section starts on flat colour instead of a hard cut. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/4 bg-gradient-to-b from-transparent via-[#0a0514]/80 to-[#0a0514]"
        />

        {/* Content, above the background. */}
        <div className="relative z-10 w-full">{children}</div>
      </section>
    </div>
  );
}

export default ParallaxComponent;
