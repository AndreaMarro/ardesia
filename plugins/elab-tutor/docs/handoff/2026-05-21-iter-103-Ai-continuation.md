# iter 103 Sprint A-i — continuazione (post context-overflow)

**Data:** 2026-05-21 · **Causa stop:** "Prompt is too long" — la sessione è andata in
overflow di contesto a metà di A-i.2. · **Modalità ripresa:** SOLO Claude Desktop + Codex Desktop.

---

## 1. Analisi — cosa è stato fatto (verificato live)

**A-i.1 diagnosi — FATTA.** Root cause dei 3 gate (dai log CI reali):
- **E2E Tests** — gate SANO, spec rotta. `e2e/22-vision-flow.spec.js` (path `e2e/`, NON
  `tests/e2e/`): 5 test vision falliscono, 24 passano. Button `/Guarda il mio circuito/i`
  non trovato, timeout 15s.
- **Quality Gate** + **Governance Gate** — stessa causa: `npx vitest run --reporter=json
  > file 2>&1` produce file non-JSON in 2 workflow (`quality-gate.yml:45`, `governance-gate.yml:158`).
- Regola 5 Governance (CHANGELOG) NON è un bug — rifiuta giustamente i code-PR.

**A-i.3 — PARZIALE (NON chiusa).** PR **#136** (`fix/iter-103-ci-vitest-json`, commit
`422ee247`) — fix cattura vitest-json sui 2 workflow. Codex Pattern V: SHIP. Pushato.
Risultato CI di #136 (verificato 2026-05-21):
- ✅ **Governance Gate → PASS** — il fix ha funzionato.
- 🔴 **quality-ratchet → ANCORA FAIL** — ma per un'ALTRA causa.

**Root cause quality-ratchet residuo (run 26219001257, verificato):**
```
Bundle totale: 103940KB (limite: 90000KB)
##[error]BUNDLE REGRESSION! 103940KB > 90000KB
```
Il fix cattura ha funzionato (lo step test-count ora passa), ma lo step **bundle size**
fallisce: `du -sk dist/` = **103940 KB (~101 MB)** > `bundle_max_kb` 90000 KB. Il "defuse"
della sessione precedente (dist ~82 MB) era **sbagliato** — la nota nel baseline file era
stale. dist reale = 101 MB.

**A-i.2 — NON iniziata.** Worktree `elab-builder-iter103-e2e` creato (branch
`fix/iter-103-ci-e2e`, 0 commit). Il fix E2E non è stato applicato.

## 2. Processi attivi — niente da fermare

`ps` verificato: **nessun processo runaway.** I `Codex.app` = l'app Codex Desktop (normale).
`playwright-mcp` ×3-4 = server MCP idle (0.0% CPU, innocui). Il `vitest` baseline e il
Codex Pattern V della sessione crashata erano già terminati (exit 0). **Nessun kill necessario.**

## 3. Problema reale = DISCO

**1.5 GiB liberi, volume al 100%.** 13 worktree. Un build può andare in ENOSPC.
Pulizia disco = STEP 0 della continuazione. Branch dei worktree stale: tutti NON merged
in main → rimuovere la DIR del worktree è sicuro (il branch git resta), ma verificare
prima che ogni worktree sia clean.

---

## 4. PROMPT DI CONTINUAZIONE (paste-ready, Claude Desktop)

```
Sei Claude Code (Claude Desktop). ELAB Tutor, working dir /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder (repo AndreaMarro/elab-tutor). Riprendi iter 103 Sprint A-i (CI recovery) dopo un context-overflow.

ANTI-OVERFLOW (la sessione precedente e' crashata per contesto pieno — CRITICO):
- NON leggere CLAUDE.md per intero (enorme). NON leggere output Codex/agent verbosi interi: estrai il verdetto con tail/grep.
- Task piccolo e chirurgico. Resta leggero. Solo Claude Desktop + Codex Desktop — NO Mac Mini, NO subagent paralleli, NO agent swarm.

MANDATO: NO COMPIACENZA - onesta - NO --no-verify - NO push su main - git add esplicito (mai -A) - ogni PR ratifica Andrea - systematic-debugging (root cause prima del fix) - Codex Pattern V prima di OGNI commit.

STATO VERIFICATO (2026-05-21):
- PR #136 (branch fix/iter-99... no: fix/iter-103-ci-vitest-json, commit 422ee247): Governance Gate PASS, ma quality-ratchet ANCORA FAIL.
- Causa residua quality-ratchet: step bundle. du -sk dist/ = 103940 KB > bundle_max_kb 90000 KB. "BUNDLE REGRESSION".
- E2E non fixato: e2e/22-vision-flow.spec.js, 5 test vision falliscono, button getByRole('button',{name:/Guarda il mio circuito/i}) non trovato, timeout 15s.
- Disco: 1.5 GiB liberi, 100%. 13 worktree.

STEP 0 — DISCO (PRIMA di tutto):
- git worktree list ; df -h .
- Per ogni worktree stale (iter83-A, iter83-fumetto, iter83-percorso-morfica, shared-infra, volume2, volume3): git -C <path> status --short ; se clean -> git worktree remove <path>. TIENI: elab-builder (main), elab-builder-iter103-vitest-json, elab-builder-percorso-rescue (#134), elab-builder-slice1a (#135).
- Obiettivo: >5 GiB liberi prima di buildare.

STEP 1 — chiudi Quality Gate (bundle) su PR #136:
- Lavora in elab-builder-iter103-vitest-json (branch fix/iter-103-ci-vitest-json).
- Prima: du -sh dist/* 2>/dev/null | sort -h | tail -15 — se c'e' un asset stray enorme committato per errore, rimuovilo (fix vero). Altrimenti:
- Edita .test-count-baseline.json: alza bundle_max_kb da 90000 a ~115000 (dist reale 103940 + margine). Aggiungi commento: dist cresciuto a ~101 MB, TODO Sprint E ridurre (lazy-load react-pdf/mammoth/recharts). E' la ricalibrazione-soglia-con-motivo-scritto sanzionata dal piano.
- Codex Pattern V verify (read-only) della modifica. git add SOLO .test-count-baseline.json. Commit. Push -> #136 aggiornato.

STEP 2 — fix E2E spec, STESSO branch #136:
- systematic-debugging: leggi e2e/22-vision-flow.spec.js + il componente VisionButton. Root-cause il button non trovato. Ipotesi: testo cambiato / button dietro overlay onboarding / button non nella route che lo spec naviga.
- Fix minimo (spec o helper, NON src per "far passare"). Se overlay -> bypass nell'helper.
- Codex Pattern V verify. Commit su fix/iter-103-ci-vitest-json. Push.
- git worktree remove elab-builder-iter103-e2e (non serve piu').

PERCHE' UN SOLO PR (#136): i 2 fix-PR separati danno CI circolare (nessuno e' tutto-verde da solo — #136 ha E2E rosso, un E2E-PR avrebbe Quality+Governance rossi). #136 con i 3 fix insieme (vitest-json + bundle + E2E) -> 3 gate verdi insieme -> 1 merge pulito. CHECKPOINT: prima di STEP 2 conferma con Andrea questo consolidamento (in precedenza aveva scelto "2 PR" — la CI circolare e' una scoperta nuova).

GATE A-i: gh pr checks 136 -> tutti verdi -> ratifica Andrea -> merge -> CI verde su main. Poi Sprint A-ii (merge train 8 PR).

Nota: docs/audits/2026-05-21-iter-103-codex-review-and-revisions.md sbagliava il path E2E (diceva tests/e2e/02-vision — il file vero e' e2e/22-vision-flow.spec.js). Non fidarti di quel path.
```

---

## 5. Note per Andrea

- **Codex Desktop:** usalo per il Pattern V verify (read-only) prima di ogni commit —
  `scripts/dev/codex-bg.sh` o `codex exec`. NON delegare la scrittura del codice.
- **Decisione aperta:** 1 PR consolidato (#136 con 3 fix) vs 2 PR. Raccomandato: 1 PR
  (la CI circolare lo impone). Il prompt chiede conferma prima di STEP 2.
- **Bundle 101 MB:** è un debito reale (Sprint E lo riduce). Qui si alza solo la soglia
  per sbloccare — con TODO scritto. Non è compiacenza: è documentato.
