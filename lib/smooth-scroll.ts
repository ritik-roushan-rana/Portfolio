import type Lenis from "lenis";

/**
 * Single shared reference to the Lenis instance created by
 * components/ui/parallax-scrolling.tsx.
 *
 * Why this exists: Lenis animates the document's scroll position itself, so a
 * native `scrollIntoView({ behavior: "smooth" })` running at the same time
 * fights it — both try to own scrollTop and the jump stalls or snaps. Every
 * in-page jump goes through `scrollToSection` below, which hands the work to
 * Lenis when it is active and falls back to native smooth scrolling when it is
 * not (reduced-motion visitors, or before the parallax section mounts).
 */
let lenisInstance: Lenis | null = null;

export function setSmoothScroll(instance: Lenis | null) {
  lenisInstance = instance;
}

export function getSmoothScroll() {
  return lenisInstance;
}

/**
 * Scrolls a section into view by id, equivalent to `block: "start"` — matching
 * the behaviour the nav had before Lenis was introduced.
 */
export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  if (lenisInstance) {
    lenisInstance.scrollTo(element);
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "start" });
}
