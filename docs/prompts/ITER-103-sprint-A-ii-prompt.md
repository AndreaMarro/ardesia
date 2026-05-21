# ITER 103 — Sprint A-ii — Prompt di attivazione

**Data:** 2026-05-21
**Stato:** Sprint A-i CHIUSO — CI di `main` sbloccata. PR #136 (bundle 90k→115k + E2E test.fixme + vitest-json capture) e #137 (ATOM-003 vision-recoverage tracker) squash-merged. main HEAD = `425c8402`, CI verde.
**Scopo:** prompt paste-ready per una sessione Claude Desktop NUOVA che esegue Sprint A-ii (consolidamento).
**Autoritativo:** `docs/audits/2026-05-21-iter-103-codex-review-and-revisions.md` definisce lo split A-i/A-ii/A-iii + ordine merge + conflitto #129↔#131 — la sessione lo legge per primo.
**Cross-link:** master plan `docs/plans/2026-05-21-MASTER-PLAN-iter-103-onwards.md` §5 (atom A4-A14).

Copia il blocco sotto in una sessione Claude Desktop nuova:

```
Sei Claude Code (Claude Desktop). ELAB Tutor, working dir /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder (repo AndreaMarro/elab-tutor). Riprendi iter 103 — Sprint A-ii (consolidamento). Sprint A-i (sblocco CI) e' CHIUSO.

ANTI-OVERFLOW (sessione prep gia' crashata una volta per contesto pieno — CRITICO):
- NON leggere CLAUDE.md per intero. NON leggere output Codex/agent verbosi interi: estrai il verdetto con tail/grep.
- Task piccolo e chirurgico. Resta leggero. Solo Claude Desktop + Codex Desktop — NO Mac Mini, NO subagent paralleli.

MANDATO: NO COMPIACENZA - onesta - NO --no-verify - NO push diretto su main - git add esplicito (mai -A) - ogni PR ratifica Andrea - systematic-debugging (root cause prima del fix) - Codex Pattern V prima di OGNI commit (scripts/dev/codex-bg.sh; se Codex si impicca su stdin rilancia con `< /dev/null`).

STATO VERIFICATO (2026-05-21, Sprint A-i CHIUSO):
- CI di main VERDE. PR #136 (bundle_max_kb 90k->115k + E2E test.fixme + vitest-json capture) squash-merged -> main commit 4169663e. PR #137 (ATOM-003 vision-recoverage tracker) squash-merged -> main commit 425c8402. origin/main HEAD = 425c8402.
- E2E `e2e/22-vision-flow.spec.js`: il describe block e' `test.describe.fixme` (5 test vision NON girano — VisionButton e' dead code, un-wired iter 39 commit aad961d3). Tracking: automa/tasks/pending/ATOM-003-vision-e2e-recoverage.md. NON e' un fix reale — recoverage rimandato.
- Branch `feature/volume-1-experiment-overhaul`: ~60 file dirty non committati + 7 commit ahead di main, SENZA PR.
- 8 PR aperti #128-135 — erano MERGEABLE/UNSTABLE con CI rossa. Ora CI verde su main MA main si e' spostato (#136+#137) → ogni PR probabilmente va rebasato. Da verificare con `gh pr checks`.
- ~1010 branch ref (658 `mac-mini/*` bot da pulire).
- Disco STRETTO (~1.6 GiB liberi a fine A-i). Worktree `elab-builder-iter103-vitest-json` ora mergiato (rimovibile). 4-5 worktree dirty da TENERE (shared-infra, volume2, volume3, iter83-fumetto, iter83-percorso-morfica).
- claude-mem corpus STALE (Apr 28) — mem-search inutile per iter 103. Fonte vera = i doc del piano.

STEP 0 — DISCO:
- `git worktree list` ; `df -h .`
- `git worktree remove` (non-force, si rifiuta se dirty) il worktree `elab-builder-iter103-vitest-json` (gia' mergiato in #136). Libera spazio.

STEP 1 — LEGGI I DOC AUTOREVOLI (prima di toccare codice):
- `docs/audits/2026-05-21-iter-103-codex-review-and-revisions.md` — AUTOREVOLE. Definisce lo split A-i/A-ii/A-iii, l'ordine merge reale, e il conflitto reale #129<->#131 su `UnlimCompileHelper.jsx`. In conflitto, QUESTO doc vince sul master plan §5. Se non esiste, usa master plan §5 con cautela.
- `docs/plans/2026-05-21-MASTER-PLAN-iter-103-onwards.md` §5 — atom A4-A14 (reference).
- `docs/plans/2026-05-20-iter-102-consolidation-plan.md` — piano consolidamento 7 fasi.
Questi doc sono sul branch `feature/volume-1-experiment-overhaul`, NON su main.

STEP 2 — ESEGUI SOLO gli atom che il revision doc assegna a Sprint A-ii. Ferma al GATE A-ii. A-iii = sessione separata.
A-ii molto probabilmente = A4 + A5:
- A4 — committare il working tree dirty di `feature/volume-1-experiment-overhaul` in modo chirurgico: experiment overhaul vol1 (41 lesson-path + experiments-vol1.js + narrative-map-94.json) = 1 commit coerente; doc untracked = 1 commit docs; `automa/state/*` churn = NON committare; `output/` = valutare `.gitignore`. git add esplicito file per file, MAI -A.
- A5 — aprire UN PR pulito per `feature/volume-1-experiment-overhaul` (7 commit iter-99/101/102 + overhaul, oggi senza PR), base `main`, via `gh pr create`.
Il merge degli 8 PR #128-135 (A6-A12, ordine #131->#132->#128->#130/#133/#134/#135->#129 ultimo) + cleanup branch 1010->~50 (A13, distruttivo, ratifica Andrea) = Sprint A-iii, NON questa sessione — a meno che il revision doc dica diversamente.
- Codex Pattern V prima di ogni commit. CoV: `npx vitest run` prima/dopo (3x se dichiari "test passano"). `npm run build` deve passare.

GATE A-ii: working tree di `feature/volume-1-experiment-overhaul` pulito + PR aperto + CI del PR verde -> presenta ad Andrea per ratifica. NON mergiare senza OK.

Note:
- semgrep PostToolUse hook fallisce "No SEMGREP_APP_TOKEN" — rumore ambientale noto, non bloccante, ignora.
- NON auto-mergiare. NON partire con A-iii senza chiudere A-ii + ratifica.
```

## Caveat onesti su questo prompt

- **A-ii = A4+A5 è una stima.** Lo split esatto A-ii/A-iii sta nel revision doc — per quello STEP 1 lo legge per primo e lo dichiara autoritativo.
- I numeri ("8 PR #128-135", "~60 file dirty", "~1010 branch", "7 commit ahead") vengono dal master plan §1 (stato 2026-05-21 mattina) — possono essere shiftati: il prompt dice "verificare".
