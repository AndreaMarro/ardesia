# TEAM 6 — PEDAGOGY: Build/Unbuild Mode + Onboarding Wizard

## Status: COMPLETED
## Last Updated: 2026-02-13

## Deliverables

### Feature 1: Build/Unbuild Mode
- [x] `buildSteps` added to first 5 experiments of Vol1 (v1-cap6-esp1, v1-cap6-esp2, v1-cap6-esp3, v1-cap7-esp1, v1-cap7-esp2)
- [x] Build/Unbuild toggle in ExperimentPicker.jsx
- [x] BuildModeGuide.jsx panel component created (270+ LOC)

### Feature 2: Onboarding Wizard
- [x] OnboardingWizard.jsx with 5 steps created (380+ LOC)
- [x] Integrated in ElabTutorV4.jsx (replaced inline 3-step wizard with external 5-step component)
- [x] localStorage flag: `elab_onboarding_done`

### Build
- [x] `npm run build` PASSES (555 modules, 41.76s)
- No warnings, no errors in owned files

## Files Modified
- `src/data/experiments-vol1.js` — Added buildSteps to 5 experiments
- `src/components/simulator/panels/ExperimentPicker.jsx` — Build/Unbuild toggle + buildMode badge
- `src/components/tutor/ElabTutorV4.jsx` — Import OnboardingWizard, replaced inline onboarding

## Files Created
- `src/components/simulator/panels/BuildModeGuide.jsx` — Step-by-step build guide panel
- `src/components/tutor/OnboardingWizard.jsx` — 5-step onboarding wizard

## Files NOT Modified (respected ownership)
- NewElabSimulator.jsx, SimulatorCanvas.jsx
- CircuitSolver.js, SimulationManager.js, AVRBridge.js
- TutorLayout.jsx, TutorSidebar.jsx, TutorTopBar.jsx
- design-system.css, ElabSimulator.css
