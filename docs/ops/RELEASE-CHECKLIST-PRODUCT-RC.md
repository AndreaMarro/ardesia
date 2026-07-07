# RELEASE CHECKLIST — PRODUCT RC — ARDESIA/ELAB

Checklist verificabile per dichiarare una Release Candidate di prodotto. Ogni voce ha il
comando ESATTO e il criterio di pass. Regola d'oro CoV: **mai pipe di vitest/playwright a
`tail`/`head`** (maschera l'exit code) — cattura l'exit code direttamente.

Baseline di riferimento (2026-07-15, main `755179c8`): tsc 0 · vitest 1276 pass/5 skip ·
pytest 2044 pass/7 skip · build 0.

## 0. Prerequisiti

- [ ] Worktree PULITA da `origin/main` (mai il checkout principale, che è sporco):
  ```bash
  git -C "<repo>" worktree add "<repo>-wt-rc" origin/main
  cd "<repo>-wt-rc"
  ```
- [ ] Dipendenze presenti (senza rete in CI locale usare cache):
  ```bash
  npm --prefix apps/studio ci --no-audit --no-fund
  ```

## 1. Typecheck (unica fonte di verità: tsc -b)

> vitest/esbuild NON typecheckano (`erasableSyntaxOnly` → false-green). Solo `tsc -b` conta.

- [ ] ```bash
  npm --prefix apps/studio run typecheck   # = tsc -b --noEmit
  ```
  **Pass**: exit 0, zero errori.

## 2. Test unit/integration studio (profilo deterministico, identico a CI)

- [ ] ```bash
  cd apps/studio && npx vitest run \
    --pool=threads --maxWorkers=1 --no-file-parallelism \
    --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
  ```
  **Pass**: exit 0; conteggio ≥ baseline (1276 pass / 5 skip alla data di questo doc — aggiornare
  qui il numero quando cresce, mai accettare decrescite non spiegate).
  Flake noto: `src/__tests__/Welcome.test.tsx` sotto carico macchina — un timeout isolato lì va
  ri-eseguito singolo prima di dichiarare rosso.

## 3. Test engine (pytest)

- [ ] ```bash
  env -u KIMI_API_KEY -u DEEPSEEK_API_KEY uv --directory packages/engine run pytest -q --no-header
  ```
  **Pass**: exit 0 (2044 pass / 7 skip alla data di questo doc; i test live si auto-skippano
  senza API key — le key vanno RIMOSSE dall'env, come fa `bin/monorepo.sh:106`).

## 4. Build produzione

- [ ] ```bash
  npm --prefix apps/studio run build   # = tsc -b && vite build
  ```
  **Pass**: exit 0.

## 5. Playwright e2e (locale-first — NON coperto da CI: obbligatorio a mano per RC)

- [ ] ```bash
  cd apps/studio && npx playwright test
  ```
  **Pass**: exit 0 **oppure** soli rossi già caratterizzati. Rosso noto pre-esistente:
  `e2e/montaggio-canvas.spec.ts:51` (click `bb1:i9` intercettato dal canvas Excalidraw, da NOTTE-10).
  Qualunque rosso NUOVO = blocco RC.

## 6. Overlay strutturali (regen + drift check)

- [ ] ```bash
  cd apps/studio && npx tsx scripts/visual-overlay-report.ts
  git status --porcelain docs/ops/overlays/
  ```
  **Pass**: nessun file modificato dopo la regen (i report committati sono drift-guarded da
  `VisualOverlayReport.test.ts`; una diff = qualcuno ha cambiato scena/grader senza rigenerare).

## 7. Igiene repo (stessi comandi del job CI `hygiene`)

- [ ] NUL scan (corruzione Write/NUL nei file di testo tracciati):
  ```bash
  python3 bin/ci/nul_scan.py
  ```
  **Pass**: exit 0.
- [ ] Secret scan (pattern high-confidence: chiavi private, AKIA, gh/xox/sk- token…):
  ```bash
  python3 bin/ci/secret_scan.py
  ```
  **Pass**: exit 0.
- [ ] Boundary gate ELAB (ratchet superficie standalone + zero-tolleranza `packs/`):
  ```bash
  python3 bin/ci/elab_boundary_gate.py
  ```
  **Pass**: exit 0.
- [ ] Whitespace/conflitti (esclude il vendored engine):
  ```bash
  git diff --check
  ```
  **Pass**: output vuoto, exit 0.
- [ ] No-PII (manuale, nessuno scanner dedicato esiste): review della diff per email, nomi
  studenti, contenuto testuale dei volumi (ammessi SOLO path/pagina/hash).

## 8. Preview readiness (gate no-deploy)

- [ ] ```bash
  bash -n bin/monorepo.sh && npm run preview:studio:check
  ```
  **Pass**: exit 0 (stesso gate di `.github/workflows/studio-preview-readiness.yml`).

## 9. Verifica funzionale minima di prodotto (smoke a mano, definizione RC)

- [ ] Lavagna: crea room, disegna, inserisci post-it `sim`/`sim esp2`/`sim esp3`, verifica
  verdetti (esp1 ≈14.9 mA, esp2 BRUCIATO), console browser pulita (0 errori).
- [ ] ElabLab (`?vista=elab-lab`): picker con gli 8 esperimenti visibili; canvas plugin renderizza
  con colori CORRETTI (nessuna silhouette nera — cfr. audit §1.10).
- [ ] Cruscotto (`?vista=cruscotto`): zone renderizzate senza errori; stats coerenti con gli
  eventi presenti (oggi attese a 0 finché manca il producer lesson.started — cfr. audit §1.5).
- [ ] Recap/Replay: esporta `.lesson`, riapri recap, scrub del replay con audio.
- [ ] Viewport: verifica manuale (o spec dedicata) a 768x1024 (iPad portrait) e 1920x1080 (LIM).

## 10. Merge protocol (per OGNI PR che entra nella RC)

- [ ] CI verde su TUTTI i check + stato MERGEABLE/CLEAN, poi:
  ```bash
  bin/pr-merge-verify.sh <numero-pr> [worktree-di-verifica-pulita]
  ```
  **Pass**: merge-commit eseguito E suite completa verde su `origin/main` aggiornato nella
  worktree di verifica (un rosso post-merge = conflitto semantico: FERMARSI).
- [ ] Verifica albero (anti false-green): la worktree di certificazione deve essere IDENTICA a
  `origin/main` (`git diff origin/main --stat` vuoto) prima di dichiarare i numeri.

## 11. Regole dure di sessione (sempre)

- [ ] MAI `git add -A` (vault Syncthing) — aggiungere SOLO i file previsti dalla PR, per path.
- [ ] MAI editare `apps/studio/sim/solver/{engine,components}` (sha256 drift-guard).
- [ ] MAI push su `main`; branch + PR + `pr-merge-verify.sh`.
- [ ] Claim nei doc/PR solo se verificati firsthand (vietato "recall migliorato" e simili).
