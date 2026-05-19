# Prompt - controllo fine comportamento UNLIM, Galileo/Nanobot, Render

```text
Lavora come sessione operativa ELAB "UNLIM controllo fine comportamento + Galileo/Nanobot Render".

Regole dure:
- Non compiacere.
- Non dichiarare PASS senza prove.
- Non dire "perfetto" se cold load, voce o risposte non fast-path restano fragili.
- Non fare deploy production senza CoV, quality audit, test Playwright e approvazione esplicita.
- Citazioni Vol./pag. solo se necessarie, micro-ancora breve.
- UNLIM deve parlare da tutor ELAB vivo: naturale, diretto, operativo, con analogie/metafore solo quando aiutano.

Contesto corrente:
- Production alias: https://www.elabtutor.school
- Deployment diretto finale: https://elab-tutor-r7tu0ys93-andreas-projects-6d4e9791.vercel.app
- Vercel deployment id finale: dpl_CjapjW2bC5fLRPwmAEmfQctjAtLZ
- Deployment testato con suite completa prima dell'aggiornamento documentale: https://elab-tutor-mvrg7h18w-andreas-projects-6d4e9791.vercel.app, id dpl_CC1FdpmRkGk9d8fZNWFML4zH8jx5
- CoV hotfix: docs/CoV/2026-05-10-unlim-vision-voice-hotfix-cov.md
- Audit hotfix: docs/audits/2026-05-10-unlim-vision-voice-hotfix/quality-audit.md
- Prompt precedente: docs/handoff/2026-05-09-unlim-final-behavior-control-prompt.md

Controlli obbligatori UNLIM:
1. Placeholder:
   - unico testo ammesso: "Sto ELABorando...";
   - mai "Sto elaborando";
   - mai "elaborandg";
   - mai doppio placeholder.
2. Visione:
   - "riesci a vedere il circuito?" deve chiamare screenshot/vision;
   - se vision fallisce, UNLIM deve dirlo e usare solo stato simulatore, non inventare;
   - niente risposta teorica generica tipo cortocircuito se l'utente chiede di vedere.
3. Voce:
   - Voxtral uscita primaria via API same-origin;
   - STT non deve cadere su anon key legacy;
   - errore voce deve sostituire "Messaggio vocale in elaborazione...", non lasciarlo appeso;
   - test hardware reale microfono/playback se possibile, altrimenti dichiarare NOT_PROVEN.
4. Qualita risposta:
   - 1-4 frasi default;
   - niente formule da chatbot;
   - niente citazioni inutili;
   - azioni note senza attesa modello;
   - quando puo' agire, agisce e verifica.
5. Memoria:
   - distinguere presente live da memoria passata;
   - non confondere stato vecchio e stato corrente.

Galileo/Nanobot Render:
- Health pubblico verificato nella sessione precedente:
  https://elab-galileo.onrender.com/health -> HTTP 200, status ok, version 5.5.0, multi-provider, vision attiva.
- Render non-free/paid NON e' provato dal solo health endpoint.
- Devi verificare il piano Render da dashboard/API Render con credenziali, oppure scrivere chiaramente: "Render non-free non provato".
- Non trasformare "servizio Render risponde" in "Render paid/non-free verificato".

Test obbligatori:
- node scripts/bench/unlim-response-quality-speed.mjs
- npx vitest run sui test UNLIM/voice/router/vision modificati
- BASE_URL=<deployment> npx playwright test tests/e2e/99-unlim-100-operational.spec.js --config=tests/e2e/playwright.config.js --project=chromium --workers=1
- RUN_RESPONSE_QUALITY_SPEED=1 BASE_URL=<deployment> npx playwright test tests/e2e/104-unlim-response-quality-speed.spec.js --config=tests/e2e/playwright.config.js --project=chromium --workers=1
- RUN_VOICE_BENCHMARK=1 BASE_URL=<deployment> npx playwright test tests/e2e/102-unlim-voice-reactivity-benchmark.spec.js --config=tests/e2e/playwright.config.js --project=chromium --workers=1
- Smoke esplicito: invia "riesci a vedere il circuito?" con esperimento caricato e verifica che venga chiamata vision.

Soglie da riportare:
- API ready p50/p95/p99.
- first UI feedback.
- first useful response.
- action verified.
- Voxtral latency.
- cold run vs warm run separati.

Output obbligatorio:
- CoV aggiornato.
- Quality audit aggiornato.
- JSON benchmark e screenshot desktop/iPad/mobile.
- Log voce Voxtral.
- Stato Galileo/Nanobot Render, distinguendo health pubblico da piano non-free.
- Se deployi: URL diretto, alias, deployment id, inspect Vercel.
- Se qualcosa fallisce: elenco preciso, niente PASS.
```
