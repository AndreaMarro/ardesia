# PIANO 5 SESSIONI MASTER — Da 6.65 a 8.5+/10

## Stato iniziale verificato (31/03/2026)
- Build: PASS (30.59s) | Tests: 982/982 | Bundle: 4514KB
- Score composito reale: **6.65/10**
- Colli di bottiglia: UNLIM non onnipotente (6.5), Dashboard vuota (5.5), UX overlay cognitivo (5.5)

## Target: 8.5/10 in 5 sessioni (2 settimane)

## Struttura di ogni sessione
Ogni sessione ha 8 cicli autonomi. Ogni ciclo segue:
1. **ANALISI** — leggi stato, identifica il fix piu impattante
2. **ESECUZIONE** — implementa (max 30 min per ciclo)
3. **VERIFICA** — `npm run build && npx vitest run` + browser check
4. **DEBUG** — se fallisce, fix immediato. Se passa, ciclo completato.

Dopo i cicli 4 e 8: audit con agenti indipendenti.
A fine sessione: `/systematic-debugging` + `/elab-quality-gate`

---

## REGOLE INVARIANTI (valide per TUTTE e 5 le sessioni)

```
PATH: export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"
BUILD: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
TEST: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run
PALETTE: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D, Muted #737373
FONT: Open Sans (body), Oswald (heading), Fira Code (mono)
PRINCIPIO ZERO: L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE senza conoscenze pregresse
LINGUAGGIO: 10-14 anni, italiano, esempi pratici, analogie vita quotidiana
ZERO REGRESSIONI: 982+ test DEVONO passare
ENGINE INTOCCABILE: CircuitSolver.js, AVRBridge.js, SimulationManager.js — MAI modificare
ZERO DEMO: niente dati finti, niente mock visibili all'utente
ZERO EMOJI NEL CODICE: usa disegni SVG veri, icone vere, illustrazioni
SCORE: MAI auto-assegnare >7 senza verifica con agenti indipendenti
```

---

# ═══════════════════════════════════════════════════════════════
# SESSIONE 1 — UNLIM ONNIPOTENTE: API Circuiti + Montaggio Vocale
# Target: UNLIM Chat+Voice da 6.5 a 8.0 | Simulator Core da 7.5 a 8.0
# ═══════════════════════════════════════════════════════════════

## Prompt Sessione 1

```
SESSIONE 1/5 — UNLIM ONNIPOTENTE: API Circuiti + Montaggio Vocale
Deadline PNRR: 30/06/2026. Hai 2 settimane. Questa sessione e la piu critica.

## PRIMA DI TUTTO
Leggi completamente questi file — NON procedere finche non li hai letti:
1. CLAUDE.md — regole progetto, architettura, palette
2. docs/prompts/PIANO-5-SESSIONI-MASTER.md — piano completo e regole invarianti
3. src/services/simulator-api.js — API pubblica window.__ELAB_API (LEGGILA TUTTA)
4. src/components/unlim/UnlimWrapper.jsx — wrapper UNLIM (LEGGILO TUTTO)
5. src/services/voiceCommands.js — 11 comandi vocali attuali
6. src/components/simulator/hooks/useCircuitHandlers.js — come il simulatore gestisce i circuiti
7. src/components/simulator/NewElabSimulator.jsx — shell simulatore (LEGGILO TUTTO)
8. src/data/experiments-index.js — indice esperimenti

## CONTESTO E PRINCIPIO ZERO
ELAB Tutor e un prodotto per insegnanti che usano la LIM con ragazzi 10-14 anni.
L'insegnante deve arrivare alla lavagna e spiegare IMMEDIATAMENTE.
UNLIM e la mascotte-AI che vive nel simulatore. Deve essere ONNISCIENTE e ONNIPOTENTE.
"Onnipotente" significa: puo fare QUALSIASI operazione sul simulatore tramite linguaggio naturale.
Oggi UNLIM puo solo: play, stop, reset, nextStep, prevStep, showEditor, showSerial, compile, zoomFit.
NON PUO: montare circuiti, collegare fili, aggiungere componenti, modificare valori, posizionare sulla breadboard.
QUESTO E IL BLOCKER PRINCIPALE.

## OBIETTIVO SESSIONE
Rendere UNLIM capace di:
1. Montare un circuito completo da linguaggio naturale ("monta il circuito del LED")
2. Aggiungere/rimuovere singoli componenti ("aggiungi un resistore da 220 ohm")
3. Collegare/scollegare fili ("collega il LED al pin D13")
4. Modificare valori componenti ("metti il resistore a 1k")
5. Posizionare componenti sulla breadboard in modo intelligente
6. Rispondere a domande sullo stato del circuito ("che componenti ci sono?", "il circuito e corretto?")

## REGOLE ESECUZIONE
- PATH: export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"
- Build+Test dopo OGNI modifica. 982+ test devono passare. ZERO regressioni.
- Engine/ (CircuitSolver, AVRBridge, SimulationManager) NON si tocca MAI.
- Lavora su: simulator-api.js (estendi API), voiceCommands.js (nuovi comandi), UnlimWrapper.jsx (handler), useCircuitHandlers.js (se serve)
- Palette: Navy #1E4D8C, Lime #4A7A25
- Linguaggio interfaccia: 10-14 anni, italiano

## 8 CICLI STRUTTURATI

### Ciclo 1: Estendi window.__ELAB_API con metodi circuito
Aggiungi a simulator-api.js:
- `addComponent(type, options)` — aggiunge componente al circuito
- `removeComponent(id)` — rimuove componente
- `connectWire(fromPin, toPin)` — collega due pin con un filo
- `removeWire(id)` — rimuove filo
- `setComponentValue(id, prop, value)` — modifica proprieta (resistenza, colore LED, etc.)
- `getCircuitDescription()` — ritorna descrizione testuale completa del circuito
- `mountExperiment(experimentId)` — carica un esperimento completo (gia esiste loadExperiment, ma deve anche resettare)
- `clearCircuit()` — svuota il circuito

Verifica: build + test. Testa manualmente nel browser con console: `window.__ELAB_API.addComponent('led', {color: 'red'})`.

### Ciclo 2: Breadboard auto-placement intelligente
Crea `src/components/simulator/utils/autoPlacement.js`:
- `findBestPosition(componentType, existingComponents, breadboard)` — trova posizione ottimale
- Regole: componenti mai sovrapposti, LED vicino al resistore, Arduino in alto, batteria a sinistra
- Usa breadboardSnap.js esistente come base
- L'auto-placement deve funzionare per tutti i 21 tipi di componente

Verifica: `window.__ELAB_API.addComponent('led')` posiziona il LED automaticamente in un punto sensato.

### Ciclo 3: Voice commands per montaggio
Estendi voiceCommands.js con nuovi comandi (da 11 a ~25):
- "aggiungi LED" / "metti un resistore" / "aggiungi pulsante"
- "collega LED al pin 13" / "collega positivo alla batteria"
- "togli il resistore" / "rimuovi ultimo filo"
- "pulisci tutto" / "svuota circuito"
- "monta esperimento 1" / "carica il circuito del semaforo"
- "quanto vale il resistore?" / "che componenti ci sono?"

Ogni comando chiama i nuovi metodi di __ELAB_API.
Feedback vocale in italiano 10-14 anni ("Fatto! Ho aggiunto un LED rosso.", "Circuito pulito!").

Verifica: apri browser, attiva microfono, di' "aggiungi un LED" — deve apparire sulla breadboard.

### Ciclo 4: INTENT system upgrade per AI
Aggiorna ElabTutorV4.jsx sezione INTENT:
- Quando l'utente scrive "monta il circuito del LED" e l'AI risponde con [INTENT:{"action":"mount","experiment":"v1-cap6-esp1"}], il sistema deve ESEGUIRE il montaggio tramite la nuova API.
- Aggiungi INTENT types: mount_component, remove_component, connect_wire, set_value, clear_circuit, describe_circuit
- Ogni INTENT deve avere un feedback overlay contestuale ("Sto montando il circuito..." -> "Fatto! Guarda la breadboard.")

Verifica: scrivi "monta il circuito del primo LED" nella barra UNLIM. L'AI deve rispondere E montare il circuito.

### MID-SESSION AUDIT (dopo ciclo 4)
Lancia 2 agenti in parallelo:
- Agent 1: "Verifica che TUTTI i nuovi metodi API funzionino. Testa addComponent per ogni tipo, connectWire, removeComponent, setComponentValue, clearCircuit. Report con pass/fail per ogni metodo."
- Agent 2: "Verifica che i nuovi voice commands funzionino. Simula ogni comando testando matchVoiceCommand + executeVoiceCommand. Report con pass/fail."

### Ciclo 5: UNLIM vede lo stato completo
Migliora `getCircuitDescription()` per ritornare:
- Lista componenti con posizioni e valori
- Lista connessioni (wire) con pin sorgente e destinazione
- Stato simulazione (running/stopped)
- Esperimento attuale
- Errori attivi

Questo contesto va passato a OGNI chiamata AI, cosi UNLIM sa SEMPRE cosa c'e nel circuito.
Aggiungi a UnlimWrapper il campo `circuitContext` che si aggiorna ad ogni cambio circuito.

Verifica: chiedi a UNLIM "che componenti ci sono?" — deve rispondere con la lista esatta.

### Ciclo 6: Montaggio intelligente da esperimento
Quando l'utente dice "monta il circuito del capitolo 7", UNLIM deve:
1. Trovare l'esperimento giusto dal curriculum
2. Caricare i componenti uno per uno con animazione (delay 300ms)
3. Mostrare overlay contestuali: "Posiziono la batteria..." "Aggiungo il LED..." "Collego i fili..."
4. A fine montaggio: "Circuito pronto! Premi Play per vedere cosa succede."

Usa i dati degli esperimenti in experiments-vol1/2/3.js che hanno gia le `components` e `wires` definite.

Verifica: di' "monta il circuito del semaforo". I componenti devono apparire uno per uno con feedback.

### Ciclo 7: Qualita voce + feedback overlay
- Migliora i messaggi TTS: frasi naturali, non robotiche. "LED aggiunto!" -> "Ho messo un LED rosso sulla breadboard, proprio qui!"
- Overlay contestuali: il messaggio appare ACCANTO al componente appena aggiunto (usa UnlimOverlay con targetComponentId)
- Animazione di ingresso: il componente appare con un breve scale-in (0.8 -> 1.0, 200ms)
- Sound feedback opzionale: breve "click" quando un componente viene posizionato

Verifica nel browser: montaggio visivamente fluido, messaggi posizionati correttamente.

### Ciclo 8: Stress test + fix
- Testa montaggio di TUTTI e 67 esperimenti via API
- Testa 25 voice commands in sequenza rapida
- Testa INTENT con risposte AI malformate
- Testa edge case: aggiungi 50 componenti, rimuovi tutti, ri-aggiungi
- Fix tutti i bug trovati

Verifica: build + test 982+. Zero crash. Zero regressioni.

## FINE SESSIONE 1
Esegui:
1. `npm run build && npx vitest run` — deve passare
2. `/elab-quality-gate` — gate di qualita
3. `/systematic-debugging` — debug sistematico
4. Audit con 3 agenti indipendenti: API completezza, UX montaggio, code quality
5. Aggiorna score: UNLIM Chat+Voice target 8.0, Simulator Core target 8.0
```

---

# ═══════════════════════════════════════════════════════════════
# SESSIONE 2 — FRONTEND ESTETICO + REPORT FUMETTO VERO
# Target: Visual/UX da 5.5 a 7.5 | Report fumetto da 4.0 a 8.0
# ═══════════════════════════════════════════════════════════════

## Prompt Sessione 2

```
SESSIONE 2/5 — FRONTEND ESTETICO + REPORT FUMETTO VERO
Deadline PNRR: 30/06/2026. Questa sessione trasforma l'aspetto di ELAB.

## PRIMA DI TUTTO
Leggi completamente:
1. CLAUDE.md — regole, palette, font
2. docs/prompts/PIANO-5-SESSIONI-MASTER.md — piano completo e regole invarianti
3. src/styles/design-system.css — design tokens attuali
4. src/components/unlim/UnlimReport.jsx — report fumetto attuale (LEGGILO TUTTO — 600+ righe)
5. src/components/unlim/UnlimOverlay.jsx — overlay messaggi
6. src/components/unlim/UnlimMascot.jsx — mascotte
7. src/components/unlim/unlim-mascot.css — stili mascotte
8. src/components/tutor/ElabTutorV4.css — CSS principale (2136 LOC — analizza per duplicati)
9. src/components/tutor/TutorTools.css — CSS tools (995 LOC)
10. src/components/tutor/ChatOverlay.jsx — chat overlay
11. public/assets/mascot/ — tutti i PNG mascotte disponibili

## CONTESTO
Il report fumetto ELAB deve essere il FIORE ALL'OCCHIELLO del prodotto.
Quando il docente preme "Crea il report", si genera un FUMETTO VERO:
- Stile coerente con i volumi ELAB cartacei (illustrazioni colorate, non emoji)
- Narrativa coinvolgente per ragazzi 10-14 anni
- La mascotte ELAB come protagonista del racconto
- Pannelli comic con balloon, scene d'azione, momenti "oops!", vittorie
- Foto del circuito fisico + screenshot simulatore integrati nel fumetto
- Stampabile su A4, condivisibile come PDF

Oggi il report usa emoji come icone e ha una narrativa basica. Deve diventare un fumetto vero.

L'interfaccia generale deve:
- Ridurre l'overlay cognitivo: meno bottoni visibili, progressive disclosure
- Usare SVG e illustrazioni vere, NON emoji
- Essere coerente con la palette ELAB (Navy, Lime, colori volume)
- Font consistenti (Open Sans body, Oswald heading)
- Nessun inline style — tutto in CSS modules o design system

## REGOLE ESECUZIONE
- PATH, Build, Test come da regole invarianti
- ZERO emoji nel codice UI. Sostituisci ogni emoji con SVG inline o icone CSS
- Non toccare engine/ (CircuitSolver, AVRBridge, SimulationManager)
- Non toccare la logica dei lesson-paths o degli esperimenti
- Lavora su: UnlimReport.jsx, design-system.css, ElabTutorV4.css, UnlimMascot, UnlimOverlay, ChatOverlay

## 8 CICLI STRUTTURATI

### Ciclo 1: Audit CSS + eliminazione inline styles
Cerca con `grep -rn "style={{" src/components/tutor/ src/components/unlim/` — conta quanti inline styles ci sono.
Per ogni file, estrai gli inline styles piu usati e spostali in CSS modules.
Crea `src/components/unlim/unlim-wrapper.module.css` e `src/components/unlim/unlim-overlay.module.css`.
Obiettivo: ridurre inline styles del 60%+ nei file UNLIM e tutor principali.

Verifica: build + test. L'aspetto deve essere IDENTICO al prima.

### Ciclo 2: SVG icon set ELAB
Crea `src/components/common/ElabIcons.jsx` — libreria di icone SVG inline:
- RobotIcon (mascotte stilizzata)
- CircuitIcon (breadboard stilizzata)
- LightbulbIcon (per LED/idee)
- WrenchIcon (per strumenti)
- BookIcon (per volumi)
- MicrophoneIcon (per voce)
- CameraIcon (per foto)
- PrintIcon (per stampa)
- StarIcon (per punteggio)
- ErrorIcon (per errori — fulmine stilizzato)
- SuccessIcon (per successi — checkmark con scintille)
- QuestionIcon (per domande)
Ogni icona: 24x24 viewBox, stroke-based, colori parametrici via props, WCAG friendly.
Stile: linee pulite, bordi arrotondati, coerente con l'estetica dei volumi ELAB.

Sostituisci TUTTE le emoji usate come icone nel codice UNLIM con queste nuove SVG icons.

Verifica: nessuna emoji visibile nell'interfaccia UNLIM (tranne nel testo libero dell'utente).

### Ciclo 3: Report fumetto — struttura narrativa
Riscrivi `buildReportHTML()` in UnlimReport.jsx con:
- Cover page: illustrazione mascotte SVG (non PNG), titolo grande Oswald, badge volume colorato
- Struttura a pannelli comic VERI: bordi irregolari (non rettangoli perfetti), ombre portate, sfondo sfumato
- Balloon speech con code (tail) realistiche, non CSS triangoli
- Personaggi: mascotte ELAB (SVG, non emoji) e "la Classe" (silhouette SVG di ragazzi)
- Scene tipizzate: "Scoperta!" (sfondo giallo), "Oops!" (sfondo rosso chiaro), "Eureka!" (sfondo verde), "Domandona!" (sfondo blu)
- Narrativa: ogni scena ha un titolo dinamico basato sul CONTENUTO della domanda, non titoli fissi
- Concetti come "medaglie" SVG, non pill testuali
- Statistiche con grafici SVG inline (barre per messaggi, cerchio per tempo, stelle per punteggio)

Verifica: genera un report nel browser. Deve sembrare un fumetto VERO, non una pagina web.

### Ciclo 4: Report fumetto — foto e interattivita
Migliora il sistema di foto nel report:
- Il bottone "Aggiungi foto" apre il file picker O la fotocamera del dispositivo
- Le foto vengono ridimensionate automaticamente (max 800px lato lungo, JPEG 0.7)
- Drag-and-drop foto nei pannelli
- Ogni foto ha una didascalia editabile ("La nostra breadboard!")
- Il report ha un sommario stampabile all'inizio

Verifica: aggiungi 3 foto, scrivi didascalie, stampa in PDF — deve essere professionale.

### MID-SESSION AUDIT (dopo ciclo 4)
Lancia 2 agenti:
- Agent 1: "Controlla che NESSUNA emoji sia usata come icona nell'interfaccia UNLIM. Cerca tutti i file in src/components/unlim/ e src/components/tutor/ per emoji usate come decorazione. Report con file:riga per ogni violazione."
- Agent 2: "Verifica che il report fumetto generi HTML valido, che le illustrazioni SVG si rendano correttamente, che la stampa PDF sia corretta. Apri il report nel browser e verifica visivamente."

### Ciclo 5: Riduzione overlay cognitivo — toolbar minimale
La toolbar del simulatore ha troppi bottoni. Riducila:
- DEFAULT: solo Play/Stop, Volume (se UNLIM), Modalita (Gia Montato/Passo Passo/Libero)
- OVERFLOW MENU (3 puntini): Codice, Scratch, Serial, BOM, Quiz, Lavagna, Export, Shortcut
- Il menu overflow si apre con click, si chiude con click fuori
- Progressive disclosure: i bottoni "avanzati" appaiono SOLO dopo che il docente li ha usati almeno una volta (salva in localStorage)

Verifica: nel browser, la toolbar deve avere max 4-5 elementi visibili al primo uso.

### Ciclo 6: Chat overlay — stile ELAB, non generico
ChatOverlay.jsx + ChatOverlay.module.css:
- I messaggi AI hanno uno sfondo sfumato sottile (lime soft -> bianco)
- I messaggi utente hanno sfondo navy leggero
- La mascotte SVG appare accanto ai messaggi AI (piccola, 24px)
- Font size 16px minimo, line-height 1.6
- Le risposte AI che contengono codice: syntax highlighting con sfondo scuro (navy)
- Le risposte con AZIONE: il bottone azione e grande, colorato, touchable (56px)
- Nessun scroll infinito — max 20 messaggi visibili, "Carica precedenti" in alto

Verifica: apri la chat, invia 5 messaggi. L'aspetto deve essere pulito, leggibile, coerente.

### Ciclo 7: Mascotte ELAB — illustrazioni SVG
Riscrivi UnlimMascot per usare un SVG inline invece del PNG:
- Il robot ELAB come SVG: corpo rettangolare arrotondato, occhi grandi espressivi, antenne
- 4 stati con SVG diversi: idle (occhi normali), active (occhi brillanti), thinking (occhi con "..."), speaking (bocca aperta)
- Animazioni CSS smooth: breathing (scale), speaking (bounce), thinking (wobble)
- Il SVG deve essere coerente con lo stile dei volumi ELAB
- Dimensioni: 64x72px (come ora), ma vettoriale = nitido su qualsiasi DPI

Verifica: la mascotte SVG deve essere visivamente migliore del PNG attuale.

### Ciclo 8: Stress test estetico + fix
- Verifica LIM 1024x768: apri browser a quella risoluzione, controlla overflow
- Verifica iPad 1024x768 landscape
- Verifica font: NESSUN font-size < 14px in tutta l'interfaccia
- Verifica contrasto: NESSUN colore testo con contrasto < 4.5:1 su sfondo
- Verifica touch target: NESSUN bottone < 44px
- Verifica stampa report: PDF A4 corretto, nessun taglio, nessun overflow
- Fix tutti i problemi trovati

Verifica: build + test 982+. Zero regressioni.

## FINE SESSIONE 2
Esegui: build, test, /elab-quality-gate, /systematic-debugging, audit 3 agenti (estetica, report, a11y).
Score target: Visual/UX 7.5, Report fumetto 8.0.
```

---

# ═══════════════════════════════════════════════════════════════
# SESSIONE 3 — SUPABASE BACKEND + DASHBOARD + SESSIONI SALVATE
# Target: Dashboard da 5.5 a 7.5 | Sessioni persistenti
# ═══════════════════════════════════════════════════════════════

## Prompt Sessione 3

```
SESSIONE 3/5 — SUPABASE BACKEND + DASHBOARD + SESSIONI SALVATE
Deadline PNRR: 30/06/2026. Senza backend, il prodotto non e vendibile.

## PRIMA DI TUTTO
Leggi completamente:
1. CLAUDE.md — regole progetto
2. docs/prompts/PIANO-5-SESSIONI-MASTER.md — piano completo
3. src/services/supabaseClient.js — client Supabase attuale
4. src/services/supabaseAuth.js — auth Supabase
5. src/services/supabaseSync.js — sync Supabase
6. src/services/teacherDataService.js — servizio dati docente
7. src/services/studentService.js — servizio studente
8. src/services/authService.js — servizio auth
9. src/components/teacher/TeacherDashboard.jsx — dashboard (LEGGILO TUTTO — 3171 LOC)
10. src/hooks/useSessionTracker.js — session tracker
11. src/services/unlimMemory.js — memoria UNLIM persistente

## CONTESTO
La dashboard insegnante ha 11 tab ma senza backend Supabase e una shell vuota.
Le sessioni di lezione vengono salvate SOLO in localStorage = si perdono, non cross-device.
UNLIM deve ricordare il contesto delle lezioni PRECEDENTI = serve persistenza.
Supabase free tier: 500MB DB, 1GB storage, 50K auth users — piu che sufficiente.

## PRINCIPIO ZERO
Tutto deve funzionare con dati REALI. Zero mock, zero demo.
Se Supabase non e configurato: l'app funziona comunque (localStorage fallback), ma con un banner "Connetti per salvare i progressi".

## REGOLE ESECUZIONE
- PATH, Build, Test come da regole invarianti
- NON creare account Supabase — usa le credenziali gia in .env se presenti
- Se .env non ha VITE_SUPABASE_URL: tutto il codice Supabase deve essere graceful (try/catch, fallback localStorage)
- Schema DB: crea un file `supabase/schema.sql` con le CREATE TABLE
- ZERO dati finti nel codice

## 8 CICLI STRUTTURATI

### Ciclo 1: Schema database + migrazioni
Crea `supabase/schema.sql`:

```sql
-- Tabelle core ELAB
-- classes: classi del docente
-- students: studenti per classe
-- sessions: sessioni di lezione (esperimento, messaggi, errori, durata)
-- progress: progressi studente per esperimento
-- moods: umore classe (meteo didattico)
-- nudges: messaggi docente -> studente
```

Ogni tabella deve avere: id UUID, created_at, updated_at, RLS policies per docente/studente.
Il docente vede solo le sue classi. Lo studente vede solo i suoi progressi.

Verifica: lo schema SQL e valido (nessun errore di sintassi).

### Ciclo 2: Servizio sync sessioni
Riscrivi `src/services/supabaseSync.js`:
- `saveSession(session)` — salva sessione in Supabase (upsert)
- `loadSessions(classId, experimentId?)` — carica sessioni per classe/esperimento
- `saveProgress(studentId, experimentId, data)` — salva progressi
- `loadProgress(studentId)` — carica tutti i progressi
- Fallback: se Supabase non disponibile, salva in localStorage e riprova dopo (queue offline)

Integra in `useSessionTracker.js`: a fine sessione, chiama `saveSession()` automaticamente.

Verifica: build + test. Simula salvataggio sessione (con Supabase mock in test).

### Ciclo 3: UNLIM memoria cross-sessione
Riscrivi `src/services/unlimMemory.js`:
- `saveContext(classId, experimentId, context)` — salva contesto lezione
- `loadContext(classId)` — carica TUTTO il contesto precedente della classe
- `getLastLesson(classId)` — ritorna ultima lezione fatta
- `getProgress(classId)` — ritorna esperimenti completati, concetti acquisiti

Quando UNLIM prepara la lezione, legge il contesto:
"L'ultima volta avete fatto il LED (Cap 6). Oggi passiamo al resistore (Cap 7)!"

Verifica: salva contesto, ricarica pagina, il contesto e ancora li.

### Ciclo 4: Dashboard — dati reali da Supabase
Aggiorna `TeacherDashboard.jsx` + `teacherDataService.js`:
- Tab Giardino: mostra studenti con il loro livello (seme/germoglio/pianta/fiore/albero) basato sui progressi REALI
- Tab Meteo: mostra "meteo classe" basato su sessioni reali (soleggiato = tanti messaggi, piovoso = pochi, temporale = molti errori)
- Tab Attivita: lista sessioni reali con data, esperimento, durata, messaggi
- Se Supabase non disponibile: banner "Connetti Supabase per i dati classe" + fallback localStorage

Verifica nel browser: la dashboard mostra dati (da localStorage o Supabase).

### MID-SESSION AUDIT (dopo ciclo 4)
2 agenti:
- Agent 1: "Verifica lo schema SQL: chiavi primarie, foreign key, indici, RLS policies. Verifica che ogni tabella abbia le colonne necessarie per i dati che il frontend richiede."
- Agent 2: "Verifica che il fallback localStorage funzioni quando Supabase non e configurato. Testa ogni funzione di supabaseSync.js e unlimMemory.js senza VITE_SUPABASE_URL."

### Ciclo 5: Dashboard — tab Progressi e Confusione
- Tab Progressi: grafico barre (recharts) per ogni studente — esperimenti completati vs totale per volume
- Tab Confusione: heatmap semplice — quali esperimenti hanno piu errori (colore rosso = molti errori, verde = pochi)
- I grafici usano recharts (gia in dependencies) con palette ELAB

Verifica: con dati localStorage, i grafici si rendono correttamente.

### Ciclo 6: Export + Report classe
- Tab Documenti: il docente esporta CSV con progressi classe
- "Genera report classe": PDF (via SessionReportPDF.jsx) con sommario classe, top 5 esperimenti, concetti acquisiti, studenti in difficolta
- Il report usa lo stile fumetto ELAB (dalla sessione 2)

Verifica: esporta CSV, genera PDF — entrambi corretti.

### Ciclo 7: Nudge sistema reale
- Tab Nudge: il docente scrive un messaggio e lo invia a tutta la classe o a uno studente
- Il messaggio appare come overlay nello schermo dello studente (gia implementato in UnlimWrapper.jsx)
- Con Supabase: il nudge viene salvato nel DB e letto in tempo reale (Supabase Realtime)
- Senza Supabase: nudge via localStorage + BroadcastChannel (stessa macchina)

Verifica: invia nudge dalla dashboard, appare sullo schermo studente.

### Ciclo 8: Stress test backend + fix
- Testa con 30 sessioni simulate (crea dati realistici)
- Testa timeout Supabase (network slow)
- Testa concurrent writes (2 tab aperte)
- Testa RLS: studente non puo vedere dati di altra classe
- Fix tutti i bug

Verifica: build + test 982+. Dashboard funzionante.

## FINE SESSIONE 3
build, test, /elab-quality-gate, /systematic-debugging, audit 3 agenti (backend, dashboard, security).
Score target: Dashboard 7.5, UNLIM memory 8.0.
```

---

# ═══════════════════════════════════════════════════════════════
# SESSIONE 4 — SVG BELLEZZA + SCRATCH PERFETTO + OFFLINE TOTALE
# Target: SVG da 7.0 a 8.5 | Scratch+Compiler da 7.0 a 8.0 | Responsive/A11y da 6.5 a 8.0
# ═══════════════════════════════════════════════════════════════

## Prompt Sessione 4

```
SESSIONE 4/5 — SVG BELLEZZA + SCRATCH PERFETTO + OFFLINE TOTALE
Deadline PNRR: 30/06/2026.

## PRIMA DI TUTTO
Leggi completamente:
1. CLAUDE.md — regole, architettura, palette
2. docs/prompts/PIANO-5-SESSIONI-MASTER.md — piano e regole invarianti
3. src/components/simulator/components/NanoR4Board.jsx — Arduino SVG attuale
4. src/components/simulator/components/BreadboardFull.jsx — Breadboard SVG
5. src/components/simulator/components/Led.jsx — LED SVG (come esempio di componente)
6. src/components/simulator/panels/ScratchEditor.jsx — Scratch/Blockly editor
7. src/components/simulator/panels/ScratchCompileBar.jsx — barra compilazione Scratch
8. src/services/compiler.js — servizio compilatore
9. public/hex/ — HEX pre-compilati (12 file)
10. src/data/experiments-vol3.js — esperimenti Vol3 con codice Arduino

## CONTESTO
I componenti SVG funzionano ma non sono belli come Tinkercad.
Scratch funziona ma e basilare. Solo 12 HEX pre-compilati su 67 esperimenti.
L'app deve funzionare OFFLINE per le scuole con connessione instabile.

## REGOLE
- PATH, Build, Test come da regole invarianti
- Engine/ INTOCCABILE
- Ogni SVG deve avere: ombre portate, gradienti sottili, bordi arrotondati, stile 3D isometrico leggero
- Scratch blocks: colori ELAB, etichette in italiano 10-14 anni

## 8 CICLI STRUTTURATI

### Ciclo 1: NanoR4Board SVG — bellezza hardware
Riscrivi NanoR4Board.jsx con SVG di alta qualita:
- Corpo PCB verde scuro con texture sottile (pattern SVG)
- Chip ATmega nero con scritte bianche
- Pin dorati con riflesso metallico (gradiente lineare)
- LED power verde acceso
- Connettore USB-C grigio metallico
- Logo "Arduino" in bianco sul PCB
- Ombre portate sottili per profondita
- MANTIENI: tutte le posizioni pin, SCALE=1.8, tutte le props/state

NON modificare la logica — solo l'aspetto SVG.

Verifica: nel browser, il NanoR4 deve sembrare realistico, non piatto.

### Ciclo 2: Componenti SVG — upgrade estetico
Per ogni componente SVG (LED, Resistore, Capacitor, Buzzer, Pulsante, Potentiometro, Servo):
- Aggiungi gradienti sottili per effetto 3D
- Bordi arrotondati dove appropriato
- Ombre portate leggere
- Colori realistici (resistore con bande colorate corrette, LED con diffusore trasparente)
- Animazioni quando attivi (LED glow, buzzer vibrazione, servo rotazione fluida)

Priorita: LED, Resistore, Pulsante, Potentiometro (i piu usati in Vol1).

Verifica: apri un esperimento Vol1. I componenti devono sembrare professionali.

### Ciclo 3: BreadboardFull SVG — dettaglio realistico
Migliora BreadboardFull.jsx:
- Texture superficiale plastica bianca con leggera grana
- Fori con profondita (ombra interna)
- Etichette righe/colonne nitide (font monospace piccolo ma leggibile)
- Bus power: linee rosse (+) e blu (-) piu evidenti
- Clip laterali metalliche

Verifica: la breadboard deve sembrare una foto, non un disegno piatto.

### Ciclo 4: Pre-compilazione 67 HEX
Per ogni esperimento Vol3 che ha codice Arduino (in experiments-vol3.js):
- Estrai il codice
- Pre-compila a HEX (usa il compiler service)
- Salva in public/hex/ con naming: `v3-capN-esperimento.hex`
- Aggiorna experiments-vol3.js con il path al HEX

Obiettivo: da 12 a 67 HEX (o quanti hanno codice Arduino).
Se il compiler non e disponibile offline, crea uno script Node `scripts/precompile-hex.js` che compila tutti.

Verifica: tutti gli esperimenti Vol3 hanno un HEX associato.

### MID-SESSION AUDIT (dopo ciclo 4)
2 agenti:
- Agent 1: "Confronta ogni componente SVG ELAB con l'equivalente Tinkercad. Score 1-10 per realismo, colori, dettaglio. Report per componente."
- Agent 2: "Verifica che tutti i 67 esperimenti abbiano HEX pre-compilato. Lista quelli mancanti."

### Ciclo 5: Scratch blocks — italiano perfetto + colori ELAB
Migliora ScratchEditor.jsx:
- Tutti i blocchi in italiano fluente ("Accendi il pin", "Aspetta 1 secondo", "Se il pulsante e premuto")
- Colori blocchi: Navy (controllo), Lime (I/O digitale), Orange Vol2 (I/O analogico), Red Vol3 (comunicazione)
- Blocchi custom per ELAB: "Accendi LED", "Leggi pulsante", "Scrivi sul display", "Muovi servo"
- Tooltip su ogni blocco: spiegazione in italiano 10-14 anni ("Questo blocco accende o spegne un pin")

Verifica: apri Scratch editor, i blocchi sono in italiano con colori ELAB.

### Ciclo 6: Offline resilience totale
- Service Worker: verifica che TUTTI i file critici siano in precache (vite-plugin-pwa)
- Aggiungi TUTTI i 67 HEX al precache
- Aggiungi font, mascotte SVG, icone al precache
- Offline detection banner: "Sei offline — il simulatore funziona, ma UNLIM no"
- Compiler offline: se nessun server disponibile, usa i HEX pre-compilati
- Test: disattiva rete nel browser, naviga l'app. Tutto tranne UNLIM AI deve funzionare.

Verifica: offline mode, carica esperimento, premi Play — funziona.

### Ciclo 7: Responsive LIM + iPad + Mobile
Test sistematico a 5 risoluzioni:
- LIM 1024x768
- LIM 1920x1080
- iPad 1024x768 landscape
- iPad 768x1024 portrait (mostra RotateDeviceOverlay)
- Mobile 390x844

Per ogni risoluzione: verifica overflow, font leggibili, touch target 56px+, nessun scroll orizzontale.
Fix tutti i problemi trovati in tutor-responsive.css.

Verifica nel browser a ogni risoluzione.

### Ciclo 8: Stress test grafico + fix
- Carica esperimento con 15+ componenti (v1-cap14 o v2-cap10)
- Verifica rendering SVG: nessun overlap, nessun artefatto
- Verifica zoom/pan fluido con molti componenti
- Verifica stampa report con screenshot SVG complesso
- Performance: FPS del canvas con 15 componenti (deve essere >30fps)
- Fix tutti i bug

Verifica: build + test 982+.

## FINE SESSIONE 4
build, test, /elab-quality-gate, /systematic-debugging, audit 3 agenti (SVG quality, Scratch, offline).
Score target: SVG 8.5, Scratch 8.0, Responsive 8.0.
```

---

# ═══════════════════════════════════════════════════════════════
# SESSIONE 5 — POLISH FINALE + STRESS TEST + VOCE + AUDIT TOTALE
# Target: Tutti gli score a 8.0+ | Composito 8.5+/10
# ═══════════════════════════════════════════════════════════════

## Prompt Sessione 5

```
SESSIONE 5/5 — POLISH FINALE + STRESS TEST + VOCE + AUDIT TOTALE
Deadline PNRR: 30/06/2026. Ultima sessione. Il prodotto deve essere PRONTO.

## PRIMA DI TUTTO
Leggi completamente:
1. CLAUDE.md
2. docs/prompts/PIANO-5-SESSIONI-MASTER.md — piano e regole invarianti
3. Tutti i file modificati nelle sessioni 1-4 (controlla git diff dalla sessione 1)
4. Fai un `npm run build && npx vitest run` — DEVE passare prima di qualsiasi modifica

## CONTESTO
Le sessioni 1-4 hanno aggiunto:
- S1: UNLIM onnipotente (API circuiti, montaggio vocale, INTENT upgrade)
- S2: Frontend estetico (report fumetto vero, icone SVG, overlay ridotto)
- S3: Supabase backend (dashboard reale, sessioni persistenti, nudge)
- S4: SVG bellezza, Scratch perfetto, offline totale

Questa sessione e dedicata a:
1. Qualita voce (meno robotica, piu naturale)
2. Integration test di TUTTO
3. Bug hunting aggressivo
4. Performance optimization
5. Audit totale con 5+ agenti indipendenti

## REGOLE
Come sempre: PATH, Build, Test, palette, engine intoccabile, zero emoji, zero demo, zero regressioni.

## 8 CICLI STRUTTURATI

### Ciclo 1: Voce naturale — TTS avanzato
Il Web Speech API nativo e robotico. Migliora:
- `src/hooks/useTTS.js`: seleziona la voce italiana migliore disponibile (cerca "Google italiano" o "Alice" o la voce con rating piu alto)
- Rate: 0.95 (leggermente piu lento del default per chiarezza)
- Pitch: 1.05 (leggermente piu alto per sembrare giovane)
- Aggiungi pause naturali: prima di "?", dopo "!", dopo "."
- Chunking: spezza frasi lunghe in segmenti <100 caratteri per evitare il monotono
- Pre-riscaldamento: la prima frase di ogni sessione viene pre-sintetizzata per evitare il ritardo iniziale

Verifica: chiedi a UNLIM una domanda. La voce deve suonare naturale, non robotica.

### Ciclo 2: Integration test — flusso docente completo
Simula il flusso COMPLETO della Prof.ssa Rossi:
1. Apre ELAB Tutor (homepage)
2. Sceglie Volume 1
3. Arriva al Cap 6, Esperimento 1
4. UNLIM dice "Oggi accendiamo il primo LED!"
5. Il docente dice "Monta il circuito" — UNLIM monta
6. Il docente preme Play — la simulazione parte
7. Il docente chiede "Perche il LED si accende?"
8. UNLIM risponde con spiegazione + highlight
9. Il docente preme "Crea il report" — fumetto generato
10. Il docente va alla Dashboard — vede la sessione registrata

Testa OGNI passo. Annota OGNI bug o friction. Fix immediato.

Verifica: il flusso completo funziona senza interruzioni.

### Ciclo 3: Integration test — flusso studente
Simula il flusso dello studente Mario:
1. Apre ELAB Tutor (login studente)
2. Vede il giardino con il suo progresso
3. Apre l'esperimento suggerito da UNLIM
4. Lavora sull'esperimento (monta, codifica, testa)
5. UNLIM lo guida con domande socratiche
6. A fine esperimento: vede il punteggio
7. Riceve un nudge dal docente
8. Naviga alla dashboard studente

Testa e fix.

### Ciclo 4: Performance optimization
- Bundle: identifica i chunk >500KB e valuta code splitting aggiuntivo
- Lazy load: verifica che ScratchEditor, CircuitDetective, PredictObserveExplain, ReverseEngineeringLab, CircuitReview, ManualTab, CanvasTab, NotebooksTab, VideosTab siano TUTTI lazy
- Image optimization: verifica che le immagini mascotte siano <100KB
- CSS purge: cerca CSS inutilizzato con un agente
- First Contentful Paint: deve essere <2s su connessione LIM (100Mbps wired)

Verifica: `npm run build` — nessun chunk >1000KB (ideale). Profilo performance nel browser.

### MID-SESSION AUDIT (dopo ciclo 4)
3 agenti in parallelo:
- Agent 1: "Fai un penetration test leggero: XSS nei messaggi chat, injection nei campi input, CSRF, secrets esposti in bundle. Report con severita."
- Agent 2: "Verifica WCAG AA su tutta l'interfaccia: contrasto, focus visible, aria-label, screen reader, keyboard navigation. Report con violazioni per file."
- Agent 3: "Verifica che OGNI esperimento (67) si carichi correttamente nel simulatore. Per ognuno: componenti presenti, wires corretti, simulazione parte. Report pass/fail."

### Ciclo 5: Fix P0 da audit
Tutti i bug P0 (critical) trovati dall'audit vengono fixati immediatamente.
Ordine: security > crash > data loss > visual.

### Ciclo 6: Fix P1 da audit
Tutti i bug P1 (major) vengono fixati.
Ordine: UX > a11y > performance > cosmetic.

### Ciclo 7: Pulizia finale
- Rimuovi TUTTO il codice morto (funzioni mai chiamate, import inutilizzati, CSS mai usato)
- Rimuovi console.log di debug (tieni solo logger.log/error)
- Verifica che .env.example sia aggiornato con tutte le variabili necessarie
- Verifica che robots.txt, sitemap.xml, manifest.json siano corretti
- Verifica che la PWA si installi correttamente

Verifica: build + test.

### Ciclo 8: AUDIT TOTALE FINALE — 5 agenti indipendenti
Lancia 5 agenti in parallelo, ognuno con istruzioni severe:

Agent 1 — SPEC AUDITOR:
"Sei un auditor SEVERO. Score 1-10 per ognuna delle 8 aree:
1. Simulator core DC+AVR
2. SVG components
3. Scratch+Compiler
4. UNLIM Chat+Voice
5. Dashboard (11 tabs)
6. Visual/UX
7. Build/Test/Perf
8. Responsive/A11y
Per ogni area: cosa funziona, cosa NON funziona, score con giustificazione.
NON essere gentile. Cerca problemi."

Agent 2 — UX AUDITOR:
"Impersona la Prof.ssa Rossi, 55 anni, zero esperienza tech.
Naviga TUTTA l'app. Per ogni schermata: capisci cosa fare? I bottoni sono chiari? Il testo e leggibile? Lo schermo e pulito? Score 1-10 per schermata."

Agent 3 — STUDENT AUDITOR:
"Impersona Marco, 12 anni, curioso ma impaziente.
Naviga l'app come studente. E divertente? UNLIM e simpatico? I giochi funzionano? Il fumetto e figo? Score 1-10."

Agent 4 — SECURITY AUDITOR:
"Cerca: XSS, injection, secrets nel bundle, GDPR violazioni, localStorage con dati sensibili, CORS issues, CSP violations. Score 1-10."

Agent 5 — PERFORMANCE AUDITOR:
"Misura: First Paint, bundle size per chunk, memory leaks (5 min navigation), offline mode, PWA install, Lighthouse score simulato. Score 1-10."

Media dei 5 agenti = SCORE FINALE REALE.

## FINE SESSIONE 5
Il prodotto e PRONTO per essere mostrato alle scuole.
Score target: 8.5+/10 composito da 5 agenti indipendenti.
Output: deploy su Vercel.
```

---

## RIEPILOGO PIANO

| Sessione | Focus | Da | A | Delta |
|----------|-------|----|---|-------|
| S1 | UNLIM Onnipotente (API + Voice + INTENT) | 6.5 | 8.0 | +1.5 |
| S2 | Frontend Estetico + Report Fumetto | 5.5 | 7.5 | +2.0 |
| S3 | Supabase Backend + Dashboard + Sessioni | 5.5 | 7.5 | +2.0 |
| S4 | SVG Bellezza + Scratch + Offline | 7.0 | 8.5 | +1.5 |
| S5 | Polish + Stress Test + Audit Totale | 6.65 | 8.5 | +1.85 |

## Score composito atteso dopo 5 sessioni

| Area | Peso | Score Target |
|------|------|-------------|
| Simulator core | 15% | 8.0 |
| SVG components | 10% | 8.5 |
| Scratch+Compiler | 10% | 8.0 |
| UNLIM Chat+Voice | 15% | 8.0 |
| Dashboard | 15% | 7.5 |
| Visual/UX | 15% | 7.5 |
| Build/Test/Perf | 10% | 9.0 |
| Responsive/A11y | 10% | 8.0 |
| **Composito** | | **8.03** |

> Nota onesta: 8.5 e ambizioso. 8.0 e realistico. Sotto 7.5 significherebbe che qualche sessione e fallita.

## Dipendenze tra sessioni

```
S1 (UNLIM API) ──> S2 (usa le nuove API per il report fumetto)
                ──> S3 (UNLIM usa la memoria Supabase)
S2 (SVG icons) ──> S4 (SVG componenti usano lo stesso stile)
S3 (Supabase)  ──> S5 (audit testa tutto il flusso con backend)
S4 (Offline)   ──> S5 (stress test offline)
```

Le sessioni DEVONO essere eseguite in ordine S1 -> S2 -> S3 -> S4 -> S5.
