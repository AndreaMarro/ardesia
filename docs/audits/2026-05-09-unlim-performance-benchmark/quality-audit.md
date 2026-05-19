# Quality Audit - UNLIM Severe Performance Benchmark

Data: 2026-05-09

## Verdict

Benchmark performance severo generale sul preview fast-active: **FAIL non stabile**.

Non dichiaro performance generale PASS severo. CORS/CSP e compile sono puliti, ma il gate long task resta sopra soglia in due run preview.

Preview testato:

- `https://elab-tutor-dr7glsvx2-andreas-projects-6d4e9791.vercel.app`

## Evidenza

Run preview 1:

- Artifact: `playwright-unlim-performance-benchmark-vercel-preview-fast-active-sequential.json`
- Verdict: FAIL.
- Console errors: 0.
- Compile p95: 1817.5 ms, soglia 1500, FAIL.
- Long task max: 1174 ms, soglia 750, FAIL.

Run preview 2:

- Artifact: `playwright-unlim-performance-benchmark-vercel-preview-fast-active-rerun.json`
- Verdict: FAIL.
- Console errors: 0.
- Compile p95: 1328.1 ms, soglia 1500, PASS.
- Long task max: 1003 ms, soglia 750, FAIL.

## Cosa E' Migliorato

- CORS/CSP compile: sistemato.
- Console: pulita.
- `/api/tts`: non aspetta piu' il VPS legacy; usa Voxtral primario.
- Fast active actions: coperte da benchmark separato con risposta sotto 2s.

## Cosa Non Passa

- Long task max non e' sotto 750 ms in modo stabile.
- Compile p95 ha variabilita' su preview, anche se nel rerun e' rientrato.

## Non Claim

- Non dichiaro performance generale PASS severo.
- Non dichiaro hardware reale PASS.
- Non dichiaro produzione perfetta.
- Se production viene deployata, e' per richiesta esplicita, non perche' questo gate sia verde.

## Addendum Production 2026-05-09

Production deploy finale:

- Alias: `https://www.elabtutor.school`.
- Deployment: `dpl_2NVVZ6yVYf2mBkHinTDBrCSxobN2`.

Fix CORS/CSP compile:

- Primo test production fast-active fallito per CORS su n8n diretto.
- Correzione: HTTPS browser usa Supabase `compile-proxy` e non chiama n8n diretto.
- Header CSP production verificato: `connect-src` non contiene `https://n8n.srv1022317.hstgr.cloud`.
- Unit/build:
  - `vitest-cors-csp-compile-production-fix.json`: PASS 17/17.
  - `npm-build-production-compile-proxy-fix.log`: PASS.

Performance production:

- Artifact: `playwright-unlim-performance-benchmark-production-main.json`.
- Verdict: FAIL.
- Primo run: `window.__ELAB_API` non pronto entro 7000 ms.
- Artifact rerun: `playwright-unlim-performance-benchmark-production-main-rerun.json`.
- Rerun verdict: FAIL.
- Rerun failures:
  - `apiReadyMs = 7899`, soglia 7000.
  - `firstMeaningfulTextMs = 7916`, soglia 7500.
  - `longTaskMaxMs = 1038`, soglia 750.
  - `compileP95Ms = 2003.3`, soglia 1500.
- Console errors: 0.

Conclusione production: CORS/CSP compile e fast action sono corretti; performance severa generale resta FAIL.
