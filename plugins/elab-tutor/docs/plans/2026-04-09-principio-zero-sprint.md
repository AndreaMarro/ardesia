# Principio Zero Sprint — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring ELAB Tutor to full parity with physical volumes. Teacher arrives at LIM, opens ELAB, teaches without preparation. BuildSteps 11%→100%, Scratch 2%→100% Vol3, UNLIM omniscient on all 92 experiments.

**Architecture:** 10 scheduled tasks running hourly. Each operates in git worktree isolation, reads shared HANDOFF.md for context, writes results with objective proof. File partitioning prevents conflicts. Merge only after CI green.

**Tech Stack:** React 19 + Vite 7, Vitest, Chrome/Playwright for real platform testing, Supabase backend, scheduled Claude tasks.

---

## Session Schedule (10 tasks, 1 hour each)

### S1: DESIGNER — Alias Mapping + Audit Parità

**Files:**
- Create: `src/data/chapter-map.js`
- Create: `tests/unit/chapterMap.test.js`
- Modify: `docs/sprint/HANDOFF.md`

**Context to read first:**
- `docs/plans/2026-04-09-principio-zero-sprint-design.md`
- `docs/sprint/HANDOFF.md`
- Tea's proposal in `VOLUME 3/ELAB_Tutor_Riallineamento_Volumi.docx` (converted to text below)

**Tea's Mapping:**

Volume 1 (Le Basi):
- Cap 6 → display as Cap 2 "Cos'è il Diodo LED?"
- Cap 7 → display as Cap 3 "Cos'è il LED RGB?"
- Cap 8 → display as Cap 4 "Cos'è un Pulsante?"
- Cap 9 → display as Cap 5 "Cos'è un Potenziometro?"
- Cap 10 → display as Cap 6 "Cos'è un Fotoresistore?"
- Cap 11 → display as Cap 7 "Cos'è un Cicalino?"
- Cap 12 → display as Cap 8 "L'Interruttore Magnetico"
- NEW Cap 1 → "Benvenuto nella Breadboard" (tutorial interattivo)

Volume 2 (Approfondiamo):
- Cap 3 → display as Cap 1 "Il Multimetro"
- Cap 4 → display as Cap 2 "Approfondiamo le Resistenze"
- Cap 5 → display as Cap 3 "Approfondiamo le Batterie"
- Cap 6 → display as Cap 4 "Approfondiamo i LED"
- Cap 7 → display as Cap 5 "Cosa sono i Condensatori?"
- Cap 8 → display as Cap 6 "Cosa sono i Transistor?"
- Cap 9 → display as Cap 7 "Cosa sono i Fototransistor?"
- Cap 10 → display as Cap 8 "Il Motore a Corrente Continua"

Volume 3 (Arduino):
- Cap 5 → display as Cap 1 "Il Nostro Primo Programma"
- Cap 6 (OUTPUT part) → display as Cap 2 "I Pin Digitali (OUTPUT)"
- Cap 6 (INPUT part: pullup, debounce) → display as Cap 3 "I Pin Digitali (INPUT)"
- Cap 7 → display as Cap 4 "I Pin Analogici"
- Cap 8 → display as Cap 5 "Comunicazione Seriale"
- EXTRA → display as Cap 6 "Progetti e Sfide Finali"

**Step 1: Create chapter-map.js**

```javascript
// src/data/chapter-map.js
// Alias mapping: Tea's proposal for volume realignment
// Internal IDs unchanged, display names follow new chapter numbering

export const CHAPTER_MAP = {
  // Volume 1 — Le Basi
  'v1-cap6':  { volume: 1, displayChapter: 2, title: "Cos'è il Diodo LED?", icon: '💡' },
  'v1-cap7':  { volume: 1, displayChapter: 3, title: "Cos'è il LED RGB?", icon: '🌈' },
  'v1-cap8':  { volume: 1, displayChapter: 4, title: "Cos'è un Pulsante?", icon: '🔘' },
  'v1-cap9':  { volume: 1, displayChapter: 5, title: "Cos'è un Potenziometro?", icon: '🎛️' },
  'v1-cap10': { volume: 1, displayChapter: 6, title: "Cos'è un Fotoresistore?", icon: '☀️' },
  'v1-cap11': { volume: 1, displayChapter: 7, title: "Cos'è un Cicalino?", icon: '🔔' },
  'v1-cap12': { volume: 1, displayChapter: 8, title: "L'Interruttore Magnetico", icon: '🧲' },
  
  // Volume 2 — Approfondiamo
  'v2-cap3':  { volume: 2, displayChapter: 1, title: 'Il Multimetro', icon: '📏' },
  'v2-cap4':  { volume: 2, displayChapter: 2, title: 'Approfondiamo le Resistenze', icon: '🔧' },
  'v2-cap5':  { volume: 2, displayChapter: 3, title: 'Approfondiamo le Batterie', icon: '🔋' },
  'v2-cap6':  { volume: 2, displayChapter: 4, title: 'Approfondiamo i LED', icon: '💡' },
  'v2-cap7':  { volume: 2, displayChapter: 5, title: 'Cosa sono i Condensatori?', icon: '⚡' },
  'v2-cap8':  { volume: 2, displayChapter: 6, title: 'Cosa sono i Transistor?', icon: '🔌' },
  'v2-cap9':  { volume: 2, displayChapter: 7, title: 'Cosa sono i Fototransistor?', icon: '👁️' },
  'v2-cap10': { volume: 2, displayChapter: 8, title: 'Il Motore a Corrente Continua', icon: '⚙️' },
  
  // Volume 3 — Arduino  
  'v3-cap5':  { volume: 3, displayChapter: 1, title: 'Il Nostro Primo Programma', icon: '🖥️' },
  'v3-cap6':  { volume: 3, displayChapter: 2, title: 'I Pin Digitali (OUTPUT)', icon: '📤',
                filter: (expId) => !['v3-cap6-pullup', 'v3-cap6-debounce'].some(s => expId.includes(s)) },
  'v3-cap6-input': { volume: 3, displayChapter: 3, title: 'I Pin Digitali (INPUT)', icon: '📥',
                     sourceChapter: 'v3-cap6',
                     filter: (expId) => ['pullup', 'debounce', 'pulsante'].some(s => expId.includes(s)) },
  'v3-cap7':  { volume: 3, displayChapter: 4, title: 'I Pin Analogici', icon: '📊' },
  'v3-cap8':  { volume: 3, displayChapter: 5, title: 'Comunicazione Seriale', icon: '📡' },
  'v3-extra': { volume: 3, displayChapter: 6, title: 'Progetti e Sfide Finali', icon: '🏆' },
};

export function getDisplayInfo(experimentId) {
  const chapterKey = experimentId.replace(/-esp\d+.*$/, '').replace(/-morse$/, '').replace(/-mini.*$/, '');
  return CHAPTER_MAP[chapterKey] || null;
}

export function getVolumeChapters(volumeNumber) {
  return Object.entries(CHAPTER_MAP)
    .filter(([_, v]) => v.volume === volumeNumber)
    .sort((a, b) => a[1].displayChapter - b[1].displayChapter)
    .map(([key, val]) => ({ key, ...val }));
}
```

**Step 2: Write test**

```javascript
// tests/unit/chapterMap.test.js
import { describe, test, expect } from 'vitest';
import { CHAPTER_MAP, getDisplayInfo, getVolumeChapters } from '../../src/data/chapter-map';

describe('Chapter Map — Tea Alias Mapping', () => {
  test('all 3 volumes have chapters starting from 1', () => {
    for (const vol of [1, 2, 3]) {
      const chapters = getVolumeChapters(vol);
      expect(chapters[0].displayChapter).toBe(1);
    }
  });
  
  test('Vol 1 has 8 chapters (Cap 2-8 + future Cap 1)', () => {
    expect(getVolumeChapters(1)).toHaveLength(7); // Cap 1 breadboard is future
  });
  
  test('Vol 3 Cap 6 split into OUTPUT and INPUT', () => {
    const vol3 = getVolumeChapters(3);
    const titles = vol3.map(c => c.title);
    expect(titles).toContain('I Pin Digitali (OUTPUT)');
    expect(titles).toContain('I Pin Digitali (INPUT)');
  });
  
  test('getDisplayInfo maps v1-cap6-esp1 to Cap 2', () => {
    const info = getDisplayInfo('v1-cap6-esp1');
    expect(info.displayChapter).toBe(2);
    expect(info.title).toContain('LED');
  });
  
  test('every chapter has title and displayChapter', () => {
    Object.values(CHAPTER_MAP).forEach(ch => {
      expect(ch.title).toBeTruthy();
      expect(ch.displayChapter).toBeGreaterThan(0);
      expect(ch.volume).toBeGreaterThan(0);
    });
  });
});
```

**Step 3: Run tests, verify pass**
**Step 4: Audit — count buildSteps per volume, write to HANDOFF.md**
**Step 5: Commit on branch `sprint/s1-alias-mapping`, push, verify CI**

---

### S2-S5: WORKER-BUILDSTEPS — Complete buildSteps for all 92 experiments

**S2**: Vol1 Cap 6-8 (14 experiments)
**S3**: Vol1 Cap 9-14 (24 experiments) 
**S4**: Vol2 all (27 experiments, 9 missing)
**S5**: Vol3 all (27 experiments, 21 missing)

**For each experiment, the buildStep must contain:**
1. Array of steps, each with: `instruction` (text for UNLIM to say), `components` (what to add), `connections` (wires to draw)
2. Match EXACTLY what the physical volume describes
3. Progressive — each step adds ONE component or connection

**Pattern (from existing buildSteps):**
```javascript
buildSteps: [
  { instruction: "Prendi il LED rosso e inseriscilo nella breadboard", components: ['led1'], connections: [] },
  { instruction: "Ora aggiungi la resistenza da 220Ω", components: ['r1'], connections: [] },
  { instruction: "Collega il filo dal pin D13 all'anodo del LED", components: [], connections: [['nano:D13', 'led1:anode']] },
  { instruction: "Collega il filo dal catodo del LED alla resistenza", components: [], connections: [['led1:cathode', 'r1:1']] },
  { instruction: "Infine collega la resistenza al GND", components: [], connections: [['r1:2', 'nano:GND']] },
]
```

**Verification per session:**
```bash
node -e "const s=require('fs').readFileSync('src/data/experiments-volN.js','utf8'); console.log((s.match(/buildSteps/g)||[]).length)"
```
Must increase. Auditor-Parità verifies each buildStep matches the volume.

---

### S6: WORKER-SCRATCH — ScratchXml for Vol3 Arduino experiments

**Files:** `src/data/experiments-vol3.js` (scratchXml field only)

For each Vol3 experiment that involves Arduino code, generate the equivalent Scratch/Blockly XML that produces the same behavior. Pattern from existing:

```javascript
scratchXml: '<xml><block type="controls_repeat_ext">...</block></xml>'
```

**Verification:** `grep -c scratchXml src/data/experiments-vol3.js` must reach 27.

---

### S7: WORKER-UNLIM — Omniscience (Knowledge Base + Lesson Paths)

**Files:** `src/data/lesson-paths/*.json`, `src/data/unlim-knowledge-base.js`

1. Complete missing 8 lesson paths (92-84=8)
2. For each lesson path, ensure: vocabulary, phases (CHIEDI/SPERIMENTA/CONCLUDI), teacher_message, misconceptions
3. Update unlim-knowledge-base with Tea's chapter titles and concepts

**Verification:** 
- `ls src/data/lesson-paths/v*.json | wc -l` must be 92
- Test 20 questions on nanobot: `curl POST /tutor-chat` with experiment-specific questions

---

### S8: WORKER-UNLIM — Omnipotence + Voice

**Files:** `src/services/voiceCommands.js`, `src/services/voiceService.js`

1. Verify all 26+ actions in GALILEO-CAPABILITIES.md work
2. Add voice commands for: "monta il circuito", "prossimo esperimento", "prepara la lezione"
3. Test TTS latency — target <2s response

---

### S9: DEBUGGER + AUDITOR — Polish + E2E Principio Zero

Full flow test:
1. Open elabtutor.school on Chrome
2. Select Volume 1, Chapter 2 (alias for cap 6)
3. UNLIM proposes lesson
4. "Monta il circuito" → buildSteps execute
5. "Compila" → code compiles
6. Report generation works

Playwright test for this flow.

---

### S10: ORCHESTRATOR — Deploy + Final Verification

1. Merge all sprint branches
2. `npx vercel --prod`
3. Run full benchmark: every experiment loads, every buildStep works, every lesson path valid
4. Final HANDOFF.md with honest score

---

## Execution

**Approach: Scheduled Tasks (parallel, hourly)**

Each session is a scheduled Claude task that:
1. Reads HANDOFF.md for context
2. Reads this plan for its specific session instructions
3. Works in isolated worktree
4. Writes results with objective proof
5. Updates HANDOFF.md
6. Commits on branch, pushes, CI must pass

Tasks are created via `schedule` skill with cron expressions offset by 6 minutes each to avoid git conflicts.
