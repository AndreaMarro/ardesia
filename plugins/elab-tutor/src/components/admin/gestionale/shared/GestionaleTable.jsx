// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Tabella Dati Professionale
// Componente riutilizzabile per tutti i moduli
// ============================================

import React, { useState, useCallback } from 'react';
import { COLORS, S } from '../GestionaleStyles';

// ── Icone ordinamento ──────────────────────────
const SortIcon = ({ direction }) => {
    if (!direction) {
        return (
            <span style={{ opacity: 0.3, marginLeft: '4px', fontSize: '14px' }}>
                {'  \u2195'}
            </span>
        );
    }
    return (
        <span style={{ marginLeft: '4px', fontSize: '14px', color: COLORS.accentLight }}>
            {direction === 'asc' ? ' \u2191' : ' \u2193'}
        </span>
    );
};

// ── Layout Card (Mobile) ───────────────────────
function MobileCardLayout({ columns, data, onRowClick, emptyMessage, emptyIcon }) {
    if (!data || data.length === 0) {
        return (
            <div style={S.emptyState}>
                <div style={S.emptyIcon}>{emptyIcon || ''}</div>
                <div style={S.emptyText}>{emptyMessage || 'Nessun dato disponibile'}</div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.map((row, rowIdx) => (
                <div
                    key={row.id || rowIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                        background: COLORS.card,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '10px',
                        padding: '14px 16px',
                        cursor: onRowClick ? 'pointer' : 'default',
                        transition: 'all 0.15s',
                    }}
                    className="gestionale-table-row"
                >
                    {columns.map((col) => {
                        const cellValue = col.render
                            ? col.render(row[col.key], row)
                            : row[col.key];

                        return (
                            <div
                                key={col.key}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '5px 0',
                                    borderBottom: `1px solid ${COLORS.borderLight}`,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: COLORS.textSecondary,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.3px',
                                        flexShrink: 0,
                                        marginRight: '12px',
                                    }}
                                >
                                    {col.label}
                                </span>
                                <span
                                    style={{
                                        fontSize: '14px',
                                        color: COLORS.textPrimary,
                                        textAlign: 'right',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {cellValue ?? '\u2014'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

// ── Componente Principale ──────────────────────
const ROWS_PER_PAGE = 50;

export default function GestionaleTable({
    columns = [],
    data = [],
    onRowClick,
    emptyMessage,
    emptyIcon,
    isMobile,
    pageSize = ROWS_PER_PAGE,
}) {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [hoveredRow, setHoveredRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);

    // Gestione ordinamento
    const handleSort = useCallback(
        (key) => {
            if (sortKey === key) {
                setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            } else {
                setSortKey(key);
                setSortDir('asc');
            }
        },
        [sortKey]
    );

    // Dati ordinati
    const sortedData = React.useMemo(() => {
        if (!sortKey) return data;
        return [...data].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

            // Gestisci valori null/undefined
            if (valA == null && valB == null) return 0;
            if (valA == null) return 1;
            if (valB == null) return -1;

            // Ordinamento numerico
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDir === 'asc' ? valA - valB : valB - valA;
            }

            // Ordinamento stringhe
            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            if (strA < strB) return sortDir === 'asc' ? -1 : 1;
            if (strA > strB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortKey, sortDir]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const safePage = Math.min(currentPage, totalPages - 1);
    const pagedData = sortedData.length > pageSize
        ? sortedData.slice(safePage * pageSize, (safePage + 1) * pageSize)
        : sortedData;

    // Reset page when data changes
    React.useEffect(() => { setCurrentPage(0); }, [data.length]);

    const PaginationBar = () => {
        if (sortedData.length <= pageSize) return null;
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderTop: `1px solid ${COLORS.border}`,
                fontSize: '14px', color: COLORS.textSecondary,
            }}>
                <span>
                    {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sortedData.length)} di {sortedData.length}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={safePage === 0}
                        style={paginationBtnStyle(safePage === 0)}
                        aria-label="Pagina precedente"
                    >‹</button>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={safePage >= totalPages - 1}
                        style={paginationBtnStyle(safePage >= totalPages - 1)}
                        aria-label="Pagina successiva"
                    >›</button>
                </div>
            </div>
        );
    };

    // ── Mobile: Card Layout ────────────────────
    if (isMobile) {
        return (
            <div>
                <MobileCardLayout
                    columns={columns}
                    data={pagedData}
                    onRowClick={onRowClick}
                    emptyMessage={emptyMessage}
                    emptyIcon={emptyIcon}
                />
                <PaginationBar />
            </div>
        );
    }

    // ── Desktop: Tabella ───────────────────────
    if (!sortedData || sortedData.length === 0) {
        return (
            <div style={S.emptyState}>
                <div style={S.emptyIcon}>{emptyIcon || ''}</div>
                <div style={S.emptyText}>{emptyMessage || 'Nessun dato disponibile'}</div>
            </div>
        );
    }

    return (
        <div
            style={{
                overflowX: 'auto',
                borderRadius: '10px',
                border: `1px solid ${COLORS.border}`,
                background: COLORS.card,
            }}
        >
            <table style={S.table}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                onClick={() => handleSort(col.key)}
                                style={{
                                    padding: '12px 14px',
                                    background: COLORS.bg,
                                    color: COLORS.textSecondary,
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    textAlign: 'left',
                                    borderBottom: `2px solid ${COLORS.border}`,
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    whiteSpace: 'nowrap',
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 1,
                                    width: col.width || 'auto',
                                    ...(col.flex ? { flex: col.flex } : {}),
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = COLORS.borderLight;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = COLORS.bg;
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {col.label}
                                    <SortIcon
                                        direction={sortKey === col.key ? sortDir : null}
                                    />
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {pagedData.map((row, rowIdx) => {
                        const isHovered = hoveredRow === rowIdx;
                        return (
                            <tr
                                key={row.id || rowIdx}
                                onClick={() => onRowClick && onRowClick(row)}
                                onMouseEnter={() => setHoveredRow(rowIdx)}
                                onMouseLeave={() => setHoveredRow(null)}
                                style={{
                                    cursor: onRowClick ? 'pointer' : 'default',
                                    background: isHovered
                                        ? COLORS.accentBg
                                        : rowIdx % 2 === 0
                                        ? COLORS.card
                                        : COLORS.bg,
                                    transition: 'background 0.12s',
                                }}
                            >
                                {columns.map((col) => {
                                    const cellValue = col.render
                                        ? col.render(row[col.key], row)
                                        : row[col.key];

                                    return (
                                        <td
                                            key={col.key}
                                            style={{
                                                padding: '11px 14px',
                                                fontSize: '14px',
                                                color: COLORS.textPrimary,
                                                borderBottom: `1px solid ${COLORS.borderLight}`,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: col.width || '300px',
                                            }}
                                        >
                                            {cellValue ?? '\u2014'}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <PaginationBar />
        </div>
    );
}

// Pagination button style helper
function paginationBtnStyle(disabled) {
    return {
        padding: '6px 12px', border: `1px solid ${COLORS.border}`,
        borderRadius: '6px', background: disabled ? COLORS.bg : COLORS.card,
        color: disabled ? COLORS.borderLight : COLORS.textPrimary,
        cursor: disabled ? 'default' : 'pointer', fontSize: '14px',
        fontWeight: '600', minWidth: '36px', minHeight: '44px',
    };
}
