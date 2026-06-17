# PROMPT OPERATIVO — Sessione 30+
## Per uso con Ralph Loop, Team di Agenti, Modalita Agile

---

## ISTRUZIONI PER L'AGENTE

Sei un team lead che coordina lo sviluppo di ELAB Tutor "Galileo". Lavori in modalita agile con sprint corti, verifiche continue, e ZERO tolleranza per regressioni.

### REGOLE INVIOLABILI

1. **ZERO REGRESSIONI**: Prima di modificare QUALSIASI file, fai uno screenshot. Dopo la modifica, fai un altro screenshot. Confronta. Se qualcosa e cambiato che non doveva cambiare, RIPRISTINA.

2. **BUILD PRIMA DI TUTTO**: Dopo ogni batch di modifiche, `npm run build`. Se fallisce, FIX immediato. Non procedere MAI con build rotta.

3. **PRD E LA BIBBIA**: Ogni decisione deve essere coerente con `/docs/PRD-ELAB-TUTOR-v1.md`. Se hai dubbi, leggi il PRD. Se il PRD non copre il caso, chiedi.

4. **ONESTA NEI REPORT**: Se qualcosa non funziona, SCRIVI che non funziona. Mai dire "completato" se non e verificato visivamente E funzionalmente.

5. **ESTETICA = VOLUMI**: I colori, i font, lo stile grafico devono essere IDENTICI ai volumi fisici. Navy #1E4D8C, Verde #7CB342, Arancione #E8941C, Rosso #E54B3D. Font: Oswald (titoli), Open Sans (corpo), Fira Code (codice).

---

## CONTESTO PROGETTO

### Path critici
```
ELAB Tutor:     /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/
Sito Pubblico:  /Users/andreamarro/VOLUME 3/PRODOTTO/newcartella/
PRD:            /docs/PRD-ELAB-TUTOR-v1.md
Report:         /sessioni/report/
Prompt:         /sessioni/prompt/
Memory:         ~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md
```

### Deploy
```bash
# Vercel (ELAB Tutor)
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes

# Netlify (Sito Pubblico + Backend)
cd "VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13
```

### Account test
| Ruolo | Email | Password |
|-------|-------|----------|
| Admin | debug@test.com | Xk9#mL2!nR4 |
| Teacher | teacher@elab.test | Pw8&jF3@hT6!cZ1 |
| Student | student@elab.test | Ry5!kN7#dM2$wL9 |

### Stato attuale ONESTO (20/02/2026)
- 69 esperimenti (38+18+13), 69/69 load OK
- 22 componenti SVG (21 circuitali + 1 Annotation), 15 allineati 7.5px, 6 compensati
- 53 sfide (20 Detective + 18 POE + 15 Reverse)
- 51/51 quiz (102 domande)
- Auth: bcrypt + HMAC-SHA256 + RBAC
- Licenze: 8 codici HARDCODED, NO esclusivita, NO scadenza
- AI: keyword matching locale (35 Q&A). n8n OFFLINE
- Whiteboard V2: funzionale ma NO selezione/spostamento elementi
- Score reale: ~9.2/10 (non 9.5 come scritto nella memory)

---

## SPRINT BACKLOG

### SPRINT 1: LICENZE + CLASSI (Priorita MASSIMA)

**Obiettivo**: Implementare sistema licenze esclusivo con gestione classi.

#### Task 1.1: Creare Notion DB "Licenze"
- Usa l'API Notion per creare un database con i campi definiti nel PRD sezione 4.1.7
- Verifica che il database sia accessibile da Netlify Functions
- **Verifica**: Query il database e conferma che risponde

#### Task 1.2: Creare Notion DB "Classi"
- Campi come da PRD sezione 4.2.1
- Relazione con Users DB
- **Verifica**: Query il database e conferma che risponde

#### Task 1.3: Modificare auth-activate-license.js
- Rimuovere import di valid-codes.js
- Query Notion DB Licenze: `filter: { Codice: code, Stato: "disponibile" }`
- Se trovato: update Stato -> "attivato", set Attivato Da, Data Attivazione, Data Scadenza (+365 giorni)
- Se non trovato: errore 400 "Codice non valido o gia utilizzato"
- **Verifica**: Test con codice valido e codice gia usato

#### Task 1.4: Implementare controllo scadenza in auth-me.js
- Dopo fetch utente da Notion, controlla License Expiry
- Se `new Date(expiry) < new Date()`: rimuovi kits, ritorna `kits: []`
- Aggiungi campo `licenseExpired: true` nella risposta
- **Verifica**: Simula data scaduta e verifica che kits viene svuotato

#### Task 1.5: Eliminare activate-kit.js
- Rimuovere il file
- Aggiornare eventuali riferimenti nel frontend
- **Verifica**: `grep -r "activate-kit" src/` deve ritornare 0

#### Task 1.6: Deprecare valid-codes.js
- NON eliminare subito (backward compat per 1 sprint)
- Aggiungere commento "DEPRECATED - verra eliminato in Sprint 2"
- **Verifica**: auth-activate-license.js non lo importa piu

#### Task 1.7: Creare auth-join-class.js
```
POST /api/auth-join-class
Body: { classCode: "LUNA42" }
Auth: Bearer token (studente)

1. Cerca in Classi DB: Codice Classe = classCode AND Attiva = true
2. Se non trovata: 404 "Classe non trovata"
3. Se studenti.length >= 30: 400 "Classe piena"
4. Aggiungi studente alla relazione Studenti
5. Copia volumi del docente nello studente (Kit Attivati)
6. Return { success, className, volumes }
```
- **Verifica**: Test join con codice valido, classe piena, codice invalido

#### Task 1.8: Creare auth-create-class.js
```
POST /api/auth-create-class
Body: { name: "3A Elettronica" }
Auth: Bearer token (docente only)

1. Verifica ruolo docente
2. Genera codice classe 6 caratteri (A-Z0-9, no ambigui)
3. Verifica unicita codice in Classi DB
4. Crea record con Docente = user, Volumi = user.kits, Attiva = true
5. Return { success, classCode, className }
```
- **Verifica**: Test creazione, verifica unicita codice

#### Task 1.9: Creare auth-list-classes.js
```
GET /api/auth-list-classes
Auth: Bearer token (docente)

1. Query Classi DB: Docente = userId
2. Per ogni classe: conta studenti, lista nomi
3. Return { classes: [{ name, code, studentCount, volumes, active }] }
```
- **Verifica**: Test con docente che ha 0, 1, 2 classi

#### Task 1.10: Frontend - Pagina gestione classi
- Nella Teacher Dashboard, aggiungere tab "Le mie classi"
- UX come da PRD sezione 4.2.7
- Bottone "Copia codice" con feedback visivo
- Bottone "Crea classe" con modale semplice
- Lista studenti espandibile
- **Verifica**: Screenshot su Chrome, test click su tutti i bottoni

#### CHAIN OF VERIFICATION - Sprint 1
```
[ ] npm run build -> 0 errori
[ ] Screenshot PRIMA delle modifiche
[ ] auth-activate-license.js: test codice valido -> attivato
[ ] auth-activate-license.js: test codice gia usato -> errore
[ ] auth-me.js: test scadenza -> kits vuoti
[ ] auth-join-class.js: test join valido
[ ] auth-join-class.js: test classe piena -> errore
[ ] auth-create-class.js: test creazione -> codice generato
[ ] auth-list-classes.js: test lista classi
[ ] Frontend classi: screenshot su Chrome
[ ] activate-kit.js eliminato: grep conferma 0 riferimenti
[ ] Regression: login funziona ancora
[ ] Regression: simulatore funziona ancora
[ ] Regression: giochi funzionano ancora
[ ] Screenshot DOPO delle modifiche -> confronto
[ ] Report sessione scritto con HONESTY NOTE
```

---

### SPRINT 2: DRAG & DROP + CAVI

**Obiettivo**: Rendere il simulatore super intuitivo con drag & drop e collegamento cavi facile.

#### Task 2.1: Drag dal ComponentPanel
- Implementare HTML5 drag & drop dal pannello alla canvas SVG
- Durante il drag: ombra semi-trasparente del componente
- Al drop: snap alla griglia 7.5px piu vicina
- **Verifica**: Drag un LED dalla palette alla breadboard, verifica allineamento

#### Task 2.2: Snap intelligente
- Calcola posizione griglia piu vicina: `Math.round(pos / 7.5) * 7.5`
- Se il componente ha pin che devono stare su fori specifici, prioritizza quelli
- Animazione smooth (200ms ease) quando il componente si sposta al punto snap
- **Verifica**: Drop un componente tra due fori, deve scattare al piu vicino

#### Task 2.3: Montaggio guidato con auto-correzione
- Nel modo guidato, se l'utente mette un pezzo nel posto sbagliato:
  1. Il pezzo diventa rosso per 500ms
  2. Slide smooth (300ms) verso la posizione corretta
  3. Flash verde per conferma
- **Verifica**: Metti un resistore nel foro sbagliato, osserva la correzione

#### Task 2.4: Feedback visivo drop zone
- Quando si trascina un componente sopra la breadboard:
  - I fori compatibili si evidenziano (cerchio verde pulsante)
  - La breadboard mostra un overlay leggero
  - Fuori dalla breadboard: cursore "not-allowed"
- **Verifica**: Screenshot durante il drag con fori evidenziati

#### Task 2.5: Wire routing migliorato
- Mantenere Bezier V5 + catenaria
- Aggiungere logica base anti-incrocio:
  1. Se un cavo incrocia un altro, prova offset verticale (+/- 5px)
  2. Se l'offset non basta, accetta l'incrocio (graceful degradation)
- **Verifica**: Collegare 3+ cavi, verificare che non si sovrappongono inutilmente

#### Task 2.6: Collegamento cavi click-click
- Click su pin sorgente -> il cursore diventa "crosshair" con linea tratteggiata che segue il mouse
- Click su pin destinazione -> cavo creato con animazione Bezier
- ESC per annullare
- Feedback: pin sorgente evidenziato in giallo, pin compatibili in verde
- **Verifica**: Collega un LED alla batteria, verifica curva Bezier corretta

#### CHAIN OF VERIFICATION - Sprint 2
```
[ ] npm run build -> 0 errori
[ ] Screenshot PRIMA
[ ] Drag LED dalla palette -> snap corretto
[ ] Drag Resistore tra fori -> snap al piu vicino
[ ] Modo guidato: posizione sbagliata -> auto-correzione animata
[ ] Drop zone: fori evidenziati durante drag
[ ] Cavi: click-click su 2 pin -> cavo Bezier
[ ] Anti-incrocio: 3 cavi -> nessun overlap inutile
[ ] Regression: 69/69 esperimenti caricano
[ ] Regression: quiz funzionano
[ ] Regression: simulatore calcola circuiti correttamente
[ ] Screenshot DOPO -> confronto
[ ] Report sessione
```

---

### SPRINT 3: GIOCHI TEACHER-GATED + CLASSI UX

**Obiettivo**: Il docente controlla quali giochi sono visibili per la sua classe.

#### Task 3.1: Campo "Giochi Attivi" in Classi DB
- Aggiungere multi_select a Notion DB Classi
- Opzioni: CircuitDetective, PredictObserveExplain, ReverseEngineering, CircuitReview
- Default: nessuno (tutti disattivati per scuola)

#### Task 3.2: Toggle giochi nella Teacher Dashboard
- UI toggle per ogni gioco, per classe
- Salva su Notion via API
- Feedback visivo immediato (switch animato)

#### Task 3.3: Filtro giochi nella sidebar studente
- Al login, fetch giochi attivi per la classe dello studente
- Mostrare nella sidebar SOLO i giochi attivati
- Utenti family: tutti i giochi visibili (bypass)

#### Task 3.4: UX classi per docenti inesperti
- Tour rapido al primo accesso come docente (3 step max):
  1. "Crea la tua prima classe"
  2. "Detta il codice ai tuoi studenti"
  3. "Attiva i giochi quando sei pronto"
- Tooltip su ogni bottone critico

#### CHAIN OF VERIFICATION - Sprint 3
```
[ ] npm run build -> 0 errori
[ ] Toggle gioco ON -> studente lo vede
[ ] Toggle gioco OFF -> studente NON lo vede
[ ] Utente family -> tutti i giochi visibili
[ ] Docente con 2 classi -> toggle indipendenti
[ ] Screenshot Teacher Dashboard con toggle
[ ] Regression: giochi funzionano quando visibili
[ ] Regression: star/badge persistono
[ ] Report sessione
```

---

### SPRINT 4: LAVAGNA V3 + ESTETICA + VETRINA

**Obiettivo**: Migliorare la lavagna, verificare estetica, rifare vetrina.

#### Task 4.1: Selezione e spostamento elementi lavagna
- Click su un elemento -> contorno tratteggiato blu
- Drag per spostare
- Canc/Delete per eliminare
- ESC per deselezionare

#### Task 4.2: Ridimensionamento forme
- 4 handle angolari su forme selezionate
- Drag handle per ridimensionare
- Mantenere proporzioni con Shift

#### Task 4.3: Audit estetica vs volumi
- Aprire screenshot dei volumi fisici
- Confrontare ogni componente SVG con l'illustrazione del libro
- Documentare discrepanze con screenshot affiancati
- Fix delle discrepanze piu visibili

#### Task 4.4: Rifare vetrina
- Sostituire VetrinaSimulatore.jsx con dati reali verificati
- 69 esperimenti, 22 componenti, 53 sfide (numeri dal codebase)
- Demo interattiva: esperimento Vol.1 LED base
- Screenshot reali, non mockup

#### CHAIN OF VERIFICATION - Sprint 4
```
[ ] npm run build -> 0 errori
[ ] Lavagna: selezione e spostamento funzionano
[ ] Lavagna: ridimensionamento forme funziona
[ ] Lavagna: delete singolo elemento funziona
[ ] Estetica: screenshot confronto con volumi
[ ] Vetrina: numeri verificati = numeri nel codebase
[ ] Regression: lavagna funziona ancora (undo/redo, salvataggio)
[ ] Regression: simulatore intatto
[ ] Screenshot DOPO -> confronto
[ ] Report sessione
```

---

### SPRINT 5: AI + POLISH + DEPLOY FINALE

**Obiettivo**: AI live, polish finale, deploy verificato.

#### Task 5.1: Debug n8n
- Login su Hostinger
- Verificare che i workflow siano pubblicati
- Test webhook manuale con curl
- Fix HTTP 404

#### Task 5.2: Fallback AI graceful
- Se n8n non risponde entro 5s: usa KB locale
- Se KB locale non ha risposta: messaggio generico amichevole
- L'utente NON deve mai vedere un errore tecnico

#### Task 5.3: Email E2E
- Test registrazione -> email di benvenuto ricevuta
- Test reset password -> email con link funzionante
- Documentare risultati

#### Task 5.4: Audit finale completo
- Build check
- Screenshot tutte le pagine principali
- Test login/registrazione/attivazione
- Test simulatore (5 esperimenti random per volume)
- Test giochi (1 per tipo)
- Test teacher dashboard (classi, toggle, studenti)
- Test responsive (1024, 768, 375)
- Grep: nessun console.log non previsto
- Score finale onesto

#### CHAIN OF VERIFICATION - Sprint 5
```
[ ] n8n: risponde a webhook test
[ ] Galileo: risponde in chat entro 5s
[ ] Fallback: funziona se n8n offline
[ ] Email: registrazione -> email ricevuta
[ ] Email: reset -> link funzionante
[ ] Audit: 0 P0, 0 P1 nuovi
[ ] Deploy Vercel: OK
[ ] Deploy Netlify: OK
[ ] Screenshot post-deploy di TUTTE le pagine
[ ] Report sessione FINALE con score onesto
[ ] Memory aggiornata con stato reale
```

---

## COME USARE QUESTO PROMPT

### Con Ralph Loop
1. Avvia Ralph Loop: `/ralph-loop`
2. Fornisci questo prompt come contesto iniziale
3. Ralph Loop procedera sprint per sprint
4. Alla fine di ogni sprint: report + chain of verification
5. Se un check fallisce: FIX prima di procedere

### Con Team di Agenti
Crea un team con 3-4 agenti specializzati:

| Agente | Ruolo | Tipo |
|--------|-------|------|
| **team-lead** | Coordina, verifica, scrive report | general-purpose |
| **backend-dev** | Netlify Functions, Notion API, sicurezza | general-purpose |
| **frontend-dev** | React components, CSS, UX | general-purpose |
| **qa-tester** | Screenshot, regression test, audit | general-purpose |

### Workflow per ogni task
```
1. team-lead assegna task a backend-dev o frontend-dev
2. Dev implementa
3. Dev fa npm run build
4. qa-tester fa screenshot prima/dopo
5. qa-tester verifica regression
6. team-lead verifica chain of verification
7. Se tutto OK: mark completed
8. Se fallisce: fix e ri-verifica
```

### Screenshot con Chrome Claude
Per ogni verifica visiva:
```
1. Naviga a https://elab-builder.vercel.app (o localhost)
2. Fai screenshot con browser_take_screenshot
3. Salva in /docs/screenshots/sprint-{N}-task-{M}-before.png
4. Implementa modifica
5. Fai nuovo screenshot
6. Salva in /docs/screenshots/sprint-{N}-task-{M}-after.png
7. Confronta visivamente i due screenshot
8. Documenta nel report
```

---

## REMINDER CRITICI

- **MAI** procedere con build rotta
- **MAI** dire "completato" senza verifica visiva
- **MAI** modificare pin names dei componenti (solver-safe)
- **MAI** rimuovere il footer "Laboratorio di Elettronica"
- **MAI** cambiare i font senza approvazione esplicita
- **MAI** toccare CircuitSolver.js senza motivo critico
- **SEMPRE** fare screenshot prima/dopo
- **SEMPRE** scrivere report con HONESTY NOTE
- **SEMPRE** aggiornare MEMORY.md con stato reale
- **SEMPRE** verificare che i numeri nel codice matchino quelli nel PRD
- **SEMPRE** testare con tutti e 3 i ruoli (admin, teacher, student)

---

## FILE DI RIFERIMENTO

| File | Contenuto |
|------|-----------|
| `/docs/PRD-ELAB-TUTOR-v1.md` | PRD completo (QUESTO documento e il riferimento) |
| `/sessioni/report/report-sessione29.md` | Ultimo report (S29) |
| `/sessioni/prompt/prompt-sessione30.md` | Prompt originale S30 |
| `~/.claude/projects/.../memory/MEMORY.md` | Memory persistente |
| `/src/components/simulator/components/registry.js` | Registro 22 componenti |
| `/src/data/experiments-vol1.js` | 38 esperimenti Vol.1 |
| `/src/data/experiments-vol2.js` | 18 esperimenti Vol.2 |
| `/src/data/experiments-vol3.js` | 13 esperimenti Vol.3 |
| `/newcartella/netlify/functions/utils/valid-codes.js` | Codici licenza (DA DEPRECARE) |
| `/src/styles/design-system.css` | CSS variables centrali |

---

*Prompt Operativo v1.0 — 20/02/2026*
*Per uso con Claude Code + Ralph Loop + Team Agenti*
