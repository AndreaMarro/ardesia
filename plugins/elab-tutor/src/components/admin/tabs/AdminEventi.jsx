// ============================================
// ELAB Admin - Gestione Eventi Notion
// CRUD completo su database "Eventi" via backend webhook
// © Andrea Marro — 08/02/2026
// ============================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { eventiService } from '../../../services/notionService';
import logger from '../../../utils/logger';
import { showToast } from '../../common/Toast';

// ============================================
// CONSTANTS
// ============================================
const COLORS = {
    primary: 'var(--elab-navy)',
    success: 'var(--elab-lime)',
    warning: 'var(--elab-hex-f59e0b)',
    danger: 'var(--elab-hex-ef4444)',
    info: 'var(--elab-hex-06b6d4)',
    purple: 'var(--elab-hex-8b5cf6)',
    bg: 'var(--elab-hex-f8fafc)',
    card: 'var(--elab-hex-ffffff)',
    border: 'var(--elab-hex-e2e8f0)',
    textPrimary: 'var(--elab-hex-1e293b)',
    textSecondary: 'var(--elab-hex-64748b)',
    textMuted: 'var(--elab-hex-64748b)',
};

const STATI = ['Programmato', 'In corso', 'Completato', 'Annullato'];
const TIPI = ['Workshop', 'Webinar', 'Corso', 'Meetup', 'Hackathon'];

const STATO_COLORS = {
    'Programmato': COLORS.info,
    'In corso': COLORS.warning,
    'Completato': COLORS.success,
    'Annullato': COLORS.danger,
};

const TIPO_COLORS = {
    'Workshop': COLORS.primary,
    'Webinar': COLORS.purple,
    'Corso': COLORS.success,
    'Meetup': COLORS.warning,
    'Hackathon': COLORS.danger,
};

const EMPTY_EVENT = () => ({
    nomeEvento: '',
    descrizione: '',
    data: '',
    luogo: '',
    postiDisponibili: '',
    postiOccupati: 0,
    prezzo: '',
    stato: 'Programmato',
    tipo: 'Workshop',
    online: false,
    link: '',
});

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDateIT(dateStr) {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const HH = String(d.getHours()).padStart(2, '0');
        const MM = String(d.getMinutes()).padStart(2, '0');
        return `${dd}/${mm}/${yyyy} ${HH}:${MM}`;
    } catch {
        return dateStr;
    }
}

function parseEventDate(dateStr) {
    if (!dateStr) return null;
    try {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    } catch {
        return null;
    }
}

function extractProp(item, key, fallback = '') {
    if (!item) return fallback;
    // Direct property access
    if (item[key] !== undefined) return item[key];
    // Notion-style nested properties
    const props = item.properties || item;
    if (!props[key]) return fallback;
    const p = props[key];
    // title
    if (p.title) return p.title.map(t => t.plain_text || t.text?.content || '').join('') || fallback;
    // rich_text
    if (p.rich_text) return p.rich_text.map(t => t.plain_text || t.text?.content || '').join('') || fallback;
    // number
    if (p.number !== undefined) return p.number ?? fallback;
    // select
    if (p.select) return p.select.name || fallback;
    // date
    if (p.date) return p.date.start || fallback;
    // checkbox
    if (p.checkbox !== undefined) return p.checkbox;
    // url
    if (p.url !== undefined) return p.url || fallback;
    return fallback;
}

function normalizeEvent(raw) {
    return {
        id: raw.id || raw._id || '',
        nomeEvento: extractProp(raw, 'Nome Evento') || extractProp(raw, 'nomeEvento') || extractProp(raw, 'nome_evento') || '',
        descrizione: extractProp(raw, 'Descrizione') || extractProp(raw, 'descrizione') || '',
        data: extractProp(raw, 'Data') || extractProp(raw, 'data') || '',
        luogo: extractProp(raw, 'Luogo') || extractProp(raw, 'luogo') || '',
        postiDisponibili: Number(extractProp(raw, 'Posti Disponibili') || extractProp(raw, 'postiDisponibili') || 0),
        postiOccupati: Number(extractProp(raw, 'Posti Occupati') || extractProp(raw, 'postiOccupati') || 0),
        prezzo: Number(extractProp(raw, 'Prezzo €') || extractProp(raw, 'prezzo') || 0),
        stato: extractProp(raw, 'Stato') || extractProp(raw, 'stato') || 'Programmato',
        tipo: extractProp(raw, 'Tipo') || extractProp(raw, 'tipo') || 'Workshop',
        online: extractProp(raw, 'Online') || extractProp(raw, 'online') || false,
        link: extractProp(raw, 'Link') || extractProp(raw, 'link') || '',
        _raw: raw,
    };
}

function buildPayload(form) {
    return {
        'Nome Evento': form.nomeEvento,
        'Descrizione': form.descrizione,
        'Data': form.data || null,
        'Luogo': form.luogo,
        'Posti Disponibili': Number(form.postiDisponibili) || 0,
        'Posti Occupati': Number(form.postiOccupati) || 0,
        'Prezzo €': Number(form.prezzo) || 0,
        'Stato': form.stato,
        'Tipo': form.tipo,
        'Online': Boolean(form.online),
        'Link': form.link || '',
    };
}

// ============================================
// CSV EXPORT — © Andrea Marro — 20/02/2026
// ============================================
function exportEventiCSV(events) {
    const headers = ['#', 'Nome Evento', 'Data', 'Luogo', 'Tipo', 'Stato', 'Posti Disponibili', 'Posti Occupati', 'Prezzo', 'Online'];
    const rows = events.map((ev, i) => [
        i + 1,
        `"${String(ev.nomeEvento || '').replace(/"/g, '""')}"`,
        formatDateIT(ev.data),
        `"${String(ev.luogo || '').replace(/"/g, '""')}"`,
        ev.tipo || '',
        ev.stato || '',
        ev.postiDisponibili || 0,
        ev.postiOccupati || 0,
        ev.prezzo || 0,
        ev.online ? 'Sì' : 'No',
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eventi_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminEventi({ isMobile }) {
    // --- State ---
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStato, setFilterStato] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_EVENT());
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    // --- Data Loading ---
    const loadEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await eventiService.getAll();
            const items = result?.items || result?.data || result?.results || (Array.isArray(result) ? result : []);
            setEvents(items.map(normalizeEvent));
        } catch (err) {
            logger.error('Errore caricamento eventi:', err);
            setError(err.message || 'Errore nel caricamento degli eventi');
            setEvents([]);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadEvents(); }, [loadEvents]);

    // --- Filtering ---
    const filtered = useMemo(() => {
        return events.filter(ev => {
            if (filterStato && ev.stato !== filterStato) return false;
            if (filterTipo && ev.tipo !== filterTipo) return false;
            if (search) {
                const s = search.toLowerCase();
                return (
                    ev.nomeEvento.toLowerCase().includes(s) ||
                    ev.descrizione.toLowerCase().includes(s) ||
                    ev.luogo.toLowerCase().includes(s)
                );
            }
            return true;
        });
    }, [events, search, filterStato, filterTipo]);

    // --- Sorted: upcoming first, past at bottom ---
    const sorted = useMemo(() => {
        const now = new Date();
        return [...filtered].sort((a, b) => {
            const dA = parseEventDate(a.data);
            const dB = parseEventDate(b.data);
            const aFuture = dA ? dA >= now : false;
            const bFuture = dB ? dB >= now : false;
            if (aFuture && !bFuture) return -1;
            if (!aFuture && bFuture) return 1;
            if (dA && dB) return aFuture ? dA - dB : dB - dA;
            if (dA) return -1;
            if (dB) return 1;
            return 0;
        });
    }, [filtered]);

    // --- Calendar Summary Stats ---
    const summary = useMemo(() => {
        const now = new Date();
        const upcoming = events.filter(ev => {
            const d = parseEventDate(ev.data);
            return d && d >= now && ev.stato !== 'Annullato';
        });
        const totalPartecipanti = events.reduce((acc, ev) => acc + (ev.postiOccupati || 0), 0);
        const revenue = events
            .filter(ev => ev.stato !== 'Annullato')
            .reduce((acc, ev) => acc + ((ev.postiOccupati || 0) * (ev.prezzo || 0)), 0);
        const byStato = {};
        STATI.forEach(s => { byStato[s] = events.filter(ev => ev.stato === s).length; });
        const byTipo = {};
        TIPI.forEach(t => { byTipo[t] = events.filter(ev => ev.tipo === t).length; });
        return { upcoming: upcoming.length, totalPartecipanti, revenue, total: events.length, byStato, byTipo };
    }, [events]);

    // --- CRUD Handlers ---
    const handleOpenCreate = () => {
        setEditing(null);
        setForm(EMPTY_EVENT());
        setFormError('');
        setShowForm(true);
    };

    const handleOpenEdit = (ev) => {
        setEditing(ev.id);
        setForm({
            nomeEvento: ev.nomeEvento,
            descrizione: ev.descrizione,
            data: ev.data ? ev.data.slice(0, 16) : '',
            luogo: ev.luogo,
            postiDisponibili: ev.postiDisponibili || '',
            postiOccupati: ev.postiOccupati || 0,
            prezzo: ev.prezzo || '',
            stato: ev.stato || 'Programmato',
            tipo: ev.tipo || 'Workshop',
            online: ev.online || false,
            link: ev.link || '',
        });
        setFormError('');
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(EMPTY_EVENT());
        setFormError('');
    };

    const handleSave = async () => {
        if (!form.nomeEvento.trim()) { setFormError('Nome evento obbligatorio'); return; }
        if (!form.data) { setFormError('Data obbligatoria'); return; }
        setSaving(true);
        setFormError('');
        try {
            const payload = buildPayload(form);
            if (editing) {
                await eventiService.update(editing, payload);
            } else {
                await eventiService.create(payload);
            }
            handleCloseForm();
            await loadEvents();
        } catch (err) {
            logger.error('Errore salvataggio evento:', err);
            setFormError(err.message || 'Errore nel salvataggio');
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        try {
            await eventiService.delete(id);
            setDeleteConfirm(null);
            await loadEvents();
        } catch (err) {
            logger.error('Errore eliminazione evento:', err);
            showToast('Errore nell\'eliminazione: ' + (err.message || 'Errore sconosciuto'), 'error');
        }
    };

    const handleFormField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    // ========================================
    // STYLES
    // ========================================
    const S = {
        wrapper: {
            padding: isMobile ? '12px' : '24px',
            background: COLORS.bg,
            minHeight: '100%',
        },
        header: {
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '12px',
            marginBottom: '20px',
        },
        title: {
            fontSize: isMobile ? '20px' : '26px',
            fontWeight: '700',
            color: COLORS.primary,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        createBtn: {
            padding: isMobile ? '10px 16px' : '10px 20px',
            background: COLORS.primary,
            color: '#FFF',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'opacity .2s',
        },
        // Summary cards
        summaryGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile
                ? 'repeat(2, 1fr)'
                : 'repeat(4, 1fr)',
            gap: isMobile ? '10px' : '16px',
            marginBottom: '20px',
        },
        summaryCard: {
            background: COLORS.card,
            borderRadius: '14px',
            padding: isMobile ? '14px' : '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: `1px solid ${COLORS.border}`,
            textAlign: 'center',
        },
        summaryLabel: {
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '6px',
        },
        summaryValue: {
            fontSize: isMobile ? '22px' : '28px',
            fontWeight: '700',
            margin: 0,
        },
        summarySubtext: {
            fontSize: '14px',
            color: COLORS.textMuted,
            marginTop: '4px',
        },
        // Filters
        filtersRow: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '10px',
            marginBottom: '20px',
            alignItems: isMobile ? 'stretch' : 'center',
            flexWrap: 'wrap',
        },
        searchInput: {
            flex: isMobile ? 'auto' : '1 1 260px',
            maxWidth: isMobile ? 'none' : '320px',
            padding: '10px 14px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '10px',
            fontSize: '14px',
            outline: 'none',
            background: COLORS.card,
            color: COLORS.textPrimary,
            transition: 'border-color .2s',
        },
        selectFilter: {
            padding: '10px 14px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '10px',
            fontSize: '14px',
            background: COLORS.card,
            color: COLORS.textPrimary,
            cursor: 'pointer',
            outline: 'none',
            minWidth: '140px',
        },
        clearBtn: {
            padding: '8px 14px',
            background: 'transparent',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '10px',
            fontSize: '14px',
            color: COLORS.textSecondary,
            cursor: 'pointer',
        },
        // Tipo/Stato distribution
        distRow: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '20px',
        },
        distChip: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#FFF',
        },
        // Timeline / Event List
        timeline: {
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
        },
        timelineSeparator: {
            padding: '10px 0 4px',
            fontSize: '14px',
            fontWeight: '700',
            color: COLORS.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: `2px solid ${COLORS.border}`,
            marginTop: '8px',
        },
        eventCard: {
            background: COLORS.card,
            borderRadius: '14px',
            padding: isMobile ? '14px' : '18px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: `1px solid ${COLORS.border}`,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'box-shadow .2s, transform .15s',
        },
        eventCardHover: {
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        },
        eventTypeBadge: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '5px',
            height: '100%',
        },
        eventHeader: {
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '8px',
            marginLeft: '12px',
        },
        eventName: {
            fontSize: isMobile ? '15px' : '17px',
            fontWeight: '700',
            color: COLORS.textPrimary,
            margin: 0,
        },
        eventMeta: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: isMobile ? '8px' : '16px',
            marginTop: '10px',
            marginLeft: '12px',
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '14px',
            color: COLORS.textSecondary,
        },
        badge: {
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '700',
            color: '#FFF',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
        },
        badgeOutline: {
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            background: 'transparent',
        },
        eventActions: {
            display: 'flex',
            gap: '8px',
            marginTop: isMobile ? '10px' : '0',
        },
        actionBtn: {
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity .2s',
        },
        expandedSection: {
            marginTop: '14px',
            marginLeft: '12px',
            padding: '14px',
            background: COLORS.bg,
            borderRadius: '10px',
            border: `1px solid ${COLORS.border}`,
        },
        expandedLabel: {
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.textMuted,
            textTransform: 'uppercase',
            marginBottom: '4px',
        },
        expandedValue: {
            fontSize: '14px',
            color: COLORS.textPrimary,
            marginBottom: '12px',
            wordBreak: 'break-word',
        },
        // Progress bar for posti
        progressBar: {
            width: '100%',
            height: '6px',
            background: 'var(--elab-hex-e2e8f0)',
            borderRadius: '3px',
            overflow: 'hidden',
            marginTop: '4px',
        },
        progressFill: {
            height: '100%',
            borderRadius: '3px',
            transition: 'width .3s',
        },
        // Form / Modal overlay
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
        },
        modal: {
            background: COLORS.card,
            borderRadius: '18px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '640px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        },
        modalHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '16px' : '20px 24px',
            borderBottom: `1px solid ${COLORS.border}`,
        },
        modalTitle: {
            fontSize: isMobile ? '17px' : '20px',
            fontWeight: '700',
            color: COLORS.primary,
            margin: 0,
        },
        modalBody: {
            padding: isMobile ? '16px' : '20px 24px',
        },
        modalFooter: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: isMobile ? '16px' : '16px 24px',
            borderTop: `1px solid ${COLORS.border}`,
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '14px',
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
        },
        formLabel: {
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
        },
        formInput: {
            padding: '10px 12px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            background: COLORS.bg,
            color: COLORS.textPrimary,
            transition: 'border-color .2s',
        },
        formSelect: {
            padding: '10px 12px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            background: COLORS.bg,
            color: COLORS.textPrimary,
            cursor: 'pointer',
        },
        formTextarea: {
            padding: '10px 12px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            background: COLORS.bg,
            color: COLORS.textPrimary,
            resize: 'vertical',
            minHeight: '80px',
            fontFamily: 'inherit',
        },
        checkboxRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 0',
        },
        checkbox: {
            width: '18px',
            height: '18px',
            cursor: 'pointer',
            accentColor: COLORS.primary,
        },
        formError: {
            padding: '10px 14px',
            background: 'var(--elab-hex-fef2f2)',
            border: `1px solid ${COLORS.danger}`,
            borderRadius: '8px',
            color: COLORS.danger,
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '14px',
        },
        // Delete confirm
        deleteOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
        },
        deleteModal: {
            background: COLORS.card,
            borderRadius: '16px',
            padding: isMobile ? '20px' : '28px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        },
        // Loading / Error / Empty
        loadingBox: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            gap: '16px',
        },
        spinner: {
            width: '40px',
            height: '40px',
            border: `3px solid ${COLORS.border}`,
            borderTop: `3px solid ${COLORS.primary}`,
            borderRadius: '50%',
            animation: 'adminEventiSpin 0.8s linear infinite',
        },
        errorBox: {
            padding: '20px',
            background: 'var(--elab-hex-fef2f2)',
            border: `1px solid ${COLORS.danger}`,
            borderRadius: '12px',
            textAlign: 'center',
        },
        emptyBox: {
            padding: '60px 20px',
            textAlign: 'center',
            color: COLORS.textMuted,
        },
    };

    // ========================================
    // RENDER HELPERS
    // ========================================

    // Summary cards
    const renderSummary = () => (
        <div style={S.summaryGrid}>
            <div style={S.summaryCard}>
                <div style={S.summaryLabel}>Prossimi Eventi</div>
                <p style={{ ...S.summaryValue, color: COLORS.primary }}>{summary.upcoming}</p>
                <div style={S.summarySubtext}>programmati / in corso</div>
            </div>
            <div style={S.summaryCard}>
                <div style={S.summaryLabel}>Totale Eventi</div>
                <p style={{ ...S.summaryValue, color: COLORS.info }}>{summary.total}</p>
                <div style={S.summarySubtext}>nel database</div>
            </div>
            <div style={S.summaryCard}>
                <div style={S.summaryLabel}>Partecipanti</div>
                <p style={{ ...S.summaryValue, color: COLORS.success }}>{summary.totalPartecipanti}</p>
                <div style={S.summarySubtext}>posti occupati totali</div>
            </div>
            <div style={S.summaryCard}>
                <div style={S.summaryLabel}>Revenue Stimata</div>
                <p style={{ ...S.summaryValue, color: COLORS.warning }}>
                    {summary.revenue.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                </p>
                <div style={S.summarySubtext}>partecipanti x prezzo</div>
            </div>
        </div>
    );

    // Tipo/Stato distribution chips
    const renderDistribution = () => (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>
                    Per tipo
                </div>
                <div style={S.distRow}>
                    {TIPI.map(t => (
                        <span
                            key={t}
                            style={{ ...S.distChip, background: TIPO_COLORS[t] || COLORS.primary }}
                        >
                            {t} ({summary.byTipo[t] || 0})
                        </span>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>
                    Per stato
                </div>
                <div style={S.distRow}>
                    {STATI.map(s => (
                        <span
                            key={s}
                            style={{ ...S.distChip, background: STATO_COLORS[s] || COLORS.info }}
                        >
                            {s} ({summary.byStato[s] || 0})
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

    // Filters row
    const renderFilters = () => (
        <div style={S.filtersRow}>
            <input
                type="text"
                placeholder="Cerca evento, luogo, descrizione..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={S.searchInput}
            />
            <select
                value={filterStato}
                onChange={e => setFilterStato(e.target.value)}
                style={S.selectFilter}
            >
                <option value="">Tutti gli stati</option>
                {STATI.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
                value={filterTipo}
                onChange={e => setFilterTipo(e.target.value)}
                style={S.selectFilter}
            >
                <option value="">Tutti i tipi</option>
                {TIPI.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {(search || filterStato || filterTipo) && (
                <button
                    onClick={() => { setSearch(''); setFilterStato(''); setFilterTipo(''); }}
                    style={S.clearBtn}
                >
                    Pulisci filtri
                </button>
            )}
            <div style={{ fontSize: '14px', color: COLORS.textMuted, marginLeft: isMobile ? '0' : 'auto' }}>
                {filtered.length} evento{filtered.length !== 1 ? 'i' : ''} trovato{filtered.length !== 1 ? 'i' : ''}
            </div>
        </div>
    );

    // Single event card
    const renderEventCard = (ev) => {
        const isExpanded = expandedId === ev.id;
        const evDate = parseEventDate(ev.data);
        const isPast = evDate ? evDate < new Date() : false;
        const postiPercent = ev.postiDisponibili > 0
            ? Math.min(100, Math.round((ev.postiOccupati / ev.postiDisponibili) * 100))
            : 0;
        const postiColor = postiPercent >= 90 ? COLORS.danger : postiPercent >= 60 ? COLORS.warning : COLORS.success;

        return (
            <div
                key={ev.id}
                style={{
                    ...S.eventCard,
                    opacity: isPast && ev.stato === 'Annullato' ? 0.6 : 1,
                }}
                onClick={() => setExpandedId(isExpanded ? null : ev.id)}
            >
                {/* Tipo color bar */}
                <div style={{ ...S.eventTypeBadge, background: TIPO_COLORS[ev.tipo] || COLORS.primary }} />

                {/* Header */}
                <div style={S.eventHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h3 style={S.eventName}>{ev.nomeEvento || 'Evento senza nome'}</h3>
                        <span style={{ ...S.badge, background: STATO_COLORS[ev.stato] || COLORS.info }}>
                            {ev.stato}
                        </span>
                        <span style={{
                            ...S.badgeOutline,
                            color: TIPO_COLORS[ev.tipo] || COLORS.primary,
                            border: `1.5px solid ${TIPO_COLORS[ev.tipo] || COLORS.primary}`,
                        }}>
                            {ev.tipo}
                        </span>
                        {ev.online && (
                            <span style={{ ...S.badge, background: COLORS.purple, fontSize: '14px' }}>
                                ONLINE
                            </span>
                        )}
                    </div>
                    <div style={S.eventActions} onClick={e => e.stopPropagation()}>
                        <button
                            style={{ ...S.actionBtn, background: 'var(--elab-hex-eff6ff)', color: COLORS.primary }}
                            onClick={() => handleOpenEdit(ev)}
                        >
                            Modifica
                        </button>
                        <button
                            style={{ ...S.actionBtn, background: 'var(--elab-hex-fef2f2)', color: COLORS.danger }}
                            onClick={() => setDeleteConfirm(ev)}
                        >
                            Elimina
                        </button>
                    </div>
                </div>

                {/* Meta row */}
                <div style={S.eventMeta}>
                    <span style={S.metaItem}>
                        <span style={{ fontWeight: '700' }}>Data:</span> {formatDateIT(ev.data)}
                    </span>
                    {ev.luogo && (
                        <span style={S.metaItem}>
                            <span style={{ fontWeight: '700' }}>Luogo:</span> {ev.luogo}
                        </span>
                    )}
                    <span style={S.metaItem}>
                        <span style={{ fontWeight: '700' }}>Posti:</span> {ev.postiOccupati}/{ev.postiDisponibili || '~'}
                    </span>
                    {ev.prezzo > 0 && (
                        <span style={S.metaItem}>
                            <span style={{ fontWeight: '700' }}>Prezzo:</span>{' '}
                            {ev.prezzo.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                        </span>
                    )}
                    {ev.prezzo === 0 && (
                        <span style={{ ...S.metaItem, color: COLORS.success, fontWeight: '600' }}>
                            GRATUITO
                        </span>
                    )}
                </div>

                {/* Posti progress bar */}
                {ev.postiDisponibili > 0 && (
                    <div style={{ marginLeft: '12px', marginTop: '10px', maxWidth: '300px' }}>
                        <div style={S.progressBar}>
                            <div style={{ ...S.progressFill, width: `${postiPercent}%`, background: postiColor }} />
                        </div>
                        <div style={{ fontSize: '14px', color: COLORS.textMuted, marginTop: '2px' }}>
                            {postiPercent}% occupato
                        </div>
                    </div>
                )}

                {/* Expanded details */}
                {isExpanded && (
                    <div style={S.expandedSection}>
                        {ev.descrizione && (
                            <>
                                <div style={S.expandedLabel}>Descrizione</div>
                                <div style={S.expandedValue}>{ev.descrizione}</div>
                            </>
                        )}
                        {ev.link && (
                            <>
                                <div style={S.expandedLabel}>Link</div>
                                <div style={S.expandedValue}>
                                    <a
                                        href={ev.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: COLORS.primary, textDecoration: 'underline' }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {ev.link}
                                    </a>
                                </div>
                            </>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                            <div>
                                <div style={S.expandedLabel}>Online</div>
                                <div style={S.expandedValue}>{ev.online ? 'Si' : 'No'}</div>
                            </div>
                            <div>
                                <div style={S.expandedLabel}>Revenue stimata</div>
                                <div style={S.expandedValue}>
                                    {((ev.postiOccupati || 0) * (ev.prezzo || 0)).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Event list with timeline separators
    const renderEventList = () => {
        if (sorted.length === 0) {
            return (
                <div style={S.emptyBox}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}></div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textSecondary }}>
                        Nessun evento trovato
                    </div>
                    <div style={{ fontSize: '14px', marginTop: '6px' }}>
                        {events.length > 0 ? 'Prova a modificare i filtri di ricerca' : 'Crea il tuo primo evento'}
                    </div>
                </div>
            );
        }

        const now = new Date();
        const upcoming = sorted.filter(ev => {
            const d = parseEventDate(ev.data);
            return d ? d >= now : true;
        });
        const past = sorted.filter(ev => {
            const d = parseEventDate(ev.data);
            return d ? d < now : false;
        });

        return (
            <div style={S.timeline}>
                {upcoming.length > 0 && (
                    <>
                        <div style={S.timelineSeparator}>
                            Prossimi / In corso ({upcoming.length})
                        </div>
                        {upcoming.map(renderEventCard)}
                    </>
                )}
                {past.length > 0 && (
                    <>
                        <div style={{ ...S.timelineSeparator, color: COLORS.textMuted }}>
                            Passati ({past.length})
                        </div>
                        {past.map(renderEventCard)}
                    </>
                )}
            </div>
        );
    };

    // Form modal
    const renderForm = () => {
        if (!showForm) return null;
        return (
            <div style={S.overlay} onClick={handleCloseForm}>
                <div style={S.modal} onClick={e => e.stopPropagation()}>
                    <div style={S.modalHeader}>
                        <h2 style={S.modalTitle}>
                            {editing ? 'Modifica Evento' : 'Nuovo Evento'}
                        </h2>
                        <button
                            onClick={handleCloseForm}
                            style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: COLORS.textSecondary, padding: '4px' }}
                        >
                            
                        </button>
                    </div>
                    <div style={S.modalBody}>
                        {formError && <div style={S.formError}>{formError}</div>}

                        <div style={S.formGrid}>
                            {/* Nome Evento - full width */}
                            <div style={{ ...S.formGroup, gridColumn: isMobile ? 'auto' : '1 / -1' }}>
                                <label style={S.formLabel}>Nome Evento *</label>
                                <input
                                    type="text"
                                    value={form.nomeEvento}
                                    onChange={e => handleFormField('nomeEvento', e.target.value)}
                                    style={S.formInput}
                                    placeholder="Es. Workshop React Avanzato"
                                />
                            </div>

                            {/* Data */}
                            <div style={S.formGroup}>
                                <label style={S.formLabel}>Data e Ora *</label>
                                <input
                                    type="datetime-local"
                                    value={form.data}
                                    onChange={e => handleFormField('data', e.target.value)}
                                    style={S.formInput}
                                />
                            </div>

                            {/* Luogo */}
                            <div style={S.formGroup}>
                                <label style={S.formLabel}>Luogo</label>
                                <input
                                    type="text"
                                    value={form.luogo}
                                    onChange={e => handleFormField('luogo', e.target.value)}
                                    style={S.formInput}
                                    placeholder="Es. Aula Magna, Milano"
                                />
                            </div>

                            {/* Tipo */}
                            <div style={S.formGroup}>
                                <label style={S.formLabel}>Tipo</label>
                                <select
                                    value={form.tipo}
                                    onChange={e => handleFormField('tipo', e.target.value)}
                                    style={S.formSelect}
                                >
                                    {TIPI.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Stato */}
                            <div style={S.formGroup}>
                                <label style={S.formLabel}>Stato</label>
                                <select
                                    value={form.stato}
                                    onChange={e => handleFormField('stato', e.target.value)}
                                    style={S.formSelect}
                                >
                                    {STATI.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Posti Disponibili */}
                            <div style={S.formGroup}>
                                <label style={S.formLabel}>Posti Disponibili</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.postiDisponibili}
                                    onChange={e => handleFormField('postiDisponibili', e.target.value)}
                                    style={S.formInput}
                                    placeholder="Es. 30"
                                />
                            </div>

                            {/* Posti Occupati */}
                            <div style={S.formGroup}>
                                <label style={S.formLabel}>Posti Occupati</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.postiOccupati}
                                    onChange={e => handleFormField('postiOccupati', e.target.value)}
                                    style={S.formInput}
                                    placeholder="0"
                                />
                            </div>

                            {/* Prezzo */}
                            <div style={S.formGroup}>
                                <label style={S.formLabel}>Prezzo (EUR)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.prezzo}
                                    onChange={e => handleFormField('prezzo', e.target.value)}
                                    style={S.formInput}
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Link */}
                            <div style={S.formGroup}>
                                <label style={S.formLabel}>Link</label>
                                <input
                                    type="url"
                                    value={form.link}
                                    onChange={e => handleFormField('link', e.target.value)}
                                    style={S.formInput}
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Online checkbox */}
                            <div style={{ ...S.formGroup, justifyContent: 'center' }}>
                                <div style={S.checkboxRow}>
                                    <input
                                        type="checkbox"
                                        checked={form.online}
                                        onChange={e => handleFormField('online', e.target.checked)}
                                        style={S.checkbox}
                                        id="evOnline"
                                    />
                                    <label htmlFor="evOnline" style={{ fontSize: '14px', color: COLORS.textPrimary, cursor: 'pointer' }}>
                                        Evento Online
                                    </label>
                                </div>
                            </div>

                            {/* Descrizione - full width */}
                            <div style={{ ...S.formGroup, gridColumn: isMobile ? 'auto' : '1 / -1' }}>
                                <label style={S.formLabel}>Descrizione</label>
                                <textarea
                                    value={form.descrizione}
                                    onChange={e => handleFormField('descrizione', e.target.value)}
                                    style={S.formTextarea}
                                    placeholder="Descrizione dell'evento..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                    <div style={S.modalFooter}>
                        <button
                            onClick={handleCloseForm}
                            style={{ ...S.actionBtn, background: COLORS.bg, color: COLORS.textSecondary, border: `1px solid ${COLORS.border}`, padding: '10px 20px' }}
                        >
                            Annulla
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                ...S.actionBtn,
                                background: saving ? COLORS.textMuted : COLORS.primary,
                                color: '#FFF',
                                padding: '10px 24px',
                                fontSize: '14px',
                                cursor: saving ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {saving ? 'Salvataggio...' : editing ? 'Salva Modifiche' : 'Crea Evento'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Delete confirmation modal
    const renderDeleteConfirm = () => {
        if (!deleteConfirm) return null;
        return (
            <div style={S.deleteOverlay} onClick={() => setDeleteConfirm(null)}>
                <div style={S.deleteModal} onClick={e => e.stopPropagation()}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}></div>
                    <h3 style={{ margin: '0 0 8px', color: COLORS.textPrimary, fontSize: '18px' }}>
                        Conferma Eliminazione
                    </h3>
                    <p style={{ color: COLORS.textSecondary, fontSize: '14px', margin: '0 0 20px', lineHeight: '1.5' }}>
                        Stai per eliminare l'evento <strong style={{ color: COLORS.danger }}>"{deleteConfirm.nomeEvento}"</strong>.
                        Questa azione non può essere annullata.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                                ...S.actionBtn,
                                background: COLORS.bg,
                                color: COLORS.textSecondary,
                                border: `1px solid ${COLORS.border}`,
                                padding: '10px 24px',
                                fontSize: '14px',
                            }}
                        >
                            Annulla
                        </button>
                        <button
                            onClick={() => handleDelete(deleteConfirm.id)}
                            style={{
                                ...S.actionBtn,
                                background: COLORS.danger,
                                color: '#FFF',
                                padding: '10px 24px',
                                fontSize: '14px',
                            }}
                        >
                            Elimina
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ========================================
    // MAIN RENDER
    // ========================================

    // Inject keyframes for spinner
    useEffect(() => {
        const styleId = 'adminEventiKeyframes';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `@keyframes adminEventiSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }
        return () => {
            const el = document.getElementById(styleId);
            if (el) el.remove();
        };
    }, []);

    if (loading) {
        return (
            <div style={S.wrapper}>
                <div style={S.loadingBox}>
                    <div style={S.spinner} />
                    <div style={{ fontSize: '15px', color: COLORS.textSecondary, fontWeight: '500' }}>
                        Caricamento eventi...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={S.wrapper}>
                <div style={S.errorBox}>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}></div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.danger, marginBottom: '8px' }}>
                        Errore nel caricamento
                    </div>
                    <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '16px' }}>
                        {error}
                    </div>
                    <button
                        onClick={loadEvents}
                        style={{
                            ...S.createBtn,
                            background: COLORS.danger,
                            display: 'inline-flex',
                        }}
                    >
                        Riprova
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={S.wrapper}>
            {/* Header */}
            <div style={S.header}>
                <h1 style={S.title}>
                    Gestione Eventi
                </h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={() => exportEventiCSV(filtered)}
                        style={{
                            ...S.createBtn,
                            background: 'var(--elab-hex-ffffff)',
                            color: 'var(--elab-navy)',
                            border: '1px solid var(--elab-hex-e2e8f0)',
                        }}
                        title="Esporta CSV"
                    >
                         CSV
                    </button>
                    <button onClick={handleOpenCreate} style={S.createBtn}>
                        + Nuovo Evento
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            {renderSummary()}

            {/* Distribution chips */}
            {renderDistribution()}

            {/* Filters */}
            {renderFilters()}

            {/* Event list / timeline */}
            {renderEventList()}

            {/* Form modal */}
            {renderForm()}

            {/* Delete confirm modal */}
            {renderDeleteConfirm()}
        </div>
    );
}
