# Debug Note - Production Triage

Data: 2026-05-08  
Skill: `superpowers:systematic-debugging`

## Symptom

Lo smoke production read-only su `https://www.elabtutor.school/#lavagna` fallisce il gate "nessun console/page error critico".

Errori principali:

- `Error: Invalid colour: "var(--elab-red)"` da `ScratchEditor-UaiwKcOk.js`, intercettato anche da `ScratchErrorBoundary`.
- CORS su `https://n8n.srv1022317.hstgr.cloud/compile`.

## Reproduction

1. Aprire production `#lavagna`.
2. Bypassare gate locali con localStorage di test.
3. Caricare `v3-cap5-esp1`.
4. Chiamare `window.__ELAB_API.loadScratchWorkspace(...)`.
5. Chiamare `window.__ELAB_API.compile(...)`.

Risultato:

- Scratch passa a `editorMode: scratch`, ma Blockly emette errore colore.
- Arduino compile restituisce `success: true`, ma prima compaiono errori CORS su endpoint n8n.

## Root Cause

### Scratch

`src/components/simulator/panels/ScratchEditor.jsx` usa CSS custom properties nei colori del tema Blockly:

```txt
colourPrimary: 'var(--elab-red)'
colourPrimary: 'var(--elab-navy)'
colourPrimary: 'var(--elab-orange)'
colourPrimary: 'var(--elab-lime)'
arduino_serial_cat: { colour: 'var(--elab-red)' }
```

Blockly valida questi valori come colori immediati e non accetta `var(...)`.

### Compile

`src/services/api.js` tratta `VITE_COMPILE_URL` come server standalone:

```txt
tryCompile(`${COMPILE_URL}/compile`, 'Standalone server')
```

In Production e presente `VITE_COMPILE_URL`, e lo smoke vede una chiamata a `https://n8n.srv1022317.hstgr.cloud/compile`. Quel target non risponde al preflight CORS con `Access-Control-Allow-Origin`, quindi la console produce errori. Il fallback successivo permette comunque un compile `success: true`.

## Hypothesis

- Fix Scratch: sostituire i `var(...)` nel tema Blockly con HEX concreti (`#1E4D8C`, `#E8941C`, `#E54B3D`, `#558B2F` o token gia risolti a compile-time).
- Fix compile: in Production, non puntare `VITE_COMPILE_URL` a n8n se non e un server standalone CORS-ready. Usare solo `VITE_COMPILE_WEBHOOK_URL` per webhook compatibile, oppure rendere il target standalone `/compile` CORS-safe.

## Not Fixed In This Session

Nessun file sorgente modificato e nessun deploy/rollback eseguito. La sessione e triage production read-only: serve decisione esplicita fix-forward o rollback.
