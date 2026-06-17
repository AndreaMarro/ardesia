/**
 * Geometry Validator — "Geometra" Agent
 * Validates component positions and detects overlaps in all 69 ELAB experiments.
 *
 * Checks:
 * 1. All components in `components` have a matching entry in `layout`
 * 2. No negative coordinates
 * 3. No off-canvas positions (x > 800 or y > 500 for Vol3 with offset breadboard)
 * 4. No bounding-box overlaps between components
 * 5. NanoR4Board alignment with breadboard (Vol3)
 * 6. Battery9V outside breadboard area
 * 7. Multimeter outside breadboard area
 */

const fs = require('fs');
const path = require('path');

// ─── Load experiment data ───────────────────────────────────────────────
function loadExperiments(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  // Replace ES module export with CommonJS
  code = code.replace(/export\s+default\s+/g, 'module.exports = ');
  // Write temp file and require it
  const tmpPath = filePath.replace('.js', '.tmp.cjs');
  fs.writeFileSync(tmpPath, code);
  const data = require(tmpPath);
  fs.unlinkSync(tmpPath);
  return data;
}

const BASE = path.join(__dirname, 'src', 'data');
const vol1 = loadExperiments(path.join(BASE, 'experiments-vol1.js'));
const vol2 = loadExperiments(path.join(BASE, 'experiments-vol2.js'));
const vol3 = loadExperiments(path.join(BASE, 'experiments-vol3.js'));

const allExperiments = [
  ...vol1.experiments.map(e => ({ ...e, volume: 1 })),
  ...vol2.experiments.map(e => ({ ...e, volume: 2 })),
  ...vol3.experiments.map(e => ({ ...e, volume: 3 })),
];

console.log(`Total experiments loaded: ${allExperiments.length}\n`);

// ─── Bounding boxes from ACTUAL SVG hitbox rects (verified from JSX source) ─
// Format: { w, h, ox, oy } where ox,oy is offset of top-left corner from component origin
// Most components use centered hitboxes; for asymmetric ones we use ox/oy.
const BOUNDING_BOXES = {
  'battery9v':       { w: 70, h: 80, ox: -70, oy: -38 },  // BODY_LEFT=-70, BODY_TOP=-38, body 70x36 + clips below
  'breadboard-half': { w: 200, h: 150, ox: 0, oy: 0 },    // top-left positioned
  'breadboard-full': { w: 350, h: 150, ox: 0, oy: 0 },    // top-left positioned
  'led':             { w: 28, h: 44, ox: -14, oy: -16 },   // rect x=-14 y=-16 w=28 h=44
  'resistor':        { w: 60, h: 20, ox: -30, oy: -10 },   // rect x=-30 y=-10 w=60 h=20
  'capacitor':       { w: 28, h: 44, ox: -14, oy: -20 },   // rect x=-14 y=-20 w=28 h=44
  'potentiometer':   { w: 36, h: 54, ox: -18, oy: -22 },   // rect x=-18 y=-22 w=36 h=54
  'push-button':     { w: 44, h: 44, ox: -22, oy: -22 },   // rect x=-22 y=-22 w=44 h=44
  'rgb-led':         { w: 36, h: 54, ox: -18, oy: -22 },   // rect x=-18 y=-22 w=36 h=54
  'buzzer-piezo':    { w: 50, h: 50, ox: -25, oy: -25 },   // rect x=-25 y=-25 w=50 h=50
  'buzzer':          { w: 50, h: 50, ox: -25, oy: -25 },   // alias
  'motor-dc':        { w: 50, h: 50, ox: -25, oy: -25 },   // rect x=-25 y=-25 w=50 h=50
  'servo':           { w: 50, h: 50, ox: -25, oy: -25 },   // rect x=-25 y=-25 w=50 h=50
  'multimeter':      { w: 44, h: 78, ox: -22, oy: -28 },   // rect x=-22 y=-28 w=44 h=78
  'mosfet-n':        { w: 48, h: 52, ox: -24, oy: -26 },   // rect x=-24 y=-26 w=48 h=52
  'phototransistor': { w: 32, h: 48, ox: -16, oy: -24 },   // rect x=-16 y=-24 w=32 h=48
  'photo-resistor':  { w: 44, h: 44, ox: -22, oy: -22 },   // rect x=-22 y=-22 w=44 h=44
  'photoresistor':   { w: 44, h: 44, ox: -22, oy: -22 },   // alias
  'reed-switch':     { w: 56, h: 28, ox: -28, oy: -14 },   // rect x=-28 y=-14 w=56 h=28
  'diode':           { w: 48, h: 24, ox: -24, oy: -12 },   // rect x=-24 y=-12 w=48 h=24
  'nano-r4':         { w: 140, h: 100, ox: 0, oy: 0 },     // complex, uses SCALE=1.8
  'lcd-16x2':        { w: 80, h: 40, ox: -40, oy: -20 },   // approx centered
};

// ─── Helper: check bounding box overlap ─────────────────────────────────
function boxesOverlap(a, b, margin = 0) {
  // a and b: { x, y, w, h } where (x, y) is top-left corner
  return (
    a.x < b.x + b.w - margin &&
    a.x + a.w > b.x + margin &&
    a.y < b.y + b.h - margin &&
    a.y + a.h > b.y + margin
  );
}

// ─── Visual body bounding boxes (the actual visible element, NOT the hitbox) ─
// These are the painted shapes, much smaller than hitboxes
const VISUAL_BODIES = {
  'resistor':        { w: 26, h: 11.2, ox: -13, oy: -5.6 },   // rect body
  'led':             { w: 16, h: 28, ox: -8, oy: -10 },        // dome shape
  'capacitor':       { w: 16, h: 30, ox: -8, oy: -15 },        // body
  'potentiometer':   { w: 32, h: 32, ox: -16, oy: -16 },       // circle r=15.6
  'push-button':     { w: 21, h: 21, ox: -10.5, oy: -10.5 },   // inner button
  'rgb-led':         { w: 22, h: 32, ox: -11, oy: -14 },       // dome
  'buzzer-piezo':    { w: 30, h: 30, ox: -15, oy: -15 },       // disc
  'buzzer':          { w: 30, h: 30, ox: -15, oy: -15 },
  'motor-dc':        { w: 30, h: 30, ox: -15, oy: -15 },       // cylinder body
  'servo':           { w: 40, h: 24, ox: -20, oy: -12 },       // body
  'multimeter':      { w: 36, h: 50, ox: -18, oy: -25 },       // display body
  'mosfet-n':        { w: 20, h: 34, ox: -10, oy: -17 },       // TO-220 body
  'phototransistor': { w: 16, h: 26, ox: -8, oy: -13 },        // body
  'photo-resistor':  { w: 19, h: 19, ox: -9.5, oy: -9.5 },     // circle r=9.5
  'photoresistor':   { w: 19, h: 19, ox: -9.5, oy: -9.5 },
  'reed-switch':     { w: 30, h: 10, ox: -15, oy: -5 },        // glass tube body
  'diode':           { w: 26, h: 14, ox: -13, oy: -7 },        // body
  'battery9v':       { w: 70, h: 36, ox: -70, oy: -38 },       // body rect
  'nano-r4':         { w: 140, h: 100, ox: 0, oy: 0 },
  'lcd-16x2':        { w: 80, h: 40, ox: -40, oy: -20 },
  'breadboard-half': { w: 200, h: 150, ox: 0, oy: 0 },
  'breadboard-full': { w: 350, h: 150, ox: 0, oy: 0 },
};

// Overlap margin — small tolerance to avoid false positives for adjacent components
const OVERLAP_MARGIN = 3;

// ─── Helper: get bounding box for a component ──────────────────────────
function getBBox(componentType, layoutPos, useVisual = false) {
  const lookup = useVisual ? VISUAL_BODIES : BOUNDING_BOXES;
  const bb = lookup[componentType];
  if (!bb) return null;
  // Layout position is the SVG origin (0,0) of the component <g> element.
  // ox, oy define top-left corner offset from that origin.
  return {
    x: layoutPos.x + (bb.ox !== undefined ? bb.ox : -bb.w / 2),
    y: layoutPos.y + (bb.oy !== undefined ? bb.oy : -bb.h / 2),
    w: bb.w,
    h: bb.h,
    type: componentType
  };
}

// ─── Helper: get breadboard bounding box from layout ────────────────────
function getBreadboardBBox(layout) {
  for (const [id, pos] of Object.entries(layout)) {
    // Breadboard position is top-left corner, not center
    if (id.startsWith('bb')) {
      // Determine if half or full based on typical experiment patterns
      return {
        x: pos.x,
        y: pos.y,
        w: 200, // half breadboard default
        h: 150
      };
    }
  }
  return null;
}

// ─── Canvas limits ──────────────────────────────────────────────────────
// Vol1/Vol2: bb at x:100, components around 30-400
// Vol3: bb at x:280, components around 230-550
const CANVAS_MAX_X = 800;
const CANVAS_MAX_Y = 500;

// ─── Run Validation ─────────────────────────────────────────────────────
const results = [];
let totalOk = 0;
let totalWarn = 0;
let totalFail = 0;

// Collect all issues by category
const issueSummary = {
  missingLayout: [],
  negativeCoords: [],
  offCanvas: [],
  overlaps: [],
  nanoAlignment: [],
  batteryInBreadboard: [],
  multimeterInBreadboard: [],
};

for (const exp of allExperiments) {
  const issues = [];
  const expId = exp.id;
  const layout = exp.layout || {};
  const components = exp.components || [];

  // ── Check 1: All components have layout entries ───────────────────
  for (const comp of components) {
    if (!layout[comp.id]) {
      issues.push(`FAIL: Component "${comp.id}" (${comp.type}) missing from layout`);
      issueSummary.missingLayout.push({ expId, compId: comp.id, type: comp.type });
    }
  }

  // Also check if layout has entries not in components
  const componentIds = new Set(components.map(c => c.id));
  for (const layoutId of Object.keys(layout)) {
    if (!componentIds.has(layoutId)) {
      issues.push(`WARN: Layout has entry "${layoutId}" not in components list`);
    }
  }

  // Build a map of component id -> type
  const compTypeMap = {};
  for (const comp of components) {
    compTypeMap[comp.id] = comp.type;
  }

  // ── Check 2 & 3: Coordinate bounds ───────────────────────────────
  for (const [compId, pos] of Object.entries(layout)) {
    if (pos.x < 0 || pos.y < 0) {
      issues.push(`FAIL: "${compId}" has negative coordinates (${pos.x}, ${pos.y})`);
      issueSummary.negativeCoords.push({ expId, compId, x: pos.x, y: pos.y });
    }
    if (pos.x > CANVAS_MAX_X || pos.y > CANVAS_MAX_Y) {
      issues.push(`WARN: "${compId}" may be off-canvas (${pos.x}, ${pos.y})`);
      issueSummary.offCanvas.push({ expId, compId, x: pos.x, y: pos.y });
    }
  }

  // ── Check 4: Bounding box overlaps ────────────────────────────────
  const bboxes = [];
  for (const [compId, pos] of Object.entries(layout)) {
    const compType = compTypeMap[compId];
    if (!compType) continue;

    const bbox = getBBox(compType, pos);
    if (bbox) {
      bboxes.push({ ...bbox, id: compId });
    }
  }

  // Check pairwise overlaps (excluding components ON breadboard — they're supposed to overlap)
  for (let i = 0; i < bboxes.length; i++) {
    for (let j = i + 1; j < bboxes.length; j++) {
      const a = bboxes[i];
      const b = bboxes[j];

      // Skip: components intentionally on breadboard
      if (a.type === 'breadboard-half' || a.type === 'breadboard-full' ||
          b.type === 'breadboard-half' || b.type === 'breadboard-full') {
        // Check only battery/multimeter vs breadboard (covered in checks 6 & 7)
        continue;
      }

      // Skip: NanoR4 intentionally overlaps breadboard (it sits on it)
      if (a.type === 'nano-r4' || b.type === 'nano-r4') {
        continue;
      }

      if (boxesOverlap(a, b, OVERLAP_MARGIN)) {
        // Calculate hitbox overlap area for severity
        const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        const overlapArea = Math.max(0, overlapX) * Math.max(0, overlapY);
        const smallerArea = Math.min(a.w * a.h, b.w * b.h);
        const hitboxPct = ((overlapArea / smallerArea) * 100).toFixed(1);

        // Also check VISUAL body overlap (more accurate for determining visual issue)
        const posA = layout[a.id];
        const posB = layout[b.id];
        const vA = getBBox(a.type, posA, true);
        const vB = getBBox(b.type, posB, true);
        let visualPct = 0;
        if (vA && vB && boxesOverlap(vA, vB, 0)) {
          const vOverlapX = Math.min(vA.x + vA.w, vB.x + vB.w) - Math.max(vA.x, vB.x);
          const vOverlapY = Math.min(vA.y + vA.h, vB.y + vB.h) - Math.max(vA.y, vB.y);
          const vOverlapArea = Math.max(0, vOverlapX) * Math.max(0, vOverlapY);
          const vSmallerArea = Math.min(vA.w * vA.h, vB.w * vB.h);
          visualPct = ((vOverlapArea / vSmallerArea) * 100).toFixed(1);
        }

        // Severity based on VISUAL overlap (more meaningful)
        const severity = visualPct > 30 ? 'FAIL' : visualPct > 10 ? 'WARN' : hitboxPct > 20 ? 'MINOR' : 'COSMETIC';
        const detail = `hitbox ${hitboxPct}%, visual ${visualPct}%`;
        issues.push(`${severity}: "${a.id}" (${a.type}) overlaps "${b.id}" (${b.type}) — ${detail}`);
        issueSummary.overlaps.push({
          expId,
          comp1: a.id, type1: a.type,
          comp2: b.id, type2: b.type,
          hitboxPct: parseFloat(hitboxPct),
          visualPct: parseFloat(visualPct),
          severity
        });
      }
    }
  }

  // ── Check 5: NanoR4Board alignment with breadboard (Vol3) ─────────
  if (exp.volume === 3) {
    const nanoComp = components.find(c => c.type === 'nano-r4');
    const bbComp = components.find(c => c.type === 'breadboard-half' || c.type === 'breadboard-full');
    if (nanoComp && bbComp && layout[nanoComp.id] && layout[bbComp.id]) {
      const nanoY = layout[nanoComp.id].y;
      const bbY = layout[bbComp.id].y;
      // Nano should sit on breadboard: its y should align within reasonable range of bb y
      const yDiff = Math.abs(nanoY - bbY);
      if (yDiff > 30) {
        issues.push(`WARN: NanoR4 y=${nanoY} not aligned with breadboard y=${bbY} (diff=${yDiff}px)`);
        issueSummary.nanoAlignment.push({ expId, nanoY, bbY, diff: yDiff });
      }
    }
  }

  // ── Check 6: Battery9V should be outside breadboard area ──────────
  const bbLayoutEntries = components.filter(c => c.type === 'breadboard-half' || c.type === 'breadboard-full');
  const batComp = components.find(c => c.type === 'battery9v');
  if (batComp && layout[batComp.id] && bbLayoutEntries.length > 0) {
    const batBBox = getBBox('battery9v', layout[batComp.id]);

    for (const bb of bbLayoutEntries) {
      if (!layout[bb.id]) continue;
      const bbBBox = getBBox(bb.type, layout[bb.id]);

      if (batBBox && bbBBox && boxesOverlap(batBBox, bbBBox, 0)) {
        issues.push(`WARN: Battery "${batComp.id}" overlaps breadboard "${bb.id}"`);
        issueSummary.batteryInBreadboard.push({ expId, batId: batComp.id, bbId: bb.id });
      }
    }
  }

  // ── Check 7: Multimeter should be outside breadboard area ─────────
  const multComp = components.find(c => c.type === 'multimeter');
  if (multComp && layout[multComp.id] && bbLayoutEntries.length > 0) {
    const multBBox = getBBox('multimeter', layout[multComp.id]);

    for (const bb of bbLayoutEntries) {
      if (!layout[bb.id]) continue;
      const bbBBox = getBBox(bb.type, layout[bb.id]);

      if (multBBox && bbBBox && boxesOverlap(multBBox, bbBBox, 0)) {
        issues.push(`WARN: Multimeter "${multComp.id}" overlaps breadboard "${bb.id}"`);
        issueSummary.multimeterInBreadboard.push({ expId, multId: multComp.id, bbId: bb.id });
      }
    }
  }

  // ── Determine status ──────────────────────────────────────────────
  let status = 'OK';
  if (issues.some(i => i.startsWith('FAIL'))) {
    status = 'FAIL';
    totalFail++;
  } else if (issues.some(i => i.startsWith('WARN'))) {
    status = 'WARN';
    totalWarn++;
  } else {
    // MINOR and COSMETIC don't change overall status from OK
    totalOk++;
  }

  results.push({ expId, volume: exp.volume, status, issues });
}

// ─── Output ─────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('  ELAB Geometry Validator — Position & Overlap Report');
console.log('═══════════════════════════════════════════════════════════════════════════════\n');

// Per-experiment report
for (const r of results) {
  const icon = r.status === 'OK' ? '[OK]  ' : r.status === 'WARN' ? '[WARN]' : '[FAIL]';
  const issueStr = r.issues.length > 0 ? ` | ${r.issues.length} issue(s)` : '';
  console.log(`  Vol${r.volume} | ${icon} | ${r.expId}${issueStr}`);
  if (r.issues.length > 0) {
    for (const issue of r.issues) {
      console.log(`         -> ${issue}`);
    }
  }
}

// Summary
console.log('\n═══════════════════════════════════════════════════════════════════════════════');
console.log('  SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log(`  Total experiments:     ${allExperiments.length}`);
console.log(`  OK:                    ${totalOk}`);
console.log(`  WARN:                  ${totalWarn}`);
console.log(`  FAIL:                  ${totalFail}`);
console.log('');

// Category summaries
if (issueSummary.missingLayout.length > 0) {
  console.log(`  Missing layout entries: ${issueSummary.missingLayout.length}`);
  for (const m of issueSummary.missingLayout) {
    console.log(`    - ${m.expId}: "${m.compId}" (${m.type})`);
  }
}
if (issueSummary.negativeCoords.length > 0) {
  console.log(`  Negative coordinates:  ${issueSummary.negativeCoords.length}`);
  for (const n of issueSummary.negativeCoords) {
    console.log(`    - ${n.expId}: "${n.compId}" at (${n.x}, ${n.y})`);
  }
}
if (issueSummary.offCanvas.length > 0) {
  console.log(`  Off-canvas positions:  ${issueSummary.offCanvas.length}`);
  for (const o of issueSummary.offCanvas) {
    console.log(`    - ${o.expId}: "${o.compId}" at (${o.x}, ${o.y})`);
  }
}
if (issueSummary.overlaps.length > 0) {
  const failOverlaps = issueSummary.overlaps.filter(o => o.severity === 'FAIL');
  const warnOverlaps = issueSummary.overlaps.filter(o => o.severity === 'WARN');
  const minorOverlaps = issueSummary.overlaps.filter(o => o.severity === 'MINOR');
  const cosmeticOverlaps = issueSummary.overlaps.filter(o => o.severity === 'COSMETIC');
  console.log(`  Component overlaps:    ${issueSummary.overlaps.length} total`);
  console.log(`    FAIL (visual >30%):    ${failOverlaps.length}`);
  console.log(`    WARN (visual 10-30%):  ${warnOverlaps.length}`);
  console.log(`    MINOR (hitbox >20%):   ${minorOverlaps.length}`);
  console.log(`    COSMETIC (hitbox-only): ${cosmeticOverlaps.length}`);
  console.log('');
  if (failOverlaps.length > 0) {
    console.log('  --- FAIL overlaps (visual body >30% overlap) ---');
    for (const o of failOverlaps) {
      console.log(`    ${o.expId}: "${o.comp1}" (${o.type1}) vs "${o.comp2}" (${o.type2}) — visual ${o.visualPct}%, hitbox ${o.hitboxPct}%`);
    }
  }
  if (warnOverlaps.length > 0) {
    console.log('  --- WARN overlaps (visual body 10-30%) ---');
    for (const o of warnOverlaps) {
      console.log(`    ${o.expId}: "${o.comp1}" (${o.type1}) vs "${o.comp2}" (${o.type2}) — visual ${o.visualPct}%, hitbox ${o.hitboxPct}%`);
    }
  }
  if (minorOverlaps.length > 0) {
    console.log(`  --- MINOR overlaps (hitbox only, ${minorOverlaps.length} total) ---`);
  }
  if (cosmeticOverlaps.length > 0) {
    console.log(`  --- COSMETIC overlaps (${cosmeticOverlaps.length} total, negligible) ---`);
  }
}
if (issueSummary.nanoAlignment.length > 0) {
  console.log(`  Nano-breadboard misalignment: ${issueSummary.nanoAlignment.length}`);
  for (const n of issueSummary.nanoAlignment) {
    console.log(`    - ${n.expId}: nano y=${n.nanoY}, bb y=${n.bbY}, diff=${n.diff}px`);
  }
}
if (issueSummary.batteryInBreadboard.length > 0) {
  console.log(`  Battery on breadboard: ${issueSummary.batteryInBreadboard.length}`);
  for (const b of issueSummary.batteryInBreadboard) {
    console.log(`    - ${b.expId}: "${b.batId}" overlaps "${b.bbId}"`);
  }
}
if (issueSummary.multimeterInBreadboard.length > 0) {
  console.log(`  Multimeter on breadboard: ${issueSummary.multimeterInBreadboard.length}`);
  for (const m of issueSummary.multimeterInBreadboard) {
    console.log(`    - ${m.expId}: "${m.multId}" overlaps "${m.bbId}"`);
  }
}

console.log('\n═══════════════════════════════════════════════════════════════════════════════');
console.log('  END OF REPORT');
console.log('═══════════════════════════════════════════════════════════════════════════════');
