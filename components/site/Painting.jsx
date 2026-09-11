/**
 * The painting that fills the hero.
 *
 * A single full-bleed image, cropped with `object-fit: cover` so the horizon
 * stays roughly two-thirds down on any viewport, scrolling with the hero like
 * the rest of the page. The scrim at the foot sits on the hero's bottom edge
 * and dissolves the meadow into the next section.
 * The artwork lives in /public/hero, so swapping the piece is a matter of
 * replacing one file.
 */
export default function Painting({ src = "/hero/meadow.avif" }) {
  return (
    <>
      <div className="painting" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="painting__img" src={src} alt="" decoding="async" fetchPriority="high" />
      </div>
      <div className="painting__fade" aria-hidden="true" />
    </>
  );
}
