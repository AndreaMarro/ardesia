# Architecture — Decisioni Fondamentali

Documentazione delle scelte architetturali core per LessonOS Core Engine v0.

## Principi (PLAN.md §6)

- **Canvas-first / AI-second** — l'AI assiste, non sostituisce il docente
- **Grounded by default** — citazioni obbligatorie, niente output inventato
- **Open-infra + API-models** — NO modelli locali, solo API providers
- **Cost-observability** — ogni chiamata LLM tracciata (mock=gratis)
- **Privacy-conservative** — solo fixture sintetiche in v0

## Stack Tecnologico (ARCH.md ADR-001)

### Python 3.12+ con `uv`
Ecosistema maturo per dati/LLM, tipi nativi (`X | None`, dataclass). `uv` per env/lock riproducibili.

**Citazione**: ARCH.md:15-18 specifica `Python 3.12+` e `uv` come scelte fondamentali.

### SQLite + sqlite-vec (layer astratto)
v0 gira locale zero-cost; SQLite copre relazionale + (via sqlite-vec) vettoriale. Layer astratto permette swap a Postgres+pgvector senza toccare chiamanti.

**Citazioni**:
- ARCH.md:20-25 — scelta SQLite+sqlite-vec con layer DB astratto
- lessonos/store/base.py:1-16 — `Store(ABC)` definisce il contratto astratto
- lessonos/store/sqlite.py:1-7 — `SQLiteStore` implementazione concreta

### Router Multi-LLM (mock + kimi)
Mai un solo modello. Router dispatcha a provider nominati:
- **mock** → deterministico da fixture, TUTTI i test (veloce, gratis, riproducibile)
- **kimi** → Moonshot (OpenAI-compatible), solo eval gated

**Citazioni**:
- ARCH.md:27-35 — router astratto con provider mock/kimi
- lessonos/llm/router.py:22-26 — `LLMProvider` Protocol
- lessonos/llm/router.py:28-48 — `MockProvider` deterministico
- lessonos/llm/router.py:51-63 — `Router` classe di dispatch
- lessonos/llm/kimi.py:29-71 — `KimiProvider` Moonshot

### Output JSON Strutturati (PLAN §26)
Le pipeline producono ESATTAMENTE gli schemi JSON di PLAN §26:
- **Lesson Capsule** (§26.1) — timeline, concepts, exercises, questions, homework
- **Path Memory** (§26.2) — concept_graph, lesson_index, learning_debt

**Citazione**: PLAN.md:30-32 elenca schemi output Lesson Capsule e Path Memory.

## Conseguenze Architetturali

1. **Zero dipendenze cloud** — v0 100% locale
2. **Cost-aware** — mock=gratis per test, real calls loggate
3. **No PII** — solo fixture sintetiche (AGENTS.md §5)
4. **Groundedness by construction** — citazioni validate (vedi grounding.md)

## Alternative Scartate (ARCH.md ADR-001)

- **Postgres+pgvector subito** — richiede servizio, contro vincolo locale v0
- **SDK LLM pesante** — evitato, `kimi` usa stdlib `urllib`
- **Modelli locali** — esclusi per principio (PLAN §6)

**Citazione**: ARCH.md:50-57 documenta alternative scartate.
