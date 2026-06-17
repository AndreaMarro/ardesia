# PDR Sett 5 — OpenClaw ONNIPOTENZA + ONNISCENZA + Morfico v4

**Data**: 2026-04-22
**Autore**: Claude (session con Andrea, 11h deep reasoning)
**Scope**: architettura completa agent UNLIM brain
**Principio fondante**: Principio Zero v3 (docente tramite, classe plurale, zero interazione diretta studente)
**Vincoli**: GDPR EU by design, economico solo-dev + scaling, revenue-positive Stage 2
**Status**: SPEC v4 — approvata per Sprint 6 implementation

---

## 0. TL;DR onesto

ELAB UNLIM diventa agent AI vero via **OpenClaw** (cervello + scheletro) che:

- **Onnipotenza**: esegue 52 tool reali sul simulatore + UI + memoria (46 statici + 6 nuovi)
- **Onniscienza**: conosce volumi ELAB (Wiki LLM 6000 chunk), sessioni passate, contesto circuito real-time, errori comuni
- **Morfico (con limiti)**: genera nuovi tool al volo quando serve — 3 livelli di complessità, L3 sandbox dev-only
- **Memoria tool**: cache generated tools Supabase pgvector, riuso + quality score + garbage collection
- **Multilingue**: IT primary, EN/ES/FR/DE ready
- **GDPR first**: EU-only runtime, Together AI solo batch + teacher-context safe mode
- **Economico**: €0 Stage 0 (tu solo), €45/m Stage 1, break-even Stage 2b (8 scuole), profit Stage 3+

Stack inizialmente serverless (Supabase Edge + Gemini esistente), migra a Hetzner GEX44 €187/m quando 5+ scuole paganti. Revenue positiva da 8 scuole.

---

## 1. Definizioni rigorose

### Onnipotenza
UNLIM esegue azioni reali attraverso `window.__ELAB_API`. 46 metodi già implementati (circuit build, state read, simulate, highlight, compile, navigation, vision, UI). Più 6 nuovi proposti in Sprint 6 (`saveSessionMemory`, `recallPastSession`, `showNudge`, `generateQuiz`, `exportFumetto`, `alertDocente`).

Tool-use strutturato via JSON Schema. Plan generato dal LLM è sempre array di azioni con parametri validati.

### Onniscenza
UNLIM sa tutto del dominio ELAB in **tempo reale** a ogni query:
- Circuito live (componenti, fili, colori, simulation state)
- Esperimento corrente (ID, step corrente, total steps, mode)
- Studente (età, classe anonima, progressi, concetti noti, concetti in difficoltà)
- Libri ELAB (Vol.1/2/3 completi, 92 esperimenti, 27 lezioni)
- Wiki LLM (6000 chunk RAG ingested una-tantum via Together AI batch)
- FAQ + errori comuni + analogie library
- Sessioni passate (ultime 5, key moments, durata, outcome)
- Conversation state (turni, ultima domanda, ultima risposta)
- Compile output + serial monitor + errori

Context snapshot refresh ogni 1s background. Prompt LLM contiene tutto parallel-fetched.

### Morfico
Quando utente chiede qualcosa di inedito (nuovo tool mai visto), OpenClaw NON abbandona. Genera nuovo tool in 3 livelli:

| Livello | Tecnica | Sicurezza | Uso |
|---|---|---|---|
| L1 | Composition tool esistenti | Nessun codice nuovo, solo orchestra | ~90% casi |
| L2 | Template gap-fill | Template pre-approvati, LLM riempie slot | ~8% |
| L3 | Dynamic JS generation | Web Worker sandbox, DEV-FLAG ONLY | ~2% (off in prod) |

Ogni generato tool viene memorizzato con quality score e riusato se efficace.

---

## 2. Architettura 5 layer (OpenClaw Agent)

```
┌─────────────────────────────────────────────────────────┐
│ LAYER 1 — SENSING (background, 1s refresh)              │
│ • window.__ELAB_API state snapshot                      │
│ • Supabase student memory                                │
│ • Wiki LLM RAG top-3 chunk retrieval (parallel)         │
│ • Vision screenshot (on-demand trigger)                 │
│ • Conversation history                                   │
│ → StateSnapshot JSON (200-500 tokens serialized)         │
├─────────────────────────────────────────────────────────┤
│ LAYER 2 — INTENT CLASSIFICATION (~50ms)                 │
│ Gemma 3 4B quantized (fast, cheap)                       │
│ Input: user_msg + snapshot_hash                          │
│ Output: { intent, confidence, requires_plan, locale }    │
│ Intent values: build-circuit, explain, diagnose,         │
│   pilot, verify, tutor, memory, visual, code, generic    │
├─────────────────────────────────────────────────────────┤
│ LAYER 3 — TOOL DISCOVERY (~100ms)                       │
│ 3a. Memory lookup: BGE-M3 embed user_msg → pgvector      │
│     similarity search tool_memory (threshold 0.85)       │
│     IF match with quality >0.70 → REUSE (skip generate) │
│ 3b. Static tools: always available 46 from registry     │
│ 3c. If reuse-fail: proceed to Morphic Generator          │
├─────────────────────────────────────────────────────────┤
│ LAYER 4 — PLAN GENERATION (~1-2s)                       │
│ Qwen 14B (main LLM, tool-use native)                     │
│ Input: intent + state + user_msg + PZ_v3_prompt         │
│   + available_tools (static + memory + morphic candidates)│
│ Output: JSON plan array, max 5 steps                     │
│ Validation: PZ v3 validator (plurale, citation, brevity)│
│ Retry max 2× if invalid                                  │
├─────────────────────────────────────────────────────────┤
│ LAYER 5 — EXECUTION + OBSERVATION (iterative)           │
│ For each plan step:                                      │
│   a. Execute via window.__ELAB_API.{action}             │
│   b. Wait 200ms settle                                   │
│   c. Re-snapshot state (delta vs expected)               │
│   d. If match: continue                                  │
│      Else: re-plan from Layer 4 with observation        │
│   e. Max 3 retry per action → abort+alertDocente         │
├─────────────────────────────────────────────────────────┤
│ LAYER 6 — MEMORY + LEARNING (async)                     │
│ Log plan+outcome to Supabase openclaw_runs               │
│ Update tool_memory quality_score                         │
│ Detect hallucination (check volume citations exist)      │
│ Feed success cases as few-shot next plan                 │
└─────────────────────────────────────────────────────────┘
```

Nota: Layer 3 e 4 collassano in single-pass prompt quando memoria non ha match (economic).

---

## 3. Morphic tool generation — 3 livelli + safety

### L1 — Composition (always-on, safe)

LLM combina tool esistenti nel registry in pattern nuovi.

**Esempio richiesta**: "fai lampeggiare il LED quando premo il tasto 5 volte"

**L1 plan**:
```json
[
  { "action": "highlight", "args": [["btn1", "led1"]], "reason": "focus attenzione ragazzi" },
  { "action": "speak", "args": ["Ragazzi, premete il pulsante 5 volte. Ogni tocco illumina il LED per un istante."] },
  { "action": "interact", "args": ["btn1", "onPress", "count++; if(count>=5) blinkLed(led1); else return;"], "reason": "logica via eventi simulatore" }
]
```

Nessun codice nuovo. Solo orchestra di tool esistenti con parametri creativi.

### L2 — Template gap-fill (always-on, sandboxed)

Template pre-approvati con slot. LLM riempie slot. Validator checks.

**Esempio template** `timer-countdown.tmpl.ts`:
```typescript
// ELAB OpenClaw L2 template — locked structure, LLM fills gaps
export function ${NAME}({ intervalMs, maxRepeat, onTick, onComplete }) {
  let count = 0;
  const id = setInterval(() => {
    count++;
    onTick?.(count);
    if (count >= maxRepeat) {
      clearInterval(id);
      onComplete?.();
    }
  }, intervalMs);
  return () => clearInterval(id);  // cancel fn
}
```

LLM fills: `{NAME, intervalMs, maxRepeat, onTick callback, onComplete callback}`. Validator checks: no `eval`, no `Function` constructor, no network access, uses only allowed API.

### L3 — Dynamic JS (DEV-FLAG, sandboxed)

LLM genera JS function nuovo 100%. Eseguito in Web Worker con strict sandbox.

**DEFAULT OFF**: `VITE_ENABLE_MORPHIC_L3=false`. Enabled solo dev/test o advanced edge case con user consent.

**Safety stack**:
- Web Worker (no DOM, no localStorage, no fetch)
- Whitelist `__ELAB_API` methods permessi passed via postMessage
- Timeout hard 5s (worker.terminate)
- Memory limit 10MB
- CSP script-src restricted (Worker blob: allowed esplicito)
- PZ v3 validator pre-exec on generated code
- Logged Supabase `openclaw_l3_generations` with full code for audit
- Max 3 L3 gen/ora per sessione (rate limit)

---

## 4. Tool memory system (intelligente)

### Schema Supabase pgvector

```sql
CREATE TABLE openclaw_tool_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash TEXT UNIQUE NOT NULL,  -- sha256 of code
  name TEXT NOT NULL,                  -- human-readable id
  description_it TEXT NOT NULL,        -- IT natural lang
  description_en TEXT,                 -- EN (optional)
  description_embedding VECTOR(1024),  -- BGE-M3 (1024 dim)
  level TEXT NOT NULL CHECK (level IN ('L1', 'L2', 'L3')),
  composition_steps JSONB,             -- L1 = array of ToolCall
  template_name TEXT,                  -- L2 = template used
  template_filled TEXT,                -- L2 = filled slots JSON
  generated_code TEXT,                 -- L3 = raw code (audit only)
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used TIMESTAMPTZ DEFAULT now(),
  usage_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  quality_score FLOAT DEFAULT 0.5,     -- computed
  pz_v3_compliance BOOLEAN DEFAULT true,
  locales_tested TEXT[] DEFAULT ARRAY['it'],
  deleted BOOLEAN DEFAULT false,
  reason_deleted TEXT
);

CREATE INDEX tool_memory_embedding_hnsw ON openclaw_tool_memory 
  USING hnsw (description_embedding vector_cosine_ops);
CREATE INDEX tool_memory_quality ON openclaw_tool_memory (quality_score);
CREATE INDEX tool_memory_deleted ON openclaw_tool_memory (deleted);
```

### Algoritmo riuso/generazione/cancellazione

```typescript
async function findOrGenerate(userMsg: string, state: StateSnapshot) {
  // 1. Embed + similarity search
  const queryEmb = await bgeM3Embed(userMsg);
  const candidates = await supabase.rpc('match_tools', {
    query_embedding: queryEmb,
    match_threshold: 0.85,
    match_count: 5,
    filter_min_quality: 0.70,
    filter_deleted: false,
  });
  
  if (candidates.length > 0) {
    await markUsed(candidates[0].id);
    return { tool: candidates[0], source: 'cached' };
  }
  
  // 2. L1 composition attempt
  const l1 = await qwen14b.composeFromRegistry({
    tools: OPENCLAW_TOOLS_REGISTRY,
    goal: userMsg,
    state,
  });
  if (l1 && validateL1(l1)) {
    const tool = await persistTool({ ...l1, level: 'L1', description_it: userMsg });
    return { tool, source: 'L1-new' };
  }
  
  // 3. L2 template
  const tmpl = findTemplate(userMsg);  // regex+embedding classifier
  if (tmpl) {
    const l2 = await qwen14b.fillTemplate(tmpl, state, userMsg);
    if (validateL2(l2)) {
      const tool = await persistTool({ ...l2, level: 'L2', template_name: tmpl.id });
      return { tool, source: 'L2-new' };
    }
  }
  
  // 4. L3 dynamic (DEV-FLAG)
  if (import.meta.env.VITE_ENABLE_MORPHIC_L3 === 'true') {
    const l3 = await qwen14b.generateSandboxedJS(userMsg, state, ALLOWED_APIS);
    if (await sandboxSmokeTest(l3) && validatePZv3(l3.speakTexts)) {
      const tool = await persistTool({ ...l3, level: 'L3' });
      return { tool, source: 'L3-new' };
    }
  }
  
  // 5. Abort
  return { tool: null, source: 'abort', reason: 'no safe tool possible' };
}

async function trackOutcome(toolId: string, outcome: { success: boolean, error?: string, latency: number, pzv3ok: boolean }) {
  const delta = outcome.success ? { success_count: +1 } : { failure_count: +1 };
  await supabase.from('openclaw_tool_memory')
    .update({
      ...delta,
      usage_count: sql`usage_count + 1`,
      last_used: 'now()',
      quality_score: sql`(success_count + CASE WHEN ${outcome.success} THEN 1 ELSE 0 END)::float / 
                        (success_count + failure_count + 1 + CASE WHEN ${outcome.success} THEN 0 ELSE 1 END)`,
    })
    .eq('id', toolId);
}

// Daily garbage collection (cron 4 AM UTC)
async function garbageCollect() {
  // 1. Low quality
  await supabase.rpc('soft_delete_tools', {
    where: 'quality_score < 0.30 AND usage_count >= 5',
    reason: 'low quality after 5+ attempts',
  });
  
  // 2. Stale unused
  await supabase.rpc('soft_delete_tools', {
    where: `last_used < now() - interval '30 days' AND usage_count < 3`,
    reason: 'stale rare tool',
  });
  
  // 3. Duplicate clustering (keep highest quality per embedding cluster)
  await supabase.rpc('dedupe_tools_by_embedding_cluster', {
    cluster_threshold: 0.95,
  });
  
  // 4. Hard delete after 90 days soft-deleted
  await supabase.from('openclaw_tool_memory')
    .delete()
    .eq('deleted', true)
    .lt('updated_at', sql`now() - interval '90 days'`);
}
```

### Cross-pollination intelligente

Quando OpenClaw genera un nuovo tool L1 o L2, applica "cross-pollination":
- Cerca top-5 tool memoria con description embedding simile (soglia 0.75 invece 0.85)
- Prende ingredienti migliori: parametri di default, gestione errori, patterns PZ v3
- Mixa nel nuovo tool → migliora quality score iniziale
- Marca `parent_ids: [id1, id2, id3]` per traceability

Dopo 6 mesi di operation, OpenClaw ha ~500-2000 tool cached ad alta qualità. Risposta media query ripetute <500ms (cache hit). Query nuove richiedono L1/L2 generation 1-3s.

---

## 5. Wiki LLM (ONNISCENZA)

### Status attuale (loop sett-4 delivered)

- `scripts/wiki-build-batch-input.mjs` — ingest script volumi → JSONL chunks ✅
- `scripts/wiki-validate-file.mjs` — schema check ✅
- `supabase/functions/unlim-wiki-query/` — query endpoint scaffold ✅
- `wiki-corpus-loader` + `makeRetriever` factory ✅
- ADR-006 Karpathy LLM Wiki architecture ✅

### Gap: ingest reale mai eseguito

Loop ha fatto dry-run. Per avere onniscenza VERA serve batch ingest reale una-tantum:

```bash
# Stima cost Together AI batch ingest
# 3 volumi × 60 pagine × 300 token/pag = 54k input + 18k output = 72k token totale
# Pricing batch Together: $0.18/M input + $0.54/M output
# Cost: 54×0.18/1000 + 18×0.54/1000 = $0.019 input + $0.010 output = $0.029
# Più embedding BGE-M3 6000 chunks × 300 token = 1.8M token × $0.02/M = $0.036
# TOTAL one-time: ~$0.07 per FULL ingest volumi 3 libri

# Richiesta: eseguire UNA volta per popolare Wiki LLM Supabase pgvector
node scripts/wiki-build-batch-input.mjs --volumes=1,2,3 --output=wiki-input.jsonl
node scripts/wiki-validate-file.mjs wiki-input.jsonl
curl -X POST https://api.together.xyz/v1/batches \
  -H "Authorization: Bearer $TOGETHER_API_KEY" \
  -F "file=@wiki-input.jsonl" -F "purpose=embeddings"
# Wait 2-6h batch completion
# Download results, BGE-M3 embed, upsert Supabase pgvector
```

### Run-time usage

Ogni query OpenClaw chiama `ragSearch(userMsg, 3)`:
```typescript
async function ragSearch(query: string, topK=3) {
  const emb = await bgeM3Embed(query);
  const results = await supabase.rpc('match_wiki_chunks', {
    query_embedding: emb,
    match_threshold: 0.75,
    match_count: topK,
    filter_locale: detectLocale(query),
  });
  // Returns [{ vol, page, chapter, text, similarity }, ...]
  return results;
}
```

Include nel prompt LLM:
```
[RIFERIMENTO LIBRO FISICO]
Vol. 1, pag. 27 — Capitolo 6 "Cos'è il diodo LED?"
Testo libro: "Il diodo LED (Light Emitting Diode) è un componente elettronico 
che emette luce quando attraversato dalla corrente elettrica nella direzione..."

[Vol. 1, pag. 29 — Capitolo 6]
Testo libro: "Per accendere un LED ci serve: una batteria (la fonte di energia),
un resistore da 470 Ohm (la 'valvola' che limita la corrente)..."
```

Qwen 14B riceve chunks + istruzione "cita fedele testo libro". Plan generato contiene citazione → PZ v3 validator check ✓.

---

## 6. Principio Zero v3 enforcement (multilingue)

### Validator code (IT + 4 lang)

```typescript
// scripts/openclaw/pz-v3-validator.ts
interface LocaleRules {
  pluralPatterns: RegExp[];         // must match 1+
  forbiddenDocenteMeta: RegExp[];   // must NOT match
  forbiddenSingular: RegExp[];      // must NOT match
  conceptsRequiringCitation: RegExp;
  citationPattern: RegExp;
  maxWords: number;
}

const RULES: Record<string, LocaleRules> = {
  it: {
    pluralPatterns: [/Ragazz[ie]|Ragazzini/i, /Vediamo|Guardate|Provate|Osservate|Ricordate|Noi|Insieme/i],
    forbiddenDocenteMeta: [/Docente,|Insegnante,/i, /Leggi ai ragazzi|Leggilo/i, /Proietta (questo|sulla LIM)/i, /Spiega tu/i],
    forbiddenSingular: [/\b(hai fatto|il tuo|tu devi|pensa tu|guarda tu|la tua|prova tu)\b/i],
    conceptsRequiringCitation: /LED|resistore|condensatore|diodo|transistor|Ohm|capacit[aà]|potenziometro|PWM|Arduino/i,
    citationPattern: /Vol\.?\s*\d|pag\.?\s*\d|Capitolo\s*\d/i,
    maxWords: 80,
  },
  en: {
    pluralPatterns: [/Kids|Everyone|Class|We|Let's/i, /Look|Try|See|Watch|Remember together/i],
    forbiddenDocenteMeta: [/Teacher,|Read to your students|Project this/i, /You should explain/i],
    forbiddenSingular: [/\b(you did|your LED|you should|think yourself)\b/i],
    conceptsRequiringCitation: /LED|resistor|capacitor|diode|transistor|Ohm|potentiometer|PWM|Arduino/i,
    citationPattern: /Vol\.?\s*\d|p\.?\s*\d|Chapter\s*\d/i,
    maxWords: 80,
  },
  es: {
    pluralPatterns: [/Chicos|Todos|Clase|Nosotros|Veamos|Juntos/i],
    forbiddenDocenteMeta: [/Profe,|Maestro,|Lee a tus alumnos/i],
    forbiddenSingular: [/\b(has hecho|tu LED|debes pensar)\b/i],
    conceptsRequiringCitation: /LED|resistor|condensador|diodo/i,
    citationPattern: /Vol\.?\s*\d|p[aá]g\.?\s*\d/i,
    maxWords: 80,
  },
  fr: {
    pluralPatterns: [/Les enfants|Tous|Classe|Nous|Regardez|Ensemble/i],
    forbiddenDocenteMeta: [/Prof,|Enseignant,|Lisez [aà] vos [eé]l[eè]ves/i],
    forbiddenSingular: [/\b(tu as fait|ton LED|tu dois)\b/i],
    conceptsRequiringCitation: /LED|r[eé]sistance|condensateur|diode/i,
    citationPattern: /Vol\.?\s*\d|p\.?\s*\d/i,
    maxWords: 80,
  },
  de: {
    pluralPatterns: [/Kinder|Alle|Klasse|Wir|Schauen|Zusammen/i],
    forbiddenDocenteMeta: [/Lehrer,|Lehrerin,|Lies deinen Sch[uü]lern/i],
    forbiddenSingular: [/\b(du hast|dein LED|du musst)\b/i],
    conceptsRequiringCitation: /LED|Widerstand|Kondensator|Diode/i,
    citationPattern: /Vol\.?\s*\d|S\.?\s*\d/i,
    maxWords: 80,
  },
};

export function validatePZv3(text: string, locale: string = 'it'): ValidationResult {
  const r = RULES[locale] || RULES.it;
  
  if (!r.pluralPatterns.some(p => p.test(text))) 
    return { valid: false, reason: `${locale}: missing plural-inclusive marker` };
  
  for (const fdm of r.forbiddenDocenteMeta) {
    if (fdm.test(text)) return { valid: false, reason: `${locale}: forbidden docente-meta` };
  }
  
  for (const fs of r.forbiddenSingular) {
    if (fs.test(text)) return { valid: false, reason: `${locale}: forbidden singular second-person` };
  }
  
  if (r.conceptsRequiringCitation.test(text) && !r.citationPattern.test(text)) {
    return { valid: false, reason: `${locale}: concept mentioned without volume citation` };
  }
  
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > r.maxWords) {
    return { valid: false, reason: `${locale}: ${wordCount} words > ${r.maxWords} max` };
  }
  
  return { valid: true };
}
```

Ogni `speakTTS` action OpenClaw DEVE passare validator. Se fallisce 2× retry, OpenClaw aborta plan + fallback safe template.

---

## 7. GDPR provider matrix (runtime policy)

| Provider | Region | DPA | Use RUNTIME student chat | Use BATCH ingest | Use TEACHER-CONTEXT |
|---|---|---|---|---|---|
| **Supabase** (Ireland/Frankfurt) | EU | ✅ signable | ✅ PRIMARY | ✅ | ✅ |
| **Gemini API** (Google Cloud EU Dublin) | EU (conditional) | ⚠️ require EU-only flag | ✅ current primary | ✅ | ✅ |
| **Scaleway AI Studio** (FR) | EU | ✅ native | ✅ | ✅ | ✅ |
| **OVH AI Endpoints** (FR) | EU | ✅ native | ✅ | ✅ | ✅ |
| **Mistral AI** (FR) | EU | ✅ native | ✅ | ✅ | ✅ |
| **Hetzner Cloud** (DE) | EU | ✅ native | ✅ self-host | ✅ | ✅ |
| **Hetzner GEX44** GPU (DE) | EU | ✅ | ✅ self-host primary future | ✅ | ✅ |
| **RunPod EU Secure** (LU) | EU servers, US company | ⚠️ DPA + SCC 2021 | ⚠️ with signed DPA | ✅ | ⚠️ |
| **Vast.ai EU community** | filter EU | ❌ community, no DPA | ❌ DEV ONLY | ❌ | ❌ |
| **Together AI** (US) | US | ⚠️ require SCC | ❌ student chat FORBIDDEN | ✅ safe (no PII) | ⚠️ teacher-only mode |
| **OpenAI** (US) | US | ⚠️ | ❌ | ❌ | ❌ |
| **Anthropic Claude** (US) | US | ⚠️ | ❌ | ❌ | ❌ |
| **Groq** (US) | US | ❌ | ❌ | ❌ | ❌ |

### Together AI — role preciso (novità)

**3 modi legittimi di usare Together**:

**1. Batch ingest volumi (SAFE, zero PII)**
- Pre-processing contenuto volumi Arduino Italia → embeddings + chunks
- Zero dati studente coinvolti
- Cost: ~$0.07 one-time per full volumi 3 libri
- Cron: ri-eseguire ogni 2-3 mesi se volumi aggiornati

**2. Teacher-context mode (NEW in v4)**
- Quando docente (non studente) fa query SUL PROPRIO LAVORO didattico
- Es: "Come preparo meglio la lezione sul condensatore per una classe difficile?"
- No PII studente nella query
- Optional: esplicito consenso docente + flag `teacherMode=true`
- Together offre Qwen 72B premium quality per planning didattico
- Cost: ~$0.002 per query (Qwen 72B Together pricing)
- Disable by default, docente abilita in settings

**3. Emergency disaster recovery (rare, rare)**
- Quando TUTTI EU provider down contemporaneamente (Supabase + Scaleway + OVH)
- Popup chiede consenso docente esplicito
- Messaggio anonimizzato passato a Together Qwen 72B
- Response torna, user visualizza
- Log incident per GDPR audit
- <10 casi/anno previsti

**MAI student runtime chat a Together**. Enforcement in client code guard:
```typescript
function canUseTogether(context: RequestContext): boolean {
  if (context.mode === 'student_chat') return false;
  if (context.mode === 'teacher_planning' && context.teacherConsentGiven) return true;
  if (context.mode === 'emergency_recovery' && context.userAcknowledged) return true;
  if (context.mode === 'batch_ingest' && !context.containsPII) return true;
  return false;
}
```

### DPA signature sequence (legal)

Prima di firmare 1ª scuola:
- [ ] Supabase DPA signed (available standard)
- [ ] Google Cloud DPA for Gemini (EU data processing flag ON)
- [ ] Scaleway DPA (automatic with account FR)
- [ ] Hetzner DPA (automatic with account DE)
- [ ] Together AI DPA + SCC 2021 (for batch + teacher-mode only)
- [ ] Privacy policy ELAB italiano pubblicato su `/privacy`
- [ ] Cookie banner per GDPR cookie consent (già presente)
- [ ] Consenso parentale minori template (sign-up flow)
- [ ] Right-to-erasure workflow (Edge Function `unlim-gdpr` già esistente + wipe 90gg)

---

## 8. Revenue model + break-even onesto

### Proiezioni (no bullshit)

**Prezzo base**: €500/anno/scuola (single classe, fino 30 studenti, 1 docente). Pagamento anticipato anno scolastico.

**Upsell tier** (future):
- **Basic** €500: 1 classe, 1 docente, support email
- **Premium** €1500: 3 classi, 3 docenti, priority support, custom branding
- **Enterprise** €5000: tutto istituto, SSO, DPO dedicato, onsite training

### Projection 2026-2028

| Month | Stage | Scuole paganti | Scuole gratis pilot | Infra cost | Revenue/m | Margin/m | Cumulative |
|---|---|---:|---:|---:|---:|---:|---:|
| 2026-05 | Stage 1a Alpha | 0 | 1 | **€0** Supabase free | €0 | **€0** | **€0** |
| 2026-06 | Stage 1b | 2 | 1 | €45 Scaleway on-demand | €84 | +€39 | +€39 |
| 2026-07 | Stage 1c | 4 | 1 | €90 on-demand | €168 | +€78 | +€117 |
| 2026-08 | Stage 2a Beta | 6 | 0 | €187 GEX44 monthly | €252 | +€65 | +€182 |
| 2026-09 | Stage 2b | 10 | 0 | €187 GEX44 | €420 | +€233 | **+€415** |
| 2026-10 | Stage 2c | 15 | 0 | €187 GEX44 | €630 | +€443 | +€858 |
| 2026-11 | Stage 3a Prod | 22 | 0 | €187 GEX44 | €924 | +€737 | +€1595 |
| 2026-12 | Stage 3b | 30 | 0 | €374 2×GEX44 | €1260 | +€886 | +€2481 |
| 2027-Q1 | Stage 4 Growth | 50 | 0 | €374 | €2100 | +€1726 | +€4207/mese avg |
| 2027-Q2 | | 80 | 0 | €500 cluster | €3360 | +€2860 | |
| 2027-Q3 | Stage 5 | 150 | 0 | €800 + Tea €1500 | €6300 | +€4000 | |
| 2027-Q4 | | 250 | 0 | €1200 + team €3000 | €10500 | +€6300 | |
| 2028-Q1 | National | 400 | 0 | €2k + team €5k | €16800 | +€9800 | |
| 2028-Q2 | | 700 | 0 | €3k + team €8k | €29400 | +€18400 | |
| 2028-Q3 | | 1000 | 0 | €5k + team €12k | €42000 | +€25000 | |

**Break-even mese**: Stage 2b (Ottobre 2026, 10 scuole). 
**Payback investment**: 3 mesi post-break-even.
**Profitable sustainable**: Stage 3b (Dicembre 2026, 30 scuole).
**Full-time+Tea**: Stage 5 (2027-Q3, 150 scuole).
**Team**: Stage 4 (2027-Q4, 250 scuole).

### Costi tuoi solo oggi (Stage 0-1)

| Categoria | €/m | Cumulativo 3 mesi |
|---|---:|---:|
| Supabase free | €0 | €0 |
| Gemini free tier | €0 | €0 |
| Vercel hobby | €0 | €0 |
| GitHub free | €0 | €0 |
| Dominio elabtutor.school | ~€1/m | €3 |
| Together batch ingest (one-time) | $0.07 | €0.07 |
| Weekend GPU experiment | €15 one-time | €15 |
| **Total 3 mesi Stage 0-1** | | **~€18** |

Quando firma 1ª scuola (Stage 1b): Scaleway on-demand €45/m per lezione GPU. Revenue €42/m-€84/m copre.

---

## 9. GPU VPS hourly — inizio USO reale (non solo docs)

User conferma: vuole START USING GPU, non solo prepararsi.

### Weekend benchmark concreto (tu)

| Test | Provider | GPU | Durata | Cost €    | Obiettivo |
|---|---|---|---:|---:|---|
| A | Scaleway L4 24GB FR | L4 | 2h | €1.70 | Qwen 14B + PZ v3 validate IT |
| B | Vast.ai RTX 4090 EU | 4090 | 3h | €1.00 | Qwen 14B quality bench (community, DEV only) |
| C | RunPod A100 40GB LU | A100 | 2h | €2.40 | Qwen 72B quality vs 14B |
| D | Scaleway H100 80GB | H100 | 1h | €3.20 | Qwen 72B latency test |
| **Tot** | | | **8h** | **€8.30** | Stack decision data |

Output atteso: CSV con {provider, model, quant, ttft_ms, tps, quality_score_manual, pz_v3_pass_rate, latency_P50/P95, cost_per_1k_token}.

### Post-weekend decisione

Se quality 14B sufficiente (>= 7/10 PZ v3 compliance + citations fedeli) → **Hetzner GEX44 €187/m** quando revenue
Se 14B insufficient → **Hetzner GEX44 + Qwen 72B 4-bit** stesso prezzo, minore buffer

Scaleway hourly on-demand per Stage 1 alpha (€45/m costo 3 scuole): transitional.
Hetzner GEX44 monthly fixed per Stage 2+ (break-even 5+ scuole).

### Actual ingestion (today, €0.07)

**Prima scuola** firmata:
1. Run Together batch ingest volumi ELAB (30 min wait, $0.07)
2. Supabase pgvector populated con 6000 chunks Wiki LLM
3. Principio Zero v3 auto-cita Vol+pagina fedele
4. Onniscenza VERA enabled

Questo è task per me (Claude) da scrivere + per Andrea (o loop) da eseguire.

---

## 10. Multilingue strategy (bassa spesa)

**Tier 1 oggi**: IT core funzionante (già prodotto).
**Tier 2 Stage 2**: EN UI + prompt + PZ v3 validator (8 ore manual IT→EN translate UI strings + 4 ore prompt tuning).
**Tier 3 Stage 4**: ES/FR/DE (same + mechanical translation via Qwen).

**RAG multilingue**:
- Phase 1: Wiki LLM in IT only, query EN/ES/FR/DE auto-translate input → IT embed → search → response IT auto-translate output
- Phase 2: Wiki LLM translated tramite Qwen offline (batch), dual-lang search

**Voxtral TTS** per lingua:
- it-IT "Francesca" (default)
- en-US "Emma" 
- es-ES "Lucia"
- fr-FR "Céline"
- de-DE "Kathrin"

Cost incrementale multilingue: **€0 runtime** (tutto self-host), ~16 ore dev per unlock 4 nuove lingue.

---

## 11. Cosa fare ora — action plan final

### Questa sessione Claude (me) — 8 file scritti in branch

File pronti a committare nel branch `feature/pdr-sett5-openclaw-onnipotenza-morfica-v4`:

1. ✅ Questo master doc (sto scrivendo ora)
2. [da scrivere] `scripts/openclaw/tools-registry.ts`
3. [da scrivere] `scripts/openclaw/morphic-generator.ts`
4. [da scrivere] `scripts/openclaw/tool-memory.ts`
5. [da scrivere] `scripts/openclaw/pz-v3-validator.ts`
6. [da scrivere] `scripts/openclaw/state-snapshot-aggregator.ts`
7. [da scrivere] `scripts/openclaw/together-teacher-mode.ts`
8. [da scrivere] `docs/business/revenue-model-elab-2026.md`

Plus CLAUDE.md update.

### Weekend (Andrea)

- Sabato: GPU benchmark €8-15
- Domenica: PNRR pitch + contatti 3 scuole

### Sprint 6 loop (autonoma, 5-7 giorni)

- Implementa `scripts/openclaw/router.deno.ts` Supabase Edge
- Adds 6 new tools in `__ELAB_API`
- Wiki LLM ingest batch one-time (Together $0.07)
- Integration tests 30 scenari
- CoV 3x
- Live smoke (dry-run no deploy)
- Teacher Dashboard MVP real-data parallel

### Sprint 7 trigger = firma 1ª scuola

- Deploy Scaleway L4 hourly on-demand
- OpenClaw router live
- Principio Zero v3 enforced multilingue
- GDPR DPA firmato
- Smoke 24h

### Sprint 8 = 3+ scuole

- Migrazione a Hetzner GEX44 €187/m
- Qwen 14B primary + fallback chain full
- OpenClaw tool memory attivo
- Together teacher-mode opt-in
- Monitor & optimize

---

## 12. Honesty disclosures finali

### Cose che NON risolve questo piano
- **Sales**: Andrea solo non chiude 50 scuole. Giovanni + Omaric + Davide CRITICO.
- **Legal**: primo contratto scuola richiede avvocato €500-1000.
- **Onboarding docenti**: 2h/classe deployment. Budget Tea tempo.
- **Primo cliente gratis**: 3 mesi pilota = €375 perdita (accettabile per testimonianza).

### Rischi identificati
1. Qwen 14B quality insufficient per PZ v3 → fallback Qwen 72B su H100 €3.20/h → doppio costo
2. Tool memory pgvector sovraccarica Supabase free (500MB) → Pro €25/m earlier
3. L3 dynamic gen exploit → mitigato sandbox + DEV-FLAG OFF
4. Together AI politica cambia → fallback EU providers
5. Wiki LLM 6000 chunks quality variabile → manual review primi 100 chunks
6. Hetzner GEX44 sold-out → Scaleway GPU backup + OVH

### Claim verificabili ora
- ✅ Supabase Edge Function `unlim-chat` v16 ACTIVE (verified con curl oggi)
- ✅ X-Elab-Api-Key enforcement (verified 200/401 curl test)
- ✅ Principio Zero v3 LIVE (response "Ragazzi, un LED..." Vol.1 pag.27 verified)
- ✅ CSP inline safety net operational (post deploy d99a4c6 verified)
- ⏳ Wiki LLM ingest pending (scaffolding done, actual data not loaded yet)
- ⏳ OpenClaw not yet deployed (this PR adds spec + prototype)
- ⏳ Morphic generator not yet exists (this PR adds)

### Brutal truth
Piano è ambizioso. Tutto questo **per 1 solo-dev** è molto. Priorità realistica:
1. Q2 2026: Dashboard + PNRR sales pitch + 3 scuole firmate (revenue priority)
2. Q3 2026: OpenClaw prototype → deploy prima scuola (tech priority)
3. Q4 2026: Tool memory + L2 morphic live (scale priority)
4. Q1 2027: L3 morphic dev-flag + Together teacher mode (advanced)
5. Q2+ 2027: multilingue + Hetzner cluster (growth priority)

Se viene firmata 0 scuola in 90 giorni: **pivot**. Non ostinarsi su architettura.

---

**FINE master doc v4**. Prossimi 7 file seguono.
