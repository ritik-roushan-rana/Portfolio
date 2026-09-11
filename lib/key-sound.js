/**
 * The keyboard's switch sound.
 *
 * A recording of a real mechanical keyboard (public/sounds/keys.mp3, a
 * Pixabay/freesound_community clip, 2.5 s of typing) is used as a sprite
 * sheet: `HITS` lists the onset of each keystroke in it, and a press plays
 * a random one for ~140 ms — press and release included — with a slight
 * random pitch shift so a run of keys never repeats one hit exactly. The
 * space bar plays the deeper hits, slowed a little.
 *
 * The clip is fetched and decoded when the keyboard first comes into view
 * (`prime`), so the first press is already instant. Until it has decoded —
 * or if it fails to load — presses fall back to the synthesised switch
 * below, which is also what plays for the release in that case.
 *
 * The AudioContext is created lazily and resumed on the first press, which
 * is a user gesture, as browsers require.
 */
const SAMPLE_URL = "/sounds/keys.mp3";
/** Keystroke onsets in the clip, seconds. */
const HITS = [0.112, 0.258, 0.356, 0.475, 0.627, 0.807, 0.965, 1.152, 1.276, 1.398, 1.802, 2.044, 2.159, 2.247];
/** The heavier hits, for the space bar. */
const DEEP = [1.276, 1.398, 1.802, 2.044, 2.247];
const HIT_LEN = 0.14;

let sample = null;
let loading = null;

/** Load and decode the recording; safe to call any number of times. */
export function prime() {
  const ac = context();
  if (!ac || sample || loading) return;
  loading = fetch(SAMPLE_URL)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.statusText))))
    .then((buf) => ac.decodeAudioData(buf))
    .then((decoded) => {
      sample = decoded;
    })
    .catch(() => {
      loading = null; // leave the synth in charge
    });
}

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
  master.gain.value = 1;
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

/** Press. The recording when it is ready, the synthesised switch until then. */
export function playKey({ space = false } = {}) {
  const ac = context();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume();
  if (!sample) prime();
  const t = ac.currentTime;

  if (sample) {
    const pool = space ? DEEP : HITS;
    const start = pool[Math.floor(Math.random() * pool.length)] - 0.003;
    const src = ac.createBufferSource();
    src.buffer = sample;
    src.playbackRate.value = (space ? 0.86 : 1) * rand(0.96, 1.04);
    const g = ac.createGain();
    g.gain.setValueAtTime(space ? 1.15 : 1, t);
    // Hold, then fade over the last 40 ms so the slice never clicks off.
    g.gain.setValueAtTime(space ? 1.15 : 1, t + HIT_LEN - 0.04);
    g.gain.linearRampToValueAtTime(0.0001, t + HIT_LEN);
    src.connect(g).connect(master);
    src.start(t, Math.max(0, start), HIT_LEN + 0.01);
    return;
  }

  const out = ac.createGain();
  // The synth's filters throw most of the noise away, so it runs hot.
  out.gain.value = (space ? 1 : 0.85) * 3.2;
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

/** Release: the switch coming back up. The recording already carries it,
    so this only sounds while the synth is standing in. */
export function releaseKey({ space = false } = {}) {
  const ac = context();
  if (!ac || sample) return;
  const t = ac.currentTime;
  const out = ac.createGain();
  out.gain.value = (space ? 0.55 : 0.45) * 3.2;
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
