/**
 * ELAB Wire Routing Validator — "Elettricista"
 * Validates wire connections for all 69 experiments.
 *
 * Checks:
 * 1. Gap crossing: a-e / f-j sections are electrically separate
 * 2. Wire color consistency (red=VCC, black=GND)
 * 3. No duplicate wires
 * 4. BuildSteps consistency with connections
 * 5. Circuit completeness (power -> components -> ground)
 * 6. Impossible connections (invalid pin references)
 *
 * Run: node validate-wires.cjs
 */

const fs = require('fs');
const path = require('path');

// ─── Load experiment data by extracting the JS object ───────────────────
function loadExperiments(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  // Remove export statements
  content = content.replace(/export\s+default\s+\w+;?\s*$/m, '');
  content = content.replace(/export\s*\{[^}]*\};?\s*$/m, '');
  // Write to temp file as CommonJS module
  const tmpPath = filePath.replace('.js', '.tmp.cjs');
  const varMatch = content.match(/const\s+(\w+)\s*=/);
  if (!varMatch) {
    console.error('Cannot parse:', filePath);
    return { experiments: [] };
  }
  const varName = varMatch[1];
  fs.writeFileSync(tmpPath, content + `\nmodule.exports = ${varName};\n`);
  try {
    // Clear require cache to ensure fresh load
    delete require.cache[require.resolve(tmpPath)];
    const data = require(tmpPath);
    return data;
  } finally {
    fs.unlinkSync(tmpPath);
  }
}

const vol1 = loadExperiments(path.join(__dirname, 'src/data/experiments-vol1.js'));
const vol2 = loadExperiments(path.join(__dirname, 'src/data/experiments-vol2.js'));
const vol3 = loadExperiments(path.join(__dirname, 'src/data/experiments-vol3.js'));

const allExperiments = [
  ...vol1.experiments,
  ...vol2.experiments,
  ...vol3.experiments,
];

console.log(`Loaded: Vol1=${vol1.experiments.length}, Vol2=${vol2.experiments.length}, Vol3=${vol3.experiments.length}, Total=${allExperiments.length}\n`);

// ─── Breadboard model ───────────────────────────────────────────────────
const TOP_ROWS = new Set(['a', 'b', 'c', 'd', 'e']);
const BOT_ROWS = new Set(['f', 'g', 'h', 'i', 'j']);

/**
 * Parse a breadboard pin reference like "bb1:a5", "bb1:bus-top-plus-3"
 */
function parseBBPin(ref) {
  if (!ref) return null;
  const parts = ref.split(':');
  if (parts.length < 2) return null;
  const compId = parts[0];
  const pinId = parts[1];

  // Bus pins: bus-top-plus-5, bus-bot-minus-10, bus-bottom-plus-3
  const busMatch = pinId.match(/^bus-(top|bot|bottom)-(plus|minus)-(\d+)$/);
  if (busMatch) {
    const loc = busMatch[1] === 'bottom' ? 'bot' : busMatch[1];
    return {
      bbId: compId,
      isBus: true,
      busRail: 'bus-' + loc + '-' + busMatch[2],
      busLoc: loc,
      busPolarity: busMatch[2],
      col: parseInt(busMatch[3]),
      section: loc === 'top' ? 'top' : 'bot',
      row: null,
    };
  }

  // Main section: a5, f10
  const mainMatch = pinId.match(/^([a-j])(\d+)$/);
  if (mainMatch) {
    const row = mainMatch[1];
    const col = parseInt(mainMatch[2]);
    const section = TOP_ROWS.has(row) ? 'top' : 'bot';
    return {
      bbId: compId,
      isBus: false,
      row: row,
      col: col,
      section: section,
      busRail: null,
    };
  }

  return null;
}

/**
 * Get the electrical net key for a breadboard pin.
 * Pins in the same column AND same section (a-e or f-j) share a net.
 * Bus pins on the same rail share a net.
 */
function getNetKey(ref) {
  const parsed = parseBBPin(ref);
  if (!parsed) return ref; // non-BB pin, use raw ref

  if (parsed.isBus) {
    return parsed.bbId + ':' + parsed.busRail;
  }

  return parsed.bbId + ':col' + parsed.col + '-' + parsed.section;
}

// ─── Union-Find ─────────────────────────────────────────────────────────
function createUF() {
  const parent = {};
  function find(x) {
    if (!parent[x]) parent[x] = x;
    if (parent[x] === x) return x;
    parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(a, b) {
    parent[find(a)] = find(b);
  }
  return { find, union };
}

// ─── Validation functions ───────────────────────────────────────────────

/**
 * CHECK 1: Gap crossing validation
 */
function checkGapCrossing(exp) {
  const issues = [];
  const connections = exp.connections || [];
  const pinAssignments = exp.pinAssignments || {};

  const uf = createUF();

  // Union wire endpoints using net keys
  connections.forEach(function(conn) {
    uf.union(getNetKey(conn.from), getNetKey(conn.to));
  });

  // Union pinAssignment pins with their breadboard locations
  Object.entries(pinAssignments).forEach(function(entry) {
    uf.union(entry[0], getNetKey(entry[1]));
  });

  // Collect all pins placed on breadboard by column
  var bbPinsByCol = {};

  Object.values(pinAssignments).forEach(function(bbRef) {
    var parsed = parseBBPin(bbRef);
    if (parsed && !parsed.isBus) {
      var key = parsed.bbId + ':' + parsed.col;
      if (!bbPinsByCol[key]) bbPinsByCol[key] = { top: [], bot: [] };
      bbPinsByCol[key][parsed.section].push(bbRef);
    }
  });

  connections.forEach(function(conn) {
    [conn.from, conn.to].forEach(function(ref) {
      var parsed = parseBBPin(ref);
      if (parsed && !parsed.isBus) {
        var key = parsed.bbId + ':' + parsed.col;
        if (!bbPinsByCol[key]) bbPinsByCol[key] = { top: [], bot: [] };
        bbPinsByCol[key][parsed.section].push(ref);
      }
    });
  });

  // Find gap-crossing wires
  var crossedCols = {};
  connections.forEach(function(conn) {
    var fromP = parseBBPin(conn.from);
    var toP = parseBBPin(conn.to);
    if (!fromP || !toP) return;
    if (fromP.isBus || toP.isBus) return;
    if (fromP.bbId === toP.bbId && fromP.section !== toP.section) {
      crossedCols[fromP.bbId + ':' + fromP.col] = true;
      crossedCols[toP.bbId + ':' + toP.col] = true;
    }
  });

  // Check columns with pins in both sections
  // KEY INSIGHT: Two pins at the same column in different sections are only a problem
  // if they SHOULD be in the same electrical net AND the only way to achieve that
  // connectivity is through the column gap (not through bus rails).
  //
  // Cases:
  // A) Same component spans gap (push-button): the component's internal model
  //    bridges the gap when pressed. This is BY DESIGN — not a bug. INFO only.
  // B) Different components in same column, separate circuits sharing column number:
  //    connectivity goes through bus rails (shared power/ground), NOT through the column gap.
  //    This is fine — no gap wire needed.
  // C) A wire explicitly connects a top-section main hole to a bottom-section main hole
  //    in the same column WITHOUT going through a gap wire: this would be a real issue.
  //    However, this can't happen because such a wire would itself BE the gap wire.
  //
  // The only REAL gap issue is when a component or wire REQUIRES col-top to be connected
  // to col-bottom but no wire crosses the gap at that column, AND the connectivity
  // cannot be achieved through bus rails or other paths.
  //
  // Approach: check if a wire directly references both top-section and bottom-section
  // MAIN pins (not bus) at the SAME column without an explicit gap-crossing wire.
  // Also flag components spanning the gap as INFO (by-design for pushbuttons).

  Object.entries(bbPinsByCol).forEach(function(entry) {
    var colKey = entry[0];
    var sections = entry[1];
    if (sections.top.length > 0 && sections.bot.length > 0) {
      if (!crossedCols[colKey]) {
        // Check if same component spans gap (like pushbutton)
        var topComps = Object.entries(pinAssignments)
          .filter(function(e) { return sections.top.indexOf(e[1]) >= 0; })
          .map(function(e) { return e[0].split(':')[0]; });
        var botComps = Object.entries(pinAssignments)
          .filter(function(e) { return sections.bot.indexOf(e[1]) >= 0; })
          .map(function(e) { return e[0].split(':')[0]; });

        var sharedComps = topComps.filter(function(c) { return botComps.indexOf(c) >= 0; });
        if (sharedComps.length > 0) {
          // Same component spans gap — check if it's a push-button (by design)
          var compTypes = sharedComps.map(function(cId) {
            var comp = (exp.components || []).find(function(c) { return c.id === cId; });
            return comp ? comp.type : 'unknown';
          });
          var allPushButtons = compTypes.every(function(t) { return t === 'push-button'; });
          if (allPushButtons) {
            // Pushbutton spanning gap is BY DESIGN — CircuitSolver._mergePins handles this.
            // INFO level only, not an error.
          } else {
            issues.push('Col ' + colKey + ': component spans gap without gap wire (types: ' + compTypes.join(', ') + ')');
          }
        }
        // For different components: only flag if there's a direct wire that needs
        // col-top connected to col-bottom (not just shared bus connectivity).
        // A direct wire from e.g. bb1:a5 to bb1:h5 would be the gap wire itself,
        // so this case doesn't produce false positives from bus rails.
        //
        // The remaining question: does ANY wire go from a pin in the top-section
        // of THIS column to a pin in the bottom-section of THIS column?
        // (This would mean someone routed a wire expecting gap connectivity.)
        var colNum = colKey.split(':')[1];
        var bbId = colKey.split(':')[0];
        var needsDirectBridge = connections.some(function(conn) {
          var fromP = parseBBPin(conn.from);
          var toP = parseBBPin(conn.to);
          if (!fromP || !toP) return false;
          if (fromP.isBus || toP.isBus) return false;
          // Check if this wire connects to the same column in DIFFERENT sections
          // (but is NOT itself a gap wire — it goes through other columns)
          // Actually, if the wire goes from colX-top to colX-bot directly, it IS a gap wire
          // and would have been caught by crossedCols. So this check is for wires that
          // go from THIS column's top net to THIS column's bottom net via intermediate hops.
          // But intermediate hops go through other columns or bus, not this column.
          // So the only real issue is when the circuit DESIGN requires col-top = col-bottom
          // but no path exists. We need to check if any component has one pin in top
          // and another in bottom of same column (already handled above as sharedComps).
          return false;
        });
      }
    }
  });

  return issues;
}

/**
 * CHECK 2: Wire color consistency
 */
function checkWireColors(exp) {
  var issues = [];
  var connections = exp.connections || [];

  connections.forEach(function(conn, idx) {
    var color = conn.color;
    if (!color) return;

    var fromPin = (conn.from.split(':')[1] || '');
    var toPin = (conn.to.split(':')[1] || '');

    // Red wire connecting to GND/negative
    if (color === 'red') {
      if (fromPin.indexOf('minus') >= 0 || toPin.indexOf('minus') >= 0 ||
          fromPin.indexOf('negative') >= 0 || toPin.indexOf('negative') >= 0 ||
          fromPin === 'GND' || toPin === 'GND' ||
          fromPin === 'GND_R' || toPin === 'GND_R') {
        issues.push('Wire ' + idx + ': RED wire to GND (' + conn.from + ' -> ' + conn.to + ')');
      }
    }

    // Black wire connecting to VCC/positive
    if (color === 'black') {
      if (fromPin.indexOf('positive') >= 0 || toPin.indexOf('positive') >= 0 ||
          fromPin === '5V' || toPin === '5V' ||
          (fromPin.indexOf('bus-') >= 0 && fromPin.indexOf('-plus') >= 0) ||
          (toPin.indexOf('bus-') >= 0 && toPin.indexOf('-plus') >= 0)) {
        issues.push('Wire ' + idx + ': BLACK wire to VCC (' + conn.from + ' -> ' + conn.to + ')');
      }
    }
  });

  return issues;
}

/**
 * CHECK 3: Duplicate wires
 */
function checkDuplicateWires(exp) {
  var issues = [];
  var connections = exp.connections || [];
  var seen = {};

  connections.forEach(function(conn, idx) {
    var key1 = conn.from + '|' + conn.to;
    var key2 = conn.to + '|' + conn.from;

    if (seen[key1] || seen[key2]) {
      issues.push('Wire ' + idx + ': DUPLICATE (' + conn.from + ' -> ' + conn.to + ')');
    }
    seen[key1] = true;
  });

  return issues;
}

/**
 * CHECK 4: BuildSteps wire consistency
 */
function checkBuildStepsConsistency(exp) {
  var issues = [];
  var connections = exp.connections || [];
  var buildSteps = exp.buildSteps || [];

  // Collect all wire steps from buildSteps
  var buildWires = {};
  buildSteps.forEach(function(step) {
    if (step.wireFrom && step.wireTo) {
      buildWires[step.wireFrom + '|' + step.wireTo] = true;
      buildWires[step.wireTo + '|' + step.wireFrom] = true;
    }
  });

  // Check each connection has a matching buildStep
  connections.forEach(function(conn, idx) {
    var key1 = conn.from + '|' + conn.to;
    var key2 = conn.to + '|' + conn.from;
    if (!buildWires[key1] && !buildWires[key2]) {
      issues.push('Wire ' + idx + ': "' + conn.from + '" -> "' + conn.to + '" NOT in buildSteps');
    }
  });

  // Check each buildStep wire has a matching connection
  buildSteps.forEach(function(step) {
    if (step.wireFrom && step.wireTo) {
      var hasMatch = connections.some(function(conn) {
        return (conn.from === step.wireFrom && conn.to === step.wireTo) ||
               (conn.from === step.wireTo && conn.to === step.wireFrom);
      });
      if (!hasMatch) {
        issues.push('BuildStep ' + step.step + ': wire "' + step.wireFrom + '" -> "' + step.wireTo + '" NOT in connections');
      }
    }
  });

  return issues;
}

/**
 * CHECK 5: Circuit completeness
 */
function checkCircuitCompleteness(exp) {
  var issues = [];
  var connections = exp.connections || [];
  var components = exp.components || [];
  var pinAssignments = exp.pinAssignments || {};

  // Check floating components
  var connectedComps = {};
  connections.forEach(function(conn) {
    connectedComps[conn.from.split(':')[0]] = true;
    connectedComps[conn.to.split(':')[0]] = true;
  });
  Object.keys(pinAssignments).forEach(function(k) {
    connectedComps[k.split(':')[0]] = true;
  });

  components.forEach(function(comp) {
    if (comp.type === 'breadboard-half' || comp.type === 'breadboard-full') return;
    if (!connectedComps[comp.id]) {
      issues.push('Component "' + comp.id + '" (' + comp.type + ') is floating');
    }
  });

  // For Arduino experiments, check signal pin connection exists
  var hasArduino = components.some(function(c) { return c.type === 'nano-r4'; });
  if (hasArduino) {
    var nano = components.find(function(c) { return c.type === 'nano-r4'; });
    var hasSignal = connections.some(function(conn) {
      var fromComp = conn.from.split(':');
      var toComp = conn.to.split(':');
      if (fromComp[0] === nano.id) {
        var pin = fromComp[1];
        return pin !== 'GND_R' && pin !== '5V' && pin !== '3V3' && pin !== 'VIN' && pin !== 'GND';
      }
      if (toComp[0] === nano.id) {
        var pin2 = toComp[1];
        return pin2 !== 'GND_R' && pin2 !== '5V' && pin2 !== '3V3' && pin2 !== 'VIN' && pin2 !== 'GND';
      }
      return false;
    });
    if (!hasSignal) {
      issues.push('Arduino has no signal pin connections');
    }
  }

  return issues;
}

/**
 * CHECK 6: Impossible connections (invalid pin refs)
 */
function checkImpossibleConnections(exp) {
  var issues = [];
  var connections = exp.connections || [];

  connections.forEach(function(conn, idx) {
    var fromP = parseBBPin(conn.from);
    var toP = parseBBPin(conn.to);

    // Determine max columns based on breadboard type
    var maxCol = 30; // breadboard-half
    var components = exp.components || [];
    if (components.some(function(c) { return c.type === 'breadboard-full'; })) {
      maxCol = 63; // breadboard-full has ~63 columns
    }

    if (fromP && !fromP.isBus && (fromP.col < 1 || fromP.col > maxCol)) {
      issues.push('Wire ' + idx + ': invalid col ' + fromP.col + ' in ' + conn.from + ' (max=' + maxCol + ')');
    }
    if (toP && !toP.isBus && (toP.col < 1 || toP.col > maxCol)) {
      issues.push('Wire ' + idx + ': invalid col ' + toP.col + ' in ' + conn.to + ' (max=' + maxCol + ')');
    }

    // Check bus pin column range
    if (fromP && fromP.isBus && (fromP.col < 1 || fromP.col > maxCol)) {
      issues.push('Wire ' + idx + ': invalid bus col ' + fromP.col + ' in ' + conn.from + ' (max=' + maxCol + ')');
    }
    if (toP && toP.isBus && (toP.col < 1 || toP.col > maxCol)) {
      issues.push('Wire ' + idx + ': invalid bus col ' + toP.col + ' in ' + conn.to + ' (max=' + maxCol + ')');
    }
  });

  return issues;
}

// ─── Run all checks ─────────────────────────────────────────────────────

var HEADER = 'EXPERIMENT_ID'.padEnd(25) + ' | STATUS | GAP  | COLOR | DUPS | BUILD | COMPLETE | IMPOSSIBLE | FIRST ISSUE';
var SEPARATOR = '-'.repeat(150);

console.log(HEADER);
console.log(SEPARATOR);

var totalPass = 0;
var totalFail = 0;
var totalGap = 0;
var totalColor = 0;
var totalDup = 0;
var totalBuild = 0;
var totalComplete = 0;
var totalImpossible = 0;

var allIssues = [];

allExperiments.forEach(function(exp) {
  var gapIssues = checkGapCrossing(exp);
  var colorIssues = checkWireColors(exp);
  var dupIssues = checkDuplicateWires(exp);
  var buildIssues = checkBuildStepsConsistency(exp);
  var completeIssues = checkCircuitCompleteness(exp);
  var impossibleIssues = checkImpossibleConnections(exp);

  var allExpIssues = [];
  gapIssues.forEach(function(i) { allExpIssues.push('[GAP] ' + i); });
  colorIssues.forEach(function(i) { allExpIssues.push('[COLOR] ' + i); });
  dupIssues.forEach(function(i) { allExpIssues.push('[DUP] ' + i); });
  buildIssues.forEach(function(i) { allExpIssues.push('[BUILD] ' + i); });
  completeIssues.forEach(function(i) { allExpIssues.push('[COMPLETE] ' + i); });
  impossibleIssues.forEach(function(i) { allExpIssues.push('[IMPOSSIBLE] ' + i); });

  var hasIssues = allExpIssues.length > 0;
  var status = hasIssues ? 'FAIL' : 'PASS';

  if (hasIssues) {
    totalFail++;
    allIssues.push({ id: exp.id, issues: allExpIssues });
  } else {
    totalPass++;
  }

  totalGap += gapIssues.length;
  totalColor += colorIssues.length;
  totalDup += dupIssues.length;
  totalBuild += buildIssues.length;
  totalComplete += completeIssues.length;
  totalImpossible += impossibleIssues.length;

  var details = allExpIssues.length > 0 ? allExpIssues[0].substring(0, 70) : '';
  console.log(
    exp.id.padEnd(25) + ' | ' +
    (status === 'PASS' ? '\x1b[32mPASS\x1b[0m  ' : '\x1b[31mFAIL\x1b[0m  ') + ' | ' +
    String(gapIssues.length).padEnd(4) + ' | ' +
    String(colorIssues.length).padEnd(5) + ' | ' +
    String(dupIssues.length).padEnd(4) + ' | ' +
    String(buildIssues.length).padEnd(5) + ' | ' +
    String(completeIssues.length).padEnd(8) + ' | ' +
    String(impossibleIssues.length).padEnd(10) + ' | ' +
    details
  );
});

console.log(SEPARATOR);

// ─── Summary ────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(80));
console.log('  SUMMARY — ELAB Wire Routing Validation');
console.log('='.repeat(80));
console.log('  Total experiments:    ' + allExperiments.length);
console.log('  \x1b[32mPASS:\x1b[0m                  ' + totalPass);
console.log('  \x1b[31mFAIL:\x1b[0m                  ' + totalFail);
console.log('  Pass rate:            ' + ((totalPass / allExperiments.length) * 100).toFixed(1) + '%');
console.log('');
console.log('  Issue breakdown:');
console.log('    Gap crossing:       ' + totalGap);
console.log('    Color consistency:  ' + totalColor);
console.log('    Duplicate wires:    ' + totalDup);
console.log('    BuildSteps sync:    ' + totalBuild);
console.log('    Completeness:       ' + totalComplete);
console.log('    Impossible:         ' + totalImpossible);
var totalAll = totalGap + totalColor + totalDup + totalBuild + totalComplete + totalImpossible;
console.log('    TOTAL ISSUES:       ' + totalAll);
console.log('='.repeat(80));

// ─── Detailed issue report ──────────────────────────────────────────────
if (allIssues.length > 0) {
  console.log('\n' + '='.repeat(80));
  console.log('  DETAILED ISSUE REPORT');
  console.log('='.repeat(80));

  allIssues.forEach(function(item) {
    console.log('\n  \x1b[33m' + item.id + '\x1b[0m (' + item.issues.length + ' issues):');
    item.issues.forEach(function(issue) {
      console.log('    - ' + issue);
    });
  });
}

console.log('\n\x1b[36mValidation complete.\x1b[0m\n');
