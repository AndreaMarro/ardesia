# ARDESIA — stato corrente

> **GENERATO** da `bin/state/project_state.py` il 2026-10-15T21:11:39+02:00.
> Non modificarlo a mano: la prossima esecuzione lo sovrascrive.
> La forma leggibile a macchina e' `artifacts/state/project.json` (non committato).

Questo file e' l'unica dichiarazione di stato corrente del repo. Ogni
altro documento in `docs/ops/` e' un **registro storico**: descrive
l'istante in cui e' stato scritto, non l'istante in cui lo leggi.

## Repo

- `main` (origin): **b124eee0**
- HEAD locale: `4237f197` sul ramo `HEAD`
- file non committati nel checkout: 0

<sub>fonte: `git rev-parse HEAD | origin/main; git status --porcelain`</sub>

## Pull request aperte

**UNAVAILABLE** — --offline: nessuna chiamata di rete

## Check richiesti

**UNAVAILABLE** — --offline: nessuna chiamata di rete

## Deploy

- ultimo deploy (ricevuta): `3e170f838353181f8dab36da529377041418abc3`
- quando: 2026-07-31T01:30:00Z
- dove: https://ardesia-lavagna.vercel.app
- ricevuta pari a `main`: False · ricevute totali: 6

<sub>fonte: `docs/ops/deploys/2026-07-31T01-30Z-3e170f83.json`</sub>

- servito ADESSO dalla produzione: non misurata — --offline: nessuna chiamata di rete
- `prod_scarto` (servito ↔ `origin/main`): non misurato — SHA servita non misurata
- **pari a `main` in produzione: non misurato**

## Certificazione esperimenti

- corpus: **88** lesson path
- `candidate`: 4/88
- **certificati: 0/88**

<sub>fonte: `apps/studio/src/toolhost/elabExperimentCatalog.ts`</sub>

## Oracolo di prodotto (E2E)

- spec Playwright presenti: 117
- eseguite in CI: True
- golden path (`apps/studio/e2e/golden-path.spec.ts`) esiste: True

<sub>fonte: `rglob *.spec.{ts,tsx,js,mjs} e playwright.config.* (escluso node_modules); invocazione Playwright nei workflow, commenti rimossi`</sub>
