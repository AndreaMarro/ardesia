# REPO-MAP

Source: WF1 GitHub deep audit (read-only, 2026-06-25). All 7 repos owned by `AndreaMarro`, all private.

## Classification

- **CANONICAL code:** `ardesia`, `lessonos`, `ardesia-studio`
- **SUPPORT / content:** `ardesia-vault`, `ardesia-tools`, `ardesia-wiki`
- **LEGACY / parallel product:** `elab-tutor`

## Per-repo table

| repo | role | canonical? | default branch | origin (mini) | docs / README |
|---|---|---|---|---|---|
| ardesia | platform hub / monorepo (engine+studio+tools + docs nav) | CANONICAL | `main` | `https://github.com/AndreaMarro/ardesia.git` (GitHub direct) | `docs/` has only `vault`,`wiki` subdirs; README yes |
| lessonos | headless teaching engine ("la fabbrica" / autonomous build) | CANONICAL | `auto/main` | local bare `/Users/progettibelli/lessonos.git` (+ `github` secondary) | `docs/` rich (ARCHITECTURE, eval, plans); README yes |
| ardesia-studio | whiteboard / ToolHost (mini local name `maestro-studio`) | CANONICAL | `main` | local bare `/Users/progettibelli/studio.git` (+ `github=ardesia-studio.git`) | **NO `docs/`**; README yes |
| ardesia-vault | SoT directive hub (markdown directives, handoffs, prompts) | SUPPORT (content) | `main` | — | **NO `docs/`, NO README** |
| ardesia-tools | factory loop tooling (pr-preparer, launchd ratifica) | SUPPORT (code) | `main` | — | **NO `docs/`, NO README** |
| ardesia-wiki | auto-generated wiki snapshot (timestamped auto-dumps) | SUPPORT (generated artifact) | `master` | — | **NO `docs/`, NO README** |
| elab-tutor | older/legacy ELAB product app (React19+Vite+AVR sim+Galileo tutor) | LEGACY / parallel | `main` | — | `docs/` very rich (PDFs, CoV, audits); README yes |

## Notes per repo

- **ardesia** — Bootstrap-additive, history-preserved. Latest commit `2b7c08e` docs(monorepo): README + ARDESIA-MAP. Ships docs via `docs/vault` + `docs/wiki` subfolders (no flat `docs/` files). It is the only mini code repo whose origin points directly at GitHub.
- **lessonos** — Default is `auto/main` (the factory branch); `main` is the ratified line (PR #3 promotes auto/main→main). Latest commit `20560ec` refactor(graph): remove redundant `bin/graph_lint.py` (duplicate of canonical `lessonos.graph.lint`).
- **ardesia-studio** — Only repo with a real CI gate (status check `gate`) on its default branch. Latest commit `839e009` Merge PR #1. No `docs/` folder.
- **ardesia-vault** — Content repo, not code. No README/docs by design but flagged. Latest commit `f0145f6` handoff(19) v2. (Per llm_wiki eval: this is a manual Obsidian vault, "Solo materiale NON sensibile".)
- **ardesia-tools** — Factory loop tooling. Latest commit `0f0a2ba` feat(ratifica): pr-preparer. No README.
- **ardesia-wiki** — Auto-generated wiki snapshot; commits are timestamped auto-dumps. Latest commit `05b924f` ardesia-wiki: aggiornamento auto-timestamp. Default branch `master` is inconsistent with `main`/`auto/main` elsewhere. NOT an llm_wiki install — it is a manual Obsidian vault.
- **elab-tutor** — The pre-ARDESIA product line, now parallel/legacy relative to the ARDESIA platform. Heavily branched (815 branches), many stale PRs (14 open). Latest commit `edb11e8` fix(locales): restore home_compile_v2 keys (#193).

## Docs-status flags

- **No `docs/` and no README** in `ardesia-vault`, `ardesia-tools`, `ardesia-wiki`.
- **No `docs/`** in `ardesia-studio` (README only).
- `ardesia` ships docs only via `docs/vault` + `docs/wiki` subfolders (no flat docs files).
