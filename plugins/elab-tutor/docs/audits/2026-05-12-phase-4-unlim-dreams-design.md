# Phase 4 — UNLIM Dreams Overnight Consolidation Design

**Date:** 2026-05-12
**Sprint:** Sprint U iter 39+
**Owner:** Orchestrator (impl) + Andrea (cron approve + Supabase migration apply)
**Status:** DESIGN — Phase 4 of Combo C Max-Everything Strategy
**Effort:** 6h impl + 2h prod ratify Andrea
**Dependency:** Phase 0 GDPR Vertex migration (data residency for batch reads)
**Inspiration:** Anthropic "Claude Dreams" pattern (May 2026 announce) — 4-phase memory consolidation

---

## Why UNLIM Dreams

Current state (iter 38 close): Onniscenza L1-L7 layers query historical data **synchronously per chat request** (timeline + session_memory + capitoli + wiki + RAG fused via aggregator). Latency budget tight (~250-2000ms parallel via iter 38 A3 Promise.all). Pattern detection limited to surface-level recent context.

Anthropic Dreams pattern (validated production May 2026): **overnight asynchronous consolidation** of session history into compressed insights, retrieved next-day at low latency. Pattern proven in long-running assistants — emergent intelligence from pattern aggregation overnight without runtime cost.

ELAB equivalent: docente runs class Mon-Fri 09:00-13:00. Overnight 22:00-06:00 batch consolidates yesterday sessions → per-docente + per-classe insights ready next morning. Zero latency overhead per chat. Emergent personalization Sense 1.5 morfismo runtime.

---

## 4-Phase Consolidation Pattern (Anthropic-derived)

### Phase Dreams 1 — Orient

Read past 24h sessions per docente_id. Score relevance (recency × engagement × completion). Filter sessions with measurable signal (≥3 turns + ≥1 component mounted + duration ≥3 min).

### Phase Dreams 2 — Gather

For each filtered session, extract structured features:
- Topics covered (RAG chunk ids consulted, capitoli touched)
- Linguaggio patterns (plurale/singolare violations count, kit mentions, citation density)
- Errori ricorrenti studenti (component wrong, code compile fail, circuit short)
- Tempo per task (mount → first-LED → completion seconds)
- UNLIM intent dispatched (highlight ×N, mountExperiment ×N, captureScreenshot ×N)

### Phase Dreams 3 — Consolidate

LLM-summarize (Mistral Medium 3.5 batch mode, cheap overnight rate):
- **Per-docente insight**: 1-paragraph "Maria 4ª primaria preferisce analogie idrauliche, evita codice C++ verbose, riprende capitolo 3 LED 3x/settimana lunedì mattina."
- **Per-classe insight**: 1-paragraph "Classe 4B Romolo Gessi padroneggia LED + resistenza + pulsante, struggle MOSFET cap.7 vol.3, riposare 1 settimana suggerito poi retry."
- **Per-experiment-id insight** (aggregato cross-classe): "v2-cap5-esp2 polizia LED → 73% docenti incontrano problema connessione filo D9 corto; suggerimento iter 40 update lesson-paths con highlight breadboard fila E primo step."

### Phase Dreams 4 — Prune

Discard sessions >30 giorni o engagement <threshold. Compress nightly insights → weekly digest → monthly archive. Vector store dim 1024 (Voyage reuse o Mistral embed) with TTL semantics. Avoid context bloat.

---

## Architecture

### Supabase Migration `unlim_dreams_insights` table

```sql
-- File: supabase/migrations/20260512XXXXXX_unlim_dreams_insights.sql

CREATE TABLE unlim_dreams_insights (
  id BIGSERIAL PRIMARY KEY,
  docente_id TEXT NOT NULL,           -- class_key or stable doc identifier
  insight_type TEXT NOT NULL,          -- 'per_docente' | 'per_classe' | 'per_experiment'
  scope_key TEXT,                      -- e.g. 'class_4B' or 'v2-cap5-esp2' or NULL for per_docente
  insight_text TEXT NOT NULL,          -- LLM-generated 1-paragraph
  embedding VECTOR(1024),              -- pgvector for semantic retrieval next-day
  sources JSONB NOT NULL,              -- {session_ids: [...], turn_count: N, model: 'mistral-medium-3.5'}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),

  CONSTRAINT insight_type_check CHECK (
    insight_type IN ('per_docente', 'per_classe', 'per_experiment')
  )
);

CREATE INDEX idx_dreams_docente_recent ON unlim_dreams_insights (docente_id, created_at DESC)
  WHERE expires_at > now();
CREATE INDEX idx_dreams_embedding ON unlim_dreams_insights
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_dreams_scope ON unlim_dreams_insights (insight_type, scope_key)
  WHERE expires_at > now();

-- RLS open for orchestration tier (similar to existing rag_chunks pattern)
ALTER TABLE unlim_dreams_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full" ON unlim_dreams_insights
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON unlim_dreams_insights TO authenticated, anon;
```

### Edge Function `supabase/functions/unlim-dreams-batch/index.ts` NEW (~400 LOC)

```typescript
// Pseudocode skeleton
import { serve } from 'std/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { callLLM } from '../_shared/llm-client.ts';

serve(async (req) => {
  // 1. Auth: only pg_cron service role
  if (!verifyCronAuth(req)) return new Response('forbidden', { status: 403 });

  // 2. Phase Dreams 1 — Orient
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sessions = await supabase.from('sessions')
    .select('id, docente_id, class_key, session_data, created_at')
    .gte('created_at', since.toISOString())
    .gte('turn_count', 3)
    .order('created_at', { ascending: false })
    .limit(500);

  // 3. Group by docente + classe
  const groupedByDocente = groupBy(sessions, 'docente_id');

  // 4. Phase Dreams 2 — Gather features + Phase Dreams 3 — Consolidate
  for (const [docenteId, docSessions] of Object.entries(groupedByDocente)) {
    const features = extractFeatures(docSessions);
    const insight = await callLLM({
      model: 'mistral-medium-3.5',
      systemPrompt: DREAMS_CONSOLIDATION_PROMPT,
      message: JSON.stringify(features),
      maxOutputTokens: 250,
      temperature: 0.3,                    // low for stable summarization
      preferFastProvider: false,           // overnight batch, no rush
    });

    const embedding = await embedText(insight.text);

    await supabase.from('unlim_dreams_insights').insert({
      docente_id: docenteId,
      insight_type: 'per_docente',
      insight_text: insight.text,
      embedding,
      sources: { session_ids: docSessions.map(s => s.id), turn_count: features.totalTurns, model: 'mistral-medium-3.5' },
    });
  }

  // 5. Phase Dreams 4 — Prune (separate cron 04:00 UTC)
  // ... DELETE FROM unlim_dreams_insights WHERE expires_at < now()

  return new Response(JSON.stringify({ ok: true, processed: sessions.length }), {
    headers: { 'content-type': 'application/json' },
  });
});
```

### pg_cron Schedule

```sql
-- Trigger every night 03:00 UTC (04:00 IT inverno, 05:00 estate)
SELECT cron.schedule(
  'unlim-dreams-nightly',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-dreams-batch',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.cron_secret'),
      'content-type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Prune cron 04:00 UTC (TTL cleanup)
SELECT cron.schedule(
  'unlim-dreams-prune',
  '0 4 * * *',
  $$DELETE FROM unlim_dreams_insights WHERE expires_at < now();$$
);
```

### `unlim-chat` Integration — Read Dreams Insight Pre-LLM

```typescript
// supabase/functions/unlim-chat/index.ts MODIFICATION (~20 LOC near line 408 after classifier)

// Phase 4 Dreams: fetch per-docente insight from last night (if exists, <24h fresh)
const dreamsInsight = await supabase.from('unlim_dreams_insights')
  .select('insight_text, created_at')
  .eq('docente_id', class_key)
  .eq('insight_type', 'per_docente')
  .gt('expires_at', new Date().toISOString())
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (dreamsInsight.data) {
  // Inject as 1 extra paragraph in systemPrompt before BASE_PROMPT (low-priority context)
  systemPrompt = `${dreamsInsight.data.insight_text}\n\n${systemPrompt}`;
}
```

Latency cost: +50-100ms single Supabase query (indexed). Acceptable within total budget.

---

## Why Mistral Medium 3.5 for Dreams Consolidation

- **Cost overnight batch**: ~€0.02-0.05 per nightly run (estimated 100 docenti × 250 tokens × $0.40/1M ~$0.01)
- **Italian native**: Dreams insights generated IT for docente UI display
- **EU FR**: GDPR compliant batch processing minori data residency
- **Quality consolidation**: Mistral excels at summarization (verified iter 26+)
- **Model-agnostic fallback**: design uses `callLLM` abstraction; Gemini Vertex Pro Frankfurt is drop-in alternative IF Mistral down

---

## Where Dreams Manifest in UX

### Dashboard Docente (next-morning login)

```
┌─ Insight Maria — 12 maggio 2026 ─────────────────────┐
│ Ieri hai lavorato sui LED con 4B Romolo Gessi.       │
│ I ragazzi hanno completato Vol.1 cap.3 esperimento 2 │
│ in 12 minuti (più veloce della media classe 18min).  │
│ Suggerimento: introdurre resistenza Vol.1 cap.4      │
│ oggi (i ragazzi sono pronti).                         │
└──────────────────────────────────────────────────────┘
```

### UNLIM Chat Pre-context

UNLIM risponde "Ragazzi, riprendiamo cap.4..." automaticamente perché Dreams insight `per_docente` lo informa che Maria ha visto cap.3 ieri e classe è pronta per cap.4.

### Per-experiment insight surface

Quando docente seleziona `v2-cap5-esp2`, lesson-paths schema legge `unlim_dreams_insights` filtered by `insight_type='per_experiment' AND scope_key='v2-cap5-esp2'` → UNLIM proattivo "Ragazzi, attenzione al filo D9 — molti docenti riportano corti qui. Verificate breadboard fila E."

---

## Honesty Caveats

1. **Phase 4 depends Phase 0**: GDPR compliance for batch reads requires Vertex EU (per-docente data classification). Until Phase 0 done, Dreams CAN run with anonymized session IDs only (no PII), at cost of insight specificity.
2. **Cron schedule timezone**: 03:00 UTC chosen because Italy 04:00-05:00 (zero class activity). Andrea verify no European weekend exam runs against 04:00 IT window.
3. **Storage growth**: 100 docenti × 365 days × 3 KB/insight = ~110 MB/anno. Negligible vs RAG chunks already 1881 chunks. TTL 30 giorni keeps recent 100 × 30 = ~9 MB rolling window.
4. **Cost projection production**: 100 docenti × €0.05/notte × 365 = ~€18/anno. Within <€50/mese ELAB budget.
5. **Quality verification mandatory iter 40**: smoke run 5 nights manual review insights before auto-rollout. Anti-G45: no claim "Dreams LIVE" without empirical week-1 quality sample.
6. **NOT same as Onniscenza L1-L7**: Dreams = L8 NEW asynchronous historical layer. Onniscenza runtime synchronous remains. Both coexist.
7. **Privacy implications**: per-docente insight stored — Andrea verify GDPR sub-processor list `docs/legal/sub-processors.md` mentions consolidation batch + add to ToS minori section if needed.

---

## Implementation Steps Iter 40 (post Phase 0+1+2+3 complete)

1. ✅ Phase 0 Vertex EU done
2. ✅ Phase 1 Combo C routing done (iter 39)
3. ✅ Phase 2 bench data-driven confirm (iter 40)
4. ✅ Phase 3 A vs C decision (iter 40)
5. [ ] Apply migration `unlim_dreams_insights` (Andrea `supabase db push --linked`)
6. [ ] Create Edge Function `unlim-dreams-batch/index.ts` (~400 LOC orchestrator)
7. [ ] Deploy Edge Function (Andrea ratify)
8. [ ] Schedule pg_cron 03:00 UTC nightly (Andrea SQL exec)
9. [ ] Wire `unlim-chat` read insight pre-LLM (~20 LOC)
10. [ ] Manual smoke 5 nights review insights quality
11. [ ] Dashboard widget Insight Docente
12. [ ] Anti-G45 audit week 1 data quality + Opus indipendente review
13. [ ] Roll-out gradual 5% → 25% → 100% docenti (matches ADR-028 §7 canary pattern)

---

## References

- Anthropic Dreams pattern public announce May 2026 (verify URL when published)
- ADR-028 INTENT dispatcher canary rollout pattern (precedent)
- iter 31 Onniscenza L7 aggregator wire-up (runtime layer, complementary)
- iter 37 ADR-029 LLM_ROUTING_WEIGHTS conservative (Mistral as batch consumer)
- pg_cron docs: https://github.com/citusdata/pg_cron
- pgvector ivfflat tuning: https://github.com/pgvector/pgvector#performance
- Master plan: `docs/superpowers/plans/2026-05-12-elab-max-everything-strategy.md` Phase 4
