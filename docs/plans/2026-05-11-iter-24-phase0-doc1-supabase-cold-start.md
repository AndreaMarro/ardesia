# Iter 24 Phase 0 Doc Discovery #1 — Supabase Edge Function Cold Start

**Date**: 2026-05-11
**Scope**: Identify EXACT APIs + patterns to mitigate cold-start latency on Supabase Edge Functions (Deno runtime). Validated against `unlim-chat` prod endpoint.
**Author**: Iter 24 Phase 0 doc-discovery subagent #1
**Status**: Evidence-only. No code changes. Pre-plan input for iter 24 implementation phase.

---

## 1. Sources Consulted (with reachability)

| # | Source | URL / Path | Reachable | Used For |
|---|--------|-----------|-----------|----------|
| 1 | Supabase Edge Functions overview | `https://supabase.com/docs/guides/functions` | Yes (partial) | Recommended patterns, env vars, pooling |
| 2 | Supabase Edge Functions LIMITS | `https://supabase.com/docs/guides/functions/limits` | Yes | Memory/CPU/wall-clock numbers |
| 3 | Supabase blog "Deno 2.1" | `https://supabase.com/blog/edge-functions-deno-2-1` | **404 NOT FOUND** | (gap — see §6) |
| 4 | Supabase blog "faster smaller" boot times | `https://supabase.com/blog/edge-functions-faster-smaller` | Yes | Concrete boot-time benchmarks ms |
| 5 | Supabase Cron docs | `https://supabase.com/docs/guides/cron` | Yes (intro only) | Concurrency limits, deferred to pg_cron |
| 6 | citusdata/pg_cron GitHub | `https://github.com/citusdata/pg_cron` | Yes | Sub-minute syntax `'30 seconds'` |
| 7 | supabase/pg_net GitHub | `https://github.com/supabase/pg_net` | Yes | `net.http_get` signature |
| 8 | Deno.serve API ref | `https://docs.deno.com/api/deno/~/Deno.serve` | Yes | Canonical handler signature |
| 9 | Supabase background-tasks docs | `https://supabase.com/docs/guides/functions/background-tasks` | Yes | `EdgeRuntime.waitUntil` + AbortController pattern |
| 10 | Local migration | `supabase/migrations/20260430220000_unlim_chat_warmup_cron.sql` | Read | Existing warmup cron (Sprint T iter 38 Atom A5) |
| 11 | Local Edge Function entry | `supabase/functions/unlim-chat/index.ts:1-120` | Read | Current Deno.serve patterns (legacy `std/http/server.ts`) |
| 12 | Live REST verify | `https://euqpdueopmlllqjmqnyb.supabase.co/rest/v1/cron_job` | HTTP 404 PGRST205 | Schema not exposed via PostgREST (expected) |
| 13 | Live OPTIONS verify | `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat` | HTTP 204 | Live cold-start probe (5 runs) |

---

## 2. Concrete Findings (numbers + citations)

### 2.1 Cold start latency (documented + measured)

**Documented (Supabase blog "faster smaller", source #4)** — boot time per dep load:

| Dependency | Old boot | New boot | Delta |
|------------|----------|----------|-------|
| `@supabase/supabase-js` | 275ms | **25ms** | -91% |
| `openai` | 459ms | **57ms** | -88% |
| `drizzle-orm` + `node-postgres` | 301ms | **83ms** | -72% |

Technique cited: "lazy evaluating dependencies" + "xxHash-3 vs SHA-256" for module hashing.

**Measured live (`unlim-chat` prod, 2026-05-11 morning, 5 warm OPTIONS runs)**:

```
Run 1: HTTP=204, total=0.195s, connect=0.014s, tls=0.032s
Run 2: HTTP=204, total=0.187s, connect=0.014s, tls=0.034s
Run 3: HTTP=204, total=0.204s, connect=0.014s, tls=0.033s
Run 4: HTTP=204, total=0.230s, connect=0.011s, tls=0.025s
Run 5: HTTP=204, total=0.189s, connect=0.021s, tls=0.039s
```

Mean = ~201ms. POST (bad auth, no LLM) = 113ms. Warm-isolate response budget for OPTIONS is **~150-180ms** (subtract ~30ms TCP+TLS). This is significantly below the 600-1500ms cold-boot cited in iter 38 A5 migration comment — meaning **either the warmup cron is firing OR baseline traffic keeps isolate warm**.

### 2.2 Hard limits (Supabase, source #2)

| Limit | Free | Paid (Pro+) |
|-------|------|-------------|
| Memory | 256 MB | 256 MB |
| CPU time per request | 2 s | 2 s |
| Wall clock per request | **150 s** | **400 s** |
| Idle timeout (504) | 150 s | 150 s |
| Function size (bundled) | 20 MB | 20 MB |
| Secrets per project | 100 | 100 |
| Secret size | 48 KiB | 48 KiB |
| Functions per project | 100 | 500 (Pro) / 1000 (Team) / ∞ (Ent) |

**Gap**: docs do NOT publish exact idle-eviction TTL for V8 isolates. The iter 38 A5 migration comment estimated ~1-2 min sustained idle on Free / low-traffic Pro — this is **community-derived, not vendor-published**.

### 2.3 Warmup pattern: pg_cron + pg_net

**pg_cron sub-minute syntax** (source #6, citusdata/pg_cron README):
- Supports interval notation: `'10 seconds'`, `'30 seconds'`, down to **1 second** minimum.
- No specific pg_cron version cited for seconds-support; PostgreSQL ≥10 required.
- Distinct from cron's 5-field syntax (which has 1-minute minimum).

**Concurrency** (source #5, Supabase Cron): **8 jobs concurrent max**, **10 min max duration per job**.

**pg_net.http_get signature** (source #7, supabase/pg_net README):

```sql
net.http_get(
    url text,
    params jsonb default '{}'::jsonb,
    headers jsonb default '{}'::jsonb,
    timeout_milliseconds int default 1000
) returns bigint  -- async request_id
```

- **Async**: returns immediately with `request_id`. Background worker dispatches actual HTTP call.
- Response queryable via `SELECT * FROM net._http_response WHERE id = <request_id>` (fields: `status_code`, `content_type`, `headers`, `content`, `timed_out`, `error_msg`).
- For warmup we don't need the response — fire-and-forget is the point.

### 2.4 Edge Function runtime: Deno 1.x vs 2.x

**Gap critical**: `https://supabase.com/blog/edge-functions-deno-2-1` returned **HTTP 404** (source #3). Cannot cite Deno 2.1 specifics from that blog. Substitute: source #4 (`edge-functions-faster-smaller`) is the available benchmarks page.

**Current `unlim-chat` import** (`supabase/functions/unlim-chat/index.ts:9`):
```ts
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
```

This is the **legacy** stdlib server. Canonical Deno API since Deno 1.35 / Supabase Edge Runtime is `Deno.serve` global (source #8). No deprecation banner was found in docs.deno.com page, but Deno team has signaled std/http/server is superseded.

### 2.5 Connection pooling `@supabase/supabase-js`

Source #1 explicit guidance: treat **"Postgres like a remote, pooled service"** → use connection pools or serverless-friendly drivers. Inside Edge Functions:
- Use `createClient(url, key, { db: { schema: 'public' } })` per-request OR cache at module scope.
- Module-scope client reuse benefits from isolate warmth — once created in a warm isolate, subsequent requests skip TCP/TLS handshake.
- No explicit pool size param exposed; underlying `fetch` uses HTTP keep-alive.

### 2.6 Promise.race + AbortController (non-blocking timeouts)

Source #9 demonstrates the pattern:
```ts
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);
EdgeRuntime.waitUntil(
  expensiveOperation({ signal: controller.signal })
    .finally(() => clearTimeout(timeout))
);
return new Response('Processing...');
```

Existing `unlim-chat/index.ts:65-78` already uses this for TTS:
```ts
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);
const res = await fetch(VPS_TTS_URL, { ..., signal: controller.signal });
clearTimeout(timeout);
```

For **Promise.race** specifically (not seen in docs but standard JS):
```ts
const result = await Promise.race([
  callLLM(...),
  new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))
]);
```

Iter 38 Atom A3 already uses `Promise.all` (parallel I/O) per migration log. Promise.race is the right tool for **timeout-OR-result**, not parallelism.

---

## 3. Copy-Ready Snippet Locations

| Need | File | Lines | Description |
|------|------|-------|-------------|
| Existing warmup cron | `supabase/migrations/20260430220000_unlim_chat_warmup_cron.sql` | 53-63 | `cron.schedule('unlim-chat-warmup-30s', '30 seconds', net.http_get(...))` |
| Drop-and-recreate pattern | same file | 37-43 | `DO $$ BEGIN PERFORM cron.unschedule(...) EXCEPTION WHEN OTHERS THEN NULL; END$$` |
| AbortController + fetch timeout | `supabase/functions/unlim-chat/index.ts` | 65-78 | TTS request with 5s abort |
| `Deno.env.get` with `.trim()` | `supabase/functions/unlim-chat/index.ts` | 47 | `Deno.env.get('VPS_TTS_URL') \|\| '<default>'` |
| Legacy `serve` import to migrate | `supabase/functions/unlim-chat/index.ts` | 9 | `import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'` |
| `serve(async (req) => {...})` shape | `supabase/functions/unlim-chat/index.ts` | 111 | OPTIONS handler returns 204 with CORS |

---

## 4. Allowed APIs (copy-able list)

### Runtime (Deno globals)
- ✅ `Deno.serve(handler)` — **canonical** since Deno 1.35.
- ✅ `Deno.serve({ port, hostname, signal, onListen }, handler)` — options bag overload.
- ✅ `Deno.env.get(name: string): string | undefined` — always `.trim()` (CLAUDE.md rule #5, Vercel trailing `\n` bug).
- ✅ `EdgeRuntime.waitUntil(promise)` — fire-and-forget background tasks, keeps isolate alive until promise settles.
- ⚠️ `import { serve } from 'https://deno.land/std@<ver>/http/server.ts'` — works (used in `unlim-chat`) but superseded by `Deno.serve`. Migration is low-risk.

### Web standards (inside Deno)
- ✅ `fetch(url, { signal })` — standard `fetch` with `AbortController`.
- ✅ `AbortController` + `setTimeout(() => controller.abort(), ms)` — verified in `unlim-chat:65-78`.
- ✅ `Promise.race([call, timeoutReject])` — timeout-OR-result pattern.
- ✅ `Promise.all([p1, p2])` — already used iter 38 A3 for `loadStudentContext` + RAG retrieve parallelization.

### Postgres extensions (in migrations)
- ✅ `CREATE EXTENSION IF NOT EXISTS pg_cron;` — required for `cron.schedule`.
- ✅ `CREATE EXTENSION IF NOT EXISTS pg_net;` — required for `net.http_get` / `net.http_post`.
- ✅ `cron.schedule(jobname text, schedule text, command text)` — sub-minute via `'30 seconds'`.
- ✅ `cron.unschedule(jobname)` — idempotent re-apply.
- ✅ `net.http_get(url, params, headers, timeout_milliseconds)` — returns `bigint` request_id (async).
- ✅ `net.http_post(url, body, params, headers, timeout_milliseconds)` — same async semantics.

---

## 5. Anti-Patterns (AVOID)

| Anti-pattern | Why bad | Where currently OK / used |
|--------------|---------|---------------------------|
| Blocking `await` on TTS/vision in hot path before response | Wall clock counts toward 150s/400s; user waits | `unlim-chat:68` is awaited but inside `requestTTS()` helper called WITHOUT `await` (line 92 returns null on fail) — OK |
| `Deno.env.get` without `.trim()` | Vercel injects trailing `\n` causing auth failures | CLAUDE.md rule #5 |
| Recreating `@supabase/supabase-js` client per request | TCP/TLS handshake cost ~30-50ms | Module-scope client preferred |
| `cron.schedule` with 5-field syntax for <1min | Crontab min = 1min | Use `'N seconds'` interval form |
| `fetch` without `AbortController` | Hangs until 150s idle timeout (504) | Iter 38 A4 mandated 5s timeouts |
| Synchronous query for `net._http_response` after warmup | Defeats async purpose | Fire-and-forget is the point |
| `import { serve } from 'std@old/http'` in NEW functions | Superseded by `Deno.serve` global | Existing `unlim-chat` legacy — migrate when touched |
| Heavy ESM imports at top of file (no lazy) | Each adds ~25-83ms cold boot (source #4 numbers) | `unlim-chat:9-43` imports 20+ modules — candidate for review |

---

## 6. Confidence + Gaps

### High confidence
- pg_cron `'30 seconds'` syntax: ✅ vendor-confirmed (source #6).
- pg_net `net.http_get` signature: ✅ vendor-confirmed (source #7).
- Edge Function hard limits (150s/400s/256MB/2s CPU): ✅ vendor-confirmed (source #2).
- Module boot times 25/57/83ms post-optimization: ✅ vendor-published benchmarks (source #4).
- Live warm-OPTIONS measured ~190-200ms: ✅ reproducible curl 5x.

### Medium confidence
- Isolate idle-eviction TTL: ⚠️ **NOT vendor-published**. Iter 38 A5 comment cites "1-2 min" — community knowledge, not in docs. Warmup-every-30s is **defensive** under this assumption.
- `Deno.serve` vs `serve` from `std/http` deprecation: ⚠️ no formal deprecation banner. Migration is low-risk modernization.
- `EdgeRuntime.waitUntil` semantics on Free tier: ⚠️ source #9 doesn't tier-distinguish; behavior may differ on Free 150s wall clock vs Pro 400s.

### Gaps requiring follow-up
1. **Cron job applied prod — UNVERIFIED via REST**. Live curl returned `HTTP 404 PGRST205 "Could not find the table 'public.cron_job' in the schema cache"`. This is **expected** because PostgREST does not auto-expose `cron.*` schema. Verification path:
   ```bash
   SUPABASE_ACCESS_TOKEN=sbp_... npx supabase db query --linked \
     "SELECT jobid, schedule, active, command FROM cron.job WHERE jobname = 'unlim-chat-warmup-30s'"
   ```
   Or paste into Supabase Dashboard → SQL Editor. Cannot do this from subagent (no SUPABASE_ACCESS_TOKEN exported). **Action item iter 24 impl phase**: Andrea run the query above to confirm cron firing.
2. **Deno 2.1 specifics**: blog URL 404. Substitute source #4 has only 3 dep benchmarks. If iter 24 needs Deno 2.1 feature surface (e.g., new `Deno.serve` shapes), consult `https://deno.com/blog/v1.46`+ or `deno.com/blog/v2.1` directly (not tested here).
3. **Cron firing evidence on `unlim-chat`**: live OPTIONS ~200ms warm could ALSO be explained by sustained traffic. To isolate cron impact: query `net._http_response` table filtered by `created_at > now() - interval '5 minutes'` AND `url LIKE '%unlim-chat%'`. Same DB query gate as gap #1.
4. **Iter 38 A5 OPTIONS-vs-empty-headers note in migration comment** (line 48-52) claims the cron uses OPTIONS to hit CORS preflight. **Actual SQL on line 57 uses `net.http_get` not OPTIONS**. Minor inconsistency between comment narrative and SQL — does not affect functionality (GET also hits the function and exercises isolate; CORS-OPTIONS would arguably be cheaper if `net.http_options` existed, which it does not in pg_net).

### Recommendations for iter 24 implementation phase
1. **Verify cron prod** via `supabase db query --linked` (Andrea, 30s).
2. **Migrate `unlim-chat:9` from `serve(std/http)` to `Deno.serve` global** — surgical 2-line change, no behavior delta, removes one ESM module from cold-boot graph.
3. **Audit `unlim-chat:9-43` heavy import block** — 20+ shared modules imported at top. Per source #4 ("lazy evaluating dependencies"), consider dynamic `await import(...)` for paths only used conditionally (e.g., vision-only modules when no image, intent-tools-schema only when `ENABLE_INTENT_TOOLS_SCHEMA`).
4. **Add `cron.job` health-check query** to Andrea's iter 24 entrance CoV step. One-liner: `SELECT count(*) FROM cron.job WHERE jobname = 'unlim-chat-warmup-30s' AND active = true` → expect 1.
5. **Promise.race timeout wrapper** as shared util in `_shared/` for any LLM call exceeding 8s budget (current PDR §4 R5 latency mechanical cap context). Pattern:
   ```ts
   export async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
     const ac = new AbortController();
     const t = setTimeout(() => ac.abort(), ms);
     try {
       return await Promise.race([
         p,
         new Promise<T>((_, rej) =>
           ac.signal.addEventListener('abort', () => rej(new Error(`${label} timeout ${ms}ms`)))
         )
       ]);
     } finally { clearTimeout(t); }
   }
   ```

---

## 7. Honesty Caveats (G45 anti-inflation)

- I did NOT execute `supabase db query --linked` (no SUPABASE_ACCESS_TOKEN exposed to subagent context). Cron firing status is **unverified**. Treat the iter 38 A5 migration as "applied at file level, runtime status TBD".
- Source #3 (Deno 2.1 blog) was 404 — Deno 2.1 specifics could not be cited primary-source. Findings rely on source #4 (faster-smaller) benchmarks for ms numbers.
- Live measured ~200ms warm OPTIONS does NOT prove the cron is the cause. Could be baseline prod traffic. Isolating requires the `net._http_response` query.
- "1-2 min idle eviction" cited iter 38 A5 migration is **community estimate**, not vendor-published. The 30-second cron is defensive over-provisioning under this assumption.
- I read 120 lines of `unlim-chat/index.ts` (the file is much longer, ~330+ LOC per CLAUDE.md iter 37 references). Conclusions about "heavy import block" assume the top-of-file pattern continues — quick check for any deferred dynamic imports below line 120 was NOT done.
