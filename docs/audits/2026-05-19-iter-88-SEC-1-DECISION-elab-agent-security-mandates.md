# Iter 88 SEC-1 — ELAB Compile Agent §10.5 security 3 mandates DECISION

**Date**: 2026-05-19 (iter 88 PHASE 1)
**Trigger**: iter 77 PHASE 4 P0.3c FINDING — doc claim "6 mandates shipped iter 75 CC-1 BG backend-security-coder" MA reality 3/6 implementati. Iter 87 PHASE 4c critique gap unresolved iter 88 entrance.
**Audience**: Andrea ratify decision iter 89 entrance.

---

## §1 Stato attuale `src/services/elab-agent/http-server.js` LIVE

### §1.1 Implementati 3/6 (verified iter 77 P0.3c audit + iter 88 inline re-read)

1. ✅ **CORS Origin allowlist**: `ALLOWED_ORIGINS` Set 6 entries (`http://localhost:{5173,4173,8765}` + `http://127.0.0.1:{5173,4173,8765}` post iter 80.A6 CORS 4173 fix). Strict 403 hard reject for denied origins (NOT echo wildcard).
2. ✅ **Bind 127.0.0.1 loopback only**: Express server `app.listen(8765, '127.0.0.1', ...)` NOT `0.0.0.0` — prevents LAN exposure. Docente Mac/Windows local only.
3. ✅ **JSON body parser 100KB cap default Express**: protects against oversize POST payloads naive flooding.

### §1.2 Missing 3/6 (iter 88 carryover Andrea ratify)

4. ❌ **Auth token Bearer validation**: spec mandate `Authorization: Bearer <ELAB_AGENT_TOKEN>` header validated server-side. Currently anyone with loopback access (any process on Mac) can POST `/compile` + spawn arduino-cli. Threat model: malicious local app (e.g. browser extension OR background dev daemon) sends crafted sketch.
5. ❌ **Rate limit per-IP 10/min**: spec mandate (matches Cloud Render iter 87 PHASE 3 30/min). Currently unlimited POST `/compile` per second. Threat: accidental loop OR denial via flooding (resource exhaustion arduino-cli compile ~5s each).
6. ❌ **Sketch size limit 100KB**: spec mandate explicit sketch payload validate ≤100KB pre-compile. Currently JSON body parser default cap 100KB MA NO explicit `sketchCode` length check (smuggles via JSON other fields).

(Note: spec §10.5 also mentions **sandbox cleanup** as 7th item — temp build dir cleanup post-compile. NOT counted in 3/6 finding; iter 77 P0.3c verified `cleanup()` already exists `server.js:285+` post handleCompile.)

---

## §2 Decision options Andrea iter 89 ratify

### Option A — IMPLEMENT 3 missing mandates (~3-4h orchestrator inline)

| Mandate | File | Effort | Risk |
|---|---|---|---|
| Auth token Bearer | `http-server.js` middleware + `ELAB_AGENT_TOKEN` env var | ~1h | Low — middleware pattern standard, breaks existing frontend if token not propagated |
| Rate limit 10/min per-IP | `http-server.js` + `express-rate-limit` npm (~12KB) | ~1h | Low — popular lib (8k stars), but adds dep (Andrea regola 13 ratify req) |
| Sketch size 100KB | `http-server.js` middleware pre-handler | ~30min | Low — pure validation, no dep |
| Tests | `tests/unit/services/elab-agent/http-server-security.test.js` NEW 12+ tests | ~1h | Low |

Pro:
- Honest closure iter 77 P0.3c FINDING (10+ iter carryover)
- Defense-in-depth local agent (defensive against accidental loop / malicious local app)
- Spec §10.5 contract honored end-to-end
- iter 88 close 9.5/10 target achievable + Box 26 ELAB Agent §10.5 0.40 → 0.95

Con:
- ~3-4h work (orchestrator OR backend-security-coder subagent BG)
- Adds 1 npm dep (`express-rate-limit`) — Andrea regola 13 ratify required
- Frontend `CompileUploadButton.jsx` + `api.js` must propagate `ELAB_AGENT_TOKEN` env (1h frontend integration)
- Existing LOCAL Agent users (Andrea local dev) need re-config (NEW env var)

### Option B — DOCS clarify "aspirational" honest cap (~30min)

Update `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` §10.5 to mark 3 missing mandates as "ASPIRATIONAL iter 89+" with explicit reason: iter 75 CC-1 BG backend-security-coder shipped 3/6, 3 deferred for Riccardo demo + Sprint U close gate.

Update CLAUDE.md Sprint U history iter 77 PHASE 4 §entry — mark P0.3c FINDING explicit "aspirational doc decision iter 88 SEC-1 Andrea ratify Option B".

Pro:
- 30min vs 3-4h (~7× faster Sprint U close path)
- ZERO dependency add (regola 13 not triggered)
- NO frontend integration risk

Con:
- Local agent threat surface persists (mitigated by 127.0.0.1 bind + dev-only scope)
- iter 87 PHASE 4c critique #6 P0 partial close (security gap persists, marked aspirational)
- iter 88 close 9.4-9.5/10 cap (NOT lift Box 26)
- Tech debt accumulates iter 89+ (typical defer-then-forget pattern)

### Option C — HYBRID: ship 1/3 mandate + docs other 2 aspirational (~1.5h)

Ship **rate limit 10/min** ONLY (highest threat — resource exhaustion accidental loop in browser bug). Mark auth Bearer + sketch size as aspirational iter 89+ docs.

Pro:
- ~1.5h vs 3-4h or 30min
- Mitigates highest threat (resource exhaustion vs sketchCode malicious)
- 1 npm dep ratify (Andrea regola 13)
- iter 88 close 9.4 cap (partial lift Box 26 0.40 → 0.65)

Con:
- Compromise option, audit confusion
- Future iter still needs auth + size mandates

---

## §3 Threat model honest assessment

LOCAL Agent threat model bounded by:
- Loopback bind 127.0.0.1 (no LAN/internet exposure)
- Dev-only use case docente Mac
- arduino-cli compile sandbox temp dir cleanup
- Riccardo demo target: Andrea local laptop ONLY

Realistic threats:
1. **Accidental browser loop** (DevTools console error → fetch loop) → rate limit MITIGATE
2. **Malicious local app on docente Mac** (low likelihood, requires installed malware) → auth token MITIGATE
3. **Crafted sketch resource exhaustion** (10MB sketch in JSON) → size limit MITIGATE

Severity ranking: 1 HIGH (likely accidental dev bug), 2 LOW (requires prior compromise), 3 MEDIUM (intentional abuse).

---

## §4 Recommendation Andrea ratify iter 89

**Option C HYBRID (rate limit only) RACCOMANDATO** for Sprint U Riccardo demo readiness:
- Closes highest realistic threat (accidental loop)
- 1.5h scope fits iter 89 inline
- Defers low-severity threats to iter 90+ with honest docs
- `express-rate-limit` npm 8k stars + Apache-2.0 (Andrea regola 13 ratify low risk)

**OR Option B DOCS** if Andrea prefers Sprint U Riccardo demo focus → backlog technical debt iter 90+ Sprint V scope.

**NOT recommended Option A FULL** — 3-4h iter 89 budget conflict with 94 esperimenti audit + Vol3 narrative + Davide co-author iter 73+ carryover (higher Sprint U close blocker).

---

## §5 Andrea ratify queue gruppo 13 iter 89 entrance

1. SEC-1 Option A / B / C decision (Sprint U Riccardo demo gate)
2. (post Option C) `npm install express-rate-limit` regola 13 ratify
3. Hardware UAT Nano R4 USB schedule (Tea/Riccardo/Omaric)
4. SEC-1 ship execution iter 89 (~1.5h Option C inline OR ~30min Option B docs)

---

## §6 Anti-inflation G45 mandate SEC-1 enforced

- 3/6 mandates implementati HONEST (NOT inflated 6/6)
- 3/6 missing HONEST (NOT minimized "minor gaps")
- iter 77 P0.3c FINDING 10+ iter carryover acknowledged
- NO claim "Sprint U close" senza SEC-1 ratify gate (Box 26 0.40 → 0.65 OR 0.95)

© Andrea Marro — 2026-05-19 — ELAB Tutor iter 88 SEC-1 DECISION audit
