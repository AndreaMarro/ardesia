# PDR — Parita Definitiva Kit/Volumi ↔ App Tutor

> Versione: 1.0 | Data: 04/04/2026 | Autore: Andrea Marro
> Prerequisito: Sessione Mega Bug Hunt completata (26 bug fixati, 1430/1430 test, build PASS)
> Durata stimata: 1 sessione lunga (Ralph Loop max 100 iterazioni)

---

## PRINCIPI IMMUTABILI

1. **PRINCIPIO ZERO**: Solo il docente usa ELAB Tutor davanti alla classe sulla LIM. Gli studenti guardano e partecipano. Ogni scelta UX deve servire il docente che spiega.
2. **ZERO REGRESSIONI**: `npx vitest run` + `npm run build` DEVONO passare dopo OGNI singolo fix. Se falliscono, REVERT immediato e analisi root cause.
3. **ENGINE INTOCCABILE**: MAI modificare CircuitSolver.js, AVRBridge.js, SimulationManager.js, avrWorker.js — il motore funziona.
4. **ZERO DEMO/MOCK**: Tutto deve funzionare con dati reali. Mai dati finti.
5. **ONESTA BRUTALE**: Mai auto-assegnare score >7 senza evidenza runtime verificata con screenshot/preview.

---

## FASE 0 — BOOTSTRAP CONTESTO (Obbligatorio, prima di ogni azione)

### 0.1 Leggi contesto completo
```
Leggi IN ORDINE:
1. CLAUDE.md (architettura, regole)
2. .claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md (indice memoria)
3. .claude/projects/-Users-andreamarro-VOLUME-3/memory/architecture.md
4. .claude/projects/-Users-andreamarro-VOLUME-3/memory/unlim-vision-core.md
5. .claude/projects/-Users-andreamarro-VOLUME-3/memory/feedback_no_demo.md
6. docs/BUG-LIST-COMPLETA.md (sessione precedente)
7. docs/BENCHMARK-100-PARAMETRI.md (sessione precedente)
8. .team-status/QUALITY-AUDIT-MEGA-HUNT.md (sessione precedente)
```

### 0.2 Verifica risultati sessione precedente
```
- npm run build → DEVE passare
- npx vitest run → 1430/1430 DEVE passare
- Verifica che i 26 fix della sessione precedente siano ancora presenti
- Se qualcosa e regredito, STOP e fix prima di continuare
```

### 0.3 Leggi i volumi fisici
```
I PDF dei 3 volumi ELAB Tres Jolie sono in:
- Cerca in /Users/andreamarro/VOLUME 3/ i PDF dei volumi
- Se non li trovi, usa il RAG (unlim-knowledge-base.js, 246 chunk)
- Estrai la LISTA ESATTA degli esperimenti per capitolo da ogni volume
- QUESTA LISTA e la fonte di verita, NON experiments-vol*.js
```

---

## FASE 1 — ALLINEAMENTO ESPERIMENTI VOLUMI ↔ APP

### Problema
L'app ha 91 esperimenti, ma molti sono FRAMMENTI dello stesso esperimento del libro.
Esempio: il libro dice "Esperimento: dimmer LED con potenziometro" e l'app ha 9 sotto-esperimenti (v1-cap9-esp1 fino a esp9).

### Azione
1. **Crea una tabella di mapping**: Volume/Capitolo/Esperimento del libro ↔ ID nell'app
2. **Identifica duplicati/frammenti**: Dove l'app ha spezzato un esperimento in piu parti
3. **Decisione per ogni frammento**:
   - Se il frammento e una FASE dello stesso esperimento → uniscilo nell'esperimento padre come step
   - Se il frammento e un esperimento SEPARATO nel libro → mantienilo
   - Se il frammento NON ESISTE nel libro → marcalo come "extra" o rimuovilo
4. **Verifica completezza**: Ogni esperimento del libro DEVE avere il suo corrispondente nell'app
5. **Per ogni esperimento verificato**:
   - Titolo IDENTICO al libro
   - Componenti IDENTICI al libro
   - Schema circuitale IDENTICO al libro
   - Codice Arduino (Vol3) IDENTICO al libro
   - Steps di montaggio IDENTICI al libro

### Output atteso
- `docs/MAPPING-VOLUMI-APP.md` — tabella completa mapping
- Experiments-vol*.js aggiornati con solo gli esperimenti reali dei libri
- Test aggiornati se il numero di esperimenti cambia

### CoV dopo Fase 1
```
- npx vitest run → TUTTI i test DEVONO passare
- npm run build → DEVE passare
- Conta esperimenti: il numero DEVE corrispondere ai libri
```

---

## FASE 2 — SIMULATORE ARDUINO: DEBUG SISTEMATICO

### 2.1 Compilatore C++ (avr8js)
Per OGNI esperimento Vol3 con `code !== null`:
```
1. Carica l'esperimento via __ELAB_API.loadExperiment(id)
2. Clicca "Compila & Carica"
3. Verifica: compilazione DEVE avere successo (no errori)
4. Verifica: LED/servo/LCD DEVONO rispondere correttamente
5. Verifica: Serial Monitor DEVE mostrare output corretto
6. Se il codice ha un ERRORE INTENZIONALE → DEVE mostrare errore comprensibile
```

### 2.2 Scratch/Blockly
Per OGNI esperimento Vol3:
```
1. Passa alla tab "Blocchi"
2. Verifica: le categorie Scratch sono visibili (Decisioni, Ripeti, Accendi e Spegni, etc.)
3. Crea un programma Blink con blocchi
4. Clicca "Compila & Carica" dalla vista Blocchi
5. Verifica: il codice C++ generato e corretto
6. Verifica: la compilazione ha successo
7. Verifica: il LED lampeggia nella simulazione
8. Verifica: se metto blocchi sbagliati, NON DEVE compilare (errore chiaro)
```

### 2.3 Stress test simulatore
```
Per OGNI esperimento (tutti i 3 volumi):
1. Carica esperimento
2. Trascina un componente dalla palette → DEVE posizionarsi correttamente
3. Sposta un componente → TUTTI i fili collegati DEVONO seguirlo
4. Collega un filo tra due pin → DEVE fare contatto elettrico
5. Collega un filo nel punto SBAGLIATO → NON DEVE funzionare
6. Rimuovi un filo → il circuito DEVE aggiornarsi
7. Undo/Redo → DEVE funzionare senza crash
8. Zoom in/out → layout DEVE rimanere coerente
9. 15 componenti contemporanei → NESSUN rallentamento visibile
10. Play/Stop → transizione pulita senza glitch
```

### 2.4 Fisica degli oggetti
```
- Snap to breadboard: i componenti DEVONO agganciarsi ai buchi (BB_HOLE_PITCH=7.5, SNAP_THRESHOLD=4.5)
- Se NON centri il buco → il componente DEVE comunque agganciarsi al buco piu vicino (tolleranza)
- Se trascini un componente gia inserito → i fili DEVONO seguirlo
- Se hai componenti sovrapposti → DEVE essere chiaro visivamente
- I pin DEVONO essere cliccabili facilmente (min 44px touch target)
- Il drag non deve "scattare" o avere inerzia strana
- Su iPad touch: il drag DEVE funzionare con il dito (non solo mouse)
```

### Output atteso
- OGNI bug trovato viene FIXATO immediatamente
- `docs/STRESS-TEST-RISULTATI.md` — tabella con risultati per ogni esperimento
- Zero crash, zero comportamenti inattesi

### CoV dopo Fase 2
```
- npx vitest run → PASS
- npm run build → PASS
- OGNI esperimento testato via Control Chrome/preview tools con screenshot
```

---

## FASE 3 — RESPONSIVE: iPad + LIM + PC

### 3.1 Test su 3 risoluzioni
Per OGNI schermata principale (experiment picker, simulatore, Scratch editor):
```
iPad (768x1024):
- Tutti gli elementi visibili e utilizzabili
- Touch targets >= 44px
- Nessun overflow orizzontale
- Sidebar retrattile funzionante

LIM (1024x768):
- Layout compatto ma completo
- Font >= 14px (leggibili dalla classe)
- Toolbar e palette accessibili
- Nessun elemento tagliato

PC Desktop (1920x1080):
- Layout spacious, nessun elemento troppo piccolo
- Sidebar aperta di default
- Canvas centrato con margini adeguati
```

### 3.2 Fix responsivi
- Ogni problema trovato viene FIXATO immediatamente
- Verifica con preview_resize + preview_screenshot

---

## FASE 4 — MODALITA "MONTA TU" (Build Mode)

### 4.1 Architettura
La modalita "Monta tu" (gia parzialmente presente come "Passo Passo") deve:
```
1. Essere selezionabile dal tab "Passo Passo" nell'header dell'esperimento
2. Mostrare un pannello laterale ALLARGABILE/NASCONDIBILE con le istruzioni
3. Le istruzioni sono GENERATE dai dati dell'esperimento + dai volumi (lesson-paths/*.json)
4. Ogni step ha: testo chiaro, componente da piazzare, posizione suggerita
5. Il pannello NON DEVE sovrapporre il canvas (Principio Zero: no overlay cognitivo)
6. Il docente puo allargare/ridurre/nascondere il pannello come vuole
7. Quando lo studente (guidato dal docente) completa uno step, il prossimo si illumina
8. Feedback visivo: componente corretto = verde, sbagliato = arancione (mai rosso = ansia)
```

### 4.2 Implementazione
```
- Usa i dati di lesson-paths/*.json (64 file gia esistenti con 5 fasi)
- Il pannello e un RetractablePanel (gia esiste in lavagna/)
- Ogni fase del lesson-path diventa un blocco nel pannello
- Il pannello deve essere BEN LEGGIBILE: font >= 16px, padding generoso, icone chiare
- L'insegnante deve poter dire "ok, andiamo al passo successivo" con UN click
```

### 4.3 Stress test UX
```
- Il pannello NON deve coprire il circuito
- Su LIM il pannello deve essere leggibile da 3 metri
- Il pannello deve essere nascondibile con un gesto (click o swipe)
- I testi devono usare linguaggio 10-14 anni (come i volumi)
- Se l'esperimento non ha lesson-path, la modalita non deve crashare
```

---

## FASE 5 — UNLIM ONNIPOTENTE: RAG + AZIONI + CONTESTO TOTALE

### Obiettivo
UNLIM deve diventare DAVVERO onnipotente e onnisciente. Tutto cio che puoi fare a mano nell'app, UNLIM deve poterlo fare in linguaggio naturale. Il docente dice "monta il circuito del semaforo" e UNLIM lo fa. Dice "apri il pannello codice" e UNLIM lo fa.

### 5.1 Miglioramento RAG
```
Il RAG attuale ha 246 chunk in pgvector (Supabase). Miglioralo:

1. Leggi src/data/unlim-knowledge-base.js — verifica copertura
2. Verifica che OGNI esperimento dei volumi abbia chunk nel RAG
3. Se mancano chunk, aggiungili:
   - Ogni esperimento: titolo, componenti, schema, codice, spiegazione pedagogica
   - Ogni capitolo: introduzione, concetti chiave, obiettivi didattici
   - Ogni volume: struttura, progressione, prerequisiti
4. Il RAG deve contenere ANCHE:
   - Le istruzioni di montaggio (buildSteps/lesson-paths)
   - I quiz e le risposte corrette
   - I concetti collegati (concept-graph.js)
   - I circuiti rotti e misteriosi (broken-circuits.js, mystery-circuits.js)
5. Verifica che le query RAG restituiscano risultati pertinenti
```

### 5.2 Azioni UNLIM — Linguaggio Naturale → Azione
```
UNLIM deve poter eseguire TUTTE queste azioni in linguaggio naturale:

CIRCUITO:
- "Monta il circuito del semaforo" → mountExperiment('v3-cap6-semaforo')
- "Aggiungi un LED rosso" → addComponent('led', {color:'red'})
- "Collega il pin 13 al LED" → connectWire('nano1:W_D13', 'bb1:a15')
- "Rimuovi il resistore" → removeComponent('r1')
- "Pulisci tutto" → clearCircuit()
- "Cambia il valore del resistore a 1kOhm" → setComponentValue('r1', 1000)

SIMULAZIONE:
- "Avvia la simulazione" → play()
- "Ferma" → stop()
- "Compila il codice" → compile()
- "Apri il Serial Monitor" → openPanel('serial')

CODICE:
- "Cambia il delay a 500ms" → editCode (replace delay value)
- "Aggiungi un Serial.println" → editCode (insert line)
- "Mostra il codice Scratch" → switchToScratch()
- "Mostra il codice Arduino" → switchToArduino()

NAVIGAZIONE:
- "Vai all'esperimento 3 del capitolo 6" → loadExperiment('v3-cap6-esp3')
- "Apri il percorso lezione" → openPanel('percorso')
- "Mostra il manuale" → openPanel('manuale')
- "Cambia volume" → openExperimentPicker()
- "Torna alla scelta esperimenti" → showExperimentPicker()

PEDAGOGY:
- "Prepara la lezione sul semaforo" → lessonPrep con RAG context
- "Cosa abbiamo fatto la volta scorsa?" → loadContext da unlimMemory
- "Fai il quiz" → openQuizPanel()
- "Spiega cos'e un LED" → risposta RAG + evidenziazione componente

Implementazione:
1. Leggi src/services/simulator-api.js — queste API DEVONO essere tutte esposte
2. Leggi src/services/voiceCommands.js — 24 comandi vocali gia implementati
3. Leggi src/components/tutor/ElabTutorV4.jsx — INTENT system gia presente
4. Mappa OGNI azione sopra a una API esistente o creane una nuova
5. Aggiorna il prompt di UNLIM per includere TUTTE le azioni disponibili
6. Il sistema INTENT ([INTENT:{action:'mount', experiment:'v3-cap6-semaforo'}]) deve coprire OGNI azione
```

### 5.3 Contesto Totale — UNLIM sa TUTTO
```
UNLIM deve essere interconnesso con TUTTO il sistema:

1. STATO CIRCUITO: circuitContext gia iniettato (verificare che sia completo)
   - Quali componenti ci sono
   - Come sono collegati
   - Se la simulazione e in corso
   - Valori dei sensori/attuatori in tempo reale

2. STATO SESSIONE: unlimMemory.js
   - Cosa e stato fatto in QUESTA lezione
   - Cosa e stato fatto nelle lezioni PRECEDENTI (cross-session via Supabase)
   - Quali esperimenti sono completati
   - Dove lo studente ha avuto difficolta (confusion_reports)

3. STATO UI:
   - Quale pannello e aperto
   - Quale esperimento e caricato
   - Quale modalita e attiva (Gia Montato / Passo Passo / Libero)
   - Dimensione viewport (LIM/iPad/PC)

4. SUPABASE SYNC:
   - Supabase URL: https://vxvqalmxqtezvgiboxyv.supabase.co
   - Anon key: gia in .env (VITE_SUPABASE_ANON_KEY)
   - 8 tabelle ESISTONO e FUNZIONANO (verificato con curl)
   - RLS richiede auth → implementa flusso auth con chiave docente
   - Il docente inserisce la chiave → la chiave mappa su una classe Supabase
   - Ogni azione studente viene sincronizzata in real-time
   - unlimMemory.js ha 3 tier: localStorage → Supabase → nanobot

5. IMPLEMENTA AUTH SUPABASE:
   - La chiave univoca del docente deve mappare su una riga in 'classes'
   - Usa Supabase anon key + RLS policy che permette accesso con chiave classe
   - Aggiungi una RLS policy: SELECT/INSERT dove class_key = chiave fornita
   - Oppure usa una Supabase Edge Function come proxy auth
   - L'obiettivo: il docente inserisce la chiave, UNLIM puo leggere/scrivere su Supabase
```

### 5.4 Test UNLIM — 30 scenari reali
```
Testa OGNI azione con Control Chrome/preview tools.
Per ogni scenario: scrivi nel campo chat, verifica che l'azione avvenga.

SCENARI CIRCUITO (10):
1. "Monta il circuito del LED con resistore" → componenti appaiono
2. "Aggiungi un buzzer" → buzzer appare sul canvas
3. "Collega il buzzer alla batteria" → filo appare
4. "Cambia il resistore a 220 ohm" → valore cambia
5. "Rimuovi il buzzer" → buzzer scompare
6. "Pulisci tutto il circuito" → canvas vuoto
7. "Monta il semaforo" → circuito completo con 3 LED
8. "Qual e il circuito attuale?" → descrizione corretta
9. "C'e un errore nel circuito?" → analisi corretta
10. "Salva il circuito" → salvato in localStorage/Supabase

SCENARI CODICE (5):
11. "Compila il codice" → compilazione avviata
12. "Il codice e corretto?" → analisi del codice
13. "Cambia il delay a 200" → codice modificato
14. "Mostra i blocchi Scratch" → tab Scratch attiva
15. "Genera il codice dai blocchi" → C++ generato

SCENARI NAVIGAZIONE (5):
16. "Vai al capitolo 7" → esperimento picker aperto
17. "Apri il Serial Monitor" → pannello aperto
18. "Apri il percorso lezione" → pannello percorso
19. "Mostra il quiz" → quiz panel aperto
20. "Torna alla scelta esperimenti" → picker visibile

SCENARI PEDAGOGICI (5):
21. "Prepara la lezione di oggi" → lesson prep con contesto RAG
22. "Cosa abbiamo fatto la volta scorsa?" → memoria cross-sessione
23. "Spiega la Legge di Ohm" → spiegazione RAG + evidenziazione
24. "Lo studente non capisce le resistenze" → suggerimenti didattici
25. "Fai un riepilogo della lezione" → summary con concetti coperti

SCENARI EDGE CASE (5):
26. "Monta un esperimento che non esiste" → errore grazioso
27. Input vuoto → nessun crash
28. "Fai tutto" (vago) → chiede chiarimento
29. 3 comandi rapidi in sequenza → tutti eseguiti senza crash
30. UNLIM offline (nanobot down) → fallback locale funzionante
```

### 5.5 Onesta su UNLIM
```
Dopo i test, documenta ONESTAMENTE:
- Quante delle 30 azioni funzionano DAVVERO (non "dovrebbero funzionare")
- Quali falliscono e perche
- Fix IMMEDIATO per quelle che falliscono
- Se un'azione richiede backend non disponibile, documentalo
Target: 25/30 azioni funzionanti (83%)
```

---

## FASE 6 — BENCHMARK 100 DIMENSIONI (SEVERO)

Dopo tutte le fix, esegui il benchmark completo:
```
Leggi docs/BENCHMARK-100-PARAMETRI.md come template
Ri-scora TUTTI i 100 parametri con evidenza runtime (Control Chrome + preview tools)
Ogni score DEVE avere uno screenshot o log come prova
Score < 7 → identifica il fix e applicalo
Target: media >= 8.0/10

AGGIUNGI 10 NUOVE DIMENSIONI UNLIM (101-110):
101. UNLIM monta circuito da linguaggio naturale
102. UNLIM modifica codice da linguaggio naturale
103. UNLIM naviga tra esperimenti da linguaggio naturale
104. UNLIM apre/chiude pannelli da linguaggio naturale
105. UNLIM contesto circuito iniettato correttamente
106. UNLIM memoria cross-sessione funzionante
107. UNLIM RAG pertinenza risposte
108. UNLIM lesson prep con contesto volumi
109. UNLIM fallback offline funzionante
110. UNLIM 30 scenari stress test
```

---

## FASE 7 — AGGIORNAMENTO DOCUMENTAZIONE

```
1. Aggiorna docs/BUG-LIST-COMPLETA.md con tutti i nuovi bug trovati e fixati
2. Aggiorna docs/BENCHMARK-100-PARAMETRI.md con i nuovi score
3. Aggiorna docs/MAPPING-VOLUMI-APP.md con il mapping finale
4. Crea docs/STRESS-TEST-RISULTATI.md con i risultati per esperimento
5. Aggiorna .team-status/QUALITY-AUDIT.md
```

---

## REGOLE DEL RALPH LOOP

```
MAX ITERAZIONI: 100
COMPLETAMENTO: 95% degli stress test PASSANO + benchmark media >= 8.0

Ogni iterazione:
1. Identifica il prossimo problema piu grave
2. Root cause analysis (NO fix senza capire perche)
3. Fix MINIMALE (un cambio alla volta)
4. npx vitest run → DEVE passare (se no, REVERT)
5. npm run build → DEVE passare (se no, REVERT)
6. Verifica via preview tools che il fix funziona visivamente
7. CoV: rileggi cosa hai fatto, verifica coerenza

Ogni 5 iterazioni:
- /quality-audit completo
- Aggiorna docs/BUG-LIST-COMPLETA.md

Ogni 10 iterazioni:
- Benchmark 100 dimensioni aggiornato
- Screenshot di conferma via Control Chrome

CONDIZIONE DI USCITA:
- 95% stress test PASS (documentati con screenshot)
- Benchmark media >= 8.0/10
- UNLIM 25/30 azioni funzionanti (83%+)
- Zero crash in nessun scenario testato
- Tutti gli esperimenti dei volumi presenti e funzionanti
- "Monta tu" funzionante su LIM/iPad/PC
```

---

## SKILLS DA USARE

```
/systematic-debugging    — Per ogni bug trovato
/architecture            — Per decisioni strutturali (Monta tu)
/using-superpowers       — Coordinamento generale
/quality-audit           — Ogni 5 iterazioni
/ricerca-bug             — Ricerca sistematica bug
/analisi-simulatore      — Debug simulatore circuiti
/lim-simulator           — Test su LIM 1024x768
/impersonatore-utente    — Simula docente + classe
/analisi-statistica-severa — Benchmark severo
/lavagna-benchmark       — Benchmark lavagna
/elab-quality-gate       — Gate pre/post
```

## TOOLS TASSATIVI

```
- Control Chrome (mcp__Control_Chrome) — per navigare l'app reale nel browser
- Preview tools (mcp__Claude_Preview) — per screenshot, click, fill, resize, console, network
- Playwright via Bash — per test automatizzati E2E
```

---

## CONTESTO SESSIONE PRECEDENTE (MEGA BUG HUNT 04/04/2026)

### Risultati verificati:
- 1430/1430 test PASS
- Build PASS (30 precache, 2397 KiB)
- 26 bug fixati (dati, WCAG, sicurezza, performance, pulizia)
- 77 font < 14px portati a 14px
- ChatOverlay chunk 1768 → 77 KB (-96%)
- 91 esperimenti con tutti i campi (MA molti sono frammenti)
- Supabase: 8 tabelle ESISTONO, RLS richiede auth
- 3 bug architetturali residui (auth, CSP, 48 useEffect)

### Bug residui da sessione precedente:
1. Supabase Auth flow mancante (design gap)
2. CSP unsafe-inline (richiesto da React)
3. 48 useEffect in NewElabSimulator (architetturale)
