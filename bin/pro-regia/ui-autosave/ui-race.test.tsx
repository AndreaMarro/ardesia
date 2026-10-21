import { afterEach, expect, test, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Exam } from '@ardesia-exam-under-test';

const runtime = JSON.parse(readFileSync(process.env.ARDESIA_PROBE_RUNTIME_JSON!, 'utf8'));
const { baseUrl: base, cookie } = runtime;
const source = JSON.parse(readFileSync(process.env.ARDESIA_PROBE_SOURCE_METADATA!, 'utf8'));
const output = process.env.ARDESIA_PROBE_OUTPUT_DIR!;
const realFetch = globalThis.fetch;
const workspace = { edition: { id: 'probe-edition', title: 'Synthetic review', teacherId: 'probe-tutor', capacity: 10, priceMinor: 0, state: 'running', sessions: [], timezone: 'Europe/Rome' }, enrolled: true, resources: [], submissions: [], layouts: [], layoutSaved: false, layoutVersion: 'v1' } as any;

async function request(path: string, options: RequestInit = {}) {
  // Adapt same-origin browser transport to the loopback-only real API.
  // No response, grading, persistence, or request body is mocked.
  const { signal: _signal, ...rest } = options;
  return realFetch(base + path, { ...rest, headers: { ...Object.fromEntries(new Headers(options.headers)), cookie } });
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test('newest answer remains persisted after an older autosave arrives late', async () => {
  let releaseFirst!: () => void;
  const held = new Promise<void>((resolve) => { releaseFirst = resolve; });
  let notifySecond!: () => void;
  const secondStarted = new Promise<void>((resolve) => { notifySecond = resolve; });
  const puts: { index: number, answers: Record<string, unknown>, completed: boolean }[] = [];
  const completionOrder: number[] = [];
  let attempt: any;
  vi.stubGlobal('fetch', vi.fn(async (path: string, options: RequestInit = {}) => {
    const method = options.method ?? 'GET';
    if (path.endsWith('/answers') && method === 'PUT') {
      const entry = { index: puts.length, answers: JSON.parse(String(options.body)).answers, completed: false };
      puts.push(entry);
      if (entry.index === 1) notifySecond();
      if (entry.index === 0) await held;
      const response = await request(path, options);
      entry.completed = true;
      completionOrder.push(entry.index);
      return response;
    }
    const response = await request(path, options);
    if (path === '/study/exams' && method === 'POST') attempt = await response.clone().json();
    return response;
  }));

  let rendered = render(<Exam data={workspace} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Inizia la prova' }));
  await waitFor(() => expect(attempt?.id).toBeTruthy());
  const question = attempt.questions.findIndex((q: any) => q.id === 'fis-mecc-01');
  fireEvent.click(await screen.findByRole('button', { name: `Domanda ${question + 1}`, exact: true }));
  fireEvent.click(screen.getAllByRole('radio')[0]);
  await waitFor(() => expect(puts.length).toBe(1), { timeout: 2500 });
  fireEvent.click(screen.getAllByRole('radio')[1]);
  // Concurrent requests are a reproduction mechanism, not a required design.
  // A valid queue may wait for the first ACK before sending the newer choice.
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let secondWasConcurrent = false;
  await act(async () => {
    secondWasConcurrent = await Promise.race([
      secondStarted.then(() => true),
      new Promise<boolean>((resolve) => { deadline = setTimeout(() => resolve(false), 1100); }),
    ]);
  });
  clearTimeout(deadline);
  if (secondWasConcurrent) {
    await waitFor(() => expect(puts[1].completed).toBe(true));
  }
  await act(async () => { releaseFirst(); });
  await waitFor(() => expect(puts[0].completed).toBe(true));
  await waitFor(() => expect(puts.length).toBe(2), { timeout: 2500 });
  await waitFor(() => expect(puts[1].completed).toBe(true));
  await screen.findByText('Risposte salvate');
  const beforeReopen = await (await request(`/study/exams/${attempt.id}`)).json();
  const selectedBeforeReopen = (screen.getAllByRole('radio')[1] as HTMLInputElement).checked;
  rendered.unmount();
  rendered = render(<Exam data={workspace} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Riprendi la prova' }));
  fireEvent.click(await screen.findByRole('button', { name: new RegExp(`^Domanda ${question + 1}(,|$)`) }));
  const selectedAfterReopen = (screen.getAllByRole('radio')[1] as HTMLInputElement).checked;
  const observed = {
    ...source,
    runtime: 'Actual Exam.tsx + apiClient; React/jsdom; actual loopback FastAPI and SQLite. Transport adapter injects ordering only; no backend responses mocked.',
    transportPath: secondWasConcurrent ? 'concurrent_second_commits_before_first' : 'first_released_then_queued_second',
    questionId: 'fis-mecc-01', newestChoice: 1, completionOrder, puts,
    uiSaidSaved: true, newestSelectedBeforeReopen: selectedBeforeReopen,
    persistedChoice: beforeReopen.answers['fis-mecc-01'], newestSelectedAfterReopen: selectedAfterReopen,
    expectedPersistedChoice: 1,
  };
  writeFileSync(join(output, 'observed.json'), JSON.stringify(observed, null, 2) + '\n');
  expect(selectedBeforeReopen).toBe(true);
  expect(beforeReopen.answers['fis-mecc-01']).toBe(1);
  expect(selectedAfterReopen).toBe(true);
});
