/**
 * Navigation / Hash-based routing tests
 * Tests getPageFromHash, getExpFromHash, getPathnameRoute, and VALID_HASHES
 *
 * Since these functions are defined inside App.jsx and not exported,
 * we replicate the exact logic here for unit testing.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// --- Replicated routing logic from src/App.jsx (lines 60-67) ---
// Iter 44 sync: 13 entries (added 'home' iter 35 + 'dashboard-v2' iter 28).
// Iter 44 fix: HomePage sub-routes (#chatbot-only, #about-easter, #glossario)
// normalized to 'home' so HomePage renders + handles hash internally
// (BUG fix: previously direct-nav to #chatbot-only froze UI on previous page).

const VALID_HASHES = ['home', 'tutor', 'admin', 'teacher', 'vetrina', 'vetrina2', 'login', 'register', 'dashboard', 'dashboard-v2', 'showcase', 'prova', 'lavagna'];
const HASH_PAGE_ALIASES = {
    'lavagna-solo': 'lavagna',
};

const HOMEPAGE_SUBROUTES = ['chatbot-only', 'about-easter', 'glossario'];

function getPageFromHash(hash = window.location.hash) {
    const raw = hash.replace('#', '').split('?')[0].toLowerCase();
    if (HASH_PAGE_ALIASES[raw]) return HASH_PAGE_ALIASES[raw];
    if (HOMEPAGE_SUBROUTES.includes(raw)) return 'home';
    return VALID_HASHES.includes(raw) ? raw : null;
}

function getExpFromHash(hash = window.location.hash) {
    const match = hash.match(/[?&]exp=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

function getPathnameRoute(pathname = window.location.pathname) {
    if (typeof pathname !== 'string') return null;
    if (pathname === '/privacy') return 'privacy';
    if (pathname === '/data-deletion') return 'data-deletion';
    if (pathname.startsWith('/scuole')) return 'scuole';
    return null;
}

// --- Tests ---

describe('getPageFromHash', () => {
    it('returns "tutor" for #tutor', () => {
        expect(getPageFromHash('#tutor')).toBe('tutor');
    });

    it('returns "admin" for #admin', () => {
        expect(getPageFromHash('#admin')).toBe('admin');
    });

    it('returns "teacher" for #teacher', () => {
        expect(getPageFromHash('#teacher')).toBe('teacher');
    });

    it('returns "vetrina" for #vetrina', () => {
        expect(getPageFromHash('#vetrina')).toBe('vetrina');
    });

    it('returns "vetrina2" for #vetrina2', () => {
        expect(getPageFromHash('#vetrina2')).toBe('vetrina2');
    });

    it('returns "login" for #login', () => {
        expect(getPageFromHash('#login')).toBe('login');
    });

    it('returns "register" for #register', () => {
        expect(getPageFromHash('#register')).toBe('register');
    });

    it('returns "dashboard" for #dashboard', () => {
        expect(getPageFromHash('#dashboard')).toBe('dashboard');
    });

    it('returns "showcase" for #showcase', () => {
        expect(getPageFromHash('#showcase')).toBe('showcase');
    });

    it('returns "prova" for #prova', () => {
        expect(getPageFromHash('#prova')).toBe('prova');
    });

    it('returns "lavagna" for #lavagna', () => {
        expect(getPageFromHash('#lavagna')).toBe('lavagna');
    });

    it('returns "lavagna" for #lavagna-solo home-only whiteboard route', () => {
        expect(getPageFromHash('#lavagna-solo')).toBe('lavagna');
    });

    it('returns null for invalid hash #nonexistent', () => {
        expect(getPageFromHash('#nonexistent')).toBeNull();
    });

    it('returns null for empty hash', () => {
        expect(getPageFromHash('')).toBeNull();
    });

    it('returns null for bare "#"', () => {
        expect(getPageFromHash('#')).toBeNull();
    });

    it('extracts page correctly when hash has query params', () => {
        expect(getPageFromHash('#tutor?exp=v1-cap6-esp1')).toBe('tutor');
    });

    it('is case insensitive — #TUTOR returns "tutor"', () => {
        expect(getPageFromHash('#TUTOR')).toBe('tutor');
    });

    it('is case insensitive — #Admin returns "admin"', () => {
        expect(getPageFromHash('#Admin')).toBe('admin');
    });

    it('is case insensitive — #LaVaGnA returns "lavagna"', () => {
        expect(getPageFromHash('#LaVaGnA')).toBe('lavagna');
    });

    it('returns null for hash with only query params #?exp=abc', () => {
        expect(getPageFromHash('#?exp=abc')).toBeNull();
    });

    // Iter 44 BUG fix: HomePage sub-routes — direct nav must NOT freeze UI.
    // Before fix: #chatbot-only / #about-easter / #glossario returned null,
    // App.jsx getPageFromHash returned null → setCurrentPage NOT called →
    // UI stuck on previous page (e.g. lavagna modal "Scegli Esperimento").
    // After fix: all 3 normalize to 'home' so HomePage renders + reads hash
    // internally for ChatbotOnly / EasterModal / external Glossario card.
    it('returns "home" for #chatbot-only (HomePage internal sub-route)', () => {
        expect(getPageFromHash('#chatbot-only')).toBe('home');
    });

    it('returns "home" for #about-easter (HomePage internal sub-route)', () => {
        expect(getPageFromHash('#about-easter')).toBe('home');
    });

    it('returns "home" for #glossario (HomePage card external link)', () => {
        expect(getPageFromHash('#glossario')).toBe('home');
    });

    it('is case insensitive — #ChatBot-Only returns "home"', () => {
        expect(getPageFromHash('#ChatBot-Only')).toBe('home');
    });

    it('returns "home" for #home (iter 35 P0 default landing)', () => {
        expect(getPageFromHash('#home')).toBe('home');
    });

    it('returns "dashboard-v2" for #dashboard-v2 (iter 28 dashboard live flag)', () => {
        expect(getPageFromHash('#dashboard-v2')).toBe('dashboard-v2');
    });
});

describe('getExpFromHash', () => {
    it('extracts exp from #tutor?exp=v1-cap6-esp1', () => {
        expect(getExpFromHash('#tutor?exp=v1-cap6-esp1')).toBe('v1-cap6-esp1');
    });

    it('returns null when no exp param is present', () => {
        expect(getExpFromHash('#tutor')).toBeNull();
    });

    it('returns null for empty hash', () => {
        expect(getExpFromHash('')).toBeNull();
    });

    it('extracts exp when there are multiple params', () => {
        expect(getExpFromHash('#tutor?exp=v1-cap6-esp1&mode=free')).toBe('v1-cap6-esp1');
    });

    it('extracts exp when it is not the first param', () => {
        expect(getExpFromHash('#tutor?mode=free&exp=v2-cap3-esp2')).toBe('v2-cap3-esp2');
    });

    it('decodes URL-encoded exp values', () => {
        expect(getExpFromHash('#tutor?exp=v1%2Dcap6%2Desp1')).toBe('v1-cap6-esp1');
    });

    it('decodes spaces encoded as %20', () => {
        expect(getExpFromHash('#tutor?exp=my%20experiment')).toBe('my experiment');
    });

    it('returns null when hash has other params but no exp', () => {
        expect(getExpFromHash('#tutor?mode=free&lang=it')).toBeNull();
    });

    it('handles exp with complex ID', () => {
        expect(getExpFromHash('#lavagna?exp=v3-cap9-esp27')).toBe('v3-cap9-esp27');
    });

    it('returns only the exp value, not trailing params', () => {
        expect(getExpFromHash('#tutor?exp=abc&other=123')).toBe('abc');
    });
});

describe('getPathnameRoute', () => {
    it('returns "privacy" for /privacy', () => {
        expect(getPathnameRoute('/privacy')).toBe('privacy');
    });

    it('returns "data-deletion" for /data-deletion', () => {
        expect(getPathnameRoute('/data-deletion')).toBe('data-deletion');
    });

    it('returns "scuole" for /scuole', () => {
        expect(getPathnameRoute('/scuole')).toBe('scuole');
    });

    it('returns "scuole" for /scuole/pnrr (sub-path)', () => {
        expect(getPathnameRoute('/scuole/pnrr')).toBe('scuole');
    });

    it('returns "scuole" for /scuole/anything', () => {
        expect(getPathnameRoute('/scuole/anything')).toBe('scuole');
    });

    it('returns null for root /', () => {
        expect(getPathnameRoute('/')).toBeNull();
    });

    it('returns null for unknown path /about', () => {
        expect(getPathnameRoute('/about')).toBeNull();
    });

    it('returns null for unknown path /settings', () => {
        expect(getPathnameRoute('/settings')).toBeNull();
    });
});

describe('VALID_HASHES completeness', () => {
    it('contains exactly 13 entries (iter 44 sync App.jsx)', () => {
        expect(VALID_HASHES).toHaveLength(13);
    });

    it('contains all expected page names (13 incl home + dashboard-v2)', () => {
        const expected = ['home', 'tutor', 'admin', 'teacher', 'vetrina', 'vetrina2', 'login', 'register', 'dashboard', 'dashboard-v2', 'showcase', 'prova', 'lavagna'];
        for (const page of expected) {
            expect(VALID_HASHES).toContain(page);
        }
    });

    it('HOMEPAGE_SUBROUTES contains chatbot-only + about-easter + glossario', () => {
        expect(HOMEPAGE_SUBROUTES).toContain('chatbot-only');
        expect(HOMEPAGE_SUBROUTES).toContain('about-easter');
        expect(HOMEPAGE_SUBROUTES).toContain('glossario');
    });

    it('has no duplicate entries', () => {
        const unique = new Set(VALID_HASHES);
        expect(unique.size).toBe(VALID_HASHES.length);
    });

    it('all entries are lowercase', () => {
        for (const hash of VALID_HASHES) {
            expect(hash).toBe(hash.toLowerCase());
        }
    });

    it('all entries are non-empty strings', () => {
        for (const hash of VALID_HASHES) {
            expect(typeof hash).toBe('string');
            expect(hash.length).toBeGreaterThan(0);
        }
    });
});
