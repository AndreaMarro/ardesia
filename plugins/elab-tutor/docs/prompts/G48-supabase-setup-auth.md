# G48 — SUPABASE SETUP + AUTH

## Contesto
Fase 2 del piano sanamento (G46-G55). Questa sessione introduce Supabase come backend leggero per sincronizzazione cross-device.
Piano completo: `docs/prompts/G46-G55-sanamento-completo.md`
Sessione precedente (G47): Fix P1 completati, score 6.3/10.

## STATO PRE-SESSIONE (da verificare)
- 972+ test PASS | Build <40s | Bundle ~4500KB | 0 console errors
- Deploy: https://www.elabtutor.school
- 62 esperimenti (38+18+6), 62 lesson paths
- Auth attuale: mock user in localStorage, ZERO backend reale

## REGOLE INVARIANTI
- ZERO DEMO, ZERO MOCK, ZERO DATI FINTI
- 62 lesson paths INTOCCABILI
- Non toccare engine/ — MAI
- `npm run build` + `npx vitest run` dopo OGNI singolo task
- PATH: `export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"`
- Palette: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D
- Muted text: #737373 (WCAG AA 4.7:1)
- Budget: 0 euro/mese per Supabase (free tier)

## PRE-SESSIONE OBBLIGATORIA
1. Esegui `/elab-quality-gate` pre-session
2. Salva baseline: test count, build time, bundle size, console errors
3. Verifica che G46 e G47 siano completati (5 fix P0 + 3 fix P1)

---

## TASK 1 — Creare progetto Supabase (15min)

### Azioni manuali (Andrea fa a mano)
1. Vai su https://supabase.com/dashboard
2. "New Project" -> Region: **EU (Frankfurt)** -> Free tier
3. Nome progetto: `elab-tutor`
4. Salva:
   - Project URL: `https://xxx.supabase.co`
   - Anon Key: `eyJ...`
   - Service Role Key: (NON usare nel frontend, solo per admin)

### Verifica
- Dashboard Supabase raggiungibile
- Region = eu-central-1 (Frankfurt)

---

## TASK 2 — Creare schema DB completo (30min)

### File da creare: `sql/schema.sql` (per reference, eseguire in Supabase SQL Editor)

Eseguire questo SQL nel SQL Editor di Supabase:

```sql
-- ============================================
-- ELAB TUTOR — Schema completo Supabase
-- ============================================

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

-- Studenti in classe (many-to-many)
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
  activity JSONB -- array di azioni (confusione, hint, etc.)
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

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;

-- Insegnante vede solo le sue classi
CREATE POLICY "teacher_own_classes" ON classes
  FOR ALL USING (teacher_id = auth.uid());

-- Studente vede le classi a cui appartiene
CREATE POLICY "student_view_classes" ON classes
  FOR SELECT USING (
    id IN (SELECT class_id FROM class_students WHERE student_id = auth.uid())
  );

-- Insegnante gestisce studenti delle sue classi
CREATE POLICY "teacher_manage_students" ON class_students
  FOR ALL USING (
    class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
  );

-- Studente vede la propria appartenenza
CREATE POLICY "student_own_membership" ON class_students
  FOR SELECT USING (student_id = auth.uid());

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

-- Studente gestisce i suoi mood
CREATE POLICY "student_own_moods" ON mood_reports
  FOR ALL USING (student_id = auth.uid());

-- Insegnante vede mood dei suoi studenti
CREATE POLICY "teacher_student_moods" ON mood_reports
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

-- Studente puo aggiornare read sui suoi nudge
CREATE POLICY "student_mark_read" ON nudges
  FOR UPDATE USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Insegnante crea nudge per i suoi studenti
CREATE POLICY "teacher_send_nudges" ON nudges
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

-- Insegnante vede nudge che ha mandato
CREATE POLICY "teacher_own_nudges" ON nudges
  FOR SELECT USING (teacher_id = auth.uid());

-- ============================================
-- INDEXES per performance
-- ============================================
CREATE INDEX idx_sessions_student ON student_sessions(student_id);
CREATE INDEX idx_sessions_experiment ON student_sessions(experiment_id);
CREATE INDEX idx_sessions_started ON student_sessions(started_at);
CREATE INDEX idx_moods_student ON mood_reports(student_id);
CREATE INDEX idx_nudges_student ON nudges(student_id);
CREATE INDEX idx_nudges_unread ON nudges(student_id) WHERE read = false;
CREATE INDEX idx_class_students_student ON class_students(student_id);

-- ============================================
-- Abilita Realtime per nudges (cross-device delivery)
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE nudges;
```

### Verifica
- Tutte le tabelle visibili in Supabase Table Editor
- RLS abilitato su tutte le tabelle (icona lucchetto verde)
- Realtime abilitato su nudges

---

## TASK 3 — Creare supabaseClient.js (15min)

### Installare SDK
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npm install @supabase/supabase-js
```

### File da creare: `src/services/supabaseClient.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Singleton Supabase client.
 * Ritorna null se le env vars non sono configurate (dev/offline mode).
 */
let _client = null;

export function getSupabaseClient() {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] ENV vars mancanti — modalita offline/localStorage');
    return null;
  }
  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}

/**
 * Helper: ritorna true se Supabase e configurato e raggiungibile.
 */
export async function isSupabaseAvailable() {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('classes').select('id').limit(0);
    return !error;
  } catch {
    return false;
  }
}

export default getSupabaseClient();
```

### Verifica
- `import supabase from '../services/supabaseClient'` non crasha anche senza env vars
- `isSupabaseAvailable()` ritorna false senza env vars, true con env vars valide

---

## TASK 4 — Creare supabaseAuth.js (1h)

### File da creare: `src/services/supabaseAuth.js`

```javascript
import { getSupabaseClient } from './supabaseClient';

/**
 * Servizio auth Supabase per ELAB Tutor.
 * Tutte le funzioni ritornano { data, error } per gestione errori uniforme.
 * Se Supabase non e disponibile, ritorna { data: null, error: 'offline' }.
 */

function getClient() {
  const client = getSupabaseClient();
  if (!client) return null;
  return client;
}

/**
 * Registra un nuovo utente (studente o insegnante).
 * @param {string} email
 * @param {string} password
 * @param {object} metadata - { role: 'student'|'teacher', nome: string, cognome: string }
 */
export async function signUp(email, password, metadata = {}) {
  const client = getClient();
  if (!client) return { data: null, error: 'Supabase non disponibile' };

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: metadata.role || 'student',
        nome: metadata.nome || '',
        cognome: metadata.cognome || '',
      },
    },
  });
  return { data, error: error?.message || null };
}

/**
 * Login con email/password.
 */
export async function signIn(email, password) {
  const client = getClient();
  if (!client) return { data: null, error: 'Supabase non disponibile' };

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error: error?.message || null };
}

/**
 * Logout.
 */
export async function signOut() {
  const client = getClient();
  if (!client) return { error: null };

  const { error } = await client.auth.signOut();
  return { error: error?.message || null };
}

/**
 * Ritorna l'utente corrente (dalla sessione Supabase).
 * Ritorna null se non loggato o Supabase non disponibile.
 */
export async function getCurrentUser() {
  const client = getClient();
  if (!client) return null;

  const { data: { user } } = await client.auth.getUser();
  return user;
}

/**
 * Listener per cambi di stato auth (login, logout, token refresh).
 * @param {Function} callback - (event, session) => void
 * @returns {Function} unsubscribe
 */
export function onAuthStateChange(callback) {
  const client = getClient();
  if (!client) return () => {}; // noop unsubscribe

  const { data: { subscription } } = client.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

/**
 * Ritorna il ruolo dell'utente corrente ('student', 'teacher', o null).
 */
export async function getUserRole() {
  const user = await getCurrentUser();
  return user?.user_metadata?.role || null;
}
```

### Verifica
- `signUp('test@test.com', 'password123', { role: 'teacher' })` -> utente creato in Supabase Auth
- `signIn('test@test.com', 'password123')` -> sessione attiva
- `getCurrentUser()` -> ritorna utente
- `signOut()` -> sessione chiusa

---

## TASK 5 — Modificare AuthContext.jsx (2h)

### File da modificare: `src/context/AuthContext.jsx`

### File da leggere PRIMA
- `src/context/AuthContext.jsx` — capire la struttura attuale del mock user
- Cercare: come viene usato `user`, `login`, `logout` nel contesto
- Cercare: quali componenti consumano AuthContext (grep `useAuth` nell'intero src/)

### Implementazione

Il principio: **Supabase Auth e la fonte primaria. localStorage e il fallback.**

```javascript
// SCHEMA DI MODIFICA per AuthContext.jsx:

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { signIn, signUp, signOut, getCurrentUser, onAuthStateChange, getUserRole } from '../services/supabaseAuth';
import { getSupabaseClient } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(!!getSupabaseClient());

  // 1. All'avvio: tentare Supabase, poi fallback localStorage
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const supabaseUser = await getCurrentUser();
        if (!cancelled && supabaseUser) {
          const userData = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            nome: supabaseUser.user_metadata?.nome || '',
            cognome: supabaseUser.user_metadata?.cognome || '',
            role: supabaseUser.user_metadata?.role || 'student',
            source: 'supabase',
          };
          setUser(userData);
          // Sync a localStorage per offline
          localStorage.setItem('elab_user', JSON.stringify(userData));
          setLoading(false);
          return;
        }
      } catch { /* Supabase non disponibile */ }

      // Fallback: localStorage
      if (!cancelled) {
        try {
          const stored = JSON.parse(localStorage.getItem('elab_user'));
          if (stored) {
            setUser({ ...stored, source: 'localStorage' });
          }
        } catch { /* ignore */ }
        setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // 2. Listener Supabase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const userData = {
          id: u.id,
          email: u.email,
          nome: u.user_metadata?.nome || '',
          cognome: u.user_metadata?.cognome || '',
          role: u.user_metadata?.role || 'student',
          source: 'supabase',
        };
        setUser(userData);
        localStorage.setItem('elab_user', JSON.stringify(userData));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('elab_user');
      }
    });
    return unsubscribe;
  }, []);

  // 3. Login: Supabase first, localStorage fallback
  const login = useCallback(async (email, password) => {
    const { data, error } = await signIn(email, password);
    if (error === 'Supabase non disponibile') {
      // Fallback localStorage (dev/offline)
      const stored = JSON.parse(localStorage.getItem('elab_user'));
      if (stored && stored.email === email) {
        setUser({ ...stored, source: 'localStorage' });
        return { success: true, source: 'localStorage' };
      }
      return { success: false, error: 'Offline e nessun dato locale' };
    }
    if (error) return { success: false, error };
    return { success: true, source: 'supabase' };
  }, []);

  // 4. Register
  const register = useCallback(async (email, password, metadata) => {
    const { data, error } = await signUp(email, password, metadata);
    if (error) return { success: false, error };
    // Salva anche in localStorage
    if (data?.user) {
      const userData = {
        id: data.user.id,
        email,
        nome: metadata.nome || '',
        cognome: metadata.cognome || '',
        role: metadata.role || 'student',
        source: 'supabase',
      };
      localStorage.setItem('elab_user', JSON.stringify(userData));
    }
    return { success: true };
  }, []);

  // 5. Logout
  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    localStorage.removeItem('elab_user');
  }, []);

  const value = { user, loading, login, register, logout, isOnline };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro AuthProvider');
  return ctx;
}
```

### CRITICO: Compatibilita retroattiva
- Se Supabase NON e configurato (no env vars), il login localStorage DEVE continuare a funzionare esattamente come prima
- Tutti i componenti che usano `useAuth()` devono ricevere lo stesso shape di `user`
- Il campo `user.source` e nuovo: 'supabase' o 'localStorage'

### Verifica
1. **Senza env vars Supabase**: login/logout funziona come prima (localStorage)
2. **Con env vars Supabase**: login crea sessione Supabase + sync localStorage
3. **Offline dopo login Supabase**: utente resta loggato (localStorage fallback)

---

## TASK 6 — Modificare UI login/registrazione (1h)

### File da leggere PRIMA
- Cercare i componenti di login/registrazione: `grep -r "login\|Login\|register\|Register" src/components/ --include="*.jsx" -l`
- Capire come chiamano attualmente il mock auth

### Implementazione
1. I form di login/registrazione devono chiamare `login(email, password)` e `register(email, password, metadata)` dal nuovo AuthContext
2. Mostrare errori reali da Supabase (es. "Email gia registrata", "Password troppo corta")
3. Aggiungere campo "Ruolo" al form di registrazione: radio button "Studente" / "Insegnante"
4. Aggiungere campi "Nome" e "Cognome"
5. Mostrare un indicatore se l'utente e in modalita offline/localStorage: un badge giallo "Modalita offline" nell'header

### Verifica browser
- Form login: email + password -> login Supabase
- Form registrazione: email + password + nome + cognome + ruolo -> registrazione Supabase
- Errore "Email gia registrata" -> messaggio user-friendly in italiano
- Senza connessione: badge "Modalita offline" visibile

---

## TASK 7 — Aggiungere env vars a Vercel (10min)

### Azioni
```bash
# In locale: creare .env.local (GIA in .gitignore)
echo "VITE_SUPABASE_URL=https://xxx.supabase.co" >> .env.local
echo "VITE_SUPABASE_ANON_KEY=eyJ..." >> .env.local

# Su Vercel: Settings -> Environment Variables
# Aggiungere:
# VITE_SUPABASE_URL = https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY = eyJ...
# Scope: Production + Preview
```

### ATTENZIONE
- NON committare .env.local (verificare che sia in .gitignore)
- NON usare la Service Role Key nel frontend — solo Anon Key
- L'Anon Key e sicura da esporre nel frontend (RLS protegge i dati)

### Verifica
- `npm run build` passa senza errori
- Deploy Vercel: env vars visibili nel dashboard
- In produzione: login Supabase funziona

---

## TASK 8 — Scrivere test auth flow (1h)

### File da creare: `tests/unit/supabaseAuth.test.js`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabaseClient
vi.mock('../../src/services/supabaseClient', () => ({
  getSupabaseClient: vi.fn(),
}));

import { signUp, signIn, signOut, getCurrentUser } from '../../src/services/supabaseAuth';
import { getSupabaseClient } from '../../src/services/supabaseClient';

describe('supabaseAuth', () => {
  const mockAuth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  };
  const mockClient = { auth: mockAuth };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('quando Supabase non e disponibile', () => {
    beforeEach(() => {
      getSupabaseClient.mockReturnValue(null);
    });

    it('signUp ritorna errore offline', async () => {
      const { error } = await signUp('a@b.com', 'pass');
      expect(error).toBe('Supabase non disponibile');
    });

    it('signIn ritorna errore offline', async () => {
      const { error } = await signIn('a@b.com', 'pass');
      expect(error).toBe('Supabase non disponibile');
    });

    it('signOut non crasha', async () => {
      const { error } = await signOut();
      expect(error).toBeNull();
    });

    it('getCurrentUser ritorna null', async () => {
      const user = await getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('quando Supabase e disponibile', () => {
    beforeEach(() => {
      getSupabaseClient.mockReturnValue(mockClient);
    });

    it('signUp chiama supabase.auth.signUp', async () => {
      mockAuth.signUp.mockResolvedValue({ data: { user: { id: '1' } }, error: null });
      const { data, error } = await signUp('a@b.com', 'pass', { role: 'teacher', nome: 'Test' });
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'pass',
        options: { data: { role: 'teacher', nome: 'Test', cognome: '' } },
      });
      expect(error).toBeNull();
    });

    it('signIn chiama supabase.auth.signInWithPassword', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
      const { error } = await signIn('a@b.com', 'pass');
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pass' });
      expect(error).toBeNull();
    });

    it('signIn gestisce errore Supabase', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({ data: null, error: { message: 'Invalid credentials' } });
      const { error } = await signIn('a@b.com', 'wrong');
      expect(error).toBe('Invalid credentials');
    });

    it('getCurrentUser ritorna utente', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: { id: '1', email: 'a@b.com' } } });
      const user = await getCurrentUser();
      expect(user.id).toBe('1');
    });
  });
});
```

### Verifica
- `npx vitest run tests/unit/supabaseAuth.test.js` -> tutti PASS
- Test count totale: 972+ (baseline) + ~8 nuovi

---

## TASK 9 — Verifica offline fallback (CRITICO) (30min)

### Scenario da verificare manualmente

1. **Dev senza env vars**: rimuovere VITE_SUPABASE_URL da .env.local
   - `npm run dev` -> app funziona normalmente
   - Login/logout con localStorage -> OK
   - Dashboard insegnante -> mostra dati localStorage
   - Console: `[Supabase] ENV vars mancanti — modalita offline/localStorage`

2. **Prod con Supabase down**: env vars presenti ma Supabase irraggiungibile
   - Login fallback localStorage -> OK
   - App non crasha, nessun errore bloccante
   - Banner "Modalita offline" visibile

3. **Prod con Supabase up**: env vars presenti e Supabase raggiungibile
   - Login crea sessione Supabase
   - User data sync a localStorage
   - Ricarica pagina -> utente resta loggato

### Anti-regressione
- NESSUN import di `@supabase/supabase-js` deve essere diretto — sempre via `supabaseClient.js`
- `getSupabaseClient()` ritorna null senza env vars — MAI crashare
- `isSupabaseAvailable()` MAI bloccare il rendering

---

## POST-SESSIONE OBBLIGATORIA
1. `npm run build` — deve passare
2. `npx vitest run` — deve passare (972+ test baseline + ~8 nuovi)
3. `/elab-quality-gate` post-session — confronta con baseline
4. Verifica browser: 0 console errors
5. Verifica bundle size: dovrebbe crescere di ~15KB (Supabase SDK)
6. Aggiorna `docs/prompts/G46-G55-sanamento-completo.md` con progresso reale
7. Score atteso dopo G48: **6.5/10**

## Anti-regressione checklist
- [ ] Login localStorage funziona senza env vars Supabase
- [ ] App non crasha se Supabase e irraggiungibile
- [ ] 62 esperimenti navigabili
- [ ] Dashboard insegnante funziona (con dati localStorage)
- [ ] 0 console errors nel browser
- [ ] Bundle size < 4600KB (4500 baseline + ~100 Supabase SDK)
- [ ] Nessun secret committato (.env.local in .gitignore)
- [ ] RLS abilitato su tutte le tabelle Supabase
