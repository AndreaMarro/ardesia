// ============================================
// ELAB Tutor - Top Bar Component
// G22: Volume Sections — shows active volume + [Cambia]
// © Andrea Marro — 13/02/2026, G22 29/03/2026
// ============================================

import React from 'react';
import { VOLUMES } from '../../data/experiments-index';

export default function TutorTopBar({
    selectedVolume,
    activeVolume,
    onChangeVolume,
    onToggleSidebar,
    sidebarCollapsed,
    onToggleChat,
    showChat,
    isFullscreen,
    onToggleFullscreen,
    onExportSession,
    sessionLogLength,
}) {
    // WCAG AA: sfondo badge con testo bianco ≥ 4.5:1 contrasto
    const volumeColors = { 1: 'var(--elab-lime)', 2: '#C47A0A', 3: '#C43A2D', inventor: 'var(--elab-navy)' };

    // Build volume label with experiment count
    const getVolumeInfo = () => {
        if (!activeVolume) return null;
        if (activeVolume === 'inventor') {
            return { label: 'Inventore', count: null, color: volumeColors.inventor };
        }
        const vol = VOLUMES[activeVolume - 1];
        const count = vol?.experiments?.length || 0;
        return { label: `Volume ${activeVolume}`, count, color: volumeColors[activeVolume] || 'var(--elab-navy)' };
    };

    const volInfo = getVolumeInfo();

    return (
        <header className="tutor-topbar">
            <div className="topbar-left">
                <button
                    className="topbar-sidebar-toggle"
                    onClick={onToggleSidebar}
                    title={sidebarCollapsed ? 'Espandi barra laterale (Ctrl+B)' : 'Comprimi barra laterale (Ctrl+B)'}
                    aria-label="Apri/chiudi menu"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>

                <div className="topbar-brand">
                    <img src="/assets/mascot/logo-senza-sfondo.png" alt="ELAB" className="topbar-mascot" style={{ objectFit: 'contain' }} />
                    <div className="topbar-brand-text">
                        <span className="topbar-title">ELAB</span>
                        <span className="topbar-subtitle">UNLIM</span>
                    </div>
                </div>
            </div>

            <div className="topbar-center">
                {volInfo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            className="topbar-volume-badge"
                            style={{ background: volInfo.color }}
                        >
                            {volInfo.label}
                            {volInfo.count != null && (
                                <span style={{ fontWeight: 400, marginLeft: '6px', opacity: 0.9 }}>
                                    — {volInfo.count} esp.
                                </span>
                            )}
                        </div>
                        {onChangeVolume && (
                            <button
                                onClick={onChangeVolume}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    fontSize: '14px',
                                    color: 'rgba(255,255,255,0.8)',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-sans, system-ui)',
                                    minHeight: '44px',
                                    whiteSpace: 'nowrap',
                                }}
                                title="Cambia volume"
                            >
                                Cambia
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="topbar-right">
                {sessionLogLength > 0 && (
                    <button
                        className="topbar-btn topbar-session-btn"
                        onClick={onExportSession}
                        title="Esporta sessione"
                        aria-label="Esporta sessione"
                    >
                        <span className="session-dot" />
                        <span className="topbar-btn-label">Sessione</span>
                    </button>
                )}

                <button
                    className={`topbar-btn ${showChat ? 'active' : ''}`}
                    onClick={onToggleChat}
                    title={showChat ? 'Nascondi Chat UNLIM (Ctrl+K)' : 'Mostra Chat UNLIM (Ctrl+K)'}
                    aria-label={showChat ? 'Nascondi Chat UNLIM' : 'Mostra Chat UNLIM'}
                    aria-pressed={showChat}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </button>

                <button
                    className={`topbar-btn ${isFullscreen ? 'active' : ''}`}
                    onClick={onToggleFullscreen}
                    title={isFullscreen ? 'Esci Fullscreen' : 'Fullscreen'}
                    aria-label={isFullscreen ? 'Esci fullscreen' : 'Fullscreen'}
                    aria-pressed={isFullscreen}
                >
                    {isFullscreen ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
                            <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                            <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    )}
                </button>
            </div>
        </header>
    );
}
