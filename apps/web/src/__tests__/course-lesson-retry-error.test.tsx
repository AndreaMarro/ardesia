// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SubmissionPanel } from '../../../studio/src/study/SubmissionPanel';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test.each(['parent_course_lesson_mismatch', 'stale_course_lesson'])(
  'a definitive %s rejection cannot silently detach the correction from its parent',
  async error => {
    const cache = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => cache.get(key) ?? null,
      setItem: (key: string, value: string) => cache.set(key, value),
      removeItem: (key: string) => cache.delete(key),
    });
    const calls: { parentId: string | null; text: string; courseLesson: unknown }[] = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      calls.push(JSON.parse(init.body as string));
      return new Response(JSON.stringify({ error }), { status: 409 });
    }));
    const courseLesson = {
      lessonRef: { id: 'synthetic-lesson', version: 1, sha256: 'a'.repeat(64) },
      phase: 'practice' as const,
    };
    render(<SubmissionPanel
      me={{ id: 'synthetic-correction-student', role: 'student', synthetic: true }}
      editionId="mechanics" activityId="hooke-v1" courseLesson={courseLesson}
      parentId="original-attempt" parentScopeStrict source={null}
      activityReady requireProcedure onUpdate={async () => {}}
    />);
    const explanation = 'Procedimento sintetico: correggo il tentativo originale.';
    fireEvent.change(screen.getByLabelText('La tua spiegazione'), { target: { value: explanation } });
    fireEvent.click(screen.getByRole('button', { name: 'Consegna' }));
    await screen.findByText(/La lezione o la fase non corrisponde/);

    expect(screen.getByRole('heading', { name: 'Nuovo tentativo' })).toBeTruthy();
    expect(screen.getByLabelText('La tua spiegazione')).toHaveProperty('value', explanation);
    fireEvent.click(screen.getByRole('button', { name: 'Consegna' }));
    await waitFor(() => expect(calls).toHaveLength(2));

    expect(calls[0]).toMatchObject({ parentId: 'original-attempt', text: explanation, courseLesson });
    expect(calls[1]).toMatchObject({ parentId: 'original-attempt', text: explanation, courseLesson });
  },
);
