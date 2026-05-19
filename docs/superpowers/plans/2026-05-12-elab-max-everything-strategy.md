# ELAB Max-Everything Strategy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Maximum velocità + qualità + integrabilità + scalabilità + intelligenza ELAB Tutor stack May 2026, rispettando Principio Zero + Morfismo + Onniscenza + Onnipotenza inviolabili, GDPR Art.8 minori EU clean, Mistral-pure Sense 2 perfect + UNLIM Dreams overnight intelligence.

**Architecture:** Mistral Medium 3.5 single-model runtime (chat + reasoning + vision integrated) + Voxtral voice clone Andrea + Pixtral Large kit foto specifico + Mistral OCR Tea libro + UNLIM Dreams overnight consolidation (Claude Dreams equivalent EU-clean) + Gemini Vertex Frankfurt fallback gated + Cloudflare Workers AI multimodal fallback. Single-vendor majority (Mistral) for Sense 2 narratore unified. PZ docente-tramite rilassa latency criticità (4-5s p95 OK chat). Anti-G45 mandatory data-driven decisions.

**Tech Stack:** React 19 + Vite 7 (Vercel frontend), Supabase Edge Functions Deno 2 (backend), Postgres 15 + pgvector + pg_cron, Mistral La Plateforme (FR EU primary), Gemini Vertex Frankfurt (EU fallback), Cloudflare Workers AI (fallback chain), PostHog observability, Sentry error tracking.

---

## Self-Review Pre-Plan

**Spec coverage** Andrea mandate dimensions:
- ✓ Velocità: PZ docente-tramite latency budget 5s p95 OK Mistral + Promise.all parallelize iter 38 A3 + cron warmup iter 38 A5
- ✓ Qualità: Mistral Italian native + Vol/pag verbatim canonical rewriter + post-LLM PZ V3 12/12 rules
- ✓ Integrabilità: 1 vendor majority (Mistral) + Vertex EU fallback + CF Workers AI + Vercel/Supabase/PostHog
- ✓ Scalabilità: Edge auto-scale + cron warmup + Mistral Scale auto-rotate + Vertex regional
- ✓ Intelligenza: Mistral Large 2 reasoning + Pixtral Large kit + UNLIM Dreams pattern detection
- ✓ Principio Zero: docente tramite + plurale Ragazzi + Vol/pag verbatim + kit fisico mention preserved
- ✓ Morfismo Sense 1.5: per-docente UNLIM Dreams memory + per-classe age adaptation
- ✓ Morfismo Sense 2: 100% Mistral runtime + Voxtral voice = narratore volumi unified
- ✓ Onniscenza: L1-L8 multi-layer + NEW UNLIM Dreams overnight L8
- ✓ Onnipotenza: INTENT parser iter 36-37 + Deno port 57-tool iter 39+ + L2 templates 25/94 Sprint V

---

## Phase 0 — GDPR P0 Vertex EU Migration (4-6h, INVIOLABLE prereq)

### Task 0.1: Setup Vertex AI Frankfurt service account

**Files:**
- Create: `~/.elab-credentials/vertex-service-account.json` (downloaded from GCP console, NOT git-tracked)
- Modify: `~/.elab-credentials/sprint-s-tokens.env` (+1 line `GCP_PROJECT_ID=elab-tutor-vertex`)

- [ ] **Step 1: Create GCP project EU**

```bash
gcloud projects create elab-tutor-vertex --name="ELAB Tutor Vertex"
gcloud config set project elab-tutor-vertex
gcloud services enable aiplatform.googleapis.com
gcloud iam service-accounts create elab-vertex-runtime \
  --display-name="ELAB Vertex Runtime"
gcloud iam service-accounts keys create vertex-sa.json \
  --iam-account=elab-vertex-runtime@elab-tutor-vertex.iam.gserviceaccount.com
mv vertex-sa.json ~/.elab-credentials/vertex-service-account.json
chmod 600 ~/.elab-credentials/vertex-service-account.json
```

Expected: JSON key file created + project active EU region europe-west3 (Frankfurt).

- [ ] **Step 2: Test Vertex API call EU**

```bash
ACCESS_TOKEN=$(gcloud auth print-access-token --impersonate-service-account=elab-vertex-runtime@elab-tutor-vertex.iam.gserviceaccount.com)
curl -s -X POST \
  "https://europe-west3-aiplatform.googleapis.com/v1/projects/elab-tutor-vertex/locations/europe-west3/publishers/google/models/gemini-2.5-flash-lite:generateContent" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"role":"user","parts":[{"text":"Ciao"}]}]}'
```

Expected: HTTP 200 + Italian response within 2s + region header `europe-west3`.

- [ ] **Step 3: Commit credential reference (NOT secret file)**

```bash
git add ~/.elab-credentials/sprint-s-tokens.env # if tracked
git commit -m "feat(gdpr): add GCP project ID env reference for Vertex Frankfurt EU"
```

### Task 0.2: Migrate gemini.ts to Vertex EU endpoint

**Files:**
- Modify: `supabase/functions/_shared/gemini.ts:30-180` (callGemini endpoint switch)

- [ ] **Step 1: Read current gemini.ts callGemini implementation**

```bash
grep -n "googleapis.com\|generativelanguage\|aiplatform" supabase/functions/_shared/gemini.ts
```

Expected: identifies hardcoded `generativelanguage.googleapis.com` (AI Studio).

- [ ] **Step 2: Replace endpoint to Vertex EU**

Edit `supabase/functions/_shared/gemini.ts:30-50`:

```ts
// BEFORE
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

// AFTER (Vertex EU Frankfurt)
const GCP_PROJECT_ID = (Deno.env.get('GCP_PROJECT_ID') || '').trim();
const VERTEX_LOCATION = 'europe-west3';
const VERTEX_API_URL = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/${model}:generateContent`;
// Auth via Bearer access_token from service account (NOT api_key)
const accessToken = await getVertexAccessToken(); // NEW helper using JWT signing
const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
```

- [ ] **Step 3: Implement getVertexAccessToken JWT signing**

Add new helper to `gemini.ts`:

```ts
async function getVertexAccessToken(): Promise<string> {
  const saJson = Deno.env.get('GCP_SERVICE_ACCOUNT_JSON');
  if (!saJson) throw new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, 'Missing GCP_SERVICE_ACCOUNT_JSON env');
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);
  const jwt = await signJWT({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }, sa.private_key);
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await resp.json();
  return data.access_token;
}
```

- [ ] **Step 4: Set Supabase secrets**

```bash
source ~/.elab-credentials/sprint-s-tokens.env
SA_JSON=$(cat ~/.elab-credentials/vertex-service-account.json | jq -c .)
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase secrets set \
  GCP_PROJECT_ID="elab-tutor-vertex" \
  GCP_SERVICE_ACCOUNT_JSON="$SA_JSON" \
  --project-ref euqpdueopmlllqjmqnyb
```

Expected: secrets stored with EU service account JSON.

- [ ] **Step 5: Redeploy Edge unlim-chat**

```bash
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt
```

- [ ] **Step 6: Smoke test Vertex EU**

```bash
NEW_KEY=$(cat /tmp/elab-api-key-iter3.txt)
REAL_ANON="..." # from Supabase api-keys
curl -s -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Authorization: Bearer $REAL_ANON" \
  -H "X-Elab-Api-Key: $NEW_KEY" \
  -d '{"message":"Ciao","sessionId":"vertex-smoke"}' -m 30 -w "\n%{time_total}s\n"
```

Expected: HTTP 200 + Italian response + response header `x-google-region: europe-west3` (verify Vertex EU).

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/_shared/gemini.ts
git commit -m "fix(gdpr): migrate Gemini AI Studio → Vertex Frankfurt EU (P0 Art.8 minori)"
```

---

## Phase 1 — Mistral Primary Chat Routing (15 min)

### Task 1.1: Switch chat to weighted Mistral primary

**Files:**
- Modify: `supabase/functions/unlim-chat/index.ts:790`

- [ ] **Step 1: Read current callLLM invocation**

```bash
sed -n '780,800p' supabase/functions/unlim-chat/index.ts
```

Expected: confirms `preferFastProvider: true` line 790.

- [ ] **Step 2: Replace with classifier-based override**

Edit `supabase/functions/unlim-chat/index.ts:780-800`:

```ts
// BEFORE
const llmCallPromise = callLLM({
  model,
  systemPrompt,
  message: safeMessage,
  images: safeImages,
  maxOutputTokens: activeAiProfile.depth === 'total' ? 520 : 240,
  temperature: 0.7,
  thinkingLevel,
  preferFastProvider: true,
  ...(useIntentSchema ? { responseFormat: INTENT_TOOLS_SCHEMA } : {}),
});

// AFTER (Mistral primary + classifier reasoning override)
const wantReasoning = promptClass.category === 'deep_question';
const llmCallPromise = callLLM({
  model,
  systemPrompt,
  message: safeMessage,
  images: safeImages,
  maxOutputTokens: activeAiProfile.depth === 'total' ? 520 : 240,
  temperature: 0.7,
  thinkingLevel,
  preferFastProvider: false,  // route via weighted Mistral primary
  modelOverride: wantReasoning ? 'mistral-large-latest' : undefined,
  ...(useIntentSchema ? { responseFormat: INTENT_TOOLS_SCHEMA } : {}),
});
```

- [ ] **Step 3: Set Supabase secrets routing weights**

```bash
source ~/.elab-credentials/sprint-s-tokens.env
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase secrets set \
  LLM_ROUTING_WEIGHTS="0,100,0,0" \
  ROUTING_MODE="weighted" \
  ENABLE_LLM_RACE="false" \
  --project-ref euqpdueopmlllqjmqnyb
```

Expected: weights = 0% Gemini, 100% Mistral-small, 0% Mistral-large, 0% Together. Deep question override → Mistral Large via modelOverride.

- [ ] **Step 4: Redeploy Edge**

```bash
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt
```

- [ ] **Step 5: Smoke test 5q Mistral routing**

```bash
for q in "Ciao" "Spiegami il LED Vol.1 cap.6" "Perché il LED non si accende? Analizza i possibili difetti" "Cos'è una breadboard?" "Posso usare 220V casa?"; do
  curl -s -X POST "..." -d "{\"message\":\"$q\",\"sessionId\":\"phase1-smoke-$(date +%s%N)\"}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'src={d.get(\"source\",\"?\")} resp={d.get(\"response\",\"\")[:80]}')"
done
```

Expected: src=`mistral-small-latest` 4/5 + src=`mistral-large-latest` 1/5 (deep_question). NO `flash-lite` (Gemini bypass).

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/unlim-chat/index.ts
git commit -m "feat(iter-5): route chat Mistral primary + classifier reasoning override (Combo A All-Mistral phase 1)"
```

---

## Phase 2 — Bench 60q Data-Driven Validation (1h)

### Task 2.1: Run Tester plan 60q × 3 runs

**Files:**
- Use: `scripts/bench/run-iter5-router-bench.mjs` (per Tester plan, extends `run-sprint-r5-stress.mjs`)

- [ ] **Step 1: Author 60q fixture per Tester plan**

```bash
cat > scripts/bench/fixtures/iter-5-combo-a-bench.jsonl <<EOF
{"tier":"T0","cat":"chit_chat","query":"Ciao","expectedTier":"T0"}
{"tier":"T0","cat":"citation_vol_pag","query":"Spiegami il LED Vol.1 cap.6","expectedTier":"T0"}
// ... (60 entries total per Tester plan)
EOF
```

Expected: 60 entries (T0:15, T1:15, T2:10, T3:10, T4:5, T5:5).

- [ ] **Step 2: Run 60q × 3 runs**

```bash
NEW_KEY=$(cat /tmp/elab-api-key-iter3.txt)
REAL_ANON="..."
for run in 1 2 3; do
  node scripts/bench/run-iter5-router-bench.mjs \
    --fixture=scripts/bench/fixtures/iter-5-combo-a-bench.jsonl \
    --output=docs/audits/bench/iter-5-combo-a-run-${run}.json \
    --anon="$REAL_ANON" --elab-key="$NEW_KEY"
done
```

Expected: 180 query results JSON per run + p50/p95/p99 latency + 12-rule scorer per response.

- [ ] **Step 3: Aggregate worst-of-3 per query**

```bash
node scripts/bench/aggregate-worst-of-3.mjs \
  docs/audits/bench/iter-5-combo-a-run-{1,2,3}.json \
  > docs/audits/bench/iter-5-combo-a-aggregate.json
```

Expected: worst-of-3 per query (anti-cherry-pick).

- [ ] **Step 4: Verify decision rule per-tier gates**

```bash
python3 scripts/bench/verify-gates-iter5.py docs/audits/bench/iter-5-combo-a-aggregate.json
```

Expected output one of:
- `COMBO A PASS: p95 <=5s + 503 <2% + vol_pag >=85% strict + plurale 100% + classifier >=95% accuracy`
- `COMBO A FAIL: reason=<specific gate failure> → REVERT to Combo C hybrid`

- [ ] **Step 5: Commit bench results**

```bash
git add docs/audits/bench/iter-5-combo-a-*
git commit -m "test(iter-5): 60q bench Combo A Mistral primary data-driven evidence"
```

---

## Phase 3 — Decide Combo A vs C Basato Su Data (15 min)

### Task 3.1: Branch decision

- [ ] **Step 1: Read Phase 2 Step 4 verdict**

```bash
grep -E "PASS|FAIL" docs/audits/bench/iter-5-combo-a-aggregate.json
```

- [ ] **Step 2a (IF PASS): Confirm Combo A All-Mistral**

```bash
echo "Combo A All-Mistral confirmed → proceed Phase 4-10" | tee docs/audits/iter-5-DECISION-COMBO-A.md
```

- [ ] **Step 2b (IF FAIL): Revert to Combo C Hybrid**

Revert Phase 1 Step 2:

```ts
// REVERT to status quo Gemini Flash-Lite chat default
preferFastProvider: true,
modelOverride: wantReasoning ? 'mistral-large-latest' : undefined,
```

Set secrets:

```bash
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase secrets set \
  LLM_ROUTING_WEIGHTS="50,15,15,20" \
  --project-ref euqpdueopmlllqjmqnyb
```

Commit:

```bash
git commit -am "fix(iter-5): revert to Combo C Hybrid post-bench FAIL Combo A"
```

- [ ] **Step 3: Update todo + commit decision**

```bash
git add docs/audits/iter-5-DECISION-*.md
git commit -m "docs(iter-5): data-driven combo decision logged"
```

---

## Phase 4 — UNLIM Dreams Overnight Consolidation (6h, NEW intelligence)

### Task 4.1: Schema unlim_dreams_insights

**Files:**
- Create: `supabase/migrations/20260513000000_unlim_dreams_insights.sql`

- [ ] **Step 1: Author migration**

```sql
-- 20260513000000_unlim_dreams_insights.sql
CREATE TABLE IF NOT EXISTS unlim_dreams_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  consolidated_at TIMESTAMPTZ DEFAULT now(),
  recurring_mistakes JSONB DEFAULT '[]',
  teacher_style TEXT,
  last_chapter_summary TEXT,
  recommended_next TEXT,
  anonymized BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days')
);

CREATE INDEX idx_unlim_dreams_session ON unlim_dreams_insights (session_id, consolidated_at DESC);
CREATE INDEX idx_unlim_dreams_expires ON unlim_dreams_insights (expires_at);

ALTER TABLE unlim_dreams_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_dreams" ON unlim_dreams_insights FOR SELECT TO anon USING (true);

-- pg_cron daily consolidation 03:00 UTC
SELECT cron.schedule(
  'unlim-dreams-nightly',
  '0 3 * * *',
  $$ SELECT net.http_post(
    url := 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-dreams-batch',
    headers := jsonb_build_object('X-Cron-Auth', current_setting('app.dreams_cron_secret', true)),
    body := jsonb_build_object('mode', 'full', 'anonymize', true)
  ) $$
);

-- TTL cleanup
SELECT cron.schedule(
  'unlim-dreams-ttl-sweep',
  '0 4 * * *',
  $$ DELETE FROM unlim_dreams_insights WHERE expires_at < now() $$
);
```

- [ ] **Step 2: Apply migration**

```bash
source ~/.elab-credentials/sprint-s-tokens.env
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" yes | npx supabase db push --linked
```

Expected: migration applied + cron jobs registered.

- [ ] **Step 3: Verify**

```bash
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase db query --linked \
  "SELECT jobname, schedule FROM cron.job WHERE jobname LIKE '%dreams%'"
```

Expected: 2 cron jobs visible.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260513000000_unlim_dreams_insights.sql
git commit -m "feat(iter-5-dreams): schema unlim_dreams_insights + pg_cron daily consolidation"
```

### Task 4.2: Edge Function unlim-dreams-batch

**Files:**
- Create: `supabase/functions/unlim-dreams-batch/index.ts`
- Create: `supabase/functions/_shared/dreams-consolidator.ts`

- [ ] **Step 1: Test fixture for dreams consolidation**

```bash
cat > tests/unit/dreamsConsolidator.test.js <<EOF
import { describe, test, expect, vi } from 'vitest';
import { consolidateSessionDreams } from '../../supabase/functions/_shared/dreams-consolidator.ts';

describe('UNLIM Dreams 4-phase consolidator', () => {
  test('Phase 1 ORIENT reads memory + history', async () => {
    const mockSupabase = { /* mock */ };
    const mockLLM = vi.fn().mockResolvedValue({ text: '{"recurring_mistakes":["polarity_LED"]}' });
    const result = await consolidateSessionDreams('test-session', mockSupabase, mockLLM);
    expect(result.recurring_mistakes).toContain('polarity_LED');
  });
  test('Phase 2 GATHER calls Mistral Medium 3 batch', async () => { /* ... */ });
  test('Phase 3 CONSOLIDATE merges duplicates', async () => { /* ... */ });
  test('Phase 4 PRUNE keeps last 30 days', async () => { /* ... */ });
  test('GDPR anonymization strips PII', async () => { /* ... */ });
});
EOF
```

- [ ] **Step 2: Run test verify FAIL**

```bash
npx vitest run tests/unit/dreamsConsolidator.test.js
```

Expected: FAIL "consolidateSessionDreams is not defined".

- [ ] **Step 3: Implement dreams-consolidator.ts**

```ts
// supabase/functions/_shared/dreams-consolidator.ts
import type { SupabaseClientLike } from './together-fallback.ts';
import { callMistralChat } from './mistral-client.ts';

const DREAMS_PROMPT = `Sei UNLIM Dreams, sistema di consolidamento memoria notturna ELAB Tutor.
Analizza le sessioni precedenti del docente e produci un JSON con insights consolidati:
{
  "recurring_mistakes": ["errore comune 1", "errore comune 2"],
  "teacher_style": "verifica prima codice|esempi base|avanzato",
  "last_chapter_summary": "Cap.X Vol.Y: argomento + progresso classe",
  "recommended_next": "esperimento suggerito coerente Volume"
}
Mantieni anonimizzazione: NON includere nomi studenti, scuola, dati personali.
Cita Vol/pag verbatim per recommended_next.`;

export interface DreamsInsight {
  session_id: string;
  recurring_mistakes: string[];
  teacher_style: string;
  last_chapter_summary: string;
  recommended_next: string;
  anonymized: boolean;
}

export async function consolidateSessionDreams(
  sessionId: string,
  supabase: SupabaseClientLike,
  llmCall: (opts: { systemPrompt: string; message: string; maxOutputTokens: number }) => Promise<{ text: string }>,
): Promise<DreamsInsight> {
  // Phase 1: ORIENT
  const { data: memory } = await supabase.from('unlim_session_memory').select('*').eq('session_id', sessionId).maybeSingle();
  const { data: history } = await supabase.from('unlim_message_history').select('user_msg_preview,response_preview,experiment_id,chapter,volume,topic').eq('session_id', sessionId).order('message_idx', { ascending: true });
  if (!memory || !history?.length) return { session_id: sessionId, recurring_mistakes: [], teacher_style: '', last_chapter_summary: '', recommended_next: '', anonymized: true };

  // Phase 2: GATHER (anonymized)
  const payload = JSON.stringify({ memory: { last_chapter: memory.last_chapter, last_volume: memory.last_volume, common_mistakes: memory.common_mistakes }, history: history.slice(-20) });
  const llmResult = await llmCall({
    systemPrompt: DREAMS_PROMPT,
    message: payload,
    maxOutputTokens: 800,
  });

  // Phase 3: CONSOLIDATE — parse JSON
  let parsed: Partial<DreamsInsight>;
  try {
    parsed = JSON.parse(llmResult.text);
  } catch {
    parsed = { recurring_mistakes: [], teacher_style: '', last_chapter_summary: '', recommended_next: '' };
  }

  // Phase 4: PRUNE & INDEX — write to dreams_insights table (TTL 90d auto)
  const insight: DreamsInsight = {
    session_id: sessionId,
    recurring_mistakes: parsed.recurring_mistakes ?? [],
    teacher_style: parsed.teacher_style ?? '',
    last_chapter_summary: parsed.last_chapter_summary ?? '',
    recommended_next: parsed.recommended_next ?? '',
    anonymized: true,
  };
  await supabase.from('unlim_dreams_insights').insert(insight);
  return insight;
}
```

- [ ] **Step 4: Implement unlim-dreams-batch/index.ts entrypoint**

```ts
// supabase/functions/unlim-dreams-batch/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callMistralChat } from '../_shared/mistral-client.ts';
import { consolidateSessionDreams } from '../_shared/dreams-consolidator.ts';

Deno.serve(async (req) => {
  const cronAuth = req.headers.get('X-Cron-Auth');
  if (cronAuth !== Deno.env.get('DREAMS_CRON_SECRET')) {
    return new Response('Unauthorized', { status: 401 });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  // Find sessions with activity yesterday
  const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString();
  const { data: sessions } = await supabase
    .from('unlim_session_memory')
    .select('session_id')
    .gt('updated_at', yesterday);
  let consolidated = 0;
  for (const { session_id } of sessions ?? []) {
    try {
      await consolidateSessionDreams(session_id, supabase, async (opts) => {
        const r = await callMistralChat({ ...opts, model: 'mistral-medium-2505' });
        return { text: r.text };
      });
      consolidated++;
    } catch (e) {
      console.warn(`Dreams consolidate session ${session_id} failed: ${e}`);
    }
  }
  return new Response(JSON.stringify({ consolidated, total: sessions?.length ?? 0 }), { headers: { 'Content-Type': 'application/json' } });
});
```

- [ ] **Step 5: Run test verify PASS**

```bash
npx vitest run tests/unit/dreamsConsolidator.test.js
```

Expected: 5/5 PASS.

- [ ] **Step 6: Deploy Edge unlim-dreams-batch**

```bash
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions deploy unlim-dreams-batch --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt
```

- [ ] **Step 7: Set DREAMS_CRON_SECRET**

```bash
DREAMS_SECRET=$(openssl rand -hex 32)
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase secrets set DREAMS_CRON_SECRET="$DREAMS_SECRET" --project-ref euqpdueopmlllqjmqnyb
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase db query --linked "ALTER DATABASE postgres SET app.dreams_cron_secret = '$DREAMS_SECRET'"
```

- [ ] **Step 8: Manual smoke test**

```bash
curl -s -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-dreams-batch" \
  -H "X-Cron-Auth: $DREAMS_SECRET" -m 60
```

Expected: HTTP 200 + `{"consolidated":N,"total":M}` JSON.

- [ ] **Step 9: Commit**

```bash
git add supabase/functions/unlim-dreams-batch/index.ts supabase/functions/_shared/dreams-consolidator.ts tests/unit/dreamsConsolidator.test.js
git commit -m "feat(iter-5-dreams): UNLIM Dreams overnight consolidator (Claude Dreams equivalent EU-clean)"
```

### Task 4.3: Wire Dreams insights to next-session prompt

**Files:**
- Modify: `supabase/functions/unlim-chat/index.ts` (post-classifier injection)
- Modify: `supabase/functions/_shared/memory.ts` (add `loadLatestDreams`)

- [ ] **Step 1: Add loadLatestDreams helper**

Edit `supabase/functions/_shared/memory.ts`:

```ts
export async function loadLatestDreams(sessionId: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const { data } = await client
    .from('unlim_dreams_insights')
    .select('recurring_mistakes,teacher_style,last_chapter_summary,recommended_next')
    .eq('session_id', sessionId)
    .order('consolidated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return `[INSIGHTS CONSOLIDATI DALLE SESSIONI PRECEDENTI]
Stile docente: ${data.teacher_style ?? '-'}
Capitolo precedente: ${data.last_chapter_summary ?? '-'}
Errori ricorrenti classe: ${(data.recurring_mistakes ?? []).join(', ') || '-'}
Prossimo esperimento suggerito: ${data.recommended_next ?? '-'}`;
}
```

- [ ] **Step 2: Wire into unlim-chat system prompt**

Edit `supabase/functions/unlim-chat/index.ts` (after classifier, before callLLM):

```ts
const dreamsInsights = await loadLatestDreams(sessionId);
if (dreamsInsights) {
  systemPrompt = `${systemPrompt}\n\n${dreamsInsights}`;
}
```

- [ ] **Step 3: Run integration test**

```bash
npx vitest run tests/integration/dreams-injection.test.js
```

Expected: PASS — Dreams insights appended to systemPrompt when session has prior consolidated.

- [ ] **Step 4: Redeploy + commit**

```bash
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt
git add supabase/functions/_shared/memory.ts supabase/functions/unlim-chat/index.ts
git commit -m "feat(iter-5-dreams): wire Dreams insights into next-session systemPrompt (cross-session intelligence)"
```

---

## Phase 5 — Vision Pixtral Large Kit + Mistral OCR Tea (4h)

### Task 5.1: Classifier image intent + Pixtral Large kit foto

**Files:**
- Modify: `supabase/functions/unlim-chat/index.ts` (hasImages branch sub-route)
- Create: `supabase/functions/_shared/vision-classifier.ts`

- [ ] **Step 1: Test fixture vision classifier**

```bash
cat > tests/unit/visionClassifier.test.js <<EOF
import { classifyImageIntent } from '../../supabase/functions/_shared/vision-classifier.ts';
test('kit foto → pixtral-large', () => {
  expect(classifyImageIntent('Guarda il mio kit ELAB', [{ source: 'data:image/png;base64,xxx' }])).toBe('pixtral-large-latest');
});
test('diagnose vision → mistral-medium-2505', () => {
  expect(classifyImageIntent('Perché il LED non si accende?', [{}])).toBe('mistral-medium-2505');
});
test('OCR libro → gemini-2.5-flash', () => {
  expect(classifyImageIntent('Leggi questa pagina del volume', [{}])).toBe('gemini-2.5-flash');
});
test('default chat-image → mistral-small-2506', () => {
  expect(classifyImageIntent('Che cos\\'è questo?', [{}])).toBe('mistral-small-2506');
});
EOF
```

- [ ] **Step 2: Implement vision-classifier.ts**

```ts
// supabase/functions/_shared/vision-classifier.ts
export type VisionModel = 'pixtral-large-latest' | 'mistral-medium-2505' | 'mistral-small-2506' | 'gemini-2.5-flash';

const KIT_RE = /\b(kit|breadboard|montat|fot[oa]|fisic|omaric|circuito\s+(reale|vero))\b/i;
const DIAGNOSE_RE = /\b(diagnos|brucia|spent|non\s+(funzion|accend|va)|guarda\s+perch[eé]|aiut|errore)\b/i;
const OCR_RE = /\b(libro|pagina|leggi|test[ou]|capitolo|volume\s+\d+|estrai)\b/i;

export function classifyImageIntent(message: string, _images: unknown[]): VisionModel {
  if (KIT_RE.test(message)) return 'pixtral-large-latest';
  if (DIAGNOSE_RE.test(message)) return 'mistral-medium-2505';
  if (OCR_RE.test(message)) return 'gemini-2.5-flash';
  return 'mistral-small-2506';
}
```

- [ ] **Step 3: Wire into unlim-chat hasImages branch**

Edit `supabase/functions/unlim-chat/index.ts` (where hasImages true):

```ts
if (hasImages) {
  const visionModel = classifyImageIntent(safeMessage, safeImages);
  // override callLLM model selection
}
```

- [ ] **Step 4: Run tests + commit**

```bash
npx vitest run tests/unit/visionClassifier.test.js
git add tests/unit/visionClassifier.test.js supabase/functions/_shared/vision-classifier.ts supabase/functions/unlim-chat/index.ts
git commit -m "feat(iter-5-vision): classifier-based vision sub-route (Pixtral kit / Medium 3 diagnose / Flash OCR)"
```

### Task 5.2: Mistral OCR Tea libro integration

**Files:**
- Create: `supabase/functions/unlim-ocr/index.ts`
- Create: `supabase/functions/_shared/mistral-ocr.ts`

- [ ] **Step 1: Implement mistral-ocr.ts wrapper**

```ts
// supabase/functions/_shared/mistral-ocr.ts
export async function callMistralOCR(pdfUrl: string): Promise<{ pages: Array<{ index: number; markdown: string }> }> {
  const apiKey = Deno.env.get('MISTRAL_API_KEY')!;
  const r = await fetch('https://api.mistral.ai/v1/ocr', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'mistral-ocr-2509', document: { type: 'document_url', document_url: pdfUrl } }),
  });
  if (!r.ok) throw new Error(`Mistral OCR ${r.status}`);
  return await r.json();
}
```

- [ ] **Step 2: Edge Function unlim-ocr**

```ts
// supabase/functions/unlim-ocr/index.ts
import { callMistralOCR } from '../_shared/mistral-ocr.ts';
import { verifyElabApiKey } from '../_shared/guards.ts';

Deno.serve(async (req) => {
  if (!await verifyElabApiKey(req)) return new Response('Unauthorized', { status: 401 });
  const { pdfUrl } = await req.json();
  const result = await callMistralOCR(pdfUrl);
  return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
});
```

- [ ] **Step 3: Deploy + smoke test**

```bash
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions deploy unlim-ocr --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt
curl -s -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-ocr" -H "X-Elab-Api-Key: $NEW_KEY" -d '{"pdfUrl":"https://example.com/sample-page.pdf"}'
```

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/unlim-ocr/index.ts supabase/functions/_shared/mistral-ocr.ts
git commit -m "feat(iter-5-vision): Mistral OCR endpoint for Tea libro integration"
```

---

## Phase 6 — Voxtral Transcribe 2 STT Migration (3h iter 7+)

### Task 6.1: Replace CF Whisper Turbo with Voxtral Transcribe 2

**Files:**
- Modify: `supabase/functions/unlim-stt/index.ts`
- Create: `supabase/functions/_shared/voxtral-stt.ts`

- [ ] **Step 1: Implement voxtral-stt.ts**

```ts
export async function callVoxtralTranscribe2(audioBlob: Blob): Promise<{ text: string; language: string; wer?: number }> {
  const apiKey = Deno.env.get('MISTRAL_API_KEY')!;
  const form = new FormData();
  form.append('file', audioBlob);
  form.append('model', 'voxtral-transcribe-2-2026');
  form.append('language', 'it');
  const r = await fetch('https://api.mistral.ai/v1/audio/transcriptions', {
    method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}` }, body: form,
  });
  return await r.json();
}
```

- [ ] **Step 2: Replace unlim-stt path**

Edit `supabase/functions/unlim-stt/index.ts` add Voxtral primary + CF Whisper fallback.

- [ ] **Step 3: Deploy + commit**

```bash
git add supabase/functions/unlim-stt/index.ts supabase/functions/_shared/voxtral-stt.ts
git commit -m "feat(iter-7-voice): Voxtral Transcribe 2 STT migrate (Sense 2 unified Mistral stack)"
```

---

## Phase 7 — Onnipotenza 57-tool Deno Port (16h Sprint V Maker-1)

### Task 7.1: Port ClawBot dispatcher 12-tool subset (canary 5%)

DEFER iter 39+ per ADR-028 §7 canary rollout. Plan placeholder.

---

## Phase 8 — Morfismo Sense 1.5 Per-Docente/Classe Runtime (8h)

### Task 8.1: UNLIM Dreams insights wire to UI Lavagna

Plan placeholder iter 8+: surface Dreams insights in LavagnaShell sidebar "Ricordo dalla scorsa lezione" panel.

---

## Phase 9 — OpenAPI 3.1 Spec Update + API Docs (2h)

### Task 9.1: Add 3 NEW endpoints to OpenAPI spec

**Files:**
- Modify: `docs/api/openapi.yaml` (11 paths → 14 paths)

- [ ] **Step 1: Add unlim-dreams-batch path**

```yaml
paths:
  /functions/v1/unlim-dreams-batch:
    post:
      summary: UNLIM Dreams overnight consolidation (cron-only)
      security: [{CronAuth: []}]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  consolidated: {type: integer}
                  total: {type: integer}
```

- [ ] **Step 2: Add unlim-ocr path**

```yaml
  /functions/v1/unlim-ocr:
    post:
      summary: Mistral OCR Tea libro scan
      security: [{ApiKeyAuth: []}]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                pdfUrl: {type: string, format: uri}
              required: [pdfUrl]
```

- [ ] **Step 3: Add unlim-dreams-query (read endpoint)**

```yaml
  /functions/v1/unlim-dreams-query:
    get:
      summary: Fetch latest Dreams insights for session
      parameters:
        - {name: sessionId, in: query, required: true, schema: {type: string}}
      responses:
        '200':
          content:
            application/json:
              schema: {$ref: '#/components/schemas/DreamsInsight'}
```

- [ ] **Step 4: Lint OpenAPI**

```bash
npx @redocly/cli lint docs/api/openapi.yaml
```

Expected: 0 errors + 0 warnings.

- [ ] **Step 5: Generate TypeScript SDK**

```bash
npx openapi-typescript docs/api/openapi.yaml --output src/services/elab-api-sdk.ts
```

- [ ] **Step 6: Commit**

```bash
git add docs/api/openapi.yaml src/services/elab-api-sdk.ts
git commit -m "docs(iter-5-api): OpenAPI 3.1 + Dreams/OCR endpoints + TS SDK regenerate"
```

---

## Phase 10 — Bench Full + PostHog 6 Panels + Anti-G45 Close (6h)

### Task 10.1: PostHog observability dashboard

- [ ] **Step 1: PostHog 6 panels per Tester plan**

Configure dashboards: tier_distribution + p95_latency_per_tier + quality_per_tier + cost_per_tier + classifier_accuracy + fallback_rate.

- [ ] **Step 2: Telegram alerts breach gates**

```ts
if (p95 > 5000 || rate_503 > 0.02 || quality_avg < 0.85) sendTelegramAlert(...);
```

- [ ] **Step 3: Anti-G45 close audit**

Write `docs/audits/2026-05-12-iter-5-close-audit.md` with brutal evidence — worst-of-3 scores + p95 + cost + quality per tier. NO inflation, score honest.

- [ ] **Step 4: Commit close**

```bash
git add docs/audits/2026-05-12-iter-5-close-audit.md
git commit -m "test(iter-5-close): brutal evidence audit Anti-G45 + PostHog 6 panels live"
git tag iter-5-close
git push origin iter-5-close
```

---

## Total Effort Estimate

| Phase | Effort | Owner |
|---|---|---|
| 0 Vertex EU migration P0 GDPR | 4-6h | Andrea + Coder |
| 1 Mistral chat routing 5 LOC | 15min | Coder |
| 2 Bench 60q × 3 runs | 1h | Tester |
| 3 Decide A vs C data-driven | 15min | Andrea + Coder |
| 4 UNLIM Dreams overnight | 6h | Coder (NEW intelligence layer) |
| 5 Vision Pixtral Large + OCR | 4h | Coder |
| 6 Voxtral Transcribe 2 STT | 3h iter 7+ | Coder |
| 7 Onnipotenza 57-tool port | 16h Sprint V | Maker-1 |
| 8 Morfismo Sense 1.5 UI | 8h iter 8+ | WebDesigner |
| 9 OpenAPI 3.1 + SDK | 2h | Coder |
| 10 PostHog + Anti-G45 audit | 6h | Tester |
| **TOTAL iter 5-10 minimum viable** | **~32h** | Multi-agent OPUS Pattern S |

---

## Anti-G45 Mandate

NO claim "Max-everything LIVE" senza:
- Phase 2 60q bench worst-of-3 PASS gates
- Phase 4 Dreams batch verified 7-day consolidation
- Phase 9 OpenAPI lint 0 errors
- Phase 10 PostHog dashboards 6/6 live
- Score honest per dimension G45 cap rules

---

## Summary Semplice + Sistematico

**Cosa fare**: Mistral pure runtime + UNLIM Dreams overnight (Claude equivalent EU-clean) + Voxtral voce + Pixtral kit + Mistral OCR Tea libro + Gemini Vertex EU fallback gated.

**Perché**: 
- Sense 2 unified Mistral = moat commerciale + voce narratore + Italian native
- Onniscenza L1-L8 + Dreams = intelligenza cross-session reale
- Onnipotenza INTENT + ClawBot Deno port = action dispatch full
- GDPR clean tutto EU FR/FRA
- Cost €30-40/mese under budget €50

**Come misurare**: bench 60q × 3 worst-of-3, Anti-G45 mandate, p95 per tier, PostHog 6 panels live, Anti-cherry-pick.

**Quando**: iter 5-10 multi-agent OPUS Pattern S, total ~32h work spread over 1-2 settimane.

---

*Co-Authored-By: Claude Opus 4.7 (1M context) — ELAB Max-Everything ULTRATHINK plan iter 5+*
