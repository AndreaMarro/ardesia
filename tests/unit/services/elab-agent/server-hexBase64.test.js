/**
 * tests/unit/services/elab-agent/server-hexBase64.test.js
 *
 * Iter 79.A A3 unit verify — ELAB Agent handleCompile response MUST include
 * hexBase64 + hexFilename + hexSize so the WebUSB DFU flash chain in
 * CompileUploadButton.jsx:486-504 can decode + flash the firmware without
 * throwing `hexBase64_missing_from_compile_response`.
 *
 * Empirical verify 2026-05-17 with real arduino-cli 1.4.1 + Renesas core 1.5.3
 * confirmed Blink sketch yields ElabSketch.ino.hex of 109863 bytes
 * (base64 length 146484, header `:1040000000...` = valid Intel HEX). This
 * unit test mocks fs/spawn so it runs in CI without arduino-cli installed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const fsMock = {
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn().mockResolvedValue([
    'ElabSketch.ino.hex',
    'ElabSketch.ino.elf',
    'ElabSketch.ino.with_bootloader.hex',
  ]),
  readFile: vi.fn().mockResolvedValue(Buffer.from(':100000000C9434000C943E000C943E000C943E0096\n:00000001FF\n', 'utf8')),
};
vi.mock('node:fs/promises', () => ({
  default: fsMock,
  ...fsMock,
}));

vi.mock('../../../../src/services/elab-agent/sketch-builder.js', () => ({
  loadBoardProfile: vi.fn().mockReturnValue({
    fqbn: 'arduino:renesas_uno:nanor4',
    boardId: 'arduino-nano-r4',
  }),
}));

vi.mock('../../../../src/services/elab-agent/error-translator.js', () => ({
  translateArduinoCliError: vi.fn(() => ({ category: 'compile_failed', message: 'compile fail' })),
  translateSpawnError: vi.fn(() => ({ category: 'arduino_cli_absent', message: 'spawn err' })),
}));

// Mock runArduinoCli via spawn — simulate success exit 0.
const spawnMock = vi.fn(() => {
  const handlers = {};
  const child = {
    stdout: { on: (e, fn) => { handlers.stdout = fn; } },
    stderr: { on: (e, fn) => { handlers.stderr = fn; } },
    on: (e, fn) => {
      if (e === 'close') {
        setTimeout(() => fn(0), 0);
      }
      if (e === 'error') handlers.error = fn;
    },
    kill: vi.fn(),
  };
  setTimeout(() => {
    handlers.stdout?.('Sketch uses 39048 bytes\n');
  }, 0);
  return child;
});
vi.mock('node:child_process', () => ({
  default: { spawn: spawnMock },
  spawn: spawnMock,
}));

describe('iter 79.A A3 — ELAB Agent server.handleCompile returns hexBase64', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns hexBase64 + hexFilename + hexSize on compile success', async () => {
    const { handleCompile } = await import('../../../../src/services/elab-agent/server.js');

    const result = await handleCompile({
      code: 'void setup(){}\nvoid loop(){}\n',
      boardId: 'arduino-nano-r4',
    });

    expect(result.ok).toBe(true);
    expect(result.hexFilename).toBe('ElabSketch.ino.hex'); // prefer .ino.hex over with_bootloader
    expect(result.hexSize).toBeGreaterThan(0);
    expect(typeof result.hexBase64).toBe('string');
    expect(result.hexBase64.length).toBeGreaterThan(0);
    // base64-decoded payload starts with Intel HEX `:` record marker.
    const decoded = Buffer.from(result.hexBase64, 'base64').toString('utf8');
    expect(decoded.startsWith(':')).toBe(true);
  });

  it('prefers ElabSketch.ino.hex over .with_bootloader.hex', async () => {
    const { handleCompile } = await import('../../../../src/services/elab-agent/server.js');
    const result = await handleCompile({ code: 'void setup(){}', boardId: 'arduino-nano-r4' });
    expect(result.hexFilename).toBe('ElabSketch.ino.hex');
    expect(result.hexFilename).not.toContain('with_bootloader');
  });
});
