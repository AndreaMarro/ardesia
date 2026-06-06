# LessonOS Core Engine — Architecture Decision Records

> ADR brevi prodotti mentre si decide l'architettura (AGENTS.md §7).
> Append-only: una nuova decisione = un nuovo ADR, non si riscrive il passato.

## ADR-001 — Scelte di base del Core Engine

- **Status:** accepted
- **Data:** 2026-06-06
- **Contesto:** motore didattico headless v0 (PLAN §SCOPE), locale e zero-cloud,
  testabile da CLI. Niente GUI, niente infra, niente dati reali.

### Decisioni

**Linguaggio — Python 3.12+ con `uv`.**
Ecosistema maturo per dati/LLM, tipi nativi (`X | None`, dataclass). `uv` per
env e lock riproducibili (`uv run pytest`, `uv add` solo se serve davvero).
Conseguenza: `requires-python = ">=3.12"` in `pyproject.toml`.

**Persistenza — SQLite + sqlite-vec (layer DB astratto).**
v0 gira in locale a costo zero; SQLite copre relazionale + (via sqlite-vec)
vettoriale senza servizi esterni. Il layer di store sarà astratto così il
target di produzione (Postgres + pgvector, PLAN §12/§13) sostituisce il backend
senza toccare i chiamanti. SQLite/sqlite-vec arriva in M1 (store): a M0 nessuna
dipendenza DB è ancora dichiarata.

**LLM — router astratto con provider `mock` e `kimi`.**
Mai un solo modello (PLAN §12). Il `Router` dispatcha a provider nominati dietro
il `LLMProvider` Protocol:
- `mock` → deterministico da fixture: TUTTI gli unit test lo usano (veloce,
  gratis, riproducibile); su prompt/provider ignoto solleva errore = nessuna
  fabbricazione (groundedness mai falsa).
- `kimi` → Moonshot (OpenAI-compatible), `KIMI_API_KEY` SOLO da env, mai
  hardcoded; usato solo per eval/integration gated, non testato live in unit.
Conseguenza: `lessonos/llm/router.py` + `lessonos/llm/kimi.py`.

**Output — JSON strutturati + citazioni obbligatorie.**
Le pipeline producono ESATTAMENTE gli schemi JSON di PLAN §26 (Lesson Capsule,
Path Memory). Ogni claim specifico porta una citazione fondata (PLAN §13.4):
type, lesson_id/source_id, timestamp|page, excerpt. Mai citazioni inventate —
groundedness by construction (già applicato alle fixture: ogni `seg_id` punta a
un segmento esistente).

### Conseguenze

- Zero dipendenze cloud e zero modelli locali in v0 (PLAN §6): solo API-models.
- Cost-aware: mock = gratis per i test; chiamate reali loggate (cost ledger, M5).
- No PII / solo fixture sintetiche (AGENTS.md §5).

### Alternative scartate

- **Postgres+pgvector subito:** richiede un servizio in esecuzione, contro il
  vincolo locale/zero-cloud di v0. Rimandato al target di produzione.
- **Client SDK LLM pesante (es. litellm/openai sdk) come dipendenza:** evitato in
  v0 — `kimi` usa la stdlib (`urllib`) per restare a dipendenze minime.
- **Modelli locali (llama.cpp/ollama):** esclusi per principio (PLAN §6: open-infra
  + API-models).
