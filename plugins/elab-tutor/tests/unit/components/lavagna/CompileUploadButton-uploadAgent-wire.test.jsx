/**
 * tests/unit/components/lavagna/CompileUploadButton-uploadAgent-wire.test.jsx
 *
 * Wave 2 X.3b Impl-Wire — Wire-up tests for the FALLBACK_WEB_SERIAL injection.
 *
 * Verifies the Andrea R3 ratify fallback-hook-injection pattern:
 *   - NEW prop `uploadHexImpl` defaults to the Wave 2 X.3 `uploadHex`
 *     orchestrator from `src/services/uploadAgent.js`.
 *   - When `enableDemoMode === false` AND the primary ELAB Agent path
 *     (POST `/compile-and-upload`) fails, the button MUST route through
 *     `uploadHexImpl` → which can degrade to Web Serial when supported.
 *   - NEW state machine value `FALLBACK_WEB_SERIAL` distinct from
 *     `UPLOADING` for state-machine transparency (consumer telemetry +
 *     instrumentation can distinguish "primary path" vs "fallback engaged").
 *   - Existing primary path (agent online → `/compile-and-upload`) MUST NOT
 *     regress — the legacy single-shot behaviour is preserved bit-for-bit.
 *   - When `navigator.serial` is unavailable AND the agent is offline, the
 *     UI surfaces the canonical Italian plurale toast via `onError`.
 *
 * Test scope owned: this NEW file only — `CompileUploadButton.test.jsx`
 * remains READ-ONLY (Wave 2 X.3b file-ownership hard lock).
 *
 * @copyright © Andrea Marro — 2026-05-26 — ELAB Tutor Wave 2 X.3b Impl-Wire
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import CompileUploadButton, {
  DEMO_STATES,
} from '../../../../src/components/lavagna/CompileUploadButton.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — small factories for injected dependencies.
// Mirror the existing test's helper shape so the new tests slot cleanly into
// the broader CompileUploadButton coverage without duplicating contracts.
// ─────────────────────────────────────────────────────────────────────────────

/** Build a status probe that reports the agent ONLINE. */
const statusOnline = async () => ({ available: true, port: 8765 });

/**
 * Build a fetch that returns 503 on /compile-and-upload so the primary
 * agent path fails and the wire-up fallback path is exercised.
 */
function makeAgentDown503() {
  return vi.fn().mockResolvedValue({
    ok: false,
    status: 503,
    json: async () => ({ ok: false, error: { category: 'agent_offline', message: 'mock 503' } }),
  });
}

/** Build a fetch that throws TypeError (network unreachable). */
function makeAgentNetworkErr() {
  return vi.fn().mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')));
}

/** Build a fetch that returns 200 OK on /compile-and-upload (primary success). */
function makeAgentOk(body = { ok: true, jobId: 'agent-ok-1' }) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. uploadHexImpl prop default — DI surface contract
// ─────────────────────────────────────────────────────────────────────────────

describe('CompileUploadButton wire — uploadHexImpl prop (Wave 2 X.3b)', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('accepts an injected uploadHexImpl (DI surface) without throwing on mount', async () => {
    const uploadHexImpl = vi.fn();
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={makeAgentOk()}
        uploadHexImpl={uploadHexImpl}
      />,
    );
    const btn = await screen.findByRole('button');
    expect(btn).toBeTruthy();
    // No call until the user clicks AND primary path fails.
    expect(uploadHexImpl).not.toHaveBeenCalled();
  });

  it('exports FALLBACK_WEB_SERIAL state name for telemetry/transparency', () => {
    expect(DEMO_STATES.FALLBACK_WEB_SERIAL).toBe('fallback_web_serial');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Primary path UNCHANGED — no regression when agent is online
// ─────────────────────────────────────────────────────────────────────────────

describe('CompileUploadButton wire — primary AGENT_COMPILE_UPLOAD_URL untouched', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('uses /compile-and-upload primary path when agent online + does NOT call uploadHexImpl', async () => {
    const fetchSpy = makeAgentOk();
    const uploadHexImpl = vi.fn();
    const onSuccess = vi.fn();
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={fetchSpy}
        uploadHexImpl={uploadHexImpl}
        onSuccess={onSuccess}
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );
    fireEvent.click(btn);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(uploadHexImpl).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    // Primary endpoint still invoked.
    expect(fetchSpy.mock.calls[0][0]).toMatch(/compile-and-upload/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Fallback wire-up — uploadHexImpl called when primary path fails
// ─────────────────────────────────────────────────────────────────────────────

describe('CompileUploadButton wire — fallback to uploadHexImpl on primary failure', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('routes through uploadHexImpl when primary returns 503 (agent reachable but down)', async () => {
    const fetchSpy = makeAgentDown503();
    const uploadHexImpl = vi.fn().mockResolvedValue({
      ok: true,
      msg: 'webserial_ok',
      lines: 42,
    });
    const transitions = [];
    const onSuccess = vi.fn();

    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={fetchSpy}
        uploadHexImpl={uploadHexImpl}
        onSuccess={onSuccess}
        onDemoStateChange={(s) => transitions.push(s)}
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );
    fireEvent.click(btn);

    // Primary path is attempted first (fetch invoked once).
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    // Fallback path is invoked next.
    await waitFor(() => expect(uploadHexImpl).toHaveBeenCalledTimes(1));

    // State machine ordering: UPLOADING → FALLBACK_WEB_SERIAL
    // (transparent transition so telemetry can distinguish path).
    expect(transitions).toContain(DEMO_STATES.UPLOADING);
    expect(transitions).toContain(DEMO_STATES.FALLBACK_WEB_SERIAL);

    // FALLBACK_WEB_SERIAL must be reached AFTER UPLOADING.
    const idxUploading = transitions.indexOf(DEMO_STATES.UPLOADING);
    const idxFallback = transitions.indexOf(DEMO_STATES.FALLBACK_WEB_SERIAL);
    expect(idxFallback).toBeGreaterThan(idxUploading);
  });

  it('routes through uploadHexImpl when primary fetch rejects (network error)', async () => {
    const fetchSpy = makeAgentNetworkErr();
    const uploadHexImpl = vi.fn().mockResolvedValue({
      ok: true,
      msg: 'webserial_ok',
      lines: 7,
    });
    const onSuccess = vi.fn();

    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={fetchSpy}
        uploadHexImpl={uploadHexImpl}
        onSuccess={onSuccess}
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );
    fireEvent.click(btn);

    await waitFor(() => expect(uploadHexImpl).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    // onSuccess message references the Web Serial fallback completion.
    const arg = onSuccess.mock.calls[0][0];
    expect(arg.message).toMatch(/Ragazzi/);
  });

  it('propagates uploadHexImpl failure to onError with plurale Italian toast', async () => {
    const fetchSpy = makeAgentNetworkErr();
    // Mimic uploadHex's shape when neither leg is available — code 'no_upload_method'
    // carrying an Italian message + tried[] audit list.
    const noUploadErr = Object.assign(new Error('[uploadAgent:no_upload_method] mock'), {
      code: 'no_upload_method',
      it: 'Ragazzi, attivate ELAB Agent oppure aprite Chrome/Edge con Web Serial per caricare sul kit.',
      tried: ['elab_agent', 'web_serial'],
    });
    const uploadHexImpl = vi.fn().mockRejectedValue(noUploadErr);
    const onError = vi.fn();

    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={fetchSpy}
        uploadHexImpl={uploadHexImpl}
        onError={onError}
      />,
    );
    const btn = await screen.findByRole('button');
    await waitFor(() =>
      expect(btn.getAttribute('data-elab-agent-available')).toBe('true'),
    );
    fireEvent.click(btn);

    await waitFor(() => expect(uploadHexImpl).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));

    // Italian plurale toast surfaces the Web-Serial-unsupported guidance.
    const arg = onError.mock.calls[0][0];
    expect(arg.message).toMatch(/^Ragazzi,/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Web Serial unsupported — IT toast when navigator.serial undefined
// (Wave 2 X.3b brief: "IT toast on Web Serial unsupported")
// ─────────────────────────────────────────────────────────────────────────────

describe('CompileUploadButton wire — Web Serial unsupported branch (jsdom)', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('renders the Italian toast when fallback throws "no upload method" (navigator.serial undefined)', async () => {
    // In jsdom navigator.serial is undefined by default — assert that here.
    expect(typeof navigator.serial).toBe('undefined');

    const fetchSpy = makeAgentDown503();
    const noUploadErr = Object.assign(new Error('[uploadAgent:no_upload_method]'), {
      code: 'no_upload_method',
      it: 'Ragazzi, attivate ELAB Agent oppure aprite Chrome/Edge con Web Serial per caricare sul kit.',
      tried: ['elab_agent', 'web_serial'],
    });
    const uploadHexImpl = vi.fn().mockRejectedValue(noUploadErr);
    const onError = vi.fn();

    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        fetchImpl={fetchSpy}
        uploadHexImpl={uploadHexImpl}
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
    // Plurale "Ragazzi," prefix (Principio Zero).
    expect(arg.message).toMatch(/^Ragazzi,/);
    // No false "Caricato" claim — must NOT surface success language.
    expect(arg.message).not.toMatch(/Caricato/);
  });
});
