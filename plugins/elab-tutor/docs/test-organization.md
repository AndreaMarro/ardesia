# Test Organization — ELAB Tutor

**Filosofia**: molti test ordinati per layer. Ogni test ha uno scopo chiaro, una dipendenza minima, un tempo di esecuzione target.

**Principio Karpathy Think**: prima di scrivere un test, chiederti *che cosa sta provando a falsificare*. Se non sai, non scriverlo.

---

## 1. Layer structure

```
tests/
├── unit/                            # Vitest, <50ms per test, isolati
│   ├── services/
│   │   ├── api.test.js
│   │   ├── unlimMemory.test.js
│   │   ├── unlimContext.test.js
│   │   ├── simulator-api.test.js
│   │   └── openclaw/                # Sprint 6+
│   │       ├── dispatcher.test.js
│   │       └── composite.test.js
│   ├── components/
│   │   ├── lavagna/
│   │   ├── tutor/
│   │   ├── simulator/
│   │   └── common/
│   ├── engine/
│   │   ├── CircuitSolver.test.js
│   │   ├── AVRBridge.test.js
│   │   └── PlacementEngine.test.js
│   └── data/
│       ├── rag-chunks.test.js
│       └── volume-references.test.js
│
├── integration/                     # Vitest, <500ms, cross-module
│   ├── supabase/
│   │   ├── unlim-chat.test.js
│   │   ├── unlim-diagnose.test.js
│   │   └── unlim-wiki-query.test.js
│   ├── wiki/
│   │   ├── retriever-pipeline.test.js
│   │   └── corpus-loader-e2e.test.js
│   └── openclaw/                    # Sprint 6+
│       ├── registry-live.test.js
│       └── morphic-L1-end-to-end.test.js
│
└── e2e/                             # Playwright, <10s/spec, browser
    ├── 01-boot-screen.spec.js
    ├── 02-experiment-mount.spec.js
    ├── 03-unlim-chat-flow.spec.js
    ├── ...
    └── NN-*.spec.js                 # Numbered per order

scripts/openclaw/*.test.ts           # OpenClaw unit, vitest node env
scripts/bench/                       # Performance benchmarks (NOT tests)
```

**Rule**: file path matches feature path. `src/services/api.js` → `tests/unit/services/api.test.js`. One-to-one mapping.

---

## 2. Test naming convention

### Unit (Vitest)
- File: `<module>.test.js` (JS sources) OR `<module>.test.ts` (TS sources)
- Describe: `<ClassOrFunction>`
- It: `<verb phrase expressing behavior>`, es. `"returns null on empty input"`

```js
describe('validatePZv3', () => {
  it('accepts plural-inclusive text with volume citation', () => { /* ... */ });
  it('rejects missing plural marker', () => { /* ... */ });
});
```

### Integration (Vitest)
- File: `<feature>-pipeline.test.js` OR `<feature>-e2e.test.js` (NOT Playwright E2E)
- Describe: `<feature integration>`
- It: `<scenario end-to-end description>`

### E2E (Playwright)
- File: `NN-<feature-slug>.spec.js` — NN = 2-digit order, monotonic
- Test: `<user story>`

```js
// tests/e2e/17-openclaw-registry-live.spec.js
test('window.__ELAB_API surface resolves all live tools', async ({ page }) => { /* ... */ });
```

---

## 3. Coverage targets per layer

| Layer                  | Current | Sprint 6 Day 42 | Sprint 8  | Sprint 12 |
|------------------------|---------|-----------------|-----------|-----------|
| `src/services/**`      | ?       | 50%             | 70%       | 85%       |
| `src/components/**`    | ?       | 30%             | 50%       | 70%       |
| `src/components/simulator/engine/**` | ? | 40% | 60% | 80% |
| `scripts/openclaw/**`  | -       | 80%             | 85%       | 90%       |
| `supabase/functions/**`| ?       | 50%             | 70%       | 85%       |

Misurazione: `npx vitest run --coverage`. Output in `coverage/`.

**Rule**: non decrementare mai la coverage in PR. Eccezione: refactor che rimuove codice morto (dichiarato in commit).

---

## 4. TDD discipline (superpowers:test-driven-development)

**Red → Green → Refactor**:

1. **Red**: scrivi test che fallisce per il motivo giusto
2. **Green**: scrivi il MINIMO codice per farlo passare
3. **Refactor**: migliora senza rompere i test

**Quando applicare**: sempre per nuovo codice non-boilerplate. Skip OK per:
- File config (vite, tsconfig)
- Migration SQL
- Static data file (JSON, YAML)
- Pure plumbing (import re-export)

**Quando NON saltare TDD**:
- Business logic (anche se "banale")
- Error handling
- Data transformation
- Anything PZ v3 / GDPR sensitive

---

## 5. Commands cheat-sheet

### Per category

```bash
# Tutti
npx vitest run

# Un layer
npx vitest run tests/unit/services/
npx vitest run tests/integration/
npx vitest run tests/unit/components/lavagna/

# OpenClaw (config separato, env=node)
npx vitest run -c vitest.openclaw.config.ts

# Singolo test
npx vitest run tests/unit/services/api.test.js

# Watch mode (dev)
npx vitest --watch tests/unit/services/

# Coverage
npx vitest run --coverage
npx vitest run --coverage tests/unit/services/

# E2E
npx playwright test
npx playwright test tests/e2e/17-openclaw-registry-live.spec.js
npx playwright test --project=chromium
npx playwright test --ui                               # Interactive UI
```

### Per velocità

```bash
npx vitest run --reporter=dot                          # Minimal output
npx vitest run --no-coverage                           # Skip coverage
npx vitest run --threads=false                         # Disable threading (debug)
```

### Per debug

```bash
npx vitest run <test-file> --reporter=verbose
npx vitest run <test-file> --bail=1                    # Stop on first fail
node --inspect-brk ./node_modules/.bin/vitest run <test-file>  # Node debugger
```

---

## 6. Pre-commit test gate

Pre-commit hook in `.husky/pre-commit` (o scripts/git-hooks/) deve:

1. Leggere baseline da `automa/baseline-tests.txt`
2. Eseguire `npx vitest run --reporter=dot`
3. Contare test PASS
4. Confrontare vs baseline:
   - Delta ≥ 0 → OK
   - Delta < 0 → ABORT unless commit message contiene `[TEST DELETION OK]`
5. Aggiornare baseline se superata

```bash
# Esempio pre-commit (semplificato)
baseline=$(cat automa/baseline-tests.txt)
current=$(npx vitest run --reporter=dot 2>&1 | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" | head -1)
if [ "$current" -lt "$baseline" ]; then
  echo "FAIL: $current < baseline $baseline"
  exit 1
fi
echo "$current" > automa/baseline-tests.txt
```

---

## 7. Test quality gates per PR

| Gate                                    | Rule                                                            |
|-----------------------------------------|-----------------------------------------------------------------|
| Baseline non-regression                 | Test count dopo PR ≥ prima                                      |
| New files coverage                      | Nuovi file src/ devono avere test corrispondente                |
| Critical files coverage                 | File in "File critici" CLAUDE.md → 70%+                         |
| PZ v3 validator coverage                | IT production: 100%. EN/ES/FR/DE: 30%+                          |
| Together AI gate coverage               | 100% branches (GDPR)                                            |
| Tool memory RPC coverage                | 100% per ogni RPC                                               |
| Flakiness                               | Fail CI 2/3 su stesso test → investigate before merge           |

---

## 8. Ownership + review

- **generator-test agent** → scrive test (solo tests/ directory)
- **generator-app agent** → scrive src/ (MAI test, commissiona generator-test)
- **evaluator agent** → conferma test fallisce prima del fix, passa dopo
- **security-auditor** → review coverage su file sensitive (auth, GDPR)

---

## 9. Anti-pattern da evitare

| Anti-pattern                                   | Perché male                                          | Cosa fare invece                                 |
|------------------------------------------------|------------------------------------------------------|--------------------------------------------------|
| Test che testa l'implementazione non il contratto | Rompe ai refactor, blocca miglioramenti            | Test il comportamento pubblico                   |
| `expect(foo).toBeDefined()`                    | Non dice quale valore è corretto                    | `expect(foo).toBe(<valore atteso>)`              |
| Un test che copre N cose                       | Difficile capire cosa fallisce                      | Un test = una asserzione concettuale             |
| Mock che duplica la logica                     | Test di mock, non di codice                         | Usa fixture reali quando possibile               |
| Skip test con `.skip`                          | Debito tecnico nascosto                             | Fix subito o delete                              |
| Test async senza await                         | Race condition, falsi positivi                      | Sempre `await` promise + `async` describe/it     |
| Test che dipende da ordine                     | Fragile, non idempotente                            | `beforeEach` per reset, no shared state          |
| Flakiness ignorata                             | CI rosso diventa normale, perdiamo segnale           | Investiga subito, quarantine o fix               |

---

## 10. Roadmap

### Sprint 6 (corrente)
- Day 36 ✓ OpenClaw unit test (82 test su 6 file, 100% PASS)
- Day 37 → src/services/simulator-api.js handler + test corrispondenti
- Day 38 → registry expansion + test invariant aggiornati
- Day 39 → dispatcher + PZ v3 pairing + E2E iniziale
- Day 40 → primo Playwright E2E spec (`17-openclaw-registry-live.spec.js`)
- Day 41 → tool memory integration test (real Supabase staging)
- Day 42 → sett-gate, coverage check, retro

### Sprint 7
- Backfill test per services esistenti (api.js, unlimMemory, unlimContext)
- Coverage dashboard visibile `npm run coverage:report`
- Flakiness report settimanale in `docs/sunti/`

### Sprint 8
- Component test con @testing-library/react
- Visual regression test (Storybook + Chromatic OR Playwright screenshot)
- Performance test (Lighthouse CI budget)

---

## 11. Onestà

- Oggi: baseline ~12.235-12.371 (drift branch↔main). Prevalentemente `tests/unit/`, ~0 E2E.
- Target Sprint 8: baseline 14.000+ (in CLAUDE.md).
- Target Sprint 12: 16.000+ con copertura e2e reale.
- Non contare test generati da snapshot auto (bloat).
- Un test vale 1 se falsifica un bug reale. 0 se è tautologia.

**Il test migliore è quello che romperebbe domani se cambiassi il contratto.**
