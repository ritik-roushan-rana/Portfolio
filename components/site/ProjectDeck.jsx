"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Github,
  X,
} from "lucide-react";
import { cardFrame, frontIndex, headFromScroll } from "@/lib/deck-layout";
import { getSmoothScroll } from "@/lib/smooth-scroll";

/**
 * Projects as a deck of cards on a pinned stage.
 *
 * The section reserves one viewport of scroll per project. While the reader
 * moves through it the stage stays pinned and the cards are dealt: the front
 * card lifts away and fades, and the one behind it grows to full width, loses
 * its tint and takes its place. Cards further back sit progressively narrower,
 * higher and darker, so the stack reads as a physical pile with a visible
 * depth order rather than a carousel.
 *
 * The geometry itself lives in lib/deck-layout.js as a pure function of
 * (index, head) so it can be reasoned about and tested without a browser; this
 * file is only the wiring. Transforms are written straight to the card nodes
 * inside a rAF-throttled scroll handler. Position changes on every frame of a scroll, and putting a
 * float in React state would re-render four cards sixty times a second for a
 * value nothing else reads. Only the *front index* is tracked in a ref, and
 * only when it changes are the focusability attributes updated — those are
 * discrete, so they do not belong in the per-frame path.
 *
 * Below the pinning breakpoint, and for reduced motion, the loop never starts:
 * CSS lays the same markup out as an ordinary vertical list of cards.
 */

/**
 * A card's art panel: the app running in a frame on the project's wash.
 *
 * The frame follows the screens: `frame: "browser"` for landscape desktop
 * captures, a portrait phone otherwise. A desktop dashboard forced into a 9:19
 * phone is a crop, not a presentation.
 *
 * With more than one screen the frame becomes a swipeable gallery. The track
 * is a native scroll-snap container rather than a drag implementation — that
 * gives real touch momentum, trackpad gestures and keyboard scrolling for
 * free, and there is no drag maths to get wrong. React only observes where the
 * scroll landed so the dots and the caption can follow; it never drives it.
 *
 * Shots that fail to load are dropped individually, and a project whose shots
 * all fail falls back to the wash and glyph, so a missing or misnamed file can
 * never produce a broken-image icon.
 */
function DeckArt({ project }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState(() => new Set());

  const shots = (project.shots || []).filter((_, i) => !broken.has(i));
  const active = Math.min(index, Math.max(0, shots.length - 1));
  const isBrowser = project.frame === "browser";

  // The browser owns the scroll; this only observes which slide it settled on,
  // so the dots and caption can follow. An IntersectionObserver rather than a
  // scroll listener: no per-frame arithmetic, no throttling to get right, and
  // it reports the slide that is actually showing rather than one inferred
  // from a scroll offset.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const slides = Array.from(track.children);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = slides.indexOf(entry.target);
          if (i !== -1) setIndex(i);
        });
      },
      { root: track, threshold: 0.55 }
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [shots.length]);

  const goTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(shots.length - 1, i));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  };

  if (!shots.length) {
    return (
      <div className="deck__art" style={{ background: project.wash }}>
        <span className="deck__artgrid" aria-hidden="true" />
        <project.icon className="deck__glyph" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={`deck__art deck__art--shot ${isBrowser ? "deck__art--wide" : ""}`}
      style={{ background: project.wash }}
    >
      <span className="deck__artgrid" aria-hidden="true" />

      <div className={`deck__shot ${isBrowser ? "deck__shot--browser" : ""}`}>
        {isBrowser ? (
          <span className="deck__chrome" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        ) : null}
        <div
          ref={trackRef}
          className="shot__track"
          // Lenis owns the page's wheel; without this it swallows gestures
          // aimed at this scroller. Touch is left alone so a vertical drag on
          // the phone still scrolls the page.
          data-lenis-prevent-wheel="true"
          role="group"
          aria-label={`${project.title} screens`}
        >
          {shots.map((shot, i) => (
            <div key={shot.src} className="shot__slide">
              <Image
                src={shot.src}
                alt={`${project.title} — ${shot.label}`}
                fill
                sizes={
                  isBrowser
                    ? "(max-width: 899px) 82vw, 34rem"
                    : "(max-width: 899px) 45vw, 14rem"
                }
                className="shot__img"
                style={
                  project.focus ? { objectPosition: project.focus } : undefined
                }
                // Decode off the main thread: a synchronous decode of a large
                // screenshot lands as a dropped frame mid-scroll.
                decoding="async"
                // Only the first screen is visible until someone swipes, and
                // these are ~330KB each — seven eager loads would be 2.3MB of
                // PNG for one card nobody has interacted with yet.
                loading={i === 0 ? "eager" : "lazy"}
                onError={() =>
                  setBroken((prev) => new Set(prev).add(i))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {shots.length > 1 ? (
        <>
          {/* Pointer devices get arrows; touch has the swipe itself. */}
          <button
            type="button"
            className="shot__arrow shot__arrow--prev"
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
            aria-label="Previous screen"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="shot__arrow shot__arrow--next"
            onClick={() => goTo(active + 1)}
            disabled={active === shots.length - 1}
            aria-label="Next screen"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="shot__foot">
            <span className="shot__label">{shots[active]?.label}</span>
            <div className="shot__dots">
              {shots.map((shot, i) => (
                <button
                  key={shot.src}
                  type="button"
                  className={`shot__dot ${i === active ? "shot__dot--on" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Show ${shot.label}`}
                  aria-current={i === active ? "true" : undefined}
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * Every project at once, in a panel that slides in from the right.
 *
 * The deck is deliberately one-at-a-time; this is the counterpart for someone
 * who wants the whole body of work on one screen. It is a modal dialog, so it
 * takes focus, closes on Escape and on the backdrop, and returns focus to the
 * button that opened it.
 *
 * It is portalled to <body>, which a modal needs to be here for two separate
 * reasons. `position: fixed` resolves against the nearest ancestor with a
 * transform or will-change, and the cards declare `will-change: transform`.
 * And .section sets `isolation: isolate`, so any z-index inside it is scoped
 * to that section — at z-index 200 the panel still rendered *underneath* the
 * fixed header, which sits at z-index 90 but at document level.
 */
function AllProjects({ projects, open, onClose, returnFocusRef }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  // Portals need a DOM target, which does not exist during the server render.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return undefined;

    // Lenis owns the page scroll, so an overflow lock alone would not stop it.
    const lenis = getSmoothScroll();
    lenis?.stop();
    document.body.style.overflow = "hidden";

    // Captured now, not in cleanup: by the time cleanup runs the ref may point
    // somewhere else, and this is the element focus has to return to.
    const returnTo = returnFocusRef?.current || document.activeElement;
    closeRef.current?.focus();

    const onKey = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      // Keep tabbing inside the dialog while it is open.
      const focusable = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
      if (returnTo instanceof HTMLElement) returnTo.focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!mounted) return null;

  return createPortal(
    <div className={`allp ${open ? "allp--open" : ""}`} aria-hidden={!open}>
      <button
        type="button"
        className="allp__scrim"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="allp__panel"
        role="dialog"
        aria-modal="true"
        aria-label="All projects"
      >
        <header className="allp__bar">
          <p className="eyebrow">All projects — {projects.length}</p>
          <div className="allp__esc">
            <span>
              <span className="allp__key">Esc</span> to close
            </span>
            <button
              ref={closeRef}
              type="button"
              className="allp__close"
              onClick={onClose}
              aria-label="Close all projects"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <ul className="allp__grid">
          {projects.map((project, i) => {
            const shot = project.shots?.[0];
            return (
              <li key={project.title} className="allp__cell">
                <div
                  className={`allp__art ${
                    project.frame === "browser" ? "allp__art--wide" : ""
                  }`}
                  style={{ background: project.wash }}
                >
                  {shot ? (
                    <Image
                      src={shot.src}
                      alt={`${project.title} — ${shot.label}`}
                      fill
                      sizes="(max-width: 899px) 90vw, 26rem"
                      className="allp__img"
                      // Filling the tile means cropping; `focus` says which
                      // edge must survive it. Fact Knowledge Layer's nav sits
                      // hard against the left, so a centred crop eats it.
                      style={
                        project.focus
                          ? { objectPosition: project.focus }
                          : undefined
                      }
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <project.icon className="allp__glyph" aria-hidden="true" />
                  )}
                </div>

                <span className="allp__num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="allp__title">{project.title}</h3>
                <p className="allp__meta">{project.meta}</p>
                <p className="allp__desc">{project.summary}</p>

                <div className="allp__links">
                  {project.demo ? (
                    <a
                      className="link-u"
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View project
                    </a>
                  ) : null}
                  {project.github ? (
                    <a
                      className="link-u"
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-1 inline h-3.5 w-3.5" />
                      Code
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body
  );
}

/**
 * `projects` are the cards the deck deals; `all` is everything the "See all"
 * panel lists. They differ because the deck costs a viewport of scroll per
 * card, so it stays curated while the panel can hold the whole shelf.
 */
export default function ProjectDeck({ projects, all = projects }) {
  const wrapRef = useRef(null);
  const cardRefs = useRef([]);
  const frontRef = useRef(-1);
  // Cached wrapper geometry and the last values written to each card, so the
  // per-frame path neither reads layout nor writes styles that have not moved.
  const geomRef = useRef({ top: 0, height: 0 });
  const lastRef = useRef([]);
  // The card currently at the front, mirrored into state for the index rail.
  // It changes at most three times across the whole section, so unlike the
  // per-frame transforms it is cheap to keep in React.
  const [front, setFront] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const seeAllRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const motionOk = window.matchMedia(
      "(min-width: 900px) and (prefers-reduced-motion: no-preference)"
    );

    let frameId = 0;
    let running = false;

    // Discrete state: only the front card is interactive, so the others are
    // taken out of the tab order and the accessibility tree.
    const applyFront = (index) => {
      if (frontRef.current === index) return;
      frontRef.current = index;
      setFront(index);
      cardRefs.current.forEach((node, i) => {
        if (!node) return;
        const isFront = i === index;
        node.setAttribute("aria-hidden", isFront ? "false" : "true");
        node
          .querySelectorAll("a")
          .forEach((a) => a.setAttribute("tabindex", isFront ? "0" : "-1"));
      });
    };

    // Measured on mount and on resize only. Calling getBoundingClientRect in
    // the scroll handler forces a synchronous layout on every frame; the
    // wrapper's position only actually changes when the page reflows.
    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      geomRef.current = {
        top: rect.top + window.scrollY,
        height: rect.height,
      };
    };

    // The scroll position is passed in when Lenis drives the update (below),
    // and read from the window when a native scroll event does.
    const layout = (scrollY = window.scrollY) => {
      frameId = 0;
      const { top, height } = geomRef.current;
      const head = headFromScroll(
        { top: top - scrollY, height },
        window.innerHeight,
        projects.length
      );

      cardRefs.current.forEach((node, i) => {
        if (!node) return;
        const frame = cardFrame(i, head);
        const last = lastRef.current[i] || {};

        // Assigning an identical value still costs a style recalculation, and
        // opacity and tint are floats that rarely land on the same number —
        // but transform and pointer-events often do.
        if (frame.transform !== last.transform) {
          node.style.transform = frame.transform;
          last.transform = frame.transform;
        }
        if (frame.opacity !== last.opacity) {
          node.style.opacity = `${frame.opacity}`;
          last.opacity = frame.opacity;
        }
        if (frame.tint !== last.tint) {
          node.style.setProperty("--tint", `${frame.tint}`);
          last.tint = frame.tint;
        }
        if (frame.interactive !== last.interactive) {
          node.style.pointerEvents = frame.interactive ? "auto" : "none";
          last.interactive = frame.interactive;
        }
        // A card a full step or more behind the front shows only its top
        // edge, so its gallery and copy are not drawn at all: that is three
        // fewer sets of screenshots, scrollers and shadows to composite on
        // every frame. It is switched back on the instant it starts to come
        // forward, while it is still almost entirely covered.
        if (frame.back !== last.back) {
          node.classList.toggle("deck__card--back", frame.back);
          last.back = frame.back;
        }

        lastRef.current[i] = last;
      });

      applyFront(frontIndex(head));
    };

    const onScroll = () => {
      if (!frameId) frameId = requestAnimationFrame(() => layout());
    };

    // With Lenis the cards are updated from inside its own rAF tick, in the
    // same frame and with the exact position it has just scrolled to. Waiting
    // for the native scroll event instead means the sticky stage moves this
    // frame and the cards catch up on the next: a one-frame lag between the
    // stage and the deck on it, visible as a faint judder while pinned.
    const onLenis = ({ scroll }) => layout(scroll);
    let lenis = null;

    const onResize = () => {
      measure();
      onScroll();
    };

    const reset = () => {
      cardRefs.current.forEach((node) => {
        if (!node) return;
        node.style.cssText = "";
        lastRef.current = [];
        node.setAttribute("aria-hidden", "false");
        node.querySelectorAll("a").forEach((a) => a.removeAttribute("tabindex"));
      });
      frontRef.current = -1;
    };

    const sync = () => {
      if (motionOk.matches && !running) {
        running = true;
        measure();
        layout();
        lenis = getSmoothScroll();
        if (lenis) lenis.on("scroll", onLenis);
        else window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize, { passive: true });
      } else if (!motionOk.matches && running) {
        running = false;
        if (lenis) lenis.off("scroll", onLenis);
        lenis = null;
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
        reset();
      }
    };

    sync();
    motionOk.addEventListener("change", sync);

    return () => {
      motionOk.removeEventListener("change", sync);
      if (lenis) lenis.off("scroll", onLenis);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [projects.length]);

  // Where the stage has to be scrolled to for card `i` to be at the front.
  const goToCard = (i) => {
    const { top, height } = geomRef.current;
    const travel = height - window.innerHeight;
    if (travel <= 0) return;
    const target = top + (i / Math.max(1, projects.length - 1)) * travel;
    const lenis = getSmoothScroll();
    if (lenis) lenis.scrollTo(target);
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <div
      ref={wrapRef}
      className="deck"
      // One viewport of scroll per project: the last card rests on screen for
      // the final one, so the travel is (n - 1) viewports.
      style={{ "--deck-count": projects.length }}
    >
      <div className="deck__stage">
        {/* Every project, listed, with the one on top lit — so the section
            shows the whole body of work rather than only the card in front,
            and any of them can be jumped to directly. */}
        <nav className="deck__index" aria-label="Projects">
          <ol className="deck__index-list">
            {projects.map((project, i) => (
              <li key={project.title}>
                <button
                  type="button"
                  className={`deck__index-item ${
                    i === front ? "deck__index-item--on" : ""
                  }`}
                  onClick={() => goToCard(i)}
                  aria-current={i === front ? "true" : undefined}
                >
                  <span className="deck__index-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="deck__index-name">{project.title}</span>
                </button>
              </li>
            ))}
            <li>
              <button
                ref={seeAllRef}
                type="button"
                className="deck__index-item deck__index-more"
                onClick={() => setShowAll(true)}
              >
                See all
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </li>
          </ol>
          <span
            className="deck__index-bar"
            aria-hidden="true"
            style={{
              "--deck-progress": projects.length > 1
                ? front / (projects.length - 1)
                : 0,
            }}
          />
        </nav>

        <div className="deck__frame">
          {projects.map((project, index) => (
            <article
              key={project.title}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className="deck__card"
              style={{ zIndex: projects.length - index }}
            >
              <DeckArt project={project} />

              <div className="deck__body">
                <span className="deck__index">
                  {String(index + 1).padStart(2, "0")}
                  <i>/</i>
                  {String(projects.length).padStart(2, "0")}
                </span>

                <h3 className="deck__title">{project.title}</h3>
                <p className="deck__meta">{project.meta}</p>
                <p className="deck__desc">{project.summary}</p>

                <dl className="deck__stats">
                  {project.stats.map((stat) => (
                    <div key={stat.label} className="deck__stat">
                      <dt>{stat.label}</dt>
                      <dd>{stat.value}</dd>
                    </div>
                  ))}
                </dl>

                {/* A project without a live demo gets one button pointing at
                    its code, not two buttons pointing at the same URL. */}
                <div className="deck__actions">
                  {project.demo ? (
                    <a
                      className="btn btn--solid"
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="Open"
                    >
                      View project
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : null}
                  {project.github ? (
                    <a
                      className={`btn ${project.demo ? "" : "btn--solid"}`}
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="Code"
                    >
                      <Github className="h-4 w-4" />
                      {project.demo ? "Source" : "View code"}
                      {project.demo ? null : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </a>
                  ) : null}
                </div>
              </div>

              <span className="deck__tint" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>

      <AllProjects
        projects={all}
        open={showAll}
        onClose={() => setShowAll(false)}
        returnFocusRef={seeAllRef}
      />
    </div>
  );
}
