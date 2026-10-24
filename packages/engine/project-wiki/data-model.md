# Data Model — Entità Domain e Vincoli

Modello dati del Core Engine: 9 entità domain (PLAN §7 + §14) come frozen dataclass. Vocaboli vincolati validati a costruzione.

## Modulo

**File**: lessonos/models/entities.py

Definisce le entità pure del dominio (no I/O, no DB). Persistenza vive in `lessonos/store/`.

**Citazione**: lessonos/models/entities.py:1-8 — docstring modulo: "Plain frozen dataclasses — the headless core of the lesson graph."

## Entità (9 totali)

### Path
Percorso didattico: lezioni ordinate su un subject.

**Citazione**: lessonos/models/entities.py:37-46 — `Path` dataclass con `path_id`, `title`, `subject`, `lesson_ids` tuple, `source_ids` tuple, `synthetic` bool.

### Lesson
Singola lezione in un percorso.

**Citazione**: lessonos/models/entities.py:49-55 — `Lesson` dataclass con `lesson_id`, `path_id`, `title`, `order`, `source_id` nullable.

### Source
Fonte didattica (es. PDF, testo).

**Citazione**: lessonos/models/entities.py:58-62 — `Source` dataclass con `source_id`, `title`, `kind` (default "text").

### Segment
Segmento di transcript. **Àncora di grounding** (vedi grounding.md).

**Citazione**: lessonos/models/entities.py:65-78 — `Segment` dataclass: "The grounding anchor: every citation in a Lesson Capsule must point at an existing seg_id (PLAN §13.4)". Campi: `seg_id`, `lesson_id`, `start`/`end` (secondi), `text`.

### Moment
Punto nella timeline di una lezione (marker, evento).

**Citazione**: lessonos/models/entities.py:81-89 — `Moment` dataclass con `moment_id`, `lesson_id`, `t` (secondi), `kind`, `seg_id` nullable.

### Concept
Concetto tracciato nel percorso con status (introduced/reinforced/reviewed/problematic).

**Citazione**: lessonos/models/entities.py:92-107 — `Concept` dataclass con `concept_id`, `name`, `status` (validato ∈ CONCEPT_STATUS), `lesson_id` nullable, `prerequisites` tuple. **`__post_init__`** valida `status` (linea 102-107).

### Exercise
Esercizio estratto da una lezione.

**Citazione**: lessonos/models/entities.py:110-115 — `Exercise` dataclass con `exercise_id`, `lesson_id`, `prompt`, `solution` nullable.

### LearningDebtItem
Debito didattico (concetto non padroneggiato, dubbio sospeso, esercizio non corretto).

**Citazione**: lessonos/models/entities.py:118-128 — `LearningDebtItem` dataclass (PLAN §3.4): `debt_id`, `path_id`, `kind`, `description`, `lesson_id` nullable, `resolved` bool, `citations` tuple.

### GraphNode + GraphEdge
Nodi e archi del Lesson Graph (PLAN §3.2).

**Citazioni**:
- lessonos/models/entities.py:131-138 — `GraphNode`: `node_id`, `node_type`, `ref_id` (punta entità domain), `label` nullable
- lessonos/models/entities.py:141-156 — `GraphEdge`: `edge_id`, `source`, `target`, `edge_type` (validato ∈ EDGE_TYPES), `metadata` dict. **`__post_init__`** valida `edge_type` (linea 151-156).

## Vocaboli Vincolati

### EDGE_TYPES (PLAN §3.2 / §14.2)
Gli 11 tipi di arco legali del Lesson Graph. Validati a costruzione in `GraphEdge.__post_init__`.

**Citazione**: lessonos/models/entities.py:15-29 — `EDGE_TYPES` frozenset: `explains`, `depends_on`, `revises`, `contradicts`, `repeats`, `exemplifies`, `assesses`, `derived_from`, `assigned_in`, `resolved_by`, `prepares`.

### CONCEPT_STATUS (PLAN §26.1)
I 4 stati possibili di un concetto in un Lesson Capsule. Validati a costruzione in `Concept.__post_init__`.

**Citazione**: lessonos/models/entities.py:32-34 — `CONCEPT_STATUS` frozenset: `introduced`, `reinforced`, `reviewed`, `problematic`.

## Validazione Fail-Fast

### GraphEdge.edge_type
`ValueError` se `edge_type` non ∈ EDGE_TYPES.

**Citazione**: lessonos/models/entities.py:151-156 — `__post_init__` solleva `ValueError` con messaggio: `"invalid edge_type: {self.edge_type!r} (expected one of {sorted(EDGE_TYPES)})"`.

### Concept.status
`ValueError` se `status` non ∈ CONCEPT_STATUS.

**Citazione**: lessonos/models/entities.py:102-107 — `__post_init__` solleva `ValueError` con messaggio: `"invalid concept status: {self.status!r} (expected one of {sorted(CONCEPT_STATUS)})"`.

## Design Rationale

1. **Frozen dataclasses** — immutabilità, hashable, sicuri da condividere
2. **Fail-fast validation** — `__post_init__` previene valori invalidi → il grafo non si corrompe
3. **Tuple, non list** — immutabilità per collections
4. **No I/O** — entità pure, persistenza separata (store.md)

**Citazione**: lessonos/models/entities.py:1-8 documenta approccio "Plain frozen dataclasses" con "Constrained vocabularies validated at construction so an invalid value fails fast instead of corrupting the graph."


## Addendum 24 ottobre 2026 — previsioni senza un secondo ledger

`lessonos/study/submissions.py:34` conserva la previsione come campo opzionale della stessa ricevuta di consegna; `lessonos/study/learning_experiences.py:109` risolve manifest/CoursePack e usa il valutatore esistente, con aiuti precedenti osservabili dal servizio. I riferimenti lezione restano fonti/versioni autorizzate; `learning_experiences.py:38` valida una dichiarazione di collegamento locale, senza certificare disponibilità dei media. Il nuovo tentativo mantiene una fonte privata originale e il budget portabile5riferimenti. Prove e limiti: `docs/deliveries/2026-10-24-audio-v2/validation.md` dalla root del monorepo.
