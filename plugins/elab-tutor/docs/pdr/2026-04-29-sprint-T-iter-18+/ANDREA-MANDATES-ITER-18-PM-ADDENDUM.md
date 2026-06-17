# Andrea Mandates iter 18 PM — Addendum to PDR Sprint T iter 18+

**Data**: 2026-04-28 PM
**Origine**: Andrea cumulative messages iter 18 close
**Scope**: addendum a PDR-MASTER-2026-04-29.md + ADR-023 + ADR-024
**Status**: MANDATORY iter 22-25 implementation

---

## §1 — Modalità ELAB simplification (4 modes, NO "guida da errore")

Andrea iter 18 PM: **eliminare "guida da errore" come modalità**. Default Libero → **auto-start Percorso**.

### Modes complete list iter 22+

| Mode | Target user | UX behavior | Linguaggio |
|------|-------------|-------------|-----------|
| **Percorso** ⭐ | Classe (lettura) + Docente (occhio-scorre) | lettura libro page-by-page sequenziale, scroll narrativo capitolo | Plurale "Ragazzi" + Vol/pag VERBATIM + cita testo VERBATIM volume |
| **Passo-Passo** | Classe build kit fisico | step sequenziali con verifica componente per componente, variazione dentro capitolo | Plurale + istruzioni operative + analogia |
| **Già Montato** | Docente diagnose/spiegazione veloce | circuit pre-assembled mostra TUTTO già funzionante, focus spiegazione non build | Plurale + spiega comportamento + diagnose se broken |
| **Libero** | Sandbox post-completamento capitolo | sandbox sperimentazione MA **auto-start Percorso** quando docente sceglie Libero | Plurale + UNLIM proattivo wake word + voce |

### Auto-behavior Libero

- Click "Libero" → **mounts Percorso** automatico (NON sandbox vuoto)
- Reason: docente non sa cosa fare con sandbox vuoto, Percorso default = familiar lettura libro
- Implementation: `src/components/lavagna/ModalitaSwitch.jsx` → onLiberoClick → setMode('Percorso')

### Removed mode

- ❌ ~~"Guida da errore"~~ — eliminate iter 22 release. Confusing per docente. Diagnose flow integrato dentro Già Montato + Passo-Passo.

---

## §2 — ClawBot massima precisione + consapevolezza

Andrea iter 18 PM 2 messages: "ClawBot pilota tutto simulator/scratch/arduino con **massima precisione e consapevolezza**".

### Implementation iter 22-25 (extends ADR-024)

**Consapevolezza** = ClawBot reads onniscenza-bridge (ADR-023) PRE-execute every L1/L2 call:
- State current simulator (componenti + connessioni + stato pin)
- Step current esperimento (Percorso position, Passo-Passo step #N)
- Memoria docente + classe (Sense 1.5 morfismo)
- Vol/pag context (RAG retrieval prima di rispondere)
- Wiki concept relevance (Glossario Tea analogia per età classe)

**Precisione** = ClawBot output verifica PRINCIPIO ZERO V3 PRE-emit:
- Plurale "Ragazzi" enforced (regex check + auto-fix se imperative)
- Vol/pag citation VERBATIM (NO parafrasi)
- ≤60 parole MAX
- Analogia real-world presente (1 minimum)
- NO imperative verso docente

### Module integration ELAB iter 24 (extends ADR-024 §5)

ClawBot pilota TUTTI moduli ELAB con awareness:

| Modulo | ClawBot capability | Consapevolezza |
|--------|--------------------|---------------|
| Simulator | mountExperiment + interact + capture + setBuildMode | reads circuit state pre-action |
| Scratch | loadWorkspace + compile + setEditorCode | reads block tree current pre-modification |
| Arduino | n8n compile + upload + serial | reads compile errors → suggests fix Vol/pag |
| Dashboard | export CSV + analytics filter | reads class memory + session history |
| Lavagna | drawing + toolbar mode + clear | reads pen state + selection |
| Fumetto | export PDF + voice cmd "leggi rapporto" | reads session events + Vol citations |
| Voice | TTS Isabella + STT Whisper + wake word | reads audio context + intent |
| 4 giochi | state + score + level | reads game session + leaderboard |

---

## §3 — Content Safety Guard runtime — Principio Zero V3 Enforcement

Andrea iter 18 PM: "previeni qualunque messaggio volgare o sbagliato".

### Implementation iter 22

**Layer**: NEW `supabase/functions/_shared/content-safety-guard.ts` (~150 LOC Deno)

**Guard rules** (pre-emit + post-LLM):
1. **Volgari blacklist Italian**: 50+ termini check, instant reject + retry LLM with stricter prompt
2. **Off-topic detect**: query non-STEM-K12 → polite redirect "Ragazzi, restiamo su elettronica..."
3. **Linguaggio inappropriato minori 8-14**: complessità lessicale check (target Flesch-Kincaid <8th grade Italian)
4. **Imperative docente check**: "fai questo / devi fare" → auto-rewrite "ai ragazzi vediamo / ragazzi proviamo"
5. **Plurale obbligatorio**: response NOT contain "Ragazzi," → instant retry
6. **Vol/pag VERBATIM**: claim Vol.X pag.Y MUST match real RAG chunk (cross-check pre-emit)
7. **Hallucination detect**: claim numerico/factual senza source → block + retry with retrieval
8. **Privacy minori**: NEVER cite student name + class name in response (anonymize)
9. **GDPR Art. 8 minori 8-14**: parental consent flag check before any personalization
10. **EU AI Act high-risk education**: log every guard fire to audit_log table

### Telemetry

- `safety_guard_fires` counter per rule
- `safety_guard_block_rate` ratio
- `safety_guard_retry_success` ratio
- Alert if block rate >5% (suggests prompt engineering issue)

### Andrea ratify: implementation iter 22 entry, mandatory pre-Sprint T iter 25 close.

---

## §4 — Volumi narrative continuum vs ELAB flat 92 esperimenti — DEEP DIVE

Andrea iter 18 PM repetuto critical: "esperimenti sui volumi non sono proposti come su elabtutor: in uno sono variazioni di uno stesso tema, nell'altro tenti pezzi staccati".

### Status attuale (iter 18 close)

- **Volumi cartacei Davide** (TRES JOLIE/1 ELAB VOLUME UNO + 2 + 3): esperimenti come **VARIAZIONI** dello stesso **tema-capitolo** (narrative continuum)
- **ELAB Tutor lesson-paths**: 92 file `v{1,2,3}-cap{N}-esp{M}.json` = **PEZZI STACCATI** flat
- **Conseguenza**: docente legge libro narrative MA software mostra cards isolate → **DISCONTINUITÀ** + viola Morfismo Sense 2

### Implication for modalità

- **Percorso** mode = narrative continuum (lettura libro page-by-page) → DEVE riflettere flusso narrativo Davide
- **Passo-Passo** = variazione sequenziale dentro capitolo → DEVE seguire ordine variazioni libro
- **Già Montato** = singola variazione finale capitolo (target final state)
- **Libero** auto-Percorso = entry point narrative

### Refactor proposal Sprint T iter 22-25

**Step 1 iter 22 — Audit Vol1+2+3 capitolo-by-capitolo**:
- Mac Mini D3 elab-auditor-v2 fa diff PDF Vol1 vs current 38 lesson-paths Vol1
- Output `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` con mapping:
  - Capitolo X libro → variazioni Y1, Y2, Y3, Y4 (narrative continuum)
  - Lesson-paths attuali → quali sono "pezzi staccati" superflui

**Step 2 iter 23 — Schema rivisto lesson-paths**:
- New schema: `src/data/lesson-paths-narrative/v{N}-cap{M}.json` (1 file per capitolo)
- File contiene: `{ chapter, themes, variations: [{step, components, instructions, expected}] }`
- Replace flat 92 file with grouped ~38 file (1 per capitolo, multi-variazione interno)

**Step 3 iter 24 — UI refactor Percorso/Passo-Passo**:
- Percorso reader: scroll page-by-page dentro capitolo
- Passo-Passo step navigation: variation 1 → 2 → 3 → 4 dentro capitolo
- Già Montato: jump to final state variation
- Libero: auto-mount Percorso su ultimo capitolo completato classe

**Step 4 iter 25 — Validate Davide co-author**:
- Davide review narrative flow per capitolo
- Verifica linguaggio "Ragazzi" + "occhio-scorre" docente
- Approve refactor PR

### Score impact

- Box Morfismo Sense 2 (kit + volumi + software triplet): da 0.7 → 0.95 post-refactor
- Score Sprint T iter 25 close target: +0.3 contribution

---

## §5 — RunPod $13 = stessi modelli production Scaleway

Andrea iter 18 PM: "Scegli gli stessi modelli che userai dopo la migrazioni. FAI SCELTA PERFETTA".

### Models target Scaleway H100 production (Sprint T iter 17 procurement post)

| Component | Model | Quantization | VRAM | Status RunPod test iter 18 |
|-----------|-------|--------------|------|---------------------------|
| LLM chat | **meta-llama/Llama-3.3-70B-Instruct** | Q4_K_M GGUF | ~40GB | ✅ Task A vLLM bench |
| Embeddings | **BAAI/bge-m3** multilingual 1024-dim | FP16 | ~1.5GB | ✅ Task B re-batch test |
| Vision/VLM | **Qwen/Qwen2.5-VL-7B-Instruct** | FP16 | ~14GB | DEFER iter 19 (need photos) |
| TTS Italian | **mistralai/Voxtral-Mini-24B** OR **coqui/XTTS-v2** | FP16 | ~8GB | ✅ Task C bench Italian |
| STT | **openai/whisper-large-v3-turbo** | FP16 | ~3GB | DEFER iter 19 |
| Reranker | **BAAI/bge-reranker-v2-m3** | FP16 | ~600MB | DEFER iter 20 |

### Rationale stessi modelli

- ✅ Bench risultati RunPod 1:1 transfer Scaleway iter 21+ procurement
- ✅ Validate Llama 70B Q4 quality vs Gemini Flash-Lite current baseline
- ✅ Validate BGE-M3 multilingual recall@5 vs Voyage cloud
- ✅ Voxtral Italian quality test (Andrea voice clone iter 19+)
- ❌ NO test smaller variants (e.g. Llama 8B) — would NOT inform Scaleway choice

### Budget split $13.63

- Task A vLLM Llama 70B: ~5h × $0.33/h RTX A6000 = $1.65
- Task B BGE-M3 batch: ~3h × $0.33 = $0.99
- Task C Voxtral TTS: ~2h × $0.33 = $0.66
- **Total task GPU**: $3.30
- Setup pod + model downloads: $1-2 buffer
- **Spent**: ~$5
- **Reserve**: ~$8 for iter 19 voice clone + photos vision test

---

## §6 — Andrea ratify queue final iter 18-22 (10 voci)

| # | Decision | Andrea action | Deadline |
|---|----------|---------------|----------|
| 1 | Modalità simplification (4 modes NO "guida da errore") | Y/N + design review | iter 22 |
| 2 | Libero auto-start Percorso | Y/N | iter 22 |
| 3 | Già Montato new mode | Y/N + UX spec | iter 23 |
| 4 | ClawBot consapevolezza Onniscenza-bridge | Y ratify ADR-024 §5 | iter 23 |
| 5 | Content safety guard 10 rules | Y ratify §3 above | iter 22 |
| 6 | Volumi narrative refactor Step 1-4 | Davide co-review iter 22 | iter 25 |
| 7 | RunPod stessi modelli production target | Y/N (per task A/B/C) | iter 18 close |
| 8 | Vercel env switch compile-proxy | OAuth click | iter 19 |
| 9 | Mistral PAYG signup primary | OAuth click | 31/05 |
| 10 | Tea co-founder formalize | equity 25% + revenue 15% Y2+ | iter 22 |

---

## §7 — Cross-references

- PDR-MASTER-2026-04-29.md (master plan iter 18-30)
- ADR-019 Sense 1.5 morfismo
- ADR-022 VPS GPU GDPR Sprint T iter 17+
- ADR-023 Onniscenza 7-layer
- ADR-024 Onnipotenza ClawBot 4-layer
- docs/strategy/2026-04-28-tea-pdf-analysis.md (Glossario Vol1+2+3)
- docs/superpowers/plans/2026-04-29-sprint-T-iter-18-comprehensive-master-plan.md
- CLAUDE.md DUE PAROLE D'ORDINE Principio Zero V3 + Morfismo Sense 1.5

---

**End addendum**. Status: MANDATORY iter 22-25 + iter 18-19 (modalità + safety guard).
