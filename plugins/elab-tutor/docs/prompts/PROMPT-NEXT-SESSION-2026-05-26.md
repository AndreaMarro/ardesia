# PROMPT NEXT SESSION — 2026-05-26

**Sessione precedente firma**: Claude Opus 4.7 — 25/05/2026 PM — 8 commit shipped (revert e290f779 lineage + visibility filter ba82df0f + Carica esp + Battery filetti + unknown bug + Blockly numero CSS + v1-cap9-esp6 + v3-cap6-esp4) — deploy prod `https://elab-tutor-3930ktzs9-andreas-projects-6d4e9791.vercel.app` + elabtutor.school HTTP 200.

---

## REGOLE FERREE PRE-SESSIONE

1. **NO DOMANDE A ANDREA**. Esegui in autonomia. Solo se TROVI ambiguità reale documentata + bloccante → stop con UNA domanda telegrafica. Altrimenti DECIDI e procedi.
2. **MOLTI TEST**, non parole. Ogni claim deve essere supportato da: vitest run output OR live preview screenshot OR DOM inspect OR Bash command output.
3. **NON ricadere nelle modifiche demo**. CLAUDE.md ha sezione "REVERT POST-DEMO 25/05/2026 — STATO IMMUTABILE". Leggi PRIMA di toccare simulator/experiments.
4. **8 esp whitelist FISSO** unless Andrea OK swap. Source `src/data/experiment-visibility.js`. NO auto-aggiungere ID.
5. **Caveman mode** comunicazione. Fragments OK. Code/commit/security: normal.
6. **Verify before completion** mandatory. Ogni fix → live verify via preview_eval OR vitest.
7. **CoV 3× vitest** prima di claim "test passano".
8. **Battery9V.jsx INTOCCABILE**. Andrea verbatim "fili che partono così OK".

---

## TASK LIST P0 — ESEGUI TUTTI IN ORDINE

### P0.1 — Setup baseline (5min)
- [ ] `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"`
- [ ] `git status --short` + `git log --oneline -10` + `git branch --show-current` recon
- [ ] `curl -s -o /dev/null -w "HTTP %{http_code}\n" https://www.elabtutor.school` verify prod
- [ ] `npx vitest run --reporter=default 2>&1 | tail -5 > /tmp/baseline-26may.txt; cat /tmp/baseline-26may.txt` baseline post-sessione 25/05
- [ ] Read `CLAUDE.md` sezioni "REVERT POST-DEMO" + "ESPERIMENTI VISIBILI"
- [ ] Read `docs/HIDDEN-EXPERIMENTS-RESTORE.md`

### P0.2 — Andrea bug report 25/05 PM screenshot (FIX TUTTI)

#### P0.2a — Red LED fuori breadboard in semaforo v3-cap6-esp5
**Screenshot Andrea**: semaforo loaded "Già Montato", 3 LED + 3 R, ma LED rosso (led3) renderizzato FUORI breadboard a destra. Labels overlap "R1 LED1 LED2 LED3".

Investigare:
- [ ] Read `src/data/experiments-vol3.js` v3-cap6-esp5 layout.led3 + pinAssignments.led3
- [ ] led3:anode = bb1:d21, cathode = bb1:d22 (per pinAssignments)
- [ ] Layout x/y led3 calcolare correttamente da bb1.x + col 21 offset
- [ ] Live mount v3-cap6-esp5 → screenshot Già Montato view → verifica posizione
- [ ] Fix layout coords led3 per allinearlo nel breadboard
- [ ] Fix label overlap (sovrapposizione testi LED1/LED2/LED3) — z-index OR offset Y
- [ ] Live re-verify screenshot
- [ ] Vitest run delta confirm no regression

#### P0.2b — Vol3 swap Blink → "2 LED sirena" (FATTO 25/05 PM)
GIA SWAPPATO via commit (25/05 PM). VISIBLE_EXP_IDS contiene `v3-cap6-esp4`. Live verify:
- [ ] Mount v3-cap6-esp4 "Due LED che si alternano" → screenshot
- [ ] Verifica code C++ pin 6+9 alterating
- [ ] Verifica Avvia button visible

#### P0.2c — Blockly + Arduino + C++ funzionino DAVVERO
Andrea verbatim 25/05 PM: "che blockly e arduino funzionino veramente e anche c++". Live verify:
- [ ] Navigate `#compile-home` route
- [ ] Tab Blocchi → drag arduino_digital_write block from toolbox to workspace → verify dropped block visible
- [ ] Tab C++ → edit code arbitrary content → switch tab Blocchi → verify cppToBlocklyXml translates (or graceful null)
- [ ] Click "Compila" button → verify arduino-cli compile success (HTTP request to n8n compile)
- [ ] Verify result.success = true + flash size visible
- [ ] Navigate `#lavagna` v3-cap6-esp4 Arduino esp → editor right pane → verify code render
- [ ] Click Avvia → verify status running + LED toggle simulation
- [ ] Console errors check (preview_console_logs level=error)

Caso failure:
- [ ] grep `compileError` in code path + identify error
- [ ] Fix con TDD: test failing → fix → test green
- [ ] DO NOT skip these tests

#### P0.2d — Play/Pause/Stop buttons Arduino esp BROKEN — "non va proprio"
Andrea verbatim 25/05 PM: "gli esperimenti con arduino abbiano tasto play e pausa e stop perchè ora non va proprio".

Investigare:
- [ ] Read `src/components/simulator/panels/MinimalControlBar.jsx` linee 211-300 isArduinoExperiment conditional
- [ ] Verify Avvia/Pause/Stop buttons rendering quando simulationMode==='avr'
- [ ] Live mount v3-cap5-esp1 Blink + v3-cap6-esp4 + v3-cap6-esp5
- [ ] Per ogni esp: screenshot toolbar + verify 3 button presence (Play/Pause/Stop)
- [ ] Click Play → verify isRunning=true + Pause shown
- [ ] Click Pause → verify paused + Play shown
- [ ] Click Stop OR Reset → verify state reset
- [ ] If buttons NOT visible OR broken: fix MinimalControlBar conditional render
- [ ] If AVR sim non parte: investigate AVRBridge.start() chain + handlePlay
- [ ] Console + network inspect during play

#### P0.2e — Block deletion E2E live verify
- [ ] Mount v1-cap6-esp1 → add LED via palette → right-click → context menu Elimina → click → verify LED removed from canvas
- [ ] Add R via palette → right-click → Elimina → verify removed
- [ ] Test with multiple block types
- [ ] Test KEYBOARD DEL key after select component
- [ ] Console errors check

### P0.3 — Vol3 v0.16 full data resync (P1 if time)

Andrea originale 25/05 PM: "carica anche il vero volume 3 al posto di quello che c'è ora". 21 esp Vol3 hidden NOT resincronizzati. Solo 2 visible verified vs book.

Per ogni Vol3 esp (cap5: 2, cap6: 8, cap7: 7, cap8: 6 = 23 esp):
- [ ] Compare title + desc + code + components vs `/Users/andreamarro/VOLUME 3/VOLUMI pdf e MD/Manuale vol 3 versione 0.16.pdf`
- [ ] Use `pdftotext -layout` extraction to /tmp
- [ ] For each esp drift → fix experiments-vol3.js + lesson-path JSON if needed
- [ ] Track in `/tmp/vol3-resync-report.md` per-esp status

NOTA: Solo 2 esp Vol3 visible UI ora (cap6-esp4 sirena + cap6-esp5 semaforo). Other 21 hidden. Priority: visible 2 PRIMA. Then if time, hidden esp.

### P0.4 — Vol2 verify hidden esp vs book v0.1 (P2)

`/Users/andreamarro/VOLUME 3/VOLUMI pdf e MD/MANUALE VOLUME 2 ITALIANO.pdf` — Vol2 esp1-27 vs current experiments-vol2.js. Solo v2-cap7-esp1 fixato 25/05 (Carica condensatore). Altri 25 esp NON verificati.

- [ ] Extract Vol2 PDF text per chapter
- [ ] Compare visible v2-cap7-esp2 vs book Vol2 pag 69-71
- [ ] Fix drifts in esp visible whitelist
- [ ] Defer hidden 23 esp Vol2 unless Andrea ratify

### P0.5 — §2 JSON Export sessione (P1 if time after P0.2)

Design approved 25/05 PM 18:11. Spec doc NOT written. ZERO code. 6 atoms pending:
- ATOM A1: `src/services/sessionExporter.js` ~80 LOC
- ATOM A2: `src/services/sessionImporter.js` ~120 LOC
- ATOM A3: `src/components/lavagna/SessionExportModal.jsx` ~150 LOC + css
- ATOM A4: localStorage auto-snapshot 30s hook
- ATOM A5: Unit tests (vitest) 2 files
- ATOM A6: E2E Playwright spec

Spec schema v1.0 (minimal, LLM-friendly):
```json
{
  "elab_session_export": {
    "version": "1.0",
    "exportedAt": "ISO8601",
    "experiment": { "id": "v1-cap6-esp1", "title": "...", "volume": 1, "chapter": 6 },
    "modalita": "passo-passo|gia-montato|percorso",
    "components": [{ "id": "led1", "type": "led", "x": 240, "y": 180, "rotation": 0, "color": "red", "value": null }],
    "wires": [{ "id": "w1", "from": "led1:anode", "to": "bb1:row-5-a", "color": "red" }]
  }
}
```

UI: AppHeader "Salva" → modal 3 options (Supabase / Esporta JSON / Importa JSON).

### P0.6 — CoV fine sessione (MANDATORY)

- [ ] `npx vitest run` 3 volte separate, output deve essere identico
- [ ] `npm run build` 2 volte, entrambe exit 0
- [ ] `npm run build` final + verify `dist/assets/*.js` no chunk >2MB warning
- [ ] Live preview navigate 5 user flow:
  1. Lavagna picker shows 5 lesson (2 vol1 + 1 vol2 + 2 vol3)
  2. v1-cap6-esp1 mount → Battery render + breadboard + Passo Passo panel
  3. v1-cap9-esp6 mount → 3 pot + RGB LED visible
  4. v2-cap7-esp1 mount → title "Carica del condensatore con multimetro"
  5. v3-cap6-esp4 mount → 2 LED sirena + Avvia button works
- [ ] Quality audit skill run
- [ ] Memory observation_add session summary

### P0.7 — Deploy prod + verify

- [ ] git commit (atomic per fix)
- [ ] git push origin fix/unlim-compile-helper-mascot-tweak-2026-05-24
- [ ] Pre-push gate PASS
- [ ] `npx vercel --prod --yes` → ottieni deploy URL + ID
- [ ] curl HTTP 200 elabtutor.school + deploy URL
- [ ] Andrea live verify

---

## EVIDENCE REQUIREMENTS PER OGNI FIX

Per OGNI cambiamento, allega evidence:
1. **BEFORE state**: screenshot OR DOM inspect output OR file content snippet
2. **CHANGE**: git diff stat
3. **AFTER state**: screenshot OR vitest output OR build log
4. **Anti-regression**: vitest count delta vs baseline

NO claim "fixed" senza evidence concreta.

---

## ANTI-PATTERN (red flags STOP)

- Sei tentato di rispondere con "Vado a fare X" senza fare X → STOP, fa X
- Sei tentato di chiedere "vuoi che..." → STOP, decidi e fai
- Sei tentato di scrivere docs invece di codice → STOP, scrivi codice
- Sei tentato di "verificare dopo" → NO, verifica subito
- Sei tentato di skippare CoV "for speed" → NO, CoV mandatory
- Sei tentato di committare con baseline diversa → STOP, indaga delta
- Sei tentato di toccare Battery9V.jsx → STOP, Andrea verbatim "intoccabile"
- Sei tentato di re-introdurre bookGeometry/demo-mode/renderMode='clip_simplified' → REGRESSION, leggi CLAUDE.md REVERT section

---

## PROD STATE 25/05 PM (verifica live primo turno)

- **URL prod**: https://www.elabtutor.school
- **Latest deploy**: `https://elab-tutor-3930ktzs9-andreas-projects-6d4e9791.vercel.app`
- **Branch**: `fix/unlim-compile-helper-mascot-tweak-2026-05-24` (75+ commit ahead main)
- **Test baseline post-revert**: 14 fail | 15889 pass | 15 skip | 10 todo
- **Whitelist 8 esp**: v1-cap6-esp1/2/3 + v1-cap9-esp6 + v2-cap7-esp1/2 + v3-cap6-esp4/esp5
- **Lessons visible**: 5 (v1-accendi-led + v1-potenziometro + v2-condensatori-rc + v3-cap5-blink ? + v3-cap6-digitali)

WAIT: v3-cap5-blink lesson aveva solo v3-cap5-esp1 visibile. Ora che v3-cap5-esp1 è SWAPPED OUT → lesson v3-cap5-blink ha ZERO visible → SHOULD BE HIDDEN. Verify lesson filter funziona ancora correttamente.

Also: v3-cap6-esp4 è in lesson v3-cap6-digitali (con esp1-esp8). Lesson già visible per esp5 semaforo. Now ALSO esp4 visible → 2 esp visible in lesson v3-cap6-digitali.

Final state:
- Vol1: v1-accendi-led (3 esp) + v1-potenziometro (1 esp v1-cap9-esp6)
- Vol2: v2-condensatori-rc (2 esp)
- Vol3: v3-cap6-digitali (2 esp: esp4 + esp5) — lesson v3-cap5-blink ora HIDDEN ZERO esp

Total lessons visible = 4 (NOT 5). Verifica in preview live.

---

## TIPS Operativi

- Use `mcp__Claude_Preview__preview_*` tools per live verify (server already running pr163-dev)
- Use `mcp__claude-mem__search` per cercare prior fix
- Use `superpowers:systematic-debugging` per bug deep dive
- Use `superpowers:test-driven-development` per nuove feature
- Use `Bash` con `run_in_background: true` per long-running (vitest full)
- Caveman mode ATTIVO — fragments OK, no fluff

---

## FINE SESSIONE CHECKLIST

- [ ] Tutti task #1-#7 completed OR documented WHY non fattibili
- [ ] CoV 3× pass
- [ ] Deploy live + HTTP 200 verify
- [ ] Andrea screenshot review live state
- [ ] observation_add session summary
- [ ] Update PROMPT-NEXT-SESSION-2026-05-27.md con debito residuo

---

**FINE PROMPT**. Vai. Niente domande. Tantissimi test. Andrea aspetta risultati.
