# Sprint V iter 1 — PIANO MASTER (2026-05-05 PM)

**Andrea mandate (16 issues post screenshot HomePage 2026-05-05 PM)**.
**Onestà**: PR #65 (iter 42) introduce regressioni HomePage — DEVE essere chiusa o riscritta prima di merge.
**Workflow**: ultrathink + using-superpowers + mem-search + make-plan + impeccable + connettori massiccio + CoV + /quality-audit. Pattern S 4-agent OPUS PHASE-PHASE.
**No compiacenza**. **No regressioni**. **G45 anti-inflation cap**.

---

## Sezione 1 — Andrea mandate verbatim (16 issue)

1. **Voxtral wake word non risponde** → impossibile parlare con UNLIM
2. **Lavagna libera deve essere libera** → no circuito mountato di default
3. **HomePage sezione Lavagna** = solo lavagna (no auto-mount esperimento)
4. **HomePage Cronologia sessioni** mancante (era presente in versione precedente)
5. **Modalità Percorso non funziona**
6. **2 modalità Passo Passo sovrapposte** → preferisce quella vecchia, solo render window resizable
7. **Esci dalla lavagna → scritte spariscono** (bug persistenza)
8. **HomePage**: mascotte + NO emoticon + crediti Teodora De Venere (Tea)
9. **Modalità Percorso adattiva** → contesto lezione + classe + sessioni precedenti (Morfismo Sense 1.5)
10. **Percorso = vecchia Libero** + 2 window sovrapposte da risolvere
11. **HomePage Glossario** integrato (non esterno) + altre card preservate
12. **Workflow multiprovider setup 1 + /mem-search + /make-plan**
13. **SVG sostitutivi emoticon** → impeccable design, no 🧠📚⚡🐒
14. **Connettori massiccio** Playwright + Chrome MCP per test live
15. **Strokes lavagna persistenti** → rimangono dopo Esci, per-esperimento, multi-save sessione, ogni sessione preserva appunti per ogni esperimento
16. **CoV sempre + /quality-audit** finale

---

## Sezione 2 — Stato attuale (file-system verified 2026-05-05 PM)

### HomePage versioni multiple in storia git
- **HEAD `6f771b9`** (PR #65 iter 42 mio): 3 card (lavagna+tutor+glossario), NO Cronologia, NO videolezioni
- **HEAD~1 `35b5173`**: 4 card (lavagna ⚡ + tutor 📚 + glossario 📖 + videolezioni 🎬), NO UNLIM separata
- **Screenshot Andrea** (target): 4 card (Lavagna + ELAB Tutor + **UNLIM separata** + Glossario) + **Cronologia recente** con search bar + empty state plurale "Ragazzi"
- Card icons screenshot = SVG strutturati (non emoji): chalkboard navy, lime icon, red icon, book+lente navy

### Lavagna current state
- `src/components/lavagna/LavagnaShell.jsx` 1500+ LOC
- `src/services/wakeWord.js` esiste — Web Speech API browser-side `it-IT`, 11 wake phrases, COMMAND_WINDOW_MS=5000
- `src/services/drawingSync.js` esiste — Supabase sync drawings
- `src/components/HomeCronologia.jsx` esiste — lazy import (rimosso da render iter 42 mio)
- ModalitaSwitch post iter 42: 3 mode (`percorso, passo-passo, gia-montato`), `libero` rimosso → migrate a `percorso`
- FloatingWindowCommon iter 36 rimosso da LavagnaShell iter 42

### Bug noti (mem-search)
- `feedback_lavagna_ux_bugs_19apr.md` → "Bug 2: scritti spariscono su Esci (persistenza violata). Principio: contenuto sparisce SOLO con cancellazione esplicita."
- `feedback_glossario_external_url.md` → Glossario deve essere CLONATO INTERNO (route `#glossario`) NON link esterno
- `feedback_homepage_old_version_regression.md` → vecchia HomePage "Kit fisici + volumi + software morfico" + 3 card CHATBOT/GLOSSARIO/LAVAGNA "non deve accadere prod"

### CoV baseline
- `automa/baseline-tests.txt` = `13474` (current pre-PR #65 hook gate)
- vitest 269 file passed | 1 skipped, 13474 PASS + 15 skipped + 8 todo

---

## Sezione 3 — PR #65 (iter 42) decisione

**Onestà**: PR #65 contiene:
- ✓ Glossario href `/glossario` suffix fix
- ✓ ModalitaSwitch 3-mode + 'libero' migration → utili
- ✓ FloatingWindowCommon rimozione Atom A5 → discutibile (vedi Issue 6)
- ✗ HomePage rimozione Cronologia (regressione confermata)
- ✗ HomePage rimozione card Videolezioni (verificare se Andrea vuole — non in screenshot)
- ✗ HomePage glossario credit `Fatto da Tea` rimosso (regressione iter 41 PM `0c66146` revert)

**Decisione**: REVERT parziale HomePage in PR #65 OR chiudere PR #65 + nuovo PR pulito.

**Raccomandazione**: chiudere PR #65 senza merge. Nuovo branch `fix/sprint-V-iter-1-homepage-restore-lavagna-fix`.

---

## Sezione 4 — Architettura piano (Phase decomposition)

### Phase 0 — Andrea ratify gate (5 min)
Andrea conferma:
- **Q1**: HomePage card target = 4 card screenshot (Lavagna + ELAB Tutor + UNLIM separata + Glossario)? **CONFIRM/EDIT**
- **Q2**: PR #65 chiudere o revisionare? **CHIUDERE/REVISIONARE**
- **Q3**: Mascotte HomePage = SVG nuova (Tea design) o riusare ElabIcons esistenti? **NUOVA/RIUSARE**
- **Q4**: Crediti Tea formato? "Mascotte: Teodora De Venere" footer? Inline brand? **TBD**
- **Q5**: Cronologia sessioni — backend esistente (Supabase `sessions` table) o localStorage? **SUPABASE**
- **Q6**: Wake word — diagnosi prima fix (mic permission? Web Speech API? Voxtral cloud?) **DIAGNOSI PRIMA**

### Phase 1 — Investigation + Root Cause (Pattern S 1 agent)
- **Atom S5V-D1 Diagnosi wake word** (Tester-1, ~1h):
  - Aprire prod Chrome MCP, attivare mic (MicPermissionNudge iter 36)
  - Verificare permessi browser mic
  - Verificare Web Speech API supportata (Chrome OK, Safari NO)
  - Ascoltare console: `[WakeWord]` log
  - Test "Ehi UNLIM" + "Hey UNLIM" → onWake fired?
  - Hypothesis: H1 mic permission denied | H2 SpeechRecognition not supported | H3 wake phrases regex miss | H4 onWakeCallback not wired | H5 commandMode timeout dropping
  - Output: `docs/audits/sprint-V-iter1-wakeword-diagnosis.md` con file:line citations + verdetto root cause
- **Atom S5V-D2 Diagnosi Lavagna persistence** (Tester-1, ~30 min):
  - Disegnare strokes prod
  - Click "Esci" toolbar colori → strokes spariscono?
  - Reload → strokes persistono?
  - Cambia esperimento → strokes preservati per esperimento?
  - Salva sessione → riapri → strokes restored per ogni esperimento?
  - Hypothesis: H1 toolbar Esci chiama clearStrokes() invece di toggleDrawing(false) | H2 localStorage key `elab-lavagna-strokes-{expId}` non presente | H3 Supabase `lavagna_drawings` table missing
  - Output: `docs/audits/sprint-V-iter1-lavagna-persistence-diagnosis.md`
- **Atom S5V-D3 Diagnosi Percorso non-funziona + 2 passo-passo overlap** (Tester-1, ~30 min):
  - Verificare prod `#lavagna` post deploy iter 42 (se mergiato) o pre-iter-42
  - Click Percorso button → cosa succede?
  - Click Passo Passo → 2 finestre? Quali? FloatingWindowCommon LEFT + ComponentDrawer RIGHT?
  - Hypothesis Percorso: H1 button onClick non wired | H2 setModalita('percorso') fallisce | H3 default localStorage stale
  - Hypothesis Passo Passo: H1 FloatingWindowCommon iter 36 + ComponentDrawer in NewElabSimulator entrambi attivi | H2 ComponentDrawer condition `buildMode === 'guided'` indipendente da modalita | H3 mio iter 42 fix solo parziale
  - Output: `docs/audits/sprint-V-iter1-modalita-diagnosis.md`

### Phase 2 — Architecture decisions (ADR draft)
- **ADR-032 HomePage 4-card + Cronologia + mascotte + crediti Tea** (architect, ~400 LOC):
  - Schema CARDS array 4 entries (lavagna+tutor+unlim+glossario)
  - Mascotte SVG component spec (TBD design Tea o nuova)
  - Cronologia integration `<HomeCronologia>` re-include con UNLIM-generated descriptions
  - Tea credits placement
  - PRINCIPIO ZERO compliance: linguaggio plurale "Ragazzi" + kit fisico mention
- **ADR-033 Lavagna stroke persistence multi-session multi-experiment** (architect, ~500 LOC):
  - Schema Supabase `lavagna_drawings` table (session_id, experiment_id, strokes_json, updated_at)
  - localStorage cache key `elab-lavagna-strokes-{sessionId}-{experimentId}`
  - "Esci" toolbar = `toggleDrawing(false)` SOLO (no clear)
  - Clear strokes = comando esplicito separato (`clearStrokes()` distinct button)
  - Multi-save sessione: salva sessione preserva tutti experiment + drawings + chat per esperimento
  - Reload sessione restore tutto
- **ADR-034 Modalità Percorso morphic Sense 1.5** (architect, ~400 LOC):
  - Percorso = empty canvas (no experiment auto-mount) — comportamento ex-libero
  - UNLIM contextual prompt iniettato runtime: classe + lezione + sessioni precedenti
  - Onniscenza aggregator (iter 31 wired) consulta last 5 session messages + class memory + lesson-paths active
  - Output: prompt v3.2 con `<context>` block injection
  - Suggestion engine: UNLIM propone "Ragazzi, abbiamo lasciato a metà X. Ripartiamo o nuovo argomento?"
- **ADR-035 Passo Passo single-window resizable** (architect, ~300 LOC):
  - Risolvere 2-window overlap: scegliere UNA finestra
  - Decisione Andrea: vecchia versione preferita (LessonReader text-based via FloatingWindowCommon iter 36)
  - Suppress ComponentDrawer in NewElabSimulator quando modalita==='passo-passo' (override `buildMode==='guided'` rendering)
  - FloatingWindowCommon resizable confermato (iter 36 spec già supporta)

### Phase 3 — Implementation atoms (Pattern S 4-agent OPUS PHASE-PHASE)

**Pattern S file ownership rigid + filesystem barrier**:

| Agent | File ownership | Atoms |
|-------|----------------|-------|
| Maker-1 | `src/services/wakeWord.js` + `src/components/lavagna/*.jsx` (no UI) + `src/services/drawingSync.js` + `supabase/migrations/` | A1 wake word fix + A2 stroke persist fix + A3 Esci toolbar fix + A4 Supabase `lavagna_drawings` migration + A5 Percorso morphic Onniscenza |
| Maker-2 | `src/components/lavagna/ModalitaSwitch.jsx` + `src/components/simulator/NewElabSimulator.jsx` (modalita guard only) | A6 Passo Passo single-window + A7 ComponentDrawer suppress logic |
| WebDesigner-1 | `src/components/HomePage.jsx` + `src/components/HomeCronologia.jsx` + `src/components/common/ElabMascotte.jsx` (NEW) + ElabIcons.jsx (extend) | A8 HomePage 4-card restore + A9 Cronologia re-include + A10 Mascotte SVG + A11 Tea credits + A12 SVG sostitutivi emoticon (impeccable) |
| Tester-1 | `tests/unit/services/wakeWord-*.test.js` + `tests/unit/components/HomePage-*.test.jsx` + `tests/e2e/sprint-V-*.spec.js` + Playwright/Chrome MCP smoke prod | A13 wake word tests + A14 HomePage tests + A15 Lavagna persistence E2E + A16 prod smoke connettori massiccio |

**Atom decomposition con acceptance criteria**:

#### A1 Wake word fix (Maker-1, ~2h, gate D1 root cause)
- IF H1 mic permission: ensure MicPermissionNudge iter 36 wired in HomePage AND LavagnaShell on entry
- IF H2 SpeechRecognition: graceful fallback message "Ragazzi, microfono non supportato in questo browser. Usate Chrome o Edge."
- IF H3 wake phrases miss: extend WAKE_PHRASES array + lower-confidence alternatives matching
- IF H4 callback miss: re-wire `useGalileoChat.js` startWakeWordListener → onCommand → submitMessage
- IF H5 timeout: extend COMMAND_WINDOW_MS configurable + visual indicator "UNLIM ascolta..."
- AC: 3 wake phrase test PASS prod Chrome MCP smoke
- AC: console log `[WakeWord] Wake detected → command captured: "{text}" → submitted`
- AC: UNLIM responds vocally tramite Voxtral TTS (iter 32 LIVE)

#### A2 Stroke persistence localStorage + Supabase (Maker-1, ~3h)
- localStorage key pattern: `elab-lavagna-strokes-{sessionId|'default'}-{experimentId|'free'}`
- Stroke serialization: array of `{x, y, color, width, timestamp, action: 'draw'|'erase'}`
- Sync drawingSync.js → Supabase `lavagna_drawings` upsert per (session_id, experiment_id)
- Throttle write 500ms debounce
- Load on mount: localStorage → Supabase fetch → merge → render
- AC: disegna 10 strokes → reload pagina → 10 strokes restored
- AC: cambia esperimento → torna primo → strokes preservati
- AC: cancella esperimento (clearAll) → strokes preservati separatamente

#### A3 Esci toolbar = toggleDrawing(false) NO clearStrokes (Maker-1, ~30min)
- Patch DrawingToolbar.jsx (file TBD) Esci button onClick:
  - Before: `clearStrokes() + toggleDrawing(false)`
  - After: `toggleDrawing(false)` SOLO
- Aggiungere bottone separato "Cancella tutto" con confirm modal "Ragazzi, cancello davvero il disegno?"
- AC: Esci → strokes persistono visualmente
- AC: Cancella tutto → confirm → strokes via

#### A4 Supabase migration `lavagna_drawings` (Maker-1, ~30min)
- File: `supabase/migrations/20260505XXXXX_lavagna_drawings.sql`
- Schema:
  ```sql
  CREATE TABLE lavagna_drawings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    experiment_id TEXT NOT NULL,
    strokes JSONB NOT NULL DEFAULT '[]',
    class_key TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (session_id, experiment_id)
  );
  CREATE INDEX idx_lavagna_drawings_session ON lavagna_drawings(session_id);
  CREATE INDEX idx_lavagna_drawings_class ON lavagna_drawings(class_key);
  -- RLS aperto pattern classe virtuale (no auth required)
  ALTER TABLE lavagna_drawings ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "lavagna_drawings_anon_all" ON lavagna_drawings FOR ALL USING (true) WITH CHECK (true);
  GRANT ALL ON lavagna_drawings TO anon, authenticated;
  ```
- AC: `npx supabase db push --linked` apply success
- AC: insert + select test funziona

#### A5 Percorso morphic Onniscenza (Maker-1, ~2h)
- Patch LavagnaShell `handleModalitaChange('percorso')`:
  - Set `currentExperiment: null` (no auto-mount)
  - Trigger Onniscenza fetch: `await fetchClassContext(class_key) + lastSessions(5) + activeLessonPath()`
  - Inject context UNLIM prompt v3.2 `<context>` block
  - Display UNLIM contextual greeting: "Ragazzi, [scenario]. Ripartiamo da X o nuovo argomento?"
- AC: Percorso click → simulator empty + UNLIM greets context-aware
- AC: switch da gia-montato a percorso → experiment unmount + UNLIM context refresh

#### A6 Passo Passo single-window resizable (Maker-2, ~1h)
- Conferma FloatingWindowCommon iter 36 RIPRISTINATO (revert parte iter 42 mio)
- Verify resize handles 24px corner @media coarse → 32px touch
- localStorage persist size+position key `elab-floatwin-passo-passo`
- AC: resize drag works
- AC: position saved cross-session
- AC: NO ComponentDrawer visibile in modalita=passo-passo

#### A7 ComponentDrawer suppress modalita-aware (Maker-2, ~1h)
- Patch NewElabSimulator.jsx render condition:
  - Before: `{currentExperiment && currentExperiment.buildMode === 'guided' && (<ComponentDrawer .../>)}`
  - After: `{currentExperiment && currentExperiment.buildMode === 'guided' && modalita !== 'passo-passo' && (<ComponentDrawer .../>)}`
- Pass modalita prop from LavagnaShell → NewElabSimulator
- AC: passo-passo → solo FloatingWindowCommon (LEFT/center)
- AC: gia-montato + experiment guided → ComponentDrawer visibile (preserva legacy use case)

#### A8 HomePage 4-card restore (WebDesigner-1, ~3h)
- Card array:
  ```js
  [
    { id: 'lavagna', title: 'Lavagna libera', href: '#lavagna', IconComponent: ChalkboardSVG, color: 'navy', credit: null, ... },
    { id: 'tutor', title: 'ELAB Tutor completo', href: '#tutor', IconComponent: BookSVG, color: 'lime', credit: null, ... },
    { id: 'unlim', title: 'UNLIM', href: '#chatbot-only', IconComponent: ChatGPTSVG, color: 'red', credit: null, ... },
    { id: 'glossario', title: 'Glossario', href: '#glossario', IconComponent: GlossaryBookSVG, color: 'navy', credit: 'Fatto da Tea', ... }
  ]
  ```
- Glossario href INTERNO `#glossario` (NON external `https://elab-tutor-glossario.vercel.app`)
- Description testi screenshot:
  - Lavagna: "Spazio della classe: lavagna pulita, simulatore, costruite quello che volete con i ragazzi."
  - Tutor: "App piena: Percorso dei volumi, esperimenti, UNLIM, voce, simulatore. Lezione completa con la classe."
  - UNLIM: "Stile ChatGPT: parlate con UNLIM, citerà i volumi e suggerirà esperimenti pronti."
  - Glossario: "Tutti i termini di elettronica spiegati semplici: LED, resistore, breadboard, Arduino. Cercate parole + leggete con la classe."
- AC: 4 card render
- AC: NO emoji 🧠📚⚡🐒
- AC: SVG icons consistent palette Navy/Lime/Red/Navy

#### A9 HomeCronologia re-include + search bar (WebDesigner-1, ~2h)
- `<HomeCronologia onResume={handleResume} />` re-import e render sotto card grid
- Search bar input "Cerca tra le sessioni..."
- Empty state: "Ragazzi, ancora nessuna sessione salvata. Aprite il **kit ELAB** e cliccate **Lavagna libera** per iniziare."
- Lazy load esistente preserved
- Sessions fetch da Supabase `sessions` table (esistente iter 4-5)
- AC: empty state visible se zero session
- AC: session list scrollable + search filter funziona
- AC: click session → onResume(target) navigate

#### A10 Mascotte SVG component (WebDesigner-1, ~3h con impeccable)
- Nuovo componente `src/components/common/ElabMascotte.jsx`
- Design impeccable per età 8-14 + LIM-friendly (visibile da 5m distanza)
- 3 stati: idle (default), parla (TTS active), ascolta (mic active)
- Palette ELAB: Navy outline + Lime accent + Orange highlight
- Posizione HomePage: hero top, large size desktop, scaled mobile
- AC: SVG inline (no external file)
- AC: animations CSS (no JS heavy)
- AC: prefers-reduced-motion respected
- AC: aria-label "Mascotte ELAB Tutor"

#### A11 Tea credits footer (WebDesigner-1, ~30min)
- HomePage footer:
  - "© 2026 ELAB Tutor — Andrea Marro · Tea (Teodora De Venere) · Davide Fagherazzi · Omaric · Giovanni Fagherazzi"
  - Mascotte specific credit se design Tea: "Mascotte: Teodora De Venere"
- AC: footer visible end of page
- AC: link `mailto:` o web disabilitato (privacy default)

#### A12 SVG sostitutivi emoticon (WebDesigner-1, ~2h impeccable)
- Audit emoji nel codice: `grep -rn "🧠\|📚\|⚡\|🐒\|🎬\|📖\|🎨\|🧩\|👣\|📷\|⚙️\|📔\|🔄" src/ tests/`
- Sostituire emoji critiche con SVG ElabIcons.jsx extend:
  - Brain → BrainSVG (UNLIM tutor)
  - Book → BookSVG (Tutor)
  - Lightning → ChalkboardSVG / SimulatorSVG (Lavagna)
  - Monkey → ScimpanzeFallbackSVG già esistente (EasterModal)
  - Clapperboard → VideoSVG (videolezioni se reintegrata)
- LavagnaShell empty state replace 🎨 with mascotte SVG
- ModalitaSwitch icons 📖 👣 🧩 → SVG (PROPOSED, valutare aesthetic)
- AC: zero emoji in homepage hero
- AC: SVG monocrome consistent palette
- AC: ElabIcons.jsx canonical source unica

#### A13 Wake word unit + integration tests (Tester-1, ~2h)
- `tests/unit/services/wakeWord-unit.test.js`: extends iter 36 9/9 PASS
- Test additional: COMMAND_WINDOW_MS extension + onWakeCallback wire + fallback unsupported browser
- `tests/integration/wake-word-galileo-chat.test.js`: useGalileoChat.startWakeWordListener wire-up
- AC: vitest 13474+ baseline preserved
- AC: 5+ NEW unit tests PASS

#### A14 HomePage component tests (Tester-1, ~2h)
- `tests/unit/components/HomePage-4cards.test.jsx`: 4 card render + href + credit
- `tests/unit/components/HomeCronologia.test.jsx`: empty state + session render + search filter
- `tests/unit/components/ElabMascotte.test.jsx`: states render + aria
- AC: 12+ NEW unit tests PASS

#### A15 Lavagna persistence E2E (Tester-1, ~2h Playwright)
- `tests/e2e/sprint-V-lavagna-persistence.spec.js`:
  - Test 1: draw → exit toolbar → strokes persist
  - Test 2: draw → reload → strokes persist
  - Test 3: draw → switch experiment → switch back → strokes persist
  - Test 4: save session → reload → all experiments + their strokes restored
  - Test 5: clearAll explicit → confirm → strokes via
- AC: 5/5 specs PASS local
- AC: prod smoke optional

#### A16 Connettori massiccio prod smoke (Tester-1, ~2h Chrome MCP + Control Mac)
- Apri prod `https://www.elabtutor.school` Chrome MCP
- Screenshot HomePage: 4 card visible + Cronologia visible + Mascotte visible + NO emoji
- Click Lavagna libera → empty canvas + ModalitaSwitch 3 mode visible
- Click Percorso → context-aware UNLIM greeting
- Click Passo Passo → single window resizable (NO 2 overlap)
- Click Già Montato → diagnose mode + experiment loaded
- Draw + Esci toolbar → strokes persist
- Wake word "Ehi UNLIM" → submit + Voxtral TTS reply
- Output: `docs/audits/sprint-V-iter1-prod-smoke-evidence.md` con 10+ screenshot

### Phase 4 — CoV + commit + deploy (orchestrator, ~1h)
- Pre-commit: vitest 13474+ NEW tests = ~13501+ target
- Build: `npm run build` PASS (~10-14 min)
- Commit atomic per agent + push origin (NO main, NO --no-verify)
- PR `gh pr create` body con acceptance check 16/16 issue
- Deploy Vercel post Andrea ratify
- Smoke prod final Playwright + Chrome MCP screenshot evidence
- /quality-audit skill final
- Score G45 ricalibrato ONESTO

---

## Sezione 5 — Acceptance criteria 16/16

| # | Issue | AC verifica |
|---|-------|-------------|
| 1 | Voxtral wake word | Chrome MCP "Ehi UNLIM" → onWake fired + UNLIM responds Voxtral TTS |
| 2 | Lavagna libera no circuit | Click `#lavagna` → empty canvas + ModalitaSwitch percorso default |
| 3 | HomePage Lavagna card | Click card → only lavagna shell mount (no auto-experiment) |
| 4 | Cronologia HomePage | `<HomeCronologia>` renders below cards + search bar + empty state |
| 5 | Modalità Percorso works | Click button → setModalita('percorso') + Onniscenza fetch + UNLIM greet |
| 6 | Passo Passo single-window | FloatingWindowCommon LEFT only + resize works + ComponentDrawer suppressed |
| 7 | Esci preserves strokes | toggleDrawing(false) only, NO clearStrokes |
| 8 | Mascotte + no emoji + Tea | ElabMascotte SVG render + zero emoji homepage + footer credits Tea |
| 9 | Percorso morphic Sense 1.5 | Onniscenza injects classe + lezione + last 5 sessions context UNLIM prompt |
| 10 | Percorso = libero free | currentExperiment=null + UNLIM contextual suggestion |
| 11 | HomePage Glossario internal | href `#glossario` (NOT external URL) + 4 card layout |
| 12 | Workflow ratified | Plan approved Andrea + Pattern S 4-agent OPUS execute |
| 13 | SVG impeccable | Zero emoji critical homepage + ElabIcons extended canonical |
| 14 | Connettori massiccio | Chrome MCP + Playwright + Control Mac evidence 10+ screenshot |
| 15 | Strokes per-experiment multi-save | Supabase `lavagna_drawings` schema + multi-session restore |
| 16 | CoV + quality-audit | vitest 13474+ + /quality-audit final + G45 cap |

---

## Sezione 6 — Risk register

| Risk | Mitigation |
|------|-----------|
| Wake word root cause unknown until D1 | Phase 1 mandatory before A1 implementation |
| 2-window passo-passo regression vs iter 42 mio | Andrea ratify Q4 + revert FloatingWindowCommon iter 42 part |
| Onniscenza prompt v3.2 latency lift +800ms | Cron warmup iter 38 active + parallel fetch Promise.all iter 38 active |
| Mascotte SVG design subjective | Tea collaboration OR fallback ElabIcons existing + Andrea ratify |
| Build heavy ~14min token budget | Defer Phase 3 orchestrator entrance gate next session |
| 4-agent Pattern S org limit cascade iter 38 | Spawn sequenziale fallback se BG agent fail |

---

## Sezione 7 — Workflow execution

**Token estimate**: 4-6 sessioni 200K context ciascuna.

**Sessione 1 (questa)**: Phase 0 + Phase 1 D1+D2+D3 diagnosi + plan approval Andrea
**Sessione 2**: Phase 2 ADR-032+033+034+035 architect-opus
**Sessione 3**: Phase 3 4-agent Pattern S Phase 1 parallel (Maker-1 + Maker-2 + WebDesigner-1 + Tester-1)
**Sessione 4**: Phase 3 Tester-1 prod smoke + Phase 2 scribe sequential audit + handoff
**Sessione 5**: Phase 4 CoV + build + commit + push + PR + deploy + smoke final + /quality-audit

**Cancellare PR #65**: prima di iniziare Phase 1 implementation, chiudere PR #65 OR estendere con HomePage restore.

---

## Sezione 8 — PRINCIPIO ZERO + MORFISMO compliance gate (10 check pre-merge)

1. ✓ Linguaggio plurale "Ragazzi" preserved (HomePage hero + LavagnaShell empty state + UNLIM percorso greet)
2. ✓ Kit fisico mention (Cronologia empty state + HomePage subtitle)
3. ✓ Palette CSS var Navy/Lime/Orange/Red (4 card + mascotte)
4. ✓ Iconografia ElabIcons SVG canonical (no emoji)
5. ✓ Morphic runtime (Percorso Onniscenza + FloatingWindow localStorage per-finestra + ComponentDrawer modalita-aware)
6. ✓ Cross-pollination Onniscenza L1+L4+L7 (Percorso fetch classe + lezione + sessioni)
7. ✓ Triplet coerenza kit Omaric (Cronologia kit ELAB mention + LavagnaShell volumi reference)
8. ✓ Multimodale (wake word fix + Voxtral TTS preserve + Vision preserve)
9. ✓ Anti-regressione (PR #65 chiusura/revisione + vitest 13474+ baseline preserve + connettori smoke prod)
10. ✓ G45 anti-inflation (NO claim "Sprint V close" senza Opus indipendente review)

---

**Andrea ratify gate Q1-Q6 RICHIESTO prima Phase 1 spawn agents**.

End plan master.
