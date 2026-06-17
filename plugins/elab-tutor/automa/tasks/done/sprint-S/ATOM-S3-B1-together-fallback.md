---
id: ATOM-S3-B1
parent_task: B1
sprint: S
iter: 3
priority: P1
assigned_to: generator-app-opus
depends_on: [ATOM-S3-C1]  # ADR-010 design first
provides:
  - supabase/functions/_shared/llm-client.ts (callLLMWithFallback chain)
  - supabase/functions/_shared/anonymize.ts (NEW PII heuristic strip)
  - canUseTogether(context, providersDown) gate function
  - Together AI audit log writes via together_audit_log table
est_hours: 4.0
files_owned:
  - supabase/functions/_shared/llm-client.ts
  - supabase/functions/_shared/anonymize.ts
acceptance_criteria:
  - `callLLMWithFallback(request)` chain order: callRunPod → callGemini → callTogether (gated)
  - `canUseTogether(context, providersDown): boolean` returns TRUE only if NOT student_mode AND providersDown.length >= 2
  - Block student runtime SEMPRE (return false se context.studentMode === true)
  - Anonymize heuristic in anonymize.ts: email regex, phone IT regex, italian name patterns stub
  - Every Together call logged to `together_audit_log` table (timestamp, request_id, mode, anonymized_payload_hash, response_id)
  - Together API key via `Deno.env.get("TOGETHER_API_KEY")` (already in Supabase secrets)
  - Edge Function bundle build success (no Deno import errors)
  - CoV 3x `npx vitest run` ≥12532 PASS preserved
  - Unit test by gen-test-opus covers canUseTogether gate (separate ATOM if needed)
  - NO writes student-facing code paths (Block guard)
references:
  - scripts/openclaw/together-teacher-mode.ts (existing scaffold, riusa pattern)
  - docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md §5 (Together AI fallback architecture)
  - docs/adrs/ADR-010-together-ai-fallback-design.md (delivered by ATOM-S3-C1)
  - supabase/functions/_shared/llm-client.ts (existing Gemini chain, extend)
---

## Task

Wire callLLMWithFallback chain in `_shared/llm-client.ts`. Add canUseTogether gate + anonymize heuristic + audit log writes.

## Implementation outline

```ts
// _shared/llm-client.ts
export async function callLLMWithFallback(request: LLMRequest): Promise<LLMResponse> {
  const providersDown: string[] = [];

  // 1. Try RunPod (if VPS_GPU_URL env set)
  if (Deno.env.get("VPS_GPU_URL")) {
    try { return await callRunPod(request); }
    catch (e) { providersDown.push("runpod"); }
  }

  // 2. Try Gemini (existing)
  try { return await callGemini(request); }
  catch (e) { providersDown.push("gemini"); }

  // 3. Try Together IF gated
  if (canUseTogether(request.context, providersDown)) {
    const anonymized = anonymizeRequest(request);
    const response = await callTogether(anonymized);
    await logTogetherAudit({ request_id: request.id, mode: "emergency", ...response });
    return response;
  }

  throw new LLMChainError(providersDown);
}

export function canUseTogether(context: RequestContext, providersDown: string[]): boolean {
  if (context.studentMode === true) return false;  // BLOCK student runtime ALWAYS
  if (providersDown.length < 2) return false;
  return true;
}
```

```ts
// _shared/anonymize.ts (NEW)
export function anonymizeRequest(req: LLMRequest): LLMRequest {
  let messages = req.messages.map(m => ({
    ...m,
    content: m.content
      .replace(/[\w.-]+@[\w.-]+/g, '[EMAIL]')
      .replace(/\+?\d{2,3}[ -]?\d{3}[ -]?\d{4,7}/g, '[PHONE]')
  }));
  // Italian name patterns stub (defer iter 5 NER)
  return { ...req, messages };
}
```

## CoV before claim done

- 3x `npx vitest run` ≥12532 PASS preserved
- `npm run build` PASS exit 0
- Edge Function bundle no errors (try `npx supabase functions deploy --dry-run --project-ref euqpdueopmlllqjmqnyb` if available)
- Verify `together_audit_log` table schema match (depend ATOM-S3-B2)
- Block guard validation: student_mode=true → callTogether NEVER reached (manual review)
