# borderColor Anti-Pattern Audit — SEVERITY CLASSIFICATION

## Pattern Distribution (64 total occurrences across 39 files)

### CRITICAL (Spread+Override Bug — Direct DOM Mutations)
**Files with e.target.style.borderColor = ... mutations in event handlers:**

1. **GestionaleForm.jsx** (8 occurrences) — CRITICAL
   - Lines 106, 110, 141, 145, 198, 202, 246, 250
   - Pattern: `baseInputStyle` spread + `e.target.style.borderColor` mutation in onFocus/onBlur
   - Risk: Focus state not managed in React state → stale styles on prop changes
   - Example: `onFocus={(e) => { e.target.style.borderColor = COLORS.accentLight; }`

2. **ChatOverlay.jsx** (4 occurrences — lines 606-607, 937-938) — CRITICAL
   - Direct mutation: `e.target.style.borderColor = 'var(--color-primary)'`
   - Risk: Multiple overlapping focus states in chat input may cause visual glitches

3. **CodeEditorCM6.jsx** — SUSPECTED (requires verification)

### SAFE (Immutable Conditional Styling)
**Files with ternary operators or conditional style objects:**

1. **ComponentDrawer.jsx** (4 occurrences — lines 116, 466, 479, 493)
   - Pattern: `borderColor: hovered && !dragging ? 'var(--color-primary)' : 'var(--color-border)'`
   - Safety: Managed via state (hovered, dragging)

2. **SerialMonitor.jsx** (4 occurrences — lines 67, 96, 114, 138)
   - Pattern: `...(baudMismatch ? { borderColor: 'var(--color-vol2)' } : {})`
   - Safety: Spread conditional object (not direct mutation)

3. **ExperimentPicker.jsx** (6 occurrences — lines 87, 146, 150, 200, 205, 211)
   - Pattern: Ternary in style prop
   - Safety: Immutable

4. **NarrativeReportEngine.jsx** (8 occurrences — lines 301, 322, 332, 342, 374, 403, 462, 486)
   - Pattern: Static borderColor in StyleSheet-like objects
   - Safety: No mutations

5. **PropertiesPanel.jsx** (3 occurrences) — SAFE

6. **ComponentPalette.jsx** (2 occurrences) — SAFE

### UNKNOWN (Requires Code Reading)
- LoginPage, RegisterPage, GestionaleTable (6 files, 5 occurrences)
- NotesPanel, QuizPanel, UnlimInputBar, UnlimModeSwitch, PredictObserveExplain
- SessionReportPDF, TeacherDashboard, DipendentiModule, BancheFinanzeModule, ImpostazioniModule, SetupWizard

## Classroom Risk Assessment

**If GestionaleForm or ChatOverlay are used during live demo:**
- Teacher clicks input field (focus event fires)
- `e.target.style.borderColor` mutates DOM directly
- If component re-renders (parent prop change), React doesn't revert the mutation
- Result: Focus styling persists incorrectly, teacher sees "weird focus state stuck on" → credibility impact: **MEDIUM**

**Likelihood of triggering during class:**
- GestionaleForm: Only if teacher opens data entry modal during presentation (LOW)
- ChatOverlay: Every time teacher types in Galileo prompt input (HIGH)

## Remediation Priority
1. **ChatOverlay.jsx** — CRITICAL (high frequency, visible to all 25 students)
2. **GestionaleForm.jsx** — HIGH (less frequent, but if triggered, affects entire modal)
3. Other files — MEDIUM (verify if used in simulator-facing workflows)

## Fix Strategy
Replace direct mutations with React state:
```jsx
const [isFocused, setIsFocused] = useState(false);

<input
  style={{
    ...baseInputStyle,
    borderColor: isFocused ? COLORS.accentLight : COLORS.border,
  }}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
/>
```