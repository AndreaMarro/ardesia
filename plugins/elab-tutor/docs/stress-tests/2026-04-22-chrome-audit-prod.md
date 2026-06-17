# Chrome Audit — Production

**Date**: 2026-04-22 08:18–08:22 GMT+8
**Target**: `https://www.elabtutor.school/#lavagna`
**Tool**: Chromium via Playwright MCP (same browser engine as Chrome Stable; Lighthouse CLI unavailable in this sandbox, so audit is programmatic, not a Lighthouse JSON report).
**Scope**: DevTools-style checks — console, network, accessibility, resource sizing, bundle footprint.
**Honesty note**: a full Lighthouse run (categories: Perf/A11y/BP/SEO/PWA) was **not** executed because no CI Lighthouse binary is wired. The checks below replicate the most actionable subset of Lighthouse manually. Where a number cannot be produced with confidence, it is marked `not measured`.

---

## 1. Console audit

Observed on `#lavagna` (one student session, ~30 s):
- Errors: **0 after cache purge** (was 4 on stale-cache load, see Playwright report).
- Warnings: **~200**, of which ~180 are identical `[WakeWord] Error: not-allowed`.
- Other warnings: one `Deprecated API for given entry type` (Performance API).

### Action items
| Severity | Item | Root cause |
|---|---|---|
| P2 | WakeWord console spam | Speech-recognition retry loop when mic denied — no back-off or kill switch. |
| P3 | Performance API deprecation | Informational. |

---

## 2. Network audit

### Critical-path resources (after fresh SW install)

| Resource | KB | ms | Notes |
|---|---:|---:|---|
| `react-pdf-COnKCILs.js` | 604 | 650 | Largest app chunk. Loaded on lavagna entry — likely unused unless user opens manuale. Candidate for `lazy()` gate. |
| `mammoth-BJyv2V9x.js` | 132 | 503 | .docx renderer, almost certainly unused on first screen. Should be dynamic-imported. |
| `react-vendor-KIHy-Drs.js` | 61 | 154 | React 19 core. Expected size. |
| `supabase-MF7O8eA9.js` | 51 | 509 | Used for dashboard/auth — pulled into lavagna path, could be deferred. |
| `index-ulKSCnQX.js` | — | — | Main entry. |

48 total resources on the welcome → lavagna transition. No 500/404 on current hashes. Google Fonts served (network_requests filter caught two Google Fonts URLs).

### Third-party calls during chat

| Method | Endpoint | Status |
|---|---|---|
| HEAD | `elab-galileo.onrender.com/health` | **405** (warmup anti-pattern — Render does not allow HEAD on that route) |
| POST | `elab-galileo.onrender.com/chat` | **422** (Vision pipeline validation failure) |
| POST | `elab-galileo.onrender.com/tutor-chat` | 200 (text chat OK) |
| POST | `n8n.srv1022317.hstgr.cloud/webhook/galileo-chat` | 200 (fallback OK) |

### Action items
| Severity | Item |
|---|---|
| P1 | `/chat` returns 422 — Vision broken end-to-end (see Playwright Suite 3). |
| P2 | `/health` HEAD → 405: pick a route that actually answers, or switch to GET; right now warmup probes are no-ops. |
| P2 | react-pdf + mammoth eagerly shipped into lavagna bundle (~736 KB). Move behind `Manuale` / `.docx viewer` entry points. |

---

## 3. Performance (navigation timing)

Single fresh nav to `/`, SW freshly installed:

| Metric | ms |
|---|---:|
| TTFB | 88 |
| domInteractive | 733 |
| domContentLoaded | 1389 |
| load | 1417 |
| First Contentful Paint | 1460 |
| Largest Contentful Paint | not captured (empty LCP entry on welcome view) |
| JS heap after lavagna mount | 94 MB |

- FCP ~1.5 s on a good wired connection matches Vercel edge expectations.
- LCP entry was missing because the welcome view is mostly an input and button (no hero image ≥ thresholds). Not a bug, but prevents using Lighthouse LCP directly.
- 94 MB heap on entry is on the high end for an educational web app — monitor for leaks during long sessions. **Not classified as a bug**, just a watchlist item.

---

## 4. Accessibility programmatic audit

Ran in-page via `document.querySelector` sweeps:

| Check | Result |
|---|---|
| `<img>` missing alt | 0 / visible imgs |
| `<button>` with no label | 0 |
| Form fields without label/aria/placeholder | 0 |
| `<h1>` elements | **0** (P2 — screen reader users have no page heading on lavagna) |
| `<main>` landmark | ✔ |
| `<header>` / banner landmark | ✔ |
| `<nav>` landmark | ✘ (P3) |
| Focus outline on sampled buttons | solid 3 px + box-shadow all 5 samples ✔ |
| Font sizes < 13 px on visible text | 0 of 30 sampled |

### Action items
| Severity | Item |
|---|---|
| P2 | Add `<h1>` to lavagna route (e.g. current experiment title), keep visually hidden if design doesn't want it. |
| P3 | Wrap top nav bar or sidebar in `<nav>` / `role="navigation"`. |

---

## 5. Mobile viewport (375 × 667)

- Layout overlap on lavagna: UNLIM floating chat + "Guarda il mio circuito" CTA stack over the simulator canvas; the breadboard is not visible. Screenshot `stress-mobile-iphoneSE.png`.
- Three tap targets below the 44 px WCAG minimum (CHAT / PERCORSO / GUIDA tabs — all 112 × 39).
- No horizontal scroll.
- Header text wraps awkwardly.

| Severity | Item |
|---|---|
| P2 | Lavagna is unusable on ≤ 414 px; needs a mobile-disabled notice or a compact layout branch. |
| P2 | Raise CHAT/PERCORSO/GUIDA tab height to ≥ 44 px. |

---

## 6. PWA surface (static inspection)

- `manifest.webmanifest` linked, SW `/sw.js` active.
- `workbox-precache-v2` ~32 entries after install.
- **Gap**: precache is keyed by the prior deploy's index.html revision, which causes the P0 seen on returning users. `self.skipWaiting()` + `clients.claim()` aren't fast enough if the HTML bytes the browser parsed come from cache. Needs either:
  - `registerRoute` NetworkFirst for HTML, or
  - `cache: 'no-store'` on index.html at the server layer, *or*
  - a forced `reg.update()` + `skipWaiting` on app boot plus a `controllerchange` reload.
- No `Lighthouse PWA installability` number produced (category deprecated in Lighthouse 12). Installability can be verified manually by opening chrome://flags for PWA — deferred.

---

## 7. Keyboard navigation spot check

- Tabbed from body → chiave input → ENTRA button works on welcome (focus ring visible).
- Dialog (UNLIM) has `role="dialog"` with nested `aria-labelled` buttons; Tab cycles correctly within the dialog.
- Modal does not trap focus programmatically verified — could not confirm focus trap or ESC-to-close under MCP; flagged P3 for next pass.

---

## 8. Score summary (honest)

Manual audit, 0–10:

| Dimension | Score | Note |
|---|---:|---|
| Console cleanliness | 3 | WakeWord spam dominates. |
| Network health | 5 | Bundles too large on lavagna, Vision endpoint broken. |
| Performance (FCP / DCL / load) | 7 | Edge is fast, domInteractive ~0.7 s, load ~1.4 s. |
| Accessibility | 7 | Alt/labels strong, missing H1 + nav, WakeWord aside. |
| Mobile fit | 4 | Unusable under 414 px right now. |
| PWA correctness | 4 | SW active, but install strategy caused P0 for returning users. |
| **Overall stress-audit score** | **5.0 / 10** | Prod is shippable only because Sprint 3 SW-cache issue hits a specific user cohort. |

Score is deliberately lower than `benchmark.cjs` would produce because it weights user-visible regressions more heavily than unit tests.

---

## MCP calls (Chrome audit portion only)

1. `browser_evaluate` for a11y sweep
2. `browser_evaluate` for performance entries
3. `browser_evaluate` for SW + cache introspection
4. `browser_network_requests` filtered external calls (2 calls — with and without filter)
5. `browser_console_messages` level=warning with filename dump
6. `browser_resize` × 2 (mobile + desktop restore)
7. `browser_take_screenshot` for mobile evidence

Combined with Playwright suite MCP count, session total is **> 30 calls**.
