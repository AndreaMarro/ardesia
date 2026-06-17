// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Modulo Banche & Finanze
// Conti bancari e movimenti finanziari
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { COLORS, S } from '../GestionaleStyles';
import { formatCurrency, formatDate, exportToJSON } from '../shared/GestionaleUtils';
import { financeService } from '../GestionaleService';
import GestionaleTable from '../shared/GestionaleTable';
import GestionaleForm from '../shared/GestionaleForm';
import logger from '../../../../utils/logger';
import { showToast } from '../../../common/Toast';

const TIPI_CONTO = [
  { value: 'corrente', label: 'Conto Corrente' }, { value: 'risparmio', label: 'Conto Risparmio' },
  { value: 'carta', label: 'Carta' }, { value: 'paypal', label: 'PayPal' },
];
const CATEGORIE_MOV = [
  { value: 'vendita', label: 'Vendita' }, { value: 'acquisto', label: 'Acquisto' },
  { value: 'stipendio', label: 'Stipendio' }, { value: 'tasse', label: 'Tasse' },
  { value: 'utenze', label: 'Utenze' }, { value: 'affitto', label: 'Affitto' },
  { value: 'altro', label: 'Altro' },
];
const CAT_COLORS = {
  vendita: 'var(--elab-hex-059669)', acquisto: 'var(--elab-hex-d97706)', stipendio: 'var(--elab-hex-2563eb)', tasse: 'var(--elab-hex-dc2626)',
  utenze: 'var(--elab-hex-7c3aed)', affitto: 'var(--elab-hex-0891b2)', altro: 'var(--elab-hex-64748b)',
};

const emptyContoForm = () => ({
  nome: '', banca: '', iban: '', tipo: 'corrente', saldo: '', note: '',
});
const emptyMovimento = () => ({
  contoId: '', tipo: 'uscita', categoria: 'altro', importo: '',
  data: new Date().toISOString().split('T')[0], descrizione: '', riferimento: '', riconciliato: false,
});

const contoFormFields = [
  { key: 'nome', label: 'Nome Conto', required: true },
  { key: 'banca', label: 'Banca / Istituto', required: true },
  { key: 'iban', label: 'IBAN', required: true },
  { key: 'tipo', label: 'Tipo Conto', type: 'select', required: true, options: TIPI_CONTO },
  { key: 'saldo', label: 'Saldo Iniziale', type: 'currency' },
  { key: 'note', label: 'Note', type: 'textarea', fullWidth: true },
];

function maskIBAN(iban) {
  if (!iban || iban.length < 8) return iban || '-';
  return '\u2022\u2022\u2022\u2022 ' + iban.slice(-4);
}

function getMonthsRange(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }) });
  }
  return months;
}

export default function BancheFinanzeModule({ isMobile }) {
  const [tab, setTab] = useState('conti');
  const [conti, setConti] = useState([]);
  const [movimenti, setMovimenti] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyContoForm());
  const [showMovForm, setShowMovForm] = useState(false);
  const [movForm, setMovForm] = useState(emptyMovimento());
  const [movEditing, setMovEditing] = useState(null);
  const [contoFilter, setContoFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, m] = await Promise.all([financeService.getConti(), financeService.getMovimenti()]);
      setConti(c || []); setMovimenti(m || []);
    } catch (e) { logger.error('Errore caricamento finanze:', e); }
    setLoading(false);
  };

  // -- Calculated saldi --
  const contiConSaldo = useMemo(() => {
    return conti.map(c => {
      const movConto = movimenti.filter(m => m.contoId === c.id);
      const saldoIniziale = parseFloat(c.saldo) || 0;
      const saldoCalcolato = movConto.reduce((acc, m) => {
        const imp = parseFloat(m.importo) || 0;
        return m.tipo === 'entrata' ? acc + imp : acc - imp;
      }, saldoIniziale);
      return { ...c, saldoCalcolato };
    });
  }, [conti, movimenti]);

  const saldoTotale = useMemo(() => contiConSaldo.reduce((s, c) => s + c.saldoCalcolato, 0), [contiConSaldo]);

  // -- Movimenti filtering --
  const filteredMov = useMemo(() => {
    return movimenti.filter(m => {
      if (contoFilter && m.contoId !== contoFilter) return false;
      if (tipoFilter && m.tipo !== tipoFilter) return false;
      if (catFilter && m.categoria !== catFilter) return false;
      if (dateFrom && m.data < dateFrom) return false;
      if (dateTo && m.data > dateTo) return false;
      return true;
    }).sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  }, [movimenti, contoFilter, tipoFilter, catFilter, dateFrom, dateTo]);

  // -- Cash Flow data for last 6 months --
  const cashFlow = useMemo(() => {
    const months = getMonthsRange(6);
    return months.map(({ key, label }) => {
      const entrate = movimenti.filter(m => m.tipo === 'entrata' && (m.data || '').startsWith(key)).reduce((s, m) => s + (parseFloat(m.importo) || 0), 0);
      const uscite = movimenti.filter(m => m.tipo === 'uscita' && (m.data || '').startsWith(key)).reduce((s, m) => s + (parseFloat(m.importo) || 0), 0);
      return { label, entrate, uscite };
    });
  }, [movimenti]);

  const maxCashFlow = useMemo(() => Math.max(...cashFlow.map(c => Math.max(c.entrate, c.uscite)), 1), [cashFlow]);

  // -- Category breakdown --
  const catBreakdown = useMemo(() => {
    const totaleUscite = filteredMov.filter(m => m.tipo === 'uscita').reduce((s, m) => s + (parseFloat(m.importo) || 0), 0);
    return CATEGORIE_MOV.map(cat => {
      const amount = filteredMov.filter(m => m.tipo === 'uscita' && m.categoria === cat.value).reduce((s, m) => s + (parseFloat(m.importo) || 0), 0);
      return { ...cat, amount, pct: totaleUscite > 0 ? (amount / totaleUscite * 100) : 0 };
    }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
  }, [filteredMov]);

  const getContoName = (id) => {
    const c = conti.find(x => x.id === id);
    return c ? c.nome : id || '-';
  };

  // -- CRUD Conti --
  const openNewConto = () => { setEditing(null); setForm(emptyContoForm()); setShowForm(true); };
  const openEditConto = (conto) => { setEditing(conto.id); setForm({ ...conto }); setShowForm(true); };
  const handleSaveConto = async (vals) => {
    try {
      if (editing) await financeService.updateConto(editing, vals);
      else await financeService.createConto(vals);
      await loadData(); setShowForm(false);
    } catch (e) { logger.error('Errore salvataggio conto:', e); }
  };
  const handleDeleteConto = async (id) => {
    if (!window.confirm('Eliminare questo conto bancario?')) return;
    try {
      const res = await financeService.deleteConto(id);
      if (res && !res.success) { showToast(res.error, 'error'); return; }
      await loadData();
    } catch (e) { logger.error(e); }
  };

  // -- CRUD Movimenti --
  const openNewMov = (preselectedContoId) => {
    setMovEditing(null);
    setMovForm({ ...emptyMovimento(), contoId: preselectedContoId || '' });
    setShowMovForm(true);
  };
  const handleSaveMov = async (vals) => {
    try {
      // financeService only supports addMovimento (no update)
      await financeService.addMovimento(vals);
      await loadData(); setShowMovForm(false);
    } catch (e) { logger.error('Errore salvataggio movimento:', e); }
  };
  const toggleRiconcilia = () => {
    // Riconciliazione non supportata nel servizio attuale
  };
  const handleDeleteMov = async (id) => {
    if (!window.confirm('Eliminare questo movimento?')) return;
    try { await financeService.deleteMovimento(id); await loadData(); } catch (e) { logger.error(e); }
  };

  const movFormFields = [
    { key: 'contoId', label: 'Conto', type: 'select', required: true, options: conti.map(c => ({ value: c.id, label: c.nome })) },
    { key: 'tipo', label: 'Tipo', type: 'select', required: true, options: [{ value: 'entrata', label: 'Entrata' }, { value: 'uscita', label: 'Uscita' }] },
    { key: 'categoria', label: 'Categoria', type: 'select', required: true, options: CATEGORIE_MOV },
    { key: 'importo', label: 'Importo', type: 'currency', required: true },
    { key: 'data', label: 'Data', type: 'date', required: true },
    { key: 'descrizione', label: 'Descrizione', fullWidth: true },
    { key: 'riferimento', label: 'Riferimento' },
  ];

  const movColumns = [
    { key: 'data', label: 'Data', render: (v) => formatDate(v) },
    { key: 'contoId', label: 'Conto', render: (v) => getContoName(v) },
    { key: 'tipo', label: 'Tipo', render: (v) => (
      <span style={{ fontWeight: 600, color: v === 'entrata' ? COLORS.success : COLORS.danger }}>{v === 'entrata' ? '\u25B2 Entrata' : '\u25BC Uscita'}</span>
    )},
    { key: 'categoria', label: 'Categoria', render: (v) => (
      <span style={{ ...S.badge(CAT_COLORS[v] || COLORS.info) }}>{CATEGORIE_MOV.find(c => c.value === v)?.label || v}</span>
    )},
    { key: 'importo', label: 'Importo', render: (v, row) => (
      <span style={{ fontWeight: 700, color: row.tipo === 'entrata' ? COLORS.success : COLORS.danger }}>{formatCurrency(v)}</span>
    )},
    { key: 'descrizione', label: 'Descrizione' },
    { key: 'riconciliato', label: 'Riconc.', render: (v, row) => (
      <div onClick={() => toggleRiconcilia(row)} style={{
        width: 20, height: 20, borderRadius: 4, border: `2px solid ${v ? COLORS.success : COLORS.border}`,
        background: v ? COLORS.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: 14, color: '#fff',
      }}>{v ? '\u2713' : ''}</div>
    )},
    { key: 'azioni', label: 'Azioni', render: (_, row) => (
      <button style={{ ...S.btnSmall, background: COLORS.danger, color: '#fff' }} onClick={() => handleDeleteMov(row.id)}>Elimina</button>
    )},
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textMuted }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>&#9203;</div>
        <div style={{ fontSize: '14px' }}>Caricamento dati finanziari...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={S.pageHeader}>
        <h2 style={S.pageTitle}>Banche & Finanze</h2>
        <p style={S.pageSubtitle}>Conti bancari, movimenti e analisi finanziaria</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        {[{ key: 'conti', label: 'Conti Bancari' }, { key: 'movimenti', label: 'Movimenti' }].map((t, i) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 24px', border: `1px solid ${COLORS.accent}`, cursor: 'pointer', fontWeight: 600, fontSize: 14,
            background: tab === t.key ? COLORS.accent : '#fff', color: tab === t.key ? '#fff' : COLORS.accent,
            borderRadius: i === 0 ? '8px 0 0 8px' : '0 8px 8px 0',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ========== CONTI BANCARI ========== */}
      {tab === 'conti' && (
        <div>
          {/* Saldo totale */}
          <div style={{ ...S.card, textAlign: 'center', marginBottom: 16, borderLeft: `4px solid ${saldoTotale >= 0 ? COLORS.success : COLORS.danger}` }}>
            <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 4 }}>Saldo Complessivo</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: saldoTotale >= 0 ? COLORS.success : COLORS.danger }}>{formatCurrency(saldoTotale)}</div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <button style={S.btnPrimary} onClick={openNewConto}>+ Nuovo Conto</button>
          </div>

          {contiConSaldo.length === 0 ? (
            <div style={S.emptyState}>
              <div style={S.emptyIcon}>&var(--elab-hex-127974);</div>
              <div style={S.emptyText}>Nessun conto bancario configurato</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {contiConSaldo.map(conto => {
                const tipoLabel = TIPI_CONTO.find(t => t.value === conto.tipo)?.label || conto.tipo;
                const saldoPos = conto.saldoCalcolato >= 0;
                return (
                  <div key={conto.id} className="gest-hover-card" style={{ ...S.cardCompact, cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}
                    onClick={() => openEditConto(conto)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.textPrimary }}>{conto.nome}</div>
                        <div style={{ fontSize: 14, color: COLORS.textSecondary }}>{conto.banca}</div>
                      </div>
                      <span style={{ ...S.badge(COLORS.info) }}>{tipoLabel}</span>
                    </div>
                    <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 8 }}>IBAN: {maskIBAN(conto.iban)}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: saldoPos ? COLORS.success : COLORS.danger }}>{formatCurrency(conto.saldoCalcolato)}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      <button style={{ ...S.btnSmall, background: COLORS.accentLight, color: '#fff' }}
                        onClick={e => { e.stopPropagation(); setTab('movimenti'); setContoFilter(conto.id); }}>Movimenti</button>
                      <button style={{ ...S.btnSmall, background: COLORS.success, color: '#fff' }}
                        onClick={e => { e.stopPropagation(); openNewMov(conto.id); }}>+ Movimento</button>
                      <button style={{ ...S.btnSmall, background: COLORS.danger, color: '#fff' }}
                        onClick={e => { e.stopPropagation(); handleDeleteConto(conto.id); }}>Elimina</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========== MOVIMENTI ========== */}
      {tab === 'movimenti' && (
        <div>
          {/* Toolbar */}
          <div style={S.toolbar}>
            <select style={{ ...S.select, minWidth: 150 }} value={contoFilter} onChange={e => setContoFilter(e.target.value)}>
              <option value="">Tutti i conti</option>
              {conti.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select style={S.select} value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}>
              <option value="">Entrata/Uscita</option>
              <option value="entrata">Entrata</option>
              <option value="uscita">Uscita</option>
            </select>
            <select style={S.select} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">Tutte le categorie</option>
              {CATEGORIE_MOV.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input style={{ ...S.searchInput, maxWidth: 140 }} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="Da data" />
            <input style={{ ...S.searchInput, maxWidth: 140 }} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} title="A data" />
            <button style={S.btnPrimary} onClick={() => openNewMov('')}>+ Nuovo Movimento</button>
            <button style={S.btnSecondary} onClick={() => exportToJSON(filteredMov, 'movimenti')}>Esporta</button>
          </div>

          {/* Cash Flow Chart - last 6 months */}
          <div style={{ ...S.card, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 12 }}>Cash Flow - Ultimi 6 Mesi</div>
            <div style={{ display: 'flex', gap: isMobile ? 6 : 12, alignItems: 'flex-end', height: 120 }}>
              {cashFlow.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 90, width: '100%', justifyContent: 'center' }}>
                    <div style={{ width: '40%', background: COLORS.success, borderRadius: '4px 4px 0 0', height: `${(m.entrate / maxCashFlow) * 90}px`, minHeight: m.entrate > 0 ? 4 : 0, transition: 'height 0.3s' }} title={`Entrate: ${formatCurrency(m.entrate)}`} />
                    <div style={{ width: '40%', background: COLORS.danger, borderRadius: '4px 4px 0 0', height: `${(m.uscite / maxCashFlow) * 90}px`, minHeight: m.uscite > 0 ? 4 : 0, transition: 'height 0.3s' }} title={`Uscite: ${formatCurrency(m.uscite)}`} />
                  </div>
                  <div style={{ fontSize: 14, color: COLORS.textMuted, textAlign: 'center' }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.success }} /> Entrate
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.danger }} /> Uscite
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {catBreakdown.length > 0 && (
            <div style={{ ...S.card, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 12 }}>Ripartizione Uscite per Categoria</div>
              {catBreakdown.map(cat => (
                <div key={cat.value} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, color: CAT_COLORS[cat.value] || COLORS.textSecondary }}>{cat.label}</span>
                    <span style={{ color: COLORS.textSecondary }}>{formatCurrency(cat.amount)} ({cat.pct.toFixed(1)}%)</span>
                  </div>
                  <div style={{ height: 6, background: COLORS.borderLight, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${cat.pct}%`, background: CAT_COLORS[cat.value] || COLORS.info, borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          <GestionaleTable columns={movColumns} data={filteredMov} isMobile={isMobile} emptyMessage="Nessun movimento trovato" emptyIcon="&var(--elab-hex-128182);" />
        </div>
      )}

      {/* Form Conto */}
      {showForm && (
        <GestionaleForm
          title={editing ? 'Modifica Conto Bancario' : 'Nuovo Conto Bancario'}
          fields={contoFormFields}
          values={form}
          onChange={(k, v) => setForm(prev => ({ ...prev, [k]: v }))}
          onSubmit={handleSaveConto}
          onCancel={() => setShowForm(false)}
          submitLabel={editing ? 'Aggiorna' : 'Crea Conto'}
          isMobile={isMobile}
        />
      )}

      {/* Form Movimento */}
      {showMovForm && (
        <GestionaleForm
          title={movEditing ? 'Modifica Movimento' : 'Nuovo Movimento'}
          fields={movFormFields}
          values={movForm}
          onChange={(k, v) => setMovForm(prev => ({ ...prev, [k]: v }))}
          onSubmit={handleSaveMov}
          onCancel={() => setShowMovForm(false)}
          submitLabel={movEditing ? 'Aggiorna' : 'Registra Movimento'}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
