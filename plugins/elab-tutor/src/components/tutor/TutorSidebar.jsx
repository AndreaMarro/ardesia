// ============================================
// ELAB Tutor - Sidebar Navigation Component
// Collapsible sidebar with icons + labels
// Responsive: auto-collapse on tablet, hide on mobile
// (c) Andrea Marro — 13/02/2026
// ============================================

import React, { useEffect, useMemo, useState } from 'react';

// Mapping: sidebar tab ID → Notion DB game name (used by teacher toggle)
const GAME_ID_TO_NOTION = {
    detective: 'CircuitDetective',
    poe: 'PredictObserveExplain',
    reverse: 'ReverseEngineering',
    review: 'CircuitReview',
};

// Andrea Marro — 24/02/2026
// ─── SVG Icons (18×18 stroke-based, inherits currentColor) ───
const ICON_PROPS = { width: 18, height: 18, viewBox: '0 0 18 18', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

const ICONS = {
    manual: <svg {...ICON_PROPS}><path d="M2 3.5h4c1.1 0 2 .9 2 2V15c-.7-.5-1.5-.8-2.5-.8H2V3.5z"/><path d="M16 3.5h-4c-1.1 0-2 .9-2 2V15c.7-.5 1.5-.8 2.5-.8H16V3.5z"/></svg>,
    simulator: <svg {...ICON_PROPS} viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    detective: <svg {...ICON_PROPS}><circle cx="7.5" cy="7.5" r="4.5"/><path d="M15.5 15.5l-3.8-3.8"/></svg>,
    poe: <svg {...ICON_PROPS}><path d="M1.5 9s2.8-5 7.5-5 7.5 5 7.5 5-2.8 5-7.5 5S1.5 9 1.5 9z"/><circle cx="9" cy="9" r="2.5"/></svg>,
    reverse: <svg {...ICON_PROPS}><circle cx="9" cy="9" r="7"/><path d="M6.5 6.8a3 3 0 0 1 5 1c0 1.5-2.5 2-2.5 3"/><circle cx="9" cy="13" r=".5" fill="currentColor" stroke="none"/></svg>,
    review: <svg {...ICON_PROPS}><rect x="3" y="2" width="12" height="14" rx="2"/><path d="M6 5.5h6"/><path d="M6 9l2 2 4-4"/></svg>,
    canvas: <svg {...ICON_PROPS}><path d="M13 2.5l2.5 2.5-8.5 8.5H4.5V11L13 2.5z"/></svg>,
    notebooks: <svg {...ICON_PROPS}><rect x="3" y="1.5" width="12" height="15" rx="2"/><path d="M6.5 5.5h5M6.5 8.5h5M6.5 11.5h3"/></svg>,
    videos: <svg {...ICON_PROPS}><circle cx="9" cy="9" r="7"/><path d="M7.5 6v6l5-3z" fill="currentColor" stroke="none"/></svg>,
    scuole: <svg {...ICON_PROPS}><path d="M2.5 15.5V8L9 4l6.5 4v7.5"/><rect x="6.5" y="10.5" width="5" height="5"/></svg>,
    chevronDown: <svg {...ICON_PROPS}><polyline points="6 9 12 15 18 9"/></svg>,
    chevronRight: <svg {...ICON_PROPS}><polyline points="9 6 15 12 9 18"/></svg>,
};

const NAV_SECTIONS = [
    {
        label: 'Risorse',
        items: [
            { id: 'manual',    icon: 'M', label: 'Manuale',    shortcut: 'Ctrl+M' },
            { id: 'simulator', icon: 'S', label: 'Simulatore', shortcut: 'Ctrl+S' },
        ]
    },
    {
        label: 'Giochi',
        items: [
            { id: 'detective', icon: 'G', label: 'Trova Guasto' },
            { id: 'poe',       icon: 'P', label: 'Prevedi' },
            { id: 'reverse',   icon: 'R', label: 'Misterioso' },
            { id: 'review',    icon: 'C', label: 'Controlla' },
        ]
    },
    {
        label: 'Media',
        items: [
            { id: 'videos',    icon: 'V', label: 'Video' },
        ]
    },
    {
        label: 'Personale',
        items: [
            { id: 'canvas',    icon: 'L', label: 'Lavagna' },
            { id: 'notebooks', icon: 'T', label: 'Taccuini' },
        ]
    },
];

export default function TutorSidebar({
    activeTab,
    onTabChange,
    collapsed,
    onToggleCollapsed,
    allowedGames, // null = show all, string[] = Notion game names to show
}) {
    // Menu giochi chiuso di default
    const [gamesOpen, setGamesOpen] = useState(false);

    // Reset giochi quando sidebar chiude
    useEffect(() => {
        if (collapsed) setGamesOpen(false);
    }, [collapsed]);

    // Sprint 3: Filter games section by teacher-allowed list
    const filteredSections = useMemo(() => {
        if (!allowedGames) return NAV_SECTIONS; // null = family user, show all
        return NAV_SECTIONS.map(section => {
            if (section.label !== 'Giochi') return section;
            const allowedSet = new Set(allowedGames);
            const filtered = section.items.filter(
                item => allowedSet.has(GAME_ID_TO_NOTION[item.id])
            );
            // Hide entire section if no games allowed
            return filtered.length > 0 ? { ...section, items: filtered } : null;
        }).filter(Boolean);
    }, [allowedGames]);

    // Auto-collapse on tablet, auto-expand on desktop
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            // On tablet (768-1023), force collapsed
            if (w >= 768 && w < 1024 && !collapsed) {
                onToggleCollapsed();
            }
            // On desktop (>=1024), auto-expand if currently collapsed by resize
            // (but don't force — user may have manually collapsed)
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <nav
            className={`tutor-sidebar ${collapsed ? 'collapsed' : 'expanded'}`}
            role="navigation"
            aria-label="Navigazione principale"
        >
            <div className="sidebar-nav">
                {filteredSections.map((section, si) => (
                    <div key={si} className="sidebar-section">
                        {/* Sezione Giochi con menu a scomparsa */}
                        {section.label === 'Giochi' && !collapsed ? (
                            <>
                                <button
                                    className="sidebar-section-label sidebar-dropdown-toggle"
                                    onClick={() => setGamesOpen(!gamesOpen)}
                                    aria-expanded={gamesOpen}
                                    aria-label="Giochi didattici"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: 'var(--elab-hex-737373)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    <span>{section.label}</span>
                                    <span style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        transition: 'transform 0.2s',
                                        transform: gamesOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}>
                                        {ICONS.chevronDown}
                                    </span>
                                </button>
                                {gamesOpen && section.items.map(item => (
                                    <button
                                        key={item.id}
                                        className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                                        onClick={() => onTabChange(item.id)}
                                        title={collapsed ? `${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}` : (item.shortcut || item.label)}
                                        aria-label={item.label}
                                        aria-current={activeTab === item.id ? 'page' : undefined}
                                    >
                                        <span className="sidebar-icon">{ICONS[item.id] || item.icon}</span>
                                        {!collapsed && <span className="sidebar-label">{item.label}</span>}
                                    </button>
                                ))}
                            </>
                        ) : (
                            <>
                                {!collapsed && section.label !== 'Giochi' && (
                                    <div className="sidebar-section-label">{section.label}</div>
                                )}
                                {section.items.map(item => item.href ? (
                                    <a
                                        key={item.id}
                                        className="sidebar-item"
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={collapsed ? item.label : item.label}
                                        aria-label={item.label}
                                    >
                                        <span className="sidebar-icon">{ICONS[item.id] || item.icon}</span>
                                        {!collapsed && <span className="sidebar-label">{item.label}</span>}
                                    </a>
                                ) : (
                                    <button
                                        key={item.id}
                                        className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                                        onClick={() => onTabChange(item.id)}
                                        title={collapsed ? `${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}` : (item.shortcut || item.label)}
                                        aria-label={item.label}
                                        aria-current={activeTab === item.id ? 'page' : undefined}
                                    >
                                        <span className="sidebar-icon">{ICONS[item.id] || item.icon}</span>
                                        {!collapsed && <span className="sidebar-label">{item.label}</span>}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="sidebar-footer">
                <button
                    className="sidebar-collapse-btn"
                    onClick={onToggleCollapsed}
                    title={collapsed ? 'Espandi (Ctrl+B)' : 'Comprimi (Ctrl+B)'}
                    aria-label={collapsed ? 'Espandi barra laterale' : 'Comprimi barra laterale'}
                >
                    {collapsed ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    )}
                </button>
            </div>
        </nav>
    );
}

// Mobile bottom tabs — Apple iOS tab bar style
// allowedGames: null = show all, string[] = Notion game names allowed by teacher
// Map Notion game names back to tab IDs for mobile navigation
const NOTION_TO_TAB_ID = {
    CircuitDetective: 'detective',
    PredictObserveExplain: 'poe',
    ReverseEngineering: 'reverse',
    CircuitReview: 'review',
};

export function MobileBottomTabs({ activeTab, onTabChange, allowedGames }) {
    const mobileTabs = useMemo(() => {
        // Determine which game tab the "Giochi" button should open
        let gamesTabId = 'detective'; // default: first game
        if (allowedGames && allowedGames.length > 0) {
            // Navigate to the first teacher-allowed game
            gamesTabId = NOTION_TO_TAB_ID[allowedGames[0]] || 'detective';
        }

        const baseTabs = [
            { id: 'manual',    icon: ICONS.manual, label: 'Manuale' },
            { id: 'simulator', icon: ICONS.simulator, label: 'Simulatore' },
            { id: gamesTabId,  icon: ICONS.detective, label: 'Giochi' },
            { id: 'videos',    icon: ICONS.videos, label: 'Video' },
            { id: 'canvas',    icon: ICONS.canvas, label: 'Lavagna' },
        ];
        // If teacher has restricted games and none are allowed, hide the Giochi tab
        if (allowedGames && allowedGames.length === 0) {
            return baseTabs.filter(t => t.label !== 'Giochi');
        }
        return baseTabs;
    }, [allowedGames]);

    return (
        <nav
            className="tutor-mobile-tabs"
            role="tablist"
            aria-label="Navigazione rapida"
        >
                {mobileTabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`mobile-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                        aria-label={tab.label}
                        aria-selected={activeTab === tab.id}
                        role="tab"
                    >
                        <span className="mobile-tab-icon">{tab.icon}</span>
                        <span className="mobile-tab-label">{tab.label}</span>
                    </button>
                ))}
        </nav>
    );
}
