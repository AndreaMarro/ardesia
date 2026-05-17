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

## Iter 73 P0 atoms preview (subagent BG dispatch candidates)

### P0.1 USB Web Serial port detection (~2h orchestrator inline OR subagent)
**File ownership**: `src/components/simulator/NewElabSimulator.jsx` + `src/services/usbPortService.js` NEW + `tests/unit/services/usbPortService.test.js` NEW.

**Scope**: replace `port={null}` placeholder with real Web Serial enumeration:
- `navigator.serial.requestPort()` user gesture flow
- `navigator.serial.getPorts()` previously authorized
- Port state management in NewElabSimulator
- Pass detected port to ScratchCompileBar → CompileUploadButton
- Graceful degradation if Web Serial unsupported (Safari fallback message)

### P0.2 Vol3 dataset Davide co-author (~6-8h Davide direct)
**Andrea ratify mandate**: NO orchestrator skeleton-first (BG-A5 abandon lesson).

**Approach**: Davide writes full content 15 missing IDs (v3-cap6-esp3 + v3-cap7-mini + v3-cap8-esp4 + capstones) → Davide OR Andrea applies simultaneous:
- `experiments-vol3.js` 14→29 entries (content + components + steps)
- `cliffhanger-table.json` 14→29 entries (Tea-compat array format NOT wrapper)
- `narrative-map-94.json` consolidate 77 unique → 94 IDs
- Update 66 hardcoded count references stale (sweep `grep -rn "= 14\|= 79"`)
- 15 NEW lesson-paths JSON files `src/data/lesson-paths/v3-*.json`
- Tests updated SIMULTANEOUS (no orphan skeleton)

### P0.3 Blockly → SketchBuilder intent emit refactor (~3-4h subagent BG)
**File ownership**: `src/components/simulator/panels/scratchGenerator.js`.

**Scope**: replace raw Arduino C++ string return with structured SketchBuilder intentions per iter 63 spec. Enables board profile validation + forbidden AVR pattern check + cross-board compatibility (Renesas RA4M1 vs ATmega328).

### P0.4 92 esperimenti Playwright UNO PER UNO audit (~8-10h subagent test-automator OR Mac Mini delegate)
**Andrea iter 21+ carryover Sprint U close gate**.

**Scope**: Playwright spec iterates 94 esperimenti, asserts mountExperiment + componentes + step-by-step + compile + Vol/pag citation. Document each broken/working honestly. NO mock data.

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
