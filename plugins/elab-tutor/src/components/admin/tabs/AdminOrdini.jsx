// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB - Admin Ordini Tab
// Gestione ordini Notion
// React 19 - Inline styles only
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ordiniService } from '../../../services/notionService';

// ============================================
// COSTANTI
// ============================================
const COLORS = {
    primary: 'var(--elab-navy)',
    primaryLight: '#2a4fa3', // palette
    primaryBg: '#eef2fa', // palette
    success: 'var(--elab-lime)',
    successBg: '#f0f7e4', // palette
    warning: '#f59e0b', // palette
    warningBg: '#fef9ee', // palette
    danger: '#ef4444', // palette
    dangerBg: '#fef2f2', // palette
    info: '#06b6d4', // palette
    infoBg: '#ecfeff', // palette
    white: '#ffffff', // palette
    gray50: '#f9fafb', // palette
    gray100: '#f3f4f6', // palette
    gray200: '#e5e7eb', // palette
    gray300: '#d1d5db', // palette
    gray400: '#9ca3af', // palette
    gray500: '#6b7280', // palette
    gray600: '#4b5563', // palette
    gray700: '#374151', // palette
    gray800: '#1f2937', // palette
    gray900: '#111827', // palette
};

const STATI = ['Completato', 'In attesa', 'Annullato', 'Rimborsato'];
const TIPI = ['Evento', 'Corso', 'Kit', 'Abbonamento'];
const METODI_PAGAMENTO = ['Carta', 'Bonifico', 'PayPal'];
const PAGE_SIZE = 20;

const STATO_COLORS = {
    Completato: { bg: COLORS.successBg, text: COLORS.success, border: COLORS.success },
    'In attesa': { bg: COLORS.warningBg, text: COLORS.warning, border: COLORS.warning },
    Annullato: { bg: COLORS.gray100, text: COLORS.gray500, border: COLORS.gray400 },
    Rimborsato: { bg: COLORS.dangerBg, text: COLORS.danger, border: COLORS.danger },
};

const TIPO_COLORS = {
    Evento: { bg: COLORS.infoBg, text: COLORS.info },
    Corso: { bg: COLORS.primaryBg, text: COLORS.primary },
    Kit: { bg: COLORS.warningBg, text: COLORS.warning },
    Abbonamento: { bg: COLORS.successBg, text: COLORS.success },
};

const EMPTY_FORM = {
    nomeCliente: '',
    email: '',
    importo: '',
    tipo: 'Evento',
    stato: 'In attesa',
    dataOrdine: new Date().toISOString().split('T')[0],
    transactionId: '',
    metodoPagamento: 'Carta',
    note: '',
};

// ============================================
// HELPER
// ============================================
function formatCurrency(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return '0,00 \u20ac';
    return num.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function extractProp(item, propName, type = 'text') {
    const props = item.properties || item;
    const prop = props[propName];
    if (!prop) return '';

    switch (type) {
        case 'title':
            if (prop.title) return prop.title.map(t => t.plain_text || t.text?.content || '').join('');
            return prop.plain_text || prop.value || prop || '';
        case 'email':
        case 'text':
            if (prop.rich_text) return prop.rich_text.map(t => t.plain_text || t.text?.content || '').join('');
            if (prop.email) return prop.email;
            return prop.plain_text || prop.value || prop || '';
        case 'number':
            if (prop.number !== undefined) return prop.number;
            return parseFloat(prop.value || prop) || 0;
        case 'select':
            if (prop.select) return prop.select.name || '';
            return prop.value || prop.name || prop || '';
        case 'date':
            if (prop.date) return prop.date.start || '';
            return prop.value || prop || '';
        default:
            return prop.value || prop.plain_text || prop || '';
    }
}

function normalizeOrder(item) {
    return {
        id: item.id || item._id || '',
        nomeCliente: extractProp(item, 'Nome Cliente', 'title'),
        email: extractProp(item, 'Email', 'email'),
        importo: extractProp(item, 'Importo \u20ac', 'number'),
        tipo: extractProp(item, 'Tipo', 'select'),
        stato: extractProp(item, 'Stato', 'select'),
        dataOrdine: extractProp(item, 'Data Ordine', 'date'),
        transactionId: extractProp(item, 'Transaction ID', 'text'),
        metodoPagamento: extractProp(item, 'Metodo Pagamento', 'select'),
        note: extractProp(item, 'Note', 'text'),
        _raw: item,
    };
}

function buildPayload(form) {
    return {
        'Nome Cliente': form.nomeCliente,
        'Email': form.email,
        'Importo \u20ac': parseFloat(form.importo) || 0,
        'Tipo': form.tipo,
        'Stato': form.stato,
        'Data Ordine': form.dataOrdine,
        'Transaction ID': form.transactionId,
        'Metodo Pagamento': form.metodoPagamento,
        'Note': form.note,
    };
}

function exportCSV(orders) {
    const headers = ['#', 'Cliente', 'Email', 'Importo', 'Tipo', 'Stato', 'Data Ordine', 'Transaction ID', 'Metodo Pagamento', 'Note'];
    const rows = orders.map((o, i) => [
        i + 1,
        `"${(o.nomeCliente || '').replace(/"/g, '""')}"`,
        `"${(o.email || '').replace(/"/g, '""')}"`,
        o.importo,
        o.tipo,
        o.stato,
        o.dataOrdine,
        `"${(o.transactionId || '').replace(/"/g, '""')}"`,
        o.metodoPagamento,
        `"${(o.note || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordini_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// COMPONENT
// ============================================
export default function AdminOrdini({ isMobile }) {
    // --- State ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStato, setFilterStato] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({ ...EMPTY_FORM });
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [actionMsg, setActionMsg] = useState(null);

    // --- Load orders ---
    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await ordiniService.getAll({}, { useCache: false, pageSize: 500 });
            const items = result.items || result.data || result.results || (Array.isArray(result) ? result : []);
            setOrders(items.map(normalizeOrder));
        } catch (err) {
            setError(err.message || 'Errore nel caricamento degli ordini');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // --- Flash messages ---
    const flash = useCallback((msg, type = 'success') => {
        setActionMsg({ msg, type });
        setTimeout(() => setActionMsg(null), 3500);
    }, []);

    // --- Filtered + searched orders ---
    const filteredOrders = useMemo(() => {
        let result = [...orders];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(o =>
                (o.nomeCliente || '').toLowerCase().includes(q) ||
                (o.email || '').toLowerCase().includes(q) ||
                (o.transactionId || '').toLowerCase().includes(q)
            );
        }
        if (filterStato) result = result.filter(o => o.stato === filterStato);
        if (filterTipo) result = result.filter(o => o.tipo === filterTipo);
        return result;
    }, [orders, searchQuery, filterStato, filterTipo]);

    // --- Summary stats ---
    const stats = useMemo(() => {
        const totale = orders.length;
        const importoTotale = orders.reduce((sum, o) => sum + (parseFloat(o.importo) || 0), 0);
        const completati = orders.filter(o => o.stato === 'Completato').length;
        const inAttesa = orders.filter(o => o.stato === 'In attesa').length;
        return { totale, importoTotale, completati, inAttesa };
    }, [orders]);

    // --- Pagination ---
    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredOrders.slice(start, start + PAGE_SIZE);
    }, [filteredOrders, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStato, filterTipo]);

    // --- Create order ---
    const handleCreate = async () => {
        if (!createForm.nomeCliente.trim() || !createForm.email.trim()) {
            flash('Nome Cliente e Email sono obbligatori', 'danger');
            return;
        }
        setCreating(true);
        try {
            await ordiniService.create(buildPayload(createForm));
            setCreateForm({ ...EMPTY_FORM });
            setShowCreateForm(false);
            flash('Ordine creato con successo');
            await loadOrders();
        } catch (err) {
            flash(err.message || 'Errore nella creazione', 'danger');
        } finally {
            setCreating(false);
        }
    };

    // --- Edit order ---
    const startEdit = (order) => {
        setEditingId(order.id);
        setEditForm({
            nomeCliente: order.nomeCliente || '',
            email: order.email || '',
            importo: order.importo || '',
            tipo: order.tipo || 'Evento',
            stato: order.stato || 'In attesa',
            dataOrdine: order.dataOrdine || '',
            transactionId: order.transactionId || '',
            metodoPagamento: order.metodoPagamento || 'Carta',
            note: order.note || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ ...EMPTY_FORM });
    };

    const handleSave = async (id) => {
        if (!editForm.nomeCliente.trim() || !editForm.email.trim()) {
            flash('Nome Cliente e Email sono obbligatori', 'danger');
            return;
        }
        setSaving(true);
        try {
            await ordiniService.update(id, buildPayload(editForm));
            setEditingId(null);
            flash('Ordine aggiornato');
            await loadOrders();
        } catch (err) {
            flash(err.message || 'Errore nel salvataggio', 'danger');
        } finally {
            setSaving(false);
        }
    };

    // --- Delete order ---
    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await ordiniService.delete(id);
            setConfirmDeleteId(null);
            flash('Ordine eliminato');
            await loadOrders();
        } catch (err) {
            flash(err.message || 'Errore nella cancellazione', 'danger');
        } finally {
            setDeletingId(null);
        }
    };

    // ============================================
    // STYLES
    // ============================================
    const s = {
        container: {
            padding: isMobile ? '12px' : '24px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: COLORS.gray800,
            maxWidth: '100%',
            overflowX: 'hidden',
        },
        header: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '12px',
            marginBottom: '20px',
        },
        title: {
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: 700,
            color: COLORS.primary,
            margin: 0,
        },
        headerActions: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
        },
        // Summary cards
        summaryRow: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '8px' : '16px',
            marginBottom: '20px',
        },
        summaryCard: (color, bgColor) => ({
            background: COLORS.white,
            borderRadius: '10px',
            padding: isMobile ? '12px' : '16px',
            borderLeft: `4px solid ${color}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }),
        summaryLabel: {
            fontSize: '14px',
            fontWeight: 600,
            color: COLORS.gray500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px',
        },
        summaryValue: (color) => ({
            fontSize: isMobile ? '20px' : '26px',
            fontWeight: 700,
            color: color,
            margin: 0,
        }),
        // Filters
        filtersRow: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '10px',
            marginBottom: '16px',
            alignItems: isMobile ? 'stretch' : 'center',
        },
        searchInput: {
            flex: isMobile ? undefined : 1,
            padding: '9px 14px',
            borderRadius: '8px',
            border: `1px solid ${COLORS.gray300}`,
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s',
            minWidth: 0,
        },
        select: {
            padding: '9px 14px',
            borderRadius: '8px',
            border: `1px solid ${COLORS.gray300}`,
            fontSize: '14px',
            outline: 'none',
            background: COLORS.white,
            cursor: 'pointer',
            minWidth: isMobile ? undefined : '150px',
        },
        // Buttons
        btnPrimary: {
            padding: '9px 18px',
            background: COLORS.primary,
            color: COLORS.white,
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'background 0.2s',
        },
        btnSuccess: {
            padding: '6px 14px',
            background: COLORS.success,
            color: COLORS.white,
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
        },
        btnDanger: {
            padding: '6px 14px',
            background: COLORS.danger,
            color: COLORS.white,
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
        },
        btnOutline: {
            padding: '6px 14px',
            background: 'transparent',
            color: COLORS.gray600,
            border: `1px solid ${COLORS.gray300}`,
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
        },
        btnInfo: {
            padding: '9px 18px',
            background: COLORS.info,
            color: COLORS.white,
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
        },
        // Create form
        formPanel: {
            background: COLORS.white,
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: `1px solid ${COLORS.gray200}`,
            animation: 'slideDown 0.25s ease-out',
        },
        formTitle: {
            fontSize: '16px',
            fontWeight: 700,
            color: COLORS.primary,
            marginBottom: '16px',
            margin: 0,
            paddingBottom: '12px',
            borderBottom: `1px solid ${COLORS.gray200}`,
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '12px',
            marginTop: '14px',
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
        },
        formLabel: {
            fontSize: '14px',
            fontWeight: 600,
            color: COLORS.gray600,
        },
        formInput: {
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.gray300}`,
            fontSize: '14px',
            outline: 'none',
        },
        formSelect: {
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.gray300}`,
            fontSize: '14px',
            outline: 'none',
            background: COLORS.white,
        },
        formActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: `1px solid ${COLORS.gray200}`,
        },
        // Table
        tableWrapper: {
            background: COLORS.white,
            borderRadius: '12px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: `1px solid ${COLORS.gray200}`,
            overflowX: 'auto',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
            minWidth: isMobile ? '900px' : undefined,
        },
        th: {
            padding: '12px 14px',
            textAlign: 'left',
            fontWeight: 700,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: COLORS.gray500,
            borderBottom: `2px solid ${COLORS.gray200}`,
            background: COLORS.gray50,
            whiteSpace: 'nowrap',
        },
        td: {
            padding: '10px 14px',
            borderBottom: `1px solid ${COLORS.gray100}`,
            verticalAlign: 'middle',
        },
        trHover: {
            transition: 'background 0.15s',
        },
        badge: (bg, color, border) => ({
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            background: bg,
            color: color,
            border: border ? `1px solid ${border}` : 'none',
            whiteSpace: 'nowrap',
        }),
        tipoBadge: (bg, color) => ({
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            background: bg,
            color: color,
        }),
        actions: {
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
        },
        // Pagination
        paginationRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '14px',
            flexWrap: 'wrap',
            gap: '8px',
        },
        paginationInfo: {
            fontSize: '14px',
            color: COLORS.gray500,
        },
        paginationBtns: {
            display: 'flex',
            gap: '4px',
        },
        pageBtn: (active) => ({
            padding: '6px 12px',
            borderRadius: '6px',
            border: active ? 'none' : `1px solid ${COLORS.gray300}`,
            background: active ? COLORS.primary : COLORS.white,
            color: active ? COLORS.white : COLORS.gray700,
            fontSize: '14px',
            fontWeight: active ? 700 : 400,
            cursor: 'pointer',
            transition: 'all 0.15s',
        }),
        // Loading / error
        loadingContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            gap: '14px',
        },
        spinner: {
            width: '36px',
            height: '36px',
            border: `3px solid ${COLORS.gray200}`,
            borderTopColor: COLORS.primary,
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
        },
        errorBox: {
            background: COLORS.dangerBg,
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            border: `1px solid ${COLORS.danger}20`,
        },
        errorMsg: {
            color: COLORS.danger,
            fontWeight: 600,
            marginBottom: '10px',
        },
        // Flash message
        flashMsg: (type) => ({
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            background: type === 'danger' ? COLORS.danger : COLORS.success,
            color: COLORS.white,
            fontWeight: 600,
            fontSize: '14px',
            zIndex: 9999,
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease-out',
        }),
        emptyState: {
            textAlign: 'center',
            padding: '40px 20px',
            color: COLORS.gray400,
        },
        // Inline edit input
        editInput: {
            padding: '5px 8px',
            borderRadius: '4px',
            border: `1px solid ${COLORS.gray300}`,
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
            outline: 'none',
        },
        editSelect: {
            padding: '5px 8px',
            borderRadius: '4px',
            border: `1px solid ${COLORS.gray300}`,
            fontSize: '14px',
            outline: 'none',
            background: COLORS.white,
        },
        confirmOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998,
        },
        confirmBox: {
            background: COLORS.white,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            textAlign: 'center',
        },
        confirmTitle: {
            fontSize: '16px',
            fontWeight: 700,
            color: COLORS.gray800,
            marginBottom: '8px',
        },
        confirmText: {
            fontSize: '14px',
            color: COLORS.gray500,
            marginBottom: '20px',
        },
        confirmActions: {
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
        },
        txIdCell: {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: COLORS.gray600,
            maxWidth: '130px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
    };

    // CSS keyframes injection
    useEffect(() => {
        const styleId = 'admin-ordini-keyframes';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `;
            document.head.appendChild(style);
        }
        return () => {
            const el = document.getElementById(styleId);
            if (el) el.remove();
        };
    }, []);

    // ============================================
    // RENDER HELPERS
    // ============================================
    const renderStatoBadge = (stato) => {
        const colors = STATO_COLORS[stato] || { bg: COLORS.gray100, text: COLORS.gray500, border: COLORS.gray400 };
        return <span style={s.badge(colors.bg, colors.text, colors.border)}>{stato || '-'}</span>;
    };

    const renderTipoBadge = (tipo) => {
        const colors = TIPO_COLORS[tipo] || { bg: COLORS.gray100, text: COLORS.gray500 };
        return <span style={s.tipoBadge(colors.bg, colors.text)}>{tipo || '-'}</span>;
    };

    const renderFormField = (label, value, onChange, type = 'text', options = null) => (
        <div style={s.formGroup}>
            <label style={s.formLabel}>{label}</label>
            {options ? (
                <select style={s.formSelect} value={value} onChange={(e) => onChange(e.target.value)}>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    style={s.formInput}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={label}
                />
            )}
        </div>
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        const pages = [];
        const maxVisible = isMobile ? 3 : 7;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            pages.push(
                <button key={1} style={s.pageBtn(currentPage === 1)} onClick={() => setCurrentPage(1)}>1</button>
            );
            if (startPage > 2) {
                pages.push(<span key="dots-start" style={{ padding: '6px 4px', color: COLORS.gray400 }}>...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button key={i} style={s.pageBtn(currentPage === i)} onClick={() => setCurrentPage(i)}>{i}</button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="dots-end" style={{ padding: '6px 4px', color: COLORS.gray400 }}>...</span>);
            }
            pages.push(
                <button key={totalPages} style={s.pageBtn(currentPage === totalPages)} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
            );
        }

        return (
            <div style={s.paginationRow}>
                <span style={s.paginationInfo}>
                    {filteredOrders.length === 0
                        ? 'Nessun risultato'
                        : `${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} di ${filteredOrders.length} ordini`
                    }
                </span>
                <div style={s.paginationBtns}>
                    <button
                        style={{ ...s.pageBtn(false), opacity: currentPage === 1 ? 0.4 : 1 }}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        &#8249;
                    </button>
                    {pages}
                    <button
                        style={{ ...s.pageBtn(false), opacity: currentPage === totalPages ? 0.4 : 1 }}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        &#8250;
                    </button>
                </div>
            </div>
        );
    };

    // ============================================
    // RENDER
    // ============================================

    // Flash message
    const flashEl = actionMsg ? (
        <div style={s.flashMsg(actionMsg.type)}>{actionMsg.msg}</div>
    ) : null;

    // Delete confirmation modal
    const confirmModal = confirmDeleteId ? (
        <div style={s.confirmOverlay} onClick={() => setConfirmDeleteId(null)}>
            <div style={s.confirmBox} onClick={(e) => e.stopPropagation()}>
                <div style={s.confirmTitle}>Conferma eliminazione</div>
                <div style={s.confirmText}>
                    Sei sicuro di voler eliminare questo ordine? L'azione non è reversibile.
                </div>
                <div style={s.confirmActions}>
                    <button style={s.btnOutline} onClick={() => setConfirmDeleteId(null)}>Annulla</button>
                    <button
                        style={{ ...s.btnDanger, opacity: deletingId === confirmDeleteId ? 0.6 : 1 }}
                        disabled={deletingId === confirmDeleteId}
                        onClick={() => handleDelete(confirmDeleteId)}
                    >
                        {deletingId === confirmDeleteId ? 'Eliminazione...' : 'Elimina'}
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    // Loading
    if (loading && orders.length === 0) {
        return (
            <div style={s.container}>
                {flashEl}
                <div style={s.loadingContainer}>
                    <div style={s.spinner} />
                    <span style={{ color: COLORS.gray500, fontSize: '14px' }}>Caricamento ordini...</span>
                </div>
            </div>
        );
    }

    // Error
    if (error && orders.length === 0) {
        return (
            <div style={s.container}>
                {flashEl}
                <div style={s.errorBox}>
                    <div style={s.errorMsg}>{error}</div>
                    <button style={s.btnPrimary} onClick={loadOrders}>Riprova</button>
                </div>
            </div>
        );
    }

    return (
        <div style={s.container}>
            {flashEl}
            {confirmModal}

            {/* --- Header --- */}
            <div style={s.header}>
                <h2 style={s.title}>Gestione Ordini</h2>
                <div style={s.headerActions}>
                    <button
                        style={s.btnPrimary}
                        onClick={() => setShowCreateForm(v => !v)}
                    >
                        {showCreateForm ? '\u2715 Chiudi' : '+ Nuovo Ordine'}
                    </button>
                    <button
                        style={s.btnInfo}
                        onClick={() => exportCSV(filteredOrders)}
                        disabled={filteredOrders.length === 0}
                    >
                        Esporta CSV
                    </button>
                    <button
                        style={{ ...s.btnOutline, padding: '9px 18px', fontSize: '14px' }}
                        onClick={loadOrders}
                        disabled={loading}
                    >
                        {loading ? 'Aggiorno...' : 'Aggiorna'}
                    </button>
                </div>
            </div>

            {/* --- Summary Cards --- */}
            <div style={s.summaryRow}>
                <div style={s.summaryCard(COLORS.primary)}>
                    <div style={s.summaryLabel}>Totale ordini</div>
                    <div style={s.summaryValue(COLORS.primary)}>{stats.totale}</div>
                </div>
                <div style={s.summaryCard(COLORS.info)}>
                    <div style={s.summaryLabel}>Importo totale</div>
                    <div style={{ ...s.summaryValue(COLORS.info), fontSize: isMobile ? '16px' : '22px' }}>
                        {formatCurrency(stats.importoTotale)}
                    </div>
                </div>
                <div style={s.summaryCard(COLORS.success)}>
                    <div style={s.summaryLabel}>Completati</div>
                    <div style={s.summaryValue(COLORS.success)}>{stats.completati}</div>
                </div>
                <div style={s.summaryCard(COLORS.warning)}>
                    <div style={s.summaryLabel}>In attesa</div>
                    <div style={s.summaryValue(COLORS.warning)}>{stats.inAttesa}</div>
                </div>
            </div>

            {/* --- Create Form (slide-down) --- */}
            {showCreateForm && (
                <div style={s.formPanel}>
                    <h3 style={s.formTitle}>Nuovo Ordine</h3>
                    <div style={s.formGrid}>
                        {renderFormField('Nome Cliente *', createForm.nomeCliente, (v) => setCreateForm(f => ({ ...f, nomeCliente: v })))}
                        {renderFormField('Email *', createForm.email, (v) => setCreateForm(f => ({ ...f, email: v })), 'email')}
                        {renderFormField('Importo (\u20ac)', createForm.importo, (v) => setCreateForm(f => ({ ...f, importo: v })), 'number')}
                        {renderFormField('Tipo', createForm.tipo, (v) => setCreateForm(f => ({ ...f, tipo: v })), 'text', TIPI)}
                        {renderFormField('Stato', createForm.stato, (v) => setCreateForm(f => ({ ...f, stato: v })), 'text', STATI)}
                        {renderFormField('Data Ordine', createForm.dataOrdine, (v) => setCreateForm(f => ({ ...f, dataOrdine: v })), 'date')}
                        {renderFormField('Transaction ID', createForm.transactionId, (v) => setCreateForm(f => ({ ...f, transactionId: v })))}
                        {renderFormField('Metodo Pagamento', createForm.metodoPagamento, (v) => setCreateForm(f => ({ ...f, metodoPagamento: v })), 'text', METODI_PAGAMENTO)}
                        <div style={{ ...s.formGroup, gridColumn: isMobile ? undefined : 'span 3' }}>
                            <label style={s.formLabel}>Note</label>
                            <textarea
                                style={{ ...s.formInput, minHeight: '60px', resize: 'vertical' }}
                                value={createForm.note}
                                onChange={(e) => setCreateForm(f => ({ ...f, note: e.target.value }))}
                                placeholder="Note aggiuntive..."
                            />
                        </div>
                    </div>
                    <div style={s.formActions}>
                        <button style={s.btnOutline} onClick={() => { setShowCreateForm(false); setCreateForm({ ...EMPTY_FORM }); }}>
                            Annulla
                        </button>
                        <button
                            style={{ ...s.btnPrimary, opacity: creating ? 0.6 : 1 }}
                            onClick={handleCreate}
                            disabled={creating}
                        >
                            {creating ? 'Creazione...' : 'Crea Ordine'}
                        </button>
                    </div>
                </div>
            )}

            {/* --- Filters --- */}
            <div style={s.filtersRow}>
                <input
                    type="text"
                    style={s.searchInput}
                    placeholder="Cerca per cliente, email o transaction ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select style={s.select} value={filterStato} onChange={(e) => setFilterStato(e.target.value)}>
                    <option value="">Tutti gli stati</option>
                    {STATI.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
                <select style={s.select} value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
                    <option value="">Tutti i tipi</option>
                    {TIPI.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {(searchQuery || filterStato || filterTipo) && (
                    <button
                        style={s.btnOutline}
                        onClick={() => { setSearchQuery(''); setFilterStato(''); setFilterTipo(''); }}
                    >
                        Resetta filtri
                    </button>
                )}
            </div>

            {/* --- Error banner (non-blocking) --- */}
            {error && orders.length > 0 && (
                <div style={{ ...s.errorBox, marginBottom: '14px', padding: '12px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: COLORS.danger, fontSize: '14px' }}>{error}</span>
                    <button style={{ ...s.btnOutline, fontSize: '14px', padding: '4px 10px' }} onClick={() => setError(null)}>Chiudi</button>
                </div>
            )}

            {/* --- Table --- */}
            <div style={s.tableWrapper}>
                <table style={s.table}>
                    <thead>
                        <tr>
                            <th style={s.th}>#</th>
                            <th style={s.th}>Cliente</th>
                            <th style={s.th}>Email</th>
                            <th style={s.th}>Importo</th>
                            <th style={s.th}>Tipo</th>
                            <th style={s.th}>Stato</th>
                            <th style={s.th}>Data</th>
                            <th style={s.th}>Transaction ID</th>
                            <th style={s.th}>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.length === 0 ? (
                            <tr>
                                <td style={{ ...s.td, ...s.emptyState }} colSpan={9}>
                                    {orders.length === 0
                                        ? 'Nessun ordine presente. Crea il primo ordine!'
                                        : 'Nessun ordine corrisponde ai filtri applicati.'
                                    }
                                </td>
                            </tr>
                        ) : paginatedOrders.map((order, idx) => {
                            const isEditing = editingId === order.id;
                            const globalIdx = (currentPage - 1) * PAGE_SIZE + idx + 1;

                            if (isEditing) {
                                return (
                                    <tr key={order.id || idx} style={{ background: COLORS.primaryBg }}>
                                        <td style={s.td}>{globalIdx}</td>
                                        <td style={s.td}>
                                            <input style={s.editInput} value={editForm.nomeCliente} onChange={(e) => setEditForm(f => ({ ...f, nomeCliente: e.target.value }))} />
                                        </td>
                                        <td style={s.td}>
                                            <input style={s.editInput} type="email" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} />
                                        </td>
                                        <td style={s.td}>
                                            <input style={{ ...s.editInput, width: '80px' }} type="number" step="0.01" value={editForm.importo} onChange={(e) => setEditForm(f => ({ ...f, importo: e.target.value }))} />
                                        </td>
                                        <td style={s.td}>
                                            <select style={s.editSelect} value={editForm.tipo} onChange={(e) => setEditForm(f => ({ ...f, tipo: e.target.value }))}>
                                                {TIPI.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </td>
                                        <td style={s.td}>
                                            <select style={s.editSelect} value={editForm.stato} onChange={(e) => setEditForm(f => ({ ...f, stato: e.target.value }))}>
                                                {STATI.map(st => <option key={st} value={st}>{st}</option>)}
                                            </select>
                                        </td>
                                        <td style={s.td}>
                                            <input style={{ ...s.editInput, width: '120px' }} type="date" value={editForm.dataOrdine} onChange={(e) => setEditForm(f => ({ ...f, dataOrdine: e.target.value }))} />
                                        </td>
                                        <td style={s.td}>
                                            <input style={{ ...s.editInput, width: '120px' }} value={editForm.transactionId} onChange={(e) => setEditForm(f => ({ ...f, transactionId: e.target.value }))} />
                                        </td>
                                        <td style={s.td}>
                                            <div style={s.actions}>
                                                <button
                                                    style={{ ...s.btnSuccess, opacity: saving ? 0.6 : 1 }}
                                                    onClick={() => handleSave(order.id)}
                                                    disabled={saving}
                                                >
                                                    {saving ? '...' : 'Salva'}
                                                </button>
                                                <button style={s.btnOutline} onClick={cancelEdit}>Annulla</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }

                            return (
                                <tr
                                    key={order.id || idx}
                                    style={s.trHover}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.gray50; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <td style={{ ...s.td, color: COLORS.gray400, fontWeight: 600, fontSize: '14px' }}>{globalIdx}</td>
                                    <td style={{ ...s.td, fontWeight: 600, color: COLORS.gray800 }}>{order.nomeCliente || '-'}</td>
                                    <td style={{ ...s.td, color: COLORS.gray600 }}>{order.email || '-'}</td>
                                    <td style={{ ...s.td, fontWeight: 700, color: COLORS.primary }}>{formatCurrency(order.importo)}</td>
                                    <td style={s.td}>{renderTipoBadge(order.tipo)}</td>
                                    <td style={s.td}>{renderStatoBadge(order.stato)}</td>
                                    <td style={{ ...s.td, whiteSpace: 'nowrap', color: COLORS.gray600 }}>{formatDate(order.dataOrdine)}</td>
                                    <td style={{ ...s.td, ...s.txIdCell }} title={order.transactionId || ''}>{order.transactionId || '-'}</td>
                                    <td style={s.td}>
                                        <div style={s.actions}>
                                            <button
                                                style={s.btnOutline}
                                                onClick={() => startEdit(order)}
                                                title="Modifica"
                                            >
                                                Modifica
                                            </button>
                                            <button
                                                style={{ ...s.btnDanger, padding: '4px 10px', fontSize: '14px' }}
                                                onClick={() => setConfirmDeleteId(order.id)}
                                                title="Elimina"
                                            >
                                                Elimina
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* --- Pagination --- */}
            {renderPagination()}
        </div>
    );
}
