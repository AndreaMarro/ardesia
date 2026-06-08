# Cost Ledger — Per-LLM-Call Cost Tracker (PLAN §20, M5-task3)

Traccia costi per chiamata LLM in un percorso. Mock calls sono gratis
(usage=None → cost=0, tokens=0). Chiamate API reali (Kimi o DeepSeek)
stimano il costo dalla documentazione dei prezzi via provider-specific
estimators (`estimate_kimi_cost` o `estimate_deepseek_api_cost`).

## Modulo

**File**: `lessonos/llm/cost_ledger.py` — classe `CostLedger`
**Modello**: `lessonos/models/ledger.py` — `CostLedgerEntry`, `CostReport`

## Entità

### CostLedgerEntry

Record immutabile di una singola chiamata LLM (PLAN §20).

**File**: `lessonos/models/ledger.py:19-54` — frozen dataclass: `entry_id`,
`lesson_id` (None per path-level), `model`, `provider`, `prompt_tokens`,
`completion_tokens`, `cost_usd`, `label`.

**Validazione** (`__post_init__`, linee 42-53):
- `entry_id` non vuoto
- `prompt_tokens`, `completion_tokens` >= 0
- `cost_usd` >= 0.0

### CostReport

Istantanea immutabile del ledger.

**File**: `lessonos/models/ledger.py:57-79` — `total_cost_usd`,
`total_calls`, `total_prompt_tokens`, `total_completion_tokens`,
`per_lesson` (dict), `per_model` (dict), `per_label` (dict),
`entries` (tuple).

## Classe CostLedger

Accumulatore append-only.

**File**: `lessonos/llm/cost_ledger.py:38-148`

- `add_entry(entry)` — aggiunge una entry pre-costruita (linea 43)
- `add_from_response(response, lesson_id, label)` — crea e aggiunge una
  entry da `LLMResponse`: se `response.usage` è presente, stima costo via
  provider-specific estimator (`estimate_deepseek_api_cost` per provider
  `"deepseek"`, `estimate_kimi_cost` per `"kimi"` o altri); se usage=None
  (mock), cost=0 (linee 46-72)
- `report()` → `CostReport` — somma i costi per lezione/modello/label,
  con chiave vuota `""` per path-level (linee 74-118)
- `total_cost()` → float — shortcut (linee 120-121)
- `to_json()` / `from_json()` — serializzazione JSON (linee 123-148)

## Store Persistence

**ABC** (`lessonos/store/base.py:93-103`):
- `save_ledger_entry(entry)`
- `get_ledger_entries()` → tutte, ordinate per `entry_id`
- `get_ledger_for_lesson(lesson_id)` → filtrate per lezione

**SQLite** (`lessonos/store/sqlite.py:277-319`):
- Tabella `cost_ledger` (SCHEMA_VERSION 4→5, linee 60-70)
- `save_ledger_entry()` con `INSERT OR REPLACE`
- `get_ledger_entries()` / `get_ledger_for_lesson()` con `ORDER BY entry_id`
- `_row_to_ledger_entry()` helper (linee 307-319)

## Test

**File**: `tests/test_cost_ledger.py` — 24 test non-tautologici.

Copertura:
- add_entry / add_from_response: mock=free (cost=0), Kimi=stima realistica,
  DeepSeek=stima realistica con routing per provider (chat e reasoner)
- Report: total_cost, per_lesson, per_model, per_label, empty
- Validazione: tokens negativi, cost negativo, entry_id vuoto → ValueError
- JSON round-trip: campi preservati, report match
- Store: round-trip, persistenza su disco, per-lesson filtering, ordinamento
- Immutabilità: entry frozen, report frozen, report.entries is tuple

## Costo

Mock calls: gratis (tokens=0, cost=0 per entry via `add_from_response`).
Kimi calls: costo stimato da `usage` dict via tariffe K2.5/K2.6.
DeepSeek calls: costo stimato da `usage` dict via tariffe deepseek-chat/deepseek-reasoner
(`lessonos/llm/deepseek.py:90-93`). Il routing è per-provider in
`add_from_response()` (`lessonos/llm/cost_ledger.py:56-63`).
