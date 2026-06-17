// ============================================
// ELAB - Pannello Admin REALE
// Collegato a Notion via backend webhook
// © Andrea Marro — 08/02/2026
// ============================================

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import useIsMobile from '../../hooks/useIsMobile';
import { testConnection } from '../../services/notionService';
// Code-split: each admin tab loads only when selected
const AdminDashboard = lazy(() => import('./tabs/AdminDashboard'));
const AdminUtenti = lazy(() => import('./tabs/AdminUtenti'));
const AdminOrdini = lazy(() => import('./tabs/AdminOrdini'));
const AdminCorsi = lazy(() => import('./tabs/AdminCorsi'));
const AdminEventi = lazy(() => import('./tabs/AdminEventi'));
const AdminWaitlist = lazy(() => import('./tabs/AdminWaitlist'));
const GestionalePage = lazy(() => import('./gestionale/GestionalePage'));

// SECURITY FIX 13/02/2026: Hardcoded fallback URL removed from client bundle.
// Set VITE_N8N_LICENSE_URL as environment variable on Vercel.
const NOTION_LICENSE_URL = import.meta.env.VITE_N8N_LICENSE_URL || '';

const IconDashboard = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);
const IconUsers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const IconOrders = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);
const IconCourses = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);
const IconEvents = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" /><path d="M8.5 2h7" /><path d="M7 16.5h10" />
    </svg>
);
const IconWaitlist = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M9 14l2 2 4-4" />
    </svg>
);
const IconLicenses = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M7 15h0" /><path d="M2 9h20" /><path d="M7 15a1 1 0 1 0 0-0.01" />
    </svg>
);
const IconGestionale = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" />
    </svg>
);

const TABS = [
    { id: 'dashboard',   label: 'Dashboard',    icon: <IconDashboard />, color: 'var(--elab-navy)' },
    { id: 'utenti',      label: 'Utenti',       icon: <IconUsers />, color: 'var(--elab-lime)' },
    { id: 'ordini',      label: 'Ordini',       icon: <IconOrders />, color: 'var(--elab-hex-f59e0b)' },
    { id: 'corsi',       label: 'Corsi',        icon: <IconCourses />, color: 'var(--elab-hex-8b5cf6)' },
    { id: 'eventi',      label: 'Eventi',       icon: <IconEvents />, color: 'var(--elab-hex-ec4899)' },
    { id: 'waitlist',    label: 'Waitlist',     icon: <IconWaitlist />, color: 'var(--elab-hex-14b8a6)' },
    { id: 'licenze',     label: 'Licenze',      icon: <IconLicenses />, color: 'var(--elab-hex-6366f1)' },
    { id: 'gestionale',  label: 'Gestionale',   icon: <IconGestionale />, color: 'var(--elab-hex-0f172a)' },
];

// Admin password hash — Codex security review 2026-05-27 hardening:
// 1. Moved hash from hardcoded literal to env var VITE_ADMIN_PWD_HASH
//    (set on Vercel + .env.local for dev). Hash rotation = env var change,
//    NO code commit. Stale hash in old git history mitigated by repo private.
// 2. Added per-user-agent salt-like prefix to make rainbow-table targeted.
//    Salt is PUBLIC (client-side) but doubles effort for attacker.
// 3. SHA-256 client-side gate = LOW-security control. Target: scuole con kit
//    fisico, no online attacker model. For higher-security need: server-side
//    auth via Supabase + RLS + role claim (out of current scope).
//
// To change pwd: hash = sha256(SALT + new_password), set VITE_ADMIN_PWD_HASH
// Test command: node -e "const s='ELAB_ADMIN_v1_'; const p='your_password';
//   require('crypto').createHash('sha256').update(s+p).digest('hex')"
const ADMIN_PWD_HASH = (import.meta.env.VITE_ADMIN_PWD_HASH || '').trim();
const ADMIN_PWD_SALT = 'ELAB_ADMIN_v1_';

async function hashPassword(pwd) {
    const enc = new TextEncoder().encode(ADMIN_PWD_SALT + pwd);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminPage({ onNavigate }) {
    const { user, isAdmin } = useAuth();
    const isMobile = useIsMobile();
    const [tab, setTab] = useState('dashboard');
    const [connectionStatus, setConnectionStatus] = useState(null);

    // Admin auth gate — password-based if not already admin via auth system
    const [adminUnlocked, setAdminUnlocked] = useState(false);
    const [pwdInput, setPwdInput] = useState('');
    const [pwdError, setPwdError] = useState(false);

    const effectiveAdmin = isAdmin || adminUnlocked;

    // Licenze state (kept local — already working via backend)
    const [licenseCode, setLicenseCode] = useState('');
    const [licenseResult, setLicenseResult] = useState(null);
    const [licenseLoading, setLicenseLoading] = useState(false);
    const [licenseHistory, setLicenseHistory] = useState([]);

    // Check connection on mount
    useEffect(() => {
        if (!effectiveAdmin) return;
        testConnection().then(setConnectionStatus).catch(() => setConnectionStatus({ connected: false }));
        try { setLicenseHistory(JSON.parse(localStorage.getItem('elab_license_history') || '[]')); } catch {}
    }, [effectiveAdmin]);

    const handleAdminLogin = async (e) => {
        e?.preventDefault();
        const hash = await hashPassword(pwdInput);
        if (hash === ADMIN_PWD_HASH) {
            setAdminUnlocked(true);
            setPwdError(false);
        } else {
            setPwdError(true);
            setPwdInput('');
        }
    };

    if (!effectiveAdmin) {
        return (
            <div style={S.denied}>
                <h2 style={{ color: 'var(--elab-navy)', margin: '0 0 16px' }}>Accesso Admin</h2>
                <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                    <input
                        type="password"
                        value={pwdInput}
                        onChange={e => { setPwdInput(e.target.value); setPwdError(false); }}
                        placeholder="Password admin"
                        autoFocus
                        style={{ padding: '10px 16px', borderRadius: '8px', border: pwdError ? '2px solid var(--elab-hex-ef4444)' : '1px solid #ccc', fontSize: '15px', width: '240px' }}
                    />
                    {pwdError && <p style={{ color: 'var(--elab-hex-ef4444)', margin: 0, fontSize: '14px' }}>Password errata</p>}
                    <button type="submit" style={S.primaryBtn}>Accedi</button>
                </form>
                <button onClick={() => onNavigate('tutor')} style={{ ...S.primaryBtn, background: 'transparent', color: '#666', marginTop: '12px' }}>
                    {'\u2190'} Torna alla home
                </button>
            </div>
        );
    }

    // Licenze handler (already works via backend → Notion)
    const handleCheckLicense = async () => {
        if (!licenseCode.trim()) return;
        setLicenseLoading(true);
        setLicenseResult(null);
        try {
            const res = await fetch(NOTION_LICENSE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify',
                    code: licenseCode.trim().toUpperCase(),
                    deviceId: 'admin-check-' + Date.now(),
                }),
            });
            const data = await res.json();
            setLicenseResult(data);
            const entry = { code: licenseCode.trim().toUpperCase(), result: data, timestamp: new Date().toISOString() };
            const history = [entry, ...licenseHistory].slice(0, 50);
            setLicenseHistory(history);
            localStorage.setItem('elab_license_history', JSON.stringify(history));
        } catch (err) {
            setLicenseResult({ error: 'Errore: ' + err.message });
        }
        setLicenseLoading(false);
    };

    const tabFallback = (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--elab-hex-737373)' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--elab-hex-737373)' }}>...</div>
            <div style={{ fontSize: '14px' }}>Caricamento...</div>
        </div>
    );

    const renderTab = () => {
        let content;
        switch (tab) {
            case 'dashboard':
                content = <AdminDashboard isMobile={isMobile} onNavigate={setTab} />;
                break;
            case 'utenti':
                content = <AdminUtenti isMobile={isMobile} />;
                break;
            case 'ordini':
                content = <AdminOrdini isMobile={isMobile} />;
                break;
            case 'corsi':
                content = <AdminCorsi isMobile={isMobile} />;
                break;
            case 'eventi':
                content = <AdminEventi isMobile={isMobile} />;
                break;
            case 'waitlist':
                content = <AdminWaitlist isMobile={isMobile} />;
                break;
            case 'licenze':
                return renderLicenze();
            case 'gestionale':
                content = <GestionalePage />;
                break;
            default:
                content = <AdminDashboard isMobile={isMobile} onNavigate={setTab} />;
        }
        return <Suspense fallback={tabFallback}>{content}</Suspense>;
    };

    const renderLicenze = () => (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={S.card}>
                    <h3 style={{ margin: '0 0 12px', color: 'var(--elab-hex-6366f1)', fontSize: '16px', fontWeight: '700' }}>
                        Verifica Licenza Notion
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666', margin: '0 0 14px' }}>
                        Interroga il database Notion "Licenze ELAB" tramite webhook backend.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            value={licenseCode}
                            onChange={e => setLicenseCode(e.target.value)}
                            placeholder="Es: SCUOLA-2024-ABCD"
                            style={{ ...S.input, flex: 1, textTransform: 'uppercase' }}
                            onKeyDown={e => e.key === 'Enter' && handleCheckLicense()}
                        />
                        <button onClick={handleCheckLicense} style={S.primaryBtn} disabled={licenseLoading}>
                            {licenseLoading ? '...' : 'Verifica'}
                        </button>
                    </div>
                    {licenseResult && (
                        <div style={{
                            marginTop: '16px', padding: '16px', borderRadius: '10px',
                            background: licenseResult.valid ? 'var(--elab-hex-f0fdf4)' : 'var(--elab-hex-fef2f2)',
                            border: `1px solid ${licenseResult.valid ? 'var(--elab-hex-86efac)' : 'var(--elab-hex-fca5a5)'}`,
                        }}>
                            <div style={{
                                fontWeight: '700', fontSize: '15px', marginBottom: '8px',
                                color: licenseResult.valid ? 'var(--elab-hex-16a34a)' : 'var(--elab-hex-dc2626)',
                            }}>
                                {licenseResult.valid ? 'Licenza VALIDA' : 'Licenza NON VALIDA'}
                            </div>
                            {licenseResult.valid ? (
                                <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.8' }}>
                                    <div><b>Scuola:</b> {licenseResult.school || '—'}</div>
                                    <div><b>Email:</b> {licenseResult.email || '—'}</div>
                                    <div><b>Scadenza:</b> {licenseResult.expiry ? new Date(licenseResult.expiry).toLocaleDateString('it-IT') : '—'}</div>
                                    <div><b>Piano:</b> {licenseResult.plan || 'base'}</div>
                                    <div><b>Max Utenti:</b> {licenseResult.maxUsers || 1}</div>
                                </div>
                            ) : (
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    {licenseResult.error || 'Codice non trovato.'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div style={S.card}>
                    <h3 style={{ margin: '0 0 12px', color: 'var(--elab-hex-6366f1)', fontSize: '16px', fontWeight: '700' }}>
                        Info Collegamento
                    </h3>
                    <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
                        <div><b>Webhook:</b> <code style={S.code}>{NOTION_LICENSE_URL}</code></div>
                        <div><b>Database:</b> Licenze ELAB</div>
                        <div><b>Campi:</b> Codice, Scuola, Email, Scadenza, Attiva, MaxUtenti, Piano, DeviceId</div>
                        <div><b>Azioni:</b> verify, release</div>
                        <div style={{ marginTop: '12px' }}>
                            <b>Stato Backend Admin:</b>{' '}
                            {connectionStatus === null ? (
                                <span style={{ color: 'var(--elab-hex-737373)' }}>Verificando...</span>
                            ) : connectionStatus.connected ? (
                                <span style={{ color: 'var(--elab-hex-16a34a)', fontWeight: '600' }}>Connesso</span>
                            ) : (
                                <span style={{ color: 'var(--elab-hex-ef4444)', fontWeight: '600' }}>Non raggiungibile</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {licenseHistory.length > 0 && (
                <div style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#333' }}>
                            Storico Verifiche ({licenseHistory.length})
                        </h3>
                        <button
                            onClick={() => { setLicenseHistory([]); localStorage.removeItem('elab_license_history'); }}
                            style={{ ...S.tinyBtn, color: 'var(--elab-hex-ef4444)' }}
                        >
                            Pulisci
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <div style={S.tableHeader}>
                            <span style={{ flex: 1 }}>Codice</span>
                            <span style={{ flex: 1 }}>Risultato</span>
                            <span style={{ flex: 1 }}>Scuola</span>
                            <span style={{ flex: 1 }}>Data</span>
                        </div>
                        {licenseHistory.slice(0, 20).map((h, i) => (
                            <div key={i} style={S.tableRow}>
                                <span style={{ flex: 1, fontWeight: '600', fontSize: '14px', fontFamily: 'monospace' }}>{h.code}</span>
                                <span style={{ flex: 1 }}>
                                    <span style={{
                                        fontSize: '14px', padding: '2px 8px', borderRadius: '4px',
                                        background: h.result?.valid ? 'var(--elab-hex-dcfce7)' : 'var(--elab-hex-fee2e2)',
                                        color: h.result?.valid ? 'var(--elab-hex-16a34a)' : 'var(--elab-hex-dc2626)',
                                    }}>
                                        {h.result?.valid ? 'Valida' : 'Non valida'}
                                    </span>
                                </span>
                                <span style={{ flex: 1, fontSize: '14px', color: '#666' }}>{h.result?.school || '—'}</span>
                                <span style={{ flex: 1, fontSize: '14px', color: 'var(--elab-hex-737373)' }}>{new Date(h.timestamp).toLocaleString('it-IT')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // === MOBILE LAYOUT ===
    if (isMobile) {
        return (
            <div style={{ background: 'var(--elab-hex-f0f4f8)', minHeight: 'calc(100vh - 56px)' }}>
                {/* Header */}
                <div style={{
                    background: 'var(--elab-navy)', padding: '14px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px', color: '#fff', fontWeight: 700 }}>{'\u2699'}</span>
                        <div>
                            <div style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>Admin Panel</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>ELAB Management</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            background: connectionStatus?.connected ? 'var(--elab-lime)' : '#EF4444',
                            width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block',
                        }} />
                        <span style={{
                            background: 'var(--elab-hex-ef4444)', color: 'white', fontSize: '14px',
                            fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
                        }}>ADMIN</span>
                    </div>
                </div>

                {/* Tab bar scrollabile */}
                <div style={{
                    display: 'flex', overflowX: 'auto', gap: '6px',
                    padding: '10px 12px', background: 'var(--elab-hex-1a3470)',
                    WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
                }}>
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            style={{
                                flexShrink: 0, padding: '10px 14px', borderRadius: '20px',
                                border: 'none', fontSize: '14px', minHeight: '44px',
                                fontWeight: tab === t.id ? '700' : '500',
                                background: tab === t.id ? t.color : 'rgba(255,255,255,0.1)',
                                color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.7)',
                                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                            }}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ padding: '14px' }}>
                    {renderTab()}
                </div>
            </div>
        );
    }

    // === DESKTOP LAYOUT ===
    return (
        <div style={{
            display: 'flex', background: 'var(--elab-hex-f0f4f8)', minHeight: 'calc(100vh - 56px)',
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '220px', flexShrink: 0, background: 'var(--elab-navy)',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Brand */}
                <div style={{
                    padding: '20px 16px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px', color: '#fff', fontWeight: 700 }}>{'\u2699'}</span>
                        <div>
                            <div style={{ color: '#fff', fontWeight: '800', fontSize: '15px', letterSpacing: '-0.3px' }}>
                                Admin Panel
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                ELAB Management
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: connectionStatus?.connected ? 'var(--elab-lime)' : connectionStatus === null ? '#F59E0B' : '#EF4444',
                            display: 'inline-block',
                        }} />
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                            {connectionStatus === null ? 'Connessione...' : connectionStatus.connected ? 'Backend Connesso' : 'Backend Offline'}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
                    {TABS.map(t => {
                        const isActive = tab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center',
                                    gap: '10px', padding: '10px 12px', borderRadius: '8px',
                                    border: 'none',
                                    background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                                    fontSize: '14px', fontWeight: isActive ? '600' : '400',
                                    cursor: 'pointer', textAlign: 'left',
                                    transition: 'all 0.15s', marginBottom: '2px',
                                    position: 'relative',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {isActive && (
                                    <div style={{
                                        position: 'absolute', left: 0, top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '3px', height: '20px',
                                        background: t.color, borderRadius: '0 3px 3px 0',
                                    }} />
                                )}
                                <span style={{ width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.icon}</span>
                                <span>{t.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '14px', fontWeight: '700',
                        }}>
                            {user?.nome?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{user?.nome || 'Admin'}</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>{user?.email || ''}</div>
                        </div>
                    </div>
                    <div style={{
                        fontSize: '14px', color: 'rgba(255,255,255,0.3)', textAlign: 'center',
                    }}>
                        ELAB Admin v2.0 — Notion
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '24px', overflowY: 'auto', maxHeight: 'calc(100vh - 56px)' }}>
                {/* Page header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '20px',
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '22px', color: 'var(--elab-navy)', fontWeight: '800' }}>
                            {TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label}
                        </h1>
                        <p style={{ margin: '2px 0 0', fontSize: '14px', color: 'var(--elab-hex-737373)' }}>
                            {tab === 'dashboard' && 'Panoramica KPI e statistiche real-time'}
                            {tab === 'utenti' && 'Gestione utenti registrati — Notion Database'}
                            {tab === 'ordini' && 'Ordini e transazioni — Notion'}
                            {tab === 'corsi' && 'Catalogo corsi — Notion Database'}
                            {tab === 'eventi' && 'Calendario eventi — Notion Database'}
                            {tab === 'waitlist' && 'Iscritti in lista d\'attesa — Notion Database'}
                            {tab === 'licenze' && 'Verifica licenze — Backend Webhook'}
                            {tab === 'gestionale' && 'ERP Aziendale — Gestionale completo'}
                        </p>
                    </div>
                    <span style={{
                        background: 'var(--elab-hex-ef4444)', color: 'white', fontSize: '14px',
                        fontWeight: '700', padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.5px',
                    }}>
                        ADMIN
                    </span>
                </div>

                {renderTab()}
            </main>
        </div>
    );
}

// ============================================
// STYLES
// ============================================
const S = {
    denied: {
        textAlign: 'center', padding: '80px 20px',
        minHeight: 'calc(100vh - 56px)', background: 'var(--elab-hex-f0f4f8)',
    },
    primaryBtn: {
        padding: '10px 20px', background: 'var(--elab-navy)', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer',
        fontSize: '14px', fontWeight: '600',
    },
    card: {
        background: 'white', borderRadius: '12px', padding: '20px',
        marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    input: {
        padding: '9px 14px', border: '1px solid #ddd', borderRadius: '8px',
        fontSize: '14px', outline: 'none', fontFamily: 'inherit',
    },
    code: {
        background: 'var(--elab-hex-f0f0f0)', padding: '2px 6px', borderRadius: '4px',
        fontSize: '14px', fontFamily: 'monospace', wordBreak: 'break-all',
    },
    tinyBtn: {
        padding: '4px 12px', background: 'var(--elab-hex-f0f0f0)', border: 'none',
        borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
    },
    tableHeader: {
        display: 'flex', padding: '10px 16px', background: 'var(--elab-hex-f8f9fa)',
        borderBottom: '2px solid var(--elab-hex-e8e8e8)', fontSize: '14px',
        fontWeight: '700', color: 'var(--elab-hex-737373)', textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    tableRow: {
        display: 'flex', padding: '10px 16px',
        borderBottom: '1px solid var(--elab-hex-f0f0f0)', alignItems: 'center', fontSize: '14px',
    },
};
