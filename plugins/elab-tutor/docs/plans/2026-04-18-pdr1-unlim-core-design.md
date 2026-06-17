# PDR #1 — UNLIM Core (Lesson Reader + Vision + Voice + Fumetto + Onniscienza)

**Target agent**: Claude Opus 4.7 via Managed Agent (Max #1)
**Durata stimata**: 80-100h autonome
**Branch**: `feature/unlim-core-v1`
**Dipendenze**: PDR3 VPS RunPod Deploy (endpoint URL disponibili)
**Governance**: `docs/GOVERNANCE.md` regole 1-5 obbligatorie

---

## 🎯 Obiettivo supremo

Implementare UNLIM secondo Principio Zero v3: **generatore di contenuto quasi invisibile** che il docente proietta sulla LIM. Tutto in italiano + 6 lingue, onnisciente, onnipotente, basato su volumi ELAB + storia sessioni.

**Riferimento non negoziabile**: `docs/audits/2026-04-18-cov-principio-zero-v3.md` + `supabase/functions/_shared/system-prompt.ts` (già in prod post commit 250364a).

---

## ⚖️ REGOLA 0 — NO REWRITE, SOLO RIUSO + POTENZIAMENTO

**Il lavoro fatto in 100+ sessioni precedenti VA RIUSATO, non buttato.**

**Codice ESISTENTE da riusare/potenziare (elenco non esaustivo)**:

### Frontend esistente (src/)
| File | Righe | Ruolo | Azione PDR1 |
|------|-------|-------|-------------|
| `src/services/unlimContextCollector.js` | 250 | Raccolta contesto completo | **MODIFY**: aggiungi screenshot vision + lang |
| `src/services/voiceService.js` | - | Voice STT/TTS | **MODIFY**: aggiungi endpoint Whisper/F5 RunPod |
| `src/hooks/useTTS.js` | - | TTS hook | **MODIFY**: supporta F5/Kokoro via RunPod |
| `src/components/tutor/ChatOverlay.jsx` | - | Chat UI | **RIUSA**: è la UI chat UNLIM esistente |
| `src/components/lavagna/useGalileoChat.js` | - | Hook chat UNLIM | **MODIFY**: integra Lesson Reader |
| `src/services/unlimMemory.js` | - | Memoria 3-tier | **MODIFY**: estendi a multi-livello (class/teacher/school) |
| `src/services/unlimProactivity.js` | - | Diagnosi proattiva | **RIUSA + POTENZIA** |
| `src/services/lessonPrepService.js` | - | Prep lezione **GIÀ ESISTE** | **RIUSA** come base Lesson Reader |
| `src/services/classProfile.js` | - | Profilo classe | **MODIFY**: aggiungi `preferredLanguage` |
| `src/services/studentTracker.js` + `studentService.js` | - | Tracking studenti | **RIUSA** per memoria long-term |
| `src/services/supabaseSync.js` | - | Sync Supabase | **RIUSA** |
| `src/services/teacherDataService.js` | - | Dashboard docente data | **RIUSA + POTENZIA** |
| `src/data/lesson-groups.js` | 250 | 27 Lezioni | **RIUSA** (non creare nuovi) |
| `src/data/volume-references.js` | 1225 | 92 bookText | **RIUSA** (base Principio Zero) |
| `src/data/experiments-vol1/2/3.js` | - | 92 esperimenti | **RIUSA** |
| `src/data/unlim-knowledge-base.js` + `rag-chunks.json` | 4463 | 549 RAG chunk | **RIUSA + POTENZIA** (espandi a 5000+) |
| `src/services/simulator-api.js` | 755 | API `__ELAB_API` | **RIUSA** (già 26 azioni, aggiungi se manca) |

### Backend esistente (supabase/)
| File | Ruolo | Azione PDR1 |
|------|-------|-------------|
| `supabase/functions/unlim-chat/index.ts` | Edge Function chat principale | **MODIFY**: aggiungi routing vision/lang/OpenClaw |
| `supabase/functions/_shared/system-prompt.ts` | BASE_PROMPT con Principio Zero v3 | **RIUSA** (già fixato commit 250364a) |
| `supabase/functions/_shared/memory.ts` | Memoria studente Supabase | **MODIFY**: aggiungi class/teacher/school |
| `supabase/functions/_shared/rag.ts` | pgvector + retrieval | **MODIFY**: up a 5000+ chunk + hybrid search RRF |
| `supabase/functions/_shared/guards.ts` | Sanitize + rate limit | **RIUSA** (già robusto) |
| `supabase/functions/_shared/gemini.ts` | API client + thinking fix | **REPLACE by OpenClaw router** (ma tenere come fallback chain) |
| `supabase/functions/unlim-diagnose/index.ts` | Diagnosi circuito | **MODIFY**: chiama Qwen VL RunPod invece di Gemini Vision |
| `supabase/functions/unlim-hints/index.ts` | Hint progressivi | **RIUSA** (già funzionale) |
| `supabase/functions/unlim-tts/index.ts` | TTS Voxtral VPS | **MODIFY**: chiama F5/Kokoro RunPod |
| `supabase/functions/unlim-gdpr/index.ts` | GDPR right-to-delete | **RIUSA + ESTENDI** per FASE 15 feedback consent |

### Test esistenti (NON toccare senza motivo)
- **12056 test PASS baseline** — riusa, espandi, non modificare senza TDD failing first
- `automa/baseline-tests.txt` = 12056
- 320 test voice
- 195 file test totali

### Infrastruttura esistente (già UP)
- Brain V13 Ollama Qwen3.5-2B su VPS `72.60.129.50:11434` → **RIUSA come fallback offline**
- Edge TTS Microsoft su VPS Hostinger → **RIUSA come deep fallback TTS**
- Compiler n8n su `n8n.srv1022317.hstgr.cloud/compile` → **RIUSA**
- Supabase project `vxvqalmxqtezvgiboxyv` → **RIUSA** (DB + auth + Edge + pgvector)
- Vercel frontend `https://www.elabtutor.school` → **RIUSA**

**Prima di ogni NEW file, verifica con**:
```bash
# Cerca simile esistente
grep -r "nomeFunzione\|NomeComponente" src/ supabase/ --include="*.js" --include="*.ts" --include="*.jsx"
```

**Se file simile esiste → MODIFY, mai NEW duplicato.**

---

## 📋 Task suddivisi (8 macro-task)

### Task 1.1 — Lesson Reader (Principio Zero UI killer feature)

**Obiettivo**: componente React timeline capitolo che il docente apre, sceglie esperimento, UNLIM prepara contenuto, docente proietta.

**Pre-audit**:
```bash
git status  # pulito
npx vitest run  # baseline 12056 confermato
```

**TDD failing first**:
```typescript
// tests/unit/lavagna/LessonReader.test.jsx
describe('LessonReader', () => {
  it('renders timeline capitolo with citations libro', () => {
    render(<LessonReader chapterId="v1-cap6" />);
    expect(screen.getByText(/Cos'è il diodo LED/i)).toBeInTheDocument();
    expect(screen.getByText(/pag\. 29/i)).toBeInTheDocument();
    expect(screen.getByText(/470 Ohm/i)).toBeInTheDocument();
  });
  // +15 altri test: navigation, sync simulator, UNLIM call, errors
});
```

**Implementation files**:
- NEW: `src/components/lavagna/LessonReader.jsx` (~400 righe)
- NEW: `src/components/lavagna/LessonReader.module.css`
- NEW: `src/components/lavagna/LessonTimeline.jsx` (~200 righe)
- NEW: `src/components/lavagna/LessonStep.jsx` (~150 righe)
- NEW: `src/hooks/useLessonReader.js`
- MODIFY: `src/components/lavagna/LavagnaShell.jsx` (aggiungi tab Lezione Guidata)
- DATA: uses `src/data/lesson-groups.js` + `src/data/volume-references.js` + `src/data/experiments-vol*.js`

**Design UX (timeline verticale, scrollabile)**:
```
▼ Vol.1 Cap 6 — Cos'è il diodo LED? (pag. 27-35)
│
├─ 📖 INTRO pag. 27 [docente proietta]
│   UNLIM ha preparato: "Ragazzi, in questo capitolo scopriremo..."
│
├─ 🧪 ESP 1 — Accendi il LED (pag. 29) [docente preme Start]
│   📋 Kit fisico (check list): LED, breadboard, resistore 470Ω, clip+batteria 9V
│   🔌 Simulatore si apre automaticamente con circuito pre-costruito
│   🎙 UNLIM pronto: contenuto "Ragazzi, pronti?..." [click per proiettare]
│
├─ 🧠 PERCHÉ FUNZIONA (pag. 30-31) [narrativa continua]
│   "Come racconta il libro: Il LED è un diodo che..."
│
├─ 🧪 ESP 2 — Perché serve il resistore (pag. 32)
│   ...
│
└─ 🎯 QUIZ CAP 6 [fine capitolo]
    UNLIM genera 3 domande su cosa hanno imparato
```

**Exit criteria**:
- [ ] Tutti test LessonReader verdi (15+ test)
- [ ] Playwright E2E: `tests/e2e/lesson-reader.spec.ts` apre `v1-cap6`, verifica timeline, clicca step, simulator mount
- [ ] Zero regressione baseline 12056
- [ ] Accessibile WCAG AA (axe-core 0 violations)
- [ ] Build OK, bundle size +max 50KB
- [ ] CoV 3/3 PASS
- [ ] Auditor APPROVE

**Doc**:
- `docs/features/lesson-reader.md` (usage, props, data flow)
- `CHANGELOG.md`: `feat(lavagna): LessonReader Principio Zero v3 UI`
- `CLAUDE.md` (nessuna regola cambia, solo reference)

### Task 1.2 — Multilingue (7 lingue: IT/EN/FR/DE/ES/AR/ZH)

**Obiettivo**: UNLIM supporta 7 lingue. Docente seleziona in setup classe (default IT).

**Pre-audit**: stessa check.

**TDD failing**:
```typescript
describe('UNLIM multilingual', () => {
  it.each(['IT', 'EN', 'FR', 'DE', 'ES', 'AR', 'ZH'])('responds in %s', async (lang) => {
    const response = await callUnlim({ message: 'spiega v1-cap6-esp1', lang });
    expect(response).toMatch(expectedLangPatterns[lang]);
  });
});
```

**Implementation**:
- MODIFY `supabase/functions/_shared/system-prompt.ts`: aggiungi parametro `lang` a `buildSystemPrompt(..., lang)` che injecta regola linguistica
- MODIFY `supabase/functions/unlim-chat/index.ts`: accetta `lang` da request body
- MODIFY `src/services/api.js`: invia `lang` da classProfile
- NEW `src/data/unlim-translations.js`: dizionari apertura ("Ragazzi," → "Kids," → "Enfants," → "Kinder," → "Niños," → "يا أطفال," → "同学们,")
- MODIFY `src/services/classProfile.js`: campo `preferredLanguage`
- MODIFY `src/components/teacher/ClassSetup.jsx`: dropdown lingua

**Exit criteria**:
- [ ] 7 lingue test verdi (live vs OpenClaw endpoint con Llama 3.3 70B multilingual)
- [ ] Apertura corretta ("Ragazzi," in IT, "Kids," in EN...)
- [ ] Citazione libro sempre in italiano (volumi ELAB solo in italiano) anche se sessione in altra lingua
- [ ] CoV 3/3

### Task 1.3 — Vision "Guarda il mio circuito"

**Obiettivo**: studente chiede "UNLIM, guarda cosa ho fatto" → cattura screenshot canvas → manda a Qwen 2.5 VL 7B su RunPod → diagnosi + highlight componenti problematici.

**Pre-audit**: stessa.

**TDD**:
```typescript
describe('UNLIM Vision', () => {
  it('diagnoses LED inverted', async () => {
    const screenshot = loadFixture('led-inverted.png');
    const resp = await callVision({ image: screenshot, message: 'perché non accende?' });
    expect(resp).toContain('polarità');
    expect(resp).toMatch(/\[AZIONE:highlight:led/);
  });
});
```

**Implementation**:
- MODIFY `src/services/unlimContextCollector.js`: includes screenshot
- MODIFY `src/services/api.js`: send `images` array
- MODIFY `supabase/functions/unlim-chat/index.ts`: route vision request a RunPod endpoint Qwen VL
- MODIFY `supabase/functions/_shared/router.ts`: decide se vision needed
- NEW `src/components/tutor/VisionTrigger.jsx`: pulsante "guarda il mio circuito"

**Exit criteria**: 20 screenshot test (LED, resistore, pulsante, motore), accuracy >85%, CoV 3/3.

### Task 1.4 — Voice stack (STT + TTS + wake word)

**Obiettivo**:
- Wake word "Ehi UNLIM" → openWakeWord on-device browser
- STT → invia audio a Whisper V3 Turbo RunPod endpoint
- TTS → riceve testo, chiama F5-TTS (o Kokoro se F5 italiano fail) RunPod endpoint, riproduce audio

**Pre-audit**: controlla `src/hooks/useTTS.js` e `src/services/voiceService.js` esistenti (320 test voice già presenti).

**TDD failing**:
```typescript
describe('Wake word', () => {
  it('detects "Ehi UNLIM" in audio stream', async () => {
    const audio = loadFixture('ehi-unlim.wav');
    const detected = await wakeWordDetector.process(audio);
    expect(detected).toBe(true);
  });
});
```

**Implementation**:
- NEW `src/hooks/useWakeWord.js`: integra openWakeWord via Web Audio API
- NEW `public/models/unlim-wake.tflite`: modello custom trained per "Ehi UNLIM"
- MODIFY `src/hooks/useTTS.js`: supporta F5/Kokoro via RunPod endpoint
- MODIFY `src/services/voiceService.js`: STT via Whisper RunPod
- NEW `src/components/lavagna/VoiceToggle.jsx`: pulsante on/off wake + TTS in AppHeader
- MODIFY `src/components/lavagna/AppHeader.jsx`: aggiungi VoiceToggle

**Exit criteria**:
- [ ] Wake word accuracy >95% su 100 sample italiano
- [ ] STT WER <5% su 10 audio bambini 8-14
- [ ] TTS latency <2s, quality MOS >4 (test Fase 14)
- [ ] Toggle on/off persistente localStorage + sync Supabase
- [ ] CoV 3/3

### Task 1.5 — Fumetto Report (SessionReportComic)

**Obiettivo**: fine lezione → UNLIM genera 6 vignette SVG+immagine via SDXL RunPod endpoint + narration TTS → PDF condivisibile.

**Pre-audit**: controlla `docs/design/` se esiste mock.

**Implementation**:
- NEW `src/components/lavagna/SessionReportComic.jsx`
- NEW `src/services/fumettoGenerator.js` (chiama SDXL endpoint)
- NEW `src/data/comic-prompts.js`: template prompt SDXL per stile consistente
- NEW `src/services/pdfExporter.js`: genera PDF 6 vignette

**Exit criteria**:
- [ ] 10 fumetto test generati, coerenza stile
- [ ] PDF export OK, <2MB
- [ ] Tempo generazione <60s
- [ ] CoV 3/3

### Task 1.6 — Onniscienza (RAG 5000+ chunk + KG + memoria multi-livello)

**Obiettivo**: UNLIM sa tutto dei volumi + storia classi + knowledge graph concetti.

**Implementation**:
- NEW `scripts/rag-ingestion.js`: pipeline ingestion da PDF volumi + datasheet + tutorial + FAQ
- MODIFY `supabase/functions/_shared/rag.ts`: query su 5000+ chunk (già pgvector scale a 10-50M)
- NEW `openclaw/neo4j-setup.sh`: knowledge graph concetti elettronica
- MODIFY `supabase/functions/_shared/memory.ts`: expand a `class_memory`, `teacher_preferences`, `school_context`

**Exit criteria**:
- [ ] 5000+ chunk ingeriti, similarity retrieval <500ms
- [ ] KG 200+ concetti + edges
- [ ] Memory multi-livello test verdi
- [ ] Cross-session "Ti ricordi..." funzionale

### Task 1.7 — Azioni autonome UNLIM

**Obiettivo**: espandi `__ELAB_API` con azioni mancanti + parsing robusto `[AZIONE:...]` tag.

**Pre-audit**: audit `src/services/simulator-api.js` + `src/services/api.js` (26+ azioni già esistenti).

**Implementation**:
- MODIFY `supabase/functions/_shared/action-parser.ts`: handle chain multi-step
- MODIFY `src/services/simulator-api.js`: add any missing action
- NEW `src/services/proactiveDiagnosis.js`: UNLIM diagnostica senza chiedere

**Exit criteria**: 30 azioni test verdi, chain multi-step OK.

### Task 1.8 — Integration smoke Playwright

**Obiettivo**: scenario completo UNLIM end-to-end.

**File**: `tests/e2e/unlim-full-flow.spec.ts`

Flow:
1. Apri `/lavagna#v1-cap6`
2. Click "Lezione guidata" → Timeline rendered
3. Click esp 1 → simulator mount + UNLIM pronto
4. Click "Proietta contenuto" → UNLIM genera via OpenClaw
5. Verifica testo: "Ragazzi...Vol. 1 pag. 29...470 Ohm"
6. Click wake word simulate → TTS audio play
7. Screenshot circuit → Vision diagnosis
8. Fine → Fumetto 6 vignette generato
9. PDF export OK

**Exit criteria**: scenario 3× PASS, audit indipendente OK.

---

## 🔬 Gate finale PDR #1 (merge-ready)

- [ ] Tutti 8 task completati con pattern 8-step
- [ ] Baseline test: da 12056 a 13500+ (+1444 dai task 1.1-1.8)
- [ ] Playwright E2E 20+ scenari verdi
- [ ] Zero regressione benchmark
- [ ] Tutti Auditor APPROVE
- [ ] Documentation: `docs/features/` aggiornato per ogni feature
- [ ] `CLAUDE.md` sezione "Bug aperti" aggiornata
- [ ] `CHANGELOG.md` con 8 entry categorizzate
- [ ] PR #X su GitHub con descrizione completa

## 🚨 Rischi & mitigation PDR #1

| Rischio | Probabilità | Mitigation |
|---------|-------------|------------|
| F5-TTS italiano quality fail → Kokoro fallback | Alta | Pre-tested in Fase 14, branch parallel con Kokoro |
| Vision Qwen VL accuracy insufficient | Media | Test 20 scenari, se <85% → upgrade a Qwen VL 72B (serve A100 80GB) |
| Wake word false positive eccessivo | Media | Threshold calibration, test 100 sample ambienti diversi |
| Fumetto SDXL stile incoerente | Media | Prompt engineering iterativo + LoRA stile fisso |
| Baseline test drift +1444 irrealistico | Bassa | Contingency: split in PDR #1a/#1b se necessario |

## 📤 Handoff

Post-merge PDR #1:
- UNLIM è onnipotente + onnisciente + multilingue in staging Vercel preview
- Testabile live da Andrea via browser
- Pronto per PDR #4 Lesson Reader (UI polish dedicato)

---

**Governance compliance**: rispetta `docs/GOVERNANCE.md`. Audit ogni sub-task, CoV 3×, doc aggiornato nella stessa PR.
