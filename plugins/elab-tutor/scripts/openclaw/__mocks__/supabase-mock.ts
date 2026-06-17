/**
 * Supabase client mock — for tool-memory + together-audit tests.
 * Mimics supabase-js subset we use: from(table).insert/update/select + rpc().
 */

export function buildSupabaseMock() {
  const state = {
    openclaw_tool_memory: [] as Array<Record<string, unknown>>,
    together_audit_log: [] as Array<Record<string, unknown>>,
  };

  function buildQueryBuilder(table: string) {
    return {
      insert: async (row: Record<string, unknown>) => {
        const bucket = state[table as keyof typeof state];
        if (bucket) bucket.push({ id: `row-${bucket.length + 1}`, ...row });
        return { data: row, error: null };
      },
      update: async (patch: Record<string, unknown>) => {
        return { data: patch, error: null };
      },
      select: () => ({
        eq: () => ({
          limit: () => ({ data: state[table as keyof typeof state] || [], error: null }),
        }),
        limit: () => ({ data: state[table as keyof typeof state] || [], error: null }),
      }),
      delete: () => ({
        eq: () => ({ data: null, error: null }),
        lt: () => ({ data: null, error: null }),
      }),
    };
  }

  return {
    from: (table: string) => buildQueryBuilder(table),
    rpc: async (fnName: string, _params?: Record<string, unknown>) => {
      if (fnName === 'match_tools') return { data: [], error: null };
      if (fnName === 'touch_tool') return { data: null, error: null };
      if (fnName === 'record_tool_outcome') return { data: null, error: null };
      if (fnName === 'gc_tool_memory') return { data: { deleted: 0 }, error: null };
      return { data: null, error: new Error(`unknown rpc: ${fnName}`) };
    },
    // Expose internal state for assertion
    _state: state,
  };
}
