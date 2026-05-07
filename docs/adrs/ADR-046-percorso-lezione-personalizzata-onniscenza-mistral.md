---
id: ADR-046
title: Percorso "Lezione personalizzata" — Onniscenza-bridge + Mistral La Plateforme wire-up frontend
status: PROPOSED
date: 2026-05-07
deciders:
  - Claude Opus 4.7 (iter 45 Andrea video2 06/05/2026 + ADR-019 implementation atom)
  - Andrea Marro (final approver per impatto Mistral cost + Edge Function deploy)
context-tags:
  - iter-45
  - sprint-V
  - morfismo-sense-1.5
  - onniscenza-frontend-wire
  - mistral-la-plateforme
  - principio-zero-v3
  - dual-moat
related:
  - ADR-019 (Sense 1.5 Morfismo runtime docente/classe — design)
  - ADR-023 (Onniscenza 7-layer aggregator)
  - ADR-024 (onniscenza-bridge LIVE iter 24)
  - ADR-029 (LLM_ROUTING_WEIGHTS conservative tune Mistral primary)
  - ADR-008 (buildCapitoloPromptFragment Vol/pag verbatim)
  - ADR-009 (Principio Zero validator V3 plurale Ragazzi + ≤60 parole)
input-files:
  - src/components/lavagna/PercorsoCapitoloView.jsx (extend, NEW button + state)
  - src/services/api.js (existing sendChat — already enriched simulator + experimentId)
  - supabase/functions/_shared/onniscenza-bridge.ts (LIVE iter 24, no change)
  - supabase/functions/unlim-chat/index.ts (existing, no change for MVP)
output-files:
  - src/components/lavagna/PercorsoCapitoloView.jsx (modified, +60 LOC button + state + render)
  - docs/adrs/ADR-046-percorso-lezione-personalizzata-onniscenza-mistral.md (THIS file, NEW)
---

# ADR-046 — Percorso "Lezione personalizzata" — Onniscenza wire-up frontend

> Sblocca il pulsante "Lezione personalizzata" nel `PercorsoCapitoloView` per il docente: click → `sendChat` con contesto capitolo → backend `unlim-chat` Edge Function arricchisce via `onniscenza-bridge` (L1 RAG + L2 Wiki + L4 Sessione + L5 Lesson + L6 Chat history, LIVE iter 24) → Mistral La Plateforme genera proposta narrativa adattata alla classe + sessioni precedenti + storia chat. Nessun nuovo Edge Function, nessuna nuova migration: si appoggia interamente all'infrastruttura Onniscenza già LIVE.

---

## 1. Contesto

### 1.1 Bug feedback Andrea video2 06/05/2026 (Voxtral verbatim)

> "Sembra regredito il sistema, che non c'è più il passo passo normale. Su Vercelli, invece... Qui è anche regredito. C'è il salvataggio, però. Ripeto, la cosa da mantenere era la finestra passo passo a destra. La regressione può essere dovuta a un conflitto perché Mac Mini ha fatto deploy poco dopo di te."

E richiesta architetturale:
> "Pensa a come doveva essere (e come vagamente si è avvicinata a essere la modalità Percorso) /mem-search fai funzionare anche quella rendendola adattabile a come sta andando la lezione, alle lezioni precedenti, ai manuali, a cosa fa il prof ecc.. personalizzata per la classe e il prof. In pratica ci dovrebbe essere un pulsante lezione, premuto quello in base alle sessioni precedenti unlim ti fa una proposta."

### 1.2 Stato attuale

- `PercorsoCapitoloView.jsx` (192 LOC) renderizza il Capitolo schema **statico** — non chiama LLM, non si adatta.
- `percorsoGenerator.js` (188 LOC, Sprint Q6 2026-04-25) ha `generatePercorso()` ma `defaultLLMCall` è uno stub che non chiama mai Mistral. **Mai wired** in produzione.
- `onniscenza-bridge.ts` è **LIVE iter 24** — L1 RAG, L2 Wiki, L4 Sessione (`unlim_sessions`), L5 Lesson (esperimento attivo), L6 Chat history. RRF fusion k=60 attivo.
- `LLM_ROUTING_WEIGHTS=70/20/10` Mistral primary su Edge Function `unlim-chat` (ADR-029, deployed iter 32).
- `sendChat()` client-side (`src/services/api.js:633`) supporta già `experimentId` + `experimentContext` + `simulatorContext` + integrazione `getVolumeRef` per citazione Vol/pag verbatim.

Il gap è solo l'**innesco frontend**: zero pulsanti che chiamino la pipeline Onniscenza+Mistral con un prompt mirato a generare una proposta di lezione. Fino a iter 45 il docente apriva `PercorsoCapitoloView` e leggeva contenuto narrativo statico identico per ogni classe — viola Test Morfismo (CLAUDE.md line 56) "stesso esperimento aperto da 2 docenti diversi = layout/funzioni/finestre adattate identità + storia ciascuno".

### 1.3 Perché ADR adesso

1. **Andrea explicit ask iter 45**: pulsante "Lezione" → proposta UNLIM basata su sessioni precedenti.
2. **ADR-019 implementazione minima**: ADR-019 progetta Sense 1.5 in 4 livelli (Context Collection + Morphic Functions + Morphic Windows + Persistence). Scope iter 45 = Livello 1 frontend (chiamata context-rich) senza schema migration `teacher_memory`/`class_memory` (deferred iter 13+ secondo ADR-019). Sblocca il valore minimo senza nuovo schema.
3. **Zero deploy backend**: usa endpoint esistente `unlim-chat` + `onniscenza-bridge` LIVE. No Edge Function nuove, no Andrea-ratify backend, no rischio regressione tabelle.

### 1.4 Vincoli invarianti (ADR-009 Principio Zero V3)

Anche per la "Lezione personalizzata":
- Plurale "Ragazzi" sempre.
- Vol/pag verbatim citati VERBATIM dal libro fisico (`getVolumeRef` già wired).
- Mai imperativo verso il docente.
- Voce Isabella italiana registro narratore (TTS gestito separato ADR-016).
- ≤60 parole per le risposte UNLIM standard. **Eccezione documentata**: la Lezione personalizzata è una proposta strutturata (4 sezioni), può eccedere il vincolo se necessario alla didattica → mitigation iter 46+ via flag dedicato `mode: 'lezione_proposal'` su `unlim-chat` che bypassa `BREVITY_RULE` *solo per questo intent* e mantiene il limite per chat normale.

---

## 2. Decision

### 2.1 Atom A — Frontend wire (iter 45, scope MVP)

`src/components/lavagna/PercorsoCapitoloView.jsx`:

- Import `sendChat` da `services/api.js`.
- Stato locale: `lezioneProposta` (testo Mistral), `lezioneLoading`, `lezioneError`.
- `generaLezione = useCallback(async () => { ... })`:
  - Costruisce prompt `Ragazzi, prepara una proposta di lezione personalizzata per il Capitolo X "titolo" (Vol.N)…`
  - 4 richieste numerate: apertura narrativa con citazione verbatim, ordine esperimenti adattato, analogia chiave, punto verifica comprensione.
  - Vincolo plurale + registro narratore esplicitato nel prompt.
  - `sendChat(prompt, [], { experimentId: firstExp.id, experimentContext: '[CAPITOLO ATTIVO] Vol.N Cap.X — titolo' })`.
  - On success → `setLezioneProposta(text)`.
  - On error → `setLezioneError(message)`.
- Pulsante prominent (Lime Navy, min-height 56px touch target WCAG AAA, font Oswald 18px, scritta "🎓 Lezione personalizzata").
- Render proposta: `<article>` Lime border, font Open Sans 17px, `whiteSpace: pre-wrap`, header "Proposta UNLIM (adattata alla classe)".

### 2.2 Pipeline runtime

```
[Click "Lezione personalizzata"]
        ↓
sendChat(prompt, [], { experimentId, experimentContext })   client-side api.js
        ↓
POST /functions/v1/unlim-chat   (Edge Function elab-unlim Supabase)
   Body: { messages, experimentId, simulatorContext, ... }
        ↓
unlim-chat/index.ts:
  - aggregateOnniscenza({ query: prompt, experiment_id, supabase, history })
        ↓
  onniscenza-bridge.ts (LIVE iter 24):
    L1 fetchL1Rag(supabase) → hybridRetrieve top-10 Vol+capitoli
    L2 fetchL2Wiki(supabase) → rag_chunks WHERE source='wiki'
    L4 fetchL4Sessione(supabase, class_id) → unlim_sessions order desc 3
    L5 fetchL5Vision(experiment_id) → lesson context
    L6 fetchL6Llm(history) → recent chat turns
    rrfFuse(layered, k=60) → top fused hits
        ↓
  buildSystemPrompt enrich: PRINCIPIO_ZERO + RAG hits + sessione last + chapter context
        ↓
  callLLMWithFallback({ provider=Mistral via pickWeightedProvider, system, user, history })
    Mistral La Plateforme `mistral-small-latest` o `mistral-large-latest` per qualità
        ↓
  validatePrincipioZero(response)
        ↓
  Return { content, metadata: { intents_parsed, prompt_class, onniscenza_layers } }
        ↓
sendChat parses response.content → reply text
        ↓
PercorsoCapitoloView.lezioneProposta = text → render <article>
```

### 2.3 Gestione errori

- Master timeout `sendChat`: 30s (text). Se Mistral lento → mostra errore + retry CTA.
- Render Vol/pag citato verbatim verificato visualmente da docente. Se hallucinated → segnala bug.
- ≤60 parole non garantito (proposta strutturata può eccedere). Iter 46+ aggiungerà flag.

### 2.4 NOT in scope iter 45

- `teacher_memory` schema Supabase (ADR-019 §2.1 Livello 4) — defer iter 13+ ADR-019.
- `class_memory` schema (idem).
- Detection runtime experience level/style (ADR-019 §2.1 Livello 1) — defer.
- Morphic Functions UI capacity adapter (ADR-019 §2.1 Livello 2) — defer.
- Morphic Layout LIM resolution scaling (ADR-019 §2.1 Livello 3) — defer.
- Edge Function `mode: 'lezione_proposal'` flag che bypassa `BREVITY_RULE` — defer iter 46+ Andrea-ratify.

---

## 3. Consequences

### 3.1 Positive

1. **Sblocca Test Morfismo line 56 minimo**: due classi diverse stesso capitolo = proposte diverse (perché L4 Sessione + L6 Chat history per-classe-key).
2. **Zero rischio backend**: nessun nuovo Edge Function, nessuna migration, nessuna API key esposta. Si appoggia su infra LIVE iter 24-32.
3. **Foundation ADR-019**: livello 1 (Context Collection minimo via `experimentId` + `class_key` localStorage) presente. Iter 13+ aggiunge `teacher_memory`/`class_memory` Supabase tables.
4. **Andrea ask iter 45 soddisfatto**: pulsante "Lezione" funziona, basato su sessioni precedenti (L4) + manuali (L1+L2 RAG Vol/pag) + storia chat (L6).

### 3.2 Negative

1. **Cost cumulato Mistral**: ogni click "Lezione" = 1 invocazione Mistral con system prompt enriched (~600-1000 token input + ~200-400 token output). Stima €0.001-0.003 per click. Tollerabile a budget €50/mese (PDR Master) ma da monitorare via `together_audit_log` + dashboard.
2. **≤60 parole non rispettato per Lezione**: la proposta strutturata può andare a ~150 parole. Eccezione documentata §1.4. Iter 46+ flag dedicato.
3. **Vol/pag hallucination risk**: Mistral può inventare pagine se RAG hits poveri. Mitigation: `validateVolPag` server-side già attivo (ADR-008/009).
4. **No teacher_memory persistence**: l'esperienza si "ricorda" solo via L6 chat history rolling window (10 turni). Se la classe cambia browser = niente storia. Mitigation iter 13+ con `teacher_memory` Supabase.

### 3.3 Risks

1. **Sovraccarico Mistral La Plateforme**: se Andrea promuove "Lezione" a feature primaria, ogni docente click = 1 Mistral call. Mitigation: cache 5 min stesso (capitolo, class_key) lato client, OR coalescing server-side (iter 47+).
2. **Drift narrative invariante**: `BREVITY_RULE` su `sendChat` (60 parole) potrebbe troncare proposta. Mitigation: prompt esplicita "rispondi con proposta strutturata in 4 sezioni" → backend riconosce intent + estende limit (TODO iter 46+).
3. **Andrea-ratify backend deploy gate**: l'iter 46+ flag `mode: 'lezione_proposal'` richiederà `npx supabase functions deploy` → Andrea OK esplicito (CLAUDE.md mandate).

---

## 4. Alternatives Considered

### 4.1 Nuovo Edge Function `unlim-lezione-proposal` (REJECTED — overhead deploy)

Endpoint dedicato `/functions/v1/unlim-lezione-proposal` con prompt template hardcoded server-side e ritorno JSON strutturato `{ intro_text, esperimenti_ordinati, analogia, verifica }`.

**Why rejected**: richiede nuovo Edge Function deploy + Andrea-ratify + tests + monitoring. Per MVP iter 45 = overhead ingiustificato. `unlim-chat` esistente accetta già prompt rich → riusiamo.

### 4.2 Wire `percorsoGenerator.generatePercorso` con sendChat injection (REJECTED — orfano)

`src/services/percorsoGenerator.js` (Sprint Q6 2026-04-25) ha la firma giusta `generatePercorso({ capitolo, classMemory, teacherMemory, llmCall })` ma:
- 0 importazioni in `src/`
- Output JSON enriched diverso da risposta Mistral testuale (richiederebbe parser)
- `classMemory` + `teacherMemory` ancora non popolati (ADR-019 schema deferred)

**Why rejected per MVP**: refactoring 188 LOC service per wire 60 LOC frontend = ROI sbilanciato. Iter 46+ rivedere se necessario.

### 4.3 Mistral La Plateforme client-side direct (REJECTED — sicurezza)

Client React chiama direttamente `https://api.mistral.ai/v1/chat/completions` con `MISTRAL_API_KEY`.

**Why rejected**: API key esposta nel bundle JS. Violazione CLAUDE.md §Anti-regressione. Già rotata iter 32 dopo precedente leak. Server-side only.

### 4.4 RAG retrieval client-side senza Edge Function (REJECTED — duplicate logic)

Client React fa fetch diretto a Supabase pgvector + chiama Mistral con context.

**Why rejected**: duplica `onniscenza-bridge.ts` lato client → drift logica + bundle size +200KB. `unlim-chat` Edge Function esistente è single source of truth.

---

## 5. References

- ADR-019 (2026-04-28) — Sense 1.5 Morfismo runtime docente/classe (PROPOSED, foundation iter 45 Atom A)
- ADR-023 — Onniscenza 7-layer aggregator (LIVE iter 24)
- ADR-029 — LLM_ROUTING_WEIGHTS conservative tune (Mistral primary 70%, Gemini 20%, Together 10%)
- CLAUDE.md §0 lines 27-58 — Sense 1.5 canonical definition
- CLAUDE.md line 56 Test Morfismo (acceptance criterion)
- `src/components/lavagna/PercorsoCapitoloView.jsx` (modified iter 45)
- `src/services/api.js:633 sendChat` (existing)
- `supabase/functions/_shared/onniscenza-bridge.ts` (LIVE iter 24)

---

## 6. Sign-off

- iter 45 PR (Andrea video2 06/05/2026 follow-up): PROPOSED ⏳
- Andrea Marro final approver: pending live verify post-deploy + decisione iter 46+ Edge Function flag dedicato.
- Test acceptance: 2 docenti diverse classi stesso capitolo = proposte misurabilmente diverse (L4 Sessione + L6 Chat history per-class).
- Foundation iter 13+ ADR-019: `teacher_memory` + `class_memory` Supabase + Morphic Functions/Layout.
