# Sprint V iter 1+2 FINAL Quality Audit

**Date**: 2026-05-06 AM
**Branch**: `fix/sprint-V-iter-1-homepage-restore-lavagna-fix` (HEAD `2e53145`)
**PR**: [#66](https://github.com/AndreaMarro/elab-tutor/pull/66)
**Verifier**: Claude Opus 4.7 (this orchestrator) + Chrome MCP smoke prod evidence

## Score onesto Sprint V iter 1+2: **6.5/10** (G45 cap pre-Opus indipendente review)

Razionale cap 6.5:
- Implementation surgical + verified live preview ✓
- Multi-vendor review identified RISCHI substantial (race condition + XSS CustomEvent + GDPR lang + prompt injection) → iter 3 carryover, NOT addressed iter 2
- Anti-inflation gate retroactive validated 2 prior inflation cases (iter 36 8.0/10 + iter 38 9.5/10) → mantiene G45 mandate ferreo
- 3 vitest todo deferred iter 1 → still todo
- Onniscenza server-side aggregator scaffold only iter 29 (NOT wire-up server-side this sprint)
- NO Opus indipendente review file → score >7 prohibited per G45
- Build PASS + push origin + Vercel deploy verified LIVE preview ✓

## Deliverables 16/16 issue Andrea mandate

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| 1 | Voxtral wake word non risponde | ⚠️ partial | A1.1 dispatch event browser unsupported plurale ✓ + A1.2 TTL 24h dismiss ✓; root cause Safari/iOS unsupported NON resolvable client-side. iter 3+ carryover full diagnosis |
| 2-3 | Lavagna libera no circuit + HomePage card | ✓ A8 4-card preserved + Glossario href internal `/glossario` |
| 4 | HomePage Cronologia | ✓ HomeCronologia preserved render line 800 |
| 5,9,10 | Modalità Percorso morphic + libero merge | ⚠️ A5 client-side bridge ✓; server-side Onniscenza chain iter 3+ carryover |
| 6 | Passo Passo single-window | ✓ A6 hideComponentDrawer prop `LavagnaShell.jsx:1186` + `NewElabSimulator.jsx:906` modalità-aware suppress |
| 7,15 | Strokes persist + multi-session | ✓ A2.1 skip remote hydration + A2.2 drawingSync session_id wiring + A2.3 migration scribble_paths_session_id (3-tuple unique) APPLIED prod |
| 8,13 | Mascotte SVG + Tea credits | ✓ Iter 1 A10 ElabMascotte SVG → ⚠️ iter 2 REVERTED to PNG VERA Andrea explicit; A11 footer Tea credits 2 names ONLY (Andrea + Teodora De Venere) |
| 11 | HomePage Glossario internal | ✓ Glossario card credit `null` (Andrea explicit no "Fatto da Tea") |
| 12 | Workflow multiprovider + mem-search | ✓ scripts/multi-vendor/run-review.sh Claude+Kimi+Mistral+Codex orchestrated, anti-bias + anti-inflation + retroactive |
| 14 | Connettori massiccio test | ✓ Chrome MCP smoke prod LIVE preview screenshot evidence (3 screenshots stored ss_8252tf91c, ss_3148usxnj, ss_3286acuib) |
| 16 | CoV + quality-audit | ✓ vitest 13502 PASS (+28 vs baseline 13474), build PASS 10m 59s, this audit |

## Anti-regression+anti-inflation infra LIVE retroattiva validation

`scripts/feature-parity-snapshot.sh` 12 metric snapshot ✓
`scripts/retroactive-regression-scan.sh` historical drift detect ✓ (last 15 commits zero drift)
`scripts/anti-inflation-gate.sh` G45 mandate enforce → DETECTED 2 prior inflation:
- iter 36 PHASE3-CLOSE 8.0/10 NO Opus indipendente review (warn)
- iter 38 PHASE3-CLOSE 9.5/10 NO Opus indipendente review (warn)
`.git/hooks/pre-push` symlink → blocking pre-push hook integration
Mac Mini context handoff scp deployed `~/elab-sprint-V-context-2026-05-06.md` 6207 bytes ✓
Multi-vendor workflow ran Sprint V diff → Mistral findings substantial (race condition `lastLocalSaveAtRef`, XSS `wakeWord.js` message in CustomEvent UI render, GDPR `lang='it-IT'` hardcode violazione art. 22, prompt injection `onCommand`, magic strings, empty catch, spaghetti booleans)

## Anti-inflation retroactive DOC-CLAIM falsifications

- ❌ CLAUDE.md iter 28 close "Lavagna Bug 3 Supabase sync 25/25 PASS LIVE" REALITY FALSE (D2 audit: `syncEnabled` MAI passato `true` prod fino iter 1 fix A2.2)
- ❌ iter 42 mio rimozione FloatingWindowCommon era SBAGLIATA (D3 audit: Andrea preferiva LessonReader vecchia resizable)
- ❌ iter 1 ElabMascotte SVG era REGRESSIONE vs Andrea schema (Andrea explicit "deve essere quella vera" PNG)

## Iter 3+ carryover (Andrea ratify gate)

1. **Multi-vendor findings**: race condition `lastLocalSaveAtRef`, XSS CustomEvent, GDPR lang hardcode, prompt injection `onCommand`, magic strings, empty catch, spaghetti booleans
2. **Onniscenza server-side aggregator wire-up** Edge Function `unlim-chat` (client-side bridge SHIPPED iter 1, server-side scaffold only iter 29)
3. **3 vitest todo** (HomePage Tea text render, MicPermissionNudge permState async race, LavagnaShell aggregateContext mock)
4. **Modalità libero merge in percorso semantica** (4 modi attuali, Andrea mandate 3 modi semantic)
5. **Wake word D1 H5 Safari/iOS** root cause non resolvable client-side; iOS Safari Web Speech API native fallback OR Voxtral cloud STT migration
6. **Edge Function deploy unlim-chat** (no client-side changes need server deploy iter 1, but Onniscenza chain wire-up future)
7. **CHANGELOG.md** updated ✓ Governance Rule 5 ✓
8. **Mistral findings iter 3 P0**: XSS sanitize `wakeWord.js` CustomEvent message, GDPR lang dynamic from user pref, prompt injection `onCommand` whitelist commands

## Mac Mini autonomous loop status

- iter36-user-sim cron LIVE 4 entries (L1 5min + L2 30min + L3 2h + aggregator 15min)
- Branch pattern `mac-mini/iter36-user-sim-YYYYMMDDTHHmmZ` → fetched origin during this audit
- Context handoff deployed `~/elab-sprint-V-context-2026-05-06.md` con full session state
- Andrea può act tramite Mac Mini account autonomous + resume MacBook a piacimento

## File:line citations key fixes

- `src/services/wakeWord.js:38-50` dispatch `elab-wake-word-error` event browser unsupported
- `src/components/common/MicPermissionNudge.jsx:43,87,138` TTL 24h dismiss
- `src/components/simulator/canvas/DrawingOverlay.jsx:172-185` skip remote when local has paths
- `src/services/drawingSync.js:89,94,166-176` session_id wiring backward-compat
- `supabase/migrations/20260505000000_scribble_paths_session_id.sql` ALTER session_id 3-tuple unique
- `src/components/lavagna/LavagnaShell.jsx:621-646` Percorso morphic Onniscenza client-side bridge
- `src/components/simulator/NewElabSimulator.jsx:906-911` ComponentDrawer modalita-aware suppress
- `src/components/HomePage.jsx:364` Glossario credit `null`
- `src/components/HomePage.jsx:766-781` PNG VERA mascotte (revert ElabMascotte SVG)
- `src/components/HomePage.jsx:843-865` footer 2 names ONLY

## CoV finale

- vitest 13502 PASS (+28 vs baseline 13474), 15 skipped, 18 todo, ZERO regression
- pre-commit hook ✓ baseline gate
- pre-push hook ✓ regression check + anti-inflation warn
- build PASS 10m 59s, PWA 32 precache entries
- Vercel preview LIVE deploy verified Chrome MCP screenshot evidence

## G45 Opus indipendente review prerequisites (block score >7)

Per claim Sprint V iter 1+2 score >7, MANDATORY:
1. Opus indipendente review file `docs/audits/sprint-V-iter1-2-opus-independent-review.md` con verdetto APPROVE/REJECT
2. Independent reviewer NON Claude Opus 4.7 corrente (suggested: Kimi K2.6 256K context full diff review OR Mistral Large multi-vendor finding integration)
3. Multi-vendor findings iter 3 P0 addressed before lift score
4. R5 stress fixture ≥85% PASS post Onniscenza wire-up
5. 92 esperimenti audit completion (Andrea iter 21+ carryover Sprint T close gate)

Score capped 6.5/10 ONESTO (NO inflation, NO compiacenza).
