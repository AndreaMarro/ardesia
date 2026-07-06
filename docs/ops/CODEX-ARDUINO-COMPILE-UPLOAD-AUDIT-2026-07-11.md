# CODEX Arduino Compile/Upload Audit - 2026-07-11

Packet: PKT-CODEX-2  
Repo: `/Users/andreamarro/VOLUME 3/ardesia`  
Mode: read-only audit + docs-only output  
Baseline checked: `origin/main` = `7be04f2b (origin/main, origin/HEAD) Merge pull request #120 from AndreaMarro/feat/package-preview-integrity-20260710`

## 1. Executive summary

ARDESIA/ELABTutor has real pieces for Arduino work, but not a single verified browser-to-hardware chain for all current Vol.3 experiments.

What exists today:

- 23/23 Vol.3 experiments are present in `plugins/elab-tutor/src/data/experiments-vol3.js` and every one has `simulationMode: "avr"`, Arduino code, and Scratch XML.
- A real in-browser AVR compiler exists, but it is intentionally bounded to a small ATmega328P subset. Static execution against the 23 Vol.3 sketches shows only 5/23 compile in-browser for Uno/Nano today.
- A real AVR Web Serial uploader exists for STK500V1/ATmega328P class boards in `webSerialFlash.js`.
- A Nano R4 WebUSB DFU path exists, but it depends on cloud/local `arduino-cli` or precompiled HEX and returns `verified:false` because no read-back verify is implemented.
- A local ELAB Compile Agent path exists, but its direct upload contract requires `jobId` from a previous compile; the older `uploadAgent.uploadHex()` facade posts raw `hex`, and one UI fallback passes sketch source where Intel HEX is expected.

The main blockers are not UI polish. They are contract and evidence gaps:

1. Compile/upload contracts diverge across `CompileUploadButton`, `uploadAgent`, browser-native upload buttons, Vercel proxy, cloud compile, and local agent.
2. Board selection exposes more boards than the compile/upload backends can actually support end-to-end.
3. Vol.3 precompiled HEX coverage is partial, and two referenced HEX files are missing while one experiment points at the wrong file.
4. Tests mostly prove mocked compile/device picker flows, not real browser transport or hardware flashing.
5. No integrated ARDESIA LessonOS event-log evidence model is wired yet for compile/upload results. That should be added through the FABLE-owned event-log surface, not a second plugin store.

Recommendation: start with a docs/test-only PR that freezes the matrix and failing contracts, then make small contract fixes before attempting hardware UAT.

## 2. Stato attuale: AVR/Arduino/Scratch nei 23 esperimenti Vol.3

Canonical Vol.3 source says Cap.5 (2) + Cap.6 (8) + Cap.7 (7) + Cap.8 (6) = 23 exercises in `plugins/elab-tutor/src/data/experiments-vol3.js:3`.

Static sweep result:

| Metric | Current state |
| --- | --- |
| Vol.3 lesson-path JSON files | 23 files under `plugins/elab-tutor/src/data/lesson-paths/v3-*.json` |
| Vol.3 experiment records | 23 in `experiments-vol3.js` |
| `simulationMode: "avr"` | 23/23 |
| Arduino code present | 23/23 |
| Scratch XML present | 23/23 |
| In-browser AVR compile success for `board=nano` | 5/23 |
| Public HEX files under `plugins/elab-tutor/public/hex` | 13 files |
| R4-specific public HEX files | 4 files, `v3-cap6-esp1-r4.hex` through `v3-cap6-esp4-r4.hex` |

The 5 sketches that fit the current in-browser ATmega328P compiler subset are:

- `v3-cap5-esp2`
- `v3-cap6-esp2`
- `v3-cap6-esp3`
- `v3-cap6-esp4`
- `v3-cap6-esp5`

Everything else uses at least one unsupported construct for the bounded compiler, such as `Serial.*`, `digitalRead`, `analogRead`, `analogWrite`, `if`, `while`, `for`, `map`, `analogWriteResolution`, or ternary expressions. This is consistent with `plugins/elab-tutor/src/services/inBrowserAvrCompiler.js:1`, where the contract says the compiler only supports a bounded subset, and `plugins/elab-tutor/src/services/inBrowserAvrCompiler.js:247`, where non-ATmega328P targets are rejected.

Important hard distinction:

- Arduino code in the experiment record is real source text.
- Scratch XML is a block representation/generation asset, not proof of Arduino compile or upload.
- AVR simulation is ATmega328P emulation through `avr8js`, not Nano R4/RA4M1 emulation. See `plugins/elab-tutor/src/components/simulator/engine/AVRBridge.js:3` and `AVRBridge.js:18`.
- Hardware upload is only real if the selected transport transfers a compiled artifact to a selected physical device and emits honest evidence. Mocked WebUSB tests do not prove that, per `plugins/elab-tutor/tests/e2e/helpers/webusb-mock.js:30`.

## 3. Mappa pipeline desiderata

Desired pipeline:

```text
lesson-path
  -> experiment id
  -> code/source selection
  -> compile provider selection
  -> board target
  -> artifact envelope
  -> browser transport
  -> upload result
  -> evidence event
  -> LessonOS event-log
  -> graph/projections
```

Required contract at each step:

1. `lesson-path`: carries the current pedagogical step, experiment id, source mode, board target, and plugin instance id. It does not own persistent memory.
2. `code/source`: explicit origin: experiment Arduino code, Scratch-generated C++, user-edited C++, or verified precompiled artifact.
3. `compiler`: one of:
   - in-browser AVR compiler for supported ATmega328P subset only,
   - cloud/local `arduino-cli` for Nano R4 and complex sketches,
   - precompiled artifact only when board, source hash, artifact hash, and flash base are in a manifest.
4. `board target`: explicit `boardId`, `fqbn`, MCU family, upload protocol, and capability flags.
5. `browser transport`: Web Serial STK500, WebUSB DFU, or localhost agent. No generic "upload" state without a concrete transport.
6. `upload`: consumes a compiled artifact, never raw sketch source. It returns mode `real|simulated`, bytes transferred, and `verified:true|false`.
7. `evidence`: includes source hash, artifact hash, board/fqbn, provider, transport, device descriptor used, byte count, duration, and verification status.
8. `graph/eventlog`: compile/upload events append to LessonOS event-log. Graph projections derive from the log; no plugin-local second store.

Minimum event names:

- `tool.compile.requested`
- `tool.compile.succeeded`
- `tool.compile.failed`
- `tool.upload.requested`
- `tool.upload.succeeded`
- `tool.upload.failed`
- `tool.hardware.evidence.recorded`

## 4. Findings P0/P1/P2

### P0-1 - Fallback upload can pass Arduino source where Intel HEX is required

Evidence:

- `plugins/elab-tutor/src/components/lavagna/CompileUploadButton.jsx:661` calls `resolvedUploadHex(sketchCode, ...)`.
- `plugins/elab-tutor/src/services/uploadAgent.js:186` documents `hexString` as Intel HEX payload.
- `plugins/elab-tutor/src/services/uploadAgent.js:228` posts `{ hex: hexString, port, boardId }`.
- `plugins/elab-tutor/src/services/uploadAgent.js:268` says Web Serial fallback is a STUB that drip-feeds HEX text line-by-line.
- `plugins/elab-tutor/src/services/elab-agent/http-server.js:397` says direct `hexBase64` upload is reserved for future and current upload reuses a previous compile job.
- `plugins/elab-tutor/src/services/elab-agent/server.js:326` requires `jobId + port`.

Scenario: local compile/upload agent is unreachable, `CompileUploadButton` enters fallback, imports `uploadAgent`, and passes C++ source to a facade that expects Intel HEX.

Impact: a UI path can claim "caricato" after a non-real fallback path or fail in ways that look like transport failures, hiding the real contract mismatch.

Falsifiable test: force primary agent fetch to throw in a `CompileUploadButton` unit test, inject a spy `uploadHexImpl`, and assert the first argument is not raw sketch source. A second contract test should POST `{hex, port, boardId}` to `createApp().post('/upload')` and expect the current 400 because `jobId` is required.

Minimal fix: remove this fallback until it has a compiled HEX artifact, or change it to use the same `uploadToBoard()`/`UniversalUploadButton` contract with a real compiled artifact. Never set success for line-by-line serial drip-feed.

Recommended ownership: ELAB compile/upload owner.

Conflict with FABLE P0-LIVE/P0-C: no, if confined to plugin compile/upload services/tests and docs.

### P0-2 - Board picker exposes boards that are not compile/upload supported end-to-end

Evidence:

- `plugins/elab-tutor/src/components/lavagna/BoardPicker.jsx:53` renders every entry in `BOARDS`.
- `plugins/elab-tutor/src/services/arduinoBoards.js:36` starts the board registry with Nano R4 and continues through AVR, SAMD, nRF, ESP32, etc.
- `plugins/elab-tutor/infra/cloud-compile/server.js:48` allows only Nano R4, AVR Nano old bootloader, and Uno.
- `plugins/elab-tutor/src/services/elab-agent/http-server.js:355` maps only `arduino:renesas_uno:nanor4` for local agent compile.
- `plugins/elab-tutor/src/services/arduinoBoards.js:153` marks Mega `inBrowserCompileSupported: true` even though the same file says the pin map differs at `arduinoBoards.js:246`.

Scenario: a teacher selects Mega, Leonardo, Nano 33, BLE, ESP32, or another visible board. The compile API may reject it, the local agent may silently default to Nano R4, or upload protocol may be unimplemented.

Impact: "cross-board" looks available in UI but the actual board matrix is false. This is a high-risk education/hardware failure because the selected board can differ from the compiled board.

Falsifiable test: add a matrix test over `BOARDS` asserting that every visible board has at least one compile provider and at least one implemented upload provider. Current registry should fail.

Minimal fix: add explicit `visible`, `compileProviders`, `uploadProviders`, and `endToEndSupported` fields. Show by default only Nano R4, Uno R3, and Nano ATmega328P variants until backends exist.

Recommended ownership: ELAB compile UI + board registry.

Conflict with FABLE P0-LIVE/P0-C: no.

### P0-3 - Vol.3 precompiled HEX references are partial and inconsistent

Evidence:

- `plugins/elab-tutor/src/data/experiments-vol3.js:1010` maps `v3-cap6-esp4` to `/hex/v3-cap6-sirena.hex`, while `/hex/v3-cap6-esp4.hex` also exists.
- `plugins/elab-tutor/src/data/experiments-vol3.js:1402` maps `v3-cap6-esp5` to `/hex/v3-cap6-esp5.hex`, but that file is missing under `plugins/elab-tutor/public/hex`.
- `plugins/elab-tutor/src/data/experiments-vol3.js:4318` maps `v3-cap8-esp3` to `/hex/v3-cap8-esp3.hex`, but that file is missing under `plugins/elab-tutor/public/hex`.
- `plugins/elab-tutor/tests/unit/experimentHexFiles.test.js:91` only checks that the path text contains the experiment id; it does not check that the file exists or that source/artifact match.
- `plugins/elab-tutor/src/services/compiler.js:110` contains a small precompiled map, and `compiler.js:131` contains only four R4-specific precompiled mappings.

Scenario: an experiment hits the precompiled path by code hash or direct experiment `hexFile`. It can fetch a missing HEX, or worse, flash a HEX file that does not match the experiment code.

Impact: the offline/precompiled compile path is not trustworthy as evidence for Vol.3 coverage. It can produce wrong behavior on physical hardware.

Falsifiable test: iterate all Vol.3 `hexFile` values and assert `public${hexFile}` exists. Then compile/hash-match source to artifact manifest for any artifact that claims to cover an experiment.

Minimal fix: create an artifact manifest with `experimentId`, `boardId`, `fqbn`, `sourceSha256`, `hexSha256`, `flashStartAddress`, and `generatedBy`. Remove or quarantine stale `hexFile` values until regenerated.

Recommended ownership: ELAB content/data + compile pipeline.

Conflict with FABLE P0-LIVE/P0-C: no.

### P1-1 - IDE CompileButton request body does not match `/api/compile/nanor4`

Evidence:

- `plugins/elab-tutor/src/components/ide/CompileButton.tsx:34` posts to `/api/compile/nanor4`.
- `plugins/elab-tutor/src/components/ide/CompileButton.tsx:37` sends `JSON.stringify({ source })`.
- `plugins/elab-tutor/api/compile/nanor4.js:76` accepts `sketchCode` and `code`, not `source`.
- `plugins/elab-tutor/tests/unit/ide/IdeShell.test.jsx:143` currently enshrines the wrong `{ source }` request body.
- `plugins/elab-tutor/src/components/ide/IdeShell.tsx:136` renders `CompileButton`.

Scenario: IDE shell compile uses the real API route. The handler returns `missing_sketch_code`.

Impact: compile can fail in the IDE shell even though lower-level compile services work.

Falsifiable test: run the existing `IdeShell` unit against the API handler contract, or change the mock expectation to `{ sketchCode: defaultSource }`; current code fails.

Minimal fix: either send `{ sketchCode: source }` from `CompileButton` or accept `source` as a third alias in the API route. Prefer fixing the client and adding one API compatibility test.

Recommended ownership: ELAB IDE compile surface.

Conflict with FABLE P0-LIVE/P0-C: no.

### P1-2 - Nano R4 USB descriptor sources disagree

Evidence:

- `plugins/elab-tutor/src/services/arduinoBoards.js:43` documents Nano R4 DFU/runtime descriptors as `0x0070`, `0x0069`, and Renesas fallback `0x045B:0x0234`.
- `plugins/elab-tutor/src/components/lavagna/R4DfuUploadButton.jsx:17` mirrors only `0x2341:0x0070`, `0x2341:0x0069`, and broad `0x2341`.
- `plugins/elab-tutor/src/boards/arduino-nano-r4.json:57` says `pid: "0x0374"` and `runtimePid: "0x0074"`.
- `plugins/elab-tutor/src/services/webUsbDetect.js:34` says the product IDs are placeholder candidates pending empirical verification.

Scenario: a real Nano R4 is in runtime or bootloader mode and the browser picker filter is wrong or too broad. The user may not see the board or may see too many Arduino-class USB devices.

Impact: real browser upload fails at the first hardware step, or creates an avoidable privacy/security UX issue by broad filtering.

Falsifiable test: add a single canonical descriptor fixture and unit-test that `arduinoBoards`, `R4DfuUploadButton`, `webUsbDetect`, and board JSON derive from it. Hardware UAT should record actual macOS/Chrome descriptor output.

Minimal fix: centralize Nano R4 descriptors in one source of truth, mark unverified descriptors explicitly, and fail closed for "real upload" until verified.

Recommended ownership: ELAB hardware/upload.

Conflict with FABLE P0-LIVE/P0-C: no.

### P1-3 - WebUSB DFU success UI can hide lack of read-back verification

Evidence:

- `plugins/elab-tutor/src/services/webDfuFlash.js:52` defines `verified` as true only after read-back verification.
- `plugins/elab-tutor/src/services/webDfuFlash.js:264` explicitly sets `verified:false` because no readback exists in MVP.
- `plugins/elab-tutor/src/services/webDfuFlash.js:317` has an honest message for no read-back verify.
- `plugins/elab-tutor/src/components/lavagna/R4DfuUploadButton.jsx:154` sets the visible message to `Caricato! ... byte sulla Nano R4.`

Scenario: a DFU transfer finishes and UI shows "Caricato!" while evidence says `verified:false`.

Impact: the product can overstate upload certainty. For classroom hardware, "transferred" and "verified running on board" must be separated.

Falsifiable test: mock `flashDfuFirmware()` to return `{ok:true, mode:'real', verified:false}` and assert the visible message includes "no read-back verify" or an equivalent warning.

Minimal fix: surface `flashResultMessage(result)` in the visible success UI and event-log evidence.

Recommended ownership: ELAB upload UI.

Conflict with FABLE P0-LIVE/P0-C: no.

### P1-4 - Home compile V2 delegates upload through a hidden DOM click without evidence hooks

Evidence:

- `plugins/elab-tutor/src/components/home/HomeCompileEntry.jsx:422` looks up `[data-testid="universal-upload-btn"]` and clicks it.
- `plugins/elab-tutor/src/components/home/HomeCompileEntry.jsx:471` mounts `UniversalUploadButton` offscreen.
- `plugins/elab-tutor/src/components/home/HomeCompileEntry.jsx:472` passes only `boardId` and `hexText`, no `onSuccess`/`onError` evidence callback.

Scenario: V2 compile home uploads through the hidden button and the UI transport result stays local to the component.

Impact: ARDESIA cannot reliably project upload evidence into LessonOS/event-log without scraping state or adding a second store.

Falsifiable test: in V2, mock upload success and assert a structured callback/event is emitted with board, artifact, transport, bytes, and verification. Current wiring has no callback.

Minimal fix: replace DOM click delegation with an explicit upload action hook returning a structured result, then emit through the FABLE-owned event-log adapter.

Recommended ownership: shared ELAB compile UI + LessonOS integration. Coordinate with FABLE before touching mounted surfaces.

Conflict with FABLE P0-LIVE/P0-C: yes if implemented in mounted LessonOS/ToolHost surfaces. No conflict for docs/tests only.

### P2-1 - Cloud compile may return non-HEX artifacts without declaring artifact format

Evidence:

- `plugins/elab-tutor/infra/cloud-compile/server.js:257` tries `sketch.ino.hex`, then `sketch.ino.bin`, then `sketch.ino.elf`.
- `plugins/elab-tutor/infra/cloud-compile/server.js:291` returns `hexBase64` regardless of which candidate was read.
- Browser upload paths parse Intel HEX, for example `plugins/elab-tutor/src/components/lavagna/CompileUploadButton.jsx:763`.

Scenario: a board toolchain outputs only `.bin` or `.elf`; the response still labels it `hexBase64`.

Impact: browser-side parsers fail late or, worse, route binary bytes to a HEX-only path.

Falsifiable test: force a compile fixture where only `.bin` exists and assert the API response has `artifactFormat: "bin"` and that HEX-only upload rejects it before parsing.

Minimal fix: add `artifactFormat` and reject non-HEX artifacts in HEX-only browser upload flows.

Recommended ownership: cloud compile service.

Conflict with FABLE P0-LIVE/P0-C: no.

### P2-2 - Compiler source tracking type/comment omits `browser`

Evidence:

- `plugins/elab-tutor/src/services/compiler.js:279` documents compilation source tracking.
- `plugins/elab-tutor/src/services/compiler.js:420` returns `source: 'browser'`.
- `plugins/elab-tutor/src/services/compiler.js:440` also returns `source: 'browser'`.

Scenario: downstream UI or tests rely on the documented source enum and do not include `browser`.

Impact: minor telemetry/reporting drift, but easy to clean while adding event evidence.

Falsifiable test: type/comment-based unit or TS migration should include `browser` in the accepted enum.

Minimal fix: update the source enum documentation and any downstream status mapping.

Recommended ownership: compile service.

Conflict with FABLE P0-LIVE/P0-C: no.

## 5. Compile vs upload vs simulate vs Scratch XML vs hardware reale

Current reality:

| Capability | Real today | What it is not |
| --- | --- | --- |
| Compile in-browser AVR | Real for bounded ATmega328P subset; 5/23 Vol.3 pass static compiler check | Not a full Arduino compiler; not Nano R4/RA4M1 |
| Compile Nano R4 | Real only via cloud/local `arduino-cli` or verified precompiled HEX | Not possible in browser without a full Renesas toolchain |
| Upload AVR Uno/Nano | Real path exists through Web Serial STK500V1 in `webSerialFlash.js` | Not covered by the older `uploadAgent` line-drip fallback |
| Upload Nano R4 | WebUSB DFU path exists and can transfer bytes, but read-back verify is not implemented | Not proof that the sketch is running unless hardware UAT/evidence confirms |
| Simulate AVR | Real ATmega328P emulation through `avr8js` | Not RA4M1/Nano R4 CPU emulation |
| Scratch XML | Real block/source representation | Not compile evidence, upload evidence, or hardware evidence |
| Hardware real | Only real when a selected physical device receives an artifact and the result is logged with transport/evidence | Not proven by mocks or by static HEX presence |

## 6. Board matrix

| Board/family | Cited today | Compile status | Upload status | Missing gates |
| --- | --- | --- | --- | --- |
| Arduino Uno R3 / ATmega328P | `arduinoBoards.js:125`, cloud allowlist `server.js:50` | In-browser only for bounded subset; cloud `arduino-cli` allowed | Web Serial STK500V1 exists in `webSerialFlash.js` | Hardware UAT, event evidence, artifact manifest |
| Arduino Nano ATmega328P old/optiboot | `arduinoBoards.js:91`, `arduinoBoards.js:108`, cloud allowlist `server.js:51` | Same as Uno for old bootloader; optiboot visible but cloud allowlist does not include optiboot FQBN | Web Serial STK500V1 exists | Board visibility split by bootloader, tested baud fallback, hardware UAT |
| Arduino Nano R4 / RA4M1 | `arduinoBoards.js:38`, board JSON `arduino-nano-r4.json:3` | Cloud/local `arduino-cli` or precompiled R4 HEX only; in-browser compile unsupported | WebUSB DFU scaffold and local agent upload via `arduino-cli` | Canonical USB descriptors, read-back verify, real hardware UAT, direct upload contract cleanup |
| Arduino Uno R4 Minima | `arduinoBoards.js:63` | Not in cloud allowlist | DFU protocol family but not verified | Hide or gate until board profile/toolchain/upload evidence exists |
| Mega 2560 | `arduinoBoards.js:142` | Registry says in-browser supported, but compiler rejects non-328P | STK500V2 dispatcher reuses STK500 path | Fix false capability flag, no visible support until compile/upload tests exist |
| Leonardo / SAMD / nRF / ESP32 | registry entries after `arduinoBoards.js:157` and `arduinoBoards.js:172` | Not allowed by cloud compile service | BOSSA/ESP upload protocols return not implemented in uploader | Hide or mark experimental, no end-to-end claim |

Dependency/infra/hardware gates:

- No new npm dependency without Andrea approval.
- Nano R4 full compile requires cloud/local `arduino-cli` with Renesas core.
- AVR full compile for complex sketches requires `arduino-cli` or a larger compiler service; the current in-browser compiler is intentionally limited.
- Real upload gates require Chrome/Edge, HTTPS or localhost, user gesture, physical board, correct cable, and OS permission.
- Hardware UAT must record device descriptors, board mode, artifact hash, transport, bytes, and observed board behavior.

## 7. Browser transport audit

### Web Serial

Status: real for AVR STK500V1 through `plugins/elab-tutor/src/services/webSerialFlash.js`. The module states it is browser-native STK500V1 for Nano/Uno ATmega328/P at `webSerialFlash.js:1`.

Risks/gates:

- Chrome/Edge only.
- Requires user gesture and serial picker.
- Broad/no filters are useful for clones but increase wrong-port risk.
- Must not be confused with `uploadAgent.uploadViaWebSerial()`, which is documented as a stub at `uploadAgent.js:268`.

### WebUSB

Status: Nano R4 WebUSB DFU path exists in `webDfuFlash.js` and `R4DfuUploadButton.jsx`.

Risks/gates:

- Chrome/Edge only, user gesture required.
- Device descriptors are inconsistent and partly marked placeholder.
- Broad `vendorId: 0x2341` filters can expose unrelated Arduino devices in picker.
- `verified:false` until read-back verify exists.
- In iframe/embedded contexts, permissions policy and secure context must be explicitly validated.

### Localhost agent

Status: local `arduino-cli` agent exists. It has a real compile path and real upload path using `jobId` and port.

Risks/gates:

- Client-side posture says no token storage and loopback only in `uploadAgent.js:14`.
- Mac support is the only complete install path per `compileAgentDetect.js`.
- `/upload` direct HEX contract is deferred; current upload requires prior `/compile`.
- Local process trust, CORS, and port binding need explicit threat model before classroom deployment.

### Tauri/Electron

Status: not implemented as the current compile/upload path.

Risks/gates:

- Could simplify serial/USB permissions in a packaged app, but becomes a different deployment and security model.
- Must keep context isolation, no broad filesystem/device access, no secret logging, and no second store.
- Should not be mixed into the browser promise until product direction approves packaging.

## 8. LessonOS/event-log integration without a second store

The compile/upload chain should be represented as LessonOS events, not plugin-local memory.

Recommended model:

- Plugin components produce a structured result object only.
- The mounted ARDESIA/ToolHost surface appends that object to the LessonOS event-log.
- Graph/projections derive from the event-log.
- The plugin may keep transient UI state, but no durable compile/upload store.

Evidence payload fields:

```json
{
  "experimentId": "v3-cap6-esp2",
  "sourceKind": "experiment|scratch|editor|precompiled",
  "sourceSha256": "...",
  "boardId": "uno",
  "fqbn": "arduino:avr:uno",
  "compiler": "browser-avr|cloud-arduino-cli|local-agent|precompiled",
  "artifactFormat": "hex",
  "artifactSha256": "...",
  "transport": "webserial-stk500v1|webusb-dfu|local-agent",
  "mode": "real|simulated",
  "bytesTransferred": 1024,
  "verified": false,
  "durationMs": 1200
}
```

Do not implement this by touching the FABLE P0-LIVE files in this packet. The safe next step is a docs/test-only event schema contract, then FABLE can wire event-log once their P0-LIVE surface is stable.

## 9. Five PR tasks ordered by value

1. Docs/test-only matrix PR: add a board/artifact/support audit test that captures the current truth: 23 Vol.3 experiments, 5/23 in-browser AVR supported, missing HEX files, board visibility vs provider support, and event evidence schema. No runtime behavior change.
2. Fix compile request contract: update `CompileButton` to send `{sketchCode}` or make `/api/compile/nanor4` accept `source`, then update tests so they prove the real handler contract.
3. Gate board visibility: show only boards with implemented compile and upload providers. Set Mega in-browser support false until a real Mega compiler path exists.
4. Repair artifact manifest: remove stale/missing Vol.3 HEX references, regenerate verified AVR/R4 HEX only where the source hash and board target match, and add manifest tests.
5. Unify upload facade and evidence: deprecate sketch-as-hex fallback, route AVR through `webSerialFlash`, R4 through `webDfuFlash`/local agent job flow, and return one structured upload result for LessonOS event-log.

## 10. CoV: commands executed and audit limits

Commands executed:

```bash
git -C "/Users/andreamarro/VOLUME 3/ardesia" log -1 origin/main --oneline --decorate
git -C "/Users/andreamarro/VOLUME 3/ardesia" status --short --branch
gh pr list -R AndreaMarro/ardesia --state open --json number,title,isDraft,headRefName,updatedAt --limit 20
find . -name AGENTS.md -print
rg --files
rg -n "Arduino|AVR|compile|upload|Web Serial|Nano|RA4M1|UNO|hex|ino|Scratch|serial|webusb|web serial|avr|ra4m1"
find plugins/elab-tutor/src/data/lesson-paths -name 'v3-*.json' | wc -l
find plugins/elab-tutor/public/hex -maxdepth 1 -type f -name '*.hex' | sort
node --input-type=module <Vol3 static compiler/support sweep>
nl -ba <relevant files> | sed -n <ranges>
test -f plugins/elab-tutor/public/hex/<referenced files>
```

Documents read:

- `/Users/andreamarro/VOLUME 3/PROMPT-NEXT-FABLE-2026-07-11-NOTTE9.md`
- `docs/ops/CODEX-ELAB-COVERAGE-AUDIT-2026-07-10.md`
- `docs/product/ELECTROTECHNICS-SOLVER-PACK.md`
- `docs/product/ELABTUTOR-SIMULATION-PLUGIN-REBUILD-SPEC-2026-07-03.md`
- `docs/ELAB-SCENE-FORGE-CANON.md`
- `AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- Package-local `AGENTS.md` files for inspected areas.

Audit limits:

- No full test suite was run. This was a read-only/source audit plus one static Node sweep.
- No hardware was attached or flashed.
- No browser WebUSB/WebSerial manual run was performed.
- No `.env*` files or secrets were read.
- Worktree was dirty before this audit, including FABLE-adjacent files. This document intentionally ignores that WIP except as coordination risk.
- No source files were modified.
- No `git add`, commit, push, deploy, or destructive command was run.

## 11. HANDOFF CODEX PKT-CODEX-2

The current codebase contains useful compile/upload building blocks, but the honest product state is:

- Vol.3 content coverage exists as data/code/Scratch for 23 experiments.
- Full compile/upload coverage does not exist for 23 experiments.
- Browser-native AVR compile/upload is plausible for a small Uno/Nano subset.
- Nano R4 needs `arduino-cli` or verified artifacts plus WebUSB/local-agent upload evidence.
- The next safe PR should freeze the support matrix and broken contracts in docs/tests before changing user-facing compile/upload behavior.

This handoff is independent of FABLE P0-LIVE/P0-C. Any future event-log integration should coordinate with FABLE and avoid `Room.tsx`, `ToolCanvasEmbeddable.tsx`, `lessonos/bootstrap.ts`, and ToolHost core surfaces until their work lands.
