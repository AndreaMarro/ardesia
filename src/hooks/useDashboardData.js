// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * useDashboardData — Fetch teacher dashboard metrics from Edge Function dashboard-data.
 *
 * Brain/Hands decoupling (Harness 2.0):
 *   - Brain (Edge Function): query logic, aggregation, privacy filter.
 *   - Hands (this hook): invocation, loading/error state, retry, schema guard.
 *
 * Schema version 0.1.0-scaffold — returns empty shape until Day 05 wires real queries.
 *
 * Sprint 3 Day 03 (Day 17 cumulative) scaffold.
 * (c) Andrea Marro — 22/04/2026
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_RANGE = '7d';
const VALID_RANGES = new Set(['7d', '30d', '90d']);
const EDGE_FUNCTION_PATH = '/functions/v1/dashboard-data';
const EXPECTED_SCHEMA_PREFIX = '0.1.'; // lenient during scaffold phase

function getEndpoint() {
  const base = import.meta.env?.VITE_SUPABASE_URL?.trim();
  if (!base) return null;
  return `${base.replace(/\/$/, '')}${EDGE_FUNCTION_PATH}`;
}

function getAnonKey() {
  return import.meta.env?.VITE_SUPABASE_ANON_KEY?.trim() || null;
}

function normalizeRange(range) {
  if (!VALID_RANGES.has(range)) return DEFAULT_RANGE;
  return range;
}

function emptyMetrics() {
  return {
    student_count: 0,
    total_interactions: 0,
    avg_session_minutes: 0,
    experiments_completed: 0,
    recent_errors: [],
    nudges_suggested: [],
  };
}

function schemaOk(payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (typeof payload.schema_version !== 'string') return false;
  return payload.schema_version.startsWith(EXPECTED_SCHEMA_PREFIX);
}

export function useDashboardData({ teacherId, range = DEFAULT_RANGE, enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const normalized = useMemo(() => normalizeRange(range), [range]);

  const fetchData = useCallback(async (signal) => {
    const endpoint = getEndpoint();
    const anonKey = getAnonKey();

    if (!endpoint || !anonKey) {
      const e = new Error('Supabase non configurato (VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY mancanti)');
      e.code = 'E_CONFIG';
      throw e;
    }

    const params = new URLSearchParams({ range: normalized });
    if (teacherId) params.set('teacher_id', teacherId);

    const res = await fetch(`${endpoint}?${params}`, {
      method: 'GET',
      signal,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const e = new Error(`Edge Function ${res.status}`);
      e.code = `E_HTTP_${res.status}`;
      throw e;
    }

    const payload = await res.json();

    if (!schemaOk(payload)) {
      const e = new Error(`Schema non compatibile (atteso ${EXPECTED_SCHEMA_PREFIX}x, ricevuto ${payload?.schema_version})`);
      e.code = 'E_SCHEMA';
      throw e;
    }

    return payload;
  }, [teacherId, normalized]);

  useEffect(() => {
    if (!enabled) return undefined;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    fetchData(ctrl.signal)
      .then((payload) => {
        if (ctrl.signal.aborted) return;
        setData(payload);
        setLoading(false);
      })
      .catch((err) => {
        if (ctrl.signal.aborted || err?.name === 'AbortError') return;
        setError(err);
        setLoading(false);
      });

    return () => ctrl.abort();
  }, [enabled, fetchData]);

  const refetch = useCallback(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    return fetchData(ctrl.signal)
      .then((payload) => {
        if (ctrl.signal.aborted) return null;
        setData(payload);
        setLoading(false);
        return payload;
      })
      .catch((err) => {
        if (ctrl.signal.aborted || err?.name === 'AbortError') return null;
        setError(err);
        setLoading(false);
        return null;
      });
  }, [fetchData]);

  return {
    data,
    metrics: data?.metrics ?? emptyMetrics(),
    source: data?.source ?? null,
    schemaVersion: data?.schema_version ?? null,
    generatedAt: data?.generated_at ?? null,
    range: data?.range ?? normalized,
    loading,
    error,
    refetch,
  };
}

export default useDashboardData;
