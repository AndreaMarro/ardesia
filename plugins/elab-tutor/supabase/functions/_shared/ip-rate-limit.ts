/**
 * ip-rate-limit.ts — Sprint X iter 105.3 P0 (Andrea audit C2 fix)
 *
 * IP-bound rate limiter to plug the sessionId-rotation bypass:
 * Audit C2 (security-auditor 2026-05-25): `checkRateLimitPersistent` keys on
 * attacker-controlled `sessionId` (regex 1-128 chars). Generate 10k sessions
 * → 30 req/min × 10k = 300k req/min = €150/min Gemini burn potential.
 *
 * This module adds an OUTER IP-bound limiter that runs IN ADDITION to the
 * existing session-bound limiter. Both must pass. IP limit defaults to
 * 100 req/min/IP (generous for shared-NAT classrooms, tight enough to
 * stop botnet rotation).
 *
 * Wiring opt-in via `ENABLE_IP_RATE_LIMIT='true'` env flag. Default OFF.
 *
 * IP extraction priority (Supabase Edge / Vercel / CDN scenarios):
 *   1. `CF-Connecting-IP` (Cloudflare)
 *   2. `x-vercel-forwarded-for`
 *   3. `x-real-ip` (nginx-style)
 *   4. `x-forwarded-for` (take first / leftmost = client)
 *   5. fallback: 'unknown' bucket (all-anon-IP requests share)
 *
 * In-memory only — Deno Edge isolates restart resets counters. Acceptable
 * for current scale; replace with Deno KV when sustained > 1k QPS.
 */

import { logSilentFailure } from './observability.ts';

// ===========================================================================
// Config
// ===========================================================================

const IP_RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const IP_RATE_LIMIT_MAX_DEFAULT = 100; // req/min/IP — env override IP_RATE_LIMIT_MAX
const IP_RATE_LIMIT_MAP_MAX = 50_000; // LRU cap (DoS protection)

interface IpBucket {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, IpBucket>();

/** LRU-ish eviction: when map full, drop oldest entries. */
function maybeEvict(): void {
  if (ipMap.size <= IP_RATE_LIMIT_MAP_MAX) return;
  const evictCount = Math.floor(IP_RATE_LIMIT_MAP_MAX * 0.1); // drop 10%
  const iter = ipMap.keys();
  for (let i = 0; i < evictCount; i++) {
    const key = iter.next().value;
    if (key !== undefined) ipMap.delete(key);
  }
}

// ===========================================================================
// IP extraction
// ===========================================================================

/**
 * Extract client IP from Request headers (proxy-aware).
 * Returns 'unknown' fallback when no header is present.
 *
 * NEVER throws.
 */
export function extractClientIp(req: Request): string {
  try {
    const cfIp = req.headers.get('CF-Connecting-IP');
    if (cfIp && cfIp.trim()) return cfIp.trim();

    const vercelFwd = req.headers.get('x-vercel-forwarded-for');
    if (vercelFwd && vercelFwd.trim()) return vercelFwd.trim().split(',')[0].trim();

    const realIp = req.headers.get('x-real-ip');
    if (realIp && realIp.trim()) return realIp.trim();

    const xff = req.headers.get('x-forwarded-for');
    if (xff && xff.trim()) {
      // XFF can be a comma-separated chain "client, proxy1, proxy2"
      // Take leftmost (the original client).
      return xff.trim().split(',')[0].trim();
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

// ===========================================================================
// Public API
// ===========================================================================

/**
 * Check whether the given IP has exceeded the configured rate limit.
 * Returns true when WITHIN limit, false when OVER.
 *
 * Implementation: sliding-window-ish bucket per IP, reset every minute.
 *
 * NEVER throws. Returns `true` (fail-open) when ip is empty/unknown AND
 * `STRICT_IP_RATE_LIMIT_UNKNOWN='true'` is NOT set. When strict mode is set,
 * unknown IPs are rejected (defense-in-depth against header-stripping
 * attackers).
 */
/**
 * iter 105.4 H1 fix (Andrea audit): parse env as positive integer with
 * validation. Previous `Number(env) || DEFAULT`:
 *   - `"0"` falls back to DEFAULT (operator intended "block all", got 100)
 *   - `"-5"` truthy → `count >= -5` always true → self-DoS
 *   - `"abc"` NaN → silent fallback, no log
 *   - `"3.7"` float → ugly comparison
 * New: parse, validate finite + integer + ≥1, log + fallback on invalid.
 */
function parseEnvPositiveInt(name: string, fallback: number): number {
  const raw = Deno.env.get(name);
  if (raw == null || raw.trim() === '') return fallback;
  const parsed = Number(raw.trim());
  if (Number.isFinite(parsed) && Number.isInteger(parsed) && parsed >= 1) {
    return parsed;
  }
  logSilentFailure('env_parse_invalid_positive_int', new Error('invalid env value'), {
    var: name,
    raw_preview: raw.slice(0, 32),
    fallback,
  });
  return fallback;
}

export function checkRateLimitByIp(ip: string): boolean {
  try {
    const max = parseEnvPositiveInt('IP_RATE_LIMIT_MAX', IP_RATE_LIMIT_MAX_DEFAULT);

    // Unknown IP handling
    if (!ip || ip === 'unknown') {
      const strict = (Deno.env.get('STRICT_IP_RATE_LIMIT_UNKNOWN') || '')
        .trim()
        .toLowerCase() === 'true';
      if (strict) return false;
      // Fail-open for unknown when not strict. Apply shared 'unknown' bucket
      // to prevent unlimited unknown traffic.
      ip = 'unknown';
    }

    maybeEvict();

    const now = Date.now();
    let bucket = ipMap.get(ip);
    if (!bucket || bucket.resetAt <= now) {
      // Window expired (or first request)
      bucket = { count: 1, resetAt: now + IP_RATE_LIMIT_WINDOW_MS };
      ipMap.set(ip, bucket);
      return true;
    }

    if (bucket.count >= max) {
      // Over limit
      return false;
    }

    bucket.count++;
    ipMap.set(ip, bucket);
    return true;
  } catch (err) {
    // Defensive: never let rate-limit logic crash the request path
    logSilentFailure('ip_rate_limit_check_failed', err, { ip });
    return true; // fail-open on logic crash
  }
}

/**
 * Convenience: check from Request directly (extracts IP + checks).
 *
 * Returns `{ ok, ip }` so caller can include IP in audit logs.
 */
export function checkRateLimitFromRequest(
  req: Request,
): { ok: boolean; ip: string } {
  const ip = extractClientIp(req);
  const ok = checkRateLimitByIp(ip);
  return { ok, ip };
}

/**
 * Test helper: reset the in-memory IP rate-limit map.
 * Production code MUST NOT call this.
 */
export function _resetIpRateLimitMap(): void {
  ipMap.clear();
}

/** Module version for telemetry. */
export const IP_RATE_LIMIT_VERSION = '1.0-iter105.3';
