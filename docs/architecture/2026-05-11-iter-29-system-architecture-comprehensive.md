# ELAB Tutor — Comprehensive System Architecture
## Iter 24-28 Cumulative Reference

**Document version**: iter-29 Agent D  
**Date**: 2026-05-11  
**Status**: Reference — READ-ONLY derivation from codebase scan  
**Author**: Claude Code Agent D (architecture documenter)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Frontend Stack](#frontend-stack)
4. [Backend Stack — Supabase Edge Functions](#backend-stack)
5. [AI Providers and Routing](#ai-providers-and-routing)
6. [Voice Stack](#voice-stack)
7. [Database Schema and Migrations](#database-schema-and-migrations)
8. [Edge Function API Surface](#edge-function-api-surface)
9. [Sprint History Compact](#sprint-history-compact)
10. [Architecture Decision Records Summary (ADR-003 to ADR-031)](#architecture-decision-records)
11. [Deployment Architecture](#deployment-architecture)
12. [Security Model](#security-model)
13. [Performance Characteristics](#performance-characteristics)
14. [Known Gaps and Open Items](#known-gaps-and-open-items)

---

## 1. Executive Summary

ELAB Tutor is an electronics and Arduino teaching platform for children 8-14 years old, built around three physical workbooks (Vol 1-3), Omaric hardware kits, and a web application. The software is designed according to two invariant principles:

**Principio Zero**: The teacher is the mediator. UNLIM prepares didactic content in the language of the physical volumes; students work on the physical kit; the teacher projects everything on the interactive whiteboard (LIM). UNLIM never speaks directly to students.

**Morfismo**: The platform adapts its form and behavior per-class, per-teacher, per-kit, per-level at runtime (Sense 1 technical morphism) while remaining visually and linguistically coherent with the physical kit and printed volumes (Sense 2 strategic triplet coherence — software + kit + volumes are "one product").

The production stack as of iter 28 delivers:

- React 19 frontend served via Vercel CDN
- 10+ Supabase Edge Functions (Deno runtime) on project `euqpdueopmlllqjmqnyb`
- PostgreSQL 15 with pgvector (1881 RAG chunks ingested iter 7)
- LLM routing: Mistral La Plateforme 70% / Gemini 2.5 25% / Together AI 5% (gated)
- TTS: Voxtral mini-tts-2603 primary (voice clone Andrea IT) + Edge TTS Isabella fallback
- STT: Cloudflare Workers AI Whisper Large v3 Turbo
- Vision: Gemini 2.5 Flash primary + Mistral Pixtral 12B fallback
- Image generation: Cloudflare Workers AI FLUX.1 Schnell
- Benchmark score iter 28 close: 7.5/10 (G45 anti-inflation cap)

---

## 2. System Overview

```
                     +-----------------------------+
                     |    Teacher (docente)        |
                     |    LIM / Browser            |
                     +-------------+---------------+
                                   |
                     +-------------v---------------+
                     |   Vercel CDN (EU edge)      |
                     |   www.elabtutor.school      |
                     |   React 19 + Vite 7 SPA     |
                     +-------------+---------------+
                                   |
           +-----------------------+-----------------------+
           |                       |                       |
+----------v---------+  +----------v---------+  +---------v----------+
|  Supabase Postgres |  |  Supabase Edge Fns |  |  Cloudflare AI     |
|  euqpdueopmlllqjm  |  |  Deno runtime      |  |  (Whisper + FLUX)  |
|  15 tables + pgvec |  |  10+ functions     |  |  EU Workers        |
+--------------------+  +----------+---------+  +--------------------+
                                   |
               +-------------------+--------------------+
               |                   |                    |
  +------------v------+ +----------v-------+ +----------v-------+
  |  Mistral           | |  Gemini 2.5      | |  Together AI     |
  |  La Plateforme FR  | |  Frankfurt EU    | |  US (gated)      |
  |  LLM + Vision      | |  Flash/Pro       | |  emergency only  |
  |  + Voxtral TTS     | |  fallback LLM    | |                  |
  +--------------------+ +------------------+ +------------------+
```

All AI processing for student-facing chat uses EU-region providers (Mistral FR + Gemini Frankfurt) for GDPR Art. 8 compliance with minors under 16. Together AI is gated and blocked for student runtime traffic.

---

## 3. Frontend Stack

### 3.1 Technology Foundation

```
React 19 (concurrent mode)
Vite 7 (build + HMR + chunk splitting)
vite-plugin-pwa (PWA + service worker, registerType: 'prompt')
CSS Modules (preferred) + legacy inline styles
Vitest (unit + integration tests, baseline 13338 PASS iter 37)
```

Source entry: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/App.jsx`

### 3.2 Routing Architecture

ELAB Tutor does NOT use react-router. Routing is implemented as custom `useState` hash-based navigation:

```
#home         -> HomePage
#lavagna      -> LavagnaShell (main teaching workspace)
#prova        -> ElabTutorV4 (legacy simulator shell)
#glossario    -> Glossario (Tea 180-term glossary)
#chatbot-only -> ChatbotOnly (standalone UNLIM chat)
#admin        -> AdminPage (password: ELAB2026-Andrea!)
#dashboard    -> DashboardShell (teacher progress dashboard)
#login        -> LoginPage
#register     -> RegisterPage
#privacy      -> PrivacyPolicy
#landing      -> LandingPNRR (school landing page)
```

Source: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/App.jsx`

### 3.3 Four Lavagna Modes (ADR-025, iter 26)

The central teaching workspace (`LavagnaShell`) operates in four canonical modes:

| Mode | Behavior | Source component |
|------|----------|-----------------|
| Percorso | Default. Lesson-path driven, chapter sequential | `PercorsoPanel.jsx` + `PercorsoCapitoloView.jsx` |
| Passo Passo | Step-by-step guided build (LessonReader overlay) | `LessonReader.jsx` inside `FloatingWindow` |
| Gia Montato | "Already assembled" — student shows pre-built circuit | `GiaMontato.jsx` |
| Libero | Free exploration — auto-reverts to Percorso on idle | `LavagnaShell.jsx` state management |

Mode state persists in localStorage (migration cleans legacy keys like `'guida-da-errore'`). The `ModalitaSwitch` component renders the 4-mode selector.

Source: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/components/lavagna/LavagnaShell.jsx`  
Source: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/components/lavagna/ModalitaSwitch.jsx`

### 3.4 Simulator Engine

The circuit simulator is the most complex frontend subsystem, composed of:

```
SimulatorCanvas.jsx (3149 lines)
  SVG canvas, zoom/pan/drag, renders 21 component types
  BB_HOLE_PITCH = 7.5px, SNAP_THRESHOLD = 4.5px

CircuitSolver.js (2486 lines)
  DC MNA/KCL solver, Gaussian elimination
  Computes real voltages/currents for each node

AVRBridge.js (1242 lines)
  avr8js ATmega328p emulation
  GPIO/ADC/PWM/USART bridge
  Pin map: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC

PlacementEngine.js (822 lines)
  Automatic component placement algorithm

NewElabSimulator.jsx (1022 lines)
  Shell: orchestrates panels, manages simulator state
  Exposes __ELAB_API via simulator-api.js
```

Critical file paths:
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/components/simulator/engine/CircuitSolver.js`
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/components/simulator/engine/AVRBridge.js`
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/components/simulator/canvas/SimulatorCanvas.jsx`

### 3.5 Experiment Catalog

94 experiments across 3 volumes, grouped into 27 lessons:

```
Volume 1: 38 experiments  (v1-cap6-esp1 ... v1-capN-espM)
Volume 2: 27 experiments  (v2-...)
Volume 3: 29 experiments  (v3-...)
  - v3-cap7-mini (iter 36 +)
  - v3-cap8-serial (iter 37 +)
```

Lesson structure: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data/lesson-groups.js` (250 lines)  
Volume references: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data/volume-references.js` (94/94 enriched, ~1280 lines)

### 3.6 Global Simulator API (`__ELAB_API`)

Registered on `window` when the simulator mounts. Used by UNLIM (via `intentsDispatcher.js`) to execute circuit operations:

```javascript
window.__ELAB_API
  .unlim.highlightComponent(['led1', 'r1'])
  .unlim.highlightPin(['nano:D13'])
  .unlim.clearHighlights()
  .unlim.serialWrite('Hello')
  .unlim.getCircuitState()
  .on('experimentChange', callback)
  .on('stateChange', callback)
  .on('serialOutput', callback)
  .on('componentInteract', callback)
  .on('circuitChange', callback)
  .toggleDrawing(true/false)
  .setComponentValue(id, param, value)
  .connectWire(from, to)
  .clearCircuit()
  .mountExperiment(id)
  .getCircuitDescription()
  .captureScreenshot()
```

Source: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/services/simulator-api.js` (755 lines)

### 3.7 UNLIM Frontend Integration

The UNLIM chat panel is managed by `useGalileoChat.js` (legacy filename, content is UNLIM):

```
useGalileoChat.js (src/components/lavagna/)
  - Manages message state + send flow
  - Calls sendChat() from api.js
  - Collects full simulator context via collectFullContext()
  - Dispatches intents_parsed via executeServerIntents()
  - Handles [AZIONE:...] Italian action tags (whitelist 12 actions)
```

Intent dispatch whitelist (iter 37, `intentsDispatcher.js`):
```
play, pause, reset, highlight, loadexp, addcomponent, removecomponent,
addwire, compile, undo, redo, clearall, interact, setvalue,
screenshot, describe, video
```
Destructive operations (deleteAll, submitForm, fetchExternalUrl) are blocked.

Source: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/components/lavagna/useGalileoChat.js`  
Source: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/components/lavagna/intentsDispatcher.js`

### 3.8 PWA Configuration

```
vite-plugin-pwa
registerType: 'prompt'   (user sees toast before service worker activates)
33 precache entries
Bundle size ~4000KB
UpdatePrompt.jsx: controllerchange listener + "Ragazzi, c'è una nuova versione…" toast
```

---

## 4. Backend Stack — Supabase Edge Functions

### 4.1 Infrastructure

```
Project ref: euqpdueopmlllqjmqnyb
Runtime: Deno 1.x (each function is an isolated V8 isolate)
Database: PostgreSQL 15 + pgvector + pg_trgm + pg_cron
Region: eu-west-1 (Ireland)
```

All functions are deployed via:
```bash
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy --project-ref euqpdueopmlllqjmqnyb
```

### 4.2 Shared Module Inventory (`_shared/`)

| File | Purpose |
|------|---------|
| `types.ts` | TypeScript interfaces for all request/response shapes |
| `guards.ts` | Input validation, CORS, rate limiting, auth checks |
| `llm-client.ts` | Unified LLM caller: weighted picker + callWithRetry |
| `mistral-client.ts` | Mistral La Plateforme chat + structured output |
| `gemini.ts` | Gemini 2.5 Flash/Pro/Flash-Lite client |
| `together-fallback.ts` | Together AI gated fallback (student runtime blocked) |
| `rag.ts` | hybridRetrieve: BM25+dense+RRF, synonym expansion |
| `memory.ts` | loadStudentContext, saveInteraction, saveMessageHistory |
| `system-prompt.ts` | BASE_PROMPT v3.1 + buildSystemPrompt() |
| `capitoli-loader.ts` | 37-chapter JSON lookup, buildCapitoloPromptFragment() |
| `volumi-citazioni.ts` | forceCitationFromQuery/Session, rewriteCitationToCanonical |
| `principio-zero-validator.ts` | 12-rule runtime Principio Zero enforcement |
| `onniscenza-classifier.ts` | Pre-LLM 6-category classifier (chit_chat/deep/safety/...) |
| `onniscenza-bridge.ts` | 7-layer aggregator (RAG+Wiki+Glossario+Sessione+Vision+LLM+Analogia) |
| `clawbot-templates.ts` | 20 L2 morphic templates (inlined, Deno-compatible) |
| `clawbot-template-router.ts` | selectTemplate() + executeTemplate() pre-LLM short-circuit |
| `clawbot-dispatcher-deno.ts` | L1 composite handler (57 ToolSpec registry) |
| `intent-parser.ts` | parseIntentTags(): `[INTENT:{...}]` non-greedy regex (iter 36) |
| `intent-tools-schema.ts` | INTENT_TOOLS_SCHEMA for Mistral structured output (iter 38) |
| `content-safety-guard.ts` | 10 runtime safety rules post-LLM (iter 19 P0) |
| `safety-hardcoded-fallback.ts` | Catch-all hardcoded 220V safety response (iter 27) |
| `operational-response.ts` | buildDirectOperationalResponse: Arduino/Scratch templates |
| `offtopic-template-response.ts` | buildOfftopicGentleBridge: gentle redirect templates |
| `voxtral-client.ts` | Mistral Voxtral mini-tts-2603, synthesizeVoxtral() |
| `edge-tts-client.ts` | Microsoft Edge TTS Isabella Neural fallback |
| `cloudflare-client.ts` | CF Workers AI: Whisper STT (3-shape handler) + FLUX imagegen |
| `gemini-vision.ts` | Gemini vision analysis |
| `router.ts` | routeModel(): experiment-context-aware model selection |
| `state-snapshot-aggregator.ts` | Parallel orchestrator for circuit+Wiki+RAG+memoria+vision |
| `unlim-ai-profiles.ts` | selectUnlimAiProfile(): depth 'total'/'compact' per context |

---

## 5. AI Providers and Routing

### 5.1 LLM Provider Chain

Routing is handled by `callLLM()` in `_shared/llm-client.ts` using a weighted random picker:

```
LLM_ROUTING_WEIGHTS env var (ADR-029, iter 37):
  Mistral La Plateforme: 70%   (mistral-small-latest, EU France, primary)
  Gemini 2.5:            25%   (Flash-Lite default / Flash for depth:total)
  Together AI:            5%   (Llama 3.3 70B, US, gated emergency only)
```

Fallback chain when primary fails:
```
callLLM() → Mistral (retry 3x, exponential backoff, budget 4s)
          → Gemini (retry 3x)
          → callBrainFallback() → Gemini 2.5 Flash direct
          → Brain VPS (Qwen3.5 1.9B Q5_K_M, 72.60.129.50:11434) — DEPRECATED
          → getSafetyHardcodedResponse() for safety-relevant queries
```

Source: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/llm-client.ts`

### 5.2 Gemini Model Selection

Canonical models (as of iter 17 GA stabilization note in `types.ts:125`):

```typescript
type GeminiModel =
  | 'gemini-2.5-flash-lite'  // default fast path
  | 'gemini-2.5-flash'       // depth:total or complex context
  | 'gemini-2.5-pro';        // thinkingLevel:'medium', circuit topology
```

Preview 3.x models were deprecated after 503 UNAVAILABLE instability on 2026-04-17.

### 5.3 Vision Provider Chain

```
unlim-vision function (ADR iter 35):
  PRIMARY: Gemini 2.5 Flash EU Frankfurt (~600ms p50)
  FALLBACK: Mistral Pixtral 12B FR EU (~1300ms p50)

Header: X-Vision-Provider: gemini-2.5-flash | pixtral-12b
```

Source: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/unlim-vision/index.ts`

### 5.4 Together AI Gating

Together AI (US provider) is gated to prevent student data reaching US servers:

```typescript
// together-fallback.ts
canUseTogether(context: TogetherContext): boolean
  // Blocks: student runtime, no explicit teacher_mode flag
  // Allows: batch ingest, teacher context with consent
  // Audit: every call logged to together_audit_log table
```

Gate outcomes logged: `blocked_env_disabled` | `blocked_gate_student_runtime` | `ok` | `error_<code>`

Source: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/together-fallback.ts`

### 5.5 Brain VPS (DEPRECATED in critical path)

```
URL: http://72.60.129.50:11434
Model: galileo-brain-v13 (Qwen3.5 1.9B Q5_K_M)
Status: ALIVE but deprecated (verify 2026-04-26 — 12s inference)
Role: Last-resort fallback, NOT in student critical path
```

### 5.6 Cloudflare Workers AI

Separate from the Supabase Edge Function chain:

```
STT:  @cf/openai/whisper-large-v3-turbo (3-shape binary input handler iter 37)
IMG:  @cf/black-forest-labs/flux-1-schnell (10k req/day free tier)
Acct: 31b0f72e... (hardcoded in cloudflare-client.ts)
```

---

## 6. Voice Stack

### 6.1 TTS Chain (iter 29-31 primary)

```
PRIMARY: Mistral Voxtral mini-tts-2603 (EU France, GDPR-clean)
  voice_id: 9234f1b6-766a-485f-acc4-e2cf6dc42327  (voice clone Andrea IT)
  latency: ~1181ms p50 for short Italian phrases
  file: supabase/functions/_shared/voxtral-client.ts (260 lines)

FALLBACK 1: Microsoft Edge TTS Isabella Neural (it-IT-IsabellaNeural)
  protocol: WebSocket Sec-MS-GEC handshake (Deno port of rany2/edge-tts Python)
  file: supabase/functions/_shared/edge-tts-client.ts (162 lines)
  status: WSS NetworkError in prod (masked by Voxtral primary)

FALLBACK 2: Cloudflare Workers AI MeloTTS
  file: cloudflare-client.ts cfMeloTtsSynthesize()
  status: experimental

FALLBACK 3: VPS TTS server
  url: http://72.60.129.50:8880/tts (DOWN since 2026-04-26 verify)
```

TTS audio is decoupled from text response (iter 34 P0 latency fix). The chat response returns immediately; TTS audio is fetched asynchronously via separate `/unlim-tts` call.

### 6.2 STT

```
Provider: Cloudflare Workers AI Whisper Large v3 Turbo
Endpoint: /unlim-stt
Input formats: multipart/form-data 'audio' OR JSON audio_base64 OR audio/* binary
3-shape handler: magic-byte container detection (Ogg/WebM/MP3/WAV/FLAC/MP4) + chunked base64
Italian language primary (language: 'it')
```

Source: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/unlim-stt/index.ts`  
Source: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/cloudflare-client.ts`

### 6.3 Wake Word

```
Wake word: "Ehi UNLIM"
Service: src/services/wakeWord.js (SpeechRecognition API browser-native)
Pre-emptive nudge: MicPermissionNudge.jsx (iter 38) — requests mic BEFORE entering Lavagna
Known gap: "Ragazzi," plurale prepend not yet wired (iter 37 A6 deferred)
```

---

## 7. Database Schema and Migrations

### 7.1 Core Tables (schema.sql)

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `classes` | Teacher class groups | teacher_id, class_code (6-char join), volumes[] |
| `class_students` | Student-class association | class_id, student_id, student_name (cached) |
| `student_sessions` | Per-session activity log | experiment_id, completed, messages_count, activity JSONB |
| `student_progress` | Aggregated per-student per-experiment | attempts, best_score, concepts[] |
| `mood_reports` | Emotional state tracking | mood enum, experiment_id context |
| `nudges` | Teacher-to-student messages | student_id (NULL = whole class), message (≤500 chars) |
| `lesson_contexts` | Cross-session UNLIM context | context_data JSONB {summary, concepts, mistakes} |
| `confusion_reports` | Per-concept confusion heatmap | concept_id, level 0-10 |

RLS is enabled on all tables. Teacher policies: CRUD on own classes. Student policies: read own sessions. Schema: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/schema.sql`

### 7.2 UNLIM-Specific Tables (migrations)

#### `unlim_session_memory` (migration 20260511060000)

Single-row per session, last-N state. Root cause fix iter 18.5: original schema used FK-constrained tables with RLS recursion bugs.

```sql
session_id TEXT PRIMARY KEY
last_experiment_id TEXT
last_chapter SMALLINT
last_volume SMALLINT
last_topic TEXT
last_response_preview TEXT   -- truncated ≤100 chars (GDPR)
last_model TEXT
common_mistakes JSONB DEFAULT '[]'
message_count INTEGER DEFAULT 0
created_at / updated_at TIMESTAMPTZ
```

RLS: anon RW (Edge Function uses service_role bypass, anon fallback).

#### `unlim_message_history` (migration 20260511120000)

Per-message append-only timeline. Fix iter 25 P0-A: single-row drift in `unlim_session_memory` meant UNLIM could not answer "which was the second message?" or give multi-turn summaries.

```sql
session_id TEXT NOT NULL
message_idx INTEGER NOT NULL       -- auto-incremented via SECURITY DEFINER RPC
experiment_id TEXT
chapter SMALLINT
volume SMALLINT
topic TEXT
user_msg_preview TEXT              -- truncated ≤250 chars (GDPR)
response_preview TEXT              -- truncated ≤100 chars (GDPR)
model TEXT
created_at TIMESTAMPTZ DEFAULT now()
expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')  -- 7-day TTL
PRIMARY KEY (session_id, message_idx)
```

Atomic insert via SECURITY DEFINER RPC `insert_message_history()` (SELECT MAX + 1 under lock, avoids race window iter 28 H3 fix).

TTL sweep: pg_cron job `unlim_message_history_ttl_sweep`, daily 03:17 UTC.

Source: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/migrations/20260511120000_unlim_message_history.sql`

#### `rag_chunks` (migration 20260426160000)

Hybrid RAG store. 1881 chunks ingested iter 7 (Voyage 3 1024-dim + Llama 3.3 70B contextual prepend).

```sql
id uuid PRIMARY KEY
content text NOT NULL              -- chunk text + LLM context prepend (Anthropic Contextual)
content_raw text NOT NULL          -- chunk alone (citations + display)
embedding vector(1024)             -- BGE-M3 dense
bm25_tokens tsvector               -- Italian FTS, auto-updated via trigger
source text                        -- 'vol1'|'vol2'|'vol3'|'glossary'|'wiki'|'faq'|'errori'|'analogie'|'codice'
chapter integer
page integer
section_title text
contextual_summary text            -- 50-token LLM context prepend
metadata jsonb
```

Chunk distribution: vol1 203 + vol2 292 + vol3 198 + wiki 100 concepts + glossary/faq.

#### `parental_consents` (migration 001_gdpr_compliance.sql)

GDPR Art. 8: children <16 require parental consent.

```sql
student_id UUID FK auth.users
consent_given BOOLEAN
consent_method TEXT   -- 'form_signed'|'email_confirmed'|'in_app'
parent_email TEXT     -- encrypted
gdpr_version TEXT
revoked_at TIMESTAMPTZ  -- NULL = active
```

### 7.3 Additional Migration Tables

| Migration | Table | Purpose |
|-----------|-------|---------|
| 20260426152944 | `together_audit_log` | Every Together AI call logged (gate outcome + GDPR proof student runtime never reaches US) |
| 20260426152945 | `openclaw_tool_memory` | L1 composite handler pgvector cache + GC |
| 20260427090000 | (dedup constraint) | UNIQUE constraint on rag_chunks, dedup sweep |
| 20260429120000 | `scribble_paths` | Lavagna drawingPaths cross-device sync |
| 20260430220000 | (cron job) | `unlim_chat_warmup_cron`: pg_cron HEAD ping unlim-chat every 30s (cold-start mitigation iter 38) |
| 20260505000000 | `scribble_paths.session_id` | Added session_id FK to scribble_paths |
| 20260509010000 | `student_album` | Narrative comics/fumetto album storage |
| 20260511080000 | `user_intent_seed` | user_intent_seed column on unlim_session_memory (iter 24 Phase 1 P0) |
| 20260511180000 | (RPC race fix) | insert_message_history atomic RPC v2 |

### 7.4 pg_cron Jobs

| Job name | Schedule | Command |
|----------|----------|---------|
| `unlim_message_history_ttl_sweep` | 03:17 UTC daily | `DELETE FROM unlim_message_history WHERE expires_at < now()` |
| `unlim_chat_warmup_cron` | Every 30s | HEAD ping to unlim-chat Edge Function (keep V8 isolate warm) |

---

## 8. Edge Function API Surface

### Authentication

All endpoints require:
1. Supabase `Authorization: Bearer <anon-key>` JWT
2. `X-Elab-Api-Key: <32-hex-secret>` (custom ELAB header, rotated iter 32)

The custom API key gates against scraping of the public anon JWT. Fail-open when `ELAB_API_KEY` env is unset (backward-compatible rollout).

### 8.1 `POST /functions/v1/unlim-chat`

Main conversational AI endpoint. Full data flow documented in `2026-05-11-iter-29-data-flow.md`.

**Request** (`ChatRequest` from `types.ts:6`):
```typescript
{
  message: string;                      // user input
  sessionId: string;                    // UUID format (elab_anon_uuid from localStorage)
  circuitState?: CircuitState | null;   // live simulator state snapshot
  experimentId?: string | null;         // e.g. 'v1-cap6-esp1'
  simulatorContext?: SimulatorContext | null;
  images?: ImageData[];                 // base64 for vision queries
  aiProfile?: string | null;            // 'compact' | 'total'
  aiDepth?: 'total' | 'compact' | null;
  unlimMode?: string | null;            // current Lavagna mode
  // debug extensions:
  debug_retrieval?: boolean;
  retrieval_mode?: 'hybrid' | 'dense' | 'auto';
  top_k?: number;                       // 1-20
}
```

**Response** (`ChatResponse` from `types.ts:18`):
```typescript
{
  success: boolean;
  response?: string;           // Italian text, ≤120 words, may contain [AZIONE:...] tags
  source?: string;             // 'mistral'|'gemini'|'together'|'clawbot-l2-*'|'safety-pre-llm'|...
  audio?: string;              // base64 data:audio/mpeg (non-blocking, may be absent)
  actions?: string[];          // legacy action list
  error?: string;
  dataProcessing?: string;     // GDPR transparency
  aiProfile?: string;
  // extended fields:
  intents_parsed?: Array<{ tool: string; args: Record<string, unknown> }>;
  prompt_class?: { category: string; skipOnniscenza: boolean; topK: number; wordCount: number };
  template_id?: string;        // present when clawbot-l2 path taken
  safety_fires?: string[];     // e.g. ['voltage_danger']
}
```

### 8.2 `POST /functions/v1/unlim-tts`

Text-to-speech synthesis.

**Request** (`TTSRequest` from `types.ts:56`):
```typescript
{
  text: string;
  voice?: string;      // default 'it-IT-IsabellaNeural' or Voxtral voice_id
  language?: string;   // default 'it'
  speed?: number;      // default 0.95
}
```

**Response**: `{ success: true, audio: "data:audio/mpeg;base64,..." }` or streaming audio/mpeg.

Provider chain: Voxtral primary (Mistral EU FR) → Edge TTS Isabella → CF MeloTTS.

### 8.3 `POST /functions/v1/unlim-stt`

Speech-to-text transcription.

**Request**: `multipart/form-data` with `audio` file field, OR `{ audio_base64: string, sessionId: string, language?: 'it'|'en' }`, OR raw `audio/*` binary.

**Response**: `{ success: true, text: string, language: 'it', model: '@cf/openai/whisper-large-v3-turbo' }`

### 8.4 `POST /functions/v1/unlim-vision`

Vision-language circuit analysis.

**Request**: `{ prompt: string, images: string[], sessionId: string }`

**Response**: `{ success: true, response: string, model: string, provider: 'gemini-2.5-flash'|'pixtral-12b', latencyMs: number }`

Header: `X-Vision-Provider: gemini-2.5-flash | pixtral-12b`

### 8.5 `POST /functions/v1/unlim-imagegen`

Circuit diagram / didactic image generation.

**Request**: `{ prompt: string, sessionId: string, width?: number, height?: number }`

**Response**: `{ success: true, image: "data:image/png;base64,...", model: '@cf/black-forest-labs/flux-1-schnell' }`

Provider: Cloudflare FLUX.1 Schnell (10k req/day free tier).

### 8.6 `POST /functions/v1/unlim-diagnose`

Circuit diagnosis from simulator state.

**Request** (`DiagnoseRequest` from `types.ts:29`):
```typescript
{
  circuitState: CircuitState;
  experimentId?: string | null;
  sessionId?: string;
}
```

**Response** (`DiagnoseResponse`): `{ success: true, diagnosis: string, source: string }`

### 8.7 `POST /functions/v1/unlim-hints`

Experiment-specific hints.

**Request** (`HintsRequest` from `types.ts:42`):
```typescript
{
  experimentId: string;
  currentStep?: number;
  difficulty?: 'base' | 'intermedio' | 'avanzato';
  sessionId?: string;
}
```

**Response** (`HintsResponse`): `{ success: true, hints: string, source: string }`

### 8.8 `POST /functions/v1/unlim-gdpr`

Parental consent management. Handles GDPR Art. 8 consent grant/revoke, data deletion requests.

### 8.9 `POST /functions/v1/unlim-session-description`

UNLIM-generated natural-language session names for Cronologia UI (iter 35).

**Request**: `{ sessionId: string, messages: MessageHistoryEntry[] }`

**Response**: `{ success: true, description: string }`

### 8.10 `POST /functions/v1/compile-proxy`

Arduino sketch compilation proxy (C++ → HEX).

**Target**: n8n workflow on Hostinger (`https://n8n.srv1022317.hstgr.cloud/compile`)

### 8.11 `GET/POST /functions/v1/dashboard-data`

Teacher dashboard data aggregation from `student_sessions`, `student_progress`, `class_students`.

---

## 9. Sprint History Compact

### Sprint S (iter 1-12+, April 26-28 2026)

Foundation sprint: RunPod GPU infrastructure (later terminated), 5-agent OPUS Pattern S development, RAG ingest pipeline.

**Key milestones**:
- Iter 1: RunPod pod deployed, 5/7 AI services running, UNLIM v3 prompt wire-up
- Iter 2-3: callLLMWithFallback chain (RunPod→Gemini→Together), BASE_PROMPT v3, Capitolo injection
- Iter 5: R0 91.80% PASS (Edge Function), R5 91.45% PASS, RAG ingest pipeline Voyage+Together
- Iter 6-8: Isabella Neural TTS, composite-handler L1, Hybrid RAG BM25+dense+RRF
- Iter 7: 1881 RAG chunks ingested (vol1+vol2+vol3+wiki, Voyage 1024-dim)
- Iter 12: ADR-019 (Sense 1.5 morfismo runtime), ADR-020/021 (VPS/RAG redefine)

**ADR: ADR-008** (buildCapitoloPromptFragment), **ADR-009** (principio-zero-validator), **ADR-010** (Together gated fallback), **ADR-011** (R5 50-prompt fixture)

**Path A decision**: RunPod pod TERMINATED (storage $13/mo with no production runtime value). GPU GPU tasks redirected to Voyage cloud (embeddings) + CF Workers AI (inference).

### Sprint T (iter 19-43, April 28-May 2026)

Production quality sprint: UNLIM quality lift, Lavagna redesign, voice, multimodal.

**Key milestones**:
- Iter 19-22: content-safety-guard (10 rules), Modalità 4 UI (ADR-025), ClawBot L2 templates (20 patterns)
- Iter 26: Mistral routing 65/25/10 LIVE, CF multimodal stack (FLUX + Whisper + Pixtral), sys-prompt v3.1
- Iter 27-28: harness STRINGENT v2.0 design, Lavagna Bug 3 sync, Voice 9/9 PASS, 370 new tests
- Iter 29: Voxtral mini-tts-2603 PRIMARY, wires-root-cause investigation, CF Whisper STT 3-shape fix
- Iter 31: Voice clone Andrea IT LIVE, Onniscenza 7-layer inject, GDPR 4 docs, max_tokens 256→120
- Iter 32: API key rotation (security), massive E2E 50 cases, CF Whisper binary fix
- Iter 36: INTENT parser server-side (iter 36 A1), ChatbotOnly + EasterModal, Mac Mini user-sim curriculum
- Iter 37: ADR-029 LLM routing conservative, B-NEW intentsDispatcher browser-side 22/22 PASS, v50 deploy
- Iter 38: Mistral function calling (ADR-030), warmup cron SQL, MicPermissionNudge, UpdatePrompt PWA

**ADR: ADR-025** (Modalità 4), **ADR-026** (content-safety-guard), **ADR-027** (volumi narrative schema), **ADR-028** (INTENT dispatcher), **ADR-029** (LLM routing weights), **ADR-030** (Mistral function calling), **ADR-031** (STT Voxtral Transcribe 2 design)

### Sprint U (iter 24-28 scope, May 2026)

Quality audit + fix cycle. Two cycles defined.

**Cycle 1 key findings** (7 agents dispatched, read-only audit):
1. BLOCKER: L2 template routing returns `L2-explain-led-blink` for ALL 94 experiments (zero experiment-specific content, Morfismo broken)
2. 73/94 lesson-paths have singolare imperative violations ("Premi Play" ~50 times)
3. 91/94 teacher_messages missing "Ragazzi," opener
4. 94/94 unlimPrompts use "studente" framing instead of "docente" framing
5. Lighthouse perf=43 (react-pdf + mammoth eager-loaded)
6. 833 palette hex violations

**Cycle 2 scope** (iter 29 context): L2 routing fix + vol/pag citation fix + 73-file linguaggio codemod + docente framing fix

---

## 10. Architecture Decision Records

### ADR-003: JWT 401 Edge Function Auth
Supabase anon JWT is scrapeable from browser bundle. Solution: `X-Elab-Api-Key` custom header with 32-byte server-only secret. Fail-open when env unset for backward compat.  
File: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/architectures/ADR-003-jwt-401-edge-function-auth.md`

### ADR-004: DashboardShell Data Source
Dashboard reads from Supabase REST API (not local state) via anonymous session key. Class identification via `class_key` localStorage (no auth required for teacher view).  
File: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/architectures/ADR-004-dashboardshell-data-source.md`

### ADR-008: buildCapitoloPromptFragment Design
`capitoli-loader.ts` resolves experimentId → Capitolo JSON entry → injects chapter-level context (testo_classe + citazioni_volume + analogies + esperimenti list) into system prompt. Replaces dynamic RAG with 37-chapter static knowledge pack for chapter context.  
File: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/architectures/ADR-008-buildCapitoloPromptFragment-design.md`

### ADR-009: Principio Zero Validator Middleware
`principio-zero-validator.ts` enforces 12 runtime rules post-LLM: plurale "Ragazzi," opener, ≤120 words, Vol/pag citation format, kit fisico mention, no singolare imperative, no AI identity reveal, safety redirect for 220V. Runs after enforceItalianK12Opener and forceCitation chain.  
File: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/architectures/ADR-009-principio-zero-validator-middleware.md`

### ADR-010: Together AI Fallback Gated
Together AI (US provider) gated to prevent GDPR-violating student data leaving EU. Truth-table 8 cases: student runtime always blocked. PII strip via `anonymizePayload()`. Every call logged to `together_audit_log`.  
File: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/architectures/ADR-010-together-ai-fallback-gated-2026-04-26.md`

### ADR-011: R5 Stress Fixture 50 Prompts
50-prompt distribution (10 categories × 5 prompts) for quality measurement. Gate: ≥85% PZ V3 rules. Achieved 91.45% (iter 5), then 91.80% (post R5 deploy), then 93.60% (iter 37).  
File: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/architectures/ADR-011-r5-stress-fixture-50-prompts-2026-04-26.md`

### ADR-012: Vision Flow E2E Playwright
Vision analysis flow: user says "guarda il mio circuito" → captureScreenshot() → base64 → unlim-chat with images[] → Gemini/Pixtral vision → Italian diagnosis. Playwright spec: `tests/e2e/02-vision-flow.spec.js`.

### ADR-013: ClawBot Composite Handler L1 Morphic
L1 composition: `composite-handler.ts` dispatches multi-tool sequences. `executeComposite()` resolves ToolSpec from registry, executes sequentially, returns aggregate response. 5/5 unit tests. Dispatcher 62-tool (note: ToolSpec count canonical = 57 per iter 37 grep verify).

### ADR-015: Hybrid RAG Retriever BM25+Dense+RRF
`hybridRetrieve()` in `rag.ts`: (1) BM25 via pg FTS `ts_rank_cd`, (2) dense cosine similarity via pgvector, (3) Reciprocal Rank Fusion k=60. Italian synonym expansion 80+ entries. 2-second timeout race. Returns top-k hits with `score`, `mode`, `source`, `chapter`, `page`.  
File: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/architectures/ADR-015-hybrid-rag-retriever-bm25-dense-rrf-rerank-2026-04-27.md`

### ADR-016: TTS Isabella WebSocket Deno Migration
Edge TTS Isabella via Microsoft WebSocket protocol (Sec-MS-GEC handshake, Deno port of Python rany2/edge-tts). Replaced as fallback by Voxtral primary iter 29. WSS NetworkError in prod as of iter 32 verify.  
File: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/architectures/ADR-016-tts-isabella-websocket-deno-migration-2026-04-27.md`

### ADR-019: Sense 1.5 Morfismo Runtime Docente/Classe
Documents the multi-dimensional runtime adaptation: per-docente language + context, per-classe competence level + kit, per-phase UI (intro/costruzione/verifica/report), morphic finestre/toolbar/mascotte. Foundation for iter 38+ classroom intelligence.

### ADR-020/021: VPS GPU Decommission + RAG Coverage Redefine
ADR-020: RunPod Path A terminated — storage cost not justified without production runtime use. ADR-021: RAG coverage redefined from "6000 chunks" target to "1881 chunks full Vol1+2+3 coverage" — quantity was inflated goal, coverage is the real metric.

### ADR-023/024: Onniscenza e Onnipotenza Architecture
ADR-023: Onniscenza 7-layer aggregator (RAG + Wiki + Glossario + Sessione + Vision + LLM-knowledge + Analogia), fused via RRF k=60, opt-in ENABLE_ONNISCENZA env. ADR-024: Onnipotenza ClawBot 57-ToolSpec declarative + L1 composite + L2 templates + L3 dynamic JS (DEV only).

### ADR-025: Modalità 4 Simplification
Four canonical modes (Percorso/Passo Passo/Già Montato/Libero) replace prior complex mode system. Default is Percorso. Libero auto-reverts to Percorso on idle. localStorage migration removes legacy stale keys.

### ADR-026: Content Safety Guard Runtime
10-rule post-LLM safety checker. Categories: voltage_danger, offtopic, age_inappropriate, pii_risk, competitor_mention, 220V, hallucination_detect, teacher_meta_instruction, non_italian, word_count_exceed. Wired iter 19 after enforceItalianK12Opener.

### ADR-027: Volumi Narrative Refactor Schema
Schema for 37-chapter narrative arc (vs flat cards). Each chapter has: narrazione (story hook), obiettivi_didattici[], componenti_fisici[], errori_comuni[], analogie[], citazioni_volume (VERBATIM). Davide Fagherazzi (author of physical volumes) co-author. Status: PROPOSED, ratify deferred Sprint U.

### ADR-028: INTENT Dispatcher Server-Side
Intent parsing flow: LLM emits `[INTENT:{tool, args}]` JSON tags (OR Mistral structured output JSON schema mode). Server strips tags from display text, surfaces `intents_parsed[]` in ChatResponse. Browser-side `intentsDispatcher.js` reads `intents_parsed` and dispatches to `__ELAB_API`.

### ADR-029: LLM Routing Weights Conservative Tune
LLM_ROUTING_WEIGHTS: 70% Mistral / 25% Gemini / 5% Together. Motivated by Mistral EU FR GDPR-clean primary + latency p50 ~2.5s + R5 93.60% quality. Together emergency-only.

### ADR-030: Mistral Function Calling Intent Canonical
`INTENT_TOOLS_SCHEMA` defines JSON schema for Mistral `response_format: json_schema`. Produces `{text: string, intents?: [{tool, args}]}`. Resolves 4-way schema drift from iter 37 R7 bench (12.5% canonical rate → projected ≥95% post deploy). Opt-in via `ENABLE_INTENT_TOOLS_SCHEMA` env.

### ADR-031: STT Migration Voxtral Transcribe 2
Design document for migrating STT from CF Whisper to Mistral Voxtral Transcribe 2 ($0.003/min, 4% WER FLEURS Italian K-12, EU France GDPR-clean). Completes 100% Mistral EU FR stack. Implementation deferred iter 39+.

---

## 11. Deployment Architecture

```
Production environment:
  Frontend:  Vercel CDN (www.elabtutor.school)
             GitHub Actions auto-deploy on main push
             CI: npm run build must pass

  Backend:   Supabase (euqpdueopmlllqjmqnyb)
             Edge Functions: npx supabase functions deploy
             DB migrations: npx supabase db push --linked

Build command:
  cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build

Deploy frontend:
  npm run build && npx vercel --prod --yes

Deploy backend:
  SUPABASE_ACCESS_TOKEN=sbp_86f... npx supabase functions deploy \
    --project-ref euqpdueopmlllqjmqnyb
```

### Service Health

| Service | URL | Status (iter 28) |
|---------|-----|----------|
| Frontend | https://www.elabtutor.school | OK |
| Supabase | euqpdueopmlllqjmqnyb.supabase.co | OK |
| Nanobot AI | https://elab-galileo.onrender.com | OK (18s cold start, legacy) |
| Compiler | https://n8n.srv1022317.hstgr.cloud/compile | OK |
| Brain VPS | http://72.60.129.50:11434 | ALIVE but DEPRECATED |
| Edge TTS VPS | http://72.60.129.50:8880/tts | DOWN (timeout since 2026-04-26) |

---

## 12. Security Model

### Input Validation Pipeline (guards.ts)

```
1. verifyElabApiKey()        — custom header check (fail-open if env unset)
2. checkBodySize()           — DoS protection
3. validateSessionId()       — UUID format gate
4. validateChatInput()       — message/sessionId/images validation
5. checkRateLimitPersistent() — 30 req/min per session (DB persistent + in-memory fallback)
6. sanitizeMessage()         — prompt injection detection + cleaning
7. sanitizeCircuitState()    — circuit state injection prevention
8. validateExperimentId()    — format validation
9. validateMimeType()        — image MIME type allowlist
```

### GDPR Compliance for Minors

- All AI providers are EU-region (Mistral FR, Gemini Frankfurt)
- Together AI gated and blocked for student runtime
- Data retention: `expires_at` columns on student_sessions, unlim_message_history (7-day TTL)
- `parental_consents` table with GDPR Art. 8 compliance
- `CONSENT_MODE` env: `strict` (block if no consent) | `soft` (warn if unknown) | `off`
- GDPR transparency: `dataProcessing` field in every ChatResponse
- 4 public GDPR docs: Privacy Policy, Cookie Policy, ToS, Sub-processor list (iter 31 drafts)
- PII strip: `anonymizePayload()` before any Together AI call
- Image analysis: `imagePiiGuard` instruction in system prompt

### Anti-Regression Gates

```bash
# Pre-commit hook:
npx vitest run       # must not decrease baseline (automa/baseline-tests.txt)
npm run build        # must pass

# Blocked bash commands (settings.local.json):
git reset --hard, git clean -f, rm -rf, DROP TABLE
# Blocked file access:
.env, .git internals
```

---

## 13. Performance Characteristics

### Latency Profile (measured iter 37)

| Metric | Value | Target |
|--------|-------|--------|
| unlim-chat p50 avg | ~4496ms | <3000ms |
| unlim-chat p95 | ~10096ms | <8000ms (timeout cap) |
| Voxtral TTS p50 | ~1181ms | - |
| Vision p50 | ~600ms (Gemini) | - |
| CF FLUX imagegen p50 | ~2.19s | - |

### Latency Optimizations Implemented

1. **Promise.all** for loadStudentContext + hybridRetrieve (iter 38 A3, -800-1200ms p95 projected)
2. **Pre-LLM short-circuits**: voltage_danger, offtopic regex, classifier off_topic, directOperational, ClawBot L2 template — all return in <300ms without LLM call
3. **Onniscenza classifier** (iter 37 A2): chit_chat skips aggregator (~500-1000ms saved)
4. **max_tokens 256→120** (iter 31, ~40% output reduction)
5. **TTS decoupled** from chat response (iter 34 P0, -3s perceived latency on template path)
6. **Warmup cron** (iter 38 A5, pg_cron HEAD ping every 30s)
7. **LLM timeout 8s** with race, brain fallback on miss

### Bundle Size

```
Total ~4000KB
33 precache entries
Lazy-loaded: NewElabSimulator, TeacherDashboard, MicPermissionNudge, UpdatePrompt
react-pdf 407KB + mammoth 70KB identified as Lighthouse perf bottleneck (score 43/100)
```

---

## 14. Known Gaps and Open Items

### P0 (blocking for production quality)

1. L2 template routing bug: `selectTemplate()` returns `L2-explain-led-blink` for ALL 94 experiments (Sprint U Cycle 1 finding). Zero experiment-specific UNLIM content delivered.
2. 73/94 lesson-paths have singolare imperative violations ("Premi Play") — Principio Zero broken for 78% of experiments.
3. 91/94 teacher_messages missing "Ragazzi," opener — docente flow broken.
4. Lighthouse perf 26-43 (react-pdf + mammoth eager loading).
5. Vision A2 Gemini Flash deploy deferred (Andrea ratify queue).

### P1 (high priority)

1. 94/94 unlimPrompts use "studente" framing instead of "docente" framing.
2. R6 + R7 runners not yet authored (bench infrastructure gap).
3. Playwright 0/4 PASS specs (WelcomePage license gate refactor needed).
4. 94 esperimenti Playwright UNO PER UNO sweep (Andrea iter 21 mandate, carryover).
5. Linguaggio codemod 200 singolare→plurale violations (Andrea iter 21 mandate).
6. Dispatcher 62-tool Deno port NOT yet in production (L2 templates wired, L1 composite scaffolded).
7. Edge TTS Isabella WSS NetworkError prod (masked by Voxtral primary).
8. Mac Mini autonomous loop status uncertain (SSH auth issues iter 36).

### P2 (deferred)

1. Vol3 narrative refactor ADR-027 (Davide co-author, iter 33+ deferred).
2. Cronologia Google-style with UNLIM-generated descriptions.
3. Tres Jolie volumi parallelismo audit.
4. ADR-031 STT Voxtral Transcribe 2 implementation.
5. Canary 5%→25%→100% rollout for Mistral function calling (ENABLE_INTENT_TOOLS_SCHEMA).

---

*Document generated by Agent D iter 29, 2026-05-11. Sources: codebase READ-ONLY scan of `supabase/functions/`, `src/components/`, `supabase/migrations/`, `docs/architectures/`, CLAUDE.md memory.*
