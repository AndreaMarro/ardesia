# SESSION 82 — QUALITY FIX (368 Font + 47 Touch + 4 WCAG)

---

## TASK
I want to **fix every measurable quality violation found in the S81 audit** so that ELAB Tutor passes a re-audit with 11/11 PASS on the score card. The audit found **368 font-size violations, 47 touch-target violations, and 4 WCAG contrast failures**. This is not an aesthetic redesign — it's a systematic, mechanical search-and-replace operation guided by exact numbers.

---

## CONTEXT FILES
First, read these files completely before responding:

- `.team-status/QUALITY-AUDIT-S81.md` — The audit report with exact violation counts, file names, line numbers, and recommended fixes (174 lines)
- `src/styles/design-system.css` — CSS tokens, palette, spacing scale — the source of truth for colors and typography
- `src/components/simulator/ElabSimulator.css` — 2 CSS font violations (lines 118, 159) + 2 touch violations
- `src/components/tutor/ChatOverlay.jsx` — 9 touch violations + 8 font violations (heaviest tutor offender)
- `src/components/tutor/ElabTutorV4.css` — 7 touch violations
- `src/components/VetrinaSimulatore.jsx` — 15+ font violations (heaviest JSX offender)
- `src/components/social/Navbar.jsx` — 8+ font violations (11px, 12px labels)
- `src/components/simulator/panels/CodeEditorCM6.jsx` — 6+ font violations
- `src/components/simulator/panels/ComponentDrawer.jsx` — 6+ font violations
- `src/components/simulator/panels/ComponentPalette.jsx` — 5+ font violations
- `src/components/tutor/TutorTools.css` — 3 touch violations
- `src/components/tutor/tutor-responsive.css` — 3 touch violations

---

## REFERENCE
Here is what I want to achieve:

**Apple Human Interface Guidelines + WCAG 2.1 AA compliance** — every interactive element hittable, every text readable, every color combination sufficient contrast.

Here's what makes this reference work (rules extracted):

- Always use font-size >= 14px for UI text — the only exceptions are PDF rendering (`SessionReportPDF.jsx`, `ReportService.jsx`) and SVG annotations (`Annotation.jsx`)
- Always use min-height >= 44px and min-width >= 44px for interactive elements (buttons, links, inputs, sliders)
- Always maintain WCAG AA contrast ratio >= 4.5:1 for normal text and >= 3:1 for large text (18px bold or 24px regular)
- Always use CSS custom properties from `design-system.css` instead of hardcoded color values
- Always fix the actual inline style or CSS rule — do NOT add overrides on top of violations
- Never change the visual identity — same colors, same layout, same feel. Only adjust specific values to pass thresholds
- Never touch files that are legitimate exceptions: `SessionReportPDF.jsx` (21 — PDF 72dpi), `ReportService.jsx` (9 — PDF), `Annotation.jsx` (1 — SVG label)
- Never change `ScratchEditor.jsx` Blockly theme font (11px is Blockly's internal rendering, not UI text)
- Never introduce new CSS files — fix violations in their existing locations
- Never batch all font-size changes to one value — use the closest sensible step (10px→14px, 11px→14px, 12px→14px, 13px→14px)

---

## SUCCESS BRIEF

**Type of output + length:**
Mechanical edits across ~30 files. Each edit is a font-size, min-height, or color value change. No new components, no layout changes, no architectural decisions. Pure remediation.

**Recipient's reaction:**
"Il simulatore ha lo stesso aspetto di prima, ma ora i testi si leggono bene, i bottoni si toccano su iPad, e i colori hanno contrasto sufficiente. Nessuna regressione."

**Does NOT sound like:**
- A redesign that changes how things look ("I modernized the UI")
- A half-fix that patches 50% of violations ("I fixed the worst ones")
- An override layer (`!important` everywhere)
- A theoretical analysis without actual code changes

**Success means:**
Re-running the same audit checks from S81 and getting:
```
| Metrica                    | S81   | S82   | Status |
|----------------------------|-------|-------|--------|
| Font < 14px (real)         | 368   | 0     | PASS   |
| Touch targets < 44px       | 47    | 0     | PASS   |
| WCAG contrast              | 4/8   | 8/8   | PASS   |
| console.log (non-error)    | ~5    | 0     | PASS   |
| Build errors               | 0     | 0     | PASS   |
| 69/69 experiments working  | yes   | yes   | PASS   |
```

---

## RULES

My context file (MEMORY.md) contains my standards, constraints, and landmines. Read it fully before starting. Key rules:

1. **CRITICAL**: `0 build errors, 0 regressions` — 69 experiments MUST all still work after every font/touch/color change
2. **CRITICAL**: All projects under `PRODOTTO/` subfolder — Netlify folder is `PRODOTTO/newcartella` NOT `elab-website`
3. **CRITICAL**: All env var URL reads MUST use `.trim()` — Vercel env vars can contain trailing `\n`
4. **Palette**: Navy `#1E4D8C`, Lime `#7CB342`, Vol1 `#7CB342`, Vol2 `#E8941C`, Vol3 `#E54B3D`
5. **Fonts**: Tutor uses Oswald + Open Sans + Fira Code
6. **Force-light theme**: static `data-theme="light"` on `<html>` tag
7. **Build mode selettore UNICO** (S32): solo la barra grande in `NewElabSimulator.jsx`
8. **Deploy**: Vercel (`npm run build && npx vercel --prod --yes`), `.vercelignore` excludes 2.3GB GGUF

If you're about to break one of my rules, stop and tell me.

---

## CONVERSATION

DO NOT start executing yet. Instead, ask me clarifying questions (use 'AskUserQuestion' tool) so we can refine the approach together step by step.

Before you write anything, list the **3 rules from my context file that matter most for this task**.

---

## EXECUTION PLAN (5 steps maximum)

Then give me your execution plan. Only begin work once we've aligned.

### FASE 0 — WCAG Contrast Fix (4 failures → 0)
Fix the 4 failing color combinations. These are the highest-impact changes with the fewest edits:
- **Lime buttons**: Change white text on `#7CB342` → dark text (Navy `#1E4D8C` or `#1A2B4A`) wherever Lime is used as background for text
- **Vol2 Orange badges**: Change white text on `#E8941C` → dark text, OR darken orange to `#B5700A`
- **Vol3 Red badges**: Darken red `#E54B3D` → `#C22E20` for normal-text contexts (large-text already passes at 3.88:1)
- **Text Muted**: Darken `#8899AA` → `#6B7A8D` in design-system.css `--color-text-muted` (or equivalent variable)

Verify: re-calculate all 8 contrast ratios. Target 8/8 PASS.

### FASE 1 — Font Size Fix (368 violations → 0)
Systematic file-by-file remediation. Process files in order of violation count:
1. **Admin gestionale modules** (~50 violations across 14 files) — bulk find `fontSize: 10`, `fontSize: 11`, `fontSize: 12`, `fontSize: 13` → minimum `14`
2. **VetrinaSimulatore.jsx** (15+) — inline styles
3. **AdminPage.jsx + TeacherDashboard.jsx** (10+ each) — inline styles
4. **Navbar.jsx** (8+) — 11px/12px labels
5. **ChatOverlay.jsx** (8+) — input labels, timestamps
6. **CodeEditorCM6.jsx + ComponentDrawer.jsx + ComponentPalette.jsx** (5-6 each)
7. **ElabSimulator.css** (2 CSS rules: line 118 `10px`→`14px`, line 159 `13px`→`14px`)
8. **Remaining files** — scan and fix any stragglers
9. **Watermark.jsx** (11px) — this is decorative/legal text, ASK USER if exempt or must fix

Skip: `SessionReportPDF.jsx` (21), `ReportService.jsx` (9), `Annotation.jsx` (1) — legitimate PDF/SVG exceptions.

Verify: re-run `grep -rn "fontSize.*\(1[0-3]\|[0-9]\)[^0-9]"` and `font-size: (10|11|12|13)px` → 0 real violations.

### FASE 2 — Touch Target Fix (47 violations → 0)
Fix every interactive element with height/minHeight < 44px:
1. **ChatOverlay.jsx** (9) — input field height, send button, attachment buttons
2. **ElabTutorV4.css** (7) — chat UI interactive elements
3. **WhiteboardOverlay.jsx** (4) — toolbar buttons
4. **TutorTools.css + tutor-responsive.css** (6) — tool buttons
5. **ElabSimulator.css** (2) — simulator controls
6. **Admin files** (~12) — table action buttons, form inputs
7. **ErrorBoundary, ConsentBanner, Navbar** (4) — misc interactive elements

Rule: only change `height`/`min-height` on elements that are interactive (buttons, inputs, links, clickable). Non-interactive containers can stay as-is.

Verify: re-run height/minHeight audit → 0 interactive elements under 44px.

### FASE 3 — Console Cleanup + Build Verification
1. Remove `console.log` statements from `ElabTutorV4.jsx` (keep `console.error` and `console.warn`)
2. Keep legitimate uses: `AuthContext.jsx` (DEV-gated), `logger.js` (utility), `gdprService.js` (privacy warnings), `CircuitSolver.js` (error path), `ScratchEditor.jsx` (error catch)
3. `npm run build` → verify 0 errors
4. Spot-check: open dev server, load 3 experiments (1 per volume), verify no visual regression

### FASE 4 — Re-Audit + Deploy
1. Re-run ALL audit checks from the quality-audit skill (same grep/search commands)
2. Produce updated score card in `.team-status/QUALITY-AUDIT-S82.md`
3. Target: 11/11 PASS
4. `npm run build && npx vercel --prod --yes`
5. Update MEMORY.md scores

---

## ALIGNMENT

**Verify these 3 most-important rules before starting:**
1. `0 build errors, 0 regressions` — after 368 font edits + 47 touch edits + 4 color edits, the build must be clean and all 69 experiments must work
2. `Palette integrity` — the 4 WCAG fixes must NOT change the ELAB brand identity. Lime stays lime, orange stays orange. We adjust text color ON those backgrounds, or darken slightly within the same hue family
3. `Legitimate exceptions preserved` — SessionReportPDF (21), ReportService (9), Annotation (1) = 31 font occurrences that are NOT violations

**Metrics for "done":**
- [ ] Font < 14px: 368 → 0 (excluding 31 legitimate exceptions)
- [ ] Touch < 44px: 47 → 0 (interactive elements only)
- [ ] WCAG contrast: 4/8 → 8/8 PASS
- [ ] console.log cleanup: ~5 non-error → 0
- [ ] Build: 0 errors
- [ ] 69/69 experiments: no regressions
- [ ] Score card: `.team-status/QUALITY-AUDIT-S82.md` with 11/11 PASS
- [ ] Deploy: Vercel production

---

*Prompt generated from QUALITY-AUDIT-S81.md data — Andrea Marro, 07/03/2026*
*Structure: The Anatomy of a Claude Prompt (Task → Context Files → Reference → Success Brief → Rules → Conversation → Plan → Alignment)*
