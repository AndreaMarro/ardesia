import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import {
  checkReferenceIntegrity,
  checkNarrativeAcyclic,
  transitionsCycleNode,
} from '../../../scripts/epic1/validate-lesson-paths.mjs';

// EPIC 1 A4.1d — tests for the two regression guards added to the validator:
// reference integrity (no dangling next_experiment / next_suggested / prereq)
// and narrative-flow acyclicity. The guards exist because the contract check
// was blind to the dangling refs + the semaforo<->morse cycle A4.1c introduced.

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

describe('checkReferenceIntegrity', () => {
  it('returns no issues when every reference resolves', () => {
    const lessonPaths = {
      a: { next_experiment: { id: 'b' }, session_save: { next_suggested: 'b' }, prerequisites: [] },
      b: { next_experiment: { id: null }, session_save: { next_suggested: null }, prerequisites: ['a'] },
    };
    expect(checkReferenceIntegrity(lessonPaths)).toEqual([]);
  });

  it('flags a dangling next_experiment.id', () => {
    const lessonPaths = {
      a: { next_experiment: { id: 'ghost' }, prerequisites: [] },
    };
    const issues = checkReferenceIntegrity(lessonPaths);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('a: next_experiment.id -> "ghost"');
  });

  it('flags a dangling session_save.next_suggested', () => {
    const lessonPaths = {
      a: { session_save: { next_suggested: 'ghost' } },
    };
    expect(checkReferenceIntegrity(lessonPaths)[0]).toContain('session_save.next_suggested -> "ghost"');
  });

  it('flags every dangling prerequisites[] entry, not just the first', () => {
    const lessonPaths = {
      a: { prerequisites: ['ghost1', 'b', 'ghost2'] },
      b: {},
    };
    const issues = checkReferenceIntegrity(lessonPaths);
    expect(issues).toHaveLength(2);
    expect(issues.join('\n')).toContain('ghost1');
    expect(issues.join('\n')).toContain('ghost2');
  });

  it('treats null as a meaningful terminus / no-prerequisite value (not an issue)', () => {
    const lessonPaths = {
      a: { next_experiment: { id: null }, session_save: { next_suggested: null }, prerequisites: [] },
    };
    expect(checkReferenceIntegrity(lessonPaths)).toEqual([]);
  });
});

describe('transitionsCycleNode', () => {
  it('returns null for a strictly linear (acyclic) chain', () => {
    const transitions = [
      { between: ['esp1', 'esp2'] },
      { between: ['esp2', 'esp3'] },
      { between: ['esp3', 'esp4'] },
    ];
    expect(transitionsCycleNode(transitions)).toBeNull();
  });

  it('detects a 2-cycle (the semaforo<->morse class of bug A4.1c introduced)', () => {
    const transitions = [
      { between: ['esp1', 'morse'] },
      { between: ['morse', 'semaforo'] },
      { between: ['semaforo', 'morse'] },
    ];
    expect(transitionsCycleNode(transitions)).toBe('morse');
  });

  it('detects a 3-cycle', () => {
    const transitions = [
      { between: ['a', 'b'] },
      { between: ['b', 'c'] },
      { between: ['c', 'a'] },
    ];
    expect(transitionsCycleNode(transitions)).not.toBeNull();
  });

  it('returns null for empty / missing transitions', () => {
    expect(transitionsCycleNode([])).toBeNull();
    expect(transitionsCycleNode(undefined)).toBeNull();
    expect(transitionsCycleNode(null)).toBeNull();
  });

  it('ignores malformed transition entries without crashing', () => {
    const transitions = [{ between: ['a', 'b'] }, {}, { between: ['a'] }, { between: null }];
    expect(transitionsCycleNode(transitions)).toBeNull();
  });
});

// Integration: the guards must PASS on the real repo — this is also a live
// regression check that the A4.1d re-thread left zero dangling refs / cycles.
describe('A4.1d guards — live repo regression check', () => {
  const LP_DIR = join(REPO, '..', '..', 'packs', 'elab-tutor', 'data', 'lesson-paths');
  const CAPITOLI_DIR = join(REPO, 'src', 'data', 'capitoli');

  it('every lesson-path reference resolves (0 dangling refs in src/)', () => {
    const lessonPaths = {};
    for (const f of readdirSync(LP_DIR).filter((f) => f.endsWith('.json'))) {
      const j = JSON.parse(readFileSync(join(LP_DIR, f), 'utf8'));
      if (j.experiment_id) lessonPaths[j.experiment_id] = j;
    }
    expect(checkReferenceIntegrity(lessonPaths)).toEqual([]);
  });

  it('every capitoli narrative_flow graph is acyclic', () => {
    expect(checkNarrativeAcyclic(CAPITOLI_DIR)).toEqual([]);
  });
});
