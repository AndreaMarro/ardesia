// ============================================
// ELAB TUTOR V4 - Assistente AI Premium
// Piattaforma educativa per elettronica
// © Andrea Marro — 08/02/2026
// Tutti i diritti riservati
// ============================================

import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import useIsMobile from './hooks/useIsMobile';
import useOnlineStatus from './hooks/useOnlineStatus';
import { startSyncInterval, stopSyncInterval } from './services/supabaseSync';
import { warmupRender } from './services/api';

import RequireAuth from './components/auth/RequireAuth';
import RequireLicense from './components/auth/RequireLicense';
import ConsentBanner from './components/common/ConsentBanner';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastContainer from './components/common/Toast';
// Lazy-loaded pages — caricate solo quando servono
const PrivacyPolicy = lazy(() => import('./components/common/PrivacyPolicy'));
const ElabTutorV4 = lazy(() => import('./components/tutor/ElabTutorV4'));
const AdminPage = lazy(() => import('./components/admin/AdminPage'));
const StudentDashboard = lazy(() => import('./components/student/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./components/teacher/TeacherDashboard'));
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const RegisterPage = lazy(() => import('./components/auth/RegisterPage'));
const DataDeletion = lazy(() => import('./components/auth/DataDeletion'));
const WelcomePage = lazy(() => import('./components/WelcomePage'));
const ShowcasePage = lazy(() => import('./components/ShowcasePage'));
const LandingPNRR = lazy(() => import('./components/LandingPNRR'));
const Navbar = lazy(() => import('./components/social/Navbar'));
const UnlimWrapper = lazy(() => import('./components/unlim/UnlimWrapper'));
const LavagnaShell = lazy(() => import('./components/lavagna/LavagnaShell'));
const VetrinaV2 = lazy(() => import('./components/lavagna/VetrinaV2'));
const DashboardShell = lazy(() => import('./components/dashboard'));
// iter 35 P0 — Tea HomePage integrata main app (5 card hero + cronologia)
const HomePage = lazy(() => import('./components/HomePage'));

function LoadingFallback() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#F0F4F8',
            fontFamily: "'Open Sans', sans-serif",
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '12px', color: '#1E4D8C', fontWeight: '800', fontFamily: "'Open Sans', sans-serif" }}>ELAB</div>
                <div style={{ color: '#1E4D8C', fontSize: '15px', fontWeight: '500' }}>
                    Caricamento...
                </div>
            </div>
        </div>
    );
}

// Hash-based routing: maps hash fragments to page names (P0-6)
// iter 35 P0: 'home' added as new default landing (Tea-style 5 card grid + cronologia)
const VALID_HASHES = ['home', 'tutor', 'admin', 'teacher', 'vetrina', 'vetrina2', 'login', 'register', 'dashboard', 'dashboard-v2', 'showcase', 'prova', 'lavagna'];
const HASH_PAGE_ALIASES = {
    'lavagna-solo': 'lavagna',
};

// Iter 44 BUG fix: HomePage sub-routes — direct nav `#chatbot-only` /
// `#about-easter` / `#glossario` from any other page (e.g. Lavagna modal)
// must reset currentPage='home' so HomePage renders + reads hash internally.
// Without this, getPageFromHash returned null → setCurrentPage NOT called →
// UI stuck on previous page (verified via Chrome MCP smoke prod 2026-05-06).
// Sync test: tests/unit/navigation.test.js (49 cases).
const HOMEPAGE_SUBROUTES = ['chatbot-only', 'about-easter', 'glossario'];

function getPageFromHash() {
    const raw = window.location.hash.replace('#', '').split('?')[0].toLowerCase();
    if (HASH_PAGE_ALIASES[raw]) return HASH_PAGE_ALIASES[raw];
    if (HOMEPAGE_SUBROUTES.includes(raw)) return 'home';
    return VALID_HASHES.includes(raw) ? raw : null;
}

/** Extract ?exp=xxx from hash for deep-linking experiments */
function getExpFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/[?&]exp=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

/** Dashboard-v2 live flag + teacher + range from hash query (E2E spec 15). */
function getDashboardV2Params() {
    if (typeof window === 'undefined') return { enabled: false };
    const hash = window.location.hash || '';
    const q = hash.split('?')[1] || '';
    const params = new URLSearchParams(q);
    return {
        enabled: params.get('live') === '1',
        teacherId: params.get('teacher') || undefined,
        range: ['7d', '30d', '90d'].includes(params.get('range')) ? params.get('range') : '7d',
    };
}

function SkipToContent() {
    return (
        <a href="#main-content" className="skip-to-content"
           onClick={(e) => {
               e.preventDefault();
               const target = document.getElementById('main-content');
               if (target) { target.focus(); target.scrollIntoView(); }
           }}>
            Vai al simulatore
        </a>
    );
}

function getPathnameRoute() {
    if (typeof window === 'undefined') return null;
    const p = window.location.pathname;
    if (p === '/privacy') return 'privacy';
    if (p === '/data-deletion') return 'data-deletion';
    if (p.startsWith('/scuole')) return 'scuole';
    return null;
}

function AppRouter() {
    const [pathnameRoute, setPathnameRoute] = useState(getPathnameRoute);
    // iter 35 P0: nuova homepage Tea-style come default (era 'showcase' = WelcomePage classe)
    const initialPage = getPageFromHash() || 'home';
    const [currentPage, setCurrentPage] = useState(initialPage);
    const { user, isAdmin, isDocente } = useAuth();
    const isMobile = useIsMobile();
    const [menuOpen, setMenuOpen] = useState(false);

    const navigate = useCallback((page) => {
        setCurrentPage(page);
        setPathnameRoute(null);
        setMenuOpen(false);
        window.scrollTo(0, 0);
        // Push full path to fix hybrid pathname/hash routing (C11)
        // From /scuole/pnrr clicking "Prova" must reset pathname to /
        if (VALID_HASHES.includes(page)) {
            window.history.pushState(null, '', '/#' + page);
        }
    }, []);

    // Sync URL → state on hashchange and popstate (back/forward) (C11)
    useEffect(() => {
        function syncFromUrl() {
            const pRoute = getPathnameRoute();
            setPathnameRoute(pRoute);
            if (!pRoute) {
                const page = getPageFromHash();
                if (page && page !== currentPage) {
                    setCurrentPage(page);
                }
            }
            window.scrollTo(0, 0);
        }
        window.addEventListener('hashchange', syncFromUrl);
        window.addEventListener('popstate', syncFromUrl);
        return () => {
            window.removeEventListener('hashchange', syncFromUrl);
            window.removeEventListener('popstate', syncFromUrl);
        };
    }, [currentPage]);

    // /privacy route — full-page privacy policy (no auth, no navbar)
    if (pathnameRoute === 'privacy') {
        return <PrivacyPolicy />;
    }

    // /data-deletion route — GDPR Art. 17 data deletion (no navbar)
    if (pathnameRoute === 'data-deletion') {
        return (
            <Suspense fallback={<LoadingFallback />}>
                <DataDeletion
                    user={user}
                    onDataDeleted={() => { window.location.href = '/'; }}
                    onCancel={() => { window.location.href = '/'; }}
                />
            </Suspense>
        );
    }

    // /scuole/pnrr e /scuole — landing page PNRR e scuole (no auth, no navbar)
    if (pathnameRoute === 'scuole') {
        return (
            <Suspense fallback={<LoadingFallback />}>
                <LandingPNRR onNavigate={navigate} />
            </Suspense>
        );
    }

    // iter 35 P0 — HomePage Tea-style 5 card grid + cronologia (nuovo default)
    if (currentPage === 'home') {
        return (
            <Suspense fallback={<LoadingFallback />}>
                <HomePage onNavigate={navigate} />
            </Suspense>
        );
    }

    // Tutte le vetrine → WelcomePage unica (resta accessibile via #showcase per legacy login class_key)
    if (currentPage === 'showcase' || currentPage === 'vetrina2' || currentPage === 'vetrina') {
        return (
            <Suspense fallback={<LoadingFallback />}>
                <WelcomePage onNavigate={navigate} />
            </Suspense>
        );
    }

    // Modalita' prova — simulatore REALE senza login, esperimenti Vol.1
    if (currentPage === 'prova') {
        const deepLinkExp = getExpFromHash();
        return (
            <div>
                <SkipToContent />
                <main id="main-content" tabIndex="-1" style={{ outline: 'none' }}>
                    <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                            <UnlimWrapper>
                                <ElabTutorV4 provaMode onNavigate={navigate} initialExperimentId={deepLinkExp} />
                            </UnlimWrapper>
                        </Suspense>
                    </ErrorBoundary>
                </main>
            </div>
        );
    }

    // S8: #tutor ora punta alla Lavagna (Strangler Fig switch)
    if (currentPage === 'tutor') {
        // Redirect silenzioso: aggiorna URL ma non ricaricare la pagina
        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', '/#lavagna');
        }
    }

    // Lavagna — nuova esperienza workspace
    if (currentPage === 'lavagna' || currentPage === 'tutor') {
        return (
            <Suspense fallback={<LoadingFallback />}>
                <LavagnaShell />
            </Suspense>
        );
    }

    // Pagine full-screen senza navbar (tutor con auth + licenza)
    if (currentPage === 'tutor') {
        return (
            <div>
                <SkipToContent />
                {/* Top bar navigazione */}
                <nav style={topBarStyles.bar} aria-label="Navigazione principale">
                    <span style={topBarStyles.brand} onClick={() => navigate('tutor')}>ELAB Tutor</span>
                    {isMobile ? (
                        <>
                            <button onClick={() => setMenuOpen(!menuOpen)} style={topBarStyles.hamburger}
                                aria-expanded={menuOpen} aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}>
                                {menuOpen ? '✕' : '☰'}
                            </button>
                            {menuOpen && (
                                <div style={topBarStyles.mobileMenu}>
                                    {user ? (
                                        <>
                                            <span style={topBarStyles.mobileLink}>{user.name?.split(' ')[0] || user.username}</span>
                                            {(isDocente || isAdmin) && <button onClick={() => navigate('dashboard')} style={topBarStyles.mobileLink}>Dashboard</button>}
                                            {(isDocente || isAdmin) && <button onClick={() => navigate('teacher')} style={topBarStyles.mobileLinkTeacher}>Area Docente</button>}
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => navigate('login')} style={topBarStyles.mobileLink}>Accedi</button>
                                            <button onClick={() => navigate('register')} style={topBarStyles.mobileLinkGreen}>Registrati</button>
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={topBarStyles.links}>
                            {user ? (
                                <>
                                    <span style={topBarStyles.link}>{user.name?.split(' ')[0] || user.username}</span>
                                    {(isDocente || isAdmin) && <button onClick={() => navigate('dashboard')} style={topBarStyles.link}>Dashboard</button>}
                                    {(isDocente || isAdmin) && <button onClick={() => navigate('teacher')} style={topBarStyles.linkTeacher}>Area Docente</button>}
                                </>
                            ) : (
                                <>
                                    <button onClick={() => navigate('login')} style={topBarStyles.link}>Accedi</button>
                                    <button onClick={() => navigate('register')} style={topBarStyles.linkGreen}>Registrati</button>
                                </>
                            )}
                        </div>
                    )}
                </nav>
                <main id="main-content" tabIndex="-1" style={{ outline: 'none' }}>
                    <RequireAuth onNavigate={navigate}>
                        <RequireLicense onNavigate={navigate}>
                            <ErrorBoundary>
                                <Suspense fallback={<LoadingFallback />}>
                                    <UnlimWrapper>
                                        <ElabTutorV4 />
                                    </UnlimWrapper>
                                </Suspense>
                            </ErrorBoundary>
                        </RequireLicense>
                    </RequireAuth>
                </main>
            </div>
        );
    }

    // Pagine auth (login/register) senza navbar
    if (currentPage === 'login') {
        return <Suspense fallback={<LoadingFallback />}><LoginPage onNavigate={navigate} /></Suspense>;
    }
    if (currentPage === 'register') {
        return <Suspense fallback={<LoadingFallback />}><RegisterPage onNavigate={navigate} /></Suspense>;
    }

    // Pagine social con navbar
    return (
        <Suspense fallback={<LoadingFallback />}>
            <div style={{ height: '100%', overflowY: 'auto', background: '#F0F4F8' }}>
                <Navbar currentPage={currentPage} onNavigate={navigate} />
                {currentPage === 'admin' && <ErrorBoundary><AdminPage onNavigate={navigate} /></ErrorBoundary>}
                {currentPage === 'dashboard' && <RequireAuth onNavigate={navigate}><ErrorBoundary><StudentDashboard onNavigate={navigate} /></ErrorBoundary></RequireAuth>}
                {currentPage === 'dashboard-v2' && (() => {
                    const dp = getDashboardV2Params();
                    return <ErrorBoundary><DashboardShell onNavigate={navigate} enabled={dp.enabled} teacherId={dp.teacherId} range={dp.range} /></ErrorBoundary>;
                })()}
                {currentPage === 'teacher' && <RequireAuth onNavigate={navigate}>{isDocente || isAdmin ? <ErrorBoundary><TeacherDashboard onNavigate={navigate} /></ErrorBoundary> : <AccessDeniedMessage onNavigate={navigate} />}</RequireAuth>}
            </div>
        </Suspense>
    );
}

function AccessDeniedMessage({ onNavigate }) {
    return (
        <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            minHeight: 'calc(100vh - 56px)',
            background: '#F0F4F8',
            fontFamily: "'Open Sans', sans-serif",
        }}>
            <div style={{
                maxWidth: '480px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '16px',
                padding: '40px 32px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{'\u{1F6AB}'}</div>
                <h2 style={{ color: '#1E4D8C', margin: '0 0 12px', fontSize: '20px' }}>
                    Accesso non autorizzato
                </h2>
                <p style={{ color: '#666', margin: '0 0 24px', fontSize: '15px', lineHeight: '1.6' }}>
                    Questa area richiede permessi specifici.
                </p>
                <button
                    onClick={() => onNavigate('tutor')}
                    style={{
                        padding: '12px 28px',
                        border: 'none',
                        borderRadius: '10px',
                        background: '#1E4D8C',
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    Torna al Tutor
                </button>
            </div>
        </div>
    );
}

/**
 * Route-aware ConsentBanner gate.
 * Skip on B2B landings (/scuole/*) and teacher workspace (#lavagna) —
 * consent is a minor-facing flow, not needed there. Also ensures a single
 * mount at app root (duplicates removed from ElabTutorV4 + NewElabSimulator).
 */
function GatedConsentBanner() {
    const [allowed, setAllowed] = useState(() => isConsentRouteAllowed());
    useEffect(() => {
        const sync = () => setAllowed(isConsentRouteAllowed());
        window.addEventListener('hashchange', sync);
        window.addEventListener('popstate', sync);
        return () => {
            window.removeEventListener('hashchange', sync);
            window.removeEventListener('popstate', sync);
        };
    }, []);
    if (!allowed) return null;
    return <ConsentBanner />;
}

/**
 * Route pattern dove ConsentBanner NON deve mostrarsi (flussi docente/admin,
 * landing B2B, auth). Feature-map 2026-04-24 §ATTRITO critico: banner
 * "Quanti anni hai?" blocca docenti su /scuole/pnrr, #dashboard-v2, #lavagna.
 */
const CONSENT_SKIP_HASHES = new Set([
    'lavagna',
    'lavagna-solo',
    'tutor',
    'dashboard',
    'dashboard-v2',
    'teacher',
    'admin',
    'account',
    'login',
    'register',
]);

function isConsentRouteAllowed() {
    if (typeof window === 'undefined') return true;
    const pRoute = getPathnameRoute();
    if (pRoute === 'scuole') return false;
    const page = getPageFromHash();
    if (page && CONSENT_SKIP_HASHES.has(page)) return false;
    return true;
}

function OfflineBanner() {
    const isOnline = useOnlineStatus();
    if (isOnline) return null;
    return (
        <div role="alert" aria-live="assertive" style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000,
            background: 'linear-gradient(135deg, #E8941C, #D08018)', color: '#fff',
            padding: '10px 16px',
            fontSize: 14, fontFamily: 'var(--font-sans)', textAlign: 'center',
            fontWeight: 600, boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
            <span aria-hidden="true" style={{ fontSize: 18 }}>{'//\u00A0'}</span>
            <span>Sei offline &mdash; il simulatore e gli esperimenti funzionano! UNLIM e la compilazione di nuovo codice no.</span>
        </div>
    );
}

function App() {
    // G49: Start Supabase sync queue processing on mount
    useEffect(() => {
        startSyncInterval();
        warmupRender(); // Ping Render backend on load to reduce cold start (37s → ~0s)
        return () => stopSyncInterval();
    }, []);

    return (
        <ErrorBoundary>
            <AuthProvider>
                <OfflineBanner />
                <AppRouter />

                <GatedConsentBanner />
                <ToastContainer />
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;

const topBarStyles = {
    bar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px',
        height: '44px',
        background: 'linear-gradient(90deg, #0d1b2a, #1E4D8C)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        zIndex: 10000,
        position: 'relative',
    },
    brand: {
        color: '#4A7A25',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    links: {
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
    },
    link: {
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: '4px',
        fontWeight: '500',
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
    },
    linkGreen: {
        background: 'rgba(145,191,69,0.2)',
        border: 'none',
        color: '#4A7A25',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: '4px',
        fontWeight: '600',
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
    },
    linkTeacher: {
        background: 'rgba(30,77,140,0.2)',
        border: 'none',
        color: '#93C5FD',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: '4px',
        fontWeight: '600',
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
    },
    linkAdmin: {
        background: 'rgba(239,68,68,0.2)',
        border: 'none',
        color: '#EF4444',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: '4px',
        fontWeight: '600',
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
    },
    hamburger: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '6px 10px',
        minWidth: 44,
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mobileMenu: {
        position: 'absolute',
        top: '44px',
        left: 0,
        right: 0,
        background: 'linear-gradient(180deg, #1E4D8C, #0d1b2a)',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 16px 16px',
        gap: '4px',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    },
    mobileLink: {
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '12px 16px',
        borderRadius: '8px',
        fontWeight: '500',
        textAlign: 'left',
    },
    mobileLinkGreen: {
        background: 'rgba(145,191,69,0.2)',
        border: 'none',
        color: '#4A7A25',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '12px 16px',
        borderRadius: '8px',
        fontWeight: '600',
        textAlign: 'left',
    },
    mobileLinkTeacher: {
        background: 'rgba(30,77,140,0.2)',
        border: 'none',
        color: '#93C5FD',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '12px 16px',
        borderRadius: '8px',
        fontWeight: '600',
        textAlign: 'left',
    },
    mobileLinkAdmin: {
        background: 'rgba(239,68,68,0.2)',
        border: 'none',
        color: '#EF4444',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '12px 16px',
        borderRadius: '8px',
        fontWeight: '600',
        textAlign: 'left',
    },
};
