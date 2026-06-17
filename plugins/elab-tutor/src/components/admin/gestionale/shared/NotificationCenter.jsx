// ELAB Gestionale - NotificationCenter (campanella + dropdown)
// © Andrea Marro — 18 Febbraio 2026
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { COLORS } from '../GestionaleStyles';
import NotificationService from '../services/NotificationService';

const SEVERITY_ICON = { danger: '', warning: '', info: '' };
const SEVERITY_BG = { danger: 'var(--elab-hex-fee2e2)', warning: 'var(--elab-hex-fef3c7)', info: 'var(--elab-hex-dbeafe)' };

function timeAgo(timestamp) {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'adesso';
    if (mins < 60) return `${mins}m fa`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h fa`;
    return `${Math.floor(hours / 24)}g fa`;
}

export default function NotificationCenter({ notifications = [], onRefresh }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const handleMarkAllRead = useCallback(() => {
        const ids = notifications.map(n => n.id);
        NotificationService.markAllRead(ids);
        if (onRefresh) onRefresh();
    }, [notifications, onRefresh]);

    const handleMarkRead = useCallback((notifId) => {
        NotificationService.markAsRead(notifId);
        if (onRefresh) onRefresh();
    }, [onRefresh]);

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '8px', borderRadius: '8px', position: 'relative',
                    fontSize: '20px', lineHeight: 1, minWidth: '44px', minHeight: '44px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Notifiche"
                aria-label={`Notifiche: ${unreadCount} non lette`}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={COLORS.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '4px', right: '4px',
                        background: COLORS.danger, color: '#FFF',
                        borderRadius: '50%', fontSize: '14px', fontWeight: '800',
                        width: '18px', height: '18px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', top: '100%', right: 0, zIndex: 1000,
                    width: '340px', maxHeight: '400px', overflowY: 'auto',
                    background: COLORS.card, borderRadius: '10px',
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}`,
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPrimary }}>
                            Notifiche
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                style={{
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    fontSize: '14px', color: COLORS.accent, fontWeight: '600',
                                    padding: '4px 8px', minHeight: '44px',
                                }}
                            >
                                Segna tutto letto
                            </button>
                        )}
                    </div>

                    {/* Notifications list */}
                    {notifications.length === 0 ? (
                        <div style={{ padding: '30px 16px', textAlign: 'center', color: COLORS.textMuted, fontSize: '14px' }}>
                            Nessuna notifica
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => handleMarkRead(n.id)}
                                style={{
                                    padding: '10px 14px', cursor: 'pointer',
                                    background: n.read ? 'transparent' : SEVERITY_BG[n.severity] || 'var(--elab-hex-f8fafc)',
                                    borderBottom: `1px solid ${COLORS.borderLight || COLORS.border}`,
                                    transition: 'background 0.15s',
                                    opacity: n.read ? 0.7 : 1,
                                }}
                            >
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '14px', flexShrink: 0 }}>
                                        {SEVERITY_ICON[n.severity] || ''}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '14px', fontWeight: n.read ? '500' : '700',
                                            color: COLORS.textPrimary, marginBottom: '2px',
                                        }}>
                                            {n.title}
                                        </div>
                                        <div style={{ fontSize: '14px', color: COLORS.textSecondary, lineHeight: '1.3' }}>
                                            {n.message}
                                        </div>
                                        <div style={{ fontSize: '14px', color: COLORS.textMuted, marginTop: '4px' }}>
                                            {timeAgo(n.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
