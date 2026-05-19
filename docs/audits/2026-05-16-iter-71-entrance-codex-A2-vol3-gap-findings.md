# Iter 71 Entrance — Codex Pattern V A2 Vol3 Gap Findings

**Date**: 2026-05-16 PM (Codex GPT-5.5 high single sequential dispatch ~3min 100KB output)
**Methodology**: Codex Pattern V (read-only sandbox + file:line citations) — `scripts/dev/codex-bg.sh verify-team-A2-vol3-gap-iter71 --profile verify`
**Status**: ✅ COMPLETE (alive=0 size=100158 bytes)

## Key findings

### 1. Exact gap: 15 missing Vol3 IDs

`src/data/experiments-vol3.js` has 14 IDs (`v3-cap5-esp1` → `v3-cap8-esp3`). Tea `narrative_map.json` has 29 IDs under `v3.chapters`. **Gap: 15 IDs**.

### 2. 15 missing IDs table (with Tea section refs + chapter assignment)

| Missing ID | Tea name | Tea section ref | Suggested chapter |
|---|---|---:|---|
| `v3-cap6-esp3` | Porte logiche OR | narrative_map.json:1063 | cap6 |
| `v3-cap6-esp5` | Encoder binario a 3 bit | narrative_map.json:1083 | cap6 |
| `v3-cap6-esp6` | Decoder binario | narrative_map.json:1093 | cap6 |
| `v3-cap6-esp7` | Modulazione d'ampiezza (AM) | narrative_map.json:1103 | cap6 |
| `v3-cap7-mini` | Sfida capstone: sistema di allarme intelligente | narrative_map.json:1121 | cap7 |
| `v3-cap7-esp4` | Sensore di temperatura TMP36 | narrative_map.json:1161 | cap7 |
| `v3-cap7-esp5` | Semaforino termico: if condizionale | narrative_map.json:1171 | cap7 |
| `v3-cap7-esp7` | Knight Rider: sequenza luminosa | narrative_map.json:1191 | cap7 |
| `v3-cap7-esp8` | Progetto integrato: stazione meteorologica | narrative_map.json:1201 | cap7 |
| `v3-cap8-serial` | Potenza e calore: l'energia del circuito | narrative_map.json:1219 | cap8 |
| `v3-cap8-esp4` | Legge di Ohm: il triangolo magico | narrative_map.json:1259 | cap8 |
| `v3-cap8-esp5` | Predire e misurare: la sfida pratica | narrative_map.json:1269 | cap8 |
| `v3-extra-lcd-hello` | Display LCD 16x2: Hello World | narrative_map.json:1287 | cap8 |
| `v3-extra-servo-sweep` | Servo motore: sweep da 0 a 180 gradi | narrative_map.json:1297 | cap7 |
| `v3-extra-simon` | Gioco Simon: memoria e velocità | narrative_map.json:1307 | cap7 |

### 3. cliffhanger-table.json shape (IMPORTANT DISCREPANCY vs iter 70 Codex Pattern C TEAM A finding)

`src/data/cliffhanger-table.json` is **ALREADY wrapper-shaped** `{ "_meta": ..., "experiments": [...] }` (cliffhanger-table.json:2 + line 9). Currently has 14 experiment entries matching app data gap.

**Iter 70 Codex Pattern C TEAM A had reported wrapper NOT Tea-compat** — that finding was PARTIAL (wrapper exists, but the inner experiments array structure may differ from Tea canonical 94-item flat array). Need iter 71 review whether wrapper IS Tea-compat or needs further conversion.

### 4. Convert script design (~10 LOC)

```js
// scripts/convert-tea-cliffhangers.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const teaPath = '/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/narrative_map.json';
const outPath = 'src/data/cliffhanger-table.json';

const tea = JSON.parse(readFileSync(teaPath, 'utf8'));
const experiments = Object.values(tea.v3.chapters)
  .flatMap(ch => ch.experiments ?? [])
  .map(({ id, title, next_id, cliffhanger, breadcrumb }) => ({
    id,
    title,
    next_id,
    cliffhanger,
    breadcrumb
  }));

writeFileSync(outPath, JSON.stringify({ experiments }, null, 2) + '\n');
```

### 5. Effort estimate

| Task | Effort |
|---|---|
| Read-only audit/design | DONE (this doc) |
| Implement converter + validation | 1.5-2.5 hours |
| Add 15 missing experiment records (app content + assets + stubs) | 6-10 hours (depends on circuit/code fidelity expected) |
| **Total iter 71 TEAM A2 rework** | **~8-12 hours** |

## Iter 71 atom A2 dispatch readiness

Codex findings = INPUT for iter 71 Task 6 (TEAM A2 Vol3 dataset rework) per `docs/plans/2026-05-16-iter-71-DETAILED-PLAN.md`. Subagent BG worktree `elab-builder-iter71-A2` can use this audit verbatim.

## Honesty caveats

1. **Discrepancy iter 70 vs iter 71 Codex Pattern V**: iter 70 Codex Pattern C TEAM A claimed cliffhanger wrapper NOT Tea-compat. iter 71 Codex Pattern V says wrapper IS already shaped. Iter 71 entrance needs reconciliation: check if INNER experiments array structure matches Tea's 94-item array contract (id/title/next_id/cliffhanger/breadcrumb fields verified).
2. **15 missing IDs are KNOWN gap, not BUG** — Tea narrative is authoritative; app data follows incrementally per Davide co-author iter 71-75 multi-iter scope.
3. **`v3-cap7-mini` + `v3-cap8-serial` part of A9 carryover iter 38** (defer mainwt experiments-vol3.js companion files Maker-1 §6 ready iter 71+ sub-task).
4. **Add 15 records 6-10h = SUBSTANTIAL** — content quality (circuit SVG + Blockly + UNLIM prompts + bookText volume references + cliffhanger transitions) requires Davide co-author OR Tea T1+T2 brief iter 58 carryover.
5. **Converter script alone (1.5-2.5h) sufficient to PARTIAL CLOSE iter 71 TEAM A2** — converter populates ID skeletons + Tea metadata, content fidelity defer iter 72-74 multi-iter Davide co-author.

## Files refs

- Source code: `src/data/experiments-vol3.js` (14 IDs current) + `src/data/cliffhanger-table.json` (14 entries wrapper-shape current)
- Tea canonical: `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/narrative_map.json` (29 IDs)
- Codex Pattern V raw output: `/tmp/codex-verify-team-A2-vol3-gap-iter71.txt` (100KB final 2026-05-16T20:34)
- Iter 71 detailed plan Task 6: `docs/plans/2026-05-16-iter-71-DETAILED-PLAN.md:Task 6` (TEAM A2 worktree subagent BG dispatch 3h estimated)

**Iter 71 entrance gate**: this audit READY for Task 6 dispatch. Subagent BG can consume this verbatim + Codex A2 raw output for full context.
