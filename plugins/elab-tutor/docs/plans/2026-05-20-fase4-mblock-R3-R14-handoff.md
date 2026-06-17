# ELAB Fase 4 — mBlock C++-first Nano R4 — Piano handoff R3→R14

**Data:** 2026-05-20
**Autore:** Claude Opus 4.7, per Andrea Marro — fine sessione consolidamento iter-99.
**Scopo:** permettere a una sessione NUOVA di riprendere la mission mBlock (atomi R3→R14) senza perdita di contesto.
**Stato:** Fasi 1-3 (consolidamento iter-99) CHIUSE e verificate. R3 = prossimo atom.

---

## 0. Come usare questo doc (sessione nuova — STEP 0)

```
1. cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
2. git fetch origin main && git checkout main && git merge --ff-only origin/main
3. git log --oneline -8        # verifica cosa è stato mergiato
4. gh pr list --state open     # #128 #129 + eventuali nuove
5. npx vitest run 2>&1 | tail -8   # baseline empirico (atteso ~14809+)
6. Leggi: questo doc + i 3 doc di §8 Riferimenti
7. Parti da R3 (§5). 1 atom = 1 branch da main = 1 PR. NIENTE loop, NIENTE auto-merge.
```

Se §3 "Stato corrente" risulta superato dai fatti git → fidati di git/PR, aggiorna lo stato, NON ri-fare lavoro già mergiato.

---

## 1. Obiettivo prodotto (invariato)

Ambiente web unico su `https://elab-builder.vercel.app/#compile-home`, ispirato alla UX di mBlock, tecnicamente solido per Arduino Nano R4. Percorso "C++-first + drag-and-drop + tutor AI". L'utente deve poter:

1. scrivere C++ Arduino vero
2. vedere blocchi sincronizzati quando il codice rientra nel subset controllato
3. trascinare blocchi → ritrovare C++ rigenerato
4. compilare davvero per Nano R4 dal browser (backend cloud)
5. usare un Monitor Seriale Virtuale onesto quando la scheda non è collegata
6. usare UNLIM screen-aware che AGISCE sul workspace, non solo chatta

**4 flussi gate** (criterio di completamento): `#compile-home` C++→compila · `#compile-home` Blocchi→compila · Esperimento Vol3 C++→compila · Esperimento Vol3 Blocchi→compila.

---

## 2. Architettura canonica (dalla deep research — NON violare)

```
Blockly XML  ⇄  ELAB AST canonica  ⇄  C++ Arduino
```

- **NON** tentare conversione diretta C++↔Blockly. Entrambi passano per l'AST canonica.
- **Foundation già esistente:** `src/features/elabArduinoAst/` (atom 30, ~1098 LOC: `ast/` + `blocks/` + `generators/` + `parsers/` + Zod schemas + roundtrip + test). **È la sorgente di verità. NON duplicarla.**
- Subset blocchizzabile DICHIARATO: setup, loop, pinMode, digitalWrite, digitalRead, analogRead, analogWrite, delay, Serial.begin/print/println, if/else, variabili semplici. Codice fuori subset → "blocco grigio / C++ avanzato preservato", MAI perdere codice utente.
- Compilazione = servizio remoto (NON compiler-in-browser). Monitor seriale = interprete AST onesto (NON emula USB reale).
- FQBN: `arduino:renesas_uno:nanor4` — Renesas RA4M1 Cortex-M4. Core `arduino:renesas_uno`. Upload `dfu-util`. VID/PID `0x2341:0x0074` + `0x2341:0x0374`. NON AVR/avr8js/ATmega328.

Dettaglio architetturale completo + tabella repo/SDK: mission doc §2 + §10 (vedi §8).

---

## 3. Stato corrente ONESTO (2026-05-20)

### Fatto e verificato empiricamente

| Elemento | Stato | Evidenza |
|---|---|---|
| `elabArduinoAst` foundation (atom 30) | LIVE su main | AST canonica esistente |
| R2 — unlimScreenAgent refactor | MERGED | PR #127 (canonical AST + CORS hardening) |
| Virtual Serial Monitor | MERGED | PR #120 (`virtualSerialInterpreter.js` + `VirtualSerialMonitor.jsx`) |
| Compile proxy `/api/compile/nanor4` | MERGED | PR #123 (ritorna 503 onesto finché R1 non fatto) |
| HomeCompileEntry UX | MERGED | PR #122 |
| PuzzleIcon · SP-WIRE audit | MERGED | PR #118 · #121 |
| Consolidamento iter-99 (Fasi 1-2) | CHIUSO | 7 PR mergiate, #59/#60 chiuse, backlog azzerato |
| CLAUDE.md archiviato (Fase 3) | PR APERTA | #128 — review/merge Andrea |
| MEDIUM follow-ups (cap input, emoji→ElabIcons, dead buttons) | PR APERTA | #129 — review/merge Andrea, Codex GO |
| main | VERDE | vitest 14809 / 0 fail, build PASS, CI/CD Pipeline verde |

### NON fatto

- **R1** — Render deploy + Vercel env → azione ANDREA (vedi §6). Senza R1 la compilazione prod è morta (il proxy ritorna 503).
- **R3–R14** — da fare.

### Caveat onesti (NON compiacenti)

- `E2E Tests` CI su main = **rosso pre-esistente** (~dal 12/05). NON risolto. Issue separata, non regressione del consolidamento. Va affrontato (candidato per R14 o atom dedicato).
- FQBN `arduino:renesas_uno:nanor4` = **inferenza alta-probabilità, NON verificata con board reale**. Va parametrizzata in config + verificata con `arduino-cli board listall` alla prima install del core.
- `quality-ratchet` / `Verify governance rules 0-5` CI checks: non riconfermati verdi (advisory — branch protection main NON ha required checks).
- #128, #129 ancora da review/merge Andrea. Se la sessione nuova parte prima del merge: R3 nasce da `main` senza quei contenuti — accettabile (non collidono), ma rebase quando mergiate.
- atom 32 `IdeShell` = NO-GO 5 CRITICAL (audit PR #121). R12 deciderà: rework o abbandono in favore di HomeCompileEntry incrementale.

---

## 4. Goal / Non-goal

**Goal Fase 4:** chiudere gli atomi R3→R14 in modo controllato, ciascuno come PR pulita reviewabile, fino ai 4 flussi gate funzionanti.

**Non-goal (esplicito):**
- NON Ralph Loop / NON auto-merge / NON autonomia infinita — vedi §7.
- NON emulazione hardware reale RA4M1 in-browser (Renode/avr8js fuori scope V1).
- NON conversione C++↔Blockly "totale" — solo subset dichiarato.
- NON upload fisico DFU in V1 (R13 = solo mock WebUSB; hardware UAT = dopo i gate software).
- NON acquisto scheda per "scoprire se funziona" — arrivarci con confidenza software prima.

---

## 5. Atomi R3→R14 — roadmap

Ordine di priorità. **Ogni atom = 1 branch da `main` = 1 PR.** Dettaglio completo per atom: mission doc §4.

### R3 — CodePalette wire (P0) — PROSSIMO ATOM

**Cosa:** atom 33 (iter-93) ha prodotto `CodePalette` drag-drop ma con 2 gap MEDIUM lasciati irrisolti. Wire-up:
1. Collegare `createPaletteDropExtension()` (DragDropHandler) → prop `extensions` di `CodeEditorCM6`.
2. Sostituire l'endpoint `/api/compile/nanor4` hardcoded → riusare il proxy iter-98 (`api/compile/nanor4.js`, da #123).
3. Wire del fallback click `onInsertSnippet` lato consumer.

**Come partire:** `grep -rn "createPaletteDropExtension\|DragDropHandler\|CodePalette" src/` per trovare i file (atom-33 li ha creati — path non verificato in questo doc). `CodeEditorCM6` è in `src/components/simulator/panels/CodeEditorCM6` (consumato da `HomeCompileEntry.jsx`).

**Acceptance:** drag di un blocco palette inserisce snippet nell'editor C++; click fallback inserisce; nessun endpoint hardcoded; vitest ≥ baseline; build PASS.

**Dipendenze:** nessuna bloccante (il proxy #123 è già su main).

### R4–R14 — sintesi

| Atom | Cosa | Priorità | Note |
|---|---|---|---|
| R4 | tree-sitter-cpp parser live in-browser | P0 | Verificare se `web-tree-sitter` + `tree-sitter-cpp.wasm` presenti; se no aggiungere (npm + asset Wasm). `parseCpp` → ELAB AST subset. |
| R5 | C++ subset → AST → Blocks roundtrip | P1 | `elabArduinoAst/parsers/cppToAst` + `generators/astToBlockly`. Non-subset → blocco grigio preservato. |
| R6 | Blocks → AST → C++ roundtrip | P1 | `parsers/blocklyToAst` + `generators/astToCpp` (pretty-printer). |
| R7 | Volume 3 esperimenti come manifest | P1 | Ogni esperimento = manifest indipendente (starter AST + tutorial + fixture + transcript atteso). |
| R8 | UNLIM screen-aware operativo | P1 | Post-R2: wire `unlimScreenAgent` screenContext + 10 azioni. UnlimCompileHelper V2/V3. |
| R9 | Esperimenti chooser Vol3 + modo Libertà | P1 | Andrea screenshot feedback iter-97. |
| R10 | Responsive viewport-fit | P1 | "schermo non si adatta" — audit editorGrid breakpoint. |
| R11 | Layout mBlock-like polish | P1 | toolbox sx + canvas + editor + UNLIM dx + monitor basso. Plugin `impeccable`. |
| R12 | IdeShell: rework 5 CRITICAL **oppure** abbandono | P2 | **Decisione Andrea richiesta** prima di iniziare. |
| R13 | Playwright WebUSB mocks | P2 | `addInitScript` mock `navigator.usb`, VID/PID ufficiali. |
| R14 | E2E 4 flussi gate | P2 | Spec Playwright dei 4 flussi. Considerare qui anche il fix E2E rosso pre-esistente. |

---

## 6. R1 — Azione ANDREA (non bloccante per R3, ma sblocca la compilazione prod)

R1 NON è un atom software: è creazione di un servizio cloud, richiede login Render di Andrea.

1. Deploy `infra/cloud-compile/` su Render (arduino-cli + core Renesas).
2. Vercel env: `ELAB_CLOUD_COMPILE_URL` + `ELAB_CLOUD_COMPILE_API_KEY`.
3. Redeploy Vercel.

Step dettagliati: `docs/audits/2026-05-20-iter-98-AtomE-compila-DEVE-FUNZIONARE-root-cause-deploy-steps.md`.
Finché R1 non è fatto, il proxy `/api/compile/nanor4` ritorna 503 onesto — R3-R14 procedono comunque (non bloccati da R1).

---

## 7. Processo — CONTROLLATO (mandato Andrea — sostituisce mission doc §7)

**Regole ferree per ogni atom R3→R14:**

- 1 atom = 1 branch da `main` = 1 PR pulita. NO stacking di PR su PR non mergiate.
- **NIENTE auto-merge. NIENTE loop infinito. NIENTE Ralph Loop.** Andrea ratifica e mergia ogni PR.
- Cross-check **Codex Pattern V** (`scripts/dev/codex-bg.sh <task> --profile verify "<prompt 4-elementi>"`) + **code-reviewer** PRIMA del commit. CRITICAL/HIGH → fix prima del merge, mai ship-then-fix.
- vitest ≥ baseline (14809 al 2026-05-20), build PASS, per ogni atom.
- NO push diretto su `main`. NO `--no-verify`. NO `--admin`.
- Verificare lavoro pre-esistente PRIMA di costruire (lezione iter 95-98: 4 ridondanze — Master SPEC, atom-34 duplicate AST, PR #119, ecc.).

**Perché questo sostituisce il mission doc §7/§9:** il mission doc (`RALPH-LOOP-mBlock-...md`) è scritto come Ralph Loop autonomo con auto-merge e `max_iterations`. Quel framing è ESATTAMENTE ciò che ha causato il runaway iter-99 (`max_iterations: 0`, iteration 93, PR impilate, falso "CI GREEN"). Il mission doc resta valido per **architettura, atomi, research** (§1-§4, §10); il suo **§0/§7/§8/§9 (loop, auto-merge, exit token, autonomia totale) è SUPERATO** da questo processo controllato. In caso di conflitto, vince questo doc.

---

## 8. Riferimenti completi

**Doc di progetto (leggere in STEP 0):**
- `docs/prompts/RALPH-LOOP-mBlock-elab-nanor4-mission.md` — architettura, 14 atomi dettagliati, research §10. (Ignorare il framing loop/auto-merge — vedi §7 qui sopra.)
- `docs/plans/2026-05-20-iter-99-consolidation-backlog-plan.md` — piano consolidamento iter-99 (contesto del runaway).
- `docs/audits/2026-05-20-iter-98-AtomE-compila-DEVE-FUNZIONARE-root-cause-deploy-steps.md` — step deploy R1.
- `~/Downloads/deep-research-report.md` — deep research completa di Andrea (tabelle repo/SDK, contratto compile API, plugin Blockly, struttura file, open questions).
- `CLAUDE.md` — contesto evergreen (dopo merge #128: 568 righe; storia in `docs/sprint-history-iter3-82-archive.md`).

**File chiave codice:**
- `src/features/elabArduinoAst/` — AST canonica (atom 30) — sorgente di verità, NON duplicare.
- `src/components/home/HomeCompileEntry.jsx` — shell `#compile-home`.
- `src/components/simulator/panels/CodeEditorCM6` — editor C++ (CodeMirror 6).
- `src/components/simulator/panels/VirtualSerialMonitor.jsx` + `src/services/virtualSerialInterpreter.js` — monitor seriale virtuale.
- `api/compile/nanor4.js` — proxy compilazione (Vercel serverless, da #123).
- `scripts/dev/codex-bg.sh` — wrapper Codex cross-check (`CODEX_BIN=~/.npm-global/bin/codex`).

**Infra / config:**
- FQBN: `arduino:renesas_uno:nanor4` · core `arduino:renesas_uno` · upload `dfu-util` · VID/PID `0x2341:0x0074`+`0x2341:0x0374`.
- Compile API contract: `POST /api/compile/nanor4 { fqbn, sketchName, files, exportBinaries, boardConnected }` → `{ ok, fqbn, artifactSize, artifacts[], diagnostics[], memory{flashUsed,sramUsed}, upload{attempted:false,reason} }`.
- Credenziali (NON in chiaro nei commit): `MEMORY.md` indice → `supabase-credentials.md`, `mistral-cloudflare-credentials.md`; file locali `~/.elab-credentials.env`, `~/.elab-credentials/`.
- Repo research P0: Blockly, Blockly Samples (plugin Workspace Search + Zoom-to-Fit + Scroll Options P0), Monaco/CodeMirror 6, tree-sitter + tree-sitter-cpp. Reference architetturale: Microsoft PXT/MakeCode (pattern roundtrip + blocchi grigi). Tabella URL completa: deep research report.

**Stato git al handoff:** `main` @ `5e2573fa` (PR #118). PR aperte: #128 (archive CLAUDE.md), #129 (MEDIUM follow-ups), + questa PR (handoff plan).

---

## 9. Open questions / rischi (oggettivo)

1. **FQBN release esatto** — `arduino:renesas_uno:nanor4` è inferenza; il workflow del core usa `arduino-git:renesas:nanor4` con package locale. Parametrizzare in config, verificare con `arduino-cli board listall` post-install. → engineering, alla prima R1/R4.
2. **R1 Render deploy** — bloccante per la compilazione prod reale, dipende da Andrea. → Andrea.
3. **E2E Tests CI rosso** — pre-esistente dal ~12/05, root cause non investigata in questa sessione. → engineering, prima/durante R14.
4. **tree-sitter-cpp.wasm asset** — non verificato se già presente nel repo; R4 deve controllare prima di aggiungere dipendenza. → engineering, R4.
5. **R12 IdeShell** — rework (5 CRITICAL) o abbandono? Decisione di prodotto. → Andrea, prima di R12.
6. **mission doc §7** — andrebbe riscritto per togliere il framing loop/auto-merge (o marcato superato). → doc cleanup, basso impatto.

---

## 10. Timeline

Indicativa, NON vincolante (1 atom = 1 PR, il ritmo lo detta la review di Andrea):
- P0 (R3, R4) — fondazioni che sbloccano il roundtrip.
- P1 (R5–R11) — roundtrip, esperimenti Vol3, tutor, UX.
- P2 (R12–R14) — IdeShell decision, testing E2E.
- R1 (Andrea) in parallelo, appena possibile.

Hardware UAT Nano R4 reale (DFU/VID-PID) = SOLO dopo i gate software, non prima.
