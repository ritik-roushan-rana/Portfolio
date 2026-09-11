"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setSmoothScroll } from "@/lib/smooth-scroll";

/**
 * Owns the page's Lenis instance.
 *
 * Mounted once in the root layout rather than inside a section, so the glide is
 * consistent from the first pixel of the page to the last. Reduced-motion
 * visitors get no instance at all — `scrollToSection` falls back to native
 * smooth scrolling when none is registered, so in-page nav works either way.
 *
 * It publishes nothing per frame. An earlier version wrote the scroll velocity
 * to a custom property on <html> for the marquee; the marquee is gone, and a
 * root-level property change every frame invalidates style for the whole
 * document, which is exactly the cost the pinned project deck cannot afford.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
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

  return null;
}
