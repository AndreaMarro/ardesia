/**
 * DEEP Pin and Connection Validator for ELAB Simulator
 * Validates connections, pinAssignments, AND buildSteps wire references
 * for all 69 experiments against SVG component pin definitions.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Component pin definitions (extracted from SVG jsx files)
const COMPONENT_PINS = {
  'led': ['anode', 'cathode'],
  'resistor': ['pin1', 'pin2'],
  'capacitor': ['positive', 'negative'],
  'potentiometer': ['vcc', 'signal', 'gnd'],
  'push-button': ['pin1', 'pin2', 'pin3', 'pin4'],
  'buzzer-piezo': ['positive', 'negative'],
  'rgb-led': ['red', 'common', 'green', 'blue'],
  'photo-resistor': ['pin1', 'pin2'],
  'reed-switch': ['pin1', 'pin2'],
  'battery9v': ['positive', 'negative'],
  'multimeter': ['probe-positive', 'probe-negative'],
  'mosfet-n': ['gate', 'drain', 'source'],
  'diode': ['anode', 'cathode'],
  'phototransistor': ['collector', 'emitter'],
  'motor-dc': ['positive', 'negative'],
  'servo': ['signal', 'vcc', 'gnd'],
  'lcd16x2': ['rs', 'e', 'd4', 'd5', 'd6', 'd7', 'vcc', 'gnd'],
};

const NANO_TOP_PINS = ['D13', '3V3', 'AREF', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', '5V', 'MINUS', 'GND', 'VIN'];
const NANO_BOTTOM_PINS = ['D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'GND_R', 'RST_R', 'RX', 'TX'];
const NANO_WING_PINS = ['W_A0', 'W_A1', 'W_A2', 'W_A3', 'W_D3', 'W_D5', 'W_D6', 'W_D9', 'W_A4', 'W_A5', 'W_D0', 'W_D1', 'W_D13', 'W_D12', 'W_D11', 'W_D10'];
const ALL_NANO_PINS = [...NANO_TOP_PINS, ...NANO_BOTTOM_PINS, ...NANO_WING_PINS];
COMPONENT_PINS['nano-r4'] = ALL_NANO_PINS;

function isValidBBHalfPin(pin) {
  if (pin.match(/^([a-j])(\d+)$/)) {
    return parseInt(pin.slice(1)) >= 1 && parseInt(pin.slice(1)) <= 30;
  }
  if (pin.match(/^bus-(top|bot)-(plus|minus)-(\d+)$/)) {
    return parseInt(pin.split('-').pop()) >= 1 && parseInt(pin.split('-').pop()) <= 30;
  }
  return pin === 'bus-plus' || pin === 'bus-minus';
}

function isValidBBFullPin(pin) {
  if (pin.match(/^([a-j])(\d+)$/)) {
    return parseInt(pin.slice(1)) >= 1 && parseInt(pin.slice(1)) <= 63;
  }
  if (pin.match(/^bus-(plus|minus)-(\d+)$/)) {
    return parseInt(pin.split('-').pop()) >= 1 && parseInt(pin.split('-').pop()) <= 63;
  }
  return pin === 'bus-plus' || pin === 'bus-minus';
}

function validatePinRef(pinRef, components, context) {
  const issues = [];
  const parts = pinRef.split(':');
  if (parts.length !== 2) {
    issues.push(`[${context}] INVALID_FORMAT: "${pinRef}"`);
    return issues;
  }
  const [compId, pinName] = parts;
  const comp = components.find(c => c.id === compId);
  if (!comp) {
    issues.push(`[${context}] UNKNOWN_COMPONENT: "${compId}" ref "${pinRef}"`);
    return issues;
  }
  if (comp.type === 'breadboard-half') {
    if (!isValidBBHalfPin(pinName)) {
      issues.push(`[${context}] INVALID_BB_HALF_PIN: "${pinName}" on "${compId}"`);
    }
    if (pinName.startsWith('bus-bottom')) {
      issues.push(`[${context}] BUS_NAMING: "${pinName}" should be "bus-bot"`);
    }
    return issues;
  }
  if (comp.type === 'breadboard-full') {
    if (!isValidBBFullPin(pinName)) {
      issues.push(`[${context}] INVALID_BB_FULL_PIN: "${pinName}" on "${compId}"`);
    }
    return issues;
  }
  const validPins = COMPONENT_PINS[comp.type];
  if (!validPins) {
    issues.push(`[${context}] UNKNOWN_TYPE: "${comp.type}"`);
    return issues;
  }
  if (!validPins.includes(pinName)) {
    issues.push(`[${context}] INVALID_PIN: "${pinName}" on "${comp.type}" (${compId}) [valid: ${validPins.join(', ')}]`);
  }
  return issues;
}

const ROOT = '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data';
const files = [
  { path: resolve(ROOT, 'experiments-vol1.js'), volume: 1 },
  { path: resolve(ROOT, 'experiments-vol2.js'), volume: 2 },
  { path: resolve(ROOT, 'experiments-vol3.js'), volume: 3 },
];

let totalChecked = 0;
let totalPass = 0;
let totalFail = 0;
const failedExperiments = [];
const commonIssues = {};
const volCounts = { 1: 0, 2: 0, 3: 0 };

for (const file of files) {
  const content = readFileSync(file.path, 'utf-8');

  const idRegex = /id:\s*['"]([^'"]+)['"]/g;
  let match;
  const allIds = [];
  while ((match = idRegex.exec(content)) !== null) {
    if (match[1].match(/^v\d+-/)) allIds.push(match[1]);
  }

  for (const expId of allIds) {
    totalChecked++;
    volCounts[file.volume]++;
    const issues = [];

    const idPattern = new RegExp(`id:\\s*['"]${expId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
    const idMatch = idPattern.exec(content);
    if (!idMatch) continue;

    const startIdx = idMatch.index;
    const nextIdRegex = /id:\s*['"]v\d+-/g;
    nextIdRegex.lastIndex = startIdx + 10;
    const nextMatch = nextIdRegex.exec(content);
    const endIdx = nextMatch ? nextMatch.index - 20 : startIdx + 30000;
    const expBlock = content.substring(startIdx, Math.min(endIdx, startIdx + 30000));

    // Extract components
    const componentsMatch = expBlock.match(/components:\s*\[([\s\S]*?)\]\s*,/);
    const components = [];
    if (componentsMatch) {
      const compBlockRegex = /\{([^}]+)\}/g;
      let cm;
      while ((cm = compBlockRegex.exec(componentsMatch[1])) !== null) {
        const typeM = cm[1].match(/type:\s*['"]([^'"]+)['"]/);
        const idM = cm[1].match(/\bid:\s*['"]([^'"]+)['"]/);
        if (typeM && idM) components.push({ id: idM[1], type: typeM[1] });
      }
    }

    // === CONNECTIONS ===
    const connectionsMatch = expBlock.match(/connections:\s*\[([\s\S]*?)\]\s*,/);
    const connections = [];
    if (connectionsMatch) {
      const connBlockRegex = /\{([^}]+)\}/g;
      let cm;
      while ((cm = connBlockRegex.exec(connectionsMatch[1])) !== null) {
        const fromM = cm[1].match(/from:\s*['"]([^'"]+)['"]/);
        const toM = cm[1].match(/to:\s*['"]([^'"]+)['"]/);
        if (fromM && toM) connections.push({ from: fromM[1], to: toM[1] });
      }
    }

    for (const conn of connections) {
      issues.push(...validatePinRef(conn.from, components, 'conn'));
      issues.push(...validatePinRef(conn.to, components, 'conn'));
      if (conn.from === conn.to) issues.push(`[conn] SELF_CONNECTION: "${conn.from}"`);
    }
    const seenConns = new Set();
    for (const conn of connections) {
      const key = [conn.from, conn.to].sort().join('|');
      if (seenConns.has(key)) issues.push(`[conn] DUPLICATE: "${conn.from}" <> "${conn.to}"`);
      seenConns.add(key);
    }

    // === pinAssignments ===
    const paMatch = expBlock.match(/pinAssignments:\s*\{([\s\S]*?)\}\s*,/);
    if (paMatch) {
      const paPairRegex = /["']([^"']+)["']\s*:\s*["']([^"']+)["']/g;
      let pm;
      while ((pm = paPairRegex.exec(paMatch[1])) !== null) {
        if (pm[1].includes(':')) issues.push(...validatePinRef(pm[1], components, 'pinAssign-key'));
        if (pm[2].includes(':')) issues.push(...validatePinRef(pm[2], components, 'pinAssign-val'));
      }
    }

    // === buildSteps ===
    const bsMatch = expBlock.match(/buildSteps:\s*\[([\s\S]*?)\]\s*,?\s*(?:quiz|concept|layer)/);
    if (bsMatch) {
      const bsContent = bsMatch[1];
      // wireFrom/wireTo
      const wireFromRe = /wireFrom:\s*["']([^"']+)["']/g;
      const wireToRe = /wireTo:\s*["']([^"']+)["']/g;
      let wm;
      while ((wm = wireFromRe.exec(bsContent)) !== null) {
        if (wm[1].includes(':')) issues.push(...validatePinRef(wm[1], components, 'buildStep-wireFrom'));
      }
      while ((wm = wireToRe.exec(bsContent)) !== null) {
        if (wm[1].includes(':')) issues.push(...validatePinRef(wm[1], components, 'buildStep-wireTo'));
      }
      // targetPins
      const tpRegex = /targetPins:\s*\{([^}]+)\}/g;
      let tpm;
      while ((tpm = tpRegex.exec(bsContent)) !== null) {
        const tpPairRegex = /["']([^"']+)["']\s*:\s*["']([^"']+)["']/g;
        let tpp;
        while ((tpp = tpPairRegex.exec(tpm[1])) !== null) {
          if (tpp[1].includes(':')) issues.push(...validatePinRef(tpp[1], components, 'buildStep-targetKey'));
          if (tpp[2].includes(':')) issues.push(...validatePinRef(tpp[2], components, 'buildStep-targetVal'));
        }
      }
    }

    // === Vol3 non-wing check ===
    if (file.volume === 3) {
      const NON_WING = ['D8', 'D7', 'D2', 'D4'];
      // Check all pin refs in the whole experiment block for nano-r4 + non-wing
      const allPinRefs = [];
      const refRe = /["'](ard\d*|nano\d*|arduino\d*):([A-Za-z0-9_]+)["']/g;
      let rm;
      while ((rm = refRe.exec(expBlock)) !== null) {
        const comp = components.find(c => c.id === rm[1]);
        if (comp && comp.type === 'nano-r4' && NON_WING.includes(rm[2])) {
          issues.push(`[vol3-wing] NON_WING_PIN: "${rm[2]}" on "${rm[1]}"`);
        }
      }
    }

    // Report
    if (issues.length === 0) {
      totalPass++;
      console.log(`${expId} | OK`);
    } else {
      totalFail++;
      failedExperiments.push(expId);
      console.log(`${expId} | FAIL | ${issues.length} issue(s):`);
      for (const issue of issues) {
        console.log(`  - ${issue}`);
        const issueType = issue.replace(/^\[[^\]]+\]\s*/, '').split(':')[0];
        commonIssues[issueType] = (commonIssues[issueType] || 0) + 1;
      }
    }
  }
}

console.log('\n' + '='.repeat(80));
console.log('DEEP VALIDATION SUMMARY');
console.log('='.repeat(80));
console.log(`Total experiments checked: ${totalChecked}`);
console.log(`  Vol1: ${volCounts[1]} | Vol2: ${volCounts[2]} | Vol3: ${volCounts[3]}`);
console.log(`PASS: ${totalPass}`);
console.log(`FAIL: ${totalFail}`);
if (failedExperiments.length > 0) {
  console.log(`\nFailed experiments:\n  ${failedExperiments.join('\n  ')}`);
}
if (Object.keys(commonIssues).length > 0) {
  console.log('\nCommon issues (grouped):');
  for (const [type, count] of Object.entries(commonIssues).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count} occurrence(s)`);
  }
}
