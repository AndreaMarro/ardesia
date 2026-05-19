---
id: ATOM-S2-B-01
parent_task: B
sprint: S
iter: 2
assignee: generator-app-opus
depends_on: []
est_hours: 1.5
files_owned:
  - src/components/lavagna/LavagnaShell.jsx
acceptance_criteria:
  - LavagnaShell.jsx imports PercorsoCapitoloView (already exists at src/components/lavagna/PercorsoCapitoloView.jsx)
  - When state mode === 'percorso' AND activeCapitoloId set, render PercorsoCapitoloView instead of legacy PercorsoPanel
  - Legacy PercorsoPanel kept as fallback when no capitolo selected (graceful)
  - Props passed: capitoloId, onExperimentChange, onCitationClick (wired to ATOM-S2-B-03 VolumeViewer)
  - No regression: existing test suite tests/unit/components/lavagna/* PASS unchanged
  - Inline style additions only via CSS Module (no new global CSS)
references:
  - existing src/components/lavagna/PercorsoCapitoloView.jsx (Q2 delivered)
  - existing src/components/lavagna/PercorsoPanel.jsx (legacy fallback)
  - docs/strategy/2026-04-26-master-plan-v2-comprehensive.md §5.3 wire-up checklist
---

## Task

Replace legacy PercorsoPanel with PercorsoCapitoloView in LavagnaShell when in Modalità Percorso AND capitolo selected.

## Implementation outline

```jsx
import PercorsoCapitoloView from './PercorsoCapitoloView';
import PercorsoPanel from './PercorsoPanel'; // keep as fallback

// inside render, percorso branch:
{mode === 'percorso' && (
  activeCapitoloId
    ? <PercorsoCapitoloView
        capitoloId={activeCapitoloId}
        onExperimentChange={handleExperimentChange}
        onCitationClick={handleCitationClick}  // opens VolumeViewer (ATOM-S2-B-03)
      />
    : <PercorsoPanel /* legacy */ />
)}
```

## CoV

- 3x npx vitest run tests/unit/components/lavagna/ PASS
- baseline ≥12498
- npm run build PASS
- Manual: open localhost lavagna, switch to percorso mode, verify rendering (no preview tools required this atom — done in B-05)
