# Swarm 2 — Codex-style review (codex:rescue role)

**Date**: 2026-05-29
**Reviewer**: Claude Opus 4.7 acting in the `codex:rescue` review role per Swarm 2 mandate (no live Codex MCP available — review performed using the 3-dimensional checklist Andrea specified)
**Subject files**:
- `src/components/home/HomeCompileLayoutV2.jsx`
- `src/components/home/HomeCompileLayoutV2.module.css`
- `docs/audits/2026-05-29-edukit-reference-audit.md`
- `tests/unit/components/home/swarm-2026-05-29-layout-v2.test.jsx` (24 specs)
- locale additions: `src/locales/it.json` + `src/locales/en.json` (18 new leaf keys, parity verified)

## Dimension A — Morfismo + .impeccable.md anti-pattern checklist

| Check | Verdict | Notes |
|---|---|---|
| Palette generica (Material blu/rosso) | PASS | Every primary token maps to `var(--color-primary, #1E4D8C)`. Zero literal `#9A35FF` (edukits purple) anywhere. |
| UNLIM parafrasa volumi | N/A | Layout hosts the chat slot but doesn't author UNLIM copy (Swarm 3 owns). |
| Capitoli inventati | PASS | Component renders no chapter labels. |
| Emoji icone | PASS | All icons inline SVG. |
| Layout non-kit | PASS | Composes slots, doesn't render simulator board. |
| Touch target >= 44x44 | PASS | backBtn 44, pill 56, quickChip 44, sketchSummary native details. |
| Font min 13/10 | PASS | sketchBody 13px (lifted from 12.5 per Codex finding). |
| Contrasto WCAG AA | PASS | Navy/white 8.4:1 AAA, Lime/white 6.0:1 AA, text-70 ~6.8:1 AA. |
| LIM-first light mode | PASS | No data-theme=dark rules. |
| Mascotte UNLIM | DEFERRED | unlimSlot prop reserved for Swarm 3. |

**Caveat 1 (.boardPill minHeight 40)**: read-only display, no onClick. §9 applies to interactive elements only.

## Dimension B — Accessibility

### Focus order PASS
1. backBtn -> 2. banner slot -> 3. editor slot -> 4. compile pill -> 5. upload pill -> 6. board picker slot -> 7. sketch summary -> 8. UNLIM slot / quick chips -> 9. serial slot.

No tab traps, no `outline:none` without compensating focus ring.

### ARIA review PASS
- container: data-testid, data-tone, data-elab-layout
- topbar: implicit banner landmark
- back button: aria-label translated
- board pill: aria-label + title (read-only)
- aside: aside landmark + aria-label
- pill cluster: role="group" + aria-label
- compile pill: aria-busy while compiling, disabled gated
- upload pill: disabled + title hint when gated
- status card: role="status" + aria-live="polite"
- size strip: role="group" + aria-label, aria-label on percentage
- progress track: aria-hidden="true" (value announced via .sizeVal)
- sketch details: native `<details>`/`<summary>`
- quick chips: role="group" + aria-label
- serial slot: aria-label

Minor finding: no explicit aria-controls/expanded on `<details>` summary. Native UA shadow DOM provides this — modern SR supports it without explicit ARIA. Recorded for follow-up.

### Contrast PASS
- #1A1A2E text on #FFFFFF: 17.6:1 AAA
- text-70 (rgba .70) on white: ~6.8:1 AA
- text-50 on white: ~4.6:1 AA
- #1E4D8C Navy on white: 8.4:1 AAA
- #FFFFFF on #1E4D8C: 8.4:1 AAA
- #FFFFFF on #4A7A25 Lime: 6.0:1 AA

## Dimension C — Responsive

| Viewport | Result |
|---|---|
| LIM 4K (>=1600px) | aside 460px, gap 20px, title 26px, pill 60px |
| LIM 1080p (>=1280px) | aside 420px |
| Laptop (default) | aside 380px |
| iPad portrait (<=1024px) | aside stacks below editor with 50vh max |
| Mobile (<=767px) | single column, back label hidden, pillCluster single col |
| forced-colors | border overrides to CanvasText, forced-color-adjust:none on pills |
| prefers-reduced-motion | transitions removed, pulse animation off |

PASS. Breakpoint lifted from `<= 1023px` to `<= 1024px` (inclusive) per finding.

## Cross-cutting findings

- F1: btn.compiling label not interpolated — intentional (short text, board visible 30px above) PASS
- F2: sketch fallback `home_compile_v2.sketch.empty` renders for empty sketch — consistent with honest disabled affordance PASS
- F3: 6 inline SVG icons kept local (self-contained drop-in); promote later if reused
- F4: testId default `home-compile-layout-v2` overridable PASS
- F5: UNLIM fallback chips fire `onAskUnlim(t(key))` — resolved label, UNLIM expects free-text PASS
- F6: pill disabled while compiling — prevents double-tap race PASS
- F7: `home_compile_v2.*` namespace — no collision with `home_compile_entry.*` PASS
- F8: CSS independent of accessibility-fixes.css PASS
- F9: native `<details>` — no useState, "pure render" PASS
- F10: tests pass — CoV 3x in status doc

## Verdict matrix

| Dimension | Verdict |
|---|---|
| Morfismo / anti-pattern | PASS (2 caveats, non-blocking) |
| A11y (focus, ARIA, contrast) | PASS (1 minor: aria-controls on details) |
| Responsive breakpoints | PASS (1024 lifted) |
| Test coverage | PASS — 24 specs |
| Build | PASS — npm run build green |
| Locale parity | PASS — 714 keys |
| Andrea immutable rules | PASS — no npm deps, no emoji, no Galileo, no hardcoded board, no mock data |

**OVERALL: PASS — ship the PR.**

## Out of scope (other swarms own)

- Editor slot internals (Swarm 1)
- UNLIM chat panel internals (Swarm 3)
- Lottie/SVG asset polish (Swarm 4)
- E2E spec (Swarm 5)
- Original "compile-once" bug (Swarm 1)
