import "server-only";

/**
 * Minimal in-memory, per-process rate limiter for the public inquiry form.
 * Fine for a single-instance / single-region deploy at this traffic level.
 *
 * If you move to multi-instance hosting (e.g. multiple Vercel regions),
 * swap the Map for Upstash Redis (`@upstash/ratelimit`) — same call shape,
 * this function's signature doesn't need to change at the call site.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

const MAX_MAP_SIZE = 1000;
const SWEEP_THRESHOLD = 100;

export function isRateLimited(key: string): boolean {
  const now = Date.now();

  // Opportunistic lazy sweep of expired entries when map grows
  if (hits.size > SWEEP_THRESHOLD) {
    for (const [k, v] of hits.entries()) {
      if (now > v.resetAt) {
        hits.delete(k);
      }
    }
  }

  // Hard capacity cap: evict oldest entry if still overflowing
  if (hits.size >= MAX_MAP_SIZE) {
    const oldestKey = hits.keys().next().value;
    if (oldestKey) hits.delete(oldestKey);
  }

  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    return true;
  }
  return false;
}
