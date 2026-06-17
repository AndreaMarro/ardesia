# Teacher-review stub — interfaccia per revisione docente

## Cos'è

Il modulo `lessonos/course/teacher_review.py` definisce il contratto dati per la
revisione umana di un corso prodotto dal Course Foundry (PlannerResult -> Export).

Dopo che il LLM-planner ha prodotto un PlannerResult, il docente puo rivederlo
e approvare/rifiutare/flaggarne parti. Questo modulo fornisce le strutture dati
(DETERMINISTIC, zero-LLM) per rappresentare quelle note.

## Schema dati

### ReviewAction enum (`lessonos/course/teacher_review.py:25-32`)

4 azioni:
- `APPROVE` — approvato
- `REVISE` — da rivedere
- `REJECT` — rifiutato
- `FLAG` — segnalazione non-bloccante

### ReviewScope enum (`lessonos/course/teacher_review.py:38-43`)

4 scope:
- `COURSE` — corso intero
- `MODULE` — modulo
- `LESSON` — lezione
- `ATOM` — singolo atomo didattico

### TeacherReviewNote (`lessonos/course/teacher_review.py:49-78`)

Frozen dataclass: nota di revisione su un elemento del corso.

Attributi: `note_id`, `action` (ReviewAction), `scope` (ReviewScope), `target_id`,
`comment`, `reviewer`.

Validazione:
- `note_id` non vuoto → ValueError (`teacher_review.py:81`)
- `target_id` non vuoto → ValueError (`teacher_review.py:84`)
- `action` deve essere ReviewAction → ValueError (`teacher_review.py:87-91`)
- `scope` deve essere ReviewScope → ValueError (`teacher_review.py:93-97`)

### TeacherReviewSet (`lessonos/course/teacher_review.py:103-148`)

Frozen dataclass: set di note di revisione per un corso. Immutabile.

Metodi:
- `has_approve` / `has_blockers` / `has_flags` — proprietà booleane
  (`teacher_review.py:120-136`)
- `notes_for_scope(scope)` — filtra per scope (`teacher_review.py:138-140`)
- `notes_for_target(target_id)` — filtra per target (`teacher_review.py:142-144`)
- `add_note(note)` — restituisce NUOVO set con nota aggiunta (immutabile,
  `teacher_review.py:146-153`)

### Stub functions

- `make_review_note(note_id, *, action, scope, target_id, ...)` — factory con
  validazione, accetta stringhe o enum (`teacher_review.py:160-219`)
- `make_empty_review_set(course_id)` — set vuoto (`teacher_review.py:222-224`)
- `is_course_approved(review_set)` — determina approvazione per pubblicazione.
  Richiede APPROVE a livello COURSE + nessun blocker (REVISE/REJECT)
  (`teacher_review.py:227-250`)

## Regole prodotto

1. **Niente UI**: il modulo definisce SOLO strutture dati + stub functions.
   L'interfaccia utente (CLI o web) sara costruita dopo.
2. **Niente LLM**: tutto deterministico, zero-LLM, frozen + ValueError.
3. **Approvazione esplicita**: un corso e approvato SOLO con una nota APPROVE
   a livello COURSE. Flags non sono sufficienti (`is_course_approved`).
4. **Immutabilità**: `TeacherReviewSet.add_note()` non modifica l'originale —
   pattern funzionale (append-only log).

## Test — 50 test non-tautologici

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
