/**
 * useDashboardData hook unit tests.
 *
 * Sprint 3 Day 03 (Day 17 cumulative) — hook scaffold guard.
 * Covers: config error, HTTP error, schema guard, happy path, refetch, range/teacherId params.
 *
 * (c) Andrea Marro — 22/04/2026
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDashboardData } from '../../src/hooks/useDashboardData';

const ENDPOINT_BASE = 'https://euqpdueopmlllqjmqnyb.supabase.co';
const ANON = 'eyJhbGci.test.anon';

function okPayload(overrides = {}) {
  return {
    success: true,
    metrics: {
      student_count: 12,
      total_interactions: 345,
      avg_session_minutes: 18,
      experiments_completed: 5,
      recent_errors: [],
      nudges_suggested: [],
    },
    range: '7d',
    teacher_id: null,
    generated_at: new Date().toISOString(),
    schema_version: '0.1.0-scaffold',
    source: 'stub',
    ...overrides,
  };
}

function mockFetchOnce(response, { status = 200, ok = status >= 200 && status < 300 } = {}) {
  globalThis.fetch = vi.fn().mockResolvedValueOnce({
    ok,
    status,
    json: async () => response,
  });
}

describe('useDashboardData', () => {
  beforeEach(() => {
    import.meta.env.VITE_SUPABASE_URL = ENDPOINT_BASE;
    import.meta.env.VITE_SUPABASE_ANON_KEY = ANON;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;
  });

  it('returns empty metrics before first fetch resolves', () => {
    mockFetchOnce(okPayload());
    const { result } = renderHook(() => useDashboardData());
    expect(result.current.metrics).toEqual({
      student_count: 0,
      total_interactions: 0,
      avg_session_minutes: 0,
      experiments_completed: 0,
      recent_errors: [],
      nudges_suggested: [],
    });
    expect(result.current.loading).toBe(true);
  });

  it('resolves to payload and exposes schema metadata', async () => {
    mockFetchOnce(okPayload({ range: '7d' }));
    const { result } = renderHook(() => useDashboardData({ range: '7d' }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.metrics.student_count).toBe(12);
    expect(result.current.schemaVersion).toBe('0.1.0-scaffold');
    expect(result.current.source).toBe('stub');
    expect(result.current.range).toBe('7d');
  });

  it('sets E_CONFIG error when supabase env missing', async () => {
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.code).toBe('E_CONFIG');
  });

  it('sets E_HTTP_500 on server error', async () => {
    mockFetchOnce({ success: false }, { status: 500, ok: false });
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.code).toBe('E_HTTP_500');
  });

  it('rejects incompatible schema (E_SCHEMA)', async () => {
    mockFetchOnce(okPayload({ schema_version: '0.2.0-breaking' }));
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.code).toBe('E_SCHEMA');
  });

  it('builds correct URL with teacher_id + range', async () => {
    mockFetchOnce(okPayload());
    renderHook(() => useDashboardData({ teacherId: '0123456789abcdef0123456789abcdef', range: '30d' }));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    const url = globalThis.fetch.mock.calls[0][0];
    expect(url).toContain('/functions/v1/dashboard-data');
    expect(url).toContain('range=30d');
    expect(url).toContain('teacher_id=0123456789abcdef0123456789abcdef');
  });

  it('normalizes invalid range to default 7d', async () => {
    mockFetchOnce(okPayload());
    renderHook(() => useDashboardData({ range: '999d' }));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    const url = globalThis.fetch.mock.calls[0][0];
    expect(url).toContain('range=7d');
  });

  it('skips fetch when enabled=false', () => {
    globalThis.fetch = vi.fn();
    renderHook(() => useDashboardData({ enabled: false }));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('refetch triggers new request', async () => {
    mockFetchOnce(okPayload());
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => okPayload({ metrics: { ...okPayload().metrics, student_count: 99 } }),
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.metrics.student_count).toBe(99);
  });

  it('sends both apikey + Authorization headers (ADR-003 dual-header)', async () => {
    mockFetchOnce(okPayload());
    renderHook(() => useDashboardData());

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    const init = globalThis.fetch.mock.calls[0][1];
    expect(init.headers.apikey).toBe(ANON);
    expect(init.headers.Authorization).toBe(`Bearer ${ANON}`);
  });
});
