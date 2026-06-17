// ELAB Gestionale - Top 10 Clienti per Fatturato BarChart
// © Andrea Marro — 18 Febbraio 2026
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../GestionaleStyles';

export default function TopClientiChart({ data = [], isMobile }) {
    if (!data.length) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: COLORS.textMuted, fontSize: '14px' }}>
                Nessun dato clienti disponibile
            </div>
        );
    }

    return (
        <div style={{ background: COLORS.card, borderRadius: '10px', border: `1px solid ${COLORS.border}`, padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: COLORS.textPrimary, margin: '0 0 14px' }}>
                 Top 10 Clienti
            </h3>
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
                <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <XAxis type="number" tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 14 }} stroke={COLORS.textMuted} />
                    <YAxis type="category" dataKey="nome" tick={{ fontSize: 14 }} stroke={COLORS.textMuted} width={100} />
                    <Tooltip formatter={(v) => `€${v.toLocaleString('it-IT')}`} />
                    <Bar dataKey="fatturato" fill={COLORS.accent} radius={[0, 4, 4, 0]} name="Fatturato" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
