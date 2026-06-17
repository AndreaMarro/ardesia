/**
 * Pin and Connection Validator for ELAB Simulator
 * Validates all 69 experiments pin names and connections against SVG component definitions.
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

// NanoR4Board pins
const NANO_TOP_PINS = ['D13', '3V3', 'AREF', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', '5V', 'MINUS', 'GND', 'VIN'];
const NANO_BOTTOM_PINS = ['D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'GND_R', 'RST_R', 'RX', 'TX'];
const NANO_WING_PINS = ['W_A0', 'W_A1', 'W_A2', 'W_A3', 'W_D3', 'W_D5', 'W_D6', 'W_D9', 'W_A4', 'W_A5', 'W_D0', 'W_D1', 'W_D13', 'W_D12', 'W_D11', 'W_D10'];
const ALL_NANO_PINS = [...NANO_TOP_PINS, ...NANO_BOTTOM_PINS, ...NANO_WING_PINS];
COMPONENT_PINS['nano-r4'] = ALL_NANO_PINS;

// BreadboardHalf: a1-j30, bus-top-plus-1..30, bus-top-minus-1..30, bus-bot-plus-1..30, bus-bot-minus-1..30, bus-plus, bus-minus
function isValidBreadboardHalfPin(pin) {
  const holeMatch = pin.match(/^([a-j])(\d+)$/);
  if (holeMatch) {
    const col = parseInt(holeMatch[2]);
    return col >= 1 && col <= 30;
  }
  const busMatch = pin.match(/^bus-(top|bot)-(plus|minus)-(\d+)$/);
  if (busMatch) {
    const col = parseInt(busMatch[3]);
    return col >= 1 && col <= 30;
  }
  if (pin === 'bus-plus' || pin === 'bus-minus') return true;
  return false;
}

// BreadboardFull: a1-j63, bus-plus-1..63, bus-minus-1..63, bus-plus, bus-minus
function isValidBreadboardFullPin(pin) {
  const holeMatch = pin.match(/^([a-j])(\d+)$/);
  if (holeMatch) {
    const col = parseInt(holeMatch[2]);
    return col >= 1 && col <= 63;
  }
  const busMatch = pin.match(/^bus-(plus|minus)-(\d+)$/);
  if (busMatch) {
    const col = parseInt(busMatch[2]);
    return col >= 1 && col <= 63;
  }
  if (pin === 'bus-plus' || pin === 'bus-minus') return true;
  return false;
}

function isValidBreadboardPin(pin, bbType) {
  if (bbType === 'breadboard-full') return isValidBreadboardFullPin(pin);
  return isValidBreadboardHalfPin(pin);
}

// Validate a pin reference
function validatePinRef(pinRef, components) {
  const issues = [];
  const parts = pinRef.split(':');
  if (parts.length !== 2) {
    issues.push(`INVALID_FORMAT: "${pinRef}" not in componentId:pinName format`);
    return issues;
  }
  const [compId, pinName] = parts;
  const comp = components.find(c => c.id === compId);
  if (!comp) {
    issues.push(`UNKNOWN_COMPONENT: "${compId}" not in components list for ref "${pinRef}"`);
    return issues;
  }

  // Breadboard pin validation
  if (comp.type === 'breadboard-half' || comp.type === 'breadboard-full') {
    if (!isValidBreadboardPin(pinName, comp.type)) {
      issues.push(`INVALID_BB_PIN: "${pinName}" on ${comp.type} "${compId}"`);
    }
    // Check bus-bottom naming error
    if (pinName.includes('bus-bottom')) {
      issues.push(`BUS_NAMING: "${pinName}" uses "bus-bottom" instead of "bus-bot"`);
    }
    return issues;
  }

  // Regular component pin validation
  const validPins = COMPONENT_PINS[comp.type];
  if (!validPins) {
    issues.push(`UNKNOWN_COMPONENT_TYPE: "${comp.type}" has no pin definitions`);
    return issues;
  }
  if (!validPins.includes(pinName)) {
    issues.push(`INVALID_PIN: "${pinName}" does not exist on "${comp.type}" (id: ${compId}) [valid: ${validPins.slice(0, 8).join(', ')}${validPins.length > 8 ? '...' : ''}]`);
  }
  return issues;
}

// Main validation
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
const allIssueDetails = {};

for (const file of files) {
  const content = readFileSync(file.path, 'utf-8');

  // Extract experiment IDs
  const idRegex = /id:\s*['"]([^'"]+)['"]/g;
  let match;
  const allIds = [];
  while ((match = idRegex.exec(content)) !== null) {
    const id = match[1];
    if (id.match(/^v\d+-/)) {
      allIds.push(id);
    }
  }

  for (const expId of allIds) {
    totalChecked++;
    const issues = [];

    // Find experiment block
    const idPattern = new RegExp(`id:\\s*['"]${expId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
    const idMatch = idPattern.exec(content);
    if (!idMatch) {
      issues.push('EXPERIMENT_NOT_FOUND');
      totalFail++;
      failedExperiments.push(expId);
      console.log(`${expId} | FAIL | Experiment not found`);
      continue;
    }

    // Extract a chunk after the id
    const afterId = content.substring(idMatch.index, idMatch.index + 20000);

    // Extract components - handle BOTH orderings: {type, id} and {id, type}
    const componentsMatch = afterId.match(/components:\s*\[([\s\S]*?)\]\s*,/);
    const components = [];
    if (componentsMatch) {
      // Match {type: "x", id: "y"} or {id: "y", type: "x"} with any other props
      const compBlockRegex = /\{([^}]+)\}/g;
      let cm;
      while ((cm = compBlockRegex.exec(componentsMatch[1])) !== null) {
        const block = cm[1];
        const typeMatch = block.match(/type:\s*['"]([^'"]+)['"]/);
        const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
        if (typeMatch && idMatch) {
          components.push({ id: idMatch[1], type: typeMatch[1] });
        }
      }
    }

    // Extract connections
    const connectionsMatch = afterId.match(/connections:\s*\[([\s\S]*?)\]\s*,/);
    const connections = [];
    if (connectionsMatch) {
      const connBlockRegex = /\{([^}]+)\}/g;
      let cm;
      while ((cm = connBlockRegex.exec(connectionsMatch[1])) !== null) {
        const block = cm[1];
        const fromMatch = block.match(/from:\s*['"]([^'"]+)['"]/);
        const toMatch = block.match(/to:\s*['"]([^'"]+)['"]/);
        if (fromMatch && toMatch) {
          connections.push({ from: fromMatch[1], to: toMatch[1] });
        }
      }
    }

    if (connections.length === 0 && components.length === 0) {
      issues.push('NO_CONNECTIONS_OR_COMPONENTS_FOUND');
    }

    // CHECK 1: Validate pin references
    for (const conn of connections) {
      issues.push(...validatePinRef(conn.from, components));
      issues.push(...validatePinRef(conn.to, components));
    }

    // CHECK 2: Self-connection
    for (const conn of connections) {
      if (conn.from === conn.to) {
        issues.push(`SELF_CONNECTION: "${conn.from}"`);
      }
    }

    // CHECK 3: Duplicate connections
    const seenConns = new Set();
    for (const conn of connections) {
      const key = [conn.from, conn.to].sort().join('|');
      if (seenConns.has(key)) {
        issues.push(`DUPLICATE: "${conn.from}" to "${conn.to}"`);
      }
      seenConns.add(key);
    }

    // CHECK 5: Breadboard pin format errors (row letter + col number)
    for (const conn of connections) {
      for (const ref of [conn.from, conn.to]) {
        const parts = ref.split(':');
        if (parts.length === 2) {
          const pinName = parts[1];
          // Check for bus-bottom naming
          if (pinName.startsWith('bus-bottom')) {
            issues.push(`BUS_NAMING: "${ref}" uses "bus-bottom" instead of "bus-bot"`);
          }
        }
      }
    }

    // CHECK 7: Vol3 non-wing pin usage
    if (file.volume === 3) {
      for (const conn of connections) {
        for (const ref of [conn.from, conn.to]) {
          const parts = ref.split(':');
          if (parts.length === 2) {
            const comp = components.find(c => c.id === parts[0]);
            if (comp && comp.type === 'nano-r4') {
              const pinName = parts[1];
              if (['D8', 'D7', 'D2', 'D4'].includes(pinName)) {
                issues.push(`VOL3_NON_WING: "${pinName}" on Arduino not available on wing (should use W_ substitute)`);
              }
            }
          }
        }
      }
    }

    // Report
    if (issues.length === 0) {
      totalPass++;
      console.log(`${expId} | OK | No issues`);
    } else {
      totalFail++;
      failedExperiments.push(expId);
      allIssueDetails[expId] = issues;
      console.log(`${expId} | FAIL | ${issues.length} issue(s):`);
      for (const issue of issues) {
        console.log(`  - ${issue}`);
        const issueType = issue.split(':')[0];
        commonIssues[issueType] = (commonIssues[issueType] || 0) + 1;
      }
    }
  }
}

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Total experiments checked: ${totalChecked}`);
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
