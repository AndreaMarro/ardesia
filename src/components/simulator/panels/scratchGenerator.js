import * as Blockly from 'blockly';
// S83: Removed 'blockly/javascript' import — it registers generators on Blockly.JavaScript,
// NOT on our custom arduinoGenerator. Was potentially causing conflicts.

export const arduinoGenerator = new Blockly.Generator('Arduino');

// C++ operator precedence (lower number = higher precedence)
arduinoGenerator.PRECEDENCE = 0;
arduinoGenerator.ORDER_ATOMIC = 0;            // literals, identifiers
arduinoGenerator.ORDER_UNARY_POSTFIX = 1;     // () [] -> . ++ --
arduinoGenerator.ORDER_FUNCTION_CALL = 1;     // func() — same as postfix
arduinoGenerator.ORDER_UNARY_PREFIX = 2;      // - + ! ~ ++ -- (type)* & sizeof
arduinoGenerator.ORDER_MULTIPLICATION = 3;    // * / %
arduinoGenerator.ORDER_ADDITION = 4;          // + -
arduinoGenerator.ORDER_SUBTRACTION = 4;
arduinoGenerator.ORDER_DIVISION = 3;
arduinoGenerator.ORDER_SHIFT = 5;             // << >>
arduinoGenerator.ORDER_RELATIONAL = 6;        // < <= > >=
arduinoGenerator.ORDER_EQUALITY = 7;          // == !=
arduinoGenerator.ORDER_BITWISE_AND = 8;       // &
arduinoGenerator.ORDER_BITWISE_XOR = 9;       // ^
arduinoGenerator.ORDER_BITWISE_OR = 10;       // |
arduinoGenerator.ORDER_LOGICAL_AND = 11;      // &&
arduinoGenerator.ORDER_LOGICAL_OR = 12;       // ||
arduinoGenerator.ORDER_CONDITIONAL = 13;      // ?:
arduinoGenerator.ORDER_ASSIGNMENT = 14;       // = += -= etc.
arduinoGenerator.ORDER_NONE = 99;             // (…)

arduinoGenerator.scrub_ = function (block, code, opt_thisOnly) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = opt_thisOnly ? '' : arduinoGenerator.blockToCode(nextBlock);
    return code + nextCode;
};

// --- Custom Arduino Blocks Generators --- //

arduinoGenerator.forBlock['arduino_base'] = function (block) {
    // Reset include flags before each generation pass
    arduinoGenerator._servoIncludes = false;
    arduinoGenerator._servoNames = new Set();
    arduinoGenerator._lcdIncludes = false;
    arduinoGenerator._lcdPins = null;
    arduinoGenerator._lcdBegin = null;
    arduinoGenerator._softwareSerialIncludes = false; // Wave 1b: SoftwareSerial.h auto-inject
    arduinoGenerator._wireIncludes = false; // Wave 1b: Wire.h auto-inject for I2C
    arduinoGenerator._declaredVars = new Set(); // Reset variable declarations
    arduinoGenerator._globalVarDecls = new Map(); // S116: Global var declarations (name → type)
    arduinoGenerator._loopVarCounter = 0; // S116: Deterministic loop variable counter

    // Wave 1 Impl-B: Walk workspace to collect GPIO pin usage BEFORE emitting setup.
    // digitalWrite → OUTPUT, digitalRead → INPUT. OUTPUT wins when same pin used both ways.
    const pinUsage = collectGpioPinUsage(block.workspace);

    // Wave 1b Impl-B-2: Walk workspace once to detect future block types triggering
    // SoftwareSerial / Wire library inclusion. Blocks not yet present in scratchBlocks
    // — pre-wired hook so Wave 2 toolbox additions need ZERO codegen edits.
    detectAuxIncludes(block.workspace);

    const setupCode = arduinoGenerator.statementToCode(block, 'SETUP') || '';
    const loopCode = arduinoGenerator.statementToCode(block, 'LOOP') || '';

    // Build header: #include + global declarations for Servo / LCD / Variables
    let header = '';
    if (arduinoGenerator._servoIncludes && arduinoGenerator._servoNames.size > 0) {
        header += '#include <Servo.h>\n';
        for (const name of arduinoGenerator._servoNames) {
            header += `Servo ${name};\n`;
        }
        header += '\n';
    }
    if (arduinoGenerator._lcdIncludes && arduinoGenerator._lcdPins) {
        const p = arduinoGenerator._lcdPins;
        header += '#include <LiquidCrystal.h>\n';
        header += `LiquidCrystal lcd(${p.rs}, ${p.e}, ${p.d4}, ${p.d5}, ${p.d6}, ${p.d7});\n\n`;
    }
    // Wave 1b: emit SoftwareSerial / Wire headers when corresponding blocks detected
    if (arduinoGenerator._softwareSerialIncludes) {
        header += '#include <SoftwareSerial.h>\n\n';
    }
    if (arduinoGenerator._wireIncludes) {
        header += '#include <Wire.h>\n\n';
    }
    // S116: Emit global variable declarations (for Blockly variables used across setup/loop)
    if (arduinoGenerator._globalVarDecls.size > 0) {
        for (const [name, type] of arduinoGenerator._globalVarDecls) {
            header += `${type} ${name};\n`;
        }
        header += '\n';
    }

    // Insert lcd.begin() at the start of setup if LCD is used
    let lcdSetupCode = '';
    if (arduinoGenerator._lcdIncludes && arduinoGenerator._lcdBegin) {
        const b = arduinoGenerator._lcdBegin;
        lcdSetupCode = `  lcd.begin(${b.cols}, ${b.rows});\n`;
    }

    // Wave 1 Impl-B: Emit pinMode() calls at start of setup based on collected pin usage.
    // Stable sort: ascending pin number for deterministic output. Runs before user setup
    // body so pins are configured before any user-side digitalWrite/digitalRead executes.
    let pinModeSetupCode = '';
    if (pinUsage && pinUsage.size > 0) {
        const sortedPins = [...pinUsage.keys()].sort((a, b) => a - b);
        for (const pin of sortedPins) {
            pinModeSetupCode += `  pinMode(${pin}, ${pinUsage.get(pin)});\n`;
        }
    }

    return `${header}void setup() {
${pinModeSetupCode}${lcdSetupCode}${setupCode}}

void loop() {
${loopCode}}`;
};

// Wave 1b Impl-B-2: detect block types that require auxiliary library headers
// (SoftwareSerial.h, Wire.h for I2C). Blocks not yet wired in toolbox — pre-wired
// hook future-proofs codegen when Wave 2 adds matching toolbox entries.
function detectAuxIncludes(workspace) {
    if (!workspace || typeof workspace.getAllBlocks !== 'function') return;
    const allBlocks = workspace.getAllBlocks(false);
    for (const b of allBlocks) {
        if (!b || b.isInsertionMarker?.()) continue;
        const t = b.type || '';
        if (t.startsWith('arduino_software_serial') || t === 'arduino_softserial_begin') {
            arduinoGenerator._softwareSerialIncludes = true;
        }
        if (t.startsWith('arduino_wire_') || t.startsWith('arduino_i2c_') || t === 'arduino_wire_begin') {
            arduinoGenerator._wireIncludes = true;
        }
    }
}

// Wave 1 Impl-B: Walk workspace to discover digitalWrite/digitalRead pin usage.
// Returns Map<pinNum:number, mode:'OUTPUT'|'INPUT'>. OUTPUT wins on conflict so
// once any digitalWrite targets a pin, that pin stays OUTPUT even if digitalRead
// also references it (Arduino convention: pinMode last-set wins, and a pin you
// drive as OUTPUT should not silently fall back to INPUT just because you also
// read its state programmatically).
function collectGpioPinUsage(workspace) {
    const usage = new Map();
    if (!workspace || typeof workspace.getAllBlocks !== 'function') return usage;
    const allBlocks = workspace.getAllBlocks(false);
    for (const b of allBlocks) {
        if (!b || b.isInsertionMarker?.()) continue;
        if (b.type === 'arduino_digital_write') {
            const pinRaw = b.getFieldValue('PIN');
            const pin = parseInt(pinRaw, 10);
            if (!Number.isNaN(pin)) {
                // OUTPUT wins — always overwrite (or set if absent)
                usage.set(pin, 'OUTPUT');
            }
        } else if (b.type === 'arduino_digital_read') {
            const pinRaw = b.getFieldValue('PIN');
            const pin = parseInt(pinRaw, 10);
            if (!Number.isNaN(pin)) {
                // INPUT only if pin not already marked OUTPUT
                if (!usage.has(pin)) {
                    usage.set(pin, 'INPUT');
                }
            }
        }
    }
    return usage;
}

arduinoGenerator.forBlock['arduino_pin_mode'] = function (block) {
    const pin = block.getFieldValue('PIN');
    const mode = block.getFieldValue('MODE');
    return `  pinMode(${pin}, ${mode});\n`;
};

arduinoGenerator.forBlock['arduino_digital_write'] = function (block) {
    const pin = block.getFieldValue('PIN');
    const state = block.getFieldValue('STATE');
    return `  digitalWrite(${pin}, ${state});\n`;
};

arduinoGenerator.forBlock['arduino_digital_read'] = function (block) {
    const pin = block.getFieldValue('PIN');
    return [`digitalRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['arduino_analog_write'] = function (block) {
    const pin = block.getFieldValue('PIN');
    let value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    return `  analogWrite(${pin}, ${value});\n`;
};

arduinoGenerator.forBlock['arduino_analog_read'] = function (block) {
    const pin = block.getFieldValue('PIN');
    return [`analogRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['arduino_delay'] = function (block) {
    let delayTime = arduinoGenerator.valueToCode(block, 'DELAY_TIME', arduinoGenerator.ORDER_ATOMIC) || '1000';
    return `  delay(${delayTime});\n`;
};

arduinoGenerator.forBlock['arduino_millis'] = function (block) {
    return ['millis()', arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['arduino_serial_begin'] = function (block) {
    const baud = block.getFieldValue('BAUD');
    return `  Serial.begin(${baud});\n`;
};

arduinoGenerator.forBlock['arduino_serial_print'] = function (block) {
    const content = arduinoGenerator.valueToCode(block, 'CONTENT', arduinoGenerator.ORDER_ATOMIC) || '""';
    const newline = block.getFieldValue('NEWLINE') === 'TRUE';
    const fn = newline ? 'println' : 'print';
    return `  Serial.${fn}(${content});\n`;
};

arduinoGenerator.forBlock['arduino_serial_available'] = function () {
    return ['Serial.available()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

arduinoGenerator.forBlock['arduino_serial_read'] = function () {
    return ['Serial.read()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

arduinoGenerator.forBlock['arduino_pulse_in'] = function (block) {
    const pin = block.getFieldValue('PIN');
    const value = block.getFieldValue('VALUE');
    return [`pulseIn(${pin}, ${value})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

// --- Standard Blocks Generators Overrides for Arduino C++ --- //

arduinoGenerator.forBlock['math_number'] = function (block) {
    const code = String(block.getFieldValue('NUM'));
    return [code, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['math_arithmetic'] = function (block) {
    const OPERATORS = {
        'ADD': [' + ', arduinoGenerator.ORDER_ADDITION],
        'MINUS': [' - ', arduinoGenerator.ORDER_SUBTRACTION],
        'MULTIPLY': [' * ', arduinoGenerator.ORDER_MULTIPLICATION],
        'DIVIDE': [' / ', arduinoGenerator.ORDER_DIVISION],
        'POWER': [null, arduinoGenerator.ORDER_NONE] // Skip power for simple Arduino translation
    };
    const tuple = OPERATORS[block.getFieldValue('OP')];
    const operator = tuple[0];
    const order = tuple[1];
    const argument0 = arduinoGenerator.valueToCode(block, 'A', order) || '0';
    const argument1 = arduinoGenerator.valueToCode(block, 'B', order) || '0';

    if (!operator) {
        return [`pow(${argument0}, ${argument1})`, arduinoGenerator.ORDER_ATOMIC];
    }

    const code = argument0 + operator + argument1;
    return [code, order];
};

arduinoGenerator.forBlock['controls_if'] = function (block) {
    let n = 0;
    let code = '';
    do {
        const conditionCode = arduinoGenerator.valueToCode(block, 'IF' + n, arduinoGenerator.ORDER_NONE) || 'false';
        const branchCode = arduinoGenerator.statementToCode(block, 'DO' + n) || '';
        code += (n > 0 ? ' else ' : '') + `if (${conditionCode}) {
${branchCode}}`;
        n++;
    } while (block.getInput('IF' + n));

    if (block.getInput('ELSE')) {
        const branchCode = arduinoGenerator.statementToCode(block, 'ELSE') || '';
        code += ` else {
${branchCode}}`;
    }
    return code + '\n';
};

arduinoGenerator.forBlock['logic_compare'] = function (block) {
    const OPERATORS = {
        'EQ': '==',
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        'NEQ': '!=',
        'LT': '<',
        'LTE': '<=',
        'GT': '>',
        'GTE': '>='
    };
    const operator = OPERATORS[block.getFieldValue('OP')];
    const argument0 = arduinoGenerator.valueToCode(block, 'A', arduinoGenerator.ORDER_RELATIONAL) || '0';
    const argument1 = arduinoGenerator.valueToCode(block, 'B', arduinoGenerator.ORDER_RELATIONAL) || '0';
    const code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, arduinoGenerator.ORDER_RELATIONAL];
};

arduinoGenerator.forBlock['logic_operation'] = function (block) {
    const operator = block.getFieldValue('OP') === 'AND' ? '&&' : '||';
    const order = operator === '&&' ? arduinoGenerator.ORDER_LOGICAL_AND : arduinoGenerator.ORDER_LOGICAL_OR;
    const argument0 = arduinoGenerator.valueToCode(block, 'A', order);
    const argument1 = arduinoGenerator.valueToCode(block, 'B', order);
    if (!argument0 && !argument1) {
        return ['false', arduinoGenerator.ORDER_ATOMIC];
    }
    const defaultArgument = operator === '&&' ? 'true' : 'false';
    const code = (argument0 || defaultArgument) + ' ' + operator + ' ' + (argument1 || defaultArgument);
    return [code, order];
};

arduinoGenerator.forBlock['logic_boolean'] = function (block) {
    const code = block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false';
    return [code, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['text'] = function (block) {
    // Manual quoting — Blockly.utils.string.quote was removed in newer Blockly versions
    const text = block.getFieldValue('TEXT') || '';
    const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const code = `"${escaped}"`;
    return [code, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['controls_repeat_ext'] = function (block) {
    const repeats = arduinoGenerator.valueToCode(block, 'TIMES', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
    const branch = arduinoGenerator.statementToCode(block, 'DO') || '';
    // S116: Deterministic loop var — no collision with user variables
    const loopVar = `_loop${arduinoGenerator._loopVarCounter++}`;
    return `  for (int ${loopVar} = 0; ${loopVar} < ${repeats}; ${loopVar}++) {
${branch}  }\n`;
};

arduinoGenerator.forBlock['controls_whileUntil'] = function (block) {
    const until = block.getFieldValue('MODE') === 'UNTIL';
    let cond = arduinoGenerator.valueToCode(block, 'BOOL', arduinoGenerator.ORDER_NONE) || 'false';
    const branch = arduinoGenerator.statementToCode(block, 'DO') || '';
    if (until) cond = `!(${cond})`;
    return `  while (${cond}) {\n${branch}  }\n`;
};

arduinoGenerator.forBlock['controls_for'] = function (block) {
    // S112: Use user's variable name from FieldVariable so it's accessible inside the loop body.
    // Register in _declaredVars to prevent variables_set from re-declaring it as global.
    const varField = block.getField('VAR');
    const varName = varField ? varField.getText() : `_loop${arduinoGenerator._loopVarCounter++}`;
    arduinoGenerator._declaredVars.add(varName);
    const from = arduinoGenerator.valueToCode(block, 'FROM', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
    const to = arduinoGenerator.valueToCode(block, 'TO', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
    const by = arduinoGenerator.valueToCode(block, 'BY', arduinoGenerator.ORDER_ASSIGNMENT) || '1';
    const branch = arduinoGenerator.statementToCode(block, 'DO') || '';
    // G54: Guard against negative step creating infinite loop
    const stepNum = parseFloat(by);
    const comparison = (stepNum < 0) ? '>=' : '<=';
    return `  for (int ${varName} = ${from}; ${varName} ${comparison} ${to}; ${varName} += ${by}) {\n${branch}  }\n`;
};

arduinoGenerator.forBlock['logic_negate'] = function (block) {
    const argument = arduinoGenerator.valueToCode(block, 'BOOL', arduinoGenerator.ORDER_UNARY_PREFIX) || 'true';
    return [`!${argument}`, arduinoGenerator.ORDER_UNARY_PREFIX];
};

arduinoGenerator.forBlock['text_join'] = function (block) {
    // S103: Dynamic N-item String concatenation for Arduino
    const itemCount = block.itemCount_ || 2;
    if (itemCount === 0) return ['""', arduinoGenerator.ORDER_ATOMIC];
    if (itemCount === 1) {
        const val = arduinoGenerator.valueToCode(block, 'ADD0', arduinoGenerator.ORDER_ATOMIC) || '""';
        return [`String(${val})`, arduinoGenerator.ORDER_ATOMIC];
    }
    const parts = [];
    for (let i = 0; i < itemCount; i++) {
        parts.push(`String(${arduinoGenerator.valueToCode(block, 'ADD' + i, arduinoGenerator.ORDER_ADDITION) || '""'})`);
    }
    return [parts.join(' + '), arduinoGenerator.ORDER_ADDITION];
};

// --- Tone / Buzzer --- //

arduinoGenerator.forBlock['arduino_tone'] = function (block) {
    const pin = block.getFieldValue('PIN');
    const freq = arduinoGenerator.valueToCode(block, 'FREQ', arduinoGenerator.ORDER_ATOMIC) || '440';
    return `  tone(${pin}, ${freq});\n`;
};

arduinoGenerator.forBlock['arduino_no_tone'] = function (block) {
    const pin = block.getFieldValue('PIN');
    return `  noTone(${pin});\n`;
};

// --- Servo --- //

arduinoGenerator.forBlock['arduino_servo_attach'] = function (block) {
    const name = block.getFieldValue('NAME') || 'myServo';
    const pin = block.getFieldValue('PIN');
    arduinoGenerator._servoIncludes = true;
    arduinoGenerator._servoNames?.add(name);
    return `  ${name}.attach(${pin});\n`;
};

arduinoGenerator.forBlock['arduino_servo_write'] = function (block) {
    const name = block.getFieldValue('NAME') || 'myServo';
    const angle = arduinoGenerator.valueToCode(block, 'ANGLE', arduinoGenerator.ORDER_ATOMIC) || '90';
    arduinoGenerator._servoIncludes = true;
    arduinoGenerator._servoNames?.add(name);
    return `  ${name}.write(${angle});\n`;
};

arduinoGenerator.forBlock['arduino_servo_read'] = function (block) {
    const name = block.getFieldValue('NAME') || 'myServo';
    arduinoGenerator._servoIncludes = true;
    arduinoGenerator._servoNames?.add(name);
    return [`${name}.read()`, arduinoGenerator.ORDER_ATOMIC];
};

// --- LCD Display --- //

arduinoGenerator.forBlock['arduino_lcd_init'] = function (block) {
    const rs = block.getFieldValue('RS');
    const e = block.getFieldValue('E');
    const d4 = block.getFieldValue('D4');
    const d5 = block.getFieldValue('D5');
    const d6 = block.getFieldValue('D6');
    const d7 = block.getFieldValue('D7');
    const cols = block.getFieldValue('COLS');
    const rows = block.getFieldValue('ROWS');
    arduinoGenerator._lcdIncludes = true;
    arduinoGenerator._lcdPins = { rs, e, d4, d5, d6, d7 };
    arduinoGenerator._lcdBegin = { cols, rows };
    // lcd.begin() is emitted automatically in header by arduino_base
    return '';
};

arduinoGenerator.forBlock['arduino_lcd_print'] = function (block) {
    const text = arduinoGenerator.valueToCode(block, 'TEXT', arduinoGenerator.ORDER_ATOMIC) || '""';
    return `  lcd.print(${text});\n`;
};

arduinoGenerator.forBlock['arduino_lcd_set_cursor'] = function (block) {
    const col = block.getFieldValue('COL');
    const row = block.getFieldValue('ROW');
    return `  lcd.setCursor(${col}, ${row});\n`;
};

arduinoGenerator.forBlock['arduino_lcd_clear'] = function (block) {
    return '  lcd.clear();\n';
};

// --- Variables --- //

// Custom ELAB variable blocks (with TYPE field for explicit declaration)
// S112: Global declaration pattern — variable is declared once in header (like variables_set S116),
// so it's accessible in both setup() and loop(). Prevents redeclaration errors.
arduinoGenerator.forBlock['arduino_variable_set'] = function (block) {
    const varName = block.getFieldValue('VAR') || 'x';
    const type = block.getFieldValue('TYPE') || 'int';
    const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
    if (!arduinoGenerator._declaredVars.has(varName)) {
        arduinoGenerator._declaredVars.add(varName);
        arduinoGenerator._globalVarDecls?.set(varName, type);
    }
    // Always emit plain assignment — declaration is global in header
    return `  ${varName} = ${value};\n`;
};

arduinoGenerator.forBlock['arduino_variable_get'] = function (block) {
    const varName = block.getFieldValue('VAR') || 'x';
    return [varName, arduinoGenerator.ORDER_ATOMIC];
};

// Blockly BUILT-IN variable blocks (FieldVariable — created from Variables toolbox category)
// These use getField('VAR').getText() to retrieve the variable name from the FieldVariable widget.
// Without these generators, any variable created via the default Blockly Variables category
// would produce malformed C++ (e.g., `if (x = 3)` instead of `if (x == 3)`).
arduinoGenerator._declaredVars = new Set();

arduinoGenerator.forBlock['variables_set'] = function (block) {
    const varField = block.getField('VAR');
    const varName = varField ? varField.getText() : 'x';
    const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
    // S116: Register as global declaration (emitted in header by arduino_base)
    // This ensures variables used across setup()/loop() are accessible in both scopes
    if (!arduinoGenerator._declaredVars.has(varName)) {
        arduinoGenerator._declaredVars.add(varName);
        arduinoGenerator._globalVarDecls?.set(varName, 'int');
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    }
    // Always emit plain assignment — declaration is global in header
    return `  ${varName} = ${value};\n`;
};

arduinoGenerator.forBlock['variables_get'] = function (block) {
    const varField = block.getField('VAR');
    const varName = varField ? varField.getText() : 'x';
    return [varName, arduinoGenerator.ORDER_ATOMIC];
};

// --- Math Extras (Blockly built-in) --- //

arduinoGenerator.forBlock['math_modulo'] = function (block) {
    const dividend = arduinoGenerator.valueToCode(block, 'DIVIDEND', arduinoGenerator.ORDER_MULTIPLICATION) || '0';
    const divisor = arduinoGenerator.valueToCode(block, 'DIVISOR', arduinoGenerator.ORDER_MULTIPLICATION) || '1';
    return [`${dividend} % ${divisor}`, arduinoGenerator.ORDER_MULTIPLICATION];
};

arduinoGenerator.forBlock['math_constrain'] = function (block) {
    const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    const low = arduinoGenerator.valueToCode(block, 'LOW', arduinoGenerator.ORDER_ATOMIC) || '0';
    const high = arduinoGenerator.valueToCode(block, 'HIGH', arduinoGenerator.ORDER_ATOMIC) || '255';
    return [`constrain(${value}, ${low}, ${high})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['math_random_int'] = function (block) {
    const from = arduinoGenerator.valueToCode(block, 'FROM', arduinoGenerator.ORDER_ATOMIC) || '0';
    const to = arduinoGenerator.valueToCode(block, 'TO', arduinoGenerator.ORDER_ATOMIC) || '100';
    return [`random(${from}, ${to} + 1)`, arduinoGenerator.ORDER_ATOMIC];
};

// --- Flow Control (break/continue) --- //

arduinoGenerator.forBlock['controls_flow_statements'] = function (block) {
    const flow = block.getFieldValue('FLOW');
    return flow === 'BREAK' ? '  break;\n' : '  continue;\n';
};

// --- Procedures (Blockly built-in function blocks) --- //

arduinoGenerator.forBlock['procedures_defnoreturn'] = function (block) {
    const funcName = block.getFieldValue('NAME') || 'myFunction';
    const branch = arduinoGenerator.statementToCode(block, 'STACK') || '';
    return `void ${funcName}() {\n${branch}}\n\n`;
};

arduinoGenerator.forBlock['procedures_defreturn'] = function (block) {
    const funcName = block.getFieldValue('NAME') || 'myFunction';
    const branch = arduinoGenerator.statementToCode(block, 'STACK') || '';
    const returnValue = arduinoGenerator.valueToCode(block, 'RETURN', arduinoGenerator.ORDER_NONE) || '0';
    return `int ${funcName}() {\n${branch}  return ${returnValue};\n}\n\n`;
};

arduinoGenerator.forBlock['procedures_callnoreturn'] = function (block) {
    const funcName = block.getFieldValue('NAME') || 'myFunction';
    return `  ${funcName}();\n`;
};

arduinoGenerator.forBlock['procedures_callreturn'] = function (block) {
    const funcName = block.getFieldValue('NAME') || 'myFunction';
    return [`${funcName}()`, arduinoGenerator.ORDER_ATOMIC];
};

// --- Random --- //

arduinoGenerator.forBlock['arduino_random'] = function (block) {
    const min = arduinoGenerator.valueToCode(block, 'MIN', arduinoGenerator.ORDER_ATOMIC) || '0';
    const max = arduinoGenerator.valueToCode(block, 'MAX', arduinoGenerator.ORDER_ATOMIC) || '3';
    return [`random(${min}, ${max} + 1)`, arduinoGenerator.ORDER_ATOMIC];
};

// --- Map --- //

arduinoGenerator.forBlock['arduino_map'] = function (block) {
    const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    const fromLow = arduinoGenerator.valueToCode(block, 'FROM_LOW', arduinoGenerator.ORDER_ATOMIC) || '0';
    const fromHigh = arduinoGenerator.valueToCode(block, 'FROM_HIGH', arduinoGenerator.ORDER_ATOMIC) || '1023';
    const toLow = arduinoGenerator.valueToCode(block, 'TO_LOW', arduinoGenerator.ORDER_ATOMIC) || '0';
    const toHigh = arduinoGenerator.valueToCode(block, 'TO_HIGH', arduinoGenerator.ORDER_ATOMIC) || '255';
    return [`map(${value}, ${fromLow}, ${fromHigh}, ${toLow}, ${toHigh})`, arduinoGenerator.ORDER_ATOMIC];
};

// S92: Generate code ONLY from the arduino_base block to prevent orphaned statements.
// workspaceToCode() iterates ALL top-level blocks, which can produce code outside
// functions if any blocks are disconnected from arduino_base.
export function generateArduinoCode(workspace) {
    const baseBlocks = workspace.getBlocksByType('arduino_base');
    if (!baseBlocks || baseBlocks.length === 0) {
        return 'void setup() {\n}\n\nvoid loop() {\n}\n';
    }
    arduinoGenerator.init(workspace);
    const code = arduinoGenerator.blockToCode(baseBlocks[0]);
    return typeof code === 'string' ? code : (Array.isArray(code) ? code[0] : '');
}
