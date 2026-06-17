/**
 * Activity Buffer + Session Metrics — Unit Tests
 * UNLIM contextual awareness: tracks user actions + session timing
 * (c) Andrea Marro — 09/04/2026
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
    pushActivity, getRecentActivities, formatForContext, clearActivities
} from '../../src/services/activityBuffer';
import { sessionMetrics } from '../../src/services/sessionMetrics';

// ============================================
// ACTIVITY BUFFER
// ============================================

describe('Activity Buffer', () => {
    beforeEach(() => {
        clearActivities();
    });

    test('pushActivity adds entry to buffer', () => {
        pushActivity('compile_error', 'undefined reference to loop');
        const recent = getRecentActivities(1);
        expect(recent).toHaveLength(1);
        expect(recent[0].type).toBe('compile_error');
        expect(recent[0].detail).toBe('undefined reference to loop');
        expect(recent[0].ts).toBeGreaterThan(0);
    });

    test('getRecentActivities returns last N entries', () => {
        pushActivity('a1');
        pushActivity('a2');
        pushActivity('a3');
        pushActivity('a4');
        pushActivity('a5');

        expect(getRecentActivities(3)).toHaveLength(3);
        expect(getRecentActivities(3)[0].type).toBe('a3');
        expect(getRecentActivities(3)[2].type).toBe('a5');
    });

    test('getRecentActivities defaults to 5', () => {
        for (let i = 0; i < 10; i++) pushActivity(`action_${i}`);
        expect(getRecentActivities()).toHaveLength(5);
    });

    test('buffer is capped at MAX_SIZE (20)', () => {
        for (let i = 0; i < 30; i++) pushActivity(`action_${i}`);
        expect(getRecentActivities(100)).toHaveLength(20);
        // First entry should be action_10 (oldest 10 were dropped)
        expect(getRecentActivities(100)[0].type).toBe('action_10');
    });

    test('detail is truncated to 120 characters', () => {
        const longDetail = 'x'.repeat(200);
        pushActivity('test', longDetail);
        expect(getRecentActivities(1)[0].detail).toHaveLength(120);
    });

    test('detail handles non-string input', () => {
        pushActivity('test', 42);
        expect(getRecentActivities(1)[0].detail).toBe('42');

        pushActivity('test', null);
        expect(getRecentActivities(1)[0].detail).toBe('null');
    });

    test('detail defaults to empty string', () => {
        pushActivity('test');
        expect(getRecentActivities(1)[0].detail).toBe('');
    });

    test('clearActivities empties the buffer', () => {
        pushActivity('a1');
        pushActivity('a2');
        clearActivities();
        expect(getRecentActivities()).toHaveLength(0);
    });

    test('getRecentActivities returns empty array when buffer is empty', () => {
        expect(getRecentActivities()).toEqual([]);
    });

    test('formatForContext returns empty string when no activities', () => {
        expect(formatForContext()).toBe('');
    });

    test('formatForContext produces formatted output', () => {
        pushActivity('compile_error', 'undefined reference');
        pushActivity('component_added', 'led (led-1)');
        const ctx = formatForContext(2);

        expect(ctx).toContain('[ATTIVITÀ RECENTE]');
        expect(ctx).toContain('compile_error: undefined reference');
        expect(ctx).toContain('component_added: led (led-1)');
        expect(ctx).toMatch(/1\.\s+\[\d{2}:\d{2}:\d{2}\]/); // timestamp format
    });

    test('formatForContext omits detail when empty', () => {
        pushActivity('play');
        const ctx = formatForContext(1);
        expect(ctx).toContain('play');
        // Line ends with just "play", no ": detail" suffix
        expect(ctx).toMatch(/\] play$/m);
    });

    test('formatForContext respects n parameter', () => {
        for (let i = 0; i < 10; i++) pushActivity(`a_${i}`);
        const ctx = formatForContext(3);
        const lines = ctx.split('\n').filter(l => l.match(/^\d+\./));
        expect(lines).toHaveLength(3);
    });
});

// ============================================
// SESSION METRICS
// ============================================

describe('Session Metrics', () => {
    beforeEach(() => {
        sessionMetrics.resetMetrics();
    });

    test('trackExperimentLoad sets experiment context', () => {
        sessionMetrics.trackExperimentLoad('v1-cap6-esp1');
        const ctx = sessionMetrics.formatForContext();
        expect(ctx).toContain('[METRICHE]');
        expect(ctx).toContain('esperimento=0min');
    });

    test('formatForContext returns empty when no experiment loaded', () => {
        expect(sessionMetrics.formatForContext()).toBe('');
    });

    test('trackCompilation increments counters', () => {
        sessionMetrics.trackExperimentLoad('v1-cap6-esp1');
        sessionMetrics.trackCompilation(true);
        sessionMetrics.trackCompilation(true);
        sessionMetrics.trackCompilation(false);

        const ctx = sessionMetrics.formatForContext();
        expect(ctx).toContain('compilazioni=3');
        expect(ctx).toContain('fallite=1');
    });

    test('trackCompilation success only shows count not failures', () => {
        sessionMetrics.trackExperimentLoad('v1-cap6-esp1');
        sessionMetrics.trackCompilation(true);
        sessionMetrics.trackCompilation(true);

        const ctx = sessionMetrics.formatForContext();
        expect(ctx).toContain('compilazioni=2');
        expect(ctx).not.toContain('fallite');
    });

    test('no compilation info when 0 attempts', () => {
        sessionMetrics.trackExperimentLoad('v1-cap6-esp1');
        const ctx = sessionMetrics.formatForContext();
        expect(ctx).not.toContain('compilazioni');
    });

    test('trackInteraction updates last interaction time', () => {
        sessionMetrics.trackExperimentLoad('v1-cap6-esp1');
        sessionMetrics.trackInteraction();
        // Idle should be very low (just called trackInteraction)
        const ctx = sessionMetrics.formatForContext();
        expect(ctx).not.toContain('inattivo'); // <30s threshold
    });

    test('resetMetrics clears all counters', () => {
        sessionMetrics.trackExperimentLoad('v1-cap6-esp1');
        sessionMetrics.trackCompilation(false);
        sessionMetrics.trackCompilation(false);
        sessionMetrics.resetMetrics();

        // After reset, no experiment loaded → empty
        expect(sessionMetrics.formatForContext()).toBe('');
    });

    test('trackExperimentLoad resets per-experiment counters', () => {
        sessionMetrics.trackExperimentLoad('v1-cap6-esp1');
        sessionMetrics.trackCompilation(false);
        sessionMetrics.trackCompilation(false);

        // Load new experiment
        sessionMetrics.trackExperimentLoad('v1-cap7-esp1');
        const ctx = sessionMetrics.formatForContext();
        expect(ctx).not.toContain('compilazioni');
        expect(ctx).not.toContain('fallite');
    });

    test('formatForContext includes session duration', () => {
        sessionMetrics.trackExperimentLoad('v1-cap6-esp1');
        const ctx = sessionMetrics.formatForContext();
        expect(ctx).toContain('sessione=');
        expect(ctx).toMatch(/sessione=\d+min/);
    });
});
