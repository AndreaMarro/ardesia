# Iter 72 → 73 handoff — 2026-05-17 09:50 CEST

## Iter 72 close state

- **Score ONESTO G45 cap**: 8.95/10
- **Commits**: 3 mainwt local-only (`d191ea1f` ORCH-A4 + `91e89452` BG-A6 + `27603d0c` BG-A7)
- **Vitest baseline**: 14357 PASS preserved EXACT (+11 net iter 72)
- **Push origin**: NOT done (Andrea ratify mandate iter 73 entrance)
- **Disk MacBook**: 5.5Gi free (stable post worktree cleanup)
- **Matrix prod**: v246 998/1000 = 99.8% (PZ V3 context bleed FIXED color+highlight)

## Andrea ratify queue iter 73 entrance (gruppo 13, 8 voci)

| # | Voice | Effort Andrea | Status iter 72 | Recommended |
|---|---|---|---|---|
| 1 | Push origin 4-commit batch iter 72 (`27603d0c` HEAD) | 5min | ⏸ pending ratify | YES — ZERO regression verified |
| 2 | A-SECURITY ELAB_API_KEY rotation iter 32 protocol (14+ giorni exposure) | 30min | ⏸ pending iter 70 P0 carryover | P0 mandatory |
| 3 | Vol3 dataset 14→29 IDs Davide co-author rework | ~6-8h Davide direct | ⏸ BG-A5 abandoned | Davide co-author content + simultaneous test counters update (NO skeleton-first) |
| 4 | `student_album` schema migration `.bak` → `.sql` apply prod | 5min `supabase db push --linked` | ⏸ BG-A6 Album defensive catch | P0 unblocks Album live data |
| 5 | claude-mem Desktop OAuth refresh (token stale 2026-05-17) | 5min Andrea action | ⏸ deferred iter 71+ | P1 unblocks mem-search corpus |
| 6 | Sentry + PostHog OAuth + 3 dashboards seed | 30min Andrea browser | ⏸ deferred iter 71+ | P1 production telemetry visibility |
| 7 | Disk cleanup decision 3 options (node_modules cache / /tmp archives / dormant worktrees) | 5min Andrea decide | ⏸ 5.5Gi stable threshold | Conditional <5Gi |
| 8 | Iter 73 atom plan ratify (orchestrator drafts in `.ai/mission.md` iter 73 entrance) | 10min | ⏸ defer iter 73 entrance | Standard cadence |

## Iter 73 P0 atoms preview (RESTRUCTURE narrative-first 2026-05-17 Andrea principio richiamato)

**Andrea principio**: "Esperimenti = arco narrativo continuo, NON card flat scollegate. Ogni esperimento del software deve agganciarsi al precedente e al successivo nella stessa sequenza del libro stampato. Modalità Percorso + Passo Passo + transizioni fra esperimenti = principio guida."

**Iter 73 priorities restructure narrative-first** (vedi `docs/strategy/2026-05-17-iter-72-NARRATIVE-ARC-AUDIT.md` audit completo):

### P0.1 NARRATIVE schema unification + wire-up (~1.5h orchestrator inline)

**File ownership**: `src/data/cliffhanger-table.json` + `src/data/lesson-paths/v*.json` (79 files) + `src/data/narrative-map-94.json` + consumer components.

**Scope**:
- `cliffhanger-table.json` wrapper `{experiments: [...]}` → Tea canonical flat array (Codex iter 70 TEAM A HIGH)
- `lesson-paths/v*.json` 79 files ADD `prev_id` + `next_id` + `cliffhanger_in` + `cliffhanger_out` OR runtime-join with cliffhanger-table
- `narrative-map-94.json` consolidate 77 unique → 79 (current registry) OR 94 (post Vol3 Davide P0.5)
- Sync `automa/baseline-tests.txt` 13517 → 14357 (drift iter 72 close)

### P0.2 PercorsoCapitoloView cliffhanger render (~2h)

**Anti-pattern Andrea kill**: "card flat scollegate" → narrative continuity.

**Scope**: tra ogni esperimento card render cliffhanger text (Tea-authored, source `cliffhanger-table.json`). Pattern "Hai fatto X → Prossimo Y perché Z" continuità narrativa visibile.

### P0.3 BuildModeGuide passo-passo regression fix (~2h iter 36 PM carryover 9+ iter)

**File ownership**: BuildModeGuide.jsx + LessonReader integration + activeLessonId state.

**Scope**: fix iter 36 PM regression `feedback_passo_passo_regression_06may2026.md` (passo-passo wrongly uses LessonReader, activeLessonId hardcoded). Step preview NEXT + recap PREVIOUS narrative intra-esperimento.

### P0.4 Narrative wire 3 components iter 72 follow-up (~2h)

**File ownership**: `ScratchCompileBar.jsx` + `CompileUploadButton.jsx` + `AlbumStudente.jsx`.

**Scope** (cliffhanger CTA su transizioni esperimento iter 72 GAP):
- `ScratchCompileBar.jsx`: on compile success render "Ragazzi, pronto per [next_exp.title]? [→ Apri]" (cliffhanger CTA)
- `CompileUploadButton.jsx`: on upload success render "Hai caricato! Vol/pag prossimo: [next_exp.cliffhanger]"
- `AlbumStudente.jsx`: on save render "Vai al prossimo esperimento [→]"
- Source: runtime join `cliffhanger-table.json` experiment_id → next_id + cliffhanger text

### P0.5 Vol3 Davide co-author 14→29 WITH cliffhangers (~6-8h Davide direct, NO orchestrator skeleton-first)

**Andrea ratify mandate**: BG-A5 abandon lesson + Andrea narrativa principio = SIMULTANEOUS content + narrative + tests update.

**Davide responsibility**: scrive contenuto 15 missing experiments con cliffhanger_in (from prev) + cliffhanger_out (to next). Andrea/orchestrator wire schema + tests SIMULTANEAMENTE (NO skeleton-first commit, NO orphan tests).

**Files**:
- `experiments-vol3.js` 14→29 entries content + components + steps
- `cliffhanger-table.json` 14→29 entries (flat array post P0.1 schema unification)
- `narrative-map-94.json` consolidate 77 → 94
- 15 NEW `lesson-paths/v3-*.json` with prev/next/cliffhanger fields
- Update 66 hardcoded count references stale (sweep `grep -rn "= 14\|= 79"`)
- Tests updated SIMULTANEOUS (no orphan skeleton)

### P0.6 92 esperimenti Playwright NARRATIVE audit (~10h subagent test-automator OR Mac Mini)

**Andrea iter 21+ carryover Sprint U close gate**.

**Scope NARRATIVE-FIRST** (NOT just standalone esperimento test):
- Each esperimento spec verify entry from previous (state continuity from prev_id)
- Verify exit to next (cliffhanger CTA present post-success transitions)
- Document broken arcs honestly (NO mock data)
- Sprint U close gate: ALL experiments verify narrative continuity

### P0.7 Codex iter 70 TEAM A HIGH rework (~2-3h orchestrator inline)

**Scope** (4 Codex findings deferred iter 70):
- cliffhanger-table Tea canonical flat array (P0.1 covers)
- narrative-map cleanup 77 → 79 (current) OR 94 (post P0.5)
- 4 vol3 title/ID mismatches fix
- v3-cap6-esp4 content mismatch (semaforo prompt vs "effetto polizia" title)

### P0.8 USB Web Serial port detection (~2h, DOWNGRADED priorità post narrative)

**File ownership**: `src/components/simulator/NewElabSimulator.jsx` + `src/services/usbPortService.js` NEW.

**Scope**: replace `port={null}` placeholder con Web Serial enumeration (`navigator.serial.requestPort()` + `getPorts()` + graceful Safari fallback). Backend infra non-narrative.

### P0.9 Blockly → SketchBuilder intent emit refactor (~3-4h subagent BG)

**File ownership**: `src/components/simulator/panels/scratchGenerator.js`.

**Scope**: replace raw Arduino C++ string con SketchBuilder intentions iter 63 spec. Backend infra non-narrative.

## Pattern S r3 mitigation lessons iter 72

1. **Worktree isolation BG subagents** — A6 success (3.5h, ZERO race), A5 fail content (regression not race).
2. **File ownership rigid PRE-dispatch** — A6 5 files NO overlap A7 inline edits.
3. **ZERO regression mandate ENFORCE post-CoV** — A5 ABANDON triggered orchestrator review 453 fail, NOT subagent self-justify.
4. **G45 cap empirical NOT projected** — score ONLY after CoV + commit (8.95 raw 9.0 → cap A5 abandon -0.05).
5. **Disk monitor cadence each phase** — 5.8 → 4.9 → 5.4 → 5.5Gi (BG-A6 build 16.41s + worktree removal recovered).
6. **Inline preferred small-scope (~2h)** A7 inline OR subagent overhead waste (BG dispatch + msg parse + verify overhead vs surgical 2-LOC inline).
7. **Codex Pattern V audit docs PRE-dispatch** — A6 + A7 referenced exact line numbers + scope = fewer mistakes.

## Iter 73 score target

8.95 → **9.10-9.20/10** conditional Andrea ratify queue 8 voci close + Vol3 Davide co-author shipped + A-SECURITY rotation + Web Serial port detection + 92 esperimenti audit start.

**Sprint U close projection iter 74+**: 9.4-9.6/10 ONESTO conditional Codex iter 70 TEAM A+B+D+E+G HIGH/MED rework + Vol3 Davide complete + 94 esperimenti audit complete + Opus indipendente review G45 mandate.

## Cross-link

- Iter 72 close audit: `docs/audits/2026-05-17-iter-72-CLOSE-audit.md`
- Iter 71 entrance: `docs/audits/2026-05-16-iter-71-entrance-tech-debt-actions-result.md`
- Codex Pattern V 3 findings refs: `docs/audits/2026-05-16-iter-71-entrance-codex-{A2-vol3-gap,D2-emoji-scope,iter63-elab-agent-status}-findings.md`
- ELAB Compile Agent spec: `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md`
- Matrix v246: `scripts/bench/output/1000-matrix-results-2026-05-17T09-10-54.jsonl`

## Activation string iter 73 entrance

```
Iter 73 entrance ELAB Tutor. Iter 72 close 8.95/10 ONESTO G45 cap shipped 3 commits mainwt local-only:
- d191ea1f ORCH-A4 PZ V3 fix (matrix v246 998/1000)
- 91e89452 BG-A6 TEAM D HomePage emoji + Album Supabase
- 27603d0c BG-A7 iter63 software chain api.js + NewElabSimulator wire

Vitest 14357 PASS baseline preserved. Disk 5.5Gi.

P0 Andrea ratify queue gruppo 13 (8 voci):
1. Push origin 4-commit batch iter 72
2. A-SECURITY ELAB_API_KEY rotation iter 32 protocol
3. Vol3 14→29 Davide co-author rework
4. student_album schema migration apply prod
5. claude-mem OAuth refresh
6. Sentry+PostHog OAuth + dashboards
7. Disk cleanup ratify if <5Gi
8. Iter 73 atom plan in .ai/mission.md

Iter 73 P0 atoms candidate subagent BG dispatch:
- USB Web Serial port detection NewElabSimulator (~2h inline OR BG)
- Blockly→SketchBuilder intent emit (~3-4h BG)
- 92 esperimenti Playwright UNO PER UNO audit (~8-10h BG OR Mac Mini)

Vol3 Davide direct iter 73+ (orchestrator skeleton-first VIOLATES ZERO regression — BG-A5 abandon lesson).

NON COMPIACERE. MASSIMA ONESTÀ. G45 anti-inflation cap empirical NOT projected.
```
