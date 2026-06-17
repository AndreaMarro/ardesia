# Piano 10 Micro-Cicli — Ordinati per Impatto Composite

**Data**: 24/03/2026
**Baseline**: composite=0.7225
**Target ciclo 10**: composite≥0.78

Ogni ciclo: 1 goal → azione → misura → keep/discard.
Durata stimata: 25 min di lavoro Claude + evaluate.py.

---

## Ciclo 1 — IMPROVE: Galileo Latency (P0)
**Task**: P0-033-galileo-latency
**Why now**: Score 0.0, peso 5%. Portarlo a 0.5 = +0.025 composite.
Ma soprattutto: **BLOCKER per usabilità reale**.
**Azione**: Analizzare breakdown latenza. Implementare cache risposte frequenti in nanobot. O streaming SSE.
**Rischio**: Richiede modifica server-side (nanobot su Render).
**Gate**: galileo_latency score > 0.3. No regressioni.
**Impatto atteso**: composite +0.015 a +0.025

## Ciclo 2 — IMPROVE: iPad Buttons (P1)
**Task**: P1-035-ipad-buttons-final
**Why now**: Score 0.5, peso 10%. Portarlo a 0.9 = +0.04 composite.
**Azione**: Fix CSS `min-height: var(--touch-min, 44px)` su 13 bottoni homepage.
**Rischio**: Basso — solo CSS.
**Gate**: ipad_compliance score > 0.9. Build verde.
**Impatto atteso**: composite +0.03 a +0.04

## Ciclo 3 — IMPROVE: Console Errors (P2)
**Task**: P2-038-console-errors
**Why now**: Score 0.8, peso 5%. Portarlo a 1.0 = +0.01 composite.
Quick win, aumenta affidabilità.
**Azione**: Playwright → cattura errore → fix → verify.
**Rischio**: Basso.
**Gate**: console_errors score = 1.0.
**Impatto atteso**: composite +0.01

## Ciclo 4 — IMPROVE: Gulpease (P1)
**Task**: P1-037-gulpease-improve
**Why now**: Score 0.60, peso 15%. Portarlo a 0.75 = +0.022 composite.
Migliora la qualità pedagogica reale.
**Azione**: Modificare system prompt nanobot per frasi più corte e semplici.
**Rischio**: Medio — potrebbe rompere tag accuracy o identity.
**Gate**: gulpease score > 0.70. tag_accuracy invariata. identity invariata.
**Impatto atteso**: composite +0.015 a +0.022

## Ciclo 5 — AUDIT: Simulazione Docente Inesperto (P1)
**Task**: P1-034-sim-docente-inesperto
**Why now**: Zero test utente reale. Produce task concreti.
**Azione**: Playwright: apri sito → naviga come docente → documenta frizioni.
**Rischio**: Potrebbe rivelare problemi che invalidano piano.
**Gate**: Report con ≥5 problemi, ≥2 nuovi task YAML.
**Impatto atteso**: composite invariato, ma genera backlog reale.

## Ciclo 6 — IMPROVE: Lighthouse Performance (P2)
**Task**: P2-039-lighthouse-perf
**Why now**: Score 0.62, peso 5%. Portarlo a 0.75 = +0.007.
Migliora esperienza su hardware scolastico.
**Azione**: Lazy loading react-pdf, preload critical CSS.
**Rischio**: Medio — code-split potrebbe rompere routing.
**Gate**: lighthouse score > 0.70. Build verde.
**Impatto atteso**: composite +0.005 a +0.007

## Ciclo 7 — RESEARCH: Pedagogia Misconcezioni Elettricità (P2)
**Task**: P2-036-ricerca-pedagogia
**Why now**: Ricerca che produce task concreti per prompt Galileo.
**Azione**: Semantic Scholar → top 3 paper → findings → 1 task YAML.
**Rischio**: Basso (ricerca).
**Gate**: ≥1 misconcezione documentata. ≥1 task YAML creato.
**Impatto atteso**: composite invariato, ma qualità pedagogica futura.

## Ciclo 8 — IMPROVE: Prompt Interni Galileo (P2)
**Task**: P2-031-ricerca-prompt-interni
**Why now**: Dopo cicli 4 e 7, abbiamo dati per migliorare prompt.
**Azione**: Test 5 domande, analisi con DeepSeek, proposta modifica.
**Rischio**: Medio — modifica prompt può degradare altri aspetti.
**Gate**: tag_accuracy ≥ 0.9, gulpease migliorato. identity invariata.
**Impatto atteso**: composite +0.01 a +0.02 (via gulpease + tags)

## Ciclo 9 — AUDIT: Bug Estetica (P2)
**Task**: P2-032-ricerca-bug-estetica
**Why now**: Screenshot reali per trovare problemi visivi.
**Azione**: Playwright desktop + iPad screenshot → documenta inconsistenze.
**Rischio**: Basso.
**Gate**: ≥3 bug documentati con screenshot. ≥2 task YAML.
**Impatto atteso**: backlog miglioramento UX.

## Ciclo 10 — EVOLVE: Review Metriche + Stato
**Why now**: Dopo 9 cicli, valutare cosa funziona.
**Azione**: Rieseguire evaluate.py. Confrontare con baseline. Aggiornare PDR.
**Rischio**: Nessuno.
**Gate**: evaluate.py eseguita. PDR aggiornato. state.json allineato a evaluate.py.
**Impatto atteso**: composite target ≥0.78

---

## Impatto Cumulativo Stimato

| Ciclo | Metrica target | Score attuale → target | Delta composite |
|-------|---------------|----------------------|-----------------|
| 1 | galileo_latency | 0.00 → 0.40 | +0.020 |
| 2 | ipad_compliance | 0.50 → 0.90 | +0.040 |
| 3 | console_errors | 0.80 → 1.00 | +0.010 |
| 4 | galileo_gulpease | 0.60 → 0.72 | +0.018 |
| 5 | (audit) | — | +0.000 |
| 6 | lighthouse_perf | 0.62 → 0.72 | +0.005 |
| 7 | (research) | — | +0.000 |
| 8 | galileo_tags/gulp | marginal | +0.010 |
| 9 | (audit) | — | +0.000 |
| 10 | (evolve) | — | +0.000 |
| **TOTALE** | | | **+0.103** |

**Composite stimato dopo 10 cicli: 0.7225 + 0.103 = ~0.826**

Questo sarebbe un risultato reale e misurabile. Target 0.78 è conservativo.
