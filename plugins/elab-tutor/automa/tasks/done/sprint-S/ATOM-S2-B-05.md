---
id: ATOM-S2-B-05
parent_task: B
sprint: S
iter: 2
assignee: generator-app-opus
depends_on:
  - ATOM-S2-B-01
  - ATOM-S2-B-03
est_hours: 1
files_owned:
  - src/components/lavagna/PercorsoCapitoloView.jsx (read+touch readonly attribute changes only)
acceptance_criteria:
  - PercorsoCapitoloView renders DocenteSidebar (existing) reactive to scroll position (sticky-side, follow active esperimento)
  - PercorsoCapitoloView renders IncrementalBuildHint (existing) conditionally when current esperimento.build_circuit?.mode === 'incremental_from_prev'
  - data-testid="percorso-capitolo-view" added to root container (for B-04 e2e)
  - data-testid="volume-viewer-side-panel" added in LavagnaShell volume sidepanel container (coordinate with B-03)
  - No regressions on existing tests
  - Manual browser preview verification: open localhost, navigate Cap 6, verify DocenteSidebar visible + IncrementalBuildHint shown when applicable
references:
  - existing src/components/lavagna/DocenteSidebar.jsx
  - existing src/components/simulator/IncrementalBuildHint.jsx
  - ATOM-S2-B-04 e2e expected testids
---

## Task

Polish PercorsoCapitoloView: integrate DocenteSidebar reactive + IncrementalBuildHint conditional + add testids.

## Implementation outline

```jsx
import DocenteSidebar from './DocenteSidebar';
import IncrementalBuildHint from '../simulator/IncrementalBuildHint';

export default function PercorsoCapitoloView({ capitoloId, onExperimentChange, onCitationClick }) {
  const [activeExperimentId, setActiveExperimentId] = useState(null);
  const activeExp = useActiveExperimentFromScroll(capitoloId, setActiveExperimentId);

  return (
    <div data-testid="percorso-capitolo-view" className={styles.root}>
      <main className={styles.center}>
        {/* esperimento narrative + VolumeCitation inline rendering */}
        {activeExp?.build_circuit?.mode === 'incremental_from_prev' && (
          <IncrementalBuildHint operations={activeExp.build_circuit.operations} />
        )}
      </main>
      <aside className={styles.sidebar}>
        <DocenteSidebar
          activeExperimentId={activeExperimentId}
          capitoloId={capitoloId}
        />
      </aside>
    </div>
  );
}
```

For reactive sidebar: simple IntersectionObserver on each experiment section to set activeExperimentId on scroll.

## CoV

- 3x npx vitest run PASS
- baseline ≥12498
- npm run build PASS
- Manual preview verification noted in scribe audit
