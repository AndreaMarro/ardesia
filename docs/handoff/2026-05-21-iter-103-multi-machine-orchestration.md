# Orchestrazione multi-macchina — iter 103 (Sprint A: UNBLOCK & CONSOLIDA)

**Data:** 2026-05-21 (per esecuzione domani) · **Sprint:** A · **Iter:** 103
**Mandato:** sbloccare la CI, consolidare 8 PR, ripulire il repo. NO auto-merge, ratifica Andrea per ogni PR.
**Master plan:** `docs/plans/2026-05-21-MASTER-PLAN-iter-103-onwards.md`

## 0. Stringa di attivazione (paste-ready, sessione iter 103)

```
Sei Claude Code, lavori su ELAB Tutor. Working dir: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder (repo AndreaMarro/elab-tutor).

SESSIONE: iter 103, Sprint A-i — CI RECOVERY.

MANDATO ANDREA: NO COMPIACENZA - massima onesta - ferma-e-consolida - NO grind - NO auto-merge - NO push su main - ogni PR ratifica Andrea - NO regressioni - G45 (mai auto-score, lo score lo da una review Opus indipendente). FOCUS + FINISH: un obiettivo per sprint, FINISH prima di NEXT, tagliare e lavoro.

LEGGI PRIMA, in quest'ordine:
1. docs/audits/2026-05-21-iter-103-codex-review-and-revisions.md  <- AUTORITATIVO (corregge il master plan)
2. docs/plans/2026-05-21-MASTER-PLAN-iter-103-onwards.md
3. docs/handoff/2026-05-21-iter-103-multi-machine-orchestration.md
4. docs/prompts/ITER-103-sprint-A-prompts.md

STATO: branch feature/volume-1-experiment-overhaul, 7 commit ahead main, nessun PR. Tree dirty 66 file. Build PASS, 14827 test PASS, zero regressioni. CI: 3 gate rossi (E2E Tests / Quality Gate / Governance Gate) su ogni PR dal 2026-05-12 -> 8 PR (#128-135) bloccati. 1010 branch ref (658 mac-mini bot).

PRIMO ATTO = A-i.1 (NIENTE branch o fix prima): gh run view --log-failed sui 3 run falliti reali. Per ogni gate stabilire: gate rotto vs PR non conforme. NON diagnosticare a memoria (la v1 del piano aveva il file E2E sbagliato).
POI: A-i.2 fix E2E (spec reali 02-vision-flow.spec.js / 13-vision.spec.js) - A-i.3 Quality Gate (bundle vs .test-count-baseline.json bundle_max_kb) - A-i.4 Governance (probabile Regola 5 CHANGELOG). Branch da origin/main, una fix-PR per causa. Codex Pattern V verify PRIMA di ogni commit (lezione iter-82).
GATE A-i: 3 check verdi su PR di prova -> ratifica Andrea. POI A-ii (merge train 8 PR, ordine revision doc S4, #129 ultimo: conflitto UnlimCompileHelper.jsx con #131) e A-iii (pulizia 658 branch).

Connettori: Codex CLI (Pattern V/C), Mac Mini SSH test pesanti, Claude in Chrome smoke prod.
```

---

> Sprint A è in gran parte **sequenziale** (fix CI → consolida → merge train → cleanup).
> L'unico tratto parallelizzabile è la diagnosi+fix dei 3 gate CI (cause indipendenti).
> Questo documento assegna ogni pezzo a una macchina con matrice file-ownership rigida
> per evitare il tangle iter-99.

---

## 1. Macchine e ruoli

| Macchina | Ruolo | Responsabilità Sprint A |
|----------|-------|-------------------------|
| **Claude Desktop** (Mac Andrea) | **Orchestratore** | Guida Sprint A. Dispatcha i 3 fix CI, esegue il merge-train sequenziale, pilota la pulizia branch. Produce audit + handoff. |
| **Codex Desktop** (Mac Andrea) | **Verificatore (Pattern V/C)** | Verifica read-only OGNI fix CI prima del commit. Cross-check del merge plan. GPT-5.5 high. Mai scrive codice prod. |
| **Codex Desktop su Mac Mini** | **Investigatore parallelo** | Diagnosi profonda in parallelo: legge `.github/workflows/`, root-cause dei 3 gate, mentre Claude Desktop prepara i branch. |
| **Mac Mini via SSH** | **Runner pesante** | Esegue `vitest run` completo, E2E Playwright, `build-smoke`. Repo già clonato `~/Projects/elab-tutor`. SSH `progettibelli@100.124.198.59` key `~/.ssh/id_ed25519_elab`. |
| **Andrea** | **Ratificatore** | Ratifica ogni PR. Esegue le azioni a lui riservate (§5). Decisione finale su cancellazione branch di massa. |

---

## 2. Matrice file-ownership (anti-tangle)

Tre fix CI in parallelo. Ownership rigida, branch separati da `origin/main`:

| Atom | Owner | Branch | File di proprietà esclusiva |
|------|-------|--------|------------------------------|
| **A1 — E2E** | Agente 1 (Claude Desktop) | `fix/iter-103-ci-e2e-vision` | `tests/e2e/22-vision-flow.spec.js`, `tests/e2e/helpers/*` |
| **A2 — Quality Gate** | Agente 2 (Claude Desktop) | `fix/iter-103-ci-quality-ratchet` | `scripts/benchmark.cjs`, `automa/state/benchmark.json` (soglie) |
| **A3 — Governance Gate** | Agente 3 (Claude Desktop) | `fix/iter-103-ci-governance` | regola violata (repo file) |

**Punto di coordinamento:** `.github/workflows/*.yml` — A1 e A3 potrebbero entrambi
toccarlo. Regola: **solo A3 modifica i workflow YAML.** A1 modifica solo gli spec di test.
Se A1 ritiene serva un cambio workflow, lo segnala ad A3, non lo fa.

**Worktree isolati:** ogni agente in worktree git separato (Pattern S r3). Merge dei
worktree in `main`-work-branch sequenziale post-CoV. Zero conflitti garantiti dalla ownership.

---

## 3. Timeline Sprint A — fasi

```
FASE 0 — Pre-flight (Claude Desktop + Mac Mini SSH, ~15 min)
  ├─ Claude Desktop: git fetch, verifica stato (8 PR, 1010 branch, tree dirty)
  ├─ Mac Mini SSH:   vitest run completo → baseline 14827 confermata
  └─ Codex Desktop Mac Mini: legge .github/workflows/ → root-cause 3 gate (parallelo)
        │
        ▼
FASE 1 — Sblocco CI (3 agenti paralleli, Claude Desktop, ~2-3h)  ◄── BLOCKER
  ├─ A1 E2E      ──┐
  ├─ A2 Quality  ──┼─ paralleli, worktree isolati, ownership rigida
  └─ A3 Governance┘
        │  ogni fix: Codex Desktop Pattern V verify PRIMA del commit
        ▼
  GATE 1: 3 fix-PR create → CI verde su PR di prova → Andrea ratifica → merge
        │  Mac Mini SSH: vitest + E2E run di conferma
        ▼
FASE 2 — Consolidamento tree + PR vol1 (Claude Desktop, ~30 min)
  ├─ A4 commit chirurgico 60 file dirty (1 commit overhaul + 1 commit docs)
  └─ A5 PR per feature/volume-1-experiment-overhaul
        ▼
FASE 3 — Merge train 8 PR (Claude Desktop sequenziale, Andrea ratifica, ~1-2h)
  └─ A6-A12: #131 → redeploy → #132 → #128 → #130/#133/#134/#135 → #129 (ultimo)
        │  Mac Mini SSH: vitest run tra un merge e l'altro
        ▼
FASE 4 — Pulizia branch (Claude Desktop, ratifica Andrea, ~30 min)
  └─ A13: 39 merged + 658 mac-mini bot → cancellazione di massa post-ratifica
        ▼
FASE 5 — Verifica finale (Claude Desktop + Mac Mini SSH, ~15 min)
  └─ A14: 0 PR aperti · CI verde main · build-smoke 4/4 · compile live HTTP 200
```

**Punto critico:** FASE 1 è il BLOCKER. FASE 2+ NON parte finché GATE 1 non è verde.

---

## 4. Handoff protocol

- **Stato condiviso:** ogni macchina scrive il proprio progresso in
  `automa/team-state/messages/iter103-<macchina>-<fase>.md`.
- **Barriera filesystem:** FASE 2 parte solo dopo i 3 file `iter103-A{1,2,3}-completed.md`.
- **SSH Mac Mini:** Claude Desktop invoca `ssh progettibelli@100.124.198.59 'cd ~/Projects/elab-tutor && git pull && npx vitest run'`.
- **Codex Desktop:** invocato via plugin `/codex:review` o wrapper `scripts/dev/codex-bg.sh`.
- **Mai** due macchine sullo stesso file. Mai push su `main`. Mai auto-merge.

---

## 5. Azioni riservate ad Andrea (iter 103 entrance, ~30 min)

| # | Azione | Tempo |
|---|--------|-------|
| 1 | Ratifica i 3 fix-PR CI dopo verifica verde | 10 min |
| 2 | Ratifica il merge degli 8 PR (uno per uno, o batch) | 10 min |
| 3 | Ratifica la cancellazione di massa dei 658 branch `mac-mini/*` | 2 min |
| 4 | (opzionale) Redeploy Vercel da `main` post-merge #131 | 5 min |
| 5 | Verifica `ELAB_API_KEY` non scaduta + Mac Mini SSH raggiungibile | 5 min |

---

## 6. Comandi pronti (citati, non assunti)

```bash
# Pre-flight
git -C "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" fetch --all --prune
gh pr list --repo AndreaMarro/elab-tutor --state open
ssh progettibelli@100.124.198.59 'cd ~/Projects/elab-tutor && git pull && npx vitest run'

# Diagnosi gate CI
gh run list --repo AndreaMarro/elab-tutor --branch main --limit 5
gh run view <id> --log-failed | tail -120
node scripts/benchmark.cjs --fast

# Fix CI — branch da origin/main
git checkout -b fix/iter-103-ci-e2e-vision origin/main

# Merge train (solo CI verde, ratifica Andrea)
gh pr checks <n> --repo AndreaMarro/elab-tutor
gh pr merge <n> --repo AndreaMarro/elab-tutor --squash --delete-branch

# Pulizia branch (post-ratifica Andrea)
git branch --merged main | grep -v main | xargs -n1 git branch -d
# branch mac-mini: cancellazione remota di massa — script dedicato + ratifica

# Verifica finale
npm run test:build-smoke
curl -s -X POST https://www.elabtutor.school/api/compile/nanor4 \
  -H 'Content-Type: application/json' \
  -d '{"sketchCode":"void setup(){}\nvoid loop(){}"}' -w ' HTTP=%{http_code}\n' -o /dev/null
```

Anti-pattern vietati: `git push origin main` · `--no-verify` · `gh pr merge` con CI rossa
· `vercel --prod` da branch ≠ `main`.

---

## 7. Prompt pronti per gli agenti

I prompt ottimizzati (CoT + success criteria + file-ownership + guard anti-allucinazione)
per A1/A2/A3 e per la verifica Codex sono in:
- `docs/prompts/ITER-103-A1-ci-e2e-fix.md`
- `docs/prompts/ITER-103-A2-ci-quality-ratchet-fix.md`
- `docs/prompts/ITER-103-A3-ci-governance-fix.md`
- `docs/prompts/ITER-103-codex-verify-template.md`

---
*Orchestrazione iter 103 Sprint A — preparazione 2026-05-21 · revisione Andrea pendente*
