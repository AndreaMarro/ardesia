# G46 — FIX P0: UNLIM 232 parole, Scratch errori raw, GDPR card false, Meteo falso positivo, compileCache dead

## Contesto
Audit brutale G45 ha trovato score reale 5.8/10. Questa sessione fixa i 5 bug P0 piu gravi.
Piano completo: `docs/prompts/G46-G55-sanamento-completo.md`
Audit dettagliato: memoria `G45-audit-brutale.md`

## STATO PRE-SESSIONE (verificato 31/03/2026)
- 972/972 test PASS | Build 35s | Bundle 4505KB | 0 console errors
- Deploy: https://www.elabtutor.school
- 62 esperimenti (38+18+6), 62 lesson paths

## REGOLE INVARIANTI
- ZERO DEMO, ZERO MOCK, ZERO DATI FINTI
- 62 lesson paths INTOCCABILI
- Non toccare engine/ — MAI
- `npm run build` + `npx vitest run` dopo OGNI singolo fix
- PATH: `export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"`

## PRE-SESSIONE OBBLIGATORIA
1. Esegui `/elab-quality-gate` pre-session
2. Salva baseline: test count, build time, bundle size, console errors

---

## FIX 1 — UNLIM auto-explain: 232 parole -> <80 (P0, 1.5h)

### Problema
Il bottone UNLIM nella toolbar (`NewElabSimulator.jsx`) chiama `handleAskUNLIM` che manda screenshot SVG al nanobot. La risposta torna con 232 parole. Target: <80. Inoltre dice "Ho analizzato l'immagine che hai inviato" — hallucination perche l'utente non ha inviato nulla.

### File da leggere PRIMA di modificare
- `src/components/simulator/panels/UNLIMResponsePanel.jsx` — pannello che mostra la risposta
- `src/components/simulator/NewElabSimulator.jsx` — cerca `handleAskUNLIM` per capire il flusso
- `src/services/api.js` — cerca `sendChat` o `askUNLIM` per il prompt inviato al backend

### Implementazione
1. Crea `src/utils/truncateResponse.js`:
```javascript
/**
 * Tronca un testo a maxWords parole, aggiungendo "..." se troncato.
 * Rimuove anche frasi confuse sull'analisi immagine.
 */
export function cleanAndTruncate(text, maxWords = 80) {
  if (!text) return '';
  // Rimuovi la frase hallucination
  let cleaned = text.replace(/Ho analizzato l['']immagine che hai inviato\.?\s*/gi, '');
  // Tronca a maxWords
  const words = cleaned.trim().split(/\s+/);
  if (words.length <= maxWords) return cleaned.trim();
  return words.slice(0, maxWords).join(' ') + '...';
}
```

2. In `UNLIMResponsePanel.jsx`, importa e applica `cleanAndTruncate` al testo della risposta PRIMA del render. Cerca dove il testo viene visualizzato (probabilmente in un `<p>` o `<div>` con il contenuto della risposta) e wrappa con `cleanAndTruncate(responseText)`.

3. Scrivi un test in `tests/unit/truncateResponse.test.js`:
```javascript
import { cleanAndTruncate } from '../../src/utils/truncateResponse';
import { describe, it, expect } from 'vitest';

describe('cleanAndTruncate', () => {
  it('tronca a 80 parole', () => {
    const long = Array(100).fill('parola').join(' ');
    const result = cleanAndTruncate(long, 80);
    expect(result.split(/\s+/).length).toBeLessThanOrEqual(81); // 80 + "..."
    expect(result.endsWith('...')).toBe(true);
  });

  it('rimuove hallucination immagine', () => {
    const text = "Ciao! Ho analizzato l'immagine che hai inviato. Il circuito ha un LED.";
    expect(cleanAndTruncate(text)).not.toContain('immagine');
  });

  it('non tronca testi corti', () => {
    const short = 'Il LED si accende solo in un verso.';
    expect(cleanAndTruncate(short)).toBe(short);
  });

  it('gestisce null/undefined', () => {
    expect(cleanAndTruncate(null)).toBe('');
    expect(cleanAndTruncate(undefined)).toBe('');
  });
});
```

### Verifica browser
- Avvia dev server, vai a `#prova`
- Clicca bottone UNLIM nella toolbar (NON la mascotte)
- Aspetta risposta
- Conta parole: deve essere <80
- Non deve contenere "immagine che hai inviato"

### Anti-regressione
- Test unitario `truncateResponse.test.js` protegge da regressioni
- Quality gate check #7 (UNLIM word count) deve passare

---

## FIX 2 — Scratch: errori GCC raw ai bambini (P0, 2h)

### Problema
`ScratchCompileBar.jsx` riga ~86 mostra errori compilazione in un `<pre>` tag SENZA passarli per il traduttore `friendlyError()`. Il traduttore esiste in `CodeEditorCM6.jsx` (14 regex patterns GCC->italiano kid-friendly) ma non e importato in Scratch.

### File da leggere PRIMA
- `src/components/simulator/panels/CodeEditorCM6.jsx` — cerca `friendlyError` function
- `src/components/simulator/panels/ScratchCompileBar.jsx` — cerca il `<pre>` con l'errore

### Implementazione
1. Estrai `friendlyError()` da `CodeEditorCM6.jsx` in `src/components/simulator/utils/friendlyError.js`:
   - Copia la funzione e le sue regex
   - Export come named export
   - In CodeEditorCM6.jsx, sostituisci la funzione locale con import dal nuovo file

2. In `ScratchCompileBar.jsx`:
   - Importa `friendlyError` dal nuovo file
   - Trova dove mostra l'errore (`<pre>` tag, probabilmente riga ~86)
   - Applica: `friendlyError(compileResult.error)` invece di `compileResult.error`

3. Scrivi test `tests/unit/friendlyError.test.js`:
```javascript
import { friendlyError } from '../../src/components/simulator/utils/friendlyError';
import { describe, it, expect } from 'vitest';

describe('friendlyError', () => {
  it('traduce undefined variable', () => {
    const gcc = "error: 'ledPin' was not declared in this scope";
    const friendly = friendlyError(gcc);
    expect(friendly).toContain('ledPin');
    expect(friendly).not.toContain('declared in this scope');
  });

  it('traduce missing semicolon', () => {
    const gcc = "error: expected ';' before '}' token";
    const friendly = friendlyError(gcc);
    expect(friendly.toLowerCase()).toContain('punto e virgola');
  });

  it('restituisce originale se non riconosciuto', () => {
    const unknown = 'some unknown error';
    expect(friendlyError(unknown)).toBe(unknown);
  });
});
```

### Verifica browser
- Vai in Scratch mode (esperimento Vol3)
- Crea un blocco con pin invalido o codice errato
- Clicca Compila
- L'errore deve apparire in ITALIANO kid-friendly, non in inglese tecnico GCC

### Anti-regressione
- Test `friendlyError.test.js` protegge le traduzioni
- Se qualcuno modifica CodeEditorCM6, il file condiviso mantiene consistenza

---

## FIX 3 — GDPR audit card hardcodate verde (P0, 1h)

### Problema
`TeacherDashboard.jsx`, tab Audit GDPR (righe ~2817-2961). Due card mostrano stato "Attivo" in verde SEMPRE, anche quando il server non e configurato:
- "Audit Logging: Attivo (ogni richiesta API)" — FALSO senza server
- "Data Retention: 730 giorni (auto-cleanup)" — vero solo per localStorage

### File da modificare
- `src/components/teacher/TeacherDashboard.jsx` — sezione GDPRAuditTab

### Implementazione
Cerca le card nella sezione GDPR audit (dopo riga ~2817). Dovrebbero avere stili con sfondo verde.

```javascript
// Determina lo stato reale
const hasDataServer = !!import.meta.env.VITE_DATA_SERVER_URL;
const hasAuthServer = !!import.meta.env.VITE_AUTH_URL;

// Card Audit Logging:
// SE hasDataServer -> verde "Attivo (ogni richiesta API registrata)"
// ALTRIMENTI -> giallo "Non configurato — server dati non collegato"

// Card Data Retention:
// SE hasDataServer -> verde "730 giorni (server + locale)"
// ALTRIMENTI -> giallo "Solo dati locali — 730 giorni auto-cleanup su questo browser"
```

Usa colori condizionali: verde `#4A7A25` per OK, giallo `#E8941C` per warning, rosso `#E54B3D` per errore.

### Verifica
- Senza env var VITE_DATA_SERVER_URL: le card devono essere GIALLE, non verdi
- Con env var: le card devono essere verdi (ma solo SE il server risponde)

### Anti-regressione
- Nessun test unitario necessario (e logica di rendering)
- Quality gate check manuale: aprire dashboard, tab GDPR, verificare colori card

---

## FIX 4 — Meteo Classe "Cielo sereno" su dati vuoti (P0, 30min)

### Problema
`TeacherDashboard.jsx`, tab MeteoClasse (righe ~862-959). Quando `classReport.concettiConfusione` e vuoto, mostra "Cielo sereno!" — falso positivo. Dovrebbe dire "Nessun dato".

### Implementazione
Cerca la condizione che mostra "Cielo sereno" (riga ~913):

```javascript
// PRIMA (pseudocodice):
// if (!concettiConfusione.length) return <p>Cielo sereno!</p>

// DOPO:
const hasStudentData = allData && allData.length > 0;
const noConfusion = !classReport?.concettiConfusione?.length;

if (!hasStudentData) {
  // Nessun dato studente — NON dire "Cielo sereno"
  return <p style={{ color: '#737373' }}>Nessun dato studente disponibile. I dati appariranno quando gli studenti useranno il tutor.</p>;
}
if (noConfusion) {
  // Dati presenti ma nessuna confusione — ORA si puo dire sereno
  return <p>☀️ Cielo sereno! Nessuna zona di confusione rilevata.</p>;
}
```

### Verifica
- Dashboard senza studenti: deve mostrare "Nessun dato studente disponibile"
- Dashboard con studenti ma senza confusione: deve mostrare "Cielo sereno"

---

## FIX 5 — compileCache.js dead code: riattivare (P0, 1.5h)

### Problema
`src/components/simulator/utils/compileCache.js` ha una cache localStorage (SHA-256, 50 entries, 7d TTL). Ma `src/services/compiler.js` usa solo un cache in-memory (Map, 20 entries) che si perde al reload.

### File da leggere PRIMA
- `src/services/compiler.js` — cerca `sessionCache` e il flow di compilazione
- `src/components/simulator/utils/compileCache.js` — l'API disponibile

### Implementazione
In `compiler.js`:

1. Importa la cache persistente:
```javascript
import { getCachedHex, cacheHex } from '../components/simulator/utils/compileCache';
```

2. Nel flow di compilazione, DOPO il check del session cache in-memory e PRIMA della chiamata al server remoto, aggiungi:
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

3. DOPO una compilazione remota riuscita, salva nella cache persistente:
```javascript
// Save to persistent cache
try { await cacheHex(codeHash, result.hex); } catch { /* ignore write errors */ }
```

### Verifica
- Compila un codice personalizzato -> vedi che va al server
- Ricarica pagina (F5)
- Compila lo STESSO codice -> deve usare la cache (controlla network tab: nessuna richiesta al server)

### Anti-regressione
- Scrivi test: `tests/unit/compileCache.test.js` che verifica get/set/TTL/eviction

---

## POST-SESSIONE OBBLIGATORIA
1. `npm run build` — deve passare
2. `npx vitest run` — deve passare (972+ test, +3-4 nuovi)
3. `/elab-quality-gate` post-session — confronta con baseline
4. Verifica browser: 0 console errors
5. Aggiorna `docs/prompts/G46-G55-sanamento-completo.md` con progresso reale
6. Score atteso dopo G46: **6.0/10**
