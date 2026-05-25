/**
 * scratchGenerator.pinMode.test.js — Wave 1 Impl-B first slice
 *
 * Tests pinMode auto-emission in setup() based on digitalWrite/digitalRead
 * usage elsewhere in the program. The generator should walk the workspace,
 * collect pin usage (OUTPUT for digitalWrite, INPUT for digitalRead), then
 * emit pinMode calls at the start of setup() in stable pin-number order.
 *
 * OUTPUT wins when same pin appears in both digitalWrite and digitalRead
 * (matches the Arduino convention: pinMode set last wins, OUTPUT pins can
 * still be read but reading an INPUT pin you have driven HIGH would be undefined).
 *
 * Spec: PROMPT-CROSSCOMPILATORE Sez 2 + Sez 3
 * Plan: 2026-05-25-blockly-crosscompiler-definitivo.md iter X.2 Wave 1
 */
import { describe, it, expect } from 'vitest';
import * as Blockly from 'blockly';
import '../../../../../src/components/simulator/panels/scratchBlocks';
import { generateArduinoCode } from '../../../../../src/components/simulator/panels/scratchGenerator';

// ─── Helper: build workspace from XML, generate code ──────
function codeFromXml(xml) {
    const workspace = new Blockly.Workspace();
    try {
        Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
        return generateArduinoCode(workspace);
    } finally {
        workspace.dispose();
    }
}

// Helper: extract setup() body from generated code
function extractSetupBody(code) {
    const match = code.match(/void setup\(\) \{([\s\S]*?)\}\s*\n\s*void loop/);
    return match ? match[1] : '';
}

describe('scratchGenerator pinMode auto-emission (Wave 1 Impl-B)', () => {
    it('Test 1: digitalWrite(13, HIGH) only → setup() contains pinMode(13, OUTPUT)', () => {
        const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
            <block type="arduino_base" x="40" y="30" deletable="false">
                <statement name="LOOP">
                    <block type="arduino_digital_write">
                        <field name="PIN">13</field>
                        <field name="STATE">HIGH</field>
                    </block>
                </statement>
            </block>
        </xml>`;
        const code = codeFromXml(xml);
        const setupBody = extractSetupBody(code);
        expect(setupBody).toContain('pinMode(13, OUTPUT);');
    });

    it('Test 2: digitalRead(2) only → setup() contains pinMode(2, INPUT)', () => {
        // digitalRead returns a value, so wrap it in a Serial.print to land in LOOP
        const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
            <block type="arduino_base" x="40" y="30" deletable="false">
                <statement name="LOOP">
                    <block type="arduino_serial_print">
                        <field name="NEWLINE">TRUE</field>
                        <value name="CONTENT">
                            <block type="arduino_digital_read">
                                <field name="PIN">2</field>
                            </block>
                        </value>
                    </block>
                </statement>
            </block>
        </xml>`;
        const code = codeFromXml(xml);
        const setupBody = extractSetupBody(code);
        expect(setupBody).toContain('pinMode(2, INPUT);');
    });

    it('Test 3: digitalWrite(6, HIGH) + digitalRead(7) → setup() has BOTH pinMode calls in correct mode', () => {
        const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
            <block type="arduino_base" x="40" y="30" deletable="false">
                <statement name="LOOP">
                    <block type="arduino_digital_write">
                        <field name="PIN">6</field>
                        <field name="STATE">HIGH</field>
                        <next>
                            <block type="arduino_serial_print">
                                <field name="NEWLINE">TRUE</field>
                                <value name="CONTENT">
                                    <block type="arduino_digital_read">
                                        <field name="PIN">7</field>
                                    </block>
                                </value>
                            </block>
                        </next>
                    </block>
                </statement>
            </block>
        </xml>`;
        const code = codeFromXml(xml);
        const setupBody = extractSetupBody(code);
        expect(setupBody).toContain('pinMode(6, OUTPUT);');
        expect(setupBody).toContain('pinMode(7, INPUT);');
        // Stable sort: low to high pin number → 6 before 7
        const idx6 = setupBody.indexOf('pinMode(6');
        const idx7 = setupBody.indexOf('pinMode(7');
        expect(idx6).toBeGreaterThanOrEqual(0);
        expect(idx7).toBeGreaterThan(idx6);
    });

    it('Test 4: no GPIO usage → setup() has NO pinMode calls (no spurious emissions)', () => {
        // Only a delay in LOOP — no digitalWrite/digitalRead anywhere
        const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
            <block type="arduino_base" x="40" y="30" deletable="false">
                <statement name="LOOP">
                    <block type="arduino_delay">
                        <value name="DELAY_TIME">
                            <shadow type="math_number"><field name="NUM">1000</field></shadow>
                        </value>
                    </block>
                </statement>
            </block>
        </xml>`;
        const code = codeFromXml(xml);
        const setupBody = extractSetupBody(code);
        expect(setupBody).not.toContain('pinMode(');
    });

    it('Test 5b (Wave 1b): servo block → header emits #include <Servo.h>', () => {
        const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
            <block type="arduino_base" x="40" y="30" deletable="false">
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
                            <shadow type="math_number"><field name="NUM">90</field></shadow>
                        </value>
                    </block>
                </statement>
            </block>
        </xml>`;
        const code = codeFromXml(xml);
        expect(code).toContain('#include <Servo.h>');
        expect(code).toContain('Servo myServo;');
    });

    it('Test 5c (Wave 1b): LCD init block → header emits #include <LiquidCrystal.h>', () => {
        const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
            <block type="arduino_base" x="40" y="30" deletable="false">
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
                    <block type="arduino_lcd_print">
                        <value name="TEXT">
                            <block type="text">
                                <field name="TEXT">Ciao</field>
                            </block>
                        </value>
                    </block>
                </statement>
            </block>
        </xml>`;
        const code = codeFromXml(xml);
        expect(code).toContain('#include <LiquidCrystal.h>');
        expect(code).toContain('LiquidCrystal lcd(12, 11, 5, 4, 3, 2);');
    });

    it('Test 5d (Wave 1b): no Servo / LCD usage → no spurious #include headers', () => {
        const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
            <block type="arduino_base" x="40" y="30" deletable="false">
                <statement name="LOOP">
                    <block type="arduino_digital_write">
                        <field name="PIN">13</field>
                        <field name="STATE">HIGH</field>
                    </block>
                </statement>
            </block>
        </xml>`;
        const code = codeFromXml(xml);
        expect(code).not.toContain('#include <Servo.h>');
        expect(code).not.toContain('#include <LiquidCrystal.h>');
        expect(code).not.toContain('#include <SoftwareSerial.h>');
        expect(code).not.toContain('#include <Wire.h>');
    });

    it('Test 5e (Wave 1b): Blockly variable usage → variable declared before setup()', () => {
        const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
            <block type="arduino_base" x="40" y="30" deletable="false">
                <statement name="SETUP">
                    <block type="arduino_variable_set">
                        <field name="VAR">ledPin</field>
                        <field name="TYPE">int</field>
                        <value name="VALUE">
                            <shadow type="math_number"><field name="NUM">13</field></shadow>
                        </value>
                    </block>
                </statement>
            </block>
        </xml>`;
        const code = codeFromXml(xml);
        const setupIdx = code.indexOf('void setup()');
        const declIdx = code.indexOf('int ledPin;');
        expect(declIdx).toBeGreaterThanOrEqual(0);
        expect(declIdx).toBeLessThan(setupIdx);
    });

    it('Test 6: same pin in digitalWrite AND digitalRead → OUTPUT wins (Arduino convention)', () => {
        const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
            <block type="arduino_base" x="40" y="30" deletable="false">
                <statement name="LOOP">
                    <block type="arduino_digital_write">
                        <field name="PIN">5</field>
                        <field name="STATE">HIGH</field>
                        <next>
                            <block type="arduino_serial_print">
                                <field name="NEWLINE">TRUE</field>
                                <value name="CONTENT">
                                    <block type="arduino_digital_read">
                                        <field name="PIN">5</field>
                                    </block>
                                </value>
                            </block>
                        </next>
                    </block>
                </statement>
            </block>
        </xml>`;
        const code = codeFromXml(xml);
        const setupBody = extractSetupBody(code);
        expect(setupBody).toContain('pinMode(5, OUTPUT);');
        // Sanity check: no INPUT mode for pin 5 (OUTPUT wins, single emission)
        expect(setupBody).not.toContain('pinMode(5, INPUT);');
        // Sanity check: only ONE pinMode call for pin 5
        const matches = setupBody.match(/pinMode\(5,/g) || [];
        expect(matches.length).toBe(1);
    });
});
