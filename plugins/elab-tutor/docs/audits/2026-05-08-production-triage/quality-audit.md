# Quality Audit - Production Triage

Data: 2026-05-08  
Target: `https://www.elabtutor.school/#lavagna`  
Deployment: `dpl_7hxcPtazDNtkzYeWg3myLZwh4xHh`

## Findings

1. **P0/P1 Scratch Blockly crash in production**

   Smoke esteso: `loadScratchWorkspace` porta l'editor in modalita `scratch`, ma il render di Blockly emette `Error: Invalid colour: "var(--elab-red)"` e passa da `ScratchErrorBoundary`.

   Root cause probabile: `src/components/simulator/panels/ScratchEditor.jsx` definisce `Blockly.Theme.defineTheme('elab')` con `colourPrimary: 'var(--elab-red)'`, `var(--elab-navy)`, `var(--elab-orange)`, `var(--elab-lime)` e categorie con `colour: 'var(...)'`. Blockly valida i colori del tema prima che il CSS possa risolvere le custom properties, quindi rifiuta `var(...)`.

   Impatto: Scratch/Blockly non e production-clean; requisito P0 Scratch non puo essere dichiarato PASS operativo anche se il bridge API esiste.

2. **P1 compile bridge produce console errors CORS prima del fallback**

   Smoke esteso: il compile bridge restituisce `success: true`, ma la console contiene errori CORS verso `https://n8n.srv1022317.hstgr.cloud/compile`.

   Evidenza env read-only: `npx vercel env ls` mostra `VITE_COMPILE_URL` in Production e anche `VITE_COMPILE_WEBHOOK_URL`. In `src/services/api.js`, `VITE_COMPILE_URL` viene trattato come server standalone e chiamato con suffisso `/compile`; se punta a n8n, il browser deve superare CORS/OPTIONS. Il fallback successivo maschera il problema funzionale, ma non soddisfa il requisito "nessun console/page error critico".

   Impatto: Arduino compile puo funzionare, ma production resta rumorosa e fragile.

3. **P2 Supabase `scribble_paths` 404 durante smoke**

   Due richieste REST verso `scribble_paths` ritornano 404. Non hanno bloccato lo smoke, ma indicano tabella/endpoint o schema non disponibile per la persistenza tratti in quel contesto.

4. **No hardware claim**

   Non sono verificati: Apple Pencil fisica, Safari/iPad reale, microfono reale, TTS udibile, wake word reale.

## Pass Confermati

- Vercel deployment identity: PASS, production `Ready`, alias `www.elabtutor.school` presente.
- Lavagna desktop: PASS.
- Tre modalita: PASS visibile.
- `UNLIM`, `Manuale`, `Video`, `Salva`: PASS visibile.
- Manuale e Video: PASS apertura contenuto.
- Arduino switch/codice/compile bridge: PASS funzionale.
- Diagnosi Gia Montato: PASS via follow-up UI, `getBuildMode()` diventa `complete`.
- Fumetto/report: PASS, popup con contenuto visibile e cronologia parseabile.
- iPad proxy: PASS, nessun overflow orizzontale.

## Decision Gate

Production non e pulita. Non procedere con feature o deploy successivi.

Opzioni:

- **Fix-forward consigliato**: correggere Blockly theme usando valori HEX concreti in `ScratchEditor.jsx`; correggere env compile rimuovendo/sostituendo `VITE_COMPILE_URL` o abilitando CORS/OPTIONS sul target standalone; poi test mirati e nuovo smoke.
- **Rollback**: se Scratch deve essere affidabile subito e il deploy precedente era noto buono, rollback solo con approvazione esplicita.

## Evidence

- `docs/audits/2026-05-08-production-triage/playwright-production-smoke.json`
- `docs/debug/2026-05-08-production-triage-debug.md`
- Screenshot in `docs/audits/2026-05-08-production-triage/`
