/**
 * ELAB Sprint 3 — T1: Validazione di TUTTI i 69 esperimenti
 * Verifica struttura, tipi componenti, pinAssignments, codice AVR
 * Eseguire con: node tests/experiment-validation.mjs
 * © Andrea Marro — 13/02/2026
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// ─── Carica moduli usando dynamic import con trasformazione ───
// I file usano `export default` quindi li importiamo come ESM
async function loadExperiments(filename) {
  // Leggi il file e trasformalo per Node (rimuovi JSX/React se presente)
  const filePath = resolve(rootDir, 'src/data', filename);
  let content = readFileSync(filePath, 'utf8');

  // Converti `const X = { ... }; export default X;` in modulo valido
  // Scrivi in file temp e importa
  const tmpPath = resolve(__dirname, `_tmp_${filename.replace('.js', '.mjs')}`);

  // Rimuovi export default linea e sostituisci con export
  content = content.replace(/^const\s+(\w+)\s*=/m, 'export const data =');
  content = content.replace(/export\s+default\s+\w+;\s*$/, '');

  const { writeFileSync, unlinkSync } = await import('fs');
  writeFileSync(tmpPath, content, 'utf8');

  try {
    const mod = await import(tmpPath);
    return mod.data;
  } finally {
    try { unlinkSync(tmpPath); } catch {}
  }
}

// ─── Tipi componenti validi ───
const VALID_TYPES = new Set([
  'led', 'resistor', 'battery9v', 'battery-9v',
  'breadboard-half', 'breadboard-full',
  'nano-r4', 'push-button', 'potentiometer',
  'ldr', 'buzzer-piezo', 'reed-switch',
  'capacitor', 'mosfet-n', 'phototransistor',
  'motor-dc', 'diode', 'rgb-led', 'multimeter',
  'servo', 'lcd16x2', 'photo-resistor',
]);

// Esperimenti esenti da pinAssignments
const PIN_EXEMPT = new Set([
  'v1-cap13-esp1',
  'v1-cap13-esp2',
  'v2-cap6-esp4',
  'v2-cap10-esp1',
  'v2-cap10-esp2',
  'v3-cap8-id',
]);

// ─── MAIN ───
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ELAB Sprint 3 — T1: Validazione 69 Esperimenti');
  console.log('═══════════════════════════════════════════════════════\n');

  const vol1 = await loadExperiments('experiments-vol1.js');
  const vol2 = await loadExperiments('experiments-vol2.js');
  const vol3 = await loadExperiments('experiments-vol3.js');

  const allExperiments = [
    ...vol1.experiments,
    ...vol2.experiments,
    ...vol3.experiments,
  ];

  console.log(`Vol1: ${vol1.experiments.length} esperimenti`);
  console.log(`Vol2: ${vol2.experiments.length} esperimenti`);
  console.log(`Vol3: ${vol3.experiments.length} esperimenti`);
  console.log(`Totale: ${allExperiments.length} esperimenti\n`);

  let pass = 0;
  let fail = 0;
  const failures = [];

  for (const exp of allExperiments) {
    const errors = [];

    // 1. ID check
    if (!exp.id) {
      errors.push('ID mancante');
    } else if (!/^v[1-3]-(cap\d+-esp\d+|cap\d+-\w+|extra-.+)$/.test(exp.id)) {
      errors.push(`ID pattern non valido: ${exp.id}`);
    }

    // 2. Title check
    if (!exp.title || exp.title.length < 3) {
      errors.push('Titolo mancante o troppo corto');
    }

    // 3. Chapter check
    if (!exp.chapter || exp.chapter.length < 3) {
      errors.push('Capitolo mancante o troppo corto');
    }

    // 4. simulationMode check
    if (!['circuit', 'avr'].includes(exp.simulationMode)) {
      errors.push(`simulationMode non valido: ${exp.simulationMode}`);
    }

    // 5. difficulty check
    if (![1, 2, 3].includes(exp.difficulty)) {
      errors.push(`difficulty non valido: ${exp.difficulty}`);
    }

    // 6. Components check
    if (!exp.components || !Array.isArray(exp.components) || exp.components.length === 0) {
      errors.push('Array componenti vuoto o mancante');
    } else {
      for (const comp of exp.components) {
        if (!comp.type) {
          errors.push(`Componente senza type: ${JSON.stringify(comp)}`);
        } else if (!VALID_TYPES.has(comp.type)) {
          errors.push(`Tipo componente sconosciuto: "${comp.type}"`);
        }
        if (!comp.id) {
          errors.push(`Componente senza id: type=${comp.type}`);
        }
      }
    }

    // 7. pinAssignments check (unless exempt)
    if (!PIN_EXEMPT.has(exp.id)) {
      if (!exp.pinAssignments || typeof exp.pinAssignments !== 'object') {
        errors.push('pinAssignments mancante');
      } else if (Object.keys(exp.pinAssignments).length === 0) {
        errors.push('pinAssignments vuoto');
      }
    }

    // 8. Code check for AVR
    if (exp.simulationMode === 'avr') {
      if (!exp.code || exp.code.trim().length === 0) {
        errors.push('Code mancante per esperimento AVR');
      }
    }

    // Result
    if (errors.length === 0) {
      pass++;
      console.log(`  ✅ ${exp.id}`);
    } else {
      fail++;
      failures.push({ id: exp.id, errors });
      console.log(`  ❌ ${exp.id} — ${errors.join(', ')}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  RISULTATO: ${pass}/${allExperiments.length} PASS`);
  if (fail > 0) {
    console.log(`  ❌ ${fail} FAIL:`);
    for (const f of failures) {
      console.log(`    - ${f.id}: ${f.errors.join('; ')}`);
    }
  } else {
    console.log('  🎉 TUTTI GLI ESPERIMENTI PASSANO!');
  }
  console.log('═══════════════════════════════════════════════════════\n');

  process.exit(fail > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('ERRORE FATALE:', err);
  process.exit(2);
});
