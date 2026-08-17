"use client";

import { Component, Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";

interface CanvasErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

// Runtime WebGL/context failures (e.g. context loss) collapse to the
// same CSS fallback the caller already uses for the pre-mount checks —
// one consistent non-3D identity for this section, not several
// differently-degraded states.
class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, CanvasErrorBoundaryState> {
  state: CanvasErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[three-canvas] 3D scene failed at runtime, falling back to CSS.", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

interface ThreeCanvasProps {
  children: ReactNode;
  fallback: ReactNode;
  /** Whether the host section currently intersects the viewport — the
   *  render loop fully pauses (not just throttles) when false. */
  active: boolean;
}

// Scene-agnostic on purpose: reusable if a second 3D experience gets
// built later. Owns DPR cap, an unlit/transparent-friendly clear color,
// the paused/active render loop, and the runtime error boundary. Does
// NOT own the pre-mount WebGL/viewport/reduced-motion decision — that
// lives in the caller (location-panel.tsx) so an unqualified visitor
// never triggers the dynamic import that loads this file at all.
export function ThreeCanvas({ children, fallback, active }: ThreeCanvasProps) {
  return (
    <CanvasErrorBoundary fallback={fallback}>
      <Canvas
        dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 2, 2)]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ fov: 38, near: 0.1, far: 50 }}
        frameloop={active ? "always" : "never"}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
