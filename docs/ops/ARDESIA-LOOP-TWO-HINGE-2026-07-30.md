# The two-hinge loop: how work enters this repository

Written `2026-07-30T04:40+02:00`, on `main` at `5c0a2822`.

Every timestamp and SHA below comes from `git log`, not from memory. The
reconstruction is repeatable:

```bash
git log --reverse --format="%aI  %h  %s" origin/main --since="2026-07-29 12:00"
```

This describes the loop that produced PR #222 and PR #220 on 29–30 July 2026. It
supersedes nothing: `docs/ops/ARDESIA-V1-LOOP-EXECUTABLE.md` (2026-07-10, after
PR #163) is the previous generation and remains as the record of it.

## Two hinges, and neither decides alone

| hinge | where | job |
|---|---|---|
| **Claude Code** | MacBook | writes the code, runs the oracle, adjudicates findings |
| **Hermes** | Mac mini, `gpt-5.6-sol` via `openai-codex` | tries to **refute** the change |
| **Andrea** | — | authorizes what is irreversible |

Hermes is **not in this repository**. It runs on a separate machine, against a
separate model and a separate provider, and reads a private Obsidian vault. That
separation is the point rather than an accident: the literature on reward hacking
finds that the defect appears when the generator and the judge **share context** —
the score rises while the quality does not. Here they share nothing.

Hermes' contract is enforced, not requested. Its wrapper exits `69` when the JSON
is missing, `69` when `not_checked` is **empty**, and `65` on an empty diff. A
reviewer that cannot claim total coverage.

## The cycle

1. **Orient** — read the registry, `git log`, the open PRs. A fresh context window
   does not remember the previous cycle, so it reads it.
2. **One unit only** — the first open, unblocked entry. Not a phase. Trying to
   close a phase in one cycle is the anti-pattern that produces long sessions with
   zero accepted units.
3. **TDD, then the control run** — the red test first, watched failing for the
   right reason; then the old code restored to confirm the test goes red against
   what it condemns. A test never seen failing is an opinion with a green tick.
4. **The oracle, separated** — `typecheck`, `test` and `build` run as three
   commands with three exit codes read individually. `vitest` does **not**
   typecheck: a fully green suite coexists happily with a red `tsc`, and that
   happened twice in one day, under 113 and then 2088 passing tests.
5. **Adversarial review** — mandatory before requesting a merge.
6. **Adjudication** — every finding re-tested against the real code, and the
   outcome written down. Hermes can be wrong, and being wrong in an interesting
   way is useful: on #222 the finding was **true** and the block was **rejected**,
   and the argument built to reject it exposed a worse defect than the finding.
7. **CI, then the human gate.**
8. **Registry and receipt** — state, evidence, and a non-empty `not_checked`.

## What the CI workflows guarantee, and why they are shaped that way

`.github/workflows/ci.yml` runs on **every** pull request with no `branches:`
filter. `studio-preview-readiness.yml` now does too, and that was PR #220.

**Do not add `branches:` under `pull_request:`.** The filter matches the pull
request's **base**, not its content. Measured 2026-07-29 on this repository:

- #182, #184 and #180 — stacked on topic branches, `codex/**` heads — report **five**
  checks.
- #187 — also a `codex/**` head — reports **four**.

The discriminator is not the base: it is the `paths:` filter against the pushed
commits, because those five checks arrived through the `push` event and its branch
prefix list. So the defect was **coverage that depends on the branch prefix and on
the last push**, and the only shape that cannot silently regress is no filter at
all: every PR, whatever its base.

The clean proof is #221 — head `wip/**`, which is **not** in any push prefix list,
base not `main`, and whose `no-deploy-check` run is `event=pull_request`. That run
can only exist because the filter is gone.

The gap used to erase its own evidence: once the parent PR merges, GitHub
retargets the child's base to `main`, the workflow finally runs, and afterwards
both PRs look identical.

`bin/ci/workflow_trigger_gate.py` enforces the invariant inside the **required**
`hygiene` job, because a comment can be deleted without anyone noticing and a red
check cannot.

## A gate must read meaning, not characters

That gate took four adversarial rounds, and **every single finding was in the gate
rather than in the workflow**. Six valid YAML spellings of the banned filter walked
past a line-based parser.

Each is a **complete document**, and the block below is a valid multi-document YAML
stream, so it can be pasted and checked rather than read and believed. An earlier
revision of this file compressed them into one pseudo-block that PyYAML refused
with `ComposerError: found undefined alias 'base'` — while the surrounding prose
claimed all six had been confirmed with a real parser. Adversarial review caught
it. Examples that cannot be executed are not evidence.

```yaml
# 1 — flow mapping under the trigger
on:
  pull_request: { branches: [main] }
---
# 2 — space before the colon
on:
  pull_request:
    "branches" : [main]
---
# 3 — flow mapping under `on:` itself
on: {pull_request: {branches: [main]}}
---
# 4 — unicode escape inside a quoted key: the key decodes to pull_request
on:
  "pull_requ\u0065st":
    branches: [main]
---
# 5 — anchor and alias
on:
  push: &base
    branches: [main]
  pull_request: *base
---
# 6 — merge key
on:
  push: &base
    branches: [main]
  pull_request:
    <<: *base
```

Verify the claim rather than trust it — every document must report
`{'branches': ['main']}`:

```bash
python3 -c "import yaml,sys; [print(list(d.values())[0]['pull_request']) for d in yaml.safe_load_all(sys.stdin)]" < examples.yaml
```

Measured: **6/6** parse to `pull_request.branches == ['main']`, and **6/6** are
flagged by `bin/ci/workflow_trigger_gate.py`. The authority is the versioned tests
in that file — `test_flags_escaped_trigger_key`,
`test_flags_filter_reached_through_an_anchor_alias`,
`test_flags_merge_key_under_a_pr_trigger` and the rest — not this block. If the two
ever disagree, the tests are right.

A lexical parser compares **characters** while YAML compares **decoded values**, so
every key has unlimited spellings and every patch invites the next one.

The answer was architectural: the gate reads the document via `yaml.compose`,
which returns the node tree with scalars already decoded and with line marks —
the meaning and the line number, which is all it needs. Flow or block, quoted or
bare, escaped or aliased: none of it matters once characters stop being the
subject. Merge keys are the exception the composer cannot resolve — they are merged
by the constructor — so a `<<` under a PR trigger is refused rather than declared
clean.

Two rules fell out of this and are worth carrying to any gate in `bin/ci/`:

- **Print which check actually ran.** The gate reports
  `[modo: semantico (PyYAML 6.0.1)]`. That banner answered, with a measurement,
  a question that had been guesswork — whether the runner has PyYAML — on its
  first run. It also revealed that the runner has 6.0.1 where the development
  machine has 6.0.3.
- **A gate that cannot verify FAILS.** An earlier revision carried a lexical
  fallback for a host without PyYAML. Review found its self-test crashed in
  exactly that mode and that it was blind to anchors, so it was **deleted** rather
  than repaired a third time. It had been insurance against a risk the gate's own
  banner had already disproven, and it produced two defects by itself. A degraded
  gate that stays silent is worse than an absent one: it looks like a gate that
  checked.

## The self-improving part, and its honest limit

**This repository has had a `PreToolUse` hook since `2026-07-10T03:33:04+02:00`** —
`.claude/settings.json` matches `Bash|Edit|Write|NotebookEdit|Read|Grep|Glob` and
runs `scripts/guardrails/claude-pretool-safety.sh`. An earlier revision of this file
said "no Claude Code hooks" as an unqualified measurement, and that was false for
this repo. What had actually been measured was the **user-level** files —
`~/.claude/settings.json` and `~/.claude/settings.local.json` — and the result was
then written as a statement about the repository. Adversarial review caught it.

That is worth naming rather than quietly fixing, because it is the defect this
project keeps paying for: a measurement taken on one referent and reported as a
claim about the **adjacent** one. `bin/receipt-measurements.py` exists because the
same shape had already recurred eight times.

So the accurate statement is narrower. The **attachment point** was never missing
here: a repo-level `PreToolUse` hook predates this work by twenty days. What was
missing was a gate on **false measurement** — nothing refused a command whose exit
code could not mean what it appeared to mean — and there were no git hooks in the
vault, so every gate in the vault's `bin/` was a script somebody had to remember to
run.

What exists now lives **outside this repository**, in the operator's environment,
and is recorded here so the shape is known:

- a `PreToolUse` hook that refuses shell commands which produce a false
  measurement — an exit code read through a pipe, or `gh pr list` used as a count
  without `--limit`, which silently caps at 30 (measured: 30 without, **34** with
  `--limit 200` and from the search API);
- a `pre-commit` hook in the vault that enforces four rules previously written only
  as directives.

**The limit, stated plainly:** those hooks are not in this repo, are not in CI, and
protect the operator's conduct rather than the product. A contributor without them
gets none of it. Only the `bin/ci/` gates and the required checks bind anyone who
opens a PR here.

And a lesson that belongs to any gate: while fixing a false positive, the
measurement hook lost an `import` and **failed open** — it crashed, emitted no
verdict, and everything passed. Thirteen test cases all came back "allow" where a
healthy gate gives four "deny". A broken gate and a gate that looked produce the
same silence. It now carries a `--self-test` with a single decision point shared
between the hook and its tests, run at session start: silent when healthy, loud
when broken.

## Rules of this repository that the loop does not relax

Root `AGENTS.md` states: GDPR (no corpus or PII in the repo), ZERO-LLM in the
product, additive and migrate-safe changes, **never weaken the gates**, and
**never auto-merge to main**.

On that last one, what actually happened on 29–30 July, stated as a fact and not as
an interpretation: #222 and #220 were **merged by Claude Code**, each under an
explicit authorization from Andrea — the first per-PR, the second a standing
directive of 2026-07-30 — after an adversarial ACCEPT, five green checks and a
control run, with `main`'s own CI verified **after** each merge rather than inferred.

**Whether that complies with «mai auto-merge a main» is unresolved, and this
document does not resolve it.** An earlier revision proposed a reading — "no merge
without an explicit authorization recorded in the same session" — and adversarial
review rejected it: neither this file, `docs/vault/ARDESIA-MAP.md`, nor the
ratified canon authorizes substituting a written prohibition with a different rule,
and a document that did so would license a future agent to self-merge on finding a
standing directive and a green PR. The rule is left exactly as it stands.

Until Andrea rules on it, the safe reading for any agent is the literal one: **do
not merge to `main`.** Ask, or record the authorization and let a human perform the
merge.

## What this document does not establish

- That Hermes ran on `gpt-5.6-sol` at `xhigh`. Its config declares it and the
  `openai-codex` provider plugin is registered at the exact launch times, but **no
  log line names the resolved model**, and a second config file on the same host
  declares `gpt-5.5`/`high`. Two disagreeing sources, unresolved.
- Exhaustive coverage of YAML constructions. Six spellings closed plus fail-closed
  on the forms the parser cannot resolve, but no proof of exhaustiveness — the
  adversarial review put the same caveat in its own `not_checked`.
- Behaviour on events nobody touched: fork, draft, reopened, merge queue.
- That the `CodeRabbit` column means a review happened. Across #222 and #220 it
  reported `pass` **five consecutive times** while `reviews` stayed `0`, sometimes
  next to `Review rate limited`. Nothing currently distinguishes it from a real
  review, and making it binding would require a required status check.

## Where the rest lives

The per-cycle evidence — control runs, exit codes, adjudications, the `not_checked`
of each cycle — is written to a private Obsidian vault, not here. This document is
the shape of the system; that vault is its ledger.
