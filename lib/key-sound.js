/**
 * The keyboard's click, synthesised with Web Audio rather than sampled.
 *
 * A mechanical switch is two sounds on top of each other: a short, bright
 * click from the stem hitting the housing, and a lower "thock" from the cap
 * and the board underneath it. Here that is a burst of band-passed noise
 * (the click) over a quickly decaying, pitch-dropping tone (the thock), with
 * a little random variation per press so a run of keys does not sound like
 * one sample on repeat. The space bar is bigger and lower.
 *
 * The AudioContext is created lazily on the first press. Browsers only allow
 * audio to start inside a user gesture, and every press here is one — a
 * pointerdown on a cap or a real keydown — so the first click both unlocks
 * the context and plays.
 */
let ctx = null;
let noise = null;

function context() {
  if (ctx) return ctx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();

  // Half a second of white noise, reused as the source for every click.
  const length = Math.floor(ctx.sampleRate * 0.5);
  noise = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  return ctx;
}

const rand = (lo, hi) => lo + Math.random() * (hi - lo);

/** Play one key press. `space` gives the bigger, lower space-bar sound. */
export function playKey({ space = false } = {}) {
  const ac = context();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume();

  const t = ac.currentTime;
  const out = ac.createGain();
  out.gain.value = space ? 0.5 : 0.42;
  out.connect(ac.destination);

  // Click: a few milliseconds of noise through a band-pass, high and sharp.
  const click = ac.createBufferSource();
  click.buffer = noise;
  click.playbackRate.value = rand(0.9, 1.1);
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = space ? rand(1800, 2400) : rand(2600, 3600);
  bp.Q.value = 0.9;
  const clickGain = ac.createGain();
  clickGain.gain.setValueAtTime(0.9, t);
  clickGain.gain.exponentialRampToValueAtTime(0.001, t + (space ? 0.03 : 0.018));
  click.connect(bp).connect(clickGain).connect(out);
  click.start(t, rand(0, 0.3), 0.05);

  // Thock: a short tone that drops in pitch as it dies, like the cap landing.
  const thock = ac.createOscillator();
  thock.type = "triangle";
  const f0 = space ? rand(110, 140) : rand(170, 230);
  thock.frequency.setValueAtTime(f0, t);
  thock.frequency.exponentialRampToValueAtTime(f0 * 0.55, t + 0.06);
  const thockGain = ac.createGain();
  thockGain.gain.setValueAtTime(0.0001, t);
  thockGain.gain.exponentialRampToValueAtTime(space ? 0.7 : 0.55, t + 0.004);
  thockGain.gain.exponentialRampToValueAtTime(0.001, t + (space ? 0.09 : 0.06));
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  thock.connect(lp).connect(thockGain).connect(out);
  thock.start(t);
  thock.stop(t + 0.1);
}
