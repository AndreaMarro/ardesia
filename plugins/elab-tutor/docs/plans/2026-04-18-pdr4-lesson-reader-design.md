# PDR #4 — Lesson Reader (Principio Zero UI killer feature)

**Target agent**: Claude Opus 4.7 via Managed Agent (Max #1)
**Durata stimata**: 25-35h autonome
**Branch**: `feature/lesson-reader-v1`
**Dipendenze**: PDR1 UNLIM Core + PDR3 VPS RunPod
**Governance**: `docs/GOVERNANCE.md` Regola 0 + 5 regole

---

## 🎯 Obiettivo

Componente React **LessonReader** che trasforma i volumi ELAB da "card di esperimenti staccati" a "racconto continuo per capitolo". Il docente sceglie il capitolo, timeline verticale mostra la narrativa (intro→esp1→approfondimento→esp2→quiz) con citazioni esatte del libro. Cuore del Principio Zero v3.

**Feedback Andrea**: "esperimenti sui volumi non sono blocchetti staccati, Analizzali ELAB Tutor li presenta diversi dai volumi. MALE!"

---

## ⚖️ Regola 0 — file esistenti da riusare

| File esistente | Azione |
|----------------|--------|
| `src/data/lesson-groups.js` (250 righe, 27 Lezioni) | **RIUSA** come base strutturale |
| `src/data/volume-references.js` (1225 righe, 92 bookText) | **RIUSA** (no touch) |
| `src/data/experiments-vol1/2/3.js` | **RIUSA** (no touch) |
| `src/data/lesson-paths/index.js` | **RIUSA** come fallback mapping |
| `src/services/lessonPrepService.js` (GIÀ ESISTE!) | **RIUSA + POTENZIA** come base |
| `src/components/lavagna/LavagnaShell.jsx` | **MODIFY**: aggiungi tab Lezione Guidata |
| `src/components/lavagna/useGalileoChat.js` | **MODIFY**: integra UNLIM call per preparare contenuto per step |
| `src/services/unlimContextCollector.js` | **MODIFY**: aggiunge `lessonContext` |

**Nuovo (perché feature nuova)**:
- `src/components/lavagna/LessonReader.jsx` — componente timeline
- `src/components/lavagna/LessonTimeline.jsx` — timeline UI
- `src/components/lavagna/LessonStep.jsx` — singolo step
- `src/hooks/useLessonReader.js` — state + logic
- `src/data/chapter-narratives.js` — metadata narrativa capitolo (intro, transitions, quiz)

---

## 📐 Design dettagliato

### Data model `chapter-narratives.js`

```javascript
export const CHAPTER_NARRATIVES = {
  'v1-cap6': {
    volume: 1,
    chapter: 6,
    title: "Cos'è il diodo LED?",
    pageRange: [27, 35],
    intro: {
      page: 27,
      text: "In questo capitolo scopriremo cos'è un LED, come funziona, e costruiremo il nostro primo circuito.",
      bookQuote: "Il LED è un componente elettronico che emette luce quando passa corrente."
    },
    steps: [
      {
        type: 'concept',
        title: 'Cos\'è un LED?',
        page: 27,
        content: 'bookContext da volume-references',
      },
      {
        type: 'experiment',
        experimentId: 'v1-cap6-esp1',
        title: 'Accendiamo il primo LED',
        page: 29,
      },
      {
        type: 'deep-dive',
        title: 'Perché funziona?',
        pages: [30, 31],
      },
      {
        type: 'experiment',
        experimentId: 'v1-cap6-esp2',
        title: 'Perché serve il resistore?',
        page: 32,
      },
      {
        type: 'quiz',
        page: 35,
        questions: [
          { q: "Cosa succede se colleghiamo il LED al contrario?", a: "Non si accende" },
          // ...
        ]
      }
    ],
    transitions: {
      'v1-cap6-esp1': "Abbiamo acceso il nostro LED! Ma perché serviva il resistore? Scopriamolo.",
      'v1-cap6-esp2': "Ora che sappiamo perché serve il resistore, provate voi!"
    }
  },
  // ... altri 26 capitoli
};
```

**Fonte dati**: estratto da PDF volumi ELAB (script `scripts/extract-chapter-narratives.js`) — popolato in Task 4.1.

### Componente `LessonReader.jsx`

```jsx
export function LessonReader({ chapterId }) {
  const narrative = CHAPTER_NARRATIVES[chapterId];
  const { currentStep, goToStep, unlimContent } = useLessonReader(chapterId);
  const { mountExperiment } = useSimulatorSync();

  return (
    <div className="lesson-reader">
      <LessonHeader chapter={narrative} />
      <LessonTimeline
        steps={narrative.steps}
        currentStep={currentStep}
        onStepClick={goToStep}
      />
      <LessonProjectionView
        step={narrative.steps[currentStep]}
        unlimContent={unlimContent}
        onMountExperiment={mountExperiment}
      />
      <LessonControls
        onNext={() => goToStep(currentStep + 1)}
        onPrevious={() => goToStep(currentStep - 1)}
        onProject={() => projectToLIM(unlimContent)}
      />
    </div>
  );
}
```

### Timeline visuale (reference)

```
┌─────────────────────────────────────────────────────┐
│ Vol. 1 Cap 6 — Cos'è il diodo LED? (pag. 27-35)    │
│ ───────────────────────────────────────────────────│
│                                                     │
│  [1] ── 📖 INTRO                       pag. 27     │
│   │     "Il LED è un componente..."                │
│   │                                                │
│  [2] ── 🧪 ESP 1: Accendi il LED       pag. 29     │
│   │     📋 Kit: LED, breadboard, 470Ω, 9V         │
│   │     🎙️ UNLIM: "Ragazzi, pronti?..."            │
│   │     ▶ Proietta contenuto + apri simulatore    │
│   │                                                │
│  [3] ── 🧠 PERCHÉ FUNZIONA            pag. 30-31  │
│   │     "Come spiega il libro..."                 │
│   │                                                │
│  [4] ── 🧪 ESP 2: Serve il resistore   pag. 32     │
│   │     ...                                        │
│   │                                                │
│  [5] ── 🎯 QUIZ FINALE                pag. 35     │
│         UNLIM genera 3 domande live               │
└─────────────────────────────────────────────────────┘
```

### UNLIM content preparation

Quando il docente clicca uno step, LessonReader chiama OpenClaw con:

```json
{
  "lessonContext": {
    "chapterId": "v1-cap6",
    "stepIndex": 2,
    "stepType": "experiment",
    "experimentId": "v1-cap6-esp1",
    "previousStep": { ... },
    "classHistory": { ... }  // da memoria multi-livello
  },
  "bookReference": { ... }  // da volume-references
}
```

OpenClaw prepara contenuto **pronto per proiezione LIM** seguendo Principio Zero v3, 60 parole max + analogia. Docente vede il contenuto pre-generato, click "Proietta" mostra sulla LIM.

---

## 📋 Task (5 sub-task)

### 4.1 — Script extract-chapter-narratives

**Azione**: leggi PDF volumi ELAB in `/VOLUME 3/CONTENUTI/volumi-pdf/`, estrai intro/concetti/esperimenti/quiz per capitolo, genera `src/data/chapter-narratives.js`.

**Tool**: Python script `scripts/extract-chapter-narratives.py` con `pdfplumber` + regex pattern riconoscimento capitolo.

**Exit**: 27 capitoli coperti, 27 Lezioni mapped.

### 4.2 — Componenti React LessonReader

**Azione**: implementa i 3 componenti + 1 hook.

**Test TDD**:
- `LessonReader.test.jsx`: rendering timeline, navigation
- `LessonTimeline.test.jsx`: active step highlight, click handler
- `LessonStep.test.jsx`: type variants rendering
- `useLessonReader.test.js`: state + UNLIM call mock

**Exit**: 40+ test unit verdi + CoV 3/3.

### 4.3 — Integrazione LavagnaShell

**Azione**: aggiungi tab "Lezione Guidata" in `LavagnaShell.jsx`, persistente localStorage.

**Exit**: Playwright test "apri tab → LessonReader render → navigate steps → simulatore si apre".

### 4.4 — UNLIM content preparation per step

**Azione**: `useLessonReader` chiama OpenClaw `/unlim/prepare-step` per ogni step selezionato. OpenClaw ritorna contenuto pronto + metadata (kit checklist, simulator action).

**Exit**: integration test end-to-end, verify contenuto Principio Zero v3 (Ragazzi... Vol. X pag. Y... parole libro... analogia).

### 4.5 — Playwright E2E full flow

**File**: `tests/e2e/lesson-reader-full.spec.ts`

```typescript
test('full lesson flow v1-cap6', async ({ page }) => {
  await page.goto('/lavagna#v1-cap6');
  await page.click('text=Lezione Guidata');
  await expect(page.locator('.lesson-timeline')).toBeVisible();

  // Step 1: Intro
  await page.click('[data-step="0"]');
  await expect(page.locator('.lesson-content')).toContainText('Ragazzi');
  await expect(page.locator('.lesson-content')).toContainText('pag. 27');

  // Step 2: Esperimento 1
  await page.click('[data-step="1"]');
  await expect(page.locator('.simulator-canvas')).toBeVisible();
  await expect(page.locator('.lesson-content')).toContainText('470 Ohm');

  // ... fino a quiz finale

  // Verify no regression baseline
  // Verify a11y
  // Verify performance Lighthouse
});
```

**Exit**: 3× scenario PASS, Lighthouse score >90.

---

## 🔬 Gate finale PDR #4

- [ ] 27 capitoli `chapter-narratives.js` popolati da PDF
- [ ] LessonReader + Timeline + Step components live
- [ ] 40+ test unit + 15+ E2E Playwright
- [ ] Integrazione LavagnaShell OK
- [ ] UNLIM content prep via OpenClaw (Principio Zero v3 preservato)
- [ ] Zero regressione baseline 12056
- [ ] Auditor APPROVE
- [ ] Documentation `docs/features/lesson-reader.md` + screenshots

## 🚨 Rischi

| Rischio | Probabilità | Mitigation |
|---------|-------------|------------|
| PDF extraction incompleto (edge case capitoli) | Alta | Fallback manual editing + grep pattern iterativo |
| UX timeline complesso su mobile/LIM | Media | Responsive breakpoints, LIM-optimized (large fonts) |
| UNLIM content prep lento (>3s) | Media | Pre-warming quando docente apre capitolo |

---

**Governance**: Regola 0 rispettata (riusa lesson-groups + volume-references + experiments-vol*). Pattern 8-step.
