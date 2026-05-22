# Piano consolidamento iter-102 — 7 PR + cross-compile + CI rosso

Data: 2026-05-20 · Autore: Claude (orchestratore) · Mandato Andrea: **NO COMPIACENZA, CI deve passare, no push diretto su main.**

Piano in fasi, eseguibile in contesti separati. Ogni fase è autonoma.

---

## Phase 0 — Stato accertato (discovery completata)

Fatti verificati, non assunti:

### 7 PR aperti su `AndreaMarro/elab-tutor` (tutti `MERGEABLE/UNSTABLE`, base `main`)

| PR | Branch | Δ | Contenuto | Conflitto previsto |
|----|--------|---|-----------|--------------------|
| #131 | `fix/iter-99-compila-onesta` | +280/−127, 10f | Cross-compile Nano R4 onesta (iter-99 + iter-101) | con #129 (file compile) |
| #132 | `feat/percorso-morfico-runtime` | +3101/−13, 14f | Modalità Percorso morfica (Sense 1.5) | nessuno (file `lavagna/` disgiunti) |
| #128 | `docs/iter-99-claude-md-archive` | +3588/−3513, 3f | CLAUDE.md 4079→568 righe | con chiunque tocchi CLAUDE.md |
| #129 | `fix/iter-99-review-medium-followups` | +114/−23, 6f | MEDIUM follow-up da review 7-PR | con #131 (file compile) |
| #130 | `docs/fase4-mblock-handoff-plan` | +211/−0, 1f | Handoff mBlock R3-R14 | nessuno (doc nuovo) |
| #133 | `docs/open-design-percorso-pilot` | +1198/−0, 5f | Open Design pilot Percorso | nessuno (doc nuovo) |
| #134 | `docs/repo-navigability` | +229/−20, 3f | Quality audit + README mappa | basso (README) |

### 🔴 BLOCKER: CI sistemica rossa

`gh pr view` rollup — **identico su #131, #132, #128** (quindi rosso anche su `main`):

| Check | Esito |
|-------|-------|
| Vercel / Vercel Preview Comments | ✅ SUCCESS |
| coverage-comment / security | ✅ SUCCESS |
| **Verify governance rules 0-5** | 🔴 **FAILURE** |
| **quality-ratchet** | 🔴 **FAILURE** |
| **test** | 🔴 **FAILURE** (≥1 job; un secondo job `test` passa → matrix shard) |
| build / check-safe-paths / auto-merge | ⏭ SKIPPED |

`UNSTABLE` (non `BLOCKED`) = GitHub permette tecnicamente il merge perché i check rossi non sono *required*. **Ma il mandato Andrea + CLAUDE.md «CI deve passare prima del merge» = non si merge con CI rossa.** Pre-esistente: handoff iter-83 §7 cita «P0 CI E2E pre-existing fail dal 12/05».

### Stato produzione

- Prod serve `2a700bf1` = branch `fix/iter-99-compila-onesta` (PR #131) = `origin/main` `5e2573fa` + 2 commit, **0 dietro**. Forward deploy legittimo (NON regressione tipo iter-83).
- Drift: prod gira un branch ≠ `main`.
- Cross-compile Nano R4 verificata live: `POST /api/compile/nanor4` → HTTP 200, `ok:true`, `fqbn:arduino:renesas_uno:nanor4`, hex 109863 byte. Funziona.

### Allowed APIs / strumenti (citati, non assunti)

- `gh pr merge <n> --squash --repo AndreaMarro/elab-tutor` — merge via PR (mai push diretto).
- `gh pr checks <n>` — stato CI per PR.
- `gh run list --workflow=<file> --branch=main` / `gh run view <id> --log-failed` — diagnosi workflow.
- `npx vitest run` — baseline test locale (fonte: CLAUDE.md «Anti-regressione»).
- `npm run test:build-smoke` — smoke bundle compilato (fonte: README §«Built-bundle smoke test»).
- `node scripts/benchmark.cjs` — score oggettivo, alimenta `quality-ratchet` (fonte: CLAUDE.md §Benchmark).
- `vercel promote <dpl>` / `vercel --prod` — deploy (fonte: README §Deploy).
- Anti-pattern: NON `git push origin main`, NON `--no-verify`, NON `gh pr merge` con CI rossa.

---

## Phase 1 — Sbloccare la CI (PREREQUISITO: niente merge finché non verde)

**Obiettivo:** `test`, `quality-ratchet`, `Verify governance rules 0-5` verdi su `main`.

Le 3 failure sono pre-esistenti su `main`, NON introdotte dai PR. Vanno diagnosticate e corrette **una fix-PR per causa**, branch da `origin/main`.

### 1.1 — Diagnosi `test`

```bash
gh run list --repo AndreaMarro/elab-tutor --branch main --workflow test --limit 3
gh run view <id> --log-failed | tail -120
```
Localmente vitest passa (14834 PASS, sessione 2026-05-20). Quindi la failure CI è probabilmente E2E Playwright o un job matrix. Identificare il job esatto e i test rotti.

- **Verifica:** il check `test` diventa COMPLETED/SUCCESS su una PR di prova basata su `origin/main`.
- **Anti-pattern:** NON disabilitare il job. NON marcare `xfail` senza causa accertata e data di rimozione.

### 1.2 — Diagnosi `quality-ratchet`

```bash
node scripts/benchmark.cjs --fast    # legge cache artifact
gh run view <id> --log-failed        # quale metrica sotto soglia
```
Il ratchet fallisce se una metrica regredisce sotto la soglia salvata. Trovare la metrica, decidere: correggere la regressione o ricalibrare la soglia (con motivazione scritta).

- **Verifica:** `quality-ratchet` COMPLETED/SUCCESS.
- **Anti-pattern:** NON alzare la soglia per «far passare» senza giustificazione tecnica.

### 1.3 — Diagnosi `Verify governance rules 0-5`

```bash
gh run view <id> --log-failed   # quale delle regole 0-5
ls .github/workflows/ | grep -i govern
```
Workflow di governance. Capire quale regola viola `main` e correggere il workflow o il repo.

- **Verifica:** `Verify governance rules 0-5` COMPLETED/SUCCESS.

### Gate Phase 1

```bash
gh pr checks <PR-di-prova>   # 3 check ex-rossi ora verdi
```
Finché questo gate non passa, **Phase 2+ è bloccata.**

---

## Phase 2 — Consolidare cross-compile + morfismo (#131, #132)

Eseguire SOLO dopo Phase 1 verde.

### 2.1 — Merge #131 (cross-compile)

`#131` è già in produzione, 0 commit dietro, rischio minimo. Merge per primo: riconcilia `prod == main`.

```bash
gh pr checks 131 --repo AndreaMarro/elab-tutor   # tutti verdi?
gh pr merge 131 --repo AndreaMarro/elab-tutor --squash --delete-branch
```

- **Verifica:** `git fetch && git log origin/main -1` mostra il commit di #131. Cross-compile ancora live: `curl -s -X POST https://www.elabtutor.school/api/compile/nanor4 -d '{"sketchCode":"void setup(){}\nvoid loop(){}"}' -H 'Content-Type: application/json' -w '%{http_code}'` → 200.

### 2.2 — Redeploy prod da `main`

```bash
git checkout main && git pull
npm run test:build-smoke      # 4 route critiche (README §smoke)
npm run build && npx vercel --prod --yes
```

- **Verifica:** Vercel `get_deployment` alias `www.elabtutor.school` → commit == `main` HEAD. Drift eliminato.
- **Anti-pattern:** NON `vercel --prod` da un branch ≠ `main` (causa regressione iter-83).

### 2.3 — Merge #132 (morfismo)

File `src/components/lavagna/` disgiunti da #131 → nessun conflitto.

```bash
gh pr checks 132 && gh pr merge 132 --repo AndreaMarro/elab-tutor --squash --delete-branch
```

- **Verifica:** `vitest run` su `main` post-merge, 0 fail vs baseline `automa/baseline-tests.txt`.

---

## Phase 3 — Consolidare doc PR (#128, #130, #133, #134)

### 3.1 — Merge #128 (CLAUDE.md 4079→568)

Merge presto: superficie di conflitto piccola ora (#131/#132 non toccano CLAUDE.md). Se #128 slitta, ogni append a CLAUDE.md lo fa divergere.

```bash
gh pr checks 128 && gh pr merge 128 --repo AndreaMarro/elab-tutor --squash --delete-branch
```

### 3.2 — Merge #130, #133, #134 (doc puri)

Doc nuovi / README. Rebase banale. Qualsiasi ordine.

```bash
for pr in 130 133 134; do gh pr checks $pr && gh pr merge $pr --repo AndreaMarro/elab-tutor --squash --delete-branch; done
```

- **Verifica:** `gh pr list --state open` → solo #129 rimane.
- **Anti-pattern:** NON eseguire `claude-md-improver` prima del merge #128 (handoff 2026-05-20 §7: conflitto certo).

---

## Phase 4 — Merge #129 (medium follow-up) per ultimo

#129 tocca i file compile = conflitto con #131 già merged. Va rebasato per ultimo.

```bash
git fetch origin
git checkout fix/iter-99-review-medium-followups && git rebase origin/main
# risolvere conflitti su file compile (NON scartare modifiche #131)
git push --force-with-lease
gh pr checks 129 && gh pr merge 129 --repo AndreaMarro/elab-tutor --squash --delete-branch
```

- **Verifica:** `gh pr list --state open` → 0 PR. `vitest run` 0 fail.
- **Anti-pattern:** NON `git push --force` nudo (usare `--force-with-lease`).

---

## Phase 5 — Fix bug `memory.flashPercent` (repo Render `elab-cloud-compile`)

**NON in `elab-tutor`.** Il proxy `api/compile/nanor4.js` inoltra soltanto; la risposta `{memory:{flashPercent}}` è generata dal servizio Render.

Bug: `memory.flashBytes` = dimensione file `.hex` ASCII (Intel HEX, 109863 byte) invece del binario reale (~39008 byte). `flashPercent` sovrastima ~2.8× (riporta 42%, reale ~15%).

Fix: il servizio Render deve parsare lo stdout di `arduino-cli` (`Sketch uses N bytes (X%) ... Maximum is 262144 bytes`) per i byte reali di flash, non `hex.length`.

- **Verifica:** `POST /api/compile/nanor4` con un Blink → `memory.flashPercent` ≈ 15, non 42.
- **Anti-pattern:** NON «correggere» dividendo per una costante magica; parsare lo stdout reale.

---

## Phase 6 — Latency warm-up + hook anti-deploy

### 6.1 — Warm-up cron compile

Cold start 36s (test live iter-102). Bambino clicca «Compila» → 36s d'attesa.

- Cron Vercel (`vercel.ts` `crons`) o pg_cron Supabase: HEAD/ping a `/api/compile/nanor4` ogni ~10 min.
- In parallelo: stato UI «Preparo il compilatore…» con aspettativa esplicita sul primo compile.
- **Verifica:** secondo compile entro pochi minuti dal warm-up < 5s.

### 6.2 — Hook `guard-deploy-stale-branch`

Gemello di `guard-deploy-unlim-chat` (handoff iter-83 §8). PreToolUse matcher Bash: blocca `vercel --prod` se il branch corrente ≠ `origin/main` o è dietro di N commit.

```bash
# scripts/agents/guard-deploy-stale-branch.sh
# legge tool_input.command, regex /vercel.*--prod/
# git rev-list --count origin/main..HEAD  + left-right
# se behind>0 OR branch!=main → permissionDecision:"ask"
```
Wire in `.claude/settings.json` PreToolUse Bash. Avrebbe intercettato la regressione iter-83.

- **Verifica:** simulare `vercel --prod` da un branch dietro → hook risponde `ask`.

---

## Phase 7 — Verifica finale

```bash
gh pr list --repo AndreaMarro/elab-tutor --state open     # 0 PR aperti
git fetch && git log origin/main -1                        # tutto consolidato
gh run list --branch main --limit 1                        # CI verde su main
npm run test:build-smoke                                   # 4 route OK
curl -s -X POST https://www.elabtutor.school/api/compile/nanor4 \
  -H 'Content-Type: application/json' \
  -d '{"sketchCode":"void setup(){}\nvoid loop(){}"}' -w ' HTTP=%{http_code}\n' -o /dev/null
```

Checklist chiusura:
- [ ] CI verde su `main` (3 check ex-rossi)
- [ ] 7 PR merged/closed
- [ ] prod deployment commit == `main` HEAD (no drift)
- [ ] cross-compile Nano R4 live HTTP 200
- [ ] `flashPercent` corretto (repo Render)
- [ ] warm-up cron attivo
- [ ] hook `guard-deploy-stale-branch` attivo

---

## Ordine di esecuzione (riassunto)

```
Phase 1 (CI verde)  ──BLOCKER──►  Phase 2 (#131→deploy→#132)
                                       │
                                       ▼
                                  Phase 3 (#128, #130/#133/#134)
                                       │
                                       ▼
                                  Phase 4 (#129 rebase, ultimo)

Phase 5 (Render flashPercent) — parallelo, repo diverso
Phase 6 (warm-up + hook)      — parallelo, indipendente
Phase 7 (verifica finale)     — dopo 1-4
```

## Disciplina (lezione 7-PR aperti)

7 PR aperti = debito accumulato su più sessioni: PR aperti più veloce di quanto si chiudano. Regola: non aprire un nuovo PR finché la CI di `main` è rossa. Un PR aperto su CI rossa non è «lavoro fatto» — è lavoro che non si può integrare.
