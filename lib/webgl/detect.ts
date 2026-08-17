// Synchronous WebGL feature-detect, run before ever attempting to
// dynamic-import the three/fiber bundle. A throwaway canvas + try/catch
// context creation is the standard reliable check — cheaper and more
// honest than waiting for <Canvas> to fail at mount.
export function hasWebGL(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}
