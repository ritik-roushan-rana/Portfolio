/**
 * The site's mark: a network converging 3 → 2 → 1.
 *
 * A logo for a machine learning engineer should be the thing itself rather
 * than a picture of a robot, so this is an actual architecture — three inputs
 * narrowing through a hidden layer to a single output, the output node filled
 * because that is the one the model produces.
 *
 * It is drawn on a 32-unit grid and sized entirely by the width the caller
 * gives it, so the same component is a 20px glyph in the header and a 3rem
 * symbol over the hero. Nothing here is boxed or framed — it sits directly on
 * whatever is behind it.
 *
 * With `animated`, a signal runs the edges left to right: a permanent hairline
 * per edge with a dashed overlay swept across it, so the architecture is
 * always legible and only the pulse moves.
 */

const LAYERS = [
  { x: 5, ys: [6, 16, 26] },
  { x: 16, ys: [11, 21] },
  { x: 27, ys: [16] },
];

const EDGES = LAYERS.flatMap((layer, l) => {
  const next = LAYERS[l + 1];
  if (!next) return [];
  return layer.ys.flatMap((y1) =>
    next.ys.map((y2) => ({ x1: layer.x, y1, x2: next.x, y2 }))
  );
});

export default function Mark({ className = "", animated = false, title }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`mark ${animated ? "mark--live" : ""} ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
    >
      {EDGES.map((edge, i) => (
        <line
          key={`w${i}`}
          className="mark__wire"
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
        />
      ))}

      {animated
        ? EDGES.map((edge, i) => (
            <line
              key={`p${i}`}
              className="mark__pulse"
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              // Layer by layer: the second hop fires after the first, so the
              // signal reads as travelling through the network rather than
              // flashing all at once.
              style={{ animationDelay: `${(i < 6 ? 0 : 0.42) + (i % 3) * 0.14}s` }}
            />
          ))
        : null}

      {LAYERS.flatMap((layer, l) =>
        layer.ys.map((y) => (
          <circle
            key={`${l}-${y}`}
            className={
              l === LAYERS.length - 1 ? "mark__node mark__node--out" : "mark__node"
            }
            cx={layer.x}
            cy={y}
            r="2.4"
          />
        ))
      )}
    </svg>
  );
}
