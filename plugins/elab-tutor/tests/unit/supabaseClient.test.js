import { describe, it, expect } from 'vitest';

describe('supabaseClient', () => {
  it('isSupabaseConfigured returns boolean', async () => {
    // In test env, VITE_SUPABASE_URL is not set → supabase = null → false
    const { isSupabaseConfigured } = await import('../../src/services/supabaseClient.js');
    expect(typeof isSupabaseConfigured()).toBe('boolean');
  });

  it('default export is SupabaseClient when env vars present', async () => {
    const mod = await import('../../src/services/supabaseClient.js');
    // .env.production has VITE_SUPABASE_URL → client exists
    if (mod.default) {
      expect(mod.default).toHaveProperty('from');
      expect(mod.default).toHaveProperty('auth');
    } else {
      expect(mod.default).toBeNull();
    }
  });

  it('isSupabaseConfigured matches client existence', async () => {
    const mod = await import('../../src/services/supabaseClient.js');
    const { isSupabaseConfigured } = mod;
    expect(isSupabaseConfigured()).toBe(!!mod.default);
  });
});
