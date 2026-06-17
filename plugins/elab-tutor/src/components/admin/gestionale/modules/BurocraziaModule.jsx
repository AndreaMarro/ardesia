// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Modulo Burocrazia
// Documenti aziendali e scadenzario
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { COLORS, S, getStatusStyle, getStatusLabel } from '../GestionaleStyles';
import { documentiService } from '../GestionaleService';
import { formatCurrency, formatDate, daysUntil, isOverdue, truncate, exportToJSON, exportToCSV } from '../shared/GestionaleUtils';
import GestionaleTable from '../shared/GestionaleTable';
import GestionaleForm from '../shared/GestionaleForm';
import GestionaleCard from '../shared/GestionaleCard';
import logger from '../../../../utils/logger';

// ── Costanti Documenti ────────────────────────
const TIPI_DOCUMENTO = [
  { value: 'visura_camerale', label: 'Visura Camerale', icon: '' },
  { value: 'certificato', label: 'Certificato', icon: '' },
  { value: 'polizza', label: 'Polizza', icon: '' },
  { value: 'contratto', label: 'Contratto', icon: '' },
  { value: 'licenza', label: 'Licenza', icon: '' },
  { value: 'altro', label: 'Altro', icon: '' },
];

const STATI_DOCUMENTO = [
  { value: 'valido', label: 'Valido' },
  { value: 'in_scadenza', label: 'In Scadenza' },
  { value: 'scaduto', label: 'Scaduto' },
  { value: 'archiviato', label: 'Archiviato' },
];

// ── Costanti Scadenze ─────────────────────────
const TIPI_SCADENZA = [
  { value: 'fiscale', label: 'Fiscale' },
  { value: 'legale', label: 'Legale' },
  { value: 'amministrativa', label: 'Amministrativa' },
  { value: 'contrattuale', label: 'Contrattuale' },
];

const RICORRENZE = [
  { value: 'mensile', label: 'Mensile' },
  { value: 'trimestrale', label: 'Trimestrale' },
  { value: 'semestrale', label: 'Semestrale' },
  { value: 'annuale', label: 'Annuale' },
  { value: 'una_tantum', label: 'Una Tantum' },
];

const STATI_SCADENZA = [
  { value: 'pianificata', label: 'Pianificata' },
  { value: 'in_corso', label: 'In Corso' },
  { value: 'completata', label: 'Completata' },
  { value: 'sospesa', label: 'Sospesa' },
];

// ── Colori per tipo scadenza ──────────────────
const TIPO_SCAD_COLORS = {
  fiscale: 'var(--elab-hex-dc2626)',
  legale: 'var(--elab-hex-7c3aed)',
  amministrativa: 'var(--elab-hex-2563eb)',
  contrattuale: 'var(--elab-hex-d97706)',
};

// ── Helper: colore scadenza in base ai giorni ──
function getScadenzaColor(dataScadenza) {
  if (!dataScadenza) return COLORS.textMuted;
  const days = daysUntil(dataScadenza);
  if (days === null) return COLORS.textMuted;
  if (days < 0) return COLORS.danger;
  if (days < 7) return COLORS.danger;
  if (days <= 30) return COLORS.warning;
  return COLORS.success;
}

function getScadenzaBg(dataScadenza) {
  if (!dataScadenza) return 'transparent';
  const days = daysUntil(dataScadenza);
  if (days === null) return 'transparent';
  if (days < 0) return COLORS.dangerBg;
  if (days < 7) return COLORS.dangerBg;
  if (days <= 30) return COLORS.warningBg;
  return COLORS.successBg;
}

function getScadenzaLabel(dataScadenza) {
  if (!dataScadenza) return '';
  const days = daysUntil(dataScadenza);
  if (days === null) return '';
  if (days < 0) return `Scaduto da ${Math.abs(days)} gg`;
  if (days === 0) return 'Scade oggi';
  if (days === 1) return 'Scade domani';
  if (days <= 30) return `Scade tra ${days} gg`;
  return `${days} gg rimanenti`;
}

function computeAutoStatus(dataScadenza, currentStato) {
  if (!dataScadenza || currentStato === 'archiviato') return currentStato || 'valido';
  const days = daysUntil(dataScadenza);
  if (days === null) return currentStato || 'valido';
  if (days < 0) return 'scaduto';
  if (days <= 30) return 'in_scadenza';
  return 'valido';
}

function getTipoDocIcon(tipo) {
  const found = TIPI_DOCUMENTO.find(t => t.value === tipo);
  return found ? found.icon : '';
}

function getTipoDocLabel(tipo) {
  const found = TIPI_DOCUMENTO.find(t => t.value === tipo);
  return found ? found.label : tipo || '\u2014';
}

function getTipoScadenzaLabel(tipo) {
  const found = TIPI_SCADENZA.find(t => t.value === tipo);
  return found ? found.label : tipo || '\u2014';
}

function getRicorrenzaLabel(ricorrenza) {
  const found = RICORRENZE.find(r => r.value === ricorrenza);
  return found ? found.label : ricorrenza || '\u2014';
}

// ── Form vuoti ────────────────────────────────
const emptyDocumentoForm = () => ({
  titolo: '',
  descrizione: '',
  tipo: 'certificato',
  dataEmissione: new Date().toISOString().split('T')[0],
  dataScadenza: '',
  stato: 'valido',
  ente: '',
  riferimento: '',
  note: '',
});

const emptyScadenzaForm = () => ({
  titolo: '',
  descrizione: '',
  tipo: 'fiscale',
  dataScadenza: '',
  ricorrenza: 'una_tantum',
  stato: 'pianificata',
  importo: '',
  note: '',
});

// ── Definizione campi form Documenti ──────────
const documentoFormFields = [
  { key: 'tipo', label: 'Tipo Documento', type: 'select', required: true, options: TIPI_DOCUMENTO.map(t => ({ value: t.value, label: `${t.icon} ${t.label}` })) },
  { key: 'titolo', label: 'Titolo', required: true },
  { key: 'ente', label: 'Ente / Emittente' },
  { key: 'riferimento', label: 'Riferimento / Numero' },
  { key: 'dataEmissione', label: 'Data Emissione', type: 'date' },
  { key: 'dataScadenza', label: 'Data Scadenza', type: 'date' },
  { key: 'stato', label: 'Stato', type: 'select', required: true, options: STATI_DOCUMENTO },
  { key: 'descrizione', label: 'Descrizione', type: 'textarea', fullWidth: true },
  { key: 'note', label: 'Note', type: 'textarea', fullWidth: true },
];

// ── Definizione campi form Scadenze ───────────
const scadenzaFormFields = [
  { key: 'tipo', label: 'Tipo Scadenza', type: 'select', required: true, options: TIPI_SCADENZA },
  { key: 'titolo', label: 'Titolo', required: true },
  { key: 'dataScadenza', label: 'Data Scadenza', type: 'date', required: true },
  { key: 'ricorrenza', label: 'Ricorrenza', type: 'select', required: true, options: RICORRENZE },
  { key: 'importo', label: 'Importo', type: 'currency' },
  { key: 'stato', label: 'Stato', type: 'select', required: true, options: STATI_SCADENZA },
  { key: 'descrizione', label: 'Descrizione', type: 'textarea', fullWidth: true },
  { key: 'note', label: 'Note', type: 'textarea', fullWidth: true },
];

// ══════════════════════════════════════════════
// COMPONENTE PRINCIPALE
// ══════════════════════════════════════════════
export default function BurocraziaModule({ isMobile }) {

  // ── State ──────────────────────────────────
  const [tab, setTab] = useState('documenti');
  const [documenti, setDocumenti] = useState([]);
  const [scadenze, setScadenze] = useState([]);
  const [loading, setLoading] = useState(true);

  // Documenti state
  const [docSearch, setDocSearch] = useState('');
  const [docTipoFilter, setDocTipoFilter] = useState('');
  const [docStatoFilter, setDocStatoFilter] = useState('');
  const [showDocForm, setShowDocForm] = useState(false);
  const [docEditing, setDocEditing] = useState(null);
  const [docForm, setDocForm] = useState(emptyDocumentoForm());

  // Scadenze state
  const [scadSearch, setScadSearch] = useState('');
  const [scadTipoFilter, setScadTipoFilter] = useState('');
  const [scadStatoFilter, setScadStatoFilter] = useState('');
  const [showScadForm, setShowScadForm] = useState(false);
  const [scadEditing, setScadEditing] = useState(null);
  const [scadForm, setScadForm] = useState(emptyScadenzaForm());

  // ── Caricamento dati ───────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allDocs, allScad] = await Promise.all([
        documentiService.getAll(),
        documentiService.getScadenze(),
      ]);

      // Auto-aggiornamento stato documenti in base alla data scadenza
      let docs = (allDocs || []).map(doc => {
        if (doc.stato === 'archiviato') return doc;
        const autoStato = computeAutoStatus(doc.dataScadenza, doc.stato);
        return autoStato !== doc.stato ? { ...doc, stato: autoStato } : doc;
      });

      setDocumenti(docs);
      setScadenze(allScad || []);
    } catch (e) {
      logger.error('Errore caricamento burocrazia:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filtri Documenti ───────────────────────
  const filteredDocumenti = useMemo(() => {
    return documenti.filter(d => {
      if (docTipoFilter && d.tipo !== docTipoFilter) return false;
      if (docStatoFilter && d.stato !== docStatoFilter) return false;
      if (docSearch) {
        const q = docSearch.toLowerCase();
        const match =
          (d.titolo || '').toLowerCase().includes(q) ||
          (d.ente || '').toLowerCase().includes(q) ||
          (d.descrizione || '').toLowerCase().includes(q) ||
          (d.riferimento || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [documenti, docSearch, docTipoFilter, docStatoFilter]);

  // ── Filtri Scadenze ────────────────────────
  const filteredScadenze = useMemo(() => {
    return scadenze.filter(s => {
      if (scadTipoFilter && s.tipo !== scadTipoFilter) return false;
      if (scadStatoFilter && s.stato !== scadStatoFilter) return false;
      if (scadSearch) {
        const q = scadSearch.toLowerCase();
        const match =
          (s.titolo || '').toLowerCase().includes(q) ||
          (s.descrizione || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => (a.dataScadenza || '9999').localeCompare(b.dataScadenza || '9999'));
  }, [scadenze, scadSearch, scadTipoFilter, scadStatoFilter]);

  // ── Scadenze imminenti e scadute (alert) ───
  const alertScadenze = useMemo(() => {
    const scadute = [];
    const imminenti = [];

    // Scadenze dal servizio
    scadenze.forEach(s => {
      if (s.stato === 'completata' || s.stato === 'sospesa') return;
      const dateField = s.dataScadenza || s.data;
      const days = daysUntil(dateField);
      if (days === null) return;
      if (days < 0) {
        scadute.push({ ...s, dataScadenza: dateField, giorniMancanti: days, _tipo: 'scadenza' });
      } else if (days <= 14) {
        imminenti.push({ ...s, dataScadenza: dateField, giorniMancanti: days, _tipo: 'scadenza' });
      }
    });

    // Documenti in scadenza o scaduti
    documenti.forEach(d => {
      if (d.stato === 'archiviato' || !d.dataScadenza) return;
      const days = daysUntil(d.dataScadenza);
      if (days === null) return;
      if (days < 0) {
        scadute.push({ ...d, giorniMancanti: days, _tipo: 'documento' });
      } else if (days <= 14) {
        imminenti.push({ ...d, giorniMancanti: days, _tipo: 'documento' });
      }
    });

    scadute.sort((a, b) => a.giorniMancanti - b.giorniMancanti);
    imminenti.sort((a, b) => a.giorniMancanti - b.giorniMancanti);
    return { scadute, imminenti };
  }, [scadenze, documenti]);

  // ── KPI ────────────────────────────────────
  const kpi = useMemo(() => {
    const totalDocs = documenti.length;
    const docsValidi = documenti.filter(d => d.stato === 'valido').length;
    const docsScaduti = documenti.filter(d =>
      d.stato === 'scaduto' || (d.dataScadenza && isOverdue(d.dataScadenza) && d.stato !== 'archiviato')
    ).length;
    const docsInScadenza = documenti.filter(d => d.stato === 'in_scadenza').length;
    const totalScad = scadenze.length;
    const scadAttive = scadenze.filter(s => s.stato === 'pianificata' || s.stato === 'in_corso').length;
    const scadCompletate = scadenze.filter(s => s.stato === 'completata').length;
    return { totalDocs, docsValidi, docsScaduti, docsInScadenza, totalScad, scadAttive, scadCompletate };
  }, [documenti, scadenze]);

  // ── CRUD Documenti ─────────────────────────
  const openNewDoc = useCallback(() => {
    setDocEditing(null);
    setDocForm(emptyDocumentoForm());
    setShowDocForm(true);
  }, []);

  const openEditDoc = useCallback((doc) => {
    setDocEditing(doc.id);
    setDocForm({
      titolo: doc.titolo || '',
      descrizione: doc.descrizione || '',
      tipo: doc.tipo || 'certificato',
      dataEmissione: doc.dataEmissione || '',
      dataScadenza: doc.dataScadenza || '',
      stato: doc.stato || 'valido',
      ente: doc.ente || '',
      riferimento: doc.riferimento || doc.riferimentoId || '',
      note: doc.note || '',
    });
    setShowDocForm(true);
  }, []);

  const handleSaveDoc = useCallback(async (vals) => {
    try {
      // Auto-calcola stato se non archiviato
      const autoStato = vals.stato === 'archiviato' ? 'archiviato' : computeAutoStatus(vals.dataScadenza, vals.stato);
      const dataToSave = { ...vals, stato: autoStato };

      if (docEditing) {
        await documentiService.update(docEditing, dataToSave);
      } else {
        await documentiService.create(dataToSave);
      }
      await loadData();
      setShowDocForm(false);
    } catch (e) {
      logger.error('Errore salvataggio documento:', e);
    }
  }, [docEditing, loadData]);

  const handleDeleteDoc = useCallback(async (id) => {
    if (!window.confirm('Eliminare questo documento?')) return;
    try {
      await documentiService.delete(id);
      await loadData();
    } catch (e) {
      logger.error('Errore eliminazione documento:', e);
    }
  }, [loadData]);

  // ── CRUD Scadenze ──────────────────────────
  const openNewScad = useCallback(() => {
    setScadEditing(null);
    setScadForm(emptyScadenzaForm());
    setShowScadForm(true);
  }, []);

  const openEditScad = useCallback((scad) => {
    setScadEditing(scad.id);
    setScadForm({
      titolo: scad.titolo || '',
      descrizione: scad.descrizione || '',
      tipo: scad.tipo || 'fiscale',
      dataScadenza: scad.dataScadenza || scad.data || '',
      ricorrenza: scad.ricorrenza || scad.frequenza || 'una_tantum',
      stato: scad.stato || 'pianificata',
      importo: scad.importo || '',
      note: scad.note || '',
    });
    setShowScadForm(true);
  }, []);

  const handleSaveScad = useCallback(async (vals) => {
    try {
      if (scadEditing) {
        await documentiService.updateScadenza(scadEditing, vals);
      } else {
        await documentiService.createScadenza(vals);
      }
      await loadData();
      setShowScadForm(false);
    } catch (e) {
      logger.error('Errore salvataggio scadenza:', e);
    }
  }, [scadEditing, loadData]);

  const handleDeleteScad = useCallback(async (id) => {
    if (!window.confirm('Eliminare questa scadenza?')) return;
    try {
      await documentiService.deleteScadenza(id);
      await loadData();
    } catch (e) {
      logger.error('Errore eliminazione scadenza:', e);
    }
  }, [loadData]);

  // ── Colonne Tabella Documenti ──────────────
  const docColumns = useMemo(() => [
    {
      key: 'tipo',
      label: 'Tipo',
      render: (v) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px' }}>{getTipoDocIcon(v)}</span>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>{getTipoDocLabel(v)}</span>
        </span>
      ),
    },
    {
      key: 'titolo',
      label: 'Titolo',
      render: (v) => (
        <span style={{ fontWeight: 600, color: COLORS.textPrimary }}>{truncate(v, 40)}</span>
      ),
    },
    {
      key: 'ente',
      label: 'Ente',
      render: (v) => v || '\u2014',
    },
    {
      key: 'dataEmissione',
      label: 'Emissione',
      render: (v) => formatDate(v),
    },
    {
      key: 'dataScadenza',
      label: 'Scadenza',
      render: (v) => {
        if (!v) return '\u2014';
        const color = getScadenzaColor(v);
        const bg = getScadenzaBg(v);
        const label = getScadenzaLabel(v);
        return (
          <div>
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: color,
              background: bg,
            }}>
              {formatDate(v)}
            </span>
            {label && (
              <div style={{ fontSize: '14px', color: color, marginTop: '2px', fontWeight: 500 }}>
                {label}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'stato',
      label: 'Stato',
      render: (v) => (
        <span style={getStatusStyle(v)}>{getStatusLabel(v)}</span>
      ),
    },
    {
      key: 'azioni',
      label: 'Azioni',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={{ ...S.btnSmall, background: COLORS.accentLight, color: '#fff' }}
            onClick={(e) => { e.stopPropagation(); openEditDoc(row); }}
          >
            Modifica
          </button>
          <button
            style={{ ...S.btnSmall, background: COLORS.danger, color: '#fff' }}
            onClick={(e) => { e.stopPropagation(); handleDeleteDoc(row.id); }}
          >
            Elimina
          </button>
        </div>
      ),
    },
  ], [openEditDoc, handleDeleteDoc]);

  // ── Colonne Tabella Scadenze ───────────────
  const scadColumns = useMemo(() => [
    {
      key: 'tipo',
      label: 'Tipo',
      render: (v) => (
        <span style={{
          ...S.badge(TIPO_SCAD_COLORS[v] || COLORS.info),
        }}>
          {getTipoScadenzaLabel(v)}
        </span>
      ),
    },
    {
      key: 'titolo',
      label: 'Titolo',
      render: (v) => (
        <span style={{ fontWeight: 600, color: COLORS.textPrimary }}>{truncate(v, 40)}</span>
      ),
    },
    {
      key: 'dataScadenza',
      label: 'Scadenza',
      render: (v, row) => {
        const dateVal = v || row.data;
        if (!dateVal) return '\u2014';
        const color = getScadenzaColor(dateVal);
        const bg = getScadenzaBg(dateVal);
        const label = getScadenzaLabel(dateVal);
        return (
          <div>
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: color,
              background: bg,
            }}>
              {formatDate(dateVal)}
            </span>
            {label && (
              <div style={{ fontSize: '14px', color: color, marginTop: '2px', fontWeight: 500 }}>
                {label}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'ricorrenza',
      label: 'Ricorrenza',
      render: (v, row) => getRicorrenzaLabel(v || row.frequenza),
    },
    {
      key: 'importo',
      label: 'Importo',
      render: (v) => {
        if (!v && v !== 0) return '\u2014';
        const num = parseFloat(v);
        if (isNaN(num) || num === 0) return '\u2014';
        return (
          <span style={{ fontWeight: 700, color: COLORS.textPrimary }}>
            {formatCurrency(num)}
          </span>
        );
      },
    },
    {
      key: 'stato',
      label: 'Stato',
      render: (v) => (
        <span style={getStatusStyle(v)}>{getStatusLabel(v)}</span>
      ),
    },
    {
      key: 'azioni',
      label: 'Azioni',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={{ ...S.btnSmall, background: COLORS.accentLight, color: '#fff' }}
            onClick={(e) => { e.stopPropagation(); openEditScad(row); }}
          >
            Modifica
          </button>
          <button
            style={{ ...S.btnSmall, background: COLORS.danger, color: '#fff' }}
            onClick={(e) => { e.stopPropagation(); handleDeleteScad(row.id); }}
          >
            Elimina
          </button>
        </div>
      ),
    },
  ], [openEditScad, handleDeleteScad]);

  // ── Loading ────────────────────────────────
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textMuted }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>{''}</div>
        <div style={{ fontSize: '14px' }}>Caricamento dati burocrazia...</div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════
  return (
    <div>
      {/* ── Header ───────────────────────────── */}
      <div style={S.pageHeader}>
        <h2 style={S.pageTitle}>Burocrazia</h2>
        <p style={S.pageSubtitle}>Documenti aziendali, certificati e scadenzario</p>
      </div>

      {/* ── KPI Cards ────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <GestionaleCard
          icon={''}
          label="Documenti Totali"
          value={kpi.totalDocs}
          color={COLORS.accentLight}
          isMobile={isMobile}
        />
        <GestionaleCard
          icon={''}
          label="Documenti Validi"
          value={kpi.docsValidi}
          color={COLORS.success}
          isMobile={isMobile}
        />
        <GestionaleCard
          icon={''}
          label="Scaduti / In Scadenza"
          value={kpi.docsScaduti + kpi.docsInScadenza}
          subtitle={`${kpi.docsScaduti} scaduti, ${kpi.docsInScadenza} in scadenza`}
          color={COLORS.danger}
          isMobile={isMobile}
        />
        <GestionaleCard
          icon={'\u23F0'}
          label="Scadenze Attive"
          value={kpi.scadAttive}
          subtitle={`${kpi.scadCompletate} completate su ${kpi.totalScad}`}
          color={COLORS.warning}
          isMobile={isMobile}
        />
      </div>

      {/* ── Sub-tabs ─────────────────────────── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '16px' }}>
        {[
          { key: 'documenti', label: ' Documenti' },
          { key: 'scadenzario', label: '\u23F0 Scadenzario' },
        ].map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 24px',
              border: `1px solid ${COLORS.accent}`,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              background: tab === t.key ? COLORS.accent : '#fff',
              color: tab === t.key ? '#fff' : COLORS.accent,
              borderRadius: i === 0 ? '8px 0 0 8px' : '0 8px 8px 0',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════ */}
      {/* ══ TAB DOCUMENTI ════════════════════ */}
      {/* ══════════════════════════════════════ */}
      {tab === 'documenti' && (
        <div>
          {/* Alert documenti scaduti */}
          {kpi.docsScaduti > 0 && (
            <div style={S.alertBox('danger')}>
              <strong>{kpi.docsScaduti} document{kpi.docsScaduti === 1 ? 'o scaduto' : 'i scaduti'}!</strong>{' '}
              Verifica e rinnova i documenti per evitare sanzioni.
            </div>
          )}

          {/* ── Toolbar ──────────────────────── */}
          <div style={S.toolbar}>
            <input
              style={S.searchInput}
              type="text"
              placeholder="Cerca per titolo, ente, riferimento..."
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
            />
            <select
              style={S.select}
              value={docTipoFilter}
              onChange={(e) => setDocTipoFilter(e.target.value)}
            >
              <option value="">Tutti i tipi</option>
              {TIPI_DOCUMENTO.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
            <select
              style={S.select}
              value={docStatoFilter}
              onChange={(e) => setDocStatoFilter(e.target.value)}
            >
              <option value="">Tutti gli stati</option>
              {STATI_DOCUMENTO.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button style={S.btnPrimary} onClick={openNewDoc}>
              {'\u2795'} Nuovo Documento
            </button>
            {filteredDocumenti.length > 0 && (
              <button
                style={S.btnSecondary}
                onClick={() => exportToJSON(filteredDocumenti, 'documenti_burocrazia')}
              >
                Esporta
              </button>
            )}
          </div>

          {/* ── Tabella Documenti ─────────────── */}
          <GestionaleTable
            columns={docColumns}
            data={filteredDocumenti}
            isMobile={isMobile}
            emptyMessage="Nessun documento trovato"
            emptyIcon={''}
          />
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* ══ TAB SCADENZARIO ══════════════════ */}
      {/* ══════════════════════════════════════ */}
      {tab === 'scadenzario' && (
        <div>
          {/* ── Alert Scadenze Scadute ────────── */}
          {alertScadenze.scadute.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {alertScadenze.scadute.map((item, idx) => (
                <div key={item.id || `scaduta-${idx}`} style={S.alertBox('danger')}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}>
                    <div>
                      <span style={{ fontWeight: 700, marginRight: '8px' }}>
                        {''} SCADUTO
                      </span>
                      <span>{item.titolo}</span>
                      <span style={{
                        fontSize: '14px',
                        color: COLORS.textMuted,
                        marginLeft: '6px',
                      }}>
                        ({item._tipo})
                      </span>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: COLORS.danger,
                    }}>
                      Scaduto da {Math.abs(item.giorniMancanti)} giorni - {formatDate(item.dataScadenza)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Alert Scadenze Imminenti ─────── */}
          {alertScadenze.imminenti.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {alertScadenze.imminenti.map((item, idx) => (
                <div key={item.id || `imminente-${idx}`} style={S.alertBox('warning')}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}>
                    <div>
                      <span style={{ fontWeight: 700, marginRight: '8px' }}>
                        {''} IN SCADENZA
                      </span>
                      <span>{item.titolo}</span>
                      <span style={{
                        fontSize: '14px',
                        color: COLORS.textMuted,
                        marginLeft: '6px',
                      }}>
                        ({item._tipo})
                      </span>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: COLORS.warning,
                    }}>
                      {item.giorniMancanti === 0
                        ? 'Scade oggi'
                        : item.giorniMancanti === 1
                          ? 'Scade domani'
                          : `Scade tra ${item.giorniMancanti} giorni`
                      } - {formatDate(item.dataScadenza)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Toolbar ──────────────────────── */}
          <div style={S.toolbar}>
            <input
              style={S.searchInput}
              type="text"
              placeholder="Cerca scadenze..."
              value={scadSearch}
              onChange={(e) => setScadSearch(e.target.value)}
            />
            <select
              style={S.select}
              value={scadTipoFilter}
              onChange={(e) => setScadTipoFilter(e.target.value)}
            >
              <option value="">Tutti i tipi</option>
              {TIPI_SCADENZA.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <select
              style={S.select}
              value={scadStatoFilter}
              onChange={(e) => setScadStatoFilter(e.target.value)}
            >
              <option value="">Tutti gli stati</option>
              {STATI_SCADENZA.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button style={S.btnPrimary} onClick={openNewScad}>
              {'\u2795'} Nuova Scadenza
            </button>
            {filteredScadenze.length > 0 && (
              <button
                style={S.btnSecondary}
                onClick={() => exportToCSV(
                  filteredScadenze,
                  [
                    { key: 'titolo', label: 'Titolo' },
                    { key: 'tipo', label: 'Tipo' },
                    { key: 'dataScadenza', label: 'Data Scadenza' },
                    { key: 'ricorrenza', label: 'Ricorrenza' },
                    { key: 'importo', label: 'Importo' },
                    { key: 'stato', label: 'Stato' },
                  ],
                  'scadenzario'
                )}
              >
                Esporta CSV
              </button>
            )}
          </div>

          {/* ── Riepilogo Importi ────────────── */}
          {(() => {
            const importoTotale = filteredScadenze.reduce((sum, s) => {
              const imp = parseFloat(s.importo);
              return sum + (isNaN(imp) ? 0 : imp);
            }, 0);
            const importoPendente = filteredScadenze
              .filter(s => s.stato === 'pianificata' || s.stato === 'in_corso')
              .reduce((sum, s) => {
                const imp = parseFloat(s.importo);
                return sum + (isNaN(imp) ? 0 : imp);
              }, 0);

            if (importoTotale <= 0) return null;

            return (
              <div style={{
                ...S.card,
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: '16px',
                borderLeft: `4px solid ${COLORS.warning}`,
              }}>
                <div>
                  <div style={{
                    fontSize: '14px',
                    color: COLORS.textMuted,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.3px',
                    marginBottom: '2px',
                  }}>
                    Importo Totale Scadenze
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: COLORS.textPrimary }}>
                    {formatCurrency(importoTotale)}
                  </div>
                </div>
                {importoPendente > 0 && (
                  <div>
                    <div style={{
                      fontSize: '14px',
                      color: COLORS.textMuted,
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.3px',
                      marginBottom: '2px',
                    }}>
                      Da Pagare (Attive)
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: COLORS.warning }}>
                      {formatCurrency(importoPendente)}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Tabella Scadenze ──────────────── */}
          <GestionaleTable
            columns={scadColumns}
            data={filteredScadenze}
            isMobile={isMobile}
            emptyMessage="Nessuna scadenza trovata"
            emptyIcon={'\u23F0'}
          />
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* ══ MODALE FORM DOCUMENTO ════════════ */}
      {/* ══════════════════════════════════════ */}
      {showDocForm && (
        <GestionaleForm
          title={docEditing ? 'Modifica Documento' : 'Nuovo Documento'}
          fields={documentoFormFields}
          values={docForm}
          onChange={(k, v) => setDocForm(prev => ({ ...prev, [k]: v }))}
          onSubmit={handleSaveDoc}
          onCancel={() => setShowDocForm(false)}
          submitLabel={docEditing ? 'Aggiorna' : 'Aggiungi Documento'}
          isMobile={isMobile}
        />
      )}

      {/* ══════════════════════════════════════ */}
      {/* ══ MODALE FORM SCADENZA ═════════════ */}
      {/* ══════════════════════════════════════ */}
      {showScadForm && (
        <GestionaleForm
          title={scadEditing ? 'Modifica Scadenza' : 'Nuova Scadenza'}
          fields={scadenzaFormFields}
          values={scadForm}
          onChange={(k, v) => setScadForm(prev => ({ ...prev, [k]: v }))}
          onSubmit={handleSaveScad}
          onCancel={() => setShowScadForm(false)}
          submitLabel={scadEditing ? 'Aggiorna' : 'Aggiungi Scadenza'}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
