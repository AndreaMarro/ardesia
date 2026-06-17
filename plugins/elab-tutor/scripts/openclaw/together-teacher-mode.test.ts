import { describe, it, expect } from 'vitest';
import { canUseTogether, anonymizePayload, estimateCostCents, checkMonthlyBudget } from './together-teacher-mode.ts';

describe('canUseTogether — GDPR gate', () => {
  it('BLOCKS any payload with hasStudentData=true', () => {
    const result = canUseTogether({
      mode: 'teacher_context',
      teacherConsent: true,
      payload: { hasStudentData: true, hasClassIds: false, hasSessionIds: false, topic: 'lesson_prep' },
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/dati studenti/i);
  });

  it('ALLOWS batch_ingest for wiki_ingest topic with clean payload', () => {
    const result = canUseTogether({
      mode: 'batch_ingest',
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'wiki_ingest' },
    });
    expect(result.allowed).toBe(true);
  });

  it('REJECTS batch_ingest with non-wiki topic', () => {
    const result = canUseTogether({
      mode: 'batch_ingest',
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'lesson_prep' },
    });
    expect(result.allowed).toBe(false);
  });

  it('REJECTS batch_ingest when classIds present', () => {
    const result = canUseTogether({
      mode: 'batch_ingest',
      payload: { hasStudentData: false, hasClassIds: true, hasSessionIds: false, topic: 'wiki_ingest' },
    });
    expect(result.allowed).toBe(false);
  });

  it('REJECTS teacher_context without consent', () => {
    const result = canUseTogether({
      mode: 'teacher_context',
      teacherConsent: false,
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'lesson_prep' },
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/consenso/i);
  });

  it('ALLOWS teacher_context with consent + valid topic', () => {
    const result = canUseTogether({
      mode: 'teacher_context',
      teacherConsent: true,
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'quiz_gen' },
    });
    expect(result.allowed).toBe(true);
  });

  it('REJECTS teacher_context with invalid topic', () => {
    const result = canUseTogether({
      mode: 'teacher_context',
      teacherConsent: true,
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'fallback_query' },
    });
    expect(result.allowed).toBe(false);
  });

  it('REJECTS emergency_anonymized without ticket', () => {
    const result = canUseTogether({
      mode: 'emergency_anonymized',
      euProvidersDown: ['hetzner', 'scaleway'],
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'fallback_query' },
    });
    expect(result.allowed).toBe(false);
  });

  it('REJECTS emergency with < 2 providers down', () => {
    const result = canUseTogether({
      mode: 'emergency_anonymized',
      emergencyTicketId: 'T-001',
      euProvidersDown: ['hetzner'],
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'fallback_query' },
    });
    expect(result.allowed).toBe(false);
  });

  it('ALLOWS emergency with 2+ providers down + ticket', () => {
    const result = canUseTogether({
      mode: 'emergency_anonymized',
      emergencyTicketId: 'T-001',
      euProvidersDown: ['hetzner', 'scaleway'],
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'fallback_query' },
    });
    expect(result.allowed).toBe(true);
  });
});

describe('anonymizePayload', () => {
  it('redacts class_id / session_id / email keys', () => {
    const input = { class_id: 'C-123', session_id: 'S-456', email: 'a@b.it', text: 'hello' };
    const out = anonymizePayload(input);
    expect(out.class_id).toBe('[REDACTED]');
    expect(out.session_id).toBe('[REDACTED]');
    expect(out.email).toBe('[REDACTED]');
    expect(out.text).toBe('hello');
  });

  it('redacts nested IDs', () => {
    const input = { student: { user_id: 'U-1', nome: 'Mario' }, question: 'LED?' };
    const out = anonymizePayload(input);
    expect((out.student as any).user_id).toBe('[REDACTED]');
    expect((out.student as any).nome).toBe('[REDACTED]');
    expect(out.question).toBe('LED?');
  });

  it('redacts UUIDs inside string values', () => {
    const input = { text: 'session abc12345-1234-1234-1234-123456789012 active' };
    const out = anonymizePayload(input);
    expect(out.text).toMatch(/\[UUID\]/);
  });
});

describe('estimateCostCents', () => {
  it('computes batch_ingest cost correctly (0.18 in + 0.54 out per M)', () => {
    const cents = estimateCostCents('batch_ingest', 1_000_000, 1_000_000);
    expect(cents).toBe(Math.round((0.18 + 0.54) * 100));
  });

  it('computes teacher_context cost (0.88 + 0.88 per M)', () => {
    const cents = estimateCostCents('teacher_context', 500_000, 500_000);
    expect(cents).toBe(Math.round((0.88 * 0.5 + 0.88 * 0.5) * 100));
  });

  it('returns 0 for zero tokens', () => {
    expect(estimateCostCents('teacher_context', 0, 0)).toBe(0);
  });
});

describe('checkMonthlyBudget', () => {
  it('allows spend within budget', () => {
    const result = checkMonthlyBudget(100, 50, 500);
    expect(result.allowed).toBe(true);
    expect(result.remainingCents).toBe(400);
  });

  it('blocks when remaining < proposed', () => {
    const result = checkMonthlyBudget(450, 100, 500);
    expect(result.allowed).toBe(false);
    expect(result.remainingCents).toBe(50);
  });

  it('allows exact remaining', () => {
    const result = checkMonthlyBudget(450, 50, 500);
    expect(result.allowed).toBe(true);
  });

  it('blocks at 0 remaining', () => {
    const result = checkMonthlyBudget(500, 1, 500);
    expect(result.allowed).toBe(false);
    expect(result.remainingCents).toBe(0);
  });
});
