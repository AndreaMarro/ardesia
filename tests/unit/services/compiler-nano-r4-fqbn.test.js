/**
 * tests/unit/services/compiler-nano-r4-fqbn.test.js
 *
 * Iter 79.A A2 unit verify — compileArduinoCode wrapper MUST propagate the
 * `board` option to remoteCompileCode so the Renesas Nano R4 FQBN
 * (`arduino:renesas_uno:nanor4`) reaches api.js compileCode and is honored
 * (api.js:1300 default falls back to AVR ATmega328 otherwise).
 *
 * Empirical reproduction iter 79.A: simulator handleCompile called
 * compileArduinoCode(code, {experimentId}) with NO board → fell through
 * cloud compile chain to AVR default → wrong HEX layout + WebUSB DFU flash
 * incompatible. Fix at useCircuitHandlers.js:845 + NewElabSimulator.jsx:413
 * pins NANO_R4_FQBN explicit.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock api.js compileCode to capture the board argument received.
const apiCompileCodeMock = vi.fn().mockResolvedValue({
  success: true,
  hex: ':100000000C9434000C\n:00000001FF\n',
  errors: null,
  output: 'compiled',
});
vi.mock('../../../src/services/api', () => ({
  compileCode: (...args) => apiCompileCodeMock(...args),
}));

// Disable precompile cache fast paths so remote compile is reached.
vi.mock('../../../src/services/precompiledHex', () => ({
  PRECOMPILED_HEX: {},
  fetchHexFile: vi.fn(),
  buildCodeHashMap: vi.fn().mockResolvedValue(new Map()),
  FAST_PRECOMPILED_MATCHERS: [],
}));

// Bypass localStorage persistent cache.
vi.mock('../../../src/services/compileCache', () => ({
  getCachedHex: vi.fn().mockReturnValue(null),
  setCachedHex: vi.fn(),
}));

describe('iter 79.A A2 — compileArduinoCode propagates Nano R4 FQBN', () => {
  beforeEach(() => apiCompileCodeMock.mockClear());

  it('passes board option through to api.compileCode (second arg)', async () => {
    const { compileArduinoCode } = await import('../../../src/services/compiler');
    const NANO_R4_FQBN = 'arduino:renesas_uno:nanor4';
    const code = 'void setup(){pinMode(13,OUTPUT);}void loop(){digitalWrite(13,HIGH);}';

    await compileArduinoCode(code, { board: NANO_R4_FQBN });

    expect(apiCompileCodeMock).toHaveBeenCalled();
    const [receivedCode, receivedBoard] = apiCompileCodeMock.mock.calls[0];
    expect(receivedCode).toBe(code);
    expect(receivedBoard).toBe(NANO_R4_FQBN);
  });

  it('without board option, api.compileCode receives undefined (regression case)', async () => {
    const { compileArduinoCode } = await import('../../../src/services/compiler');
    const code = 'void setup(){}\nvoid loop(){}\n';

    await compileArduinoCode(code, { experimentId: 'v3-cap5-esp1' });

    expect(apiCompileCodeMock).toHaveBeenCalled();
    const [, receivedBoard] = apiCompileCodeMock.mock.calls[0];
    // Without explicit board, wrapper passes undefined → api.js fallback applies.
    // Documents the pre-iter-79.A behavior so handleCompile fix is meaningful.
    expect(receivedBoard).toBeUndefined();
  });
});
