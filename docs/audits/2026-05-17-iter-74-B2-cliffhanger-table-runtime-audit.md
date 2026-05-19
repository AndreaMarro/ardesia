# Iter 74 TRACK B-2 — cliffhanger-table runtime usage audit + decision matrix

## Audit empirical 2026-05-17 PM

### Search results all consumers

```
$ grep -rln "experimentNarrativeService\|getCliffhanger\|getNextExperiment" src/ tests/ scripts/
src/services/experimentNarrativeService.js
```

= **ZERO consumers** anywhere src/ + tests/ + scripts/. `experimentNarrativeService.js` is 100% DEAD CODE runtime.

### Service architecture (250 LOC, iter-70-A authored)

`src/services/experimentNarrativeService.js`:
- Imports `cliffhanger-table.json` (14 Vol3 entries Tea + iter-70-A authored)
- Imports `narrative-map-94.json`
- Imports `standard-experiment-schema.json`
- Exports `flattenCliffhangerTable()` + various lookup helpers
- Bridges 3 data sources O(1) lookup per experiment_id

### Data sources state

| Source | Path | Format | Consumed by |
|---|---|---|---|
| `cliffhanger-table.json` | `src/data/` | wrapper `{experiments: [14]}` | experimentNarrativeService only |
| `narrative-map-94.json` | `src/data/` | `{_meta, volumes}` structured | experimentNarrativeService only |
| `lesson-paths/v*.json` | `src/data/lesson-paths/` (79 files) | `{next_experiment: {id, title, preview}}` | **LessonPathPanel** ✓ + iter 74 B-1 cliffhanger CTA wire 3 components |
| Tea canonical | `/VOLUME 3/TEA/Nuovo lavoro tea/cliffhanger_table.json` | flat array 94 | reference only (NOT runtime) |

### NEW richer narrative content discovery

`cliffhanger-table.json` entries have **`cliffhanger` text field** Tea-authored:
```json
{
  "id": "v3-cap5-esp1",
  "cliffhanger": "Ragazzi, il LED lampeggia! E se volessimo cambiare la velocità del lampeggio senza riscrivere tutto? Vol. 3 pag. 47 ci mostra come.",
  "next_id": "v3-cap5-esp2"
}
```

Per-experiment lesson-paths has `next_experiment.preview` generic placeholder:
```json
{
  "next_experiment": {
    "id": "v3-cap5-esp2",
    "title": "Cambia la velocità del lampeggio",
    "preview": "Nella prossima lezione cambieremo i tempi di accensione e spegnimento per creare ritmi diversi."
  }
}
```

**Quality comparison**:
- cliffhanger: Tea-authored verbatim + plurale "Ragazzi" + Vol/pag citation (PRINCIPIO ZERO compliant)
- preview: generic placeholder text (less narrative-rich)

## Decision matrix iter 74 B-2 → iter 75 review

### Option A — REMOVE dead service immediately (clean code, zero debito)

- Pro: -250 LOC dead code, NO debito tecnico per Andrea mandate
- Pro: -1 file `experimentNarrativeService.js` clarity
- Pro: cliffhanger-table.json + narrative-map-94.json + standard-experiment-schema.json files remain (Tea reference data preserved)
- Con: loses richer Tea-authored `cliffhanger` text source future wiring
- Con: removes O(1) lookup helper functions (future reimplementation cost)

### Option B — Keep dead + mark deprecated (current state + flag)

- Pro: preserves option future wire-up iter 75 enhancement
- Pro: cliffhanger-table.json + service ARE used by Vol3 chain integrity tests OR benchmarks (verify)
- Con: dead code remains (Andrea mandate violation lite)
- Con: developer confusion "service exists why not used"

### Option C — Wire service into iter 74 B-1 cliffhanger CTAs RICH (enhancement)

- Pro: cliffhanger CTAs use Tea-authored RICH narrative text (PRINCIPIO ZERO + Morfismo Sense 2 perfetto)
- Pro: service becomes ALIVE = NO dead code
- Pro: single source of truth Vol3 narrative chain
- Con: requires update B-1 BG agent in-flight OR iter 75 enhancement post B-1 baseline
- Con: cliffhanger-table.json 14 Vol3 only — Vol1+Vol2 narrative still uses per-experiment lesson-paths (mixed sources)

### **RECOMMENDED Option C iter 75** (post B-1 baseline ships)

Rationale GSD-2:
1. iter 74 B-1 ships baseline CTA wire with per-experiment lesson-paths (LessonPathPanel pattern reuse, ZERO risk)
2. iter 75 enhancement: wire experimentNarrativeService into Vol3 CTAs to expose RICH Tea-authored cliffhanger text
3. iter 75 Vol1+Vol2 evaluation: extend cliffhanger-table.json to full 94 (Tea canonical) OR generate rich text per-experiment

## Iter 74 B-2 ACTION ITEMS (this atom scope)

1. ✅ Audit empirical complete (this document)
2. ✅ Decision matrix documented (Option A/B/C trade-offs)
3. ✅ Recommendation Option C iter 75 enhancement post B-1 ships
4. ⏸ NO source code changes iter 74 B-2 (audit-only scope)
5. ⏸ Service file deprecation comment header DEFER iter 75 final decision

## Mac Mini MM-3 iter 73 finding confirmation

Previous iter 73 MM-3 reported: "cliffhanger-table.json IS USED RUNTIME via experimentNarrativeService.js". Empirical iter 74 B-2 confirms: technically YES (service imports table) MA service itself NOT consumed UI = effectively DEAD CHAIN runtime UI.

## Honesty caveats

1. NOT removed service iter 74 B-2 — defer iter 75 review post B-1 outcome
2. cliffhanger-table.json + narrative-map-94 + standard-experiment-schema preserved (Tea reference + future enhancement source)
3. Vol1+Vol2 cliffhanger text source UNDECIDED iter 75 (per-experiment generation OR Tea-extend OR LLM-generate)
4. iter 70-A audit may have additional context for service intent — not re-verified iter 74 B-2 (audit doc only)
5. B-1 BG agent in-flight uses per-experiment lesson-paths pattern (decision NOT to interrupt with service enhancement)

## Cross-link

- iter 73 MM-3 finding: `docs/audits/2026-05-17-iter-73-CLOSE-audit.md` §Mac Mini findings
- iter 72.5 CORRECTION audit: `docs/strategy/2026-05-17-iter-72.5-NARRATIVE-AUDIT-CORRECTION.md`
- iter 57 close audit (Vol3 14-chain canonical): `docs/audits/2026-05-14-iter-57-close-audit.md`
- experimentNarrativeService source: `src/services/experimentNarrativeService.js` (250 LOC, iter-70-A)
- Tea canonical reference: `/VOLUME 3/TEA/Nuovo lavoro tea/cliffhanger_table.json` (94 entries flat array)
