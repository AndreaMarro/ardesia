// ============================================
// ELAB Tutor - Keyboard Shortcuts Manager
// Handles global keyboard shortcuts
// © Andrea Marro — 13/02/2026
// ============================================

import { useEffect, useCallback } from 'react';

export default function KeyboardManager({
    onOpenSimulator,
    onOpenManual,
    onOpenGames,
    onFocusChat,
    onToggleSidebar,
    onCloseOverlay,
    onShowShortcuts,
    showShortcuts,
}) {
    const handleKeyDown = useCallback((e) => {
        // Do not capture when typing in input/textarea/contenteditable
        const tag = e.target.tagName.toLowerCase();
        const isEditing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

        // Escape always works (close overlays)
        if (e.key === 'Escape') {
            e.preventDefault();
            onCloseOverlay();
            return;
        }

        // All other shortcuts require Ctrl/Cmd
        if (!(e.ctrlKey || e.metaKey)) return;

        switch (e.key.toLowerCase()) {
            case 's':
                if (!e.shiftKey) {
                    e.preventDefault();
                    onOpenSimulator();
                }
                break;
            case 'm':
                e.preventDefault();
                onOpenManual();
                break;
            case 'g':
                if (!isEditing) {
                    e.preventDefault();
                    onOpenGames();
                }
                break;
            case 'k':
                e.preventDefault();
                onFocusChat();
                break;
            case 'b':
                if (!isEditing) {
                    e.preventDefault();
                    onToggleSidebar();
                }
                break;
            case '/':
                e.preventDefault();
                onShowShortcuts();
                break;
            default:
                break;
        }
    }, [onOpenSimulator, onOpenManual, onOpenGames, onFocusChat, onToggleSidebar, onCloseOverlay, onShowShortcuts]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Render nothing — this is a behavior-only component
    return null;
}

// Shortcuts panel overlay
export function ShortcutsPanel({ visible, onClose }) {
    if (!visible) return null;

    const shortcuts = [
        { category: 'Navigazione', items: [
            { keys: 'Ctrl + S', desc: 'Apri Simulatore' },
            { keys: 'Ctrl + M', desc: 'Apri Manuale' },
            { keys: 'Ctrl + G', desc: 'Apri Giochi' },
            { keys: 'Ctrl + B', desc: 'Toggle Barra Laterale' },
        ]},
        { category: 'Chat UNLIM', items: [
            { keys: 'Ctrl + K', desc: 'Apri/Focus Chat' },
            { keys: 'Escape', desc: 'Chiudi Chat/Modal' },
        ]},
        { category: 'Altro', items: [
            { keys: 'Ctrl + /', desc: 'Mostra Scorciatoie' },
        ]},
    ];

    return (
        <div className="shortcuts-overlay" onClick={onClose}>
            <div className="shortcuts-panel" onClick={e => e.stopPropagation()}>
                <div className="shortcuts-header">
                    <h3>Scorciatoie Tastiera</h3>
                    <button className="shortcuts-close" onClick={onClose} aria-label="Chiudi">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="shortcuts-body">
                    {shortcuts.map((section, si) => (
                        <div key={si} className="shortcuts-section">
                            <h4>{section.category}</h4>
                            {section.items.map((item, ii) => (
                                <div key={ii} className="shortcut-row">
                                    <kbd className="shortcut-keys">{item.keys}</kbd>
                                    <span className="shortcut-desc">{item.desc}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
