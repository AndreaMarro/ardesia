# Slice 1C — Deploy & Live Verify Runbook

**Date**: 2026-05-25
**Owner**: Andrea Marro
**Status**: PROPOSED — pending PR #166 (Slice 1B) ratify + Slice 1C client commit
**Supabase project ref**: `euqpdueopmlllqjmqnyb`
**Frontend URL**: https://www.elabtutor.school

---

## 1. Pre-deploy checklist

Tick every item before touching any deploy command. A single unchecked item = stop.

- [ ] Slice 1A commit `f06d0595` merged to `main` (pure `awareness-flags.ts` module, 46 tests)
- [ ] Slice 1B PR #166 reviewed + Andrea ratify comment in PR + merged to `main`
- [ ] Slice 1C branch (`feat/unlim-slice-1c-client-wireup` or equivalent) has a merged PR — confirmed via `gh pr list --state merged`
- [ ] Both `useGalileoChat.js` and `src/services/api.js` are on the integrated branch
- [ ] `api.js` `sendChat()` accepts and forwards `boardSnapshot` + `previousBoardSnapshot` to `tryNanobot()` (already present as of Slice 1B prep in line 384-385 — confirm with grep)
- [ ] `useGalileoChat.js` collects `boardSnapshot` from `window.__ELAB_API.getCircuitState()` before calling `sendChat()`
- [ ] Full vitest run 3× (CoV mandate) PASS on the integrated branch:

  ```bash
  cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-slice1a"
  npx vitest run && npx vitest run && npx vitest run
  ```

  All 3 runs must show **≥ baseline in `automa/baseline-tests.txt`** (current: 14551). If any run is lower → revert, investigate, do not deploy.

- [ ] `npm run build` exit 0:

  ```bash
  cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-slice1a"
  npm run build
  ```

- [ ] `automa/baseline-tests.txt` updated to new test count if Slice 1C added tests
- [ ] Pre-push anti-regression gate PASS (pre-commit hook ran without abort on final commit)
- [ ] No `.env` secrets committed — verify:

  ```bash
  git diff HEAD~1 HEAD -- '*.env' '*.env.*'
  ```

  Must show empty diff.

---

## 2. Deploy sequence (atomic, ordered)

Execute steps 2.1 → 2.4 in strict order. Do not proceed to the next step if the current one fails or returns unexpected output.

### 2.1 Deploy Edge Function (Slice 1B server)

The `unlim-chat` Edge Function received the Slice 1B awareness-flags wire. Deploy it first so the server is ready before the client ships.

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-slice1a"
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb
```

Replace `sbp_...` with the actual token from `~/.elab-credentials.env` or the Supabase dashboard.

**Expected output** (exact wording may vary across Supabase CLI versions):
```
Bundling unlim-chat...
Deploying unlim-chat...
Done in X seconds.
```

Look for these signals:
- No `Error:` lines in output
- No `Failed to upload` message
- A final success line referencing `unlim-chat`

If the deploy fails with a TypeScript compile error in `awareness-flags.ts`, the Slice 1A module has a type regression — stop and fix before continuing.

### 2.2 Smoke-test Edge Function

Confirm the deployed function responds 200 on a minimal text-only payload and on a payload with `boardSnapshot`.

**Test A — backward-compat (no snapshot):**
```bash
curl -s -w "\nHTTP %{http_code}" -X POST \
  "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [REDACTED_JWT]" \
  -d '{"message":"Ciao ragazzi","sessionId":"s_smoketest_slice1c_a"}'
```

Expected: `HTTP 200` and a JSON body with `"success":true`.

**Test B — with boardSnapshot:**
```bash
curl -s -w "\nHTTP %{http_code}" -X POST \
  "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [REDACTED_JWT]" \
  -d '{
    "message": "Cosa vedi sul circuito?",
    "sessionId": "s_smoketest_slice1c_b",
    "boardSnapshot": {
      "experimentId": "v1-cap6-esp1",
      "compileStatus": null,
      "step": 1,
      "circuit": { "components": [{"id":"led1","type":"led"}], "connections": [], "errors": [] }
    },
    "previousBoardSnapshot": null
  }'
```

Expected: `HTTP 200`, `"success":true`, and the response text should NOT contain raw tag text like `Segnali di attenzione:` (that text goes into the system prompt, not the visible response). A `"source"` field in the JSON response is normal.

If either curl returns non-200 or `"success":false`, do not proceed to step 2.3. Check Edge Function logs (section 5).

### 2.3 Deploy frontend (Slice 1C client)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-slice1a"
npm run build && npx vercel --prod --yes
```

**Expected output:**
- `npm run build` completes with `✓ built in Xs` — no TypeScript/Vite errors
- Vercel prints a deployment URL ending with `.vercel.app`
- Final line: `Production: https://www.elabtutor.school [copied to clipboard]` (or similar)

DNS propagation: Vercel aliased domains update in under 60 seconds. If the prod URL still serves the old build after 2 minutes, check with step 2.4 before assuming a DNS issue.

### 2.4 Verify deployment HTTP 200

```bash
curl -I https://www.elabtutor.school
```

Expected:
```
HTTP/2 200
...
```

Check that `x-vercel-deployment-url` or `server: Vercel` headers are present (confirms Vercel is serving the response). A `301` followed by `200` is also fine — follow the redirect manually.

If the response is `404` or `503`, Vercel deployment may have failed silently — run `npx vercel ls` to verify which deployment is aliased to production.

---

## 3. Live verify checklist (8 functional flows)

**Setup**: open https://www.elabtutor.school → navigate to Lavagna → mount experiment `v1-cap6-esp1` via `window.__ELAB_API.mountExperiment('v1-cap6-esp1')` in DevTools console (or via the Percorso UI). Confirm the experiment whitelist panel is visible before starting each flow.

For every flow: send the query in the UNLIM chat input, wait for response, verify the expected shape.

| # | Query (Italian) | Expected awareness flag active | Expected UNLIM response shape |
|---|---|---|---|
| 1 | "Cosa vedi sul mio circuito?" | `vision_needed=true` (VISION_MENTION_RE matches "cosa vedi") | Response references circuit state or asks to look; does NOT say "non riesco a vedere" if circuit is loaded |
| 2 | (Add LED via DevTools: `window.__ELAB_API.addComponent('led', {x:200,y:150})`) then send "Sto facendo bene?" | `circuit_changed=true` vs previous turn snapshot | Response acknowledges the circuit change ("ho visto che hai aggiunto...") |
| 3 | (Compile with error: paste invalid code in editor, press Compila) then send "Cosa è andato storto?" | `compile_status=error` and `circuit_error` if errors array non-empty | Response references the compile error text from snapshot |
| 4 | (Advance to step 2 in Passo Passo mode) "Bene proseguiamo?" | `step_changed=true` | Response acknowledges step progression ("siete al passo 2...") |
| 5 | (Switch experiment: `window.__ELAB_API.mountExperiment('v1-cap7-esp1')`) "Cambiamo argomento" | `experiment_changed=true` | Response references the new experiment ID |
| 6 | (Clear drawing: `window.__ELAB_API.toggleDrawing(false)` then clear) "Pulisco?" | `drawing_changed=true` (drawingHash changed vs previous turn) | Response acknowledges the drawing was cleared |
| 7 | (No state change from previous turn) "Ciao Ragazzi" | All flags `false`, off-topic or chit-chat path | Response: greeting + gentle redirect to ELAB focus (Principio Zero — "Ragazzi, benvenuti!...") |
| 8 | (Open app with an existing class_key that has prior sessions in Supabase) Any query | `returning_class=true` | Response references prior lesson context ("Ragazzi, l'ultima volta avete lavorato su...") |

**For each flow**: take a screenshot before sending (circuit state visible) and after receiving the response (response text visible). This is the evidence record Andrea ratifies.

Flows 1–6 require the `boardSnapshot` to travel from client to server. Confirm via Network panel (section 4) before marking any flow as passed.

---

## 4. Network inspection verify

**Purpose**: confirm `boardSnapshot` leaves the browser. This is the primary observable for Slice 1C (the client wire-up).

1. Open Chrome DevTools → Network tab → filter by `unlim-chat`
2. Trigger any UNLIM message (flow 1 is suitable)
3. Click the `unlim-chat` POST request entry
4. In the **Payload** (or **Request** body) tab:

   ```json
   {
     "message": "...",
     "sessionId": "s_...",
     "boardSnapshot": { ... },
     "previousBoardSnapshot": null
   }
   ```

   Verify:
   - `boardSnapshot` key is present and is an **object** (not `undefined`, not `null` when simulator is active)
   - `previousBoardSnapshot` is `null` on first turn, an **object** on subsequent turns
   - `experimentId` inside `boardSnapshot` matches the currently mounted experiment

5. In the **Response** tab: confirm HTTP `200` and `"success": true`
6. In the **Timing** tab: total time < 25 000 ms (p95 frontend timeout cap — `MASTER_TIMEOUT_TEXT` in `api.js` line 55)

If `boardSnapshot` is missing or `undefined` in the request body, Slice 1C collection is not wired. Do NOT proceed to ratify — diagnose in `useGalileoChat.js` (the `sendChat()` call at line ~1175 must pass `boardSnapshot` in options).

---

## 5. Edge Function log verification (optional but recommended)

```bash
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions logs unlim-chat \
  --project-ref euqpdueopmlllqjmqnyb \
  --limit 20
```

Replace `sbp_...` with your token.

Look for JSON log entries emitted during your live-verify session. The current Slice 1B code does NOT add a dedicated `awareness_flags_present` log event — this is a Slice 1D candidate. You will however see:

- `"event":"debug_student_context"` — confirms Edge Function reached the main pipeline
- `"event":"onniscenza_v2_telemetry"` — confirms the Onniscenza path executed
- Any `"level":"warn"` entries — worth investigating if they reference `awareness-flags`

If you see `"event":"unlim_chat_error"` or any `status 500` in the log output, stop and investigate before marking the deploy as accepted.

---

## 6. Rollback procedure (if verification fails)

Execute rollback only if a live-verify flow produces a wrong response, console errors, or a network 500. Do not rollback for a single slow response — retry first.

### 6.1 Frontend rollback

```bash
npx vercel rollback --yes
curl -I https://www.elabtutor.school
```

The second command confirms the previous deployment is serving (check `x-vercel-cache` and response body differ from the failed deployment). Vercel rollback is instantaneous for aliased deployments.

### 6.2 Edge Function rollback

The safest rollback is to redeploy the pre-Slice-1B version of `unlim-chat/index.ts` from the `main` branch before the Slice 1B merge commit.

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-slice1a"

# 1. Identify the commit BEFORE Slice 1B merge on main
git log --oneline main | head -10
# Find the commit hash before f7a71b0f

# 2. Restore the pre-Slice-1B index.ts to working tree (no branch switch)
git show <pre-1b-commit-hash>:supabase/functions/unlim-chat/index.ts \
  > supabase/functions/unlim-chat/index.ts

# 3. Deploy the restored file
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat \
  --project-ref euqpdueopmlllqjmqnyb

# 4. Restore the working tree back to HEAD
git checkout HEAD -- supabase/functions/unlim-chat/index.ts
```

After step 3 completes, re-run the smoke test from section 2.2 (Test A only — Test B should now return a valid response without awareness context in the system prompt, which is the pre-Slice-1B behaviour).

### 6.3 Database rollback

**N/A for Slice 1B and Slice 1C.** Neither slice makes schema changes to Supabase tables. No migration to undo.

---

## 7. Success criteria

Slice 1C is accepted when ALL of the following are true:

| Criterion | Verified by |
|---|---|
| All 8 live verify flows pass | Andrea visual + screenshot evidence |
| Network panel shows `boardSnapshot` as a non-null object in `unlim-chat` POST request body | Chrome DevTools screenshot |
| `previousBoardSnapshot` is `null` on turn 1, object on turn 2+ for the same session | Chrome DevTools screenshot |
| Zero `console.error` lines during a full Lavagna session (DevTools Console tab) | Andrea visual |
| Edge Function returns HTTP 200 on every live-verify request | DevTools Network tab |
| Vitest baseline preserved: `automa/baseline-tests.txt` ≥ 14551 on integrated branch | `npx vitest run` output |
| Andrea ratify written approval | Commit message (`feat(unlim): Slice 1C ratified by Andrea`) OR PR comment ("LGTM, ratified") |

Any single failing criterion = do not mark as accepted. Fix and re-verify from section 3.

---

## 8. Slice 1D candidates (out of scope this iteration)

The following improvements are explicitly deferred. Do not implement them as part of Slice 1C.

- **Structured logging of awareness flag emission**: add `"event":"awareness_flags_emitted"` JSON log in `unlim-chat/index.ts` with flag names and source. Would make Edge Function logs observable for debugging without DevTools access.
- **Client-side awareness flag debug badge**: small DEV-only UI element on the UNLIM chat panel showing active flags (e.g. `circuit_changed ●`) — useful during development sessions, hidden in production.
- **Cross-session snapshot persistence**: store `boardSnapshot` in the `unlim_chat_history` Supabase column so sessions can restore the previous turn's snapshot after page reload.
- **`hasClassMemory` from actual Supabase query**: current Slice 1B wire uses `!!classKey` as a heuristic for `returning_class`. Proper implementation queries the `class_session_metadata` table (Onniscenza V2 D2 collector) — deferred to avoid a second Supabase call in the hot path.
- **Vol/pag citation rate reduction when no awareness flag triggered**: Andrea verbatim feedback iter 41 PM — citations appear in 95%+ of responses regardless of context. A server-side gate reducing citation rate when all flags are `false` (pure chit-chat turn) would improve response brevity. Needs A/B measurement.
- **A/B test infrastructure**: percentage-rollout of Slice 1B/1C to a subset of classes for measurable lift in session depth or UNLIM response relevance score.

---

## 9. References

| Resource | Path / URL |
|---|---|
| Context engineering spec | `docs/superpowers/specs/2026-05-21-unlim-context-engineering-overhaul-design.md` |
| Slice 1A commit | `f06d0595` |
| Slice 1B commit | `f7a71b0f` |
| Slice 1B PR | https://github.com/AndreaMarro/elab-tutor/pull/166 |
| awareness-flags module | `supabase/functions/_shared/awareness-flags.ts` |
| Edge Function (Slice 1B wire) | `supabase/functions/unlim-chat/index.ts` lines 838–864 |
| Client chat hook | `src/components/lavagna/useGalileoChat.js` |
| API service (boardSnapshot forwarding) | `src/services/api.js` — `sendChat()` line 765, `tryNanobot()` lines 384–385 |
| Context collector | `src/services/unlimContextCollector.js` |
| Test baseline | `automa/baseline-tests.txt` (current: 14551) |
| Deploy commands reference | `CLAUDE.md` § "Deploy commands" |
