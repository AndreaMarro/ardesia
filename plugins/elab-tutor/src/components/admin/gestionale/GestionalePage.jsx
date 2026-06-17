// ============================================
// ELAB Gestionale - Shell Principale
// ERP Aziendale professionale
// © Andrea Marro — 18 Febbraio 2026
// Tutti i diritti riservati
// ============================================

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import useIsMobile from '../../../hooks/useIsMobile';
import { COLORS, MODULES } from './GestionaleStyles';
import GlobalSearch from './shared/GlobalSearch';
import NotificationCenter from './shared/NotificationCenter';
import NotificationService from './services/NotificationService';
import { fattureService, ordiniService, prodottiService } from './GestionaleService';

// Code-split: each gestionale module loads only when selected
const SetupWizard = lazy(() => import('./modules/SetupWizard'));
const DashboardGestionale = lazy(() => import('./modules/DashboardGestionale'));
const FatturazioneModule = lazy(() => import('./modules/FatturazioneModule'));
const OrdiniVenditeModule = lazy(() => import('./modules/OrdiniVenditeModule'));
const MagazzinoKitModule = lazy(() => import('./modules/MagazzinoKitModule'));
const DipendentiModule = lazy(() => import('./modules/DipendentiModule'));
const BancheFinanzeModule = lazy(() => import('./modules/BancheFinanzeModule'));
const BurocraziaModule = lazy(() => import('./modules/BurocraziaModule'));
const MarketingClientiModule = lazy(() => import('./modules/MarketingClientiModule'));
const ImpostazioniModule = lazy(() => import('./modules/ImpostazioniModule'));
const ReportModule = lazy(() => import('./modules/ReportModule'));

export default function GestionalePage() {
    const isMobile = useIsMobile();
    const [activeModule, setActiveModule] = useState('dashboard');
    const [setupDone, setSetupDone] = useState(
        () => localStorage.getItem('elab_gest_setupComplete') === 'true'
    );
    const [searchOpen, setSearchOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Cmd+K / Ctrl+K shortcut
    useEffect(() => {
        function handleKeyDown(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(prev => !prev);
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Load notifications
    const refreshNotifications = useCallback(async () => {
        try {
            const [fatture, ordini, prodotti] = await Promise.all([
                fattureService.getAll().catch(() => []),
                ordiniService.getAll().catch(() => []),
                prodottiService.getAll().catch(() => []),
            ]);
            const notifs = NotificationService.checkNotifications({ fatture, ordini, prodotti });
            setNotifications(notifs);
        } catch {
            setNotifications([]);
        }
    }, []);

    useEffect(() => {
        if (setupDone) refreshNotifications();
    }, [setupDone, refreshNotifications]);

    const moduleFallback = (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--elab-hex-737373)' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}></div>
            <div style={{ fontSize: '14px' }}>Caricamento modulo...</div>
        </div>
    );

    // Wizard primo avvio
    if (!setupDone) {
        return <Suspense fallback={moduleFallback}><SetupWizard isMobile={isMobile} onComplete={() => setSetupDone(true)} /></Suspense>;
    }

    const renderModule = () => {
        let content;
        switch (activeModule) {
            case 'dashboard': content = <DashboardGestionale onNavigate={setActiveModule} isMobile={isMobile} />; break;
            case 'fatture': content = <FatturazioneModule isMobile={isMobile} />; break;
            case 'ordini': content = <OrdiniVenditeModule isMobile={isMobile} />; break;
            case 'magazzino': content = <MagazzinoKitModule isMobile={isMobile} />; break;
            case 'dipendenti': content = <DipendentiModule isMobile={isMobile} />; break;
            case 'finanze': content = <BancheFinanzeModule isMobile={isMobile} />; break;
            case 'documenti': content = <BurocraziaModule isMobile={isMobile} />; break;
            case 'marketing': content = <MarketingClientiModule isMobile={isMobile} />; break;
            case 'impostazioni': content = <ImpostazioniModule isMobile={isMobile} />; break;
            case 'report': content = <ReportModule isMobile={isMobile} />; break;
            default: content = <DashboardGestionale onNavigate={setActiveModule} isMobile={isMobile} />;
        }
        return <Suspense fallback={moduleFallback}>{content}</Suspense>;
    };

    // === MOBILE: pill bar orizzontale ===
    if (isMobile) {
        return (
            <div style={{ background: COLORS.bg, minHeight: '70vh' }}>
                {/* Header */}
                <div style={{
                    background: COLORS.primary, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}></span>
                        <div>
                            <div style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>Gestionale ELAB</div>
                            <div style={{ color: COLORS.textMuted, fontSize: '14px' }}>Enterprise Resource Planning</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <NotificationCenter notifications={notifications} onRefresh={refreshNotifications} />
                        <button
                            onClick={() => setSearchOpen(true)}
                            style={{
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                padding: '8px', minWidth: '44px', minHeight: '44px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            title="Cerca (Cmd+K)"
                            aria-label="Ricerca globale"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Pill bar scrollabile */}
                <div style={{
                    display: 'flex', overflowX: 'auto', gap: '6px',
                    padding: '10px 12px', background: COLORS.primaryLight,
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                }}>
                    {MODULES.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setActiveModule(m.id)}
                            style={{
                                flexShrink: 0,
                                padding: '7px 14px',
                                borderRadius: '20px',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: activeModule === m.id ? '700' : '500',
                                background: activeModule === m.id ? m.color : 'rgba(255,255,255,0.1)',
                                color: activeModule === m.id ? '#fff' : 'rgba(255,255,255,0.7)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                minHeight: '44px',
                            }}
                        >
                            {m.icon} {m.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ padding: '14px' }}>
                    {renderModule()}
                </div>

                {/* GlobalSearch overlay */}
                <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

            </div>
        );
    }

    // === DESKTOP: sidebar + content ===
    return (
        <div style={{
            display: 'flex', background: COLORS.bg, minHeight: '75vh',
            borderRadius: '12px', overflow: 'hidden',
            border: `1px solid ${COLORS.border}`,
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '200px', flexShrink: 0, background: COLORS.primary,
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Logo/Brand */}
                <div style={{
                    padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                        <span style={{ fontSize: '24px' }}></span>
                        <div>
                            <div style={{
                                color: '#fff', fontWeight: '800', fontSize: '15px',
                                letterSpacing: '-0.3px',
                            }}>Gestionale</div>
                            <div style={{
                                color: COLORS.textMuted, fontSize: '14px',
                                textTransform: 'uppercase', letterSpacing: '1px',
                            }}>ELAB ERP</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
                    {MODULES.map(m => {
                        const isActive = activeModule === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setActiveModule(m.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                                    fontSize: '14px',
                                    fontWeight: isActive ? '600' : '400',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.15s',
                                    marginBottom: '2px',
                                    position: 'relative',
                                    minHeight: '44px',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) e.target.style.background = 'rgba(255,255,255,0.06)';
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) e.target.style.background = 'transparent';
                                }}
                            >
                                {isActive && (
                                    <div style={{
                                        position: 'absolute', left: 0, top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '3px', height: '20px',
                                        background: m.color, borderRadius: '0 3px 3px 0',
                                    }} />
                                )}
                                <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>{m.icon}</span>
                                <span>{m.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div style={{
                    padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '14px', color: 'rgba(255,255,255,0.3)', textAlign: 'center',
                }}>
                    ELAB Gestionale v1.0
                </div>
            </aside>

            {/* Content Area */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '75vh' }}>
                {/* Top bar with search + notifications */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    gap: '8px', padding: '10px 24px 0',
                }}>
                    <button
                        onClick={() => setSearchOpen(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                            borderRadius: '8px', padding: '8px 14px', cursor: 'pointer',
                            fontSize: '14px', color: COLORS.textMuted, minHeight: '44px',
                        }}
                        title="Ricerca globale (Cmd+K)"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        Cerca...
                        <kbd style={{
                            fontSize: '14px', background: COLORS.card, padding: '2px 6px',
                            borderRadius: '4px', border: `1px solid ${COLORS.border}`,
                            marginLeft: '8px',
                        }}>
                            {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+K
                        </kbd>
                    </button>
                    <NotificationCenter notifications={notifications} onRefresh={refreshNotifications} />
                </div>

                {/* Module content */}
                <div style={{ flex: 1, padding: '14px 24px 24px', overflowY: 'auto' }}>
                    {renderModule()}
                </div>
            </main>

            {/* GlobalSearch overlay */}
            <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

        </div>
    );
}
