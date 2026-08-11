"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Crystal } from "@/components/ui/crystal-trail-background";

interface CrystalTrailSurfaceProps {
  /** Any CSS colour string, used for both the shard stroke and its fill. */
  crystalColor?: string;
  /** Upper bound on live shards for this surface. */
  maxCrystals?: number;
  /** Shard size multiplier. Small surfaces want well under 1. */
  scale?: number;
  className?: string;
}

/**
 * The crystal trail scoped to whatever element contains it, instead of the
 * whole viewport. Drop it inside any `relative` box and it fills that box.
 *
 * Two differences from CrystalTrailBackground, both required to sit inside a
 * translucent element like the nav pill:
 *
 *  - It never paints a ground colour. The trail fades via a `destination-out`
 *    wash, which erases previous frames and leaves the canvas transparent, so
 *    the host's backdrop blur still shows through.
 *  - The animation loop parks itself when the last shard dies and restarts on
 *    the next spawn, so an idle nav bar costs nothing per frame.
 */
export default function CrystalTrailSurface({
  crystalColor = "rgba(196, 132, 252, 0.9)",
  maxCrystals = 60,
  scale = 0.55,
  className,
}: CrystalTrailSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const crystalsRef = useRef<Crystal[]>([]);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const host = canvas.parentElement;
    if (!host) return;

    let width = 0;
    let height = 0;

    const sizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      // setTransform rather than scale: this runs on every resize, and scale
      // would compound.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    sizeCanvas();

    // The nav changes size when it condenses on scroll, so track the element
    // rather than the window.
    const observer = new ResizeObserver(sizeCanvas);
    observer.observe(host);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => observer.disconnect();
    }

    const step = () => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      crystalsRef.current = crystalsRef.current.filter((c) => c.life > 0);
      for (const crystal of crystalsRef.current) {
        crystal.update();
        crystal.draw(ctx, crystalColor);
      }

      if (crystalsRef.current.length === 0) {
        // Nothing left to fade. Wipe the residue and park until the next spawn.
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, width, height);
        frameRef.current = null;
        return;
      }

      frameRef.current = requestAnimationFrame(step);
    };

    const ensureRunning = () => {
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    let last: { x: number; y: number } | null = null;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Outside the host: drop the reference point so re-entering does not
      // read as one enormous jump.
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        last = null;
        return;
      }

      const speed = last ? Math.hypot(x - last.x, y - last.y) : 0;
      // At least one shard per move event, so a slow drag still traces.
      const crystalsToSpawn = Math.max(1, Math.min(Math.floor(speed / 5), 4));

      for (let i = 0; i < crystalsToSpawn; i++) {
        if (crystalsRef.current.length < maxCrystals) {
          crystalsRef.current.push(new Crystal(x, y, scale));
        }
      }

      last = { x, y };
      ensureRunning();
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      crystalsRef.current = [];
    };
  }, [crystalColor, maxCrystals, scale]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
