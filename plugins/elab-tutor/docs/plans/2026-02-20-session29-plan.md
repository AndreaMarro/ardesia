# Session 29 — Ristrutturazione ELAB Tutor — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove onboarding wizard/overlay, replace fonts to match physical ELAB books, remove progress bars, add book-matching aesthetics.

**Architecture:** Surgical refactor of existing files. 4 phases executed sequentially, each ending with build + deploy. No new React components created (deferred to Session 30).

**Tech Stack:** React 18, Vite, CSS custom properties, Google Fonts (Bebas Neue + Roboto), Vercel deploy.

---

## Task 1: Remove OnboardingWizard from ElabTutorV4.jsx

**Files:**
- Modify: `src/components/tutor/ElabTutorV4.jsx:25,124-125,143-150,165-229,265-279,391-420,1304-1307`

**Step 1: Remove the import (line 25)**

Replace:
```javascript
import OnboardingWizard from './OnboardingWizard';
```
with nothing (delete the line).

**Step 2: Remove onboarding state (lines 123-125)**

Delete these 3 lines:
```javascript
    // Onboarding State
    const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('elab_onboarding_done'));
    const [userType, setUserType] = useState(() => localStorage.getItem('elab_user_type') || null);
```

**Step 3: Remove the completeOnboarding callback (lines 389-420)**

Delete the entire block from `// ===================== ONBOARDING =====================` through `}, []);` after the `if (choice === 'docente')` block.

**Step 4: Remove the render (lines 1304-1307)**

Delete:
```jsx
            {/* Onboarding Wizard */}
            {showOnboarding && (
                <OnboardingWizard onComplete={completeOnboarding} />
            )}
```

**Step 5: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -20`
Expected: Build succeeds (0 errors). May have warnings about unused vars — fix in next step.

---

## Task 2: Remove OnboardingOverlay from 7 consumer files

**Files:**
- Modify: `src/components/tutor/ChatOverlay.jsx:9,724`
- Modify: `src/components/simulator/NewElabSimulator.jsx:44,2677`
- Modify: `src/components/simulator/panels/WhiteboardOverlay.jsx:9,558`
- Modify: `src/components/teacher/TeacherDashboard.jsx:13,393`
- Modify: `src/components/admin/AdminPage.jsx:11,314,411,443`
- Modify: `src/components/admin/gestionale/GestionalePage.jsx:13,194,354`
- Modify: `src/components/VetrinaSimulatore.jsx:9,567`

**Step 1: For each file, remove the import line and all JSX usage**

In each file:
1. Delete the `import OnboardingOverlay from ...` line
2. Delete all `<OnboardingOverlay ... />` JSX elements

**Step 2: In AdminPage.jsx and AdminDashboard.jsx, remove `data-onboarding` attributes**

Search for `data-onboarding=` in:
- `src/components/admin/AdminPage.jsx` (lines 314, 411)
- `src/components/admin/tabs/AdminDashboard.jsx` (lines 797, 841, 871, 904)

Remove the `data-onboarding="..."` attribute from each element (keep the element, just remove the attribute).

**Step 3: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -20`
Expected: 0 errors

---

## Task 3: Delete OnboardingWizard.jsx and onboarding/ directory

**Files:**
- Delete: `src/components/tutor/OnboardingWizard.jsx`
- Delete: `src/components/onboarding/OnboardingOverlay.jsx`
- Delete: `src/components/onboarding/` (entire directory)

**Step 1: Delete files**

```bash
rm "src/components/tutor/OnboardingWizard.jsx"
rm -rf "src/components/onboarding/"
```

**Step 2: Remove onboarding CSS from ElabTutorV4.css (lines 2082-2250)**

Delete the entire section from:
```css
/* ═══════════════════════════════════════════════════════════════ */
/* ONBOARDING WIZARD                                               */
```
through the closing `}` of the `@media (max-width: 600px)` block (line 2250).

**Step 3: Verify no remaining references**

Run: `grep -r "onboarding\|OnboardingWizard\|OnboardingOverlay\|elab_onboarding" src/`
Expected: 0 results (except possibly comments, which are OK to remove)

**Step 4: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -20`
Expected: 0 errors

**Step 5: Deploy Phase 1**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vercel --prod --yes`

---

## Task 4: Replace Google Fonts in index.html

**Files:**
- Modify: `index.html:15-17`

**Step 1: Replace the fonts link**

Replace:
```html
  <link
    href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Oswald:wght@200..700&display=swap"
    rel="stylesheet">
```

With:
```html
  <link
    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&family=Fira+Code:wght@400;500&display=swap"
    rel="stylesheet">
```

**Step 2: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -20`
Expected: 0 errors (fonts are just CSS, no build impact)

---

## Task 5: Update CSS variables in design-system.css

**Files:**
- Modify: `src/styles/design-system.css:48-51`

**Step 1: Replace font variables**

Replace:
```css
  --font-sans: 'Inter', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
with:
```css
  --font-sans: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Replace:
```css
  --font-heading: 'Inter', 'Oswald', -apple-system, sans-serif;
  --font-display: 'Oswald', 'Arial Narrow', Arial, sans-serif;
```
with:
```css
  --font-heading: 'Bebas Neue', 'Oswald', -apple-system, sans-serif;
  --font-display: 'Bebas Neue', 'Oswald', 'Arial Narrow', Arial, sans-serif;
```

Replace:
```css
  --font-mono: 'Fira Code', 'SF Mono', 'Consolas', monospace;
```
with:
```css
  --font-mono: 'Fira Code', 'SF Mono', 'Consolas', 'Courier New', monospace;
```

---

## Task 6: Replace hardcoded Open Sans in simulator CSS files

**Files:**
- Modify: `src/components/simulator/layout.module.css` (4 occurrences: lines 37, 72, 121, 142)
- Modify: `src/components/simulator/codeEditor.module.css` (2 occurrences: lines 30, 79)
- Modify: `src/components/simulator/overlays.module.css` (2 occurrences: lines 26, 155)
- Modify: `src/components/simulator/ElabSimulator.css` (3 occurrences: lines 17, 117, 223 + 2 var-based: 261, 316)

**Step 1: In each file, replace all `'Open Sans'` with `'Roboto'`**

Use find-and-replace: `'Open Sans'` → `'Roboto'`

NOTE: Do NOT touch `src/services/emailService.js` — those are HTML email templates, not the tutor UI.

**Step 2: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -20`

**Step 3: Verify no remaining Open Sans in tutor**

Run: `grep -r "Open Sans" src/components/ src/styles/`
Expected: 0 results (emailService.js is in src/services/ — that's OK)

**Step 4: Deploy Phase 2**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vercel --prod --yes`

---

## Task 7: Remove progress tracking from ElabTutorV4.jsx

**Files:**
- Modify: `src/components/tutor/ElabTutorV4.jsx`

**Step 1: Remove progressStats state (lines 143-150)**

Delete:
```javascript
    // Progressi ELAB Widget
    const [progressStats, setProgressStats] = useState({
        total: TOTAL_EXPERIMENTS,
        completed: 0,
        percentage: 0,
        hasData: false,
        source: 'fallback'
    });
```

**Step 2: Remove refreshProgressStats callback (lines 165-229)**

Delete the entire `const refreshProgressStats = useCallback(...)` block.

**Step 3: Remove polling useEffect (lines 265-279)**

Delete:
```javascript
    useEffect(() => {
        refreshProgressStats();

        const handleRefresh = () => refreshProgressStats();
        const intervalId = window.setInterval(handleRefresh, 15000);

        window.addEventListener('focus', handleRefresh);
        document.addEventListener('visibilitychange', handleRefresh);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', handleRefresh);
            document.removeEventListener('visibilitychange', handleRefresh);
        };
    }, [refreshProgressStats]);
```

**Step 4: Remove progressStats prop from TutorLayout render (line 1151)**

In the `<TutorLayout>` render around line 1151, delete the `progressStats={progressStats}` prop.

**Step 5: Remove TOTAL_EXPERIMENTS constant and unused imports (lines 37-40)**

If `TOTAL_EXPERIMENTS`, `VOL1_COUNT`, `VOL2_COUNT`, `VOL3_COUNT` are only used by the removed onboarding welcome messages and progress tracking, remove:
```javascript
const TOTAL_EXPERIMENTS = getTotalExperiments();
const VOL1_COUNT = EXPERIMENTS_VOL1?.experiments?.length || 0;
const VOL2_COUNT = EXPERIMENTS_VOL2?.experiments?.length || 0;
const VOL3_COUNT = EXPERIMENTS_VOL3?.experiments?.length || 0;
```
And also remove `getTotalExperiments` from the import on line 12 if unused.

CAUTION: Check if these constants are used elsewhere in the file before removing. `EXPERIMENTS_VOL1/VOL2/VOL3` may still be needed.

**Step 6: Remove ProjectTimeline import (line 20) and its render**

Delete line 20:
```javascript
import ProjectTimeline from './ProjectTimeline';
```

And delete the corresponding render block:
```jsx
{activeTab === 'timeline' && (
    <ProjectTimeline ... />
)}
```

**Step 7: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -20`

---

## Task 8: Remove progress from TutorSidebar.jsx and TutorTopBar.jsx

**Files:**
- Modify: `src/components/tutor/TutorSidebar.jsx`
- Modify: `src/components/tutor/TutorTopBar.jsx`

**Step 1: TutorSidebar — Remove progressStats prop and progress card**

Remove `progressStats` from the function signature (line 43).
Delete the `progress` variable (line 45).
Delete the entire `sidebar-progress-card` section (lines 70-89).
Remove `{ id: 'timeline', icon: '📖', label: 'Progressi' }` from NAV_SECTIONS Personale items (line 32).

**Step 2: TutorTopBar — Remove progressStats prop and progress widget**

Remove `progressStats` from the function signature (line 19).
Delete the `progress` variable (line 23).
Delete the `topbar-progress-card` div (lines 60-65).

**Step 3: Remove progress CSS from tutor-responsive.css**

Delete all CSS rules matching `.sidebar-progress-*` and `.topbar-progress-*` from `src/components/tutor/tutor-responsive.css` (lines 176-200 for topbar, lines 294-354 for sidebar, and responsive overrides at lines 1065-1074 and 1148).

**Step 4: Consider deleting ProjectTimeline.jsx**

If `ProjectTimeline` is no longer imported anywhere:
```bash
grep -r "ProjectTimeline" src/
```
If 0 results, delete `src/components/tutor/ProjectTimeline.jsx`.

**Step 5: Verify build and deploy Phase 4**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -20`
Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vercel --prod --yes`

---

## Task 9: Add book-matching typography rules to CSS

**Files:**
- Modify: `src/components/tutor/ElabTutorV4.css`

**Step 1: Add global typography rules after the BASE LAYOUT section**

After the closing `}` of `.elab-v4` (around line 19), add:

```css
/* ═══════════════════════════════════════════════════════════════ */
/* TYPOGRAPHY — Matching ELAB physical books                       */
/* ═══════════════════════════════════════════════════════════════ */

.elab-v4 h1,
.elab-v4 h2,
.elab-v4 .vol-heading {
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
}

.elab-v4 h3,
.elab-v4 .vol-subheading {
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 400;
}

.elab-v4 .vol-body {
    font-family: var(--font-sans);
    font-weight: 400;
    line-height: 1.6;
}

.elab-v4 .vol-label {
    font-family: var(--font-sans);
    font-weight: 300;
}

.elab-v4 .vol-code {
    font-family: var(--font-mono);
}
```

---

## Task 10: Add volume-themed backgrounds to ExperimentPicker

**Files:**
- Modify: `src/components/simulator/panels/ExperimentPicker.jsx`

**Step 1: Add SVG pattern backgrounds per volume**

At the top of the file (after the existing constants), add circuit pattern SVGs:

```javascript
const VOL_PATTERN = {
  1: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5v10M30 45v10M5 30h10M45 30h10' stroke='%237CB34220' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%237CB34215'/%3E%3C/svg%3E")`,
  2: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5v10M30 45v10M5 30h10M45 30h10' stroke='%23E8941C20' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%23E8941C15'/%3E%3C/svg%3E")`,
  3: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5v10M30 45v10M5 30h10M45 30h10' stroke='%23E54B3D20' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%23E54B3D15'/%3E%3C/svg%3E")`,
};
```

**Step 2: Apply pattern to volume selection and chapter screens**

In the volumes screen `<div style={S.panel}>`, add `backgroundImage: VOL_PATTERN[volNum]` to the individual volume card backgrounds.

In the chapters screen, apply `backgroundImage: VOL_PATTERN[selectedVolume]` to the panel background.

**Step 3: Update chapter headers to use Bebas Neue style**

For chapter cards (view === 'chapters'), update the title styling to use:
```javascript
fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
textTransform: 'uppercase',
letterSpacing: '1px',
```

And add a 4px top border in the volume color:
```javascript
borderTop: `4px solid ${volColor}`,
```

**Step 4: Update experiment cards to match book style**

For experiment list items (view === 'experiments'), ensure:
- Title uses `fontFamily: "'Bebas Neue', 'Oswald', sans-serif"`
- Description uses `fontFamily: "'Roboto', sans-serif", fontWeight: 400`

---

## Task 11: Add footer to TutorLayout

**Files:**
- Modify: `src/components/tutor/TutorLayout.jsx`
- Modify: `src/components/tutor/ElabTutorV4.css`

**Step 1: Add footer JSX to TutorLayout**

At the bottom of the TutorLayout render, after the main content area and before the closing tag, add:

```jsx
<footer className="tutor-footer">
    <span>Laboratorio di Elettronica: Impara e sperimenta</span>
</footer>
```

**Step 2: Add footer CSS to ElabTutorV4.css**

```css
/* ═══════════════════════════════════════════════════════════════ */
/* FOOTER — Matches ELAB physical book footer                      */
/* ═══════════════════════════════════════════════════════════════ */

.tutor-footer {
    background: #1E4D8C;
    color: #FFFFFF;
    text-align: center;
    padding: 8px 16px;
    font-family: var(--font-sans);
    font-style: italic;
    font-weight: 300;
    font-size: 14px;
    flex-shrink: 0;
    letter-spacing: 0.3px;
}
```

---

## Task 12: Update TutorTopBar brand styling

**Files:**
- Modify: `src/components/tutor/TutorTopBar.jsx`
- Modify: `src/components/tutor/tutor-responsive.css`

**Step 1: Apply Bebas Neue to the brand title in TutorTopBar**

The brand text "ELAB" and "GALILEO" should use the display font. Find the `.topbar-title` and `.topbar-subtitle` CSS classes in tutor-responsive.css and add:

```css
.topbar-title {
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 2px;
}

.topbar-subtitle {
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 1px;
}
```

---

## Task 13: Final build, audit, and deploy

**Files:** All modified files

**Step 1: Full build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -30`
Expected: 0 errors

**Step 2: Verify no onboarding references remain**

Run: `grep -r "onboarding\|OnboardingWizard\|OnboardingOverlay\|elab_onboarding" src/`
Expected: 0 results

**Step 3: Verify no Open Sans in tutor components**

Run: `grep -r "Open Sans" src/components/ src/styles/`
Expected: 0 results

**Step 4: Verify no progress bar references**

Run: `grep -r "progressStats\|sidebar-progress\|topbar-progress\|fetchProgress\|refreshProgress" src/components/tutor/`
Expected: 0 results

**Step 5: fontSize audit**

Run: `grep -rn "fontSize.*['\"]1[0-3]px" src/components/tutor/ src/components/simulator/panels/`
Verify all matches are legitimate (SVG, charts, admin-only).

**Step 6: Copyright check**

Verify `© Andrea Marro — 20/02/2026` header is in all modified files.

**Step 7: Deploy**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vercel --prod --yes`

---

## Summary of changes by phase

| Phase | Tasks | Files modified | Files deleted |
|-------|-------|----------------|---------------|
| 1: Remove Onboarding | 1-3 | 9 | 2 files + 1 dir |
| 2: Typography | 4-6 | 6 | 0 |
| 4: Remove Progress | 7-8 | 4 | 1 (ProjectTimeline) |
| 8: Aesthetics | 9-12 | 5 | 0 |
| Audit | 13 | 0 | 0 |
