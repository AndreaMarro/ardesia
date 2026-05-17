/**
 * tests/unit/components/lavagna/CompileUploadButton.test.jsx
 *
 * Iter 69 A3 — Unit tests for the Lavagna "Carica sul kit fisico" button.
 *
 * Covers:
 *   - Renders disabled + plurale tooltip when agent offline
 *   - Renders enabled when agent online + sketchCode + port present
 *   - Click POSTs to /compile-and-upload with correct body
 *   - Success callback fires with plurale confirmation message
 *   - Error category maps to canonical plurale message
 *   - Touch target ≥ 44x44 enforced (minHeight + minWidth styles)
 *   - ARIA attributes present (role / aria-label / aria-disabled / aria-busy)
 *   - getDocenteErrorMessage maps all canonical categories
 *
 * (c) Andrea Marro — 2026-05-16 — ELAB Tutor iter 69 A3
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import CompileUploadButton, {
  getDocenteErrorMessage,
  parseCompileStdout,
  DEMO_STATES,
} from '../../../../src/components/lavagna/CompileUploadButton.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeFetchOk(body = { ok: true, jobId: 'mock-1' }) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  });
}

function makeFetchErr(category = 'compile_failed') {
  return vi.fn().mockResolvedValue({
    ok: false,
    status: 422,
    json: async () => ({
      ok: false,
      error: { category, message: 'mock' },
    }),
  });
}

function makeFetchAbort() {
  const err = new Error('aborted');
  err.name = 'AbortError';
  return vi.fn().mockRejectedValue(err);
}

const statusOnline = async () => ({ available: true, port: 8765 });
const statusOffline = async () => ({ available: false, port: 8765, error: 'agent_offline' });

// ─────────────────────────────────────────────────────────────────────────────
// 1. Error message mapper
// ─────────────────────────────────────────────────────────────────────────────

describe('getDocenteErrorMessage', () => {
  it('maps port_missing to plurale + USB instruction', () => {
    const msg = getDocenteErrorMessage('port_missing');
    expect(msg).toMatch(/^Ragazzi,/);
    expect(msg).toMatch(/USB/);
  });

  it('maps compile_failed to plurale + codice mention', () => {
    const msg = getDocenteErrorMessage('compile_failed');
    expect(msg).toMatch(/^Ragazzi,/);
    expect(msg.toLowerCase()).toMatch(/codice/);
  });

  it('maps arduino_cli_absent to plurale + insegnante hint', () => {
    const msg = getDocenteErrorMessage('arduino_cli_absent');
    expect(msg).toMatch(/^Ragazzi,/);
    expect(msg).toMatch(/insegnante|installato/i);
  });

  it('maps upload_failed to plurale + reset double-tap instruction', () => {
    const msg = getDocenteErrorMessage('upload_failed');
    expect(msg).toMatch(/^Ragazzi,/);
    expect(msg.toLowerCase()).toMatch(/reset|nano r4/);
  });

  it('maps unknown category to default plurale message', () => {
    const msg = getDocenteErrorMessage('not_a_real_category');
    expect(msg).toMatch(/^Ragazzi,/);
  });

  it('maps undefined category to default plurale message', () => {
    const msg = getDocenteErrorMessage(undefined);
    expect(msg).toMatch(/^Ragazzi,/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Rendering states
// ─────────────────────────────────────────────────────────────────────────────

describe('CompileUploadButton — rendering', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('renders disabled when agent offline + tooltip plurale', async () => {
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOffline}
        fetchImpl={makeFetchOk()}
      />,
    );

    const btn = await screen.findByRole('button', {
      name: /Carica il programma sul kit fisico Nano R4/i,
    });

    await waitFor(() => expect(btn).toBeDisabled());
    expect(btn.getAttribute('title')).toMatch(/^Ragazzi,/);
    expect(btn.getAttribute('title')).toMatch(/agente locale/i);
    expect(btn.getAttribute('data-elab-agent-available')).toBe('false');
  });

  it('renders enabled when agent online + sketch + port', async () => {
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={makeFetchOk()}
      />,
    );

    const btn = await screen.findByRole('button', {
      name: /Carica il programma sul kit fisico Nano R4/i,
    });

    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );
    await waitFor(() => expect(btn).not.toBeDisabled());
  });

  it('disables when sketchCode missing even if agent online', async () => {
    render(
      <CompileUploadButton
        sketchCode=""
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={makeFetchOk()}
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );
    expect(btn).toBeDisabled();
  });

  it('disables when port missing even if agent online', async () => {
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port=""
        statusImpl={statusOnline}
        fetchImpl={makeFetchOk()}
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );
    expect(btn).toBeDisabled();
  });

  it('enforces touch target ≥44×44 (LIM compatibility)', async () => {
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={makeFetchOk()}
      />,
    );
    const btn = await screen.findByRole('button');
    expect(btn.style.minHeight).toBe('44px');
    expect(btn.style.minWidth).toBe('44px');
  });

  it('exposes ARIA attributes (label + aria-disabled when offline)', async () => {
    render(
      <CompileUploadButton
        sketchCode=""
        port=""
        statusImpl={statusOffline}
        fetchImpl={makeFetchOk()}
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() => expect(btn).toBeDisabled());
    expect(btn.getAttribute('aria-label')).toMatch(/kit fisico Nano R4/);
    expect(btn.getAttribute('aria-disabled')).toBe('true');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Click behavior — POST /compile-and-upload
// ─────────────────────────────────────────────────────────────────────────────

describe('CompileUploadButton — click flow', () => {
  it('POSTs to /compile-and-upload with sketchCode + port + boardId', async () => {
    const fetchSpy = makeFetchOk();
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        boardId="arduino-nano-r4"
        statusImpl={statusOnline}
        fetchImpl={fetchSpy}
        endpoint="http://localhost:8765/compile-and-upload"
      />,
    );

    const btn = await screen.findByRole('button');
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );

    fireEvent.click(btn);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('http://localhost:8765/compile-and-upload');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body);
    expect(body.sketchCode).toBe('void setup(){}void loop(){}');
    expect(body.port).toBe('/dev/cu.usb');
    expect(body.boardId).toBe('arduino-nano-r4');
  });

  it('calls onSuccess with plurale confirmation message', async () => {
    const fetchSpy = makeFetchOk({ ok: true, jobId: 'job-1' });
    const onSuccess = vi.fn();
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={fetchSpy}
        onSuccess={onSuccess}
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );

    fireEvent.click(btn);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    const arg = onSuccess.mock.calls[0][0];
    expect(arg.message).toMatch(/Caricato sul kit fisico Nano R4/);
    expect(arg.payload.jobId).toBe('job-1');
  });

  it('calls onError with mapped category on compile_failed', async () => {
    const fetchSpy = makeFetchErr('compile_failed');
    const onError = vi.fn();
    render(
      <CompileUploadButton
        sketchCode="invalid sketch"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={fetchSpy}
        onError={onError}
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );

    fireEvent.click(btn);

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    const arg = onError.mock.calls[0][0];
    expect(arg.category).toBe('compile_failed');
    expect(arg.message).toMatch(/^Ragazzi,/);
  });

  it('calls onError with port_missing when agent returns that category', async () => {
    const fetchSpy = makeFetchErr('port_missing');
    const onError = vi.fn();
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={fetchSpy}
        onError={onError}
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );

    fireEvent.click(btn);

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0][0].category).toBe('port_missing');
    expect(onError.mock.calls[0][0].message).toMatch(/USB/);
  });

  it('reports timeout when fetch aborts', async () => {
    const fetchSpy = makeFetchAbort();
    const onError = vi.fn();
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={fetchSpy}
        onError={onError}
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );

    fireEvent.click(btn);

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0][0].category).toBe('timeout');
    expect(onError.mock.calls[0][0].message).toMatch(/^Ragazzi,/);
  });

  it('does not POST when button is disabled (offline agent)', async () => {
    const fetchSpy = makeFetchOk();
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOffline}
        fetchImpl={fetchSpy}
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() => expect(btn).toBeDisabled());
    fireEvent.click(btn);
    // Disabled button should not invoke fetch
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Iter 76 D.1 — Demo-mode honest fallback (compile_only_no_board)
//
// Andrea iter 76 mandate (Riccardo Omaric demo without physical Nano R4).
// Verifies the state machine transitions, the honest HEX-bytes message
// render, the retry CTA, ARIA assertions (Codex iter 74 MED gap close),
// PRINCIPIO ZERO plurale, and the zero-emoji + ElabIcons guarantee.
// ─────────────────────────────────────────────────────────────────────────────

/** Build a fake /compile JSON response with a realistic arduino-cli stdout. */
function makeCompileOk({
  hexBytes = 39048,
  ramBytes = 3940,
  jobId = 'mock-compile-1',
} = {}) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      ok: true,
      jobId,
      sketchDir: '/tmp/sketch',
      buildDir: '/tmp/build',
      stdout:
        `Lo sketch usa ${hexBytes} byte (14%) dello spazio di archiviazione del programma. Il massimo e' 262144 byte.\n`
        + `Le variabili globali usano ${ramBytes} byte (12%) di memoria dinamica, lasciando 28828 byte per le variabili locali.`,
    }),
  });
}

/** Build a fake /compile JSON error response. */
function makeCompileErr(category = 'compile_failed') {
  return vi.fn().mockResolvedValue({
    ok: false,
    status: 422,
    json: async () => ({ ok: false, error: { category, message: 'mock' } }),
  });
}

/** WebUSB shim that simulates the user closing the picker (NotFoundError). */
function makeUsbNotFound() {
  const err = new Error('No device selected.');
  err.name = 'NotFoundError';
  return vi.fn().mockRejectedValue(err);
}

/** WebUSB shim that resolves to null (defensive — some browsers). */
function makeUsbNull() {
  return vi.fn().mockResolvedValue(null);
}

/** WebUSB shim that resolves to a stub device descriptor. */
function makeUsbDevice() {
  return vi.fn().mockResolvedValue({
    productName: 'Arduino Nano R4',
    vendorId: 0x2341,
  });
}

describe('parseCompileStdout (iter 76 D.1)', () => {
  it('extracts HEX bytes and RAM bytes from Italian arduino-cli stdout', () => {
    const stdout =
      "Lo sketch usa 39048 byte (14%) ...\nLe variabili globali usano 3940 byte (12%) ...";
    const r = parseCompileStdout(stdout);
    expect(r.hexBytes).toBe(39048);
    expect(r.ramBytes).toBe(3940);
  });

  it('extracts HEX bytes and RAM bytes from English arduino-cli stdout', () => {
    const stdout =
      "Sketch uses 12345 bytes (4%) of program storage space.\n"
      + "Global variables use 678 bytes (2%) of dynamic memory.";
    const r = parseCompileStdout(stdout);
    expect(r.hexBytes).toBe(12345);
    expect(r.ramBytes).toBe(678);
  });

  it('returns nulls for empty / undefined stdout', () => {
    expect(parseCompileStdout(undefined)).toEqual({ hexBytes: null, ramBytes: null });
    expect(parseCompileStdout('')).toEqual({ hexBytes: null, ramBytes: null });
    expect(parseCompileStdout(null)).toEqual({ hexBytes: null, ramBytes: null });
  });
});

describe('CompileUploadButton — demo-mode state machine (iter 76 D.1)', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  // T1 — state transitions: compile_success → null device → compile_only_no_board
  it('T1 transitions compile_success → compile_only_no_board when WebUSB returns null', async () => {
    const compileFetch = makeCompileOk();
    const usbPicker = makeUsbNull();
    const transitions = [];
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){pinMode(13,OUTPUT);}void loop(){digitalWrite(13,HIGH);delay(500);digitalWrite(13,LOW);delay(500);}"
        statusImpl={statusOnline}
        fetchImpl={compileFetch}
        requestUsbDevice={usbPicker}
        compileEndpoint="http://localhost:8765/compile"
        onDemoStateChange={(s) => transitions.push(s)}
      />,
    );

    const btn = await screen.findByRole('button', {
      name: /Carica il programma sul kit fisico Nano R4/i,
    });
    fireEvent.click(btn);

    await waitFor(() => expect(usbPicker).toHaveBeenCalledTimes(1));
    const banner = await screen.findByTestId('compile-only-no-board-banner');
    expect(banner).toBeTruthy();

    // State machine ordering: COMPILING → COMPILE_SUCCESS → CONNECTING_USB → COMPILE_ONLY_NO_BOARD
    expect(transitions).toContain(DEMO_STATES.COMPILING);
    expect(transitions).toContain(DEMO_STATES.COMPILE_SUCCESS);
    expect(transitions).toContain(DEMO_STATES.CONNECTING_USB);
    expect(transitions[transitions.length - 1]).toBe(
      DEMO_STATES.COMPILE_ONLY_NO_BOARD,
    );
    // POST /compile was hit exactly once (no /upload attempt).
    expect(compileFetch).toHaveBeenCalledTimes(1);
    expect(compileFetch.mock.calls[0][0]).toBe('http://localhost:8765/compile');
  });

  it('T1b transitions to compile_only_no_board on NotFoundError (user cancelled picker)', async () => {
    const compileFetch = makeCompileOk({ hexBytes: 1234, ramBytes: 56 });
    const usbPicker = makeUsbNotFound();
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){}void loop(){}"
        statusImpl={statusOnline}
        fetchImpl={compileFetch}
        requestUsbDevice={usbPicker}
      />,
    );
    const btn = await screen.findByRole('button');
    fireEvent.click(btn);

    const banner = await screen.findByTestId('compile-only-no-board-banner');
    expect(banner).toBeTruthy();
  });

  // T2 — honest message renders verbatim HEX bytes count
  it('T2 renders honest message with verbatim HEX bytes count from stdout', async () => {
    const compileFetch = makeCompileOk({ hexBytes: 39048, ramBytes: 3940 });
    const usbPicker = makeUsbNotFound();
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){}void loop(){}"
        statusImpl={statusOnline}
        fetchImpl={compileFetch}
        requestUsbDevice={usbPicker}
      />,
    );
    const btn = await screen.findByRole('button');
    fireEvent.click(btn);

    const message = await screen.findByTestId('compile-only-no-board-message');
    expect(message.textContent).toMatch(/Compilazione completata/);
    expect(message.textContent).toMatch(/39048 byte/);
    expect(message.textContent).toMatch(/Nano R4/);
    expect(message.textContent).toMatch(/USB/);

    // Bytes line shows both HEX and RAM.
    const hex = await screen.findByTestId('hex-bytes');
    const ram = await screen.findByTestId('ram-bytes');
    expect(hex.textContent).toMatch(/HEX:\s*39048/);
    expect(ram.textContent).toMatch(/RAM:\s*3940/);
  });

  // T3 — retry CTA re-triggers the WebUSB device picker
  it('T3 retry CTA re-triggers WebUSB device picker', async () => {
    const compileFetch = makeCompileOk();
    const usbPicker = makeUsbNotFound();
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){}void loop(){}"
        statusImpl={statusOnline}
        fetchImpl={compileFetch}
        requestUsbDevice={usbPicker}
      />,
    );
    const btn = await screen.findByRole('button');
    fireEvent.click(btn);
    await screen.findByTestId('compile-only-no-board-banner');

    expect(usbPicker).toHaveBeenCalledTimes(1);
    const retry = await screen.findByTestId('compile-only-no-board-retry');
    fireEvent.click(retry);

    await waitFor(() => expect(usbPicker).toHaveBeenCalledTimes(2));
    // /compile was NOT called a second time — retry only re-runs the WebUSB step.
    expect(compileFetch).toHaveBeenCalledTimes(1);
  });

  // T4 — ARIA assertions (Codex iter 74 MED gap close)
  it('T4 banner exposes role="status", aria-live="polite", and CTA aria-label', async () => {
    const compileFetch = makeCompileOk();
    const usbPicker = makeUsbNotFound();
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){}void loop(){}"
        statusImpl={statusOnline}
        fetchImpl={compileFetch}
        requestUsbDevice={usbPicker}
      />,
    );
    const btn = await screen.findByRole('button');
    fireEvent.click(btn);

    const banner = await screen.findByTestId('compile-only-no-board-banner');
    expect(banner.getAttribute('role')).toBe('status');
    expect(banner.getAttribute('aria-live')).toBe('polite');
    expect(banner.getAttribute('aria-label')).toMatch(/Nano R4/);

    const retry = await screen.findByTestId('compile-only-no-board-retry');
    expect(retry.getAttribute('aria-label')).toMatch(
      /Riprova caricamento sul kit Nano R4/,
    );
    // Touch target ≥44×44 (LIM compatibility, regola CLAUDE.md 9).
    expect(retry.style.minHeight).toBe('44px');
    expect(retry.style.minWidth).toBe('44px');
  });

  // T5 — zero emoji + ElabIcons usage verify
  it('T5 banner contains zero emoji and uses ElabIcons SVG (role=img stroke-based)', async () => {
    const compileFetch = makeCompileOk();
    const usbPicker = makeUsbNotFound();
    const { container } = render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){}void loop(){}"
        statusImpl={statusOnline}
        fetchImpl={compileFetch}
        requestUsbDevice={usbPicker}
      />,
    );
    const btn = await screen.findByRole('button');
    fireEvent.click(btn);

    const banner = await screen.findByTestId('compile-only-no-board-banner');
    // Zero emoji guarantee — scan the visible text for the most common
    // forbidden icon emoji that previously slipped into the codebase.
    const text = banner.textContent || '';
    const FORBIDDEN_EMOJI = /[\u{1F300}-\u{1FAFF}✅⚠✨\u{1F441}]/u;
    expect(FORBIDDEN_EMOJI.test(text)).toBe(false);

    // ElabIcons SVG are present (CheckIcon + WarningIcon, both role="img").
    const svgs = banner.querySelectorAll('svg[role="img"]');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
    // Stroke-based icons (CLAUDE.md ElabIcons contract).
    svgs.forEach((svg) => {
      // SVG defaults set stroke="currentColor" via Icon wrapper; we only
      // need to assert no inline fill on the wrapper svg (children may use
      // fill="currentColor" for solid shapes — that's allowed).
      const stroke = svg.getAttribute('stroke');
      expect(stroke === 'currentColor' || stroke === null).toBe(true);
    });
    // Ensure container ref is sane (compiler smoke).
    expect(container).toBeTruthy();
  });

  // T6 — PRINCIPIO ZERO plurale text assertion
  it('T6 honest message uses plurale "Collegate" register (PRINCIPIO ZERO)', async () => {
    const compileFetch = makeCompileOk();
    const usbPicker = makeUsbNotFound();
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){}void loop(){}"
        statusImpl={statusOnline}
        fetchImpl={compileFetch}
        requestUsbDevice={usbPicker}
      />,
    );
    const btn = await screen.findByRole('button');
    fireEvent.click(btn);

    const message = await screen.findByTestId('compile-only-no-board-message');
    // Plurale "Collegate" present (NOT singolare imperative "collega").
    expect(message.textContent).toMatch(/\bCollegate\b/);
    expect(message.textContent).not.toMatch(/\bcollega\s/i);
    // CTA copy "Riprova caricamento" is neutral imperative present plural-safe.
    const retry = await screen.findByTestId('compile-only-no-board-retry');
    expect(retry.textContent).toMatch(/Riprova caricamento/);
  });

  // T7 — never claims "Caricato" while in compile_only_no_board
  it('T7 banner never claims "Caricato" — only honest "Compilazione completata"', async () => {
    const compileFetch = makeCompileOk();
    const usbPicker = makeUsbNotFound();
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){}void loop(){}"
        statusImpl={statusOnline}
        fetchImpl={compileFetch}
        requestUsbDevice={usbPicker}
      />,
    );
    const btn = await screen.findByRole('button');
    fireEvent.click(btn);

    const banner = await screen.findByTestId('compile-only-no-board-banner');
    expect(banner.textContent).not.toMatch(/Caricato/);
    expect(banner.textContent).toMatch(/Compilazione completata/);
  });

  // T8 — compile failure goes to upload_error (NOT compile_only_no_board)
  it('T8 compile failure → upload_error, no no-board banner rendered', async () => {
    const compileFetch = makeCompileErr('compile_failed');
    const usbPicker = makeUsbDevice();
    const onError = vi.fn();
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="invalid sketch"
        statusImpl={statusOnline}
        fetchImpl={compileFetch}
        requestUsbDevice={usbPicker}
        onError={onError}
      />,
    );
    const btn = await screen.findByRole('button');
    fireEvent.click(btn);
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0][0].category).toBe('compile_failed');
    // No no-board banner rendered.
    expect(screen.queryByTestId('compile-only-no-board-banner')).toBeNull();
    // WebUSB picker was never invoked (compile gates the step).
    expect(usbPicker).not.toHaveBeenCalled();
  });

  // T9 — legacy single-shot path (enableDemoMode=false) still uses /compile-and-upload
  it('T9 legacy single-shot path unchanged when enableDemoMode is false', async () => {
    const fetchSpy = makeFetchOk({ ok: true, jobId: 'legacy-1' });
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={fetchSpy}
        endpoint="http://localhost:8765/compile-and-upload"
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );
    fireEvent.click(btn);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(fetchSpy.mock.calls[0][0]).toBe(
      'http://localhost:8765/compile-and-upload',
    );
    expect(screen.queryByTestId('compile-only-no-board-banner')).toBeNull();
  });

  // T10 — iter 76 PHASE 3 P0.1 fix (Codex Pattern V verdict #3):
  // post WebUSB device picker SUCCESS, demo mode MUST NOT claim "Caricato"
  // before actual dfu-util flash. Transition to HARDWARE_PICKED_AWAITING_FLASH
  // honest intermediate state. Real flash iter 77+ hardware UAT Tea+Riccardo.
  it('T10 device picked → HARDWARE_PICKED_AWAITING_FLASH (NO false Caricato claim)', async () => {
    const compileFetch = makeCompileOk();
    const usbPicker = makeUsbDevice();
    const onSuccess = vi.fn();
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){}void loop(){}"
        statusImpl={statusOnline}
        fetchImpl={compileFetch}
        requestUsbDevice={usbPicker}
        onSuccess={onSuccess}
      />,
    );
    const btn = await screen.findByRole('button');
    fireEvent.click(btn);

    // WebUSB picker resolved with valid device handle.
    await waitFor(() => expect(usbPicker).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    const arg = onSuccess.mock.calls[0][0];
    // P0.1 mandate: message MUST NOT claim "Caricato" — only honest "rilevato".
    expect(arg.message).not.toMatch(/Caricato/);
    expect(arg.message).toMatch(/Nano R4 rilevato via USB/);
    expect(arg.message).toMatch(/Iter 77\+|dfu-util|hardware UAT|Tea/);
    // Payload includes flashStatus signaling awaiting hardware verify.
    expect(arg.payload.flashStatus).toBe('awaiting_hardware_uat');
    expect(arg.payload.device).toBe('webusb');

    // Component data-attr reflects honest intermediate state.
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-demo-state')).toBe(
        'hardware_picked_awaiting_flash',
      ),
    );
  });

  // T11 — iter 77 P0.1b fix (Codex Pattern V iter 77 verify CRITICAL #1):
  // retry path post compile_only_no_board with WebUSB picker SUCCESS must
  // also transition HARDWARE_PICKED_AWAITING_FLASH (NOT UPLOAD_SUCCESS).
  // Mirror primary handler P0.1 fix in retry handler.
  it('T11 retry picker SUCCESS → HARDWARE_PICKED_AWAITING_FLASH (NO Caricato)', async () => {
    // First click: compile OK + picker returns no device → compile_only_no_board
    const compileFetch = makeCompileOk();
    const usbPickerCancelFirst = vi.fn()
      .mockResolvedValueOnce(null)        // first call: no device picked
      .mockResolvedValueOnce({             // retry call: device acquired
        productName: 'Arduino Nano R4',
        vendorId: 0x2341,
      });
    const onSuccess = vi.fn();
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){}void loop(){}"
        statusImpl={statusOnline}
        fetchImpl={compileFetch}
        requestUsbDevice={usbPickerCancelFirst}
        onSuccess={onSuccess}
      />,
    );
    const btn = await screen.findByRole('button');
    fireEvent.click(btn);

    // Wait compile_only_no_board banner visible
    const retryBtn = await screen.findByTestId('compile-only-no-board-retry');
    expect(retryBtn).toBeTruthy();

    // Click retry → picker resolves with device this time
    fireEvent.click(retryBtn);
    await waitFor(() => expect(usbPickerCancelFirst).toHaveBeenCalledTimes(2));

    // Verify retry path transitioned HARDWARE_PICKED_AWAITING_FLASH (NOT UPLOAD_SUCCESS)
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-demo-state')).toBe(
        'hardware_picked_awaiting_flash',
      ),
    );

    // Verify onSuccess called with retry payload + honest message (NO Caricato)
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const lastCall = onSuccess.mock.calls[onSuccess.mock.calls.length - 1][0];
    expect(lastCall.message).not.toMatch(/Caricato/);
    expect(lastCall.message).toMatch(/Nano R4 rilevato via USB/);
    expect(lastCall.payload.flashStatus).toBe('awaiting_hardware_uat');
    expect(lastCall.payload.path).toBe('retry');
  });
});
