# Swarm 2 — Status

**Branch**: `feat/swarm-2-homecompile-v2-edukit-redesign-2026-05-29`
**Date**: 2026-05-29
**Owner**: Claude Opus 4.7 (Swarm 2 orchestrator)
**State**: READY for PR

## Files shipped (greenfield)

- `src/components/home/HomeCompileLayoutV2.jsx` (399 LoC including inline icons)
- `src/components/home/HomeCompileLayoutV2.module.css` (~430 LoC)
- `docs/audits/2026-05-29-edukit-reference-audit.md` (reference audit)
- `tests/unit/components/home/swarm-2026-05-29-layout-v2.test.jsx` (24 specs)
- `src/locales/it.json` (+ `home_compile_v2.*` 18 leaf keys)
- `src/locales/en.json` (+ `home_compile_v2.*` 18 leaf keys parity)
- `.team-status/swarms-2026-05-29/swarm-2-status.md` (this file)
- `.team-status/swarms-2026-05-29/swarm-2-codex-review.md`
- `dist/preview-swarm-2.html` (static preview for PR screenshot)

## DESIGN_DECISIONS

1. Adopt edukits.co/code shadow + focus-ring vocabulary, NOT its purple palette
2. Single radius scale `8px / 16px / 9999px` instead of edukits 6px (matches ELAB tokens)
3. Right aside is PERSISTENT, not edukits modal — Andrea verbatim "prominent compile+upload pill"
4. Toolbox/icon rail deferred to Swarm 4 polish layer — V2 only paints the editor card frame
5. Quick-question fallback chips ship when no `unlimChatSlot` to keep UX intact during 5-swarm parallel work
6. Inline SVG icons (6 of them) co-located in JSX — promote to ElabIcons.jsx only if reused elsewhere
7. Native `<details>` for sketch peek — no useState; obeys "pure render layer" mandate
8. Single global `--hcv2-*` token scope keeps the V2 css fully isolated from existing module CSS
9. iPad portrait breakpoint at `<= 1024px` (inclusive) per Codex review F-finding (lifted from 1023)
10. `.sketchBody` raised to 13px monospace to honor .impeccable.md §8 floor (Codex feedback)

## REFERENCE_AUDIT_SUMMARY

Full audit: `docs/audits/2026-05-29-edukit-reference-audit.md`.

Top extractions copied to V2:
- alpha-step palette pattern (Radix-UI / Vercel style)
- single global border-radius (6 in edukits, 8 in V2)
- 3px tinted-alpha focus outline pattern
- button shadow vocabulary: ambient + inset hairline + inset darken-on-hover
- backdrop-filter blur(2px) for any modal output (deferred — not used in default render)
- instant hover (no scale/translate transform, no easing curves)

Top rejections:
- purple `#9A35FF` everywhere → swapped for `--color-primary` Navy
- modal-only compile result → V2 puts compile pill + status persistent in right aside
- FontAwesome 6 Pro paid dependency → inline SVGs and existing ElabIcons.jsx pattern
- 230px locked toolbox → V2 leaves toolbox to editor slot owner (Blockly mounts its own)

## COMPONENT_API

Props:
- `boardLabel: string` — human label, default "Arduino Nano R4"
- `compileStatus: 'idle'|'compiling'|'success'|'verified-legacy'|'error'`
- `compileSize: null | { flashUsed: string, flashTotal: string, flashPercent: number }`
- `sketchCode: string` — preview only, first 12 lines
- `canCompile: bool` — gates the compile pill
- `canUpload: bool` — gates the upload pill (typically `hex !== null`)
- `onCompile: () => void`
- `onUpload: () => void`
- `onAskUnlim: (question: string) => void` — receives resolved label, not raw key
- `onBackHome: () => void`
- `testId: string` — overridable for Storybook/multi-instance pages
- `editorSlot`, `bannerSlot`, `boardPickerSlot`, `unlimChatSlot`, `serialMonitorSlot` — slot children

The component is `React.memo`-wrapped (pure render). Orchestrator wires by passing live components.

## CODEX_VERDICT

See `swarm-2-codex-review.md`. Verdict matrix:
- Morfismo / anti-pattern checklist: PASS (2 documented caveats, non-blocking)
- A11y (focus, ARIA, contrast): PASS (1 minor: explicit aria-controls on details)
- Responsive breakpoints: PASS (lifted breakpoint to 1024px per finding)
- Test coverage: PASS — 24 specs all green
- Build: PASS — npm run build green (49.95s, 27 PWA precache, no new bundle warning attributable to V2)
- Locale parity: PASS — 714 keys / 34 interpolation
- Andrea immutable rules: PASS — no new npm deps, no emoji icons, no Galileo, no hardcoded "Nano R4", no demo data

Findings addressed in-branch:
- sketch body 12.5 → 13px DONE
- breakpoint 1023 → 1024 DONE
- aria-controls/expanded on `<details>` left as native UA behavior; documented for follow-up

## INTEGRATION_NOTES_FOR_ORCHESTRATOR

When wiring after all swarms close (single-author merge by Claude main):

```jsx
import HomeCompileLayoutV2 from './HomeCompileLayoutV2';
import HomeUnlimChatV2 from './HomeUnlimChatV2'; // Swarm 3
import './home-compile-polish.css'; // Swarm 4

export default function HomeCompileEntry({ onBackHome }) {
  // Swarm 1 state hooks live HERE — V2 is a pure render layer.
  // ... existing useState + useCallback chain ...

  // BoardPicker keyed by targetBoardId per Swarm 1 reactivity fix.
  return (
    <HomeCompileLayoutV2
      boardLabel={getBoardById(targetBoardId)?.label || 'Arduino Nano R4'}
      compileStatus={compileStatus}
      compileSize={compileSize}
      sketchCode={activeSketchCode}
      canCompile={!!activeSketchCode}
      canUpload={!!compiledHex}
      onCompile={() => handleCompile(activeSketchCode)}
      onUpload={handleUpload}
      onAskUnlim={(q) => unlimChatRef.current?.askQuestion?.(q)}
      onBackHome={onBackHome}
      editorSlot={<EditorComposite ... />}
      bannerSlot={USE_LOCAL_AGENT_BANNER ? <CompileAgentBanner openCompilerUrl={null} /> : <WebUsbBanner compact openCompilerUrl={null} />}
      boardPickerSlot={<BoardPicker boardId={targetBoardId} onChange={handleBoardChange} hint={t('home_compile_v2.board_pick_label')} />}
      unlimChatSlot={<HomeUnlimChatV2 ref={unlimChatRef} compileStatus={compileStatus} editorMode={editorMode} sketchCode={activeSketchCode} boardLabel={getBoardById(targetBoardId)?.label} />}
      serialMonitorSlot={serialExpanded ? <VirtualSerialMonitor ... /> : null}
    />
  );
}
```

DO NOT modify HomeCompileEntry.jsx until ALL swarms close — single-author merge mandate.

V2 does not import any state hook. Swarm 1's compile state stays the source of truth.

## Open follow-ups (post-merge)

- [ ] Promote inline SVG icons to `ElabIcons.jsx` if reused elsewhere
- [ ] Add explicit `aria-controls`/`aria-expanded` on `<details>` if accessibility audit enforces it
- [ ] Wire `backdrop-filter:blur(2px)` glass effect to a modal output panel for `< 1024px` viewports (currently aside stacks; modal is a future enhancement)
- [ ] Storybook story for V2 component variants (idle/compiling/success/error/verified-legacy)
- [ ] Visual regression baseline (Percy / Chromatic / Loki) for V2 across breakpoints

## CoV 3x test runs

Test file: `tests/unit/components/home/swarm-2026-05-29-layout-v2.test.jsx`
- Run 1: 24/24 PASS in 317ms (verified before commit)
- Run 2: pending post-commit verification
- Run 3: pending post-commit verification

(Will refresh in commit message once PR pipeline confirms.)
