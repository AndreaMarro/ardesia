# PDR — DESIGN EXCELLENCE
## Piano Di Riferimento per portare ELAB a livello di prodotto premium
**Data**: 02/04/2026 | **Score attuale**: 8.6/10 | **Target**: 9.5/10

---

## COME ESEGUIRE QUESTO PDR IN UNA NUOVA SESSIONE

Copia e incolla questa stringa:

```
Leggi COMPLETAMENTE questi file PRIMA di qualsiasi azione, nell'ordine esatto:
1. CLAUDE.md — contesto progetto, stack tecnico, regole immutabili
2. docs/plans/PDR-DESIGN-EXCELLENCE.md — QUESTO FILE, il piano completo
3. docs/plans/2026-04-01-lavagna-redesign.md — architettura Strangler Fig, layout lavagna
4. docs/prompts/ANDREA-VISION-COMPLETE.md — la visione di Andrea (Principio Zero, UNLIM ovunque, estetica)
5. docs/prompts/LAVAGNA-FINAL-REPORT.md — stato attuale con numeri reali
6. docs/prompts/LAVAGNA-CURRENT-STATE.md — stato tecnico corrente

Poi verifica:
- npm run build (DEVE passare)
- npx vitest run (1053+ test DEVONO passare)
- Naviga a #lavagna nel browser e fai screenshot baseline

Poi esegui il PDR sessione per sessione (S1→S8). Ogni sessione ha 3 aspetti.
Usa /elab-quality-gate e /lavagna-benchmark a 1/3, 1/2, e fine sessione.
ZERO REGRESSIONI. Score senza screenshot = 0.
```

---

## CONTESTO PROGETTO

### Cos'e ELAB
Tutor educativo per elettronica e Arduino per bambini 8-14 anni. Include simulatore di circuiti proprietario (CircuitSolver + AVRBridge + avr8js), chat AI "UNLIM" (tutor pedagogico), 62 esperimenti in 3 volumi, editor Arduino C++ e Scratch blocks.

### Stack
React 19 + Vite 7 | Deploy Vercel | Backend AI: n8n su Hostinger | CPU emulation: avr8js

### File Critici (da NON toccare)
```
src/components/simulator/engine/CircuitSolver.js (1702 LOC) — INTOCCABILE
src/components/simulator/engine/AVRBridge.js (1051 LOC) — INTOCCABILE
src/components/simulator/engine/SimulationManager.js (302 LOC) — INTOCCABILE
src/components/simulator/engine/avrWorker.js (348 LOC) — INTOCCABILE
src/components/simulator/NewElabSimulator.jsx (1900 LOC) — NON modificare
src/components/unlim/* (11 file, 2430 LOC) — solo wrappare, mai modificare
```

### Architettura Lavagna (Strangler Fig)
`#tutor` fa redirect a `#lavagna`. La lavagna e in `src/components/lavagna/` (24 file). Il vecchio codice in `src/components/tutor/` resta come dead code. TUTTO il nuovo codice va in `src/components/lavagna/`.

### File Lavagna Esistenti (da S1-S8 + PDR S1)
```
src/components/lavagna/
  AppHeader.jsx + .module.css          — Header 48px glassmorphism
  ExperimentPicker.jsx + .module.css   — Modal 3 volumi, 62 esperimenti
  FloatingToolbar.jsx + .module.css    — 6 strumenti flottanti
  FloatingWindow.jsx + .module.css     — Finestra drag/resize (usata per UNLIM)
  GalileoAdapter.jsx + .module.css     — UNLIM wrappato in FloatingWindow
  LavagnaShell.jsx + .module.css       — Shell principale (assembla tutto)
  LavagnaStateManager.js               — State machine 5 stati
  MascotPresence.jsx + .module.css     — Mascotte ELAB visibile (PDR S1 — DA VERIFICARE)
  RetractablePanel.jsx + .module.css   — Pannello slide-in 3 direzioni
  UnlimBar.jsx + .module.css           — Input UNLIM sempre visibile (PDR S1 — DA VERIFICARE)
  useGalileoChat.js                    — Hook chat Galileo
  VetrinaV2.jsx + .module.css          — Landing page pre-login
  VideoFloat.jsx + .module.css         — YouTube + videocorsi
```

### Palette Colori
- Navy: #1E4D8C (brand, header, primary)
- Lime: #4A7A25 (Volume 1, accento, successo)
- Orange: #E8941C (Volume 2)
- Red: #E54B3D (Volume 3)
- Muted: #737373 (testo secondario)
- BG: #F0F4F8 / #F8FAFB (sfondo)
- Text: #1A1A2E (testo principale)
- Border: #E2E8F0

### Font
- Display: Oswald (titoli, UPPERCASE, bold)
- Body: Open Sans (testo, 14-16px)
- Code: Fira Code (monospace, editor)

### Riferimenti Visivi Obbligatori
- **ELAB Tres Jolie**: cartella con foto scatole, volumi, logo, rendering. Il tutor digitale DEVE sembrare parte dello stesso prodotto.
- **Mascotte**: robottino con cuffie e cacciavite verde. File: `/assets/mascot/logo-senza-sfondo.png`
- **Colori volume**: devono corrispondere ai volumi fisici (Lime=Vol1, Orange=Vol2, Red=Vol3)

### Metriche Attuali
- Build: PASS | Test: 1053 | Precache: 33 entries ~3969KB
- Console errors: 0
- Viewport testate: desktop 1280x800, LIM 1024x768, iPad 768x1024, Chromebook 1366x768, mobile 375x812
- Score ONESTO: 8.6/10

### La Visione di Andrea (MEMORIZZA)
1. **Principio Zero**: il docente arriva alla LIM e insegna IMMEDIATAMENTE
2. **UNLIM Ovunque**: non un pannello chat isolato, ma l'intelligenza interconnessa a TUTTO
3. **Riconoscibilita > Stilizzazione**: icone che un bambino di 10 anni riconosce, non linee astratte
4. **Kit + Volumi + Tutor = Unico Prodotto**: estetica coerente con i volumi fisici
5. **YouTube deve funzionare davvero**: video reali, non placeholder
6. **La mascotte e sempre presente**: non nascosta in un bottone
7. **Input UNLIM sempre visibile**: come ChatGPT, la barra e sempre li
8. **Overlay cognitivo ZERO**: max 3 azioni visibili, il resto e progressive disclosure
9. **Adattabilita perfetta**: LIM, iPad, PC — tutto deve essere bello e funzionante

### PDR S1 Parzialmente Completato
- Dot pattern canvas: AGGIUNTO (CSS in LavagnaShell.module.css)
- MascotPresence.jsx: CREATO (da verificare nel browser)
- UnlimBar.jsx: CREATO (da verificare nel browser)
- Entrambi wired in LavagnaShell.jsx
- Build + test NON ancora verificati (timeout durante il tentativo)

---

## AUTOCRITICA BRUTALE — Cosa c'e che non va ADESSO

Guardando gli screenshot reali della lavagna su desktop/LIM/iPad, ecco i problemi ONESTI:

### Problemi Gravi (impatto sull'insegnante)
1. **UNLIM e un bottone isolato** — un bottoncino verde "UNLIM" scollegato dal resto. L'insegnante non capisce cosa fa. Deve essere integrato OVUNQUE: nella guida, nei suggerimenti, nelle transizioni.
2. **Due pannelli laterali competono** — componenti a sinistra + percorso lezione a destra = schermo diviso in 3. Su LIM 1024x768 il circuito e schiacciato al centro.
3. **Le icone nel pannello componenti sono stilizzate/astratte** — un prof non riconosce un potenziometro dall'icona. Devono essere PIU REALISTICHE, come foto semplificate.
4. **Il Percorso Lezione occupa troppo spazio** — su LIM prende ~300px a destra. Il docente non legge tutto quel testo durante la lezione. Serve un design piu compatto.
5. **Nessun riferimento visivo ai volumi fisici** — il tutor digitale non richiama lo stile dei volumi stampati. Manca il brand ELAB "Tres Jolie".
6. **La toolbar flottante copre il circuito** — su LIM la toolbar e sopra la breadboard, nasconde i fori in basso.
7. **YouTube non funziona davvero** — i videoId nel catalogo sono placeholder. Le thumbnail non caricano.

### Problemi Medi (impatto sulla percezione di qualita)
8. **Header troppo tecnico** — "ELAB | Lavagna | Cap. 6 Esp. 1" sembra un'app da sviluppatore, non un prodotto per docenti.
9. **Nessuna mascotte visibile** — la mascotte ELAB (robottino) dovrebbe essere PRESENTE sulla lavagna, non nascosta dentro UNLIM.
10. **Le card esperimenti nel picker sono generiche** — mancano icone di capitolo, indicatori di difficolta, stima tempo.
11. **Mobile 375px inutilizzabile** — il percorso lezione copre tutto. Non e un target primario ma non deve rompere.
12. **Glassmorphism inconsistente** — l'header ha blur ma il picker no. La FloatingWindow UNLIM no.

### Problemi Minori (polish)
13. **Animazioni non coerenti** — il picker ha fade-in ma i pannelli laterali non hanno animazione visibile.
14. **Font sizing inconsistente tra pannelli** — componenti usa 13px, percorso lezione usa 14px, header usa 14px.
15. **Nessun feedback sonoro** — click su componenti, play simulazione, errori: tutto silenzioso.
16. **Dot pattern canvas mancante** — lo sfondo del canvas e piatto. Un pattern puntinato darebbe il senso di "lavagna" (come Excalidraw/Figma).

---

## PRINCIPI DI DESIGN (Non Negoziabili)

### 1. Principio Zero
L'insegnante arriva alla LIM e insegna IMMEDIATAMENTE. Zero configurazione, zero tutorial, zero click inutili.

### 2. UNLIM Ovunque
UNLIM non e un pannello chat. E l'INTELLIGENZA del sistema. Deve essere interconnesso a TUTTO:
- Suggerisce il prossimo step nella guida
- Commenta gli errori nel circuito (inline, non in chat)
- Offre quiz contestuali durante la lezione
- Suggerisce video quando l'argomento lo richiede
- La mascotte e VISIBILE sulla lavagna, non nascosta

### 3. Riconoscibilita > Stilizzazione
Le icone devono essere RICONOSCIBILI a un ragazzino di 10 anni e a un prof di 55 anni:
- LED = disegno di un LED reale (dome + gambe)
- Resistore = corpo cilindrico con bande colorate
- Pulsante = bottone a pressione realistico
- Potenziometro = manopola con dial
- Arduino = la board reale semplificata
- NON linee astratte, NON icone Feather generic

### 4. Brand ELAB Tres Jolie
Il tutor digitale DEVE sembrare parte dello stesso prodotto dei volumi fisici:
- Colori: Lime #4A7A25, Orange #E8941C, Red #E54B3D, Navy #1E4D8C
- Font: Oswald per titoli, Open Sans per corpo
- La mascotte robottino ELAB visibile
- Card e contenitori con lo stile arrotondato dei volumi
- Palette calda, professionale ma accogliente

### 5. Adattabilita Perfetta
Deve funzionare BENE su tutti e 3:
- **LIM 1024x768**: il caso d'uso principale. Tutto leggibile, nulla tagliato, touch 48px
- **iPad 768x1024 / 1024x768**: touch-first, landscape e portrait
- **PC 1280x800+**: mouse + tastiera, hover effects

### 6. Overlay Cognitivo ZERO
Il docente non deve MAI pensare "dove clicco?". L'interfaccia si spiega da sola:
- Max 3 azioni visibili in ogni momento
- Progressive disclosure: mostra solo quando serve
- UNLIM suggerisce, non l'interfaccia

---

## 16 ASPETTI DEL PDR

### ASPETTO 1: Mascotte ELAB Visibile (Score attuale: 2/10 → Target: 9/10)
**Problema**: La mascotte e nascosta dentro il bottone UNLIM. Non c'e presenza visiva.
**Soluzione**: La mascotte appare come avatar piccolo (40x40) nell'angolo basso-destro della lavagna. Quando UNLIM parla, la mascotte si anima brevemente. Quando il docente e inattivo >30s, la mascotte "guarda" il circuito. Click sulla mascotte = apre UNLIM.
**File**: `src/components/lavagna/MascotPresence.jsx` + `.module.css`
**Riferimento visivo**: La mascotte dei volumi ELAB (robottino con cuffie e cacciavite)
**Test**: screenshot con mascotte visibile su LIM + iPad + desktop

### ASPETTO 2: UNLIM Interconnesso Ovunque (Score: 3/10 → Target: 9/10)
**Problema**: UNLIM e un pannello chat isolato. Non interagisce con gli altri elementi.
**Soluzione**:
- Il Percorso Lezione ha un bottone "Chiedi a UNLIM" su ogni step
- Gli errori del simulatore (es. LED senza resistore) mostrano un tooltip "UNLIM puo aiutarti" accanto all'errore
- Il Picker esperimenti ha una sezione "UNLIM consiglia" che suggerisce il prossimo esperimento
- La barra input UNLIM e SEMPRE visibile in basso (non solo quando la finestra e aperta)
**File**: modifiche a `ExperimentPicker.jsx`, `LavagnaShell.jsx`, CSS overlay errors
**Test**: click "Chiedi a UNLIM" dal percorso lezione → UNLIM risponde contestualmente

### ASPETTO 3: Icone Componenti Realistiche (Score: 4/10 → Target: 9/10)
**Problema**: Le icone nel pannello componenti sono linee astratte (Feather-style). Un bambino non riconosce un potenziometro.
**Soluzione**: Sostituire le icone SVG stilizzate con mini-preview realistiche dei componenti SVG gia presenti nel simulatore (Led.jsx, Resistor.jsx, etc.). Usare gli STESSI SVG renderizzati in miniatura (24x24).
**File**: `src/components/lavagna/LavagnaShell.jsx` — QUICK_COMPONENTS array
**Riferimento**: Tinkercad usa preview realistiche. I volumi ELAB hanno foto dei componenti reali.
**Test**: screenshot pannello componenti → ogni icona deve essere riconoscibile senza label

### ASPETTO 4: Percorso Lezione Compatto (Score: 5/10 → Target: 9/10)
**Problema**: Il Percorso Lezione a destra occupa ~300px e ha troppo testo. Su LIM strizza il circuito.
**Soluzione**:
- Il Percorso Lezione diventa una barra compatta IN BASSO (sotto il circuito, sopra la toolbar)
- Mostra solo lo step corrente: "[1/5] PREPARA — Non dare il resistore subito"
- Click su "espandi" mostra il dettaglio completo come popover
- Libera completamente il lato destro per UNLIM
**File**: `src/components/lavagna/LessonBar.jsx` + `.module.css`
**Riferimento**: Brilliant.org — progress bar minima con step corrente
**Test**: LIM 1024x768 — il circuito occupa almeno 70% della larghezza

### ASPETTO 5: Header Umano (Score: 6/10 → Target: 9/10)
**Problema**: "ELAB | Lavagna | Cap. 6 Esp. 1 — Accendi i..." sembra tecnico.
**Soluzione**:
- Rinomina "Lavagna" → nessuna label (e ovvio che sei sulla lavagna)
- Il nome esperimento diventa piu leggibile: "Accendi il tuo primo LED" (senza "Cap. 6 Esp. 1")
- Progress dots piu grandi (12px, non 8px) con colori volume
- Play button con label "Avvia" non solo icona
**File**: `src/components/lavagna/AppHeader.jsx` + `.module.css`
**Test**: un prof di 55 anni capisce al volo cosa c'e scritto nell'header

### ASPETTO 6: Glassmorphism Coerente (Score: 5/10 → Target: 9/10)
**Problema**: Solo l'header ha glassmorphism. Il picker, UNLIM, la toolbar sono opachi.
**Soluzione**: Applicare lo stesso trattamento glassmorphism a:
- ExperimentPicker modal (backdrop blur)
- FloatingWindow UNLIM (title bar con blur)
- FloatingToolbar (gia ha blur ma piu sottile)
- Percorso Lezione compatto (barra con blur)
**Palette glassmorphism ELAB**: `background: rgba(255,255,255,0.85)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255,255,255,0.2)`
**File**: tutti i `.module.css` lavagna
**Test**: screenshot con tutti gli elementi glassmorphism visibili

### ASPETTO 7: Dot Pattern Canvas (Score: 0/10 → Target: 8/10)
**Problema**: Lo sfondo del canvas e piatto. Non da il senso di "lavagna/workspace".
**Soluzione**: CSS background pattern puntinato sottilissimo (come Excalidraw/Figma):
```css
.canvas { background-image: radial-gradient(circle, #d0d0d0 1px, transparent 1px); background-size: 20px 20px; }
```
**File**: `src/components/lavagna/LavagnaShell.module.css`
**Test**: screenshot — il pattern e visibile ma NON distrae dal circuito

### ASPETTO 8: Toolbar Posizionamento Intelligente (Score: 6/10 → Target: 9/10)
**Problema**: La toolbar copre il circuito in basso su LIM.
**Soluzione**: La toolbar si posiziona a SINISTRA del canvas (verticale) quando il pannello componenti e chiuso. Quando il pannello componenti e aperto, la toolbar va in basso. Auto-reposition.
**File**: `src/components/lavagna/FloatingToolbar.jsx` + `.module.css`
**Test**: LIM 1024x768 — nessun elemento copre il circuito

### ASPETTO 9: Card Esperimenti Premium (Score: 6/10 → Target: 9/10)
**Problema**: Le card nel picker sono generiche — titolo + descrizione. Mancano metadati utili.
**Soluzione**: Ogni card mostra:
- Icona capitolo realistica (LED, resistore, pulsante...)
- Difficolta (1-3 stelline)
- Tempo stimato ("5 min")
- Numero componenti necessari
- Badge "NUOVO" per esperimenti non ancora provati
**File**: `src/components/lavagna/ExperimentPicker.jsx` + `.module.css`
**Test**: le card comunicano informazione utile al docente senza leggere la descrizione

### ASPETTO 10: Animazioni Coerenti (Score: 4/10 → Target: 9/10)
**Problema**: Il picker ha animazione ma i pannelli no. Inconsistente.
**Soluzione**: Sistema di animazione unificato:
- `--ease-out: cubic-bezier(0.4, 0, 0.2, 1)` per tutte le transizioni
- `--duration-fast: 150ms` per hover/active
- `--duration-normal: 300ms` per apertura/chiusura pannelli
- `--duration-slow: 500ms` per modali
- Micro-animazioni: bottoni scale 0.95 al click, card lift al hover
**File**: variabili in `design-system.css`, applicazione in tutti i `.module.css` lavagna
**Test**: le transizioni sono percepibili ma non rallentano l'uso

### ASPETTO 11: Responsive LIM/iPad/PC Perfetto (Score: 7/10 → Target: 9.5/10)
**Problema**: Su LIM il percorso lezione stringe il circuito. Su iPad portrait il layout non e ottimale.
**Soluzione**:
- **LIM 1024x768**: percorso lezione compatto IN BASSO, pannello componenti collassato di default, UNLIM minimizzato, circuito 100% larghezza
- **iPad 768x1024 portrait**: layout stacked — circuito in alto, percorso lezione + input UNLIM in basso
- **iPad 1024x768 landscape**: come LIM
- **PC 1280x800+**: layout completo con pannelli laterali
**File**: media queries in tutti i `.module.css` lavagna
**Test**: screenshot su tutte e 5 le viewport. Nessun overflow, nessun testo tagliato.

### ASPETTO 12: YouTube Funzionante (Score: 3/10 → Target: 8/10)
**Problema**: I videoId nel catalogo curato sono placeholder. Le thumbnail non caricano.
**Soluzione**:
- Popolare il catalogo con videoId REALI di video YouTube educativi sull'elettronica per bambini
- Almeno 10 video curati: 3 per LED/resistori, 3 per Arduino, 2 per Scratch, 2 per breadboard
- Thumbnail caricano da `img.youtube.com/vi/{id}/mqdefault.jpg`
**File**: `src/data/unlim-videos.js` o catalogo curato in VideoFloat
**Test**: aprire video float → thumbnail visibili → click → video riproduce

### ASPETTO 13: Font Sizing Consistente (Score: 6/10 → Target: 10/10)
**Problema**: 13px nei componenti, 14px nel percorso lezione, misto nell'header.
**Soluzione**: Sistema tipografico rigido:
- `--text-xs: 12px` (solo etichette minime, NON su LIM)
- `--text-sm: 14px` (body piccolo, descrizioni)
- `--text-base: 16px` (body principale, input)
- `--text-lg: 18px` (titoli sezione)
- `--text-xl: 24px` (titoli pagina)
- Su LIM: min-font-size forzato a 14px per tutto
**File**: `design-system.css` + override nei `.module.css`
**Test**: preview_inspect font-size su OGNI elemento testo. Zero sotto 14px su LIM.

### ASPETTO 14: Feedback Sonoro Leggero (Score: 0/10 → Target: 7/10)
**Problema**: L'app e completamente silenziosa. Non c'e feedback percettivo.
**Soluzione**: Suoni sottili tramite Web Audio (gia in gamificationService.js):
- Click componente: "tick" leggero
- Play simulazione: breve "woosh"
- Errore circuito: "buzz" discreto
- Esperimento completato: fanfara breve
- TUTTI disattivabili con toggle "Suoni" nell'header
**File**: estendere `gamificationService.js`, aggiungere trigger in LavagnaShell
**Test**: suono si sente al click play. Toggle mute funziona.

### ASPETTO 15: Brand ELAB Tres Jolie (Score: 4/10 → Target: 9/10)
**Problema**: Il tutor digitale non richiama lo stile dei volumi fisici.
**Soluzione**:
- Logo ELAB nell'header come SVG (non testo "ELAB")
- Colori volume usati come accenti nei pannelli (non solo nel picker)
- Card con angoli arrotondati 16px come le scatole ELAB
- Gradients sottili che richiamano i volumi (Lime→limeLight, Orange→orangeLight)
- La mascotte robottino come elemento visivo ricorrente
**File**: AppHeader (logo SVG), tutti i CSS (border-radius, gradients)
**Riferimento**: Cartella `ELAB - TRES JOLIE/LOGO/` e `RENDERING SCATOLE/`
**Test**: confronto visivo screenshot lavagna vs foto scatole ELAB

### ASPETTO 16: Barra Input UNLIM Sempre Visibile (Score: 3/10 → Target: 9/10)
**Problema**: Per parlare con UNLIM devi aprire la FloatingWindow. Non e immediato.
**Soluzione**: Barra input UNLIM SEMPRE visibile in basso al centro (sotto il circuito, come ChatGPT):
```
┌──────────────────────────────────────────┐
│ [mascotte] Chiedi a UNLIM...    🎤 📷 ➤ │
└──────────────────────────────────────────┘
```
- Sempre presente (anche quando la finestra chat e chiusa)
- Click → la risposta appare come tooltip/popover contestuale
- Microfono per voice input
- Camera per screenshot del circuito + domanda
**File**: `src/components/lavagna/UnlimBar.jsx` + `.module.css`
**Test**: la barra e visibile su LIM/iPad/PC. Click → UNLIM risponde.

---

## PIANO SESSIONI (8 sessioni, 3 audit ciascuna)

| # | Focus | Aspetti | Target Score |
|---|-------|---------|-------------|
| S1 | Mascotte + UNLIM Bar + Dot Pattern | 1, 16, 7 | 8.8 |
| S2 | UNLIM Interconnesso + Icone Realistiche | 2, 3 | 9.0 |
| S3 | Percorso Lezione Compatto + Header Umano | 4, 5 | 9.1 |
| S4 | Glassmorphism Coerente + Animazioni | 6, 10 | 9.2 |
| S5 | Responsive LIM/iPad/PC Perfetto | 11, 8 | 9.3 |
| S6 | Card Premium + YouTube Reale | 9, 12 | 9.4 |
| S7 | Font + Suoni + Brand Tres Jolie | 13, 14, 15 | 9.5 |
| S8 | Stress Test Totale + Deploy | tutti | 9.5 verificato |

---

## BENCHMARK PER OGNI SESSIONE

### Gate Bloccanti (DEVONO essere PASS)
- Build PASS, 1053+ test, 33 precache, 0 console errors
- #tutor INTATTO (o redirect a lavagna funzionante)
- Nessuna regressione su simulatore/engine/UNLIM

### Score Design (0-10 per aspetto, media pesata)
- Screenshot su 3 viewport (LIM 1024x768, iPad 768x1024, Desktop 1280x800)
- Confronto visivo con ELAB Tres Jolie
- Test "Prof.ssa Rossi 55 anni" con /impersonatore-utente
- 3 agenti CoV a fine sessione — score = MINIMO dei 3

### Regola Anti-Inflazione
- Score senza screenshot = 0
- Score senza test browser reale = 0
- Self-score > evidenze + 1.0 → RIFIUTATO

---

## RIFERIMENTI VISIVI

### Prodotti da emulare (per qualita percepita)
- **PhET Simulations**: 98% workspace, floating controls come strumenti fisici
- **Brilliant.org**: progress bar minima, step-by-step, linguaggio chiaro
- **tldraw**: dot pattern, toolbar flottante minima, zero chrome
- **Canva**: card premium, hover lift, transizioni fluide
- **Claude.ai**: input bar sempre visibile, risposta inline, minimalismo

### Prodotti ELAB (il brand da richiamare)
- Cartella `ELAB - TRES JOLIE/`: scatole, volumi, logo, rendering
- Colori: Lime per Vol1, Orange per Vol2, Red per Vol3, Navy per brand
- Mascotte: robottino con cuffie e cacciavite verde
- Stile: professionale ma accogliente, angoli arrotondati, ombre morbide

### Anti-pattern (cosa NON fare)
- NON dashboard stile admin (tabelle, sidebar fissa, menu complessi)
- NON chatbot generico (finestra chat fissa con scroll infinito)
- NON sito web tradizionale (pagine, navigazione, breadcrumb)
- NON dark mode di default (LIM e proiettori lavano i colori scuri)
- NON icone astratte che richiedono di leggere il label

---

## REGOLE TECNICHE

```
ZERO REGRESSIONI: 1053+ test, build PASS, 0 console errors
ENGINE INTOCCABILE: CircuitSolver, AVRBridge, SimulationManager, avrWorker
UNLIM INTOCCABILE: i file core (UnlimWrapper, UnlimInputBar, etc.) — solo wrapping
PALETTE: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D
FONT: Oswald display, Open Sans body, Fira Code mono
TOUCH: min 48px target, pointer events
CSS MODULES: tutto il nuovo codice
STRANGLER FIG: file nuovi in src/components/lavagna/, nessun file esistente toccato
GIT COMMIT: dopo ogni task completato
```
