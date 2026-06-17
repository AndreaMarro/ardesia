// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
import React, { useState, useEffect, useMemo } from 'react';
import { COLORS, S } from '../GestionaleStyles';
import { formatCurrency, formatDate, exportToJSON, exportToCSV, isOverdue, truncate } from '../shared/GestionaleUtils';
import { ordiniService, prodottiService, fattureService } from '../GestionaleService';
import GestionaleTable from '../shared/GestionaleTable';
import GestionaleForm from '../shared/GestionaleForm';
import GestionaleCard from '../shared/GestionaleCard';
import logger from '../../../../utils/logger';
import { showToast } from '../../../common/Toast';

const PIPELINE = ['bozza', 'confermato', 'in_lavorazione', 'spedito', 'consegnato'];
const PIPELINE_COLORS = {
  bozza: '#95a5a6', confermato: '#3498db', in_lavorazione: '#f39c12', // palette
  spedito: '#9b59b6', consegnato: '#27ae60' // palette
};
const PIPELINE_LABELS = {
  bozza: 'Bozza', confermato: 'Confermato', in_lavorazione: 'In Lavorazione',
  spedito: 'Spedito', consegnato: 'Consegnato'
};

const emptyLine = () => ({ prodottoId: '', descrizione: '', quantita: 1, prezzoUnitario: 0 });

const emptyOrdine = (tipo) => ({
  tipo, clienteId: '', fornitoreId: '', data: new Date().toISOString().split('T')[0],
  dataConsegna: '', corriere: '', tracking: '', note: '', stato: 'bozza', righe: [emptyLine()]
});

export default function OrdiniVenditeModule({ isMobile }) {
  const [subTab, setSubTab] = useState('vendita');
  const [ordini, setOrdini] = useState([]);
  const [prodotti, setProdotti] = useState([]);
  const [search, setSearch] = useState('');
  const [statoFilter, setStatoFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyOrdine('vendita'));
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [o, p] = await Promise.all([ordiniService.getAll(), prodottiService.getAll()]);
      setOrdini(o || []);
      setProdotti(p || []);
    } catch (e) { logger.error('Errore caricamento ordini:', e); }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return ordini.filter(o => {
      if (o.tipo !== subTab) return false;
      if (statoFilter && o.stato !== statoFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (o.numero || '').toLowerCase().includes(s) ||
          (o.clienteId || '').toLowerCase().includes(s) ||
          (o.fornitoreId || '').toLowerCase().includes(s) ||
          (o.note || '').toLowerCase().includes(s);
      }
      return true;
    });
  }, [ordini, subTab, statoFilter, search]);

  const stats = useMemo(() => {
    const list = filtered;
    const inCorso = list.filter(o => !['consegnato', 'bozza'].includes(o.stato)).length;
    const totale = list.reduce((s, o) => s + (o.totale || 0), 0);
    return {
      totali: list.length, inCorso, valoreTotale: totale,
      media: list.length ? totale / list.length : 0
    };
  }, [filtered]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyOrdine(subTab));
    setShowForm(true);
  };

  const openEdit = (ordine) => {
    setEditing(ordine.id);
    setForm({ ...ordine, righe: ordine.righe?.length ? ordine.righe : [emptyLine()] });
    setShowForm(true);
  };

  const handleSave = async () => {
    const totale = form.righe.reduce((s, r) => s + (r.quantita * r.prezzoUnitario), 0);
    const payload = { ...form, totale };
    try {
      if (editing) { await ordiniService.update(editing, payload); }
      else { await ordiniService.create(payload); }
      await loadData();
      setShowForm(false);
    } catch (e) { logger.error('Errore salvataggio ordine:', e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare questo ordine?')) return;
    try { await ordiniService.delete(id); await loadData(); } catch (e) { logger.error(e); }
  };

  const changeStato = async (ordine) => {
    const idx = PIPELINE.indexOf(ordine.stato);
    if (idx < PIPELINE.length - 1) {
      const nuovoStato = PIPELINE[idx + 1];
      try { await ordiniService.update(ordine.id, { ...ordine, stato: nuovoStato }); await loadData(); }
      catch (e) { logger.error(e); }
    }
  };

  const generaFattura = async (ordine) => {
    if (!window.confirm(`Generare fattura per l'ordine ${ordine.numero || ordine.id}?`)) return;
    try {
      const righe = typeof ordine.righe === 'string' ? JSON.parse(ordine.righe) : (ordine.righe || []);
      const imponibile = ordine.totale ? parseFloat(ordine.totale) / 1.22 : 0;
      const iva = ordine.totale ? parseFloat(ordine.totale) - imponibile : 0;

      const fatturaData = {
        tipo: 'vendita',
        clienteId: ordine.clienteId || '',
        clienteNome: ordine.clienteNome || ordine.clienteId || '',
        dataEmissione: new Date().toISOString(),
        dataScadenza: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        righe: righe,
        imponibile: Math.round(imponibile * 100) / 100,
        iva: Math.round(iva * 100) / 100,
        totale: parseFloat(ordine.totale) || 0,
        aliquotaIva: 22,
        note: `Generata automaticamente da ordine ${ordine.numero || ordine.id}`,
        metodoPagamento: '',
      };

      const result = await fattureService.create(fatturaData);
      if (result) {
        showToast(`Fattura ${result.numero || 'FT-...'} creata in stato BOZZA! Vai alla sezione Fatturazione per visualizzarla.`, 'success');
      } else {
        showToast('Errore nella creazione della fattura. Riprova.', 'error');
      }
    } catch (e) {
      logger.error('Errore generazione fattura:', e);
      showToast('Errore: ' + (e.message || 'Impossibile generare la fattura'), 'error');
    }
  };

  const updateRiga = (index, field, value) => {
    const righe = [...form.righe];
    righe[index] = { ...righe[index], [field]: value };
    setForm({ ...form, righe });
  };

  const addRiga = () => setForm({ ...form, righe: [...form.righe, emptyLine()] });
  const removeRiga = (i) => setForm({ ...form, righe: form.righe.filter((_, idx) => idx !== i) });

  const handleExport = (type) => {
    const data = filtered.map(o => ({
      Numero: o.numero, Data: formatDate(o.data), Tipo: o.tipo,
      Riferimento: o.tipo === 'vendita' ? o.clienteId : o.fornitoreId,
      Totale: o.totale, Stato: PIPELINE_LABELS[o.stato] || o.stato,
      Consegna: formatDate(o.dataConsegna)
    }));
    type === 'json' ? exportToJSON(data, 'ordini') : exportToCSV(data, 'ordini');
  };

  const StatusPipeline = ({ stato }) => (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
      {PIPELINE.map((step, i) => {
        const active = PIPELINE.indexOf(stato) >= i;
        return (
          <React.Fragment key={step}>
            {i > 0 && <span style={{ color: active ? PIPELINE_COLORS[step] : '#ccc', fontSize: 14 }}>&#9654;</span>}
            <span style={{
              padding: '2px 8px', borderRadius: 12, fontSize: 14, fontWeight: active ? 600 : 400,
              background: active ? PIPELINE_COLORS[step] + '22' : '#f0f0f0', // palette
              color: active ? PIPELINE_COLORS[step] : '#737373', // palette
              border: `1px solid ${active ? PIPELINE_COLORS[step] : '#ddd'}`
            }}>{PIPELINE_LABELS[step]}</span>
          </React.Fragment>
        );
      })}
    </div>
  );

  const columns = [
    { key: 'numero', label: 'Numero', render: (v) => <strong>{v || '-'}</strong> },
    { key: 'data', label: 'Data', render: (v) => formatDate(v) },
    { key: subTab === 'vendita' ? 'clienteId' : 'fornitoreId', label: subTab === 'vendita' ? 'Cliente' : 'Fornitore', render: (v) => truncate(v, 25) || '-' },
    { key: 'totale', label: 'Totale', render: (v) => formatCurrency(v) },
    { key: 'stato', label: 'Stato', render: (v) => <StatusPipeline stato={v} /> },
    { key: 'dataConsegna', label: 'Consegna Prevista', render: (v, row) => {
      const overdue = v && isOverdue(v) && row.stato !== 'consegnato';
      return <span style={{ color: overdue ? COLORS.danger : 'inherit', fontWeight: overdue ? 600 : 400 }}>
        {v ? formatDate(v) : '-'}{overdue && ' (in ritardo)'}
      </span>;
    }},
    { key: 'azioni', label: 'Azioni', render: (_, row) => (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <button style={{ ...S.btnSmall, ...S.btnPrimary }} onClick={() => openEdit(row)}>Modifica</button>
        {PIPELINE.indexOf(row.stato) < PIPELINE.length - 1 && (
          <button style={{ ...S.btnSmall, background: PIPELINE_COLORS[PIPELINE[PIPELINE.indexOf(row.stato) + 1]], color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 14 }}
            onClick={() => changeStato(row)}>Avanza Stato</button>
        )}
        {row.stato === 'consegnato' && row.tipo === 'vendita' && (
          <button style={{ ...S.btnSmall, background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 14 }}
            onClick={() => generaFattura(row)}>Genera Fattura</button>
        )}
        <button style={{ ...S.btnSmall, ...S.btnDanger }} onClick={() => handleDelete(row.id)}>Elimina</button>
      </div>
    )}
  ];

  if (showForm) {
    const rigaTotale = form.righe.reduce((s, r) => s + (r.quantita * r.prezzoUnitario), 0);
    return (
      <div style={S.moduleContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{editing ? 'Modifica Ordine' : 'Nuovo Ordine'}</h3>
          <button style={{ ...S.btn, ...S.btnSecondary }} onClick={() => setShowForm(false)}>Chiudi</button>
        </div>
        <div style={{ ...S.card, padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={S.label}>Tipo</label>
              <select style={S.input} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option value="vendita">Vendita</option><option value="acquisto">Acquisto</option>
              </select>
            </div>
            {form.tipo === 'vendita' ? (
              <div><label style={S.label}>Cliente</label>
                <input style={S.input} value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value })} placeholder="ID o nome cliente" /></div>
            ) : (
              <div><label style={S.label}>Fornitore</label>
                <input style={S.input} value={form.fornitoreId} onChange={e => setForm({ ...form, fornitoreId: e.target.value })} placeholder="ID o nome fornitore" /></div>
            )}
            <div><label style={S.label}>Data</label>
              <input style={S.input} type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></div>
            <div><label style={S.label}>Consegna Prevista</label>
              <input style={S.input} type="date" value={form.dataConsegna} onChange={e => setForm({ ...form, dataConsegna: e.target.value })} /></div>
            <div><label style={S.label}>Corriere</label>
              <input style={S.input} value={form.corriere} onChange={e => setForm({ ...form, corriere: e.target.value })} placeholder="Nome corriere" /></div>
            <div><label style={S.label}>Tracking</label>
              <input style={S.input} value={form.tracking} onChange={e => setForm({ ...form, tracking: e.target.value })} placeholder="Codice tracking" /></div>
          </div>
          <div><label style={S.label}>Note</label>
            <textarea style={{ ...S.input, minHeight: 60 }} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>

          <h4 style={{ marginTop: 20, marginBottom: 8 }}>Righe Ordine</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: COLORS.backgroundAlt }}>
                  <th style={S.th}>Prodotto</th><th style={S.th}>Descrizione</th>
                  <th style={{ ...S.th, width: 80 }}>Qtà</th><th style={{ ...S.th, width: 100 }}>Prezzo</th>
                  <th style={{ ...S.th, width: 100 }}>Totale</th><th style={{ ...S.th, width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {form.righe.map((r, i) => (
                  <tr key={i}>
                    <td style={S.td}><input style={{ ...S.input, margin: 0 }} value={r.prodottoId} onChange={e => updateRiga(i, 'prodottoId', e.target.value)} placeholder="Codice prodotto" /></td>
                    <td style={S.td}><input style={{ ...S.input, margin: 0 }} value={r.descrizione} onChange={e => updateRiga(i, 'descrizione', e.target.value)} placeholder="Descrizione" /></td>
                    <td style={S.td}><input style={{ ...S.input, margin: 0, width: 60 }} type="number" min="1" value={r.quantita} onChange={e => updateRiga(i, 'quantita', parseInt(e.target.value) || 0)} /></td>
                    <td style={S.td}><input style={{ ...S.input, margin: 0, width: 80 }} type="number" step="0.01" value={r.prezzoUnitario} onChange={e => updateRiga(i, 'prezzoUnitario', parseFloat(e.target.value) || 0)} /></td>
                    <td style={{ ...S.td, fontWeight: 600 }}>{formatCurrency(r.quantita * r.prezzoUnitario)}</td>
                    <td style={S.td}>{form.righe.length > 1 && <button style={{ ...S.btnSmall, ...S.btnDanger }} onClick={() => removeRiga(i)}>X</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <button style={{ ...S.btn, ...S.btnSecondary }} onClick={addRiga}>+ Aggiungi Riga</button>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Totale: {formatCurrency(rigaTotale)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
            <button style={{ ...S.btn, ...S.btnSecondary }} onClick={() => setShowForm(false)}>Annulla</button>
            <button style={{ ...S.btn, ...S.btnPrimary }} onClick={handleSave}>Salva Ordine</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.moduleContainer}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        {[{ key: 'vendita', label: 'Vendite' }, { key: 'acquisto', label: 'Acquisti' }].map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)} style={{
            padding: '10px 24px', border: `1px solid ${COLORS.primary}`, cursor: 'pointer', fontWeight: 600, fontSize: 14,
            background: subTab === t.key ? COLORS.primary : '#fff', color: subTab === t.key ? '#fff' : COLORS.primary,
            borderRadius: t.key === 'vendita' ? '8px 0 0 8px' : '0 8px 8px 0'
          }}>{t.label}</button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...S.input, flex: 1, minWidth: 180, margin: 0 }} placeholder="Cerca ordini..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...S.input, width: 'auto', margin: 0 }} value={statoFilter} onChange={e => setStatoFilter(e.target.value)}>
          <option value="">Tutti gli stati</option>
          {PIPELINE.map(s => <option key={s} value={s}>{PIPELINE_LABELS[s]}</option>)}
        </select>
        <button style={{ ...S.btn, ...S.btnPrimary }} onClick={openNew}>+ Nuovo Ordine</button>
        <button style={{ ...S.btn, ...S.btnSecondary }} onClick={() => handleExport('csv')}>Esporta CSV</button>
        <button style={{ ...S.btn, ...S.btnSecondary }} onClick={() => handleExport('json')}>Esporta JSON</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Ordini Totali', value: stats.totali, color: COLORS.primary },
          { label: 'In Corso', value: stats.inCorso, color: '#f39c12' }, // palette
          { label: 'Valore Totale', value: formatCurrency(stats.valoreTotale), color: '#27ae60' }, // palette
          { label: 'Media Ordine', value: formatCurrency(stats.media), color: '#9b59b6' } // palette
        ].map((s, i) => (
          <div key={i} style={{ ...S.card, padding: 16, textAlign: 'center', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pipeline Legend */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: COLORS.textLight, marginRight: 4 }}>Pipeline:</span>
        {PIPELINE.map((step, i) => (
          <React.Fragment key={step}>
            {i > 0 && <span style={{ color: '#737373', fontSize: 14 }} aria-hidden="true">&#9654;</span>}
            <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 14, fontWeight: 600, background: PIPELINE_COLORS[step] + '22', color: PIPELINE_COLORS[step], border: `1px solid ${PIPELINE_COLORS[step]}` }}>
              {PIPELINE_LABELS[step]}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: COLORS.textLight }}>Caricamento ordini...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: COLORS.textLight }}>
          Nessun ordine {subTab === 'vendita' ? 'di vendita' : 'di acquisto'} trovato
        </div>
      ) : (
        <GestionaleTable columns={columns} data={filtered} isMobile={isMobile} />
      )}
    </div>
  );
}
