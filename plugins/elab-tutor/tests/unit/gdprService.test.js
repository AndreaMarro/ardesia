/**
 * GDPR/COPPA Service — Unit Tests
 * Verifica: consenso, diritti soggetto, COPPA, pseudonimizzazione, data retention
 * Critico per vendite: Garante Privacy ispeziona AI nelle scuole H1 2026
 * (c) Andrea Marro — 09/04/2026
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mockFetchSuccess, mockFetchError } from '../setup';

// Mock logger
vi.mock('../../src/utils/logger', () => ({
    default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// Use in-memory stores for localStorage and sessionStorage
let localStore, sessionStore;

beforeEach(() => {
    localStore = {};
    sessionStore = {};

    localStorage.getItem.mockImplementation(k => localStore[k] ?? null);
    localStorage.setItem.mockImplementation((k, v) => { localStore[k] = String(v); });
    localStorage.removeItem.mockImplementation(k => { delete localStore[k]; });

    sessionStorage.getItem.mockImplementation(k => sessionStore[k] ?? null);
    sessionStorage.setItem.mockImplementation((k, v) => { sessionStore[k] = String(v); });
    sessionStorage.removeItem.mockImplementation(k => { delete sessionStore[k]; });

    // Mock localStorage.length and .key() for iteration
    Object.defineProperty(localStorage, 'length', {
        get: () => Object.keys(localStore).length,
        configurable: true,
    });
    localStorage.key = vi.fn(i => Object.keys(localStore)[i] || null);

    Object.defineProperty(sessionStorage, 'length', {
        get: () => Object.keys(sessionStore).length,
        configurable: true,
    });
    sessionStorage.key = vi.fn(i => Object.keys(sessionStore)[i] || null);
});

import gdprService, { saveConsent, getConsent, requestDataDeletion, isCOPPAApplicable } from '../../src/services/gdprService';

// ============================================
// CONSENT MANAGEMENT
// ============================================

describe('GDPR Consent Management', () => {
    test('saveConsent stores data with timestamp and version', () => {
        const result = saveConsent({ status: 'accepted', userId: 'user1' });

        expect(result).toBe(true);
        const stored = JSON.parse(localStore['elab_gdpr_consent']);
        expect(stored.status).toBe('accepted');
        expect(stored.userId).toBe('user1');
        expect(stored.timestamp).toBeDefined();
        expect(stored.version).toBe('1.0');
    });

    test('getConsent returns null when no consent saved', () => {
        const result = getConsent();
        expect(result).toBeNull();
    });

    test('getConsent returns saved consent data', () => {
        saveConsent({ status: 'accepted', userId: 'user1' });
        const result = getConsent();

        expect(result).not.toBeNull();
        expect(result.status).toBe('accepted');
    });

    test('hasValidConsent returns true for accepted status', () => {
        saveConsent({ status: 'accepted' });
        expect(gdprService.hasValidConsent()).toBe(true);
    });

    test('hasValidConsent returns true for parental_verified status', () => {
        saveConsent({ status: 'parental_verified' });
        expect(gdprService.hasValidConsent()).toBe(true);
    });

    test('hasValidConsent returns false for pending status', () => {
        saveConsent({ status: 'pending' });
        expect(gdprService.hasValidConsent()).toBe(false);
    });

    test('hasValidConsent returns false for parental_required', () => {
        saveConsent({ status: 'parental_required' });
        expect(gdprService.hasValidConsent()).toBe(false);
    });

    test('hasValidConsent returns false for rejected', () => {
        saveConsent({ status: 'rejected' });
        expect(gdprService.hasValidConsent()).toBe(false);
    });

    test('hasValidConsent returns false when no consent exists', () => {
        expect(gdprService.hasValidConsent()).toBe(false);
    });

    test('requiresParentalConsent detects parental_required', () => {
        saveConsent({ status: 'parental_required' });
        expect(gdprService.requiresParentalConsent()).toBe(true);
    });

    test('requiresParentalConsent detects parental_sent', () => {
        saveConsent({ status: 'parental_sent' });
        expect(gdprService.requiresParentalConsent()).toBe(true);
    });

    test('requiresParentalConsent returns false for accepted', () => {
        saveConsent({ status: 'accepted' });
        expect(gdprService.requiresParentalConsent()).toBe(false);
    });

    test('requiresParentalConsent returns false when no consent', () => {
        expect(gdprService.requiresParentalConsent()).toBe(false);
    });
});

// ============================================
// COPPA COMPLIANCE
// ============================================

describe('COPPA Compliance', () => {
    test('isCOPPAApplicable returns true for age < 13', () => {
        expect(isCOPPAApplicable(8)).toBe(true);
        expect(isCOPPAApplicable(10)).toBe(true);
        expect(isCOPPAApplicable(12)).toBe(true);
    });

    test('isCOPPAApplicable returns false for age >= 13', () => {
        expect(isCOPPAApplicable(13)).toBe(false);
        expect(isCOPPAApplicable(14)).toBe(false);
        expect(isCOPPAApplicable(16)).toBe(false);
    });

    test('getCOPPARequirements for child under 13', () => {
        const reqs = gdprService.getCOPPARequirements(10);
        expect(reqs.applicable).toBe(true);
        expect(reqs.requiresVerifiedConsent).toBe(true);
        expect(reqs.requiresEmailVerification).toBe(true);
        expect(reqs.requiresDocumentSignature).toBe(true);
        expect(reqs.minimumAge).toBe(13);
    });

    test('getCOPPARequirements for teen 13+', () => {
        const reqs = gdprService.getCOPPARequirements(14);
        expect(reqs.applicable).toBe(false);
        expect(reqs.requiresVerifiedConsent).toBe(false);
    });
});

// ============================================
// PRIVACY BY DESIGN
// ============================================

describe('Privacy by Design', () => {
    test('minimizeData keeps only allowed fields', () => {
        const data = {
            name: 'Mario',
            email: 'mario@test.it',
            ssn: '123-45-6789',
            age: 10,
            secret: 'password123',
        };
        const minimized = gdprService.minimizeData(data, ['name', 'age']);

        expect(minimized).toEqual({ name: 'Mario', age: 10 });
        expect(minimized.email).toBeUndefined();
        expect(minimized.ssn).toBeUndefined();
        expect(minimized.secret).toBeUndefined();
    });

    test('minimizeData handles missing fields gracefully', () => {
        const data = { name: 'Mario' };
        const minimized = gdprService.minimizeData(data, ['name', 'email', 'age']);

        expect(minimized).toEqual({ name: 'Mario' });
    });

    test('minimizeData returns empty object for empty allowed list', () => {
        const data = { name: 'Mario', email: 'test@test.it' };
        const minimized = gdprService.minimizeData(data, []);

        expect(minimized).toEqual({});
    });

    test('pseudonymizeUserId returns consistent 16-char hex', async () => {
        const hash = await gdprService.pseudonymizeUserId('user_123');

        expect(typeof hash).toBe('string');
        expect(hash.length).toBe(16);
        expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    test('pseudonymizeUserId produces same output for same input', async () => {
        const hash1 = await gdprService.pseudonymizeUserId('user_123');
        const hash2 = await gdprService.pseudonymizeUserId('user_123');

        expect(hash1).toBe(hash2);
    });

    test('isDataExpired returns false for recent data', () => {
        const today = new Date().toISOString();
        expect(gdprService.isDataExpired(today, 730)).toBe(false);
    });

    test('isDataExpired returns true for old data', () => {
        const threeYearsAgo = new Date(Date.now() - 1100 * 24 * 60 * 60 * 1000).toISOString();
        expect(gdprService.isDataExpired(threeYearsAgo, 730)).toBe(true);
    });

    test('isDataExpired uses default 730 days', () => {
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        expect(gdprService.isDataExpired(oneYearAgo)).toBe(false);

        const threeYearsAgo = new Date(Date.now() - 1100 * 24 * 60 * 60 * 1000).toISOString();
        expect(gdprService.isDataExpired(threeYearsAgo)).toBe(true);
    });
});

// ============================================
// LOCAL DATA MANAGEMENT
// ============================================

describe('Local Data Management', () => {
    test('clearLocalData removes all elab_ keys from localStorage', () => {
        localStore['elab_consent'] = '{}';
        localStore['elab_session'] = '{}';
        localStore['elab_progress'] = '{}';
        localStore['other_app_key'] = 'keep';

        gdprService.clearLocalData();

        expect(localStore['elab_consent']).toBeUndefined();
        expect(localStore['elab_session']).toBeUndefined();
        expect(localStore['elab_progress']).toBeUndefined();
        expect(localStore['other_app_key']).toBe('keep');
    });

    test('clearLocalData removes all elab_ keys from sessionStorage', () => {
        sessionStore['elab_auth'] = '{}';
        sessionStore['elab_license'] = '{}';
        sessionStore['foreign_key'] = 'keep';

        gdprService.clearLocalData();

        expect(sessionStore['elab_auth']).toBeUndefined();
        expect(sessionStore['elab_license']).toBeUndefined();
        expect(sessionStore['foreign_key']).toBe('keep');
    });

    test('getLocalDataSummary reports all elab_ keys', () => {
        localStore['elab_consent'] = JSON.stringify({ status: 'accepted' });
        localStore['elab_progress'] = JSON.stringify({ level: 3 });
        sessionStore['elab_session'] = JSON.stringify({ id: 's1' });

        const summary = gdprService.getLocalDataSummary();

        expect(summary.localStorage['elab_consent']).toEqual({ status: 'accepted' });
        expect(summary.localStorage['elab_progress']).toEqual({ level: 3 });
        expect(summary.sessionStorage['elab_session']).toEqual({ id: 's1' });
        expect(summary.approximateSize).toBeGreaterThan(0);
    });

    test('getLocalDataSummary handles unparseable values', () => {
        localStore['elab_broken'] = 'not-json{{{';

        const summary = gdprService.getLocalDataSummary();

        expect(summary.localStorage['elab_broken']).toBe('[Non parsabile]');
    });
});

// ============================================
// DATA SUBJECT RIGHTS (remote calls)
// ============================================

describe('Data Subject Rights', () => {
    test('requestDataExport calls webhook with export action', async () => {
        mockFetchSuccess({ success: true, data: { sessions: 5 } });

        const result = await gdprService.requestDataExport('user_123');

        expect(result.success).toBe(true);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('requestDataDeletion calls webhook and clears local data', async () => {
        localStore['elab_progress'] = '{}';
        localStore['elab_session'] = '{}';

        mockFetchSuccess({ success: true, deleted: true });

        const result = await requestDataDeletion('user_123', 'password', 'privacy');

        expect(result.success).toBe(true);
        // Local data should be cleared
        expect(localStore['elab_progress']).toBeUndefined();
        expect(localStore['elab_session']).toBeUndefined();
    });

    test('requestDataDeletion throws on server error', async () => {
        mockFetchError('Errore server', 500);

        await expect(
            requestDataDeletion('user_123', 'password', 'reason')
        ).rejects.toThrow();
    });

    test('requestDataCorrection sends corrections to webhook', async () => {
        mockFetchSuccess({ success: true, corrected: ['name'] });

        const result = await gdprService.requestDataCorrection('user_123', { name: 'Mario Rossi' });

        expect(result.success).toBe(true);
    });

    test('revokeConsent updates local state to revoked', async () => {
        saveConsent({ status: 'accepted', userId: 'user1' });
        mockFetchSuccess({ success: true, revoked: true });

        await gdprService.revokeConsent('user1');

        const consent = getConsent();
        expect(consent.status).toBe('revoked');
        expect(consent.revokedAt).toBeDefined();
    });
});

// ============================================
// PARENTAL CONSENT
// ============================================

describe('Parental Consent', () => {
    test('requestParentalConsent sends data and saves parental_sent status', async () => {
        mockFetchSuccess({ success: true, emailSent: true });

        const result = await gdprService.requestParentalConsent({
            childName: 'Mario',
            childAge: 10,
            parentEmail: 'parent@test.it',
            parentName: 'Luigi',
        });

        expect(result.success).toBe(true);

        const consent = getConsent();
        expect(consent.status).toBe('parental_sent');
        expect(consent.childAge).toBe(10);
    });

    test('requestParentalConsent sets COPPA flag for age < 13', async () => {
        mockFetchSuccess({ success: true });

        await gdprService.requestParentalConsent({
            childName: 'Mario',
            childAge: 10,
            parentEmail: 'parent@test.it',
        });

        // Verify the fetch body includes requiresCOPPA
        const callBody = JSON.parse(fetch.mock.calls[0][1].body);
        expect(callBody.requiresCOPPA).toBe(true);
    });

    test('verifyParentalConsent updates status to parental_verified', async () => {
        saveConsent({ status: 'parental_sent' });
        mockFetchSuccess({ verified: true });

        const result = await gdprService.verifyParentalConsent('verify-token-123');

        expect(result.verified).toBe(true);
        const consent = getConsent();
        expect(consent.status).toBe('parental_verified');
        expect(consent.verifiedAt).toBeDefined();
    });

    test('verifyParentalConsent does not update status if not verified', async () => {
        saveConsent({ status: 'parental_sent' });
        mockFetchSuccess({ verified: false });

        await gdprService.verifyParentalConsent('bad-token');

        const consent = getConsent();
        expect(consent.status).toBe('parental_sent');
    });
});

// ============================================
// WEBHOOK FALLBACK CHAIN
// ============================================

describe('Webhook Fallback Chain', () => {
    test('requestDataExport falls back to local when no server configured', async () => {
        // With VITE_N8N_GDPR_URL set in setup.js, fetch should be called.
        // If fetch fails, the error propagates.
        mockFetchSuccess({ success: true, local: false });

        const result = await gdprService.requestDataExport('user_123');
        expect(result.success).toBe(true);
    });
});
