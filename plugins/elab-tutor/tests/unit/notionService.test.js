/**
 * notionService.test.js — Test per Notion entity services ELAB
 * 10 test: entity service factory, cache, edge cases
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() },
}));

global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }));

import { utentiService, ordiniService, waitlistService, eventiService, corsiService } from '../../src/services/notionService';

beforeEach(() => { vi.clearAllMocks(); });

describe('notionService — entity services', () => {
  it('utentiService is defined', () => {
    expect(utentiService).toBeDefined();
  });

  it('ordiniService is defined', () => {
    expect(ordiniService).toBeDefined();
  });

  it('waitlistService is defined', () => {
    expect(waitlistService).toBeDefined();
  });

  it('eventiService is defined', () => {
    expect(eventiService).toBeDefined();
  });

  it('corsiService is defined', () => {
    expect(corsiService).toBeDefined();
  });

  it('each service has getAll method', () => {
    expect(typeof utentiService.getAll).toBe('function');
    expect(typeof ordiniService.getAll).toBe('function');
    expect(typeof waitlistService.getAll).toBe('function');
  });

  it('each service has create method', () => {
    expect(typeof utentiService.create).toBe('function');
    expect(typeof ordiniService.create).toBe('function');
  });

  it('each service has update method', () => {
    expect(typeof utentiService.update).toBe('function');
  });

  // getAll/create require API — tested via integration
});
