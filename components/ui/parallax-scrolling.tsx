"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { cn } from "@/lib/utils";
import { setSmoothScroll } from "@/lib/smooth-scroll";

/**
 * Parallax scroll transition. Layered art drifts at different rates as the
 * section crosses the viewport, so the page appears to open up between the hero
 * and the skills list. Technique adapted from Osmo's parallax layers resource;
 * the artwork here is local (see public/parallax) rather than their CDN.
 *
 * Layer order is back to front. The ratios are the original 70 / 55 / 40 / 10;
 * the absolute values are scaled down because those were tuned for a section
 * pinned at the very top of a page, where it only had to look right on the way
 * out. This section sits mid-page and is read at every scroll position, so each
 * layer is centred on its travel — it starts at -amplitude/2 and ends at
 * +amplitude/2, putting the composition dead centre when the section is centred
 * in the viewport.
 */
const LAYER_AMPLITUDES = [
  { layer: "1", amplitude: 26 },
  { layer: "2", amplitude: 20 },
  { layer: "4", amplitude: 4 },
];

/** Below 768px the same travel reads as jitter on a short viewport. */
const MOBILE_FACTOR = 0.45;

interface ParallaxComponentProps {
  /** Rendered above the art layers. This is the section's real content. */
  children?: React.ReactNode;
  /** Applied to the <section>, so nav anchors and scroll-spy can target it. */
  id?: string;
  className?: string;
}

export function ParallaxComponent({
  children,
  id,
  className,
}: ParallaxComponentProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = parallaxRef.current;
    if (!root) return;

    const triggerElement = root.querySelector<HTMLElement>(
      "[data-parallax-layers]",
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // gsap.matchMedia builds a separate context per breakpoint and reverts it
    // — killing timelines and their ScrollTriggers, and restoring inline styles
    // — when the query stops matching. That is what stops a resize from leaving
    // desktop-sized transforms on a phone-sized layout.
    const mm = gsap.matchMedia();

    if (triggerElement) {
      const build = (factor: number) => () => {
        // 1. The drift itself, scrubbed to scroll position.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerElement,
            // The source used "0% 0%" to "100% 0%", which only animates while
            // the section leaves upward — fine at the top of a page, but it
            // leaves a mid-page section frozen on the way in. Spanning the full
            // pass keeps it moving the whole time it is on screen.
            start: "top bottom",
            end: "bottom top",
            scrub: 0,
            invalidateOnRefresh: true,
          },
        });

        LAYER_AMPLITUDES.forEach((layerObj, idx) => {
          const nodes = triggerElement.querySelectorAll(
            `[data-parallax-layer="${layerObj.layer}"]`,
          );
          if (!nodes.length) return;

          const travel = layerObj.amplitude * factor;

          tl.fromTo(
            nodes,
            { yPercent: -travel / 2 },
            { yPercent: travel / 2, ease: "none" },
            // Every layer shares one timeline position, so they scrub together
            // rather than in sequence.
            idx === 0 ? undefined : "<",
          );
        });
      };

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        build(1),
      );
      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        build(MOBILE_FACTOR),
      );
    }

    // Smooth scrolling. Skipped for reduced-motion visitors, who keep the
    // browser's own scrolling; scrollToSection() falls back to native smooth
    // scroll when no instance is registered, so the nav works either way.
    let lenis: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;

    if (!reducedMotion) {
      lenis = new Lenis({
        // Slightly softer than the 0.1 default: the glide is the point here.
        lerp: 0.085,
        smoothWheel: true,
      });
      setSmoothScroll(lenis);

      const activeLenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);

      tickerCallback = (time: number) => {
        activeLenis.raf(time * 1000);
      };
      gsap.ticker.add(tickerCallback);
      // GSAP's lag smoothing would fight Lenis during heavy frames.
      gsap.ticker.lagSmoothing(0);
    }

    return () => {
      mm.revert();

      // The source never removed its ticker callback, so each effect re-run
      // leaked another per-frame closure.
      if (tickerCallback) gsap.ticker.remove(tickerCallback);
      gsap.ticker.lagSmoothing(500, 33);

      if (lenis) {
        lenis.destroy();
        setSmoothScroll(null);
      }
    };
  }, []);

  return (
    <div ref={parallaxRef} className="parallax relative">
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
        <div data-parallax-layers className="absolute inset-0 z-0">
          {/* Layer 1 — distant grid field, drifts most */}
          <div
            data-parallax-layer="1"
            aria-hidden="true"
            className="absolute inset-x-0 -top-[30%] h-[160%] bg-[url('/parallax/layer-3.svg')] bg-cover bg-center bg-no-repeat opacity-90 will-change-transform"
          />

          {/* Layer 2 — circuit traces and hex nodes */}
          <div
            data-parallax-layer="2"
            aria-hidden="true"
            className="absolute inset-x-0 -top-[30%] h-[160%] bg-[url('/parallax/layer-2.svg')] bg-cover bg-center bg-no-repeat will-change-transform"
          />

          {/* Layer 4 — foreground ridge, nearly locked to the page */}
          <div
            data-parallax-layer="4"
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-[10%] h-[85%] bg-[url('/parallax/layer-1.svg')] bg-cover bg-bottom bg-no-repeat will-change-transform"
          />
        </div>

        {/* Blends the ridge into the page ground so the next section starts on
            flat colour instead of a hard cut. Sits above the art but below the
            content, so it never dims the cards. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/4 bg-gradient-to-b from-transparent via-[#0a0514]/80 to-[#0a0514]"
        />

        {/* The real section content, above every art layer. Deliberately not a
            parallax layer itself: drifting the cards by a fraction of their own
            height hurts readability and can overlap neighbouring sections. */}
        <div className="relative z-10 w-full">{children}</div>
      </section>
    </div>
  );
}

export default ParallaxComponent;
