/**
 * ELAB Simulator — DEFINITIVE Overlap Audit Script (PASS 2)
 * Uses the EXACT same COMP_SIZES from SimulatorCanvas.jsx (line 44-65)
 *
 * Logic:
 *   - TOP_LEFT_ORIGIN components (breadboard, nano-r4): pos.x is top-left corner
 *   - All other components: pos.x,y is CENTER → bbox = [x-w/2, y-h/2, x+w/2, y+h/2]
 *   - Breadboard excluded from overlap checks
 *   - Overlap % = intersection area / smaller component area
 *
 * Run: node audit-overlaps.mjs
 */

import EXPERIMENTS_VOL1 from './src/data/experiments-vol1.js';
import EXPERIMENTS_VOL2 from './src/data/experiments-vol2.js';
import EXPERIMENTS_VOL3 from './src/data/experiments-vol3.js';

// ═══════════════════════════════════════════════════════════════
// EXACT COPY from SimulatorCanvas.jsx lines 44-65
// ═══════════════════════════════════════════════════════════════
const COMP_SIZES = {
  'nano-r4': { w: 167.58, h: 99.0 },
  'breadboard-half': { w: 253, h: 145 },
  'breadboard-full': { w: 110, h: 469 },
  'battery9v': { w: 40, h: 90 },
  'led': { w: 20, h: 50 },
  'rgb-led': { w: 36, h: 50 },
  'resistor': { w: 60, h: 16 },
  'push-button': { w: 34, h: 24 },
  'potentiometer': { w: 24, h: 50 },
  'photo-resistor': { w: 16, h: 44 },
  'buzzer-piezo': { w: 20, h: 44 },
  'capacitor': { w: 12, h: 40 },
  'mosfet-n': { w: 44, h: 48 },
  'phototransistor': { w: 12, h: 40 },
  'motor-dc': { w: 20, h: 36 },
  'diode': { w: 44, h: 12 },
  'reed-switch': { w: 48, h: 12 },
  'multimeter': { w: 70, h: 100 },
  'servo': { w: 52, h: 66 },
  'lcd16x2': { w: 180, h: 70 },
};

// Normalize data-file type names to COMP_SIZES keys
function normalizeType(type) {
  const map = {
    'battery-9v': 'battery9v',
  };
  return map[type] || type;
}

const TOP_LEFT_ORIGIN = new Set(['nano-r4', 'breadboard-half', 'breadboard-full']);
const EXCLUDE_TYPES = new Set(['breadboard-half', 'breadboard-full']);

function getBBox(type, pos) {
  const size = COMP_SIZES[type];
  if (!size) return null;
  if (TOP_LEFT_ORIGIN.has(type)) {
    return [pos.x, pos.y, pos.x + size.w, pos.y + size.h];
  }
  return [pos.x - size.w / 2, pos.y - size.h / 2, pos.x + size.w / 2, pos.y + size.h / 2];
}

function overlapArea(a, b) {
  const dx = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
  const dy = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  return dx * dy;
}

function bboxArea(b) { return (b[2] - b[0]) * (b[3] - b[1]); }

// ═══════════════════════════════════════════════════════════════
// COLLECT ALL 69 EXPERIMENTS
// ═══════════════════════════════════════════════════════════════
const allExps = [
  ...EXPERIMENTS_VOL1.experiments.map(e => ({ ...e, vol: 'Vol1' })),
  ...EXPERIMENTS_VOL2.experiments.map(e => ({ ...e, vol: 'Vol2' })),
  ...EXPERIMENTS_VOL3.experiments.map(e => ({ ...e, vol: 'Vol3' })),
];

const THRESHOLD = 3; // percent
let clean = 0, minor = 0, medium = 0, critical = 0;
const issues = [];
const unknownTypes = new Set();

for (const exp of allExps) {
  const layout = exp.layout || {};
  const comps = (exp.components || [])
    .map(c => {
      const normType = normalizeType(c.type);
      if (EXCLUDE_TYPES.has(normType)) return null;
      const pos = layout[c.id];
      if (!pos) return null;
      if (!COMP_SIZES[normType]) { unknownTypes.add(c.type); return null; }
      return { id: c.id, type: normType, bbox: getBBox(normType, pos) };
    })
    .filter(Boolean);

  const pairs = [];
  for (let i = 0; i < comps.length; i++) {
    for (let j = i + 1; j < comps.length; j++) {
      const oa = overlapArea(comps[i].bbox, comps[j].bbox);
      if (oa <= 0) continue;
      const pct = (oa / Math.min(bboxArea(comps[i].bbox), bboxArea(comps[j].bbox))) * 100;
      if (pct > THRESHOLD) {
        pairs.push({ a: comps[i].id, b: comps[j].id, tA: comps[i].type, tB: comps[j].type, pct: Math.round(pct * 10) / 10 });
      }
    }
  }

  if (pairs.length === 0) { clean++; continue; }
  const worst = Math.max(...pairs.map(p => p.pct));
  if (worst >= 50) critical++;
  else if (worst >= 20) medium++;
  else minor++;
  issues.push({ id: exp.id, vol: exp.vol, pairs, worst });
}
issues.sort((a, b) => b.worst - a.worst);

// ═══════════════════════════════════════════════════════════════
// OUTPUT
// ═══════════════════════════════════════════════════════════════
const line = '═'.repeat(70);
console.log(`\n${line}`);
console.log(`  ELAB SIMULATOR — DEFINITIVE OVERLAP AUDIT (PASS 2)`);
console.log(`  ${new Date().toISOString()}`);
console.log(`  Method: Node.js source import + EXACT SimulatorCanvas COMP_SIZES`);
console.log(`  Experiments: ${allExps.length} | Threshold: >${THRESHOLD}%`);
console.log(`${line}\n`);

console.log(`SUMMARY:`);
console.log(`  CRITICAL (≥50%):  ${critical}`);
console.log(`  MEDIUM (20-50%):  ${medium}`);
console.log(`  MINOR (3-20%):    ${minor}`);
console.log(`  CLEAN:            ${clean}`);
console.log(`  TOTAL:            ${allExps.length}`);
console.log(``);

if (unknownTypes.size > 0) {
  console.log(`  ⚠️  Unknown types (no size data): ${[...unknownTypes].join(', ')}`);
  console.log(``);
}

// By volume
for (const vol of ['Vol1', 'Vol2', 'Vol3']) {
  const volTotal = allExps.filter(e => e.vol === vol).length;
  const volIssues = issues.filter(i => i.vol === vol);
  const volClean = volTotal - volIssues.length;
  const volCrit = volIssues.filter(i => i.worst >= 50).length;
  const volMed = volIssues.filter(i => i.worst >= 20 && i.worst < 50).length;
  const volMin = volIssues.filter(i => i.worst < 20).length;
  console.log(`  ${vol}: ${volTotal} total | ${volClean} clean | ${volMin} minor | ${volMed} medium | ${volCrit} critical`);
}

if (issues.length > 0) {
  console.log(`\n${line}`);
  console.log(`  EXPERIMENTS WITH OVERLAPS (${issues.length})`);
  console.log(`${line}`);

  let totalPairs = 0;
  for (const r of issues) {
    const sev = r.worst >= 50 ? '🔴 CRITICAL' : r.worst >= 20 ? '🟡 MEDIUM' : '⚠️  MINOR';
    console.log(`  ${sev} | ${r.id} (${r.vol}) — ${r.pairs.length} pair(s), worst: ${r.worst}%`);
    for (const p of r.pairs) {
      console.log(`    ↳ ${p.a}(${p.tA}) ↔ ${p.b}(${p.tB}): ${p.pct}%`);
      totalPairs++;
    }
  }
  console.log(`\n  Total overlap pairs: ${totalPairs}`);
}

console.log(`\n${line}`);
if (critical === 0 && medium === 0) {
  console.log(`  🎉 AUDIT PASSED — Zero critical or medium overlaps!`);
  if (minor > 0) console.log(`  ℹ️  ${minor} experiment(s) with minor cosmetic overlaps (<20%) — acceptable.`);
} else {
  console.log(`  ❌ AUDIT FAILED — ${critical} critical + ${medium} medium overlaps remain`);
}
console.log(`${line}\n`);
