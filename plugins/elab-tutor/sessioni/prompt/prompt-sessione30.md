# PROMPT SESSIONE 30 — Interazione Simulatore: Drag&Drop, Licenze, Giochi, Wire Routing

**Data creazione**: 20/02/2026
**Sessione precedente**: 29 (ristrutturazione estetica + revert font)
**Deploy attuale**: https://elab-builder.vercel.app
**Score attuale**: ~9.5/10

---

## CONTESTO: Cosa è stato fatto nella Sessione 29

Nella sessione 29 abbiamo completato 3 fasi di ristrutturazione estetica del tutor ELAB (la fase 2 è stata revertita):

1. **Fase 1 — Rimozione Onboarding**: Eliminati OnboardingWizard.jsx (473 LOC) + OnboardingOverlay.jsx (511 LOC) + directory onboarding/ + CSS (169 LOC). Ripuliti 11 file consumer. ~1.400 LOC di dead code rimosso.

2. **Fase 2 — Tipografia libro — REVERTITA**: I font sono stati temporaneamente cambiati a Bebas Neue + Roboto, poi **REVERTITI** su richiesta dell'utente. I font attuali sono:
   - Titoli: **Oswald** (come prima della sessione)
   - Body: **Open Sans** (come prima della sessione)
   - Code: **Fira Code** (invariato)

3. **Fase 4 — Rimozione progress bars**: Rimossi progressStats, sidebar-progress-card, topbar-progress-card, ProjectTimeline.jsx, polling useEffect, refreshProgressStats. La sidebar ora ha 9 tab senza barre di completamento.

4. **Fase 8 — Estetica libro** (RIMASTA ATTIVA):
   - Tipografia globale CSS (`.vol-heading`, `.vol-body`, `.vol-label`, `.vol-code`) — usa `var()` che risolvono a Oswald/Open Sans
   - Pattern SVG circuiti per volume (lime/arancione/rosso) in ExperimentPicker
   - Chapter cards con `borderTop: 4px solid ${volColor}` + Oswald UPPERCASE
   - Footer navy `#1E4D8C`: "Laboratorio di Elettronica: Impara e sperimenta"
   - Brand topbar ELAB + GALILEO in Oswald (via `var(--font-display)`)

**Documenti di riferimento**:
- Report completo: `sessioni/report/report-sessione29.md`
- Design doc: `docs/plans/2026-02-20-session29-restructure-design.md`
- Piano implementazione: `docs/plans/2026-02-20-session29-plan.md`
- Memory auto: `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md`

---

## DECISIONI GIÀ PRESE (nella Sessione 29, confermate dall'utente)

Queste decisioni sono state confermate nella sessione 29 durante il brainstorming e **NON devono essere ridiscusse**:

| Domanda | Decisione |
|---------|-----------|
| Pannello componenti | **Drag & drop attivo** |
| Esperimenti | **"Monta tu" guidato** + **sandbox libero** (ogni cosa spiegata in modo molto semplice e terra terra) |
| Errori montaggio | **Snap automatico alla posizione corretta** |
| Sandbox | **Snap griglia breadboard 7.5px** |

---

## FASI DA IMPLEMENTARE IN SESSIONE 30

### Fase 3: VolumeHome + ComponentPanel + Drag&Drop

Questa è la fase più grande e importante. L'utente ha specificato:

> "tutto costruito, modalità monta tu, modalità tavolo di lavoro libero (un monta tu con guida, ma in cui dei prendere tu gli elementi: ogni cosa deve essere spiegata in modo molto semplice e terra terra)"

#### 3A: VolumeHome — Schermata iniziale dopo login
- Lo studente sceglie il volume (1/2/3) come prima schermata
- Design: 3 card grandi con icona volume, colore, conteggio esperimenti
- Dopo la scelta, la sidebar mostra solo gli esperimenti di quel volume
- Deve essere possibile cambiare volume senza logout

#### 3B: ComponentPanel — Pannello componenti con drag&drop
- Lista visuale dei componenti disponibili per l'esperimento corrente
- Ogni componente ha: icona SVG, nome, breve descrizione
- **Drag & drop**: l'utente trascina il componente sul workbench/breadboard
- **Snap a griglia**: componenti si allineano alla griglia breadboard 7.5px
- **Snap automatico errori**: se l'utente piazza un componente in posizione sbagliata, il componente scatta automaticamente alla posizione corretta

#### 3C: Modalità "Monta tu" guidato
- L'esperimento mostra la lista componenti necessari
- L'utente trascina ogni componente sulla breadboard
- Feedback visivo: colore verde se corretto, snap alla posizione giusta se sbagliato
- Ogni passaggio ha una spiegazione semplice ("terra terra")
- Progressione step-by-step: componente → fili → verifica

#### 3D: Modalità Sandbox libero
- Tutti i componenti disponibili nel pannello
- L'utente può piazzare qualsiasi componente
- Griglia breadboard 7.5px sempre attiva
- Nessun vincolo di posizionamento (ma snap alla griglia)

#### File chiave da modificare/creare:
- `ExperimentPicker.jsx` — aggiungere schermata VolumeHome
- `NewElabSimulator.jsx` — integrare ComponentPanel + drag&drop
- Nuovo: `ComponentPanel.jsx` — pannello componenti con drag
- Nuovo: `DragDropManager.js` — logica drag&drop con snap
- `CircuitBoard.jsx` o equivalente — area di drop
- SVG componenti (già esistenti in `src/components/simulator/components/`)

#### Architettura drag&drop:
- **Pin map VERIFICATA** (vedi MEMORY.md):
  - Capacitor: `positive`/`negative`
  - Pot: `vcc`/`signal`/`gnd`
  - Multimeter: `probe-positive`/`probe-negative`
  - RGB LED: `red`/`common`/`green`/`blue`
  - Bus: `bus-bot-plus`/`bus-bot-minus`
- **NanoBreakout V1.1**: DEVE sempre stare SULLA breadboard. Semicerchio a SINISTRA, ala a DESTRA. MAI floating.
- **Griglia**: 7.5px pitch (come breadboard reale)

---

### Fase 5: Licenze per volume

Attualmente le licenze sono generiche (8 codici fissi in `valid-codes.js`). Serve:

- Mappatura codice → volume(i) abilitato(i)
- Es: `ELAB-VOL1-2026` abilita solo Vol.1
- Es: `ELAB-BUNDLE-ALL` abilita tutti i volumi
- Dopo login, l'utente vede solo i volumi per cui ha la licenza
- Modifica: `netlify/functions/utils/valid-codes.js` + `auth-activate-license.js` + `activate-kit.js`
- Frontend: disabilitare/nascondere volumi non licenziati

**Codici attuali** (da `valid-codes.js`):
```
ELAB-VOL1-2026, ELAB-V1-PROMO → Vol.1
ELAB-VOL2-2026, ELAB-V2-PROMO → Vol.2
ELAB-VOL3-2026, ELAB-V3-PROMO → Vol.3
ELAB-BUNDLE-ALL → Vol.1+2+3
SCUOLA-2026-DEMO → Vol.1+2+3
```

---

### Fase 6: Giochi attivabili dal teacher

Attualmente i 4 giochi (CircuitDetective, PredictObserveExplain, ReverseEngineering, CircuitReview) sono sempre disponibili nella sidebar. Serve:

- Solo il teacher può abilitare/disabilitare i giochi per i propri studenti
- Per default: giochi DISABILITATI fino ad attivazione teacher
- UI nel TeacherDashboard: toggle per ogni gioco
- Effetto: la sidebar dello studente mostra/nasconde i giochi

---

### Fase 7: Wire routing anti-incrocio

Il WireRenderer V5 (Bézier con catenary sag) a volte produce fili che si sovrappongono. Serve:

- Algoritmo di routing che evita sovrapposizioni tra fili
- Mantenere lo stile Bézier con catenary sag
- Priorità: evitare passaggio sopra componenti
- File: `src/components/simulator/WireRenderer.jsx`
- Parametri attuali: `WIRE_SAG_FACTOR = 0.12`, max sag 15px

---

## PRIORITÀ SUGGERITA

1. **Fase 3** (VolumeHome + Drag&Drop) — più impattante, definisce l'esperienza utente
2. **Fase 5** (Licenze per volume) — necessaria per vendita
3. **Fase 6** (Giochi teacher-gated) — valore aggiunto per scuole
4. **Fase 7** (Wire routing) — polish estetico

La sessione potrebbe non riuscire a completare tutte e 4 le fasi. Valutare con l'utente cosa prioritizzare.

---

## STRUTTURA PROGETTO

```
/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/
├── index.html                    → Entry point (Open Sans + Oswald + Fira Code)
├── src/
│   ├── main.jsx                  → React root
│   ├── App.jsx                   → Router principale
│   ├── context/AuthContext.jsx    → Auth + RBAC (useAuth, isDocente)
│   ├── styles/design-system.css  → CSS variables (--font-sans=Open Sans, --font-display=Oswald, --font-mono=Fira Code)
│   ├── components/
│   │   ├── tutor/
│   │   │   ├── ElabTutorV4.jsx   → Container principale (1.170 LOC)
│   │   │   ├── ElabTutorV4.css   → CSS principale (2.134 LOC) — include .vol-heading/.vol-body/footer
│   │   │   ├── TutorLayout.jsx   → Layout grid (topbar+sidebar+content+chat+footer)
│   │   │   ├── TutorSidebar.jsx  → 9 tab (manual, simulator, 4 giochi, canvas, notebooks, media)
│   │   │   ├── TutorTopBar.jsx   → Brand ELAB GALILEO + volume badge + session export
│   │   │   ├── ChatOverlay.jsx   → Chat Galileo AI
│   │   │   ├── tutor-responsive.css → CSS responsive — include brand topbar styling
│   │   │   └── ...altri componenti tutor
│   │   ├── simulator/
│   │   │   ├── NewElabSimulator.jsx → Simulatore principale (~2.700 LOC)
│   │   │   ├── WireRenderer.jsx     → Bézier wires V5
│   │   │   ├── CircuitSolver.js     → Union-Find + MNA (2.060 LOC)
│   │   │   ├── panels/
│   │   │   │   ├── ExperimentPicker.jsx → 3 schermate (volumi→capitoli→esperimenti) + VOL_PATTERN SVG
│   │   │   │   ├── ComponentPalette.jsx → Palette componenti attuale
│   │   │   │   ├── CodeEditorCM6.jsx    → Editor con autocomplete
│   │   │   │   └── ...altri pannelli
│   │   │   └── components/           → 21 SVG componenti (LED, resistor, etc.)
│   │   ├── teacher/TeacherDashboard.jsx
│   │   ├── admin/AdminPage.jsx
│   │   └── ...
│   ├── data/
│   │   ├── experiments-index.js  → 69 esperimenti (38 Vol1 + 18 Vol2 + 13 Vol3)
│   │   ├── experiments-vol1.js   → Dati Vol.1
│   │   └── experiments-vol3.js   → Dati Vol.3
│   └── services/
│       ├── api.js                → Backend AI (n8n webhooks)
│       ├── studentService.js     → Gestione studenti
│       └── ...
├── netlify/functions/
│   ├── utils/valid-codes.js      → 8 codici licenza validi
│   ├── auth-activate-license.js  → Attivazione licenza
│   └── activate-kit.js           → Attivazione kit
└── docs/plans/
    ├── 2026-02-20-session29-restructure-design.md
    └── 2026-02-20-session29-plan.md
```

---

## TEST ACCOUNTS

| Ruolo | Email | Password | RBAC |
|-------|-------|----------|------|
| Admin | `debug@test.com` | `Xk9#mL2!nR4` | Tutor + Area Docente + Admin |
| Teacher | `teacher@elab.test` | `Pw8&jF3@hT6!cZ1` | Tutor + Area Docente |
| Student | `student@elab.test` | `Ry5!kN7#dM2$wL9` | Solo Tutor |
| Admin | `marro.andrea96@gmail.com` | `Bz4@qW8!fJ3#xV6` | Tutor + Area Docente + Admin |

---

## DEPLOY

```bash
# Vercel (ELAB Tutor)
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes

# Netlify (Sito Pubblico) — solo se modificato
cd "VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13
```

---

## ISSUES NOTI (da Sessione 29)

### P1 Important
- n8n workflow non pubblicati (HTTP 404) — serve login pannello n8n Hostinger
- Email E2E non verificata (Resend configurato)

### P2 Medium
- DashboardGestionale chunk 410KB (recharts ~300KB bundled)
- Pagamenti: solo Amazon. Serve Satispay/Mollie integration
- Whiteboard V2 non testata E2E

### P3 Minor
- ChatOverlay.jsx:715 — AI disclaimer footer 10px (legal text)
- SVG `<rect> attribute rx` console warning (cosmetic)
- Pin alignment: 6 components not exactly on 7.5px grid
- No automated E2E test suite in CI

---

## NOTE IMPORTANTI PER CLAUDE

1. **Memory auto** contiene tutta la storia del progetto: `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md`
2. **Pin map verificata** — usare SEMPRE i nomi pin da MEMORY.md, NON inventare
3. **NanoBreakout** — DEVE stare SULLA breadboard, semicerchio LEFT, ala RIGHT
4. **Griglia breadboard** — 7.5px pitch
5. **Font attuali** — **Oswald** (titoli) + **Open Sans** (body) + **Fira Code** (codice). La sessione 29 ha provato Bebas Neue + Roboto ma è stato REVERTITO.
6. **Colori volume** — Vol.1: `#7CB342`, Vol.2: `#E8941C`, Vol.3: `#E54B3D`, Navy: `#1E4D8C`
7. **WCAG** — fontSize minimo 14px per contenuto studente (eccezione: legal disclaimer)
8. **Non toccare** emailService.js (font Open Sans per email template server-side)
9. **Fase 8 attiva** — Footer, SVG patterns, typography CSS rules sono presenti e usano CSS variables che risolvono a Oswald/Open Sans
