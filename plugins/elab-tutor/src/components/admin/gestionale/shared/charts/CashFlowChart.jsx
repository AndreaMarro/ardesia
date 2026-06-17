// ELAB Gestionale - Cash Flow Chart (Entrate vs Uscite 12 mesi)
// © Andrea Marro — 18 Febbraio 2026
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../GestionaleStyles';

const formatEuro = (v) => `€${(v / 1000).toFixed(0)}k`;

export default function CashFlowChart({ data = [], isMobile }) {
    if (!data.length) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: COLORS.textMuted, fontSize: '14px' }}>
                Nessun dato cash flow disponibile
            </div>
        );
    }

    return (
        <div style={{ background: COLORS.card, borderRadius: '10px', border: `1px solid ${COLORS.border}`, padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: COLORS.textPrimary, margin: '0 0 14px' }}>
                 Cash Flow (12 mesi)
            </h3>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderLight} />
                    <XAxis dataKey="mese" tick={{ fontSize: 14 }} stroke={COLORS.textMuted} />
                    <YAxis tickFormatter={formatEuro} tick={{ fontSize: 14 }} stroke={COLORS.textMuted} width={55} />
                    <Tooltip formatter={(v) => `€${v.toLocaleString('it-IT')}`} />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Line type="monotone" dataKey="entrate" stroke={COLORS.success} strokeWidth={2} dot={{ r: 3 }} name="Entrate" />
                    <Line type="monotone" dataKey="uscite" stroke={COLORS.danger} strokeWidth={2} dot={{ r: 3 }} name="Uscite" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
