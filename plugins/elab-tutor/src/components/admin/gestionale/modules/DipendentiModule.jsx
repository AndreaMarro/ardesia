// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Modulo Dipendenti
// Gestione personale e buste paga
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { COLORS, S, getStatusStyle, getStatusLabel } from '../GestionaleStyles';
import { formatCurrency, exportToJSON } from '../shared/GestionaleUtils';
import { dipendentiService, bustePagaService } from '../GestionaleService';
import GestionaleTable from '../shared/GestionaleTable';
import GestionaleForm from '../shared/GestionaleForm';
import logger from '../../../../utils/logger';

const REPARTI = ['produzione', 'amministrazione', 'commerciale', 'logistica', 'didattica'];
const REPARTI_COLORS = { produzione: 'var(--elab-hex-d97706)', amministrazione: 'var(--elab-hex-2563eb)', commerciale: 'var(--elab-hex-7c3aed)', logistica: 'var(--elab-hex-059669)', didattica: 'var(--elab-hex-ec4899)' };
const CONTRATTI = [
  { value: 'indeterminato', label: 'Indeterminato' }, { value: 'determinato', label: 'Determinato' },
  { value: 'stage', label: 'Stage' }, { value: 'collaborazione', label: 'Collaborazione' },
  { value: 'partita_iva', label: 'Partita IVA' },
];
const STATI_DIP = [
  { value: 'attivo', label: 'Attivo' }, { value: 'in_ferie', label: 'In Ferie' },
  { value: 'malattia', label: 'Malattia' }, { value: 'cessato', label: 'Cessato' },
];

const emptyDipendente = () => ({
  nome: '', cognome: '', codiceFiscale: '', dataNascita: '', email: '', telefono: '',
  indirizzo: '', ruolo: '', reparto: 'produzione', tipoContratto: 'indeterminato',
  dataAssunzione: new Date().toISOString().split('T')[0], dataFineContratto: '',
  stipendioLordo: '', stato: 'attivo', note: '',
});

const emptyBustaPaga = () => ({
  dipendenteId: '', mese: new Date().toISOString().slice(0, 7),
  lordo: '', netto: '', contributi: '', irpef: '', stato: 'da_elaborare',
});

const dipFormFields = [
  { key: 'nome', label: 'Nome', required: true },
  { key: 'cognome', label: 'Cognome', required: true },
  { key: 'codiceFiscale', label: 'Codice Fiscale', required: true },
  { key: 'dataNascita', label: 'Data di Nascita', type: 'date' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'telefono', label: 'Telefono' },
  { key: 'indirizzo', label: 'Indirizzo', fullWidth: true },
  { key: 'ruolo', label: 'Ruolo', required: true },
  { key: 'reparto', label: 'Reparto', type: 'select', required: true, options: REPARTI.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) })) },
  { key: 'tipoContratto', label: 'Tipo Contratto', type: 'select', required: true, options: CONTRATTI },
  { key: 'dataAssunzione', label: 'Data Assunzione', type: 'date', required: true },
  { key: 'dataFineContratto', label: 'Data Fine Contratto', type: 'date' },
  { key: 'stipendioLordo', label: 'Stipendio Lordo Mensile', type: 'currency' },
  { key: 'stato', label: 'Stato', type: 'select', required: true, options: STATI_DIP },
  { key: 'note', label: 'Note', type: 'textarea', fullWidth: true },
];

function getInitials(nome, cognome) {
  return ((nome || '')[0] || '') + ((cognome || '')[0] || '');
}

export default function DipendentiModule({ isMobile }) {
  const [subView, setSubView] = useState('dipendenti');
  const [dipendenti, setDipendenti] = useState([]);
  const [bustePaga, setBustePaga] = useState([]);
  const [search, setSearch] = useState('');
  const [repartoFilter, setRepartoFilter] = useState('');
  const [statoFilter, setStatoFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyDipendente());
  const [bpForm, setBpForm] = useState(emptyBustaPaga());
  const [bpEditing, setBpEditing] = useState(null);
  const [showBpForm, setShowBpForm] = useState(false);
  const [bpDipFilter, setBpDipFilter] = useState('');
  const [bpMeseFilter, setBpMeseFilter] = useState('');
  const [bpStatoFilter, setBpStatoFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [d, b] = await Promise.all([dipendentiService.getAll(), bustePagaService.getAll()]);
      setDipendenti(d || []); setBustePaga(b || []);
    } catch (e) { logger.error('Errore caricamento dipendenti:', e); }
    setLoading(false);
  };

  // -- Dipendenti filtering/stats --
  const filteredDip = useMemo(() => {
    return dipendenti.filter(d => {
      if (repartoFilter && d.reparto !== repartoFilter) return false;
      if (statoFilter && d.stato !== statoFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return `${d.nome} ${d.cognome}`.toLowerCase().includes(s) || (d.ruolo || '').toLowerCase().includes(s) || (d.email || '').toLowerCase().includes(s);
      }
      return true;
    });
  }, [dipendenti, search, repartoFilter, statoFilter]);

  const stats = useMemo(() => {
    const attivi = dipendenti.filter(d => d.stato === 'attivo').length;
    const perReparto = {};
    REPARTI.forEach(r => { perReparto[r] = dipendenti.filter(d => d.reparto === r && d.stato !== 'cessato').length; });
    const costoMensile = dipendenti.filter(d => d.stato !== 'cessato').reduce((s, d) => s + (parseFloat(d.stipendioLordo) || 0), 0);
    return { totale: dipendenti.length, attivi, perReparto, costoMensile };
  }, [dipendenti]);

  // -- CRUD Dipendenti --
  const openNewDip = () => { setEditing(null); setForm(emptyDipendente()); setShowForm(true); };
  const openEditDip = (dip) => { setEditing(dip.id); setForm({ ...dip }); setShowForm(true); };
  const handleSaveDip = async (vals) => {
    try {
      if (editing) await dipendentiService.update(editing, vals);
      else await dipendentiService.create(vals);
      await loadData(); setShowForm(false);
    } catch (e) { logger.error('Errore salvataggio dipendente:', e); }
  };
  const handleDeleteDip = async (id) => {
    if (!window.confirm('Eliminare questo dipendente?')) return;
    try { await dipendentiService.delete(id); await loadData(); } catch (e) { logger.error(e); }
  };

  // -- Buste paga filtering --
  const filteredBP = useMemo(() => {
    return bustePaga.filter(b => {
      if (bpDipFilter && b.dipendenteId !== bpDipFilter) return false;
      if (bpMeseFilter && b.mese !== bpMeseFilter) return false;
      if (bpStatoFilter && b.stato !== bpStatoFilter) return false;
      return true;
    });
  }, [bustePaga, bpDipFilter, bpMeseFilter, bpStatoFilter]);

  const bpTotals = useMemo(() => {
    return {
      lordo: filteredBP.reduce((s, b) => s + (parseFloat(b.lordo) || 0), 0),
      netto: filteredBP.reduce((s, b) => s + (parseFloat(b.netto) || 0), 0),
      contributi: filteredBP.reduce((s, b) => s + (parseFloat(b.contributi) || 0), 0),
      irpef: filteredBP.reduce((s, b) => s + (parseFloat(b.irpef) || 0), 0),
    };
  }, [filteredBP]);

  const getDipName = (id) => {
    const d = dipendenti.find(x => x.id === id);
    return d ? `${d.nome} ${d.cognome}` : id || '-';
  };

  // -- CRUD Buste Paga --
  const openNewBP = () => { setBpEditing(null); setBpForm(emptyBustaPaga()); setShowBpForm(true); };
  const handleSaveBP = async (vals) => {
    try {
      if (bpEditing) await bustePagaService.update(bpEditing, vals);
      else await bustePagaService.create(vals);
      await loadData(); setShowBpForm(false);
    } catch (e) { logger.error('Errore salvataggio busta paga:', e); }
  };
  const handleBPAction = async (bp, nuovoStato) => {
    try { await bustePagaService.update(bp.id, { ...bp, stato: nuovoStato }); await loadData(); }
    catch (e) { logger.error(e); }
  };
  const handleDeleteBP = async (id) => {
    if (!window.confirm('Eliminare questa busta paga?')) return;
    try { await bustePagaService.delete(id); await loadData(); } catch (e) { logger.error(e); }
  };

  // Auto-calcolo busta paga da RAL
  const calcolaDaRAL = (dipendenteId) => {
    const dip = dipendenti.find(d => d.id === dipendenteId);
    if (!dip || !dip.stipendioLordo) return null;
    const ral = parseFloat(dip.stipendioLordo) || 0;
    if (ral <= 0) return null;

    const lordoMensile = ral / 13; // 13 mensilità standard
    const contributiINPS = lordoMensile * 0.0919; // ~9.19% contributi dipendente
    const imponibileIRPEF = lordoMensile - contributiINPS;

    // IRPEF 2026 semplificata (scaglioni)
    let irpef = 0;
    const annuoImponibile = imponibileIRPEF * 13;
    if (annuoImponibile <= 28000) irpef = annuoImponibile * 0.23;
    else if (annuoImponibile <= 50000) irpef = 28000 * 0.23 + (annuoImponibile - 28000) * 0.35;
    else irpef = 28000 * 0.23 + 22000 * 0.35 + (annuoImponibile - 50000) * 0.43;
    const irpefMensile = irpef / 13;

    const netto = lordoMensile - contributiINPS - irpefMensile;

    return {
      lordo: Math.round(lordoMensile * 100) / 100,
      netto: Math.round(netto * 100) / 100,
      contributi: Math.round(contributiINPS * 100) / 100,
      irpef: Math.round(irpefMensile * 100) / 100,
    };
  };

  const bpFormFields = [
    { key: 'dipendenteId', label: 'Dipendente', type: 'select', required: true, options: dipendenti.filter(d => d.stato !== 'cessato').map(d => ({ value: d.id, label: `${d.nome} ${d.cognome}` })),
      onChange: (val, currentForm, setFormFn) => {
        const calc = calcolaDaRAL(val);
        if (calc && !currentForm.lordo) {
          setFormFn(prev => ({ ...prev, dipendenteId: val, ...calc }));
        } else {
          setFormFn(prev => ({ ...prev, dipendenteId: val }));
        }
      }
    },
    { key: 'mese', label: 'Mese (AAAA-MM)', type: 'month', required: true },
    { key: 'lordo', label: 'Lordo (mensile)', type: 'currency', required: true,
      helpText: 'Calcolato auto da RAL/13. Modificabile manualmente.' },
    { key: 'netto', label: 'Netto (stimato)', type: 'currency', required: true },
    { key: 'contributi', label: 'Contributi INPS', type: 'currency' },
    { key: 'irpef', label: 'IRPEF', type: 'currency',
      helpText: 'Stima semplificata senza detrazioni. Consultare commercialista per importi esatti.' },
  ];

  const bpColumns = [
    { key: 'dipendenteId', label: 'Dipendente', render: (v) => getDipName(v) },
    { key: 'mese', label: 'Mese', render: (v) => v || '-' },
    { key: 'lordo', label: 'Lordo', render: (v) => formatCurrency(v) },
    { key: 'netto', label: 'Netto', render: (v) => formatCurrency(v) },
    { key: 'contributi', label: 'Contributi', render: (v) => formatCurrency(v) },
    { key: 'irpef', label: 'IRPEF', render: (v) => formatCurrency(v) },
    { key: 'stato', label: 'Stato', render: (v) => <span style={getStatusStyle(v)}>{getStatusLabel(v)}</span> },
    { key: 'azioni', label: 'Azioni', render: (_, row) => (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {row.stato === 'da_elaborare' && (
          <button style={{ ...S.btnSmall, background: COLORS.accentLight, color: '#fff' }} onClick={() => handleBPAction(row, 'elaborata')}>Elabora</button>
        )}
        {row.stato === 'elaborata' && (
          <button style={{ ...S.btnSmall, background: COLORS.success, color: '#fff' }} onClick={() => handleBPAction(row, 'pagata')}>Paga</button>
        )}
        <button style={{ ...S.btnSmall, background: COLORS.danger, color: '#fff' }} onClick={() => handleDeleteBP(row.id)}>Elimina</button>
      </div>
    )},
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textMuted }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>&#9203;</div>
        <div style={{ fontSize: '14px' }}>Caricamento dipendenti...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={S.pageHeader}>
        <h2 style={S.pageTitle}>Dipendenti</h2>
        <p style={S.pageSubtitle}>Gestione personale e buste paga</p>
      </div>

      {/* Sub-view tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        {[{ key: 'dipendenti', label: 'Dipendenti' }, { key: 'bustepaga', label: 'Buste Paga' }].map((t, i) => (
          <button key={t.key} onClick={() => setSubView(t.key)} style={{
            padding: '10px 24px', border: `1px solid ${COLORS.accent}`, cursor: 'pointer', fontWeight: 600, fontSize: 14,
            background: subView === t.key ? COLORS.accent : '#fff', color: subView === t.key ? '#fff' : COLORS.accent,
            borderRadius: i === 0 ? '8px 0 0 8px' : '0 8px 8px 0',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ========== DIPENDENTI VIEW ========== */}
      {subView === 'dipendenti' && (
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            <div style={{ ...S.cardCompact, textAlign: 'center', borderLeft: `3px solid ${COLORS.accent}` }}>
              <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 4 }}>Headcount Totale</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.accent }}>{stats.totale}</div>
            </div>
            <div style={{ ...S.cardCompact, textAlign: 'center', borderLeft: `3px solid ${COLORS.success}` }}>
              <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 4 }}>Attivi</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.success }}>{stats.attivi}</div>
            </div>
            <div style={{ ...S.cardCompact, textAlign: 'center', borderLeft: `3px solid ${COLORS.warning}` }}>
              <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 4 }}>Costo Mensile Lordo</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.warning }}>{formatCurrency(stats.costoMensile)}</div>
            </div>
            <div style={{ ...S.cardCompact, borderLeft: `3px solid ${COLORS.info}` }}>
              <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 6 }}>Per Reparto</div>
              {REPARTI.map(r => (
                <div key={r} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 2 }}>
                  <span style={{ color: REPARTI_COLORS[r], fontWeight: 600 }}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                  <span style={{ fontWeight: 700 }}>{stats.perReparto[r]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div style={S.toolbar}>
            <input style={S.searchInput} placeholder="Cerca per nome, ruolo, email..." value={search} onChange={e => setSearch(e.target.value)} />
            <select style={S.select} value={repartoFilter} onChange={e => setRepartoFilter(e.target.value)}>
              <option value="">Tutti i reparti</option>
              {REPARTI.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            <select style={S.select} value={statoFilter} onChange={e => setStatoFilter(e.target.value)}>
              <option value="">Tutti gli stati</option>
              {STATI_DIP.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button style={S.btnPrimary} onClick={openNewDip}>+ Nuovo Dipendente</button>
            <button style={S.btnSecondary} onClick={() => exportToJSON(dipendenti, 'dipendenti')}>Esporta</button>
          </div>

          {/* Card Grid */}
          {filteredDip.length === 0 ? (
            <div style={S.emptyState}>
              <div style={S.emptyIcon}>&var(--elab-hex-128100);</div>
              <div style={S.emptyText}>Nessun dipendente trovato</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filteredDip.map(dip => {
                const initials = getInitials(dip.nome, dip.cognome);
                const rc = REPARTI_COLORS[dip.reparto] || COLORS.info;
                return (
                  <div key={dip.id} className="gest-hover-card" style={{ ...S.cardCompact, cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}
                    onClick={() => openEditDip(dip)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', background: `${rc}18`, color: rc,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0,
                      }}>{initials.toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>{dip.nome} {dip.cognome}</div>
                        <div style={{ fontSize: 14, color: COLORS.textSecondary }}>{dip.ruolo || 'Ruolo non specificato'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ ...S.badge(rc) }}>{(dip.reparto || '').charAt(0).toUpperCase() + (dip.reparto || '').slice(1)}</span>
                      <span style={getStatusStyle(dip.stato)}>{getStatusLabel(dip.stato)}</span>
                    </div>
                    <div style={{ fontSize: 14, color: COLORS.textMuted }}>
                      {CONTRATTI.find(c => c.value === dip.tipoContratto)?.label || dip.tipoContratto}
                      {dip.stipendioLordo ? ` \u2022 ${formatCurrency(dip.stipendioLordo)}/mese` : ''}
                    </div>
                    {/* Delete button top-right */}
                    <button onClick={e => { e.stopPropagation(); handleDeleteDip(dip.id); }}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textMuted, fontSize: 14, padding: 4, borderRadius: 4 }}
                      onMouseEnter={e => { e.currentTarget.style.color = COLORS.danger; e.currentTarget.style.background = COLORS.dangerBg; }}
                      onMouseLeave={e => { e.currentTarget.style.color = COLORS.textMuted; e.currentTarget.style.background = 'none'; }}
                      title="Elimina">{'\u2715'}</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========== BUSTE PAGA VIEW ========== */}
      {subView === 'bustepaga' && (
        <div>
          {/* Toolbar */}
          <div style={S.toolbar}>
            <select style={{ ...S.select, minWidth: 160 }} value={bpDipFilter} onChange={e => setBpDipFilter(e.target.value)}>
              <option value="">Tutti i dipendenti</option>
              {dipendenti.filter(d => d.stato !== 'cessato').map(d => <option key={d.id} value={d.id}>{d.nome} {d.cognome}</option>)}
            </select>
            <input style={{ ...S.searchInput, maxWidth: 150 }} type="month" value={bpMeseFilter} onChange={e => setBpMeseFilter(e.target.value)} />
            <select style={S.select} value={bpStatoFilter} onChange={e => setBpStatoFilter(e.target.value)}>
              <option value="">Tutti gli stati</option>
              <option value="da_elaborare">Da Elaborare</option>
              <option value="elaborata">Elaborata</option>
              <option value="pagata">Pagata</option>
            </select>
            <button style={S.btnPrimary} onClick={openNewBP}>+ Nuova Busta Paga</button>
          </div>

          {/* Totals summary */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Totale Lordo', value: formatCurrency(bpTotals.lordo), color: COLORS.accent },
              { label: 'Totale Netto', value: formatCurrency(bpTotals.netto), color: COLORS.success },
              { label: 'Totale Contributi', value: formatCurrency(bpTotals.contributi), color: COLORS.warning },
              { label: 'Totale IRPEF', value: formatCurrency(bpTotals.irpef), color: COLORS.danger },
            ].map((s, i) => (
              <div key={i} style={{ ...S.cardCompact, textAlign: 'center', borderLeft: `3px solid ${s.color}` }}>
                <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <GestionaleTable columns={bpColumns} data={filteredBP} isMobile={isMobile} emptyMessage="Nessuna busta paga trovata" emptyIcon="&var(--elab-hex-128180);" />
        </div>
      )}

      {/* Form Dipendente */}
      {showForm && (
        <GestionaleForm
          title={editing ? 'Modifica Dipendente' : 'Nuovo Dipendente'}
          fields={dipFormFields}
          values={form}
          onChange={(k, v) => setForm(prev => ({ ...prev, [k]: v }))}
          onSubmit={handleSaveDip}
          onCancel={() => setShowForm(false)}
          submitLabel={editing ? 'Aggiorna' : 'Crea Dipendente'}
          isMobile={isMobile}
        />
      )}

      {/* Form Busta Paga */}
      {showBpForm && (
        <GestionaleForm
          title={bpEditing ? 'Modifica Busta Paga' : 'Nuova Busta Paga'}
          fields={bpFormFields}
          values={bpForm}
          onChange={(k, v) => setBpForm(prev => ({ ...prev, [k]: v }))}
          onSubmit={handleSaveBP}
          onCancel={() => setShowBpForm(false)}
          submitLabel={bpEditing ? 'Aggiorna' : 'Crea Busta Paga'}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
