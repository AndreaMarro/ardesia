/**
 * Dashboard Data Edge Function — Sprint 3 Day 02 scaffold (Day 16 cumulative)
 * GET /dashboard-data?teacher_id=<uuid>&range=<7d|30d|90d>
 *
 * Brain/Hands decoupling (Harness 2.0):
 *   - Brain: this function = query logic, aggregation, privacy filter
 *   - Hands: Supabase SQL executes
 *
 * Returns aggregated teacher dashboard metrics:
 *   - student_count (distinct sessions)
 *   - total_interactions
 *   - avg_session_minutes
 *   - experiments_completed
 *   - recent_errors (last 7)
 *   - nudges_suggested (Day 05 wiring)
 *
 * Authentication: Supabase JWT required (teacher role).
 * RLS: teachers see only own school data.
 *
 * Status: SCAFFOLD — returns empty shape + metadata. Day 05 wires real queries.
 *
 * (c) Andrea Marro — 22/04/2026
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, getSecurityHeaders, checkBodySize } from '../_shared/guards.ts';

interface DashboardRequest {
  teacher_id?: string;
  range?: '7d' | '30d' | '90d';
}

interface DashboardMetrics {
  student_count: number;
  total_interactions: number;
  avg_session_minutes: number;
  experiments_completed: number;
  recent_errors: Array<{ ts: string; msg: string; session_id: string }>;
  nudges_suggested: Array<{ type: string; target: string; priority: number }>;
}

interface DashboardResponse {
  success: boolean;
  metrics?: DashboardMetrics;
  range: string;
  teacher_id: string | null;
  generated_at: string;
  schema_version: string;
  source: 'live' | 'stub';
  error?: string;
}

const SCHEMA_VERSION = '0.1.0-scaffold';

function emptyMetrics(): DashboardMetrics {
  return {
    student_count: 0,
    total_interactions: 0,
    avg_session_minutes: 0,
    experiments_completed: 0,
    recent_errors: [],
    nudges_suggested: [],
  };
}

function validateRange(r: unknown): '7d' | '30d' | '90d' {
  if (r === '30d' || r === '90d') return r;
  return '7d';
}

function validateTeacherId(id: unknown): string | null {
  if (typeof id !== 'string') return null;
  // UUID v4 loose check; strict enforcement Day 05
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) return null;
  return id;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' } satisfies Partial<DashboardResponse>),
      { status: 405, headers: getSecurityHeaders(req) },
    );
  }

  if (req.method === 'POST') {
    const bodyCheck = checkBodySize(req);
    if (bodyCheck) return bodyCheck;
  }

  try {
    let teacherId: string | null = null;
    let range: '7d' | '30d' | '90d' = '7d';

    if (req.method === 'GET') {
      const url = new URL(req.url);
      teacherId = validateTeacherId(url.searchParams.get('teacher_id'));
      range = validateRange(url.searchParams.get('range'));
    } else {
      const body = (await req.json().catch(() => ({}))) as DashboardRequest;
      teacherId = validateTeacherId(body.teacher_id);
      range = validateRange(body.range);
    }

    // Auth stub — Day 05 enforces JWT teacher role + RLS
    // For scaffold, return empty shape with metadata so frontend hook can dev-wire.
    const body: DashboardResponse = {
      success: true,
      metrics: emptyMetrics(),
      range,
      teacher_id: teacherId,
      generated_at: new Date().toISOString(),
      schema_version: SCHEMA_VERSION,
      source: 'stub',
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...getSecurityHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    return new Response(
      JSON.stringify({ success: false, error: msg, source: 'stub', schema_version: SCHEMA_VERSION, range: '7d', teacher_id: null, generated_at: new Date().toISOString() } satisfies DashboardResponse),
      { status: 500, headers: getSecurityHeaders(req) },
    );
  }
});
