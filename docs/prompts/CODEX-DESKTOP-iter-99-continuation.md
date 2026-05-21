# Codex Desktop — Stringa di attivazione iter-99 (ELAB Tutor)

> **Come usarlo**: apri Codex desktop nel repo
> `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`, profilo **implement**
> (GPT-5.5 high, workspace-write). Incolla TUTTO il blocco fra i marcatori
> `═══ INIZIO STRINGA ═══` e `═══ FINE STRINGA ═══`.
>
> Generata 2026-05-20. Companion: `docs/handoff/2026-05-20-iter-99-handoff.md`.
> Codex NON accede a claude-mem/MEMORY (memoria Claude): il contesto rilevante è
> distillato nella §2 della stringa.

---

═══ INIZIO STRINGA ═══

Sei **Codex desktop**. Continui il lavoro **iter-99** di **ELAB Tutor**.
Repo: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`. Esegui **UN solo
atomo**, in modo controllato. Lingua: italiano (termini tecnici in inglese ok).

──────────────────────────────────────────────────────────────────────
§1. FILE DA LEGGERE PRIMA (in quest'ordine, obbligatorio)
──────────────────────────────────────────────────────────────────────
1. `.codex/AGENTS.md` — regole repo per Codex
2. `CLAUDE.md` — contesto progetto completo + regole (distillato in §4 sotto)
3. `docs/handoff/2026-05-20-iter-99-handoff.md` — handoff master iter-99 (STEP 0)
4. `docs/audits/2026-05-20-iter-99-consolidation-session-audit.md` — audit
   sessione; **§4 = dettaglio completo del bug #19** da risolvere
5. `docs/prompts/RALPH-LOOP-mBlock-elab-nanor4-mission.md` — brief mission mBlock
   (exit criteria §8)
6. `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` — spec agent compile/upload

File di codice da studiare per l'atomo (§5):
- `src/services/api.js` — `compileCode()` righe ~1300-1451 (catena endpoint).
  ⚠️ api.js è un FILE CRITICO (vedi CLAUDE.md "File critici"): sii chirurgico.
- `src/components/home/HomeCompileEntry.jsx` — `handleCompile()` righe ~209-268
- `src/components/simulator/panels/ScratchCompileBar.jsx` — UI barra compilazione
- `src/services/virtualSerialInterpreter.js` — pattern disclaimer onesto da imitare
- `api/compile/nanor4.js` — proxy Vercel (già onesto: 503 se cloud off)
- `supabase/functions/compile-proxy/index.ts` — inoltra `{code}` a n8n senza `fqbn`

──────────────────────────────────────────────────────────────────────
§2. CONTESTO DA CLAUDE-MEM / MEMORY (Codex non accede — distillato qui)
──────────────────────────────────────────────────────────────────────
- **ELAB Tutor** = tutor educativo Arduino per la scuola (bambini 8-14 anni).
  React 19 + Vite 7. Live: `https://www.elabtutor.school`. Prodotto = kit fisici
  (3 volumi + componenti Omaric) + questo software.
- **Andrea Marro = UNICO sviluppatore.** Gli hanno dato fiducia. La sua
  reputazione dipende da questo lavoro. Qualità = critica.
- **iter-99 = consolidamento** dopo un Ralph Loop autonomo andato in runaway
  (loop infinito, poi fermato).
- **Feedback Andrea VINCOLANTI** (da memory — rispettali sempre):
  - `feedback_autonomous_loop_honest_checkpoint.md`: se il lavoro si ingarbuglia
    → fermarsi + checkpoint onesto. NO grind. **MAI auto-merge.** Checkpoint
    onesti sono benvenuti.
  - `feedback_no_demo.md`: **ZERO demo, ZERO dati finti.** Tutto deve funzionare
    con dati reali. Mai mock.
- **Mandato costante Andrea**: NO compiacenza, non mentire, massima oggettività,
  G45 anti-inflation (vedi §4).
- Memoria completa (solo se Codex ha accesso shell, opzionale — il distillato
  qui basta): `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/`.

──────────────────────────────────────────────────────────────────────
§3. STATO ATTUALE (verificato empiricamente 2026-05-20)
──────────────────────────────────────────────────────────────────────
- `main` HEAD = `5e2573fa`. Working tree: header copyright CSS + rumore
  auto-state (NON committarli) + i doc nuovi della sessione iter-99.
- CoV: `npm run build` **PASS** (exit 0). `npx vitest run` ~14800 pass, 0
  regressione di codice (4 fail del full-run = flaky ambientali, ri-verificati).
- Prod Vercel: `dpl_A3q9pEsF1bnBS6h8V8mGXwKQVaHD` @ `5e2573fa`, project
  `elab-tutor`. Alias `www.elabtutor.school` + `elab-builder.vercel.app`.
- 3 PR aperte attendono ratifica Andrea: **#128** (archivio CLAUDE.md), **#129**
  (MEDIUM follow-up, Codex-verificata pulita), **#130** (piano Fase 4). NON
  toccarle, NON fare merge.
- ⚠️ Macchina dev può essere a load alto (saturazione I/O Spotlight): vitest e
  build possono essere molto lenti. È normale, non è un bug del codice.

──────────────────────────────────────────────────────────────────────
§4. CONTESTO DA CLAUDE.md (distillato — leggi comunque il file intero)
──────────────────────────────────────────────────────────────────────
- **Principio Zero** (regola pedagogica): il docente è il tramite, UNLIM lo
  strumento, gli studenti lavorano sui kit fisici. Linguaggio UI plurale
  "Ragazzi,", cita Volume/pagina verbatim, kit fisico sempre protagonista.
- **Morfismo**: il software è coerente con kit Omaric + volumi cartacei.
  Palette: Navy `#1E4D8C` / Lime `#4A7A25` / Orange `#E8941C` / Red `#E54B3D`.
  Font: Oswald (titoli) / Open Sans (body) / Fira Code (codice).
  **MAI emoji come icone** → usa `src/components/common/ElabIcons.jsx`.
- **Anti-regressione FERREA**: `npx vitest run` prima E dopo ogni modifica;
  `npm run build` deve passare prima di ogni commit; MAI `git add -A` senza
  controllare `git diff`; MAI `--no-verify`; MAI push diretto su `main` → solo
  branch + PR. Baseline test in `automa/baseline-tests.txt` (pre-commit hook
  confronta il delta).
- **Principi Karpathy**: Think (ragiona prima) · Simple (soluzione più semplice)
  · Surgical (tocca il minimo necessario) · Goal-driven (ogni riga serve un goal).
- **Anti-inflazione G45 (CoV)**: mai inventare numeri; mai inflazionare progress
  ("quasi pronto"=0%, "funziona"=testato davvero); CoV = ripeti `vitest run`,
  indaga la flakiness, non nasconderla.
- **Qualità**: font min 13px, touch target min 44×44px, contrasto WCAG AA;
  niente dati finti/demo; **niente nuove dipendenze npm senza OK di Andrea**.
- **Commit format**: `tipo(area): descrizione` (es. `fix(iter-99): ...`).
- `src/services/api.js` è nella tabella **File critici** di CLAUDE.md: modifica
  solo `compileCode`, sii chirurgico, gira la CoV completa.

──────────────────────────────────────────────────────────────────────
§5. ATOMO ASSEGNATO — P0 #19: rendere la "Compila" ONESTA
──────────────────────────────────────────────────────────────────────
**Problema.** Su produzione (`#compile-home`) il bottone "Compila" mostra
`Compilato — 1.2 KB / 256 KB (0%)` + "Compilazione riuscita ragazzi!", MA quel
risultato è una compilazione **AVR di fallback** (scheda SBAGLIATA), non una
cross-compilazione Renesas Arduino Nano R4.

**Catena (verificata empiricamente).**
- `api.js` `compileCode()` prova `/api/compile/nanor4` → **503**
  `cloud_compile_not_configured` (`ELAB_CLOUD_COMPILE_URL` non settata in Vercel)
  → fallback → `compile-proxy` → webhook **n8n** → compila col **core AVR
  legacy** (NON supporta Renesas RA4M1).
- Un Blink AVR ≈ 1 KB; un Blink reale per Nano R4 ≈ 39 KB. Il "1.2 KB" è AVR,
  etichettato come Nano R4.

**Obiettivo dell'atomo.** La UI **non deve MAI** dichiarare un successo "Nano R4"
quando il risultato proviene dal fallback AVR/n8n. Deve dire la verità — stesso
spirito del disclaimer onesto in `virtualSerialInterpreter.js` ("non dire
'Seriale reale letta' se la board non è collegata").

**Approccio raccomandato (scelte di design APERTE — proponi, non assumere).**
1. `compileCode()` deve restituire la **provenienza**: un campo tipo `provider`
   (es. `'cloud-renesas'` | `'n8n-avr-legacy'` | …). api.js sa già quale ramo
   della catena ha vinto — basta taggarlo.
2. `HomeCompileEntry` / `ScratchCompileBar` ramificano sul `provider`:
   - `cloud-renesas` reale → "Compilato per Nano R4 — X KB" (vero).
   - fallback AVR → messaggio **onesto** (es. "Codice verificato — il
     compilatore Nano R4 non è ancora attivo"); **niente** dimensione
     KB-vs-256KB fittizia; **non** suggerire che è pronto per il kit fisico.
3. **Scelta di design da decidere** (documenta ENTRAMBE le opzioni nella PR,
   raccomandane una, lascia decidere ad Andrea):
   - A) tenere il fallback AVR come "verifica sintassi" etichettato onestamente;
   - B) rimuovere il fallback AVR, mostrare solo "compilatore Nano R4 non
     configurato".

**Decomposizione suggerita** (adattala — sei un agente capace):
1. Test + impl: `compileCode()` aggiunge `provider` a ogni ramo della catena.
2. Test + impl: `HomeCompileEntry` ramifica su `provider`, messaggi onesti.
3. Test + impl: `ScratchCompileBar` mostra la dimensione solo per compile reale
   Nano R4.
4. CoV (`vitest` + `build`) → apri la PR.

──────────────────────────────────────────────────────────────────────
§6. REGOLE FERREE (NON violare)
──────────────────────────────────────────────────────────────────────
- **1 branch nuovo da `main`** (es. `fix/iter-99-compila-onesta`). **1 PR. NO
  merge** — Andrea ratifica ogni PR.
- NO push su `main`. NO `--no-verify`. NO modifiche security/admin.
- **TDD**: scrivi PRIMA i test (es: risultato `provider='n8n-avr-legacy'` ⇒ la
  UI NON rende "Compilazione riuscita / Nano R4" né una dimensione fittizia).
- **CoV**: `npx vitest run` prima e dopo — i test NON devono calare (~14800
  pass; il pre-commit hook confronta con `automa/baseline-tests.txt`).
  `npm run build` deve passare.
- Lingua UI: plurale "Ragazzi", italiano scuola, palette Navy/Lime/Orange/Red,
  icone `ElabIcons` (NO emoji).
- NO dati finti, NO demo, NO numeri inventati (G45).
- Se un hook/guard blocca → **fermati e segnala ad Andrea**, NON bypassare.

──────────────────────────────────────────────────────────────────────
§7. NON FA PARTE DI QUESTO ATOMO (non-goals)
──────────────────────────────────────────────────────────────────────
- Deploy di `infra/cloud-compile/` su Render → **azione di Andrea** (account a
  pagamento ~$7/mo). È il fix "radice" di #19, separato da questo atomo.
- Fase 4 mBlock R3-R14 → solo DOPO che #19 è chiuso.
- Merge delle PR #128/#129/#130 → le ratifica Andrea.

──────────────────────────────────────────────────────────────────────
§8. DELIVERABLE
──────────────────────────────────────────────────────────────────────
- 1 branch + **1 PR** con: il fix honest-Compila + test nuovi.
- Descrizione PR: cosa cambia, quale opzione di design (A/B) scelta +
  l'alternativa, evidenza CoV (output `vitest` + `build`).
- **NON fare merge.** Avvisa che la PR è pronta per la ratifica di Andrea.

──────────────────────────────────────────────────────────────────────
§9. A FINE ATOMO
──────────────────────────────────────────────────────────────────────
Fermati. NON iniziare Fase 4 R3. NO loop. Scrivi un checkpoint onesto: cosa è
fatto, cosa resta, cosa attende Andrea. NON dichiarare nulla "completo" senza
evidenza empirica.

═══ FINE STRINGA ═══
