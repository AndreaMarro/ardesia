# ARDESIA V1 — Repository Truth

Snapshot: `2026-07-10T03:35:08+02:00`
Last verified: `2026-07-10T03:54:46+02:00`
Evidence commit: `cedfa932dc91088e6bd30af49ed0f648157c6e1b`
Structural base: `origin/main@204ffefc7f375ecd717fcbf4ba3aaa35a6e5c2fa`
Terminal: **ARCHITECTURE_RED**

Confidence rule: HIGH for local Git/tree facts and GitHub API snapshots tied to
the times above; MEDIUM for classifications inherited from the 2 July map and
rechecked only against current metadata; UNKNOWN for Mini runtime, deploy,
provider state, unpushed commits and human ownership. Every row's limitation is
part of the claim, not a footnote that may be dropped.

## Decision

`AndreaMarro/ardesia` is VERIFIED as the canonical GitHub repository for
structure, governance, V1 evidence, and this isolated documentation lane. The
formal behavior canon still assigns Engine to external `lessonos`, Studio to
the Mini `maestro-studio` checkout, and ELAB to its standalone lineage. Those
assignments are **VERIFIED as canon**; their exact live heads/runtime and any
cutover are **UNKNOWN**. No product-feature lane may use recency to replace the
formal owners or claim that an unevidenced cutover happened.

Until an explicit cutover decision is evidenced, this monorepo may receive
governance, audit, test/guardrail, and repository-local security work whose
validity does not depend on choosing a live product runtime. It must not be
declared the live behavioral runtime merely because it contains newer commits.

## Evidence hierarchy

The current direct human order defines this hierarchy; it is normative input,
not implementation evidence:

1. Behavior reproduced on the current exact SHA.
2. Tests and CI tied to that same SHA.
3. Verified deploy and database state tied to the artifact/SHA.
4. Current human-ratified canon.
5. ADRs, then PRs/issues and dated reports.
6. Memory and chat, as discovery aids only.

Recency is evidence of activity, not authority. A green CI run proves only its
workflow and SHA; it does not prove deployment, cutover, book fidelity, or V1.

## Accessible repository inventory

Fresh `gh repo list` returned 32 repositories: 17 active and 15 archived. The
table classifies every active ARDESIA/ELAB-related repository found; Numeria is
a separate product and the 15 already-archived unrelated repositories are out
of product scope. Classification controls preservation and write routing only;
it does not prove a repository is deployed or current.

| Repository | Class | Current evidence and ruling | Confidence / limit |
|---|---|---|---|
| `AndreaMarro/ardesia` | **CANONICAL** | structural integration, governance and current V1 documentation target | HIGH for structure; behavior is split below |
| `AndreaMarro/lessonos` | **ACTIVE-SATELLITE** | formal Engine behavior owner; default `auto/main` | HIGH as canon/remote metadata; live Mini state UNKNOWN |
| `AndreaMarro/ardesia-studio` | **ACTIVE-SATELLITE** | formal Studio/ToolHost lineage; Mini path is `~/maestro-studio` | HIGH as canon/remote metadata; live Mini state UNKNOWN |
| `AndreaMarro/elab-tutor` | **ACTIVE-SATELLITE** | standalone ELAB product lineage | HIGH existence; current local checkout is dirty, has no upstream and is not at remote `main` |
| `AndreaMarro/ardesia-tools` | **BUILD-TOOLING** | factory-loop tooling preserved separately | MEDIUM; content not re-audited in this slice |
| `AndreaMarro/ardesia-vault` | **KNOWLEDGE-STORE** | directive/vault lineage imported into `ardesia/docs/vault` | MEDIUM; current content precedence unresolved |
| `AndreaMarro/ardesia-wiki` | **KNOWLEDGE-STORE** | wiki lineage imported into `ardesia/docs/wiki` | MEDIUM; current content precedence unresolved |
| `AndreaMarro/elab-volumi` | **KNOWLEDGE-STORE** | private ELAB volume-markdown/content lineage | MEDIUM; not proven the sole licensed-asset authority |
| `AndreaMarro/ardesia-lavagna` | **EXPERIMENTAL** | demo/prototype/deploy-surface lineage | HIGH existence; no current exact-SHA deploy proof |
| `AndreaMarro/ardesia-simulator` | **EXPERIMENTAL** | simulator prototype/salvage candidate | HIGH existence; not behavioral canon |
| `AndreaMarro/whiteboard-studio-sim` | **EXPERIMENTAL** | generic simulator pilot | HIGH existence; not behavioral canon |
| `AndreaMarro/numerical-lab-journey` | **UNKNOWN** | separate-product/ELAB-adjacent scaffold in the dated map | MEDIUM; excluded from ARDESIA integration without a decision |
| `AndreaMarro/unlim-intelligente` | **LEGACY** | UNLIM planning/AI lineage | HIGH existence; concepts only, not runtime authority |
| `AndreaMarro/elab-galileo-nanobot` | **LEGACY** | old AI backend lineage and obsolete product name | HIGH existence; not current UNLIM authority |
| `AndreaMarro/elab-website` | **LEGACY** | separate historic public-site lineage | HIGH existence; not V1 deploy authority |

No active related repository is classified `MIRROR` or `ARCHIVE` on current
evidence. No classification authorizes deletion, archival, synchronization or
implementation in that repository.

## Concern-by-concern Source of Truth

The mandate asks for one owner per concern. Where evidence cannot support one,
the only scientific answer is `UNKNOWN`, with the conflict made blocking.

| Concern | Current owner / ruling | Status and blocker |
|---|---|---|
| Integrated code and governance | `AndreaMarro/ardesia` | **VERIFIED structural SoT**; not a blanket behavior cutover |
| Documentation/canon | `ardesia/docs` on the ratified `main` lineage | **VERIFIED target**, but conflicting documents must be reconciled by PR |
| Plugin SDK / ToolHost behavior | external `ardesia-studio` / Mini `~/maestro-studio` per canon | **VERIFIED-as-canon; live SHA UNKNOWN** |
| Simulator behavior | no single owner proved among standalone ELAB, `apps/studio/sim`, and prototype repos | **UNKNOWN / ARCHITECTURE_RED** |
| LessonOS / Engine behavior | `AndreaMarro/lessonos@auto/main` per canon | **VERIFIED-as-canon; live Mini SHA UNKNOWN** |
| Backend/API | Engine API, ELAB Supabase functions and legacy Nanobot coexist | **UNKNOWN / ARCHITECTURE_RED** |
| Database | Engine SQLite/local state and ELAB Supabase are domain-specific and unreconciled | **UNKNOWN**; no global DB SoT or live provider audit |
| Deploy | no canonical URL has current commit-to-artifact proof | **UNKNOWN / DEPLOY_RED**; historic demo URLs do not qualify |
| ELAB assets | physical volumes, `elab-volumi`, local licensed files and pack copies form multiple lineages | **UNKNOWN / BOOK_FIDELITY_RED** |
| Development memory | ratified Git history, ADR and tracked ops evidence in `ardesia` | **VERIFIED governance rule**; agent memory/chat is discovery cache only |
| Product knowledge base | `ardesia/docs/{wiki,vault}` is the integration target; external wiki/vault remain source lineages | **PARTIAL / precedence unresolved** |
| Release | `ardesia/main` is the governed integration branch; no V1 release artifact exists | **RELEASE_RED** until human merge, exact-SHA gates and deploy proof |

## Verified facts

| Claim | Status | Evidence | Limitation |
|---|---|---|---|
| GitHub structural target is `AndreaMarro/ardesia` | VERIFIED | `docs/ops/GITHUB-REPO-MAP-LIVE.md:13-14`; `gh repo view AndreaMarro/ardesia` | Does not establish behavioral ownership. |
| Root presents itself as one monorepo | VERIFIED | `README.md:1-29`; root scripts address Engine, Studio and plugin | Conflicts with the still-ratified anti-divergence canon. |
| Formal behavior canon points to external Engine/Studio repos | VERIFIED as document | `docs/CANON-INDEX.md:31-32`; `docs/ARCHITECTURE-CANON.md:8-17` | The claims are dated 23 June and require live Mini verification. |
| Formal cutover packet says no cutover performed | VERIFIED as document | `docs/ops/MONOREPO-TOTAL-CUTOVER-PACKET.md:1-5,24-33,133-147` | Packet contains session-date caveats and historical states. |
| The three imported product trees have diverged in different directions | VERIFIED | exact import-tree equality and path-history counts below | Divergence proves neither parity nor behavioral ownership. |
| MacBook lacks `~/lessonos` and `~/maestro-studio` checkouts | VERIFIED | local filesystem probe, exit 0 | The formal behavior repos live on the Mini according to canon. |
| Mini live state was not reachable | BLOCKED_EXTERNAL | `ssh -o BatchMode=yes -o ConnectTimeout=8 macmini true` → exit 255, timeout | No claim about current factory pointer, dirty state, or unpushed commits is allowed. |
| Standalone ELAB checkout exists at `~/VOLUME 3/PRODOTTO/elab-builder@7681789d` | VERIFIED | local `git status`, `git log -1` | It is heavily dirty and not an authorized write lane. |
| `ardesia-simulator@b6f8c974` exists separately | VERIFIED | local repo and GitHub | Canon classifies it as prototype/salvage candidate, not Simulation behavior SoT. |

## Repository activity snapshot

| Repository / branch | Head or last verified push | Classification |
|---|---|---|
| `AndreaMarro/ardesia/main` | `204ffefc`, commit time `2026-07-09T16:31:43Z` | Structural/governance target; active monorepo. Repository-level `pushedAt` was changed by a V1 branch and is not evidence of a `main` push. |
| `AndreaMarro/lessonos/auto/main` | `7c3fdac8`, 2026-06-26 | Formal Engine behavior source, live state UNKNOWN |
| `AndreaMarro/lessonos/main` | `92e393db`, 2026-06-17 | Ratified historical branch, not current behavior |
| `AndreaMarro/ardesia-studio/auto/main` | `f881a788`, 2026-06-18 | Historical Studio factory branch |
| `AndreaMarro/ardesia-studio/main` | `839e009b`, 2026-06-17 | GitHub default is `main`; formal local path remains Mini-only |
| `AndreaMarro/elab-tutor/main` | remote `732ff077`, `2026-06-29T17:43:09Z`; local dirty `7681789d` is not its upstream | Separate product lineage; local `origin/main@4760e2` was stale at snapshot |
| `AndreaMarro/ardesia-simulator/main` | `b6f8c974`, 2026-06-28 | Prototype, not canonical runtime |

Reproduction commands used for the remote inventory and representative heads:

```bash
gh repo list AndreaMarro --limit 200 --json name,nameWithOwner,isArchived,isPrivate,isFork,description,defaultBranchRef,pushedAt,updatedAt,url
gh api 'repos/AndreaMarro/lessonos/commits/auto%2Fmain' --jq '{sha:.sha,date:.commit.committer.date}'
gh api 'repos/AndreaMarro/ardesia-studio/commits/auto%2Fmain' --jq '{sha:.sha,date:.commit.committer.date}'
gh api 'repos/AndreaMarro/elab-tutor/commits/main' --jq '{sha:.sha,date:.commit.committer.date}'
```

Local heads/status used `git log -1 --format='%H %cI'` and
`git status --porcelain=v1 --untracked-files=all`. All succeeded except the
declared Mini SSH probe.

## Import lineage, not inferred recency

Tree identity at each import was reproduced by comparing the source root tree
with the imported subtree tree at the import commit:

| Domain | Imported source → monorepo commit | Path commits after import through `204ffefc` | Separate remote after imported split | Result at `204ffefc` |
|---|---|---:|---:|---|
| Engine | `lessonos@3049c62` → `c4327c31` | **1** (`02973e01`, drift guard) | `auto/main` **+1450 commits** | runtime subtree is still tree-identical to the import and differs from current external head |
| Studio | `ardesia-studio@8f8d05d` → `30db4c28` | **189** | `auto/main` **+45 commits** | monorepo tree differs from import and current external head |
| ELAB | `elab-tutor@edb11e8` → `e108de2` | **10** | `main` **+11 commits** | monorepo tree differs from import and current external head |

These are lineage counts, not semantic-diff scores. In particular,
`204ffefc:packages/engine/lessonos` and `3049c62:lessonos` have the same tree
OID, `eb289e295f0`: Engine runtime code in the monorepo did **not** advance at
all after import. Its sole later path commit added a test outside that runtime
subtree. The guard cannot establish parity in ordinary CI: the external
comparison skips when the sibling `lessonos` checkout is absent
(`packages/engine/tests/test_engine_sync_guard.py:19-26,221-229`), and the
whole-tree assertion is `xfail(strict=False)` (`:241-265`). A passing CI run
therefore does not establish Engine parity with the formal external owner.

## Unresolved repository governance inventory

The snapshot contains 146 local branches and 150 `origin` remote refs. Of the
local branches, 130 are ancestors of `origin/main` and 16 are not. Ancestry is
not evidence that a branch is obsolete, owned, merged semantically, or safe to
delete, so **zero branches are approved for cleanup**. Open/non-integrated work
is enumerated in `V1-PR-REGISTER.md` and the 31 registered lanes in
`V1-WORKTREE-REGISTER.md`; their complete commit ownership remains UNKNOWN.

| Governance question | Snapshot result | Ruling |
|---|---|---|
| Obsolete branches | not human-classified | **UNKNOWN; no deletion** |
| Non-integrated commits | open PRs, 16 local non-ancestor branches, and unreviewed worktree lineages exist | **UNKNOWN; review per lane** |
| Concurrent writers/processes | only this lane has a named V1 write lease; other ownership was not discoverable | **UNKNOWN; do not touch** |
| Git/worktree lock files | 0 `locked`, `index.lock`, `HEAD.lock`, or `config.lock` files observed | VERIFIED only at snapshot; does not prove no active process |
| Duplicate repositories | historical `~/ardesia-monorepo` duplicate is reported on the Mini | **REPORTED; Mini unreachable; no archive action** |
| Dirty/unpushed Mini state | SSH timed out | **BLOCKED_EXTERNAL** |

Re-run with `git worktree list --porcelain`, `git for-each-ref`, per-worktree
`git status --porcelain=v1 --untracked-files=all`, `gh pr list`, and the Mini
probe before any cleanup or ownership decision.

Branch-count commands used:

```bash
git for-each-ref --format='%(refname)' refs/heads | wc -l
git for-each-ref --format='%(refname)' refs/remotes/origin | wc -l
git branch --format='%(refname:short)' --merged origin/main | wc -l
git branch --format='%(refname:short)' --no-merged origin/main | wc -l
```

## Canon conflict

| Domain | Older ratified rule | Newer observed reality | Current ruling |
|---|---|---|---|
| Structure/governance | `~/ardesia` | GitHub monorepo active and root claims one work surface | `ardesia` VERIFIED |
| Engine behavior | `~/lessonos@auto/main` | Runtime subtree is the exact imported snapshot; external `auto/main` is 1450 commits ahead of that split | external owner **VERIFIED-as-canon**; monorepo snapshot **VERIFIED stale**; live Mini SHA/runtime **UNKNOWN** |
| Studio/ToolHost behavior | `~/maestro-studio`; monorepo subtree called stale | Both lineages advanced after import (189 monorepo path commits, 45 external commits) | **UNKNOWN / ARCHITECTURE_RED** |
| ELAB behavior | standalone ELAB lineage | Both lineages advanced; local standalone checkout is dirty and not at current remote `main` | lineage split; no silent overwrite |
| Simulation | extract from ELAB; separate repo is prototype | Monorepo contains a richer `apps/studio/sim` package | package ownership still requires cutover ratification |

## Allowed and blocked lanes

Allowed while `ARCHITECTURE_RED` is live:

- documentation and evidence reconciliation;
- non-product guardrails and discriminating tests;
- removal/quarantine of repository-local credentials with no runtime behavior
  assumption;
- read-only comparison of external heads, deploys, and factory pointers.

Blocked:

- feature implementation based on a guessed behavior repository;
- deleting, archiving, overwriting, or syncing a lineage repo;
- changing factory paths or deployment bindings;
- declaring the monorepo cut over, deployed, PILOT_READY, or V1_GREEN.

## Exit gate for ARCHITECTURE_RED

All are required in one dedicated, human-ratified cutover/ADR slice:

1. Reach the Mini and record its active-repo pointer, exact heads, dirty state,
   running scheduler paths, and gate receipts.
2. Compare external Engine/Studio trees with monorepo packages at symbol and
   test level; commit timestamps alone are insufficient.
3. Select behavioral owners per domain and document rollback/archival policy.
4. Update `CANON-INDEX`, `ARCHITECTURE-CANON`, `ARDESIA-MAP`, factory paths,
   deploy bindings, and drift guards without weakening any gate.
5. Obtain explicit Andrea ratification. No agent may infer it.

Until then, the scientifically correct result is **ARCHITECTURE_RED**, not a
forced choice between stale prose and newer code.
