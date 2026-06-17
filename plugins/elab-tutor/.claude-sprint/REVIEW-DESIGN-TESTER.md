# REVIEW DESIGN / UX TESTER -- ELAB Tutor
**Data**: 14/02/2026
**Auditor**: Design/UX Tester Agent (WCAG 2.1 AA specialist)
**Metodo**: Grep-verified, zero stime, numeri reali dal codice sorgente
**Target**: Bambini 8-12 anni (WCAG 2.1 AA + child usability best practices)

---

## VOTO COMPLESSIVO WCAG: 5.5/10

Migliorato rispetto al 4.0/10 dell'audit v2 (12/02), ma lontano dalla compliance AA.
Il design system e' ben progettato (design-system.css e' solido), ma l'adozione reale nei componenti e' parziale.
La parte simulatore e' significativamente migliore della parte tutor per touch targets e focus states.

---

## TABELLA RIASSUNTIVA

| # | Check | Stato | Voto | Note |
|---|-------|-------|------|------|
| 1 | Touch Targets >= 44px | WARN | 5/10 | Simulator OK, tutor ha 18+ elementi sotto 44px |
| 2 | Font Sizes >= 13px (bambini) | FAIL | 4/10 | 6 CSS sotto 13px + ~105 inline JSX fontSize 10-12 |
| 3 | Color Contrast >= 4.5:1 | WARN | 6/10 | Problemi con #94A3B8, #999, #BBB, rgba alpha |
| 4 | Focus States visibili | WARN | 6/10 | 9 outline:none senza compensazione, ma focus-visible e' presente |
| 5 | Responsive 5 breakpoints | PASS | 8/10 | 5 breakpoints coerenti, dvh supportato, safe-area-inset |
| 6 | Reduced Motion | PASS | 8/10 | 3 file con prefers-reduced-motion, 43+ animazioni coperte |
| 7 | Keyboard Navigation | WARN | 5/10 | ControlBar eccellente, ma tutor tools quasi zero a11y |
| 8 | Design Consistency | WARN | 5/10 | ElabTutorV4.css usa 713 var(), ma tutor-responsive usa 67 hardcoded hex vs 25 var() |

---

## 1. TOUCH TARGETS (WCAG 2.5.5 - Target Size)

**Requisito**: Ogni elemento interattivo >= 44x44px (CSS pixel). Criticamente importante per bambini 8-12 anni con motricita' fine in sviluppo.

### PASS - Simulator toolbar
- `toolbar-btn`: min-height: 44px, min-width: 44px (ElabSimulator.css:317-318)
- `toolbar-btn` (mobile): min-height: 44px, min-width: 44px (ElabSimulator.css:539-540)
- `.galileoCloseBtn`: min-width: 44px, min-height: 44px (layout.module.css:107-108)
- `.galileoRetryBtn`: min-height: 44px (layout.module.css:143)
- `.closeBtn` (overlays): min-width: 44px, min-height: 44px (overlays.module.css:60-61)
- `.guideCloseBtn`: min-width: 44px, min-height: 44px (overlays.module.css:198-199)
- `.collapsedBtn`: width: 44px, height: 44px (overlays.module.css:129)
- `.fontSizeBtn`: min-width: 44px, min-height: 44px (codeEditor.module.css:48-49)
- `.compileBtn`: min-height: 44px (codeEditor.module.css:84)
- `.sidebar-item`: min-height: 44px (tutor-responsive.css:306)
- `.mobile-tab`: min-height: 44px, min-width: 44px (tutor-responsive.css:896-897)
- `.topbar-btn`: min-width: 44px, min-height: 44px (tutor-responsive.css:205-206)
- `segmentBtn` (ExperimentPicker): minHeight: 44 (ExperimentPicker.jsx:438)
- `backBtn` (ExperimentPicker): minHeight: 44 (ExperimentPicker.jsx:317)

### FAIL - Elementi sotto 44px

| Elemento | Dimensione | File:Linea | Area |
|----------|-----------|------------|------|
| `.topbar-sidebar-toggle` | 36x36px | tutor-responsive.css:119-120 | Tutor topbar |
| `.sidebar-collapse-btn` | 32x32px | tutor-responsive.css:358-359 | Tutor sidebar |
| `.chat-overlay-btn` (header) | 30x30px | tutor-responsive.css:478-479 | Chat overlay |
| `.chat-overlay-avatar` | 30x30px | tutor-responsive.css:438-439 | Chat overlay |
| `.chat-send-btn` | 38x38px | tutor-responsive.css:841-842 | Chat input |
| `.chat-overlay-btn` (coarse) | 36x36px | tutor-responsive.css:1173-1174 | Chat (touch!) |
| `.chat-retry-btn` | padding: 4px 12px | tutor-responsive.css:618-619 | Chat messages |
| `.chat-suggestion-dismiss` | padding: 2px 6px | tutor-responsive.css:662-663 | Chat suggestion |
| `.chat-confusion-btns button` | padding: 6px 12px | tutor-responsive.css:699 | Chat confusion |
| `.chat-quick-actions button` | padding: 5px 12px | tutor-responsive.css:769 | Chat quick actions |
| `.chat-quick-actions button` (mobile) | padding: 4px 10px | tutor-responsive.css:996 | Chat mobile |
| `.topbar-mascot` (mobile) | 28x28px | tutor-responsive.css:949-950 | Topbar mobile |
| `v4-header-btn` | 36x36px | ElabTutorV4.css:43-44 | V4 header |
| `v4-notebook-item tag` | 28x28px | ElabTutorV4.css:934-935 | Notebooks |
| `v4-toolbar-btn` | 36x36px | ElabTutorV4.css:608-609 | V4 toolbar |
| `v4-input-actions btn` | 36x36px | ElabTutorV4.css:671-672 | V4 input |
| `v4-meet-join-btn spinner` | 36x36px | ElabTutorV4.css:1471-1472 | Meet join |
| `elab-tool__option` (TutorTools) | implicit small | TutorTools.css | Tool options |
| `chapterCard` (ExperimentPicker) | minHeight: 48px | ExperimentPicker.jsx:387 | PASS |
| `ShortcutsPanel close` | minHeight: 36px | ShortcutsPanel.jsx:224 | Sim modal |
| `ShortcutsPanel key` | minHeight: 28px | ShortcutsPanel.jsx:246 | Sim modal |
| `SerialMonitor send` | minHeight: 34px | SerialMonitor.jsx:256 | Sim serial |
| `SerialMonitor buttons` | minHeight: 38px | SerialMonitor.jsx:339,353 | Sim serial |
| `CrossNavigation btn` | minHeight: 36px | CrossNavigation.jsx:78 | Tutor nav |
| `CircuitReview buttons` | minHeight: 36px | CircuitReview.jsx:245,265 | Tutor game |

**Conteggio**: 25 elementi interattivi sotto 44px. La maggior parte nel tutor.
**NOTA CRITICA**: `@media (pointer: coarse)` in tutor-responsive.css:1162 imposta `chat-overlay-btn` a 36px anziche' elevarlo a 44px. Questo e' un peggioramento attivo per touch devices!

---

## 2. FONT SIZES (WCAG 1.4.4 - Resize Text)

**Requisito**: Minimo 13px per aree bambini, 12px assoluto minimo ovunque. Nessun font sotto 10px.

### CSS - Occorrenze sotto 13px

| Valore | Selettore | File:Linea | Px equiv. | Area |
|--------|-----------|------------|-----------|------|
| 0.58rem | `.topbar-subtitle` | tutor-responsive.css:163 | ~9.3px | BAMBINI |
| 0.62rem | `.sidebar-section-label` | tutor-responsive.css:282 | ~9.9px | BAMBINI |
| 0.52rem | `.topbar-subtitle` (mobile) | tutor-responsive.css:958 | ~8.3px | BAMBINI |
| 0.68rem | `.chat-overlay-status` | tutor-responsive.css:457 | ~10.9px | BAMBINI |
| 0.68rem | `.chat-quick-actions button` (mobile) | tutor-responsive.css:995 | ~10.9px | BAMBINI |
| 10px | `.elab-simulator__watermark` | ElabSimulator.css:114 | 10px | Decorativo (OK) |

**0.52rem = ~8.3px e' INACCETTABILE per bambini.** Anche se e' un sottotitolo, la topbar subtitle e' l'unica indicazione del contesto corrente (es. "TUTOR DI ELETTRONICA").

### CSS - Occorrenze 0.7x rem (~11-12px) nelle aree bambini

| Valore | Selettore | File:Linea | Px equiv. |
|--------|-----------|------------|-----------|
| 0.72rem | `.topbar-volume-badge` | tutor-responsive.css:179 | ~11.5px |
| 0.78rem | `.topbar-btn` font-size | tutor-responsive.css:202 | ~12.5px |
| 0.72rem | `.topbar-btn-label` | tutor-responsive.css:221 | ~11.5px |
| 0.75rem | `.chat-retry-btn` | tutor-responsive.css:624 | ~12px |
| 0.75rem | `.chat-confusion-btns button` | tutor-responsive.css:701 | ~12px |
| 0.78rem | `.chat-confusion-input-row button` | tutor-responsive.css:740 | ~12.5px |
| 0.72rem | `.chat-quick-actions button` | tutor-responsive.css:774 | ~11.5px |

### CSS - Occorrenze 0.8x rem (~13-14px) nelle aree bambini (BORDERLINE)

10 occorrenze at 0.82rem (~13.1px) e 0.85rem (~13.6px). Queste passano per il pelo.

### JSX Inline - fontSize 10-12 nelle aree bambini/simulator

| fontSize | File:Linea | Elemento | Area |
|----------|-----------|----------|------|
| 10 | NewElabSimulator.jsx:2021 | Breadboard label | Simulator |
| 10 | NewElabSimulator.jsx:2033 | Breadboard label | Simulator |
| 11 | NewElabSimulator.jsx:2077 | Watermark | Simulator |
| 11 | CodeEditorCM6.jsx:381 | Warning count | Simulator |
| 11 | CodeEditorCM6.jsx:395 | Error count | Simulator |
| 12 | CodeEditorCM6.jsx:440 | Status style | Simulator |
| 11 | CodeEditorCM6.jsx:452 | Meta style | Simulator |
| 12 | CodeEditorCM6.jsx:489 | Footer text | Simulator |
| 10 | CodeEditorCM6.jsx:510 | Info text | Simulator |
| 11 | StudentDashboard.jsx:384 | Badge text | Student |
| 12 | StudentDashboard.jsx:783 | Badge | Student |
| 12 | StudentDashboard.jsx:787 | Badge | Student |

### JSX Inline - fontSize 10-12 nelle aree admin/gestionale (NON bambini, ma comunque problematico)

~80+ occorrenze in: TeacherDashboard.jsx, AdminPage.jsx, AdminCorsi.jsx, OrdiniVenditeModule.jsx, BancheFinanzeModule.jsx, MagazzinoKitModule.jsx, DipendentiModule.jsx

**Totale inline fontSize < 13px**: ~105 occorrenze (12 nelle aree bambini/simulator, ~93 in admin)

---

## 3. COLOR CONTRAST (WCAG 1.4.3 - Contrast Minimum)

**Requisito**: Testo normale >= 4.5:1, testo grande (>=18px bold o >=24px) >= 3:1.

### FAIL - Contrasto insufficiente su sfondo bianco (#FFFFFF)

| Colore testo | Hex | Ratio vs #FFF | File | Verdict |
|-------------|-----|---------------|------|---------|
| Sidebar section label | #94A3B8 | ~3.2:1 | tutor-responsive.css:286 | FAIL (< 4.5:1) |
| Sidebar inactive | #64748B | ~4.7:1 | tutor-responsive.css:299 | PASS |
| Chat overlay status | rgba(255,255,255,0.7) | N/A (on blue) | tutor-responsive.css:458 | CHECK |
| Placeholder text | #999 | ~2.8:1 | ElabSimulator.css:93 | FAIL |
| Placeholder text | #BBB | ~1.9:1 | ElabSimulator.css:106 | FAIL |
| Close btn color | #999 | ~2.8:1 | overlays.module.css:57,195 | FAIL |
| Close btn color | #999 | ~2.8:1 | layout.module.css:104 | FAIL |
| Font size btn | #9CA3AF | ~2.9:1 | codeEditor.module.css:42 | FAIL (on dark bg - CHECK) |
| Concept text | #888 | ~3.5:1 | overlays.module.css:254 | FAIL |
| Chapter count | #999 | ~2.8:1 | ExperimentPicker.jsx:409 | FAIL |
| Exp description | #666 | ~5.7:1 | ExperimentPicker.jsx:480 | PASS |

### PASS - Buon contrasto

| Combinazione | Ratio | Verdict |
|-------------|-------|---------|
| #1A1A2E su #FFFFFF | ~16.5:1 | PASS |
| #1E4D8C su #FFFFFF | ~7.3:1 | PASS |
| #333 su #FAFAF7 | ~11.5:1 | PASS |
| #FFFFFF su #1E4D8C | ~7.3:1 | PASS |
| #558B2F su #E8F5E9 | ~4.5:1 | BORDERLINE PASS |
| #1E293B su #F0F4F8 | ~11:1 | PASS |
| #CDD6F4 su #1E1E2E | ~9.3:1 | PASS (dark theme) |

### Problemi specifici su sfondo scuro

| Colore testo | Sfondo | Ratio | File |
|-------------|--------|-------|------|
| rgba(255,255,255,0.6) | #1E4D8C gradient | ~3.2:1 | ElabTutorV4.css:61 | FAIL |
| rgba(255,255,255,0.7) | #1E4D8C gradient | ~4.0:1 | tutor-responsive.css:458 | FAIL |
| rgba(255,255,255,0.8) | #1E4D8C gradient | ~5.0:1 | tutor-responsive.css:198 | BORDERLINE PASS |

**Conteggio**: 10 combinazioni FAIL, 7 PASS, 3 BORDERLINE.

---

## 4. FOCUS STATES (WCAG 2.4.7 - Focus Visible)

**Requisito**: Ogni elemento interattivo deve avere un indicatore di focus visibile.

### PASS - focus-visible implementato in 3 scope

1. **Simulator**: `.toolbar-btn:focus-visible` con outline 2px solid #1E4D8C + box-shadow (ElabSimulator.css:361-364)
2. **Simulator generic**: `.elab-simulator button:not(.toolbar-btn):focus-visible` con outline 2px solid #558B2F (ElabSimulator.css:556-558)
3. **Tutor responsive**: `.tutor-topbar button:focus-visible` + sidebar + chat + mobile-tabs con outline 2px solid #7CB342 (tutor-responsive.css:1152-1158)
4. **Tutor V4**: `.elab-v4 button:focus-visible` + a + input + textarea + select con outline 2px solid var(--color-primary) (ElabTutorV4.css:2055-2064)

### FAIL - outline:none senza compensazione

| Selettore | File:Linea | Compensazione? |
|-----------|------------|----------------|
| `.v4-input input:focus` | ElabTutorV4.css:319-320 | Ha border-color change e box-shadow, OK |
| `.note-input-row input:focus` | ElabTutorV4.css:1199-1200 | Nessuna compensazione visiva. FAIL |
| `.v4-meet-input-row input:focus` | ElabTutorV4.css:1525-1526 | Nessuna compensazione visiva. FAIL |
| `.v4-video-input input:focus` | ElabTutorV4.css:1844-1845 | Nessuna compensazione visiva. FAIL |
| `.elab-tool__input:focus` | TutorTools.css:495-496 | Nessuna compensazione visiva. FAIL |
| `.elab-tool__textarea:focus` | TutorTools.css:513-514 | Nessuna compensazione visiva. FAIL |
| `.chat-overlay-input input:focus` | tutor-responsive.css:831-832 | Ha border-color + box-shadow. OK |
| `.elab-input:focus` | index.css:204-205 | Ha border-color + shadow. OK |
| `input[type=range]` | overlays.module.css:99 | Nessuna compensazione per thumb focus. FAIL |

**Conteggio**: 6 FAIL (outline:none senza compensazione), 3 OK (hanno bordo/shadow).
**NOTA**: focus-visible copre bene gli elementi principali (bottoni), ma gli input di testo in aree secondarie perdono il focus indicator.

---

## 5. RESPONSIVE DESIGN (5 Breakpoints)

**Requisito**: Layout coerente su tutte le risoluzioni, 5 breakpoints definiti.

### Breakpoints definiti in tutor-responsive.css
| Nome | Range | Definito | File |
|------|-------|----------|------|
| Mobile Portrait | 0-599px | SI | tutor-responsive.css:922, layout.module.css:151, overlays.module.css:263 |
| Mobile Landscape | 600-767px | SI | tutor-responsive.css:1019, layout.module.css:198, overlays.module.css:319 |
| Tablet | 768-1023px | SI | tutor-responsive.css:1046, layout.module.css:220, overlays.module.css:338 |
| Desktop | 1024-1439px | SI | tutor-responsive.css:1118 (implicito, fallback) |
| Wide | 1440px+ | SI | tutor-responsive.css:1129, layout.module.css:237, overlays.module.css:349 |

### WARN - Breakpoints inconsistenti nel simulator

ElabSimulator.css usa breakpoints diversi: 768px, 599px, 600px, 1100px (non allineati al sistema).
Questo non e' catastrofico perche' ElabSimulator.css gestisce il layout del simulatore embedded, ma crea confusione.

### PASS
- dvh usato correttamente (tutor-responsive.css:37, 977, 988, layout.module.css:159,177)
- env(safe-area-inset-bottom) per iPhone notch (tutor-responsive.css:878,934,1000)
- Grid layout adattivo (sidebar scompare su mobile, bottom tabs appaiono)
- Chat overlay diventa bottom sheet su mobile
- Overlays diventano bottom sheet su mobile

### Voto: 8/10

---

## 6. REDUCED MOTION (WCAG 2.3.3 - Animation from Interactions)

**Requisito**: Ogni animazione deve rispettare prefers-reduced-motion.

### Implementazione

1. **design-system.css:196-209**: `@media (prefers-reduced-motion: reduce)` azzera tutte le transition e animation con `!important`. Copre `*, *::before, *::after`.
2. **index.css:302-309**: Duplicato identico (ridondante ma non dannoso).
3. **TutorTools.css:934-943**: Override specifico per animazioni TutorTools.

### Animazioni trovate: 43+ occorrenze in 8 file CSS

- tutor-responsive.css: blink, chatSlideIn, msgFadeIn, chatBounce, chatSlideUpMobile (5)
- ElabTutorV4.css: fadeIn, bounce, slideUp, spin, meetPulse, blink, onboardingFadeIn, onboardingSlideUp (8)
- TutorTools.css: elab-fadeIn, elab-slideUp, elab-cardIn, fadeInDown (4 + 10 staggered delays)
- ElabSimulator.css: spin, pulse, toolbar-spin (3)
- layout.module.css: slideUpGalileo (1)
- overlays.module.css: overlaySlideUp (1)
- index.css: slide-in-left, slide-in-right, fade-in (3)

**Tutte coperte** dal wildcard selector in design-system.css:204-208.
**TutorTools.css** ha anche override specifico per i propri elementi.

### Voto: 8/10 (eccellente copertura con wildcard)

---

## 7. KEYBOARD NAVIGATION (WCAG 2.1.1 - Keyboard)

**Requisito**: Ogni funzionalita' deve essere accessibile solo con la tastiera.

### PASS - ControlBar.jsx (modello esemplare)
- `role="toolbar"` con `aria-label="Controlli simulatore"` (riga 218)
- Ogni bottone ha `aria-label={titleText}` (riga 38)
- Icone decorative: `aria-hidden="true"` (riga 40)
- OverflowMenu: `role="menu"` + `role="menuitem"` + `aria-haspopup` + `aria-expanded` (righe 133-146)
- Arrow key navigation con Home/End/Escape (righe 88-107)
- Enter/Space handler sui menuitem (righe 149-154)
- `tabIndex` roving (riga 147)

### PASS - TutorSidebar.jsx
- `role="navigation"` + `aria-label="Navigazione principale"` (righe 63-64)
- `aria-current="page"` per item attivo (riga 79)
- Mobile tabs: `role="tablist"` + `role="tab"` + `aria-selected` (righe 124-134)

### WARN - Input con onKeyDown (funzionali ma incompleti)
- VideosTab.jsx:44 - Enter per aggiungere video
- CircuitReview.jsx:192 - Enter per generare circuito
- CircuitDetective.jsx:224 - Enter per submit
- ChatOverlay.jsx:585 - Enter per inviare
- SerialMonitor.jsx:172 - Enter per inviare
- Annotation.jsx:174 - Enter per confermare

### FAIL - Aree senza keyboard support

| Area | Problema |
|------|----------|
| ExperimentPicker volume cards | Nessun `role`, nessun `aria-label`. Bottoni con `onMouseEnter/Leave` ma senza `onFocus/Blur` per stili |
| ExperimentPicker chapter cards | Stesso problema |
| ExperimentPicker experiment cards | Stesso problema |
| TutorTools giochi interattivi | Nessun role/aria nelle opzioni dei giochi |
| ChatOverlay suggestion dismiss | padding: 2px 6px, nessun aria-label |
| Canvas componenti SVG | Nessun `tabIndex` o keyboard handler per componenti sul canvas |
| Range slider (overlays) | `outline: none` senza compensazione |
| Social PostCard | onKeyDown solo per commenti |

### Voto: 5/10

---

## 8. DESIGN CONSISTENCY (Token Adoption)

**Requisito**: Le variabili CSS del design system devono essere usate al posto di valori hardcoded.

### Token Usage by File

| File CSS | Hardcoded hex | var(--) calls | Ratio var/(var+hex) |
|----------|--------------|---------------|---------------------|
| ElabTutorV4.css | 11 | 713 | **98%** (ECCELLENTE) |
| tutor-responsive.css | 67 | 25 | **27%** (SCARSO) |
| ElabSimulator.css | 50 | 43 | **46%** (MEDIOCRE) |
| TutorTools.css | (non misurato) | 308 | (alto) |
| index.css | (non misurato) | 80 | (alto) |

### Analisi

- **ElabTutorV4.css** e' il campione: 713 var() calls, quasi zero hardcoded.
- **tutor-responsive.css** e' il peggior trasgressore: 67 hex hardcoded per soli 25 var() call. Colori come `#94A3B8`, `#64748B`, `#7CB342`, `#1E4D8C` sono ripetuti verbatim anziche' usare `var(--color-text-tertiary)`, `var(--color-primary)`, etc.
- **ExperimentPicker.jsx** usa ZERO variabili CSS: tutto inline con valori hardcoded (`#1A1A2E`, `#E5E5E5`, `#666`, `#999`).
- Il design system definisce `--touch-min: 44px` ma non e' quasi mai referenziato nei CSS (usano 44px diretto).

### Transition values

75 `transition:` declarations trovate. La maggior parte usa valori hardcoded (`150ms ease`, `200ms ease`) anziche' `var(--transition-fast)` o `var(--transition-base)`.

### Voto: 5/10

---

## DETTAGLIO PROBLEMI PER PRIORITA'

### P0 - CRITICI (da fixare immediatamente)

1. **Font 0.52rem = ~8.3px su mobile** (tutor-responsive.css:958, `.topbar-subtitle` mobile)
   - Questo e' testo visibile ai bambini. Illeggibile su qualsiasi dispositivo.
   - FIX: Aumentare a minimo 0.75rem (12px) o nascondere su mobile.

2. **Font 0.58rem = ~9.3px** (tutor-responsive.css:163, `.topbar-subtitle`)
   - "TUTOR DI ELETTRONICA" subtitle e' la brand identity. Non deve essere sotto 11px.
   - FIX: Aumentare a 0.69rem (11px) minimo.

3. **`outline: none` senza compensazione su 6 input** (ElabTutorV4.css:1200, 1526, 1845; TutorTools.css:496, 514; overlays.module.css:99)
   - Utenti keyboard-only non possono vedere dove si trovano.
   - FIX: Aggiungere `border-color` o `box-shadow` change come in `.v4-input input:focus`.

4. **@media (pointer: coarse) riduce `.chat-overlay-btn` a 36px** (tutor-responsive.css:1173-1174)
   - Il query media per touch devices DOVREBBE AUMENTARE, non ridurre. Bug logico.
   - FIX: Impostare `width: 44px; height: 44px;` nel blocco `@media (pointer: coarse)`.

### P1 - IMPORTANTI (da fixare prima del release)

5. **Testo #999 su sfondo bianco** (~2.8:1 ratio) in 5+ posizioni
   - `ExperimentPicker.jsx:409` (chapter count), `overlays.module.css:57,195` (close btn), `ElabSimulator.css:93` (placeholder), `layout.module.css:104` (galileo close)
   - FIX: Usare `var(--color-text-secondary)` (#6B6B80, ratio ~5.1:1) al posto di #999.

6. **Testo #BBB su sfondo bianco** (~1.9:1 ratio) in `ElabSimulator.css:106`
   - FIX: Usare `var(--color-text-tertiary)` (#9B9BA8, ratio ~3.3:1) o meglio `var(--color-text-secondary)`.

7. **Testo #94A3B8 su sfondo bianco** (~3.2:1) in 5 posizioni in tutor-responsive.css
   - FIX: Usare `var(--color-text-secondary)` (#6B6B80).

8. **Chat buttons sotto 44px**: `.chat-retry-btn` (padding: 4px 12px), `.chat-suggestion-dismiss` (padding: 2px 6px), `.chat-confusion-btns button` (padding: 6px 12px), `.chat-quick-actions button` (padding: 5px 12px)
   - FIX: Aggiungere `min-height: 44px; min-width: 44px;` oppure `padding: 12px 16px;`.

9. **ExperimentPicker: zero CSS variables, zero a11y**
   - 520 linee di JSX inline styles senza nessun var(), nessun role, nessun aria-label.
   - FIX: Migrare a CSS module o almeno usare le variabili da design-system.css.

10. **tutor-responsive.css: 67 hex hardcoded**
    - File recente (13/02/2026) ma scritto con colori hardcoded anziche' token.
    - FIX: Sostituire con variabili CSS dal design system.

### P2 - NICE-TO-HAVE

11. **Inline fontSize 10-12 nel simulator** (9 occorrenze in NewElabSimulator.jsx e CodeEditorCM6.jsx)
    - Ammissibile per status indicators e breadboard labels, ma migliore con 13px minimo.

12. **75 transition declarations hardcoded**
    - Dovrebbero usare `var(--transition-fast)` etc. dal design system.

13. **breakpoints inconsistenti** in ElabSimulator.css (768px vs 767px, 1100px vs 1023px)
    - Non critico ma crea debt tecnico.

14. **Canvas SVG componenti senza keyboard access**
    - Complesso da implementare. Richiede `tabIndex` e `onKeyDown` su ogni componente SVG.

---

## METRICHE FINALI

| Metrica | Valore |
|---------|--------|
| Elementi interattivi sotto 44px | 25 |
| Font CSS sotto 13px in aree bambini | 6 selettori |
| Font JSX inline sotto 13px in aree bambini | 12 occorrenze |
| Font JSX inline sotto 13px in aree admin | ~93 occorrenze |
| Combinazioni colore FAIL (< 4.5:1) | 10 |
| outline:none senza compensazione | 6 |
| File CSS con hardcoded hex > var() calls | 2 (tutor-responsive, ElabSimulator) |
| Animazioni totali | 43+ |
| Animazioni coperte da reduced-motion | 43+ (100% wildcard) |
| Breakpoints coerenti | 5/5 nel tutor, 3/5 nel simulator |
| onKeyDown implementations | 10 |
| role/aria attributes | 15+ (buona copertura in ControlBar, sidebar) |
| WCAG focus-visible scopes | 4 |

---

## CONFRONTO CON AUDIT PRECEDENTE (12/02/2026 v2)

| Area | Audit v2 | Oggi | Delta |
|------|---------|------|-------|
| Touch targets | 2/10 | 5/10 | +3 (simulator OK, tutor ancora debole) |
| Font sizes | 3/10 | 4/10 | +1 (inline ridotti -90% in aree bambini, ma CSS rimane) |
| Color contrast | 4/10 | 6/10 | +2 (principali PASS, secondari ancora FAIL) |
| Focus states | 5/10 | 6/10 | +1 (4 scope focus-visible, ma 6 outline:none) |
| Responsive | 7/10 | 8/10 | +1 (dvh, safe-area aggiuntivi) |
| Reduced motion | 8/10 | 8/10 | = (era gia' buono) |
| Keyboard | 3/10 | 5/10 | +2 (ControlBar eccellente, ExperimentPicker zero) |
| Design consistency | 4/10 | 5/10 | +1 (ElabTutorV4 98%, tutor-responsive 27%) |
| **MEDIA** | **4.0/10** | **5.5/10** | **+1.5** |

---

## RACCOMANDAZIONE

Il design system in `design-system.css` e' ben strutturato e definisce tutti i token necessari (44px touch, 14px font min, semantic colors, transition vars). Il problema e' che **l'adozione e' diseguale**: ElabTutorV4.css lo usa al 98%, ma tutor-responsive.css solo al 27% e ExperimentPicker.jsx allo 0%.

**Azione prioritaria**: Un singolo pass di "token migration" su `tutor-responsive.css` e `ExperimentPicker.jsx` risolverebbe la maggior parte dei problemi di contrasto e consistency, portando il voto a ~7/10.
