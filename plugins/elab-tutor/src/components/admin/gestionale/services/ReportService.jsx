// ELAB Gestionale - Servizio Generazione Report PDF
// © Andrea Marro — 18 Febbraio 2026
// @react-pdf/renderer loaded on-demand (code-split) — only when user generates PDF
// ============================================================

import React from 'react';
import logger from '../../../../utils/logger';

// Andrea Marro — 18/02/2026
// Dynamic import: @react-pdf/renderer (~800KB) loaded only on first PDF generation
let _pdfModule = null;
async function loadPdfRenderer() {
    if (!_pdfModule) {
        _pdfModule = await import('@react-pdf/renderer');
    }
    return _pdfModule;
}

// Styles are created lazily after import
let s = null;
function getStyles() {
    if (s) return s;
    const { StyleSheet } = _pdfModule;
    s = StyleSheet.create({
        page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: 'var(--elab-hex-1e293b)' },
        header: { marginBottom: 20 },
        title: { fontSize: 18, fontWeight: 'bold', color: 'var(--elab-navy)', marginBottom: 4 },
        subtitle: { fontSize: 10, color: 'var(--elab-hex-64748b)', marginBottom: 2 },
        divider: { height: 2, backgroundColor: 'var(--elab-navy)', marginVertical: 10 },
        tableHeader: { flexDirection: 'row', backgroundColor: 'var(--elab-hex-f1f5f9)', borderBottomWidth: 1, borderColor: 'var(--elab-hex-cbd5e1)', paddingVertical: 6, paddingHorizontal: 4 },
        tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: 'var(--elab-hex-e2e8f0)', paddingVertical: 5, paddingHorizontal: 4 },
        cellHeader: { fontSize: 9, fontWeight: 'bold', color: 'var(--elab-hex-475569)', textTransform: 'uppercase' },
        cell: { fontSize: 10, color: 'var(--elab-hex-1e293b)' },
        cellRight: { fontSize: 10, color: 'var(--elab-hex-1e293b)', textAlign: 'right' },
        summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 4 },
        summaryLabel: { fontSize: 11, fontWeight: 'bold', color: 'var(--elab-navy)' },
        summaryValue: { fontSize: 11, fontWeight: 'bold', color: 'var(--elab-navy)' },
        footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: 'var(--elab-hex-94a3b8)' },
        watermark: { position: 'absolute', bottom: 20, right: 40, fontSize: 8, color: 'var(--elab-hex-cbd5e1)' },
    });
    return s;
}

const formatEUR = (n) => `€ ${(n || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('it-IT') : '—';

// ── Header PDF ─────────────────────────────────
function ReportHeader({ P, azienda, titoloReport, dateRange }) {
    const st = getStyles();
    const oggi = new Date().toLocaleDateString('it-IT');
    return (
        <P.View style={st.header}>
            <P.Text style={st.title}>{azienda?.ragioneSociale || 'ELAB S.r.l.'}</P.Text>
            <P.Text style={st.subtitle}>P.IVA: {azienda?.piva || 'N/A'} — {azienda?.indirizzo || ''}, {azienda?.citta || ''}</P.Text>
            <P.View style={st.divider} />
            <P.Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>{titoloReport}</P.Text>
            {dateRange && (
                <P.Text style={st.subtitle}>Periodo: {dateRange.da || 'inizio'} — {dateRange.a || oggi}</P.Text>
            )}
            <P.Text style={st.subtitle}>Generato il {oggi}</P.Text>
        </P.View>
    );
}

// ── Footer PDF ─────────────────────────────────
function ReportFooter({ P }) {
    const st = getStyles();
    return (
        <P.View style={st.footer} fixed>
            <P.Text render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} / ${totalPages}`} />
            <P.Text style={st.watermark}>Andrea Marro — {new Date().toLocaleDateString('it-IT')}</P.Text>
        </P.View>
    );
}

// ── Report: Fatturato Mensile ──────────────────
function FatturatoDocument({ P, data, azienda, dateRange }) {
    const st = getStyles();
    const totale = data.reduce((sum, r) => sum + (r.importo || 0), 0);
    return (
        <P.Document>
            <P.Page size="A4" style={st.page}>
                <ReportHeader P={P} azienda={azienda} titoloReport="Report Fatturato Mensile" dateRange={dateRange} />
                <P.View style={st.tableHeader}>
                    <P.Text style={[st.cellHeader, { width: '50%' }]}>Mese</P.Text>
                    <P.Text style={[st.cellHeader, { width: '25%', textAlign: 'right' }]}>N. Fatture</P.Text>
                    <P.Text style={[st.cellHeader, { width: '25%', textAlign: 'right' }]}>Importo</P.Text>
                </P.View>
                {data.map((row, i) => (
                    <P.View key={i} style={st.tableRow}>
                        <P.Text style={[st.cell, { width: '50%' }]}>{row.mese}</P.Text>
                        <P.Text style={[st.cellRight, { width: '25%' }]}>{row.count || 0}</P.Text>
                        <P.Text style={[st.cellRight, { width: '25%' }]}>{formatEUR(row.importo)}</P.Text>
                    </P.View>
                ))}
                <P.View style={[st.divider, { marginTop: 10 }]} />
                <P.View style={st.summaryRow}>
                    <P.Text style={st.summaryLabel}>TOTALE</P.Text>
                    <P.Text style={st.summaryValue}>{formatEUR(totale)}</P.Text>
                </P.View>
                <ReportFooter P={P} />
            </P.Page>
        </P.Document>
    );
}

// ── Report: Situazione Clienti ─────────────────
function ClientiDocument({ P, data, azienda, dateRange }) {
    const st = getStyles();
    const totaleFatturato = data.reduce((sum, r) => sum + (r.fatturato || 0), 0);
    return (
        <P.Document>
            <P.Page size="A4" style={st.page}>
                <ReportHeader P={P} azienda={azienda} titoloReport="Situazione Clienti" dateRange={dateRange} />
                <P.View style={st.tableHeader}>
                    <P.Text style={[st.cellHeader, { width: '40%' }]}>Cliente</P.Text>
                    <P.Text style={[st.cellHeader, { width: '20%', textAlign: 'right' }]}>N. Fatture</P.Text>
                    <P.Text style={[st.cellHeader, { width: '20%', textAlign: 'right' }]}>Fatturato</P.Text>
                    <P.Text style={[st.cellHeader, { width: '20%', textAlign: 'right' }]}>Saldo</P.Text>
                </P.View>
                {data.map((row, i) => (
                    <P.View key={i} style={st.tableRow}>
                        <P.Text style={[st.cell, { width: '40%' }]}>{row.nome}</P.Text>
                        <P.Text style={[st.cellRight, { width: '20%' }]}>{row.numFatture || 0}</P.Text>
                        <P.Text style={[st.cellRight, { width: '20%' }]}>{formatEUR(row.fatturato)}</P.Text>
                        <P.Text style={[st.cellRight, { width: '20%' }]}>{formatEUR(row.saldo)}</P.Text>
                    </P.View>
                ))}
                <P.View style={[st.divider, { marginTop: 10 }]} />
                <P.View style={st.summaryRow}>
                    <P.Text style={st.summaryLabel}>TOTALE FATTURATO</P.Text>
                    <P.Text style={st.summaryValue}>{formatEUR(totaleFatturato)}</P.Text>
                </P.View>
                <ReportFooter P={P} />
            </P.Page>
        </P.Document>
    );
}

// ── Report: Magazzino ──────────────────────────
function MagazzinoDocument({ P, data, azienda }) {
    const st = getStyles();
    const totaleValore = data.reduce((sum, r) => sum + (r.valore || 0), 0);
    return (
        <P.Document>
            <P.Page size="A4" style={st.page}>
                <ReportHeader P={P} azienda={azienda} titoloReport="Situazione Magazzino" />
                <P.View style={st.tableHeader}>
                    <P.Text style={[st.cellHeader, { width: '35%' }]}>Prodotto</P.Text>
                    <P.Text style={[st.cellHeader, { width: '15%' }]}>Codice</P.Text>
                    <P.Text style={[st.cellHeader, { width: '15%', textAlign: 'right' }]}>Giacenza</P.Text>
                    <P.Text style={[st.cellHeader, { width: '15%', textAlign: 'right' }]}>Prezzo</P.Text>
                    <P.Text style={[st.cellHeader, { width: '20%', textAlign: 'right' }]}>Valore</P.Text>
                </P.View>
                {data.map((row, i) => (
                    <P.View key={i} style={[st.tableRow, (row.giacenza || 0) < 5 ? { backgroundColor: 'var(--elab-hex-fef2f2)' } : {}]}>
                        <P.Text style={[st.cell, { width: '35%' }]}>{row.nome}</P.Text>
                        <P.Text style={[st.cell, { width: '15%' }]}>{row.codice || '—'}</P.Text>
                        <P.Text style={[st.cellRight, { width: '15%' }]}>{row.giacenza ?? 0}</P.Text>
                        <P.Text style={[st.cellRight, { width: '15%' }]}>{formatEUR(row.prezzo)}</P.Text>
                        <P.Text style={[st.cellRight, { width: '20%' }]}>{formatEUR(row.valore)}</P.Text>
                    </P.View>
                ))}
                <P.View style={[st.divider, { marginTop: 10 }]} />
                <P.View style={st.summaryRow}>
                    <P.Text style={st.summaryLabel}>VALORE TOTALE MAGAZZINO</P.Text>
                    <P.Text style={st.summaryValue}>{formatEUR(totaleValore)}</P.Text>
                </P.View>
                <ReportFooter P={P} />
            </P.Page>
        </P.Document>
    );
}

// ── Report: Aging Fatture ──────────────────────
function AgingDocument({ P, data, azienda }) {
    const st = getStyles();
    const totaleScaduto = data.reduce((sum, r) => sum + (r.importo || 0), 0);
    return (
        <P.Document>
            <P.Page size="A4" style={st.page}>
                <ReportHeader P={P} azienda={azienda} titoloReport="Aging Fatture — Scadute e in Scadenza" />
                <P.View style={st.tableHeader}>
                    <P.Text style={[st.cellHeader, { width: '15%' }]}>Numero</P.Text>
                    <P.Text style={[st.cellHeader, { width: '25%' }]}>Cliente</P.Text>
                    <P.Text style={[st.cellHeader, { width: '15%' }]}>Scadenza</P.Text>
                    <P.Text style={[st.cellHeader, { width: '15%', textAlign: 'right' }]}>Importo</P.Text>
                    <P.Text style={[st.cellHeader, { width: '15%', textAlign: 'right' }]}>Gg Ritardo</P.Text>
                    <P.Text style={[st.cellHeader, { width: '15%' }]}>Stato</P.Text>
                </P.View>
                {data.map((row, i) => (
                    <P.View key={i} style={[st.tableRow, row.giorniRitardo > 30 ? { backgroundColor: 'var(--elab-hex-fef2f2)' } : {}]}>
                        <P.Text style={[st.cell, { width: '15%' }]}>{row.numero}</P.Text>
                        <P.Text style={[st.cell, { width: '25%' }]}>{row.cliente}</P.Text>
                        <P.Text style={[st.cell, { width: '15%' }]}>{formatDate(row.scadenza)}</P.Text>
                        <P.Text style={[st.cellRight, { width: '15%' }]}>{formatEUR(row.importo)}</P.Text>
                        <P.Text style={[st.cellRight, { width: '15%', color: row.giorniRitardo > 0 ? 'var(--elab-hex-dc2626)' : 'var(--elab-hex-059669)' }]}>{row.giorniRitardo}</P.Text>
                        <P.Text style={[st.cell, { width: '15%' }]}>{row.stato}</P.Text>
                    </P.View>
                ))}
                <P.View style={[st.divider, { marginTop: 10 }]} />
                <P.View style={st.summaryRow}>
                    <P.Text style={st.summaryLabel}>TOTALE SCADUTO</P.Text>
                    <P.Text style={st.summaryValue}>{formatEUR(totaleScaduto)}</P.Text>
                </P.View>
                <ReportFooter P={P} />
            </P.Page>
        </P.Document>
    );
}

// ── Genera Blob PDF ────────────────────────────
async function generatePDF(tipo, data, azienda, dateRange) {
    const P = await loadPdfRenderer();
    let doc;

    switch (tipo) {
        case 'fatturato_mensile':
            doc = <FatturatoDocument P={P} data={data} azienda={azienda} dateRange={dateRange} />;
            break;
        case 'situazione_clienti':
            doc = <ClientiDocument P={P} data={data} azienda={azienda} dateRange={dateRange} />;
            break;
        case 'magazzino':
            doc = <MagazzinoDocument P={P} data={data} azienda={azienda} />;
            break;
        case 'aging_fatture':
            doc = <AgingDocument P={P} data={data} azienda={azienda} />;
            break;
        default:
            logger.error(`[ReportService] Tipo report sconosciuto: ${tipo}`);
            return null;
    }

    try {
        const blob = await P.pdf(doc).toBlob();
        logger.info(`[ReportService] PDF generato: ${tipo} (${(blob.size / 1024).toFixed(1)} KB)`);
        return blob;
    } catch (err) {
        logger.error('[ReportService] Errore generazione PDF:', err);
        return null;
    }
}

// ── Build report data da dati grezzi ───────────
function buildReportData(tipo, { fatture = [], clienti = [], prodotti = [] }, dateRange) {
    const now = new Date();
    const da = dateRange?.da ? new Date(dateRange.da) : null;
    const a = dateRange?.a ? new Date(dateRange.a) : null;

    const inRange = (dateStr) => {
        if (!da && !a) return true;
        const d = new Date(dateStr);
        if (da && d < da) return false;
        if (a && d > a) return false;
        return true;
    };

    switch (tipo) {
        case 'fatturato_mensile': {
            const mesi = {};
            fatture.filter(f => f.stato === 'pagata' && inRange(f.data)).forEach(f => {
                const d = new Date(f.data);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const label = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
                if (!mesi[key]) mesi[key] = { mese: label, importo: 0, count: 0 };
                mesi[key].importo += f.totale || 0;
                mesi[key].count += 1;
            });
            return Object.entries(mesi).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
        }

        case 'situazione_clienti': {
            const clienteMap = {};
            fatture.filter(f => inRange(f.data)).forEach(f => {
                const nome = f.clienteNome || 'N/A';
                if (!clienteMap[nome]) clienteMap[nome] = { nome, fatturato: 0, saldo: 0, numFatture: 0 };
                clienteMap[nome].numFatture += 1;
                clienteMap[nome].fatturato += f.totale || 0;
                if (f.stato !== 'pagata' && f.stato !== 'annullata') {
                    clienteMap[nome].saldo += f.totale || 0;
                }
            });
            return Object.values(clienteMap).sort((a, b) => b.fatturato - a.fatturato);
        }

        case 'magazzino': {
            return prodotti.map(p => ({
                nome: p.nome || 'N/A',
                codice: p.codice || '',
                giacenza: p.quantita ?? p.giacenza ?? 0,
                prezzo: p.prezzo ?? p.prezzoUnitario ?? 0,
                valore: (p.quantita ?? p.giacenza ?? 0) * (p.prezzo ?? p.prezzoUnitario ?? 0),
            })).sort((a, b) => b.valore - a.valore);
        }

        case 'aging_fatture': {
            return fatture
                .filter(f => f.dataScadenza && f.stato !== 'pagata' && f.stato !== 'annullata')
                .map(f => {
                    const scadenza = new Date(f.dataScadenza);
                    const diffMs = now.getTime() - scadenza.getTime();
                    const giorniRitardo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    return {
                        numero: f.numero || 'N/A',
                        cliente: f.clienteNome || 'N/A',
                        scadenza: f.dataScadenza,
                        importo: f.totale || 0,
                        giorniRitardo,
                        stato: f.stato || 'N/A',
                    };
                })
                .sort((a, b) => b.giorniRitardo - a.giorniRitardo);
        }

        default:
            return [];
    }
}

const ReportService = {
    generatePDF,
    buildReportData,
};

export default ReportService;
