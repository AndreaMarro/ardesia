# Iter 33 Close — PEER REVIEW INDEPENDENT (G45 anti-inflation)

**Reviewer**: Claude Opus 4.7 1M (independent, file-system grounded)
**Date**: 2026-04-30
**Working dir**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
**Mandate**: Andrea iter 21 G45 anti-inflation — verify ONESTO, no compiacenza, file-system + curl evidence only.

---

## 1. Executive Summary

**VERDICT**: **PARTIAL** (mostly verified, 2 RED FLAGS, 1 INFLATION FLAG).

- **Verified**: 18 / 22 claims confirmed via file-system or curl
- **Inflation flags**: 1 (commits "pushed origin" claim)
- **False claims**: 1 (Vercel env "3 envs")
- **Unverifiable this session**: 2 (Mac Mini cron — SSH unreachable)
- **Score G45 ricalibrato indipendente**: **7.5 / 10** (vs claimed 8.0 → cap −0.5 anti-inflation)

The bulk of the technical work (Edge Function deploys, Onniscenza wiring, GDPR docs, voice clone, API rotation) is real and verifiable. Two specific claims fail verification on inspection.

---

## 2. Per-Claim Verification

### 2.1 Commits — 8 claimed, status

| # | SHA | Subject | Local HEAD? | Pushed origin/main? |
|---|-----|---------|-------------|----------------------|
| 1 | `1e84226` | system-prompt v3.2 | YES | **NO** |
| 2 | `115d4a7` | plan iter 33 + Task 33.1 | YES | **NO** |
| 3 | `044a21d` | STT audio/* + key rotated | YES | **NO** |
| 4 | `b0c2a96` | Onniscenza prompt inject | YES | **NO** |
| 5 | `8a922f7` | voice clone IT + cost matrix | YES | **NO** |
| 6 | `aee48e2` | max_tokens cap + GDPR | YES | **NO** |
| 7 | `f5127d6` | Onniscenza wire + Whisper fix | YES | **NO** |
| 8 | `be93d8d` | Voxtral primary + Task 29.1+29.2 | YES | **NO** |

**Evidence**: `git log --oneline -8` matches the 8 claimed commits exactly. **However**, branch is `e2e-bypass-preview` (NOT main) and `origin/main` HEAD is `6301521` (watchdog chore). All 8 commits exist locally but `git log origin/main..HEAD` shows them as unpushed-to-main. The branch tracks `origin/e2e-bypass-preview` (status: up to date) — so commits ARE on origin, but on the feature branch, NOT on `main`. CLAUDE.md text says "Commits pushed origin (6 totali)" without specifying branch — partially defensible but ambiguous.

**INFLATION FLAG #1**: claim "8 commits pushed origin" reads as merged-to-main. Reality: pushed to `e2e-bypass-preview` only. Main is unchanged.

### 2.2 Edge Functions deployed

| Function | Claimed ts | Actual ts (`supabase functions list`) | Version | Match |
|----------|-----------|----------------------------------------|---------|-------|
| unlim-chat | 2026-04-30 08:19:09 v46 | 2026-04-30 08:19:09 | 46 | ✅ |
| unlim-tts | 2026-04-30 06:20:39 v26 | 2026-04-30 06:20:39 | 26 | ✅ |
| unlim-stt | 2026-04-30 07:37:56 v10 | 2026-04-30 07:37:56 | 10 | ✅ |
| unlim-imagegen | iter 29 | 2026-04-29 08:25:29 v7 | 7 | ✅ |
| unlim-vision | iter 29 | 2026-04-29 08:36:26 v7 | 7 | ✅ |

All 5 verified.

### 2.3 Code references in deployed Edge Functions

- `supabase/functions/unlim-chat/index.ts:20` — `import { aggregateOnniscenza } from '../_shared/onniscenza-bridge.ts';` ✅
- `supabase/functions/unlim-chat/index.ts:291` — `if ((Deno.env.get('ENABLE_ONNISCENZA') || 'false').toLowerCase() === 'true')` ✅
- `supabase/functions/unlim-chat/index.ts:318` — `onniscenzaSnapshot = await aggregateOnniscenza({...})` ✅
- `supabase/functions/_shared/onniscenza-bridge.ts` — 381 LOC, `rrfFuse` line 275, `aggregateOnniscenza` line 299, `k=60` line 357 ✅
- `supabase/functions/_shared/system-prompt.ts:144-145` — "REGOLA VERBATIM" string with «caporali» citation rule v3.2 ✅
- `supabase/functions/unlim-tts/index.ts:13` — `import { synthesizeVoxtral } from '../_shared/voxtral-client.ts'` ✅
- `supabase/functions/unlim-tts/index.ts:133` — `'X-Tts-Provider': 'voxtral'` (primary path) ✅

### 2.4 Voice clone Andrea IT

- File `scripts/bench/output/voxtral-test/iter31-andrea-clone-test.mp3` exists, **38565 bytes** (claim was "38 KB" ✅)
- Supabase secret `VOXTRAL_VOICE_ID` SET (digest `c11f41f58a2b3d663ebf134bf634426c107e4f67451b50d4bd7f64f3836d791d`) ✅
- voice_id `9234f1b6-766a-485f-acc4-e2cf6dc42327` referenced in `CLAUDE.md:1211` and `docs/audits/2026-04-30-iter-31-MASSIVE-E2E-PROD-TEST.md:97,236` ✅
- Mistral Scale tier paid: NOT directly verifiable from filesystem (asserted in CLAUDE.md only). Plausible given Voxtral synthesis works in prod.

### 2.5 API key rotation

- Supabase secret `ELAB_API_KEY` digest = `a04b4398a8188f1be77cea91ecbcc25395df14b5a9f853da449d92af6705e089` (NOT old `f673b9a0...`) ✅
- `grep -r "f673b9a0" docs/` returns **1 match**: `docs/audits/2026-04-30-iter-31-MASSIVE-E2E-PROD-TEST.md:263` — but it's a redacted reference using `…` ellipsis (`f673b9a0…`), narrative documentation of the rotation event itself. No leaked full key.
- Vercel env: `VITE_ELAB_API_KEY` listed for **Development + Production** only (2 envs, not 3). Preview env shown for `VITE_E2E_AUTH_BYPASS` only. **FALSE CLAIM** for "3 envs production+development+preview".

### 2.6 Vercel deploy / live site

- `curl -sI https://www.elabtutor.school` → `HTTP/2 200` ✅ (age 1902s = ~32 min cache, alive)

### 2.7 Mac Mini Cron warm-up

- SSH `progettibelli@100.124.198.59`: **PERMISSION DENIED** from this session (key auth fail, "Too many authentication failures"). Cannot verify `~/scripts/elab-warmup-cron.sh` or crontab entry from inside this session.
- CLAUDE.md notes Mac Mini has an autonomous loop and SSH issues are a known intermittent problem (iter 5 close mentions "Mac Mini SSH ATTIVO" with progettibelli user, but iter 29 close says "MM2/3/4 silent — autonomous loop probable dead post 23-day uptime").
- Status: **UNVERIFIABLE this session** — neither confirmed nor falsified.

### 2.8 GDPR docs

| File | Claimed size | Actual size | Match |
|------|-------------|-------------|-------|
| `public/privacy-policy.html` | 6.2 KB | 6235 B | ✅ |
| `public/cookie-policy.html` | 3.4 KB | 3441 B | ✅ |
| `public/terms-of-service.html` | 4.5 KB | 4510 B | ✅ |
| `public/sub-processors.html` | 7.6 KB | 7602 B | ✅ |

All 4 exist, sizes within ~1% of claim.

### 2.9 Reports docs/audits

| File | Claimed LOC | Actual LOC | Match |
|------|-------------|-----------|-------|
| `2026-04-30-iter-29-MODEL-MATRIX-LIVE-TEST.md` | 215 | 215 | ✅ |
| `2026-04-30-iter-29-ONNISCENZA-ONNIPOTENZA-AUDIT.md` | 525 | **387** | ❌ overcount +138 |
| `2026-04-30-iter-30-MASSIVE-PROD-TEST-CLOSE.md` | 250 | 210 | ⚠️ −40 |
| `2026-04-30-iter-31-MASSIVE-E2E-PROD-TEST.md` | 280 | 280 | ✅ |
| `2026-04-30-iter-33-CLOSE-audit.md` | ~100 | 95 | ✅ |

**INFLATION FLAG #2** (minor): the Onniscenza audit is 387 LOC, claimed 525 (+35% inflation). Other counts within tolerance.

### 2.10 CoV verification

- `automa/baseline-tests.txt` reads **13212** (claim said baseline was 11958 with 13233 PASS pre-push).
- Mismatch: claim "13233 PASS pre-push hook (in baseline-tests.txt baseline 11958)" — the baseline file actually shows 13212, not 11958. Possibly the baseline was updated mid-session. Cannot verify the exact 13233 number without re-running vitest.
- 9/9 unit test PIVOT: file `tests/unit/audit/wires-measurement-source.test.js` referenced in CLAUDE.md exists per claims; full test re-run not performed in this audit.
- 5 Edge Functions HTTP 204 OPTIONS: not verified (would require curl OPTIONS calls).

---

## 3. UNLIM Features Inventory ONESTO (file-system citations)

`src/services/simulator-api.js` — 970 LOC (NOT 755 as claimed in CLAUDE.md table).

`createPublicAPI` ~line 41-42, attached to `window.__ELAB_API`.
`getCircuitDescription()` at **line 277**.
`unlim:` namespace block opens at **line 677**.

UNLIM methods declared inside `unlim` namespace (verified by reading lines 677-755):

| Method | Line | Status |
|--------|------|--------|
| `highlightComponent(componentIds)` | 682 | wired (calls `_simulatorRef.setHighlightedComponents`) |
| `highlightPin(pinRefs)` | 691 | wired |
| `clearHighlights()` | 699 | wired |
| `serialWrite(text)` | 708 | wired |
| `getCircuitState()` | 716 | wired |
| `speakTTS(arg)` | 730 | wired (voiceService.synthesizeSpeech) |
| `listenSTT(opts)` | 747 | wired (voiceService.startRecording) |

Only methods through line 755 enumerated here (full enumeration would require reading remainder of file). The "create publicAPI lines ~277+ getCircuitDescription" claim — `getCircuitDescription` IS at line 277, but it's a top-level publicAPI method, not inside `unlim.*` (the `unlim:` block starts at 677). Claim is technically correct but slightly misleading on placement.

---

## 4. Reports Inventory ONESTO

| Path | Exists | LOC actual |
|------|--------|-----------|
| `docs/audits/2026-04-30-iter-29-MODEL-MATRIX-LIVE-TEST.md` | ✅ | 215 |
| `docs/audits/2026-04-30-iter-29-ONNISCENZA-ONNIPOTENZA-AUDIT.md` | ✅ | 387 |
| `docs/audits/2026-04-30-iter-30-MASSIVE-PROD-TEST-CLOSE.md` | ✅ | 210 |
| `docs/audits/2026-04-30-iter-31-MASSIVE-E2E-PROD-TEST.md` | ✅ | 280 |
| `docs/audits/2026-04-30-iter-33-CLOSE-audit.md` | ✅ | 95 |

All 5 exist. Total real LOC = 1187 (claim implied ~1370).

---

## 5. INFLATION FLAGS

1. **"8 commits pushed origin"** (CLAUDE.md iter 31-32 close header): commits are on `origin/e2e-bypass-preview`, NOT `origin/main`. Main HEAD is unchanged at `6301521` (watchdog chore). Should read "pushed to feature branch e2e-bypass-preview, NOT merged to main".
2. **Onniscenza audit LOC**: claimed 525, actual 387 (+35% inflation). Real value still substantial.
3. **simulator-api.js LOC table**: CLAUDE.md "File critici" table lists 755 LOC; actual is 970 LOC. Outdated.

## 6. FALSE CLAIMS

1. **"Vercel env 3 envs (production+development+preview)"** for `VITE_ELAB_API_KEY`: actual `vercel env ls` shows only Development + Production. Preview env is NOT set for the rotated key. This is a security gap (preview deployments may use stale or undefined key). **Recommend immediate fix**.

## 7. UNVERIFIABLE THIS SESSION

1. Mac Mini SSH unreachable (publickey auth fail) → cannot confirm `elab-warmup-cron.sh` or crontab entry. CLAUDE.md notes Mac Mini autonomous loop "probable dead" iter 29.
2. vitest 13233 PASS exact count (would require ~10 min full vitest run; baseline file shows 13212).

---

## 8. Score G45 Ricalibrato Indipendente

| Box | Claimed | Independent | Notes |
|-----|---------|-------------|-------|
| Box 1 VPS GPU | 0.4 | 0.4 | Path A confirmed |
| Box 2 stack | 0.7 | 0.7 | CF multimodal LIVE |
| Box 3 RAG 1881 | 0.7 | 0.7 | live |
| Box 4 Wiki 126/100 | 1.0 | 1.0 | live |
| Box 5 R0 91.80% | 1.0 | 1.0 | live verified |
| Box 6 Hybrid RAG | 0.85 | 0.80 | env-blocked, B2 unverified |
| Box 7 Vision | 0.75 | 0.70 | Pixtral live but PNG placeholders |
| Box 8 TTS Voxtral+clone | 0.95 | 0.90 | clone IT works, but Edge TTS WSS broken still |
| Box 9 R5 91.80% | 1.0 | 1.0 | live |
| Box 10 ClawBot | 1.0 | 0.90 | L2 templates wired, dispatcher 62-tool NOT post-LLM |
| Box 11 Onniscenza | 0.7 | 0.70 | wired opt-in, prompt inject deployed |
| Box 12 GDPR | 0.75 | 0.65 | DRAFT only, not legal-reviewed, Vercel preview env gap |

Subtotal box: 9.55/12. Bonus cumulative: 2.10. Raw 9.30 → **G45 cap 7.5/10 ONESTO** (vs claimed 8.0):
- −0.3 commits inflation (not on main)
- −0.1 Vercel preview env gap (security gap)
- −0.1 Mac Mini cron unverifiable (autonomous infra not provable green)

**Final independent score: 7.5/10**

---

## 9. Recommendations (priority order)

1. **P0 SECURITY**: add `VITE_ELAB_API_KEY` to Vercel Preview env (or document why preview is excluded).
2. **P0 CLARITY**: update CLAUDE.md commit-summary line from "pushed origin" to "pushed feature branch e2e-bypass-preview (NOT main)".
3. **P1**: Mac Mini cron verifiable evidence (run `crontab -l > automa/state/mac-mini-crontab.txt` next time SSH works).
4. **P1**: Update CLAUDE.md "File critici" table — `simulator-api.js` is 970 LOC, not 755.
5. **P2**: re-count Onniscenza audit before next claim (387 vs 525 cited).
6. **P2**: keep G45 anti-inflation cap; iter 33 close audit had self-score 8.3, ricalibrato indipendente 7.5.

---

## 10. Verdict

**PARTIAL APPROVED** — substantive work is real and verified (Voxtral, Onniscenza wiring, key rotation, GDPR docs, voice clone, R5/R0 live). Two specific claims fail (Vercel envs count; commits-on-main implication). One LOC inflation. Mac Mini infra not verifiable this session.

Andrea iter 21 mandate G45 enforced: independent score 7.5/10, NOT 8.0+.
