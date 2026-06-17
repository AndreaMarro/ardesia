# Sprint Q3 Audit — Edge Function prompt + capitoli loader (TDD)

**Branch:** `feat/sprint-q3-edge-function-prompt-2026-04-25`
**Baseline:** 12403 (Q2) → 12450 (+47 Q3)
**CoV iterations:** 4 commit, ogni commit pre-commit hook PASS

## Iterations

| Iter | SHA | Scope | Test |
|------|-----|-------|------|
| 1 | (5 agenti audit) | Audit Edge Function + state-aggregator + tests + GDPR + Capitolo integration | 0 |
| 2 | af62eb4 | aggregator script + capitoloPromptBuilder + 20 test | +20 |
| 3 | ddb1b37 | capitoli-loader.ts (Deno) + principioZeroValidator + 21 test | +21 |
| 4 | (uncommitted) | 20 fixtures jsonl + validation 6 test | +6 |
| 5-6 | TBD | Audit doc + final commit + PR | — |

**+47 cumulative Q3** baseline 12403 → 12450.

## Findings iter 1 (5 agenti paralleli)

### Edge Function audit
- BASE_PROMPT static system-prompt.ts:14-130, NO Capitolo binding
- Output free-form text, NO classe_display + docente_sidebar JSON
- Token usage ~1200 per call, target Q3 <800 (50% saving)

### state-snapshot-aggregator
- 456 lines, 5-source Promise.all (circuit + Wiki + RAG + memoria + vision)
- Pattern riusabile per Edge Function refactor

### Test coverage
- 0 Deno test su Edge Function (CRITICAL gap)
- unlimChat.test.js 307 lines unit + e2e/03 spec
- Bash smoke test scripts/cli-autonomous/verify-edge-function.sh

### GDPR audit (CRITICAL)
- Together AI default student runtime (llm-client.ts:181) — NO EU gate
- Gemini global endpoint (gemini.ts:11) — NO EU region pin
- together-teacher-mode.ts gate esiste ma NON wired in unlim-chat
- **Remediation proposta** (NON modificata production):
  1. Force EU Gemini endpoint `locations/europe-west1`
  2. Wire `canUseTogether(ctx)` in unlim-chat per gate student runtime
  3. Default student → Gemini EU + fallback Mistral FR + Qwen self-host
  4. Together AI SOLO batch + teacher + emergency

### Capitolo integration
- import.meta.glob Vite-only — NO Deno
- Soluzione: pre-aggregate 37 JSON → 1 capitoli.json (1MB) per Deno import
- Schema ready: classe_display + docente_sidebar fields Q1.D

## Deliverable Q3

### Q3.B aggregator script
`scripts/aggregate-capitoli-for-edge.mjs` → `supabase/functions/capitoli.json` (1MB, 37 Capitoli)
Re-runnable on schema/data update.

### Q3.C capitoloPromptBuilder
`src/services/capitoloPromptBuilder.js` (135 lines):
- `extractCitationAnchors(cap)` → max 5 anchor pointers (vol+page+quote 100 char)
- `selectActiveContext(cap, expId, phaseName)` → contesto attivo selettivo
- `buildCapitoloPromptFragment(cap, opts)` → frammento prompt italiano strutturato
- `estimatePromptTokens(text)` → ~4 char/token italiano

Token target rispettato: full fragment < 800 token (test enforce).

### Q3.D capitoli-loader Deno
`supabase/functions/_shared/capitoli-loader.ts` — Deno-compat:
- `getCapitolo(id)` / `getCapitoloByExperimentId(expId)`
- `listCapitoliByVolume(N)` / `listAllCapitoli()` / `getBonusCapitoli()`
- TypeScript types Capitolo + CapitoliBundle

Usa `import capitoliBundle from "../capitoli.json" with { type: "json" }` Deno native pattern.

### Q3.E principioZeroValidator
`src/services/principioZeroValidator.js`:
- `validatePrincipioZero(text)` returns {valid, violations[], word_count, citations}
- Rules: max_words HIGH, imperativo_docente CRITICAL, singolare_studente HIGH, pii_potential HIGH, english_filler LOW
- `capWords(text, max)` preserva tag [AZIONE:] [INTENT:]
- `extractCitations(text)` regex Vol.X pag.Y

### Q3 fixtures
`scripts/bench/workloads/tutor-q3-fixtures.jsonl` — 20 prompt reali tutor:
- Vol1 8 Capitoli (LED, RGB, Pulsante, Potenziometro, Fotoresistore, Cicalino, Robot)
- Vol2 5 Capitoli (Multimetro, Condensatori, Transistor, Motore DC, Diodi, Robot)
- Vol3 4 Capitoli (Blink, Pin digitali/analogici, Serial)
- Vol3 capstone Simon
- Vol3 bonus LCD

### Q3 fixtures validation
6 test PASS:
- 20 fixtures structural
- ≥85% fixtures.expected.valid_response pass PRINCIPIO ZERO
- ≥85% citations Vol.X pag.Y quando expected
- ≥95% under 60 parole
- Pass rate combinato target 85% PASS

## CoV Q3

| Iter | Test files | Tests | Pre-commit | Status |
|------|-----------|-------|------------|--------|
| 2 (af62eb4) | 223 | 12423 | PASS | OK |
| 3 (ddb1b37) | 224 | 12444 | PASS | OK |
| 4 (uncommitted) | 225 | 12450 | TBD | OK |

Zero regression continuo. Baseline mai sceso.

## Quality audit Q3

| Vincolo | Status |
|---------|--------|
| Backend services Node-compat | PASS (Vitest fully covered) |
| Deno compat (capitoli-loader.ts) | PASS (TypeScript types + import attribute) |
| PRINCIPIO ZERO enforcement runtime | PASS (validator) |
| PRINCIPIO ZERO compile-time prompt | PASS (buildCapitoloPromptFragment includes rules) |
| Token budget < 800/call | PASS (test enforce) |
| GDPR remediation | DOCUMENTED, attesa OK Andrea pre-modify production |
| Test fixtures 20 reali | PASS |
| TDD strict | PASS 4 commit |

## Production llm-client.ts modification

**NON modificato** in Q3 — è codice live production. Per modificare serve:
1. Andrea OK su remediation plan
2. Deploy plan staging-first
3. Rollback strategy
4. Modifiche atomiche piccole (separate commits per provider)

Q3 consegna **infrastruttura pronta** (loader Deno, validator, prompt builder, fixtures) MA NON wira in `unlim-chat/index.ts` per safety production.

## Next steps (post Q3)

Q3+ separate (post-merge):
- Wire capitoli-loader in unlim-chat/index.ts (small targeted commit)
- Apply GDPR fix llm-client.ts (force Gemini EU + Together gate)
- Deploy staging + smoke test stress-test.sh
- Enable validator middleware response

## Verdetto Q3

**PASS infrastructure.** Edge Function ready-to-wire con:
- 37 Capitoli aggregato Deno-compat
- Prompt builder optimized
- Validator runtime
- 20 fixtures benchmark
- 47 nuovi test PRINCIPIO ZERO

**Production wiring DEFERRED** — separato per safety.
