# ELAB S39 — Simulatore Perfetto

## Piano approvato
File: `docs/plans/2026-02-22-simulatore-perfetto.md`
Design: `docs/plans/2026-02-22-simulatore-perfetto-design.md`

## 4 Loop da eseguire

### Loop 1 — Build Modes (7.5/10 → 10/10)
- `buildMode=false` = Già Montato (buildStepIndex=Infinity, tutto visibile)
- `buildMode='guided'` = Passo Passo (buildStepIndex parte da -1)
- `buildMode='sandbox'` = Esplora Libero (canvas vuoto, wireMode=true)
- Implementazione in `NewElabSimulator.jsx` line ~1333 (`handleBuildModeSwitch`)
- **MAI testata in browser** → Loop 1 la testa con Claude in Chrome
- Promise: `<promise>BUILD_MODES_VERIFIED</promise>`

### Loop 2 — Volume Gating + Drag & Drop (8.5/10 → 10/10)
- `ComponentPalette.jsx` line 108: `volumeFilter > 0 && item.volumeAvailableFrom > volumeFilter`
- Cumulative: Vol2 mostra Vol1+Vol2, Vol3 mostra tutto
- Drag snapping: `SimulatorCanvas.jsx`, `handleDragEnd`
- Promise: `<promise>VOLUME_DRAGDROP_VERIFIED</promise>`

### Loop 3 — Galileo Full Integration (8.5/10 → 10/10)
- `handleAskGalileo` in `NewElabSimulator.jsx` line ~1672
- Attuale: solo title + desc + concept
- Manca: circuitState (LED on/off), buildMode + step corrente, chat sidebar sync
- Promise: `<promise>GALILEO_INTEGRATED</promise>`

### Loop 4 — Polish + Deploy
- Build 0 errori, screenshot proof x4, deploy Vercel
- Promise: `<promise>SIMULATORE_COMPLETO</promise>`

## Stack di test
- `preview_start` → dev server porta 5173
- Claude in Chrome → testing interattivo reale
- `preview_screenshot` → proof visivo
- Serena `replace_symbol_body` → modifiche chirurgiche

## Test accounts
- Student: `student@elab.test` / `Ry5!kN7#dM2$wL9`
- Admin: `debug@test.com` / `Xk9#mL2!nR4`

## Deploy
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build && npx vercel --prod --yes
```
