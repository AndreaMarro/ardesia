/**
 * logger — Tests for conditional logging utility
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi } from 'vitest';
import logger from '../../src/utils/logger';

describe('logger', () => {
  it('exports debug, info, warn, error methods', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('warn calls console.warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('test warning');
    expect(spy).toHaveBeenCalledWith('[WARN]', 'test warning');
    spy.mockRestore();
  });

  it('error calls console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('test error');
    expect(spy).toHaveBeenCalledWith('[ERROR]', 'test error');
    spy.mockRestore();
  });

  it('debug and info do not throw', () => {
    expect(() => logger.debug('test')).not.toThrow();
    expect(() => logger.info('test')).not.toThrow();
  });

  it('handles multiple arguments', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('a', 'b', 'c');
    expect(spy).toHaveBeenCalledWith('[WARN]', 'a', 'b', 'c');
    spy.mockRestore();
  });
});
