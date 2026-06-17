// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
import React, { useState, useEffect, useMemo } from 'react';
import { COLORS, S } from '../GestionaleStyles';
import { formatCurrency, formatDateTime, truncate } from '../shared/GestionaleUtils';
import { prodottiService, magazzinoService } from '../GestionaleService';
import GestionaleTable from '../shared/GestionaleTable';
import GestionaleForm from '../shared/GestionaleForm';
import GestionaleCard from '../shared/GestionaleCard';
import logger from '../../../../utils/logger';
import { showToast } from '../../../common/Toast';

const TIPI_MOVIMENTO = ['carico', 'scarico', 'rettifica'];
const TIPI_LABELS = { carico: 'Carico', scarico: 'Scarico', rettifica: 'Rettifica' };
const TIPI_COLORS = { carico: '#27ae60', scarico: '#e74c3c', rettifica: '#f39c12' }; // palette

const emptyProdotto = () => ({
  codice: '', nome: '', categoria: '', descrizione: '', giacenza: 0, giacenzaMinima: 0,
  prezzoVendita: 0, prezzoAcquisto: 0, unita: 'pz', fornitoreId: '', note: '', componentiKit: []
});

const emptyMovimento = () => ({
  prodottoId: '', tipo: 'carico', quantita: 1, motivo: '', riferimento: '', operatore: ''
});

export default function MagazzinoKitModule({ isMobile }) {
  const [subTab, setSubTab] = useState('prodotti');
  const [prodotti, setProdotti] = useState([]);
  const [movimenti, setMovimenti] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prodotti state
  const [searchProd, setSearchProd] = useState('');
  const [showProdForm, setShowProdForm] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [prodForm, setProdForm] = useState(emptyProdotto());
  const [quickAdjust, setQuickAdjust] = useState({});

  // Movimenti state
  const [searchMov, setSearchMov] = useState('');
  const [tipoMovFilter, setTipoMovFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showMovForm, setShowMovForm] = useState(false);
  const [movForm, setMovForm] = useState(emptyMovimento());

  // Kit state
  const [kitQty, setKitQty] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, m] = await Promise.all([prodottiService.getAll(), magazzinoService.getAll()]);
      setProdotti(p || []);
      setMovimenti(m || []);
    } catch (e) { logger.error('Errore caricamento magazzino:', e); }
    setLoading(false);
  };

  const sottoscorta = useMemo(() => prodotti.filter(p => p.categoria !== 'kit' && p.giacenza < p.giacenzaMinima), [prodotti]);
  const kitProdotti = useMemo(() => prodotti.filter(p => p.categoria === 'kit'), [prodotti]);

  // ----------- PRODOTTI TAB -----------
  const filteredProdotti = useMemo(() => {
    return prodotti.filter(p => {
      if (p.categoria === 'kit') return false;
      if (searchProd) {
        const s = searchProd.toLowerCase();
        return (p.codice || '').toLowerCase().includes(s) || (p.nome || '').toLowerCase().includes(s) || (p.categoria || '').toLowerCase().includes(s);
      }
      return true;
    });
  }, [prodotti, searchProd]);

  const openNewProd = () => { setEditingProd(null); setProdForm(emptyProdotto()); setShowProdForm(true); };
  const openEditProd = (p) => { setEditingProd(p.id); setProdForm({ ...p }); setShowProdForm(true); };

  const saveProdotto = async () => {
    try {
      if (editingProd) { await prodottiService.update(editingProd, prodForm); }
      else { await prodottiService.create(prodForm); }
      await loadData(); setShowProdForm(false);
    } catch (e) { logger.error('Errore salvataggio prodotto:', e); }
  };

  const deleteProdotto = async (id) => {
    if (!window.confirm('Eliminare questo prodotto?')) return;
    try { await prodottiService.delete(id); await loadData(); } catch (e) { logger.error(e); }
  };

  const applyQuickAdjust = async (prod) => {
    const adj = parseInt(quickAdjust[prod.id]);
    if (!adj || isNaN(adj)) return;
    const nuovaGiacenza = prod.giacenza + adj;
    try {
      await prodottiService.update(prod.id, { ...prod, giacenza: nuovaGiacenza });
      await magazzinoService.create({
        prodottoId: prod.id, tipo: adj > 0 ? 'carico' : 'scarico',
        quantita: Math.abs(adj), motivo: 'Rettifica rapida', riferimento: '', operatore: 'Sistema',
        data: new Date().toISOString()
      });
      setQuickAdjust({ ...quickAdjust, [prod.id]: '' });
      await loadData();
    } catch (e) { logger.error(e); }
  };

  const prodottiColumns = [
    { key: 'codice', label: 'Codice', render: (v) => <strong style={{ fontFamily: 'monospace' }}>{v || '-'}</strong> },
    { key: 'nome', label: 'Nome', render: (v) => truncate(v, 30) },
    { key: 'categoria', label: 'Categoria', render: (v) => <span style={{ padding: '2px 8px', borderRadius: 8, background: COLORS.backgroundAlt, fontSize: 14 }}>{v || '-'}</span> },
    { key: 'giacenza', label: 'Giacenza', render: (v, row) => {
      const low = v < row.giacenzaMinima;
      return <span style={{ fontWeight: 700, color: low ? COLORS.danger : COLORS.success }}>{v} {row.unita || 'pz'}{low && ' !'}</span>;
    }},
    { key: 'giacenzaMinima', label: 'Giac. Min', render: (v) => v },
    { key: 'prezzoVendita', label: 'Prezzo Vendita', render: (v) => formatCurrency(v) },
    { key: 'prezzoAcquisto', label: 'Prezzo Acquisto', render: (v) => formatCurrency(v) },
    { key: 'azioni', label: 'Azioni', render: (_, row) => (
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        <input style={{ ...S.input, width: 55, margin: 0, padding: '2px 4px', fontSize: 14 }} type="number"
          value={quickAdjust[row.id] || ''} onChange={e => setQuickAdjust({ ...quickAdjust, [row.id]: e.target.value })}
          placeholder="+/-" />
        <button style={{ ...S.btnSmall, background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 14 }}
          onClick={() => applyQuickAdjust(row)} disabled={!quickAdjust[row.id]}>Applica</button>
        <button style={{ ...S.btnSmall, ...S.btnPrimary }} onClick={() => openEditProd(row)}>Modifica</button>
        <button style={{ ...S.btnSmall, ...S.btnDanger }} onClick={() => deleteProdotto(row.id)}>Elimina</button>
      </div>
    )}
  ];

  // ----------- MOVIMENTI TAB -----------
  const filteredMovimenti = useMemo(() => {
    return movimenti.filter(m => {
      if (tipoMovFilter && m.tipo !== tipoMovFilter) return false;
      if (searchMov) {
        const s = searchMov.toLowerCase();
        if (!(m.prodottoId || '').toLowerCase().includes(s) && !(m.motivo || '').toLowerCase().includes(s) && !(m.riferimento || '').toLowerCase().includes(s)) return false;
      }
      if (dateFrom && m.data && m.data < dateFrom) return false;
      if (dateTo && m.data && m.data > dateTo + 'T23:59:59') return false;
      return true;
    });
  }, [movimenti, tipoMovFilter, searchMov, dateFrom, dateTo]);

  const saveMovimento = async () => {
    try {
      const mov = { ...movForm, data: new Date().toISOString() };
      await magazzinoService.create(mov);
      // Aggiorna giacenza prodotto
      const prod = prodotti.find(p => p.id === movForm.prodottoId || p.codice === movForm.prodottoId);
      if (prod) {
        const delta = movForm.tipo === 'carico' ? movForm.quantita : movForm.tipo === 'scarico' ? -movForm.quantita : movForm.quantita;
        await prodottiService.update(prod.id, { ...prod, giacenza: prod.giacenza + delta });
      }
      await loadData(); setShowMovForm(false); setMovForm(emptyMovimento());
    } catch (e) { logger.error('Errore salvataggio movimento:', e); }
  };

  const movimentiColumns = [
    { key: 'data', label: 'Data', render: (v) => formatDateTime(v) },
    { key: 'prodottoId', label: 'Prodotto', render: (v) => { const p = prodotti.find(pr => pr.id === v); return p ? p.nome : v; } },
    { key: 'tipo', label: 'Tipo', render: (v) => (
      <span style={{ padding: '2px 10px', borderRadius: 8, fontWeight: 600, fontSize: 14, background: TIPI_COLORS[v] + '22', color: TIPI_COLORS[v] }}>{TIPI_LABELS[v] || v}</span>
    )},
    { key: 'quantita', label: 'Quantità', render: (v, row) => (
      <span style={{ fontWeight: 700, color: row.tipo === 'carico' ? '#27ae60' : row.tipo === 'scarico' ? '#e74c3c' : '#f39c12' }}>
        {row.tipo === 'carico' ? '+' : row.tipo === 'scarico' ? '-' : ''}{v}
      </span>
    )},
    { key: 'motivo', label: 'Motivo', render: (v) => truncate(v, 30) },
    { key: 'riferimento', label: 'Riferimento', render: (v) => v || '-' },
    { key: 'operatore', label: 'Operatore', render: (v) => v || '-' }
  ];

  // ----------- KIT TAB -----------
  const checkComponentAvailability = (kit) => {
    if (!kit.componentiKit || !kit.componentiKit.length) return [];
    return kit.componentiKit.map(comp => {
      const prod = prodotti.find(p => p.id === comp.prodottoId || p.codice === comp.prodottoId);
      return { ...comp, prodotto: prod, disponibile: prod ? prod.giacenza : 0, sufficiente: prod ? prod.giacenza >= comp.quantita : false };
    });
  };

  const assemblaKit = async (kit, qty) => {
    const n = parseInt(qty) || 1;
    const componenti = checkComponentAvailability(kit);
    const insufficienti = componenti.filter(c => c.disponibile < c.quantita * n);
    if (insufficienti.length > 0) {
      showToast(`Componenti insufficienti: ${insufficienti.map(c => c.prodotto?.nome || c.prodottoId).join(', ')}`, 'warning');
      return;
    }
    try {
      for (const comp of componenti) {
        if (comp.prodotto) {
          await prodottiService.update(comp.prodotto.id, { ...comp.prodotto, giacenza: comp.prodotto.giacenza - (comp.quantita * n) });
          await magazzinoService.create({
            prodottoId: comp.prodotto.id, tipo: 'scarico', quantita: comp.quantita * n,
            motivo: `Assemblaggio kit: ${kit.nome}`, riferimento: kit.id, operatore: 'Sistema',
            data: new Date().toISOString()
          });
        }
      }
      await prodottiService.update(kit.id, { ...kit, giacenza: (kit.giacenza || 0) + n });
      await magazzinoService.create({
        prodottoId: kit.id, tipo: 'carico', quantita: n,
        motivo: 'Assemblaggio kit', riferimento: kit.id, operatore: 'Sistema',
        data: new Date().toISOString()
      });
      setKitQty({ ...kitQty, [kit.id]: '' });
      await loadData();
      showToast(`Kit "${kit.nome}" assemblato x${n} con successo!`, 'success');
    } catch (e) { logger.error('Errore assemblaggio kit:', e); showToast('Errore durante assemblaggio.', 'error'); }
  };

  const tabs = [
    { key: 'prodotti', label: 'Prodotti' },
    { key: 'movimenti', label: 'Movimenti' },
    { key: 'kit', label: 'Kit' }
  ];

  return (
    <div style={S.moduleContainer}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        {tabs.map((t, i) => (
          <button key={t.key} onClick={() => setSubTab(t.key)} style={{
            padding: '10px 24px', border: `1px solid ${COLORS.primary}`, cursor: 'pointer', fontWeight: 600, fontSize: 14,
            background: subTab === t.key ? COLORS.primary : '#fff', color: subTab === t.key ? '#fff' : COLORS.primary,
            borderRadius: i === 0 ? '8px 0 0 8px' : i === tabs.length - 1 ? '0 8px 8px 0' : '0'
          }}>{t.label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: COLORS.textLight }}>Caricamento...</div>}

      {/* ======== PRODOTTI ======== */}
      {!loading && subTab === 'prodotti' && (
        <>
          {sottoscorta.length > 0 && (
            <div style={{ padding: 12, background: '#fcf3cf', border: '1px solid #f39c12', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>!</span>
              <span style={{ fontWeight: 600, color: '#7d6608' }}>Attenzione: {sottoscorta.length} prodott{sottoscorta.length === 1 ? 'o' : 'i'} sottoscorta: {sottoscorta.map(p => p.nome).join(', ')}</span>
            </div>
          )}

          {showProdForm ? (
            <div style={{ ...S.card, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>{editingProd ? 'Modifica Prodotto' : 'Nuovo Prodotto'}</h4>
                <button style={{ ...S.btn, ...S.btnSecondary }} onClick={() => setShowProdForm(false)}>Chiudi</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12 }}>
                <div><label style={S.label}>Codice</label><input style={S.input} value={prodForm.codice} onChange={e => setProdForm({ ...prodForm, codice: e.target.value })} /></div>
                <div><label style={S.label}>Nome</label><input style={S.input} value={prodForm.nome} onChange={e => setProdForm({ ...prodForm, nome: e.target.value })} /></div>
                <div><label style={S.label}>Categoria</label><input style={S.input} value={prodForm.categoria} onChange={e => setProdForm({ ...prodForm, categoria: e.target.value })} placeholder="es. elettronica, packaging..." /></div>
                <div><label style={S.label}>Giacenza</label><input style={S.input} type="number" value={prodForm.giacenza} onChange={e => setProdForm({ ...prodForm, giacenza: parseInt(e.target.value) || 0 })} /></div>
                <div><label style={S.label}>Giacenza Minima</label><input style={S.input} type="number" value={prodForm.giacenzaMinima} onChange={e => setProdForm({ ...prodForm, giacenzaMinima: parseInt(e.target.value) || 0 })} /></div>
                <div><label style={S.label}>Unità</label><input style={S.input} value={prodForm.unita} onChange={e => setProdForm({ ...prodForm, unita: e.target.value })} placeholder="pz, kg, m..." /></div>
                <div><label style={S.label}>Prezzo Vendita</label><input style={S.input} type="number" step="0.01" value={prodForm.prezzoVendita} onChange={e => setProdForm({ ...prodForm, prezzoVendita: parseFloat(e.target.value) || 0 })} /></div>
                <div><label style={S.label}>Prezzo Acquisto</label><input style={S.input} type="number" step="0.01" value={prodForm.prezzoAcquisto} onChange={e => setProdForm({ ...prodForm, prezzoAcquisto: parseFloat(e.target.value) || 0 })} /></div>
                <div><label style={S.label}>Fornitore</label><input style={S.input} value={prodForm.fornitoreId} onChange={e => setProdForm({ ...prodForm, fornitoreId: e.target.value })} /></div>
              </div>
              <div style={{ marginTop: 8 }}><label style={S.label}>Note</label><textarea style={{ ...S.input, minHeight: 50 }} value={prodForm.note} onChange={e => setProdForm({ ...prodForm, note: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                <button style={{ ...S.btn, ...S.btnSecondary }} onClick={() => setShowProdForm(false)}>Annulla</button>
                <button style={{ ...S.btn, ...S.btnPrimary }} onClick={saveProdotto}>Salva Prodotto</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <input style={{ ...S.input, flex: 1, minWidth: 180, margin: 0 }} placeholder="Cerca prodotti..." value={searchProd} onChange={e => setSearchProd(e.target.value)} />
              <button style={{ ...S.btn, ...S.btnPrimary }} onClick={openNewProd}>+ Nuovo Prodotto</button>
            </div>
          )}

          {!showProdForm && (filteredProdotti.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: COLORS.textLight }}>Nessun prodotto trovato</div>
          ) : (
            <GestionaleTable columns={prodottiColumns} data={filteredProdotti} isMobile={isMobile} />
          ))}
        </>
      )}

      {/* ======== MOVIMENTI ======== */}
      {!loading && subTab === 'movimenti' && (
        <>
          {showMovForm ? (
            <div style={{ ...S.card, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>Nuovo Movimento</h4>
                <button style={{ ...S.btn, ...S.btnSecondary }} onClick={() => setShowMovForm(false)}>Chiudi</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12 }}>
                <div><label style={S.label}>Prodotto</label>
                  <select style={S.input} value={movForm.prodottoId} onChange={e => setMovForm({ ...movForm, prodottoId: e.target.value })}>
                    <option value="">Seleziona prodotto</option>
                    {prodotti.map(p => <option key={p.id} value={p.id}>{p.codice} - {p.nome}</option>)}
                  </select>
                </div>
                <div><label style={S.label}>Tipo</label>
                  <select style={S.input} value={movForm.tipo} onChange={e => setMovForm({ ...movForm, tipo: e.target.value })}>
                    {TIPI_MOVIMENTO.map(t => <option key={t} value={t}>{TIPI_LABELS[t]}</option>)}
                  </select>
                </div>
                <div><label style={S.label}>Quantità</label><input style={S.input} type="number" min="1" value={movForm.quantita} onChange={e => setMovForm({ ...movForm, quantita: parseInt(e.target.value) || 0 })} /></div>
                <div><label style={S.label}>Motivo</label><input style={S.input} value={movForm.motivo} onChange={e => setMovForm({ ...movForm, motivo: e.target.value })} placeholder="es. Ordine #123" /></div>
                <div><label style={S.label}>Riferimento</label><input style={S.input} value={movForm.riferimento} onChange={e => setMovForm({ ...movForm, riferimento: e.target.value })} /></div>
                <div><label style={S.label}>Operatore</label><input style={S.input} value={movForm.operatore} onChange={e => setMovForm({ ...movForm, operatore: e.target.value })} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                <button style={{ ...S.btn, ...S.btnSecondary }} onClick={() => setShowMovForm(false)}>Annulla</button>
                <button style={{ ...S.btn, ...S.btnPrimary }} onClick={saveMovimento}>Registra Movimento</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <input style={{ ...S.input, flex: 1, minWidth: 150, margin: 0 }} placeholder="Cerca movimenti..." value={searchMov} onChange={e => setSearchMov(e.target.value)} />
              <select style={{ ...S.input, width: 'auto', margin: 0 }} value={tipoMovFilter} onChange={e => setTipoMovFilter(e.target.value)}>
                <option value="">Tutti i tipi</option>
                {TIPI_MOVIMENTO.map(t => <option key={t} value={t}>{TIPI_LABELS[t]}</option>)}
              </select>
              <input style={{ ...S.input, width: 'auto', margin: 0 }} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="Data da" />
              <input style={{ ...S.input, width: 'auto', margin: 0 }} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} title="Data a" />
              <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => { setMovForm(emptyMovimento()); setShowMovForm(true); }}>+ Nuovo Movimento</button>
            </div>
          )}

          {!showMovForm && (filteredMovimenti.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: COLORS.textLight }}>Nessun movimento trovato</div>
          ) : (
            <GestionaleTable columns={movimentiColumns} data={filteredMovimenti} isMobile={isMobile} />
          ))}
        </>
      )}

      {/* ======== KIT ======== */}
      {!loading && subTab === 'kit' && (
        <>
          {kitProdotti.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: COLORS.textLight }}>Nessun kit configurato. Crea un prodotto con categoria "kit" e definisci i componenti.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
              {kitProdotti.map(kit => {
                const componenti = checkComponentAvailability(kit);
                const tuttiDisponibili = componenti.length > 0 && componenti.every(c => c.sufficiente);
                return (
                  <div key={kit.id} style={{ ...S.card, padding: 20, borderLeft: `4px solid ${tuttiDisponibili ? '#27ae60' : '#e74c3c'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0' }}>{kit.nome}</h4>
                        <span style={{ fontSize: 14, color: COLORS.textLight }}>Codice: {kit.codice} | Giacenza: <strong>{kit.giacenza || 0}</strong></span>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                        background: tuttiDisponibili ? '#27ae6022' : '#e74c3c22',
                        color: tuttiDisponibili ? '#27ae60' : '#e74c3c' // palette
                      }}>{tuttiDisponibili ? 'Assemblabile' : 'Componenti mancanti'}</span>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: COLORS.text }}>Componenti:</div>
                      {componenti.length === 0 ? (
                        <div style={{ fontSize: 14, color: COLORS.textLight, fontStyle: 'italic' }}>Nessun componente definito</div>
                      ) : (
                        componenti.map((comp, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: i % 2 === 0 ? '#f9f9f9' : '#fff', borderRadius: 4, fontSize: 14 }}>
                            <span>{comp.prodotto?.nome || comp.prodottoId}</span>
                            <span style={{ fontWeight: 600, color: comp.sufficiente ? '#27ae60' : '#e74c3c' }}>
                              {comp.disponibile}/{comp.quantita} {comp.sufficiente ? '' : '(insufficiente)'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {componenti.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input style={{ ...S.input, width: 70, margin: 0 }} type="number" min="1" value={kitQty[kit.id] || ''}
                          onChange={e => setKitQty({ ...kitQty, [kit.id]: e.target.value })} placeholder="Qtà" />
                        <button style={{
                          ...S.btn, ...S.btnPrimary, opacity: tuttiDisponibili ? 1 : 0.5, cursor: tuttiDisponibili ? 'pointer' : 'not-allowed'
                        }} onClick={() => tuttiDisponibili && assemblaKit(kit, kitQty[kit.id] || 1)} disabled={!tuttiDisponibili}>
                          Assembla Kit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
