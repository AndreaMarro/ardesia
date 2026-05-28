# Swarm 4 — Status (2026-05-29)

**Branch**: `style/swarm-4-home-compile-polish-morfismo-2026-05-29`
**Scope**: Visual polish + Morfismo for `#compile-home` route.
**Owner**: Swarm 4 lead (Claude Opus 4.7 — orchestrator-spawned).
**State**: READY for orchestrator integration.

## POLISH_TOKENS

Centralized in `src/utils/homeCompileAnimationTokens.js` (240 LOC).

| Group | Tokens |
|-------|--------|
| `DURATIONS` (ms) | `micro:120` `fast:180` `normal:280` `slow:480` `breathe:3600` `shimmer:1200` `morph:320` `pulse:1800` |
| `EASINGS` | `outSoft` `inOut` `spring` `linear` `outBack` (no Material rubber-band, no Disney overshoot >6%) |
| `TRANSITIONS` (composite) | `buttonPress` `panelHover` `morph` `ribbonReveal` `skeletonFade` |
| `MASCOT_STATES` | `idle` `listening` `thinking` `speaking` `celebrating` `concerned` |
| `SOUND_DESIGN` | `storageKey: elab_home_compile_sound_muted` + 6 event volume cues (no audio shipped, contract only) |
| `CSS_VAR_NAMES` | 18 CSS custom property names injected by provider |

All tokens exposed both as JS exports + CSS custom properties on `.hcPolishScope` provider root.

## ASSETS_ADDED_LIST_WITH_SIZES

```
/public/assets/home-compile/
  README.md                            1718 B
  illustration-compile-idle.svg        3253 B
  illustration-compile-success.svg     4303 B
  illustration-upload-ready.svg        4471 B
  ──────────────────────────────────  ─────
  total directory                     13745 B (13.7 KB)
```

All under 200 KB per-asset budget. Total directory under 15 KB. ALL SVG Morfismo-derived (Vol1 Lime success / Vol3 Red USB-C / Nano R4 kit Omaric silhouette + Navy palette).

NO npm dependency added (`package.json` untouched). NO Lottie JSON. NO audio files (`<audio>` contract published in `SOUND_DESIGN`, sounds remain a TODO atom).

## MORFISMO_VIOLATIONS_FIXED

Polish layer itself ships ZERO Morfismo violations (10/10 PASS in `docs/audits/2026-05-29-morfismo-audit-home-compile.md`). Baseline regressions identified for FOLLOW-UP atoms (not fixed by Swarm 4 because non-owned files):

| Severity | File | Issue | Action |
|----------|------|-------|--------|
| MED | `UnlimCompileHelper.jsx:30-49` | Hard-coded IT strings (QUICK_QUESTIONS + getStatusMessage) — not i18n wired | Follow-up atom (Swarm 3 surface, post-i18n migration) |
| LOW | `HomeCompileEntry.module.css:60,205` | Hard-coded transition strings `120ms ease` instead of design tokens | Swarm 2 V2 module can adopt `var(--hc-polish-transition-button-press)` |
| LOW | `HomeCompileEntry.module.css:8-20` | Fallback hex literals in `.root` `var(--elab-bg, #F0F4F8)` — values ARE palette so not a violation, but tokens-only would be cleaner | Swarm 2 V2 refactor (optional) |

## CODEX_VERDICT

**PASS — no rework required pre-merge.**

See `.team-status/swarms-2026-05-29/swarm-4-codex-review.md` (91 LOC) — 4 review dimensions all clear:

- (a) Animation jank on low-end Chromebooks: PASS. Hot-path animations are transform/opacity only (GPU compositable). Moderate-cost shimmer collapses under `prefers-reduced-motion`.
- (b) `prefers-reduced-motion` compliance: PASS. Dual enforcement (CSS @media + JS `applyReducedMotionTokens`) + live media-query listener with cleanup.
- (c) Morfismo anti-pattern checklist: PASS (10/10 in-scope checks).
- (d) Asset size budget: PASS (13.7 KB total, max single 4.47 KB << 200 KB ceiling).

## INTEGRATION_CLASS_NAMES

Consumers (orchestrator merge of Swarm 2 layout + Swarm 3 chat) apply these classes:

| Class | Where to apply | Effect |
|-------|----------------|--------|
| `hcPolishScope` | Provider root — automatic | CSS variable injection point + nested-rule scope guard |
| `hcPolishButton` | Any clickable swarm-2 button | Scale 0.97 on `:active`, Lime focus halo, button-press easing |
| `hcPolishPanel` | Any card / panel / banner | Hover shadow lift + focus-within elevation |
| `hcPolishCompileMorph` (with `data-state="compiling|success|error"`) | The single compile-pill in swarm-2 toolbar | Morphs spinner ↔ check ↔ error-shake within the same DOM node |
| `hcPolishCompileSpinner` | Child of `hcPolishCompileMorph` | Rotates while `data-state="compiling"` |
| `hcPolishCheckIcon` (SVG with `<path>`) | Child of `hcPolishCompileMorph` | Draws check stroke while `data-state="success"` |
| `hcPolishRibbon` | Inline label rendered after a compile success | Spring-revealed pill with Lime gradient |
| `hcPolishUploadProgress` + `hcPolishUploadProgressFill` | Upload progress bar in swarm-2 UI | Animated Navy↔Lime gradient + width transition |
| `hcPolishAttention` | Any element needing 3-burst attention | Lime box-shadow pulse, 3 cycles |
| `[data-hc-mascot-state="idle|listening|thinking|speaking|celebrating|concerned"]` | Mascot image element (probably `.mascotImg` in `UnlimCompileHelper.module.css` if integrated, OR the new HomeUnlimChatV2 mascot if swarm 3 prefers polish-driven states) | One of 6 keyframe animations matching the workflow phase |
| `hcPolishSpeechBubble` | UNLIM chat bubble container in swarm-3 chat | Fade-up entry animation |
| `hcPolishSkeleton` + `hcPolishSkeletonLine` / `hcPolishSkeletonBlock` | Any loading placeholder | Khan Academy shimmer sweep (1.2s) |
| `hcPolishIllustrationCompileIdle` / `CompileSuccess` / `UploadReady` | Empty-state slots in swarm-2 layout | Morfismo illustration via background-image |
| `hcPolishSoundToggle` | Sound mute button rendered by consumer chrome | 44×44 affordance, palette-coherent |

Provider exposes context via `useHomeCompilePolish()` hook:
```js
const { reducedMotion, soundMuted, setSoundMuted, playCue } = useHomeCompilePolish();
```

Provider also exposes `data-hc-reduced-motion` and `data-hc-sound-muted` attributes on its root for CSS-only consumers.

## Build + Test

- `npm run build`: PASS (29.8 s, PWA 33 precache entries, no chunk size warnings beyond pre-existing react-pdf 1.9 MB known issue).
- `npx vitest run tests/unit/components/home/HomeCompileEntry-tabs.test.jsx tests/unit/components/home/HomeCompileEntry-codekit-layout.test.jsx`: 10/10 PASS with Swarm 4 files restored. Verified the same 10 tests pass on bare swarm-4 branch + with Swarm 4 files added — ZERO regression from polish layer.

## Files owned by Swarm 4 (final list)

```
src/styles/home-compile-polish.css                          533 LOC
src/components/home/HomeCompilePolishProvider.jsx           200 LOC
src/utils/homeCompileAnimationTokens.js                     240 LOC
public/assets/home-compile/README.md                       1.7 KB
public/assets/home-compile/illustration-compile-idle.svg   3.2 KB
public/assets/home-compile/illustration-compile-success.svg 4.3 KB
public/assets/home-compile/illustration-upload-ready.svg   4.5 KB
docs/audits/2026-05-29-morfismo-audit-home-compile.md       72 LOC
.team-status/swarms-2026-05-29/swarm-4-codex-review.md      91 LOC
.team-status/swarms-2026-05-29/swarm-4-status.md            (this file)
```

## PR
Title: `style(home): swarm-4 micro-interactions + Morfismo polish for compile route`
Body summary points:
- 4 owned greenfield files + 3 inline-SVG Morfismo illustrations under 5 KB each
- Centralized animation tokens (no scattered `300ms ease`)
- 6 mascot animation states (idle / listening / thinking / speaking / celebrating / concerned)
- Compile pill morph + upload progress shader + Khan Academy skeleton + edukit reference compile-pill prominence
- Dual `prefers-reduced-motion` enforcement (CSS + JS)
- Forced-colors mode compat
- ZERO npm dep added (`CLAUDE.md` immutable rule 13)
- ZERO regression on HomeCompileEntry test files (10/10 vitest PASS)
- Build PASS

## Status checks for orchestrator merge

- [x] Branch created from main
- [x] All 4 owned files written + non-empty
- [x] Build PASS (`npm run build`)
- [x] Targeted vitest PASS (no regression on consumer tests)
- [x] Morfismo audit doc written + 10/10 check
- [x] Codex review doc written + verdict PASS
- [x] Status file (this file) complete
- [ ] Commit + push (orchestrator decides cadence)
- [ ] PR open (orchestrator decides timing)

— Swarm 4 lead — 2026-05-29
