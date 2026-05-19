# Security Audit — iter 58-60 entrance (b5d21c5b..6a7c1027)

**Scope**: 5 commits, ~3007 LOC additions (90% docs, ~10% code). Audit date 2026-05-15.
**Auditor**: security-auditor agent. **Cap**: 150 LOC. **G45 anti-inflation**: enforced.

## 1. Attack surface analysis

Scope shipped this session is overwhelmingly **non-runtime / non-network-exposed**:

- `src/data/capitoli/v3-cap6.json:503,679` — 2 `num` field renumbering (8→3, 9→5). Pure narrative-order data. No code path. (Note: edits in commit `b5d21c5b` itself, technically range-boundary; included for completeness.)
- `src/data/capitoli/v3-cap7.json:688` — 1 `intro_text` string change. Pure display copy.
- `src/components/simulator/panels/BoardSelector.jsx:1-148` — 148 LOC NEW component. **NOT imported anywhere** (grep verified: only self-references at lines 4, 28, 148). Zero runtime exposure.
- `scripts/dev/codex-prompts/*.txt` (4 templates + README) — local-only dev tooling, parametric prompt text. Not bundled, not deployed. No execution surface.
- `docs/api/n8n-compile-openapi.yaml` — 311 LOC informational OpenAPI 3.1 contract documenting **existing** compile endpoint. No new endpoint, no code change to `compile-proxy` / `compile` / `healthz`.

**Net runtime attack surface delta**: effectively **zero**. The session ships documentation + dormant scaffold.

## 2. OWASP Top 10 (2021) check applicable to scope

| ID | Category | Applicable | Finding |
|----|----------|-----------|---------|
| A01 | Broken Access Control | N | No new endpoint, no auth boundary touched |
| A02 | Cryptographic Failures | N | No crypto code |
| A03 | Injection | Y (low) | `BoardSelector.jsx:36` reads `localStorage.getItem('elab-compile-board')` and feeds into allowlist check. **Mitigated**: line 36 verifies stored value via `availableBoards.some((b) => b.fqbn === stored)` (allowlist filter). No injection sink. |
| A04 | Insecure Design | N | Component disabled-by-default (`disabled = true` line 28) is correct fail-safe design |
| A05 | Security Misconfiguration | N | No config change |
| A06 | Vulnerable Components | N | No new npm deps (verified: no package.json change in 4-commit range) |
| A07 | Auth/Session Failures | N | No auth code |
| A08 | Software/Data Integrity | N | No supply-chain new vector |
| A09 | Logging/Monitoring | N | No logging change |
| A10 | SSRF | N | No outbound request code |

## 3. Secrets / credentials handling

`grep -n "ELAB_API_KEY\|API_KEY\|secret\|token\|password"` over all scoped files (JSON + JSX + txt + yaml): **ZERO hits in code**.

`docs/api/n8n-compile-openapi.yaml:294,299` references `VITE_SUPABASE_ANON_KEY` and `ELAB_API_KEY` only as **env var names** inside `securitySchemes` description fields — these are documentation names, not secret values. iter 32 key rotation hygiene preserved.

`BoardSelector.jsx:35-44` uses `localStorage` only for board FQBN selection (non-sensitive UI state). No secret storage. Try/catch wraps storage access (line 42-44, 53-55) — defensive, no info leakage.

Codex prompt templates parametrize `$COMMIT_HASH`, `$BASELINE_COUNT`, `$LESSON_PATH_ID`, `$BLOCK_TYPE`, `$BOARD_FQBN`, `$SCOPE_FILES` — no credentials.

**Verdict**: no secret leakage. ELAB_API_KEY rotation (iter 32) integrity preserved.

## 4. CORS / API auth — n8n compile endpoint pattern

OpenAPI yaml documents existing pattern; **no code change ships** to the auth path:

- `/compile-proxy` (Supabase Edge Function bridge): documented as requiring **both** `supabaseAnon` apikey header + `elabApiKey` (`X-Elab-Api-Key`) — per yaml `security` block lines 309-311.
- `/compile` direct n8n endpoint: documented as CORS-blocked from production browsers — correct posture.
- Allowlist enforcement: yaml lines 30-32 confirm `ALLOWED_COMPILE_BOARDS` defined client-side at `src/services/api.js:61` AND server-side. Documentation accurately reflects defense-in-depth.

**iter 59 expansion concern (informational, deferred)**: yaml `BoardFqbn.enum` (lines 230-235) lists 4 boards including 2 NEW Renesas FQBNs (`arduino:renesas_uno:unor4wifi`, `arduino:renesas_uno:minima`). This is **doc-only** — actual `ALLOWED_COMPILE_BOARDS` Set at `src/services/api.js:61` is **NOT modified** in this commit range (verified). When iter 59 Phase 2 expands the allowlist, server-side validation MUST be confirmed to mirror client (per yaml §3 "Allowlist enforcement").

## 5. CVSS scoring findings

**No exploitable findings**. Two informational observations:

**INFO-1** — `BoardSelector.jsx:48-57` `handleSelect()` accepts arbitrary `fqbn` string and persists to localStorage without explicit allowlist check at write time (relies on caller passing only `availableBoards.map(b => b.fqbn)`). Currently safe because component is disabled (line 28) and unreachable. **Recommendation iter 60 activation**: add `if (!availableBoards.some(b => b.fqbn === fqbn)) return;` guard at top of `handleSelect` before activating. CVSS 0.0 (not exploitable while disabled). Pre-emptive hardening before Andrea ratifies Q1-Q3.

**INFO-2** — `BoardSelector.jsx:32-46` mount-time `onChange(stored)` side-effect (line 39) fires even if `disabled=true`. Defensive: ensure parent's `onChange` is null/no-op when disabled. CVSS 0.0 (not exploitable; UX correctness issue, not security).

No CWE-worthy vulnerabilities.

## 6. Score 0-10 ONESTO (G45 cap)

**8.5/10** — strong baseline preserved, no regression, scope inherently low-risk.

Rationale:
- +1.0 zero new attack surface (component dormant, doc + templates)
- +1.0 secrets hygiene preserved (no API key in code, env var names only in docs)
- +1.0 CORS/auth pattern unchanged (yaml is contract documentation)
- +1.0 allowlist defense-in-depth documented correctly
- +1.0 disabled-by-default fail-safe scaffold (BoardSelector line 28)
- +1.0 OWASP Top 10 clean for applicable categories
- +1.0 try/catch around localStorage (no info leak on private-mode/SSR)
- +1.0 no new npm dependency (supply-chain stable)
- +0.5 ARIA semantics + keyboard nav present (defensive coding habit, not security but quality signal)
- −1.0 INFO-1 + INFO-2 pre-activation hardening recommended (not blockers, scaffolded scope)
- G45 cap: not exceeding 8.5 because 2 informational items remain for iter 60 activation gate; honest cap respects "no auto-assign >7 without independent verify" — Codex Pattern C-V cross-check on BoardSelector activation recommended pre-merge to main.

## Verdict (3 lines)

1. **APPROVE for push to feature branch** — scope is doc-heavy + dormant scaffold; zero exploitable findings, zero secret leakage, zero auth/CORS regression.
2. **Pre-activation gate iter 60** — BoardSelector requires INFO-1 allowlist write-time guard at `handleSelect` before `disabled=false` + iter 59 R2 server-side `ALLOWED_COMPILE_BOARDS` must mirror client when 2 Renesas FQBNs activate.
3. **No CVE-class issues**; ELAB_API_KEY iter 32 rotation hygiene intact; OpenAPI yaml accurately documents existing defense-in-depth (Supabase proxy + dual headers + client/server allowlist).

**Output**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/.full-review/02-security.md`
