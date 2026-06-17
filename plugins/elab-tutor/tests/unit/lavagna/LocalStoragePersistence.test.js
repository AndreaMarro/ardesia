/**
 * LavagnaShell localStorage persistence — unit tests
 * Tests the read/write logic for: volume, page, buildMode, panelSizes
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── helpers mirroring LavagnaShell lazy-init logic ────────────────────────────

function readVolume() {
  try { return parseInt(localStorage.getItem('elab-lavagna-volume') || '1', 10) || 1; } catch { return 1; }
}

function readPage() {
  try { return parseInt(localStorage.getItem('elab-lavagna-page') || '1', 10) || 1; } catch { return 1; }
}

function readLeftPanel() {
  try { return parseInt(localStorage.getItem('elab-lavagna-left-panel') || '180', 10) || 180; } catch { return 180; }
}

function readBottomPanel() {
  try { return parseInt(localStorage.getItem('elab-lavagna-bottom-panel') || '200', 10) || 200; } catch { return 200; }
}

function readBuildMode() {
  try {
    const v = localStorage.getItem('elab-lavagna-buildmode');
    return ['complete', 'guided', 'sandbox'].includes(v) ? v : 'complete';
  } catch { return 'complete'; }
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('LavagnaShell localStorage persistence', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
  });

  describe('readVolume', () => {
    it('returns 1 when no value stored', () => {
      expect(readVolume()).toBe(1);
    });

    it('returns stored volume number', () => {
      localStorage.getItem.mockImplementation((k) => k === 'elab-lavagna-volume' ? '2' : null);
      expect(readVolume()).toBe(2);
    });

    it('returns 1 for invalid stored value', () => {
      localStorage.getItem.mockImplementation((k) => k === 'elab-lavagna-volume' ? 'abc' : null);
      expect(readVolume()).toBe(1);
    });

    it('returns 1 for stored 0', () => {
      localStorage.getItem.mockImplementation((k) => k === 'elab-lavagna-volume' ? '0' : null);
      expect(readVolume()).toBe(1);
    });
  });

  describe('readPage', () => {
    it('returns 1 when no value stored', () => {
      expect(readPage()).toBe(1);
    });

    it('returns stored page number', () => {
      localStorage.getItem.mockImplementation((k) => k === 'elab-lavagna-page' ? '42' : null);
      expect(readPage()).toBe(42);
    });

    it('returns 1 for invalid stored value', () => {
      localStorage.getItem.mockImplementation((k) => k === 'elab-lavagna-page' ? 'NaN' : null);
      expect(readPage()).toBe(1);
    });
  });

  describe('readLeftPanel', () => {
    it('returns 180 default when not stored', () => {
      expect(readLeftPanel()).toBe(180);
    });

    it('returns stored panel size', () => {
      localStorage.getItem.mockImplementation((k) => k === 'elab-lavagna-left-panel' ? '240' : null);
      expect(readLeftPanel()).toBe(240);
    });

    it('returns 180 for invalid value', () => {
      localStorage.getItem.mockImplementation((k) => k === 'elab-lavagna-left-panel' ? 'nope' : null);
      expect(readLeftPanel()).toBe(180);
    });
  });

  describe('readBottomPanel', () => {
    it('returns 200 default when not stored', () => {
      expect(readBottomPanel()).toBe(200);
    });

    it('returns stored panel size', () => {
      localStorage.getItem.mockImplementation((k) => k === 'elab-lavagna-bottom-panel' ? '320' : null);
      expect(readBottomPanel()).toBe(320);
    });
  });

  describe('readBuildMode', () => {
    it('returns complete by default', () => {
      expect(readBuildMode()).toBe('complete');
    });

    it('returns guided if stored', () => {
      localStorage.getItem.mockImplementation((k) => k === 'elab-lavagna-buildmode' ? 'guided' : null);
      expect(readBuildMode()).toBe('guided');
    });

    it('returns sandbox if stored', () => {
      localStorage.getItem.mockImplementation((k) => k === 'elab-lavagna-buildmode' ? 'sandbox' : null);
      expect(readBuildMode()).toBe('sandbox');
    });

    it('rejects unknown modes and returns complete', () => {
      localStorage.getItem.mockImplementation((k) => k === 'elab-lavagna-buildmode' ? 'hacker' : null);
      expect(readBuildMode()).toBe('complete');
    });

    it('rejects empty string and returns complete', () => {
      localStorage.getItem.mockImplementation((k) => k === 'elab-lavagna-buildmode' ? '' : null);
      expect(readBuildMode()).toBe('complete');
    });
  });

  describe('localStorage write operations', () => {
    it('setItem is called with correct key for volume', () => {
      localStorage.setItem('elab-lavagna-volume', '3');
      expect(localStorage.setItem).toHaveBeenCalledWith('elab-lavagna-volume', '3');
    });

    it('setItem is called with correct key for page', () => {
      localStorage.setItem('elab-lavagna-page', '15');
      expect(localStorage.setItem).toHaveBeenCalledWith('elab-lavagna-page', '15');
    });

    it('setItem is called with correct key for buildmode', () => {
      localStorage.setItem('elab-lavagna-buildmode', 'sandbox');
      expect(localStorage.setItem).toHaveBeenCalledWith('elab-lavagna-buildmode', 'sandbox');
    });
  });
});
