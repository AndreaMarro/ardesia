# P0 Verifications — 2026-05-24 01:45

**Sessione setup autonomo notte 23→24/05.** Andrea dorme. Mac principale.

## Results

| Q | Item | Status | Notes |
|---|---|---|---|
| Q1 | Compile endpoint n8n `https://n8n.srv1022317.hstgr.cloud/compile` | ❌ FAIL | HTTP `Bad Gateway`. Server down OR misconfigured. Need verify domani mattina. |
| Q3 | Gemini API key (via Supabase Edge `unlim-chat`) | ⏸ SKIPPED | API key non disponibile in scope sessione autonoma. Andrea verifica domani con `ELAB_API_KEY` env. |
| Q9 | Mac mini SSH `andreamarro@macmini.local` | ❌ FAIL | hostname non risolve. Possible: Mac mini offline, Tailscale non attivo, hostname diverso (es. `macmini-strambino.local` o IP diretto). |
| Q12 | Nano R4 hardware fisico | ⏸ PENDING | Physical action richiesta Andrea (collega via USB-C + Chrome DevTools `navigator.usb.requestDevice({filters:[{vendorId:0x2341}]})`). |

## Action items mattina 24/05

1. **Q1 critico**: investigare n8n compile endpoint Bad Gateway.
   - Curl `https://n8n.srv1022317.hstgr.cloud/health` per check server.
   - Alternative: `infra/cloud-compile/server.js` Render scaffold (`render.yaml` mostra Frankfurt $7/mo, NON CONFERMATO deployed).
   - Fallback: usa HEX pre-compilato + emulation se nessun endpoint funziona.
2. **Q3**: Andrea esegue `bash <<EOF; cat ~/.elab-credentials.env; EOF` per recuperare key + curl test.
3. **Q9**: chiarire hostname Mac mini (è realmente `macmini.local`? Tailscale `macmini.tail-XYZ.ts.net`?).
4. **Q12**: collega Nano R4 + Chrome WebUSB test.

## Cloud-compile Render alternative scaffold

File: `infra/cloud-compile/server.js` + `infra/cloud-compile/render.yaml`.

Config per Andrea iter 76 entrance:
- Render Starter $7/mo Frankfurt
- Port 8765 auto-set
- env `ELAB_CLOUD_COMPILE_API_KEY` (generate `openssl rand -hex 32`)
- Health check `/health`
- Auto deploy on push main

**Domanda critica mattina**: questo servizio è effettivamente deployed su Render? URL?
Se non deployed → opzioni:
- A) Deploy ora (~10-15 min)
- B) Run server.js locale + ngrok tunnel
- C) Skip live compile, use HEX pre-compilato fallback

## Verifications eseguite con successo

- ✅ Worktree `elab-builder-demo25` created da `origin/main` 4d75c0ca
- ✅ Branch `feat/demo-25may` attivo
- ✅ 10 file infrastructure committed (spec + plan + handoff + plugin + 2 skill + subagent + UNLIM eval JSON)
- ✅ PDF extraction 55 pages PNG da volumi DEFINITIVI in `VOLUMI pdf e MD/`:
  - Vol1 cap6 LED: 14 pages (pag 27-40)
  - Vol2 cap7 condensatori: 18 pages (pag 63-80)
  - Vol3 cap6 pin digitali: 23 pages (pag 43-65)
- ✅ Location pages: `docs/demo-25may/volumes-pages/vol{1,2,3}/page-NN.png`

## TODO mattina prima di Phase P1

1. Andrea visivamente sceglie reference image per ogni 7 esp da `volumes-pages/`:
   - v1-cap6-esp1 "Accendi il tuo primo LED" → pick best PNG da vol1/
   - v1-cap6-esp2 "LED senza resistore" → pick PNG vol1/
   - v1-cap6-esp3 "Cambia luminosità" → pick PNG vol1/
   - v2-cap7-esp1 "Scarica multimetro" → pick PNG vol2/
   - v2-cap7-esp2 "Scarica LED rosso fade" → pick PNG vol2/
   - v3-cap6-esp4 "Due LED alternano" → pick PNG vol3/
   - v3-cap6-esp5 "Semaforo" → pick PNG vol3/
2. Andrea copy 7 PNG selected in `docs/demo-25may/circuit-references/<exp-id>.png` (5-10 min visual task).
3. Solo poi Phase P1 Task 10-12 (build_circuit coordinate per hero esp) ha senso.
