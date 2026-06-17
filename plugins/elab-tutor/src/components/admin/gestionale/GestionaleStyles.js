// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Design System Corporate
// Palette professionale per ERP aziendale
// ============================================

export const COLORS = {
    primary: '#0f172a', // palette
    primaryLight: '#1e293b', // palette
    primaryHover: '#334155', // palette
    accent: 'var(--elab-navy)',
    accentLight: '#2563eb', // palette
    accentBg: '#eff6ff', // palette
    success: '#059669', // palette
    successBg: '#ecfdf5', // palette
    warning: '#d97706', // palette
    warningBg: '#fffbeb', // palette
    danger: '#dc2626', // palette
    dangerBg: '#fef2f2', // palette
    info: '#0891b2', // palette
    infoBg: '#ecfeff', // palette
    bg: '#f8fafc', // palette
    card: '#ffffff', // palette
    border: '#e2e8f0', // palette
    borderLight: '#f1f5f9', // palette
    textPrimary: '#0f172a', // palette
    textSecondary: '#475569', // palette
    textMuted: '#64748b', // palette
    textWhite: '#ffffff', // palette
};

export const MODULES = [
    { id: 'dashboard', label: 'Dashboard', icon: '', color: COLORS.accent },
    { id: 'fatture', label: 'Fatturazione', icon: '', color: '#7c3aed' }, // palette
    { id: 'ordini', label: 'Ordini & Vendite', icon: '', color: '#2563eb' }, // palette
    { id: 'magazzino', label: 'Magazzino & Kit', icon: '', color: '#d97706' }, // palette
    { id: 'dipendenti', label: 'Dipendenti', icon: '', color: '#059669' }, // palette
    { id: 'finanze', label: 'Banche & Finanze', icon: '', color: '#0891b2' }, // palette
    { id: 'documenti', label: 'Burocrazia', icon: '', color: '#dc2626' }, // palette
    { id: 'marketing', label: 'Marketing & Clienti', icon: '', color: '#ec4899' }, // palette
    { id: 'report', label: 'Report', icon: '', color: '#7c3aed' }, // palette
    { id: 'impostazioni', label: 'Impostazioni', icon: '', color: '#64748b' }, // palette
];

export const STATUS_COLORS = {
    bozza: { bg: '#f1f5f9', text: '#475569', label: 'Bozza' }, // palette
    emessa: { bg: '#dbeafe', text: '#1d4ed8', label: 'Emessa' }, // palette
    inviata: { bg: '#fef3c7', text: '#b45309', label: 'Inviata' }, // palette
    pagata: { bg: '#d1fae5', text: '#065f46', label: 'Pagata' }, // palette
    scaduta: { bg: '#fee2e2', text: '#991b1b', label: 'Scaduta' }, // palette
    annullata: { bg: '#f1f5f9', text: '#64748b', label: 'Annullata' }, // palette
    confermato: { bg: '#dbeafe', text: '#1d4ed8', label: 'Confermato' }, // palette
    in_lavorazione: { bg: '#fef3c7', text: '#b45309', label: 'In Lavorazione' }, // palette
    spedito: { bg: '#e0e7ff', text: '#4338ca', label: 'Spedito' }, // palette
    consegnato: { bg: '#d1fae5', text: '#065f46', label: 'Consegnato' }, // palette
    attivo: { bg: '#d1fae5', text: '#065f46', label: 'Attivo' }, // palette
    in_ferie: { bg: '#fef3c7', text: '#b45309', label: 'In Ferie' }, // palette
    malattia: { bg: '#fee2e2', text: '#991b1b', label: 'Malattia' }, // palette
    cessato: { bg: '#f1f5f9', text: '#64748b', label: 'Cessato' }, // palette
    pianificata: { bg: '#e0e7ff', text: '#4338ca', label: 'Pianificata' }, // palette
    in_corso: { bg: '#fef3c7', text: '#b45309', label: 'In Corso' }, // palette
    completata: { bg: '#d1fae5', text: '#065f46', label: 'Completata' }, // palette
    sospesa: { bg: '#fee2e2', text: '#991b1b', label: 'Sospesa' }, // palette
    valido: { bg: '#d1fae5', text: '#065f46', label: 'Valido' }, // palette
    in_scadenza: { bg: '#fef3c7', text: '#b45309', label: 'In Scadenza' }, // palette
    scaduto: { bg: '#fee2e2', text: '#991b1b', label: 'Scaduto' }, // palette
    archiviato: { bg: '#f1f5f9', text: '#64748b', label: 'Archiviato' }, // palette
    da_elaborare: { bg: '#f1f5f9', text: '#475569', label: 'Da Elaborare' }, // palette
    elaborata: { bg: '#dbeafe', text: '#1d4ed8', label: 'Elaborata' }, // palette
    entrata: { bg: '#d1fae5', text: '#065f46', label: 'Entrata' }, // palette
    uscita: { bg: '#fee2e2', text: '#991b1b', label: 'Uscita' }, // palette
    // SDI - Fatturazione Elettronica
    xml_generato: { bg: '#dbeafe', text: '#1d4ed8', label: 'XML Generato' }, // palette
    firmato: { bg: '#e0e7ff', text: '#4338ca', label: 'Firmato' }, // palette
    inviato_sdi: { bg: '#fef3c7', text: '#b45309', label: 'Inviato SDI' }, // palette
    accettato_sdi: { bg: '#d1fae5', text: '#065f46', label: 'Accettato SDI' }, // palette
    rifiutato_sdi: { bg: '#fee2e2', text: '#991b1b', label: 'Rifiutato SDI' }, // palette
};

export function getStatusStyle(stato) {
    const s = STATUS_COLORS[stato];
    if (!s) return { background: '#f1f5f9', color: '#475569' }; // palette
    return { background: s.bg, color: s.text, padding: '3px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', display: 'inline-block', textTransform: 'capitalize' };
}

export function getStatusLabel(stato) {
    return STATUS_COLORS[stato]?.label || stato;
}

// Stili riutilizzabili
export const S = {
    pageHeader: {
        marginBottom: '20px',
    },
    pageTitle: {
        fontSize: '20px', fontWeight: '700', color: COLORS.textPrimary, margin: '0 0 4px',
    },
    pageSubtitle: {
        fontSize: '14px', color: COLORS.textSecondary, margin: 0,
    },
    card: {
        background: COLORS.card, borderRadius: '10px', border: `1px solid ${COLORS.border}`,
        padding: '20px', marginBottom: '16px',
    },
    cardCompact: {
        background: COLORS.card, borderRadius: '8px', border: `1px solid ${COLORS.border}`,
        padding: '14px',
    },
    toolbar: {
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap',
    },
    searchInput: {
        flex: 1, minWidth: '180px', padding: '9px 14px', border: `1px solid ${COLORS.border}`,
        borderRadius: '8px', fontSize: '14px', outline: 'none', background: COLORS.card,
    },
    select: {
        padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: '8px',
        fontSize: '14px', background: COLORS.card, cursor: 'pointer', outline: 'none',
    },
    btnPrimary: {
        padding: '9px 18px', background: COLORS.accent, color: '#fff', border: 'none',
        borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
        transition: 'all 0.15s',
    },
    btnSecondary: {
        padding: '9px 18px', background: COLORS.bg, color: COLORS.textPrimary,
        border: `1px solid ${COLORS.border}`, borderRadius: '8px', fontSize: '14px',
        fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s',
    },
    btnDanger: {
        padding: '9px 18px', background: COLORS.danger, color: '#fff', border: 'none',
        borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    },
    btnSuccess: {
        padding: '9px 18px', background: COLORS.success, color: '#fff', border: 'none',
        borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    },
    btnSmall: {
        padding: '5px 12px', fontSize: '14px', border: 'none', borderRadius: '6px',
        cursor: 'pointer', fontWeight: '500',
    },
    input: {
        width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`,
        borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    },
    label: {
        fontSize: '14px', fontWeight: '600', color: COLORS.textSecondary, marginBottom: '4px',
        display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px',
    },
    formGroup: {
        marginBottom: '14px',
    },
    formGrid: (isMobile) => ({
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '14px',
    }),
    table: {
        width: '100%', borderCollapse: 'separate', borderSpacing: 0,
    },
    th: {
        padding: '10px 14px', background: COLORS.bg, color: COLORS.textSecondary,
        fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
        textAlign: 'left', borderBottom: `2px solid ${COLORS.border}`,
        position: 'sticky', top: 0, zIndex: 1,
    },
    td: {
        padding: '10px 14px', fontSize: '14px', color: COLORS.textPrimary,
        borderBottom: `1px solid ${COLORS.borderLight}`,
    },
    emptyState: {
        textAlign: 'center', padding: '40px 20px', color: COLORS.textMuted,
    },
    emptyIcon: {
        fontSize: '40px', marginBottom: '12px',
    },
    emptyText: {
        fontSize: '14px', marginBottom: '8px',
    },
    divider: {
        height: '1px', background: COLORS.border, margin: '20px 0',
    },
    badge: (color) => ({
        display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
        fontSize: '14px', fontWeight: '600', background: color + '20', color: color,
    }),
    alertBox: (type) => {
        const map = {
            danger: { bg: COLORS.dangerBg, border: COLORS.danger, icon: '' },
            warning: { bg: COLORS.warningBg, border: COLORS.warning, icon: '' },
            success: { bg: COLORS.successBg, border: COLORS.success, icon: '' },
            info: { bg: COLORS.infoBg, border: COLORS.info, icon: '' },
        };
        const m = map[type] || map.info;
        return {
            background: m.bg, borderLeft: `4px solid ${m.border}`,
            padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '12px',
            fontSize: '14px', color: COLORS.textPrimary,
        };
    },
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    modal: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999, padding: '20px',
    },
    modalContent: (isMobile) => ({
        background: COLORS.card, borderRadius: '12px', padding: '24px',
        width: isMobile ? '100%' : '600px', maxWidth: '90vw', maxHeight: '85vh',
        overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    }),
    modalTitle: {
        fontSize: '18px', fontWeight: '700', color: COLORS.textPrimary,
        margin: '0 0 16px', paddingBottom: '12px', borderBottom: `1px solid ${COLORS.border}`,
    },
    modalActions: {
        display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px',
        paddingTop: '16px', borderTop: `1px solid ${COLORS.border}`,
    },
};
