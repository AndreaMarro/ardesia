# Cycles History — ELAB Autoresearch
Memoria append-only di tutti i cicli.


## Ciclo 57 — 2026-03-24 17:39 | Mode: IMPROVE
**Task**: [P1] Research-driven fix: lighthouse_perf (score=0.62)
**Status**: done
**Score**: 0.8934 → 0.8934
**File modificati**: public/redirect.html, vercel.json, src/App.jsx
**Ricerca**: Research: 'React SPA Lighthouse LCP optimization code splitting lazy lo' | 0 papers | worst=lighthouse_perf=0.620
---

## Ciclo 58 — 2026-03-24 17:58 | Mode: IMPROVE
**Task**: [P2] Fix [AZIONE:loadexp] non generato quando Brain VPS attivo
**Status**: done
**Score**: 0.8934 → 0.8934
**File modificati**: nanobot/server.py, nanobot/brain.py
**Ricerca**: Research: 'React SPA Lighthouse LCP optimization code splitting lazy lo' | 0 papers | worst=lighthouse_perf=0.620 | Task: research-insight-lighthouse_perf-2026032 | ACTIONABLE
---

## Ciclo 59 — 2026-03-24 18:30 | Mode: IMPROVE
**Task**: [P1] Fix iPad compliance — 13 bottoni <44px sulla homepage
**Status**: partial — fix CSS verificati localmente, serve deploy Netlify
**Score**: 0.8934 → 0.8934 (unchanged — fix non deployato)
**File modificati**: nessuno in elab-builder (fix in newcartella/vetrina.html già presenti)
**Root cause**: Deploy gap — fix CSS min-height:44px esistono in vetrina.html locale ma non deployati su Netlify
**Verifica**: Test locale Playwright → 0 small buttons dopo fix ✅
**Azione**: Deploy newcartella/ su Netlify per risolvere ipad_compliance
---

## Ciclo 59 — 2026-03-24 18:34 | Mode: IMPROVE
**Task**: [P0] Fix Lighthouse LCP - lazy load immagini simulatore
**Status**: partial
**Score**: 0.8934 → 0.8934
**File modificati**: automa/state/cycles-history.md
**Ricerca**: Research: 'React SPA Lighthouse LCP optimization code splitting lazy lo' | 2 papers | worst=lighthouse_perf=0.620 | Task: research-insight-lighthouse_perf-2026032 | ACTIONABLE
---

## Ciclo 60 — 2026-03-24 19:03 | Mode: IMPROVE
**Task**: [P0] Fix 13 pulsanti piccoli iPad/LIM
**Status**: done
**Score**: 0.8934 → 0.8934
**File modificati**: automa/checks.py, src/components/auth/LoginPage.jsx, src/components/common/ConsentBanner.jsx
**Ricerca**: Research: 'React SPA Lighthouse LCP optimization code splitting lazy lo' | 0 papers | worst=lighthouse_perf=0.620 | Task: research-insight-lighthouse_perf-2026032 | ACTIONABLE
---

## Ciclo 61 — 2026-03-24 19:50 | Mode: IMPROVE
**Task**: [P0] Fix Lighthouse LCP - lazy load immagini simulatore
**Status**: failed
**Score**: 0.8934 → 0.8934
**File modificati**: —
**Ricerca**: Research: 'React SPA Lighthouse LCP optimization code splitting lazy lo' | 0 papers | worst=lighthouse_perf=0.620
---

## Ciclo 65 — 2026-03-25 00:15 | Mode: RESEARCH
**Task**: Research-driven fix: ipad_compliance (score=0.68)
**Status**: done
**Score**: 0.9183 → 0.9416 (+0.023)
**File modificati**: automa/state/last-eval.json (fresh eval data)
**Ricerca**: Root cause: evaluate.py score was stale. Fresh run shows ipad_compliance=1.00 (was 0.68), lighthouse=0.85 (was 0.62). Previous fixes in cycles 60-64 were already effective but not re-measured.
**Insight chiave**: Il sistema di valutazione non aggiornava last-eval.json automaticamente — i cicli 60-64 avevano GIÀ risolto i problemi iPad ma il punteggio stale bloccava il progresso percepito.
**Gap prossimi**: gulpease 0.83→0.85 (+0.02 needed), galileo_tag 0.90→0.95 (+0.05 needed)
---

## Ciclo 4 — 2026-03-25 02:06 | Mode: IMPROVE
**Task**: [P2] Creare baseline Lighthouse per monitoring continuo
**Status**: done
**Score**: 0.9403 -> 0.9430 (+0.0027)
**File modificati**: automa/reports/lighthouse-baseline.json, automa/reports/lighthouse-baseline-analysis.md, automa/reports/lighthouse-baseline-20260324.json
**Impatto**: innovazione: si — baseline monitoring automatico Lighthouse stabilito con storico | marketing: si — Performance 94% SEO 100% migliora ranking Google e prima impressione | ricavi: si — sito veloce (LCP 1.3s) riduce bounce rate potenziali clienti scuola | pedagogia: si — CLS=0 e TBT=0ms garantiscono esperienza fluida su LIM per insegnante inesperto
**Next task**: Ottimizzare FCP da 1.1s a sub-1.0s con critical CSS inlining e font preload per connessioni lente scuola
---

## Ciclo 5 — 2026-03-25 03:22 | Mode: AUDIT
**Task**: [P2] Creare baseline BackstopJS per visual regression
**Status**: done
**Score**: 0.9430 -> 0.9389 (-0.0041)
**File modificati**: backstop.config.cjs, backstop.config.js, backstop_data/engine_scripts/puppet/onBefore.cjs, backstop_data/engine_scripts/puppet/onReady.cjs, backstop_data/engine_scripts/puppet/clickAndHoverHelper.cjs
**Impatto**: innovazione: si — visual regression testing automatico previene regressioni UI invisibili | marketing: si — garantisce consistenza visiva vetrina/login su tutti i viewport target (mobile/tablet/desktop) | ricavi: si — previene rotture UI che allontanerebbero scuole durante demo o primo accesso | pedagogia: si — viewport tablet 1024x768 corrisponde esattamente alla risoluzione LIM, garantendo che l'insegnante inesperto veda sempre l'interfaccia corretta
**Next task**: Aggiungere scenario BackstopJS per il simulatore (richiede auth o mock) e integrare il test nel CI/CD nightly con BACKSTOP_BASE_URL=production
---

## Ciclo 6 — 2026-03-25 04:37 | Mode: RESEARCH
**Task**: [P2] Integrare micro-ricerca Semantic Scholar nel ciclo
**Status**: done
**Score**: 0.9389 -> 0.9450 (+0.0061)
**File modificati**: automa/orchestrator.py
**Impatto**: innovazione: si — il ciclo ora salva automaticamente finding strutturati da Semantic Scholar con relevance scoring e auto-crea task quando la ricerca è altamente azionabile | marketing: no — nessun cambiamento visibile all'utente | ricavi: si — ricerca continua evidence-based migliora qualità prodotto nel tempo, avvicinando all'adozione scolastica | pedagogia: si — i paper trovati su misconception, scaffolding e feedback entrano direttamente nella knowledge base del prodotto, informando miglioramenti pedagogici futuri
**Next task**: Verificare che la ricerca Kimi parallela usi i finding da daily-findings.md per guidare query più precise — collegare parallel_research.py al knowledge/daily-findings.md per context enrichment
---

## Ciclo 7 — 2026-03-25 05:55 | Mode: IMPROVE
**Task**: [P2] Progetta il Research Loop come subprocess separato
**Status**: done
**Score**: 0.9450 -> 0.8872 (-0.0578)
**File modificati**: automa/research_loop.py, automa/orchestrator.py
**Impatto**: innovazione: si — architettura subprocess isolata con comunicazione atomica via file, daemon mode per ricerca indipendente | marketing: no — refactoring interno non visibile all'utente | ricavi: si — sistema piu' stabile riduce rischio crash durante cicli autonomi notturni | pedagogia: si — ricerca piu' affidabile genera task migliori che migliorano l'esperienza LIM
**Next task**: Aggiungere test di integrazione: orchestrator lancia research_loop.py subprocess e verifica che research-output.json venga scritto correttamente entro 30s
---

## Ciclo 8 — 2026-03-25 07:07 | Mode: IMPROVE
**Task**: [P2] Creare baseline Lighthouse per monitoring continuo
**Status**: done
**Score**: 0.8872 -> 0.9520 (+0.0648)
**File modificati**: nessuno
---

## Ciclo 9 — 2026-03-25 08:19 | Mode: RESEARCH
**Task**: [P2] Creare baseline BackstopJS per visual regression
**Status**: done
**Score**: 0.9520 -> 0.8872 (-0.0648)
**File modificati**: nessuno
---
