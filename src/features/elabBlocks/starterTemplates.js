// © Andrea Marro — 18/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * starterTemplates — Blockly XML pre-built programs.
 *
 * Wave 1 (Sub-project A iter 84 atom 6) shipped: blink, button, sensor.
 * Wave 1b (Impl-B-2 2026-05-25) adds: servo-sweep, lcd-hello, button-led, serial-echo.
 *
 * Brief: docs/dispatch/2026-05-25-wave-1b-team-brief.md (Impl-B-2 scope, Sez 2 task 8).
 *
 * Returns Blockly-compatible XML string for Xml.domToWorkspace(xml, workspace).
 * Default blink targets the built-in LED on the Arduino Nano R4 board, so no
 * external circuit, breadboard, or wires are required.
 */

const BLINK_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="arduino_base" x="20" y="20">
    <statement name="SETUP">
      <block type="arduino_pin_mode">
        <field name="PIN">13</field>
        <field name="MODE">OUTPUT</field>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="arduino_digital_write">
        <field name="PIN">13</field>
        <field name="STATE">HIGH</field>
        <next>
          <block type="arduino_delay">
            <value name="DELAY_TIME">
              <shadow type="math_number">
                <field name="NUM">1000</field>
              </shadow>
            </value>
            <next>
              <block type="arduino_digital_write">
                <field name="PIN">13</field>
                <field name="STATE">LOW</field>
                <next>
                  <block type="arduino_delay">
                    <value name="DELAY_TIME">
                      <shadow type="math_number">
                        <field name="NUM">1000</field>
                      </shadow>
                    </value>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;

const BUTTON_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="arduino_base" x="20" y="20">
    <statement name="SETUP">
      <block type="arduino_pin_mode">
        <field name="PIN">2</field>
        <field name="MODE">INPUT</field>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="controls_if">
        <value name="IF0">
          <block type="arduino_digital_read">
            <field name="PIN">2</field>
          </block>
        </value>
        <statement name="DO0">
          <block type="arduino_digital_write">
            <field name="PIN">13</field>
            <field name="STATE">HIGH</field>
          </block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`;

const SENSOR_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="arduino_base" x="20" y="20">
    <statement name="SETUP">
      <block type="arduino_serial_begin">
        <field name="BAUD">9600</field>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="arduino_serial_print">
        <value name="VALUE">
          <block type="arduino_analog_read">
            <field name="PIN">A0</field>
          </block>
        </value>
        <next>
          <block type="arduino_delay">
            <field name="MS">500</field>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;

const SERVO_SWEEP_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="arduino_base" x="20" y="20">
    <statement name="SETUP">
      <block type="arduino_servo_attach">
        <field name="NAME">myServo</field>
        <field name="PIN">9</field>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="arduino_servo_write">
        <field name="NAME">myServo</field>
        <value name="ANGLE">
          <shadow type="math_number">
            <field name="NUM">0</field>
          </shadow>
        </value>
        <next>
          <block type="arduino_delay">
            <value name="DELAY_TIME">
              <shadow type="math_number">
                <field name="NUM">500</field>
              </shadow>
            </value>
            <next>
              <block type="arduino_servo_write">
                <field name="NAME">myServo</field>
                <value name="ANGLE">
                  <shadow type="math_number">
                    <field name="NUM">180</field>
                  </shadow>
                </value>
                <next>
                  <block type="arduino_delay">
                    <value name="DELAY_TIME">
                      <shadow type="math_number">
                        <field name="NUM">500</field>
                      </shadow>
                    </value>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;

const LCD_HELLO_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="arduino_base" x="20" y="20">
    <statement name="SETUP">
      <block type="arduino_lcd_init">
        <field name="RS">12</field>
        <field name="E">11</field>
        <field name="D4">5</field>
        <field name="D5">4</field>
        <field name="D6">3</field>
        <field name="D7">2</field>
        <field name="COLS">16</field>
        <field name="ROWS">2</field>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="arduino_lcd_set_cursor">
        <field name="COL">0</field>
        <field name="ROW">0</field>
        <next>
          <block type="arduino_lcd_print">
            <value name="TEXT">
              <block type="text">
                <field name="TEXT">Ciao ELAB</field>
              </block>
            </value>
            <next>
              <block type="arduino_delay">
                <value name="DELAY_TIME">
                  <shadow type="math_number">
                    <field name="NUM">1000</field>
                  </shadow>
                </value>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;

const BUTTON_LED_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="arduino_base" x="20" y="20">
    <statement name="SETUP">
      <block type="arduino_pin_mode">
        <field name="PIN">2</field>
        <field name="MODE">INPUT</field>
        <next>
          <block type="arduino_pin_mode">
            <field name="PIN">13</field>
            <field name="MODE">OUTPUT</field>
          </block>
        </next>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="controls_if">
        <mutation else="1"/>
        <value name="IF0">
          <block type="arduino_digital_read">
            <field name="PIN">2</field>
          </block>
        </value>
        <statement name="DO0">
          <block type="arduino_digital_write">
            <field name="PIN">13</field>
            <field name="STATE">HIGH</field>
          </block>
        </statement>
        <statement name="ELSE">
          <block type="arduino_digital_write">
            <field name="PIN">13</field>
            <field name="STATE">LOW</field>
          </block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`;

const SERIAL_ECHO_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="arduino_base" x="20" y="20">
    <statement name="SETUP">
      <block type="arduino_serial_begin">
        <field name="BAUD">9600</field>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="controls_if">
        <value name="IF0">
          <block type="arduino_serial_available" />
        </value>
        <statement name="DO0">
          <block type="arduino_serial_print">
            <field name="NEWLINE">TRUE</field>
            <value name="CONTENT">
              <block type="arduino_serial_read" />
            </value>
          </block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`;

export const STARTER_TEMPLATES = {
  blink: BLINK_XML,
  button: BUTTON_XML,
  sensor: SENSOR_XML,
  'servo-sweep': SERVO_SWEEP_XML,
  'lcd-hello': LCD_HELLO_XML,
  'button-led': BUTTON_LED_XML,
  'serial-echo': SERIAL_ECHO_XML,
};

/**
 * Get Blockly XML string for a starter key.
 * Returns null if key invalid (defensive — parent should validate).
 */
export function getStarterXml(key) {
  if (!Object.prototype.hasOwnProperty.call(STARTER_TEMPLATES, key)) {
    return null;
  }
  return STARTER_TEMPLATES[key];
}

/**
 * Validate XML is parseable + well-formed (defensive prep iter 85 toolbox integration).
 * NON parses Blockly semantic — only XML structure.
 */
export function isValidStarterXml(xmlString) {
  if (typeof xmlString !== 'string' || xmlString.length === 0) return false;
  const open = xmlString.indexOf('<xml');
  const close = xmlString.lastIndexOf('</xml>');
  return open === 0 && close > open;
}
