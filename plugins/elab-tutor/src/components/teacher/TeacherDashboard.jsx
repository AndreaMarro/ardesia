// ============================================
// ELAB Tutor - Dashboard Professore "La Serra"
// Monitoraggio classe: giardino, meteo,
// attività, confusione, nudge, documenti
// © Andrea Marro — 08/02/2026
// Tutti i diritti riservati
// ============================================

import React, { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import { adminService, usersLookup } from '../../services/userService';
import { createClass, listClasses, removeStudent, updateClassGames } from '../../services/authService';
import { useConfirmModal } from '../common/ConfirmModal';
import { showToast } from '../common/Toast';
import LESSON_PATHS from '../../data/lesson-paths/index';
import { sendNudge } from '../../services/nudgeService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { fetchTeacherClasses, fetchClassStudents, fetchClassSessions, fetchClassMoods, transformToLegacyFormat } from '../../services/teacherDataService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import css from './TeacherDashboard.module.css';
// Colori ELAB ufficiali
const C = {
    navy: 'var(--color-primary, var(--elab-navy))',
    navyDark: 'var(--color-primary-dark, #152a5c)',
    lime: 'var(--color-accent, var(--elab-lime))',
    limeDark: 'var(--elab-hex-7da93d)',
    limeLight: 'var(--elab-hex-bbd789)',
    limeSoft: 'var(--elab-hex-e8f4d9)',
    bg: 'var(--color-bg, #F0F4F8)',
    red: 'var(--elab-hex-e53935)',
    orange: 'var(--elab-orange)',
    cyan: 'var(--elab-hex-00b4d8)',
    text: 'var(--color-text-body, #1a1a2e)',
    textMuted: 'var(--color-text-muted, #475569)',
    white: 'var(--elab-hex-ffffff)',
    border: 'var(--color-border, #E2E8F0)',
};

// ─── INLINE SVG ICONS ─────────────────────────────────
const svgProps = { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

// Weather icons
const IconSun = ({ size = 18, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: color || 'currentColor' }}>
        <circle cx="10" cy="10" r="4" />
        <line x1="10" y1="1" x2="10" y2="3.5" /><line x1="10" y1="16.5" x2="10" y2="19" />
        <line x1="1" y1="10" x2="3.5" y2="10" /><line x1="16.5" y1="10" x2="19" y2="10" />
        <line x1="3.6" y1="3.6" x2="5.4" y2="5.4" /><line x1="14.6" y1="14.6" x2="16.4" y2="16.4" />
        <line x1="3.6" y1="16.4" x2="5.4" y2="14.6" /><line x1="14.6" y1="5.4" x2="16.4" y2="3.6" />
    </svg>
);
const IconStorm = ({ size = 18, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: color || 'currentColor' }}>
        <path d="M4 10a5 5 0 0 1 9.9-1H15a3 3 0 0 1 0 6H4.5a3.5 3.5 0 0 1-.5-7z" />
        <polyline points="10 13 8 17 12 17 10 20" strokeWidth="2" />
    </svg>
);
const IconRain = ({ size = 18, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: color || 'currentColor' }}>
        <path d="M4 9a5 5 0 0 1 9.9-1H15a3 3 0 0 1 0 6H4.5a3.5 3.5 0 0 1-.5-7z" />
        <line x1="7" y1="16" x2="6" y2="19" /><line x1="11" y1="16" x2="10" y2="19" /><line x1="15" y1="16" x2="14" y2="19" />
    </svg>
);
const IconCloud = ({ size = 18, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: color || 'currentColor' }}>
        <path d="M4 11a5 5 0 0 1 9.9-1H15a3 3 0 0 1 0 6H4.5a3.5 3.5 0 0 1-.5-7z" />
    </svg>
);
const IconPartlyCloudy = ({ size = 18, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: color || 'currentColor' }}>
        <circle cx="7" cy="7" r="3" />
        <line x1="7" y1="1" x2="7" y2="2.5" /><line x1="2" y1="7" x2="3.5" y2="7" />
        <line x1="3.5" y1="3.5" x2="4.6" y2="4.6" /><line x1="10.5" y1="3.5" x2="9.4" y2="4.6" />
        <path d="M6 12.5a4 4 0 0 1 7.9-.8H15a2.5 2.5 0 0 1 0 5H6.4a2.8 2.8 0 0 1-.4-5.6z" />
    </svg>
);

// Plant/growth stage icons
const IconSeedDormant = ({ size = 18 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-hex-8d6e63)' }}>
        <ellipse cx="10" cy="13" rx="4" ry="3" fill="var(--elab-hex-d7ccc8)" stroke="var(--elab-hex-8d6e63)" />
        <line x1="4" y1="17" x2="16" y2="17" stroke="var(--elab-hex-8d6e63)" />
    </svg>
);
const IconSeed = ({ size = 18 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-lime)' }}>
        <ellipse cx="10" cy="14" rx="4" ry="3" fill="var(--elab-hex-d7ccc8)" stroke="var(--elab-hex-8d6e63)" />
        <path d="M10 14 Q10 11 10 9" stroke="var(--elab-lime)" />
        <path d="M10 10 Q12 8 13 9" stroke="var(--elab-lime)" />
        <line x1="4" y1="17" x2="16" y2="17" stroke="var(--elab-hex-8d6e63)" />
    </svg>
);
const IconSprout = ({ size = 18 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-lime)' }}>
        <line x1="10" y1="17" x2="10" y2="8" stroke="var(--elab-lime)" />
        <path d="M10 10 Q7 7 5 8" stroke="var(--elab-lime)" fill="none" />
        <path d="M10 8 Q13 5 15 6" stroke="var(--elab-lime)" fill="none" />
        <line x1="4" y1="17" x2="16" y2="17" stroke="var(--elab-hex-8d6e63)" />
    </svg>
);
const IconBush = ({ size = 18 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-lime)' }}>
        <line x1="10" y1="17" x2="10" y2="10" stroke="var(--elab-hex-6d4c41)" />
        <circle cx="10" cy="7" r="5" fill="#A5D6A7" stroke="var(--elab-lime)" />
        <circle cx="7" cy="9" r="3" fill="#81C784" stroke="var(--elab-lime)" />
        <circle cx="13" cy="9" r="3" fill="#81C784" stroke="var(--elab-lime)" />
        <line x1="4" y1="17" x2="16" y2="17" stroke="var(--elab-hex-8d6e63)" />
    </svg>
);
const IconPine = ({ size = 18 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-lime)' }}>
        <rect x="9" y="15" width="2" height="3" fill="var(--elab-hex-6d4c41)" stroke="var(--elab-hex-6d4c41)" />
        <polygon points="10,2 4,10 7,10 3,15 17,15 13,10 16,10" fill="var(--elab-hex-66bb6a)" stroke="var(--elab-hex-43a047)" />
        <line x1="4" y1="18" x2="16" y2="18" stroke="var(--elab-hex-8d6e63)" />
    </svg>
);
const IconOak = ({ size = 18 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-lime)' }}>
        <rect x="9" y="14" width="2" height="4" fill="var(--elab-hex-5d4037)" stroke="var(--elab-hex-5d4037)" />
        <circle cx="10" cy="8" r="6" fill="var(--elab-hex-66bb6a)" stroke="var(--elab-hex-43a047)" />
        <circle cx="6" cy="10" r="3.5" fill="var(--elab-hex-81c784)" stroke="var(--elab-hex-43a047)" />
        <circle cx="14" cy="10" r="3.5" fill="var(--elab-hex-81c784)" stroke="var(--elab-hex-43a047)" />
        <circle cx="10" cy="5" r="3" fill="var(--elab-hex-a5d6a7)" stroke="var(--elab-hex-43a047)" />
        <line x1="4" y1="18" x2="16" y2="18" stroke="var(--elab-hex-8d6e63)" />
    </svg>
);

// Mood icons
const IconEnergico = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-hex-f5a623)' }}>
        <polygon points="10,1 12,8 19,8 13.5,12 15.5,19 10,14.5 4.5,19 6.5,12 1,8 8,8" fill="var(--elab-hex-f5a623)" stroke="none" />
    </svg>
);
const IconConcentrato = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-navy)' }}>
        <circle cx="10" cy="10" r="8" stroke="var(--elab-navy)" />
        <circle cx="10" cy="10" r="4" stroke="var(--elab-navy)" />
        <circle cx="10" cy="10" r="1" fill="var(--elab-navy)" stroke="none" />
    </svg>
);
const IconConfuso = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-hex-9333ea)' }}>
        <circle cx="10" cy="10" r="8" stroke="var(--elab-hex-9333ea)" />
        <path d="M7 7.5 Q7 5 10 5 Q13 5 13 7.5 Q13 9 10 10 L10 12" stroke="var(--elab-hex-9333ea)" fill="none" />
        <circle cx="10" cy="15" r="0.8" fill="var(--elab-hex-9333ea)" stroke="none" />
    </svg>
);
const IconBloccato = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-hex-e53935)' }}>
        <rect x="4" y="9" width="12" height="8" rx="2" stroke="var(--elab-hex-e53935)" />
        <path d="M7 9 V6 Q7 3 10 3 Q13 3 13 6 V9" stroke="var(--elab-hex-e53935)" fill="none" />
    </svg>
);
const IconFelice = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-lime)' }}>
        <circle cx="10" cy="10" r="8" stroke="var(--elab-lime)" />
        <circle cx="7" cy="8" r="1" fill="var(--elab-lime)" stroke="none" />
        <circle cx="13" cy="8" r="1" fill="var(--elab-lime)" stroke="none" />
        <path d="M6 12 Q10 16 14 12" stroke="var(--elab-lime)" fill="none" />
    </svg>
);
const IconFrustrato = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-hex-ef4444)' }}>
        <circle cx="10" cy="10" r="8" stroke="var(--elab-hex-ef4444)" />
        <circle cx="7" cy="8" r="1" fill="var(--elab-hex-ef4444)" stroke="none" />
        <circle cx="13" cy="8" r="1" fill="var(--elab-hex-ef4444)" stroke="none" />
        <path d="M6 15 Q10 11 14 15" stroke="var(--elab-hex-ef4444)" fill="none" />
    </svg>
);
const IconCurioso = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-hex-00b4d8)' }}>
        <circle cx="10" cy="10" r="8" stroke="var(--elab-hex-00b4d8)" />
        <circle cx="7" cy="8" r="1" fill="var(--elab-hex-00b4d8)" stroke="none" />
        <circle cx="13" cy="8" r="1" fill="var(--elab-hex-00b4d8)" stroke="none" />
        <circle cx="10" cy="14" r="2" stroke="var(--elab-hex-00b4d8)" fill="none" />
    </svg>
);
const IconCreativo = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-hex-ec4899)' }}>
        <path d="M10 3 Q6 3 6 7 Q6 10 10 12 Q14 10 14 7 Q14 3 10 3z" stroke="var(--elab-hex-ec4899)" fill="none" />
        <line x1="10" y1="12" x2="10" y2="16" stroke="var(--elab-hex-ec4899)" />
        <line x1="8" y1="16" x2="12" y2="16" stroke="var(--elab-hex-ec4899)" />
        <line x1="8" y1="7" x2="12" y2="7" stroke="var(--elab-hex-ec4899)" />
        <line x1="8" y1="9" x2="12" y2="9" stroke="var(--elab-hex-ec4899)" />
    </svg>
);

// Game icons
const IconDetective = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg}>
        <circle cx="8" cy="8" r="5" />
        <line x1="12" y1="12" x2="18" y2="18" strokeWidth="2" />
    </svg>
);
const IconPredict = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg}>
        <circle cx="10" cy="10" r="8" />
        <path d="M10 4 L10 10 L14 14" />
    </svg>
);
const IconReverse = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg}>
        <polyline points="3 10 7 6 7 14 3 10" fill="currentColor" stroke="none" />
        <polyline points="17 10 13 6 13 14 17 10" fill="currentColor" stroke="none" />
        <line x1="7" y1="10" x2="13" y2="10" />
    </svg>
);
const IconReview = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg}>
        <rect x="3" y="2" width="14" height="16" rx="2" />
        <line x1="7" y1="7" x2="13" y2="7" /><line x1="7" y1="10" x2="13" y2="10" /><line x1="7" y1="13" x2="11" y2="13" />
    </svg>
);

// Status icons
const IconCheck = ({ size = 14, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: color || 'var(--elab-lime)' }}>
        <circle cx="10" cy="10" r="8" stroke="currentColor" />
        <polyline points="6 10 9 13 14 7" stroke="currentColor" />
    </svg>
);
const IconQuestion = ({ size = 14, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: color || 'var(--elab-hex-f5a623)' }}>
        <circle cx="10" cy="10" r="8" stroke="currentColor" />
        <path d="M7 7.5 Q7 5 10 5 Q13 5 13 7.5 Q13 9 10 10 L10 12" stroke="currentColor" fill="none" />
        <circle cx="10" cy="15" r="0.8" fill="currentColor" stroke="none" />
    </svg>
);
const IconAlert = ({ size = 14, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: color || 'var(--elab-hex-e53935)' }}>
        <polygon points="10,2 19,18 1,18" stroke="currentColor" fill="none" />
        <line x1="10" y1="8" x2="10" y2="13" stroke="currentColor" />
        <circle cx="10" cy="15.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
);

// Nudge envelope icon
const IconNudge = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" className={css.iconSvg} style={{ color: 'var(--elab-navy)' }}>
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" />
        <polyline points="2 4 10 11 18 4" stroke="currentColor" />
    </svg>
);

// Weather icon lookup (returns JSX element)
const WEATHER_ICONS = {
    S: (size) => <IconSun size={size} />,
    T: (size) => <IconStorm size={size} />,
    P: (size) => <IconRain size={size} />,
    N: (size) => <IconCloud size={size} />,
    PN: (size) => <IconPartlyCloudy size={size} />,
};

// Plant icon lookup (returns JSX element)
const PLANT_ICONS = {
    '[0]': (size) => <IconSeedDormant size={size} />,
    '[1]': (size) => <IconSeed size={size} />,
    '[2]': (size) => <IconSprout size={size} />,
    '[3]': (size) => <IconBush size={size} />,
    '[4]': (size) => <IconPine size={size} />,
    '[5]': (size) => <IconOak size={size} />,
};

const MOOD_EMOJI = {
    energico: <IconEnergico />, concentrato: <IconConcentrato />,
    confuso: <IconConfuso />, bloccato: <IconBloccato />,
    felice: <IconFelice />, frustrato: <IconFrustrato />,
    curioso: <IconCurioso />, creativo: <IconCreativo />,
};

const MOOD_COLORS = {
    energico: '#F5A623', concentrato: 'var(--elab-navy)', confuso: '#9333EA', bloccato: '#E53935',
    felice: 'var(--elab-lime)', frustrato: '#EF4444', curioso: '#00B4D8', creativo: '#EC4899',
};

// Avatar color from name hash (deterministic)
const AVATAR_COLORS = ['var(--elab-navy)', 'var(--elab-lime)', 'var(--elab-orange)', 'var(--elab-red)', '#9333EA', '#00B4D8', '#EC4899', '#6D4C41'];
function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

// "Pianta" styles in base all'attività
function getPlantStyle(studentData) {
    if (!studentData) return { emoji: '[1]', size: 30, label: 'Seme' };
    const esp = studentData.stats?.esperimentiTotali || 0;
    const tempo = studentData.tempoTotale || 0;
    const concetti = studentData.concetti?.length || 0;

    if (esp >= 15 && concetti >= 10) return { emoji: '[5]', size: 50, label: 'Quercia' };
    if (esp >= 10 || concetti >= 8) return { emoji: '[4]', size: 44, label: 'Pino' };
    if (esp >= 5 || concetti >= 4) return { emoji: '[3]', size: 38, label: 'Cespuglio' };
    if (esp >= 2) return { emoji: '[2]', size: 34, label: 'Germoglio' };
    if (tempo > 300) return { emoji: '[1]', size: 30, label: 'Seme' };
    return { emoji: '[0]', size: 26, label: 'Seme dormiente' };
}

function getWeatherForConcept(allData, concettoId) {
    let totalConfusione = 0;
    let count = 0;
    Object.values(allData).forEach(d => {
        d.confusione?.filter(c => c.concettoId === concettoId).forEach(c => {
            totalConfusione += c.livello;
            count++;
        });
    });
    if (count === 0) return { icon: 'S', label: 'Sereno' };
    const media = totalConfusione / count;
    if (media > 7) return { icon: 'T', label: 'Tempesta' };
    if (media > 5) return { icon: 'P', label: 'Pioggia' };
    if (media > 3) return { icon: 'N', label: 'Nuvoloso' };
    return { icon: 'PN', label: 'Poco nuvoloso' };
}

// ─── VOLUME DETECTION ────────────────────────────────────
// Experiment IDs: cap1-..cap10 = Vol1, cap11-..cap20 = Vol2 (future), cap21+ = Vol3 (future)
// Vol3 experiments have IDs starting with "v3-" or "cap-v3-"
function getExperimentVolume(experimentId) {
    if (!experimentId) return null;
    const id = experimentId.toLowerCase();
    if (id.startsWith('v3-') || id.startsWith('cap-v3-') || id.includes('-vol3')) return 3;
    if (id.startsWith('v2-') || id.startsWith('cap-v2-') || id.includes('-vol2')) return 2;
    // Default: Vol 1 (cap1- through cap10-, or any other prefix)
    return 1;
}

function getStudentVolumes(studentData) {
    if (!studentData?.esperimenti?.length) return new Set();
    const vols = new Set();
    studentData.esperimenti.forEach(e => {
        const v = getExperimentVolume(e.experimentId);
        if (v) vols.add(v);
    });
    return vols;
}

// ─── CSV EXPORT ──────────────────────────────────────────
function exportStudentsCSV(users, allData, classReport, formatTempo) {
    const headers = ['#', 'Nome', 'Email', 'Scuola', 'Sessioni', 'Tempo Totale', 'Esperimenti', 'Stato'];
    const rows = users.map((u, i) => {
        const sd = allData[u.id];
        const att = classReport?.attivitaRecente?.find(a => a.userId === u.id);
        const isInattivo = classReport?.inattivi?.includes(u.id);
        const stato = isInattivo ? 'Inattivo' : (att?.sessioni > 3 ? 'Attivo' : 'Leggero');
        return [
            i + 1,
            `"${(u.nome || '').replace(/"/g, '""')}"`,
            `"${(u.email || '').replace(/"/g, '""')}"`,
            `"${(u.scuola || '').replace(/"/g, '""')}"`,
            att?.sessioni || 0,
            formatTempo(sd?.tempoTotale || 0),
            sd?.stats?.esperimentiTotali || 0,
            stato,
        ];
    });
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studenti_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`CSV esportato: ${users.length} studenti`, 'success');
}

// Build class report from transformed Supabase/legacy data (not from localStorage studentService)
function _buildReportFromLegacyData(legacyData) {
    const studenti = Object.values(legacyData).filter(Boolean);
    if (studenti.length === 0) return null;

    const concettiConfusione = {};
    studenti.forEach(s => {
        (s.confusione || []).forEach(c => {
            if (c.concettoId) {
                if (!concettiConfusione[c.concettoId]) concettiConfusione[c.concettoId] = { totale: 0, conteggio: 0 };
                concettiConfusione[c.concettoId].totale += c.livello;
                concettiConfusione[c.concettoId].conteggio++;
            }
        });
    });

    const esperimentiCount = {};
    studenti.forEach(s => {
        (s.esperimenti || []).filter(e => e.completato).forEach(e => {
            esperimentiCount[e.experimentId] = (esperimentiCount[e.experimentId] || 0) + 1;
        });
    });

    const settimanafa = new Date(Date.now() - 7 * 86400000);
    const attivitaRecente = studenti.map(s => ({
        userId: s.userId,
        sessioni: (s.sessioni || []).filter(sess => new Date(sess.inizio) > settimanafa).length,
        tempoSettimana: (s.sessioni || [])
            .filter(sess => new Date(sess.inizio) > settimanafa && sess.durata)
            .reduce((sum, sess) => sum + sess.durata, 0),
        esperimentiSettimana: (s.esperimenti || [])
            .filter(e => new Date(e.timestamp) > settimanafa).length,
    }));

    const inattivi = studenti.filter(s => {
        const ultima = (s.sessioni || [])[(s.sessioni || []).length - 1];
        return !ultima || new Date(ultima.inizio) < settimanafa;
    }).map(s => s.userId);

    const moodCount = {};
    studenti.forEach(s => {
        const ultimoMood = (s.moods || [])[(s.moods || []).length - 1];
        if (ultimoMood) moodCount[ultimoMood.mood] = (moodCount[ultimoMood.mood] || 0) + 1;
    });

    return {
        totaleStudenti: studenti.length,
        concettiConfusione,
        esperimentiCount,
        attivitaRecente,
        inattivi,
        moodCount,
        tempoMedioTotale: Math.round(studenti.reduce((sum, s) => sum + (s.tempoTotale || 0), 0) / studenti.length),
        mediaEsperimenti: Math.round(studenti.reduce((sum, s) => sum + (s.stats?.esperimentiTotali || 0), 0) / studenti.length * 10) / 10,
    };
}

export default function TeacherDashboard({ onNavigate }) {
    const { user, isDocente, isAdmin } = useAuth();
    const { confirm: confirmModal, ConfirmDialog } = useConfirmModal();
    const [activeTab, setActiveTab] = useState('classe');
    const [classeView, setClasseView] = useState('progressi'); // 'progressi' | 'giardino'
    const [reportSub, setReportSub] = useState('meteo'); // 'meteo' | 'report' | 'attivita'
    const [impostazioniSub, setImpostazioniSub] = useState('classi'); // 'classi' | 'documenti' | 'pnrr' | 'audit'
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [nudgeText, setNudgeText] = useState('');
    const [nudgesSent, setNudgesSent] = useState([]);
    const [filterSearch, setFilterSearch] = useState('');
    const [volumeFilter, setVolumeFilter] = useState('tutti'); // 'tutti' | '1' | '2' | '3'
    const [allStudentData, setAllStudentData] = useState({});
    const [classReport, setClassReport] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [dataSource, setDataSource] = useState('loading'); // 'server' | 'local' | 'demo' | 'loading'

    // Carica tutti gli utenti studenti
    const realUsers = useMemo(() => {
        return adminService.getAllUsers().filter(u => u.ruolo === 'user' && u.stato === 'attivo');
    }, []);

    // Stato vuoto: nessun dato reale disponibile
    const isEmptyState = dataSource === 'empty' && realUsers.length === 0 && !isLoadingData;
    const allUsers = useMemo(() => {
        if (isEmptyState) return [];
        if (realUsers.length > 0) return realUsers;
        // Se abbiamo dati server ma non utenti locali, costruisci lista da dati server
        // Cerca nome in tutti i campi possibili — MAI mostrare UUID
        return Object.entries(allStudentData).map(([id, data]) => {
            const nome = data.nome || data.name || data.displayName
                || (data.email ? data.email.split('@')[0] : null)
                || `Studente ${id.slice(0, 6)}`;
            return {
                id,
                nome,
                email: data.email || '',
                ruolo: 'user',
                stato: 'attivo',
            };
        });
    }, [realUsers, allStudentData, isEmptyState, isLoadingData]);

    // Fetch dati studenti: Supabase → legacy server → localStorage
    useEffect(() => {
        let cancelled = false;
        async function loadData() {
            setIsLoadingData(true);
            try {
                // G50: Supabase path — dati reali cross-device
                if (isSupabaseConfigured()) {
                    try {
                        const classes = await fetchTeacherClasses();
                        if (!cancelled && classes.length > 0) {
                            const cls = classes[0]; // Use first class
                            const [students, sessions, moods] = await Promise.all([
                                fetchClassStudents(cls.id),
                                fetchClassSessions(cls.id, 30),
                                fetchClassMoods(cls.id),
                            ]);
                            const legacyData = {};
                            const transformed = transformToLegacyFormat(students, sessions, moods);
                            transformed.forEach(s => { legacyData[s.userId] = s; });
                            if (Object.keys(legacyData).length > 0) {
                                setAllStudentData(legacyData);
                                setDataSource('cloud');
                                // Build report from transformed Supabase data
                                setClassReport(_buildReportFromLegacyData(legacyData));
                                setIsLoadingData(false);
                                return;
                            }
                        }
                    } catch (e) {
                        // Supabase failed, continue to legacy
                    }
                }

                // Legacy: server → localStorage
                const serverData = await studentService.fetchStudentsFromServer();
                if (!cancelled && Object.keys(serverData).length > 0) {
                    setAllStudentData(serverData);
                    setDataSource('server');
                    const report = await studentService.getClassReportFromServer();
                    if (!cancelled) setClassReport(report);
                    setIsLoadingData(false);
                    return;
                }
                // Fallback: localStorage (per compatibilità)
                if (!cancelled) {
                    const localData = studentService.getAllStudentsData();
                    if (Object.keys(localData).length > 0) {
                        setAllStudentData(localData);
                        setDataSource('local');
                        const ids = Object.keys(localData);
                        setClassReport(studentService.getClassReport(ids));
                    } else {
                        // Nessun dato — stato vuoto reale (NO dati demo)
                        setAllStudentData({});
                        setClassReport(null);
                        setDataSource('empty');
                    }
                }
            } catch {
                // Fallback: stato vuoto (NO dati demo)
                if (!cancelled) {
                    setAllStudentData({});
                    setClassReport(null);
                    setDataSource('empty');
                }
            } finally {
                if (!cancelled) setIsLoadingData(false);
            }
        }
        loadData();
        return () => { cancelled = true; };
    }, []);

    // Filtro studenti (testo + volume)
    const filteredUsers = useMemo(() => {
        let result = allUsers;
        if (filterSearch) {
            const q = filterSearch.toLowerCase();
            result = result.filter(u =>
                u.nome.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.scuola && u.scuola.toLowerCase().includes(q))
            );
        }
        if (volumeFilter !== 'tutti') {
            const vol = parseInt(volumeFilter);
            result = result.filter(u => {
                const vols = getStudentVolumes(allStudentData[u.id]);
                return vols.has(vol);
            });
        }
        return result;
    }, [allUsers, filterSearch, volumeFilter, allStudentData]);

    if (!user || (!isDocente && !isAdmin)) {
        return (
            <div className={css.centeredPadding}>
                <h2 className={css.headingNavy}>Area riservata ai docenti</h2>
                <p>Accedi con un account docente per monitorare i tuoi studenti.</p>
            </div>
        );
    }

    if (isLoadingData) {
        return (
            <div className={css.centeredPaddingLg}>
                <h2 className={css.headingNavy}>Caricamento dati studenti...</h2>
                <p>Sincronizzazione con il server in corso.</p>
            </div>
        );
    }

    const tabs = [
        { id: 'classe', label: 'Classe', title: 'Progressi e visualizzazione studenti' },
        { id: 'studenti', label: 'Studenti', title: 'Scheda individuale e messaggi' },
        { id: 'report', label: 'Report', title: 'Meteo, statistiche e attività' },
        { id: 'impostazioni', label: 'Impostazioni', title: 'Classi, documentazione e PNRR' },
    ];

    const handleSendNudge = () => {
        if (!nudgeText.trim() || !selectedStudent) return;
        const studentUser = allUsers.find(u => u.id === selectedStudent);
        const nudge = sendNudge(selectedStudent, studentUser?.nome || 'Studente', nudgeText);
        setNudgesSent(prev => [...prev, {
            id: nudge.id,
            studentId: selectedStudent,
            testo: nudgeText,
            timestamp: nudge.timestamp,
        }]);
        setNudgeText('');
        showToast(`Messaggio inviato a ${studentUser?.nome || 'studente'}`, 'success');
    };

    const formatTempo = (secondi) => {
        if (!secondi) return '0s';
        if (secondi < 60) return `${secondi}s`;
        if (secondi < 3600) return `${Math.round(secondi / 60)}min`;
        return `${Math.round(secondi / 3600 * 10) / 10}h`;
    };

    return (
        <div className={css.container}>
            {/* Header */}
            <div className={css.header}>
                <div className={css.headerLeft}>
                    <div>
                        <h1 className={css.headerTitle}>La Serra del Prof. {user.nome?.split(' ')[0]}</h1>
                        <p className={css.headerSubtitle}>
                            {allUsers.length} studenti nel giardino
                            {isEmptyState && <span style={{ color: 'var(--elab-hex-94a3b8)', fontWeight: 600 }}> (in attesa di dati)</span>}
                        </p>
                    </div>
                </div>
            </div>
            {isEmptyState && (
                <div style={{
                    background: 'linear-gradient(90deg, var(--elab-navy)11 0%, var(--elab-lime)11 100%)',
                    border: '1px solid var(--elab-navy)33',
                    borderRadius: 8,
                    padding: '16px 20px',
                    margin: '0 20px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 14,
                    color: 'var(--elab-navy)',
                }}>
                    <span style={{ fontSize: 24 }}>Info</span>
                    <div>
                        <strong>Nessun dato studente disponibile</strong>
                        <p style={{ margin: '4px 0 0', color: 'var(--elab-hex-475569)', fontSize: 14 }}>
                            I dati appariranno automaticamente quando gli studenti useranno il simulatore su questo dispositivo.
                            Ogni esperimento aperto, compilazione e interazione viene tracciata in tempo reale.
                        </p>
                    </div>
                </div>
            )}
            {dataSource === 'cloud' && (
                <div style={{
                    background: 'linear-gradient(90deg, var(--elab-navy)22 0%, var(--elab-lime)11 100%)',
                    border: '1px solid var(--elab-navy)44',
                    borderRadius: 8,
                    padding: '8px 16px',
                    margin: '0 20px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    color: 'var(--elab-navy)',
                }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--elab-navy)', display: 'inline-block', flexShrink: 0 }} />
                    <span><strong>Dati dal cloud</strong> — Sincronizzazione attiva. I dati sono salvati e accessibili da qualsiasi dispositivo.</span>
                </div>
            )}
            {dataSource === 'server' && (
                <div style={{
                    background: 'linear-gradient(90deg, var(--elab-lime)22 0%, var(--elab-lime)11 100%)',
                    border: '1px solid var(--elab-lime)44',
                    borderRadius: 8,
                    padding: '8px 16px',
                    margin: '0 20px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    color: 'var(--elab-hex-2e7d32)',
                }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--elab-lime)', display: 'inline-block', flexShrink: 0 }} />
                    <span><strong>Dati dal server</strong> — Sincronizzazione attiva con il backend EU.{studentService.isEncryptionActive() ? ' Dati locali cifrati.' : ''}</span>
                </div>
            )}
            {dataSource === 'local' && (
                <div style={{
                    background: 'linear-gradient(90deg, #F5A62322 0%, #F5A62311 100%)',
                    border: '1px solid #F5A62344',
                    borderRadius: 8,
                    padding: '8px 16px',
                    margin: '0 20px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    color: 'var(--elab-hex-e65100)',
                }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--elab-hex-f5a623)', display: 'inline-block', flexShrink: 0 }} />
                    <span>
                        <strong>Dati locali</strong> — I progressi sono salvati su questo dispositivo.
                        {!isSupabaseConfigured() && ' Attiva il cloud per sincronizzare i dati tra dispositivi e non perdere i progressi.'}
                    </span>
                </div>
            )}

            {/* Tabs */}
            <div className={css.tabBar} role="tablist" aria-label="Sezioni dashboard docente">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`tabpanel-${tab.id}`}
                        id={`tab-${tab.id}`}
                        tabIndex={activeTab === tab.id ? 0 : -1}
                        title={tab.title}
                        onClick={() => setActiveTab(tab.id)}
                        className={activeTab === tab.id ? css.tabActive : css.tab}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ATOM-002 P1-1: live region che annuncia la tab attiva agli screen reader. */}
            <div role="status" aria-live="polite" className="sr-only">
                {(() => {
                    const t = tabs.find(x => x.id === activeTab);
                    return t ? `Sezione ${t.label} attiva` : '';
                })()}
            </div>

            {/* Content */}
            <div
                className={css.content}
                role="tabpanel"
                id={`tabpanel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
                tabIndex={0}
            >
                {/* ── TAB: Classe (Progressi + Giardino) ── */}
                {activeTab === 'classe' && (
                    <>
                        <div className={css.subTabBar}>
                            {[{ id: 'progressi', label: 'Griglia Progressi' }, { id: 'giardino', label: 'Il Giardino' }].map(v => (
                                <button key={v.id} onClick={() => setClasseView(v.id)} className={classeView === v.id ? css.subTabActive : css.subTab}>{v.label}</button>
                            ))}
                        </div>
                        {classeView === 'progressi' ? (
                            <ProgressiTab
                                users={filteredUsers}
                                allData={allStudentData}
                                onSelectStudent={(id) => { setSelectedStudent(id); setActiveTab('studenti'); }}
                                formatTempo={formatTempo}
                            />
                        ) : (
                            <GiardinoTab
                                users={filteredUsers}
                                allData={allStudentData}
                                onSelectStudent={(id) => { setSelectedStudent(id); setActiveTab('studenti'); }}
                                filterSearch={filterSearch}
                                setFilterSearch={setFilterSearch}
                                volumeFilter={volumeFilter}
                                setVolumeFilter={setVolumeFilter}
                            />
                        )}
                    </>
                )}

                {/* ── TAB: Studenti (Dettaglio + Messaggi) ── */}
                {activeTab === 'studenti' && (
                    <>
                        <StudenteDetailTab
                            users={allUsers}
                            allData={allStudentData}
                            selectedId={selectedStudent}
                            onSelectStudent={setSelectedStudent}
                            formatTempo={formatTempo}
                        />
                        {selectedStudent && (
                            <div className={css.section} style={{ marginTop: 20, background: 'var(--elab-hex-f8fafc)' }}>
                                <h2 className={css.sectionTitle}>Invia messaggio</h2>
                                <NudgeTab
                                    users={allUsers}
                                    selectedStudent={selectedStudent}
                                    setSelectedStudent={setSelectedStudent}
                                    nudgeText={nudgeText}
                                    setNudgeText={setNudgeText}
                                    handleSendNudge={handleSendNudge}
                                    nudgesSent={nudgesSent}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* ── TAB: Report (Meteo + Report + Attivita) ── */}
                {activeTab === 'report' && (
                    <>
                        <div className={css.subTabBar}>
                            {[{ id: 'meteo', label: 'Meteo Classe' }, { id: 'report', label: 'Statistiche' }, { id: 'attivita', label: 'Attivita' }].map(v => (
                                <button key={v.id} onClick={() => setReportSub(v.id)} className={reportSub === v.id ? css.subTabActive : css.subTab}>{v.label}</button>
                            ))}
                        </div>
                        {reportSub === 'meteo' && <MeteoTab allData={allStudentData} classReport={classReport} />}
                        {reportSub === 'report' && (
                            <ReportTab
                                users={filteredUsers}
                                allData={allStudentData}
                                classReport={classReport}
                                formatTempo={formatTempo}
                            />
                        )}
                        {reportSub === 'attivita' && (
                            <AttivitaTab
                                users={filteredUsers}
                                allUsers={allUsers}
                                allData={allStudentData}
                                classReport={classReport}
                                formatTempo={formatTempo}
                                volumeFilter={volumeFilter}
                                setVolumeFilter={setVolumeFilter}
                            />
                        )}
                    </>
                )}

                {/* ── TAB: Impostazioni (Classi + Docs + PNRR + Audit) ── */}
                {activeTab === 'impostazioni' && (
                    <>
                        <div className={css.subTabBar}>
                            {[
                                { id: 'classi', label: 'Le mie classi' },
                                { id: 'documenti', label: 'Documentazione' },
                                { id: 'pnrr', label: 'Progresso PNRR' },
                                ...(user?.ruolo === 'admin' ? [{ id: 'audit', label: 'Audit GDPR' }] : []),
                            ].map(v => (
                                <button key={v.id} onClick={() => setImpostazioniSub(v.id)} className={impostazioniSub === v.id ? css.subTabActive : css.subTab}>{v.label}</button>
                            ))}
                        </div>
                        {impostazioniSub === 'classi' && <ClassiTab />}
                        {impostazioniSub === 'documenti' && (
                            <DocumentiTab
                                users={allUsers}
                                allData={allStudentData}
                                classReport={classReport}
                                formatTempo={formatTempo}
                            />
                        )}
                        {impostazioniSub === 'pnrr' && (
                            <ProgressoPNRRTab
                                users={filteredUsers}
                                allData={allStudentData}
                                formatTempo={formatTempo}
                            />
                        )}
                        {impostazioniSub === 'audit' && <AuditTab />}
                    </>
                )}
            </div>
        </div>
    );
}

// ─── IL GIARDINO ───────────────────────────────────────
// ─── PAGINATION ──────────────────────────────────────────
const STUDENTS_PER_PAGE = 10;

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                aria-label="Pagina precedente"
                style={{
                    ...styles.primaryBtn,
                    padding: '8px 16px', fontSize: 14, minHeight: 44,
                    opacity: currentPage === 0 ? 0.4 : 1,
                    cursor: currentPage === 0 ? 'default' : 'pointer',
                }}
            >
                ← Prec
            </button>
            <span aria-live="polite" aria-atomic="true" style={{ fontSize: 14, color: C.textMuted, fontWeight: 600 }}>
                {currentPage + 1} / {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                aria-label="Pagina successiva"
                style={{
                    ...styles.primaryBtn,
                    padding: '8px 16px', fontSize: 14, minHeight: 44,
                    opacity: currentPage >= totalPages - 1 ? 0.4 : 1,
                    cursor: currentPage >= totalPages - 1 ? 'default' : 'pointer',
                }}
            >
                Succ →
            </button>
        </div>
    );
}

function usePagination(items, perPage = STUDENTS_PER_PAGE) {
    const [page, setPage] = useState(0);
    const totalPages = Math.max(1, Math.ceil(items.length / perPage));
    // Clamp page without setState during render (avoids infinite loop)
    const safePage = Math.min(page, totalPages - 1);
    useEffect(() => {
        if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1));
    }, [page, totalPages]);
    const paged = items.slice(safePage * perPage, (safePage + 1) * perPage);
    return { paged, page: safePage, setPage, totalPages, total: items.length };
}

function GiardinoTab({ users, allData, onSelectStudent, filterSearch, setFilterSearch, volumeFilter, setVolumeFilter }) {
    const { paged, page, setPage, totalPages, total } = usePagination(users);

    return (
        <div>
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Il Giardino — Ogni studente è una pianta</h2>
                <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 16 }}>
                    La dimensione riflette l'impegno. La forma riflette il tipo di esplorazione.
                    Nessuna pianta è migliore di un'altra — un pino alto e una quercia ampia sono ugualmente sani.
                </p>

                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        value={filterSearch}
                        onChange={e => setFilterSearch(e.target.value)}
                        placeholder="Cerca studente per nome, email o scuola..."
                        style={{ ...styles.searchInput, marginBottom: 0, flex: 1, minWidth: 200 }}
                    />
                    <select
                        value={volumeFilter}
                        onChange={e => setVolumeFilter(e.target.value)}
                        style={{ ...styles.select, width: 'auto', minWidth: 140 }}
                    >
                        <option value="tutti">Tutti i volumi</option>
                        <option value="1">Volume 1</option>
                        <option value="2">Volume 2</option>
                        <option value="3">Volume 3</option>
                    </select>
                </div>

                {total > STUDENTS_PER_PAGE && (
                    <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 8 }}>
                        Pagina {page + 1} di {totalPages} ({total} studenti)
                    </p>
                )}

                {/* Giardino visuale */}
                <div style={styles.gardenGrid}>
                    {paged.map(u => {
                        const sd = allData[u.id];
                        const plant = getPlantStyle(sd);
                        const ultimoMood = sd?.moods?.[sd.moods.length - 1];

                        return (
                            <div
                                key={u.id}
                                onClick={() => onSelectStudent(u.id)}
                                style={styles.gardenPlant}
                                title={`${u.nome} — ${plant.label}`}
                            >
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: getAvatarColor(u.nome),
                                    color: 'white', fontSize: 14, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'Oswald, sans-serif',
                                    marginBottom: 2,
                                }}>
                                    {getInitials(u.nome)}
                                </div>
                                <span style={{ fontSize: plant.size }}>{PLANT_ICONS[plant.emoji] ? PLANT_ICONS[plant.emoji](plant.size) : plant.emoji}</span>
                                <div style={styles.plantName}>{u.nome?.split(' ')[0]}</div>
                                {ultimoMood && (
                                    <span style={styles.plantMood}>
                                        {MOOD_EMOJI[ultimoMood.mood] || ''}
                                    </span>
                                )}
                                <div style={styles.plantStats}>
                                    <span>{sd?.stats?.esperimentiTotali || 0} esp</span>
                                    <span>{sd ? Math.round((sd.tempoTotale || 0) / 60) + 'm' : '0m'}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

                {users.length === 0 && (
                    <p style={{ textAlign: 'center', color: C.textMuted, padding: 30 }}>
                        Nessuno studente trovato.
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── METEO CLASSE ──────────────────────────────────────
function MeteoTab({ allData, classReport }) {
    // Raccolta tutti i concetti con confusione
    const concettiConConfusione = useMemo(() => {
        if (!classReport?.concettiConfusione) return [];
        return Object.entries(classReport.concettiConfusione)
            .map(([id, data]) => ({
                id,
                media: Math.round(data.totale / data.conteggio * 10) / 10,
                conteggio: data.conteggio,
                weather: data.totale / data.conteggio > 7 ? 'T' :
                         data.totale / data.conteggio > 5 ? 'P' :
                         data.totale / data.conteggio > 3 ? 'N' : 'PN',
            }))
            .sort((a, b) => b.media - a.media);
    }, [classReport]);

    // Mood aggregato
    const moodSummary = classReport?.moodCount || {};

    return (
        <div>
            {/* Meteo generale */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Il Meteo della Classe</h2>
                <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 16 }}>
                    La "nebbia" indica zone di confusione diffusa. Non è un problema — è un segnale
                    per decidere se intervenire o lasciar fare.
                </p>

                {/* Mood distribution */}
                {Object.keys(moodSummary).length > 0 && (
                    <div style={styles.weatherRow}>
                        <strong style={{ color: C.navy, marginRight: 12 }}>Mood attuale della classe:</strong>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {Object.entries(moodSummary).sort((a, b) => b[1] - a[1]).map(([mood, count]) => (
                                <span key={mood} style={{
                                    ...styles.weatherChip,
                                    borderColor: MOOD_COLORS[mood] || C.border,
                                }}>
                                    {MOOD_EMOJI[mood] || '?'} {mood} ({count})
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Zone di confusione */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Zone di Nebbia (Concetti con Alta Confusione)</h2>
                {concettiConConfusione.length === 0 ? (
                    <p style={{ color: C.textMuted, textAlign: 'center', padding: 20 }}>
                        {Object.keys(allData).length === 0
                            ? 'Nessun dato studente disponibile. I dati appariranno quando gli studenti useranno il tutor.'
                            : 'Cielo sereno! Nessuna zona di confusione significativa rilevata.'}
                    </p>
                ) : (
                    concettiConConfusione.map(c => (
                        <div key={c.id} style={styles.fogRow}>
                            <span style={{ fontSize: 24 }}>{WEATHER_ICONS[c.weather] ? WEATHER_ICONS[c.weather](24) : c.weather}</span>
                            <div style={{ flex: 1 }}>
                                <strong>{c.id}</strong>
                                <div style={{ fontSize: 14, color: C.textMuted }}>
                                    {c.conteggio} segnalazioni, media {c.media}/10
                                </div>
                            </div>
                            <div style={{
                                ...styles.confusionBar,
                                width: `${Math.min(c.media * 10, 100)}%`,
                                background: c.media > 7 ? C.red :
                                            c.media > 5 ? C.orange :
                                            c.media > 3 ? 'var(--elab-hex-f5d623)' : C.lime,
                            }} />
                        </div>
                    ))
                )}
            </div>

            {/* Studenti inattivi */}
            {classReport?.inattivi?.length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Studenti Inattivi (7+ giorni)</h2>
                    <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 12 }}>
                        Non un allarme — solo un'informazione. Puoi scegliere di inviare un messaggio.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {classReport.inattivi.map(id => {
                            const u = usersLookup.getUser(id);
                            return u ? (
                                <span key={id} style={styles.inactiveBadge}>
                                    {u.nome}
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── ATTIVITÀ ──────────────────────────────────────────
function AttivitaTab({ users, allUsers, allData, classReport, formatTempo, volumeFilter, setVolumeFilter }) {
    const sortedActivity = useMemo(() => {
        return (classReport?.attivitaRecente || [])
            .filter(att => users.some(u => u.id === att.userId))
            .sort((a, b) => b.tempoSettimana - a.tempoSettimana);
    }, [classReport, users]);
    const { paged: pagedActivity, page, setPage, totalPages } = usePagination(sortedActivity);

    return (
        <div>
            {/* Header con filtro e export */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                <select
                    value={volumeFilter}
                    onChange={e => setVolumeFilter(e.target.value)}
                    style={{ ...styles.select, width: 'auto', minWidth: 140 }}
                >
                    <option value="tutti">Tutti i volumi</option>
                    <option value="1">Volume 1</option>
                    <option value="2">Volume 2</option>
                    <option value="3">Volume 3</option>
                </select>
                <button
                    onClick={() => exportStudentsCSV(users, allData, classReport, formatTempo)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 8,
                        background: C.navy, color: C.white,
                        border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, minHeight: 44,
                        transition: 'opacity 150ms',
                    }}
                >
                    Esporta CSV
                </button>
            </div>

            {/* Stats aggregate */}
            <div style={styles.statGrid}>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: C.navy }}>{classReport?.totaleStudenti || 0}</div>
                    <div style={styles.statLabel}>Studenti</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: C.lime }}>{classReport?.mediaEsperimenti || 0}</div>
                    <div style={styles.statLabel}>Media esperimenti</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: C.cyan }}>{formatTempo(classReport?.tempoMedioTotale || 0)}</div>
                    <div style={styles.statLabel}>Tempo medio</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: C.orange }}>{classReport?.inattivi?.length || 0}</div>
                    <div style={styles.statLabel}>Inattivi (7gg)</div>
                </div>
            </div>

            {/* Classifica attività settimanale */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Attività Settimanale</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <caption className="sr-only">
                            Attività settimanale della classe: studente, sessioni svolte, tempo totale, esperimenti completati e stato di attività
                        </caption>
                        <thead>
                            <tr>
                                <th scope="col" style={styles.th}>Studente</th>
                                <th scope="col" style={styles.th}>Sessioni</th>
                                <th scope="col" style={styles.th}>Tempo</th>
                                <th scope="col" style={styles.th}>Esperimenti</th>
                                <th scope="col" style={styles.th}>Stato</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedActivity.map((att, i) => {
                                const u = users.find(u => u.id === att.userId);
                                const isInattivo = classReport?.inattivi?.includes(att.userId) ?? false;
                                return (
                                    <tr key={att.userId} style={i % 2 === 0 ? styles.trEven : {}}>
                                        <td style={styles.td}>{u?.nome || u?.email?.split('@')[0] || `Studente ${att.userId.slice(0, 6)}`}</td>
                                        <td style={styles.td}>{att.sessioni}</td>
                                        <td style={styles.td}>{formatTempo(att.tempoSettimana)}</td>
                                        <td style={styles.td}>{att.esperimentiSettimana}</td>
                                        <td style={styles.td}>
                                            {isInattivo ? (
                                                <span style={{ color: C.orange }}>Inattivo</span>
                                            ) : att.sessioni > 3 ? (
                                                <span style={{ color: C.lime }}>Attivo</span>
                                            ) : (
                                                <span style={{ color: C.textMuted }}>Leggero</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {/* Esperimenti più popolari */}
            {classReport?.esperimentiCount && Object.keys(classReport.esperimentiCount).length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Esperimenti Più Popolari</h2>
                    {Object.entries(classReport.esperimentiCount)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([id, count]) => (
                            <div key={id} style={styles.popularRow}>
                                <span style={{ flex: 1, fontWeight: 500 }}>{id}</span>
                                <div style={styles.popularBar}>
                                    <div style={{
                                        height: '100%',
                                        background: `linear-gradient(90deg, ${C.lime}, ${C.limeDark})`,
                                        borderRadius: 4,
                                        width: `${Math.min(count / (classReport.totaleStudenti || 1) * 100, 100)}%`,
                                    }} />
                                </div>
                                <span style={{ color: C.textMuted, fontSize: 14, minWidth: 30, textAlign: 'right' }}>
                                    {count}
                                </span>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

// ─── DETTAGLIO STUDENTE ────────────────────────────────
function StudenteDetailTab({ users, allData, selectedId, onSelectStudent, formatTempo }) {
    const studentData = selectedId ? allData[selectedId] : null;
    const studentUser = selectedId ? users.find(u => u.id === selectedId) : null;

    return (
        <div>
            {/* Selettore studente */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Seleziona Studente</h2>
                <select
                    value={selectedId || ''}
                    onChange={e => onSelectStudent(e.target.value || null)}
                    style={styles.select}
                >
                    <option value="">-- Scegli uno studente --</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>
                    ))}
                </select>
            </div>

            {selectedId && studentUser && (
                <>
                    {/* Info studente */}
                    <div style={styles.studentHeader}>
                        <div style={styles.studentAvatar}>
                            {studentUser.avatar ? (
                                <img src={studentUser.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                                <span style={{ fontSize: 24 }}>{studentUser.nome?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, color: C.white, fontSize: 20 }}>{studentUser.nome}</h2>
                            <p style={{ margin: '4px 0 0', color: C.limeLight, fontSize: 14 }}>
                                {studentUser.scuola || 'Scuola non specificata'} • Registrato {new Date(studentUser.dataRegistrazione).toLocaleDateString('it-IT')}
                            </p>
                        </div>
                        <span style={{ fontSize: 40, marginLeft: 'auto' }}>
                            {(() => { const ps = getPlantStyle(studentData); return PLANT_ICONS[ps.emoji] ? PLANT_ICONS[ps.emoji](40) : ps.emoji; })()}
                        </span>
                    </div>

                    {studentData ? (
                        <>
                            {/* Stats - enhanced G28 */}
                            <div style={styles.statGrid}>
                                <div style={styles.statCard}>
                                    <div style={{ ...styles.statValue, color: C.lime }}>{studentData.stats?.esperimentiTotali || 0}</div>
                                    <div style={styles.statLabel}>Esperimenti</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{ ...styles.statValue, color: C.cyan }}>{formatTempo(studentData.tempoTotale || 0)}</div>
                                    <div style={styles.statLabel}>Tempo totale</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{ ...styles.statValue, color: C.navy }}>{studentData.sessioni?.filter(s => s.fine).length || 0}</div>
                                    <div style={styles.statLabel}>Sessioni</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{ ...styles.statValue, color: C.orange }}>{studentData.concetti?.length || 0}</div>
                                    <div style={styles.statLabel}>Concetti</div>
                                </div>
                            </div>

                            {/* Session detail panel - G28 */}
                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>Riepilogo Attività</h2>
                                <div className={css.activityGrid}>
                                    <div className={css.activityCardNavy}>
                                        <div className={css.activityCardLabel}>Ultimo accesso</div>
                                        <div className={css.activityCardValue} style={{ color: C.navy }}>
                                            {studentData.ultimoSalvataggio
                                                ? new Date(studentData.ultimoSalvataggio).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                : 'Mai'
                                            }
                                        </div>
                                    </div>
                                    <div className={css.activityCardLime}>
                                        <div className={css.activityCardLabel}>Giorni consecutivi</div>
                                        <div className={css.activityCardValue} style={{ color: C.lime }}>
                                            {studentData.stats?.giorniConsecutivi || 0} giorni
                                        </div>
                                    </div>
                                    <div className={css.activityCardOrange}>
                                        <div className={css.activityCardLabel}>Errori compilazione</div>
                                        <div className={css.activityCardValue} style={{ color: C.orange }}>
                                            {(() => {
                                                let errors = 0;
                                                (studentData.sessioni || []).forEach(s => {
                                                    (s.attivita || []).forEach(a => {
                                                        if (a.tipo === 'compilazione' && a.dettaglio?.startsWith('Errore:')) errors++;
                                                    });
                                                });
                                                return errors;
                                            })()}
                                        </div>
                                    </div>
                                    <div className={css.activityCardCyan}>
                                        <div className={css.activityCardLabel}>Punteggi giochi</div>
                                        <div className={css.activityCardValue} style={{ color: C.cyan }}>
                                            {(() => {
                                                const gameResults = [];
                                                (studentData.sessioni || []).forEach(s => {
                                                    (s.attivita || []).forEach(a => {
                                                        if (a.tipo === 'gioco' && a.dettaglio) {
                                                            const m = a.dettaglio.match(/(\d+)\/(\d+)/);
                                                            if (m) gameResults.push(parseInt(m[1]) / parseInt(m[2]));
                                                        }
                                                    });
                                                });
                                                if (gameResults.length === 0) return '—';
                                                return Math.round(gameResults.reduce((s, v) => s + v, 0) / gameResults.length * 100) + '%';
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ultimo mood */}
                            {studentData.moods?.length > 0 && (
                                <div style={styles.section}>
                                    <h2 style={styles.sectionTitle}>Mood recenti</h2>
                                    <div className={css.moodChips}>
                                        {studentData.moods.slice(-10).map((m, i) => (
                                            <span key={i} style={{
                                                ...styles.weatherChip,
                                                borderColor: MOOD_COLORS[m.mood] || C.border,
                                            }}>
                                                {MOOD_EMOJI[m.mood]} {m.mood}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Meraviglie dello studente */}
                            {studentData.meraviglie?.length > 0 && (
                                <div style={styles.section}>
                                    <h2 style={styles.sectionTitle}>Le sue meraviglie</h2>
                                    {studentData.meraviglie.slice(-10).reverse().map(m => (
                                        <div key={m.id} className={css.detailRow}>
                                            <span style={{ color: m.risolta ? C.lime : C.orange, marginRight: 8 }}>
                                                {m.risolta ? <IconCheck color={C.lime} /> : <IconQuestion color={C.orange} />}
                                            </span>
                                            {m.domanda}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Diario (lettura silenziosa) */}
                            {studentData.diario?.length > 0 && (
                                <div style={styles.section}>
                                    <h2 style={styles.sectionTitle}>Dal suo diario (osservazione silenziosa)</h2>
                                    <p className={css.diaryNote}>
                                        Leggere senza commentare, a meno che non sia invitato. — Montessori
                                    </p>
                                    {studentData.diario.slice(-5).reverse().map(e => (
                                        <div key={e.id} className={css.diaryEntry}>
                                            <span className={css.diaryDate}>
                                                {new Date(e.timestamp).toLocaleDateString('it-IT', {
                                                    day: 'numeric', month: 'long'
                                                })}
                                            </span>
                                            <p className={css.diaryContent}>{e.contenuto}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Difficoltà */}
                            {studentData.difficolta?.length > 0 && (
                                <div style={styles.section}>
                                    <h2 style={styles.sectionTitle}>Difficoltà segnalate</h2>
                                    {studentData.difficolta.slice(-5).reverse().map(d => (
                                        <div key={d.id} className={css.detailRow}>
                                            <span style={{ color: d.risolta ? C.lime : C.red, marginRight: 8 }}>
                                                {d.risolta ? <IconCheck color={C.lime} /> : <IconAlert color={C.red} />}
                                            </span>
                                            {d.descrizione}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={styles.section} className={css.studentEmptyState}>
                            <p className={css.textMuted}>Questo studente non ha ancora iniziato ad usare il tutor.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ─── NUDGE ─────────────────────────────────────────────
function NudgeTab({ users, selectedStudent, setSelectedStudent, nudgeText, setNudgeText, handleSendNudge, nudgesSent }) {
    return (
        <div>
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Invia un messaggio</h2>
                <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 16 }}>
                    Un messaggio è un suggerimento gentile, come un bigliettino piegato.
                    Lo studente può accettarlo o ignorarlo. Non è un compito — è un invito.
                </p>

                <select
                    value={selectedStudent || ''}
                    onChange={e => setSelectedStudent(e.target.value || null)}
                    aria-label="Seleziona studente per messaggio"
                    style={{ ...styles.select, marginBottom: 12 }}
                >
                    <option value="">-- Scegli uno studente --</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                </select>

                <textarea
                    value={nudgeText}
                    onChange={e => setNudgeText(e.target.value)}
                    aria-label="Messaggio per lo studente"
                    placeholder="Hai provato a collegare il tuo buzzer a un sensore di luce? Potrebbe piacerti quello che succede..."
                    style={styles.textarea}
                    rows={3}
                />

                <button
                    onClick={handleSendNudge}
                    disabled={!nudgeText.trim() || !selectedStudent}
                    style={{
                        ...styles.primaryBtn,
                        opacity: (nudgeText.trim() && selectedStudent) ? 1 : 0.5,
                    }}
                >
                    Invia messaggio
                </button>
            </div>

            {/* Nudge inviati */}
            {nudgesSent.length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Messaggi inviati ({nudgesSent.length})</h2>
                    {[...nudgesSent].reverse().map(n => {
                        const u = users.find(u => u.id === n.studentId);
                        return (
                            <div key={n.id} style={styles.nudgeItem}>
                                <IconNudge size={18} />
                                <div style={{ flex: 1 }}>
                                    <strong style={{ color: C.navy }}>{u?.nome || 'Studente'}</strong>
                                    <p style={{ margin: '4px 0 0', fontSize: 14, fontStyle: 'italic' }}>"{n.testo}"</p>
                                    <span style={{ fontSize: 14, color: C.textMuted }}>
                                        {new Date(n.timestamp).toLocaleDateString('it-IT', {
                                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Nudge suggeriti */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Idee per messaggi</h2>
                {[
                    'Hai provato a collegare il tuo buzzer a un sensore di luce? Potrebbe piacerti quello che succede.',
                    'Sai che puoi far lampeggiare un LED senza usare delay()? Prova con millis()!',
                    'C\'è un componente misterioso nel tuo workspace. Riesci a scoprire cosa fa?',
                    'Il tuo circuito potrebbe diventare ancora più interessante con un sensore di temperatura.',
                    'Hai mai provato a far "cantare" il tuo circuito? Prova con un buzzer e tone()!',
                ].map((idea, i) => (
                    <button
                        type="button"
                        key={i}
                        onClick={() => setNudgeText(idea)}
                        style={styles.nudgeSuggestion}
                    >
                        {idea}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── DOCUMENTAZIONE ────────────────────────────────────
function DocumentiTab({ users, allData, classReport, formatTempo }) {
    return (
        <div>
            {/* Guida rapida — le cose che servono SUBITO */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Guida Rapida per il Docente</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                    {[
                        { q: 'Come inizio una lezione?', a: 'Apri il simulatore, scegli un esperimento dal menu. Lo studente vede tutto sulla LIM.' },
                        { q: 'Come invio un messaggio a uno studente?', a: 'Vai alla tab "Studenti", seleziona lo studente e scrivi un messaggio nella sezione in basso.' },
                        { q: 'Come vedo i progressi della classe?', a: 'La tab "Classe" mostra una griglia con tutti gli esperimenti completati per studente.' },
                        { q: 'Come uso UNLIM (il tutor AI)?', a: 'Clicca la mascotte robot in basso a destra. Lo studente puo fare domande a voce o scrivere.' },
                        { q: 'Come creo una classe?', a: 'Vai alla tab "Le mie classi", inserisci il nome e clicca "Crea". Poi aggiungi gli studenti.' },
                        { q: 'Che differenza c\'e tra i 3 volumi?', a: 'Vol.1: circuiti base (LED, resistori). Vol.2: sensori e attuatori. Vol.3: Arduino e programmazione.' },
                    ].map((faq, i) => (
                        <div key={i} style={{ padding: 14, borderRadius: 10, background: 'var(--color-bg, #fff)', border: '1px solid var(--color-border, #E5E5EA)' }}>
                            <p style={{ fontWeight: 700, fontSize: 14, color: C.navy, margin: '0 0 6px' }}>{faq.q}</p>
                            <p style={{ fontSize: 14, color: C.text, margin: 0, lineHeight: 1.5 }}>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Pannelli di Documentazione</h2>
                <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 16 }}>
                    Ispirati a Reggio Emilia: narrazioni del percorso, non valutazioni.
                    Documenti visuali condivisibili con la classe e le famiglie.
                </p>

                {/* Report riassuntivo */}
                <div style={styles.docPanel}>
                    <h4 style={{ margin: '0 0 12px', color: C.navy }}>Report Settimanale della Classe</h4>
                    <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                        <p>La classe ha <strong>{classReport?.totaleStudenti || 0}</strong> studenti attivi.</p>
                        <p>In media hanno completato <strong>{classReport?.mediaEsperimenti || 0}</strong> esperimenti ciascuno.</p>
                        <p>Il tempo medio di utilizzo è <strong>{formatTempo(classReport?.tempoMedioTotale || 0)}</strong>.</p>
                        {classReport?.inattivi?.length > 0 && (
                            <p>Ci sono <strong style={{ color: C.orange }}>{classReport.inattivi.length}</strong> studenti inattivi da più di 7 giorni.</p>
                        )}
                        {classReport?.moodCount && Object.keys(classReport.moodCount).length > 0 && (
                            <p>Il mood prevalente della classe è: <strong style={{ color: C.lime }}>
                                {Object.entries(classReport.moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'}
                            </strong></p>
                        )}
                    </div>
                </div>

                {/* Dashboard dell'Assenza */}
                <div style={styles.docPanel}>
                    <h4 style={{ margin: '0 0 12px', color: C.navy }}>Dashboard dell'Assenza</h4>
                    <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 12 }}>
                        Non cosa fanno, ma cosa NON sta succedendo.
                    </p>
                    <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
                        {classReport?.inattivi?.length > 0 && (
                            <li><strong>{classReport.inattivi.length}</strong> studenti non si connettono da 7+ giorni</li>
                        )}
                        {classReport?.esperimentiCount && Object.keys(classReport.esperimentiCount).length < 5 && (
                            <li>Solo <strong>{Object.keys(classReport.esperimentiCount).length}</strong> esperimenti diversi sono stati provati</li>
                        )}
                        <li style={{ color: C.textMuted, fontStyle: 'italic' }}>
                            Questo è un segnale, non un giudizio. Decidi tu se agire o osservare.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Nessun voto — Filosofia */}
            <div style={{ ...styles.section, background: C.limeSoft, border: `2px solid ${C.lime}` }}>
                <h2 style={{ ...styles.sectionTitle, color: C.limeDark }}>Filosofia della Serra</h2>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text }}>
                    Questa dashboard non genera pagelle. Non classifica i ragazzi. Non calcola medie.
                    Mostra percorsi individuali, pattern di gruppo, e la salute dell'ecosistema.
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text, fontStyle: 'italic' }}>
                    "Il giardiniere crea un ecosistema ricco e diversificato dove molti tipi di piante
                    possono fiorire. Non cerca di scolpire ogni pianta in una forma predeterminata."
                    — Alison Gopnik
                </p>
            </div>
        </div>
    );
}

// ─── LE MIE CLASSI (Sprint 1 Session 30) ──────────────
function ClassiTab() {
    const { confirm: confirmModal, ConfirmDialog } = useConfirmModal();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newClassName, setNewClassName] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchClasses = useCallback(async () => {
        setLoading(true);
        const result = await listClasses();
        if (result.success) {
            setClasses(result.classes || []);
        } else {
            setError(result.error || 'Errore nel caricamento delle classi.');
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchClasses(); }, [fetchClasses]);

    const handleCreate = async () => {
        if (!newClassName.trim()) return;
        setCreating(true);
        setError('');
        setSuccess('');
        const result = await createClass(newClassName.trim());
        if (result.success) {
            setSuccess(`Classe "${result.className}" creata! Codice: ${result.classCode}`);
            setNewClassName('');
            fetchClasses();
        } else {
            setError(result.error || 'Errore nella creazione.');
        }
        setCreating(false);
    };

    const handleRemoveStudent = async (classId, studentId, studentName) => {
        if (!await confirmModal(`Rimuovere ${studentName || 'lo studente'} dalla classe?`)) return;
        const result = await removeStudent(classId, studentId);
        if (result.success) {
            setSuccess('Studente rimosso.');
            fetchClasses();
        } else {
            setError(result.error || 'Errore nella rimozione.');
        }
    };

    return (
        <div>
            {/* Crea nuova classe */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Crea una nuova classe</h2>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                        type="text"
                        value={newClassName}
                        onChange={e => setNewClassName(e.target.value)}
                        placeholder="Nome della classe (es. 3A Informatica)"
                        style={{ ...styles.searchInput, marginBottom: 0, flex: 1 }}
                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    />
                    <button
                        onClick={handleCreate}
                        disabled={creating || !newClassName.trim()}
                        style={{
                            ...styles.primaryBtn,
                            marginTop: 0,
                            opacity: creating || !newClassName.trim() ? 0.5 : 1,
                        }}
                    >
                        {creating ? '...' : '+ Crea'}
                    </button>
                </div>
                {error && (
                    <p style={{ color: C.red, fontSize: 14, marginTop: 8, marginBottom: 0 }}>{error}</p>
                )}
                {success && (
                    <p style={{ color: C.lime, fontSize: 14, marginTop: 8, marginBottom: 0, fontWeight: 600 }}>{success}</p>
                )}
            </div>

            {/* Elenco classi */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Le tue classi</h2>
                {loading ? (
                    <p style={{ color: C.textMuted, fontSize: 14 }}>Caricamento...</p>
                ) : classes.length === 0 ? (
                    <div style={{
                        padding: '24px 20px',
                        background: 'linear-gradient(135deg, var(--elab-hex-f0f7ff) 0%, var(--elab-hex-e8f4d9) 100%)',
                        borderRadius: 16,
                        border: `2px dashed ${C.lime}`,
                    }}>
                        <h2 style={{
                            color: C.navy, fontSize: 20, fontWeight: 700, margin: '0 0 8px',
                            fontFamily: 'Oswald, sans-serif',
                        }}>
                            Benvenuto nella tua Area Docente!
                        </h2>
                        <p style={{ color: C.textMuted, fontSize: 15, margin: '0 0 20px', lineHeight: 1.6 }}>
                            Configura la tua classe in 3 semplici passi. Non serve nessuna esperienza tecnica!
                        </p>
                        {[
                            { step: '1', emoji: '\u270F\uFE0F', title: 'Crea la tua classe', text: 'Scrivi il nome della classe nel campo qui sopra e premi "Crea"' },
                            { step: '2', emoji: '\uD83D\uDCE2', title: 'Condividi il codice', text: 'Verrà generato un codice. Dettalo ai tuoi studenti, loro lo inseriranno al momento della registrazione' },
                            { step: '3', emoji: '\uD83C\uDFAE', title: 'Attiva i giochi', text: 'Scegli quali giochi rendere disponibili per la classe. Puoi cambiarli in qualsiasi momento' },
                        ].map(s => (
                            <div key={s.step} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 14,
                                padding: '14px 16px', marginBottom: 10,
                                background: 'white', borderRadius: 12,
                                borderLeft: `4px solid ${C.lime}`,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            }}>
                                <span style={{
                                    fontSize: 28, lineHeight: '1',
                                    minWidth: 36, textAlign: 'center',
                                }}>{s.emoji}</span>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 2 }}>
                                        Passo {s.step}: {s.title}
                                    </div>
                                    <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.5 }}>
                                        {s.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {classes.map(cls => (
                            <ClassCard
                                key={cls.id}
                                cls={cls}
                                onRemoveStudent={handleRemoveStudent}
                                onUpdateGames={async (classId, games) => {
                                    const result = await updateClassGames(classId, games);
                                    if (result.success) fetchClasses();
                                    return result;
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
            <ConfirmDialog />
        </div>
    );
}

const ALL_GAMES = [
    { key: 'CircuitDetective', label: 'Circuit Detective', icon: <IconDetective /> },
    { key: 'PredictObserveExplain', label: 'Predict-Observe-Explain', icon: <IconPredict /> },
    { key: 'ReverseEngineering', label: 'Reverse Engineering', icon: <IconReverse /> },
    { key: 'CircuitReview', label: 'Circuit Review', icon: <IconReview /> },
];

function ClassCard({ cls, onRemoveStudent, onUpdateGames }) {
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);

    const activeSet = new Set(cls.gamesActive || []);

    const handleToggleGame = async (gameKey) => {
        if (saving || !onUpdateGames) return;
        const newGames = activeSet.has(gameKey)
            ? [...activeSet].filter(g => g !== gameKey)
            : [...activeSet, gameKey];
        setSaving(true);
        await onUpdateGames(cls.id, newGames);
        setSaving(false);
    };

    return (
        <div style={{
            background: C.white,
            border: `1px solid ${cls.active ? C.lime : C.border}`,
            borderRadius: 12,
            padding: 16,
            borderLeft: `4px solid ${cls.active ? C.lime : C.textMuted}`,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: 16, color: C.navy, fontFamily: 'Oswald, sans-serif' }}>
                        {cls.name}
                    </h4>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                        <span
                            style={{ fontSize: 14, color: C.textMuted, cursor: 'pointer' }}
                            title="Clicca per copiare il codice classe"
                            onClick={() => {
                                navigator.clipboard?.writeText(cls.classCode);
                            }}
                        >
                            Codice: <strong style={{ color: C.navy, fontFamily: 'monospace', letterSpacing: 1 }}>{cls.classCode}</strong> <span style={{ fontSize: 14, color: C.textMuted }}>(Copia)</span>
                        </span>
                        <span style={{ fontSize: 14, color: C.textMuted }}>
                            {cls.studentCount} {cls.studentCount === 1 ? 'studente' : 'studenti'}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {cls.volumes?.map(v => (
                        <span key={v} style={{
                            fontSize: 14, padding: '2px 8px', borderRadius: 6,
                            background: v === 'Volume 1' ? 'var(--elab-lime)22' : v === 'Volume 2' ? 'var(--elab-orange)22' : 'var(--elab-red)22',
                            color: v === 'Volume 1' ? 'var(--elab-lime)' : v === 'Volume 2' ? '#996600' : '#C62828',
                            fontWeight: 600,
                        }}>
                            {v}
                        </span>
                    ))}
                    <span style={{
                        fontSize: 14, padding: '2px 8px', borderRadius: 6,
                        background: cls.active ? 'var(--elab-lime)22' : '#E5393522',
                        color: cls.active ? 'var(--elab-lime)' : '#E53935',
                        fontWeight: 600,
                    }}>
                        {cls.active ? 'Attiva' : 'Disattivata'}
                    </span>
                </div>
            </div>

            {/* Sprint 3: Game toggles */}
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--elab-hex-f8fafc)', borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 8 }}
                    title="Attiva o disattiva i giochi che i tuoi studenti possono vedere nella sidebar"
                >
                    Giochi attivi per la classe
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ALL_GAMES.map(game => {
                        const isActive = activeSet.has(game.key);
                        return (
                            <label key={game.key} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                cursor: saving ? 'wait' : 'pointer',
                                opacity: saving ? 0.6 : 1,
                                fontSize: 14,
                            }}>
                                <div
                                    onClick={() => handleToggleGame(game.key)}
                                    style={{
                                        width: 36, height: 20, borderRadius: 10,
                                        background: isActive ? C.lime : 'var(--elab-hex-cbd5e1)',
                                        position: 'relative',
                                        transition: 'background 0.2s',
                                        flexShrink: 0,
                                    }}
                                >
                                    <div style={{
                                        width: 16, height: 16, borderRadius: '50%',
                                        background: C.white,
                                        position: 'absolute', top: 2,
                                        left: isActive ? 18 : 2,
                                        transition: 'left 0.2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                    }} />
                                </div>
                                <span style={{ color: isActive ? C.navy : C.textMuted }}>
                                    {game.icon} {game.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {cls.studentCount > 0 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        background: 'none', border: 'none', color: C.navy,
                        cursor: 'pointer', fontSize: 14, padding: '8px 0 0', fontWeight: 500,
                    }}
                >
                    {expanded ? 'Nascondi studenti' : 'Mostra studenti'}
                </button>
            )}

            {expanded && (
                <div style={{ marginTop: 8, fontSize: 14, color: C.textMuted }}>
                    <p>La lista studenti è disponibile nelle altre tab della dashboard (Giardino, Attività, ecc.).</p>
                    <p style={{ fontSize: 14 }}>
                        Per rimuovere uno studente, usa la funzione dedicata quando il backend sarà collegato
                        alla lista studenti della classe.
                    </p>
                </div>
            )}
        </div>
    );
}

// ─── PROGRESSO PNRR ──────────────────────────────────
// Catalogo curriculum dai 62 lesson paths
const CURRICULUM = Object.entries(LESSON_PATHS).map(([id, lp]) => ({
    id,
    title: lp.title || id,
    volume: lp.volume || (id.startsWith('v1') ? 1 : id.startsWith('v2') ? 2 : 3),
    chapter: lp.chapter || 0,
    chapterTitle: lp.chapter_title || '',
})).sort((a, b) => a.volume - b.volume || a.chapter - b.chapter || a.id.localeCompare(b.id));

const CURRICULUM_BY_VOL = {
    1: CURRICULUM.filter(e => e.volume === 1),
    2: CURRICULUM.filter(e => e.volume === 2),
    3: CURRICULUM.filter(e => e.volume === 3),
};
const VOL_LABELS = { 1: 'Volume 1 — Cominciamo', 2: 'Volume 2 — Approfondiamo', 3: 'Volume 3 — Arduino' };
const VOL_COLORS = { 1: 'var(--elab-lime)', 2: 'var(--elab-orange)', 3: 'var(--elab-red)' };

function getStudentCompletedSet(studentData) {
    if (!studentData?.esperimenti) return new Set();
    return new Set(studentData.esperimenti.filter(e => e.completato).map(e => e.experimentId));
}

function getProgressStats(studentData, completedSet) {
    const completed = completedSet || getStudentCompletedSet(studentData);
    const byVol = {};
    for (const vol of [1, 2, 3]) {
        const total = CURRICULUM_BY_VOL[vol].length;
        const done = CURRICULUM_BY_VOL[vol].filter(e => completed.has(e.id)).length;
        byVol[vol] = { total, done, pct: total > 0 ? Math.round(done / total * 100) : 0 };
    }
    const totalAll = CURRICULUM.length;
    const doneAll = CURRICULUM.filter(e => completed.has(e.id)).length;
    return { byVol, total: totalAll, done: doneAll, pct: totalAll > 0 ? Math.round(doneAll / totalAll * 100) : 0 };
}

function getPaceLabel(pct) {
    if (pct >= 60) return { label: 'Avanti', color: 'var(--elab-lime)', bg: 'rgba(85,139,47,0.1)' };
    if (pct >= 25) return { label: 'In pari', color: 'var(--elab-navy)', bg: 'rgba(30,77,140,0.1)' };
    if (pct > 0) return { label: 'Indietro', color: 'var(--elab-hex-996600)', bg: 'rgba(232,148,28,0.1)' };
    return { label: 'Non iniziato', color: 'var(--elab-hex-94a3b8)', bg: 'rgba(148,163,184,0.1)' };
}

function ProgressoPNRRTab({ users, allData, formatTempo }) {
    const [selectedVol, setSelectedVol] = useState('tutti');
    const [showMatrix, setShowMatrix] = useState(false);

    const studentsProgress = useMemo(() => {
        return users.map(u => {
            const sd = allData[u.id];
            const completed = getStudentCompletedSet(sd);
            const stats = getProgressStats(sd, completed);
            const pace = getPaceLabel(stats.pct);
            return { user: u, stats, pace, completed };
        }).sort((a, b) => b.stats.done - a.stats.done);
    }, [users, allData]);

    const classAvg = useMemo(() => {
        if (studentsProgress.length === 0) return 0;
        return Math.round(studentsProgress.reduce((s, sp) => s + sp.stats.pct, 0) / studentsProgress.length);
    }, [studentsProgress]);

    const paceGroups = useMemo(() => {
        const g = { avanti: 0, inPari: 0, indietro: 0, nonIniziato: 0 };
        studentsProgress.forEach(sp => {
            if (sp.pace.label === 'Avanti') g.avanti++;
            else if (sp.pace.label === 'In pari') g.inPari++;
            else if (sp.pace.label === 'Indietro') g.indietro++;
            else g.nonIniziato++;
        });
        return g;
    }, [studentsProgress]);

    const visibleExps = selectedVol === 'tutti' ? CURRICULUM : CURRICULUM_BY_VOL[parseInt(selectedVol)] || [];

    const handlePrint = () => {
        window.print();
    };

    const handleExportJSON = () => {
        const exportData = {
            report: 'ELAB Tutor — Report PNRR Scuola 4.0',
            generato: new Date().toISOString(),
            classe: {
                studenti: users.length,
                mediaProgresso: classAvg + '%',
                esperimentiTotali: CURRICULUM.length,
            },
            distribuzione: {
                avanti: paceGroups.avanti,
                inPari: paceGroups.inPari,
                indietro: paceGroups.indietro,
                nonIniziato: paceGroups.nonIniziato,
            },
            studenti: studentsProgress.map(sp => ({
                nome: sp.user.nome || sp.user.email?.split('@')[0] || 'Studente',
                esperimentiCompletati: sp.stats.done,
                esperimentiTotali: sp.stats.total,
                percentuale: sp.stats.pct + '%',
                stato: sp.pace.label,
                dettaglioVolumi: {
                    vol1: `${sp.stats.byVol[1]?.done || 0}/${sp.stats.byVol[1]?.total || 0}`,
                    vol2: `${sp.stats.byVol[2]?.done || 0}/${sp.stats.byVol[2]?.total || 0}`,
                    vol3: `${sp.stats.byVol[3]?.done || 0}/${sp.stats.byVol[3]?.total || 0}`,
                },
                esperimentiCompletatiLista: [...sp.completed],
            })),
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-pnrr_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportCSV = () => {
        const bom = '\uFEFF';
        const headers = ['Studente', 'Completati', 'Totali', '%', 'Stato', 'Vol1', 'Vol2', 'Vol3'];
        const rows = studentsProgress.map(sp => [
            sp.user.nome || sp.user.email?.split('@')[0] || 'Studente',
            sp.stats.done,
            sp.stats.total,
            sp.stats.pct + '%',
            sp.pace.label,
            `${sp.stats.byVol[1]?.done || 0}/${sp.stats.byVol[1]?.total || 0}`,
            `${sp.stats.byVol[2]?.done || 0}/${sp.stats.byVol[2]?.total || 0}`,
            `${sp.stats.byVol[3]?.done || 0}/${sp.stats.byVol[3]?.total || 0}`,
        ]);
        const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-pnrr_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (users.length === 0) {
        return (
            <div style={{ ...styles.section, textAlign: 'center', padding: 40 }}>
                <p style={{ color: C.textMuted, fontSize: 16 }}>Nessun dato disponibile per questa classe.</p>
                <p style={{ color: C.textMuted, fontSize: 14 }}>Aggiungi studenti dalla tab "Le mie classi" per visualizzare il progresso.</p>
            </div>
        );
    }

    return (
        <div className="pnrr-report-area">
            {/* Header PNRR */}
            <div style={{ ...styles.section, background: `linear-gradient(135deg, ${C.navy}, ${C.navyDark})`, color: C.white, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: 'Oswald, sans-serif', color: C.white }}>
                            Report Progresso — PNRR Scuola 4.0
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: 14, color: C.limeLight }}>
                            {users.length} studenti • {CURRICULUM.length} esperimenti nel curriculum • Media classe: {classAvg}%
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={handleExportJSON} style={{
                            ...styles.primaryBtn, background: C.white, color: C.navy, marginTop: 0,
                            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14,
                        }}>
                            Esporta JSON
                        </button>
                        <button onClick={handleExportCSV} style={{
                            ...styles.primaryBtn, background: C.white, color: C.navy, marginTop: 0,
                            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14,
                        }}>
                            Esporta CSV
                        </button>
                        <button onClick={handlePrint} style={{
                            ...styles.primaryBtn, background: C.white, color: C.navy, marginTop: 0,
                            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14,
                        }}>
                            <IconPrint /> Stampa
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={styles.statGrid}>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: C.navy }}>{users.length}</div>
                    <div style={styles.statLabel}>Studenti</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: 'var(--elab-lime)' }}>{paceGroups.avanti}</div>
                    <div style={styles.statLabel}>Avanti (&ge;60%)</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: C.navy }}>{paceGroups.inPari}</div>
                    <div style={styles.statLabel}>In pari (25-59%)</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: 'var(--elab-hex-996600)' }}>{paceGroups.indietro}</div>
                    <div style={styles.statLabel}>Indietro (&lt;25%)</div>
                </div>
            </div>

            {/* Progress per student */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Progresso Individuale</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <caption className="sr-only">
                            Progresso individuale degli studenti suddiviso per volume del curriculum, con stato complessivo
                        </caption>
                        <thead>
                            <tr>
                                <th scope="col" style={styles.th}>Studente</th>
                                <th scope="col" style={{ ...styles.th, width: 70 }}>Totale</th>
                                <th scope="col" style={{ ...styles.th, minWidth: 120 }}>Vol 1 ({CURRICULUM_BY_VOL[1].length})</th>
                                <th scope="col" style={{ ...styles.th, minWidth: 120 }}>Vol 2 ({CURRICULUM_BY_VOL[2].length})</th>
                                <th scope="col" style={{ ...styles.th, minWidth: 120 }}>Vol 3 ({CURRICULUM_BY_VOL[3].length})</th>
                                <th scope="col" style={{ ...styles.th, width: 100 }}>Stato</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentsProgress.map((sp, i) => (
                                <tr key={sp.user.id} style={i % 2 === 0 ? styles.trEven : {}}>
                                    <td style={{ ...styles.td, fontWeight: 600 }}>
                                        {sp.user.nome || sp.user.email?.split('@')[0] || 'Studente'}
                                    </td>
                                    <td style={styles.td}>
                                        <strong>{sp.stats.done}</strong>/{sp.stats.total}
                                    </td>
                                    {[1, 2, 3].map(vol => {
                                        const v = sp.stats.byVol[vol];
                                        return (
                                            <td key={vol} style={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{
                                                        flex: 1, height: 8, background: 'var(--elab-hex-e2e8f0)',
                                                        borderRadius: 4, overflow: 'hidden', minWidth: 60,
                                                    }}>
                                                        <div style={{
                                                            height: '100%', borderRadius: 4,
                                                            background: VOL_COLORS[vol],
                                                            width: `${v.pct}%`,
                                                            transition: 'width 0.3s',
                                                        }} />
                                                    </div>
                                                    <span style={{ fontSize: 14, color: C.textMuted, minWidth: 36 }}>
                                                        {v.done}/{v.total}
                                                    </span>
                                                </div>
                                            </td>
                                        );
                                    })}
                                    <td style={styles.td}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 6, fontSize: 14,
                                            fontWeight: 600, color: sp.pace.color, background: sp.pace.bg,
                                        }}>
                                            {sp.pace.label}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Matrice completamento */}
            <div style={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                    <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Matrice Completamento Esperimenti</h2>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <select
                            value={selectedVol}
                            onChange={e => setSelectedVol(e.target.value)}
                            aria-label="Filtra per volume"
                            style={{ ...styles.select, width: 'auto', minWidth: 140 }}
                        >
                            <option value="tutti">Tutti ({CURRICULUM.length})</option>
                            <option value="1">Volume 1 ({CURRICULUM_BY_VOL[1].length})</option>
                            <option value="2">Volume 2 ({CURRICULUM_BY_VOL[2].length})</option>
                            <option value="3">Volume 3 ({CURRICULUM_BY_VOL[3].length})</option>
                        </select>
                        <button
                            onClick={() => setShowMatrix(!showMatrix)}
                            style={{
                                ...styles.primaryBtn, marginTop: 0, fontSize: 14,
                                background: showMatrix ? C.navy : `linear-gradient(135deg, ${C.lime}, ${C.limeDark})`,
                            }}
                        >
                            {showMatrix ? 'Nascondi matrice' : 'Mostra matrice'}
                        </button>
                    </div>
                </div>

                {showMatrix && (
                    <div style={{ overflowX: 'auto', maxHeight: 'min(500px, 60vh)', overflowY: 'auto' }}>
                        <table style={{ ...styles.table, fontSize: 14 }}>
                            <caption className="sr-only">
                                Matrice di completamento esperimenti: righe studenti, colonne esperimenti
                            </caption>
                            <thead>
                                <tr>
                                    <th scope="col" style={{ ...styles.th, position: 'sticky', left: 0, background: C.white, zIndex: 2, minWidth: 120 }}>
                                        Studente
                                    </th>
                                    {visibleExps.map((exp, idx) => {
                                        const isVolStart = idx === 0 || visibleExps[idx - 1].volume !== exp.volume;
                                        return (
                                        <th scope="col" key={exp.id} style={{
                                            ...styles.th, fontSize: 14, padding: '6px 3px',
                                            writingMode: 'vertical-rl', textOrientation: 'mixed',
                                            whiteSpace: 'nowrap', maxWidth: 28, minWidth: 28,
                                            borderLeft: isVolStart ? `3px solid ${VOL_COLORS[exp.volume]}` : `1px solid ${C.border}`,
                                            color: VOL_COLORS[exp.volume],
                                        }} title={`${exp.title} (Cap ${exp.chapter})`} aria-label={`${exp.title}, capitolo ${exp.chapter}`}>
                                            {exp.id.replace(/^v\d-/, '')}
                                        </th>);
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {studentsProgress.map((sp, i) => (
                                    <tr key={sp.user.id} style={i % 2 === 0 ? { background: 'rgba(31,61,133,0.02)' } : {}}>
                                        <td style={{
                                            ...styles.td, fontWeight: 600, fontSize: 14,
                                            position: 'sticky', left: 0,
                                            background: i % 2 === 0 ? 'var(--elab-hex-f8fafc)' : C.white, zIndex: 1,
                                        }}>
                                            {sp.user.nome?.split(' ')[0] || 'Studente'}
                                        </td>
                                        {visibleExps.map((exp, idx) => {
                                            const done = sp.completed.has(exp.id);
                                            const isVolStart = idx === 0 || visibleExps[idx - 1].volume !== exp.volume;
                                            return (
                                                <td key={exp.id} style={{
                                                    ...styles.td, textAlign: 'center', padding: '4px 2px',
                                                    borderLeft: isVolStart ? `3px solid ${VOL_COLORS[exp.volume]}` : `1px solid ${C.border}`,
                                                    background: done ? `${VOL_COLORS[exp.volume]}15` : 'transparent',
                                                }} title={done ? `${sp.user.nome}: ${exp.title} — Completato` : `${sp.user.nome}: ${exp.title}`}>
                                                    {done ? (
                                                        <span style={{ color: VOL_COLORS[exp.volume], fontWeight: 700 }}>✓</span>
                                                    ) : (
                                                        <span style={{ color: 'var(--elab-hex-cbd5e1)' }}>·</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!showMatrix && (
                    <p style={{ color: C.textMuted, fontSize: 14, fontStyle: 'italic' }}>
                        Clicca "Mostra matrice" per vedere il dettaglio esperimento-per-esperimento di ogni studente.
                    </p>
                )}
            </div>

            {/* Legenda */}
            <div style={{ ...styles.section, background: 'var(--elab-hex-fafbfc)' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 14, color: C.navy, fontFamily: 'Oswald, sans-serif' }}>Legenda</h4>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14 }}>
                    <span><strong style={{ color: 'var(--elab-lime)' }}>■</strong> Volume 1 — Cominciamo ({CURRICULUM_BY_VOL[1].length} esp.)</span>
                    <span><strong style={{ color: 'var(--elab-hex-996600)' }}>■</strong> Volume 2 — Approfondiamo ({CURRICULUM_BY_VOL[2].length} esp.)</span>
                    <span><strong style={{ color: 'var(--elab-hex-c62828)' }}>■</strong> Volume 3 — Arduino ({CURRICULUM_BY_VOL[3].length} esp.)</span>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 14, marginTop: 8 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(85,139,47,0.1)', color: 'var(--elab-lime)', fontWeight: 600 }}>Avanti: ≥60%</span>
                    <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(30,77,140,0.1)', color: 'var(--elab-navy)', fontWeight: 600 }}>In pari: 25-59%</span>
                    <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(232,148,28,0.1)', color: 'var(--elab-hex-996600)', fontWeight: 600 }}>Indietro: &lt;25%</span>
                    <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(148,163,184,0.1)', color: 'var(--elab-hex-94a3b8)', fontWeight: 600 }}>Non iniziato</span>
                </div>
            </div>

            {/* Note per il dirigente */}
            <div style={{ ...styles.section, borderLeft: `4px solid ${C.navy}` }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 14, color: C.navy, fontFamily: 'Oswald, sans-serif' }}>Note per la rendicontazione PNRR</h4>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: C.textMuted, margin: 0 }}>
                    Questo report documenta l'utilizzo del software didattico ELAB Tutor nell'ambito del piano Scuola 4.0.
                    Il curriculum comprende {CURRICULUM.length} esperimenti di elettronica e Arduino distribuiti su 3 volumi progressivi.
                    Ogni esperimento completato è tracciato con timestamp. Per stampare il report, usare il pulsante "Stampa Report"
                    in alto — il PDF generato è idoneo come allegato alla rendicontazione PNRR.
                </p>
            </div>
        </div>
    );
}

// ─── PROGRESSI CLASSE (Task 1 G28) ──────────────────────
function getExperimentStatus(studentData, experimentId) {
    if (!studentData?.esperimenti) return 'none';
    const matches = studentData.esperimenti.filter(e => e.experimentId === experimentId);
    if (matches.length === 0) return 'none';
    const completed = matches.some(e => e.completato && e.durata > 30);
    if (completed) return 'completed';
    return 'partial';
}

const STATUS_COLORS = {
    completed: 'var(--elab-lime)',
    partial: 'var(--elab-orange)',
    none: 'var(--elab-hex-e2e8f0)',
};
const STATUS_BG = {
    completed: 'rgba(74,122,37,0.15)',
    partial: 'rgba(232,148,28,0.15)',
    none: 'transparent',
};

function ProgressiTab({ users, allData, onSelectStudent, formatTempo }) {
    const [selectedVol, setSelectedVol] = useState('tutti');
    const { paged: pagedUsers, page, setPage, totalPages, total } = usePagination(users);

    const visibleExps = selectedVol === 'tutti' ? CURRICULUM : CURRICULUM_BY_VOL[parseInt(selectedVol)] || [];

    // Compute class-level totals
    const classStats = useMemo(() => {
        let totalCompleted = 0;
        let totalCells = 0;
        users.forEach(u => {
            const sd = allData[u.id];
            visibleExps.forEach(exp => {
                totalCells++;
                if (getExperimentStatus(sd, exp.id) === 'completed') totalCompleted++;
            });
        });
        return { totalCompleted, totalCells };
    }, [users, allData, visibleExps]);

    const pctClass = classStats.totalCells > 0
        ? Math.round(classStats.totalCompleted / classStats.totalCells * 100)
        : 0;

    // Group experiments by chapter for header
    const chapters = useMemo(() => {
        const chaps = [];
        let current = null;
        visibleExps.forEach(exp => {
            const key = `v${exp.volume}-cap${exp.chapter}`;
            if (!current || current.key !== key) {
                current = { key, volume: exp.volume, chapter: exp.chapter, count: 0 };
                chaps.push(current);
            }
            current.count++;
        });
        return chaps;
    }, [visibleExps]);

    return (
        <div>
            {/* Class progress bar */}
            <div style={styles.section}>
                <div className={css.progressiHeader}>
                    <div>
                        <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Progressi della Classe</h2>
                        <p className={css.progressiSubtitle}>
                            Ogni riga è uno studente, ogni colonna un esperimento. Verde = completato, giallo = parziale, grigio = non fatto.
                        </p>
                    </div>
                    <select
                        value={selectedVol}
                        onChange={e => setSelectedVol(e.target.value)}
                        aria-label="Filtra per volume"
                        style={{ ...styles.select, width: 'auto', minWidth: 160 }}
                    >
                        <option value="tutti">Tutti i volumi ({CURRICULUM.length})</option>
                        <option value="1">Volume 1 ({CURRICULUM_BY_VOL[1].length})</option>
                        <option value="2">Volume 2 ({CURRICULUM_BY_VOL[2].length})</option>
                        <option value="3">Volume 3 ({CURRICULUM_BY_VOL[3].length})</option>
                    </select>
                </div>

                {/* Class progress bar */}
                <div className={css.progressBarWrap}>
                    <div className={css.progressBarHeader}>
                        <span className={css.progressBarLabel}>
                            {classStats.totalCompleted}/{classStats.totalCells} esperimenti completati ({pctClass}%)
                        </span>
                    </div>
                    <div className={css.progressBarTrack}>
                        <div className={css.progressBarFill} style={{ width: `${pctClass}%` }} />
                    </div>
                </div>

                {users.length === 0 ? (
                    <p className={css.emptyMessage}>
                        Nessun dato studente disponibile. I dati appariranno quando gli studenti useranno il simulatore.
                    </p>
                ) : (
                    <div className={css.gridScrollContainer}>
                        <table style={{ ...styles.table, fontSize: 14, borderCollapse: 'separate', borderSpacing: 0 }}>
                            <caption className="sr-only">
                                Griglia di progressi studenti per capitolo ed esperimento
                            </caption>
                            <thead>
                                {/* Chapter group headers */}
                                <tr>
                                    <th scope="col" className={css.stickyCornerTh} style={styles.th} aria-label="Nome studente" />
                                    {chapters.map(ch => (
                                        <th
                                            scope="colgroup"
                                            key={ch.key}
                                            colSpan={ch.count}
                                            className={css.chapterTh}
                                            style={{
                                                ...styles.th,
                                                color: VOL_COLORS[ch.volume],
                                                borderLeft: `2px solid ${VOL_COLORS[ch.volume]}`,
                                            }}
                                        >
                                            Cap.{ch.chapter}
                                        </th>
                                    ))}
                                </tr>
                                {/* Experiment number headers */}
                                <tr>
                                    <th scope="col" className={css.stickyStudentTh} style={styles.th}>
                                        Studente
                                    </th>
                                    {visibleExps.map((exp, idx) => {
                                        const isChapStart = idx === 0 || visibleExps[idx - 1].chapter !== exp.chapter || visibleExps[idx - 1].volume !== exp.volume;
                                        const espNum = exp.id.match(/esp(\d+)/)?.[1] || exp.id.split('-').pop();
                                        return (
                                            <th scope="col" key={exp.id} className={css.expTh} style={{
                                                ...styles.th,
                                                borderLeft: isChapStart ? `2px solid ${VOL_COLORS[exp.volume]}` : `1px solid ${C.border}`,
                                                color: C.textMuted,
                                            }} title={`${exp.title} (Cap ${exp.chapter})`} aria-label={`${exp.title}, capitolo ${exp.chapter}`}>
                                                {espNum}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {pagedUsers.map((u, i) => {
                                    const sd = allData[u.id];
                                    return (
                                        <tr key={u.id} className={i % 2 === 0 ? css.trEven : undefined}>
                                            <td
                                                className={css.studentNameTd}
                                                style={{
                                                    ...styles.td,
                                                    background: i % 2 === 0 ? 'var(--elab-hex-f8fafc)' : C.white,
                                                }}
                                                onClick={() => onSelectStudent(u.id)}
                                                title={`Clicca per i dettagli di ${u.nome}`}
                                            >
                                                {u.nome?.split(' ').map((w, wi) => wi === 0 ? w : w[0] + '.').join(' ') || 'Studente'}
                                            </td>
                                            {visibleExps.map((exp, idx) => {
                                                const status = getExperimentStatus(sd, exp.id);
                                                const isChapStart = idx === 0 || visibleExps[idx - 1].chapter !== exp.chapter || visibleExps[idx - 1].volume !== exp.volume;
                                                return (
                                                    <td key={exp.id} className={css.cellTd} style={{
                                                        ...styles.td,
                                                        borderLeft: isChapStart ? `2px solid ${VOL_COLORS[exp.volume]}` : `1px solid ${C.border}`,
                                                        background: STATUS_BG[status],
                                                    }} title={
                                                        status === 'completed' ? `${u.nome}: ${exp.title} — Completato` :
                                                        status === 'partial' ? `${u.nome}: ${exp.title} — Parziale` :
                                                        `${u.nome}: ${exp.title} — Non fatto`
                                                    }>
                                                        <span className={css.statusDot} style={{ background: STATUS_COLORS[status] }} />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

                {/* Legend */}
                <div className={css.legend}>
                    <span><span className={css.legendDot} style={{ background: STATUS_COLORS.completed }} /> Completato</span>
                    <span><span className={css.legendDot} style={{ background: STATUS_COLORS.partial }} /> Parziale</span>
                    <span><span className={css.legendDot} style={{ background: STATUS_COLORS.none }} /> Non fatto</span>
                </div>
            </div>

            {/* Bar chart: esperimenti completati per studente */}
            {users.length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Esperimenti Completati per Studente</h2>
                    <StudentProgressChart users={users} allData={allData} visibleExps={visibleExps} />
                </div>
            )}

            {/* Confusione heatmap */}
            {users.length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Mappa Confusione per Esperimento</h2>
                    <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 12 }}>
                        Colore rosso = molti errori, verde = pochi errori, grigio = nessun dato.
                    </p>
                    <ConfusioneHeatmap users={users} allData={allData} visibleExps={visibleExps} />
                </div>
            )}
        </div>
    );
}

// ─── BAR CHART: esperimenti completati per studente ─────
function StudentProgressChart({ users, allData, visibleExps }) {
    const chartData = useMemo(() => {
        return users.slice(0, 20).map(u => { // Cap at 20 for readability
            const sd = allData[u.id];
            let completed = 0;
            let partial = 0;
            visibleExps.forEach(exp => {
                const status = getExperimentStatus(sd, exp.id);
                if (status === 'completed') completed++;
                else if (status === 'partial') partial++;
            });
            return {
                name: u.nome?.split(' ')[0] || 'N/A',
                completati: completed,
                parziali: partial,
                totale: visibleExps.length,
            };
        });
    }, [users, allData, visibleExps]);

    if (chartData.length === 0) return null;

    return (
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 28 + 40)}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <XAxis type="number" domain={[0, 'dataMax']} tick={{ fontSize: 14, fill: C.textMuted }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 14, fill: C.text }} width={75} />
                <Tooltip
                    formatter={(value, name) => [value, name === 'completati' ? 'Completati' : 'Parziali']}
                    contentStyle={{ fontSize: 14, borderRadius: 6, border: `1px solid ${C.border}` }}
                />
                <Bar dataKey="completati" fill={C.lime} stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="parziali" fill="var(--elab-orange)" stackId="a" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// ─── CONFUSIONE HEATMAP ─────────────────────────────────
function ConfusioneHeatmap({ users, allData, visibleExps }) {
    // Compute error counts per experiment across all students
    const heatData = useMemo(() => {
        const errorMap = {}; // experimentId -> error count
        Object.values(allData).forEach(sd => {
            (sd.sessioni || []).forEach(sess => {
                (sess.attivita || []).forEach(att => {
                    if (att.tipo === 'compilazione' && att.dettaglio?.startsWith('Errore:')) {
                        // Try to associate with experiment
                        const expId = sess.esperimentoId || null;
                        if (expId) errorMap[expId] = (errorMap[expId] || 0) + 1;
                    }
                });
            });
            // Also count confusion logs
            (sd.confusione || []).forEach(c => {
                if (c.concettoId) {
                    errorMap[c.concettoId] = (errorMap[c.concettoId] || 0) + c.livello;
                }
            });
            // Count errors from experiments
            (sd.esperimenti || []).forEach(exp => {
                if (exp.note && typeof exp.note === 'string' && exp.note.toLowerCase().includes('errore')) {
                    errorMap[exp.experimentId] = (errorMap[exp.experimentId] || 0) + 1;
                }
            });
        });
        return errorMap;
    }, [allData]);

    // Find max for color scaling
    const maxErrors = Math.max(1, ...Object.values(heatData));

    // Group by chapter
    const chapters = useMemo(() => {
        const chaps = [];
        let current = null;
        visibleExps.forEach(exp => {
            const key = `v${exp.volume}-cap${exp.chapter}`;
            if (!current || current.key !== key) {
                current = { key, volume: exp.volume, chapter: exp.chapter, exps: [] };
                chaps.push(current);
            }
            current.exps.push(exp);
        });
        return chaps;
    }, [visibleExps]);

    function getHeatColor(count) {
        if (!count || count === 0) return '#F0F4F8'; // grigio chiaro
        const intensity = Math.min(count / maxErrors, 1);
        if (intensity > 0.7) return '#E53935'; // rosso
        if (intensity > 0.4) return '#F5A623'; // arancione
        if (intensity > 0.15) return '#FDD835'; // giallo
        return '#C8E6C9'; // verde chiaro
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            {chapters.map(ch => (
                <div key={ch.key} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: VOL_COLORS[ch.volume], marginBottom: 4 }}>
                        Capitolo {ch.chapter} (Volume {ch.volume})
                    </div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {ch.exps.map(exp => {
                            const count = heatData[exp.id] || 0;
                            const espNum = exp.id.match(/esp(\d+)/)?.[1] || '?';
                            return (
                                <div
                                    key={exp.id}
                                    title={`${exp.title}: ${count} errori/confusione`}
                                    style={{
                                        width: 36, height: 36,
                                        background: getHeatColor(count),
                                        borderRadius: 4,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 600,
                                        color: count > maxErrors * 0.5 ? '#FFF' : C.text,
                                        cursor: 'default',
                                        border: `1px solid ${C.border}`,
                                    }}
                                >
                                    {espNum}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 14, color: C.textMuted }}>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--elab-hex-c8e6c9)', borderRadius: 2, verticalAlign: 'middle', marginRight: 4 }} />Pochi</span>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--elab-hex-fdd835)', borderRadius: 2, verticalAlign: 'middle', marginRight: 4 }} />Medio</span>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--elab-hex-f5a623)', borderRadius: 2, verticalAlign: 'middle', marginRight: 4 }} />Alto</span>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--elab-hex-e53935)', borderRadius: 2, verticalAlign: 'middle', marginRight: 4 }} />Critico</span>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--elab-hex-f0f4f8)', borderRadius: 2, border: '1px solid var(--elab-hex-e2e8f0)', verticalAlign: 'middle', marginRight: 4 }} />Nessun dato</span>
            </div>
        </div>
    );
}

// ─── REPORT CLASSE (Task 3 G28) ─────────────────────────
function getCompilationErrors(allData) {
    const errors = {};
    Object.values(allData).forEach(sd => {
        (sd.sessioni || []).forEach(sess => {
            (sess.attivita || []).forEach(att => {
                if (att.tipo === 'compilazione' && att.dettaglio?.startsWith('Errore:')) {
                    const msg = att.dettaglio.replace('Errore: ', '').trim();
                    const key = msg.slice(0, 80);
                    errors[key] = (errors[key] || 0) + 1;
                }
            });
        });
    });
    return Object.entries(errors).sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function getExperimentDurations(allData) {
    const durations = {};
    const counts = {};
    Object.values(allData).forEach(sd => {
        (sd.esperimenti || []).forEach(exp => {
            if (exp.durata > 0) {
                durations[exp.experimentId] = (durations[exp.experimentId] || 0) + exp.durata;
                counts[exp.experimentId] = (counts[exp.experimentId] || 0) + 1;
            }
        });
    });
    return Object.entries(durations).map(([id, total]) => ({
        id,
        avg: Math.round(total / (counts[id] || 1)),
        count: counts[id] || 0,
    })).sort((a, b) => b.avg - a.avg);
}

function getClassWeatherIcon(pct) {
    if (pct >= 70) return { icon: 'S', label: 'Sole — Classe in ottima forma' };
    if (pct >= 50) return { icon: 'PN', label: 'Poco nuvoloso — Buon ritmo' };
    if (pct >= 30) return { icon: 'N', label: 'Nuvoloso — Serve attenzione' };
    if (pct >= 10) return { icon: 'P', label: 'Pioggia — Molti studenti indietro' };
    return { icon: 'T', label: 'Tempesta — La classe ha bisogno di aiuto' };
}

function getSkippedExperiments(allData, users) {
    const attemptCount = {};
    CURRICULUM.forEach(exp => { attemptCount[exp.id] = 0; });
    Object.values(allData).forEach(sd => {
        (sd.esperimenti || []).forEach(exp => {
            if (exp.experimentId in attemptCount) {
                attemptCount[exp.experimentId]++;
            }
        });
    });
    return Object.entries(attemptCount)
        .filter(([_, count]) => count === 0 || count < users.length * 0.3)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 5)
        .map(([id, count]) => {
            const exp = CURRICULUM.find(e => e.id === id);
            return { id, title: exp?.title || id, count };
        });
}

function getGameScores(allData) {
    const scores = {};
    Object.values(allData).forEach(sd => {
        (sd.sessioni || []).forEach(sess => {
            (sess.attivita || []).forEach(att => {
                if (att.tipo === 'gioco' && att.dettaglio) {
                    const match = att.dettaglio.match(/^(.+?):\s*(\d+)\/(\d+)/);
                    if (match) {
                        const gameId = match[1];
                        const score = parseInt(match[2]);
                        const max = parseInt(match[3]);
                        if (!scores[gameId]) scores[gameId] = { total: 0, count: 0, max };
                        scores[gameId].total += score;
                        scores[gameId].count++;
                    }
                }
            });
        });
    });
    return scores;
}

function exportReportCSV(users, allData, formatTempo) {
    const bom = '\uFEFF';
    const headers = ['Nome Studente', 'Esperimenti Completati', 'Tempo Totale', 'Ultimo Accesso', 'Punteggio Medio Giochi'];
    const rows = users.map(u => {
        const sd = allData[u.id];
        const completati = sd?.stats?.esperimentiTotali || 0;
        const tempo = formatTempo(sd?.tempoTotale || 0);
        const ultimoAccesso = sd?.ultimoSalvataggio
            ? new Date(sd.ultimoSalvataggio).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : 'Mai';
        // Game scores average
        let gameAvg = '—';
        const gameActivities = [];
        (sd?.sessioni || []).forEach(sess => {
            (sess.attivita || []).forEach(att => {
                if (att.tipo === 'gioco' && att.dettaglio) {
                    const match = att.dettaglio.match(/(\d+)\/(\d+)/);
                    if (match) gameActivities.push(parseInt(match[1]) / parseInt(match[2]));
                }
            });
        });
        if (gameActivities.length > 0) {
            gameAvg = Math.round(gameActivities.reduce((s, v) => s + v, 0) / gameActivities.length * 100) + '%';
        }
        return [
            `"${(u.nome || '').replace(/"/g, '""')}"`,
            completati,
            tempo,
            ultimoAccesso,
            gameAvg,
        ];
    });
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elab-report-classe-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Report classe esportato', 'success');
}

function ReportTab({ users, allData, classReport, formatTempo }) {
    const reportRef = React.useRef(null);

    // ── KPI aggregation ──
    const kpi = useMemo(() => {
        const studentiAttivi = users.filter(u => {
            const sd = allData[u.id];
            return sd && (sd.stats?.esperimentiTotali > 0 || sd.tempoTotale > 0);
        }).length;
        let espCompletati = 0;
        let tempoTotale = 0;
        let sessioniTotali = 0;
        Object.values(allData).forEach(sd => {
            espCompletati += (sd.esperimenti || []).filter(e => e.completato).length;
            tempoTotale += sd.tempoTotale || 0;
            sessioniTotali += (sd.sessioni || []).length;
        });
        const tempoMedio = sessioniTotali > 0 ? Math.round(tempoTotale / sessioniTotali) : 0;
        return { studentiAttivi, espCompletati, tempoMedio, sessioniTotali };
    }, [users, allData]);

    // ── Trend completamento nel tempo (line chart) ──
    const trendData = useMemo(() => {
        const byDate = {};
        Object.values(allData).forEach(sd => {
            (sd.esperimenti || []).filter(e => e.completato && e.timestamp).forEach(e => {
                const day = new Date(e.timestamp).toISOString().slice(0, 10);
                byDate[day] = (byDate[day] || 0) + 1;
            });
        });
        const sorted = Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0]));
        let cumulative = 0;
        return sorted.map(([date, count]) => {
            cumulative += count;
            return { date: date.slice(5), completati: cumulative };
        });
    }, [allData]);

    // ── Top 10 esperimenti più completati (bar chart) ──
    const topCompleted = useMemo(() => {
        const counts = {};
        Object.values(allData).forEach(sd => {
            (sd.esperimenti || []).filter(e => e.completato).forEach(e => {
                counts[e.experimentId] = (counts[e.experimentId] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([id, count]) => {
                const exp = CURRICULUM.find(e => e.id === id);
                const short = (exp?.title || id).length > 25
                    ? (exp?.title || id).slice(0, 22) + '...'
                    : (exp?.title || id);
                return { id, name: short, completamenti: count };
            });
    }, [allData]);

    // ── Mood distribution (pie chart) ──
    const moodData = useMemo(() => {
        const counts = {};
        Object.values(allData).forEach(sd => {
            (sd.moods || []).forEach(m => {
                counts[m.mood] = (counts[m.mood] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([mood, value]) => ({
                name: mood.charAt(0).toUpperCase() + mood.slice(1),
                value,
                fill: MOOD_COLORS[mood] || C.navy,
            }));
    }, [allData]);

    // ── Existing helpers ──
    const topSkipped = useMemo(() => getSkippedExperiments(allData, users), [allData, users]);
    const topErrors = useMemo(() => getCompilationErrors(allData), [allData]);
    const expDurations = useMemo(() => getExperimentDurations(allData), [allData]);

    const classPct = useMemo(() => {
        if (users.length === 0) return 0;
        let total = 0;
        users.forEach(u => {
            const sd = allData[u.id];
            const completed = getStudentCompletedSet(sd);
            total += (completed.size / (CURRICULUM.length || 1));
        });
        return Math.round(total / users.length * 100);
    }, [users, allData]);
    const weather = getClassWeatherIcon(classPct);

    const isEmpty = users.length === 0 || Object.keys(allData).length === 0;

    const handlePrintReport = useCallback(() => {
        window.print();
    }, []);

    // Recharts lazy import — already in bundle
    const [charts, setCharts] = useState(null);
    useEffect(() => {
        import('recharts').then(mod => setCharts(mod));
    }, []);

    const CHART_COLORS = [C.navy, C.lime, 'var(--elab-orange)', 'var(--elab-red)', C.cyan, '#9333EA', '#EC4899', '#6D4C41'];

    return (
        <div ref={reportRef} data-print-report>
            {isEmpty ? (
                <div style={styles.section} className={css.reportEmptySection}>
                    <p className={css.reportEmptyTitle}>
                        Nessun dato ancora.
                    </p>
                    <p className={css.reportEmptySubtitle}>
                        Gli studenti devono usare il simulatore. Ogni esperimento aperto e compilazione viene tracciata automaticamente.
                    </p>
                </div>
            ) : (
                <>
                    {/* ── Header con azioni ── */}
                    <div style={styles.section} className={css.meteoRow}>
                        <span style={{ fontSize: 48 }}>{WEATHER_ICONS[weather.icon] ? WEATHER_ICONS[weather.icon](48) : weather.icon}</span>
                        <div>
                            <h2 style={{ ...styles.sectionTitle, margin: '0 0 4px' }}>Report Classe</h2>
                            <p className={css.meteoLabel}>{weather.label}</p>
                            <p className={css.meteoValue}>
                                {classPct}% completamento medio
                            </p>
                        </div>
                        <div className={css.exportBtnWrap} style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => exportReportCSV(users, allData, formatTempo)}
                                style={{
                                    ...styles.primaryBtn, marginTop: 0,
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    background: C.navy,
                                }}
                            >
                                Esporta CSV
                            </button>
                            <button
                                onClick={handlePrintReport}
                                style={{
                                    ...styles.primaryBtn, marginTop: 0,
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    background: C.lime,
                                }}
                            >
                                <IconPrint size={16} /> Stampa Report
                            </button>
                        </div>
                    </div>

                    {/* ── KPI Cards ── */}
                    <div className={css.kpiGrid}>
                        <div className={css.kpiCardNavy}>
                            <div className={css.kpiValue}>{kpi.studentiAttivi}</div>
                            <div className={css.kpiLabel}>Studenti attivi</div>
                        </div>
                        <div className={css.kpiCardLime}>
                            <div className={css.kpiValue}>{kpi.espCompletati}</div>
                            <div className={css.kpiLabel}>Esperimenti completati</div>
                        </div>
                        <div className={css.kpiCardOrange}>
                            <div className={css.kpiValue}>{formatTempo(kpi.tempoMedio)}</div>
                            <div className={css.kpiLabel}>Tempo medio sessione</div>
                        </div>
                        <div className={css.kpiCardRed}>
                            <div className={css.kpiValue}>{kpi.sessioniTotali}</div>
                            <div className={css.kpiLabel}>Sessioni totali</div>
                        </div>
                    </div>

                    {/* ── Line Chart: trend completamento ── */}
                    {charts && trendData.length > 1 && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Trend Completamento Esperimenti</h2>
                            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 12 }}>
                                Numero cumulativo di esperimenti completati nel tempo
                            </p>
                            <div
                                role="img"
                                aria-label={`Andamento esperimenti completati: da ${trendData[0]?.completati ?? 0} (${trendData[0]?.date ?? 'inizio'}) a ${trendData.at(-1)?.completati ?? 0} (${trendData.at(-1)?.date ?? 'fine'}) nel periodo osservato, ${trendData.length} punti dati`}
                                style={{ width: '100%', height: 260 }}
                            >
                                <charts.ResponsiveContainer width="100%" height="100%">
                                    <charts.LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                        <charts.CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                                        <charts.XAxis dataKey="date" tick={{ fontSize: 14, fill: C.textMuted }} />
                                        <charts.YAxis tick={{ fontSize: 14, fill: C.textMuted }} allowDecimals={false} />
                                        <charts.Tooltip
                                            contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
                                            formatter={(v) => [v, 'Completati']}
                                        />
                                        <charts.Line
                                            type="monotone"
                                            dataKey="completati"
                                            stroke={C.lime}
                                            strokeWidth={2.5}
                                            dot={{ r: 3, fill: C.lime }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </charts.LineChart>
                                </charts.ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* ── Bar Chart: top esperimenti ── */}
                    {charts && topCompleted.length > 0 && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Top Esperimenti Più Completati</h2>
                            <div
                                role="img"
                                aria-label={`Top ${topCompleted.length} esperimenti più completati. ${topCompleted.slice(0, 3).map(t => `${t.name}: ${t.completamenti} completamenti`).join('; ')}${topCompleted.length > 3 ? '; ...' : ''}`}
                                style={{ width: '100%', height: Math.max(200, topCompleted.length * 36) }}
                            >
                                <charts.ResponsiveContainer width="100%" height="100%">
                                    <charts.BarChart data={topCompleted} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <charts.CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                                        <charts.XAxis type="number" tick={{ fontSize: 14, fill: C.textMuted }} allowDecimals={false} />
                                        <charts.YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 14, fill: C.text }} />
                                        <charts.Tooltip
                                            contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
                                            formatter={(v) => [v, 'Completamenti']}
                                        />
                                        <charts.Bar dataKey="completamenti" radius={[0, 4, 4, 0]} fill={C.navy}>
                                            {topCompleted.map((_, i) => (
                                                <charts.Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </charts.Bar>
                                    </charts.BarChart>
                                </charts.ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* ── Pie Chart: mood studenti ── */}
                    {charts && moodData.length > 0 && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Distribuzione Mood Studenti</h2>
                            <div
                                role="img"
                                aria-label={`Distribuzione mood studenti: ${moodData.map(m => `${m.name} ${m.value}`).join(', ')}`}
                                style={{ width: '100%', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <charts.ResponsiveContainer width="100%" height="100%">
                                    <charts.PieChart>
                                        <charts.Pie
                                            data={moodData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                                        >
                                            {moodData.map((entry, i) => (
                                                <charts.Cell key={i} fill={entry.fill} />
                                            ))}
                                        </charts.Pie>
                                        <charts.Tooltip
                                            contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
                                            formatter={(v, name) => [v, name]}
                                        />
                                    </charts.PieChart>
                                </charts.ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                                {moodData.map(m => (
                                    <span key={m.name} style={{ fontSize: 14, color: C.text, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 10, height: 10, borderRadius: 2, background: m.fill, display: 'inline-block' }} />
                                        {m.name} ({m.value})
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Top skipped ── */}
                    <div style={styles.section}>
                        <h2 style={{ ...styles.sectionTitle, color: C.red }}>Top 5 Esperimenti Più Saltati</h2>
                        {topSkipped.length === 0 ? (
                            <p className={css.textMuted}>Tutti gli esperimenti sono stati provati!</p>
                        ) : topSkipped.map(exp => (
                            <div key={exp.id} className={css.expRow}>
                                <div className={css.expInfo}>
                                    <div className={css.expTitle}>{exp.title}</div>
                                    <div className={css.expId}>{exp.id}</div>
                                </div>
                                <div className={css.miniBarTrack}>
                                    <div className={css.miniBarFillRed} style={{ width: `${Math.max(5, 100 - Math.round(exp.count / (users.length || 1) * 100))}%` }} />
                                </div>
                                <span className={css.expCountWide} style={{ color: C.red }}>
                                    {exp.count}/{users.length}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* ── Compilation errors ── */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Errori di Compilazione Comuni</h2>
                        {topErrors.length === 0 ? (
                            <p className={css.textMuted}>Nessun errore di compilazione registrato.</p>
                        ) : topErrors.map(([msg, count], i) => (
                            <div key={i} className={css.errorRow}>
                                <span className={css.errorBadge}>
                                    {count}
                                </span>
                                <code className={css.errorCode}>
                                    {msg}
                                </code>
                            </div>
                        ))}
                    </div>

                    {/* ── Avg time per experiment ── */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Tempo Medio per Esperimento</h2>
                        {expDurations.length === 0 ? (
                            <p className={css.textMuted}>Nessun dato disponibile.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={styles.table}>
                                    <caption className="sr-only">
                                        Tempo medio per esperimento e numero di tentativi registrati
                                    </caption>
                                    <thead>
                                        <tr>
                                            <th scope="col" style={styles.th}>Esperimento</th>
                                            <th scope="col" style={{ ...styles.th, width: 100 }}>Tempo medio</th>
                                            <th scope="col" style={{ ...styles.th, width: 80 }}>Tentativi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expDurations.slice(0, 10).map((exp, i) => {
                                            const cur = CURRICULUM.find(e => e.id === exp.id);
                                            return (
                                                <tr key={exp.id} className={i % 2 === 0 ? css.trEven : undefined}>
                                                    <td style={styles.td}>
                                                        <div className={css.durationTableTd}>{cur?.title || exp.id}</div>
                                                        <div className={css.durationTableId}>{exp.id}</div>
                                                    </td>
                                                    <td style={{ ...styles.td, fontWeight: 600, color: C.navy }}>{formatTempo(exp.avg)}</td>
                                                    <td style={{ ...styles.td, color: C.textMuted }}>{exp.count}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── Print footer (visible only in print) ── */}
                    <div className={css.printFooter}>
                        ELAB Tutor — Report Classe — Generato il {new Date().toLocaleDateString('it-IT')}
                    </div>
                </>
            )}
        </div>
    );
}

// SVG print icon
const IconPrint = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
    </svg>
);

// ─── AUDIT GDPR TAB (solo admin) ──────────────────────
function AuditTab() {
    const [userId, setUserId] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const DATA_SERVER = (import.meta.env.VITE_DATA_SERVER_URL || '').replace(/\/$/, '');
    const TOKEN_KEY_LOCAL = 'elab_auth_token';

    const fetchAuditLog = useCallback(async () => {
        if (!userId.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem(TOKEN_KEY_LOCAL) || sessionStorage.getItem(TOKEN_KEY_LOCAL);
            if (!DATA_SERVER || !token) {
                setError('Server dati non configurato o non autenticato');
                return;
            }
            const resp = await fetch(`${DATA_SERVER}/api/audit/${encodeURIComponent(userId.trim())}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!resp.ok) {
                const body = await resp.json().catch(() => ({}));
                throw new Error(body.error || `HTTP ${resp.status}`);
            }
            const data = await resp.json();
            setLogs(data.logs || []);
        } catch (e) {
            setError(e.message);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [userId, DATA_SERVER]);

    return (
        <div>
            <div className={css.securityCard}>
                <h2 className={css.sectionTitle}>
                    Audit Log GDPR
                </h2>
                <p className={css.infoNote}>
                    Registro accessi e operazioni per conformità GDPR Art.30. Cerca per userId.
                </p>
                <div className={css.filterRow} style={{ gap: 8 }}>
                    <input
                        type="text"
                        value={userId}
                        onChange={e => setUserId(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchAuditLog()}
                        placeholder="Inserisci userId..."
                        className={css.searchInput} style={{ marginBottom: 0, flex: 1, minWidth: 200 }}
                    />
                    <button
                        onClick={fetchAuditLog}
                        disabled={loading || !userId.trim()}
                        className={css.primaryBtn} style={{ marginTop: 0, background: C.navy, opacity: loading ? 0.6 : 1 }}
                    >
                        {loading ? 'Caricamento...' : 'Cerca'}
                    </button>
                </div>
                {error && (
                    <div className={css.errorBox}>
                        {error}
                    </div>
                )}
                {logs.length > 0 && (
                    <div className={css.auditTableWrap}>
                        <table className={css.auditTable}>
                            <caption className="sr-only">
                                Audit log GDPR: timestamp, azione, endpoint, indirizzo IP e stato per ogni evento
                            </caption>
                            <thead>
                                <tr>
                                    <th scope="col" className={css.auditTh}>Timestamp</th>
                                    <th scope="col" className={css.auditTh}>Azione</th>
                                    <th scope="col" className={css.auditTh}>Endpoint</th>
                                    <th scope="col" className={css.auditTh}>IP</th>
                                    <th scope="col" className={css.auditTh}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <tr key={log.id || i} className={i % 2 === 0 ? css.trEven : undefined}>
                                        <td className={css.auditTd} style={{ whiteSpace: 'nowrap' }}>{log.timestamp ? new Date(log.timestamp + 'Z').toLocaleString('it-IT') : '-'}</td>
                                        <td className={css.auditTd}>
                                            <span className={css.actionBadge} style={{
                                                background: log.action?.includes('delete') ? 'var(--elab-hex-ffebee)' : log.action?.includes('gdpr') ? 'var(--elab-hex-fff3e0)' : 'var(--elab-hex-e8f5e9)',
                                                color: log.action?.includes('delete') ? 'var(--elab-hex-c62828)' : log.action?.includes('gdpr') ? 'var(--elab-hex-e65100)' : 'var(--elab-hex-2e7d32)',
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className={css.auditTdMono}>{log.endpoint}</td>
                                        <td className={css.auditTdMono}>{log.ip || '-'}</td>
                                        <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                                                background: log.status_code < 400 ? 'var(--elab-hex-4caf50)' : log.status_code < 500 ? 'var(--elab-hex-f5a623)' : 'var(--elab-hex-e53935)',
                                            }} title={`HTTP ${log.status_code}`} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p style={{ color: C.textMuted, fontSize: 14, marginTop: 8 }}>
                            Mostrati {logs.length} record (ultimi 100 per utente).
                        </p>
                    </div>
                )}
                {logs.length === 0 && !loading && !error && userId.trim() && (
                    <p style={{ color: C.textMuted, fontSize: 14, textAlign: 'center', padding: 20 }}>
                        Nessun log trovato per questo utente.
                    </p>
                )}
            </div>
            <div className={css.securityCard} style={{ marginBottom: 0 }}>
                <h2 className={css.sectionTitle} style={{ marginBottom: 12 }}>
                    Stato Sicurezza
                </h2>
                <div className={css.securityGrid}>
                    <div className={css.securityItemGreen}>
                        <strong className={css.securityItemLabel} style={{ color: 'var(--elab-hex-2e7d32)' }}>Cifratura localStorage</strong>
                        <p className={css.securityItemDesc} style={{ color: 'var(--elab-hex-1b5e20)' }}>
                            {studentService.isEncryptionActive() ? 'Attiva (AES-256-GCM)' : 'Non attiva'}
                        </p>
                    </div>
                    <div className={DATA_SERVER ? css.securityItemGreen : css.securityItemWarn}>
                        <strong className={css.securityItemLabel} style={{ color: DATA_SERVER ? 'var(--elab-hex-2e7d32)' : 'var(--elab-hex-e65100)' }}>Server Dati EU</strong>
                        <p className={css.securityItemDesc} style={{ color: DATA_SERVER ? 'var(--elab-hex-1b5e20)' : 'var(--elab-hex-bf360c)' }}>
                            {DATA_SERVER ? 'Configurato' : 'Non configurato'}
                        </p>
                    </div>
                    <div className={DATA_SERVER ? css.securityItemGreen : css.securityItemWarn}>
                        <strong className={css.securityItemLabel} style={{ color: DATA_SERVER ? 'var(--elab-hex-2e7d32)' : 'var(--elab-hex-e65100)' }}>Audit Logging</strong>
                        <p className={css.securityItemDesc} style={{ color: DATA_SERVER ? 'var(--elab-hex-1b5e20)' : 'var(--elab-hex-bf360c)' }}>
                            {DATA_SERVER ? 'Attivo (ogni richiesta API)' : 'Solo locale — server non configurato'}
                        </p>
                    </div>
                    <div className={DATA_SERVER ? css.securityItemGreen : css.securityItemWarn}>
                        <strong className={css.securityItemLabel} style={{ color: DATA_SERVER ? 'var(--elab-hex-2e7d32)' : 'var(--elab-hex-e65100)' }}>Data Retention</strong>
                        <p className={css.securityItemDesc} style={{ color: DATA_SERVER ? 'var(--elab-hex-1b5e20)' : 'var(--elab-hex-bf360c)' }}>
                            {DATA_SERVER ? '730 giorni (server + locale)' : '730 giorni (solo questo browser)'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── STILI ─────────────────────────────────────────────
const styles = {
    container: {
        maxWidth: 1000,
        margin: '0 auto',
        padding: '24px 16px',
        fontFamily: 'Open Sans, -apple-system, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 28px',
        background: `linear-gradient(135deg, ${C.navy}, ${C.navyDark})`,
        borderRadius: 16,
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 16,
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    headerTitle: { color: C.white, margin: 0, fontSize: 22, fontWeight: 700, fontFamily: 'Oswald, sans-serif' },
    headerSubtitle: { color: C.limeLight, margin: '4px 0 0', fontSize: 14 },
    tabBar: {
        display: 'flex', gap: 6, marginBottom: 24,
        overflowX: 'auto', paddingBottom: 4,
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
    },
    tab: {
        border: 'none', padding: '10px 16px', borderRadius: 10,
        cursor: 'pointer', fontSize: 14, fontWeight: 600,
        whiteSpace: 'nowrap', transition: 'all 0.2s',
        flexShrink: 0, minHeight: 44,
    },
    content: { minHeight: 400 },
    section: {
        background: C.white, borderRadius: 12, padding: 20,
        marginBottom: 16, border: `1px solid ${C.border}`,
    },
    sectionTitle: {
        margin: '0 0 16px', fontSize: 16, fontWeight: 700,
        color: C.navy, fontFamily: 'Oswald, sans-serif',
    },
    searchInput: {
        width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`,
        borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
        marginBottom: 16,
    },
    gardenGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 12,
    },
    gardenPlant: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 16, borderRadius: 12, background: 'rgba(31,61,133,0.03)',
        border: `1px solid ${C.border}`, cursor: 'pointer',
        transition: 'all 0.2s', textAlign: 'center',
        position: 'relative',
    },
    plantName: { fontSize: 14, fontWeight: 600, color: C.navy, marginTop: 6 },
    plantMood: { position: 'absolute', top: 8, right: 8, fontSize: 14 },
    plantStats: {
        display: 'flex', gap: 8, fontSize: 14, color: C.textMuted, marginTop: 6,
    },
    statGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 12, marginBottom: 16,
    },
    statCard: {
        background: C.white, borderRadius: 12, padding: 16,
        textAlign: 'center', border: `1px solid ${C.border}`,
    },
    statValue: { fontSize: 24, fontWeight: 800, fontFamily: 'Oswald, sans-serif', margin: '4px 0' },
    statLabel: { fontSize: 14, color: C.textMuted, fontWeight: 600 },
    weatherRow: {
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        padding: '12px 0', gap: 8,
    },
    weatherChip: {
        padding: '4px 12px', borderRadius: 20, fontSize: 14,
        border: `2px solid ${C.border}`, fontWeight: 500,
    },
    fogRow: {
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 0', borderBottom: `1px solid ${C.border}`,
        position: 'relative',
    },
    confusionBar: {
        height: 6, borderRadius: 3, transition: 'width 0.3s',
        position: 'absolute', bottom: 0, left: 0,
    },
    inactiveBadge: {
        padding: '6px 12px', borderRadius: 8, fontSize: 14,
        background: 'rgba(245,166,35,0.1)', color: C.orange,
        fontWeight: 500,
    },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
    th: {
        padding: '10px 12px', textAlign: 'left', fontWeight: 700,
        color: C.navy, borderBottom: `2px solid ${C.navy}`, fontSize: 14,
    },
    td: { padding: '10px 12px', borderBottom: `1px solid ${C.border}` },
    trEven: { background: 'rgba(31,61,133,0.02)' },
    popularRow: {
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 0',
    },
    popularBar: {
        width: 100, height: 8, background: C.border,
        borderRadius: 4, overflow: 'hidden',
    },
    select: {
        width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`,
        borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
        background: C.white, minHeight: 44,
    },
    studentHeader: {
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '20px 24px', background: `linear-gradient(135deg, ${C.navy}, ${C.navyDark})`,
        borderRadius: 12, marginBottom: 16,
    },
    studentAvatar: {
        width: 48, height: 48, borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.lime}, ${C.limeDark})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.white, fontWeight: 700, overflow: 'hidden', flexShrink: 0,
    },
    textarea: {
        width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`,
        borderRadius: 8, fontSize: 14, fontFamily: 'Open Sans, sans-serif',
        outline: 'none', resize: 'vertical', boxSizing: 'border-box',
    },
    primaryBtn: {
        background: `linear-gradient(135deg, ${C.lime}, ${C.limeDark})`,
        border: 'none', color: C.white, padding: '10px 20px',
        borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
        marginTop: 8, minHeight: 44,
    },
    nudgeItem: {
        display: 'flex', gap: 12, padding: '14px 0',
        borderBottom: `1px solid ${C.border}`,
    },
    nudgeSuggestion: {
        padding: '10px 12px', borderRadius: 8, fontSize: 14,
        cursor: 'pointer', transition: 'background 0.2s',
        borderBottom: `1px solid ${C.border}`,
    },
    docPanel: {
        padding: 20, borderRadius: 12,
        background: 'rgba(31,61,133,0.03)',
        border: `1px solid ${C.border}`,
        marginBottom: 12,
    },
};
