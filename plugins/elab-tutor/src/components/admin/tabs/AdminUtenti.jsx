// ============================================
// ELAB Tutor - Admin Utenti (Notion CRUD)
// Gestione completa utenti su database Notion
// via backend webhook → notionService
// © Andrea Marro — 08/02/2026
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { utentiService } from '../../../services/notionService';

// ============================================
// COSTANTI
// ============================================
const COLORS = {
    primary: 'var(--elab-navy)',
    success: 'var(--elab-lime)',
    warning: '#f59e0b', // palette
    danger: '#ef4444', // palette
    bg: '#f0f4f8', // palette
    white: '#ffffff', // palette
    border: '#e0e0e0', // palette
    lightBorder: '#f0f0f0', // palette
    text: '#333333', // palette
    textSecondary: '#666666', // palette
    textMuted: '#737373', // palette
    headerBg: '#f8f9fa', // palette
};

const PAGE_SIZE = 20;

const RUOLI = ['user', 'admin'];
const STATI = ['attivo', 'sospeso', 'bannato'];
const TIPI = ['Famiglia', 'Scuola'];

const EMPTY_NEW_USER = {
    Nome: '',
    Email: '',
    'Password Hash': '',
    Bio: '',
    Scuola: '',
    'Città': '',
    Ruolo: 'user',
    Stato: 'attivo',
    Tipo: 'Famiglia',
    Premium: false,
    Punti: 0,
    Livello: 1,
};

// ============================================
// HELPERS
// ============================================
function getInitial(name) {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return '-';
    }
}

function getStatoColor(stato) {
    switch (stato) {
        case 'attivo': return COLORS.success;
        case 'sospeso': return COLORS.warning;
        case 'bannato': return COLORS.danger;
        default: return COLORS.textMuted;
    }
}

function getSubStatusColor(status) {
    if (!status) return COLORS.textMuted;
    const s = status.toLowerCase();
    if (s === 'active' || s === 'trialing') return COLORS.success;
    if (s === 'past_due' || s === 'unpaid') return COLORS.warning;
    if (s === 'canceled' || s === 'incomplete_expired') return COLORS.danger;
    return COLORS.textMuted;
}

function getRowBg(stato) {
    if (stato === 'bannato') return '#fef2f2'; // palette
    if (stato === 'sospeso') return '#fffbeb'; // palette
    return COLORS.white;
}

// ============================================
// CSV EXPORT — © Andrea Marro — 20/02/2026
// ============================================
function exportUtentiCSV(users) {
    const headers = ['#', 'Nome', 'Email', 'Ruolo', 'Stato', 'Tipo', 'Scuola', 'Città', 'Premium', 'Livello', 'Punti'];
    const rows = users.map((u, i) => [
        i + 1,
        `"${(u.Nome || u.nome || '').replace(/"/g, '""')}"`,
        `"${(u.Email || u.email || '').replace(/"/g, '""')}"`,
        u.Ruolo || u.ruolo || '',
        u.Stato || u.stato || '',
        u.Tipo || u.tipo || '',
        `"${(u.Scuola || u.scuola || '').replace(/"/g, '""')}"`,
        `"${(u['Città'] || u.citta || '').replace(/"/g, '""')}"`,
        u.Premium ? 'Sì' : 'No',
        u.Livello || u.livello || 0,
        u.Punti || u.punti || 0,
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utenti_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// COMPONENTE PRINCIPALE
// ============================================
export default function AdminUtenti({ isMobile }) {
    // --- State ---
    const [users, setUsers] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Editing
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // Creation
    const [showCreate, setShowCreate] = useState(false);
    const [newUser, setNewUser] = useState({ ...EMPTY_NEW_USER });
    const [createError, setCreateError] = useState('');
    const [creating, setCreating] = useState(false);

    // Delete confirm
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Saving state per-row
    const [savingId, setSavingId] = useState(null);

    // ============================================
    // FETCH UTENTI
    // ============================================
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await utentiService.getAll({}, { useCache: false });
            const items = result.items || [];
            setUsers(items);
            setTotalCount(result.total || items.length);
        } catch (err) {
            setError(err.message || 'Errore nel caricamento utenti');
            setUsers([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ============================================
    // FILTRO E PAGINAZIONE
    // ============================================
    const filteredUsers = useMemo(() => {
        if (!search.trim()) return users;
        const q = search.toLowerCase().trim();
        return users.filter(u => {
            const nome = (u.Nome || u.nome || '').toLowerCase();
            const email = (u.Email || u.email || '').toLowerCase();
            return nome.includes(q) || email.includes(q);
        });
    }, [users, search]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredUsers.slice(start, start + PAGE_SIZE);
    }, [filteredUsers, currentPage]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    // Counts
    const counts = useMemo(() => {
        const all = users.length;
        let attivi = 0, sospesi = 0, bannati = 0;
        users.forEach(u => {
            const stato = (u.Stato || u.stato || '').toLowerCase();
            if (stato === 'attivo') attivi++;
            else if (stato === 'sospeso') sospesi++;
            else if (stato === 'bannato') bannati++;
        });
        return { all, attivi, sospesi, bannati };
    }, [users]);

    // ============================================
    // CRUD HANDLERS
    // ============================================

    // --- CREATE ---
    const handleCreate = async () => {
        const nome = (newUser.Nome || '').trim();
        const email = (newUser.Email || '').trim();
        const password = (newUser['Password Hash'] || '').trim();

        if (!nome) { setCreateError('Il campo Nome e obbligatorio'); return; }
        if (!email) { setCreateError('Il campo Email e obbligatorio'); return; }
        if (!password) { setCreateError('Il campo Password e obbligatorio'); return; }
        if (password.length < 6) { setCreateError('La password deve avere almeno 6 caratteri'); return; }

        setCreating(true);
        setCreateError('');
        try {
            await utentiService.create({
                ...newUser,
                'Data Registrazione': new Date().toISOString(),
            });
            setShowCreate(false);
            setNewUser({ ...EMPTY_NEW_USER });
            setCreateError('');
            await fetchUsers();
        } catch (err) {
            setCreateError(err.message || 'Errore nella creazione');
        } finally {
            setCreating(false);
        }
    };

    // --- UPDATE inline fields ---
    const handleStartEdit = (user) => {
        setEditingId(user.id);
        setEditData({
            Nome: user.Nome || user.nome || '',
            Bio: user.Bio || user.bio || '',
            Scuola: user.Scuola || user.scuola || '',
            'Città': user['Città'] || user.citta || '',
        });
    };

    const handleSaveEdit = async (userId) => {
        setSavingId(userId);
        try {
            await utentiService.update(userId, editData);
            setEditingId(null);
            setEditData({});
            await fetchUsers();
        } catch (err) {
            setError('Errore nel salvataggio: ' + (err.message || ''));
        } finally {
            setSavingId(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    // --- CHANGE ROLE ---
    const handleChangeRole = async (userId, newRole) => {
        setSavingId(userId);
        try {
            await utentiService.update(userId, { Ruolo: newRole });
            await fetchUsers();
        } catch (err) {
            setError('Errore cambio ruolo: ' + (err.message || ''));
        } finally {
            setSavingId(null);
        }
    };

    // --- CHANGE STATUS ---
    const handleChangeStatus = async (userId, newStatus) => {
        setSavingId(userId);
        try {
            await utentiService.update(userId, { Stato: newStatus });
            await fetchUsers();
        } catch (err) {
            setError('Errore cambio stato: ' + (err.message || ''));
        } finally {
            setSavingId(null);
        }
    };

    // --- DELETE ---
    const handleDelete = async (userId) => {
        setDeleting(true);
        try {
            await utentiService.delete(userId);
            setDeleteConfirmId(null);
            await fetchUsers();
        } catch (err) {
            setError('Errore eliminazione: ' + (err.message || ''));
        } finally {
            setDeleting(false);
        }
    };

    // ============================================
    // RENDER: LOADING
    // ============================================
    if (loading) {
        return (
            <div style={S.loadingContainer}>
                <div style={S.spinner} />
                <p style={S.loadingText}>Caricamento utenti da Notion...</p>
            </div>
        );
    }

    // ============================================
    // RENDER: MAIN
    // ============================================
    return (
        <div style={S.wrapper}>
            {/* ERROR BANNER */}
            {error && (
                <div style={S.errorBanner}>
                    <span style={S.errorText}>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        style={S.errorDismiss}
                    >
                        Chiudi
                    </button>
                </div>
            )}

            {/* STATS BAR */}
            <div style={{
                ...S.statsBar,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '8px' : '16px',
            }}>
                <StatBadge label="Totale" value={counts.all} color={COLORS.primary} />
                <StatBadge label="Attivi" value={counts.attivi} color={COLORS.success} />
                <StatBadge label="Sospesi" value={counts.sospesi} color={COLORS.warning} />
                <StatBadge label="Bannati" value={counts.bannati} color={COLORS.danger} />
            </div>

            {/* TOOLBAR */}
            <div style={{
                ...S.toolbar,
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
            }}>
                <div style={{
                    ...S.searchWrapper,
                    maxWidth: isMobile ? 'none' : '400px',
                }}>
                    <span style={S.searchIcon}>&#128270;</span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cerca per nome o email..."
                        style={{
                            ...S.searchInput,
                            paddingLeft: '36px',
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            style={S.searchClear}
                        >
                            x
                        </button>
                    )}
                </div>
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    justifyContent: isMobile ? 'space-between' : 'flex-end',
                }}>
                    <span style={S.countLabel}>
                        {filteredUsers.length} di {counts.all} utenti
                    </span>
                    <button
                        onClick={() => exportUtentiCSV(filteredUsers)}
                        style={{
                            ...S.refreshBtn,
                            fontSize: '14px',
                        }}
                        title="Esporta CSV"
                    >
                        
                    </button>
                    <button
                        onClick={() => { setShowCreate(!showCreate); setCreateError(''); }}
                        style={S.createBtn}
                    >
                        + Nuovo Utente
                    </button>
                    <button
                        onClick={fetchUsers}
                        style={S.refreshBtn}
                        title="Ricarica"
                    >
                        &#8635;
                    </button>
                </div>
            </div>

            {/* CREATE FORM */}
            {showCreate && (
                <div style={S.createForm}>
                    <h4 style={S.createTitle}>Crea Nuovo Utente</h4>
                    <div style={{
                        ...S.formGrid,
                        gridTemplateColumns: isMobile
                            ? '1fr'
                            : 'repeat(auto-fill, minmax(200px, 1fr))',
                    }}>
                        <input
                            value={newUser.Nome}
                            onChange={(e) => setNewUser(u => ({ ...u, Nome: e.target.value }))}
                            placeholder="Nome *"
                            style={S.formInput}
                        />
                        <input
                            type="email"
                            value={newUser.Email}
                            onChange={(e) => setNewUser(u => ({ ...u, Email: e.target.value }))}
                            placeholder="Email *"
                            style={S.formInput}
                        />
                        <input
                            type="password"
                            value={newUser['Password Hash']}
                            onChange={(e) => setNewUser(u => ({ ...u, 'Password Hash': e.target.value }))}
                            placeholder="Password *"
                            style={S.formInput}
                        />
                        <select
                            value={newUser.Ruolo}
                            onChange={(e) => setNewUser(u => ({ ...u, Ruolo: e.target.value }))}
                            style={S.formSelect}
                        >
                            {RUOLI.map(r => (
                                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                            ))}
                        </select>
                        <select
                            value={newUser.Stato}
                            onChange={(e) => setNewUser(u => ({ ...u, Stato: e.target.value }))}
                            style={S.formSelect}
                        >
                            {STATI.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                        <select
                            value={newUser.Tipo}
                            onChange={(e) => setNewUser(u => ({ ...u, Tipo: e.target.value }))}
                            style={S.formSelect}
                        >
                            {TIPI.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <input
                            value={newUser.Scuola}
                            onChange={(e) => setNewUser(u => ({ ...u, Scuola: e.target.value }))}
                            placeholder="Scuola"
                            style={S.formInput}
                        />
                        <input
                            value={newUser['Città']}
                            onChange={(e) => setNewUser(u => ({ ...u, 'Città': e.target.value }))}
                            placeholder="Città"
                            style={S.formInput}
                        />
                        <input
                            value={newUser.Bio}
                            onChange={(e) => setNewUser(u => ({ ...u, Bio: e.target.value }))}
                            placeholder="Bio"
                            style={S.formInput}
                        />
                        <label style={S.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={newUser.Premium}
                                onChange={(e) => setNewUser(u => ({ ...u, Premium: e.target.checked }))}
                            />
                            Premium
                        </label>
                    </div>
                    {createError && (
                        <p style={S.createError}>{createError}</p>
                    )}
                    <div style={S.createActions}>
                        <button
                            onClick={() => { setShowCreate(false); setCreateError(''); setNewUser({ ...EMPTY_NEW_USER }); }}
                            style={S.cancelBtn}
                        >
                            Annulla
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            style={{
                                ...S.saveBtn,
                                opacity: creating ? 0.6 : 1,
                                cursor: creating ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {creating ? 'Creazione...' : 'Crea Utente'}
                        </button>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM DIALOG */}
            {deleteConfirmId && (
                <div style={S.overlay}>
                    <div style={{
                        ...S.confirmDialog,
                        width: isMobile ? '90%' : '420px',
                    }}>
                        <h4 style={S.confirmTitle}>Conferma Eliminazione</h4>
                        <p style={S.confirmText}>
                            Sei sicuro di voler eliminare questo utente? L'operazione non può essere annullata.
                        </p>
                        <div style={S.confirmActions}>
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                style={S.cancelBtn}
                                disabled={deleting}
                            >
                                Annulla
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                disabled={deleting}
                                style={{
                                    ...S.dangerBtn,
                                    opacity: deleting ? 0.6 : 1,
                                    cursor: deleting ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {deleting ? 'Eliminazione...' : 'Elimina'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLE */}
            <div style={S.tableContainer}>
                <div style={{ overflowX: 'auto' }}>
                    {/* HEADER */}
                    <div style={{
                        ...S.tableHeader,
                        minWidth: '900px',
                    }}>
                        <span style={{ width: '40px', flexShrink: 0 }}>#</span>
                        <span style={{ width: '40px', flexShrink: 0 }}></span>
                        <span style={{ flex: 2, minWidth: '120px' }}>Nome</span>
                        <span style={{ flex: 2, minWidth: '160px' }}>Email</span>
                        <span style={{ width: '80px', flexShrink: 0 }}>Ruolo</span>
                        <span style={{ width: '100px', flexShrink: 0 }}>Stato</span>
                        <span style={{ width: '100px', flexShrink: 0 }}>Subscription</span>
                        <span style={{ width: '90px', flexShrink: 0 }}>Registrato</span>
                        <span style={{ width: '130px', flexShrink: 0, textAlign: 'right' }}>Azioni</span>
                    </div>

                    {/* ROWS */}
                    {paginatedUsers.length === 0 ? (
                        <div style={S.emptyRow}>
                            {search
                                ? 'Nessun utente corrisponde alla ricerca.'
                                : 'Nessun utente trovato.'}
                        </div>
                    ) : (
                        paginatedUsers.map((user, idx) => {
                            const userId = user.id;
                            const nome = user.Nome || user.nome || '';
                            const email = user.Email || user.email || '';
                            const ruolo = user.Ruolo || user.ruolo || 'user';
                            const stato = user.Stato || user.stato || 'attivo';
                            const subStatus = user['Subscription Status'] || user.subscriptionStatus || '';
                            const dataReg = user['Data Registrazione'] || user.dataRegistrazione || '';
                            const isEditing = editingId === userId;
                            const isSaving = savingId === userId;
                            const globalIdx = (currentPage - 1) * PAGE_SIZE + idx + 1;

                            return (
                                <div
                                    key={userId}
                                    style={{
                                        ...S.tableRow,
                                        minWidth: '900px',
                                        background: isEditing ? '#fffbeb' : getRowBg(stato), // palette
                                        opacity: isSaving ? 0.6 : 1,
                                    }}
                                >
                                    {/* # */}
                                    <span style={{ width: '40px', flexShrink: 0, color: COLORS.textMuted, fontSize: '14px' }}>
                                        {globalIdx}
                                    </span>

                                    {/* Avatar */}
                                    <span style={{ width: '40px', flexShrink: 0 }}>
                                        <div style={{
                                            ...S.avatar,
                                            background: ruolo === 'admin' ? COLORS.primary : '#e0e0e0', // palette
                                            color: ruolo === 'admin' ? COLORS.white : COLORS.textSecondary,
                                        }}>
                                            {getInitial(nome)}
                                        </div>
                                    </span>

                                    {/* Nome */}
                                    <span style={{ flex: 2, minWidth: '120px' }}>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <input
                                                    value={editData.Nome}
                                                    onChange={(e) => setEditData(d => ({ ...d, Nome: e.target.value }))}
                                                    style={S.inlineInput}
                                                    placeholder="Nome"
                                                />
                                                <input
                                                    value={editData.Bio}
                                                    onChange={(e) => setEditData(d => ({ ...d, Bio: e.target.value }))}
                                                    style={S.inlineInput}
                                                    placeholder="Bio"
                                                />
                                                <input
                                                    value={editData.Scuola}
                                                    onChange={(e) => setEditData(d => ({ ...d, Scuola: e.target.value }))}
                                                    style={S.inlineInput}
                                                    placeholder="Scuola"
                                                />
                                                <input
                                                    value={editData['Città']}
                                                    onChange={(e) => setEditData(d => ({ ...d, 'Città': e.target.value }))}
                                                    style={S.inlineInput}
                                                    placeholder="Città"
                                                />
                                            </div>
                                        ) : (
                                            <span style={{ fontWeight: '600', fontSize: '14px', color: COLORS.text }}>
                                                {nome || '-'}
                                            </span>
                                        )}
                                    </span>

                                    {/* Email */}
                                    <span style={{ flex: 2, minWidth: '160px', fontSize: '14px', color: COLORS.textSecondary, wordBreak: 'break-all' }}>
                                        {email || '-'}
                                    </span>

                                    {/* Ruolo */}
                                    <span style={{ width: '80px', flexShrink: 0 }}>
                                        <select
                                            value={ruolo}
                                            onChange={(e) => handleChangeRole(userId, e.target.value)}
                                            disabled={isSaving}
                                            style={{
                                                ...S.miniSelect,
                                                fontWeight: ruolo === 'admin' ? '700' : '400',
                                                color: ruolo === 'admin' ? COLORS.primary : COLORS.textSecondary,
                                            }}
                                        >
                                            {RUOLI.map(r => (
                                                <option key={r} value={r}>
                                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </span>

                                    {/* Stato */}
                                    <span style={{ width: '100px', flexShrink: 0 }}>
                                        <select
                                            value={stato}
                                            onChange={(e) => handleChangeStatus(userId, e.target.value)}
                                            disabled={isSaving}
                                            style={{
                                                ...S.miniSelect,
                                                color: getStatoColor(stato),
                                                fontWeight: '600',
                                            }}
                                        >
                                            {STATI.map(s => (
                                                <option key={s} value={s}>
                                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </span>

                                    {/* Subscription Status */}
                                    <span style={{ width: '100px', flexShrink: 0 }}>
                                        {subStatus ? (
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                background: getSubStatusColor(subStatus) + '18',
                                                color: getSubStatusColor(subStatus),
                                            }}>
                                                {subStatus}
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '14px', color: COLORS.textMuted }}>-</span>
                                        )}
                                    </span>

                                    {/* Data Registrazione */}
                                    <span style={{ width: '90px', flexShrink: 0, fontSize: '14px', color: COLORS.textMuted }}>
                                        {formatDate(dataReg)}
                                    </span>

                                    {/* Actions */}
                                    <span style={{ width: '130px', flexShrink: 0, display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => handleSaveEdit(userId)}
                                                    disabled={isSaving}
                                                    style={S.tinyBtnSuccess}
                                                    title="Salva"
                                                >
                                                    {isSaving ? '...' : 'Salva'}
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    disabled={isSaving}
                                                    style={S.tinyBtn}
                                                    title="Annulla"
                                                >
                                                    Annulla
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleStartEdit(user)}
                                                    style={S.tinyBtn}
                                                    title="Modifica nome, bio, scuola, città"
                                                    disabled={isSaving}
                                                >
                                                    Modifica
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(userId)}
                                                    style={S.tinyBtnDanger}
                                                    title="Elimina utente"
                                                    disabled={isSaving}
                                                >
                                                    Elimina
                                                </button>
                                            </>
                                        )}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div style={{
                    ...S.pagination,
                    flexDirection: isMobile ? 'column' : 'row',
                }}>
                    <span style={S.pageInfo}>
                        Pagina {currentPage} di {totalPages}
                        {' '}({filteredUsers.length} risultati)
                    </span>
                    <div style={S.pageButtons}>
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            style={{
                                ...S.pageBtn,
                                opacity: currentPage === 1 ? 0.4 : 1,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            &laquo;
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{
                                ...S.pageBtn,
                                opacity: currentPage === 1 ? 0.4 : 1,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            &lsaquo; Prec
                        </button>

                        {/* Page number buttons */}
                        {(() => {
                            const pages = [];
                            let start = Math.max(1, currentPage - 2);
                            let end = Math.min(totalPages, currentPage + 2);
                            if (end - start < 4) {
                                if (start === 1) end = Math.min(totalPages, start + 4);
                                else start = Math.max(1, end - 4);
                            }
                            for (let p = start; p <= end; p++) {
                                pages.push(
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        style={{
                                            ...S.pageBtn,
                                            background: p === currentPage ? COLORS.primary : COLORS.white,
                                            color: p === currentPage ? COLORS.white : COLORS.text,
                                            fontWeight: p === currentPage ? '700' : '400',
                                        }}
                                    >
                                        {p}
                                    </button>
                                );
                            }
                            return pages;
                        })()}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            style={{
                                ...S.pageBtn,
                                opacity: currentPage === totalPages ? 0.4 : 1,
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Succ &rsaquo;
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            style={{
                                ...S.pageBtn,
                                opacity: currentPage === totalPages ? 0.4 : 1,
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            }}
                        >
                            &raquo;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// SUB-COMPONENT: Stat Badge
// ============================================
function StatBadge({ label, value, color }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: COLORS.white,
            borderRadius: '8px',
            borderLeft: `4px solid ${color}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color, lineHeight: 1 }}>
                {value}
            </span>
            <span style={{ fontSize: '14px', color: COLORS.textMuted, fontWeight: '600' }}>
                {label}
            </span>
        </div>
    );
}

// ============================================
// STYLES (all inline JS objects)
// ============================================
const S = {
    wrapper: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },

    // Loading
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: `4px solid ${COLORS.border}`,
        borderTopColor: COLORS.primary,
        borderRadius: '50%',
        animation: 'adminUtentiSpin 0.8s linear infinite',
    },
    loadingText: {
        marginTop: '16px',
        fontSize: '14px',
        color: COLORS.textMuted,
    },

    // Error
    errorBanner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#fef2f2', // palette
        border: '1px solid #fecaca', // palette
        borderRadius: '8px',
        marginBottom: '16px',
        gap: '12px',
    },
    errorText: {
        fontSize: '14px',
        color: COLORS.danger,
        fontWeight: '600',
        flex: 1,
    },
    errorDismiss: {
        padding: '4px 12px',
        background: COLORS.danger,
        color: COLORS.white,
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        flexShrink: 0,
    },

    // Stats Bar
    statsBar: {
        display: 'flex',
        flexWrap: 'wrap',
        marginBottom: '16px',
    },

    // Toolbar
    toolbar: {
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
    },
    searchWrapper: {
        position: 'relative',
        flex: 1,
    },
    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '14px',
        color: COLORS.textMuted,
        pointerEvents: 'none',
    },
    searchInput: {
        width: '100%',
        padding: '9px 36px 9px 16px',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        background: COLORS.white,
    },
    searchClear: {
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        color: COLORS.textMuted,
        padding: '2px 6px',
        lineHeight: 1,
    },
    countLabel: {
        fontSize: '14px',
        color: COLORS.textMuted,
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },
    createBtn: {
        padding: '9px 18px',
        background: COLORS.success,
        color: COLORS.white,
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },
    refreshBtn: {
        padding: '9px 12px',
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        color: COLORS.textSecondary,
        lineHeight: 1,
    },

    // Create Form
    createForm: {
        background: COLORS.white,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: `2px solid ${COLORS.primary}30`,
    },
    createTitle: {
        margin: '0 0 14px',
        color: COLORS.primary,
        fontSize: '16px',
        fontWeight: '700',
    },
    formGrid: {
        display: 'grid',
        gap: '10px',
        marginBottom: '10px',
    },
    formInput: {
        padding: '9px 14px',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    formSelect: {
        padding: '9px 14px',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '8px',
        fontSize: '14px',
        background: COLORS.white,
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: COLORS.text,
        padding: '9px 0',
    },
    createError: {
        color: COLORS.danger,
        fontSize: '14px',
        margin: '4px 0 0',
        fontWeight: '600',
    },
    createActions: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
        marginTop: '14px',
    },

    // Table
    tableContainer: {
        background: COLORS.white,
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    tableHeader: {
        display: 'flex',
        padding: '12px 16px',
        background: COLORS.headerBg,
        borderBottom: '2px solid #e8e8e8', // palette
        fontSize: '14px',
        fontWeight: '700',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        alignItems: 'center',
    },
    tableRow: {
        display: 'flex',
        padding: '10px 16px',
        borderBottom: `1px solid ${COLORS.lightBorder}`,
        alignItems: 'center',
        fontSize: '14px',
        transition: 'background 0.15s',
    },
    emptyRow: {
        padding: '40px',
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: '14px',
    },

    // Avatar
    avatar: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '700',
        flexShrink: 0,
    },

    // Mini select
    miniSelect: {
        padding: '4px 6px',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '4px',
        fontSize: '14px',
        background: COLORS.white,
        cursor: 'pointer',
        fontFamily: 'inherit',
        width: '100%',
        boxSizing: 'border-box',
    },

    // Inline editing
    inlineInput: {
        padding: '4px 8px',
        border: `1px solid ${COLORS.warning}`,
        borderRadius: '4px',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        background: '#fffbeb', // palette
        fontFamily: 'inherit',
    },

    // Tiny buttons
    tinyBtn: {
        padding: '4px 10px',
        background: '#f0f0f0', // palette
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        color: COLORS.textSecondary,
        whiteSpace: 'nowrap',
    },
    tinyBtnSuccess: {
        padding: '4px 10px',
        background: '#dcfce7', // palette
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        color: '#16a34a', // palette
        whiteSpace: 'nowrap',
    },
    tinyBtnDanger: {
        padding: '4px 10px',
        background: '#fee2e2', // palette
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        color: COLORS.danger,
        whiteSpace: 'nowrap',
    },

    // Primary buttons
    cancelBtn: {
        padding: '8px 18px',
        background: '#f0f0f0', // palette
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    saveBtn: {
        padding: '8px 18px',
        background: COLORS.success,
        color: COLORS.white,
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },
    dangerBtn: {
        padding: '8px 18px',
        background: COLORS.danger,
        color: COLORS.white,
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },

    // Pagination
    pagination: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '16px',
        gap: '12px',
    },
    pageInfo: {
        fontSize: '14px',
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    pageButtons: {
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap',
    },
    pageBtn: {
        padding: '6px 12px',
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        color: COLORS.text,
        minWidth: '32px',
        textAlign: 'center',
    },

    // Confirm dialog overlay
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
    },
    confirmDialog: {
        background: COLORS.white,
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '420px',
    },
    confirmTitle: {
        margin: '0 0 12px',
        color: COLORS.danger,
        fontSize: '18px',
        fontWeight: '700',
    },
    confirmText: {
        margin: '0 0 20px',
        color: COLORS.textSecondary,
        fontSize: '14px',
        lineHeight: '1.5',
    },
    confirmActions: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
    },
};

// ============================================
// INJECT SPINNER KEYFRAME (only once)
// ============================================
if (typeof document !== 'undefined') {
    const styleId = 'admin-utenti-keyframes';
    if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
            @keyframes adminUtentiSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styleEl);
    }
}
