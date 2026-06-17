/**
 * Lesson Preparation Service — Unit Tests
 * UNLIM lesson prep: commands detection, summaries, context building
 * (c) Andrea Marro — 09/04/2026
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../src/data/lesson-paths', () => ({
    getLessonPath: vi.fn(),
}));

vi.mock('../../src/hooks/useSessionTracker', () => ({
    getSavedSessions: vi.fn(() => []),
}));

vi.mock('../../src/services/api', () => ({
    sendChat: vi.fn(),
}));

vi.mock('../../src/utils/logger', () => ({
    default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import { getLessonSummary, isLessonPrepCommand, prepareLesson } from '../../src/services/lessonPrepService';
import { getLessonPath } from '../../src/data/lesson-paths';
import { getSavedSessions } from '../../src/hooks/useSessionTracker';
import { sendChat } from '../../src/services/api';

const MOCK_LESSON_PATH = {
    experiment_id: 'v1-cap6-esp1',
    title: 'Accendi il tuo primo LED',
    chapter_title: 'Capitolo 6: I primi circuiti',
    objective: 'Collegare un LED con resistenza',
    duration_minutes: 45,
    difficulty: 1,
    components_needed: ['LED rosso', 'Resistenza 220Ω', 'Fili'],
    phases: [
        { name: 'CHIEDI', duration_minutes: 5, teacher_message: 'Sapete cosa è un LED?' },
        { name: 'SPERIMENTA', duration_minutes: 25, teacher_message: 'Collegate il circuito' },
        { name: 'CONCLUDI', duration_minutes: 15, teacher_message: 'Cosa avete imparato?' },
    ],
    vocabulary: { allowed: ['LED', 'resistenza', 'circuito', 'anodo', 'catodo'] },
    next_experiment: 'v1-cap6-esp2',
};

// ============================================
// isLessonPrepCommand
// ============================================

describe('isLessonPrepCommand', () => {
    test('detects "prepara la lezione"', () => {
        expect(isLessonPrepCommand('prepara la lezione')).toBe(true);
        expect(isLessonPrepCommand('Prepara la lezione di oggi')).toBe(true);
    });

    test('detects "pianifica lezione"', () => {
        expect(isLessonPrepCommand('pianifica la lezione')).toBe(true);
        expect(isLessonPrepCommand('Pianifica lezione')).toBe(true);
    });

    test('detects "organizza lezione"', () => {
        expect(isLessonPrepCommand('organizza la lezione')).toBe(true);
    });

    test('detects "prepara l\'esperimento"', () => {
        expect(isLessonPrepCommand("prepara l'esperimento")).toBe(true);
        expect(isLessonPrepCommand('prepara il lab')).toBe(true);
    });

    test('detects "cosa faccio oggi"', () => {
        expect(isLessonPrepCommand('cosa faccio oggi')).toBe(true);
        expect(isLessonPrepCommand('cosa facciamo oggi')).toBe(true);
    });

    test('detects "suggerisci lezione"', () => {
        expect(isLessonPrepCommand('suggerisci una lezione')).toBe(true);
        expect(isLessonPrepCommand('consiglia un esperimento')).toBe(true);
    });

    test('detects "lezione di oggi"', () => {
        expect(isLessonPrepCommand('lezione di oggi')).toBe(true);
        expect(isLessonPrepCommand('lezione oggi')).toBe(true);
    });

    test('detects "preparami la lezione"', () => {
        expect(isLessonPrepCommand('preparami la lezione')).toBe(true);
    });

    test('rejects non-prep commands', () => {
        expect(isLessonPrepCommand('come collego un LED')).toBe(false);
        expect(isLessonPrepCommand('il LED non si accende')).toBe(false);
        expect(isLessonPrepCommand('hello')).toBe(false);
    });

    test('rejects null/empty', () => {
        expect(isLessonPrepCommand(null)).toBe(false);
        expect(isLessonPrepCommand('')).toBe(false);
        expect(isLessonPrepCommand(undefined)).toBe(false);
    });

    test('is case insensitive', () => {
        expect(isLessonPrepCommand('PREPARA LA LEZIONE')).toBe(true);
        expect(isLessonPrepCommand('Cosa Faccio Oggi')).toBe(true);
    });
});

// ============================================
// getLessonSummary
// ============================================

describe('getLessonSummary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('returns null for unknown experiment', () => {
        getLessonPath.mockReturnValue(null);
        expect(getLessonSummary('nonexistent')).toBeNull();
    });

    test('returns structured summary for known experiment', () => {
        getLessonPath.mockReturnValue(MOCK_LESSON_PATH);
        getSavedSessions.mockReturnValue([]);

        const summary = getLessonSummary('v1-cap6-esp1');

        expect(summary).not.toBeNull();
        expect(summary.title).toBe('Accendi il tuo primo LED');
        expect(summary.chapter).toBe('Capitolo 6: I primi circuiti');
        expect(summary.objective).toBe('Collegare un LED con resistenza');
        expect(summary.duration).toBe(45);
        expect(summary.difficulty).toBe(1);
        expect(summary.components).toContain('LED rosso');
        expect(summary.nextExperiment).toBe('v1-cap6-esp2');
    });

    test('includes phases with name/duration/message', () => {
        getLessonPath.mockReturnValue(MOCK_LESSON_PATH);
        getSavedSessions.mockReturnValue([]);

        const summary = getLessonSummary('v1-cap6-esp1');

        expect(summary.phases).toHaveLength(3);
        expect(summary.phases[0].name).toBe('CHIEDI');
        expect(summary.phases[0].duration).toBe(5);
        expect(summary.phases[0].message).toContain('LED');
    });

    test('marks isFirstTime when no past sessions', () => {
        getLessonPath.mockReturnValue(MOCK_LESSON_PATH);
        getSavedSessions.mockReturnValue([]);

        const summary = getLessonSummary('v1-cap6-esp1');

        expect(summary.isFirstTime).toBe(true);
        expect(summary.pastContext).toBeNull();
    });

    test('includes past context when sessions exist', () => {
        getLessonPath.mockReturnValue(MOCK_LESSON_PATH);
        getSavedSessions.mockReturnValue([
            { experimentId: 'v1-cap6-esp1', completed: true, errors: [], startTime: new Date().toISOString() },
        ]);

        const summary = getLessonSummary('v1-cap6-esp1');

        expect(summary.isFirstTime).toBe(false);
        expect(summary.pastContext).not.toBeNull();
        expect(summary.pastContext.completedCount).toBe(1);
    });

    test('detects needsReview when last session > 7 days ago', () => {
        getLessonPath.mockReturnValue(MOCK_LESSON_PATH);
        const eightDaysAgo = new Date(Date.now() - 8 * 86400000).toISOString();
        getSavedSessions.mockReturnValue([
            { experimentId: 'v1-cap6-esp1', completed: true, errors: [], startTime: eightDaysAgo },
        ]);

        const summary = getLessonSummary('v1-cap6-esp1');

        expect(summary.needsReview).toBe(true);
    });

    test('needsReview is false when last session is recent', () => {
        getLessonPath.mockReturnValue(MOCK_LESSON_PATH);
        getSavedSessions.mockReturnValue([
            { experimentId: 'v1-cap6-esp1', completed: true, errors: [], startTime: new Date().toISOString() },
        ]);

        const summary = getLessonSummary('v1-cap6-esp1');

        expect(summary.needsReview).toBe(false);
    });

    test('includes vocabulary from lesson path', () => {
        getLessonPath.mockReturnValue(MOCK_LESSON_PATH);
        getSavedSessions.mockReturnValue([]);

        const summary = getLessonSummary('v1-cap6-esp1');

        expect(summary.vocabulary.allowed).toContain('LED');
        expect(summary.vocabulary.allowed).toContain('resistenza');
    });
});

// ============================================
// prepareLesson
// ============================================

describe('prepareLesson', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('returns plan with lessonPath and timestamp', async () => {
        getLessonPath.mockReturnValue(MOCK_LESSON_PATH);
        getSavedSessions.mockReturnValue([]);
        sendChat.mockResolvedValue({ response: 'AI personalization' });

        const plan = await prepareLesson('v1-cap6-esp1');

        expect(plan.experimentId).toBe('v1-cap6-esp1');
        expect(plan.lessonPath).toEqual(MOCK_LESSON_PATH);
        expect(plan.prepared).toBe(true);
        expect(plan.timestamp).toBeDefined();
    });

    test('works without AI (useAI: false)', async () => {
        getLessonPath.mockReturnValue(MOCK_LESSON_PATH);
        getSavedSessions.mockReturnValue([]);

        const plan = await prepareLesson('v1-cap6-esp1', { useAI: false });

        expect(plan.prepared).toBe(true);
        expect(sendChat).not.toHaveBeenCalled();
        expect(plan.aiPersonalized).toBeUndefined();
    });

    test('includes AI suggestions when available', async () => {
        getLessonPath.mockReturnValue(MOCK_LESSON_PATH);
        getSavedSessions.mockReturnValue([]);
        sendChat.mockResolvedValue({ response: 'GANCIO: Chi sa cosa succede con la corrente?' });

        const plan = await prepareLesson('v1-cap6-esp1');

        expect(plan.aiPersonalized).toBe(true);
        expect(plan.aiSuggestions).toContain('GANCIO');
    });

    test('gracefully handles AI failure', async () => {
        getLessonPath.mockReturnValue(MOCK_LESSON_PATH);
        getSavedSessions.mockReturnValue([]);
        sendChat.mockRejectedValue(new Error('Network error'));

        const plan = await prepareLesson('v1-cap6-esp1');

        expect(plan.prepared).toBe(true);
        expect(plan.aiPersonalized).toBe(false);
    });

    test('includes phases from lesson path', async () => {
        getLessonPath.mockReturnValue(MOCK_LESSON_PATH);
        getSavedSessions.mockReturnValue([]);

        const plan = await prepareLesson('v1-cap6-esp1', { useAI: false });

        expect(plan.phases).toHaveLength(3);
    });
});
