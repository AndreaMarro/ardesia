/**
 * tests/unit/services/elab-agent/error-translator.test.js
 *
 * Iter 71 TEAM C PART 2 — Error translator unit tests.
 * 7 canonical categories × 3-4 stderr samples + plurale enforcement + fallback + truncation.
 *
 * NO arduino-cli runtime, NO hardware Nano R4.
 */

import { describe, it, expect } from 'vitest';
import {
  translateArduinoCliError,
  translateSpawnError,
  CATEGORIES,
} from '../../../../src/services/elab-agent/error-translator.js';

// Helper: assert response has all canonical fields
function assertCanonicalShape(res) {
  expect(res).toBeDefined();
  expect(typeof res.category).toBe('string');
  expect(typeof res.docenteFriendlyMessage).toBe('string');
  expect(typeof res.technicalDetail).toBe('string');
  expect(typeof res.suggestedFix).toBe('string');
}

// Helper: assert message starts with "Ragazzi," (PRINCIPIO ZERO plurale)
function assertPlurale(res) {
  expect(res.docenteFriendlyMessage).toMatch(/^Ragazzi[,\s]/);
}

describe('iter 71 TEAM C PART 2 — translator: CATEGORIES constants', () => {
  it('1. exports 7 canonical categories + unknown fallback', () => {
    expect(CATEGORIES.ARDUINO_CLI_ABSENT).toBe('arduino_cli_absent');
    expect(CATEGORIES.CORE_MISSING).toBe('core_missing');
    expect(CATEGORIES.BOARD_MISSING).toBe('board_missing');
    expect(CATEGORIES.PORT_MISSING).toBe('port_missing');
    expect(CATEGORIES.COMPILE_FAILED).toBe('compile_failed');
    expect(CATEGORIES.UPLOAD_FAILED).toBe('upload_failed');
    expect(CATEGORIES.PERMISSION_DENIED).toBe('permission_denied');
    expect(CATEGORIES.UNKNOWN).toBe('unknown');
  });
});

describe('iter 71 TEAM C PART 2 — category: arduino_cli_absent', () => {
  it('2. detects "command not found: arduino-cli"', () => {
    const res = translateArduinoCliError('bash: command not found: arduino-cli', 127);
    expect(res.category).toBe('arduino_cli_absent');
    assertCanonicalShape(res);
    assertPlurale(res);
  });

  it('3. detects Windows "arduino-cli is not recognized"', () => {
    const res = translateArduinoCliError(
      "'arduino-cli' is not recognized as an internal or external command",
      1,
    );
    expect(res.category).toBe('arduino_cli_absent');
  });

  it('4. translateSpawnError handles ENOENT category from runArduinoCli', () => {
    const res = translateSpawnError({ category: 'arduino_cli_absent', message: 'ENOENT spawn' });
    expect(res.category).toBe('arduino_cli_absent');
    assertPlurale(res);
  });

  it('5. translateSpawnError handles raw ENOENT code', () => {
    const res = translateSpawnError({ code: 'ENOENT', message: 'spawn arduino-cli ENOENT' });
    expect(res.category).toBe('arduino_cli_absent');
  });
});

describe('iter 71 TEAM C PART 2 — category: core_missing', () => {
  it('6. detects "platform not installed"', () => {
    const res = translateArduinoCliError(
      'Error: Platform arduino:renesas_uno not installed',
      1,
    );
    expect(res.category).toBe('core_missing');
    assertPlurale(res);
  });

  it('7. detects "core not installed"', () => {
    const res = translateArduinoCliError('Error: core arduino:renesas_uno not installed', 1);
    expect(res.category).toBe('core_missing');
  });

  it('8. detects "no installed platform matches"', () => {
    const res = translateArduinoCliError('Error: no installed platform matches FQBN', 1);
    expect(res.category).toBe('core_missing');
  });

  it('9. suggestedFix mentions "arduino-cli core install arduino:renesas_uno"', () => {
    const res = translateArduinoCliError('Platform not installed', 1);
    expect(res.suggestedFix).toMatch(/core install arduino:renesas_uno/);
  });
});

describe('iter 71 TEAM C PART 2 — category: board_missing', () => {
  it('10. detects "Invalid FQBN"', () => {
    const res = translateArduinoCliError('Error: Invalid FQBN: arduino:renesas_uno:nanor4', 1);
    expect(res.category).toBe('board_missing');
    assertPlurale(res);
  });

  it('11. detects "board not found"', () => {
    const res = translateArduinoCliError('board not found: nanor4', 1);
    expect(res.category).toBe('board_missing');
  });

  it('12. detects "no board ID found"', () => {
    const res = translateArduinoCliError("no board ID 'nanor4' found in installed platform", 1);
    expect(res.category).toBe('board_missing');
  });

  it('13. message mentions kit ELAB cavo USB-C (MORFISMO Sense 2)', () => {
    const res = translateArduinoCliError('Invalid FQBN', 1);
    expect(res.docenteFriendlyMessage).toMatch(/kit ELAB|cavo USB/i);
  });
});

describe('iter 71 TEAM C PART 2 — category: port_missing', () => {
  it('14. detects "no port found"', () => {
    const res = translateArduinoCliError('Error: no port found', 1, { operation: 'upload' });
    expect(res.category).toBe('port_missing');
    assertPlurale(res);
  });

  it('15. detects dfu-util "no DFU capable USB device available"', () => {
    const res = translateArduinoCliError(
      'dfu-util: No DFU capable USB device available',
      1,
      { operation: 'upload' },
    );
    expect(res.category).toBe('port_missing');
  });

  it('16. detects "no upload port provided"', () => {
    const res = translateArduinoCliError('Error: no upload port provided', 1);
    expect(res.category).toBe('port_missing');
  });

  it('17. suggestedFix mentions doppio-click reset Nano R4', () => {
    const res = translateArduinoCliError('no port found', 1);
    expect(res.suggestedFix).toMatch(/doppio-click.*reset/i);
  });
});

describe('iter 71 TEAM C PART 2 — category: compile_failed (with sub-hints)', () => {
  it('18. detects semicolon missing → specificHint about ";"', () => {
    const stderr = `/tmp/sketch/sketch.ino: In function 'void setup()':
/tmp/sketch/sketch.ino:5:25: error: expected ';' before '}' token
   pinMode(13, OUTPUT)
                         ^
                         ;`;
    const res = translateArduinoCliError(stderr, 1, { operation: 'compile' });
    expect(res.category).toBe('compile_failed');
    expect(res.lineNumber).toBe(5);
    expect(res.specificHint).toMatch(/punto e virgola/);
    assertPlurale(res);
  });

  it('19. detects "was not declared in this scope" → specificHint scope', () => {
    const stderr = `/tmp/sketch/sketch.ino: In function 'void loop()':
/tmp/sketch/sketch.ino:12:3: error: 'ledpin' was not declared in this scope
   ledpin = HIGH;
   ^~~~~~`;
    const res = translateArduinoCliError(stderr, 1, { operation: 'compile' });
    expect(res.category).toBe('compile_failed');
    expect(res.lineNumber).toBe(12);
    expect(res.specificHint).toMatch(/maiuscole\/minuscole|ledpin/);
  });

  it('20. detects "expected \'}\'" → specificHint brace', () => {
    const stderr = `/tmp/sketch/sketch.ino:15:1: error: expected '}' at end of input
 }
 ^`;
    const res = translateArduinoCliError(stderr, 1, { operation: 'compile' });
    expect(res.category).toBe('compile_failed');
    expect(res.specificHint).toMatch(/parentesi graffa/i);
  });

  it('21. detects "no matching function for call" → specificHint argomenti', () => {
    const stderr = `/tmp/sketch/sketch.ino:8:18: error: no matching function for call to 'digitalWrite(int)'
   digitalWrite(13);
                  ^`;
    const res = translateArduinoCliError(stderr, 1, { operation: 'compile' });
    expect(res.category).toBe('compile_failed');
    expect(res.specificHint).toMatch(/argomenti|digitalWrite/i);
  });

  it('22. compile_failed without recognizable sub-pattern → no specificHint but still categorized', () => {
    const stderr = `/tmp/sketch/sketch.ino:3:1: error: stray '\\240' in program`;
    const res = translateArduinoCliError(stderr, 1, { operation: 'compile' });
    expect(res.category).toBe('compile_failed');
    expect(res.lineNumber).toBe(3);
  });
});

describe('iter 71 TEAM C PART 2 — category: upload_failed', () => {
  it('23. detects "upload failed"', () => {
    const res = translateArduinoCliError('Error: upload failed', 1, { operation: 'upload' });
    expect(res.category).toBe('upload_failed');
    assertPlurale(res);
  });

  it('24. detects dfu-util error', () => {
    const res = translateArduinoCliError(
      'dfu-util: Error during download write_finished',
      1,
      { operation: 'upload' },
    );
    expect(res.category).toBe('upload_failed');
  });

  it('25. detects "bootloader not responding"', () => {
    const res = translateArduinoCliError(
      'avrdude: bootloader not responding',
      1,
      { operation: 'upload' },
    );
    expect(res.category).toBe('upload_failed');
  });

  it('26. operation: upload + generic stderr + non-zero exit → upload_failed (operation hint disambig)', () => {
    const res = translateArduinoCliError('something cryptic happened', 1, { operation: 'upload' });
    expect(res.category).toBe('upload_failed');
  });
});

describe('iter 71 TEAM C PART 2 — category: permission_denied', () => {
  it('27. detects "Permission denied" Linux', () => {
    const res = translateArduinoCliError(
      'Error: cannot open /dev/ttyACM0: Permission denied',
      1,
    );
    expect(res.category).toBe('permission_denied');
    assertPlurale(res);
  });

  it('28. detects "access denied"', () => {
    const res = translateArduinoCliError('Access denied to COM3', 1);
    expect(res.category).toBe('permission_denied');
  });

  it('29. detects EACCES', () => {
    const res = translateArduinoCliError('EACCES: permission denied open /dev/ttyACM0', 1);
    expect(res.category).toBe('permission_denied');
  });

  it('30. suggestedFix mentions sudo usermod dialout for Linux', () => {
    const res = translateArduinoCliError('Permission denied', 1);
    expect(res.suggestedFix).toMatch(/dialout|usermod/);
  });
});

describe('iter 71 TEAM C PART 2 — fallback: unknown', () => {
  it('31. unknown stderr → category="unknown" + plurale message', () => {
    const res = translateArduinoCliError('totally unexpected garbage output xyzzy', 1);
    expect(res.category).toBe('unknown');
    assertPlurale(res);
    expect(res.suggestedFix).toMatch(/scollegare.*ricollegare/i);
  });

  it('32. empty stderr + exitCode 0 → unknown (chiamante anomalo)', () => {
    const res = translateArduinoCliError('', 0);
    expect(res.category).toBe('unknown');
  });

  it('33. null stderr → unknown (defensive)', () => {
    const res = translateArduinoCliError(null, null);
    expect(res.category).toBe('unknown');
  });

  it('34. undefined stderr → unknown (defensive)', () => {
    const res = translateArduinoCliError(undefined, undefined);
    expect(res.category).toBe('unknown');
  });
});

describe('iter 71 TEAM C PART 2 — plurale enforcement (PRINCIPIO ZERO)', () => {
  it('35. ALL 8 categories messages start with "Ragazzi,"', () => {
    const samples = [
      ['arduino-cli command not found', 127],
      ['platform not installed', 1],
      ['Invalid FQBN', 1],
      ['no port found', 1],
      ["expected ';' before token", 1, { operation: 'compile' }],
      ['dfu-util error during download', 1, { operation: 'upload' }],
      ['Permission denied /dev/ttyACM0', 1],
      ['xyzzy garbage', 1],
    ];
    for (const [stderr, code, opts] of samples) {
      const res = translateArduinoCliError(stderr, code, opts);
      assertPlurale(res);
    }
  });

  it('36. NO singular imperative ("fai/clicca/monta/collega") in suggestedFix', () => {
    const samples = [
      'arduino-cli command not found',
      'platform not installed',
      'Invalid FQBN',
      'no port found',
      "expected ';' before token",
      'upload failed',
      'Permission denied',
      'unknown garbage',
    ];
    for (const stderr of samples) {
      const res = translateArduinoCliError(stderr, 1);
      // "fai" / "clicca" / "monta" / "collega" singular imperatives forbidden
      // Allowed plural: "fate" / "cliccate" / "montate" / "collegate" / "verificate"
      expect(res.suggestedFix).not.toMatch(/\bfai\b/i);
      expect(res.suggestedFix).not.toMatch(/\bclicca\b/i);
      // "monta" appears in "montaggio" etc, so we check word-boundary singular only
      expect(res.suggestedFix).not.toMatch(/\bmonta\b(?!ggio|te)/i);
    }
  });
});

describe('iter 71 TEAM C PART 2 — truncation safety', () => {
  it('37. stderr > 8KB → truncated with "(truncated)" marker in technicalDetail', () => {
    const longStderr = 'X'.repeat(10 * 1024); // 10KB
    const res = translateArduinoCliError(longStderr, 1);
    expect(res.technicalDetail.length).toBeLessThanOrEqual(8 * 1024 + 30); // 8KB + marker overhead
    expect(res.technicalDetail).toMatch(/\(truncated\)$/);
  });

  it('38. stderr < 8KB → NOT truncated', () => {
    const shortStderr = 'Y'.repeat(100);
    const res = translateArduinoCliError(shortStderr, 1);
    expect(res.technicalDetail).not.toMatch(/\(truncated\)/);
  });
});

describe('iter 71 TEAM C PART 2 — categorize order (regression matrix)', () => {
  it('39. permission_denied PRECEDES upload_failed when both match', () => {
    // Real arduino-cli stderr can contain both "Permission denied" + "upload failed"
    const stderr = 'avrdude: ser_open(): can\'t open device "/dev/ttyACM0": Permission denied\nUpload failed';
    const res = translateArduinoCliError(stderr, 1, { operation: 'upload' });
    expect(res.category).toBe('permission_denied');
  });

  it('40. compile_failed last in priority (so port/permission errors during compile still hit specific)', () => {
    // A bare "error:" without port/permission keywords → compile_failed
    const res = translateArduinoCliError("/tmp/x.ino:1:1: error: expected ';' before '}'", 1, {
      operation: 'compile',
    });
    expect(res.category).toBe('compile_failed');
  });
});
