# PDR GIGANTE — Documento Master ELAB Tutor
## 14 Aprile 2026 — Firmato Andrea Marro

**TUTTO deve rifarsi a questo documento. Sessioni Terminal, Web, Task programmati.**

---

## STATO REALE VERIFICATO (non stimato)

| Metrica | Valore | Verifica |
|---------|--------|----------|
| Test | 3868 PASS | npx vitest run |
| Build | PASS 1m35s | npm run build |
| Deploy | Automatico GitHub Actions → Vercel | Ogni push su main |
| Sito | elabtutor.school 200 OK | curl verificato |
| Esperimenti | 92 (38+27+27) | Script verificato |
| BuildSteps | 92/92 completi | Script verificato |
| ScratchXml | 26/27 Vol3 (1 circuit no-code) | Script verificato |
| KB Edge | 94 entries | knowledge-base.json |
| UNLIM abilità | 22 (14 base + 8 avanzate) | system-prompt.ts |
| Kokoro TTS | Funzionante localhost:8881 | curl health OK |
| Edge TTS VPS | Funzionante 72.60.129.50:8880 | curl health OK |
| Wake word | "Ehi UNLIM" attivo | wakeWord.js |
| Nanobot Render | OK (15s cold start) | curl chat OK |
| Nanobot Edge | OK (Gemini routing) | curl unlim-chat OK |
| Supabase DB | Connesso (key fixata) | curl rest API OK |
| Score onesto | **7.5/10** | Post debug sistematico |

---

## ANALISI LAVORO TEA (4 documenti + PR #73)

### Documento 1: Analisi Complessità Esperimenti
**Qualità: ECCELLENTE.** Tea ha analizzato tutti 92 esperimenti misurando passi, difficoltà, componenti.

Conclusioni chiave:
- 6 esperimenti genuinamente "oltre" il target 8-14
- 4 capstone da etichettare "Progetto avanzato"
- Vol 2 Cap 8 Esp 3 (MOSFET tensione soglia) = CASO PIÙ PROBLEMATICO
- Vol 1 Cap 9 Esp 7/8/9: sfide aperte rischiose sotto 10 anni
- Suggerita durata stimata su ogni scheda (15/30/45+ min)

**Azioni da implementare:**
1. Tag "Progetto avanzato" sui 4 capstone (30 min)
2. Riscrivere testo MOSFET v2-cap8-esp3 (1h)
3. Aggiungere schema finale alle 3 sfide Cap 9 (1h)
4. Mostrare durata stimata per esperimento (4h)
5. Spezzare v3-cap8-esp5 in due step (30 min)

### Documento 2: Riepilogo Correzioni GitHub (PR #73)
**Qualità: MOLTO BUONO.** Tea ha trovato e fixato 3 bug reali:

1. **Chunk error dopo deploy** — importWithRetry.js + vite:preloadError handler
2. **8 icone esperimenti vuote** — emoji ripristinate
3. **Scratch fragile** — retry automatico su import dinamici

**PR #73 è OPEN — VA MERGIATA.**

### Documento 3: Schema UX Semplificato
**Qualità: ECCELLENTE.** La proposta "Schermo-Lavagna" a 3 zone è esattamente ciò che serve.

Le 4 semplificazioni chiave:
1. **Pannello Guida Docente** — "cosa dire", domande, errori tipici, link
2. **Sidebar componenti filtrata** — solo quelli dell'esperimento + "Mostra tutti"
3. **Toolbar 4 comandi grandi etichettati** — Avvia, Annulla, Aiuto, Avanti
4. **Canvas pulito** — zoom automatico, griglia nascosta, componenti centrati

**Nota Andrea:** Tea ha ragione — il layout attuale ha 6 zone che competono. La LavagnaShell va verso questo schema ma non ci è ancora. Il pannello "Guida Docente" corrisponde al nostro PercorsoPanel/LessonPathPanel ma serve renderlo più utile.

### Documento 4: 10 Idee Miglioramento
**Qualità: MOLTO BUONO.** Le idee:

1. **Dashboard docente / Classe** — codice-classe + griglia studenti ← GIÀ PARZIALE (TeacherDashboard)
2. **Modalità Proietta in Classe** — font 2×, canvas gigante ← NON IMPLEMENTATO
3. **Quaderno digitale bambino** — screenshot + note + emoji mood ← NON IMPLEMENTATO
4. **"Trova il guasto"** — debug come gioco ← GIÀ PARZIALE (broken-circuits.js)
5. **Glossario contestuale + voce** — parole sottolineate + popup ← NON IMPLEMENTATO
6. **Timeline visuale** — mappa dei capitoli completati ← NON IMPLEMENTATO
7. **Sfide a tempo** — cronometro + classifica ← NON IMPLEMENTATO
8. **Esporta PDF lezione** — scheda stampabile ← NON IMPLEMENTATO
9. **"Chiedi a UNLIM"** — microfono sempre visibile ← PARZIALE (wake word fatto)
10. **Certificato fine volume** — diploma PDF personalizzato ← NON IMPLEMENTATO

**Idee TOP da implementare subito:** 2 (Proietta in Classe), 4 (Trova il Guasto esteso), 5 (Glossario), 9 (Chiedi a UNLIM completo)

---

## CRITICA DI ANDREA (dal prompt)

> "hai interpretato troppo alla lettera e hai spiattellato le cose tutte di fila quando l'organizzazione poteva essere più elegante e compatta"

**Ha ragione.** I 92 esperimenti sono esposti come lista piatta. Il libro fisico raggruppa gli esperimenti per CONCETTO con variazioni (es. "LED rosso" → "LED verde" → "cambia resistore" sono variazioni dello stesso esperimento, non 3 esperimenti separati). L'UI deve riflettere questo raggruppamento.

**Azione:** Creare un livello di raggruppamento "Lezione" che contiene variazioni dell'esperimento, non esporre ogni variazione come entry separata. L'ExperimentPicker deve mostrare LEZIONI (es. "Accendi il LED") e dentro le VARIAZIONI (es. "con rosso", "senza resistore", "con verde").

---

## OBIETTIVO PRINCIPALE: UNLIM ONNISCIENTE

UNLIM deve:
1. **Leggere TUTTO dalla piattaforma** — circuito attuale, esperimento, codice, errori, stato studente
2. **Vedere** — captureScreenshot + analisi visuale (già esposto, collegare)
3. **Capire contesto profondo** — quale volume, capitolo, che errori ha fatto prima, dove è bloccato
4. **Eseguire compiti complessi** — "costruisci un semaforo" → catena di 10+ azioni
5. **Allargare RAG** — aggiungere TUTTI i contenuti dei volumi al vector store Supabase
6. **Linguaggio naturale libero** — capire qualsiasi formulazione italiana di un bambino 8-14

### Come rendere UNLIM onnisciente:

#### A. Contesto dal simulatore (circuitContext)
Già parziale. Manca:
- Lista errori correnti (LED bruciato, cortocircuito)
- Codice Arduino attuale nel'editor
- Stato compilazione (OK/errori)
- Posizione nel Passo Passo (step N di M)

#### B. Contesto dallo studente (studentContext)
Già parziale (unlimMemory.js). Manca:
- Tempo trascorso sull'esperimento corrente
- Numero di tentativi falliti
- Pattern di errori (sempre lo stesso?)
- Esperimenti saltati

#### C. RAG allargato
Attualmente: 94 chunk (esperimenti). Servono:
- Testo completo dei 3 volumi PDF (estratto e chunked)
- Glossario componenti con spiegazioni
- FAQ docenti/studenti
- Errori comuni per componente
- Analogie per concetto

#### D. Vision + Screenshot
- captureScreenshot è nell'API ma non collegato a UNLIM
- Serve: "analizza il mio circuito" → screenshot → Gemini Vision → risposta

#### E. Linguaggio naturale sperimentale
Testare diverse formulazioni:
- Bambino: "il led non va" → UNLIM capisce = LED non si accende
- Dialetto/errori: "cosa fa sto coso" → UNLIM capisce = cos'è questo componente
- Comandi impliciti: "voglio provare" → UNLIM capisce = avvia simulazione
- Emotivi: "non capisco niente!" → UNLIM risponde con empatia + aiuto concreto

---

## PIANO RALPH LOOP (sessione separata)

### Prompt da incollare nella sessione Ralph Loop:

```
Leggi docs/plans/2026-04-14-PDR-GIGANTE-MASTER.md — è il documento master.

OBIETTIVO: Rendere UNLIM DEFINITIVAMENTE onnisciente.

CICLO 1: Merge PR #73 di Tea + verifica
- gh pr merge 73 -R AndreaMarro/elabtutor --merge
- Verifica importWithRetry.js, vite:preloadError, icone
- Test + build

CICLO 2: Tag "Progetto avanzato" + durata stimata (suggerimenti Tea)
- Aggiungere campo advancedProject:true ai 4 capstone
- Aggiungere campo estimatedMinutes a TUTTI i 92 esperimenti
- Mostrare nell'ExperimentPicker come badge + tempo

CICLO 3: Raggruppamento elegante esperimenti
- Creare struttura "Lezione" che contiene variazioni
- ExperimentPicker mostra Lezioni, non singoli esperimenti
- Ogni Lezione ha titolo del concetto + N variazioni dentro

CICLO 4: UNLIM — contesto circuito COMPLETO
- Aggiungere al circuitContext: errori, codice, compilazione, step
- sendChat deve passare TUTTO il contesto a ogni messaggio
- Testare con 20 domande che richiedono contesto

CICLO 5: UNLIM — RAG allargato
- Estrarre testo dai 3 PDF volumi (pandoc o pdf-parse)
- Creare chunk da 500 token con overlap 50
- Uploadare su Supabase pgvector
- Testare: "cosa dice il libro sul resistore?" → risposta dal volume

CICLO 6: UNLIM — comandi complessi in linguaggio naturale
- Testare 50 formulazioni diverse (bambino, errori, dialetto, emotivo)
- Per ogni formulazione che fallisce, aggiungere pattern nel system prompt
- Target: 90%+ di comprensione su 50 test

CICLO 7: UNLIM — vision (analizza circuito da screenshot)
- Collegare captureScreenshot a sendChat con flag vision:true
- Test: "guarda il mio circuito" → screenshot → analisi → risposta
- Gestire fallback se Gemini Vision non disponibile

CICLO 8: UX semplificata (schema Tea)
- Componenti filtrati per esperimento (default) + "Mostra tutti"
- Toolbar 4 comandi grandi etichettati
- Canvas pulito — zoom auto, griglia nascosta

REGOLE:
- Dopo OGNI ciclo: npx vitest run + npm run build + commit
- Leggi automa/state/ralph-sync.json per input dai task
- Scrivi progresso in automa/state/ralph-loop-progress.json
- Target test: arrivare a 7500
- COV SEMPRE. Non dare nulla per scontato.
- Se pensi di aver finito un compito, RICONTROLLA.
```

---

## 8 TASK PROGRAMMATI — Orchestrazione

Comunicano via `automa/state/*.json` + commit su GitHub.
Il Ralph Loop legge `ralph-sync.json` (scritto dal Task 8).
I task leggono `ralph-loop-progress.json` (scritto dal Ralph Loop).

### Task 1 — SENTINELLA BUILD (:07)
Pull, test, build. Alert se rotto. Scrive `task1-build.json`.

### Task 2 — TEST FACTORY (:12)
Genera 50 nuovi test per iterazione, target 7500 totali.
Categorie: CircuitSolver edge case, UNLIM risposte, voiceCommands, 
DrawingOverlay, FloatingToolbar, ExperimentPicker, TeacherDashboard.
Scrive `task2-test-factory.json` con conteggio.

### Task 3 — UTENTI SIMULATI (:17)
Simula 10 tipologie di utenti diverse per iterazione:
- Bambino 8 anni (vocabolario limitato, errori frequenti)
- Bambina 10 anni curiosa (domande avanzate)
- Ragazzo 14 anni annoiato (comandi brevi, impaziente)
- Docente prima volta (non sa dove cliccare)
- Genitore a casa (vuole aiutare il figlio)
- Bambino con dislessia (testo deve essere semplice)
- Bambino non italofono (errori grammaticali)
- Classe intera (20 sessioni simultanee)
- Studente avanzato (vuole codice complesso)
- Studente bloccato (dice "non capisco" ripetutamente)
Per ogni utente: simula 5 interazioni, verifica che UNLIM risponda bene.
Scrive `task3-utenti.json`.

### Task 4 — DEBUG SISTEMATICO (:22)
Scansiona TUTTO il codebase:
- Ogni file JSX: verifica che ogni bottone abbia handler
- Ogni servizio: verifica che le API call abbiano fallback
- Ogni route: verifica che il routing hash funzioni
- Ogni localStorage key: verifica che non ci siano conflitti
Scrive `task4-debug.json`.

### Task 5 — LETTORE VOLUMI (:27)
Legge ATTENTAMENTE i 3 volumi PDF e confronta con gli esperimenti nel codice:
- Ogni esperimento nel libro corrisponde al simulatore?
- I componenti sono gli stessi?
- L'ordine è lo stesso?
- Le variazioni sono raggruppate come nel libro?
- Ci sono esperimenti nel libro non nel simulatore?
NOTA: un esperimento nel libro può avere più variazioni (LED rosso, verde, ecc.)
che nel codice sono "spiattellate" come esperimenti separati.
Scrive `task5-volumi.json`.

### Task 6 — AI COMBO RESEARCHER (:32)
Pensa a TUTTE le combinazioni possibili per l'utilizzo dell'AI:
- Gemini Flash/Pro per chat (attuale)
- Gemini Vision per analisi screenshot
- Kokoro TTS per voce italiana
- Whisper STT per riconoscimento vocale
- Edge TTS come fallback voce
- Qwen 2B su VPS come LLM fallback
- DeepSeek su Render come provider alternativo
- Supabase pgvector per RAG
- Embeddings Gemini per semantic search
- Fine-tuning Galileo Brain (QLoRA Qwen)
- Voice cloning con Kokoro per mascotte personalizzata
- Realtime audio con Gemini 2.5
Scrive `task6-ai-combo.json` con costi, latenza, qualità per ogni combo.

### Task 7 — RAG EXPANDER (:37)
Allarga il RAG aggiungendo contenuti:
- Estratti dai volumi PDF
- Glossario componenti con spiegazioni per bambini
- FAQ da sessioni precedenti
- Errori comuni per esperimento
- Analogie per concetto
Target: da 94 a 500+ chunk. Più facile da usare.
Scrive `task7-rag.json`.

### Task 8 — SINCRONIZZATORE (:42)
Legge TUTTI i file `task*.json` + `ralph-loop-progress.json`.
Crea `ralph-sync.json` con:
- Stato di ogni task
- Raccomandazioni aggregate
- Blockers
- Prossime azioni per il Ralph Loop
- Score complessivo aggiornato

Commit su GitHub per comunicare con sessioni Web.

---

## COMUNICAZIONE TRA SESSIONI

```
SESSIONE TERMINAL (Ralph Loop)
  ↓ scrive: ralph-loop-progress.json
  ↓ legge: ralph-sync.json
  
8 TASK PROGRAMMATI
  ↓ scrivono: task1-8.json
  ↓ leggono: ralph-loop-progress.json
  ↓ Task 8 scrive: ralph-sync.json
  
SESSIONI WEB (se avviate)
  ↓ leggono: GitHub repo (ralph-sync.json)
  ↓ scrivono: commit su branch proposal/*
  ↓ il Terminal legge e mergia
```

---

## TARGET BENCHMARK

| Metrica | Prima | Dopo (14/04) | Target |
|---------|-------|-------------|--------|
| Test | 3868 | **8190** | 7500 **SUPERATO** |
| UNLIM comprensione | ~70% | **60/60 test NL PASS** | 90%+ |
| KB chunks | 94 | **549** | 500+ **RAGGIUNTO** |
| Touch targets <44px | 11 P2 | 11 P2 | 0 |
| Esperimenti oltre target | 6 senza label | **0 (tutti etichettati)** | 0 **RAGGIUNTO** |
| Raggruppamento | Lista piatta 92 | **27 lezioni con variazioni** | ~30 **RAGGIUNTO** |
| Rename Galileo→UNLIM | 211 refs | **0 refs** | 0 **RAGGIUNTO** |
| Vision | Non collegata | **Funzionante** | OK **RAGGIUNTO** |
| Lavagna libera | Non esistente | **Implementata** | OK **RAGGIUNTO** |
| Score | 7.5 | **8.5** | 8.5+ **RAGGIUNTO** |

---

## PRIORITÀ ASSOLUTA PROSSIMA SESSIONE (parole di Andrea)

> "UNLIM deve uscire una volta per tutte! Onnipotente!"

1. **UNLIM contesto circuito COMPLETO** — errori, codice, step, tutto
2. **UNLIM vision** — screenshot + analisi incrociata
3. **RAG allargato** — volumi PDF chunked, 500+ chunk
4. **UNLIM linguaggio naturale** — 50 formulazioni testate con multi-analisi incrociata
5. **Algoritmi incrociati** — combinare contesto + vision + RAG + NL per risposta ottimale
6. **Struttura esperimenti vs libri** — i libri raggruppano per CONCETTO con variazioni, il simulatore ha lista piatta. DEVE cambiare. Un esperimento nel libro può avere più casistiche/variazioni che sono "più eleganti e compatte" di come le abbiamo implementate.

> "hai interpretato troppo alla lettera e hai spiattellato le cose tutte di fila"

Questo è il feedback più importante: l'organizzazione degli esperimenti deve riflettere la struttura dei LIBRI FISICI, non essere una lista sequenziale meccanica.

## MASSIMA ONESTÀ — Cosa NON funziona ancora

1. **Dashboard docente** — shell con pochi dati reali, grafici assenti
2. **Kokoro non in produzione** — solo localhost, serve VPS/Vast.ai
3. **RAG troppo piccolo** — 94 chunk, servono 500+
4. **UNLIM non vede il circuito** — vision non collegata
5. **Esperimenti spiattellati** — lista piatta, non raggruppati per lezione
6. **Nessuna durata stimata** — l'utente non sa quanto tempo serve
7. **PR #73 di Tea non mergiata** — contiene fix importanti
8. **Render cold start 15s** — prima risposta UNLIM lenta
9. **Vercel rate limit** — si resetta tra ~18h
10. **Vol 2 Cap 8 Esp 3** — concetto MOSFET troppo avanzato per 10 anni
