/**
 * Fixed film-grain plate and a faint top vignette over the whole page.
 *
 * Purely decorative and pointer-transparent. It exists because large flat black
 * fields band badly on 8-bit displays; the noise dithers them and gives the
 * page a photographic surface instead of a digital one.
 */
export default function Grain() {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
    </>
  );
}
