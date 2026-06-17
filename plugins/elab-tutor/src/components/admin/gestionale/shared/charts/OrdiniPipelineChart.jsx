// ELAB Gestionale - Ordini Pipeline BarChart
// © Andrea Marro — 18 Febbraio 2026
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { COLORS } from '../../GestionaleStyles';

const PIPELINE_COLORS = ['var(--elab-hex-94a3b8)', 'var(--elab-hex-3b82f6)', 'var(--elab-hex-f59e0b)', 'var(--elab-hex-8b5cf6)', 'var(--elab-hex-059669)'];

export default function OrdiniPipelineChart({ data = [], isMobile }) {
    if (!data.length) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: COLORS.textMuted, fontSize: '14px' }}>
                Nessun ordine disponibile
            </div>
        );
    }

    return (
        <div style={{ background: COLORS.card, borderRadius: '10px', border: `1px solid ${COLORS.border}`, padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: COLORS.textPrimary, margin: '0 0 14px' }}>
                 Pipeline Ordini
            </h3>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 14 }} stroke={COLORS.textMuted} />
                    <YAxis type="category" dataKey="stato" tick={{ fontSize: 14 }} stroke={COLORS.textMuted} width={90} />
                    <Tooltip />
                    <Bar dataKey="count" name="Ordini" radius={[0, 4, 4, 0]}>
                        {data.map((_, i) => (
                            <Cell key={i} fill={PIPELINE_COLORS[i % PIPELINE_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
