# tests/unit/features/elabBlocks — Test conventions

Unit tests for the `src/features/elabBlocks/` Blockly Cross-Compiler module.

## Scope

`elabBlocks` is the **Blockly side** of the cross-compiler bridge:

- `starterTemplates.js` — pre-built Blockly XML programs (blink / button / sensor / servo-sweep / lcd-hello / button-led / serial-echo)
- `codeSync.js` — C++ ↔ Blockly XML roundtrip parser (tolerant + comment-preserve + #define + multi-fn + error-recovery + IT diagnostics)

`elabBlocks` is **separate from** `elabArduinoAst` (Wave 2 deferred — 1185 LOC cascade risk per Wave 1b brief Sez "Hard NO-TOUCH"). Do **NOT** import from `elabArduinoAst/` in these tests. The two modules will integrate later via explicit boundary.

## Parser invariants enforced by these tests

1. **Well-formed C++** (matching Nano R4 blink pattern) → identity roundtrip via `cppToBlocklyXml`.
2. **Tolerant parsing** of malformed C++ → `cppToBlocklyXmlTolerant` returns valid Blockly XML (may contain TODO placeholder blocks) — NEVER throws.
3. **Comment preservation** — both `//` inline and `/* */` block — survive C++ → XML → C++ as Blockly `<comment>` children.
4. **Multi-function support** — user-defined `void foo() { ... }` (beyond `setup`/`loop`) emits `procedures_defnoreturn` Blockly blocks.
5. **`#define` macros** — numeric, string, multi-line (backslash continuation) parse without crash. Numeric/string emit as const var blocks; multi-line may degrade to placeholder.
6. **`#ifdef` stub** — preprocessor conditionals degrade gracefully (warn + ignore branch), no crash.
7. **Error recovery** — syntax errors emit TODO placeholder blocks + `console.warn` IT message.
8. **IT diagnostics** — all warn/error messages in **Italian** ("Errore di sintassi alla riga X: ...") never English. Surface to `getLastParseDiagnostics()` for UI consumption.

## Coordination — Impl-G ↔ Impl-B (Wave 1b)

`codeSync.roundtrip.test.js` is the **contract test** for Impl-B-2 Wave 1b expansion of `codeSync.js`. Impl-G writes the contract first (initially red). Impl-B implements `codeSync.js` extensions to make it green. Contract changes only on explicit feedback from Impl-B.

Expected new exports from Impl-B-2:

- `cppToBlocklyXmlTolerant(source, options?)` — tolerant variant. `options.preserveComments` controls comment emission.
- `getLastParseDiagnostics()` — returns `{ warnings: Array<{lineno, message_it}>, errors: Array<{lineno, message_it}>, placeholders: Array<{lineno}> }`.

## Why separate from `elabArduinoAst/`

`elabArduinoAst/` is the Wave 2 full AST module (1185 LOC across multiple files). It owns the canonical C++ AST representation. `elabBlocks/codeSync.js` is the **lightweight** bridge used at Wave 1 → Wave 1b stage — regex + simple pattern matching, NOT a real AST.

When Wave 2 lands, `codeSync.js` will delegate to `elabArduinoAst/` instead of inline pattern matching. Until then, tests live here and assert the lightweight contract.

## Running

```bash
# Whole dir
npx vitest run tests/unit/features/elabBlocks/

# Single file
npx vitest run tests/unit/features/elabBlocks/codeSync.roundtrip.test.js

# Watch mode
npx vitest tests/unit/features/elabBlocks/
```

## File ownership (Wave 1b)

Per `docs/dispatch/2026-05-25-wave-1b-team-brief.md`:

- Impl-G-2 owns: `codeSync.roundtrip.test.js`, this README, `starterTemplates.test.js` (read-only — Impl-B may extend).
- Impl-B-2 owns: `src/features/elabBlocks/codeSync.js`, `src/features/elabBlocks/starterTemplates.js`.

Cross-owner edits forbidden. Test files in this directory must come through Impl-G PRs unless explicitly co-authored.
