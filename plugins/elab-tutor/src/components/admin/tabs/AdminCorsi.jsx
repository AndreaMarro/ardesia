// ============================================
// ELAB Admin - Gestione Corsi (Notion DB)
// CRUD completo con card grid, filtri,
// ricerca, statistiche e toggle premium
// © Andrea Marro — 08/02/2026
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { corsiService } from '../../../services/notionService';

// ============================================
// COSTANTI
// ============================================
const COLORS = {
    primary: 'var(--elab-navy)',
    primaryLight: 'var(--elab-hex-2a4fa0)',
    primaryBg: 'var(--elab-hex-ebf0fa)',
    success: 'var(--elab-lime)',
    successBg: 'var(--elab-hex-f0f7e4)',
    warning: 'var(--elab-hex-f59e0b)',
    warningBg: 'var(--elab-hex-fef3c7)',
    danger: 'var(--elab-hex-ef4444)',
    dangerBg: 'var(--elab-hex-fee2e2)',
    text: 'var(--elab-hex-1e293b)',
    textMuted: 'var(--elab-hex-64748b)',
    border: 'var(--elab-hex-e2e8f0)',
    bg: 'var(--elab-hex-f8fafc)',
    white: 'var(--elab-hex-ffffff)',
    cardShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
    cardShadowHover: '0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
};

const LIVELLI = ['Principiante', 'Intermedio', 'Avanzato'];
const CATEGORIE = ['Elettronica', 'Arduino', 'Programmazione', 'Fisica', 'IoT'];
const STATI = ['Attivo', 'Bozza', 'Archiviato'];

const LIVELLO_COLORS = {
    Principiante: { bg: 'var(--elab-hex-dbeafe)', color: 'var(--elab-hex-1e40af)' },
    Intermedio: { bg: 'var(--elab-hex-fef3c7)', color: 'var(--elab-hex-92400e)' },
    Avanzato: { bg: 'var(--elab-hex-fce7f3)', color: 'var(--elab-hex-9d174d)' },
};

const STATO_COLORS = {
    Attivo: { bg: COLORS.successBg, color: 'var(--elab-hex-3f6212)' },
    Bozza: { bg: COLORS.warningBg, color: 'var(--elab-hex-92400e)' },
    Archiviato: { bg: 'var(--elab-hex-f1f5f9)', color: 'var(--elab-hex-475569)' },
};

const EMPTY_COURSE = {
    'Nome Corso': '',
    Descrizione: '',
    Prezzo: 0,
    Docente: '',
    'Durata Ore': 0,
    Livello: 'Principiante',
    Categoria: 'Elettronica',
    'Premium Only': false,
    Rating: 0,
    'Studenti Iscritti': 0,
    Stato: 'Bozza',
    'Data Creazione': new Date().toISOString().split('T')[0],
};

// ============================================
// HELPER: Estrazione campo sicura
// ============================================
function field(corso, name, fallback = '') {
    if (!corso) return fallback;
    // Notion restituisce proprietà in formati diversi
    const raw = corso[name] ?? corso.properties?.[name];
    if (raw === undefined || raw === null) return fallback;
    // Se è già un valore primitivo
    if (typeof raw !== 'object') return raw;
    // Notion title array
    if (raw.title) return raw.title.map(t => t.plain_text || t.text?.content || '').join('');
    // Notion rich_text array
    if (raw.rich_text) return raw.rich_text.map(t => t.plain_text || t.text?.content || '').join('');
    // Notion number
    if (raw.number !== undefined) return raw.number ?? fallback;
    // Notion select
    if (raw.select) return raw.select.name || fallback;
    // Notion checkbox
    if (raw.checkbox !== undefined) return raw.checkbox;
    // Notion date
    if (raw.date) return raw.date.start || fallback;
    // Array fallback (plain_text)
    if (Array.isArray(raw)) return raw.map(t => t.plain_text || '').join('');
    return raw.plain_text || raw.name || raw.start || fallback;
}

// ============================================
// HELPER: Render stelle rating
// ============================================
function renderStars(rating) {
    const val = Math.min(5, Math.max(0, Number(rating) || 0));
    const full = Math.floor(val);
    const half = val - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    const stars = [];
    for (let i = 0; i < full; i++) stars.push('\u2605');
    if (half) stars.push('\u00BD');
    for (let i = 0; i < empty; i++) stars.push('\u2606');
    return stars.join('');
}

// ============================================
// CSV EXPORT — © Andrea Marro — 20/02/2026
// ============================================
function exportCorsiCSV(corsi) {
    const headers = ['#', 'Nome Corso', 'Docente', 'Livello', 'Categoria', 'Prezzo', 'Durata Ore', 'Rating', 'Studenti Iscritti', 'Premium', 'Stato'];
    const rows = corsi.map((c, i) => [
        i + 1,
        `"${String(field(c, 'Nome Corso')).replace(/"/g, '""')}"`,
        `"${String(field(c, 'Docente')).replace(/"/g, '""')}"`,
        field(c, 'Livello'),
        field(c, 'Categoria'),
        field(c, 'Prezzo', 0),
        field(c, 'Durata Ore', 0),
        field(c, 'Rating', 0),
        field(c, 'Studenti Iscritti', 0),
        field(c, 'Premium Only') ? 'Sì' : 'No',
        field(c, 'Stato'),
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corsi_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// COMPONENTE PRINCIPALE
// ============================================
export default function AdminCorsi({ isMobile }) {
    // --- State ---
    const [corsi, setCorsi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterLivello, setFilterLivello] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [filterStato, setFilterStato] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newCourse, setNewCourse] = useState({ ...EMPTY_COURSE });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [toast, setToast] = useState(null);

    // --- Toast helper ---
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    // --- Carica corsi ---
    const loadCorsi = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await corsiService.getAll();
            const items = result?.items || result?.data || result?.results || (Array.isArray(result) ? result : []);
            setCorsi(items);
        } catch (err) {
            setError(err.message || 'Errore nel caricamento dei corsi');
            setCorsi([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCorsi();
    }, [loadCorsi]);

    // --- Filtraggio e ricerca ---
    const filtered = useMemo(() => {
        return corsi.filter(c => {
            const nome = String(field(c, 'Nome Corso')).toLowerCase();
            const docente = String(field(c, 'Docente')).toLowerCase();
            const desc = String(field(c, 'Descrizione')).toLowerCase();
            const q = search.toLowerCase().trim();

            if (q && !nome.includes(q) && !docente.includes(q) && !desc.includes(q)) return false;
            if (filterLivello && field(c, 'Livello') !== filterLivello) return false;
            if (filterCategoria && field(c, 'Categoria') !== filterCategoria) return false;
            if (filterStato && field(c, 'Stato') !== filterStato) return false;
            return true;
        });
    }, [corsi, search, filterLivello, filterCategoria, filterStato]);

    // --- Statistiche ---
    const stats = useMemo(() => {
        const attivi = corsi.filter(c => field(c, 'Stato') === 'Attivo');
        const totStudenti = corsi.reduce((sum, c) => sum + (Number(field(c, 'Studenti Iscritti', 0)) || 0), 0);
        const revenue = corsi.reduce((sum, c) => {
            const prezzo = Number(field(c, 'Prezzo', 0)) || 0;
            const studenti = Number(field(c, 'Studenti Iscritti', 0)) || 0;
            return sum + prezzo * studenti;
        }, 0);
        return {
            totale: corsi.length,
            attivi: attivi.length,
            studenti: totStudenti,
            revenue,
        };
    }, [corsi]);

    // --- Handlers ---
    const handleCreate = async () => {
        if (!newCourse['Nome Corso']?.trim()) {
            showToast('Il nome del corso e\' obbligatorio', 'danger');
            return;
        }
        setSaving(true);
        try {
            await corsiService.create({
                ...newCourse,
                'Data Creazione': new Date().toISOString().split('T')[0],
            });
            showToast('Corso creato con successo');
            setShowCreate(false);
            setNewCourse({ ...EMPTY_COURSE });
            await loadCorsi();
        } catch (err) {
            showToast(err.message || 'Errore nella creazione', 'danger');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (id) => {
        if (!editData) return;
        setSaving(true);
        try {
            await corsiService.update(id, editData);
            showToast('Corso aggiornato con successo');
            setExpandedId(null);
            setEditData(null);
            await loadCorsi();
        } catch (err) {
            showToast(err.message || 'Errore nell\'aggiornamento', 'danger');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setSaving(true);
        try {
            await corsiService.delete(id);
            showToast('Corso eliminato');
            setDeleteConfirm(null);
            setExpandedId(null);
            setEditData(null);
            await loadCorsi();
        } catch (err) {
            showToast(err.message || 'Errore nell\'eliminazione', 'danger');
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePremium = async (corso) => {
        const id = corso.id || corso.pageId;
        const current = Boolean(field(corso, 'Premium Only', false));
        setSaving(true);
        try {
            await corsiService.update(id, { 'Premium Only': !current });
            showToast(`Premium ${!current ? 'attivato' : 'disattivato'}`);
            await loadCorsi();
        } catch (err) {
            showToast(err.message || 'Errore nel toggle premium', 'danger');
        } finally {
            setSaving(false);
        }
    };

    const handleExpand = (corso) => {
        const id = corso.id || corso.pageId;
        if (expandedId === id) {
            setExpandedId(null);
            setEditData(null);
        } else {
            setExpandedId(id);
            setEditData({
                'Nome Corso': field(corso, 'Nome Corso'),
                Descrizione: field(corso, 'Descrizione'),
                Prezzo: Number(field(corso, 'Prezzo', 0)) || 0,
                Docente: field(corso, 'Docente'),
                'Durata Ore': Number(field(corso, 'Durata Ore', 0)) || 0,
                Livello: field(corso, 'Livello') || 'Principiante',
                Categoria: field(corso, 'Categoria') || 'Elettronica',
                'Premium Only': Boolean(field(corso, 'Premium Only', false)),
                Rating: Number(field(corso, 'Rating', 0)) || 0,
                'Studenti Iscritti': Number(field(corso, 'Studenti Iscritti', 0)) || 0,
                Stato: field(corso, 'Stato') || 'Bozza',
            });
        }
    };

    const resetFilters = () => {
        setSearch('');
        setFilterLivello('');
        setFilterCategoria('');
        setFilterStato('');
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <div style={{ padding: isMobile ? '12px' : '24px', maxWidth: 1400, margin: '0 auto' }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    zIndex: 9999,
                    padding: '12px 20px',
                    borderRadius: 8,
                    background: toast.type === 'danger' ? COLORS.danger : COLORS.success,
                    color: COLORS.white,
                    fontSize: 14,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    animation: 'fadeIn 0.3s ease',
                    maxWidth: isMobile ? '90vw' : 400,
                }}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 12,
                marginBottom: 24,
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 24, color: COLORS.text, fontWeight: 700 }}>
                        Gestione Corsi
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: COLORS.textMuted }}>
                        Database Notion &middot; {filtered.length} risultati
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => exportCorsiCSV(filtered)}
                        style={{
                            ...S.btn,
                            background: COLORS.white,
                            color: COLORS.primary,
                            border: `1px solid ${COLORS.border}`,
                        }}
                        title="Esporta CSV"
                    >
                        CSV
                    </button>
                    <button
                        onClick={loadCorsi}
                        disabled={loading}
                        style={{
                            ...S.btn,
                            background: COLORS.white,
                            color: COLORS.primary,
                            border: `1px solid ${COLORS.border}`,
                        }}
                    >
                        {loading ? 'Caricamento...' : 'Ricarica'}
                    </button>
                    <button
                        onClick={() => { setShowCreate(true); setNewCourse({ ...EMPTY_COURSE }); }}
                        style={{ ...S.btn, background: COLORS.primary, color: COLORS.white }}
                    >
                        + Nuovo Corso
                    </button>
                </div>
            </div>

            {/* Statistiche */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: isMobile ? 8 : 16,
                marginBottom: 24,
            }}>
                <StatCard
                    label="Totale Corsi"
                    value={stats.totale}
                    icon="C"
                    color={COLORS.primary}
                    bg={COLORS.primaryBg}
                    isMobile={isMobile}
                />
                <StatCard
                    label="Corsi Attivi"
                    value={stats.attivi}
                    icon="A"
                    color="var(--elab-hex-3f6212)"
                    bg={COLORS.successBg}
                    isMobile={isMobile}
                />
                <StatCard
                    label="Studenti Totali"
                    value={stats.studenti.toLocaleString('it-IT')}
                    icon="S"
                    color="var(--elab-hex-92400e)"
                    bg={COLORS.warningBg}
                    isMobile={isMobile}
                />
                <StatCard
                    label="Revenue Stimata"
                    value={`€ ${stats.revenue.toLocaleString('it-IT', { minimumFractionDigits: 0 })}`}
                    icon="R"
                    color={COLORS.success}
                    bg={COLORS.successBg}
                    isMobile={isMobile}
                />
            </div>

            {/* Filtri */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: isMobile ? 6 : 10,
                marginBottom: 20,
                alignItems: 'center',
            }}>
                <input
                    type="text"
                    placeholder="Cerca corso, docente..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        ...S.input,
                        flex: isMobile ? '1 1 100%' : '1 1 220px',
                        minWidth: isMobile ? '100%' : 180,
                    }}
                />
                <select
                    value={filterLivello}
                    onChange={e => setFilterLivello(e.target.value)}
                    style={{ ...S.select, flex: isMobile ? '1 1 48%' : '0 0 auto' }}
                >
                    <option value="">Tutti i Livelli</option>
                    {LIVELLI.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select
                    value={filterCategoria}
                    onChange={e => setFilterCategoria(e.target.value)}
                    style={{ ...S.select, flex: isMobile ? '1 1 48%' : '0 0 auto' }}
                >
                    <option value="">Tutte le Categorie</option>
                    {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                    value={filterStato}
                    onChange={e => setFilterStato(e.target.value)}
                    style={{ ...S.select, flex: isMobile ? '1 1 48%' : '0 0 auto' }}
                >
                    <option value="">Tutti gli Stati</option>
                    {STATI.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {(search || filterLivello || filterCategoria || filterStato) && (
                    <button onClick={resetFilters} style={{ ...S.btn, background: 'var(--elab-hex-f1f5f9)', color: COLORS.textMuted, fontSize: 14 }}>
                        Azzera Filtri
                    </button>
                )}
            </div>

            {/* Errore */}
            {error && (
                <div style={{
                    padding: '14px 18px',
                    background: COLORS.dangerBg,
                    border: `1px solid ${COLORS.danger}`,
                    borderRadius: 8,
                    color: COLORS.danger,
                    marginBottom: 20,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                }}>
                    <span>{error}</span>
                    <button onClick={loadCorsi} style={{ ...S.btn, background: COLORS.danger, color: COLORS.white, fontSize: 14 }}>
                        Riprova
                    </button>
                </div>
            )}

            {/* Modale creazione */}
            {showCreate && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9000,
                    padding: isMobile ? 12 : 24,
                }}>
                    <div style={{
                        background: COLORS.white,
                        borderRadius: 12,
                        padding: isMobile ? 16 : 28,
                        width: '100%',
                        maxWidth: 600,
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: 18, color: COLORS.text }}>Nuovo Corso</h3>
                            <button
                                onClick={() => setShowCreate(false)}
                                style={{ ...S.btn, background: 'var(--elab-hex-f1f5f9)', color: COLORS.textMuted, padding: '4px 10px', fontSize: 18, lineHeight: 1 }}
                            >
                                &times;
                            </button>
                        </div>

                        <CourseForm
                            data={newCourse}
                            onChange={setNewCourse}
                            isMobile={isMobile}
                        />

                        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowCreate(false)}
                                style={{ ...S.btn, background: 'var(--elab-hex-f1f5f9)', color: COLORS.textMuted }}
                            >
                                Annulla
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={saving}
                                style={{ ...S.btn, background: COLORS.primary, color: COLORS.white, opacity: saving ? 0.6 : 1 }}
                            >
                                {saving ? 'Salvataggio...' : 'Crea Corso'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Conferma eliminazione */}
            {deleteConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9000,
                    padding: isMobile ? 12 : 24,
                }}>
                    <div style={{
                        background: COLORS.white,
                        borderRadius: 12,
                        padding: isMobile ? 16 : 28,
                        width: '100%',
                        maxWidth: 420,
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 12, color: COLORS.danger, fontWeight: 700 }}>{'\u26A0'}</div>
                        <h3 style={{ margin: '0 0 8px', color: COLORS.text }}>Conferma Eliminazione</h3>
                        <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20 }}>
                            Stai per eliminare <strong>{deleteConfirm.name}</strong>. Questa azione non è reversibile.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                style={{ ...S.btn, background: 'var(--elab-hex-f1f5f9)', color: COLORS.textMuted }}
                            >
                                Annulla
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm.id)}
                                disabled={saving}
                                style={{ ...S.btn, background: COLORS.danger, color: COLORS.white, opacity: saving ? 0.6 : 1 }}
                            >
                                {saving ? 'Eliminazione...' : 'Elimina'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Caricamento */}
            {loading && (
                <div style={{ textAlign: 'center', padding: 60, color: COLORS.textMuted }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        border: `3px solid ${COLORS.border}`,
                        borderTopColor: COLORS.primary,
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 12px',
                    }} />
                    <p style={{ fontSize: 14, margin: 0 }}>Caricamento corsi da Notion...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                </div>
            )}

            {/* Nessun risultato */}
            {!loading && !error && filtered.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: isMobile ? 30 : 60,
                    color: COLORS.textMuted,
                }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>
                        {corsi.length === 0 ? '\u2014' : '\u2014'}
                    </div>
                    <p style={{ fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>
                        {corsi.length === 0 ? 'Nessun corso presente' : 'Nessun risultato trovato'}
                    </p>
                    <p style={{ fontSize: 14, margin: 0, color: COLORS.textMuted }}>
                        {corsi.length === 0
                            ? 'Crea il primo corso usando il pulsante sopra.'
                            : 'Prova a modificare i filtri o la ricerca.'}
                    </p>
                    {(search || filterLivello || filterCategoria || filterStato) && (
                        <button onClick={resetFilters} style={{ ...S.btn, background: COLORS.primaryBg, color: COLORS.primary, marginTop: 12 }}>
                            Azzera Filtri
                        </button>
                    )}
                </div>
            )}

            {/* Griglia Card */}
            {!loading && filtered.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: isMobile ? 12 : 16,
                }}>
                    {filtered.map(corso => {
                        const id = corso.id || corso.pageId;
                        const nome = field(corso, 'Nome Corso');
                        const docente = field(corso, 'Docente');
                        const prezzo = Number(field(corso, 'Prezzo', 0)) || 0;
                        const livello = field(corso, 'Livello') || 'Principiante';
                        const categoria = field(corso, 'Categoria') || '';
                        const rating = Number(field(corso, 'Rating', 0)) || 0;
                        const studenti = Number(field(corso, 'Studenti Iscritti', 0)) || 0;
                        const stato = field(corso, 'Stato') || 'Bozza';
                        const premium = Boolean(field(corso, 'Premium Only', false));
                        const durata = Number(field(corso, 'Durata Ore', 0)) || 0;
                        const isExpanded = expandedId === id;
                        const livColors = LIVELLO_COLORS[livello] || LIVELLO_COLORS.Principiante;
                        const statoColors = STATO_COLORS[stato] || STATO_COLORS.Bozza;

                        return (
                            <div key={id} style={{
                                background: COLORS.white,
                                borderRadius: 10,
                                border: isExpanded ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                                boxShadow: isExpanded ? COLORS.cardShadowHover : COLORS.cardShadow,
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                            }}>
                                {/* Card Header - cliccabile */}
                                <div
                                    onClick={() => handleExpand(corso)}
                                    style={{
                                        padding: isMobile ? '12px 14px' : '16px 20px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {/* Top row: badges */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            borderRadius: 4,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            background: livColors.bg,
                                            color: livColors.color,
                                        }}>
                                            {livello}
                                        </span>
                                        {categoria && (
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: 4,
                                                fontSize: 14,
                                                fontWeight: 500,
                                                background: COLORS.primaryBg,
                                                color: COLORS.primary,
                                            }}>
                                                {categoria}
                                            </span>
                                        )}
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            borderRadius: 4,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            background: statoColors.bg,
                                            color: statoColors.color,
                                        }}>
                                            {stato}
                                        </span>
                                        {premium && (
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: 4,
                                                fontSize: 14,
                                                fontWeight: 600,
                                                background: 'var(--elab-hex-fef3c7)',
                                                color: 'var(--elab-hex-92400e)',
                                            }}>
                                                PREMIUM
                                            </span>
                                        )}
                                    </div>

                                    {/* Nome Corso */}
                                    <h4 style={{
                                        margin: '0 0 4px',
                                        fontSize: isMobile ? 15 : 16,
                                        fontWeight: 700,
                                        color: COLORS.text,
                                        lineHeight: 1.3,
                                    }}>
                                        {nome || 'Corso senza nome'}
                                    </h4>

                                    {/* Docente */}
                                    {docente && (
                                        <p style={{ margin: '0 0 10px', fontSize: 14, color: COLORS.textMuted }}>
                                            di {docente}
                                        </p>
                                    )}

                                    {/* Bottom row: prezzo, rating, studenti, durata */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: isMobile ? 8 : 14,
                                        fontSize: 14,
                                    }}>
                                        <span style={{ fontWeight: 700, color: COLORS.primary, fontSize: 16 }}>
                                            {prezzo > 0 ? `€${prezzo}` : 'Gratuito'}
                                        </span>
                                        <span style={{ color: 'var(--elab-hex-f59e0b)', letterSpacing: 1 }} title={`Rating: ${rating}/5`}>
                                            {renderStars(rating)}
                                            <span style={{ color: COLORS.textMuted, fontSize: 14, marginLeft: 3 }}>
                                                {rating > 0 ? rating.toFixed(1) : ''}
                                            </span>
                                        </span>
                                        <span style={{ color: COLORS.textMuted }}>
                                            {studenti} studenti
                                        </span>
                                        {durata > 0 && (
                                            <span style={{ color: COLORS.textMuted }}>
                                                {durata}h
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Pannello espanso: Modifica */}
                                {isExpanded && editData && (
                                    <div style={{
                                        borderTop: `1px solid ${COLORS.border}`,
                                        padding: isMobile ? '12px 14px' : '16px 20px',
                                        background: COLORS.bg,
                                    }}>
                                        <CourseForm
                                            data={editData}
                                            onChange={setEditData}
                                            isMobile={isMobile}
                                        />

                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 8,
                                            marginTop: 16,
                                            justifyContent: 'space-between',
                                        }}>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                <button
                                                    onClick={() => handleTogglePremium(corso)}
                                                    disabled={saving}
                                                    style={{
                                                        ...S.btn,
                                                        background: premium ? COLORS.warningBg : 'var(--elab-hex-f1f5f9)',
                                                        color: premium ? 'var(--elab-hex-92400e)' : COLORS.textMuted,
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    {premium ? 'Rimuovi Premium' : 'Rendi Premium'}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({ id, name: nome })}
                                                    disabled={saving}
                                                    style={{ ...S.btn, background: COLORS.dangerBg, color: COLORS.danger, fontSize: 14 }}
                                                >
                                                    Elimina
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => { setExpandedId(null); setEditData(null); }}
                                                    style={{ ...S.btn, background: 'var(--elab-hex-f1f5f9)', color: COLORS.textMuted, fontSize: 14 }}
                                                >
                                                    Chiudi
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate(id)}
                                                    disabled={saving}
                                                    style={{
                                                        ...S.btn,
                                                        background: COLORS.primary,
                                                        color: COLORS.white,
                                                        fontSize: 14,
                                                        opacity: saving ? 0.6 : 1,
                                                    }}
                                                >
                                                    {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ============================================
// SUB-COMPONENTE: StatCard
// ============================================
function StatCard({ label, value, icon, color, bg, isMobile }) {
    return (
        <div style={{
            background: COLORS.white,
            borderRadius: 10,
            padding: isMobile ? '10px 12px' : '16px 20px',
            border: `1px solid ${COLORS.border}`,
            boxShadow: COLORS.cardShadow,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: isMobile ? 28 : 34,
                    height: isMobile ? 28 : 34,
                    borderRadius: 8,
                    background: bg,
                    fontSize: isMobile ? 14 : 16,
                }}>
                    {icon}
                </span>
                <span style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: 500 }}>
                    {label}
                </span>
            </div>
            <div style={{
                fontSize: isMobile ? 18 : 22,
                fontWeight: 700,
                color,
                lineHeight: 1.1,
            }}>
                {value}
            </div>
        </div>
    );
}

// ============================================
// SUB-COMPONENTE: CourseForm
// ============================================
function CourseForm({ data, onChange, isMobile }) {
    const update = (key, value) => {
        onChange(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Nome Corso */}
            <div>
                <label style={S.label}>Nome Corso *</label>
                <input
                    type="text"
                    value={data['Nome Corso'] || ''}
                    onChange={e => update('Nome Corso', e.target.value)}
                    placeholder="es. Introduzione ad Arduino"
                    style={S.input}
                />
            </div>

            {/* Descrizione */}
            <div>
                <label style={S.label}>Descrizione</label>
                <textarea
                    value={data.Descrizione || ''}
                    onChange={e => update('Descrizione', e.target.value)}
                    placeholder="Descrizione del corso..."
                    rows={3}
                    style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit' }}
                />
            </div>

            {/* Grid 2 colonne */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 12,
            }}>
                {/* Docente */}
                <div>
                    <label style={S.label}>Docente</label>
                    <input
                        type="text"
                        value={data.Docente || ''}
                        onChange={e => update('Docente', e.target.value)}
                        placeholder="Nome docente"
                        style={S.input}
                    />
                </div>

                {/* Prezzo */}
                <div>
                    <label style={S.label}>Prezzo (EUR)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.Prezzo ?? 0}
                        onChange={e => update('Prezzo', parseFloat(e.target.value) || 0)}
                        style={S.input}
                    />
                </div>

                {/* Durata Ore */}
                <div>
                    <label style={S.label}>Durata (ore)</label>
                    <input
                        type="number"
                        min="0"
                        value={data['Durata Ore'] ?? 0}
                        onChange={e => update('Durata Ore', parseInt(e.target.value) || 0)}
                        style={S.input}
                    />
                </div>

                {/* Livello */}
                <div>
                    <label style={S.label}>Livello</label>
                    <select
                        value={data.Livello || 'Principiante'}
                        onChange={e => update('Livello', e.target.value)}
                        style={S.select}
                    >
                        {LIVELLI.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                {/* Categoria */}
                <div>
                    <label style={S.label}>Categoria</label>
                    <select
                        value={data.Categoria || 'Elettronica'}
                        onChange={e => update('Categoria', e.target.value)}
                        style={S.select}
                    >
                        {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Stato */}
                <div>
                    <label style={S.label}>Stato</label>
                    <select
                        value={data.Stato || 'Bozza'}
                        onChange={e => update('Stato', e.target.value)}
                        style={S.select}
                    >
                        {STATI.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Rating */}
                <div>
                    <label style={S.label}>Rating (0-5)</label>
                    <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={data.Rating ?? 0}
                        onChange={e => update('Rating', parseFloat(e.target.value) || 0)}
                        style={S.input}
                    />
                </div>

                {/* Studenti Iscritti */}
                <div>
                    <label style={S.label}>Studenti Iscritti</label>
                    <input
                        type="number"
                        min="0"
                        value={data['Studenti Iscritti'] ?? 0}
                        onChange={e => update('Studenti Iscritti', parseInt(e.target.value) || 0)}
                        style={S.input}
                    />
                </div>
            </div>

            {/* Premium toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                <div
                    onClick={() => update('Premium Only', !data['Premium Only'])}
                    style={{
                        width: 42,
                        height: 24,
                        borderRadius: 12,
                        background: data['Premium Only'] ? COLORS.warning : 'var(--elab-hex-cbd5e1)',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s ease',
                        flexShrink: 0,
                    }}
                >
                    <div style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: COLORS.white,
                        position: 'absolute',
                        top: 3,
                        left: data['Premium Only'] ? 21 : 3,
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                </div>
                <label style={{ fontSize: 14, color: COLORS.text, cursor: 'pointer' }}
                    onClick={() => update('Premium Only', !data['Premium Only'])}
                >
                    Premium Only
                </label>
            </div>
        </div>
    );
}

// ============================================
// STILI CONDIVISI (inline objects)
// ============================================
const S = {
    btn: {
        padding: '8px 16px',
        borderRadius: 6,
        border: 'none',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'opacity 0.15s ease',
        whiteSpace: 'nowrap',
    },
    input: {
        width: '100%',
        padding: '8px 12px',
        borderRadius: 6,
        border: `1px solid ${COLORS.border}`,
        fontSize: 14,
        color: COLORS.text,
        outline: 'none',
        background: COLORS.white,
        boxSizing: 'border-box',
        transition: 'border-color 0.15s ease',
    },
    select: {
        padding: '8px 12px',
        borderRadius: 6,
        border: `1px solid ${COLORS.border}`,
        fontSize: 14,
        color: COLORS.text,
        outline: 'none',
        background: COLORS.white,
        cursor: 'pointer',
        boxSizing: 'border-box',
    },
    label: {
        display: 'block',
        fontSize: 14,
        fontWeight: 600,
        color: COLORS.textMuted,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
    },
};
