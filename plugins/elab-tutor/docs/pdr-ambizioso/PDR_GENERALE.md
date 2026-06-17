# PDR GENERALE — ELAB Tutor v1.0 Ambizioso 8 Settimane

**Data redazione**: 2026-04-20
**Periodo esecuzione**: lunedì 21/04/2026 → domenica 15/06/2026 (8 settimane = 56 giorni)
**Owner principale**: Andrea Marro (lead dev)
**Co-developer**: Tea Lea (path safe + glossario + UX schema)
**Goal sintetico**: Release v1.0 ELAB Tutor con UNLIM ultraprofondo (onnipotenza + onniscienza + comprensione contesto) + Voice premium + Tea integrata + path testing economico → migration self-host EU GDPR completo.

---

## Sommario esecutivo

ELAB Tutor v1.0 ambizioso = piattaforma educativa elettronica/Arduino bambini 8-14 anni con AI tutor "UNLIM" che:
- **Capisce** ultraprofondamente contesto (stato simulator, codice user, errori, storia studente)
- **Sa** ultraprofondamente conoscenza (RAG 6000+ chunk manuali Vol1/2/3 + glossario Tea + BOM kit)
- **Esegue** ultraprofondamente azioni (30+ tool calls + diagnostica rules + multi-step chains + debug session)
- **Parla** voce premium (Voxtral italiano custom voice cloning 3s sample)
- **Differenziatore reale** vs competitor: nessun competitor scuole italiane fa così

**Path costo intelligente**:
- Sett 1-3: API serverless Together AI (cheap, GDPR DPA acceptable beta) — €60-70/mese
- Sett 4-5: setup parallel RunPod EU (preserva privacy roadmap)
- Sett 6-8: migration self-host EU completo Voxtral + Qwen + Vision — €120-150/mese
- Post-revenue: scale lineare costi bilanciato

---

## Principio Zero v3 — REGOLA SUPREMA

Source immutabile: `/supabase/functions/_shared/system-prompt.ts`

UNLIM = generatore contenuto didattico per docente proiettato LIM ai ragazzi.

**Regole assolute** (mai violare):
- Studenti NON interagiscono direttamente con UNLIM né con ELAB Tutor: vedono LIM proiettata
- Linguaggio plurale "Ragazzi," sempre (mai singolare, mai meta-istruzioni docente)
- Max 3 frasi + 1 analogia, 60 parole MAX
- Citazione libro fedele: "Come dice il libro a pag. X..."
- FORBIDDEN ASSOLUTO: "Docente, leggi", "Insegnante, leggi" (vengono filtrati via test E2E)
- Analogie bambini 10-14 anni: strade, tubi, porte, ricetta, squadra, palette pittore
- NO acronimi tecnici universitari (RC, MOSFET extended → analogie bambini)

**Enforcement**:
- Test E2E ogni PR enforce: regex `/Ragazzi/` PRESENTE, regex `/Docente,?\s*leggi/i` ASSENTE
- Watchdog 24/7 monitor production: ogni run cron `*/15 min` verifica produzione live
- Audit indipendente (Auditor agent) ogni PR pre-merge
- Documentation `docs/audits/principio-zero-v3-*.md` storico verifications

**OGNI feature/test/commit DEVE preservare Principio Zero v3.**

---

## Architettura completa

### Diagramma layer

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BROWSER bambino (LIM proiettata)                      │
│                  React 19 + Vite 7 + CSS Modules                        │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ LavagnaShell │  │ ChatOverlay  │  │ VisionButton │  │ VoiceBtn   │ │
│  │ (canvas)     │  │ (UNLIM chat) │  │ (screenshot) │  │ (voice)    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                 │                 │         │
│         └─────────────────┴─────────────────┴─────────────────┘         │
│                                  │                                       │
│                    window.__ELAB_API.* (30+ methods)                    │
│         (parser frontend [AZIONE:...] → tool execution)                 │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │ HTTPS POST
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS (Deno) — bridge layer              │
│                                                                          │
│  unlim-chat | unlim-diagnose | unlim-hints | unlim-tts | unlim-gdpr     │
│                                                                          │
│  - Vercel AI SDK (multi-step agentic loop framework)                    │
│  - Tool definitions (30+ tools schema Zod validated)                    │
│  - Stream response (Server-Sent Events SSE)                             │
│  - PRESERVA BASE_PROMPT system-prompt.ts                                │
│  - Bridge OpenClaw IF deployed (sett 5+) o direct provider (sett 1-4)   │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │
                  ┌────────────────┴────────────────┐
                  │                                  │
                  ▼ (sett 1-3: API direct)          ▼ (sett 5+: via OpenClaw)
┌──────────────────────────────┐    ┌──────────────────────────────────┐
│   TOGETHER AI / API DIRECT   │    │   OPENCLAW VPS Hetzner CX52       │
│   (testing economico beta)    │    │   (orchestrator multi-agent EU)   │
│                              │    │                                  │
│   - Qwen 2.5 72B / Llama 70B │    │   ┌────────────┐  ┌──────────┐ │
│   - Whisper STT API          │    │   │ Narratore  │  │ Diagnost.│ │
│   - TTS API                  │    │   │ agent      │  │ agent    │ │
│   - Embedding                │    │   └─────┬──────┘  └────┬─────┘ │
│                              │    │         │              │        │
│   Cost: €1-15/mese Andrea    │    │   ┌─────▼──────────────▼────┐  │
│   GDPR: DPA OK (US-based)    │    │   │ Multi-agent routing      │  │
└──────────────────────────────┘    │   │ + tool use framework     │  │
                                     │   └─────────────┬────────────┘  │
                                     │                 │                │
                                     │                 ▼                │
                                     │   RUNPOD GPU SERVERLESS EU       │
                                     │   (Amsterdam Netherlands)         │
                                     │                                  │
                                     │   ┌────────────────────────┐    │
                                     │   │ Mistral Small 3 24B    │    │
                                     │   │ (LLM principale, IT)   │    │
                                     │   ├────────────────────────┤    │
                                     │   │ Voxtral 4B (TTS+STT)   │    │
                                     │   │ + voice cloning 3s     │    │
                                     │   ├────────────────────────┤    │
                                     │   │ Qwen 2.5 VL 7B (Vision)│    │
                                     │   ├────────────────────────┤    │
                                     │   │ BGE-M3 (embedding)     │    │
                                     │   └────────────────────────┘    │
                                     │                                  │
                                     │   Scale-to-zero idle = €0       │
                                     │   Andrea solo: €5-15/mese       │
                                     │   Privacy: ASSOLUTA EU          │
                                     └──────────────┬───────────────────┘
                                                    │
                                                    ▼
                              ┌─────────────────────────────────────────┐
                              │   SUPABASE pgvector (RAG)               │
                              │   6000+ chunk:                          │
                              │   - Manuali PDF Vol1/2/3 completi      │
                              │   - Glossario Tea (~55 termini)         │
                              │   - BOM kit componenti + datasheet      │
                              │   - Errori comuni + analogie bambini    │
                              └─────────────────────────────────────────┘
```

### Stack tecnologico definitivo

| Layer | Tool sett 1-3 (testing) | Tool sett 5+ (production EU) |
|-------|-------------------------|------------------------------|
| **Frontend** | React 19 + Vite 7 + CSS Modules | (preservato) |
| **Backend bridge** | Supabase Edge Functions Deno | (preservato) |
| **Agentic framework** | Vercel AI SDK (TypeScript) | (preservato) |
| **Orchestrator** | (none, direct API) | OpenClaw Node.js v24 Hetzner CX52 |
| **LLM principale** | Together AI API Qwen 72B / Llama 70B | Mistral Small 3 24B RunPod EU GPU |
| **Vision** | Gemini Vision API (current) | Qwen 2.5 VL 7B RunPod EU |
| **Voice TTS** | Together AI TTS / ElevenLabs | Voxtral 4B RunPod EU |
| **Voice STT** | Cloudflare Workers AI Whisper Turbo (free) | (preservato, già EU) |
| **Wake word** | openWakeWord browser-side custom "Ehi UNLIM" | (preservato, on-device) |
| **Embedding** | Together AI embedding | BGE-M3 RunPod EU |
| **Image gen rare** | DALL-E API | SDXL self-host RunPod (post-revenue) |
| **Storage RAG** | Supabase pgvector | (preservato, EU Frankfurt) |
| **Brand assets** | TRES JOLIE foto reali in `public/brand/` | (preservato) |

### Modelli alternative (cinesi/europei selezione)

Per scelta italiano-capable:

| Modello | Provider | Quality IT | Size Q4 | Note |
|---------|----------|------------|---------|------|
| **Mistral Large 2** | Mistral EU | ⭐⭐⭐⭐⭐ nativo | 70B | Top quality production |
| **Mistral Small 3** | Mistral EU | ⭐⭐⭐⭐⭐ | 24B | RTX 4090 OK, Andrea solo |
| **Mistral Nemo 12B** | Mistral EU | ⭐⭐⭐⭐ | 12B | Edge fast |
| **Qwen 2.5 72B** | Alibaba | ⭐⭐⭐⭐⭐ | 72B | Top open source |
| **Qwen 2.5 32B** | Alibaba | ⭐⭐⭐⭐ | 32B | Balance |
| **Llama 3.3 70B** | Meta | ⭐⭐⭐⭐ | 70B | Meta open |
| **Aya 32B** | Cohere | ⭐⭐⭐⭐⭐ multilingua | 32B | Explicit IT |
| **DeepSeek-V3** | DeepSeek | ⭐⭐⭐⭐⭐ coding | 70B | AST analyzer |

**Sett 1-3 raccomandato**: Together AI Llama 3.3 70B (€0.88/M token, €1-3/mese Andrea solo).
**Sett 6+ raccomandato self-host**: Mistral Small 3 24B (privacy EU + RTX 4090 fit + italiano nativo).

---

## Path costi intelligente — testing → GDPR

### Sett 1-3 (lun 21/04 → dom 11/05) — TESTING ECONOMICO

**Stack provvisorio**:
- Together AI API per LLM (Llama 70B / Qwen 72B)
- Cloudflare Whisper Turbo gratis
- Edge Function bridge (current)
- Supabase + Vercel (current)
- Tea Babbalea

**Costi**:
| Voce | €/mese |
|------|--------|
| Stack attuale Supabase Pro + Vercel | 60 |
| Together AI API Andrea solo lightweight | 1-3 |
| Cloudflare Whisper free tier | 0 |
| **Totale sett 1-3** | **~61-63/mese** |

**GDPR**: Together AI US-based con DPA (Data Processing Agreement) signed. Acceptable per Andrea solo testing + beta limited 5 classi pilot. NON definitivo production scale.

### Sett 4-5 (lun 12/05 → dom 25/05) — SETUP PARALLEL EU

**Stack transition**:
- Continua Together AI per traffico user-facing
- Setup parallel RunPod EU + Hetzner CX52 OpenClaw
- A/B test 10% traffico self-host EU vs 90% Together AI
- Verifica quality regression Mistral Small 3 vs Llama 70B

**Costi**:
| Voce | €/mese |
|------|--------|
| Stack sett 1-3 invariato | 61-63 |
| RunPod GPU serverless EU setup | +5-10 (test light) |
| Hetzner CX52 OpenClaw | +32 |
| **Totale sett 4-5** | **~98-105/mese** |

### Sett 6-8 (lun 26/05 → dom 15/06) — MIGRATION SELF-HOST EU GDPR PERFETTO

**Stack production EU**:
- 100% traffico self-host EU
- Together AI = fallback only (downtime RunPod)
- OpenClaw orchestrator multi-agent
- Mistral Small 3 + Voxtral + Qwen VL + BGE-M3 tutti RunPod EU Amsterdam
- Supabase EU Frankfurt
- Vercel EU edge

**Costi**:
| Voce | €/mese |
|------|--------|
| Stack attuale | 60 |
| Hetzner CX52 OpenClaw | 32 |
| RunPod GPU serverless EU (Andrea solo lightweight) | 16-25 |
| DALL-E API rare cases | 5 |
| Cloudflare Whisper free | 0 |
| Together AI fallback rarissimo | <1 |
| **Totale ricorrente** | **~115-125/mese** |
| **Setup ONE-TIME** (Hetzner provisioning + RunPod credit) | **€100** |

**GDPR**: ASSOLUTO EU. Zero data esce EU territorio.

### Scale post-revenue (5-10 classi paganti)

| Voce | €/mese scale |
|------|--------------|
| RunPod GPU scale | 100-300 |
| DALL-E scale | 10-30 |
| Tea retainer (Andrea+Tea decisione based revenue) | 0 OR 500-2000 |
| Altri costi | ~92 |
| **Totale scale 5-10 classi** | **~200-450/mese + Tea** |

---

## Onnipotenza ultraprofonda — definizione

UNLIM **capisce + pilota** ELAB completamente:

### 1. Lettura stato real-time
- Componenti circuit (LED, resistor, button, etc) con voltage + current
- Codice Arduino user con AST analysis (sintassi + semantic + intent)
- Pin states (HIGH/LOW, voltage, mode INPUT/OUTPUT)
- Compilation errors con riga + suggested fix
- Step Passo Passo current + completion %
- Tab attiva + modalità (sandbox/guidata/test)

### 2. Diagnostica semantic translation
JSON state `{led1: {anode: 'D13', cathode: 'GND', voltage: 5.2}}` → narrazione UNLIM:

> "Ragazzi, vedo che il LED rosso è collegato al pin D13 e a GND. La polarità è giusta! Vediamo se il codice manda il segnale al pin D13..."

### 3. Diagnostica rules engine (15+ patterns)
- LED polarità invertita (anode→GND, cathode→D pin)
- LED senza resistore (rischio brucia)
- Pulsante senza pull-up/down resistor (floating signal)
- Codice digitalWrite senza pinMode OUTPUT
- analogRead su pin digitale
- Resistore valore sbagliato (es 100kΩ per LED → troppo alto, non si accende)
- Connessione mancante (component isolato)
- Cortocircuito (alimentazione → GND diretto)
- Tensione esceduta (LED 9V senza resistore)
- Polarità batteria invertita
- + 5 patterns avanzati

### 4. Multi-step chains (state machine)
UNLIM esegue chains stateful con verification + retry:

```
[AZIONE:loadexp:v1-cap6-esp1]
[AZIONE:addcomponent:resistor:200:200]
[AZIONE:addwire:nano:D13:resistor:pin1]
[AZIONE:addwire:resistor:pin2:led:anode]
[AZIONE:addwire:led:cathode:nano:GND]
[AZIONE:compile]
[AZIONE:play]
```

State machine verifica ogni step success prima next. Rollback se chain rotta a metà.

### 5. Debug session conversazionale
Cross-turn stateful debug:
```
Turn 1: UNLIM "Vediamo perché il LED non si accende. [AZIONE:describe]"
Turn 2: User "non funziona ancora"
Turn 3: UNLIM "Continuo. [AZIONE:highlight:led1] La polarità sembra ok. Controlliamo il codice."
Turn 4: UNLIM "[AZIONE:highlight:codice:7] Riga 7: digitalWrite(13, LOW). Vuoi cambiarlo a HIGH?"
```

Supabase table `debug_sessions` mantiene state cross-turn.

### 6. Monitoring proattivo
setInterval check ogni 30s:
- Frustration detection (retry continui, click random, pause lunghe)
- Trigger nudge: "Ragazzi, vedo che siete bloccati. Provate a..."
- Trigger UNLIM auto-attivo se docente non interviene 60s

### 7. Modifica codice user
API `setCodeLine(lineNumber, newContent)`:
- UNLIM suggerisce fix concreto
- User conferma click "Applica"
- Editor modifica riga specifica preservando resto

### 8. Navigation completa
- `switchTab(tabName)`: Lavagna ↔ Lezione ↔ Volume ↔ Video
- `setMode(mode)`: sandbox / guidata / test
- `openVolume(volNumber, page)`: apri manuale virtuale pag specifica
- `openVideo(videoId)`: apri video tutorial
- `openGlossary(term)`: popup glossario Tea termine

### 30+ tool calls implementati

Lista completa in `PDR_SETT_5_ONNIPOTENZA.md`.

---

## Onniscienza ultraprofonda — definizione

RAG knowledge base 6000+ chunk:

### Fonti

| Fonte | Chunk stimati | Sett |
|-------|---------------|------|
| **Manuali PDF Vol1 27MB** | ~2000 | 4 |
| **Manuali PDF Vol2 17MB** | ~1500 | 4 |
| **Manuali PDF Vol3 18MB** | ~1500 | 4 |
| **Glossario Tea ~55 termini** | ~55 | 4 |
| **BOM kit componenti + datasheet** | ~200 | 4 |
| **27 Lezioni walkthrough step-by-step** | ~300 | 4 |
| **Errori comuni esperimenti** | ~150 | 4 |
| **Analogie bambini 8-14** | ~100 | 4 |
| **FAQ docente (mock + real post-beta)** | ~100 | 4 |
| **Video transcripts TRES JOLIE** | ~200 (sett 7 opzionale) | 7 |
| **Totale stimato** | **~6000+** | |

### Chunk strategy

- Paragraph-based, 400-500 token/chunk
- Overlap 50 token preserve context
- Metadata `{source, volume, page, chapter, section, type, language}`
- Embedding BGE-M3 multilingua

### Retrieval hybrid search

- Keyword search tsvector PostgreSQL
- Semantic search pgvector cosine similarity
- Rerank top 10 → top 3
- Threshold similarity > 0.7
- Citation injection nel prompt finale: "Come dice il libro a pag. X..."

### Memoria multi-livello (post-beta data popolamento)

Tabelle Supabase:
- `student_memory` — errori, tempo, tentativi per studente
- `class_memory` — completion rate, errori comuni per classe
- `teacher_memory` — preferences docente, lessons most used
- `school_memory` — analytics aggregati istituto

**Andrea solo tester**: scaffold solo, populate post-beta 5+ classi.

---

## Comprensione contesto ultraprofonda — definizione

Stato passato a UNLIM ogni request:

```javascript
{
  session: {
    studentAlias: 'S001',
    classKey: 'CLASS-DEMO-2026',
    teacherId: '...',
    startedAt: '...',
    currentExperiment: 'v1-cap6-esp1',
    currentStep: 3,
    totalSteps: 6,
    completionPct: 50,
  },
  simulator: {
    components: [...],
    connections: [...],
    pinStates: {...},
    voltage: {...},
    current: {...},
    ledBrightness: {...},
    compilation: { status: 'ok', errors: [], warnings: [] },
  },
  code: {
    raw: 'void setup() {...}',
    ast: { pinModes: {...}, digitalWrites: [...], issues: [...] },
    cursorLine: 7,
    lastEdited: '...',
  },
  history: {
    studentRecent: [...lastNActions],
    studentSession: { errorsCount: 2, attemptsCount: 5, timeSpent: 480 },
    studentLifetime: { experimentsCompleted: 12, avgTimePerExp: 600 },
    classAvg: { completionRate: 0.65, avgTime: 720 },
  },
  emotional: {
    state: 'frustrated' | 'engaged' | 'confident' | 'stuck',
    confidence: 0.7,
    triggerNudge: true,
  },
  conversation: {
    turnsCount: 4,
    lastTurns: [{role, content, timestamp}],
    activeDebugSession: 'sess_abc123' | null,
  },
  ui: {
    activeTab: 'lavagna',
    activeMode: 'guidata',
    activeVolume: 1,
    activePage: 29,
  },
}
```

State synthesis layer riduce JSON enorme → narrative compatto:

> "Studente S001 (Classe DEMO 2026), esperimento v1-cap6-esp1 step 3/6 (50%). Stato emotivo: frustrato (5 tentativi, 2 errori in 8 min, sopra media classe 12 min). Circuito: LED + resistore 470Ω OK polarità, ma codice riga 7 digitalWrite(13, LOW) — dovrebbe essere HIGH. Ultime azioni: 3 retry ricarica esperimento. UNLIM: intervieni proattivo con suggerimento fix codice."

Questo passa al modello LLM principale come system context.

---

## Tea integration estrema (volunteer)

### Ruolo Tea

Tea Lea Babbalea = co-developer con focus:
- Glossario termini tecnici (~55 → 100+)
- Schema UX 3-zone (Lavagna + UNLIM + Volume)
- Audit complessità 92 esperimenti vs kit fisico
- 10 idee miglioramento (docx 13/04)
- MOSFET fix segnalazione
- Vista pedagogica bambini 8-14 (tester profondo)

### Autoflow CODEOWNERS (sett 1)

`.github/CODEOWNERS`:
```
/src/data/glossary*           @Tea26-lea
/src/data/glossario*          @Tea26-lea
/src/data/experiments-vol*    @Tea26-lea
/public/glossario/**          @Tea26-lea
/docs/tea/**                  @Tea26-lea

/src/components/simulator/engine/**   @AndreaMarro
/src/services/api.js                  @AndreaMarro
/src/services/simulator-api.js        @AndreaMarro
/supabase/**                          @AndreaMarro
/.github/workflows/**                 @AndreaMarro
/CLAUDE.md                            @AndreaMarro
/docs/GOVERNANCE.md                   @AndreaMarro
```

### Auto-merge conditions Tea PR

PR Tea auto-merged se TUTTE condizioni vere:
- Author = `Tea26-lea`
- Files modificati SOLO in path safe (CODEOWNERS Tea)
- CI green (governance + quality + test)
- PR size < 500 LoC additions
- Zero npm dependencies aggiunte
- No `--no-verify` commits

Se UNA condizione false → PR resta DRAFT, attesa Andrea review manual.

### Workflow Andrea+Tea

- **Weekly call** venerdì 18:00-19:00 (Cowork OR Telegram voice OR Zoom)
- **Decisioni roadmap paritarie** (Tea voto = Andrea voto)
- **Telegram channel** `@ElabTeaBot` (sett 8 setup) per notifiche async
- **Pair programming session** weekly via Cowork OR Live Canvas
- **Credit obbligatorio**: ogni Tea PR genera CHANGELOG entry con co-author

### Riconoscimenti Tea

Volunteer status (no €):
- Co-author Git commits + CHANGELOG sempre
- README.md "Contributors" prominente
- Portfolio dev pubblico (GitHub repo)
- Reference per CV future
- Co-founder vibe (eventual equity Fase 2 vendite)

**Convertibilità paid retainer**: quando ELAB revenue €500+/mese sostenuto → Andrea propone retainer formale economico.

---

## Test strategy

### Pyramid

```
        ┌──────────────┐
        │  E2E Playwright │  ~50 scenari (UI completa)
       ┌┴──────────────┴┐
       │ Integration tests │  ~200 (Edge Function + API + DB)
      ┌┴──────────────────┴┐
      │   Unit tests vitest  │  ~12100 → 14000+ post-v1 (logic + components)
     ┌┴──────────────────────┴┐
     │   Type checks TS strict   │  Compile-time
    └────────────────────────────┘
```

### Test categories per sett

| Sett | Test category prioritari |
|------|--------------------------|
| 1 | Regression unit tests + UX bugs E2E |
| 2 | Infra smoke tests (Hetzner SSH, RunPod endpoint) |
| 3 | Integration Edge Function ↔ OpenClaw |
| 4 | RAG retrieval accuracy + onniscienza scenari |
| 5 | Onnipotenza E2E 30 scenari pilotaggio |
| 6 | Voice E2E (wake → STT → LLM → TTS) |
| 7 | Contesto AST analyzer + emotional state |
| 8 | Stress test 100 scenari + UAT con Tea |

### Principio Zero v3 enforce in test

Ogni test E2E include assertion:
```javascript
const text = await page.textContent('body');
expect(text).toMatch(/Ragazzi/i);  // PZ v3 PRESENTE
expect(text).not.toMatch(/Docente,?\s*leggi/i);  // FORBIDDEN
expect(text).not.toMatch(/Insegnante,?\s*leggi/i);
```

Watchdog cron `*/15 min` verifica produzione live stesso pattern.

---

## Governance 8-step rigoroso

Ogni task segue 8-step (no eccezioni):

1. **Pre-audit**: git SHA + baseline test count + build OK + scope chiaro → `docs/tasks/TASK-XXX-start.md`
2. **TDD fail-first**: scrivi test che fallisce → commit `test(area): TDD fail per TASK-XXX`
3. **Implementation**: codice minimal per passare test → commit `feat/fix(area): implementa TASK-XXX`
4. **CoV 3x**: `npx vitest run` 3 volte consecutive → `docs/reports/TASK-XXX-cov.md` con 3/3 PASS
5. **Audit indipendente**: dispatch agent reviewer (coderabbit, wshobson/comprehensive-review) → `docs/audits/TASK-XXX-audit.md` verdict APPROVE/CHANGES/BLOCK
6. **Doc-as-code**: `docs/features/X.md` + `CHANGELOG.md` entry stessa PR
7. **Post-audit**: baseline test count ≥ pre-task + benchmark ≥ pre-task + build OK → `docs/audits/TASK-XXX-post.md`
8. **Push + PR draft**: `gh pr create --draft` con body completo (governance checklist + CoV link + audit link)

**Override governance**: solo Andrea con commit message `[GOVERNANCE-OVERRIDE: motivo]` + giustificazione esplicita.

---

## Rischi + autocritica brutale

### Rischi tecnici

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Voxtral italiano quality scarsa (NON verificato Andrea direct) | 30% | Alto | Fallback ElevenLabs €22/mese OR Together TTS |
| Mistral Small 3 24B italiano < Gemini Pro | 40% | Medio | A/B test sett 4-5, mantieni Gemini fallback |
| OpenClaw multi-tenant scuole non scalabile | 50% | Alto | Andrea solo + max 5 classi pilot pre-rewrite |
| Cold start RunPod 5-30s = bambini in classe noteranno | 60% | Medio | Keep-warm script ogni 5 min sett ore lezione |
| Latenza Edge → OpenClaw → RunPod = 1-3s totale | 70% | Medio | Streaming response (parziale visibile subito) |
| PDF ingest manuali OCR errori | 40% | Basso | Verify chunk quality post-ingest manualmente |
| CircuitSolver edge cases bug emerging | 30% | Alto | Test coverage extension + monitoring Sentry |
| 8 settimane focus = burnout Andrea | 70% | Critico | Riposo weekend + Tea share carico + buffer week |
| Tea Babbalea disponibilità incerta | 50% | Medio | CODEOWNERS path safe = Tea autonomous, no Andrea bottleneck |
| Costi cumulativi 6 mesi = €700-1500 | Certo | Basso | Accept (mitigation: revenue scuole) |

### Rischi business

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Scuole MePA NON adottano (Giovanni vendite slow) | 40% | Critico | Path A revenue back-up: Vendita diretta scuole pilot |
| Privacy concerns genitori bambini (Together AI US sett 1-3) | 30% | Alto | Migration self-host EU sett 6-8 = mitigation |
| Competitor scuole fa stesso/simile | 20% | Medio | Differentiator self-host EU = barriera entry |
| PNRR scuole funding cut/delay | 40% | Alto | Fallback: vendita private schools / parents direct |

### Autocritica scope plan

- **Andrea solo dev + 8 settimane = ambizioso** (quasi 60h/settimana media)
- **PDR ultra-dettagliato 56 daily = rischio over-planning** (esecuzione potrebbe deviare, plan ditt rigido)
- **Multi-livello memory + emotional ML = scope premature** (richiede multi-user data, scaffold OK ma polish è Fase 2)
- **OpenClaw + RunPod sett 5+ = setup complesso** (1 settimana puro infra, deviazione possibile)
- **Voxtral quality non verified = scommessa** (mitigazione fallback ElevenLabs)

**Cose che potrebbero andare wrong + plan B**:
- RunPod EU saturation → migrate Together AI fallback
- OpenClaw bug → revert direct API Edge Function (Vercel AI SDK)
- Voxtral italiano scarsa → ElevenLabs €22/mese
- Tea inattiva 1 settimana → Andrea continua solo CODEOWNERS path safe Tea
- Andrea malato/burnout → buffer settimana 8 = release può slittare 1-2 settimane senza panic

---

## Connettori (MCP) attivi e da usare

### Critical use ogni sessione

- `mcp__plugin_playwright_playwright__*` — browser live test E2E
- `mcp__supabase__*` — secrets + edge deploy + DB queries
- `mcp__plugin_claude-mem_mcp-search__*` — context persistence sessioni cross-day

### Useful

- `WebFetch` — research docs framework + API
- `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep` — file ops
- `TodoWrite` — task tracking
- `Agent` (subagent dispatch) — parallel work multi-task
- `gh` CLI (via Bash) — PR + workflow management

### Sett 5+ (post OpenClaw deploy)

- OpenClaw HTTP API endpoint own — proprio server
- Telegram bot API — notifiche docente sett 8

---

## Skills attive disponibili

### Built-in ELAB

- `elab-rag-builder` — costruisce RAG da volumi ELAB
- `analisi-simulatore` — audit simulator
- `quality-audit` — end-to-end audit
- `volume-replication` — verify parallelism volumi
- `lavagna-benchmark` — benchmark Lavagna
- `arduino-simulator` — compiler + simulator
- `elab-benchmark` — 30 metriche oggettive

### Anthropic skills

- `anthropic-skills:pdf` — PDF read manuali
- `anthropic-skills:xlsx` — Excel BOM kit

### Superpowers

- `superpowers:test-driven-development` — TDD enforced
- `superpowers:systematic-debugging` — root cause obbligatorio
- `superpowers:verification-before-completion` — pre-PR check
- `superpowers:writing-plans` — plan structuring
- `superpowers:dispatching-parallel-agents` — multi-agent

### Plugin marketplace

- `caveman` — token efficiency reasoning
- `lyra` — prompt optimization
- `ultrathink` — multi-specialist coordination

### Agency-agents (design)

- `design-whimsy-injector.md` — joy moments
- `design-inclusive-visuals-specialist.md` — bambini accessibility
- `design-visual-storyteller.md` — narrative arc
- `design-ui-designer.md` — layout
- `design-ux-architect.md` — flow

---

## Costi totali 8 settimane (revised onesto)

| Periodo | €/mese | Cumulativo |
|---------|--------|-----------|
| Sett 1-3 (testing API) | 61-63 | €183-189 |
| Sett 4-5 (parallel setup EU) | 98-105 | €196-210 |
| Sett 6-8 (self-host EU) | 115-125 | €345-375 |
| **Setup ONE-TIME** | €100 (RunPod credit + Hetzner provisioning + Together AI top-up + DALL-E test) | |
| **Totale 8 settimane** | | **€824-874** + Tea (volunteer GRATIS) |

**Cash burn** prima revenue: ~€850-900 totali.

---

## Output v1.0 candidate (dom 15/06)

✅ **Stack 100% self-host EU** Hetzner DE + RunPod NL + Cloudflare EU + Supabase EU
✅ **GDPR ASSOLUTO** zero data esce EU
✅ **Onnipotenza ultraprofonda**: 30+ tool calls + diagnostica rules + chains + debug session + monitoring proattivo
✅ **Onniscienza ultraprofonda**: RAG 6000+ chunk + glossario Tea + BOM + datasheet
✅ **Comprensione contesto ultraprofonda**: AST analyzer + memoria multi-livello scaffold + state synthesis
✅ **Voice premium Voxtral**: voce custom UNLIM cloning Andrea italiano
✅ **Vision Qwen VL**: diagnostica circuiti italiana
✅ **OpenClaw orchestrator**: multi-agent routing internal + layer docente Telegram async
✅ **Tea estrema integrata**: autoflow CODEOWNERS + glossario import + retainer roadmap
✅ **DALL-E + SDXL fallback**: Fumetto custom future
✅ **Production stabile**: 6 prod bugs T1 fixed + UX bugs zero + Vol3 parity + foto reali TRES JOLIE
✅ **Test coverage**: 12100 → 14000+ unit + 50 E2E + integration + Principio Zero v3 enforce
✅ **Watchdog 24/7**: monitoring production + anomaly log
✅ **Documentation v1.0**: user manual + admin manual + privacy policy + architecture doc

---

## Next steps lunedì 21/04 — kickoff

### Andrea action prima sett 1 (weekend 19-20/04)

1. ✅ Plan letto integralmente
2. ✅ Conferma scope 8 settimane
3. ✅ Conferma stack path testing → GDPR
4. ✅ Tea Babbalea comunicato (email/WhatsApp)
5. ⏳ Together AI account creazione (per sett 1)
6. ⏳ Telegram BotFather account (per sett 8)
7. ⏳ Hetzner Cloud account (per sett 2)
8. ⏳ RunPod account + €50 credit test (per sett 4)

### Tea action prima sett 1

1. ⏳ Email Andrea conferma volunteer + leggi `README.md` + `PDR_GENERALE.md`
2. ⏳ Setup ambiente locale ELAB (clone repo + npm install + verify baseline)
3. ⏳ GitHub collaborator accept invite
4. ⏳ Lettura `PDR_SETT_1_STABILIZE.md` per task assegnati Tea (Mar 22 schema UX 3-zone)

### Lun 21/04 mattina kickoff

- Andrea: lancia Claude CLI bypass + Opus + xhigh
- Andrea: TASK 1.1 sett 1 (`PDR_GIORNO_01_LUN_21APR.md`)
- Tea: review README + PDR generale + onboarding self-paced

---

## Documenti complementari

- `PDR_SETT_1_STABILIZE.md` — sett 1 dettaglio
- `PDR_SETT_2_INFRA.md` — sett 2 dettaglio
- ... fino `PDR_SETT_8_RELEASE.md`
- `giorni/PDR_GIORNO_01_LUN_21APR.md` ... `PDR_GIORNO_56_DOM_15GIU.md` — daily granular
- `RISK_REGISTER.md` — rischi tracker live
- `COST_TRACKER.md` — costi reali vs preventivati live
- `DECISIONS_LOG.md` — ADR (Architecture Decision Records)

---

## Firma + commit

**Documento autoredatto**: 2026-04-20 da Claude Watchdog Session per Andrea Marro + Tea Lea.

**Approvazione richiesta**: Andrea reply OK START + Tea conferma onboarding entro dom 20/04 ore 23:59.

**Stop scope shift**: questo plan è DEFINITIVO. Ogni richiesta scope addition post-approval = `DECISIONS_LOG.md` ADR + impact analysis time/cost.

**Principio Zero v3 IMMUTABILE preservato in OGNI commit del piano.**
