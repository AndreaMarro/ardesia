// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Modulo Impostazioni
// Configurazione aziendale, backup e monitoraggio
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { COLORS, S } from '../GestionaleStyles';
import { gestionaleAdmin } from '../GestionaleService';
import { formatDateTime } from '../shared/GestionaleUtils';

// ── Costanti ─────────────────────────────────

const CONDIZIONI_PAGAMENTO = [
  { value: '30gg', label: '30 giorni' },
  { value: '60gg', label: '60 giorni' },
  { value: '90gg', label: '90 giorni' },
  { value: 'immediato', label: 'Immediato' },
];

const DEFAULT_IMPOSTAZIONI = {
  ragioneSociale: '',
  partitaIva: '',
  codiceFiscale: '',
  indirizzo: '',
  citta: '',
  cap: '',
  provincia: '',
  pec: '',
  codiceSDI: '',
  telefono: '',
  email: '',
  iban: '',
  banca: '',
  logoUrl: '',
  aliquotaIvaDefault: 22,
  condizioniPagamentoDefault: '30gg',
  prefissoFattura: 'FT',
  prefissoOrdine: 'ORD',
};

const CAMPO_LABELS = {
  ragioneSociale: 'Ragione Sociale',
  partitaIva: 'Partita IVA',
  codiceFiscale: 'Codice Fiscale',
  indirizzo: 'Indirizzo',
  citta: 'Città',
  cap: 'CAP',
  provincia: 'Provincia',
  pec: 'PEC',
  codiceSDI: 'Codice SDI',
  telefono: 'Telefono',
  email: 'Email',
  iban: 'IBAN',
  banca: 'Banca',
};

// ── Helpers ──────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getKeySize(key) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return 0;
    return (key.length + value.length) * 2;
  } catch {
    return 0;
  }
}

function getStorageDetails() {
  const keys = [];
  let totalUsed = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const size = getKeySize(key);
      totalUsed += size;
      keys.push({ key, size });
    }
    keys.sort((a, b) => b.size - a.size);
  } catch { /* silenzioso */ }

  const totalAvailable = 5 * 1024 * 1024;
  const percentage = totalAvailable > 0
    ? Math.min((totalUsed / totalAvailable) * 100, 100)
    : 0;

  return { used: totalUsed, total: totalAvailable, percentage, keys };
}

// ── Componente Card Sezione ──────────────────

function SectionCard({ icon, title, children }) {
  return (
    <div style={S.card}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '700',
        color: COLORS.textPrimary,
        margin: '0 0 16px',
        paddingBottom: '12px',
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Toast Notifica ───────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgMap = {
    success: COLORS.successBg,
    error: COLORS.dangerBg,
    warning: COLORS.warningBg,
    info: COLORS.infoBg,
  };
  const colorMap = {
    success: COLORS.success,
    error: COLORS.danger,
    warning: COLORS.warning,
    info: COLORS.info,
  };
  const iconMap = {
    success: '',
    error: '',
    warning: '',
    info: '\u2139\uFE0F',
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: bgMap[type] || bgMap.info,
      border: `1px solid ${colorMap[type] || colorMap.info}`,
      color: colorMap[type] || colorMap.info,
      padding: '12px 20px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      zIndex: 10000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      maxWidth: '400px',
    }}>
      <span>{iconMap[type] || iconMap.info}</span>
      {message}
    </div>
  );
}

// ── Componente Principale ────────────────────

export default function ImpostazioniModule({ isMobile }) {
  // ── State ──
  const [impostazioni, setImpostazioni] = useState({ ...DEFAULT_IMPOSTAZIONI });
  const [valoriPredefiniti, setValoriPredefiniti] = useState({
    aliquotaIvaDefault: 22,
    condizioniPagamentoDefault: '30gg',
    prefissoFattura: 'FT',
    prefissoOrdine: 'ORD',
  });
  const [storageData, setStorageData] = useState(null);
  const [logEntries, setLogEntries] = useState([]);
  const [toast, setToast] = useState(null);
  const [resetStep, setResetStep] = useState(0);
  const [resetInput, setResetInput] = useState('');
  const [loading, setLoading] = useState(true);

  // ── Caricamento Dati ──
  const loadImpostazioni = useCallback(async () => {
    const data = await gestionaleAdmin.getImpostazioni();
    const merged = { ...DEFAULT_IMPOSTAZIONI, ...data };
    setImpostazioni(merged);
    setValoriPredefiniti({
      aliquotaIvaDefault: merged.aliquotaIvaDefault ?? 22,
      condizioniPagamentoDefault: merged.condizioniPagamentoDefault || '30gg',
      prefissoFattura: merged.prefissoFattura || 'FT',
      prefissoOrdine: merged.prefissoOrdine || 'ORD',
    });
  }, []);

  const loadStorage = useCallback(() => {
    setStorageData(getStorageDetails());
  }, []);

  const loadLog = useCallback(() => {
    const entries = gestionaleAdmin.getLog();
    setLogEntries((entries || []).slice(0, 20));
  }, []);

  useEffect(() => {
    loadImpostazioni();
    loadStorage();
    loadLog();
    setLoading(false);
  }, [loadImpostazioni, loadStorage, loadLog]);

  // ── Toast Helper ──
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // ── Handlers: Dati Aziendali ──
  const handleFieldChange = useCallback((field, value) => {
    setImpostazioni(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveAziendali = useCallback(() => {
    try {
      gestionaleAdmin.updateImpostazioni(impostazioni);
      showToast('Impostazioni aziendali salvate con successo');
      loadLog();
    } catch {
      showToast('Errore nel salvataggio', 'error');
    }
  }, [impostazioni, showToast, loadLog]);

  // ── Handlers: Valori Predefiniti ──
  const handleValoriChange = useCallback((field, value) => {
    setValoriPredefiniti(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveValori = useCallback(() => {
    const dataToSave = {
      ...valoriPredefiniti,
      aliquotaIvaDefault: parseFloat(valoriPredefiniti.aliquotaIvaDefault) || 22,
    };
    try {
      gestionaleAdmin.updateImpostazioni(dataToSave);
      showToast('Valori predefiniti salvati');
      loadLog();
    } catch {
      showToast('Errore nel salvataggio', 'error');
    }
  }, [valoriPredefiniti, showToast, loadLog]);

  // ── Handlers: Backup ──
  const handleExport = useCallback(async () => {
    try {
      const jsonStr = await gestionaleAdmin.exportAll();
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `backup_gestionale_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Backup esportato con successo');
    } catch (err) {
      showToast('Errore durante l\'esportazione: ' + err.message, 'error');
    }
  }, [showToast]);

  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const result = await gestionaleAdmin.importAll(ev.target.result);
        if (result.success) {
          showToast('Backup importato con successo! I dati sono stati aggiornati.');
          loadImpostazioni();
          loadStorage();
          loadLog();
        } else {
          showToast('Errore nell\'importazione: ' + (result.error || 'File non valido'), 'error');
        }
      } catch (err) {
        showToast('Errore nella lettura del file: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [showToast, loadImpostazioni, loadStorage, loadLog]);

  const handleResetStart = useCallback(() => {
    setResetStep(1);
    setResetInput('');
  }, []);

  const handleResetConfirm = useCallback(async () => {
    if (resetInput !== 'ELIMINA') {
      showToast('Digita "ELIMINA" per confermare il reset', 'warning');
      return;
    }
    try {
      const result = await gestionaleAdmin.resetAll();
      if (result.success) {
        showToast('Tutti i dati sono stati eliminati. Il gestionale e stato resettato.', 'warning');
        setResetStep(0);
        setResetInput('');
        loadImpostazioni();
        loadStorage();
        loadLog();
      } else {
        showToast('Errore durante il reset: ' + (result.error || ''), 'error');
      }
    } catch (err) {
      showToast('Errore durante il reset: ' + err.message, 'error');
    }
  }, [resetInput, showToast, loadImpostazioni, loadStorage, loadLog]);

  const handleResetCancel = useCallback(() => {
    setResetStep(0);
    setResetInput('');
  }, []);

  // ── Handlers: Log ──
  const handleClearLog = useCallback(() => {
    try {
      localStorage.setItem('elab_gest_log', JSON.stringify([]));
      setLogEntries([]);
      showToast('Log attività svuotato');
    } catch {
      showToast('Errore nello svuotamento del log', 'error');
    }
  }, [showToast]);

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textMuted }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}></div>
        <div style={{ fontSize: '14px' }}>Caricamento impostazioni...</div>
      </div>
    );
  }

  // ── Stili Locali ──
  const formGrid = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '14px',
  };

  const formGridNarrow = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '14px',
  };

  const progressBarBg = {
    width: '100%',
    height: '20px',
    background: COLORS.borderLight,
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '8px',
  };

  // ── Render: Dati Aziendali ──
  const renderDatiAziendali = () => {
    const campiAziendali = [
      'ragioneSociale', 'partitaIva', 'codiceFiscale',
      'indirizzo', 'citta', 'cap', 'provincia',
      'pec', 'codiceSDI', 'telefono', 'email',
      'iban', 'banca',
    ];

    return (
      <SectionCard icon={''} title="Dati Aziendali">
        <div style={formGrid}>
          {campiAziendali.map(campo => (
            <div key={campo} style={S.formGroup}>
              <label style={S.label}>{CAMPO_LABELS[campo] || campo}</label>
              <input
                type="text"
                value={impostazioni[campo] || ''}
                onChange={(e) => handleFieldChange(campo, e.target.value)}
                style={S.input}
                placeholder={CAMPO_LABELS[campo] || campo}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSaveAziendali}
            style={S.btnPrimary}
            onMouseEnter={(e) => { e.target.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
          >
            {''} Salva Impostazioni
          </button>
        </div>
      </SectionCard>
    );
  };

  // ── Render: Valori Predefiniti ──
  const renderValoriPredefiniti = () => (
    <SectionCard icon={'\u2699\uFE0F'} title="Valori Predefiniti">
      <div style={formGridNarrow}>
        <div style={S.formGroup}>
          <label style={S.label}>Aliquota IVA Default (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={valoriPredefiniti.aliquotaIvaDefault}
            onChange={(e) => handleValoriChange('aliquotaIvaDefault', e.target.value)}
            style={S.input}
          />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Condizioni Pagamento Default</label>
          <select
            value={valoriPredefiniti.condizioniPagamentoDefault}
            onChange={(e) => handleValoriChange('condizioniPagamentoDefault', e.target.value)}
            style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}
          >
            {CONDIZIONI_PAGAMENTO.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Prefisso Fattura</label>
          <input
            type="text"
            value={valoriPredefiniti.prefissoFattura}
            onChange={(e) => handleValoriChange('prefissoFattura', e.target.value)}
            style={S.input}
            placeholder="FT"
          />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Prefisso Ordine</label>
          <input
            type="text"
            value={valoriPredefiniti.prefissoOrdine}
            onChange={(e) => handleValoriChange('prefissoOrdine', e.target.value)}
            style={S.input}
            placeholder="ORD"
          />
        </div>
      </div>
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSaveValori}
          style={S.btnPrimary}
          onMouseEnter={(e) => { e.target.style.opacity = '0.9'; }}
          onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
        >
          {''} Salva
        </button>
      </div>
    </SectionCard>
  );

  // ── Render: Provider SDI ──
  const renderProviderSDI = () => (
    <SectionCard icon={''} title="Provider Fatturazione Elettronica (SDI)">
      <div style={S.alertBox('info')}>
        Configura il provider per l'invio delle fatture al Sistema di Interscambio (SDI).
        L'invio reale richiede un backend con certificato qualificato.
      </div>
      <div style={formGridNarrow}>
        <div style={S.formGroup}>
          <label style={S.label}>Provider SDI</label>
          <select
            value={impostazioni.sdiProvider || ''}
            onChange={(e) => handleFieldChange('sdiProvider', e.target.value)}
            style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}
          >
            <option value="">Nessuno (solo generazione XML locale)</option>
            <option value="aruba_pec">Aruba PEC</option>
            <option value="teamsystem">TeamSystem</option>
            <option value="zucchetti">Zucchetti</option>
            <option value="altro">Altro</option>
          </select>
        </div>
        {impostazioni.sdiProvider && (
          <div style={S.formGroup}>
            <label style={S.label}>API Key Provider</label>
            <input
              type="password"
              value={impostazioni.sdiApiKey || ''}
              onChange={(e) => handleFieldChange('sdiApiKey', e.target.value)}
              style={S.input}
              placeholder="sk-..."
              autoComplete="off"
            />
          </div>
        )}
        <div style={S.formGroup}>
          <label style={S.label}>Certificato .p12</label>
          <input
            type="text"
            value="Carica .p12"
            disabled
            style={{ ...S.input, opacity: 0.5, cursor: 'not-allowed' }}
          />
          <span style={{ fontSize: '14px', color: COLORS.textMuted, marginTop: '4px', display: 'block' }}>
            Richiede backend dedicato — non gestibile da browser
          </span>
        </div>
      </div>
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSaveAziendali} style={S.btnPrimary}>
          Salva Configurazione SDI
        </button>
      </div>
    </SectionCard>
  );

  // ── Render: Backup & Ripristino ──
  const renderBackup = () => (
    <SectionCard icon={''} title="Backup & Ripristino">
      <div style={S.alertBox('info')}>
        Esporta un backup completo di tutti i dati del gestionale in formato JSON.
        Puoi reimportarlo in qualsiasi momento per ripristinare i dati.
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px',
        alignItems: 'center',
      }}>
        <button onClick={handleExport} style={S.btnPrimary}>
          {''} Esporta Backup JSON
        </button>

        <label style={{
          ...S.btnSecondary,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          margin: 0,
          cursor: 'pointer',
        }}>
          {''} Importa Backup
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div style={S.divider} />

      {/* Reset Completo */}
      <div>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: COLORS.danger,
          margin: '0 0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          {''} Reset Completo
        </h4>

        {resetStep === 0 && (
          <div>
            <p style={{ fontSize: '14px', color: COLORS.textSecondary, margin: '0 0 12px' }}>
              Elimina permanentemente tutti i dati del gestionale. Questa operazione non può essere annullata.
            </p>
            <button onClick={handleResetStart} style={S.btnDanger}>
              {''} Reset Completo
            </button>
          </div>
        )}

        {resetStep === 1 && (
          <div style={S.alertBox('danger')}>
            <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '14px' }}>
              {''} ATTENZIONE: Operazione Irreversibile!
            </div>
            <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
              Stai per eliminare TUTTI i dati del gestionale:
            </p>
            <ul style={{ margin: '0 0 12px', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
              <li>Fatture e documenti fiscali</li>
              <li>Ordini e vendite</li>
              <li>Clienti e fornitori</li>
              <li>Prodotti e magazzino</li>
              <li>Dipendenti e buste paga</li>
              <li>Movimenti finanziari</li>
              <li>Campagne marketing</li>
              <li>Tutte le impostazioni</li>
            </ul>
            <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600' }}>
              Si consiglia di esportare un backup prima di procedere.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={() => setResetStep(2)} style={S.btnDanger}>
                Procedi al Reset
              </button>
              <button onClick={handleResetCancel} style={S.btnSecondary}>
                Annulla
              </button>
            </div>
          </div>
        )}

        {resetStep === 2 && (
          <div style={{
            background: COLORS.dangerBg,
            border: `2px solid ${COLORS.danger}`,
            borderRadius: '10px',
            padding: '20px',
          }}>
            <div style={{
              fontWeight: '700',
              color: COLORS.danger,
              marginBottom: '12px',
              fontSize: '15px',
            }}>
              {''} Conferma Eliminazione Definitiva
            </div>
            <p style={{
              fontSize: '14px',
              color: COLORS.textPrimary,
              margin: '0 0 12px',
            }}>
              Per confermare il reset, digita <strong>ELIMINA</strong> nel campo sottostante:
            </p>
            <input
              type="text"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value.toUpperCase())}
              placeholder='Digita "ELIMINA" per confermare'
              style={{
                ...S.input,
                borderColor: COLORS.danger,
                marginBottom: '14px',
                maxWidth: '320px',
              }}
            />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleResetConfirm}
                disabled={resetInput !== 'ELIMINA'}
                style={{
                  ...S.btnDanger,
                  opacity: resetInput === 'ELIMINA' ? 1 : 0.5,
                  cursor: resetInput === 'ELIMINA' ? 'pointer' : 'not-allowed',
                }}
              >
                {''} Elimina Tutto Definitivamente
              </button>
              <button onClick={handleResetCancel} style={S.btnSecondary}>
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );

  // ── Render: Monitor Storage ──
  const renderStorage = () => {
    const data = storageData || { used: 0, total: 5 * 1024 * 1024, percentage: 0, keys: [] };
    const pct = data.percentage;
    const barColor = pct < 50 ? COLORS.success : pct < 80 ? COLORS.warning : COLORS.danger;

    return (
      <SectionCard icon={''} title="Monitor Storage">
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>
              Spazio utilizzato: <strong style={{ color: COLORS.textPrimary }}>{formatBytes(data.used)}</strong> / {formatBytes(data.total)}
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: barColor,
            }}>
              {pct.toFixed(1)}%
            </span>
          </div>
          <div style={progressBarBg}>
            <div style={{
              width: `${Math.max(pct, 1)}%`,
              height: '100%',
              background: barColor,
              borderRadius: '10px',
              transition: 'width 0.3s ease, background 0.3s ease',
            }} />
          </div>
        </div>

        {/* Tabella chiavi */}
        {data.keys.length > 0 && (
          <div style={{
            maxHeight: '260px',
            overflowY: 'auto',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            marginBottom: '14px',
          }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Chiave</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Dimensione</th>
                </tr>
              </thead>
              <tbody>
                {data.keys.map((item, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? COLORS.card : COLORS.bg }}>
                    <td style={{
                      ...S.td,
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      wordBreak: 'break-all',
                    }}>
                      {item.key}
                    </td>
                    <td style={{
                      ...S.td,
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                      fontWeight: '500',
                    }}>
                      {formatBytes(item.size)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={loadStorage}
          style={S.btnSecondary}
        >
          {''} Aggiorna
        </button>
      </SectionCard>
    );
  };

  // ── Render: Log Attività ──
  const renderLog = () => (
    <SectionCard icon={''} title="Log Attività">
      {logEntries.length === 0 ? (
        <div style={S.emptyState}>
          <div style={S.emptyIcon}>{''}</div>
          <div style={S.emptyText}>Nessuna attività registrata</div>
        </div>
      ) : (
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          border: `1px solid ${COLORS.border}`,
          borderRadius: '8px',
          marginBottom: '14px',
        }}>
          {logEntries.map((entry, idx) => (
            <div key={entry.id || idx} style={{
              padding: '10px 14px',
              borderBottom: idx < logEntries.length - 1 ? `1px solid ${COLORS.borderLight}` : 'none',
              display: isMobile ? 'block' : 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              background: idx % 2 === 0 ? COLORS.card : COLORS.bg,
              fontSize: '14px',
            }}>
              <span style={{
                color: COLORS.textMuted,
                fontSize: '14px',
                whiteSpace: 'nowrap',
                minWidth: '130px',
                fontFamily: 'monospace',
                display: 'block',
                marginBottom: isMobile ? '4px' : 0,
              }}>
                {formatDateTime(entry.data)}
              </span>
              <span style={{
                fontWeight: '600',
                color: COLORS.accent,
                minWidth: '160px',
                fontSize: '14px',
                display: 'block',
                marginBottom: isMobile ? '2px' : 0,
              }}>
                {(entry.azione || '').replace(/_/g, ' ')}
              </span>
              <span style={{
                color: COLORS.textSecondary,
                flex: 1,
                wordBreak: 'break-word',
                display: 'block',
              }}>
                {entry.dettagli || '\u2014'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={loadLog}
          style={S.btnSecondary}
        >
          {''} Aggiorna
        </button>
        {logEntries.length > 0 && (
          <button
            onClick={handleClearLog}
            style={S.btnDanger}
          >
            {''} Svuota Log
          </button>
        )}
      </div>
    </SectionCard>
  );

  // ── Render Principale ──
  return (
    <div>
      {/* Toast notifica */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div style={S.pageHeader}>
        <h2 style={S.pageTitle}>{'\u2699\uFE0F'} Impostazioni</h2>
        <p style={S.pageSubtitle}>
          Configurazione aziendale, valori predefiniti, backup e monitoraggio sistema
        </p>
      </div>

      {/* Sezioni */}
      {renderDatiAziendali()}
      {renderValoriPredefiniti()}
      {renderProviderSDI()}
      {renderBackup()}
      {renderStorage()}
      {renderLog()}
    </div>
  );
}
