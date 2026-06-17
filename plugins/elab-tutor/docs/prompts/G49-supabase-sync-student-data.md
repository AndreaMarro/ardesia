# G49 — SYNC STUDENT DATA TO SUPABASE

## Contesto
Fase 2 del piano sanamento (G46-G55). G48 ha creato Supabase + auth. Questa sessione collega i dati studente al cloud.
Piano completo: `docs/prompts/G46-G55-sanamento-completo.md`
Sessione precedente (G48): Supabase setup + auth completati, score 6.5/10.

## STATO PRE-SESSIONE (da verificare)
- 972+ test PASS | Build <40s | Bundle ~4600KB | 0 console errors
- Supabase: progetto attivo, schema creato, RLS abilitato
- Auth: login/registrazione Supabase funzionante con fallback localStorage
- Deploy: https://www.elabtutor.school

## REGOLE INVARIANTI
- ZERO DEMO, ZERO MOCK, ZERO DATI FINTI
- 62 lesson paths INTOCCABILI
- Non toccare engine/ — MAI
- `npm run build` + `npx vitest run` dopo OGNI singolo task
- PATH: `export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"`
- Palette: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D
- Muted text: #737373 (WCAG AA 4.7:1)
- CRITICO: localStorage deve SEMPRE continuare a funzionare come fallback

## PRE-SESSIONE OBBLIGATORIA
1. Esegui `/elab-quality-gate` pre-session
2. Salva baseline: test count, build time, bundle size, console errors
3. Verifica che G48 sia completato: login Supabase funziona, schema DB presente

---

## TASK 1 — Creare supabaseSync.js (1.5h)

### File da creare: `src/services/supabaseSync.js`

Strategia: **write-through** (scrivi localStorage + Supabase in parallelo). Se Supabase fallisce, accoda per retry.

```javascript
import { getSupabaseClient } from './supabaseClient';

const SYNC_QUEUE_KEY = 'elab_sync_queue';
const MAX_QUEUE_SIZE = 200; // Previeni crescita infinita

/**
 * Sync generico: scrivi in localStorage E Supabase.
 * Se Supabase fallisce, accoda per retry.
 * @param {string} table - nome tabella Supabase
 * @param {object} data - dati da inserire
 * @param {string} localKey - chiave localStorage per fallback
 * @param {Function} localSaveFn - funzione che salva in localStorage (riceve data)
 */
export async function syncInsert(table, data, localKey, localSaveFn) {
  // 1. SEMPRE salva in localStorage (immediato, offline-safe)
  if (localSaveFn) {
    localSaveFn(data);
  }

  // 2. Tenta sync a Supabase (async, non bloccante)
  const client = getSupabaseClient();
  if (!client) return { synced: false, reason: 'no-client' };

  try {
    const { error } = await client.from(table).insert(data);
    if (error) {
      addToSyncQueue(table, data);
      return { synced: false, reason: error.message };
    }
    return { synced: true };
  } catch (err) {
    addToSyncQueue(table, data);
    return { synced: false, reason: err.message || 'network-error' };
  }
}

/**
 * Aggiunge un item alla coda di sync per retry.
 */
function addToSyncQueue(table, data) {
  try {
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    queue.push({
      table,
      data,
      timestamp: Date.now(),
    });
    // Limita la coda
    const trimmed = queue.slice(-MAX_QUEUE_SIZE);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage pieno o non disponibile — ignora
  }
}

/**
 * Processa la coda di sync.
 * Chiamata all'avvio dell'app e quando torna online.
 * @returns {{ processed: number, failed: number, remaining: number }}
 */
export async function processSyncQueue() {
  const client = getSupabaseClient();
  if (!client) return { processed: 0, failed: 0, remaining: 0 };

  let queue;
  try {
    queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
  } catch {
    return { processed: 0, failed: 0, remaining: 0 };
  }

  if (queue.length === 0) return { processed: 0, failed: 0, remaining: 0 };

  let processed = 0;
  let failed = 0;
  const remaining = [];

  for (const item of queue) {
    // Scarta items vecchi di 7 giorni
    if (Date.now() - item.timestamp > 7 * 24 * 60 * 60 * 1000) {
      continue;
    }

    try {
      const { error } = await client.from(item.table).insert(item.data);
      if (error) {
        // Se e un errore di duplicato (gia sincronizzato), scarta
        if (error.code === '23505') {
          processed++;
          continue;
        }
        failed++;
        remaining.push(item);
        break; // Server ha problemi, non continuare
      }
      processed++;
    } catch {
      failed++;
      remaining.push(item);
      break; // Network error, non continuare
    }
  }

  // Salva gli items rimasti
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
  } catch { /* ignore */ }

  return { processed, failed, remaining: remaining.length };
}

/**
 * Ritorna il numero di items in coda.
 */
export function getSyncQueueSize() {
  try {
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    return queue.length;
  } catch {
    return 0;
  }
}
```

### Verifica
- `syncInsert('student_sessions', data, 'sessions', saveFn)` -> salva locale + Supabase
- Senza Supabase: salva solo locale, item in coda
- `processSyncQueue()` -> processa coda, svuota items sincronizzati

---

## TASK 2 — Processare coda sync all'avvio app (15min)

### File da modificare: `src/App.jsx` (o il componente root)

### Implementazione
Aggiungere un `useEffect` nel componente root che processa la coda al mount:

```javascript
import { processSyncQueue } from './services/supabaseSync';

// Nel componente App o nel provider principale:
useEffect(() => {
  // Processa coda sync all'avvio
  processSyncQueue().then(result => {
    if (result.processed > 0) {
      console.log(`[Sync] Processati ${result.processed} items dalla coda`);
    }
    if (result.remaining > 0) {
      console.warn(`[Sync] ${result.remaining} items ancora in coda`);
    }
  });

  // Processa anche quando torna online
  const handleOnline = () => {
    processSyncQueue();
  };
  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}, []);
```

### Verifica
- Accumulare items in coda (offline) -> ricaricare pagina (online) -> coda processata

---

## TASK 3 — Modificare studentService.js: sync sessioni (1.5h)

### File da modificare: `src/services/studentService.js`

### File da leggere PRIMA
- `src/services/studentService.js` — capire TUTTE le funzioni attuali, come salvano in localStorage, il formato dati
- Cercare: `logSession`, `logMood`, `logConfusione`, `logGameResult` e capire i parametri

### Implementazione

Per OGNI funzione che salva dati, aggiungere sync Supabase DOPO il salvataggio localStorage:

```javascript
import { syncInsert } from './supabaseSync';
import { getSupabaseClient } from './supabaseClient';

// ============================================
// logSession -> syncSession
// ============================================
export async function logSession(sessionData) {
  // 1. Salva in localStorage (come prima — NON toccare questa parte)
  const existingLogic = /* ... logica localStorage esistente ... */;

  // 2. AGGIUNTA: sync a Supabase student_sessions
  const client = getSupabaseClient();
  const user = client ? (await client.auth.getUser()).data?.user : null;

  if (user) {
    await syncInsert('student_sessions', {
      student_id: user.id,
      experiment_id: sessionData.experimentId,
      started_at: sessionData.startedAt || new Date().toISOString(),
      ended_at: sessionData.endedAt || null,
      duration_seconds: sessionData.durationSeconds || 0,
      completed: sessionData.completed || false,
      score: sessionData.score || null,
      activity: sessionData.activity || null,
    });
  }
}

// ============================================
// logMood -> sync a mood_reports
// ============================================
export async function logMood(moodData) {
  // 1. Salva in localStorage (come prima)
  const existingLogic = /* ... logica localStorage esistente ... */;

  // 2. AGGIUNTA: sync a Supabase mood_reports
  const client = getSupabaseClient();
  const user = client ? (await client.auth.getUser()).data?.user : null;

  if (user) {
    await syncInsert('mood_reports', {
      student_id: user.id,
      mood: moodData.mood,
      context: moodData.context || moodData.experimentId || null,
      created_at: new Date().toISOString(),
    });
  }
}

// ============================================
// logConfusione -> sync a student_sessions.activity
// ============================================
export async function logConfusione(confusioneData) {
  // 1. Salva in localStorage (come prima)
  const existingLogic = /* ... logica localStorage esistente ... */;

  // 2. AGGIUNTA: se esiste una sessione attiva su Supabase, aggiorna activity JSONB
  const client = getSupabaseClient();
  const user = client ? (await client.auth.getUser()).data?.user : null;

  if (user && confusioneData.sessionId) {
    try {
      // Leggi sessione corrente
      const { data: session } = await client
        .from('student_sessions')
        .select('activity')
        .eq('id', confusioneData.sessionId)
        .single();

      if (session) {
        const activity = session.activity || [];
        activity.push({
          type: 'confusione',
          concept: confusioneData.concept,
          timestamp: new Date().toISOString(),
        });

        await client
          .from('student_sessions')
          .update({ activity })
          .eq('id', confusioneData.sessionId);
      }
    } catch { /* non bloccante */ }
  }
}

// ============================================
// logGameResult -> sync con type='game'
// ============================================
export async function logGameResult(gameData) {
  // 1. Salva in localStorage (come prima)
  const existingLogic = /* ... logica localStorage esistente ... */;

  // 2. AGGIUNTA: sync a Supabase student_sessions con type game
  const client = getSupabaseClient();
  const user = client ? (await client.auth.getUser()).data?.user : null;

  if (user) {
    await syncInsert('student_sessions', {
      student_id: user.id,
      experiment_id: `game:${gameData.gameType}`,
      started_at: gameData.startedAt || new Date().toISOString(),
      ended_at: new Date().toISOString(),
      duration_seconds: gameData.durationSeconds || 0,
      completed: true,
      score: {
        type: 'game',
        gameType: gameData.gameType,
        score: gameData.score,
        maxScore: gameData.maxScore,
        level: gameData.level,
      },
    });
  }
}
```

### CRITICO: Non rompere nulla
- La logica localStorage esistente DEVE rimanere INTATTA
- Le chiamate Supabase sono AGGIUNTIVE e NON BLOCCANTI
- Se Supabase fallisce, l'utente NON deve vedere errori
- Wrappare ogni sync in try/catch

### Verifica
1. Aprire esperimento -> completare -> dato in Supabase `student_sessions`
2. Registrare mood -> dato in Supabase `mood_reports`
3. Giocare a un gioco -> dato in Supabase con `experiment_id = game:...`
4. Offline: dati solo in localStorage, item in sync queue
5. Tornare online: coda processata, dati arrivano a Supabase

---

## TASK 4 — Modificare nudgeService.js: cross-device nudge (1.5h)

### File da modificare: `src/services/nudgeService.js`

### File da leggere PRIMA
- `src/services/nudgeService.js` — capire `sendNudge()`, `startNudgeListener()`, come funziona attualmente con localStorage

### Implementazione

```javascript
import { getSupabaseClient } from './supabaseClient';

// ============================================
// sendNudge -> INSERT in Supabase nudges table
// ============================================
export async function sendNudge(nudgeData) {
  // 1. Salva in localStorage (come prima — per fallback)
  const existingLogic = /* ... logica localStorage esistente ... */;

  // 2. AGGIUNTA: INSERT in Supabase per delivery cross-device
  const client = getSupabaseClient();
  if (!client) return { delivered: false, reason: 'offline' };

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return { delivered: false, reason: 'not-authenticated' };

    const { error } = await client.from('nudges').insert({
      teacher_id: user.id,
      student_id: nudgeData.studentId,
      class_id: nudgeData.classId || null,
      message: nudgeData.message,
      read: false,
    });

    if (error) return { delivered: false, reason: error.message };
    return { delivered: true };
  } catch (err) {
    return { delivered: false, reason: err.message || 'network-error' };
  }
}

// ============================================
// startNudgeListener -> Supabase Realtime
// ============================================
let _nudgeChannel = null;

export function startNudgeListener(studentId, onNudge) {
  const client = getSupabaseClient();

  // Fallback localStorage polling (come prima)
  const existingPolling = /* ... logica polling localStorage esistente ... */;

  // AGGIUNTA: Supabase Realtime subscription
  if (!client || !studentId) return existingPolling;

  // Cleanup precedente subscription
  if (_nudgeChannel) {
    client.removeChannel(_nudgeChannel);
  }

  _nudgeChannel = client
    .channel(`nudges:${studentId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'nudges',
      filter: `student_id=eq.${studentId}`,
    }, (payload) => {
      const nudge = payload.new;
      // Mostra overlay nudge
      if (onNudge && typeof onNudge === 'function') {
        onNudge({
          id: nudge.id,
          message: nudge.message,
          teacherId: nudge.teacher_id,
          createdAt: nudge.created_at,
        });
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Nudge] Realtime subscription attiva');
      }
    });

  // Ritorna cleanup function
  return () => {
    if (_nudgeChannel) {
      client.removeChannel(_nudgeChannel);
      _nudgeChannel = null;
    }
    // Cleanup anche il polling localStorage
    if (typeof existingPolling === 'function') existingPolling();
  };
}

// ============================================
// markNudgeRead -> UPDATE in Supabase
// ============================================
export async function markNudgeRead(nudgeId) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('nudges').update({ read: true }).eq('id', nudgeId);
  } catch { /* non bloccante */ }
}

// ============================================
// fetchUnreadNudges -> per init all'avvio
// ============================================
export async function fetchUnreadNudges(studentId) {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('nudges')
      .select('*')
      .eq('student_id', studentId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}
```

### CRITICO
- Il polling localStorage DEVE continuare a funzionare come fallback
- Supabase Realtime e AGGIUNTIVO, non sostitutivo
- Cleanup della subscription quando il componente si smonta

### Verifica
1. **Cross-device**: Insegnante manda nudge da PC A -> studente su PC B riceve overlay in tempo reale
2. **Offline fallback**: Senza Supabase, nudge funziona come prima (localStorage)
3. **Mark read**: Studente chiude overlay -> nudge marcato letto in Supabase
4. **Unread fetch**: Studente apre app -> vede nudge non letti accumulati

---

## TASK 5 — Scrivere test di integrazione (1h)

### File da creare: `tests/unit/supabaseSync.test.js`

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/services/supabaseClient', () => ({
  getSupabaseClient: vi.fn(),
}));

import { syncInsert, processSyncQueue, getSyncQueueSize } from '../../src/services/supabaseSync';
import { getSupabaseClient } from '../../src/services/supabaseClient';

describe('supabaseSync', () => {
  const SYNC_QUEUE_KEY = 'elab_sync_queue';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('syncInsert', () => {
    it('salva in localStorage anche se Supabase non disponibile', async () => {
      getSupabaseClient.mockReturnValue(null);
      const saveFn = vi.fn();
      const result = await syncInsert('student_sessions', { id: 1 }, 'sessions', saveFn);
      expect(saveFn).toHaveBeenCalledWith({ id: 1 });
      expect(result.synced).toBe(false);
      expect(result.reason).toBe('no-client');
    });

    it('sync a Supabase quando disponibile', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      getSupabaseClient.mockReturnValue({
        from: () => ({ insert: mockInsert }),
      });
      const saveFn = vi.fn();
      const result = await syncInsert('student_sessions', { id: 1 }, 'sessions', saveFn);
      expect(saveFn).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith({ id: 1 });
      expect(result.synced).toBe(true);
    });

    it('accoda se Supabase ritorna errore', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: { message: 'server error' } });
      getSupabaseClient.mockReturnValue({
        from: () => ({ insert: mockInsert }),
      });
      await syncInsert('student_sessions', { id: 1 }, 'sessions', vi.fn());
      expect(getSyncQueueSize()).toBe(1);
    });
  });

  describe('processSyncQueue', () => {
    it('non fa nulla se coda vuota', async () => {
      getSupabaseClient.mockReturnValue({ from: vi.fn() });
      const result = await processSyncQueue();
      expect(result.processed).toBe(0);
    });

    it('processa items dalla coda', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      getSupabaseClient.mockReturnValue({
        from: () => ({ insert: mockInsert }),
      });
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([
        { table: 'student_sessions', data: { id: 1 }, timestamp: Date.now() },
        { table: 'mood_reports', data: { id: 2 }, timestamp: Date.now() },
      ]));
      const result = await processSyncQueue();
      expect(result.processed).toBe(2);
      expect(result.remaining).toBe(0);
    });

    it('scarta items vecchi di 7 giorni', async () => {
      getSupabaseClient.mockReturnValue({
        from: () => ({ insert: vi.fn().mockResolvedValue({ error: null }) }),
      });
      const oldTimestamp = Date.now() - 8 * 24 * 60 * 60 * 1000;
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([
        { table: 'test', data: {}, timestamp: oldTimestamp },
      ]));
      const result = await processSyncQueue();
      expect(result.processed).toBe(0);
    });
  });

  describe('getSyncQueueSize', () => {
    it('ritorna 0 se coda vuota', () => {
      expect(getSyncQueueSize()).toBe(0);
    });

    it('ritorna dimensione coda', () => {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([{}, {}, {}]));
      expect(getSyncQueueSize()).toBe(3);
    });
  });
});
```

### Verifica
- `npx vitest run tests/unit/supabaseSync.test.js` -> tutti PASS
- Test count totale: baseline + ~10 nuovi

---

## TASK 6 — Error handling patterns (da applicare ovunque) (15min)

### Pattern obbligatorio per TUTTE le chiamate Supabase nel studentService e nudgeService:

```javascript
// Pattern 1: Non bloccante, log-only
try {
  await supabaseOperation();
} catch (err) {
  console.warn('[Supabase] sync failed:', err.message);
  // NON ri-lanciare — l'utente non deve vedere errori
}

// Pattern 2: Con retry queue
try {
  const { error } = await client.from(table).insert(data);
  if (error) {
    addToSyncQueue(table, data);
  }
} catch {
  addToSyncQueue(table, data);
}

// Pattern 3: MAI bloccare il rendering
// SBAGLIATO: await syncSession(data); // blocca il componente
// GIUSTO: syncSession(data); // fire-and-forget (la Promise si risolve da sola)
```

### Verifica
- Grep `throw` in supabaseSync.js e studentService.js -> ZERO throw
- Grep `console.error` -> solo per debug, mai bloccante

---

## POST-SESSIONE OBBLIGATORIA
1. `npm run build` — deve passare
2. `npx vitest run` — deve passare (baseline + ~10 nuovi test)
3. `/elab-quality-gate` post-session — confronta con baseline
4. Verifica browser: 0 console errors
5. Test cross-device: studente su Chrome A completa esperimento -> dato visibile in Supabase Table Editor
6. Aggiorna `docs/prompts/G46-G55-sanamento-completo.md` con progresso reale
7. Score atteso dopo G49: **6.8/10**

## Anti-regressione checklist
- [ ] localStorage funziona IDENTICAMENTE a prima senza Supabase
- [ ] Nessuna chiamata Supabase blocca il rendering
- [ ] Sync queue in localStorage non cresce senza limiti (max 200)
- [ ] Items vecchi >7 giorni vengono scartati dalla coda
- [ ] Fire-and-forget: sync Supabase non rallenta la UX
- [ ] 62 esperimenti navigabili e completabili
- [ ] Giochi funzionano e loggano risultati
- [ ] Nudge cross-device: insegnante manda -> studente riceve
- [ ] Nudge fallback: senza Supabase, polling localStorage funziona
- [ ] 0 console errors nel browser
- [ ] Bundle size ragionevole (nessun import pesante aggiunto)
- [ ] `processSyncQueue()` eseguita all'avvio app
