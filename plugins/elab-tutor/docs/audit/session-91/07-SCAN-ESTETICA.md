# 07 — Aesthetic Scan
**Data**: 2026-03-08 | **Stato**: DONE | **Bug Count**: 3

## Bugs Found

| # | Sev | Area | Descrizione | Repro | Expected | Actual | Screenshot |
|---|-----|------|-------------|-------|----------|--------|------------|
| E1 | P3 | Font/WCAG | `.overflow-separator` font-size is 0.65rem (~10.4px), violates 14px WCAG minimum | Open toolbar overflow menu | ≥14px on all readable text | 10.4px on menu section labels | CSS audit |
| E2 | P3 | Font/WCAG | Watermark font-size is 10px, below WCAG minimum | View simulator watermark | ≥12px minimum even for decorative | 10px hardcoded in ElabSimulator.css:118 | CSS audit |
| E3 | P3 | UX/Touch | Range slider track is 12px height vs 44px thumb — visual/touch mismatch | Drag potentiometer slider | Track visible under thumb, consistent touch target | 12px track makes it hard for children to hit on touch devices | CSS audit |

## Aesthetic Observations (Not Bugs)

### Positive
- Toolbar well-organized: 11 buttons after S87 cleanup (was 14)
- Blockly dark theme matches overall dark simulator aesthetic
- Code editor syntax highlighting is clear (green comments, blue keywords, white text)
- "Compila & Carica" button prominently green and well-positioned
- Font sizes on toolbar buttons are ≥14px (WCAG compliant)
- Pin tooltips at 14px (fixed in S76)
- Separator lines are subtle (1px, light color)
- Build mode selector is clear with orange active state
- Experiment title visible in top-right with difficulty stars

### Concerns (Not Bugs but Worth Noting)
- "PASSO" panel header is ALL CAPS bold — may be jarring for young children
- "MONTARE!" instruction text is ALL CAPS with exclamation — aggressive tone
- Left sidebar panel resize handle barely visible
- Timer "00:00" at far right feels detached from main interface
- "Già Montato" persistent checkmark (bug S5) creates visual confusion
- "Libero" mode uses red/danger color (bug S6) — inconsistent with brand palette
- Blockly toolbox category names could use icons for young learners
- Serial Monitor "Invia" button is lime green but positioned far from chat input — could be confused with Galileo send

### Color Palette Compliance

| Element | Color Used | Expected (Design System) | Status |
|---------|-----------|-------------------------|--------|
| Toolbar bg | Dark navy | var(--color-primary) | ✅ |
| GALILEO button | Red/coral | var(--color-vol3) or accent | ⚠️ Red reads as "danger" |
| Passo Passo active | Orange | Vol2 color | ✅ |
| Blocchi tab active | Green | var(--color-accent) | ✅ |
| Compila button | Green | var(--color-accent) | ✅ |
| Code editor bg | Dark blue | var(--color-code-bg) | ✅ |
| Blockly workspace | Dark gray-blue | var(--color-blockly-bg) | ✅ |
| Left sidebar | Dark navy | Consistent | ✅ |

### Overall Aesthetic Score: 6.5/10
Functional and professional, but several WCAG font violations, some aggressive UX language for children, and the GALILEO button red color creates "danger" association instead of "helpful AI assistant" feeling.
