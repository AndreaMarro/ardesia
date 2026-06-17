# Sprint Q1 Audit — Schema Capitolo narrative-preserving + migration + service

**Data:** 2026-04-24
**Branch:** `feat/sprint-q1-capitolo-schema-narrative-2026-04-24`
**Sprint:** Q1 (schema Capitolo + migration lesson-paths + percorsoService)
**Precede:** Q2 UI Percorso Capitolo + DocenteSidebar
**Fonte decisioni:** `docs/audits/2026-04-24-narrative-progression-analysis.md`

---

## TL;DR

3 commit Q1 consegnati in ~30 min TDD strict Red-Green-Refactor:

| Commit | SHA | Scope | Test added |
|--------|-----|-------|------------|
| Q1.A | `4d0ec85` | Schema Capitolo.ts (Zod) | +14 |
| Q1.B | `c03ab9b` | Migration 94 lesson-paths → 37 Capitoli | +20 |
| Q1.C | `257f7e5` | percorsoService lookup API | +12 |
| **TOT** | | | **+46** |

Baseline 12291 → **12337** (+46). Zero regression su 217 test files.
6 decisioni operative Q0 implementate: 4/6 live (1 schema, 2 simon, 3 bonus, 4 incremental mode). 2 rimanenti (Percorso UI + Passo Passo UI) pendenti Q2.

---

## 1. Q1.A — Schema Capitolo (TDD)

**File**: `src/data/schemas/Capitolo.js` (195 righe) + `tests/unit/schemas/Capitolo.test.js` (14 test)

Zod 4.3.6 schema con:
- 5 tipi: `theory` | `experiment` | `project` | `bonus` | `wip`
- `theory.testo_classe` + `citazioni_volume[{page, quote, context}]` + `figure_refs` + `analogies_classe`
- `narrative_flow.transitions[]` con `incremental_mode: from_scratch|add|remove|modify_component`
- `build_circuit` **discriminated union** su `mode`:
  - `from_scratch` → requires `intent.{components, wires}`
  - `incremental_from_prev` → requires `incremental_delta.{base_experiment_id, operations}`
- `phases[]`: `classe_display` (text_hook, volume_quote, observation_prompt, analogies) + `docente_sidebar` (ora_fai, chiedi_alla_classe, attenzione_a, common_mistakes_short)

Helper `validateCapitolo(obj) → {valid, errors, data?}` per UI e migration tooling.

Constants: `CAPITOLO_TYPES`, `BUILD_MODES`, `PHASE_NAMES`, `INCREMENTAL_MODES`.

### TDD cycle
1. RED: 14 test fail `Failed to resolve import`
2. GREEN: implement schema, 14/14 pass 9ms
3. Baseline 12291 → 12305 (+14)

## 2. Q1.B — Migration 94 → 37

**File CLI**: `scripts/migrate-lesson-paths-to-capitoli.mjs`
**File lib**: `scripts/migrate-lesson-paths-to-capitoli.lib.js` (250 righe)
**Test**: `tests/unit/migration/lesson-paths-to-capitoli.test.js` (20 test)

### Pure helpers (TDD unit)
- `extractClasseDisplay(phase)` — map `class_hook`→`text_hook`, `summary_for_class`|`observation_prompt`→`observation_prompt`, normalize analogies (string|object)
- `extractDocenteSidebar(phase)` — map `teacher_message`→`ora_fai`, `provocative_question`→`chiedi_alla_classe`, `teacher_tip`→`attenzione_a[]`, `common_mistakes`→`common_mistakes_short`
- `inferBuildMode(curr, prev)` — `incremental_from_prev` se delta componenti ≤2 + breadboard condivisa; altrimenti `from_scratch`
- `inferIncrementalMode(curr, prev)` — `add`|`remove`|`modify_component` in base al count delta

### Main migration
- `buildCapitoloFromLessonPaths(meta, lessons, volNum)` — assembla Capitolo + narrative_flow.transitions[] da class_hook chain
- `migrateAll()` — end-to-end produce 37 Capitoli

### Output migration
- 14 Vol1 + 12 Vol2 + 9 Vol3 = **35 cap-mapped**
- Vol3 Cap 9 PROMUOVE `v3-extra-simon.json` a capstone project
- `v3-extra-lcd-hello` + `v3-extra-servo-sweep` → 2 **bonus** Capitoli standalone
- **Totale: 37 Capitoli**

### Distribuzione tipi
```
theory:     12  (Vol1 1-5, Vol2 1-2, Vol2 11 Diodi, Vol3 1-4)
experiment: 20  (Vol1 6-13, Vol2 3-10, Vol3 5-8)
project:     3  (Vol1 cap14 Robot primo, Vol2 cap12 Robot segui luce, Vol3 cap9 Simon capstone)
bonus:       2  (Vol3 lcd-hello, servo-sweep)
───────────────
tot:        37
```

### TDD cycle
1. RED: 20 test fail (lib module non esiste)
2. GREEN iter 1: implement lib → 14/19 pass (5 fail null guard + count)
3. Fix null guard in `inferIncrementalMode` + normalize analogies string + test count 35→37
4. GREEN iter 2: 20/20 pass 89ms
5. Run CLI → 37 files scritti in `src/data/capitoli/`, schema valid 37/37
6. Baseline 12305 → 12325 (+20)

## 3. Q1.C — percorsoService

**File**: `src/services/percorsoService.js` + `tests/unit/services/percorsoService.test.js` (12 test)

Factory pattern per testability + default singleton per runtime.

### API
```js
createPercorsoService(capitoli) → {
  getCapitolo(id): Capitolo | null,
  listCapitoliByVolume(volNum): Capitolo[] (sorted, no bonus),
  listAllCapitoli(): Capitolo[] (all 37 incl. bonus),
  getBonusCapitoli(): Capitolo[] (type=bonus),
  findExperimentById(expId): { capitolo, esperimento } | null,
}
```

### Default singleton
Uses `import.meta.glob('../data/capitoli/*.json', { eager: true })` per bundling Vite build-time dei 37 JSON files. Zero runtime fetch.

### TDD cycle
1. RED: 12 test fail (service module non esiste)
2. GREEN: implement factory + singleton → 12/12 pass 4ms
3. Baseline 12325 → 12337 (+12)

## 4. Decisioni Q0 operative — status implementazione

| # | Decisione | Q1 status | Q2 pending |
|---|-----------|-----------|-----------|
| 1 | Schema narrative-preserving | ✅ Q1.A | UI consumption Q2 |
| 2 | simon → v3-cap9 capstone | ✅ Q1.B migrate | - |
| 3 | v3-extras → bonus tier | ✅ Q1.B migrate | UI Libero section Q2 |
| 4 | Passo Passo incremental mode | ⏳ schema-ready Q1.A | BuildModeGuide.jsx refactor Q2 |
| 5 | Percorso Capitolo UI | ⏳ service-ready Q1.C | PercorsoCapitoloView.jsx NEW Q2 |
| 6 | Bug editoriali flag Tea | 📧 async | - |

4/6 Q1 complete. 2/6 richiedono Q2 UI layer.

## 5. CoV Q1

| Check | Valore | Target | Stato |
|-------|--------|--------|-------|
| Baseline test pre-Q1 | 12291 | - | baseline |
| Baseline test post-Q1 | 12337 | ≥12291 | **+46 PASS** |
| Test files | 217 | 215 + 2 nuovi | **PASS** |
| Schema valid Capitoli | 37/37 | 100% | **PASS** |
| File naming convention | `v{1,2,3}-cap{N}` + `v3-bonus-*` | uniformi | **PASS** |
| Regression check (automated pre-commit hook) | 0 | 0 | **PASS** |
| Build vite | OK | OK | **PASS (import.meta.glob)** |
| CoV run 3x | 12337, 12337, 12337 | consistent | **PASS** |

## 6. File tree cambiamenti

```
src/data/
├── capitoli/                           (NEW dir, 37 JSON)
│   ├── v1-cap1.json..v1-cap14.json    (14)
│   ├── v2-cap1.json..v2-cap12.json    (12)
│   ├── v3-cap1.json..v3-cap9.json     (9)
│   ├── v3-bonus-lcd-hello.json        (1)
│   └── v3-bonus-servo-sweep.json      (1)
├── lesson-paths/                      (UNCHANGED legacy, 94 files)
└── schemas/                            (NEW dir)
    └── Capitolo.js                    (Zod schema + validateCapitolo helper)

src/services/
└── percorsoService.js                  (NEW, factory + singleton)

scripts/
├── migrate-lesson-paths-to-capitoli.lib.js  (NEW, pure helpers + migrateAll)
└── migrate-lesson-paths-to-capitoli.mjs     (NEW, CLI runner)

tests/unit/
├── schemas/Capitolo.test.js             (NEW, 14 test)
├── migration/                            (NEW dir)
│   └── lesson-paths-to-capitoli.test.js (NEW, 20 test)
└── services/
    └── percorsoService.test.js          (NEW, 12 test)
```

## 7. Backward compatibility

- **lesson-paths directory invariata**: 94 JSON file preservati in `src/data/lesson-paths/`
- **Nessun consumer esistente rotto**: percorsoService è NEW, non rimpiazza. `getCapitolo` API è additive.
- **UI refactor in Q2**: PercorsoPanel.jsx attuale continua funzionare finché Q2 non sostituisce con PercorsoCapitoloView.
- **Simulator ExperimentPicker**: non modificato in Q1; può iniziare consumare `listCapitoliByVolume` in Q2.

## 8. Prossimi passi Q2

1. `src/components/lavagna/CapitoloPicker.jsx` (NEW) — Grid Cap per volume
2. `src/components/lavagna/PercorsoCapitoloView.jsx` (NEW) — Scroll narrativo Cap completo
3. `src/components/lavagna/DocenteSidebar.jsx` (NEW) — Sidebar sticky colpo d'occhio
4. `src/components/common/VolumeCitation.jsx` (NEW) — Badge (Vol.N pag.M) cliccabile → VolumeViewer
5. `src/components/simulator/panels/BuildModeGuide.jsx` — prop `mode: incremental_from_prev` + delta rendering
6. Sostituzione `PercorsoPanel.jsx` (per-esp) con nuovo `PercorsoCapitoloView.jsx` (Cap-wide)

Timeline Q2 stimata: 2-3 giorni.

---

**Verdetto Q1**: PASS. Schema + migration + service sono le fondamenta pulite per Q2 UI. Principio Zero v3.1 (linguaggio classe+docente, citazioni volumi, narrative progression) enforced in schema type system. Zero regression, TDD strict full cycle.
