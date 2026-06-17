# 06 — Estetica & Design System

> Ultimo aggiornamento: Sprint 1.1 (11/03/2026)

## Palette Ufficiale ELAB

| Colore | Hex | CSS Var | Uso |
|--------|-----|---------|-----|
| Navy | #1E4D8C | --color-primary | Pulsanti primari, header |
| Navy hover | #163A6B | --color-primary-hover | Hover states |
| Lime | #7CB342 | --color-accent / --color-vol1 | Volume 1, accenti |
| Orange | #E8941C | --color-vol2 | Volume 2 |
| Red | #E54B3D | --color-vol3 | Volume 3 |
| Danger | #DC2626 | --color-danger | Errori |
| Warning | #EA580C | --color-warning | Avvisi |
| Success | #16A34A | --color-success | Conferme |

## Neutrali (Claude.ai inspired)

| Colore | Hex | CSS Var |
|--------|-----|---------|
| Background | #FFFFFF | --color-bg |
| Bg secondary | #F7F7F8 | --color-bg-secondary |
| Bg tertiary | #ECECF1 | --color-bg-tertiary |
| Canvas bg | #F0F2F5 | --color-bg-canvas |
| Border | #E5E5EA | --color-border |
| Text | #1A1A2E | --color-text |
| Text secondary | #6B6B80 | --color-text-secondary |

## Typography

| Font | CSS Var | Uso |
|------|---------|-----|
| Open Sans | --font-sans | Body text, UI |
| Oswald | --font-heading / --font-display | Headings, titoli |
| Fira Code | --font-mono | Codice, serial monitor |

### Font Sizes
- xs/sm: 14px (minimum WCAG)
- base: 15px
- md: 16px
- lg: 18px
- xl: 24px
- 2xl: 32px
- 3xl: 40px

## Spacing (4px grid)

`--space-1` (4px) fino a `--space-16` (64px). Half-steps: `--space-1-5` (6px), `--space-2-5` (10px).

## Shadows (Claude.ai style)

xs -> sm -> md -> lg -> xl: da `0 1px 2px` a `0 20px 40px`.
Focus ring: `--shadow-focus` (navy 15% opacity).

## Border Radius

xs (4px) -> sm (6px) -> md (10px) -> lg (14px) -> xl (20px) -> 2xl (24px) -> full (9999px).

## Design Tokens Simulatore

- `--color-sim-bg`: #FAFAF7
- `--color-sim-bg-dark`: #1E2530
- `--color-sim-border`: #E8E4DB

## S161.1 — Semantic Tokens (Chat/Tutor)

Aggiunti in `design-system.css` per sostituire inline hex nei componenti tutor:

| Token | Hex | Uso |
|-------|-----|-----|
| --color-chat-thinking | #9B9BA8 | Typing indicator text |
| --color-chat-hover-bg | #E8EBF0 | Suggestion chip hover |
| --color-chat-socratic-bg | #FFF8E1 | Socratic mode banner |
| --color-chat-socratic-border | #FFE082 | Socratic mode border |
| --color-chat-socratic-text | #795548 | Socratic mode text |
| --color-chat-actions-bg | #E0E7FF | Action badge bg |
| --color-chat-camera-bg | #F0F4FF | Camera button bg |
| --color-success-dark | #2E7D32 | Success output text |
| --color-success-darker | #166534 | Success text darker |
| --color-pulse-green | #4ADE80 | Status indicator pulse |
| --color-danger-hover-light | #FECACA | Danger button hover |
| --color-danger-dark | #B91C1C | Exit/leave hover |
| --color-overlay-black | #000000 | Presentation overlay |
| --color-error-red | #ef4444 | Error indicators |
| --color-border-light | #E2E8F0 | Light borders |
| --color-text-muted | #64748B | Muted text |
| --color-bg-hover | #F8FAFC | Hover backgrounds |
| --color-bg-subtle | #F1F5F9 | Subtle backgrounds |
| --color-bg-cool | #F0F4F8 | Cool tone backgrounds |
| --color-border-medium | #CBD5E1 | Medium borders |
| --color-code-bg-dark | #0F172A | Dark code/schematic bg |
| --color-text-body | #334155 | Body text color |

### File Modificati (Session 161.1)

| File | Fix |
|------|-----|
| ChatOverlay.jsx | ~60 inline hex → CSS vars |
| ElabTutorV4.css | 11 inline hex → CSS vars |
| ElabSimulator.css | 7 inline hex → CSS vars |
| tutor-responsive.css | ~60 inline hex → CSS vars |
| TutorTools.css | 3 inline hex → CSS vars |
| TutorLayout.jsx | 10 inline hex → CSS vars |
| SafeMarkdown.jsx | 3 inline hex → CSS vars |
| CircuitReview.jsx | 2 inline hex → CSS vars |
| VideosTab.jsx | 3 inline hex → CSS vars |
| design-system.css | +22 new semantic tokens |

**Totale**: ~159 inline color declarations → CSS vars

## Problemi Estetici Noti

1. ~~**150+ hardcoded colors**~~: **RISOLTO** Session 161.1 — 159 inline colors tokenizzati
2. **Padding grid inconsistencies**: non tutti i componenti usano il 4px grid
3. **Force-light theme**: `data-theme="light"` hardcoded su `<html>`
4. **ElabTutorV4.jsx html2canvas**: 1 literal `#FFFFFF` rimasto (richiesto dalla libreria)

## Regole

- **MAI** usare colori fuori palette senza CSS var
- **MAI** usare font diversi da Open Sans / Oswald / Fira Code
- **MAI** usare px hardcoded per spacing — usare `--space-N`
- Watermark: `Andrea Marro -- DD/MM/YYYY` (JS dinamico)
