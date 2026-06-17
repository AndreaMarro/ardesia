# SUNTO Sessione 22-23 Aprile 2026 — OpenClaw Onnipotenza Morfica

**Durata:** ~16h (stress test prod + P0/P1 fix + security hardening + PDR Sett 5 design)
**Output:** PR #25 aperto con 11 file (3.752 + 465 righe), fix registry handler bug, architettura 3-layer documentata.

---

## Quello che Andrea ha detto (sintesi concettuale)

### Priorità ordinate (come Andrea ragiona)
1. **Architettura prima, vendita dopo.** Scuole paganti → dopo. Prima il sistema deve essere onnipotente, onnisciente, morfico, GDPR-pulito, Principio Zero v3 rispettato.
2. **Principio Zero v3:** UNLIM parla ai RAGAZZI, non al docente. Cita Vol.X pag.Y. No meta-istruzioni. Linguaggio bambino 8-14, max 60 parole.
3. **Onnipotenza reale:** tool-use su ~80 tool (oggi 52), dispatcher runtime, PZ v3 enforcement pairing.
4. **Morficità controllata:** L1 composition + L2 template + L3 flag-DEV. Generazione tool con algoritmi/incroci intelligenti. Memoria tool con riuso + GC.
5. **Economia solo-dev:** oggi €20-50/mese infra. Nessun GPU mensile premature. Solo orarie weekend €15-20.
6. **GPU VPS a ore (subito):** provare questo weekend per capire scaling path.
7. **Together AI fallback:** batch + teacher-context + emergency. MAI student runtime (GDPR).
8. **Multilingue:** IT primary production, EN/ES/FR/DE ready come infra (stub regex).
9. **Agent team orchestrato in CLI:** Planner/Generator/Evaluator già attivi (`.claude/agents/`). Estendere con wshobson-inspired architettura.
10. **Massima onestà:** no inflazione numerica, no compiacere, no hype.

### Cose specifiche volute
- OpenClaw come cervello + scheletro UNLIM (pilotaggio, ascolto, visione, voce)
- Generare nuovi tool a runtime con memoria riuso/cancella
- Non sprecare lavoro loop Sett-4 (Wiki POC)
- Vendibile a Giovanni Fagherazzi (grande nerd + sales)
- Scalabile quando arriverà il traffico
- Deve FAR GUADAGNARE ma non è priorità immediata

---

## Quello che è stato FATTO (verificabile)

### Produzione live (PR separati, già merged)
- P0 PWA stale precache hotfix (3-layer: inline safety + controllerchange + workbox)
- UNLIM `&quot;` literal fix
- WakeWord log flood fix
- `/health` HEAD → GET
- `<h1>` lavagna visible-hidden
- Supabase primary switch (X-Elab-Api-Key enforcement)
- CSP SHA-256 hash inline script
- Vercel deploy pipeline fix (`vercel pull` + `vercel build --prebuilt`)

### Architettura PR #25 (branch feature/pdr-sett5-openclaw-onnipotenza-morfica-v4)
- `scripts/openclaw/tools-registry.ts` — 52 ToolSpec (ora con status metadata)
- `scripts/openclaw/morphic-generator.ts` — L1 composition + L2 template + L3 flag-DEV
- `scripts/openclaw/pz-v3-validator.ts` — IT production + EN/ES/FR/DE stub
- `scripts/openclaw/tool-memory.ts` — Supabase pgvector + GC + MIGRATION_SQL
- `scripts/openclaw/state-snapshot-aggregator.ts` — parallel fetch, integra Sett-4 Wiki POC
- `scripts/openclaw/together-teacher-mode.ts` — GDPR gated (3 modes, student BLOCK)
- `docs/architectures/pdr-sett5-openclaw-onnipotenza-morfica-v4.md` — master architettura
- `docs/architectures/openclaw-registry-v2-3-layer.md` — Layer A+B+C doc
- `docs/business/revenue-model-elab-2026.md` — break-even Stage 2b
- `docs/audits/2026-04-22-openclaw-plan-honest-check.md` — audit 7.2/10

### Bug trovato + corretto post-commit
42 handler path puntavano a `unlim.X` ma solo 5 metodi esistono sotto quel namespace. Fix applicato commit `0f39d3c` + aggiunto `auditRegistry()` runtime check.

---

## Quello che NON è stato fatto (onesto)

- **Test unitari:** 0 righe nei nuovi file OpenClaw. Target Sprint 6 Day 36 = ~800 righe.
- **11 handler TODO_sett5:** `speakTTS`, `listenSTT`, `saveSessionMemory`, `recallPastSession`, `showNudge`, `generateQuiz`, `exportFumetto`, `videoLoad`, `alertDocente`, `toggleDrawing`, `analyzeImage` (composite).
- **Registry espansione 52 → 80:** aggiungere missing Layer A tool + composites (diagnoseCircuit, walkThroughExperiment, blinkLedPattern, focusOn, experimentsByConcept).
- **Dispatcher:** non ancora importato da `src/`. Scritto come spec, non ancora cablato.
- **Supabase migrations:** SQL strings presenti ma NON applicate allo staging.
- **GPU VPS benchmark:** weekend da prenotare. Budget €15-20.
- **Agent team CLI:** triade Planner/Generator/Evaluator già attiva. Estensione con architect/security-auditor/performance-engineer da valutare.
- **Multilingue live test:** zero prompt reali EN/ES/FR/DE validati.

---

## Vincoli immutabili rispettati

- **GDPR:** EU-only runtime (Supabase FR, Scaleway FR, Hetzner DE). Together AI SOLO batch + teacher + emergency. MAI student runtime. Dati minori mai fuori EU.
- **Principio Zero v3:** validator regex multilingue. Integrazione middleware in dispatcher (Sprint 6 Day 39). BASE_PROMPT già rispetta v3 (verificato live 18/04).
- **Linguaggio bambino 8-14:** max 60 parole, 3 frasi + 1 analogia, cita volumi fisici.
- **Zero modifiche a `main`:** tutto su branch feature.
- **Zero nuove dipendenze npm.**
- **Zero dati finti/demo** (regola immutabile CLAUDE.md).
- **Baseline test non regredito:** 12.235 locale (branch) vs 12.371 su main (loop avanti).

---

## Decisioni economiche prese

| Decisione                                      | Motivo                                                               |
|-----------------------------------------------|----------------------------------------------------------------------|
| No Hetzner GEX44 mensile (€187/m) oggi        | Premature. 0 scuole paganti. €187 × 12 = €2.244/anno senza ricavi    |
| Sì GPU orarie weekend (€15-20)                | Benchmark reale Qwen 14B/72B/VL 7B + Voxtral TTS + BGE-M3            |
| Sì Together AI batch (once, $0,07)            | Wiki LLM corpus ingest una-tantum, poi Supabase pgvector             |
| Sì Supabase free tier + upgrade on 1ª scuola  | €0 oggi, €25 Pro quando serve                                         |
| No Vercel Pro (resta Hobby)                   | Limiti Hobby ancora sufficienti                                      |
| Sì Render nanobot Free (cold start accettabile)| Warmup già implementato                                              |

---

## Prossime 3 azioni (ordine prioritario)

1. **Riavvia loop CLI con Sprint 6 OpenClaw L1 Live** (vedi piano `2026-04-23-openclaw-sprint6-l1-live.md`)
2. **Weekend prossimo:** GPU VPS benchmark (€15-20, vedi piano `2026-04-26-gpu-vps-weekend-benchmark.md`)
3. **Dopo Sprint 6:** agent team CLI orchestration scale-up (vedi piano `2026-04-30-agent-team-cli-orchestration.md`)

Nessuna azione di vendita nella pipeline immediata, come richiesto da Andrea.
