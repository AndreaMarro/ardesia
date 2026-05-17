# Handoff iter 78 close → iter 79 entrance

**Data**: 2026-05-17 sera
**Branch remote HEAD**: `d990d329` (feat/iter-41-sprint-u-cycle-2-real-user-fix)
**Vitest baseline**: **14452 PASS** + 15 skip + 11 todo (358 Test Files PASS)
**Build prod**: PASS 3m43s + 26 precache 1238 KiB
**Cloud Render LIVE**: https://elab-cloud-compile.onrender.com (Standard 2GB Frankfurt)
**Vercel LIVE**: https://elab-tutor-4saq57r6f-andreas-projects-6d4e9791.vercel.app (Production Ready)
**Score iter 78 close ONESTO G45 cap**: **8.9/10**

## §1 ACTIVATION STRING iter 79 paste-ready Andrea

```
Iter 79 ENTRANCE — Sprint U continuation post iter 78 web-dfu MVP LIVE prod.

CONTEXT iter 78 close:
- iter 77 PHASE 4 + 3 STOP-HOOK fixes + iter 78 web-dfu MVP all shipped
- 16 commits cumulative iter 76+77+78 pushed origin branch feat/iter-41
- Cloud Render LIVE elab-cloud-compile.onrender.com Standard 2GB
- Vercel LIVE elab-tutor-4saq57r6f-...vercel.app frontend prod
- LOCAL agent localhost:8765 still operational dev/Andrea
- Vitest 14452 PASS (+31 iter 78 NEW)
- npm audit 0 vulnerabilities
- E2E roundtrip Cloud→parser→mock DFU 39056 byte integrity proven empirico

Codex Pattern V/C 2 loops iter 78 completed:
  - Pattern V design BG btj6npmvo: 5 critical findings pre-impl consumed
  - Pattern C review BG bo6oo4fxm: P0 fixes shipped (async error resolve + 60s timeout + EOF/256KB/overlap guards)

Andrea Q queue gruppo 15 iter 79 entrance (5 decisions needed):
- A. Hardware UAT Nano R4 fisico schedule (Andrea + Tea + Riccardo + kit Omaric)?
- B. Readback verify iter 79+ implement UPLOAD readback path (~4h scope)?
- C. WebUSB filter narrow productId 0x0070 post hardware verify?
- D. Render warm-keep cron iter 79 (avoid 39s cold compile)?
- E. Visible badge UI FLASH_COMPLETE_SIMULATED + FLASH_SUCCESS_REAL states (~2h)?

P0 iter 79 cascade (target 8.9 → 9.2+/10):
1. Hardware UAT real Nano R4 (PRIMARY iter 79 gate)
2. Readback verify UPLOAD command + byte-compare
3. WebUSB filter narrow productId
4. Render warm-keep cron OR Render hibernation tweak
5. Visible badge UI flash mode (data-attr alone insufficient per Codex)
6. ScratchCompileBar add visible flash mode indicator
7. Strict mock mode (stall on invalid + state validation + block-order check)
8. Legacy non-demo path CompileUploadButton:440 refactor (still claims "Caricato sul kit" without web-dfu evidence)
9. CompileAgentBanner legacy decommission (WebUsbBanner default verified iter 77)
10. iter 76 D.5 Mock USBDevice Playwright E2E spec extend with FLASH states
```

## §2 Setup steps Andrea iter 79 entrance (5 min)

1. `cd /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder && git pull origin feat/iter-41-sprint-u-cycle-2-real-user-fix`
2. Verify LOCAL Compile Agent: `curl -s localhost:8765/health | python3 -m json.tool`
3. Verify Cloud Render: `curl -s https://elab-cloud-compile.onrender.com/health | python3 -m json.tool`
4. Verify Vercel: `open https://elab-tutor-4saq57r6f-andreas-projects-6d4e9791.vercel.app`
5. Verify Vitest: `npx vitest run --reporter=basic 2>&1 | tail -5` (expected 14452 PASS)
6. Andrea action: physical Nano R4 → `system_profiler SPUSBDataType | grep -A 5 -i nano` (capture productId)
7. Andrea action: WebUSB picker verify Chrome browser real device picker shows mock vs real entry

## §3 Iter 79 P0 detailed priorities

### P0.1 Hardware UAT real Nano R4 (Tea + Riccardo + Andrea)

**Primary gate**: scientifically valid simulation = code path verified. Real hardware = end-user trust verified.

**Action items**:
- Tea + Riccardo: kit Omaric Nano R4 shipping coordination Andrea
- Andrea: double-tap reset bootloader procedure documentation iter 79 D.6
- Real flash test: Cloud compile Blink → WebUSB picker real device → flashDfuFirmware → verify LED blink
- Codex Pattern C review FLASH_SUCCESS_REAL state evidence
- HW UAT acceptance criteria:
  - Real Nano R4 in DFU bootloader mode (double-tap reset)
  - WebUSB picker shows "Arduino Nano R4" with vendor 0x2341 product 0x0070 (verify)
  - flashDfuFirmware returns ok=true mode='real'
  - Physical LED D13 blinks 500ms ON/OFF cycle
  - Honest message displayed: "Caricamento reale: trasferimento DFU completato"
  - Iter 79+ readback verify `verified: true` after UPLOAD compare

**Effort**: 1-2h Andrea+Tea+Riccardo session iter 79 P0.

### P0.2 Readback verify UPLOAD command

Codex P0 finding: `verified: false` always in MVP — "Calling it 'verify' without read-back is dishonest."

**Implementation**:
- `webdfu.read(transferSize, maxSize)` returns WebDFUProcessRead with `events.on('end', blob)`
- Adapter `verifyFlash(device, originalBinary)`: read back bytes + byte-compare
- Update FlashResult `verified: true` ONLY if comparison passes
- Add `verifyFlashEnabled` opt (default true post iter 79)
- Iter 79 test: mock returns same bytes via UPLOAD → verified=true asserted

**Effort**: ~4h orchestrator inline iter 79.

### P0.3 WebUSB filter narrow productId

Post Andrea `system_profiler` capture iter 79 P0.1:
- Update `src/services/webUsbDetect.js:34` `NANO_R4_USB_FILTERS = [{vendorId: 0x2341, productId: 0xXXXX}]`
- Test WebUSB picker shows ONLY Nano R4 (not all Arduino devices)
- Backup productId fallback if Arduino changes (`[0x0070, 0x0069]`)

**Effort**: ~30min post hardware verify.

### P0.4 Render warm-keep cron

Current: cold start 39s first compile (Render Standard hibernates idle services).
Riccardo demo: 39s wait unacceptable.

**Implementation**:
- pg_cron in Supabase OR external service ping `/health` every 5min
- OR Render keep-alive add-on $5/mo
- OR cloudflare worker scheduled trigger

**Effort**: ~1h.

### P0.5 Visible badge UI flash mode

Codex P0 finding: data-attr insufficient, needs visible UI element.

**Implementation**:
- CompileUploadButton render badge when state in FLASH_SUCCESS_REAL / FLASH_COMPLETE_SIMULATED
- Real: green badge "✓ Caricato reale" (icon SVG CheckIcon, Lime color)
- Simulated: orange badge "Simulazione DFU" (icon WarningIcon, Orange color)
- ARIA aria-label includes mode word
- Tests T14+T15 assert badge visible + correct color + text

**Effort**: ~2h.

### P0.6 Codex Pattern V/C continuous loops iter 79

Per Andrea iter 78 mandate "fai loop codex":
- Pattern V design phase BEFORE each major atom (caught 5 critical iter 78)
- Pattern C review phase AFTER each major atom (caught P0 hang iter 78)
- Document findings + ship fixes inline
- Repeat per iter 79 P0.1+P0.2+P0.5 atoms

**Effort**: ~6min per dispatch (Codex CLI GPT-5.5 high).

## §4 Tech debt iter 79+ priorities (BG A.5 audit iter 77 carryover)

| P# | Item | Effort | ROI |
|---|---|---|---|
| P0 | CompileUploadButton legacy line 440 "Caricato sul kit" claim refactor | 1h | High (honest contract iter 79) |
| P0 | CompileAgentBanner decommission (replaced WebUsbBanner iter 77) | 30min | Medium (debt reduction) |
| P1 | Mock DFU strict mode (stall on invalid requests) | 3h | High (iter 79 hardware UAT integrity) |
| P1 | God classes refactor (TeacherDashboard 3484 LOC, SimulatorCanvas 3173 LOC, experiments-vol1 6860 LOC) | 12h iter 80+ | Medium |
| P1 | ADR-028 PROPOSED → ACCEPTED (40 iter pending) | 30min Andrea ratify | High (decision-making chain) |
| P2 | CLAUDE.md 3393 LOC split (history archive vs principles) | 2h | Medium (context window pollution) |
| P2 | Codex iter 78 Pattern C findings remaining (overlap warnings + recipient validation + busy timing) | 4h | Medium iter 80+ |

## §5 Iter 78 deliverables summary

### Commits iter 78
- `d990d329` feat(iter-78-B.2): WebUSB DFU flash chain MVP — 12 files +1677 -45 LOC

### Files NEW iter 78 (5)
- `src/services/intelHexParser.js` (~250 LOC + 6 record types + production guards)
- `src/services/webDfuFlash.js` (~270 LOC + event-driven + 60s timeout + safeResolve)
- `src/services/mockUsbDfuDevice.js` (~310 LOC + full DFU 1.1 emulator)
- `tests/unit/services/intelHexParser.test.js` (12 tests)
- `tests/unit/services/webDfuFlash.test.js` (19 tests)
- `docs/audits/2026-05-17-iter-78-WEB-DFU-FLASH-CHAIN-close-audit.md` (~400 LOC)

### Files MOD iter 78 (5)
- `package.json` + `package-lock.json` (dfu@0.1.5 + nanoevents@^6 deps)
- `src/components/lavagna/CompileUploadButton.jsx` (FLASHING + FLASH_SUCCESS_REAL + FLASH_COMPLETE_SIMULATED + FLASH_ERROR states + flash chain wire)
- `tests/unit/components/lavagna/CompileUploadButton.test.jsx` (T10 update assertion flash_complete_simulated)
- `tests/e2e/05-cross-compile-mock-board.spec.js` + `tests/e2e/helpers/webusb-mock.js` (BG A.3 iter 77 follow-up)

### Tests delta iter 78
- Vitest: 14421 (iter 77) → **14452** (+31 NEW)
- Build: PASS 3m43s + 26 precache 1238 KiB
- npm audit: 0 vulnerabilities

### Codex loops iter 78
- Pattern V design BG `btj6npmvo`: 5 critical findings pre-impl
- Pattern C review BG `bo6oo4fxm`: P0 fixes shipped

## §6 Honesty caveats critical iter 78 → iter 79 (8 bullets)

1. **Simulated NOT real flash** — mock DFU acknowledges protocol but no physical NOR write
2. **No readback verification** — `verified: false` always iter 78 MVP, iter 79 P0.2 scope
3. **Renesas RA4M1 may use DfuSe (protocol 0x02) NOT standard DFU 1.1** — mock assumes 0x01, real hardware verify iter 79
4. **Manifestation tolerance** — mock uses tolerant=true, real Nano R4 bootloader may require re-enumeration
5. **WebUSB Nano R4 productId placeholder** — filter vendor-broad 0x2341 iter 78, narrow 0x0070 iter 79 post Andrea verify
6. **Cold Render compile 39s** — Render Standard hibernates idle, iter 79 warm-keep cron
7. **Mock strict mode iter 79+** — current mock acks unknown requests with 'ok' (should stall) — iter 79 P1 strict mode
8. **Legacy CompileUploadButton:440 path** — still claims "Caricato sul kit" without web-dfu evidence — iter 79 P0 refactor

## §7 Sprint U close projection iter 80+

**9.5/10 ONESTO** conditional:
- Hardware UAT real Nano R4 verified iter 79
- Readback verify shipped + tested iter 79
- Render warm-keep cron iter 79
- Visible badge UI iter 79
- Strict mock mode iter 79
- Legacy "Caricato" refactor iter 79
- Iter 80 close audit + Sprint U close gate

## §8 Cross-link docs iter 78

- Close audit: `docs/audits/2026-05-17-iter-78-WEB-DFU-FLASH-CHAIN-close-audit.md`
- iter 77 PHASE 4 audit: `docs/audits/2026-05-17-iter-77-PHASE4-CLOSE-audit.md`
- BG A.4 web-dfu research: `docs/research/2026-05-17-iter-77-A4-web-dfu-library-research.md`
- BG A.5 tech debt: `docs/audits/2026-05-17-iter-77-A5-tech-debt-comprehensive-audit.md`
- Cross-compile SPEC iter 76: `docs/specs/2026-05-17-iter-76-CROSS-COMPILE-CERTAINTY-WITHOUT-BOARD-SPEC.md`
- Riccardo demo script: `docs/hardware/2026-05-17-iter-76-riccardo-demo-script.md`
- OpenAPI 3.1: `infra/cloud-compile/openapi.yaml`
- Intel HEX parser: `src/services/intelHexParser.js`
- WebDfuFlash adapter: `src/services/webDfuFlash.js`
- Mock DFU emulator: `src/services/mockUsbDfuDevice.js`
- Codex BG outputs: `/tmp/codex-*.txt` (sandbox EPERM write — captured inline conversation)

© Andrea Marro — 2026-05-17 — ELAB Tutor iter 78 web-dfu flash chain MVP close → iter 79 hardware UAT entrance
