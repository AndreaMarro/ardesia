// ============================================
// ELAB Tutor - Barra di Navigazione Sociale
// © Andrea Marro — 08/02/2026
// Tutti i diritti riservati
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import useIsMobile from '../../hooks/useIsMobile';


const ICONS = {
    tutor: 'T',
    dashboard: 'P',
    teacher: 'D',
    admin: 'A',
};

export default function Navbar({ currentPage, onNavigate }) {
    const { user, isAdmin, isDocente, logout } = useAuth();
    const isMobile = useIsMobile();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        onNavigate('login');
    };

    const navItems = [
        { id: 'tutor', label: 'Tutor', always: true },
        { id: 'dashboard', label: 'I Miei Progressi', auth: true, studentOnly: true },
        { id: 'teacher', label: 'Area Docente', docente: true },
        { id: 'admin', label: 'Admin', admin: true },
        { id: 'scuole', label: 'Per le Scuole', always: true, external: '/scuole/pnrr' },
    ];

    // Close dropdown when tapping outside
    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [menuOpen]);

    // Close menu on navigation
    const handleNavigate = (page) => {
        setMenuOpen(false);
        onNavigate(page);
    };

    const visibleItems = navItems.filter(item => {
        if (item.admin && !isAdmin) return false;
        if (item.docente && !isDocente && !isAdmin) return false;
        if (item.studentOnly && user?.ruolo !== 'user') return false;
        if (item.auth && !user) return false;
        return true;
    });

    // ─── MOBILE LAYOUT ───────────────────────────────
    if (isMobile) {
        return (
            <nav style={styles.nav}>
                <div style={styles.mobileBar}>
                    {/* Brand */}
                    <span style={styles.brand} onClick={() => handleNavigate('tutor')}>
                        ELAB
                    </span>

                    {/* Inline icon buttons (visible even when menu is closed) */}
                    <div style={styles.mobileInlineIcons}>
                        {visibleItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.id)}
                                style={{
                                    ...styles.mobileIconBtn,
                                    background: currentPage === item.id
                                        ? 'rgba(145,191,69,0.25)'
                                        : 'transparent',
                                    color: currentPage === item.id
                                        ? 'var(--elab-lime)'
                                        : 'rgba(255,255,255,0.7)',
                                }}
                                title={item.label}
                                aria-label={item.label}
                            >
                                {ICONS[item.id]}
                            </button>
                        ))}
                    </div>

                    {/* Hamburger toggle */}
                    <button
                        style={styles.hamburger}
                        onClick={() => setMenuOpen(prev => !prev)}
                        aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
                        aria-expanded={menuOpen}
                    >
                        <span style={{
                            ...styles.hamburgerLine,
                            transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                        }} />
                        <span style={{
                            ...styles.hamburgerLine,
                            opacity: menuOpen ? 0 : 1,
                        }} />
                        <span style={{
                            ...styles.hamburgerLine,
                            transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                        }} />
                    </button>
                </div>

                {/* Dropdown menu */}
                {menuOpen && (
                    <div style={styles.mobileDropdown} ref={menuRef}>
                        {/* Full nav links with labels (vertical) */}
                        {visibleItems.map(item => {
                            // Handle external links
                            if (item.external) {
                                return (
                                    <a
                                        key={item.id}
                                        href={item.external}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            ...styles.mobileNavLink,
                                            ...styles.mobileNavExternal,
                                            background: 'transparent',
                                            color: 'rgba(255,255,255,0.85)',
                                            borderLeft: '3px solid transparent',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        {item.label}
                                        <span style={styles.externalIcon}>↗</span>
                                    </a>
                                );
                            }
                            
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigate(item.id)}
                                    style={{
                                        ...styles.mobileNavLink,
                                        background: currentPage === item.id
                                            ? 'rgba(145,191,69,0.15)'
                                            : 'transparent',
                                        color: currentPage === item.id
                                            ? 'var(--elab-lime)'
                                            : 'rgba(255,255,255,0.85)',
                                        borderLeft: currentPage === item.id
                                            ? '3px solid var(--elab-lime)'
                                            : '3px solid transparent',
                                    }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}

                        {/* Divider */}
                        <div style={styles.mobileDivider} />

                        {/* User section */}
                        {user ? (
                            <div style={styles.mobileUserSection}>
                                <div style={styles.mobileUserRow} role="button" tabIndex={0} onClick={() => handleNavigate('profile')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNavigate('profile'); } }} aria-label="Profilo utente">
                                    <div style={styles.avatar}>
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="" style={styles.avatarImg} />
                                        ) : (
                                            <span>{user.nome?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                                            {user.nome}
                                        </div>
                                        {isAdmin && <span style={styles.adminBadge}>ADMIN</span>}
                                        {isDocente && <span style={styles.docenteBadge}>DOCENTE</span>}
                                    </div>
                                </div>
                                <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
                                    Esci
                                </button>
                            </div>
                        ) : (
                            <div style={styles.mobileAuthSection}>
                                <button
                                    onClick={() => handleNavigate('login')}
                                    style={styles.mobileLoginBtn}
                                >
                                    Accedi
                                </button>
                                <button
                                    onClick={() => handleNavigate('register')}
                                    style={styles.mobileRegisterBtn}
                                >
                                    Registrati
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </nav>
        );
    }

    // ─── DESKTOP LAYOUT ──────────────────────────────
    return (
        <nav style={styles.nav}>
            <div style={styles.left}>
                <span style={styles.brand} onClick={() => onNavigate('tutor')}>
                    ELAB
                </span>
                <div style={styles.links}>
                    {navItems.map(item => {
                        if (item.admin && !isAdmin) return null;
                        if (item.docente && !isDocente && !isAdmin) return null;
                        if (item.studentOnly && user?.ruolo !== 'user') return null;
                        if (item.auth && !user) return null;
                        
                        // Handle external links
                        if (item.external) {
                            return (
                                <a
                                    key={item.id}
                                    href={item.external}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        ...styles.navBtn,
                                        ...styles.navLink,
                                        background: 'transparent',
                                        color: 'rgba(255,255,255,0.7)',
                                        borderBottom: '2px solid transparent',
                                    }}
                                >
                                    {item.label}
                                </a>
                            );
                        }
                        
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                style={{
                                    ...styles.navBtn,
                                    background: currentPage === item.id ? 'rgba(145,191,69,0.2)' : 'transparent',
                                    color: currentPage === item.id ? 'var(--elab-lime)' : 'rgba(255,255,255,0.7)',
                                    borderBottom: currentPage === item.id ? '2px solid var(--elab-lime)' : '2px solid transparent',
                                }}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={styles.right}>
                {user ? (
                    <div style={styles.userArea}>
                        <div style={styles.avatar} role="button" tabIndex={0} onClick={() => onNavigate('profile')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('profile'); } }} aria-label="Profilo utente">
                            {user.avatar ? (
                                <img src={user.avatar} alt="" style={styles.avatarImg} />
                            ) : (
                                <span>{user.nome?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <span style={styles.userName} onClick={() => onNavigate('profile')}>
                            {user.nome?.split(' ')[0]}
                        </span>
                        {isAdmin && <span style={styles.adminBadge}>ADMIN</span>}
                        {isDocente && <span style={styles.docenteBadge}>DOCENTE</span>}
                        <button onClick={handleLogout} style={styles.logoutBtn}>Esci</button>
                    </div>
                ) : (
                    <div style={styles.authBtns}>
                        <button onClick={() => onNavigate('login')} style={styles.loginBtn}>Accedi</button>
                        <button onClick={() => onNavigate('register')} style={styles.registerBtn}>Registrati</button>
                    </div>
                )}
            </div>
        </nav>
    );
}

const styles = {
    // ─── Shared ──────────────────────────────────────
    nav: {
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(90deg, var(--elab-navy), #152a5e)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    brand: {
        color: 'var(--elab-lime)',
        fontSize: '20px',
        fontWeight: '800',
        cursor: 'pointer',
        letterSpacing: '-0.5px',
        whiteSpace: 'nowrap',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--elab-lime), #6fa030)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '700',
        fontSize: '14px',
        cursor: 'pointer',
        overflow: 'hidden',
        flexShrink: 0,
    },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    adminBadge: {
        background: 'var(--elab-hex-e53935)',
        color: 'white',
        fontSize: '14px',
        fontWeight: '700',
        padding: '2px 6px',
        borderRadius: '4px',
        letterSpacing: '0.5px',
    },
    docenteBadge: {
        background: 'var(--elab-navy)',
        color: 'white',
        fontSize: '14px',
        fontWeight: '700',
        padding: '2px 6px',
        borderRadius: '4px',
        letterSpacing: '0.5px',
    },

    // ─── Desktop ─────────────────────────────────────
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        height: '56px',
        padding: '0 20px',
    },
    links: { display: 'flex', gap: '4px' },
    navBtn: {
        border: 'none',
        padding: '8px 14px',
        borderRadius: '6px 6px 0 0',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.2s',
    },
    navLink: {
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        padding: '0 20px',
        position: 'absolute',
        right: 0,
    },
    userArea: { display: 'flex', alignItems: 'center', gap: '10px' },
    userName: {
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    logoutBtn: {
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'rgba(255,255,255,0.7)',
        padding: '5px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    authBtns: { display: 'flex', gap: '8px' },
    loginBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.3)',
        color: 'white',
        padding: '6px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },
    registerBtn: {
        background: 'linear-gradient(135deg, var(--elab-lime), #6fa030)',
        border: 'none',
        color: 'white',
        padding: '6px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },

    // ─── Mobile ──────────────────────────────────────
    mobileBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        padding: '0 12px',
    },
    mobileInlineIcons: {
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        flex: 1,
        justifyContent: 'center',
        padding: '0 8px',
    },
    mobileIconBtn: {
        border: 'none',
        width: '44px',
        height: '44px',
        minHeight: '44px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
        padding: 0,
    },
    hamburger: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '5px',
        width: '44px',
        height: '44px',
        minHeight: '44px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '8px',
        flexShrink: 0,
    },
    hamburgerLine: {
        display: 'block',
        width: '22px',
        height: '2px',
        background: 'rgba(255,255,255,0.85)',
        borderRadius: '2px',
        transition: 'all 0.25s ease',
        transformOrigin: 'center',
    },
    mobileDropdown: {
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, var(--elab-hex-152a5e), var(--elab-hex-0f2050))',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: '12px',
        animation: 'slideDown 0.2s ease-out',
    },
    mobileNavLink: {
        border: 'none',
        padding: '0 20px',
        height: '48px',
        minHeight: '44px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.15s',
    },
    mobileDivider: {
        height: '1px',
        background: 'rgba(255,255,255,0.08)',
        margin: '6px 16px',
    },
    mobileUserSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
        minHeight: '44px',
    },
    mobileUserRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
    },
    mobileLogoutBtn: {
        background: 'rgba(239,68,68,0.15)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: 'var(--elab-hex-ef4444)',
        padding: '8px 18px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        minHeight: '44px',
    },
    mobileAuthSection: {
        display: 'flex',
        gap: '10px',
        padding: '8px 20px',
    },
    mobileLoginBtn: {
        flex: 1,
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.3)',
        color: 'white',
        padding: '10px 0',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        minHeight: '44px',
    },
    mobileRegisterBtn: {
        flex: 1,
        background: 'linear-gradient(135deg, var(--elab-lime), #6fa030)',
        border: 'none',
        color: 'white',
        padding: '10px 0',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        minHeight: '44px',
    },
    mobileNavExternal: {
        justifyContent: 'space-between',
    },
    externalIcon: {
        fontSize: '14px',
        opacity: 0.7,
        marginLeft: '8px',
    },
};
