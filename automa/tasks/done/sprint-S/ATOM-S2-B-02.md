---
id: ATOM-S2-B-02
parent_task: B
sprint: S
iter: 2
assignee: generator-app-opus
depends_on: []
est_hours: 1
files_owned:
  - src/components/lavagna/AppHeader.jsx
acceptance_criteria:
  - AppHeader adds button "Capitoli" near existing Mode toggle
  - Click opens CapitoloPicker overlay (component exists at src/components/lavagna/CapitoloPicker.jsx)
  - Overlay state managed via local useState in AppHeader (capitoloPickerOpen)
  - On capitolo select, callback prop onCapitoloSelect(capitoloId) fired (parent LavagnaShell wires to setActiveCapitoloId)
  - Touch target ≥44x44px (CLAUDE.md rule 9)
  - Uses ElabIcons (no emoji per rule 11) — pick icon: BookOpen or similar
  - WCAG AA contrast preserved (rule 10)
references:
  - existing src/components/lavagna/CapitoloPicker.jsx
  - existing src/components/common/ElabIcons.jsx (icon source)
  - CLAUDE.md design rules 9-11
---

## Task

Add "Capitoli" button + CapitoloPicker overlay to AppHeader.

## Implementation outline

```jsx
import { useState } from 'react';
import CapitoloPicker from './CapitoloPicker';
import { ElabIcons } from '../common/ElabIcons';

export default function AppHeader({ onCapitoloSelect, ...props }) {
  const [capitoloPickerOpen, setCapitoloPickerOpen] = useState(false);
  return (
    <header>
      {/* ... existing header content ... */}
      <button
        type="button"
        onClick={() => setCapitoloPickerOpen(true)}
        style={{ minWidth: 44, minHeight: 44 }}
        aria-label="Apri elenco capitoli"
      >
        <ElabIcons.BookOpen /> Capitoli
      </button>
      {capitoloPickerOpen && (
        <CapitoloPicker
          onSelect={(capitoloId) => {
            onCapitoloSelect?.(capitoloId);
            setCapitoloPickerOpen(false);
          }}
          onClose={() => setCapitoloPickerOpen(false)}
        />
      )}
    </header>
  );
}
```

## CoV

- 3x npx vitest run tests/unit/components/lavagna/AppHeader* PASS
- baseline ≥12498
- npm run build PASS
