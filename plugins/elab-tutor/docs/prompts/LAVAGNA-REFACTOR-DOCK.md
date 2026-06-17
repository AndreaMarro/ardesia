# SESSIONE REFACTORING — FloatingWindow Dock + Inline Styles
**Obiettivo**: Portare score frontend da 7.25 a 8.5+
**Prerequisito**: `docs/SESSION-FRONTEND-02-APR-2026.md`
**Tempo stimato**: ~7h (2 cicli principali)

---

## CICLO 1: FloatingWindow Dock Architecture (~4h)

### Problema
FloatingWindow usa `position: fixed` — copre il canvas invece di spingerlo.
Su LIM 1024x768 con UNLIM aperto, il canvas usabile si riduce del 50%.

### Soluzione: Docked Panel Mode
Aggiungere `mode` prop a FloatingWindow: `'floating'` (default, current behavior) | `'docked'`

In `docked` mode:
- Posizione: `position: relative` dentro `.body` flex layout
- No drag (title bar diventa solo header)
- Resize orizzontale solo (handle sinistro)
- Canvas riceve `marginRight` automatico (come left panel)
- Toggle floating/docked con bottone nell'header
- Breakpoint: auto-dock su schermi < 1100px

### File da modificare:
1. `src/components/lavagna/FloatingWindow.jsx` — add `mode` prop, conditional positioning
2. `src/components/lavagna/FloatingWindow.module.css` — `.docked` variant styles
3. `src/components/lavagna/LavagnaShell.jsx` — add `galileoDocked` state, `marginRight` on canvas
4. `src/components/lavagna/GalileoAdapter.jsx` — pass `mode` to FloatingWindow

### Test:
- Desktop: floating (drag/resize come ora)
- LIM 1024x768: auto-docked (push canvas)
- iPad portrait: fullscreen maximized
- Toggle: click header button → switch floating ↔ docked

---

## CICLO 2: Inline Styles → CSS Modules (~3h)

### DrawingOverlay.jsx (13 inline blocks → CSS module)
1. Create `src/components/simulator/canvas/DrawingOverlay.module.css`
2. Extract: containerStyle, svgStyle, toolbarStyle, colorButton, sizeButton, separatorStyle, minimizedButton, toolBtnStyle
3. Use CSS classes + conditional classNames
4. Keep dynamic values (width/height/position) as minimal inline styles

### LessonPathPanel.jsx (115 inline blocks → CSS module)
1. Create `src/components/simulator/panels/LessonPathPanel.module.css`
2. Extract: root, rootCollapsed, header, headerTitle, closeBtn, expTitle, phaseCard, phaseStep, etc.
3. ~40 CSS classes to replace 115 inline style objects
4. Use CSS transitions instead of inline transition strings

### Test:
- Visual regression: screenshot before/after
- 1075+ tests pass
- Performance: fewer object allocations per render

---

## REGOLE
1. ZERO REGRESSIONI
2. Screenshot prima e dopo ogni ciclo
3. Test su 3 viewport: Desktop, LIM, iPad
