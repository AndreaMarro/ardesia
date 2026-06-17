# ELAB Lavagna — Master Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform ELAB from a 9-page website into a single-shell "digital whiteboard" (Lavagna) with floating windows, retractable panels, and touch-first design — with ZERO regressions.

**Architecture:** Strangler Fig pattern. New route `#lavagna` grows alongside existing `#tutor`. All new code in `src/components/lavagna/`. Existing components are wrapped (never modified) in new containers. Switch at Session 8.

**Tech Stack:** React 19, CSS Modules, pointer events (touch-first), CSS transitions (no external animation libs), existing ELAB design system (Navy/Lime/Orange/Red palette, Oswald/OpenSans/FiraCode fonts).

**Design Document:** `docs/plans/2026-04-01-lavagna-redesign.md`

---

## BENCHMARK SEVERO — "La Lavagna e Pronta?"

Ogni audit (a 1/3, 1/2, e fine sessione) valuta queste 15 metriche. Score 0-10 per ognuna.

### Metriche Funzionali (bloccanti — DEVONO essere >= 7)
| # | Metrica | Come si misura | Target |
|---|---------|----------------|--------|
| F1 | Build PASS | `npm run build` senza errori | PASS |
| F2 | Test PASS | `npx vitest run` — 1001+ test | PASS |
| F3 | Precache stabile | 33 entries ~5000KB | +-200KB |
| F4 | Zero console errors | `preview_console_logs` level=error | 0 |
| F5 | #tutor intatto | Navigare a #tutor, verificare tutto funziona | IDENTICO |

### Metriche UX (target >= 7 a fine sessione, >= 9 a fine piano)
| # | Metrica | Come si misura | Target |
|---|---------|----------------|--------|
| U1 | Chrome ratio | Screenshot #lavagna, misurare % canvas vs chrome | >= 90% |
| U2 | Touch targets | `preview_inspect` su ogni bottone, min 48px | 100% >= 48px |
| U3 | LIM readability | `preview_resize` 1024x768, screenshot, font leggibili | Tutto leggibile |
| U4 | iPad touch | Playwright touch simulation su pannelli/floating | Funzionante |
| U5 | Coerenza visiva | Screenshot header+panels+picker, stessa palette/font | Uniforme |

### Metriche Design (target >= 7)
| # | Metrica | Come si misura | Target |
|---|---------|----------------|--------|
| D1 | FloatingWindow drag | Playwright: drag finestra, verificare posizione | Funziona |
| D2 | FloatingWindow resize | Playwright: resize angoli, verificare dimensioni | Funziona |
| D3 | Pannelli animati | Screenshot prima/dopo, transizione smooth | 300ms ease |
| D4 | Glassmorphism header | Screenshot, blur visibile, semi-trasparente | Visibile |
| D5 | Palette ELAB | Grep per colori hardcoded non-palette | 0 violazioni |

### Formula Score Sessione
```
Score = (F1-F5 tutti PASS ? 1 : 0) × media(U1-U5, D1-D5)
Se F1-F5 non tutti PASS → Score = 0 (sessione fallita)
```

### Protocollo Audit (eseguito 3 volte per sessione)

```
AUDIT @ 1/3 sessione (dopo task 2-3):
  1. npm run build && npx vitest run
  2. /elab-quality-gate
  3. preview_start → preview_screenshot (lavagna attuale)
  4. preview_resize 1024x768 → preview_screenshot (LIM)
  5. preview_console_logs level=error
  6. Navigare a #tutor → preview_screenshot (deve essere IDENTICO)
  7. Score card con 15 metriche

AUDIT @ 1/2 sessione (dopo task 4-5):
  1-7 come sopra +
  8. Playwright: click/drag test su FloatingWindow (se esiste)
  9. Playwright: touch simulation su iPad viewport
  10. 3 agenti paralleli: a11y, visual consistency, performance

AUDIT @ fine sessione:
  1-10 come sopra +
  11. 5 agenti audit completi (Spec, UX, Student, Security, Performance)
  12. Screenshot confronto #tutor vs #lavagna
  13. Generare prompt sessione successiva
  14. Aggiornare MEMORY.md
```

---

## REGOLE INVARIANTI (TUTTE LE SESSIONI)

```
PATH: export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"
BUILD: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
TEST: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run
PALETTE: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D, Muted #737373
FONT: Oswald (display), Open Sans (body), Fira Code (mono)
ENGINE: CircuitSolver.js, AVRBridge.js, SimulationManager.js — MAI modificare
UNLIM: 11 file (2430 LOC) — MAI modificare, solo wrappare
ZERO REGRESSIONI: #tutor deve funzionare IDENTICAMENTE in ogni momento
ZERO EMOJI: usa ElabIcons.jsx SVG
STRANGLER FIG: solo file NUOVI in src/components/lavagna/ (sessioni 1-6)
TOUCH FIRST: pointer events, min 48px target, test touch reale
CSS MODULES: tutto il nuovo codice in .module.css
```

### Skill ELAB da usare OGNI sessione:
```
/elab-quality-gate          — gate pre/mid/post sessione
/quality-audit              — audit end-to-end
/verification-before-completion — prima di dichiarare un task completo
/simplify                   — dopo ogni implementazione
/systematic-debugging       — dopo OGNI test failure
/frontend-design            — per ogni componente UI nuovo
/design:accessibility-review — per ogni cambio a11y
/design:design-critique     — review design prima di procedere
```

### Tool esterni da usare:
```
Playwright (plugin)         — test touch, drag, click, screenshot comparison
Firecrawl (plugin)          — se serve fetch contenuto web
Figma MCP (gia installato)  — design reference
Control Chrome              — test manuale nel browser reale
preview_* tools             — screenshot, console, network, inspect
```

---

## SESSIONE 1: AppShell + Header + FloatingWindow + Route

### Task 1.1: Creare la directory e il route

**Files:**
- Create: `src/components/lavagna/` (directory)
- Modify: `src/App.jsx` (aggiungere 1 route)

**Step 1: Creare directory**
```bash
mkdir -p "src/components/lavagna"
```

**Step 2: Aggiungere route in App.jsx**
Trovare l'array VALID_HASHES e aggiungere 'lavagna'. Trovare il blocco condizionale di rendering e aggiungere:
```jsx
if (currentPage === 'lavagna') {
  return <React.Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Oswald',color:'#1E4D8C',fontSize:24}}>Caricamento lavagna...</div>}><LavagnaShell /></React.Suspense>;
}
```
Con lazy import in cima:
```jsx
const LavagnaShell = React.lazy(() => import('./components/lavagna/LavagnaShell'));
```

**Step 3: Build + Test**
```bash
npm run build && npx vitest run
```
Expected: PASS (LavagnaShell non esiste ancora ma e lazy, non rompe nulla se non navighi a #lavagna)

**Step 4: Commit**
```bash
git add -A && git commit -m "feat(lavagna): add #lavagna route with lazy loading"
```

---

### Task 1.2: FloatingWindow — il componente base

**Files:**
- Create: `src/components/lavagna/FloatingWindow.jsx`
- Create: `src/components/lavagna/FloatingWindow.module.css`
- Create: `src/components/lavagna/__tests__/FloatingWindow.test.jsx`

**Step 1: Write test**
```jsx
// __tests__/FloatingWindow.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FloatingWindow from '../FloatingWindow';

describe('FloatingWindow', () => {
  it('renders with title and children', () => {
    render(<FloatingWindow title="Test"><p>Content</p></FloatingWindow>);
    expect(screen.getByText('Test')).toBeTruthy();
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('calls onMinimize when minimize button clicked', () => {
    const onMin = vi.fn();
    render(<FloatingWindow title="T" onMinimize={onMin}><p>C</p></FloatingWindow>);
    fireEvent.click(screen.getByLabelText('Minimizza'));
    expect(onMin).toHaveBeenCalled();
  });

  it('calls onMaximize when maximize button clicked', () => {
    const onMax = vi.fn();
    render(<FloatingWindow title="T" onMaximize={onMax}><p>C</p></FloatingWindow>);
    fireEvent.click(screen.getByLabelText('Espandi'));
    expect(onMax).toHaveBeenCalled();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<FloatingWindow title="T" onClose={onClose}><p>C</p></FloatingWindow>);
    fireEvent.click(screen.getByLabelText('Chiudi'));
    expect(onClose).toHaveBeenCalled();
  });

  it('has minimum touch target 48px on all buttons', () => {
    const { container } = render(<FloatingWindow title="T"><p>C</p></FloatingWindow>);
    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      // In jsdom getBoundingClientRect returns 0, check CSS instead
      const style = window.getComputedStyle(btn);
      expect(parseInt(style.minWidth) || 48).toBeGreaterThanOrEqual(48);
      expect(parseInt(style.minHeight) || 48).toBeGreaterThanOrEqual(48);
    });
  });
});
```

**Step 2: Run test — verify FAIL**
```bash
npx vitest run src/components/lavagna/__tests__/FloatingWindow.test.jsx
```

**Step 3: Implement FloatingWindow.jsx**

Il componente deve supportare:
- Drag (pointer events — touch + mouse)
- Resize (da angoli, pointer events)
- Minimize/Maximize/Close (bottoni 48px)
- Z-index management (click = bring to front)
- Position/size persistence (localStorage)
- Fullscreen mode
- aria-labels per a11y
- CSS modules per styling
- Palette ELAB (Navy header, bordi sottili)
- Glassmorphism opzionale (prop)
- border-radius: 16px, box-shadow ampio

**Step 4: Implement FloatingWindow.module.css**

- `.window` — base container (position: fixed, border-radius: 16px, box-shadow)
- `.titleBar` — drag handle (48px height, Navy gradient, flex, cursor: grab)
- `.titleText` — Oswald font, white, 14px
- `.btn` — 48x48 min, transparent, hover glow
- `.body` — overflow auto, flex: 1
- `.resizeHandle` — 48px touch area, visible dot-grip
- `.maximized` — inset: 0, border-radius: 0
- `.minimized` — display: none (parent handles icon)
- Animazioni: transition 300ms cubic-bezier(0.4, 0, 0.2, 1)
- @media (pointer: coarse) — larger touch targets

**Step 5: Run test — verify PASS**
**Step 6: /simplify + /verification-before-completion**
**Step 7: Commit**

---

### Task 1.3: AppHeader — barra top glassmorphism

**Files:**
- Create: `src/components/lavagna/AppHeader.jsx`
- Create: `src/components/lavagna/AppHeader.module.css`

**Step 1: Implement AppHeader**

Specifiche:
- 48px altezza
- Glassmorphism: `backdrop-filter: blur(16px)`, `background: rgba(30,77,140,0.85)`, `border-bottom: 1px solid rgba(255,255,255,0.1)`
- Sinistra: hamburger (48x48) + logo "ELAB" (Oswald, white, 18px)
- Centro: nome esperimento (click = apre picker, per ora placeholder) + progress dots
- Destra: toggle 3 modalita + bottone Play (Lime, 48x48) + avatar utente
- Touch target: TUTTI i bottoni >= 48px
- Responsive: a 1024px nasconde testo bottoni, mostra solo icone
- CSS module con variabili palette ELAB

**Step 2: Build + test**
**Step 3: preview_start → preview_screenshot (verificare glassmorphism)**
**Step 4: /frontend-design + /design:design-critique**
**Step 5: Commit**

---

### Task 1.4: LavagnaShell — assemblaggio

**Files:**
- Create: `src/components/lavagna/LavagnaShell.jsx`
- Create: `src/components/lavagna/LavagnaShell.module.css`

**Step 1: Implement LavagnaShell**

```jsx
// LavagnaShell.jsx — La lavagna ELAB
import React from 'react';
import AppHeader from './AppHeader';
import css from './LavagnaShell.module.css';

// Import EXISTING simulator (wrapping, not modifying)
import NewElabSimulator from '../simulator/NewElabSimulator';

export default function LavagnaShell() {
  return (
    <div className={css.shell}>
      <AppHeader />
      <main className={css.canvas}>
        {/* Il simulatore esistente, INTATTO, montato nella nuova shell */}
        <NewElabSimulator />
      </main>
    </div>
  );
}
```

CSS:
```css
.shell {
  display: grid;
  grid-template-rows: 48px 1fr;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg, #F0F4F8);
}
.canvas {
  position: relative;
  overflow: hidden;
}
```

**Step 2: Build + test**
**Step 3: Navigate to #lavagna → preview_screenshot**
**Step 4: Navigate to #tutor → preview_screenshot (DEVE ESSERE IDENTICO)**
**Step 5: /verification-before-completion**
**Step 6: Commit**

---

### Task 1.5: AUDIT 1/3 Sessione

Eseguire protocollo audit completo (15 metriche). Documentare risultati. Fixare P0 se presenti.

---

### Task 1.6-1.8: RetractablePanel (sinistra, destra, basso)

**Files:**
- Create: `src/components/lavagna/RetractablePanel.jsx`
- Create: `src/components/lavagna/RetractablePanel.module.css`

Pannello generico con:
- Direzione: left | right | bottom (prop)
- Stato: open | closed (animato, 300ms cubic-bezier)
- Resize: maniglia drag (pointer events)
- Dimensione salvata in localStorage
- Larghezza/altezza min/max configurabili
- Touch: swipe per aprire/chiudere
- @media (pointer: coarse) — maniglia resize piu grande

---

### Task 1.9: FloatingToolbar

**Files:**
- Create: `src/components/lavagna/FloatingToolbar.jsx`
- Create: `src/components/lavagna/FloatingToolbar.module.css`

- 6-8 icone (ElabIcons.jsx): Select, Wire, Delete, Undo, Redo, Pen
- Posizione: centro-basso canvas, sopra pannello codice
- Glassmorphism: blur + border-radius 14px
- Icone 48x48 con gap 8px
- Micro-animazione al tap: scale 0.9→1.0 (100ms)
- Glow sottile sull'icona attiva (box-shadow lime)
- Visibile solo quando mouse/touch e sul canvas (opacity transition)

---

### Task 1.10: AUDIT 1/2 Sessione

15 metriche + Playwright touch test + 3 agenti paralleli.

---

### Task 1.11-1.12: Integration + Polish

- Assemblare RetractablePanel(left) + canvas + FloatingToolbar nella LavagnaShell
- Wrappare ComponentDrawer (esistente) nel pannello sinistro
- Wrappare CodeEditorCM6 (esistente) nel pannello basso
- Test: verificare che componenti wrappati funzionano identicamente

---

### Task 1.13: AUDIT Fine Sessione

15 metriche complete + 5 agenti + generare stringa S2 + aggiornare MEMORY.md.

---

## SESSIONE 2: Galileo/UNLIM in FloatingWindow

### Task 2.1: Wrappare ChatOverlay in FloatingWindow
### Task 2.2: Implementare 4 stati (minimized, panel, floating, fullscreen)
### Task 2.3: Stile Claude.ai — input ancorato, streaming, SafeMarkdown
### Task 2.4: AUDIT 1/3
### Task 2.5: Verificare che TUTTO UNLIM funziona (voice, TTS, intent, memoria, mascotte)
### Task 2.6: Touch test iPad (drag, resize, minimize)
### Task 2.7: AUDIT 1/2
### Task 2.8: Polish animazioni + glassmorphism finestra
### Task 2.9: Test regressione: #tutor IDENTICO
### Task 2.10: AUDIT Fine Sessione + generare stringa S3

---

## SESSIONE 3: Video Float (YouTube + Videocorsi)

### Task 3.1: VideoFloat.jsx — YouTube iframe in FloatingWindow
### Task 3.2: Catalogo videocorsi JSON (lista curata)
### Task 3.3: UI ricerca/incolla URL
### Task 3.4: AUDIT 1/3
### Task 3.5: Test YouTube embed (play, pause, fullscreen nativo)
### Task 3.6: Touch test iPad
### Task 3.7: AUDIT 1/2
### Task 3.8: Picture-in-picture minimize (thumbnail)
### Task 3.9: Test regressione: #tutor IDENTICO
### Task 3.10: AUDIT Fine Sessione + generare stringa S4

---

## SESSIONE 4: ExperimentPicker + Stato-Driven Panels

### Task 4.1: ExperimentPicker.jsx — modal con card per volume
### Task 4.2: Colori volume (Lime/Orange/Red), lucchetti, progress badge
### Task 4.3: Ricerca esperimenti
### Task 4.4: AUDIT 1/3
### Task 4.5: LavagnaStateManager.js — state machine (build/code/run/stuck)
### Task 4.6: Auto-apertura/chiusura pannelli per stato
### Task 4.7: AUDIT 1/2
### Task 4.8: Animazioni transizione stato (300ms)
### Task 4.9: Test: seleziona esperimento → carica sulla lavagna → passo passo funziona
### Task 4.10: AUDIT Fine Sessione + generare stringa S5

---

## SESSIONE 5: Dashboard Docente come Tab

### Task 5.1: Tab "Classe" nella AppHeader (solo per ruolo docente)
### Task 5.2: Wrappare TeacherDashboard nel body dello shell (senza modificarlo)
### Task 5.3: Transizione Lavagna ↔ Classe (fade, stato preservato)
### Task 5.4: AUDIT 1/3
### Task 5.5: Dashboard studente come drawer/tab secondario
### Task 5.6: Wrappare StudentDashboard (senza modificarlo)
### Task 5.7: AUDIT 1/2
### Task 5.8: Test: switch tab, dati preservati, ritorno alla lavagna intatto
### Task 5.9: Touch test iPad su dashboard
### Task 5.10: AUDIT Fine Sessione + generare stringa S6

---

## SESSIONE 6: Vetrina V2 + Pulizia

### Task 6.1: VetrinaV2.jsx — landing pre-login (nuovo file, NON modifica VetrinaSimulatore)
### Task 6.2: Hero con palette ELAB, stats, CTA chiara
### Task 6.3: Card volumi con colori gradient
### Task 6.4: AUDIT 1/3
### Task 6.5: Form attivazione licenza (dal vecchio, wrappato)
### Task 6.6: Responsive LIM + iPad + mobile
### Task 6.7: AUDIT 1/2
### Task 6.8: Link a #lavagna dopo login (non piu #tutor)
### Task 6.9: Test: flusso completo vetrina → login → lavagna
### Task 6.10: AUDIT Fine Sessione + generare stringa S7

---

## SESSIONE 7: Rimozione Giochi + Dead Code + Polish

### Task 7.1: Rimuovere CircuitDetective.jsx + .module.css
### Task 7.2: Rimuovere PredictObserveExplain.jsx + .module.css
### Task 7.3: Rimuovere ReverseEngineeringLab.jsx + .module.css
### Task 7.4: Rimuovere CircuitReview.jsx
### Task 7.5: Rimuovere data/mystery-circuits.js, review-circuits.js, useGameScore.js
### Task 7.6: Rimuovere sezione giochi da TutorSidebar
### Task 7.7: AUDIT 1/3
### Task 7.8: Rimuovere VetrinaSimulatore const S={} dead code (400 LOC)
### Task 7.9: Rimuovere 57 unicode emoji escapes → ElabIcons SVG
### Task 7.10: AUDIT 1/2
### Task 7.11: Polish finale — animazioni, micro-interazioni, canvas dot pattern
### Task 7.12: Progress dots animati nella header
### Task 7.13: AUDIT Fine Sessione + generare stringa S8

---

## SESSIONE 8: Lo Switch — #tutor → #lavagna

### Task 8.1: Test COMPLETO #lavagna — tutti i 62 esperimenti apribili
### Task 8.2: Test COMPLETO — voice, TTS, STT funzionanti
### Task 8.3: Test COMPLETO — dashboard docente e studente funzionanti
### Task 8.4: AUDIT 1/3 (deve essere >= 8.5/10 su tutte le metriche)
### Task 8.5: App.jsx — #tutor diventa redirect a #lavagna
### Task 8.6: Rimuovere vecchio TutorLayout, TutorTopBar, TutorSidebar (dopo backup)
### Task 8.7: AUDIT 1/2
### Task 8.8: Rimuovere VetrinaSimulatore (sostituito da VetrinaV2)
### Task 8.9: Bundle optimization — verificare che chunk rimossi alleggeriscono
### Task 8.10: AUDIT FINALE — 15 metriche + 5 agenti + score definitivo
### Task 8.11: Aggiornare CLAUDE.md con nuova architettura
### Task 8.12: Deploy Vercel
### Task 8.13: Screenshot confronto PRIMA/DOPO

---

## TEMPLATE STRINGA SESSIONE SUCCESSIVA

Ogni sessione DEVE generare questo prompt alla fine:

```markdown
# SESSIONE LAVAGNA {N}/8 — {TITOLO}

## Stato Ereditato
Score sessione precedente: {X}/10 (15 metriche)
Bug P0 aperti: {lista}
File creati fin qui: {lista in src/components/lavagna/}

## PRIMA DI TUTTO
1. Leggi: docs/plans/2026-04-01-lavagna-redesign.md
2. Leggi: docs/plans/2026-04-01-lavagna-master-plan.md
3. npm run build && npx vitest run — DEVE passare
4. /elab-quality-gate
5. Navigare a #tutor → verificare IDENTICO
6. Navigare a #lavagna → verificare stato attuale

## REGOLE
{copia regole invarianti dal master plan}

## TASK DA ESEGUIRE
{lista task della sessione, copiati dal master plan}

## AUDIT SCHEDULE
- Dopo task {N}: AUDIT 1/3 (15 metriche)
- Dopo task {N}: AUDIT 1/2 (15 metriche + Playwright + 3 agenti)
- Fine sessione: AUDIT completo (15 metriche + 5 agenti + screenshot)

## BENCHMARK TARGET
{target score per questa sessione}
```
