# Iter-99 → sessione successiva — Handoff & Contesto

> **STEP 0 — context recovery**: leggi QUESTO file + i file in §9 PRIMA di lavorare.
> Stato verificato empiricamente 2026-05-20. Regola: G45 anti-inflation, NO
> compiacenza, CONFIRMED vs INFERRED marcati. Questo file è autosufficiente: è il
> punto di ripartenza canonico per Claude e per Codex.

---

## 1. TL;DR — dove siamo
- **iter-99 = consolidamento** post Ralph Loop runaway (loop infinito fermato).
- Fase 1 (fix CI) ✓ · Fase 2 (triage PR) ✓ · Fase 3 (doc) ✓ ·
  **Fase 4 (mBlock R3-R14) ⏳ pianificata, non iniziata**.
- `main` HEAD = **`5e2573fa`**. CoV **verde** (build PASS, vitest ~14800 pass,
  0 regressione di codice).
- Produzione live = `main` (`www.elabtutor.school` + `elab-builder.vercel.app`).
- **3 PR aperte** attendono ratifica Andrea: #128, #129, #130. **NO auto-merge.**
- **Prossimo P0 = #19 "Compila onesta"** (lato codice) → poi deploy cloud-compile
  → poi Fase 4.

---

## 2. Obiettivi (gerarchia)
1. **Mission mBlock** — cross-compilazione C++-first per Arduino Nano R4
   perfettamente funzionante dal browser (Blockly + IDE). Exit criteria: §8 di
   `docs/prompts/RALPH-LOOP-mBlock-elab-nanor4-mission.md`.
2. **iter-99 consolidamento** — Fase 1-3 fatte; Fase 4 = mission mBlock R3-R14
   controllata (1 atomo = 1 PR, NO loop).
3. **P0 pre-R3** — rendere onesta la "Compila" di produzione (#19) PRIMA di
   toccare R3.

---

## 3. Stato corrente verificato (2026-05-20)
| Voce | Stato |
|---|---|
| git | `main` @ `5e2573fa`. Working tree: header copyright CSS + rumore auto-state (NON committare) + i doc nuovi di questa sessione |
| CoV vitest | full-run 14798/14828 pass; 4 fail re-verificati ambientali (timeout sotto load 87) → **~14802 effettivi, 0 regressione di codice** |
| CoV build | **PASS** (exit 0, "built in 26m 30s", PWA 27 entries) |
| Prod Vercel | `dpl_A3q9pEsF1bnBS6h8V8mGXwKQVaHD` @ `5e2573fa`, project `elab-tutor` |
| #19 Compila | **finta CONFERMATA su prod live** — vedi §5 |

---

## 4. PR aperte — stato (NO auto-merge: Andrea ratifica ognuna)
| PR | Titolo | Branch | File principali |
|---|---|---|---|
| #128 | archivia sprint history CLAUDE.md (4079→568) | `docs/iter-99-claude-md-archive` | `CLAUDE.md`, `docs/plans/2026-05-20-iter-99-consolidation-backlog-plan.md`, `docs/sprint-history-iter3-82-archive.md` |
| #129 | MEDIUM follow-up (Codex-verificata pulita) | `fix/iter-99-review-medium-followups` | `virtualSerialInterpreter.js`, `VirtualSerialMonitor.jsx/.module.css`, `UnlimCompileHelper.jsx` + 2 test |
| #130 | piano handoff Fase 4 mBlock R3-R14 | `docs/fase4-mblock-handoff-plan` | `docs/plans/2026-05-20-fase4-mblock-R3-R14-handoff.md` |

⚠️ **I 2 file di piano NON sono su `main`** — vivono dentro le PR #128 e #130.
Per leggerli senza merge: `git show <commit>:<path>` (Fase 4 = commit `1e6c9990`).

7 PR già merge questa sessione (#118, #120-#123, #126, #127). #59/#60 chiuse.

---

## 5. Bug #19 "Compila finta" — causa radice CONFERMATA
Dettaglio completo: `docs/audits/2026-05-20-iter-99-consolidation-session-audit.md` §4.

- Prod `#compile-home` → click "Compila" su sketch Blink → mostra
  **"Compilato — 1.2 KB / 256 KB (0%)"** + "Compilazione riuscita ragazzi!".
- Catena `compileCode()` (`api.js`):
  1. `/api/compile/nanor4` → **503** `cloud_compile_not_configured`
     (`ELAB_CLOUD_COMPILE_URL` non settata in Vercel) → fallback.
  2. `compile-proxy` (Edge Function) → inoltra `{ code }` **senza `fqbn`** al
     webhook **n8n**.
  3. n8n compila col **core AVR legacy** → NON supporta Renesas RA4M1.
- ⇒ "1.2 KB" = compile **reale ma per la scheda SBAGLIATA** (AVR ATmega328 ≈ 1 KB).
  Un Blink reale per Nano R4 ≈ **39 KB**. Il frontend etichetta l'artefatto AVR
  contro i 256 KB del Nano R4.
- `HomeCompileEntry.jsx` + `api.js` `compileCode()` = **corrieri onesti**, nessun
  hardcode.
- Impatto: dichiarare successo Nano R4 per un artefatto AVR è ingannevole (un hex
  AVR su Nano R4 reale non funziona). Viola il Principio Zero.

---

## 6. Roadmap — priorità prossima sessione
### 🔴 P0 — #19 "Compila onesta" (lato codice) — ATOMO per Codex/Claude
Non dipende da Andrea. La UI NON deve dichiarare "Compilazione riuscita per
Nano R4" quando il risultato proviene dal fallback AVR/n8n. **Prompt pronto**:
`docs/prompts/CODEX-DESKTOP-iter-99-continuation.md`.

### 🔴 P0b — deploy `infra/cloud-compile/` su Render (azione ANDREA) — fix VERO #19
Render: New Web Service, repo `elab-tutor`, rootDir `infra/cloud-compile`, Docker,
Starter ~$7/mo, Frankfurt. Poi env Vercel `ELAB_CLOUD_COMPILE_URL` +
`ELAB_CLOUD_COMPILE_API_KEY` → redeploy. Codice già pronto. Chiude #19 alla radice
(cross-compilazione Renesas reale).

### 🟡 P1 — ratifica PR #128 / #129 / #130 (azione ANDREA)

### 🟢 P2 — Fase 4 mBlock R3-R14 (controllata: 1 atomo = 1 PR, NO loop)
Dettaglio R3-R14: `docs/plans/2026-05-20-fase4-mblock-R3-R14-handoff.md` (in PR
#130, commit `1e6c9990`). **Iniziare R3 SOLO dopo che #19 (P0) è chiuso.**

---

## 7. Regole ferree (mission + mandato Andrea — NON violabili)
- **1 atomo = 1 branch da `main` = 1 PR.** NO auto-merge: Andrea ratifica OGNI PR.
- NO push diretto su `main`. NO `--no-verify`. NO modifiche security/admin senza
  Andrea.
- **Codex Pattern V/C + code-reviewer cross-check** per ogni atomo.
- **CoV**: `npx vitest run` prima e dopo — i test NON devono calare (run pieno
  ~14800 pass; il pre-commit/pre-push hook confronta con
  `automa/baseline-tests.txt`). `npm run build` PASS prima di ogni deploy.
- **claude-in-chrome smoke** sul prod reale — niente claim senza evidenza.
- **G45 anti-inflation**: niente numeri inventati, niente self-score >7 senza
  review indipendente, marcare CONFIRMED vs INFERRED.
- NO demo, NO dati finti (`feedback_no_demo.md`).
- Loop autonomo: se si ingarbuglia → **fermarsi + checkpoint onesto**, NO grind
  (`feedback_autonomous_loop_honest_checkpoint.md`).
- NON emettere mai `MBLOCK_ELAB_NANOR4_COMPLETE` finché gli exit criteria mission
  §8 non sono empiricamente veri.

---

## 8. Errori sessione iter-99 — da NON ripetere
- Triage PR #92 sbagliato (assunto "superato" senza verifica commit-per-commit).
- Ipotesi "deploy stantio" sul bug #19 → falsa (prod = `main` attuale).
- Ipotesi "hex stub finto" → parzialmente falsa (è compile AVR reale via n8n).
- Ralph Loop "activated" stampato ma mai armato (nessun file di stato).
- Riferimenti a file di piano come se fossero su `main` — invece in PR #128/#130.
  **Verificare SEMPRE l'esistenza dei file, non assumere.**

---

## 9. File di contesto — leggi questi (STEP 0)
**Contesto / obiettivi**
- `docs/handoff/2026-05-20-iter-99-handoff.md` — questo file (contesto master)
- `docs/audits/2026-05-20-iter-99-consolidation-session-audit.md` — audit sessione
  (CoV, evidenza browser #19, errori)
- `docs/prompts/CODEX-DESKTOP-iter-99-continuation.md` — prompt Codex per l'atomo #19
- `docs/prompts/RALPH-LOOP-mBlock-elab-nanor4-mission.md` — brief mission mBlock
  (exit criteria §8)
- `docs/plans/2026-05-20-iter-99-consolidation-backlog-plan.md` — piano iter-99
  (⚠️ in PR #128)
- `docs/plans/2026-05-20-fase4-mblock-R3-R14-handoff.md` — piano Fase 4 R3-R14
  (⚠️ in PR #130, commit `1e6c9990`)
- `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` — spec agent compile/upload (iter 63)
- `CLAUDE.md` — contesto progetto + regole (PR #128 lo archivia a 568 righe)
- `.codex/AGENTS.md` — regole repo per Codex

**Codice rilevante #19**
- `src/components/home/HomeCompileEntry.jsx` — `handleCompile()` righe ~209-268
- `src/services/api.js` — `compileCode()` righe ~1300-1451 (catena endpoint)
- `src/components/simulator/panels/ScratchCompileBar.jsx` — UI barra compilazione
- `src/services/virtualSerialInterpreter.js` — PATTERN disclaimer onesto da imitare
- `api/compile/nanor4.js` — proxy Vercel sicuro (già onesto: 503 se cloud off)
- `supabase/functions/compile-proxy/index.ts` — inoltra `{code}` a n8n senza `fqbn`
- `infra/cloud-compile/` — servizio Render Renesas (`server.js`, `Dockerfile`,
  `render.yaml`, `openapi.yaml`, `package.json`) — pronto, deploy pending

**Feedback (Claude auto-legge da memory; Codex NO — riassunti in §7)**
- `feedback_autonomous_loop_honest_checkpoint.md` · `feedback_no_demo.md`

**Infra**
- Vercel project `elab-tutor` — `prj_Sm9JGt80Ivec3sMFAQ8abfz4UdnV`,
  team `team_23uD0RgdInaTaOPEL0EGltup`
- Prod deployment `dpl_A3q9pEsF1bnBS6h8V8mGXwKQVaHD` @ `5e2573fa`

---

## 10. Gotcha ambientali noti
- **Macchina dev a load ~87** (saturazione I/O disco — Spotlight/Storage). vitest
  e build lentissimi (vitest 57 min, build 26 min). Re-run CoV con
  `load average` < ~15.
- **gh auth**: NON esportare `GH_TOKEN=$(gh auth token)` in `.zshrc` — deadlock se
  il token scade (blocca `gh auth login`).
- Hook **semgrep** PostToolUse fallisce senza `SEMGREP_APP_TOKEN` — rumore
  non-bloccante.
- Tab browser GitHub "Authorize application" residua — ignorare.

---

## 11. Verdetto onesto
iter-99 consolidamento: Fasi 1-3 chiuse, CoV verde, prod sano. **NON completo**:
3 PR attendono Andrea, #19 aperto, Fase 4 non iniziata. `MBLOCK_ELAB_NANOR4_COMPLETE`
= **FALSO** (exit criteria mission §8 non veri).
