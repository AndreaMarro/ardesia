# Mission — Iter 68 ENTRANCE

**Created**: 2026-05-16 iter 67 PHASE 4 close (template)
**Iter**: 68 entrance (template — Andrea aggiorna prossima sessione)
**Appetite**: TBD (small 2-4h OR night appetite overnight OR cycle 2-3 days)

## Goal

Cascade lift iter 67 9.4/10 → 9.7+/10 ONESTO G45 via:
1. P0.1 1000q matrix re-verify post v55 deploy (Andrea ELAB_API_KEY provide)
2. R7 Lavagna Compile+Upload subagent BG dispatch (spec PHASE 1 §7 ready)
3. Atom 3 system-prompt v3.2 Sense 1.6 inject (BG post v55 100%)
4. PreToolUse hook block deploy unlim-chat senza `--no-verify-jwt` (prevent iter 67 PHASE 2 regression)
5. Matteo team integrate CLAUDE.md + brief vitest update
6. galileo-mcp drift investigate + legacy Galileo files dynamic imports grep + safe delete
7. Renesas docs purge Andrea ratify 3 options + subagent
8. 94 esperimenti Mac Mini delegate OR test-automator
9. Tea T1 Vol3 narrative review delegate (Andrea Mac Mini SSH OR Tea direct)
10. Codex plugin-cc Claude Code-side install (Andrea slash command sequence)

## Non-obiettivi

- NO modifica auth/licenze senza piano esplicito
- NO Vol3 narrative refactor (Davide co-author iter 70+ Sprint U close)
- NO Mistral Vibe install (defer iter 70+ Sprint U+ per Andrea ratify iter 67 PHASE 4)
- NO ELAB Quality Harness Phase 2 (Lighthouse + axe + Backstop + ZAP + Langfuse multi-iter Sprint V+)
- NO refactor non richiesti
- NO push diretto main
- NO `--no-verify` su commit

## Agent roles

- **Claude Code Opus**: orchestrator inline + audit + handoff + commit gate (Pattern S 11× consecutive single-agent inline iter 67)
- **Codex GPT-5.5 high**: Pattern C cross-check verify pre-deploy (`scripts/dev/codex-bg.sh verify`) + Pattern R review pre-PR + Pattern I implement worktree isolato
- **Mac Mini SSH ad-hoc**: PATH C dormant (Andrea attiva) Wiki batch + 94 esperimenti audit + Tea T1+T4
- **Subagent BG MacBook**: max 1-2 stessa worktree (Pattern S iter 65 lesson) — R7 + Atom 3 + Renesas dispatched isolated worktrees

## Definition of Done iter 68

- Vitest 13428+ PASS preserved (pre-commit hook gate)
- Build PASS (post-commit hook OR manual verify)
- Each P0 item shipped OR explicit defer rationale documented
- iter 68 audit + handoff iter 69 written
- Commit + push origin (Andrea ratify gate, NO autonomous push main)
- Honesty caveats critical 5+ bullets minimum
- G45 anti-inflation cap NO claim above 9.5 senza Opus indipendente review

## Task Ready iter 68 entrance (REFINED post iter 67 PHASE 5 strategic audit Andrea documento)

### Carryover iter 67 → 68 P0
1. Andrea provide ELAB_API_KEY plain (Vercel Dashboard fetch) + paste `/tmp/vercel.env`
2. Step 7 1000q matrix `node scripts/bench/run-1000-matrix.py` → 1000/1000 PASS preserve verify
3. Andrea Codex plugin-cc install slash command sequence (4 commands)
4. ✅ PreToolUse hook deploy unlim-chat SHIPPED iter 67 PHASE 4 (`guard-deploy-unlim-chat.sh`)
5. Matteo integrate (CLAUDE.md team section + `TEA/iter-58-brief-matteo.md` vitest 13118 → 13428)

### NEW iter 68 R7 refined atomization (post iter 67 PHASE 5 strategic ground truth)

**Discovery iter 67 PHASE 5**: iter 63 P0.5 `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` + `src/services/elab-agent/{server.js,sketch-builder.js}` ALREADY 70% implemented. R7 = COMPLETE iter 63, NOT rebuild.

**A0** Audit iter 63 P0.5 status (1h orchestrator inline iter 68 entrance):
- Verify spec `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` PROPOSED → ACCEPTED OR REJECTED
- Verify `server.js` 6 endpoint coverage vs spec §3.3 (/health /boards /compile /upload /compile-and-upload /jobs/:id)
- Verify `sketch-builder.js` `loadBoardProfile()` + `validateNoForbidden()` impl
- Verify `src/boards/arduino-nano-r4.json` exists OR create from spec §3.1

**A1.5** Create `src/boards/arduino-nano-r4.json` from spec §3.1 (30min if missing)

**A2** HTTP server binding Express/Fastify wrapper around server.js handlers (2-3h orchestrator inline):
- Express simple route `/agent/*` → server.js handlers
- Localhost-only 127.0.0.1:6789 (R4 compileAgentDetect port)
- CORS allowlist + token handshake

**A3** Lavagna UI Compile+Upload button wire to agent HTTP API (R7 refined, 4-6h subagent BG worktree isolato):
- `src/components/lavagna/CompileUploadButton.jsx` consume R4 detect + R5 banner pattern
- Click → POST `/agent/compile-and-upload` con Blockly arduinoGenerator output OR C++ editor
- Fallback installer modal R5 pattern se agent offline

**A6** PreToolUse hook forbidden patterns lint (1h extend iter 67 PHASE 4 hook):
- `scripts/agents/guard-forbidden-avr-patterns.sh` block edit con PORTB/DDRD/TCCR/atmega328p/avr/

**A7** Volume 3 capitoli inconsistency audit (2h):
- Repo state = **4 capitoli** (cap5/cap6/cap7/cap8) + 14 esperimenti
- Sito pubblico cita "10 capitoli" OR "12 capitoli" (Andrea documento §15.1)
- Andrea ratify canonical: (a) repo = 4 canonical + correggere sito OR (b) add cap1-4 lesson-paths intro/hardware/setup/programming-concepts

### Iter 69+ R7 continuum atomization (vedi docs/strategy/2026-05-16-iter-67-PHASE5-volume3-blockly-strategic-audit.md)

- A4 Volume 3 first-vertical-slice Blink v3-cap5-esp1 full pipeline (iter 69, 6h subagent BG)
- A5 Error translator 7 categories impl (iter 69, 4h)
- A8 Renesas RA4M1 docs purge 76 file (iter 69, Andrea ratify 3 options)
- A9 Volume 3 esperimenti integration full 14 esperimenti (iter 70-72, 10-15h subagent BG multi-iter)
- A10 Web Serial Monitor Seriale Chrome/Edge (iter 71, 4-6h subagent BG)
- A11 Manual Dream Protocol v1 prototype (iter 71 close, 3h orchestrator)
- A12+A13 Cross-platform installer + GPL-3.0 legal review (Sprint V+ blocker)
- A14 Mistral Vibe integration Red Team (Sprint V+ Andrea ratify)
- A15 ELAB Quality Harness Phase 1 (Sprint V+ Playwright cleanup + UX probes + Promptfoo smoke)

## Cross-link

- Iter 67 close audit: `docs/audits/2026-05-16-iter-67-PHASE3-CLOSE-audit.md`
- Iter 68 handoff template: `docs/handoff/2026-05-16-iter-67-to-iter-68-handoff.md` (PHASE 1, iter 68 entrance update needed)
- Strategic input doc Andrea: `docs/strategy/2026-05-16-multi-agent-war-room-strategic-plan.md` (TBD iter 68 if Phase 1 ROI verify)
