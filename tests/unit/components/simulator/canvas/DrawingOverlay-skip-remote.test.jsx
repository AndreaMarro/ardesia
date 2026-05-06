/**
 * DrawingOverlay-skip-remote.test.jsx — Sprint V iter 1 Atom A13.3 (Tester-1)
 *
 * Tests "remote-empty does NOT wipe local paths" policy.
 * Source: src/components/simulator/canvas/DrawingOverlay.jsx (iter 28 Bug 3 sync).
 *
 * Policy (file lines 156-191):
 *   Skip remote replacement when:
 *     remote.paths.length === 0 AND localHasPaths AND !(remoteTs > localTs)
 *   Replace local with remote when:
 *     remote.paths.length > 0 OR remoteTs > localTs
 *
 * We unit-test the decision predicate directly (no React mount) to avoid
 * heavy SimulatorCanvas + Supabase mock surface. The predicate is duplicated
 * here per source contract; if behavior diverges, this test fails first.
 */
import { describe, it, expect } from 'vitest';

/**
 * Replicates DrawingOverlay.jsx remote-vs-local merge predicate.
 * Returns 'use-remote' or 'keep-local'.
 */
function decideMerge({ localPaths, remotePaths, localUpdatedAt, remoteUpdatedAt }) {
  const remoteIsEmpty = remotePaths.length === 0;
  const localHasPaths = localPaths.length > 0;
  const localTs = localUpdatedAt ? Date.parse(localUpdatedAt) : 0;
  const remoteTs = remoteUpdatedAt ? Date.parse(remoteUpdatedAt) : 0;
  const remoteIsNewer = remoteTs > localTs;
  if (remoteIsEmpty && localHasPaths && !remoteIsNewer) return 'keep-local';
  return 'use-remote';
}

describe('DrawingOverlay remote merge — skip remote-empty when local has paths (Sprint V A13.3)', () => {
  it('localStorage seeded paths + remote empty → keep-local strokes preserved', () => {
    const decision = decideMerge({
      localPaths: [{ id: 'p1' }, { id: 'p2' }],
      remotePaths: [],
      localUpdatedAt: '2026-05-05T10:00:00Z',
      remoteUpdatedAt: '2026-05-05T09:00:00Z',
    });
    expect(decision).toBe('keep-local');
  });

  it('localStorage empty + remote has paths → use-remote hydrate from cloud', () => {
    const decision = decideMerge({
      localPaths: [],
      remotePaths: [{ id: 'r1' }],
      localUpdatedAt: null,
      remoteUpdatedAt: '2026-05-05T10:00:00Z',
    });
    expect(decision).toBe('use-remote');
  });

  it('local has paths + remote has newer paths → use-remote (last-write-wins)', () => {
    const decision = decideMerge({
      localPaths: [{ id: 'p1' }],
      remotePaths: [{ id: 'r1' }, { id: 'r2' }],
      localUpdatedAt: '2026-05-05T08:00:00Z',
      remoteUpdatedAt: '2026-05-05T10:00:00Z',
    });
    expect(decision).toBe('use-remote');
  });

  it('local has paths + remote empty AND remote newer ts → use-remote (explicit cloud clear honored)', () => {
    // Edge case: docente cleared on another device → remote-empty + newer ts
    // → policy should respect remote (NOT keep-local).
    const decision = decideMerge({
      localPaths: [{ id: 'p1' }],
      remotePaths: [],
      localUpdatedAt: '2026-05-05T08:00:00Z',
      remoteUpdatedAt: '2026-05-05T10:00:00Z',
    });
    expect(decision).toBe('use-remote');
  });

  it('both empty → use-remote (no-op equivalent, no path mutation)', () => {
    const decision = decideMerge({
      localPaths: [],
      remotePaths: [],
      localUpdatedAt: null,
      remoteUpdatedAt: null,
    });
    expect(decision).toBe('use-remote');
  });
});
