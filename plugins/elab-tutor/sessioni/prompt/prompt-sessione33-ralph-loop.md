# PROMPT SESSIONE 33 — METTERE A POSTO TUTTO

**Data creazione**: 21/02/2026
**Sessione precedente**: 32 (CoV componenti + validazione esperimenti + fix crash buildMode)
**Score REALE**: ~7.0/10 → Target: 8.5/10
**Metodologia**: RALPH LOOP OBBLIGATORIO (plan → build → verify → fix → verify → deploy)
**Deploy**: Tutor → Vercel | Sito → Netlify

---

## 🎯 FILOSOFIA SESSIONE 33 — LE 3 REGOLE D'ORO

> **1. MASSIMAMENTE RESPONSIVE — Adattabile a OGNI schermo**
>
> Desktop 1440px, laptop 1280px, tablet 768px, mobile 375px. OGNI pagina, OGNI componente, OGNI modale deve funzionare perfettamente su TUTTI gli schermi. Niente testi tagliati, niente bottoni fuori schermo, niente layout caotico. Se non sta bene su mobile 375px, NON È FINITO.

> **2. TEST CHROME OBBLIGATORIO PER TUTTO — NESSUNA ECCEZIONE**
>
> Claude in Chrome deve testare OGNI singola modifica a TUTTE le risoluzioni. Screenshot obbligatorio per ogni verifica. Se non c'è screenshot, non è stato fatto. RALPH LOOP applicato a OGNI task, non solo quelli grossi.

> **3. NON CAOTICO — Pulito, ordinato, professionale**
>
> Layout consistente, spacing uniforme, gerarchia visiva chiara. Nessun overlap, nessun z-index war, nessun contenuto che copre altro contenuto. La vetrina deve essere aggiornata, moderna, e dare una prima impressione "Apple-quality".

---

## ⚠️ CRASH FIXATO NELLA SESSIONE 32 (POST-DEPLOY)

**BUG**: `ReferenceError: buildMode is not defined` in ExperimentPicker.jsx
**CAUSA**: Il selettore buildMode era stato rimosso da ExperimentPicker (Session 32), ma i riferimenti a `buildMode` nelle card esperimento (righe 232-237) sono rimasti orfani → crash a runtime quando si espandeva un capitolo.
**FIX**: Rimossi i condizionali `buildMode === 'guided'` e `buildMode === 'sandbox'` dalle card, sostituiti con un semplice badge "Passo-Passo" per gli esperimenti con buildSteps.
**DEPLOY**: Fixato e deployato. Verificato funzionante con Chrome (screenshot: esperimento Cap.6 Esp.1 carica correttamente).

---

## ⚡ SPRINT 0 — VALIDAZIONE SESSIONE 32 (OBBLIGATORIO, CON CHROME + SCREENSHOT)

**NON TOCCARE NESSUN CODICE finché Sprint 0 non è completato al 100%.**

La Sessione 32 ha fatto modifiche critiche ai componenti SVG e alla validazione esperimenti. DEVI verificare VISIVAMENTE che tutto sia deployato e funzionante prima di iniziare qualsiasi lavoro nuovo.

### 0A: Verifica codice sorgente (Bash)
Esegui TUTTI questi comandi e conferma i risultati attesi:

```bash
# 1. volumeAvailableFrom corretto
cd "VOLUME 3/PRODOTTO/elab-builder"
grep "volumeAvailableFrom" src/components/simulator/components/Capacitor.jsx    # → deve dire 2
grep "volumeAvailableFrom" src/components/simulator/components/Diode.jsx        # → deve dire 2
grep "volumeAvailableFrom" src/components/simulator/components/Multimeter.jsx   # → deve dire 2
grep "volumeAvailableFrom" src/components/simulator/components/BreadboardFull.jsx # → deve dire 1
grep "volumeAvailableFrom" src/components/simulator/components/ReedSwitch.jsx   # → deve dire 1
grep "volumeAvailableFrom" src/components/simulator/components/MosfetN.jsx      # → deve dire 2
grep "volumeAvailableFrom" src/components/simulator/components/Phototransistor.jsx # → deve dire 2

# 2. Lead colors silver (NON gold)
grep "#B0B0B0" src/components/simulator/components/MosfetN.jsx        # → deve matchare (silver lead)
grep "#B0B0B0" src/components/simulator/components/Phototransistor.jsx # → deve matchare
grep "#B0B0B0" src/components/simulator/components/ReedSwitch.jsx      # → deve matchare

# 3. Quiz presenti in tutti i volumi
grep -c "quiz:" src/data/experiments-vol1.js   # → 38
grep -c "quiz:" src/data/experiments-vol2.js   # → 18
grep -c "quiz:" src/data/experiments-vol3.js   # → 13

# 4. Build
npm run build   # → 0 errori
```

Se QUALCOSA non corrisponde: STOP. Riapplica le fix della Sessione 32 (vedi sezione "RISOLTO nella Sessione 32" sotto) e ri-deploya prima di continuare.

### 0B: Verifica visiva con Claude in Chrome (SCREENSHOT OBBLIGATORI)

Apri https://elab-builder.vercel.app con Claude in Chrome e fai TUTTI questi test con screenshot:

**Test 1 — Login admin**
1. Vai a /login
2. Login con `debug@test.com` / `Xk9#mL2!nR4`
3. 📸 Screenshot della pagina post-login
4. Verifica: vedi Tutor + Area Docente + Admin nella sidebar/navbar

**Test 2 — Volume Gating (studente)**
1. Logout → Login con `student@elab.test` / `Ry5!kN7#dM2$wL9`
2. Naviga all'Experiment Picker
3. 📸 Screenshot: quali volumi sono visibili?
4. Attiva licenza Vol1 con codice `ELAB-VOL1-2026` (se non già attiva)
5. 📸 Screenshot: solo Vol1 visibile, Vol2 e Vol3 INVISIBILI (non lucchetto)

**Test 3 — Simulatore carica un esperimento**
1. Clicca su un esperimento Vol1 qualsiasi (es. Cap 6 Esp 1 - LED)
2. 📸 Screenshot del simulatore con circuito caricato
3. Verifica: breadboard visibile, componenti piazzati, fili colorati
4. Se il circuito è funzionante (LED acceso, multimetro legge) → 📸 screenshot

**Test 4 — Componenti SVG corretti**
1. Nel simulatore, apri la Component Palette (pannello laterale)
2. 📸 Screenshot della palette: deve mostrare SOLO componenti Vol1
3. Trascina un Resistore sulla breadboard
4. 📸 Screenshot ravvicinato: i lead devono essere SILVER/grigi, NON gold/dorati
5. Trascina un LED → 📸 screenshot (lead silver)

**Test 5 — Quiz funzionante**
1. Completa o osserva un esperimento
2. Cerca il quiz (2 domande con 3 opzioni ciascuna)
3. 📸 Screenshot del quiz visibile
4. Rispondi a una domanda → 📸 screenshot del feedback (spiegazione)

**Test 6 — Responsive check rapido**
1. Ridimensiona browser a 375px (mobile)
2. 📸 Screenshot della home/vetrina su mobile
3. Ridimensiona a 768px (tablet)
4. 📸 Screenshot
5. Torna a 1440px (desktop)
6. 📸 Screenshot

**Test 7 — Teacher Dashboard (stato attuale — documentare i bug)**
1. Logout → Login con `teacher@elab.test` / `Pw8&jF3@hT6!cZ1`
2. Naviga al Teacher Dashboard
3. 📸 Screenshot: cosa vede il teacher? (probabilmente vuoto → questo è il bug P0 da fixare)
4. Prova "Le mie classi" → 📸 screenshot dell'errore 500 (se ancora presente)

**Test 8 — AI Chat Galileo**
1. Apri la chat Galileo da qualsiasi esperimento
2. Scrivi "Ciao, come funziona un LED?"
3. 📸 Screenshot della risposta di Galileo
4. 📸 Screenshot su mobile 375px (verificare se copre tutto lo schermo)

### 0C: Report Sprint 0
Dopo TUTTI i test, scrivi un mini-report:
- Quanti test passati / falliti
- Screenshot numerati con didascalia
- Lista bug trovati (nuovi o confermati dal report onesto)
- Conferma: "Sprint 0 COMPLETATO — Sessione 32 verificata, procedo con Sprint 1"

**SOLO DOPO questo report puoi iniziare Sprint 1 (task P0).**

---

## AGGIORNAMENTO POST-SESSIONE 32

La sessione 32 ha completato il Chain of Verification (CoV) di TUTTI i 21 componenti SVG e ha validato strutturalmente tutti i 69 esperimenti. Ecco cosa è stato RISOLTO e cosa resta DA FARE:

### ✅ RISOLTO nella Sessione 32
- **volumeAvailableFrom**: Tutti i 21 componenti verificati contro i PDF fisici dei 3 volumi
  - Capacitor: 1→**2** (corretto: è nel kit Vol2, NON Vol1)
  - Diode: 1→**2** (corretto: è nel kit Vol2)
  - Multimeter: 1→**2** (corretto: è nel kit Vol2)
  - BreadboardFull: 2→**1** (corretto: tutti e 3 i kit includono "Breadboard 830 punti")
  - MosfetN, Phototransistor, ReedSwitch: lead colors standardizzati a silver
- **Vol2 quiz**: era segnato come 0/18 → **VERIFICATO 18/18** (già presenti nel codice)
- **69/69 esperimenti validati**: tutti hanno components, connections, layout, buildSteps, quiz, galileoPrompt
- **Lead colors**: standardizzati a silver per tutti i componenti assiali

### ⚠️ NOTA IMPORTANTE sul Report Onesto
Il report onesto (21/02/2026) diceva "capacitore è in Vol1 nel libro, Vol2 nel codice". Questa affermazione era SBAGLIATA. I PDF reali mostrano chiaramente:
- Vol1 kit: LED, Resistor, Battery, Breadboard 830, PushButton, Trimmer (pot), PhotoResistor, Buzzer, Reed Switch, RGB LED
- Vol2 kit: AGGIUNGE Capacitor, Diode, Transistor (MosfetN), Phototransistor, MotorDC, Multimeter
- Vol3 kit: AGGIUNGE Arduino Nano R4, Servo, LCD16x2

Il codice ORA è CORRETTO. Il PRD/report onesto avevano mappature sbagliate.

---

## COSA RESTA DA FARE — IN ORDINE DI PRIORITÀ

### P0 — CRITICO (senza questi il prodotto non funziona per l'utente)

#### 1. TEACHER-STUDENT DATA: localStorage → Server-Side
**Il problema**: `studentService.js` salva TUTTO in localStorage. Il teacher non vede NULLA degli studenti perché i dati sono intrappolati nel browser dello studente.

**Cosa fare**:
1. Creare Netlify Function `student-data-sync.js`:
   - POST: studente salva progresso (esperimenti fatti, tempo, quiz scores)
   - GET: teacher legge progresso classe
   - Auth: token HMAC per autenticare le richieste
2. Migrare `studentService.js` da localStorage a API calls
3. Debounce: sync ogni 30 secondi (non ogni azione)
4. `TeacherDashboard.jsx`: leggere dati da API, non da localStorage
5. Verificare E2E: login come studente → fare esperimento → login come teacher → vedo i dati

**File coinvolti**:
- `src/services/studentService.js` — DA RISCRIVERE (localStorage → fetch API)
- `src/components/teacher/TeacherDashboard.jsx` — DA MODIFICARE (data source)
- `netlify/functions/student-data-sync.js` — DA CREARE (backend Notion)
- NB: `student-data-sync.js` potrebbe già esistere come bozza — verificare prima

#### 2. `auth-list-classes` HTTP 500
**Il problema**: La Netlify Function per listare le classi restituisce 500. Notion DB "CLASSES" non accessibile.

**Cosa fare**:
1. Verificare se il database Notion per le classi esiste nel workspace
2. Se non esiste: crearlo con schema (className, teacherId, students[], volumesEnabled[])
3. Configurare `NOTION_CLASSES_DB` env var su Netlify
4. Testare: teacher login → "Le mie classi" → lista vuota (non errore 500)

**File coinvolti**:
- `netlify/functions/auth-list-classes.js`
- Variabili ambiente Netlify

#### 3. VOLUME BYPASS VIA PROPS
**Il problema**: Se qualcuno naviga direttamente a un esperimento passando props, salta il check di ExperimentPicker.

**Cosa fare**:
1. In `NewElabSimulator.jsx`: quando carica un esperimento, verificare `userKits` vs `experimentVolume`
2. Se non ha accesso → redirect a ExperimentPicker
3. Test: provare URL diretto a esperimento Vol3 con account studente che ha solo Vol1

---

### P1 — IMPORTANTE (il prodotto funziona ma manca qualcosa di significativo)

#### 4. LE 3 MODALITÀ ESPERIMENTO
**Il problema**: Score 2.0/10. Il codice legge `buildMode` ma 0/69 esperimenti lo usano come esperienza distinta. Tutti caricano come "pre-montato".

**Cosa fare**:

A) **UI Selezione Modalità** — Quando studente clicca un esperimento, mostrare 3 opzioni:
   - 🔍 **Già Montato** (`complete`): circuito pre-assemblato, osserva e analizza
   - 🔧 **Passo Passo** (`guided`): step-by-step, ogni "Avanti" piazza un pezzo nella posizione FINALE
   - 🎨 **Libero** (`sandbox`): canvas vuoto, palette con componenti del volume, libertà totale

B) **Modalità "Già Montato"**: Caricare tutti i componenti + fili automaticamente. Lo studente osserva il circuito funzionante. Può misurare con multimetro, modificare valori.

C) **Modalità "Passo Passo"**: Usa i `buildSteps` già presenti in TUTTI i 69 esperimenti. Ogni step:
   - Mostra testo guida (già presente in `buildSteps[n].text`)
   - Evidenzia posizione target (già presente in `buildSteps[n].targetPins`)
   - Studente trascina componente → snap alla posizione → feedback verde/rosso
   - "Avanti" per passare allo step successivo
   - Alla fine: circuito completo, quiz si sblocca

D) **Modalità "Libero"**: Canvas vuoto. Palette mostra SOLO componenti del volume (GIÀ IMPLEMENTATO in Session 31). Nessuna guida, nessun step. Lo studente costruisce come vuole.

E) **Selettore UNICO**: Solo la barra grande in `NewElabSimulator.jsx` (riga ~2397). Quello in ExperimentPicker è stato RIMOSSO.

**File coinvolti**:
- `src/components/simulator/NewElabSimulator.jsx` — logica buildMode + selettore UI
- `src/data/experiments-vol1.js` / vol2 / vol3 — i buildSteps ESISTONO GIÀ in tutti i 69

#### 5. AI GALILEO — CONTESTO ESPERIMENTO
**Il problema**: Galileo non sa quale esperimento lo studente sta guardando. Risponde genericamente.

**Cosa fare**:
1. Quando lo studente invia messaggio a Galileo, includere nel payload:
   ```json
   {
     "message": "come collego il LED?",
     "context": {
       "experimentId": "v1-cap6-esp1",
       "experimentTitle": "Accendi il tuo primo LED",
       "volume": 1,
       "buildMode": "guided",
       "currentStep": 3,
       "componentsPlaced": ["resistor", "led"]
     }
   }
   ```
2. Il `galileoPrompt` è GIÀ presente in tutti i 69 esperimenti — usarlo come system prompt

**File coinvolti**:
- `src/components/tutor/ChatOverlay.jsx` — aggiungere context all'invio
- `src/services/api.js` — payload arricchito

#### 6. CHAT OVERLAY MOBILE
**Il problema**: Su 375px il chat overlay copre quasi tutto lo schermo.

**Cosa fare**:
1. Max altezza chat su mobile: 60% viewport (non 100%)
2. Bottone chiudi ben visibile (44px touch target)
3. Disclaimer footer: almeno 12px (ora è 10px)
4. Testare con Claude in Chrome su 375px

**File coinvolti**:
- `src/components/tutor/ChatOverlay.jsx`

---

### P2 — MEDIO (funziona ma ha difetti)

#### 7. WHITEBOARD V3 — TEST NEL BROWSER
**Il problema**: Codice scritto nella Session 30 ma MAI aperto nel browser.

**Cosa fare**:
1. Aprire whiteboard nel tutor con Chrome
2. Testare: disegnare, selezionare, spostare, ridimensionare, cancellare
3. Se crasha: fixare
4. Se funziona: screenshot come prova
5. Testare touch (tablet/LIM)

#### 8. RESPONSIVE AUDIT COMPLETO + FIX OBBLIGATORI
**Il problema**: Nessun test responsive recente. Frontend/UX score 7.0/10. L'app DEVE essere adattabile a OGNI schermo senza layout caotico.

**REQUISITI RESPONSIVE (INVIOLABILI)**:
- Nessun testo tagliato/troncato a NESSUNA risoluzione
- Nessun bottone fuori viewport o sovrapposto
- Nessun scroll orizzontale indesiderato
- Font >= 14px ovunque
- Touch targets >= 44px su mobile
- Spacing consistente (niente 2px su mobile e 40px su desktop)
- Sidebar: collassabile su mobile (hamburger menu)
- Modali/overlay: max 80% viewport su mobile, scrollabili se contenuto eccede
- Cards: stack verticale su mobile, grid su desktop
- Toolbar simulatore: adattata per touch (bottoni più grandi, spaziatura adeguata)

**Cosa fare — RALPH LOOP PER OGNI PAGINA**:
Per OGNI pagina critica, con Claude in Chrome:
1. Resize a **1440px** → 📸 screenshot → annotare problemi
2. Resize a **768px** → 📸 screenshot → annotare problemi
3. Resize a **375px** → 📸 screenshot → annotare problemi
4. Se trovi problemi: FIX immediato → rebuild → ri-verifica con screenshot
5. Non passare alla pagina successiva finché la corrente non è perfetta a TUTTE le risoluzioni

**Pagine da testare (ORDINE OBBLIGATORIO)**:
1. **Tutor Login** — form centrato, leggibile su mobile
2. **VetrinaSimulatore** — gallery, CTA, hero responsive
3. **ExperimentPicker** — volume cards, capitoli, lista esperimenti
4. **Simulatore** — breadboard, toolbar, sidebar, build mode bar
5. **ChatOverlay** — max 60% mobile, bottone chiudi visibile
6. **TeacherDashboard** — tabelle responsive, cards progresso
7. **Whiteboard V3** — canvas touch-friendly su tablet
8. **Admin Panel** — sidebar collapsible, cards KPI
9. **Sito index** — hero, gallery, stats, CTA
10. **Sito chi-siamo** — testo leggibile, immagini scalate
11. **Sito kit** — cards prodotto, prezzi, bottoni

**PER OGNI FIX RESPONSIVE**:
- Screenshot PRIMA (il problema)
- Codice CSS/JSX modificato
- Screenshot DOPO (il fix)
- Verifica che il fix non rompa le altre risoluzioni

#### 9. VETRINA SIMULATORE — REDESIGN + AGGIORNAMENTO
**Il problema**: La Vetrina è il primo impatto visivo per studenti e docenti. Deve essere moderna, professionale, Apple-quality. Le 4 immagini breadboard aggiunte in Session 31 non sono state verificate nel browser.

**Cosa fare — REDESIGN COMPLETO**:
1. **Aprire VetrinaSimulatore con Chrome** → 📸 screenshot stato attuale
2. **Verificare le 4 immagini** si carichino correttamente
3. **Usare la skill `frontend-design`** per migliorare il design:
   - Hero con gradient e animazione sottile
   - Gallery con hover effect e transizioni fluide
   - Cards feature con icone e descrizioni chiare
   - Statistiche animate (69 esperimenti, 21 componenti, 3 volumi)
   - CTA chiaro: "Inizia ora" con effetto hover
   - Responsive: griglia 3 colonne desktop → 2 tablet → 1 mobile
4. **Verificare responsive** a tutte e 3 le risoluzioni (1440/768/375)
5. 📸 Screenshot PRIMA e DOPO il redesign

**Stile visivo richiesto**:
- Palette ELAB: Navy #1E4D8C, Lime #7CB342, sfumature chiare
- Font: Oswald per titoli, Open Sans per body
- Bordi arrotondati (12-16px), ombre sottili
- Animazioni micro: fade-in on scroll, scale on hover (niente effetti pesanti)
- Immagini con aspect ratio fisso e lazy loading

#### 10. TEST E2E VOLUME GATING
**Il problema**: Volume gating implementato ma mai testato con account studente reale.

**Cosa fare**:
1. Login con `student@elab.test` (password: `Ry5!kN7#dM2$wL9`)
2. Attivare licenza Vol1 (`ELAB-VOL1-2026`)
3. Verificare: vedo SOLO Vol1 nell'experiment picker
4. Verificare: la palette componenti mostra SOLO componenti Vol1
5. Verificare: Vol2 e Vol3 sono INVISIBILI (non bloccati con lucchetto)
6. Screenshot come prova

---

### P3 — MINORI (polish, non bloccanti)

#### 11. MobileBottomTabs — Filtrare giochi teacher-gated
#### 12. ChatOverlay disclaimer footer 10px → 12px
#### 13. Editor Arduino panel z-index bleed-through
#### 14. Email E2E — Verificare che una email arrivi davvero
#### 15. DashboardGestionale 410KB chunk — Valutare lazy loading recharts

---

## ISTRUZIONI PER RALPH LOOP

### Fase 1: PLAN
```
Per ogni task:
1. Leggere il file coinvolto
2. Capire lo stato attuale
3. Pianificare le modifiche (lista file + righe + cosa cambia)
4. Verificare dipendenze (altri file che importano/usano il codice)
```

### Fase 2: BUILD
```
1. Implementare le modifiche
2. npm run build → 0 errori
3. Se errori: fixare subito
```

### Fase 3: VERIFY (OBBLIGATORIO — Con Claude in Chrome)
```
1. Aprire il tutor nel browser (localhost o deploy)
2. Navigare alla feature modificata
3. Screenshot PRIMA e DOPO
4. Testare tutti i flussi utente (studente, teacher, admin)
5. Testare su 3 risoluzioni (1440px, 768px, 375px) dove rilevante
```

### Fase 4: FIX
```
Se il verify trova problemi:
1. Documentare il problema con screenshot
2. Fixare
3. Tornare a VERIFY
```

### Fase 5: DEPLOY + REPORT
```
1. npm run build → 0 errori
2. Deploy Vercel: cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes
3. Deploy Netlify (solo se sito modificato)
4. Screenshot post-deploy
5. Report con score onesti e delta vs precedente
6. Update MEMORY.md
```

---

## ORDINE DI ESECUZIONE RACCOMANDATO

| Passo | Task | Tipo | Stima |
|-------|------|------|-------|
| 1 | P0 #2: Fix `auth-list-classes` 500 | Backend | 20 min |
| 2 | P0 #1: Teacher-Student data → server-side | Backend + Frontend | 90 min |
| 3 | P0 #3: Volume bypass guard | Frontend | 15 min |
| 4 | P1 #4: 3 modalità esperimento | Frontend (grosso) | 120 min |
| 5 | P1 #5: AI context | Frontend | 20 min |
| 6 | P1 #6: Chat overlay mobile | CSS | 15 min |
| 7 | P2 #7: Whiteboard test | Test | 15 min |
| 8 | P2 #8: Responsive audit | Test | 30 min |
| 9 | P2 #9: Vetrina verifica | Test | 10 min |
| 10 | P2 #10: Volume gating E2E | Test | 15 min |
| 11 | Deploy + Report | DevOps | 20 min |
| | **TOTALE** | | **~6 ore** |

---

## REGOLE INVIOLABILI

1. **RALPH LOOP PER OGNI TASK**: plan → build → verify (Chrome) → fix → verify → deploy. Nessuna eccezione, nemmeno per CSS one-liner.
2. **NO SCORE INFLAZIONATI**: Se non l'hai testato nel browser, NON dire che funziona
3. **SCREENSHOT O NON È MAI SUCCESSO**: Ogni fix deve avere screenshot di verifica
4. **RESPONSIVE = OBBLIGATORIO**: OGNI pagina DEVE funzionare a 1440px, 768px, 375px. Se non sta bene su 375px, NON È FINITO.
5. **NON CAOTICO**: Layout pulito, ordinato, professionale. Niente overlap, z-index war, contenuto che copre altro contenuto.
6. **CLAUDE IN CHROME PER TUTTO**: Ogni modifica va testata con Claude in Chrome. Ogni test va documentato con screenshot. NESSUNA eccezione.
7. **PDF = VERITÀ**: La mappatura componenti-volume è CORRETTA post-Session 32 (verificata contro i PDF reali dei 3 volumi)
8. **SERVER-SIDE FIRST**: I dati studente DEVONO essere su server, non in localStorage
9. **MOBILE FIRST**: Testare SEMPRE su 375px oltre che desktop
10. **BUILD = 0 ERRORI**: Ogni modifica → build → 0 errori prima di continuare
11. **ZERO console.log IN PRODUZIONE**: Usare `logger.js` con guard `isDev`
12. **FONT**: Oswald + Open Sans + Fira Code (tutor). fontSize >= 14px
13. **TOUCH TARGETS**: >= 44px su tutti i bottoni/link interattivi
14. **VETRINA AGGIORNATA**: La vetrina deve dare impressione Apple-quality. Usare skill `frontend-design`.
15. **NanoBreakout**: Semicerchio LEFT, ala RIGHT, SULLA breadboard. SEMPRE.
16. **GRIGLIA**: 7.5px pitch per breadboard
17. **WATERMARK**: `Andrea Marro — DD/MM/YYYY`
18. **PALETTE**: Navy #1E4D8C / Lime #7CB342 / Vol1 #7CB342 / Vol2 #E8941C / Vol3 #E54B3D

---

## DATI CORRETTI POST-SESSION 32

### volumeAvailableFrom VERIFICATO (FONTE: PDF kit reali)

| Componente | Volume | Verificato con |
|-----------|--------|----------------|
| Led | **1** | Vol1 kit p.4: "LED vari colori" |
| Resistor | **1** | Vol1 kit p.4: "Resistori 4 Bande" |
| Battery9V | **1** | Vol1 kit p.4: "Clip Batteria" |
| BreadboardHalf | **1** | Simulator convenience |
| BreadboardFull | **1** | Tutti e 3 i kit: "Breadboard 830 punti" |
| PushButton | **1** | Vol1 kit p.4: "5x Pulsanti" |
| Potentiometer | **1** | Vol1 kit p.4: "3x Trimmer 10kΩ" |
| PhotoResistor | **1** | Vol1 kit p.4: "3x Fotoresistore 10kΩ" |
| BuzzerPiezo | **1** | Vol1 kit p.4: "1x Cicalino" |
| ReedSwitch | **1** | Vol1 kit p.4: "1x Interruttore Magnetico" |
| RgbLed | **1** | Vol1 kit p.4: "RGB catodo comune" |
| Wire | **1** | Tutti i kit: "Cavi" |
| Capacitor | **2** | Vol2 kit p.4: "4x Condensatori 1000µF" |
| Diode | **2** | Vol2 kit p.4: "4x Diodi" |
| MosfetN | **2** | Vol2 kit p.4: "4x Transistor" |
| Phototransistor | **2** | Vol2 kit p.4: "4x Fotosensori" |
| MotorDC | **2** | Vol2 kit p.4: "2x Motori" |
| Multimeter | **2** | Vol2 kit p.4: "1x Multimetro" |
| NanoR4Board | **3** | Vol3 Cap.4: "Arduino Nano R4" |
| Servo | **3** | Vol3 esperimenti Cap.8+ |
| LCD16x2 | **3** | Vol3 esperimenti Cap.8+ |

### Quiz Status (VERIFICATO)
- Vol1: **38/38** con quiz ✅
- Vol2: **18/18** con quiz ✅ (NON 0/18 come diceva il report onesto)
- Vol3: **13/13** con quiz ✅
- **Totale: 69/69** con quiz (138 domande totali)

### Esperimenti Status
- **69/69** caricano senza crash ✅
- **69/69** hanno buildSteps ✅
- **69/69** hanno quiz ✅
- **69/69** hanno galileoPrompt ✅
- **69/69** hanno layout, connections, pinAssignments ✅
- **58** modalità circuit + **11** modalità avr + **1** observation-only

---

## ACCOUNT DI TEST

| Ruolo | Email | Password | RBAC |
|-------|-------|----------|------|
| Admin | `debug@test.com` | `Xk9#mL2!nR4` | Tutor + Area Docente + Admin |
| Teacher | `teacher@elab.test` | `Pw8&jF3@hT6!cZ1` | Tutor + Area Docente |
| Student | `student@elab.test` | `Ry5!kN7#dM2$wL9` | Solo Tutor |
| Admin | `marro.andrea96@gmail.com` | `Bz4@qW8!fJ3#xV6` | Tutor + Area Docente + Admin |

**Codici licenza test**: ELAB-VOL1-2026, ELAB-VOL2-2026, ELAB-VOL3-2026, ELAB-BUNDLE-ALL

---

## DEPLOY

```bash
# Tutor (Vercel)
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes

# Sito (Netlify) — solo se modificato
cd "VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13
```

---

## OUTPUT ATTESI FINE SESSIONE

### Funzionalità core
1. **Teacher-Student funzionante**: docente vede dati studenti nel browser (📸 screenshot)
2. **auth-list-classes non 500**: classi accessibili (📸 screenshot)
3. **3 modalità funzionanti**: Già Montato / Passo Passo / Libero per almeno 10 esperimenti (📸 screenshot)
4. **Volume bypass bloccato**: guard in NewElabSimulator (📸 screenshot test)
5. **AI con contesto**: Galileo sa quale esperimento stai guardando (📸 screenshot)

### UX / Responsive (TUTTO CON SCREENSHOT)
6. **Chat mobile < 60%**: overlay ridimensionato (📸 screenshot 375px)
7. **Whiteboard V3 testata**: funziona o fixata (📸 screenshot)
8. **Vetrina REDESIGN**: moderna, Apple-quality, responsive (📸 screenshot 1440/768/375)
9. **RESPONSIVE AUDIT COMPLETO**: OGNI pagina critica testata a 1440px, 768px, 375px
   - Nessun layout caotico, nessun overlap, nessun testo tagliato
   - 📸 Screenshot PER OGNI PAGINA PER OGNI RISOLUZIONE (almeno 30 screenshot totali)
10. **Frontend professionale**: spacing consistente, gerarchia visiva chiara, zero caos

### Infrastruttura
11. **Build 0 errori + deploy Vercel**
12. **Report onesto con score aggiornati e delta**
13. **MEMORY.md aggiornato con stato reale post-session**
14. **Continuation string per sessione successiva**

---

## SCORE CARD PRE-SESSION

| Area | Score Attuale | Target | Note |
|------|--------------|--------|------|
| Auth + Security | 9.0 | 9.5 | Fix classes, volume guard |
| Sito Pubblico | 8.5 | 8.5 | Invariato (no modifiche previste) |
| Simulatore (rendering) | 9.0 | 9.0 | Componenti verificati CoV |
| Simulatore (physics) | 7.0 | 7.0 | No modifiche previste |
| Volume Gating | 8.0 | 9.0 | Test E2E + bypass guard |
| Quiz | 9.0 | 9.0 | 69/69 ✅ (corretto da report onesto) |
| Games | 8.0 | 8.0 | No modifiche previste |
| Teacher Dashboard | 5.0 | **7.5** | Server-side data + fix classes |
| AI Integration | 7.5 | **8.5** | Context awareness |
| Whiteboard V3 | 6.0 | **7.0** | Test + fix se necessario |
| Code Quality | 9.0 | 9.0 | Mantenere |
| Frontend/UX | 7.0 | **8.0** | Responsive audit + mobile chat |
| 3 Experiment Modes | 2.0 | **6.0** | Implementare UI + logica |
| Teacher-Student | 2.0 | **7.0** | Server-side sync |
| **OVERALL** | **~7.0** | **~8.0** | |

---

*Andrea Marro — 21/02/2026*
*Generato con analisi completa di: MEMORY.md, REPORT-ONESTO, prompt-sessione32.md (entrambi), INDICE.md, report-sessione31-finale.md, e tutto il lavoro della sessione 32 (CoV componenti + validazione esperimenti)*
