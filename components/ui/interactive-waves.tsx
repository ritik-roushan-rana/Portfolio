"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Perlin Noise Generator
 * This is a standard implementation of Perlin noise, used for the wave effect.
 */
class Noise {
  p: Uint8Array;
  seed: number;
  grad3: number[][];

  constructor(seed: number) {
    this.p = new Uint8Array(512);
    this.seed = seed > 0 && seed < 1 ? seed : Math.random();
    this.grad3 = [
      [1, 1, 0],
      [-1, 1, 0],
      [1, -1, 0],
      [-1, -1, 0],
      [1, 0, 1],
      [-1, 0, 1],
      [1, 0, -1],
      [-1, 0, -1],
      [0, 1, 1],
      [0, -1, 1],
      [0, 1, -1],
      [0, -1, -1],
    ];
    this.init(this.seed);
  }

  init(seed: number) {
    let i: number;
    let j: number;
    let k: number;
    const p = new Uint8Array(256);

    for (i = 0; i < 256; i++) {
      p[i] = i;
    }
    for (i = 0; i < 256; i++) {
      j = Math.floor(seed * (i + 1)) % 256;
      k = p[i];
      p[i] = p[j];
      p[j] = k;
    }
    for (i = 0; i < 512; i++) {
      this.p[i] = p[i & 255];
    }
  }

  dot(g: number[], x: number, y: number) {
    return g[0] * x + g[1] * y;
  }

  perlin2(x: number, y: number) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);

    const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const u = fade(x);
    const v = fade(y);
    const p = this.p;
    const grad3 = this.grad3;

    const n00 = this.dot(grad3[p[X + p[Y]] % 12], x, y);
    const n01 = this.dot(grad3[p[X + p[Y + 1]] % 12], x, y - 1);
    const n10 = this.dot(grad3[p[X + 1 + p[Y]] % 12], x - 1, y);
    const n11 = this.dot(grad3[p[X + 1 + p[Y + 1]] % 12], x - 1, y - 1);

    const lerp = (a: number, b: number, t: number) => a + t * (b - a);
    return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v);
  }
}

/**
 * Configuration for the wave animation.
 * Storing these values here avoids "magic numbers" in the code,
 * making it easier to read and tweak the animation parameters.
 */
const animationConfig = {
  // Grid settings
  GRID_X_GAP: 10,
  GRID_Y_GAP: 32,
  GRID_WIDTH_OFFSET: 200,
  GRID_HEIGHT_OFFSET: 30,
  // Perlin noise wave settings
  WAVE_TIME_X_FACTOR: 0.0125,
  WAVE_NOISE_X_FACTOR: 0.002,
  WAVE_TIME_Y_FACTOR: 0.005,
  WAVE_NOISE_Y_FACTOR: 0.0015,
  WAVE_NOISE_MAGNITUDE: 12,
  WAVE_AMPLITUDE_X: 32,
  WAVE_AMPLITUDE_Y: 16,
  // Mouse interaction settings
  MOUSE_INFLUENCE_RADIUS: 175,
  MOUSE_FALLOFF_FACTOR: 0.001,
  MOUSE_FORCE_FACTOR: 0.00065,
  MOUSE_SMOOTHING_FACTOR: 0.1,
  MAX_MOUSE_VELOCITY: 100,
  // Point physics settings
  TENSION_STRENGTH: 0.005, // How quickly points return to their original position
  FRICTION: 0.925, // How quickly point velocity decays
  CURSOR_DISPLACEMENT_STRENGTH: 2,
  MAX_CURSOR_DISPLACEMENT: 100,
  /** Coarser grid under 768px: the same 10px spacing is invisible detail on a
      phone and costs thousands of Perlin samples per frame. */
  MOBILE_GRID_X_GAP: 18,
};

interface Point {
  x: number;
  y: number;
  wave: { x: number; y: number };
  cursor: { x: number; y: number; vx: number; vy: number };
}

interface WavesProps {
  children?: React.ReactNode;
  className?: string;
  /** Stroke colour for the wave lines. Any CSS colour string. */
  lineColor?: string;
  /** Ground colour behind the lines. */
  backgroundColor?: string;
}

/**
 * The main component for rendering the interactive waves animation.
 *
 * Used as the page-wide background: the canvas is fixed to the viewport and
 * `children` render above it.
 */
const Waves = ({
  children,
  className,
  lineColor = "rgba(34, 211, 238, 0.38)",
  backgroundColor = "#0a0514",
}: WavesProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Using useRef for animation state to prevent re-renders on each frame
  const animationState = useRef({
    ctx: null as CanvasRenderingContext2D | null,
    mouse: {
      x: -10,
      y: 0,
      lx: 0,
      ly: 0,
      sx: 0,
      sy: 0,
      v: 0,
      vs: 0,
      a: 0,
      set: false,
    },
    lines: [] as Point[][],
    noise: new Noise(Math.random()),
    bounding: null as DOMRect | null,
    animationFrameId: null as number | null,
    lineColor,
  });

  const moved = useCallback((point: Point, withCursorForce = true) => {
    const coords = {
      x: point.x + point.wave.x + (withCursorForce ? point.cursor.x : 0),
      y: point.y + point.wave.y + (withCursorForce ? point.cursor.y : 0),
    };
    coords.x = Math.round(coords.x * 10) / 10;
    coords.y = Math.round(coords.y * 10) / 10;
    return coords;
  }, []);

  useEffect(() => {
    const state = animationState.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    state.ctx = ctx;
    state.lineColor = lineColor;

    const setSize = () => {
      // The canvas is fixed to the viewport, so it is measured rather than the
      // container: the container is the full page and is many screens tall.
      state.bounding = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(state.bounding.width * dpr);
      canvas.height = Math.round(state.bounding.height * dpr);
      // setTransform, not scale: this runs on every resize and scale compounds.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const setLines = () => {
      if (!state.bounding) return;
      const { width, height } = state.bounding;
      state.lines = [];

      const { GRID_Y_GAP, GRID_WIDTH_OFFSET, GRID_HEIGHT_OFFSET } =
        animationConfig;
      const GRID_X_GAP =
        width < 768 ? animationConfig.MOBILE_GRID_X_GAP : animationConfig.GRID_X_GAP;

      const oWidth = width + GRID_WIDTH_OFFSET;
      const oHeight = height + GRID_HEIGHT_OFFSET;
      const totalLines = Math.ceil(oWidth / GRID_X_GAP);
      const totalPoints = Math.ceil(oHeight / GRID_Y_GAP);
      const xStart = (width - GRID_X_GAP * totalLines) / 2;
      const yStart = (height - GRID_Y_GAP * totalPoints) / 2;

      for (let i = 0; i <= totalLines; i++) {
        const points: Point[] = [];
        for (let j = 0; j <= totalPoints; j++) {
          points.push({
            x: xStart + GRID_X_GAP * i,
            y: yStart + GRID_Y_GAP * j,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          });
        }
        state.lines.push(points);
      }
    };

    const movePoints = (time: number) => {
      const { lines, mouse, noise } = state;
      const {
        WAVE_TIME_X_FACTOR,
        WAVE_NOISE_X_FACTOR,
        WAVE_TIME_Y_FACTOR,
        WAVE_NOISE_Y_FACTOR,
        WAVE_NOISE_MAGNITUDE,
        WAVE_AMPLITUDE_X,
        WAVE_AMPLITUDE_Y,
        MOUSE_INFLUENCE_RADIUS,
        MOUSE_FALLOFF_FACTOR,
        MOUSE_FORCE_FACTOR,
        TENSION_STRENGTH,
        FRICTION,
        CURSOR_DISPLACEMENT_STRENGTH,
        MAX_CURSOR_DISPLACEMENT,
      } = animationConfig;

      lines.forEach((points) => {
        points.forEach((p) => {
          // 1. Calculate base wave movement using Perlin noise
          const noiseInputX =
            (p.x + time * WAVE_TIME_X_FACTOR) * WAVE_NOISE_X_FACTOR;
          const noiseInputY =
            (p.y + time * WAVE_TIME_Y_FACTOR) * WAVE_NOISE_Y_FACTOR;
          const move =
            noise.perlin2(noiseInputX, noiseInputY) * WAVE_NOISE_MAGNITUDE;

          p.wave.x = Math.cos(move) * WAVE_AMPLITUDE_X;
          p.wave.y = Math.sin(move) * WAVE_AMPLITUDE_Y;

          // 2. Calculate mouse interaction effect
          const dx = p.x - mouse.sx;
          const dy = p.y - mouse.sy;
          const d = Math.hypot(dx, dy);
          const influenceRadius = Math.max(MOUSE_INFLUENCE_RADIUS, mouse.vs);

          if (d < influenceRadius) {
            const falloff = 1 - d / influenceRadius;
            const force = Math.cos(d * MOUSE_FALLOFF_FACTOR) * falloff;
            const forceFactor =
              force * influenceRadius * mouse.vs * MOUSE_FORCE_FACTOR;

            p.cursor.vx += Math.cos(mouse.a) * forceFactor;
            p.cursor.vy += Math.sin(mouse.a) * forceFactor;
          }

          // 3. Apply physics to the point's cursor-driven velocity
          p.cursor.vx += (0 - p.cursor.x) * TENSION_STRENGTH;
          p.cursor.vy += (0 - p.cursor.y) * TENSION_STRENGTH;

          p.cursor.vx *= FRICTION;
          p.cursor.vy *= FRICTION;

          p.cursor.x += p.cursor.vx * CURSOR_DISPLACEMENT_STRENGTH;
          p.cursor.y += p.cursor.vy * CURSOR_DISPLACEMENT_STRENGTH;

          p.cursor.x = Math.min(
            MAX_CURSOR_DISPLACEMENT,
            Math.max(-MAX_CURSOR_DISPLACEMENT, p.cursor.x),
          );
          p.cursor.y = Math.min(
            MAX_CURSOR_DISPLACEMENT,
            Math.max(-MAX_CURSOR_DISPLACEMENT, p.cursor.y),
          );
        });
      });
    };

    const drawLines = () => {
      const { bounding, lines } = state;
      if (!bounding) return;

      ctx.clearRect(0, 0, bounding.width, bounding.height);
      ctx.beginPath();
      ctx.strokeStyle = state.lineColor;
      ctx.lineWidth = 0.5;

      lines.forEach((points) => {
        const p1 = moved(points[0], false);
        ctx.moveTo(p1.x, p1.y);

        for (let i = 0; i < points.length - 1; i++) {
          const currentPoint = moved(points[i], true);
          const nextPoint = moved(points[i + 1], true);
          const xc = (currentPoint.x + nextPoint.x) / 2;
          const yc = (currentPoint.y + nextPoint.y) / 2;
          ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, xc, yc);
        }
      });

      ctx.stroke();
    };

    const tick = (time: number) => {
      const { mouse } = state;
      const { MOUSE_SMOOTHING_FACTOR, MAX_MOUSE_VELOCITY } = animationConfig;

      mouse.sx += (mouse.x - mouse.sx) * MOUSE_SMOOTHING_FACTOR;
      mouse.sy += (mouse.y - mouse.sy) * MOUSE_SMOOTHING_FACTOR;

      const dx = mouse.sx - mouse.lx;
      const dy = mouse.sy - mouse.ly;
      const d = Math.hypot(dx, dy);

      mouse.v = d;
      mouse.vs += (d - mouse.vs) * MOUSE_SMOOTHING_FACTOR;
      mouse.vs = Math.min(MAX_MOUSE_VELOCITY, mouse.vs);
      mouse.a = Math.atan2(dy, dx);

      mouse.lx = mouse.sx;
      mouse.ly = mouse.sy;

      movePoints(time);
      drawLines();

      state.animationFrameId = requestAnimationFrame(tick);
    };

    const updateMousePosition = (x: number, y: number) => {
      if (!state.bounding) return;
      const { mouse } = state;

      mouse.x = x - state.bounding.left;
      mouse.y = y - state.bounding.top;

      if (!mouse.set) {
        mouse.sx = mouse.x;
        mouse.sy = mouse.y;
        mouse.lx = mouse.x;
        mouse.ly = mouse.y;
        mouse.set = true;
      }
    };

    const onResize = () => {
      setSize();
      setLines();
    };

    setSize();
    setLines();
    window.addEventListener("resize", onResize);

    // Reduced motion: paint one static frame of the grid and stop. No loop, no
    // pointer tracking.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      movePoints(0);
      drawLines();
      return () => window.removeEventListener("resize", onResize);
    }

    // clientX/clientY, not pageX/pageY: the canvas is fixed to the viewport, so
    // document coordinates would drift by the scroll offset.
    const onMouseMove = (e: MouseEvent) => {
      updateMousePosition(e.clientX, e.clientY);
    };

    // Passive, and deliberately without preventDefault. The original called
    // preventDefault on touchmove, which is fine for a small hero widget but
    // would block page scrolling entirely when the element backs the whole page.
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) updateMousePosition(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    state.animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    };
  }, [moved, lineColor]);

  return (
    <div
      ref={containerRef}
      className={cn("relative min-h-screen w-full", className)}
      style={{ backgroundColor }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 block h-full w-full"
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

export default Waves;
