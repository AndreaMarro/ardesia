// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CourseScope } from '../features/PublicCoursePlayer';
import { CourseLearningWorkspace } from '../components/CourseLearningWorkspace';
import { learningCourses } from '../courseLearning';
import { SubmissionPanel } from '../../../studio/src/study/SubmissionPanel';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); history.replaceState(null, '', '/'); });
function fixture() {
  const course = structuredClone(learningCourses.courses.find(c => c.pathId === 'strumenti-meccanica')!);
  const first = course.lessons.find(l => l.activityId === 'hooke-v1')!;
  const second = structuredClone(first);
  second.id = 'second-hooke'; second.title = 'Seconda lezione della molla';
  second.lessonRef = { id: second.id, version: 1, sha256: 'b'.repeat(64) };
  course.lessons.push(second);
  return { course, first, second };
}

test('retry opens the exact lesson and transfer phase when two lessons share the model', () => {
  const { course, second } = fixture(), onCommit = vi.fn();
  const courseLesson = { lessonRef: second.lessonRef, phase: 'transfer' as const };
  render(<CourseScope course={course} allowLocalDrafts={false} initialActivityId="hooke-v1" initialCourseLesson={courseLesson} onCommit={onCommit} />);
  expect(screen.getByRole('heading', { name: second.title })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('La tua previsione numerica'), { target: { value: '0.2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confronta la previsione' }));
  expect(onCommit).toHaveBeenLastCalledWith(expect.objectContaining({ courseLesson, parameters: second.transfer.parameters }));
});

test('clearing an acknowledged retry target preserves the exact lesson and transfer phase', async () => {
  const { course, second } = fixture(), onCommit = vi.fn();
  const courseLesson = { lessonRef: second.lessonRef, phase: 'transfer' as const };
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ course }))));
  const view = render(<CourseLearningWorkspace editionId="mechanics" onCommit={onCommit}
    initialActivityId="hooke-v1" initialCourseLesson={courseLesson} />);
  await screen.findByRole('heading', { name: second.title });

  // Acknowledgement clears the parent command in App, not the reader position.
  view.rerender(<CourseLearningWorkspace editionId="mechanics" onCommit={onCommit} />);
  expect(screen.getByRole('heading', { name: second.title })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('La tua previsione numerica'), { target: { value: '0.2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confronta la previsione' }));
  expect(onCommit).toHaveBeenLastCalledWith(expect.objectContaining({
    courseLesson, parameters: second.transfer.parameters,
  }));
});

test.each(['missing', 'stale', 'version', 'legacy-ambiguous', 'legacy-single'] as const)('explicit %s retry never silently substitutes a lesson', kind => {
  const { course, second } = fixture();
  const ref = { ...second.lessonRef,
    ...(kind === 'missing' ? { id: 'absent' } : {}),
    ...(kind === 'stale' ? { sha256: 'c'.repeat(64) } : {}),
    ...(kind === 'version' ? { version: 2 } : {}),
  };
  if (kind === 'legacy-single') course.lessons = [second];
  render(<CourseScope course={course} allowLocalDrafts={false} initialActivityId="hooke-v1"
    initialCourseLesson={kind.startsWith('legacy-') ? undefined : { lessonRef: ref, phase: 'practice' }} />);
  expect(screen.getByRole('heading', { name: 'Riferimento non disponibile' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Confronta la previsione' })).toBeNull();
});

test('a lost response retries the original exact lesson and phase after the reader changes', async () => {
  const { first, second } = fixture(), cache = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => cache.get(key) ?? null, setItem: (key: string, value: string) => cache.set(key, value), removeItem: (key: string) => cache.delete(key) });
  const calls: { payload: unknown; key: string | null }[] = [];
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
    calls.push({ payload: JSON.parse(init.body as string), key: new Headers(init.headers).get('Idempotency-Key') });
    return new Response(JSON.stringify(calls.length === 1 ? { error: 'unavailable' } : { receiptId: 'ack-exact', revision: 1 }), { status: calls.length === 1 ? 503 : 200 });
  }));
  const common = { me: { id: 'synthetic', role: 'student' as const, synthetic: true as const }, editionId: 'mechanics', activityId: 'hooke-v1', source: null, parentId: null, onUpdate: async () => {} };
  const original = { lessonRef: first.lessonRef, phase: 'transfer' as const };
  const view = render(<SubmissionPanel {...common} courseLesson={original} />);
  fireEvent.change(screen.getByLabelText('La tua spiegazione'), { target: { value: 'Procedimento sintetico conservato.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Consegna' }));
  await screen.findByText(/Invio non ancora confermato/);
  view.rerender(<SubmissionPanel {...common} courseLesson={{ lessonRef: second.lessonRef, phase: 'practice' }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Consegna' }));
  await screen.findByText(/Consegnato · ricevuta ack-exact/);
  expect(calls[0].payload).toMatchObject({ courseLesson: original });
  expect(calls[1]).toEqual(calls[0]);
});
