// @vitest-environment jsdom
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { installPublicBrowserStorage } from './public-storage-fixture';

const edition = { id: 'composition-course', teacherId: 'synthetic-teacher', capacity: 10,
  priceMinor: null, state: 'confirmed', sessions: [], timezone: 'Europe/Rome',
  title: 'Corso di composizione', courseId: 'fisica-semestre-filtro',
  packId: 'fisica-semestre-filtro', packVersion: 1, packSha256: 'a'.repeat(64),
  subject: 'Fisica', duration: 'DRAFT' };
const json = (value: unknown) => new Response(JSON.stringify(value));

function serve(role: 'student' | 'teacher', enrolled: boolean | null) {
  installPublicBrowserStorage();
  vi.stubGlobal('scrollTo', vi.fn());
  const me = { id: 'synthetic-' + role, role, synthetic: true };
  const fetch = vi.fn(async (path: string, options: RequestInit = {}) => {
    if (path === '/study/me') return json(me);
    if (path === '/study/session' && options.method === 'DELETE') return json({ ok: true });
    if (path.startsWith('/study/editions?')) return json({ items: enrolled === null ? [] : [edition], nextCursor: null });
    if (path.startsWith('/study/workspace?')) return json({ edition, enrolled,
      resources: [], submissions: [], layouts: [], layoutSaved: false, layoutVersion: 'layout' });
    if (path === '/study/memory') return json({ notes: [], nodes: [], edges: [], limits: [] });
    if (path.startsWith('/study/diary?')) return json({ threads: [], confirmedOpenCount: 0, candidateCount: 0 });
    if (path.startsWith('/study/learning-insights?')) return json({
      schemaVersion: 1, editionId: edition.id, role, attempts: [], suggestions: [], comparisons: [],
      recoveries: [], optionalEvents: [], cohortSuppressed: role === 'teacher', summary: null,
      preferences: { enabled: false, consentId: null, noticeVersion: null, notice: null, essentialStudyAvailable: true }, limits: [],
    });
    if (path === '/study/course') return json({ ...edition, scope: 'DRAFT pubblico' });
    if (path === '/study/health') return json({ capabilities: { invitationCodes: false } });
    throw Error('unexpected_composition_path:' + path);
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

// Keep the route assertions independent of first-time vendor module compilation.
beforeAll(async () => {
  await Promise.all([
    import('../features/learning-memory/MemoryView'),
    import('../features/learning-insights/LearningInsights'),
    import('../features/Work'),
  ]);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); history.replaceState(null, '', '/'); });

test.each([
  ['student', null], ['teacher', null], ['student', true], ['teacher', true],
] as const)('personal memory is mounted for %s with enrollment %s and preserves study availability', async (role, enrolled) => {
  history.replaceState(null, '', '/?view=memory');
  const fetch = serve(role, enrolled);
  render(<App />);
  await screen.findByText('Nessuna idea salvata.');
  expect(screen.getByRole('heading', { name: 'Memoria delle idee.' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Memoria delle idee' }).getAttribute('aria-current')).toBe('page');
  expect(fetch.mock.calls.some(([path]) => path === '/study/memory')).toBe(true);
  if (role === 'student' && enrolled) {
    await screen.findByRole('button', { name: 'Studio autonomo' });
  } else {
    expect(screen.queryByRole('button', { name: 'Studio autonomo' })).toBeNull();
  }
});

test.each([['teacher', true], ['student', false]] as const)(
  'a direct independent-study route remains guarded for %s enrolled %s', async (role, enrolled) => {
    history.replaceState(null, '', '/?view=independent-study&edition=' + edition.id);
    const fetch = serve(role, enrolled);
    render(<App />);
    if (role === 'teacher') await screen.findByRole('heading', { name: 'Diamo forma alla prossima lezione.' });
    else await screen.findByText('L’accesso a questa edizione è cambiato. Rileggi i tuoi corsi.');
    expect(screen.queryByRole('button', { name: 'Studio autonomo' })).toBeNull();
    expect(fetch.mock.calls.some(([path]) => path.includes('/independent-study'))).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Memoria delle idee' }));
    await screen.findByText('Nessuna idea salvata.');
  },
);

test('canonical work mounts receipt insights without enabling optional collection', async () => {
  history.replaceState(null, '', '/?view=work&edition=' + edition.id);
  const fetch = serve('student', true);
  render(<App />);
  await screen.findByRole('heading', { name: 'Quello che hai provato.' });
  await screen.findByText('Raccolta non attiva: l’informativa per questa finalità non è configurata.');
  expect(screen.getByRole('button', { name: 'Consegne e feedback' })).toBeTruthy();
  const checkbox = screen.getByRole('checkbox', { name: 'Condividi osservazioni d’uso facoltative' }) as HTMLInputElement;
  expect(checkbox.checked).toBe(false);
  expect(checkbox.disabled).toBe(true);
  expect(fetch.mock.calls.filter(([, options]) => ['POST', 'PUT'].includes(options?.method ?? ''))).toEqual([]);
});

test('logout removes the mounted personal memory and its navigation', async () => {
  history.replaceState(null, '', '/?view=memory');
  serve('student', null);
  render(<App />);
  await screen.findByText('Nessuna idea salvata.');
  fireEvent.click(screen.getByRole('button', { name: /Esci dall’account/ }));
  await screen.findByRole('button', { name: 'Accedi al tuo spazio' });
  await waitFor(() => expect(screen.queryByRole('heading', { name: 'Memoria delle idee.' })).toBeNull());
  expect(screen.queryByRole('button', { name: 'Memoria delle idee' })).toBeNull();
});
