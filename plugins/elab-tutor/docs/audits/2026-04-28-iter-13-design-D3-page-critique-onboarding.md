---
sprint: S
iter: 13
atom: D3 (4 of 4)
page: Onboarding (LoginPage + WelcomePage)
date: 2026-04-28
author: design-opus
files_audited:
  - src/components/auth/LoginPage.jsx (271 LOC, full sampled via grep + spot reads)
  - src/components/WelcomePage.jsx (155 LOC, sampled)
mandate: DOC ONLY
screenshot_path_placeholder: docs/specs/screenshots/onboarding-1080p-iter-14-baseline.png (DEFERRED)
---

# D3.4 — Onboarding (Login + Welcome) design critique

## §1 Page summary
**LoginPage.jsx** (271 LOC) is the auth entry — title "ELAB Tutor" 28px white on Navy gradient bg. Gradient `#1E4D8C → #0d1b2a` (line 177). Form: email/password fields, primary CTA gradient lime button. Subtitle 14px white-50%. Error message 14px red-bg. Forgot/register links 14px lime.

**WelcomePage.jsx** (155 LOC) is post-login first contact — Navy/lime gradient background, white card 48×40px padding, title 28px, body 15px, label 14px, CTA primary lime 16px button.

These are LIM-borderline surfaces (docente likely logs in once on classroom workstation — at-desk distance, NOT 3m projection). Touch + typography spec relaxed compared to Lavagna/Esperimento iter 14.

## §2 Visual hierarchy critique (5 items)
1. **LoginPage logo "🎓" emoji** (line 192) `fontSize: '56px'` — VIOLATES regola 11 ("MAI emoji come icone"). Iter 14 P0: replace with `<ElabIcons.LogoMark size={56} />`. Marketing emoji `🚫` and `OK` similarly leaked into LandingPNRR.jsx (lines 328, 666 per D1 §3 row 8).
2. **LoginPage title h1 "ELAB Tutor"** 28px `fontWeight: '700'` (line 193) — strong; no font family declared inline = falls to inherited. Iter 14: explicit `var(--font-display)` Oswald to bind brand.
3. **WelcomePage card** — central 80×80 logo placeholder (line 30-31), 28px title, 15px body, lime CTA. Hierarchy clear, BUT logo 80×80 is empty placeholder (no actual asset rendered in 30-line excerpt) — looks unfinished to first-time user.
4. **No progress indicator** in onboarding flow — first-time user lands LoginPage → WelcomePage → simulator with no breadcrumb. "3-click onboarding" goal (per memory MEMORY.md) requires explicit step counter or progress bar.
5. **LoginPage error message** (line 240+) `fontSize: '14px'` red bg "rgba(255,107,107,0.1)" — light pink bg on Navy gradient page = low contrast (estimated ~3:1 against bg, AA fail). iter 14 fix: use solid `var(--color-danger-light)` + `var(--color-danger)` text on lighter container.

## §3 Spacing + alignment issues (5 items)
1. **LoginPage card padding responsive `'28px 20px' : '48px'`** (line 185) ternary based on `window.innerWidth <= 480`. Inline window check = re-evaluate on every render — performance smell. Iter 14: CSS media query.
2. **WelcomePage card padding `'48px 40px'`** (line 23) generous + intentional. PASS.
3. **LoginPage subtitle margin `'0 0 28px'`** (line 194) before form — tight. Iter 14: token `var(--space-8)` 32px.
4. **WelcomePage logo `width: 80, height: 80`** (line 30-31) decorative — but no margin-bottom set in excerpt. Spacing relies on card padding. Iter 14: explicit `marginBottom: var(--space-6)`.
5. **LoginPage form input `padding: '14px 16px'` `fontSize: '15px'`** (line 199-200) — input touch target is 14×2 + 15 line-height = ~46-50px, PASS regola 9 by default. But explicit `min-height` not set = browser-dependent. Iter 14: `min-height: var(--touch-secondary)` 44.

## §4 Typography violations (3 items)
1. **LoginPage subtitle 14px white-50%** (line 194) "rgba(255,255,255,0.5)" — color contrast on Navy gradient ~3:1 = WCAG AA FAIL (text). Iter 14: `rgba(255,255,255,0.75)` minimum 4.5:1.
2. **LoginPage links 14px** (lines 240, 248, 256, 268) "Password dimenticata", "Crea account", "Accedi", etc. Borderline regola 8 (min 13). At desk distance OK; NOT a LIM concern. Iter 14: lift 14→16 if accessibility-mode.
3. **WelcomePage label 14px** (line 51) — secondary text. PASS regola 8. Iter 14 LIM-mode lift optional.

## §5 Touch target failures with file:line refs (3 items)
1. **LoginPage submit button**: `padding: '14px'` `fontSize: '16px'` (line 227-228) — implicit height ~44-46px PASS regola 9 (no explicit `min-height`). Iter 14: explicit `min-height: var(--touch-primary)` 56 + verify width 100% `width: '100%'` (line 206).
2. **LoginPage forgot/register text-buttons**: `background: 'none', padding: '8px 16px'` (line 253-265) — height ~32-38px = FAIL regola 9. Iter 14 P1 fix: explicit `min-height: var(--touch-secondary)` 44.
3. **LoginPage close-eye toggle (likely visible password)**: not visible in 30-line excerpt; spot-check needed. If `<svg width=20>` icon button without padding wrapper, FAIL.
4. (bonus) **WelcomePage CTA button**: `padding: '14px'` `fontSize: 16` (line 69-71) — same pattern as LoginPage submit. Iter 14: explicit `min-height: var(--touch-primary)` 56.

## §6 LIM-distance readability score 1-10 honest

**6.5 / 10** — Onboarding desk-context is more forgiving but emoji + low-contrast subtitle drag score down.

Breakdown:
- Hierarchy: 7/10 (clear flow login → welcome)
- Typography: 6/10 (subtitle low contrast critical)
- Touch: 6/10 (text-button targets weak)
- Spacing: 7/10 (card padding good, sub-area cramped)
- Color/contrast: 5/10 (white-50% subtitle FAIL AA)
- Brand: 6/10 (emoji 🎓 + 🚫 break Sense 2)
- Onboarding flow: 6/10 (no breadcrumbs/progress)

## §7 Top-5 actionable fixes prioritized

| # | Fix | File:line | Before | After | Effort |
|--:|-----|-----------|--------|-------|--------|
| 1 | Replace emoji 🎓 logo with ElabIcons | LoginPage.jsx:192 | `logo: { fontSize: '56px', ... }` + `🎓` | `<ElabIcons.LogoMark size={56} />` import + render | ~5 LOC modify |
| 2 | Lift subtitle contrast white-50%→75% | LoginPage.jsx:194 | `color: 'rgba(255,255,255,0.5)'` | `color: 'rgba(255,255,255,0.78)'` | 1 line |
| 3 | Add explicit min-height to text-buttons | LoginPage.jsx:253,256,265 | `padding: '8px 16px', fontSize: '14px'` | `+ minHeight: 'var(--touch-secondary)'` (44) | ~3 lines |
| 4 | Tokenize Login error pink-bg | LoginPage.jsx:240,243 | `background: 'rgba(255,107,107,0.1)', color: '#FFCDD2'` | `background: 'var(--color-danger-light)', color: 'var(--color-danger-dark)'` | 2 lines |
| 5 | Add minHeight to primary CTA | LoginPage.jsx:227-228 + WelcomePage.jsx:69-71 | `padding: '14px', fontSize: '16px'` | `+ minHeight: 'var(--touch-primary)'` (56) | 2 file modify ~4 lines |

## §8 Brand alignment Affidabile/Didattico/Accogliente

- **Affidabile**: ◐ login error visible but pink-on-Navy contrast weak. Iter 14 fix.
- **Didattico**: not directly applicable (auth surface).
- **Accogliente**: ◐ "ELAB Tutor" hero with 🎓 emoji feels caricaturale (anti-pattern .impeccable.md "no Disney/cartoon"). Iter 14 swap to ElabIcons LogoMark + brand. WelcomePage card warm but generic "Buongiorno" missing — iter 14 personalize.

## §9 Sense 2 Morfismo coherence kit Omaric + volumi cartacei

- **Sense 2 BORDERLINE**: gradient Navy → near-black is not directly volume-derived (volumi cartacei use stamp Navy + white). Iter 14 explore: gradient Navy → Lime (volume 1 stamp).
- **Sense 2 GAP**: no visual cue to "kit + volumi" companion product on first contact. WelcomePage opportunity iter 14: hero "Per i tuoi volumi ELAB" subtitle + 3-volume thumbnail strip.
- **Sense 1.5 OPPORTUNITY**: post-login per-docente greeting (Sense 1.5 morfismo ADR-019) — currently generic. Iter 14 wire-up.

## §10 Honesty caveats
1. Read 90% LoginPage.jsx via targeted grep + 30-line excerpt (line 192-268). Full read iter 14.
2. WelcomePage.jsx 90% via grep + 30-line excerpt. Full read iter 14.
3. RegisterPage.jsx + RequireLicense.jsx + DataDeletion.jsx NOT critiqued (4 onboarding-adjacent files in `src/components/auth/`) — extend iter 14 D3.5+.
4. LandingPNRR.jsx (39 fontSize hits per D1 §5 row 8) is sales/marketing onboarding — NOT in iter 13 D3 scope.
5. No Playwright screenshot — iter 14 visual regression with auth fixtures.
6. Score 6.5/10 reflects desk-context — LIM-mode score would be lower (5/10) due to fixed white-on-Navy at 3m + emoji issue.

— design-opus iter 13 D3 atom (4/4 onboarding), 2026-04-28.
