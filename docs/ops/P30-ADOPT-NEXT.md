# P30 ADOPT — Next

Adoption is GREEN. The substrate is now a verifiable base on `p30/adopt-dormant-simulation-wip-20260709-175500` (PR open, no auto-merge — Andrea decides merge).

## Immediate (Andrea)
1. Review + merge the adoption PR → `tutor-ux` becomes a clean single-writer lane at a merged HEAD.
2. (Optional cleanup, non-blocking) gitignore `output/playwright/` so artifacts aren't carried forward.
3. Rotate the historically-pasted OpenAI key (memory note; not in repo, but exposed in a past prompt).

## Next single patch (after merge) — the ONLY P30 feature step
Create `apps/studio/e2e/p30-free-manipulation.spec.ts` proving the free-Tinkercad chain end-to-end:
```
open Ardesia → mount Simulation Plugin → Free Mode
→ palette (battery9v, LED, resistor, wire) visible
→ add LED + resistor + battery (typed ops)
→ connect ≥2 wires
→ run solve → current/diagnostic badge
→ break a wire → simulation.error.observed (open-circuit)
→ save → reopen with identical sceneDigest
```
Nothing else. No new plugins, no lavagna, no deploy, until this spec is green.

## Explicitly NOT next
- websearch / citations / hd-charts / math / human-body plugins
- GoodNotes lavagna, graphiphy/HTML export, extra graph work
- preview deploy / `/health`
- any Tinkercad-parity declaration
