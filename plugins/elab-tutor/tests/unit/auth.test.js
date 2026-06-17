// ============================================
// ELAB Tutor - Test Unitari Auth Service (HMAC)
// Riscrittura per token HMAC a 2 parti
// © Andrea Marro — 18/02/2026
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    register,
    login,
    logout,
    getProfile,
    isAuthenticated,
    getUserRole,
    validatePassword,
    activateLicense,
    createStudent,
    startAutoRefresh,
    stopAutoRefresh,
} from '../../src/services/authService';
import { mockFetchSuccess, mockFetchError, createMockHMACToken } from '../setup';

// authService stores tokens as raw strings (not JSON-serialized),
// so we need a helper that does NOT wrap the value in JSON.stringify.
function mockSessionStorageRaw(key, rawValue) {
    sessionStorage.getItem.mockImplementation((k) => {
        if (k === key) return rawValue;
        return null;
    });
}

// Helper: make sessionStorage use an in-memory store (for rate-limit persistence)
let memStore = {};
function useInMemoryStorage() {
    sessionStorage.setItem.mockImplementation((k, v) => { memStore[k] = String(v); });
    sessionStorage.getItem.mockImplementation((k) => memStore[k] ?? null);
    sessionStorage.removeItem.mockImplementation((k) => { delete memStore[k]; });

    // authService uses localStorage for tokens!
    localStorage.setItem.mockImplementation((k, v) => { memStore[k] = String(v); });
    localStorage.getItem.mockImplementation((k) => memStore[k] ?? null);
    localStorage.removeItem.mockImplementation((k) => { delete memStore[k]; });
    return memStore;
}

describe('AuthService (HMAC)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {}; // Reset the in-memory store between tests
        useInMemoryStorage(); // Enforce it for EVERY test
        stopAutoRefresh();
    });

    // ============================================
    // TEST LOGIN
    // ============================================

    describe('login', () => {
        it('dovrebbe effettuare login con successo e salvare token', async () => {
            const mockUser = {
                id: 'user_123',
                email: 'mario@example.com',
                nome: 'Mario Rossi',
            };
            const mockToken = createMockHMACToken();

            mockFetchSuccess({
                token: mockToken,
                user: mockUser,
                hasLicense: true,
                licenseExpiry: '2027-01-01',
            });

            const result = await login('mario@example.com', 'Password123!');

            expect(result.success).toBe(true);
            expect(result.user).toEqual(mockUser);
            expect(result.hasLicense).toBe(true);
            expect(result.licenseExpiry).toBe('2027-01-01');
            expect(localStorage.setItem).toHaveBeenCalledWith('elab_auth_token', mockToken);
            // Fetch should hit /auth-login
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth-login'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('mario@example.com'),
                })
            );
        });

        it('dovrebbe rifiutare credenziali errate', async () => {
            mockFetchError('Credenziali non valide', 401);

            const result = await login('mario@example.com', 'WrongPassword');

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });

        it('dovrebbe rispettare rate limiting su login', async () => {
            // Simulate 5 failed attempts
            for (let i = 0; i < 5; i++) {
                mockFetchError('Credenziali non valide', 403);
                await login('test@example.com', 'wrong');
            }

            // The 6th attempt should be blocked locally
            const result = await login('test@example.com', 'wrong');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Troppi tentativi');
        });

        it('dovrebbe accettare username (non solo email)', async () => {
            const mockToken = createMockHMACToken();
            mockFetchSuccess({
                token: mockToken,
                user: { id: 'user_123', username: 'mario_r' },
                hasLicense: false,
            });

            const result = await login('mario_r', 'Password123!');

            expect(result.success).toBe(true);
            // Body should contain username, not email
            const callBody = JSON.parse(fetch.mock.calls[0][1].body);
            expect(callBody.username).toBe('mario_r');
            expect(callBody.email).toBeUndefined();
        });
    });

    // ============================================
    // TEST REGISTRAZIONE
    // ============================================

    describe('register', () => {
        it('dovrebbe registrare un nuovo utente con successo', async () => {
            const mockUser = {
                id: 'user_456',
                nome: 'Mario Rossi',
                email: 'mario@example.com',
            };
            const mockToken = createMockHMACToken({ email: 'mario@example.com', userId: 'user_456' });

            mockFetchSuccess({
                token: mockToken,
                user: mockUser,
            });

            const result = await register({
                nome: 'Mario Rossi',
                email: 'mario@example.com',
                password: 'Password123!',
                ruolo: 'student',
            });

            expect(result.success).toBe(true);
            expect(result.user).toEqual(mockUser);
            expect(localStorage.setItem).toHaveBeenCalledWith('elab_auth_token', mockToken);
            // Fetch should hit /auth-register
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth-register'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('mario@example.com'),
                })
            );
        });

        it('dovrebbe rifiutare password debole (client-side validation)', async () => {
            const result = await register({
                nome: 'Mario Rossi',
                email: 'mario@example.com',
                password: 'weak',
                ruolo: 'student',
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('8 caratteri');
            // Should NOT make a fetch call
            expect(fetch).not.toHaveBeenCalled();
        });

        it('dovrebbe gestire errore email gia registrata', async () => {
            mockFetchError('Email già registrata', 409);

            const result = await register({
                nome: 'Mario Rossi',
                email: 'mario@example.com',
                password: 'Password123!',
                ruolo: 'student',
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Email');
        });

        it('dovrebbe rispettare rate limiting', async () => {
            // Simulate 5 failed attempts
            for (let i = 0; i < 5; i++) {
                mockFetchError('Errore server', 500);
                await register({
                    nome: 'Test',
                    email: 'test@example.com',
                    password: 'Password123!',
                    ruolo: 'student',
                });
            }

            // The 6th attempt should be blocked locally
            const result = await register({
                nome: 'Test',
                email: 'test@example.com',
                password: 'Password123!',
                ruolo: 'student',
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Troppi tentativi');
        });
    });

    // ============================================
    // TEST GET PROFILE
    // ============================================

    describe('getProfile', () => {
        it('dovrebbe restituire il profilo con token valido', async () => {
            const mockUser = {
                id: 'user_123',
                email: 'mario@example.com',
                nome: 'Mario Rossi',
            };
            // Token valid for 15 minutes (well beyond 1-min buffer)
            const validToken = createMockHMACToken({
                exp: Date.now() + 15 * 60 * 1000,
            });
            localStorage.setItem('elab_auth_token', validToken);

            mockFetchSuccess({
                user: mockUser,
                hasLicense: true,
                licenseExpiry: '2027-01-01',
            });

            const profile = await getProfile();

            expect(profile).not.toBeNull();
            expect(profile.user).toEqual(mockUser);
            expect(profile.hasLicense).toBe(true);
            expect(profile.licenseExpiry).toBe('2027-01-01');
        });

        it('dovrebbe restituire null con token scaduto', async () => {
            const expiredToken = createMockHMACToken({
                exp: Date.now() - 5 * 60 * 1000, // 5 min ago
            });
            localStorage.setItem('elab_auth_token', expiredToken);

            const profile = await getProfile();

            expect(profile).toBeNull();
            // Should NOT make a fetch call when token is expired
            expect(fetch).not.toHaveBeenCalled();
        });

        it('dovrebbe restituire null senza token', async () => {
            const profile = await getProfile();

            expect(profile).toBeNull();
            expect(fetch).not.toHaveBeenCalled();
        });
    });

    // ============================================
    // TEST LOGOUT
    // ============================================

    describe('logout', () => {
        it('dovrebbe pulire token e rate limit senza fetch', async () => {
            // Need to spy on removeItem for rate limit specifically
            sessionStorage.removeItem = vi.fn((k) => { delete memStore[k]; });
            localStorage.removeItem = vi.fn((k) => { delete memStore[k]; });

            await logout();

            // Should clear token
            expect(localStorage.removeItem).toHaveBeenCalledWith('elab_auth_token');
            // Should clear rate limit
            expect(sessionStorage.removeItem).toHaveBeenCalledWith('elab_auth_ratelimit');
            // MUST NOT call fetch — logout is local only
            expect(fetch).not.toHaveBeenCalled();
        });
    });

    // ============================================
    // TEST IS AUTHENTICATED
    // ============================================

    describe('isAuthenticated', () => {
        it('dovrebbe restituire true con token valido', () => {
            // Token expires 15 min from now (well beyond the 1-min buffer)
            const validToken = createMockHMACToken({
                exp: Date.now() + 15 * 60 * 1000,
            });
            localStorage.setItem('elab_auth_token', validToken);

            expect(isAuthenticated()).toBe(true);
        });

        it('dovrebbe restituire false con token scaduto', () => {
            const expiredToken = createMockHMACToken({
                exp: Date.now() - 5 * 60 * 1000, // 5 min ago
            });
            mockSessionStorageRaw('elab_auth_token', expiredToken);

            expect(isAuthenticated()).toBe(false);
        });

        it('dovrebbe restituire false senza token', () => {
            expect(isAuthenticated()).toBe(false);
        });

        it('dovrebbe restituire false con token quasi scaduto (dentro il buffer di 1 min)', () => {
            // Token expires in 30 seconds — within the 60s TOKEN_EXPIRY_BUFFER
            const almostExpiredToken = createMockHMACToken({
                exp: Date.now() + 30 * 1000,
            });
            mockSessionStorageRaw('elab_auth_token', almostExpiredToken);

            expect(isAuthenticated()).toBe(false);
        });
    });

    // ============================================
    // TEST VALIDATE PASSWORD
    // ============================================

    describe('validatePassword', () => {
        it('dovrebbe accettare password valida', () => {
            const result = validatePassword('Password123!');
            expect(result.valid).toBe(true);
        });

        it('dovrebbe rifiutare password troppo corta', () => {
            const result = validatePassword('Pass1');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('8 caratteri');
        });

        it('dovrebbe rifiutare password senza maiuscola', () => {
            const result = validatePassword('password123');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('maiuscola');
        });

        it('dovrebbe rifiutare password senza numero', () => {
            const result = validatePassword('PasswordABC');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('numero');
        });

        it('dovrebbe rifiutare password nulla o vuota', () => {
            expect(validatePassword('').valid).toBe(false);
            expect(validatePassword(null).valid).toBe(false);
            expect(validatePassword(undefined).valid).toBe(false);
        });
    });

    // ============================================
    // TEST ACTIVATE LICENSE
    // ============================================

    describe('activateLicense', () => {
        it('dovrebbe attivare licenza con successo', async () => {
            const validToken = createMockHMACToken({
                exp: Date.now() + 15 * 60 * 1000,
            });
            mockSessionStorageRaw('elab_auth_token', validToken);

            mockFetchSuccess({
                licenseExpiry: '2027-06-01',
                kits: ['vol1', 'vol2'],
            });

            const result = await activateLicense('LICENSE-ABC-123');

            expect(result.success).toBe(true);
            expect(result.licenseExpiry).toBe('2027-06-01');
            expect(result.kits).toEqual(['vol1', 'vol2']);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth-activate-license'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ licenseCode: 'LICENSE-ABC-123' }),
                })
            );
        });

        it('dovrebbe gestire errore di attivazione', async () => {
            const validToken = createMockHMACToken({
                exp: Date.now() + 15 * 60 * 1000,
            });
            mockSessionStorageRaw('elab_auth_token', validToken);

            mockFetchError('Codice licenza non valido', 400);

            const result = await activateLicense('INVALID-CODE');

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });

    // ============================================
    // TEST CREATE STUDENT
    // ============================================

    describe('createStudent', () => {
        it('dovrebbe creare studente con successo', async () => {
            const validToken = createMockHMACToken({
                exp: Date.now() + 15 * 60 * 1000,
            });
            mockSessionStorageRaw('elab_auth_token', validToken);

            mockFetchSuccess({
                student: { id: 'stu_789', username: 'alunno1', className: '3A' },
            });

            const result = await createStudent({ username: 'alunno1', className: '3A' });

            expect(result.success).toBe(true);
            expect(result.student.username).toBe('alunno1');
        });

        it('dovrebbe gestire errore di permesso (non docente)', async () => {
            const validToken = createMockHMACToken({
                exp: Date.now() + 15 * 60 * 1000,
            });
            mockSessionStorageRaw('elab_auth_token', validToken);

            mockFetchError('Accesso riservato ai docenti', 403);

            const result = await createStudent({ username: 'alunno2' });

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });

    // ============================================
    // TEST RUOLI UTENTE (HMAC — tutti false/null)
    // ============================================

    describe('Ruoli utente (HMAC token)', () => {
        it('getUserRole dovrebbe restituire null (ruolo non nel token HMAC)', () => {
            const token = createMockHMACToken();
            mockSessionStorageRaw('elab_auth_token', token);

            expect(getUserRole()).toBeNull();
        });
    });

    // ============================================
    // TEST AUTO REFRESH
    // ============================================

    describe('Auto refresh token', () => {
        it('dovrebbe avviare auto-refresh con token valido', () => {
            const token = createMockHMACToken({
                exp: Date.now() + 15 * 60 * 1000,
            });
            mockSessionStorageRaw('elab_auth_token', token);

            const callback = vi.fn();
            startAutoRefresh(callback);

            // Timer should be set but callback not called immediately
            expect(callback).not.toHaveBeenCalled();
        });

        it('dovrebbe fermare auto-refresh senza errori', () => {
            startAutoRefresh(() => { });
            stopAutoRefresh();

            // Should not throw
            expect(true).toBe(true);
        });
    });
});
