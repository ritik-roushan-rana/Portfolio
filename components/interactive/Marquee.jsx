/**
 * Seamless auto-scrolling strip of tool names.
 *
 * The list is rendered twice and the track translates by exactly -50%, so the
 * second copy lands where the first began and the loop has no visible seam.
 * Pure CSS animation, so it runs on the compositor with no JS.
 *
 * Decorative and duplicated, hence aria-hidden: the same tools are listed in
 * the Skills section.
 */
export default function Marquee({
  items,
  speed = 36,
  reverse = false,
  className = "",
}) {
  const doubled = [...items, ...items];

  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div
        className="marquee__track"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {doubled.map((item, index) => (
          <span className="marquee__item" key={`${item}-${index}`}>
            {item}
            <span className="marquee__sep" aria-hidden="true">
              {"//"}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
