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
