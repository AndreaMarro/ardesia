# PDR — Test Multiplier (+3604 test non-triviali)

**Target agent**: Claude Opus 4.7 via Managed Agent (Max #1, R3)
**Durata stimata**: 40-60h autonome (loop continuo)
**Branch**: `feature/test-multiplier-v1`
**Dipendenze**: PDR1/2/3 in corso (aggiungi test incrementali)
**Governance**: `docs/GOVERNANCE.md` — aumenta test senza regressione

---

## 🎯 Obiettivo

Portare da **12056 → 15660 test** con **+3604 test non-triviali** (non inflazione). Target specifico per categoria sotto.

**Feedback Andrea**: "AUMENTARE A DISMISURA IL NUMERO DI TEST NON TRIVIALI"

---

## ⚖️ Regola 0 — riuso setup test esistenti

**Esistenti da riusare**:
- `vitest.config.js` (pool=forks, testTimeout 15000, 195 file)
- `playwright.config.js` (se esiste) — verifica, altrimenti setup
- `.githooks/pre-commit` (regression check attivo)
- `scripts/quick-regression-check.sh`
- `automa/baseline-tests.txt` (12056)
- `.test-count-baseline.json` (12056)

**Nuovo (tipologie non ancora presenti)**:
- `playwright.config.ts` (se mancante)
- `tests/e2e/` cartella popolata (attualmente vuota)
- `tests/chaos/`, `tests/property/`, `tests/visual/`, `tests/a11y/`, `tests/perf/`, `tests/security/`

---

## 📊 Breakdown +3604 test (target)

| Categoria | Delta | File/Pattern | Note |
|-----------|-------|--------------|------|
| **Playwright E2E real user flows** | +150 | `tests/e2e/*.spec.ts` | Attualmente 0 spec |
| **Chaos engineering** (layer kill, network, timeout) | +30 | `tests/chaos/*.test.js` | Nuovo |
| **Property-based** (fast-check invariants) | +200 | `tests/property/*.prop.test.js` | Simulator + RAG invariants |
| **Visual regression** (screenshot diff critical UI) | +80 | `tests/visual/*.vis.test.js` | Playwright screenshot |
| **Accessibility (axe-core)** | +60 | `tests/a11y/*.a11y.test.js` | WCAG AA per pagina |
| **Performance (Lighthouse CI)** | +20 | `tests/perf/*.perf.test.js` | Web Vitals budget |
| **Multilingue** (7 lingue × scenario) | +350 | `tests/i18n/*.test.js` | IT+6 lingue × 50 scenario |
| **Contract tests** (Edge Function schema) | +40 | `tests/contract/*.contract.test.ts` | Input/output boundaries |
| **Security** (SQL injection, XSS, CSRF, prompt injection) | +50 | `tests/security/*.sec.test.js` | Penetration automatica |
| **Integration UNLIM+OpenClaw+Supabase** | +100 | `tests/integration/*.int.test.js` | End-to-end real |
| **Unit incrementali** (coverage gap filled) | +1444 | `src/**/*.test.js` esistenti | Gap nelle aree poco coperte |
| **Vision accuracy** (20 circuiti × 3 query) | +60 | `tests/vision/*.vis.test.js` | Qwen VL validation |
| **TTS quality regression** (audio hash) | +30 | `tests/tts/*.tts.test.js` | Evita degradazione audio |
| **STT WER italiano bambini** | +30 | `tests/stt/*.stt.test.js` | 10 audio × 3 run |
| **Wake word accuracy** (100 sample) | +10 | `tests/wake/*.wake.test.js` | Threshold calibration |
| **RAG retrieval precision** | +50 | `tests/rag/*.rag.test.js` | BGE-M3 validation |
| **Memory multi-livello** | +40 | `tests/memory/*.mem.test.js` | Cross-session recall |
| **Simulator fuzzer** (92 exp × 10 variants) | +920 | `tests/simulator/fuzz/*.fuzz.test.js` | Edge cases MNA/KCL |
| **TOTALE** | **+3604** | | **12056 → 15660** |

---

## 📋 Task (14 sub-task corrispondenti a categorie)

### Task TM.1 — Playwright E2E (priority)

**Setup se mancante**:
- `npm i -D @playwright/test`
- `playwright.config.ts` con EU browser + headless
- `tests/e2e/` folder

**150 scenari (10 per flusso principale)**:

1. **Autenticazione & onboarding** (10 spec)
2. **Simulatore caricamento 92 esperimenti** (10 — sample)
3. **UNLIM chat basic** (10)
4. **UNLIM Principio Zero citation libro** (10)
5. **UNLIM voice TTS playback** (10)
6. **UNLIM wake word activation** (10)
7. **UNLIM vision circuit diagnosis** (10)
8. **UNLIM fumetto generation** (10)
9. **Lesson Reader navigation** (10)
10. **Dashboard docente flows** (10)
11. **GDPR consent flow + right-to-delete** (10)
12. **Multilingue switch (7 lingue)** (10)
13. **Error recovery & fallback** (10)
14. **Accessibility kbd navigation** (10)
15. **Performance budget** (10)

**Audit ogni scenario**: APPROVE by Auditor agent.

### Task TM.2-TM.15 — altri categorie

Ogni categoria segue pattern simile:
- Setup framework (fast-check, axe-core, lighthouse-ci, etc.)
- Scenario list con priorities
- Implementation con TDD failing first
- CoV 3× per test critici
- Audit independent

**Pattern generale per ogni test**:
```javascript
describe('CATEGORIA - scenario X', () => {
  it('invariant/property/flow atteso', async () => {
    // Arrange
    // Act
    // Assert: deve passare 3 volte consecutive (CoV in-test)
  });
});
```

### Task TM-REGRESSION — Regression Hunter integration

**Obiettivo**: ogni 10 min R5 agent esegue `npx vitest run` + benchmark. Se count < 15660 (target post PDR Test Multiplier) → Telegram alert.

Pre-integration: `automa/baseline-tests.txt` aggiornato progressivamente.

---

## 🔬 Gate finale PDR Test Multiplier

- [ ] 12056 → 15660 test totali (verified `npx vitest run`)
- [ ] +3604 test tutti categorie non-triviali coperte
- [ ] Zero regressione esistenti 12056
- [ ] Playwright E2E 150 scenari verdi 3× consecutive
- [ ] Coverage report moduli critici >90% (`src/components/simulator/engine/`, `supabase/functions/`)
- [ ] Bundle size <90000 KB (test non aumentano prod bundle)
- [ ] Auditor APPROVE
- [ ] `automa/baseline-tests.txt` updated to 15660
- [ ] `.test-count-baseline.json` updated to 15660

## 🚨 Rischi

| Rischio | Prob | Mitigation |
|---------|------|------------|
| Test flaky su CI (Mac load) | Alta | pool=forks già risolto, monitoring ulteriore |
| Playwright slow in CI | Media | Parallel sharding + headless chromium only |
| Test inflation (triviali) | Alta | Audit Auditor agent con criterio "test ha valore?" |
| Baseline regression durante pdr1/pdr2 dev | Media | R5 Regression Hunter auto-revert |

---

**Principio ferreo**: NO trivial tests. Ogni test **deve avere valore** (copre edge case, invariant, regression, UX critica). Auditor respinge test trivialissimi.
