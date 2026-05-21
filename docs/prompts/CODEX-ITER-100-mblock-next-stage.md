# CODEX ITER-100 — ELAB Tutor next stage: C++ first, mBlock study, Nano R4 honesty

Lingua: italiano. Termini tecnici in inglese ok.

Ruolo richiesto:
Principal Product Engineer + MakeCode/PXT Architect + Blockly UX Engineer + Arduino Nano R4 Compiler Engineer + AI Tutor Designer + QA Lead.

Postura obbligatoria:
massima onesta, zero compiacenza, zero demo finta, zero dati mock spacciati per reali. Se qualcosa non e verificato empiricamente, scrivilo come non verificato. Se il lavoro si ingarbuglia, fermati e fai checkpoint onesto. Non auto-merge. Non dichiarare "funziona" senza test o prova ripetibile.

## Obiettivo

Portare ELAB Tutor allo stadio successivo, senza creare una nuova architettura parallela:

1. C++ libero al centro.
2. Blocchi/snippet drag-and-drop come assistenti visuali.
3. Vista Blockly equivalente quando il codice e riconoscibile.
4. Codice C++ avanzato sempre preservato, mai perso.
5. UNLIM screen-aware: legge stato pagina/editor/blocchi/compile/errori e propone azioni reali.
6. Compilazione browser per Arduino Nano R4 via proxy/cloud, senza localhost come requisito utente.
7. Upload fisico dichiarato riuscito solo dopo flash reale su Nano R4.
8. UI ispirata a mBlock/MakeCode, ma coerente con ELAB, Volume 3, kit Omaric e Principio Zero.

Non partire da feature nuove casuali. Prima capire esattamente cosa esiste, cosa e reale, cosa e finto/legacy, cosa e bloccato da infra o hardware.

## File da allegare/leggere prima, in questo ordine

### Regole e contesto repo

- `.codex/AGENTS.md`
- `CLAUDE.md`
- `docs/handoff/2026-05-20-iter-99-handoff.md`
- `docs/audits/2026-05-20-iter-99-consolidation-session-audit.md`
- `docs/prompts/RALPH-LOOP-mBlock-elab-nanor4-mission.md`
- `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md`

### Fix appena chiuso da non regredire

- PR GitHub: `https://github.com/AndreaMarro/elab-tutor/pull/131`
- Branch: `fix/iter-99-compila-onesta`
- Commit: `a7cd406e`
- `src/services/api.js`
- `src/components/home/HomeCompileEntry.jsx`
- `src/components/simulator/panels/ScratchCompileBar.jsx`
- `src/components/home/UnlimCompileHelper.jsx`
- `tests/unit/api.test.js`
- `tests/unit/components/home/HomeCompileEntry-tabs.test.jsx`
- `tests/unit/components/home/UnlimCompileHelper-honesty.test.jsx`
- `tests/unit/components/simulator/panels/ScratchCompileBar-honest-provider.test.jsx`

### C++ first / Blockly / UNLIM screen-aware

- `src/components/ide/IdeShell.jsx`
- `src/components/ide/CodePalette/CodePalette.tsx`
- `src/components/ide/CodePalette/CodePalette.module.css`
- `src/components/ide/DragDropHandler.ts`
- `src/features/elabBlocks/`
- `src/features/elabBlocks/starterTemplates.*`
- `src/features/elabBlocks/ui/ModeToggle.*`
- `src/features/elabBlocks/ui/StarterButtons.*`
- `src/features/elabBlocks/ui/ElabScratchModeShell.*`
- `src/features/elabArduinoAst/`
- `src/features/unlimScreenAgent/`
- `src/services/virtualSerialInterpreter.js`
- `tests/unit/ide/`
- `tests/unit/elabArduinoAst/`
- `tests/unit/unlimScreenAgent/`

### Compile/upload Nano R4

- `api/compile/nanor4.js`
- `infra/cloud-compile/server.js`
- `infra/cloud-compile/Dockerfile`
- `infra/cloud-compile/render.yaml`
- `supabase/functions/compile-proxy/index.ts`
- `src/components/lavagna/CompileUploadButton.jsx`
- `src/services/webDfuFlash.js`
- `src/boards/arduino-nano-r4.json`
- `tests/unit/api/compile-nanor4-proxy.test.js`
- `tests/unit/components/lavagna/CompileUploadButton.test.jsx`
- `tests/unit/components/lavagna/CompileUploadButton-states.test.jsx`
- `tests/unit/services/webDfuFlash.test.js`
- `tests/unit/services/compiler-nano-r4-fqbn.test.js`
- `tests/unit/breaknano.physical.test.js`

### Volume 3 e percorso didattico

- `src/data/experiments-vol3.js`
- `src/data/volume-references.js`
- `src/data/lesson-groups.js`
- `src/data/chapter-map*`
- `tests/unit/v3Cap6Esp1BookParity.test.js`
- `tests/unit/volume3.connections.test.js`
- `tests/unit/pdr-69-experiments.test.js`
- `tests/unit/dataIntegrity.cross.test.js`

### Audit/test/gate

- `package.json`
- `vitest.config.js`
- `automa/baseline-tests.txt`
- `.git/hooks/pre-push`
- `scripts/feature-parity-snapshot.sh`
- `scripts/anti-inflation-gate.sh`

## Fonti esterne da analizzare, non copiare alla cieca

Apri e documenta con screenshot/note:

- `https://www.elabtutor.school/#compile-home`
- `https://ide.mblock.cc/`

Studia come riferimenti architetturali, senza introdurre dipendenze nuove senza OK Andrea:

- `microsoft/pxt`
- `microsoft/pxt-microbit`
- `OpenRoberta/openroberta-lab`
- `BlocklyDuino/BlocklyDuino-v2`
- `RaspberryPiFoundation/blockly-samples`
- `scratchfoundation/scratch-blocks`
- `scratchfoundation/scratch-editor`
- `tree-sitter/tree-sitter-cpp`
- `arduino/arduino-cli`
- `arduino/ArduinoCore-renesas`

## Vincoli tecnici non negoziabili

- Board target: Arduino Nano R4.
- FQBN corretto: `arduino:renesas_uno:nanor4`.
- Nano R4 non e AVR. Non usare pattern AVR-only (`PORTB`, `DDRD`, `TCCR`, `OCR`, `TIMSK`, `avr/io.h`) nel percorso Nano R4.
- In produzione il browser deve compilare tramite `/api/compile/nanor4` o proxy server-to-server sicuro.
- Nessuna chiave Render/API segreta nel bundle browser.
- Non dire "Compilato per Nano R4" se il provider non e `cloud-renesas`.
- Non dire "Caricato" senza `FLASH_SUCCESS_REAL`.
- Senza Nano R4 fisica puoi testare UI, Blockly, C++, compile cloud, artifact, errori, WebUSB mock. Non puoi verificare flash reale, DFU reale, VID/PID runtime reale o LED fisico.

## Regola di lavoro

Lavora a sprint atomici. Ogni sprint produce al massimo una PR. Non fare merge. Non pushare su main.

Prima di implementare:

1. Leggi i file obbligatori.
2. Recupera lo stato git.
3. Crea branch da `main`.
4. Esegui baseline CoV.
5. Scrivi test RED per l'atomo scelto.
6. Implementa il minimo.
7. Riesegui CoV.
8. Apri PR con descrizione onesta.
9. Fermati.

Se trovi working tree sporco, non revertare modifiche non tue. Stage selettivo, mai `git add -A`.

## Sprint proposti

### Sprint 100.0 — Recovery + audit live comparativo

Scopo: capire prima di costruire.

Deliverable:

- Audit live `#compile-home` con screenshot desktop/tablet.
- Audit live mBlock con screenshot e note UX.
- Tabella gap: ELAB oggi vs mBlock vs target ELAB.
- Elenco bug/ambiguita classificati P0/P1/P2.
- Una raccomandazione secca per il primo atomo implementativo.

CoV:

- `npx vitest run` baseline.
- `npm run build` solo se vengono modificati file.
- Documentare eventuali fail pre-esistenti, senza nasconderli.

Audit periodico:

- Alla fine dello sprint creare `docs/audits/YYYY-MM-DD-iter-100-live-mblock-audit.md`.

Non-goal:

- Non implementare feature in questo sprint se l'audit non e chiaro.

### Sprint 100.1 — Compile endpoint unico e sicurezza path produzione

Scopo: chiudere l'ambiguita tra proxy sicuro e path diretto Render/client key.

Ipotesi da verificare, non assumere:

- `HomeCompileEntry` usa `compileCode()` correttamente.
- `CompileUploadButton` potrebbe avere path diretto a `VITE_ELAB_CLOUD_COMPILE_URL`/`VITE_ELAB_API_KEY`.
- In produzione il browser deve preferire `/api/compile/nanor4`.

Deliverable:

- Test che il path produzione non richieda chiavi client-side.
- UI/servizio coerenti: compile via proxy, upload separato.
- Nessuna regressione sul fix PR #131.

CoV:

- Test RED mirato prima.
- Test mirati post.
- `npx vitest run`.
- `npm run build`.

### Sprint 100.2 — C++ first: palette azioni dentro editor

Scopo: l'utente scrive C++ liberamente e puo inserire snippet Arduino da palette.

Deliverable:

- Palette azioni: Accendi LED, Spegni LED, Attendi, Leggi pulsante, Leggi sensore, Scrivi seriale.
- Click-to-insert al cursore.
- Drag-to-insert al cursore.
- Anteprima codice prima dell'inserimento.
- Test unit `DragDropHandler`/`CodePalette`.

Regola UX:

- Non usare termini grezzi come `digitalWrite` nel label principiante.
- Lo snippet puo contenere commento didattico breve, ma niente testo invadente nell'app.

### Sprint 100.3 — Blockly come vista equivalente, non gabbia

Scopo: Blockly deve assistere il C++, non sostituirlo.

Deliverable:

- Blink roundtrip stabile: Blockly -> AST -> C++ -> AST -> Blockly.
- Codice non riconosciuto preservato come `UnsupportedCppBlock`.
- Nessuna perdita codice utente.

CoV:

- Unit AST roundtrip.
- Unit unsupported C++ preserved.
- Build.

### Sprint 100.4 — UNLIM screen-aware operativo

Scopo: UNLIM non deve solo parlare. Deve leggere stato e proporre/eseguire azioni reali.

Screen context minimo:

```json
{
  "route": "compile-home",
  "editorMode": "cpp|blocks|split",
  "cppCode": "...",
  "blockCount": 0,
  "selectedText": null,
  "selectedBlock": null,
  "compileStatus": "idle|compiling|success|verified-legacy|error",
  "compileProvider": "cloud-renesas|n8n-avr-legacy|none",
  "compileTarget": "arduino:renesas_uno:nanor4",
  "lastCompilerError": null,
  "boardConnected": false,
  "uploadState": "not_attempted_without_board"
}
```

Azioni minime:

- `createBlinkProgram`
- `insertSnippetAtCursor`
- `convertCppToBlocks`
- `convertBlocksToCpp`
- `explainSelectedCode`
- `fixCompilerError`
- `compileNanoR4`

### Sprint 100.5 — UX mBlock-inspired, ELAB-native

Scopo: portare la pagina a una UX piu chiara, senza copiare branding o creare una landing.

Deliverable:

- Header compatto.
- Editor sopra la piega.
- Modalita `[Blocchi] [C++] [Vista doppia]` se tecnicamente pronta, altrimenti non mostrarla.
- Vignetta UNLIM laterale non invasiva.
- Stato compile leggibile e onesto.
- Niente doppio onboarding.
- Nessuna schermata vuota.
- Test iPad/tablet viewport.

### Sprint 100.6 — Volume 3 canonical map

Scopo: allineare software e libro fisico.

Deliverable:

- Audit Volume 3 libro vs `experiments-vol3.js`.
- Mappa canonica proposta.
- Classificazione esperimenti: fedele, estensione, extra, da parcheggiare, da correggere.

Non-goal:

- Non riscrivere tutti gli esperimenti in una sola PR.

### Sprint 100.7 — Hardware real test protocol

Scopo: preparare test reale Nano R4 quando Andrea ha la scheda.

Deliverable:

- Procedura test fisico Chrome/Edge desktop.
- Checklist cavo USB-C dati, bootloader/DFU, picker WebUSB, flash, LED.
- Stati UI attesi per success/failure.
- Cosa si puo dire a Riccardo e cosa non si puo dire.

## CoV periodica obbligatoria

Ogni atomo:

- Prima: `npx vitest run` oppure motivare se si parte da subset per carico macchina.
- Dopo test RED: dimostrare fallimento mirato.
- Dopo fix: test mirati verdi.
- Prima commit: `npm run build`.
- Prima push: lasciare passare hook, mai `--no-verify`.

Ogni 2 sprint:

- `npx vitest run` completo.
- `npm run build`.
- Audit `git diff --check`.
- Verifica bundle/grep: nessuna secret client-side, nessun falso "Caricato", nessun falso "Compilato per Nano R4" su provider legacy.

Ogni 4 sprint:

- Audit live browser desktop.
- Audit viewport tablet/iPad.
- Confronto con mBlock: cosa ELAB ha raggiunto, cosa no.
- Documento audit in `docs/audits/`.

## Audit live da fare nello Sprint 100.0

Su ELAB `https://www.elabtutor.school/#compile-home` documenta:

- Primo viewport: cosa si capisce in 5 secondi.
- Quanti pulsanti di compile/upload sono visibili.
- Se "Compila" e "Carica" sono separati e onesti.
- Se la pagina mostra provider/stato reale o messaggi ambigui.
- Se Blockly parte vuoto o con starter utile.
- Se C++ e accessibile senza frizione.
- Se UNLIM vede stato editor/compile o e solo chat.
- Se il risultato fallback legacy e etichettato correttamente dopo PR #131.
- Errori console/network.
- Screenshot desktop e tablet.

Su mBlock `https://ide.mblock.cc/` documenta:

- Struttura layout.
- Come presenta blocchi, codice, dispositivi, upload.
- Come gestisce onboarding e stato progetto.
- Come evita schermate vuote.
- Cosa e utile per ELAB.
- Cosa NON va copiato perche non coerente con kit fisico/Volume 3/Nano R4.

## Definizione di "stadio successivo"

Non significa "tutto finito". Significa una vertical slice reale e onesta:

1. Apro `#compile-home`.
2. Vedo C++ come modalita centrale o chiaramente disponibile.
3. Posso inserire snippet Arduino da palette senza conoscere `digitalWrite`.
4. Posso vedere o generare blocchi equivalenti per Blink.
5. UNLIM sa in che stato e la pagina e propone l'azione giusta.
6. Premo Compila.
7. Se cloud Renesas e attivo: UI dice "Compilato per Nano R4".
8. Se cloud non e attivo e parte fallback legacy: UI dice solo "Codice verificato", non "Nano R4 compilato".
9. Se non ho Nano R4: UI non dice "Caricato".
10. Se ho Nano R4 e flash reale riesce: solo allora UI dice "Caricato".

## Output richiesto a ogni PR

La PR deve contenere:

- Cosa cambia.
- Quale problema risolve.
- Cosa NON risolve.
- CoV con comandi e risultati.
- Screenshot se tocca UI.
- Rischi residui.
- Prossimo atomo consigliato.
- Se applicabile: cosa Andrea puo dire a Riccardo e cosa NON puo dire.

## Frasi vietate se non verificate

- "Compilazione Nano R4 funzionante" se non arriva da `cloud-renesas`.
- "Upload funzionante" senza Nano R4 fisica e flash reale.
- "Conversione C++ completa" se esiste solo subset.
- "mBlock-like completato" se hai solo copiato layout o palette.
- "Pronto per Riccardo" senza checklist di cosa funziona/non funziona.

## Primo comando operativo consigliato

```bash
git checkout main
git pull --ff-only
git checkout -b audit/iter-100-live-mblock
npx vitest run
```

Poi apri browser su:

- `https://www.elabtutor.school/#compile-home`
- `https://ide.mblock.cc/`

e produci lo Sprint 100.0 audit prima di qualsiasi feature.
