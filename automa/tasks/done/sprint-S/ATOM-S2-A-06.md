---
id: ATOM-S2-A-06
parent_task: A
sprint: S
iter: 2
assignee: generator-app-opus
depends_on:
  - ATOM-S2-A-01
  - ATOM-S2-A-03
  - ATOM-S2-A-05
est_hours: 1.5
files_owned:
  - supabase/functions/unlim-chat/index.ts
acceptance_criteria:
  - imports added: getCapitoloByExperimentId, buildCapitoloPromptFragment, validatePrincipioZero
  - Before LLM call: resolve capitoloFragment via getCapitoloByExperimentId(experimentContext.id) + buildCapitoloPromptFragment if hit
  - buildSystemPrompt called with 4 args: studentContext, safeCircuitState, experimentContext, capitoloFragment
  - After LLM response: validatePrincipioZero(response.text) called
  - If severity === 'CRITICAL' → log to Supabase together_audit_log (riusa schema esistente, source='principio_zero_violation')
  - If severity === 'CRITICAL' AND opts.strict (env flag SUPABASE_PZ_STRICT=true) → return 422 with violation summary; ELSE return response with X-PZ-Severity header
  - Backward compat: if no capitolo found, fragment = '' → existing behavior preserved
  - All existing tests/integration/unlim-chat-* still PASS
references:
  - ATOM-S2-A-01, A-03, A-05 deliverables
  - docs/adrs/ADR-009-principio-zero-validator-middleware.md (architect-opus middleware decision)
  - existing together_audit_log schema (riusa, no new migration)
---

## Task

Wire-up production: integrate Capitolo prompt fragment + Principio Zero validator into `supabase/functions/unlim-chat/index.ts`.

## Code outline

```ts
import { buildSystemPrompt } from '../_shared/system-prompt.ts';
import { getCapitoloByExperimentId, buildCapitoloPromptFragment } from '../_shared/capitoli-loader.ts';
import { validatePrincipioZero } from '../_shared/principio-zero-validator.ts';

// ... line ~234 region ...
const capitoloHit = experimentContext?.id
  ? getCapitoloByExperimentId(experimentContext.id)
  : null;
const capitoloFragment = capitoloHit
  ? buildCapitoloPromptFragment(capitoloHit.capitolo, capitoloHit.esperimento)
  : '';

const systemPrompt = buildSystemPrompt(
  studentContext,
  safeCircuitState as CircuitState | null,
  experimentContext,
  capitoloFragment
);

// ... LLM call ...
const llmResponse = await llmClient.chat({ ... });

const pzResult = validatePrincipioZero(llmResponse.text);
if (pzResult.severity === 'CRITICAL') {
  await logViolationToSupabase({
    source: 'principio_zero_violation',
    severity: pzResult.severity,
    violations: pzResult.violations,
    response_text: llmResponse.text,
    user_session_id: req.session_id,
  });
  if (Deno.env.get('SUPABASE_PZ_STRICT') === 'true') {
    return new Response(
      JSON.stringify({ error: 'PZ_VIOLATION', severity: pzResult.severity, violations: pzResult.violations }),
      { status: 422, headers: corsHeaders }
    );
  }
}
return new Response(JSON.stringify(llmResponse), {
  headers: { ...corsHeaders, 'X-PZ-Severity': pzResult.severity, 'X-PZ-Score': String(pzResult.score) }
});
```

## CoV

- 3x `npx vitest run tests/integration/unlim-chat-prompt-v3.test.ts` PASS (test scaffold ATOM-S2-A-07)
- 3x `npx vitest run` baseline ≥12498
- npm run build PASS
- Manual smoke: deploy edge function dev mode + curl 1 prompt + verify response + audit log entry
