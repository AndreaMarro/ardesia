# PIANO SANAMENTO COMPLETO ELAB — G46-G55

## Contesto
Audit brutale G45 (31/03/2026) con 3 agenti indipendenti ha rivelato score composito reale **5.8/10**.
Self-score precedente era 8.6-9.2/10 — inflazione di 3-4 punti.
Obiettivo: portare il prodotto a **7.5+/10** (vendibile con riserva) in 10 sessioni.

## Stato attuale verificato
- 972/972 test PASS, build 35s, bundle 4505KB (33 precache)
- Deploy live: https://www.elabtutor.school
- 62 esperimenti (38+18+6), 62 lesson paths
- Simulatore DC FUNZIONANTE (batteria, LED, resistori, breadboard)
- Pipeline Blockly->C++->HEX->AVR FUNZIONANTE
- UNLIM chat testuale ECCELLENTE (25 parole, socratica)
- Dashboard insegnante: 11 tab, UI polish alta, ZERO dati cross-device

## REGOLE INVARIANTI (da rispettare SEMPRE)
- ZERO DEMO, ZERO MOCK, ZERO DATI FINTI
- 62 lesson paths INTOCCABILI
- Non toccare engine/ — MAI
- `npm run build` + `npx vitest run` dopo OGNI task
- Palette: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D
- Muted text: #737373 (WCAG AA 4.7:1)
- PATH: `export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"`
- Budget: €50/mese (Claude escluso). Niente servizi costosi.

---

# FASE 1 — FIX CRITICI (G46-G47) — Impatto immediato, zero infrastruttura

## G46: Fix P0 — 5 bug che si risolvono in ore, non giorni

### 1. UNLIM auto-explain: troncare a 80 parole (1h)

**Problema**: Il bottone UNLIM nella toolbar (NewElabSimulator.jsx) chiama `handleAskUNLIM` che manda uno screenshot SVG al backend. La risposta torna con 232 parole (target <80). Il backend (nanobot Render) usa un prompt vision che NON rispetta il limite socratico di 60 parole.

**File da modificare**: `src/components/simulator/panels/UNLIMResponsePanel.jsx`

**Fix client-side** (non toccare il backend, tronca lato client):
```javascript
// In UNLIMResponsePanel.jsx, dove viene mostrata la risposta:
// Aggiungere una funzione di troncamento PRIMA del render
function truncateToWords(text, maxWords = 80) {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

// Applicare al testo della risposta prima del render
const displayText = truncateToWords(response.text || response, 80);
```

**ANCHE**: Nel messaggio, il backend dice "Ho analizzato l'immagine che hai inviato" — ma l'utente NON ha inviato un'immagine. Il prompt del nanobot va modificato, oppure il client deve filtrare questa frase:
```javascript
// Rimuovere la frase confusa
const cleanText = displayText.replace(/Ho analizzato l'immagine che hai inviato\.?\s*/i, '');
```

**Verifica**: Cliccare UNLIM toolbar -> contare parole risposta -> deve essere <80.

### 2. Scratch: errori GCC raw mostrati ai bambini (2h)

**Problema**: In modalita Scratch, gli errori di compilazione vengono mostrati RAW (inglese, tecnici). Il traduttore `friendlyError()` esiste in `CodeEditorCM6.jsx` ma NON viene applicato in `ScratchCompileBar.jsx`.

**File sorgente del traduttore**: `src/components/simulator/panels/CodeEditorCM6.jsx`
Cercare la funzione `friendlyError` (14 regex patterns che mappano errori GCC a italiano kid-friendly).

**Fix**:
1. Estrarre `friendlyError()` in un file separato: `src/components/simulator/utils/friendlyError.js`
2. Importare in `ScratchCompileBar.jsx`
3. Applicare agli errori prima del render nel `<pre>` tag (riga ~86 di ScratchCompileBar.jsx)

```javascript
// ScratchCompileBar.jsx
import { friendlyError } from '../utils/friendlyError';

// Dove mostra l'errore (riga ~86):
// PRIMA:  <pre>{compileResult.error}</pre>
// DOPO:   <pre>{friendlyError(compileResult.error)}</pre>
```

**Verifica**: In Scratch, creare un blocco che genera errore (es. pin non valido) -> l'errore deve apparire in italiano kid-friendly.

### 3. GDPR audit card hardcodate "verde" (1h)

**Problema**: `TeacherDashboard.jsx` righe 2817-2961, tab Audit GDPR. Due card mostrano "Attivo" in verde indipendentemente dalla configurazione reale:
- "Audit Logging: Attivo (ogni richiesta API)" — FALSO se il server non e configurato
- "Data Retention: 730 giorni (auto-cleanup)" — vero solo per localStorage, non per server

**File**: `src/components/teacher/TeacherDashboard.jsx`, sezione GDPRAuditTab

**Fix**: Condizionare le card allo stato reale del server:
```javascript
// Audit Logging: verificare se VITE_DATA_SERVER_URL e impostato
const auditActive = !!import.meta.env.VITE_DATA_SERVER_URL;
// Mostrare "Non configurato" in giallo/rosso se il server non e attivo

// Data Retention: specificare che si riferisce solo a localStorage
// Cambiare label: "730 giorni (solo dati locali)" se server non configurato
```

**Verifica**: Senza env var VITE_DATA_SERVER_URL, le card devono mostrare "Non configurato" in giallo, NON "Attivo" in verde.

### 4. Meteo Classe "Cielo sereno" su dati vuoti (30min)

**Problema**: `TeacherDashboard.jsx`, tab MeteoClasse (righe 862-959). Quando non ci sono dati di confusione, mostra "Cielo sereno!" — che e un falso positivo. Dovrebbe dire "Nessun dato disponibile".

**File**: `src/components/teacher/TeacherDashboard.jsx`, riga ~913

**Fix**:
```javascript
// PRIMA: Se concettiConfusione e vuoto, mostra "Cielo sereno!"
// DOPO: Distinguere tra "nessun dato" e "dati presenti ma nessuna confusione"
const hasAnyData = allData.length > 0;
const noConcetti = !classReport.concettiConfusione?.length;

if (!hasAnyData) {
  // Mostrare: "Nessun dato studente disponibile"
} else if (noConcetti) {
  // Mostrare: "Cielo sereno! Nessuna zona di confusione rilevata."
}
```

### 5. compileCache.js dead code — riattivare o eliminare (1h)

**Problema**: `src/components/simulator/utils/compileCache.js` implementa una cache localStorage con SHA-256, 50 entries, 7 giorni TTL. Ma NON viene mai chiamata da `compiler.js` che usa solo un cache in-memory (Map, 20 entries). La cache si perde a ogni reload della pagina.

**File**: `src/services/compiler.js`

**Opzione A — Riattivare** (consigliata):
```javascript
// In compiler.js, importare compileCache
import { getCachedHex, cacheHex } from '../components/simulator/utils/compileCache';

// Prima di chiamare il server remoto, controllare la cache persistente:
const cached = await getCachedHex(codeHash);
if (cached) return { success: true, hex: cached, source: 'localStorage-cache' };

// Dopo compilazione riuscita, salvare nella cache persistente:
await cacheHex(codeHash, result.hex);
```

**Opzione B — Eliminare**:
Se si decide che la cache localStorage non serve, ELIMINARE il file `compileCache.js` e rimuovere ogni riferimento. Il codice morto confonde.

**Verifica**: Compilare un codice -> ricaricare la pagina -> compilare lo STESSO codice -> deve usare la cache (non il server).

---

## G47: Fix P1 — UX critica

### 6. Touch target experiment selector: 35px -> 44px (30min)

**Problema**: Il bottone che mostra il nome dell'esperimento nella toolbar ha altezza 35px, sotto il minimo di 44px per touch/LIM.

**File**: `src/components/simulator/NewElabSimulator.jsx`, il bottone con testo "Cap. 6 Esp. 1 - ..."

**Fix**: Aggiungere `minHeight: 44` al suo style inline.

### 7. UNLIM "Chiedi ancora" non chiede — re-invia stessa query (1h)

**Problema**: Il bottone "Chiedi ancora" nel pannello risposta UNLIM (`UNLIMResponsePanel`) ri-esegue la stessa richiesta invece di aprire un campo di input per una nuova domanda.

**Fix**: "Chiedi ancora" dovrebbe chiudere il pannello risposta e aprire l'input bar (attivare `inputBarVisible`). Serve un callback dal pannello risposta all'UnlimWrapper.

### 8. Precache bundle 4505KB -> sotto 4500KB (1h)

**Problema**: Il precache e 4505KB, 5KB sopra il limite WARN di 4500KB.

**Fix opzioni**:
- Escludere un asset non critico dal precache in `vite.config.js` (workbox config)
- Oppure alzare il limite WARN a 4600KB (se giustificato da nuove feature)
- Verificare se ci sono file duplicati nel precache (es. source maps, font inutilizzati)

---

# FASE 2 — BACKEND LEGGERO (G48-G50) — Il game changer

## Obiettivo: Sincronizzazione cross-device per dashboard insegnante

### Perche Supabase (e non Firebase)
- Free tier: 500MB DB, 1GB storage, 50K auth users, 2M edge function calls
- Budget: €0/mese (free tier basta per 100-200 studenti)
- PostgreSQL = query SQL reali per analytics
- Row Level Security = GDPR-friendly per dati minori
- Hosting EU disponibile (Frankfurt)
- SDK JS leggero (~15KB gzip)

### G48: Setup Supabase + Auth

**Obiettivo**: Studente e insegnante si autenticano, i dati vanno nel cloud.

1. Creare progetto Supabase (EU region)
2. Schema DB:
```sql
-- Utenti (gestiti da Supabase Auth)
-- Classi
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES auth.users(id),
  school TEXT,
  city TEXT,
  games_enabled JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Studenti in classe
CREATE TABLE class_students (
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (class_id, student_id)
);

-- Sessioni studente
CREATE TABLE student_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id),
  experiment_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  completed BOOLEAN DEFAULT false,
  score JSONB,
  activity JSONB -- array di azioni
);

-- Mood reports
CREATE TABLE mood_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id),
  mood TEXT NOT NULL, -- 'felice', 'confuso', 'frustrato', 'curioso', 'neutro'
  context TEXT, -- esperimento o momento
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nudge (cross-device!)
CREATE TABLE nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id),
  student_id UUID REFERENCES auth.users(id),
  class_id UUID REFERENCES classes(id),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;

-- Insegnante vede solo le sue classi
CREATE POLICY "teacher_own_classes" ON classes
  FOR ALL USING (teacher_id = auth.uid());

-- Studente vede solo le sue sessioni
CREATE POLICY "student_own_sessions" ON student_sessions
  FOR ALL USING (student_id = auth.uid());

-- Insegnante vede sessioni dei suoi studenti
CREATE POLICY "teacher_student_sessions" ON student_sessions
  FOR SELECT USING (
    student_id IN (
      SELECT cs.student_id FROM class_students cs
      JOIN classes c ON cs.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Studente vede solo i suoi nudge
CREATE POLICY "student_own_nudges" ON nudges
  FOR SELECT USING (student_id = auth.uid());

-- Insegnante crea nudge per i suoi studenti
CREATE POLICY "teacher_send_nudges" ON nudges
  FOR INSERT WITH CHECK (teacher_id = auth.uid());
```

3. Creare `src/services/supabaseClient.js`:
```javascript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
export default supabase;
```

4. Aggiungere env vars a Vercel:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

5. Modificare `AuthContext.jsx` per usare Supabase Auth invece del mock user dev.

**Verifica**: Login studente -> dato va in Supabase -> login insegnante su altro device -> vede il dato.

### G49: Sync studentService -> Supabase

**Obiettivo**: Ogni azione studente va nel DB cloud, con fallback localStorage.

1. Creare `src/services/supabaseSync.js` — servizio di sincronizzazione:
```javascript
// Strategia: write-through (scrivi locale + remoto in parallelo)
// Se remoto fallisce, scrivi solo locale e metti in coda retry

export async function syncSession(sessionData) {
  // 1. Salva in localStorage (immediato, offline-safe)
  saveToLocalStorage(sessionData);

  // 2. Tenta sync a Supabase (async, non bloccante)
  try {
    await supabase.from('student_sessions').insert(sessionData);
  } catch (err) {
    // Metti in coda per retry
    addToSyncQueue('student_sessions', sessionData);
  }
}

// Sync queue: array in localStorage, processata a ogni app start
export async function processSyncQueue() {
  const queue = JSON.parse(localStorage.getItem('elab_sync_queue') || '[]');
  for (const item of queue) {
    try {
      await supabase.from(item.table).insert(item.data);
      // Rimuovi dalla coda
    } catch {
      break; // Server ancora giu, riprova dopo
    }
  }
}
```

2. Modificare `studentService.js`:
   - `logSession()` -> chiama `syncSession()` invece di solo localStorage
   - `logMood()` -> sync a `mood_reports` table
   - `logConfusione()` -> sync a `student_sessions.activity`
   - `logGameResult()` -> sync a `student_sessions` con type='game'

3. Modificare `nudgeService.js`:
   - `sendNudge()` -> INSERT in `nudges` table (cross-device!)
   - `startNudgeListener()` -> Supabase Realtime subscription su `nudges` table
   ```javascript
   supabase.channel('nudges')
     .on('postgres_changes', {
       event: 'INSERT',
       schema: 'public',
       table: 'nudges',
       filter: `student_id=eq.${currentUserId}`
     }, (payload) => {
       showNudgeOverlay(payload.new.message);
     })
     .subscribe();
   ```

**Verifica**: Studente completa esperimento su Chromebook A -> insegnante vede il dato sulla dashboard su PC B.

### G50: Dashboard legge da Supabase

**Obiettivo**: TeacherDashboard.jsx legge dati reali dal cloud.

1. Creare `src/services/teacherDataService.js`:
```javascript
export async function fetchClassStudents(classId) {
  const { data } = await supabase
    .from('class_students')
    .select('student_id, auth.users!inner(email, raw_user_meta_data)')
    .eq('class_id', classId);
  return data;
}

export async function fetchClassSessions(classId, days = 7) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('student_sessions')
    .select('*')
    .in('student_id', await getClassStudentIds(classId))
    .gte('started_at', since);
  return data;
}

export async function fetchClassMoods(classId) {
  // ...similar pattern
}
```

2. Modificare `TeacherDashboard.jsx`:
   - `useEffect` iniziale: chiama `fetchClassStudents` + `fetchClassSessions` + `fetchClassMoods`
   - Mantieni fallback a localStorage se Supabase non risponde
   - I 11 tab ricevono dati reali dal cloud

3. Fix nudge delivery: `NudgeTab` usa `supabase.from('nudges').insert()` invece di localStorage.

**Verifica**:
- Creare classe -> aggiungere 3 studenti -> studenti fanno 2 esperimenti ciascuno -> dashboard mostra 3 studenti con dati reali
- Insegnante manda nudge -> studente su altro device lo riceve in tempo reale

---

# FASE 3 — RESILIENZA E OFFLINE (G51-G52)

### G51: Compiler server dedicato + offline graceful degradation

1. **Compile server su VPS** (gia disponibile a 72.60.129.50):
   - Installare arduino-cli con le librerie necessarie (Servo.h, LiquidCrystal.h)
   - Endpoint `/compile` con timeout 30s
   - Rate limiting: 10 richieste/min per IP
   - Costo: €0 (VPS gia pagato per Ollama)

2. **Riattivare compileCache.js** (se non fatto in G46):
   - Compilazione cached sopravvive al reload pagina
   - 50 entries, 7 giorni TTL, SHA-256 hash

3. **Offline graceful degradation**:
   - Mostrare banner CHIARO quando offline: "Sei offline. Puoi esplorare i circuiti ma non compilare codice."
   - Disabilitare bottone "Compila" con tooltip "Richiede connessione internet"
   - UNLIM offline: mostrare messaggio "UNLIM non e disponibile offline. Consulta la guida dell'esperimento!"
   - Giochi: CircuitReview nascosto se offline, gli altri 3 disponibili

4. **Browser compatibility warning**:
   - Se `window.SpeechRecognition` non esiste, mostrare avviso UNA VOLTA:
   "Il controllo vocale funziona solo su Chrome. Per la migliore esperienza, usa Google Chrome."
   - Salvare il dismissal in localStorage per non ripetere

### G52: Pre-compilare TUTTI i 62 esperimenti

**Problema attuale**: Solo 12 esperimenti hanno HEX precompilato. I restanti 50 richiedono il server.

**Fix**: Script Node.js che:
1. Legge tutti i 62 esperimenti da `experiments-vol*.js`
2. Per ognuno, invia il codice default al compile server
3. Salva il HEX risultante in `public/hex/{experiment-id}.hex`
4. Aggiorna il precache del service worker

```bash
# Script: scripts/precompile-all.sh
node scripts/precompile-all-experiments.js
# Output: 62 file .hex in public/hex/
```

**Risultato**: TUTTI i 62 esperimenti funzionano offline (codice default). Solo il codice MODIFICATO dallo studente richiede il server.

---

# FASE 4 — GIOCHI E SCRATCH (G53-G54)

### G53: Giochi — da testo a visuale

**Problema**: Tutti i 4 giochi sono text-based. Nessuna visualizzazione circuiti.

**Fix minimo** (non riscrivere tutto, ma aggiungere valore):

1. **Circuit Detective**: Aggiungere miniatura SVG del circuito rotto
   - I dati in `broken-circuits.js` hanno gia `components` e `connections`
   - Creare `CircuitMiniature.jsx` (~100 righe) che renderizza un mini-SVG 200x150 dei componenti
   - Mostrare accanto alla descrizione testuale

2. **Reverse Engineering**: Il mini-SVG decorativo c'e gia — renderlo FUNZIONALE
   - I test point cliccabili dovrebbero mostrare il valore reale (tensione/corrente)
   - Usare CircuitSolver per calcolare i valori reali dei test point

3. **CircuitReview offline fallback**:
   - Creare 10 circuiti pre-generati in `src/data/review-circuits.js`
   - Quando AI e offline, pescare da questi
   - Lo studente non si accorge della differenza

4. **"Prova nel simulatore" NON naviga via**:
   - Aprire il simulatore in un panel laterale o in overlay
   - Lo studente vede circuito E gioco contemporaneamente

### G54: Scratch UX improvements

1. **Friendly errors in Scratch mode** (se non fatto in G46):
   - Estrarre `friendlyError()` -> `utils/friendlyError.js`
   - Importare in ScratchCompileBar.jsx

2. **Scratch/Text mode switch warning**:
   - Quando lo studente passa da Scratch a Arduino C++, mostrare:
   "Attenzione: il codice Arduino e diverso dai blocchi Scratch. Le modifiche in un modo non si riflettono nell'altro."

3. **controls_for con step negativo**: Aggiungere guard in `scratchGenerator.js`:
   ```javascript
   // In generators['controls_for']:
   // Aggiungere: if (BY < 0) { comparison = '>=' } else { comparison = '<=' }
   ```

4. **Undo/Redo in Scratch**: Blockly ha undo/redo built-in. Esporre i bottoni nella ScratchCompileBar.

---

# FASE 5 — POLISH E HARDENING (G55)

### G55: Sessione finale pre-release

1. **Audit GDPR reale**:
   - Le card nel tab GDPR devono riflettere lo stato REALE
   - Se Supabase e configurato: mostrare "Server EU (Frankfurt), criptazione in transito"
   - Se non configurato: mostrare "Solo dati locali — configurare server per conformita GDPR"

2. **Documentation tab**: Trasformare i 3 paragrafi in contenuto UTILE:
   - Link ai 3 volumi PDF (se disponibili)
   - Guida rapida per insegnanti (come creare classe, come mandare nudge)
   - FAQ (5-10 domande comuni)

3. **Performance audit finale**:
   - Lighthouse score su URL live
   - Core Web Vitals (LCP, FID, CLS)
   - Bundle analysis (visualizzare chunk tree)

4. **Full regression test**:
   - Navigare TUTTI i 62 esperimenti (script automatico)
   - Testare tutti i 4 giochi
   - Testare dashboard con Supabase dati reali
   - Testare nudge cross-device
   - Test LIM 1024x768
   - Test offline (disattivare rete, verificare graceful degradation)

5. **Quality gate finale**: Score target >= 7.5/10

---

# METRICHE DI SUCCESSO PER FASE

| Fase | Score atteso | Metrica chiave |
|------|-------------|----------------|
| Dopo Fase 1 (G46-G47) | 6.3/10 | 0 bug P0, UNLIM <80 parole, errori friendly |
| Dopo Fase 2 (G48-G50) | 7.2/10 | Dashboard con dati reali cross-device |
| Dopo Fase 3 (G51-G52) | 7.5/10 | 62 HEX precompilati, offline graceful |
| Dopo Fase 4 (G53-G54) | 7.8/10 | Giochi con mini-SVG, Scratch polished |
| Dopo Fase 5 (G55) | 8.0/10 | GDPR reale, docs utili, regression pass |

---

# ORDINE DI ESECUZIONE CONSIGLIATO

```
G46: Fix P0 (punti 1-5)           [4-5 ore]  -> Score 6.0
G47: Fix P1 (punti 6-8)           [3 ore]    -> Score 6.3
G48: Supabase setup + auth         [4-5 ore]  -> Score 6.5
G49: Sync studentService           [4-5 ore]  -> Score 6.8
G50: Dashboard reads Supabase      [4-5 ore]  -> Score 7.2
G51: Compiler + offline            [4-5 ore]  -> Score 7.4
G52: Pre-compile 62 HEX            [2-3 ore]  -> Score 7.5
G53: Giochi da testo a visuale     [4-5 ore]  -> Score 7.7
G54: Scratch UX                    [3-4 ore]  -> Score 7.8
G55: Polish + hardening + test     [4-5 ore]  -> Score 8.0
```

Totale stimato: ~40-45 ore di lavoro concentrato.

---

# NOTE PER OGNI SESSIONE

Ogni sessione DEVE iniziare con:
1. `/elab-quality-gate` pre-session
2. `git status` per verificare stato pulito
3. Lettura di questo documento per sapere cosa fare

Ogni sessione DEVE finire con:
1. `npm run build` + `npx vitest run`
2. `/elab-quality-gate` post-session
3. Aggiornare questo documento con il progresso reale
4. Commit con messaggio descrittivo

**MASSIMA ONESTA**: Se una feature non funziona, scriverlo. Non "quasi pronto" o "90% fatto". O funziona o non funziona.
