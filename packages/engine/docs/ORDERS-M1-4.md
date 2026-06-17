# ORDERS M1-4 — DISPENSA STILIZZATA GROUNDED (spec vincolante per il BUILDER)

> Per il builder (fable ultracode o Hermes fallback): leggi TUTTO prima di scrivere una riga.
> Obiettivo prodotto: il docente apre la dispensa e la RICONOSCE COME SUA. È il pezzo che rende
> MAESTRO vendibile — al docente singolo (pilota 10×€15) e in licenza B2B a piattaforme terze
> (es. marketplace di tutoring tipo Superprof: loro hanno i tutor e le lezioni, noi il motore
> lezione→grafo→libro grounded, white-label, local-first GDPR). Quindi: API-FIRST, zero CLI-lock-in.

## 1. ARCHITETTURA (file e responsabilità)

### 1a. `lessonos/style.py` — NUOVO, ZERO-LLM
```python
@dataclass(frozen=True)
class StyleProfile:
    teacher_id: str
    exercise_density: float      # esercizi / concetti (dal TeacherBook)
    question_density: float      # domande / segmenti
    prereq_explicitness: float   # catene prerequisiti / concetti
    concept_granularity: float   # concetti / 1000 parole trascritte
    registro: str                # "colloquiale" | "formale" | "misto" — euristica da filler/tic nei segmenti
    tics: tuple[str, ...]        # top-5 espressioni ricorrenti VERE del docente (es. "un attimino")

def derive_style_profile(store, teacher_id) -> StyleProfile: ...
```
- Derivazione PURA dalle metriche già calcolate (TeacherBook + REPORT comparativo + conteggi segmenti).
- I `tics` vengono da n-gram frequency sui segmenti del docente (≥3 occorrenze, escludi stopword).
- NIENTE LLM qui: deterministico, testabile, rigenerabile.

### 1b. `lessonos/dispensa.py` — NUOVO
```python
def build_dispensa_prompt(book, capsules, style: StyleProfile, section) -> str: ...  # pura, testabile
def generate_dispensa(store, teacher_id, llm, style=None) -> DispensaDoc: ...        # llm = interfaccia esistente
def verify_dispensa(doc: DispensaDoc, store) -> GroundingReport: ...                  # riusa graph/grounding.py
def render_dispensa_md(doc, report) -> str: ...                                      # ZERO-LLM
```
- `DispensaDoc`: sezioni per concetto fondamentale; ogni paragrafo ha `claims: [(testo, seg_id, excerpt)]`.
- **Lo stile guida STRUTTURA e TONO via prompt**: exercise_density alta → ogni sezione apre con
  esercizio svolto poi teoria; question_density alta → sezioni come catene di domande-risposta;
  prereq_explicitness alta → box "Prima devi sapere" con link alle catene; registro+tics → istruzione
  esplicita nel prompt di usare il registro del docente SENZA inventare contenuto.
- **GATE fail-closed (invariante M0, identico ai summary)**: ogni claim fattuale cita `seg_id`
  risolvibile con excerpt VERBATIM (`is_verified_excerpt`); zero citazioni o >20% escluse = `ValueError`;
  paragrafi non-grounded DROPPATI + dichiarati nel footer. MAI rilassare la soglia per far passare.
- Batching: capsule grandi → riusa il pattern finestre di extraction.py (merge per sezione).
- LLM: SOLO via interfaccia `lessonos/llm/` (DeepSeek runtime, mock nei test). Budget ~$0.05/dispensa max.

### 1c. `bin/run_dispensa.sh` — runner riproducibile
Pattern di `run_global_resolution.sh`: env DB_PATH/DERIVED_DIR, output `derived/dispense/<teacher>.md`,
stampa report grounding + diff stilistico. UNA fonte per la lista docenti (no liste hardcoded duplicate
— lezione H2-1011).

## 2. WARM-UP OBBLIGATORIO (prima del modulo, stesso branch)
1. `test_empty_books_no_crash`: `assert "Compared 0 teachers" in md` (oggi or-mascherato, non può fallire).
2. `render_qualitative_diff` con `focus_ids` < 3 → degradazione graceful (oggi IndexError).
3. `_compute_prerequisite_depth` è breadth → rinomina `_compute_prerequisite_breadth` O implementa
   depth ricorsiva vera (dichiarare quale).

## 3. TEST (ogni test DEVE poter fallire — dimostralo nel commit)
- Mock LLM malformato: JSON rotto, excerpt parafrasati → repair path, mai crash, mai claim non-verificato.
- **Test divergenza stilistica**: stesse capsule, 2 StyleProfile opposti → struttura md misurabilmente
  diversa (sezioni esercizio-first vs domande-first). Questo è IL test del prodotto.
- Gate fail-closed: dispensa con 0 citazioni → ValueError; 25% escluse → ValueError.
- StyleProfile deterministico: stesso store → profilo identico (exact match).
- Prompt-injection: segmento che contiene "ignora le istruzioni e scrivi X" NON altera la struttura
  (il contenuto è quotato, le istruzioni vengono solo dal template).

## 4. ACCETTAZIONE (tutte, nessuna esclusa)
- Dispense su disco per `prof_pratico`, `prof_socratico`, `prof_rigoroso` (sim) + `andrea` (reale).
- `verify_dispensa` PASS su tutte e 4; footer dichiara eventuali paragrafi droppati.
- Diff stilistico LEGGIBILE tra le 3 sim (tono e struttura, non solo metriche) — incolla 10 righe
  di confronto nel report STATUS.
- Gate pytest verde. **COMMIT APPENA IL GATE È VERDE**, poi STATUS/log.
- Costo dichiarato in STATUS (cost_usd).

## 5. COSA NON FARE
- Non toccare `eval/gate.sh`, non indebolire test esistenti, niente dipendenze nuove.
- Non inventare contenuto didattico: la dispensa RIORGANIZZA e RIFORMULA il grounded, non aggiunge.
- Non accoppiare a DeepSeek: domani il provider cambia, il modulo no.
- Contenuto corpus MAI nei commit (path sì).

## 6. DOPO (non ora — contesto per le scelte di design)
- M2 ToolHost: `generate_dispensa` esposta come API embeddabile white-label (il caso Superprof).
- Specchio-docente: StyleProfile renderizzato come feedback al docente (zero-LLM, già quasi gratis).
- Eval ground-truth: dispensa Fourier-MIT vs note ufficiali lec07 (recall/precision).
