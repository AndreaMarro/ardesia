# Live Verify T1 — 20/04/2026

**SHA tested**: `569d55a` (branch `feature/live-verify-2026-04-20` from `main`)
**Session start**: 2026-04-20 02:00 CET
**Verifier**: Claude Opus 4.7 (Claude Code) + Playwright MCP
**Scope T1**: UI render + click flows + Principio Zero v3 backend

---

## Executive summary

| # | Step | Verdict | Notes |
|---|------|---------|-------|
| 1 | `browser_navigate` prod + HTTP + console | **PASS w/ anomaly** | HTTP 200, load 2.24s. `/health` 405 + stale SW chunk 404 reproducible post-reload |
| 2 | `browser_snapshot` VisionButton + Fumetto | **PASS (dev fallback)** | Prod blocked by chiave test absente. Rendered via `localhost:5173/#lavagna` dev bypass |
| 3 | Click VisionButton + `[Vision]` log | **FAIL** | Button stays `disabled=true` due React race. Direct API call returns empty screenshot |
| 4 | Click Fumetto + new tab + popup | **PARTIAL-PASS** | Wire-up OK (`handleFumettoOpen` → `UnlimReport.openReportWindow`). Silent no-op: no session data → returns `false` senza feedback UX |
| 5 | Principio Zero v3 chat (CRITICAL) | **PASS** | `hasRagazzi=true`, `hasDocenteLeggi=false`, `hasDocenteMetaImperativa=false` |
| 6 | Network `unlim-chat` verify | **PASS** | POST Supabase edge function → 200, CORS OK, anon key auth |
| CoV | 3x navigate prod HTTP 200 stable | **PASS** | 0.19s / 0.15s / 0.17s |

**Bottom line**: prod backend (PZ v3, unlim-chat, network) GREEN. Prod frontend GREEN su first-load, RED su reload cached (SW cache regression). UX gaps (VisionButton disabled race, Fumetto silent no-op) da indirizzare. Chiave test PROD assente = blocker per full prod E2E senza dev fallback.

---

## Path taken (decision tree autonomous)

1. `browser_navigate https://www.elabtutor.school` → homepage caricata
2. Dismiss consenso privacy richiesto. Età 12 → trigger parent consent flow (GDPR under-14) → blocca ENTRA
3. Retry età 18+ → accetto privacy OK → textbox chiave → `TEST-2026-ELAB` **rifiutata "Chiave non valida"**
4. Tentativo opzione (b) insert test key via `mcp__supabase__execute_sql` → **non applicabile**: licenze non stanno in Supabase (`licenseService.js` usa `VITE_N8N_LICENSE_URL`, datastore Notion via n8n workflow)
5. Fallback opzione (c) dev mode: `npm run dev` (vite 7.2.7 ready 517ms) + `localStorage.setItem('elab_e2e_user', ...)` + navigate `http://localhost:5173/#lavagna` → **autenticato**
6. Step 2–6 eseguiti su dev mode (backend prod stesso: Supabase edge functions)

**Trade-off documentato**: dev mode valida UI + backend edge functions, NON valida CDN assets / SW precache / prod Vite build. Anomaly #1 (SW chunk 404) scoperta su prod prima di switch.

---

## Step-by-step evidence

### Step 1 — Navigate + HTTP + console

**Verdict**: PASS con 2 anomalie.

- URL: `https://www.elabtutor.school`
- HTTP: 200 (verificato via `curl -sI` + `performance.navigation.loadEventEnd`)
- Load time: 2.24s (well < 5s)
- Title: "ELAB Tutor — Simulatore di Elettronica e Arduino per la Scuola"
- Console errors primo navigate: 1 (`/health` 405)
- Console errors secondo navigate: 3 (stale chunk 404 + TypeError + unhandled UI error)

**Screenshot**: `screenshots-2026-04-20/01-homepage.png`

Evidence anomaly #1:
```
[ERROR] Failed to load resource: 404 @ https://www.elabtutor.school/assets/WelcomePage-DMtSJQGL.js
[ERROR] TypeError: Cannot read properties of undefined (reading 'default') at q (react-vendor-nPRipe30.js:2:5358)
[ERROR] [ELAB] Unhandled UI error: TypeError: Cannot read properties of undefined (reading 'default')
```
Current deployed `index-CiYHFcXr.js` references `WelcomePage-CqzmiauP.js` (HTTP 200). Stale browser/SW cache serves old `WelcomePage-DMtSJQGL.js` (HTTP 404).

**Screenshot error boundary**: `screenshots-2026-04-20/02-error-boundary.png`

Anomaly cleared via SW unregister + caches.delete + reload.

---

### Step 2 — Snapshot VisionButton + Fumetto

**Verdict**: PASS (dev mode). Prod login bloccato.

**Prod path blocker**: chiave `TEST-2026-ELAB` rejected "Chiave non valida" — nessun test key in licenze prod (n8n/Notion). Documentato come anomaly #3.

**Screenshot rejection**: `screenshots-2026-04-20/03-chiave-rejected.png`

**Dev mode path**: `localhost:5173/#lavagna` + `elab_e2e_user` localStorage bypass → lavagna rendered.

Snapshot conferma:
- `banner` → `button "Apri Fumetto Report della sessione"` ref=e44 (`src/components/lavagna/AppHeader.jsx` span "Fumetto" line 128 aria-label verified)
- `main` → `button "Guarda il mio circuito - UNLIM analizza lo schermo"` ref=e165 (`src/components/tutor/VisionButton.jsx`)
- `button "Parla con UNLIM"` ref=e170 (mascotte bottom-right)
- Toolbar Strumenti lavagna completa (Seleziona/Filo/Elimina/Annulla/Ripeti/Penna)
- Sidebar Componenti (8 voci)

**Screenshot clean state**: `screenshots-2026-04-20/04-lavagna-clean.png`

---

### Step 3 — Click VisionButton + console + screenshot

**Verdict**: FAIL con 2 anomalie.

Button `disabled=true` anche dopo mount simulatore + `window.__ELAB_API.captureScreenshot` presente come function.

Evidence:
```js
// Dopo mount full:
window.__ELAB_API.captureScreenshot  // → function
document.querySelector('button[aria-label*="Guarda il mio circuito"]').disabled  // → true
```

Causa: `VisionButton.jsx:22-24` valuta `hasApi` al mount component. API registra DOPO mount → `useState` snapshot stale, no re-check.

Direct API call test:
```js
const url = await window.__ELAB_API.captureScreenshot();
// { ok: true, len: 0, prefix: "" }
```

API ritorna stringa vuota. `parseDataUrl` throw "Screenshot format invalido" se fosse chiamato.

---

### Step 4 — Click Fumetto + tabs + popup

**Verdict**: PARTIAL-PASS.

- Fumetto button disabled=false, click OK
- `handleFumettoOpen` → `await import('../unlim/UnlimReport').openReportWindow(expId)` wire-up ok
- `browser_tabs list` → 1 tab solo (current). Nessun popup né download
- Root cause: `UnlimReport.jsx:554` `if (!session || (!session.messages?.length && !session.errors?.length)) return false;` — sessione vuota in fresh dev state

Silent no-op: zero feedback utente. Anomaly #4.

**Screenshot**: `screenshots-2026-04-20/05-fumetto-clicked-silent.png`

---

### Step 5 — Principio Zero v3 chat (CRITICAL)

**Verdict**: PASS.

Input: `"spiegami v1-cap6-esp1"`

Response UNLIM (copia esatta):
> Ragazzi, oggi iniziamo un capitolo super interessante: il Capitolo 6! Parleremo di come i circuiti possono prendere decisioni, proprio come un cervello.

Assertions:
```js
hasRagazzi:             true   ✓ (target: true)
hasDocenteLeggi:        false  ✓ (target: false)
hasDocenteMetaImperativa: false ✓ (no "docente spiega/leggi/dì/mostra")
hasPaginaRef:           false  ⚠ (gap: no "Vol. X pag. Y" — non strict fail)
```

PZ v3 gate PASS. Zero meta-istruzioni "Docente, leggi". Linguaggio rivolto direttamente ai ragazzi.

Gap minore: nessuna citazione pagina/volume nella risposta (teaser iniziale). Rispetto postmortem 18/04 che cita "Vol. 1 pagina 29…470 Ohm…ingredienti ricetta speciale" — questa risposta è più generica, non cita bookText. Da indagare se è aspettativa o regressione RAG.

**Screenshot**: `screenshots-2026-04-20/06-pz-v3-response.png`

---

### Step 6 — Network unlim-chat

**Verdict**: PASS.

Endpoint:
```
POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat
→ HTTP 200
Headers: authorization Bearer <supabase-anon-jwt>, apikey <supabase-anon-jwt>
Referer: http://localhost:5173/
```

CORS OK da origine localhost:5173. Supabase edge function risponde 200.

---

### CoV — 3 navigate consecutivi prod

**Verdict**: PASS.

```
Run 1: HTTP 200, 0.191s
Run 2: HTTP 200, 0.150s
Run 3: HTTP 200, 0.170s
```

Stabile, no flakiness.

---

## PRODUCTION BUGS DETECTED

### BUG-1: Stale service worker cache → chunk 404 → error boundary (**CRITICAL**)

**Severity**: CRITICAL — qualsiasi utente con SW registrato vede crash su nuova deploy.

**Reproduce**:
1. Load `https://www.elabtutor.school` (primo caricamento OK)
2. Reload tab
3. → `WelcomePage-<oldhash>.js` 404 → TypeError → error boundary "Ops! Qualcosa è andato storto"

**Root cause**: service worker precache non invalida su deploy. Index.html nuovo con hash chunk nuovo, ma SW serve asset-manifest vecchio con hash chunk vecchio (404).

**Remediation plan**:
```js
// service-worker.js (Workbox o manuale)
self.skipWaiting();
self.clients.claim();

// In service worker config:
// - use workbox-precaching precacheAndRoute
// - strategy: NetworkFirst per index.html
// - fallback: se chunk 404, forza reload SW via `registration.update()` + clients.reload()

// Oppure bannerino utente:
// if (chunk_404_detected) {
//   showToast("Nuova versione disponibile — ricarico automaticamente");
//   await caches.keys().then(ks => Promise.all(ks.map(caches.delete)));
//   location.reload();
// }
```

**Test acceptance**: dopo fix, 5 reload consecutivi post-deploy fittizio → 0 errori console.

**Conferma postmortem**: #8 in `docs/HISTORY.md` / postmortem cartella audits — da cross-ref.

---

### BUG-2: `/health` 405 Method Not Allowed (LOW)

**Severity**: LOW — cosmetic, non blocca funzionalità.

**Reproduce**: qualsiasi page load → console error `https://elab-galileo.onrender.com/health 405`.

**Root cause**: client fetch GET su endpoint che accetta solo POST (o viceversa). Da verificare in `src/services/api.js` warmupRender.

**Remediation**:
- Option A: backend Render → aggiungere GET handler `/health` che ritorna `{ status: 'ok' }`
- Option B: client → cambiare metodo a POST o rimuovere health check esterno
- Option C: usare endpoint nativo Render `/healthz` invece

**Suggerito**: option A (GET standard per health endpoints, allineato Kubernetes/LB probes).

---

### BUG-3: Chiave test PROD assente (MEDIUM)

**Severity**: MEDIUM — blocca E2E verify automatizzato in prod.

**Root cause**: nessuna licenza riservata E2E nel datastore Notion + workflow n8n.

**Remediation**:
1. Creare chiave `E2E-PROD-2026` in Notion DB licenze con:
   - `school`: "ELAB E2E Test"
   - `expiry`: 2027-12-31
   - `plan`: base
   - `maxUsers`: 1
   - Flag hidden per UI staff
2. Documentare processo in `docs/development/e2e-setup.md`
3. Aggiungere a CI secret → Playwright test reads via env var

---

### BUG-4: VisionButton disabled race condition (MEDIUM)

**Severity**: MEDIUM — funzionalità Vision inaccessibile da UI anche se API pronto.

**Reproduce**: lavagna mount → VisionButton render → `__ELAB_API` register tardivo → button disabled perma (no re-check).

**Root cause**: `VisionButton.jsx:22` computa `hasApi` al mount, no reattività.

**Remediation**:
```jsx
// VisionButton.jsx
const [hasApi, setHasApi] = useState(typeof window !== 'undefined' && typeof window.__ELAB_API?.captureScreenshot === 'function');
useEffect(() => {
  if (hasApi) return;
  const check = () => {
    if (typeof window.__ELAB_API?.captureScreenshot === 'function') setHasApi(true);
  };
  const id = setInterval(check, 500);
  // o meglio: listen custom event `elab-api-ready` dispatched da simulator mount
  return () => clearInterval(id);
}, [hasApi]);
```

O evento custom preferibile a polling.

---

### BUG-5: `__ELAB_API.captureScreenshot` returns empty string (HIGH)

**Severity**: HIGH — Vision E2E rotto anche se button cliccabile.

**Reproduce**:
```js
const url = await window.__ELAB_API.captureScreenshot();
// url === ""
```

`parseDataUrl` (VisionButton.jsx:10) throw "Screenshot format invalido".

**Root cause candidate**: canvas SVG non catturato (html2canvas / SVG → PNG conversion fail). Da investigare `captureSimulatorScreenshot` in `UnlimReport.jsx` o equivalente.

**Test acceptance**: `captureScreenshot()` ritorna `data:image/png;base64,iVBOR...` con length > 10000.

---

### BUG-6: Fumetto silent no-op quando sessione vuota (LOW)

**Severity**: LOW — UX gap, non crash.

**Reproduce**: fresh lavagna (no experiment interaction) → click Fumetto → nulla accade.

**Root cause**: `UnlimReport.jsx:554-556` return false silent se session senza messages/errors.

**Remediation**:
```js
if (!session || (!session.messages?.length && !session.errors?.length)) {
  showToast("Nessuna sessione da riassumere. Interagisci con l'esperimento o UNLIM prima.");
  return false;
}
```

---

## Raccomandazioni next session

**PRIORITÀ 1 — BUG-1 SW cache** (blocca tutti gli utenti post-deploy):
- Dedicata session fix SW precache + invalidation strategy
- Target: zero 404 chunk su reload post-deploy
- Owner: Andrea

**PRIORITÀ 2 — BUG-3 Chiave test + Playwright E2E spec**:
- Creare `E2E-PROD-2026` in Notion licenze
- Scrivere `tests/e2e/live-verify.spec.ts` Playwright con login automatizzato
- CI integration → run on deploy

**PRIORITÀ 3 — BUG-4/5 VisionButton + captureScreenshot**:
- Fix race condition button
- Debug captureScreenshot empty output
- E2E test Vision end-to-end

**PRIORITÀ 4 — BUG-2 /health + BUG-6 Fumetto UX**:
- Quick wins, batch in stessa PR

---

## Scope coverage

| Coverage area | Coperto | Note |
|---------------|---------|------|
| Prod HTTP 200 root | ✅ | 3/3 CoV |
| Prod login flow | ❌ | No chiave test → skip |
| Prod CDN / SW precache | ⚠ | Test parziale, anomaly rilevata |
| Prod Supabase edge function | ✅ | unlim-chat 200 OK |
| Dev UI render lavagna | ✅ | Dev mode bypass |
| Dev click flow VisionButton | ❌ | Disabled race |
| Dev click flow Fumetto | ⚠ | Wire OK, silent no-op |
| Principio Zero v3 tono | ✅ | PZ v3 compliant |

**Gap maggiore**: full prod E2E con login reale. Richiede BUG-3 fix + BUG-1 fix prima.

---

## Appendix — files touched

- Branch: `feature/live-verify-2026-04-20`
- Commit: questo audit doc + screenshots
- Codice applicativo: zero modifiche (verify-only)
- Governance: light (pre-audit skip, audit doc mandatory, no TDD per verify)
