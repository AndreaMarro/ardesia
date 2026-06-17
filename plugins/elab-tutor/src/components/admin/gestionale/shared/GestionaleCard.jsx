// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Card KPI Professionale
// Componente riutilizzabile per dashboard
// ============================================

import React, { useState } from 'react';
import { COLORS } from '../GestionaleStyles';

// ── Indicatore Trend ───────────────────────────
function TrendIndicator({ trend }) {
    if (trend == null || trend === 0) return null;

    const isPositive = trend > 0;
    const trendColor = isPositive ? COLORS.success : COLORS.danger;
    const trendBg = isPositive ? COLORS.successBg : COLORS.dangerBg;
    const arrow = isPositive ? '\u2191' : '\u2193';
    const sign = isPositive ? '+' : '';
    const formattedTrend = typeof trend === 'number'
        ? `${sign}${trend.toFixed(trend % 1 === 0 ? 0 : 1)}%`
        : trend;

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                color: trendColor,
                background: trendBg,
                letterSpacing: '0.2px',
            }}
        >
            <span style={{ fontSize: '14px' }}>{arrow}</span>
            {formattedTrend}
        </span>
    );
}

// ── Componente Principale ──────────────────────
export default function GestionaleCard({
    icon,
    label,
    value,
    subtitle,
    color = COLORS.accentLight,
    trend,
    onClick,
    isMobile,
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                background: COLORS.card,
                borderRadius: '10px',
                border: `1px solid ${isHovered ? color : COLORS.border}`,
                borderLeft: `4px solid ${color}`,
                padding: isMobile ? '14px 16px' : '18px 20px',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                boxShadow: isHovered
                    ? `0 4px 16px ${color}18`
                    : '0 1px 3px rgba(0,0,0,0.04)',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden',
                minWidth: 0,
            }}
        >
            {/* ── Decorazione sfondo ────────────── */}
            <div
                style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: `${color}08`,
                    pointerEvents: 'none',
                }}
            />

            {/* ── Header: Icona + Trend ─────────── */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                }}
            >
                <div
                    style={{
                        width: isMobile ? '36px' : '40px',
                        height: isMobile ? '36px' : '40px',
                        borderRadius: '10px',
                        background: `${color}12`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isMobile ? '18px' : '20px',
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </div>
                {trend != null && <TrendIndicator trend={trend} />}
            </div>

            {/* ── Valore principale ──────────────── */}
            <div
                style={{
                    fontSize: isMobile ? '22px' : '26px',
                    fontWeight: '800',
                    color: COLORS.textPrimary,
                    lineHeight: 1.1,
                    marginBottom: '4px',
                    letterSpacing: '-0.5px',
                }}
            >
                {value}
            </div>

            {/* ── Etichetta ─────────────────────── */}
            <div
                style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: COLORS.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    marginBottom: subtitle ? '6px' : 0,
                }}
            >
                {label}
            </div>

            {/* ── Sottotitolo opzionale ──────────── */}
            {subtitle && (
                <div
                    style={{
                        fontSize: '14px',
                        color: COLORS.textMuted,
                        lineHeight: 1.3,
                    }}
                >
                    {subtitle}
                </div>
            )}
        </div>
    );
}
