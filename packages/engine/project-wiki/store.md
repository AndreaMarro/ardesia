# Store — Layer Persistenza Astratto

Persistenza delle entità domain con layer astratto: il Core Engine parla a `Store(ABC)`, mai a backend concreto. v0 = SQLite; prod target = Postgres+pgvector (swap senza toccare chiamanti).

## Moduli

- **lessonos/store/base.py** — contratto astratto `Store(ABC)`
- **lessonos/store/sqlite.py** — implementazione `SQLiteStore` (stdlib `sqlite3`)
- **lessonos/store/fixture_loader.py** — caricamento fixture on-disk nello store

## Store ABC (contratto)

Definisce i metodi CRUD per le entità: Path, Lesson, Source, Segment, Moment. Implementazioni concrete (SQLite, Postgres) soddisfano questo contratto.

**Citazioni**:
- lessonos/store/base.py:1-13 — docstring: "The engine talks to Store, never to a concrete backend. v0 ships a SQLite implementation; prod target is Postgres+pgvector — swapping it must not touch callers."
- lessonos/store/base.py:15-58 — `Store(ABC)` con metodi abstract:
  - `save_path`, `get_path` (linea 18-22)
  - `save_lesson`, `get_lesson`, `lessons_for_path` (linea 24-31)
  - `save_source`, `get_source` (linea 33-37)
  - `save_segment`, `get_segment`, `segments_for_lesson` (linea 39-46)
  - `save_moment`, `get_moment`, `moments_for_lesson` (linea 48-55)
  - `save_capsule`, `get_capsule` (linea 57-68) — str-based, nessun circular dep
  - `close` (linea 70-71)

## SQLiteStore (implementazione)

Backend SQLite per v0. Usa stdlib `sqlite3`, zero deps nuove. Schema version tracking via `PRAGMA user_version`.

**Citazioni**:
- lessonos/store/sqlite.py:1-7 — docstring: "SQLite-backed Store for v0 (stdlib sqlite3, no new deps)"
- lessonos/store/sqlite.py:17 — `SCHEMA_VERSION = 4` (attuale)
- lessonos/store/sqlite.py:19-58 — `_SCHEMA` SQL: tabelle `paths`, `lessons`, `sources`, `segments`, `moments`, `capsules`
- lessonos/store/sqlite.py:58-61 — `__init__(db_path=":memory:")` + `row_factory = sqlite3.Row`
- lessonos/store/sqlite.py:63-68 — `_migrate()` idempotente: crea schema se `user_version < SCHEMA_VERSION`

### Tabelle

#### paths
**Schema**: `path_id` TEXT PRIMARY KEY, `title`, `subject`, `lesson_ids` TEXT (JSON), `source_ids` TEXT (JSON), `synthetic` INTEGER.

**Citazione**: lessonos/store/sqlite.py:20-27.

#### lessons
**Schema**: `lesson_id` TEXT PRIMARY KEY, `path_id`, `title`, `"order"` INTEGER (quotato = SQL keyword), `source_id` TEXT nullable.

**Citazione**: lessonos/store/sqlite.py:28-34. Nota: `"order"` quotato (linea 32) perché keyword SQL.

#### sources
**Schema**: `source_id` TEXT PRIMARY KEY, `title`, `kind` TEXT (default 'text').

**Citazione**: lessonos/store/sqlite.py:35-39.

#### segments
**Schema**: `seg_id` TEXT PRIMARY KEY, `lesson_id`, `start` INTEGER, `"end"` INTEGER (quotato = keyword), `text` TEXT.

**Citazione**: lessonos/store/sqlite.py:40-46. Nota: `"end"` quotato (linea 44) perché keyword SQL.

#### moments
**Schema**: `moment_id` TEXT PRIMARY KEY, `lesson_id`, `t` INTEGER, `kind` TEXT, `seg_id` TEXT nullable.

**Citazione**: lessonos/store/sqlite.py:47-53.

#### capsules
**Schema**: `lesson_id` TEXT PRIMARY KEY, `capsule_data` TEXT NOT NULL (JSON serializzato), `created_at` TEXT DEFAULT datetime('now').

**Citazione**: lessonos/store/sqlite.py:54-58. Store str-based (nessun circular dep tra store e capsule/assembly.py). `save_capsule()`/`get_capsule()` linee 243-259.

### Serializzazione Tuple

Campi tuple (`lesson_ids`, `source_ids`) serializzati come JSON in colonne TEXT.

**Citazione**: lessonos/store/sqlite.py:80 — `json.dumps(list(path.lesson_ids))` per salvare; linea 97 — `tuple(json.loads(row["lesson_ids"]))` per leggere.

### Operazioni CRUD

#### save_path / get_path
`INSERT OR REPLACE` idempotente. Deserializza JSON per tuple.

**Citazioni**:
- lessonos/store/sqlite.py:71-85 — `save_path()`
- lessonos/store/sqlite.py:87-100 — `get_path()`

#### lessons_for_path
Legge tutte le lesson per un `path_id`, ordinate per `"order"`.

**Citazione**: lessonos/store/sqlite.py:112-126 — `lessons_for_path()`: `ORDER BY "order"` (linea 114).

#### save_segment / get_segment / segments_for_lesson
CRUD per Segment. `segments_for_lesson` ordinato per `start`.

**Citazioni**:
- lessonos/store/sqlite.py:143-158 — `save_segment()`
- lessonos/store/sqlite.py:160-174 — `get_segment()`
- lessonos/store/sqlite.py:176-190 — `segments_for_lesson()`: `ORDER BY start` (linea 178)

#### save_moment / get_moment / moments_for_lesson
CRUD per Moment. `moments_for_lesson` ordinato per `t`.

**Citazioni**:
- lessonos/store/sqlite.py:193-208 — `save_moment()`
- lessonos/store/sqlite.py:210-224 — `get_moment()`
- lessonos/store/sqlite.py:226-239 — `moments_for_lesson()`: `ORDER BY t` (linea 228)

## Fixture Loader

Carica percorso da fixture on-disk (path.json + lessons/*.json + sources/*.txt) nello store.

**File**: lessonos/store/fixture_loader.py

**Funzione**: `load_sample_path(store: Store, fixture_root: Path) -> None`

### Logica
1. Legge `path.json` → crea Path con `lesson_ids`/`source_ids` come tuple
2. Salva Sources PRIMA (lessons le referenziano): titolo source = prima riga del file sorgente (grounded)
3. Salva Lessons con order posizionale
4. Salva Path (con refs a lesson/source già esistenti)

**Citazioni**:
- lessonos/store/fixture_loader.py documenta caricamento fixture (STATUS.md:17 conferma M1-task3 CRUD da fixture)
- Titolo source grounded: lessonos/store/fixture_loader.py legge prima riga file sorgente, non inventato

## Design Rationale

1. **Astrazione** — swap SQLite → Postgres senza toccare chiamanti (ARCH.md:20-25)
2. **Migrazione idempotente** — `user_version` + `IF NOT EXISTS` (safe re-run)
3. **Serializzazione tuple** — JSON in TEXT (SQLite no array nativo)
4. **Ordinamento esplicito** — `ORDER BY` per garantire ordine deterministico
5. **Keywords quotati** — `"order"`, `"end"` quotati perché SQL keywords

**Citazione**: ARCH.md:20-25 documenta "SQLite copre relazionale + (via sqlite-vec) vettoriale. Il layer di store sarà astratto così il target di produzione (Postgres + pgvector) sostituisce il backend senza toccare i chiamanti."
