# Audit - Sessione parallela A UX/no-regressioni

Data: 2026-05-08

## Obiettivo

Rispondere ai problemi UX segnalati:

- "i pannelli devono tutti essere resizabili su tutti i lati"
- "la gomma colora e non si capisce qual e"
- "se premi esci le scritte non permangono sullo schermo"
- "UNLIM ha seri problemi con l'onnipotenza"

Interpretazione operativa di "onnipotenza": non prompt/linguaggio, ma capacita runtime di comandare la Lavagna/simulatore tramite action bridge. Il core linguistico UNLIM non e stato modificato.

## Risultati

PASS:

- Pannello UNLIM/floating ridimensionabile da sinistra, destra, sopra, sotto e angoli.
- Pannello Passo Passo ridimensionabile da sinistra, destra, sopra, sotto e angoli.
- Gomma cancella tratti esistenti; non persiste tratti eraser trasparenti.
- Le scritte restano visibili dopo uscita dalla modalita disegno.
- Salva crea una sessione locale anche per esperimento caricato via API; sync anonimo accodato.
- Manuale, Video, Fumetto/report rispondono.
- Tre pulsanti modalita restano visibili/usabili in desktop e iPad proxy.
- UNLIM resta visibile dopo caricamento esperimento.
- Bridge azioni UNLIM espone funzioni operative principali.
- Console Playwright finale: 0 errori.

Limitazioni oneste:

- Apple Pencil reale non testata su hardware: verificato proxy Playwright iPad/touch.
- Voce reale non testata con microfono e HTTPS: testati comandi/servizi mirati e UI non bloccante.
- Qualita LLM live non rivalutata: nessun claim su "onniscienza" o risposta didattica perfetta in questa sessione.
- Deploy e preview READY, ma non eseguito post-deploy Playwright sul preview per policy locale Vercel skill di non fetchare/verificare URL deployato.

## File principali modificati

- `src/components/lavagna/FloatingWindow.jsx`
- `src/components/lavagna/FloatingWindow.module.css`
- `src/components/simulator/panels/ComponentDrawer.jsx`
- `src/components/simulator/canvas/DrawingOverlay.jsx`
- `src/components/lavagna/LavagnaStateManager.js`
- `src/components/lavagna/LavagnaShell.jsx`
- `src/components/lavagna/LavagnaShell.module.css`
- `src/components/common/MicPermissionNudge.jsx`
- `src/components/lavagna/VideoFloat.jsx`
- `src/components/lavagna/VideoFloat.module.css`
- `src/services/supabaseSync.js`
- `tests/unit/DrawingOverlay-iter25-migration.test.jsx`
- `tests/unit/lavagna/LavagnaStateManager.test.js`
- `tests/unit/lavagna/GalileoAdapter-mode-tabs.test.jsx`
- `tests/unit/components/common/MicPermissionNudge.test.jsx`

## Evidenze

JSON Playwright:

- `docs/audits/2026-05-08-sessione-a-ux-no-regressioni/playwright-results.json`

Screenshot:

- `desktop-loaded.png`
- `desktop-passo-passo-resized.png`
- `desktop-drawing-after-exit.png`
- `desktop-drawing-after-eraser.png`
- `desktop-manuale.png`
- `desktop-video.png`
- `ipad-passo-passo-pencil-exit.png`

Deploy preview:

- https://elab-tutor-6ei86l26j-andreas-projects-6d4e9791.vercel.app

## Rischi residui

- Il worktree contiene molte modifiche pre-esistenti/parallele non create da questa sessione; non sono state revertite.
- `ComponentDrawer.jsx` aveva gia modifiche concorrenti di stile/icona; questa sessione ha aggiunto la parte resize multi-lato.
- Build contiene warning CSS/chunk non bloccanti ma da ripulire.
- Le sessioni anonime ora accodano sync locale; serve policy prodotto su quando svuotare coda con utente autenticato/classe.

