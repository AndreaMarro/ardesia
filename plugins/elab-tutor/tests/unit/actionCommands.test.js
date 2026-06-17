/**
 * actionCommands.test.js — Comprehensive tests for ALL AZIONE commands
 * Tests the executeActionTags function from useGalileoChat.js
 *
 * Since executeActionTags is not exported, we replicate the exact parsing logic
 * (regex + switch) and test each of the 37+ commands against a mock __ELAB_API.
 *
 * (c) Andrea Marro — 15/04/2026
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Replicate executeActionTags exactly as in useGalileoChat.js ──
// This is a faithful copy of the function for isolated unit testing.
function executeActionTags(rawResponse) {
  const api = typeof window !== 'undefined' && window.__ELAB_API;
  if (!api) return [];

  const executed = [];
  const re = /\[azione:([^\]]+)\]/gi;
  let match;

  while ((match = re.exec(rawResponse)) !== null) {
    const full = match[1].trim();
    const parts = full.split(':').map(s => s.trim());
    const cmd = parts[0].toLowerCase();

    try {
      switch (cmd) {
        case 'play': api.play?.(); executed.push('play'); break;
        case 'pause': api.pause?.(); executed.push('pause'); break;
        case 'reset': api.reset?.(); executed.push('reset'); break;
        case 'highlight':
          if (parts[1] && api.unlim?.highlightComponent) {
            api.unlim.highlightComponent(parts[1].split(',').map(s => s.trim()));
            setTimeout(() => api.unlim?.clearHighlights?.(), 4000);
            executed.push('highlight:' + parts[1]);
          }
          break;
        case 'loadexp':
          if (parts[1] && api.loadExperiment) {
            api.loadExperiment(parts[1]);
            executed.push('loadexp:' + parts[1]);
          }
          break;
        case 'addcomponent':
          if (parts[1] && api.addComponent) {
            const x = parseInt(parts[2], 10) || 200;
            const y = parseInt(parts[3], 10) || 150;
            api.addComponent(parts[1], { x, y });
            executed.push('addcomponent:' + parts[1]);
          }
          break;
        case 'removecomponent':
          if (parts[1] && api.removeComponent) {
            api.removeComponent(parts[1]);
            executed.push('removecomponent:' + parts[1]);
          }
          break;
        case 'addwire':
          if (parts.length >= 5 && api.addWire) {
            api.addWire(parts[1], parts[2], parts[3], parts[4]);
            executed.push('addwire');
          }
          break;
        case 'compile': api.compile?.(); executed.push('compile'); break;
        case 'undo': api.undo?.(); executed.push('undo'); break;
        case 'redo': api.redo?.(); executed.push('redo'); break;
        case 'interact':
          if (parts[1] && parts[2] && api.interact) {
            api.interact(parts[1], parts[2], parts[3]);
            executed.push('interact:' + parts[1] + ':' + parts[2]);
          }
          break;
        case 'clearall': api.clearAll?.(); executed.push('clearall'); break;
        case 'setvalue':
          if (parts[1] && parts[2] && parts[3] !== undefined && api.setComponentValue) {
            api.setComponentValue(parts[1], parts[2], parts[3]);
            executed.push('setvalue:' + parts[1] + ':' + parts[2] + ':' + parts[3]);
          }
          break;
        case 'screenshot':
          if (api.captureScreenshot) {
            api.captureScreenshot();
            executed.push('screenshot');
          }
          break;
        case 'describe':
          if (api.getCircuitDescription) {
            api.getCircuitDescription();
            executed.push('describe');
          }
          break;
        case 'movecomponent':
          if (parts[1] && api.moveComponent) {
            api.moveComponent(parts[1], parseInt(parts[2], 10) || 200, parseInt(parts[3], 10) || 150);
            executed.push('movecomponent:' + parts[1]);
          }
          break;
        case 'removewire':
          if (parts[1] !== undefined && api.removeWire) {
            api.removeWire(parseInt(parts[1], 10));
            executed.push('removewire:' + parts[1]);
          }
          break;
        case 'measure':
          if (parts[1]) {
            executed.push('measure:' + parts[1]);
          }
          break;
        case 'diagnose':
          executed.push('diagnose');
          break;
        case 'openeditor':
          api.showEditor?.();
          executed.push('openeditor');
          break;
        case 'closeeditor':
          api.hideEditor?.();
          executed.push('closeeditor');
          break;
        case 'switcheditor':
          if (parts[1] && api.setEditorMode) {
            api.setEditorMode(parts[1] === 'scratch' ? 'scratch' : 'arduino');
            executed.push('switcheditor:' + parts[1]);
          }
          break;
        case 'setcode':
          if (parts.slice(1).join(':') && api.setEditorCode) {
            api.setEditorCode(parts.slice(1).join(':'));
            executed.push('setcode');
          }
          break;
        case 'appendcode':
          if (parts.slice(1).join(':') && api.appendEditorCode) {
            api.appendEditorCode(parts.slice(1).join(':'));
            executed.push('appendcode');
          }
          break;
        case 'getcode':
          if (api.getEditorCode) {
            api.getEditorCode();
            executed.push('getcode');
          }
          break;
        case 'resetcode':
          api.resetEditorCode?.();
          executed.push('resetcode');
          break;
        case 'loadblocks':
          if (parts.slice(1).join(':') && api.loadScratchWorkspace) {
            api.loadScratchWorkspace(parts.slice(1).join(':'));
            executed.push('loadblocks');
          }
          break;
        case 'fullscreenscratch':
          api.showEditor?.();
          api.setEditorMode?.('scratch');
          executed.push('fullscreenscratch');
          break;
        case 'exitscratchfullscreen':
          api.hideEditor?.();
          executed.push('exitscratchfullscreen');
          break;
        case 'opentab': {
          const tab = parts[1];
          if (tab) {
            window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab } }));
            executed.push('opentab:' + tab);
          }
          break;
        }
        case 'openvolume': {
          const vol = parseInt(parts[1], 10);
          const pag = parseInt(parts[2], 10);
          if (vol && pag) {
            window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab: 'manuale', volume: vol, page: pag } }));
            executed.push('openvolume:' + vol + ':' + pag);
          }
          break;
        }
        case 'openchat':
          window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab: 'chat' } }));
          executed.push('openchat');
          break;
        case 'closechat':
          window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab: 'simulatore' } }));
          executed.push('closechat');
          break;
        case 'setbuildmode':
          if (parts[1] && api.setBuildMode) {
            const modeMap = { montato: 'complete', passopasso: 'guided', libero: 'sandbox' };
            api.setBuildMode(modeMap[parts[1]] || parts[1]);
            executed.push('setbuildmode:' + parts[1]);
          }
          break;
        case 'nextstep':
          api.nextStep?.();
          executed.push('nextstep');
          break;
        case 'prevstep':
          api.prevStep?.();
          executed.push('prevstep');
          break;
        case 'showbom':
          api.showBom?.();
          executed.push('showbom');
          break;
        case 'listcomponents':
          if (api.getCircuitDescription) {
            api.getCircuitDescription();
            executed.push('listcomponents');
          }
          break;
        case 'getstate':
          if (api.getSimulatorContext) {
            api.getSimulatorContext();
            executed.push('getstate');
          }
          break;
        case 'showserial':
          api.showSerialMonitor?.();
          executed.push('showserial');
          break;
        case 'serialwrite':
          if (parts[1] && api.serialWrite) {
            api.serialWrite(parts.slice(1).join(':'));
            executed.push('serialwrite');
          }
          break;
        case 'highlightpin':
          if (parts[1]) {
            const pins = parts[1].split(',').map(s => s.trim());
            api.highlightPin?.(pins);
            setTimeout(() => api.unlim?.clearHighlights?.(), 4000);
            executed.push('highlightpin:' + parts[1]);
          }
          break;
        case 'quiz':
          if (parts[1]) {
            window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab: 'detective', experimentId: parts[1] } }));
            executed.push('quiz:' + parts[1]);
          }
          break;
        case 'youtube':
          if (parts.slice(1).join(' ')) {
            window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab: 'video', query: parts.slice(1).join(' ') } }));
            executed.push('youtube:' + parts.slice(1).join(' '));
          }
          break;
        case 'createnotebook':
          if (parts.slice(1).join(' ')) {
            window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab: 'taccuini', title: parts.slice(1).join(' ') } }));
            executed.push('createnotebook');
          }
          break;
        default:
          break;
      }
    } catch (err) {
      // Silently catch errors like the real function
    }
  }

  return executed;
}

// ── Helper to build a full mock __ELAB_API ──
function createMockAPI() {
  return {
    play: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    compile: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    clearAll: vi.fn(),
    loadExperiment: vi.fn(),
    addComponent: vi.fn(),
    removeComponent: vi.fn(),
    addWire: vi.fn(),
    removeWire: vi.fn(),
    moveComponent: vi.fn(),
    interact: vi.fn(),
    setComponentValue: vi.fn(),
    captureScreenshot: vi.fn(),
    getCircuitDescription: vi.fn(() => 'LED + Resistor circuit'),
    getSimulatorContext: vi.fn(() => ({ components: 3 })),
    showEditor: vi.fn(),
    hideEditor: vi.fn(),
    setEditorMode: vi.fn(),
    setEditorCode: vi.fn(),
    appendEditorCode: vi.fn(),
    getEditorCode: vi.fn(() => 'void setup() {}'),
    resetEditorCode: vi.fn(),
    loadScratchWorkspace: vi.fn(),
    setBuildMode: vi.fn(),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    showBom: vi.fn(),
    showSerialMonitor: vi.fn(),
    serialWrite: vi.fn(),
    highlightPin: vi.fn(),
    unlim: {
      highlightComponent: vi.fn(),
      clearHighlights: vi.fn(),
    },
  };
}

// ══════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════

describe('executeActionTags — AZIONE command parser', () => {
  let mockAPI;
  let dispatchSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    mockAPI = createMockAPI();
    window.__ELAB_API = mockAPI;
    dispatchSpy = vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    vi.useRealTimers();
    delete window.__ELAB_API;
    dispatchSpy.mockRestore();
  });

  // ─────────────────────────────────────
  // 0. No API / No tags
  // ─────────────────────────────────────
  describe('edge cases', () => {
    it('returns empty array when __ELAB_API is not set', () => {
      delete window.__ELAB_API;
      const result = executeActionTags('[azione:play]');
      expect(result).toEqual([]);
    });

    it('returns empty array when input has no AZIONE tags', () => {
      const result = executeActionTags('Ciao, come stai? Nessun comando qui.');
      expect(result).toEqual([]);
    });

    it('does not crash on unknown command', () => {
      const result = executeActionTags('[azione:foobar]');
      expect(result).toEqual([]);
    });

    it('handles malformed tags gracefully', () => {
      const result = executeActionTags('[azione:]');
      expect(result).toEqual([]);
    });

    it('is case-insensitive for the AZIONE tag', () => {
      const result = executeActionTags('[AZIONE:play]');
      expect(result).toEqual(['play']);
      expect(mockAPI.play).toHaveBeenCalledOnce();
    });

    it('handles mixed case [Azione:Play]', () => {
      const result = executeActionTags('[Azione:Play]');
      expect(result).toEqual(['play']);
    });
  });

  // ─────────────────────────────────────
  // 1. play
  // ─────────────────────────────────────
  describe('play', () => {
    it('calls api.play() and returns ["play"]', () => {
      const result = executeActionTags('[azione:play]');
      expect(result).toEqual(['play']);
      expect(mockAPI.play).toHaveBeenCalledOnce();
    });

    it('does not crash if api.play is undefined (optional chaining)', () => {
      delete mockAPI.play;
      const result = executeActionTags('[azione:play]');
      expect(result).toEqual(['play']);
    });
  });

  // ─────────────────────────────────────
  // 2. pause
  // ─────────────────────────────────────
  describe('pause', () => {
    it('calls api.pause()', () => {
      const result = executeActionTags('[azione:pause]');
      expect(result).toEqual(['pause']);
      expect(mockAPI.pause).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 3. reset
  // ─────────────────────────────────────
  describe('reset', () => {
    it('calls api.reset()', () => {
      const result = executeActionTags('[azione:reset]');
      expect(result).toEqual(['reset']);
      expect(mockAPI.reset).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 4. highlight
  // ─────────────────────────────────────
  describe('highlight', () => {
    it('highlights a single component', () => {
      const result = executeActionTags('[azione:highlight:led1]');
      expect(result).toEqual(['highlight:led1']);
      expect(mockAPI.unlim.highlightComponent).toHaveBeenCalledWith(['led1']);
    });

    it('highlights multiple components (comma-separated)', () => {
      const result = executeActionTags('[azione:highlight:led1,r1,buzzer2]');
      expect(result).toEqual(['highlight:led1,r1,buzzer2']);
      expect(mockAPI.unlim.highlightComponent).toHaveBeenCalledWith(['led1', 'r1', 'buzzer2']);
    });

    it('clears highlights after 4s timeout', () => {
      executeActionTags('[azione:highlight:led1]');
      expect(mockAPI.unlim.clearHighlights).not.toHaveBeenCalled();
      vi.advanceTimersByTime(4000);
      expect(mockAPI.unlim.clearHighlights).toHaveBeenCalledOnce();
    });

    it('does nothing if no component ID provided', () => {
      const result = executeActionTags('[azione:highlight]');
      expect(result).toEqual([]);
      expect(mockAPI.unlim.highlightComponent).not.toHaveBeenCalled();
    });

    it('does nothing if unlim.highlightComponent is missing', () => {
      mockAPI.unlim = {};
      const result = executeActionTags('[azione:highlight:led1]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 5. loadexp
  // ─────────────────────────────────────
  describe('loadexp', () => {
    it('loads experiment by ID', () => {
      const result = executeActionTags('[azione:loadexp:exp-v1-01]');
      expect(result).toEqual(['loadexp:exp-v1-01']);
      expect(mockAPI.loadExperiment).toHaveBeenCalledWith('exp-v1-01');
    });

    it('does nothing without experiment ID', () => {
      const result = executeActionTags('[azione:loadexp]');
      expect(result).toEqual([]);
      expect(mockAPI.loadExperiment).not.toHaveBeenCalled();
    });

    it('does nothing if loadExperiment is not on API', () => {
      delete mockAPI.loadExperiment;
      const result = executeActionTags('[azione:loadexp:exp-v1-01]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 6. addcomponent
  // ─────────────────────────────────────
  describe('addcomponent', () => {
    it('adds component at specified coordinates', () => {
      const result = executeActionTags('[azione:addcomponent:led:300:250]');
      expect(result).toEqual(['addcomponent:led']);
      expect(mockAPI.addComponent).toHaveBeenCalledWith('led', { x: 300, y: 250 });
    });

    it('uses default coordinates (200, 150) if not provided', () => {
      const result = executeActionTags('[azione:addcomponent:resistor]');
      expect(result).toEqual(['addcomponent:resistor']);
      expect(mockAPI.addComponent).toHaveBeenCalledWith('resistor', { x: 200, y: 150 });
    });

    it('uses default y if only x is provided', () => {
      const result = executeActionTags('[azione:addcomponent:buzzer:400]');
      expect(result).toEqual(['addcomponent:buzzer']);
      expect(mockAPI.addComponent).toHaveBeenCalledWith('buzzer', { x: 400, y: 150 });
    });

    it('does nothing without component type', () => {
      const result = executeActionTags('[azione:addcomponent]');
      expect(result).toEqual([]);
    });

    it('handles non-numeric coordinates with default fallback', () => {
      const result = executeActionTags('[azione:addcomponent:led:abc:def]');
      expect(result).toEqual(['addcomponent:led']);
      expect(mockAPI.addComponent).toHaveBeenCalledWith('led', { x: 200, y: 150 });
    });
  });

  // ─────────────────────────────────────
  // 7. removecomponent
  // ─────────────────────────────────────
  describe('removecomponent', () => {
    it('removes component by ID', () => {
      const result = executeActionTags('[azione:removecomponent:led1]');
      expect(result).toEqual(['removecomponent:led1']);
      expect(mockAPI.removeComponent).toHaveBeenCalledWith('led1');
    });

    it('does nothing without ID', () => {
      const result = executeActionTags('[azione:removecomponent]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 8. addwire
  // ─────────────────────────────────────
  describe('addwire', () => {
    it('adds wire with 4 connection points', () => {
      const result = executeActionTags('[azione:addwire:led1:anode:nano:D13]');
      expect(result).toEqual(['addwire']);
      expect(mockAPI.addWire).toHaveBeenCalledWith('led1', 'anode', 'nano', 'D13');
    });

    it('does nothing with fewer than 4 parts', () => {
      const result = executeActionTags('[azione:addwire:led1:anode:nano]');
      expect(result).toEqual([]);
      expect(mockAPI.addWire).not.toHaveBeenCalled();
    });

    it('does nothing with only 2 parts', () => {
      const result = executeActionTags('[azione:addwire:led1]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 9. compile
  // ─────────────────────────────────────
  describe('compile', () => {
    it('calls api.compile()', () => {
      const result = executeActionTags('[azione:compile]');
      expect(result).toEqual(['compile']);
      expect(mockAPI.compile).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 10. undo
  // ─────────────────────────────────────
  describe('undo', () => {
    it('calls api.undo()', () => {
      const result = executeActionTags('[azione:undo]');
      expect(result).toEqual(['undo']);
      expect(mockAPI.undo).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 11. redo
  // ─────────────────────────────────────
  describe('redo', () => {
    it('calls api.redo()', () => {
      const result = executeActionTags('[azione:redo]');
      expect(result).toEqual(['redo']);
      expect(mockAPI.redo).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 12. interact
  // ─────────────────────────────────────
  describe('interact', () => {
    it('interacts with component using action and optional value', () => {
      const result = executeActionTags('[azione:interact:btn1:press:toggle]');
      expect(result).toEqual(['interact:btn1:press']);
      expect(mockAPI.interact).toHaveBeenCalledWith('btn1', 'press', 'toggle');
    });

    it('passes undefined for third arg when not provided', () => {
      const result = executeActionTags('[azione:interact:btn1:press]');
      expect(result).toEqual(['interact:btn1:press']);
      expect(mockAPI.interact).toHaveBeenCalledWith('btn1', 'press', undefined);
    });

    it('does nothing without both component and action', () => {
      expect(executeActionTags('[azione:interact:btn1]')).toEqual([]);
      expect(executeActionTags('[azione:interact]')).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 13. clearall
  // ─────────────────────────────────────
  describe('clearall', () => {
    it('calls api.clearAll()', () => {
      const result = executeActionTags('[azione:clearall]');
      expect(result).toEqual(['clearall']);
      expect(mockAPI.clearAll).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 14. setvalue
  // ─────────────────────────────────────
  describe('setvalue', () => {
    it('sets component value with 3 args', () => {
      const result = executeActionTags('[azione:setvalue:pot1:resistance:500]');
      expect(result).toEqual(['setvalue:pot1:resistance:500']);
      expect(mockAPI.setComponentValue).toHaveBeenCalledWith('pot1', 'resistance', '500');
    });

    it('does nothing with fewer than 3 value args', () => {
      expect(executeActionTags('[azione:setvalue:pot1:resistance]')).toEqual([]);
      expect(executeActionTags('[azione:setvalue:pot1]')).toEqual([]);
      expect(executeActionTags('[azione:setvalue]')).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 15. screenshot
  // ─────────────────────────────────────
  describe('screenshot', () => {
    it('calls api.captureScreenshot()', () => {
      const result = executeActionTags('[azione:screenshot]');
      expect(result).toEqual(['screenshot']);
      expect(mockAPI.captureScreenshot).toHaveBeenCalledOnce();
    });

    it('does nothing if captureScreenshot is missing', () => {
      delete mockAPI.captureScreenshot;
      const result = executeActionTags('[azione:screenshot]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 16. describe
  // ─────────────────────────────────────
  describe('describe', () => {
    it('calls api.getCircuitDescription()', () => {
      const result = executeActionTags('[azione:describe]');
      expect(result).toEqual(['describe']);
      expect(mockAPI.getCircuitDescription).toHaveBeenCalledOnce();
    });

    it('does nothing if getCircuitDescription is missing', () => {
      delete mockAPI.getCircuitDescription;
      const result = executeActionTags('[azione:describe]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 17. movecomponent
  // ─────────────────────────────────────
  describe('movecomponent', () => {
    it('moves component to specified coordinates', () => {
      const result = executeActionTags('[azione:movecomponent:led1:400:300]');
      expect(result).toEqual(['movecomponent:led1']);
      expect(mockAPI.moveComponent).toHaveBeenCalledWith('led1', 400, 300);
    });

    it('uses default coordinates if not provided', () => {
      const result = executeActionTags('[azione:movecomponent:r1]');
      expect(result).toEqual(['movecomponent:r1']);
      expect(mockAPI.moveComponent).toHaveBeenCalledWith('r1', 200, 150);
    });

    it('does nothing without component ID', () => {
      const result = executeActionTags('[azione:movecomponent]');
      expect(result).toEqual([]);
    });

    it('does nothing if moveComponent is missing', () => {
      delete mockAPI.moveComponent;
      const result = executeActionTags('[azione:movecomponent:led1:400:300]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 18. removewire
  // ─────────────────────────────────────
  describe('removewire', () => {
    it('removes wire by index', () => {
      const result = executeActionTags('[azione:removewire:3]');
      expect(result).toEqual(['removewire:3']);
      expect(mockAPI.removeWire).toHaveBeenCalledWith(3);
    });

    it('removes wire index 0', () => {
      const result = executeActionTags('[azione:removewire:0]');
      expect(result).toEqual(['removewire:0']);
      expect(mockAPI.removeWire).toHaveBeenCalledWith(0);
    });

    it('does nothing without wire index', () => {
      const result = executeActionTags('[azione:removewire]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 19. measure
  // ─────────────────────────────────────
  describe('measure', () => {
    it('logs measure request and returns result', () => {
      const result = executeActionTags('[azione:measure:voltage]');
      expect(result).toEqual(['measure:voltage']);
    });

    it('does nothing without argument', () => {
      const result = executeActionTags('[azione:measure]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 20. diagnose
  // ─────────────────────────────────────
  describe('diagnose', () => {
    it('logs diagnose and returns result', () => {
      const result = executeActionTags('[azione:diagnose]');
      expect(result).toEqual(['diagnose']);
    });
  });

  // ─────────────────────────────────────
  // 21. openeditor
  // ─────────────────────────────────────
  describe('openeditor', () => {
    it('calls api.showEditor()', () => {
      const result = executeActionTags('[azione:openeditor]');
      expect(result).toEqual(['openeditor']);
      expect(mockAPI.showEditor).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 22. closeeditor
  // ─────────────────────────────────────
  describe('closeeditor', () => {
    it('calls api.hideEditor()', () => {
      const result = executeActionTags('[azione:closeeditor]');
      expect(result).toEqual(['closeeditor']);
      expect(mockAPI.hideEditor).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 23. switcheditor
  // ─────────────────────────────────────
  describe('switcheditor', () => {
    it('switches to scratch mode', () => {
      const result = executeActionTags('[azione:switcheditor:scratch]');
      expect(result).toEqual(['switcheditor:scratch']);
      expect(mockAPI.setEditorMode).toHaveBeenCalledWith('scratch');
    });

    it('switches to arduino mode for any non-scratch value', () => {
      const result = executeActionTags('[azione:switcheditor:arduino]');
      expect(result).toEqual(['switcheditor:arduino']);
      expect(mockAPI.setEditorMode).toHaveBeenCalledWith('arduino');
    });

    it('defaults to arduino for unknown editor types', () => {
      const result = executeActionTags('[azione:switcheditor:python]');
      expect(result).toEqual(['switcheditor:python']);
      expect(mockAPI.setEditorMode).toHaveBeenCalledWith('arduino');
    });

    it('does nothing without mode argument', () => {
      const result = executeActionTags('[azione:switcheditor]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 24. setcode
  // ─────────────────────────────────────
  describe('setcode', () => {
    it('sets editor code (single part)', () => {
      const result = executeActionTags('[azione:setcode:void setup() {}]');
      expect(result).toEqual(['setcode']);
      expect(mockAPI.setEditorCode).toHaveBeenCalledWith('void setup() {}');
    });

    it('joins multi-colon code parts back together', () => {
      const result = executeActionTags('[azione:setcode:Serial.begin(9600):delay(100)]');
      expect(result).toEqual(['setcode']);
      expect(mockAPI.setEditorCode).toHaveBeenCalledWith('Serial.begin(9600):delay(100)');
    });

    it('does nothing with empty code', () => {
      const result = executeActionTags('[azione:setcode]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 25. appendcode
  // ─────────────────────────────────────
  describe('appendcode', () => {
    it('appends code to editor', () => {
      const result = executeActionTags('[azione:appendcode:digitalWrite(13, HIGH)]');
      expect(result).toEqual(['appendcode']);
      expect(mockAPI.appendEditorCode).toHaveBeenCalledWith('digitalWrite(13, HIGH)');
    });

    it('joins multi-colon code parts', () => {
      const result = executeActionTags('[azione:appendcode:a:b:c]');
      expect(result).toEqual(['appendcode']);
      expect(mockAPI.appendEditorCode).toHaveBeenCalledWith('a:b:c');
    });
  });

  // ─────────────────────────────────────
  // 26. getcode
  // ─────────────────────────────────────
  describe('getcode', () => {
    it('calls api.getEditorCode()', () => {
      const result = executeActionTags('[azione:getcode]');
      expect(result).toEqual(['getcode']);
      expect(mockAPI.getEditorCode).toHaveBeenCalledOnce();
    });

    it('does nothing if getEditorCode is missing', () => {
      delete mockAPI.getEditorCode;
      const result = executeActionTags('[azione:getcode]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 27. resetcode
  // ─────────────────────────────────────
  describe('resetcode', () => {
    it('calls api.resetEditorCode()', () => {
      const result = executeActionTags('[azione:resetcode]');
      expect(result).toEqual(['resetcode']);
      expect(mockAPI.resetEditorCode).toHaveBeenCalledOnce();
    });

    it('does not crash if resetEditorCode is undefined', () => {
      delete mockAPI.resetEditorCode;
      const result = executeActionTags('[azione:resetcode]');
      expect(result).toEqual(['resetcode']);
    });
  });

  // ─────────────────────────────────────
  // 28. loadblocks
  // ─────────────────────────────────────
  describe('loadblocks', () => {
    it('loads Scratch workspace XML', () => {
      const result = executeActionTags('[azione:loadblocks:<xml>blocks</xml>]');
      expect(result).toEqual(['loadblocks']);
      expect(mockAPI.loadScratchWorkspace).toHaveBeenCalledWith('<xml>blocks</xml>');
    });

    it('does nothing with empty blocks', () => {
      const result = executeActionTags('[azione:loadblocks]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 29. fullscreenscratch
  // ─────────────────────────────────────
  describe('fullscreenscratch', () => {
    it('calls showEditor + setEditorMode(scratch)', () => {
      const result = executeActionTags('[azione:fullscreenscratch]');
      expect(result).toEqual(['fullscreenscratch']);
      expect(mockAPI.showEditor).toHaveBeenCalledOnce();
      expect(mockAPI.setEditorMode).toHaveBeenCalledWith('scratch');
    });
  });

  // ─────────────────────────────────────
  // 30. exitscratchfullscreen
  // ─────────────────────────────────────
  describe('exitscratchfullscreen', () => {
    it('calls hideEditor', () => {
      const result = executeActionTags('[azione:exitscratchfullscreen]');
      expect(result).toEqual(['exitscratchfullscreen']);
      expect(mockAPI.hideEditor).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 31. opentab
  // ─────────────────────────────────────
  describe('opentab', () => {
    it('dispatches elab-navigate with tab name', () => {
      const result = executeActionTags('[azione:opentab:simulatore]');
      expect(result).toEqual(['opentab:simulatore']);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'elab-navigate',
          detail: { tab: 'simulatore' },
        })
      );
    });

    it('does nothing without tab name', () => {
      const result = executeActionTags('[azione:opentab]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 32. openvolume
  // ─────────────────────────────────────
  describe('openvolume', () => {
    it('dispatches navigate with volume and page', () => {
      const result = executeActionTags('[azione:openvolume:2:45]');
      expect(result).toEqual(['openvolume:2:45']);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'elab-navigate',
          detail: { tab: 'manuale', volume: 2, page: 45 },
        })
      );
    });

    it('does nothing with only volume (no page)', () => {
      const result = executeActionTags('[azione:openvolume:1]');
      expect(result).toEqual([]);
    });

    it('does nothing with non-numeric volume', () => {
      const result = executeActionTags('[azione:openvolume:abc:10]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 33. openchat
  // ─────────────────────────────────────
  describe('openchat', () => {
    it('dispatches navigate to chat tab', () => {
      const result = executeActionTags('[azione:openchat]');
      expect(result).toEqual(['openchat']);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'elab-navigate',
          detail: { tab: 'chat' },
        })
      );
    });
  });

  // ─────────────────────────────────────
  // 34. closechat
  // ─────────────────────────────────────
  describe('closechat', () => {
    it('dispatches navigate to simulatore tab', () => {
      const result = executeActionTags('[azione:closechat]');
      expect(result).toEqual(['closechat']);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'elab-navigate',
          detail: { tab: 'simulatore' },
        })
      );
    });
  });

  // ─────────────────────────────────────
  // 35. setbuildmode
  // ─────────────────────────────────────
  describe('setbuildmode', () => {
    it('maps "montato" to "complete"', () => {
      const result = executeActionTags('[azione:setbuildmode:montato]');
      expect(result).toEqual(['setbuildmode:montato']);
      expect(mockAPI.setBuildMode).toHaveBeenCalledWith('complete');
    });

    it('maps "passopasso" to "guided"', () => {
      const result = executeActionTags('[azione:setbuildmode:passopasso]');
      expect(result).toEqual(['setbuildmode:passopasso']);
      expect(mockAPI.setBuildMode).toHaveBeenCalledWith('guided');
    });

    it('maps "libero" to "sandbox"', () => {
      const result = executeActionTags('[azione:setbuildmode:libero]');
      expect(result).toEqual(['setbuildmode:libero']);
      expect(mockAPI.setBuildMode).toHaveBeenCalledWith('sandbox');
    });

    it('passes through unknown mode values as-is', () => {
      const result = executeActionTags('[azione:setbuildmode:custom]');
      expect(result).toEqual(['setbuildmode:custom']);
      expect(mockAPI.setBuildMode).toHaveBeenCalledWith('custom');
    });

    it('does nothing without mode argument', () => {
      const result = executeActionTags('[azione:setbuildmode]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 36. nextstep
  // ─────────────────────────────────────
  describe('nextstep', () => {
    it('calls api.nextStep()', () => {
      const result = executeActionTags('[azione:nextstep]');
      expect(result).toEqual(['nextstep']);
      expect(mockAPI.nextStep).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 37. prevstep
  // ─────────────────────────────────────
  describe('prevstep', () => {
    it('calls api.prevStep()', () => {
      const result = executeActionTags('[azione:prevstep]');
      expect(result).toEqual(['prevstep']);
      expect(mockAPI.prevStep).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 38. showbom
  // ─────────────────────────────────────
  describe('showbom', () => {
    it('calls api.showBom()', () => {
      const result = executeActionTags('[azione:showbom]');
      expect(result).toEqual(['showbom']);
      expect(mockAPI.showBom).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 39. listcomponents
  // ─────────────────────────────────────
  describe('listcomponents', () => {
    it('calls api.getCircuitDescription()', () => {
      const result = executeActionTags('[azione:listcomponents]');
      expect(result).toEqual(['listcomponents']);
      expect(mockAPI.getCircuitDescription).toHaveBeenCalledOnce();
    });

    it('does nothing if getCircuitDescription is missing', () => {
      delete mockAPI.getCircuitDescription;
      const result = executeActionTags('[azione:listcomponents]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 40. getstate
  // ─────────────────────────────────────
  describe('getstate', () => {
    it('calls api.getSimulatorContext()', () => {
      const result = executeActionTags('[azione:getstate]');
      expect(result).toEqual(['getstate']);
      expect(mockAPI.getSimulatorContext).toHaveBeenCalledOnce();
    });

    it('does nothing if getSimulatorContext is missing', () => {
      delete mockAPI.getSimulatorContext;
      const result = executeActionTags('[azione:getstate]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 41. showserial
  // ─────────────────────────────────────
  describe('showserial', () => {
    it('calls api.showSerialMonitor()', () => {
      const result = executeActionTags('[azione:showserial]');
      expect(result).toEqual(['showserial']);
      expect(mockAPI.showSerialMonitor).toHaveBeenCalledOnce();
    });
  });

  // ─────────────────────────────────────
  // 42. serialwrite
  // ─────────────────────────────────────
  describe('serialwrite', () => {
    it('writes to serial with single argument', () => {
      const result = executeActionTags('[azione:serialwrite:Hello World]');
      expect(result).toEqual(['serialwrite']);
      expect(mockAPI.serialWrite).toHaveBeenCalledWith('Hello World');
    });

    it('joins multi-colon serial data', () => {
      const result = executeActionTags('[azione:serialwrite:key:value:end]');
      expect(result).toEqual(['serialwrite']);
      expect(mockAPI.serialWrite).toHaveBeenCalledWith('key:value:end');
    });

    it('does nothing without data', () => {
      const result = executeActionTags('[azione:serialwrite]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 43. highlightpin
  // ─────────────────────────────────────
  describe('highlightpin', () => {
    it('highlights a single pin', () => {
      const result = executeActionTags('[azione:highlightpin:D13]');
      expect(result).toEqual(['highlightpin:D13']);
      expect(mockAPI.highlightPin).toHaveBeenCalledWith(['D13']);
    });

    it('highlights multiple pins (comma-separated)', () => {
      const result = executeActionTags('[azione:highlightpin:D13,A0,D7]');
      expect(result).toEqual(['highlightpin:D13,A0,D7']);
      expect(mockAPI.highlightPin).toHaveBeenCalledWith(['D13', 'A0', 'D7']);
    });

    it('clears highlights after 4s timeout', () => {
      executeActionTags('[azione:highlightpin:D13]');
      expect(mockAPI.unlim.clearHighlights).not.toHaveBeenCalled();
      vi.advanceTimersByTime(4000);
      expect(mockAPI.unlim.clearHighlights).toHaveBeenCalledOnce();
    });

    it('does nothing without pin argument', () => {
      const result = executeActionTags('[azione:highlightpin]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 44. quiz
  // ─────────────────────────────────────
  describe('quiz', () => {
    it('dispatches navigate to detective tab with experiment ID', () => {
      const result = executeActionTags('[azione:quiz:exp-v1-05]');
      expect(result).toEqual(['quiz:exp-v1-05']);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'elab-navigate',
          detail: { tab: 'detective', experimentId: 'exp-v1-05' },
        })
      );
    });

    it('does nothing without experiment ID', () => {
      const result = executeActionTags('[azione:quiz]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 45. youtube
  // ─────────────────────────────────────
  describe('youtube', () => {
    it('dispatches navigate to video tab with query', () => {
      const result = executeActionTags('[azione:youtube:led blink tutorial]');
      expect(result).toEqual(['youtube:led blink tutorial']);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'elab-navigate',
          detail: { tab: 'video', query: 'led blink tutorial' },
        })
      );
    });

    it('joins multi-part query with spaces', () => {
      const result = executeActionTags('[azione:youtube:arduino:servo:tutorial]');
      expect(result).toEqual(['youtube:arduino servo tutorial']);
    });

    it('does nothing without query', () => {
      const result = executeActionTags('[azione:youtube]');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────
  // 46. createnotebook
  // ─────────────────────────────────────
  describe('createnotebook', () => {
    it('dispatches navigate to taccuini tab with title', () => {
      const result = executeActionTags('[azione:createnotebook:Il mio esperimento]');
      expect(result).toEqual(['createnotebook']);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'elab-navigate',
          detail: { tab: 'taccuini', title: 'Il mio esperimento' },
        })
      );
    });

    it('does nothing without title', () => {
      const result = executeActionTags('[azione:createnotebook]');
      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════
  // MULTI-COMMAND TESTS
  // ═══════════════════════════════════════
  describe('multiple commands in one response', () => {
    it('executes two commands in sequence', () => {
      const response = 'Ora prova! [azione:addcomponent:led:100:200] [azione:play]';
      const result = executeActionTags(response);
      expect(result).toEqual(['addcomponent:led', 'play']);
      expect(mockAPI.addComponent).toHaveBeenCalledWith('led', { x: 100, y: 200 });
      expect(mockAPI.play).toHaveBeenCalled();
    });

    it('executes three commands from a complex AI response', () => {
      const response = `Aggiungo un LED e un resistore al circuito.
        [azione:addcomponent:led:200:150]
        [azione:addcomponent:resistor:300:150]
        [azione:addwire:led:cathode:resistor:pin1]`;
      const result = executeActionTags(response);
      expect(result).toEqual(['addcomponent:led', 'addcomponent:resistor', 'addwire']);
      expect(mockAPI.addComponent).toHaveBeenCalledTimes(2);
      expect(mockAPI.addWire).toHaveBeenCalledOnce();
    });

    it('executes reset + loadexp + play in a typical lesson start', () => {
      const response = '[azione:reset] [azione:loadexp:exp-v1-01] [azione:play]';
      const result = executeActionTags(response);
      expect(result).toEqual(['reset', 'loadexp:exp-v1-01', 'play']);
    });

    it('mixes editor and simulator commands', () => {
      const response = '[azione:openeditor] [azione:setcode:void setup() { pinMode(13, OUTPUT); }] [azione:compile]';
      const result = executeActionTags(response);
      expect(result).toEqual(['openeditor', 'setcode', 'compile']);
    });

    it('skips invalid commands but continues executing valid ones', () => {
      const response = '[azione:play] [azione:unknowncmd] [azione:pause]';
      const result = executeActionTags(response);
      expect(result).toEqual(['play', 'pause']);
    });
  });

  // ═══════════════════════════════════════
  // ERROR RESILIENCE
  // ═══════════════════════════════════════
  describe('error resilience', () => {
    it('catches errors from individual API calls and continues', () => {
      mockAPI.play = vi.fn(() => { throw new Error('Simulated failure'); });
      const response = '[azione:play] [azione:pause]';
      const result = executeActionTags(response);
      // play throws, so it won't be in executed; pause should still work
      expect(result).toEqual(['pause']);
      expect(mockAPI.pause).toHaveBeenCalled();
    });

    it('handles response with surrounding text and newlines', () => {
      const response = `Ecco cosa faccio per te:
1. Prima aggiungo un LED
[azione:addcomponent:led]

2. Poi avvio la simulazione
[azione:play]

Fatto!`;
      const result = executeActionTags(response);
      expect(result).toEqual(['addcomponent:led', 'play']);
    });

    it('handles whitespace in command parts', () => {
      const result = executeActionTags('[azione: play ]');
      expect(result).toEqual(['play']);
    });

    it('handles empty response string', () => {
      const result = executeActionTags('');
      expect(result).toEqual([]);
    });

    it('does not crash on null-ish API methods via optional chaining', () => {
      window.__ELAB_API = {
        // Minimal API — most methods undefined
        unlim: {},
      };
      const response = '[azione:play] [azione:pause] [azione:reset] [azione:compile] [azione:undo] [azione:redo] [azione:clearall] [azione:nextstep] [azione:prevstep] [azione:showbom] [azione:showserial] [azione:openeditor] [azione:closeeditor] [azione:resetcode] [azione:fullscreenscratch] [azione:exitscratchfullscreen]';
      // These all use optional chaining, so they should push to executed without crashing
      const result = executeActionTags(response);
      expect(result).toContain('play');
      expect(result).toContain('pause');
      expect(result).toContain('reset');
      expect(result).toContain('compile');
      expect(result).toContain('undo');
      expect(result).toContain('redo');
      expect(result).toContain('clearall');
      expect(result).toContain('nextstep');
      expect(result).toContain('prevstep');
      expect(result).toContain('showbom');
      expect(result).toContain('showserial');
      expect(result).toContain('openeditor');
      expect(result).toContain('closeeditor');
      expect(result).toContain('resetcode');
      expect(result).toContain('fullscreenscratch');
      expect(result).toContain('exitscratchfullscreen');
    });

    it('handles commands that require API methods that are absent (guarded by if)', () => {
      window.__ELAB_API = { unlim: {} };
      // These commands check for method existence before calling, so they silently skip
      const response = '[azione:loadexp:exp1] [azione:addcomponent:led] [azione:removecomponent:led1] [azione:addwire:a:b:c:d] [azione:screenshot] [azione:describe] [azione:getcode] [azione:listcomponents] [azione:getstate]';
      const result = executeActionTags(response);
      // None should execute since methods are missing
      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════
  // ARGUMENT PARSING EDGE CASES
  // ═══════════════════════════════════════
  describe('argument parsing edge cases', () => {
    it('addcomponent with negative coordinates', () => {
      const result = executeActionTags('[azione:addcomponent:led:-50:-100]');
      expect(result).toEqual(['addcomponent:led']);
      expect(mockAPI.addComponent).toHaveBeenCalledWith('led', { x: -50, y: -100 });
    });

    it('movecomponent with zero coordinates', () => {
      const result = executeActionTags('[azione:movecomponent:r1:0:0]');
      expect(result).toEqual(['movecomponent:r1']);
      // parseInt('0') is 0 which is falsy, so || 200 kicks in
      expect(mockAPI.moveComponent).toHaveBeenCalledWith('r1', 200, 150);
    });

    it('setvalue preserves string value (does not parse to number)', () => {
      const result = executeActionTags('[azione:setvalue:led1:color:red]');
      expect(result).toEqual(['setvalue:led1:color:red']);
      expect(mockAPI.setComponentValue).toHaveBeenCalledWith('led1', 'color', 'red');
    });

    it('interact passes third argument as string', () => {
      const result = executeActionTags('[azione:interact:switch1:toggle:on]');
      expect(result).toEqual(['interact:switch1:toggle']);
      expect(mockAPI.interact).toHaveBeenCalledWith('switch1', 'toggle', 'on');
    });

    it('openvolume parses volume and page as integers', () => {
      const result = executeActionTags('[azione:openvolume:3:127]');
      expect(result).toEqual(['openvolume:3:127']);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { tab: 'manuale', volume: 3, page: 127 },
        })
      );
    });

    it('removewire parses index as integer', () => {
      const result = executeActionTags('[azione:removewire:42]');
      expect(result).toEqual(['removewire:42']);
      expect(mockAPI.removeWire).toHaveBeenCalledWith(42);
    });

    it('highlight trims spaces in comma-separated list', () => {
      const result = executeActionTags('[azione:highlight:led1 , r1 , buzzer1]');
      expect(result).toEqual(['highlight:led1 , r1 , buzzer1']);
      expect(mockAPI.unlim.highlightComponent).toHaveBeenCalledWith(['led1', 'r1', 'buzzer1']);
    });

    it('highlightpin trims spaces in comma-separated pins', () => {
      const result = executeActionTags('[azione:highlightpin:D13 , A0]');
      expect(result).toEqual(['highlightpin:D13 , A0']);
      expect(mockAPI.highlightPin).toHaveBeenCalledWith(['D13', 'A0']);
    });
  });

  // ═══════════════════════════════════════
  // REALISTIC AI RESPONSE SCENARIOS
  // ═══════════════════════════════════════
  describe('realistic AI response scenarios', () => {
    it('lesson start: reset + load + highlight + play', () => {
      const response = `Perfetto, iniziamo la lezione sul LED!
[azione:reset]
[azione:loadexp:exp-v1-03]
[azione:highlight:led1,r1]
[azione:play]
Ora guardate il LED che si accende!`;
      const result = executeActionTags(response);
      expect(result).toEqual(['reset', 'loadexp:exp-v1-03', 'highlight:led1,r1', 'play']);
    });

    it('code editing: open editor + set code + compile', () => {
      const response = `Scriviamo il codice per far lampeggiare il LED:
[azione:openeditor]
[azione:setcode:void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); delay(1000); }]
[azione:compile]`;
      const result = executeActionTags(response);
      expect(result).toEqual(['openeditor', 'setcode', 'compile']);
    });

    it('troubleshooting: screenshot + describe + diagnose', () => {
      const response = `Vediamo cosa succede nel circuito:
[azione:screenshot]
[azione:describe]
[azione:diagnose]`;
      const result = executeActionTags(response);
      expect(result).toEqual(['screenshot', 'describe', 'diagnose']);
    });

    it('navigation: open volume + open tab', () => {
      const response = `Guardiamo la pagina del manuale:
[azione:openvolume:1:42]
Ti mostro anche il video:
[azione:youtube:come funziona un LED]`;
      const result = executeActionTags(response);
      expect(result).toEqual(['openvolume:1:42', 'youtube:come funziona un LED']);
    });

    it('build mode: set guided + next step', () => {
      const response = `Passiamo alla modalita passo passo:
[azione:setbuildmode:passopasso]
[azione:nextstep]`;
      const result = executeActionTags(response);
      expect(result).toEqual(['setbuildmode:passopasso', 'nextstep']);
      expect(mockAPI.setBuildMode).toHaveBeenCalledWith('guided');
    });

    it('circuit assembly: add components + wire + highlight pins', () => {
      const response = `Costruiamo il circuito:
[azione:addcomponent:led:200:100]
[azione:addcomponent:resistor:300:100]
[azione:addwire:led:cathode:resistor:pin1]
[azione:highlightpin:D13,GND]`;
      const result = executeActionTags(response);
      expect(result).toEqual([
        'addcomponent:led',
        'addcomponent:resistor',
        'addwire',
        'highlightpin:D13,GND',
      ]);
    });

    it('Scratch workflow: fullscreen scratch + load blocks', () => {
      const response = `Usiamo Scratch per programmare:
[azione:fullscreenscratch]
[azione:loadblocks:<xml><block type="controls_repeat"></block></xml>]`;
      const result = executeActionTags(response);
      expect(result).toEqual(['fullscreenscratch', 'loadblocks']);
      expect(mockAPI.showEditor).toHaveBeenCalled();
      expect(mockAPI.setEditorMode).toHaveBeenCalledWith('scratch');
    });

    it('quiz + notebook creation at end of lesson', () => {
      const response = `Bravi! Ora testiamo cosa avete imparato:
[azione:quiz:exp-v1-03]
E creiamo un taccuino:
[azione:createnotebook:Lezione LED - Classe 3B]`;
      const result = executeActionTags(response);
      expect(result).toEqual(['quiz:exp-v1-03', 'createnotebook']);
    });
  });
});
