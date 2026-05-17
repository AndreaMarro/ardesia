# Future Plan iter 79-80+ — Sprint U close trajectory

**Data**: 2026-05-17 sera (post iter 78 web-dfu MVP LIVE prod)
**Branch**: feat/iter-41-sprint-u-cycle-2-real-user-fix HEAD `d990d329`
**Mandate**: Andrea iter 78 close "Scrivi piano per azioni future /karpathy-guidelines /mem-search /writing-plans"

## Karpathy guidelines applied (4 principi core)

1. **Think before code** — 1 min ragionamento ≫ 10 min refactor
   → Codex Pattern V design phase per ogni atom iter 79+ (5 critical findings prevenuti iter 78)
2. **Simple** — soluzione più semplice che risolve il problema
   → readback verify = 1 funzione `verifyFlash()` riusa esistente `webdfu.read()` (NON nuova astrazione)
3. **Surgical** — tocca minimo necessario
   → iter 79 P0 atoms each <100 LOC, no "già che ci sei" refactors
4. **Goal-driven** — ogni riga deve servire goal esplicito
   → Hardware UAT real Nano R4 = goal verifica end-to-end no-download path per Riccardo demo

## Iter 79 plan (target 8.9 → 9.2/10 ONESTO)

### Atom 79.1 — Hardware UAT real Nano R4 (~2h Andrea+Tea+Riccardo)
**Goal**: prove real flash works on physical kit Omaric

**Steps GSD-2**:
1. Andrea: connect Nano R4 USB-C → `system_profiler SPUSBDataType | grep -A 5 -i nano` (capture vendorId/productId actual)
2. Andrea: double-tap reset → LED arancione lampeggia (DFU bootloader mode)
3. Andrea: Chrome browser → Vercel prod → `#compile-home` → Blockly Blink
4. Andrea: click "Compila" → Cloud Render → HEX bytes returned
5. Andrea: click "Carica su Nano R4" → WebUSB picker → select Nano R4
6. Andrea: verify LED D13 blink 500ms post-flash + FLASH_SUCCESS_REAL state visible
7. Doc: hardware UAT result iter 79 atom 79.1 close evidence

**Risks** (Codex iter 78 review):
- Board not in DFU mode → mitigation: explicit UI step Andrea iter 79 P0.5
- Async error hang → already fixed iter 78 P0 (safeResolve + 60s timeout)
- DfuSe protocol 0x02 (vs 0x01 standard DFU) → contingency atom 79.4

### Atom 79.2 — Readback verify UPLOAD (~4h orchestrator inline)
**Goal**: `verified: true` honest path

**Steps**:
1. Codex Pattern V design: review `webdfu.read()` API signature + WebDFUProcessRead events
2. `webDfuFlash.js` add `verifyFlash(device, originalBinary)`:
   - Call `webdfu.read(transferSize, originalBinary.length)`
   - Wait `events.on('end', blob)` → Uint8Array
   - Byte-compare with originalBinary → return `{verified: bool, mismatchOffset?: int}`
3. Update `flashDfuFirmware()` opt `verifyAfterFlash: true`:
   - Post 'end' event, invoke `verifyFlash()`
   - Update FlashResult `verified: true` if compare passes
4. Tests:
   - T20 mock returns same bytes via UPLOAD → verified=true asserted
   - T21 mock returns DIFFERENT bytes → verified=false + mismatchOffset
   - T22 mock returns empty → verified=false + error 'readback_empty'
5. Codex Pattern C review post-impl

### Atom 79.3 — WebUSB filter narrow productId (~30min post 79.1)
**Goal**: WebUSB picker shows ONLY Nano R4 (cleaner UX)

**Steps**:
1. Andrea iter 79.1 captures productId (0x0070 OR 0x0069 OR other)
2. Update `src/services/webUsbDetect.js:34` `NANO_R4_USB_FILTERS = [{vendorId: 0x2341, productId: 0xXXXX}]`
3. Test: WebUSB picker shows Nano R4 only (Andrea verify Chrome browser)
4. Update tests/unit/services/webUsbDetect.test.js T1 fixture

### Atom 79.4 — DfuSe protocol 0x02 contingency (defer if 79.1 PASS)
**Goal**: if Renesas RA4M1 uses DfuSe extension, adapter supports

**Steps** (defer iter 79 P1 ONLY if 79.1 fails with protocol error):
1. Read `webdfu.type` returns `WebDFUType.SDFUse` if descriptor has DfuSe marker
2. `dfu` library auto-handles via `do_dfuse_write()` if type detected
3. Adapter passes through MA may need DfuSe memory map descriptor
4. Mock add DfuSe descriptor variant for testing

### Atom 79.5 — Render warm-keep cron (~1h)
**Goal**: avoid 39s cold compile latency Riccardo demo

**Options**:
- **A**: Supabase pg_cron + pg_net.http_get `/health` every 5min
- **B**: Cloudflare Workers scheduled trigger
- **C**: Render keep-alive add-on $5/mo
- **D**: Cron-job.org free service

**Recommendation A**: pg_cron already used iter 67 PHASE 2 (`unlim_chat_warmup_cron.sql` shipped) → reuse pattern.

**Steps**:
1. Create `infra/cloud-compile/render-warmup.sql` migration
2. `SELECT cron.schedule('elab-cloud-warmup', '*/5 * * * *', $$SELECT net.http_get('https://elab-cloud-compile.onrender.com/health')$$);`
3. Andrea apply via `supabase db push --linked`
4. Verify cron runs via Supabase logs

### Atom 79.6 — Visible badge UI flash mode (~2h)
**Goal**: per Codex P0 — data-attr alone insufficient, visible UI element required

**Steps**:
1. Codex Pattern V design phase: badge component placement (next to button OR floating toast OR inline)
2. CompileUploadButton render badge when `demoState ∈ {FLASH_SUCCESS_REAL, FLASH_COMPLETE_SIMULATED}`
3. Real badge: `<span className={styles.badgeReal}><CheckIcon /> Caricato reale</span>` Lime
4. Simulated badge: `<span className={styles.badgeSimulated}><WarningIcon /> Simulazione DFU</span>` Orange
5. ARIA `aria-label` includes mode word for screen reader
6. Tests T16+T17 assert badge text + color + ARIA
7. Codex Pattern C review post-impl

### Atom 79.7 — Strict mock mode (~3h iter 79 P1)
**Goal**: per Codex P0 — mock too lenient, real hardware UAT may surface bugs mock hides

**Steps**:
1. Mock `createMockDfuDevice({strictMode: true})` opt
2. Unknown class request → return `status: 'stall'`
3. DNLOAD with wrong block number → enter `dfuERROR` state
4. Wrong recipient/interface index → reject
5. Tests T18+T19 assert strict mode catches malformed dfu library usage

### Atom 79.8 — Legacy "Caricato sul kit" refactor (~1h iter 79 P0)
**Goal**: per Codex P0 — legacy non-demo path line 440 still claims "Caricato sul kit" without web-dfu evidence

**Steps**:
1. Read CompileUploadButton.jsx:440 legacy handleClick path
2. Refactor to require flash adapter result OR explicit `legacyServerFlashConfirmed: true` payload field
3. Default to honest "Caricamento server-side iter 80+ verify" message
4. Update test line 247 expecting "Caricato sul kit" → update OR mark .skip per honest contract

### Atom 79.9 — CompileAgentBanner decommission (~30min iter 79 P0)
**Goal**: WebUsbBanner verified iter 77 default, legacy banner unused

**Steps**:
1. Search refs `import.*CompileAgentBanner` across src/
2. If only HomePage + HomeCompileEntry (both env-gated VITE_USE_LOCAL_AGENT) → safe delete
3. Move to `src/components/HomePage/_legacy/CompileAgentBanner.jsx`
4. Document iter 79 atom 79.9 deprecation
5. Update CLAUDE.md anti-pattern note

### Atom 79.10 — Mock USBDevice Playwright E2E extend FLASH states (~3h iter 79 P1)
**Goal**: per iter 76 D.5 + iter 78 close — extend BG A.3 e2e spec with new states

**Steps**:
1. `tests/e2e/05-cross-compile-mock-board.spec.js` add 4 NEW specs:
   - T6 FLASHING state visible during write
   - T7 FLASH_COMPLETE_SIMULATED final state + badge visible
   - T8 FLASH_ERROR state on adapter error
   - T9 timeout after 60s (mock stall)
2. Update `tests/e2e/helpers/webusb-mock.js` add DFU emulator scenarios
3. Playwright config baseURL production OR localhost dev gated env

## Iter 80 plan (target 9.2 → 9.5+/10 ONESTO Sprint U close)

### Atom 80.1 — Sprint U close audit (~2h orchestrator inline)
- SPRINT_U_COMPLETE 30 boxes status review
- Cumulative iter 41-80 deliverables summary
- Production readiness assessment Andrea+Tea+Riccardo demo

### Atom 80.2 — Andrea ratify queue close (~30min Andrea)
- 15+ Andrea decisions pending iter 67-79
- Batch decisions + document outcomes
- Close all pending ADRs (ADR-028 still PROPOSED 40 iter)

### Atom 80.3 — God classes refactor (defer Sprint V) (~12h iter 80+ OR Sprint V)
- TeacherDashboard 3484 LOC → split 4 sub-components
- SimulatorCanvas 3173 LOC → split engine/canvas/panels
- experiments-vol1 6860 LOC → JSON data file (no code)
- Defer Sprint V if scope creep iter 80

### Atom 80.4 — CLAUDE.md split (~2h iter 80)
- 3393 LOC violates "one source per concept"
- Split: `CLAUDE.md` principles (≤500 LOC) + `CLAUDE-SPRINT-HISTORY.md` archive
- Auto-collapse closed sprints (G38-G45 + iter 1-50 history)

### Atom 80.5 — Sprint U close deploy + Riccardo demo schedule (~1h Andrea)
- Final Vercel deploy prod
- Andrea coordinate Riccardo Omaric demo call iter 81+ entrance
- Screencast capture demo flow Blockly→Cloud→WebUSB→Nano R4 real flash

## Sprint V+ roadmap iter 81+ (longer horizon)

| Track | Effort | Scope |
|---|---|---|
| Cross-platform installer (Tauri) | 40-80h | iOS Safari excluded, Windows EV cert + macOS Apple Dev ID |
| ELAB Quality Harness Phase 2 | multi-week | Lighthouse CI + axe + BackstopJS + ZAP + Langfuse + Ragas + DeepEval + Unlighthouse + Crawlee + Pa11y |
| Mistral Vibe Red Team integration | iter 90+ | post Codex 12+ iter validation sufficient |
| Linguaggio codemod 200 singolare→plurale | iter 21+ carryover ~10h | PRINCIPIO ZERO enforcement |
| Vol3 narrative refactor Davide co-author | iter 33+ deferred | content + tests SIMULTANEOUS (NOT skeleton-first per iter 72 BG-A5 lesson) |
| 94 esperimenti Playwright UNO PER UNO audit | iter 21+ ~8-10h | Sprint U close gate |
| Onnipotenza Deno port 62-tool dispatcher | iter 38+ ~16h | post canary validation |
| Vision Gemini Flash deploy production | iter 35+ A2 deferred | OR Pixtral 12B EU primary already LIVE |
| Renesas RA4M1 documentation purge | iter 70+ scope refine | ~36 files post Andrea ratify |
| ADR-028 INTENT dispatcher canonical close | iter 36 PROPOSED 40+ iter | Andrea ratify ACCEPTED |

## Mem-search Karpathy refs (mandate /mem-search)

Local claude-mem corpus stale Apr 28 (Claude Desktop OAuth stale iter 67 entrance). Fallback: Karpathy principles applied iter 78 via memory CLAUDE.md "Karpathy" section (4 principi: Think + Simple + Surgical + Goal-driven).

Per Karpathy guidelines repo `forrestchang/andrej-karpathy-skills`:
- "Think before write code" → Codex Pattern V design loops iter 78+ (5 findings prevented)
- "Simple solutions" → readback `verifyFlash()` reuses webdfu.read() (no new abstraction)
- "Surgical edits" → iter 78 fixes <100 LOC per atom (no "while you're at it")
- "Goal-driven" → iter 79.1 hardware UAT = goal Riccardo demo trust, not vanity perfectionism

## State final iter 78 close (per Andrea "Stop tutti processi documentando state")

### Processi attivi
- ZERO BG agents running
- ZERO vitest processi residui (verified `ps aux | grep vitest`)
- ZERO Codex BG running
- ZERO Render deploys in flight
- ZERO Vercel deploys in flight

### State documented
- 16 commits iter 76-78 pushed origin (HEAD `d990d329`)
- Vercel prod LIVE elab-tutor-4saq57r6f-...vercel.app
- Cloud Render LIVE elab-cloud-compile.onrender.com Standard 2GB
- LOCAL agent localhost:8765 dev-side Andrea Mac

### Iter 79 entrance gate
- Andrea action checklist documented §2 setup steps
- 5 P0 atoms detailed §3 with effort + risks
- Tech debt P0 listed §4
- Future Sprint V+ roadmap §last

### Riccardo demo readiness
- ✅ Cloud compile LIVE prod (no-download path verified)
- ✅ Frontend LIVE Vercel (latest iter 78 code)
- ✅ Simulated flash chain scientifically valid (mock byte integrity proven)
- ⏸ Hardware UAT real Nano R4 iter 79.1 PRIMARY gate
- ⏸ Readback verify iter 79.2
- ⏸ Visible badge UI iter 79.6

## Anti-inflation G45 mandate plan

- NO claim "Sprint U close achievable iter 79" — iter 80 close projection conditional 10 atoms
- NO claim "Hardware UAT iter 78 completable" — iter 79.1 dipende Andrea+Tea+Riccardo+kit
- NO claim "real flash production-ready" — iter 79.2 readback + iter 79.6 badge mandatory
- HONEST: scientifically valid simulation = code path proven, NOT physical board proven
- HONEST: Render Standard $25/mo cost Andrea ratify iter 79+ keep OR optimize

© Andrea Marro — 2026-05-17 — ELAB Tutor iter 78 close + iter 79-80+ future plan Karpathy-guided
