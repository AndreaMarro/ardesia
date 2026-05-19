import { parseUnlimIntent, type UnlimIntent } from './intentSchema';
import { escapeXml } from './utils/xmlEscape';

type SimulatorScratchApi = {
  loadScratchWorkspace?: (xml: string) => void;
};

type ExecuteIntentResult = {
  ok: boolean;
  xml?: string;
  intent?: UnlimIntent;
  error?: string;
};

const XML_NS = 'https://developers.google.com/blockly/xml';

function xmlField(name: string, value: unknown): string {
  return `<field name="${escapeXml(name)}">${escapeXml(value)}</field>`;
}

function numberValue(name: string, value: unknown): string {
  return `<value name="${escapeXml(name)}"><shadow type="math_number">${xmlField('NUM', value)}</shadow></value>`;
}

function textValue(name: string, value: unknown): string {
  return `<value name="${escapeXml(name)}"><shadow type="text">${xmlField('TEXT', value)}</shadow></value>`;
}

function block(type: string, body = ''): string {
  return `<block type="${escapeXml(type)}">${body}</block>`;
}

function chain(blocks: string[]): string {
  if (blocks.length === 0) return '';
  const [first, ...rest] = blocks;
  if (rest.length === 0) return first;
  const closeIndex = first.lastIndexOf('</block>');
  if (closeIndex < 0) return first;
  return `${first.slice(0, closeIndex)}<next>${chain(rest)}</next>${first.slice(closeIndex)}`;
}

function withBase(setupBlocks: string[], loopBlocks: string[], nl: string): string {
  const metadata = block('text', xmlField('TEXT', nl));
  const setup = setupBlocks.length > 0 ? `<statement name="SETUP">${chain(setupBlocks)}</statement>` : '';
  const loop = loopBlocks.length > 0 ? `<statement name="LOOP">${chain(loopBlocks)}</statement>` : '';
  return `<xml xmlns="${XML_NS}"><comment pinned="false" h="48" w="280">${escapeXml(nl)}</comment>${metadata}<block type="arduino_base" x="40" y="30" deletable="false">${setup}${loop}</block></xml>`;
}

function pinMode(pin: unknown, mode: unknown): string {
  return block('arduino_pin_mode', `${xmlField('PIN', pin)}${xmlField('MODE', mode)}`);
}

function digitalWrite(pin: unknown, value: unknown): string {
  return block('arduino_digital_write', `${xmlField('PIN', pin)}${xmlField('STATE', value)}`);
}

function analogWrite(pin: unknown, value: unknown): string {
  return block('arduino_analog_write', `${xmlField('PIN', pin)}${numberValue('VALUE', value)}`);
}

function delayMs(value: unknown): string {
  return block('arduino_delay', numberValue('DELAY_TIME', value));
}

function serialBegin(): string {
  return block('arduino_serial_begin', xmlField('BAUD', '9600'));
}

function serialPrint(expr: unknown): string {
  return block('arduino_serial_print', `${xmlField('NEWLINE', 'TRUE')}${textValue('CONTENT', expr)}`);
}

function analogRead(pin: unknown, variable: unknown): string {
  return block('arduino_variable_set', `${xmlField('TYPE', 'int')}${xmlField('VAR', variable)}<value name="VALUE">${block('arduino_analog_read', xmlField('PIN', pin))}</value>`);
}

function commentProbe(pin: unknown, value: unknown, expr: unknown): string {
  return block('arduino_serial_print', `${xmlField('NEWLINE', 'TRUE')}${textValue('CONTENT', `pin=${pin}; value=${value}; expr=${expr}`)}`);
}

export function normalizeIntent(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const source = raw as Record<string, unknown>;
  const params = (source.params || source.parameters || {}) as Record<string, unknown>;
  const rawIntent = String(source.intent || source.type || '').trim().toLowerCase();
  const nl = String(source.nl || source.naturalLanguage || source.prompt || '');

  if (rawIntent === 'blink' || rawIntent === 'create-blink') {
    return {
      intent: 'create_blink',
      nl,
      params: {
        pin: String(params.pin ?? '13'),
        intervalMs: Number(params.intervalMs ?? params.interval ?? 1000),
      },
    };
  }

  if (rawIntent === 'digitalwrite') {
    return { intent: 'digital_write', nl, params };
  }

  if (rawIntent === 'analogwrite') {
    return { intent: 'analog_write', nl, params };
  }

  if (!source.params && source.parameters && rawIntent) {
    return { intent: source.intent || source.type, nl, params };
  }

  return raw;
}

export function intentToBlocklyXml(rawIntent: unknown): string {
  const intent = parseUnlimIntent(normalizeIntent(rawIntent));

  switch (intent.intent) {
    case 'create_blink':
      return withBase(
        [pinMode(intent.params.pin, 'OUTPUT')],
        [
          digitalWrite(intent.params.pin, 'HIGH'),
          delayMs(intent.params.intervalMs),
          digitalWrite(intent.params.pin, 'LOW'),
          delayMs(intent.params.intervalMs),
        ],
        intent.nl,
      );
    case 'digital_write':
      return withBase(
        [pinMode(intent.params.pin, 'OUTPUT')],
        [digitalWrite(intent.params.pin, intent.params.value)],
        intent.nl,
      );
    case 'analog_write':
      return withBase(
        [pinMode(intent.params.pin, 'OUTPUT')],
        [analogWrite(intent.params.pin, intent.params.value)],
        intent.nl,
      );
    case 'pin_mode':
      return withBase([pinMode(intent.params.pin, intent.params.mode)], [], intent.nl);
    case 'delay':
      return withBase([], [delayMs(intent.params.value)], intent.nl);
    case 'serial_print':
      return withBase([serialBegin()], [serialPrint(intent.params.expr)], intent.nl);
    case 'analog_read':
      return withBase([serialBegin()], [
        analogRead(intent.params.pin, intent.params.variable),
        serialPrint(intent.params.variable),
        delayMs(100),
      ], intent.nl);
    case 'comment':
      return withBase([serialBegin()], [commentProbe(intent.params.pin, intent.params.value, intent.params.expr)], intent.nl);
    default: {
      const neverIntent: never = intent;
      throw new Error(`Unsupported intent: ${JSON.stringify(neverIntent)}`);
    }
  }
}

export function executeIntent(rawIntent: unknown, api: SimulatorScratchApi = getDefaultApi()): ExecuteIntentResult {
  try {
    const normalized = normalizeIntent(rawIntent);
    const intent = parseUnlimIntent(normalized);
    const xml = intentToBlocklyXml(intent);
    api.loadScratchWorkspace?.(xml);
    return { ok: true, xml, intent };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function getDefaultApi(): SimulatorScratchApi {
  if (typeof window === 'undefined') return {};
  return (window as Window & { __ELAB_API?: SimulatorScratchApi }).__ELAB_API || {};
}
