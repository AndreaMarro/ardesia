# 3 Features Multi-Agent Parallel Implementation Plan

**Date**: 2026-05-27
**Branch**: `fix/unlim-compile-helper-mascot-tweak-2026-05-24`
**Test baseline (automa/baseline-tests.txt)**: 14551
**Sources**:
- Andrea spec verbatim: GOAL A (Manuale ↔ Passo Passo auto-sync), GOAL B (JSON Export sessione 6 atoms, schema v1.0), GOAL C (Play/Pause/Stop 3-button UX redesign)
- Multi-agent orchestration mandate: `agent-teams:team-implementer × 6` parallel + `codex:codex-rescue` adversarial review
- ELAB CLAUDE.md immutables: 8-esp whitelist, Battery9V intoccabile, no demo/mock, baseline guard, CoV 3×

## UX DECISION LOCK — Goal C

**4-button layout** (3 distinct + Reset separate). Rationale Arduino-like semantics:

| Button | Semantic | Action | Pin/serial cleared? | Circuit topology preserved? |
|--------|----------|--------|---------------------|-----------------------------|
| Play (Avvia) | start OR resume | resume from pause; start from stopped | no | yes |
| Pause (Sospendi) | suspend | AVR worker + circuit solver paused | no (frozen) | yes |
| Stop (Ferma) | halt + t=0 | AVR worker stopped, t reset, pin state reset to LOW, serial buffer cleared | yes | yes |
| Reset (Azzera) | factory reset | clearAll() — purge custom edits, restore stock experiment | yes | NO (mounts fresh) |

Stop ≠ Reset. Andrea verbatim "play e pausa e stop" → 3 distinct controls visible always. Reset preserved as 4th for full-clear use case.

## File Ownership Matrix — ZERO OVERLAP

| Agent | Exclusive writes | Read-only refs |
|-------|------------------|----------------|
| Impl-A (Goal A) | `src/components/lavagna/LavagnaShell.jsx` (currentStep effect region + VolumeViewer prop wire), `src/components/lavagna/VolumeViewer.jsx` (controlled-page prop sync) | `src/data/volume-references.js`, `src/data/experiments-vol*.js` |
| Impl-B services (B1+B2+B4) | NEW `src/services/sessionExporter.js`, NEW `src/services/sessionImporter.js`, NEW `src/hooks/useSessionAutosnapshot.js` | `src/services/simulator-api.js` |
| Impl-B3 modal | NEW `src/components/lavagna/SessionExportModal.jsx`, NEW `src/components/lavagna/SessionExportModal.module.css`, `src/components/lavagna/AppHeader.jsx` (Salva onClick region 166–182) | sessionExporter/Importer signatures from Impl-B services |
| Impl-B5 unit tests | NEW `tests/unit/services/sessionExporter.test.js`, NEW `tests/unit/services/sessionImporter.test.js`, NEW `tests/unit/hooks/useSessionAutosnapshot.test.js` | Impl-B services exports |
| Impl-B6 E2E | NEW `tests/e2e/session-export.spec.js`, `playwright.prod.config.js` (extend if needed) | Live preview port 5173 |
| Impl-C (Goal C) | `src/components/simulator/panels/MinimalControlBar.jsx` (lines 207–261 region), `src/components/simulator/panels/ControlBar.jsx` (mirror change) | `src/components/simulator/NewElabSimulator.jsx` (handler wiring readonly) |

**NO impl agent may write outside its column.** Sync points handled by lead post-Phase 1.

## Goal A — Manuale ↔ Passo Passo auto-sync

Read source-of-truth pages from `VOLUME_REFERENCES` (per-experiment `bookPage` field, already populated 94/94).

**Behavior**:
1. LavagnaShell `currentStep` change → look up `VOLUME_REFERENCES[experimentId]` → derive `bookPage`.
2. If `volumeOpen` true → call `setCurrentVolumePage(bookPage)`. If false → no-op (NEVER auto-open).
3. Emit DOM event `elab-step-change { experimentId, stepIndex, bookPage }` for any external listener.
4. VolumeViewer already reacts to `initialPage` prop change via existing useEffect (line 74–79). Verify behaviour intact OR add controlled `page` prop if needed.
5. Per-step granularity (different page per step) deferred — current v1 syncs to experiment's primary bookPage on any step change. Future enhancement: extend `buildSteps[].bookRef` per-step.

**No regression risk**: VolumeCitation onClick path (line 1457) unchanged.

## Goal B — JSON Export sessione (6 atoms, schema v1.0)

### Schema (LLM-friendly, minimal)

```json
{
  "elab_session_export": {
    "version": "1.0",
    "exportedAt": "2026-05-27T20:30:00.000Z",
    "experiment": { "id": "v1-cap6-esp1", "title": "Primo LED", "volume": 1, "chapter": 6 },
    "modalita": "passo-passo",
    "components": [
      { "id": "led1", "type": "led", "x": 240, "y": 180, "rotation": 0, "color": "red", "value": null }
    ],
    "wires": [
      { "id": "w1", "from": "led1:anode", "to": "bb1:row-5-a", "color": "red" }
    ]
  }
}
```

### Atoms

- **B1 `sessionExporter.js`** ~80 LOC. Reads `window.__ELAB_API.unlim.getCircuitState()` → maps to schema. Pure function `exportSession(opts) → JSON string`. No DOM/storage side-effects.
- **B2 `sessionImporter.js`** ~120 LOC. Pure `importSession(jsonString) → { ok, errors[], session }` + applicator `restoreSession(session) → Promise<void>` calling `mountExperiment` then iterating components/wires via existing APIs. **Validation**: version check, required-field schema, malicious-JSON rejection (no eval, no prototype pollution), max size 1 MB.
- **B3 `SessionExportModal.jsx` + CSS** ~150 LOC. Modal with 3 buttons: Salva su Supabase / Esporta JSON (download blob) / Importa JSON (file input). Triggered from AppHeader Salva. ARIA dialog role, ESC + backdrop close, 44px touch targets.
- **B4 `useSessionAutosnapshot.js`** ~60 LOC. Hook: setInterval 30s → exportSession → `localStorage.setItem('elab-session-snapshot-<expId>', json)`. Bounded by quota: if `localStorage.length > N` purge oldest. Cleanup on unmount.
- **B5 unit tests**. Roundtrip (export → import → equal), invalid version reject, malicious JSON reject (prototype pollution, oversized payload), missing experiment fallback, quota exhaustion fallback.
- **B6 E2E spec**. Playwright: load Lavagna → place LED+R+Battery → Salva → modal opens → Esporta JSON → file downloaded → Importa JSON → circuit restored. Run against `preview_start elab-builder-dev` port 5173.

## Goal C — Play/Pause/Stop 3-button redesign

`MinimalControlBar.jsx` lines 207–261:

Current: `isRunning ? <Pause> : <Play>` toggle + `<Reset>`.

New: 3 distinct buttons always visible for Arduino esp + 1 Reset. State-driven `disabled` styling:

| State | Play | Pause | Stop | Reset |
|-------|------|-------|------|-------|
| stopped (t=0) | enabled | disabled | disabled | enabled |
| running | disabled | enabled | enabled | enabled |
| paused | enabled (resume) | disabled | enabled | enabled |

Props extended: `onPlay`, `onPause`, `onStop` (NEW), `onReset`, `isRunning`, `isPaused` (NEW). NewElabSimulator wires `onStop` to AVR worker stop + t reset + pin state clear + serial buffer clear. ControlBar.jsx (fallback) mirrors same change.

`isArduinoExperiment` gate preserved (non-Arduino experiments hide Play/Pause/Stop).

## Phase Workflow

### Phase 0 (this doc + tasks)
- Plan doc committed
- 10 tasks created via TaskCreate
- Preview server `elab-builder-dev` port 5173 started
- Baseline 14551 acknowledged

### Phase 1 — Parallel dispatch (6 implementers)
Lead (this orchestrator) launches 6 Task tool calls in single message, `subagent_type=agent-teams:team-implementer`. Each implementer gets:
- This plan doc path for context
- Exclusive file list from ownership matrix
- TDD red-green mandate
- Baseline 14551 — must not regress
- Self-contained prompt (no parent context)
- Caveman-mode disable for prompt construction (clarity > terseness for handoff)

### Phase 2 — Verify (sequential after Phase 1)
- `npx vitest run` × 3 — CoV identical output
- preview live verify Goals A+B+C user flows via preview_eval + DOM inspect + screenshot
- Test count delta vs baseline 14551 reported

### Phase 3 — Codex adversarial review
- Dispatch `codex:codex-rescue` with adversarial prompt
- Must check: JSON import validation (prototype pollution / oversized), localStorage quota, AVR Pause→Resume race, VolumeViewer auto-sync infinite loop, test coverage delta, anti-pattern (magic numbers, hardcoded strings, copy-paste)
- Apply HIGH findings → loop until adversarial PASS

### Phase 4 — Integration + deploy
- `npm run build` × 2 both exit 0
- `npx vercel --prod --yes` → URL + curl 200
- `curl elabtutor.school` 200
- Memory `observation_add` session summary
- Update `docs/prompts/PROMPT-NEXT-SESSION-2026-05-28.md`

## Anti-regression invariants (CLAUDE.md immutable)

- 8-esp whitelist `VISIBLE_EXP_IDS` — DO NOT touch
- `Battery9V.jsx` — INTOCCABILE
- No re-introduction of `bookGeometry/*.json` or `demo-mode.js` or `manual-index.json`
- No `git --no-verify`, no direct push to `main`
- No new npm deps without Andrea OK
- No emoji as icons — use ElabIcons.jsx
- WCAG: 44×44 touch min, AA contrast, 13px min font
- Caveman applies to chat — code/commits write normal

## Success criteria

- ✅ All 3 features deployed prod + curl HTTP 200
- ✅ CoV 3× vitest output identical (no flakiness)
- ✅ Build × 2 pass
- ✅ Test count delta ≤ 0 fail (regression) + new test additions positive
- ✅ Codex adversarial review HIGH findings applied
- ✅ Plan doc + per-atom commits + final integration commit on branch
- ✅ Andrea ratify live state via screenshot
- ✅ Memory observation_add + PROMPT-NEXT-SESSION-2026-05-28.md updated
