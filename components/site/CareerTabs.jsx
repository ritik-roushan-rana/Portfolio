"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Experience as a master–detail: every role listed down the left, the selected
 * one opened on the right.
 *
 * The stack of sticky cards this replaces showed one role at a time and made
 * the reader scroll to discover the rest. Here the whole history is a single
 * glance — org, title, years — and the detail pane answers "what did you
 * actually do there" without leaving the section. Each point opens with a
 * bold lead-in so the pane can be skimmed as a list of outcomes before it is
 * read as prose.
 *
 * A real tablist: arrow keys move between roles, the pane is labelled by its
 * tab, and only the active tab sits in the tab order. Below the breakpoint the
 * rail turns into a horizontal strip above the pane rather than a second
 * accordion markup — one DOM, one set of content.
 */
export default function CareerTabs({ items, id = "career" }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);
  // A fixed prefix rather than useId(): the ids only need to be unique on
  // the page (there is one of these), and useId's tree-position-derived
  // value came out different on the server and the client in dev, which
  // logged a hydration mismatch on every load.
  const baseId = id;

  // Re-run the pane's entrance whenever the selection changes. A key on the
  // pane would remount it; toggling a class keeps the node and just replays
  // the animation.
  const paneRef = useRef(null);
  useEffect(() => {
    const node = paneRef.current;
    if (!node) return;
    node.classList.remove("ctabs__pane--in");
    // Force the class removal to commit before it is re-added.
    void node.offsetWidth;
    node.classList.add("ctabs__pane--in");
  }, [active]);

  const onKey = (event, i) => {
    const last = items.length - 1;
    let next = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = i === last ? 0 : i + 1;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const current = items[active];

  return (
    <div className="ctabs">
      <div
        className="ctabs__rail"
        role="tablist"
        aria-orientation="vertical"
        aria-label="Roles"
      >
        {items.map((item, i) => {
          const on = i === active;
          return (
            <button
              key={item.title}
              ref={(node) => {
                tabRefs.current[i] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${baseId}-pane`}
              tabIndex={on ? 0 : -1}
              className={`ctabs__tab ${on ? "ctabs__tab--on" : ""}`}
              onClick={() => setActive(i)}
              onKeyDown={(event) => onKey(event, i)}
            >
              <span className="ctabs__node" aria-hidden="true" />
              <span className="ctabs__org">
                {item.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="ctabs__org-logo" src={item.logo} alt="" />
                ) : null}
                {item.org}
              </span>
              <span className="ctabs__role">{item.title}</span>
              <span className="ctabs__when">{item.years}</span>
            </button>
          );
        })}
      </div>

      <div
        ref={paneRef}
        className="ctabs__pane ctabs__pane--in"
        role="tabpanel"
        id={`${baseId}-pane`}
        aria-labelledby={`${baseId}-tab-${active}`}
      >
        <div className="ctabs__head">
          {current.logo ? (
            <span className="ctabs__logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.logo} alt={`${current.organization} logo`} />
            </span>
          ) : null}

          <div className="ctabs__head-text">
            <p className="ctabs__kind">
              <current.icon className="h-3 w-3" aria-hidden="true" />
              {current.kind}
              <span className="ctabs__kind-sep">·</span>
              {current.organization}
            </p>

            <h3 className="ctabs__title">{current.title}</h3>
          </div>
        </div>

        <p className="ctabs__meta">
          <span>{current.period}</span>
          {current.location ? (
            <>
              <span className="ctabs__meta-sep" aria-hidden="true">
                ·
              </span>
              <span>{current.location}</span>
            </>
          ) : null}
        </p>

        <ul className="ctabs__points">
          {current.points.map((point) => (
            <li key={point.lead} className="ctabs__point">
              <strong>{point.lead}</strong> {point.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
