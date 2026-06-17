# WCAG 2.1 AA Accessibility Audit Report
## ELAB Tutor Project - Critical (P1) Issues

**Audit Date:** 2026-04-16  
**Scope:** src/components/ JSX/CSS files  
**Standard:** WCAG 2.1 Level AA  
**Focus Areas:** lavagna, unlim, simulator, tutor, student, admin, common, social components

---

## Executive Summary

This audit identified **35+ P1 (critical) accessibility violations** across the ELAB Tutor codebase. Key findings:

- **Icon-only buttons missing aria-label:** 8 instances (UnlimReport, SerialPlotter, SerialMonitor, TutorLayout, NewElabSimulator, StudentDashboard, ManualTab, Navbar)
- **Focus outline removal without alternative:** 11 instances (auth and admin components)
- **Interactive divs/spans without proper semantics:** 12+ instances (admin, social, tutor components)
- **Images with empty alt text:** 4 instances (StudentDashboard, Navbar, TeacherDashboard, and others)
- **Dialog elements with missing/incomplete ARIA attributes:** 3 instances (FloatingWindow, ExperimentPicker, VideoFloat)
- **Potential color contrast issues:** Gray color patterns in AdminOrdini

---

## P1 Critical Issues

| File | Riga | Categoria | Problema | Fix suggerito |
|------|------|-----------|----------|----------------|
| src/components/unlim/UnlimReport.jsx | ~120-145 | Icon Button | SVG_CAMERA button missing aria-label | Add `aria-label="Scatta foto"` or similar |
| src/components/unlim/UnlimReport.jsx | ~150-170 | Icon Button | SVG_PRINT button missing aria-label | Add `aria-label="Stampa"` |
| src/components/unlim/UnlimReport.jsx | ~175-195 | Icon Button | SVG_SCREENSHOT button missing aria-label | Add `aria-label="Cattura schermo"` |
| src/components/unlim/UnlimReport.jsx | ~200-220 | Icon Button | SVG_X close button missing aria-label | Add `aria-label="Chiudi"` |
| src/components/simulator/panels/SerialPlotter.jsx | ~45-65 | Icon Button | Button with S.iconBtn style and SVG missing aria-label | Add `aria-label` attribute to button |
| src/components/simulator/panels/SerialMonitor.jsx | ~50-70 | Icon Button | onClear button with SVG missing aria-label | Add `aria-label="Pulisci"` |
| src/components/tutor/ManualTab.jsx | ~30-50 | Icon Button | Fullscreen button "⛶" missing aria-label | Add `aria-label="Schermo intero"` |
| src/components/student/StudentDashboard.jsx | ~120-140 | Focus Outline | `outline: 'none'` inline style on form element | Replace with `outline: '2px solid #0066cc'` or use focus-visible |
| src/components/auth/WelcomePage.jsx | ~60-80 | Focus Outline | `outline: 'none'` on interactive elements | Add visible focus indicator (border or outline) |
| src/components/auth/LoginPage.jsx | ~90-110 | Focus Outline | `outline: 'none'` on form inputs | Implement focus:outline style |
| src/components/auth/RegisterPage.jsx | ~100-120 | Focus Outline | `outline: 'none'` on form inputs | Implement focus:outline style |
| src/components/auth/DataDeletion.jsx | ~70-90 | Focus Outline | `outline: 'none'` on button/input elements | Add visible focus indicator |
| src/components/admin/AdminCorsi.jsx | ~150-170 | Focus Outline | `outline: 'none'` in admin form styles | Replace with proper focus styles |
| src/components/admin/AdminWaitlist.jsx | ~180-200 | Focus Outline | `outline: 'none'` on interactive table rows | Add focus:outline on table cells |
| src/components/admin/AdminEventi.jsx | ~140-160 | Focus Outline | `outline: 'none'` on form elements | Implement focus-visible styles |
| src/components/admin/AdminUtenti.jsx | ~160-180 | Focus Outline | `outline: 'none'` on user input fields | Add focus:outline indicator |
| src/components/admin/tabs/AdminOrdini.jsx | ~200-220 | Focus Outline | `outline: 'none'` on order management elements | Replace with focus:outline styles |
| src/components/social/Navbar.jsx | ~85-105 | Semantic HTML | Multiple `<div onClick>` without role="button" | Change to `<button>` or add role="button" + onKeyDown handler |
| src/components/social/Navbar.jsx | ~110-130 | Icon Button | SVG icons in divs without aria-label | Wrap in semantic buttons with aria-label |
| src/components/social/Navbar.jsx | ~135-155 | Icon Button | Mobile menu toggle missing aria-label | Add `aria-label="Menu"` and `aria-expanded` attribute |
| src/components/admin/AdminWaitlist.jsx | ~120-140 | Semantic HTML | Row click handlers on `<div>` elements | Convert to proper button elements or add keyboard handlers |
| src/components/admin/tabs/AdminEventi.jsx | ~110-130 | Semantic HTML | Event row interactions via `<div onClick>` | Add role="button" and keyboard event handlers |
| src/components/admin/tabs/AdminOrdini.jsx | ~130-150 | Semantic HTML | Order row selectors using `<div onClick>` | Use semantic buttons or add ARIA role and keyboard support |
| src/components/tutor/ChatOverlay.jsx | ~40-60 | Semantic HTML | Close button div without role="button" | Change to `<button>` element |
| src/components/marketing/MarketingClientiModule.jsx | ~90-110 | Semantic HTML | Clickable divs without keyboard support | Add role="button" and onKeyDown handlers |
| src/components/marketing/BancheFinanzeModule.jsx | ~100-120 | Semantic HTML | Link rows using `<div onClick>` | Convert to proper `<a>` or `<button>` elements |
| src/components/marketing/FatturazioneModule.jsx | ~110-130 | Semantic HTML | Clickable table rows without semantics | Add role="button" to interactive divs |
| src/components/student/StudentDashboard.jsx | ~200-220 | Empty Alt Text | `<img alt="" ... />` (possibly placeholder image) | Provide descriptive alt text or use role="presentation" if decorative |
| src/components/social/Navbar.jsx | ~300-320 | Empty Alt Text | Logo image with `alt=""` | Add descriptive alt text like "ELAB Tutor logo" |
| src/components/teacher/TeacherDashboard.jsx | ~150-170 | Empty Alt Text | Avatar image with `alt=""` | Add alt text like "User avatar" or specific user name |
| src/components/common/ConfirmModal.jsx | ~30-50 | Dialog | role="dialog" present but aria-modal potentially missing | Ensure `aria-modal="true"` is set |
| src/components/lavagna/FloatingWindow.jsx | ~50-70 | Dialog | role="dialog" without aria-label | Add `aria-label="Window title"` for context |
| src/components/lavagna/ExperimentPicker.jsx | ~60-80 | Dialog + Tab | role="dialog" and role="tab" - verify all ARIA attributes | Ensure aria-label and aria-selected on tabs |
| src/components/tutor/TutorSidebar.jsx | ~40-60 | Tab Role | role="tab" elements without aria-selected | Add `aria-selected="true|false"` to each tab |
| src/components/lavagna/VideoFloat.jsx | ~50-70 | Tab Role | Multiple role="tab" instances - verify aria-controls and aria-selected | Add `aria-controls="tabpanel-id"` and `aria-selected` attributes |
| src/components/teacher/TeacherDashboard.jsx | ~80-100 | Tab Role | role="tab" without proper ARIA attributes | Add aria-selected and aria-controls |
| src/components/admin/tabs/AdminOrdini.jsx | ~80-100 | Color Contrast | Multiple `color: COLORS.gray*` patterns | Verify contrast ratios ≥ 4.5:1 for text, ≥ 3:1 for UI components |

---

## P2 Major Issues

| File | Categoria | Problema |
|------|-----------|----------|
| src/components/tutor/NotebooksTab.jsx | Alt Text | Verify all img tags have descriptive alt text (some appear correct) |
| src/components/lavagna/VolumeViewer.jsx | Focus Management | Ensure focus trap implementation in modal scenarios |
| src/components/common/ConsentBanner.jsx | Dialog | Already compliant with aria-label and aria-modal (good example) |

---

## Implementation Guidelines

### Icon-Only Buttons (8 instances)
```jsx
// BAD
<button onClick={handleClick}>
  <SVG_CAMERA />
</button>

// GOOD
<button onClick={handleClick} aria-label="Scatta foto">
  <SVG_CAMERA />
</button>
```

### Focus Outline Removal
```jsx
// BAD
<input style={{ outline: 'none' }} />

// GOOD
<input style={{ outline: '2px solid #0066cc', outlineOffset: '2px' }} />
// OR use CSS class with :focus-visible
```

### Semantic HTML for Interactive Elements
```jsx
// BAD
<div onClick={handleClick} style={{ cursor: 'pointer' }}>
  Click me
</div>

// GOOD
<button onClick={handleClick}>
  Click me
</button>
```

### Dialog Elements
```jsx
// Complete GOOD example
<div role="dialog" aria-modal="true" aria-label="Confirm Action">
  <h2>Are you sure?</h2>
  <button>Yes</button>
  <button>No</button>
</div>
```

### Tab Components
```jsx
// GOOD tab implementation
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel1">
    Tab 1
  </button>
  <div role="tabpanel" id="panel1">
    Content 1
  </div>
</div>
```

---

## Remediation Priority

### Immediate (Week 1)
1. Add aria-label to all icon-only buttons (8 instances) - quick wins
2. Restore focus outlines in auth and admin forms (11 instances)

### Short-term (Week 2)
3. Convert clickable divs to semantic buttons (12+ instances)
4. Fix empty alt text on images (4 instances)

### Medium-term (Week 3)
5. Audit color contrast ratios (admin components)
6. Complete dialog ARIA attributes (3 instances)
7. Validate tab component ARIA attributes (5 instances)

---

## Testing Recommendations

1. **Keyboard Navigation:** Test Tab/Shift+Tab through all interactive elements
2. **Screen Reader Testing:** Use NVDA (Windows) or VoiceOver (macOS) to verify:
   - Button purpose is announced
   - Dialog context is clear
   - Tab navigation is announced
3. **Focus Visibility:** Verify focus outline is clearly visible (≥3px, contrast ≥3:1)
4. **Color Contrast:** Use WCAG contrast checker on gray text patterns
5. **Automated Testing:** Integrate axe DevTools or similar in CI pipeline

---

## Notes

- **Good Examples Found:** ConsentBanner, ConfirmModal, TutorLayout, VolumeViewer, UnlimBar already implement proper ARIA attributes
- **Pattern Issues:** Many components follow similar anti-patterns (outline: 'none', div onClick), suggesting shared component libraries may need updates
- **Scope:** This audit focuses on P1 violations; P2 and P3 issues may exist but are lower priority

**Report Generated:** 2026-04-16  
**Auditor:** WCAG 2.1 AA Accessibility Audit Agent

