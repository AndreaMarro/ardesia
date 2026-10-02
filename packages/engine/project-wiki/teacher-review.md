# Teacher-review — approvazione di una revisione precisa

Aggiornamento 2026-10-02: `TeacherReviewNote.revision_sha256` lega ogni nota
ai byte del materiale (`lessonos/course/teacher_review.py:79-102`).
`material_revision_sha256` include nomi e byte dei file in ordine stabile
(`teacher_review.py:247-261`). `is_course_approved` richiede la revisione
corrente, un revisore identificato e nessun blocco riferito a quella revisione
(`teacher_review.py:264-294`). Le note legacy prive di digest restano leggibili,
ma non autorizzano la pubblicazione.

La CLI legge i byte esportati e salva il digest in `review.json`
(`lessonos/cli.py:1316-1367`). `--review` mostra il digest da esaminare;
`--approve` richiede `--reviewer` e `--revision-sha256` corrispondente.
Un file modificato dopo la revisione richiede un nuovo digest e una nuova
approvazione. Il contratto Engine ora è vincolato alla revisione; la UI docente
e il recupero nella lezione successiva sono ancora da collegare.

## Cos'è

Il modulo `lessonos/course/teacher_review.py` definisce il contratto dati per la
revisione umana di un corso prodotto dal Course Foundry (PlannerResult -> Export).

Dopo che il LLM-planner ha prodotto un PlannerResult, il docente puo rivederlo
e approvare/rifiutare/flaggarne parti. Questo modulo fornisce le strutture dati
(DETERMINISTIC, zero-LLM) per rappresentare quelle note.

## Schema dati

### ReviewAction enum (`lessonos/course/teacher_review.py`)

4 azioni:
- `APPROVE` — approvato
- `REVISE` — da rivedere
- `REJECT` — rifiutato
- `FLAG` — segnalazione non-bloccante

### ReviewScope enum (`lessonos/course/teacher_review.py`)

4 scope:
- `COURSE` — corso intero
- `MODULE` — modulo
- `LESSON` — lezione
- `ATOM` — singolo atomo didattico

### TeacherReviewNote (`lessonos/course/teacher_review.py:59-102`)

Frozen dataclass: nota di revisione su un elemento del corso.

Attributi: `note_id`, `action` (ReviewAction), `scope` (ReviewScope), `target_id`,
`comment`, `reviewer`, `revision_sha256`.

Validazione:
- `note_id` e `target_id` non vuoti, azione e scope validi
  (`teacher_review.py:87-97`).
- Digest presente: 64 caratteri hex minuscoli (`teacher_review.py:98-102`).

### TeacherReviewSet (`lessonos/course/teacher_review.py:105-159`)

Frozen dataclass: set di note di revisione per un corso. Immutabile.

Metodi:
- `has_approve` / `has_blockers` / `has_flags` — proprietà booleane
  (`teacher_review.py:120-136`)
- `notes_for_scope(scope)` — filtra per scope (`teacher_review.py`)
- `notes_for_target(target_id)` — filtra per target (`teacher_review.py`)
- `add_note(note)` — restituisce NUOVO set con nota aggiunta (immutabile,
  `teacher_review.py`)

### Funzioni di revisione

- `make_review_note(note_id, *, action, scope, target_id, ...)` — factory con
  validazione, accetta stringhe o enum (`teacher_review.py:160-219`)
- `make_empty_review_set(course_id)` — set vuoto (`teacher_review.py:222-224`)
- `material_revision_sha256(files)` — digest stabile dei nomi e byte reali
  (`teacher_review.py:247-261`).
- `is_course_approved(review_set, revision_sha256)` — richiede APPROVE a livello
  COURSE per quel digest, revisore identificato, target corrispondente e nessun
  blocker sulla stessa revisione (`teacher_review.py:264-294`).

## Regole prodotto

1. **Modulo headless**: il modello è usato dalla CLI; la UI web resta da collegare.
2. **Niente LLM**: tutto deterministico, zero-LLM, frozen + ValueError.
3. **Approvazione esplicita e versionata**: un corso è approvato solo con nota
   APPROVE per i byte correnti, revisore e course_id; flag e note legacy non
   bastano (`teacher_review.py:264-294`).
4. **Immutabilità**: `TeacherReviewSet.add_note()` non modifica l'originale —
   pattern funzionale (append-only log).

## Test

I test correnti in `tests/test_course_teacher_review.py` e
`tests/test_cli_compile_course.py` coprono hash di nomi/byte, approvazione
vincolata, revisione modificata, conservazione storica delle note e rifiuto
dell'approvazione CLI senza revisore o digest.

### Baseline storica P1

| Gruppo | File | Test |
|--------|------|------|
| ReviewAction enum | `tests/test_course_teacher_review.py:24-43` | 5 test |
| ReviewScope enum | `tests/test_course_teacher_review.py:46-62` | 5 test |
| TeacherReviewNote validation | `tests/test_course_teacher_review.py:65-120` | 7 test |
| make_review_note | `tests/test_course_teacher_review.py:123-191` | 12 test |
| TeacherReviewSet validation | `tests/test_course_teacher_review.py:194-220` | 4 test |
| TeacherReviewSet properties | `tests/test_course_teacher_review.py:223-270` | 8 test |
| TeacherReviewSet filter | `tests/test_course_teacher_review.py:273-300` | 2 test |
| add_note immutabile | `tests/test_course_teacher_review.py:303-322` | 3 test |
| make_empty_review_set | `tests/test_course_teacher_review.py:325-335` | 1 test |
| is_course_approved | `tests/test_course_teacher_review.py:338-389` | 7 test |

Nessun `>=` su conteggi deterministici — enum 4 valori = `== 4`.
