# Playwright Stress Test — Production

**Date**: 2026-04-22 08:10–08:18 GMT+8
**Target**: `https://www.elabtutor.school`
**Deploy**: Sprint 3 `sett-3-stabilize-v3` merged 2026-04-22 07:56, commit `2b5bab7`
**Branch**: `test/stress-2026-04-22` (isolated worktree, main-based)
**Parallel to**: loop CLI on `feature/sett-4-intelligence-foundations` (untouched)
**Tool**: Playwright MCP (Chromium)
**Honesty note**: findings unedited. Where a bug is only reproducible under a specific condition, that condition is stated.

---

## Suite 1 — Homepage flow

### Run A — First load with pre-existing PWA cache (returning user)

- Navigated `https://www.elabtutor.school/` from fresh MCP session, SW registered from prior visit.
- **Result: BLANK WHITE PAGE** — body innerHTML size 80 chars, root children 0, React never mounted.
- Console: 4 errors, all module MIME mismatch:

```
Failed to load module script: ... MIME type "text/html"
  @ /assets/react-vendor-nPRipe30.js
  @ /assets/supabase-DP1ls8VB.js
  @ /assets/react-pdf-29Nvsrc4.js
  @ /assets/recharts-Ci8YUR1c.js
```

- Verified via `curl`: requested asset paths return HTTP 200 with `content-type: text/html` and `content-disposition: inline; filename="index.html"` (Vercel SPA catch-all serves index.html on 404).
- Current `index.html` fetched via curl references **different** chunk hashes (`react-vendor-KIHy-Drs.js`, `supabase-MF7O8eA9.js`, `react-pdf-COnKCILs.js`). Stale hashes are NOT in current HTML.
- Origin of stale hashes: `caches.keys()` returned `workbox-precache-v2-https://www.elabtutor.school/` with 32 entries — the precache contains a prior-build `index.html` pointing at old chunk filenames.
- Evidence screenshot: `stress-p0-blank-homepage.png` (blank white full-page).

**→ P0 regression for all users who visited the site before the Sprint 3 deploy.**

### Run B — After cache purge (new user)

- Unregistered SW, deleted 3 caches (workbox-precache-v2, elab-lazy-chunks, elab-images).
- Re-navigated. Result: WelcomePage rendered. `h1=BENVENUTO IN ELAB TUTOR`, chiave input, ENTRA button.
- Performance (Navigation Timing API, single fresh nav):

| Metric | ms |
|---|---|
| TTFB | 88 |
| domInteractive | 733 |
| domContentLoaded | 1389 |
| load | 1417 |
| FCP | 1460 |

- transferSize 2 KB (HTML only, before SW precache populates).
- Screenshot: `stress-welcome-screen-ok.png`.
- 1 console error on welcome: `HEAD https://elab-galileo.onrender.com/health → 405` — warmup ping uses HEAD but Render rejects. Non-blocking (does not break UX) but pollutes logs.

---

## Suite 2 — Simulator flow

Entered with chiave `ELAB2026` → routed to `#lavagna`, esperimento `v1-cap6-esp1` auto-loaded.

- `window.__ELAB_API` present with 65 methods + `.unlim` sub-namespace (6 methods).
- `getCurrentExperiment()` → `{ id:'v1-cap6-esp1', title:'Cap. 6 Esp. 1 - Accendi il tuo primo LED', stepsCount:8 }`.
- `getCircuitDescription()` → `"Esperimento: Cap. 6 Esp. 1… Simulazione in corso. Componenti: batteria 9V (bat1), resistore (r1), LED [acceso] (led1). Fili: 6 collegamenti."` → LED emulation running live.
- `isSimulating()` → true, `getSimulationStatus()` → `"running"`.
- Memory usage (JS heap): 94 MB at lavagna load — high for an education app on entry-level laptops; worth tracking.
- Screenshot `stress-lavagna-loaded.png` shows rendered breadboard with 9V battery, resistor R1, LED1 glowing.

### Build mode switch

- Clicked `Passo Passo` tab → `buildMode='guided'`, `buildStepIndex=-1`, components cleared, empty breadboard shown. Switch works.
- Screenshot `stress-passo-passo.png`.

### Emoji-as-icon audit (CLAUDE.md rule 11)

Four buttons use raw emoji as icons instead of `ElabIcons.jsx`:

| Text | Location |
|---|---|
| `💡Cap. 6 Esp. 1 - Accendi il tuo primo LED` | Header experiment switcher |
| `🔧Già Montato` | Build-mode tab |
| `👣Passo Passo` | Build-mode tab |
| `🎨Libero` | Build-mode tab |

`aria-label` is set correctly on all, so SR users are fine, but the rule is explicit.

---

## Suite 3 — UNLIM AI chat

### Query 1 — "Cos è un LED?" (plain FAQ)

Response captured verbatim:

> Un LED è un diodo che emette luce! Come spiega il Vol. 1 a pagina 29, ha due &quot;gambe&quot;: l'anodo (+) e il catodo (-). Per accendersi, la corrente deve entrare dall'anodo e uscire dal catodo.
>
> Pensa al LED come a una porta a senso unico per la luce: la corrente può passare solo in una direzione per farlo brillare!

- ✅ Vol. 1 p. 29 cited.
- ✅ Analogia present ("porta a senso unico").
- ❌ `&quot;` literal HTML entity in rendered text — escaping bug.
- ❌ Principio Zero v3 violation: imperative singular "Pensa al LED" addresses student directly, not framed for docente to read to "Ragazzi".

### Query 2 — "Cos e un LED?" (variant)

> Perfetto! . Come spiega il Vol. 1 a pagina 29, per accenderlo serve anche un resistore da 470 Ohm per proteggerlo. Pensa al LED come a una porta a senso unico… Ora aggiungiamo i componenti mancanti per completare il circuito.

- ❌ `"Perfetto! ."` — double punctuation / empty-segment stutter. Template-join bug.
- Subsequent actions triggered: `➕ Componente aggiunto` (×2), `— Filo aggiunto` — intent execution works.

### Vision "Guarda il mio circuito"

- Clicked button → `POST /chat` on `elab-galileo.onrender.com` returned HTTP **422** (validation error).
- Chat rendered fallback: `"Non sono riuscito ad analizzare la schermata. Riprova!"`
- Screenshot `stress-unlim-dialog-vision.png` confirms red error bubble.
- Working chat uses `POST /tutor-chat` (200 OK). Vision is on a **different** endpoint that is broken.

### Principio Zero v3 audit (CLAUDE.md claims "VERIFIED LIVE 18/04 sera")

Current live responses contain:
- `"Ciao! Sono UNLIM, il tuo assistente per l'elettronica"` (singular "tuo assistente")
- `"Ciao! Il tuo LED è acceso…"` (singular "Il tuo LED", "Hai costruito")
- `"Pensa al LED come a…"` (imperative singular)

Principio Zero v3 requires: plural "Ragazzi", no direct-to-student second-person, teacher-framed preparation. **Current prod is in regression.**

---

## Suite 4 — Mobile responsive (iPhone SE, 375×667)

- No horizontal scroll (`scrollWidth === clientWidth`).
- 30 visible buttons enumerated, **3 under 44×44 minimum**:
  - `CHAT` 112×39
  - `PERCORSO` 112×39
  - `GUIDA` 112×39
- Viewport screenshot `stress-mobile-iphoneSE.png`: UNLIM chat dialog auto-opens and overlaps the main canvas. The simulator breadboard is not visible under that viewport. The header `ELAB` + `Manuale Video Fumetto` row wraps to a cramped single line. The "Guarda il mio circuito" CTA sits on top of the UNLIM dialog (stacking overlap).
- No auto media-query for the floating chat → mobile experience currently assumes desktop.

---

## Suite 5 — PWA readiness (offline not fully exercised)

- Service worker active at `https://www.elabtutor.school/sw.js`.
- `controllerOwns=true`, scope `/`.
- Caches populated: `workbox-precache-v2` (32), `elab-lazy-chunks` (18), `elab-images` (1). Total 51 entries.
- Precache includes `/index.html?__WB_REVISION__=...`, `index-ulKSCnQX.js`, several index-* chunks, mascotte PNG, fonts.
- **Not verified live**: network offline toggle — Playwright MCP does not expose CDP `setOfflineMode`. Cache inspection alone is insufficient to claim offline works. **Offline reload test remains open (P3).**
- Side-effect of the current SW install strategy: the precache from a prior deploy is the root cause of Suite 1 Run A (P0).

---

## Console — noise level

Single lavagna session generated **~200 warnings** in ~30 seconds, of which the majority:

```
[WARN] [WakeWord] Error: not-allowed  (×~180)
```

- Source: `index-ulKSCnQX.js:2`.
- Cause: mic permission denied (expected in Playwright headless); wake-word module retries indefinitely.
- Effect: log pollution, likely CPU loop consumer on any user who denies mic permission. **P2** — needs back-off or single-try-and-disable.

Non-wake warnings found:
- `Deprecated API for given entry type` (once, performance entry).

---

## Network summary

External endpoints hit during session:

| Method | URL | Status | Count |
|---|---|---:|---:|
| HEAD | `https://elab-galileo.onrender.com/health` | 405 | 2 |
| POST | `https://elab-galileo.onrender.com/chat` | **422** | 1 |
| POST | `https://elab-galileo.onrender.com/tutor-chat` | 200 | 2 |
| POST | `https://n8n.srv1022317.hstgr.cloud/webhook/galileo-chat` | 200 | 1 |

Fallback chain does work (n8n 200), but the top-of-chain Vision endpoint is non-functional.

---

## MCP calls used this suite

1. `browser_navigate` × 2 (fresh + post-cache-clear)
2. `browser_console_messages` × 3
3. `browser_snapshot` × 3
4. `browser_take_screenshot` × 5 (`stress-p0-blank-homepage`, `stress-welcome-screen-ok`, `stress-lavagna-loaded`, `stress-unlim-dialog-vision`, `stress-passo-passo`, `stress-mobile-iphoneSE`)
5. `browser_evaluate` × 11
6. `browser_network_requests` × 3
7. `browser_click` × 1
8. `browser_type` × 1
9. `browser_press_key` × 2
10. `browser_resize` × 2
11. `browser_wait_for` × 1

Total ≥ 30 MCP calls — exceeds the ≥8 session requirement.

---

## CoV 3× (Chain of Verification) — P0 repro

1. curl `https://www.elabtutor.school/assets/react-vendor-nPRipe30.js` → HTTP 200 + `content-type: text/html` ✔
2. curl same asset body first 300 bytes → starts with `<!doctype html>` ✔
3. `caches.match(new Request('/index.html'))` inspection returned no key without revision param, and `workbox-precache-v2` contents confirmed contain `/index.html?__WB_REVISION__=cc6412f2e1949579f09cab8ffbb161eb` pointing at assets the current deploy no longer ships ✔

Finding is reproducible and root cause is the workbox precache revision not being invalidated fast enough relative to the asset hash churn between deploys.

---

## Open follow-ups (not part of this session)

- Live offline test needs CDP-capable harness (Playwright test runner, not MCP). Flagged P3.
- Colour contrast ratio not measured numerically, only font size. Full axe-core run recommended next session.
