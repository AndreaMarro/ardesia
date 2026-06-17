# ELAB Automa — Architettura di Sistema Completa

Data: 2026-03-23
Versione: v2-strict
Composite baseline: 0.7225

## Come funziona — Spiegazione semplice

Il sistema è una **fabbrica automatica** che lavora 24/7 per migliorare ELAB Tutor.
Ha 3 livelli: un caposquadra (orchestrator), un operaio (Claude -p), e dei consulenti (DeepSeek/Kimi/Gemini).

### Flusso di un ciclo (ogni ~15-30 minuti)

```
START
  → Controlla se c'è un ordine da te (DISPATCH)
  → Recupera task bloccati in active/ (crash recovery)
  → 7 controlli qualità automatici (health, build, galileo, content, gulpease, browser, ipad)
  → Sceglie cosa fare (round-robin: IMPROVE → RESEARCH → WRITE → AUDIT)
  → Prende 1 task dalla coda (priorità P0 > P1 > P2)
  → Compone il prompt (6 sezioni: TASK/CONTEXT/REFERENCE/SUCCESS/RULES/PLAN)
  → Lancia claude -p (GRATIS — incluso nell'abbonamento)
  → Claude lavora: legge codice, edita, builda, testa, verifica
  → evaluate.py misura il composite score (9 metriche severe)
  → micro-research: chiede a DeepSeek e Kimi insight sul prossimo task
  → Salva report, aggiorna budget, log risultati
  → Controlla regressioni (CoV inter-ciclo)
  → 30 secondi di pausa
  → PROSSIMO CICLO
```

## File system — Cosa sta dove

```
automa/
├── orchestrator.py      — Cervello del loop (870 righe)
├── agent.py             — Agent SDK fallback con 16 tool (520 righe)
├── tools.py             — Wrapper API: DeepSeek, Gemini, Kimi, Semantic Scholar
├── checks.py            — 7 verifiche automatiche
├── evaluate.py          — Score composito v2 STRICT (9 metriche, DO NOT MODIFY)
├── queue_manager.py     — Coda FIFO con file YAML
├── context_db.py        — SQLite per knowledge persistente
├── dispatch.sh          — Script per interrogare il loop senza fermarlo
├── start.sh             — Launcher originale
├── START-LOOP.md        — PROMPT DI AVVIO per nuova sessione
├── .env                 — API keys (gitignored!)
├── HALT                 — touch per fermare il loop
├── DISPATCH             — file per comandi dispatch
├── PDR.md               — Priority plan (16 aspetti)
├── program.md           — Istruzioni alto livello
│
├── queue/
│   ├── pending/         — Task da fare (YAML) — 12 task ora
│   ├── active/          — Task in corso (max 1)
│   ├── done/            — Task completati (26)
│   └── failed/          — Task falliti (2)
│
├── state/
│   ├── state.json       — Stato loop + budget + scores
│   ├── last-eval.json   — Ultimo composite score (0.7225)
│   ├── context.db       — SQLite: 10 knowledge entries pulite
│   ├── heartbeat        — Timestamp ultimo ciclo
│   ├── research-log.md  — Log ricerche (append-only)
│   └── ai-feedback.log  — Log scoring AI
│
├── reports/             — 1 JSON per ciclo completato
├── knowledge/           — Ricerche salvate (.md) — QUESTA DIRECTORY
├── blueprints/          — Blueprint loop futuri
├── articles/            — Articoli generati
├── logs/                — Log orchestrator + claude -p
└── profiles/            — Profili studente per test
```

## Le 9 metriche di evaluate.py v2 STRICT

| # | Metrica | Peso | Cosa misura | Score attuale |
|---|---------|------|-------------|--------------|
| 1 | build_pass | 15% | Compila + warning + bundle size | 0.90 |
| 2 | galileo_tag_accuracy | 15% | Galileo capisce 10 comandi | 0.90 |
| 3 | galileo_gulpease | 10% | Risposte semplici per bambini (target 85+) | 0.60 |
| 4 | galileo_identity | 10% | Non rivela di essere LLM | 1.00 |
| 5 | galileo_latency | 10% | Risponde in < 5s | 0.00 ❌ |
| 6 | content_integrity | 10% | 62 esperimenti strutturati | 1.00 |
| 7 | ipad_compliance | 10% | Touch target ≥ 44px, no overflow | 0.50 |
| 8 | lighthouse_perf | 10% | Performance Lighthouse | 0.62 |
| 9 | console_errors | 10% | Zero JS errors in produzione | 0.80 |

COMPOSITE = media pesata = **0.7225**

## Tool, Skill, Plugin usati

### Tool AI nel loop (costi centesimi)
- **DeepSeek R1** (deepseek-reasoner): Ragionamento profondo, scoring, analisi. ~€0.005/call
- **Gemini 2.5 Flash** (gemini-2.5-flash): Analisi rapida, competitor. ~€0.0003/call
- **Kimi K2.5** (moonshot-v1-auto): Review 128K context + vision per screenshot. ~€0.001/call
- **Semantic Scholar API**: Paper accademici gratis
- **Playwright**: Screenshot, test E2E, iPad check
- **Lighthouse**: Performance audit

### Skill Claude Code
- `automa-loop` — Gestione loop (start, stop, status, add-task)
- `quality-audit` — Audit qualità WCAG, font, touch
- `arduino-simulator` — Compilatore + AVR emulation
- `tinkercad-simulator` — Simulatore visuale circuiti

### Plugin attivi
- **Firecrawl** — Web scraping per competitor research
- **Context7** — Documentazione up-to-date di librerie
- **Playwright** — Test E2E automatici
- **Pinecone** — Potenziale per ricerca semantica knowledge

### Infrastruttura
- **Claude Code** (abbonamento): Worker principale — GRATIS per il loop
- **Brain VPS** (72.60.129.50:11434): Ollama con galileo-brain-v13 (Qwen3.5-2B Q5_K_M)
- **Nanobot** (Render): Backend AI tutor Galileo
- **Vercel**: Deploy frontend elabtutor.school

## Come evolve il PDR

Il PDR (Priority Decision Record) in `automa/PDR.md` è il documento vivente che guida le priorità.
Si aggiorna:
1. **Dopo ogni audit** — le priorità cambiano in base a evidenze
2. **Quando il composite cambia** — metriche basse salgono di priorità
3. **Quando arrivano ordini dispatch** — l'umano può cambiare priorità
4. **Quando la ricerca produce findings** — nuovi rischi o opportunità

## I primi 12 task in coda (ordinati per priorità)

| # | Priorità | Task | Impatto atteso |
|---|----------|------|---------------|
| 1 | **P0** | Fix Galileo latency 17.6s → <5s | composite +0.10 |
| 2 | **P1** | Simulazione docente inesperto | Trova 5+ problemi reali |
| 3 | **P1** | iPad bottoni da 13 a 0 piccoli | composite +0.05 |
| 4 | **P1** | Gulpease risposte Galileo 74→85+ | composite +0.04 |
| 5 | P2 | Ottimizzazione prompt interni Galileo | Qualità risposte |
| 6 | P2 | Audit visivo completo | Bug estetici |
| 7 | P2 | Ricerca pedagogia actionable | Misconcezioni elettricità |
| 8 | P2 | Console errors → 0 | composite +0.02 |
| 9 | P2 | Lighthouse performance 62→75+ | composite +0.03 |
| 10 | P2 | Blueprint Research Loop | Infrastruttura futura |
| 11 | P2 | Blueprint Memory Loop | Infrastruttura futura |
| 12 | P2 | Ricerca voice/NLU pipeline | Prototipo futuro |

## Come le cose si legano

```
DISPATCH (tu) ──────────────────────────────────────────────┐
                                                             │
evaluate.py (giudice) ◄──── orchestrator.py (caposquadra) ◄─┘
     │                            │
     │ composite score            │ prompt 6 sezioni
     │                            │
     ▼                            ▼
results.tsv ◄──────────── claude -p (operaio)
state.json                        │
last-eval.json                    │ modifica codice
                                  │ build + test
                                  ▼
                           ELAB Tutor (prodotto)
                                  │
                                  │ verifica
                                  ▼
                         elabtutor.school (live)
                                  │
                                  │ feedback
                                  ▼
                    micro-research (DeepSeek/Kimi)
                                  │
                                  │ knowledge
                                  ▼
                         context.db (memoria)
                                  │
                                  │ contesto nel prompt
                                  ▼
                      prossimo ciclo (loop)
```

## Budget

| Voce | Costo/giorno | Costo/mese |
|------|-------------|------------|
| claude -p (tutti i modi) | €0.00 | €0.00 |
| DeepSeek (micro-research + scoring) | ~€0.15 | ~€4.50 |
| Kimi (micro-research + review) | ~€0.05 | ~€1.50 |
| Gemini (scoring + analysis) | ~€0.03 | ~€1.00 |
| **TOTALE** | **~€0.23** | **~€7.00** |

Budget mensile: €50. Uso: ~€7. Margine: €43.

## Loop futuri (da costruire, NON ancora attivi)

| Loop | Scopo | Stato |
|------|-------|-------|
| Loop 2 — Research | Ricerca autonoma stile autoresearch | Blueprint da fare |
| Loop 3 — Eval | Valutazione continua, regression test | Blueprint da fare |
| Loop 4 — Memory | Memoria strutturata 4 strati | Blueprint da fare |
| Loop 5 — Voice/NLU | Pipeline ASR→intent→DSL→validator→sim | Ricerca in corso |
| Loop 6 — Competitor | Monitoraggio competitor con Firecrawl | Concetto |
| Loop 7 — GDPR/Safety | Compliance, privacy, data minimization | Concetto |
