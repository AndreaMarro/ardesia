/**
 * sessionMetrics + activityBuffer — Tests for UNLIM context tracking
 * Tests session metrics, compilation tracking, and activity ring buffer.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  trackExperimentLoad,
  trackCompilation,
  trackInteraction,
  formatForContext,
  resetMetrics,
} from '../../src/services/sessionMetrics';
import {
  pushActivity,
  getRecentActivities,
  formatForContext as formatActivityContext,
  clearActivities,
} from '../../src/services/activityBuffer';

describe('sessionMetrics', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('formatForContext returns empty before experiment load', () => {
    expect(formatForContext()).toBe('');
  });

  it('trackExperimentLoad initializes experiment tracking', () => {
    trackExperimentLoad('v1-cap6-esp1');
    const ctx = formatForContext();
    expect(ctx).toContain('[METRICHE]');
    expect(ctx).toContain('sessione=');
    expect(ctx).toContain('esperimento=');
  });

  it('trackCompilation counts successes', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackCompilation(true);
    trackCompilation(true);
    const ctx = formatForContext();
    expect(ctx).toContain('compilazioni=2');
    expect(ctx).not.toContain('fallite=');
  });

  it('trackCompilation counts failures separately', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackCompilation(true);
    trackCompilation(false);
    trackCompilation(false);
    const ctx = formatForContext();
    expect(ctx).toContain('compilazioni=3');
    expect(ctx).toContain('fallite=2');
  });

  it('trackInteraction updates lastInteraction', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackInteraction();
    const ctx = formatForContext();
    // Just loaded + interacted = no idle time
    expect(ctx).not.toContain('inattivo=');
  });

  it('resetMetrics clears all counters', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackCompilation(false);
    trackCompilation(false);
    resetMetrics();
    expect(formatForContext()).toBe('');
  });

  it('formatForContext includes session and experiment time', () => {
    trackExperimentLoad('v1-cap6-esp1');
    const ctx = formatForContext();
    expect(ctx).toMatch(/sessione=\d+min/);
    expect(ctx).toMatch(/esperimento=\d+min/);
  });

  it('trackExperimentLoad resets compilation counters', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackCompilation(false);
    trackCompilation(false);
    trackExperimentLoad('v1-cap6-esp2'); // Load new experiment
    const ctx = formatForContext();
    expect(ctx).not.toContain('compilazioni=');
    expect(ctx).not.toContain('fallite=');
  });
});

describe('activityBuffer', () => {
  beforeEach(() => {
    clearActivities();
  });

  it('starts with empty buffer', () => {
    expect(getRecentActivities()).toEqual([]);
  });

  it('pushActivity adds an entry', () => {
    pushActivity('compile_error', 'undefined reference to loop');
    const recent = getRecentActivities(1);
    expect(recent.length).toBe(1);
    expect(recent[0].type).toBe('compile_error');
    expect(recent[0].detail).toBe('undefined reference to loop');
    expect(recent[0].ts).toBeGreaterThan(0);
  });

  it('getRecentActivities returns most recent N', () => {
    pushActivity('a', '1');
    pushActivity('b', '2');
    pushActivity('c', '3');
    const recent = getRecentActivities(2);
    expect(recent.length).toBe(2);
    expect(recent[0].type).toBe('b');
    expect(recent[1].type).toBe('c');
  });

  it('getRecentActivities defaults to 5', () => {
    for (let i = 0; i < 8; i++) pushActivity(`act-${i}`);
    expect(getRecentActivities().length).toBe(5);
  });

  it('ring buffer caps at 20 entries', () => {
    for (let i = 0; i < 30; i++) pushActivity(`act-${i}`, `detail-${i}`);
    const all = getRecentActivities(100);
    expect(all.length).toBe(20);
    // Oldest should be act-10, newest act-29
    expect(all[0].type).toBe('act-10');
    expect(all[19].type).toBe('act-29');
  });

  it('pushActivity truncates detail to 120 chars', () => {
    const longDetail = 'x'.repeat(200);
    pushActivity('test', longDetail);
    const recent = getRecentActivities(1);
    expect(recent[0].detail.length).toBe(120);
  });

  it('pushActivity handles non-string detail', () => {
    pushActivity('test', 42);
    const recent = getRecentActivities(1);
    expect(recent[0].detail).toBe('42');
  });

  it('formatForContext returns empty when no activities', () => {
    expect(formatActivityContext()).toBe('');
  });

  it('formatForContext returns formatted output', () => {
    pushActivity('component_added', 'led (led-1)');
    pushActivity('compile_error', 'undefined reference');
    const ctx = formatActivityContext(2);
    expect(ctx).toContain('[ATTIVITÀ RECENTE]');
    expect(ctx).toContain('component_added: led (led-1)');
    expect(ctx).toContain('compile_error: undefined reference');
    expect(ctx).toMatch(/\d+\. \[\d{2}:\d{2}:\d{2}\]/);
  });

  it('clearActivities empties the buffer', () => {
    pushActivity('a');
    pushActivity('b');
    clearActivities();
    expect(getRecentActivities()).toEqual([]);
  });
});
