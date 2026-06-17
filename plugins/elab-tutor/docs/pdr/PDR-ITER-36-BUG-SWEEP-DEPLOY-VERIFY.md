# PDR ITER 36 — Bug Sweep + Deploy Verify + Onnipotenza Wire

**Data**: 2026-04-30 PM (PDR-A iter 36 — Sessione 1/3 della cascata "Eseguibile-Tutto-Risolto")
**Branch**: `e2e-bypass-preview`
**Pattern**: 7-agent OPUS orchestrato parallel + Mac Mini continuous mapping H24
**Anti-inflation**: G45 — score capped finché Opus-indipendente non valida
**Anti-regressione**: vitest baseline 13233 PASS NEVER scendere, build PASS NEVER skip, pre-push hook NEVER bypass

---

## §0 — PRINCIPIO ZERO + MORFISMO compliance gate (OBBLIGATORIO ogni atom)

**Reference autoritativo**: `CLAUDE.md` "DUE PAROLE D'ORDINE" §1+§2.

**PRINCIPIO ZERO** (pedagogico): Docente è tramite. UNLIM strumento docente. Studenti lavorano kit fisico. Linguaggio plurale "Ragazzi," + cita Vol/pag VERBATIM tra «caporali». ≤60 parole + 1 analogia. Kit fisico ELAB (breadboard) SEMPRE menzione. NO "puoi fare in simulatore" — sempre "costruite sul vostro kit + verifichiamo insieme".

**MORFISMO Sense 1** (tecnico-architetturale): Software morfico runtime. ToolSpec 62 declarative + L1 composite + L2 templates 20/20 LIVE + L3 morphic DEV. Mutaforma per-classe/per-docente/per-kit. Onniscenza 7-layer cross-pollination. Ogni feature iter 36 atom DEVE preservare morphic runtime adapt (NO static config).

**MORFISMO Sense 1.5** (adattabilità docente/classe/UI): Esperienza adattiva multi-dimensionale. Mascotte morphic states (idle/pointing/talking/chatbot-shortcut iter 36 Atom A13). Finestre morfiche resolution-aware (LIM 1080p vs 4K vs iPad vs mobile). Toolbar morphic 4 strumenti core. Layout LIM hero state vs Dashboard puntuale.

**MORFISMO Sense 2** (strategico-competitivo triplet): Software ↔ Kit Omaric ↔ Volumi Davide cartacei = singola esperienza unificata. SVG simulator identici Arduino Nano kit fisico. Palette ELAB = palette stampa volumi (Navy #1E4D8C / Lime #4A7A25 / Orange #E8941C / Red #E54B3D). Iconografia derivata volumi NON material-design generic. Voxtral voice clone Andrea narratore = stesso registro Volumi Davide. 92 esperimenti software = 92 esperimenti libri (numerazione + ordine + parole-chiave identici).

### Gate compliance check ogni atom (Pattern S r3)

Prima merge ogni atom DEVE PASS:

1. ✅ **Linguaggio**: plurale "Ragazzi," + Vol/pag verbatim + ≤60 parole + analogia (PZ V3 12-rule scorer)
2. ✅ **Kit fisico mandatory**: mention "breadboard" / "kit ELAB" / "vostro kit" almeno 1 volta per ogni response/tooltip/empty state
3. ✅ **Palette compliance**: hard-coded colors VIETATI (use design-tokens variables Navy/Lime/Orange/Red)
4. ✅ **Iconografia volumi-derived**: NO material-design generic icons (use ElabIcons 24 SVG existing)
5. ✅ **Morphic runtime**: NO static config (es. L2 template router DEVE selectTemplate dinamicamente)
6. ✅ **Cross-pollination Onniscenza**: layer L1+L4+L7 minimum injected ogni response chat
7. ✅ **Triplet coerenza**: nuovo SVG component → identico kit Omaric (verify foto fisico)
8. ✅ **Multimodale**: Voxtral voice clone Andrea IT preserved + Vision Gemini Flash EU + STT CF Whisper EU edge

**Anti-pattern rejection automatica** (Test Morfismo `.impeccable.md`):
- ❌ Componenti SVG palette generica (es. blu/rosso standard)
- ❌ UNLIM parafrasa libro invece citarlo
- ❌ Capitoli software titoli inventati (NO "Cap. 1: Introduzione")
- ❌ Esperimenti software che esistono SOLO software (NON in libro)
- ❌ Layout simulatore non riconducibile setup fisico kit
- ❌ Imperative singolare "fai/collega/premi" → MUST plurale "Ragazzi" + "fate/collegate/premete"

**Test Morfismo finale**: prendi pagina random Volume + screenshot random software iter 36. Se NON sembrano "lo stesso prodotto fatto da persone che hanno parlato" → ATOM REJECTED + revert.

**Anti-inflation G45**: NO claim "Morfismo compliant" senza gate 8/8 PASS file-system verified Opus-indipendente review.

---

## §1 — Goal imperativo

A fine sessione TUTTI i seguenti DEVONO essere VERIFIED LIVE prod:

1. ✅ Toast "Nessuna sessione salvata" SCOMPARSO (Fumetto stub session funziona — verifica Playwright clic Fumetto + screenshot)
2. ✅ Modalità "Percorso" VISIBILE in ModalitaSwitch dropdown (4/4 modes: percorso + passo-passo + gia-montato + libero)
3. ✅ Passo Passo pannello LessonReader RESIZABLE (drag corner) + DRAGGABLE (header) — wrap in `FloatingWindow`
4. ✅ UNLIM tabs sovrapposizione SCOMPARSA (verifica Control Chrome z-index + width chat panel)
5. ✅ Compile server LIVE (post-Andrea SSH n8n fix arduino-cli)
6. ✅ Wake word "Ehi UNLIM" toast permission denied appare (Bug 8 fix verifica)
7. ✅ Lavagna persistence Esci NON sparisce (Bug 2 fix verifica + Playwright sequence)
8. ✅ Vision Gemini Flash EU Frankfurt LIVE prod (deploy + smoke 1 chiamata)
9. ✅ Onnipotenza dispatcher 62-tool wired post-LLM `[INTENT:{...}]` parser (NEW iter 36 P0)
10. ✅ Latency p95 chat <4s warm (post Mistral + Gemini Flash-Lite routing 50/15/15/20)

**Score iter 36 target ONESTO G45 cap**: **8.5/10** (iter 35 8.0 + 0.5 lift).

---

## §2 — Team 7 agenti orchestrato

| Ruolo | Agent type | File ownership | Tools/skills |
|-------|------------|----------------|--------------|
| **Maker-1 (gen-app)** | `backend-development:backend-architect` | `src/components/**` (NON engine), `supabase/functions/**` | `/audit` `/code-review` `/firecrawl` CoV systematic-debugging |
| **Maker-2 (architect)** | `feature-dev:code-architect` | `docs/adrs/**`, `docs/architectures/**`, READ-ONLY `src/` | `/audit` `/firecrawl` Karpathy 4-principles |
| **WebDesigner-1 (visual)** | `application-performance:frontend-developer` | `src/styles/**`, `src/components/lavagna/**.module.css` | `/impeccable:colorize` `/impeccable:typeset` `/impeccable:arrange` `/canvas-design` `/algorithmic-art` |
| **WebDesigner-2 (UX)** | `feature-dev:code-architect` (UX role) | `src/components/common/**`, JSX inline styles | `/impeccable:critique` `/impeccable:onboard` `/impeccable:polish` `/impeccable:overdrive` `design:design-critique` `design:accessibility-review` |
| **Tester-1 (E2E)** | `agent-teams:team-debugger` | `tests/e2e/**`, `tests/integration/**` | Playwright MCP + Control Chrome MCP + `/clarify` `/firecrawl` |
| **Tester-2 (debug)** | `debugging-toolkit:debugger` | `tests/unit/**`, `automa/team-state/messages/**` | `/systematic-debugging` `/parallel-debugging` `/agent-teams:team-debug` |
| **Documenter (scribe+research)** | `general-purpose` | `docs/handoff/**`, `docs/audits/**`, `automa/state/**`, `docs/research/**` | `/mem-search` `/timeline` `/firecrawl` `WebSearch` `/notion-search` `/atlassian:search-company-knowledge` |

**Inter-agent communication**: filesystem `automa/team-state/messages/{from-agent}-iter36-to-{to-agent}-{ISO-timestamp}.md`. Pattern: `## STATUS: completed|blocked|in_progress` + `## DELIVERABLES:` + `## HANDOFF:`.

**Race-cond fix Pattern S r3**: tutti i 7 agenti EMETTONO completion msg PRIMA che Documenter scribe parta. Phase 2 sequential. ENFORCED via filesystem barrier check 7/7 messages presenti.

**Mac Mini autonomous H24** (`progettibelli@100.124.198.59` SSH `~/.ssh/id_ed25519_elab`):

- **Cron 60s warm-up Edge Functions** (5 endpoint OPTIONS GET ping)
- **Cron 5min Playwright + Control Chrome MCP smoke prod** mapping `https://www.elabtutor.school`:
  - Homepage → 5 card click → screenshot ognuna
  - Lavagna → 4 modalità switch (percorso/passo-passo/gia-montato/libero) → screenshot ognuna
  - UNLIM panel apri → input "Ciao" → screenshot risposta + audio + tabs
  - Simulator → mountExperiment(v1-cap6-esp1) → screenshot circuit
  - Scratch tab → screenshot blockly
  - Fumetto button → screenshot popup
  - Console.log captured
  - Network requests captured
  - Errori CSS+JSX raw signals
- **Cron 15min log aggregation** push branch `mac-mini/iter36-mapping-YYYYMMDD-HHMMSS` → MacBook fetch → diff vs precedente → segnala regressioni nuove

**MacBook orchestrator** legge Mac Mini logs ogni 15min, identifica nuovi bug, dispatcha agent appropriato (Tester-2 → systematic-debugging → Maker-1 → fix → re-deploy → re-verify).

---

## §3 — Atomi imperativi (12 ATOM-S36)

### Atom A1 — Maker-1 — Onnipotenza dispatcher 62-tool wire (P0 critico)

**File**: `supabase/functions/_shared/intent-parser.ts` (NEW ~120 LOC) + `supabase/functions/unlim-chat/index.ts` (modify post-LLM block)

**Spec imperativo**:

```typescript
// NEW supabase/functions/_shared/intent-parser.ts
export interface IntentTag {
  raw: string;          // "[INTENT:{...}]"
  tool: string;         // "highlightComponent"
  args: Record<string, unknown>;
  startIdx: number;
  endIdx: number;
}

export function parseIntentTags(text: string): IntentTag[] {
  const re = /\[INTENT:(\{[\s\S]*?\})\]/g;
  // ... parse + JSON.parse args defensive
}

export function stripIntentTags(text: string): string {
  return text.replace(/\[INTENT:\{[\s\S]*?\}\]/g, '').replace(/\s+/g, ' ').trim();
}
```

```typescript
// MODIFY supabase/functions/unlim-chat/index.ts post-LLM block
import { parseIntentTags, stripIntentTags } from '../_shared/intent-parser.ts';
import { dispatchTool } from '../_shared/clawbot-dispatcher.ts'; // existing 62-tool

// after llmResult.text obtained:
const intents = parseIntentTags(llmResult.text);
const cleanText = stripIntentTags(llmResult.text);
const dispatchResults = await Promise.all(
  intents.map(async (intent) => {
    try {
      return await dispatchTool(intent.tool, intent.args, { sessionId, experimentId });
    } catch (e) {
      return { ok: false, tool: intent.tool, error: e.message };
    }
  })
);
// surface in response: { text: cleanText, intents_executed: dispatchResults, ... }
```

**Test gen-test obbligatorio** (Tester-2): `tests/unit/intent-parser.test.js` 15+ tests (single intent + multiple + malformed JSON + nested braces + Italian text + special chars + empty).

**CoV step**: parseIntentTags 15/15 PASS + dispatchTool integration test PASS + smoke prod 1 chat con LLM che produca [INTENT:{tool:"highlightComponent",args:{ids:["led1"]}}] → verifica server-side esegui + frontend riceva `intents_executed`.

**Anti-regression**: `composite-handler.test.ts` 10/10 + `clawbot-template-router.ts` 19/19 NESSUN regresso.

**Time**: 4-6h (Maker-1 + Tester-2).

---

### Atom A2 — Maker-1 — Vision Gemini Flash deploy

**File**: `supabase/functions/unlim-vision/index.ts` (already iter 35 wired) + deploy

**Spec**:
```bash
SUPABASE_ACCESS_TOKEN=$(cat ~/.zshrc | grep SUPABASE_ACCESS_TOKEN | cut -d= -f2 | tr -d '"') \
  npx supabase functions deploy unlim-vision --project-ref euqpdueopmlllqjmqnyb
```

**Smoke**:
```bash
# Test Gemini primary
curl -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-vision" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"images":[{"base64":"...","mime":"image/png"}],"prompt":"descrivi"}' \
  -o /tmp/vision-out.json -w "HTTP %{http_code} time: %{time_total}\n"

# Verify header
grep -i "x-vision-provider" /tmp/vision-out.json # must contain "gemini-2.5-flash"
```

**Latency target**: <800ms p50 (vs Pixtral 1.3s baseline iter 32).

**Anti-regression**: Pixtral fallback DEVE attivarsi se Gemini errore (test forced GOOGLE_API_KEY bogus → fallback hit + log).

**Time**: 30 min (deploy + smoke).

---

### Atom A3 — Maker-2 architect — ADR-028 Onnipotenza-INTENT-Dispatcher

**File**: `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` (NEW ~400 LOC)

**Sections obbligatorie**:
1. Problem statement (browser-side AZIONE legacy 46 cases vs LLM JSON INTENT 62-tool)
2. Decision (server-side parser + dispatcher + audit log)
3. Context dispatcher 62-tool (file `dispatcher.ts` 250 LOC iter 4)
4. Schema `[INTENT:{tool:string, args:object}]` regex stricter
5. Failure modes (parse error, tool not found, args invalid)
6. Audit table `intent_dispatch_log` (Supabase NEW migration)
7. Rollout: env flag `ENABLE_INTENT_DISPATCHER=true` (default false → A/B)
8. PRINCIPIO ZERO compliance (kit fisico mention preserved post tool exec)
9. MORFISMO compliance (Sense 1 morphic dispatcher dynamic)
10. Anti-inflation: 50-prompt R7 fixture deve avere ≥80% INTENT executed correttamente

**Time**: 2h Maker-2.

---

### Atom A4 — WebDesigner-1 — Modalità Percorso visibile fix

**File**: `src/components/lavagna/ModalitaSwitch.jsx` + `src/components/lavagna/LavagnaShell.jsx`

**Hypothesis Tester-2 (parallel debug)**:
- H1: ModalitaSwitch render 4 mode ma CSS hide `.percorso` (cerca regola CSS)
- H2: state modalita default 'libero' (era 'percorso' iter 26 ADR-025)
- H3: ModalitaSwitch component prop `availableModes` filter exclude 'percorso'
- H4: localStorage `elab-lavagna-modalita` salvato 'gia-montato' override default

**Imperative**: Tester-2 spawn parallel-debugging 4 hypothesis → trova root cause → WebDesigner-1 fixa.

**Acceptance**: Playwright Mac Mini Cron 5min screenshot mostra 4 button modalità visible e cliccabili. UI text "Percorso" visibile.

**Time**: 1-2h (Tester-2 30min debug + WebDesigner-1 1h fix + verify).

---

### Atom A5 — WebDesigner-2 — Passo Passo LessonReader FloatingWindow

**File**: `src/components/lavagna/LavagnaShell.jsx:1121` (LessonReader render block) + `src/components/common/FloatingWindow.jsx` (verifica esistenza, se NO crea)

**Spec**:

```jsx
// LavagnaShell.jsx — wrap LessonReader in FloatingWindow
{modalita === 'passo-passo' && (
  <FloatingWindow
    title="Passo Passo"
    initialPosition={{ x: 100, y: 100 }}
    initialSize={{ width: 480, height: 600 }}
    minSize={{ width: 320, height: 400 }}
    resizable
    draggable
    onClose={() => setModalita('percorso')}
  >
    <LessonReader experimentId={currentExperiment?.id} />
  </FloatingWindow>
)}
```

**FloatingWindow.jsx requirements** (se non esiste):
- Touch ≥44x44 drag handle header
- Resize handle bottom-right corner ≥24x24
- Position + size persisted localStorage `elab-floatwin-{title}-pos`
- Z-index 10001 (sopra UNLIM panel z-index 10000)
- Esc key close
- Mobile <768px: full-screen modal mode (no drag)

**Test**: gen-test scrive `tests/unit/components/FloatingWindow.test.jsx` 12+ tests (drag + resize + persist + z-index + Esc + mobile).

**Acceptance**: Playwright Mac Mini Cron click button Passo Passo → FloatingWindow appare → drag header → resize corner → screenshot.

**Time**: 3h (WebDesigner-2 2h + Tester-2 1h).

---

### Atom A6 — WebDesigner-2 — UNLIM tabs sovrapposizione fix definitive

**File**: `src/components/lavagna/GalileoAdapter.jsx` (~1100 LOC, iter 34 commit `7f963c4` rimosso tab BAR ma sovrapposizione persistente)

**Hypothesis Tester-2 parallel**:
- H1: chat panel width hardcode 400px > viewport mobile → overflow
- H2: z-index conflict UNLIM (10000) vs other floating components (10001+)
- H3: position fixed bottom-right vs other floating same anchor
- H4: PercorsoCapitoloView component STILL rendered behind chat (dead code post 7f963c4)

**Imperative**: Tester-2 reproduce on Playwright (Mac Mini desktop 1920x1080 + iPad 1024x768) screenshot before/after.

**Acceptance**: 0 elementi UNLIM panel sovrappongono altri pannelli (tested 5 layout permutations).

**Time**: 2-3h.

---

### Atom A7 — Tester-1 — Fumetto Playwright E2E verify

**File**: `tests/e2e/03-fumetto-flow.spec.js` NEW

**Spec**:

```javascript
test('Fumetto button SEMPRE genera output (stub session locale fallback)', async ({ page }) => {
  await page.goto('https://www.elabtutor.school');
  // ensure no sessions saved (clear localStorage)
  await page.evaluate(() => localStorage.removeItem('elab_unlim_sessions'));
  await page.click('text=Lavagna');
  await page.click('text=Fumetto'); // FloatingToolbar button
  await page.waitForTimeout(2000);

  // verify NO toast "Nessuna sessione salvata"
  const noSessionToast = await page.locator('text=Nessuna sessione salvata').count();
  expect(noSessionToast).toBe(0);

  // verify popup or download triggered
  const popups = await page.context().pages();
  const downloads = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
  expect(popups.length > 1 || (await downloads) !== null).toBe(true);
});
```

**Anti-regression**: 25/25 sync drawing tests STILL PASS post Fumetto fix.

**Time**: 1h Tester-1.

---

### Atom A8 — Tester-1 + Tester-2 — Lavagna persistence Bug 2 verify

**File**: `tests/e2e/04-lavagna-persistence.spec.js` NEW

**Spec**:

```javascript
test('Lavagna scritti NON spariscono post Esci', async ({ page }) => {
  await page.goto('https://www.elabtutor.school');
  await page.click('text=Lavagna');
  await page.click('text=Pen tool');
  await page.mouse.move(200, 200);
  await page.mouse.down();
  await page.mouse.move(300, 300);
  await page.mouse.up();

  // verify path saved local
  const localPaths1 = await page.evaluate(() => 
    JSON.parse(localStorage.getItem('elab-drawing-paths-libero') || '[]')
  );
  expect(localPaths1.length).toBeGreaterThan(0);

  // click Esci
  await page.click('text=Esci');
  await page.waitForTimeout(2000);

  // re-enter Lavagna
  await page.click('text=Lavagna');
  await page.waitForTimeout(2000);

  // verify path STILL there
  const localPaths2 = await page.evaluate(() => 
    JSON.parse(localStorage.getItem('elab-drawing-paths-libero') || '[]')
  );
  expect(localPaths2.length).toBe(localPaths1.length);
  expect(localPaths2[0].points.length).toBe(localPaths1[0].points.length);
});
```

**Time**: 1h Tester-1.

---

### Atom A9 — Tester-2 — Wake word Bug 8 verify

**File**: `tests/unit/services/wakeWord.test.js` (extend existing 9 PASS)

**Spec**:
- Mock `recognition.onerror` con event.error='not-allowed'
- Verify `window.dispatchEvent('elab-wake-word-error')` chiamato
- Verify CustomEvent detail.message contains "Microfono non autorizzato"

**Acceptance**: 12/12 wake word PASS (era 9/9, +3 NEW).

**Time**: 30 min.

---

### Atom A10 — Documenter — Mac Mini USER-SIMULATION CURRICULUM setup (NON solo mapping)

**Reference**: `docs/pdr/MAC-MINI-USER-SIMULATION-CURRICULUM.md` (autoritativo).

Mac Mini Cron H24 simula utente REALE: click pulsanti, mount/unmount esperimenti, Percorso flow completo, Passo Passo navigation, UNLIM chat persona-driven, Onniscenza+Onnipotenza stress test 3-livelli incrementali (smoke 5min + workflow 30min + stress 2h). 4 persona profiles (Docente primaria + secondaria + Studente curiosa + Tester chaotic). Output JSON structured `~/Library/Logs/elab/user-sim-*` + branch push `mac-mini/iter36-user-sim-l{1,2,3}-*`. MacBook orchestrator parsa regression_flags ogni 15min → dispatch Tester-2 fix automatico. Setup ~10 min Andrea entrance iter 36.

**File**: Mac Mini `~/scripts/elab-iter36-mapping.sh` NEW + crontab entry

**Spec**:

```bash
#!/bin/bash
# /Users/progettibelli/scripts/elab-iter36-mapping.sh
LOG=/Users/progettibelli/Library/Logs/elab/iter36-mapping.log
TS=$(date -u +%Y%m%dT%H%M%SZ)
cd /Users/progettibelli/elab-builder

# Smoke 5 Edge Functions
for ep in unlim-chat unlim-tts unlim-vision unlim-stt unlim-imagegen; do
  CODE=$(curl -s -m 5 -o /dev/null -w "%{http_code}" -X OPTIONS "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/$ep")
  echo "$TS $ep $CODE" >> $LOG
done

# Playwright smoke (5 scenarios sequential)
npx playwright test tests/e2e/iter36-mac-mini-mapping.spec.js \
  --reporter=line >> $LOG 2>&1

# Control Chrome screenshot capture (5 pages × 4 modalità = 20 png)
node scripts/iter36-control-chrome-mapping.mjs >> $LOG 2>&1

# Aggregate + push branch
git add scripts/output/iter36-mapping-*
git commit -m "chore(iter-36): mac mini mapping $TS" || true
git push origin mac-mini/iter36-mapping-$TS || true
```

**Crontab**:
```
*/5 * * * * /Users/progettibelli/scripts/elab-iter36-mapping.sh
```

**MacBook orchestrator polling** (in this session):
```bash
# every 15min via Bash run_in_background
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  "tail -100 ~/Library/Logs/elab/iter36-mapping.log" \
  > /tmp/macmini-iter36-status.txt
```

**Time**: 1h Documenter setup + ongoing automatic.

---

### Atom A11 — Documenter — Iter 36 audit + handoff

**File**: `docs/audits/2026-04-30-iter-36-PHASE3-CLOSE-audit.md` (~400 LOC) + `docs/handoff/2026-04-30-iter-36-to-iter-37-handoff.md` (~250 LOC)

**Spec**:
- §1 Score G45 ricalibrato (10/12 atoms PASS = max 8.5)
- §2 Delivery matrix per agent (file system verified `wc -l`, `git log`, `vitest run`)
- §3 5 honesty caveats (parser INTENT regex limit + Vision deploy non testato 100 prompt + Modalità fix racconto + Mac Mini cron stabilità + race-cond Pattern S r3 verifica)
- §4 SPRINT_T_COMPLETE 12 boxes status post iter 36
- §5 Iter 37 priorities preview
- §6 Mac Mini mapping log delta vs iter 35 baseline
- §7 ACTIVATION STRING paste-ready iter 37

**Time**: 2h.

---

### Atom A13 — WebDesigner-1 + WebDesigner-2 — Homepage redesign Tea-style + Cronologia ChatGPT + Easter egg

**Mandate Andrea iter 36 PM**: pagina iniziale come Tea pushato (`elab-tutor-glossario.vercel.app` style + credits Tea), più belle, link sensati, Cronologia Google-style descrizioni UNLIM-generated furbe, "Chi siamo" easter egg foto divertente.

**Skills used**: `/impeccable:colorize` (palette Navy/Lime/Orange/Red coverage + accent gradients) + `/impeccable:typeset` (Oswald hero + Open Sans body harmony) + `/impeccable:arrange` (4-card grid spacing rhythm) + `/impeccable:delight` (easter egg + micro-animations card hover) + `/impeccable:bolder` (hero "ELAB TUTOR" prominenza) + `design:design-critique` (review pre-merge accessibilità WCAG AA).

**Spec layout 4 card primary** (più "Chi siamo" easter):

| Card | Link | Preview/microcopy |
|------|------|-------------------|
| **🧠 Chatbot UNLIM** | `#chatbot-only` (NEW route) | "Chiedi a UNLIM. Sa tutto delle tue lezioni passate. Stile ChatGPT, strumenti integrati." |
| **📚 Glossario Tea** | `https://elab-tutor-glossario.vercel.app` (external) | "174 termini elettronica spiegati semplici. Fatto da Tea." |
| **⚡ Lavagna ELAB Tutor** | `#lavagna` | "Lavagna interattiva + UNLIM + Simulatore. La modalità lezione completa." |
| **🐒 Chi siamo** | `#about-easter` | (click → modal con foto scimpanzè/meme rotation) |

**Card "Chatbot UNLIM" route NEW** `#chatbot-only`:
- Scaffold component `src/components/chatbot/ChatbotOnly.jsx` (~250 LOC)
- Reuse `useGalileoChat` hook + Onniscenza 7-layer wired
- UI ChatGPT-style: sidebar history sessioni Cronologia + main chat panel + tool palette right (Vision upload + Compile arduino + Genera fumetto + Reset)
- Memoria sessioni passate via Supabase `unlim_sessions` table query (load last 50 per `class_key`)
- Tools palette: 5 quick action button (📷 Vision + ⚙️ Compile + 📔 Fumetto + 🎨 Lavagna mini + 🔄 Reset)

**Cronologia ChatGPT-style sidebar**:
- Sezione "Oggi" + "Ieri" + "Settimana scorsa" + "Più vecchie" (Google search-style)
- Per ogni sessione: 1-line description UNLIM-generated 80-char (via `unlim-session-description` Edge Function iter 35 da Tea homepage)
- Reminder furbo: se sessione incompleta (<3 messaggi) badge "🟡 Sospesa"; se cap.6 LED → badge "📍 Cap.6 LED"; se >7 giorni fa → badge "⏰ Vecchia, riprendi?"
- Click sessione → carica context UNLIM con full history + ultimo experiment

**"Chi siamo" easter egg** `#about-easter`:
- Modal full-screen: 4 random scimpanzè memes rotation `public/easter/scimpanze-{1,2,3,4}.gif` (download Andrea-curated memes pre-iter)
- Tagline: "Andrea + Tea + Davide + Omaric + Giovanni — il team scimmie programmatrici di ELAB Tutor 🐒💻"
- Crediti dettaglio: "Tea ha pushato il glossario standalone + idee UX brilliant" + photo Tea (placeholder se non disponibile)
- Easter egg #2: 5 click sequenziali su scimpanzè → unlock "Banana mode" CSS theme yellow accent (5 secondi tributo)

**HomePage redesign current**:
- File: `src/components/HomePage.jsx` (290 LOC iter 35 a1438eb subagent shipped) → REWRITE ~450 LOC
- **Mascotte UNLIM hero protagonist** (left side hero, 240×240 desktop / 160×160 mobile): reuse `src/components/unlim/MascotPresence.jsx` componente esistente in modalità `idle-greeting` con micro-animazione pulse (2s cycle) + occhi blink random ogni 3-7s + click → "Ciao Ragazzi!" speech bubble + audio Voxtral voice clone Andrea IT 1 frase greeting (lazy-load voce su click NO autoplay)
- Hero "ELAB TUTOR" Oswald 64px + sottolineatura Lime gradient (right side hero)
- Sub-hero: "Tutor educativo elettronica + Arduino bambini 8-14. Kit fisici + volumi + software morfico."
- 4 card grid `auto-fit minmax(280px, 1fr)` + hover scale 1.03 + shadow elevate + mascotte UNLIM mini su ogni card hover (mascotte "indica" con braccino animato direzione card)
- Mascotte UNLIM persistent floating bottom-right (anche post-scroll) → click apre Chatbot-only route diretto (shortcut)
- Footer credits: "Andrea Marro coding + Tea co-dev/UX/QA + Davide Fagherazzi volumi cartacei + Omaric Elettronica kit + Giovanni Fagherazzi network commerciale"
- Footer link "🐒 Chi siamo" subtle bottom-right (NON main card, easter egg)

**Mascotte morphic states homepage** (`/impeccable:animate` `/impeccable:delight`):
- `idle-greeting`: pulse soft + occhi blink (homepage default)
- `pointing`: braccino indica card hover (UX guidance)
- `talking`: bocca lip-sync mentre legge greeting/intro audio (1 frase Voxtral lazy)
- `chatbot-shortcut`: floating mascotte click → naviga `#chatbot-only` con animazione transition slide-in

**Chatbot-only route mascotte**:
- Sidebar header: mascotte UNLIM mini 64×64 + "UNLIM — il tuo tutor che ricorda tutto"
- Empty state main panel: mascotte 320×320 + "Ciao Ragazzi! Cosa vuoi imparare oggi? Ho letto i volumi e le tue lezioni passate."
- Streaming response: mascotte mouth animation lip-sync (iter 37 atom B6 carryover)

**Skills chain orchestrazione iter 36**:
1. WebDesigner-1 `/impeccable:colorize` audit palette + tokens
2. WebDesigner-1 `/impeccable:typeset` font scale Oswald 64-32-24 + Open Sans 16-14
3. WebDesigner-2 `/impeccable:arrange` 4-card grid spacing 24px gutter + 32px outer
4. WebDesigner-2 `/impeccable:bolder` hero amplify + Lime gradient accent
5. WebDesigner-2 `/impeccable:delight` card hover micro-anim + scimpanzè easter egg
6. Tester-1 Playwright snapshot test 4 viewport (1920 + 1024 + 768 + 414)
7. Tester-2 `design:accessibility-review` WCAG AA contrast 4.5:1 + touch ≥44px

**Reference**:
- Tea standalone `https://elab-tutor-glossario.vercel.app` (style copy + credit visibile)
- Glossario data 174 termini (Atom C7 iter 38 port full app, iter 36 link external solo)

**Chatbot-only Edge Function**: NO new endpoint. Reuse `unlim-chat` existing + add query param `?ui=chatbot` per response style ChatGPT (no Lavagna actions, plain chat focus).

**Acceptance**:
- HomePage 4 card visibili + Hero + Footer credits Tea+Davide+Omaric+Giovanni
- Click Glossario → external `elab-tutor-glossario.vercel.app` opens new tab
- Click Chatbot UNLIM → `#chatbot-only` route + sidebar Cronologia 50 sessioni + tools palette 5 button + chat funzionante
- Click Lavagna → `#lavagna` flow corrente preservato
- Click "Chi siamo" footer → modal scimpanzè + crediti dettaglio
- Lighthouse score ≥90 perf + ≥95 a11y + ≥100 SEO
- Mac Mini Cron Livello 1 cycle include navigate `#chatbot-only` + Cronologia load test

**Time**: 8h totali (4h WebDesigner-1 redesign + 3h WebDesigner-2 chatbot route + 1h Tester verify).

### Atom A12 — Documenter — Mem-search + research 2 sessioni precedenti

**Spec**:
- `mem-search` query "iter 33 34 35 bugs" → fetch ID osservazioni
- `mem-search` `timeline` su anchor critici → contesto
- `WebSearch` "PWA service worker cache invalidation 2026 best practices" → soluzione issue cache Andrea
- `firecrawl` `https://www.elabtutor.school/sw.js` → verify SW version → confronta dist/sw.js locale
- Output: `docs/research/2026-04-30-iter-36-RICERCA-2-SESSIONI.md`

**Time**: 1.5h.

---

## §4 — Anti-inflation benchmark obbligatorio (G45)

| Metrica | Pre iter 36 | Target iter 36 ONESTO | Misurazione |
|---------|-------------|------------------------|-------------|
| vitest PASS | 13233 | ≥13245 (+12 NEW intent-parser) | `npx vitest run --reporter=basic` |
| Build | PASS 4m11s | PASS <5m | `npm run build` |
| R5 50-prompt PZ V3 | 91.45% (iter 5) | ≥92% post intent dispatcher | `node scripts/bench/run-sprint-r5-stress.mjs` |
| Vision latency p50 | 1300ms (Pixtral) | <800ms (Gemini Flash) | curl unlim-vision smoke |
| Chat latency p95 warm | 6800ms | <4000ms post Gemini Flash-Lite primary | Mac Mini Cron measure |
| Bug Andrea iter 33-35 | 11 reported | ≤2 unresolved | Bug audit doc + Playwright verify |
| Onnipotenza dispatcher | 0 INTENT executed prod | ≥80% R7 fixture (50 prompts) | bench INTENT exec rate |

**Score formula** (12 atoms × box = max 10.0, G45 cap):

```
score = (atoms_passed / 12) * 7.0 + (boxes_lifted / 12) * 2.0 + bonus_anti_inflation_max_1.0
```

Score iter 36 target: **8.5/10 ONESTO** (passa gate Andrea G45).

**Cap conditions**:
- Se vitest <13233: cap 7.0 (regression block)
- Se build FAIL: cap 6.0 (mandate fail)
- Se 7+ atoms blocked: cap 7.5
- Se Mac Mini Cron stallato: cap 8.0
- Se score raw >8.5: G45 cap 8.5 (Opus-indipendente review needed)

---

## §5 — Anti-regressione FERREA

1. **vitest baseline**: 13233 PASS — pre-commit hook ENFORCES delta. `git commit --no-verify` PROIBITO iter 36.
2. **Pre-push hook**: build PASS — bypassed solo per security urgency con commit message `[security]`.
3. **Branch protection**: NO push `main`. Solo `e2e-bypass-preview` + PR.
4. **Snapshot baseline ogni Phase**: `git tag iter-36-phase-{1,2,3}-HHMM`.
5. **Stash + verify pattern**: se test scendono `git stash && npx vitest run` — se passa stashed = bug iter 36, REVERT.
6. **Critical files lock**: `scripts/guard-critical-files.sh` blocca modifiche `CircuitSolver.js` + `AVRBridge.js` + `PlacementEngine.js` senza commit message marker `authorized-engine-change`.
7. **Score guardrail**: `node scripts/benchmark.cjs --write` post-Phase 3 verifica score delta >0 vs iter 35 baseline.

---

## §6 — Phase coordination

| Phase | Time budget | Agents active | Sync gate |
|-------|-------------|---------------|-----------|
| **Phase 0** (entrance CoV) | 30 min | Tester-2 + Documenter | vitest + build GREEN baseline tag iter-36-phase-0 |
| **Phase 1** (atomi parallel) | 6h | Maker-1 + Maker-2 + WebDesigner-1 + WebDesigner-2 + Tester-1 + Tester-2 (6 parallel) | 6/6 completion msg `automa/team-state/messages/{agent}-iter36-phase1-DONE.md` |
| **Phase 2** (Documenter sequential) | 2h | Documenter ONLY (audit + handoff + research) | 1/1 completion msg + Mac Mini Cron LIVE |
| **Phase 3** (verify + commit + push) | 1h | All agents idle, MacBook orchestrator | bench score ≥8.5 + Playwright Mac Mini 20 screenshots fresh post-deploy |

**Total time budget**: ~10h (1 sessione lunga OR 2 sessioni 5h each).

---

## §7 — Activation string per iter 36 next session

```
Esegui PDR-A iter 36 in `docs/pdr/PDR-ITER-36-BUG-SWEEP-DEPLOY-VERIFY.md`. 
Spawn 7 agenti orchestrati Pattern S r3 (vedi §2). 
Mac Mini Cron 5min mapping continuous setup PRIMA di Phase 1.
Anti-inflation G45: score 8.5 cap. Anti-regressione vitest 13233 PASS NEVER scendere. 
Phase 0 entrance CoV vitest+build, Phase 1 6 atomi parallel 6h, Phase 2 Documenter sequential 2h, Phase 3 verify 1h. 
Activation iter 37 in audit close §7.
```

### Plugin + connettori suggeriti iter 36

| Categoria | Plugin/Connettore | Uso atomi |
|-----------|-------------------|-----------|
| Code review | `/coderabbit:review` `/pr-review-toolkit:code-reviewer` `/feature-dev:code-reviewer` | Atom A1 INTENT parser + Atom A2 Vision deploy |
| Debugging | `/superpowers:systematic-debugging` `/agent-teams:team-debug` `/parallel-debugging` `/debugging-toolkit:debugger` | Atom A4 Modalità sparita H1-H4 + Atom A6 sovrapposizione UNLIM |
| Browser | `mcp__Claude_in_Chrome__*` (browser_batch + javascript_tool + read_page) + `mcp__Control_Chrome__*` | Tester-1 E2E + Mac Mini mapping smoke |
| Testing | Playwright MCP `mcp__plugin_playwright_playwright__*` | Atom A7 Fumetto E2E + Atom A8 persistence |
| Vercel | `mcp__57ae1081-...__deploy_to_vercel` `mcp__57ae1081-...__list_deployments` `mcp__57ae1081-...__get_runtime_logs` | Atom A2 Vision deploy verify + iter close push deploy |
| Supabase | `supabase` skill + `mcp__plugin_supabase_supabase__*` | Atom A1 dispatcher Edge Function deploy |
| Memory | `/claude-mem:mem-search` `/claude-mem:timeline` | Atom A12 ricerca 2 sessioni + research |
| Web research | `/firecrawl` `WebSearch` `/atlassian:search-company-knowledge` | Atom A12 PWA SW invalidation + browser cache best practices |
| Architecture | `/feature-dev:code-architect` `/superpowers:writing-plans` | Atom A3 ADR-028 dispatcher |
| Anti-inflation | `/superpowers:verification-before-completion` `node scripts/benchmark.cjs --write` | Phase 3 score cap G45 |
| Telemetry | `mcp__plugin_posthog_*` (insights + errors) `mcp__plugin_sentry_sentry__*` | Mac Mini Cron metrics dashboard |
| GitHub | `mcp__plugin_engineering_github__*` `gh` CLI | iter close commit + PR + push |
| Cron | `mcp__scheduled-tasks__*` `/loop` | Mac Mini Cron 5min mapping setup |
| Homepage redesign | `/impeccable:colorize` `/impeccable:typeset` `/impeccable:arrange` `/impeccable:bolder` `/impeccable:delight` `/impeccable:polish` `design:design-critique` `design:accessibility-review` `design:ux-copy` | Atom A13 4-card hero + footer credits Tea + Cronologia ChatGPT-style + scimpanzè easter egg |
| Chatbot-only route | `/feature-dev:code-architect` reuse `useGalileoChat` + Onniscenza wired + Cronologia Supabase 50 sessioni + tools palette 5 button | Atom A13 NEW route `#chatbot-only` |
| Easter egg | `/canvas-design` `/algorithmic-art` 4 scimpanzè GIF rotation + 5-click banana mode CSS theme | Atom A13 Chi siamo modal |
| External link Glossario Tea | static link `https://elab-tutor-glossario.vercel.app` + credits Tea visibile | Atom A13 4° card |
| Lighthouse | Vercel Speed Insights + manual `npx lighthouse https://www.elabtutor.school` ≥90 perf + ≥95 a11y + ≥100 SEO | Atom A13 acceptance |
| HomePage current | `src/components/HomePage.jsx` (290 LOC iter 35 a1438eb subagent) → REWRITE ~400 LOC | Atom A13 base |

---

## §8 — Comunicazione inter-agent (Pattern S r3 race-cond fix)

**Filesystem barrier OBBLIGATORIO**:
- Pre-Phase 1: orchestrator scrive `automa/team-state/messages/orchestrator-iter36-START.md` con 6 task assignments
- Phase 1: ogni agent scrive `automa/team-state/messages/{agent}-iter36-phase1-{STATUS}.md` con `STATUS=in_progress|completed|blocked`
- Phase 2 gate: orchestrator verifica 6/6 `*-completed.md` PRIMA di spawn Documenter
- Phase 3 gate: Documenter scrive `documenter-iter36-phase2-completed.md` PRIMA di MacBook commit + push

**Inter-agent skill chains**:
- Maker-1 → invokes Tester-2 via msg "verify INTENT parser 15+ tests"
- WebDesigner-1 → invokes Documenter via msg "research PWA SW cache invalidation patterns"
- Tester-1 → invokes Maker-1 via msg "Playwright fail X — debug fix needed"

**Comunicazione MacBook ↔ Mac Mini**:
- MacBook → Mac Mini: SSH script trigger ad-hoc `ssh ... 'bash ~/scripts/elab-iter36-mapping.sh'`
- Mac Mini → MacBook: branch push pattern `mac-mini/iter36-mapping-*` + MacBook fetch + diff
- Latency: Mac Mini Cron 5min → MacBook fetch 15min → orchestrator dispatch nuovo bug fix → re-deploy entro 1h

---

## §9 — Output finale iter 36

A fine sessione `docs/handoff/2026-04-30-iter-36-to-iter-37-handoff.md` DEVE contenere:

1. ✅ Score G45 ricalibrato (8.5 target ONESTO o cap inferiore con razionale)
2. ✅ 12 atoms delivery matrix (file system verified)
3. ✅ 5 honesty caveats critical
4. ✅ SPRINT_T_COMPLETE 12 boxes status delta vs iter 35
5. ✅ Mac Mini mapping log delta vs iter 35 baseline
6. ✅ Iter 37 priorities P0 preview (PDR-B)
7. ✅ ACTIVATION STRING iter 37 paste-ready
8. ✅ Andrea ratify queue updated (decisioni pending)

**NO inflation. NO compiacenza. G45 cap enforced. Anti-regressione FERREA.**
