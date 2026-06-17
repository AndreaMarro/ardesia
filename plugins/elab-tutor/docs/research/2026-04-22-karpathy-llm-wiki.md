# Karpathy LLM Wiki — Valutazione ELAB Tutor

**Data**: 2026-04-22
**Autore**: Claude Opus 4.7 (CoV Andrea Marro)
**Fonte**: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
**Video**: Simone Rizzo (rizzoaiacademy.com), 22/04/2026
**Status**: PROPOSED — candidato Sprint 5 INTELLIGENCE

---

## 1. Pattern Karpathy (sintesi verificata)

Three-layer architecture:

1. **Raw Sources** (immutable) — documenti originali, LLM non modifica mai
2. **Wiki** (LLM-owned markdown) — pagine concepts/entities/summaries/cross-refs
3. **Schema** (CLAUDE.md-like) — convenzioni + ingest workflow + maintenance rules

Core operations:
- **Ingest**: nuova fonte → LLM aggiorna 10-15 file automaticamente
- **Query**: user domanda → LLM cerca wiki → risponde con citations
- **Lint**: health check periodico → contradictions/stale/orphan detection

File critici:
- `index.md` — catalog content-oriented, LLM legge per primo
- `log.md` — append-only audit (ingest, query, maintenance)

**Claim centrale Karpathy**:
> "The wiki is a persistent, compounding artifact. The cross-references are already there. The contradictions have already been flagged."

**Shift burden**: bookkeeping da umani (abbandonano wiki) a LLM (eccelle).

---

## 2. Rilevanza ELAB (analisi onesta)

### Attuale stato ELAB
- RAG 549 chunk in `src/data/rag-chunks.json` (volumi + glossario + FAQ + errori + analogie + codice)
- `searchRAGChunks()` in `src/data/unlim-knowledge-base.js`
- Embeddings pgvector su Supabase (246 chunk live)
- Fragment retrieval per query (cold, ogni volta)

### Gap coperti da Wiki pattern

| Gap attuale ELAB | Copertura Wiki |
|---|---|
| Memoria studente sessioni passate (3-tier `unlimMemory` ma volatile) | `students/[uuid].md` compound persistente |
| Dashboard docente senza insight aggregati | `classrooms/[class_key].md` auto-generato |
| Analogie che funzionano non vengono capitalizzate | `concepts/*.md` evolutivi con log analogie vincenti |
| Audit trail Principio Zero v3 inesistente | `log.md` append-only per ogni query/ingest |
| Contraddizioni tra volumi non rilevate | Lint cron identifica |

### Gap NON coperti (dove RAG resta)
- Citazione pagina esatta volume (Principio Zero v3 richiede `Vol. N p. X` letterale) → RAG pgvector atomicità chunk→pagina superiore
- Latency query cold start: wiki richiede 3-5 file read = +500ms vs RAG embedding lookup <100ms

**Conclusione**: NON sostituzione, AFFIANCAMENTO.

---

## 3. Design ibrido proposto ELAB

```
Tier 1 IMMUTABLE (RAG pgvector esistente)
├── Volumi 92 esperimenti + pagine
├── Glossario termini tecnici
└── FAQ pre-generate

Tier 2 MUTABLE (Wiki markdown nuovo)
├── docs/unlim-wiki/concepts/*.md     # analogie evolutive
├── docs/unlim-wiki/experiments/*.md  # enriched con lessons from sessions
└── docs/unlim-wiki/lessons/*.md      # pattern docente

Tier 3 PERSONAL (Wiki markdown nuovo)
├── docs/unlim-wiki/students/[uuid].md    # compound memory
└── docs/unlim-wiki/classrooms/[key].md   # teacher insights

Tier 4 AUDIT (log append-only nuovo)
└── docs/unlim-wiki/log.md            # compliance Principio Zero v3
```

### Struttura proposta

```
docs/unlim-wiki/
├── SCHEMA.md                      # convenzioni + ingest workflow
├── index.md                       # catalog (LLM legge first)
├── log.md                         # append-only audit
├── concepts/
│   ├── led.md
│   ├── resistenza.md
│   ├── legge-ohm.md
│   ├── tensione.md
│   ├── corrente.md
│   ├── arduino-digital-pin.md
│   └── ...                        # 20-30 file
├── experiments/
│   ├── v1-cap6-esp1.md           # 1 file per esperimento
│   └── ...                        # 92 file
├── lessons/
│   ├── lezione-01.md
│   └── ...                        # 27 file
├── students/
│   ├── SCHEMA.md                  # template student memory
│   └── [uuid].md                  # 1 per studente attivo
├── classrooms/
│   ├── SCHEMA.md
│   └── [class_key].md             # 1 per classe
└── errors/
    ├── common-misconceptions.md
    └── frequent-patterns.md
```

---

## 4. Implementazione (stima onesta)

### Fase 1: Skeleton (2h)
- Crea `docs/unlim-wiki/` structure
- Scrivi `SCHEMA.md` con convenzioni ELAB (Principio Zero v3 rules, markdown conventions, cross-ref format)
- Genera `index.md` stub
- Inizializza `log.md`

### Fase 2: Ingest batch 92 esperimenti (~$5 Together AI)
- Script `scripts/wiki-ingest-experiments.mjs`
- Per ogni esperimento in `volume-references.js`: LLM call → genera `experiments/<id>.md`
- Include: pagina volume, bookText, componenti, concetti, errori comuni
- Batch notturno, ~1h

### Fase 3: Ingest batch 27 lezioni + 20-30 concetti (~$3 Together AI)
- Script `scripts/wiki-ingest-lessons.mjs`
- Per ogni lezione: LLM sintetizza da esperimenti correlati
- Estrae concetti ricorrenti → genera `concepts/*.md`

### Fase 4: Edge Function `unlim-wiki-query` (4h)
- Supabase Edge Function
- Input: user query + student_uuid + class_key
- Reads: `index.md` → ricerca rilevante → legge 3-5 file specifici
- Output: risposta con citations `[wiki:concepts/led.md]` + `[volume:Vol1 p.29]`
- Log: append entry a `log.md`

### Fase 5: Edge Function `unlim-wiki-ingest-session` (3h)
- Triggered da fine sessione studente
- Input: session transcript + student_uuid
- Reads: `students/[uuid].md` + touched `experiments/*.md`
- Writes: student file updated + experiments file enriched
- Log append

### Fase 6: Lint cron (2h)
- Cron Supabase settimanale
- Reads all wiki files
- Detects: contradictions tra concepts, stale (>90gg senza update), orphan (no inbound refs)
- Output: `docs/unlim-wiki/lint-report-YYYY-MM-DD.md`

**Totale dev**: ~16h = 2 giorni Sprint pieno
**Costo API ingest iniziale**: ~$8 one-shot
**Costo runtime steady state**: ~$0.005/query (5K tok wiki reads)

---

## 5. Timeline integrazione PDR

**NON toccare Sprint 3 (running)**. Sprint 3 è stabilization Vercel AI SDK + Dashboard Edge Function.

**Candidato Sprint 5 INTELLIGENCE (Day 29-35)**, coerente con:
- Day 29-32: 33 tools ONNIPOTENZA → aggiungere 3 tool wiki (`wiki_query`, `wiki_ingest_session`, `wiki_lint`)
- Day 33-35: RAG avanzato → refactor per ibrido RAG+Wiki

Pre-requisiti:
- Sprint 4 OMNISCIENCE (knowledge consolidation) deve essere completo
- BOM kit Omaric finalizzato (per experiments/*.md accuracy)
- Dashboard docente base (per classrooms/*.md UI)

---

## 6. Rischi e mitigations

| Rischio | Prob | Impact | Mitigation |
|---|---|---|---|
| `index.md` cresce > 5K tok, mangia context | Alta | Medio | Sharding per directory (concepts/, experiments/, students/) con `index.md` per dir |
| `log.md` append-only cresce lineare senza limite | Alta | Alto | Rotation mensile: `log-2026-05.md`, aggregate summary in `log-index.md` |
| Drift wiki vs volumi (LLM inventa) | Medio | Alto (Principio Zero violation) | Lint cron + guard: ogni pagina wiki deve citare fonte `[volume:V1p29]` |
| Student privacy GDPR (students/uuid.md contiene progresso) | Alta | Alto | Storage Supabase con RLS, anonymization uuid, retention 90gg |
| Costo Together AI ingest > preventivo | Media | Basso | Batch notturno one-shot, cache content-addressable |
| LLM contraddice wiki esistente in query | Media | Medio | Query prompt: "leggi wiki PRIMA di rispondere, cita [wiki:..]" |

---

## 7. Prossimo step

1. **QUESTO DOC** (questo file) = paper trail decisionale
2. **Sprint 3 completion** (loop corrente Day 02+) — NON interrompere
3. **Sprint 5 kickoff** (Day 29): riapri questo doc, verifica ancora valido, start Fase 1 se GO

**Non agire ora.** Registro e torno a monitorare loop autonomo.

---

## 8. Riferimenti

- Karpathy gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Karpathy X post: https://x.com/karpathy/status/2039805659525644595 (402 paywall)
- Video Simone Rizzo: rizzoaiacademy.com, 22/04/2026
- ELAB RAG attuale: `src/data/rag-chunks.json` (549 chunk)
- ELAB memory 3-tier: `src/services/unlimMemory.js`
- ELAB context collector: `src/services/unlimContextCollector.js`

---

**Verdict**: Pattern valido, ibrido RAG+Wiki coerente con architettura ELAB, rimandato Sprint 5 per non destabilizzare Sprint 3 corrente.
