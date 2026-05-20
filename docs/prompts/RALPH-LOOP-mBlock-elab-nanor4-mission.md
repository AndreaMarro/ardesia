# RALPH LOOP MISSION — ELAB mBlock-inspired C++-first Arduino Nano R4

> **Activation**: `/ralph-loop:ralph-loop` con questo file come mission brief.
> **Promise/exit token**: `MBLOCK_ELAB_NANOR4_COMPLETE`
> **Autore**: Claude Opus 4.7 — 2026-05-20 iter 98 close. Per Andrea Marro.
> **Mandato**: completare ambiente mBlock-inspired C++-first Nano R4 in autonomia.

---

## 0. CONTEXT RECOVERY GATE (eseguire PRIMA di ogni ciclo)

Ralph loop perde contesto tra cicli. Ogni ciclo STEP 0 obbligatorio:

```
1. cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
2. git fetch origin main && git branch --show-current && git log --oneline -5
3. gh pr list --state open --limit 15   # vedi PR aperte stato ratify Andrea
4. mem-search query "iter 98 Atom E compile proxy cloud render"
5. mem-search query "iter 93 atoms 30 elabArduinoAst canonical"
6. mem-search query "mBlock C++-first Nano R4 master spec"
7. Leggi questo file interamente + docs/audits/2026-05-20-iter-98-AtomE-*.md
8. npx vitest run 2>&1 | tail -15   # baseline empirico
9. gh run list --branch main --limit 3   # CI health
10. mcp__57ae1081-572f-43db-af3f-ef37cff0c8c4__list_deployments   # Vercel deploy list — verifica no regressioni recenti
```

Se context recovery rivela lavoro già fatto → NON ri-fare. Aggiorna solo lo stato.

### 0.1 RISORSE, KEY, CREDENZIALI — tutto trovabile nelle chat

**Andrea iter 98 PM verbatim**: "tutte le key e qualunque risorsa è trovabile nelle chat."

Se il loop ha bisogno di API key, token, URL endpoint, credenziali, FQBN, project ref, o
qualunque risorsa di configurazione → NON bloccarsi e NON chiedere ad Andrea per prima
cosa. Cercare PRIMA in queste fonti (ordine):

1. **claude-mem corpus** — `mem-search query "<risorsa>"` (es. "ELAB_API_KEY", "Supabase
   service role key", "Render deploy", "Vercel env", "Cloudflare token", "FQBN nanor4").
   Se corpus stale → `rebuild_corpus` poi ri-cerca.
2. **Memory files** — `/Users/andreamarro/.claude/projects/-Users-andreamarro-VOLUME-3/memory/`:
   - `MEMORY.md` (indice) → `supabase-credentials.md` (2 progetti Supabase + service role
     key + 3 Google API keys + routing Gemini), `mistral-cloudflare-credentials.md`,
     `kimi-api-reference.md`, `architecture.md`, `mac-mini-status-2026-05-15.md`
3. **Credential env files locali** (path da MEMORY.md):
   - `~/.elab-credentials.env` (chmod 600 — Kimi K2.6 Anthropic-compat)
   - `~/.elab-credentials/sprint-s-tokens.env` (DIRECTORY — Mistral + Cloudflare token +
     account ID + 3 backup)
   - `~/.elab-credentials/elab-keys.env` (ELAB_API_KEY + VITE_ELAB_API_KEY — iter 70 rotation)
4. **Conversation history** — chat passate documentano deploy URL, project ref Supabase
   `euqpdueopmlllqjmqnyb`, infra config, Render/Vercel setup. claude-mem osservazioni +
   `docs/audits/` + `docs/handoff/` + CLAUDE.md sprint history sezioni.
5. **Repo config** — `vercel.json`, `.env*` (gitignored — leggere se presente locale),
   `infra/cloud-compile/render.yaml` (envVars), `supabase/config.toml`.

**Regola**: cercare risorsa in fonti 1-5 PRIMA di segnalare blocco ad Andrea. Solo se
risorsa genuinamente assente in TUTTE le fonti → chiedere Andrea (es. nuovo Render deploy
che non esiste ancora). Per atom R1 (Render deploy) il blocco è legittimo: il servizio
non esiste finché Andrea non lo crea — quel deploy è azione fisica Andrea, NON una key
da cercare.

**Security**: NON scrivere mai key/token in chiaro nei commit, PR, file tracciati, o
log. Le key restano nei file credential locali / mem corpus / env Vercel-Supabase-Render
server-side. Se una key emerge esposta in conversazione/output → flag rotation iter 32
protocol immediato.

---

## 1. RISULTATO FINALE DESIDERATO (Andrea verbatim)

Ambiente unico web `https://elab-builder.vercel.app/#compile-home`, ispirato UX mBlock, tecnicamente solido Arduino Nano R4, percorso "C++-first + drag-and-drop + tutor AI".

L'utente deve poter:
1. scrivere C++ Arduino vero
2. vedere blocchi sincronizzati quando codice rientra nel subset controllato
3. trascinare blocchi → ritrovare C++ rigenerato
4. compilare davvero per Nano R4 dal browser (backend cloud)
5. usare Monitor Seriale Virtuale quando scheda fisica non collegata
6. UNLIM screen-aware: conosce pagina/esperimento/editor/diagnostica/compile-status/transcript seriale + AGISCE sul workspace

Stessa esperienza negli esperimenti Arduino Volume 3, non solo HomePage.

**4 flussi gate obbligatori**:
- `#compile-home` C++ → compila Nano R4
- `#compile-home` Blocchi → compila Nano R4
- Esperimento Volume 3 → C++ → compila Nano R4
- Esperimento Volume 3 → Blocchi → compila Nano R4

---

## 2. ARCHITETTURA CANONICA (dalla ricerca Andrea — NON violare)

**Pattern MakeCode**: NON tentare "magia totale" C++↔Blockly. Adottare AST canonica come sorgente di verità:

```
Blockly XML  ⇄  ELAB AST canonica  ⇄  C++ Arduino
```

**FOUNDATION ESISTENTE VERIFICATA**: `src/features/elabArduinoAst/` (iter 93 atom 30, ~1098 LOC) = la AST canonica ELAB. Contiene `ast/` + `blocks/` + `generators/` + `parsers/` + `index.ts` + Zod schemas + roundtrip + test (`tests/unit/elabArduinoAst/`). **QUESTA è la sorgente di verità. NON duplicarla.** (atom 34 `actions/ast.ts` la duplicò erroneamente 64 LOC — vedi §4 REFACTOR).

**4 principi tecnici (research)**:
1. browser-first ≠ compiler-in-browser. Compilazione Nano R4 = servizio remoto (Render `infra/cloud-compile/` arduino-cli + Renesas core 1.5.3).
2. Conversione blocchi↔C++ = sottoinsieme DICHIARATO. Subset: setup, loop, pinMode, digitalWrite, digitalRead, analogRead, analogWrite, delay, Serial.begin/print/println, if/else, variabili semplici. Codice fuori subset → blocco grigio "C++ avanzato preservato", MAI perdere codice utente.
3. Monitor Seriale Virtuale = ONESTO. NON simula USB reale. Interpreta semantica `Serial.*` dall'AST + fixture esperimento. Disclaimer "Seriale prevista, non fisica" mandatory quando boardConnected=false.
4. UNLIM screen-aware + action-capable. Vede schermo + AGISCE (crea blocchi, apre editor, compila, legge diagnostica, spiega errore, usa fixture Vol3).

**FQBN canonico**: `arduino:renesas_uno:nanor4` — Renesas RA4M1 Arm Cortex-M4 48MHz, 256kB Flash, 32kB SRAM. Core `arduino:renesas_uno`. VID/PID runtime 0x2341:0x0074 + 0x2341:0x0374. Upload dfu-util. NON AVR, NON avr8js, NON ATmega328.

**Stack repo (research, già parzialmente presente)**:
- Blockly 12.4.1 (LIVE) — motore base workspace
- Monaco / CodeMirror 6 (CodeEditorCM6 LIVE iter 73) — editor C++
- tree-sitter-cpp + web-tree-sitter Wasm — parser C++ live in-browser subset (P0 — verificare se presente, altrimenti aggiungere)
- arduino-cli cloud (Render `infra/cloud-compile/` — deploy-ready iter 76)
- Virtual Serial AST interpreter (`virtualSerialInterpreter.js` iter 95 SP3 — LIVE PR #120)

---

## 3. STATO CORRENTE ONESTO (iter 98 close — verificare con git/PR ogni ciclo)

**6 PR aperte Andrea ratify** (verificare merge state):
- #117 iter 94 A1 teaFumettiPackageAudit CI gate
- #118 iter 94 A2 PuzzleIcon rotational asymmetry fix
- #120 iter 95 SP3 Virtual Serial Monitor + Master SPEC
- #121 iter 96 SP-WIRE NO-GO audit (informational)
- #122 iter 97 HomeCompileEntry UX 3 atoms
- #123 iter 98 Atom E Vercel compile proxy `/api/compile/nanor4`
- #119 CLOSED (redundant)

**iter 93 atoms cross-check verdetti** (code-reviewer):
- atom 30 `elabArduinoAst` — ✅ canonical, foundation buona
- atom 31 Blockly XML generators — parte di elabArduinoAst
- atom 32 `IdeShell` 3-pane — ❌ NO-GO 5 CRITICAL (vedi PR #121 audit)
- atom 33 `CodePalette` drag-drop — ⚠️ REVIEW 2 MED (DragDropHandler unwired + endpoint)
- atom 34 `unlimScreenAgent` — ❌ NO-GO 5 HIGH (duplicate AST + STATE field bug + CORS open + XSS + compileTarget AVR violation)
- atom 36 no-fake-upload — raw commit NON merged main

**Atom E compile proxy**: PR #123 shipped `api/compile/nanor4.js`. Compila funziona prod SOLO dopo Andrea: (1) Render deploy `infra/cloud-compile/`, (2) Vercel env `ELAB_CLOUD_COMPILE_URL` + `ELAB_CLOUD_COMPILE_API_KEY`, (3) redeploy. Step in `docs/audits/2026-05-20-iter-98-AtomE-*.md`.

---

## 4. WORK BREAKDOWN ATOMIZZATO (priorità ordine)

Ogni atom = branch separato + PR + Andrea ratify gate. Pattern S r3 race-cond fix: 1 agent = 1 branch = 1 worktree.

### P0 — Foundations (sblocca tutto)

**ATOM R1 — Andrea action: Render deploy + Vercel env** (Andrea ~15min)
Compila "DEVE FUNZIONARE" — eseguire deploy steps `docs/audits/2026-05-20-iter-98-AtomE-*.md`. Senza questo, compile chain prod morta. Ralph loop: se Render non deployato → segnalare ad Andrea ogni ciclo finché fatto.

**ATOM R2 — atom 34 unlimScreenAgent REFACTOR**
Eliminare `src/features/unlimScreenAgent/actions/ast.ts` (64 LOC duplicate) + `types.ts:48-94`. Refactor `actions/utils.ts` + `createBlink/createButtonLed/createAnalogSerial` per importare da canonical `src/features/elabArduinoAst`. Fix HIGH-2 STATE field, HIGH-3 Edge Function CORS (`supabase/functions/unlim-intent` → `_shared/guards.ts` pattern), HIGH-4 XSS sanitize, HIGH-5 compileTarget AVR-vs-Renesas. Cross-check Codex Pattern V + code-reviewer pre-merge.

**ATOM R3 — atom 33 CodePalette wire**
Wire `createPaletteDropExtension()` (DragDropHandler) → CodeEditorCM6 `extensions` prop. Replace `/api/compile/nanor4` hardcoded → reuse iter 98 proxy. Click fallback `onInsertSnippet` consumer wire.

**ATOM R4 — tree-sitter-cpp parser live in-browser**
Verificare presenza `web-tree-sitter` + `tree-sitter-cpp.wasm`. Se assente: aggiungere (npm + asset Wasm build). Implementare `parseCpp` → ELAB AST subset (riconoscere setup/loop/pinMode/digitalWrite/digitalRead/delay/analogRead/analogWrite/Serial.*). Snippet ricerca §research.

### P1 — Roundtrip + esperimenti

**ATOM R5 — C++ subset → AST → Blocks roundtrip**
Consumare `elabArduinoAst/parsers/` cppToAst + `generators/astToBlockly`. Subset convertibile. Codice non riconosciuto → blocco grigio "C++ avanzato preservato". Test roundtrip identity per subset + preservation per non-subset.

**ATOM R6 — Blocks → AST → C++ roundtrip**
`elabArduinoAst/parsers/blocklyToAst` + `generators/astToCpp`. Pretty-printer C++.

**ATOM R7 — Volume 3 esperimenti come manifest**
Ogni esperimento Arduino Vol3 = manifest indipendente: starter AST + tutorial steps + fixture sensori + transcript seriale atteso + obiettivi + suggerimenti tutor. Wire NewElabSimulator Vol3 Arduino esperimenti stesso flusso #compile-home.

**ATOM R8 — UNLIM screen-aware operativo**
Post R2 refactor: wire `unlimScreenAgent` screenContext (route + experimentId + editorMode + cppCode + blockXml + selectedText + compileStatus + boardConnected + uploadState + serialMode) + 10 azioni. Mascotte operativa dock. UnlimCompileHelper (iter 97 atom C scaffold) → V2 animato + V3 wire unlimScreenAgent.

### P1 — UX iter 97 carryover (Andrea screenshot feedback)

**ATOM R9 — Esperimenti chooser** Vol3 list + Libertà mode (Andrea "elenco volume 3 o.13 e libertà").
**ATOM R10 — Responsive viewport-fit** "schermo non si adatta" — audit editorGrid breakpoint.
**ATOM R11 — Layout mBlock-like polish** — usare `impeccable` plugin (frontend-design + critique + polish). Toolbox sinistra + canvas centro + editor + UNLIM destra + monitor basso.

### P2 — iter 93 atom 32 IdeShell

**ATOM R12 — IdeShell rework 5 CRITICAL** (PR #121 audit) — OR abandon IdeShell + enhance HomeCompileEntry incrementally (decisione Andrea ratify). Se rework: fix /api/compile/nanor4 endpoint + 40px bottom row + test infra + experimentId prop.

### P2 — Testing

**ATOM R13 — Playwright WebUSB mocks** — `addInitScript` mock `navigator.usb` per test senza scheda. VID/PID 0x2341:0x0074.
**ATOM R14 — E2E 4 flussi gate** — Playwright spec 4 mandatory flows.

---

## 5. PLUGIN DA USARE

| Plugin | Uso |
|---|---|
| `codex` (Pattern V/C) | cross-check OGNI atom pre-merge — `scripts/dev/codex-bg.sh verify` GPT-5.5 high. NOTA: Codex BG output spesso noisy file-dumps — usare code-reviewer subagent come tier affidabile |
| `codebase-cleanup:tech-debt` | inventario debito tecnico + remediation plan |
| `code-refactoring:tech-debt` | refactoring atom R2 (duplicate AST) |
| `ultrathink:ultrathink` | task complessi multi-step (coordinator + 4 sub-agent) |
| `superpowers` | `write-spec` + `writing-plans` (atom planning) + `writing-skills` + `using-superpowers` + `verification-before-completion` + `test-driven-development` + `systematic-debugging` |
| `plugin-dev:agent-development` | se servono nuovi agent ELAB |
| `claude-code-setup:claude-automation-recommender` | ottimizzare setup hooks/skills |
| `impeccable` | UI/UX atom R11 (`frontend-design` + `critique` + `polish` + `arrange` + `colorize`) |
| `skill-creator` + `skill-creator-doctor` + `skills-manager` + `plugin-eval` | creare/validare nuove skill ELAB |
| `documentation-generation` (doc-generate) | docs API + architettura |
| `document-sync` | verificare CLAUDE.md ↔ codice consistency ogni close |
| `code-reviewer` (Anthropic) | review affidabile ogni atom |
| `agent-teams` | parallel feature dev se atom indipendenti |

---

## 6. CONNETTORI — ABILITATI AD AGIRE LIBERAMENTE

Andrea autorizza esplicitamente uso autonomo:
- **`Control_your_Mac` (osascript)** — controllo macOS nativo
- **`claude-in-chrome`** — **MASSIVO su prodotto deployato** `https://elab-builder.vercel.app`. Ogni ciclo: navigare #compile-home + Vol3 esperimenti, testare Compila/Blockly/C++/Monitor Seriale, leggere console errors, screenshot evidence, verificare regressioni visive
- **`Macos`** (App/Click/Type/Snapshot/Shell) — automazione desktop
- **`computer-use`** (control desktop) — screenshot + click + scroll quando serve

Uso: testare LIVE prod ogni deploy, catturare evidence reale, anti-regressione G45. Real UI evidence mandatory (feedback iter 42 anti-G45).

---

## 7. AUTONOMIA COMPLETA + DEPLOY DISCIPLINE

**Andrea iter 99 PM verbatim**: "deve essere completamente autonomo, servono audit
incrociati con codex."

Il loop opera in **autonomia totale**. NON aspetta ratify Andrea per procedere atom
per atom. Auto-merge PR autonomo quando TUTTI i gate verdi:

### Gate auto-merge (TUTTI obbligatori prima di `gh pr merge --squash`)

1. **Codex Pattern V cross-audit GO** — `scripts/dev/codex-bg.sh verify` GPT-5.5 high.
   Se Codex output noisy/file-dump → ri-dispatch con scope più stretto (singolo file).
2. **code-reviewer:code-reviewer subagent GO** — verdetto strutturato HIGH/MED/LOW.
   ZERO CRITICAL + ZERO HIGH non risolti.
3. **CI verde** — `gh pr checks <N>` tutti pass (test + build + governance).
4. **vitest baseline preservato** — nessuna regressione, delta ≥ 0.
5. **build PASS** + **claude-in-chrome smoke prod** post-merge 4 flussi gate non rotti.

Se Codex + code-reviewer divergono → applicare il verdetto più severo. Se trovano
CRITICAL/HIGH → fix inline PRIMA del merge (mai ship-then-fix — lezione iter 82).

### Cross-audit Codex — MANDATORIO ogni atom

OGNI atom (R2-R14) richiede cross-check Codex Pattern V + code-reviewer PRIMA del
commit, NON dopo. Pattern dual-verify iter 82 validato. Atom senza cross-audit →
NON mergiare.

### Deploy discipline

- **Deploy frequenti** — ogni atom auto-merged → build + verifica deploy Vercel
- **Lista deploy Vercel ogni ciclo** — `mcp__57ae1081...__list_deployments` —
  ultimo deploy stato READY/ERROR. Se ERROR → STOP atom corrente + investigare
  regressione + fix prima di proseguire
- **Pre/post gate** — `/elab-quality-gate` PRE + POST ogni ciclo
- **CI watch** — `gh run list --branch main` ogni ciclo
- **NO push main direct** — sempre branch + PR + auto-merge (PR merge ≠ push direct;
  branch protection CI resta attiva). Questo NON è bypass — è merge sicuro post-gate.
- **NO `--no-verify`** + **NO `--admin` bypass** — gate sempre rispettati
- **claude-in-chrome smoke prod MASSIVO** post ogni merge

### Eccezione autonomia — atom R1 Render deploy

Atom R1 (Render deploy `infra/cloud-compile/`) = azione fisica creazione servizio
cloud, richiede Render dashboard login Andrea. Il loop NON può crearlo autonomo.
Segnalare ad Andrea ogni ciclo finché non fatto, MA proseguire altri atom in
parallelo (R2-R14 non bloccati da R1 — il proxy iter 98 ritorna 503 onesto fino
a deploy). Quando Andrea conferma Render live → verificare `/health` + procedere.

---

## 8. EXIT CRITERIA (promise `MBLOCK_ELAB_NANOR4_COMPLETE`)

Loop termina SOLO quando TUTTI veri (verificare empirico, NO claim):

1. ✅ ATOM R1 — Render deployato + Vercel env set + Compila prod LIVE verificato claude-in-chrome
2. ✅ 4 flussi gate compilano Nano R4 reale (artifact .bin/.hex prodotto)
3. ✅ Virtual Serial Monitor mostra output previsto + disclaimer
4. ✅ C++ subset → Blocks roundtrip + Blocks → C++ roundtrip (subset) PASS
5. ✅ Codice non-subset → blocco grigio preservato, MAI perso
6. ✅ UNLIM screen-aware operativo (10 azioni)
7. ✅ Volume 3 esperimenti Arduino stesso flusso #compile-home
8. ✅ Layout mBlock-like (toolbox + canvas + editor + UNLIM + monitor)
9. ✅ E2E Playwright 4 flussi gate PASS no-board
10. ✅ Build PASS + vitest baseline preservato + ZERO regressioni
11. ✅ Vercel deploy READY (no ERROR ultima lista)
12. ✅ iter 93 atom 34 refactor (no duplicate AST) + atom 33 wired
13. ✅ Tutte PR auto-merged post cross-audit GO (Codex + code-reviewer + CI verde)
14. ✅ Codex Pattern V + code-reviewer GO ogni atom — cross-audit MANDATORIO
15. ✅ Hardware UAT Nano R4 USB — SOLO dopo gate 1-14 (Andrea/Tea/Riccardo, DFU/VID-PID reali)

Gate 1-14 software. Gate 15 hardware = post software certainty (research: "arrivarci con alta confidenza, NON comprare scheda per scoprire se rotto").

---

## 9. ANTI-RULES (G45 anti-inflation + ZERO COMPIACENZA)

- NO claim "funziona" senza test live claude-in-chrome prod
- NO claim "compila Nano R4" senza artifact .bin/.hex verificato
- NO "Caricato" senza flash DFU reale
- NO "Seriale reale" senza scheda — sempre "Seriale prevista/virtuale"
- NO "conversione C++ completa" — sempre "subset + avanzato preservato"
- NO score >7 auto senza Opus indipendente review
- NO main direct push, NO --no-verify, NO --admin
- mem-search OGNI ciclo (corpus può essere stale — rebuild se serve)
- Verificare lavoro pre-esistente PRIMA di costruire (lezione: Master SPEC redundant + atom 34 duplicate AST + PR #119 redundant — 4 scoperte ridondanza iter 95-98)
- broker_v4 autonomous-generated atoms (iter 93) quality NON assumere production-ready — verificare SEMPRE
- Autonomia completa (Andrea iter 99 mandate): auto-merge PR post cross-audit GO, NON aspettare ratify Andrea. Cross-audit Codex Pattern V + code-reviewer MANDATORIO ogni atom — atom senza cross-audit NON mergiabile. Mai ship-then-fix: CRITICAL/HIGH fix PRIMA del merge
- NO push main direct resta valido (auto-merge PR ≠ push direct; branch protection CI attiva)

---

## 10. RESEARCH REFERENCE (Andrea ha fornito — sintesi)

Repo P0: Blockly + Blockly Samples (plugin: Workspace Search + Zoom to Fit + Scroll Options P0; Backpack + Minimap + Multiselect P1) + Monaco + tree-sitter/tree-sitter-cpp.
Reference architetturale: Microsoft PXT/MakeCode (pattern roundtrip editoriale, subset + blocchi grigi).
Compile cloud P0: Google Cloud Run (produzione) OR Render (MVP — ELAB usa Render `infra/cloud-compile/`).
Monitor seriale P0: AST interpreter ELAB + fixtures (NO avr8js — è AVR-only, Nano R4 è RA4M1 Arm).
mBlock = ispirazione UX only, NO cloning tecnico (sorgente mBlock 5 non disponibile pubblico completo).

Compile API contract: `POST /api/compile/nanor4 { fqbn, sketchName, files, exportBinaries, boardConnected }` → `{ ok, fqbn, artifactSize, artifacts[], diagnostics[], memory{flashUsed,sramUsed}, upload{attempted:false, reason} }`.

arduino-cli: `--fqbn arduino:renesas_uno:nanor4 --export-binaries` + RPC `source_override` per file non salvati.

Struttura file consigliata: `src/features/elab-arduino/{ast,parser,blockly,cpp,compile,serial,tutor,experiments/volume3}/` — MA verificare: `src/features/elabArduinoAst/` esiste già (atom 30) — consolidare lì, NON creare doppione.

---

**FINE MISSION. Ralph loop: STEP 0 context recovery → atom successivo P0 → branch → TDD → Codex+code-reviewer cross-check → PR → Andrea ratify → deploy verify → claude-in-chrome smoke prod → ciclo. Termina solo con `MBLOCK_ELAB_NANOR4_COMPLETE` quando exit criteria 1-15 empiricamente veri.**
