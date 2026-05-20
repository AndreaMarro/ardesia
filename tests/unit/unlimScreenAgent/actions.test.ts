import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  actionRegistry,
  astToBlockly,
  astToCpp,
  executeAction,
  getAction,
} from '../../../src/features/unlimScreenAgent/actions';
import type { ScreenContext } from '../../../src/features/unlimScreenAgent/types';

type TestWindow = typeof window & {
  __ELAB_API?: any;
  __ELAB_CM6_VIEW?: any;
  __ELAB_BLOCKLY_WORKSPACE?: any;
};

const testWindow = window as TestWindow;

const baseContext: ScreenContext = {
  route: '/simulatore',
  editorMode: 'arduino',
  cppCode: 'void setup() {}\nvoid loop() {}',
  blockCount: 0,
  selectedText: '',
  selectedBlock: null,
  compileStatus: 'idle',
  compileTarget: 'arduino:renesas_uno:nanor4',
  lastCompilerError: null,
  boardConnected: false,
  uploadState: 'not_attempted_without_board',
  experimentId: 'v3-cap5-esp1',
};

describe('unlimScreenAgent actions registry', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.mocked(fetch).mockReset();
    testWindow.__ELAB_API = {
      setEditorCode: vi.fn(),
      loadScratchWorkspace: vi.fn(),
      setEditorMode: vi.fn(),
    };
    testWindow.__ELAB_CM6_VIEW = undefined;
    testWindow.__ELAB_BLOCKLY_WORKSPACE = undefined;
  });

  test('contains all requested action ids', () => {
    expect(Object.keys(actionRegistry).sort()).toEqual([
      'compileNanoR4',
      'createAnalogSerial',
      'createBlink',
      'createButtonLed',
      'explainSelectedCode',
      'fixCompileError',
      'highlightBlock',
      'insertSnippet',
      'switchEditorMode',
    ].sort());
  });

  test('every action exposes an Italian description and a Zod schema', () => {
    for (const action of Object.values(actionRegistry)) {
      expect(action.description.length).toBeGreaterThan(12);
      expect(action.argsSchema.safeParse({}).success).toEqual(expect.any(Boolean));
    }
  });

  test('getAction returns a registered action', () => {
    expect(getAction('createBlink').id).toBe('createBlink');
  });

  test('executeAction validates arguments with Zod', async () => {
    await expect(executeAction('insertSnippet', {}, baseContext)).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining('Argomenti non validi'),
    });
  });

  test('astToCpp emits Arduino setup and loop functions', () => {
    const cpp = astToCpp({
      type: 'Program',
      globals: [],
      setup: [{ type: 'PinMode', pin: '13', mode: 'OUTPUT' }],
      loop: [{ type: 'Delay', ms: '1000' }],
    });

    expect(cpp).toContain('void setup()');
    expect(cpp).toContain('pinMode(13, OUTPUT);');
    expect(cpp).toContain('void loop()');
    expect(cpp).toContain('delay(1000);');
  });

  test('astToBlockly emits Blockly XML for pinMode and delay blocks', () => {
    const xml = astToBlockly({
      type: 'Program',
      globals: [],
      setup: [{ type: 'PinMode', pin: '13', mode: 'OUTPUT' }],
      loop: [{ type: 'Delay', ms: '1000' }],
    });

    expect(xml).toContain('<xml');
    expect(xml).toContain('arduino_pin_mode');
    expect(xml).toContain('arduino_delay');
  });

  test('astToBlockly escapes raw C++ payload in Blockly field text', () => {
    const xml = astToBlockly({
      type: 'Program',
      globals: [],
      setup: [],
      loop: [{ type: 'UnsupportedCppBlock', raw: 'if (x < 10 && y > 3) Serial.print("&");' }],
    });

    expect(xml).toContain('if (x &lt; 10 &amp;&amp; y &gt; 3) Serial.print(&quot;&amp;&quot;);');
    expect(xml).not.toContain('if (x < 10 && y > 3)');
  });

  test('astToBlockly escapes unsupported raw C++ block payload', () => {
    const xml = astToBlockly({
      type: 'Program',
      globals: [],
      setup: [],
      loop: [{ type: 'UnsupportedCppBlock', raw: "Serial.print('<&>\"\\'');" }],
    });

    expect(xml).toContain('Serial.print(&apos;&lt;&amp;&gt;&quot;\\&apos;&apos;);');
    expect(xml).toContain('type="unsupported_cpp_block"');
  });

  test('astToBlockly escapes UnsupportedCppBlock raw payload into RAW_TEXT field', () => {
    const xml = astToBlockly({
      type: 'Program',
      globals: [],
      setup: [],
      loop: [{ type: 'UnsupportedCppBlock', raw: 'if (x < 10) Serial.print("&");' }],
    });

    expect(xml).toContain('if (x &lt; 10) Serial.print(&quot;&amp;&quot;);');
    expect(xml).toContain('RAW_TEXT');
  });

  test('astToBlockly escapes identifier-like digital write values serialized as fields', () => {
    const xml = astToBlockly({
      type: 'Program',
      globals: [],
      setup: [],
      loop: [{ type: 'DigitalWrite', pin: '13', value: 'state < threshold && label == "on"' }],
    });

    expect(xml).toContain('state &lt; threshold &amp;&amp; label == &quot;on&quot;');
    // HIGH-2: arduino_digital_write block field is STATE (scratchBlocks.js:61), not VALUE
    expect(xml).toContain('name="STATE"');
    expect(xml).not.toContain('name="VALUE"');
  });

  test('createBlink sets editor content and switches to dual mode', async () => {
    const result = await executeAction('createBlink', {}, baseContext);

    expect(result.ok).toBe(true);
    expect(testWindow.__ELAB_API.setEditorCode).toHaveBeenCalledWith(expect.stringContaining('digitalWrite(13, HIGH);'));
    expect(testWindow.__ELAB_API.loadScratchWorkspace).toHaveBeenCalledWith(expect.stringContaining('arduino_digital_write'));
    expect(testWindow.__ELAB_API.setEditorMode).toHaveBeenCalledWith('dual');
    expect(localStorage.setItem).toHaveBeenCalledWith('elab.ide.mode', 'dual');
    expect(result.summary).toContain('Blink');
  });

  test('createButtonLed builds reactive button LED code', async () => {
    const result = await executeAction('createButtonLed', {}, baseContext);
    const code = vi.mocked(testWindow.__ELAB_API.setEditorCode).mock.calls[0][0];

    expect(result.ok).toBe(true);
    expect(code).toContain('pinMode(2, INPUT_PULLUP);');
    expect(code).toContain('digitalRead(2)');
    expect(code).toContain('digitalWrite(13, statoPulsante == LOW ? HIGH : LOW);');
  });

  test('createAnalogSerial builds potentiometer serial code', async () => {
    const result = await executeAction('createAnalogSerial', {}, baseContext);
    const code = vi.mocked(testWindow.__ELAB_API.setEditorCode).mock.calls[0][0];

    expect(result.ok).toBe(true);
    expect(code).toContain('Serial.begin(9600);');
    expect(code).toContain('analogRead(A0)');
    expect(code).toContain('Serial.println(valore);');
  });

  test('insertSnippet dispatches at the CM6 cursor', async () => {
    const dispatch = vi.fn();
    testWindow.__ELAB_CM6_VIEW = {
      state: { selection: { main: { from: 12, to: 12 } } },
      dispatch,
      focus: vi.fn(),
    };

    const result = await executeAction('insertSnippet', { snippet: 'digitalWrite(13, HIGH);' }, baseContext);

    expect(result.ok).toBe(true);
    expect(dispatch).toHaveBeenCalledWith({ changes: { from: 12, to: 12, insert: 'digitalWrite(13, HIGH);' } });
    expect(testWindow.__ELAB_CM6_VIEW.focus).toHaveBeenCalled();
  });

  test('insertSnippet replaces selected CM6 text', async () => {
    const dispatch = vi.fn();
    testWindow.__ELAB_CM6_VIEW = {
      state: { selection: { main: { from: 4, to: 10 } } },
      dispatch,
    };

    await executeAction('insertSnippet', { snippet: 'delay(500);' }, baseContext);

    expect(dispatch).toHaveBeenCalledWith({ changes: { from: 4, to: 10, insert: 'delay(500);' } });
  });

  test('insertSnippet falls back to ELAB API when CM6 view is absent', async () => {
    const result = await executeAction('insertSnippet', { snippet: '// ciao' }, baseContext);

    expect(result.ok).toBe(true);
    expect(testWindow.__ELAB_API.setEditorCode).toHaveBeenCalledWith(`${baseContext.cppCode}\n// ciao`);
  });

  test('explainSelectedCode explains digitalWrite HIGH locally', async () => {
    const result = await executeAction('explainSelectedCode', {}, {
      ...baseContext,
      selectedText: 'digitalWrite(13, HIGH);',
    });

    expect(result.ok).toBe(true);
    expect(result.summary).toContain('Accende LED pin 13');
  });

  test('explainSelectedCode explains delay and pinMode locally', async () => {
    const result = await executeAction('explainSelectedCode', {}, {
      ...baseContext,
      selectedText: 'pinMode(13, OUTPUT);\ndelay(1000);',
    });

    expect(result.ok).toBe(true);
    expect(result.summary).toContain('Configura pin 13 come uscita');
    expect(result.summary).toContain('Attende 1 secondo');
  });

  test('explainSelectedCode reports missing selection', async () => {
    const result = await executeAction('explainSelectedCode', {}, baseContext);

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Seleziona');
  });

  test('fixCompileError suggests semicolon line fix', async () => {
    const result = await executeAction('fixCompileError', {}, {
      ...baseContext,
      lastCompilerError: 'sketch.ino:7:3: error: expected semicolon before digitalWrite',
    });

    expect(result.ok).toBe(true);
    expect(result.summary).toContain('punto e virgola');
    expect(result.patch).toContain('linea 7');
  });

  test('fixCompileError suggests setup when pinMode is not declared', async () => {
    const result = await executeAction('fixCompileError', {}, {
      ...baseContext,
      lastCompilerError: "'pinMode' was not declared in this scope",
    });

    expect(result.ok).toBe(true);
    expect(result.summary).toContain('manca setup()');
    expect(result.patch).toContain('void setup()');
  });

  test('fixCompileError handles absent compiler error', async () => {
    const result = await executeAction('fixCompileError', {}, baseContext);

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Nessun errore');
  });

  test('compileNanoR4 posts to local Nano R4 compile endpoint and returns size', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, size: 1234, hex: ':10000000' }),
    } as Response);

    const result = await executeAction('compileNanoR4', {}, baseContext);

    expect(fetch).toHaveBeenCalledWith('/api/compile/nanor4', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: baseContext.cppCode, fqbn: 'arduino:renesas_uno:nanor4' }),
    }));
    expect(result.ok).toBe(true);
    expect(result.artifactSize).toBe(1234);
  });

  test('compileNanoR4 returns compiler error text', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'compile failed' }),
    } as Response);

    const result = await executeAction('compileNanoR4', {}, baseContext);

    expect(result.ok).toBe(false);
    expect(result.error).toContain('compile failed');
  });

  test('switchEditorMode writes localStorage, calls API, and emits event', async () => {
    const listener = vi.fn();
    window.addEventListener('elab-ide-mode-change', listener);

    const result = await executeAction('switchEditorMode', { mode: 'scratch' }, baseContext);

    expect(result.ok).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('elab.ide.mode', 'scratch');
    expect(testWindow.__ELAB_API.setEditorMode).toHaveBeenCalledWith('scratch');
    expect(listener).toHaveBeenCalled();
    window.removeEventListener('elab-ide-mode-change', listener);
  });

  test('highlightBlock selects a Blockly block by id', async () => {
    const select = vi.fn();
    testWindow.__ELAB_BLOCKLY_WORKSPACE = { getBlockById: vi.fn(() => ({ select })) };

    const result = await executeAction('highlightBlock', { blockId: 'b-1' }, baseContext);

    expect(result.ok).toBe(true);
    expect(select).toHaveBeenCalled();
  });

  test('highlightBlock reports unknown block id', async () => {
    testWindow.__ELAB_BLOCKLY_WORKSPACE = { getBlockById: vi.fn(() => null) };

    const result = await executeAction('highlightBlock', { blockId: 'missing' }, baseContext);

    expect(result.ok).toBe(false);
    expect(result.error).toContain('non trovato');
  });
});
