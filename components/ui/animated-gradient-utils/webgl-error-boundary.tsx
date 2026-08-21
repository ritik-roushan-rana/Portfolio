"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface WebGLErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time failures from the WebGL canvas and swaps in a static
 * fallback.
 *
 * This has to be a class component: error boundaries rely on
 * getDerivedStateFromError / componentDidCatch, which have no hook equivalent.
 *
 * Note it only catches errors thrown during React's render and lifecycle. A
 * missing WebGL2 context or a shader that fails to compile is not a thrown
 * error, so AnimatedGradient detects those itself and renders WebGLFallback
 * directly. This boundary is the backstop for the unexpected — a driver crash
 * mid-render, for instance.
 */
export class WebGLErrorBoundary extends React.Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("AnimatedGradient failed, showing fallback:", error);
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

interface WebGLFallbackProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * CSS-only stand-in for the shader: layered radial gradients over a drifting
 * linear gradient. Reuses the project's existing `animate-gradient` utility
 * (tailwind.config keyframes + the background-size companion in globals.css) so
 * the fallback still moves without any new keyframes.
 */
export function WebGLFallback({ className, style }: WebGLFallbackProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
      style={style}
    >
      <div
        className="animate-gradient absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #0a0514 0%, #1a0b2e 45%, #14304a 70%, #0a0514 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(60% 45% at 20% 85%, rgba(34, 211, 238, 0.28), transparent 70%)",
            "radial-gradient(50% 40% at 80% 15%, rgba(192, 132, 252, 0.22), transparent 70%)",
            "radial-gradient(40% 30% at 55% 60%, rgba(0, 255, 65, 0.12), transparent 70%)",
          ].join(","),
        }}
      />
    </div>
  );
}

export default WebGLErrorBoundary;
