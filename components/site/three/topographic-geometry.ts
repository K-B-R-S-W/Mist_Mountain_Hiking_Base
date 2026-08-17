import * as THREE from "three";

// Procedural heightmap for the Location section's topographic terrain.
// Deliberately not an authored asset or an npm noise dependency — a
// small seeded value-noise function is enough for a subtle, repeatable
// mountain silhouette, and keeps this feature's asset weight at zero.
//
// Fixed seed on purpose: the terrain should look identical on every
// load, not regenerate randomly.
const SEED = 1337;

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + SEED * 0.0001) * 43758.5453123;
  return s - Math.floor(s);
}

function smootherstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function valueNoise2D(x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const sx = smootherstep(x - x0);
  const sy = smootherstep(y - y0);

  const n00 = hash2(x0, y0);
  const n10 = hash2(x0 + 1, y0);
  const n01 = hash2(x0, y0 + 1);
  const n11 = hash2(x0 + 1, y0 + 1);

  const ix0 = n00 + (n10 - n00) * sx;
  const ix1 = n01 + (n11 - n01) * sx;
  return ix0 + (ix1 - ix0) * sy;
}

/** Multi-octave (fractal) value noise — an organic ridge/valley
 *  silhouette instead of a single smooth bump field. */
function fbm(x: number, y: number, octaves = 4): number {
  let amplitude = 0.5;
  let frequency = 1;
  let sum = 0;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise2D(x * frequency, y * frequency) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return sum / max;
}

export interface TerrainConfig {
  width: number;
  depth: number;
  segmentsX: number;
  segmentsY: number;
  /** Max elevation at the terrain's center, before radial falloff. */
  amplitude: number;
  noiseScale: number;
}

// ~56x56 segments -> ~3.2k vertices, well inside the 2.3k-4.1k budget.
export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
  width: 10,
  depth: 10,
  segmentsX: 56,
  segmentsY: 56,
  amplitude: 1.4,
  noiseScale: 0.55,
};

/** Elevation at a local (x, y) grid coordinate. A gentle radial falloff
 *  keeps the terrain's edges lower than its center, so it reads as one
 *  landform rather than noise tiling flatly to the border. */
export function sampleElevation(
  x: number,
  y: number,
  config: TerrainConfig = DEFAULT_TERRAIN_CONFIG,
): number {
  const nx = x * config.noiseScale;
  const ny = y * config.noiseScale;
  const maxDim = Math.max(config.width, config.depth) / 2;
  const dist = Math.sqrt(x * x + y * y) / maxDim;
  const falloff = Math.max(0, 1 - dist * dist);
  return fbm(nx, ny) * config.amplitude * falloff;
}

/** Builds a plane geometry displaced into a terrain surface. Local Z
 *  carries elevation pre-rotation; the mesh is rotated flat (-90° on X)
 *  by the caller so Z becomes world-up. No vertex normals are computed —
 *  the isoline shader is unlit and only reads elevation. Caller owns
 *  disposal. */
export function buildTerrainGeometry(
  config: TerrainConfig = DEFAULT_TERRAIN_CONFIG,
): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(
    config.width,
    config.depth,
    config.segmentsX,
    config.segmentsY,
  );

  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    position.setZ(i, sampleElevation(x, y, config));
  }
  position.needsUpdate = true;

  return geometry;
}
