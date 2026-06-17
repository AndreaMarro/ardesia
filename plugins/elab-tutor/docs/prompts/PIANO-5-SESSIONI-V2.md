# PIANO 5 SESSIONI V2 — Da 6.3 a 8.5+/10
## Basato su audit 4 agenti indipendenti (01/04/2026)
## Score iniziale verificato: 6.3/10

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
ZERO REGRESSIONI: 1001+ test DEVONO passare
ENGINE INTOCCABILE: CircuitSolver.js, AVRBridge.js, SimulationManager.js — MAI modificare
ZERO DEMO: niente dati finti, niente mock visibili all'utente
ZERO EMOJI NEL CODICE: usa ElabIcons.jsx SVG, icone vere, illustrazioni
SCORE: MAI auto-assegnare >7 senza verifica con agenti indipendenti
PRECACHE: deve restare 33 entries ~5000KB. Verificare dopo ogni build.
```

## TOOL STACK — Usa questi plugin in OGNI sessione
Tutti gia installati. NON serve installare nulla.

### OBBLIGATORI ad ogni sessione:
```
/elab-quality-gate          — PRIMA e DOPO ogni sessione (gate qualita)
/systematic-debugging       — dopo OGNI test failure o bug
/verification-before-completion — PRIMA di dichiarare un ciclo completo
/quality-audit              — audit end-to-end su font, touch, a11y, bundle
```

### Da usare per cicli specifici:
```
/frontend-design            — quando si tocca UI/CSS/layout
/design:design-critique     — review design prima di committare cambi visivi
/design:accessibility-review — audit WCAG su ogni cambio a11y
/code-review                — dopo ogni ciclo di codice significativo
/pr-review-toolkit:review-pr — review multi-agente a fine sessione
/coderabbit:review          — code review AI aggiuntiva
/engineering:testing-strategy — quando si aggiungono test
/engineering:deploy-checklist — prima del deploy finale
```

### Per stress test e debug:
```
/playwright                 — E2E browser test (navigazione, click, form, screenshot)
/simplify                   — semplificazione codice dopo ogni implementazione
/engineering:debug           — debugging strutturato
```

### Per pianificazione:
```
/brainstorming              — PRIMA di ogni feature creativa (fumetto, mascotte, UX)
/writing-plans              — quando serve un piano multi-step
/subagent-driven-development — per task paralleli indipendenti
```

### Workflow tipo per ogni CICLO:
1. ANALISI: leggi stato, identifica target
2. Se creativo: /brainstorming prima di scrivere codice
3. ESECUZIONE: implementa
4. /simplify sul codice scritto
5. /verification-before-completion — verifica che funzioni DAVVERO
6. Se UI: /frontend-design + /design:design-critique
7. Se a11y: /design:accessibility-review
8. Build + test + precache check
9. Se fallisce: /systematic-debugging → fix → ripeti da 5

### Workflow AUDIT (dopo ciclo 4 e 8):
1. /elab-quality-gate
2. /quality-audit
3. 3-5 agenti indipendenti in parallelo
4. /code-review sul diff della sessione
5. /pr-review-toolkit:review-pr (se c'e un PR)
6. Se ci sono bug: /systematic-debugging per ognuno

## STRUTTURA DI OGNI SESSIONE
Ogni sessione ha 8 cicli. Ogni ciclo segue:
1. ANALISI — leggi stato, identifica il fix piu impattante
2. ESECUZIONE — implementa (max 30 min per ciclo)
3. VERIFICA — `npm run build && npx vitest run` + controlla precache entries
4. VERIFICA TOOL — /verification-before-completion + /simplify
5. DEBUG — se fallisce: /systematic-debugging → fix immediato

Dopo ciclo 4: mid-session audit con 3 agenti + /quality-audit
Dopo ciclo 8: audit finale con 5 agenti + /elab-quality-gate + /pr-review-toolkit

## REGOLA HANDOFF — OGNI SESSIONE GENERA IL PROMPT DELLA SUCCESSIVA
A fine sessione (dopo ciclo 8), DEVI:
1. Scrivere il prompt della sessione successiva basandoti su:
   - Score REALI usciti dall'audit finale (non quelli pianificati)
   - Bug P0/P1 rimasti aperti (non fixati in questa sessione)
   - Nuovi bug trovati durante la sessione
   - Cicli non completati o parziali
2. Salvare il prompt in `docs/prompts/SESSIONE-{N+1}-PROMPT.md`
3. Il prompt deve seguire la stessa struttura (8 cicli, mid-audit, audit finale)
4. Il prompt deve INIZIARE con "## STATO EREDITATO DALLA SESSIONE {N}" con score reali e bug aperti
5. Se lo score target non e stato raggiunto: il prompt successivo DEVE prioritizzare i gap

## ALGORITMO DI AUTO-ALLINEAMENTO
All'inizio di ogni sessione:
1. Leggi CLAUDE.md + questo file + MEMORY.md
2. Esegui build + test — DEVONO passare
3. Esegui /elab-quality-gate — gate di ingresso
4. Lancia 2 agenti veloci: (a) "Conta emoji nei JSX" (b) "Verifica precache entries"
5. Se regressioni trovate: STOP. /systematic-debugging → fix prima di qualsiasi altro lavoro.
6. Aggiorna score per area basandoti sui fix effettivi della sessione precedente.

A fine di ogni sessione (OBBLIGATORIO):
1. Esegui /elab-quality-gate — gate di uscita
2. Esegui /quality-audit — audit end-to-end
3. Lancia 5 agenti audit indipendenti
4. Esegui /code-review sul diff completo della sessione
5. Scrivi il HANDOFF prompt per la sessione successiva
6. Se ci sono test failure: /systematic-debugging fino a risoluzione PRIMA del handoff

---

# ===============================================================
# SESSIONE 1/5 — EMOJI PURGE + VOICE FIX + AUTH BRIDGE
# Target: Visual 6.1->7.5 | UNLIM 6.7->7.5 | Dashboard 4->5.5
# Score target: 6.3 -> 7.0
# ===============================================================

```
SESSIONE 1/5 — PULIZIA VISUALE + VOICE FIX + AUTH BRIDGE
Deadline PNRR: 30/06/2026. Score attuale: 6.3/10. Target sessione: 7.0/10.

## PRIMA DI TUTTO
Leggi completamente:
1. CLAUDE.md
2. docs/prompts/PIANO-5-SESSIONI-V2.md — piano e regole invarianti
3. Fai `npm run build && npx vitest run` — DEVE passare prima di qualsiasi modifica
4. Conta le emoji nei file JSX: `grep -rn "[\x{1F300}-\x{1F9FF}]" src/ --include="*.jsx" | wc -l`

## CONTESTO
Audit 4 agenti ha trovato:
- 70+ emoji usate come icone UI (ElabIcons.jsx esiste con 24 SVG ma non e usato ovunque)
- Voice command `compile()` chiamato senza argomenti (P0)
- Voice command `zoomFit` chiama `fitToView()` che NON ESISTE (P0)
- JWT parsing bug in unlimMemory.js (indice [0] invece di [1])
- Pattern collision `torna indietro` (prevStep vince, undo e dead code)
- INTENT add_component ignora il colore
- Auth bridge mancante: Supabase RLS richiede auth.uid() ma login usa Netlify

## PRINCIPIO ZERO
L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE.
ELAB Tutor, i kit fisici e i volumi sono LO STESSO PRODOTTO.

## 8 CICLI STRUTTURATI

### Ciclo 1: Fix P0 Voice Commands
- `voiceCommands.js` linea ~78: `compile` deve prima ottenere il codice dall'editor (`window.__ELAB_API.getEditorCode?.()`) poi chiamare `compile(code)`
- `voiceCommands.js` linea ~86: `zoomFit` deve chiamare `window.__ELAB_API.zoomFit?.()` — verificare che esista in simulator-api.js, se no aggiungerlo
- Fix pattern collision: rinominare il pattern undo da `torna indietro` a `annulla` o `cancella`
- Fix INTENT add_component: passare `opts` con colore a `handleComponentAdd`
Verifica: ogni voice command deve chiamare un metodo che ESISTE.

### Ciclo 2: Fix JWT + Memory bugs
- `unlimMemory.js` linea ~369: JWT parsing `token.split('.')[0]` → `token.split('.')[1]`
- `unlimMemory.js`: timer `initSync()` setInterval mai pulito → aggiungere cleanup
- `supabaseSync.js`: verificare che il fix JWT [1] sia presente (fatto in sessione precedente)
- `supabase.auth.session?.()` deprecato in v2 → usare pattern async `getSession()`
Verifica: `_getCurrentUserId()` ritorna un ID reale, non null.

### Ciclo 3: Emoji Purge — UnlimWrapper.jsx + ElabTutorV4.jsx
Questi 2 file hanno 40+ emoji. Per ognuna:
- Identifica l'emoji e il suo contesto (toast message, button label, etc.)
- Sostituisci con l'icona SVG appropriata da ElabIcons.jsx
- Se ElabIcons non ha l'icona necessaria, CREALA (stile Feather, 24x24, stroke-based)
- Se l'emoji e in un testo che viene letto ad alta voce (TTS), sostituisci con parole
Target: ZERO emoji in UnlimWrapper.jsx e ElabTutorV4.jsx.

### Ciclo 4: Emoji Purge — VolumeChooser + VetrinaSimulatore + NewElabSimulator
- VolumeChooser.jsx: 4 emoji volume icons → icone SVG ELAB
- VetrinaSimulatore.jsx: 6 emoji feature icons → icone SVG
- NewElabSimulator.jsx: 5+ emoji → icone SVG
- LandingPNRR.jsx: 6 emoji → icone SVG
- SessionReportPDF.jsx: 7 emoji → icone SVG
Target: ZERO emoji nei file sopra.

### MID-SESSION AUDIT (dopo ciclo 4)
3 agenti in parallelo:
- Agent 1: "Conta TUTTE le emoji rimaste in src/**/*.jsx. Report per file."
- Agent 2: "Verifica che TUTTI i 24 voice commands chiamino metodi ESISTENTI su __ELAB_API. Report pass/fail per comando."
- Agent 3: "Testa _getCurrentUserId() in supabaseSync.js e unlimMemory.js: simula tutti i path (Supabase auth, legacy JWT, fallback). Report."

### Ciclo 5: Auth Bridge — Supabase Auth
- Leggi src/services/supabaseAuth.js — le funzioni esistono gia
- In LoginPage.jsx: quando l'utente fa login con successo via Netlify, ANCHE fare `supabase.auth.signInWithPassword(email, password)` in parallelo
- In RegisterPage.jsx: quando l'utente si registra via Netlify, ANCHE fare `supabase.auth.signUp(email, password)`
- In App.jsx: all'avvio, se Supabase e configurato, fare `supabase.auth.getSession()` per ripristinare la sessione
- ATTENZIONE: le password devono matchare tra i due sistemi. L'utente usa la stessa email/password per entrambi.
Verifica: dopo login, `supabase.auth.getUser()` ritorna un utente valido.

### Ciclo 6: Auth Bridge — Test Supabase sync
- Dopo che l'auth bridge funziona, testa:
  1. Login → `supabase.auth.getUser()` ritorna user
  2. Apri un esperimento → `useSessionTracker` salva sessione
  3. La sessione arriva in `student_sessions` su Supabase (verifica via REST API)
  4. Il Teacher Dashboard mostra la sessione (se docente e nella stessa classe)
- Se qualcosa fallisce, fix immediato con /systematic-debugging

### Ciclo 7: Dashboard quick wins
- Rinominare "Nudge" → "Messaggi agli Studenti" in TeacherDashboard.jsx
- Rimuovere la parola "Supabase" da QUALSIASI testo visibile all'utente
- Rimuovere "UNLIM" dal subtitle login (sostituire con "Accedi al tuo laboratorio")
- Fix font 10-11px in UnlimReport.jsx → minimo 14px

### Ciclo 8: Audit finale + /systematic-debugging
Lancia 5 agenti in parallelo:
- Spec (8 aree), UX (Prof.ssa Rossi), Student (Marco 12 anni), Security, Performance
- Esegui /elab-quality-gate
- Score target: 7.0/10

## HANDOFF — GENERA IL PROMPT SESSIONE 2
Dopo l'audit finale:
1. Raccogli gli score REALI per area dai 5 agenti
2. Lista i bug P0/P1 rimasti aperti
3. Lista i cicli non completati
4. Scrivi il prompt Sessione 2 in `docs/prompts/SESSIONE-2-PROMPT.md` con:
   - "## STATO EREDITATO DALLA SESSIONE 1" (score reali, bug aperti, cicli mancanti)
   - 8 cicli adattati: se emoji purge non e completo, il ciclo 1 della S2 lo finisce
   - Se auth bridge non funziona, priorita massima nella S2
   - Il template base e la Sessione 2 di questo piano, MA modificato con i dati reali
5. Il prompt deve essere AUTOCONTENUTO — chi lo legge deve capire tutto senza leggere altro
```

---

# ===============================================================
# SESSIONE 2/5 — DASHBOARD 4→7 + DESIGN SYSTEM CLEANUP
# Target: Dashboard 4->7 | Visual 7.5->8 | A11y 5->6.5
# Score target: 7.0 -> 7.5
# ===============================================================

```
SESSIONE 2/5 — DASHBOARD REVOLUTION + DESIGN SYSTEM
Deadline PNRR: 30/06/2026. Score attuale: ~7.0/10. Target sessione: 7.5/10.

## PRIMA DI TUTTO
Leggi CLAUDE.md + PIANO-5-SESSIONI-V2.md. Build+test DEVONO passare.
Esegui algoritmo di auto-allineamento (punto 1-5 delle regole).

## CONTESTO
Sessione 1 ha fixato: emoji purge, voice bugs, JWT, auth bridge.
Rimangono: Dashboard 10 tab (4/10), VetrinaSimulatore inline styles, color constant duplicati,
TeacherDashboard 433 inline styles, font scale rotta nel design system.

## 8 CICLI STRUTTURATI

### Ciclo 1: Dashboard — Da 10 tab a 4
TeacherDashboard.jsx ha 10 tab. Consolidare in 4:
- "Classe" — merge di Progressi + Il Giardino (griglia esperimenti + visualizzazione piantine)
- "Studenti" — merge di Dettaglio Studente + Nudge (scheda individuale + pulsante "Invia messaggio")
- "Report" — merge di Meteo Classe + Report + Attivita (meteo, statistiche, timeline)
- "Impostazioni" — merge di Le mie classi + Documentazione + Progresso PNRR + Audit GDPR
Il tab "Nudge" diventa un bottone/modale accessibile da qualsiasi tab quando si seleziona uno studente.
NON eliminare funzionalita — solo riorganizzare. Tutti i componenti esistenti restano, cambiano solo i contenitori.

### Ciclo 2: Dashboard — CSS Module migration
- Eliminare la costante `C` con 14 colori hardcoded dal TeacherDashboard.jsx
- Eliminare la stessa costante `C` dal StudentDashboard.jsx
- Sostituire TUTTI i colori hardcoded con CSS variables da design-system.css
- Migrare i 433 inline style blocks piu importanti (header, tab bar, card layout) in TeacherDashboard.module.css
- Non serve migrare TUTTO — focus sui 50 piu visibili/ripetuti

### Ciclo 3: Design System — Font scale fix
- `--font-size-xs`, `--font-size-sm`, `--font-size-base`, `--font-size-md` sono TUTTI 16px. Fix:
  - `--font-size-xs: 14px` (minimo assoluto per bambini)
  - `--font-size-sm: 15px`
  - `--font-size-base: 16px`
  - `--font-size-md: 17px`
  - `--font-size-lg: 18px` (gia corretto)
- Eliminare i legacy aliases duplicati (linee 295-332): `--elab-navy`, `--bg-app`, `--text-dark`, `--border-light`
- Eliminare i simulator-scoped token duplicati (linee 339-367) — usare quelli principali

### Ciclo 4: VetrinaSimulatore — CSS Module
- Creare `VetrinaSimulatore.module.css`
- Migrare i 104 inline style blocks in CSS classes
- Sostituire i 50+ colori hardcoded con CSS variables
- Questa e la landing page — la PRIMA cosa che un compratore vede. Deve essere impeccabile.

### MID-SESSION AUDIT
3 agenti: (1) Conta inline styles rimasti nei dashboard (2) Verifica font scale coerente (3) Verifica che tutti i tab dashboard funzionino

### Ciclo 5: TeacherDashboard — Icone SVG
- I 30+ inline SVG icon components (IconSun, IconStorm, IconRain, IconSeed, etc.) vanno spostati in ElabIcons.jsx
- Usa lo stesso stile Feather (24x24 viewBox, stroke-based, 2px stroke)
- Aggiorna i riferimenti nel TeacherDashboard

### Ciclo 6: StudentDashboard — Mood icons + CSS
- Sostituire gli ASCII emoticons ('E', 'C', '~', 'X', ':)', '>:(', '?', '*') con icone SVG
- Creare StudentDashboard.module.css
- Migrare i top 30 inline styles

### Ciclo 7: A11y sweep
- Tutti i `<div onClick>` senza role/tabIndex/onKeyDown → aggiungere `role="button" tabIndex={0}`
- Focus su: Navbar.jsx (4 occorrenze), NotebooksTab.jsx (2), ComponentDrawer.jsx (2)
- UnlimReport.jsx: `.photo-remove` button → aria-label + touch target 44px
- Heading hierarchy: TeacherDashboard h3 sezioni → h2

### Ciclo 8: Audit finale
5 agenti. /elab-quality-gate. /systematic-debugging. Score target: 7.5/10.

## HANDOFF — GENERA IL PROMPT SESSIONE 3
1. Score REALI per area dai 5 agenti
2. Bug P0/P1 rimasti aperti (dashboard tab funzionano? inline styles migrati?)
3. Se Dashboard non ha raggiunto 7/10: Sessione 3 ciclo 1 riprende il dashboard
4. Scrivi in `docs/prompts/SESSIONE-3-PROMPT.md` — autocontenuto, 8 cicli adattati
5. Il template base e la Sessione 3 di questo piano MA con i dati reali della S2
```

---

# ===============================================================
# SESSIONE 3/5 — FUMETTO EPICO + FRONTEND POLISH + UX
# Target: Comic 7->9 | Visual 8->8.5 | UX 7.1->8
# Score target: 7.5 -> 8.0
# ===============================================================

```
SESSIONE 3/5 — FUMETTO EPICO + FRONTEND STEVE JOBS
Deadline PNRR: 30/06/2026. Score attuale: ~7.5/10. Target sessione: 8.0/10.

## PRIMA DI TUTTO
Leggi CLAUDE.md + PIANO-5-SESSIONI-V2.md. Build+test. Auto-allineamento.

## CONTESTO
Il report fumetto (UnlimReport.jsx) e stato riscritto in S2 con pannelli asimmetrici,
balloon SVG, 4 mood. Ma: font troppo piccoli per bambini, solo 4 mood, nessuna narrativa
coerente, balloon statici. Deve diventare un VERO fumetto che i ragazzi vogliono mostrare agli amici.

## 8 CICLI STRUTTURATI

### Ciclo 1: Fumetto — Narrativa coerente
Il fumetto attuale prende i messaggi chat e li mette in pannelli. Non c'e narrativa.
Riscrivere buildReportHTML() per creare una STORIA:
- Pannello 1: "La sfida di oggi" — titolo esperimento + obiettivo
- Pannelli centrali: dialogo docente-UNLIM con mood contestuali
- Pannello climax: il momento "eureka" (se c'e) o il momento "oops" (se errori)
- Pannello finale: "Cosa abbiamo scoperto" — concetti appresi, punteggio
- Se ci sono foto: integrarle nella narrativa (non come appendice)
Target: il fumetto racconta UNA STORIA con inizio, sviluppo e conclusione.

### Ciclo 2: Fumetto — Visual upgrade
- Font 14px → 16px per balloon text, 10-11px → 14px per labels
- Aggiungere rotazione leggera ai pannelli (transform: rotate(0.5deg/-0.5deg)) per energia visiva
- Aggiungere 4 nuovi mood: "sfida" (rosso, pugno alzato), "collaborazione" (blu, mani), "creativita" (viola, lampadina), "successo" (oro, stella)
- Balloon con animazione CSS sottile (leggero bounce al caricamento)
- Background: aggiungere texture carta pergamena sottile (CSS background-image pattern)
- Mascotte: espressioni diverse per mood (felice, pensieroso, sorpreso, preoccupato)

### Ciclo 3: Fumetto — Cover page epica
- La cover deve sembrare la copertina di un fumetto vero:
  - Titolo grande Oswald con ombra
  - Numero "lezione" come numero di edizione ("#14 — Il Pulsante!")
  - Mascotte ELAB in posa eroica (SVG dedicato)
  - Data e classe
  - Pattern halftone piu evidente
  - Colori volume (verde/arancione/rosso) come tema

### Ciclo 4: Frontend — Overlay cognitivo
- Verificare che MAX 5 elementi siano visibili contemporaneamente nel simulatore
- Se piu di 5 pannelli sono aperti: chiudere automaticamente il meno recente
- Toast notification: max 1 alla volta, queue con timeout
- Build mode switcher: collassare in un singolo dropdown invece di 3 bottoni
- "Open code editor" touch target: da 24px a 56px

### MID-SESSION AUDIT
3 agenti: (1) Genera un fumetto e valutalo visivamente (2) Conta elementi visibili simultanei nel simulatore (3) Verifica touch target <44px

### Ciclo 5: Frontend — Mascotte viva
- Rendere SVG la mascotte primaria (non PNG logo-senza-sfondo.png)
- Aggiungere 4 espressioni: neutrale, felice (occhi a mezzaluna), pensieroso (sopracciglio alzato), sorpreso (occhi grandi)
- L'espressione cambia in base allo stato: idle=neutrale, risposta positiva=felice, domanda=pensieroso, errore=sorpreso
- Ingrandire da 54x62 a 72x84 per visibilita LIM
- Aggiungere animazione di entrata (fade+scale da 0.8 a 1.0)

### Ciclo 6: Frontend — Voice command discoverability
- Aggiungere tooltip sul pulsante mic: "Prova a dire: monta il LED, pulisci tutto, avanti..."
- Il tooltip appare dopo 3 secondi di hover o al primo tap
- Aggiungere un pannello "Comandi vocali" accessibile dal menu overflow con la lista completa
- UNLIM suggerisce un comando vocale dopo 60 secondi di inattivita: "Sai che puoi dirmi 'monta il circuito'?"

### Ciclo 7: Frontend — UNLIM proattivita
- UNLIM appare dopo 30s di inattivita con un suggerimento contestuale
- UNLIM appare al primo errore nel circuito: "Il LED e al contrario! Giralo."
- UNLIM appare quando si completa un esperimento: "Bravo! Vuoi creare il report?"
- I messaggi proattivi sono overlay temporanei (5 secondi, poi sfumano)
- Massimo 1 messaggio proattivo ogni 60 secondi (anti-spam)

### Ciclo 8: Audit finale
5 agenti. /elab-quality-gate. /systematic-debugging. Score target: 8.0/10.
Fumetto: chiedi a un agente di generare un report e valutarlo come un 12enne.

## HANDOFF — GENERA IL PROMPT SESSIONE 4
1. Score REALI — il fumetto deve essere almeno 8.5/10 o la S4 lo riprende
2. UX overlay cognitivo: quanti elementi visibili? Se >5, la S4 lo fixa
3. Mascotte: le espressioni funzionano? Se no, priorita S4
4. Scrivi in `docs/prompts/SESSIONE-4-PROMPT.md` — autocontenuto, 8 cicli adattati
```

---

# ===============================================================
# SESSIONE 4/5 — UNLIM ONNIPOTENTE REALE + PERFORMANCE
# Target: UNLIM 7.5->8.5 | Performance 6->7.5 | Build 6->8
# Score target: 8.0 -> 8.3
# ===============================================================

```
SESSIONE 4/5 — UNLIM DAVVERO ONNIPOTENTE + PERFORMANCE
Deadline PNRR: 30/06/2026. Score attuale: ~8.0/10. Target sessione: 8.3/10.

## PRIMA DI TUTTO
Leggi CLAUDE.md + PIANO-5-SESSIONI-V2.md. Build+test. Auto-allineamento.

## CONTESTO
UNLIM e "onnipotente" sulla carta ma in realta:
- animatedMountExperiment e teatro UX (monta tutto e finge)
- il circuitContext non include wire topology (AI non sa cosa e collegato a cosa)
- mancano INTENT per play/pause/reset/compile/showEditor
- addComponent ignora colore/valore custom
- nessun feedback visivo quando UNLIM esegue un'azione

## 8 CICLI STRUTTURATI

### Ciclo 1: INTENT — Aggiungere play/pause/reset/compile/showEditor
- In UnlimWrapper.jsx executeIntent(): aggiungere 5 nuovi case:
  - `play` → `window.__ELAB_API.play()`
  - `pause` → `window.__ELAB_API.pause()`
  - `reset` → `window.__ELAB_API.reset()`
  - `compile` → get code from editor, then `compile(code, board)`
  - `show_editor` → `window.__ELAB_API.showEditor()`
- Aggiornare il system prompt AI per documentare i nuovi intent disponibili

### Ciclo 2: addComponent con proprieta
- `handleComponentAdd` in useCircuitHandlers.js deve accettare un oggetto `opts`:
  `addComponent(type, { color, value, position })`
- Dopo il posizionamento: se `opts.color`, chiamare setComponentValue per il colore
- Se `opts.value` (es. resistenza 220), chiamare setComponentValue per il valore
- Voice command: "aggiungi un LED verde" → parse "verde" come colore → passare a addComponent
- Voice command: "aggiungi un resistore da 220 ohm" → parse "220" come valore

### Ciclo 3: animatedMountExperiment REALE
- Riscrivere per montare DAVVERO componente per componente:
  1. `clearCircuit()`
  2. Per ogni componente nell'esperimento: `addComponent(type, position)` con 500ms delay
  3. Per ogni wire: `connectWire(from, to)` con 300ms delay
  4. Overlay contestuale per ogni componente aggiunto
  5. TTS per ogni step
- Questo richiede che addComponent accetti posizioni esatte (non auto-placement)
- Le posizioni sono nel campo `layout` di ogni esperimento

### Ciclo 4: Circuit context completo
- `getSimulatorContext()` deve includere:
  - Wire topology: lista di tutte le connessioni `[{from: "bat1:positive", to: "bb1:bus-top-plus-1"}, ...]`
  - Valori componenti: resistenza, colore LED, stato on/off
  - Risultati solver: tensione ai nodi, corrente nei rami (se simulazione attiva)
  - Posizioni componenti sulla breadboard
- Il context testuale iniettato nell'AI deve includere wire topology (non solo "3 fili")

### MID-SESSION AUDIT
3 agenti: (1) Testa OGNI intent — call reale (2) Verifica animatedMount monta davvero pezzo per pezzo (3) Verifica che il context AI includa wire topology

### Ciclo 5: Performance — Bundle splitting
- `recharts` (860KB totali in 2 chunk) → aggiungere a manualChunks in vite.config.js
- Verificare che react-pdf sia lazy-loaded E escluso da precache
- Verificare che il main index chunk non superi 1600KB
- Se >1600KB: identificare cosa c'e dentro e spostare in chunk separati

### Ciclo 6: Performance — Build time
- L'obfuscator aggiunge ~40s al build. Profilare:
  - Build senza obfuscator: quanto tempo?
  - Se <20s senza: considerare di disabilitare RC4 string encryption (la piu costosa)
  - Almeno: ridurre `stringArrayThreshold` da 1.0 a 0.75

### Ciclo 7: UNLIM feedback visivo
- Quando UNLIM esegue un'azione (monta, compila, play, etc.):
  - Il componente interessato fa un FLASH verde (border glow 500ms)
  - La mascotte cambia espressione (sorpresa → felice)
  - Toast con icona SVG dell'azione eseguita
- Quando UNLIM fallisce un'azione: flash rosso + mascotte preoccupata

### Ciclo 8: Audit finale
5 agenti. /elab-quality-gate. /systematic-debugging. Score target: 8.3/10.
Stress test: chiedi a un agente di fare 20 operazioni UNLIM consecutive e verificare che nessuna fallisca.

## HANDOFF — GENERA IL PROMPT SESSIONE 5
1. Score REALI — UNLIM deve essere almeno 8/10 o la S5 riprende
2. animatedMount funziona davvero pezzo per pezzo? Se no, priorita S5
3. Performance: bundle <5000KB precache? Build <60s? Se no, priorita S5
4. Lista TUTTI i bug trovati e non fixati — la S5 li chiude TUTTI
5. Scrivi in `docs/prompts/SESSIONE-5-PROMPT.md` — autocontenuto, 8 cicli adattati
```

---

# ===============================================================
# SESSIONE 5/5 — POLISH FINALE + STRESS TEST + PRODUCTION READY
# Target: TUTTE le aree 7.5+ | Score composito 8.5+
# Score target: 8.3 -> 8.5+
# ===============================================================

```
SESSIONE 5/5 — PRODUCTION READY: STRESS TEST + POLISH + DEPLOY
Deadline PNRR: 30/06/2026. Score attuale: ~8.3/10. Target sessione: 8.5+/10.

## PRIMA DI TUTTO
Leggi CLAUDE.md + PIANO-5-SESSIONI-V2.md. Build+test. Auto-allineamento.
Questa e l'ULTIMA sessione. Il prodotto deve essere PRONTO per le scuole.

## CONTESTO
Le sessioni 1-4 hanno portato il prodotto da 6.3 a ~8.3.
Questa sessione e dedicata a: stress test, edge case, polish, e verifica finale.

## 8 CICLI STRUTTURATI

### Ciclo 1: Stress test — 62 esperimenti
- Lancia un agente che verifica TUTTI i 62 esperimenti:
  - Caricamento: componenti presenti, wires corretti
  - Simulazione: parte senza crash
  - Welcome message: presente e coerente
  - Quiz: almeno 1 domanda con risposta corretta
- Report pass/fail per ogni esperimento

### Ciclo 2: Stress test — UNLIM sotto tortura
- 30 comandi vocali consecutivi senza pausa
- 10 INTENT malformati (JSON rotto, type sconosciuto, pin ref inesistente)
- 5 messaggi chat simultanei (race condition)
- TTS con testo >2000 caratteri
- Esperimento cambio rapido (3 esperimenti in 5 secondi)
- Report: crash? memory leak? stato inconsistente?

### Ciclo 3: Stress test — Dashboard sotto carico (usa Playwright)
USA /playwright per navigare il sito REALE nel browser:
- Naviga a /#teacher → verifica che i tab carichino
- Playwright: `browser_navigate` a ogni tab, `browser_snapshot` per verificare contenuto
- Simula 30 studenti con 10 sessioni ciascuno (300 sessioni in localStorage)
- Verifica che la paginazione funzioni con `browser_click` sui bottoni pagina
- Verifica CSV export: `browser_click` su "Esporta CSV", verifica download
- Verifica recharts: se le chart crashano con dati grandi, il `browser_console_messages` mostra errori

### Ciclo 4: Stress test — Offline + PWA (usa Playwright + Control Chrome)
- Usa Playwright: `browser_navigate` → homepage → verifica SW registrato
- Usa Playwright: `browser_evaluate` → `navigator.serviceWorker.ready.then(r => 'SW ready')`
- Verifica offline: `browser_evaluate` → `window.dispatchEvent(new Event('offline'))`
- Verifica: OfflineBanner appare → `browser_snapshot` per confermare
- Verifica: il simulatore carica un esperimento precachato
- Riabilita: `browser_evaluate` → `window.dispatchEvent(new Event('online'))`
- Verifica: la coda sync si svuota → check `browser_console_messages`

### MID-SESSION AUDIT (usa TUTTI i tool)
Esegui IN PARALLELO:
- /quality-audit — audit end-to-end automatico
- /design:accessibility-review — WCAG AA completo
- Agent 1: "Penetration test: XSS chat, injection input, secrets bundle"
- Agent 2: "Lighthouse score simulato: FCP, LCP, TBT, CLS, PWA"
- Agent 3: Usa Playwright per navigare OGNI pagina dell'app e fare screenshot:
  `browser_navigate` → `browser_take_screenshot` per: homepage, login, tutor, teacher, student
  Verifica visivamente: font leggibili? colori consistenti? touch target adeguati?

### Ciclo 5: Fix P0 da audit
Tutti i bug CRITICI trovati dal mid-session audit.

### Ciclo 6: Fix P1 da audit
Tutti i bug MAJOR.

### Ciclo 7: Polish finale
- Verifica .env.example aggiornato
- Verifica robots.txt, sitemap.xml, manifest.json
- Verifica PWA install su Chrome desktop e mobile
- Verifica che la voce TTS funzioni su Chrome, Firefox, Safari
- Aggiorna MEMORY.md con lo stato finale

### Ciclo 8: AUDIT TOTALE FINALE — 5 agenti severissimi
Stessi 5 agenti della sessione 5/5 precedente ma con istruzioni ANCORA PIU SEVERE:
- Spec: "Score inflazionato = 0 per quell'area. Verifica con PROVE."
- UX: "Prof.ssa Rossi 55 anni. Se non capisce in 3 secondi, FAIL."
- Student: "Marco 12 anni. Se si annoia in 10 secondi, FAIL."
- Security: "Se trovi UN secret nel bundle, score 0."
- Performance: "Se FCP >3s su 3G, FAIL."

Media 5 agenti = SCORE FINALE REALE.
Target: 8.5+/10.

## HANDOFF FINALE
Questa e l'ultima sessione. Non genera un prompt successivo.
Invece, produce un DOCUMENTO FINALE:
1. Score reale per area (da 5 agenti)
2. Lista COMPLETA bug aperti con severita
3. Roadmap post-lancio (cosa fare dopo la deadline PNRR)
4. Checklist pre-demo per Giovanni Fagherazzi
5. Salvare in `docs/PRODUCTION-READINESS.md`

## FINE
Deploy su Vercel. Il prodotto e PRONTO.
```

---

## RIEPILOGO PIANO

| Sessione | Focus | Score In | Score Out |
|----------|-------|----------|-----------|
| 1 | Emoji purge + Voice fix + Auth bridge | 6.3 | 7.0 |
| 2 | Dashboard 4→7 + Design system cleanup | 7.0 | 7.5 |
| 3 | Fumetto epico + Frontend polish + UX | 7.5 | 8.0 |
| 4 | UNLIM onnipotente reale + Performance | 8.0 | 8.3 |
| 5 | Stress test + Polish + Production ready | 8.3 | 8.5+ |
