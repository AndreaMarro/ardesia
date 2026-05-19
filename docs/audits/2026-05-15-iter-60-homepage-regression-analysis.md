# HomePage regression analysis — iter 41 PM (read-only audit)

**Date**: 2026-05-15 (iter 60 Workstream B P0)
**Scope**: Andrea feedback iter 41 PM 2026-05-05 — HomePage prod regression
**Verdict (preview)**: **REGRESSION CONFIRMED + ALREADY REMEDIATED iter 42** (commit `0c661467` 2026-05-05 19:28 +0200, ~5h after Andrea screenshot 14:15 +0200). Current `main`/preview HomePage is the corrected version.

---

## 1. Andrea feedback verbatim

Source: `/Users/andreamarro/.claude/projects/-Users-andreamarro-VOLUME-3/memory/feedback_homepage_old_version_regression.md` (3591 bytes, 2026-05-05 15:16, originSessionId `601aabff-...`).

Exact strings flagged as regression (line 7 verbatim):

> "HomePage versione con mascotte robot blu/verde + 3 cards `CHATBOT UNLIM` / `GLOSSARIO` (con tag "Fatto da Tea") / `LAVAGNA ELAB TUTOR` + sottotitolo `Kit fisici + volumi + software morfico.` NON deve mai apparire su prod"

Andrea direttiva (line 9): "è tornato questo, segnati che non deve accadere"

Evidence cited (lines 19-26):
- Screenshot mascotte robot blu/verde con cuffie + 3 cards CHATBOT UNLIM / GLOSSARIO "Fatto da Tea" / LAVAGNA ELAB TUTOR
- Prod bundle: `index-CG9oQO6j.js`
- Deploy: `dpl_GvRZwSyfwnWW8FearcxCFf5fbAwL` 2026-05-05 14:15 GMT+2 Ready 1h ago
- Earlier deploy (14:08) `dpl_Gf9cobQ48k6j7iV6SiboPwTywUhc` (iter 39) had CORRECT HomePage

Memory file note: stamped "9 days old, point-in-time". Verified live against current code.

---

## 2. Current HomePage state (post-remediation)

File: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/components/HomePage.jsx` — **1060 LOC** (current HEAD).

| Element | Current value | File:line |
|---|---|---|
| Tagline (h1) | `ELAB TUTOR` | `HomePage.jsx:840` |
| Subtitle | `"Tutor educativo elettronica + Arduino bambini 8-14."` + bold `"Kit fisici, volumi e lezioni pronte per la classe."` | `HomePage.jsx:843-849` |
| Mascotte | PNG `/assets/mascot/elab-mascot-vera.png` (Andrea iter 42 PM mandate "deve essere quella vera") | `HomePage.jsx:909` |
| Cards rendered | **3 cards**: Lavagna libera (#lavagna-solo) / ELAB Tutor completo (#tutor) / Videolezioni (inline video) | `HomePage.jsx:377-426` (CARDS array) |
| 4th card (Chatbot UNLIM) | **REMOVED** with explicit comment "Card entry rimosso: route #chatbot-only ... PRESERVATI accessibili da admin menu / Tutor interno / direct hash URL" | `HomePage.jsx:405-411` |
| Footer credits | `"Homepage a cura di Andrea Marro · Teodora de Venere"` (Sprint V iter 43 source-of-truth alignment) | `HomePage.jsx:1000-1004` |
| Stale "Kit fisici + volumi + software morfico" string | Present only in **doc-comment** line 26 (compliance gate documentation) — NOT rendered | `HomePage.jsx:26` |

**Greeting bubble**: rotating greetings array (`ROTATING_GREETINGS`, lines 590-602) cycles every 3.5s — "Ciao Ragazzi!" + "Ciao 1A!" etc. plurale-compliant PRINCIPIO ZERO V3.

---

## 3. Expected HomePage state (per Andrea iter 41 PM mandate)

Per memory feedback line 9 ("iter 36+ HomePage approved"):

| Expected | Match current code |
|---|---|
| Mascotte ELAB Tutor centrale (NOT robot blu/verde with headphones) | ✅ PNG `elab-mascot-vera.png` `HomePage.jsx:909` |
| Subtitle: "Tutor educativo elettronica + Arduino bambini 8-14" | ✅ exact match `HomePage.jsx:844` |
| Cards: LAVAGNA LIBERA / ELAB TUTOR COMPLETO / GLOSSARIO | ⚠️ current has Lavagna libera + ELAB Tutor completo + **Videolezioni** (GLOSSARIO swapped per iter 39 Andrea direttiva, see `HomePage.jsx:411-414` "Iter 39 Andrea direttiva: 4° card = Videolezioni canale diretto") |
| NO "CHATBOT UNLIM" card | ✅ explicitly removed (Kimi K2.6 anti-bias finding `HomePage.jsx:405-410`) |
| NO "Fatto da Tea" tag on Glossario | ✅ Glossario card not present (Videolezioni replaced) |
| NO "Kit fisici + volumi + software morfico" subtitle | ✅ replaced by "Kit fisici, volumi e lezioni pronte per la classe" |

Note: Glossario card was removed entirely after iter 39 (replaced by Videolezioni). External Glossario URL `https://elab-tutor-glossario.vercel.app/glossario` access via different surface (memory feedback `feedback_glossario_external_url.md` flags this as separate concern — should be in-app clone, iter 42+).

---

## 4. Diagnosis

### Recent commits to HomePage.jsx (last 15)

```
4a03e958 fix(frontend): iter 9-16 cumulative — api.js timeout + HomePage + App routing
1ed204bb fix(iter-44): back-to-home navigation 3 routes (#74)
b0c78999 fix(iter-44): mascotte anim amplitude + chat avatar logo + spazio in alto (#72)
5d74c4f1 fix(iter-44/W2): rewrite 10 wiki concepts (#70)
523b98cb feat(sprint-V-iter-43-partial): A3 vision_request classifier (#67)
716812fe feat(sprint-V-iter-1): wake word UX + lavagna persist + Mascotte SVG (#66)
35b5173a fix(iter-42-pm): Glossario card credit 'Fatto da Tea' restore (#64)
0c661467 fix(iter-42): HomePage prod regression revert main — Andrea iter 41 PM mandate (#62)
ade4ae33 feat(sprint-u-cycle1): 94 esperimenti audit + fix linguaggio, L2 routing, vol3 data (#57)  ← REGRESSION SOURCE
```

### Regression source confirmed

Commit `ade4ae33` (2026-05-01 15:55 +0200, "sprint-u-cycle1") merged HomePage variant containing all 3 regression markers (verified via `git show ade4ae33:src/components/HomePage.jsx | grep`):
- line 26 doc-comment: `"Kit fisici + volumi + software morfico"`
- line 312 card config: `credit: 'Fatto da Tea'`
- line 573 rendered subtitle: `Kit fisici + volumi + software morfico.`

Vercel deploy `dpl_GvRZwSyfwnWW8FearcxCFf5fbAwL` (2026-05-05 14:15 +0200) deployed `ade4ae33` HEAD to prod, exposing regression to Andrea at ~14:15 (screenshot timestamp).

### Root cause hypotheses

1. **PRIMARY** — `sprint-u-cycle1` PR `#57` merged a stale `HomePage.jsx` variant from a parallel branch where the iter 36 redesign (Tea-style with `CHATBOT UNLIM`/Glossario/Fatto da Tea variant) was still active. The iter 38/39 corrections (Videolezioni swap + footer simplification + chatbot card removal) happened only on `e2e-bypass-preview` HEAD (`86b9b52`) and were NOT carried into `main` during `sprint-u-cycle1` rebase. No HomePage golden screenshot smoke test in CI → regression slipped through.
2. **SECONDARY** — No conditional/feature-flag in HomePage.jsx itself; the regression was a **physical variant in source**, not a runtime A/B switch. Memory feedback hypothesis (line 15 "HomePage.jsx contiene riferimenti BOTH versions ... potrebbe esserci feature flag") is FALSIFIED by current code reading — only one variant rendered; `software morfico` survives only in inert doc-comment.
3. **TERTIARY** — Vercel auto-deploys `main` HEAD; between 14:08 (iter 39 good deploy) and 14:15 (regression deploy) `ade4ae33` was merged or re-triggered. No deploy gate verifying HomePage snapshot.

---

## 5. Proposed fix — ALREADY APPLIED iter 42

Commit `0c661467` (2026-05-05 19:28 +0200, ~5h post-screenshot, PR `#62` "fix(iter-42): HomePage prod regression revert main — Andrea iter 41 PM mandate") cherry-picked corrected variant from `e2e-bypass-preview` HEAD `86b9b52`. Body cites: `Reference: Memory feedback: feedback_homepage_old_version_regression.md`, deploy ID `dpl_GvRZwSyfwnWW8FearcxCFf5fbAwL`.

3 files updated, 1045+ / -190:
- `src/components/HomePage.jsx` — subtitle + cards Lavagna/Tutor/Glossario/Videolezioni + ElabIcons
- `src/components/HomeCronologia.jsx` — Google-style buckets
- `src/components/common/ElabIcons.jsx` — NEW SVG impeccable icons

### Anti-regression strategy (RECOMMENDED, NOT yet implemented)

- **Golden screenshot snapshot test** in `tests/e2e/01-homepage-load.spec.js` (file exists, no visual baseline). Add `expect(page).toHaveScreenshot('homepage.png')` after assertions.
- **DOM-text assertions** in `tests/unit/components/HomePage.test.jsx` (file exists): assert subtitle text matches `/Tutor educativo elettronica/` AND `/Kit fisici, volumi e lezioni pronte/`; assert `screen.queryByText(/software morfico/)` returns `null`; assert `screen.queryByText(/Fatto da Tea/)` returns `null`; assert cards count `screen.getAllByTestId(/^home-card-/).length === 3`.
- **Pre-deploy gate** per memory feedback line 12-13: smoke Chrome MCP screenshot `https://www.elabtutor.school` post-Vercel-deploy + golden-image diff.
- **Rollback runbook**: if regression detected, `npx vercel rollback <previous-good-deploy>` + incident log.

### Test coverage gap

- `tests/unit/components/HomePage.test.jsx` EXISTS — recommend adding 4 new assertions (subtitle / no-morfico / no-tea-credit / 3-cards) as quick regression guard.
- `tests/e2e/01-homepage-load.spec.js` EXISTS — recommend adding visual baseline + DOM text smoke.

---

## 6. Verification plan

| Layer | Command / action | Expected |
|---|---|---|
| Visual prod | `npx playwright test tests/e2e/01-homepage-load.spec.js` against `https://www.elabtutor.school` | Subtitle "Tutor educativo elettronica + Arduino bambini 8-14"; 3 cards visible; mascotte PNG `elab-mascot-vera.png` rendered |
| Functional routing | Manual hash test `#chatbot-only` (iter 37 P0.7 route) | `<ChatbotOnly />` mounts via `HomePage.jsx:757-766` |
| Functional routing | Manual hash test `#about-easter` | `<EasterModal />` mounts via `HomePage.jsx:820-824` |
| Voice greeting | Page load → wait 3.5s | Greeting bubble cycles "Ciao Ragazzi!" → "Ciao 1A!" → ... (`HomePage.jsx:590-602` + interval `612-617`) |
| DOM regression | Curl `curl -s https://www.elabtutor.school/ \| grep -E "software morfico\|Fatto da Tea\|CHATBOT UNLIM"` | ZERO matches (current bundle does not contain rendered strings) |
| Deploy provenance | `npx vercel ls --prod` | Latest deploy should be POST `0c661467` merge timestamp 2026-05-05 19:28 +0200 |

---

## Summary verdict

**REGRESSION CONFIRMED + ALREADY REMEDIATED iter 42.**

Primary root cause: `sprint-u-cycle1` PR `#57` (commit `ade4ae33` 2026-05-01) merged stale HomePage variant from parallel branch into `main`, bypassing iter 39 corrections. Vercel deploy `dpl_GvRZw...` 2026-05-05 14:15 +0200 surfaced regression to Andrea. Remediated by cherry-pick PR `#62` (commit `0c661467` 2026-05-05 19:28 +0200, ~5h MTTR). Current code does not exhibit regression. **Remaining gap**: no automated guard prevents recurrence — recommended HomePage unit/E2E text + screenshot assertions before next high-risk merge.
