// ============================================
// ELAB Tutor - Layout Container
// Orchestrates TopBar + Sidebar + Content + ChatOverlay
// Responsive: grid-based, adapts to all screen sizes
// (c) Andrea Marro — 13/02/2026
// ============================================

import React, { useState, useCallback, useEffect } from 'react';
import TutorTopBar from './TutorTopBar';
import TutorSidebar, { MobileBottomTabs } from './TutorSidebar';
import ChatOverlay from './ChatOverlay';
import KeyboardManager, { ShortcutsPanel } from './KeyboardManager';
import { useUnlimMode } from '../unlim/UnlimModeSwitch';
import useOverlayQueue, { markOverlayDismissed } from '../../hooks/useOverlayQueue';
import './tutor-responsive.css';

const ONBOARDING_KEY = 'elab_onboarding_seen';

/** G39: Onboarding docente — 3 scelte chiare, max 10 parole per opzione */
function OnboardingTooltip({ onDismiss, onNavigate, onLoadExperiment, onGoToDashboard }) {
    const choices = [
        {
            icon: null,
            label: 'Lezione pronta',
            desc: 'Primo circuito con LED guidato',
            color: 'var(--elab-lime)',
            action: () => {
                // Load Vol1 Cap6 Esp1 and let UNLIM guide
                if (window.__ELAB_API?.loadExperiment) {
                    window.__ELAB_API.loadExperiment('v1-cap6-esp1');
                }
                onNavigate('simulator');
                onDismiss();
            },
        },
        {
            icon: null,
            label: 'Esplora il simulatore',
            desc: 'Canvas vuoto, costruisci liberamente',
            color: 'var(--elab-navy)',
            action: () => { onNavigate('simulator'); onDismiss(); },
        },
        {
            icon: null,
            label: 'Vai alla dashboard',
            desc: 'Gestisci classi e progressi',
            color: '#996600', /* G42: WCAG AA text contrast */
            action: () => { if (onGoToDashboard) onGoToDashboard(); else onDismiss(); },
        },
    ];

    return (
        <div role="dialog" aria-modal="true" aria-label="Benvenuto — scegli come iniziare" style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.4)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease',
        }}>
            <div style={{
                background: 'var(--color-bg)', borderRadius: '16px', padding: '32px',
                maxWidth: '480px', width: '90%', boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                textAlign: 'center', position: 'relative',
            }}>
                {/* Skip button */}
                <button
                    onClick={onDismiss}
                    aria-label="Salta introduzione"
                    style={{
                        position: 'absolute', top: '12px', right: '12px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '18px', color: 'var(--color-text-tertiary, #737373)',
                        minWidth: '44px', minHeight: '44px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    ✕
                </button>
                <img src="/assets/mascot/logo-senza-sfondo.png" alt="UNLIM" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 8 }} />
                <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontFamily: 'var(--font-display, Oswald, sans-serif)', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    Benvenuto!
                </h2>
                <p style={{ margin: '0 0 24px', fontSize: '15px', color: 'var(--color-text-secondary)' }}>
                    Scegli come iniziare:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {choices.map(c => (
                        <button
                            key={c.label}
                            onClick={c.action}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '16px',
                                padding: '16px 20px', borderRadius: '12px',
                                border: `2px solid ${c.color}22`,
                                background: `${c.color}08`,
                                cursor: 'pointer', textAlign: 'left',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                minHeight: '56px',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${c.color}20`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <span style={{ fontSize: '28px', flexShrink: 0 }}>{c.icon}</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '16px', color: c.color, fontFamily: 'var(--font-display, Oswald, sans-serif)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{c.label}</div>
                                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{c.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function TutorLayout({
    // Tab/content
    activeTab,
    onTabChange,
    children,
    // Chat props
    messages,
    input,
    onInputChange,
    onSend,
    isLoading,
    onRetry,
    quickActions,
    // Chat visibility
    showChat,
    onToggleChat,
    // Fullscreen
    isFullscreen,
    onToggleFullscreen,
    // Session
    sessionLogLength,
    onExportSession,
    // Volume
    selectedVolume,
    activeVolume,
    onChangeVolume,
    // Mobile detection
    isMobile,
    // Socratic mode
    socraticMode,
    onToggleSocraticMode,
    // Sprint 3: Teacher-gated games
    allowedGames,
    // Screenshot
    onScreenshot,
    // Voice (UNLIM speaks — realtime via nanobot)
    voiceEnabled,
    onVoiceToggle,
    voiceRecording,
    onVoiceRecord,
    voicePlaying,
    voiceAvailable,
    // G12 RESPIRA: hide all navigation for full-screen simulator
    hideNavigation = false,
}) {
    // G14: Nascondi ChatOverlay in UNLIM mode — usa solo UnlimOverlay
    const { isUnlim } = useUnlimMode();

    // S84: Auto-collapse left nav on iPad/tablet to maximize canvas space
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        typeof window !== 'undefined' && window.innerWidth <= 1365
    );
    const [chatExpanded, setChatExpanded] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const welcomeAllowed = useOverlayQueue('welcome');

    useEffect(() => {
        if (!localStorage.getItem(ONBOARDING_KEY)) setShowOnboarding(true);
    }, []);

    const handleToggleSidebar = useCallback(() => {
        setSidebarCollapsed(prev => !prev);
    }, []);

    const handleToggleChat = useCallback(() => {
        onToggleChat();
    }, [onToggleChat]);

    const handleFocusChat = useCallback(() => {
        if (!showChat) onToggleChat();
        // Focus will be handled by ChatOverlay's useEffect
    }, [showChat, onToggleChat]);

    const handleCloseOverlay = useCallback(() => {
        if (showShortcuts) {
            setShowShortcuts(false);
        } else if (showChat) {
            onToggleChat();
        }
    }, [showShortcuts, showChat, onToggleChat]);

    const handleToggleChatExpanded = useCallback(() => {
        setChatExpanded(prev => !prev);
    }, []);

    const handleOpenGames = useCallback(() => {
        onTabChange('detective');
    }, [onTabChange]);

    // G38: Volume accent color for top border on content area
    const volumeAccentColors = { 1: 'var(--elab-lime)', 2: 'var(--elab-orange)', 3: 'var(--elab-red)', inventor: 'var(--elab-navy)' };
    const volumeAccent = activeVolume ? (volumeAccentColors[activeVolume] || 'var(--elab-navy)') : 'transparent';

    return (
        <div
            className={`tutor-layout ${isFullscreen ? 'tutor-layout--fullscreen' : ''} ${hideNavigation ? 'tutor-layout--no-nav' : ''}`}
            style={{ '--volume-accent': volumeAccent }}
        >
            {/* Keyboard Shortcuts Manager */}
            <KeyboardManager
                onOpenSimulator={() => onTabChange('simulator')}
                onOpenManual={() => onTabChange('manual')}
                onOpenGames={handleOpenGames}
                onFocusChat={handleFocusChat}
                onToggleSidebar={handleToggleSidebar}
                onCloseOverlay={handleCloseOverlay}
                onShowShortcuts={() => setShowShortcuts(prev => !prev)}
                showShortcuts={showShortcuts}
            />

            {/* Top Bar — hidden in RESPIRA mode */}
            {!isFullscreen && !hideNavigation && (
                <TutorTopBar
                    selectedVolume={selectedVolume}
                    activeVolume={activeVolume}
                    onChangeVolume={onChangeVolume}
                    onToggleSidebar={handleToggleSidebar}
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleChat={handleToggleChat}
                    showChat={showChat}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={onToggleFullscreen}
                    onExportSession={onExportSession}
                    sessionLogLength={sessionLogLength}
                />
            )}

            {/* Main body: sidebar + content */}
            <div className="tutor-body">
                {/* Sidebar — hidden in RESPIRA mode */}
                {!isMobile && !isFullscreen && !hideNavigation && (
                    <TutorSidebar
                        activeTab={activeTab}
                        onTabChange={onTabChange}
                        collapsed={sidebarCollapsed}
                        onToggleCollapsed={handleToggleSidebar}
                        allowedGames={allowedGames}
                    />
                )}

                {/* Content area */}
                <main className="tutor-content">
                    {isFullscreen && (
                        <button className="tutor-fullscreen-exit" onClick={onToggleFullscreen}>
                            Esci Fullscreen
                        </button>
                    )}
                    {children}
                    {/* © Andrea Marro — 27/02/2026 — ELAB Tutor — Tutti i diritti riservati */}
                </main>

                {/* Chat Overlay (floating) — nascosto in UNLIM mode, usa UnlimOverlay */}
                {!isUnlim && <ChatOverlay
                    messages={messages}
                    input={input}
                    onInputChange={onInputChange}
                    onSend={onSend}
                    isLoading={isLoading}
                    onRetry={onRetry}
                    quickActions={quickActions}
                    visible={showChat}
                    onClose={handleToggleChat}
                    expanded={chatExpanded}
                    onToggleExpanded={handleToggleChatExpanded}
                    socraticMode={socraticMode}
                    onToggleSocraticMode={onToggleSocraticMode}
                    onScreenshot={onScreenshot}
                    voiceEnabled={voiceEnabled}
                    onVoiceToggle={voiceAvailable ? onVoiceToggle : undefined}
                    voiceRecording={voiceRecording}
                    onVoiceRecord={onVoiceRecord}
                    voicePlaying={voicePlaying}
                />}
            </div>

            {/* Mobile bottom tabs — hidden in RESPIRA mode */}
            {isMobile && !isFullscreen && !hideNavigation && (
                <MobileBottomTabs
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    allowedGames={allowedGames}
                />
            )}

            {/* Footer — hidden in RESPIRA mode */}
            {!isFullscreen && !hideNavigation && (
                <footer className="tutor-footer">
                    <span>Laboratorio di Elettronica: Impara e sperimenta</span>
                </footer>
            )}

            {/* Shortcuts Panel */}
            <ShortcutsPanel
                visible={showShortcuts}
                onClose={() => setShowShortcuts(false)}
            />

            {/* G39: Onboarding docente — 3 scelte chiare, primo login.
                Serializzato: attende ConsentBanner dismesso prima di comparire. */}
            {showOnboarding && welcomeAllowed && (
                <OnboardingTooltip
                    onDismiss={() => { setShowOnboarding(false); localStorage.setItem(ONBOARDING_KEY, '1'); markOverlayDismissed(); }}
                    onNavigate={onTabChange}
                    onGoToDashboard={() => {
                        setShowOnboarding(false);
                        localStorage.setItem(ONBOARDING_KEY, '1');
                        markOverlayDismissed();
                        window.location.hash = '#teacher';
                    }}
                />
            )}
        </div>
    );
}
