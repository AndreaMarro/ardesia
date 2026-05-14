# CoV - Production Triage

Data: 2026-05-08

## Deployment

- Production deployment: `dpl_7hxcPtazDNtkzYeWg3myLZwh4xHh`
- URL deploy: `https://elab-tutor-15yamdv9j-andreas-projects-6d4e9791.vercel.app`
- Alias: `https://www.elabtutor.school`, `https://elabtutor.school`, `https://elab-builder.vercel.app`, `https://elab-tutor-andreas-projects-6d4e9791.vercel.app`, `https://elab-tutor-andreamarro-andreas-projects-6d4e9791.vercel.app`
- Stato: `Ready`
- Target: `production`
- Created: 2026-05-08 14:00:41 Europe/Rome
- Verification command: `npx vercel inspect elab-tutor-15yamdv9j-andreas-projects-6d4e9791.vercel.app`
- Vercel connector: tentato in read-only, ma `_get_deployment` ha risposto 404 e `_list_teams` ha restituito `[]`; usato fallback CLI come da piano.

## Smoke

- Desktop Lavagna: PASS per caricamento, `Percorso` / `Passo Passo` / `Gia Montato`, `UNLIM`, `Manuale`, `Video`, `Salva`.
- iPad proxy: PASS per caricamento, tre modalita visibili, `overflowBy: 0`.
- Manuale: PASS, contenuto visibile dopo apertura.
- Video: PASS, contenuto visibile dopo apertura.
- Scratch: PARTIAL/FAIL operativo. Il bridge `loadScratchWorkspace` esiste e passa lo stato editor a `scratch`, ma il render Blockly produce errore critico `Invalid colour: "var(--elab-red)"`.
- Arduino: PASS per switch editor, codice `digitalWrite`, compile bridge con risultato `success: true`.
- Compile console health: FAIL. Prima del fallback riuscito, la production genera errori CORS verso `https://n8n.srv1022317.hstgr.cloud/compile`.
- Fumetto/report: PASS. Il popup `Fumetto ELAB - Blink con LED_BUILTIN` si apre e mostra contenuto visibile. Storage cronologia parseabile, nessuna regressione cronologia osservata nello smoke.
- Diagnosi circuito / Gia Montato: PASS nel follow-up UI. Click reale su `data-testid="modalita-btn-gia-montato"` porta `getBuildMode()` a `complete` e monta LED/resistore/6 fili su `v1-cap6-esp1`.
- Console/page errors: FAIL per Scratch Blockly e CORS compile.

Evidence:

- JSON: `docs/audits/2026-05-08-production-triage/playwright-production-smoke.json`
- Screenshot desktop: `docs/audits/2026-05-08-production-triage/desktop-production-lavagna.png`
- Screenshot Scratch/Arduino: `docs/audits/2026-05-08-production-triage/desktop-production-scratch-arduino.png`
- Screenshot Fumetto: `docs/audits/2026-05-08-production-triage/desktop-production-fumetto.png`
- Screenshot diagnosi: `docs/audits/2026-05-08-production-triage/desktop-production-diagnosi.png`
- Screenshot iPad: `docs/audits/2026-05-08-production-triage/ipad-production-lavagna.png`

## UNLIM Progressive Level

Livello minimo della sessione rispettato nello smoke read-only:

- Azioni: verifica bridge API, apertura Manuale/Video/Fumetto, Scratch, Arduino, compile, Gia Montato.
- Citazioni Vol./pag.: non testate via risposta linguistica live in questa Sessione 0; rimane requisito per prossima sessione UNLIM harness.
- Diagnosi circuito: PASS via Gia Montato su `v1-cap6-esp1`.
- Scratch/Arduino: Scratch bridge presente ma render crasha; Arduino switch/codice/compile PASS.
- Fumetto/report: PASS.

Core linguistico UNLIM: non toccato in questa sessione.

## Decision

- Keep production: sconsigliato senza decisione esplicita, perche lo smoke production non e pulito.
- Rollback needed: opzione da considerare se Scratch/Blockly e console clean sono P0 per lezioni immediate. Non eseguito.
- Fix-forward: opzione consigliata se si accetta di correggere rapidamente production con due fix mirati: colori Blockly concreti in `ScratchEditor.jsx`; env compile/CORS production.
- Manual hardware still needed: Apple Pencil fisica, Safari/iPad reale, microfono reale, TTS udibile e wake word reale NON sono verificati.

## Gate

Stop operativo: nessun nuovo deploy production e nessun rollback eseguito. Serve scelta esplicita di Andrea: fix-forward o rollback.
