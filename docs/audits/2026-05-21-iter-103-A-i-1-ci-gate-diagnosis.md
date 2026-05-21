# A-i.1 — Diagnosi live dei 3 gate CI (iter 103, Sprint A-i)

**Data:** 2026-05-21 · **Metodo:** `gh run view --log-failed` sui run reali + lettura dei 3 workflow + `git ls-tree origin/main`. NON diagnosi a memoria.
**Run analizzati:**
- PR #131 (code-PR `fix/iter-99-compila-onesta`): E2E `26194163070`, Quality `26194163069`, Governance `26194163068`.
- PR #128 (doc-PR `docs/iter-99-claude-md-archive`): Governance `26161332971`.

> Output di A-i.1. **Corregge** il master plan e `2026-05-21-iter-103-codex-review-and-revisions.md` (doc #1): doc #1 era errato su 2 gate su 3 — vedi §5.

## 1. Verdetto

| Gate | Stato | Verdetto | Causa |
|------|-------|----------|-------|
| E2E Tests | rosso | **gate SANO, spec rotta** | `e2e/22-vision-flow.spec.js`: 5 test vision falliscono |
| Quality Gate | rosso | **GATE ROTTO (workflow)** | cattura test-count via `vitest --reporter=json` corrotta |
| Governance Gate | rosso | **GATE ROTTO (workflow)** + Regola 5 corretta | baseline check = stessa cattura corrotta; Regola 5 respinge giustamente i code-PR |

## 2. E2E Tests — gate sano, spec rotta

`e2e.yml` (job `test`, `on: [push, pull_request]`): `npx vitest run` (unit) → `npx playwright test` smoke.
- Run #131: vitest unit PASS (il job prosegue a Playwright), Playwright **5 failed / 24 passed**.
- Tutti e 5 i fail in **`e2e/22-vision-flow.spec.js`** (righe 86/92/112/122/148), causa unica:
  `getByRole('button', { name: /Guarda il mio circuito/i })` → `element(s) not found`, timeout 15000ms.
- Il gate funziona; è la spec a fallire. Root cause del button-non-trovato → da indagare in A-i.2.
- File reale su `origin/main` (5e2573fa): **`e2e/22-vision-flow.spec.js`** — NON `tests/e2e/02-vision-flow.spec.js`.

## 3. Quality + Governance — un'unica causa: cattura `vitest --reporter=json` corrotta

`quality-gate.yml:45` e `governance-gate.yml:158` usano lo stesso pattern:
```
npx vitest run --reporter=json > <file> 2>&1 || true
```
Il `2>&1` mescola stderr (warning npm/node, deprecation) nello stesso file del report JSON; inoltre `--reporter=json` senza `--outputFile` scrive su stdout assieme al console output dei test. Risultato: `<file>` NON è JSON valido.

- **Quality Gate** (`quality-ratchet`): `jq -r '.numPassedTests // 0' 2>/dev/null || echo 0` → `PASSED=0`. Fallback `vitest run | tail -30 | grep` → 0. Step "Check test count ratchet": `0 < 14384` (baseline 14457) → exit 1. *(Lo step bundle, righe 81-90, NON viene mai raggiunto.)*
- **Governance Gate** (step "Baseline regression check", riga 159): `TESTS_NOW=$(jq '.numPassedTests' /tmp/vitest.json)` — senza guard → `jq: parse error: Invalid numeric literal` → step exit 5. Su #128 le Regole 0-5 PASS; il gate muore al baseline check.

## 4. Prova: vitest FUNZIONA in CI

`e2e.yml` esegue `npx vitest run` bare come step gating. Nel run E2E #131 il job è arrivato allo step Playwright → `vitest run` ha dato exit 0. **vitest gira correttamente in CI**: il problema NON è vitest né i test, è solo la cattura JSON in `quality-gate.yml` e `governance-gate.yml`.

## 5. Correzioni a doc #1 (`codex-review-and-revisions.md`)

- ❌ doc #1: «`22-vision-flow.spec.js` non esiste; spec reali `02`/`13-vision`». → **Falso.** `origin/main` ha SIA `e2e/` (22 spec, layout iter-99) SIA `tests/e2e/` (layout nuovo). La E2E gate gira `e2e/` → `e2e/22-vision-flow.spec.js`. Doc #1 ha letto il working tree `feature/volume-1` invece della base dei PR.
- ❌ doc #1: «Quality Gate — causa più probabile check 3 bundle». → **Falso.** Il job muore allo step test-count ratchet; il bundle check non viene mai raggiunto.
- ⚠️ doc #1: «Governance forse non rotta, rifiuta solo PR non conformi». → **Parziale.** Regola 5 è sana, ma il baseline check è rotto e fa fallire OGNI PR (anche il doc-PR #128).

## 6. Piano corretto — 2 fix-PR (non 3)

Mandato: "una fix-PR per causa". Cause reali = 2.

| Fix-PR | Branch (da `origin/main`) | Causa | File |
|--------|---------------------------|-------|------|
| PR-vitest-json | `fix/iter-103-ci-vitest-json` | §3 | `.github/workflows/quality-gate.yml:45`, `.github/workflows/governance-gate.yml:158` |
| PR-e2e | `fix/iter-103-ci-e2e` | §2 | `e2e/22-vision-flow.spec.js` (+ eventuali helper) |

Fix vitest-json: `vitest run --reporter=json --outputFile=<path>` + niente `> ... 2>&1`, poi `jq <path>`.

## 7. Caveat onesti (NO COMPIACENZA)

- Sistemata la cattura, **Quality Gate** prosegue a "zero failures" + "bundle size" (`du -sk dist/` ≤ `bundle_max_kb`; quality-audit ha misurato ~8.5 MB di solo JS). Il bundle **potrebbe** far fallire il gate. A-i.3 deve verificare l'INTERO workflow verde, non solo lo step di cattura. Il fix vero del bundle è Sprint E.
- Sistemata la cattura, **Governance** prosegue al baseline-threshold (`count ≥ 14457`) + "Build check" (`npm run build`). Da verificare entrambi.
- Il fix vitest-json va verificato con un run reale (`--outputFile` produce JSON pulito che `jq` parsa) prima del commit — Codex Pattern V.

## 8. Regola 5 / CHANGELOG → A-ii (fuori scope A-i)

I code-PR #129/#131/#132/#135 cambiano `src/`/`supabase/` senza `CHANGELOG.md` → Regola 5 li respinge correttamente. NON è un bug di gate: è conformità PR. Va risolto nel merge-train (A-ii) aggiungendo una voce `CHANGELOG.md` a ciascun code-PR.

## 9. Nota laterale (flag per A-ii)

`CI/CD Pipeline` job `test` (workflow `test.yml`, 4° workflow): FAIL su #128, SUCCESS su #131. Non è uno dei 3 gate di Sprint A-i. Da verificare se è un check required prima del merge-train.
