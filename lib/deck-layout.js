/**
 * Geometry for the project deck (components/site/ProjectDeck.jsx).
 *
 * Kept here, free of React and the DOM, because it is the only part of the
 * effect that can actually be wrong: the rest is a scroll listener and a few
 * style assignments. As a pure function of (index, head) it can be reasoned
 * about and tested without a browser.
 */

/** How far back the stack is drawn before extra cards stop receding. */
export const MAX_DEPTH = 3;
const SCALE_STEP = 0.035;
const RISE_STEP = 14;
const TINT_STEP = 0.26;
const MAX_TINT = 0.78;
/** How far a card travels upward as it is dealt away, in % of its own height.
    Past 100% it has cleared the frame; the extra covers the frame's top
    allowance (the rise of the stacked cards behind) plus the shadow. */
const EXIT_TRAVEL = 118;

/**
 * Which card is currently the front one.
 *
 * Both the pointer-interactivity of a card and its presence in the tab order
 * are derived from this, so the two can never disagree about which card the
 * reader is actually looking at.
 */
export function frontIndex(head) {
  return Math.round(head);
}

/**
 * `head` is a float across the deck: its integer part is the front card and
 * its fraction is how far that card has been dealt away.
 *
 * Returns the three animated properties for one card, whether it should
 * accept pointer input, and `back`: true once it is a full step or more
 * behind the front card, at which point only its top edge is visible.
 */
export function cardFrame(index, head) {
  const d = index - head;

  // Already dealt away, off the top of the stage.
  if (d <= -1) {
    return {
      transform: `translate3d(0, ${-EXIT_TRAVEL}%, 0)`,
      opacity: 0,
      tint: 0,
      interactive: false,
      back: false,
    };
  }

  // Leaving: slides up and off the top of the frame, fully opaque the whole
  // way, and is clipped by the frame (see .deck__frame). It used to fade as
  // it lifted, which laid a half-transparent card over the next one for the
  // whole hand-off and made both unreadable.
  if (d < 0) {
    const t = -d;
    return {
      transform: `translate3d(0, ${-t * EXIT_TRAVEL}%, 0)`,
      opacity: 1,
      tint: 0,
      interactive: false,
      back: false,
    };
  }

  // Waiting in the stack: narrower, higher and darker the further back it is.
  const depth = Math.min(d, MAX_DEPTH);
  return {
    transform: `translate3d(0, ${-depth * RISE_STEP}px, 0) scale(${
      1 - depth * SCALE_STEP
    })`,
    // Cards below the drawn depth are hidden rather than piling up invisibly.
    opacity: d > MAX_DEPTH + 0.5 ? 0 : 1,
    tint: Math.min(depth * TINT_STEP, MAX_TINT),
    interactive: frontIndex(head) === index,
    back: d >= 1,
  };
}

/**
 * Scroll progress through the pinned stage, as a head position.
 *
 * The wrapper reserves one viewport per card, so the usable travel is
 * (count - 1) viewports and the head runs from 0 to count - 1.
 */
export function headFromScroll({ top, height }, viewportHeight, count) {
  const travel = height - viewportHeight;
  const progress = travel > 0 ? Math.min(1, Math.max(0, -top / travel)) : 0;
  return progress * (count - 1);
}
