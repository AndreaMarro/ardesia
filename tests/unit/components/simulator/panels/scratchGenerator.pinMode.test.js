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

    it('Test 5: same pin in digitalWrite AND digitalRead → OUTPUT wins (Arduino convention)', () => {
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
