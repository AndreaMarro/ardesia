# Nano R4 Fisicamente Possibile — 2026-05-27

Goal: upload + cross-compile concretamente possibile per Arduino Nano R4 reale.

## Stato VERIFICATO

| Path | Stato | Evidenza |
|---|---|---|
| Compile R4 via Render cloud-compile | ⚠ deploy pending — codice + Dockerfile + render.yaml pronti in `infra/cloud-compile/` | Andrea redeploy 3 step |
| **Compile R4 via local cloud-compile** | ✅ **WORKS** — `node infra/cloud-compile/server.js` su Mac Andrea | curl test 109KB HEX returned ✅ |
| Compile R4 via Vercel `/api/compile/nanor4` | ⚠ 503 fino al deploy Render | Honest fallback |
| Compile R4 via Supabase compile-proxy | ⚠ fqbn ora forwarded, ma n8n no Renesas core | precompiled HEX OR local |
| Compile R4 precompiled HEX | ✅ esp3 + esp4 (e gli altri Vol3 Cap.6 via `npm run compile:r4:precompile`) | files in `public/hex/*-r4.hex` |
| Upload R4 via WebUSB DFU | ✅ webdfu lib + Renesas filters | 22/22 unit tests PASS |
| Upload R4 via local agent | ✅ legacy path via `localhost:8765/compile-and-upload` | CompileUploadButton |

## 1 comando per attivare R4 fisicamente (locale)

```bash
# Terminal 1 — start local R4 compile backend
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run compile:r4:start

# (alternative: docker)
npm run compile:r4:docker

# Terminal 2 — start dev server
npm run dev
```

Apri Chrome/Edge → http://localhost:5173/#compile-home → scrivi codice → "Compila" → backend localhost:8765 → real R4 HEX → "Carica su Arduino Nano R4" → seleziona porta USB Nano R4 in modalità DFU → flash.

## Modalità DFU Nano R4

1. Collega Nano R4 via USB
2. Premi **2 volte** RAPIDAMENTE il tasto RESET → la scheda entra in modalità DFU (LED L lampeggia)
3. Il browser dropdown USB device picker mostra "Nano R4" (VID 0x2341 PID 0x0070 o Renesas VID 0x045B)
4. Seleziona → webdfu library flasha il binario
5. Reset automatico → sketch in esecuzione

## Boards supportate live (registry `services/arduinoBoards.js`)

| Board | Compile | Upload | Note |
|---|---|---|---|
| Nano R4 | ✅ cloud-compile locale + Render + precompiled | ✅ WebUSB DFU | **Hardware target principale ELAB** |
| Uno R4 Minima/WiFi | ✅ cloud-compile | ✅ WebUSB DFU | Same protocol R4 |
| Nano ATmega328P | ✅ in-browser JS compiler (no backend) + Supabase | ✅ WebSerial stk500v1 | Chrome/Edge desktop |
| Uno R3 | ✅ in-browser JS + cloud | ✅ WebSerial stk500v1 | Same |
| Mega 2560 | ⚠ cloud-compile | ⚠ WebSerial stk500v2 stub | Untested hardware |
| Leonardo (32U4) | ⚠ cloud-compile | ⚠ WebSerial stk500v1 stub | Untested |
| Nano 33 IoT (SAMD21) | ⚠ cloud-compile | ❌ BOSSA non implementato | Honest stub |
| Nano 33 BLE | ⚠ cloud-compile | ❌ BOSSA-like non implementato | Honest stub |
| Nano ESP32 | ⚠ cloud-compile | ❌ esptool non implementato | Honest stub |

## Server cloud-compile locale — quando va?

- `npm run compile:r4:start` → `node server.js` plain Node
- `npm run compile:r4:docker` → Docker container (richiede Docker Desktop / colima)
- Health: `curl http://localhost:8765/health` → `{arduino_cli_ready:true, core_renesas_uno_installed:true}`
- Boards supportate dal server: `arduino:renesas_uno:nanor4`, `arduino:avr:uno`, `arduino:avr:nano:cpu=atmega328old`

## Per Andrea — checklist deploy prod

```bash
# 1. Deploy Render cloud-compile (richiede credenziali Render + ratify $7/mo)
#    Dashboard → New Web Service → connect repo → rootDir infra/cloud-compile → Docker → Starter → Frankfurt
#    Render auto-genera ELAB_CLOUD_COMPILE_API_KEY

# 2. Vercel env vars (Production + Preview):
vercel env add ELAB_CLOUD_COMPILE_URL          # https://elab-cloud-compile-XXX.onrender.com
vercel env add ELAB_CLOUD_COMPILE_API_KEY      # from Render dashboard

# 3. Deploy Supabase patched compile-proxy (forward fqbn)
SUPABASE_ACCESS_TOKEN=sbp_xxx npx supabase functions deploy compile-proxy \
  --project-ref euqpdueopmlllqjmqnyb

# 4. Build + deploy Vercel
npm run build && npx vercel --prod --yes

# 5. Verifica
curl https://elabtutor.school/api/compile/nanor4 -X POST \
  -H "Content-Type: application/json" \
  -d '{"sketchCode":"void setup(){pinMode(13,OUTPUT);}void loop(){}","fqbn":"arduino:renesas_uno:nanor4"}'
# Atteso: {ok:true,hexBase64:"..."}
```

## Test coverage

| Suite | Tests | Status |
|---|---|---|
| `arduinoBoards.test.js` | 10 | ✅ |
| `arduinoUploader.test.js` | 9 | ✅ |
| `inBrowserAvrCompiler.test.js` | 14 | ✅ avr8js executes our HEX |
| `cppToArduinoBlocklyXml.test.js` | 12 | ✅ |
| `services/webDfuFlash.test.js` | 22 | ✅ DfuSe segment 0x4000 verified |
| `scratchXmlValidation.test.js` (regression) | 8 | ✅ |
| **Total** | **75** | **✅ all pass** |

## File chiave creati questa sessione

```
src/services/
├── arduinoBoards.js                  — 11-board canonical registry
├── arduinoUploader.js                — universal dispatcher
├── webSerialFlash.js                 — stk500v1 protocol
└── inBrowserAvrCompiler.js           — ATmega328P codegen

src/components/lavagna/
├── BoardPicker.jsx                   — dropdown 11 boards
├── UniversalUploadButton.jsx         — auto-routing upload
├── R4DfuUploadButton.jsx             — WebUSB DFU specific (legacy stand-alone)
└── WebSerialUploadButton.jsx         — WebSerial stk500 stand-alone

src/features/elabArduinoAst/generators/
└── cppToArduinoBlocklyXml.js         — runtime stub regenerator

infra/cloud-compile/
├── docker-compose.yml                — 1-command local backend
├── Dockerfile + server.js            — arduino-cli + Renesas backend (existing)
└── render.yaml                       — production deploy config

public/hex/
├── v3-cap6-esp3.hex                  — AVR variant
├── v3-cap6-esp3-r4.hex               — Renesas R4 variant
├── v3-cap6-esp4.hex                  — AVR
├── v3-cap6-esp4-r4.hex               — R4
└── v3-cap6-esp1/2-r4.hex (etc)       — generated by npm run compile:r4:precompile

scripts/
└── precompile-r4-experiments.js      — bulk precompile Vol3 R4

docs/
├── DEPLOY-2026-05-27.md              — full deploy guide
└── NANO-R4-PHYSICAL-2026-05-27.md    — this doc
```
