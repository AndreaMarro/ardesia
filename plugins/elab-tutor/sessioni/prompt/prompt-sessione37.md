# PROMPT SESSIONE 37 — ELAB Tutor "Galileo"
**Data**: 22/02/2026
**Scritto da**: Claude (post-sessione 36), con MASSIMA ONESTÀ
**Sessione precedente**: 36 (redesign SVG Fritzing 3D di tutti 21 componenti)
**Score REALE onesto**: ~6.8/10 → Target: 8.5/10
**Metodologia**: RALPH LOOP OBBLIGATORIO (plan → build → verify Chrome → fix → verify → deploy)

---

## 0. PRINCIPIO FONDAMENTALE (dal PRD, parole dell'autore)

> "L'estetica, i componenti, i colori, i font e il linguaggio visivo devono essere IDENTICI tra il software e i volumi stampati. Non ci sono eccezioni."

> "ZERO REGRESSIONI. Ogni modifica deve essere verificata visivamente (screenshot) e funzionalmente (build + test) PRIMA del deploy."

---

## 1. CONTESTO RAPIDO

ELAB è una piattaforma educativa per elettronica e Arduino (studenti 8-12 anni):
- **3 volumi fisici** (Kit con componenti + libro illustrato con illustrazioni Fritzing)
- **ELAB Tutor "Galileo"** (piattaforma web: simulatore circuiti, AI tutor, giochi educativi)
- **Sito pubblico** (marketing/vendita)

### Paths
```
Sito Pubblico:  /Users/andreamarro/VOLUME 3/PRODOTTO/newcartella/     → Netlify
ELAB Tutor:     /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/    → Vercel (https://elab-builder.vercel.app)
```

### Deploy
```bash
# Vercel (tutor)
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes

# Netlify (sito pubblico — solo se modificato)
cd "VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13
```

### Account di Test
| Ruolo | Email | Password | RBAC |
|-------|-------|----------|------|
| Admin | `debug@test.com` | `Xk9#mL2!nR4` | Tutor + Area Docente + Admin |
| Teacher | `teacher@elab.test` | `Pw8&jF3@hT6!cZ1` | Tutor + Area Docente |
| Student | `student@elab.test` | `Ry5!kN7#dM2$wL9` | Solo Tutor |

**Codici licenza test**: ELAB-VOL1-2026, ELAB-VOL2-2026, ELAB-VOL3-2026, ELAB-BUNDLE-ALL

---

## 2. COS'È STATO FATTO NELLE SESSIONI 33-36 (ONESTAMENTE)

### Sessione 33
- QuizPanel.jsx costruito e integrato in NewElabSimulator
- Chat overlay mobile max-height: 60vh
- Volume bypass guard in NewElabSimulator
- auth-create-class: 503 graceful (non più 500 hard crash)

### Sessione 34
- 10 breadboard gap wiring bugs fixati (Vol1 cap6/cap8/cap10 + Vol2 cap7)
- buildSteps vs connections mismatch fixato per 9 esperimenti
- Tutti 21 volumeAvailableFrom verificati vs PDF kit contents (tutti corretti)
- 138 quiz verificati (69 esperimenti × 2 domande)

### Sessione 35-36 — Redesign SVG Fritzing 3D
- **21 componenti SVG riscritti** in stile Fritzing 3D (3D gradients, drop shadows, edge highlights, specular)
- 0 SVG `<filter>`, 0 `dropShadow` CSS, 0 texture
- Build: 0 errori
- Deploy su Vercel: OK (live)

### ⚠️ VERITÀ SCOMODA — Cosa NON è stato fatto
1. **ZERO verifica visiva post-redesign**: I componenti sono stati riscritti ma NESSUN esperimento è stato ri-testato nel browser. Il 69/69 PASS era della sessione 33, PRE-redesign.
2. **ZERO confronto con PDF**: I componenti sono stati disegnati "a memoria" dello stile Fritzing, NON con side-by-side col PDF aperto.
3. **La MEMORY dice "9.5/10 rendering"** → è il score PRE-redesign. Post-redesign il rendering NON È VERIFICATO.
4. **Confusione terminologica**: La MEMORY dice "Tinkercad redesign", il codice dice "Fritzing redesign". L'obiettivo è: IDENTICI ai volumi PDF (che usano Fritzing).

### Cosa NON è stato fatto DALLA SESSIONE 33 (richiesto nel prompt S33)
Queste richieste erano nel prompt sessione 33 e NON sono state completate:

| Task | Status | Note |
|------|--------|------|
| Sprint 0 verifica visiva Chrome | ❌ MAI FATTO | Il prompt diceva "NON TOCCARE CODICE finché Sprint 0 non è completato" |
| Teacher-Student data server-side | ❌ NON FATTO | Ancora localStorage, il bug P0 più grave |
| auth-list-classes fix | ⚠️ Parziale | 503 graceful ma non risolto (Notion DB non esiste) |
| 3 modalità esperimento | ❌ NON IMPLEMENTATO | buildMode nel codice, 0/69 lo usano |
| AI Galileo context | ❌ NON FATTO | Galileo non sa quale esperimento guardi |
| Chat overlay mobile | ✅ Fatto S33 | max-height: 60vh |
| Whiteboard V3 test browser | ❌ MAI TESTATO | Codice scritto, mai aperto nel browser |
| Responsive audit completo | ❌ MAI FATTO | Nessun test responsive recente |
| Vetrina redesign | ❌ NON FATTO | Le 4 immagini non verificate |
| Volume gating E2E test | ❌ MAI TESTATO con studente reale | |

**Le sessioni 34-36 hanno fatto SOLO redesign SVG + fix wiring. Le richieste P0 del prompt S33 sono rimaste inevase.**

---

## 3. SCORE ONESTO — 22/02/2026

| Area | Score | Nota ONESTA |
|------|-------|-------------|
| Auth + Security | **8.5/10** | bcrypt+HMAC funziona, RBAC OK. -1.5: email non testata E2E, classes DB 503 |
| Sito Pubblico | **8.5/10** | 20 pagine, funziona. -1.5: HTML statico, responsive non auditato |
| Simulatore (rendering) | **7.5/10** | 21 SVG riscritti Fritzing 3D ma ⚠️ ZERO verifica visiva post-redesign |
| Simulatore (physics) | **7.0/10** | CircuitSolver KVL/KCL funziona. -3: no capacitor dinamico, no transienti |
| Volume Gating | **8.0/10** | Implementato. -2: mai testato con studente reale |
| Quiz | **8.0/10** | 138 domande. -2: UI mai testata da utente reale |
| Games | **7.5/10** | 53 sfide. -2.5: teacher-gated non testato |
| Teacher Dashboard | **4.0/10** | localStorage = NON FUNZIONA cross-browser |
| AI Integration | **7.0/10** | n8n funziona. -3: mobile UX, no context esperimento |
| Whiteboard V3 | **5.0/10** | Codice scritto, MAI testato nel browser |
| Code Quality | **9.0/10** | 0 console.log, 0 build errors |
| Frontend/UX | **7.0/10** | -3: responsive non auditato, mobile non testato |
| 3 Experiment Modes | **2.0/10** | NON IMPLEMENTATO |
| Teacher-Student | **2.0/10** | localStorage → teacher non vede dati studente |
| **OVERALL** | **~6.8/10** | Abbassato dal 7.7 della memory per onestà |

---

## 4. SPRINT 0 — VERIFICA VISIVA POST-REDESIGN (OBBLIGATORIO, BLOCCANTE)

**NON TOCCARE NESSUN CODICE finché Sprint 0 non è completato.**

Il redesign SVG delle sessioni 35-36 NON è mai stato verificato visivamente. Devi farlo ORA.

### 0A: Build check
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build  # → 0 errori
```

### 0B: Verifica visiva con Chrome (SCREENSHOT OBBLIGATORI)

Apri https://elab-builder.vercel.app con il browser e fai TUTTI questi test:

**Test 1 — Login admin**
1. Vai a /login → Login con `debug@test.com` / `Xk9#mL2!nR4`
2. Screenshot post-login
3. Verifica: vedi Tutor + Area Docente + Admin

**Test 2 — Componenti SVG redesign (IL TEST PIÙ IMPORTANTE)**
Per ciascun esperimento sotto, caricalo nel simulatore e:
- Screenshot del circuito completo
- Confronta VISIVAMENTE con la corrispondente illustrazione nel PDF del volume
- I PDF sono nella cartella ELAB del progetto
- Se il componente non somiglia al PDF → ANNOTARE per fix

Esperimenti da verificare:
| Esperimento | Componenti chiave da verificare |
|-------------|-------------------------------|
| `v1-cap6-esp1` | LED, Resistore, Battery9V, fili |
| `v1-cap7-esp1` | PushButton, LED |
| `v1-cap8-esp1` | Potenziometro, LED |
| `v1-cap10-esp1` | Fotoresistore, LED |
| `v1-cap11-esp1` | RGB LED |
| `v2-cap6-esp1` | Capacitor, LED |
| `v2-cap7-esp1` | Buzzer, MotorDC |
| `v2-cap8-esp1` | Diode, MosfetN |
| `v3-cap9-esp1` | NanoR4Board (Arduino) su breadboard |
| `v3-cap11-esp1` | Servo o LCD |

**Test 3 — Breadboard rendering**
1. Verifica che la breadboard abbia aspetto corretto (fori visibili, bus colorati)
2. Screenshot

**Test 4 — NanoR4Board posizionamento**
1. Nell'esperimento Vol3, il NanoR4Board deve stare SULLA breadboard
2. Semicerchio a SINISTRA, ala a DESTRA
3. Screenshot per conferma

**Test 5 — Passo Passo mode funziona**
1. Carica un esperimento (es. v1-cap6-esp1)
2. Seleziona modalità "Passo Passo" se disponibile
3. Screenshot di ogni step
4. Verifica: componenti si piazzano nella posizione FINALE del libro

### 0C: Report Sprint 0
Dopo TUTTI i test, scrivi un mini-report:
- Quanti test passati / falliti
- Lista componenti che NON somigliano al PDF → da correggere
- Lista bug trovati (nuovi o confermati)
- **SOLO DOPO questo report puoi iniziare Sprint 1**

---

## 5. PRIORITÀ PER LA SESSIONE 37

### 🔴 P0 — CRITICO (senza questi il prodotto non funziona)

#### P0-1: Fix componenti SVG che non somigliano al PDF
Se Sprint 0 trova discrepanze tra componenti SVG e illustrazioni PDF, correggerle SUBITO.
- Aprire il PDF, fare side-by-side col simulatore
- Chain of Verification: colori, proporzioni, forma, dettagli

#### P0-2: TEACHER-STUDENT DATA — da localStorage a server-side
**Il problema**: `studentService.js` usa `localStorage` → il teacher non vede MAI i dati degli studenti.
**File coinvolti**:
- `src/services/studentService.js` — DA RISCRIVERE (localStorage → fetch API)
- `src/components/teacher/TeacherDashboard.jsx` — DA MODIFICARE (data source)
- `netlify/functions/` — creare endpoint per sync dati studente

#### P0-3: auth-list-classes / auth-create-class → 503
Il Notion CLASSES DB non è accessibile. Creare il DB o usare alternativa.

### 🟡 P1 — IMPORTANTE

#### P1-1: 3 MODALITÀ ESPERIMENTO
Score 2/10. Il codice ha `buildMode` ma 0/69 esperimenti lo usano come esperienza distinta.
- **Già Montato**: circuito pre-assemblato, osserva
- **Passo Passo**: step-by-step con buildSteps (ESISTONO già in tutti i 69)
- **Libero**: canvas vuoto, palette componenti del volume

Il selettore è UNICO in `NewElabSimulator.jsx` (~riga 2397).

#### P1-2: AI GALILEO CONTEXT
Galileo non sa quale esperimento lo studente sta guardando. Includere `experimentId`, `volume`, `buildMode` nel payload.

#### P1-3: WHITEBOARD V3 — TEST NEL BROWSER
Codice scritto, MAI aperto. Testare e fixare.

### 🟢 P2 — MEDIUM

#### P2-1: Responsive audit completo (mobile 375px, tablet 768px, desktop 1440px)
#### P2-2: Vetrina redesign (Apple-quality)
#### P2-3: Volume gating E2E test con account studente
#### P2-4: Student cards UUID → nome nel teacher dashboard

---

## 6. REGOLE INVIOLABILI

1. **RALPH LOOP PER OGNI TASK**: plan → build → verify (Chrome) → fix → verify → deploy
2. **NO SCORE INFLAZIONATI**: Se non l'hai testato nel browser, NON dire che funziona
3. **SCREENSHOT O NON È MAI SUCCESSO**: Ogni fix deve avere screenshot
4. **ESTETICA = VOLUMI**: Componenti SVG IDENTICI alle illustrazioni Fritzing dei PDF
5. **CHAIN OF VERIFICATION**: Apri il PDF, leggi, confronta. Non fidarti della memoria
6. **Pin positions IMMUTABILI**: Mai modificare pin senza verificare che 0/69 si rompano
7. **NanoBreakout**: Semicerchio LEFT, ala RIGHT, SULLA breadboard
8. **buildSteps posizione FINALE**: In Passo Passo, ogni step piazza nella posizione del libro
9. **RESPONSIVE**: OGNI pagina DEVE funzionare a 1440px, 768px, 375px
10. **0 console.log in produzione**: Solo `logger.js` con guard `isDev`
11. **Build = 0 errori**: Sempre. Ogni modifica → build → verify
12. **Watermark**: `Andrea Marro — DD/MM/YYYY`
13. **Force-light theme**: `data-theme="light"` statico
14. **FONT**: Oswald (titoli) + Open Sans (corpo) + Fira Code (codice). fontSize >= 14px
15. **TOUCH TARGETS**: >= 44px su mobile
16. **PALETTE**: Navy #1E4D8C / Lime #7CB342 / Vol1 #7CB342 / Vol2 #E8941C / Vol3 #E54B3D
17. **Bus naming**: `bus-bot-plus/minus` (NON `bus-bottom-plus/minus`)
18. **Auth**: sessionStorage key `elab_auth_token` (NON localStorage)

---

## 7. ARCHITETTURA TECNICA

### Stack
- **Frontend**: React (Vite), Vercel
- **Auth**: Netlify Functions (bcrypt + HMAC-SHA256, sessionStorage, 7-day expiry)
- **AI Backend**: n8n su Hostinger
- **Simulator**: 21 SVG components + CircuitSolver v4 (KVL/KCL MNA 2060 righe) + avr8js

### File critici
```
src/components/simulator/NewElabSimulator.jsx    (~2500 righe — cuore simulatore)
src/data/experiments-vol1.js / vol2 / vol3       (69 esperimenti)
src/components/simulator/components/             (21 SVG components)
src/components/simulator/engine/CircuitSolver.js (2060 righe)
src/services/authService.js                      (auth, sessionStorage)
src/services/studentService.js                   (⚠️ USA localStorage — BUG P0)
src/context/AuthContext.jsx                      (auth provider)
```

### Pin Name Map (VERIFICATO)
- Capacitor: `positive`/`negative` | Pot: `vcc`/`signal`/`gnd`
- RGB LED: `red`/`common`/`green`/`blue` | Multimeter: `probe-positive`/`probe-negative`
- Bus: `bus-bot-plus/minus` (NON `bus-bottom-plus/minus`)

### volumeAvailableFrom (VERIFICATO vs PDF)
- **Vol1**: Led, Resistor, Battery9V, BreadboardHalf/Full, PushButton, Potentiometer, PhotoResistor, BuzzerPiezo, ReedSwitch, RgbLed, Wire
- **Vol2**: + Capacitor, Diode, MosfetN, Phototransistor, MotorDC, Multimeter
- **Vol3**: + NanoR4Board, Servo, LCD16x2

---

## 8. LEZIONI APPRESE (DA NON RIPETERE)

1. **Non dichiarare "PASS" senza verifica nel browser**. Le sessioni 35-36 hanno detto "69/69 PASS" post-redesign, ma nessun esperimento è stato ri-testato.
2. **Sub-component scope**: Funzioni helper dentro componenti SVG (es. `UsbCConnector` in NanoR4Board) NON hanno accesso al `id` prop del padre. Non usare gradient refs con `id` in sub-components.
3. **sessionStorage ≠ localStorage**: Auth usa `sessionStorage` (key: `elab_auth_token`).
4. **Il punteggio deve essere ONESTO**. Meglio "7/10 non testato" che "9.5/10 bellissimo".
5. **Breadboard gap**: Righe a-e e f-j sono reti elettriche SEPARATE. Serve wire esplicito.
6. **Steps text deve matchare wiring**: Quando correggi `connections`, correggi anche `steps` text.
7. **Fritzing redesign pattern**: Per file complessi (>500 righe), edits chirurgici. Per semplici (<300), riscrittura completa.
8. **Trailing commas**: Quando appendi a array JS, ricorda la virgola dopo l'ultimo entry esistente.

---

## 9. ORDINE DI ESECUZIONE RACCOMANDATO

| Passo | Task | Stima |
|-------|------|-------|
| 1 | **Sprint 0**: Verifica visiva Chrome post-redesign | 30 min |
| 2 | **P0-1**: Fix componenti che non matchano PDF | 30-60 min |
| 3 | **P0-2**: Teacher-Student data → server-side | 90 min |
| 4 | **P0-3**: auth-list-classes fix | 20 min |
| 5 | **P1-1**: 3 modalità esperimento (UI + logica) | 120 min |
| 6 | **P1-2**: AI Galileo context | 20 min |
| 7 | **P1-3**: Whiteboard V3 test + fix | 15 min |
| 8 | **P2-1**: Responsive audit | 30 min |
| 9 | Deploy + Report + MEMORY update | 20 min |

---

## 10. OUTPUT ATTESI FINE SESSIONE

### Funzionalità
- [ ] Sprint 0: verifica visiva completata con screenshot
- [ ] Componenti SVG che matchano i PDF dei volumi (screenshot side-by-side)
- [ ] Teacher-Student data funzionante server-side
- [ ] 3 modalità esperimento funzionanti per almeno 10 esperimenti
- [ ] Build 0 errori + deploy Vercel

### Documentazione
- [ ] Report con score aggiornati e delta
- [ ] MEMORY.md aggiornato con stato reale
- [ ] Prompt sessione 38 se necessario

---

## 11. COSA FARE PRIMA DI QUALSIASI ALTRA COSA

```
1. Leggi questo prompt INTERO
2. Leggi la MEMORY: .claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md
3. Build check: cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build
4. Sprint 0: verifica visiva Chrome (BLOCCANTE)
5. Chiedi all'utente la priorità se non chiara
6. Non inventare lavoro. Esegui.
```

---

## 12. RIASSUNTO ONESTO IN UNA FRASE

**Il simulatore ha 21 SVG Fritzing 3D e 69 esperimenti, ma la verifica visiva post-redesign non è mai stata fatta, il teacher-student è rotto (localStorage), le 3 modalità esperimento non esistono, e il responsive non è mai stato auditato. Lo Sprint 0 del prompt sessione 33 non è mai stato eseguito.**

---

*Andrea Marro — 22/02/2026*
*Generato con: analisi MEMORY.md, prompt-sessione33, codice sorgente reale, grep componenti SVG, stato build, stato Vercel deploy*
