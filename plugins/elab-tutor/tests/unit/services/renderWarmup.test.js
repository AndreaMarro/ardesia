/**
 * renderWarmup.test.js — T1-003 Render cold start warmup scheduler
 * Target: fetch /health ogni 10min, retry backoff su 503, cooldown 30s, eventi.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  createWarmupScheduler,
  warmupOnce,
  DEFAULT_INTERVAL_MS,
  DEFAULT_COOLDOWN_MS,
} from '../../../src/services/renderWarmup.js';

describe('renderWarmup — constants', () => {
  it('exports DEFAULT_INTERVAL_MS = 10 minutes', () => {
    expect(DEFAULT_INTERVAL_MS).toBe(10 * 60 * 1000);
  });

  it('exports DEFAULT_COOLDOWN_MS = 30 seconds', () => {
    expect(DEFAULT_COOLDOWN_MS).toBe(30 * 1000);
  });
});

describe('warmupOnce — single ping', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('calls fetch with health URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const res = await warmupOnce('https://elab-galileo.onrender.com/health', { fetchImpl: fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('https://elab-galileo.onrender.com/health', expect.any(Object));
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
  });

  it('returns ok=false on network error', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await warmupOnce('https://x.test/health', { fetchImpl: fetchMock });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/ECONNREFUSED/);
  });

  it('returns ok=false on non-2xx status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    const res = await warmupOnce('https://x.test/health', { fetchImpl: fetchMock });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(503);
  });

  it('respects custom timeout signal', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    await warmupOnce('https://x.test/health', { fetchImpl: fetchMock, timeoutMs: 5000 });
    const calledWith = fetchMock.mock.calls[0][1];
    expect(calledWith.signal).toBeDefined();
  });
});

describe('createWarmupScheduler — lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts scheduler and pings at interval', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const scheduler = createWarmupScheduler({
      url: 'https://x.test/health',
      intervalMs: 60_000,
      fetchImpl: fetchMock,
      initialPing: false,
    });
    scheduler.start();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    scheduler.stop();
  });

  it('stop() prevents further pings', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const scheduler = createWarmupScheduler({
      url: 'https://x.test/health',
      intervalMs: 60_000,
      fetchImpl: fetchMock,
      initialPing: false,
    });
    scheduler.start();
    await vi.advanceTimersByTimeAsync(60_000);
    scheduler.stop();
    await vi.advanceTimersByTimeAsync(120_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('initialPing=true triggers immediate ping on start', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const scheduler = createWarmupScheduler({
      url: 'https://x.test/health',
      intervalMs: 60_000,
      fetchImpl: fetchMock,
      initialPing: true,
    });
    scheduler.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    scheduler.stop();
  });

  it('emits warmup:success on 200', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const onSuccess = vi.fn();
    const scheduler = createWarmupScheduler({
      url: 'https://x.test/health',
      intervalMs: 60_000,
      fetchImpl: fetchMock,
      initialPing: false,
    });
    scheduler.on('warmup:success', onSuccess);
    scheduler.start();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess.mock.calls[0][0]).toMatchObject({ status: 200 });
    scheduler.stop();
  });

  it('emits warmup:failure on 503', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    const onFailure = vi.fn();
    const scheduler = createWarmupScheduler({
      url: 'https://x.test/health',
      intervalMs: 60_000,
      fetchImpl: fetchMock,
      initialPing: false,
    });
    scheduler.on('warmup:failure', onFailure);
    scheduler.start();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(onFailure.mock.calls[0][0]).toMatchObject({ status: 503 });
    scheduler.stop();
  });

  it('retries with backoff on 503 up to maxRetries', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    const scheduler = createWarmupScheduler({
      url: 'https://x.test/health',
      intervalMs: 60_000,
      fetchImpl: fetchMock,
      initialPing: false,
      maxRetries: 3,
      retryBaseMs: 100,
    });
    scheduler.start();
    await vi.advanceTimersByTimeAsync(60_000);
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    scheduler.stop();
  });

  it('cooldown skip: pinging within cooldown window is suppressed', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const scheduler = createWarmupScheduler({
      url: 'https://x.test/health',
      intervalMs: 10_000,
      cooldownMs: 30_000,
      fetchImpl: fetchMock,
      initialPing: false,
    });
    scheduler.start();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    scheduler.stop();
  });

  it('off() removes listener', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const onSuccess = vi.fn();
    const scheduler = createWarmupScheduler({
      url: 'https://x.test/health',
      intervalMs: 60_000,
      fetchImpl: fetchMock,
      initialPing: false,
    });
    scheduler.on('warmup:success', onSuccess);
    scheduler.off('warmup:success', onSuccess);
    scheduler.start();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(onSuccess).not.toHaveBeenCalled();
    scheduler.stop();
  });

  it('throws if url missing', () => {
    expect(() => createWarmupScheduler({ url: '' })).toThrow(/url/i);
  });
});
