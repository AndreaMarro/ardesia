// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Modulo Fatturazione
// Gestione completa fatture, note credito, proforma
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { COLORS, S, getStatusStyle, getStatusLabel } from '../GestionaleStyles';
import { formatCurrency, formatDate, exportToCSV, calcIVA, generateNumero, isOverdue, truncate } from '../shared/GestionaleUtils';
import { fattureService, gestionaleAdmin } from '../GestionaleService';
import GestionaleTable from '../shared/GestionaleTable';
import FatturaElettronicaService from '../services/FatturaElettronicaService';
import logger from '../../../../utils/logger';

// ── Riga vuota articolo ───────────────────────
const emptyLineItem = () => ({
    id: Date.now() + Math.random(),
    descrizione: '',
    quantita: 1,
    prezzoUnitario: 0,
    aliquotaIVA: 22,
});

// ── Calcolo totali riga ───────────────────────
function calcLineTotal(item) {
    const imponibile = (item.quantita || 0) * (item.prezzoUnitario || 0);
    const iva = calcIVA(imponibile, item.aliquotaIVA || 22);
    return { imponibile, iva, totale: imponibile + iva };
}

// ── Stato iniziale form ───────────────────────
const initialFormData = () => ({
    tipo: 'fattura',
    clienteNome: '',
    clientePIVA: '',
    data: new Date().toISOString().split('T')[0],
    dataScadenza: '',
    metodoPagamento: 'bonifico',
    note: '',
    righe: [emptyLineItem()],
});

// ── Mini Stats Card ───────────────────────────
function StatCard({ label, value, color, isMobile }) {
    return (
        <div style={{
            background: COLORS.card, borderRadius: '8px', border: `1px solid ${COLORS.border}`,
            padding: isMobile ? '10px 12px' : '14px 16px', flex: 1, minWidth: isMobile ? '45%' : '140px',
        }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: '4px' }}>
                {label}
            </div>
            <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: color || COLORS.textPrimary }}>
                {value}
            </div>
        </div>
    );
}

// ── Sub-tab SDI — Fatturazione Elettronica ────
function FatturazioneSDITab({ fatture, isMobile }) {
    const [xmlPreview, setXmlPreview] = useState(null);
    const [azienda, setAzienda] = useState(null);
    const [sdiRefresh, setSdiRefresh] = useState(0);

    // Carica dati azienda per XML
    useEffect(() => {
        gestionaleAdmin.getImpostazioni()
            .then(data => setAzienda(data || {}))
            .catch(() => setAzienda({}));
    }, []);

    // Genera XML per una fattura
    const handleGenerateXML = useCallback((fattura) => {
        if (!azienda) {
            logger.warn('[SDI] Dati azienda non caricati');
            return;
        }
        const xml = FatturaElettronicaService.generateXML(fattura, azienda);
        if (xml) {
            const validation = FatturaElettronicaService.validateXML(xml);
            if (!validation.valid) {
                logger.warn('[SDI] XML generato con warning:', validation.errors);
            }
            FatturaElettronicaService.setSdiStatus(fattura.id, 'xml_generato');
            setSdiRefresh(k => k + 1);
            setXmlPreview({ xml, fattura, validation });
        }
    }, [azienda]);

    // Scarica XML
    const handleDownloadXML = useCallback((fattura) => {
        if (!azienda) return;
        const xml = FatturaElettronicaService.generateXML(fattura, azienda);
        if (xml) {
            const filename = FatturaElettronicaService.generateFilename(azienda, fattura);
            FatturaElettronicaService.downloadXML(xml, filename);
        }
    }, [azienda]);

    // Solo fatture emesse/inviate/pagate (non bozze)
    const fattureSDI = useMemo(() => {
        return fatture
            .filter(f => f.stato !== 'bozza' && f.stato !== 'annullata')
            .map(f => ({
                ...f,
                statoSDI: FatturaElettronicaService.getSdiStatus(f.id),
            }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fatture, sdiRefresh]);

    const sdiColumns = useMemo(() => [
        { key: 'numero', label: 'N. Fattura', width: '120px' },
        { key: 'clienteNome', label: 'Cliente', render: (v) => truncate(v || '—', 25) },
        {
            key: 'totale', label: 'Importo', width: '110px',
            render: (v) => <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>{formatCurrency(v || 0)}</span>,
        },
        {
            key: 'statoSDI', label: 'Stato SDI', width: '140px',
            render: (val) => <span style={getStatusStyle(val)}>{getStatusLabel(val)}</span>,
        },
        {
            key: 'azioni_sdi', label: 'Azioni', width: '240px',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleGenerateXML(row); }}
                        style={{ ...S.btnSmall, background: 'var(--elab-hex-dbeafe)', color: 'var(--elab-hex-1d4ed8)' }}
                    >
                        Genera XML
                    </button>
                    {row.statoSDI !== 'bozza_locale' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDownloadXML(row); }}
                            style={{ ...S.btnSmall, background: 'var(--elab-hex-e0e7ff)', color: 'var(--elab-hex-4338ca)' }}
                        >
                            Scarica
                        </button>
                    )}
                    {row.statoSDI !== 'bozza_locale' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!azienda) return;
                                const xml = FatturaElettronicaService.generateXML(row, azienda);
                                if (xml) {
                                    const validation = FatturaElettronicaService.validateXML(xml);
                                    setXmlPreview({ xml, fattura: row, validation });
                                }
                            }}
                            style={{ ...S.btnSmall, background: COLORS.bg, color: COLORS.textSecondary }}
                        >
                            Visualizza
                        </button>
                    )}
                </div>
            ),
        },
    ], [handleGenerateXML, handleDownloadXML, azienda]);

    return (
        <div>
            {/* Info banner */}
            <div style={{
                background: 'var(--elab-hex-fef3c7)', borderRadius: '8px', padding: '12px 16px',
                marginBottom: '16px', border: '1px solid var(--elab-hex-fcd34d)', fontSize: '14px', color: 'var(--elab-hex-92400e)',
            }}>
                La generazione XML FatturaPA avviene in locale. L'invio reale al SDI richiede un provider certificato (Aruba PEC, TeamSystem, Zucchetti) configurabile in Impostazioni.
            </div>

            <GestionaleTable
                columns={sdiColumns}
                data={fattureSDI}
                isMobile={isMobile}
                emptyMessage="Nessuna fattura emessa per la fatturazione elettronica"
                emptyIcon=""
            />

            {/* Modal Preview XML */}
            {xmlPreview && (
                <div style={S.modal} onClick={() => setXmlPreview(null)}>
                    <div
                        style={{ ...S.modalContent(isMobile), maxWidth: '800px', width: isMobile ? '100%' : '90%' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ ...S.modalTitle, margin: 0 }}>
                                XML FatturaPA — {xmlPreview.fattura.numero}
                            </h3>
                            <button
                                onClick={() => setXmlPreview(null)}
                                style={{ ...S.btnSmall, background: COLORS.bg, color: COLORS.textSecondary, fontSize: '18px', padding: '4px 10px' }}
                            >
                                x
                            </button>
                        </div>

                        {/* Validation badge */}
                        {xmlPreview.validation && (
                            <div style={{
                                marginBottom: '10px', padding: '8px 12px', borderRadius: '6px', fontSize: '14px',
                                background: xmlPreview.validation.valid ? 'var(--elab-hex-d1fae5)' : 'var(--elab-hex-fee2e2)',
                                color: xmlPreview.validation.valid ? 'var(--elab-hex-065f46)' : 'var(--elab-hex-991b1b)',
                            }}>
                                {xmlPreview.validation.valid
                                    ? 'Validazione OK — XML conforme alla struttura FatturaPA'
                                    : `Errori: ${xmlPreview.validation.errors.join(', ')}`
                                }
                            </div>
                        )}

                        {/* XML content */}
                        <pre style={{
                            background: 'var(--elab-hex-1e293b)', color: 'var(--elab-hex-e2e8f0)', padding: '16px',
                            borderRadius: '8px', overflow: 'auto', maxHeight: '400px',
                            fontSize: '14px', fontFamily: 'Fira Code, monospace', lineHeight: '1.5',
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}>
                            {xmlPreview.xml}
                        </pre>

                        <div style={{ ...S.modalActions, marginTop: '12px' }}>
                            <button style={S.btnSecondary} onClick={() => setXmlPreview(null)}>
                                Chiudi
                            </button>
                            <button
                                style={S.btnPrimary}
                                onClick={() => {
                                    const filename = FatturaElettronicaService.generateFilename(azienda || {}, xmlPreview.fattura);
                                    FatturaElettronicaService.downloadXML(xmlPreview.xml, filename);
                                }}
                            >
                                Scarica XML
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Componente Principale ─────────────────────
export default function FatturazioneModule({ isMobile }) {
    const [activeSubTab, setActiveSubTab] = useState('fatture');
    const [fatture, setFatture] = useState([]);
    const [search, setSearch] = useState('');
    const [filtroStato, setFiltroStato] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialFormData());
    const [showPayment, setShowPayment] = useState(null);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(true);

    // ── Caricamento dati ──────────────────────
    const loadFatture = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fattureService.getAll();
            setFatture(data || []);
        } catch (err) {
            logger.error('Errore caricamento fatture:', err);
            setFatture([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFatture();
    }, [loadFatture, refreshKey]);

    const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

    // ── Filtri ────────────────────────────────
    const filtered = useMemo(() => {
        return fatture.filter(f => {
            const matchSearch = !search || [f.numero, f.clienteNome, f.note]
                .filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase());
            const matchStato = !filtroStato || f.stato === filtroStato;
            return matchSearch && matchStato;
        });
    }, [fatture, search, filtroStato]);

    // ── Statistiche ───────────────────────────
    const stats = useMemo(() => {
        const totaleFatturato = fatture.filter(f => f.stato === 'pagata').reduce((s, f) => s + (f.totale || 0), 0);
        const nonPagate = fatture.filter(f => ['emessa', 'inviata', 'scaduta'].includes(f.stato));
        const totaleFatture = fatture.reduce((s, f) => s + (f.totale || 0), 0);
        const media = fatture.length > 0 ? totaleFatture / fatture.length : 0;
        const now = new Date();
        const questoMese = fatture.filter(f => {
            const d = new Date(f.data);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        return { totaleFatturato, nonPagate: nonPagate.length, media, questoMese };
    }, [fatture]);

    // ── Calcolo totali form ───────────────────
    const formTotals = useMemo(() => {
        const righe = formData.righe || [];
        let subtotale = 0;
        let totaleIVA = 0;
        righe.forEach(r => {
            const { imponibile, iva } = calcLineTotal(r);
            subtotale += imponibile;
            totaleIVA += iva;
        });
        return { subtotale, totaleIVA, totale: subtotale + totaleIVA };
    }, [formData.righe]);

    // ── Apertura form ─────────────────────────
    const openCreate = useCallback(() => {
        setEditingId(null);
        setFormData({ ...initialFormData(), numero: generateNumero('FT') });
        setShowForm(true);
    }, []);

    const openEdit = useCallback((fattura) => {
        setEditingId(fattura.id);
        setFormData({
            tipo: fattura.tipo || 'fattura',
            clienteNome: fattura.clienteNome || '',
            clientePIVA: fattura.clientePIVA || '',
            data: fattura.data || '',
            dataScadenza: fattura.dataScadenza || '',
            metodoPagamento: fattura.metodoPagamento || 'bonifico',
            note: fattura.note || '',
            righe: fattura.righe && fattura.righe.length > 0 ? fattura.righe : [emptyLineItem()],
        });
        setShowForm(true);
    }, []);

    // ── Salvataggio ───────────────────────────
    const handleSave = useCallback(async () => {
        if (!formData.clienteNome.trim()) return;
        const righe = (formData.righe || []).filter(r => r.descrizione.trim());
        const subtotale = righe.reduce((s, r) => s + (r.quantita || 0) * (r.prezzoUnitario || 0), 0);
        const totaleIVA = righe.reduce((s, r) => s + calcIVA((r.quantita || 0) * (r.prezzoUnitario || 0), r.aliquotaIVA || 22), 0);

        const payload = {
            ...formData,
            righe,
            subtotale,
            totaleIVA,
            totale: subtotale + totaleIVA,
            stato: editingId ? undefined : 'bozza',
        };

        try {
            if (editingId) {
                await fattureService.update(editingId, payload);
            } else {
                await fattureService.create(payload);
            }
            setShowForm(false);
            setEditingId(null);
            refresh();
        } catch (err) {
            logger.error('Errore salvataggio fattura:', err);
        }
    }, [formData, editingId, refresh]);

    // ── Cambio stato ──────────────────────────
    const handleChangeStato = useCallback(async (id, nuovoStato) => {
        try {
            await fattureService.update(id, { stato: nuovoStato });
            refresh();
        } catch (err) {
            logger.error('Errore cambio stato:', err);
        }
    }, [refresh]);

    // ── Registra pagamento ────────────────────
    const handlePayment = useCallback(async () => {
        if (!showPayment) return;
        try {
            await fattureService.update(showPayment, { stato: 'pagata', dataPagamento: paymentDate });
            setShowPayment(null);
            refresh();
        } catch (err) {
            logger.error('Errore registrazione pagamento:', err);
        }
    }, [showPayment, paymentDate, refresh]);

    // ── Elimina ───────────────────────────────
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Eliminare questa fattura?')) return;
        try {
            await fattureService.delete(id);
            refresh();
        } catch (err) {
            logger.error('Errore eliminazione fattura:', err);
        }
    }, [refresh]);

    // ── Aggiorna campo form ───────────────────
    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // ── Gestione righe ────────────────────────
    const addRow = useCallback(() => {
        setFormData(prev => ({ ...prev, righe: [...prev.righe, emptyLineItem()] }));
    }, []);

    const removeRow = useCallback((idx) => {
        setFormData(prev => ({
            ...prev,
            righe: prev.righe.length > 1 ? prev.righe.filter((_, i) => i !== idx) : prev.righe,
        }));
    }, []);

    const updateRow = useCallback((idx, field, value) => {
        setFormData(prev => ({
            ...prev,
            righe: prev.righe.map((r, i) => i === idx ? { ...r, [field]: value } : r),
        }));
    }, []);

    // ── Esporta ───────────────────────────────
    const handleExport = useCallback(() => {
        exportToCSV(filtered, 'fatture_export');
    }, [filtered]);

    // ── Stato macchina transizioni ────────────
    const nextStato = { bozza: 'emessa', emessa: 'inviata', inviata: 'pagata' };

    // ── Colonne tabella ───────────────────────
    const columns = useMemo(() => [
        { key: 'numero', label: 'Numero', width: '120px' },
        {
            key: 'data', label: 'Data', width: '100px',
            render: (val) => formatDate(val),
        },
        {
            key: 'clienteNome', label: 'Cliente',
            render: (val) => truncate(val || '—', 30),
        },
        {
            key: 'totale', label: 'Totale', width: '110px',
            render: (val) => (
                <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>
                    {formatCurrency(val || 0)}
                </span>
            ),
        },
        {
            key: 'stato', label: 'Stato', width: '110px',
            render: (val) => (
                <span style={getStatusStyle(val)}>{getStatusLabel(val)}</span>
            ),
        },
        {
            key: 'dataScadenza', label: 'Scadenza', width: '100px',
            render: (val, row) => {
                if (!val) return '—';
                const overdue = isOverdue(val) && row.stato !== 'pagata' && row.stato !== 'annullata';
                return (
                    <span style={{ color: overdue ? COLORS.danger : COLORS.textPrimary, fontWeight: overdue ? '700' : '400' }}>
                        {formatDate(val)}
                    </span>
                );
            },
        },
        {
            key: 'azioni', label: 'Azioni', width: '200px',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); openEdit(row); }}
                        style={{ ...S.btnSmall, background: COLORS.accentBg, color: COLORS.accentLight }}
                    >
                        Modifica
                    </button>
                    {nextStato[row.stato] && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleChangeStato(row.id, nextStato[row.stato]); }}
                            style={{ ...S.btnSmall, background: COLORS.successBg, color: COLORS.success }}
                        >
                            {getStatusLabel(nextStato[row.stato])}
                        </button>
                    )}
                    {row.stato !== 'pagata' && row.stato !== 'annullata' && row.stato !== 'bozza' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowPayment(row.id); setPaymentDate(new Date().toISOString().split('T')[0]); }}
                            style={{ ...S.btnSmall, background: 'var(--elab-hex-d1fae5)', color: COLORS.success }}
                        >
                            Paga
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
                        style={{ ...S.btnSmall, background: COLORS.dangerBg, color: COLORS.danger }}
                    >
                        Elimina
                    </button>
                </div>
            ),
        },
    ], [openEdit, handleChangeStato, handleDelete]);

    // ── Loading ───────────────────────────────
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textMuted }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}></div>
                <div style={{ fontSize: '14px' }}>Caricamento fatture...</div>
            </div>
        );
    }

    // Sub-tab bar styles
    const subTabStyle = (isActive) => ({
        padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: isActive ? '700' : '500',
        color: isActive ? COLORS.accent : COLORS.textSecondary,
        borderBottom: isActive ? `3px solid ${COLORS.accent}` : '3px solid transparent',
        background: 'transparent', border: 'none', transition: 'all 0.2s',
        minHeight: '44px',
    });

    return (
        <div>
            {/* Header */}
            <div style={S.pageHeader}>
                <h2 style={S.pageTitle}>Fatturazione</h2>
                <p style={S.pageSubtitle}>Gestione fatture, note di credito e fatturazione elettronica</p>
            </div>

            {/* Sub-tab bar */}
            <div style={{
                display: 'flex', gap: '4px', borderBottom: `1px solid ${COLORS.border}`,
                marginBottom: '16px', background: COLORS.card, borderRadius: '8px 8px 0 0',
                padding: '0 8px',
            }}>
                <button style={subTabStyle(activeSubTab === 'fatture')} onClick={() => setActiveSubTab('fatture')}>
                    Fatture
                </button>
                <button style={subTabStyle(activeSubTab === 'sdi')} onClick={() => setActiveSubTab('sdi')}>
                    Fattura Elettronica SDI
                </button>
            </div>

            {/* SDI sub-tab */}
            {activeSubTab === 'sdi' && (
                <FatturazioneSDITab fatture={fatture} isMobile={isMobile} />
            )}

            {/* Fatture sub-tab */}
            {activeSubTab === 'fatture' && <>

            {/* Toolbar */}
            <div style={S.toolbar}>
                <input
                    style={S.searchInput}
                    placeholder="Cerca per numero, cliente, note..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select
                    style={S.select}
                    value={filtroStato}
                    onChange={e => setFiltroStato(e.target.value)}
                >
                    <option value="">Tutti gli stati</option>
                    <option value="bozza">Bozza</option>
                    <option value="emessa">Emessa</option>
                    <option value="inviata">Inviata</option>
                    <option value="pagata">Pagata</option>
                    <option value="scaduta">Scaduta</option>
                    <option value="annullata">Annullata</option>
                </select>
                <button style={S.btnPrimary} onClick={openCreate}>
                    + Nuova Fattura
                </button>
                <button style={S.btnSecondary} onClick={handleExport}>
                     Esporta
                </button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <StatCard label="Totale Fatturato" value={formatCurrency(stats.totaleFatturato)} color={COLORS.success} isMobile={isMobile} />
                <StatCard label="Non Pagate" value={stats.nonPagate} color={stats.nonPagate > 0 ? COLORS.danger : COLORS.textPrimary} isMobile={isMobile} />
                <StatCard label="Media Fattura" value={formatCurrency(stats.media)} color={COLORS.accentLight} isMobile={isMobile} />
                <StatCard label="Questo Mese" value={stats.questoMese} color={COLORS.info} isMobile={isMobile} />
            </div>

            {/* Tabella Fatture */}
            <GestionaleTable
                columns={columns}
                data={filtered}
                isMobile={isMobile}
                emptyMessage="Nessuna fattura trovata"
                emptyIcon=""
            />

            {/* ── Modal Crea/Modifica ────────── */}
            {showForm && (
                <div style={S.modal} onClick={() => setShowForm(false)}>
                    <div style={S.modalContent(isMobile)} onClick={e => e.stopPropagation()}>
                        <h3 style={S.modalTitle}>
                            {editingId ? 'Modifica Fattura' : 'Nuova Fattura'}
                        </h3>

                        {/* Campi principali */}
                        <div style={S.formGrid(isMobile)}>
                            <div style={S.formGroup}>
                                <label style={S.label}>Tipo</label>
                                <select style={S.input} value={formData.tipo} onChange={e => updateField('tipo', e.target.value)}>
                                    <option value="fattura">Fattura</option>
                                    <option value="nota_credito">Nota di Credito</option>
                                    <option value="proforma">Proforma</option>
                                </select>
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>Cliente</label>
                                <input style={S.input} value={formData.clienteNome} onChange={e => updateField('clienteNome', e.target.value)} placeholder="Ragione sociale" />
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>P.IVA Cliente</label>
                                <input style={S.input} value={formData.clientePIVA} onChange={e => updateField('clientePIVA', e.target.value)} placeholder="IT00000000000" />
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>Data</label>
                                <input style={S.input} type="date" value={formData.data} onChange={e => updateField('data', e.target.value)} />
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>Scadenza</label>
                                <input style={S.input} type="date" value={formData.dataScadenza} onChange={e => updateField('dataScadenza', e.target.value)} />
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>Metodo Pagamento</label>
                                <select style={S.input} value={formData.metodoPagamento} onChange={e => updateField('metodoPagamento', e.target.value)}>
                                    <option value="bonifico">Bonifico Bancario</option>
                                    <option value="contanti">Contanti</option>
                                    <option value="carta">Carta di Credito</option>
                                    <option value="assegno">Assegno</option>
                                    <option value="riba">Ri.Ba.</option>
                                </select>
                            </div>
                        </div>

                        <div style={S.formGroup}>
                            <label style={S.label}>Note</label>
                            <textarea
                                style={{ ...S.input, minHeight: '60px', resize: 'vertical' }}
                                value={formData.note}
                                onChange={e => updateField('note', e.target.value)}
                                placeholder="Note aggiuntive..."
                            />
                        </div>

                        {/* Sezione righe articoli */}
                        <div style={S.divider} />
                        <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPrimary, marginBottom: '10px' }}>
                            Righe Fattura
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ ...S.table, minWidth: '580px' }}>
                                <thead>
                                    <tr>
                                        {['Descrizione', 'Qty', 'Prezzo Unit.', 'IVA %', 'Totale', ''].map((h, i) => (
                                            <th key={i} style={{
                                                padding: '8px 10px', background: COLORS.bg, color: COLORS.textSecondary,
                                                fontSize: '14px', fontWeight: '700', textTransform: 'uppercase',
                                                textAlign: 'left', borderBottom: `2px solid ${COLORS.border}`,
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.righe.map((riga, idx) => {
                                        const { totale: rigaTotale } = calcLineTotal(riga);
                                        return (
                                            <tr key={riga.id || idx}>
                                                <td style={{ padding: '6px 4px' }}>
                                                    <input
                                                        style={{ ...S.input, fontSize: '14px', padding: '7px 8px' }}
                                                        value={riga.descrizione}
                                                        onChange={e => updateRow(idx, 'descrizione', e.target.value)}
                                                        placeholder="Descrizione articolo"
                                                    />
                                                </td>
                                                <td style={{ padding: '6px 4px', width: '70px' }}>
                                                    <input
                                                        style={{ ...S.input, fontSize: '14px', padding: '7px 8px', textAlign: 'right' }}
                                                        type="number"
                                                        min="0"
                                                        value={riga.quantita}
                                                        onChange={e => updateRow(idx, 'quantita', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td style={{ padding: '6px 4px', width: '100px' }}>
                                                    <input
                                                        style={{ ...S.input, fontSize: '14px', padding: '7px 8px', textAlign: 'right' }}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={riga.prezzoUnitario}
                                                        onChange={e => updateRow(idx, 'prezzoUnitario', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td style={{ padding: '6px 4px', width: '80px' }}>
                                                    <select
                                                        style={{ ...S.input, fontSize: '14px', padding: '7px 8px' }}
                                                        value={riga.aliquotaIVA}
                                                        onChange={e => updateRow(idx, 'aliquotaIVA', parseFloat(e.target.value))}
                                                    >
                                                        <option value={22}>22%</option>
                                                        <option value={10}>10%</option>
                                                        <option value={4}>4%</option>
                                                        <option value={0}>0%</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: '6px 10px', fontSize: '14px', fontWeight: '700', fontFamily: 'monospace', whiteSpace: 'nowrap', textAlign: 'right' }}>
                                                    {formatCurrency(rigaTotale)}
                                                </td>
                                                <td style={{ padding: '6px 4px', width: '36px' }}>
                                                    <button
                                                        onClick={() => removeRow(idx)}
                                                        style={{
                                                            ...S.btnSmall, background: COLORS.dangerBg, color: COLORS.danger,
                                                            padding: '4px 8px', fontSize: '14px', lineHeight: 1,
                                                        }}
                                                        title="Rimuovi riga"
                                                    >
                                                        ×
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <button onClick={addRow} style={{ ...S.btnSecondary, marginTop: '8px', fontSize: '14px', padding: '6px 14px' }}>
                            + Aggiungi Riga
                        </button>

                        {/* Totali */}
                        <div style={{
                            marginTop: '16px', display: 'flex', justifyContent: 'flex-end',
                        }}>
                            <div style={{
                                background: COLORS.bg, borderRadius: '8px', padding: '12px 16px',
                                minWidth: '200px', border: `1px solid ${COLORS.border}`,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', color: COLORS.textSecondary }}>
                                    <span>Subtotale:</span>
                                    <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{formatCurrency(formTotals.subtotale)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', color: COLORS.textSecondary }}>
                                    <span>IVA:</span>
                                    <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{formatCurrency(formTotals.totaleIVA)}</span>
                                </div>
                                <div style={{ height: '1px', background: COLORS.border, margin: '6px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', color: COLORS.textPrimary }}>
                                    <span>Totale:</span>
                                    <span style={{ fontFamily: 'monospace' }}>{formatCurrency(formTotals.totale)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Azioni modal */}
                        <div style={S.modalActions}>
                            <button style={S.btnSecondary} onClick={() => setShowForm(false)}>
                                Annulla
                            </button>
                            <button style={S.btnPrimary} onClick={handleSave}>
                                {editingId ? 'Salva Modifiche' : 'Crea Fattura'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Pagamento ──────────── */}
            {showPayment && (
                <div style={S.modal} onClick={() => setShowPayment(null)}>
                    <div style={{ ...S.modalContent(isMobile), width: isMobile ? '100%' : '380px' }} onClick={e => e.stopPropagation()}>
                        <h3 style={S.modalTitle}>Registra Pagamento</h3>
                        <div style={S.formGroup}>
                            <label style={S.label}>Data Pagamento</label>
                            <input
                                style={S.input}
                                type="date"
                                value={paymentDate}
                                onChange={e => setPaymentDate(e.target.value)}
                            />
                        </div>
                        <p style={{ fontSize: '14px', color: COLORS.textSecondary, margin: '0 0 10px' }}>
                            Confermando, la fattura verrà contrassegnata come pagata alla data indicata.
                        </p>
                        <div style={S.modalActions}>
                            <button style={S.btnSecondary} onClick={() => setShowPayment(null)}>
                                Annulla
                            </button>
                            <button style={S.btnSuccess} onClick={handlePayment}>
                                Conferma Pagamento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            </>}
        </div>
    );
}
