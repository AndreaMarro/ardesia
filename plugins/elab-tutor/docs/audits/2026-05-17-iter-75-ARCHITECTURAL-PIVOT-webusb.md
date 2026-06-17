# ITER 75 ARCHITECTURAL PIVOT — Cross-compile NO download, web direct

**Date**: 2026-05-17 PM
**Trigger**: Andrea direttiva esplicita "Non deve essere qualcosa che scarichi. Deve funzionare DIRETTAMENTE dalla piattaforma elabtutor."
**Status**: BG agents CC-1 + CC-5 STOPPED, worktrees cleanup. Pivot architectural required.

## Impatto MASSIVO iter 63-75 work

**OBSOLETO** (basato local agent install architecture):
- iter 63 PROPOSED `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` (local Node server localhost:8765)
- iter 64 SPEC `docs/specs/2026-05-15-elab-compile-agent-public-distribution-spec.md` Option B Tauri signed installer
- iter 65 P0 R4 `compileAgentDetect.js` browser probe localhost:8765
- iter 66 R5 `CompileAgentBanner.jsx` install state UI
- iter 70 P0.5 `src/services/elab-agent/{server,http-server,cli,sketch-builder,error-translator}.js` 829+ LOC backend
- iter 70 BG-A2+A3 Express HTTP factory + CompileUploadButton iter 70 + 5be2bfd6 npm install express+cors
- iter 71 PORT-UNIFY 17852→8765 canonical
- iter 72 BG-A7 api.js Nano R4 FQBN whitelist + NewElabSimulator ScratchCompileBar wire
- iter 73 CC-2 HomePage `#compile-home` lazy mount entry (parzialmente preservato — UI shell ok, backend changes)
- iter 74 hardware UAT prep docs install bash docente (OBSOLETO step 3-4)
- iter 75 ENTRANCE-A.1-A.2-A.4-B-1+B-2+B-3+B-4+C (preservato — narrative + UI)
- iter 75 CC-1 + CC-5 BG (STOPPED prevent waste)

**PRESERVATO** (NON dipende local agent):
- iter 57 Vol3 narrative chain (lesson-paths) ✅
- iter 72 BG-A6 HomePage emoji + Album Supabase wire ✅
- iter 73 CC-2 HomePage `#compile-home` route shell + ScratchEditor Blockly editor ✅ (refactor target backend)
- iter 74 B-1 cliffhanger CTA wire ✅
- iter 75-B1-FIX runtime wire ScratchCompileBar ✅
- iter 75 CC-2 emoji removal ScratchCompileBar ✅

## Iter 64 SPEC Option A WebUSB direct (Andrea now ratifies)

iter 64 SPEC esplicitamente valutava 3 opzioni:

### Option A WebUSB-only (browser direct, NO local agent) — Andrea NOW ratify

**Architecture**:
1. Browser Chrome/Edge → WebUSB API → richiede permesso utente per dispositivo USB
2. ScratchEditor Blockly → genera Arduino C++ string
3. Frontend POST sketch a Cloud Compile Service (Supabase Edge / Cloudflare Worker / Render arduino-cli)
4. Cloud Service: arduino-cli compile → return HEX bytes
5. Browser WebUSB DFU library → mette Nano R4 in DFU mode → flash HEX direct
6. LED blink → success

**Pro**:
- ZERO install docente — apri browser, premi Compila&Upload, fatto
- Infrastruttura ELAB hosted controlled
- Auto-update transparent
- Cross-platform (Chrome/Edge Mac/Win/Linux/ChromeOS)

**Con**:
- Chrome/Edge ONLY (Safari NON supporta WebUSB — escludere ~30% scuole Mac default)
- Cloud compile cost ~$10-30/mo hosting arduino-cli
- CORS strict
- Chrome USB permissions ogni sessione (UX friction)

**Risk**:
- Scuole italiane Mac default Safari → docente deve usare Chrome (training/install Chrome richiesto)
- WebUSB richiede HTTPS (prod OK, dev localhost OK)

**Time**: ~20-30h infrastructure + 6h frontend integration

### Option B Tauri signed installer — Andrea NOW REJECT

(skip)

### Option C Hybrid — Andrea defer

WebUSB primary + Tauri fallback Safari users. Defer Sprint V+.

## Iter 76+ master plan WebUSB cloud refactor

### Phase 1 — Cloud Compile Service (NEW backend)

**Tech choice options Andrea ratify**:

| Option | Pro | Con | Cost |
|---|---|---|---|
| **Supabase Edge Function Deno** | Already used ELAB (12 functions) + EU residency Frankfurt | arduino-cli binary deploy NON trivial Deno + 500MB limit | ~$0 free tier 500K invocations |
| **Cloudflare Worker + Containers** | New 2025 product (verify), free tier + WebSocket | New product reliability unknown | ~$5/mo Workers Paid |
| **Render web service Node** | arduino-cli + Renesas core install OK + Docker | Cold start ~10s + cost ~$7/mo Starter | ~$7-25/mo |
| **Vercel Serverless Function Node** | Already used ELAB frontend (Vercel deploy) + Fluid Compute | arduino-cli binary 200MB function limit | ~$0 hobby tier ~250 invocations |
| **Fly.io** | Docker arduino-cli + Renesas core easy + EU regions | NEW infrastructure | ~$2-10/mo |
| **Railway** | Docker easy + arduino-cli OK | NEW infrastructure | ~$5/mo |

**Recommended**: **Render web service** OR **Fly.io** (arduino-cli + Renesas core 1.5.3 require ~500MB filesystem + persistent install — serverless functions size-limited).

### Phase 2 — Frontend WebUSB integration

- Add `navigator.usb.requestDevice({ filters: [{vendorId: 0x2341, productId: 0x0070}] })` (Nano R4 vendor:product TBD verify)
- Web DFU library (`dfu-util` JS port OR `web-dfu` npm)
- Replace `CompileUploadButton.jsx` agent POST → WebUSB direct flash flow
- Replace `compileAgentDetect.js` → WebUSB feature detect `navigator.usb` available
- Replace `CompileAgentBanner.jsx` install prompt → Chrome/Edge browser requirement + Safari escluso notification

### Phase 3 — Cloud Compile API

- Endpoint POST `/api/compile-arduino` con `{sketchCode, fqbn}`
- Return JSON `{ok, hexBytes, hexBase64, errors, jobId}`
- Auth: Vercel/Supabase API key OR JWT
- Rate limit (Andrea + cloud service throttling)
- Sandbox compile (Docker isolate)

### Phase 4 — Safari fallback (Andrea decide)

**Option 1**: Safari users → Chrome required notice (training/install scuole)
**Option 2**: Safari → download HEX + Arduino IDE manual upload (frizione docente)
**Option 3**: Sprint V+ Tauri signed installer per Safari users

### Phase 5 — Hardware UAT real

Andrea/Tea + Nano R4 USB cable + Chrome browser → test end-to-end web direct.

## Iter 75 close action

1. Push iter 75 ENTRANCE commits already shipped (SPEC + PLAN + CC-2 emoji + CC-6 docs + CC-3 audit + 75-B1-FIX + 75-B.1+B.2 + baseline sync) — PRESERVATI (NON dipendono pivot)
2. Mark CC-1 + CC-5 BG agents OBSOLETI per pivot
3. Iter 76+ NEW master plan WebUSB cloud architecture
4. Iter 76+ NEW SPEC + PLAN docs
5. Local agent code `src/services/elab-agent/` — DECIDE Andrea: rimuovere OR mantenere come dev tool

## 5 honesty caveats critical

1. **iter 63-75 cross-compile chain SOFTWARE local-agent ARCHITECTURE OBSOLETA**. Lavoro NON sprecato totalmente (UI shell + Blockly + lesson-paths preservati MA backend completo da rifare).
2. **Andrea iter 64 SPEC Option A WebUSB era già nella matrice**: orchestrator (me) ha implementato Option B local agent direction MEGA across iter 63-74 → quando Andrea verifica iter 75 dice "no download" = pivot mandatory. Errore framework architettura iniziale iter 63 — dovevo chiedere Andrea esplicito A vs B vs C prima implement.
3. **Safari exclusion ~30% scuole Mac default**: NO trivial decision. Andrea ratifica strategy (Chrome required notice OR Safari Tauri Sprint V+ OR download HEX manual).
4. **Cloud compile hosting cost ~$10-30/mo**: stable scope NOT free tier sufficient (arduino-cli 500MB filesystem + Renesas core install + Docker isolation).
5. **WebUSB Nano R4 vendor:product ID + DFU library compatibility**: NON empirico verified ancora. Iter 76+ first verify dfu-util JS port works against Nano R4 RA4M1 stack.

## Andrea decisione iter 76+ entrance (5 critical questions)

1. **Safari users strategy**: A (Chrome required notice + docente install Chrome) / B (download HEX + Arduino IDE manual) / C (Sprint V+ Tauri Safari fallback) / D (other)?

2. **Cloud compile hosting**: Render Node ($7-25/mo) / Fly.io Docker ($2-10/mo) / Cloudflare Worker (~$5/mo) / Vercel Fluid Compute Node (~$0-10/mo) / Supabase Edge Deno (uncertain arduino-cli compat) — quale?

3. **WebUSB feature detect timing**: probe `navigator.usb` PRE-mount HomeCompileEntry route (fail-fast Safari users) OR allow mount + show error post-action?

4. **Local agent code `src/services/elab-agent/`**: rimuovere completamente (zero debito) OR mantenere come dev-only tool (verify per Andrea/Tea testing software pre-deploy)?

5. **Iter 75 commits already pushed origin** (SPEC + PLAN + CC-2 + CC-6 + CC-3 + others): rollback OR preserve documentation valore (eventuali parts WebUSB applicabili)?

## Cross-link

- iter 64 SPEC Option A WebUSB rejected initially (Andrea now ratify): `docs/specs/2026-05-15-elab-compile-agent-public-distribution-spec.md`
- iter 75 SPEC local-agent direction OBSOLETE: `docs/specs/2026-05-17-iter-75-cross-compile-nano-r4-CERTAINTY-master-spec.md` (mark deprecated iter 76+)
- iter 75 PLAN multi-track local-agent OBSOLETE: `docs/plans/2026-05-17-iter-75-cross-compile-MULTI-TRACK-master-plan.md` (mark deprecated iter 76+)
- Codex iter 64 SPEC Option A original analysis sezione "Approcci Considerati"
- Memory feedback_omaric_comms: Riccardo Omaric linguaggio semplice (Tauri installer iter 64 Option B era anche per lui — pivot WebUSB elimina Riccardo install complexity, è meglio per Omaric)

## Conclusione onesta

ELAB Tutor cross-compile chain LOCAL-AGENT direction iter 63-75 OBSOLETA. Pivot WebUSB cloud direzione canonica iter 76+.

Lavoro iter 73-75 ENTRANCE preservato per parti UI/narrative/CTA (NON dipende backend). Backend `src/services/elab-agent/` candidato rimozione completa OR dev-tool mantenimento.

NON COMPIACERE — errore iniziale iter 63 dovevo chiedere Andrea Option A/B/C esplicito. Ora pivot mandatory + iter 76+ new architecture sprint.
