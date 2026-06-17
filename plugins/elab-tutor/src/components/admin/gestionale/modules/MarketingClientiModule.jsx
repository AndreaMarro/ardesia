// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Modulo Marketing & Clienti
// CRM, Fornitori e Campagne Marketing
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { COLORS, S, getStatusStyle, getStatusLabel } from '../GestionaleStyles';
import { clientiService, fornitoriService, campagneService, fattureService, ordiniService } from '../GestionaleService';
import GestionaleTable from '../shared/GestionaleTable';
import GestionaleForm from '../shared/GestionaleForm';
import GestionaleCard from '../shared/GestionaleCard';
import { formatCurrency, formatDate } from '../shared/GestionaleUtils';
import logger from '../../../../utils/logger';
import { showToast } from '../../../common/Toast';

// ── Costanti ──────────────────────────────────────
const TIPI_CLIENTE = [
    { value: 'scuola', label: 'Scuola', icon: '' },
    { value: 'azienda', label: 'Azienda', icon: '' },
    { value: 'ente_pubblico', label: 'Ente Pubblico', icon: '' },
    { value: 'privato', label: 'Privato', icon: '' },
];

const TIPI_FORNITORE = [
    { value: 'componenti', label: 'Componenti' },
    { value: 'servizi', label: 'Servizi' },
    { value: 'logistica', label: 'Logistica' },
    { value: 'altro', label: 'Altro' },
];

const TIPI_CAMPAGNA = [
    { value: 'email', label: 'Email' },
    { value: 'social', label: 'Social' },
    { value: 'evento', label: 'Evento' },
    { value: 'fiera', label: 'Fiera' },
    { value: 'altro', label: 'Altro' },
];

const STATI_CAMPAGNA = [
    { value: 'pianificata', label: 'Pianificata' },
    { value: 'in_corso', label: 'In Corso' },
    { value: 'completata', label: 'Completata' },
    { value: 'sospesa', label: 'Sospesa' },
];

const SUB_TABS = [
    { key: 'clienti', label: ' Clienti' },
    { key: 'fornitori', label: ' Fornitori' },
    { key: 'campagne', label: ' Campagne' },
];

// ── Helpers ───────────────────────────────────────
function getClienteIcon(tipo) {
    const found = TIPI_CLIENTE.find(t => t.value === tipo);
    return found ? found.icon : '';
}

function getClienteLabel(tipo) {
    const found = TIPI_CLIENTE.find(t => t.value === tipo);
    return found ? found.label : tipo || '\u2014';
}

function getFornitoreLabel(tipo) {
    const found = TIPI_FORNITORE.find(t => t.value === tipo);
    return found ? found.label : tipo || '\u2014';
}

function getCampagnaLabel(tipo) {
    const found = TIPI_CAMPAGNA.find(t => t.value === tipo);
    return found ? found.label : tipo || '\u2014';
}

// ── Form fields definitions ──────────────────────
const clienteFormFields = [
    { key: 'tipo', label: 'Tipo', type: 'select', required: true, options: TIPI_CLIENTE },
    { key: 'nome', label: 'Nome / Ragione Sociale', type: 'text', required: true },
    { key: 'referente', label: 'Referente' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'telefono', label: 'Telefono' },
    { key: 'pec', label: 'PEC', type: 'email' },
    { key: 'piva', label: 'Partita IVA' },
    { key: 'codiceFiscale', label: 'Codice Fiscale' },
    { key: 'codiceSDI', label: 'Codice SDI' },
    { key: 'indirizzo', label: 'Indirizzo' },
    { key: 'citta', label: 'Citt\u00E0' },
    { key: 'cap', label: 'CAP' },
    { key: 'provincia', label: 'Provincia' },
    { key: 'note', label: 'Note', type: 'textarea', fullWidth: true },
];

const fornitoreFormFields = [
    { key: 'nome', label: 'Nome / Ragione Sociale', type: 'text', required: true },
    { key: 'tipo', label: 'Tipo', type: 'select', required: true, options: TIPI_FORNITORE },
    { key: 'referente', label: 'Referente' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'telefono', label: 'Telefono' },
    { key: 'piva', label: 'Partita IVA' },
    { key: 'iban', label: 'IBAN' },
    { key: 'condizioni', label: 'Condizioni Pagamento', placeholder: 'es. 30 gg DFFM' },
    { key: 'note', label: 'Note', type: 'textarea', fullWidth: true },
];

const campagnaFormFields = [
    { key: 'nome', label: 'Nome Campagna', type: 'text', required: true },
    { key: 'tipo', label: 'Tipo', type: 'select', required: true, options: TIPI_CAMPAGNA },
    { key: 'stato', label: 'Stato', type: 'select', required: true, options: STATI_CAMPAGNA },
    { key: 'dataInizio', label: 'Data Inizio', type: 'date' },
    { key: 'dataFine', label: 'Data Fine', type: 'date' },
    { key: 'budget', label: 'Budget', type: 'currency' },
    { key: 'speso', label: 'Speso', type: 'currency' },
    { key: 'target', label: 'Target', placeholder: 'es. Scuole Lombardia' },
    { key: 'risultati', label: 'Risultati' },
    { key: 'note', label: 'Note', type: 'textarea', fullWidth: true },
];

// ── Empty templates ──────────────────────────────
const emptyCliente = () => ({
    tipo: 'azienda', nome: '', referente: '', email: '', telefono: '', pec: '',
    piva: '', codiceFiscale: '', codiceSDI: '', indirizzo: '', citta: '', cap: '',
    provincia: '', note: '',
});

const emptyFornitore = () => ({
    nome: '', tipo: 'componenti', referente: '', email: '', telefono: '',
    piva: '', iban: '', condizioni: '', note: '',
});

const emptyCampagna = () => ({
    nome: '', tipo: 'email', stato: 'pianificata', dataInizio: '', dataFine: '',
    budget: 0, speso: 0, target: '', risultati: '', note: '',
});


// ══════════════════════════════════════════════════
// COMPONENTE PRINCIPALE
// ══════════════════════════════════════════════════
export default function MarketingClientiModule({ isMobile }) {
    // ── State generale ────────────────────────────
    const [subTab, setSubTab] = useState('clienti');
    const [loading, setLoading] = useState(true);

    // ── Dati ──────────────────────────────────────
    const [clienti, setClienti] = useState([]);
    const [fornitori, setFornitori] = useState([]);
    const [campagne, setCampagne] = useState([]);
    const [fatture, setFatture] = useState([]);
    const [ordini, setOrdini] = useState([]);

    // ── Clienti state ─────────────────────────────
    const [searchCli, setSearchCli] = useState('');
    const [tipoCliFilter, setTipoCliFilter] = useState('');
    const [showCliForm, setShowCliForm] = useState(false);
    const [editingCli, setEditingCli] = useState(null);
    const [cliForm, setCliForm] = useState(emptyCliente());
    const [detailCli, setDetailCli] = useState(null);

    // ── Fornitori state ───────────────────────────
    const [searchFor, setSearchFor] = useState('');
    const [tipoForFilter, setTipoForFilter] = useState('');
    const [showForForm, setShowForForm] = useState(false);
    const [editingFor, setEditingFor] = useState(null);
    const [forForm, setForForm] = useState(emptyFornitore());

    // ── Campagne state ────────────────────────────
    const [searchCamp, setSearchCamp] = useState('');
    const [statoCampFilter, setStatoCampFilter] = useState('');
    const [showCampForm, setShowCampForm] = useState(false);
    const [editingCamp, setEditingCamp] = useState(null);
    const [campForm, setCampForm] = useState(emptyCampagna());

    // ── Caricamento dati ──────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [c, f, cam, fat, ord] = await Promise.all([
                clientiService.getAll(),
                fornitoriService.getAll(),
                campagneService.getAll(),
                fattureService.getAll(),
                ordiniService.getAll(),
            ]);
            setClienti(c || []);
            setFornitori(f || []);
            setCampagne(cam || []);
            setFatture(fat || []);
            setOrdini(ord || []);
        } catch (e) {
            logger.error('Errore caricamento dati marketing:', e);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);


    // ══════════════════════════════════════════════
    // CLIENTI - Logica
    // ══════════════════════════════════════════════

    const filteredClienti = useMemo(() => {
        return clienti.filter(c => {
            if (tipoCliFilter && c.tipo !== tipoCliFilter) return false;
            if (searchCli) {
                const s = searchCli.toLowerCase();
                return (c.nome || c.ragioneSociale || '').toLowerCase().includes(s)
                    || (c.referente || '').toLowerCase().includes(s)
                    || (c.email || '').toLowerCase().includes(s)
                    || (c.citta || '').toLowerCase().includes(s)
                    || (c.piva || c.partitaIva || '').toLowerCase().includes(s);
            }
            return true;
        });
    }, [clienti, tipoCliFilter, searchCli]);

    const clientiStats = useMemo(() => {
        const totale = clienti.length;
        const now = new Date();
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
        const clientiConOrdiniRecenti = new Set();
        ordini.forEach(o => {
            if (o.clienteId && (o.dataOrdine || o.data || o.createdAt || '') >= ninetyDaysAgo) {
                clientiConOrdiniRecenti.add(o.clienteId);
            }
        });
        const attivi = clientiConOrdiniRecenti.size;
        const fatturatoTotale = fatture
            .filter(f => f.stato === 'pagata')
            .reduce((s, f) => s + (f.totale || 0), 0);
        return { totale, attivi, fatturatoTotale };
    }, [clienti, ordini, fatture]);

    const getClienteHistory = useCallback((clienteId) => {
        const cFatture = fatture.filter(f => f.clienteId === clienteId)
            .sort((a, b) => new Date(b.dataEmissione || b.createdAt) - new Date(a.dataEmissione || a.createdAt));
        const cOrdini = ordini.filter(o => o.clienteId === clienteId)
            .sort((a, b) => new Date(b.dataOrdine || b.data || b.createdAt) - new Date(a.dataOrdine || a.data || a.createdAt));
        return { fatture: cFatture.slice(0, 10), ordini: cOrdini.slice(0, 10) };
    }, [fatture, ordini]);

    const openNewCli = useCallback(() => {
        setEditingCli(null);
        setCliForm(emptyCliente());
        setShowCliForm(true);
    }, []);

    const openEditCli = useCallback((c) => {
        setEditingCli(c.id);
        setCliForm({ ...emptyCliente(), ...c });
        setShowCliForm(true);
        setDetailCli(null);
    }, []);

    const handleSaveCli = useCallback(async (vals) => {
        try {
            if (editingCli) {
                await clientiService.update(editingCli, vals);
            } else {
                await clientiService.create(vals);
            }
            await loadData();
            setShowCliForm(false);
        } catch (e) {
            logger.error('Errore salvataggio cliente:', e);
        }
    }, [editingCli, loadData]);

    const handleDeleteCli = useCallback(async (id) => {
        if (!window.confirm('Eliminare questo cliente?')) return;
        try {
            const result = await clientiService.delete(id);
            if (result && result.success === false) {
                showToast(result.error || 'Impossibile eliminare il cliente', 'error');
                return;
            }
            await loadData();
            if (detailCli && detailCli.id === id) setDetailCli(null);
        } catch (e) {
            logger.error('Errore eliminazione cliente:', e);
        }
    }, [loadData, detailCli]);


    // ══════════════════════════════════════════════
    // FORNITORI - Logica
    // ══════════════════════════════════════════════

    const filteredFornitori = useMemo(() => {
        return fornitori.filter(f => {
            if (tipoForFilter && (f.tipo || f.categoria) !== tipoForFilter) return false;
            if (searchFor) {
                const s = searchFor.toLowerCase();
                return (f.nome || f.ragioneSociale || '').toLowerCase().includes(s)
                    || (f.referente || '').toLowerCase().includes(s)
                    || (f.email || '').toLowerCase().includes(s);
            }
            return true;
        });
    }, [fornitori, tipoForFilter, searchFor]);

    const openNewFor = useCallback(() => {
        setEditingFor(null);
        setForForm(emptyFornitore());
        setShowForForm(true);
    }, []);

    const openEditFor = useCallback((f) => {
        setEditingFor(f.id);
        setForForm({ ...emptyFornitore(), ...f });
        setShowForForm(true);
    }, []);

    const handleSaveFor = useCallback(async (vals) => {
        try {
            if (editingFor) {
                await fornitoriService.update(editingFor, vals);
            } else {
                await fornitoriService.create(vals);
            }
            await loadData();
            setShowForForm(false);
        } catch (e) {
            logger.error('Errore salvataggio fornitore:', e);
        }
    }, [editingFor, loadData]);

    const handleDeleteFor = useCallback(async (id) => {
        if (!window.confirm('Eliminare questo fornitore?')) return;
        try {
            const result = await fornitoriService.delete(id);
            if (result && result.success === false) {
                showToast(result.error || 'Impossibile eliminare il fornitore', 'error');
                return;
            }
            await loadData();
        } catch (e) {
            logger.error('Errore eliminazione fornitore:', e);
        }
    }, [loadData]);


    // ══════════════════════════════════════════════
    // CAMPAGNE - Logica
    // ══════════════════════════════════════════════

    const filteredCampagne = useMemo(() => {
        return campagne.filter(c => {
            if (statoCampFilter && c.stato !== statoCampFilter) return false;
            if (searchCamp) {
                const s = searchCamp.toLowerCase();
                return (c.nome || '').toLowerCase().includes(s)
                    || (c.tipo || '').toLowerCase().includes(s)
                    || (c.target || '').toLowerCase().includes(s);
            }
            return true;
        });
    }, [campagne, statoCampFilter, searchCamp]);

    const campagneStats = useMemo(() => {
        const attive = campagne.filter(c => c.stato === 'in_corso' || c.stato === 'attiva').length;
        const budgetTotale = campagne.reduce((s, c) => s + (parseFloat(c.budget) || 0), 0);
        const spesoTotale = campagne.reduce((s, c) => s + (parseFloat(c.speso) || 0), 0);
        const roi = spesoTotale > 0 ? (((budgetTotale - spesoTotale) / spesoTotale) * 100) : 0;
        return { attive, budgetTotale, spesoTotale, roi };
    }, [campagne]);

    const openNewCamp = useCallback(() => {
        setEditingCamp(null);
        setCampForm(emptyCampagna());
        setShowCampForm(true);
    }, []);

    const openEditCamp = useCallback((c) => {
        setEditingCamp(c.id);
        setCampForm({ ...emptyCampagna(), ...c });
        setShowCampForm(true);
    }, []);

    const handleSaveCamp = useCallback(async (vals) => {
        try {
            if (editingCamp) {
                await campagneService.update(editingCamp, vals);
            } else {
                await campagneService.create(vals);
            }
            await loadData();
            setShowCampForm(false);
        } catch (e) {
            logger.error('Errore salvataggio campagna:', e);
        }
    }, [editingCamp, loadData]);

    const handleDeleteCamp = useCallback(async (id) => {
        if (!window.confirm('Eliminare questa campagna?')) return;
        try {
            await campagneService.delete(id);
            await loadData();
        } catch (e) {
            logger.error('Errore eliminazione campagna:', e);
        }
    }, [loadData]);


    // ══════════════════════════════════════════════
    // COLONNE TABELLE
    // ══════════════════════════════════════════════

    const clientiColumns = useMemo(() => [
        {
            key: 'tipo', label: 'Tipo', width: '60px',
            render: (v) => (
                <span style={{ fontSize: '20px' }} title={getClienteLabel(v)}>
                    {getClienteIcon(v)}
                </span>
            ),
        },
        {
            key: 'nome', label: 'Nome',
            render: (v, row) => (
                <span
                    style={{ fontWeight: 600, color: COLORS.accent, cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); setDetailCli(row); }}
                >
                    {v || row.ragioneSociale || '\u2014'}
                </span>
            ),
        },
        { key: 'referente', label: 'Referente', render: (v) => v || '\u2014' },
        { key: 'email', label: 'Email', render: (v) => v || '\u2014' },
        { key: 'telefono', label: 'Telefono', render: (v) => v || '\u2014' },
        { key: 'citta', label: 'Citt\u00E0', render: (v) => v || '\u2014' },
        {
            key: 'azioni', label: 'Azioni',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button
                        style={{ ...S.btnSmall, background: COLORS.info, color: '#fff' }}
                        onClick={(e) => { e.stopPropagation(); setDetailCli(row); }}
                    >
                        Dettagli
                    </button>
                    <button
                        style={{ ...S.btnSmall, background: COLORS.accentLight, color: '#fff' }}
                        onClick={(e) => { e.stopPropagation(); openEditCli(row); }}
                    >
                        Modifica
                    </button>
                    <button
                        style={{ ...S.btnSmall, background: COLORS.danger, color: '#fff' }}
                        onClick={(e) => { e.stopPropagation(); handleDeleteCli(row.id); }}
                    >
                        Elimina
                    </button>
                </div>
            ),
        },
    ], [openEditCli, handleDeleteCli]);

    const fornitoriColumns = useMemo(() => [
        {
            key: 'tipo', label: 'Tipo',
            render: (v, row) => (
                <span style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
                    background: COLORS.infoBg, color: COLORS.info,
                }}>
                    {getFornitoreLabel(v || row.categoria)}
                </span>
            ),
        },
        {
            key: 'nome', label: 'Nome',
            render: (v, row) => <strong>{v || row.ragioneSociale || '\u2014'}</strong>,
        },
        { key: 'referente', label: 'Referente', render: (v) => v || '\u2014' },
        { key: 'email', label: 'Email', render: (v) => v || '\u2014' },
        { key: 'telefono', label: 'Telefono', render: (v) => v || '\u2014' },
        {
            key: 'condizioni', label: 'Condizioni',
            render: (v, row) => v || row.condizioniPagamento || '\u2014',
        },
        {
            key: 'azioni', label: 'Azioni',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button
                        style={{ ...S.btnSmall, background: COLORS.accentLight, color: '#fff' }}
                        onClick={(e) => { e.stopPropagation(); openEditFor(row); }}
                    >
                        Modifica
                    </button>
                    <button
                        style={{ ...S.btnSmall, background: COLORS.danger, color: '#fff' }}
                        onClick={(e) => { e.stopPropagation(); handleDeleteFor(row.id); }}
                    >
                        Elimina
                    </button>
                </div>
            ),
        },
    ], [openEditFor, handleDeleteFor]);

    const campagneColumns = useMemo(() => [
        {
            key: 'tipo', label: 'Tipo',
            render: (v) => (
                <span style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
                    background: COLORS.warningBg, color: COLORS.warning,
                }}>
                    {getCampagnaLabel(v)}
                </span>
            ),
        },
        {
            key: 'nome', label: 'Nome',
            render: (v) => <strong>{v || '\u2014'}</strong>,
        },
        {
            key: 'dataInizio', label: 'Periodo',
            render: (v, row) => {
                const inizio = v ? formatDate(v) : '';
                const fine = row.dataFine ? formatDate(row.dataFine) : '';
                if (!inizio && !fine) return '\u2014';
                return `${inizio}${fine ? ' \u2013 ' + fine : ''}`;
            },
        },
        {
            key: 'budget', label: 'Budget',
            render: (v) => formatCurrency(v),
        },
        {
            key: 'speso', label: 'Speso',
            render: (v, row) => {
                const budget = parseFloat(row.budget) || 0;
                const speso = parseFloat(v) || 0;
                const perc = budget > 0 ? Math.min((speso / budget) * 100, 100) : 0;
                const barColor = perc > 90 ? COLORS.danger : perc > 70 ? COLORS.warning : COLORS.success;
                return (
                    <div style={{ minWidth: '100px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '3px' }}>
                            <span>{formatCurrency(speso)}</span>
                            <span style={{ color: COLORS.textMuted }}>{perc.toFixed(0)}%</span>
                        </div>
                        <div style={{
                            height: '6px', background: COLORS.borderLight, borderRadius: '3px', overflow: 'hidden',
                        }}>
                            <div style={{
                                height: '100%', width: `${perc}%`, background: barColor,
                                borderRadius: '3px', transition: 'width 0.3s',
                            }} />
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'stato', label: 'Stato',
            render: (v) => (
                <span style={getStatusStyle(v)}>
                    {getStatusLabel(v)}
                </span>
            ),
        },
        {
            key: 'azioni', label: 'Azioni',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button
                        style={{ ...S.btnSmall, background: COLORS.accentLight, color: '#fff' }}
                        onClick={(e) => { e.stopPropagation(); openEditCamp(row); }}
                    >
                        Modifica
                    </button>
                    <button
                        style={{ ...S.btnSmall, background: COLORS.danger, color: '#fff' }}
                        onClick={(e) => { e.stopPropagation(); handleDeleteCamp(row.id); }}
                    >
                        Elimina
                    </button>
                </div>
            ),
        },
    ], [openEditCamp, handleDeleteCamp]);


    // ══════════════════════════════════════════════
    // MODAL DETTAGLIO CLIENTE
    // ══════════════════════════════════════════════

    const renderDetailModal = () => {
        if (!detailCli) return null;
        const history = getClienteHistory(detailCli.id);
        const clienteName = detailCli.nome || detailCli.ragioneSociale || '\u2014';

        const infoFields = [
            { label: 'Tipo', value: getClienteIcon(detailCli.tipo) + ' ' + getClienteLabel(detailCli.tipo) },
            { label: 'Referente', value: detailCli.referente },
            { label: 'Email', value: detailCli.email },
            { label: 'Telefono', value: detailCli.telefono },
            { label: 'PEC', value: detailCli.pec },
            { label: 'P.IVA', value: detailCli.piva || detailCli.partitaIva },
            { label: 'Codice Fiscale', value: detailCli.codiceFiscale },
            { label: 'Codice SDI', value: detailCli.codiceSDI },
            { label: 'Indirizzo', value: [detailCli.indirizzo, detailCli.cap, detailCli.citta, detailCli.provincia].filter(Boolean).join(', ') },
            { label: 'Note', value: detailCli.note },
        ];

        return (
            <div style={S.modal} onClick={() => setDetailCli(null)}>
                <div
                    style={{
                        ...S.modalContent(isMobile),
                        width: isMobile ? '100%' : '700px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: '20px', paddingBottom: '14px', borderBottom: `1px solid ${COLORS.border}`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '28px' }}>{getClienteIcon(detailCli.tipo)}</span>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: COLORS.textPrimary, margin: 0 }}>
                                    {clienteName}
                                </h3>
                                <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>
                                    {getClienteLabel(detailCli.tipo)}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                style={S.btnPrimary}
                                onClick={() => openEditCli(detailCli)}
                                onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.accentLight; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.accent; }}
                            >
                                Modifica
                            </button>
                            <button
                                onClick={() => setDetailCli(null)}
                                style={{
                                    background: 'none', border: 'none', fontSize: '20px',
                                    color: COLORS.textMuted, cursor: 'pointer', padding: '4px 8px',
                                    borderRadius: '6px', lineHeight: 1,
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.dangerBg; e.currentTarget.style.color = COLORS.danger; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = COLORS.textMuted; }}
                            >
                                {'\u2715'}
                            </button>
                        </div>
                    </div>

                    {/* Info griglia */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                        gap: '12px', marginBottom: '20px',
                    }}>
                        {infoFields.map((f, i) => (
                            f.value ? (
                                <div key={i} style={{ padding: '8px 0' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '3px' }}>
                                        {f.label}
                                    </div>
                                    <div style={{ fontSize: '14px', color: COLORS.textPrimary, wordBreak: 'break-word' }}>
                                        {f.value}
                                    </div>
                                </div>
                            ) : null
                        ))}
                    </div>

                    {/* Storico Fatture */}
                    {history.fatture.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPrimary, margin: '0 0 10px', paddingTop: '12px', borderTop: `1px solid ${COLORS.border}` }}>
                                Ultime Fatture
                            </h4>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={S.table}>
                                    <thead>
                                        <tr>
                                            <th style={S.th}>Numero</th>
                                            <th style={S.th}>Data</th>
                                            <th style={S.th}>Totale</th>
                                            <th style={S.th}>Stato</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.fatture.map(f => (
                                            <tr key={f.id}>
                                                <td style={S.td}>{f.numero || '\u2014'}</td>
                                                <td style={S.td}>{formatDate(f.dataEmissione)}</td>
                                                <td style={S.td}>{formatCurrency(f.totale)}</td>
                                                <td style={S.td}>
                                                    <span style={getStatusStyle(f.stato)}>{getStatusLabel(f.stato)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Storico Ordini */}
                    {history.ordini.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPrimary, margin: '0 0 10px', paddingTop: '12px', borderTop: `1px solid ${COLORS.border}` }}>
                                Ultimi Ordini
                            </h4>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={S.table}>
                                    <thead>
                                        <tr>
                                            <th style={S.th}>Numero</th>
                                            <th style={S.th}>Data</th>
                                            <th style={S.th}>Totale</th>
                                            <th style={S.th}>Stato</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.ordini.map(o => (
                                            <tr key={o.id}>
                                                <td style={S.td}>{o.numero || '\u2014'}</td>
                                                <td style={S.td}>{formatDate(o.dataOrdine || o.data)}</td>
                                                <td style={S.td}>{formatCurrency(o.totale)}</td>
                                                <td style={S.td}>
                                                    <span style={getStatusStyle(o.stato)}>{getStatusLabel(o.stato)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Nessuno storico */}
                    {history.fatture.length === 0 && history.ordini.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: COLORS.textMuted, fontSize: '14px' }}>
                            Nessun documento collegato a questo cliente.
                        </div>
                    )}
                </div>
            </div>
        );
    };


    // ══════════════════════════════════════════════
    // LOADING STATE
    // ══════════════════════════════════════════════

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textMuted }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{''}</div>
                <div style={{ fontSize: '14px' }}>Caricamento dati...</div>
            </div>
        );
    }


    // ══════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════

    return (
        <div>
            {/* ── Header ───────────────────────────── */}
            <div style={S.pageHeader}>
                <h2 style={S.pageTitle}>Marketing & Clienti</h2>
                <p style={S.pageSubtitle}>Gestione CRM, fornitori e campagne marketing</p>
            </div>

            {/* ── Sub-tabs (pill buttons) ──────────── */}
            <div style={{
                display: 'flex', gap: '0', marginBottom: '20px',
                flexWrap: isMobile ? 'wrap' : 'nowrap',
            }}>
                {SUB_TABS.map((tab, idx) => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setSubTab(tab.key);
                            setDetailCli(null);
                        }}
                        style={{
                            padding: isMobile ? '10px 16px' : '10px 24px',
                            border: `1px solid ${COLORS.accent}`,
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '14px',
                            background: subTab === tab.key ? COLORS.accent : COLORS.card,
                            color: subTab === tab.key ? '#fff' : COLORS.accent,
                            borderRadius: idx === 0
                                ? '8px 0 0 8px'
                                : idx === SUB_TABS.length - 1
                                    ? '0 8px 8px 0'
                                    : '0',
                            transition: 'all 0.15s',
                            flex: isMobile ? 1 : 'none',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>


            {/* ══════════════════════════════════════ */}
            {/* TAB CLIENTI                           */}
            {/* ══════════════════════════════════════ */}
            {subTab === 'clienti' && (
                <div>
                    {/* KPI Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                        gap: '12px', marginBottom: '20px',
                    }}>
                        <GestionaleCard
                            icon={''}
                            label="Totale Clienti"
                            value={clientiStats.totale}
                            color={COLORS.accentLight}
                            isMobile={isMobile}
                        />
                        <GestionaleCard
                            icon={''}
                            label="Clienti Attivi"
                            subtitle="Con ordini negli ultimi 90 giorni"
                            value={clientiStats.attivi}
                            color={COLORS.success}
                            isMobile={isMobile}
                        />
                        <GestionaleCard
                            icon={''}
                            label="Fatturato Totale"
                            value={formatCurrency(clientiStats.fatturatoTotale)}
                            color={COLORS.warning}
                            isMobile={isMobile}
                        />
                    </div>

                    {/* Toolbar */}
                    <div style={S.toolbar}>
                        <input
                            style={S.searchInput}
                            placeholder="Cerca clienti per nome, email, P.IVA, citt\u00E0..."
                            value={searchCli}
                            onChange={(e) => setSearchCli(e.target.value)}
                        />
                        <select
                            style={S.select}
                            value={tipoCliFilter}
                            onChange={(e) => setTipoCliFilter(e.target.value)}
                        >
                            <option value="">Tutti i tipi</option>
                            {TIPI_CLIENTE.map(t => (
                                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                            ))}
                        </select>
                        <button
                            style={S.btnPrimary}
                            onClick={openNewCli}
                            onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.accentLight; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.accent; }}
                        >
                            {'\u2795'} Nuovo Cliente
                        </button>
                    </div>

                    {/* Table */}
                    <GestionaleTable
                        columns={clientiColumns}
                        data={filteredClienti}
                        isMobile={isMobile}
                        emptyMessage="Nessun cliente trovato"
                        emptyIcon={''}
                    />
                </div>
            )}


            {/* ══════════════════════════════════════ */}
            {/* TAB FORNITORI                         */}
            {/* ══════════════════════════════════════ */}
            {subTab === 'fornitori' && (
                <div>
                    {/* Toolbar */}
                    <div style={S.toolbar}>
                        <input
                            style={S.searchInput}
                            placeholder="Cerca fornitori per nome, email, referente..."
                            value={searchFor}
                            onChange={(e) => setSearchFor(e.target.value)}
                        />
                        <select
                            style={S.select}
                            value={tipoForFilter}
                            onChange={(e) => setTipoForFilter(e.target.value)}
                        >
                            <option value="">Tutti i tipi</option>
                            {TIPI_FORNITORE.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        <button
                            style={S.btnPrimary}
                            onClick={openNewFor}
                            onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.accentLight; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.accent; }}
                        >
                            {'\u2795'} Nuovo Fornitore
                        </button>
                    </div>

                    {/* Table */}
                    <GestionaleTable
                        columns={fornitoriColumns}
                        data={filteredFornitori}
                        isMobile={isMobile}
                        emptyMessage="Nessun fornitore trovato"
                        emptyIcon={''}
                    />
                </div>
            )}


            {/* ══════════════════════════════════════ */}
            {/* TAB CAMPAGNE                          */}
            {/* ══════════════════════════════════════ */}
            {subTab === 'campagne' && (
                <div>
                    {/* KPI Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                        gap: '12px', marginBottom: '20px',
                    }}>
                        <GestionaleCard
                            icon={''}
                            label="Campagne Attive"
                            value={campagneStats.attive}
                            color={COLORS.success}
                            isMobile={isMobile}
                        />
                        <GestionaleCard
                            icon={''}
                            label="Budget Totale"
                            value={formatCurrency(campagneStats.budgetTotale)}
                            color={COLORS.accentLight}
                            isMobile={isMobile}
                        />
                        <GestionaleCard
                            icon={''}
                            label="Speso Totale"
                            value={formatCurrency(campagneStats.spesoTotale)}
                            color={COLORS.warning}
                            isMobile={isMobile}
                        />
                        <GestionaleCard
                            icon={''}
                            label="ROI"
                            value={`${campagneStats.roi >= 0 ? '+' : ''}${campagneStats.roi.toFixed(1)}%`}
                            color={campagneStats.roi >= 0 ? COLORS.success : COLORS.danger}
                            isMobile={isMobile}
                        />
                    </div>

                    {/* Toolbar */}
                    <div style={S.toolbar}>
                        <input
                            style={S.searchInput}
                            placeholder="Cerca campagne per nome, tipo, target..."
                            value={searchCamp}
                            onChange={(e) => setSearchCamp(e.target.value)}
                        />
                        <select
                            style={S.select}
                            value={statoCampFilter}
                            onChange={(e) => setStatoCampFilter(e.target.value)}
                        >
                            <option value="">Tutti gli stati</option>
                            {STATI_CAMPAGNA.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                        <button
                            style={S.btnPrimary}
                            onClick={openNewCamp}
                            onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.accentLight; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.accent; }}
                        >
                            {'\u2795'} Nuova Campagna
                        </button>
                    </div>

                    {/* Table */}
                    <GestionaleTable
                        columns={campagneColumns}
                        data={filteredCampagne}
                        isMobile={isMobile}
                        emptyMessage="Nessuna campagna trovata"
                        emptyIcon={''}
                    />
                </div>
            )}


            {/* ══════════════════════════════════════ */}
            {/* MODALI                                */}
            {/* ══════════════════════════════════════ */}

            {/* Detail Cliente Modal */}
            {detailCli && renderDetailModal()}

            {/* Form Cliente Modal */}
            {showCliForm && (
                <GestionaleForm
                    title={editingCli ? 'Modifica Cliente' : 'Nuovo Cliente'}
                    fields={clienteFormFields}
                    values={cliForm}
                    onChange={(k, v) => setCliForm(prev => ({ ...prev, [k]: v }))}
                    onSubmit={handleSaveCli}
                    onCancel={() => setShowCliForm(false)}
                    submitLabel={editingCli ? 'Aggiorna' : 'Crea Cliente'}
                    isMobile={isMobile}
                />
            )}

            {/* Form Fornitore Modal */}
            {showForForm && (
                <GestionaleForm
                    title={editingFor ? 'Modifica Fornitore' : 'Nuovo Fornitore'}
                    fields={fornitoreFormFields}
                    values={forForm}
                    onChange={(k, v) => setForForm(prev => ({ ...prev, [k]: v }))}
                    onSubmit={handleSaveFor}
                    onCancel={() => setShowForForm(false)}
                    submitLabel={editingFor ? 'Aggiorna' : 'Crea Fornitore'}
                    isMobile={isMobile}
                />
            )}

            {/* Form Campagna Modal */}
            {showCampForm && (
                <GestionaleForm
                    title={editingCamp ? 'Modifica Campagna' : 'Nuova Campagna'}
                    fields={campagnaFormFields}
                    values={campForm}
                    onChange={(k, v) => setCampForm(prev => ({ ...prev, [k]: v }))}
                    onSubmit={handleSaveCamp}
                    onCancel={() => setShowCampForm(false)}
                    submitLabel={editingCamp ? 'Aggiorna' : 'Crea Campagna'}
                    isMobile={isMobile}
                />
            )}
        </div>
    );
}
