/**
 * DashboardShell — state coverage tests.
 *
 * Day 10 baseline: placeholder scaffold (backward-compat preserved).
 * Day 18 addition: hook integration states (disabled / loading / error / ready + schema badge + retry button + metric grid).
 *
 * Claude Code — Sprint 3 Day 04 (Day 18 cumulative) — Andrea Marro
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Dashboard } from '../../../../src/components/dashboard';
import DashboardShell from '../../../../src/components/dashboard/DashboardShell';

const ENDPOINT_BASE = 'https://euqpdueopmlllqjmqnyb.supabase.co';
const ANON = 'eyJhbGci.test.anon';

function okPayload(overrides = {}) {
  return {
    success: true,
    metrics: {
      student_count: 7,
      total_interactions: 123,
      avg_session_minutes: 42,
      experiments_completed: 3,
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

function mockFetchOk(payload) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  });
}

function mockFetchHttp(status) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error: `HTTP ${status}` }),
  });
}

describe('DashboardShell (Day 10 baseline)', () => {
  it('renders placeholder heading "Dashboard Docente"', () => {
    render(<DashboardShell />);
    expect(screen.getByText('Dashboard Docente')).toBeTruthy();
  });

  it('barrel re-exports same component as default from DashboardShell', () => {
    expect(typeof Dashboard).toBe('function');
    expect(typeof DashboardShell).toBe('function');
    expect(Dashboard).toBe(DashboardShell);
  });
});

describe('DashboardShell (Day 18 hook integration)', () => {
  beforeEach(() => {
    import.meta.env.VITE_SUPABASE_URL = ENDPOINT_BASE;
    import.meta.env.VITE_SUPABASE_ANON_KEY = ANON;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;
  });

  it('default enabled=false renders placeholder and does NOT fetch', () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 200, json: async () => okPayload() });
    render(<DashboardShell />);
    expect(screen.getByTestId('dashboard-placeholder')).toBeTruthy();
    expect(spy).not.toHaveBeenCalled();
  });

  it('enabled=true shows loading state with aria-busy', () => {
    globalThis.fetch = vi.fn(() => new Promise(() => {})); // never resolves
    render(<DashboardShell enabled={true} />);
    const loading = screen.getByTestId('dashboard-loading');
    expect(loading).toBeTruthy();
    const region = screen.getByRole('region', { name: /Dashboard Docente/i });
    expect(region.getAttribute('aria-busy')).toBe('true');
  });

  it('renders metric grid on successful fetch', async () => {
    mockFetchOk(okPayload());
    render(<DashboardShell enabled={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-grid')).toBeTruthy();
    });
    expect(screen.getByTestId('metric-student-count').textContent).toContain('7');
    expect(screen.getByTestId('metric-interactions').textContent).toContain('123');
    expect(screen.getByTestId('metric-avg-minutes').textContent).toContain('42');
    expect(screen.getByTestId('metric-experiments').textContent).toContain('3');
  });

  it('displays schema badge with schema_version', async () => {
    mockFetchOk(okPayload({ schema_version: '0.1.7-beta' }));
    render(<DashboardShell enabled={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-schema').textContent).toContain('0.1.7-beta');
    });
  });

  it('renders accessible error alert on HTTP 500', async () => {
    mockFetchHttp(500);
    render(<DashboardShell enabled={true} />);
    await waitFor(() => {
      const alert = screen.getByTestId('dashboard-error');
      expect(alert).toBeTruthy();
      expect(alert.getAttribute('role')).toBe('alert');
      expect(alert.textContent).toContain('500');
    });
  });

  it('retry button re-invokes fetch after error', async () => {
    // First call fails, second succeeds.
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => okPayload({ metrics: { student_count: 99, total_interactions: 0, avg_session_minutes: 0, experiments_completed: 0, recent_errors: [], nudges_suggested: [] } }) });
    globalThis.fetch = fetchMock;

    render(<DashboardShell enabled={true} />);
    await waitFor(() => expect(screen.getByTestId('dashboard-error')).toBeTruthy());

    const retry = screen.getByTestId('dashboard-retry');
    fireEvent.click(retry);

    await waitFor(() => {
      expect(screen.getByTestId('metric-student-count').textContent).toContain('99');
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('schema mismatch renders error with E_SCHEMA code', async () => {
    mockFetchOk(okPayload({ schema_version: '9.9.9' }));
    render(<DashboardShell enabled={true} />);
    await waitFor(() => {
      const err = screen.getByTestId('dashboard-error');
      expect(err.textContent).toContain('Schema non compatibile');
      expect(err.textContent).toContain('E_SCHEMA');
    });
  });

  it('passes range prop through to query string', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => okPayload({ range: '30d' }) });
    globalThis.fetch = fetchMock;
    render(<DashboardShell enabled={true} range="30d" />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const firstCall = fetchMock.mock.calls[0][0];
    expect(firstCall).toContain('range=30d');
  });

  it('passes teacherId prop through to query string', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => okPayload() });
    globalThis.fetch = fetchMock;
    render(<DashboardShell enabled={true} teacherId="t-42" />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toContain('teacher_id=t-42');
  });
});
