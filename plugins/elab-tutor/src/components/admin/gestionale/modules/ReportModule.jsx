// ELAB Gestionale - Modulo Report PDF
// © Andrea Marro — 18 Febbraio 2026
// Genera e scarica report PDF: fatturato, clienti, magazzino, aging fatture
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';
import { COLORS, S } from '../GestionaleStyles';
import { fattureService, clientiService, prodottiService, gestionaleAdmin } from '../GestionaleService';
import ReportService from '../services/ReportService';
import logger from '../../../../utils/logger';

const REPORT_TYPES = [
    {
        id: 'fatturato_mensile',
        icon: '',
        title: 'Fatturato Mensile',
        description: 'Fatturato per mese con totali e conteggio fatture',
        needsDateRange: true,
    },
    {
        id: 'situazione_clienti',
        icon: '',
        title: 'Situazione Clienti',
        description: 'Fatturato, saldo e conteggio fatture per cliente',
        needsDateRange: true,
    },
    {
        id: 'magazzino',
        icon: '',
        title: 'Magazzino',
        description: 'Giacenze, prezzi e valore totale per prodotto',
        needsDateRange: false,
    },
    {
        id: 'aging_fatture',
        icon: '',
        title: 'Aging Fatture',
        description: 'Fatture scadute e in scadenza con giorni di ritardo',
        needsDateRange: false,
    },
];

export default function ReportModule({ isMobile }) {
    const [generating, setGenerating] = useState(null);
    const [dateRange, setDateRange] = useState({ da: '', a: '' });
    const [azienda, setAzienda] = useState(null);

    useEffect(() => {
        gestionaleAdmin.getImpostazioni()
            .then(data => setAzienda(data || {}))
            .catch(() => setAzienda({}));
    }, []);

    const handleGenerate = useCallback(async (tipo) => {
        setGenerating(tipo);
        try {
            // Fetch all needed data
            const [fatture, clienti, prodotti] = await Promise.all([
                fattureService.getAll().catch(() => []),
                clientiService.getAll().catch(() => []),
                prodottiService.getAll().catch(() => []),
            ]);

            // Build report data
            const data = ReportService.buildReportData(
                tipo,
                { fatture, clienti, prodotti },
                dateRange.da || dateRange.a ? dateRange : null
            );

            if (!data || data.length === 0) {
                logger.warn(`[Report] Nessun dato per report ${tipo}`);
                setGenerating(null);
                return;
            }

            // Generate PDF
            const blob = await ReportService.generatePDF(tipo, data, azienda, dateRange.da || dateRange.a ? dateRange : null);

            if (blob) {
                // Download
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `report_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                logger.info(`[Report] Download completato: ${tipo}`);
            }
        } catch (err) {
            logger.error(`[Report] Errore generazione ${tipo}:`, err);
        } finally {
            setGenerating(null);
        }
    }, [azienda, dateRange]);

    return (
        <div>
            {/* Header */}
            <div style={S.pageHeader}>
                <h2 style={S.pageTitle}>Report</h2>
                <p style={S.pageSubtitle}>Genera report PDF con i dati del gestionale</p>
            </div>

            {/* Date range picker */}
            <div style={{
                background: COLORS.card, borderRadius: '10px', border: `1px solid ${COLORS.border}`,
                padding: '16px', marginBottom: '20px', display: 'flex', gap: '16px',
                flexWrap: 'wrap', alignItems: 'center',
            }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textPrimary }}>
                    Periodo:
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label style={{ fontSize: '14px', color: COLORS.textSecondary }}>Da</label>
                    <input
                        type="date"
                        value={dateRange.da}
                        onChange={e => setDateRange(prev => ({ ...prev, da: e.target.value }))}
                        style={{ ...S.input, width: '160px', padding: '8px 10px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label style={{ fontSize: '14px', color: COLORS.textSecondary }}>A</label>
                    <input
                        type="date"
                        value={dateRange.a}
                        onChange={e => setDateRange(prev => ({ ...prev, a: e.target.value }))}
                        style={{ ...S.input, width: '160px', padding: '8px 10px' }}
                    />
                </div>
                {(dateRange.da || dateRange.a) && (
                    <button
                        onClick={() => setDateRange({ da: '', a: '' })}
                        style={{ ...S.btnSmall, background: COLORS.bg, color: COLORS.textSecondary }}
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Report cards grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px',
            }}>
                {REPORT_TYPES.map(report => {
                    const isGenerating = generating === report.id;
                    return (
                        <div
                            key={report.id}
                            style={{
                                background: COLORS.card, borderRadius: '10px',
                                border: `1px solid ${COLORS.border}`, padding: '20px',
                                display: 'flex', flexDirection: 'column', gap: '12px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '28px' }}>{report.icon}</span>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: COLORS.textPrimary }}>
                                        {report.title}
                                    </div>
                                    <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '2px' }}>
                                        {report.description}
                                    </div>
                                </div>
                            </div>

                            {!report.needsDateRange && (
                                <div style={{ fontSize: '14px', color: COLORS.textMuted, fontStyle: 'italic' }}>
                                    Il filtro periodo non si applica a questo report
                                </div>
                            )}

                            <button
                                onClick={() => handleGenerate(report.id)}
                                disabled={isGenerating || generating !== null}
                                style={{
                                    ...S.btnPrimary,
                                    opacity: (isGenerating || generating !== null) ? 0.6 : 1,
                                    cursor: (isGenerating || generating !== null) ? 'not-allowed' : 'pointer',
                                    minHeight: '44px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                }}
                            >
                                {isGenerating ? (
                                    <>
                                        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}></span>
                                        Generazione in corso...
                                    </>
                                ) : (
                                    'Genera PDF'
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Info note */}
            <div style={{
                marginTop: '20px', padding: '12px 16px', borderRadius: '8px',
                background: 'var(--elab-hex-f0f9ff)', border: '1px solid var(--elab-hex-bae6fd)',
                fontSize: '14px', color: 'var(--elab-hex-0369a1)',
            }}>
                I report vengono generati in formato PDF con intestazione azienda, watermark e numerazione pagine. I dati provengono dal database Notion in tempo reale.
            </div>
        </div>
    );
}
