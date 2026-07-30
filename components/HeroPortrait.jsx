import Image from "next/image";

const PHOTO_SRC = "/profile-photo.jpeg";
const ALT = "Ritik Roushan Rana";

/**
 * Editorial hero portrait.
 *
 * Deliberately minimal: a hard-cropped duotone portrait with generous negative
 * space and a few geometric accents. No rotation, no frame chrome, no colour -
 * the green/cyan accent is reserved for links and buttons elsewhere, so
 * everything here stays strictly grayscale for contrast against the page.
 *
 * Framing is driven by two custom properties on .portrait so the crop can be
 * nudged without touching markup:
 *   --portrait-focus  the point held fixed while zooming (x y)
 *   --portrait-zoom   scale factor, to pull a chest-up crop from a wider shot
 */
export default function HeroPortrait() {
  return (
    <div className="portrait">
      <div className="portrait__frame">
        <Image
          src={PHOTO_SRC}
          alt={ALT}
          fill
          priority
          sizes="(max-width: 1024px) 78vw, 30rem"
          className="portrait__img"
        />
        {/* Crushes the shadows and sinks the lower edge into the page */}
        <span className="portrait__levels" aria-hidden="true" />
      </div>

      {/* Geometric accents, kept clear of the face */}
      <span className="portrait__sq portrait__sq--a" aria-hidden="true" />
      <span className="portrait__sq portrait__sq--b" aria-hidden="true" />
      <span className="portrait__sq portrait__sq--c" aria-hidden="true" />
      <span className="portrait__sq portrait__sq--d" aria-hidden="true" />
      <span className="portrait__sq portrait__sq--e" aria-hidden="true" />
      <span className="portrait__sq portrait__sq--f" aria-hidden="true" />
    </div>
  );
}
