|
|- **2026-06-10(current) — M0 T4a-step2: REAL transcription of Prima lezione (verified, honest spot-check).** Ipotesi singola: faster-whisper large-v3-turbo int8 CPU puo trascrivere 71min di lezione reale di Teoria dei Segnali (italiano) e produrre segmenti con timestamp utili. Esecuzione: chiamata diretta `transcribe_with_fallback(language='it')` come da correzione Claude (PLAN-CHECK opus-4-8). Output: `~/maestro-data/teoria-segnali-2021/derived/asr/Prima_lezione_teoria_dei_segnali.speech.segment.jsonl` — 1351 segmenti, 153KB. Verifica con `bin/verify-transcription.sh`. **Risultati VERI:**
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
