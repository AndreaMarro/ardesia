// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Dashboard Overview
// Pannello di controllo principale ERP
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { COLORS, S } from '../GestionaleStyles';
import { formatCurrency, formatDateTime, truncate } from '../shared/GestionaleUtils';
import { fattureService, ordiniService, prodottiService, dipendentiService, documentiService, clientiService, financeService, gestionaleAdmin } from '../GestionaleService';
import logger from '../../../../utils/logger';
import CashFlowChart from '../shared/charts/CashFlowChart';
import FatturatoChart from '../shared/charts/FatturatoChart';
import OrdiniPipelineChart from '../shared/charts/OrdiniPipelineChart';
import ClientiPieChart from '../shared/charts/ClientiPieChart';
import TopClientiChart from '../shared/charts/TopClientiChart';

// ── Icone attività ────────────────────────────
const ACTION_ICONS = {
    creazione: '',
    modifica: '',
    eliminazione: '',
    pagamento: '',
    stato: '',
    login: '',
    export: '',
    import: '',
    default: '',
};

function getActionIcon(action) {
    if (!action) return ACTION_ICONS.default;
    const key = Object.keys(ACTION_ICONS).find(k => action.toLowerCase().includes(k));
    return ACTION_ICONS[key] || ACTION_ICONS.default;
}

// ── KPI Card ──────────────────────────────────
function KPICard({ icon, label, value, subtext, color, isMobile, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: COLORS.card,
                borderRadius: '10px',
                border: `1px solid ${hovered ? color : COLORS.border}`,
                padding: isMobile ? '14px' : '18px',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s',
                boxShadow: hovered ? `0 4px 12px ${color}18` : 'none',
                minWidth: 0,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: `${color}14`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                }}>
                    {icon}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    {label}
                </span>
            </div>
            <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: COLORS.textPrimary, lineHeight: 1.1 }}>
                {value}
            </div>
            {subtext && (
                <div style={{ fontSize: '14px', color: COLORS.textMuted, marginTop: '4px' }}>
                    {subtext}
                </div>
            )}
        </div>
    );
}

// ── Alert Row ─────────────────────────────────
function AlertItem({ type, icon, text, count }) {
    return (
        <div style={S.alertBox(type)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>{icon}</span>
                <span style={{ fontWeight: '600' }}>{count}</span>
                <span>{text}</span>
            </div>
        </div>
    );
}

// ── Componente Principale ─────────────────────
export default function DashboardGestionale({ onNavigate, isMobile }) {
    const [kpis, setKpis] = useState({
        fatturatoMese: 0,
        fattureNonPagate: 0,
        ordiniInCorso: 0,
        prodottiSottoscorta: 0,
        scadenzeProssime: 0,
        dipendentiAttivi: 0,
    });
    const [alerts, setAlerts] = useState([]);
    const [recentLog, setRecentLog] = useState([]);
    const [chartData, setChartData] = useState({
        cashFlow: [], fatturato: [], ordiniPipeline: [], clientiTipo: [], topClienti: [],
    });
    const [loading, setLoading] = useState(true);

    // ── Caricamento dati ──────────────────────
    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [fatture, ordini, sottoscorta, scadenze, dipendenti, log, cashFlowRaw, clienti] = await Promise.all([
                fattureService.getAll().catch(() => []),
                ordiniService.getAll().catch(() => []),
                prodottiService.getAll().then(p => (p || []).filter(x => (x.giacenza || 0) <= (x.scorta_minima || 0) && x.attivo !== false)).catch(() => []),
                documentiService.getScadenzeImminenti(7).catch(() => []),
                dipendentiService.getAll().catch(() => []),
                gestionaleAdmin.getLog(),
                financeService.getCashFlow(12).catch(() => []),
                clientiService.getAll().catch(() => []),
            ]);

            // Calcolo fatturato mese corrente
            const now = new Date();
            const meseCorrente = now.getMonth();
            const annoCorrente = now.getFullYear();
            const fatturePagateMese = (fatture || []).filter(f => {
                if (f.stato !== 'pagata') return false;
                const d = new Date(f.dataPagamento || f.data);
                return d.getMonth() === meseCorrente && d.getFullYear() === annoCorrente;
            });
            const fatturatoMese = fatturePagateMese.reduce((sum, f) => sum + (f.totale || 0), 0);

            // Fatture non pagate (emessa, inviata, scaduta)
            const statiNonPagati = ['emessa', 'inviata', 'scaduta'];
            const fattureNonPagate = (fatture || []).filter(f => statiNonPagati.includes(f.stato));

            // Ordini in corso
            const statiInCorso = ['confermato', 'in_lavorazione', 'spedito'];
            const ordiniInCorso = (ordini || []).filter(o => statiInCorso.includes(o.stato));

            // Dipendenti attivi
            const dipendentiAttivi = (dipendenti || []).filter(d => d.stato === 'attivo');

            setKpis({
                fatturatoMese,
                fattureNonPagate: fattureNonPagate.length,
                ordiniInCorso: ordiniInCorso.length,
                prodottiSottoscorta: (sottoscorta || []).length,
                scadenzeProssime: (scadenze || []).length,
                dipendentiAttivi: dipendentiAttivi.length,
            });

            // ── Chart data building ──
            // Cash flow & fatturato
            const cashFlow = Array.isArray(cashFlowRaw) ? cashFlowRaw : [];
            const fatturaMensile = cashFlow.map(m => ({ mese: m.mese, fatturato: m.entrate || 0 }));

            // Ordini pipeline
            const ordiniStati = {};
            (ordini || []).forEach(o => {
                const s = o.stato || 'bozza';
                ordiniStati[s] = (ordiniStati[s] || 0) + 1;
            });
            const ordiniPipeline = Object.entries(ordiniStati).map(([stato, count]) => ({ stato, count }));

            // Clienti per tipo
            const clientiTipi = {};
            (clienti || []).forEach(c => {
                const t = c.tipo || 'altro';
                clientiTipi[t] = (clientiTipi[t] || 0) + 1;
            });
            const clientiTipo = Object.entries(clientiTipi).map(([name, value]) => ({ name, value }));

            // Top clienti per fatturato
            const clientiFatturato = {};
            (fatture || []).filter(f => f.stato === 'pagata').forEach(f => {
                const nome = f.cliente || 'Sconosciuto';
                clientiFatturato[nome] = (clientiFatturato[nome] || 0) + (f.totale || 0);
            });
            const topClienti = Object.entries(clientiFatturato)
                .map(([nome, fatturato]) => ({ nome, fatturato }))
                .sort((a, b) => b.fatturato - a.fatturato)
                .slice(0, 10);

            setChartData({ cashFlow, fatturato: fatturaMensile, ordiniPipeline, clientiTipo, topClienti });

            // Compilazione alerts
            const newAlerts = [];
            const fattureScadute = (fatture || []).filter(f => f.stato === 'scaduta');
            if (fattureScadute.length > 0) {
                newAlerts.push({
                    type: 'danger',
                    icon: '',
                    count: fattureScadute.length,
                    text: `fattur${fattureScadute.length === 1 ? 'a scaduta' : 'e scadute'} - intervento immediato richiesto`,
                });
            }
            if ((sottoscorta || []).length > 0) {
                newAlerts.push({
                    type: 'warning',
                    icon: '',
                    count: sottoscorta.length,
                    text: `prodott${sottoscorta.length === 1 ? 'o sottoscorta' : 'i sottoscorta'} - riordinare`,
                });
            }
            if ((scadenze || []).length > 0) {
                newAlerts.push({
                    type: 'warning',
                    icon: '',
                    count: scadenze.length,
                    text: `scadenz${scadenze.length === 1 ? 'a' : 'e'} nei prossimi 7 giorni`,
                });
            }
            setAlerts(newAlerts);

            // Ultimi 10 log
            const logEntries = (log || []).slice(0, 10);
            setRecentLog(logEntries);
        } catch (err) {
            logger.error('Errore caricamento dashboard:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // ── Stile griglia KPI ─────────────────────
    const kpiGridStyle = {
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
    };

    // ── Loading state ─────────────────────────
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textMuted }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}></div>
                <div style={{ fontSize: '14px' }}>Caricamento dashboard...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={S.pageHeader}>
                <h2 style={S.pageTitle}>Dashboard</h2>
                <p style={S.pageSubtitle}>Panoramica generale dell'azienda</p>
            </div>

            {/* KPI Cards */}
            <div style={kpiGridStyle}>
                <KPICard
                    icon=""
                    label="Fatturato Mese"
                    value={formatCurrency(kpis.fatturatoMese)}
                    subtext="Fatture pagate questo mese"
                    color={COLORS.success}
                    isMobile={isMobile}
                    onClick={() => onNavigate && onNavigate('fatture')}
                />
                <KPICard
                    icon=""
                    label="Fatture Non Pagate"
                    value={kpis.fattureNonPagate}
                    subtext="Emesse, inviate, scadute"
                    color={kpis.fattureNonPagate > 0 ? COLORS.danger : COLORS.info}
                    isMobile={isMobile}
                    onClick={() => onNavigate && onNavigate('fatture')}
                />
                <KPICard
                    icon=""
                    label="Ordini in Corso"
                    value={kpis.ordiniInCorso}
                    subtext="Confermati, in lavorazione, spediti"
                    color={COLORS.accentLight}
                    isMobile={isMobile}
                    onClick={() => onNavigate && onNavigate('ordini')}
                />
                <KPICard
                    icon=""
                    label="Prodotti Sottoscorta"
                    value={kpis.prodottiSottoscorta}
                    subtext="Da riordinare"
                    color={kpis.prodottiSottoscorta > 0 ? COLORS.warning : COLORS.success}
                    isMobile={isMobile}
                    onClick={() => onNavigate && onNavigate('magazzino')}
                />
                <KPICard
                    icon=""
                    label="Scadenze Prossime"
                    value={kpis.scadenzeProssime}
                    subtext="Entro 7 giorni"
                    color={kpis.scadenzeProssime > 0 ? COLORS.warning : COLORS.success}
                    isMobile={isMobile}
                    onClick={() => onNavigate && onNavigate('documenti')}
                />
                <KPICard
                    icon=""
                    label="Dipendenti Attivi"
                    value={kpis.dipendentiAttivi}
                    subtext="Personale operativo"
                    color={COLORS.success}
                    isMobile={isMobile}
                    onClick={() => onNavigate && onNavigate('dipendenti')}
                />
            </div>

            {/* Grafici */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '20px',
            }}>
                <CashFlowChart data={chartData.cashFlow} isMobile={isMobile} />
                <FatturatoChart data={chartData.fatturato} isMobile={isMobile} />
                <OrdiniPipelineChart data={chartData.ordiniPipeline} isMobile={isMobile} />
                <ClientiPieChart data={chartData.clientiTipo} isMobile={isMobile} />
                <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                    <TopClientiChart data={chartData.topClienti} isMobile={isMobile} />
                </div>
            </div>

            {/* Pannello Avvisi */}
            {alerts.length > 0 && (
                <div style={{ ...S.card, marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPrimary, marginBottom: '12px' }}>
                         Avvisi e Notifiche
                    </div>
                    {alerts.map((alert, idx) => (
                        <AlertItem key={idx} type={alert.type} icon={alert.icon} text={alert.text} count={alert.count} />
                    ))}
                </div>
            )}

            {/* Azioni Rapide */}
            <div style={{ ...S.card, marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPrimary, marginBottom: '14px' }}>
                     Azioni Rapide
                </div>
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '10px',
                }}>
                    <button
                        onClick={() => onNavigate && onNavigate('fatture')}
                        style={{
                            ...S.btnPrimary,
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                    >
                         Nuova Fattura
                    </button>
                    <button
                        onClick={() => onNavigate && onNavigate('ordini')}
                        style={{
                            ...S.btnPrimary,
                            background: 'var(--elab-hex-2563eb)',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                    >
                         Nuovo Ordine
                    </button>
                    <button
                        onClick={() => onNavigate && onNavigate('finanze')}
                        style={{
                            ...S.btnSecondary,
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                    >
                         Registra Movimento
                    </button>
                    <button
                        onClick={() => onNavigate && onNavigate('magazzino')}
                        style={{
                            ...S.btnSecondary,
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                    >
                         Verifica Magazzino
                    </button>
                </div>
            </div>

            {/* Attività Recente */}
            <div style={S.card}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPrimary, marginBottom: '14px' }}>
                     Attività Recente
                </div>
                {recentLog.length === 0 ? (
                    <div style={S.emptyState}>
                        <div style={S.emptyIcon}></div>
                        <div style={S.emptyText}>Nessuna attività registrata</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {recentLog.map((entry, idx) => (
                            <div
                                key={entry.id || idx}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    padding: '10px 0',
                                    borderBottom: idx < recentLog.length - 1 ? `1px solid ${COLORS.borderLight}` : 'none',
                                }}
                            >
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: COLORS.bg, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '14px', flexShrink: 0,
                                }}>
                                    {getActionIcon(entry.azione || entry.action)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textPrimary }}>
                                        {truncate(entry.azione || entry.action || 'Azione', 50)}
                                    </div>
                                    <div style={{ fontSize: '14px', color: COLORS.textMuted, marginTop: '2px' }}>
                                        {truncate(entry.dettagli || entry.details || '', 80)}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '14px', color: COLORS.textMuted, whiteSpace: 'nowrap', flexShrink: 0,
                                }}>
                                    {entry.timestamp ? formatDateTime(entry.timestamp) : '—'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
