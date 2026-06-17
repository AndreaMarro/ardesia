# G51 — COMPILER SERVER DEDICATO + OFFLINE GRACEFUL DEGRADATION

## Contesto
Fase 3 del piano sanamento: resilienza e offline. Il compilatore remoto attuale (n8n) ha cold-start lento e nessun fallback offline. Il VPS 72.60.129.50 e gia disponibile (Ollama per Brain).
Piano completo: `docs/prompts/G46-G55-sanamento-completo.md`

## STATO PRE-SESSIONE (da verificare)
- Test PASS count: ___  | Build time: ___s | Bundle: ___KB | Console errors: ___
- Deploy: https://www.elabtutor.school
- 62 esperimenti (38+18+6), 62 lesson paths

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

---

## TASK 1 — Compiler server dedicato su VPS (2h)

### Problema
Il compilatore remoto attuale passa per n8n su Hostinger con cold-start lento e instabilita. Il VPS 72.60.129.50 e gia pagato (Brain Ollama). Installare arduino-cli direttamente.

### Implementazione sul VPS (SSH)

1. Installare arduino-cli con AVR core e librerie:
```bash
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
arduino-cli core install arduino:avr
arduino-cli lib install Servo LiquidCrystal Wire
```

2. Creare un server Express/Fastify minimale su porta 3001:
```javascript
// /opt/elab-compiler/server.js
import Fastify from 'fastify';
import { execFile } from 'child_process';
import { writeFile, readFile, mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import rateLimit from '@fastify/rate-limit';

const app = Fastify({ logger: true });

await app.register(rateLimit, {
  max: 10,        // 10 richieste
  timeWindow: 60000 // per minuto per IP
});

app.post('/compile', async (request, reply) => {
  const { code } = request.body;
  if (!code || typeof code !== 'string') {
    return reply.code(400).send({ error: 'Missing code parameter' });
  }

  const tmpDir = await mkdtemp(join(tmpdir(), 'elab-'));
  const sketchDir = join(tmpDir, 'sketch');
  const sketchFile = join(sketchDir, 'sketch.ino');

  try {
    await mkdir(sketchDir, { recursive: true });
    await writeFile(sketchFile, code);

    const hex = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Compilation timeout')), 30000);
      execFile('arduino-cli', [
        'compile',
        '--fqbn', 'arduino:avr:uno',
        '--output-dir', tmpDir,
        sketchDir
      ], (error, stdout, stderr) => {
        clearTimeout(timeout);
        if (error) return reject(new Error(stderr || error.message));
        readFile(join(tmpDir, 'sketch.ino.hex'), 'utf8')
          .then(resolve)
          .catch(reject);
      });
    });

    return { success: true, hex };
  } catch (err) {
    return reply.code(422).send({ success: false, error: err.message });
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

app.listen({ port: 3001, host: '0.0.0.0' });
```

3. Systemd service per persistenza:
```ini
# /etc/systemd/system/elab-compiler.service
[Unit]
Description=ELAB Compiler Server
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/elab-compiler/server.js
Restart=always
User=elab
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

4. Impostare VITE_COMPILE_URL su Vercel:
```
VITE_COMPILE_URL=http://72.60.129.50:3001/compile
```

### Verifica
- `curl -X POST http://72.60.129.50:3001/compile -H "Content-Type: application/json" -d '{"code":"void setup(){} void loop(){}"}'`
- Deve restituire `{ "success": true, "hex": "..." }`
- Rate limiting: 11a richiesta in 1 minuto deve restituire 429

---

## TASK 2 — Riattivare compileCache.js persistente (1h)

### Problema
Se non gia fatto in G46: `compileCache.js` ha una cache localStorage (SHA-256, 50 entries, 7d TTL) ma `compiler.js` usa solo un cache in-memory che si perde al reload.

### File da leggere PRIMA
- `src/services/compiler.js` — cerca `sessionCache` e il flow di compilazione
- `src/components/simulator/utils/compileCache.js` — l'API disponibile

### Implementazione
In `compiler.js`:

1. Importa la cache persistente:
```javascript
import { getCachedHex, cacheHex } from '../components/simulator/utils/compileCache';
```

2. Nel flow di compilazione, DOPO il check del session cache in-memory e PRIMA della chiamata al server remoto:
```javascript
// Check persistent cache (survives page reload)
try {
  const persistentCached = await getCachedHex(codeHash);
  if (persistentCached) {
    sessionCache.set(codeHash, persistentCached); // promote to session cache
    return { success: true, hex: persistentCached, source: 'persistent-cache' };
  }
} catch { /* localStorage read error, continue to server */ }
```

3. DOPO una compilazione remota riuscita:
```javascript
// Save to persistent cache
try { await cacheHex(codeHash, result.hex); } catch { /* ignore write errors */ }
```

### Verifica
- Compila codice personalizzato -> va al server (network tab)
- Ricarica pagina (F5)
- Compila lo STESSO codice -> deve usare cache (nessuna richiesta network)

---

## TASK 3 — Offline graceful degradation (1.5h)

### Problema
Quando lo studente e offline, il bottone Compila fallisce con errore criptico, UNLIM mostra spinner infinito, e CircuitReview non carica. Nessun feedback chiaro.

### File da creare/modificare

1. **Creare `src/hooks/useOnlineStatus.js`**:
```javascript
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

2. **Banner offline in `NewElabSimulator.jsx`**:
   - Importa `useOnlineStatus`
   - Quando `!isOnline`, mostra banner fisso in alto:
   ```jsx
   {!isOnline && (
     <div role="alert" style={{
       background: '#E8941C', color: '#1a1a1a', padding: '8px 16px',
       textAlign: 'center', fontWeight: 600, fontSize: 14
     }}>
       Sei offline. Puoi esplorare i circuiti ma non compilare codice.
     </div>
   )}
   ```

3. **Disabilitare "Compila" quando offline**:
   - File: `src/components/simulator/panels/CodeEditorCM6.jsx` e `ScratchCompileBar.jsx`
   - Passare `isOnline` come prop o usare il hook direttamente
   - Bottone Compila: `disabled={!isOnline}` con `title="Richiede connessione internet"`
   - ECCEZIONE: se il codice e il default dell'esperimento E esiste HEX precompilato, lasciare abilitato

4. **UNLIM offline message**:
   - File: `src/components/unlim/UnlimWrapper.jsx`
   - Prima di inviare richiesta, controllare `navigator.onLine`
   - Se offline: mostrare nel pannello risposta "UNLIM non e disponibile offline. Consulta la guida dell'esperimento!" invece di spinner

5. **CircuitReview nascosto se offline**:
   - File: dove viene renderizzata la lista giochi (probabilmente in un componente giochi)
   - Se `!isOnline`, filtrare CircuitReview dalla lista (richiede AI)
   - Gli altri 3 giochi (Detective, Prevedi, Misterioso) restano disponibili

6. **In `src/services/api.js`**: check online PRIMA di fetch:
```javascript
// All'inizio di ogni funzione che fa fetch
if (!navigator.onLine) {
  throw new Error('OFFLINE');
}
```

### Verifica browser
- Dev tools -> Network -> Offline
- Banner giallo deve apparire
- Bottone Compila deve essere grigio con tooltip
- UNLIM deve mostrare messaggio offline, non spinner
- Giochi: solo 3 visibili, CircuitReview nascosto
- Riattivare rete -> tutto torna normale senza reload

---

## TASK 4 — Browser compatibility warning per voice control (30min)

### Problema
Il controllo vocale (STT) funziona solo su Chrome/Edge (WebkitSpeechRecognition). Su Firefox/Safari, fallisce silenziosamente.

### File da modificare
- `src/components/unlim/UnlimWrapper.jsx` — dove viene inizializzato STT

### Implementazione
```javascript
// Dove viene inizializzato SpeechRecognition:
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition && !localStorage.getItem('elab_stt_warning_dismissed')) {
  // Mostrare toast ONE-TIME dismissable
  // "Il controllo vocale funziona meglio su Chrome. Per la migliore esperienza, usa Google Chrome."
  // Al dismiss: localStorage.setItem('elab_stt_warning_dismissed', 'true')
}
```

- Toast deve avere bottone X per chiudere
- `role="alert"` per screen reader
- Salvare dismissal per non ripetere MAI

### Verifica
- Aprire su Firefox -> toast appare UNA VOLTA
- Chiudere toast -> ricaricare -> NON riappare
- Su Chrome -> toast NON appare

### Anti-regressione
- Nessun test unitario necessario (e logica UI browser-specific)
- Verificare manualmente su Firefox

---

## POST-SESSIONE OBBLIGATORIA
1. `npm run build` — deve passare
2. `npx vitest run` — deve passare (test count >= baseline)
3. `/elab-quality-gate` post-session — confronta con baseline
4. Verifica browser: 0 console errors
5. Aggiorna `docs/prompts/G46-G55-sanamento-completo.md` con progresso reale

## Anti-regressione specifica G51
- [ ] Compiler server risponde su :3001 (curl test)
- [ ] compileCache persistente: compila -> reload -> compila stesso codice -> no network request
- [ ] Banner offline appare quando si disattiva rete
- [ ] Bottone Compila disabilitato offline
- [ ] UNLIM mostra messaggio offline, non spinner
- [ ] CircuitReview nascosto quando offline
- [ ] Toast STT appare su Firefox, non su Chrome
- [ ] Toast STT non riappare dopo dismiss
- [ ] 0 console errors in production build
- [ ] Build passa, tutti i test passano

## Score atteso dopo G51: **7.4/10**
