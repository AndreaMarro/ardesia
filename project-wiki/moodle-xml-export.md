# Moodle XML Quiz Exporter (P1)

`lessonos/export/moodle_xml.py` — Export deterministico di quiz_question atoms in formato Moodle XML (standard `quiz.xml`).

## Funzione principale

- `export_moodle_xml(blueprint, atoms=None, *, output_dir='', include_ai_atoms=False)` → `MoodleXMLQuizPack`
- `MoodleXMLQuizPack.files` = `{"quiz.xml": "<XML content>"}`

## Tipi domanda supportati

| Has choices | correct_index | Moodle type | Note |
|-------------|---------------|-------------|------|
| `True` (choices definite) | 0-based | `multichoice` | `single=true` di default, `single=false` se `__multiple__:1` |
| `False` (choices vuote) | `-1` | `shortanswer` | Wildcard answer `*` |
| `False` | `-2` | `essay` | Editor HTML, 10 linee |

## Metadata nel body

Il body dei `ContentAtom` (tipo `quiz_question`) contiene il testo domanda + metadati su linee separate:
- `__choices__:opt1;opt2;opt3` — opzioni delimitate da `;`
- `__correct__:<0-based index o -1 per aperta>` — risposta corretta
- `__multiple__:1` — flag per multichoice a risposta multipla

**Regola**: i metadati devono essere su linee SEPARATE dopo il testo domanda. Il testo domanda non deve contenere `__choices__:` naturalmente.

## Validazione

- `ValueError` su blueprint senza moduli
- `ValueError` su multichoice con choices vuote
- `ValueError` su `correct_index` fuori range
- ZERO-LLM, deterministico, stdlib-only

## Test

`tests/test_export_moodle_xml.py` — 16 test (1014 totali). Categorie: struttura base, multichoice/shortanswer/essay, output su disco, atoms assenti, moduli vuoti, AI-only esclusione, orfani in "Other", multiple-choice-multiple.

## Best practice emerse

Flag separati `multiple_answer`/`is_essay` nel test helper `_make_atom` per evitare ambiguità tra multichoice multiple e essay. `_parse_quiz_body` è riutilizzabile per altri formati.
