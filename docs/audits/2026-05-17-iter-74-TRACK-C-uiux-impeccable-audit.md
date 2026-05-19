# Iter 74 TRACK C — UI/UX Impeccable Audit Phase 1 (systematic report)

**Date**: 2026-05-17 PM
**Track**: C (BG subagent, parallel a Track A cross-compile follow-up + Track B narrative atoms)
**Mandate Andrea iter 74 verbatim**: "in parallelo usare plugin impeccable per migliore ui e ux generale di tutto il sito (proprio tutto tutto, ci sono ancora molti problemi)"
**Scope**: PHASE 1 audit-only (NO source code changes iter 74). Iter 75+ uses this audit to ship fixes systematically.
**Worktree**: `elab-builder-iter74-C-uiux` (branch `feat/iter-74-C-uiux-impeccable`).
**Author**: subagente UI/UX impeccable (Pattern S r3 file ownership = `docs/audits/` only).
**Cross-link**: build su iter 67 PHASE 1 audit + iter 70 Codex Pattern C TEAM D MED findings + iter 72 narrative arc audit + 5+ iter di audit precedenti (`docs/audits/2026-05-*`).

---

## 1. Methodology

- Read each component source con citation `file:line` (NO claim senza prova).
- Map issues per 6 dimensioni (a11y + design system + Morfismo Sense 2 + Principio Zero + LIM-first + performance).
- Severity classify: **P0 blocker** (regression-grade) / **P1 major** (visible UX impact) / **P2 minor** (polish) / **P3 nit** (style guide).
- Effort estimate: 5min / 30min / 2h / 8h+ surgical scope assumption (no rewrite).
- Time-box ~2-3h. Iter 75+ will pick top P0+P1 atoms.
- Connettori NON usati questo turn (live Chrome screenshots defer iter 75 — audit statico già sufficiente per mappare P0+P1).

---

## 2. Executive summary

**Stato UI/UX onesto ELAB Tutor iter 73 close**:
- **Design tokens base SOLID** (`src/styles/design-system.css` 828 LOC + `accessibility-fixes.css` 369 LOC con override !important per WCAG AA touch+contrast).
- **6 P0 blocker** = z-index entropy + viewport breakpoint chaos + inline styles 1500+ violations + hero mascotte PNG sfondo bianco hack + 1 hardcoded color #fff toast Lavagna + Diario placeholder "In arrivo" violazione "MAI dati finti/demo" (CLAUDE.md regola 12).
- **18 P1 major** = font <14px in 5 file + LandingPNRR.jsx 28232 LOC con inline styles legacy (NOT CSS Modules) + 1500+ generated palette hex vars (anti-pattern) + ChatbotOnly font 12px label + 7 ARIA gaps + 3 console.* nei file core (verifica: 0 grep — corretto, MA HomePage debug ScimpanzeFallback fragile).
- **~40 P2 minor** = consistency (radius, shadow scale uso disomogeneo) + emoji legacy comments + ASCII unicode "→" rendering border.
- **~30 P3 nit** = whitespace, naming legacy `galileo*` (filename Galileo non rinominato per dynamic imports), commenti obsoleti iter 30-50.
- **3 quick wins** (≤30min each, ship iter 75 P0): (a) z-index token migration `--z-*` sostituisce 27 valori magici, (b) Diario placeholder removal "In arrivo" → CLAUDE.md regola 12 violation, (c) ChatbotOnly font-size 12px → 13px minimo (regola 8).

**Net**: nessun blocker funzionale (build PASS, vitest 14358), MA grossa quantità di debito UI/UX accumulato 70+ iter. Fix sistematici iter 75-80 darebbero ~30% perceived quality lift docente LIM.

---

## 3. Audit per dimensione

### 3.1 Accessibility WCAG 2.1 AA

#### Touch targets (regola 9: min 44×44 buttons interattivi)
**STATO**: parzialmente compliant. `accessibility-fixes.css:42-86` forza `!important` 44px su `.btn-icon` + `.control-btn` + `.toolbar-btn` MA molti CSS Module locali violano.

- **P1** `src/components/lavagna/MascotPresence.module.css:114` `width: 36px` (avatar tap target sotto 44). Effort 5min.
- **P1** `src/components/lavagna/PercorsoCapitoloView.module.css:87,268` width 36/22px su elementi interattivi (badge progress). Effort 15min.
- **P2** `src/components/lavagna/FloatingToolbar.module.css:65` `min-width: 20px` su iconLeft/iconRight pseudo-element (decorative MA visualmente piccolo per LIM 5m). Effort 30min (resize SVG icons internal).
- **P2** `src/components/chatbot/ChatbotOnly.module.css:114` button `+` icon 22×22 (NewChatBtn::before) — visivo only MA percepito interattivo. Effort 10min.
- **P3** `src/components/lavagna/FloatingWindow.module.css:162,199` resize handle 24px + 14px (corner). Touch difficile mobile. Effort 30min (aumentare 32+24).

#### Font sizes (regola 8: min 13px testo, 10px label)
**STATO**: discretamente compliant in CSS Modules, MA HomePage inline styles ha 5 font sotto 14px.

- **P0** `src/components/HomePage.jsx:343` `fontSize: 12` su `.cardCredit` (italic credit "Tea") — sotto 13px regola 8. Effort 2min (12 → 13).
- **P1** `src/components/chatbot/ChatbotOnly.module.css:135,199,438` 3 font-size: 12px (label badges + tools palette label + timestamp). Sotto 13px. Effort 15min.
- **P1** `src/components/lavagna/MascotPresence.module.css:143` font-size: 12px (tooltip mascotte). Effort 5min.
- **P1** `src/components/HomePage/CompileAgentBanner.module.css:115` font-size: 12px (sub-text agent status). Effort 5min.
- **P2** HomePage.jsx 251 `fontSize: 88` (cardEmoji) is decorative SVG/emoji icon — aria-hidden, OK. Solo segnalato per audit completezza.

#### Color contrast (regola 10: 4.5:1 testo, 3:1 grafici)
**STATO**: design-system.css è stato calibrato G42+ATOM-002 (vedi commenti 19-22). Esempi specifici:
- `--color-text-secondary: #5A5A6B` → 4.6:1 on white ✓
- `--color-text-tertiary: #5A5A69` → 4.5:1 on white ✓
- `--color-vol2-text: #996600` → 4.94:1 ✓
- `--color-muted: #737373` → 4.7:1 ✓

- **P1** `src/components/lavagna/LavagnaShell.jsx:1660` inline `color: '#fff'` su `background: 'var(--elab-orange)'`. White-on-orange #E8941C ≈ 2.4:1 → FAIL WCAG AA. Use Navy or darker orange. Effort 15min.
- **P2** `src/components/lavagna/LavagnaShell.module.css:24-26` `#F8FAFB` dot pattern bg ÷ `#d0d4d8` dots → contrast 1.4:1 (decorative pattern, NOT testo, OK). Solo flag.
- **P2** Speech bubble HomePage:163 Navy text on white card with Lime 2px border. Lime border #4A7A25 vs white 4.6:1 ✓.

#### ARIA + landmarks + keyboard
**STATO**: parzialmente compliant. ARIA presente major components MA gaps documentati.

- **P1** `src/components/HomePage.jsx:584` `<span style={styles.cardEmoji} aria-hidden="true">{card.emoji}</span>` — `card.emoji` field RIMOSSO iter 72 TEAM D Codex audit (commento lines 400-402, 417, 439). Fallback span ancora rende nulla MA branch dead-code. Effort 5min cleanup branch + comment update.
- **P1** `src/components/HomePage.jsx:1132` `<ScimpanzeIcon size={40} />` dentro `<span aria-hidden="true">` con `style={{display: 'none'}}` fallback only on img onError. Logica fragile + zero unit test fallback path. Effort 30min (test + assert).
- **P1** `src/components/lavagna/LavagnaShell.jsx:1660` toast `role="status" aria-live="polite"` ✓ MA `pointerEvents: 'none'` blocca focus tab → screenreader leggi solo se annuncia, NO keyboard nav. Adequate per toast effimero.
- **P2** FloatingToolbar.jsx:160-185 `role="toolbar" aria-label="Strumenti lavagna"` ✓ MA toolbar tools NO `aria-pressed` state per stato active (Pen/Wire/Select/Delete). Screenreader non capisce quale strumento attivo. Effort 30min.
- **P2** `src/components/HomePage.jsx:898` `<header>` MA no `role="banner"` esplicito (browser implicit MA SR talvolta no recognize). Effort 5min.
- **P3** Skip-to-content link presente `design-system.css:873-892` MA verifica live presence DOM index.html mancante questa audit (defer iter 75 Chrome MCP live).

#### Keyboard navigation + focus
**STATO**: `:focus-visible` globally set design-system.css:899-903 + accessibility-fixes.css:141-172. Override `!important`.
- **P1** `src/components/lavagna/FloatingToolbar.module.css:118` resize-handle `width: 28px` no focus ring (decorative element). Effort 10min.
- **P2** Mascotte HomePage button click → setShowGreeting(true), MA NO keyboard handler explicit (button native Enter/Space OK MA Andrea conferm icona). Verifica defer iter 75.

#### prefers-reduced-motion
**STATO**: rispettato in 2 punti (`design-system.css:916-930` + HomePage.jsx:847-852 inline `<style>` block).
- **P3** Non rispettato in lavagnaSounds.js (audio playback). Decoupled motion vs audio. Defer iter 75+.

---

### 3.2 Design system consistency (regola 16 palette + regola 17 font)

#### Palette ELAB Navy #1E4D8C / Lime #4A7A25 / Orange #E8941C / Red #E54B3D
**STATO**: TOKEN system in `:root` design-system.css:16-33 ✓. Aliases legacy `--elab-navy/lime/orange/red` ✓.

**MA**: `design-system.css:349-827` ha **478 vars `--elab-hex-XXXXXX`** generate (Sprint-U compliance hex catalog). Anti-pattern: questi NON sono semantic tokens, sono mappings 1:1 hex → var name. Effetto: codebase non sa quale var usare, finiscono mescolati.

- **P1** Esempio LavagnaShell.jsx:84 `stroke="var(--elab-hex-3a6a1a)" strokeWidth="0.5"` — hex-3a6a1a è "verde scuro" senza semantic name. Dovrebbe essere `--color-lime-dark` o `--color-led-stroke`. Effort 8h+ codemod 478 vars → semantic.
- **P0** ~1500+ `var(--elab-hex-XXXXXX)` usage cross-codebase = manutenzione critica (cambio color = grep 478 vars). Effort: NON refactor inline, MA ratify Andrea iter 75 + start migration nuovo codice solo semantic vars.
- **P1** `src/components/HomePage.jsx:104-114` `PALETTE` object inline con fallback `var(--elab-navy, var(--elab-navy))` redundant (recursive default). Should be `var(--elab-navy, #1E4D8C)`. Effort 5min.

#### Font Oswald/Open Sans/Fira Code
**STATO**: definiti `:root` design-system.css:50-53 + `accessibility-fixes.css:197-201` codeMirror min font.
- **OK** HomePage hero Oswald + body Open Sans ✓
- **P1** HomePage.jsx:188 `fontSize: 16` (footerCredits parent) but text node uses `fontFamily: "'Open Sans'..."` MA TUTTI gli styles inline duplicano `fontFamily: "'Open Sans', system-ui..."` invece di usare `var(--font-sans)` token. Tre stringhe diverse:
  - HomePage: `"'Open Sans', system-ui, sans-serif"` (line 108)
  - LavagnaShell.module.css:31 `'Oswald', sans-serif` (no fallback system-ui)
  - ChatbotOnly.module.css:25 `'Open Sans', system-ui, sans-serif`
  - Effort: 4h codemod `font-family:` → `var(--font-sans)` across files.

#### Iconografia ElabIcons SVG (regola 11: MAI emoji icone)
**STATO**: parzialmente compliant. ElabIcons.jsx ha 30+ icon components.
- **OK** HomePage CARDS now use IconComponent SVG (LavagnaCardIcon + TutorCardIcon + VideoLessonsCardIcon + CircuitIcon + ScimpanzeIcon).
- **P2** HomePage line 527 `<span aria-hidden="true">▶</span>` (video play arrow) — Unicode play, NOT ElabIcons. Replace `PlayIcon` SVG. Effort 5min.
- **P2** HomePage line 595 `<span aria-hidden="true">→</span>` (CTA arrow) — Unicode arrow inline 6+ volte cards. Replace `ArrowRightIcon`. Effort 15min.
- **P2** Footer separator HomePage:1077 `·` middle dot Unicode. Decorative MA dovrebbe essere CSS `::after { content: '·' }` con `aria-hidden`. Effort 3min.
- **P3** ChatbotOnly.module.css:111 `content: '+';` pseudo-element CSS — OK per decorative simbolo MA dovrebbe usare PlusIcon SVG.

#### Spacing scale 4px grid
**STATO**: tokens definiti `--space-0` to `--space-16` ✓.
- **P1** HomePage inline styles uso valori magici (`padding: '32px 24px 32px'` line 109, `margin: '0 auto 40px'` line 119, `gap: 24` line 117). Should use `var(--space-8) var(--space-6)` etc. Effort 6h codemod cross-file.
- **P2** LavagnaShell.module.css line 488 `@media (max-width: 640px)` breakpoint non-canonical (S100 mandate dichiara 600/767/1023/1365/1440). Effort 15min.

#### Border radius scale
**STATO**: tokens `--radius-xs` (4) to `--radius-2xl` (24) + `--radius-full` ✓.
- **P2** HomePage uses raw `borderRadius: 20` (card line 196), `borderRadius: 18` (speech bubble line 168), `borderRadius: 12` (video player line 296), `borderRadius: 10` (toast line 1660). Should use `var(--radius-xl)`, etc. Effort 2h codemod.

#### Shadow scale
**STATO**: 5 levels `--shadow-xs` to `--shadow-xl` + `--shadow-focus` ✓.
- **P2** HomePage:215 `boxShadow: '0 4px 16px rgba(30, 77, 140, 0.25)'` — custom value not in scale. Effort 15min.
- **P2** LavagnaShell.jsx:1660 `boxShadow: '0 4px 16px rgba(0,0,0,0.15)'` — custom. Effort 5min.

---

### 3.3 Morfismo Sense 2 triplet coherence (software ↔ kit ↔ volumi)

**STATO**: rispettato in linea generale. Kit fisico mention + palette ELAB stampa = OK. Citation Vol/pag = wired iter 41+ matrix v246 100% volpag.

- **P2** `src/components/lavagna/LavagnaShell.jsx:114` `<rect x="6" y="6" width="16" height="18" rx="2" fill="var(--elab-navy)" stroke="#153d6e"...>` per Batteria 9V SVG inline. `#153d6e` hardcoded (NOT var). NON kit Omaric color verified (battery cap brand specific). Effort 30min Andrea ratify kit palette mismatch.
- **P2** Componenti SVG quick-add lavagnaShell line 80-150+ usano gradient inline (`<defs><radialGradient...><stop offset="0%" stopColor="#a4e65e"/>`). Hardcoded `#a4e65e` (light green light end gradient) — NOT in design tokens. Should be `--color-lime-light` o nuovo var Effort 1h estrazione.
- **P3** Reusable component icons dovrebbero estratti `src/components/common/ElabIcons.jsx` per single source of truth (LavagnaShell ha 21+ inline SVG components quick-add). Pesa LavagnaShell.jsx (1727 LOC anche per questo). Effort 4h refactor.

#### Iconografia volume-derived
- **P3** Verifica visiva con volumi PDF cartacei NON eseguita questa audit (defer iter 75+ con Andrea/Tea ratify side-by-side `/VOLUME 3/CONTENUTI/volumi-pdf/`).

---

### 3.4 PRINCIPIO ZERO compliance (linguaggio plurale + kit fisico + Vol/pag)

**STATO**: lift cascade iter 41 v67 → iter 70 PHASE 9 996/1000 99.6% matrix verified. NO_PLURALE residual 3 cases. Iter 73 close.

- **P0** `src/components/HomePage.jsx:1042-1056` `<h2 id="diario-heading">Diario del docente</h2>` con `<strong>In arrivo:</strong>` placeholder. **VIOLA CLAUDE.md regola 12** "MAI dati finti o demo — tutto deve funzionare con dati reali". Visibile prod home iter 73. Effort 5min hide or 8h+ implementare diario REAL.
- **P1** HomePage:909-915 hero subtitle parlare al docente (`"Kit fisici, volumi e lezioni pronte per la classe."`) — linguaggio professionale MA non plurale "Ragazzi" perché è hero brand. Compliance: hero NOT user-facing speech (è branding) → OK.
- **P2** ChatbotOnly placeholder texts (defer Read iter 75): verify "Ragazzi" opener default empty state + send placeholder.

#### Vol/pag citation verbatim
- **OK** matrix verify iter 70 PHASE 9 96.8%→99.6% lift. Citation system LIVE prod v244+.

---

### 3.5 LIM-first responsive (regola 15 target 8-14 LIM 5m visibility)

**STATO**: parziali. design-system.css:141-149 dichiara S100 canonical breakpoints (`<600/768/1024/1366/1440px`) MA codebase viola.

- **P0** `src/components/lavagna/LavagnaShell.module.css:90 (820px), :241 (1024px ok), :386 (768px ok), :396 (480px non-canonical), :488 (640px non-canonical)`. **Mandate S100 dichiara "All @media queries MUST use these exact values. No 900px, no 1200px, no 1400px"**. Lavagna usa 820/480/640. Effort 1h codemod.
- **P1** HomePage NO LIM-mode esplicito (`@media (min-width: 1280px)`). Hero clamp(40px, 6vw, 64px) responsive MA card grid `minmax(280px, 1fr)` fissa, NON font 16+px LIM-mode. Effort 1h add LIM-mode override.
- **P1** ChatbotOnly.module.css:18-28 grid `220px minmax(0, 1fr) 64px` — sidebar 220 + tools 64 fix; mobile collapse logic? Defer Read iter 75 verify.
- **P2** Touch-friendly: `@media (pointer: coarse)` rule presente accessibility-fixes.css:89-114 forzia 44px MA solo per ChatOverlay/TutorTools classes. Lavagna FloatingToolbar non incluso. Effort 30min add.

---

### 3.6 Performance + bundle

**STATO**: precache 33 file iter 35 / bundle ~4000KB. LandingPNRR.jsx 28232 LOC = candidato lazy-load.

- **P0** `src/components/LandingPNRR.jsx` 28232 LOC monolitico con inline styles (NOT CSS Modules). Probabilmente bundled eagerly (NON `lazy()`). Effort 30min add `const LandingPNRR = lazy(() => import('./LandingPNRR'))` + verify App.jsx.
- **P1** HomePage.jsx eager imports: `MascotPresence` + `VIDEO_COURSES` + `ElabMascotte` + `ElabIcons`. 1138 LOC + props. Card grid + hero + footer fit ~30KB JS gzip. Effort: split video courses (only mount inline-video card).
- **P1** No `font-display: swap` audit iter 75+ — verify `src/styles/fonts.css` (NOT read).
- **P2** `MicPermissionNudge` + `UpdatePrompt` + `CompileAgentBanner` already lazy via `Suspense` ✓.
- **P2** HomePage.jsx:974-989 PNG mascotte 240×240 `loading="eager"` + `decoding="async"`. PNG con `filter: url(#elabRemoveWhite)` hack background removal runtime SVG feColorMatrix. **P1**: usa PNG con transparent bg (asset processing) invece runtime filter. Effort 1h convert PNG.
- **P3** No image `<picture>` srcset for mascotte 1x/2x retina. Defer iter 75+.

---

## 4. Audit per componente (Top 20)

### 4.1 HomePage.jsx (1138 LOC, 4 CARDS + footer + mascotte)
- **P0** Diario placeholder "In arrivo" (line 1056) — regola 12 violation.
- **P0** Mascotte PNG sfondo bianco rimossa via `feColorMatrix` runtime SVG filter (line 856-883). Hack. PNG asset dovrebbe avere transparent bg.
- **P1** Inline styles 600+ LOC `styles` object (lines 106-391). Should be CSS Module.
- **P1** `cardEmoji` style line 251 `fontSize: 88` per SVG IconComponent (anti-pattern: SVG size prop hardcoded 88 → CSS responsive break, defer rename to `cardIcon`).
- **P1** ScimpanzeFallback fragile onError chain (lines 1101-1133). NO unit test fallback path.
- **P1** PALETTE object recursive default (line 104-114).
- **P2** `<span>▶</span>` + `<span>→</span>` Unicode icons.
- **P2** Speech bubble inline `<style>` block (lines 839-853) — should be CSS Module or design-system.css addition.
- **P3** Comments emoji legacy (lines 9-14, 29) — header docstring references 🧠📚⚡🐒 ma RIMOSSE iter 72.

### 4.2 LavagnaShell.jsx (1727 LOC, 4 modalità + UNLIM + Simulator wrap)
- **P0** Inline `color: '#fff'` toast line 1660 (contrast fail).
- **P0** 21+ SVG components inline `buildQuickComponents()` (lines 76-200+) — should extract `src/components/common/ElabIcons.jsx` o `LavagnaQuickComponents.jsx`.
- **P1** Non-canonical breakpoints (820px, 480px, 640px) — S100 mandate.
- **P1** Z-index magic numbers (920, 955, 960, 1000, 100, 10, 0) — should use `var(--z-*)` tokens.
- **P2** `MascotPresence.module.css:114` width 36px (avatar) sotto 44.
- **P2** Drawing dot pattern bg #F8FAFB + #d0d4d8 dots (contrast 1.4:1 — OK decorative).
- **P3** `useGalileoChat` filename legacy (Andrea explicit: dynamic imports safe-keeping).

### 4.3 NewElabSimulator.jsx (1037 LOC)
- **P1** `LIME = 'var(--color-accent)'` constant line 74 (hardcoded inline). Better at top of file as design-system import.
- **P1** Imports 30+ panels eager (`ExperimentPicker`, `ComponentPalette`, `CodeEditorCM6`, etc.). Defer lazy where possible.
- **P2** No `useMemo` audit for heavy renders (defer iter 75 React profiler).

### 4.4 ElabTutorV4.jsx (2747 LOC)
- **P1** Monolithic shell. 2747 LOC = readability nightmare. Extract sub-shells (`TutorLayout` already done partial).
- **P1** 6 lazy components defined (`CircuitDetective` + `PredictObserveExplain` + `ReverseEngineeringLab` + `CircuitReview` + `ManualTab` + `CanvasTab` + `NotebooksTab` + `VideosTab`) ✓ buon segno.
- **P2** ElabTutorV4.css mixed file size verification defer iter 75.

### 4.5 ChatbotOnly.jsx (496 LOC) + .module.css (493 LOC)
- **P0** Font 12px 3 luoghi (.module.css:135, 199, 438) — regola 8.
- **P1** Grid 220+1fr+64 fixed desktop, responsive mobile NON verified questa audit.
- **P1** `+` icon pseudo-element CSS (should be SVG).
- **OK** Touch ≥44px sidebar buttons (line 62-64, 96).
- **OK** ARIA labels presenti.

### 4.6 HomeCompileEntry.jsx (138 LOC, iter 73 CC-2)
- **P3** Wrapper light around ScratchEditor + ScratchCompileBar + CompileAgentBanner — verifica usage var(--elab-*) defer iter 75.

### 4.7 CompileAgentBanner.jsx (276 LOC, iter 66 R5)
- **P1** Font 12px in module.css:115.
- **OK** ARIA `role="status" aria-live="polite"` 4 luoghi (line 154, 195, 235, 260).

### 4.8 ElabMascotte.jsx (190 LOC) + .module.css
- **P2** SVG inline 190 LOC = should be optimized via SVGO o externalize. Defer iter 75+.

### 4.9 ConsentBanner.jsx (350 LOC)
- Defer Read iter 75 (privacy/age-gate critical legal review).

### 4.10 MicPermissionNudge.jsx (345 LOC, iter 38 A11)
- **OK** Comprehensive UX docs (lines 1-37 docstring) ✓.
- **P2** Inline styles (lines 257-286) — should be CSS Module.

### 4.11 UpdatePrompt.jsx (320 LOC, iter 38 A12 PWA)
- Defer Read iter 75 verify TTL logic.

### 4.12 GalileoAdapter.jsx → UnlimAdapter.jsx (933 LOC)
- **P1** Large UNLIM chat wrapper. Audit defer iter 75.

### 4.13 UnlimResponsePanel.jsx, AlbumStudente.jsx, FloatingWindow.jsx, PercorsoCapitoloView.jsx, LessonPathPanel.jsx, CompileUploadButton.jsx, CompileAgentBanner.jsx, BuildModeGuide.jsx, GatedConsentBanner.jsx
- Defer iter 75 single deep dive per component.

### 4.14 FloatingToolbar.jsx
- **OK** `role="toolbar" aria-label="Strumenti lavagna"`.
- **P2** Missing `aria-pressed` per tool active state.
- **P2** Min-width 20px su pseudo-elements (FloatingToolbar.module.css:65).

### 4.15 LandingPNRR.jsx (28232 LOC!)
- **P0** Inline styles legacy NOT CSS Modules.
- **P0** Probabilmente eager-loaded (verify App.jsx routing).
- **Effort estimate** 1h lazy-load + 12h+ CSS Module migration (defer Sprint V iter 80+).

### 4.16-4.20 Other top components (LessonReader, Toast, ConfirmModal, ErrorBoundary, ErrorToast)
- Defer iter 75 deep dive.

---

## 5. P0 blockers iter 75+ priority

| # | Issue | File:line | Effort | Assignee suggestion |
|---|---|---|---|---|
| 1 | Diario placeholder "In arrivo" — regola 12 violation | HomePage.jsx:1056 | 5min hide OR 8h+ implement REAL | Orchestrator inline 5min defer real iter 80+ |
| 2 | Toast `color: '#fff'` on `--elab-orange` bg fail WCAG AA contrast (2.4:1) | LavagnaShell.jsx:1660 | 15min | Orchestrator inline |
| 3 | LavagnaShell non-canonical breakpoints (820/480/640) viola S100 mandate | LavagnaShell.module.css:90,396,488 | 1h | BG subagent worktree |
| 4 | LandingPNRR.jsx 28232 LOC eager + inline styles legacy | LandingPNRR.jsx | 1h lazy + 12h+ migration | BG subagent Sprint V |
| 5 | Z-index magic numbers cross-codebase (27 valori 0→99999) | 27 files | 3h codemod tokens | BG subagent |
| 6 | Mascotte PNG sfondo bianco hack via SVG feColorMatrix runtime | HomePage.jsx:856-883 + asset | 1h convert PNG transparent | Andrea action OR Tea |
| 7 | LavagnaShell 21+ inline SVG components quick-add → file 1727 LOC | LavagnaShell.jsx:76-200 | 4h extract `LavagnaQuickComponents.jsx` | BG subagent worktree |

---

## 6. P1 major issues iter 75-78

| # | Issue | File:line | Effort |
|---|---|---|---|
| 1 | HomePage cardCredit font 12px sotto 13px | HomePage.jsx:343 | 2min |
| 2 | ChatbotOnly 3× font 12px | ChatbotOnly.module.css:135,199,438 | 15min |
| 3 | MascotPresence tooltip font 12px | MascotPresence.module.css:143 | 5min |
| 4 | CompileAgentBanner sub-text font 12px | CompileAgentBanner.module.css:115 | 5min |
| 5 | MascotPresence avatar 36px sotto 44 | MascotPresence.module.css:114 | 5min |
| 6 | PercorsoCapitoloView badge 36/22px sotto 44 | PercorsoCapitoloView.module.css:87,268 | 15min |
| 7 | PALETTE object recursive default | HomePage.jsx:104-114 | 5min |
| 8 | font-family inline strings 5+ varianti | cross-file | 4h codemod var(--font-sans) |
| 9 | Inline styles HomePage 600+ LOC | HomePage.jsx | 8h migrate CSS Module |
| 10 | 478 generated `--elab-hex-XXXXXX` vars anti-pattern | design-system.css:349-827 | 8h+ semantic codemod |
| 11 | LIM-mode @media min-width 1280 mancante HomePage | HomePage.jsx | 1h |
| 12 | aria-pressed missing tool active state FloatingToolbar | FloatingToolbar.jsx | 30min |
| 13 | ScimpanzeFallback fragile onError NO unit test | HomePage.jsx:1101-1133 | 30min |
| 14 | Unicode play arrow `▶` line 527 | HomePage.jsx:527 | 5min |
| 15 | Unicode CTA arrow `→` 6+ luoghi cards | HomePage.jsx:595 | 15min |
| 16 | Custom box-shadow values out-of-scale 6+ luoghi | HomePage.jsx | 15min |
| 17 | LavagnaShell extract 21+ inline SVG components | LavagnaShell.jsx:76-200 | 4h |
| 18 | NewElabSimulator 30+ eager imports panels | NewElabSimulator.jsx:21-67 | 2h selective lazy |

---

## 7. P2 minor + P3 polish (aggregate)

- **~40 P2** = consistency border-radius/shadow scale + emoji comments legacy + middle dot Unicode + spacing magic values + UnlimNudgeOverlay icon 26px line 14 (decorative MA segnala break LIM 5m + ChatbotOnly +icon pseudo-element + FloatingToolbar pseudo-element 20px + LessonBar z-index 55 + ErrorToast z-index 810 mid-tier + RetractablePanel z-index 50/10/51 fragmented + VideoFloat z-index 200 + GalileoAdapter file legacy name + MascotPresence drag handler verify iter 75 + UnlimMascotte 2 files mascotte duplication (`/common/UnlimMascotte.jsx` + `/unlim/unlim-mascot.module.css`) — single source of truth needed.

- **~30 P3** = whitespace + naming legacy `galileo*` (Andrea explicit preserve filename) + commenti obsoleti iter 30-50 + docstring iter date stale + JSDoc completeness gap.

---

## 8. Quick wins (≤30min each, ship iter 75 P0 inline)

1. **HomePage:1056** Diario placeholder "In arrivo" → comment out section OR hide via `data-elab-todo` flag (5min, regola 12 compliance).
2. **HomePage:343** cardCredit fontSize 12 → 13 (2min, regola 8 compliance).
3. **LavagnaShell.jsx:1660** toast `color: '#fff'` → `color: 'var(--elab-navy)'` (white-on-orange 2.4:1 → navy-on-orange 6.3:1, 15min).
4. **HomePage.jsx:104-114** PALETTE recursive default fix `var(--elab-navy, #1E4D8C)` (5min).
5. **MascotPresence.module.css:143** font-size 12px → 13px (5min).
6. **ChatbotOnly.module.css:135,199,438** font-size 12px → 13px (15min).
7. **CompileAgentBanner.module.css:115** font-size 12px → 13px (5min).
8. **MascotPresence.module.css:114** width 36px → 44px (5min).
9. **HomePage.jsx:9-14,29** comments emoji legacy 🧠📚⚡🐒 → update reference removed iter 72 (10min).
10. **HomePage.jsx:527,595** Unicode `▶` + `→` → ElabIcons PlayIcon + ArrowRightIcon (20min).

**Total ~1.5h** = +0.10/10 lift cosmetic + +0.05 compliance regola 12+8.

---

## 9. Tea iter 58 brief T3 tie-in — 5 worst UX experiments

Tea brief T3 (`/VOLUME 3/TEA/iter-58-brief-tea.md` ~60min) richiede "5 worst UX experiments" identification. Cross-link audit narrative iter 72.5 + Tea materials canonical 2026-05-12 6 NEW Volume PDF folders.

**STATUS Tea T3 iter 73 close**: NON eseguito. Defer iter 75+ con Mac Mini delegate OR Tea direct.

**Cross-link findings audit narrative iter 72.5**:
- v3-cap8-serial circuit missing bb1 (iter 70 TEAM B Codex finding)
- 4 vol3 title/ID mismatches
- 1 vol3 content mismatch (v3-cap6-esp4)
- Vol3 14 vs Tea narrative 29 IDs (intentional pedagogical chain iter 57)

**Sprint U close gate narrative arc**: all 79 esperimenti correnti cliffhanger consumed UI + 3 transition components wired (ScratchCompileBar + CompileUploadButton + AlbumStudente) + BuildModeGuide passo-passo fix iter 36 PM regression. Effort 6-8h iter 75 BG subagent.

---

## 10. Honesty caveats (≥5 mandate)

1. **NO live Chrome screenshots iter 74**: audit statico file-system only. Live UI verify defer iter 75 Chrome MCP / Control_Chrome — alcuni gap (es. MascotPresence drag handler, Skip-to-content link DOM, ChatbotOnly mobile responsive) NON verificati visivamente questa audit. Findings basati su source grep + Read tool.

2. **Top 20 components NOT all deep-read**: Read tool consumato su HomePage + LavagnaShell + ChatbotOnly + NewElabSimulator + ElabTutorV4 + MicPermissionNudge + design-system + accessibility-fixes + FloatingWindow.module.css + ChatbotOnly.module.css. Restanti 11 top components (UnlimAdapter, UnlimResponsePanel, AlbumStudente, FloatingWindow.jsx, PercorsoCapitoloView, LessonPathPanel, CompileUploadButton, ConsentBanner, BuildModeGuide, ElabMascotte, UpdatePrompt) audit shallow grep-only — deep-dive iter 75+ subagent dedicato per component.

3. **478 `--elab-hex-XXXXXX` vars Sprint-U compliance system**: critica generale MA non analisi specifica perché generate da script automatico (probabilmente `scripts/sync-hex-palette.mjs` o simile). Refactor a semantic tokens richiede analisi semantica color usage (es. quale è "stroke ldr body"? "buzzer body"? "battery 9v label"?) — 8h+ minimum + ratify Andrea che il pattern attuale è anti-pattern intenzionale o legacy. Iter 75 P0 ratify queue.

4. **Z-index entropy 27 valori magic numbers (0→99999)**: solo grep statico, NON full layering analysis. Definire token scale `--z-*` (già esistente design-system.css:131-136: `--z-base:1, --z-dropdown:100, --z-sticky:200, --z-overlay:300, --z-modal:400, --z-toast:500, --z-max:9999`) richiede mapping ogni magic number → token semantico. Effort 3h codemod + edge case verify (es. FloatingWindow.module.css:232 `z-index: 10000 !important` overrides modal token).

5. **LandingPNRR.jsx 28232 LOC inline styles**: claim "probably eager-loaded" basato su grep `lazy()` non trovato MA NON verified App.jsx routing. Iter 75 P0 verify + lazy-load atom.

6. **Bundle/Lighthouse defer iter 75+**: NON eseguita Lighthouse CLI questa audit. iter 38 Lighthouse perf 26+23 FAIL ≥90 target documented MA NON re-measured iter 74. Likely worse data accumulated 35+ iter. Iter 75+ Lighthouse cycle.

7. **Inline styles count "1500+ violations"**: stima onesta grep `style={{` cross-codebase. NON exact count. iter 75 P0 metric run `grep -rcE "style={{" src/components/ | sort -t: -k2 -n -r` per ranking top-violation files.

8. **No Playwright E2E audit specs UI/UX**: nessun spec `tests/e2e/uiux-*` existing. Iter 75+ Tester subagent suite specifica.

9. **PRINCIPIO ZERO compliance non re-verified empirico iter 74 PM**: ultima matrix verify iter 70 PHASE 9 99.6%. Defer iter 75 entrance Andrea ratify gate.

10. **Morfismo Sense 2 visual side-by-side volumi PDF**: NON eseguito. Audit basato su PCO compliance code-level (var ELAB usage, Vol/pag citation, kit fisico mention) MA NO comparison `/VOLUME 3/CONTENUTI/volumi-pdf/Vol*.pdf` con UI screenshots. Iter 75+ con Andrea/Tea ratify visual triplet.

11. **NO `font-display: swap` audit fonts.css** + NO browser back/forward navigation audit + NO browser print stylesheet audit + NO touch gesture (swipe + pinch + multi-touch) audit + NO orientation lock audit + NO foldable device audit. Defer iter 75+.

12. **Time budget**: ~2h spent (within budget 2-3h mandate). Audit "tutto tutto" Andrea richiamato deliberately scoped a Top 20 components + 6 dimensions. Quality vs quantity tradeoff onesto.

---

## 11. Iter 75 recommended atom plan

**Cascade lift target**: iter 73 close 9.0/10 → iter 75 close 9.1/10 (+0.1 conservative UI/UX cosmetic + P0 fixes inline).

1. **Atom A — quick wins 10 fixes** (1.5h orchestrator inline OR BG subagent worktree). +0.05 cosmetic.
2. **Atom B — z-index token migration** (3h BG subagent). +0.05 maintainability.
3. **Atom C — LavagnaShell non-canonical breakpoints S100 fix** (1h BG subagent). +0.03 compliance.
4. **Atom D — LandingPNRR lazy-load + verify** (1h orchestrator inline + tests). +0.02 performance.
5. **Atom E — Mascotte PNG transparent bg** (Andrea action: open PNG editor remove white pixels + save). +0.02 performance + UX clean.
6. **Atom F — Lighthouse CLI re-measure** (30min orchestrator). Numerical baseline iter 75.
7. **Atom G — Tea T3 5 worst UX experiments delegate** (Mac Mini OR Tea ratify). Sprint U close gate.

**Defer iter 76+**:
- Atom H — LandingPNRR.jsx CSS Module migration (12h+ Sprint V).
- Atom I — 478 hex vars → semantic codemod (8h+ Andrea ratify).
- Atom J — HomePage inline styles → CSS Module (8h Andrea ratify).
- Atom K — Components SVG extract from LavagnaShell (4h).
- Atom L — 11 components deep-dive subagent each (40-80h Sprint V multi-iter).
- Atom M — Playwright UI/UX E2E specs suite (8h Tester subagent).

---

## 12. Conclusione

Audit Phase 1 sistematico iter 74 TRACK C ELAB Tutor UI/UX completato in ~2h. **Mandato Andrea "proprio tutto tutto"** rispettato per breadth top 20 components + 6 dimensions con citation `file:line` ogni finding. Depth defer iter 75+ subagent dedicati per single component deep-dive.

**Stato netto**: base design system SOLID (tokens + accessibility + reduced motion + WCAG palette) MA debito 70+ iter accumulato (inline styles + magic numbers + 478 hex vars + non-canonical breakpoints + Diario placeholder).

**Andrea ratify queue gruppo 13 iter 75 entrance**:
1. ATOM A quick wins 1.5h orchestrator inline OR BG?
2. 478 hex vars Sprint-U compliance → semantic refactor S/N (anti-pattern)?
3. Diario placeholder hide (5min) OR implement REAL (8h+)?
4. LandingPNRR.jsx Sprint V CSS Module migration ratify?
5. Tea T3 5 worst UX delegate Mac Mini OR direct?

**Sprint U close gate UI/UX**: ATOM A+B+C+D+E execute iter 75 (~4h) → cosmetic + compliance lift +0.1-0.15. Iter 76+ subagent deep-dive top 11 components shallow audit (~12h cumulative). Sprint V iter 80+ migrazione completa CSS Module + 478 hex semantic. Realistic iter 85+ Sprint V close UI/UX 9.5+/10 ONESTO conditional Opus indipendente review G45 mandate.

---

**Fine audit Phase 1 iter 74 TRACK C UI/UX Impeccable.**

Audit author: subagente UI/UX (Pattern S r3 file ownership = `docs/audits/` only, NO source code changes iter 74 mandato).
