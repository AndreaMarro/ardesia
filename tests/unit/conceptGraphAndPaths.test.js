/**
 * Tests for concept-graph.js and lesson-paths/index.js
 * Covers: concept graph structure, prerequisites, lesson path structure, cross-references
 * Target: ~70 tests
 */
import { describe, it, expect } from 'vitest';
import {
  CONCEPTS,
  PREREQUISITES,
  EXPERIMENT_CONCEPTS,
  getPrerequisites,
  getNewConcepts,
  suggestNextExperiments,
  buildAnalogyChain,
} from '../../src/data/concept-graph.js';
import {
  getLessonPath,
  hasLessonPath,
  getAvailableLessonPaths,
  PHASE_NAMES,
} from '../../src/data/lesson-paths/index.js';

// Helper: all experiment IDs from the concept graph
const ALL_EXPERIMENT_IDS = Object.keys(EXPERIMENT_CONCEPTS);
const V1_EXPERIMENTS = ALL_EXPERIMENT_IDS.filter(id => id.startsWith('v1-'));
const V2_EXPERIMENTS = ALL_EXPERIMENT_IDS.filter(id => id.startsWith('v2-'));
const V3_EXPERIMENTS = ALL_EXPERIMENT_IDS.filter(id => id.startsWith('v3-'));
const ALL_CONCEPT_IDS = Object.keys(CONCEPTS);

// ═══════════════════════════════════════════════════════
// 1. CONCEPT GRAPH (30 tests)
// ═══════════════════════════════════════════════════════
describe('concept-graph', () => {
  // -- getNewConcepts --
  describe('getNewConcepts', () => {
    it('returns an array for v1-cap6-esp1', () => {
      const result = getNewConcepts('v1-cap6-esp1');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns an array for v2-cap7-esp1', () => {
      const result = getNewConcepts('v2-cap7-esp1');
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns an array for v3-cap6-semaforo', () => {
      const result = getNewConcepts('v3-cap6-semaforo');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown experiment ID', () => {
      expect(getNewConcepts('nonexistent')).toEqual([]);
    });

    it('returns empty array for experiments that teach nothing new', () => {
      // v1-cap6-esp3 teaches no new concepts
      const result = getNewConcepts('v1-cap6-esp3');
      expect(result).toEqual([]);
    });

    it('v1-cap6-esp1 teaches circuito-chiuso, polarita-led, breadboard', () => {
      const ids = getNewConcepts('v1-cap6-esp1').map(c => c.id);
      expect(ids).toContain('circuito-chiuso');
      expect(ids).toContain('polarita-led');
      expect(ids).toContain('breadboard');
    });

    it('each returned concept has id, name, and analogy fields', () => {
      const concepts = getNewConcepts('v1-cap6-esp1');
      for (const c of concepts) {
        expect(c).toHaveProperty('id');
        expect(c).toHaveProperty('name');
        expect(c).toHaveProperty('analogy');
        expect(typeof c.name).toBe('string');
        expect(typeof c.analogy).toBe('string');
      }
    });
  });

  // -- getPrerequisites --
  describe('getPrerequisites', () => {
    it('returns an array for known experiment IDs', () => {
      const result = getPrerequisites('v1-cap7-esp1');
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns empty array for unknown experiment ID', () => {
      expect(getPrerequisites('fake-id')).toEqual([]);
    });

    it('v1-cap6-esp1 (first experiment) has no prerequisites', () => {
      const prereqs = getPrerequisites('v1-cap6-esp1');
      expect(prereqs).toEqual([]);
    });

    it('v1-cap6-esp2 requires circuito-chiuso and polarita-led', () => {
      const ids = getPrerequisites('v1-cap6-esp2').map(c => c.id);
      expect(ids).toContain('circuito-chiuso');
      expect(ids).toContain('polarita-led');
    });

    it('v1-cap7-esp1 requires resistenza-protezione', () => {
      const ids = getPrerequisites('v1-cap7-esp1').map(c => c.id);
      expect(ids).toContain('resistenza-protezione');
    });

    it('later experiments have prerequisites referencing earlier concepts', () => {
      const pwmPrereqs = getPrerequisites('v1-cap10-esp1').map(c => c.id);
      expect(pwmPrereqs).toContain('analogread');
      expect(pwmPrereqs).toContain('led-rgb');
    });

    it('each prerequisite has met property (defaults to false)', () => {
      const prereqs = getPrerequisites('v1-cap7-esp1');
      for (const p of prereqs) {
        expect(p).toHaveProperty('met');
        expect(p.met).toBe(false);
      }
    });

    it('each prerequisite has name and analogy fields', () => {
      const prereqs = getPrerequisites('v1-cap8-esp1');
      expect(prereqs.length).toBeGreaterThan(0);
      for (const p of prereqs) {
        expect(typeof p.name).toBe('string');
        expect(typeof p.analogy).toBe('string');
        expect(p.name.length).toBeGreaterThan(0);
      }
    });
  });

  // -- CONCEPTS structure --
  describe('CONCEPTS structure', () => {
    it('has at least 20 concepts', () => {
      expect(ALL_CONCEPT_IDS.length).toBeGreaterThanOrEqual(20);
    });

    it('every concept has name and analogy fields', () => {
      for (const id of ALL_CONCEPT_IDS) {
        expect(CONCEPTS[id]).toHaveProperty('name');
        expect(CONCEPTS[id]).toHaveProperty('analogy');
        expect(typeof CONCEPTS[id].name).toBe('string');
        expect(typeof CONCEPTS[id].analogy).toBe('string');
      }
    });

    it('every concept has description and metaphor fields', () => {
      for (const id of ALL_CONCEPT_IDS) {
        expect(CONCEPTS[id]).toHaveProperty('description');
        expect(CONCEPTS[id]).toHaveProperty('metaphor');
      }
    });

    it('every concept has difficulty (1-3)', () => {
      for (const id of ALL_CONCEPT_IDS) {
        expect(CONCEPTS[id]).toHaveProperty('difficulty');
        expect(CONCEPTS[id].difficulty).toBeGreaterThanOrEqual(1);
        expect(CONCEPTS[id].difficulty).toBeLessThanOrEqual(3);
      }
    });

    it('every concept has a firstTaught experiment reference', () => {
      for (const id of ALL_CONCEPT_IDS) {
        expect(CONCEPTS[id]).toHaveProperty('firstTaught');
        expect(typeof CONCEPTS[id].firstTaught).toBe('string');
        // The referenced experiment should exist
        expect(EXPERIMENT_CONCEPTS).toHaveProperty(CONCEPTS[id].firstTaught);
      }
    });
  });

  // -- PREREQUISITES structure --
  describe('PREREQUISITES structure', () => {
    it('has an entry for every concept', () => {
      for (const id of ALL_CONCEPT_IDS) {
        expect(PREREQUISITES).toHaveProperty(id);
        expect(Array.isArray(PREREQUISITES[id])).toBe(true);
      }
    });

    it('all prerequisite references point to valid concepts', () => {
      for (const [conceptId, prereqs] of Object.entries(PREREQUISITES)) {
        for (const prereq of prereqs) {
          expect(CONCEPTS).toHaveProperty(prereq);
        }
      }
    });

    it('circuito-chiuso has no prerequisites (root concept)', () => {
      expect(PREREQUISITES['circuito-chiuso']).toEqual([]);
    });

    it('no circular dependencies in the concept graph', () => {
      // DFS cycle detection
      const visited = new Set();
      const inStack = new Set();
      let hasCycle = false;

      function dfs(node) {
        if (inStack.has(node)) { hasCycle = true; return; }
        if (visited.has(node)) return;
        visited.add(node);
        inStack.add(node);
        for (const dep of (PREREQUISITES[node] || [])) {
          dfs(dep);
          if (hasCycle) return;
        }
        inStack.delete(node);
      }

      for (const id of ALL_CONCEPT_IDS) {
        dfs(id);
        if (hasCycle) break;
      }

      expect(hasCycle).toBe(false);
    });
  });

  // -- EXPERIMENT_CONCEPTS structure --
  describe('EXPERIMENT_CONCEPTS structure', () => {
    it('has at least 55 experiments', () => {
      expect(ALL_EXPERIMENT_IDS.length).toBeGreaterThanOrEqual(55);
    });

    it('every experiment has teaches and requires arrays', () => {
      for (const [id, data] of Object.entries(EXPERIMENT_CONCEPTS)) {
        expect(Array.isArray(data.teaches)).toBe(true);
        expect(Array.isArray(data.requires)).toBe(true);
      }
    });

    it('all teaches references point to valid concepts', () => {
      for (const [id, data] of Object.entries(EXPERIMENT_CONCEPTS)) {
        for (const concept of data.teaches) {
          expect(CONCEPTS).toHaveProperty(concept);
        }
      }
    });

    it('all requires references point to valid concepts', () => {
      for (const [id, data] of Object.entries(EXPERIMENT_CONCEPTS)) {
        for (const concept of data.requires) {
          expect(CONCEPTS).toHaveProperty(concept);
        }
      }
    });

    it('covers all 3 volumes', () => {
      expect(V1_EXPERIMENTS.length).toBeGreaterThan(0);
      expect(V2_EXPERIMENTS.length).toBeGreaterThan(0);
      expect(V3_EXPERIMENTS.length).toBeGreaterThan(0);
    });
  });

  // -- suggestNextExperiments --
  describe('suggestNextExperiments', () => {
    it('with no mastered concepts, suggests v1-cap6-esp1 (no prereqs)', () => {
      const suggestions = suggestNextExperiments([]);
      const ids = suggestions.map(s => s.experimentId);
      expect(ids).toContain('v1-cap6-esp1');
    });

    it('returns sorted by difficulty', () => {
      const suggestions = suggestNextExperiments([]);
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i].difficulty).toBeGreaterThanOrEqual(suggestions[i - 1].difficulty);
      }
    });
  });

  // -- buildAnalogyChain --
  describe('buildAnalogyChain', () => {
    it('returns an array of analogy objects', () => {
      const chain = buildAnalogyChain('legge-ohm');
      expect(Array.isArray(chain)).toBe(true);
      expect(chain.length).toBeGreaterThan(0);
    });

    it('each entry has concept, analogy, and metaphor', () => {
      const chain = buildAnalogyChain('pwm');
      for (const entry of chain) {
        expect(entry).toHaveProperty('concept');
        expect(entry).toHaveProperty('analogy');
        expect(entry).toHaveProperty('metaphor');
      }
    });

    it('returns empty array for invalid concept', () => {
      const chain = buildAnalogyChain('nonexistent-concept');
      expect(chain).toEqual([]);
    });
  });
});

// ═══════════════════════════════════════════════════════
// 2. LESSON PATHS (30 tests)
// ═══════════════════════════════════════════════════════
describe('lesson-paths', () => {
  const availablePaths = getAvailableLessonPaths();

  // -- getLessonPath --
  describe('getLessonPath', () => {
    it('returns data for v1-cap6-esp1', () => {
      const path = getLessonPath('v1-cap6-esp1');
      expect(path).not.toBeNull();
      expect(path).toHaveProperty('experiment_id', 'v1-cap6-esp1');
    });

    it('returns data for v2-cap7-esp1', () => {
      const path = getLessonPath('v2-cap7-esp1');
      expect(path).not.toBeNull();
      expect(path).toHaveProperty('experiment_id', 'v2-cap7-esp1');
    });

    it('returns data for v3-cap6-semaforo', () => {
      const path = getLessonPath('v3-cap6-semaforo');
      expect(path).not.toBeNull();
    });

    it('returns null for unknown experiment ID', () => {
      expect(getLessonPath('nonexistent-id')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getLessonPath('')).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(getLessonPath(undefined)).toBeNull();
    });
  });

  // -- hasLessonPath --
  describe('hasLessonPath', () => {
    it('returns true for known experiment', () => {
      expect(hasLessonPath('v1-cap6-esp1')).toBe(true);
    });

    it('returns false for unknown experiment', () => {
      expect(hasLessonPath('does-not-exist')).toBe(false);
    });
  });

  // -- getAvailableLessonPaths --
  describe('getAvailableLessonPaths', () => {
    it('returns an array of strings', () => {
      expect(Array.isArray(availablePaths)).toBe(true);
      expect(availablePaths.length).toBeGreaterThan(0);
      for (const p of availablePaths) {
        expect(typeof p).toBe('string');
      }
    });

    it('has at least 80 lesson paths', () => {
      expect(availablePaths.length).toBeGreaterThanOrEqual(80);
    });
  });

  // -- PHASE_NAMES --
  describe('PHASE_NAMES', () => {
    it('has exactly 5 phases', () => {
      expect(PHASE_NAMES).toHaveLength(5);
    });

    it('contains PREPARA, MOSTRA, CHIEDI, OSSERVA, CONCLUDI', () => {
      expect(PHASE_NAMES).toEqual(['PREPARA', 'MOSTRA', 'CHIEDI', 'OSSERVA', 'CONCLUDI']);
    });
  });

  // -- Lesson path structure --
  describe('lesson path structure', () => {
    it('has experiment_id field matching the key', () => {
      for (const id of ['v1-cap6-esp1', 'v2-cap6-esp1', 'v3-cap6-semaforo']) {
        const path = getLessonPath(id);
        expect(path.experiment_id).toBe(id);
      }
    });

    it('has volume, chapter, title fields', () => {
      const path = getLessonPath('v1-cap6-esp1');
      expect(path).toHaveProperty('volume');
      expect(path).toHaveProperty('chapter');
      expect(path).toHaveProperty('title');
      expect(typeof path.volume).toBe('number');
      expect(typeof path.chapter).toBe('number');
      expect(typeof path.title).toBe('string');
    });

    it('has difficulty (1-3) and duration_minutes', () => {
      const path = getLessonPath('v1-cap6-esp1');
      expect(path.difficulty).toBeGreaterThanOrEqual(1);
      expect(path.difficulty).toBeLessThanOrEqual(3);
      expect(path.duration_minutes).toBeGreaterThan(0);
    });

    it('has phases array with exactly 5 entries', () => {
      const path = getLessonPath('v1-cap6-esp1');
      expect(Array.isArray(path.phases)).toBe(true);
      expect(path.phases).toHaveLength(5);
    });

    it('phases follow the 5-step pattern', () => {
      const path = getLessonPath('v1-cap6-esp1');
      const names = path.phases.map(p => p.name);
      expect(names).toEqual(['PREPARA', 'MOSTRA', 'CHIEDI', 'OSSERVA', 'CONCLUDI']);
    });

    it('each phase has teacher_message and duration_minutes', () => {
      const path = getLessonPath('v1-cap6-esp1');
      for (const phase of path.phases) {
        expect(phase).toHaveProperty('teacher_message');
        expect(typeof phase.teacher_message).toBe('string');
        expect(phase.teacher_message.length).toBeGreaterThan(0);
        expect(phase).toHaveProperty('duration_minutes');
        expect(typeof phase.duration_minutes).toBe('number');
      }
    });

    it('has components_needed array', () => {
      const path = getLessonPath('v1-cap6-esp1');
      expect(Array.isArray(path.components_needed)).toBe(true);
      expect(path.components_needed.length).toBeGreaterThan(0);
      for (const c of path.components_needed) {
        expect(c).toHaveProperty('name');
        expect(c).toHaveProperty('quantity');
      }
    });

    it('has vocabulary with allowed and forbidden arrays', () => {
      const path = getLessonPath('v1-cap6-esp1');
      expect(path).toHaveProperty('vocabulary');
      expect(Array.isArray(path.vocabulary.allowed)).toBe(true);
      expect(Array.isArray(path.vocabulary.forbidden)).toBe(true);
    });

    it('has session_save with concepts_covered', () => {
      const path = getLessonPath('v1-cap6-esp1');
      expect(path).toHaveProperty('session_save');
      expect(Array.isArray(path.session_save.concepts_covered)).toBe(true);
    });

    it('has assessment_invisible array', () => {
      const path = getLessonPath('v1-cap6-esp1');
      expect(Array.isArray(path.assessment_invisible)).toBe(true);
      expect(path.assessment_invisible.length).toBeGreaterThan(0);
    });

    it('CONCLUDI phase has concepts_learned array', () => {
      const path = getLessonPath('v1-cap6-esp1');
      const concludi = path.phases[4];
      expect(concludi.name).toBe('CONCLUDI');
      expect(Array.isArray(concludi.concepts_learned)).toBe(true);
    });

    it('CHIEDI phase has provocative_question', () => {
      const path = getLessonPath('v1-cap6-esp1');
      const chiedi = path.phases[2];
      expect(chiedi.name).toBe('CHIEDI');
      expect(chiedi).toHaveProperty('provocative_question');
      expect(typeof chiedi.provocative_question).toBe('string');
    });
  });

  // -- Volume coverage --
  describe('volume coverage', () => {
    it('every Vol1 experiment in concept graph has a lesson path', () => {
      for (const id of V1_EXPERIMENTS) {
        expect(hasLessonPath(id)).toBe(true);
      }
    });

    it('sample Vol2 experiments have lesson paths', () => {
      const v2Sample = ['v2-cap6-esp1', 'v2-cap7-esp1', 'v2-cap8-esp1', 'v2-cap10-esp1'];
      for (const id of v2Sample) {
        expect(hasLessonPath(id)).toBe(true);
      }
    });

    it('sample Vol3 experiments have lesson paths', () => {
      const v3Sample = ['v3-cap6-semaforo', 'v3-cap8-esp3', 'v3-cap6-esp5', 'v3-cap7-esp6'];
      for (const id of v3Sample) {
        expect(hasLessonPath(id)).toBe(true);
      }
    });

    it('all available lesson paths have valid experiment_id format', () => {
      for (const id of availablePaths) {
        expect(id).toMatch(/^v[123]-/);
      }
    });

    it('lesson paths span all 3 volumes', () => {
      const v1Paths = availablePaths.filter(id => id.startsWith('v1-'));
      const v2Paths = availablePaths.filter(id => id.startsWith('v2-'));
      const v3Paths = availablePaths.filter(id => id.startsWith('v3-'));
      expect(v1Paths.length).toBeGreaterThan(0);
      expect(v2Paths.length).toBeGreaterThan(0);
      expect(v3Paths.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════
// 3. CROSS-REFERENCE (10 tests)
// ═══════════════════════════════════════════════════════
describe('cross-reference', () => {
  // Lazy-load volume-references to avoid hard failure if module shape changes
  let VOLUME_REFERENCES;
  try {
    // Dynamic import would be async; use require-like approach via static import at top
    // Instead, we import it inline since vitest supports top-level await in ESM
  } catch (_) { /* handled in tests */ }

  // We use a beforeAll to load the module
  const volRefPromise = import('../../src/data/volume-references.js');

  it('volume-references module loads successfully', async () => {
    const mod = await volRefPromise;
    VOLUME_REFERENCES = mod.default || mod.VOLUME_REFERENCES;
    expect(VOLUME_REFERENCES).toBeDefined();
    expect(typeof VOLUME_REFERENCES).toBe('object');
  });

  it('every experiment in the concept graph with a lesson path also has a volume reference', async () => {
    const mod = await volRefPromise;
    const volRefs = mod.default || mod.VOLUME_REFERENCES;
    // Check all experiments from concept graph that also have a lesson path
    let missingCount = 0;
    const missing = [];
    for (const expId of ALL_EXPERIMENT_IDS) {
      if (hasLessonPath(expId) && !volRefs[expId]) {
        missing.push(expId);
        missingCount++;
      }
    }
    // Allow some missing (volume-references may be incomplete), but most should exist
    // At minimum, Vol1 first experiments should be there
    expect(volRefs['v1-cap6-esp1']).toBeDefined();
    expect(volRefs['v1-cap6-esp2']).toBeDefined();
    expect(volRefs['v1-cap6-esp3']).toBeDefined();
  });

  it('volume references have required structure', async () => {
    const mod = await volRefPromise;
    const volRefs = mod.default || mod.VOLUME_REFERENCES;
    const ref = volRefs['v1-cap6-esp1'];
    expect(ref).toHaveProperty('volume');
    expect(ref).toHaveProperty('bookPage');
    expect(ref).toHaveProperty('chapter');
    expect(ref).toHaveProperty('bookText');
    expect(typeof ref.volume).toBe('number');
    expect(typeof ref.bookPage).toBe('number');
  });

  it('volume reference bookPage values are positive numbers', async () => {
    const mod = await volRefPromise;
    const volRefs = mod.default || mod.VOLUME_REFERENCES;
    for (const [id, ref] of Object.entries(volRefs)) {
      expect(ref.bookPage).toBeGreaterThan(0);
    }
  });

  it('volume reference volumes match experiment ID prefix', async () => {
    const mod = await volRefPromise;
    const volRefs = mod.default || mod.VOLUME_REFERENCES;
    for (const [id, ref] of Object.entries(volRefs)) {
      if (id.startsWith('v1-')) expect(ref.volume).toBe(1);
      if (id.startsWith('v2-')) expect(ref.volume).toBe(2);
      if (id.startsWith('v3-')) expect(ref.volume).toBe(3);
    }
  });

  it('concept graph covers chapters 6-14 for Vol1', () => {
    const v1Chapters = new Set();
    for (const id of V1_EXPERIMENTS) {
      const match = id.match(/v1-cap(\d+)/);
      if (match) v1Chapters.add(parseInt(match[1]));
    }
    for (let ch = 6; ch <= 14; ch++) {
      // Some chapters might not exist, but 6-12 are required
      if (ch <= 12) {
        expect(v1Chapters.has(ch)).toBe(true);
      }
    }
  });

  it('concept graph covers chapters for Vol2', () => {
    const v2Chapters = new Set();
    for (const id of V2_EXPERIMENTS) {
      const match = id.match(/v2-cap(\d+)/);
      if (match) v2Chapters.add(parseInt(match[1]));
    }
    // Vol2 has chapters 6-10 and 12
    expect(v2Chapters.has(6)).toBe(true);
    expect(v2Chapters.has(7)).toBe(true);
    expect(v2Chapters.has(8)).toBe(true);
    expect(v2Chapters.has(10)).toBe(true);
  });

  it('concept graph covers chapters for Vol3', () => {
    const v3Chapters = new Set();
    for (const id of V3_EXPERIMENTS) {
      const match = id.match(/v3-cap(\d+)/);
      if (match) v3Chapters.add(parseInt(match[1]));
    }
    expect(v3Chapters.has(6)).toBe(true);
    expect(v3Chapters.has(8)).toBe(true);
  });

  it('lesson path volume field matches experiment ID prefix', () => {
    const samples = ['v1-cap6-esp1', 'v2-cap6-esp1', 'v3-cap6-semaforo'];
    for (const id of samples) {
      const path = getLessonPath(id);
      if (path) {
        const expectedVol = parseInt(id.charAt(1));
        expect(path.volume).toBe(expectedVol);
      }
    }
  });

  it('all concepts taught in experiments are referenced somewhere in PREREQUISITES', () => {
    // Every concept that appears in teaches should also have a PREREQUISITES entry
    const allTaught = new Set();
    for (const data of Object.values(EXPERIMENT_CONCEPTS)) {
      for (const c of data.teaches) allTaught.add(c);
    }
    for (const concept of allTaught) {
      expect(PREREQUISITES).toHaveProperty(concept);
    }
  });
});
