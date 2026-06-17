// ELAB Gestionale - Fatturato Mensile AreaChart
// © Andrea Marro — 18 Febbraio 2026
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../GestionaleStyles';

export default function FatturatoChart({ data = [], isMobile }) {
    if (!data.length) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: COLORS.textMuted, fontSize: '14px' }}>
                Nessun dato fatturato disponibile
            </div>
        );
    }

    return (
        <div style={{ background: COLORS.card, borderRadius: '10px', border: `1px solid ${COLORS.border}`, padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: COLORS.textPrimary, margin: '0 0 14px' }}>
                 Fatturato Mensile
            </h3>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="fatturato-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderLight} />
                    <XAxis dataKey="mese" tick={{ fontSize: 14 }} stroke={COLORS.textMuted} />
                    <YAxis tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 14 }} stroke={COLORS.textMuted} width={55} />
                    <Tooltip formatter={(v) => `€${v.toLocaleString('it-IT')}`} />
                    <Area type="monotone" dataKey="fatturato" stroke={COLORS.accent} strokeWidth={2} fill="url(#fatturato-gradient)" name="Fatturato" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
