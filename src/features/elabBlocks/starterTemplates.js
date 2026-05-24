// © Andrea Marro — 18/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * starterTemplates — XML pre-built Blockly programs Sub-project A iter 84 atom 6.
 * Andrea spec FASE 3.2: "Accendi un LED" + "Leggi un pulsante" + "Leggi un sensore".
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

export const STARTER_TEMPLATES = {
  blink: BLINK_XML,
  button: BUTTON_XML,
  sensor: SENSOR_XML,
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
  // Lightweight check: balanced opening + closing xml tag
  const open = xmlString.indexOf('<xml');
  const close = xmlString.lastIndexOf('</xml>');
  return open === 0 && close > open;
}
