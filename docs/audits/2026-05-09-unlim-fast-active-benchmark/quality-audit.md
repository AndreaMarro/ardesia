# Quality Audit - UNLIM Fast Active Benchmark

Data: 2026-05-09

## Verdict

Benchmark fast active: **PASS su locale e preview**.

Questo PASS vale per la prima risposta operativa e l'avvio/verifica di azioni locali complesse. Non vale per audio completo, hardware reale o performance generale.

## Preview

- `https://elab-tutor-dr7glsvx2-andreas-projects-6d4e9791.vercel.app`

## Evidenza Preview

Artifact:

- `docs/audits/2026-05-09-unlim-fast-active-benchmark/fast-active-benchmark.json`
- `docs/audits/2026-05-09-unlim-fast-active-benchmark/playwright-fast-active-preview-sequential.json`

Risultati:

- Arduino semaforo + compile:
  - prima risposta: 238 ms.
  - azioni verificate: 1450 ms.
- Scratch blink workspace:
  - prima risposta: 379 ms.
  - azioni verificate: 390 ms.
- Montaggio circuito LED D13/resistenza/GND:
  - prima risposta: 1156 ms.
  - azioni verificate: 1289 ms.

Soglie:

- prima risposta operativa <= 2000 ms.
- azioni verificate <= 6000 ms.

## Implementazione

- `useGalileoChat` usa `buildDirectOperationalResponse` prima del ramo LLM remoto per intenzioni operative note.
- Le azioni locali dirette bypassano il rate limit LLM, ma restano soggette a validazione input e verifier azioni.
- `executeActionTagsVerified` continua a non dichiarare riuscita un'azione se tool o verifier falliscono.

## Non Claim

- Non dichiaro risposta generica LLM sempre sotto 2s.
- Non dichiaro audio Voxtral completo sempre sotto 2s.
- Non dichiaro hardware reale PASS.

## Addendum Production 2026-05-09

Dominio production: `https://www.elabtutor.school`.

Primo post-deploy:

- Artifact: `playwright-fast-active-production-main.json`.
- Verdict: FAIL.
- Motivo: CORS su compile diretto `https://n8n.srv1022317.hstgr.cloud/compile`.

Fix:

- Browser HTTPS instradato su Supabase `compile-proxy`.
- Endpoint n8n diretto rimosso dalla CSP deploy.
- Unit guard: `vitest-cors-csp-compile-production-fix.json`, PASS 17/17.

Secondo post-deploy:

- Artifact: `playwright-fast-active-production-main-after-compile-proxy-fix.json`.
- Verdict: PASS.
- API ready: 7826 ms.
- Arduino semaforo + compile: first reply 197 ms, action verified 1454 ms.
- Scratch LED: first reply 435 ms, action verified 464 ms.
- Montaggio LED D13/GND: first reply 510 ms, action verified 543 ms.
- Console errors: 0.
- Network failures: 0.

Limite: questo PASS riguarda solo il fast path operativo noto, non il caricamento generale severo.
