# Harness STRINGENT v2.0 — iter 27 P1 design

**Date**: 2026-04-29 iter 27 entrance
**Author**: Claude Opus 4.7 (autonomous orchestrator)
**Source mandate**: Andrea iter 25 PM "ricontrolla, i componenti sono disposti male o mal connessi" + iter 26 PM "harness STRINGENT criteria UX layout + visual + linguaggio"
**Principio Zero V3**: imperativo — docente protagonist, kit fisico ELAB protagonist, citazione VERBATIM Vol/pag

## Premessa onesta (G45 anti-inflation)

Iter 19 harness 2.0 self-claim 85/87 PASS = **falso positivo strutturale**. Criteria erano permissive (regex match parole-chiave + screenshot present, NO topology check, NO componenti placement check, NO cabling validation). Andrea correttamente: "i componenti sono disposti male o mal connessi" — agent visione è OBBLIGATORIO, regex non basta.

**Pre-iter 27 baseline ONESTO**: 0/87 esperimenti VERAMENTE validati (nessun harness ha mai eseguito i 4 livelli stringent).

## 5 livelli STRINGENT proposti

### Livello 1: TEXT (regex + sintassi)
**Cosa misura**: format text response UNLIM
**Tool**: regex JS (pre-esistente harness 2.0)
**Criteria**:
- ragazzi_opening (case-insensitive, posizione 0-5 caratteri)
- word_count ≤ 60 (esclusi tag [AZIONE:...], post-stripping)
- vol_pag_citation regex `Vol\.\d+\s+(cap|pag)\.\d+`
- verbatim_quote regex `«[^»]+»` o `"[^"]+"\s*—`
- analogy_present regex italiano k-12 (pensate, immaginate, come, simile)
- kit_mention regex (breadboard, kit, ELAB, montate, inserite, costruite, cablate)
- safety regex (no parolacce, no prompt injection echo)

**Costo**: ~10ms per response, gratis
**Falsi positivi noti**: regex permissive → testo Ragazzi formattato non garantisce qualità pedagogica
**Status iter 27**: ESEGUIBILE OGGI (gold-set 30 prompt esiste)

### Livello 2: SEMANTIC (LLM-as-judge embedding)
**Cosa misura**: aderenza al contesto + accuracy contenuto Vol/pag
**Tool**: Mistral Small judge prompt + embedding similarity Voyage
**Criteria**:
- citation accuracy: la citazione VERBATIM corrisponde al chunk RAG retrieved? (cosine sim ≥0.95)
- contesto coerenza: la response answer matcha la query intent? (judge LLM Mistral 1-5 score)
- analogy quality: l'analogia è k-12 appropriate? (judge LLM 1-5 score)
- linguaggio plurale: tutto il testo è plurale "voi/ragazzi"? (judge LLM binary)
- principio zero compliance: kit fisico è protagonista (NO "puoi simulare" sostituzione)? (judge LLM binary)

**Costo**: ~$0.01 per response judge (Mistral Small €0.20/M token)
**Falsi positivi noti**: judge LLM bias verso self-validation, threshold tuning empirico
**Status iter 27**: scaffold script Mistral judge exists, needs gold-set ground truth ≥30 examples

### Livello 3: VISUAL (Mistral Pixtral vision + computer vision rules)
**Cosa misura**: layout componenti corretto sul simulatore screenshot
**Tool**: Mistral Pixtral 12B (already wired iter 24 unlim-vision Edge Fn) + heuristics image-magick
**Criteria**:
- topology check: tutti i pin del componente connessi (no floating wires) — Pixtral query "ci sono pin scollegati?"
- placement check: componenti dentro canvas bounds, no overlap — heuristics SVG bounding box
- breadboard usage: componenti su righe valide breadboard (Pixtral analizza screenshot)
- LED orientation: anodo/catodo distinguibili e corretti — Pixtral query
- resistor pull-up/down corretto: Pixtral query con esperimento context
- wire color convention: rosso V+, nero GND (Pixtral query)
- no short circuit: Pixtral analizza pattern wires
- componente identification accuracy: Pixtral lista componenti vs ground truth lesson-path

**Costo**: ~$0.005 per screenshot (Mistral Pixtral 12B €0.15/M input + €0.15/M output)
**Falsi positivi noti**: Pixtral 12B può sbagliare componenti minori, NO bench K-12 disponibile
**Ground truth bisogno**: 92 esperimenti × 1 screenshot golden = 92 PNG curated by Andrea/Tea
**Status iter 27**: Mistral Pixtral wired, ground truth screenshots NOT exist — DEBT

### Livello 4: SIMULATOR (CircuitSolver dynamic + AVRBridge run)
**Cosa misura**: il circuito FUNZIONA realmente quando avviato?
**Tool**: Playwright + CircuitSolver MNA + AVRBridge avr8js già nel browser
**Criteria**:
- compile success: HEX generation OK senza errori
- circuit consistency: CircuitSolver converges (no infinite loop, no NaN)
- expected behavior assertion: LED accende quando code dice digitalWrite HIGH (frame check Playwright)
- pulsante reads: digitalRead funziona post-pressure
- PWM output: analog values measured at oscilloscopio virtuale
- I2C/SPI bus: messaggi seriale corretti
- timing accuracy: delay() rispettato ±10%

**Costo**: ~30s per esperimento Playwright run (CI/locale)
**Falsi positivi noti**: simulatore stesso ha bugs (Andrea iter 25 "92 broken count"), Playwright può flaky
**Status iter 27**: Playwright spec esiste solo per 2-3 esperimenti smoke. 92 esperimenti coverage = DEBT

### Livello 5: PEDAGOGICAL (persona simulation 5 utenti)
**Cosa misura**: l'esperienza è LIM-friendly per docente con classe reale?
**Tool**: Playwright + 5 persona script + agent reviewer
**Personas**:
1. **Docente esperto Arduino** (cerca dettagli tecnici, scetticismo high)
2. **Docente al primo anno** (linguaggio semplice, paura di sbagliare, micro-step)
3. **Bambino 4ª primaria 9 anni** (tempo di attenzione 5min, distrazione, drag-drop touch)
4. **Bambino 3ª media 13 anni** (autonomo, vuole "che funzioni", smanetta)
5. **Genitore curioso** (interfaccia LIM da casa, vuole capire cosa fa figlio)

**Criteria** (per persona):
- onboarding tempo (target: <90s a primo esperimento)
- tempo per primo errore (target: ≥3min before frustration)
- comprensione UNLIM response (giudizio agent: chiaro? confuso?)
- kit fisico mention onestà (UNLIM dice "sul vostro kit" ≥3 volte/sessione)
- linguaggio plurale "Ragazzi," (binary: rispettato sempre?)

**Costo**: ~10min Playwright × 5 persona × 92 esperimenti = ~76h CI (decimate gold-set 10 esp)
**Status iter 27**: Persona script NOT exist, agent reviewer NOT exist — DEBT

## Roadmap iter 27-31 distribuzione

### Iter 27 P0 (immediate)
- Livello 1 TEXT scale: 30-prompt gold-set bench v3.1 RE-RUN (BLOCKED ELAB_API_KEY plaintext)
- WORKAROUND: bench via Vercel preview URL bypass auth (E2E_AUTH_BYPASS) → confronto Vol/pag + kit_mention conformance
- Livello 2 SEMANTIC scaffold: Mistral judge script + 30-prompt ground truth Tea/Andrea co-authored

### Iter 28 P0
- Livello 3 VISUAL: 92 ground truth screenshots curated (Andrea + Tea iter 28-29)
- Livello 3 VISUAL bench: Pixtral 12B run su 92 esperimenti, output JSON broken_count + caveat list
- Reportback Andrea: lista esperimenti broken con file:line evidenza

### Iter 29 P0
- Livello 4 SIMULATOR: Playwright spec 92 esperimenti compile + run + LED check
- Livello 5 PEDAGOGICAL: 5 persona script + agent reviewer Mistral

### Iter 30-31 (Sprint T close)
- 5 livelli aggregato "Harness STRINGENT v2.0" → score 92 esperimenti onesto
- Gate iter 31 close: ≥80% esperimenti pass tutti 5 livelli, OR honest debt list documented

## Honest caveats Iter 27 P1

1. **5 livelli ALL impl iter 27 = NON realistico**: budget tempo 2-3 ore, distribuzione iter 28-31 imperativo
2. **Livello 1 TEXT BLOCKED ELAB_API_KEY** plaintext non retrievable Supabase secrets → workaround Vercel preview con bypass O Andrea fornisce key via secure channel
3. **Livello 3 VISUAL ground truth = DEBT 92 screenshot curated** mancanti — Andrea + Tea iter 28-29 effort
4. **Livello 4 SIMULATOR**: CircuitSolver bugs intrinsic (92 broken count nominale) — harness deve documentare BUGS non solo PASS/FAIL
5. **Livello 5 PEDAGOGICAL persona**: agent simulation ≠ utenti reali. Playtest LIM scuola pubblica con docente vero = ground truth definitivo, deferred Sprint U
6. **Cost projection**: ~$10 per full run 5-livelli 92 esperimenti × 30 prompt = budget realistico, ma scaling 10x = $100/iter, frugale per iter 27-31
7. **Pixtral 12B accuracy K-12 bench**: non documentato, judge LLM bias possibile, threshold empirico iter 28
8. **NO compiacenza**: agent harness STRINGENT MUST output debt list onestà, NON inflated PASS%

## Score iter 27 P1 estimate honest

Pre-iter 27: harness 2.0 self-claim 85/87 PASS = **inflated** (Livello 1 only, regex permissive)
Iter 27 P1 design close: harness STRINGENT v2.0 spec 5-livelli shipped (NO impl)
Iter 28-31 progressive impl: 5 livelli vivi su 92 esperimenti
Sprint T close iter 31 target: ≥80% PASS reali (5 livelli aggregato), OR honest debt list per <80%

**Gate Andrea ratify**: livello 3 VISUAL ground truth screenshots 92 → blocco iter 28 entrance senza Andrea + Tea co-author screenshot batch.

## Cross-reference

- iter 19 harness 2.0 PHASE 1 close audit (`docs/audits/iter-19-PHASE-1-audit-2026-04-29.md`) — context inflated
- iter 24 2 broken experiments investigation — pattern componenti mal disposti
- iter 25 SYSTEM MAP COMPLETE — 92 esperimenti enumeration
- ADR-027 Volumi narrative refactor schema — Vol/pag canonical map
- ADR-026 content-safety-guard runtime — Livello 1 safety branch

## Next iter 28 entrance

After v3.1 bench scale verify (iter 27 P0) + STRINGENT design ratify Andrea:
- Architect ADR-029 STRINGENT 5-livelli implementation plan
- Gen-test-opus Livello 3 Pixtral runner script
- Andrea + Tea screenshot 92 ground truth batch (iter 28-29 effort)
- Mac Mini D5 background dispatch persona simulation gen iter 29

