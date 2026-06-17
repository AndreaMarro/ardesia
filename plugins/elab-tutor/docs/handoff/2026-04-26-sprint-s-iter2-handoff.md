---
sprint: S
from_iter: 2
to_iter: 3
date: 2026-04-26
author: scribe-opus
status: FINAL (scribe deliverables)
---

# Sprint S iter 2 → iter 3 Handoff

## State at iter 2 close

- **Branch (in progress)**: `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26` (NO commit ancora — orchestrator handles git)
- **Files touched iter 2**: 33 totali (9 modified + 24 untracked)
- **Wiki concepts local**: **52** (+2 net da batch Mac Mini, 50→52)
- **R0 baseline measured**: **75.81% WARN** (10 fixture, gap critici plurale_ragazzi 0/10 + citation_vol_pag 0/10)
- **Mode**: SOFTWARE-only confermato (pod EXITED tutto iter 2, host US-WA-1 saturo)
- **SPRINT_S_COMPLETE score**: 1.5 → **2.0/10** (incrementi box 4 wiki + box 9 R0 baseline misurato)
- **Build/test verifica**: [TBD orchestrator pre-commit] — `npx vitest run` ≥12498 + `npm run build` PASS

### Status per task iter 2

| Task | Status |
|------|--------|
| A1 buildCapitoloPromptFragment | ✅ shipped |
| A2 principioZeroValidator | ✅ shipped |
| A3 BASE_PROMPT v3 | ✅ shipped (impatto R0 da misurare iter 3) |
| A4 wire-up unlim-chat/index.ts | ⏳ in flight (non in git status snapshot) |
| A5 integration test | ✅ shipped |
| B UI wire-up LavagnaShell | ❌ deferred iter 3 |
| C R0 baseline | ✅ shipped (75.8% WARN) |
| D Mac Mini wiki batch | ✅ shipped (52 concepts) |
| E ADR-008 + ADR-009 | ✅ shipped |
| F Audit + handoff + CLAUDE.md proposal | ✅ shipped |

---

## Pod resume status

- **Pod ID**: `felby5z84fk3ly` (RTX 6000 Ada 48GB, host `kply5qifvp6v` US-WA-1)
- **Stato a iter 2 close**: EXITED (storage $10/mo continuo)
- **Background poll**: PID 10470 (orchestrator) — retry resume ogni 15min × 32 tentativi (max 8h). Outcome ENTRO iter 2 close: ancora EXITED.
- **Poll log location**: [TBD by orchestrator — verificare path es. `/tmp/runpod-resume-poll.log` o `automa/state/runpod-poll.log`]
- **Comando manuale resume**: `bash scripts/runpod-resume.sh felby5z84fk3ly`
- **Status check**: `bash scripts/runpod-status.sh felby5z84fk3ly`
- **Plan B se host saturo persistente**: creare pod EU alternativo (host EU-NL-1 / EU-RO-1), accettare re-download modelli (50GB volume nuovo, ~30min)

---

## Mac Mini wiki concepts current count

- **Pre-iter 2 local**: 50 .md files in `docs/unlim-wiki/concepts/`
- **Mac Mini main branch**: ≥35 (verificato `ls | wc -l` post-batch su Mac Mini → 35 file). Mac Mini è DIETRO local — local ha pulled batch precedenti che Mac Mini non ha ancora sync.
- **Batch iter 2 dispatched**: 5 concepts (`analog-read digital-write pin-mode ohm amperometro`)
- **Branch batch**: `mac-mini/wiki-concepts-batch-20260426-112238`
- **Batch outcome iter 2**: `generated=5 failed=0` (DONE attempt 2/12, ~10min)
- **Post-iter 2 local count**: **52** (+2 net: ohm.md, amperometro.md NUOVI; analog-read/digital-write/pin-mode UPDATED)
- **Quality validation**: kebab-case ✓, YAML frontmatter ✓, "ragazzi" plurale ✓, PRINCIPIO ZERO sezione ✓, word count 1045-1815 (substantive)
- **Target end Sprint S**: 100+ concepts → richiede ~10 batch da 5 (~5h walltime Mac Mini)
- **Open question**: 3 file overwritten (analog-read/digital-write/pin-mode) — verificare con Tea no regressione qualità vs versione local pre-batch

---

## Files added/modified iter 2

Vedi `docs/audits/2026-04-26-sprint-s-iter2-audit.md` §4 per snapshot completo `git status --short`.

Riepilogo categorie:
- **Wiki content**: 5 file (3 update + 2 nuovi)
- **Wiki meta**: 2 file (index.md, log.md)
- **Supabase functions**: 4 file (capitoli-loader.ts, system-prompt.ts MOD; principio-zero-validator.ts NUOVO; [unlim-chat/index.ts in flight])
- **Tests**: 3 nuovi (buildCapitoloPromptFragment.test.js, principioZeroValidator.test.js, unlim-chat-prompt-v3.test.js)
- **Scripts bench**: 3 nuovi (run-sprint-r0-render.mjs, output/, sprint-r0-score-results.json)
- **ADRs**: 2 nuovi (ADR-008, ADR-009)
- **Schemas**: 1 mod (Capitolo.js)
- **Docs**: 2 nuovi (audit iter 2, handoff iter 2)
- **Plumbing**: 12 ATOM tasks + 1 contract + 1 messages dir + 1 audit leftover + 1 CSS module mod
- **Total**: 33 file

---

## What needs Andrea iter 3

1. **Voice clone audio**: cp `/tmp/voice.mp4` (3+ secondi voce Andrea pulita) → upload Coqui TTS endpoint quando pod RUNNING. Fix sandbox blocker `~/Downloads` access (BLOCKER da iter 1, non risolto iter 2).
2. **Pod resume decision**: se host US-WA-1 ancora saturo a iter 3 launch (8h max poll potrebbe scadere), OK creare pod EU alternativo? (re-download 50GB modelli ~30min, accettabile)
3. **Production deploy supabase functions**: post Task A4 wire-up, eseguire `SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy --project-ref euqpdueopmlllqjmqnyb` per liveness UNLIM prompt v3
4. **Stress test trigger** (iter 4): conferma OK eseguire smoke E2E Playwright su `https://www.elabtutor.school`
5. **PR review** branch `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26` post-orchestrator commit + push
6. **Cost monitor check**: verificare RunPod billing iter 1+iter 2 cumulato (atteso < $2 totale GPU + $10/mo storage)
7. **Tea review opzionale**: 3 wiki file overwritten dal batch Mac Mini (analog-read/digital-write/pin-mode) — confermare no regressione qualità

---

## Activation prompt iter 3 (paste-ready)

```
Sprint S iter 3 attivazione (date YYYY-MM-DD).

Pre-flight checks (run prima di dispatch agenti):
1. bash scripts/runpod-status.sh felby5z84fk3ly  → atteso RUNNING (se EXITED, runpod-resume.sh + attendi 2min boot; se host saturo, creare pod EU alternativo)
2. ssh -i ~/.ssh/id_ed25519_runpod root@<IP> -p <PORT> 'curl -s localhost:11434/api/tags | jq .models | length'  → ≥1 model
3. ls "VOLUME 3/PRODOTTO/elab-builder/docs/unlim-wiki/concepts/" | wc -l  → 52 (baseline iter 2 close)
4. cat scripts/bench/workloads/sprint-r0-score-results.json | jq .overall_pct  → 75.81 (baseline iter 2)
5. git log --oneline main ^feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26 | head -10
6. cat docs/handoff/2026-04-26-sprint-s-iter2-handoff.md  → leggi state at close completo

Iter 3 SOFTWARE+GPU scope:
- Task A iter 3 (priorità): A4 wire-up completion in unlim-chat/index.ts + deploy production + R0 re-run (atteso lift su plurale_ragazzi 0→10/10 e citation_vol_pag 0→7+/10 grazie BASE_PROMPT v3 A3)
- Task B iter 3 (deferred da iter 2): UI wire-up LavagnaShell + AppHeader CapitoloPicker + VolumeCitation onClick — verifica MANDATORY con preview_screenshot, no claim memoria
- Task C iter 3: Coqui TTS recovery + 7-component stack ↑100% (depend pod RUNNING)
- Task D iter 3: RAG ingest 6000 chunks Anthropic Contextual (BGE-M3 embeddings on pod GPU, ~6h compute)
- Task E iter 3: Mac Mini Wiki batch (continue, +5 concepts: digital-read serial-print voltmetro ground-massa blink-led)
- Task F iter 3: R0 CoV 3x consistency check variance <5% + audit + handoff

Pattern: ralph loop 5-agent OPUS (planner+architect+generator-app+generator-test+scribe).

Files reference:
- Contract template: automa/team-state/sprint-contracts/sprint-S-iter-2-contract.md (clone+adapt)
- PDR master: docs/pdr/PDR-SPRINT-S-ITER-2-RALPH-LOOP-5-AGENT-2026-04-26.md
- Stack v3: docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md
- ADR-008+ADR-009: docs/adrs/

Andrea pilots, claude-main-session orchestrates.
```

---

## Iter 3 honesty caveats (pre-emptive)

1. **GPU work qualità reale dipende da pod stabilità** — host RunPod può saturare di nuovo, contingency pod EU.
2. **6000 RAG chunks ingest** = ~6h GPU compute con BGE-M3 batch 32 → costo $4-5 single-shot. Pianificare slot dedicato.
3. **Hybrid RAG benchmark variance**: BM25 deterministic, dense+rerank non. CoV 5x richiesto per claim ≥75%.
4. **Vision flow screenshot diagnose**: Qwen-VL accuracy su circuiti simulator NON noto, baseline R0 mancante. Iter 3 produce R0 vision.
5. **Voice clone**: 3s audio minimum, Coqui XTTS-v2 quality dipende da SNR audio. Andrea registrare in stanza silenziosa.
6. **R0 re-run post A4**: lift atteso su plurale_ragazzi e citation_vol_pag, ma se BASE_PROMPT v3 non è efficace al 100%, gap residuo richiede iterazione prompt v4.
7. **Task B UI deferred**: wire-up senza preview_screenshot = NO claim "funziona". Mai dichiarare completato senza vista browser concreta.
8. **Mac Mini batch overwrite**: ogni batch può overwrite file pre-esistenti. Iter 3 considerare branch isolato per Mac Mini con review pre-merge.
