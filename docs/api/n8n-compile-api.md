# Compile API — ELAB Tutor

> Documento di riferimento human-readable per il compile pipeline Arduino di ELAB Tutor.
> **Source-of-truth canonical**: [`docs/api/n8n-compile-openapi.yaml`](./n8n-compile-openapi.yaml) (OpenAPI 3.1).
> **Status**: DRAFT iter 59 — pending Andrea ratify R3 prereq (`arduino-cli core install arduino:renesas_uno` sul server n8n).

## 1. Overview

Il compile endpoint riceve uno sketch Arduino (`.ino` content) + un FQBN board, compila via `arduino-cli` server-side, ritorna Intel HEX upload-ready (success) o errori di build. È chiamato da Blockly editor (`ScratchEditor.jsx` → `compileCode()` in [api.js:1293](../../src/services/api.js#L1293)) quando docente preme "Compila". iter 59 estende l'allowlist board per supportare Arduino Nano R4 (Renesas RA4M1) — hardware effettivo del kit Omaric.

## 2. Call chain fallback (api.js)

Ordine di tentativo dal browser production `www.elabtutor.school`:

1. **Supabase compile-proxy** (HTTPS browser CORS-safe): `${SUPABASE_EDGE}/compile-proxy` — env `VITE_COMPILE_PROXY_URL`.
2. **Server standalone** (`compile-server.js` sul VPS): `COMPILE_URL` — usato in CLI / non-browser / local dev `http://localhost`.
3. **Backend webhook legacy**: `COMPILE_WEBHOOK` — fallback finale.

⚠️ **Browser production NON chiama direttamente `n8n.srv1022317.hstgr.cloud/compile`** — CORS bloccato. Solo CLI/server o local dev possono usare il path diretto.

## 3. Authentication

Headers richiesti per `/compile-proxy` (Supabase Edge):

| Header | Valore | Fonte |
|---|---|---|
| `apikey` | Supabase anon JWT | `VITE_SUPABASE_ANON_KEY` env |
| `Authorization` | `Bearer ${SUPABASE_ANON_KEY}` | idem |
| `X-Elab-Api-Key` | application key (rate limit) | `ELAB_API_KEY` env — rotated iter 32 PM |

Per `/compile` diretto n8n / VPS: nessun header auth (CORS blocca da browser; CLI/server free-call). Reference: [api.js:1314-1320](../../src/services/api.js#L1314).

## 4. Endpoints

| Method | Path | Purpose | Auth |
|---|---|---|---|
| POST | `/compile-proxy` | Compile via Supabase proxy (browser-safe) | Sì (3 headers) |
| POST | `/compile` | Compile diretto n8n (non-browser only) | No |
| GET | `/healthz` | Health + lista core arduino-cli installati | No |

## 5. Request schema (`CompileRequest`)

```json
{
  "code": "void setup() { pinMode(13, OUTPUT); }\nvoid loop() { ... }",
  "board": "arduino:avr:nano:cpu=atmega328old",
  "libraries": ["Servo", "WiFiS3"]
}
```

| Campo | Tipo | Required | Vincoli |
|---|---|---|---|
| `code` | string | ✅ | 1-65536 char, Arduino C++ syntax |
| `board` | enum string | ✅ | Allowlist enforced (vedi §7) |
| `libraries` | string[] | ❌ | Reserved — non usato dal client corrente |

## 6. Response schema (`CompileResponse`)

```json
{
  "success": true,
  "hex": ":100000000C9434...",
  "errors": null,
  "output": "Sketch uses 924 bytes (3%) of program storage.",
  "result": "Sketch uses 924 bytes (3%)"
}
```

| Campo | Tipo | Note |
|---|---|---|
| `success` | bool | True = HEX generato, False = build error |
| `hex` | string\|null | Intel HEX upload-ready (arduino-cli upload format) |
| `errors` | string\|null | Build/link errors. Alias `error` in alcune versioni backend |
| `output` | string\|null | arduino-cli stdout (build log, RAM/Flash). Alias `stdout` in alcune versioni |
| `result` | string\|null | Convenience: primo non-null tra `output`/`stdout`/`errors`/`error` |

⚠️ **Gotcha**: il backend a volte wrappa la response in array `[{...}]`. Client auto-unwrap se `Array.isArray(data) && data[0]?.success !== undefined` ([api.js:1331-1333](../../src/services/api.js#L1331)).

## 7. Board allowlist

**Corrente** ([api.js:61](../../src/services/api.js#L61)):
- `arduino:avr:nano:cpu=atmega328old` — Arduino Nano classic (AVR ATmega328p) — DEFAULT
- `arduino:avr:uno` — Arduino UNO classic (AVR ATmega328p)

**iter 59 R2 aggiunge** (PENDING Andrea ratify R3):
- `arduino:renesas_uno:unor4wifi` — Arduino UNO R4 WiFi / Nano R4 WiFi (Renesas RA4M1 Cortex-M4)
- `arduino:renesas_uno:minima` — Arduino UNO R4 Minima / Nano R4 Minima

### PREREQ Andrea iter 59 Phase 1 entrance

Verificare via SSH sul server n8n:
```bash
arduino-cli core list | grep renesas
```
Se manca, installare:
```bash
arduino-cli core install arduino:renesas_uno
```
Senza questo prereq, request con `board='arduino:renesas_uno:unor4wifi'` ritorna `success: false, errors: "Unknown FQBN: platform arduino:renesas_uno not installed"`.

## 8. Examples

### Esempio 1 — AVR Nano classic compile (corrente, deve sempre funzionare)

```bash
curl -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/compile-proxy \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "X-Elab-Api-Key: $ELAB_API_KEY" \
  -d '{
    "code": "void setup() { pinMode(13, OUTPUT); }\nvoid loop() { digitalWrite(13, HIGH); delay(500); digitalWrite(13, LOW); delay(500); }",
    "board": "arduino:avr:nano:cpu=atmega328old"
  }'
```

### Esempio 2 — Nano R4 WiFi compile (iter 59 NEW)

```bash
curl -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/compile-proxy \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "X-Elab-Api-Key: $ELAB_API_KEY" \
  -d '{
    "code": "void setup() { pinMode(LED_BUILTIN, OUTPUT); }\nvoid loop() { digitalWrite(LED_BUILTIN, HIGH); delay(500); digitalWrite(LED_BUILTIN, LOW); delay(500); }",
    "board": "arduino:renesas_uno:unor4wifi"
  }'
```

### Esempio 3 — Error response (Renesas core missing)

Request come Esempio 2 prima del prereq install:
```json
{
  "success": false,
  "hex": null,
  "errors": "fqbn arduino:renesas_uno:unor4wifi: Unknown FQBN: platform arduino:renesas_uno not installed",
  "output": null,
  "result": "Unknown FQBN: platform arduino:renesas_uno not installed"
}
```

## 9. Error codes

| Status | Causa | Recovery |
|---|---|---|
| 400 | `code` mancante / `board` non in allowlist / payload >65KB | Verifica request body |
| 401 | apikey o Authorization mancante/invalido / X-Elab-Api-Key mancante | Rotate keys (iter 32 PM pattern) |
| 408 | Timeout >65s (arduino-cli stuck OR core download long) | Retry con backoff; verifica health endpoint |
| 503 | Fallback chain exhausted (proxy + standalone + webhook tutti irraggiungibili) | Check VPS/n8n/Supabase status |

## 10. Security notes

- **CORS browser production**: blocca chiamate dirette a `n8n.srv1022317.hstgr.cloud/compile`. Solo Supabase proxy autorizzato (HTTPS same-origin tramite `${SUPABASE_EDGE}/compile-proxy`).
- **Rate limiting**: `X-Elab-Api-Key` enforced sul proxy Supabase. ELAB_API_KEY ruotata iter 32 PM (security incident).
- **Code sandbox**: arduino-cli compila in sandbox sul VPS — no exec, no network. Threat model: arbitrary C++ → HEX → ma compile-only, no run.
- **Library install gated**: campo `libraries` reserved ma non implementato — evita escalation `--install-library` arbitraria.

## 11. Timeout

`COMPILE_TIMEOUT = 65000` ms (65s) — [api.js:57](../../src/services/api.js#L57). Tarato a `arduino-cli` 60s interno + 5s margine. Client usa `AbortController.abort()` allo scadere.

## 12. Implementation file refs

| Reference | Path | Linea | Ruolo |
|---|---|---|---|
| Client function | [src/services/api.js](../../src/services/api.js) | 1293-1338 | `compileCode(code, board)` |
| Allowlist Set | [src/services/api.js](../../src/services/api.js) | 61 | `ALLOWED_COMPILE_BOARDS` |
| Default board | [src/services/api.js](../../src/services/api.js) | 60 | `DEFAULT_BOARD` |
| Timeout const | [src/services/api.js](../../src/services/api.js) | 57 | `COMPILE_TIMEOUT` |
| Fallback chain | [src/services/api.js](../../src/services/api.js) | 1340-1360 | proxy → standalone → webhook |
| CORS comments | [src/services/api.js](../../src/services/api.js) | 1352-1359 | "fail browser CORS" comments |
| OpenAPI canonical | [docs/api/n8n-compile-openapi.yaml](./n8n-compile-openapi.yaml) | tutto | source-of-truth contract |
| PRD R4+R5 | [docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md](../specs/2026-05-15-iter-59-blockly-cross-compile-ux.md) | R4+R5 | iter 59 acceptance criteria |

## 13. Changelog

| Versione | Data | Note |
|---|---|---|
| 1.0.0-draft | 2026-05-15 | iter 59 entrance — Renesas FQBN documentati, prereq core install flagged |

## 14. TODO iter 60+

- [ ] Andrea ratify R3 prereq: `arduino-cli core install arduino:renesas_uno` su server n8n
- [ ] Verifica `compile-proxy` Edge Function path Renesas FQBN (potrebbe richiedere update Edge function se filtra board)
- [ ] Aggiunge `libraries` field implementation (P2 nice-to-have)
- [ ] Health endpoint `/healthz` deploy + monitor
- [ ] Spec validation via `npx @apidevtools/swagger-cli validate docs/api/n8n-compile-openapi.yaml` in CI
