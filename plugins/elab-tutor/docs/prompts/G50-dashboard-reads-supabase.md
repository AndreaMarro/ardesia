# G50 — DASHBOARD READS FROM SUPABASE

## Contesto
Fase 2 del piano sanamento (G46-G55). G48 ha creato Supabase + auth, G49 ha collegato i dati studente. Questa sessione chiude il cerchio: la dashboard insegnante legge dati REALI dal cloud.
Piano completo: `docs/prompts/G46-G55-sanamento-completo.md`
Sessione precedente (G49): Sync student data completato, score 6.8/10.

## STATO PRE-SESSIONE (da verificare)
- 972+ test PASS | Build <40s | Bundle ~4600KB | 0 console errors
- Supabase: auth + sync attivi, dati studente arrivano al cloud
- Sync queue: funzionante con retry offline
- Deploy: https://www.elabtutor.school

## REGOLE INVARIANTI
- ZERO DEMO, ZERO MOCK, ZERO DATI FINTI
- 62 lesson paths INTOCCABILI
- Non toccare engine/ — MAI
- `npm run build` + `npx vitest run` dopo OGNI singolo task
- PATH: `export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"`
- Palette: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D
- Muted text: #737373 (WCAG AA 4.7:1)
- CRITICO: Dashboard deve funzionare anche SENZA Supabase (fallback localStorage)

## PRE-SESSIONE OBBLIGATORIA
1. Esegui `/elab-quality-gate` pre-session
2. Salva baseline: test count, build time, bundle size, console errors
3. Verifica che G49 sia completato: dati studente arrivano a Supabase

---

## TASK 1 — Creare teacherDataService.js (2h)

### File da creare: `src/services/teacherDataService.js`

Questo servizio e il layer di accesso dati per la dashboard insegnante. Legge da Supabase con fallback localStorage.

```javascript
import { getSupabaseClient, isSupabaseAvailable } from './supabaseClient';

/**
 * Fetch lista studenti di una classe.
 * @param {string} classId - UUID classe
 * @returns {Array} [{ studentId, email, nome, cognome, joinedAt }]
 */
export async function fetchClassStudents(classId) {
  const client = getSupabaseClient();
  if (!client) return getLocalClassStudents(classId);

  try {
    const { data, error } = await client
      .from('class_students')
      .select(`
        student_id,
        joined_at,
        ...auth.users!student_id (
          email,
          raw_user_meta_data
        )
      `)
      .eq('class_id', classId);

    if (error) {
      console.warn('[TeacherData] fetchClassStudents error:', error.message);
      return getLocalClassStudents(classId);
    }

    return (data || []).map(row => ({
      studentId: row.student_id,
      email: row.email,
      nome: row.raw_user_meta_data?.nome || '',
      cognome: row.raw_user_meta_data?.cognome || '',
      joinedAt: row.joined_at,
    }));
  } catch (err) {
    console.warn('[TeacherData] fetchClassStudents network error:', err.message);
    return getLocalClassStudents(classId);
  }
}

/**
 * Fetch sessioni studenti di una classe negli ultimi N giorni.
 * @param {string} classId - UUID classe
 * @param {number} days - finestra temporale (default 7)
 * @returns {Array} sessioni
 */
export async function fetchClassSessions(classId, days = 7) {
  const client = getSupabaseClient();
  if (!client) return getLocalClassSessions(classId, days);

  try {
    // Prima: prendi gli student_id della classe
    const studentIds = await getClassStudentIds(classId);
    if (!studentIds.length) return [];

    const since = new Date(Date.now() - days * 86400000).toISOString();

    const { data, error } = await client
      .from('student_sessions')
      .select('*')
      .in('student_id', studentIds)
      .gte('started_at', since)
      .order('started_at', { ascending: false });

    if (error) {
      console.warn('[TeacherData] fetchClassSessions error:', error.message);
      return getLocalClassSessions(classId, days);
    }

    return data || [];
  } catch (err) {
    console.warn('[TeacherData] fetchClassSessions network error:', err.message);
    return getLocalClassSessions(classId, days);
  }
}

/**
 * Fetch mood aggregati per classe.
 * @param {string} classId
 * @returns {{ felice: number, confuso: number, frustrato: number, curioso: number, neutro: number }}
 */
export async function fetchClassMoods(classId) {
  const client = getSupabaseClient();
  if (!client) return getLocalClassMoods(classId);

  try {
    const studentIds = await getClassStudentIds(classId);
    if (!studentIds.length) return { felice: 0, confuso: 0, frustrato: 0, curioso: 0, neutro: 0 };

    const { data, error } = await client
      .from('mood_reports')
      .select('mood')
      .in('student_id', studentIds)
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString());

    if (error) return getLocalClassMoods(classId);

    // Aggrega
    const counts = { felice: 0, confuso: 0, frustrato: 0, curioso: 0, neutro: 0 };
    (data || []).forEach(row => {
      if (counts[row.mood] !== undefined) counts[row.mood]++;
    });
    return counts;
  } catch {
    return getLocalClassMoods(classId);
  }
}

/**
 * Fetch matrice completamento esperimenti per classe.
 * @param {string} classId
 * @returns {Array} [{ studentId, nome, experiments: { 'v1-cap1-esp1': true, ... } }]
 */
export async function fetchClassProgress(classId) {
  const client = getSupabaseClient();
  if (!client) return getLocalClassProgress(classId);

  try {
    const studentIds = await getClassStudentIds(classId);
    if (!studentIds.length) return [];

    const { data, error } = await client
      .from('student_sessions')
      .select('student_id, experiment_id, completed')
      .in('student_id', studentIds)
      .eq('completed', true);

    if (error) return getLocalClassProgress(classId);

    // Raggruppa per studente
    const byStudent = {};
    (data || []).forEach(row => {
      if (!byStudent[row.student_id]) byStudent[row.student_id] = {};
      byStudent[row.student_id][row.experiment_id] = true;
    });

    // Unisci con dati studente
    const students = await fetchClassStudents(classId);
    return students.map(s => ({
      studentId: s.studentId,
      nome: `${s.nome} ${s.cognome}`.trim() || s.email,
      experiments: byStudent[s.studentId] || {},
    }));
  } catch {
    return getLocalClassProgress(classId);
  }
}

/**
 * Fetch nudge non letti per una classe.
 * @param {string} classId
 * @returns {Array} nudge non letti
 */
export async function fetchUnreadNudges(classId) {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('nudges')
      .select('*')
      .eq('class_id', classId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

/**
 * Fetch classi dell'insegnante corrente.
 * @returns {Array} [{ id, name, school, city, studentCount }]
 */
export async function fetchTeacherClasses() {
  const client = getSupabaseClient();
  if (!client) return getLocalTeacherClasses();

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return getLocalTeacherClasses();

    const { data, error } = await client
      .from('classes')
      .select(`
        id, name, school, city, created_at,
        class_students (count)
      `)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return getLocalTeacherClasses();

    return (data || []).map(c => ({
      id: c.id,
      name: c.name,
      school: c.school,
      city: c.city,
      studentCount: c.class_students?.[0]?.count || 0,
      createdAt: c.created_at,
    }));
  } catch {
    return getLocalTeacherClasses();
  }
}

/**
 * Crea una nuova classe.
 * @param {{ name, school, city }} classData
 */
export async function createClass(classData) {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: 'Supabase non disponibile' };

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return { data: null, error: 'Non autenticato' };

    const { data, error } = await client
      .from('classes')
      .insert({
        name: classData.name,
        school: classData.school || null,
        city: classData.city || null,
        teacher_id: user.id,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Aggiungi studente a classe (via email).
 * @param {string} classId
 * @param {string} studentEmail
 */
export async function addStudentToClass(classId, studentEmail) {
  const client = getSupabaseClient();
  if (!client) return { error: 'Supabase non disponibile' };

  try {
    // Cerca utente per email (richiede funzione server-side o lookup)
    // Per ora: lo studente si auto-aggiunge con codice classe
    // TODO: implementare invito via email
    return { error: 'Funzione non ancora implementata — lo studente si unisce con codice classe' };
  } catch (err) {
    return { error: err.message };
  }
}

// ============================================
// HELPER: get student IDs for a class
// ============================================
async function getClassStudentIds(classId) {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('class_students')
      .select('student_id')
      .eq('class_id', classId);

    if (error) return [];
    return (data || []).map(r => r.student_id);
  } catch {
    return [];
  }
}

// ============================================
// FALLBACK: funzioni che leggono da localStorage
// Queste replicano la logica attuale della dashboard
// ============================================

function getLocalClassStudents(/* classId */) {
  // Ritorna i dati studente dal localStorage (formato attuale dashboard)
  try {
    const stored = localStorage.getItem('elab_class_students');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getLocalClassSessions(/* classId, days */) {
  try {
    const stored = localStorage.getItem('elab_student_sessions');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getLocalClassMoods(/* classId */) {
  return { felice: 0, confuso: 0, frustrato: 0, curioso: 0, neutro: 0 };
}

function getLocalClassProgress(/* classId */) {
  return [];
}

function getLocalTeacherClasses() {
  try {
    const stored = localStorage.getItem('elab_classes');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
```

### Verifica
- `fetchTeacherClasses()` -> ritorna classi da Supabase
- `fetchClassStudents(classId)` -> ritorna studenti con metadata
- `fetchClassSessions(classId, 7)` -> ritorna sessioni ultimi 7 giorni
- Senza Supabase: tutte le funzioni ritornano dati localStorage o array vuoti

---

## TASK 2 — Modificare TeacherDashboard.jsx: fetch da Supabase (2h)

### File da modificare: `src/components/teacher/TeacherDashboard.jsx`

### File da leggere PRIMA
- `src/components/teacher/TeacherDashboard.jsx` — leggere INTERAMENTE (e grande, ~3000 righe)
- Capire come ogni tab ottiene i suoi dati attualmente
- Cercare `useEffect`, `useState`, `allData`, `classReport`
- Cercare le tab: ClassiTab, GiardinoTab, AttivitaTab, ProgressiTab, MeteoTab, NudgeTab

### Implementazione

1. **Aggiungere import** in cima al file:
```javascript
import {
  fetchTeacherClasses,
  fetchClassStudents,
  fetchClassSessions,
  fetchClassMoods,
  fetchClassProgress,
  fetchUnreadNudges,
  createClass,
} from '../../services/teacherDataService';
import { isSupabaseAvailable } from '../../services/supabaseClient';
```

2. **Aggiungere state per data source**:
```javascript
const [dataSource, setDataSource] = useState('loading'); // 'supabase' | 'localStorage' | 'loading'
const [classes, setClasses] = useState([]);
const [selectedClassId, setSelectedClassId] = useState(null);
```

3. **useEffect iniziale — fetch dati**:
```javascript
useEffect(() => {
  let cancelled = false;
  async function loadData() {
    // Tentare Supabase
    const available = await isSupabaseAvailable();

    if (!cancelled) {
      if (available) {
        setDataSource('supabase');
        const teacherClasses = await fetchTeacherClasses();
        setClasses(teacherClasses);
        if (teacherClasses.length > 0 && !selectedClassId) {
          setSelectedClassId(teacherClasses[0].id);
        }
      } else {
        setDataSource('localStorage');
        // Logica attuale — NON toccare
      }
    }
  }
  loadData();
  return () => { cancelled = true; };
}, []);
```

4. **useEffect per dati classe selezionata**:
```javascript
useEffect(() => {
  if (!selectedClassId || dataSource !== 'supabase') return;
  let cancelled = false;

  async function loadClassData() {
    const [students, sessions, moods, progress, unreadNudges] = await Promise.all([
      fetchClassStudents(selectedClassId),
      fetchClassSessions(selectedClassId, 7),
      fetchClassMoods(selectedClassId),
      fetchClassProgress(selectedClassId),
      fetchUnreadNudges(selectedClassId),
    ]);

    if (!cancelled) {
      // Aggiornare gli state che alimentano i tab
      // ADATTARE ai nomi di state esistenti nel componente
      // Es: setAllData(sessions), setClassReport({ moods, progress }), etc.
    }
  }
  loadClassData();
  return () => { cancelled = true; };
}, [selectedClassId, dataSource]);
```

5. **Mostrare badge data source**:
```javascript
// Nell'header della dashboard, aggiungere:
{dataSource === 'supabase' && (
  <span style={{
    background: '#4A7A25', color: 'white', padding: '2px 8px',
    borderRadius: 4, fontSize: 11, marginLeft: 8,
  }}>
    Dati cloud
  </span>
)}
{dataSource === 'localStorage' && (
  <span style={{
    background: '#E8941C', color: 'white', padding: '2px 8px',
    borderRadius: 4, fontSize: 11, marginLeft: 8,
  }}>
    Solo dati locali
  </span>
)}
```

### CRITICO: Compatibilita
- Se `dataSource === 'localStorage'`, la dashboard funziona ESATTAMENTE come prima
- Non rompere nessun tab esistente
- I dati Supabase devono essere mappati allo STESSO formato che i tab si aspettano

---

## TASK 3 — Fix tab "Le mie classi" (1h)

### Problema attuale
Il tab "Le mie classi" (ClassiTab) mostra un placeholder o dati localStorage. Con Supabase, deve mostrare classi REALI con lista studenti.

### File da modificare: `src/components/teacher/TeacherDashboard.jsx` — sezione ClassiTab

### Implementazione

```javascript
// ClassiTab deve:
// 1. Mostrare lista classi dell'insegnante (da fetchTeacherClasses)
// 2. Per ogni classe: nome, scuola, citta, numero studenti
// 3. Click su classe -> mostra lista studenti (da fetchClassStudents)
// 4. Bottone "Crea classe" -> form con nome, scuola, citta -> createClass()
// 5. Se Supabase non disponibile: mostrare messaggio
//    "Per gestire le classi, configura la connessione al server."

// Form creazione classe:
const [newClassName, setNewClassName] = useState('');
const [newClassSchool, setNewClassSchool] = useState('');
const [newClassCity, setNewClassCity] = useState('');

async function handleCreateClass() {
  if (!newClassName.trim()) return;
  const { data, error } = await createClass({
    name: newClassName.trim(),
    school: newClassSchool.trim() || null,
    city: newClassCity.trim() || null,
  });
  if (error) {
    // Mostrare errore
    return;
  }
  // Aggiungere alla lista
  setClasses(prev => [data, ...prev]);
  setNewClassName('');
  setNewClassSchool('');
  setNewClassCity('');
}
```

### Verifica
- Creare classe "3A Marconi" -> appare nella lista
- Click sulla classe -> mostra studenti (vuoto all'inizio)
- Studente si registra e si unisce -> appare nella lista

---

## TASK 4 — Fix tab "Documentazione" (30min)

### Problema attuale
Il tab Documentazione ha paragrafi generici. Deve avere una guida rapida per insegnanti.

### File da modificare: `src/components/teacher/TeacherDashboard.jsx` — sezione DocumentazioneTab

### Contenuto da inserire

```jsx
// Sostituire il contenuto placeholder con:
<div style={{ maxWidth: 700, margin: '0 auto' }}>
  <h3 style={{ color: '#1E4D8C' }}>Guida rapida per insegnanti</h3>

  <h4>1. Come creare una classe</h4>
  <ol>
    <li>Vai al tab "Le mie classi"</li>
    <li>Clicca "Nuova classe"</li>
    <li>Inserisci nome, scuola e citta</li>
    <li>Condividi il codice classe con i tuoi studenti</li>
  </ol>

  <h4>2. Come mandare un nudge</h4>
  <ol>
    <li>Vai al tab "Nudge"</li>
    <li>Seleziona lo studente</li>
    <li>Scrivi un messaggio di incoraggiamento</li>
    <li>Lo studente lo ricevera in tempo reale sul suo dispositivo</li>
  </ol>

  <h4>3. Come leggere il Meteo Classe</h4>
  <p>Il "Meteo Classe" mostra le aree di confusione degli studenti.
  Se vedi "Cielo sereno", significa che nessuno studente ha segnalato difficolta.
  Le nuvole indicano concetti che richiedono rinforzo.</p>

  <h4>4. Come monitorare i progressi</h4>
  <p>Il tab "Progressi" mostra una matrice: righe = studenti, colonne = esperimenti.
  Un segno verde indica esperimento completato. Clicca su una cella per vedere i dettagli.</p>

  <h4>FAQ</h4>
  <details>
    <summary>I dati degli studenti sono al sicuro?</summary>
    <p>Si. I dati sono criptati in transito e salvati su server EU (Francoforte).
    Solo tu puoi vedere i dati dei tuoi studenti. Conforme GDPR.</p>
  </details>
  <details>
    <summary>Funziona senza internet?</summary>
    <p>Si, in modalita limitata. Gli studenti possono esplorare i circuiti offline.
    I dati si sincronizzano automaticamente quando torna la connessione.</p>
  </details>
  <details>
    <summary>Posso usarlo sulla LIM?</summary>
    <p>Si. ELAB Tutor e ottimizzato per LIM con risoluzione 1024x768.
    I bottoni hanno dimensione minima 44px per il tocco.</p>
  </details>
  <details>
    <summary>Quanto costa?</summary>
    <p>Kit hardware: 75 euro. Licenza software: contatta il tuo referente.</p>
  </details>
  <details>
    <summary>Chi contattare per assistenza?</summary>
    <p>Scrivi a supporto@elabtutor.school o contatta il tuo referente Omaric.</p>
  </details>
</div>
```

### Verifica
- Tab Documentazione mostra guida leggibile e utile
- FAQ cliccabili (details/summary)
- Nessun link rotto

---

## TASK 5 — Nudge tab: invio via Supabase (1h)

### File da modificare: `src/components/teacher/TeacherDashboard.jsx` — sezione NudgeTab

### Implementazione

```javascript
import { sendNudge } from '../../services/nudgeService';

// Nel NudgeTab, quando l'insegnante invia un nudge:
async function handleSendNudge(studentId, message) {
  const result = await sendNudge({
    studentId,
    classId: selectedClassId,
    message,
  });

  if (result.delivered) {
    // Mostrare conferma verde: "Nudge inviato!"
    // Aggiungere alla lista nudge locali per feedback immediato
  } else {
    // Mostrare warning giallo: "Nudge salvato localmente. Verra consegnato quando lo studente tornera online."
  }
}
```

### CRITICO
- Se Supabase e disponibile: nudge va via Supabase Realtime (delivery istantaneo)
- Se Supabase non e disponibile: nudge va in localStorage (delivery solo su stesso device)
- L'insegnante DEVE sapere quale modalita sta usando (badge verde/giallo)

### Verifica
1. Insegnante manda nudge con Supabase attivo -> studente su altro device riceve overlay
2. Insegnante manda nudge senza Supabase -> nudge salvato locale, warning giallo
3. Lista nudge inviati mostra stato: "Consegnato" / "In attesa" / "Letto"

---

## TASK 6 — Test end-to-end cross-device (30min)

### Scenario completo da verificare

**Setup**:
1. Registrare insegnante: `prof@test.com` (ruolo: teacher)
2. Registrare 3 studenti: `alunno1@test.com`, `alunno2@test.com`, `alunno3@test.com`
3. Insegnante crea classe "3A Test"
4. Studenti si uniscono alla classe

**Test dati**:
5. Studente 1 apre esperimento v1-cap1-esp1 -> completa -> dato in Supabase
6. Studente 2 apre esperimento v1-cap2-esp1 -> registra mood "confuso"
7. Studente 3 gioca a Trova il Guasto -> score salvato

**Test dashboard**:
8. Insegnante apre dashboard -> vede 3 studenti nella classe
9. Tab Attivita -> vede sessioni dei 3 studenti
10. Tab Meteo -> vede "confuso" segnalato
11. Tab Progressi -> matrice con esperimenti completati

**Test nudge**:
12. Insegnante manda nudge a Studente 2: "Bravo, continua cosi!"
13. Studente 2 (su altro browser/device) -> overlay con il messaggio
14. Studente 2 chiude overlay -> nudge marcato "letto"

**Test offline**:
15. Disattivare rete su studente -> completare esperimento -> dato in localStorage
16. Riattivare rete -> dato sincronizzato a Supabase -> dashboard aggiornata

### Verifica
- TUTTI i 16 step devono passare
- Se anche UNO fallisce, documentare il problema e creare issue per G51

---

## TASK 7 — Graceful degradation dashboard (30min)

### Scenario: Supabase e giu

La dashboard DEVE:
1. Mostrare badge giallo "Solo dati locali"
2. Non crashare su nessun tab
3. Mostrare dati localStorage dove disponibili
4. Mostrare "Nessun dato disponibile — configura la connessione al server" dove non ci sono dati
5. Il tab Nudge mostra: "I nudge cross-device richiedono la connessione al server"

### Implementazione
Wrappare ogni fetch in try/catch con fallback:

```javascript
// Pattern per ogni tab:
const [tabData, setTabData] = useState(null);
const [tabError, setTabError] = useState(false);

useEffect(() => {
  async function load() {
    try {
      const data = await fetchXxx(classId);
      setTabData(data);
    } catch {
      setTabError(true);
      // Tentare fallback localStorage
      setTabData(getLocalXxx());
    }
  }
  load();
}, [classId]);

// Nel render:
if (tabError && !tabData?.length) {
  return <p style={{ color: '#737373' }}>Nessun dato disponibile.</p>;
}
```

### Verifica
- Rimuovere env vars Supabase -> dashboard non crasha
- Tutti i tab mostrano contenuto sensato (dati locali o messaggio informativo)
- 0 console errors

---

## POST-SESSIONE OBBLIGATORIA
1. `npm run build` — deve passare
2. `npx vitest run` — deve passare (baseline + test nuovi da G48-G49-G50)
3. `/elab-quality-gate` post-session — confronta con baseline
4. Verifica browser: 0 console errors
5. Test cross-device: scenario completo TASK 6 (16 step)
6. Aggiorna `docs/prompts/G46-G55-sanamento-completo.md` con progresso reale
7. Score atteso dopo G50: **7.2/10** (obiettivo Fase 2 raggiunto!)

## Anti-regressione checklist
- [ ] Dashboard non crasha senza Supabase (fallback localStorage)
- [ ] Badge "Dati cloud" / "Solo dati locali" visibile nell'header
- [ ] Tab Classi: mostra classi reali da Supabase
- [ ] Tab Classi: form "Crea classe" funziona
- [ ] Tab Attivita: mostra sessioni da Supabase con fallback
- [ ] Tab Meteo: mostra mood aggregati (no falsi "Cielo sereno" su dati vuoti — fix G46)
- [ ] Tab Progressi: matrice completamento da Supabase
- [ ] Tab Nudge: invio via Supabase + conferma delivery
- [ ] Tab Documentazione: guida rapida con FAQ
- [ ] Nudge cross-device: insegnante manda -> studente riceve in tempo reale
- [ ] Offline graceful: nessun crash, messaggi informativi
- [ ] 62 esperimenti navigabili (non toccati)
- [ ] 0 console errors nel browser
- [ ] Bundle size ragionevole
- [ ] Nessuna query N+1 (fetchClassSessions usa batch, non loop)
- [ ] RLS Supabase: insegnante vede SOLO i dati dei PROPRI studenti
