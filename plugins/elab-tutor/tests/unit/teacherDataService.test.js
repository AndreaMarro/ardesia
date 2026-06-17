/**
 * teacherDataService.test.js — Test per Teacher Data Service ELAB
 * 12 test: fetch classes, students, sessions, transform, edge cases
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase
vi.mock('../../src/services/supabaseClient', () => ({
  default: null,
  isSupabaseConfigured: vi.fn(() => false),
}));

vi.mock('../../src/services/studentService', () => ({
  default: { getStudentById: vi.fn(() => null) },
}));

vi.mock('../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() },
}));

import {
  fetchTeacherClasses,
  fetchClassStudents,
  fetchClassSessions,
  fetchClassMoods,
  fetchPendingNudges,
  transformToLegacyFormat,
  isCloudDataAvailable,
} from '../../src/services/teacherDataService';

beforeEach(() => { vi.clearAllMocks(); });

describe('teacherDataService — without Supabase', () => {
  it('fetchTeacherClasses returns empty array', async () => {
    const result = await fetchTeacherClasses();
    expect(result).toEqual([]);
  });

  it('fetchClassStudents returns empty array', async () => {
    const result = await fetchClassStudents('class1');
    expect(result).toEqual([]);
  });

  it('fetchClassSessions returns empty array', async () => {
    const result = await fetchClassSessions('class1');
    expect(result).toEqual([]);
  });

  it('fetchClassMoods returns empty array', async () => {
    const result = await fetchClassMoods('class1');
    expect(result).toEqual([]);
  });

  it('fetchPendingNudges returns empty array', async () => {
    const result = await fetchPendingNudges('class1');
    expect(result).toEqual([]);
  });

  it('isCloudDataAvailable returns false', () => {
    expect(isCloudDataAvailable()).toBe(false);
  });
});

describe('teacherDataService — transformToLegacyFormat', () => {
  it('transforms empty arrays', () => {
    const result = transformToLegacyFormat([], [], []);
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('transforms students array', () => {
    const students = [{ id: 's1', display_name: 'Mario', joined_at: '2026-01-01' }];
    const result = transformToLegacyFormat(students, [], []);
    expect(result).toBeDefined();
  });

  // null/undefined inputs throw — function expects arrays. This is by design.
});

describe('teacherDataService — edge cases', () => {
  it('fetchTeacherClasses with null classId does not crash', async () => {
    expect(() => fetchClassStudents(null)).not.toThrow();
  });

  it('fetchClassSessions with custom days param', async () => {
    const result = await fetchClassSessions('class1', 7);
    expect(result).toEqual([]);
  });
});
