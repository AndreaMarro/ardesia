// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Admin - Gestione Waitlist
// CRUD completo su Notion DB "Waitlist"
// via waitlistService (notionService.js)
// ============================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { waitlistService } from '../../../services/notionService';
import logger from '../../../utils/logger';
import { showToast } from '../../common/Toast';

// ── Costanti ──────────────────────────────────────
const COLORS = {
    primary: 'var(--elab-navy)',
    primaryLight: 'var(--elab-hex-2a4fa3)',
    primaryBg: 'var(--elab-hex-ebf0fa)',
    success: 'var(--elab-lime)',
    successBg: 'var(--elab-hex-f0f7e4)',
    warning: 'var(--elab-hex-f59e0b)',
    warningBg: 'var(--elab-hex-fef3c7)',
    danger: 'var(--elab-hex-ef4444)',
    dangerBg: 'var(--elab-hex-fef2f2)',
    info: 'var(--elab-hex-06b6d4)',
    infoBg: 'var(--elab-hex-ecfeff)',
    teal: 'var(--elab-hex-14b8a6)',
    tealBg: 'var(--elab-hex-f0fdfa)',
    textPrimary: 'var(--elab-hex-1e293b)',
    textSecondary: 'var(--elab-hex-64748b)',
    textMuted: 'var(--elab-hex-64748b)',
    border: 'var(--elab-hex-e2e8f0)',
    borderLight: 'var(--elab-hex-f1f5f9)',
    card: 'var(--elab-hex-ffffff)',
    bg: 'var(--elab-hex-f8fafc)',
};

const TIPI = ['Premium', 'Eventi', 'Newsletter', 'Scuole'];
const STATI = ['In attesa', 'Contattato', 'Convertito', 'Rimosso'];

const TIPO_COLORS = {
    Premium:    { bg: 'var(--elab-hex-ede9fe)', color: 'var(--elab-hex-7c3aed)' },
    Eventi:     { bg: COLORS.warningBg, color: COLORS.warning },
    Newsletter: { bg: COLORS.infoBg, color: COLORS.info },
    Scuole:     { bg: COLORS.tealBg, color: COLORS.teal },
};

const STATO_COLORS = {
    'In attesa':   { bg: COLORS.warningBg, color: 'var(--elab-hex-b45309)' },
    'Contattato':  { bg: COLORS.infoBg, color: 'var(--elab-hex-0e7490)' },
    'Convertito':  { bg: COLORS.successBg, color: 'var(--elab-hex-4d7c0f)' },
    'Rimosso':     { bg: COLORS.dangerBg, color: COLORS.danger },
};

// ── Helpers ───────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return '\u2014';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function getPropText(prop) {
    if (!prop) return '';
    if (typeof prop === 'string') return prop;
    if (prop.plain_text) return prop.plain_text;
    if (Array.isArray(prop)) return prop.map(p => p.plain_text || p.text?.content || '').join('');
    if (prop.title) return Array.isArray(prop.title) ? prop.title.map(t => t.plain_text || '').join('') : prop.title;
    if (prop.rich_text) return Array.isArray(prop.rich_text) ? prop.rich_text.map(t => t.plain_text || '').join('') : prop.rich_text;
    if (prop.select) return prop.select.name || prop.select;
    if (prop.date) return prop.date.start || '';
    return String(prop);
}

function normalizeEntry(raw) {
    if (!raw) return null;
    const props = raw.properties || raw;
    return {
        id: raw.id || raw._id || '',
        email:         getPropText(props.Email || props.email || ''),
        nome:          getPropText(props.Nome || props.nome || ''),
        tipo:          getPropText(props.Tipo || props.tipo || ''),
        stato:         getPropText(props.Stato || props.stato || 'In attesa'),
        dataIscrizione: getPropText(props['Data Iscrizione'] || props.dataIscrizione || props.data_iscrizione || ''),
        note:          getPropText(props.Note || props.note || ''),
        sorgente:      getPropText(props.Sorgente || props.sorgente || ''),
    };
}

function buildPayload(entry) {
    return {
        Email: entry.email,
        Nome: entry.nome,
        Tipo: entry.tipo,
        Stato: entry.stato,
        'Data Iscrizione': entry.dataIscrizione || new Date().toISOString().split('T')[0],
        Note: entry.note,
        Sorgente: entry.sorgente,
    };
}


// ══════════════════════════════════════════════════
// COMPONENTE PRINCIPALE
// ══════════════════════════════════════════════════
export default function AdminWaitlist({ isMobile }) {
    // ── State ─────────────────────────────────────
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [filterStato, setFilterStato] = useState('');
    const [selected, setSelected] = useState(new Set());
    const [showAddModal, setShowAddModal] = useState(false);
    const [noteModal, setNoteModal] = useState(null); // { id, note }
    const [statoModal, setStatoModal] = useState(null); // { id, stato }
    const [bulkStatoModal, setBulkStatoModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const addFormRef = useRef({
        email: '', nome: '', tipo: 'Newsletter', stato: 'In attesa',
        note: '', sorgente: 'Manuale',
    });

    // ── Load data ─────────────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await waitlistService.getAll();
            const items = result?.items || result?.data || result?.results || (Array.isArray(result) ? result : []);
            setEntries(items.map(normalizeEntry).filter(Boolean));
        } catch (e) {
            logger.error('Errore caricamento waitlist:', e);
            setError(e.message || 'Errore di caricamento');
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Stats ─────────────────────────────────────
    const stats = useMemo(() => {
        const totale = entries.length;
        const byTipo = {};
        TIPI.forEach(t => { byTipo[t] = 0; });
        entries.forEach(e => {
            if (byTipo[e.tipo] !== undefined) byTipo[e.tipo]++;
        });
        const inAttesa = entries.filter(e => e.stato === 'In attesa').length;
        const convertiti = entries.filter(e => e.stato === 'Convertito').length;
        return { totale, byTipo, inAttesa, convertiti };
    }, [entries]);

    // ── Filtered entries ──────────────────────────
    const filtered = useMemo(() => {
        return entries.filter(e => {
            if (filterTipo && e.tipo !== filterTipo) return false;
            if (filterStato && e.stato !== filterStato) return false;
            if (search) {
                const s = search.toLowerCase();
                return (e.email || '').toLowerCase().includes(s)
                    || (e.nome || '').toLowerCase().includes(s)
                    || (e.sorgente || '').toLowerCase().includes(s)
                    || (e.note || '').toLowerCase().includes(s);
            }
            return true;
        });
    }, [entries, filterTipo, filterStato, search]);

    // ── Selection helpers ─────────────────────────
    const allSelected = filtered.length > 0 && filtered.every(e => selected.has(e.id));

    const toggleSelectAll = useCallback(() => {
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map(e => e.id)));
        }
    }, [allSelected, filtered]);

    const toggleSelect = useCallback((id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    // ── Actions ───────────────────────────────────
    const handleChangeStato = useCallback(async (id, nuovoStato) => {
        setActionLoading(true);
        try {
            await waitlistService.update(id, { Stato: nuovoStato });
            setEntries(prev => prev.map(e => e.id === id ? { ...e, stato: nuovoStato } : e));
            setStatoModal(null);
        } catch (e) {
            logger.error('Errore cambio stato:', e);
            showToast('Errore nel cambio stato: ' + (e.message || 'Errore sconosciuto'), 'error');
        }
        setActionLoading(false);
    }, []);

    const handleSaveNote = useCallback(async (id, note) => {
        setActionLoading(true);
        try {
            await waitlistService.update(id, { Note: note });
            setEntries(prev => prev.map(e => e.id === id ? { ...e, note } : e));
            setNoteModal(null);
        } catch (e) {
            logger.error('Errore salvataggio nota:', e);
            showToast('Errore nel salvataggio nota: ' + (e.message || 'Errore sconosciuto'), 'error');
        }
        setActionLoading(false);
    }, []);

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Eliminare questa email dalla waitlist?')) return;
        setActionLoading(true);
        try {
            await waitlistService.delete(id);
            setEntries(prev => prev.filter(e => e.id !== id));
            setSelected(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } catch (e) {
            logger.error('Errore eliminazione:', e);
            showToast('Errore nella rimozione: ' + (e.message || 'Errore sconosciuto'), 'error');
        }
        setActionLoading(false);
    }, []);

    const handleAdd = useCallback(async () => {
        const form = addFormRef.current;
        if (!form.email || !form.email.includes('@')) {
            showToast('Inserisci un indirizzo email valido.', 'warning');
            return;
        }
        setActionLoading(true);
        try {
            const payload = buildPayload({
                ...form,
                dataIscrizione: new Date().toISOString().split('T')[0],
            });
            const result = await waitlistService.create(payload);
            const newEntry = normalizeEntry(result);
            if (newEntry) {
                setEntries(prev => [newEntry, ...prev]);
            } else {
                await loadData();
            }
            setShowAddModal(false);
            addFormRef.current = {
                email: '', nome: '', tipo: 'Newsletter', stato: 'In attesa',
                note: '', sorgente: 'Manuale',
            };
        } catch (e) {
            logger.error('Errore aggiunta:', e);
            showToast('Errore: ' + (e.message || 'Impossibile aggiungere'), 'error');
        }
        setActionLoading(false);
    }, [loadData]);

    const handleBulkStato = useCallback(async (nuovoStato) => {
        if (selected.size === 0) return;
        setActionLoading(true);
        try {
            const promises = [...selected].map(id =>
                waitlistService.update(id, { Stato: nuovoStato })
            );
            await Promise.allSettled(promises);
            setEntries(prev => prev.map(e => selected.has(e.id) ? { ...e, stato: nuovoStato } : e));
            setSelected(new Set());
            setBulkStatoModal(false);
        } catch (e) {
            logger.error('Errore bulk stato:', e);
            showToast('Errore nell\'aggiornamento in blocco', 'error');
        }
        setActionLoading(false);
    }, [selected]);

    // ── Export CSV ─────────────────────────────────
    const exportCSV = useCallback(() => {
        const headers = ['Email', 'Nome', 'Tipo', 'Stato', 'Data Iscrizione', 'Sorgente', 'Note'];
        const rows = filtered.map(e => [
            e.email, e.nome, e.tipo, e.stato, e.dataIscrizione, e.sorgente,
            (e.note || '').replace(/"/g, '""'),
        ]);
        const csv = [
            headers.join(','),
            ...rows.map(r => r.map(v => `"${v || ''}"`).join(',')),
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `waitlist_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [filtered]);


    // ══════════════════════════════════════════════
    // STYLES (inline)
    // ══════════════════════════════════════════════
    const S = useMemo(() => ({
        container: {
            padding: isMobile ? '12px' : '0',
        },
        pageHeader: {
            marginBottom: '24px',
        },
        pageTitle: {
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: COLORS.textPrimary,
            margin: '0 0 4px',
        },
        pageSubtitle: {
            fontSize: '14px',
            color: COLORS.textSecondary,
            margin: 0,
        },

        // Summary cards
        cardsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)',
            gap: isMobile ? '8px' : '12px',
            marginBottom: '20px',
        },
        card: (color) => ({
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '10px',
            padding: isMobile ? '12px' : '16px',
            borderLeft: `4px solid ${color}`,
            transition: 'box-shadow 0.2s',
        }),
        cardLabel: {
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            marginBottom: '4px',
        },
        cardValue: (color) => ({
            fontSize: isMobile ? '22px' : '28px',
            fontWeight: '800',
            color: color,
            lineHeight: 1.1,
        }),

        // Toolbar
        toolbar: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            marginBottom: '16px',
            padding: '12px 16px',
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '10px',
        },
        searchInput: {
            flex: isMobile ? '1 1 100%' : '1 1 200px',
            padding: '9px 14px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            color: COLORS.textPrimary,
            background: COLORS.bg,
        },
        select: {
            padding: '9px 12px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            color: COLORS.textPrimary,
            background: COLORS.bg,
            cursor: 'pointer',
            minWidth: isMobile ? '0' : '140px',
            flex: isMobile ? '1 1 calc(50% - 5px)' : 'none',
        },
        btn: (bg, color = '#fff') => ({
            padding: '9px 16px',
            background: bg,
            color: color,
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s',
            flex: isMobile ? '1 1 calc(50% - 5px)' : 'none',
        }),
        btnSmall: (bg, color = '#fff') => ({
            padding: '5px 10px',
            background: bg,
            color: color,
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s',
        }),

        // Bulk bar
        bulkBar: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            background: COLORS.primaryBg,
            borderRadius: '8px',
            marginBottom: '12px',
            flexWrap: 'wrap',
        },
        bulkText: {
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.primary,
        },

        // Table
        tableWrap: {
            overflowX: 'auto',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '10px',
            background: COLORS.card,
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
        },
        th: {
            padding: '12px 14px',
            textAlign: 'left',
            fontWeight: '600',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            color: COLORS.textMuted,
            background: COLORS.bg,
            borderBottom: `2px solid ${COLORS.border}`,
            whiteSpace: 'nowrap',
            userSelect: 'none',
        },
        td: {
            padding: '10px 14px',
            borderBottom: `1px solid ${COLORS.borderLight}`,
            color: COLORS.textPrimary,
            verticalAlign: 'middle',
        },
        trHover: {
            cursor: 'default',
        },
        badge: (bgColor, textColor) => ({
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            background: bgColor,
            color: textColor,
            whiteSpace: 'nowrap',
        }),
        checkbox: {
            width: '16px',
            height: '16px',
            cursor: 'pointer',
            accentColor: COLORS.primary,
        },

        // Modal
        modalOverlay: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
        },
        modalBox: {
            background: COLORS.card,
            borderRadius: '14px',
            padding: isMobile ? '20px' : '28px',
            width: isMobile ? '100%' : '480px',
            maxWidth: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        },
        modalTitle: {
            fontSize: '18px',
            fontWeight: '700',
            color: COLORS.textPrimary,
            margin: '0 0 20px',
        },
        formGroup: {
            marginBottom: '14px',
        },
        formLabel: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.textSecondary,
            marginBottom: '5px',
        },
        formInput: {
            width: '100%',
            padding: '9px 12px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            color: COLORS.textPrimary,
            boxSizing: 'border-box',
        },
        formSelect: {
            width: '100%',
            padding: '9px 12px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            color: COLORS.textPrimary,
            background: '#fff',
            cursor: 'pointer',
            boxSizing: 'border-box',
        },
        formTextarea: {
            width: '100%',
            padding: '9px 12px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            color: COLORS.textPrimary,
            minHeight: '80px',
            resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
        },
        modalActions: {
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
            marginTop: '20px',
        },
        empty: {
            textAlign: 'center',
            padding: '48px 20px',
            color: COLORS.textMuted,
        },
        emptyIcon: {
            fontSize: '40px',
            marginBottom: '10px',
        },

        // Mobile cards view
        mobileCard: {
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '10px',
        },
        mobileCardRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
        },
        mobileCardLabel: {
            fontSize: '14px',
            color: COLORS.textMuted,
            fontWeight: '600',
        },
        mobileCardValue: {
            fontSize: '14px',
            color: COLORS.textPrimary,
        },
        mobileCardActions: {
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: `1px solid ${COLORS.borderLight}`,
        },
    }), [isMobile]);


    // ══════════════════════════════════════════════
    // RENDER: Loading
    // ══════════════════════════════════════════════
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textMuted }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{''}</div>
                <div style={{ fontSize: '14px' }}>Caricamento waitlist...</div>
            </div>
        );
    }

    // ══════════════════════════════════════════════
    // RENDER: Error
    // ══════════════════════════════════════════════
    if (error && entries.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{''}</div>
                <div style={{ fontSize: '14px', color: COLORS.danger, marginBottom: '12px' }}>{error}</div>
                <button
                    style={S.btn(COLORS.primary)}
                    onClick={loadData}
                >
                    Riprova
                </button>
            </div>
        );
    }


    // ══════════════════════════════════════════════
    // RENDER: Badge helpers
    // ══════════════════════════════════════════════
    const renderTipoBadge = (tipo) => {
        const c = TIPO_COLORS[tipo] || { bg: COLORS.borderLight, color: COLORS.textSecondary };
        return <span style={S.badge(c.bg, c.color)}>{tipo || '\u2014'}</span>;
    };

    const renderStatoBadge = (stato) => {
        const c = STATO_COLORS[stato] || { bg: COLORS.borderLight, color: COLORS.textSecondary };
        return <span style={S.badge(c.bg, c.color)}>{stato || '\u2014'}</span>;
    };


    // ══════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════
    return (
        <div style={S.container}>
            {/* ── Header ───────────────────────────── */}
            <div style={S.pageHeader}>
                <h2 style={S.pageTitle}>Gestione Waitlist</h2>
                <p style={S.pageSubtitle}>
                    Monitora e gestisci le iscrizioni alla waitlist dal database Notion
                </p>
            </div>

            {/* ── Summary Cards ────────────────────── */}
            <div style={S.cardsGrid}>
                {/* Totale */}
                <div style={S.card(COLORS.primary)}>
                    <div style={S.cardLabel}>Totale Iscritti</div>
                    <div style={S.cardValue(COLORS.primary)}>{stats.totale}</div>
                </div>
                {/* Premium */}
                <div style={S.card('var(--elab-hex-7c3aed)')}>
                    <div style={S.cardLabel}>Premium</div>
                    <div style={S.cardValue('var(--elab-hex-7c3aed)')}>{stats.byTipo.Premium || 0}</div>
                </div>
                {/* Eventi */}
                <div style={S.card(COLORS.warning)}>
                    <div style={S.cardLabel}>Eventi</div>
                    <div style={S.cardValue(COLORS.warning)}>{stats.byTipo.Eventi || 0}</div>
                </div>
                {/* Newsletter */}
                <div style={S.card(COLORS.info)}>
                    <div style={S.cardLabel}>Newsletter</div>
                    <div style={S.cardValue(COLORS.info)}>{stats.byTipo.Newsletter || 0}</div>
                </div>
                {/* In attesa */}
                <div style={S.card('var(--elab-hex-b45309)')}>
                    <div style={S.cardLabel}>In Attesa</div>
                    <div style={S.cardValue('var(--elab-hex-b45309)')}>{stats.inAttesa}</div>
                </div>
                {/* Convertiti */}
                <div style={S.card(COLORS.success)}>
                    <div style={S.cardLabel}>Convertiti</div>
                    <div style={S.cardValue(COLORS.success)}>{stats.convertiti}</div>
                </div>
            </div>

            {/* ── Toolbar ──────────────────────────── */}
            <div style={S.toolbar}>
                <input
                    style={S.searchInput}
                    placeholder="Cerca per email, nome, sorgente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    style={S.select}
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                >
                    <option value="">Tutti i tipi</option>
                    {TIPI.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                    style={S.select}
                    value={filterStato}
                    onChange={(e) => setFilterStato(e.target.value)}
                >
                    <option value="">Tutti gli stati</option>
                    {STATI.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                    style={S.btn(COLORS.primary)}
                    onClick={() => setShowAddModal(true)}
                >
                    + Aggiungi Email
                </button>
                <button
                    style={S.btn(COLORS.teal)}
                    onClick={exportCSV}
                    title="Esporta CSV"
                >
                    Esporta CSV
                </button>
                <button
                    style={S.btn(COLORS.textMuted, '#fff')}
                    onClick={() => { waitlistService.clearCache(); loadData(); }}
                    title="Ricarica dati"
                >
                    Ricarica
                </button>
            </div>

            {/* ── Bulk Actions Bar ─────────────────── */}
            {selected.size > 0 && (
                <div style={S.bulkBar}>
                    <span style={S.bulkText}>
                        {selected.size} selezionat{selected.size === 1 ? 'o' : 'i'}
                    </span>
                    <button
                        style={S.btnSmall(COLORS.primary)}
                        onClick={() => setBulkStatoModal(true)}
                    >
                        Cambia stato in blocco
                    </button>
                    <button
                        style={S.btnSmall(COLORS.textMuted, '#fff')}
                        onClick={() => setSelected(new Set())}
                    >
                        Deseleziona
                    </button>
                </div>
            )}

            {/* ── Table (desktop) / Cards (mobile) ── */}
            {filtered.length === 0 ? (
                <div style={S.empty}>
                    <div style={S.emptyIcon}>{''}</div>
                    <div style={{ fontSize: '14px' }}>Nessuna iscrizione trovata</div>
                    <div style={{ fontSize: '14px', marginTop: '4px', color: COLORS.textMuted }}>
                        {search || filterTipo || filterStato
                            ? 'Prova a modificare i filtri di ricerca'
                            : 'La waitlist e\' vuota'}
                    </div>
                </div>
            ) : isMobile ? (
                /* ── Mobile: Card Layout ───────── */
                <div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        marginBottom: '10px', padding: '8px 0',
                    }}>
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            style={S.checkbox}
                        />
                        <span style={{ fontSize: '14px', color: COLORS.textMuted }}>
                            Seleziona tutti ({filtered.length})
                        </span>
                    </div>
                    {filtered.map(entry => (
                        <div key={entry.id} style={S.mobileCard}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={selected.has(entry.id)}
                                    onChange={() => toggleSelect(entry.id)}
                                    style={{ ...S.checkbox, marginTop: '2px' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '700', fontSize: '14px', color: COLORS.textPrimary, marginBottom: '2px' }}>
                                        {entry.email || '\u2014'}
                                    </div>
                                    {entry.nome && (
                                        <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                                            {entry.nome}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                        {renderTipoBadge(entry.tipo)}
                                        {renderStatoBadge(entry.stato)}
                                    </div>
                                    <div style={S.mobileCardRow}>
                                        <span style={S.mobileCardLabel}>Data:</span>
                                        <span style={S.mobileCardValue}>{formatDate(entry.dataIscrizione)}</span>
                                    </div>
                                    {entry.sorgente && (
                                        <div style={S.mobileCardRow}>
                                            <span style={S.mobileCardLabel}>Sorgente:</span>
                                            <span style={S.mobileCardValue}>{entry.sorgente}</span>
                                        </div>
                                    )}
                                    {entry.note && (
                                        <div style={{
                                            fontSize: '14px', color: COLORS.textMuted, fontStyle: 'italic',
                                            marginTop: '4px', padding: '6px 8px', background: COLORS.bg,
                                            borderRadius: '6px',
                                        }}>
                                            {entry.note}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={S.mobileCardActions}>
                                <button
                                    style={S.btnSmall(COLORS.info)}
                                    onClick={() => setStatoModal({ id: entry.id, stato: entry.stato })}
                                >
                                    Stato
                                </button>
                                <button
                                    style={S.btnSmall(COLORS.teal)}
                                    onClick={() => setNoteModal({ id: entry.id, note: entry.note || '' })}
                                >
                                    Nota
                                </button>
                                <button
                                    style={S.btnSmall(COLORS.danger)}
                                    onClick={() => handleDelete(entry.id)}
                                >
                                    Elimina
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* ── Desktop: Table Layout ─────── */
                <div style={S.tableWrap}>
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={{ ...S.th, width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        style={S.checkbox}
                                    />
                                </th>
                                <th style={S.th}>Email</th>
                                <th style={S.th}>Nome</th>
                                <th style={S.th}>Tipo</th>
                                <th style={S.th}>Stato</th>
                                <th style={S.th}>Data Iscrizione</th>
                                <th style={S.th}>Sorgente</th>
                                <th style={{ ...S.th, textAlign: 'right' }}>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(entry => (
                                <tr
                                    key={entry.id}
                                    style={{
                                        ...S.trHover,
                                        background: selected.has(entry.id) ? COLORS.primaryBg : 'transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!selected.has(entry.id)) e.currentTarget.style.background = COLORS.bg;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = selected.has(entry.id) ? COLORS.primaryBg : 'transparent';
                                    }}
                                >
                                    <td style={S.td}>
                                        <input
                                            type="checkbox"
                                            checked={selected.has(entry.id)}
                                            onChange={() => toggleSelect(entry.id)}
                                            style={S.checkbox}
                                        />
                                    </td>
                                    <td style={{ ...S.td, fontWeight: '600' }}>
                                        {entry.email || '\u2014'}
                                    </td>
                                    <td style={S.td}>{entry.nome || '\u2014'}</td>
                                    <td style={S.td}>{renderTipoBadge(entry.tipo)}</td>
                                    <td style={S.td}>{renderStatoBadge(entry.stato)}</td>
                                    <td style={S.td}>{formatDate(entry.dataIscrizione)}</td>
                                    <td style={S.td}>{entry.sorgente || '\u2014'}</td>
                                    <td style={{ ...S.td, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                            <button
                                                style={S.btnSmall(COLORS.info)}
                                                onClick={() => setStatoModal({ id: entry.id, stato: entry.stato })}
                                                title="Cambia stato"
                                            >
                                                Stato
                                            </button>
                                            <button
                                                style={S.btnSmall(COLORS.teal)}
                                                onClick={() => setNoteModal({ id: entry.id, note: entry.note || '' })}
                                                title="Aggiungi / modifica nota"
                                            >
                                                Nota
                                            </button>
                                            <button
                                                style={S.btnSmall(COLORS.danger)}
                                                onClick={() => handleDelete(entry.id)}
                                                title="Elimina"
                                            >
                                                Elimina
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Result count ─────────────────────── */}
            {filtered.length > 0 && (
                <div style={{
                    marginTop: '10px', fontSize: '14px', color: COLORS.textMuted, textAlign: 'right',
                }}>
                    {filtered.length} risultat{filtered.length === 1 ? 'o' : 'i'}
                    {(search || filterTipo || filterStato) ? ` su ${entries.length} totali` : ''}
                </div>
            )}


            {/* ══════════════════════════════════════ */}
            {/* MODAL: Aggiungi Email                  */}
            {/* ══════════════════════════════════════ */}
            {showAddModal && (
                <AddModal
                    S={S}
                    formRef={addFormRef}
                    onSave={handleAdd}
                    onClose={() => setShowAddModal(false)}
                    loading={actionLoading}
                />
            )}

            {/* ══════════════════════════════════════ */}
            {/* MODAL: Cambia Stato                    */}
            {/* ══════════════════════════════════════ */}
            {statoModal && (
                <div style={S.modalOverlay} onClick={() => setStatoModal(null)}>
                    <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
                        <h3 style={S.modalTitle}>Cambia Stato</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {STATI.map(s => (
                                <button
                                    key={s}
                                    style={{
                                        padding: '12px 16px',
                                        background: statoModal.stato === s ? COLORS.primaryBg : COLORS.bg,
                                        border: `2px solid ${statoModal.stato === s ? COLORS.primary : COLORS.border}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: statoModal.stato === s ? '700' : '500',
                                        color: statoModal.stato === s ? COLORS.primary : COLORS.textPrimary,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                    }}
                                    disabled={actionLoading}
                                    onClick={() => handleChangeStato(statoModal.id, s)}
                                >
                                    {renderStatoBadge(s)}
                                    <span>{s}</span>
                                    {statoModal.stato === s && (
                                        <span style={{ marginLeft: 'auto', fontSize: '14px', color: COLORS.textMuted }}>
                                            (attuale)
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div style={S.modalActions}>
                            <button
                                style={S.btn(COLORS.textMuted, '#fff')}
                                onClick={() => setStatoModal(null)}
                            >
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════ */}
            {/* MODAL: Aggiungi Nota                   */}
            {/* ══════════════════════════════════════ */}
            {noteModal && (
                <NoteModal
                    S={S}
                    initial={noteModal.note}
                    onSave={(note) => handleSaveNote(noteModal.id, note)}
                    onClose={() => setNoteModal(null)}
                    loading={actionLoading}
                />
            )}

            {/* ══════════════════════════════════════ */}
            {/* MODAL: Bulk Stato                      */}
            {/* ══════════════════════════════════════ */}
            {bulkStatoModal && (
                <div style={S.modalOverlay} onClick={() => setBulkStatoModal(false)}>
                    <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
                        <h3 style={S.modalTitle}>
                            Cambia stato per {selected.size} element{selected.size === 1 ? 'o' : 'i'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {STATI.map(s => (
                                <button
                                    key={s}
                                    style={{
                                        padding: '12px 16px',
                                        background: COLORS.bg,
                                        border: `2px solid ${COLORS.border}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: COLORS.textPrimary,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                    }}
                                    disabled={actionLoading}
                                    onClick={() => handleBulkStato(s)}
                                >
                                    {renderStatoBadge(s)}
                                    <span>{s}</span>
                                </button>
                            ))}
                        </div>
                        <div style={S.modalActions}>
                            <button
                                style={S.btn(COLORS.textMuted, '#fff')}
                                onClick={() => setBulkStatoModal(false)}
                            >
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


// ══════════════════════════════════════════════════
// SUB-COMPONENTS (modali estranee per ridurre re-render)
// ══════════════════════════════════════════════════

function AddModal({ S, formRef, onSave, onClose, loading }) {
    const [form, setForm] = useState({ ...formRef.current });

    const update = (key, val) => {
        setForm(prev => {
            const next = { ...prev, [key]: val };
            formRef.current = next;
            return next;
        });
    };

    return (
        <div style={S.modalOverlay} onClick={onClose}>
            <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
                <h3 style={S.modalTitle}>Aggiungi Email alla Waitlist</h3>

                <div style={S.formGroup}>
                    <label style={S.formLabel}>Email *</label>
                    <input
                        style={S.formInput}
                        type="email"
                        placeholder="email@esempio.it"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                    />
                </div>

                <div style={S.formGroup}>
                    <label style={S.formLabel}>Nome</label>
                    <input
                        style={S.formInput}
                        type="text"
                        placeholder="Nome e cognome"
                        value={form.nome}
                        onChange={(e) => update('nome', e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ ...S.formGroup, flex: 1 }}>
                        <label style={S.formLabel}>Tipo</label>
                        <select
                            style={S.formSelect}
                            value={form.tipo}
                            onChange={(e) => update('tipo', e.target.value)}
                        >
                            {TIPI.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div style={{ ...S.formGroup, flex: 1 }}>
                        <label style={S.formLabel}>Stato</label>
                        <select
                            style={S.formSelect}
                            value={form.stato}
                            onChange={(e) => update('stato', e.target.value)}
                        >
                            {STATI.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div style={S.formGroup}>
                    <label style={S.formLabel}>Sorgente</label>
                    <input
                        style={S.formInput}
                        type="text"
                        placeholder="es. Landing page, Social, Manuale..."
                        value={form.sorgente}
                        onChange={(e) => update('sorgente', e.target.value)}
                    />
                </div>

                <div style={S.formGroup}>
                    <label style={S.formLabel}>Note</label>
                    <textarea
                        style={S.formTextarea}
                        placeholder="Note opzionali..."
                        value={form.note}
                        onChange={(e) => update('note', e.target.value)}
                    />
                </div>

                <div style={S.modalActions}>
                    <button
                        style={{
                            padding: '9px 20px',
                            background: 'transparent',
                            color: COLORS.textSecondary,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                        onClick={onClose}
                    >
                        Annulla
                    </button>
                    <button
                        style={{
                            padding: '9px 20px',
                            background: COLORS.primary,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: loading ? 'wait' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                        }}
                        disabled={loading}
                        onClick={onSave}
                    >
                        {loading ? 'Salvataggio...' : 'Aggiungi'}
                    </button>
                </div>
            </div>
        </div>
    );
}


function NoteModal({ S, initial, onSave, onClose, loading }) {
    const [note, setNote] = useState(initial || '');

    return (
        <div style={S.modalOverlay} onClick={onClose}>
            <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
                <h3 style={S.modalTitle}>Modifica Nota</h3>

                <div style={S.formGroup}>
                    <label style={S.formLabel}>Nota</label>
                    <textarea
                        style={S.formTextarea}
                        placeholder="Scrivi una nota..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        autoFocus
                    />
                </div>

                <div style={S.modalActions}>
                    <button
                        style={{
                            padding: '9px 20px',
                            background: 'transparent',
                            color: COLORS.textSecondary,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                        onClick={onClose}
                    >
                        Annulla
                    </button>
                    <button
                        style={{
                            padding: '9px 20px',
                            background: COLORS.teal,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: loading ? 'wait' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                        }}
                        disabled={loading}
                        onClick={() => onSave(note)}
                    >
                        {loading ? 'Salvataggio...' : 'Salva Nota'}
                    </button>
                </div>
            </div>
        </div>
    );
}
