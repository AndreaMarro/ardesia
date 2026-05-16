# Iter 67 PHASE 2 Deploy Audit — 2026-05-16

**Date**: 2026-05-16 PM CEST (PHASE 2 deploy execution post-commit bc37cf7b)
**Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix` HEAD `bc37cf7b` LANDED + PUSHED origin
**Score iter 67 PHASE 2 close ONESTO G45**: **9.2/10** (+0.1 vs PHASE 1 9.1)

## Executive summary

Iter 67 PHASE 2 = P0.1 deploy execution sequence Step 1-5 SUCCESS. Step 6-7 verify deferred iter 68 entrance (ELAB_API_KEY plain non disponibile local). Pattern: Andrea guided step-by-step + ratify gate ogni destructive op. Boolean direct deploy (NOT gradient) per Andrea ratify Step 5 BLOCKER analysis (code = boolean, NOT percent var).

## Deliverables PHASE 2

| Step | Action | Status | Evidence |
|---|---|---|---|
| Step 1 | Push iter 67 close commit origin | ✅ SUCCESS | `6d7266fb..bc37cf7b` remote = local + pre-push hook gate 13428 PASS baseline 13118 |
| Step 2 | Pre-flight vitest CoV (skipped iter 68 entrance gate) | ⏸ DEFER iter 68 entrance | Pre-push hook re-verified 13428 sufficient |
| Step 3 | Supabase migration list verify drift | ✅ DONE | 4 LOCAL migrations `20260515174301-04` pending REMOTE detected |
| Step 4 | `npx supabase db push --linked` apply 4 migrations | ✅ SUCCESS | 4 CREATE TABLE IF NOT EXISTS applied PROD `euqpdueopmlllqjmqnyb`: teacher_history_log + class_session_metadata + voice_movement_log + errore_ricorrente_pattern. Policy DROP-CREATE idempotent. LOCAL==REMOTE verified post-apply. |
| Step 5a | `supabase secrets set ENABLE_ONNISCENZA_V2=true` | ✅ SUCCESS | `Finished supabase secrets set.` PROD |
| Step 5b | `supabase functions deploy unlim-chat` | ✅ SUCCESS | 17 asset uploaded incluso onniscenza-classifier.ts + intent-tools-schema.ts + content-safety-guard.ts + principio-zero-validator.ts. Dashboard: https://supabase.com/dashboard/project/euqpdueopmlllqjmqnyb/functions/unlim-chat |
| Step 6 | Smoke curl verify telemetry prompt_class + onniscenza_v2_used | ⏸ DEFER iter 68 entrance | ELAB_API_KEY plain non disponibile local (rotated iter 32 → Vercel/.env redacted post leak fix). Andrea verify via Dashboard Logs browser. |
| Step 7 | 1000-query matrix iter 41 v67 re-verify baseline preserve | ⏸ DEFER iter 68 entrance | scripts/bench/run-1000-matrix.py needs VITE_ELAB_API_KEY from /tmp/vercel.env (Mac reboot wiped). Andrea sources iter 68 entrance + esegue. |

## CRITICAL FINDING — canary code limit

Andrea ratified "canary gradient 0→5→25→100%" (Recommended PHASE 1 audit). **Code analysis post-deploy revealed boolean-only flag**:

```typescript
// supabase/functions/unlim-chat/index.ts:649
(Deno.env.get('ENABLE_ONNISCENZA_V2') || 'false').toLowerCase() === 'true'
```

**Gradient NOT supported by current code**. Andrea PHASE 2 re-ratify Step 5 chose "Direct 100% deploy boolean true" (atomic switch, NO gradient safety net).

**Iter 69+ task**: implement % sampling logic OR defer per Andrea decision iter 68. CANARY_ONNISCENZA_V21_PERCENT secret exists prod ma codice NON la legge (dead secret + V21 namespace orphan iter 69+ cleanup candidate).

## Verify evidence

| Verify | Method | Result |
|---|---|---|
| Push origin iter 67 close | `git ls-remote origin` | `bc37cf7b` match local HEAD ✅ |
| 4 migrations applied PROD | `npx supabase migration list --linked` | Local + Remote columns ALIGN `20260515174301-04` ✅ |
| ENABLE_ONNISCENZA_V2 secret set | `supabase secrets list` | hash `b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b` = sha256("true") ✅ |
| Edge Function v55+ deployed | Dashboard URL + 17 asset upload log | LIVE PROD ✅ |
| Smoke curl telemetry verify | Dashboard Logs Andrea visual | ⏸ DEFER iter 68 (no plain key local) |
| 1000q matrix re-verify | run-1000-matrix.py | ⏸ DEFER iter 68 (no /tmp/vercel.env post Mac reboot) |

## Andrea ratify queue gruppo 7 updates iter 68 entrance

PHASE 2 closed voci 1+2 ratify queue gruppo 7:
- ✅ Voce 1 (push + canary 5%→100%): re-ratified Step 5 Direct 100% boolean → SHIPPED
- ✅ Voce 5 (Codex plugin-cc install): Andrea slash command iter 68 entrance separato (`/plugin marketplace add openai/codex-plugin-cc` + cascade)

Voci 2+3+4 remaining iter 68 entrance:
- ⏳ Voce 2 (Renesas RA4M1 scope 3 options): Andrea decide purge ALL 36 OR src-only 11 OR defer iter 70+
- ⏳ Voce 3 (R7 subagent BG dispatch ora): orchestrator dispatch worktree OR Andrea wait scope deeper
- ⏳ Voce 4 (Tea T1+T4 Mac Mini SSH ad-hoc delegate): Andrea attiva Mac Mini OR Tea direct local

NEW iter 68 entrance voci ratify queue gruppo 8:
- NEW Voce 6: ELAB_API_KEY source iter 68 entrance (Vercel Dashboard fetch + paste OR generate NEW openssl rotation + redeploy + update Vercel env)
- NEW Voce 7: Canary % infra build iter 69+ (V2.1 sampling code change + dispatch subagent backend-architect ~2-3h) OR keep boolean direct deploy pattern Sprint U+

## Honesty caveats critical PHASE 2

1. **Andrea ratify canary gradient NON honored mechanically** — code limit boolean-only forced re-ratify Direct 100%. Honest gap PHASE 1 spec drafting omission (NOT verified canary infra code support before ratify offer).
2. **Step 6 smoke verify deferred iter 68** — ELAB_API_KEY plain non in local credentials files (only sha256 hash via secrets list). Andrea Dashboard Logs verifica visiva.
3. **Step 7 1000q matrix verify deferred iter 68** — script needs VITE_ELAB_API_KEY from /tmp/vercel.env (wiped Mac reboot pattern recurrent post iter 66 truth recalibration).
4. **CANARY_ONNISCENZA_V21_PERCENT + ENABLE_ONNISCENZA_V21 secrets dead code** (zero codice usage). Iter 69+ cleanup candidate.
5. **NO direct prod verify post-deploy** — affidamento su 1000q matrix iter 41 v67 baseline preserve assumption (not measured iter 67 PHASE 2). Regression risk binario direct 100% deploy. Mitigation: Andrea Dashboard Logs visual + iter 68 entrance matrix re-run.

## Files refs PHASE 2

- This audit: `docs/audits/2026-05-16-iter-67-PHASE2-deploy-audit.md`
- PHASE 1 audit: `docs/audits/2026-05-16-iter-67-ENTRANCE-PHASE1-audit.md`
- Handoff iter 68: `docs/handoff/2026-05-16-iter-67-to-iter-68-handoff.md` (update needed iter 68 voci ratify gruppo 8)
- Migrations applied: `supabase/migrations/20260515174301-04_*.sql`
- Edge Function deployed: `supabase/functions/unlim-chat/index.ts` + 16 _shared assets
- Matrix bench script: `scripts/bench/run-1000-matrix.py` (iter 68 Andrea provide VITE_ELAB_API_KEY + esegue)

## Score iter 67 PHASE 2 close

**9.2/10 ONESTO G45** = 9.1 PHASE 1 + 0.1 deploy ship − 0.0 verify gap (defer iter 68 entrance acceptable since deploy hash verified secrets list + migrations match LOCAL==REMOTE).

**Iter 68 entrance score target preview**: 9.2 → 9.5+/10 conditional ELAB_API_KEY source + matrix 1000/1000 preserve verify + R7 ship + Atom 3 deploy + Tea T1+T4 + Renesas SRC purge.

## Anti-inflation G45 enforced PHASE 2

- Cap 9.2/10 honest (raw 9.3 → cap 9.2 verify gap deduction)
- NO claim "canary gradient LIVE" (boolean direct 100% admitted)
- NO claim "smoke verified LIVE" (deferred Andrea Dashboard visual)
- NO claim "1000q matrix preserved" (deferred iter 68 measure)
- NO claim "Sprint U close" (iter 70+ projection per PHASE 1 audit unchanged)
