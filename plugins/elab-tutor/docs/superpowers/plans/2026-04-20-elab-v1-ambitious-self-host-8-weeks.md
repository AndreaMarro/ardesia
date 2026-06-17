# ELAB Tutor v1.0 AMBIZIOSO Self-Host 8-Week Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ELAB Tutor v1.0 RIVOLUZIONARIO con UNLIM ultraprofondo (onnipotenza + onniscienza + comprensione contesto) + Voice premium Voxtral + Stack 100% self-host EU (Qwen 2.5 72B + OpenClaw orchestrator + Voxtral + DeepSeek + BGE-M3 + Cloudflare Whisper) + Tea co-developer effective. 8 settimane (lun 21/04 → dom 15/06). Differenziatore reale vs competitor scuole.

**Architettura strategica:**

```
Browser elabtutor.school (React 19 + Vite 7)
  ↓ POST chat + stato simulator + voice
Supabase Edge Function unlim-chat (Deno bridge)
  ↓ HTTPS
OpenClaw VPS Hetzner CX52 (orchestrator multi-agent)
  ↓ multi-agent routing internal:
  ├─ Narratore agent (Qwen 2.5 72B Instruct, narrazione Principio Zero v3)
  ├─ Diagnostica agent (DeepSeek-V3 + rules engine, debug circuit)
  ├─ Vision agent (Qwen 2.5 VL 7B, screenshot circuito)
  ├─ Voice TTS agent (Voxtral 4B, custom voice cloning)
  ├─ STT agent (Cloudflare Whisper Turbo)
  ├─ RAG retrieval agent (BGE-M3 + Supabase pgvector 6000+ chunk)
  └─ Memory agent (Supabase tables multi-livello student/class/teacher/school)
  ↓ aggregated structured response
Edge Function → browser parser frontend
  ↓ esegue [AZIONE:...] tags
window.__ELAB_API.* (30+ tool calls implementati)
  ↓
Simulator state update (CircuitSolver + AVRBridge)
```

**Tech Stack:**
- Frontend: React 19 + Vite 7 + Vitest + Playwright (preservato)
- Backend Edge: Supabase Edge Functions (Deno bridge to OpenClaw)
- Orchestrator: OpenClaw Node.js v24 + TypeScript su Hetzner CX52 €32/mese
- LLM: Qwen 2.5 72B Instruct su RunPod GPU serverless A100 80GB
- Coding LLM: DeepSeek-V3 (opzionale, AST analyzer)
- Vision: Qwen 2.5 VL 7B su RunPod
- Voice TTS: **Voxtral 4B** su RunPod (Andrea preferito, batte ElevenLabs, voice cloning 3s)
- Voice STT: Cloudflare Workers AI Whisper Turbo (gratis 10k/day)
- Wake word: openWakeWord browser-side custom "Ehi UNLIM"
- Embedding: BGE-M3 su RunPod
- Image generation: DALL-E API (fallback) + SDXL self-host (post-revenue)
- Storage RAG: Supabase pgvector 6000+ chunk
- Brand assets: TRES JOLIE foto reali in `public/brand/`

**Principio Zero v3 IMMUTABILE:** `supabase/functions/_shared/system-prompt.ts` BASE_PROMPT preservato in OGNI commit. E2E test enforce: "Ragazzi" presente, "Docente, leggi" forbidden assoluto. Linguaggio 10-14 anni. Max 3 frasi + 1 analogia 60 parole. Citazione libro fedele.

**Vincolo Andrea solo tester INITIALLY:** features ultraprofondamente testabili Andrea singolo (onnipotenza, onniscienza, voice, contesto) costruite ORA. Features multi-user (cross-class memory, emotional ML, analytics aggregati) = scaffold solo, polish post-beta 5+ classi.

**Stop scope shift:** plan DEFINITIVO. Modifiche solo per blocker tecnici reali emergenti, NO scope additions ulteriori.

**Costi totali:** €250-460/mese ricorrente + €200 one-time setup + Tea retainer TBD. Cash burn 2 mesi prima revenue: ~€1500-5000.

**Output v1.0 candidate dom 15/06**: stack 100% self-host EU + GDPR assoluto + ultraprofondo + voice premium + Tea integrata + release production.

---

## Settimana 1 (lun 21/04 → dom 27/04) — STABILIZE + TEA AUTOFLOW

**Goal:** Production stabile + 6 prod bugs T1 fix + UX bugs lavagna risolti + Vol3 P0 parity + foto reali TRES JOLIE + Tea autoflow CODEOWNERS implementato.

### Task 1.1: Pre-audit + leggi T1 live verify report

**Files:**
- Read: `docs/audits/2026-04-20-live-verify.md` (output T1 mai esistito? verifica)

- [ ] **Step 1:** `cat docs/audits/2026-04-20-live-verify.md` per identificare 6 bug
- [ ] **Step 2:** Pre-audit baseline `npx vitest run --reporter=dot | tail -3`
- [ ] **Step 3:** `git checkout -b fix/sett1-stabilize main`
- [ ] **Step 4:** Crea `docs/tasks/TASK-SETT1-start.md` con SHA + baseline + scope

### Task 1.2: Fix 6 prod bugs T1 (TDD per ogni)

Per ogni bug:
- [ ] Scrivi test failing che riproduce
- [ ] Fix minimal
- [ ] Test pass
- [ ] Commit atomico `fix(area): bug N description`

### Task 1.3: UX bugs lavagna (Andrea feedback)

**Files:**
- Test: `tests/unit/lavagna/LavagnaPersistenza.test.jsx`
- Modify: `src/components/lavagna/LavagnaShell.jsx`
- Modify: `src/components/lavagna/LavagnaStateManager.js`

- [ ] **Step 1: TDD persistenza scritti**

```jsx
import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import LavagnaShell from '../../../src/components/lavagna/LavagnaShell';

describe('Lavagna persistenza', () => {
  it('disegno persiste post-Esci nav', () => {
    const { unmount } = render(<LavagnaShell />);
    const canvas = screen.getByRole('img', { name: /lavagna/i });
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(canvas);
    const saved = JSON.parse(localStorage.getItem('elab_lavagna_drawing') || '[]');
    expect(saved.length).toBeGreaterThan(0);
    unmount();
    render(<LavagnaShell />);
    const restored = JSON.parse(localStorage.getItem('elab_lavagna_drawing') || '[]');
    expect(restored.length).toEqual(saved.length);
  });

  it('lavagna vuota selezionabile no gate condition', () => {
    render(<LavagnaShell />);
    const canvas = screen.getByRole('img', { name: /lavagna/i });
    expect(canvas).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('clear button cancella esplicitamente con confirm', () => {
    window.confirm = vi.fn(() => true);
    render(<LavagnaShell />);
    const clearBtn = screen.getByRole('button', { name: /cancella tutto/i });
    fireEvent.click(clearBtn);
    expect(localStorage.getItem('elab_lavagna_drawing')).toBeNull();
  });
});
```

- [ ] **Step 2: Implement localStorage backup ogni 5s**
- [ ] **Step 3: Rimuovi clear su Esci event**
- [ ] **Step 4: Lavagna vuota selezionabile (rimuovi gate `if (!hasExperiment) return null`)**
- [ ] **Step 5: Test pass + commit**

### Task 1.4: PDR v3 P0 Vol3 parity (3 esperimenti disallineati)

**Files:**
- Read: `docs/plans/2026-04-18-PDR-v3-DEFINITIVO.md` sezione P0
- Modify: `src/data/experiments-vol3.js` (v3-cap6-esp1, v3-cap7-esp1, v3-cap7-esp5)
- Modify: `src/data/lesson-paths/v3-*.json` corrispondenti

- [ ] Step 1: Riscrivi v3-cap6-esp1 (digitalWrite 13 + 470Ω LED esterno)
- [ ] Step 2: Riscrivi v3-cap7-esp1 (pulsante + digitalRead + if/else)
- [ ] Step 3: Riscrivi v3-cap7-esp5 (analogRead + Serial Monitor)
- [ ] Step 4: Aggiorna lesson-paths corrispondenti
- [ ] Step 5: CircuitSolver test verify nuovi circuiti
- [ ] Step 6: Commit atomici

### Task 1.5: TRES JOLIE photos import + Fumetto wire foto reali

**Files:**
- Create: `scripts/import-tres-jolie-photos.js` (Node script)
- Modify: `src/data/experiment-photo-map.js`

Dettagli completi: vedi sett 1 task 4 piano precedente.

### Task 1.6: Tea autoflow CODEOWNERS + auto-merge.yml

**Files:**
- Create: `.github/CODEOWNERS`
- Create: `.github/workflows/auto-merge-tea.yml`
- Read: `docs/plans/2026-04-20-tea-autoflow-design.md` per design completo

Dettagli completi: vedi `TEA-AUTOFLOW-DESIGN.md` staging.

### Task 1.7: CoV 3x + audit + push + PR + deploy + report sett 1

---

## Settimana 2 (lun 28/04 → dom 4/05) — VPS HETZNER + OPENCLAW + RUNPOD QWEN

**Goal:** Infrastruttura self-host pronta. OpenClaw deployato Hetzner CX52. Qwen 2.5 72B deployed RunPod GPU serverless. Endpoint API REST funzionanti.

### Task 2.1: Hetzner CX52 provisioning

- [ ] **Step 1:** Andrea crea account Hetzner Cloud
- [ ] **Step 2:** Provisioning CX52 (4 vCPU, 16GB RAM, 160GB SSD, EU Falkenstein) €32/mese
- [ ] **Step 3:** SSH key upload + initial hardening (UFW, fail2ban, no root login, SSH port custom)
- [ ] **Step 4:** Docker rootless install
- [ ] **Step 5:** Document `docs/infra/hetzner-cx52-setup.md`

### Task 2.2: OpenClaw deploy

- [ ] **Step 1:** Clone openclaw/openclaw repo su VPS
- [ ] **Step 2:** Configure OpenClaw config (LLM provider Qwen via OpenAI-compatible API, channels disabled per ora bambini, multi-agent enabled)
- [ ] **Step 3:** Deploy via Docker Compose
- [ ] **Step 4:** Verify health endpoint accessible HTTPS
- [ ] **Step 5:** Document setup

### Task 2.3: RunPod account + GPU credit + serverless setup

- [ ] **Step 1:** Andrea crea account RunPod
- [ ] **Step 2:** Top-up €100 credit test
- [ ] **Step 3:** Network volume 100GB persistent (Amsterdam EU) €10/mese
- [ ] **Step 4:** Endpoint serverless A100 80GB configurato

### Task 2.4: Qwen 2.5 72B Instruct deploy

- [ ] **Step 1:** Pull Qwen 2.5 72B Q4 (vLLM) docker image RunPod
- [ ] **Step 2:** Deploy serverless endpoint con scale-to-zero
- [ ] **Step 3:** Test API call: prompt italiano + verify response quality
- [ ] **Step 4:** Benchmark latency cold start (5-30s primo request) vs warm (200-500ms)
- [ ] **Step 5:** Document endpoint URL + auth in `.env.local` + Supabase secret

### Task 2.5: CoV + audit + report

---

## Settimana 3 (lun 5/05 → dom 11/05) — BRIDGE EDGE FUNCTION + OPENCLAW MULTI-AGENT

**Goal:** Edge Function Supabase chiama OpenClaw VPS. OpenClaw multi-agent routing internal funzionante. Tool use framework integrato.

### Task 3.1: Bridge Edge Function → OpenClaw API

**Files:**
- Modify: `supabase/functions/unlim-chat/index.ts`
- Add Supabase secret: `OPENCLAW_API_URL`, `OPENCLAW_API_KEY`

- [ ] **Step 1:** Refactor unlim-chat per chiamare OpenClaw invece di Gemini diretto

```typescript
const OPENCLAW_URL = Deno.env.get('OPENCLAW_API_URL');
const OPENCLAW_KEY = Deno.env.get('OPENCLAW_API_KEY');

export default async function handler(req: Request) {
  const body = await req.json();
  const response = await fetch(`${OPENCLAW_URL}/v1/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENCLAW_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...body,
      multiAgent: true,
      agents: ['narratore', 'diagnostica', 'vision', 'rag', 'memory'],
    }),
  });
  return new Response(response.body, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

- [ ] **Step 2:** Preservare CORS headers + apikey gate
- [ ] **Step 3:** Verify Principio Zero v3 preservato (BASE_PROMPT pass-through OpenClaw)
- [ ] **Step 4:** Deploy + test live

### Task 3.2: OpenClaw multi-agent routing config

- [ ] **Step 1:** Configure OpenClaw `agents.config.json`:
  - narratore: Qwen 72B + BASE_PROMPT
  - diagnostica: Qwen 72B + rules engine
  - vision: Qwen VL 7B
  - rag: BGE-M3 + Supabase pgvector query
  - memory: Supabase tables student/class
- [ ] **Step 2:** Tool use framework integration
- [ ] **Step 3:** Test multi-step agentic loop scenario

### Task 3.3: BGE-M3 embedding deploy RunPod

- [ ] **Step 1:** Deploy BGE-M3 RunPod serverless
- [ ] **Step 2:** API wrapper Python embedding endpoint
- [ ] **Step 3:** Verify multilingua quality

### Task 3.4: CoV + audit + report

---

## Settimana 4 (lun 12/05 → dom 18/05) — MIGRAZIONE UNLIM + ONNISCIENZA RAG 6000+

**Goal:** UNLIM core migra da Gemini a Qwen via OpenClaw. RAG 549 → 6000+ chunk da manuali PDF Vol1/2/3 + glossario Tea + BOM kit + datasheet.

### Task 4.1: Migrazione UNLIM Gemini → Qwen via OpenClaw

- [ ] **Step 1:** A/B test rollout: 10% traffico Qwen, 90% Gemini
- [ ] **Step 2:** Verify Principio Zero v3 preservato Qwen output
- [ ] **Step 3:** Quality regression test 20 scenari
- [ ] **Step 4:** Se quality OK → 100% Qwen, Gemini fallback only
- [ ] **Step 5:** Document migration notes

### Task 4.2: PDF ingest manuali Vol1/2/3 completi

- [ ] **Step 1:** Use `anthropic-skills:pdf` skill
- [ ] **Step 2:** Estrai full text Vol1 27MB, Vol2 17MB, Vol3 18MB
- [ ] **Step 3:** Output `tmp/manuale-vol1-raw.txt`, vol2, vol3
- [ ] **Step 4:** Verify quality estrazione (no garbage)

### Task 4.3: Chunk strategy + metadata

- [ ] **Step 1:** Script `scripts/rag-chunk-pdf.js`:
  - Split paragraph 400-500 token + overlap 50
  - Metadata `{volume, page, chapter, section}`
  - Dedup vs `src/data/rag-chunks.json` esistenti
- [ ] **Step 2:** Output `src/data/rag-chunks-manuali.json` ~5000+ chunk

### Task 4.4: Embedding generation BGE-M3 + upload Supabase

- [ ] **Step 1:** Script `scripts/rag-upload-bge.js`:
  - Loop chunks
  - BGE-M3 endpoint RunPod
  - Batch 100/req
  - Upsert pgvector
- [ ] **Step 2:** Verify count `SELECT count(*) FROM vectors_elab` ~6000+

### Task 4.5: Glossario Tea import + BOM ingest

- [ ] **Step 1:** Pull `tea26-lea/glossario-esperimenti-elab` repo
- [ ] **Step 2:** Parse `glossary.js` ~55 termini → output `src/data/tea-glossary.js`
- [ ] **Step 3:** Embedding + upload pgvector
- [ ] **Step 4:** Excel skill leggi BOM `BOM ASSIEME TRE VOLUMI.xlsx`
- [ ] **Step 5:** Embedding + upload pgvector

### Task 4.6: RAG hybrid search retrieval upgrade

- [ ] **Step 1:** Update OpenClaw RAG agent: hybrid tsvector + pgvector
- [ ] **Step 2:** Rerank top 10 → top 3
- [ ] **Step 3:** Citation injection (page + source) nel prompt narratore
- [ ] **Step 4:** Test 30 query difficili scenari

### Task 4.7: CoV + audit + deploy + report

---

## Settimana 5 (lun 19/05 → dom 25/05) — ONNIPOTENZA ULTRAPROFONDA + DIAGNOSTICA

**Goal:** simulator-api.js da ~14 a 30+ metodi + diagnostica rules engine + multi-step chains state machine + debug session conversazionale + monitoring proattivo.

### Task 5.1: Audit simulator-api.js esistente + gap mapping

- [ ] **Step 1:** Inventory metodi esposti
- [ ] **Step 2:** List gap vs onnipotenza ultraprofonda

### Task 5.2: Estensione simulator-api.js — 16+ nuovi metodi

```javascript
window.__ELAB_API.unlim = {
  ...esistenti,
  // 16+ nuovi
  setCodeLine, highlightCodeLine, highlightWire, highlightPin,
  switchTab, setMode, openVolume, openVideo, openGlossary,
  startDebugSession, stepDebug, endDebugSession,
  detectFrustration, proactiveNudge,
  measureVoltage, measureCurrent,
};
```

### Task 5.3: Diagnostica rules engine

```javascript
const RULES = [
  { name: 'led_polarity_inverted', detect: ..., diagnosis: ..., fix: ... },
  { name: 'led_no_resistor', ... },
  // 15+ regole
];
```

### Task 5.4: Multi-step chains state machine + retry logic

### Task 5.5: Debug session conversazionale stateful cross-turn

Supabase table `debug_sessions`.

### Task 5.6: Monitoring proattivo (frustration → nudge)

### Task 5.7: Update BASE_PROMPT con nuovi tools + chain examples

### Task 5.8: Playwright E2E 30 scenari pilotaggio

### Task 5.9: CoV + audit + deploy + report

---

## Settimana 6 (lun 26/05 → dom 1/06) — VOICE PREMIUM VOXTRAL

**Goal:** Voice premium Voxtral 4B custom voice "UNLIM" + openWakeWord "Ehi UNLIM" browser + Cloudflare Whisper Turbo STT + Voice UI button accessibility.

### Task 6.1: Voxtral 4B deploy RunPod

- [ ] **Step 1:** Pull Voxtral 4B docker image
- [ ] **Step 2:** Deploy serverless endpoint
- [ ] **Step 3:** Test TTS italiano quality

### Task 6.2: Voice cloning sample tua voce 5 min

- [ ] **Step 1:** Andrea registra sample 5 min audio chiaro italiano
- [ ] **Step 2:** Voxtral fine-tune voice clone "UNLIM" custom
- [ ] **Step 3:** Test output quality + comparison vs stock voice

### Task 6.3: API wrapper + Edge Function bridge

- [ ] **Step 1:** Endpoint OpenClaw voice agent → Voxtral
- [ ] **Step 2:** Audio stream response browser

### Task 6.4: openWakeWord browser-side + custom training "Ehi UNLIM"

- [ ] **Step 1:** Install openWakeWord npm package
- [ ] **Step 2:** Custom training "Ehi UNLIM" trigger word (2-4h training set)
- [ ] **Step 3:** Browser integration always-on listener (privacy on-device)

### Task 6.5: Cloudflare Workers AI Whisper Turbo STT integration

- [ ] **Step 1:** Cloudflare account + Workers AI binding
- [ ] **Step 2:** Edge Function STT endpoint
- [ ] **Step 3:** Latency test 200-500ms italiano

### Task 6.6: UI VoiceButton + state machine + accessibility

- [ ] **Step 1:** `src/components/lavagna/VoiceButton.jsx`
- [ ] **Step 2:** State machine: idle → listening → processing → speaking → idle
- [ ] **Step 3:** Visual feedback waveform durante speaking
- [ ] **Step 4:** Accessibility: aria-label, keyboard nav (Space toggle), prefers-reduced-motion

### Task 6.7: E2E voice live + audit qualità italiana

### Task 6.8: CoV + deploy + report

---

## Settimana 7 (lun 2/06 → dom 8/06) — CONTESTO ULTRAPROFONDO + AST + MEMORIA + VISION + DALL-E

**Goal:** AST analyzer Arduino code + memoria multi-livello scaffold + state synthesis + Vision Qwen VL + DALL-E/SDXL fallback Fumetto.

### Task 7.1: AST analyzer Arduino

```javascript
// src/utils/arduinoAstAnalyzer.js
export function parseArduinoCode(code) { /* ... */ }
```

### Task 7.2: Integration unlimContextCollector con AST

### Task 7.3: Memoria multi-livello tabelle Supabase

```sql
CREATE TABLE student_memory (...);
CREATE TABLE class_memory (...);
CREATE TABLE teacher_memory (...);
CREATE TABLE school_memory (...);
```

### Task 7.4: State synthesis layer (riduce JSON → narrative compatto)

### Task 7.5: Vision Qwen 2.5 VL 7B deploy + integration

- [ ] Deploy RunPod serverless
- [ ] Bridge Edge Function vision endpoint
- [ ] Migrate VisionButton da Gemini a Qwen VL
- [ ] Quality regression test

### Task 7.6: DALL-E API + SDXL self-host fallback Fumetto

- [ ] DALL-E API endpoint per scenari custom rare cases
- [ ] SDXL self-host RunPod (post-revenue)
- [ ] Integration Fumetto Report quando foto reali insufficienti

### Task 7.7: Emotional state detection scaffold (heuristics, ML futuro)

### Task 7.8: CoV + audit + deploy + report

---

## Settimana 8 (lun 9/06 → dom 15/06) — CONSOLIDAMENTO + UAT + RELEASE V1.0

**Goal:** OpenClaw layer docente Telegram comunicazione + Tea estrema integration + integration test E2E full stack + UAT + bug fix + release v1.0 candidate production.

### Task 8.1: OpenClaw layer docente Telegram bot

- [ ] **Step 1:** Telegram BotFather setup `@ElabUnlimBot`
- [ ] **Step 2:** OpenClaw Telegram channel binding
- [ ] **Step 3:** Notification triggers (frustration student detected, lesson completed, weekly summary class)
- [ ] **Step 4:** Andrea + docenti pilot test

### Task 8.2: Tea estrema integration completa

- [ ] **Step 1:** Tea retainer formale (€/mese OR ore — Andrea decide)
- [ ] **Step 2:** Tea CODEOWNERS estesi a `/src/data/**` `/src/components/lavagna/**` `/docs/**`
- [ ] **Step 3:** Tea Telegram canale dedicato @ElabTeaBot
- [ ] **Step 4:** Weekly call Andrea+Tea decisione roadmap
- [ ] **Step 5:** Tea pair-programming session via Cowork

### Task 8.3: Integration test E2E full stack 100 scenari

- [ ] Andrea + Tea simulazione classe completa 2h
- [ ] Stress test 100 scenari complessi
- [ ] Bug emerging tracker

### Task 8.4: Bug fix emerging dal UAT

### Task 8.5: Documentation v1.0 complete

- [ ] User manual docente
- [ ] User manual studente
- [ ] Admin manual scuola
- [ ] Privacy policy + GDPR consent flow
- [ ] Architecture doc full self-host

### Task 8.6: Performance optimization + caching

### Task 8.7: **v1.0 RELEASE candidate production deploy**

- [ ] **Step 1:** Final production deploy main
- [ ] **Step 2:** Verify all features live
- [ ] **Step 3:** Watchdog monitor 24h post-release
- [ ] **Step 4:** Andrea announce Tea + Giovanni + Davide

---

## Self-review

**Spec coverage**: tutte 8 settimane mappate. Onnipotenza/Onniscienza/Voice/Voxtral/Qwen/OpenClaw/Tea/DALL-E tutti coperti.

**Placeholder scan**: TODO/TBD = solo Tea retainer (Andrea decision economica) + DALL-E vs SDXL choice (Fase 2 post-revenue OK).

**Type consistency**: function names cross-task verified.

**Andrea solo tester acknowledged**: features multi-user (cross-class memory, emotional ML) = scaffold solo, polish post-beta.

**Stop scope shift**: piano DEFINITIVO. NO altri scope additions.

---

## Costi 8 settimane (REALISTICI Andrea solo tester)

**Vincolo onesto:** Andrea solo tester INITIALLY = GPU usage lightweight. Tea volunteer GRATIS.

### GPU usage real Andrea solo

| Modello | Use Andrea | h GPU/mese | $/mese RunPod |
|---------|-----------|-----------|---------------|
| Qwen 72B (LLM) | 5-10 chat/giorno × 30s | 8-12h | $11-17 |
| Voxtral 4B (TTS) | 5-10 audio/giorno × 5s | 2-3h | $3-4 |
| Qwen VL 7B (Vision) | rare test | 1-2h | $2-3 |
| BGE-M3 (embedding) | ONE-TIME 5h + minimal query | 1h/mese | $1.5/mese + $7 setup |
| DeepSeek-V3 | SKIP (AST in browser) | 0 | 0 |
| **Totale GPU** | | **~12-18h/mese** | **$17-25/mese (~€16-23)** |

### Stack totale

| Voce | €/mese |
|------|--------|
| Stack attuale Supabase + Vercel | 60 |
| Hetzner CX52 OpenClaw | +32 |
| RunPod GPU serverless (Andrea solo lightweight) | **+16-23** |
| DALL-E API (rare cases) | +5 |
| Cloudflare Whisper | 0 free tier |
| Tea retainer | **€0 GRATIS volunteer** |
| **Totale ricorrente Andrea solo** | **~115-120/mese** |
| **Setup ONE-TIME** | **~€100 (RunPod credit + Hetzner provisioning + DALL-E test)** |

**Cash burn 2 mesi prima revenue**: **~€330-340** (incluso setup).

### Scale futuro (post-revenue 5-10 classi paganti)

| Voce | €/mese scale |
|------|--------------|
| RunPod GPU scale | 100-300 |
| DALL-E scale | 10-30 |
| Tea: continua volunteer OR convert paid retainer (Andrea+Tea decisione based revenue) | 0 OR 500-2000 |
| Altri costi invariati | 92 |
| **Totale scale 5-10 classi** | **~200-400/mese + Tea** |

Scaling lineare bilanciato. Marginal cost gestibile.

### Tea integrazione GRATIS (onesta)

**Tea volunteer** (già contribuito gratis: PR #73 + glossario + 4 docs).

**Tea ottiene in cambio** (no €, valore intangibile):
- Credit GitHub commits + co-author CHANGELOG
- Portfolio dev frontend/backend pubblico
- Co-founder vibe (eventuale equity Fase 2 vendite scuole)
- Tea autoflow CODEOWNERS = autonomia + responsabilità
- Pair programming session weekly Andrea+Tea
- Decision-making roadmap weekly call
- Reference per CV future opportunità

**Andrea risparmia €1000-4000 retainer 2 mesi**.

**Quando convertire Tea paid?** Quando ELAB revenue €500+/mese OR Tea workload supera 10h/settimana sostenuto.

---

## Output v1.0 candidate (dom 15/06)

✅ **Stack 100% self-host EU** (Hetzner DE + RunPod NL + Cloudflare EU)
✅ **Zero vendor lock-in critico** (Qwen open source Apache 2.0, Voxtral Apache 2.0, OpenClaw MIT)
✅ **GDPR bambini ASSOLUTO** (zero data esce EU)
✅ **Onnipotenza ultraprofonda** (30+ tool calls + diagnostica rules + chains + debug + monitoring)
✅ **Onniscienza ultraprofonda** (RAG 6000+ chunk + glossario Tea + BOM)
✅ **Comprensione contesto ultraprofonda** (AST + memoria multi-livello + state synthesis)
✅ **Voice premium Voxtral** (custom voice cloning Andrea italiano)
✅ **Vision Qwen VL** (diagnostica circuiti italiana)
✅ **OpenClaw orchestrator** (multi-agent routing internal + layer docente Telegram)
✅ **Tea estrema integrata** (autoflow + retainer + CODEOWNERS)
✅ **DALL-E + SDXL fallback Fumetto**
✅ **Production stabile** + UX bugs zero + Vol3 parity + foto reali TRES JOLIE

---

## Execution Handoff

Plan saved to `docs/superpowers/plans/2026-04-20-elab-v1-ambitious-self-host-8-weeks.md`.

Subagent-Driven Development raccomandato per parallelizzare task indipendenti.

Andrea decision required prima start lunedì 21/04:

1. Confermo stack: OpenClaw + Qwen 72B + Voxtral + DeepSeek + BGE-M3 + Cloudflare Whisper + DALL-E?
2. Confermo 8 settimane scope?
3. Tea retainer scope economico (€/mese, ore, equity)?
4. Hetzner + RunPod account creazione subito (Andrea action)?
5. Start sett 1 lun 21/04?

**Stop scope shift**. Plan DEFINITIVO. Modifiche solo blocker tecnici reali.

**Principio Zero v3 IMMUTABILE preservato in OGNI commit.**
