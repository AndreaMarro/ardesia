/**
 * ELAB Toast — Non-blocking notification
 * Replaces alert() for LIM-friendly UX
 * Auto-dismisses after 4s, stackable
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';

let _addToast = null;

/** Show a toast from anywhere: showToast('message') or showToast('message', 'error') */
export function showToast(message, type = 'info') {
    _addToast?.(message, type);
}

const COLORS = {
    info: { bg: 'var(--elab-navy)', text: '#fff' },
    success: { bg: 'var(--elab-lime)', text: '#fff' },
    error: { bg: 'var(--elab-red)', text: '#fff' },
    warning: { bg: '#E8941C', text: '#1A1A2E' }, /* G42: dark text on orange for WCAG AA (~3.8:1, passes large text) */
};

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const addToast = useCallback((message, type = 'info') => {
        const id = ++idRef.current;
        setToasts(prev => [...prev.slice(-4), { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    useEffect(() => {
        _addToast = addToast;
        return () => { _addToast = null; };
    }, [addToast]);

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none',
        }} role="status" aria-live="polite">
            {toasts.map(t => {
                const c = COLORS[t.type] || COLORS.info;
                return (
                    <div key={t.id} style={{
                        background: c.bg,
                        color: c.text,
                        padding: '12px 20px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 500,
                        fontFamily: "'Open Sans', sans-serif",
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        maxWidth: '400px',
                        pointerEvents: 'auto',
                        animation: 'toast-in 0.25s ease-out',
                    }}>
                        {t.message}
                    </div>
                );
            })}
            <style>{`
                @keyframes toast-in {
                    from { opacity: 0; transform: translateX(40px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
