---
id: ATOM-S2-B-03
parent_task: B
sprint: S
iter: 2
assignee: generator-app-opus
depends_on:
  - ATOM-S2-B-01
est_hours: 1.5
files_owned:
  - src/components/lavagna/LavagnaShell.jsx (shared owner with B-01, applied sequentially)
acceptance_criteria:
  - handleCitationClick(volume, page) impl in LavagnaShell
  - Lazy-loads VolumeViewer (existing component) via React.lazy + Suspense
  - VolumeViewer mounts as side-panel overlay (NOT modal blocking) at right 30% width
  - jumpToPage(volume, page) called on mount via prop initialPage
  - Close button + ESC key dismiss
  - VolumeCitation onCitationClick prop wires through PercorsoCapitoloView → LavagnaShell.handleCitationClick
  - No regression on existing simulator/lavagna tests
references:
  - existing src/components/lavagna/VolumeViewer.jsx
  - existing src/components/common/VolumeCitation.jsx
  - master plan §5.4 step 6-7 behavior target
---

## Task

Wire VolumeCitation.onCitationClick → VolumeViewer side-panel via LavagnaShell.handleCitationClick. NOTE: this atom edits LavagnaShell.jsx which B-01 also edits — generator-app-opus MUST run B-01 first, commit, then B-03 (sequential to avoid conflict).

## Implementation outline

```jsx
const VolumeViewer = lazy(() => import('./VolumeViewer'));

// LavagnaShell:
const [volumeViewerState, setVolumeViewerState] = useState({ open: false, volume: null, page: null });

const handleCitationClick = (volume, page) => {
  setVolumeViewerState({ open: true, volume, page });
};

// in JSX:
{volumeViewerState.open && (
  <Suspense fallback={<div>Caricamento volume…</div>}>
    <div className={styles.volumeViewerSidePanel}>
      <VolumeViewer
        volume={volumeViewerState.volume}
        initialPage={volumeViewerState.page}
        onClose={() => setVolumeViewerState({ open: false, volume: null, page: null })}
      />
    </div>
  </Suspense>
)}
```

Add CSS Module class `.volumeViewerSidePanel { position:fixed; right:0; top:HEADER_H; width:30%; height:calc(100vh - HEADER_H); z-index:10; box-shadow:...; }`

## CoV

- 3x npx vitest run PASS
- baseline ≥12498
- npm run build PASS
