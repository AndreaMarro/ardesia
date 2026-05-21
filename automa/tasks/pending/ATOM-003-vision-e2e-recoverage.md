# ATOM-003: Vision E2E recoverage — ripristina copertura o ritira lo spec

## Contesto

`VisionButton` (`src/components/tutor/VisionButton.jsx`) è **dead code**: zero
import e zero `<VisionButton` JSX in tutto `src/` (verificato grep + Codex
Pattern V, iter 103). Un-wired ~2026-05-12 (iter 39, commit `aad961d3`
"Pure Gemini chat decision") — causa diretta di "CI E2E rossa dal 12/05".

Iter 103 Sprint A-i: i 5 test in `e2e/22-vision-flow.spec.js` sono stati
marcati `test.describe.fixme` (commit `506c74e2`, merge #136 → main
`4169663e`) per sbloccare la CI. Decisione ratificata da Andrea — marker
onesto, NON fix reale.

Il feature vision **esiste ancora** in prodotto via chatbot:
`ChatbotChatPanel.sendVision` → `handleSend('Guarda il mio circuito e
diagnosticalo, ragazzi.')`.

Questo ATOM traccia il recupero della copertura. Origine: Codex stop-review
iter 103 ha flaggato "Vision E2E disabled without a replacement gate".

## Problema

- `e2e/22-vision-flow.spec.js`: 5 test `fixme`, non eseguiti.
- Feature vision (via chat) con copertura E2E = **0**.
- Rischio: il `test.fixme` marcisce silenzioso senza tracking.

## Cosa fare — scegliere UNA via

- [ ] **Via A — re-wire VisionButton**: rimonta `<VisionButton>` in
  `LavagnaShell.jsx` (top-right canvas, come CHANGELOG v1). Rimuovi `.fixme`.
  I 5 test originali tornano validi. Modifica `src/`.
- [ ] **Via B — riscrivi spec per chat-vision**: riscrivi
  `e2e/22-vision-flow.spec.js` per testare il flusso vision-via-chatbot
  (`ChatbotChatPanel.sendVision`). Copertura reale del path attuale. Solo
  spec, niente `src/`.
- [ ] **Via C — cancella lo spec**: se button-vision è ritirato
  definitivamente → elimina `e2e/22-vision-flow.spec.js`. Richiede decisione
  esplicita Andrea.
- [ ] In ogni caso: rimuovi i 2 commenti orfani —
  `src/components/lavagna/LavagnaShell.module.css:99` +
  `src/components/lavagna/useGalileoChat.js:1334` ("VisionButton bridge").

## Criteri di accettazione (verificabili)

1. `e2e/22-vision-flow.spec.js`: zero `test.describe.fixme` / `test.fixme`
   residui (Via A/B), OPPURE file rimosso (Via C).
2. Via A/B: `npx playwright test e2e/22-vision-flow.spec.js` → tutti pass.
3. `grep -rn "VisionButton" src/` coerente con la via (Via A: import + JSX
   presenti; Via C: componente + css rimossi).
4. `npx vitest run` invariato — nessuna regressione.
5. Decisione (quale via + perché) documentata nel commit.

## File coinvolti

- `e2e/22-vision-flow.spec.js` (sempre)
- Via A: `src/components/lavagna/LavagnaShell.jsx` + `src/components/tutor/VisionButton.jsx`
- Via B: `e2e/22-vision-flow.spec.js` + investigare `src/components/chatbot/ChatbotChatPanel.jsx`
- Commenti orfani: `src/components/lavagna/LavagnaShell.module.css` + `src/components/lavagna/useGalileoChat.js`

## Generator target

`generator-test` (Via B / Via C) oppure `generator-app` (Via A).

## Priorità

P2 — CI verde, non urgente. Ma è un feature di prodotto reale senza
copertura E2E: da risolvere prima di considerare il vision flow "coperto".

## Stima

**M** — Via C ~1h, Via B ~2h, Via A ~3h.

## Origine

Iter 103 Sprint A-i (2026-05-21). Codex stop-review "Vision E2E disabled
without replacement gate". Andrea ratify: "task tracciato".
