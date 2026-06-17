/**
 * Session Report Service — Unit Tests
 * PDF report generation: data collection, AI summary, local fallback
 * (c) Andrea Marro — 09/04/2026
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/services/api', () => ({
    sendChat: vi.fn(),
}));

vi.mock('../../src/utils/logger', () => ({
    default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

vi.mock('../../src/components/simulator/utils/exportPng', () => ({
    captureCanvasBase64: vi.fn(),
}));

import { collectSessionData, fetchAISummary, captureCircuit } from '../../src/services/sessionReportService';
import { sendChat } from '../../src/services/api';
import { captureCanvasBase64 } from '../../src/components/simulator/utils/exportPng';

const MOCK_EXPERIMENT = {
    id: 'v1-cap6-esp1',
    title: 'Accendi il tuo primo LED',
    desc: 'Collegare un LED con resistenza',
    chapter: 'Capitolo 6',
    difficulty: 1,
    simulationMode: 'circuit',
    components: [
        { type: 'led', id: 'led-1', value: null, color: 'red' },
        { type: 'resistor', id: 'r-1', value: '220', color: null },
    ],
    quiz: [{ question: 'Cosa e\' un LED?', answer: 'diodo' }],
    concept: 'circuito base',
    code: 'void setup() { pinMode(13, OUTPUT); }',
};

// ============================================
// collectSessionData
// ============================================

describe('collectSessionData', () => {
    test('returns structured data with experiment info', () => {
        const data = collectSessionData({
            messages: [
                { id: '1', role: 'user', content: 'Come collego il LED?' },
                { id: '2', role: 'assistant', content: 'Collega...' },
            ],
            activeExperiment: MOCK_EXPERIMENT,
            quizResults: { score: 3, total: 5 },
            codeContent: 'void setup() {}',
            compilationResult: { success: true },
            sessionStartTime: Date.now() - 30 * 60000, // 30 min ago
            buildStepIndex: 2,
            buildStepsTotal: 5,
            isCircuitComplete: false,
        });

        expect(data.experiment).not.toBeNull();
        expect(data.experiment.id).toBe('v1-cap6-esp1');
        expect(data.experiment.title).toBe('Accendi il tuo primo LED');
        expect(data.volumeNumber).toBe(1);
        expect(data.volumeColor).toBe('#4A7A25');
        expect(data.messageCount).toBe(2);
        expect(data.duration).toBeGreaterThanOrEqual(29);
        expect(data.quizResults.score).toBe(3);
        expect(data.buildProgress).toEqual({ current: 3, total: 5 });
        expect(data.isCircuitComplete).toBe(false);
    });

    test('filters out welcome message', () => {
        const data = collectSessionData({
            messages: [
                { id: 'welcome', role: 'assistant', content: 'Benvenuto!' },
                { id: '1', role: 'user', content: 'Ciao' },
            ],
            activeExperiment: null,
            sessionStartTime: Date.now(),
        });

        expect(data.messageCount).toBe(1);
        expect(data.chatMessages[0].content).toBe('Ciao');
    });

    test('detects volume 2 from experiment ID', () => {
        const data = collectSessionData({
            messages: [],
            activeExperiment: { ...MOCK_EXPERIMENT, id: 'v2-cap10-esp3' },
            sessionStartTime: Date.now(),
        });

        expect(data.volumeNumber).toBe(2);
        expect(data.volumeColor).toBe('#E8941C');
    });

    test('detects volume 3 from experiment ID', () => {
        const data = collectSessionData({
            messages: [],
            activeExperiment: { ...MOCK_EXPERIMENT, id: 'v3-cap15-esp1' },
            sessionStartTime: Date.now(),
        });

        expect(data.volumeNumber).toBe(3);
        expect(data.volumeColor).toBe('#E54B3D');
    });

    test('handles null experiment gracefully', () => {
        const data = collectSessionData({
            messages: [],
            activeExperiment: null,
            sessionStartTime: Date.now(),
        });

        expect(data.experiment).toBeNull();
        expect(data.volumeNumber).toBe(1); // default
    });

    test('handles no messages', () => {
        const data = collectSessionData({
            messages: null,
            activeExperiment: MOCK_EXPERIMENT,
            sessionStartTime: Date.now(),
        });

        expect(data.chatMessages).toEqual([]);
        expect(data.messageCount).toBe(0);
    });

    test('no buildProgress when buildStepsTotal is 0', () => {
        const data = collectSessionData({
            messages: [],
            activeExperiment: MOCK_EXPERIMENT,
            sessionStartTime: Date.now(),
            buildStepIndex: 0,
            buildStepsTotal: 0,
        });

        expect(data.buildProgress).toBeNull();
    });

    test('duration is at least 1 minute', () => {
        const data = collectSessionData({
            messages: [],
            activeExperiment: MOCK_EXPERIMENT,
            sessionStartTime: Date.now(), // just started
        });

        expect(data.duration).toBeGreaterThanOrEqual(1);
    });

    test('includes session date and time in Italian', () => {
        const data = collectSessionData({
            messages: [],
            activeExperiment: MOCK_EXPERIMENT,
            sessionStartTime: Date.now(),
        });

        expect(data.sessionDate).toBeTruthy();
        expect(data.sessionTime).toBeTruthy();
    });
});

// ============================================
// fetchAISummary
// ============================================

describe('fetchAISummary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('returns parsed JSON from AI response', async () => {
        sendChat.mockResolvedValue({
            success: true,
            response: '{"riassunto":["Hai acceso il LED!","Ottimo lavoro!"],"prossimoPassoSuggerito":"Prova il pulsante","concettiToccati":["circuito","LED"]}',
        });

        const result = await fetchAISummary({
            experiment: MOCK_EXPERIMENT,
            duration: 30,
            messageCount: 5,
            isCircuitComplete: true,
            quizResults: { score: 3, total: 3 },
        });

        expect(result.riassunto).toHaveLength(2);
        expect(result.riassunto[0]).toContain('LED');
        expect(result.concettiToccati).toContain('circuito');
    });

    test('falls back to local summary on AI failure', async () => {
        sendChat.mockRejectedValue(new Error('Network error'));

        const result = await fetchAISummary({
            experiment: MOCK_EXPERIMENT,
            duration: 30,
            messageCount: 5,
            isCircuitComplete: true,
        });

        expect(result.riassunto).toBeDefined();
        expect(result.riassunto.length).toBeGreaterThan(0);
        expect(result.riassunto[0]).toContain('Accendi il tuo primo LED');
    });

    test('local fallback includes quiz results', async () => {
        sendChat.mockRejectedValue(new Error('timeout'));

        const result = await fetchAISummary({
            experiment: MOCK_EXPERIMENT,
            duration: 10,
            messageCount: 2,
            isCircuitComplete: false,
            quizResults: { score: 5, total: 5 },
        });

        expect(result.riassunto.some(r => r.includes('correttamente'))).toBe(true);
    });

    test('local fallback mentions incomplete circuit', async () => {
        sendChat.mockRejectedValue(new Error('timeout'));

        const result = await fetchAISummary({
            experiment: MOCK_EXPERIMENT,
            duration: 10,
            messageCount: 0,
            isCircuitComplete: false,
            buildProgress: null,
        });

        expect(result.riassunto.some(r => r.includes('non era ancora completo') || r.includes('riproverai'))).toBe(true);
    });

    test('local fallback mentions code if written', async () => {
        sendChat.mockRejectedValue(new Error('timeout'));

        const result = await fetchAISummary({
            experiment: MOCK_EXPERIMENT,
            duration: 10,
            messageCount: 0,
            isCircuitComplete: true,
            codeContent: 'void setup() {}',
        });

        expect(result.riassunto.some(r => r.includes('codice Arduino'))).toBe(true);
    });
});

// ============================================
// captureCircuit
// ============================================

describe('captureCircuit', () => {
    test('returns null when ref is null', async () => {
        const result = await captureCircuit(null);
        expect(result).toBeNull();
    });

    test('returns null when ref.current is null', async () => {
        const result = await captureCircuit({ current: null });
        expect(result).toBeNull();
    });

    test('calls captureCanvasBase64 with container', async () => {
        const mockContainer = document.createElement('div');
        captureCanvasBase64.mockResolvedValue('data:image/png;base64,abc');

        const result = await captureCircuit({ current: mockContainer });

        expect(captureCanvasBase64).toHaveBeenCalledWith(mockContainer);
        expect(result).toBe('data:image/png;base64,abc');
    });
});
