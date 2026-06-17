// ELAB Gestionale - GlobalSearch (Cmd+K ricerca cross-entita)
// © Andrea Marro — 18 Febbraio 2026
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { COLORS, S } from '../GestionaleStyles';
import { clientiService, fornitoriService, fattureService, ordiniService, prodottiService, documentiService } from '../GestionaleService';
import { formatCurrency, truncate } from '../shared/GestionaleUtils';
import logger from '../../../../utils/logger';

const ENTITY_CONFIG = {
    clienti:    { icon: '', label: 'Clienti',    service: clientiService,    searchFields: ['nome', 'ragioneSociale', 'email'] },
    fornitori:  { icon: '', label: 'Fornitori',  service: fornitoriService,  searchFields: ['nome', 'ragioneSociale', 'email'] },
    fatture:    { icon: '', label: 'Fatture',     service: fattureService,    searchFields: ['numero', 'clienteNome', 'note'] },
    ordini:     { icon: '', label: 'Ordini',      service: ordiniService,     searchFields: ['numero', 'clienteNome', 'note'] },
    prodotti:   { icon: '', label: 'Prodotti',    service: prodottiService,   searchFields: ['nome', 'codice', 'categoria'] },
    documenti:  { icon: '', label: 'Documenti',   service: documentiService,  searchFields: ['nome', 'tipo', 'descrizione'] },
};

const RECENT_STORAGE_KEY = 'elab_gest_recent_searches';
const MAX_RECENT = 5;
const CACHE_TTL = 60000; // 60s

function getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY) || '[]'); }
    catch { return []; }
}

function addRecent(query) {
    if (!query?.trim()) return;
    const recent = getRecent().filter(r => r !== query);
    recent.unshift(query);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export default function GlobalSearch({ open, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({});
    const [selectedIdx, setSelectedIdx] = useState(0);
    const inputRef = useRef(null);
    const cacheRef = useRef({ data: {}, timestamp: 0 });

    // Focus input on open
    useEffect(() => {
        if (open) {
            setQuery('');
            setResults({});
            setSelectedIdx(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Load all data with cache
    const loadAllData = useCallback(async () => {
        const now = Date.now();
        if (now - cacheRef.current.timestamp < CACHE_TTL && Object.keys(cacheRef.current.data).length > 0) {
            return cacheRef.current.data;
        }

        const allData = {};
        const entries = Object.entries(ENTITY_CONFIG);

        await Promise.all(entries.map(async ([key, config]) => {
            try {
                const data = await config.service.getAll();
                allData[key] = data || [];
            } catch {
                allData[key] = [];
            }
        }));

        cacheRef.current = { data: allData, timestamp: now };
        return allData;
    }, []);

    // Search with debounce
    useEffect(() => {
        if (!query.trim() || !open) {
            setResults({});
            return;
        }

        const timer = setTimeout(async () => {
            const allData = await loadAllData();
            const q = query.toLowerCase();
            const matched = {};

            for (const [key, config] of Object.entries(ENTITY_CONFIG)) {
                const items = allData[key] || [];
                const hits = items.filter(item => {
                    return config.searchFields.some(field => {
                        const val = item[field];
                        return val && String(val).toLowerCase().includes(q);
                    });
                }).slice(0, 5); // Max 5 per category

                if (hits.length > 0) {
                    matched[key] = hits;
                }
            }

            setResults(matched);
            setSelectedIdx(0);
        }, 200);

        return () => clearTimeout(timer);
    }, [query, open, loadAllData]);

    // Flatten results for keyboard navigation
    const flatResults = useMemo(() => {
        const flat = [];
        for (const [key, items] of Object.entries(results)) {
            for (const item of items) {
                flat.push({ entity: key, item });
            }
        }
        return flat;
    }, [results]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIdx(i => Math.min(i + 1, flatResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && flatResults[selectedIdx]) {
            addRecent(query);
            logger.info(`[GlobalSearch] Selezionato: ${flatResults[selectedIdx].entity} — ${flatResults[selectedIdx].item.nome || flatResults[selectedIdx].item.numero || 'N/A'}`);
            onClose();
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [flatResults, selectedIdx, query, onClose]);

    if (!open) return null;

    const recentSearches = getRecent();

    // Render item display name
    function getItemLabel(entity, item) {
        if (entity === 'fatture' || entity === 'ordini') {
            return `${item.numero || 'N/A'} — ${item.clienteNome || ''}`;
        }
        return item.nome || item.ragioneSociale || item.numero || 'N/A';
    }

    function getItemDetail(entity, item) {
        if (entity === 'fatture') return formatCurrency(item.totale || 0);
        if (entity === 'ordini') return item.stato || '';
        if (entity === 'prodotti') return `Qty: ${item.quantita ?? item.giacenza ?? 0}`;
        return item.email || item.tipo || '';
    }

    let flatIdx = 0;

    return (
        <div
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', zIndex: 9999,
                display: 'flex', justifyContent: 'center', paddingTop: '15vh',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: COLORS.card, borderRadius: '12px',
                    width: '100%', maxWidth: '560px', maxHeight: '480px',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', alignSelf: 'flex-start',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Search input */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}`,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Cerca clienti, fatture, ordini, prodotti..."
                        style={{
                            flex: 1, border: 'none', outline: 'none', fontSize: '15px',
                            color: COLORS.textPrimary, background: 'transparent',
                            fontFamily: 'inherit',
                        }}
                    />
                    <kbd style={{
                        fontSize: '14px', color: COLORS.textMuted, background: COLORS.bg,
                        padding: '2px 8px', borderRadius: '4px', border: `1px solid ${COLORS.border}`,
                    }}>
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {!query.trim() && recentSearches.length > 0 && (
                        <div style={{ padding: '10px 16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>
                                Ricerche recenti
                            </div>
                            {recentSearches.map((r, i) => (
                                <div
                                    key={i}
                                    onClick={() => setQuery(r)}
                                    style={{
                                        padding: '8px 10px', cursor: 'pointer', borderRadius: '6px',
                                        fontSize: '14px', color: COLORS.textSecondary,
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}
                                >
                                    <span style={{ fontSize: '14px' }}></span> {r}
                                </div>
                            ))}
                        </div>
                    )}

                    {query.trim() && Object.keys(results).length === 0 && (
                        <div style={{ padding: '30px 16px', textAlign: 'center', color: COLORS.textMuted, fontSize: '14px' }}>
                            Nessun risultato per "{truncate(query, 30)}"
                        </div>
                    )}

                    {Object.entries(results).map(([entity, items]) => {
                        const config = ENTITY_CONFIG[entity];
                        return (
                            <div key={entity}>
                                <div style={{
                                    fontSize: '14px', fontWeight: '700', color: COLORS.textMuted,
                                    padding: '8px 16px 4px', textTransform: 'uppercase',
                                }}>
                                    {config.icon} {config.label}
                                </div>
                                {items.map((item) => {
                                    const currentIdx = flatIdx++;
                                    const isSelected = currentIdx === selectedIdx;
                                    return (
                                        <div
                                            key={item.id || currentIdx}
                                            onClick={() => {
                                                addRecent(query);
                                                logger.info(`[GlobalSearch] Click: ${entity} — ${getItemLabel(entity, item)}`);
                                                onClose();
                                            }}
                                            style={{
                                                padding: '8px 16px', cursor: 'pointer',
                                                background: isSelected ? COLORS.accentBg : 'transparent',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                borderRadius: '6px', margin: '0 8px',
                                            }}
                                        >
                                            <span style={{ fontSize: '14px', color: COLORS.textPrimary, fontWeight: isSelected ? '600' : '400' }}>
                                                {truncate(getItemLabel(entity, item), 40)}
                                            </span>
                                            <span style={{ fontSize: '14px', color: COLORS.textMuted }}>
                                                {getItemDetail(entity, item)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '8px 16px', borderTop: `1px solid ${COLORS.border}`,
                    display: 'flex', gap: '12px', fontSize: '14px', color: COLORS.textMuted,
                }}>
                    <span><kbd style={{ padding: '1px 4px', border: `1px solid ${COLORS.border}`, borderRadius: '3px', fontSize: '14px' }}>↑↓</kbd> Naviga</span>
                    <span><kbd style={{ padding: '1px 4px', border: `1px solid ${COLORS.border}`, borderRadius: '3px', fontSize: '14px' }}>Enter</kbd> Seleziona</span>
                    <span><kbd style={{ padding: '1px 4px', border: `1px solid ${COLORS.border}`, borderRadius: '3px', fontSize: '14px' }}>Esc</kbd> Chiudi</span>
                </div>
            </div>
        </div>
    );
}
