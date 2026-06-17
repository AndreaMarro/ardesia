# PROMPT SESSIONE 31 — Audit Brutale + Frontend Perfetto + Volume Gating

**Data creazione**: 20/02/2026
**Sessione precedente**: 30 (classi, games, lavagna V3, vetrina, AI live)
**Deploy attuale**: https://elab-builder.vercel.app
**Score attuale**: ~9.5/10
**Metodologia**: Ralph Loop (agile sprints con deploy dopo ogni sprint)

---

## OBIETTIVO SESSIONE

Questa sessione ha UN UNICO obiettivo: rendere ELAB Tutor e il Sito Pubblico **visivamente perfetti** e **funzionalmente corretti**. Non si scrive codice a caso — si usa Claude in Chrome per GUARDARE cosa c'e sul browser, si confrontano i componenti SVG con quelli dei PDF dei volumi, e si sistema tutto finche non e impeccabile.

**Regola d'oro**: PRIMA guardo con gli occhi (screenshot), POI sistemo. MAI correggere senza aver prima visto il problema dal vivo.

---

## CONTESTO: Cosa e stato fatto nella Sessione 30

Nella sessione 30 abbiamo completato 5 sprints:

1. **Sprint 1 — Licenze + Classi**: License whitelist server-side (8 codici → volume mapping), classi Notion DB (crea/join/leave con codice 6 cifre), RBAC guards
2. **Sprint 2 — Drag & Drop + Cavi**: Drag & drop componenti sulla breadboard, Bezier V5 wire routing
3. **Sprint 3 — Giochi Teacher-Gated**: Toggle giochi per classe, sidebar filtering, `GAME_ID_TO_NOTION` mapping, null/[]/[...] semantics
4. **Sprint 4 — Lavagna V3 + Vetrina**: WhiteboardOverlay V3 (select/move/resize/delete), VetrinaSimulatore rebuild con numeri verificati
5. **Sprint 5 — AI + Polish**: n8n LIVE discovery, 3-tier fallback AI, email config, final audit

**Issues NOTI dalla Session 30 (HONESTY NOTE)**:
- WhiteboardOverlay V3 NON testata in browser
- Email NON testata E2E
- VetrinaSimulatore: sezione screenshots RIMOSSA (ma le immagini ESISTONO in `/public/assets/breadboard/`)
- Vol2: 0/18 esperimenti con quiz
- MobileBottomTabs: non filtra giochi teacher-gated (P3)
- Whiteboard text bounds approssimati

**Documenti di riferimento**:
- Report completo Session 30: `sessioni/report/report-sessione30-finale.md`
- Sprint 1: `sessioni/report/report-sessione30-sprint1.md` (se esiste)
- Sprint 3: `sessioni/report/report-sessione30-sprint3.md`
- Sprint 4: `sessioni/report/report-sessione30-sprint4.md`
- PRD Session 30: `sessioni/prompt/prompt-sessione30.md`
- Memory auto: `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md`
- **PDF VOLUMI**: `public/volumes/volume1.pdf`, `volume2.pdf`, `volume3.pdf`

---

## DECISIONI GIA PRESE (sessioni precedenti)

| Domanda | Decisione |
|---------|-----------|
| Drag & drop | **Attivo** (Session 30) |
| Snap automatico | **Alla posizione corretta** se sbagliata |
| Griglia breadboard | **7.5px pitch** |
| Font | **Oswald** (titoli) + **Open Sans** (body) + **Fira Code** (code) |
| Palette colori | Navy `#1E4D8C`, Vol1 `#7CB342`, Vol2 `#E8941C`, Vol3 `#E54B3D` |
| Vendita | **Solo Amazon** (Stripe disabilitato) |
| Volume unlock | **Solo con licenza attiva** |
| Admin bypass | Admin vede TUTTO senza licenza |

---

## NUMERI VERIFICATI DAL CODEBASE (Session 30)

| Metrica | Valore | Verifica |
|---------|--------|----------|
| Esperimenti | 69 | Vol1: 38, Vol2: 18, Vol3: 13 |
| Componenti SVG | 21 | registry.js + 21 file .jsx in components/ |
| Sfide gioco | 53 | CircuitDetective 20 + POE 18 + ReverseEng 15 |
| Quiz | 51/69 | Vol1: 38/38 + Vol3: 13/13 + **Vol2: 0/18** |
| Codici licenza | 8 | valid-codes.js |

### Componenti per Volume (ESTRATTO DAL CODEBASE)

**Volume 1** (38 esperimenti, NIENTE Arduino):
- `battery9v`, `breadboard-half`, `resistor`, `led`, `rgb-led`
- `push-button`, `potentiometer`, `photo-resistor`, `capacitor`
- `buzzer-piezo`, `diode`, `reed-switch`, `multimeter`
- **13 tipi di componente** (senza Arduino, senza motor/servo/LCD)

**Volume 2** (18 esperimenti, NIENTE Arduino):
- Tutti quelli di Vol1 PLUS:
- `mosfet-n`, `phototransistor`, `motor-dc`, `breadboard-full`
- **17 tipi di componente**

**Volume 3** (13 esperimenti, CON Arduino):
- Tutti quelli di Vol2 PLUS:
- `nano-r4`, `servo`, `lcd-16x2`
- **20+ tipi di componente** (tutti i 21 SVG)

---

## FASI DA IMPLEMENTARE IN SESSIONE 31

### FASE 1: AUDIT VISIVO BRUTALE CON CHROME (Sprint 1)

> **OBBLIGO**: Usare Claude in Chrome per OGNI verifica. Nessuna assunzione.

#### 1A: Audit Sito Pubblico (https://funny-pika-3d1029.netlify.app)
- [ ] Screenshot OGNI pagina: index, chi-siamo, kit, corsi, corso, negozio, beta-test, login
- [ ] Verificare: responsive (mobile 375px + tablet 768px + desktop 1440px)
- [ ] Verificare: colori coerenti con palette ELAB
- [ ] Verificare: font (Roboto + Poppins per sito pubblico)
- [ ] Verificare: link rotti, immagini mancanti, broken layout
- [ ] Verificare: footer consistente su tutte le pagine
- [ ] Verificare: meta tags, OG tags, favicon

#### 1B: Audit ELAB Tutor (https://elab-builder.vercel.app)
- [ ] Login con account admin: `debug@test.com` / `Xk9#mL2!nR4`
- [ ] Screenshot: pagina login
- [ ] Screenshot: VetrinaSimulatore (pre-licenza)
- [ ] Screenshot: ExperimentPicker (selezione volume)
- [ ] Screenshot: simulatore con esperimento Vol1 caricato
- [ ] Screenshot: simulatore con esperimento Vol3 caricato (con Arduino)
- [ ] Screenshot: TutorSidebar (tutte le 9 tab)
- [ ] Screenshot: ChatOverlay (Galileo AI)
- [ ] Screenshot: Whiteboard V3
- [ ] Screenshot: TeacherDashboard (classi + toggle giochi)
- [ ] Screenshot: Mobile view (375px width)
- [ ] Verificare: 0 console errors (Chrome DevTools)
- [ ] Verificare: tutte le interazioni (click, drag, toggle)

#### 1C: Audit Componenti SVG vs PDF Volumi
Per ogni componente SVG nel simulatore:
- [ ] Aprire il PDF del volume corrispondente
- [ ] Confrontare visivamente il disegno SVG con l'illustrazione del libro
- [ ] Documentare discrepanze (proporzioni, colori, forma, pin posizioni)
- [ ] Score: 1-10 per fedeltà al libro

**Componenti da verificare** (21 SVG):
```
LED, RGB LED, Resistore, Condensatore, Diodo, MOSFET-N,
Pulsante, Potenziometro, Fotoresistore, Fototransistore,
Reed Switch, Buzzer Piezo, Motore DC, Servo,
Display LCD 16x2, Multimetro, Batteria 9V,
Arduino Nano R4, Breadboard, Breadboard Half, Fili
```

---

### FASE 2: FIX COMPONENTI SVG (Sprint 2)

Sulla base dell'audit della Fase 1, per OGNI componente che ha score < 8/10:

#### Per ogni componente:
1. **Leggere il file SVG** (.jsx in `src/components/simulator/components/`)
2. **Confrontare con PDF** del volume dove appare per la prima volta
3. **Frontend plugin**: usare skill `frontend-design` per ridisegnare il componente
4. **Vincoli da rispettare**:
   - Stesse dimensioni proporzionali del libro
   - Stessi colori (o piu belli, ma fedeli)
   - Pin nelle posizioni corrette (vedi pin map in MEMORY.md)
   - Griglia 7.5px rispettata
   - NanoBreakout: semicerchio LEFT, wing RIGHT, SULLA breadboard
5. **Screenshot post-fix** con Claude in Chrome per verificare

#### Componenti CRITICI (priorità alta):
- `NanoR4Board.jsx` — deve sembrare l'Arduino Nano R4 del libro Vol3
- `BreadboardHalf.jsx` / `BreadboardFull.jsx` — i fori devono essere allineati
- `Led.jsx` — forma a goccia, colore variabile, anodo/catodo chiari
- `Resistor.jsx` — bande colorate corrette per il valore

---

### FASE 3: VOLUME GATING — IL VOLUME SI ACCENDE SOLO CON LICENZA (Sprint 3)

> **Regola**: Se NON hai la licenza per un volume, quel volume NON si vede. Non è blurred, non è locked — NON ESISTE nella tua interfaccia.

#### 3A: ExperimentPicker — Filtrare volumi per licenza
File: `src/components/simulator/panels/ExperimentPicker.jsx`

Stato attuale: `hasVolumeAccess()` già implementata (line 40-43). I volumi locked mostrano un lucchetto.

**Cambio richiesto**: I volumi senza licenza devono SPARIRE completamente.
```javascript
// PRIMA (Session 30): mostra lucchetto
const locked = !hasVolumeAccess(volNum);
// se locked → card grigia con lucchetto

// DOPO (Session 31): non renderizzare
if (!hasVolumeAccess(volNum)) return null;
```

#### 3B: ComponentPalette — Solo componenti del volume selezionato
File: `src/components/simulator/panels/ComponentPalette.jsx` (o equivalente)

Usare `getComponentsByVolume(selectedVolume)` dal registry per mostrare SOLO i componenti disponibili per il volume corrente.

**Mappa componenti per volume** (VERIFICATA dal codebase):

| Componente | Vol1 | Vol2 | Vol3 |
|-----------|------|------|------|
| battery9v | ✅ | ✅ | ❌ (usa USB nano) |
| breadboard-half | ✅ | ✅ | ✅ |
| breadboard-full | ❌ | ✅ | ✅ |
| resistor | ✅ | ✅ | ✅ |
| led | ✅ | ✅ | ✅ |
| rgb-led | ✅ | ✅ | ❌ |
| push-button | ✅ | ✅ | ✅ |
| potentiometer | ✅ | ✅ | ✅ |
| photo-resistor | ✅ | ❌ | ❌ |
| capacitor | ✅ | ✅ | ❌ |
| buzzer-piezo | ✅ | ❌ | ❌ |
| diode | ✅ | ✅ | ❌ |
| reed-switch | ✅ | ❌ | ❌ |
| multimeter | ✅ | ✅ | ❌ |
| mosfet-n | ❌ | ✅ | ❌ |
| phototransistor | ❌ | ✅ | ❌ |
| motor-dc | ❌ | ✅ | ❌ |
| nano-r4 | ❌ | ❌ | ✅ |
| servo | ❌ | ❌ | ✅ |
| lcd-16x2 | ❌ | ❌ | ✅ |

> NOTA: Questa mappa deve essere VERIFICATA con Claude in Chrome guardando i PDF. Il registry ha `volumeAvailableFrom` ma potrebbe non essere aggiornato.

#### 3C: Sandbox mode — Stessi vincoli
Anche in modalità sandbox libero, i componenti disponibili sono SOLO quelli del volume selezionato. No "all access" in sandbox.

#### 3D: TutorSidebar — Nascondere esperimenti di volumi non licenziati
Il sidebar mostra solo capitoli/esperimenti del volume corrente. Se lo studente ha solo Vol1, non vede MAI un esperimento di Vol2 o Vol3.

---

### FASE 4: VETRINA + TUTOR UX PERFETTO (Sprint 4)

#### 4A: VetrinaSimulatore — Ri-aggiungere screenshots + frontend polish
File: `src/components/VetrinaSimulatore.jsx`

**Immagini ESISTENTI** (verificato):
- `/public/assets/breadboard/circuito-base.png`
- `/public/assets/breadboard/circuito-led.png`
- `/public/assets/breadboard/circuito-condensatore.jpg`
- `/public/assets/breadboard/circuito-modificato.png`

**Azione**: Ri-aggiungere galleria screenshot con le immagini reali. Usare `frontend-design` skill per rendere la vetrina visivamente perfetta.

**Requisiti vetrina**:
- Hero section con stats animati (69/21/53/3) — GIA OK
- Volume cards con colori corretti — GIA OK
- Screenshot gallery con immagini reali del simulatore
- License activation form — GIA OK
- CTA Amazon — GIA OK
- Design: Apple-quality, pulito, zero rumore visivo
- **OBBLIGO**: Screenshot finale con Claude in Chrome per verificare rendering

#### 4B: ELAB Tutor UX — Usability sweep
Usare Claude in Chrome per navigare TUTTO il flusso studente:
1. Login → VetrinaSimulatore → Attiva licenza
2. → Seleziona volume → Seleziona capitolo → Seleziona esperimento
3. → Simulatore: vedi circuito, drag componenti, avvia simulazione
4. → Tab: manuale, canvas, notebooks, media
5. → Giochi: CircuitDetective, POE, ReverseEngineering, CircuitReview
6. → Chat Galileo AI
7. → Lavagna V3 (disegna, seleziona, sposta, ridimensiona, cancella)

Per OGNI step:
- Screenshot prima e dopo
- Documentare: cosa funziona, cosa no, cosa e brutto
- Fix immediato se < 30 minuti
- Issue documentato se > 30 minuti

#### 4C: Frontend Design Skill — Rendere tutto BELLO
Usare `frontend-design` skill per:
- Migliorare transizioni e animazioni
- Rendere i colori più coerenti
- Migliorare spacing e layout
- Rendere il tutor "da manuale" — qualità Apple/Tinkercad

---

### FASE 5: AUDIT FINALE + DEPLOY (Sprint 5)

#### 5A: Build check
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build
```
- 0 errori OBBLIGATORIO
- Chunk sizes: ElabTutorV4 < 1100KB, AdminPage < 20KB

#### 5B: Console audit
```bash
grep -rn "console.log" src/ --include="*.jsx" --include="*.js" | grep -v "node_modules" | grep -v "logger.js" | grep -v "console.warn" | grep -v "console.error" | grep -v "isDev" | grep -v "//"
```
- 0 inappropriate console.log

#### 5C: Screenshot post-deploy con Chrome
- [ ] Homepage sito pubblico
- [ ] VetrinaSimulatore
- [ ] Login flow
- [ ] Simulatore Vol1 experiment
- [ ] Simulatore Vol3 experiment (Arduino)
- [ ] Mobile view (375px)

#### 5D: Deploy
```bash
# Vercel (ELAB Tutor)
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes

# Netlify (Sito Pubblico) — solo se modificato
cd "VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13
```

#### 5E: Report finale + MEMORY update
- Scrivere report in `sessioni/report/report-sessione31-finale.md`
- Aggiornare MEMORY.md con nuovi score e issues
- HONESTY NOTE: cosa e stato REALMENTE verificato vs cosa no

---

## CHAIN OF VERIFICATION (Checklist Session 31)

### Fase 1: Audit Visivo
- [ ] Screenshot TUTTE le 8 pagine del sito pubblico (3 viewport each = 24 screenshots)
- [ ] Screenshot login + vetrina + picker + simulatore + sidebar + chat + whiteboard + teacher + mobile = 9 screenshot tutor
- [ ] Screenshot OGNI componente SVG nel simulatore = 21 screenshot
- [ ] Confronto SVG vs PDF per OGNI componente = 21 confronti
- [ ] Score 1-10 per ogni componente SVG documentato

### Fase 2: Fix Componenti
- [ ] OGNI componente con score < 8 ridisegnato
- [ ] Screenshot post-fix per OGNI componente fixato
- [ ] Build check dopo ogni batch di fix (0 errori)

### Fase 3: Volume Gating
- [ ] Volumi senza licenza NON VISIBILI (non locked, invisibili)
- [ ] ComponentPalette mostra SOLO componenti del volume corrente
- [ ] Sandbox mode rispetta stesso vincolo
- [ ] Sidebar mostra solo esperimenti del volume corrente
- [ ] Test con account student (solo Vol1 licenza): Vol2 e Vol3 INVISIBILI
- [ ] Test con account admin: TUTTO visibile

### Fase 4: UX
- [ ] Screenshot VetrinaSimulatore con galleria immagini restaurata
- [ ] Flusso studente completo testato end-to-end con Chrome
- [ ] Frontend design skill applicata a VetrinaSimulatore
- [ ] Tutor UX verificato su desktop + mobile

### Fase 5: Finale
- [ ] `npm run build` → 0 errori
- [ ] 0 console.log inappropriate
- [ ] Deploy Vercel + Netlify
- [ ] Screenshot post-deploy
- [ ] Report finale + MEMORY update

---

## STRUTTURA PROGETTO

```
/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/
├── public/
│   ├── volumes/
│   │   ├── volume1.pdf         ← PDF Vol1 (per confronto SVG)
│   │   ├── volume2.pdf         ← PDF Vol2
│   │   └── volume3.pdf         ← PDF Vol3
│   └── assets/breadboard/
│       ├── circuito-base.png   ← Screenshot reale
│       ├── circuito-led.png    ← Screenshot reale
│       ├── circuito-condensatore.jpg ← Screenshot reale
│       └── circuito-modificato.png   ← Screenshot reale
├── src/
│   ├── data/
│   │   ├── experiments-vol1.js    ← 38 esperimenti (6,767 LOC)
│   │   ├── experiments-vol2.js    ← 18 esperimenti (3,115 LOC)
│   │   ├── experiments-vol3.js    ← 13 esperimenti (1,991 LOC)
│   │   └── experiments-index.js   ← Export + metadata
│   ├── components/
│   │   ├── VetrinaSimulatore.jsx  ← Vetrina (435 LOC) — DA MIGLIORARE
│   │   ├── simulator/
│   │   │   ├── NewElabSimulator.jsx ← Simulatore (~1,900 LOC)
│   │   │   ├── components/
│   │   │   │   ├── registry.js      ← getComponentsByVolume()
│   │   │   │   ├── Led.jsx          ← SVG LED
│   │   │   │   ├── Resistor.jsx     ← SVG Resistor
│   │   │   │   ├── NanoR4Board.jsx  ← SVG Arduino
│   │   │   │   └── ...(21 SVG total)
│   │   │   └── panels/
│   │   │       ├── ExperimentPicker.jsx ← Volume selection + gating
│   │   │       ├── ComponentPalette.jsx ← Component selection
│   │   │       └── WhiteboardOverlay.jsx ← V3 (828 LOC)
│   │   ├── tutor/
│   │   │   ├── ElabTutorV4.jsx      ← Main tutor container
│   │   │   ├── TutorSidebar.jsx     ← Game filtering
│   │   │   ├── ChatOverlay.jsx      ← Galileo AI
│   │   │   └── ...(24 files)
│   │   └── teacher/
│   │       └── TeacherDashboard.jsx ← Classi + Game toggles
│   └── services/
│       └── api.js                   ← n8n webhooks + 3-tier fallback
├── netlify/functions/
│   ├── utils/valid-codes.js         ← 8 codici licenza
│   ├── auth-activate-license.js     ← Attivazione licenza
│   └── auth-me.js                   ← Current user + activeLicenses
└── sessioni/
    ├── prompt/
    │   ├── prompt-sessione30.md     ← PRD precedente
    │   └── prompt-sessione31.md     ← QUESTO FILE
    └── report/
        ├── report-sessione30-finale.md
        ├── report-sessione30-sprint3.md
        └── report-sessione30-sprint4.md
```

---

## TEST ACCOUNTS

| Ruolo | Email | Password | RBAC | Licenze |
|-------|-------|----------|------|---------|
| Admin | `debug@test.com` | `Xk9#mL2!nR4` | Tutor + Area Docente + Admin | TUTTE |
| Teacher | `teacher@elab.test` | `Pw8&jF3@hT6!cZ1` | Tutor + Area Docente | Da attivare |
| Student | `student@elab.test` | `Ry5!kN7#dM2$wL9` | Solo Tutor | Da attivare |
| Admin | `marro.andrea96@gmail.com` | `Bz4@qW8!fJ3#xV6` | Tutor + Area Docente + Admin | TUTTE |

**Codici licenza per test**:
- `ELAB-VOL1-2026` → sblocca solo Vol1
- `ELAB-VOL2-2026` → sblocca solo Vol2
- `ELAB-VOL3-2026` → sblocca solo Vol3
- `ELAB-BUNDLE-ALL` → sblocca tutti

---

## DEPLOY

```bash
# Vercel (ELAB Tutor)
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes

# Netlify (Sito Pubblico) — solo se modificato
cd "VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13
```

---

## NOTE PER CLAUDE

1. **USA RALPH LOOP**: Ogni sprint = ciclo Ralph (plan → build → verify → deploy → report)
2. **Claude in Chrome OBBLIGATORIO**: OGNI fix deve essere verificato con screenshot. MAI assumere che "funziona" senza aver VISTO il risultato
3. **NON parallelizzare le fasi**: Sono SEQUENZIALI. Fase 1 (audit) → Fase 2 (fix) → Fase 3 (gating) → Fase 4 (UX) → Fase 5 (deploy). Non si può fixare senza prima aver auditato.
4. **Memory auto**: `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md` — contiene TUTTA la storia del progetto
5. **Pin map verificata** — usare SEMPRE i nomi pin da MEMORY.md
6. **NanoBreakout V1.1** — DEVE stare SULLA breadboard, semicerchio LEFT, ala RIGHT
7. **Griglia breadboard** — 7.5px pitch
8. **Font** — Oswald (display) + Open Sans (body) + Fira Code (code) per Tutor; Roboto + Poppins per Sito
9. **WCAG** — fontSize minimo 14px (eccezione: legal disclaimer)
10. **PDF VOLUMI disponibili** in `public/volumes/` — aprili per confrontare SVG
11. **Screenshots breadboard disponibili** in `public/assets/breadboard/` — 4 immagini reali
12. **frontend-design skill** — usala per rendere tutto bello, MA sempre verificare con screenshot
13. **0 console.log inappropriati** — regola inviolabile
14. **Build DEVE passare** — `npm run build` con 0 errori dopo OGNI sprint
