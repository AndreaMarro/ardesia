# iter 60 — api.js ALLOWED_COMPILE_BOARDS diff PREVIEW (NOT APPLIED)

**Status**: SCAFFOLD-ONLY. Diff documented here but **NOT** edited into `src/services/api.js`.
**Pending**: Andrea ratify Q1-Q3 (default board + n8n core install + UNO R4 variant) — see `docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md` R1 and `docs/adrs/ADR-032-blockly-nano-r4-cross-compile-board-param.md` (DRAFT).

## Current state — `src/services/api.js` lines 60-65 (verbatim)

```javascript
const DEFAULT_BOARD = 'arduino:avr:nano:cpu=atmega328old';
const ALLOWED_COMPILE_BOARDS = new Set([
    'arduino:avr:nano:cpu=atmega328old',
    'arduino:avr:uno',
]);
const SOCRATIC_INSTRUCTION = [
```

## Proposed change — lines 60-67 (after Andrea ratify, NOT YET APPLIED)

```javascript
const DEFAULT_BOARD = 'arduino:avr:nano:cpu=atmega328old';
const ALLOWED_COMPILE_BOARDS = new Set([
    'arduino:avr:nano:cpu=atmega328old',
    'arduino:avr:uno',
    'arduino:renesas_uno:unor4wifi',   // NEW iter 60 — pending Andrea Q3 (WiFi variant)
    'arduino:renesas_uno:minima',      // NEW iter 60 — pending Andrea Q3 (Minima variant)
]);
const SOCRATIC_INSTRUCTION = [
```

## Rationale — why this annotation is NOT applied

1. **Andrea ratify Q1-Q3 pending**: default board choice (Q1), n8n server arduino-cli `arduino:renesas_uno` core install confirmation (Q2), and UNO R4 variant scope (Q3 WiFi-only vs Minima-only vs both) are blockers per ADR-032 DRAFT — applying the allowlist before ratify would surface compile attempts to FQBNs the backend may not support, returning opaque 5xx errors to docenti.
2. **Backend prerequisite unverified**: n8n compile worker at `https://n8n.srv1022317.hstgr.cloud/compile` has not been confirmed to have `arduino-cli core install arduino:renesas_uno` executed; allowing these FQBNs client-side without backend support violates the "MAI dati finti o demo" rule (CLAUDE.md rule 12) — a board option must really work end-to-end before exposure.
3. **Scaffold scope discipline**: iter 60 R1 contract is `BoardSelector.jsx` STUB disabled-by-default; touching `src/services/api.js` (critical file, 1040 LOC, listed in CLAUDE.md "coordinamento OBBLIGATORIO prima di modificare" table) requires explicit ratification + paired ScratchEditor.jsx + compile pipeline test before merge — out of scope for the iter 60 R1 scaffold cycle.

## Wire-up plan (post-ratify, iter 60 R2+)

When Andrea ratifies Q1-Q3:

1. Apply the diff above in a separate atomic commit `feat(iter-60-r2): extend ALLOWED_COMPILE_BOARDS for Renesas UNO R4`.
2. Wire `BoardSelector` in `ScratchEditor.jsx` (or `ScratchCompileBar.jsx` per ratify) with `availableBoards` populated from `ALLOWED_COMPILE_BOARDS`.
3. Add `tests/unit/services/api-compile-board-allowlist.test.js` (≥4 cases: classic AVR PASS, UNO PASS, Renesas WiFi PASS, Renesas Minima PASS, unknown FQBN REJECT).
4. n8n smoke test: compile blink.ino targeting each FQBN; verify HEX returned for all 4 entries before user-facing exposure.
5. Update `BoardSelector` props in caller: pass `disabled={false}` (or remove the prop, since default already `true`).

## Files referenced

- `src/services/api.js:60-64` — current allowlist (NOT modified iter 60 R1)
- `src/components/simulator/panels/BoardSelector.jsx` — iter 60 R1 scaffold (NEW, disabled-by-default)
- `docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md` — R1 requirement source
- `docs/adrs/ADR-032-blockly-nano-r4-cross-compile-board-param.md` — DRAFT, pending Andrea ratify
