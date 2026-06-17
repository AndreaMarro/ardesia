# Istruzioni Importazione Workflow n8n — ELAB

Server: `https://n8n.srv1022317.hstgr.cloud`
Data: 19/02/2026

---

## Workflow da importare

| # | File | Webhook | Funzione |
|---|------|---------|----------|
| 1 | `elab-admin.json` | `/webhook/elab-admin` | CRUD Notion (11 DB) + KPI + Activity Feed |
| 2 | `elab-license.json` | `/webhook/elab-license` | Verifica/rilascio licenze |
| 3 | `elab-compile.json` | `/webhook/elab-compile` | Compilazione Arduino (fallback) |

Tutti i workflow usano lo **stesso pattern del GDPR funzionante**: 2 nodi (Webhook + Code), `responseMode: lastNode`, `allowedOrigins: *`.

**Token Notion e DB IDs sono già configurati nel codice** — nessuna credenziale da collegare.

---

## Importazione (per ogni file)

1. Apri n8n: `https://n8n.srv1022317.hstgr.cloud`
2. **"+ Add Workflow"** → **"..."** → **"Import from File..."**
3. Seleziona il file `.json`
4. Click toggle **"Active"** (da rosso a verde)
5. Fatto!

---

## Test

### Admin (ping):
```bash
curl -X POST https://n8n.srv1022317.hstgr.cloud/webhook/elab-admin \
  -H "Content-Type: application/json" \
  -d '{"action":"ping"}'
```
Risposta: `{"status":"ok","notion":true,"timestamp":"..."}`

### License (verify MVP):
```bash
curl -X POST https://n8n.srv1022317.hstgr.cloud/webhook/elab-license \
  -H "Content-Type: application/json" \
  -d '{"action":"verify","code":"ELAB-TEST-0001","sessionId":"test-123"}'
```
Risposta: `{"valid":true,"school":"ELAB Makers","plan":"base",...}`

### Compile:
```bash
curl -X POST https://n8n.srv1022317.hstgr.cloud/webhook/elab-compile \
  -H "Content-Type: application/json" \
  -d '{"code":"void setup(){} void loop(){}","board":"arduino:avr:nano:cpu=atmega328old"}'
```
Risposta: `{"success":true,"hex":"...","errors":null,...}`

**Nota**: Il compile richiede `arduino-cli` installato sul VPS. Se non c'è:
```bash
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
arduino-cli core install arduino:avr
```

---

*ELAB n8n Workflows — Andrea Marro, 19/02/2026*
