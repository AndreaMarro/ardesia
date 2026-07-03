# LOCAL-VOLUME3-STATUS

- Data: 2026-07-02 (CEST)
- Autore: Claude, sessione **local-only** (solo `/Users/andreamarro/VOLUME 3`, nessun accesso GitHub / Mac Mini / Vercel / `uv` / `~/lessonos`)
- Path repo: `/Users/andreamarro/VOLUME 3/ardesia`
- Branch locale: `codex/ardesia-ops-headroom-20260701`
- HEAD: `8d340de1 docs(ops): add Vercel map`
- `git diff --check`: PULITO (nessun errore whitespace / conflict marker)

## Stato git reale

File **tracciati modificati** (7, `git diff --stat` = +263 / -18):

- `README.md`
- `apps/studio/src/Room.tsx`
- `apps/studio/src/__tests__/Room.integration.test.tsx`
- `apps/studio/vitest.config.ts`
- `docs/ops/ARDESIA-TOTAL-INVENTORY-2026-06-30.md`
- `docs/ops/VERCEL-MAP.md`
- `packages/engine/tests/test_pipeline_spaced_path.py`

File **untracked** (37 totali; lista completa in `/tmp/ardesia-volume3-untracked.txt` e in `LOCAL-HANDOFF-FOR-GITHUB.md`). Categorie principali:

- **Command surface del monorepo** (CRITICO): `package.json` (root) + `bin/monorepo.sh` → sono UNTRACKED. Finché non vengono committati, chi clona **non ha** `npm run verify / test / build`.
- ~30 doc operativi in `docs/ops/` (CONTEXT-PACKETS, FACTORY-*, HEADROOM-*, AGENTMEMORY-*, PER-USER-AIOS-CRITICAL-ANALYSIS, NEXT-SESSION-PROMPT, ELECTROTECHNICS-*, ecc.)
- Tutta `docs/product/` (ELECTROTECHNICS-SOLVER-PACK, EXAMFORGE-PACK, UI-UX-DESIGN-DIRECTION)
- `apps/studio/public/elab/`, `apps/studio/src/toolhost/{ToolCanvasEmbeddable.tsx, simulationBreadboard.ts}` + relativo test
- `plugins/elab-tutor/docs/specs/ardesia-canvas-plugin-contract.md`


---

## Aggiornamento sessione 2026-07-02 (continuazione dopo crash)

La sessione precedente sullo stesso obiettivo è **crashata** (probabile overflow
di contesto). Questa continuazione ha lavorato **chirurgica** (letture cappate,
nessun repo dump) e ha colmato i **9 gap reali** che mancavano:

**Creati in `docs/ops/`:**
- `NEXT-CODEX-PACKET.md` (FASE 2)
- `LOCAL-HANDOFF-FOR-GITHUB.md` (FASE 9) — era **referenziato ma mancante** (probabile punto del crash)
- `LESSONOS-MEMORY-ARCHITECTURE-RESEARCH.md` (FASE 4)
- `LESSONOS-DYNAMIC-GRAPH-RESEARCH.md` (FASE 4)
- `ELECTROTECHNICS-MVP-CONTEXT-PACKET.md` (FASE 5)
- `SIMULATION-PLUGIN-ELAB-NEXT-CONTEXT-PACKET.md` (FASE 8)

**Creati in `docs/product/`:**
- `FASTAPI-INTEGRATION-GATEWAY.md` (FASE 6)
- `CHATGPT-APPS-MCP-INTEGRATION.md` (FASE 6)
- `OPEN-DESIGN-AND-BOARD-RESEARCH.md` (FASE 7)

**Non toccati (già maturi):** `PER-USER-AIOS-CRITICAL-ANALYSIS.md` (623), i pack
Electrotechnics/ExamForge, `UI-UX-DESIGN-DIRECTION.md`.

**Diff:** `git diff --check` PULITO; snapshot in `/tmp/ardesia-volume3-local.diff` (26 KB).

**Non verificabile in questa sessione** (no GitHub/Mini/Vercel): PR #6/#8, Vercel live,
AgentMemory live, headroom reale, gate LessonOS rosso, scheduler/launchd. Richieste
consolidate in `NEXT-CODEX-PACKET.md`.

**Prossima micro-task:** far eseguire `NEXT-CODEX-PACKET.md` a un agente con GitHub
(commit command-surface → docs → toolhost dietro test verdi) e confermare gate LessonOS.
