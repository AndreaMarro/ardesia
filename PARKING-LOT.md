# Parking Lot — Anti-inflation deferred ideas

> Provenance: 2026-05-15 iter 62 close. Per Andrea criteria max quality + min debito tecnico.
> Regola: feature interessante MA NON urgente → parking lot, NOT plan immediato. Riconsider trimestrale.

## Filosofia parking lot

Per ogni feature parcheggiata, riconsider quando:
1. Domanda esplicita docente (≥3 segnalazioni)
2. Pilot scuole feedback
3. Competitor differentiator measurable
4. Rimuove debito tecnico esistente
5. Prerequisito feature P0/P1 future

## CATEGORIA A — IDEE INTERESSANTI MA NON URGENTI

### A.1 — gRPC daemon mode Arduino CLI integration
- **Origin**: ELAB Compile/Upload Agent ADR §8 Roadmap "Futuro iter 80+"
- **Vantaggio**: NO parsing terminale output, integration più strutturata
- **Costo**: refactor Local Agent + maintenance gRPC stubs
- **Riconsider**: post 100+ scuole production deployment, performance bottleneck identificato

### A.2 — Multi-board support (Arduino UNO R4 Minima/WiFi + Mega + ESP32)
- **Origin**: Compile Agent generalizzazione potenziale
- **Vantaggio**: maggior compatibilità kit alternativi
- **Costo**: BoardProfile ×N + per-board test matrix
- **Riconsider**: Omaric kit aggiunge nuova board reale, OR scuole partner usano altre board

### A.3 — Library Manager UI (visual library installation)
- **Origin**: docente-friendly Arduino library install
- **Vantaggio**: docente non usa terminale per `arduino-cli lib install`
- **Costo**: UI complex + Arduino library registry browse
- **Riconsider**: docente reali segnalano blocker library install ≥3 segnalazioni

### A.4 — Auto-update agent (binary self-update)
- **Origin**: prodotto stabile maintenance
- **Vantaggio**: deploy fix senza Andrea push manuale
- **Costo**: signing + verifica + rollback + test
- **Riconsider**: post 50+ scuole Electron deploy

### A.5 — A4 Mistral SSE streaming
- **Origin**: iter 38 explicit defer Path B
- **Vantaggio**: latency perceived migliore (token streaming)
- **Costo**: 4h impl + breaks client parsing esistente
- **Riconsider**: latency p95 ≥3s sustained AND complaint docente ricorrente

### A.6 — A9 STT migration Voxtral Transcribe 2
- **Origin**: iter 38 ADR-031 PROPOSED
- **Vantaggio**: 100% Mistral EU stack + 4% WER FLEURS Italian K-12
- **Costo**: $0.003/min + impl + STT migration test matrix
- **Riconsider**: CF Whisper STT 3-shape input handler smoke FAIL prod, OR Mistral pricing change

### A.7 — A10 Onnipotenza Deno port 62-tool subset
- **Origin**: iter 38 PDR §4 cap mechanical trigger
- **Vantaggio**: Sprint T close 9.5/10 ONESTO conditional
- **Costo**: ~16h batch impl + per-tool integration test
- **Riconsider**: post pilot Q8 >30% lezioni Blockly/week soglia + Andrea ratify

### A.8 — A13 Canary 5%→25%→100% rollout (depends A10)
- **Origin**: iter 38 ADR-028 §7
- **Vantaggio**: rollout sicuro Onnipotenza completa
- **Riconsider**: post A.7 above

### A.9 — A16 Tres Jolie volumi audit ~600 LOC table per cap
- **Origin**: iter 32+ Andrea triplet coerenza Sense 2
- **Vantaggio**: trace coverage software ↔ kit ↔ volumi
- **Costo**: ~10-15h audit + reporting
- **Riconsider**: pre Davide Vol4 publish OR Omaric kit V2 release

### A.10 — Ralph Loop autonomous loop reactivation
- **Origin**: iter 42 cancellata (drained context)
- **Vantaggio**: autonomous overnight work Mac Mini
- **Costo**: Mac Mini reactivation prerequisite + cron cost
- **Riconsider**: post Mac Mini reactivation P0.7 + Andrea explicit request

### A.11 — Repository installation 13 GitHub URLs (full install vs evaluation only)
- **Origin**: 2026-05-15 PM Andrea
- **Vantaggio**: workflow tooling enrichment
- **Costo**: per-repo eval ~30 min × 13 = 6.5h + selective install ~4h
- **Riconsider**: iter 63 P3.3 evaluation phase decide install/skip per-repo

### A.12 — Custom GPT publication + Apps SDK + ChatKit embedded
- **Origin**: Tea PLAN-unlim-prof-pilot-chatgpt.md (35.9 KB make-plan iter 58)
- **Vantaggio**: distribution channel diversification
- **Costo**: ~40-60h impl + license + distribution channel maintenance
- **Riconsider**: pilot scuole feedback channel preference + Andrea ratify channel strategy

## CATEGORIA B — REFACTOR LARGE-SCOPE (defer fino mappa codebase)

### B.1 — CLAUDE.md project file split (4000+ righe → modular sections)
- **Origin**: file gigantic, hard to navigate
- **Vantaggio**: maintenance migliore
- **Costo**: refactor disruption + cross-link maintenance
- **Riconsider**: iter 63 P3.4 AGENTS.md + CLAUDE.md restructure (Shakacode pattern)

### B.2 — `automa/tasks/pending/` 46 atoms cleanup audit done/in-progress
- **Origin**: P4.1 in TASKS-RECOVERED
- **Vantaggio**: organizational hygiene
- **Costo**: ~30 min audit
- **Riconsider**: NOW iter 63 BG (low priority, no blocker)

### B.3 — Test organization restructure per `docs/test-organization.md`
- **Origin**: CLAUDE.md test organization philosophy "molti test ordinati"
- **Vantaggio**: faster test discovery + parallel execution
- **Costo**: refactor disruption + CI pipeline update
- **Riconsider**: vitest run >10min consistently OR coverage reporting needed

### B.4 — Worktree convention enforcement (rimuovere merged worktrees)
- **Origin**: CLAUDE.md "Worktree convention" section
- **List**: elab-builder-csp/ (merged), elab-builder-wireup/ (merged), elab-builder-fumetto/ (merged)
- **Costo**: 5 min `git worktree remove`
- **Riconsider**: NOW iter 63 BG hygiene (Andrea action)

## CATEGORIA C — FEATURES POTENZIALI (richiedono evidence prima impl)

### C.1 — Microsoft Teams + Google Classroom + Moodle integration
- **Origin**: Tea PLAN-unlim-prof-pilot-chatgpt.md mentions
- **Vantaggio**: distribution channel scuole italiane
- **Costo**: ~80-120h per LMS + privacy/GDPR review
- **Riconsider**: pilot scuole specific request OR sales requirement Giovanni

### C.2 — Dashboard amministrativa scuola (multi-classe + multi-docente)
- **Origin**: feedback dirigente scolastico potenziale
- **Vantaggio**: school-level adoption
- **Costo**: ~40-60h impl + Supabase RLS multi-tenant
- **Riconsider**: post 5+ scuole production + Andrea ratify

### C.3 — Mobile app docente companion (iOS+Android)
- **Origin**: docente preferenza tablet vs laptop in classe
- **Vantaggio**: alternative form factor
- **Costo**: ~120-200h React Native OR Flutter
- **Riconsider**: docente reali segnalano blocker laptop ≥3 segnalazioni OR pilot scuole iPad-only

### C.4 — Voice cloning student personalizzato (Tea/Davide alternative voce)
- **Origin**: iter 31+ voice clone Andrea LIVE; Davide alternative pending
- **Vantaggio**: variety voce narratore
- **Costo**: minimo (Voxtral API)
- **Riconsider**: docente request voce diversa OR audio Davide capture done

### C.5 — Student progress export PDF report
- **Origin**: docente reporting need (Tea idee)
- **Vantaggio**: parent communication
- **Costo**: ~10-15h impl + PDF template design
- **Riconsider**: pilot scuole specific request

### C.6 — Reverse engineering game expansion (4 giochi → 8 giochi)
- **Origin**: CLAUDE.md "4 giochi didattici" baseline
- **Vantaggio**: gamification engagement
- **Costo**: ~20-30h per gioco + UAT classe
- **Riconsider**: telemetry shows ≥40% docenti use giochi attualmente

## CATEGORIA D — RICERCA ESPLORATIVA

### D.1 — Anthropic Claude Dreams nightly memory consolidation
- **Origin**: Tea PLAN Phase 0 documentation discovery
- **Vantaggio**: per-classe memory weekly consolidation
- **Costo**: research + impl + scheduling
- **Riconsider**: managed memory Bedrock EU GA + Andrea ratify

### D.2 — llmwiki local knowledge base integration
- **Origin**: Andrea 2026-05-15 PM repo URL
- **Vantaggio**: indexed local docs + MCP integration
- **Costo**: research + setup
- **Riconsider**: P3.3 evaluation iter 63

### D.3 — gsd-2 context engineering integration
- **Origin**: Andrea 2026-05-15 PM repo URL
- **Vantaggio**: context engineering pattern
- **Costo**: research + integration
- **Riconsider**: P3.3 evaluation iter 63

## REGOLA NUOVA INFLAZIONE GUARD

Quando una nuova feature viene proposta:
1. Quale categoria parking lot? (A/B/C/D)
2. Quali criteri riconsider? (esplicitare ≥1)
3. Cosa NON facciamo invece (trade-off opportunity cost)?
4. Mantenibilità chi (Andrea/Tea/Codex)?
5. Test plan mandatory?

Se rispondi "uncertain" a ≥2 → parking lot.

## Cross-link

- `TASKS-RECOVERED.md` (active backlog P0-P4)
- `SESSION-NEXT-ACTIVATION.md` ANTI-INFLAZIONE section
- `docs/audits/2026-05-15-iter-62-CLOSE-audit.md` (G45 anti-inflation cap precedent)
