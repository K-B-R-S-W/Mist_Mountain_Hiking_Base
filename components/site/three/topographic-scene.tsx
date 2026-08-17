"use client";

import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ThreeCanvas } from "./three-canvas";
import { buildTerrainGeometry, DEFAULT_TERRAIN_CONFIG } from "./topographic-geometry";

export interface PointerState {
  x: number;
  y: number;
}

// Pure line-art elevation isolines — a shader-based band test, not a
// wireframe grid. Discards every fragment outside a thin ring around
// each iso-height, so the GPU produces the contour lines directly with
// one draw call and no CPU marching-squares extraction step.
const vertexShader = /* glsl */ `
  varying float vElevation;
  varying float vDist;
  uniform float uMaxDim;
  void main() {
    vElevation = position.z;
    // Normalized radial distance from the terrain's center (0 at
    // center, 1 at the falloff radius used to shape the terrain) — used
    // in the fragment shader for a circular vignette. Deliberately a
    // circle computed from raw distance, not the plane's own square
    // boundary — that square boundary (plus the corners, where the
    // falloff formula clamps to a flat zero) is exactly what produced
    // the jagged "torn paper" corners: a hard-edged square cutting off
    // a round contour field, made worse by the flat corners simply
    // having no line to draw. The vignette fades everything to nothing
    // well before any of that geometry is reached.
    vDist = length(position.xy) / uMaxDim;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vElevation;
  varying float vDist;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uBandSpacing;
  uniform float uLineWidth;

  void main() {
    float bands = vElevation / uBandSpacing;
    // Distance from the nearest contour crossing (an integer band
    // index) — 0 exactly on a contour line, growing to 0.5 at the
    // midpoint between two contour lines.
    float distToLine = abs(fract(bands + 0.5) - 0.5);

    // Previous attempt ("if slope below a fixed floor, discard the
    // pixel") was wrong: this multi-octave noise terrain's gradient
    // dips below almost any fixed floor at countless ordinary points
    // along the contour paths themselves — ridge tops, saddle points,
    // gentle stretches — not just the one summit. That's what turned
    // real line segments into the dashed/erased look.
    //
    // Correct technique: normalize distToLine by the LOCAL screen-space
    // gradient (fwidth(bands)) instead of gating on it. Near ordinary
    // slope this yields a clean, constant-width AA'd line either way.
    // Near a true local extremum sitting on a contour level, elevation
    // varies quadratically with distance from that point while the
    // gradient varies linearly, so their ratio still grows away from
    // zero — the "line" still closes down to a small, correctly-sized
    // dot/loop instead of either dashing out or flooding a wide area.
    float aa = max(fwidth(bands), 1e-4);
    float lineSignal = distToLine / (aa * uLineWidth);
    float line = 1.0 - clamp(lineSignal, 0.0, 1.0);
    if (line < 0.02) discard;

    // Smooth circular vignette — see vertex shader. Fades to zero well
    // inside the plane's actual square edge/corners, so none of that
    // geometry is ever visible.
    float vignette = 1.0 - smoothstep(0.62, 0.92, vDist);
    float alpha = line * uOpacity * vignette;
    if (alpha < 0.015) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

interface TerrainMeshProps {
  scrollProgress: RefObject<number>;
  pointer: RefObject<PointerState>;
}

function TerrainMesh({ scrollProgress, pointer }: TerrainMeshProps) {
  const { camera } = useThree();

  const geometry = useMemo(() => buildTerrainGeometry(DEFAULT_TERRAIN_CONFIG), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#284a3a") }, // --color-secondary (moss)
      // Bumped from 0.18 — the old value was tuned for the previous
      // (buggy) shader, which read as heavier than intended because of
      // the solid fill; now that fill is gone, the true line opacity
      // was too faint to read against the cream background.
      uOpacity: { value: 0.32 },
      uBandSpacing: { value: 0.16 },
      // Divides the screen-space gradient (fwidth) to size the line —
      // roughly "line half-width in pixel-derivative units." ~1-1.5
      // reads as a clean single-pixel-ish stroke; see fragment shader.
      uLineWidth: { value: 1.2 },
      // Matches sampleElevation()'s own maxDim = max(width, depth) / 2
      // in topographic-geometry.ts — keep in sync if those change.
      uMaxDim: { value: Math.max(DEFAULT_TERRAIN_CONFIG.width, DEFAULT_TERRAIN_CONFIG.depth) / 2 },
    }),
    [],
  );

  // Elevated 3/4 angle (~40deg from horizontal), off-center framing
  // echoing .contour-divider's off-center focal point — not a
  // symmetrical top-down map, not a dramatic flythrough.
  const basePosition = useMemo(() => new THREE.Vector3(1.7, 3.9, 4.6), []);
  const lookTarget = useMemo(() => new THREE.Vector3(-0.6, 0, 0.4), []);
  const lerpedPointer = useRef<PointerState>({ x: 0, y: 0 });

  useEffect(() => {
    camera.position.copy(basePosition);
    camera.lookAt(lookTarget);
  }, [camera, basePosition, lookTarget]);

  useFrame(() => {
    const targetX = pointer.current?.x ?? 0;
    const targetY = pointer.current?.y ?? 0;
    // Lerp toward the pointer target rather than snapping to it — a
    // quiet depth cue, never a camera that visibly chases the cursor.
    lerpedPointer.current.x += (targetX - lerpedPointer.current.x) * 0.04;
    lerpedPointer.current.y += (targetY - lerpedPointer.current.y) * 0.04;

    // Scroll-driven vertical drift only — deliberately described as
    // what it actually is: a tiny camera-position nudge, not a change
    // to the camera's elevation angle (at this magnitude the camera
    // barely translates and doesn't meaningfully rotate). No zoom, no
    // terrain reshaping. Depth quietly revealing itself, not a camera
    // animation.
    const progress = scrollProgress.current ?? 0;
    const MAX_VERTICAL_DRIFT = 0.02; // world units — intentionally tiny
    const verticalDrift = MAX_VERTICAL_DRIFT * progress;

    camera.position.set(
      basePosition.x + lerpedPointer.current.x * 0.12,
      basePosition.y + verticalDrift + lerpedPointer.current.y * 0.06,
      basePosition.z,
    );
    camera.lookAt(lookTarget);
  });

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      // fwidth()/dFdx()/dFdy() used to need an explicit `derivatives`
      // extension flag under GLSL ES 1.00. Current three.js compiles
      // shaders as GLSL ES 3.00 under WebGL2 by default, where these
      // are core built-ins — the extension flag no longer exists on
      // the type, and isn't needed at runtime either.
      />
    </mesh>
  );
}

interface TopographicLocationSceneProps {
  active: boolean;
  scrollProgress: RefObject<number>;
  pointer: RefObject<PointerState>;
  fallback: ReactNode;
}

// The single composed export location-panel.tsx dynamic-imports — pulls
// in ThreeCanvas and the mesh/shader together so the whole three/fiber
// bundle is one lazy chunk, not several.
export function TopographicLocationScene({
  active,
  scrollProgress,
  pointer,
  fallback,
}: TopographicLocationSceneProps) {
  return (
    <ThreeCanvas active={active} fallback={fallback}>
      <TerrainMesh scrollProgress={scrollProgress} pointer={pointer} />
    </ThreeCanvas>
  );
}