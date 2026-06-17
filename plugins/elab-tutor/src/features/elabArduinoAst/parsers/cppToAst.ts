import {
  ArduinoProgramSchema,
  type ArduinoAstNode,
  type ArduinoProgram,
  type ExpressionNode,
} from '../ast/nodes';

type ArduinoFunction = {
  name: 'setup' | 'loop';
  start: number;
  end: number;
  body: string;
};

const identifier = '[A-Za-z_]\\w*';
const variableTypes =
  '(?:unsigned\\s+long|unsigned\\s+int|signed\\s+long|signed\\s+int|int|long|short|float|double|bool|boolean|byte|char|String|uint\\d+_t|int\\d+_t)';

export function cppToAst(source: string): ArduinoProgram {
  const functions = findArduinoFunctions(source);
  const setup = functions.find((fn) => fn.name === 'setup');
  const loop = functions.find((fn) => fn.name === 'loop');

  const program = {
    type: 'Program' as const,
    globals: parseGlobals(source, functions),
    setup: setup ? parseStatements(setup.body) : [],
    loop: loop ? parseStatements(loop.body) : [],
  };

  return ArduinoProgramSchema.parse(program);
}

function findArduinoFunctions(source: string): ArduinoFunction[] {
  const results: ArduinoFunction[] = [];
  const re = /\bvoid\s+(setup|loop)\s*\([^)]*\)\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(source)) !== null) {
    const openBrace = source.indexOf('{', match.index);
    const closeBrace = findMatching(source, openBrace, '{', '}');
    if (closeBrace === -1) continue;

    results.push({
      name: match[1] as 'setup' | 'loop',
      start: match.index,
      end: closeBrace + 1,
      body: source.slice(openBrace + 1, closeBrace),
    });
    re.lastIndex = closeBrace + 1;
  }

  return results.sort((a, b) => a.start - b.start);
}

function parseGlobals(source: string, functions: ArduinoFunction[]): ArduinoAstNode[] {
  const ranges = functions.map((fn) => [fn.start, fn.end] as const);
  const rawGlobals: string[] = [];
  let cursor = 0;

  for (const [start, end] of ranges) {
    rawGlobals.push(source.slice(cursor, start));
    cursor = end;
  }
  rawGlobals.push(source.slice(cursor));

  return rawGlobals.flatMap((chunk) =>
    splitTopLevelChunks(chunk)
      .map((raw) => raw.trim())
      .filter(Boolean)
      .map((raw) => parseGlobalChunk(raw)),
  );
}

function parseGlobalChunk(raw: string): ArduinoAstNode {
  const variable = parseVariableStatement(raw, { allowConst: false });
  if (variable) return variable;
  return { type: 'UnsupportedCppBlock', raw };
}

function parseStatements(body: string): ArduinoAstNode[] {
  return splitTopLevelChunks(body)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map(parseStatement);
}

function splitTopLevelChunks(source: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  let paren = 0;
  let brace = 0;
  let bracket = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }

    if (ch === '/' && next === '/') {
      const newline = source.indexOf('\n', i + 2);
      i = newline === -1 ? source.length - 1 : newline;
      continue;
    }

    if (ch === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? source.length - 1 : end + 1;
      continue;
    }

    if (ch === '(') paren += 1;
    else if (ch === ')') paren = Math.max(0, paren - 1);
    else if (ch === '[') bracket += 1;
    else if (ch === ']') bracket = Math.max(0, bracket - 1);
    else if (ch === '{') brace += 1;
    else if (ch === '}') {
      brace = Math.max(0, brace - 1);
      if (paren === 0 && bracket === 0 && brace === 0) {
        const rest = source.slice(i + 1).trimStart();
        if (rest.startsWith('else')) continue;
        // Brace initializer (array/struct literal): consume trailing ; into same chunk
        const restRaw = source.slice(i + 1);
        const semiMatch = restRaw.match(/^\s*;/);
        if (semiMatch) {
          const endIdx = i + 1 + semiMatch[0].length;
          chunks.push(source.slice(start, endIdx));
          start = endIdx;
          i = endIdx - 1;
          continue;
        }
        chunks.push(source.slice(start, i + 1));
        start = i + 1;
      }
    } else if (ch === ';' && paren === 0 && brace === 0 && bracket === 0) {
      chunks.push(source.slice(start, i + 1));
      start = i + 1;
    } else if (ch === '\n' && paren === 0 && brace === 0 && bracket === 0) {
      const current = source.slice(start, i).trim();
      if (current.startsWith('#')) {
        chunks.push(source.slice(start, i));
        start = i + 1;
      }
    }
  }

  const tail = source.slice(start);
  if (tail.trim()) chunks.push(tail);

  return chunks;
}

function parseStatement(raw: string): ArduinoAstNode {
  const ifNode = parseIfStatement(raw);
  if (ifNode) return ifNode;

  const variable = parseVariableStatement(raw, { allowConst: false });
  if (variable) return variable;

  const assignmentRead = parseReadAssignment(raw);
  if (assignmentRead) return assignmentRead;

  const calls: Array<[RegExp, (match: RegExpExecArray) => ArduinoAstNode]> = [
    [
      /^pinMode\s*\((.+),\s*(.+)\)\s*;$/s,
      (m) => ({ type: 'PinMode', pin: clean(m[1]), mode: clean(m[2]) }),
    ],
    [
      /^digitalWrite\s*\((.+),\s*(.+)\)\s*;$/s,
      (m) => ({ type: 'DigitalWrite', pin: clean(m[1]), value: clean(m[2]) }),
    ],
    [
      /^analogWrite\s*\((.+),\s*(.+)\)\s*;$/s,
      (m) => ({ type: 'AnalogWrite', pin: clean(m[1]), value: clean(m[2]) }),
    ],
    [/^delay\s*\((.+)\)\s*;$/s, (m) => ({ type: 'Delay', ms: clean(m[1]) })],
    [/^Serial\.begin\s*\((.+)\)\s*;$/s, (m) => ({ type: 'SerialBegin', baud: clean(m[1]) })],
    [
      /^Serial\.(print|println)\s*\((.*)\)\s*;$/s,
      (m) => ({ type: 'SerialPrint', value: clean(m[2]), newline: m[1] === 'println' }),
    ],
  ];

  for (const [pattern, build] of calls) {
    const match = pattern.exec(raw);
    if (match) return build(match);
  }

  return { type: 'UnsupportedCppBlock', raw };
}

function parseIfStatement(raw: string): ArduinoAstNode | null {
  if (!/^if\b/.test(raw.trim())) return null;

  const ifIndex = raw.search(/\bif\b/);
  const openParen = raw.indexOf('(', ifIndex);
  if (openParen === -1) return null;

  const closeParen = findMatching(raw, openParen, '(', ')');
  if (closeParen === -1) return null;

  const cond = raw.slice(openParen + 1, closeParen).trim();
  const afterCond = raw.slice(closeParen + 1).trim();
  if (!afterCond.startsWith('{')) {
    return { type: 'If', cond, then: [{ type: 'UnsupportedCppBlock', raw: afterCond }] };
  }

  const blockStartInAfter = afterCond.indexOf('{');
  const blockEndInAfter = findMatching(afterCond, blockStartInAfter, '{', '}');
  if (blockEndInAfter === -1) {
    return { type: 'If', cond, then: [{ type: 'UnsupportedCppBlock', raw: afterCond }] };
  }

  const body = afterCond.slice(blockStartInAfter + 1, blockEndInAfter);
  const rest = afterCond.slice(blockEndInAfter + 1).trim();
  const node: ArduinoAstNode = { type: 'If', cond, then: parseStatements(body) };

  if (rest.startsWith('else')) {
    const elseRaw = rest.slice(4).trim();
    if (elseRaw.startsWith('{')) {
      const elseEnd = findMatching(elseRaw, 0, '{', '}');
      node.else =
        elseEnd === -1
          ? [{ type: 'UnsupportedCppBlock', raw: elseRaw }]
          : parseStatements(elseRaw.slice(1, elseEnd));
    } else if (elseRaw) {
      node.else = [parseStatement(elseRaw)];
    }
  } else if (rest) {
    node.then.push({ type: 'UnsupportedCppBlock', raw: rest });
  }

  return node;
}

function parseVariableStatement(raw: string, options: { allowConst: boolean }): ArduinoAstNode | null {
  if (!options.allowConst && /^\s*const\b/.test(raw)) return null;
  if (/\[[^\]]*\]\s*=/.test(raw) || /\[[^\]]*\]\s*;/.test(raw)) return null;

  const pattern = new RegExp(
    `^\\s*(${variableTypes})\\s+(${identifier})\\s*(?:=\\s*(.+?))?\\s*;\\s*$`,
    's',
  );
  const match = pattern.exec(raw);
  if (!match) return null;

  const [, varType, name, initRaw] = match;
  const init = initRaw === undefined ? undefined : parseExpression(initRaw.trim(), name);
  return init
    ? { type: 'Variable', varType: clean(varType), name, init }
    : { type: 'Variable', varType: clean(varType), name };
}

function parseExpression(raw: string, storeIn?: string): ExpressionNode {
  const digital = /^digitalRead\s*\((.+)\)\s*$/.exec(raw);
  if (digital) {
    return storeIn
      ? { type: 'DigitalRead', pin: clean(digital[1]), storeIn }
      : { type: 'DigitalRead', pin: clean(digital[1]) };
  }

  const analog = /^analogRead\s*\((.+)\)\s*$/.exec(raw);
  if (analog) {
    return storeIn
      ? { type: 'AnalogRead', pin: clean(analog[1]), storeIn }
      : { type: 'AnalogRead', pin: clean(analog[1]) };
  }

  return { type: 'RawExpression', raw };
}

function parseReadAssignment(raw: string): ArduinoAstNode | null {
  const pattern = new RegExp(
    `^\\s*(${identifier})\\s*=\\s*(digitalRead|analogRead)\\s*\\((.+)\\)\\s*;\\s*$`,
    's',
  );
  const match = pattern.exec(raw);
  if (!match) return null;

  const [, storeIn, fn, pin] = match;
  return fn === 'digitalRead'
    ? { type: 'DigitalRead', pin: clean(pin), storeIn }
    : { type: 'AnalogRead', pin: clean(pin), storeIn };
}

function findMatching(source: string, openIndex: number, open: string, close: string): number {
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }

    if (ch === open) depth += 1;
    if (ch === close) depth -= 1;
    if (depth === 0) return i;
  }

  return -1;
}

function clean(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}
