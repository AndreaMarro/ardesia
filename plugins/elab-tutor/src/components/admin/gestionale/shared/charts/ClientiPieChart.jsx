// ELAB Gestionale - Clienti per Tipo PieChart
// © Andrea Marro — 18 Febbraio 2026
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../GestionaleStyles';

const PIE_COLORS = [COLORS.accent, COLORS.success, COLORS.warning, 'var(--elab-hex-8b5cf6)', 'var(--elab-hex-ec4899)'];

export default function ClientiPieChart({ data = [], isMobile }) {
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
                 Clienti per Tipo
            </h3>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 40 : 55}
                        outerRadius={isMobile ? 65 : 85}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        style={{ fontSize: '14px' }}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
