# Stress Test Findings — Consolidated P0/P1/P2/P3

**Date**: 2026-04-22 08:22 GMT+8
**Scope**: prod `https://www.elabtutor.school`, Sprint 3 merged state (`2b5bab7`), parallel to loop CLI on sett-4 branch.
**Evidence**: references screenshots captured by Playwright MCP (stored in MCP output dir, file names listed). Console + network logs saved via `filename:` option on `browser_console_messages` and `browser_network_requests`.
**Honesty standard**: every finding below was reproduced by at least one direct tool call during this session. Claims that could not be verified are marked `unverified`. No finding is inflated from a theoretical concern.

---

## P0 — Broken for users right now

### P0-001 — Returning users see a blank white page after Sprint 3 deploy

- **Symptom**: any user whose browser still has the pre-Sprint-3 `workbox-precache-v2` lands on `https://www.elabtutor.school/`, sees a blank page, and React never mounts.
- **Repro**:
  1. Register the service worker on any build prior to commit `2b5bab7` (Sprint 3 merge).
  2. Deploy Sprint 3 (already done in prod).
  3. Open the site. The SW serves its cached `index.html`, which references old chunk hashes (`react-vendor-nPRipe30.js`, `supabase-DP1ls8VB.js`, `react-pdf-29Nvsrc4.js`, `recharts-Ci8YUR1c.js`).
  4. Browser requests those assets → Vercel 404 → Vercel SPA catch-all rewrites to `index.html` → browser receives HTML for an expected JS module → strict MIME check fails → module load aborted → React never boots.
- **Proof**:
  - 4 console errors `Failed to load module script: … MIME type "text/html"` captured on first nav.
  - `curl -I` on each failing asset URL returns `HTTP 200 content-type: text/html; charset=utf-8 content-disposition: inline; filename="index.html"`.
  - Current live HTML (fetched via curl) references different, valid hashes (`KIHy-Drs`, `MF7O8eA9`, `COnKCILs`). Mismatch is the smoking gun.
  - Screenshot `stress-p0-blank-homepage.png` (blank full-page).
  - After `unregister()` + `caches.delete()` → reload works normally.
- **Severity justification**: any returning user gets a broken product. This is not a user error; the SW install strategy guarantees the regression until the client hits `reg.update()` + `controllerchange` + reload.
- **Proposed fix** (file:line references):
  - `vite.config.js:~100` (PWA plugin config) — set `registerType: 'autoUpdate'` if not already, and `workbox.navigateFallback` to a NetworkFirst handler for `/index.html`.
  - Add on-boot guard in `src/main.jsx` (or wherever `registerSW` is imported):
    ```js
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
    }
    ```
  - Alternative stop-gap: add Vercel edge rewrite to force fresh HTML `no-store` on `/` + `/index.html`.
- **Impact assessment**: affects 100 % of returning users (the only segment that has a SW installed). New users from a never-seen device are fine (confirmed in Suite 1 Run B).

---

## P1 — High, user-visible, blocks a feature

### P1-001 — UNLIM Vision endpoint returns HTTP 422

- **Symptom**: clicking `Guarda il mio circuito` triggers `POST https://elab-galileo.onrender.com/chat` which returns **422 Unprocessable Entity**. UI renders fallback message `"Non sono riuscito ad analizzare la schermata. Riprova!"`.
- **Repro**: open lavagna, click the Vision CTA (ref `e2078`), observe red error bubble.
- **Proof**: network_requests log shows `POST /chat → 422`; screenshot `stress-unlim-dialog-vision.png`.
- **Contrast**: `POST /tutor-chat` and `POST /webhook/galileo-chat` both return 200 — only Vision is broken.
- **Priority**: P1 — CLAUDE.md lists Vision as a flagship differentiator (bug #4: "Vision non testata live"). It IS live but fails on first call.
- **Proposed diagnosis step**: inspect request payload (likely missing field `image`, or base64 exceeds Render body limit). Check `src/services/api.js:~` (the `askUNLIM` vision branch) for payload schema drift.

### P1-002 — Principio Zero v3 regression on all current UNLIM responses

- **Symptom**: CLAUDE.md states Principio Zero v3 was "VERIFIED LIVE (18/04 sera)" — teacher-facing, plural "Ragazzi", no "tu"-to-student. Live responses observed today contradict that:
  - `"Ciao! Sono UNLIM, il tuo assistente per l'elettronica."`
  - `"Ciao! Il tuo LED è acceso…"`
  - `"Hai costruito un circuito vincente…"`
  - `"Pensa al LED come a una porta a senso unico per la luce"`
- **Repro**: open UNLIM chat on any fresh session; default greeting + ANY response uses singular second person.
- **Proof**: raw dialog text captured via `document.querySelector('[role="dialog"]').innerText` (see Playwright report Suite 3).
- **Severity**: P1 — this is the PRINCIPIO ZERO (the explicit "regola piu importante di tutto il progetto" per CLAUDE.md). Regression means the positioning with schools is currently compromised.
- **Proposed fix**: check prompt deploy on Supabase Edge Function `unlim-chat` (the sett-3 merge may have overwritten the `v3` prompt with an older base). Run `SUPABASE_ACCESS_TOKEN=… npx supabase functions list` and verify the active prompt includes the v3 plural framing. Commit history: `4d12f33 → 44677ff → 250364a` per CLAUDE.md; the last should be active.

### P1-003 — HTML entity escape bug renders `&quot;` literally in UNLIM chat

- **Symptom**: UNLIM response includes the substring `ha due &quot;gambe&quot;` displayed as text (not rendered as quotes).
- **Repro**: ask "Cos è un LED?" in UNLIM chat, observe `&quot;` in the rendered bubble.
- **Proof**: dialog innerText captured, quoted in Playwright report Suite 3 Query 1.
- **Proposed fix**: the chat renderer is double-escaping or double-unescaping markdown. Check `src/components/unlim/ChatOverlay.jsx` and the markdown/HTML sanitiser. Likely fix: call once, not twice. ~5 line change.

---

## P2 — Medium, degrades UX or polishes needed before classroom deploy

### P2-001 — WakeWord console spam (~180 identical warnings / 30 s)

- **Symptom**: `[WARN] [WakeWord] Error: not-allowed` logged continuously when mic permission is denied.
- **Impact**: console pollution, likely CPU/battery drain on devices that deny mic (most school laptops out of the box).
- **Fix**: in the wake-word module, on a `not-allowed` error → stop retrying and disable until page reload or explicit user toggle. One state flag.

### P2-002 — Stutter bug `"Perfetto! ."` in UNLIM response

- **Symptom**: second query reply starts with `"Perfetto! . Come spiega…"` — the trailing `. ` after "Perfetto!" indicates an empty prefix join.
- **Fix**: template `${prefix}${message}` somewhere in the chat post-processor is emitting a trailing period when `prefix` is missing. Trim before join.

### P2-003 — Four experiment/build-mode buttons use raw emoji as icons

- `💡 Cap. 6 Esp. 1 - Accendi il tuo primo LED`, `🔧 Già Montato`, `👣 Passo Passo`, `🎨 Libero`.
- **Rule violated**: CLAUDE.md rule 11 "MAI emoji come icone nei componenti — usare ElabIcons.jsx".
- **Fix**: swap with `ElabIcons` equivalents.

### P2-004 — Mobile (≤ 414 px) layout broken

- Lavagna UNLIM chat overlaps simulator canvas; canvas not visible; header wraps; `CHAT / PERCORSO / GUIDA` tabs 112×39 (< 44 px WCAG).
- **Fix**: add a desktop-only guard with a mobile "Apri su LIM / tablet" notice; bump tab heights to ≥ 44 px.

### P2-005 — `/health` warmup uses HEAD but Render returns 405

- Zero value from warmup probe (Render never answers, nothing warms).
- **Fix**: swap to GET (or POST with empty body) or choose a route that actually handles HEAD.

### P2-006 — Lavagna bundle pulls ~736 KB of PDF + DOCX viewers eagerly

- `react-pdf-COnKCILs.js` 604 KB, `mammoth-BJyv2V9x.js` 132 KB loaded before any Manuale / report is opened.
- **Fix**: `React.lazy()` behind the relevant entry points. Shrinks cold-start payload considerably.

### P2-007 — `0` `<h1>` elements on lavagna route

- Screen-reader users land without a page heading.
- **Fix**: a visually hidden `<h1>` with the experiment title (already present in DOM as button label).

---

## P3 — Low or low-confidence

### P3-001 — No `<nav>` landmark
The top app bar is a `<header>`, but no `<nav>` surrounds the top controls. Fix cost ~1 min.

### P3-002 — Modal focus trap and ESC-to-close not verified
Needs a dedicated a11y pass; assumption is React dialog lib may or may not trap — unverified.

### P3-003 — Live offline test deferred
Playwright MCP cannot toggle network offline via CDP. Cache inspection alone is insufficient to certify offline. Run a local `playwright test` with `context.setOffline(true)` next pass.

### P3-004 — JS heap 94 MB on lavagna entry
High but not unsafe. Worth tracking across long sessions and LIM use (45-minute lesson).

### P3-005 — Deprecated Performance API entry type warning
Informational.

---

## Summary table

| ID | Sev | Area | One-liner |
|---|---|---|---|
| P0-001 | P0 | PWA SW | Returning users get blank page after Sprint 3 deploy |
| P1-001 | P1 | UNLIM Vision | `/chat` 422, vision flow broken |
| P1-002 | P1 | UNLIM prompt | Principio Zero v3 regression (singular "tu" instead of plural) |
| P1-003 | P1 | Chat render | `&quot;` literal entity leaks into UI |
| P2-001 | P2 | WakeWord | ~180 warning loop on mic denied |
| P2-002 | P2 | Chat render | `"Perfetto! ."` stutter |
| P2-003 | P2 | UI icons | 4 emoji-as-icon violations |
| P2-004 | P2 | Mobile | Lavagna unusable ≤ 414 px; 3 tap targets < 44 px |
| P2-005 | P2 | API | `/health` HEAD → 405 no-op |
| P2-006 | P2 | Bundle | ~736 KB PDF/DOCX chunks loaded eagerly |
| P2-007 | P2 | A11y | No `<h1>` on lavagna |
| P3-001..005 | P3 | Misc | nav landmark, focus trap, offline test, heap, deprecation |

Total: **1 P0**, **3 P1**, **7 P2**, **5 P3** = 16 findings.

---

## Not fixed in this session

This was a stress-test pass. No source files were modified. Fixes listed above should be split into a follow-up PR(s) after the loop CLI finishes Sprint 4 Day 01 on `feature/sett-4-intelligence-foundations`. **P0-001 should be triaged before the loop moves to Day 02** — a hotfix branch off main is recommended.

## Compliance with mission contract

- ✅ Loop branch `feature/sett-4-intelligence-foundations` untouched (verified via `git worktree list`).
- ✅ No commits to `main`.
- ✅ Worktree branch `test/stress-2026-04-22` created off `origin/main`.
- ✅ No deploys.
- ✅ MCP calls ≥ 8 (actual ≥ 30, itemised in both suite docs).
- ✅ CoV 3× on P0 (asset 404 → HTML rewrite → cache precache inspection).
- ✅ Every severity backed by direct tool output, not inferred.
