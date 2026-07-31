# The two-hinge loop: how work enters this repository

> **Successore approvato, non ancora implementato (31 luglio 2026):**
> [ARDESIA Loop v6 — Convergence-first](../superpowers/specs/2026-07-31-ardesia-loop-v6-convergence-design.md).
> Questo documento resta la descrizione storica verificata del loop a due
> cardini; v6 ne conserva la separazione writer/refuter e aggiunge controller,
> freshness gate, writer lease, riconciliazione atomica e arresto
> `READY_FOR_HUMAN`.

First committed `2026-07-30T04:22:44+02:00`, on `main` at `5c0a2822`; revised across six
adversarial review rounds after that. An earlier revision stated a writing time of
`04:40`, which was **later than the commit that contained it** — a document cannot
declare a future hour. `bin/ci/doc_claims_gate.py` now refuses that.

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
| **Hermes** | Mac mini, `openai-codex` provider; model **declared** `gpt-5.6-sol`, resolved model unverified — see the closing section | tries to **refute** the change |
| **Andrea** | — | authorizes what is irreversible |

That qualification in the second row is a correction, and worth the detour. An
earlier revision asserted the model as fact in this table while the closing section
said the resolved model was **not established** — the document asserting what it
disclaimed **252 lines later** — line 21 against line 273 in `c7492bda^`, a distance
worth stating correctly because an earlier revision wrote "forty lines later", a
number nobody had counted. Adversarial review caught both. Which is to say the
refuter refused to let the document overstate the refuter's own identity. What is
established is the **separation** — different machine, different provider, different
model family from the writer — and separation is what the property below depends on.

Hermes is **not in this repository**. It runs on a separate machine, against a
separate model and a separate provider, and reads a private Obsidian vault. That
separation is the point rather than an accident: the literature on reward hacking
finds that the defect appears when the generator and the judge **share context** —
the score rises while the quality does not.

The separation is **partial, and saying otherwise was what the fourth review round
corrected in this file** — a round, not a finding; the finding count is higher and is
tabled below. An earlier revision claimed "here they share nothing", which is false.
Be precise about which is which:

| separated | shared |
|---|---|
| machine, provider, model family | the diff under review |
| context window | the framing the operator writes into the review prompt |
| — | the vault ledger, which the loop writes and the reviewer reads |

The last two matter. If a cycle records a wrong adjudication in the ledger, the
reviewer consumes it; if the operator's prompt frames a change persuasively, the
reviewer reads that framing before the code. So an ACCEPT is **not** a fully
decorrelated judgment, and treating it as one is the mistake this table exists to
prevent.

What can be said from measurement rather than hope — as a **snapshot**, anchored so
it can be recounted rather than believed. Measured at head `ff24bd9f`, after the
fifth round on this PR, across #222, #220 and #223 on 29–30 July:

| | rounds | findings |
|---|---|---|
| #222 | 1 | 1 |
| #220 | 4 | 5 |
| #223 — this document | 5 | **11** |
| **total** | **10** | **17** |

Nine REJECT and one ACCEPT. Every finding held up when re-tested against the real
code. Eleven of the seventeen were against this file, several of them against claims
its author had framed confidently in the review prompt.

Two things about that table are themselves corrections. An earlier revision said
"nine rounds, fourteen findings, six against this document" — the total was right at
the time, the per-document count was **wrong** (it was eight, not six), and the
whole figure was a running total that went stale the moment another round ran. It is
now a snapshot tied to a SHA, and the recount is one command:

```bash
# the verdict files are in the operator's scratch dir, not in this repo
python3 -c "import json,glob; f=sorted(glob.glob('hermes-22*.json')); print(len(f), sum(len(json.load(open(x))['findings']) for x in f))"
```

A shared channel that reliably produced agreement would not look like this. The
channel is real; on this evidence it did not capture the reviewer.

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

`.github/workflows/ci.yml` runs on **every** pull request, with no `branches:` and
no `paths:` filter — that is why its three jobs are the required checks.

`.github/workflows/studio-preview-readiness.yml` is different, and the difference
matters. PR #220
removed its `branches:` filter and **kept** its `paths:` filter. So it runs on every
PR **whose content touches those paths**, not on every PR. An earlier revision of
this file said it "now does too", which is false and contradicted the section below
in the same document; adversarial review caught it.

The two filters are not the same kind of thing:

| filter | matches | verdict |
|---|---|---|
| `branches:` under `pull_request:` | the PR's **base** — nothing about its content | removed, and now forbidden by a gate |
| `paths:` under `pull_request:` | the PR's **content** | kept deliberately |

A base filter withholds a check from a PR that needs it. A paths filter withholds a
check from a PR that does not. PR #223 — the one that introduced this document — is
the live example: docs-only, so `no-deploy-check` correctly never ran, and the PR
showed the three `ci` jobs. Four checks instead of five, for a legitimate reason
that looks identical from the outside to the illegitimate one #220 fixed. When
counting checks on a PR, read **why** one is missing before concluding anything.

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
# self-contained: extracts the block from THIS file and checks it, from the repo root
python3 - <<'EOF'
import re, pathlib, yaml
t = pathlib.Path("docs/ops/ARDESIA-LOOP-TWO-HINGE-2026-07-30.md").read_text()
block = re.search(r"```yaml\n(.*?)```", t, re.S).group(1)
for d in yaml.safe_load_all(block):
    print(list(d.values())[0]["pull_request"])
EOF
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
claim about the **adjacent** one. The vault carries a gate written specifically
against it — `bin/receipt-measurements.py` in the **separate** `ardesia-knowledge`
repository, not in this one — whose docstring records that the same shape had
already recurred eight times.

That qualification is itself a correction. An earlier revision cited the path bare,
as though it lived in this repo; an agent standing in this root and running
`python3 bin/receipt-measurements.py` gets file-not-found. Adversarial review caught
it, and the location is worth pausing on: **the defect appeared inside the sentence
describing the defect** — a file from the adjacent repository presented as belonging
to this one. Knowing the failure mode by name does not confer immunity from it. That
is the argument for gates rather than for care.

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
an interpretation. #222 and #220 were **merged by Claude Code**, each under an
explicit authorization from Andrea — the first per-PR, the second a standing
directive of 2026-07-30 — each with five green checks and a control run, and with
`main`'s own CI verified **after** each merge rather than inferred.

Their review outcomes were **not the same**, and an earlier revision of this file
flattened them into "after an adversarial ACCEPT", which is false for one of the two:

| PR | adversarial verdict at merge | what was done with it |
|---|---|---|
| #220 | **ACCEPT**, no findings — **on `4e17cfce`** | merged at head `259b4916`, which added a fail-closed merge-key check **after** that ACCEPT and was never reviewed. The merge commit says so; an earlier revision of this table did not, and flattened the two into one verdict. |
| #222 | **REJECT / F_REVIEW** | the finding was re-tested, confirmed true, and judged **non-blocking** — it condemned a pre-existing property that the PR improved rather than introduced. The reasoning is recorded in merge commit `74e428c8`, which says so in its own text. |

A merge over a REJECT is a judgement call, and writing it as an ACCEPT would hide
exactly the call that deserves scrutiny.

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
- That the `CodeRabbit` column means a review happened. Stated so it can be checked
  rather than counted from memory: **on every head inspected across #220, #221, #222
  and #223, `reviews` was `0` and inline comments were `0`**, while the column read
  `pass` — sometimes next to `Review rate limited`, sometimes next to
  `Review completed` with a walkthrough carrying no actionable comments. Verify with
  `gh pr view <n> --json reviews -q '.reviews|length'`. Nothing currently
  distinguishes that column from a real review, and making it binding would require
  a required status check.

## Where the rest lives

The per-cycle evidence — control runs, exit codes, adjudications, the `not_checked`
of each cycle — is written to a private Obsidian vault, not here. This document is
the shape of the system; that vault is its ledger.
