# Vision E2E — VisionButton → UNLIM Analyze

**Status**: v1 implementato (Feature 1 Fase 2 Recovery)
**Branch**: `feature/vision-e2e-live`
**Data**: 2026-04-19
**Autore**: Andrea Marro — ELAB Tutor

## Cosa fa

Bottone flottante in Lavagna che permette al docente di catturare uno screenshot del simulatore e farlo analizzare da UNLIM (Gemini 2.5 Pro Vision via Supabase Edge Function `unlim-chat`).

Flow completo:
1. Docente clicca "Guarda il mio circuito" (VisionButton top-right canvas).
2. `window.__ELAB_API.captureScreenshot()` → base64 dataURL.
3. `VisionButton` chiama `onVisionResult({base64, mimeType})`.
4. `LavagnaShell.handleVisionResult` apre UNLIM + `window.dispatchEvent(new CustomEvent('elab-vision-capture', { detail }))`.
5. `useGalileoChat` useEffect listener → `processVisionImages` → `analyzeImage` (services/api) → messaggio UNLIM con risposta.

## Principio Zero v3 (verificato)

- Nessuna stringa "Docente leggi" / "Insegnante leggi" nel componente o nei test.
- Label "Guarda il mio circuito" — comando diretto al docente sull'UI, non meta-istruzione su cosa dire ai ragazzi.
- Risposta UNLIM viene dal `unlim-chat` Edge Function con BASE_PROMPT v3 già deploy (commit 250364a su main).

## File creati

| File | Righe | Ruolo |
|------|-------|-------|
| `src/components/tutor/VisionButton.jsx` | 60 | Componente React, screenshot capture + callback |
| `src/components/tutor/VisionButton.module.css` | 55 | Palette ELAB navy, WCAG AA touch 44px |
| `tests/unit/tutor/VisionButton.test.jsx` | 88 | 7 unit tests |
| `e2e/22-vision-flow.spec.js` | 94 | 3 Playwright E2E tests |

## File modificati (Regola 0: no duplication)

- `src/components/lavagna/LavagnaShell.jsx` — import `VisionButton`, `handleVisionResult`, `handleVisionError`, slot CSS + JSX nel canvas.
- `src/components/lavagna/LavagnaShell.module.css` — classe `.visionButtonSlot` (absolute top/right, z-index 955).
- `src/components/lavagna/useGalileoChat.js` — estratto `processVisionImages(images, userMessage, displayDataUrl)` da `handleScreenshot` (riusato da entrambi), + `useEffect` listener CustomEvent `elab-vision-capture`.

## Props VisionButton

| Prop | Tipo | Descrizione |
|------|------|-------------|
| `onVisionResult` | `({base64, mimeType}) => void` | Callback su screenshot OK |
| `onError` | `(err: Error) => void` | Optional — fallback console.error |

## Dati riusati (Regola 0)

- `window.__ELAB_API.captureScreenshot()` — API esistente da `src/services/simulator-api.js`.
- `analyzeImage(images, prompt, ctx)` — da `src/services/api.js` (already wired su Supabase Edge Function).
- `CameraIcon` da `src/components/common/ElabIcons.jsx` — no inline SVG, no emoji (rule #11).

## WCAG AA

- Touch target 44px min-height.
- Focus ring 2px solid orange `#E8941C` (palette).
- `aria-label="Guarda il mio circuito - UNLIM analizza lo schermo"`.
- `aria-busy` durante loading.
- `prefers-reduced-motion: reduce` disabilita transform/transition.
- Disabled state quando `__ELAB_API` assente.

## Test

- **Unit (vitest)**: 7/7 PASS — `tests/unit/tutor/VisionButton.test.jsx`
  - render label, icon SVG, click → captureScreenshot call, loading label, onVisionResult payload, disabled-no-API, onError propagation.
- **E2E (Playwright)**: 3/3 PASS — `e2e/22-vision-flow.spec.js`
  - VisionButton visible con label, click dispatches `elab-vision-capture`, Principio Zero v3 aria-label clean.
- **Baseline**: 12081 → 12088 (+7), CoV 3/3 PASS, zero regressioni.
- **Build**: PWA v1.2.0, precache 30 entries 4800 KiB, 55s.

## Non-goals v1

- Vision via comando vocale "Ehi UNLIM guarda il circuito" (già esiste in `useGalileoChat.js` pattern detection — non toccato).
- Highlights automatici da `[AZIONE:highlight:...]` nella risposta vision (già gestiti da `executeActionTags`).
- Multi-image upload dal docente (solo screenshot simulatore v1).

## Evoluzioni future

- Aggiungere pulsante vision anche nel pannello UNLIM (duplicato minimo + hotkey).
- Context enrichment: includere `circuitStateRef.current` + volume page corrente nel prompt vision.
- Throttle/debounce click per prevenire spam (attualmente gestito via `loading` state).

## Governance

- Pre-audit: `docs/tasks/TASK-VISION-E2E-start.md`
- Plan master: `docs/superpowers/plans/2026-04-19-recovery-phase2.md` (Feature 1 Task 1.1-1.7)
- PDR: `docs/plans/2026-04-19-pdr-vision-e2e.md`
- Commit trail su branch `feature/vision-e2e-live` (5 commits atomici).
