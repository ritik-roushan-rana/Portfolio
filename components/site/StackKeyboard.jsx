"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { iconPathFor } from "@/lib/stack-icons";
import { rasterise, GLYPH_H } from "@/lib/pixel-font";

/**
 * The toolkit as a 65% mechanical keyboard, seen from above.
 *
 * Your tools fill the alpha positions; standard modifiers frame each row so
 * the board has a real keyboard's silhouette even with a stack smaller than a
 * full key count. The modifier at the end of each row is flexible, so every
 * row lands flush on the same right edge whatever its keys add up to.
 *
 * Press a cap and it travels down. The strip above the keys is a dot-matrix
 * LED display: it idles on a colour pattern and, when you press a cap, scrolls
 * that tool's name across in a 5×7 pixel font — the physical board the design
 * is drawn from has exactly this strip.
 *
 * Every cap also carries a one-letter hotkey in its corner, and pressing that
 * letter on a real keyboard presses the cap on screen. The listener runs only
 * while the board is in view and never while an input has focus.
 */

const HOTKEY_POOL = "1234567890abcdefghijklmnopqrstuvwxyz";

/** Cap width in key units, from the name's length. */
function unitsFor(name) {
  if (name.length <= 3) return 1;
  if (name.length <= 6) return 1.25;
  if (name.length <= 9) return 1.5;
  if (name.length <= 11) return 1.75;
  return 2.25;
}

/** One-character hotkey per tool: a letter from its own name where free, then
 *  anything left. 36 slots for 32 caps, so none can be left unpressable. */
function assignHotkeys(items) {
  const taken = new Set();
  return items.map((item) => {
    const own = item.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    let key = null;
    for (const c of own) if (!taken.has(c)) { key = c; break; }
    if (!key) for (const c of HOTKEY_POOL) if (!taken.has(c)) { key = c; break; }
    if (key) taken.add(key);
    return { ...item, key };
  });
}

/**
 * The board, row by row. `tech` rows are filled from the groups in order; the
 * rest are the modifiers that give the board its shape. A `flex` modifier
 * absorbs whatever width its row has left.
 */
function buildLayout(groups) {
  const [languages, frameworks, tooling, platforms] = groups;
  const tech = (group) =>
    group.items.map((name) => ({
      type: "tech",
      name,
      group: group.name,
      units: unitsFor(name),
      icon: iconPathFor(name),
    }));
  const mod = (label, units, extra = {}) => ({ type: "mod", label, units, ...extra });

  // Rows are balanced so the flexible modifier in each lands near its real
  // size: Backspace ~2.25u, Enter ~2.25u, right Shift ~1.5u. The widest row
  // (frameworks) sets the board's width; the number row gains "-", "=" and
  // Delete, as on the board this is drawn from, rather than a 7-unit
  // Backspace swallowing the difference.
  return [
    [
      mod("Esc", 1, { dark: true }),
      ...tech(languages),
      mod("-", 1), mod("=", 1),
      mod("Backspace", 2.25, { dark: true, flex: true }),
      mod("Delete", 1, { dark: true }),
    ],
    [mod("Tab", 1.5), ...tech(frameworks)],
    [mod("Caps", 1.75), ...tech(tooling), mod("Enter", 2.25, { dark: true, flex: true })],
    [mod("Shift", 2.25), ...tech(platforms), mod("Shift", 1.5, { flex: true }), mod("▲", 1, { tone: "blue" })],
    [
      mod("Ctrl", 1.25), mod("Super", 1.25), mod("Alt", 1.25),
      mod("", 5, { dark: true, flex: true, space: true }),
      mod("Alt", 1), mod("Fn", 1),
      mod("◀", 1, { tone: "green" }), mod("▼", 1, { tone: "yellow" }), mod("▶", 1, { tone: "red" }),
    ],
  ];
}

/* --- LED strip ------------------------------------------------------------ */

const DOT = 11; // pitch, px
const ROWS = GLYPH_H;
const TONES = {
  Languages: [255, 196, 107],
  Frameworks: [255, 122, 61],
  Tooling: [255, 214, 138],
  Platforms: [226, 132, 255],
};

/**
 * Deterministic idle pattern: a bar-chart-like field that drifts with time.
 * No randomness, so the first frame matches on every load.
 */
function idleDot(col, row, t) {
  const h = Math.abs(Math.sin(col * 0.7 + t * 0.9) * 3.4 + Math.sin(col * 0.23 - t * 0.5) * 2.2);
  const lit = ROWS - row <= h;
  if (!lit) return null;
  const hue = (col * 11 + t * 40) % 360;
  return `hsl(${hue} 90% 62%)`;
}

function LedStrip({ message, tone, nonce }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ cols: [], offset: 0, tone: null, t: 0 });

  // A new message starts scrolling in from the right edge. `nonce` is in the
  // deps so pressing the same cap twice restarts the scroll rather than being
  // ignored as an unchanged message.
  useEffect(() => {
    stateRef.current.cols = message ? rasterise(message) : [];
    stateRef.current.offset = 0;
    stateRef.current.tone = tone;
  }, [message, tone, nonce]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let colsAcross = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      colsAcross = Math.floor(rect.width / DOT);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const st = stateRef.current;
      ctx.clearRect(0, 0, width, canvas.height);
      const padX = (width - colsAcross * DOT) / 2;
      const r = DOT * 0.34;
      const showing = st.cols.length > 0;
      const [tr, tg, tb] = TONES[st.tone] || TONES.Frameworks;

      for (let c = 0; c < colsAcross; c++) {
        for (let y = 0; y < ROWS; y++) {
          let color = null;
          if (showing) {
            // The message scrolls right-to-left: column c shows message
            // column (c - colsAcross + offset).
            const mc = c - colsAcross + st.offset;
            const bits = mc >= 0 && mc < st.cols.length ? st.cols[mc] : 0;
            if (bits & (1 << y)) color = `rgb(${tr} ${tg} ${tb})`;
          } else {
            color = idleDot(c, y, st.t);
          }
          const cx = padX + c * DOT + DOT / 2;
          const cy = y * DOT + DOT / 2 + 2;
          // Unlit LED: a faint disc so the grid itself is visible.
          ctx.fillStyle = color || "rgba(255,255,255,0.05)";
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          if (color) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
    };

    let frame = 0;
    let last = 0;
    const tick = (now) => {
      const st = stateRef.current;
      if (now - last > (st.cols.length ? 55 : 110)) {
        last = now;
        if (st.cols.length) {
          st.offset += 1;
          // Message has fully left the strip: back to idle.
          if (st.offset > st.cols.length + colsAcross) st.cols = [];
        } else {
          st.t += 0.12;
        }
        draw();
      }
      frame = requestAnimationFrame(tick);
    };

    // A first frame straight away, so the strip is never blank while waiting
    // for the animation loop — a background tab, or a throttled one, can hold
    // that first rAF back indefinitely.
    draw();

    if (reduced) {
      // Static: the message fully visible, or the idle field, drawn once.
      const st = stateRef.current;
      st.offset = Math.min(st.cols.length, colsAcross);
      draw();
    } else {
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="kb__led" aria-hidden="true" />;
}

/* --- Board ---------------------------------------------------------------- */

import { playKey } from "@/lib/key-sound";
import { Volume2, VolumeX } from "lucide-react";

const SOUND_KEY = "kb-sound";

export default function StackKeyboard({ groups }) {
  const layout = useMemo(() => {
    const rows = buildLayout(groups);
    const techs = assignHotkeys(rows.flat().filter((k) => k.type === "tech"));
    let i = 0;
    return rows.map((row) => row.map((k) => (k.type === "tech" ? techs[i++] : k)));
  }, [groups]);

  const byKey = useMemo(() => {
    const map = new Map();
    layout.flat().forEach((k) => {
      if (k.type === "tech" && k.key) map.set(k.key, k);
    });
    return map;
  }, [layout]);

  const rootRef = useRef(null);
  const [down, setDown] = useState(null);
  const [message, setMessage] = useState({ text: "", tone: null, n: 0 });
  const releaseTimer = useRef(0);

  // Sound is on by default and the choice is remembered per browser. Read
  // after mount so the server and first client render agree.
  const [sound, setSound] = useState(true);
  useEffect(() => {
    try {
      if (window.localStorage.getItem(SOUND_KEY) === "off") setSound(false);
    } catch {
      /* storage unavailable: stay on */
    }
  }, []);
  const toggleSound = () => {
    setSound((on) => {
      try {
        window.localStorage.setItem(SOUND_KEY, on ? "off" : "on");
      } catch {
        /* ignore */
      }
      return !on;
    });
  };
  const soundRef = useRef(sound);
  soundRef.current = sound;

  const press = (item) => {
    if (soundRef.current) playKey();
    setDown(item.key);
    // `n` makes an identical repeat press still restart the scroll.
    setMessage((m) => ({ text: item.name, tone: item.group, n: m.n + 1 }));
    window.clearTimeout(releaseTimer.current);
    releaseTimer.current = window.setTimeout(() => setDown(null), 140);
  };

  const pressSpace = () => {
    if (soundRef.current) playKey({ space: true });
    setDown("space");
    setMessage((m) => ({ text: "", tone: null, n: m.n + 1 }));
    window.clearTimeout(releaseTimer.current);
    releaseTimer.current = window.setTimeout(() => setDown(null), 140);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    let inView = false;
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.3 });
    io.observe(root);

    const onKey = (event) => {
      if (!inView || event.metaKey || event.ctrlKey || event.altKey) return;
      const t = event.target;
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (event.key === " ") { event.preventDefault(); pressSpace(); return; }
      const item = byKey.get(event.key.toLowerCase());
      if (item) press(item);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(releaseTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byKey]);

  return (
    <div ref={rootRef} className="kb">
      <div className="kb__case">
        <div className="kb__bezel">
          <LedStrip message={message.text} tone={message.tone} nonce={message.n} />
          {/* Live text for assistive tech, since the canvas is decorative. */}
          <span className="sr-only" aria-live="polite">
            {message.text ? `${message.text} — ${message.tone}` : ""}
          </span>
        </div>

        <div className="kb__plate">
          {layout.map((row, r) => (
            <div key={r} className="kb__row">
              {row.map((k, i) =>
                k.type === "tech" ? (
                  <button
                    key={k.name}
                    type="button"
                    className={`key ${down !== null && down === k.key ? "key--down" : ""}`}
                    style={{ "--w": k.units }}
                    onPointerDown={() => press(k)}
                    onKeyDown={(e) => { if (e.key === "Enter") press(k); }}
                    aria-label={`${k.name} — ${k.group}`}
                  >
                    <span className="key__cap">
                      {k.icon ? (
                        <svg className="key__logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path d={k.icon} />
                        </svg>
                      ) : null}
                      <span className="key__legend">{k.name}</span>
                      {k.key ? <span className="key__sub" aria-hidden="true">{k.key}</span> : null}
                    </span>
                  </button>
                ) : k.space ? (
                  <button
                    key={`space-${r}`}
                    type="button"
                    className={`key key--mod key--dark key--flex key--space ${down === "space" ? "key--down" : ""}`}
                    onPointerDown={pressSpace}
                    aria-label="Clear display"
                  >
                    <span className="key__cap" />
                  </button>
                ) : (
                  <span
                    key={`${k.label}-${r}-${i}`}
                    className={`key key--mod ${k.dark ? "key--dark" : ""} ${k.flex ? "key--flex" : ""} ${k.tone ? `key--${k.tone}` : ""}`}
                    style={{ "--w": k.units }}
                    aria-hidden="true"
                  >
                    <span className="key__cap">
                      <span className="key__legend key__legend--mod">{k.label}</span>
                    </span>
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="kb__foot">
        <p className="kb__hint">Click a cap, or type its corner letter. Space clears the display.</p>
        <button
          type="button"
          className="kb__sound"
          onClick={toggleSound}
          aria-pressed={sound}
          aria-label={sound ? "Turn key sounds off" : "Turn key sounds on"}
        >
          {sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {sound ? "Sound on" : "Sound off"}
        </button>
      </div>
    </div>
  );
}
