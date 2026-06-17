# G14 MARATHON — "LA PROF.SSA PARLA" (Voce + Galileo Live)

Data: [INSERISCI DATA]. Durata: Sessione lunga. Principio Zero: Su una LIM con 25 ragazzi, il docente NON digita. Parla. E UNLIM risponde a voce. Questa sessione trasforma UNLIM da muto a parlante E valida Galileo con domande reali. REGOLA: ZERO infrastruttura. Tutto visibile/udibile.

PREREQUISITI: G12 (toolbar minimale) + G13 (mascotte robot + messaggi contestuali). Se G13 non e' completa, completa prima i messaggi posizionati.

LEGGI OBBLIGATORIAMENTE: 1. CLAUDE.md. 2. automa/STATE.md. 3. automa/reports/G13-VERIFICA-FINALE.md. 4. automa/context/GALILEO-CAPABILITIES.md (26+ azioni). 5. automa/PIANO-2-SETTIMANE.md. 6. Questo prompt.

FASE 0: Bootstrap (15 min). Build PASSA. Dev server parte. Nanobot health check: curl https://elab-galileo.onrender.com/health — documenta risposta e latenza.

FASE 1: STT — Speech-to-Text (2 ore). Web Speech API (gratis, Chrome/Edge ~75% browser). UnlimInputBar ha gia' bottone mic e prop onMicClick. Implementa: click mic → SpeechRecognition('it-IT') start → testo nella barra in tempo reale → auto-send quando pausa >1.5s. Feedback visivo: mic diventa rosso quando ascolta, testo appare character by character. Gestione errori: se browser non supporta → mic non appare (nessun crash). Se no permesso microfono → messaggio gentile. Verifica: apri Chrome → click mic → parla "accendi il LED" → testo appare nella barra → messaggio inviato.

FASE 2: TTS — Text-to-Speech (1-2 ore). SpeechSynthesis API (gratis, tutti i browser). Quando UNLIM risponde, LEGGE la risposta ad alta voce. Implementa: seleziona voce 'it-IT', rate 0.9 (lento per bambini), pitch 1.0. Toggle speaker icon accanto alla mascotte (on/off, persist localStorage). NON leggere le azioni [AZIONE:xxx] — solo testo naturale. NON leggere markdown (**bold**, *italic*) — strip prima di TTS. Se risposta > 80 parole → leggi solo le prime 60 + "...vuoi saperne di piu'?". Verifica: UNLIM risponde → la voce esce dagli speaker → toggle off → silenzio.

FASE 3: Galileo Live Test (2-3 ore) ★ CRITICO. IL DIFFERENZIATORE DEL PRODOTTO MAI VALIDATO. Apri il browser con dev server. Carica v1-cap6-esp1.

10 domande REALI — documenta TUTTO:

1. "Cosa facciamo oggi?" — Atteso: UNLIM suggerisce lezione LED. Misura: tempo, qualita' 1-5, tono 10-14.
2. "Cos'e' un LED?" — Atteso: spiegazione con analogia. Misura: accuratezza, linguaggio.
3. "Monta il circuito" — Atteso: [AZIONE:loadexp:v1-cap6-esp1] o montaggio passo passo. Misura: azione eseguita?
4. "Perche' serve il resistore?" — Atteso: analogia rubinetto/tubo. Misura: chiarezza.
5. "Cosa succede se giro il LED?" — Atteso: spiega polarita'. Misura: correttezza tecnica.
6. (Carica v3-cap6-semaforo) "Compila il codice" — Atteso: [AZIONE:compile]. Misura: azione eseguita?
7. "Cerca un video sui LED" — Atteso: [AZIONE:youtube:LED]. Misura: video trovato?
8. "Fai un quiz" — Atteso: [AZIONE:quiz:v1-cap6-esp1]. Misura: quiz appare?
9. (Metti LED al contrario) "Aiutami, non funziona!" — Atteso: diagnosi + suggerimento. Misura: trova il problema?
10. "Cosa abbiamo imparato oggi?" — Atteso: riassunto lezione. Misura: coerenza col percorso.

Per ogni domanda: tempo risposta (target <5s, ok <10s, fail >15s), qualita' 1-5, azione corretta si/no, tono 10-14 anni si/no, screenshot. Se nanobot in cold start: documenta tempo wake-up. Implementa wake-up ping al boot dell'app (fetch /health al mount di App.jsx, fire-and-forget).

FASE 4: Fix basati sul test (1-2 ore). Se risposte troppo lunghe → tronca + "Vuoi saperne di piu'?". Se azioni non parsate → fix regex in ElabTutorV4.jsx:1755+. Se tono sbagliato → il system prompt va fixato (ma e' su nanobot, documenta il fix necessario). Se cold start inaccettabile → implementa pre-warm fetch + mostra "UNLIM si sta svegliando..." con animazione mascotte thinking.

FASE 5: CoV + Verifica (1-2 ore). Layer 1: Build. Layer 2: STT funziona? Parla → testo appare → messaggio inviato. Layer 3: TTS funziona? UNLIM risponde → voce esce. Layer 4: Galileo 10 domande — tabella con risultati. Layer 5: Tempo risposta medio. Layer 6: 3 agenti CoV. Scrivi: automa/reports/G14-VERIFICA-FINALE.md con tabella completa 10 domande.

TARGET: STT funzionante Chrome (★★★). TTS funzionante (★★★). Galileo 10/10 risposte (★★★). Tempo medio <8s (★★). Azioni 7/10+ corrette (★★). Score UNLIM 3.5 → 5.5 (★★★).

NOTA: Se Galileo non funziona (nanobot down, risposte sbagliate, azioni rotte) — QUESTA E' L'INFORMAZIONE PIU' IMPORTANTE DELLA SESSIONE. Documenta onestamente. Non mascherare.
