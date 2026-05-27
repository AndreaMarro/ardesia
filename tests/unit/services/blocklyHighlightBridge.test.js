/**
 * tests/unit/services/blocklyHighlightBridge.test.js
 *
 * Wave 2 X.3b Impl-F atom (Option C BuildModeGuide).
 *
 * Tests for blocklyHighlightBridge.js — resolves block IDs from the live
 * Blockly workspace + parses/emits [AZIONE:highlight:block_id] tag payloads
 * that BuildModeGuide.jsx consumes when wiring UNLIM chat into passo-passo.
 *
 * Andrea Marro — Wave 2b iter X.3b — feedback_passo_passo_regression_06may2026
 * carryover close (BuildModeGuide legacy not wired, activeLessonId hardcoded,
 * LessonReader vs BuildModeGuide routing wrong).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  parseHighlightActionTags,
  resolveBlockIdsFromWorkspace,
  emitHighlightAction,
  applyHighlightTemplate,
} from '../../../src/services/blocklyHighlightBridge.js';

// ── Workspace harness ──────────────────────────────────────────
// Mirrors src/features/unlimScreenAgent/actions/utils.ts BlocklyWorkspace
// shape: getBlockById(id) -> { select } | null.

function makeFakeWorkspace(registeredIds = []) {
  const calls = { select: [] };
  const blocks = new Map();
  registeredIds.forEach((id) => {
    blocks.set(id, {
      id,
      select: vi.fn(() => { calls.select.push(id); }),
    });
  });
  return {
    workspace: {
      getBlockById(id) {
        return blocks.get(id) || null;
      },
      getAllBlocks() {
        return Array.from(blocks.values());
      },
    },
    calls,
  };
}

beforeEach(() => {
  // reset window globals between tests
  if (typeof window !== 'undefined') {
    delete window.__ELAB_BLOCKLY_WORKSPACE;
    delete window.Blockly;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('parseHighlightActionTags', () => {
  it('extracts block IDs from a single AZIONE:highlight:<id> tag', () => {
    const text = 'Ragazzi, guardate questo blocco [AZIONE:highlight:arduino_pin_mode_1]';
    const tags = parseHighlightActionTags(text);
    expect(tags).toEqual(['arduino_pin_mode_1']);
  });

  it('extracts multiple block IDs from comma-separated highlight tag', () => {
    const text = '[AZIONE:highlight:arduino_pin_mode_1,arduino_digital_write_1]';
    const tags = parseHighlightActionTags(text);
    expect(tags).toEqual(['arduino_pin_mode_1', 'arduino_digital_write_1']);
  });

  it('extracts block IDs from multiple sibling highlight tags', () => {
    const text = 'Step uno [AZIONE:highlight:a1] e poi [AZIONE:highlight:b2]';
    const tags = parseHighlightActionTags(text);
    expect(tags).toEqual(['a1', 'b2']);
  });

  it('returns an empty array on text without any highlight tag', () => {
    const text = 'Ragazzi, leggete Vol3 pag 47.';
    const tags = parseHighlightActionTags(text);
    expect(tags).toEqual([]);
  });

  it('is case-insensitive on the AZIONE keyword', () => {
    const text = '[azione:highlight:lowercase_id]';
    const tags = parseHighlightActionTags(text);
    expect(tags).toEqual(['lowercase_id']);
  });

  it('ignores non-highlight AZIONE tags (e.g. play, loadexp)', () => {
    const text = '[AZIONE:play] [AZIONE:loadexp:v3-cap6-esp4] [AZIONE:highlight:keep_me]';
    const tags = parseHighlightActionTags(text);
    expect(tags).toEqual(['keep_me']);
  });

  it('returns empty array on null or non-string input', () => {
    expect(parseHighlightActionTags(null)).toEqual([]);
    expect(parseHighlightActionTags(undefined)).toEqual([]);
    expect(parseHighlightActionTags(42)).toEqual([]);
  });

  it('trims whitespace inside block IDs', () => {
    const text = '[AZIONE:highlight:  spaced_id  ]';
    const tags = parseHighlightActionTags(text);
    expect(tags).toEqual(['spaced_id']);
  });
});

describe('resolveBlockIdsFromWorkspace', () => {
  it('returns only IDs that exist in the workspace', () => {
    const { workspace } = makeFakeWorkspace(['arduino_pin_mode_1', 'arduino_digital_write_1']);
    const resolved = resolveBlockIdsFromWorkspace(
      ['arduino_pin_mode_1', 'arduino_does_not_exist'],
      workspace,
    );
    expect(resolved).toEqual(['arduino_pin_mode_1']);
  });

  it('returns empty array if workspace is null', () => {
    expect(resolveBlockIdsFromWorkspace(['anything'], null)).toEqual([]);
  });

  it('returns empty array if requested IDs is empty', () => {
    const { workspace } = makeFakeWorkspace(['arduino_pin_mode_1']);
    expect(resolveBlockIdsFromWorkspace([], workspace)).toEqual([]);
  });

  it('deduplicates repeated IDs in the request', () => {
    const { workspace } = makeFakeWorkspace(['arduino_delay_1']);
    const resolved = resolveBlockIdsFromWorkspace(
      ['arduino_delay_1', 'arduino_delay_1'],
      workspace,
    );
    expect(resolved).toEqual(['arduino_delay_1']);
  });

  it('falls back to the global Blockly workspace if no explicit ws is provided', () => {
    const { workspace } = makeFakeWorkspace(['arduino_pin_mode_1']);
    window.__ELAB_BLOCKLY_WORKSPACE = workspace;
    const resolved = resolveBlockIdsFromWorkspace(['arduino_pin_mode_1']);
    expect(resolved).toEqual(['arduino_pin_mode_1']);
  });
});

describe('emitHighlightAction', () => {
  it('calls block.select() on every resolved block ID', () => {
    const { workspace, calls } = makeFakeWorkspace(['arduino_pin_mode_1', 'arduino_delay_1']);
    const result = emitHighlightAction(
      ['arduino_pin_mode_1', 'arduino_delay_1'],
      workspace,
    );
    expect(result.highlighted).toEqual(['arduino_pin_mode_1', 'arduino_delay_1']);
    expect(calls.select).toEqual(['arduino_pin_mode_1', 'arduino_delay_1']);
  });

  it('does NOT call select on unresolved IDs', () => {
    const { workspace, calls } = makeFakeWorkspace(['arduino_pin_mode_1']);
    const result = emitHighlightAction(
      ['arduino_pin_mode_1', 'phantom_id'],
      workspace,
    );
    expect(result.highlighted).toEqual(['arduino_pin_mode_1']);
    expect(result.skipped).toEqual(['phantom_id']);
    expect(calls.select).toEqual(['arduino_pin_mode_1']);
  });

  it('returns empty result on null workspace (no throw)', () => {
    const result = emitHighlightAction(['x'], null);
    expect(result).toEqual({ highlighted: [], skipped: ['x'] });
  });

  it('handles missing block.select gracefully', () => {
    const ws = {
      getBlockById: () => ({ id: 'x' }), // no .select
    };
    const result = emitHighlightAction(['x'], ws);
    expect(result.highlighted).toEqual([]);
    expect(result.skipped).toEqual(['x']);
  });
});

describe('applyHighlightTemplate (lesson-path unlim_template integration)', () => {
  it('extracts highlight_block_ids and routes through emitHighlightAction', () => {
    const { workspace, calls } = makeFakeWorkspace(['arduino_pin_mode_1']);
    const template = {
      highlight_block_ids: ['arduino_pin_mode_1'],
      explanation: 'Ragazzi, controlliamo il pin (Vol3 pag 47).',
    };
    const result = applyHighlightTemplate(template, workspace);
    expect(result.highlighted).toEqual(['arduino_pin_mode_1']);
    expect(result.explanation).toBe('Ragazzi, controlliamo il pin (Vol3 pag 47).');
    expect(calls.select).toEqual(['arduino_pin_mode_1']);
  });

  it('returns empty result on null or missing template', () => {
    const { workspace } = makeFakeWorkspace([]);
    expect(applyHighlightTemplate(null, workspace)).toEqual({
      highlighted: [],
      skipped: [],
      explanation: '',
    });
    expect(applyHighlightTemplate({}, workspace)).toEqual({
      highlighted: [],
      skipped: [],
      explanation: '',
    });
  });

  it('preserves explanation even when highlight fails (e.g. block not in workspace)', () => {
    const { workspace } = makeFakeWorkspace([]); // empty workspace
    const template = {
      highlight_block_ids: ['arduino_pin_mode_1'],
      explanation: 'Ragazzi, vediamo (Vol3 pag 30).',
    };
    const result = applyHighlightTemplate(template, workspace);
    expect(result.highlighted).toEqual([]);
    expect(result.skipped).toEqual(['arduino_pin_mode_1']);
    expect(result.explanation).toBe('Ragazzi, vediamo (Vol3 pag 30).');
  });
});
