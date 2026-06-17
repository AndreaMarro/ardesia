/**
 * supabaseAuth — Tests for Supabase auth wrapper and error translation
 * Tests mapSupabaseUser, translateAuthError, and unconfigured fallbacks.
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client as unconfigured
vi.mock('../../src/services/supabaseClient', () => ({
  default: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(() => ({ data: { user: null } })),
      getSession: vi.fn(() => ({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
  isSupabaseConfigured: vi.fn(() => false),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), log: vi.fn() },
}));

import { signUp, signIn, signOut, getCurrentUser, getSession, onAuthStateChange } from '../../src/services/supabaseAuth';
import { isSupabaseConfigured } from '../../src/services/supabaseClient';

beforeEach(() => {
  vi.clearAllMocks();
  isSupabaseConfigured.mockReturnValue(false);
});

describe('supabaseAuth', () => {
  describe('when Supabase not configured', () => {
    it('signUp returns error', async () => {
      const result = await signUp({ email: 'test@test.it', password: '123456', nome: 'Test', ruolo: 'docente' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('non configurato');
    });

    it('signIn returns error', async () => {
      const result = await signIn('test@test.it', '123456');
      expect(result.success).toBe(false);
      expect(result.error).toContain('non configurato');
    });

    it('signOut completes without error', async () => {
      await expect(signOut()).resolves.not.toThrow();
    });

    it('getCurrentUser returns null', async () => {
      const user = await getCurrentUser();
      expect(user).toBeNull();
    });

    it('getSession returns null', async () => {
      const session = await getSession();
      expect(session).toBeNull();
    });

    it('onAuthStateChange returns noop unsubscribe', () => {
      const result = onAuthStateChange(() => {});
      expect(result.data.subscription.unsubscribe).toBeDefined();
      expect(() => result.data.subscription.unsubscribe()).not.toThrow();
    });
  });

  describe('when Supabase configured', () => {
    beforeEach(() => {
      isSupabaseConfigured.mockReturnValue(true);
    });

    it('signUp calls supabase.auth.signUp', async () => {
      const supabase = (await import('../../src/services/supabaseClient')).default;
      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: '123',
            email: 'mario@scuola.it',
            user_metadata: { nome: 'Mario', ruolo: 'docente' },
          },
        },
        error: null,
      });

      const result = await signUp({
        email: 'mario@scuola.it',
        password: 'abc123',
        nome: 'Mario',
        ruolo: 'docente',
      });
      expect(result.success).toBe(true);
      expect(result.user.email).toBe('mario@scuola.it');
      expect(result.user.name).toBe('Mario');
      expect(result.user.userType).toBe('teacher');
      expect(result.user._supabase).toBe(true);
    });

    it('signUp returns translated error on failure', async () => {
      const supabase = (await import('../../src/services/supabaseClient')).default;
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      });

      const result = await signUp({
        email: 'dup@scuola.it',
        password: 'abc123',
        nome: 'Dup',
        ruolo: 'studente',
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('gia registrata');
    });

    it('signIn returns user on success', async () => {
      const supabase = (await import('../../src/services/supabaseClient')).default;
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: '456',
            email: 'prof@scuola.it',
            user_metadata: { nome: 'Prof', ruolo: 'teacher' },
          },
        },
        error: null,
      });

      const result = await signIn('prof@scuola.it', 'pass');
      expect(result.success).toBe(true);
      expect(result.user.userType).toBe('teacher');
      expect(result.hasLicense).toBe(true);
    });

    it('signIn translates Invalid login error', async () => {
      const supabase = (await import('../../src/services/supabaseClient')).default;
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      const result = await signIn('bad@scuola.it', 'wrong');
      expect(result.success).toBe(false);
      expect(result.error).toContain('non corretti');
    });

    it('maps student role correctly', async () => {
      const supabase = (await import('../../src/services/supabaseClient')).default;
      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: '789',
            email: 'kid@scuola.it',
            user_metadata: { nome: 'Kid', ruolo: 'studente' },
          },
        },
        error: null,
      });

      const result = await signUp({
        email: 'kid@scuola.it',
        password: 'abc123',
        nome: 'Kid',
        ruolo: 'studente',
      });
      expect(result.user.userType).toBe('family');
      expect(result.user.ruolo).toBe('studente');
    });
  });
});
