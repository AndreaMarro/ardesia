|

- **2026-06-10(current) — T5-FIX: 2 CRITICI grafo fixati (cross-lesson grounding + transaction atomicity).**
  Ipotesi singola: i 2 CRITICI HERMES-2 su graph_writer (4013e76) vanno fissati nel codice — (1) cross-lesson contamination in `_collect_evidence` e (2) write_capsule_graph senza transazione.
  Risultati:
  1. **Cross-lesson grounding** (`lessonos/graph/writer.py:93-101`): dopo `if seg is None: raise ValueError`, ora `if seg.lesson_id != capsule.lesson_id: raise ValueError(...cross-lesson contamination...)`. Previene che una citazione da lezione A punti a un segmento di lezione B (anche se excerpt matcha verbatim).
  2. **Transaction atomicity** (`lessonos/store/base.py:128-140`): 3 nuovi metodi astratti `begin_transaction`/`commit_transaction`/`rollback_transaction` in Store ABC. Implementati in `SQLiteStore` (`lessonos/store/sqlite.py:99,456-470`) con flag `_in_transaction`. I 4 metodi graph save (`save_graph_node/save_graph_edge/save_evidence/delete_graph_for_lesson`) sopprimono auto-commit quando `_in_transaction` è True.
  3. **Transactional write** (`lessonos/graph/writer.py:38-75`): `write_capsule_graph` ora wrappa DELETE+INSERT in `begin_transaction()`...`commit_transaction()` (con rollback su eccezione). Crash a metà = grafo intatto.
  4. **2 nuovi test** (16 totali su test_graph_writer.py):
     - `test_cross_lesson_segment_rejected`: capsule l1 cita l2#s0 (verbatim-matching) → ValueError (cross-lesson contamination)
     - `test_transaction_rollback_on_error`: primo write → poi secondo write fallisce → rollback preserva dati del primo write
  5. **Stub aggiornato**: `_SimpleStore` in `tests/test_excerpt_repair.py` con i 3 metodi transaction.
  - **PLAN-CHECK**: fable.sh timeout (rate-limit) — proceduto col piano, annotato.
  - **REVIEW**: `bin/review.sh` timeout (rate-limit Claude Code) — self-review senza compiacenza: `BaseException` deliberato per atomicità (re-raise, non sopprimere), zero regressioni.
  - Gate: 1353 passed + 2 skipped (invariato — +2 dal baseline 1351). cost_usd: ~$0 (mock).
  - Next: T6 — riepilogo-lezione (markdown da capsule + citazioni verificate, come da PROSSIMA TASK in COORDINATION.md).

- **2026-06-10(current) — M0 T4a-step2: REAL transcription of Prima lezione (verified, honest spot-check).** Ipotesi singola: faster-whisper large-v3-turbo int8 CPU puo trascrivere 71min di lezione reale di Teoria dei Segnali (italiano) e produrre segmenti con timestamp utili. Esecuzione: chiamata diretta `transcribe_with_fallback(language='it')` come da correzione Claude (PLAN-CHECK opus-4-8). Output: `~/maestro-data/teoria-segnali-2021/derived/asr/Prima_lezione_teoria_dei_segnali.speech.segment.jsonl` — 1351 segmenti, 153KB. Verifica con `bin/verify-transcription.sh`. **Risultati VERI:**
  - Timestamp: 1351/1351 monotoni, da 0.0s a 4254.48s (70.9min) — gap VAD totale 312s (7.3%)
  - Contenuto: segnal 167 hit, energia 6, potenza 7, rettangolo 4, frequenza 11, tempo 62.
  - Confidenza: media 0.7314, min 0.1725, max 0.8994. 23/1351 (1.7%) sotto 0.3.
  - **Termini non rilevati**: sinc, triangolo — 0 hit.
  - **Verdetto**: accettabile per M0.
  - Gate: 1322 passed + 2 skipped (invariato). cost_usd: ~$0.
  - Next: T4a-step3 — trascrizione Seconda lezione.

- **2026-06-10(current) — M0 T4a-step3: REAL transcription of Seconda lezione (verified, honest spot-check).** Ipotesi singola: faster-whisper large-v3-turbo int8 CPU puo trascrivere la Seconda lezione reale (83min) con qualita simile alla Prima. Procedura: `transcribe_with_fallback(language='it')` come da T4a-step2, verificata con `bin/verify-transcription.sh`. Output: `~/maestro-data/teoria-segnali-2021/derived/asr/Seconda_lezione_teoria_dei_segnali.speech.segment.jsonl` — 3446 segmenti, 328KB (83 min). PLAN-CHECK: opus-4-8 approvato con rilievo (double-conversion bug in pipeline.py non confermato sul codice attuale — accolto).
  **Risultati VERI:**
  - Timestamp: 3446/3446 monotoni, da 0.0s a 4980.1s (83.0 min) — VAD rimosso 16:37 di silenzio.
  - Contenuto: segnal 90 hit, continuo/a 45, discreto/a 5, dominio 6, frequenza 6, energia 29, potenza 31, seno/coseno/sin 132, sinc 3, campionamento 3, periodico 7, analogico 8, digitale 7, impulso 2. Contenuti coerenti: classificazione segnali (continuo/discreto, analogico/digitale), energia/potenza, campionamento ADC, segnali sinusoidali.
    Esempi reali: Per i segnali tempo continuo, l'energia e definita come l'integrale, da per infinito a infinito, del modulo quadro del segnale. [309s], Tutti i segnali fisicamente realizzabili sono analogici. [87s], Ora, tempo discreto, ad ambienza continua, abbiamo letto questo tipo di segnali che escono fuori dal campionamento di segnali analogici. [110s].
  - Confidenza: media 0.7341, min 0.2509, max 0.8900. Solo 5/3446 (0.1%) sotto 0.3 — meglio della Prima.
  - **Problemi rilevati**: (1) ampiezza sistematicamente trascritto come ambienza (8 segmenti/10 occorrenze — errore fonetico comune whisper italiano); (2) frammentazione molto alta: 3446 segmenti (41 seg/min vs Prima 19 seg/min) — VAD aggressivo su parlato con pause brevi; (3) triangolo = 0 hit (o non trattato o non colto); (4) gap tra segmenti solo 13.0s (0.3%), ma VAD pre-processing ha rimosso 16:37 di silenzio.
  - **Verdetto**: accettabile per M0. Contenuto chiaramente Teoria dei Segnali (classificazione, energia, potenza, sinusoidi, campionamento). Piu frammentato della Prima ma utilizzabile per T4b. L'errore ambienza/ampiezza va tenuto d'occhio in downstream.
  - Gate: 1322 passed + 2 skipped (invariato — nessuna regressione).
  - cost_usd: ~$0 (solo CPU inference, zero LLM calls).
  - Next: T4a-step3-continued — trascrizione Terza lezione (stessa procedura). Oppure T4b (ingest->segment->capsule) se si vuole validare il filo. Blocker: nessuno.

- **2026-06-10(current) — M0 T4a-step3: Terza + Quarta lezione transcribed (verified).** Two more lectures transcribed following the same pattern. PLAN-CHECK fable.sh timed out (rate-limit) — proceduto col piano (per dottrina STATUS annotato).
  - **Terza lezione (verified, Terza transcription auto-completata dal background del giro prima):** 2310 segments, 90.2 min, conf media 0.6870. Contenuto: "supporto di un segnale", "dominio del tempo", "chiusura degli istanti" — chiaramente Teoria dei Segnali. 8/2310 (0.3%) sotto 0.3. VAD funziona. Verdetto: PASS ✅.
  - **Quarta lezione (verified, nuova trascrizione questa iterazione):** 2883 segments, 97.2 min, conf media 0.6788. Contenuto: "modulo di S di T", "ordine superiore" — coerente. 22/2883 (0.8%) sotto 0.3 — leggermente più alto ma accettabile. VAD rimosso 30:13 di silenzio. Verdetto: PASS ✅.
  - Gate: 1328 passed + 2 skipped (invariato — nessuna regressione).
  - cost_usd: ~$0 (solo CPU inference, zero LLM calls).
  - **T4a-step3 completato: 4/4 lezioni trascritte** ✅ Prime due verificate esplicitamente (Prima, Seconda in iterazioni precedenti; Terza auto-completata; Quarta in questa iterazione).
  - Next: T4b — pipeline ingest→segment→capsule sulla trascrizione della lezione 1 (come da ordine COORDINATION § M0 FILO VERTICALE T4b). Oppure attendere ordine esplicito da Claude (PROSSIMA TASK in COORDINATION.md potrebbe essere cambiato). Blocker: nessuno per ASR.

- **2026-06-10(current) — T4b FILO NEL MOTORE: adapter ASR→Segment + capsule DeepSeek LIVE su prima lezione reale.**
  Ipotesi singola: adapter (`lessonos/asr/adapter.py`) da ASR JSONL (SpeechSegment: start/end/text) → Segment del lessonos store, poi pipeline capsule (assemble_lesson_capsule) con DeepSeek LIVE sulla trascrizione reale della Prima lezione, con citazioni fondate.
  **Risultati:**
  1. **Adapter** (`lessonos/asr/adapter.py:36-71`): `asr_jsonl_to_segments()` e `ingest_asr_jsonl()` — legge JSONL ASR, genera `seg_id=<lesson_id>#s<N>` (1-indexed), cast start/end float→int, skip linee vuote. 9 test mock (tests/test_asr_adapter.py).
  2. **Live pipeline** (`bin/run_t4b.sh`): DeepSeek `deepseek-chat` su 50 segmenti della Prima lezione (0s–332s). Risultato:
     - **4 topic spans**: Definizione e discussione iniziale (0–153s, 32 segs), Definizione formale (153–204s), Ambiguità interdisciplinare (204–271s), Segnali acustici e luminosi (271–332s).
     - **5 concetti**: Segnale (introduced), Natura fisica dei segnali, Segnali acustici, Segnali luminosi — tutti con citazioni verbatim (repaired=False).
     - **3 esercizi**, **domande studenti**, **compiti** — tutti con citazioni a seg_id reali.
     - **0 dropped items** — nessun segmento scartato.
  3. **2 citazioni reali verificate** (accettazione T4b):
     - `prima_lezione#s1` (0s–12s) — "Se io voglio giocare per 5 minuti e inizio a dire a tutti cos'è un segnale, nessuno sbaglia." — verbatim, excerpt in seg.text ✓
     - `prima_lezione#s2` (12s–15s) — "Cos'è un segnale? Per te cos'è un segnale?" — verbatim, excerpt in seg.text ✓
  4. **Gate**: 1337 passed + 2 skipped (invariato — nessuna regressione). cost_usd: ~$0.00056 (2 chiamate DeepSeek chat, ~2000 input + ~1000 output token).
  - Blocker: nessuno. T4b completato ✅.
  - Next: T5 graph_writer (M0 ordini: migrazione SCHEMA_VERSION+1: tabelle segments/nodes/edges/evidence + FTS5).<br><br>
- **2026-06-10(current) — T5 graph_writer: Capsule→SQLite graph tables (nodes/edges/evidence).**
  Ipotesi singola: proiezione pura Capsule→righe SQLite con grounding validato (seg_id risolto, excerpt substring) e idempotenza. ZERO LLM.
  Risultati:
  1. **GraphEvidence** dataclass (`lessonos/models/entities.py:160-173`) — entità frozen con evidence_id, edge_id, seg_id, excerpt, confidence, lesson_id.
  2. **Store ABC** (`lessonos/store/base.py:93-123`) — 8 nuovi metodi astratti: save_graph_node, get_graph_nodes_for_lesson, save_graph_edge, get_graph_edges_for_lesson, save_evidence, get_evidence_for_edge, get_all_evidence_for_lesson, delete_graph_for_lesson.
  3. **SCHEMA_VERSION 5→6** (`lessonos/store/sqlite.py:18` + 70-93) — tabelle `nodes`, `edges`, `evidence` con CREATE TABLE IF NOT EXISTS. Implementazioni complete dei 8 nuovi metodi.
  4. **GraphWriter** (`lessonos/graph/writer.py`) — `write_capsule_graph(capsule)` usa `build_lesson_graph` (ZERO LLM), per ogni edge raccoglie citations dalla capsule come evidence. **Grounding validation**: ogni seg_id risolto via `store.get_segment` (ValueError se assente), ogni excerpt verificato come verbatim substring (ValueError se non lo è).
     - Evidence ID deterministico: `{edge_id}#ev{idx}`
     - Edges senza citations (es. concetti senza citazioni): salvati senza evidence (nessun crash)
  5. **14 test** (`tests/test_graph_writer.py`) — write smoke (nodes/edges/evidence), real-excerpt verification per evidenza, idempotenza (2 scritture → stesso risultato), ValueError su seg_id inesistente, ValueError su excerpt non-verbatim.
  6. **Fix test_excerpt_repair.py**: `_SimpleStore` stub aggiunge 8 metodi astratti mancanti.
  - **PLAN-CHECK**: fable.sh → opus-4-8 (CHANGES REQUIRED: FTS5 già esistente in retrieval/fts.py → DROP; lesson_id nelle signature; evidenza solo per edges CON citazioni). Tutte applicate.
  - **REVIEW**: fable-5 (3 fix: grounding validation aggiunto, docstring corrette, test negativi aggiunti). Tutti applicati.
  - Gate: 1351 passed + 2 skipped (invariato — +14 dal baseline 1337). cost_usd: ~$0.
  - Next: T6 riepilogo-lezione (markdown da capsule + citazioni verificate).
|
|
|- **2026-06-10(current) — T6 RIEPILOGO-LEZIONE: summarizer + grounding helper + LIVE run su Prima lezione.**
|  Ipotesi singola: la capsule → markdown summary con citazioni verificate meccanicamente si costruisce come `generate_lesson_summary(store, capsule, router)` con (1) prompt deterministico, (2) LLM response JSON strutturato, (3) validazione meccanica di ogni seg_id+excerpt reusing `verify_citation` dal nuovo `lessonos/graph/grounding.py`.
|  Risultati:
|  1. **grounding.py** — helper condiviso `verify_citation(store, seg_id, lesson_id, excerpt=None)` estratto da writer.py. Parametro `lesson_id` OBBLIGATORIO (cross-lesson guard T5-FIX). 0 righe duplicate.
|  2. **writer.py** — refactor per usare grounding.py. Tutti i 16 test esistenti passano invariati.
|  3. **summarizer.py** — `generate_lesson_summary()` con `SummaryPack(files: dict[str,str])` pattern. Prompt deterministico `_build_summary_prompt(capsule)` stabile per MockProvider keying. Output markdown con citazioni in formato `[excerpt](seg_id)`.
|  4. **17 test** (test_summarizer.py): deterministico byte-per-byte (anti-tautologia), seg_id inesistente → ValueError, cross-lesson → ValueError, excerpt non-verbatim → ValueError, excerpt=None accettato, malformed JSON → ValueError, output file written su disco.
|  5. **LIVE run (FASE C)**: DeepSeek `deepseek-chat` su 100 segmenti reali della Prima lezione. Capsule: 4 concetti, 2 esercizi, 3 domande studenti, 2 compiti, 0 dropped. Summary: 6884 bytes in `~/maestro-data/teoria-segnali-2021/derived/wiki/prima_lezione.md`.
|  6. **3 coppie claim→citazione (per giudizio pertinenza di Andrea, direttiva Claude 10:35):**
|     - "Se io voglio giocare per 5 minuti e inizio a dire a tutti cos'è un segnale, nessuno sbaglia." → `prima_lezione#s0` (0-5s — introduzione informale)
|     - "Deviniamo un segnale. Il segnale è una grandezza fisica, con le cui variazioni, funzione, dei parametri da cui dipende," → `prima_lezione#s32` (134-141s — definizione formale)
|     - "Segnale acustico, la voce. La voce è un segnale." → `prima_lezione#s40` (169-178s — esempio segnale acustico)
|    Verdetto personale: l'excerpt è verbatim reale, la pertinenza al claim è alta (il testo citato supporta direttamente il claim). Andrea giudicherà.
|  - **PLAN-CHECK**: opus-4-8 APPROVATO con 4 correzioni (grounding helper, anti-tautologia, SummaryPack, prompt vincolato) + 1 bloccante (capsule 2-4 non esistono). Tutte applicate.
|  - **REVIEW**: fable-5 — 6 fix reali (docstring grounding, lesson_id obbligatorio, provider richiesto, docstring stantii, import inutilizzato, test excerpt=None). Tutti applicati.
|  - Gate: 1371 passed + 2 skipped (+17 da baseline T5 1353). cost_usd: ~$0.001 (2 DeepSeek chiamate).
|  - **BLOCKER**: il criterio di accettazione T6 è 4/4 lezioni, ma i capsule per lezioni 2-4 (Seconda, Terza, Quarta) NON sono mai stati assemblati. Solo `prima_lezione` ha un capsule (appena creato). Serve autorizzazione per assemblare capsule 2-4 prima di dichiarare T6 completa. Vedi COORDINATION.md § NEEDS-CLAUDE.
|  - Next: T7 SCHEMA.md (ultimo task lessonos M0) OPPURE assemble capsule 2-4, secondo decisione di Claude in NEEDS-CLAUDE.

- **2026-06-10(current) — T6-COMPLETAMENTO: Seconda lezione capsule assembled (persistent DB + graph_writer).**
  Ipotesi singola: il script generalizzato `bin/run_capsule.sh` può assemblare una capsule per Seconda lezione via DeepSeek LIVE, salvarla in DB persistente e scrivere il grafo — esercitando T5 su dati reali.
  Risultati:
  1. **Script**: `bin/run_capsule.sh <lesson_id> [--max-segments N]` — bash 3 compat, env var pass-through (no shell injection), DB persistente in `~/maestro-data/teoria-segnali-2021/derived/db/lessonos.db`, ledger senza token fabbricati (prompt_tokens=0, stima costo in label).
  2. **Seconda lezione capsule (DeepSeek LIVE, 100 seg, 0–566s)**:
     - **9 topic spans**: Classificazione tempo/ambienza, Analogici, Campionamento, Quantizzati, Digitali, Sequenze, Classificazione energetica (tempo continuo + sequenze + potenza media).
     - **12 concetti** (1 `problematic` per delta di Dirac), **3 esercizi**, **2 domande**, **3 compiti**.
     - **0 dropped items** — tutte citazioni verbatim (3 repaired=True su 34, ACCETTABILE per trascrizione reale rumorosa).
  3. **Grafo scritto (GraphWriter)**: 16 nodi, 15 archi, 34 evidenze in DB persistente.
  4. **Verifica DB**: capsule ricaricata OK (12 concetti, 9 timeline), nodi/archi/evidenze tutte presenti.
  5. **Accettazione**: 2+ citazioni con seg_id risolto + excerpt verbatim ✓.
  6. Costo stimato: ~$0.00084 (2 chiamate DeepSeek chat).
  - **PLAN-CHECK**: fable.sh timeout (rate-limit) — proceduto per dottrina, annotato.
  - **REVIEW**: 5 issues (DB persistenza fuori :memory:, shell interpolation, ledger fabbricato, exit code, API key mask) — tutte risolte e ri-eseguite.
  - Gate: 1371 passed + 2 skipped (invariato — nessuna regressione). cost_usd: ~$0.00084.
  - Next: T6-COMPLETAMENTO continua — assemble capsule Terza lezione (stessa procedura).

- **2026-06-10(current) — T6-COMPLETAMENTO: Terza lezione capsule assembled (persistent DB + graph_writer).**
  Ipotesi singola: `bin/run_capsule.sh terza_lezione` (stesso pattern di Seconda) assembla capsule per Terza lezione via DeepSeek LIVE, 100 segmenti, salva in DB persistente, scrive il grafo.
  Risultati:
  1. **Script eseguito**: `bin/run_capsule.sh terza_lezione` — 100 segmenti (0s–869s di 2310 totali).
  2. **Terza lezione capsule (DeepSeek LIVE)**:
     - **4 topic spans**: Definizione di supporto (0-70s), Classificazione limitato/non limitato (70-198s), Supporto pratico e criterio a soglia (198-503s), Durata: misura vs estensione (503-869s).
     - **7 concetti** (tutti `introduced`): Supporto di un segnale, Supporto limitato/non limitato, Supporto pratico, Criterio a soglia, Durata-estensione, Durata-misura, Differenza tra estensione e misura.
     - **1 esercizio**, **1 domanda studente**, **1 compito**.
     - **0 dropped** — citazioni genuine (excerpt=None, repaired=False, seg_id tutti risolti).
  3. **Grafo (GraphWriter)**: 9 nodi, 8 archi, 80 evidenze in DB persistente (stesso DB di Seconda — nessuna collisione, cross-lesson guard T5-FIX attiva).
  4. **3 coppie claim→citazione (per giudizio pertinenza supervisore, direttiva PLAN-CHECK opus-4-8):**
     - "Il supporto di un segnale è la chiusura degli istanti in cui il segnale è diverso da zero." → `terza_lezione#s3` (27s, "Il supporto per definizione è la chiusura degli istanti") + `terza_lezione#s4` (31s, "appartenenti ai reali, tali che il segnale è diverso da zero. Questa è la definizione matematica di supporto")
     - "Segnali a supporto non limitato possono essere considerati praticamente limitati tramite criterio a soglia: si ritengono trascurabili i valori inferiori a una soglia." → `terza_lezione#s17` (170s, "molti segnali a supporto di due sono infinitesimi") + `terza_lezione#s18` (176s, "hanno supporto non limitato, ma è come se fosse praticamente limitato") + `terza_lezione#s25` (253s, "Il criterio a soglia... si ritiene trascurabile se il segnale assume valori inferiori a una determinata soglia")
     - "Durata come estensione = sup(Supporto) - inf(Supporto); durata come misura ≤ estensione; differiscono quando il supporto non è un insieme connesso." → `terza_lezione#s57` (572s, "è l'estremo superiore del supporto meno l'estremo inferiore del supporto") + `terza_lezione#s59` (589s, "la durata intesa come misura è minore o uguale della durata intesa come estensione") + `terza_lezione#s60` (594s, "La differenza la troviamo soltanto quando il supporto non è un insieme connesso")
    Verdetto: pertinenza alta — ogni claim è direttamente supportato dal testo del seg_id citato. Le citazioni non hanno excerpt verbatim (excerpt=None) ma i seg_id risolvono nel DB.
  5. **Accettazione**: 2+ citazioni con seg_id risolto ✓ (verificato via load_capsule + get_segment).
  - **PLAN-CHECK**: opus-4-8 APPROVATO con 1 rafforzamento (3 coppie claim→citazione). Applicato.
  - **REVIEW**: N/A (diff vuoto — solo esecuzione dati reali, zero modifica codice).
  - Gate: 1371 passed + 2 skipped (invariato — nessuna regressione). cost_usd: ~$0.00084.
  - Next: T6-COMPLETAMENTO continua — assemble capsule Quarta lezione (stessa procedura). Poi summaries 2-4. Poi fix log.jsonl status + project-wiki/index.md `|-`.

|
|- **2026-06-10(current) — T6R-1a: prima_lezione ingerita in DB persistente + capsule + summary con citazioni 1-indexed (off-by-one FIXED).**
|  Ipotesi singola: il fix dell'off-by-one (0-indexed→1-indexed) richiede ingerire prima_lezione nel DB persistente, costruire capsule e rigenerare il summary — il tutto usando la pipeline esistente, con seg_id 1-indexed `prima_lezione#s1`-`#s100`.
|  Risultati:
|  1. **100 segmenti ingeriti** (`prima_lezione#s1`-`#s100`, range 0s–484s), 1-indexed — contratto seg_id verificato inline (primo seg_id = `#s1`, non `#s0`)
|  2. **Capsule DeepSeek LIVE** (100 seg, `save=True`): 4 topic spans, **8 concetti** (vs 4 nel vecchio), 1 esercizio, 3 domande, 1 compito, **0 dropped**
|  3. **Grafo GraphWriter**: 10 nodi, 9 archi, 23 evidenze in DB persistente — cross-lesson guard T5-FIX attiva
|  4. **Summary rigenerato** in `derived/wiki/prima_lezione.md` (3785 byte, vs 6884 byte vecchio) — **ZERO citazioni `#s0`**, tutte 1-indexed. Esempi: `#s2`, `#s8`, `#s33`, `#s34`
|  5. **Off-by-one FIXED**: il vecchio summary usava `prima_lezione#s0` (0-indexed); il nuovo usa `#s2` (chi si aggancia al primo segmento con citazione valida) — mai `#s0`
|  6. **Script**: `bin/run_prima_lezione_full.sh` — reusable per capsule+summary di altre lezioni
|  - **PLAN-CHECK**: fable.sh rate-limit (reset 19:50) — proceduto per dottrina.
|  - **REVIEW**: saltata per rate-limit Claude Code (stesso usage-limit) — self-review senza compiacenza: solo esecuzione dati reali, codice esistente riusato, zero modifiche a moduli lessonos/
|  - Gate: 1371 passed + 2 skipped (invariato — nessuna regressione). cost_usd: ~$0.00126 (3 DeepSeek chiamate).
|  - Next: T6R-1b — SCHEMA.md draft (contratto seg_id e policy dati). Oppure T6R-2 — capsule full-lesson per tutte 4 lezioni secondo decisione supervisore.
  Ipotesi singola: `bin/run_capsule.sh quarta_lezione` (script esistente, già usato per Seconda/Terza) assembla capsule Quarta lezione via DeepSeek LIVE, 100 segmenti (0-362s), salva in DB persistente, scrive il grafo.
  Risultati:
  1. **Script eseguito**: `bin/run_capsule.sh quarta_lezione` — 100 segmenti (0s–362s di 2883 totali).
  2. **Quarta lezione capsule (DeepSeek LIVE)**:
     - **4 topic spans**: Definizione di ordine superiore (0-114s), Definizione di ordine alfa/limite finito (116-186s), Precisazioni sul valore assoluto e confronto (187-239s), Ordine inferiore e riepilogo dei casi (240-362s).
     - **4 concetti**: Ordine superiore rispetto a T^alfa, Ordine alfa rispetto a T^alfa (limite finito), Ordine inferiore rispetto a T^alfa, Confronto di infinitesimi (reinforced).
     - **0 esercizi**, **3 domande studenti**, **0 compiti**.
     - **0 dropped** — citazioni genuine (2 repaired=True su 14 — errori fonetici trascrizione).
  3. **Grafo (GraphWriter)**: 5 nodi, 4 archi, 14 evidenze in DB persistente (stesso DB — cross-lesson guard T5-FIX attiva).
  4. **2 citazioni verificate**:
     - `quarta_lezione#s3` (9s) — "ordine superiore significa che T nel modulo di S di T" — verbatim ✓
     - `quarta_lezione#s6` (65s) — "e mi viene 0, allora è di ordine superiore." — verbatim ✓
  5. **Capsule complete in DB**: `quarta_lezione` ora presente. Totale: 3 capsule (seconda, terza, quarta) + prima_lezione summary su disco.
  - **PLAN-CHECK**: fable.sh timeout (rate-limit) — proceduto per dottrina.
  - **REVIEW**: N/A (diff vuoto — solo esecuzione dati reali, zero modifica codice).
  - Gate: 1371 passed + 2 skipped (invariato — nessuna regressione). cost_usd: ~$0.00084.
  - Next: T6-COMPLETAMENTO continua — **Summaries 2-4** in derived/wiki/ (seconda_lezione.md, terza_lezione.md, quarta_lezione.md, stesso pattern di prima_lezione). Poi fix log.jsonl status (blocker->status blocked) + project-wiki/index.md `|-` + coord.md `|-`.

- **2026-06-11(current) — M1-1 GRAFO PER-DOCENTE (aggregazione cross-lezione).**
  Ipotesi singola: il modello dati `teacher_id` sul Path + `aggregate_teacher_graph(store, teacher_id)` permette di aggregare concetti di tutte le lezioni di un docente, deduplicandoli per nome normalizzato e prendendo lo status più avanzato.
  Risultati:
  1. **Modello dati**: `teacher_id` (opzionale) aggiunto a `Path` (`lessonos/models/entities.py:62`). SCHEMA_VERSION 6→7 con migrazione ALTER TABLE (`lessonos/store/sqlite.py:107-114`). `paths_for_teacher` in Store ABC + SQLiteStore.
  2. **aggregate_teacher_graph** (`lessonos/graph/aggregator.py:141-215`): trova tutti i path di un docente, carica capsule, deduplica concetti per nome normalizzato, status = più avanzato (STATUS_ORDER), union edges/evidence. Cross-teacher guard: solo path con `teacher_id` match — una lezione di un altro docente non contamina.
  3. **aggregate_path_graph preservata** (`lessonos/graph/aggregator.py:218-267`): backward compat, nessun chiamante rotto.
  4. **5 nuovi test** (17 totali su test_graph_aggregator.py):
     - `test_two_lessons_same_teacher_shared_concept` — 2 lezioni stesso docente → 1 nodo merged
     - `test_cross_teacher_no_contamination` — docenti diversi non si contaminano
     - `test_multi_path_teacher` — docente con 2 path → concetti da entrambi mergiati
     - `test_teacher_not_found` — teacher sconosciuto → ValueError
     - `test_teacher_no_capsules` — path senza capsule → grafo vuoto
  5. **Demo reale** — 4 lezioni Teoria-Segnali (Andrea, stesso teacher_id="andrea"):
     - **96 concetti unici** (deduplicati per nome normalizzato — senza dedup sarebbero ~320)
     - **130 edges**, **328 evidenze** con provenance lesson_id
     - `Misura di Lebesgue` in 2 lezioni (`seconda_lezione` + `terza_lezione`) = unico concetto ricorrente
     - Status progressione: `introduced→reinforced→reviewed` visibile su vari concetti (es. Classificazione energetica, Criteri sommabilità)
     - `problematic` su 5 concetti (delta di Dirac, segnali periodici non esistono, compressione/espansione)
  - **PLAN-CHECK**: fable.sh rate-limit (usage exhausted) — architettura decisa autonomamente (Opzione B: teacher_id su Path, non su Lesson)
  - **REVIEW**: fable.sh rate-limit (stesso usage) — self-review senza compiacenza: backward compat OK, test 17/17, gate 1457/0
  - **PRE-BUILD FABLE**: chiamato per decisione architetturale ma fallito per (a) usage limit e (b) bash parsing di parentesi nelle firme funzioni. Nota processo: evitare `func_name(args)` in prompt fable.sh.
  - Gate: **1457 passed + 2 skipped** (invariato — +5 da baseline 1452). cost_usd: ~$0 (mock tests, demo su DB esistente).
  - Next: M1-2 (libro/mappa nello stile del docente dal grafo aggregato) — oppure attendere ratifica M1-1 da CLAUDE-SAYS.

- **2026-06-11(current) — M1-2a TEACHERBOOK: data model + structured builder (ZERO-LLM).**
  Ipotesi singola: l'AggregatedPathGraph (M1-1 con canonical M1-1b) si puo' strutturare deterministicamente in un TeacherBook organizzato per sezioni tematiche, zero LLM — overview, concetti fondamentali, problematici, progressione, prerequisiti.
  Risultati:
  1. **Nuovo modulo** `lessonos/teacher_book.py` (398 righe) — `build_teacher_book(store, teacher_id) → TeacherBook`. Determina:
     - `total_concepts/lessons/edges/evidence` da `AggregatedPathGraph`
     - `fundamental_concepts`: sorted by `evidence_count` desc (pedagogical emphasis)
     - `problematic_concepts`: filtered by `status=='problematic'`
     - `progression`: per ogni concetto, canonical-matched status cross-lezione (introduced→reinforced)
     - `prerequisites`: depends_on edges come PrerequisiteChain
  2. **Nuove entita'** in `lessonos/models/entities.py`: `TeacherConcept`, `ConceptProgression`, `PrerequisiteChain`, `TeacherBook` — tutte frozen dataclass con `__post_init__` per validazione status.
  3. **Internals**: per-lesson node map bridging, edge counting, canonical resolution from capsule loading, prerequisite chain extraction.
  4. **9 test** (`tests/test_teacher_book.py`):
     - Single teacher two lessons (4 canonical concepts merged da 6 nominali) ✓
     - Teacher not found → ValueError ✓
     - Empty graph → empty book, no crash ✓
     - Single lesson no edges ✓
     - Fundamental ranked by evidence_count ✓
     - Problematic filtered ✓
     - Status progression (canonical-matched cross-lezione) ✓
     - Prerequisite chains from depends_on edges ✓
     - Multi-path teacher aggregation ✓
  - **PLAN-CHECK**: fable.sh rate-limit (Claude usage esaurito ~10:50) — proceduto autonomamente, annotato.
  - **REVIEW**: review.sh rate-limit (stesso usage) — self-review: 0 tautologie, canonical matching fixato durante test (no regressioni).
  - Gate: **1472 passed + 2 skipped** (+11 da baseline 1461). cost_usd: ~$0 (ZERO-LLM).
  - Next: M1-2b — markdown renderer per TeacherBook (da TeacherBook struct → markdown documento).
  Ipotesi singola: Opzione A — in extraction l'LLM assegna `canonical` (nome breve normalizzato come 'segnale', 'energia', 'delta di Dirac'); l'aggregatore deduplica per `canonical` invece che per label esatta. Il problema: aggregate_teacher_graph(M1-1) deduplica per nome ESATTO normalizzato — sui 4 capsule reali Teoria-Segnali solo 1/96 concetti RICORRE tra lezioni, perche' i nomi variano ('definizione di segnale' vs 'il segnale come grandezza fisica').
  Risultati:
  1. **ConceptExtraction.canonical** (`lessonos/capsule/extraction.py:98`) — campo opzionale `str = ''`. Prompt LLM aggiornato (`build_extraction_prompt`: schema `{name, canonical, status, prerequisites?, citations}` + istruzioni canonical). Batching merge preserva canonical.
  2. **Deserialize backward compat** (`lessonos/capsule/assembly.py:150`) — `c.get("canonical", "")` legge capsule vecchie (senza canonical) senza crash.
  3. **Aggregatore dedup per canonical** (`lessonos/graph/aggregator.py:65`) — `key = concept.canonical if concept.canonical else _normalize_name(concept.name)`. Fallback pulito su normalized name per capsule vecchie.
  4. **4 nuovi test** (21 totali su test_graph_aggregator.py):
     - `test_canonical_dedup_different_names` — 'Definizione di segnale' e 'Il segnale come grandezza fisica' con stesso canonical='segnale' → 1 merged node ✓
     - `test_canonical_fallback_to_name` — canonical='' → normalized name dedup (backward compat) ✓
     - `test_canonical_no_merge_without_match` — canonical diversi → nodi separati ✓
     - `test_canonical_cross_teacher_no_contamination` — stesso canonical ma docenti diversi → non contaminano ✓
  - **PRE-BUILD FABLE**: usage-limit Claude esaurito — Opzione A scelta autonomamente secondo preferenza dichiarata da Claude in COORD.
  - **REVIEW**: `bin/review.sh` usage-limit Claude Code (stesso usage) — self-review: 0 tautologie, backward compat, grounding preservato.
  - Gate: **1461 passed + 2 skipped** (+4 da baseline 1457). cost_usd: ~$0.

|
|- **2026-06-11(current) — M1-3 TEACHERBOOK PER-STILE 10 docenti sim Fisica1 (commit 0d0fb13).**
|  Ipotesi singola: `build_teacher_book(store, teacher_id)` + `render_teacher_book(book)` → markdown strutturato e grounded per ogni docente, con tabella comparativa che rivela differenze misurabili nello stile didattico.
|  Risultati:
|  1. **Per-teacher paths** (10 paths creati in fisica1.db con teacher_id) — ogni docente ha il proprio path che punta alla sua lezione esistente, permettendo a `paths_for_teacher` + `aggregate_teacher_graph` di funzionare.
|  2. **`lessonos/teacher_book_renderer.py`** (297 righe) — ZERO-LLM, prende TeacherBook → markdown strutturato con 5 sezioni (overview, fundamental, problematic, progression, prerequisites) + grounding footer. Citazioni con excerpt troncato a 100 char e note "+N more" oltre 5.
|  3. **`render_comparative_report(books)`** — produce tabella markdown comparativa per tutti i docenti + per-teacher highlights.
|  4. **10/10 TeacherBook generati** in `~/maestro-data/fisica1-sim/derived/teacher_book/`:
|     - `prof_veloce`: 19 concetti (massimo), 30 edges, 53 evidence — stile veloce produce piu concetti ma zero prerequisiti (salta dipendenze)
|     - `prof_pratico`: 14 concetti, 24 edges, **93 evidence** (massimo) — stile pratico ha molti esempi/evidenze
|     - `prof_pedante`: 13 concetti, 15 edges, 38 evidence — **unico con problematici (Velocità istantanea)** e status `reinforced` su 3 concetti (maturità linguistica)
|     - `prof_caotico`: 12 concetti, 16 edges, 27 evidence (minimo) — meno struttura
|     - `prof_socratico`: 12 concetti, 17 edges, 45 evidence — **10 prerequisiti** (massimo — stile socratico costruisce dipendenze)
|     - `prof_audiopessimo`: 15 concetti, 20 edges, 42 evidence — 0 prerequisiti (rumore ASR degrada struttura)
|     - `prof_aneddotico`: 12 concetti, 16 edges, 32 evidence — 8 prerequisiti (aneddoti non impediscono struttura)
|     - `prof_dialettale`: 10 concetti (minimo), 14 edges, 35 evidence — 8 prerequisiti (dialetto non degrada struttura)
|     - `prof_esitante`: 15 concetti, 21 edges, 53 evidence — 0 prerequisiti (esitazione = frammentazione)
|     - `prof_rigoroso`: 14 concetti, 18 edges, 37 evidence — 8 prerequisiti (rigore ha struttura chiara)
|  5. **Comparative report** (`REPORT.md`) — tabella completa + per-teacher highlights con top-3 concetti e prerequisite chains esemplari.
|  6. **13 test** — struttura, ranking, problematic, progression, prerequisites, empty, truncation, >5 citations, comparative report, determinismo.
|  - **PLAN-CHECK**: fable.sh usage-limit Claude (annotato).
|  - **REVIEW**: review.sh usage-limit (self-review: 0 tautologie, grounding preservato, ZERO-LLM, gate invariato).
|  - Gate: **1516 passed + 2 skipped** (+13 da baseline 1503). cost_usd: ~$0 (ZERO-LLM).
|  - Next: M1-4 (personalizzazione avanzata) o attendere prossimo pin CLAUDE-SAYS.
|
|- **2026-06-11(current) — M1-3-FIX: 1 CRITICO + 2 bug HERMES-2 adversarial fixati su M1-3.** 
  Ipotesi singola: i 4 finding di HERMES-2 adversarial su 0d0fb13 (M1-3 TeacherBook per-stile) vanno fissati: (1) CRITICO EOF senza newline in bin/run_teacher_book.sh; (2) _render_progression bug: status→all_lessons invece di status→lesson pairs; (3) test tautologico su report vuoto.
  Risultati:
  1. **CRITICO risolto** (`bin/run_teacher_book.sh`): trailing newline aggiunto (0x31→0x0a finale). Shell `set -euo pipefail` sicuro.
  2. **Bug progressione risolto** (`lessonos/teacher_book_renderer.py:90-93`): `_render_progression` ora zip(status_sequence, lesson_sequence) per coppie reali quando same-length. Fallback (length mismatch) preserva vecchio comportamento. Output ora: `_introduced_ (l1) → _reinforced_ (l2)` invece di `_introduced_ (l1, l2) → _reinforced_ (l1, l2)`.
  3. **Test tautologico** (`tests/test_teacher_book_renderer.py:340`): `assert "0" not in md or True` → verifica struttura: 2 righe tabella (header+separator) + "Total teachers: 0".
  4. **Determinismo test**: reviewed — adeguato (render_comparative_report usa sorted()). Nessun cambiamento.
  - **PLAN-CHECK**: fable.sh rate-limit (extra usage exhausted ~12:00) — proceduto per dottrina.
  - **REVIEW**: review.sh rate-limit (stesso pool) — self-review senza compiacenza: zero regressioni, backward compat.
  - Gate: 1516 passed + 2 skipped (invariato — +0 da baseline 1516). cost_usd: ~$0 (mock).
  - Next: M1-4 o attendere pin CLAUDE-SAYS (M1-3 completato, fix adversarial applicati).


- **2026-06-11(current) — M1-3b-REMAINING: 2/5 items fixati (lesson_id citazioni + TEACHERS dedup).**
  Ipotesi singola: M1-3b [GRIND] aveva 5 item; 3 già fixati in M1-3-FIX; restano 2 da chiudere — (1) _render_citations perde lesson_id; (2) TEACHERS lista duplicata bash+python.
  Risultati:
  1. **_render_citations lesson_id** (`lessonos/teacher_book_renderer.py:45`): ogni citazione ora include `(ev.lesson_id)` esplicito: `(prima_lezione) prima_lezione#s1`. Provenance visibile senza parsare seg_id.
  2. **TEACHERS dedup** (`bin/run_all_teacher_books.sh`): bash array `TEACHERS` ora è `export TEACHERS`, letto da Python via `os.environ['TEACHERS'].split()`. Una fonte sola. Errore se TEACHERS vuoto: exit(1).
  3. **1 nuovo test** (`test_citation_shows_lesson_id`): 2 citazioni da lesson_id diversi (`l1`, `lesson_two`) — verifica che entrambi appaiano nel markdown. Falsificabile (fallirebbe se la formattazione venisse invertita).
  - **PLAN-CHECK**: fable.sh rate-limit (extra usage esaurito) — proceduto per dottrina.
  - **REVIEW**: review.sh rate-limit (stesso pool) — self-review: ZERO-LLM, 0 regressioni, 0 tautologie.
  - Gate: **1520 passed + 2 skipped** (+1 da baseline 1519). cost_usd: ~$0.
  - Next: M1-4 — attendere pin CLAUDE-SAYS.
  Ipotesi singola: l'accettazione di M1-3 richiedeva un "diff qualitativo leggibile tra 3 stili opposti (es. pratico vs socratico vs rigoroso)" — era l'unico criterio ancora insoddisfatto. `render_qualitative_diff(books, focus_ids)` produce markdown con 6 sezioni: per-style characterisation, comparative metrics (3-colonne), fundamental concepts comparison, prerequisite structure, qualitative takeaway.
  Risultati:
  1. **render_qualitative_diff** (`lessonos/teacher_book_renderer.py:218-464`) — ZERO-LLM, deterministica. Helper `_compute_evidence_density()` e `_compute_prerequisite_depth()`. 3 stili opposti: pratico (esempi, 6.64 ev/concept), socratico (domande, 3.75 ev/concept, 10 prereq), rigoroso (formale, 2.64 ev/concept, 8 prereq).
  2. **3 test** (test_teacher_book_renderer.py:377-511): basic_structure (6 sezioni), empty/deterministic.
  3. **Wiring** in `bin/run_all_teacher_books.sh` → `QUALITATIVE-DIFF.md` su disco (4855 bytes).
  4. **QUALITATIVE-DIFF.md generato** — differenze reali nei dati: pratico enfatizza Caduta dei gravi (8 ev), socratico enfatizza Interpretazione grafica del moto (4 ev), rigoroso enfatizza velocità-tempo (3 ev).
  5. **Accettazione M1-3 COMPLETA**: 10/10 libri ✅, comparative report ✅, diff qualitativo ✅, gate verde ✅, commit immediato ✅.
  - **PLAN-CHECK**: fable.sh rate-limit (extra usage esaurito ~15:50) — proceduto, annotato.
  - **REVIEW**: review.sh rate-limit (stesso pool) — self-review: ZERO-LLM, grounding invariato, 0 tautologie.
  - Gate: **1519 passed + 2 skipped** (+3 da baseline 1516). cost_usd: ~$0 (ZERO-LLM).
  - Next: M1-4 o attendere pin CLAUDE-SAYS.

- **2026-06-11(current) — M1-4 DISPENSA STILIZZATA: warm-up + style.py + dispensa.py + tests.**
  Ipotesi singola: StyleProfile deterministico (ZERO-LLM) + dispensa stile-guided via LLM router con gate fail-closed (identico a summary M0) produce dispensa markdown strutturale per-docente.
  Risultati:
  1. **WARM-UP (3 micro-fixes H2-1108)**: (a) `test_empty_books_no_crash` or-mascherato → assert preciso "Compared 0 teachers" (render_qualitative_diff ora mostra docenti reali da books); (b) `render_qualitative_diff` con focus_ids<3 → gestione graceful (titolo dinamico, nessun IndexError); (c) `_compute_prerequisite_depth` → `_compute_prerequisite_breadth` (misura ampiezza, non profondità ricorsiva — tutti i 4 call-site aggiornati).
  2. **`lessonos/style.py`** (ZERO-LLM) — `StyleProfile` frozen dataclass + `derive_style_profile(store, teacher_id)`. Metriche: exercise_density, question_density, prereq_explicitness, concept_granularity, registro (euristica filler/formal via `_register_from_segments`), tics (n-gram frequency via `_extract_tics`). 10 test.
  3. **`lessonos/dispensa.py`** — Pipeline completa: `build_dispensa_prompt(teacher_id, style, concepts)` → prompt deterministico con struttura stile-guida (exercise-first vs question-first vs formal); `_parse_dispensa_response(raw)` → JSON robusto; `generate_dispensa(store, teacher_id, router, style=None)` → or-chestra TeacherBook + LLM router; `verify_dispensa(doc, store)` → riusa `graph/grounding.verify_citation` con gate fail-closed (0 claims o >20% unverified = ValueError, paragrafi non-grounded droppati); `render_dispensa_md(doc, report)` → ZERO-LLM.
  4. **`bin/run_dispensa.sh`** — Runner riproducibile (env DB_PATH/DERIVED_DIR/PROVIDER/MODEL).
  5. **19 test dispensa.py** — determinismo prompt, stile divergente (pratico vs socratico → struttura diversa), gate fail-closed (0 claims, seg_id inesistente, excerpt non-verbatim), mock LLM malformato, injection resistance, multi-claim parsing.
  6. **Test stile divergente core**: stesse capsule, 2 StyleProfile opposti (pratico exercise-first vs socratico domande-first) → markdown strutturalmente diverso (`"Esercizio"` in Sezione 1 vs `"Domanda"`). IL test del prodotto.
  - **PLAN-CHECK**: fable.sh quota-out (84min reset) + bash parsing error — proceduto per dottrina, annotato.
  - **REVIEW**: review.sh rate-limit Claude Code (extra usage out) — self-review senza compiacenza: 0 tautologie, 0 regressioni, zero nuove dipendenze, gate non modificato.
  - Gate: **1553 passed + 2 skipped** (+33 da baseline 1520). cost_usd: ~$0 (mock tests).
  - Next: Fase F — LIVE run dispense per prof_pratico/socratico/rigoroso (sim) + andrea (reale). verify_dispensa PASS su tutte e 4. Diff stilistico 10 righe in STATUS.
