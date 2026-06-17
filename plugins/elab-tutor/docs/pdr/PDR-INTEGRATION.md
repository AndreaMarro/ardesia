# PDR Integration — Wire-up Sprint Q production

**Scope**: integrare Q1-Q6 deliverables in production app shell.
**Pre-requisito**: PR #34-#40 merged in main (cascade).

---

## Step 1 — Edge Function unlim-chat (D+1, ~4h)

### File modificati
- `supabase/functions/unlim-chat/index.ts`

### Changes
```diff
+ import { getCapitoloByExperimentId } from '../_shared/capitoli-loader.ts';
+ import { buildSystemPrompt } from '../_shared/system-prompt.ts'; // existing
+ // Capitolo context injection
+ const capContext = experimentId ? getCapitoloByExperimentId(experimentId) : null;
+ const capPromptFragment = capContext ? buildCapitoloContextString(capContext) : '';
+ const systemPrompt = await buildSystemPrompt({
+   ...existingArgs,
+   capitoloContext: capPromptFragment,
+ });
+ // Validator middleware (post-LLM, pre-return)
+ const validation = validatePrincipioZeroOnEdge(rawResponse);
+ if (validation.violations.some(v => v.severity === 'critical')) {
+   logViolation('critical', validation, sessionId);
+   rawResponse = capWords(rawResponse, 60);  // truncate to comply
+ }
```

### Test
- Local Supabase staging deploy
- 20 fixtures benchmark `tutor-q3-fixtures.jsonl`
- Pass rate target ≥ 85%

### Risk MEDIUM
- Prompt change può degradare risposte
- Mitigation: feature flag gradual rollout

---

## Step 2 — Q2 UI integration LavagnaShell (D+2, ~6h)

### File modificati
- `src/components/lavagna/LavagnaShell.jsx`
- `src/components/lavagna/AppHeader.jsx`

### Changes LavagnaShell
```diff
- const PercorsoPanel = lazy(() => import('./PercorsoPanel'));
+ const PercorsoCapitoloView = lazy(() => import('./PercorsoCapitoloView'));
+ const CapitoloPicker = lazy(() => import('./CapitoloPicker'));
+ import { getCapitolo, listCapitoliByVolume } from '../../services/percorsoService';
+ const [activeCapitoloId, setActiveCapitoloId] = useState(null);
+ const [capitoloPickerOpen, setCapitoloPickerOpen] = useState(false);
```

### Changes AppHeader
```diff
+ <button onClick={() => setCapitoloPickerOpen(true)}>Capitoli</button>
```

### VolumeCitation onClick wire
- `onCitationClick` → set `activeCapitoloId` + open VolumeViewer at page

### Browser preview verification (mandatory)
- `npm run dev` → http://localhost:5173
- Test golden path:
  1. Apri Lavagna
  2. Click "Capitoli" → CapitoloPicker overlay
  3. Switch Vol 1/2/3
  4. Click Cap 6 LED → PercorsoCapitoloView mounts
  5. Vedi 70/25 layout
  6. Scroll → DocenteSidebar reactive update
  7. Click VolumeCitation Vol.1 pag.27 → VolumeViewer opens at page
  8. Click esp 2 → simulator load + IncrementalBuildHint shows (incremental_from_prev)

### Risk MEDIUM
- LavagnaShell esistente complesso, lazy imports cascade
- Mitigation: incremental commit, vitest + manual preview ogni step

---

## Step 3 — GDPR remediation (D+3, ~4h)

### Vedi docs/pdr/PDR-MASTER-NEXT-DAYS Fase 4
- Force Gemini EU endpoint
- Wire `canUseTogether()` in unlim-chat
- userRole enforcement
- Privacy policy update
- Staging 24h smoke + production deploy

---

## Step 4 — memoryWriter wire-up (D+4, ~2h)

### File modificati
- `src/services/unlimMemory.js` (existing) — invocare `buildStudentMemory` post session save

### Changes
```diff
+ import { buildStudentMemory } from './memoryWriter.js';

  saveSession(session) {
    // existing logic
+   const sessionLog = await getSessionLogForClass(session.classId);
+   const memoryMd = buildStudentMemory(session.classId, sessionLog);
+   await uploadToSupabase(`students/${session.classId}.md`, memoryMd);
  }
```

### Test
- E2E session save → verify markdown file in Supabase storage

---

## Step 5 — percorsoGenerator integration (D+5, ~3h)

### File modificati
- `supabase/functions/unlim-chat/index.ts` (Q3 wire) — add `mode: 'preview'` param

### Changes
```diff
+ if (request.mode === 'preview' && capitoloId) {
+   const cap = getCapitolo(capitoloId);
+   const classMemory = await loadClassMemory(classId);
+   const teacherMemory = await loadTeacherMemory(teacherId);
+   const percorso = await generatePercorso({
+     capitolo: cap, classMemory, teacherMemory, liveState,
+     llmCall: callGeminiEU,
+   });
+   return Response.json(percorso);
+ }
```

### Frontend
- `src/components/lavagna/PercorsoCapitoloView.jsx` può chiamare `/unlim-chat?mode=preview` per preview LLM-enriched
- Default static Capitolo (Q1.C percorsoService) per request normali

---

## Cross-cutting

### CoV ogni step
- Pre: full vitest baseline check
- Post: full vitest baseline check (NO regression)
- E2E spec aggiornati

### Audit doc
Ogni step: `docs/audits/2026-04-XX-integration-stepN.md`

### Branch strategy
- 1 PR per step (5 PR totali)
- Sequential merge

---

## Timeline cumulative

- D+1: Edge Function (4h)
- D+2: UI Lavagna (6h)
- D+3: GDPR (4h)
- D+4: memoryWriter (2h)
- D+5: percorsoGenerator (3h)
- **Total**: ~20h, 5 giorni

---

**Verdetto**: integration step-by-step, ognuno isolato + testabile. Rollback granulare possibile.
