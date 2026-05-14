# Prompt - controllo fine comportamento UNLIM

Usa questo prompt nella prossima sessione per completare il controllo fine senza compiacere.

```text
Lavora come sessione operativa ELAB "UNLIM controllo fine comportamento".

Regole:
- Non compiacere.
- Non dichiarare PASS senza prove.
- Non fare deploy production senza CoV, quality audit, dati Playwright e mia approvazione esplicita.
- Se qualcosa resta lento, generico o fragile, scrivilo chiaramente.
- Le citazioni Vol./pag. vanno dette solo quando sono necessarie e brevi.
- UNLIM deve parlare in stile ELAB: naturale, vivo, operativo, a volte analogie/metafore, mai frasi da chatbot.

Contesto da verificare:
- Deployment corrente: https://www.elabtutor.school
- Deployment diretto ultima sessione: https://elab-tutor-n4lqu6b78-andreas-projects-6d4e9791.vercel.app
- CoV: docs/CoV/2026-05-09-unlim-response-quality-speed-cov.md
- Audit: docs/audits/2026-05-09-unlim-response-quality-speed/quality-audit.md
- Handoff: docs/handoff/2026-05-09-unlim-response-quality-speed-next-session.md

Obiettivo:
Verificare e rifinire UNLIM/Nanobot/Galileo fino a comportamento da tutor in classe:
- un solo placeholder, esattamente "Sto ELABorando...";
- mai "Sto elaborando" o "elaborandg";
- nessun doppio placeholder;
- risposte 1-4 frasi di default;
- azioni note senza attesa LLM;
- citazioni solo se utili;
- memoria persistente distinguendo presente live da passato;
- screenshot/schermo utilizzabile da UNLIM quando richiesto;
- voce Voxtral in uscita come meccanismo primario API same-origin;
- Galileo/Nanobot verificati, incluso stato Render non-free/paid o prova che non lo e'.

Test obbligatori:
1. Riesegui:
   - node scripts/bench/unlim-response-quality-speed.mjs
   - npx vitest run sui test UNLIM/voice/router modificati
   - BASE_URL=<url> npx playwright test tests/e2e/99-unlim-100-operational.spec.js --config=tests/e2e/playwright.config.js --project=chromium --workers=1
   - RUN_RESPONSE_QUALITY_SPEED=1 BASE_URL=<url> npx playwright test tests/e2e/104-unlim-response-quality-speed.spec.js --config=tests/e2e/playwright.config.js --project=chromium --workers=1
   - RUN_VOICE_BENCHMARK=1 BASE_URL=<url> npx playwright test tests/e2e/102-unlim-voice-reactivity-benchmark.spec.js --config=tests/e2e/playwright.config.js --project=chromium --workers=1
2. Aggiungi 50 domande non fast-path sui tre volumi:
   - 15 Volume 1;
   - 15 Volume 2;
   - 15 Volume 3;
   - 5 miste con memoria e presente contraddittori.
3. Controlla che UNLIM non citi se non serve e che quando cita usi una micro-ancora.
4. Misura p50/p95/p99 di API ready, first UI feedback, first useful response, action verified, Voxtral latency.
5. Verifica Galileo-Nanobot:
   - URL/health effettivi;
   - account/provider Render;
   - prova se il servizio e' non-free/paid oppure dichiarazione che non e' stato provato;
   - fallback Supabase/Gemini/Pixtral.

Output obbligatorio:
- nuovo CoV;
- nuovo quality audit;
- JSON benchmark aggiornati;
- screenshot desktop/iPad/mobile;
- log voce Voxtral;
- se deployi, URL e inspect Vercel;
- se non passa, elenco preciso dei blocchi.
```
