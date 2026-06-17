// ============================================
// ELAB Tutor - Setup Test
// © Andrea Marro — 15/02/2026
// ============================================

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ============================================
// MOCK GLOBALI
// ============================================

// Mock localStorage/sessionStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
});

// Mock crypto
Object.defineProperty(window, 'crypto', {
    value: {
        randomUUID: vi.fn(() => 'test-uuid-1234-5678-90ab-cdef'),
        getRandomValues: vi.fn((array) => {
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
            return array;
        }),
        subtle: {
            digest: vi.fn(async (algorithm, data) => {
                // Mock semplice di SHA-256
                return new ArrayBuffer(32);
            }),
            importKey: vi.fn(async () => ({ type: 'mock-key' })),
            deriveKey: vi.fn(async () => ({ type: 'mock-derived-key' })),
            encrypt: vi.fn(async () => new ArrayBuffer(32)),
            decrypt: vi.fn(async () => new ArrayBuffer(32)),
            sign: vi.fn(async () => new ArrayBuffer(32)),
            verify: vi.fn(async () => true),
        },
    },
});

// Mock fetch
global.fetch = vi.fn();

// Mock import.meta.env
global.import = {
    meta: {
        env: {
            VITE_N8N_AUTH_URL: 'https://api.elab-tutor.test/auth',
            VITE_N8N_GDPR_URL: 'https://api.elab-tutor.test/gdpr',
            VITE_AUTH_URL: 'https://api.elab-tutor.test/auth',
        },
    },
};

// ============================================
// HELPERS
// ============================================

/**
 * Resetta tutti i mock prima di ogni test
 */
beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.getItem.mockReturnValue(null);
});

/**
 * Crea un token HMAC mock a 2 parti (base64url_payload.signature)
 * Il payload usa millisecondi (Date.now()) per iat/exp
 */
export function createMockHMACToken(payload = {}) {
    const body = {
        email: 'test@example.com',
        userId: 'user_123',
        iat: Date.now(),
        exp: Date.now() + 15 * 60 * 1000, // 15 min in milliseconds
        ...payload,
    };
    const encoded = btoa(JSON.stringify(body))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${encoded}.mock-hmac-signature`;
}

/**
 * Backward compat alias — chiama createMockHMACToken
 */
export function createMockJWT(payload = {}) {
    return createMockHMACToken(payload);
}

/**
 * Mocka una risposta fetch di successo
 */
export function mockFetchSuccess(data, status = 200) {
    fetch.mockResolvedValueOnce({
        ok: true,
        status,
        json: async () => data,
    });
}

/**
 * Mocka una risposta fetch di errore
 */
export function mockFetchError(errorMessage, status = 400) {
    fetch.mockResolvedValueOnce({
        ok: false,
        status,
        json: async () => ({ error: errorMessage }),
    });
}

/**
 * Simula dati in localStorage
 */
export function mockLocalStorage(key, value) {
    localStorageMock.getItem.mockImplementation((k) => {
        if (k === key) return JSON.stringify(value);
        return null;
    });
}

/**
 * Simula dati in sessionStorage
 */
export function mockSessionStorage(key, value) {
    sessionStorageMock.getItem.mockImplementation((k) => {
        if (k === key) return JSON.stringify(value);
        return null;
    });
}
