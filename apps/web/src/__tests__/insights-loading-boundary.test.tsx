// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { installPublicBrowserStorage } from './public-storage-fixture';
const gate = vi.hoisted(() => {
  let release!: () => void;
  const ready = new Promise<void>(resolve => { release = resolve; });
  return { ready, release, pending: true };
});
vi.mock('../features/learning-insights/LearningInsights', () => ({
  LearningInsights: () => {
    if (gate.pending) throw gate.ready;
    return null;
  },
}));
import App from '../App';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); history.replaceState(null, '', '/'); });

test('canonical work stays reachable while the optional insights are suspended', async () => {
  history.replaceState(null, '', '/?view=work&edition=fluidi');
  installPublicBrowserStorage();
  const edition = { id: 'fluidi', teacherId: 'tutor', state: 'confirmed', sessions: [], timezone: 'Europe/Rome',
    title: 'Corso sintetico', packId: 'fisica-semestre-filtro', packVersion: 1, packSha256: 'a'.repeat(64) };
  vi.stubGlobal('fetch', vi.fn(async (path: string) => new Response(JSON.stringify(
    path === '/study/me' ? { id: 'student', role: 'student', synthetic: true }
    : path.startsWith('/study/editions?') ? { items: [edition], nextCursor: null }
    : path.startsWith('/study/diary?') ? { threads: [], confirmedOpenCount: 0, candidateCount: 0 }
    : { edition, enrolled: true, resources: [], submissions: [], layouts: [], layoutSaved: false, layoutVersion: 'layout' },
  ))));
  await import('../features/Work');
  render(<App />);
  try {
    // Only Insights is intentionally suspended. Settle Work's lazy import
    // before asserting its availability, independently of compiler load.
    await act(async () => { await vi.dynamicImportSettled(); });
    await screen.findByRole('button', { name: 'Consegne e feedback' });
    expect(screen.getByText('Apro le evidenze del corso…')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Quello che hai provato.' })).toBeNull();
  } finally {
    gate.pending = false;
    gate.release();
  }
});
