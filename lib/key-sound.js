/**
 * The keyboard's switch sound, synthesised with Web Audio.
 *
 * Modelled on a tactile switch on a plastic board, as two events:
 *
 *   press    — a hard, very short transient (the stem bottoming out), a
 *              short plastic resonance around 1 kHz (the case), and a low,
 *              fast-decaying "thock" (the board and desk). The first two are
 *              filtered noise; the thock is a pitch-dropping sine.
 *   release  — the lighter, higher "clack" of the switch returning, ~100 ms
 *              later. It is the release that makes a keystroke sound
 *              mechanical rather than like a single tap.
 *
 * Every number is nudged per event so a run of keys does not repeat one
 * sample. A compressor on the master keeps peaks even and gives the
 * transients punch. The space bar is bigger and lower.
 *
 * The AudioContext is created lazily on the first press — a pointerdown or a
 * real keydown, i.e. a user gesture, which is what browsers require.
 */
let ctx = null;
let master = null;
let noise = null;

function context() {
  if (ctx) return ctx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12;
  comp.knee.value = 10;
  comp.ratio.value = 5;
  comp.attack.value = 0.001;
  comp.release.value = 0.08;
  master = ctx.createGain();
  // Hot into the compressor: the narrow filters throw most of the noise
  // away, so the bursts need gain to come out at a keystroke's level.
  master.gain.value = 3.2;
  master.connect(comp).connect(ctx.destination);

  const length = Math.floor(ctx.sampleRate * 0.5);
  noise = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  return ctx;
}

const rand = (lo, hi) => lo + Math.random() * (hi - lo);

/** Filtered noise burst: `type`/`freq`/`q` shape it, `decay` is its length. */
function burst(ac, t, { type, freq, q, decay, gain, out }) {
  const src = ac.createBufferSource();
  src.buffer = noise;
  const filter = ac.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0005, t + decay);
  src.connect(filter).connect(g).connect(out);
  src.start(t, rand(0, 0.3), decay + 0.02);
}

/** Press: transient + case resonance + thock. */
export function playKey({ space = false } = {}) {
  const ac = context();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume();
  const t = ac.currentTime;
  const out = ac.createGain();
  out.gain.value = space ? 1 : 0.85;
  out.connect(master);

  // Stem hitting the housing: hard and short, mostly above 3 kHz.
  burst(ac, t, {
    type: "highpass",
    freq: space ? 2400 : rand(3000, 3800),
    q: 0.7,
    decay: space ? 0.012 : 0.008,
    gain: 1.1,
    out,
  });
  // The case ringing: a narrow band around 1 kHz for ~20 ms.
  burst(ac, t + 0.001, {
    type: "bandpass",
    freq: space ? rand(700, 900) : rand(950, 1350),
    q: 4,
    decay: space ? 0.035 : 0.022,
    gain: 0.7,
    out,
  });
  // The board: a low sine that drops as it dies.
  const thock = ac.createOscillator();
  thock.type = "sine";
  const f0 = space ? rand(95, 120) : rand(130, 175);
  thock.frequency.setValueAtTime(f0, t);
  thock.frequency.exponentialRampToValueAtTime(f0 * 0.6, t + 0.05);
  const tg = ac.createGain();
  tg.gain.setValueAtTime(0.0001, t);
  tg.gain.exponentialRampToValueAtTime(space ? 0.9 : 0.6, t + 0.003);
  tg.gain.exponentialRampToValueAtTime(0.0005, t + (space ? 0.085 : 0.055));
  thock.connect(tg).connect(out);
  thock.start(t);
  thock.stop(t + 0.1);
}

/** Release: the lighter, higher clack of the switch coming back up. */
export function releaseKey({ space = false } = {}) {
  const ac = context();
  if (!ac) return;
  const t = ac.currentTime;
  const out = ac.createGain();
  out.gain.value = space ? 0.55 : 0.45;
  out.connect(master);

  burst(ac, t, {
    type: "highpass",
    freq: rand(4200, 5200),
    q: 0.7,
    decay: 0.006,
    gain: 1,
    out,
  });
  burst(ac, t + 0.001, {
    type: "bandpass",
    freq: rand(1600, 2200),
    q: 5,
    decay: 0.016,
    gain: 0.55,
    out,
  });
}
