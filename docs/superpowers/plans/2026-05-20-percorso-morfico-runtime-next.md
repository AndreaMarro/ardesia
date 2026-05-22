# Percorso Morfico Runtime Next Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trasformare il pannello Percorso da consumer morfico a nodo operativo con segnali live reali provenienti da chat, azioni, montaggio, latenza, screenshot/audio e memoria, preservando Principio Zero v3.

**Architecture:** Il pannello `PercorsoCapitoloView` resta il centro della regia didattica e continua a consumare `elab:percorso-live-signal`. I producer esterni emettono segnali piccoli, tipizzati e non invasivi; il pannello decide come comprimerli/espanderli in regia, budget testo e numero slide.

**Tech Stack:** React 19, Vite, Vitest, Testing Library, Playwright, localStorage/event bus browser, Supabase runtime context gia presente.

---

## File Structure

- Modify: `src/components/lavagna/PercorsoCapitoloView.jsx`
  - Responsabilita: consumer live, rendering regia, budget output.
- Modify: `src/components/lavagna/PercorsoCapitoloView.module.css`
  - Responsabilita: leggibilita LIM/tablet della regia live.
- Modify: `tests/unit/lavagna/PercorsoCapitoloView.test.jsx`
  - Responsabilita: test consumer e regressioni Principio Zero.
- Create: `src/services/percorsoLiveSignalBus.js`
  - Responsabilita: API unica per emettere/persistire segnali live senza duplicare stringhe evento/storage.
- Create: `src/services/percorsoLiveSignalBus.test.js`
  - Responsabilita: normalizzazione evento/storage, limiti, defensive behavior.
- Modify only if allowed by Andrea: `src/components/lavagna/GalileoAdapter.jsx`
  - Responsabilita: producer chat Percorso.
- Modify only if allowed by Andrea: `src/components/lavagna/useGalileoChat.js`
  - Responsabilita: producer latenza e risposta chat.
- Modify only if allowed by Andrea: `src/services/simulator-api.js`
  - Responsabilita: producer action/mounting da azioni simulatore.
- Modify only if allowed by Andrea: `src/services/voiceService.js`
  - Responsabilita: producer audio/voice.
- Create: `tests/unit/lavagna/percorsoLiveSignalIntegration.test.jsx`
  - Responsabilita: prova end-to-end unit del bus verso pannello.
- Create: `tests/e2e/08-percorso-live-morphic-panel.spec.js`
  - Responsabilita: browser smoke locale del pannello Percorso con segnali live in pagina.

## Task 1: Extract Live Signal Bus

**Files:**
- Create: `src/services/percorsoLiveSignalBus.js`
- Create: `src/services/percorsoLiveSignalBus.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/services/percorsoLiveSignalBus.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PERCORSO_LIVE_SIGNAL_EVENT,
  emitPercorsoLiveSignal,
  readPercorsoLiveSignals,
} from './percorsoLiveSignalBus.js';

describe('percorsoLiveSignalBus', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('emette evento live e persiste segnale per capitolo', () => {
    const listener = vi.fn();
    window.addEventListener(PERCORSO_LIVE_SIGNAL_EVENT, listener);

    emitPercorsoLiveSignal({
      capitoloId: 'v1-cap6',
      source: 'text',
      value: 'LED non si accende',
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toMatchObject({
      source: 'text',
      value: 'LED non si accende',
    });
    expect(readPercorsoLiveSignals('v1-cap6')).toEqual([
      expect.objectContaining({ source: 'text', value: 'LED non si accende' }),
    ]);

    window.removeEventListener(PERCORSO_LIVE_SIGNAL_EVENT, listener);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/services/percorsoLiveSignalBus.test.js
```

Expected: FAIL because `src/services/percorsoLiveSignalBus.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
// src/services/percorsoLiveSignalBus.js
export const PERCORSO_LIVE_SIGNAL_EVENT = 'elab:percorso-live-signal';
const PERCORSO_SIGNAL_LIMIT = 12;

function safeStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readJsonArray(storage, key) {
  try {
    const raw = storage?.getItem?.(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJsonArray(storage, key, value) {
  try {
    storage?.setItem?.(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function readPercorsoLiveSignals(capitoloId = null) {
  const storage = safeStorage();
  const key = capitoloId ? `elab-percorso-live-signals:${capitoloId}` : 'elab-percorso-live-signals';
  return readJsonArray(storage, key);
}

export function emitPercorsoLiveSignal(signal = {}) {
  const normalized = {
    source: String(signal.source || 'message'),
    value: String(signal.value || signal.text || signal.summary || '').trim(),
    latencyMs: Number.isFinite(Number(signal.latencyMs)) ? Number(signal.latencyMs) : undefined,
    at: signal.at || Date.now(),
  };
  const storage = safeStorage();
  const key = signal.capitoloId ? `elab-percorso-live-signals:${signal.capitoloId}` : 'elab-percorso-live-signals';
  const next = [...readJsonArray(storage, key), normalized].slice(-PERCORSO_SIGNAL_LIMIT);
  writeJsonArray(storage, key, next);
  globalThis.dispatchEvent?.(new CustomEvent(PERCORSO_LIVE_SIGNAL_EVENT, { detail: normalized }));
  return normalized;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/services/percorsoLiveSignalBus.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/percorsoLiveSignalBus.js src/services/percorsoLiveSignalBus.test.js
git commit -m "feat(lavagna): add Percorso live signal bus"
```

## Task 2: Refactor Percorso Panel to Use Bus Constants

**Files:**
- Modify: `src/components/lavagna/PercorsoCapitoloView.jsx`
- Modify: `tests/unit/lavagna/PercorsoCapitoloView.test.jsx`

- [ ] **Step 1: Write failing import expectation**

Add this assertion to `tests/unit/lavagna/PercorsoCapitoloView.test.jsx`:

```js
it('usa il canale live centralizzato del percorso', async () => {
  const { PERCORSO_LIVE_SIGNAL_EVENT } = await import('../../../src/services/percorsoLiveSignalBus.js');
  render(<PercorsoCapitoloView capitolo={capitolo} morphicContext={expertContext} />);

  act(() => {
    window.dispatchEvent(new CustomEvent(PERCORSO_LIVE_SIGNAL_EVENT, {
      detail: { source: 'audio', value: 'domanda vocale sul LED' },
    }));
  });

  expect(screen.getByTestId('percorso-live-regia')).toHaveTextContent(/audio/i);
  expect(screen.getByTestId('percorso-live-next-action')).toHaveTextContent(/Ragazzi,/i);
});
```

- [ ] **Step 2: Run test to verify current behavior**

Run:

```bash
npx vitest run tests/unit/lavagna/PercorsoCapitoloView.test.jsx -t "canale live centralizzato"
```

Expected: PASS after Task 1 exists, but source still has duplicated event constant.

- [ ] **Step 3: Replace local event constant with import**

In `src/components/lavagna/PercorsoCapitoloView.jsx`, replace:

```js
const PERCORSO_LIVE_SIGNAL_EVENT = 'elab:percorso-live-signal';
```

with:

```js
import { PERCORSO_LIVE_SIGNAL_EVENT } from '../../services/percorsoLiveSignalBus.js';
```

- [ ] **Step 4: Run panel tests**

Run:

```bash
npx vitest run tests/unit/lavagna/PercorsoCapitoloView.test.jsx
```

Expected: 13 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/lavagna/PercorsoCapitoloView.jsx tests/unit/lavagna/PercorsoCapitoloView.test.jsx
git commit -m "refactor(lavagna): centralize Percorso live event contract"
```

## Task 3: Producer From Percorso Chat Text

**Files:**
- Modify only if allowed: `src/components/lavagna/GalileoAdapter.jsx`
- Test: `tests/unit/lavagna/GalileoAdapter-mode-tabs.test.jsx`

- [ ] **Step 1: Write failing test**

Add a test that renders Percorso tab, types in the Percorso input, submits, and expects a live signal:

```js
it('emette segnale live text quando si scrive nel percorso', async () => {
  const signals = [];
  window.addEventListener('elab:percorso-live-signal', (event) => signals.push(event.detail));

  await renderMode('percorso');
  const input = await screen.findByLabelText(/Scrivi messaggio a UNLIM nel percorso/i);
  fireEvent.change(input, { target: { value: 'Il LED non si accende' } });
  fireEvent.submit(screen.getByRole('form', { name: /Scrivi a UNLIM nel percorso/i }));

  await waitFor(() => {
    expect(signals.some((signal) => signal.source === 'text' && /LED non si accende/i.test(signal.value))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run tests/unit/lavagna/GalileoAdapter-mode-tabs.test.jsx -t "segnale live text"
```

Expected: FAIL because no live signal is emitted yet.

- [ ] **Step 3: Emit live signal on Percorso submit**

In `src/components/lavagna/GalileoAdapter.jsx`, import:

```js
import { emitPercorsoLiveSignal } from '../../services/percorsoLiveSignalBus.js';
```

Inside the Percorso submit handler, before/after the existing send logic:

```js
emitPercorsoLiveSignal({
  capitoloId: currentCapitolo?.id || experiment?.chapterId || null,
  source: 'text',
  value: percorsoInput,
});
```

- [ ] **Step 4: Run tests**

Run:

```bash
npx vitest run tests/unit/lavagna/GalileoAdapter-mode-tabs.test.jsx
npx vitest run tests/unit/lavagna/PercorsoCapitoloView.test.jsx
```

Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/lavagna/GalileoAdapter.jsx tests/unit/lavagna/GalileoAdapter-mode-tabs.test.jsx
git commit -m "feat(lavagna): feed Percorso live signals from chat text"
```

## Task 4: Producer From Latency

**Files:**
- Modify only if allowed: `src/components/lavagna/useGalileoChat.js`
- Test: `tests/unit/lavagna/useGalileoChatFastPath.test.jsx`

- [ ] **Step 1: Write failing test**

Add a test around the slow async send path:

```js
it('emette segnale live latency quando la risposta supera soglia aula', async () => {
  vi.useFakeTimers();
  const signals = [];
  window.addEventListener('elab:percorso-live-signal', (event) => signals.push(event.detail));

  // Arrange the existing hook/sendChat mock so a request remains pending > 1200ms.
  // Use the same renderHook helper already present in this file.

  // Act: submit a chat request, advance timers by 1300ms, resolve request.

  expect(signals.some((signal) => signal.source === 'latency' && signal.latencyMs >= 1200)).toBe(true);
  vi.useRealTimers();
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npx vitest run tests/unit/lavagna/useGalileoChatFastPath.test.jsx -t "latency"
```

Expected: FAIL until signal is emitted.

- [ ] **Step 3: Implement latency emission**

In `useGalileoChat.js`, import `emitPercorsoLiveSignal`. Around the network call, capture:

```js
const startedAt = performance.now();
```

After response/error:

```js
const latencyMs = Math.round(performance.now() - startedAt);
if (latencyMs >= 1200) {
  emitPercorsoLiveSignal({
    source: 'latency',
    latencyMs,
    value: `${latencyMs} ms`,
  });
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/unit/lavagna/useGalileoChatFastPath.test.jsx
npx vitest run tests/unit/lavagna/PercorsoCapitoloView.test.jsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/lavagna/useGalileoChat.js tests/unit/lavagna/useGalileoChatFastPath.test.jsx
git commit -m "feat(lavagna): feed Percorso live signals from chat latency"
```

## Task 5: Browser E2E for Panel Consumer

**Files:**
- Create: `tests/e2e/08-percorso-live-morphic-panel.spec.js`

- [ ] **Step 1: Write E2E spec**

```js
import { test, expect } from '@playwright/test';
import { gotoLavagna } from './helpers/welcome-gate-bypass.js';

const BASE_URL = process.env.ELAB_BASE_URL || 'http://127.0.0.1:5177';

test('Percorso panel reacts to live signals without changing canon', async ({ page }) => {
  await gotoLavagna(page, `${BASE_URL}/#lavagna`);

  await page.evaluate(() => {
    window.localStorage.setItem('elab-teacher-anon-uuid', 'e2e-teacher');
    window.localStorage.setItem('elab-class-key', 'e2e-class');
    window.localStorage.setItem('elab-morphic-teacher-profile:e2e-teacher', JSON.stringify({ experience: 'first_year' }));
    window.localStorage.setItem('elab-morphic-class-profile:e2e-class', JSON.stringify({ age: 8, kit: 'base', competence: 'novice' }));
    window.localStorage.setItem('elab-percorso-session-state', 'costruzione');
  });

  const percorsoRoot = page.getByTestId('percorso-morphic-root');
  const hasPanel = await percorsoRoot.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!hasPanel, 'Percorso panel not reachable in this local flow yet');

  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('elab:percorso-live-signal', {
      detail: { source: 'mounting', value: 'LED invertito su breadboard' },
    }));
  });

  await expect(page.getByTestId('percorso-live-regia')).toContainText('montaggio');
  await expect(page.getByTestId('percorso-live-next-action')).toContainText('Ragazzi,');
  await expect(page.getByTestId('percorso-live-next-action')).toContainText('kit fisico ELAB');
  await expect(page.getByTestId('percorso-writing-budget')).toContainText(/frasi?/);
  await expect(page.getByTestId('percorso-slide-budget')).toContainText('slide');
});
```

- [ ] **Step 2: Run E2E locally**

Start dev server:

```bash
npm run dev -- --host 127.0.0.1 --port 5177
```

Run:

```bash
ELAB_BASE_URL=http://127.0.0.1:5177 npx playwright test --config tests/e2e/playwright.config.js tests/e2e/08-percorso-live-morphic-panel.spec.js
```

Expected: PASS or SKIP only if current UI cannot reach panel under bypass. If SKIP, document exact blocker.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/08-percorso-live-morphic-panel.spec.js
git commit -m "test(e2e): cover Percorso live morphic panel"
```

## Final Verification

Run:

```bash
npx vitest run tests/unit/lavagna/PercorsoCapitoloView.test.jsx
npx vitest run tests/unit/lavagna
npx vitest run --coverage --coverage.include=src/components/lavagna/PercorsoCapitoloView.jsx tests/unit/lavagna/PercorsoCapitoloView.test.jsx
npx vite build
```

Expected:

- Percorso panel tests PASS.
- Lavagna sweep PASS.
- Local panel coverage does not decrease below current baseline:
  - statements/lines >= 85.25%
  - branches >= 60.97%
  - functions >= 92.3%
- Build PASS.

## Self-Review

Spec coverage:

- Realtime context: covered by existing panel test and Task 2.
- What user writes: Task 3.
- What user does/actions: Task 1 bus plus future producer from simulator API.
- How user mounts: future producer from simulator API.
- Latency: Task 4.
- Screenshot/audio: bus supports both; producer tasks remain to be written after locating exact capture modules.
- Past lessons: bus supports memory; next producer should connect session tracker/Supabase only after privacy review.
- Principio Zero v3: preserve in every test assertion.

Known gaps:

- Exact producer implementation for screenshot/OCR and audio depends on current capture components and should be scoped after locating the owning files.
- Production E2E may remain blocked by auth/licence; do not fake success.
