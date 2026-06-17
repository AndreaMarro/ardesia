/**
 * tests/unit/scripts/guard-forbidden-avr-patterns.test.js
 *
 * Unit tests for scripts/agents/guard-forbidden-avr-patterns.sh
 *
 * Created: 2026-05-16 iter 70 TEAM G PART 1 A6
 *
 * Context: Arduino Nano R4 uses Renesas RA4M1 chip (NOT ATmega328p AVR).
 * Blockly/Scratch code generators must use portable Arduino API only.
 * This hook blocks AVR-specific register manipulation patterns from entering
 * the guarded files:
 *   - src/components/simulator/panels/scratchGenerator.js
 *   - src/data/blockly-blocks/*.js
 *
 * Test strategy: spawnSync bash hook with stdin JSON payloads matching
 * the Claude Code PreToolUse hook contract, verify stdout JSON response.
 */

import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK_PATH = resolve(__dirname, '../../../scripts/agents/guard-forbidden-avr-patterns.sh');

/**
 * Run the hook with the given tool_input payload and return parsed JSON output.
 */
function runHook(toolInput) {
  const payload = JSON.stringify({ tool_input: toolInput });
  const result = spawnSync('bash', [HOOK_PATH], {
    input: payload,
    encoding: 'utf8',
    timeout: 5000,
  });

  expect(result.error).toBeUndefined();
  expect(result.status).toBe(0);

  const stdout = result.stdout.trim();
  expect(stdout).toBeTruthy();

  return JSON.parse(stdout);
}

function getDecision(output) {
  return output?.hookSpecificOutput?.permissionDecision;
}

function getReason(output) {
  return output?.hookSpecificOutput?.permissionDecisionReason ?? '';
}

// ─── ALLOW scenarios ────────────────────────────────────────────────────────

describe('guard-forbidden-avr-patterns.sh — ALLOW scenarios', () => {
  it('allows when file_path is missing (no guarded file)', () => {
    const output = runHook({ content: 'PORTB |= 1;' });
    expect(getDecision(output)).toBe('allow');
  });

  it('allows when content is missing', () => {
    const output = runHook({
      file_path: '/repo/src/components/simulator/panels/scratchGenerator.js',
    });
    expect(getDecision(output)).toBe('allow');
  });

  it('allows non-guarded file even with forbidden AVR patterns in content', () => {
    const output = runHook({
      file_path: '/repo/src/components/other/SomeComponent.js',
      content: 'PORTB |= (1 << 3);\nDDRB |= 0xFF;\navr/io.h',
    });
    expect(getDecision(output)).toBe('allow');
  });

  it('allows guarded scratchGenerator.js with clean portable Arduino API code', () => {
    const cleanContent = [
      '// Portable Arduino API — safe for Nano R4 Renesas RA4M1',
      'function generateBlink(pin) {',
      '  return `digitalWrite(${pin}, HIGH);`;',
      '}',
      'function generatePinMode(pin, mode) {',
      '  return `pinMode(${pin}, ${mode});`;',
      '}',
    ].join('\n');

    const output = runHook({
      file_path: '/repo/src/components/simulator/panels/scratchGenerator.js',
      content: cleanContent,
    });
    expect(getDecision(output)).toBe('allow');
  });

  it('allows guarded blockly-blocks/*.js with clean content', () => {
    const cleanContent = [
      '// Digital write block generator',
      'Blockly.Arduino["digital_write"] = function(block) {',
      '  const pin = block.getFieldValue("PIN");',
      '  const value = block.getFieldValue("VALUE");',
      '  return `digitalWrite(${pin}, ${value});\\n`;',
      '};',
    ].join('\n');

    const output = runHook({
      file_path: '/project/src/data/blockly-blocks/digitalBlocks.js',
      content: cleanContent,
    });
    expect(getDecision(output)).toBe('allow');
  });

  it('allows avr8js engine file (not in guarded paths, legit ATmega328p simulation)', () => {
    // avr8js is the ATmega328p emulation engine — it legitimately uses AVR registers internally
    const output = runHook({
      file_path: '/repo/src/components/simulator/engine/AVRBridge.js',
      content: 'const portB = cpu.readData(PORTB);\nconst ddrb = DDRB;',
    });
    expect(getDecision(output)).toBe('allow');
  });
});

// ─── BLOCK (ask) scenarios ───────────────────────────────────────────────────

describe('guard-forbidden-avr-patterns.sh — BLOCK (ask) scenarios', () => {
  it('blocks PORTB in scratchGenerator.js', () => {
    const output = runHook({
      file_path: '/repo/src/components/simulator/panels/scratchGenerator.js',
      content: '// generator\nPORTB |= (1 << 3);\nfunction foo() {}',
    });
    expect(getDecision(output)).toBe('ask');
    expect(getReason(output)).toContain('PORTB');
    expect(getReason(output)).toContain('Nano R4');
  });

  it('blocks DDRB in blockly-blocks file', () => {
    const output = runHook({
      file_path: '/project/src/data/blockly-blocks/customBlocks.js',
      content: 'DDRB |= 0xFF; // set all port B as output',
    });
    expect(getDecision(output)).toBe('ask');
    expect(getReason(output)).toContain('DDRB');
  });

  it('blocks avr/io.h include in scratchGenerator.js', () => {
    const output = runHook({
      file_path: '/repo/src/components/simulator/panels/scratchGenerator.js',
      content: '#include <avr/io.h>\nvoid setup() {}',
    });
    expect(getDecision(output)).toBe('ask');
    expect(getReason(output)).toContain('avr/io');
  });

  it('blocks _BV( macro in blockly-blocks file', () => {
    // Content has _BV( only — no other forbidden patterns before it in scan order
    const output = runHook({
      file_path: '/project/src/data/blockly-blocks/portBlocks.js',
      content: '// bit-value macro — ATmega-specific\nconst mask = _BV(3);\n// use with care',
    });
    expect(getDecision(output)).toBe('ask');
    expect(getReason(output)).toContain('_BV(');
  });

  it('blocks ATmega328 explicit chip reference in scratchGenerator.js', () => {
    const output = runHook({
      file_path: '/repo/src/components/simulator/panels/scratchGenerator.js',
      content: '// Only works on ATmega328 — not compatible with Nano R4',
    });
    expect(getDecision(output)).toBe('ask');
    expect(getReason(output)).toContain('ATmega328');
  });

  it('blocks ISR( interrupt service routine in scratchGenerator.js', () => {
    const output = runHook({
      file_path: '/home/user/src/components/simulator/panels/scratchGenerator.js',
      content: 'ISR(TIMER1_COMPA_vect) { togglePin(); }',
    });
    expect(getDecision(output)).toBe('ask');
    expect(getReason(output)).toContain('ISR(');
  });

  it('blocks sei() / cli() in blockly-blocks file', () => {
    const output = runHook({
      file_path: '/src/data/blockly-blocks/interruptBlocks.js',
      content: 'sei(); // enable global interrupts\ncli(); // disable',
    });
    expect(getDecision(output)).toBe('ask');
    // First matched pattern is sei() or cli()
    const reason = getReason(output);
    expect(reason).toMatch(/sei\(\)|cli\(\)/);
  });

  it('blocks PINB in scratchGenerator.js and includes file path in warning', () => {
    const output = runHook({
      file_path: '/workspace/src/components/simulator/panels/scratchGenerator.js',
      content: 'const val = PINB & (1 << 2);',
    });
    expect(getDecision(output)).toBe('ask');
    const reason = getReason(output);
    expect(reason).toContain('PINB');
    expect(reason).toContain('scratchGenerator.js');
  });

  it('blocks avr/interrupt.h in blockly-blocks file', () => {
    const output = runHook({
      file_path: '/src/data/blockly-blocks/timerBlocks.js',
      content: '#include <avr/interrupt.h>\nvoid setup() {}',
    });
    expect(getDecision(output)).toBe('ask');
    expect(getReason(output)).toContain('avr/interrupt');
  });
});

// ─── Output contract tests ────────────────────────────────────────────────────

describe('guard-forbidden-avr-patterns.sh — output contract', () => {
  it('returns valid JSON with hookSpecificOutput structure for allow', () => {
    const output = runHook({ file_path: '/other/file.js', content: 'clean' });
    expect(output).toHaveProperty('hookSpecificOutput');
    expect(output.hookSpecificOutput).toHaveProperty('hookEventName', 'PreToolUse');
    expect(output.hookSpecificOutput).toHaveProperty('permissionDecision');
  });

  it('returns valid JSON with hookSpecificOutput structure for block', () => {
    const output = runHook({
      file_path: '/repo/src/components/simulator/panels/scratchGenerator.js',
      content: 'PORTD = 0xFF;',
    });
    expect(output).toHaveProperty('hookSpecificOutput');
    expect(output.hookSpecificOutput).toHaveProperty('hookEventName', 'PreToolUse');
    expect(output.hookSpecificOutput).toHaveProperty('permissionDecision', 'ask');
    expect(output.hookSpecificOutput).toHaveProperty('permissionDecisionReason');
    expect(typeof output.hookSpecificOutput.permissionDecisionReason).toBe('string');
    expect(output.hookSpecificOutput.permissionDecisionReason.length).toBeGreaterThan(10);
  });

  it('reason string mentions portable Arduino API when blocking', () => {
    const output = runHook({
      file_path: '/repo/src/components/simulator/panels/scratchGenerator.js',
      content: 'PORTB |= (1<<5);',
    });
    const reason = getReason(output);
    // Should mention the correct API to use instead
    expect(reason).toMatch(/digitalWrite|pinMode|analogWrite/);
  });
});
