# PDR — Piano di Riferimento ELAB Tutor

**Aggiornato**: 23/03/2026 (S119 — autoresearch setup)
**Natura**: Piano iniziale. Può e DEVE divergere basandosi sui risultati.
**Principio Zero**: L'insegnante inesperto è il vero utente. Galileo è un libro intelligente e una guida invisibile. Tutti possono insegnare con ELAB Tutor.

---

## ARCHITETTURA AUTORESEARCH

Loop Python ogni 1h. Pattern Karpathy: modifica→misura→keep/discard.
5 modi: IMPROVE, RESEARCH, WRITE, AUDIT, EVOLVE.
Tutti i tool lavorano in concerto. Ricerca costante.
Il sistema si auto-migliora. Le metriche evolvono.

```
CICLO 1h:
  7 check (3 min) → select mode → AI tools → Claude headless (25 min) → report

  Mode IMPROVE: fix/build, misura con evaluate.py, keep/discard
  Mode RESEARCH: Semantic Scholar + Gemini market + paper findings
  Mode WRITE: articoli per marketing (Andrea Marro autore)
  Mode AUDIT: Playwright + Lighthouse + axe-core, crea task da bug
  Mode EVOLVE: rivedi metriche, migliora il sistema stesso
```

### Tool e Come Parlano

| Tool | Ruolo | Frequenza | Costo |
|------|-------|-----------|-------|
| Claude Code (`claude -p`) | Lavora: codice, fix, articoli, ricerca | Ogni ciclo | Abbonamento |
| DeepSeek R1 | Scoring risposte Galileo, giudizio qualità | Ogni 5 cicli | ~$0.14/M |
| Gemini 2.5 Pro | Market analysis, vision screenshot, ricerca | Ogni 10 cicli | Gratis |
| Kimi K2.5 | Code review, secondo parere, analisi competitor | Ogni 10 cicli | Gratis |
| Brain V13 | Routing proprietario nel nanobot | Sempre attivo | €4/mese |
| Semantic Scholar | Paper scan, ricerca accademica | Ogni 3 cicli | Gratis |
| Playwright | Test browser, navigazione come utente | Ogni check | Gratis |
| Lighthouse | Performance score | Ogni AUDIT | Gratis |
| axe-core | Accessibilità WCAG | Ogni AUDIT | Gratis |

### Metriche Ground Truth (evaluate.py)

| Metrica | Peso | Target | Stato attuale |
|---------|------|--------|---------------|
| galileo_tag_accuracy | 20% | ≥90% | 90% (9/10) |
| galileo_gulpease | 15% | ≥60 | 77 avg |
| galileo_identity | 15% | 0 leaks | 0 leaks |
| build_pass | 15% | true | ✅ |
| content_integrity | 10% | 62 exp | 62 ✅ |
| ipad_compliance | 10% | <5 small btns | 13 ⚠️ |
| lighthouse_perf | 5% | ≥80 | non misurato |

Queste metriche sono il punto di partenza. Il modo EVOLVE le rivede ogni 10 cicli.

---

## I 16 ASPETTI

### 1. Simulatore funzionalità (10.0/10)
Il cuore del prodotto. 21 componenti SVG, KVL/KCL solver, AVR emulation, 67 esperimenti.
**Piano**: mantenere, non rompere. Zero regressioni.

### 2. Simulatore estetica (8.5/10)
248 inline styles, padding inconsistente, grid misalignment.
**Piano**: migrazione incrementale a CSS vars + utility classes. Già create 15 classi `.u-*`.

### 3. iPad + LIM (8.8/10)
Touch ≥56px quasi ovunque, 13 bottoni ancora <44px sulla homepage.
**Piano**: audit Playwright automatico, fix bottoni rimanenti.

### 4. Arduino / Scratch / C++ (10.0/10)
41 blocchi, 35 pattern error translator, compilatore funzionante.
**Piano**: hover block→C++ tooltip (P2). Serial Monitor input field.

### 5. AI / Galileo (10.0/10)
5 specialisti (circuit, code, tutor, vision, teacher). Multi-provider racing.
**Piano**: teacher mode testing con insegnanti reali. Prompt improvement via DeepSeek scoring.

### 6. Insegnante — UTENTE REALE (3.5/10) ← PRIORITÀ
Teacher specialist creato ma non testato. No dashboard. No lesson plan generator.
**Piano**: questo è il GAP più grande. L'autoresearch deve concentrarsi qui.
- Pre-lezione mode migliorato con feedback DeepSeek
- Articoli "Come usare ELAB in classe" (modo WRITE)
- Ricerca su teacher adoption barriers (modo RESEARCH)

### 7. Contenuti / Percorso Volumi (9.5/10)
61/62 curriculum YAML. Vocab checker funzionante.
**Piano**: integrare vocab checker nella pipeline /chat del nanobot.

### 8. Performance (8.0/10)
Build 19s. Bundle 1.1MB gzip per ElabTutor. No Lighthouse baseline.
**Piano**: Lighthouse in ogni AUDIT. Ottimizzare i chunk più grandi.

### 9. PWA / Offline (7.0/10)
Service worker generato (99 entries precache). Nessun test offline reale.
**Piano**: testare con Playwright in modalità offline. Fallback Galileo.

### 10. Sicurezza / Accessibilità (9.2/10)
CSP, HSTS, focus-visible, aria-labels. No axe-core automatico.
**Piano**: axe-core in ogni AUDIT. Fix risultati.

### 11. Design / UX (8.0/10)
Funzionale ma non delightful. Split-attention sui pannelli.
**Piano**: BackstopJS visual regression. Split-attention fix (istruzioni sopra breadboard).

### 12. i18n (0/10)
Zero. Solo italiano.
**Piano**: P2. react-i18next + EN + ES. Galileo multilingua.

### 13. Business / Mercato (1/10)
Nessun marketing. Nessun content. Nessun outreach.
**Piano**: modo WRITE produce articoli. Gemini analizza competitor. Kimi review strategia.

### 14. Ricerca continua (3/10)
Semantic Scholar integrato ma mai usato sistematicamente.
**Piano**: OGNI 3 cicli una ricerca. Findings in knowledge/. Task concreti da paper.
Ricerca costante di soluzioni, idee, approcci. Massima onestà sui risultati.

### 15. Sistemi locali / velocità (2/10)
Brain V13 su VPS. Nessuna ottimizzazione locale.
**Piano**: futuro. Quantizzazione, compile cache, WASM solver.

### 16. Cluster scuola (0/10)
Zero. Concetto futuro.
**Piano**: dopo che i punti 6-14 sono solidi.

---

## PRIORITÀ (può divergere)

### Settimana 1 — Fondamenta
- [x] Loop funzionante end-to-end
- [x] 7 check che passano
- [x] Curriculum YAML 98%
- [x] Teacher specialist
- [ ] **Lanciare il loop con start.sh**
- [ ] **Primo ciclo WRITE (articolo)**
- [ ] **Primo ciclo RESEARCH (paper)**
- [ ] **Primo ciclo AUDIT (Lighthouse + axe)**

### Settimana 2 — Insegnante al centro
- [ ] Teacher dashboard skeleton
- [ ] 5 articoli "Come usare ELAB" in automa/articles/
- [ ] Vocab checker nella pipeline /chat
- [ ] DeepSeek scoring funzionante su 50 risposte
- [ ] Gemini competitor analysis salvata in knowledge/

### Settimana 3 — Scala
- [ ] i18n EN + ES
- [ ] PWA offline testato
- [ ] BackstopJS visual regression baseline
- [ ] Brain V14 retraining su dati cicli
- [ ] 10 articoli totali

### Futuro — Il sistema decide
L'autoresearch dopo 3 settimane avrà abbastanza dati (results.tsv, paper, articoli,
scoring DeepSeek) per decidere autonomamente le priorità. Il PDR diventa un punto
di partenza storico, non un vincolo.

---

## VINCOLI NON NEGOZIABILI

1. Zero regressioni (`npm run build` sempre verde)
2. L'insegnante inesperto è il vero utente
3. Andrea Marro è l'autore di tutto (watermark)
4. iPad e LIM centrali (touch ≥56px)
5. Linguaggio LIM 10-14 anni
6. CoV su ogni output
7. Massima onestà — numeri reali, mai compiacenza
8. Budget ~€20/mese (escluso Claude)
9. I sistemi si parlano (DeepSeek↔Gemini↔Kimi↔Brain)
10. Ricerca costante — ogni ciclo porta valore concreto

---

## COSTI

| Voce | Costo/mese |
|------|-----------|
| Claude Code | abbonamento (già pagato) |
| DeepSeek R1 | ~$5 (scoring + judge) |
| Gemini 2.5 Pro | $0 (free tier) |
| Kimi K2.5 | $0 (free tier) |
| Brain VPS | €4 |
| Lighthouse/axe/Playwright | $0 |
| Semantic Scholar | $0 |
| **TOTALE** | **~€10/mese** |
