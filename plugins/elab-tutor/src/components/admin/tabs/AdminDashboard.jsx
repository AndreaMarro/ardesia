// ============================================
// ELAB - AdminDashboard (Real-time KPI)
// Dashboard con dati live da Notion
// via backend webhook bridge
// (c) Andrea Marro - 06/02/2026
// Andrea Marro — 18/02/2026
// ============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    dashboardService,
    testConnection,
} from '../../../services/notionService';

// ============================================
// COSTANTI COLORI
// ============================================
const COLORS = {
    primary: 'var(--elab-navy)',
    success: 'var(--elab-lime)',
    warning: '#f59e0b', // palette
    danger: '#ef4444', // palette
    info: '#06b6d4', // palette
    purple: '#8b5cf6', // palette
    pink: '#ec4899', // palette
    teal: '#14b8a6', // palette
    bg: '#f0f4f8', // palette
    cardBg: 'white',
    text: '#333',
    textMuted: '#737373', // palette
    border: '#e0e0e0', // palette
};

// ============================================
// SVG ICON COMPONENTS (inline, 20px)
// ============================================
const SvgIcon = ({ children }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        {children}
    </svg>
);
const IcoUsers = () => <SvgIcon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></SvgIcon>;
const IcoActive = () => <SvgIcon><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></SvgIcon>;
const IcoOrders = () => <SvgIcon><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></SvgIcon>;
const IcoCourses = () => <SvgIcon><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></SvgIcon>;
const IcoEvents = () => <SvgIcon><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" /><path d="M8.5 2h7" /><path d="M7 16.5h10" /></SvgIcon>;
const IcoWaitlist = () => <SvgIcon><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M9 14l2 2 4-4" /></SvgIcon>;
const IcoLicenses = () => <SvgIcon><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 9h20" /><circle cx="7" cy="15" r="1" /></SvgIcon>;
const IcoGestionale = () => <SvgIcon><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" /></SvgIcon>;
const IcoUser = () => <SvgIcon><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></SvgIcon>;
const IcoOrder = () => <SvgIcon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></SvgIcon>;
const IcoEvent = () => <SvgIcon><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></SvgIcon>;
const IcoPost = () => <SvgIcon><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></SvgIcon>;
const IcoSystem = () => <SvgIcon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" /></SvgIcon>;
const IcoCourse = () => <SvgIcon><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></SvgIcon>;

// ============================================
// KPI CARD DEFINITIONS
// ============================================
const KPI_DEFS = [
    { key: 'utentiTotali',    label: 'Utenti totali',     icon: <IcoUsers />, color: COLORS.primary, format: 'number' },
    { key: 'utentiAttivi',    label: 'Utenti attivi',     icon: <IcoActive />, color: COLORS.success, format: 'number' },
    { key: 'ordiniTotale',    label: 'Ordini totale',     icon: <IcoOrders />, color: COLORS.warning, format: 'number' },
    { key: 'corsiAttivi',     label: 'Corsi attivi',      icon: <IcoCourses />, color: COLORS.purple,  format: 'number' },
    { key: 'eventiProssimi',  label: 'Eventi prossimi',   icon: <IcoEvents />, color: COLORS.info,    format: 'number' },
    { key: 'waitlistIscritti', label: 'Waitlist iscritti', icon: <IcoWaitlist />, color: COLORS.pink,    format: 'number' },
];

// ============================================
// QUICK ACTIONS
// ============================================
const QUICK_ACTIONS = [
    { label: 'Gestisci Utenti',  icon: <IcoUsers />, tabId: 'utenti',      color: COLORS.primary },
    { label: 'Gestisci Ordini',  icon: <IcoOrders />, tabId: 'ordini',      color: COLORS.warning },
    { label: 'Gestisci Corsi',   icon: <IcoCourses />, tabId: 'corsi',       color: COLORS.purple },
    { label: 'Gestisci Waitlist', icon: <IcoWaitlist />, tabId: 'waitlist',    color: COLORS.pink },
    { label: 'Verifica Licenze', icon: <IcoLicenses />, tabId: 'licenze',     color: COLORS.info },
    { label: 'Gestionale ERP',   icon: <IcoGestionale />, tabId: 'gestionale',  color: '#0f172a' }, // palette
];

// ============================================
// FORMATTERS
// ============================================
function formatValue(value, format) {
    if (value === null || value === undefined) return '—';
    if (format === 'currency') {
        if (typeof value === 'number') {
            return new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(value / 100);
        }
        return '—';
    }
    if (format === 'number') {
        if (typeof value === 'number') {
            return new Intl.NumberFormat('it-IT').format(value);
        }
        return String(value);
    }
    return String(value);
}

function timeAgo(dateStr) {
    if (!dateStr) return '—';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Adesso';
        if (diffMin < 60) return `${diffMin}m fa`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `${diffH}h fa`;
        const diffD = Math.floor(diffH / 24);
        if (diffD < 7) return `${diffD}g fa`;
        return date.toLocaleDateString('it-IT');
    } catch {
        return '—';
    }
}

// ============================================
// SUB-COMPONENTS
// ============================================

// ============================================
// KPI SKELETON LOADER
// Sostituisce il 3-dot spinner durante il
// primo caricamento. Mostra 7 placeholder
// card che replicano il layout della KPI grid.
// Palette: bg #F0F4F8, skeleton #E5E5EA → #F0F0F5
// ============================================

function KPISkeletonLoader({ isMobile }) {
    const gridCols = isMobile
        ? 'repeat(auto-fill, minmax(150px, 1fr))'
        : 'repeat(auto-fill, minmax(230px, 1fr))';

    // One skeleton card matching the real KPICard layout exactly
    function SkeletonCard({ delay }) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '14px',
                padding: isMobile ? '16px' : '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '12px' : '16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                borderLeft: '4px solid #e5e5ea', // palette
                minWidth: 0,
            }}>
                {/* Icon placeholder */}
                <div style={{
                    width: isMobile ? '40px' : '48px',
                    height: isMobile ? '40px' : '48px',
                    borderRadius: '12px',
                    background: '#e5e5ea', // palette
                    flexShrink: 0,
                    animation: `elab-skeleton-pulse 1.6s ease-in-out ${delay}s infinite`,
                }} />
                {/* Text placeholders */}
                <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Value line */}
                    <div style={{
                        height: isMobile ? '22px' : '28px',
                        width: '55%',
                        borderRadius: '6px',
                        background: '#e5e5ea', // palette
                        animation: `elab-skeleton-pulse 1.6s ease-in-out ${delay}s infinite`,
                    }} />
                    {/* Label line */}
                    <div style={{
                        height: '12px',
                        width: '75%',
                        borderRadius: '4px',
                        background: '#e5e5ea', // palette
                        animation: `elab-skeleton-pulse 1.6s ease-in-out ${delay + 0.1}s infinite`,
                    }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#f0f4f8' }}>
            <style>{`
                @keyframes elab-skeleton-pulse {
                    0%, 100% { background-color: #e5e5ea; } // palette
                    50%       { background-color: #f0f0f5; } // palette
                }
            `}</style>

            {/* 7 skeleton cards in the same grid as the real KPI grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: gridCols,
                gap: isMobile ? '10px' : '14px',
                marginBottom: '20px',
            }}>
                {Array.from({ length: 7 }, (_, i) => (
                    <SkeletonCard key={i} delay={i * 0.08} />
                ))}
            </div>

            {/* Bottom section skeletons (Quick Actions + Activity) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '14px' : '18px',
                marginBottom: '20px',
            }}>
                {[0, 1].map((idx) => (
                    <div key={idx} style={{
                        background: 'white',
                        borderRadius: '14px',
                        padding: isMobile ? '16px' : '22px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        minHeight: isMobile ? '120px' : '160px',
                    }}>
                        {/* Section title placeholder */}
                        <div style={{
                            height: '16px',
                            width: '40%',
                            borderRadius: '6px',
                            background: '#e5e5ea', // palette
                            marginBottom: '18px',
                            animation: `elab-skeleton-pulse 1.6s ease-in-out ${idx * 0.12}s infinite`,
                        }} />
                        {/* Content rows */}
                        {Array.from({ length: 3 }, (_, r) => (
                            <div key={r} style={{
                                height: '12px',
                                width: `${70 - r * 10}%`,
                                borderRadius: '4px',
                                background: '#e5e5ea', // palette
                                marginBottom: '10px',
                                animation: `elab-skeleton-pulse 1.6s ease-in-out ${idx * 0.12 + r * 0.08}s infinite`,
                            }} />
                        ))}
                    </div>
                ))}
            </div>

            {/* System Status skeleton */}
            <div style={{
                background: 'white',
                borderRadius: '14px',
                padding: isMobile ? '16px' : '22px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
                <div style={{
                    height: '16px',
                    width: '30%',
                    borderRadius: '6px',
                    background: '#e5e5ea', // palette
                    marginBottom: '18px',
                    animation: 'elab-skeleton-pulse 1.6s ease-in-out 0s infinite',
                }} />
                {[0, 1].map((r) => (
                    <div key={r} style={{
                        height: '38px',
                        borderRadius: '8px',
                        background: '#e5e5ea', // palette
                        marginBottom: r === 0 ? '10px' : 0,
                        animation: `elab-skeleton-pulse 1.6s ease-in-out ${r * 0.1}s infinite`,
                    }} />
                ))}
            </div>
        </div>
    );
}

function BackendWarningBanner({ isMobile }) {
    return (
        <div style={{
            padding: isMobile ? '20px 16px' : '28px 24px',
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', // palette
            borderRadius: '14px',
            border: `1px solid ${COLORS.warning}40`,
            marginBottom: '20px',
            textAlign: 'center',
        }}>
            <div style={{ fontSize: '36px', marginBottom: '10px', color: '#92400e', fontWeight: 700 }}>{'\u26A0'}</div>
            <div style={{
                fontWeight: '700',
                fontSize: isMobile ? '15px' : '17px',
                color: '#92400e', // palette
                marginBottom: '6px',
            }}>
                Server backend non raggiungibile
            </div>
            <div style={{
                fontSize: isMobile ? '13px' : '14px',
                color: '#a16207', // palette
                lineHeight: '1.6',
                maxWidth: '480px',
                margin: '0 auto 16px',
            }}>
                I dati KPI e il feed attività richiedono il server backend attivo.
                Usa le Azioni Rapide qui sotto per gestire i contenuti direttamente.
            </div>
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '8px',
                background: 'rgba(146, 64, 14, 0.08)', fontSize: '14px',
                color: '#92400e', fontWeight: '600', // palette
            }}>
                I dati si aggiorneranno automaticamente quando il backend sarà online
            </div>
        </div>
    );
}

function ErrorCard({ message, isMobile }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: isMobile ? '10px' : '14px',
            padding: isMobile ? '14px' : '18px 22px',
            background: '#fef2f2', // palette
            borderRadius: '12px',
            border: '1px solid #fecaca', // palette
            marginBottom: '20px',
        }}>
            <span style={{ fontSize: isMobile ? '20px' : '24px', flexShrink: 0, lineHeight: 1, color: '#dc2626', fontWeight: 700 }}>
                {'\u2716'}
            </span>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: '700',
                    fontSize: isMobile ? '13px' : '14px',
                    color: '#991b1b', // palette
                    marginBottom: '4px',
                }}>
                    Errore di connessione
                </div>
                <div style={{
                    fontSize: isMobile ? '12px' : '13px',
                    color: '#b91c1c', // palette
                    lineHeight: '1.5',
                }}>
                    {message || 'Impossibile recuperare i dati. Controlla la connessione e lo stato del server backend.'}
                </div>
            </div>
        </div>
    );
}

function KPICard({ label, value, icon, color, format, isMobile, hasError }) {
    const [hovered, setHovered] = useState(false);
    const displayValue = hasError ? 'N/A' : formatValue(value, format);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: COLORS.cardBg,
                borderRadius: '14px',
                padding: isMobile ? '16px' : '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '12px' : '16px',
                boxShadow: hovered
                    ? '0 4px 16px rgba(0,0,0,0.10)'
                    : '0 1px 4px rgba(0,0,0,0.06)',
                borderLeft: `4px solid ${color}`,
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                cursor: 'default',
                minWidth: 0,
            }}
        >
            <div style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                borderRadius: '12px',
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: color,
            }}>
                {icon}
            </div>
            <div style={{ minWidth: 0 }}>
                <div style={{
                    fontSize: isMobile ? '22px' : '28px',
                    fontWeight: '800',
                    lineHeight: 1.1,
                    color: hasError ? COLORS.textMuted : color,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {displayValue}
                </div>
                <div style={{
                    fontSize: '14px',
                    color: COLORS.textMuted,
                    marginTop: '4px',
                    fontWeight: '500',
                    letterSpacing: '0.2px',
                }}>
                    {label}
                </div>
            </div>
        </div>
    );
}

function QuickActionButton({ label, icon, color, onClick, isMobile }) {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: isMobile ? '10px 14px' : '12px 20px',
                background: hovered ? color : `${color}10`,
                color: hovered ? 'white' : color,
                border: `1px solid ${color}30`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '600',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
            }}
        >
            <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
            {label}
        </button>
    );
}

function ActivityItem({ item, isMobile }) {
    const typeColors = {
        user: COLORS.primary,
        order: COLORS.warning,
        event: COLORS.info,
        post: COLORS.purple,
        system: COLORS.teal,
        course: COLORS.success,
    };
    const typeIcons = {
        user: <IcoUser />,
        order: <IcoOrder />,
        event: <IcoEvent />,
        post: <IcoPost />,
        system: <IcoSystem />,
        course: <IcoCourse />,
    };

    const actType = item.type || 'system';
    const dotColor = typeColors[actType] || COLORS.textMuted;
    const actIcon = typeIcons[actType] || <IcoSystem />;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: isMobile ? '10px' : '12px',
            padding: isMobile ? '10px 0' : '12px 0',
            borderBottom: `1px solid ${COLORS.border}20`,
        }}>
            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: `${dotColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: dotColor,
            }}>
                {actIcon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: '600',
                    color: COLORS.text,
                    lineHeight: '1.4',
                }}>
                    {item.title || item.action || 'Attività'}
                </div>
                {item.description && (
                    <div style={{
                        fontSize: '14px',
                        color: COLORS.textMuted,
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {item.description}
                    </div>
                )}
            </div>
            <div style={{
                fontSize: '14px',
                color: COLORS.textMuted,
                whiteSpace: 'nowrap',
                flexShrink: 0,
            }}>
                {timeAgo(item.timestamp || item.date)}
            </div>
        </div>
    );
}

function SystemStatusCard({ isMobile }) {
    const [status, setStatus] = useState(null);
    const [checking, setChecking] = useState(true);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        let cancelled = false;

        async function check() {
            setChecking(true);
            try {
                const result = await testConnection();
                if (!cancelled && mountedRef.current) {
                    setStatus(result);
                }
            } catch {
                if (!cancelled && mountedRef.current) {
                    setStatus({ connected: false, error: 'Test fallito' });
                }
            }
            if (!cancelled && mountedRef.current) {
                setChecking(false);
            }
        }

        check();

        return () => {
            cancelled = true;
            mountedRef.current = false;
        };
    }, []);

    const handleRetry = async () => {
        setChecking(true);
        try {
            const result = await testConnection();
            if (mountedRef.current) setStatus(result);
        } catch {
            if (mountedRef.current) setStatus({ connected: false, error: 'Test fallito' });
        }
        if (mountedRef.current) setChecking(false);
    };

    const services = [
        {
            name: 'Backend Webhook',
            ok: status?.connected === true,
            detail: status?.connected ? 'Connesso' : (status?.error || 'Non raggiungibile'),
        },
        {
            name: 'Notion API',
            ok: status?.connected === true && status?.server?.notion !== false,
            detail: status?.connected ? 'Operativo' : 'Richiede backend',
        },
    ];

    return (
        <div style={{
            background: COLORS.cardBg,
            borderRadius: '14px',
            padding: isMobile ? '16px' : '22px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: '700',
                    color: COLORS.text,
                }}>
                    Stato Sistema
                </h3>
                <button
                    onClick={handleRetry}
                    disabled={checking}
                    style={{
                        padding: '6px 12px',
                        background: checking ? '#f0f0f0' : `${COLORS.primary}10`, // palette
                        color: checking ? COLORS.textMuted : COLORS.primary,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: checking ? 'default' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        fontFamily: 'inherit',
                    }}
                >
                    {checking ? 'Verifica...' : 'Ricontrolla'}
                </button>
            </div>

            {checking && !status ? (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                    <div style={{
                        fontSize: '14px',
                        color: COLORS.textMuted,
                    }}>
                        Verificando connessioni...
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {services.map((svc) => (
                        <div key={svc.name} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            background: svc.ok ? '#f0fdf4' : '#fef2f2', // palette
                            borderRadius: '8px',
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: svc.ok ? COLORS.success : COLORS.danger,
                                flexShrink: 0,
                                boxShadow: svc.ok
                                    ? `0 0 6px ${COLORS.success}80`
                                    : `0 0 6px ${COLORS.danger}80`,
                            }} />
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: COLORS.text,
                                }}>
                                    {svc.name}
                                </div>
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: svc.ok ? '#16a34a' : '#dc2626', // palette
                            }}>
                                {svc.detail}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminDashboard({ isMobile, onNavigate }) {
    const [kpis, setKpis] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [kpiError, setKpiError] = useState(null);
    const [activityError, setActivityError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);
    const mountedRef = useRef(true);

    // ---- Data fetching ----
    const fetchData = useCallback(async () => {
        setLoading(true);
        setKpiError(null);
        setActivityError(null);

        // Fetch in parallel; each handles its own errors
        const [kpiResult, activityResult] = await Promise.allSettled([
            dashboardService.getAdminKPIs(),
            dashboardService.getActivityFeed(10),
        ]);

        if (!mountedRef.current) return;

        // KPIs
        if (kpiResult.status === 'fulfilled' && kpiResult.value) {
            setKpis(kpiResult.value);
        } else {
            const errMsg = kpiResult.status === 'rejected'
                ? kpiResult.reason?.message || 'Errore KPI'
                : 'Risposta vuota';
            setKpiError(errMsg);
        }

        // Activity Feed
        if (activityResult.status === 'fulfilled') {
            const items = activityResult.value?.items
                || activityResult.value?.data
                || activityResult.value?.results
                || (Array.isArray(activityResult.value) ? activityResult.value : []);
            setActivity(items);
        } else {
            setActivityError(
                activityResult.reason?.message || 'Errore activity feed'
            );
        }

        setLastRefresh(new Date());
        setLoading(false);
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        fetchData();
        return () => { mountedRef.current = false; };
    }, [fetchData]);

    // ---- Compose KPI values ----
    const hasBackendError = Boolean(kpiError && activityError);

    function getKPIValue(key) {
        if (kpis && kpis[key] !== undefined) {
            return kpis[key];
        }
        // Try snake_case variants
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (kpis && kpis[snakeKey] !== undefined) {
            return kpis[snakeKey];
        }
        return null;
    }

    // ---- Render ----
    const gridCols = isMobile
        ? 'repeat(auto-fill, minmax(150px, 1fr))'
        : 'repeat(auto-fill, minmax(230px, 1fr))';

    return (
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Header row */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '10px',
            }}>
                <div>
                    <h2 style={{
                        margin: 0,
                        fontSize: isMobile ? '18px' : '22px',
                        fontWeight: '800',
                        color: COLORS.primary,
                    }}>
                        Dashboard Real-time
                    </h2>
                    {lastRefresh && (
                        <p style={{
                            margin: '4px 0 0',
                            fontSize: '14px',
                            color: COLORS.textMuted,
                        }}>
                            Ultimo aggiornamento: {lastRefresh.toLocaleTimeString('it-IT')}
                        </p>
                    )}
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    style={{
                        padding: isMobile ? '8px 14px' : '10px 20px',
                        background: loading ? '#f0f0f0' : COLORS.primary, // palette
                        color: loading ? COLORS.textMuted : 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: loading ? 'default' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                    }}
                >
                    {loading ? 'Caricamento...' : 'Aggiorna'}
                </button>
            </div>

            {/* Loading State — skeleton cards matching KPI grid layout */}
            {loading && !kpis && (
                <KPISkeletonLoader isMobile={isMobile} />
            )}

            {/* Backend fully offline: consolidated warning + quick actions only */}
            {!loading && hasBackendError && (
                <>
                    <BackendWarningBanner isMobile={isMobile} />
                    {/* Quick Actions always visible even when backend is down */}
                    <div style={{
                        background: COLORS.cardBg,
                        borderRadius: '14px',
                        padding: isMobile ? '16px' : '22px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        marginBottom: '20px',
                    }}>
                        <h3 style={{
                            margin: '0 0 14px',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: '700',
                            color: COLORS.text,
                        }}>
                            Azioni Rapide
                        </h3>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: isMobile ? '8px' : '10px',
                        }}>
                            {QUICK_ACTIONS.map((action) => (
                                <QuickActionButton
                                    key={action.tabId}
                                    label={action.label}
                                    icon={action.icon}
                                    color={action.color}
                                    isMobile={isMobile}
                                    onClick={() => onNavigate(action.tabId)}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Individual KPI error banner (shown only if activity is still available) */}
            {!loading && kpiError && !hasBackendError && (
                <ErrorCard
                    message={`KPI Notion: ${kpiError}`}
                    isMobile={isMobile}
                />
            )}
            {/* KPI Cards Grid — hidden when backend is fully offline */}
            {(!loading || kpis) && !hasBackendError && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: gridCols,
                    gap: isMobile ? '10px' : '14px',
                    marginBottom: '20px',
                }}>
                    {KPI_DEFS.map((kpi) => (
                        <KPICard
                            key={kpi.key}
                            label={kpi.label}
                            value={getKPIValue(kpi.key)}
                            icon={kpi.icon}
                            color={kpi.color}
                            format={kpi.format}
                            isMobile={isMobile}
                            hasError={Boolean(kpiError)}
                        />
                    ))}
                </div>
            )}

            {/* Bottom section: 2-column on desktop — hidden when backend is fully offline */}
            {!loading && !hasBackendError && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: isMobile ? '14px' : '18px',
                    marginBottom: '20px',
                }}>
                    {/* Quick Actions */}
                    <div style={{
                        background: COLORS.cardBg,
                        borderRadius: '14px',
                        padding: isMobile ? '16px' : '22px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}>
                        <h3 style={{
                            margin: '0 0 14px',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: '700',
                            color: COLORS.text,
                        }}>
                            Azioni Rapide
                        </h3>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: isMobile ? '8px' : '10px',
                        }}>
                            {QUICK_ACTIONS.map((action) => (
                                <QuickActionButton
                                    key={action.tabId}
                                    label={action.label}
                                    icon={action.icon}
                                    color={action.color}
                                    isMobile={isMobile}
                                    onClick={() => onNavigate(action.tabId)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div style={{
                        background: COLORS.cardBg,
                        borderRadius: '14px',
                        padding: isMobile ? '16px' : '22px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        maxHeight: '400px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <h3 style={{
                            margin: '0 0 14px',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: '700',
                            color: COLORS.text,
                        }}>
                            Attività Recente
                        </h3>

                        {activityError ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '20px',
                                color: COLORS.textMuted,
                                fontSize: '14px',
                            }}>
                                <p style={{ margin: '0 0 4px', fontSize: '24px', color: COLORS.textMuted }}>{'\u2014'}</p>
                                <p style={{ margin: 0 }}>Activity feed non disponibile</p>
                                <p style={{ margin: '4px 0 0', fontSize: '14px' }}>
                                    Configura il workflow backend per abilitare il feed
                                </p>
                            </div>
                        ) : activity.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '20px',
                                color: COLORS.textMuted,
                                fontSize: '14px',
                            }}>
                                <p style={{ margin: '0 0 4px', fontSize: '24px', color: COLORS.textMuted }}>{'\u2014'}</p>
                                <p style={{ margin: 0 }}>Nessuna attività recente</p>
                            </div>
                        ) : (
                            <div style={{ overflowY: 'auto', flex: 1 }}>
                                {activity.slice(0, 10).map((item, idx) => (
                                    <ActivityItem
                                        key={item.id || idx}
                                        item={item}
                                        isMobile={isMobile}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* System Status */}
            {!loading && (
                <SystemStatusCard isMobile={isMobile} />
            )}
        </div>
    );
}
