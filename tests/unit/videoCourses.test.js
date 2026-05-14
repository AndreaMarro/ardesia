/**
 * videoCourses — Tests for video course data integrity
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import { VIDEO_COURSES } from '../../src/data/video-courses';

describe('videoCourses', () => {
  it('VIDEO_COURSES is a non-empty array', () => {
    expect(Array.isArray(VIDEO_COURSES)).toBe(true);
    expect(VIDEO_COURSES).toHaveLength(2);
  });

  it('uses the two bundled local TikTok MP4 files', () => {
    expect(VIDEO_COURSES.map(c => c.src)).toEqual([
      '/videos/tiktok-elab-1.mp4',
      '/videos/tiktok-elab-2.mp4',
    ]);
    expect(VIDEO_COURSES.every(c => c.type === 'local')).toBe(true);
    expect(VIDEO_COURSES.every(c => c.youtubeId == null)).toBe(true);
  });

  it('every course has required fields', () => {
    for (const course of VIDEO_COURSES) {
      expect(course.id).toBeTruthy();
      expect(course.title).toBeTruthy();
      expect(course.description).toBeTruthy();
      expect(course.volumeId).toBeTruthy();
      expect(course.volumeLabel).toBeTruthy();
      expect(course.src).toMatch(/^\/videos\/tiktok-elab-[12]\.mp4$/);
      expect(course.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(typeof course.order).toBe('number');
    }
  });

  it('all IDs are unique', () => {
    const ids = VIDEO_COURSES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('orders are sequential', () => {
    const orders = VIDEO_COURSES.map(c => c.order);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBeGreaterThan(orders[i - 1]);
    }
  });

  it('uses ELAB homepage video labels in order', () => {
    expect(VIDEO_COURSES.map(c => c.title)).toEqual([
      'Videolezione ELAB 1',
      'Videolezione ELAB 2',
    ]);
  });
});
