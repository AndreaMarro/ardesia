# G52 — PRE-COMPILE ALL 62 EXPERIMENTS + OFFLINE FIRST

## Contesto
Fase 3 del piano sanamento: offline-first. Attualmente solo ~12 esperimenti hanno HEX precompilato. I restanti richiedono il server. Obiettivo: TUTTI i 62 esperimenti funzionano offline con codice default.
Piano completo: `docs/prompts/G46-G55-sanamento-completo.md`

## STATO PRE-SESSIONE (da verificare)
- Test PASS count: ___  | Build time: ___s | Bundle: ___KB | Console errors: ___
- Deploy: https://www.elabtutor.school
- Compiler server su VPS: http://72.60.129.50:3001/compile (da G51)

## REGOLE INVARIANTI
- ZERO DEMO, ZERO MOCK, ZERO DATI FINTI
- 62 lesson paths INTOCCABILI
- Non toccare engine/ — MAI
- `npm run build` + `npx vitest run` dopo OGNI singolo fix
- Palette: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D
- Muted text: #737373 (WCAG AA 4.7:1)
- PATH: `export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"`
- Budget: €50/mese (Claude escluso). Niente servizi costosi.

## PRE-SESSIONE OBBLIGATORIA
1. Esegui `/elab-quality-gate` pre-session
2. Salva baseline: test count, build time, bundle size, console errors
3. Verifica che il compiler server su VPS sia attivo: `curl http://72.60.129.50:3001/compile -X POST -H "Content-Type: application/json" -d '{"code":"void setup(){} void loop(){}"}'`

---

## TASK 1 — Script precompile-all-experiments.js (2h)

### File da leggere PRIMA
- `src/data/experiments-vol1.js` — struttura dati esperimenti Vol1
- `src/data/experiments-vol2.js` — struttura dati esperimenti Vol2
- `src/data/experiments-vol3.js` — struttura dati esperimenti Vol3
- Capire quale campo contiene il codice default (probabilmente `defaultCode` o `code`)

### Creare `scripts/precompile-all-experiments.js`
```javascript
#!/usr/bin/env node
/**
 * Pre-compila tutti i 62 esperimenti ELAB.
 * Invia il defaultCode di ogni esperimento al compile server
 * e salva il HEX risultante in public/hex/{experiment-id}.hex
 *
 * Usage: node scripts/precompile-all-experiments.js
 * Requires: COMPILE_URL env var (default: http://72.60.129.50:3001/compile)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const HEX_DIR = join(ROOT, 'public', 'hex');
const COMPILE_URL = process.env.COMPILE_URL || 'http://72.60.129.50:3001/compile';

// Assicurarsi che la directory hex esista
if (!existsSync(HEX_DIR)) mkdirSync(HEX_DIR, { recursive: true });

// Importare dinamicamente i dati esperimenti
// NOTA: questi file potrebbero usare export default o named export
// Leggere la struttura reale prima di scrivere l'import

async function compileExperiment(id, code) {
  try {
    const res = await fetch(COMPILE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      signal: AbortSignal.timeout(30000)
    });
    const data = await res.json();
    if (data.success && data.hex) {
      writeFileSync(join(HEX_DIR, `${id}.hex`), data.hex);
      return { id, status: 'OK' };
    }
    return { id, status: 'COMPILE_ERROR', error: data.error };
  } catch (err) {
    return { id, status: 'NETWORK_ERROR', error: err.message };
  }
}

async function main() {
  // ADATTARE: importare i dati nel formato corretto leggendo i file sorgente
  // Esempio generico — verificare i nomi reali degli export
  const vol1 = (await import(join(ROOT, 'src/data/experiments-vol1.js'))).default;
  const vol2 = (await import(join(ROOT, 'src/data/experiments-vol2.js'))).default;
  const vol3 = (await import(join(ROOT, 'src/data/experiments-vol3.js'))).default;

  const allExperiments = [...vol1, ...vol2, ...vol3];
  console.log(`Found ${allExperiments.length} experiments`);

  const results = { ok: 0, skipped: 0, failed: 0, errors: [] };

  for (const exp of allExperiments) {
    const code = exp.defaultCode || exp.code;

    // Vol1/Vol2 DC-only experiments may have no Arduino code — skip
    if (!code || code.trim().length < 10) {
      console.log(`SKIP  ${exp.id} — no Arduino code`);
      results.skipped++;
      continue;
    }

    console.log(`COMPILE ${exp.id}...`);
    const result = await compileExperiment(exp.id, code);

    if (result.status === 'OK') {
      console.log(`  OK    ${exp.id}`);
      results.ok++;
    } else {
      console.log(`  FAIL  ${exp.id}: ${result.error}`);
      results.failed++;
      results.errors.push(result);
    }

    // Rate limiting: non piu di 10/min = 1 ogni 6s
    await new Promise(r => setTimeout(r, 6500));
  }

  console.log('\n=== REPORT ===');
  console.log(`OK: ${results.ok} | Skipped: ${results.skipped} | Failed: ${results.failed}`);
  if (results.errors.length) {
    console.log('\nFailed experiments:');
    results.errors.forEach(e => console.log(`  ${e.id}: ${e.error}`));
  }
}

main().catch(console.error);
```

### Aggiungere npm script in package.json
```json
"precompile": "node scripts/precompile-all-experiments.js"
```

---

## TASK 2 — compiler.js: check pre-compiled HEX prima di tutto (1h)

### File da modificare
- `src/services/compiler.js`

### Implementazione
PRIMA di qualsiasi compilazione (prima del session cache, prima del persistent cache, prima del server):

```javascript
// Check for pre-compiled HEX (offline-first)
// Se il codice corrente e IDENTICO al defaultCode dell'esperimento,
// cercare il file HEX precompilato
async function getPrecompiledHex(experimentId) {
  if (!experimentId) return null;
  try {
    const res = await fetch(`/hex/${experimentId}.hex`);
    if (res.ok) return await res.text();
  } catch { /* offline or not found */ }
  return null;
}

// Nel flow di compilazione:
// 1. Se codice == defaultCode dell'esperimento corrente -> check precompiled HEX
// 2. Se codice modificato -> session cache -> persistent cache -> server
```

La logica di confronto codice vs defaultCode:
```javascript
// Normalizzare prima del confronto (trim whitespace, normalizza line endings)
function normalizeCode(code) {
  return code.replace(/\r\n/g, '\n').trim();
}

const isDefaultCode = experimentId &&
  normalizeCode(currentCode) === normalizeCode(getDefaultCode(experimentId));

if (isDefaultCode) {
  const precompiled = await getPrecompiledHex(experimentId);
  if (precompiled) {
    return { success: true, hex: precompiled, source: 'precompiled' };
  }
}
```

### Verifica
- Caricare esperimento con codice default -> Compila -> deve usare HEX precompilato (no network al server)
- Modificare una riga -> Compila -> deve andare al server (o cache se gia compilato prima)

---

## TASK 3 — Aggiornare workbox precache per HEX files (30min)

### File da modificare
- `vite.config.js` — sezione workbox/VitePWA

### Implementazione
Aggiungere al glob pattern del precache:
```javascript
// In vite.config.js, nella configurazione VitePWA/workbox:
workbox: {
  globPatterns: [
    '**/*.{js,css,html,ico,png,svg,woff2}',
    'hex/*.hex'  // <-- AGGIUNGERE
  ],
  // ...
}
```

### Verifica
- `npm run build`
- Controllare output: i file HEX devono apparire nella lista precache
- Contare le entries precache: devono includere tutti i file HEX generati

### ATTENZIONE al bundle size
- Ogni HEX e ~10-30KB. 30 HEX files = ~300-900KB extra nel precache
- Se il totale precache supera 5MB, valutare runtime caching instead of precache per i HEX:
```javascript
runtimeCaching: [{
  urlPattern: /\/hex\/.*\.hex$/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'hex-cache',
    expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 3600 }
  }
}]
```

---

## TASK 4 — Eseguire lo script e committare i HEX (30min)

### Esecuzione
```bash
npm run precompile
```

### Verificare il report
- Quanti OK? Quanti SKIP (no code)? Quanti FAIL?
- Per i FAIL: analizzare se sono errori di codice (fix nel sorgente) o di compilazione (librerie mancanti)
- Target: 0 FAIL su esperimenti con codice Arduino valido

### Committare
- `git add public/hex/*.hex`
- Commit descrittivo: "Add pre-compiled HEX for N experiments (offline-first)"

---

## TASK 5 — Verifica offline completa (30min)

### Test airplane mode
1. `npm run build && npx vite preview`
2. Dev tools -> Application -> Service Workers -> verificare precache include HEX
3. Dev tools -> Network -> Offline
4. Caricare un esperimento (con codice default)
5. Cliccare Compila
6. Deve funzionare da cache — HEX caricato dal service worker

### Test codice modificato offline
1. Modificare una riga di codice
2. Cliccare Compila
3. Deve mostrare messaggio offline appropriato (da G51)
4. NON deve crashare o mostrare spinner infinito

---

## POST-SESSIONE OBBLIGATORIA
1. `npm run build` — deve passare
2. `npx vitest run` — deve passare (test count >= baseline)
3. `/elab-quality-gate` post-session — confronta con baseline
4. Verifica browser: 0 console errors
5. Aggiorna `docs/prompts/G46-G55-sanamento-completo.md` con progresso reale

## Anti-regressione specifica G52
- [ ] Script `npm run precompile` gira senza errori
- [ ] Tutti gli esperimenti con codice Arduino hanno HEX in public/hex/
- [ ] compiler.js usa HEX precompilato quando codice == default
- [ ] compiler.js va al server quando codice e modificato
- [ ] Service worker precache include file HEX
- [ ] Offline + codice default + Compila = funziona da cache
- [ ] Offline + codice modificato + Compila = messaggio offline chiaro
- [ ] Bundle precache non supera 5.5MB (controllare con build output)
- [ ] 0 console errors in production build
- [ ] Build passa, tutti i test passano

## Score atteso dopo G52: **7.5/10**
