# Mac Mini User-Simulation Curriculum — Iter 36+37+38

**Goal**: Mac Mini Cron H24 simulazione utente REALE (NON solo mapping screenshot). Pulsanti cliccati, esperimenti montati/rimontati, Percorso eseguito, Passo Passo navigato, UNLIM chat real prompts, Onniscenza/Onnipotenza verify. Difficoltà incrementale curriculum learning.

**Reference**: tutti 3 PDR iter 36+37+38 (`§3 Atom A10 / B11 / C1` riferimento questo file).

---

## §1 — Architettura simulation

**Mac Mini** (`progettibelli@100.124.198.59` SSH `~/.ssh/id_ed25519_elab`):
- Playwright MCP + Control Chrome MCP installed (npm + chromium installed)
- Cron user-simulation script `~/scripts/elab-user-simulation-curriculum.sh`
- Output `~/Library/Logs/elab/user-sim-{level}-{persona}-{ISO}.{json,jsonl,png}`
- Branch push pattern `mac-mini/iter{N}-user-sim-{level}-{ISO}` post-cycle
- MacBook orchestrator fetch + diff + dispatch fix per regressioni rilevate

**Persona profiles** (4 utenti virtuali):
- **P1 Docente primaria** (Vol.1 cap.1-6, plurale "Ragazzi", livello base)
- **P2 Docente secondaria** (Vol.2/3 esperimenti, livello intermedio, MOSFET/sensori)
- **P3 Studente curiosa** (chat UNLIM frequenti, vision photo upload, fumetto generation)
- **P4 Tester chaotic** (random click sequence, edge cases, recovery test)

---

## §2 — Curriculum 3-livelli difficoltà incrementale

### Livello 1 — Smoke test (Cron 5min, persona P1+P4 alternate)

**Time per cycle**: ~3 min
**Scenari**: 5 base interactions

1. **Homepage load** → screenshot + verifica 5 card presenti (Lavagna/Glossario/Manuale/UNLIM/Cronologia)
2. **Click card "Lavagna"** → navigate `#lavagna` → screenshot post-load (verifica modalità default `percorso` visibile, 4 modalità switch presenti)
3. **Click modalità "Libero"** → verifica circuit cleared + canvas blank
4. **Click modalità "Percorso"** → verifica torna default state
5. **Console errors check** → 0 errors target (failure → flag bug)

**Acceptance Livello 1**: 5/5 PASS = green. 1+ FAIL = bug flag → MacBook orchestrator dispatch Tester-2 systematic-debugging.

### Livello 2 — Workflow standard (Cron 30min, persona P1+P2+P3 rotate)

**Time per cycle**: ~10 min
**Scenari**: 8 scenari workflow tipico

1. **Mount esperimento Vol.1 cap.6 esp.1 LED** → `__ELAB_API.mountExperiment('v1-cap6-esp1')` → wait 2s → screenshot circuit + verify components present (`led1, r220, breadboard, nano`)
2. **Click compile button** → wait 5s → verify HEX returned (success:true) → screenshot compile bar
3. **Apri UNLIM panel** → click mascotte UNLIM → screenshot chat input visible
4. **Chat prompt P1 "Spiegami questo circuito"** → wait 6s response → screenshot reply + verify length ≤80 word + plurale "Ragazzi" + Vol/pag mention
5. **Chat prompt P2 "Aggiungi resistore 1kΩ"** → verify INTENT executed (component added simulator) + chat conferma
6. **Click Passo Passo modalità** → screenshot LessonReader visible (FloatingWindow se iter 36 atom A5 applicato) + verify scroll funziona
7. **Mount esperimento diverso** Vol.2 cap.5 → switch experiment → verify clean state load
8. **Click Esci Lavagna → riapri** → verifica drawing paths persisted (Bug 2 verify)

**Acceptance Livello 2**: 8/8 PASS green. 7/8 PASS warn. ≤6/8 = bug flag.

### Livello 3 — Onniscenza + Onnipotenza stress (Cron 2h, persona P3 curiosa primary)

**Time per cycle**: ~20 min
**Scenari**: 10 scenari complessi cross-layer

1. **Vision flow**: capture screenshot circuit → upload UNLIM "Guarda il mio circuito" → verify Gemini Flash response Italian K-12 (kit fisico mention + Vol/pag verbatim)
2. **Cross-pollination test**: chat history 5 turn (Ragazzi → catodo → anodo → LED → Vol.6) → 6° prompt: "ricorda cosa abbiamo detto su anodo" → verify L6 history retrieve + plurale + Vol/pag preserved
3. **Onniscenza 7-layer hit verify**: prompt complesso "Spiegami LED come una storia col kit fisico" → check response Edge Function logs Supabase → 5+/7 layers hit (RAG L1 + Wiki L2 + Glossario L3 + Memoria L4 + Vision L5 + LLM-knowledge L6 + Analogia L7)
4. **Onnipotenza dispatcher INTENT**: prompt "Mostra in lavagna LED + resistore" → verify L2 template `mostra-componente` short-circuit pre-LLM → 0 LLM call (fast) + components mounted ≤500ms
5. **Onnipotenza INTENT post-LLM**: prompt "Diagnostica errore catodo invertito" → LLM produce `[INTENT:{tool:"highlightComponent",args:{ids:["led1"]}}]` → verify dispatcher 62-tool execute server-side → frontend riceve `intents_executed`
6. **Fumetto generation**: completa 3 messaggi UNLIM + click Fumetto → verify popup HTML report aperto (NO toast "Nessuna sessione salvata")
7. **Wake word "Ehi UNLIM"** simulation: trigger via `window.dispatchEvent('elab-wake-word-detected')` → verify UNLIM panel apre + toast "Ti ascolto!" → typed prompt → verify INTENT execute
8. **Edge cases recovery**: simulate offline 5s + reconnect → verify Edge Function retry + Edge TTS Isabella fallback se Voxtral down
9. **TTS streaming chunking** (iter 37+): chat prompt → measure first audio sample <500ms p50 (vs full mp3 2s) → verify chunked playback
10. **Multimodal stress**: 1 chat + 1 vision + 1 image gen + 1 TTS in 60s window → verify 4/4 capabilities respond + no rate limit + total <8s

**Acceptance Livello 3**: 9-10/10 PASS = excellent (cross-pollination verified). 7-8/10 = bug flag specific scenario. ≤6/10 = critical regression → emergency dispatch.

---

## §3 — Persona scripts dettaglio

### P1 Docente primaria (Vol.1 base)

```javascript
// scripts/persona/p1-docente-primaria.spec.js
const PERSONA = 'p1-docente-primaria';
const VOL = 1;
const ESPERIMENTI = ['v1-cap1-esp1', 'v1-cap2-esp1', 'v1-cap6-esp1', 'v1-cap10-esp1'];
const PROMPTS = [
  'Spiegami il circuito ai miei alunni di prima elementare',
  'Fammi una analogia col rubinetto',
  'Cosa devo dire ai ragazzi sulla resistenza?',
  'Come spiego catodo anodo?',
];
// Linguaggio target: plurale Ragazzi + analogie età 6-10
// Acceptance: 100% prompt risposte plurale + analogie semplici + ≤60 parole
```

### P2 Docente secondaria (Vol.2/3 intermedio)

```javascript
// scripts/persona/p2-docente-secondaria.spec.js
const PERSONA = 'p2-docente-secondaria';
const VOLS = [2, 3];
const ESPERIMENTI = ['v2-cap5-esp1', 'v3-cap8-esp1', 'v3-matrice-led']; // capstone
const PROMPTS = [
  'Differenza MOSFET vs BJT in termini didattici',
  'Come usare LDR per progetto sensore luce',
  'Spiega multiplexing matrice LED 8x8',
  'Ohm legge esempio numerico classe',
];
// Linguaggio: Ragazzi + Vol/pag verbatim + concetti tecnici accurati + analogia accessibile
```

### P3 Studente curiosa (UNLIM frequente, Vision)

```javascript
// scripts/persona/p3-studente-curiosa.spec.js
const PERSONA = 'p3-studente-curiosa';
const VISION_PHOTOS = ['photo-led-rosso.jpg', 'photo-breadboard-circuit.jpg'];
const PROMPTS = [
  'Guarda il circuito che ho costruito',
  'Cosa ho sbagliato qui?',
  'Genera fumetto della mia lezione',
  'Mostra come collego il LED',
  'Spiegami con una storia',
];
// Onniscenza stress: Vision + RAG + history cross-pollination
```

### P4 Tester chaotic (random sequence)

```javascript
// scripts/persona/p4-tester-chaotic.spec.js
const PERSONA = 'p4-tester-chaotic';
// Random click sequence 50 actions/cycle
// Random esperimento mount/unmount
// Random modalità switch
// Random viewport resize (mobile/tablet/LIM)
// Edge cases: empty session + offline + slow 3G + storage full
// Acceptance: 0 crash, 0 console error
```

---

## §4 — Mac Mini Cron schedule

```cron
# /home/progettibelli/crontab.elab-iter36-38

# Livello 1 smoke (P1+P4 alternate)
*/5 * * * * /Users/progettibelli/scripts/elab-user-sim-livello-1.sh

# Livello 2 workflow (P1+P2+P3 rotate)
*/30 * * * * /Users/progettibelli/scripts/elab-user-sim-livello-2.sh

# Livello 3 stress Onniscenza+Onnipotenza (P3 primary)
0 */2 * * * /Users/progettibelli/scripts/elab-user-sim-livello-3.sh

# Aggregator + push branch (15min)
*/15 * * * * /Users/progettibelli/scripts/elab-user-sim-aggregate-push.sh
```

**Total daily cycles**:
- Livello 1: 288/giorno (288 × 3 min = 14h activity)
- Livello 2: 48/giorno (48 × 10 min = 8h activity)
- Livello 3: 12/giorno (12 × 20 min = 4h activity)
- Aggregator: 96/giorno

**Cost monitoring**: Edge Functions chiamate × 12/giorno × 60 calls/cycle = ~720 calls/giorno P3 stress livello 3 → fitless within Mistral free tier (sufficiente fino 1000 calls/giorno).

---

## §5 — Acceptance metrics aggregator

**MacBook orchestrator** legge log Mac Mini `~/Library/Logs/elab/user-sim-*` ogni 15min:

| Metric | Livello 1 target | Livello 2 target | Livello 3 target |
|--------|-------------------|-------------------|-------------------|
| PASS rate | ≥98% (288/288) | ≥90% (43/48) | ≥80% (10/12) |
| Console errors / cycle | 0 | ≤1 | ≤2 |
| Latency p95 chat | N/A | ≤4s warm | ≤2.5s warm |
| Onniscenza layer hits | N/A | N/A | ≥5/7 layers |
| INTENT execute rate | N/A | N/A | ≥85% |
| Crash count | 0 | 0 | 0 |

**Regression flag rules**:
- 2+ consecutive Livello 1 FAIL → emergency dispatch Tester-2 systematic-debugging
- 5+ consecutive Livello 2 FAIL → MacBook open issue + Maker-1 fix
- 1+ Livello 3 critical FAIL (Onniscenza <30% layer hit OR INTENT <50% exec) → MacBook stop deploy + iter close audit dump

---

## §6 — Setup Mac Mini iter 36 entrance

**Andrea action ~10 min**:

```bash
# MacBook orchestrator
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'mkdir -p ~/scripts ~/Library/Logs/elab'

# Copy curriculum scripts
scp -i ~/.ssh/id_ed25519_elab \
  scripts/persona/*.spec.js \
  scripts/elab-user-sim-livello-{1,2,3}.sh \
  scripts/elab-user-sim-aggregate-push.sh \
  progettibelli@100.124.198.59:~/scripts/

# Install crontab
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'crontab ~/scripts/crontab.elab-iter36-38'

# Verify Playwright + Chromium installed
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'cd ~/elab-builder && npx playwright install chromium'

# Smoke first cycle manual
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'bash ~/scripts/elab-user-sim-livello-1.sh'
```

**Verifica**: MacBook fetch `mac-mini/iter36-user-sim-*` branch entro 15min → screenshot + log presenti → Cron LIVE.

---

## §7 — Output formato JSON aggregator

```json
{
  "cycle_id": "iter36-l1-p1-2026-04-30T13-45-00Z",
  "level": 1,
  "persona": "p1-docente-primaria",
  "scenarios_total": 5,
  "scenarios_passed": 5,
  "scenarios_failed": [],
  "console_errors": 0,
  "duration_ms": 178342,
  "screenshots": [
    "homepage.png",
    "lavagna-percorso.png",
    "lavagna-libero.png",
    "lavagna-percorso-restored.png"
  ],
  "regression_flags": [],
  "git_branch": "mac-mini/iter36-user-sim-l1-2026-04-30T13-45-00Z",
  "vercel_alias_tested": "https://www.elabtutor.school"
}
```

**MacBook orchestrator** parsa `regression_flags` per dispatch agent fix.

---

## §8 — Closure mandate Andrea iter 36-38

Mac Mini DEVE:

1. ✅ Simulare utente REALE (NON screenshot only)
2. ✅ Click pulsanti, mount/unmount esperimenti, Percorso flow, Passo Passo navigation
3. ✅ Usare UNLIM chat con prompts persona-driven realistici
4. ✅ Test Onniscenza (cross-layer pollination metric)
5. ✅ Test Onnipotenza (INTENT dispatch + L2 template short-circuit)
6. ✅ Difficoltà incrementale (Livello 1 → 2 → 3 progression)
7. ✅ Logica curriculum learning (persona profiles + scenario complexity escalation)
8. ✅ Output structured JSON per orchestrator dispatch automatico

**MacBook usa info trovate** per:
- Re-dispatch Tester-2 systematic-debugging on regression flag
- Maker-1 fix su bug ricorrente (3+ cycle FAIL same scenario)
- Documenter scribe daily summary report `docs/audits/mac-mini-daily-{YYYY-MM-DD}.md`

**Anti-inflation G45**: Mac Mini score Livello 3 PASS rate è REAL ground truth Onniscenza+Onnipotenza efficacia. NO claim score >X senza Mac Mini Livello 3 verifica ≥80% PASS.
