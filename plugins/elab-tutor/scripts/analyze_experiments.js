const fs = require('fs');
const path = require('path');

// Leggi il file esperimenti
const expFile = fs.readFileSync('./PRODOTTO/elab-builder/src/data/experiments-vol1.js', 'utf8');
const expData = eval(expFile.replace('export default EXPERIMENTS_VOL1;', '').trim() + '; EXPERIMENTS_VOL1');

console.log('═══════════════════════════════════════════════════════════════');
console.log('ANALISI ESperimenti Volume 1 - ELAB');
console.log('Totale esperimenti:', expData.experiments.length);
console.log('═══════════════════════════════════════════════════════════════\n');

// Dimensioni componenti (in colonne/pixel)
const COMPONENT_SIZES = {
  'led': { cols: 1, width: 20, height: 50 },
  'resistor': { cols: 6, width: 60, height: 16 },
  'rgb-led': { cols: 4, width: 36, height: 50 },
  'push-button': { width: 34, height: 24 },
  'potentiometer': { width: 24, height: 50 },
  'mosfet-n': { width: 44, height: 48 },
  'battery9v': { width: 40, height: 90 },
  'breadboard-half': { width: 253, height: 145 },
  'breadboard-full': { width: 600, height: 200 },
  'photo-resistor': { width: 18.5, height: 37.5 },
  'reed-switch': { width: 34.5, height: 15 },
  'buzzer-piezo': { width: 60, height: 60 }
};

// Conversione coordinate breadboard
function breadboardToPixel(holeId) {
  if (!holeId || !holeId.includes(':')) return null;
  const [bb, pos] = holeId.split(':');
  if (!pos) return null;
  
  const match = pos.match(/^([a-j])(\d+)$/);
  if (!match) return null;
  
  const row = match[1];
  const col = parseInt(match[2]);
  const rowIndex = row.charCodeAt(0) - 'a'.charCodeAt(0);
  
  let baseY;
  if (row >= 'a' && row <= 'e') {
    baseY = 43.75;
  } else {
    baseY = 73.75;
  }
  
  return {
    x: 117.75 + (col - 1) * 7.5,
    y: baseY + rowIndex * 7.5,
    row,
    col,
    rowIndex
  };
}

let totalIssues = 0;

expData.experiments.forEach((exp, idx) => {
  console.log('\n───────────────────────────────────────────────────────────────');
  console.log('ESPERIMENTO #' + (idx + 1) + ': ' + exp.id);
  console.log('Titolo:', exp.title);
  console.log('───────────────────────────────────────────────────────────────');
  
  const issues = [];
  
  // 1. Verifica Arduino (Volume 1 ha solo batterie 9V, niente Arduino)
  const hasArduino = exp.components.some(c => c.type === 'arduino-nano' || c.type === 'nano-r4');
  if (hasArduino) {
    const layout = exp.layout || {};
    Object.entries(layout).forEach(([compId, pos]) => {
      if (compId.includes('arduino') || compId.includes('nano')) {
        if (pos.y >= 10) {
          issues.push('⚠️ Arduino posizionato troppo in basso (y=' + pos.y + '), potrebbe coprire breadboard');
        }
      }
    });
  }
  
  // 2. Verifica allineamento pinAssignment↔layout
  const pinAssignments = exp.pinAssignments || {};
  const layout = exp.layout || {};
  
  Object.entries(pinAssignments).forEach(([pinRef, holeId]) => {
    const expectedPos = breadboardToPixel(holeId);
    if (!expectedPos) return;
    
    const compId = pinRef.split(':')[0];
    const compLayout = layout[compId];
    
    if (!compLayout) {
      issues.push('❌ pin mismatch: ' + pinRef + ' → ' + holeId + ' (componente ' + compId + ' mancante nel layout)');
      return;
    }
    
    const dx = Math.abs(compLayout.x - expectedPos.x);
    const dy = Math.abs(compLayout.y - expectedPos.y);
    const colDiff = dx / 7.5;
    
    if (colDiff > 1.5) {
      issues.push('❌ pin mismatch: ' + pinRef + ' → ' + holeId + 
        ' (atteso: x=' + expectedPos.x.toFixed(1) + ', y=' + expectedPos.y.toFixed(1) + 
        '; trovato: x=' + compLayout.x + ', y=' + compLayout.y + 
        ', diff: ' + colDiff.toFixed(1) + ' colonne)');
    }
  });
  
  // 3. Verifica sovrapposizioni componenti
  const compList = exp.components || [];
  for (let i = 0; i < compList.length; i++) {
    for (let j = i + 1; j < compList.length; j++) {
      const c1 = compList[i];
      const c2 = compList[j];
      const l1 = layout[c1.id];
      const l2 = layout[c2.id];
      
      if (!l1 || !l2) continue;
      
      const s1 = COMPONENT_SIZES[c1.type] || { width: 40, height: 40 };
      const s2 = COMPONENT_SIZES[c2.type] || { width: 40, height: 40 };
      
      const overlapX = Math.abs(l1.x - l2.x) < (s1.width + s2.width) / 2;
      const overlapY = Math.abs(l1.y - l2.y) < (s1.height + s2.height) / 2;
      
      if (overlapX && overlapY) {
        issues.push('⚠️ Sovrapposizione: ' + c1.id + ' (' + c1.type + ') con ' + c2.id + ' (' + c2.type + ')' +
          ' (distanza: ' + Math.abs(l1.x - l2.x).toFixed(0) + 'px orizz, ' + Math.abs(l1.y - l2.y).toFixed(0) + 'px vert)');
      }
    }
  }
  
  // Output risultati
  if (issues.length === 0) {
    console.log('✅ PASS - Nessun problema trovato');
  } else {
    console.log('❌ PROBLEMI TROVATI (' + issues.length + '):');
    issues.forEach(issue => console.log('   ' + issue));
    totalIssues += issues.length;
  }
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('RIEPILOGO FINALE');
console.log('Totale esperimenti analizzati:', expData.experiments.length);
console.log('Totale problemi trovati:', totalIssues);
console.log('═══════════════════════════════════════════════════════════════');
