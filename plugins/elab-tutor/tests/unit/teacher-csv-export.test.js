/**
 * ELAB Tutor — Teacher Dashboard CSV Export Tests (G28)
 * Verifica: generazione corretta CSV, gestione dati vuoti, formato data italiano.
 * © Andrea Marro — 29/03/2026
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test the CSV generation logic directly (not DOM download)
function generateReportCSV(users, allData, formatTempo) {
    const bom = '\uFEFF';
    const headers = ['Nome Studente', 'Esperimenti Completati', 'Tempo Totale', 'Ultimo Accesso', 'Punteggio Medio Giochi'];
    const rows = users.map(u => {
        const sd = allData[u.id];
        const completati = sd?.stats?.esperimentiTotali || 0;
        const tempo = formatTempo(sd?.tempoTotale || 0);
        const ultimoAccesso = sd?.ultimoSalvataggio
            ? new Date(sd.ultimoSalvataggio).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : 'Mai';
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
    return bom + csv;
}

const formatTempo = (secondi) => {
    if (!secondi) return '0s';
    if (secondi < 60) return `${secondi}s`;
    if (secondi < 3600) return `${Math.round(secondi / 60)}min`;
    return `${Math.round(secondi / 3600 * 10) / 10}h`;
};

describe('Teacher Dashboard CSV Export (G28)', () => {
    it('generates CSV with correct headers and data', () => {
        const users = [
            { id: 'u1', nome: 'Marco Rossi', email: 'marco@test.it' },
            { id: 'u2', nome: 'Sofia Bianchi', email: 'sofia@test.it' },
        ];
        const allData = {
            u1: {
                stats: { esperimentiTotali: 5 },
                tempoTotale: 3600,
                ultimoSalvataggio: '2026-03-28T10:30:00.000Z',
                sessioni: [{
                    attivita: [
                        { tipo: 'gioco', dettaglio: 'CircuitDetective: 8/10 (60s)' },
                        { tipo: 'gioco', dettaglio: 'PredictObserve: 6/10 (45s)' },
                    ],
                }],
            },
            u2: {
                stats: { esperimentiTotali: 3 },
                tempoTotale: 1800,
                ultimoSalvataggio: '2026-03-27T14:00:00.000Z',
                sessioni: [],
            },
        };

        const csv = generateReportCSV(users, allData, formatTempo);

        // UTF-8 BOM
        expect(csv.charCodeAt(0)).toBe(0xFEFF);

        // Semicolon separator (Italian Excel standard)
        expect(csv).toContain(';');

        // Headers
        expect(csv).toContain('Nome Studente;Esperimenti Completati;Tempo Totale;Ultimo Accesso;Punteggio Medio Giochi');

        // Data for Marco
        expect(csv).toContain('"Marco Rossi"');
        expect(csv).toContain('5'); // esperimenti
        expect(csv).toContain('1h'); // tempo

        // Data for Sofia
        expect(csv).toContain('"Sofia Bianchi"');
        expect(csv).toContain('30min'); // 1800s

        // Game scores: Marco has 8/10 + 6/10 = avg 70%
        expect(csv).toContain('70%');

        // Sofia has no game data
        expect(csv).toContain('—');
    });

    it('handles empty student data gracefully', () => {
        const users = [
            { id: 'empty-user', nome: 'Studente Nuovo', email: 'new@test.it' },
        ];
        const allData = {};

        const csv = generateReportCSV(users, allData, formatTempo);

        // Should not throw
        expect(csv).toContain('Nome Studente');
        expect(csv).toContain('"Studente Nuovo"');
        expect(csv).toContain('0'); // 0 esperimenti
        expect(csv).toContain('0s'); // 0 tempo
        expect(csv).toContain('Mai'); // no last access
        expect(csv).toContain('—'); // no game scores
    });

    it('formats Italian date correctly and handles special characters in names', () => {
        const users = [
            { id: 'u1', nome: 'Dell\'Acqua "Giò"', email: 'gio@test.it' },
        ];
        const allData = {
            u1: {
                stats: { esperimentiTotali: 2 },
                tempoTotale: 120,
                ultimoSalvataggio: '2026-03-15T08:00:00.000Z',
                sessioni: [],
            },
        };

        const csv = generateReportCSV(users, allData, formatTempo);

        // Double quotes in name should be escaped
        expect(csv).toContain('""Giò""');

        // Date should be in Italian format (dd/mm/yyyy)
        expect(csv).toContain('15/03/2026');

        // Time should be formatted
        expect(csv).toContain('2min');
    });
});
