# Audit Contributor Esterni — 2026-04-12

## Branch Attivi (non mergiati)

### Da mergiare (alto valore)

| Branch | Cosa fa | File | Rischio |
|--------|---------|------|---------|
| `work/fix/buildsteps-vol3-cap5-cap6` | Aggiunge buildSteps a 5 esp Vol3 | experiments-vol3.js | Basso — dati |
| `work/fix/unlim-memory-destroy-p3` | Fix memory leak unlimMemory + destroy() | unlimMemory.js | Medio — servizio critico |
| `work/fix/wcag-admin-helptext-contrast` | Fix contrasto WCAG admin #9CA3AF→#6B7280 | admin CSS | Basso — solo CSS |
| `work/fix/seo-twitter-og-keywords` | Twitter Card, keywords, og:site_name, schema | index.html | Basso — solo meta |
| `work/fix/seo-canonical-infra-worker` | canonical URL → elabtutor.school | index.html | Basso — solo meta |

### Da valutare (review necessaria)

| Branch | Cosa fa | Note |
|--------|---------|------|
| `work/fix/lavagna-volume-page-persistence` | localStorage persistence per volume/page | 145 test aggiunti, tocca unlimMemory |
| `work/fix/wcag-vetrina-unlimmemory-cleanup` | WCAG vetrina + cleanup unlimMemory | Overlap con altri fix |
| `work/fix/vitest-timeout-flaky-tests-g46` | Fix test flaky con timeout | Potrebbe risolvere problemi CI |

### Proposals (prototipi, non codice)

| Branch | Cosa fa | Gia mergiato? |
|--------|---------|---------------|
| `work/proposal/cap1-benvenuto-breadboard` | Prototipo Cap1 Benvenuto Breadboard (1266 righe JSX) | SI — mergiato in docs/prototipi/ |
| `work/proposal/vol3-tile-metafix` | Proposta fix overflow tile Vol3 (520 righe JSX) | SI — mergiato in docs/prototipi/ |
| `work/fix/experiment-picker-meta-overflow-v3` | Fix CSS overflow meta V3 Arduino cards | SI — mergiato |

### Branch auto/* (worker automatici)

30+ branch `auto/*` da sessioni precedenti del Ralph Loop. Tutti piccoli (1-3 commit), principalmente test. Non necessitano merge — il lavoro e' gia' stato consolidato nei merge precedenti.

## PR

| # | Titolo | Stato |
|---|--------|-------|
| 1 | feat: simulable labels + scratchXml validation | MERGED (10/04) |
| - | Nessuna PR aperta | - |

## Raccomandazioni

1. **Mergiare subito**: buildsteps-vol3-cap5-cap6 (5 esp in piu per la demo)
2. **Mergiare dopo review**: unlim-memory-destroy-p3 (fix leak reale)
3. **Mergiare dopo review**: seo-twitter-og-keywords + seo-canonical (SEO per vendita)
4. **Rimandare**: lavagna-volume-page-persistence (overlap con LavagnaShell attuale)
