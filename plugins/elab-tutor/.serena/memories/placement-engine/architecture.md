# PlacementEngine — Architecture & API

## Purpose
Deterministic breadboard placement from semantic LLM intents.
Separates LLM semantic understanding from spatial computation.

## Flow
```
Student: "Metti un LED vicino al resistore"
  → LLM (Galileo) → [INTENT:{"action":"place_and_wire","components":[{"type":"led","near":"r1"}]}]
  → ElabTutorV4.jsx extracts [INTENT:...] BEFORE the [AZIONE:] loop
  → PlacementEngine.resolvePlacement(intent, snapshot) → actions[]
  → Two-pass execution: Pass1=addcomponent (captures real IDs), Pass2=addwire (remaps pe_*→real IDs)
  → Existing [AZIONE:] loop processes remaining tags UNCHANGED
```

## Fallback Chain (3 levels)
1. INTENT → PlacementEngine resolves → two-pass execution
2. AZIONE tags → existing loop in ElabTutorV4 (unchanged)
3. deterministic_action_fallback() → nanobot backend

## Kill-Switch
PLACEMENT_ENGINE_ENABLED = true/false in ElabTutorV4.jsx (~line 1370).

## Exports (PlacementEngine.js, ~757 lines)

### validateIntent(intent) → { valid, errors[] }
### class OccupancyMap (constructor, isHoleFree, areHolesFree, findFreeColumn, findFreeGapColumn, markOccupied, getOccupant)
### placeComponent(compIntent, compId, occupancy, snapshot) → { success, x, y, pinAssignments }
### resolveAutoWiring(compIntent, compId, pinAssignments, bbId, snapshot) → wire[]
### resolvePlacement(intent, snapshot) → { success, actions[], errors[], debug }

## Integration in ElabTutorV4.jsx (lines 1369-1467)
- Dynamic import for code-splitting (27.55KB chunk)
- Two-pass: Pass1=addcomponent+peIdMap, Pass2=addwire+ID remapping
- Falls back to raw AZIONE tags on error

## Test Coverage (56 tests, 02/03/2026)
96% statements, 79% branches, 100% functions (tests/PlacementEngine.test.js)

## Files Modified
1. PlacementEngine.js — NEW engine
2. breadboardSnap.js — added exports
3. NewElabSimulator.jsx — +1 line pinAssignments
4. ElabTutorV4.jsx — +98 lines INTENT block
5. circuit.yml — +30 lines placement_intent
6. vitest.config.js — +1 line coverage include
