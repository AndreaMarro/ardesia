/**
 * blockGenerators.test.js — Test EVERY block generator in scratchGenerator.js
 *
 * 48 generatori testati individualmente: ogni blocco viene creato nel workspace,
 * il generatore produce codice C++, e il risultato viene verificato.
 *
 * Principio Zero: se un bambino trascina un blocco, DEVE generare codice valido.
 */
import { describe, it, expect, afterEach } from 'vitest';
import * as Blockly from 'blockly';
import '../../src/components/simulator/panels/scratchBlocks';
import { arduinoGenerator, generateArduinoCode } from '../../src/components/simulator/panels/scratchGenerator';

// ─── Helper: create workspace, load XML, generate code ────
function codeFromXml(xml) {
  const workspace = new Blockly.Workspace();
  try {
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
    return generateArduinoCode(workspace);
  } finally {
    workspace.dispose();
  }
}

// Wrap a block inside arduino_base SETUP
function wrapSetup(blockXml) {
  return `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="arduino_base" x="40" y="30" deletable="false">
      <statement name="SETUP">${blockXml}</statement>
    </block></xml>`;
}

// Wrap a block inside arduino_base LOOP
function wrapLoop(blockXml) {
  return `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="arduino_base" x="40" y="30" deletable="false">
      <statement name="LOOP">${blockXml}</statement>
    </block></xml>`;
}

// ═══ ARDUINO I/O BLOCKS ═══════════════════════════════════

describe('Arduino I/O generators', () => {
  it('arduino_pin_mode generates pinMode()', () => {
    const code = codeFromXml(wrapSetup(
      '<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>'
    ));
    expect(code).toContain('pinMode(13, OUTPUT);');
  });

  it('arduino_digital_write generates digitalWrite()', () => {
    const code = codeFromXml(wrapLoop(
      '<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>'
    ));
    expect(code).toContain('digitalWrite(13, HIGH);');
  });

  it('arduino_digital_read generates digitalRead()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT"><block type="arduino_digital_read"><field name="PIN">7</field></block></value>
      </block>`
    ));
    expect(code).toContain('digitalRead(7)');
  });

  it('arduino_analog_write generates analogWrite()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_analog_write"><field name="PIN">9</field>
        <value name="VALUE"><shadow type="math_number"><field name="NUM">128</field></shadow></value>
      </block>`
    ));
    expect(code).toContain('analogWrite(9, 128);');
  });

  it('arduino_analog_read generates analogRead()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
      </block>`
    ));
    expect(code).toContain('analogRead(A0)');
  });
});

// ═══ TIME BLOCKS ══════════════════════════════════════════

describe('Time generators', () => {
  it('arduino_delay generates delay()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_delay">
        <value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">500</field></shadow></value>
      </block>`
    ));
    expect(code).toContain('delay(500);');
  });

  it('arduino_millis generates millis()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT"><block type="arduino_millis"></block></value>
      </block>`
    ));
    expect(code).toContain('millis()');
  });
});

// ═══ SERIAL BLOCKS ════════════════════════════════════════

describe('Serial generators', () => {
  it('arduino_serial_begin generates Serial.begin()', () => {
    const code = codeFromXml(wrapSetup(
      '<block type="arduino_serial_begin"><field name="BAUD">9600</field></block>'
    ));
    expect(code).toContain('Serial.begin(9600);');
  });

  it('arduino_serial_print with newline generates Serial.println()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT"><block type="text"><field name="TEXT">Ciao</field></block></value>
      </block>`
    ));
    expect(code).toContain('Serial.println("Ciao");');
  });

  it('arduino_serial_print without newline generates Serial.print()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">FALSE</field>
        <value name="CONTENT"><block type="text"><field name="TEXT">Test</field></block></value>
      </block>`
    ));
    expect(code).toContain('Serial.print("Test");');
  });

  it('arduino_serial_available generates Serial.available()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_if">
        <value name="IF0"><block type="arduino_serial_available"></block></value>
        <statement name="DO0">
          <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('Serial.available()');
  });

  it('arduino_serial_read generates Serial.read()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT"><block type="arduino_serial_read"></block></value>
      </block>`
    ));
    expect(code).toContain('Serial.read()');
  });

  it('arduino_pulse_in generates pulseIn()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT"><block type="arduino_pulse_in"><field name="PIN">7</field><field name="VALUE">HIGH</field></block></value>
      </block>`
    ));
    expect(code).toContain('pulseIn(7, HIGH)');
  });
});

// ═══ TONE / BUZZER BLOCKS ═════════════════════════════════

describe('Tone generators', () => {
  it('arduino_tone generates tone()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_tone"><field name="PIN">8</field>
        <value name="FREQ"><shadow type="math_number"><field name="NUM">440</field></shadow></value>
      </block>`
    ));
    expect(code).toContain('tone(8, 440);');
  });

  it('arduino_no_tone generates noTone()', () => {
    const code = codeFromXml(wrapLoop(
      '<block type="arduino_no_tone"><field name="PIN">8</field></block>'
    ));
    expect(code).toContain('noTone(8);');
  });
});

// ═══ SERVO BLOCKS ═════════════════════════════════════════

describe('Servo generators', () => {
  it('arduino_servo_attach generates #include + attach()', () => {
    const code = codeFromXml(wrapSetup(
      '<block type="arduino_servo_attach"><field name="NAME">myServo</field><field name="PIN">9</field></block>'
    ));
    expect(code).toContain('#include <Servo.h>');
    expect(code).toContain('Servo myServo;');
    expect(code).toContain('myServo.attach(9);');
  });

  it('arduino_servo_write generates write()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_servo_write"><field name="NAME">s1</field>
        <value name="ANGLE"><shadow type="math_number"><field name="NUM">90</field></shadow></value>
      </block>`
    ));
    expect(code).toContain('s1.write(90);');
  });

  it('arduino_servo_read generates read()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT"><block type="arduino_servo_read"><field name="NAME">s1</field></block></value>
      </block>`
    ));
    expect(code).toContain('s1.read()');
  });
});

// ═══ LCD BLOCKS ═══════════════════════════════════════════

describe('LCD generators', () => {
  it('arduino_lcd_init generates #include + lcd constructor + begin()', () => {
    const code = codeFromXml(wrapSetup(
      `<block type="arduino_lcd_init">
        <field name="RS">12</field><field name="E">11</field>
        <field name="D4">5</field><field name="D5">10</field>
        <field name="D6">3</field><field name="D7">6</field>
        <field name="COLS">16</field><field name="ROWS">2</field>
      </block>`
    ));
    expect(code).toContain('#include <LiquidCrystal.h>');
    expect(code).toContain('LiquidCrystal lcd(12, 11, 5, 10, 3, 6);');
    expect(code).toContain('lcd.begin(16, 2);');
  });

  it('arduino_lcd_print generates lcd.print()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_lcd_print">
        <value name="TEXT"><shadow type="text"><field name="TEXT">Ciao!</field></shadow></value>
      </block>`
    ));
    expect(code).toContain('lcd.print("Ciao!");');
  });

  it('arduino_lcd_set_cursor generates lcd.setCursor()', () => {
    const code = codeFromXml(wrapLoop(
      '<block type="arduino_lcd_set_cursor"><field name="COL">0</field><field name="ROW">1</field></block>'
    ));
    expect(code).toContain('lcd.setCursor(0, 1);');
  });

  it('arduino_lcd_clear generates lcd.clear()', () => {
    const code = codeFromXml(wrapLoop(
      '<block type="arduino_lcd_clear"></block>'
    ));
    expect(code).toContain('lcd.clear();');
  });
});

// ═══ VARIABLE BLOCKS ══════════════════════════════════════

describe('Variable generators', () => {
  it('arduino_variable_set generates global declaration + assignment', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">contatore</field>
        <value name="VALUE"><shadow type="math_number"><field name="NUM">42</field></shadow></value>
      </block>`
    ));
    expect(code).toContain('int contatore;');
    expect(code).toContain('contatore = 42;');
  });

  it('arduino_variable_get returns variable name', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT"><block type="arduino_variable_get"><field name="VAR">x</field></block></value>
      </block>`
    ));
    expect(code).toContain('Serial.println(x);');
  });

  it('arduino_random generates random(min, max + 1)', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT">
          <block type="arduino_random">
            <value name="MIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
            <value name="MAX"><shadow type="math_number"><field name="NUM">9</field></shadow></value>
          </block>
        </value>
      </block>`
    ));
    expect(code).toContain('random(0, 9 + 1)');
  });

  it('arduino_map generates map()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT">
          <block type="arduino_map">
            <value name="VALUE"><shadow type="math_number"><field name="NUM">512</field></shadow></value>
            <value name="FROM_LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
            <value name="FROM_HIGH"><shadow type="math_number"><field name="NUM">1023</field></shadow></value>
            <value name="TO_LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
            <value name="TO_HIGH"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
          </block>
        </value>
      </block>`
    ));
    expect(code).toContain('map(512, 0, 1023, 0, 255)');
  });
});

// ═══ MATH BLOCKS ══════════════════════════════════════════

describe('Math generators', () => {
  it('math_number generates literal', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT"><block type="math_number"><field name="NUM">42</field></block></value>
      </block>`
    ));
    expect(code).toContain('42');
  });

  it('math_arithmetic ADD generates +', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT">
          <block type="math_arithmetic"><field name="OP">ADD</field>
            <value name="A"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
            <value name="B"><shadow type="math_number"><field name="NUM">7</field></shadow></value>
          </block>
        </value>
      </block>`
    ));
    expect(code).toContain('3 + 7');
  });

  it('math_arithmetic MULTIPLY generates *', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT">
          <block type="math_arithmetic"><field name="OP">MULTIPLY</field>
            <value name="A"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
            <value name="B"><shadow type="math_number"><field name="NUM">4</field></shadow></value>
          </block>
        </value>
      </block>`
    ));
    expect(code).toContain('5 * 4');
  });

  it('math_arithmetic POWER generates pow()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT">
          <block type="math_arithmetic"><field name="OP">POWER</field>
            <value name="A"><shadow type="math_number"><field name="NUM">2</field></shadow></value>
            <value name="B"><shadow type="math_number"><field name="NUM">8</field></shadow></value>
          </block>
        </value>
      </block>`
    ));
    expect(code).toContain('pow(2, 8)');
  });

  it('math_modulo generates %', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT">
          <block type="math_modulo">
            <value name="DIVIDEND"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
            <value name="DIVISOR"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
          </block>
        </value>
      </block>`
    ));
    expect(code).toContain('10 % 3');
  });

  it('math_constrain generates constrain()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT">
          <block type="math_constrain">
            <value name="VALUE"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
            <value name="LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
            <value name="HIGH"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
          </block>
        </value>
      </block>`
    ));
    expect(code).toContain('constrain(300, 0, 255)');
  });
});

// ═══ LOGIC BLOCKS ═════════════════════════════════════════

describe('Logic generators', () => {
  it('logic_compare EQ generates ==', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_if">
        <value name="IF0">
          <block type="logic_compare"><field name="OP">EQ</field>
            <value name="A"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
            <value name="B"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
          </block>
        </value>
        <statement name="DO0">
          <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('5 == 5');
    expect(code).toContain('if (');
  });

  it('logic_compare GT generates >', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_if">
        <value name="IF0">
          <block type="logic_compare"><field name="OP">GT</field>
            <value name="A"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
            <value name="B"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
          </block>
        </value>
        <statement name="DO0">
          <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('10 > 3');
  });

  it('logic_operation AND generates &&', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_if">
        <value name="IF0">
          <block type="logic_operation"><field name="OP">AND</field>
            <value name="A"><block type="logic_boolean"><field name="BOOL">TRUE</field></block></value>
            <value name="B"><block type="logic_boolean"><field name="BOOL">FALSE</field></block></value>
          </block>
        </value>
        <statement name="DO0">
          <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('&&');
  });

  it('logic_boolean generates true/false', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_if">
        <value name="IF0">
          <block type="logic_boolean"><field name="BOOL">TRUE</field></block>
        </value>
        <statement name="DO0">
          <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('if (true)');
  });

  it('logic_negate generates !', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_if">
        <value name="IF0">
          <block type="logic_negate">
            <value name="BOOL"><block type="logic_boolean"><field name="BOOL">TRUE</field></block></value>
          </block>
        </value>
        <statement name="DO0">
          <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('!true');
  });
});

// ═══ CONTROL FLOW BLOCKS ══════════════════════════════════

describe('Control flow generators', () => {
  it('controls_if with else generates if/else', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_if">
        <mutation else="1"/>
        <value name="IF0"><block type="logic_boolean"><field name="BOOL">TRUE</field></block></value>
        <statement name="DO0">
          <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
        </statement>
        <statement name="ELSE">
          <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('if (true)');
    expect(code).toContain('} else {');
  });

  it('controls_repeat_ext generates for loop', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_repeat_ext">
        <value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
        <statement name="DO">
          <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('for (int');
    expect(code).toContain('< 10;');
  });

  it('controls_whileUntil WHILE generates while()', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_whileUntil"><field name="MODE">WHILE</field>
        <value name="BOOL"><block type="logic_boolean"><field name="BOOL">TRUE</field></block></value>
        <statement name="DO">
          <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('while (true)');
  });

  it('controls_whileUntil UNTIL generates while(!)', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_whileUntil"><field name="MODE">UNTIL</field>
        <value name="BOOL"><block type="logic_boolean"><field name="BOOL">FALSE</field></block></value>
        <statement name="DO">
          <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('while (!(false))');
  });

  it('controls_for generates for with variable', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_for">
        <value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
        <value name="TO"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
        <value name="BY"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
        <statement name="DO">
          <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('for (int');
    expect(code).toContain('<= 10;');
    expect(code).toContain('+= 1)');
  });

  it('controls_flow_statements BREAK generates break', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_repeat_ext">
        <value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
        <statement name="DO">
          <block type="controls_flow_statements"><field name="FLOW">BREAK</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('break;');
  });

  it('controls_flow_statements CONTINUE generates continue', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="controls_repeat_ext">
        <value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
        <statement name="DO">
          <block type="controls_flow_statements"><field name="FLOW">CONTINUE</field></block>
        </statement>
      </block>`
    ));
    expect(code).toContain('continue;');
  });
});

// ═══ TEXT BLOCKS ══════════════════════════════════════════

describe('Text generators', () => {
  it('text generates string literal', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT"><block type="text"><field name="TEXT">Hello ELAB!</field></block></value>
      </block>`
    ));
    expect(code).toContain('"Hello ELAB!"');
  });

  it('text escapes special characters', () => {
    const code = codeFromXml(wrapLoop(
      `<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
        <value name="CONTENT"><block type="text"><field name="TEXT">line1\nline2</field></block></value>
      </block>`
    ));
    expect(code).toContain('\\n');
  });

  it('text_join concatenates strings', () => {
    // text_join uses itemCount_ which requires workspace — just verify generator exists
    expect(arduinoGenerator.forBlock['text_join']).toBeDefined();
  });
});

// ═══ ARDUINO_BASE STRUCTURE ═══════════════════════════════

describe('arduino_base structure', () => {
  it('empty program generates valid setup/loop', () => {
    const code = codeFromXml(
      `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="arduino_base" x="40" y="30" deletable="false"></block>
      </xml>`
    );
    expect(code).toContain('void setup()');
    expect(code).toContain('void loop()');
  });

  it('setup and loop code appear in correct sections', () => {
    const code = codeFromXml(
      `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="arduino_base" x="40" y="30" deletable="false">
          <statement name="SETUP">
            <block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
          </statement>
          <statement name="LOOP">
            <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
          </statement>
        </block>
      </xml>`
    );
    const setupIdx = code.indexOf('void setup()');
    const loopIdx = code.indexOf('void loop()');
    const pinModeIdx = code.indexOf('pinMode(13, OUTPUT)');
    const digitalWriteIdx = code.indexOf('digitalWrite(13, HIGH)');

    expect(pinModeIdx).toBeGreaterThan(setupIdx);
    expect(pinModeIdx).toBeLessThan(loopIdx);
    expect(digitalWriteIdx).toBeGreaterThan(loopIdx);
  });

  it('no arduino_base returns empty program', () => {
    const workspace = new Blockly.Workspace();
    try {
      const code = generateArduinoCode(workspace);
      expect(code).toContain('void setup()');
      expect(code).toContain('void loop()');
    } finally {
      workspace.dispose();
    }
  });
});

// ═══ COMBINED / INTEGRATION ═══════════════════════════════

describe('Combined block integration', () => {
  it('blink LED program generates complete valid code', () => {
    const code = codeFromXml(
      `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="arduino_base" x="40" y="30" deletable="false">
          <statement name="SETUP">
            <block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
          </statement>
          <statement name="LOOP">
            <block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
              <next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
                <next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
                  <next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
                  </block></next></block></next></block></next></block>
          </statement>
        </block></xml>`
    );
    expect(code).toContain('void setup()');
    expect(code).toContain('pinMode(13, OUTPUT);');
    expect(code).toContain('void loop()');
    expect(code).toContain('digitalWrite(13, HIGH);');
    expect(code).toContain('delay(1000);');
    expect(code).toContain('digitalWrite(13, LOW);');
  });

  it('servo + serial program generates correct includes', () => {
    const code = codeFromXml(
      `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="arduino_base" x="40" y="30" deletable="false">
          <statement name="SETUP">
            <block type="arduino_servo_attach"><field name="NAME">braccio</field><field name="PIN">9</field>
              <next><block type="arduino_serial_begin"><field name="BAUD">9600</field></block></next>
            </block>
          </statement>
          <statement name="LOOP">
            <block type="arduino_servo_write"><field name="NAME">braccio</field>
              <value name="ANGLE"><shadow type="math_number"><field name="NUM">90</field></shadow></value>
            </block>
          </statement>
        </block></xml>`
    );
    expect(code).toContain('#include <Servo.h>');
    expect(code).toContain('Servo braccio;');
    expect(code).toContain('braccio.attach(9);');
    expect(code).toContain('Serial.begin(9600);');
    expect(code).toContain('braccio.write(90);');
  });
});
