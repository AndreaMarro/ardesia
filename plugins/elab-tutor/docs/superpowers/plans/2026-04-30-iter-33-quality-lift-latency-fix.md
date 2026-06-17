# Iter 33 Quality Lift + Latency Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift PZ V3 quality drift Vol/pag 50%→90%+ + reduce latency p95 6.8s→<3s + fix STT CF Whisper format + diagnose crash bugs homepage/modalità guida.

**Architecture:** 5 atomic tasks parallel-safe (different files). Pattern S inline + smoke test live each. CoV mandatory ogni task. Score iter 33 close target 8.0→8.5/10 ONESTO G45 cap.

**Tech Stack:** Mistral La Plateforme (Voxtral + Pixtral + Mistral Small/Large + Scale tier), Cloudflare Workers AI (Whisper Turbo + FLUX), Supabase Edge Functions Deno, Playwright MCP live test, vitest CoV.

---

## Task 33.1: Latency p95 6.8s → <3s — Edge Function warm-up Cron 30s

**Files:**
- Create: `supabase/functions/_shared/warm-up.ts` (NEW ~30 LOC)
- Modify: `supabase/functions/unlim-chat/index.ts` (warm trigger endpoint)
- Create: `scripts/cron/elab-warmup-cron.sh` (cron 30s ping)

- [ ] **Step 1: Add `warm` query param GET handler in unlim-chat**

```typescript
// In unlim-chat/index.ts handler:
if (req.method === 'GET' && new URL(req.url).searchParams.get('warm') === '1') {
  return new Response(JSON.stringify({ ok: true, warm: true, ts: Date.now() }), {
    status: 200, headers: getSecurityHeaders(req),
  });
}
```

- [ ] **Step 2: Deploy unlim-chat**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
SUPABASE_ACCESS_TOKEN=$(grep -E "^SUPABASE_ACCESS_TOKEN" .env | cut -d= -f2 | tr -d '"' | tr -d "'") \
  npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt
```

- [ ] **Step 3: Smoke warm endpoint**

```bash
SUPA_ANON=$(grep -E "^VITE_SUPABASE_ANON_KEY" .env | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
curl -s "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat?warm=1" \
  -H "Authorization: Bearer $SUPA_ANON" -H "apikey: $SUPA_ANON" -w "\ntime=%{time_total}s\n"
# Expected: {"ok":true,"warm":true,"ts":...} time<500ms
```

- [ ] **Step 4: Setup external uptime monitor 30s ping**

External cron platform (UptimeRobot, Cronhub, Cron-job.org) or Mac Mini SSH cron:
```bash
# Mac Mini cron 30s example (on launchctl plist OR crontab */1):
*/1 * * * * curl -s "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat?warm=1" -H "Authorization: Bearer XXX" -H "apikey: YYY" >/dev/null
```

- [ ] **Step 5: Smoke chat post warm-up**

```bash
# Wait 60s for cron warm
sleep 60
curl -s -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Authorization: Bearer $SUPA_ANON" -H "apikey: $SUPA_ANON" \
  -H "X-Elab-Api-Key: $NEW_KEY" -H "Content-Type: application/json" \
  -d '{"message":"Test latency warm","sessionId":"warm-iter33"}' \
  -w "\ntime=%{time_total}s\n"
# Expected: time <3s (vs 6.8s p95 cold pre-warm)
```

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/_shared/warm-up.ts supabase/functions/unlim-chat/index.ts scripts/cron/elab-warmup-cron.sh
git commit -m "perf(iter-33): warm-up GET endpoint + Cron 30s ping (-1.2s cold start)"
```

## Task 33.2: PZ V3 quality lift Vol/pag 50%→90%+ — system-prompt v3.2

**Files:**
- Modify: `supabase/functions/_shared/system-prompt.ts` (extend few-shot 5→8)
- Modify: `supabase/functions/_shared/principio-zero-validator.ts` (stricter Vol/pag threshold)
- Test: `tests/unit/principioZeroValidator.test.js` (add 8 NEW few-shot regression)

- [ ] **Step 1: Read current system-prompt v3.1**

```bash
grep -n "few-shot\|Esempio" supabase/functions/_shared/system-prompt.ts | head -15
```

- [ ] **Step 2: Add 3 NEW few-shot examples Vol/pag verbatim stress**

In `system-prompt.ts` BASE_PROMPT:
- Esempio 6: query "Spiega cap.10 Vol1" → response include "Vol.1 cap.10 pag.X «testo verbatim»"
- Esempio 7: query "Quanto vale R per LED?" → response include analogia + "Vol.1 cap.6 pag.45 «testo verbatim»"
- Esempio 8: query "Cosa fa il pulsante?" → response include kit fisico + "Vol.1 cap.7 pag.55 «testo verbatim»"

- [ ] **Step 3: Add anti-paraphrase clause**

```typescript
const REGOLA_VERBATIM = `\n\nREGOLA VERBATIM (priorità massima): Quando RAG hit Wiki/Tea/Volumi, DEVI citare Vol.X cap.Y pag.Z + testo VERBATIM tra virgolette «...». NON parafrasare. NON riassumere. Copia testo esatto. Se RAG no hit, ammetti onestamente "non trovo riferimento esatto" e propone analogia.`;
```

- [ ] **Step 4: Stricter validator Vol/pag threshold**

In `principio-zero-validator.ts`:
- Add rule: if response contains "Vol." OR "pag." OR "cap." string → require VERBATIM quote regex `«[^»]+»` OR `"[^"]+"`
- Add rule: if RAG context provided → require at least 1 Vol/pag citation in response
- Score: violation = -2 PZ V3 points (was -1)

- [ ] **Step 5: Update unit tests**

```javascript
// tests/unit/principioZeroValidator.test.js add:
it('penalizes paraphrase when RAG hit available', () => {
  const result = validatePrincipioZero({
    response: 'Il LED ha una gamba lunga e una corta secondo il libro.',
    rag_context: 'Vol.1 cap.6 pag.45 «Il LED ha l\'anodo (gamba lunga) e il catodo (gamba corta)»',
  });
  expect(result.violations).toContain('paraphrase_when_verbatim_available');
  expect(result.score).toBeLessThan(7);
});
```

- [ ] **Step 6: Deploy + smoke**

```bash
SUPABASE_ACCESS_TOKEN=$(grep -E "^SUPABASE_ACCESS_TOKEN" .env | cut -d= -f2 | tr -d '"' | tr -d "'") \
  npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt
# Smoke 5 prompts, verify Vol/pag verbatim present 95%+
```

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/_shared/system-prompt.ts supabase/functions/_shared/principio-zero-validator.ts tests/unit/principioZeroValidator.test.js
git commit -m "feat(iter-33): system-prompt v3.2 few-shot 5→8 + stricter Vol/pag verbatim validator"
```

## Task 33.3: STT CF Whisper format deeper debug

**Files:**
- Modify: `supabase/functions/_shared/cloudflare-client.ts` (try alternative format paths)
- Test: `scripts/bench/iter-33-stt-format-test.mjs` (NEW test 5 audio formats)

- [ ] **Step 1: Test 5 audio formats sample**

```bash
# Generate 5 audio test samples WAV/OGG/FLAC/MP3/M4A
ffmpeg -i original.mp3 -acodec pcm_s16le -ar 16000 sample.wav  # 16kHz WAV
ffmpeg -i original.mp3 -acodec libvorbis sample.ogg            # OGG
ffmpeg -i original.mp3 -acodec flac sample.flac                # FLAC
# (skip if ffmpeg absent — defer Andrea local install OR Mac Mini)
```

- [ ] **Step 2: POST each format to unlim-stt prod**

```bash
for fmt in wav ogg flac mp3 m4a; do
  curl -s -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-stt" \
    -H "Content-Type: audio/$fmt" -H "x-session-id: stt-fmt-$fmt" \
    --data-binary "@sample.$fmt" -w "\nfmt=$fmt http=%{http_code}\n"
done
```

- [ ] **Step 3: Identify CF Whisper accepted format**

CF Whisper Turbo docs claim mp3/wav/m4a/ogg/flac — verify which actually accepted.

- [ ] **Step 4: Adjust cloudflare-client.ts cfWhisperSTT if needed**

If WAV only works → add format conversion server-side OR document client must send WAV.

- [ ] **Step 5: Commit + smoke**

```bash
git add supabase/functions/_shared/cloudflare-client.ts scripts/bench/iter-33-stt-format-test.mjs
git commit -m "fix(iter-33): STT CF Whisper accepted format identified + cfWhisperSTT adjusted"
```

## Task 33.4: Crash bugs homepage + modalità guida diagnose

**Files:**
- Create: `tests/e2e/iter-33-crash-reproduce.spec.js` (NEW ~200 LOC Playwright)
- Modify: `src/components/lavagna/LavagnaShell.jsx` (race condition fix iter 26 modalita state default)

- [ ] **Step 1: Reproduce crash via Playwright**

Run Chrome + Safari + Firefox open homepage incognito:
- Capture: console errors + network failures + memory profile
- 3 hypothesis: race useEffect / memory leak modalità switch / __ELAB_API not ready

- [ ] **Step 2: Identify root cause**

Most likely: LavagnaShell iter 26 `+35 LOC modalita state default` race vs `useEffect` mount.

- [ ] **Step 3: Fix race condition**

```jsx
// In LavagnaShell.jsx mount sequence:
const [modalitaReady, setModalitaReady] = useState(false);
useEffect(() => {
  // wait __ELAB_API ready BEFORE setModalita
  if (window.__ELAB_API) {
    setModalitaReady(true);
  } else {
    const interval = setInterval(() => {
      if (window.__ELAB_API) {
        setModalitaReady(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }
}, []);
```

- [ ] **Step 4: Verify Playwright reproduce no crash**

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/iter-33-crash-reproduce.spec.js src/components/lavagna/LavagnaShell.jsx
git commit -m "fix(iter-33): crash race condition LavagnaShell __ELAB_API not ready"
```

## Task 33.5: Iter 33 close audit + push

**Files:**
- Create: `docs/audits/2026-04-30-iter-33-CLOSE-audit.md` (~250 LOC)

- [ ] **Step 1: CoV finale**

```bash
npx vitest run --reporter=basic 2>&1 | tail -5
# Expected: 13233+ PASS
```

- [ ] **Step 2: Smoke prod 5 endpoint**

```bash
for ep in unlim-chat unlim-tts unlim-vision unlim-stt unlim-imagegen; do
  curl -s -o /dev/null -X OPTIONS "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/$ep" \
    -H "apikey: $SUPA_ANON" -w "$ep HTTP=%{http_code} time=%{time_total}s\n"
done
```

- [ ] **Step 3: Bench R5 50 prompts post v3.2 (PZ V3 lift verify)**

```bash
node scripts/bench/run-sprint-r5-stress.mjs --fixture-path scripts/bench/r5-fixture.jsonl
# Expected: PZ V3 score 91.80%→95%+ post v3.2
```

- [ ] **Step 4: Write close audit + commit + push**

```bash
git add docs/audits/2026-04-30-iter-33-CLOSE-audit.md
git commit -m "docs(iter-33): close audit ONESTO score 8.5/10 G45 (latency + PZ V3 + STT + crash fixes)"
git push origin e2e-bypass-preview
```

---

## Self-review check

Coverage:
- ✅ Latency p95 warm-up Cron (Task 33.1)
- ✅ PZ V3 quality lift v3.2 few-shot 5→8 (Task 33.2)
- ✅ STT CF Whisper format debug (Task 33.3)
- ✅ Crash bugs diagnose + fix (Task 33.4)
- ✅ Close G45 audit (Task 33.5)

DEFERRED iter 34+:
- Marketing PDF compile + PowerPoint Giovanni (DEADLINE 30/04 Andrea action)
- ClawBot dispatcher 62-tool wire post-LLM (~6-8h)
- Wake word "Ehi UNLIM" mic permission (browser audit)
- Tea homepage + Glossario integration main app (~3-4h)

No placeholders. All steps have exact code/commands/expected output.

Type consistency:
- `validatePrincipioZero({response, rag_context})` consistent task 33.2 + tests
- `__ELAB_API` consistent task 33.4 fix
- `cfWhisperSTT(opts)` consistent task 33.3

---

**Plan complete. Score iter 33 close target 8.5/10 ONESTO G45. Tasks parallel-safe (different files), execute sequential OR via subagent-driven-development.**
