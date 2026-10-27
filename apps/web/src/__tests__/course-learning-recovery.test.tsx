// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CourseLearningWorkspace } from '../components/CourseLearningWorkspace';
import { learningCourses } from '../courseLearning';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); history.replaceState(null, '', '/'); });

test('a transient course load failure can recover the exact requested lesson and phase', async () => {
  const course = learningCourses.courses.find(c => c.pathId === 'strumenti-meccanica')!;
  const lesson = course.lessons.find(l => l.activityId === 'kinematics-v1')!;
  const courseLesson = { lessonRef: lesson.lessonRef, phase: 'transfer' as const };
  const onCommit = vi.fn();
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'unavailable' }), { status: 503 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ course })));
  vi.stubGlobal('fetch', fetch);
  render(<CourseLearningWorkspace editionId="mechanics" onCommit={onCommit}
    initialActivityId={lesson.activityId} initialCourseLesson={courseLesson} />);

  await screen.findByRole('alert');
  expect(screen.queryByRole('heading', { name: lesson.title })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Riprova' }));
  await screen.findByRole('heading', { name: lesson.title });
  expect(screen.getByText(lesson.transfer.prompt)).toBeTruthy();
  expect(fetch.mock.calls.map(call => call[0])).toEqual([
    '/study/course-learning?editionId=mechanics', '/study/course-learning?editionId=mechanics',
  ]);
  fireEvent.change(screen.getByLabelText('La tua previsione numerica'), { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confronta la previsione' }));
  expect(onCommit).toHaveBeenLastCalledWith(expect.objectContaining({
    courseLesson, parameters: lesson.transfer.parameters,
  }));
});

test('a late recovery response from the previous edition cannot replace the current course', async () => {
  const oldCourse = learningCourses.courses.find(c => c.pathId === 'strumenti-meccanica')!;
  const currentCourse = learningCourses.courses.find(c => c.pathId === 'elettricita-magnetismo')!;
  let resolveOld!: (response: Response) => void;
  const pending = new Promise<Response>(resolve => { resolveOld = resolve; });
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'unavailable' }), { status: 503 }))
    .mockReturnValueOnce(pending)
    .mockResolvedValueOnce(new Response(JSON.stringify({ course: currentCourse })));
  vi.stubGlobal('fetch', fetch);
  const onCommit = vi.fn();
  const view = render(<CourseLearningWorkspace editionId="mechanics" onCommit={onCommit} />);
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Riprova' }));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  const oldSignal = (fetch.mock.calls[1][1] as RequestInit).signal!;

  view.rerender(<CourseLearningWorkspace editionId="electrical" onCommit={onCommit} />);
  await screen.findByRole('heading', { name: currentCourse.title, level: 1 });
  expect(oldSignal.aborted).toBe(true);
  await act(async () => { resolveOld(new Response(JSON.stringify({ course: oldCourse }))); });
  expect(screen.getByRole('heading', { name: currentCourse.title, level: 1 })).toBeTruthy();
  expect(screen.queryByRole('heading', { name: oldCourse.title, level: 1 })).toBeNull();
  expect(onCommit).toHaveBeenLastCalledWith(null);
});
