# Anti-Regression System — ELAB Tutor

> **Principio:** Zero regressioni. Ogni commit sopravvive al ratchet. Metriche oggettive, MAI self-evaluation.

## Layer del sistema (5 livelli, defense in depth)

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1 — pre-commit (locale, veloce ~60s)                 │
│  .githooks/pre-commit → scripts/quick-regression-check.sh   │
│  Blocca commit se: test fallisce OPPURE drop > 50 test      │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2 — pre-push (locale, completo ~3min)                │
│  .githooks/pre-push → scripts/anti-regression-gate.sh       │
│  Blocca push main se: test fail OR build fail OR site down  │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3 — CI GitHub Actions (remoto, obbligatorio su PR)   │
│  .github/workflows/quality-gate.yml                         │
│  Ratchet: test count baseline + bundle size max             │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4 — Claude Code Stop hook (sessione)                 │
│  .claude/settings.local.json                                │
│  Blocca chiusura sessione se build fallisce                 │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 5 — Honesty Audit (esame coscienza)                  │
│  scripts/honesty-audit.sh                                   │
│  Metriche oggettive: no self-eval, solo numeri reali        │
└─────────────────────────────────────────────────────────────┘
```

## Comandi rapidi

```bash
# Quick check (test only, ~60s)
npm run gate:quick

# Full gate (test + build + site, ~3min)
npm run gate

# Honesty audit (metriche oggettive)
npm run audit:honesty

# Abilitare git hooks locali (una tantum)
git config core.hooksPath .githooks
```

## File di controllo

| File | Scopo | Chi modifica |
|---|---|---|
| `.test-count-baseline.json` | Baseline CI (source of truth) | Script ratchet automatico |
| `automa/state/baseline.json` | Baseline sessione | Script ratchet |
| `automa/state/gate-result.json` | Risultato ultimo gate | Script gate |
| `automa/state/honesty-audit.json` | Metriche oggettive | Script honesty-audit |

## Soglie (in `.test-count-baseline.json`)

| Metrica | Valore | Significato |
|---|---|---|
| `total` | 11983 | Test baseline corrente (17/04/2026) |
| `test_files` | 190 | File di test |
| `regression_threshold` | 0.005 | Max 0.5% di calo tollerato |
| `regression_threshold_absolute` | 50 | Max 50 test assoluti persi |
| `bundle_max_kb` | 90000 | Max dist/ totale (82MB include PDF, hex, fonts) |
| `precache_max_kb` | 5000 | Max PWA precache |
| `coverage_min` | 60 | Min coverage percentage |

**Regole:**
- Se drop > 50 test assoluti: BLOCK commit
- Se drop > 0.5%: BLOCK commit
- Se >0 test falliti: BLOCK commit
- Se build fallisce: BLOCK push main
- Baseline **ratchet up** automatico se test crescono (mai down)

## Esame di coscienza (Honesty Audit)

Eseguire **ogni 3 task completati** OR **manualmente**.

Misura metriche OGGETTIVE:
- Test: pass/fail/files/triviality ratio (pattern `has at least`, `is defined`, `returns array`)
- Build: status + dist size
- Endpoints: site 200, compiler 200, Edge TTS 200 (curl reale)
- Codebase: TODO/FIXME count, console.log residui, top 5 file più lunghi
- Parallelismo volumi: bookText entries (target 92), bookDivergence (target 0)
- Commercial readiness score (da `commercial-readiness.json`)

**CHE COSA NON È:** non è score soggettivo "sto facendo un buon lavoro". Solo numeri grezzi. L'interpretazione è responsabilità del developer.

**Segnali rossi nel report:**
- `trivial_ratio > 0.3` — test inflazionati
- `todos_and_fixmes > 50` — debito tecnico alto
- `console_log_residuals > 30` — codice non production-ready
- `bookDivergence_entries_must_be_zero != 0` — fallito fix del 17/04

## Bypass (solo in casi documentati)

```bash
# pre-commit (NON farlo se non strettamente necessario)
ELAB_SKIP_PRECOMMIT=1 git commit -m "..."

# pre-push (solo se CI è offline e serve deploy urgente)
ELAB_SKIP_PREPUSH=1 git push
```

**Se usi un bypass, documentalo nel commit message.** Se sei tentato di bypassare "solo questa volta", leggi prima `superpowers:verification-before-completion`.

## CoV periodico (Chain of Verification)

Dopo ogni 3 task completati:

```bash
# 1. Test + build + site (evidence fresh)
npm run gate

# 2. Endpoint esterni verificati
curl -s -o /dev/null -w "%{http_code}" https://www.elabtutor.school
curl -s -o /dev/null -w "%{http_code}" -X POST https://n8n.srv1022317.hstgr.cloud/compile \
  -H "Content-Type: application/json" -d '{"code":"void setup(){} void loop(){}"}'

# 3. Honesty audit (metriche oggettive)
npm run audit:honesty

# 4. Review numbers in:
#    - automa/state/gate-result.json
#    - automa/state/honesty-audit.json

# 5. ONLY THEN fai claim di completamento
```

## Anti-pattern da evitare (dichiarati)

- ❌ "I test passano" senza aver appena eseguito `npx vitest run`
- ❌ "Ho fixato il bug" senza regression test che lo verifica
- ❌ Score self-assigned ("9/10") — usa `honesty-audit.sh` per metriche
- ❌ "Baseline update" manuale senza che test siano cresciuti
- ❌ Bypass `--no-verify` senza ragione scritta

## Storia baseline

| Data | Test | File | Commit | Note |
|---|---|---|---|---|
| 2026-04-09 | 1578 | 35 | ??? | Baseline precedente (obsoleto) |
| 2026-04-17 | 11983 | 190 | c6b04a0 | Baseline post-PDR v3 DEFINITIVO |

---

*Documentazione anti-regression system. Aggiornare ad ogni modifica dei soglie o layer.*
