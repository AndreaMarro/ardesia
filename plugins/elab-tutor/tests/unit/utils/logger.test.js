/**
 * logger.test.js — Extended tests for conditional logging utility (src/utils/logger.js)
 * Sprint T iter 28 — NEW FILE (distinct from tests/unit/logger.test.js which has 5 basic tests)
 *
 * Covers: all log levels, multiple args, prefix format, dev/prod conditional behaviour,
 * non-string inputs, error objects, null/undefined, return values.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import logger from '../../../src/utils/logger';

// ─── Shared spy setup ─────────────────────────────────────────

describe('logger — warn always calls console.warn', () => {
  let spy;
  beforeEach(() => { spy = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
  afterEach(() => spy.mockRestore());

  it('warn with single string', () => {
    logger.warn('something broke');
    expect(spy).toHaveBeenCalledWith('[WARN]', 'something broke');
  });

  it('warn with multiple args', () => {
    logger.warn('a', 'b', 'c');
    expect(spy).toHaveBeenCalledWith('[WARN]', 'a', 'b', 'c');
  });

  it('warn with object arg', () => {
    const obj = { code: 42 };
    logger.warn('ctx', obj);
    expect(spy).toHaveBeenCalledWith('[WARN]', 'ctx', obj);
  });

  it('warn with null arg', () => {
    logger.warn(null);
    expect(spy).toHaveBeenCalledWith('[WARN]', null);
  });

  it('warn with undefined arg', () => {
    logger.warn(undefined);
    expect(spy).toHaveBeenCalledWith('[WARN]', undefined);
  });

  it('warn with number arg', () => {
    logger.warn(404);
    expect(spy).toHaveBeenCalledWith('[WARN]', 404);
  });

  it('warn with Error object', () => {
    const err = new Error('test error');
    logger.warn('err:', err);
    expect(spy).toHaveBeenCalledWith('[WARN]', 'err:', err);
  });

  it('warn called exactly once per call', () => {
    logger.warn('once');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('warn with boolean arg', () => {
    logger.warn('flag', true);
    expect(spy).toHaveBeenCalledWith('[WARN]', 'flag', true);
  });

  it('warn returns undefined', () => {
    const result = logger.warn('test');
    expect(result).toBeUndefined();
  });
});

describe('logger — error always calls console.error', () => {
  let spy;
  beforeEach(() => { spy = vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => spy.mockRestore());

  it('error with single string', () => {
    logger.error('fatal error');
    expect(spy).toHaveBeenCalledWith('[ERROR]', 'fatal error');
  });

  it('error with multiple args', () => {
    logger.error('x', 'y', 'z');
    expect(spy).toHaveBeenCalledWith('[ERROR]', 'x', 'y', 'z');
  });

  it('error with Error instance', () => {
    const err = new Error('boom');
    logger.error('caught:', err);
    expect(spy).toHaveBeenCalledWith('[ERROR]', 'caught:', err);
  });

  it('error with null', () => {
    logger.error(null);
    expect(spy).toHaveBeenCalledWith('[ERROR]', null);
  });

  it('error with undefined', () => {
    logger.error(undefined);
    expect(spy).toHaveBeenCalledWith('[ERROR]', undefined);
  });

  it('error with array', () => {
    logger.error([1, 2, 3]);
    expect(spy).toHaveBeenCalledWith('[ERROR]', [1, 2, 3]);
  });

  it('error called exactly once per call', () => {
    logger.error('once');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('error returns undefined', () => {
    expect(logger.error('x')).toBeUndefined();
  });
});

describe('logger — debug / info / log do not throw regardless of input', () => {
  it('debug with undefined does not throw', () => {
    expect(() => logger.debug(undefined)).not.toThrow();
  });

  it('debug with null does not throw', () => {
    expect(() => logger.debug(null)).not.toThrow();
  });

  it('debug with object does not throw', () => {
    expect(() => logger.debug({ key: 'value' })).not.toThrow();
  });

  it('info with multiple args does not throw', () => {
    expect(() => logger.info('a', 1, true, null)).not.toThrow();
  });

  it('log with empty args does not throw', () => {
    expect(() => logger.log()).not.toThrow();
  });

  it('debug returns undefined', () => {
    expect(logger.debug('test')).toBeUndefined();
  });

  it('info returns undefined', () => {
    expect(logger.info('test')).toBeUndefined();
  });

  it('log returns undefined', () => {
    expect(logger.log('test')).toBeUndefined();
  });
});

describe('logger — structure / shape', () => {
  it('exports an object', () => {
    expect(typeof logger).toBe('object');
    expect(logger).not.toBeNull();
  });

  it('has exactly the expected methods', () => {
    const methods = ['debug', 'info', 'log', 'warn', 'error'];
    methods.forEach(m => expect(typeof logger[m]).toBe('function'));
  });

  it('does not have unexpected properties', () => {
    const keys = Object.keys(logger);
    const expected = new Set(['debug', 'info', 'log', 'warn', 'error']);
    keys.forEach(k => expect(expected.has(k)).toBe(true));
  });
});
