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

## ADR-002 — Pipeline Lesson Capsule (M2)

- **Status:** accepted
- **Data:** 2026-06-06
- **Contesto:** M2 milestone. Dopo M0 (scaffold) e M1 (entità + store relazionale),
  serve trasformare una lezione grezza (transcript + timeline + fonte) in una
  ``LessonCapsule`` strutturata e grounded (PLAN §16.1, §26.1).

### Decisioni

**Ingest come ancore di grounding.**
``ingest_lesson_segments`` e ``ingest_lesson_moments``
(``lessonos/store/fixture_loader.py:61-114``) caricano *verbatim* segmenti di
transcript e timeline events nello store. Sono l'unica fonte di verità per le
citazioni della capsula: ogni ``seg_id`` citato deve risolvere a un segmento
persistito. Nessuna parafrasi, nessun seg_id inventato.

**Segmentazione topic LLM-driven, ma grounded.**
``segment_lesson_topics`` (``lessonos/capsule/segmentation.py:49-101``) legge i
segmenti già persistiti, costruisce un prompt deterministico
(``build_segmentation_prompt``, riga 35-46), chiama il router e valida ogni
``seg_id`` restituito. Citazione penzolante → ``ValueError`` (righe 86-90).
``start``/``end`` di ogni ``TopicSpan`` sono derivati dai segmenti reali
(``min(s.start)``, ``max(s.end)`` — righe 97-98), mai dal modello.

**Estrazione content con vocab bounded.**
``extract_lesson_content`` (``lessonos/capsule/extraction.py:113-216``) espone
nel prompt il vocabolario ``CONCEPT_STATUS`` (riga 97) e l'elenco esatto dei
``seg_id`` disponibili (righe 108-109). Il LLM non può inventare status né citare
segmenti inesistenti. Ogni ``Citation.seg_id`` è validato
(``_parse_citations``, righe 139-159); campi obbligatori (``name``, ``status``,
``prompt``, ``question``, ``task``) sollevano ``ValueError`` se mancanti
(righe 163-166, 178-179, 190-191, 201-202). ``ConceptExtraction.__post_init__``
(righe 42-47) valida che ``status ∈ CONCEPT_STATUS``.

**Assemblaggio puro, senza nuove citazioni.**
``assemble_lesson_capsule`` (``lessonos/capsule/assembly.py:33-57``) compone
``TopicSpan`` (segmentation) + ``LessonContent`` (extraction) in
``LessonCapsule``. Non introduce nuove citazioni; il grounding è garantito dai
sub-step. Propaga ``ValueError`` se il grounding fallisce in uno dei due passi.

**Store ABC + SQLiteStore.**
Il contratto ``Store`` (``lessonos/store/base.py:15-58``) astrae persistenza;
``SQLiteStore`` (``lessonos/store/sqlite.py:57-239``) implementa il backend
relazionale v0 (stdlib ``sqlite3``). Migrazioni idempotenti via
``PRAGMA user_version`` (riga 63-68); tuple serializzate JSON
(righe 80-81); keyword SQL quotate (``"order"``, ``"end"``).

### Conseguenze

- La ``LessonCapsule`` è *grounded by construction*: ogni citazione risolve a un
  ``Segment`` persistito.
- Fail-fast: citazione penzolante o campo obbligatorio mancante → ``ValueError``
  immediato, mai silenzioso.
- Testabile con mock: prompt deterministici (stabili tra run) → fixture
  mock-keyable (``mock`` provider in ``lessonos/llm/router.py``).
- Zero dipendenze nuove: la pipeline usa solo stdlib (``json``, ``sqlite3``).

### Alternative scartate

- **Estrazione monolitica in un unico prompt LLM:** scartata perché output
troppo complesso da validare, non mock-keyabile in modo stabile, e difficile da
diagnosticare. La pipeline a fasi separate (segmentazione → estrazione →
assemblaggio) permette test isolati e fail-fast per fase.
- **Citazioni generate liberamente senza validazione:** scartata perché viola
  l'invariante anti-allucinazione PLAN §13.4 ("ogni claim → seg_id reale").
