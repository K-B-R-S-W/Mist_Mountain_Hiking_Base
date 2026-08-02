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

export function isRateLimited(key: string): boolean {
  const now = Date.now();
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
