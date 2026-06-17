// ============================================
// ELAB Tutor - Chat UNLIM Overlay
// Modern AI chat interface (Claude.ai / NotebookLM style)
// Floating panel, bottom-right
// © Andrea Marro — 13/02/2026
// ============================================

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import css from './ChatOverlay.module.css';
import SafeMarkdown from './shared/SafeMarkdown';

// Quick suggestions rimossi — il docente usa Percorso + domanda libera
const DEFAULT_SUGGESTIONS = [];

// Keyframes and global styles moved to ChatOverlay.module.css (IT3 perf fix)

export const UNLIM_WAITING_PHRASES = [
    'Sto ELABorando...',
    'Controllo il circuito...',
    'Leggo lo stato live...',
    'Preparo il prossimo gesto...',
    'Guardo pin e collegamenti...',
    'Metto ordine tra codice e circuito...',
    'Verifico prima di rispondere...',
    'Cerco la causa piu probabile...',
    'Tengo la risposta corta...',
    'Ci sono, quasi pronto...',
];

// -- Typing indicator (animated 3 dots) --
function TypingIndicator() {
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((idx) => Math.min(idx + 1, UNLIM_WAITING_PHRASES.length - 1));
        }, 2200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={css.typingRow}>
            <div className={css.typingAvatar}>
                <span role="img" aria-hidden="true">U</span>
            </div>
            <div className={css.typingBubble}>
                <span className={css.typingText}>{UNLIM_WAITING_PHRASES[phraseIndex]}</span>
                {[0, 1, 2].map(i => (
                    <div key={i} className={css.typingDot}
                        style={{ animation: `unlimBounce 1.4s ease-in-out ${i * 0.16}s infinite` }}
                    />
                ))}
            </div>
        </div>
    );
}

// -- Suggestion chip --
function SuggestionChip({ text, onClick }) {
    return (
        <button onClick={onClick} className={css.suggestionChip}>
            {text}
        </button>
    );
}

// ============================
// Main ChatOverlay component
// ============================
export default React.memo(function ChatOverlay({
    messages,
    input,
    onInputChange,
    onSend,
    isLoading,
    onRetry,
    quickActions,
    // Visibility
    visible,
    onClose,
    // Size state
    expanded,
    onToggleExpanded,
    // Socratic mode
    socraticMode = true,
    onToggleSocraticMode,
    // Screenshot
    onScreenshot,
    // Voice mode (UNLIM speaks — realtime via nanobot)
    voiceEnabled = false,
    onVoiceToggle,
    voiceRecording = false,
    onVoiceRecord,
    voicePlaying = false,
}) {
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [minimized, setMinimized] = useState(true);
    const [actionsExpanded, setActionsExpanded] = useState(false);
    const [userScrolledUp, setUserScrolledUp] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);

    // ── Draggable & Fullscreen State ──
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [position, setPosition] = useState({ x: -24, y: -24 }); // Base offset via transform
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

    // S115: Escape key exits fullscreen chat
    useEffect(() => {
        if (!isFullscreen) return;
        const handleEsc = (e) => {
            if (e.key === 'Escape') { e.stopPropagation(); setIsFullscreen(false); }
        };
        window.addEventListener('keydown', handleEsc, true);
        return () => window.removeEventListener('keydown', handleEsc, true);
    }, [isFullscreen]);

    // Track user scroll position — detect if scrolled up from bottom
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 60;
            setUserScrolledUp(!isNearBottom);
            if (isNearBottom) setHasNewMessage(false);
        };
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [minimized, visible]);

    // Auto-scroll to latest message — only if user hasn't scrolled up
    useEffect(() => {
        if (userScrolledUp) {
            setHasNewMessage(true);
            return;
        }
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Focus input when overlay opens
    useEffect(() => {
        if (visible && !minimized && inputRef.current) {
            const timer = setTimeout(() => inputRef.current?.focus(), 250);
            return () => clearTimeout(timer);
        }
    }, [visible, minimized]);

    // Handle Enter key in textarea
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) {
                onSend();
            }
        }
    }, [input, isLoading, onSend]);

    // Handle suggestion click
    const handleSuggestion = useCallback((text) => {
        onInputChange(text);
        // Send immediately after setting
        setTimeout(() => onSend(), 50);
    }, [onInputChange, onSend]);

    // Determine if we should show default suggestions
    const showDefaultSuggestions = useMemo(() => {
        return messages.length <= 1 && !isLoading;
    }, [messages.length, isLoading]);

    // ── Drag Logic ──
    const handlePointerDown = (e) => {
        if (isFullscreen || minimized) return; // Don't drag if fullscreen or minimized
        // Check if clicking on buttons
        if (e.target.closest('button')) return;

        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPosition({
            x: dragRef.current.initialX + dx,
            y: dragRef.current.initialY + dy
        });
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        e.target.releasePointerCapture(e.pointerId);
    };

    if (!visible) return null;

    // --- S85: Viewport-responsive chat dimensions ---
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const panelWidth = expanded
        ? (vw < 820 ? 320 : vw < 1024 ? 360 : vw < 1440 ? 390 : 420)
        : (vw < 820 ? 260 : vw < 1024 ? 300 : vw < 1440 ? 340 : 380);
    const panelHeight = expanded
        ? (vw < 820 ? 500 : 600)
        : (vw < 820 ? 400 : 480);

    // ========================
    // MINIMIZED STATE
    // ========================
    if (minimized) {
        return (
            <div className={css.minimizedPanel} style={{ width: `${panelWidth}px` }}>
                {/* Header only */}
                <div className={css.minimizedHeader} role="button" tabIndex={0} onClick={() => setMinimized(false)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMinimized(false); } }} aria-label="Espandi chat UNLIM">
                    <div className={css.headerLeft}>
                        <img src="/assets/mascot/logo-senza-sfondo.png" alt="UNLIM" className={css.mascotImg} />
                        <span className={css.brandName}>UNLIM</span>
                        <span className={css.statusRow}>
                            <span className={css.statusDot} />
                            Online
                        </span>
                    </div>
                    <div className={css.headerButtons}>
                        <HeaderButton onClick={(e) => { e.stopPropagation(); setMinimized(false); }} title="Espandi">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="17 11 12 6 7 11" /><polyline points="17 18 12 13 7 18" />
                            </svg>
                        </HeaderButton>
                        <HeaderButton onClick={(e) => { e.stopPropagation(); setMinimized(false); onClose(); }} title="Chiudi chat">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </HeaderButton>
                    </div>
                </div>
            </div>
        );
    }

    // ========================
    // FULL PANEL
    // ========================
    // Dynamic styles that must remain inline (viewport-dependent + drag position)
    const panelDynamic = isFullscreen ? {} : {
        bottom: 0, right: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${panelWidth}px`, height: `${panelHeight}px`,
        boxShadow: isDragging ? '0 16px 48px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        transition: isDragging ? 'none' : 'width 300ms ease, height 300ms ease',
        animation: 'unlimPanelIn 0.3s ease',
    };

    return (
        <div className={isFullscreen ? css.panelFullscreen : css.panel} style={panelDynamic} role="dialog" aria-modal={isFullscreen} aria-label="Chat UNLIM">

            {/* ======== HEADER ======== */}
            <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={css.header}
                style={{
                    borderRadius: isFullscreen ? '0' : '16px 16px 0 0',
                    cursor: isFullscreen ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                }}>
                <div className={css.headerInfo}>
                    <img src="/assets/mascot/logo-senza-sfondo.png" alt="UNLIM" className={css.mascotImgLarge} />
                    <div className={css.headerMeta}>
                        <span className={css.brandName}>UNLIM</span>
                        <span className={css.statusRowFull}>
                            <span className={css.statusDotSmall} />
                            {isLoading ? 'In ascolto' : 'Online'}
                        </span>
                    </div>
                </div>
                <div className={css.headerButtonsFull}>
                    <HeaderButton
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        title={isFullscreen ? 'Riduci Finestra' : 'A Tutto Schermo'}
                        className={isFullscreen ? css.headerBtnFullscreen : undefined}
                    >
                        {isFullscreen ? (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                                </svg>
                                <span>Riduci</span>
                            </>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                            </svg>
                        )}
                    </HeaderButton>
                    <HeaderButton onClick={() => { if (isFullscreen) setIsFullscreen(false); setMinimized(true); }} title="Riduci a barra">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </HeaderButton>
                    {!isFullscreen && (
                        <HeaderButton onClick={onToggleExpanded} title={expanded ? 'Comprimi' : 'Espandi Larghezza'}>
                            {expanded ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
                                    <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
                                </svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                                    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                                </svg>
                            )}
                        </HeaderButton>
                    )}
                    <HeaderButton onClick={onClose} title="Chiudi chat (Esc)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </HeaderButton>
                </div>
            </div>

            {/* Guide mode is always active — no toggle needed */}

            {/* ======== MESSAGES AREA ======== */}
            <div
                ref={messagesContainerRef}
                className={`unlim-messages-scroll ${css.messagesArea}`}
            >
                {/* AI Disclaimer — shown at chat start */}
                {messages.length <= 1 && (
                    <div className={css.aiDisclaimer}>
                        <span className={css.disclaimerIcon}>{'!'}</span>
                        <span>UNLIM è un assistente AI e può commettere errori. Verifica sempre le informazioni importanti con il tuo insegnante.</span>
                    </div>
                )}

                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        onRetry={onRetry}
                    />
                ))}

                {/* Typing indicator */}
                {isLoading && <TypingIndicator />}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} className={css.scrollAnchor} />
            </div>

            {/* New message badge — shown when user scrolled up and new messages arrive */}
            {hasNewMessage && userScrolledUp && (
                <button
                    className={css.newMessageBadge}
                    onClick={() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        setHasNewMessage(false);
                        setUserScrolledUp(false);
                    }}
                    aria-label="Vai ai nuovi messaggi"
                >
                    ↓ Nuovo messaggio
                </button>
            )}


            {/* ======== QUICK SUGGESTIONS (default + dynamic) ======== */}
            {(showDefaultSuggestions || (quickActions && quickActions.length > 0)) && (
                <div className={css.suggestionsBar}>
                    {/* Show dynamic quickActions — first 3 by default, all when expanded */}
                    {quickActions && quickActions.length > 0 && (
                        <>
                            {(actionsExpanded ? quickActions : quickActions.slice(0, 3)).map((a, i) => (
                                <SuggestionChip key={`qa-${i}`} text={a.text} onClick={a.action} />
                            ))}
                            {quickActions.length > 3 && (
                                <button
                                    onClick={() => setActionsExpanded(!actionsExpanded)}
                                    className={`${css.moreActionsBtn} ${actionsExpanded ? css.moreActionsBtnExpanded : css.moreActionsBtnCollapsed}`}
                                >
                                    {actionsExpanded ? '\u25B2 Meno' : `\u25BC Altro (${quickActions.length - 3})`}
                                </button>
                            )}
                        </>
                    )}
                    {/* Show default suggestions only when chat is nearly empty and no dynamic actions */}
                    {showDefaultSuggestions && (!quickActions || quickActions.length === 0) && DEFAULT_SUGGESTIONS.map((s, i) => (
                        <SuggestionChip key={`ds-${i}`} text={s} onClick={() => handleSuggestion(s)} />
                    ))}
                </div>
            )}

            {/* ======== INPUT AREA ======== */}
            <div className={css.inputArea}>
                {/* Text input */}
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => onInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Chiedi a UNLIM..."
                    aria-label="Scrivi messaggio a UNLIM"
                    disabled={isLoading}
                    rows={1}
                    className={`elab-input ${css.inputTextarea}`}
                    style={{ background: isLoading ? 'var(--color-bg-secondary)' : 'var(--color-bg)' }}
                />

                {/* Screenshot button (always visible) */}
                {onScreenshot && (
                    <button
                        onClick={onScreenshot}
                        disabled={isLoading}
                        aria-label="Cattura screenshot e chiedi a UNLIM"
                        title="Cattura screenshot"
                        className={isLoading ? css.screenshotBtnDisabled : css.screenshotBtn}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                    </button>
                )}

                {/* Voice mode toggle button */}
                {onVoiceToggle && (
                    <button
                        onClick={() => onVoiceToggle(!voiceEnabled)}
                        disabled={isLoading}
                        aria-label={voiceEnabled ? 'Disattiva modalità vocale' : 'Attiva modalità vocale'}
                        title={voiceEnabled ? 'Modalità vocale attiva' : 'Attiva modalità vocale'}
                        className={isLoading ? css.voiceBtnDisabled : (voiceEnabled ? css.voiceBtnActive : css.voiceBtn)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {voiceEnabled ? (
                                /* Speaker icon when voice is ON */
                                <>
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                    <path d="M15.54 5.47A9 9 0 0 1 19 12a9 9 0 0 1-3.46 6.53" />
                                    <path d="M17.92 16.02A5.5 5.5 0 0 0 18 12a5.5 5.5 0 0 0-.08-4.02" />
                                </>
                            ) : (
                                /* Microphone icon when voice is OFF */
                                <>
                                    <path d="M12 1a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="23" />
                                    <line x1="8" y1="23" x2="16" y2="23" />
                                </>
                            )}
                        </svg>
                    </button>
                )}

                {/* Record button — appears when voice is on and input is empty */}
                {voiceEnabled && onVoiceRecord && !input.trim() ? (
                    <button
                        onClick={onVoiceRecord}
                        disabled={isLoading && !voiceRecording}
                        aria-label={voiceRecording ? 'Ferma registrazione' : 'Parla con UNLIM'}
                        title={voiceRecording ? 'Tap per inviare' : 'Tap per parlare'}
                        className={voiceRecording ? css.recordBtnRecording : (voicePlaying ? css.recordBtnPlaying : css.recordBtn)}
                    >
                        {voiceRecording ? (
                            /* Stop/Send icon when recording */
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        ) : voicePlaying ? (
                            /* Speaker waves when AI is speaking */
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                <path d="M15.54 5.47A9 9 0 0 1 19 12a9 9 0 0 1-3.46 6.53" />
                            </svg>
                        ) : (
                            /* Microphone icon — ready to record */
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </button>
                ) : (
                    /* Send button (text mode or voice mode with text) */
                    <button
                        onClick={() => onSend()}
                        disabled={!input.trim() || isLoading}
                        aria-label="Invia messaggio"
                        className={(!input.trim() || isLoading) ? css.sendBtnDisabled : css.sendBtn}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ======== AI DISCLAIMER FOOTER ======== */}
            <div className={css.footerDisclaimer}>
                Le risposte di UNLIM sono generate dall'AI e potrebbero non essere accurate.
            </div>
        </div>
    );
})

// ============================
// Sub-components
// ============================

// -- Header control button --
function HeaderButton({ onClick, title, children, className }) {
    return (
        <button onClick={onClick} title={title} aria-label={title} className={className || css.headerBtn}>
            {children}
        </button>
    );
}

// ── UNLIM ONNIPOTENTE: Map action commands to human-readable Italian labels ──
function actionToLabel(action) {
    const cmd = (action || '').split(':')[0];
    const labels = {
        play: '\u25B6 Avviato',
        pause: '\u23F8 In pausa',
        reset: '\u21BA Resettato',
        highlight: '\u2316 Evidenziato',
        loadexp: '\u229E Caricato',
        opentab: '\u2750 Aperto',
        openvolume: '\u2261 Manuale',
        addwire: '\u2014 Filo aggiunto',
        removewire: '\u2702 Filo rimosso',
        addcomponent: '\u2795 Componente aggiunto',
        removecomponent: '\u2796 Componente rimosso',
        interact: '\u2609 Interazione',
        compile: '\u2699 Compilato',
        movecomponent: '\u21C4 Spostato',
        clearall: '\u2715 Pulito tutto',
        quiz: '\u2753 Quiz aperto',
        youtube: '\u25B6 Ricerca video',
        setcode: '\u270E Codice impostato',
    };
    return labels[cmd] || `\u2705 ${action}`;
}

// -- Message bubble (UNLIM or User) --
function MessageBubble({ msg, onRetry }) {
    const isUser = msg.role === 'user';
    const isError = msg.isError;
    const isRateLimit = msg.isRateLimit;

    const textContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content || '');

    return (
        <div className={isUser ? css.msgRowUser : css.msgRowAssistant}>
            {/* Avatar */}
            {!isUser && (
                <div className={css.avatarAssistant}>U</div>
            )}

            <div className={isUser ? css.msgContentUser : css.msgContentAssistant}>
                {/* Image attachment — supports image, imageUrl, and attachment fields */}
                {(msg.image || msg.imageUrl || msg.attachment) && (
                    <img
                        src={msg.image || msg.imageUrl || msg.attachment}
                        alt="Allegato"
                        className={css.msgImage}
                    />
                )}

                {/* Bubble — SafeMarkdown renders React elements (no innerHTML, XSS-immune) */}
                <SafeMarkdown
                    text={textContent}
                    stripActions
                    className={`unlim-bubble-content ${isRateLimit ? css.bubbleRateLimit : isError ? css.bubbleError : (isUser ? css.bubbleUser : css.bubbleAssistant)}`}
                />

                {/* ── UNLIM ONNIPOTENTE: Executed actions badge ── */}
                {msg._executedActions?.length > 0 && (
                    <div className={css.executedActions}>
                        {msg._executedActions.map((action, i) => (
                            <span key={i} className={css.actionTag}>
                                {actionToLabel(action)}
                            </span>
                        ))}
                    </div>
                )}

                {/* ── UNLIM ONNIPOTENTE: YouTube search card ── */}
                {msg.youtubeSearch && (
                    <a
                        href={msg.youtubeSearch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`chat-youtube-link ${css.youtubeCard}`}
                    >
                        <span className={css.youtubeIcon}>{'\u25B6'}</span>
                        <span>Cerca su YouTube: <strong>{msg.youtubeSearch.query}</strong></span>
                    </a>
                )}

                {/* Local knowledge indicator */}
                {msg.source === 'local-knowledge' && (
                    <div className={css.localKnowledge}>
                        <span className={css.localKnowledgeIcon}>{'\u25B8'}</span>
                        Risposta dalla guida locale
                    </div>
                )}

                {/* Retry button for errors */}
                {isError && msg.retryMessage && (
                    <button onClick={() => onRetry(msg.retryMessage)} className={css.retryBtn}>
                        Riprova
                    </button>
                )}
            </div>

            {/* User avatar */}
            {isUser && (
                <div className={css.avatarUser}>Tu</div>
            )}
        </div>
    );
}
