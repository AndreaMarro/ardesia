/**
 * Pin Validator Statistics — Sanity Check
 * Counts exactly how many pin references were validated per experiment
 * to ensure the deep validator isn't silently skipping data.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data';
const files = [
  { path: resolve(ROOT, 'experiments-vol1.js'), volume: 1 },
  { path: resolve(ROOT, 'experiments-vol2.js'), volume: 2 },
  { path: resolve(ROOT, 'experiments-vol3.js'), volume: 3 },
];

let grandTotal = { experiments: 0, components: 0, connections: 0, pinAssignPairs: 0, buildStepWires: 0, buildStepTargets: 0 };
const perVolume = { 1: { experiments: 0, components: 0, connections: 0, pinAssignPairs: 0, buildStepWires: 0, buildStepTargets: 0 },
                    2: { experiments: 0, components: 0, connections: 0, pinAssignPairs: 0, buildStepWires: 0, buildStepTargets: 0 },
                    3: { experiments: 0, components: 0, connections: 0, pinAssignPairs: 0, buildStepWires: 0, buildStepTargets: 0 } };
const experiments = [];

for (const file of files) {
  const content = readFileSync(file.path, 'utf-8');

  const idRegex = /id:\s*['"]([^'"]+)['"]/g;
  let match;
  const allIds = [];
  while ((match = idRegex.exec(content)) !== null) {
    if (match[1].match(/^v\d+-/)) allIds.push(match[1]);
  }

  for (const expId of allIds) {
    const stats = { id: expId, vol: file.volume, components: 0, connections: 0, pinAssignPairs: 0, buildStepWires: 0, buildStepTargets: 0 };

    const idPattern = new RegExp(`id:\\s*['"]${expId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
    const idMatch = idPattern.exec(content);
    if (!idMatch) continue;

    const startIdx = idMatch.index;
    const nextIdRegex = /id:\s*['"]v\d+-/g;
    nextIdRegex.lastIndex = startIdx + 10;
    const nextMatch = nextIdRegex.exec(content);
    const endIdx = nextMatch ? nextMatch.index - 20 : startIdx + 30000;
    const expBlock = content.substring(startIdx, Math.min(endIdx, startIdx + 30000));

    // Components
    const componentsMatch = expBlock.match(/components:\s*\[([\s\S]*?)\]\s*,/);
    if (componentsMatch) {
      const compBlockRegex = /\{([^}]+)\}/g;
      let cm;
      while ((cm = compBlockRegex.exec(componentsMatch[1])) !== null) {
        const typeM = cm[1].match(/type:\s*['"]([^'"]+)['"]/);
        const idM = cm[1].match(/\bid:\s*['"]([^'"]+)['"]/);
        if (typeM && idM) stats.components++;
      }
    }

    // Connections
    const connectionsMatch = expBlock.match(/connections:\s*\[([\s\S]*?)\]\s*,/);
    if (connectionsMatch) {
      const connBlockRegex = /\{([^}]+)\}/g;
      let cm;
      while ((cm = connBlockRegex.exec(connectionsMatch[1])) !== null) {
        const fromM = cm[1].match(/from:\s*['"]([^'"]+)['"]/);
        const toM = cm[1].match(/to:\s*['"]([^'"]+)['"]/);
        if (fromM && toM) stats.connections++;
      }
    }

    // pinAssignments
    const paMatch = expBlock.match(/pinAssignments:\s*\{([\s\S]*?)\}\s*,/);
    if (paMatch) {
      const paPairRegex = /["']([^"']+)["']\s*:\s*["']([^"']+)["']/g;
      let pm;
      while ((pm = paPairRegex.exec(paMatch[1])) !== null) {
        stats.pinAssignPairs++;
      }
    }

    // buildSteps
    const bsMatch = expBlock.match(/buildSteps:\s*\[([\s\S]*?)\]\s*,?\s*(?:quiz|concept|layer)/);
    if (bsMatch) {
      const bsContent = bsMatch[1];
      const wireFromRe = /wireFrom:\s*["']([^"']+)["']/g;
      let wm;
      while ((wm = wireFromRe.exec(bsContent)) !== null) stats.buildStepWires++;

      const tpRegex = /targetPins:\s*\{([^}]+)\}/g;
      let tpm;
      while ((tpm = tpRegex.exec(bsContent)) !== null) {
        const tpPairRegex = /["']([^"']+)["']\s*:\s*["']([^"']+)["']/g;
        let tpp;
        while ((tpp = tpPairRegex.exec(tpm[1])) !== null) {
          stats.buildStepTargets++;
        }
      }
    }

    experiments.push(stats);
    grandTotal.experiments++;
    grandTotal.components += stats.components;
    grandTotal.connections += stats.connections;
    grandTotal.pinAssignPairs += stats.pinAssignPairs;
    grandTotal.buildStepWires += stats.buildStepWires;
    grandTotal.buildStepTargets += stats.buildStepTargets;
    perVolume[file.volume].experiments++;
    perVolume[file.volume].components += stats.components;
    perVolume[file.volume].connections += stats.connections;
    perVolume[file.volume].pinAssignPairs += stats.pinAssignPairs;
    perVolume[file.volume].buildStepWires += stats.buildStepWires;
    perVolume[file.volume].buildStepTargets += stats.buildStepTargets;
  }
}

// Per-experiment table
console.log('EXPERIMENT                    | COMP | CONN | P.ASSIGN | BS-WIRE | BS-TARGET');
console.log('-'.repeat(85));
for (const e of experiments) {
  const id = e.id.padEnd(29);
  console.log(`${id} | ${String(e.components).padStart(4)} | ${String(e.connections).padStart(4)} | ${String(e.pinAssignPairs).padStart(8)} | ${String(e.buildStepWires).padStart(7)} | ${String(e.buildStepTargets).padStart(9)}`);
}

// Per-volume summary
console.log('\n' + '='.repeat(85));
console.log('PER-VOLUME SUMMARY');
console.log('='.repeat(85));
for (const v of [1, 2, 3]) {
  const s = perVolume[v];
  console.log(`Vol${v}: ${s.experiments} experiments, ${s.components} components, ${s.connections} connections, ${s.pinAssignPairs} pinAssign pairs, ${s.buildStepWires} buildStep wires, ${s.buildStepTargets} buildStep targets`);
}

// Grand total
console.log('\n' + '='.repeat(85));
console.log('GRAND TOTAL');
console.log('='.repeat(85));
console.log(`Experiments: ${grandTotal.experiments}`);
console.log(`Components: ${grandTotal.components}`);
console.log(`Connections: ${grandTotal.connections} (= ${grandTotal.connections * 2} pin refs validated)`);
console.log(`pinAssignment pairs: ${grandTotal.pinAssignPairs} (= ${grandTotal.pinAssignPairs * 2} pin refs validated)`);
console.log(`buildStep wires: ${grandTotal.buildStepWires} (= ${grandTotal.buildStepWires * 2} pin refs validated)`);
console.log(`buildStep targets: ${grandTotal.buildStepTargets} (= ${grandTotal.buildStepTargets * 2} pin refs validated)`);
const totalRefs = (grandTotal.connections + grandTotal.pinAssignPairs + grandTotal.buildStepWires + grandTotal.buildStepTargets) * 2;
console.log(`\nTOTAL PIN REFERENCES VALIDATED: ${totalRefs}`);

// Sanity checks
const noConn = experiments.filter(e => e.connections === 0);
const noPA = experiments.filter(e => e.pinAssignPairs === 0);
const noBS = experiments.filter(e => e.buildStepWires === 0 && e.buildStepTargets === 0);
if (noConn.length > 0) {
  console.log(`\nWARNING: ${noConn.length} experiment(s) with 0 connections: ${noConn.map(e => e.id).join(', ')}`);
}
if (noPA.length > 0) {
  console.log(`\nNOTE: ${noPA.length} experiment(s) with 0 pinAssignment pairs: ${noPA.map(e => e.id).join(', ')}`);
}
if (noBS.length > 0) {
  console.log(`\nNOTE: ${noBS.length} experiment(s) with 0 buildStep wire/target refs: ${noBS.map(e => e.id).join(', ')}`);
}
