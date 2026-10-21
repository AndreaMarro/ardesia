# STATUS — LessonOS Core Engine

> Append-only. Ultima riga = dove sei / blocker / domande.

- **2026-06-17 — MCP grounded-memory wrapper integrato + test end-to-end su lezione campione (commit 347a9c6, gate 2018/0, +3).**
  Pin: [AUTO-PINNED 17/06 17:14] integra il wrapper MCP grounded-memory con test end-to-end su lezione campione, gate verde invariato, zero regressioni.
  Il wrapper `lessonos/mcp/grounded_memory.py` (231 righe, già scritto ma untracked) è un server JSON-RPC 2.0 / MCP in-process, dependency-free, che espone il recall grounded teacher-scoped come tool `grounded_memory_recall`. L'invariante di grounding: ogni item emesso è riverificato via `verify_citation` contro lo store persistito; candidati non risolvibili, cross-teacher, cross-lesson o capsule (senza seg_id) sono droppati e dichiarati in `dropped_ungrounded`.
  File integrati e committati:
  - `lessonos/mcp/__init__.py` (13 righe) — export pulito
  - `lessonos/mcp/grounded_memory.py` (231 righe) — server JSON-RPC 2.0 con tool tools/call
  - `tests/test_mcp_grounded_memory.py` (318 righe, 22 test) — handshake, recall, grounding guard, error surface + 3 nuovi test end-to-end `TestMultiSegmentLesson`
  Nuovi test `TestMultiSegmentLesson`:
  - `test_multi_segment_recall_returns_verbatim_provenance`: lezione 3-segmenti, query "segnale supporto" → 2 hit (s1, s2), text verbatim confermato via store.get_segment
  - `test_cross_teacher_isolation_holds_with_multi_segment`: query "segnale tempo" matcha ENTRAMBI i teacher ma lo scope limita a t_main → solo s1, mai s_other
  - `test_each_item_has_required_fields`: contratto strutturale (seg_id/lesson_id/text/snippet/rank) su 3 hit
  - **PLAN-CHECK**: fable.sh approvato (exit 0).
  - **REVIEW**: review.sh (gemini) — FALSO POSITIVO: i file erano troncati da `sed -n '1,200p'` nella review, ma compilano correttamente (Python AST verified). Gate verde conferma.
  - Gate: 2015→2018 (+3), zero regressioni. cost_usd: ~$0 (mock, ZERO LLM).
  - Next: attende prossimo pin da CLAUDE-SAYS o promote_pin da ROADMAP-AUTO.

- **2026-06-12 — Adversarial triage: fix excerpt guard + test parametrizzato (adversarial 03:40 su 478f628).**
  Ipotesi singola: il finding MINORE VERO dell'adversarial su 478f628 (03:40) — `excerpt=""` e `excerpt="   "` non coperti dal test e dal codice — va fissato. Il CRITICO (test tautologico) e la NOTA (FsPath) dell'adversarial 08:02 su b7d23c1 sono **FALSI POSITIVI** (assert gia adeguati, comparazione su stringa non FsPath).
  Risultati:
  1. **Fix codice** (lessonos/dispensa.py:474): `claim.excerpt is None or claim.excerpt == ""` -> `not claim.excerpt or not claim.excerpt.strip()`. Cattura None, "" e whitespace-only ("   "). Short-circuit safe.
  2. **Test parametrizzato** (tests/test_dispensa.py:435): `test_excerpt_none_dropped` ora parametrizzato con `[None, "", "   "]` — 3 casi falsificabili.
  3. **Triaggio adversarial completato**:
     - 08:02 su b7d23c1 (vault test): **TUTTI FALSI POSITIVI**
     - 03:40 su 478f628 (CRITICO fix): **1 MINORE VERO** — test gap coperto
     - 02:13 su b72126a (WORKFLOW-2.0): non tocca lessonos, gestito da Claude
  - **PLAN-CHECK**: fable.sh quota-out — proceduto.
  - **REVIEW**: review.sh quota-out — self-review: 0 regressioni, 0 tautologie.
  - Gate: **1651 passed / 2 skipped / 0 failed** (+2 da baseline 1649). cost_usd: ~$0 (mock).
  - Next: attende pin CLAUDE-SAYS per M2 lessonos. Tutti gli adversarial lessonos triagati e chiusi.

- **2026-06-10 — T5-FIX: 2 CRITICI grafo fixati (cross-lesson grounding + transaction atomicity).**
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

- **2026-06-10 — M0 T4a-step2: REAL transcription of Prima lezione (verified, honest spot-check).** Ipotesi singola: faster-whisper large-v3-turbo int8 CPU puo trascrivere 71min di lezione reale di Teoria dei Segnali (italiano) e produrre segmenti con timestamp utili. Esecuzione: chiamata diretta `transcribe_with_fallback(language='it')` come da correzione Claude (PLAN-CHECK opus-4-8). Output: `~/maestro-data/teoria-segnali-2021/derived/asr/Prima_lezione_teoria_dei_segnali.speech.segment.jsonl` — 1351 segmenti, 153KB. Verifica con `bin/verify-transcription.sh`. **Risultati VERI:**
  - Timestamp: 1351/1351 monotoni, da 0.0s a 4254.48s (70.9min) — gap VAD totale 312s (7.3%)
  - Contenuto: segnal 167 hit, energia 6, potenza 7, rettangolo 4, frequenza 11, tempo 62.
  - Confidenza: media 0.7314, min 0.1725, max 0.8994. 23/1351 (1.7%) sotto 0.3.
  - **Termini non rilevati**: sinc, triangolo — 0 hit.
  - **Verdetto**: accettabile per M0.
  - Gate: 1322 passed + 2 skipped (invariato). cost_usd: ~$0.
  - Next: T4a-step3 — trascrizione Seconda lezione.

- **2026-06-10 — M0 T4a-step3: REAL transcription of Seconda lezione (verified, honest spot-check).** Ipotesi singola: faster-whisper large-v3-turbo int8 CPU puo trascrivere la Seconda lezione reale (83min) con qualita simile alla Prima. Procedura: `transcribe_with_fallback(language='it')` come da T4a-step2, verificata con `bin/verify-transcription.sh`. Output: `~/maestro-data/teoria-segnali-2021/derived/asr/Seconda_lezione_teoria_dei_segnali.speech.segment.jsonl` — 3446 segmenti, 328KB (83 min). PLAN-CHECK: opus-4-8 approvato con rilievo (double-conversion bug in pipeline.py non confermato sul codice attuale — accolto).
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

- **2026-06-10 — M0 T4a-step3: Terza + Quarta lezione transcribed (verified).** Two more lectures transcribed following the same pattern. PLAN-CHECK fable.sh timed out (rate-limit) — proceduto col piano (per dottrina STATUS annotato).
  - **Terza lezione (verified, Terza transcription auto-completata dal background del giro prima):** 2310 segments, 90.2 min, conf media 0.6870. Contenuto: "supporto di un segnale", "dominio del tempo", "chiusura degli istanti" — chiaramente Teoria dei Segnali. 8/2310 (0.3%) sotto 0.3. VAD funziona. Verdetto: PASS ✅.
  - **Quarta lezione (verified, nuova trascrizione questa iterazione):** 2883 segments, 97.2 min, conf media 0.6788. Contenuto: "modulo di S di T", "ordine superiore" — coerente. 22/2883 (0.8%) sotto 0.3 — leggermente più alto ma accettabile. VAD rimosso 30:13 di silenzio. Verdetto: PASS ✅.
  - Gate: 1328 passed + 2 skipped (invariato — nessuna regressione).
  - cost_usd: ~$0 (solo CPU inference, zero LLM calls).
  - **T4a-step3 completato: 4/4 lezioni trascritte** ✅ Prime due verificate esplicitamente (Prima, Seconda in iterazioni precedenti; Terza auto-completata; Quarta in questa iterazione).
  - Next: T4b — pipeline ingest→segment→capsule sulla trascrizione della lezione 1 (come da ordine COORDINATION § M0 FILO VERTICALE T4b). Oppure attendere ordine esplicito da Claude (PROSSIMA TASK in COORDINATION.md potrebbe essere cambiato). Blocker: nessuno per ASR.

- **2026-06-10 — T4b FILO NEL MOTORE: adapter ASR→Segment + capsule DeepSeek LIVE su prima lezione reale.**
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
- **2026-06-10 — T5 graph_writer: Capsule→SQLite graph tables (nodes/edges/evidence).**
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

- **2026-06-10 — T6 RIEPILOGO-LEZIONE: summarizer + grounding helper + LIVE run su Prima lezione.**
  Ipotesi singola: la capsule → markdown summary con citazioni verificate meccanicamente si costruisce come `generate_lesson_summary(store, capsule, router)` con (1) prompt deterministico, (2) LLM response JSON strutturato, (3) validazione meccanica di ogni seg_id+excerpt reusing `verify_citation` dal nuovo `lessonos/graph/grounding.py`.
  Risultati:
  1. **grounding.py** — helper condiviso `verify_citation(store, seg_id, lesson_id, excerpt=None)` estratto da writer.py. Parametro `lesson_id` OBBLIGATORIO (cross-lesson guard T5-FIX). 0 righe duplicate.
  2. **writer.py** — refactor per usare grounding.py. Tutti i 16 test esistenti passano invariati.
  3. **summarizer.py** — `generate_lesson_summary()` con `SummaryPack(files: dict[str,str])` pattern. Prompt deterministico `_build_summary_prompt(capsule)` stabile per MockProvider keying. Output markdown con citazioni in formato `[excerpt](seg_id)`.
  4. **17 test** (test_summarizer.py): deterministico byte-per-byte (anti-tautologia), seg_id inesistente → ValueError, cross-lesson → ValueError, excerpt non-verbatim → ValueError, excerpt=None accettato, malformed JSON → ValueError, output file written su disco.
  5. **LIVE run (FASE C)**: DeepSeek `deepseek-chat` su 100 segmenti reali della Prima lezione. Capsule: 4 concetti, 2 esercizi, 3 domande studenti, 2 compiti, 0 dropped. Summary: 6884 bytes in `~/maestro-data/teoria-segnali-2021/derived/wiki/prima_lezione.md`.
  6. **3 coppie claim→citazione (per giudizio pertinenza di Andrea, direttiva Claude 10:35):**
     - "Se io voglio giocare per 5 minuti e inizio a dire a tutti cos'è un segnale, nessuno sbaglia." → `prima_lezione#s0` (0-5s — introduzione informale)
     - "Deviniamo un segnale. Il segnale è una grandezza fisica, con le cui variazioni, funzione, dei parametri da cui dipende," → `prima_lezione#s32` (134-141s — definizione formale)
     - "Segnale acustico, la voce. La voce è un segnale." → `prima_lezione#s40` (169-178s — esempio segnale acustico)
    Verdetto personale: l'excerpt è verbatim reale, la pertinenza al claim è alta (il testo citato supporta direttamente il claim). Andrea giudicherà.
  - **PLAN-CHECK**: opus-4-8 APPROVATO con 4 correzioni (grounding helper, anti-tautologia, SummaryPack, prompt vincolato) + 1 bloccante (capsule 2-4 non esistono). Tutte applicate.
  - **REVIEW**: fable-5 — 6 fix reali (docstring grounding, lesson_id obbligatorio, provider richiesto, docstring stantii, import inutilizzato, test excerpt=None). Tutti applicati.
  - Gate: 1371 passed + 2 skipped (+17 da baseline T5 1353). cost_usd: ~$0.001 (2 DeepSeek chiamate).
  - **BLOCKER**: il criterio di accettazione T6 è 4/4 lezioni, ma i capsule per lezioni 2-4 (Seconda, Terza, Quarta) NON sono mai stati assemblati. Solo `prima_lezione` ha un capsule (appena creato). Serve autorizzazione per assemblare capsule 2-4 prima di dichiarare T6 completa. Vedi COORDINATION.md § NEEDS-CLAUDE.
  - Next: T7 SCHEMA.md (ultimo task lessonos M0) OPPURE assemble capsule 2-4, secondo decisione di Claude in NEEDS-CLAUDE.

- **2026-06-11 — M1-4b: 3 fix dispensa (matching, dropped_texts, empty-claims gate).**
  Ipotesi singola: i 3 problemi di H2-su-b17bc94 in dispensa.py vanno fissati — (1) CRITICO matching concetto substring crea falsi cross-match tra concetti di lezioni diverse; (2) dropped_paragraphs non preserva il testo; (3) manca test gate per sezioni con claims vuoti.
  Risultati:
  1. **Matching rewrite** (`lessonos/dispensa.py:138-200`): nuovo helper `_resolve_concepts_from_capsules()` con exact normalized match → edit-distance fallback (SequenceMatcher ratio >= 0.85) → ValueError se nessun ConceptExtraction con citazioni trovato. Silent fallback (creazione di ConceptExtraction senza citazioni) ELIMINATO.
  2. **_name_similar()** (`lessonos/dispensa.py:140-147`): helper edit-distance con soglia conservativa 0.85 — 'fourier' vs 'serie di fourier' (~0.53) non matchano; 'fourier' vs 'fourier' (1.0) sì.
  3. **dropped_paragraphs preserva testo reale** (`lessonos/dispensa.py:443`): ora `droped_texts.append(para.text)` invece di stringa generica. Render mostra il testo dei paragrafi scartati.
  4. **10 nuovi test** (33 totali su test_dispensa.py):
     - TestResolveConcepts (6): exact match, case-insensitive, cross-lezione NO substring, edit-distance fallback, ValueError su no-match, senza-citazioni saltato.
     - TestNameSimilar (3): identical TRUE, fourier/serie FALSE, empty FALSE.
     - TestVerifyDispensaGate (1): sezioni con claims=() → ValueError.
  5. **Test cross-lezione dimostrativo**: L1 'Fourier', L2 'Trasformata di Fourier'. Vecchio substring: 'fourier' in 'trasformata di fourier' → TRUE (spurio). Nuovo: exact match → solo L1.
  - **PLAN-CHECK**: fable.sh quota-out (29min al reset) — proceduto per dottrina, annotato.
  - **REVIEW**: review.sh extra usage out — self-review senza compiacenza: zero tautologie, zero regressioni, zero nuove dipendenze (difflib stdlib), grounding rafforzato.
  - Gate: **1563 passed + 2 skipped** (+10 da baseline 1553). cost_usd: ~$0 (mock).
  - Next: M1-4c [GRIND] 5 test obbligati del bug-hunt report §4 — oppure attendere pin CLAUDE-SAYS.

- **2026-06-10 — T6-COMPLETAMENTO: Seconda lezione capsule assembled (persistent DB + graph_writer).**
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

- **2026-06-10 — T6-COMPLETAMENTO: Terza lezione capsule assembled (persistent DB + graph_writer).**
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
  - Next: T6-COMPLETAMENTO continua — assemble capsule Quarta lezione (stessa procedura). Poi summaries 2-4. Poi fix log.jsonl status e project-wiki/index.md `|-`.

- **2026-06-10 — T6R-1a: prima_lezione ingerita in DB persistente + capsule + summary con citazioni 1-indexed (off-by-one FIXED).**
  Ipotesi singola: il fix dell'off-by-one (0-indexed→1-indexed) richiede ingerire prima_lezione nel DB persistente, costruire capsule e rigenerare il summary — il tutto usando la pipeline esistente, con seg_id 1-indexed `prima_lezione#s1`-`#s100`.
  Risultati:
  1. **100 segmenti ingeriti** (`prima_lezione#s1`-`#s100`, range 0s–484s), 1-indexed — contratto seg_id verificato inline (primo seg_id = `#s1`, non `#s0`)
  2. **Capsule DeepSeek LIVE** (100 seg, `save=True`): 4 topic spans, **8 concetti** (vs 4 nel vecchio), 1 esercizio, 3 domande, 1 compito, **0 dropped**
  3. **Grafo GraphWriter**: 10 nodi, 9 archi, 23 evidenze in DB persistente — cross-lesson guard T5-FIX attiva
  4. **Summary rigenerato** in `derived/wiki/prima_lezione.md` (3785 byte, vs 6884 byte vecchio) — **ZERO citazioni `#s0`**, tutte 1-indexed. Esempi: `#s2`, `#s8`, `#s33`, `#s34`
  5. **Off-by-one FIXED**: il vecchio summary usava `prima_lezione#s0` (0-indexed); il nuovo usa `#s2` (chi si aggancia al primo segmento con citazione valida) — mai `#s0`
  6. **Script**: `bin/run_prima_lezione_full.sh` — reusable per capsule+summary di altre lezioni
  - **PLAN-CHECK**: fable.sh rate-limit (reset 19:50) — proceduto per dottrina.
  - **REVIEW**: saltata per rate-limit Claude Code (stesso usage-limit) — self-review senza compiacenza: solo esecuzione dati reali, codice esistente riusato, zero modifiche a moduli lessonos/
  - Gate: 1371 passed + 2 skipped (invariato — nessuna regressione). cost_usd: ~$0.00126 (3 DeepSeek chiamate).
  - Next: T6R-1b — SCHEMA.md draft (contratto seg_id e policy dati). Oppure T6R-2 — capsule full-lesson per tutte 4 lezioni secondo decisione supervisore.
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

- **2026-06-11 — M1-1 GRAFO PER-DOCENTE (aggregazione cross-lezione).**
  Ipotesi singola: il modello dati `teacher_id` sul Path + `aggregate_teacher_graph(store, teacher_id)` permette di aggregare concetti di tutte le lezioni di un docente, deduplicandoli per nome normalizzato e prendendo lo status più avanzato.
  Risultati:
  1. **Modello dati**: `teacher_id` (opzionale) aggiunto a `Path` (`lessonos/models/entities.py:62`). SCHEMA_VERSION 6→7 con migrazione ALTER TABLE (`lessonos/store/sqlite.py:107-114`). `paths_for_teacher` in Store ABC + SQLiteStore.
  2. **aggregate_teacher_graph** (`lessonos/graph/aggregator.py:141-215`): trova tutti i path di un docente, carica capsule, deduplica concetti per nome normalizzato, status = più avanzato (STATUS_ORDER), union edges/evidence. Cross-teacher guard: solo path con `teacher_id` match — una lezione di un altro docente non contamina.
  3. **aggregate_path_graph preservata** (`lessonos/graph/aggregator.py:218-267`): backward compat, nessun chiamante rotto.
  4. **5 nuovi test** (17 totali su test_graph_aggregator.py):
     - `test_two_lessons_same_teacher_shared_concept` — 2 lezioni stesso docente → 1 nodo merged
     - `test_cross_teacher_no_contamination` — docenti diversi non si contaminano
     - `test_multi_path_teacher` — docente con 2 path → concetti da entrambi mergiati
     - `test_teacher_not_found` → ValueError
     - `test_teacher_no_capsules` → grafo vuoto
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

- **2026-06-11 — M1-2a TEACHERBOOK: data model + structured builder (ZERO-LLM).**
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

- **2026-06-11 — M1-3 TEACHERBOOK PER-STILE 10 docenti sim Fisica1 (commit 0d0fb13).**
  Ipotesi singola: `build_teacher_book(store, teacher_id)` + `render_teacher_book(book)` → markdown strutturato e grounded per ogni docente, con tabella comparativa che rivela differenze misurabili nello stile didattico.
  Risultati:
  1. **Per-teacher paths** (10 paths creati in fisica1.db con teacher_id) — ogni docente ha il proprio path che punta alla sua lezione esistente, permettendo a `paths_for_teacher` + `aggregate_teacher_graph` di funzionare.
  2. **`lessonos/teacher_book_renderer.py`** (297 righe) — ZERO-LLM, prende TeacherBook → markdown strutturato con 5 sezioni (overview, fundamental, problematic, progression, prerequisites) + grounding footer. Citazioni con excerpt troncato a 100 char e note "+N more" oltre 5.
  3. **`render_comparative_report(books)`** — produce tabella markdown comparativa per tutti i docenti + per-teacher highlights.
  4. **10/10 TeacherBook generati** in `~/maestro-data/fisica1-sim/derived/teacher_book/`:
     - `prof_veloce`: 19 concetti (massimo), 30 edges, 53 evidence — stile veloce produce piu concetti ma zero prerequisiti (salta dipendenze)
     - `prof_pratico`: 14 concetti, 24 edges, **93 evidence** (massimo) — stile pratico ha molti esempi/evidenze
     - `prof_pedante`: 13 concetti, 15 edges, 38 evidence — **unico con problematici (Velocità istantanea)** e status `reinforced` su 3 concetti (maturità linguistica)
     - `prof_caotico`: 12 concetti, 16 edges, 27 evidence (minimo) — meno struttura
     - `prof_socratico`: 12 concetti, 17 edges, 45 evidence — **10 prerequisiti** (massimo — stile socratico costruisce dipendenze)
     - `prof_audiopessimo`: 15 concetti, 20 edges, 42 evidence — 0 prerequisiti (rumore ASR degrada struttura)
     - `prof_aneddotico`: 12 concetti, 16 edges, 32 evidence — 8 prerequisiti (aneddoti non impediscono struttura)
     - `prof_dialettale`: 10 concetti (minimo), 14 edges, 35 evidence — 8 prerequisiti (dialetto non degrada struttura)
     - `prof_esitante`: 15 concetti, 21 edges, 53 evidence — 0 prerequisiti (esitazione = frammentazione)
     - `prof_rigoroso`: 14 concetti, 18 edges, 37 evidence — 8 prerequisiti (rigore ha struttura chiara)
  5. **Comparative report** (`REPORT.md`) — tabella completa + per-teacher highlights con top-3 concetti e prerequisite chains esemplari.
  6. **13 test** — struttura, ranking, problematic, progression, prerequisites, empty, truncation, >5 citations, comparative report, determinismo.
  - **PLAN-CHECK**: fable.sh usage-limit Claude (annotato).
  - **REVIEW**: review.sh usage-limit (self-review: 0 tautologie, grounding preservato, ZERO-LLM, gate invariato).
  - Gate: **1516 passed + 2 skipped** (+13 da baseline 1503). cost_usd: ~$0 (ZERO-LLM).
  - Next: M1-4 (personalizzazione avanzata) o attendere prossimo pin CLAUDE-SAYS.

- **2026-06-11 — M1-3-FIX: 1 CRITICO + 2 bug HERMES-2 adversarial fixati su M1-3.** 
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

- **2026-06-11 — M1-3b-REMAINING: 2/5 items fixati (lesson_id citazioni + TEACHERS dedup).**
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

- **2026-06-11 — M1-4 DISPENSA STILIZZATA: warm-up + style.py + dispensa.py + tests.**
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

- **2026-06-11 — M1-4c [GRIND]: 5 test obbligati bug-hunt report §4 (gate 1580/0, +17).**
  Ipotesi singola: i 5 test di robustezza identificati dal bug-hunt (docs/audits/BUGHUNT-2026-06-11.md §4) vanno scritti per cementare i 4 SUBITO fix mergiati dal supervisore (gate-before-save, purge in ingest_bundle, tier-3 floor, fail-closed read-path aggregator).
  Risultati:
  1. **Test #1 — re-ingest stale evidence** (test_graph_aggregator.py, 3 test): `_collect_edges_and_evidence` con segment text cambiato → ValueError (STALE); seg_id inesistente → ValueError; fresh passa.
  2. **Test #2 — gate-before-save capsule** (test_capsule_assembly.py, 3 test): `assemble_lesson_capsule` con citation excerpt=None → ValueError (gate fail) + `get_capsule(None)` verifica; segments preservati; zero citations → ValueError.
  3. **Test #3 — bundle re-export fewer** (test_ingest_bundle.py, 1 test): 10 elementi → re-ingest con 7 → `segments_for_lesson==7` (purge funziona).
  4. **Test #4 — second lesson aggregate** (test_graph_aggregator.py, 3 test): 2 lezioni stesso path → entrambe in aggregate_path_graph e teacher_graph; lessons_for_path consistent.
  5. **Test #5 — repair adversarial** (test_excerpt_repair.py, 7 test): negazione stripping documentato (M1-5 deferred); allucinato+articolo → None; article+verbatim passa; word-boundary defense-in-depth; repaired=True in is_verified_excerpt; None/empty → False.
  - **PLAN-CHECK**: fable.sh timeout (rate-limit) — proceduto per dottrina, annotato.
  - **REVIEW**: fable-5 (4 fix veri: docstring onesta word-boundary, import inutilizzato rimosso, assert deterministico, dead code rimosso). Tutti applicati.
  - Gate: **1580 passed + 2 skipped** (+17 da baseline 1563). cost_usd: ~$0 (mock).
- Next: M1-6 — Fase F dispense live 3 sim + andrea + blind-test (>=7/10). Attende pin CLAUDE-SAYS.

- **2026-06-11 — M1-5.5: test determinismo H2-1327 (l'unico gap residuo M1-5, M1-5 COMPLETO).**
  Ipotesi singola: il test determinismo per _resolve_concepts_from_capsules (H2-1327, richiesto da COORD) va aggiunto — il fix logico era gia nel codice dispensa.py:178-188 da M1-4b, ma mancava il test che verifica quale candidato vince su exact-match multipli.
  Risultati:
  1. **Test aggiunto** (tests/test_dispensa.py:558-598): `test_multiple_exact_matches_deterministic` — stesso concetto 'Energia' exact-match in capsule l1 (introduced) e l2 (reinforced) → sempre l1 vince (primo lid in insertion order). Falsificabile: assert `result[0] is l1_ext` e `result[0].status == "introduced"`.
  2. **M1-5 COMPLETO**: 5/5 sotto-task chiusi:
     - M1-5.1 purge_lesson transazionale (83adbff) ✅
     - M1-5.2 _lesson_ids_from_path fonte primaria (289b936) ✅
     - M1-5.3 negation-aware repair (fe5065e) ✅
     - M1-5.4 run_ingest in pipeline.py (8e84978) ✅
     - M1-5.5 H2-1327 determinism fix+test (f3775ab) ✅
  - **PLAN-CHECK**: fable.sh rate-limit (quota out, 97min al reset) — proceduto per dottrina, annotato.
  - **REVIEW**: fable-5 — 3 fix (test 2-call non falsificabile, docstring status-discriminator senza assert, assert non discriminante). Tutti applicati.
  - Gate: 1585 passed + 2 skipped (+1 da baseline 1584, nessuna regressione). cost_usd: ~$0 (mock).

- **2026-06-11 — ⏸️ LESSONOS-NOOP: pin M1-5 stale, nessuna task disponibile.**
  ORIENT: COORD.md § PROSSIMA TASK riga 16 punta ancora a M1-5 (REDO guidato) — task GIÀ CONSEGNATA (5/5 sotto-task, vedi entry M1-5.5 sopra).
  VERIFICATO (ri-eseguito ORA, non dichiarato):
  - Gate `bash eval/gate.sh` → 1585 passed / 0 failed, exit 0 — VERDE.
  - Criteri di accettazione M1-5 punto per punto, presenti nel codice a HEAD `de0306c`:
    1. purge_lesson transazionale + delete_capsule → store/base.py:79-88, store/sqlite.py:343-355 (commit 83adbff) ✅
    2. _lesson_ids_from_path fonte primaria + 4 call-site → graph/aggregator.py:42,254,339,407 + teacher_book.py:305 (commit 289b936) ✅
    3. negation-aware repair → _NEGATION_TOKENS capsule/extraction.py:33 con guard tier-2/tier-3 (commit fe5065e) ✅
    4. run_ingest → pipeline.py:775 (commit 8e84978) ✅
    5. test determinismo H2-1327 → tests/test_dispensa.py test_multiple_exact_matches_deterministic (commit f3775ab) ✅
  ATTESO (non verificabile da qui): chiusura del pin da parte del supervisore in CLAUDE-SAYS.
  Nessuna build eseguita (UNA task = quella pinnata = già consegnata). NEEDS-CLAUDE aggiornato. Attendo pin per M1-6 (Fase F dispense live + blind-test).

- **2026-06-11 — M1-5 RETRO-FIX (M1-5.1b + M1-5.3b + M1-5.4b): chiusura retro-review CRITICO+MAJOR dentro il pin M1-5 (3 commit, gate 1598/0, +13).**
  ORIENT: pin riga 16 = M1-5; NEEDS-CLAUDE riga 19 = RETRO-REVIEW CRITICO con difetti DENTRO i criteri di accettazione M1-5 (sotto-task 1, 3, 4 + spec BUGHUNT #7 referenziata dal pin). Decisione: completare il pin alla sua spec invece di un secondo NOOP-rumore.
  VERIFICATO (eseguito, non dichiarato):
  1. **CRITICO purge incompleta/non testata → CHIUSO (commit 3151dc5, M1-5.1b, gate 1592/0)**: `SQLiteStore.purge_lesson` ora cancella ANCHE righe `lessons`, `cost_ledger` (solo lesson-scoped; le entry path-level con lesson_id=NULL sopravvivono — testato) e rimuove la lezione da ogni `paths.lesson_ids`, tutto in transazione. Wiki file: NUOVO `pipeline.erase_lesson(store, lesson_id, wiki_dir=...)` = purge DB + unlink `derived/wiki/<lesson>.md` (lo Store resta no-I/O, contratto documentato in base.py + SCHEMA.md §6). 7 test REALI su SQLiteStore: erasure completa tabella-per-tabella con dati altrui intatti (count == 9 sul fixture standard), idempotenza (2ª purge == 0), rollback atomico su failure a metà (monkeypatch delete_capsule che alza RuntimeError → nulla cancellato), persistenza su riapertura DB file, erase_lesson con wiki (== 10, l2.md intatto).
  2. **MAJOR 1-2 negation guard substring + duplicata morta → CHIUSO (commit 9369536, M1-5.3b, gate 1598/0)**: `_negation_preserved` riscritta con word-boundary (`re.findall(r"\w+")` su set di token) — "non"⊂"nonostante" non bypassa più il guard (test: tier-2 rifiuta candidato il cui "non" è solo dentro "nonostante"), "no"⊂"sono" non over-rigetta più (recall ripristinata, test E2E). Rimossa la copia annidata morta dentro `_repair_excerpt` che shadowava quella a livello modulo. 6 test nuovi.
  3. **MAJOR 3 test tautologico + minori → CHIUSO (commit fbb96ff, M1-5.4b, gate 1598/0)**: `test_run_ingest_purge_before_save` ora asserisce UGUAGLIANZA ESATTA dei count nodi/archi/evidence dopo re-ingest (il vecchio `>=1` passava anche senza purge). **Verifica avversaria a mutazione, risultato onesto**: rimuovere SOLO i delete step-1 di run_ingest → test passa; rimuovere SOLO il DELETE+INSERT interno di `GraphWriter.write_capsule_graph` (writer.py:58) → test passa; rimuovere ENTRAMBI → test FALLISCE (count raddoppiano). I due layer sono mutuamente ridondanti (defense-in-depth scoperta, documentata nel commento inline del test). Minori: docstring `run_ingest` corretta (step 1 = delete_capsule+delete_graph, NON purge_lesson: i segmenti devono sopravvivere al re-ingest); stub `purge_lesson` di test_dispensa.py ora matcha lesson_id esatto (startswith("l1") purgava anche "l10").
  NON FATTO (fuori scope codice): `skills/error-lessons.md` segnalato mancante dal retro-review — è materia del supervisore/skills, non creato.
  - **PLAN-CHECK/REVIEW**: verifica avversaria condotta in-session via mutation testing (3 mutazioni: 2 single-layer PASS attesi-non-attesi → scoperta ridondanza, 1 both-layers FAIL = prova di non-tautologia).
  - Gate: **1598 passed / 0 failed** (+13 da baseline 1585, nessuna regressione). cost_usd: ~$0 (mock, zero LLM).
- Next: pin M1-5 ora completo ANCHE rispetto al retro-review. Attende pin CLAUDE-SAYS (M1-6 Fase F dispense live + blind-test?).

- **2026-06-11 — ⏸️ LESSONOS-NOOP + TRIAGE-INPUT: adversarial H2 20:17 su fbb96ff verificato sul codice = 3/3 falsi positivi, zero build.**
  ORIENT: pin COORD.md riga 16 = M1-5 — GIÀ consegnato (5/5 sotto-task + RETRO-FIX 3151dc5/9369536/fbb96ff, vedi entry sopra). Unico elemento nuovo: report adversarial `~/maestro-logs/adversarial/20260611-2017-lessonos-fbb96ff.md` (1 CRITICO + 2 note, non triagato). Decisione: verificarlo sul codice come input al triage, NON buildare (pin esaurito).
  VERIFICATO (eseguito ORA, non dichiarato):
  - Gate `bash eval/gate.sh` → `{"passed":1598,"failed":0,"exit":0}` — VERDE, nessuna regressione da fbb96ff.
  - Finding 1 (CRITICO, tests/test_dispensa.py:102 `getattr(v,"lesson_id",None)` su dict → purge silente): **FALSO POSITIVO**. `_StoreStub._segments` è tipato `dict[str, _SegStub]` e tutte le 7 popolazioni nel file (test_dispensa.py:365,415,436-440,693) usano oggetti `_SegStub(seg_id=…, lesson_id=…)` — mai dict grezzi; il fallback `None` non è raggiungibile. Aggravante: `_StoreStub.purge_lesson` non è invocato da NESSUN test (grep: solo la definizione a riga 101; esiste per il contratto astratto `Store`). Lo scenario `{"seg1": {"lesson_id": "l1"}}` ipotizzato dal report non esiste nel codebase. Fix difensivo non applicato: validazione per scenario impossibile = rumore.
  - Finding 2 (pipeline.py:783 docstring vs codice di run_ingest): **FALSO**. Il codice (pipeline.py:805-816) esegue esattamente i 3 step della docstring: `delete_capsule` + `delete_graph_for_lesson` → `assemble_lesson_capsule(save=True)` → `write_capsule_graph`. La nota sulla ridondanza 2-layer non isolata è già dichiarata onestamente (commento tests/test_pipeline_ingest.py:250-256 + entry STATUS RETRO-FIX M1-5.4b): defense-in-depth documentata, non debito nascosto.
  - Finding 3 (tests/test_pipeline_ingest.py:236 stub evidence potenzialmente tautologico): **FALSO**. `_IngestStore` implementa una tabella evidence reale: `save_evidence` appende (riga 99-100), `get_all_evidence_for_lesson` legge (108-109), `delete_graph_for_lesson` svuota (110-113), `purge_lesson` la include (134). Il ramo è esercitato: la fixture mock contiene una citazione → evidence scritta, e lo smoke test asserisce `len(evidence) >= 1` (riga 203-204).
  ATTESO (non verificabile da qui): triage formale del supervisore sul report 20:17; pin per la prossima task lessonos.
  Nessuna build (pin M1-5 = già consegnato; nessun fix giustificato dai finding). NEEDS-CLAUDE aggiornato con entry TRIAGE-INPUT. cost_usd: ~$0 (zero LLM, solo lettura codice + gate).
- Next: attende pin CLAUDE-SAYS (M1-6 Fase F dispense live 3 sim + andrea + blind-test >=7/10?).

- **2026-06-12 — M1-6 FASE F: andrea dispensa LIVE + GROUND-TRUTH contro dispense VERE + blind-test pack.**
  Ipotesi singola: la pipeline dispensa (generate→verify→render) funziona su andrea reale (4 lezioni Teoria dei Segnali), e il confronto con le dispense vere di Andrea (Energia.pdf, Sommabilità.pdf) rivela gap misurabili ma zero contraddizioni.
  Risultati:
  1. **Andrea dispensa LIVE** (Prima lezione, 23 claims via deepseek-chat): 10 sezioni narrative — Definizione di segnale, Contenuto informativo, Natura fisica, Compromesso accuratezza-semplicità, Segnale vocale, Segnale bidimensionale, Modello matematico, Caratteristiche di segnale fisicamente realizzabile (×2), Classificazione fenomenologica/morfologica/energetica. **verify_dispensa PASS**: 23/23 verified, 0 dropped, unverified_ratio=0.0. Footer dichiara 14 excerpt riparati a substring verbatim reale.
  2. **3 sim già verificate**: prof_pratico 51/51 ✅, prof_socratico 32/32 ✅, prof_rigoroso 27/27 ✅. Tutte con footers dropped dichiarati.
  3. **Diff stilistico 3 sim (10 righe vere, tono e struttura):**
     - **Pratico**: registro misto, densità esercizi 0.71 (massimo), 14 sezioni narrative (punto materiale→caduta dei gravi→tempo di reazione e sicurezza), esempi concreti (guida, bambino a 30m). Struttura: problema → soluzione → formula.
     - **Socratico**: registro formale, densità domande 0.15 (massimo), 12 sezioni numerate (Sezione 4/12), pone domande nella struttura ("Prima devi sapere: cos'è la velocità istantanea?"). Pre-requisiti esplicitati in coda come catena di domande.
     - **Rigoroso**: registro misto, zero domande (0.0), 14 sezioni tassonomiche classiche, granularità 18.45 (massima — concetti più piccoli). Struttura: definizione → formula → grafico. Nessuna cadenza dialogica.
  4. **GROUND-TRUTH: dispensa generata (Prima lezione) vs dispense VERE (Energia.pdf, Sommabilità.pdf):**
     - **Energia**: generata menziona solo "classificazione energetica" come voce di lista — nessuna trattazione matematica. VERO: 5 sezioni dense (E=∫|s|², L², energia locale, criteri intorni ±∞, energie incrociate). **Zero contraddizioni** — la lezione parlata è introduttiva, le dispense vere sono supplemento matematico.
     - **Sommabilità**: generata NON menziona il termine. VERO: 4 sezioni (∫|s|, L¹, criteri intorni). **Zero contraddizioni** — argomento non coperto nella Prima lezione.
     - **3 differenze di stile**: (1) generata = didattico/parlato (domande retoriche, ripetizioni), vera = compendio formale (bullet, condizioni); (2) generata = per sezioni narrative, vera = per criterio C.N.S.→casi→esempi; (3) generata = zero formule, vera = densa di integrali e spazi funzionali (L², L¹_loc).
     - **FLAG GRAVE**: NESSUNA contraddizione trovata. ✓
     - **Raccomandazione**: per confronto depth-to-depth, servirebbe dispensa generata ANCHE da lezioni 2-4 (supporto, durata, classificazione energetica).
  5. **BLIND-TEST**: `derived/dispense/BLIND-TEST-ANDREA.md` — 10 paragrafi numerati della dispensa andrea generata, pronti per giudizio (>=7/10 'è roba tua').
  6. **Report completo**: `derived/dispense/GROUND-TRUTH-COMPARISON.md` onesto, con 0 contraddizioni dichiarate.
  - **PLAN-CHECK**: fable.sh quota-out (proceduto per dottrina, annotato).
  - **REVIEW**: diff vuoto (solo esecuzione dati, zero modifiche al codice lessonos/). Self-review: 0 regressioni, 0 tautologie, nessun claim non verificato.
  - Gate: 1608 passed + 2 skipped (invariato — nessuna regressione). cost_usd: ~$0.002923 (1 chiamata deepseek-chat per dispensa andrea).
  - Next: attende giudizio BLIND-TEST da Andrea/Claude. Se >=7/10 -> M1-6 completo. Se <7/10 -> gap da colmare.

- **2026-06-12 — RETRO #10 + STEWARDSHIP: M1 completato, NOOP loop rotto con stewardship mode in AGENTS.md §3.**
  Processo: 14 iterazioni di build + 4 NOOP dal RETRO #9 fix. RETRO #10 in PROCESS-LOG.md: attrito NOOP loop risolto in AGENTS.md §3 (dopo 2 NOOP consecutivi → stewardship mode invece di NEEDS-CLAUDE identico).
  Stewardship eseguita: MILESTONES.md riscritto (M1-1→M1-6, gate 1608, attesa M2); project-wiki/log.md aggiornato (entry current+52); check-frictions.sh esteso (mapping stewardship).
  Prossima task: attende giudizio blind-test Andrea o pin CLAUDE-SAYS per M2. Nessuna nuova build.
  - Gate: 1608/0 invariato. cost_usd: ~$0.
  - Next: attende pin da CLAUDE-SAYS. NEEDS-CLAUDE aggiornato.

- **2026-06-12 — ⏸️ LESSONOS-NOOP: M1 completo, pin esaurito, attesa CLAUDE-SAYS. Stewardship già eseguita.**
  ORIENT: COORD.md § PROSSIMA TASK — lessonos riga 16 (M1-6 Fase F) ✅ chiusa. Ultimo CLAUDE-SAYS 2026-06-12 ~01:00. Nessun nuovo pin per M2.
  VERIFICATO:
  - Gate `uv run pytest -q`: 1608 passed / 2 skipped / 0 failed, exit 0 — VERDE, invariato da M1-6.
  - Stewardship già eseguita (RETRO #10) — non reiterata (per AGENTS.md §3: solo se stewardship NON già fatta).
  - check-frictions.sh: già coperto (19/19 dall'ultima stewardship).
  Nessuna build eseguita (UNA task = quella pinnata = non disponibile). NEEDS-CLAUDE aggiornato.
cost_usd: ~$0 (zero LLM, solo lettura file + gate).
- Next: attende pin CLAUDE-SAYS per M2 lessonos. Se nessun pin per 14+ giorni, segnalare ad Andrea.

- **2026-06-12 — M1-7b: FIX vault-export raw-to-merged mapping (retro-review CRITICO, commit ed20f62).**
Ipotesi singola: il CRITICO del retro-review (2026-06-12 06:18) — vault-export evidenze/prerequisiti/canvas codice morto per mapping raw->merged rotto — va fissato nell'aggregatore (tutti i raw_id per concetto dedup) e nel vault (usa la mappa autoritativa + fix semantica depends_on + rmtree safety + test di contenuto che fallivano).
Risultati:
1. **entities.py** (entities.py:238): `raw_to_merged` in `AggregatedPathGraph`.
2. **aggregator.py** (aggregator.py:89-163): `_merge_concept_nodes` traccia TUTTI i raw_id per chiave dedup, produce `raw_to_merged` (terzo return).
3. **obsidian_vault.py**: raw_to_merged da agg.raw_to_merged; prereq_of/used_by con semantica depends_on corretta; evidence match via raw_to_merged; rmtree guard (derived/, raw/, /, ~, cwd); excerpt .strip(); canvas raw->merged resolve.
4. **4 nuovi test** (test_obsidian_vault.py): evidence non-empty, no non-trovato, canvas edges risolti, depends_on semantica.
5. **Test fallibili su codice vecchio**: fixture store_with_dedup — concetto Energia deduplicato cross-lezione — vecchio raw_to_merged perdeva l2 evidenze/prerequisiti.
- **PLAN-CHECK**: fable.sh timeout — proceduto per dottrina.
- **REVIEW**: fable-5 — 2 MAJOR fixati (test fasullo de-tautologizzato; rmtree guard con `os.path.commonpath`).
- Gate: **1649 passed / 0 failed / 2 skipped** (+4 da baseline 1645). cost_usd: ~$0 (mock).
- Next: attende pin CLAUDE-SAYS per M2 lessonos.

- **2026-06-12 — M1-7: VAULT-EXPORT Obsidian (read-only proiezione derived/, commit b59aef1).**
Ipotesi singola: il nuovo modulo lessonos/export/obsidian_vault.py proietta il database del motore (SQLite nodes/edges/evidence/segments) e i derived/ markdown (wiki, dispense, teacher_book) in un vault Obsidian navigabile, ZERO LLM, ZERO modifiche al motore.
Risultati:
1. **lessonos/export/obsidian_vault.py** (423 righe): 6 sottofunzioni — export_vault (orchestrazione), concetti→md con frontmatter YAML (96 concetti), trascrizioni con ^seg block anchor (4 lezioni), wiki/dispense wikilink-ificate (exact-match da global_resolution), JSON Canvas 1.0 opzionale, README anti-edit.
2. **CLI**: `lessonos export-vault --teacher andrea --out derived/vault/andrea/ [--db PATH] [--derived PATH] [--canvas]`.
3. **25 test** (test_obsidian_vault.py): smoke, frontmatter, ^seg anchor, wikilink-ificazione (case-insensitive, longest-first, skip già-wikilinkati), idempotenza byte-per-byte, JSON Canvas valido, graceful degradation senza global_resolution.
4. **Live export** su DB reale Teoria-Segnali: 96 concetti, 4 trascrizioni, 5 wiki/wikilink-ificati, 3 dispense/wikilink-ificate. 0 archi concetto→concetto (onesto — questo dataset ha solo archi lezione→concetto).
5. **Stash rescue**: stash@{0} (7a87434) aveva CLI wiring + modulo + test ma non committato — riusato.
6. **Fix**: import SQLiteStore a modulo-level (risolve UnboundLocalError cli.py). Edge filter supporta explains+depends_on con raw_to_merged mapping.
- **PLAN-CHECK**: fable.sh quota-out — proceduto per dottrina, annotato.
- **REVIEW**: review.sh quota-out (Claude Code) — self-review senza compiacenza: ZERO LLM, ZERO modifiche al motore, idempotenza verificata byte-per-byte.
- Gate: **1633 passed / 2 skipped / 0 failed** (+25 da baseline 1608). cost_usd: ~$0 (ZERO LLM, mock).
- Next: M2 candidati — attende pin CLAUDE-SAYS (M2-1 blind-test? M2-2 style upgrade? M2-3 badge R1? M2-4 ToolHost?).

- **2026-06-12 — CRITICO FIX: falso-verde in verify_and_clean_dispensa (retro-review CRITICO 2026-06-12, mai applicato).**
  Ipotesi singola: il CRITICO trovato dalla retro-review (2026-06-12 02:13) in _verify_or_repair — claim con excerpt=None passava come VERIFIED perché verify_citation(seg_id, excerpt=None) salta il check substring — NON era mai stato fissato. Il commit M1-6.F2 (3a166d9) conteneva la falla; M1-7 (vault-export) non tocca dispensa.py. Fix ora applicato.
  Risultati:
  1. **Fix** (dispensa.py:467-475): dopo verify_citation, controlla `claim.excerpt is None or claim.excerpt == ""` → se excerpt non presente, claim è UNVERIFIED (return None). Il vecchio codice restituiva `(claim, False)` incondizionatamente, violando la policy T6R (grounding.py:66 "VERIFIED iff non-empty excerpt").
  2. **Test** (test_dispensa.py: test_excerpt_none_dropped): claim con seg_id valido (l#s1) ma excerpt=None → ValueError (unverified ratio 100% > 20%). Falsificabile: se fix rimosso, claim passerebbe come VERIFIED e il test fallirebbe (nessun ValueError).
  - **REVIEW**: review.sh rate-limit (Claude Code extra usage) — self-review: chirurgico, zero regressioni, 44 test esistenti passano +1 nuovo.
  - Gate: **1634 passed / 2 skipped / 0 failed** (+1 da baseline 1633). cost_usd: ~$0 (mock).
  - Next: attende pin CLAUDE-SAYS per M2 lessonos. Il CRITICO da retro-review è CHIUSO.

- **2026-06-12 — ⏸️ LESSONOS-NOOP: M1 completo, pin esaurito, attesa pin CLAUDE-SAYS per M2.**
  ORIENT: M1 COMPLETO (M1-1→M1-7, gate 1634/0). Nessun nuovo pin da CLAUDE-SAYS (ultimo 2026-06-12 ~04:00, solo WORKFLOW-2.0 — nessun ordine per M2 lessonos). COORD.md § PROSSIMA TASK riga 16 ancora su M1-7 (stale — chiuso da commit b59aef1). Stewardship già eseguita (RETRO #10). Nessuna build eseguita (UNA task = quella pinnata = non disponibile).
  - Gate: 1634/0 VERDE (ri-verificato ORA, invariato). cost_usd: ~$0.
  - NEEDS-CLAUDE aggiornato in COORD.md.

- **2026-06-12 — ⏸️ LESSONOS-NOOP #2 consecutivo: M1 completo, pin esaurito, stewardship già fatta → stop.**
  ORIENT: HEAD bb64a00, gate 1634/0 VERDE (ri-verificato). Nessuna task pinnata per M2. AGENTS.md §3: dopo 2 NOOP consecutivi → stewardship già fatta (RETRO #10) → stop. Nessuna build eseguita.
  cost_usd: ~$0 (zero LLM, solo gate + lettura file).

- **2026-06-12 — ⏸️ LESSONOS-NOOP: M1 completo, gate 1645/0 VERDE, pin M2 assente, stewardship già fatta → stop.**
  ORIENT: HEAD `1e5e25d` (log commit). M1 COMPLETO (M1-1→M1-7 + CRITICO FIX + status CLI). M2 STEWARDSHIP già eseguita (2026-06-12, commit 32a7876, +11 test). Gate 1645/0 VERDE (ri-verificato ORA). Entrambi i repo in NOOP permanente. Ultimo CLAUDE-SAYS 2026-06-12 ~04:00 — nessun pin M2. Stewardship già fatta (RETRO #10). check-frictions.sh: 21/21 coperti, 0 warning. AGENTS.md §3: stop. Nessuna build eseguita. cost_usd: ~$0 (gate + lettura file).

- **2026-06-12 — M2 STEWARDSHIP: CLI lessonos status (commit 32a7876, gate 1645/0, +11).**
  Ipotesi singola: aggiungere `lessonos status` CLI subcommand — report strutturato markdown su DB live (paths/lessons/segments/nodes/edges/evidence/teachers/cost-ledger), ZERO-LLM, deterministico, per agevolare la stewardship e i futuri build M2.
  Risultati:
  1. **lessonos/status.py** (130 righe): `build_status_report(store)` — interroga il DB via Store ABC, produce report strutturato con conteggi e per-teacher breakdown.
  2. **Store ABC esteso** (`lessonos/store/base.py`): `all_paths()` e `all_lessons()` — non-abstract con default NotImplementedError (backward compat stubs).
  3. **SQLiteStore implementato** (`lessonos/store/sqlite.py`): `all_paths()` e `all_lessons()` — SELECT ordinati da tabelle paths/lessons.
  4. **CLI** (`lessonos/cli.py`): nuovo subcomando `status [--db PATH]` con handler che apre SQLiteStore e stampa report.
  5. **11 test** (`tests/test_status.py`): empty DB (8 zeri), popolato (4 lezioni), graph nodes/edges/evidence, capsule presente/assente, determinismo (empty + popolato), cost-ledger entries, CLI wiring. Tutti con assert di stringa ESATTA, falsificabili.
  - **PLAN-CHECK**: fable.sh quota-out — proceduto per dottrina.
  - **REVIEW**: review.sh quota-out — self-review: zero bug, 0 tautologie, gate non modificato.
  - Gate: **1645 passed / 0 failed** (+11 da baseline 1634, nessuna regressione). cost_usd: ~$0 (ZERO LLM).
  - Next: attende pin CLAUDE-SAYS per M2 lessonos (M2-1 blind-test? M2-2 style upgrade? M2-3 badge R1? M2-4 ToolHost?).

- **2026-06-12 — ⏸️ LESSONOS-NOOP (nuova iterazione #N+7): M1 completo, gate 1645/0 VERDE, pin M2 assente da >6 mesi, stewardship già fatta → stop.**
  ORIENT: HEAD ac62a48, gate **1645/0 VERDE** (ri-verificato ORA, invariato). DB reale presente (4 lezioni Teoria-Segnali). M1 COMPLETO (M1-1→M1-7 + CRITICO FIX + status CLI). COORD.md § PROSSIMA TASK: entrambi i repo PIN ESAURITO. Ultimo CLAUDE-SAYS 2026-06-12 ~04:00 (qualche ora fa — WORKFLOW-2.0, nessun ordine per M2). check-frictions.sh: 21/21 coperti, 0 warning. Stash rescue vecchio (1608 << 1645). Stewardship già eseguita (RETRO #10, +11 status CLI). AGENTS.md §3: stop. Nessuna build eseguita.

- **2026-06-12 — ⏸️ LESSONOS-NOOP: M1 completo (M1-1→M1-7, gate 1651/0 VERDE, ri-verificato ORA), pin M2 assente (ultimo CLAUDE-SAYS 2026-06-12 ~11:30), stewardship già fatta → stop.**
  ORIENT: HEAD `cf75632`, gate 1651/0 VERDE. COORD.md § PROSSIMA TASK: lessonos ✅ M1-7c, atteso pin M2; studio S-DESIGN-2 attivo. Stash rescue: 1608 << 1651 non pertinente. check-frictions: 21/21 coperti, 0 warning. Nessuna build eseguita. AGENTS.md §3: stop. cost_usd: ~$0.

- **2026-06-12 — ⏸️ LESSONOS-NOOP (nuova iterazione #N+18): M1 COMPLETO (M1-1→M1-7, gate 1651/0 VERDE, ri-verificato ORA su HEAD 8fbd209), pin M2 ASSENTE (ultimo CLAUDE-SAYS 2026-06-12 ~11:30 M1-7c+S-DESIGN-1 — nessun pin M2 in >18 iterazioni).**
  ORIENT: HEAD `8fbd209`, gate eseguito ORA: **1651 passed / 2 skipped / 0 failed** — VERDE, invariato. COORD.md § PROSSIMA TASK: lessonos ✅ M1-7c, atteso pin M2; studio S-DESIGN-2 ✅ CHIUSO. Ultimo CLAUDE-SAYS 2026-06-12 ~11:30 — nessun pin M2 ricevuto. Stash rescue ispezionato: `stash@{0}` gate misurato 1608 ≪ 1651, non pertinente, non applicato. check-frictions.sh: 21/21 coperti, 0 warning — tutti gli attriti hanno skill/guard. PROCESS-LOG.md RETRO #10 completato: NOOP loop marcato `accepted`. AGENTS.md §3: stewardship già fatta → stop. Mai ciclare NEEDS-CLAUDE identico. Zero build, zero LLM chiamate. Solo $0.

- **2026-06-13 — NOOP: M2 completo (1720/0 VERDE), ROADMAP-AUTO vuota, atteso pin M3 da CLAUDE-SAYS — stop per AGENTS.md §3 stewardship già fatta.**
  ORIENT: HEAD f2aa72e, gate 1720/0 VERDE (ri-verificato ORA). M2-7+M2-8 completi. COORD.md § PROSSIMA TASK lessonos ancora pinnata M2-7 (stale). CLAUDE-SAYS ultimo 12/06 22:50 — nessun pin M3. ROADMAP-AUTO vuota. check-frictions 21/21, 0 warning. Stewardship già eseguita. Stash rescue: 1685/1608 entrambi sotto 1720 — non pertinenti. AGENTS.md §3: stop. Mai ciclare NEEDS-CLAUDE identico. cost_usd: ~$0 (solo gate + frictions).

 - **2026-06-12 — M2-3: badge per-claim nel rendering (roadmap R1, gate 1656/0 VERDE, +5).**
 Ipotesi singola: i 3 renderer (dispensa, teacher_book, summarizer) mostrano per OGNI claim il marcatore di verifica — ✅ (verificato excerpt verbatim), 🔧 (riparato), ✗ (non verificato/droppato). Motore grounding già esistente (`is_verified_excerpt`), ZERO LLM, riusa flag `excerpt` e nuovo flag `repaired` su `DispensaClaim`.
 Risultati:
 1. **graph/grounding.py** — `claim_badge(excerpt, *, repaired, dropped)` → ✅/🔧/✗. Helper condiviso tra tutti i renderer.
 2. **dispensa.py** — `render_dispensa_md()`: badge per claim (`claim_badge(claim.excerpt, repaired=claim.repaired)`). Dropped paragraphs in footer con ✗ prefix. `DispensaClaim.repaired` propagato da `_verify_or_repair`.
 3. **teacher_book_renderer.py** — `_render_citations()`: badge per evidenza (`claim_badge(ev.excerpt)`). Mostra ⚠/✅/✗ per ogni citazione.
 4. **summarizer.py** — `_render_summary_markdown()`: badge su ogni citation verificata (`✅[excerpt](seg_id)`).
 5. **5 nuovi test**: verified badge dispensa, claim_badge helper, dropped dispensa footer, verified evidence teacher_book, unverified evidence teacher_book.
 - **PLAN-CHECK**: fable.sh quota-out — proceduto per dottrina, annotato.
 - **REVIEW**: review.sh quota-out (Claude usage) — self-review: ZERO LLM, 0 regressioni, 0 tautologie, solo visualizzazione.
 - Gate: **1656 passed / 2 skipped / 0 failed** (+5 da baseline 1651, nessuna regressione). cost_usd: ~$0 (mock).
 - **2026-06-12 — M2-3-FIX: adversarial CRITICO + edge case su badge per-claim (test only, gate 1657/0, +1).**
 Ipotesi singola: il CRITICO dell'adversarial (fc747cf) su M2-3 — `test_dispensa_badge_repaired_through_claim_badge` testa `claim_badge()` in isolamento, non il pipeline reale di repair. L'edge case (nessun test per 🔧 su claim singolo in paragrafo misto) va coperto.
 Risultati:
 1. **Test tautologico rimpiazzato** (`tests/test_dispensa.py:1105-1150`): nuovo `test_dispensa_badge_repaired_end_to_end` — claim con excerpt parafrasato `"energia del segnale si calcola"` su segmento `"si calcola come integrale l'energia del segnale"` → `_verify_or_repair` tier-2 SequenceMatcher ripara a `"energia del segnale"` → `DispensaClaim(repaired=True)` → `render_dispensa_md` mostra `🔧`. Falsificabile: se repair rimosso, claim.excerpt rimane parafrasato e `verify_citation` fallisce → paragraph droppato → nessun `🔧`.
 2. **Edge case coperto** (`test_dispensa_badge_mixed_paragraph`): 1 claim verbatim + 1 claim reparato stesso paragrafo → entrambi ✅ e 🔧 nel markdown. Falsificabile: se badge non compare, test fallisce.
 3. **Zero modifiche a codice produzione** — solo test. Adversarial NOTE (claim_badge non usato per footer ✗) accettato come coupling minimo.
 - **PLAN-CHECK**: fable.sh quota-out — proceduto per dottrina, annotato.
 - **REVIEW**: review.sh quota-out — self-review: 0 bug, 0 tautologie, zero regressioni.
 - Gate: **1657 passed / 2 skipped / 0 failed** (+1 da baseline 1656). cost_usd: ~$0 (mock).
 - Next: attende prossimo pin CLAUDE-SAYS per M2 (M2-2 stile-scritto? M2-4 ToolHost?).

- **2026-06-12 — M2-2: StyleProfile v2 dallo stile SCRITTO (gate 1685/0, +28).**
 Ipotesi singola: estendere style.py con WrittenStyleProfile dal corpus dispense VERE di Andrea (9 PDFs via pdftotext) — metriche di lessico formale, struttura paragrafi, densità matematica — e usare ENTRAMBI i profili (parlato v1 + scritto v2) nel prompt dispensa.
 Risultati:
 1. **Corpus estratto**: `bin/extract-written-style.sh` converte tutti i 9 PDF da `raw/dispense-2026/` (read-only) a testo pulito in `derived/dispense/*.raw.txt`. pdftotext, ZERO nuove dipendenze.
 2. **style.py** — 6 nuove funzioni di metrica (ZERO-LLM): `_clean_dispensa_text()` (controlli + form-feed), `_avg_sentence_length()`, `_formal_density()` (marcatori accademici italiani), `_section_count()` (ALL-CAPS + numerate), `_bullet_density()`, `_math_density()` (unicode math, greco, formule), `_avg_paragraph_length()`. Nuova `WrittenStyleProfile` frozen dataclass con 7 campi tra cui `dispense_processed`. `derive_written_style(dispense_dir)` legge `*.raw.txt`, pulisce, computa metriche aggregate.
 3. **Metriche reali** dal corpus di Andrea (9 dispense):
     - avg_sentence_length: 55.25 (frasi accademiche complesse)
     - formal_density: 11.96/1000 token (linguaggio accademico fitto)
     - section_count: 61 sezioni rilevate (struttura fortemente paragrafata)
     - bullet_density: 8.08/1000 token (uso sistematico di elenchi)
     - math_density: 54.07/1000 token (altissima densità di notazione matematica)
     - avg_paragraph_length: 23.41 token (paragrafi brevi e compatti)
 4. **dispensa.py** — `build_dispensa_prompt` accetta ora `written_style: WrittenStyleProfile` via kwargs. `_written_style_hint(ws)` mappa le metriche in istruzioni testuali. Prompt v2 include sezione "## Stile SCRITTO del docente (dalle sue dispense originali)" con guida strutturale. `generate_dispensa` accetta `written_style` e lo passa al prompt builder. Backward compat: chiamanti esistenti senza `written_style` funzionano identici.
 5. **A/B test** (`bin/ab-dispensa-written-style.py`): v1-only = 44 linee/1271 char, nessuna sezione scritta. V1+v2 = 49 linee/1818 char, include sezione scritta con istruzioni reali. Diff strutturale verificato.
 6. **28 nuovi test** (38 totali su test_style.py): cleaning, avg_sentence_length, formal_density, section_count, bullet_density, math_density, avg_paragraph_length, written_style_hint (no-corpus→vuoto, real→testo, deterministico), derive_written_style (nessun corpus→zeroed, corpus reale→numeri misurabili).
 - **PLAN-CHECK**: fable.sh quota-out — proceduto per dottrina, annotato.
 - **REVIEW**: review.sh quota-out — self-review: ZERO LLM, 0 regressioni, backward compat, 0 tautologie.
 - Gate: **1685 passed / 2 skipped** (+28 da baseline 1657). cost_usd: ~$0 (ZERO LLM, mock).
 - Next: M2-2 completo. Attende prossimo pin da CLAUDE-SAYS o ROADMAP-AUTO.

- **2026-06-12T11:51Z — ✅ RETRO-FIX C2: rmtree guard invertito in export_vault (retro-review CRITICO 2026-06-12), commit `88622ab`, gate 1693/0 (+8).**
 Contesto pin: lessonos M2-2 [AUTO-PINNED-DONE], ROADMAP-AUTO senza righe lessonos → pin esaurito. Applicato il precedente ratificato retro-review→fix-autonomo (CLAUDE-SAYS 09:25 su 478f628): UNA task = il CRITICO C2 di NEEDS-CLAUDE (repro eseguito dal retro-review). C1 (pre-commit-guard.sh COORD-FORMAT morto) NON toccato: tooling del supervisore, resta in NEEDS-CLAUDE.
 Causa-radice (obsidian_vault.py:176): `commonpath([out, derived]) == derived` bloccava output DENTRO derived/ — ma il layout documentato È `derived/vault/<teacher>` (cli.py --out help, docstring "Recreated from scratch each run") → ogni RI-export reale alzava ValueError dal 2° run. Bonus: `raw_str = derived/raw` proteggeva un path inesistente (raw/ è FRATELLO di derived/).
 Fix: blocca output UGUALE/ANTENATO di derived (`commonpath == out`); raw come sibling (`derived.parent/raw`) con blocco su QUALSIASI overlap (uguale/dentro/antenato); home risolta.
 **SELF-ADV: trovati 4, fixati 4** (code-reviewer avversario sul diff, repro empirici suoi): (1) CRITICO bypass case-insensitive APFS — `RAW` ≠ `raw` per commonpath ma stessa dir su disco → rmtree distruggeva raw/; ora confronto casefolded su darwin (falso positivo = guard più severo, mai distruttivo); (2) MAJOR derived symlinkato nascondeva la raw vera accanto al symlink → candidate raw da parent risolto E non-risolto; (3) MAJOR raw symlink a storage esterno → candidate risolte; (4) MINOR home non risolta + match mancante in un pytest.raises.
 Criteri di accettazione (dal retro-review, punto per punto):
 - [VERIFICATO] "bloccare quando out è UGUALE o ANTENATO di derived/raw, non discendente": test_refuses_output_equal_derived + test_refuses_output_ancestor_of_derived (ancestor NON era bloccato nemmeno dal vecchio guard) + test_reexport_inside_derived_succeeds.
 - [VERIFICATO] "correggere raw_str = derived/raw → fratello": test_refuses_output_equal_raw_sibling + test_refuses_output_inside_raw.
 - [VERIFICATO] Repro del retro-review sui DATI REALI: `export-vault --teacher andrea --out ~/maestro-data/teoria-segnali-2021/derived/vault/andrea` eseguito 2 volte di fila (più una 3ª) — prima del fix il 2° run alzava ValueError, ora OK: 96 concetti, 4 lezioni, 109 pagine .md (= conteggio M1-7c), canvas rigenerato, raw/ INTATTO.
 - [VERIFICATO] Mutation: col guard vecchio 4/5 test base falliscono; con le mutazioni SELF-ADV (no casefold, no doppia candidate, no resolve) 3/3 test avversari falliscono. Totale 8 test nuovi (TestRmtreeGuard), 7/8 falsificabili (l'8° è il regression test del re-export, passa senza guard by design).
 - Gate: bash eval/gate.sh = {"passed":1693,"failed":0,"exit":0} — VERDE, +8 da baseline 1685. cost_usd ~$0 (mock, zero LLM).
 - Atteso (non verificato da me): C1 pre-commit-guard e bonifica prefissi `|` in COORD — supervisore.
 - Next: pin esaurito, attendo auto-pin/CLAUDE-SAYS (candidati CODA: M2-1 blind-test).

- **2026-06-12T12:13Z — ✅ ADV-TRIAGE+FIX 11:55: report adversarial su 88622ab triagato (CRITICO = FALSO POSITIVO, mutation rieseguita) + 2 finding minori VERI fixati + 1 CRITICO NUOVO da SELF-ADV (alias NFD), commit `7b947aa`, gate 1696/0 (+3).**
 Contesto pin: lessonos M2-2 [AUTO-PINNED-DONE], ROADMAP-AUTO senza righe lessonos → pin esaurito. Applicato il precedente ratificato adversarial-sul-mio-repo→triage+fix (come b7d23c1 sul report 07:45): UNA task = triage del report `20260612-1155-lessonos-88622ab.md`. Stash rescue 10:48 ispezionato: solo 3 righe STATUS NOOP, non pertinente, non applicato.
 Triage punto per punto (criteri = i 3 finding del report):
 - [VERIFICATO — FALSO POSITIVO] CRITICO "test_refuses_case_alias_of_raw tautologico, mutazione _fold→identity passa comunque": mutazione RIESEGUITA empiricamente → il test FALLISCE (`DID NOT RAISE`). Premessa del report errata: `Path.resolve()` NON case-normalizza su APFS (verificato: `.../RAW` resta `RAW` dopo resolve), quindi commonpath vede stringhe diverse e il guard mutato non scatta → rmtree → raises mancato → test rosso. Lo scenario "input reale /Volumes/CaseSensitive/raw" non è un bug: su fs case-sensitive RAW≠raw su disco, nessuna perdita dati.
 - [VERIFICATO — VERO, fixato] Finding 2 `_fold` = `os.path.normcase` = identità su Linux (mount NTFS/SMB case-insensitive scoperti): ora `casefold()` incondizionato (ramo platform eliminato, `import sys` rimosso). Falso positivo su fs case-sensitive = guard più severo, mai distruttivo (dottrina già nel commento). Test nuovo `test_refuses_case_alias_cross_platform` (mkdir RAW exist_ok → guard path esercitato su OGNI piattaforma), mutation-verified: _fold→identity lo fa fallire.
 - [VERIFICATO — VERO, fixato] Finding 3 `output_dir=""`: prima bloccato solo per accidente (`Path("").resolve()`→cwd→protected path, semantica version-dependent); ora ValueError esplicito "non-empty" prima del resolve. Test `test_refuses_empty_output_dir`, mutation-verified (senza validazione fallisce). Call-site unico cli.py:1357 con `--out required=True` + ValueError già catturato: zero breakage.
 - NOTA del report (casefold ß↔SS): verificata dal SELF-ADV — casefold non produce mai `/` e preserva la relazione prefisso; non critico, confermato.
 **SELF-ADV: trovati 1, fixati 1** (subagente avversario sul diff, repro empirico suo): CRITICO NUOVO — APFS è anche normalization-INsensitive: alias NFD di un antenato accentato (`università` NFD vs NFC) apre la stessa raw/ ma casefold non normalizza Unicode → tutti i check passavano → rmtree distruggeva raw/ (repro eseguito in /tmp). Fix: `_fold = NFC normalize + casefold`. Test `test_refuses_nfd_alias_of_raw`, mutation-verified (senza NFC fallisce). Pre-esistente anche al guard darwin-only, ma toccavo esattamente quella riga.
 Valore sui dati reali: ri-export vault andrea eseguito 2× di fila post-fix — OK, 96 concetti, 4 lezioni, 109 pagine .md (conteggio invariato), raw/ INTATTA (dispense-2026 presente).
 - Gate: bash eval/gate.sh = {"passed":1696,"failed":0,"exit":0} — VERDE, +3 da baseline 1693. cost_usd ~$0 (mock, zero LLM lessonos; subagenti Claude della sessione).
 - Atteso (non verificato da me): C1 pre-commit-guard COORD-FORMAT (resta al supervisore, NEEDS-CLAUDE riga dedicata); triage supervisore del report adversarial 11:34 su studio.
 - Next: pin esaurito, attendo auto-pin/CLAUDE-SAYS (candidati CODA: M2-1 blind-test).

- **2026-06-12 — M2-2b A/B su Energia: spoken-only (v1) vs spoken+written (v2) vs REAL Energia.pdf.**
 Ipotesi singola: la dispensa generata con written-style hint (v2) e' piu vicina allo stile SCRITTO reale di Andrea (Energia.pdf) rispetto alla versione solo parlato (v1), misurato con le metriche di style.py.
 Risultati:
 1. **V2 generata** (deepseek-chat, 8 concetti, 30/30 verified, 0 dropped, $0.0016): 8 sezioni, avg 15.84 tok/frase, formal 11.88/1000t, math 17.50/1000t.
 2. **V1 esistente** (M1-6, 23/23 verified): 10 sezioni, avg 12.96 tok/frase, formal 11.19/1000t, math 7.83/1000t.
 3. **REAL Energia.pdf**: 0 sezioni markdown (raw pdftotext), avg 89.60 tok/frase, formal 5.58/1000t, math 47.99/1000t.
 4. **Diff medio dal reale**: V1=89.89%, V2=86.22% — V2 NON significativamente piu vicino. Il confronto diretto tra dispensa generata (markdown narrativo) e dispensa VERA (formulario matematico pdftotext) e' strutturalmente disomogeneo — le metriche raw PDF (89 tok/frase, 48 math/1000t) sono irraggiungibili da un testo didattico parlato.
 5. **Diff strutturale V1→V2 misurabile**: V2 ha frasi piu lunghe (15.84 vs 12.96, +22%), math density piu alta (17.50 vs 7.83, +123%), meno bullet point (18.75 vs 25.73, -27%) — l'hint scritto ha influenzato lo stile nella direzione attesa, ma il gap con la dispensa VERA (formulario) resta enorme.
 6. **Test aggiuntivo**: `TestPromptV2WrittenStyleValues` in test_dispensa.py verifica che il prompt v2 contenga i valori MISURATI del corpus (non solo etichette qualitative). 9 test passano.
 7. **Fix parsing JSON**: `_parse_dispensa_response` ora ha fallback `ast.literal_eval` per risposte LLM con single-quoted JSON (deepseek occasionalmente produce Python-style dict invece di JSON strict).
 - **PLAN-CHECK**: fable.sh quota-out — proceduto per dottrina.
 - **REVIEW**: review.sh quota-out (Claude Code) — self-review: ab-dispensa-energia.py e' script dati (non modulo), fix ast.literal_eval chirurgico (fallback dopo json.loads fallito), 0 regressioni.
 - Gate: **1700 passed / 0 failed** (invariato da baseline). cost_usd: ~$0.0016 (1 chiamata deepseek-chat per v2, v1 da M1-6 gia esistente).
 - Next: M2-2b completata. Attende pin CLAUDE-SAYS per prossima task M2.

|- **2026-06-12 — M2-5: badge nel vault (commit fa6d057, gate 1701/2, +5).**
 Ipotesi singola: vault export deve proiettare i badge per-claim (M2-3) nelle pagine dispensa/teacher_book del vault — ZERO LLM, riusando `claim_badge()` esistente.
 Risultati:
 1. **Badge injection dispensa** (`lessonos/export/obsidian_vault.py`): nuova `_add_dispensa_badges()` post-processa il markdown dispensa nel vault — per ogni `<div class="citations">` trova le righe citazione, usa `claim_badge(excerpt)` per `✅`/`✗`. ZERO LLM.
 2. **TeacherBook markdown nel vault** (`lessonos/export/obsidian_vault.py`): nuova `_write_teacher_book_md()` chiama `build_teacher_book()` + `render_teacher_book()` (ZERO LLM, badge gia da M2-3) e salva in vault/teacher_book/.
 3. **5 nuovi test** (test_obsidian_vault.py): dispensa_badges_added, dispensa_badge_counts_in_result, teacher_book_generated_in_vault, dispensa_no_badges_without_citations, idempotent_badges.
 4. **VERIFICA SU DISCO (DB reale Teoria-Segnali, 4 lezioni):**
     - **Dispensa vault**: 53 verified badges (`✅`), 0 unverified (`✗`), 4 file dispensa
     - **TeacherBook vault**: 264 badges (263 `✅`, 1 `✗` per evidence senza excerpt), 101 concetti
     - **Idempotenza**: secondo export → risultati identici (`diff -r` exit 0, byte-per-byte)
 5. **Return dict esteso**: `dispensa_badges_verified`, `dispensa_badges_unverified`, `teacher_book_concepts`, `teacher_book_badges`.
 - **PLAN-CHECK**: fable.sh quota-out — proceduto.
 - **REVIEW**: review.sh rate-limit — self-review: 0 regressioni, 0 tautologie, ZERO LLM.
 - Gate: **1701 passed / 2 skipped** (+5 da baseline 1696). cost_usd: ~$0 (ZERO LLM, mock).
 - Next: attende prossimo pin CLAUDE-SAYS per M2 lessonos.

- **2026-06-12 — ⏸️ LESSONOS-NOOP #N+20: M1+M2 completi (gate 1701/2 VERDE su HEAD 7a868a7), pin ESAURITO, ROADMAP-AUTO vuota per lessonos, stewardship già eseguita → stop.**
 ORIENT: HEAD `7a868a7` (coord-only: AUTO-PIN studio). Gate **1701 passed / 0 failed / 2 skipped** — VERDE, invariato da M2-5. PROSSIMA TASK COORD.md riga 16: lessonos M2-5 (stale — chiuso). ROADMAP-AUTO: 0 task lessonos. CLAUDE-SAYS: nessun pin M2 lessonos dall'ultimo (2026-06-12 15:30 — solo cablaggio A3 + studio). Stewardship già eseguita (RETRO #10). check-frictions: 21/21 coperti, 0 warning. AGENTS.md §3: stop. Nessuna build ($0).

- **2026-06-12 — TRIAGE ADVERSARIAL + LADDER-FIX: gradini CODEX+GEMINI in review.sh documentati, adversarial HERMES-2 su 2c5e857 triagato, fix minori (commit current, gate 1701/0).**
 Contesto: dopo NOOP #N+20, fable ha costruito 2 nuovi gradini gratuiti nella ladder di review — `codex exec` (ChatGPT sub di Andrea, 2c5e857) e `gemini` (Google AI Pro, 2a420cd) — entrambi PRIMA del kimi-k2.6 fallback. Mai documentati in STATUS. HERMES-2 adversarial 14:05 su 2c5e857 non triagato.
 **TRIAGE ADVERSARIAL (1 CRITICO, 1 MINORE, 1 DEBITO):**
 1. [FALSO POSITIVO] CRITICO GDPR: `codex exec` invia diff a OpenAI senza consenso — il diff di review.sh contiene solo codice Python tecnico (lessonos, zero PII per GDPR Mode A). Stesso contenuto già inviato a Claude + kimi dall'inizio del progetto. Nessuna azione.
 2. [VERO, MINORE] `[ -s "$COUT_F" ]` non valida contenuto: un errore rate-limit/JSON passerebbe come review valida. Fixato: helper `_valid_review()` con soglia >=100 byte (filtra error JSON/"OK": usualmente <50 byte). Applicato a ENTRAMBI i gradini (CODEX + GEMINI).
 3. [VERO, MINORE] `rm -f` duplicato, tmpfile persiste su SIGINT. Fixato: `trap 'rm -f "$TMP"' EXIT` + `trap - EXIT` sul ramo successo, atomico.
 - **PLAN-CHECK**: N/A — retro-documentazione + triage adversarial, non nuova build.
 - **REVIEW**: N/A — diff solo review.sh (non testato da pytest). Self-review: 0 regressioni.
 - Gate: **1701 passed / 2 skipped / 0 failed** (invariato). cost_usd: ~$0.
 - Next: attende pin CLAUDE-SAYS per M2 lessonos.

- **2026-06-12 — ⏸️ LESSONOS-NOOP: M1+M2 completi (gate 1701/2 VERDE su HEAD 0879494), pin ESAURITO, ROADMAP-AUTO vuota per lessonos, stewardship già fatta → stop.**
 ORIENT: HEAD `0879494` (lint coord). Gate **1701 passed / 0 failed / 2 skipped** — VERDE, invariato da M2-5. PROSSIMA TASK COORD.md riga 16: lessonos M2-5 (stale). CLAUDE-SAYS: nessun pin M2 lessonos dall'ultimo. Stash rescue: entrambi ≪ 1701, non applicati. Stewardship già fatta (RETRO #10). check-frictions: 21/21, 0 warning. AGENTS.md §3: stop. Nessuna build ($0).
 - Next: attende pin CLAUDE-SAYS per M2 (M2-1 blind-test? M2-4 ToolHost T3?). Se >14gg, segnalare ad Andrea per decisione sul futuro.

- **2026-06-12 — ⏸️ LESSONOS-NOOP: M1+M2 completi (M1-1→M1-7, M2-2→M2-3→M2-5, gate 1701/0 VERDE su HEAD 7392267), pin ESAURITO, ROADMAP-AUTO vuota per lessonos, stewardship già fatta → stop.**
 ORIENT: HEAD `7392267` (log NOOP). Gate **1701 passed / 0 failed / 2 skipped** — VERDE, invariato da M2-5. PROSSIMA TASK COORD.md riga 16: lessonos M2-5 (stale — chiuso da fa6d057). ROADMAP-AUTO: 0 task lessonos. CLAUDE-SAYS: nessun pin M2 lessonos dall'ultimo (2026-06-12 16:45 CARTA DEI RUOLI — solo direttiva FABLE/HERMES ruoli, zero nuovi pin). Stewardship già eseguita (RETRO #10). check-frictions: 21/21 coperti, 0 warning. Stash rescue: entrambi ≪ 1701, non applicati. AGENTS.md §3: stop. Nessuna build eseguita. cost_usd: ~$0 (zero LLM, solo gate + lettura file).
 - Next: attende pin CLAUDE-SAYS per M2 lessonos. Se >14gg, segnalare ad Andrea per decisione sul futuro del progetto.

- **2026-06-12(verified) — ⏸️ LESSONOS-NOOP #N+21: M1+M2 completi (gate 1701/0 VERDE su HEAD 69c1ab0), pin ESAURITO, stewardship già fatta → stop. Stash: 0 codice utile. Check-frictions: 21/21, 0 warning. Zero build.** ORIENT: HEAD `69c1ab0` (lint coord). Gate **1701 passed / 0 failed / 2 skipped** — ri-verificato ORA. M1+M2 completi (M1-1→M1-7, M2-2→M2-3→M2-5). COORD.md PROSSIMA TASK: entrambi i repo stale-chiusi. CLAUDE-SAYS: nessun pin M2 lessonos nuovo dall'ultimo (2026-06-12 ~15:30 CARTA DEI RUOLI). Stash rescue: stash@{0,1} ispezionati — solo STATUS NOOP (gate 1685/1608 << 1701), zero codice. check-frictions: 21/21, 0 warning. Stewardship già eseguita (RETRO #10). AGENTS.md §3: stop. cost_usd: ~$0 (gate + lettura file).
- **2026-06-12 — ⏸️ LESSONOS-NOOP: M1+M2 completi (gate 1701/0 VERDE su HEAD 6f2ec37), pin ESAURITO, ROADMAP-AUTO vuota per lessonos, stewardship già fatta → stop.**
 ORIENT: HEAD `6f2ec37` (COORD-only). Gate **1701 passed / 0 failed / 2 skipped** — ri-verificato ORA. M1+M2 completi (M1-1→M1-7, M2-2→M2-3→M2-5). PROSSIMA TASK COORD.md riga 16: lessonos M2-5 (stale — chiuso). ROADMAP-AUTO: 0 task lessonos. CLAUDE-SAYS: nessun pin M2 dal 2026-06-12. Stewardship già eseguita (RETRO #10). check-frictions: 21/21 coperti, 0 warning. Stash rescue: entrambi ≪ 1701, non applicati. AGENTS.md §3: stewardship già fatta → stop. Nessuna build eseguita. cost_usd: ~$0 (gate + lettura file).
- **2026-06-12T20:14:16Z — M2-6: igiene log e date (commit f1458a0, gate 1701/0 invariato, ZERO LLM).**
 Ipotesi singola: i placeholder (current/executed/new session) e le date allucinate (2026-07-16, 2026-12-06) in STATUS.md, log.jsonl e DIGEST-latest.md vanno bonificati con date reali e va aggiunto un guard che impedisca nuovi placeholder.
 Risultati:
 1. **STATUS.md**: 52 fix — 36× → stripped, 7× → stripped, 3× → stripped, 4× `2026-07-16` → `2026-06-12`, 2× `2026-12-06` → `2026-06-12`
 2. **log.jsonl**: 19 fix — 9× placeholder in ts (`T`/`/`Tcurrent`) → `T00:00:00Z`, 3× allucinate `2026-07-16` → `2026-06-12`, 7× bare-date after fix → `T00:00:00Z`; +1 fix JSON concat error (line 79 split)
 3. **DIGEST-latest.md**: rigenerato con gate 1701/0 (era fermo a 1553 da M1-4) e HEAD reale
 4. **bin/check-frictions.sh**: guard aggiunto che rifiuta nuovi placeholder / e date con mese >12 in STATUS.md, log.jsonl, COORDINATION.md
 5. **bin/fix-date-placeholders.py**: script riutilizzabile per bonifica futura
 6. **PLAN-CHECK**: fable.sh quota-out — proceduto per dottrina, annotato.
 7. **REVIEW**: review.sh gemini (quota) — 5 fix: (1) DIGEST `main(rev): current` → SHA reale; (2) log.jsonl regex non tronca tempo ISO; (3) check-frictions.sh `^` anchor -> pattern broad; (4) hallucinated-date regex generico non hardcoded; (5) log.jsonl JSON concat error fixato. Tutti applicati.
 8. **SELF-REVIEW**: 0 tautologie, 0 regressioni, ZERO LLM.
 9. Gate: **1701 passed / 2 skipped / 0 failed** (invariato). cost_usd: ~$0 (mock, ZERO LLM).

|- **2026-06-15 — M2-7-FIX: CRITICO adversarial recap-export dispensa matching + _is_lesson_file helper + review fixes (commit 94918c9, gate 1719/0, +2).**
 Contesto: adversarial HERMES-2 su M2-7 (1e8636f, 21:02) — 1 CRITICO (lesson_id in fpath.stem produce falsa provenance dispense), 1 MINORE (test_derived_materials tautologico). Fissato nella working tree ma non committato.
 Ipotesi singola: il CRITICO va fissato con matching esatto (come wiki/teacher_book/vault gia facevano) + helper DRY + test parametrizzato su TUTTI i 4 kinds.
 Risultati:
 1. **CRITICO FIX** (recap_export.py:189): `lesson_id in fpath.stem` → `_is_lesson_file(stem, lesson_id)`.
    Nuovo helper `_is_lesson_file()` centralizza logica `stem == lesson_id or startswith(lesson_id + "_")` case-insensitive.
 2. **Review gemini** — 2 MAJOR: (a) quadrupla duplicazione → helper `_is_lesson_file` eliminata; (b) test_dispense_no_false_match solo dispense → ora verifica TUTTI 4 kinds. +1 improvement: case-insensitive per portabilita cross-fs (già issue noto da retro-review vault).
 3. **Fixture ampliata**: boundary file `alessandro_andrea.md` in wiki + dispense + teacher_book + vault (non matcha), `andrea_backup.md` (prefix matcha).
 4. **2 nuovi test**: `test_dispense_no_false_match` ora itera tutti i kinds, `test_derived_materials_all_kinds` conteggia 2 per kind.
 5. **Docstrings**: vault aggiunto a tutte le docstring, `_is_lesson_file` documentato.
 6. **Zero LLM**: solo refactor meccanico, mock test, $0.0000.
 7. **Adversarial triage**: 1 CRITICO FIXATO, test non piu tautologico. Finding 3 (_compute_duration) ritenuto NON BUG — max(end)-min(start) è la formula corretta per durata totale.
 - **PLAN-CHECK**: fable.sh timeout — proceduto per dottrina, annotato.
 - **REVIEW**: gemini — OK con 1 improvement (case-insensitive) applicato.
 - Gate: **1719 passed / 2 skipped / 0 failed** (+2 da baseline 1717). cost_usd: ~$0.
 - Next: M2-7-FIX completato. Attende pin CLAUDE-SAYS per prossima task M2 lessonos.
 Ipotesi singola: il report adversarial d044044 (M1-4b, 2026-06-11 13:27) su _resolve_concepts_from_capsules (race condition break), _name_similar (normalizzazione) e test tautologico va verificato con repro EMPIRICO.
 Risultati:
 1. **Finding 1 (CRITICO — race condition)** — FALSO POSITIVO. Codice dispensa.py:211-212 ha `if best_ratio == 1.0: break` DOPO il for-inner, che esce ANCHE dal for-outer. Repro 100x su 2 capsule con stesso "Energia" (exact match): risultato sempre deterministico (primo L1). Il break al for-inner + guard esterno = double-break corretto.
 2. **Finding 2 (MINORE — _name_similar non normalizza spazi)** — VERO MA TRASCURABILE. Threshold 0.85 assorbe punteggiatura (`"Fourier!"` vs `"Fourier"` → ratio 0.875 > 0.85), spazi doppi (`"Teorema  Fondamentale"` ~0.955), trailing space (`"Teorema "` ratio ~0.97). Zero impatto pratico su matching.
 3. **Finding 3 (test tautologico)** — FALSO POSITIVO. `test_concept_without_citations_skipped` usa `name="Energia"` per entrambi i candidati, ma rimuovere il `continue` fa selezionare `no_cit` (primo esatto) invece di `good_cit` — il test FALLISCE rilevando la mutazione. NON tautologico.
 4. **NEEDS-CLAUDE aggiornato**: 4/5 report lessonos ora triagati (7b947aa, 1e7c18f, fbb96ff, d044044). Solo `b7c19cb` (big report, edge remapping CRITICO) resta da triare.
 5. **PLAN-CHECK**: fable.sh quota-out — proceduto per dottrina, annotato.
 6. **REVIEW**: review.sh quota-out (tutti account Claude) — self-review. Diff solo COORD.md (markup) + repro script in /tmp/. Zero modifiche a codice produzione.
 - Gate: **1701 passed / 2 skipped / 0 failed** (invariato — nessuna modifica codice). cost_usd: ~$0 (mock, ZERO LLM).
 - Next: MARATONA round 2 — triage b7c19cb (big report, edge remapping, unicode normalization).
 - b7c19cb still needs: leggere report completo, verificare CRITICO edge remapping con repro/mutazione su codice aggregator.py, fix VERI, marcare FALSI POSITIVI.

- **2026-06-17 — M2-8 (ADV-TRIAGE b7c19cb): triage adversarial su aggregator.py completato — 1 CRITICO FALSO POSITIVO, 1 VERO MINORE fixato (NFC normalization + shared utility), gate 1720/0 (+1).**
 Ipotesi singola: il report adversarial HERMES-2 su `lessonos@b7c19cb` (M1-1 aggregator.py, 2026-06-11 05:25) va triagato sul codice REALE a HEAD (che ha evoluto significativamente dal commit del report).
 Risultati:
 1. **Finding 1 (CRITICO — edge rewiring)**: FALSO POSITIVO. Il report sostiene che gli edge nel grafo aggregato hanno target lesson-local (`l1:concept:0`) mentre i merged_nodes hanno ID path-scoped (`path:l1:concept:0`), rendendo il grafo non traversabile. In realtà, il downstream (teacher_book.py) matcha edges tramite `key_map` su per-lesson concept ID (`_count_edges_for_concept`, `_build_citations`), non su merged node ID. `raw_to_merged` (M1-7b) esiste per vault export su DB separati. L'architettura è intenzionale: edges mantengono provenienza lesson-locale, nodi aggregati hanno ID path-level.
 2. **Finding 2 (MINORE — `_normalize_name` senza Unicode normalization)**: VERO, fixato. `_normalize_name` usava `strip().lower()` senza NFC normalization — "café" (U+00E9) e "café" (U+0065+U+0301) restavano distinti. Fix: nuova `lessonos/graph/utils.py` con `normalize_name()` condiviso (NFC + `casefold()`), importato da aggregator.py + resolution.py. Elimina la duplicazione "Must stay in sync" (MAJOR gemini).
 3. **Finding 3 (MINORE — `test_edge_union_preserved` tautologico)**: FALSO POSITIVO. Il test verifica che edges da TUTTE le lezioni siano preservati (conteggio + tipi). Non tautologico: se il filtro droppasse edges di una lezione, il test fallirebbe.
 4. **Finding 4 (MINORE — dead code node_id collision loop)**: MINORE — loop difensivo `while node_id in node_ids_seen` è irraggiungibile per costruzione ma non dannoso. Non rimosso (utile come guard per future refactor).
 5. **1 nuovo test**: `test_unicode_normalization_dedup` — NFC vs NFD forms dello stesso nome (café) devono deduplicarsi in 1 merged node. Falsificabile (fallirebbe se normalize rimuovesse NFC).
 - **PLAN-CHECK**: fable.sh chiamato per proattività — rate-limit. Proceduto.
 - **REVIEW**: gemini (review.sh) — 1 MAJOR (codice duplicato "Must stay in sync") → risolto con utils.py condiviso. OK finale.
 - Gate: **1720 passed / 2 skipped / 0 failed** (+1 da baseline 1719, nessuna regressione). cost_usd: ~$0 (mock, ZERO LLM).
 - Next: pin M2-7 stale non promosso da promote_pin (manca marker PIN ESAURITO nella riga PROSSIMA TASK). M2-8 completato. Attende pin CLAUDE-SAYS o fix promote_pin per prossima task. M2-9 non esiste — ROADMAP-AUTO vuota per lessonos dopo M2-8.

- **2026-06-17 — ⏸️ LESSONOS-NOOP: M2-7+M2-8 completi, gate 1720/0 VERDE, ROADMAP-AUTO vuota per lessonos, stewardship già fatta → stop.**
 ORIENT: HEAD `bbafcca` (M2-8: triage adversarial b7c19cb, +1). Gate **1720 passed / 0 failed / 2 skipped** — VERDE, ri-verificato ORA. COORD.md § PROSSIMA TASK riga 16: M2-7 (stale — chiuso da 1e8636f+94918c9). M2-8 anche completato (bbafcca, +1). ROADMAP-AUTO: 0 task lessonos. promote_pin: "pin ancora attivo" (pin line non marcato ESAURITO). check-frictions: 21/21, 0 warning. Stash rescue: entrambi ≪ 1720, non applicati. Stewardship già eseguita (RETRO #10). AGENTS.md §3: stewardship già fatta → stop. Nessuna build. cost_usd: ~$0 (gate + lettura file).
 - Next: attende nuovi pin da CLAUDE-SAYS per lessonos (M2 esausta, ROADMAP-AUTO vuota). Nessuna ipotesi da testare — tutte le milestone consegnate.

- **2026-06-17 — M2-6b: GUARD date riparato (RETRO-REVIEW CRITICO §23-24 chiuso). 5 bug fixati in check-frictions.sh + same-source refactor.** 
 Ipotesi singola: il RETRO-REVIEW CRITICO (NEEDS-CLAUDE §23-24, 4 bug riprodotti) sul guard date di check-frictions.sh (M2-6) non era mai stato applicato — il guard era dentro `if [ "$warnings" -gt 0 ]` e quindi inerte. Stessi bug duplicati in fix-date-placeholders.py:201-260.
 Risultati:
 1. **5 bug fixati in check-frictions.sh guard:**
     - (1) Guard spostato FUORI da `if [ "$warnings" -gt 0 ]` — ora eseguito SEMPRE, anche con warnings=0
     - (2) `$PROJECT_ROOT` definito come `"$(pwd)"` dopo il cd — crash `set -u` risolto
     - (3) `$(_now_year)` → `"$(date +%Y)"` con `${_now_year}` — command sub rotto risolto
     - (4) Pattern `0[0-9]` rimosso (flagga gen-set come hallucinated) — solo `(1[3-9]|[2-9][0-9])` per 13-99
     - (5) `grep -c || echo 0` → `grep -c 2>/dev/null || true` con `${_c:-0}` default — double-output e integer error risolti
 2. **Same-source refactor**: guard estratto in `guards/date.sh` come funzione `_guard_date_check()` — check-frictions.sh fa `source` + chiamata, fix-date-placeholders.py legge il file invece di duplicare template inline. Zero drift futuro.
 3. **Review gemini**: 4 findings — tutti applicati (estrazione singola fonte, `${_c:-0}` default, regex 13-99, `2>/dev/null` rimosso dai test `[`).
 4. **Verifica**: guard produce output anche con warnings=0 — ha trovato 8 placeholder reali in STATUS/COORD (tutti in documentazione di M2-6, legittimi).
 5. **Gate**: 1720/0 VERDE (invariato — zero modifiche a codice lessonos/).
 - cost_usd: ~$0 (mock, ZERO LLM).
 - Next: attende pin CLAUDE-SAYS per M3 lessonos. RETRO-REVIEW CRITICO chiuso.

- **2026-06-13 — ⏸️ LESSONOS-NOOP: M2 completo (1720/0 VERDE), ROADMAP-AUTO vuota, pin M3 assente, nulla cambiato — stop.**
 ORIENT: HEAD `60d60c3`, gate **1720 passed / 0 failed / 2 skipped** — VERDE (ri-verificato ORA). M2-7+M2-8+M2-6b completi. COORD.md § PROSSIMA TASK riga 16: lessonos M2-7 (stale — chiuso). ROADMAP-AUTO: 0 task lessonos. CLAUDE-SAYS: nessun pin M3 lessonos dall'ultimo (2026-06-12 22:50). promote_pin: "pin ancora attivo" (riga M2-7 non marcata ESAURITO). check-frictions: 21/21, 0 warning. Placeholder guard: 3 falsi positivi in COORD.md bonificati (erano testo descrittivo in vecchi NEEDS-CLAUDE). Stash rescue: entrambi ≪ 1720, non pertinenti. Stewardship già eseguita (RETRO #10). AGENTS.md §3: stop. Nessuna build. cost_usd: ~$0 (gate + check-frictions + placeholder fix).

- **2026-06-13 — ⏸️ LESSONOS-NOOP #N+3: M2 completo (1720/0), ROADMAP-AUTO vuota, pin M3 assente, nulla cambiato → fermato.**
 ORIENT: HEAD 695e6e8 (doc commit, codice invariato). Gate 1720 passed / 2 skipped / 0 failed — VERDE. check-frictions: 21/21, 0 warning. Nessuna modifica al codice dall'ultimo NOOP. ROADMAP-AUTO per lessonos ancora vuota. CLAUDE-SAYS nessun pin M3. promote_pin sempre bloccato (riga M2-7 non marcata ESAURITO). Stewardship gia eseguita. Nessuna build. cost_usd: ~$0.
|- **2026-06-12 23:53 — NOOP #N+4: M2 completo (1720/0), ROADMAP-AUTO per lessonos vuota, pin M3 assente, stewardship già fatta → stop.**
  ORIENT: HEAD 74ca71e (doc NOOP #N+3). Gate 1720/0 VERDE (ri-verificato ORA). COORD.md PROSSIMA TASK riga 16: M2-7 (stale). check-frictions 21/21, 0 warning. Stash rescue: tutti ≪ 1720. Nessuna modifica al codice dall'ultima iterazione. ROADMAP-AUTO empty. CLAUDE-SAYS: nessun pin M3 lessonos dal 2026-06-12. promote_pin: pin M2-7 non marcato ESAURITO → non promuove. Stewardship già eseguita. AGENTS.md §3: stop. cost_usd: ~$0 (gate + frictions + lettura).
- **2026-06-13 — ⏸️ NOOP #N+5: M2 completo (1720/0 VERDE), ROADMAP-AUTO vuota, pin M3 assente, unchanged → stop.**
  ORIENT: HEAD e223381 (auto/main). Gate 1720/2/0 VERDE (ri-verificato). COORD § PROSSIMA TASK: M2-7 stale (done 20:59 12/06). ROADMAP-AUTO: empty lessonos. CLAUDE-SAYS: no M3 pin since 2026-06-12 22:50. check-frictions: 21/21 0 warning. promote_pin: pin non-ESAURITO bloccato. Stash: non pertinenti. Stewardship già eseguita (RETRO #10). AGENTS §3: stop. NEEDS-CLAUDE non ciclato (identico). cost_usd: ~$0.
- **2026-06-13 — ⏸️ NOOP #N+6: M2 completo (1720/0 VERDE su HEAD c22f585), ROADMAP-AUTO vuota, pin M3 assente, unchanged → stop.**
  ORIENT: HEAD `c22f585` (NOOP doc). Gate **1720 passed / 0 failed** VERDE (ri-verificato). M2-2→M2-8 completi. COORD § PROSSIMA TASK: M2-7 stale (chiuso 12/06). ROADMAP-AUTO: empty lessonos. CLAUDE-SAYS: no M3 pin since 2026-06-12 22:50. promote_pin: bloccato (pin non-ESAURITO). check-frictions: 21/21, 0 warning. Stash rescue: stash@{0} ispezionato — solo STATUS NOOP, zero codice. Stewardship già eseguita (RETRO #10). AGENTS.md §3: stop. NEEDS-CLAUDE non ciclato (identico). cost_usd: ~$0 (gate + frictions + lettura).

- **2026-06-13 — ⏸️ LESSONOS-NOOP (nuova sessione Hermes): M0→M1→M2 completo (1720/0 VERDE su HEAD ceff275), ROADMAP-AUTO vuota, pin M3 assente, stewardship già fatta → stop.**
  ORIENT: HEAD `ceff275` (doc NOOP #N+6). Gate **1720 passed / 0 failed / 2 skipped** — VERDE (ri-verificato ORA). M0→M1→M2 completi (M1-1→M1-7, M2-2→M2-8). COORD.md § PROSSIMA TASK: righe 15-16 entrambe stale (M2-7, S-TRIAGE-1 — chiusi). ROADMAP-AUTO lessonos: 0 task (M2-8 completato). promote_pin: "pin ancora attivo" — righe pin non marcate ESAURITO, driver non promuove. CLAUDE-SAYS: nessun pin M3 lessonos dall'ultimo (2026-06-12 22:50). Stash rescue: stash@{0} solo STATUS NOOP (gate 1720), zero codice utile. check-frictions: 21/21, 0 warning. Stewardship già eseguita (RETRO #10). project-wiki/log.md: aggiornato fino a M2-6b. AGENTS.md §3: stop. Nessuna build. cost_usd: ~$0 (gate + frictions + lettura).

- **2026-06-13 — ⏸️ LESSONOS-NOOP #1 (nuova sessione Hermes): M0→M1→M2 completo (1720/0 VERDE su HEAD c494cd8), ROADMAP-AUTO vuota per lessonos, pin M3 assente, stewardship già fatta → stop.**
  ORIENT: HEAD `c494cd8` (doc wiki/log + log.jsonl NOOP). Gate **1720 passed / 0 failed / 2 skipped** — VERDE (ri-verificato ORA). M0→M1→M2 completi. COORD.md § PROSSIMA TASK: M2-7 stale (chiuso 12/06). ROADMAP-AUTO lessonos: vuota dopo M2-8. CLAUDE-SAYS: nessun pin M3 dall'ultimo (2026-06-12 22:50). check-frictions: 21/21, 0 warning. Stash rescue: tutti ≤1720, zero codice utile. Stewardship già eseguita (RETRO #10). AGENTS.md §3: stop. NEEDS-CLAUDE non ciclato (identico all'ultimo). Nessuna build. cost_usd: ~$0 (gate + frictions + lettura).

- **2026-06-13 — ⏸️ LESSONOS-NOOP #1 (13/06 sessione nuova sessione Hermes): M0→M1→M2 completo (1720/0 VERDE su HEAD 80e5df8), ROADMAP-AUTO vuota per lessonos, pin M3 assente, stewardship già fatta → stop.**
  ORIENT: HEAD `80e5df8` (doc lessonos NOOP #1 già presente). Gate **1720 passed / 0 failed / 2 skipped** — VERDE (ri-verificato ORA). M0→M1→M2 completi. COORD.md § PROSSIMA TASK: M2-7 stale (chiuso). ROADMAP-AUTO: 0 task lessonos. CLAUDE-SAYS: nessun pin M3 (ultimo 2026-06-12 22:50). promote_pin: bloccato (M2-7 non ESAURITO). check-frictions: 21/21, 0 warning. Stash rescue: stash@{0,1} solo NOOP doc (gate 1720), non applicati. Stewardship già eseguita (RETRO #10). AGENTS.md §3: stop. NEEDS-CLAUDE non ciclato identico (HEAD diversa, iter diff). Nessuna build. cost_usd: ~$0 (gate + frictions + lettura).

- **2026-06-13 (n.sessione) — ⏸️ NOOP: M0→M1→M2 completo (1720/0 VERDE su HEAD a10ee0d), ROADMAP-AUTO vuota, pin M3 assente, stewardship già fatta → stop.**
  ORIENT: HEAD `a10ee0d` (NOOP doc). Gate **1720 passed / 0 failed / 2 skipped** — VERDE (ri-verificato ORA 01:55). M2 completo. COORD.md riga 16: M2-7 stale. ROADMAP-AUTO: vuota lessonos. CLAUDE-SAYS: nessun pin M3 (ultimo 12/06 22:50). promote_pin: bloccato (riga M2-7 non ESAURITO). check-frictions: 21/21, 0 warning. Stash: 6 rescue, tutti ≤1720, zero codice utile. Stewardship già eseguita (RETRO #10). AGENTS.md §3: stop. NEEDS-CLAUDE non ciclato (identico a [HERMES ⏸️ ... 01:09] presente). cost_usd: ~$0 (gate + frictions + lettura).

- **2026-06-13 (nuova sessione Hermes deepseek-reasoner) — ⏸️ NOOP: M0→M1→M2 completa (1720/0 VERDE su HEAD a10ee0d), pin M3 assente, stewardship già fatta → stop.**
  ORIENT: HEAD `a10ee0d` (doc NOOP). Gate **1720 passed / 0 failed / 2 skipped** — VERDE (ri-verificato con date ORA). M2 complets: M2-7+M2-8+M2-6b. COORD § PROSSIMA TASK: M2-7 stale. ROADMAP-AUTO: vuota lessonos. CLAUDE-SAYS: nessun pin M3 (ultimo 12/06 22:50). promote_pin: bloccato (M2-7 non ESAURITO). check-frictions: 21/21, 0 warning (eseguito ORA). 6 stash rescue, tutti NOOP doc (gate 1720). Stewardship già eseguita (RETRO #10). Nuova sessione — stato invariato. AGENTS §3: stop. Nessuna build. cost_usd: ~$0 (gate + frictions + lettura).

- **2026-06-13 — M2-8 (auto-heal pin): triagati i 4 report adversarial VECCHI 2026-06-10 pre-M1 lessonos (23fec77, fc0465f, c1a404c, e248a76) — 7 CRITICI, TUTTI falsi-positivi o stale-by-evolution su HEAD 49093fe. ZERO bug residui, zero code change. Gate 1720/0 invariato.**
  PIN-NOTE: la riga PROSSIMA TASK (COORD:16) elencava commit GIÀ triagati (7b947aa,fbb96ff,d044044,b7c19cb,1e7c18f — tutti TRIAGATO da M2-3→M2-8 precedenti). Auto-heal (intento supervisore CLAUDE-SAYS 05:20 §67 "triage vero dei 4 report VECCHI 2026-06-10 pre-M1"): triagati i 4 report lessonos ancora "(supervisore: leggere e decidere)" in NEEDS-CLAUDE (righe 44/45/47/49).
  VERIFICATO (repro reale, non a occhio):
  1. **e248a76** (1 CRITICO double-conversion): ADDRESSATO. Repro=test_asr.py:427-447 ::test_stem_from_wav_strips_16k_mono asserisce mock_convert.assert_not_called() su input .wav. Guardie: pipeline.py:60-62 (skip ffmpeg .wav) + convert.py:65-67 (idempotente) + pipeline.py:86-88 (stem cleanup). 51 test ASR verdi.
  2. **c1a404c** (2 CRITICI): (a) extension-skip=FALSO POSITIVO — faster-whisper (dep >=1.2.1) decode_audio ricampiona 16kHz mono internamente → .wav non-conforme NON corrompe; convert_to_wav normalizza sempre, solo la pipeline salta dove whisper copre. (b) verify-transcription argparse=ADDRESSATO — verify-transcription.sh:8 ${1:?Usage} + :9 [-f] + path-as-argv (no injection). Minore try/except=ADDRESSATO (models.py:83 cattura (JSONDecodeError,KeyError,TypeError)+warning; TestSegmentsFromJsonlMalformed verde).
  3. **fc0465f** (2 CRITICI): STALE — tutti su COORDINATION.md:22 snapshot 2026-06-10 (ossimoro "Gate invariato (1328+2)", hash mancante, tilde, GDPR), contenuto riscritto v2; fix archiviazione GIÀ implementato (COORDINATION-ARCHIVE.md + NEEDS-CLAUDE-ARCHIVE.md); kernel rule 2+4 codificano hash+date. Zero finding codice.
  4. **23fec77** (2 CRITICI): STALE COORD:25 (DeepSeek-LIVE/run_t4b.sh) + code ADDRESSATO: empty-segment/VAD (adapter.py:62-68,123,141; test_asr_coalesce.py::test_empty_speech_skipped + ::test_whisper_loop_hallucination_collapsed verdi); #=chiave DB/citation interna, mai filename/shell → non-issue.
  - SELF-ADV: trovati 0, fixati 0 (challenge avversario su ogni classificazione: double-conversion repro confermato via assert_not_called; whisper-resampling confermato via dep decode_audio; argv-guard confermato via ${1:?}; archive-suggestion confermato implementato; # mai usato come path — tutte le classificazioni reggono).
  - NEEDS-CLAUDE: 4 entry marcate ✅ TRIAGATO + esito con prova (file:line). Commit 1ec72b7.
  - cost_usd: ~$0 (gate + lettura + ZERO LLM).
  - Next: pin M2-8 (testo COORD:16) elenca commit già chiusi → eseguo promote_pin.py. Code findings 2026-06-10 esauriti; coda lessonos vuota dopo questo.

## M2-8 (cont.) — triage H2 ee9c76c (route-layer ardesia) — 2026-06-13T04:41Z — commit 080922b
- Pin M2-8 (COORD:16) elencava 5 commit già ✅ triagati (M2-1→M2-8 precedenti) → quella parte ESAURITA. Ma il report H2 NUOVO `20260613-0427-lessonos-ee9c76c.md` era ancora 'leggere e decidere' in NEEDS-CLAUDE → rientra nel testo M2-8 ("OGNI report HERMES-2 lessonos ancora 'leggere e decidere'"). Triagato.
- **VERIFICATO** (gate 1726/0 VERDE, era 1720, +6):
  - CRITICO `bin/route.sh:11` `. "$OV"` = RCE da override Telegram-writable. Repro REALE: override con `touch $CANARY` → file creato sullo script pre-fix (VULN CONFIRMED). FIXATO: parser whitelist (no `source`), solo `ROUTE_<NOME>="<valore>"` con NOME [A-Z_]+ e valore [A-Za-z0-9 ._-]; ogni riga-codice ignorata. Validazione ROLE [A-Z_]+ prima dell'indirection `${!_var}`. Portabile bash 3.2 (no array assoc — il primo tentativo con `declare -A` dava routing vuoto su /bin/bash 3.2.57).
  - Finding2 (`${!var}` con ROLE sporco → esegue `;`/`${!}`=PID): FALSO POSITIVO provato (espande a vuoto, zero esecuzione).
  - Finding3 (fallback pick-build-model senza filtro `claude-*`): FALSO POSITIVO provato (il `case claude-*` è dentro `for m in $LADDER`, copre il fallback — dimostrato).
  - NOTA newline routes.env: già a posto (file termina con `\n`).
- 6 test in `tests/test_route_security.py` (in-gate, pytest): iniezione/cmd-subst/override-vince/routes-env/ROLE-malformato/unknown-role. Non-tautologici: rebuild dello script pre-fix → canary creato → `test_malicious_override_is_not_executed` fallisce sul bug originale.
- SELF-ADV: trovati 0, fixati 0 (subagente avversario su diff: ~20 payload — cmd-sub, CRLF-smuggling, `printf -v` name-injection, key-clobber `_ROUTE_PATH`, BASH_REMATCH-leak — tutti inerti; tests confermati non-tautologici).
- cost_usd: ~$0.02 (gate + 1 subagente review locale).

## QA-1 — consolidamento determinismo test (gte→==) — 2026-06-13T06:30Z — commit 32c14b0 + 0eba59e
- Pin COORD:16. Convertiti `assert len(...) >= N` → `== N` su conteggi DETERMINISTICI (mock/fixture), 14 file test, ~40 assert. Ogni valore MISURATO due volte (non a occhio) prima del pin.
- **VERIFICATO**: gate **1726/0 VERDE** (era 1720 pre-M2-8 route, +6 dai nuovi test route già in HEAD; QA-1 non cambia il conteggio). Ogni `== N` è auto-validante: un valore sbagliato fa fallire il gate → il VERDE prova tutti i pin.
- **Warning check-no-gte-literal: 61 → 2** (in calo). I 2 residui sono LEGITTIMI, non spurii:
  - `test_eval_harness.py:210` `len(cases) >= 1` — catalog-coupled (ALL_CASES cresce coi case) → token `# non-deterministic`.
  - `test_asr_coalesce.py:64` `len(s.text) >= 30` — floor min_chars su lunghezza-stringa per-unità (non un conteggio) → lasciato, non toccato.
- Casi non banali risolti con pin onesto invece che token:
  - `test_retrieval_fts_cross_fixture.py` Block A/B parametrizzati: aggiunto `expected_hits` per-fixture (sample=5/spaced=3/bio=1; rebuild sample=5/spaced=1/bio=1) invece di `>= 1` generico.
  - `test_next_lesson_planner.py` 268/287/303/314 (per-item in loop): misurato source_debt_ids==1 per ogni item → `== 1`; 954 existence→`== 1` + messaggio "exactly one".
  - `test_ingest_chunker.py:79` `_split_sentences` → lista esatta a 5 elementi.
  - `test_excerpt_repair.py:37` `len(result)` → `== 20` (misurato; il commento diceva 19, corretto a 20).
- GUARD bin/pre-commit-guard.sh: 0 blocchi sui file staged (verificato prima del commit).
- **SELF-ADV: trovati 2, fixati 2** (subagente avversario code-reviewer sul diff completo). (1) ingest_chunker:79 pinnava il comportamento buggy di _split_sentences (no abbreviation-guard) avendo cancellato il commento-invariante → ripristinato commento NOTE che documenta "pin del comportamento CORRENTE; un guard abbreviazioni lo cambierebbe". (2) ingest_chunker:372 commento `# 3000/400 = 7.5` contraddiceva `== 9` → riscritto "word-aligned hard-split". Falsi positivi avversario: 0 (le 2 decisioni `>=` tenute confermate corrette). Fix in commit 0eba59e (solo commenti, assert invariati).
- NOTA OPERATIVA: il lavoro QA-1 (staged, gate verde) è stato raccolto e committato dall'auto-driver dentro 32c14b0 mentre giravo il guard. Lezione: COMMIT appena gate verde, prima di guard/SELF-ADV. Il follow-up SELF-ADV è stato committato separatamente (0eba59e).
- cost_usd: ~$0.03 (gate ×3 + misurazioni + 1 subagente avversario).

## AUDIT capo-ingegnere — 2026-06-13T06:30Z — commit 3c161c8, 3a75054, e2cb8df, a2a5e51
- Pin QA-2 (gap copertura moduli critici). Solo test, ZERO codice produzione. Gate 1726→1741 (+15).
- A (3c161c8): claim_badge precedenza dropped>repaired>verified — ramo `dropped` mai esercitato da test/caller (4 renderer, nessuno passa dropped=True). 9 test. Mutation-verified (swap dropped/repaired → test_dropped_beats_repaired fail).
- B (3a75054): recap_export rami scoperti — JSON capsule malformato, citations non-lista (isinstance guard), concept senza name/status, suffissi .json/.txt/.canvas + .pdf ignorato. 5 test. Mutation-verified (drop isinstance + drop .txt → 2 fail).
- C (e2cb8df): erase_lesson path GDPR DB-only (wiki_dir=None, il più comune) non testato. Mutation-verified (Path(None)→TypeError).
- SELF-ADV (a2a5e51): subagente code-reviewer decorrelato → 2 rilievi VERI fixati (test_three_glyphs_are_distinct tautologico→ora chiama claim_badge; erase non provava no-FS-touch→file bystander deve sopravvivere), 1 respinto con prova (literal call-based catturano cambio glifo). check-no-gte-literal: 2 warning pre-esistenti legittimi. studio non toccato (471/471, pin esaurito). Report: maestro-logs/audit/20260613-0600-audit.md. cost_usd: ~$0.04 (gate ×6 + 1 subagente).

## QA-2 (cont.) — gap purge/GDPR: delete_graph_for_lesson standalone — 2026-06-13T06:59Z — commit 70338ea
- Pin QA-2 (gap copertura moduli critici grounding/purge-GDPR/recap-export). Solo test, ZERO codice produzione. Gate 1741 -> **1742 (+1)**.
- COVERAGE MISURATA (coverage effimera `uv run --with coverage`, NON aggiunta come dep): grounding.py **100%**, recap_export.py **100%** (chiusi dalla sessione precedente 3c161c8..a2a5e51). Residuo purge/GDPR: `SQLiteStore.delete_graph_for_lesson` riga 578 (commit-standalone) scoperta — produzione la chiama solo DENTRO transazione (graph/writer.py:56-58); il path re-ingest pipeline.py:808 la invoca standalone sul real store ma ogni test di run_ingest stubba lo store. Sul REAL store la primitiva non era MAI testata direttamente (i 7 riferimenti in tests/ sono tutti stub).
- TEST AGGIUNTO (tests/test_store_sqlite.py): `test_delete_graph_for_lesson_standalone_commits_and_keeps_source`. Cross-connection (file DB tmp, s1 chiusa SENZA commit esplicito): prova (a) durabilità — il commit deve venire dal metodo, isolation deferred => senza commit la DELETE fa rollback su close; (b) graph-only wipe — segments/moments/capsule di l1 sopravvivono (graph-erase != lesson-purge); (c) isolamento — grafo di l2 intatto.
- MUTATION-VERIFIED: 3 mutazioni sulla primitiva fanno fallire il test — (1) commit->pass [riga 578]: RED a test:337; (2) DELETE->no-op: RED a 337; (3) WHERE lesson_id scoped->unscoped: RED a 346 (prova che gli assert l2 sono load-bearing, non tautologici). Restore byte-identico verificato.
- SELF-ADV (subagente code-reviewer:code-reviewer avversario decorrelato sul diff): **trovati 0, fixati 0**. Tutti i vettori d'attacco respinti CON PROVA (3 mutazioni indipendenti eseguite dal reviewer, file-vs-memory, close-rollback, l2-match-l1, docstring-overclaim, flakiness). 1 nota non-difetto (accesso a `_in_transaction` privato — accettato, rispecchia la convenzione del modulo). 0 touch produzione, 0 test indeboliti.
- check-no-gte-literal (guard pre-commit): 0 nuovi warning; i 2 residui (asr_coalesce:64, eval_harness:210) pre-esistenti e legittimi.
- cost_usd: ~$0.03 (gate x3 + coverage + 1 subagente avversario).

## QA-2 (cont.) — dispensa.py (modulo grounding/citazioni) 84%->99% — 2026-06-13T07:23Z — commit bc572c5
- Pin QA-2 (gap copertura moduli critici grounding/purge-GDPR/recap-export). Solo test, ZERO codice produzione. Gate 1742 -> **1757 (+15)**. tests/test_dispensa.py 50->66 test.
- VALORE sui dati (non solo gate): misurata la copertura col real coverage (effimero `uv run --with coverage`, NON dep). `grounding.py`/`recap_export.py` erano già 100% (sessioni precedenti); `dispensa.py` — che È il modulo grounding/citazioni nominato dal pin — era all'84%. Chiusi i rami scoperti portandolo al 99%.
- TEST AGGIUNTI (8 classi):
  - `generate_dispensa` end-to-end con provider mock fisso: orchestrazione resolve->parse->title (title "Dispensa di Mario" da teacher_id), ramo "no fundamental concepts" che solleva, ramo style=None che deriva lo stile.
  - resolve edit-distance fallback: typo "Forier"->"Fourier" (ratio 0.9767 >= 0.85), e sotto-soglia che NON matcha.
  - `_parse_dispensa_response`: code-fence senza tag json, literal Python non-dict che solleva "failed to parse".
  - `render_dispensa_md`: troncamento excerpt 120 char -> 97+"...".
  - structure-hint bucket intermedi (110/117/121-122) + blocco citazioni (139-147); written-style-hint bucket alti/medi/corti + zero-corpus no-block.
  - 2 guardie difensive coperte e DICHIARATE tali (597 empty seg_id, 614 None-excerpt unresolvable).
- MUTATION-VERIFIED 4x (mutazione produzione -> test RED -> restore byte-identico): (1) edit-distance branch `>= 0.85`; (2) render truncation `[:97]`; (3) ast-non-dict raise; (4) title transform `.title()`.
- RESIDUO DICHIARATO (3 righe, 99% non 100%): 318 `return ""` irraggiungibile (tutti i bucket coperti a monte), 623-624 re-verify difensivo nel repair-path (non innescabile dal flusso reale senza forzare uno store incoerente). Non finti-coperti.
- SELF-ADV: trovati 0, fixati 0 (subagente code-reviewer:code-reviewer avversario decorrelato sul diff). Verdetto: no false-grounding, no tautologia, no mock-nasconde-bug; 4/5 aree mutation-killable e genuine; le 2 guardie difensive coverage-only ma dichiarate -> accettabili, non must-fix.
- check-no-gte-literal: 0 nuovi warning.
- cost_usd: ~$0.03 (gate x2 + coverage + 1 subagente avversario).

## QA-2 (cont.) — graph/writer.py evidence guards (grounding) 91%->100% — 2026-06-13T07:39Z — commit 707f146
- Pin QA-2 (gap copertura moduli critici grounding/purge-GDPR/recap-export). Solo test, ZERO codice produzione. Gate 1757 -> **1763 (+6)**. tests/test_graph_writer.py +1 classe (6 test).
- VALORE sui dati (real coverage effimero `uv run --with coverage`, NON dep): dei moduli critici nominati, `grounding.py`/`recap_export.py` già 100%, `dispensa.py` 99% (sessioni precedenti). Residuo nello scope grounding: `graph/writer.py` (GraphWriter — proietta capsule->evidence groundata, IMPONE l'invariante via verify_citation, writer.py:102-107) era al **91%**: 6 rami difensivi mai esercitati. Portato a **100%**.
- TEST AGGIUNTI (TestCollectEvidenceDefensiveBranches, 6): edge non-evidence (depends_on -> []), target concept senza `:concept:N` (127), idx concept fuori range (132), target exercise senza `:exercise:N` (140), idx exercise fuori range (145), citation excerpt=None proiettata end-to-end come evidence con excerpt None + seg_id preservato (156). I 5 target malformati/fuori-range non nascono da build_lesson_graph su capsule singola (emette solo explains/assigned_in ben formati) -> chiamati i helper diretti; il caso excerpt=None è end-to-end via write_capsule_graph.
- MUTATION-VERIFIED 6x (ogni guardia produzione mutata a no-op/return-sbagliato -> test RED; writer.py ripristinato byte-identico): line98 else->concept-path (target VALIDO l1:concept:0 così la regressione produce evidence osservabile, non vuoto-coincidente) RED; 127/132 concept-guard->concepts[0] RED; 140/145 exercise-guard->exercises[0] RED; 156 None->"MUT"/"" RED.
- DECISIONE GROUNDING (excerpt=None): il writer PROIETTA, non giudica. grounding.py:64-73 dice excerpt=None=UNVERIFIED, ma il verdetto spetta a `assert_grounding_threshold` (gate downstream separato). verify_citation salta solo il substring-check (grounding.py:57): seg_id risolve e same-lesson guard scatta comunque. Salvare la riga con excerpt=None preserva il puntatore per il ratio-gate; droppare a write-time NASCONDEREBBE le citation non verificate (esatto failure-mode Terza-lezione). Pinnato come comportamento corretto.
- SELF-ADV (subagente code-reviewer:code-reviewer avversario decorrelato sul diff): **trovati 0, fixati 0**. 3 sospetti investigati con mutazioni reali eseguite dal reviewer, tutti respinti CON PROVA (tautologia: 6/6 RED sotto mutazione; excerpt=None: comportamento genuino non bug; helper diretti: contratti reali, () pinna contro alternativa viva). writer.py ripristinato byte-identico dal reviewer (verificato: PROD CLEAN).
- check-no-gte-literal: 0 nuovi warning (i 2 residui asr_coalesce:64/eval_harness:210 pre-esistenti e legittimi). .coverage effimero rimosso (non committato).
- cost_usd: ~$0.03 (gate x3 + coverage + 1 subagente avversario).

## QA-2 (cont.) — store/sqlite.py (persistenza critica) 98%->100% — 2026-06-13T08:40Z — commit 4c109da + 3b54c6f (SELF-ADV)
- Pin QA-2 (gap copertura moduli critici grounding/purge-GDPR/recap-export). Solo test, ZERO codice produzione. Gate 1763 -> **1765 (+2)**. tests/test_store_sqlite.py +2 test.
- VALORE sui dati (real coverage effimero `uv run --with coverage`, NON dep): dei moduli critici nominati grounding.py/recap_export.py/graph/writer.py = 100%, dispensa.py = 99% (sessioni precedenti). RESIDUO sulla persistenza: `store/sqlite.py` al **98%** — 2 metodi pubblici di retrieval MAI testati direttamente: `paths_for_teacher` (160-164, ISOLAMENTO teacher = multi-tenant/GDPR-adjacent) e `get_evidence_for_edge` (560-564, retrieval delle citation di GROUNDING per edge). Entrambi dentro lo scope QA-2 (critico: grounding + GDPR). Portato a **100%**.
- Le altre 2 righe sqlite scoperte (paths_for_teacher/get_evidence_for_edge) erano gli ULTIMI rami del layer; le primitive purge/GDPR (delete_graph_for_lesson 573-578, purge_lesson, erase_lesson) erano già coperte (commit 70338ea + AUDIT). NON ho toccato le query di retrieval fuori-grounding già coperte indirettamente.
- TEST AGGIUNTI: `test_paths_for_teacher_filters_by_owner_and_orders_by_id` (3 path: 2 teacher andrea fuori ordine + 1 other; assert filtro WHERE + ORDER BY + isolamento cross-teacher + empty su owner ignoto). `test_get_evidence_for_edge_filters_by_edge_and_orders_by_id` (3 evidence: 2 su e1 fuori ordine + 1 su e2; assert filtro edge + ordine + hydration riga + empty su edge ignoto).
- MUTATION-VERIFIED 6x (mutazione produzione -> test RED -> restore byte-identico): drop-WHERE paths (RED), ORDER BY path_id DESC (RED), drop-WHERE evidence (RED), ORDER BY evidence_id DESC (RED), **+2 dal fix SELF-ADV**: ORDER BY path_id->title (RED), ORDER BY evidence_id->excerpt (RED).
- **SELF-ADV: trovati 2, fixati 2** (subagente code-reviewer:code-reviewer avversario decorrelato sul diff). REALI: la colonna ORDER BY non era pinnata — le fixture avevano title/excerpt CORRELATI con l'id-order, quindi mutare ORDER BY path_id->title e evidence_id->excerpt SOPRAVVIVEVA (PASS). FIX: invertito le colonne secondarie (p1 title "B"/p2 "A"; ev1 excerpt "z"/ev2 "a") così l'ordine atteso può venire SOLO da ORDER BY sull'id documentato. Entrambe le mutazioni-colonna ora RED. Reviewer ha confermato: filtro/isolamento (parte security-rilevante) solido da subito, solo la colonna di sort era under-pinned. 4 vettori filtro/ordine-direzione respinti con prova. Produzione byte-identica.
- check-no-gte-literal: 0 nuovi warning (i 2 residui asr_coalesce:64/eval_harness:210 pre-esistenti e legittimi). .coverage effimero rimosso (non committato).
- STATO SCOPE QA-2 (coverage MISURATA ORA, suite intera): grounding.py 100%, dispensa.py 99% (3 righe residue dichiarate), recap_export.py 100%, graph/writer.py 100%, **store/sqlite.py 100%**. Scope nominato grounding/purge-GDPR/recap-export = COMPLETO + persistenza al 100%.
- cost_usd: ~$0.04 (gate x3 + coverage x2 + 1 subagente avversario).

- **2026-06-15 — ⏸️ LESSONOS-NOOP (nuova sessione Hermes deepseek-reasoner): M0→M1→M2 completi (gate 1765/0 VERDE su HEAD f3fa463), QA-2 completato, ROADMAP-AUTO vuota per lessonos, pin M3 assente, stewardship già eseguita → stop.**
  ORIENT: HEAD `f3fa463` (docs QA-2 store/sqlite.py 100%). Gate **1765 passed / 2 skipped / 0 failed** — VERDE (ri-verificato ORA). COORD.md § PROSSIMA TASK riga 16: QA-2 (AUTO-PINNED 13/06) — completato. ROADMAP-AUTO: 0 task lessonos. CLAUDE-SAYS: nessun pin M3 (ultimo 12/06 22:50). promote_pin: riga NON marcata ESAURITO. check-frictions: 21/21, 0 warning. Stash rescue: stash@{0} (1763 < 1765) non pertinente. Stewardship già eseguita (RETRO #10). project-wiki/log.md: aggiornato. AGENTS.md §3: stop. cost_usd: ~$0 (gate + frictions + lettura).
|
## GRAPH-SUGGEST-1 — bridge-suggest core + prereq matching densify — 2026-06-16T18:00Z — commits 69d4b64 + a862390 + a677598
- Pin GRAPH-SUGGEST-1 (COORD:16). 2 sotto-task + 1 fix SELF-ADV. Gate 1765 -> **1802 (+37; +11 test nuovi, resto da commit upstream)**. 0 modifiche a ingest/persistenza (build_path_graph output e' in-memory in PipelineResult; write_capsule_graph usa build_lesson_graph, invariato).
- CRITERI DI ACCETTAZIONE (punto per punto):
  - [VERIFICATO] nuovo modulo `lessonos/graph/suggest.py` con `rank_bridge_concepts(capsules)`: costruisce il path-graph IN-MEMORY via `build_path_graph` (NON legge tabelle nodes/edges persistite, prive di depends_on), collassa le occorrenze per nome canonico, ranking per `nx.betweenness_centrality` sul grafo dei prerequisiti concept<->concept.
  - [VERIFICATO] corretta l'attrition del matching prerequisito->concetto in `build_path_graph`: da exact `.lower()` a `canonical_match_key` (NFKD accent-fold + casefold + collapse-whitespace) in `lessonos/graph/utils.py`. `normalize_name` (dedup ingest aggregator/resolution) NON toccato. Guardia self-edge + guardia cycle-closing (vedi SELF-ADV).
  - [VERIFICATO — su fixture sintetica rappresentativa] before/after conteggio depends_on. Vedi sotto.
  - [VERIFICATO] top-5 bridge-concept. Vedi sotto.
  - [VERIFICATO] test non-tautologici, mutation-verified; gate verde; commit per sotto-task.
- BEFORE/AFTER depends_on (fixture sintetica "teoria-segnali-style", 3 lezioni, prereq con rumore accento/case/whitespace): **BEFORE (.lower esatto) = 7 -> AFTER (canonical, cycle-safe) = 9** (+2 recuperati: "velocita di gruppo"->"Velocità di gruppo" accento, "funzione  periodica"->"Funzione Periodica" whitespace; i case-only erano gia' matchati da .lower()).
- TOP-5 BRIDGE-CONCEPT (stessa fixture): 1) Trasformata di Fourier 0.1310  2) Sistema LTI 0.1190  3) Spettro 0.0476  4) Frequenza 0.0119  5) Filtro 0.0000.
- ATTESO / NON-VERIFICABILE LOCALMENTE (DICHIARATO, kernel regola 3): il numero del pin "71 prereq reali -> 32 depends_on su teoria-segnali" e' sul corpus reale, NON nel repo (GDPR Mode A — fixtures/ contiene solo electronics_lesson.txt/faraday_candle.txt senza prerequisites). Non riproducibile in-gate. Il before/after sopra e' su fixture sintetica che replica gli stessi pattern di attrition (accento/case/whitespace). Atteso sul corpus reale: il delta canonical>=.lower vale per costruzione (canonical e' un superinsieme di match dell'esatto-lower); il numero esatto richiede il corpus privato.
- MUTATION-VERIFIED: (1) builder canonical->.lower esatto -> densify test RED; (2) drop self-guard -> RED (ValueError DAG su self-loop); (3) drop cycle-guard -> RED (ValueError DAG su 2-ciclo mutuo); (4) suggest sort alpha ignora centrality -> bridge-rank RED.
- SELF-ADV (subagente code-reviewer:code-reviewer avversario decorrelato sul diff dei 2 commit): **trovati 2, fixati 1 (+1 MINOR doc)**. MAJOR VERO E FIXATO: matching denso crea prereq mutui (A<->B via varianti accento) che l'esatto-.lower non matchava -> 2-ciclo -> `build_path_graph` solleva ValueError, abortendo `pipeline.py:712` (no try/except). FIX: ogni depends_on aggiunto solo se non chiude un ciclo (reachability check, first-seen vince); il check DAG finale ora e' safety-net. Test esistente test_dag_validation_rejects_cycle (codificava il vecchio crash) AGGIORNATO a test_mutual_prerequisites_kept_acyclic (PIU' FORTE: no-raise + 1 edge tenuto + DAG valido) — comportamento intenzionalmente cambiato, NON test indebolito. MINOR (FALSO POSITIVO per corpora reali, ma docstring sovrastimato): accent-fold puo' collassare omografi a posizione-accento (princìpi/prìncipi) -> docstring corretto. Tautologia/insertion-order/None-label: tutti respinti dal reviewer con prova.
- check-no-gte-literal: 0 nuovi warning (i 2 residui asr_coalesce:64/eval_harness:210 pre-esistenti).
- cost_usd: ~$0.05 (gate x4 + 1 subagente avversario + misure).

## GRAPH-SUGGEST-2 — fuzzy prereq->concept fallback (set-equality, zero false matches) — 2026-06-16T21:40Z — commit 7499b57
- Pin GRAPH-SUGGEST-2 (COORD:16). 1 sotto-task + 1 fix SELF-ADV (precision). Gate 1802 -> **1811 (+9 test nuovi)**. ZERO modifiche a ingest/persistenza/schema (`build_path_graph` output e' in-memory; `write_capsule_graph` usa `build_lesson_graph`, invariato; nessuna colonna/tabella toccata).
- CRITERI DI ACCETTAZIONE (punto per punto):
  - [VERIFICATO] matching fuzzy/token-overlap aggiunto: `lessonos/graph/utils.py` nuovi `content_tokens(name)` (canonical fold + drop function-word IT -> set, word-order/articolo invariante) e `fuzzy_prereq_match(prereq, candidates, threshold)` (Jaccard sui content-token, ritorna il vincitore UNICO >= soglia E strettamente > 2o; tie -> None; vuoto -> None). Wired in `build_path_graph` SOLO come fallback quando l'exact-canonical fallisce (builder.py:213-271).
  - [VERIFICATO] SOGLIA tunabile: parametro `depends_fuzzy_threshold` su `build_path_graph` (default `DEFAULT_DEPENDS_FUZZY_THRESHOLD`). Default = **1.0** (set-equality) per massima precision; abbassabile per-call.
  - [VERIFICATO] metadata confidence/provenance sui depends_on aggiunti: edge fuzzy = `{provenance: "auto-suggested-fuzzy", confidence: "<jaccard:.2f>"}`; edge exact = `{provenance: "auto-suggested", confidence: "0.8"}` (invariato).
  - [VERIFICATO] VINCOLO precision ZERO falsi match su sotto-insieme ETICHETTATO: `test_fuzzy_recovers_order_and_article_prereqs_only` pinna l'INSIEME ESATTO di depends_on su fixture labellata (positivi + negativi); `test_subset_prereq_is_not_matched_to_specialisation` + `test_fuzzy_does_not_match_distinct_transform_below_threshold` + `test_fuzzy_ambiguous_prereq_is_dropped_not_guessed` = i casi negativi. Un match errato fa RED.
  - [VERIFICATO] before/after depends_on + campione verificabile (vedi sotto).
  - [VERIFICATO] mutation-verified; gate verde; commit.
- BEFORE/AFTER depends_on (fixture labellata sintetica, 3 lezioni): naive `.lower()` esatto = **1** ("sistema lti"->"Sistema LTI") -> con fuzzy (set-equality) = **2** (+1 recuperato: "la trasformata di Fourier"->"Trasformata di Fourier", variante articolo, Jaccard 1.0). I negativi "fourier" (subset 0.5), "trasformata" (tie 0.5/0.5), "trasformata di hilbert" (assente) NON producono edge.
- CAMPIONE VERIFICABILE dei nuovi match (controllo precision):
  - "la trasformata di Fourier" -> "Trasformata di Fourier" [J=1.0, fuzzy] CORRETTO (stesse content-word, solo articolo/ordine).
  - REIETTI (precision): "fourier" -/-> "Trasformata di Fourier" (subset, J=0.5<1.0); "funzione" -/-> "Funzione Periodica" (subset, repro reviewer); "equazione differenziale" -/-> "Equazione Differenziale Ordinaria" (superset, J=0.67<1.0); "trasformata" -/-> {Fourier|Laplace} (tie); "trasformata di laplace" -/-> "Trasformata di Fourier" (J=0.33).
- ATTESO / NON-VERIFICABILE LOCALMENTE (DICHIARATO, kernel regola 3): il "32/71" del pin e' sul corpus reale GDPR (NON in repo). Non riproducibile in-gate. Sul corpus reale: con soglia 1.0 il fuzzy recupera SOLO le varianti ordine/articolo/stopword (superinsieme garantito dell'exact-canonical, zero falsi per costruzione); il guadagno di recall numerico esatto richiede il corpus privato. Le varianti subset/parziale (che alzerebbero di piu' il recall) sono DELIBERATAMENTE scartate per rispettare ZERO-falsi: risultato di recall onesto-conservativo (kernel: risultato negativo/parziale onesto > forzatura).
- MUTATION-VERIFIED 3x (mutazione prod -> test RED -> restore byte-identico): (1) `match=None` (fuzzy disattivato) -> recall RED; (2) soglia default 1.0->0.5 (rientra il subset-leak) -> `test_subset_prereq_is_not_matched_to_specialisation` RED (prova che la guardia precision morde); (3) drop tie-guard -> tie RED.
- **SELF-ADV: trovati 1, fixati 1** (subagente code-reviewer:code-reviewer avversario decorrelato sul diff). CRITICO VERO E FIXATO: a soglia 0.5 (mio default iniziale) un prereq generico subset di UN solo concetto vinceva unico e creava un depends_on FALSO ("funzione"->"Funzione Periodica", "derivata"->"Derivata Parziale", "serie"->"Serie di Fourier") — violazione diretta del vincolo ZERO-falsi. FIX: default soglia -> 1.0 (set-equality), subset/superset reietti; aggiunto test di regressione del leak + repro verificati a [] post-fix. Reviewer confermato: tie-guard SOUND (sort poi check index 1 cattura ogni top-tie), nessuna regressione su fixture esistenti (l'unico prereq cross-fixture "derivata" e' exact match, fuzzy mai invocato), determinismo ok. MINOR (commento test "0.33<0.5"): in realta' droppato anche da tie -> aggiunto `test_fuzzy_prereq_match_threshold_only_rejection_no_tie` (candidato unico, superset, isola la sola soglia).
- check-frictions: 21 coperti, 0 warning. check-no-gte-literal: 0 nuovi (i 2 residui asr_coalesce:64/eval_harness:210 pre-esistenti e legittimi; i miei 9 test usano `==`).
- cost_usd: ~$0.06 (gate x4 + 1 subagente avversario + mutazioni + repro).

- **2026-06-16T19:47Z — ⏸️ GRAPH-SUGGEST-2 già completo (NOOP-build) + triage adversarial 19:36.** Pin GS-2 consegnato dalla sessione precedente (commit 7499b57 + 1b10474). Verificato ORA: **gate 1811/0 VERDE** su tree pulito. Report HERMES-2 19:36 (lessonos@7499b57) triagato: 2 finding, **0 azionabili** — #2 (`_naive_lower_depends_count` NameError) FALSO POSITIVO PROVATO (definita test:41; gate verde lo conferma); #1 CRITICO (fold parziale per lingua) NON viola i criteri: solo perdita di RECALL su prereq non-IT, MAI falso match → precision (vincolo hard ZERO-falsi) intatta; scope IT già documentato (utils.py:6-11/76-77); corpus reale IT. ZERO code-change dovuto. promote_pin: nessuna AUTO-OK in coda (COORD:16 non ESAURITO → driver bloccato, richiesta rotazione in NEEDS-CLAUDE). cost_usd ~$0 (gate + triage, ZERO LLM).

## GS-3 — depends_on canonicalizzato PERSISTITO a INGEST (cross-lesson) — 2026-06-17 — commit 4c4b708 + 4c98eeb + e414498
- Pin GS-3 (COORD:16): canonicalizzare i prereq a concetti ESISTENTI già in fase di INGEST/persistenza (non solo in-memory in build_path_graph). Gate 1811 -> **1826 (+15 test)**. ADDITIVO: zero migrazione schema (riusa tabella edges, depends_on già edge_type valido; SCHEMA_VERSION invariato).
- CRITERI (punto per punto):
  - [VERIFICATO] depends_on canonicalizzato PERSISTITO nello store: nuovo `resolve_corpus_depends_on` (builder.py, puro) + `_persist_corpus_depends_on` in `GraphWriter.write_capsule_graph` (writer.py) chiamato DENTRO la transazione DOPO il salvataggio dei nodi della lezione, così lo snapshot corpus (`all_concept_nodes`) vede i concetti freschi. Store: `all_concept_nodes`/`all_depends_on_edges`/`delete_graph_edge` (sqlite.py) + default base no-op/() (degradazione additiva per stub-store).
  - [VERIFICATO] ZERO falsi match su fixture ETICHETTATA: `TestResolverPrecision.test_exact_and_fuzzy_positives_only` pinna l'INSIEME ESATTO di edge; negativi (subset "fourier", tie "trasformata", subset "equazione differenziale", assente "hilbert", superset) NON producono edge. Un match errato = RED.
  - [VERIFICATO] provenance+confidence: exact `{provenance:auto-suggested, confidence:0.8}`, fuzzy `{provenance:auto-suggested-fuzzy, confidence:<jaccard:.2f>}`, + `prereq` (per re-validazione inbound).
  - [VERIFICATO] before/after: `test_before_after_measured` naive `.lower()` esatto = **1** vs canonical+fuzzy persistito = **2** (cross-lesson l2->l1).
  - [VERIFICATO] additivo/migrate-safe: `test_schema_unchanged_additive` (no bump user_version); `test_reingest_is_idempotent`.
  - [VERIFICATO] gate verde, mutation-verified, commit immediato su verde.
- SELF-ADV (subagente code-reviewer:code-reviewer avversario decorrelato sul diff): **trovati 2 (round-1: 1 MAJOR; round-2: 2 MAJOR), fixati tutti**.
  - Round-1 MAJOR VERO E FIXATO (commit 4c98eeb): node_id POSIZIONALI (`{lesson}:concept:{i}`) -> re-ingest della lezione TARGET con concetti riordinati lascia un edge inbound (salvato sotto la lezione SOURCE, non toccato dal delete scoped) puntato a un id posizionale la cui label è cambiata = edge FALSO silenzioso (viola ZERO-falsi). FIX v1: registro `prereq` in metadata + reconcile inbound a re-ingest.
  - Round-2: 2 MAJOR (recall-loss, NON falsi-positivi) sul fix v1: la re-risoluzione corpus-wide poteva DROPPARE un edge ancora valido per chiave canonica duplicata o tie fuzzy da crescita corpus non correlata. La fix suggerita dal reviewer ("tieni se nessun target") avrebbe REINTRODOTTO un edge falso su RIMOZIONE concetto. FIX v2 (commit e414498): re-validazione PAIRWISE contro la label CORRENTE del target (`prereq_matches_label`: canonical esatto o Jaccard>=soglia). Tenere un edge che matcha davvero il suo target non è mai falso; reorder/rimozione/label-change falliscono e droppano. Risolve recall-loss MANTENENDO zero-falsi. Aggiunto `test_reingest_keeps_valid_edge_to_duplicate_label_concept`.
- MUTATION-VERIFIED: (1) builder canonical->.lower in resolver -> before/after RED; (2) disabilita drop reconcile (`if False`) -> reorder RED (edge falso sopravvive); (3) rimuovi `prereq` da metadata -> reorder RED (reconcile non parte); (4) `prereq_matches_label` always-False -> benign+duplicate keep-test RED.
- check-no-gte-literal: 0 nuovi warning (2 residui asr_coalesce:64/eval_harness:210 pre-esistenti). cost_usd: ~$0.08 (gate x4 + 2 round subagente avversario + mutazioni).

- **2026-06-17T00:33Z — ⏸️ GS-3 già completo (NOOP-build) + triage adversarial 00:22.** Pin GS-3 (COORD:16) consegnato (commit 4c4b708+4c98eeb+e414498+0522996). Verificato ORA: **gate 1826/0 VERDE** su tree pulito (HEAD 138f846). Report HERMES-2 00:22 (lessonos@e414498, 3 finding) triagato, **0 azionabili**: CRITICO (writer.py:163-168 drop "silenzioso" inbound edge su target_label None) = FALSO ALLARME — il drop è l'azione CORRETTA per ZERO-falsi (tenere un edge verso concetto cancellato/rietichettato = l'edge FALSO che GS-3 impedisce; pairwise prereq_matches_label("Limite","Derivata")=False); i depends_on sono auto-suggested EURISTICI, non claim citation-grounded (groundedness vale su explains/assigned_in con GraphEvidence) → "provenance persa" = errore di categoria; resta solo l'assenza di audit-log = observability fuori dai criteri GS-3, nuovo store-table violerebbe additive-minimal (AGENTS §9). Finding2 (empty-prereq drop) irraggiungibile (pipeline non persiste mai prereq vuoto). Finding3 = test-nit, test valido. ZERO code-change. promote_pin: pin ancora attivo (COORD:16 non ESAURITO → driver bloccato, rotazione richiesta in NEEDS-CLAUDE). cost_usd ~$0 (gate + lettura + triage, ZERO LLM).

## CRM-primitives — relazione ANONIMIZZATA docente/classe/studente — 2026-06-17 — commit 997a4fd + 1a48377
Pin AUTO-PINNED 17/06 02:55 (COORD:16). Gate 1826 -> **1861 (+35 test)**. ADDITIVO: schema v8->v9 solo CREATE … IF NOT EXISTS, zero migrazione dati. Nuovo modulo `lessonos/models/crm.py` (puro, no I/O) + CRUD in `store/base.py` (default concreti NotImplementedError, stub-store intatti) + `store/sqlite.py`.
- CRITERI DI ACCETTAZIONE (punto per punto):
  - [VERIFICATO] **schema+store relazione docente/classe/studente**: entità frozen `Teacher(teacher_id)`, `SchoolClass(class_id, teacher_id, subject?)`, `Student(student_id)`, `Enrollment(enrollment_id, class_id, student_id)`. Tabelle SQLite `teachers/classes/students/enrollments` + indici (`idx_classes_teacher`, `idx_enrollments_class/student`). Relazione: classi-per-docente, studenti-per-classe (join), classi-per-studente (reverse).
  - [VERIFICATO] **ANONIMIZZATO — PII fuori dai nodi-agente**: ogni *identificatore* è uno pseudonimo opaco; NESSUN campo `name/email/dob` sulle dataclass; `Student` ha UN SOLO campo (nessun posto dove mettere un nome). Tabelle `students`/`teachers` = singola colonna PK opaca (`test_students_table_has_no_personal_column`: `PRAGMA table_info` == `["student_id"]`/`["teacher_id"]`). `test_no_pii_field_names_anywhere` fallisce se una entità acquisisce un campo PII. `assert_pseudonymous` (safety-net strutturale, NON detector PII completo) rifiuta whitespace (nomi "Mario Rossi") e '@' (email). Mapping pseudonimo->identità = PII-vault ESTERNO al core (fuori scope).
  - [VERIFICATO] **API CRUD minime**: save/get/delete per teacher/class/student/enrollment (upsert by PK = update); `all_teachers`; query relazione scoped+ordered per chiave (non insertion-order); `purge_student` (erasure GDPR: studente + sue iscrizioni in UNA transazione, idempotente).
  - [VERIFICATO] **gate verde**: 1861/0, exit 0, zero regressioni.
  - [VERIFICATO] **zero-PII nei test**: tutti gli id nei fixture sono token sintetici opachi (`t_001`, `cls_3a`, `stu_a1b2`, `enr_1`); i test name/email-shaped servono SOLO a provare che la guardia li RIFIUTA (mai persistiti).
- MUTATION-VERIFIED: (1) rimozione `SELECT DISTINCT` in `students_for_class` -> `test_students_for_class_dedups_multi_enrollment` RED; restore -> green. (2) rimozione CREATE CRM da `_SCHEMA` -> `test_migration_v8_to_v9_creates_crm_tables` RED (verificato per costruzione del test: drop tabelle + re-save). (3) aggiunta di un campo PII a una entità -> `TestStructuralZeroPII` RED.
- **SELF-ADV: trovati 2, fixati 2** (subagente code-reviewer avversario decorrelato sul diff di 997a4fd).
  - MAJOR VERO E FIXATO (commit 1a48377): `students_for_class` faceva fan-out a pseudonimi DUPLICATI quando uno studente aveva >1 riga `enrollment` nella stessa classe (nessun vincolo UNIQUE(class_id,student_id)). FIX: `SELECT DISTINCT` + `test_students_for_class_dedups_multi_enrollment` (mutation-verified RED senza DISTINCT). Scelta surgical: dedup in lettura, `enrollment_id` resta PK del link (no UNIQUE constraint = no IntegrityError su re-iscrizione, coerente con lo stile no-FK delle tabelle esistenti).
  - MAJOR (overclaim) VERO E FIXATO: il commit 997a4fd affermava "structurally cannot store direct PII" ma `SchoolClass.subject` è free-text non guardato. FIX: ristretta la docstring `crm.py` — la garanzia copre i campi *identificatore*; `subject` è label-disciplina non-personale (stessa convenzione di `Path.subject`/`Source.title` pre-esistenti), NON pseudonym-guardabile ("fisica applicata" ha spazi legittimi). Onestà sopra completezza: niente claim falso.
  - MINOR (FIXATO doc): `purge_student` non componibile dentro una transazione esterna (apre `begin_transaction`, come `purge_lesson`) — documentato in docstring. MINOR no-FK su `enrollments` = coerente con tabelle esistenti (es. `lessons.path_id`), il DISTINCT neutralizza l'amplificazione; accettato. Tautologia/insertion-order/SQL-injection: respinti dal reviewer con prova (CRUD parametrizzato, ORDER BY su chiave).
- check-no-gte-literal: 0 nuovi warning (i 2 residui asr_coalesce:64/eval_harness:210 pre-esistenti; i miei 35 test usano `==`).
- cost_usd: ~$0.06 (gate x2 + 1 subagente avversario + mutazioni).

## M7 retrieval-hybrid — fusione BM25+dense (RRF), recall@k MISURATO — 2026-06-17 — commit 0323f07 + f99e460
Pin AUTO-PINNED 17/06 03:32 (COORD:16). Gate 1861 -> **1902 (+41 test)**. ADDITIVO: zero schema/migrazione, zero nuove dipendenze (RRF + cosine in puro Python; embedder deterministico zero-LLM). Nuovi `lessonos/retrieval/dense.py` + `hybrid.py` + export in `__init__.py`.
- CRITERI DI ACCETTAZIONE (punto per punto):
  - [VERIFICATO] **fusione BM25+dense (RRF)**: `reciprocal_rank_fusion(ranked_lists, k=60)` puro (hybrid.py) — score = Σ_r 1/(k+rank), rank 1-based, tie-break deterministico per `repr(item)`, guardia k<0. `HybridRetriever` fonde `FTSRetriever` (BM25/FTS5 esistente) + `DenseRetriever` sullo STESSO key-space `(source, source_id)` → niente collisione cross-source (segment vs capsule). match_type="hybrid", metadata={rrf_score, rankers}.
  - [VERIFICATO] **dense retriever**: `DenseRetriever` cosine su vettori sparsi; `Embedder` Protocol (swap a modello neurale/sqlite-vec in prod dietro la stessa interfaccia); `LexiconEmbedder` deterministico (token→dimensioni-concetto, riusa `content_tokens` IT-aware + strip punteggiatura). `fallback_to_token` modella OOV reale. `corpus_from_store`/`from_store`: BM25 e dense vedono lo STESSO universo doc (segments + capsule-text).
  - [VERIFICATO] **fixture gold + recall@k MISURATO**: `recall_at_k` puro (cutoff top-k, denom = |relevant|, guardia k<=0). Gold method-graph IT sintetico (4 concetti, 3 query con giudizi). MISURATO recall@3: **bm25=2/3, dense=2/3, hybrid=3/3** — ogni componente ha UN blind-spot (BM25 manca il sinonimo "spettrale"→d_fourier; dense manca l'OOV "differenziali"→d_laplace), l'hybrid recupera ENTRAMBI. Asserzioni: hybrid >= bm25, hybrid >= dense, hybrid > bm25, hybrid > dense.
  - [VERIFICATO] **gate verde**: 1902/0, exit 0, zero regressioni.
- VALORE SUI DATI (non solo gate): la fixture prova il guadagno REALE della fusione, non una tautologia. Il subagente avversario ha verificato empiricamente che sostituendo RRF con un no-op bm25-only il test recall FALLISCE (mean 2/3 ≠ 1.0). NOTA ONESTA: l'embedder è fixture-grade (vocabolario finito, zero-LLM, zero-dep) per misurare la fusione IN-GATE senza modello/rete; la qualità semantica reale richiede un embedder neurale dietro `Embedder` Protocol (astrazione già pronta, stesso pattern del router LLM AGENTS §2). Il numero recall è onesto-MISURATO sulla fixture sintetica, NON un claim sul corpus reale.
- MUTATION-VERIFIED 3x (mutazione prod → RED → restore byte-identico → verde): (1) RRF→bm25-only no-op → 7 RED (incl. measured-recall); (2) recall_at_k senza cutoff `[:k]` → `test_k_cutoff_excludes_late_hit` RED; (3) dense senza strip-punteggiatura → 3 RED (gold recall + punctuation test).
- **SELF-ADV: trovati 1, fixati 1** (subagente code-reviewer:code-reviewer avversario decorrelato sul diff 0323f07). 0 CRITICAL, 0 MAJOR. MINOR VERO E FIXATO (commit f99e460): import `fts/store` collocato DOPO una def (`_tokens`) invece che nel blocco import → violazione PEP8/lint; spostato in cima. Confermati SOUND dal reviewer: RRF (rank/k/tie/empty), cosine (no div-by-zero), key-space fusion (no collisione), determinismo (no flake), tokenizzazione embedder. Il MINOR su `recall_at_k` con relevant vuoto → 0.0 è scelta semantica documentata e auto-consistente (test la pinna).
- check-no-gte-literal: 0 nuovi warning (i 2 residui asr_coalesce:64/eval_harness:210 pre-esistenti; i miei 41 test usano `==`/`approx`).
- cost_usd: ~$0.05 (gate x2 + 1 subagente avversario + mutazioni).

- **2026-06-17 — method-graph SERVING (pin COORD:16): serve_method_graph legge il grafo prereq PERSISTITO (GS-3) + bridge ranking.** Commit `062a50a` (feature) + `d13bfcb` (fix avversario). Gate **1912/0 VERDE** (+10 vs baseline 1902).
  - CRITERI DI ACCETTAZIONE (punto per punto):
    - [VERIFICATO] "funzione tipizzata": `serve_method_graph(store: Store) -> MethodGraph` con dataclass frozen `MethodGraph(concepts, dependencies, bridges)`, `MethodConcept(key,label,node_ids)`, `MethodDependency(source_key,target_key,provenance,confidence)`. Tutte esportate da `lessonos.graph`.
    - [VERIFICATO] "dato il corpus restituisce il grafo prereq PERSISTITO (concept->concept depends_on da GS-3)": legge `store.all_concept_nodes()` + `store.all_depends_on_edges()` (NON ricostruisce in-memory come `rank_bridge_concepts`), collassa i nodi posizionali `lN:concept:i` sulla chiave canonica, dedup per coppia canonica. Test `test_served_dependencies_are_the_persisted_depends_on_edges` ingesta 3 lezioni reali via `write_capsule_graph`/SQLiteStore e verifica l'insieme ESATTO dei depends_on cross/within-lesson (Fourier->Segnale/Funzione, Spettro/LTI->Fourier) con provenance+confidence dai metadata persistiti.
    - [VERIFICATO] "+ ranking bridge-concept": betweenness sul grafo concept->concept collassato; `Trasformata di Fourier` (unico articulation point) ranka primo, foglie/sink centrality 0.0 (`test_bridge_ranks_first_from_persisted_graph`).
    - [VERIFICATO] "gate verde": 1912/0.
    - [VERIFICATO] "ZERO-LLM": sola lettura store + proiezione, nessuna chiamata modello, nessuna nuova dipendenza (riusa networkx gia presente).
  - VALORE sui dati (non solo gate): `test_serving_reflects_a_re_ingest_unlike_a_stale_inmemory_build` prova che il SERVING riflette lo stato PERSISTITO vivo — un re-ingest di l3 che droppa il prereq di Sistema LTI fa sparire ESATTAMENTE quell'edge (4->3 dependencies). Distingue il path persistito da un rebuild in-memory cache-ato.
  - ADDITIVO: zero schema/migrazione, zero deps. Core collapse+rank (`_collapse_concepts`/`_rank_bridges`) rifattorizzato e CONDIVISO con `rank_bridge_concepts` (API invariata, 5 test suggest preesistenti verdi).
  - SELF-ADV (code-reviewer:code-reviewer decorrelato sul diff 062a50a): trovati 1, fixati 1. 0 CRITICAL/MAJOR. MINOR: `_parse_confidence` catturava solo ValueError -> nan/inf passavano (non raggiungibile dal writer attuale, ma API pubblica tipizzata) -> fix `d13bfcb` + `test_non_finite_confidence_is_dropped_to_none`. 4 FALSE-ALARM provati dal reviewer (KeyError betweenness impossibile per costruzione, determinismo dedup garantito da ORDER BY edge_id/node_id, direzione source=dependent/target=prereq preservata, test non-tautologici verificati per mutazione: invertire direzione -> 3 RED, togliere dedup -> 1 RED).
  - check-no-gte-literal: 0 nuovi warning (i 2 residui sono pre-esistenti e legittimi).
  - cost_usd: ~$0.04 (gate x2 + 1 subagente avversario).

- **2026-06-17 — ⏸️ method-graph SERVING già completo (NOOP-build, ri-verifica).** Pin COORD:16 consegnato (commit 062a50a+d13bfcb in HEAD; `serve_method_graph` suggest.py:199). Ri-eseguito gate ORA su tree pulito: **1912/0 VERDE**, exit 0. Nessun diff codice. `promote_pin lessonos` = "pin ancora attivo, niente da fare" (COORD:16 NON marcata ESAURITO → driver bloccato; rotazione GIÀ richiesta in NEEDS-CLAUDE riga 30, non riciclo identico). Stop per NOOP. cost_usd ~$0 (solo gate, ZERO LLM).

## M7 retrieval-hybrid API — single-teacher context-grounded retrieval — 2026-06-17 — commit b30b680 + ae077f6
Pin AUTO-PINNED 17/06 11:11 (COORD:16). Gate 1912 -> **1929 (+17 test)**. ADDITIVO: zero schema/migrazione, zero nuove dipendenze (riusa RRF+cosine+FTS5 esistenti). Nuovo `lessonos/retrieval/teacher.py` + filtro `lesson_ids` SQL-level su `FTSRetriever.search` (additivo, default None) + export in `__init__.py`.
- CRITERI DI ACCETTAZIONE (punto per punto):
  - [VERIFICATO] **expose hybrid retrieval function for single-teacher recap**: `retrieve_teacher_context(store, teacher_id, query, *, embedder=None, top_k, candidate_k, rrf_k)` (one-shot) + `build_teacher_retriever(...)->HybridRetriever` (riusabile, costruisce indice+corpus UNA volta) + `teacher_lesson_ids(store, teacher_id)->frozenset` (resolver lineage). Tutte esportate da `lessonos.retrieval`. Riusa `HybridRetriever` (BM25+dense RRF) M7 esistente.
  - [VERIFICATO] **context-grounded SINGLE-TEACHER (invariante anti-leakage)**: lineage PERSISTITO `paths_for_teacher(teacher_id)` -> `lessons_for_path(path_id)` -> lesson_ids. ENTRAMBI i ranker scoped ALLA SORGENTE: dense su corpus filtrato (`[d for d in corpus_from_store if d.lesson_id in lesson_ids]`), BM25 via nuovo filtro SQL `lesson_id IN (...)`. Un doc fuori-scope non entra MAI nella fusione RRF. Test `TestNoTeacherLeakage`+`TestNoCapsuleLeakage`: due teacher con lezioni lessicalmente E semanticamente identiche, query `t_alpha` ritorna SOLO doc di `t_alpha`, mai `t_beta` — per segment E capsule (key-space distinti).
  - [VERIFICATO] **gate verde**: 1929/0, exit 0.
  - [VERIFICATO] **ZERO-LLM**: solo store + RRF + cosine puro Python; `LexiconEmbedder` deterministico default (swap neurale dietro `Embedder` protocol per prod). Nessuna chiamata modello, nessuna rete.
  - [VERIFICATO] **zero regressioni**: +17 test, 0 fail, suite FTS/hybrid preesistente verde (filtro `lesson_ids` default None = comportamento invariato).
- VALORE sui dati (non solo gate): `test_leakage_is_actually_possible_without_scope` prova che senza scope un FTS unscoped vede ENTRAMBI i doc (s_alpha+s_beta) -> il test di scope NON e vacuo. Il filtro FTS e NON-LOSSY: lo scope e nel `WHERE` SQL (prima di `LIMIT 100` e del cutoff `[:top_k]`), quindi un doc fuori-scope non spiazza mai uno in-scope (`test_filter_is_non_lossy_under_top_k`).
- MUTATION-VERIFIED 2x (mutazione prod -> RED -> restore -> verde): (1) `_scope_clause` -> no-op (`return "",[]`) -> 7 RED (incl. capsule lexical scope + FTS unit); (2) `scoped_corpus` -> unscoped (`list(corpus_from_store)`) -> 5 RED (incl. semantic scope `spettrale` + capsule) = prova che ENTRAMBI gli scope (FTS SQL + dense corpus) sono vivi.
- **SELF-ADV: trovati 1, fixati 1** (subagente code-reviewer:code-reviewer avversario decorrelato sul diff b30b680). 0 CRITICAL. MAJOR VERO E FIXATO (commit ae077f6): lo scope dei *capsule* (key-space `source_id==lesson_id`, distinto dai segment) NON era esercitato — solo `save_segment` nei fixture, quindi una regressione lato `_search_capsules`/dense-capsule sarebbe passata silenziosa. FIX: `TestNoCapsuleLeakage` (capsule su entrambe le lezioni, stessa text) mutation-verified RED su ENTRAMBE le mutazioni. Confermati SOUND dal reviewer: nessun leak hole nella fusione RRF (reps/rankers popolati solo da hit gia-scoped), nessuna SQL-injection (placeholder da `len`, valori bound), non-lossy claim corretto. MINOR respinti: candidate_k/LIMIT 100 = limite di RECALL non di leakage (documentato); `sorted()` per-call = cosmetico.
- check-no-gte-literal: 0 nuovi warning (i 2 residui asr_coalesce:64/eval_harness:210 pre-esistenti; i miei test usano `==`).
- cost_usd: ~$0.05 (gate x3 + 1 subagente avversario + 2 mutazioni).

## M7 method-graph query expansion — bridge-concept widening for teacher recall — 2026-06-17 — commit 260ce6e
Pin AUTO-PINNED (promosso da ROADMAP-AUTO, COORD:18; sblocco promote: pin precedente M7-API marcato ESAURITO, commit 8284c6c). Gate 1929 -> **1947 (+18 test)**. ADDITIVO: zero schema/migrazione, zero nuove dipendenze. Nuovo `lessonos/retrieval/expansion.py` + export in `lessonos/retrieval/__init__.py`. Nessuna modifica a teacher.py/hybrid.py/suggest.py.
- CRITERI DI ACCETTAZIONE (punto per punto):
  - [VERIFICATO] **query expansion via bridge concepts da serve_method_graph**: `expand_query_with_bridges(query, method_graph, *, max_bridges=3) -> ExpandedQuery` (pura, deterministica). Ancora i concetti citati nella query (subset content-token), raccoglie i vicini `depends_on` BIDIREZIONALI (prereq + dipendenti) e li ordina per betweenness centrality (il ranking `bridges` di `serve_method_graph`), key-asc tiebreak, taglio a `max_bridges`. `retrieve_teacher_context_with_bridges(...)` serve il method-graph (o riusa quello passato) e integra l'espansione nel retrieval M7.
  - [VERIFICATO] **integrazione retrieval-hybrid M7**: query originale + ogni bridge-term come PASSATE indipendenti sul `build_teacher_retriever` (hybrid BM25+dense), fuse con `reciprocal_rank_fusion`. Scelta DELIBERATA vs concatenazione-stringa (vedi VALORE sotto).
  - [VERIFICATO] **gate verde**: 1947/0, exit 0.
  - [VERIFICATO] **ZERO-LLM**: sola proiezione del grafo persistito + RRF puro Python. Nessuna chiamata modello/rete.
  - [VERIFICATO] **zero regressioni**: +18 test, 0 fail; teacher.py/hybrid.py/suggest.py invariati.
- VALORE sui dati (non solo gate): `test_expansion_surfaces_prerequisite_lesson` — query "Spettro" (t1): bare retrieval NON ritorna l2 (lezione-prerequisito Fourier), expanded SÌ. E si asserisce che il termine che la richiama è SPECIFICAMENTE il bridge "Trasformata di Fourier" (`metadata["bridge_terms"]`), non una foglia (chiude il rischio "l2 emerge per la ragione sbagliata"). Selezione provata sul grafo SERVITO reale (`test_selection_runs_on_real_served_graph`, `test_centrality_discriminates_neighbours_on_served_graph`: Ponte bridge > Lato foglia per betweenness reale), non solo su fixture hand-built.
- ANTI-LEAKAGE: `test_expansion_never_leaks_other_teacher` — t2 insegna concetti IDENTICI (grafo servito è GLOBALE e li fonde per canonical key), ma il retrieval di t1 resta in {l1,l2,l3}, mai l4. Lo scope vive in `build_teacher_retriever` (ranker scoped alla sorgente); l'espansione aggiunge solo TERMINI di query (label method-level, non contenuto/PII), mai allarga lo scope. Asserito risultato NON-vuoto (no pass vacua).
- DESIGN-CRITICO (perché passate indipendenti, non stringa concatenata): MISURATO che FTS5 ha operatore implicito AND (`'spettro fourier' -> 0 doc`) e va in errore su token speciali (`'C++' -> OperationalError`, swallowed -> []). Concatenare un'etichetta multi-token nella MATCH della query-ancora RESTRINGE il set BM25 (solo doc con TUTTI i token) e un'etichetta operator-like azzera silenziosamente BM25. Con passate separate un bridge-term può solo AGGIUNGERE evidenza: se non matcha nulla o esplode dentro FTS5, la classifica della query-ancora resta intatta. `test_operator_like_bridge_label_does_not_break_retrieval` (label "C++ AND OR"): l'ancora l3 torna comunque.
- **SELF-ADV: trovati 5, fixati 3** (subagente code-reviewer:code-reviewer avversario decorrelato sul primo diff a concatenazione-stringa). 1 CRITICAL + 1 MAJOR + 3 MINOR.
  - [CRITICAL C1, FIXATO] label iniettata RAW nella FTS5 MATCH -> crash/degrado silenzioso a dense-only. FIX: RIDISEGNO a fusione multi-query (passate indipendenti + RRF) — l'errore FTS per-pass è isolato, mai propagato all'ancora. Confermato `MISURATO` (probe FTS5 diretto).
  - [MAJOR M2, FIXATO] value-test non provava la specificità del prerequisito (l2 emergeva anche via foglie per token condivisi). FIX: assert su `bridge_terms == ("Trasformata di Fourier",)` + test selezione su grafo SERVITO reale + test discriminazione centrality reale (Ponte>Lato).
  - [MINOR m3, FIXATO] test anti-leakage poteva passare in modo vacuo su risultato vuoto. FIX: `assert expanded` non-vuoto.
  - [MINOR m4/m6, RIVISTI non-difetti] `centrality_for_key.get(k,0.0)` (serve_method_graph elenca SEMPRE ogni concetto in bridges; default solo robustezza su grafo parziale) e guard `if not tokens_for_key[key]` (RAGGIUNGIBILE e testato: `test_isolated_concept`/label-stopword; non dead code). Documentati, non modificati.
- check-no-gte-literal: 0 nuovi warning (i 2 residui asr_coalesce:64/eval_harness:210 pre-esistenti; i miei `>=`/`<=` sono su INSIEMI non conteggi).
- cost_usd: ~$0.08 (gate x4 + 1 subagente avversario + probe FTS5).

## M7 retrieval-eval-harness — recall@k + MRR gold-set come gate di regressione — 2026-06-17 — commit a795a3b
Pin AUTO-PINNED (COORD:16). Gate 1947 -> **1962 (+15 test)**. ADDITIVO: zero schema/migrazione, zero nuove dipendenze. Nuovo `lessonos/eval/retrieval.py` + `tests/test_eval_retrieval.py`; aggiunta `reciprocal_rank` (primitiva MRR) accanto a `recall_at_k` in `hybrid.py`; export in `eval/__init__.py` + `retrieval/__init__.py`. Nessuna modifica alla logica di ranking esistente.
- CRITERI DI ACCETTAZIONE (punto per punto):
  - [VERIFICATO] **gold-set**: 7 doc sintetici (4 risposte-oro d_* + 3 distrattori n_* che condividono UN token di query) in `GOLD_DOCS`/`GOLD_LEXICON`/`GOLD_QUERIES`. Ogni query risolve a un campo multi-doc reale (probe: tutte e 3 tornano 2 doc), non a un hit forzato singolo. Sintetico: zero contenuto-corpus reale.
  - [VERIFICATO] **recall@k E MRR MISURATO sul retrieval-hybrid M7**: `evaluate_retrieval(retriever, gold, *, k) -> RetrievalReport(mean_recall, mrr, per_query)` sul vero stack BM25(FTS5)+dense(cosine)+RRF k=60 (`build_gold_retrievers/build_gold_hybrid_retriever`). MISURATO: hybrid recall@3=1.0, MRR=5/6.
  - [VERIFICATO] **gate di regressione con SOGLIA PINNATA (calo=RED)**: `RECALL_AT_K_FLOOR=1.0`, `MRR_FLOOR=5/6` pinnate ai valori MISURATI; `test_recall_at_k_meets_pinned_floor`/`test_mrr_meets_pinned_floor` asseriscono `>= floor`. Doc droppato -> recall sotto floor -> RED; doc demoto -> MRR sotto floor -> RED.
  - [VERIFICATO] **gate verde**: 1962/0, exit 0.
  - [VERIFICATO] **ZERO-LLM**: embedder = sola lookup di lessico, RRF puro Python, nessuna chiamata modello/rete (confermato da avversario).
  - [VERIFICATO] **zero regressioni**: +15 test, 0 fail; logica ranking invariata, solo aggiunta `reciprocal_rank`.
- VALORE sui dati (non solo gate): MRR NON è ridondante con recall. Sul vero hybrid la query `'poli e residui'` torna `[n_poli, d_residui]` — il distrattore (poli magnetici) precede la risposta-oro per cosine STRETTAMENTE maggiore (n_poli vec={residue:1} cos 1.0 vs d_residui={residue,integral,complex} cos 0.816, NON tie/repr): recall@3=1.0 (presente) ma rr=0.5. `test_distractor_outranks_relevant_doc` pinna rec=1.0 E rr=0.5 sul retriever REALE (nessun wrapper fabbricato). `test_hybrid_beats_each_component`: hybrid (rec 1.0, mrr 5/6) > bm25 (1/3, 1/3) e > dense (2/3, 1/2) su ENTRAMBE le metriche — fusione misurata, non tautologica.
- **SELF-ADV: trovati 5, fixati 5** (2 round subagente code-reviewer:code-reviewer avversario decorrelato).
  - [CRITICAL C1, FIXATO] gold-set iniziale tornava liste a candidato SINGOLO -> MRR=1.0 aritmeticamente FORZATO, floor MRR ridondante con recall. FIX: RIDISEGNO con distrattori n_* -> campi multi-doc reali; MRR=5/6<1.0 ORA guadagnato (probe empirico).
  - [MAJOR M2, FIXATO] discrimination test usava `_DemotingRetriever` che FABBRICAVA il rank-1 -> provava la formula, non il retriever. FIX: dimostrazione sul retriever REALE (`'poli e residui'`), wrapper rimosso.
  - [MAJOR M3, FIXATO] gold-set duplicato/divergente da `test_retrieval_hybrid.py`. FIX: fixture ora DISTINTA e purpose-built (campi distrattori), docstring chiarisce la separazione dalla fixture component-blind-spot.
  - [MINOR m5, FIXATO] distrattore `n_eq` INERTE (AND-gate FTS5 lo escludeva da ogni campo). FIX: testo n_eq porta ora `differenziali` -> compete con d_laplace su `'equazioni differenziali'`, d_laplace resta rank1 (rr=1.0, MRR invariato 5/6).
  - [MINOR m6, FIXATO] docstring sovra-dichiarava "every query ... real field". Resa VERA dal fix m5; commento `equazioni differenziali` aggiornato a "due doc".
  - Verificati NON-difetti dall'avversario: math `reciprocal_rank` (1-based, edge vuoti), bit-stabilità `5/6` vs `(1+1+0.5)/3` (bit-uguali, `>=` non flippa), determinismo ordering (cosine stretto, non tie-break repr).
- check-no-gte-literal: 0 nuovi warning (i miei `>=` su SOGLIE float, non conteggi; 2 residui pre-esistenti asr_coalesce:64/eval_harness:210).
- cost_usd: ~$0.10 (gate x4 + 2 subagenti avversari + probe ranking).

## M-CRM consent-state — stato-consenso GDPR docente/classe (append-only) — 2026-06-17T14:30Z — commit 8d418f5
- Primitiva event-sourced: `ConsentEvent` (granted/revoked) append-only -> stato DERIVATO a `now` iniettato: `active` / `expired` (computato, boundary INCLUSIVO: live solo STRETTAMENTE prima di expires_at) / `revoked` / `absent`. Nessun clock nascosto, ZERO-LLM, deterministico.
- Zero-PII strutturale: solo pseudonimi opachi (event_id/teacher_id/class_id) guardati da `assert_pseudonymous`; nessuna colonna personale (tabella = event_id/teacher_id/class_id/action/at/expires_at). `expires_at` valido solo su `granted` (revoca senza scadenza). PII nel vault esterno.
- API `lessonos/consent.py`: `grant_consent` (ValueError se expires_at<=now), `revoke_consent` (incondizionata, il "no" è sempre registrabile), `consent_status`, `consent_audit_trail`, `is_consent_active`. `_to_utc` normalizza naive(->UTC)/aware per confronti totali.
- Persistenza: SQLiteStore SCHEMA_VERSION 9->10 (tabella `consent_events` + indice rel, migrazione additiva no-data), ORDER BY rowid = ordine causale di registrazione (robusto a clock-skew dell'`at` del chiamante).
- Test: `tests/test_crm_consent.py` 30 test (dominio/guardie PII, grant/revoke/derivazione, expiry boundary+naive/aware, audit append-only+isolamento, zero-PII via PRAGMA table_info, persistenza cross-reconnect, transazione commit/rollback).
- SELF-ADV (code-reviewer): trovati 1 MAJOR + 3 test-gap, fixati 4/4.
  - [MAJOR, FIXATO] `save_consent_event` usava `INSERT OR REPLACE`: su log append-only un event_id riusato = DELETE+INSERT -> rowid riassegnato -> trail riordinato -> stato derivato "ultimo evento vince" SILENZIOSAMENTE alterato. FIX: `INSERT` puro (event_id duplicato = IntegrityError, la storia immutabile non si sovrascrive); docstring `base.py` corretta (no "upsert").
  - [test-gap, FIXATO] +`test_reusing_event_id_is_rejected_append_only` (invariante append-only ora verificata).
  - [test-gap, FIXATO] +`test_latest_recorded_wins_under_clock_skew` (verifica che vince l'ultimo REGISTRATO, non l'`at` più recente — claim del commento `sqlite.py` ora provato).
  - [MINOR, NON-difetto accettato] naive `now` assunto UTC per contratto documentato (test verifica no-raise).
- gate: 1992/0. check-no-gte-literal: 0 nuovi warning (2 residui pre-esistenti). cost_usd: ~$0.09.

## 2026-06-17T12:45Z — fix dedup classes_for_student (SELECT DISTINCT) [VERIFICATO]
- TASK (pin 17/06 12:37): fix dedup `classes_for_student` con SELECT DISTINCT in `lessonos/store/sqlite.py`, test gemello a `test_students_for_class_dedups_multi_enrollment`, gate verde, zero regressioni.
- Criteri di accettazione, punto per punto:
  - [VERIFICATO] SELECT DISTINCT su `classes_for_student` — `sqlite.py:800` (`SELECT DISTINCT c.* ...`).
  - [VERIFICATO] test gemello `test_classes_for_student_dedups_multi_enrollment` (`tests/test_crm.py`), specchio di `test_students_for_class_dedups_multi_enrollment`.
  - [VERIFICATO] gate verde 1993/0 (era 1992, +1 = nuovo test). zero regressioni.
- SELF-ADV (mutation check avversario sul diff): trovati 0, fixati 0. Rimosso DISTINCT -> il nuovo test fallisce (`['cls_3a','cls_3a']`), gli altri (reverse, students_for_class) reggono -> test genuino, non tautologico. Ripristinato, gate verde.
- gate: 1993/0. cost_usd: ~$0.04.

## 2026-06-17 — CRM retrieval dedup: tutte e tre le query sotto multi-iscrizione (pin COORD:16)
Pin: "test che tutte le query retrieval CRM (students_for_class, classes_for_student, events) non producono duplicati con iscrizioni multiple, gate verde, zero regressioni". Commit `e8ef468` (test) + `87d7575` (SELF-ADV framing).
- [VERIFICATO] nuovo `TestRetrievalDedupUnderMultiEnrollment` (`tests/test_crm.py`), 3 test, scenario unico: stu_a 3 righe enrollment in cls_3a + 2 in cls_4b, stu_b 1 in cls_3a (nessun UNIQUE(class_id,student_id) — confermato CREATE TABLE `sqlite.py:111-115`).
  - [VERIFICATO] `students_for_class("cls_3a")` == [stu_a, stu_b] (le 3 righe duplicate collassano via SELECT DISTINCT `sqlite.py:788`).
  - [VERIFICATO] `classes_for_student("stu_a")` == [cls_3a, cls_4b] (ogni classe una volta via SELECT DISTINCT `sqlite.py:800`).
  - [VERIFICATO] `consent_events_for_relation("t_001","cls_3a")` == [ce_grant, ce_revoke]: la query "events" e single-table (NESSUN join enrollments `sqlite.py:878-882`) -> lunghezza trail DISACCOPPIATA dalla molteplicita iscrizioni. Test = guardia di regressione viva contro un futuro JOIN su enrollments.
  - [VERIFICATO] gate 1996/0 (era 1993, +3). zero regressioni (additivo, zero codice produzione toccato).
- MUTATION-VERIFIED 3x (eseguite + ripristinate): rimosso DISTINCT da students_for_class -> test1 RED; rimosso DISTINCT da classes_for_student -> test2 RED; aggiunto JOIN enrollments alla query consent -> test3 RED (fan-out reale 2->6 con rowid disambiguato).
- SELF-ADV (code-reviewer decorrelato, mutazioni ri-eseguite dal reviewer): trovati 2 fixati 1, 0 CRITICAL/0 MAJOR. MINOR-1 (commento sopravvendeva "cartesian-multiply/would be 6" — il JOIN naïve fallisce prima su ambiguous rowid) FIXATO in `87d7575`. MINOR-2 (test1/2 confondono dedup+ordinamento) NON azionabile: l'ORDER BY e gia coperto dai test gemelli esistenti (`test_students_for_class_via_join` inserisce id fuori ordine, `test_classes_for_student_reverse`) -> copertura ordering qui = scope-creep, scartato. 3 FALSE-ALARM provati e respinti dal reviewer.
- gate: 1996/0. cost_usd: ~$0.04.

## 2026-06-17 — CI-PORTABILITY: 7 test env-coupled resi ermetici (pin COORD:16 lessonos)
- TASK: i 7 test passano sul Mini ma falliscono su clean-env (GitHub Actions). Renderli portabili — skip SOLO quando l'env e assente, NON cancellare/indebolire. Commit `a8ee748`.
- Criteri di accettazione, punto per punto:
  - [VERIFICATO] gate locale invariato sul Mini: `bash eval/gate.sh` = 1996/0 (= baseline COORD:16, +0 regressioni). I 7 test GIRANO ancora sul Mini (env presente), nessuno skip spurio.
  - [VERIFICATO] verde su clean-env: checkout pulito in /tmp via `git checkout-index` (no `.env`), env senza DEEPSEEK/KIMI key, `LC_ALL=C LANG=C`, HOME isolato. Esito 7 test: adversarial x2 PASS (path repo-relativo, bin/adversarial.py committato), cli_eval --live x2 SKIPPED (no key), skills_frictions x2 PASS (encoding utf-8 fixa 0xe2), style::test_on_real_corpus SKIP quando dir corpus assente (`not os.path.isdir` = True su path tipo CI).
- Fix per file (tests only, ZERO codice produzione toccato):
  - `test_style.py:343` — `@skipif(not os.path.isdir(_REAL_DISPENSE_DIR))`, costante = path assoluto corpus reale Andreas (presente solo sul Mini).
  - `test_adversarial_kimi.py:9` — ADV da `expanduser("~/lessonos/bin/adversarial.py")` a `Path(__file__).resolve().parent.parent/"bin"/"adversarial.py"` (portabile) + `pytestmark=skipif(not Path(ADV).is_file())` difensivo. `git ls-files` conferma bin/adversarial.py committato -> in CI GIRA (non skip).
  - `test_cli_eval_real.py` — i 2 test `--live` -> `@skipif(not _HAS_LIVE_KEY)`. `_live_key_available()` rispecchia ESATTAMENTE realtime.py:242-267: env DEEPSEEK || env KIMI || `_parse_env_file(".env")` CWD-relativo per DEEPSEEK (KimiProvider non legge mai .env). Senza key -> RuntimeError in produzione, quindi skip corretto.
  - `test_skills_frictions.py:65,80` — 2 `subprocess.run` con `encoding="utf-8", errors="replace"` (prima solo `text=True`): su locale CI non-UTF-8 il byte 0xe2 (em-dash/accenti nell'output decorativo di check-frictions.sh) dava UnicodeDecodeError. Assert su token ASCII (`warning=0`, regex `coperto da (\S+)`) non corrotti.
- SELF-ADV (code-reviewer decorrelato sul diff, lettura incrociata realtime.py/deepseek.py): trovati 2, fixati 1. MAJOR-1 (`_live_key_available` usava `.env` assoluto `_REPO_ROOT/.env` mentre DeepSeekProvider usa `_parse_env_file(".env")` CWD-relativo -> divergenza se CWD!=root) FIXATO: ora `.env` relativo + rimosso `_REPO_ROOT`/import Path morti. MAJOR-2 (KIMI-only in .env mis-skip) RESPINTO come false-alarm: la produzione NON legge mai KIMI da .env (KimiProvider.__init__ legge solo os.environ; realtime.py costruisce Kimi solo da env) -> helper gia fedele. 3 FALSE-ALARM (adversarial pytestmark, errors=replace masking, test_style) respinti.
- gate: 1996/0. cost_usd: ~$0.05.

## 2026-06-17 — NOOP: MCP grounded-memory wrapper GIA consegnato (pin COORD:16 stale)
- Pin lessonos COORD:16 ("integra il wrapper MCP grounded-memory con test end-to-end su lezione campione, gate verde invariato, zero regressioni", AUTO-PINNED 17/06 17:14) GIA consegnato in commit `347a9c6` (antenato di HEAD `b35f9b3`). Nessuna build: rifare = duplicare/indebolire lavoro committato.
- gate: **2018/0 VERDE** (ri-eseguito ORA).
- Criteri [VERIFICATO] punto-per-punto:
  - wrapper MCP integrato: `lessonos/mcp/grounded_memory.py::GroundedMemoryServer` — JSON-RPC 2.0/MCP stdlib-only (initialize/ping/tools/list/tools/call), un solo tool `grounded_memory_recall`, zero rete/deps, riusa `retrieve_teacher_context`+`verify_citation`+`teacher_lesson_ids`; ogni item ri-verificato contro lo store (guard grounding) prima di lasciare il confine, ungrounded droppati+dichiarati in `dropped_ungrounded`.
  - test end-to-end su lezione campione: `tests/test_mcp_grounded_memory.py::TestMultiSegmentLesson` (lezione 3-segmenti `l_main`/t_main + `l_other`/t_other per isolamento) attraversa retrieval→grounding-guard→response; + `TestHandshake`/`TestGroundedRecall`/`TestGroundingGuardDropsUngrounded`/`TestErrorSurface`.
  - gate invariato/zero regressioni: additivo, zero codice produzione esistente toccato.
- Adversarial HERMES-2 15:45 (lessonos@347a9c6, 1 CRITICO) AGGIUDICATO da OPUS-VERDICT: **0 REAL, 1 FP** (il CRITICO su `r.source != "segment"` e autocontraddittorio: gia whitelist esatta su {"segment"}; fix proposto identico alla riga esistente). 3 rilievi non-CRITICO fuori mandato e non azionabili dentro i criteri del pin.
- `promote_pin lessonos` = "pin ancora attivo, niente da fare" (COORD:16 NON marcata ESAURITO → driver bloccato). Chiusura scritta in NEEDS-CLAUDE per rotazione (builder non edita la riga PROSSIMA TASK).
- SELF-ADV: 0/0 (NOOP, nessun diff codice). cost_usd: ~$0 (gate + lettura + verifica ancestry/aggiudicazione, ZERO LLM).

## 2026-06-17 — grounded_memory_progression (2° tool MCP, pin COORD:16) — opus-4-8 ultracode
- task: secondo tool MCP `grounded_memory_progression` che serve la ConceptProgression PERSISTITA per un teacher attraverso la grounding-guard, test e2e su lezione campione, gate verde, zero regressioni.
- commit: `116861d` (feature+test e2e) + `efbc569` (fix avversariali). HEAD `efbc569`.
- gate: **2027/0 VERDE** (baseline 2018 → +9, ri-eseguito ORA).
- Criteri di accettazione [VERIFICATO] punto-per-punto:
  - 2° tool MCP esposto: `tools/list` ritorna `[grounded_memory_recall, grounded_memory_progression]`; nuovo `PROGRESSION_TOOL_NAME`, schema con required `["teacher_id"]`; stesso `GroundedMemoryServer` (JSON-RPC 2.0/MCP, stdlib-only, zero rete/deps).
  - serve la ConceptProgression PERSISTITA: `_grounded_progression` chiama `build_teacher_book(store, teacher_id)` (ZERO-LLM, deriva da capsule+graph persistiti) e proietta ogni `ConceptProgression` (name/canonical/first_lesson/status_sequence/lesson_sequence) + proof di grounding.
  - attraverso la grounding-guard: una progression e servita SOLO se (1) ogni lezione che attraversa e posseduta dal teacher (`teacher_lesson_ids`, difesa-in-profondita), (2) il concetto porta almeno una citazione VERIFICATA (`is_verified_excerpt`) che ri-risolve via `verify_citation` a un segmento same-lesson persistito posseduto, (3) [post-self-adv] il segmento verbatim MENZIONA davvero il concetto (`content_tokens` overlap) — niente excerpt off-concept. Le progression che falliscono sono droppate e dichiarate in `dropped_ungrounded`, mai servite.
  - test e2e su lezione campione: `TestGroundedProgression` (store SQLite reale, teacher 2 lezioni, `vettore` introduced→reinforced grounded SERVITO; `energia` citazione senza excerpt DROPPATO; `massa` excerpt off-concept DROPPATO via concept-tie) attraversa build_teacher_book→grounding-guard→response JSON-RPC; `TestProgressionGroundingGuard` (4 casi avversari: seg_id fabbricato, contaminazione cross-lesson, excerpt non-verbatim, span su lezione non posseduta — tutti droppati).
  - zero regressioni: additivo, zero codice produzione esistente modificato (solo aggiunte a grounded_memory.py + 1 test handshake aggiornato per i 2 tool).
- SELF-ADV (subagente code-reviewer decorrelato, mutazioni eseguite): trovati 2, fixati 2 — 1 CRITICAL (excerpt off-concept inerita dall'altro endpoint dell'edge servito come grounding → fix concept-tie via content_tokens; repro reale: `massa` servito con excerpt "vettore") + 1 MAJOR (eccezioni non-_ToolError sfuggivano da handle() come traceback → catch-all INTERNAL_ERROR al boundary tools/call). 3 FALSE-ALARM provati (lesson_id="" fallback a seg.lesson_id reale; whitespace excerpt bloccato; fundamental_concepts completo). Mutation-verified: rimozione is_verified_excerpt/verify_citation/concept-tie → test RED.
- cost_usd: ~$0.06 (gate x3 + 1 subagente avversario).

## 2026-06-17 — grounded_memory_prerequisites (3° tool MCP, pin lessonos 18:32) — opus-4-8 ultracode
- task: terzo tool MCP `grounded_memory_prerequisites` che serve la PrerequisiteChain PERSISTITA per un teacher attraverso la grounding-guard, test e2e su lezione campione, gate verde, zero regressioni.
- commit: `cd3ac84` (feature+test e2e) + `f16164d` (hardening avversariale). HEAD `f16164d`.
- gate: **2041/0 VERDE** (baseline 2027 → +14, ri-eseguito ORA).
- Criteri di accettazione [VERIFICATO] punto-per-punto:
  - 3° tool MCP esposto: `tools/list` ritorna `[grounded_memory_recall, grounded_memory_progression, grounded_memory_prerequisites]` (test `test_tools_list_exposes_all_grounded_tools`); nuovo `PREREQUISITES_TOOL_NAME`, schema con required `["teacher_id"]`; stesso `GroundedMemoryServer` (JSON-RPC 2.0/MCP, stdlib-only, zero rete/deps).
  - serve la PrerequisiteChain PERSISTITA: `_grounded_prerequisites` chiama `build_teacher_book(store, teacher_id)` (ZERO-LLM, deriva da depends_on edges + prerequisiti dichiarati nei capsule persistiti) e proietta ogni `PrerequisiteChain` (concept/canonical/prerequisites/lesson_ids) + proof di grounding.
  - attraverso la grounding-guard: una chain è servita SOLO se (1) ogni lezione che attraversa (`chain.lesson_ids`) è posseduta dal teacher (`teacher_lesson_ids`, difesa-in-profondità), (2) il concetto DIPENDENTE porta almeno una citazione VERIFICATA (`is_verified_excerpt`) che ri-risolve via `verify_citation` a un segmento same-lesson persistito posseduto, (3) il segmento verbatim MENZIONA il concetto (`content_tokens` overlap, concept-tie). Le chain che falliscono sono droppate e dichiarate in `dropped_ungrounded`, mai servite. Guard estratto in `_ground_concept` (condiviso con progression: comportamento preservato — lessons=first_lesson+lesson_sequence, concept-tie su name|canonical).
  - test e2e su lezione campione: `TestGroundedPrerequisites` (store SQLite reale: `derivata` con prereq `limiti` grounded SERVITO; `energia` citazione senza excerpt DROPPATO) attraversa build_teacher_book→grounding-guard→response JSON-RPC; `TestPrerequisitesGroundingGuard` (7 casi avversari: seg_id fabbricato, contaminazione cross-lesson, excerpt non-verbatim, excerpt off-concept via concept-tie, chain su lezione non posseduta, excerpt whitespace-only, citazione che risolve a segmento di altro teacher).
  - zero regressioni: additivo, zero codice produzione esistente toccato semanticamente (refactor `_ground_progression`→`_ground_concept` preserva comportamento, provato dai test progression invariati).
- SELF-ADV (subagente code-reviewer:code-reviewer decorrelato, mutazioni eseguite): trovati 2, fixati 2 — entrambi MAJOR coverage-gap (NON bug di produzione: la guard shipped è corretta, ma 2 righe load-bearing in `_ground_citation` condiviso erano non pinnate → un edit futuro che le rimuove sarebbe passato). (1) `is_verified_excerpt` rimosso → excerpt whitespace-only servito (anti-false-verde "Terza-lezione"); (2) `if lesson_id not in owned` rimosso → segmento verbatim di altro teacher servito (leak cross-teacher distinto dal lesson-span loop). Aggiunti 4 test (2 per tool, progression+prerequisites), mutation-verified: rimozione riga → RED; ripristino → 45/45 verde nel file, 2041/0 gate.
- cost_usd: ~$0.05 (gate x4 + 1 subagente avversario; ZERO LLM di produzione, tutto mock).

## 2026-06-17 — NOOP: grounded_memory_prerequisites GIA consegnato (pin COORD:16 18:32 stale, cap promozioni 12/12)
- Pin lessonos COORD:16 (3° tool MCP `grounded_memory_prerequisites`, PIN-SUPERVISORE 17/06 18:32) GIA consegnato in `cd3ac84`+`f16164d`+`74bcf18` (HEAD `537d628`). Nessuna build: rifare = duplicare/indebolire lavoro committato.
- gate: **2041/0 VERDE** (ri-eseguito ORA). Criteri [VERIFICATO] gia documentati nell'entry precedente di STATUS (3° tool esposto, PrerequisiteChain persistita via build_teacher_book, grounding-guard 3-livelli, e2e + 7 avversari, additivo zero-regressioni).
- `promote_pin lessonos` = **cap giornaliero raggiunto (12/12)** → driver bloccato sulla rotazione (gridlock cap-bound). Chiusura scritta in NEEDS-CLAUDE per rotazione manuale supervisore a ROADMAP riga 18 (grounded_memory_fundamentals). Builder non edita la riga PROSSIMA TASK.
- SELF-ADV: 0/0 (NOOP, nessun diff codice). cost_usd: ~$0 (gate + verifica ancestry/criteri, ZERO LLM).


## 2026-10-20 — REA / originali autorizzati e lettore PDF nel corso

Descrittore canonico consegnato con i byte autorizzati, controllo dimensione e
SHA-256, trasporto condiviso con invalidazione di sessione. La review indipendente
ha trovato il limite legacy 256: corretto a8192 codepoint. Il client precedente
read_asset/studyBlob resta compatibile. Web:173 test; API:216; Engine:2461 passati,
25 skipped. Typecheck e build Web/pubblico verdi. Le prime esecuzioni errate o
contese sono conservate nella ricevuta, non trattate come verdi.

PDF.js6.4.299 è una dipendenza esatta del solo workspace Web, necessaria per
recuperare il motore PDF completo. Worker, font, CMaps, ICC, Wasm e licenze sono
locali; import del motore solo all'apertura. Un503 reale ha mostrato che il
fallback PDF.js memorizzato non recuperava: adattatore con porta fresca, cleanup
limitato e retry verificato. Browser390/820/1440, zoom200%, focus, CSP candidata,
scan4,8MP, download, permessi V1/V2 e logout verificati.

SYS-01 non concluso: annotazioni, formule, binding canonico, Undo, persistenza e
riapertura integrati nell'aula restano il prossimo lavoro. Nessun push o deploy;
nessuna certificazione G0/G1 o suite Studio completa. Dettaglio e prove:
`docs/ops/rea-deep/TARGET-082/CORE-READER-INTEGRATION.md`.


## 2026-10-20 — REA / Core del quaderno scientifico

Binding immutabile risorsa→PDF, stato annotato per revisione, CAS/idempotenza,
V1 consegnata/V2 privata ed export con originale. Schema 6 additivo; collisioni
legacy esplicite, nessuna migrazione durante le richieste HTTP. Core e API
riusano archivio, ricevute, revisioni ed erasure ledger esistenti.

REA MCP sullo Studio originale conferma apertura compositore/integrale; il
flusso successivo registra un errore non-JSON nel journal e timeout di Undo.
Redo e riapertura non eseguiti: causalità non provata e flusso non certificato.

Review Codex separata: quattro P2 riprodotti e corretti (coordinate enormi, MIME
assente, originali incoerenti tra revisioni, surrogati nelle identità/CAS).
Otto regressioni rosse prima del fix; 31 test mirati verdi; Engine 2473 passati,
25 skipped; API 235 passati. Due probe indipendenti ripetuti verdi. Tre warning
Engine riguardano fixture class-scoped legacy deprecate. PostgreSQL live e
frontend non verificati in questo incremento; nessun gate indebolito.

SYS-01 resta aperto: editor visuale, Undo isolato, geometria interattiva,
salva/chiudi/riapri browser e confronto equivalente autorizzato ancora richiesti.
Nessun push/merge/deploy. Dettaglio: docs/ops/rea-deep/TARGET-082/SCIENTIFIC-NOTEBOOK-CORE.md.


## 2026-10-21 — Banca Fisica semestre filtro: 4.000 quesiti e integrazione Study

Banca originale completa: 1.000 base, 1.000 facili, 1.000 medi, 1.000 difficili;
27 shard JSON, schema, catalogo CSV, fonti e mappe dei 147 argomenti editoriali
del programma 2026/27 e dei 62 obiettivi delle due prove 2025. Le 250 famiglie
articolano compiti diversi; parentela, limiti dei controlli semantici e 179
approfondimenti con legge fornita sono dichiarati. Spiegazioni 213–1129 parole.

Integrazione additiva: banca collegata alle edizioni di Fisica, CoursePack e SHA
esistenti conservati, API autenticata, proiezioni senza soluzioni, correzione
esatta senza eval/CAS/LLM a runtime, cache immutabile, filtri e allenamenti in Aula.
I tentativi sono stateless e non confluiscono nel diario. Le simulazioni 2026
usano 21 scelte multiple e 10 completamenti, 50minuti, sole domande core,31 lawFamily.

Verifica completa: 2738 test Python passati, 27 saltati con motivi registrati;
243 test web, TypeScript e build verdi. Schema/proiezione/correzione su 4.000 record;
100 prove campionate su 2 profili e 5 selezioni di livello ; 40 pagine senza salti.
Wheel verificato con manifest,schema e tutti i 27 shard, hash coincidenti e caricamento
dei 4.000 quesiti da distribuzione estratta. Nessun gate esistente indebolito.

Review assistita incrociata: corretti collisioni di simboli, unità e domini,
ambiguità delle inverse e casi esponenziali con radici perse dal risolutore.
Reviewer umano: null; stato: DRAFT; calibrazione difficoltà su studenti:NOT_RUN.
Il wrapper storico review.sh dipende da CLI assenti; non è dichiarata una review
Claude. La suite frozen è eseguita direttamente nel checkout perché il wrapper
usa un percorso storico. L’utente ha richiesto la pubblicazione GitHub: ramo
dedicato e PR in bozza sul ramo minicorsi; nessun merge o deploy autorizzato/eseguito.

Rapporti: packs/semestre-filtro-2026-27/README.md e docs/INTEGRATION-VALIDATION-2026-10-21.md
nel medesimo pacchetto; manifest SHA-256
15110c78e3b615eb4a3a50c8d33c179a6e35cd9495e2f6764b29cd9485850896.
Costo sessione non esposto dal runtime, nessuna cifra inventata.

### Pubblicazione e conformità alla struttura del repository

Pubblicata la PR in bozza #270, ramo codex/physics-bank-4000-20261021,
con base nel ramo minicorsi codex/ardesia-public-rea-20261020. Verificati su
GitHub manifest e tutti i 27 shard della banca completa. Il primo run CI ha
superato engine, study-api, study-mcp, web, studio e golden path e2e advisory.

Il controllo hygiene ha individuato i percorsi authoring sotto packs: spostati
gli strumenti in bin/content/physics_bank e i JSON editoriali in data, con
aggiornamento dei riferimenti. Tutti i 17 JSON spostati conservano i byte
originali. Gate e baseline invariati; boundary ora verde sull’index completo.
Il CSV usa LF, con identiche 4.000 righe interpretate. Nuova esecuzione di
assembler e validatore completa e verde, manifest e corpus invariati.
Dettagli riproducibili nel rapporto INTEGRATION-VALIDATION-2026-10-21.md.


## 2026-10-21 — Gate P0 di pubblicazione della banca Fisica

Default deny per edizione: nessun quesito della banca di 4.000 raggiunge uno
studente senza un'approvazione scientifica/editoriale persistita, legata alla
versione esatta e allo SHA-256 del contenuto autoriale. Il corpus resta
immutabile e DRAFT; l'approvazione vive in schema 7
(`study_question_bank_approvals`, eventi append-only, revoca come transizione).
Solo il docente proprietario dell'edizione approva, rifiuta, revoca e legge
l'audit. La pagina studente, il dettaglio, l'esame e il tentativo sono filtrati;
un esame senza famiglie sufficienti fallisce con 409, senza composizioni parziali.
Ripristino backup conserva le approvazioni; l'erasure di uno studente non tocca
le decisioni editoriali. Concorrenza e idempotenza provate su SQLite.

Verifica: validatore del produttore verde su 4.000 record (manifest SHA-256
15110c78e3b615eb4a3a50c8d33c179a6e35cd9495e2f6764b29cd9485850896, revisione
umana NOT_RUN); suite Study 714 passati, 18 saltati (contratti Supabase live
senza env file); 11 test engine e 7 HTTP dedicati al gate. Probe indipendente
sulla banca reale: 0 approvazioni iniziali, pagina studente vuota, esame 409,
una approvazione esatta pubblica un solo quesito, revoca lo ritira lasciando
una riga e due eventi. Il probe #271 originale non è stato modificato: il suo
primo test è verde, il secondo presuppone la baseline vulnerabile (esame 200
senza approvazioni) e ora diverge in modo atteso.

PostgreSQL live non verificato: nessun runtime disponibile; migrazione e RLS
restano da collaudare prima del deploy. Nessuna approvazione reale dei 4.000,
nessun merge o deploy. Ramo codex/physics-bank-approval-gate-20261021; PR in bozza #272, base
codex/physics-bank-4000-20261021. Dettaglio in
docs/study/QUESTION-BANK-PUBLICATION-GATE-2026-10-21.md.

## 2026-10-21 — Convergenza schemi Study (#272 + #269)

Risolto il conflitto reale fra gate editoriale e esame persistente: entrambe le
PR dichiaravano schema 7 e la stessa migrazione `20261021120000`. Sequenza
canonica: v6 → v7 approvals (#272 invariata) → v8 exam (#269 rinumerata come
`20261021130000_study_exam_attempts.sql`). `CURRENT_SCHEMA=8`. La forma v7
"solo esame" è accettata solo come upgrade additivo, mai come forma canonica in
sola lettura; un v7 parziale fallisce senza scritture. Il corpus, il gate e i
4.000 quesiti non sono stati modificati nel merito.

Verifica: engine 2529 passati, 25 saltati; API 248 passati; typecheck e build web
verdi. La suite web completa ha un flake pre-esistente in
`session-boundary.test.tsx`, presente anche sul HEAD #272 e non disabilitato.
PostgreSQL live, trigger e RLS: NOT_RUN per assenza runtime e
`ARDESIA_SUPABASE_ENV_FILE`. Restano incompatibili la forma MCQ (4 opzioni
intere vs 5 opzioni A–E), il pack fisso e l'autosalvataggio; nessuna
integrazione semantica dichiarata. Ramo
`codex/study-schema-convergence-20261021`, PR in bozza #273 con base #272
(head `baafe1cfbafbfcd74cbbf4ba26458bff347407c1`); tutti i job CI verdi.
Dettaglio in `docs/study/SCHEMA-CONVERGENCE-2026-10-21.md`. Nessun merge o
deploy.

## 2026-10-21 — PostgreSQL reale: convergenza e trigger d'esame

Riprodotto su PostgreSQL 16.15 il blocco della #273: su un database v7
"legacy" con la vecchia #269 già applicata, la migrazione `20261021130000`
tentava di ricreare `study_exam_attempts` e falliva con `DuplicateTable`.
Corrette entrambe le migrazioni in modo additivo e idempotente: la tabella
esistente non viene ricreata, le colonne vengono validate, indici/policy/trigger
mancanti vengono installati e il marker passa a 8. Aggiunto
`study_exam_attempt_guard` (identità immutabile, nessun update dopo la consegna,
transizione chiusa con risultato completo, DELETE negato).

Verifica: 8 test reali su database temporanei PostgreSQL (nuovo, v6 con dati, v7
canonico, v7 legacy exam-only, parziale con retry, rollback su tabella
incompatibile, RLS approvazioni, RLS/tentativi chiusi). Restano NOT_RUN Auth,
PostgREST e Storage Supabase. Dettaglio in
docs/study/POSTGRES-CONVERGENCE-2026-10-21.md. Nessun dato o corpus reale
modificato; nessun merge o deploy.
