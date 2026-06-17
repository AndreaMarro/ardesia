# NEXT-TASK Mac Mini — 2026-04-28 iter 13 wave (post Sprint S iter 12 close)

## STATE iter 12 close
- HEAD: 3588853 (post iter 13 wave: TBD orchestrator commit)
- Score ONESTO: 9.30/10 UNCHANGED iter 12. Lift to 9.65 iter 13 projection.
- Hybrid RAG live: recall@5 = 0.390 (FAIL target 0.55) — iter 13 deep debug U1+U2+U3 in progress.
- Edge Fn unlim-chat LIVE 200 OK, debug_retrieval surfaces 4 chunks rrf_score, metadata partial NULL.
- Vercel prod elabtutor.school 200 OK.

## ITER 13 wave shipped (4 OPUS agents PHASE 1)
1. fumetto-opus: SessionReportComic perfect + voice cmd "leggi rapporto" + 15 tests
2. rotation-opus: RotationHandle UI + NanoR4Board text counter-rotation + 39 tests + localStorage persistence (Supabase migration deferred iter 14)
3. design-opus DOC-ONLY: 7 docs (1166 LOC) — D1 audit + D2 LIM legibility spec + 4 D3 critiques + D4 design-tokens spec
4. omniscient-opus: rag.ts U1 BM25 section_title + U2 RRF k=60 multi-list + U3 Wiki Hybrid 4-list + U4 5 L2 templates ToolSpec 52→57

## YOUR PRIORITY iter 14+ (Mac Mini factotum 24h autonomous)

### TASK D1 — 28 ToolSpec expand 52→80 (5 per cycle, 6 cycles ~3 giorni)
- 5 shipped iter 13 (omniscient-opus L2 templates): explain-led-blink, diagnose-no-current, guide-mount-experiment, critique-circuit-photo, reroute-from-error
- Remaining 23: derive from 92 esperimenti (lesson-paths) — group by tema-capitolo per USER INSIGHT 2026-04-28
- Output: scripts/openclaw/templates/L2-*.json + 1 PR per 5 templates
- Deliverable per cycle: automa/state/BUILD-RESULT.md

### TASK D2 — Wiki Analogia 30 concepts overnight 22:30 CEST cron
- Content: extend src/data/wiki-analogia.json 100→130 entries
- Sources: volumes Vol 1+2+3 + glossario + analogie real-world età 8-14
- Format: same schema existing entries
- Deliverable: automa/state/RESEARCH-FINDINGS.md

### TASK D3 — Volumi PDF diff + experiment alignment audit (USER INSIGHT 2026-04-28)
- Vol 1+2+3 PDF cap-by-cap extraction → identify esperimenti narrative-continuum vs autonomi
- Map volumi/lesson-paths gap
- Refactor proposal grouped tema-capitolo per Modalità Percorso/Passo-Passo/Libero
- Deliverable: automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md

### TASK D4 — R5+R6 stress prod regression cron 6h
- Run scripts/bench/run-sprint-r5-stress.mjs + run-sprint-r6-stress.mjs against prod
- Detect regression vs baseline
- Deliverable: automa/state/TEST-RESULT.md

### TASK D5 — Iter 14 SQL migration prep
- omniscient-opus deferred iter 14 RPC migration: extend search_rag_dense_only + search_rag_hybrid RETURNS TABLE with section_title text
- rotation-opus deferred iter 14 SQL migration: experiment_layouts table with rotation column
- Output: SQL migration files in supabase/migrations/ DRAFT (NOT applied — Andrea ratify required)
- Deliverable: automa/state/MIGRATION-DRAFTS.md

## ACCESS BLOCKER
SSH from MacBook denied (publickey/password/keyboard-interactive). Path A recommended: Andrea SSH from MacBook → Mac Mini once with password → append `~/.ssh/id_ed25519_elab.pub` to `progettibelli@:~/.ssh/authorized_keys`. Once unblocked Mac Mini consumes this NEXT-TASK.md via cron pull pattern.

Filesystem trigger fallback active: Mac Mini cron `git pull` every 5 min reads this file + writes back automa/state/<TASK-ID>-RESULT.md.

## CoV cron Mac Mini every task
- vitest baseline preserved 12599+ PASS
- npm run build PASS
- baseline preserve check
- no main push, no merge without Andrea
- output structured JSON + markdown
