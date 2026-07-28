# ARDESIA Efficiency Substrate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing 30-minute ARDESIA control loop complete real
read-only Codex audits, make zero model calls when exogenous material is
unchanged, keep every model-bound context packet within a measured character
ceiling, and emit route-level cost/latency evidence.

**Architecture:** Keep one deterministic controller and the existing Headroom
gateway. Claude remains inside the outer Headroom-only macOS network sandbox;
Codex uses its own read-only tool sandbox without a second `sandbox-exec`
wrapper, while controller-owned provider configuration and unique Headroom
route attestation remain mandatory. The scientific cycle computes the
exogenous digest before inference and returns `SKIP_NO_AI` on equality.

**Tech Stack:** Python 3.9 standard library, `unittest`, macOS `launchd` and
`sandbox-exec`, Codex CLI/App Server, Headroom 0.32.1, Obsidian Headless,
WikiLLM SQLite FTS5, GitHub CLI.

## Global Constraints

- No merge or deploy.
- Never push directly to `main` or `master`.
- No force push, hard reset, clean, `--no-verify`, destructive deletion or
  secret exposure.
- No new dependency.
- Modify at most four implementation files in this subproject; the committed
  plan and specification are not runtime files.
- Claude Opus/max remains the only product writer.
- Codex remains `gpt-5.6-sol` with `xhigh` effort and read-only authority.
- Every managed Claude and Codex inference must fail closed unless a unique
  Headroom route receipt is present.
- Headroom remains pinned to 0.32.1, loopback-only, stateless and lossless;
  compression and all other transforms remain disabled.
- AgentMemory remains `RETIRED_NO_READ_NO_WRITE`.
- Hermes remains disabled during this subproject.
- Obsidian/Markdown/Git remains canonical; WikiLLM remains a derived index.
- Do not post the activation claim to GitHub issue #215 until a real scheduled
  audit has completed semantically, its logs and receipts have been inspected,
  and the route is attested.

## File Structure

- Modify `ops/dev-os/control-plane/ardesia_control_plane.py`: routing boundary,
  scientific skip state, bounded context compiler, route metrics and status
  semantics.
- Modify `ops/dev-os/control-plane/policy.source.json`: bump control-plane
  version to 1.8.1 and freeze the separate Claude/Codex boundaries plus context
  ceilings.
- Modify `ops/dev-os/control-plane/test_ardesia_control_plane.py`: deterministic
  unit and integration tests for every new invariant.
- Modify `docs/ops/ARDESIA-MCP-CONTROL-PLANE.md`: document observed semantics,
  metrics and the distinction between a skip, a successful audit and useful
  product progress.

---

### Task 1: Remove only the incompatible outer Codex sandbox

**Files:**

- Modify: `ops/dev-os/control-plane/policy.source.json:1-3,405-432`
- Modify: `ops/dev-os/control-plane/ardesia_control_plane.py:41,615-703,1913-2029`
- Test: `ops/dev-os/control-plane/test_ardesia_control_plane.py:168-223,334-530`

**Interfaces:**

- Consumes: `prepare_ai_invocation(policy, identity, arguments)`.
- Produces:
  `ai_network_boundary(policy, identity) -> str`,
  `codex_native_read_only_contract(arguments) -> str`, and a binding containing
  `network_boundary`, `outer_sandbox`, `sandbox_profile_sha256` and
  `native_sandbox`.
- Preserves: `attest_headroom_route` and its unique
  client/provider/stack correlation.

- [ ] **Step 1: Write the failing routing tests**

Replace the single-boundary assertions and extend the Codex routing test with
the exact behavioral split:

```python
self.assertEqual(
    self.policy["headroom"]["client_network_boundaries"],
    {
        "claude": "SANDBOX_EXEC_HEADROOM_ONLY",
        "codex": "CODEX_NATIVE_READ_ONLY_ATTESTED_HEADROOM",
    },
)

claude_arguments, _, claude_binding = cp.prepare_ai_invocation(
    self.policy,
    "claude",
    [self.policy["tools"]["claude"], "-p", "probe"],
)
self.assertEqual(claude_arguments[0], self.policy["tools"]["sandbox_exec"])
self.assertTrue(claude_binding["outer_sandbox"])
self.assertEqual(
    claude_binding["network_boundary"],
    "SANDBOX_EXEC_HEADROOM_ONLY",
)

codex_arguments, _, codex_binding = cp.prepare_ai_invocation(
    self.policy,
    "codex",
    [
        self.policy["tools"]["codex"],
        "exec",
        "--sandbox",
        "read-only",
        "probe",
    ],
)
self.assertEqual(codex_arguments[0], self.policy["tools"]["codex"])
self.assertNotIn(self.policy["tools"]["sandbox_exec"], codex_arguments)
self.assertFalse(codex_binding["outer_sandbox"])
self.assertEqual(codex_binding["native_sandbox"], "read-only")
self.assertIsNone(codex_binding["sandbox_profile_sha256"])
self.assertIn('model_provider="headroom"', codex_arguments)

with self.assertRaisesRegex(ValueError, "native read-only sandbox"):
    cp.prepare_ai_invocation(
        self.policy,
        "codex",
        [self.policy["tools"]["codex"], "exec", "probe"],
    )

with self.assertRaisesRegex(ValueError, "stdio-only"):
    cp.prepare_ai_invocation(
        self.policy,
        "codex",
        [
            self.policy["tools"]["codex"],
            "app-server",
            "--listen",
            "tcp://127.0.0.1:9999",
        ],
    )
```

Update every existing Codex `exec` fixture to include
`["--sandbox", "read-only"]`. Do not weaken the existing tests that reject
caller-owned provider, profile, OSS, remote or local-provider overrides.

- [ ] **Step 2: Run the focused tests and verify the intended failures**

Run:

```bash
python3 -m unittest -v \
  -k test_headroom_policy_and_direct_ai_invocations_are_fail_closed \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v \
  -k test_codex_routing_is_controller_owned_and_conflicts_are_rejected \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
```

Expected: FAIL because the policy still contains one boundary, Codex is still
wrapped by `sandbox-exec`, and a Codex invocation without a native read-only
contract is still accepted.

- [ ] **Step 3: Freeze the version and separate the policy boundaries**

Set both `VERSION` and `service_version` to `1.8.1`. Replace
`client_network_boundary` in `policy.source.json` with:

```json
"client_network_boundaries": {
  "claude": "SANDBOX_EXEC_HEADROOM_ONLY",
  "codex": "CODEX_NATIVE_READ_ONLY_ATTESTED_HEADROOM"
}
```

Update the strict Headroom policy schema and exact equality check to require
that object verbatim.

- [ ] **Step 4: Implement the minimal identity-specific routing**

Add these helpers immediately before `prepare_ai_invocation`:

```python
def ai_network_boundary(policy: Dict[str, Any], identity: str) -> str:
    boundaries = policy["headroom"]["client_network_boundaries"]
    if identity not in {"claude", "codex"}:
        raise ValueError("unsupported AI identity")
    boundary = boundaries.get(identity)
    expected = {
        "claude": "SANDBOX_EXEC_HEADROOM_ONLY",
        "codex": "CODEX_NATIVE_READ_ONLY_ATTESTED_HEADROOM",
    }[identity]
    if boundary != expected:
        raise ValueError(f"unsupported {identity} AI network boundary")
    return boundary


def codex_native_read_only_contract(arguments: Sequence[str]) -> str:
    if len(arguments) < 2:
        raise ValueError("unsupported Codex inference command")
    command = arguments[1]
    if command == "app-server":
        if list(arguments[2:]) != ["--listen", "stdio://"]:
            raise ValueError("Codex App Server must remain stdio-only")
        return "app-server-read-only-protocol"
    if command != "exec":
        raise ValueError("unsupported Codex inference command")
    values = list(arguments[2:])
    for index, value in enumerate(values):
        if value == "--sandbox" and index + 1 < len(values):
            if values[index + 1] == "read-only":
                return "read-only"
            break
        if value.startswith("--sandbox="):
            if value.split("=", 1)[1] == "read-only":
                return "read-only"
            break
    raise ValueError("Codex inference requires its native read-only sandbox")
```

In `prepare_ai_invocation`, keep the current Headroom health, statistics,
provider injection and route ID code. Apply the outer profile only to Claude:

```python
boundary = ai_network_boundary(policy, identity)
native_sandbox: Optional[str] = None
sandbox_profile_sha256: Optional[str] = None
if identity == "codex":
    native_sandbox = codex_native_read_only_contract(bound_arguments)
    reject_caller_owned_codex_routing(bound_arguments[2:])
    controller_config = [
        *codex_headroom_config(policy),
        "--config",
        (
            "model_providers.headroom.http_headers="
            f'{{"x-headroom-stack"="{route_id}"}}'
        ),
    ]
    bound_arguments[2:2] = controller_config
else:
    sandbox_profile = ai_network_sandbox_profile(policy)
    sandbox_profile_sha256 = sha256_text(sandbox_profile)
    bound_arguments = [
        policy["tools"]["sandbox_exec"],
        "-p",
        sandbox_profile,
        *bound_arguments,
    ]
```

Set these binding fields:

```python
"network_boundary": boundary,
"outer_sandbox": identity == "claude",
"sandbox_profile_sha256": sandbox_profile_sha256,
"native_sandbox": native_sandbox,
```

The App Server remains safe because `codex_live_probe` already fixes
`approvalPolicy` to `never`, fixes `sandbox` to `read-only` at thread start and
resume, and fixes `sandboxPolicy.type` to `readOnly` at turn start.

- [ ] **Step 5: Run the focused and complete control-plane tests**

Run:

```bash
python3 -m unittest -v \
  -k test_headroom_policy_and_direct_ai_invocations_are_fail_closed \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v \
  -k test_every_ai_command_requires_observed_headroom_request_delta \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v \
  -k test_codex_routing_is_controller_owned_and_conflicts_are_rejected \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v ops/dev-os/control-plane/test_ardesia_control_plane.py
```

Expected: the focused tests PASS and the full current suite PASSes with no
reduction in test count.

- [ ] **Step 6: Commit the sandbox correction**

```bash
git diff --check
git add -- \
  ops/dev-os/control-plane/ardesia_control_plane.py \
  ops/dev-os/control-plane/policy.source.json \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
git diff --cached --check
git commit -m "fix(control-plane): use native Codex sandbox"
```

---

### Task 2: Make unchanged scheduled cycles perform zero inference

**Files:**

- Modify: `ops/dev-os/control-plane/ardesia_control_plane.py:3538-3925,7283-7334`
- Test: `ops/dev-os/control-plane/test_ardesia_control_plane.py:983-1046,1490-1562`

**Interfaces:**

- Consumes:
  `scientific_material_digest`,
  `latest-review.json`, and the deterministic observations collected before
  inference.
- Produces:
  `complete_scientific_skip -> Dict[str, Any]`.
- New terminal state:
  `state=SKIP_NO_AI`,
  `audit_execution_state=SKIPPED_NO_AI`,
  `ai_calls=0`.
- Preserves the most recent successful scheduled audit as a separately named
  evidence reference; a skip never impersonates a fresh audit.

- [ ] **Step 1: Write a full-cycle no-inference test**

Add:

```python
def test_unchanged_scientific_material_skips_all_ai_and_obsidian(self) -> None:
    material_digest = "a" * 64
    cp.write_json(
        self.runtime / "state" / "latest-review.json",
        {
            "review_id": "prior-scheduled-audit",
            "trigger": "scheduled-30m",
            "state": "READY_FOR_PRODUCTIVE_LOOP",
            "audit_execution_state": "PASS",
            "material_digest": material_digest,
            "completed_at": "2026-07-28T18:32:10Z",
            "manifest_digest": "b" * 64,
        },
    )
    cp.write_json(
        self.runtime / "state" / "obsidian.json",
        {"state": "ACTIVE_CONTINUOUS"},
    )
    deterministic_checks = {
        "state": "READY_FOR_PRODUCTIVE_LOOP",
        "reason": "stable",
        "checks": [],
    }
    with (
        mock.patch.object(
            cp,
            "github_monitor_snapshot",
            return_value={"state": "CLEAR", "inventory_digest": "c" * 64},
        ),
        mock.patch.object(cp, "doctor", return_value=deterministic_checks),
        mock.patch.object(
            cp,
            "wikillm_ingest",
            return_value={
                "state": "INDEXED_CURRENT",
                "source_mode": "OBSIDIAN_HEADLESS_LIVE",
                "notes": 1,
                "material_source_sha": "d" * 64,
            },
        ),
        mock.patch.object(
            cp,
            "headroom_status",
            return_value={
                "state": "ACTIVE_REQUIRED_GATEWAY",
                "health_digest": "e" * 64,
                "launch_contract_digest": "f" * 64,
            },
        ),
        mock.patch.object(
            cp,
            "compile_context",
            return_value={
                "schema_version": 1,
                "required_sources": {"manifest_digest": "1" * 64},
                "context_digest": "2" * 64,
            },
        ),
        mock.patch.object(
            cp,
            "scientific_material_digest",
            return_value=material_digest,
        ),
        mock.patch.object(cp, "codex_scientific_audit") as audit,
        mock.patch.object(cp, "run_ai_command") as ai_command,
        mock.patch.object(cp, "governed_obsidian_write") as obsidian_write,
    ):
        result = cp.scientific_review(self.policy, "scheduled-30m")

    self.assertEqual(result["state"], "SKIP_NO_AI")
    self.assertEqual(result["audit_execution_state"], "SKIPPED_NO_AI")
    self.assertEqual(result["efficiency_metrics"]["ai_calls"], 0)
    self.assertEqual(
        result["last_successful_scheduled_audit"]["review_id"],
        "prior-scheduled-audit",
    )
    audit.assert_not_called()
    ai_command.assert_not_called()
    obsidian_write.assert_not_called()
    directory = Path(result["path"])
    self.assertTrue((directory / "skip.json").is_file())
    self.assertFalse((directory / "scientific-audit.json").exists())
```

Also extend the material-digest test so changing the policy digest changes the
scientific digest:

```python
self.assertNotEqual(
    digest_one,
    cp.scientific_material_digest(
        checks,
        github,
        wiki,
        mailbox,
        headroom,
        hermes,
        obsidian,
        productive,
        context,
        "9" * 64,
    ),
)
```

Extend `test_status_cannot_be_ready_before_true_scheduled_evidence` after its
successful scheduled review:

```python
skip = self.runtime / "reviews" / "zz-skip-after-scheduled"
skip.mkdir()
cp.write_json(
    skip / "completion.json",
    {
        "state": "SKIP_NO_AI",
        "trigger": "scheduled-30m",
        "audit_execution_state": "SKIPPED_NO_AI",
        "last_successful_scheduled_audit": {
            "review_id": "scheduled",
            "trigger": "scheduled-30m",
            "audit_execution_state": "PASS",
        },
    },
)
with mock.patch.object(cp, "headroom_status", return_value=active_headroom):
    self.assertEqual(
        cp.status_payload(self.policy)["state"],
        "READY_FOR_HUMAN_REVIEW",
    )
cp.write_json(
    skip / "completion.json",
    {
        "state": "SKIP_NO_AI",
        "trigger": "scheduled-30m",
        "audit_execution_state": "SKIPPED_NO_AI",
        "last_successful_scheduled_audit": None,
    },
)
with mock.patch.object(cp, "headroom_status", return_value=active_headroom):
    self.assertEqual(
        cp.status_payload(self.policy)["state"],
        "PARTIAL_BOOTSTRAP_SAFE",
    )
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
python3 -m unittest -v \
  -k test_unchanged_scientific_material_skips_all_ai_and_obsidian \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
```

Expected: FAIL because `codex_scientific_audit` is still called on equal
material.

- [ ] **Step 3: Bind policy changes into the exogenous digest**

Add `policy_digest: str` to `scientific_material_digest`, reject values
that do not match `HEX64`, and add:

```python
"service_version": VERSION,
"policy_digest": policy_digest,
```

Pass `sha256_text(canonical_json(policy))` from `_scientific_review`. This
ensures the first scheduled tick after installing 1.8.1 cannot be silently
skipped merely because GitHub and Obsidian did not change.

Update every existing direct test call to `scientific_material_digest` with the
same valid 64-character policy digest before adding the distinct-digest
assertion above.

- [ ] **Step 4: Implement the explicit skip completion**

Add:

```python
def complete_scientific_skip(
    policy: Dict[str, Any],
    trigger: str,
    review_id: str,
    directory: Path,
    material_digest: str,
    previous: Dict[str, Any],
    supervisor_context: Dict[str, Any],
) -> Dict[str, Any]:
    runtime = runtime_path(policy)
    prior_success = previous.get("last_successful_scheduled_audit")
    if (
        previous.get("trigger") == "scheduled-30m"
        and previous.get("audit_execution_state") == "PASS"
    ):
        prior_success = {
            "review_id": previous.get("review_id"),
            "trigger": previous.get("trigger"),
            "completed_at": previous.get("completed_at"),
            "manifest_digest": previous.get("manifest_digest"),
            "audit_execution_state": "PASS",
        }
    skip = {
        "schema_version": 1,
        "review_id": review_id,
        "state": "SKIP_NO_AI",
        "classification": "VERIFIED_STABLE",
        "trigger": trigger,
        "material_digest": material_digest,
        "previous_review_id": previous.get("review_id"),
        "reason": "exogenous material digest unchanged",
        "ai_calls": 0,
        "recorded_at": iso_now(),
    }
    write_json(directory / "skip.json", skip, 0o640)
    manifest = evidence_manifest(directory)
    write_json(directory / "evidence-manifest.json", manifest, 0o640)
    completion = {
        **skip,
        "completed_at": iso_now(),
        "manifest_digest": manifest["manifest_digest"],
        "audit_execution_state": "SKIPPED_NO_AI",
        "scientific_audit": None,
        "last_successful_scheduled_audit": prior_success,
        "efficiency_metrics": {
            "ai_calls": 0,
            "supervisor_context_chars": len(canonical_json(supervisor_context)),
        },
        "obsidian_publication": {"state": "UNCHANGED_NO_OBSIDIAN_CHURN"},
        "queue_proposal_publication": {"state": "NOT_ATTEMPTED"},
        "path": str(directory),
    }
    write_json(directory / "completion.json", completion, 0o640)
    write_json(runtime / "state" / "latest-review.json", completion)
    generate_reports(policy)
    event(
        runtime,
        "SCIENTIFIC_REVIEW_SKIPPED_NO_AI",
        review_id=review_id,
        trigger=trigger,
        material_digest=material_digest,
    )
    return completion
```

Call it immediately after computing `material_digest` and before constructing
`audit_input` or invoking Codex:

```python
if previous.get("material_digest") == material_digest:
    return complete_scientific_skip(
        policy,
        trigger,
        review_id,
        directory,
        material_digest,
        previous,
        supervisor_context,
    )
```

Compile the supervisor context with `persist=False`; the copy inside the review
directory is sufficient and avoids a second generated context artifact every
30 minutes.

- [ ] **Step 5: Preserve activation semantics across later skips**

Update `status_payload` so `scheduled_review` is true only for either:

```python
latest.get("trigger") == "scheduled-30m"
and latest.get("audit_execution_state") == "PASS"
and latest.get("state") != "BLOCKED_CAUSAL"
```

or:

```python
latest.get("trigger") == "scheduled-30m"
and latest.get("state") == "SKIP_NO_AI"
and isinstance(latest.get("last_successful_scheduled_audit"), dict)
and latest["last_successful_scheduled_audit"].get("trigger") == "scheduled-30m"
and latest["last_successful_scheduled_audit"].get("audit_execution_state") == "PASS"
```

A skip without prior successful scheduled evidence must remain insufficient for
activation.

- [ ] **Step 6: Run the skip, failure and status tests**

Run:

```bash
python3 -m unittest -v \
  -k test_unchanged_scientific_material_skips_all_ai_and_obsidian \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v \
  -k test_scheduled_scientific_review_records_early_failure_instead_of_stopping \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v \
  -k test_status_cannot_be_ready_before_true_scheduled_evidence \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v ops/dev-os/control-plane/test_ardesia_control_plane.py
```

Expected: PASS; the new skip test proves zero AI entry points and zero Obsidian
writes.

- [ ] **Step 7: Commit the no-change gate**

```bash
git diff --check
git add -- \
  ops/dev-os/control-plane/ardesia_control_plane.py \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
git diff --cached --check
git commit -m "feat(control-plane): skip unchanged AI cycles"
```

---

### Task 3: Bound the complete serialized context packet

**Files:**

- Modify: `ops/dev-os/control-plane/policy.source.json:1-40`
- Modify: `ops/dev-os/control-plane/ardesia_control_plane.py:143-230,2745-3132,5407-5424,6381-6387,7173-7208`
- Test: `ops/dev-os/control-plane/test_ardesia_control_plane.py:1059-1109,1410-1446`

**Interfaces:**

- Consumes: WikiLLM results, required sources, prior-run evidence, external
  directives, Git history and local coordination.
- Produces:
  `bounded_json_section(value, max_chars) -> Dict[str, Any]`,
  `finalize_context_packet(stable_content, max_chars, compiled_at=None)`,
  `build_scientific_audit_input -> Dict[str, Any]`, and packets with
  `budget.limit_chars`, `budget.serialized_chars`, `content_digest` and
  `context_digest`.
- Guarantees:
  both the writer packet and the complete file read by Codex satisfy
  `len(canonical_json(packet)) <= packet["budget"]["limit_chars"]`.

- [ ] **Step 1: Write adversarial packet-ceiling tests**

Add:

```python
def test_context_packet_ceiling_bounds_every_rich_section(self) -> None:
    oversized_notes = [
        {
            "title": f"Note {index}",
            "path": f"20-Decisions/ADR-{index:03d}.md",
            "sha256": f"{index:064x}"[-64:],
            "source_commit": "obsidian:" + "a" * 64,
            "body": "knowledge-" * 10_000,
        }
        for index in range(20)
    ]
    oversized_sources = {
        "schema_version": 1,
        "entries": [
            {
                "source_id": source_id,
                "root": "runtime",
                "path": f"sources/{source_id}.md",
                "authority": "EXTERNAL_OPERATOR_SOURCE",
                "sha256": "b" * 64,
                "bytes": 100_000,
                "content": "source-" * 20_000,
                "content_included_chars": 140_000,
                "content_omitted_chars": 0,
                "content_truncated": False,
            }
            for source_id in cp.REQUIRED_SOURCE_CONTENT_PRIORITY
        ],
        "manifest_digest": "c" * 64,
        "content_budget_chars": 1_000_000,
        "content_used_chars": 1_000_000,
        "content_priority": list(cp.REQUIRED_SOURCE_CONTENT_PRIORITY),
    }
    with (
        mock.patch.object(cp, "wikillm_search", return_value=oversized_notes),
        mock.patch.object(
            cp,
            "required_source_context",
            return_value=oversized_sources,
        ),
        mock.patch.object(
            cp,
            "prior_run_context",
            return_value=[{"summary": "prior-" * 20_000}],
        ),
        mock.patch.object(
            cp,
            "external_directive_context",
            return_value=[{"directive": {"payload": "directive-" * 20_000}}],
        ),
        mock.patch.object(
            cp,
            "git_history_context",
            return_value={"entries": ["history-" * 20_000]},
        ),
    ):
        packet = cp.compile_context(
            self.policy,
            "bounded scientific context",
            max_chars=30_000,
            persist=False,
            task=None,
        )
    self.assertLessEqual(len(cp.canonical_json(packet)), 30_000)
    self.assertEqual(packet["budget"]["limit_chars"], 30_000)
    self.assertEqual(
        packet["budget"]["serialized_chars"],
        len(cp.canonical_json(packet)),
    )
    self.assertTrue(packet["budget"]["truncated"])
    self.assertEqual(
        packet["required_sources"]["manifest_digest"],
        "c" * 64,
    )
    self.assertTrue(
        all("sha256" in entry for entry in packet["required_sources"]["entries"])
    )
```

Add a second adversarial test for the complete scientific input rather than
only its `supervisor_context` member:

```python
def test_complete_scientific_audit_input_respects_supervisor_ceiling(self) -> None:
    large = {"records": [{"text": "evidence-" * 20_000} for _ in range(20)]}
    packet = cp.build_scientific_audit_input(
        self.policy,
        review_id="review-bound",
        trigger="scheduled-30m",
        previous=large,
        checks=large,
        github=large,
        wiki=large,
        mailbox=large,
        headroom=large,
        hermes=large,
        productive={"tasks": {"ACTIVE": {"state": "IMPLEMENT"}}, **large},
        supervisor_context=large,
        material_digest="d" * 64,
    )
    self.assertLessEqual(len(cp.canonical_json(packet)), 24_000)
    self.assertEqual(packet["budget"]["limit_chars"], 24_000)
    self.assertTrue(packet["queue_nonterminal"])
    self.assertTrue(packet["previous_review"]["truncated"])
    self.assertTrue(packet["supervisor_context"]["truncated"])
```

Extend the seed test:

```python
base_context = cp.finalize_context_packet(
    {"schema_version": 1, "notes": []},
    30_000,
    compiled_at="2026-07-28T18:00:00Z",
)
context = cp.context_with_candidate_seed(base_context, descriptor)
self.assertLessEqual(
    len(cp.canonical_json(context)),
    context["budget"]["limit_chars"],
)
```

- [ ] **Step 2: Run the context tests and verify they fail**

Run:

```bash
python3 -m unittest -v \
  -k test_context_packet_ceiling_bounds_every_rich_section \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v \
  -k test_required_source_budget_cannot_starve_scientific_history \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v \
  -k test_complete_scientific_audit_input_respects_supervisor_ceiling \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
```

Expected: FAIL because `max_chars` currently limits only WikiLLM note bodies and
does not cap the serialized packet.

- [ ] **Step 3: Freeze the two model-bound ceilings**

Add this top-level policy object and include `context` in `POLICY_KEYS`:

```json
"context": {
  "writer_max_chars": 30000,
  "supervisor_max_chars": 24000
}
```

Validate the object strictly and require those two exact integers. Change the
MCP `knowledge.compile` maximum from 50,000 to 30,000. Change the productive
writer call from `max_chars=50000` to the policy’s `writer_max_chars`, and the
scientific supervisor call from the literal 24,000 to
`supervisor_max_chars`.

- [ ] **Step 4: Implement bounded supplemental sections**

Add:

```python
def bounded_json_section(value: Any, max_chars: int) -> Dict[str, Any]:
    if max_chars < 0:
        raise ValueError("context section budget cannot be negative")
    encoded = canonical_json(value)
    included = encoded[:max_chars]
    return {
        "encoding": "canonical-json-prefix",
        "sha256": sha256_text(encoded),
        "included": included,
        "included_chars": len(included),
        "omitted_chars": len(encoded) - len(included),
        "truncated": len(included) < len(encoded),
    }
```

Represent `prior_runs`, `external_directives`, `git_history` and
`local_coordination` with this wrapper. Include their source locations in
stable metadata:

```python
"section_sources": {
    "prior_runs": "artifacts/productive-runs",
    "external_directives": "state/mailbox.json",
    "git_history": "exact product Git SHA",
    "local_coordination": "authenticated local worktree inventory",
},
```

Use deterministic section shares of the requested total:

```python
section_budgets = {
    "notes": max_chars * 30 // 100,
    "required_sources": max_chars * 30 // 100,
    "prior_runs": max_chars * 12 // 100,
    "external_directives": max_chars * 10 // 100,
    "git_history": max_chars * 8 // 100,
    "local_coordination": max_chars * 5 // 100,
}
```

The remaining five percent is envelope reserve. Continue to use
`allocate_required_source_content` inside `required_source_context` so every
present high-priority operator/scientific source receives a nonzero allocation
before low-priority sources consume the remainder.

- [ ] **Step 5: Implement the final serialized ceiling**

Add a recursive trimmer that mutates only model-facing text fields and never
changes paths, IDs, digests, authority or classification:

```python
def trim_context_text(value: Any, remaining: int) -> int:
    if remaining <= 0:
        return 0
    if isinstance(value, dict):
        for key in reversed(list(value)):
            item = value[key]
            if key in {"content", "included"} and isinstance(item, str):
                removed = min(len(item), remaining)
                value[key] = item[: len(item) - removed]
                remaining -= removed
            else:
                remaining = trim_context_text(item, remaining)
            if remaining <= 0:
                break
    elif isinstance(value, list):
        for item in reversed(value):
            remaining = trim_context_text(item, remaining)
            if remaining <= 0:
                break
    return remaining
```

Finalize packets with a 512-character envelope reserve:

```python
def finalize_context_packet(
    stable_content: Dict[str, Any],
    max_chars: int,
    compiled_at: Optional[str] = None,
) -> Dict[str, Any]:
    if not 1_000 <= max_chars <= 30_000:
        raise ValueError("context packet limit must be between 1000 and 30000")
    content = json.loads(canonical_json(stable_content))
    budget = {
        "limit_chars": max_chars,
        "serialized_chars": 0,
        "truncated": False,
    }
    content["budget"] = budget
    while len(canonical_json(content)) > max_chars - 512:
        excess = len(canonical_json(content)) - (max_chars - 512)
        before = len(canonical_json(content))
        remainder = trim_context_text(content, excess)
        if remainder > 0 or len(canonical_json(content)) >= before:
            raise ValueError("context metadata exceeds the frozen packet ceiling")
        budget["truncated"] = True
    packet = {
        **content,
        "compiled_at": compiled_at or iso_now(),
        "content_digest": "0" * 64,
        "context_digest": "0" * 64,
    }
    for _ in range(4):
        packet["budget"]["serialized_chars"] = len(canonical_json(packet))
    if len(canonical_json(packet)) > max_chars:
        raise ValueError("final context envelope exceeds the frozen packet ceiling")
    packet["budget"]["serialized_chars"] = len(canonical_json(packet))
    stable_for_digest = {
        key: value
        for key, value in packet.items()
        if key not in {"compiled_at", "content_digest", "context_digest"}
    }
    packet["content_digest"] = sha256_text(canonical_json(stable_for_digest))
    context_for_digest = {
        key: value for key, value in packet.items() if key != "context_digest"
    }
    packet["context_digest"] = sha256_text(canonical_json(context_for_digest))
    packet["budget"]["serialized_chars"] = len(canonical_json(packet))
    return packet
```

Build `stable_content` with the allocated note/source content and bounded
supplemental sections, then return `finalize_context_packet`.

Update `context_with_candidate_seed` to:

1. remove `compiled_at`, `content_digest`, `context_digest` and `budget` from a
   copy;
2. add the immutable seed IDs, file manifest and
   `bounded_json_section(descriptor["review"], 2_000)`;
3. call `finalize_context_packet` with the original
   `context["budget"]["limit_chars"]` and original `compiled_at`.

- [ ] **Step 6: Bound the complete scientific audit input**

The current audit file duplicates full doctor, GitHub, mailbox and productive
state beside `supervisor_context`; limiting only `supervisor_context` would
therefore leave the actual Codex input unbounded. Add:

```python
def build_scientific_audit_input(
    policy: Dict[str, Any],
    *,
    review_id: str,
    trigger: str,
    previous: Dict[str, Any],
    checks: Dict[str, Any],
    github: Dict[str, Any],
    wiki: Dict[str, Any],
    mailbox: Dict[str, Any],
    headroom: Dict[str, Any],
    hermes: Dict[str, Any],
    productive: Dict[str, Any],
    supervisor_context: Dict[str, Any],
    material_digest: str,
) -> Dict[str, Any]:
    active_states = {
        "PENDING",
        "STARTING",
        "PREFLIGHT",
        "CONTEXT_COMPILE",
        "BASELINE",
        "IMPLEMENT",
        "VERIFY",
        "CROSS_PROVIDER_REVIEW",
        "REPAIR",
        "COMMIT",
        "MEMORY_DELTA",
    }
    queue_nonterminal = any(
        isinstance(record, dict) and record.get("state") in active_states
        for record in (productive.get("tasks") or {}).values()
    )
    stable = {
        "schema_version": 1,
        "review_id": review_id,
        "trigger": trigger,
        "material_digest": material_digest,
        "queue_nonterminal": queue_nonterminal,
        "previous_review": bounded_json_section(previous, 1_500),
        "deterministic_checks": bounded_json_section(checks, 2_500),
        "github_monitor": bounded_json_section(github, 2_500),
        "wikillm": bounded_json_section(wiki, 1_500),
        "mailbox": bounded_json_section(mailbox, 2_000),
        "headroom": bounded_json_section(headroom, 1_500),
        "hermes": bounded_json_section(hermes, 1_000),
        "productive_loop": bounded_json_section(productive, 3_000),
        "supervisor_context": bounded_json_section(
            supervisor_context,
            8_000,
        ),
        "authority": {
            "github": "operational coordination oracle",
            "obsidian_markdown_git": "canonical knowledge",
            "wikillm": "derived rebuildable index",
            "headroom": "required stateless lossless AI gateway",
            "hermes": "disabled during efficiency substrate",
            "agentmemory": "RETIRED_NO_READ_NO_WRITE",
        },
    }
    return finalize_context_packet(
        stable,
        policy["context"]["supervisor_max_chars"],
    )
```

Construct this object only after the equal-digest `SKIP_NO_AI` return. Replace
the unbounded literal `audit_input` in `_scientific_review` with this helper.

In `codex_scientific_audit`, require
`isinstance(audit_input.get("queue_nonterminal"), bool)` and use that field for
the proposal gate instead of parsing the now-bounded `productive_loop` prefix:

```python
queue_nonterminal = audit_input["queue_nonterminal"]
if proposal is not None and queue_nonterminal:
    raise ValueError(
        "scheduled scientific audit proposed work before the queue was terminal"
    )
```

Update the existing premature-proposal test input to
`{"queue_nonterminal": True}`. Retain its assertions for SOL/xhigh,
`read-only` and `--skip-git-repo-check`.

- [ ] **Step 7: Run the context and complete control-plane tests**

Run:

```bash
python3 -m unittest -v \
  -k test_context_packet_ceiling_bounds_every_rich_section \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v \
  -k test_required_source_budget_cannot_starve_scientific_history \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v \
  -k test_prior_run_context_reads_review_artifacts_not_only_state_cache \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v \
  -k test_complete_scientific_audit_input_respects_supervisor_ceiling \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v ops/dev-os/control-plane/test_ardesia_control_plane.py
```

Expected: PASS; neither a writer context nor the complete file read by Codex is
above its declared ceiling.

- [ ] **Step 8: Commit the context boundary**

```bash
git diff --check
git add -- \
  ops/dev-os/control-plane/ardesia_control_plane.py \
  ops/dev-os/control-plane/policy.source.json \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
git diff --cached --check
git commit -m "feat(control-plane): bound compiled AI context"
```

---

### Task 4: Record comparable route-level efficiency metrics

**Files:**

- Modify: `ops/dev-os/control-plane/ardesia_control_plane.py:1809-1885,1968-2136,3296-3535,3783-3806`
- Test: `ops/dev-os/control-plane/test_ardesia_control_plane.py:224-447`
- Modify: `docs/ops/ARDESIA-MCP-CONTROL-PLANE.md:20-60,105-112`

**Interfaces:**

- Consumes: Headroom `/stats` request logs and the unique route stack ID.
- Produces:
  `route_efficiency_metrics(matching_routes, binding, request_stats)`.
- Receipt metrics:
  request count, original/optimized input tokens, output tokens, saved tokens,
  optimization latency, total provider latency, controller wall time and an
  explicitly qualified global-window cost delta.

- [ ] **Step 1: Write route aggregation and receipt tests**

Extend the existing Headroom request log fixture with:

```python
"input_tokens_original": 25000,
"input_tokens_optimized": 25000,
"output_tokens": 900,
"tokens_saved": 0,
"savings_percent": 0.0,
"optimization_latency_ms": 1.5,
"total_latency_ms": 24000.0,
```

Add `cost_with_headroom_usd` to before/after statistics fixtures and assert:

```python
metrics = result["headroom_binding"]["efficiency_metrics"]
self.assertEqual(metrics["request_count"], 1)
self.assertEqual(metrics["input_tokens_original"], 25000)
self.assertEqual(metrics["input_tokens_optimized"], 25000)
self.assertEqual(metrics["output_tokens"], 900)
self.assertEqual(metrics["tokens_saved"], 0)
self.assertEqual(metrics["total_latency_ms"], 24000.0)
self.assertGreaterEqual(metrics["controller_wall_ms"], 0.0)
self.assertEqual(metrics["cost_attribution"], "GLOBAL_WINDOW_UPPER_BOUND")
self.assertAlmostEqual(metrics["cost_window_delta_usd"], 0.48)
receipt = cp.read_json(
    Path(result["headroom_binding"]["receipt_path"]),
    {},
)
self.assertEqual(receipt["efficiency_metrics"], metrics)
```

Add a negative fixture with a boolean or negative token count and verify that
the entry is excluded rather than interpreted as a numeric metric:

```python
def test_headroom_stats_reject_boolean_and_negative_efficiency_values(self) -> None:
    payload = {
        "requests": {
            "total": 1,
            "by_provider": {},
            "by_model": {},
            "by_stack": {},
        },
        "cost": {"cost_with_headroom_usd": True},
        "request_logs": [
            {
                "request_id": "bad-metrics",
                "provider": "openai",
                "model": "gpt-5.6-sol",
                "tags": {
                    "stack": "ardesia-codex-route",
                    "client": "codex",
                },
                "input_tokens_original": True,
                "input_tokens_optimized": -1,
                "output_tokens": 10,
                "tokens_saved": 0,
                "total_latency_ms": -5,
            }
        ],
    }
    response = mock.MagicMock()
    response.__enter__.return_value.read.return_value = json.dumps(payload).encode()
    with mock.patch.object(
        cp.urllib.request,
        "urlopen",
        return_value=response,
    ):
        stats = cp.headroom_request_stats(self.policy)
    route = stats["route_logs"][0]
    self.assertNotIn("input_tokens_original", route)
    self.assertNotIn("input_tokens_optimized", route)
    self.assertNotIn("total_latency_ms", route)
    self.assertEqual(route["output_tokens"], 10)
    self.assertIsNone(stats["cost_with_headroom_usd"])
```

- [ ] **Step 2: Run the Headroom tests and verify they fail**

Run:

```bash
python3 -m unittest -v \
  -k test_headroom_health_contract_is_exact_and_bounded \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 -m unittest -v \
  -k test_every_ai_command_requires_observed_headroom_request_delta \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
```

Expected: FAIL because route receipts do not yet contain efficiency metrics.

- [ ] **Step 3: Parse only bounded numeric Headroom fields**

In `headroom_request_stats`, copy only non-boolean, non-negative integers or
floats from these request-log keys:

```python
(
    "input_tokens_original",
    "input_tokens_optimized",
    "output_tokens",
    "tokens_saved",
    "savings_percent",
    "optimization_latency_ms",
    "total_latency_ms",
)
```

Read `cost.cost_with_headroom_usd` under the same numeric rule and return it as
`cost_with_headroom_usd`; return `None` when unavailable. Never retain prompt,
response, headers, credentials or full-message fields.

- [ ] **Step 4: Aggregate the unique route**

Set these binding values before process launch:

```python
"started_monotonic": time.monotonic(),
"cost_before_usd": request_stats.get("cost_with_headroom_usd"),
```

Add:

```python
def route_efficiency_metrics(
    matching_routes: Sequence[Dict[str, Any]],
    binding: Dict[str, Any],
    request_stats: Dict[str, Any],
) -> Dict[str, Any]:
    additive = (
        "input_tokens_original",
        "input_tokens_optimized",
        "output_tokens",
        "tokens_saved",
        "optimization_latency_ms",
        "total_latency_ms",
    )
    result: Dict[str, Any] = {
        "request_count": len(matching_routes),
        "controller_wall_ms": round(
            max(0.0, time.monotonic() - float(binding["started_monotonic"]))
            * 1000.0,
            3,
        ),
        "cost_attribution": "UNAVAILABLE",
        "cost_window_delta_usd": None,
    }
    for key in additive:
        result[key] = round(
            sum(float(route.get(key, 0.0)) for route in matching_routes),
            3,
        )
    before = binding.get("cost_before_usd")
    after = request_stats.get("cost_with_headroom_usd")
    if (
        not isinstance(before, bool)
        and isinstance(before, (int, float))
        and not isinstance(after, bool)
        and isinstance(after, (int, float))
        and after >= before
    ):
        result["cost_attribution"] = "GLOBAL_WINDOW_UPPER_BOUND"
        result["cost_window_delta_usd"] = round(float(after - before), 6)
    return result
```

Store the result in both the persisted route receipt and the returned binding.
The cost is deliberately labelled an upper bound because unrelated concurrent
requests may fall inside the same global statistics window.

- [ ] **Step 5: Surface metrics at scientific-cycle level**

Add the route metrics to `headroom_route_receipt` returned by
`codex_scientific_audit`. In the changed-material completion add:

```python
"efficiency_metrics": {
    "ai_calls": 1,
    "audit_input_chars": len(canonical_json(audit_input)),
    "supervisor_context_chars": len(canonical_json(supervisor_context)),
    "route": (
        (audit.get("headroom_route_receipt") or {}).get("efficiency_metrics")
    ),
},
```

The `SKIP_NO_AI` path created in Task 2 remains `ai_calls=0` and has no route
metric.

- [ ] **Step 6: Document the verified semantics**

Update the operations document to state:

- Claude has the outer Headroom-only network sandbox.
- Codex has its native read-only sandbox, frozen provider configuration and
  route attestation, but no second outer sandbox.
- unchanged material returns `SKIP_NO_AI` with zero model calls and zero
  Obsidian writes;
- packet limits are 30,000 characters for writer context and 24,000 for
  supervisor context;
- per-route token and latency values are exact Headroom observations;
- cost is a global-window upper bound, not exact per-request billing;
- a successful audit is not evidence of accepted product progress.

- [ ] **Step 7: Run all tests and commit metrics plus documentation**

Run:

```bash
python3 -m unittest -v ops/dev-os/control-plane/test_ardesia_control_plane.py
git diff --check
git add -- \
  docs/ops/ARDESIA-MCP-CONTROL-PLANE.md \
  ops/dev-os/control-plane/ardesia_control_plane.py \
  ops/dev-os/control-plane/test_ardesia_control_plane.py
git diff --cached --check
git commit -m "feat(control-plane): record AI efficiency evidence"
```

Expected: full suite PASSes with a test count greater than the pre-change
38-test baseline.

---

### Task 5: Install safely and prove one real scheduled semantic audit

**Files:**

- No repository file change.
- Remote runtime targets:
  `/Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/ardesia_control_plane.py`,
  `/Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/policy.source.json`,
  `/Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/test_ardesia_control_plane.py`,
  `/Users/progettibelli/ARDESIA-RUNTIME/config/mcp-control-policy.json`.

**Interfaces:**

- Consumes: the four committed local implementation files and the installed
  seven-LaunchAgent runtime.
- Produces: an immutable pre-1.8.1 backup, remote test receipt, materialized
  policy, successful true `scheduled-30m` completion, Headroom route receipt,
  log evidence and one `ardesia-status` comment on issue #215.

- [ ] **Step 1: Verify the local commit boundary**

Run:

```bash
git status --short
git diff --check
git log -5 --oneline
python3 -m unittest -v ops/dev-os/control-plane/test_ardesia_control_plane.py
```

Expected: no uncommitted implementation change, four runtime files at most
changed across the subproject commits, and the full suite PASSes.

- [ ] **Step 2: Stage remote candidates without replacing the live files**

Create one explicit canary directory and transfer the committed files under
their normal basenames so the test module imports the candidate controller.
Do not transfer `.env` files or credentials:

```bash
ssh macmini '/bin/mkdir -p /Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1'
scp ops/dev-os/control-plane/ardesia_control_plane.py \
  macmini:/Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1/ardesia_control_plane.py
scp ops/dev-os/control-plane/policy.source.json \
  macmini:/Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1/policy.source.json
scp ops/dev-os/control-plane/test_ardesia_control_plane.py \
  macmini:/Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1/test_ardesia_control_plane.py
```

- [ ] **Step 3: Run the candidate suite on the Mac mini**

Run the test file beside the candidate controller. The execution command must
return zero before installation:

```bash
ssh macmini 'cd /Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1 && /usr/bin/python3 -m unittest -v test_ardesia_control_plane.py'
```

Keep the canary directory and test output as evidence; do not remove it after
installation.

- [ ] **Step 4: Create a recoverable backup and materialize the candidate policy**

Create a timestamped backup directory beneath
`/Users/progettibelli/ARDESIA-RUNTIME/backups/`, copy the four live targets
into it, and record SHA-256 values. Materialize a candidate policy with the
candidate controller, the source policy, runtime root and the existing
`review_minute=0`. Verify the resulting policy reports version 1.8.1 and the
two exact network boundaries.

Use the exact recoverable target and commands below. They fail if the backup
already exists; do not remove or overwrite an existing backup:

```bash
ssh macmini '/bin/mkdir /Users/progettibelli/ARDESIA-RUNTIME/backups/control-plane-v1.8-pre-efficiency-substrate-20260728'
ssh macmini '/bin/cp -p /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/ardesia_control_plane.py /Users/progettibelli/ARDESIA-RUNTIME/backups/control-plane-v1.8-pre-efficiency-substrate-20260728/ardesia_control_plane.py'
ssh macmini '/bin/cp -p /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/policy.source.json /Users/progettibelli/ARDESIA-RUNTIME/backups/control-plane-v1.8-pre-efficiency-substrate-20260728/policy.source.json'
ssh macmini '/bin/cp -p /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/test_ardesia_control_plane.py /Users/progettibelli/ARDESIA-RUNTIME/backups/control-plane-v1.8-pre-efficiency-substrate-20260728/test_ardesia_control_plane.py'
ssh macmini '/bin/cp -p /Users/progettibelli/ARDESIA-RUNTIME/config/mcp-control-policy.json /Users/progettibelli/ARDESIA-RUNTIME/backups/control-plane-v1.8-pre-efficiency-substrate-20260728/mcp-control-policy.json'
ssh macmini '/usr/bin/shasum -a 256 /Users/progettibelli/ARDESIA-RUNTIME/backups/control-plane-v1.8-pre-efficiency-substrate-20260728/ardesia_control_plane.py /Users/progettibelli/ARDESIA-RUNTIME/backups/control-plane-v1.8-pre-efficiency-substrate-20260728/policy.source.json /Users/progettibelli/ARDESIA-RUNTIME/backups/control-plane-v1.8-pre-efficiency-substrate-20260728/test_ardesia_control_plane.py /Users/progettibelli/ARDESIA-RUNTIME/backups/control-plane-v1.8-pre-efficiency-substrate-20260728/mcp-control-policy.json'
ssh macmini '/usr/bin/python3 /Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1/ardesia_control_plane.py materialize-policy --source /Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1/policy.source.json --output /Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1/mcp-control-policy.json --runtime /Users/progettibelli/ARDESIA-RUNTIME --review-minute 0'
ssh macmini '/usr/bin/python3 -c "import json; p=json.load(open(\"/Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1/mcp-control-policy.json\")); assert p[\"service_version\"] == \"1.8.1\"; assert p[\"headroom\"][\"client_network_boundaries\"] == {\"claude\": \"SANDBOX_EXEC_HEADROOM_ONLY\", \"codex\": \"CODEX_NATIVE_READ_ONLY_ATTESTED_HEADROOM\"}; print(\"PASS_POLICY_1_8_1\")"'
```

- [ ] **Step 5: Atomically install and restart only the continuous controller**

After the candidate suite and materialization PASS:

1. atomically replace the three files under `mcp-control-plane`;
2. atomically replace `config/mcp-control-policy.json`;
3. preserve owner and modes from the prior live files;
4. run `launchctl kickstart -k` only for
   `gui/<uid>/com.ardesia.mcp.controller`;
5. do not restart Headroom or Obsidian when their health is already green.

Perform the recoverable replacement with explicit paths and frozen modes:

```bash
ssh macmini '/bin/cp /Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1/ardesia_control_plane.py /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/ardesia_control_plane.py.new'
ssh macmini '/bin/chmod 700 /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/ardesia_control_plane.py.new'
ssh macmini '/bin/mv /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/ardesia_control_plane.py.new /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/ardesia_control_plane.py'
ssh macmini '/bin/cp /Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1/policy.source.json /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/policy.source.json.new'
ssh macmini '/bin/chmod 640 /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/policy.source.json.new'
ssh macmini '/bin/mv /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/policy.source.json.new /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/policy.source.json'
ssh macmini '/bin/cp /Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1/test_ardesia_control_plane.py /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/test_ardesia_control_plane.py.new'
ssh macmini '/bin/chmod 640 /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/test_ardesia_control_plane.py.new'
ssh macmini '/bin/mv /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/test_ardesia_control_plane.py.new /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/test_ardesia_control_plane.py'
ssh macmini '/bin/cp /Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1/mcp-control-policy.json /Users/progettibelli/ARDESIA-RUNTIME/config/mcp-control-policy.json.new'
ssh macmini '/bin/chmod 600 /Users/progettibelli/ARDESIA-RUNTIME/config/mcp-control-policy.json.new'
ssh macmini '/bin/mv /Users/progettibelli/ARDESIA-RUNTIME/config/mcp-control-policy.json.new /Users/progettibelli/ARDESIA-RUNTIME/config/mcp-control-policy.json'
ssh macmini '/bin/launchctl kickstart -k gui/$(/usr/bin/id -u)/com.ardesia.mcp.controller'
```

Immediately verify:

```bash
ssh macmini '/usr/bin/python3 /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/ardesia_control_plane.py --policy /Users/progettibelli/ARDESIA-RUNTIME/config/mcp-control-policy.json doctor'
ssh macmini '/bin/launchctl print gui/$(/usr/bin/id -u)/com.ardesia.mcp.controller'
ssh macmini '/bin/launchctl print gui/$(/usr/bin/id -u)/com.ardesia.mcp.review'
```

Expected: controller live, review scheduler still loaded, Headroom required and
healthy, Obsidian continuous, no merge/deploy.

- [ ] **Step 6: Run a foreground negative and positive transport canary**

First reproduce the rejection of a Codex call without native read-only
sandbox using the remote candidate unit test. Then run the official
`codex-probe`; require:

- no `sandbox_apply: Operation not permitted`;
- App Server thread/turn read-only policies present;
- exit state `PASS`;
- a unique correlated Headroom receipt;
- direct-provider fallback absent.

Run:

```bash
ssh macmini 'cd /Users/progettibelli/ARDESIA-RUNTIME/canary/control-plane-1.8.1 && /usr/bin/python3 -m unittest -v -k test_codex_routing_is_controller_owned_and_conflicts_are_rejected test_ardesia_control_plane.py'
ssh macmini '/usr/bin/python3 /Users/progettibelli/ARDESIA-RUNTIME/mcp-control-plane/ardesia_control_plane.py --policy /Users/progettibelli/ARDESIA-RUNTIME/config/mcp-control-policy.json codex-probe'
```

This foreground probe verifies transport but does not satisfy the scheduled
activation gate.

- [ ] **Step 7: Observe the next real launchd review**

Do not invoke `review --trigger scheduled-30m` manually. Wait for the next
calendar event at minute `00` or `30`, then inspect:

- `launchctl` last exit status for `com.ardesia.mcp.review`;
- the new review directory and `completion.json`;
- `scientific-audit.json`;
- the referenced Headroom route receipt;
- LaunchAgent stdout/stderr logs;
- the append-only Obsidian `92-Evidence` receipt.

The scheduled run passes only if:

```text
trigger = scheduled-30m
audit_execution_state = PASS
state != BLOCKED_CAUSAL
scientific_audit.model = gpt-5.6-sol
scientific_audit.reasoning_effort = xhigh
headroom route_attested = true
Codex native sandbox = read-only
outer_sandbox = false
context <= 24000 characters
```

If the first scheduled tick returns `SKIP_NO_AI`, treat that as a failed
installation proof because the 1.8.1 policy digest should be exogenous change.
Do not publish the activation claim; diagnose the digest chain.

- [ ] **Step 8: Prove the following unchanged tick is efficient**

With no exogenous GitHub, canonical Obsidian, directive, product or policy
change, observe the following real scheduled tick. Require:

```text
state = SKIP_NO_AI
audit_execution_state = SKIPPED_NO_AI
efficiency_metrics.ai_calls = 0
no new Headroom route receipt for that review
obsidian_publication.state = UNCHANGED_NO_OBSIDIAN_CHURN
```

This is the falsifier for accidental self-triggering by receipts or context
artifacts.

- [ ] **Step 9: Publish the issue #215 status block only after both proofs**

Generate the current `status-block`, verify that it names the scheduled PASS
audit and preserves its reference across the later skip, then post one comment
to `AndreaMarro/ardesia#215` containing:

```text
ardesia-status
```

followed by the exact JSON status payload plus:

- scheduled PASS review ID and manifest digest;
- Headroom route receipt path and SHA-256;
- route token/latency metrics and qualified cost upper bound;
- later `SKIP_NO_AI` review ID;
- explicit statements that no merge/deploy occurred, Hermes remains disabled,
  and useful autonomous product throughput remains unproven.

Do not describe the system as productive or fully autonomous. This subproject
proves transport correctness and idle-cycle efficiency only.

- [ ] **Step 10: Record rollback evidence**

Write a local runtime receipt naming the backup directory, installed file
digests, policy digest, LaunchAgent states and both scheduled review IDs. The
rollback is the exact reverse atomic replacement from the preserved backup
followed by controller kickstart. Do not execute rollback unless a canary or
health gate fails.

## Completion Criteria

This subproject is complete only when all of the following are true:

1. the full deterministic suite passes with more than 38 tests;
2. Claude is still outer-sandboxed and Codex is not nested-sandboxed;
3. every real AI call still has a unique Headroom receipt;
4. one genuine scheduled SOL/xhigh audit completes semantically;
5. the next unchanged scheduled tick makes zero model calls;
6. every emitted model-bound context packet is at or below its declared limit;
7. route receipts contain comparable token and latency metrics with honest cost
   attribution;
8. logs, Obsidian evidence and issue #215 contain the same review and receipt
   digests;
9. no merge, deploy, direct-main write, Hermes enablement or Headroom transform
   occurred.
