// Temporary validation script for FASE 5
const m1 = await import("../../../src/data/experiments-vol1.js");
const m2 = await import("../../../src/data/experiments-vol2.js");
const m3 = await import("../../../src/data/experiments-vol3.js");

const all = [
  ...m1.default.experiments.map(e => ({...e, vol: "v1"})),
  ...m2.default.experiments.map(e => ({...e, vol: "v2"})),
  ...m3.default.experiments.map(e => ({...e, vol: "v3"})),
];

let issues = [];
all.forEach(e => {
  const comps = e.components || [];
  const conns = e.connections || [];
  const layout = e.layout || {};

  // Check: every component has an id and type
  comps.forEach(c => {
    if (!c.id) issues.push(e.id + ": component missing id");
    if (!c.type) issues.push(e.id + ": component missing type");
  });

  // Check: every connection references existing component ids
  const compIds = new Set(comps.map(c => c.id));
  conns.forEach((conn, i) => {
    const fromId = conn.from ? conn.from.split(":")[0] : null;
    const toId = conn.to ? conn.to.split(":")[0] : null;
    if (fromId && !compIds.has(fromId)) {
      issues.push(e.id + ": conn[" + i + "] from=" + conn.from + " not in components");
    }
    if (toId && !compIds.has(toId)) {
      issues.push(e.id + ": conn[" + i + "] to=" + conn.to + " not in components");
    }
  });
});

console.log("=== FASE 5 Deep Validation ===");
console.log("Total experiments:", all.length);
console.log("Issues found:", issues.length);
if (issues.length > 0) {
  issues.slice(0, 30).forEach(i => console.log("  -", i));
}

// Stats
const stats = {
  totalComps: all.reduce((s, e) => s + (e.components?.length || 0), 0),
  totalConns: all.reduce((s, e) => s + (e.connections?.length || 0), 0),
  withBuildSteps: all.filter(e => e.buildSteps && e.buildSteps.length > 0).length,
  withLayout: all.filter(e => Object.keys(e.layout || {}).length > 0).length,
  withGalileoPrompt: all.filter(e => e.galileoPrompt).length,
};
console.log("\nStats:", JSON.stringify(stats, null, 2));

// Vol3 Scratch details
const vol3avr = m3.default.experiments.filter(e => e.simulationMode === "avr");
const withScratch = vol3avr.filter(e => e.scratchXml);
const withDefaultCode = m3.default.experiments.filter(e => e.defaultCode);
console.log("\nVol3 AVR:", vol3avr.length);
console.log("Vol3 AVR with scratchXml:", withScratch.length);
console.log("Vol3 AVR with scratchXml IDs:", withScratch.map(e => e.id).join(", "));
console.log("Vol3 without scratchXml:", vol3avr.filter(e => !e.scratchXml).map(e => e.id).join(", "));
console.log("Vol3 with defaultCode:", withDefaultCode.length, withDefaultCode.map(e => e.id).join(", "));

// Modes
const circuit = all.filter(e => e.simulationMode === "circuit").length;
const avr = all.filter(e => e.simulationMode === "avr").length;
console.log("\nSimulation modes: circuit=" + circuit + ", avr=" + avr);
