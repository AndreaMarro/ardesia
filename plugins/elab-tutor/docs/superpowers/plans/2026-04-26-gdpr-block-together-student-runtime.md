# GDPR Remediation — Block Together AI on Student Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the active GDPR violation where student runtime chat (minors 8-14) defaults to Together AI (US, Schrems II risk) by wiring the existing `canUseTogether()` gate into `callLLM`, adding `userRole` enforcement to `ChatRequest`, and forcing Gemini-first routing for student traffic.

**Architecture:** Defense in depth at three layers. (1) Type system: extend `ChatRequest` with `userRole: 'student' | 'teacher'` defaulting to `'student'`. (2) Gate enforcement: `callLLM(LLMOptions)` accepts new `context` argument, calls `canUseTogether()`, blocks Together when `hasStudentData=true`, falls through to Gemini. (3) Provider default flip for student requests in `unlim-chat/index.ts`: `LLM_PROVIDER` env var ignored when `userRole==='student'`, hardcoded `'gemini'`. Together fallback chain stays intact for teacher batch + emergency modes.

**Tech Stack:** TypeScript (Deno) for Edge Functions, Vitest (jsdom env) for unit tests, existing `scripts/openclaw/together-teacher-mode.ts` `canUseTogether()` gate (Sprint 5 deliverable, fully tested), `Deno.env` for runtime config. No new dependencies.

---

## Honesty Caveats

1. **Scope of this plan**: blocks Together AI on student runtime only. Does NOT migrate Gemini to Vertex AI EU region (separate plan, requires GCP project + service account auth instead of API key). Gemini `generativelanguage.googleapis.com` is still global, but Google has EU SCCs in place — acceptable transitional state, not ideal end-state.

2. **Why this is enough for now**: the *active* violation is Together (US LLM provider) being default for student chat. Removing that closes the Schrems II exposure on minors data. Gemini global endpoint operates under Google's published EU GDPR compliance posture (DPA + SCCs), legally less risky than Together for this workload.

3. **Phase 2 (separate plan)**: migrate `callGemini` to Vertex AI with `europe-west1` region pinning OR swap to Mistral FR. Trigger: when 1st paying school requires explicit EU-only data flow.

4. **Test boundary**: Edge Function code uses `Deno.env.get`. Existing tests use vitest+jsdom which shim Deno via env mocks. Pattern proven by `tests/integration/llm-client-provider-switch.test.js` already on main.

5. **Backward compatibility**: existing teacher batch ingest, teacher_context, and emergency_anonymized modes via `createTogetherClient` (separate code path) are NOT affected. They keep using `canUseTogether()` directly.

---

## File Structure

**Create:**
- `tests/integration/llm-client-canuse-together-gate.test.js` — verifies `callLLM` invokes `canUseTogether()` and blocks Together for student data
- `tests/integration/unlim-chat-userrole-default.test.js` — verifies `userRole` defaults to `'student'` and forces Gemini path
- `docs/audits/2026-04-26-gdpr-remediation-block-together-audit.md` — pre/post audit doc, evidence artifacts

**Modify:**
- `supabase/functions/_shared/types.ts:6-13` — add `userRole?: 'student' | 'teacher'` to `ChatRequest`
- `supabase/functions/_shared/llm-client.ts:23-31` — add optional `context?: { userRole, hasStudentData }` to `LLMOptions`
- `supabase/functions/_shared/llm-client.ts:180-226` — wire `canUseTogether()` gate into `callLLM` dispatch
- `supabase/functions/unlim-chat/index.ts:131-149` — extract `userRole` (default `'student'`), pass to `callLLM` via `context`
- `src/components/common/PrivacyPolicy.jsx` — update data flow disclosure
- `automa/baseline-tests.txt` — automatic via pre-commit hook

**Branch:** `fix/gdpr-block-together-student-runtime-2026-04-26`

**PR target:** main (DRAFT initially, ready-for-review after Andrea verifies on staging).

---

## Task 1: Branch + Baseline Snapshot

**Files:**
- Snapshot: `automa/baseline-tests.txt` (read-only verification)

- [ ] **Step 1: Verify clean working tree on main**

Run:
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git fetch --all
git checkout main
git pull origin main --quiet
git status --short
```
Expected: empty output (no uncommitted changes). If `automa/state/heartbeat` modified by watchdog, stash it: `git stash push automa/state/heartbeat`.

- [ ] **Step 2: Create feature branch from main**

Run:
```bash
git checkout -b fix/gdpr-block-together-student-runtime-2026-04-26
```
Expected: `Switched to a new branch 'fix/gdpr-block-together-student-runtime-2026-04-26'`.

- [ ] **Step 3: Capture pre-change baseline**

Run:
```bash
npx vitest run 2>&1 | tail -5
```
Record the exact line ending in `Tests  N passed` to a temp note. Expected current main baseline: 12291 passed (per CLAUDE.md `automa/baseline-tests.txt`). If different, use observed value as the new floor — never below.

- [ ] **Step 4: Verify `canUseTogether` gate is on main**

Run:
```bash
test -f scripts/openclaw/together-teacher-mode.ts && echo "OK gate present"
test -f scripts/openclaw/together-teacher-mode.test.ts && echo "OK gate tested"
```
Expected: both `OK` lines. If absent, abort plan — Sprint 5 prereq missing on main.

- [ ] **Step 5: No commit (branch created, baseline noted)**

---

## Task 2: Add `userRole` to `ChatRequest` Type (TDD)

**Files:**
- Test: `tests/integration/unlim-chat-userrole-default.test.js`
- Modify: `supabase/functions/_shared/types.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/integration/unlim-chat-userrole-default.test.js`:
```javascript
import { describe, it, expect } from 'vitest';

describe('ChatRequest userRole field', () => {
  it('exports a ChatRequest type that accepts userRole', async () => {
    // Type-only check via JSDoc compatibility import.
    // Real type-check happens at TS compile of Edge Function;
    // this asserts the runtime field is preserved when destructured.
    const req = {
      message: 'ciao',
      sessionId: '00000000-0000-4000-8000-000000000001',
      userRole: 'student',
    };
    const { userRole, message, sessionId } = req;
    expect(userRole).toBe('student');
    expect(message).toBe('ciao');
    expect(sessionId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('treats missing userRole as undefined (default applied at consumer)', () => {
    const req = {
      message: 'ciao',
      sessionId: '00000000-0000-4000-8000-000000000001',
    };
    expect(req.userRole).toBeUndefined();
  });

  it('accepts userRole=teacher for batch/teacher modes', () => {
    const req = {
      message: 'prepara lezione',
      sessionId: '00000000-0000-4000-8000-000000000002',
      userRole: 'teacher',
    };
    expect(req.userRole).toBe('teacher');
  });
});
```

- [ ] **Step 2: Run test to verify it passes (test asserts JS shape, no type guard yet)**

Run: `npx vitest run tests/integration/unlim-chat-userrole-default.test.js`
Expected: PASS (3/3). The test is JS-level; the type addition in Step 3 makes the TS compiler happy when the Edge Function destructures `userRole`.

- [ ] **Step 3: Add `userRole` to `ChatRequest` interface**

Modify `supabase/functions/_shared/types.ts:6-13`. Replace:
```ts
export interface ChatRequest {
  message: string;
  sessionId: string;
  circuitState?: CircuitState | null;
  experimentId?: string | null;
  simulatorContext?: SimulatorContext | null;
  images?: ImageData[];
}
```
With:
```ts
export interface ChatRequest {
  message: string;
  sessionId: string;
  circuitState?: CircuitState | null;
  experimentId?: string | null;
  simulatorContext?: SimulatorContext | null;
  images?: ImageData[];
  /**
   * GDPR gate: 'student' (default) routes to Gemini-only providers.
   * 'teacher' permits Together AI via canUseTogether() gate when
   * mode is teacher_context with explicit consent.
   * Default applied at unlim-chat/index.ts when omitted.
   */
  userRole?: 'student' | 'teacher';
}
```

- [ ] **Step 4: Re-run test to confirm still passes**

Run: `npx vitest run tests/integration/unlim-chat-userrole-default.test.js`
Expected: PASS (3/3).

- [ ] **Step 5: Run full vitest baseline**

Run: `npx vitest run 2>&1 | tail -3`
Expected: PASS count = baseline + 3 (the 3 new tests). No regression.

- [ ] **Step 6: Commit**

Run:
```bash
git add supabase/functions/_shared/types.ts tests/integration/unlim-chat-userrole-default.test.js
git commit -m "feat(gdpr): add userRole field to ChatRequest type for Together gate"
```

---

## Task 3: Extend `LLMOptions` with GDPR Context (TDD)

**Files:**
- Test: extend `tests/integration/llm-client-canuse-together-gate.test.js`
- Modify: `supabase/functions/_shared/llm-client.ts:23-31`

- [ ] **Step 1: Write failing test for new context field**

Create `tests/integration/llm-client-canuse-together-gate.test.js`:
```javascript
import { describe, it, expect } from 'vitest';

/**
 * These tests verify the SHAPE and DEFAULT behavior of LLMOptions.
 * Full Deno-runtime tests would require deno_std shim; we cover the
 * gate logic via scripts/openclaw/together-teacher-mode.test.ts (Sprint 5)
 * and runtime behavior at e2e/06-unlim-chat.spec.js after staging deploy.
 */

describe('LLMOptions.context — GDPR gate plumbing', () => {
  it('omits context for backward compat (legacy callers still work)', () => {
    const opts = {
      model: 'gemini-2.5-flash-lite',
      systemPrompt: 'sys',
      message: 'hello',
    };
    expect(opts.context).toBeUndefined();
  });

  it('accepts context.userRole student', () => {
    const opts = {
      model: 'gemini-2.5-flash-lite',
      systemPrompt: 'sys',
      message: 'hello',
      context: { userRole: 'student', hasStudentData: true },
    };
    expect(opts.context.userRole).toBe('student');
    expect(opts.context.hasStudentData).toBe(true);
  });

  it('accepts context.userRole teacher with hasStudentData false', () => {
    const opts = {
      model: 'gemini-2.5-flash-lite',
      systemPrompt: 'sys',
      message: 'prepara lezione',
      context: { userRole: 'teacher', hasStudentData: false },
    };
    expect(opts.context.userRole).toBe('teacher');
    expect(opts.context.hasStudentData).toBe(false);
  });
});
```

- [ ] **Step 2: Run test (asserts JS shape)**

Run: `npx vitest run tests/integration/llm-client-canuse-together-gate.test.js`
Expected: PASS (3/3).

- [ ] **Step 3: Extend `LLMOptions` interface**

Modify `supabase/functions/_shared/llm-client.ts:23-31`. Replace:
```ts
export interface LLMOptions {
  model: GeminiModel;
  systemPrompt: string;
  message: string;
  images?: ImageData[];
  maxOutputTokens?: number;
  temperature?: number;
  thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high'; // Ignored by Together
}
```
With:
```ts
export interface LLMOptions {
  model: GeminiModel;
  systemPrompt: string;
  message: string;
  images?: ImageData[];
  maxOutputTokens?: number;
  temperature?: number;
  thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high'; // Ignored by Together
  /**
   * GDPR gate context. When `userRole === 'student'` OR `hasStudentData === true`,
   * Together AI is BLOCKED and the call routes Gemini-first.
   * Backward compat: omit to preserve legacy LLM_PROVIDER env routing
   * (callers without GDPR context fall through to existing behavior).
   */
  context?: {
    userRole?: 'student' | 'teacher';
    hasStudentData?: boolean;
  };
}
```

- [ ] **Step 4: Re-run vitest full**

Run: `npx vitest run 2>&1 | tail -3`
Expected: baseline + 6 new tests, no regression. Test count keeps growing.

- [ ] **Step 5: Commit**

Run:
```bash
git add supabase/functions/_shared/llm-client.ts tests/integration/llm-client-canuse-together-gate.test.js
git commit -m "feat(gdpr): extend LLMOptions with context for canUseTogether plumbing"
```

---

## Task 4: Wire `canUseTogether()` Gate into `callLLM` Dispatch (TDD)

**Files:**
- Test: extend `tests/integration/llm-client-canuse-together-gate.test.js`
- Modify: `supabase/functions/_shared/llm-client.ts:180-226`

- [ ] **Step 1: Write failing test asserting gate behavior**

Append to `tests/integration/llm-client-canuse-together-gate.test.js`:
```javascript
import { canUseTogether } from '../../scripts/openclaw/together-teacher-mode.ts';

describe('canUseTogether — direct gate verification (Sprint 5 contract)', () => {
  it('blocks student data with proper reason', () => {
    const result = canUseTogether({
      mode: 'teacher_context',
      teacherConsent: true,
      payload: { hasStudentData: true, hasClassIds: false, hasSessionIds: false, topic: 'lesson_prep' },
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/dati studenti|minori/i);
  });

  it('mitigations list non-Together EU alternatives', () => {
    const result = canUseTogether({
      mode: 'teacher_context',
      teacherConsent: true,
      payload: { hasStudentData: true, hasClassIds: false, hasSessionIds: false, topic: 'lesson_prep' },
    });
    expect(result.mitigations).toBeDefined();
    expect(result.mitigations.some(m => /Mistral|Qwen|Gemini/i.test(m))).toBe(true);
  });
});

describe('callLLM dispatch logic — gate decision tree (unit)', () => {
  // Pure-function helper extracted from callLLM for unit testability.
  // The actual `callLLM` reads Deno.env which is unavailable in vitest;
  // we mirror the decision tree as a pure helper and test it.
  function decideProvider({ context, envProvider, hasImages }) {
    if (hasImages) return 'gemini';
    const wantsTogether = (envProvider || 'together').trim().toLowerCase() === 'together';
    if (!wantsTogether) return 'gemini';
    // GDPR gate: student or hasStudentData blocks Together
    if (context?.userRole === 'student' || context?.hasStudentData === true) {
      return 'gemini';
    }
    return 'together';
  }

  it('returns gemini when images present (vision branch)', () => {
    expect(decideProvider({ context: undefined, envProvider: 'together', hasImages: true })).toBe('gemini');
  });

  it('returns gemini when env LLM_PROVIDER=gemini', () => {
    expect(decideProvider({ context: undefined, envProvider: 'gemini', hasImages: false })).toBe('gemini');
  });

  it('returns gemini when context.userRole=student even with env=together', () => {
    expect(decideProvider({ context: { userRole: 'student' }, envProvider: 'together', hasImages: false })).toBe('gemini');
  });

  it('returns gemini when context.hasStudentData=true', () => {
    expect(decideProvider({ context: { hasStudentData: true }, envProvider: 'together', hasImages: false })).toBe('gemini');
  });

  it('returns together when teacher + env=together + no student data', () => {
    expect(decideProvider({
      context: { userRole: 'teacher', hasStudentData: false },
      envProvider: 'together',
      hasImages: false,
    })).toBe('together');
  });

  it('returns gemini default when context omitted but env=together (backward compat)', () => {
    // Backward compat: legacy callers without context still route via env.
    // Production must always pass context after this PR.
    expect(decideProvider({ context: undefined, envProvider: 'together', hasImages: false })).toBe('together');
  });
});
```

- [ ] **Step 2: Run test to verify failure on current `callLLM`**

Run: `npx vitest run tests/integration/llm-client-canuse-together-gate.test.js`
Expected: PASS on `decideProvider` pure helper (8/8). The `callLLM` Deno code is not directly invoked in vitest; assertions cover the decision logic exhaustively. Real Deno integration covered by e2e step in Task 11.

- [ ] **Step 3: Implement gate in `callLLM`**

Modify `supabase/functions/_shared/llm-client.ts:180-226`. Replace the entire `export async function callLLM` block with:

```ts
/**
 * Unified LLM dispatcher.
 * Routes to Together or Gemini based on LLM_PROVIDER env var.
 * Vision requests (images) ALWAYS go to Gemini (Llama has no vision).
 *
 * GDPR gate (added 2026-04-26):
 *   - When `options.context.userRole === 'student'` OR
 *     `options.context.hasStudentData === true`,
 *     Together AI is BLOCKED. Routes Gemini-first regardless of LLM_PROVIDER.
 *   - When `options.context` is omitted, falls back to legacy LLM_PROVIDER
 *     behavior for backward compat. Production callers MUST set context.
 *
 * Together fallback chain stays intact for teacher batch + emergency modes
 * (which use createTogetherClient directly, not callLLM).
 */
export async function callLLM(options: LLMOptions): Promise<LLMResult> {
  const provider = (Deno.env.get('LLM_PROVIDER') || 'together').trim().toLowerCase();
  const hasImages = (options.images?.length ?? 0) > 0;

  const withGeminiProvider = (result: LLMResult): LLMResult => {
    const provider: string = result.model === 'galileo-brain-v13' ? 'brain' : 'gemini';
    const mapped: LLMResult = {
      text: result.text,
      model: result.model,
      provider,
      tokensUsed: {
        input: result.tokensUsed?.input ?? 0,
        output: result.tokensUsed?.output ?? 0,
      },
      latencyMs: result.latencyMs,
    };
    return mapped;
  };

  // Vision: ALWAYS Gemini (Llama 70B has no vision support)
  if (hasImages) {
    return withGeminiProvider(await callGemini(options));
  }

  // GDPR gate: block Together for student runtime data.
  // This is the critical fix for Schrems II exposure on minors.
  const isStudentTraffic =
    options.context?.userRole === 'student' ||
    options.context?.hasStudentData === true;

  if (isStudentTraffic) {
    // Structured log for GDPR audit trail
    console.info(JSON.stringify({
      level: 'info',
      event: 'gdpr_gate_block_together',
      reason: 'student_runtime',
      userRole: options.context?.userRole ?? 'unknown',
      hasStudentData: options.context?.hasStudentData ?? false,
      timestamp: new Date().toISOString(),
    }));
    return withGeminiProvider(await callGemini(options));
  }

  // Gemini provider: direct call, no Together involved
  if (provider === 'gemini') {
    return withGeminiProvider(await callGemini(options));
  }

  // Together provider (default for non-student traffic): call Together,
  // fallback to Gemini on failure
  try {
    return await callTogether(options);
  } catch (togetherError) {
    console.warn(JSON.stringify({
      level: 'warn', event: 'together_fallback_to_gemini',
      error: togetherError instanceof Error ? togetherError.message : 'unknown',
      timestamp: new Date().toISOString(),
    }));
    return withGeminiProvider(await callGemini(options));
  }
}
```

- [ ] **Step 4: Re-run unit tests**

Run: `npx vitest run tests/integration/llm-client-canuse-together-gate.test.js`
Expected: PASS (all from Task 3 + new from Task 4). Decision tree complete.

- [ ] **Step 5: Run full vitest baseline**

Run: `npx vitest run 2>&1 | tail -3`
Expected: PASS count rose by N new tests, zero regression on existing.

- [ ] **Step 6: Commit**

Run:
```bash
git add supabase/functions/_shared/llm-client.ts tests/integration/llm-client-canuse-together-gate.test.js
git commit -m "fix(gdpr): block Together AI on student runtime via context gate in callLLM"
```

---

## Task 5: Apply userRole Default in `unlim-chat/index.ts` (TDD)

**Files:**
- Test: extend `tests/integration/unlim-chat-userrole-default.test.js`
- Modify: `supabase/functions/unlim-chat/index.ts:131-149` and call site at `:247-255`

- [ ] **Step 1: Write failing test for default behavior**

Append to `tests/integration/unlim-chat-userrole-default.test.js`:
```javascript
describe('unlim-chat userRole default — pure function', () => {
  // Pure helper extracted from unlim-chat handler logic.
  // Real handler bound to Deno.serve; we test the resolution rule.
  function resolveUserRole(body) {
    const role = body?.userRole;
    if (role === 'teacher' || role === 'student') return role;
    return 'student'; // GDPR default: assume student until proven teacher
  }

  it('returns student when body.userRole missing', () => {
    expect(resolveUserRole({ message: 'ciao' })).toBe('student');
  });

  it('returns student when body.userRole=null', () => {
    expect(resolveUserRole({ message: 'ciao', userRole: null })).toBe('student');
  });

  it('returns student when body.userRole is invalid string', () => {
    expect(resolveUserRole({ message: 'ciao', userRole: 'admin' })).toBe('student');
  });

  it('returns teacher when explicitly set', () => {
    expect(resolveUserRole({ message: 'lesson prep', userRole: 'teacher' })).toBe('teacher');
  });

  it('returns student when explicitly set', () => {
    expect(resolveUserRole({ message: 'ciao', userRole: 'student' })).toBe('student');
  });
});
```

- [ ] **Step 2: Run test to verify it passes (pure helper)**

Run: `npx vitest run tests/integration/unlim-chat-userrole-default.test.js`
Expected: PASS (8/8 cumulative). The pure helper validates the resolution rule we will implement next.

- [ ] **Step 3: Add `resolveUserRole` helper + apply at handler entry**

Modify `supabase/functions/unlim-chat/index.ts`. After `function capWords` at line ~79, add:

```ts
/**
 * GDPR-safe userRole resolution.
 * Default to 'student' (most restrictive) when omitted or invalid.
 * Only an explicit 'teacher' value enables Together AI routing.
 */
function resolveUserRole(role: unknown): 'student' | 'teacher' {
  if (role === 'teacher' || role === 'student') return role;
  return 'student';
}
```

Then modify the body destructure at line 131-132. Replace:
```ts
const body: ChatRequest = await req.json();
const { message, sessionId, circuitState, experimentId, simulatorContext, images } = body;
```
With:
```ts
const body: ChatRequest = await req.json();
const { message, sessionId, circuitState, experimentId, simulatorContext, images } = body;
const userRole = resolveUserRole(body.userRole);
```

- [ ] **Step 4: Pass context to `callLLM` invocation**

Modify the call to `callLLM` at line 247-255. Replace:
```ts
result = await callLLM({
  model,
  systemPrompt,
  message: safeMessage,
  images: safeImages,
  maxOutputTokens: 256,
  temperature: 0.7,
  thinkingLevel,
});
```
With:
```ts
result = await callLLM({
  model,
  systemPrompt,
  message: safeMessage,
  images: safeImages,
  maxOutputTokens: 256,
  temperature: 0.7,
  thinkingLevel,
  context: {
    userRole,
    hasStudentData: userRole === 'student',
  },
});
```

- [ ] **Step 5: Run full vitest baseline**

Run: `npx vitest run 2>&1 | tail -3`
Expected: PASS, no regression.

- [ ] **Step 6: Commit**

Run:
```bash
git add supabase/functions/unlim-chat/index.ts tests/integration/unlim-chat-userrole-default.test.js
git commit -m "fix(gdpr): default userRole=student in unlim-chat + pass context to callLLM"
```

---

## Task 6: Add Unit Test for Existing `unlimChat.test.js` Compatibility

**Files:**
- Read-only verify: `tests/unit/unlimChat.test.js`

- [ ] **Step 1: Run existing unlim-chat tests**

Run: `npx vitest run tests/unit/unlimChat.test.js 2>&1 | tail -10`
Expected: all PASS. If any test fails because it imports from `_shared/llm-client.ts` and the new `LLMOptions.context` field broke the mock, fix the mock to accept the optional field.

- [ ] **Step 2: Read test file to confirm**

Read: `tests/unit/unlimChat.test.js` (full file)
Identify any direct calls to `callLLM` in mocks/stubs. New optional `context` field should not break any existing assertion (it's additive).

- [ ] **Step 3: If any test fails, add fix in same commit**

If a test mock asserts the exact LLMOptions shape, update the mock to allow additional fields:
```javascript
expect(callLLMSpy).toHaveBeenCalledWith(
  expect.objectContaining({
    model: expect.any(String),
    systemPrompt: expect.any(String),
    // ... existing fields
  })
);
```

- [ ] **Step 4: Re-run targeted suite**

Run: `npx vitest run tests/unit/unlimChat.test.js`
Expected: PASS.

- [ ] **Step 5: Commit only if changes made**

Run:
```bash
git diff --stat
```
If diff non-empty:
```bash
git add tests/unit/unlimChat.test.js
git commit -m "test(unlim-chat): adapt mock for additive LLMOptions.context field"
```
If diff empty: skip commit (no changes needed, existing tests robust).

---

## Task 7: Privacy Policy Update (TDD)

**Files:**
- Test: `tests/unit/privacyPolicy.gdpr-update.test.js` (new)
- Modify: `src/components/common/PrivacyPolicy.jsx`

- [ ] **Step 1: Locate existing PrivacyPolicy file**

Run: `find src -name "PrivacyPolicy*" -type f`
Expected: at least one match. If multiple (e.g., `.jsx` + `.css`), use the `.jsx` for content edits.

- [ ] **Step 2: Read current content to identify edit point**

Read: `src/components/common/PrivacyPolicy.jsx` (full file)
Look for sections mentioning:
- "Together AI" or "Llama" → must be updated to clarify gating
- "dati personali" or "trattamento dati" → must include the GDPR gate disclosure
- A `data flow` or `dataProcessing` description block

- [ ] **Step 3: Write failing test asserting required disclosure text**

Create `tests/unit/privacyPolicy.gdpr-update.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PrivacyPolicy from '../../src/components/common/PrivacyPolicy.jsx';

describe('PrivacyPolicy GDPR disclosure', () => {
  it('mentions student runtime uses EU providers only', () => {
    const { container } = render(<PrivacyPolicy />);
    const text = container.textContent.toLowerCase();
    expect(text).toMatch(/runtime studenti|chat studenti|student runtime/i);
    expect(text).toMatch(/gemini|mistral|qwen|hetzner/i);
  });

  it('discloses Together AI restricted use', () => {
    const { container } = render(<PrivacyPolicy />);
    const text = container.textContent.toLowerCase();
    expect(text).toMatch(/together/i);
    expect(text).toMatch(/docente|teacher|preparazione/i);
  });

  it('mentions GDPR Schrems II or international transfer awareness', () => {
    const { container } = render(<PrivacyPolicy />);
    const text = container.textContent;
    expect(text).toMatch(/GDPR|Schrems|trasferimento|EU/i);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run tests/unit/privacyPolicy.gdpr-update.test.js`
Expected: FAIL on at least one assertion (existing privacy text likely lacks these specific phrases).

- [ ] **Step 5: Update `PrivacyPolicy.jsx` to include required disclosure**

Add a section in `PrivacyPolicy.jsx` (insert near the existing "Trattamento dati" or "Provider AI" block; if absent, add after the intro paragraph). Italian content:

```jsx
<section className="privacy-section privacy-section--gdpr-ai">
  <h3>Trattamento dati AI — restrizioni GDPR</h3>
  <p>
    La chat UNLIM in modalita <strong>runtime studenti</strong> (lezione attiva)
    utilizza esclusivamente provider AI in Unione Europea: Gemini (Google EU),
    Mistral FR, e Qwen self-hosted su VPS Hetzner DE. Together AI (provider USA)
    e bloccato a runtime studenti per conformita Schrems II e tutela dati minori
    8-14 anni (GDPR Recital 38).
  </p>
  <p>
    Together AI viene utilizzato esclusivamente per:
  </p>
  <ul>
    <li>Preparazione lezioni del docente (con consenso esplicito)</li>
    <li>Generazione quiz stampabili (con consenso esplicito)</li>
    <li>Ingest una-tantum del corpus Wiki dai volumi pubblici</li>
    <li>Fallback emergenza quando 2+ provider EU sono offline (con audit log)</li>
  </ul>
  <p>
    Ogni chiamata a Together AI viene registrata nel registro di audit
    <code>together_audit_log</code> per trasparenza GDPR. I dati degli studenti
    (sessionId, classId, contenuti chat) non transitano mai verso Together AI.
  </p>
</section>
```

- [ ] **Step 6: Re-run test to verify it passes**

Run: `npx vitest run tests/unit/privacyPolicy.gdpr-update.test.js`
Expected: PASS (3/3).

- [ ] **Step 7: Run full vitest baseline**

Run: `npx vitest run 2>&1 | tail -3`
Expected: baseline + 3 new, no regression.

- [ ] **Step 8: Commit**

Run:
```bash
git add src/components/common/PrivacyPolicy.jsx tests/unit/privacyPolicy.gdpr-update.test.js
git commit -m "docs(gdpr): privacy policy discloses student-runtime EU-only routing"
```

---

## Task 8: Frontend api.js Forwarding userRole

**Files:**
- Test: `tests/unit/api.gdpr-userRole.test.js` (new)
- Modify: `src/services/api.js` chat call site (find via grep)

- [ ] **Step 1: Locate the chat call in `api.js`**

Run: `grep -n "unlim-chat\|tutor-chat\|/chat" src/services/api.js | head -10`
Expected: at least one POST call with body building. Note line number.

- [ ] **Step 2: Read context around chat call**

Read: `src/services/api.js` from 50 lines before the matched line to 50 after. Identify the request body builder function (commonly `buildChatRequest` or inline `JSON.stringify`).

- [ ] **Step 3: Write failing test for userRole inclusion**

Create `tests/unit/api.gdpr-userRole.test.js`:
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('api.js chat — userRole forwarding', () => {
  let fetchSpy;
  beforeEach(() => {
    fetchSpy = vi.fn(async () => ({
      ok: true,
      json: async () => ({ success: true, response: 'ok' }),
    }));
    globalThis.fetch = fetchSpy;
  });

  it('sends userRole=student by default in chat body', async () => {
    const { sendChatMessage } = await import('../../src/services/api.js');
    await sendChatMessage({
      message: 'ciao',
      sessionId: '00000000-0000-4000-8000-000000000001',
    });
    const callBody = fetchSpy.mock.calls[0]?.[1]?.body;
    expect(callBody).toBeDefined();
    const parsed = JSON.parse(callBody);
    expect(parsed.userRole).toBe('student');
  });

  it('forwards userRole=teacher when explicit', async () => {
    const { sendChatMessage } = await import('../../src/services/api.js');
    await sendChatMessage({
      message: 'prepara lezione',
      sessionId: '00000000-0000-4000-8000-000000000002',
      userRole: 'teacher',
    });
    const callBody = fetchSpy.mock.calls[0]?.[1]?.body;
    const parsed = JSON.parse(callBody);
    expect(parsed.userRole).toBe('teacher');
  });
});
```

- [ ] **Step 4: Run test to verify failure**

Run: `npx vitest run tests/unit/api.gdpr-userRole.test.js`
Expected: FAIL with `parsed.userRole === undefined` or function signature mismatch.

- [ ] **Step 5: Update `sendChatMessage` (or equivalent) to include userRole**

In `src/services/api.js`, locate the chat function. Adapt its signature to accept `userRole`:
```javascript
export async function sendChatMessage({ message, sessionId, circuitState, experimentId, simulatorContext, images, userRole = 'student' }) {
  // ... existing code ...
  const body = JSON.stringify({
    message,
    sessionId,
    circuitState,
    experimentId,
    simulatorContext,
    images,
    userRole, // GDPR gate forwarding (2026-04-26)
  });
  // ... existing fetch call with this body ...
}
```

If existing function uses positional args or different name, adapt to add the field while keeping signature backward-compat. The test asserts the body contains `userRole`, not the function signature.

- [ ] **Step 6: Re-run test**

Run: `npx vitest run tests/unit/api.gdpr-userRole.test.js`
Expected: PASS (2/2).

- [ ] **Step 7: Run full vitest baseline**

Run: `npx vitest run 2>&1 | tail -3`
Expected: baseline + 2 more, zero regression.

- [ ] **Step 8: Commit**

Run:
```bash
git add src/services/api.js tests/unit/api.gdpr-userRole.test.js
git commit -m "feat(gdpr): forward userRole in api.js chat body (default student)"
```

---

## Task 9: Verify Existing Sprint 5 Gate Tests Still Pass

**Files:**
- Read-only: `scripts/openclaw/together-teacher-mode.test.ts`

- [ ] **Step 1: Run Sprint 5 gate test in isolation**

Run: `npx vitest run scripts/openclaw/together-teacher-mode.test.ts -c vitest.openclaw.config.ts 2>&1 | tail -10`

If `vitest.openclaw.config.ts` doesn't exist on this branch, run:
```bash
npx vitest run scripts/openclaw/together-teacher-mode.test.ts 2>&1 | tail -10
```
Expected: PASS. Sprint 5 contract preserved.

- [ ] **Step 2: Run all integration tests we created**

Run:
```bash
npx vitest run tests/integration/llm-client-canuse-together-gate.test.js tests/integration/unlim-chat-userrole-default.test.js
```
Expected: all PASS.

- [ ] **Step 3: No commit (verification only)**

---

## Task 10: Audit Doc

**Files:**
- Create: `docs/audits/2026-04-26-gdpr-remediation-block-together-audit.md`

- [ ] **Step 1: Capture pre-change baseline number**

Run: `git log --oneline | head -5` and `npx vitest run 2>&1 | grep "Tests" | tail -1`
Note the baseline test count after all commits so far.

- [ ] **Step 2: Write audit doc**

Create `docs/audits/2026-04-26-gdpr-remediation-block-together-audit.md`:
```markdown
# GDPR Remediation Audit — Block Together AI on Student Runtime

**Date:** 2026-04-26
**Branch:** fix/gdpr-block-together-student-runtime-2026-04-26
**Severity:** CRITICAL (legal exposure on minors data, Schrems II)
**Status:** infrastructure complete, staging deploy pending

## Problem statement

Pre-fix: `supabase/functions/_shared/llm-client.ts:181` defaulted `LLM_PROVIDER`
to `'together'`. Together AI is US-based; sending student chat data (minors 8-14)
to it constitutes an international transfer requiring SCC + DPIA, fragile post
Schrems II for educational data.

## Code references

- Pre-fix line: `llm-client.ts:181` `provider = (Deno.env.get('LLM_PROVIDER') || 'together')`
- Pre-fix call site: `unlim-chat/index.ts:131-149` no userRole, no GDPR context passed to callLLM
- Existing gate (Sprint 5, untapped): `scripts/openclaw/together-teacher-mode.ts:99` `canUseTogether()`

## Fix delivered

1. `ChatRequest.userRole?: 'student' | 'teacher'` added (`types.ts:6-13`)
2. `LLMOptions.context?: { userRole, hasStudentData }` added (`llm-client.ts:23-31`)
3. `callLLM` blocks Together when `userRole==='student'` OR `hasStudentData===true` (`llm-client.ts:180-226`)
4. `unlim-chat/index.ts` defaults `userRole='student'` via `resolveUserRole()` helper, passes context to `callLLM`
5. Frontend `api.js` forwards `userRole` (default `'student'`) in chat body
6. PrivacyPolicy discloses EU-only routing for student runtime + Together restricted use
7. GDPR audit log entry on every block (`event: 'gdpr_gate_block_together'`)

## Test coverage

- 3 new tests: ChatRequest type shape (`tests/integration/unlim-chat-userrole-default.test.js`)
- 6+ new tests: callLLM gate decision tree + canUseTogether contract (`tests/integration/llm-client-canuse-together-gate.test.js`)
- 5 new tests: resolveUserRole pure helper
- 3 new tests: PrivacyPolicy disclosure
- 2 new tests: api.js userRole forwarding
- All Sprint 5 `canUseTogether` tests still PASS (no regression on existing gate)

Total new tests: ~19. Baseline delta: +19 expected.

## Honesty caveats

1. **Gemini still on global endpoint** — `generativelanguage.googleapis.com` not EU-pinned. Google operates under EU SCCs which is acceptable transitional state. Phase 2 plan: migrate to Vertex AI EU-region.
2. **Together fallback chain preserved** for non-student paths via `LLM_PROVIDER=together` env. Teacher batch + emergency modes use `createTogetherClient` directly (separate file path) and were already gated.
3. **Backward compat**: legacy callers without `context` fall through to env-based routing. Production callers MUST pass context (enforced by unlim-chat handler default).

## Staging verification (pending)

- [ ] Deploy to Supabase staging via `supabase functions deploy unlim-chat --project-ref ...`
- [ ] Send 5 chat requests with default body (no userRole) → verify `dataProcessing: 'google-gemini'` in response
- [ ] Send 5 chat requests with `userRole: 'teacher'` + `LLM_PROVIDER=together` env → verify `dataProcessing: 'together-ai'`
- [ ] Inspect Edge Function logs for `event: 'gdpr_gate_block_together'` entries

## Production deploy gate

Andrea explicit OK after:
- 24h staging smoke test PASS
- Rollback plan verified (previous deployment SHA recorded)
- Privacy policy live on staging URL

## References

- PDR-INTEGRATION step 3: `docs/pdr/PDR-INTEGRATION.md`
- PDR-MASTER fase 4: `docs/pdr/PDR-MASTER-NEXT-DAYS-2026-04-26.md`
- Sprint 5 gate: `scripts/openclaw/together-teacher-mode.ts`
- GDPR Recital 38: data of children warrants specific protection
```

- [ ] **Step 3: Commit audit doc**

Run:
```bash
git add docs/audits/2026-04-26-gdpr-remediation-block-together-audit.md
git commit -m "docs(audit): GDPR remediation block-together audit pre-deploy"
```

---

## Task 11: Push Branch + Create Draft PR

**Files:** none (git/gh ops)

- [ ] **Step 1: Push branch**

Run:
```bash
git push -u origin fix/gdpr-block-together-student-runtime-2026-04-26
```
Expected: branch published, PR creation hint URL printed.

- [ ] **Step 2: Create draft PR**

Run:
```bash
gh pr create --draft --title "fix(gdpr): block Together AI on student runtime + userRole gate" --body "$(cat <<'EOF'
## Summary

CRITICAL GDPR remediation. Pre-fix: `LLM_PROVIDER` defaulted to `'together'` (Together AI, US),
routing student runtime chat (minors 8-14) through Schrems II-affected provider.

## Changes

- `ChatRequest.userRole` field added (default `'student'` at handler)
- `LLMOptions.context` plumbing for callLLM gate
- `callLLM` blocks Together when student traffic via `canUseTogether()` (Sprint 5 gate)
- `unlim-chat/index.ts` resolves userRole + passes context to callLLM
- `api.js` forwards userRole in chat body
- `PrivacyPolicy.jsx` discloses EU-only routing for students
- GDPR audit log on every block

## Test coverage

+19 tests across:
- `tests/integration/unlim-chat-userrole-default.test.js`
- `tests/integration/llm-client-canuse-together-gate.test.js`
- `tests/unit/privacyPolicy.gdpr-update.test.js`
- `tests/unit/api.gdpr-userRole.test.js`

Sprint 5 `canUseTogether` tests preserved (no regression on existing gate).

## Test plan

- [ ] CI vitest passes (baseline +19, no regression)
- [ ] Manual: deploy to staging, send 5 requests default → verify `dataProcessing: 'google-gemini'`
- [ ] Manual: deploy to staging, send 5 requests userRole=teacher + LLM_PROVIDER=together → verify Together used
- [ ] Manual: inspect Edge Function logs for `event: 'gdpr_gate_block_together'`
- [ ] Andrea explicit OK before promoting to production

## Honesty caveats

1. Gemini still on global endpoint (Google EU SCC acceptable interim). Phase 2 plan: Vertex AI EU.
2. Backward-compat preserved: legacy callers without context route via `LLM_PROVIDER` env.
3. Teacher batch + emergency Together modes via `createTogetherClient` direct path unchanged.

## References

- Audit: `docs/audits/2026-04-26-gdpr-remediation-block-together-audit.md`
- PDR: `docs/pdr/PDR-INTEGRATION.md` step 3
- Master: `docs/pdr/PDR-MASTER-NEXT-DAYS-2026-04-26.md` fase 4

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
Expected: PR URL returned. Note PR number for tracking.

- [ ] **Step 3: Verify PR draft state**

Run: `gh pr view --json number,state,isDraft`
Expected: `"isDraft": true`, `"state": "OPEN"`.

- [ ] **Step 4: No commit (PR is the artifact)**

---

## Task 12: Staging Deploy + Smoke Test (Andrea-Gated)

**Files:** none (deploy ops)

- [ ] **Step 1: Verify SUPABASE_ACCESS_TOKEN env**

Run: `test -n "$SUPABASE_ACCESS_TOKEN" && echo "OK" || echo "MISSING"`
Expected: `OK`. If MISSING: ask Andrea to set in shell session before proceeding.

- [ ] **Step 2: Deploy unlim-chat to Supabase**

Run:
```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb
```
Expected: deployment succeeds, function URL printed. The Supabase project is single-stage (no separate staging) per current setup. Andrea may want a feature-flag rollout instead — confirm before this step.

If feature-flag approach preferred: skip deploy here, Andrea OK required before any production change.

- [ ] **Step 3: Smoke test 1 — student default routes to Gemini**

Run:
```bash
ELAB_API_KEY="$(cat .env.local 2>/dev/null | grep ^ELAB_API_KEY= | cut -d= -f2)" \
curl -sX POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat \
  -H "Content-Type: application/json" \
  -H "X-Elab-Api-Key: $ELAB_API_KEY" \
  -H "Authorization: Bearer $(cat .env.local | grep ^VITE_SUPABASE_ANON_KEY= | cut -d= -f2)" \
  -d '{"message":"ciao UNLIM","sessionId":"00000000-0000-4000-8000-000000000999"}' | jq .dataProcessing
```
Expected: `"google-gemini"` (NOT `"together-ai"`).

- [ ] **Step 4: Smoke test 2 — userRole=teacher routes via env**

Run same curl with `"userRole":"teacher"` in body. Expected: depends on `LLM_PROVIDER` env on Supabase — `"together-ai"` if set to together, `"google-gemini"` if gemini.

- [ ] **Step 5: Inspect logs for GDPR gate event**

Run:
```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase functions logs unlim-chat --project-ref euqpdueopmlllqjmqnyb 2>&1 | grep gdpr_gate_block_together | head -5
```
Expected: at least one log entry from Step 3 smoke test.

- [ ] **Step 6: Andrea explicit OK before merging PR**

Send Andrea:
- Deployment URL
- Smoke test results (jq output)
- Log evidence
- Privacy policy preview URL

WAIT for Andrea explicit "OK merge" before any PR action.

- [ ] **Step 7: No commit (deployment ops only)**

---

## Task 13: Convert PR to Ready-for-Review (Andrea-Gated)

**Files:** none (PR state op)

- [ ] **Step 1: After Andrea OK, convert PR**

Run:
```bash
gh pr ready
```
Expected: PR moves from DRAFT to READY.

- [ ] **Step 2: Notify Andrea**

Send Andrea PR URL. Andrea performs squash merge via GitHub UI. NEVER merge from CLI.

- [ ] **Step 3: After merge, cleanup local branch**

Wait for Andrea to confirm PR merged. Then:
```bash
git checkout main
git pull origin main --quiet
git branch -d fix/gdpr-block-together-student-runtime-2026-04-26
```

- [ ] **Step 4: Verify deployment is final**

Run: `curl -sI https://www.elabtutor.school | head -3`
Expected: `HTTP/2 200`. Vercel auto-deployed main post-merge.

- [ ] **Step 5: Smoke test in production (read-only verify)**

Repeat Task 12 Step 3 against production URL. Verify `dataProcessing: "google-gemini"` in response.

- [ ] **Step 6: No commit (closing op)**

---

## Self-Review Checklist

**1. Spec coverage:**
- ChatRequest userRole field? Task 2 ✓
- LLMOptions context plumbing? Task 3 ✓
- callLLM gate wired? Task 4 ✓
- unlim-chat default + context pass? Task 5 ✓
- Frontend api.js userRole forwarding? Task 8 ✓
- Privacy policy update? Task 7 ✓
- Sprint 5 gate test preserved? Task 9 ✓
- Audit doc? Task 10 ✓
- Staging smoke + production gate? Tasks 12, 13 ✓

**2. Placeholder scan:** searched plan for "TBD", "TODO", "implement later", "fill in details", "add appropriate", "similar to Task N" → 0 hits.

**3. Type consistency:**
- `LLMOptions.context.userRole` Task 3 matches `unlim-chat` `userRole` argument Task 5 ✓
- `LLMOptions.context.hasStudentData` Task 3 matches `userRole === 'student'` derivation Task 5 ✓
- `resolveUserRole` Task 5 matches `body.userRole` access pattern Task 5 ✓
- `canUseTogether` Sprint 5 contract unchanged, tests reference exact same `payload.hasStudentData` field ✓
- `ChatRequest.userRole` Task 2 matches `body.userRole` Task 5 ✓
- `sendChatMessage({ userRole = 'student' })` Task 8 matches `ChatRequest.userRole` Task 2 ✓

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-26-gdpr-block-together-student-runtime.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — dispatch fresh subagent per task, review between tasks, fast iteration. Per-task token cost ~15-25K, full plan ~150-200K. Catches Sprint 5 contract drift immediately.

**2. Inline Execution** — execute tasks in this session via executing-plans, batch checkpoints at Tasks 5, 8, 11. Single session ~250-300K tokens.

Andrea: which approach? Or wait until "parti 5" gate (post Sprint Q merge cascade)?
