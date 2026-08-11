"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CrystalTrailBackgroundProps {
  children?: React.ReactNode;
  /** Any CSS colour string. Drives both the stroke and the translucent fill. */
  crystalColor?: string;
  /** Upper bound on live shards, so a fast cursor cannot grow the array without limit. */
  maxCrystals?: number;
  className?: string;
}

/** Ground colour, also used as the per-frame fade wash that leaves the trail. */
const BASE_COLOR = "#0a0514";
const FADE_COLOR = "rgba(10, 5, 20, 0.15)";

interface Vertex {
  x: number;
  y: number;
}

/**
 * A single shard. Declared at module scope rather than inside the effect so
 * the ref holding them can be typed, and so the class is not rebuilt on every
 * effect run. Exported so smaller surfaces (the nav bar) can render the same
 * geometry instead of keeping a second copy of it.
 */
export class Crystal {
  x: number;
  y: number;
  life: number;
  size: number;
  angle: number;
  spin: number;
  vertices: Vertex[];

  /**
   * @param scale Shrinks the shard for small surfaces. 1 is the full-page size.
   */
  constructor(x: number, y: number, scale = 1) {
    this.x = x;
    this.y = y;
    this.life = 1;
    this.size = (Math.random() * 8 + 4) * scale;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.1;
    this.vertices = [];

    const numVertices = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      const radius = Math.random() * this.size + this.size / 2;
      this.vertices.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }
  }

  update() {
    this.life -= 0.01;
    this.angle += this.spin;
  }

  draw(ctx: CanvasRenderingContext2D, color: string) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    ctx.closePath();

    // globalAlpha rather than baking the alpha into an rgba() string: that is
    // what lets crystalColor accept any CSS colour and still fade out.
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = this.life * 0.8;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.globalAlpha = this.life * 0.1;
    ctx.fill();

    ctx.restore();
  }
}

const CrystalTrailBackground = ({
  children,
  crystalColor = "rgba(180, 120, 255, 0.8)",
  maxCrystals = 500,
  className = "",
}: CrystalTrailBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const crystalsRef = useRef<Crystal[]>([]);

  useEffect(() => {
    let destroyed = false;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Viewport size in CSS pixels. The backing store is devicePixelRatio
    // larger and the context is scaled to match, so shard edges stay crisp on
    // retina while all drawing maths below stays in CSS pixels.
    let width = window.innerWidth;
    let height = window.innerHeight;

    const sizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      // Assigning width/height resets the transform, so this is not cumulative.
      ctx.scale(dpr, dpr);
      // Repaint the ground immediately; the fade wash alone would take several
      // frames to cover a freshly cleared canvas.
      ctx.fillStyle = BASE_COLOR;
      ctx.fillRect(0, 0, width, height);
    };

    sizeCanvas();

    // Nothing to animate when the visitor asked for less motion: paint the
    // ground once and skip the loop and the cursor listener entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const handleStaticResize = () => sizeCanvas();
      window.addEventListener("resize", handleStaticResize);
      return () => window.removeEventListener("resize", handleStaticResize);
    }

    let lastMousePos = { x: width / 2, y: height / 2 };

    const handleMouseMove = (event: MouseEvent) => {
      const currentMousePos = { x: event.clientX, y: event.clientY };
      const speed = Math.hypot(
        currentMousePos.x - lastMousePos.x,
        currentMousePos.y - lastMousePos.y,
      );

      // Faster movement scatters more shards, capped at five per event.
      const crystalsToSpawn = Math.min(Math.floor(speed / 5), 5);
      for (let i = 0; i < crystalsToSpawn; i++) {
        if (crystalsRef.current.length < maxCrystals) {
          crystalsRef.current.push(new Crystal(event.clientX, event.clientY));
        }
      }

      lastMousePos = currentMousePos;
    };

    const handleResize = () => sizeCanvas();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      if (destroyed) return;

      // The trail: a translucent wash instead of clearRect, so older shards
      // dim across frames rather than vanishing.
      ctx.globalAlpha = 1;
      ctx.fillStyle = FADE_COLOR;
      ctx.fillRect(0, 0, width, height);

      crystalsRef.current = crystalsRef.current.filter((c) => c.life > 0);
      for (const crystal of crystalsRef.current) {
        crystal.update();
        crystal.draw(ctx, crystalColor);
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      destroyed = true;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      crystalsRef.current = [];
    };
  }, [crystalColor, maxCrystals]);

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        className,
      )}
      style={{ backgroundColor: BASE_COLOR }}
    >
      {/* Fixed, not absolute: the canvas is one viewport tall, so on a page
          taller than the viewport it has to stay pinned while scrolling. */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 block"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

export default CrystalTrailBackground;
