# Iter 89 master plan — Andrea ratify deploy + indipendente review + critique re-run + 4 P1 atoms

**Date**: 2026-05-19 (post iter 88 commit `b8eae27d` LOCAL + brutal review audit)
**Branch**: `feat/elab-scratch-blockly-roundtrip-nanor4` worktree A
**Score iter 88 close ONESTO G45**: 9.2/10 work artifact / 5.5/10 user impact (prod = iter 87 PHASE 4c baseline UNCHANGED senza Andrea deploy)
**Target iter 89 close**: 9.5+/10 ONESTO conditional Andrea P0 actions + indipendente review + critique 22/40 → 30/40+ verify

---

## §1 P0 IMMEDIATE Andrea actions (5min terminale)

Sequenza paste-ready iter 89 entrance:

```bash
# 1. Push origin iter 88 commit batch
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-iter83-A"
git push origin feat/elab-scratch-blockly-roundtrip-nanor4

# 2. Vercel deploy verify (auto via GitHub Actions OR manual)
npx vercel --prod --yes

# 3. Hard reload prod verify UX changes LIVE
# Browser: https://www.elabtutor.school/#compile-home
# Cmd+Shift+R hard reload (PWA SW cache)
# Verifica empirico:
#   - Footer NEW copy "Compila il programma per l'Arduino Nano R4 del kit ELAB ... browser Chrome o Edge (su computer, non tablet)"
#   - NO "Editor Codice" + A-/A+ in C++ tab (compact)
#   - Banner border 1px softer Lime
#   - ProgramExplainer "Cosa fa questo programma?" collapsibile sopra editor
#   - HomeCompileOnboarding 5-step tour first-render (Cmd+Shift+R clears localStorage)
```

---

## §2 P0 Independent verify post-deploy (~30min)

### §2.1 Claude in Chrome empirical re-test iter 88 deployed

Replay sweep `https://www.elabtutor.school/#compile-home` post Vercel deploy:
- Verify footer NEW copy "Arduino Nano R4 del kit ELAB" + "Chrome o Edge (computer, non tablet)" + no "Renesas RA4M1"
- Verify Onboarding overlay first-render (clear localStorage `elab.compile.onboarded`)
- Click C++ tab → verify NO "Editor Codice" + NO A-/A+ font zoom
- ProgramExplainer "Cosa fa questo programma?" collapsibile visibile sopra editor
- CompileUploadButton state visuals — clicca Compila + verify breath animation Lime → ready
- WebUsbBanner copy verify Safari/Firefox NEW "non va bene per il Compilatore"

### §2.2 Independent review verdict acquire

- Option A: `comprehensive-review:code-reviewer` subagent (Claude Code internal — NOT Codex file-dump)
- Option B: `codex exec review` interactive mode (NON BG — avoid file-dump pattern)
- Option C: User manual review against PHASE 1+2 close audit docs

### §2.3 `/impeccable:critique` re-run baseline 22/40 → ≥30/40

Target Nielsen lift via iter 88 atoms:
- #2 Match real world: 2→3 (UX-2 jargon rewrite Renesas/WebUSB → Italian friendly)
- #6 Recognition rather than recall: 2→3 (UX-1 compact + UX-7 ProgramExplainer plain language)
- #8 Aesthetic & Minimalist: 3→4 (UX-1 distill + UX-4 quieter banner)
- #10 Help & Documentation: 1→3 (UX-3 onboarding tour + UX-7 ProgramExplainer)

Expected lift: 22 → 30-32 ONESTO. NOT 40/40 (UX-4 holistic + #4 Consistency + #7 Flexibility + #9 Recovery iter 90+ scope).

### §2.4 Build full pre-commit gate (~14min)

`npm run build` verify Vite + obfuscator clean compile post-iter-88 imports (ProgramExplainer + HomeCompileOnboarding lazy + CompileUploadButton.module.css NEW).

---

## §3 P1 IMMEDIATE iter 89 inline atoms (~3-4h)

### §3.1 Atom 89.A1 — VetrinaSimulatore.jsx jargon fix (~5min)

File: `src/components/VetrinaSimulatore.jsx:45`
Before: `desc: 'Scrivi codice C++ e flashalo sul simulatore ATmega328p'`
After: `desc: 'Scrivete codice C++ e caricatelo sul simulatore Arduino'`
UX-2 scope extension (Andrea critique #2 system-wide jargon mandate).

### §3.2 Atom 89.A2 — ProgramExplainer templateKey dynamic detect (~2h)

File: `src/components/home/ProgramExplainer.jsx`
Add prop `experimentId?: string` → lookup `volume-references.js` → derive templateKey OR scratchCode first comment line `// Vol3 Cap.6 Esp.1 — Blink sul pin 13 del Nano R4 ELAB` → match `blink-led|button|sensor` regex.
HomeCompileEntry.jsx wire: pass current loaded template/experiment context.
6+ NEW tests dynamic detect.

### §3.3 Atom 89.A3 — CompileUploadButton uploadState consumer wire (~2h)

Files:
- `src/components/simulator/NewElabSimulator.jsx` — propagate uploadState from compile chain to CompileUploadButton via prop
- `src/components/lavagna/LavagnaShell.jsx` — same
Build state machine: idle (no compile) → armed (compile success no device) → ready (device picked) → uploading (DFU in progress) → success → error
8+ NEW integration tests.

### §3.4 Atom 89.A4 — SEC-1 ship Option C HYBRID rate limit only (~1.5h)

File: `src/services/elab-agent/http-server.js`
- Install `express-rate-limit` npm (Andrea regola 13 ratify)
- Add middleware: 10 req/min per-IP for `/compile` + `/upload` + `/compile-and-upload` endpoints
- `/health` NOT rate limited (cron warmup safety)
- 5+ NEW unit tests `tests/unit/services/elab-agent/http-server-rate-limit.test.js`
- Andrea ratify Option C decision PRIMA dispatch (see SEC-1 DECISION doc)

---

## §4 P1 SEC-1 mandates 4-6 (defer iter 90 Option A full OR docs aspirational)

Per SEC-1 DECISION doc `docs/audits/2026-05-19-iter-88-SEC-1-DECISION-elab-agent-security-mandates.md`:
- Mandate 4 auth Bearer token (~1h)
- Mandate 5 sketch size 100KB explicit validate (~30min)
- Mandate 6 sandbox cleanup already present (verify only ~15min)

If Andrea Option A iter 89 → ship tutti 3 atomi simultanei. If Option C iter 89 → ship rate limit only + docs aspirational mandate 4+5 iter 90.

---

## §5 P2 Sprint U Riccardo demo gate hardware UAT

### §5.1 Atom 89.G1 — Andrea schedule UAT Nano R4 USB

- Andrea + Tea + Riccardo + Omaric kit Strambino
- Verify chain Step 8 physical board DFU flash success
- VERIFY-2 Mock USB E2E spec ready iter 88 (756+561+118 LOC) — Andrea ratify Playwright exec ~5min
- LOCAL Agent LIVE + Cloud Render LIVE (both empirico iter 88 VERIFY-1)

### §5.2 Atom 89.G2 — Demo Riccardo screencast capture

Per iter 88 SPEC §7 88.GOV-2 Andrea capture screencast cloud-compile-only Nano R4 chain LIVE iter 88 deployed + invia Riccardo Omaric `ufficiotecnico@omaricelettronica.com`.

---

## §6 P2 carryover iter 89-90 Sprint U close gate

- **94 esperimenti Playwright UNO PER UNO audit** (Andrea iter 21+ Sprint U close gate carryover 60+ iter)
- **UX-4 holistic redesign** Sprint V+ (multi-element competing Lime accent stack — banner border + icon + version + buttonSecondary outline + Compila button + status text)
- **Vol3 narrative refactor ADR-027** (Davide co-author iter 33+ deferred)
- **CompileUploadButton uploadState consumers complete iter 89 A3 follow-up**
- **ProgramExplainer extend EXPLAINERS map** (blink-led + read-button + read-sensor + nuove templates via volume-references.js iter 90+)
- **Mistral Vibe CLI Red Team integration** Sprint V+ (iter 67 PHASE 4 deferred)
- **ELAB Quality Harness Phase 1+2** Sprint V+ (Lighthouse + axe + Promptfoo + DeepEval iter 70-72+)

---

## §7 Sprint U close projection iter 90-92

**9.5-9.7/10 ONESTO** conditional:
- iter 89 P0 closed (push + deploy + critique + indipendente review)
- iter 89 P1 ship (4 atoms VetrinaSimulatore + ProgramExplainer dynamic + CompileUploadButton consumer + SEC-1 Option C)
- Hardware UAT Nano R4 USB verified Andrea/Tea/Riccardo
- 94 esperimenti audit completion (iter 21+ mandate)
- Opus indipendente review G45 mandate (NOT auto-claim, deferred iter 90+)

**Critical path**: Andrea actions (push + deploy + ratify SEC-1 + hardware UAT) = primary blocker. Tutto lavoro tecnico iter 88 SHIPPED LOCAL — bottleneck = Andrea ratify execution.

---

## §8 Risk register

| Risk | Severity | Mitigazione |
|---|---|---|
| Vercel deploy fails post push (Vite + obfuscator) | HIGH | Build full pre-commit hook gate iter 89 entrance |
| Onboarding overlay confuses primo accesso docente | MED | Andrea Cmd+Shift+R + verify "Salta tour" prominente + first-time UX test Tea iter 89+ |
| ProgramExplainer templateKey statico "blink-led" mismatch loaded experiment | LOW | Atom 89.A2 dynamic detect iter 89 ship |
| CompileUploadButton state visuals NOT visible (consumer NOT wired) | MED | Atom 89.A3 NewElabSimulator + LavagnaShell propagate iter 89 ship |
| Independent review verdict NOT acquired (Codex file-dump iter 88 carryover) | MED | Comprehensive-review:code-reviewer subagent dispatch iter 89 P0 |
| Critique 22/40 → 30/40+ NOT achieved post deploy | LOW | Re-run + honest fallback 25-28/40 cap if UX-4 holistic deferred |
| Hardware UAT pending blocks Sprint U Riccardo demo | HIGH | Andrea schedule Tea+Riccardo+Omaric iter 89 P1 critical |

---

## §9 Anti-inflation G45 mandate iter 89 enforced

- Cap **9.5/10** ONESTO conditional ALL iter 89 P0 + P1 actions closed
- NO claim "Sprint U close" senza iter 90+ Opus indipendente + 94 esperimenti audit
- NO claim "Nielsen ≥30/40 lift" senza /impeccable:critique re-run empirico
- NO claim "iter 88 USER IMPACT LIVE" senza Andrea push + Vercel deploy + Claude in Chrome re-verify
- NO claim "hardware UAT verified" senza Andrea/Tea/Riccardo schedule
- Honest acknowledgment: iter 88 work artifact 9.2/10 MA user impact 0/10 senza Andrea ratify deploy chain

---

## §10 Cross-link docs iter 89 master plan

- This master plan: `docs/plans/2026-05-19-iter-89-master-plan.md`
- iter 88 BRUTAL review: `docs/audits/2026-05-19-iter-88-BRUTAL-REVIEW-audit.md`
- iter 88 PHASE 1 close: `docs/audits/2026-05-19-iter-88-PHASE1-CLOSE-audit.md`
- iter 88 PHASE 2 close: `docs/audits/2026-05-19-iter-88-PHASE2-CLOSE-audit.md`
- iter 88 SPEC: `docs/specs/2026-05-18-iter-88-ux-cleanup-cross-compile-spec.md`
- iter 88 → iter 89 handoff: `docs/handoff/2026-05-19-iter-88-to-iter-89-handoff.md`
- iter 87 PHASE 4c critique baseline 22/40: `docs/audits/2026-05-18-iter-87-PHASE4c-impeccable-critique.md`
- SEC-1 DECISION: `docs/audits/2026-05-19-iter-88-SEC-1-DECISION-elab-agent-security-mandates.md`

© Andrea Marro — 2026-05-19 — ELAB Tutor iter 89 master plan
