# SESSION 84 — RALPH LOOP: SIMULATORE PERFETTO
## iPad Perfection · Pin Validation · Scratch & Arduino · 3 Experiment Modes · Full Ralph Loop

---

## ═══ TASK ═══════════════════════════════════════════════════════════

Obiettivo: rendere il simulatore ELAB **realmente funzionante e facile da usare** su TUTTI i dispositivi (desktop, iPad, mobile), con validazione completa di OGNI singolo pin, collegamento, componente, drag & drop, e tutte le 3 modalità esperimento — usando il metodo **Ralph Loop** (test → fix → test → validate) iterativamente fino al raggiungimento della perfezione.

### Struttura del lavoro (Agile Sprints):

**SPRINT 1: FIX SIMULATORE CORE** (iPad + Desktop)
- Layout iPad portrait (768×1024): breadboard visibile, panels non sovrapposti
- Layout iPad landscape (1024×768 / 1180×820): breadboard piena, canvas ≥65%
- Drag & drop funzionante su touch (nessun ghost, snap corretto)
- Zoom/pan corretto con touch-action
- Wire mode: conferma fix V2, test su tutti i device

**SPRINT 2: PIN VALIDATION (69 esperimenti)**
- Per OGNI esperimento: verifica che TUTTI i pin si collegano correttamente
- Verify: fori breadboard corretti, componenti nelle posizioni giuste
- Test: "Già Montato" → circuito funziona, LED accesi, motori girano
- Test: "Passo Passo" → ogni step piazza il pezzo giusto nel foro giusto
- Test: "Monta Tu" → componenti dalla palette si possono piazzare e collegare

**SPRINT 3: SCRATCH & ARDUINO EDITOR**
- Scratch (Blockly): workspace non crasha, blocchi si trascinano, codice C++ generato
- Arduino (CodeMirror): syntax highlighting, compile funziona, errori mostrati
- Side-by-side layout: Blockly 60% + Code Preview 40% (responsive)
- Passo Passo code steps: XML si carica progressivamente

**SPRINT 4: RALPH LOOP VALIDATION**
- Ciclo test→fix→test→validate per OGNI Sprint
- Usa Chrome DevTools per ispezionare ogni elemento
- Screenshot PRIMA e DOPO ogni fix
- Documenta TUTTO nel report finale

---

## ═══ CONTEXT FILES ════════════════════════════════════════════════

### File Critici (LEGGERE ALL'INIZIO — Prompt Caching Candidates)

```
# Simulatore Core
src/components/simulator/NewElabSimulator.jsx          # Orchestratore principale (~3800 righe)
src/components/simulator/canvas/SimulatorCanvas.jsx    # Canvas SVG + wire mode + drag & drop (~2900 righe)
src/components/simulator/layout.module.css             # Layout responsive CSS modules

# Editor
src/components/simulator/panels/ScratchEditor.jsx      # Blockly workspace
src/components/simulator/panels/CodeEditorCM6.jsx      # CodeMirror 6 Arduino editor
src/components/simulator/panels/scratchBlocks.js       # 18 custom Arduino blocks
src/components/simulator/panels/scratchGenerator.js    # Blockly → C++ generator

# Engine
src/components/simulator/engine/CircuitSolver.js       # KVL/KCL circuit solver
src/components/simulator/engine/CollisionDetector.js   # Breadboard collision detection

# Esperimenti
src/data/experiments-vol1.js                           # Vol1: 23 esperimenti
src/data/experiments-vol2.js                           # Vol2: 32 esperimenti
src/data/experiments-vol3.js                           # Vol3: 14 esperimenti (AVR)
src/data/experiments-index.js                          # Index + findExperimentById

# AI / Tutor
src/components/tutor/ElabTutorV4.jsx                   # Galileo AI chat + actions (~2100 righe)
src/services/simulator-api.js                          # Public API per MCP/AI

# Stili
src/components/simulator/ElabSimulator.css             # Stili simulatore
src/components/tutor/ElabTutorV4.css                   # Stili tutor
src/styles/design-system.css                           # CSS vars centralizzati

# Componenti SVG (21 files)
src/components/simulator/components/*.jsx              # LED, Resistor, Battery, etc.
```

### File Audit Precedenti
```
.team-status/QUALITY-AUDIT-S83.md                     # Audit corrente
.team-status/SESSION-75-REPORT.md                      # Report estetica/iPad
```

---

## ═══ REFERENCE ════════════════════════════════════════════════════

### Scores Attuali (S83)
| Area | Score | Target S84 |
|------|-------|------------|
| Simulatore (funzionalità) | 9.8/10 | 10.0 |
| Simulatore (estetica) | 5.0/10 | 7.0 |
| Simulatore (iPad) | 3.0/10 | **8.0** |
| Scratch Universale | 9.0/10 | 9.5 |
| Responsive/A11y | 7.0/10 | 8.0 |

### Problemi Noti P0 (da risolvere in questa sessione)
- **iPad landscape (1180×820)**: breadboard microscopica, canvas schiacciato → INUTILIZZABILE
- **iPad portrait (768×1024)**: layout rotto, panels fuori schermo
- **Touch targets**: ShortcutsPanel 28px, toolbar buttons 32px
- **WCAG contrast**: lime #7CB342 (3.6:1), orange #E8941C (2.6:1), red #E54B3D (3.5:1)

### Palette Ufficiale ELAB
```
Navy: #1E4D8C    Lime: #7CB342     Background: #FAFAF7
Vol1: #7CB342    Vol2: #E8941C     Vol3: #E54B3D
Fonts: Oswald (display) + Open Sans (body) + Fira Code (mono)
```

### Architettura Wire Mode (post-fix V2)
```
wireModeExternal (parent) || wireModeInternal (canvas) = wireMode
OGNI punto di deattivazione resetta ENTRAMBI:
  onWireModeChange(false) + setWireModeInternal(false)
```

---

## ═══ SUCCESS BRIEF ════════════════════════════════════════════════

### Definizione di "Done" per Session 84:

1. ✅ **iPad Portrait (768×1024)**: breadboard occupa ≥60% dello schermo, tutti i componenti visibili, drag & drop funzionante, panels non sovrapposti
2. ✅ **iPad Landscape (1180×820)**: breadboard occupa ≥70% dello schermo, canvas grande, editor come slide-over
3. ✅ **Wire mode confermato**: su desktop + iPad, ON/OFF funziona, fili si collegano, ESC cancella
4. ✅ **Pin validation 69/69**: almeno 5 esperimenti per volume testati in Chrome DevTools con verifica circuito funzionante
5. ✅ **3 modalità testate**: Già Montato ✅, Passo Passo ✅, Monta Tu ✅ per almeno 3 esperimenti
6. ✅ **Scratch side-by-side**: Blockly + Code Preview non crashano, layout responsive funziona
7. ✅ **Build**: 0 errori, 0 regressioni
8. ✅ **Deploy**: Vercel production confermato funzionante

### KPI Quantitativi
- iPad score: 3.0 → **≥ 7.5**
- Estetica score: 5.0 → **≥ 6.5**
- Esperimenti verificati: **≥ 15** (5 per volume)
- Regressioni introdotte: **0**

---

## ═══ RULES ═════════════════════════════════════════════════════════

### Regole INVIOLABILI

1. **NESSUNA modifica a sorgente dati**: `experiments-vol1/2/3.js` contengono dati verificati col libro. NON toccare le posizioni dei componenti, i pin, i fori breadboard.

2. **CSS-first**: Ogni fix di layout DEVE usare CSS (CSS modules o file .css esistenti). VIETATI stili inline per layout/responsive. Inline styles solo per valori dinamici calcolati a runtime.

3. **Chain of Verification (CoV)**: Dopo OGNI fix:
   - Build (`npm run build`)
   - Se possibile, screenshot Chrome DevTools per verificare
   - Confronta PRIMA e DOPO

4. **No Regressions**: Prima di modificare un file, verifica che il comportamento corrente funzioni. Se funziona → solo MIGLIORA, mai ROMPI.

5. **Breakpoints ELAB**:
   - Mobile Portrait: < 600px
   - Mobile Landscape: 600-767px
   - iPad Portrait: 768-1023px
   - iPad Landscape: 1024-1365px
   - Desktop: 1366-1439px
   - Wide: 1440px+

6. **Touch target WCAG**: Ogni elemento interattivo ≥ 44×44px

7. **Font minimum**: 14px per tutto il testo leggibile (eccezioni: watermark, PDF export, annotation canvas)

8. **Dual-state wire mode**: SEMPRE resettare ENTRAMBI `onWireModeChange(false)` E `setWireModeInternal(false)` in ogni punto di deattivazione.

9. **Scratch lazy-loading**: ScratchEditor DEVE restare in `React.lazy()` + `Suspense`. NON importare Blockly nel bundle principale.

10. **Commit solo quando richiesto**: NON fare commit automatici. Solo su richiesta esplicita.

---

## ═══ CONVERSATION STYLE ═══════════════════════════════════════════

### Metodo di Lavoro: Ralph Loop Iterativo

```
RALPH LOOP = while (issues.length > 0) {
  1. TEST   → Ispeziona con Chrome DevTools / Playwright
  2. FIND   → Identifica issue specifico (file, riga, causa)
  3. FIX    → Applica correzione minimale
  4. BUILD  → npm run build (deve passare)
  5. VERIFY → Re-ispeziona lo stesso punto
  6. LOG    → Documenta: cosa era rotto, cosa è stato fatto, risultato
}
```

### Organizzazione Agile
- Lavora per Sprint (vedi sezione TASK)
- Ogni Sprint ha obiettivi chiari e verificabili
- Alla fine di ogni Sprint: mini-audit con score aggiornato
- Se un Sprint si blocca → passa al prossimo, torna dopo

### Tool Usage Intensivo
- **Chrome DevTools / Playwright**: Usa per ispezionare layout su iPad (768×1024, 1024×768, 1180×820)
- **Read/Grep**: Per trovare codice specifico
- **Edit**: Per fix chirurgici (preferire edit piccoli a riscritture)
- **Bash (build)**: Dopo ogni batch di fix
- **Task agents**: Per ricerche parallele su codebase
- **Programmatic tool calling**: Usa il tool sequencing per operazioni complesse

### Output Style
- Breve e diretto. Non spiegare COSA è un CSS module — mostra il codice.
- Ogni fix: 1 riga di contesto → codice → 1 riga di risultato
- Score card aggiornata a fine sessione
- Report salvato in `.team-status/`

---

## ═══ PLAN ══════════════════════════════════════════════════════════

### Fase 0: Setup & Baseline (5 min)
- Leggi `NewElabSimulator.jsx`, `SimulatorCanvas.jsx`, `layout.module.css`
- Apri simulatore in Chrome a 768×1024 e 1180×820
- Screenshot baseline stato attuale
- Identifica top-5 issues visivi

### Fase 1: iPad Layout Fix (Sprint 1)
1. Fix `layout.module.css` per iPad Portrait (768-1023px):
   - Canvas SVG: `width: 100%`, `height: auto`, `min-height: 60vh`
   - Code editor panel: slide-over da destra con `position: fixed`
   - ComponentDrawer: overlay che non schiaccia il canvas
2. Fix per iPad Landscape (1024-1365px):
   - Canvas: ≥65% width
   - Editor: clamp(200px, 22vw, 300px) max-width: 35%
3. Verifica touch events: `touch-action: none` su canvas SVG
4. Build + verify su tutti i breakpoints

### Fase 2: Pin & Wire Validation (Sprint 2)
1. Carica 5 esperimenti Vol1 → "Già Montato" → verifica circuito funziona
2. Carica 5 esperimenti Vol2 → idem
3. Carica 5 esperimenti Vol3 → idem + Scratch tab presente
4. Test wire mode: collega 2 componenti, verifica ON/OFF/ESC
5. Test drag & drop: sposta componente, verifica snap a griglia

### Fase 3: Editor Perfection (Sprint 3)
1. Arduino: apri editor → syntax highlight → compile → errori mostrati
2. Scratch: apri Blockly → trascina blocco → C++ generato → compile
3. Side-by-side responsive: verifica su desktop + iPad
4. Passo Passo: verifica code steps si caricano progressivamente

### Fase 4: 3 Modalità (Sprint 4)
1. **Già Montato**: seleziona esperimento → circuito pre-montato → play → funziona
2. **Passo Passo**: step 1 → avanti → step 2 → ... → circuito completo → play
3. **Monta Tu**: palette visibile → drag componente → piazza → collega → play
4. Verifica su almeno 3 esperimenti (1 per volume)

### Fase 5: Final Ralph Loop & Report
1. Re-test top-10 issues della sessione
2. Build finale (0 errori)
3. Deploy Vercel
4. Score card aggiornata
5. Report salvato in `.team-status/SESSION-84-REPORT.md`

---

## ═══ ALIGNMENT ════════════════════════════════════════════════════

### Chi è l'utente?
Andrea Marro — autore di ELAB Tutor, simulatore educativo per bambini (scuola primaria/media). Il prodotto è IN PRODUZIONE su https://www.elabtutor.school. Ogni bug può impattare studenti reali.

### Cosa conta davvero?
1. **Funziona su iPad** — la maggior parte delle scuole italiane usa iPad
2. **Ogni pin si collega** — i bambini si frustrano se un filo "non funziona"
3. **Zero crash** — Blockly crashava → fix S83, mai più
4. **Bello da usare** — colori coerenti, touch facile, feedback immediato

### Cosa NON fare?
- Non riscrivere da zero — il simulatore ha 69 esperimenti funzionanti
- Non cambiare la palette senza permesso — è collegata al brand ELAB
- Non ottimizzare prematuramente il bundle — la priorità è l'iPad
- Non toccare nanobot/AI — Galileo funziona 10/10 (S74)

### Metriche di successo
Il successo si misura in:
- **iPad usabile**: un bambino di 10 anni con un iPad può completare un esperimento senza aiuto
- **Pin 100%**: ogni collegamento documentato nel libro funziona nel simulatore
- **Zero regressioni**: ciò che funzionava prima funziona ancora

---

*Mega-prompt Session 84 — Andrea Marro / Claude — 07/03/2026*
*Struttura: Task · Context Files · Reference · Success Brief · Rules · Conversation · Plan · Alignment*
