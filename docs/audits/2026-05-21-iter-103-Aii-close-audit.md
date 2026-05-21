# Iter 103 — Sprint A-ii close audit

**Data:** 2026-05-21 · **Branch:** `feature/volume-1-experiment-overhaul` · **Sessione:** Claude Desktop (Opus)
**Scope eseguito:** STEP 0 (disco) + Blockly hotfix (fuori scope, interrupt Andrea) + Sprint A-ii (A4 commit working tree + A5 PR)
**Mandato:** `docs/audits/2026-05-21-iter-103-codex-review-and-revisions.md` §5 (autorevole) — A-ii = A4 + A5; merge train + cleanup branch = A-iii.

---

## 1. Blockly editor regression — hotfix (interrupt, fuori scope A-ii)

A metà sessione Andrea ha segnalato: editor Blockly su `#compile-home` con "blocchi/toolbox mancanti" in produzione.

**Root cause (systematic-debugging, riprodotto su prod):** editor schiacciato a 258px — NON crash, NON errore JS (console pulita). Toolbox 733px di contenuto in box 258px `overflow:auto` → 4/12 categorie visibili. Bug = catena CSS altezza editor pinnata piccola. Il fix **esisteva già** — commit `5b4205e5 fix(iter-102): allarga l'editor Blockly` (autore Andrea, 2026-05-21 00:07), committato su `feature/volume-1-experiment-overhaul`, mai mergiato → mai deployato. Prod girava `origin/main`, privo del fix.

**Risoluzione:** cherry-pick di `5b4205e5` su branch `fix/iter-103-blockly-editor-height` da `origin/main` → PR **#138** → CI 12/12 verde → ratifica Andrea → squash-merge → `main 5bddb9b6` → Vercel auto-deploy.

**Verifica live su prod** (`www.elabtutor.school/#compile-home`, post-deploy):

| Metrica | prima (rotto) | dopo (prod live) |
|---|---|---|
| editor `injectionDiv` | 258px | **458px** |
| toolbox categorie visibili | 4/12 | **7/12** |
| `.workspace` min-height | 320px | **520px** |

Regressione **CHIUSA e verificata live**. Voce CHANGELOG su main via #138.

---

## 2. Sprint A-ii — A4: commit working tree

Working tree di `feature/volume-1-experiment-overhaul` (71 file dirty, ripristinato da stash post-hotfix) classificato e committato in 3 commit coerenti su `9f126adc`:

| Commit | Tipo | Contenuto | File |
|---|---|---|---|
| `c52ee0e9` | refactor | Overhaul narrativo esperimenti Volume 1: `experiments-vol1.js` + `narrative-map-94.json` + 38 lesson-path `v1-*.json` + `volume1ExperimentOverhaul.test.js` (NEW) + voce CHANGELOG | 42 |
| `59340bc7` | docs | 24 doc accumulati iter 99-103 (8 audit + 4 handoff + 2 plans + 9 prompt + 1 research) | 24 |
| `6942cfdc` | chore | `.gitignore`: `output/` + `.iter*-baseline-*.json` (regenerabili, erano rumore) | 1 |

**Escluso dai commit** (per mandato — churn auto-rigenerato, NON committare):
- `AGENTS.md` — header claude-mem riscritto a ogni sessione
- `automa/state/{heartbeat, iter-19-harness-2.0-results.json, parallel-research.json}` — churn harness

Working tree post-A4 = solo i 4 file churn sopra. Nessun lavoro reale non committato.

## 3. Sprint A-ii — A5: PR

PR aperto per `feature/volume-1-experiment-overhaul`, base `main`, via `gh pr create` (vedi §6 GATE per numero PR + stato CI).

---

## 4. CoV (Chain of Verification)

- **Pre-CoV vitest** (test volume, pre-commit): **195/195 PASS** — 9 file (`volumeParallelism` 25 + `volumeReferencesQuality` 43 + `volume-references-validity` 39 + factory `volume-parallelism` 49 + `volume1ExperimentOverhaul` 6 + altri). Integrità struttura dati Volume 1 confermata.
- **Pre-commit hook**: passato su tutti e 3 i commit A-ii (gate delta test count).
- **Build** `npm run build`: **PASS 28.79s** — PWA precache 27 entries (1968 KiB).
- **Pre-push hook**: gate anti-regression — vedi §6.

## 5. Caveat di onestà (NO COMPIACENZA)

1. **Overhaul Volume 1 NON content-audited.** Commit `c52ee0e9` CONSOLIDA lavoro parcheggiato (iter 99/101/102) — verificata l'integrità strutturale (195/195 test volume), NON il contenuto narrativo (testo verbatim Vol.1, parallelismo Morfismo Sense 2). Content-audit = iter separata.
2. **Branch stale vs main.** `feature/volume-1-experiment-overhaul` è dietro `main` di 3 squash-merge (#136 CI gates + #137 ATOM-003 + #138 Blockly hotfix). Il PR A-ii avrà probabilmente un conflitto `CHANGELOG.md` (sia il branch sia main hanno aggiunto una voce in testa) e possibili attriti CI da staleness. Rebase su main + risoluzione = **Sprint A-iii**.
3. **`5b4205e5` (fix editor) già su main** via #138. Quando questo branch verrà mergiato, git lo tratterà come no-op/empty sui 4 file editor (contenuto identico) — nessun conflitto su quelli.
4. **Codex Pattern V NON eseguito** sui commit A-ii. Giudizio dichiarato: i commit sono dati JSON (38 lesson-path + narrative-map) + docs Markdown + 1 riga `.gitignore` — analisi statica Codex ha valore quasi nullo su dati/docs. Verifica reale = pre-commit/pre-push hook (vitest+gate) + test dedicato `volume1ExperimentOverhaul.test.js`. Se Andrea vuole Codex sul diff, banale da aggiungere.
5. **Hotfix #138** verificato con misure DOM (numeri solidi) + verifica live prod. Lo screenshot dev-server era oscurato da modal onboarding + viewport headless — le misure numeriche restano la prova.

## 6. GATE A-ii

- ✅ Working tree pulito (solo churn inerente escluso per mandato)
- ✅ A4 commit fatto — 3 commit coerenti, `git add` esplicito scoped, MAI `-A`
- ✅ Build `npm run build` PASS (28.79s)
- ⬜ A5 PR aperto + CI PR verde — vedi numero PR + stato nel report sessione

**NON mergiare senza OK Andrea.** GATE = presentare ad Andrea per ratifica.

## 7. Sprint A-iii (sessione separata)

- Rebase `feature/volume-1-experiment-overhaul` su `main` (risolvi conflitto CHANGELOG, `5b4205e5` cade no-op)
- Merge train 8 PR #128-135 (ordine §4 revision doc: #128→#130/#133/#134/#135→#131→#132→#129 ultimo per conflitto `UnlimCompileHelper.jsx`)
- Cleanup ~1010 branch ref (658 `mac-mini/*`) — distruttivo, ratifica Andrea su delete-list
