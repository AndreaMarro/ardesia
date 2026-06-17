# PROMPT SESSIONE 32 — Il Tutor Diventa Reale

**Data creazione**: 21/02/2026
**Sessione precedente**: 31 (Audit + Volume Gating)
**Deploy attuale**: https://elab-builder.vercel.app
**Score REALE**: ~7.0/10 (vedi `sessioni/report/REPORT-ONESTO-STATO-PROGETTO.md`)
**Metodologia**: Ralph Loop + Claude in Chrome (VISUAL-FIRST)

---

## FILOSOFIA SESSIONE 32

> **LIBRI, KIT, ELAB TUTOR SONO UNA COSA SOLA.**

Il tutor digitale deve essere lo specchio perfetto dei libri fisici. Se il Volume 1 del libro ha il condensatore, lo studente con licenza Vol1 DEVE vedere il condensatore nel tutor. Se il libro mostra un circuito con LED + resistore + batteria, quei componenti DEVONO funzionare esattamente come nel libro quando montati correttamente.

> **NO DEMO — le cose DEVONO funzionare davvero.**

Non basta che il codice compili. Ogni feature deve essere VISTA funzionare nel browser. Screenshot o non è mai successo.

> **Frontend PERFETTO — tutto ben visibile e fruibile su tutti i dispositivi.**

Desktop 1440px, tablet 768px, mobile 375px. Nulla omesso.

---

## STATO ATTUALE: I PROBLEMI DA RISOLVERE

### P0 — ROTTI
1. **Teacher-Student data**: `studentService.js` usa localStorage → teacher non vede dati
2. **Vol2 quiz**: 0/18 esperimenti hanno quiz → gap educativo

### P1 — INCOMPLETI
3. **Volume-Component mapping**: ~10 componenti nel `volumeAvailableFrom` sbagliato rispetto ai libri
4. **3 modalità esperimento**: "pre-montato", "monta tu", "drag & drop guidato" — NON esistono
5. **`auth-list-classes` HTTP 500**: Notion DB classi non configurato
6. **PDF volumi non nel progetto**: impossibile verificare corrispondenza SVG-libri

### P2 — INCOMPLETI
7. **Whiteboard V3**: mai testata nel browser
8. **Chat overlay mobile**: copre quasi tutto lo schermo
9. **Volume bypass**: accesso diretto via props aggira gating

---

## SPRINT PLAN

### SPRINT 1: ALLINEAMENTO LIBRI-TUTOR (Fondamentale)

**Prerequisito**: L'utente DEVE fornire i PDF dei 3 volumi o confermare la mappatura componenti-volume. Senza questo, non è possibile procedere.

#### 1A: Procurarsi i PDF
- [ ] Verificare se i PDF sono altrove nel filesystem
- [ ] Se non disponibili, chiedere all'utente di copiarli in `public/volumes/`
- [ ] Alternative: screenshot delle pagine indice dei volumi con Claude in Chrome

#### 1B: Verificare ogni esperimento vs libro
Per OGNI esperimento (69 totali):
- [ ] Leggere titolo, descrizione, componenti usati dall'esperimento
- [ ] Confrontare con il libro: l'esperimento corrisponde a un'attività del libro?
- [ ] I componenti listati corrispondono a quelli dell'immagine del libro?
- [ ] Il circuito schema nel codice è fisicamente corretto?

#### 1C: Fix volumeAvailableFrom
Allineare OGNI componente al volume in cui appare per la PRIMA volta nel libro:

```javascript
// DA VERIFICARE CON PDF — questa è la mappatura da confermare/correggere:
// Se il libro Vol1 include condensatore, potenziometro, diodo → cambiare a volumeAvailableFrom: 1
// Se il libro Vol2 introduce MOSFET, fototransistore → cambiare a volumeAvailableFrom: 2
// Se il libro Vol3 introduce Arduino, servo, LCD → cambiare a volumeAvailableFrom: 3
```

#### 1D: Aggiungere quiz Vol2
- [ ] 18 esperimenti × 2 quiz = 36 domande
- [ ] Formato: `{ question, options: [3], correct: 0|1|2, explanation }`
- [ ] Domande basate sul contenuto reale del libro Vol2
- [ ] Distribuzione risposte corrette bilanciata (0/1/2)

---

### SPRINT 2: TEACHER-STUDENT COMMUNICATION (Architetturale)

#### 2A: Server-side student data
Sostituire localStorage con persistenza server-side.

**Opzione A (consigliata): Netlify Function + Notion DB**
```
POST /.netlify/functions/student-data-sync
Body: { userId, dataType, payload }
→ Salva in Notion DB "student_tracking"
→ Teacher legge da stessa Notion DB
```

**Opzione B: Supabase/Firebase (più scalabile ma nuova dipendenza)**

La decisione spetta all'utente. Punti da considerare:
- Notion è già usato per auth → coerenza
- Ma Notion API ha rate limits (3 req/s)
- Supabase ha realtime ma richiede nuovo account

#### 2B: Fix `auth-list-classes`
- [ ] Verificare Notion DB classes esiste nel workspace
- [ ] Configurare `NOTION_CLASSES_DB` env var correttamente
- [ ] Testare con Chrome: teacher vede lista classi

#### 2C: Teacher Dashboard funzionale
- [ ] Teacher vede studenti della classe
- [ ] Teacher vede esperimenti completati per studente
- [ ] Teacher vede tempo speso e quiz scores
- [ ] Interfaccia SUPER SEMPLICE — una tabella con nomi + barre progresso

---

### SPRINT 3: 3 MODALITÀ ESPERIMENTO

#### 3A: Definire buildMode nei dati
Ogni esperimento deve avere:
```javascript
{
  id: "v1-cap1-led",
  // ... existing fields ...
  availableModes: ['preassembled', 'guided', 'sandbox'],
  // preassembled: circuito già montato, studente lo osserva/modifica
  // guided: step-by-step con istruzioni visive, studente trascina componenti uno alla volta
  // sandbox: paletta completa, nessuna guida, libertà totale
}
```

#### 3B: UI selezione modalità
Quando lo studente clicca un esperimento, mostrare 3 card:
1. **Già montato** — "Osserva il circuito funzionante"
2. **Monta tu (guidato)** — "Segui le istruzioni passo-passo"
3. **Sandbox** — "Montalo da solo senza aiuto"

#### 3C: Modalità "Monta tu" (guidato)
- Pulsante "Avanti" per avanzare allo step successivo
- Ogni step evidenzia il componente da posizionare
- Drag & drop del componente nella posizione corretta
- Feedback visivo: verde se corretto, rosso se sbagliato
- La logica `buildSteps` GIÀ ESISTE nel codice (NewElabSimulator riga 263+)

#### 3D: Modalità "Sandbox"
- Già parzialmente implementata
- Palette mostra SOLO componenti del volume corrente (Session 31)
- Nessuna guida — lo studente monta liberamente

---

### SPRINT 4: FRONTEND PERFETTO + RESPONSIVE

> **OBBLIGO**: Usare Claude in Chrome per OGNI verifica. Skill `frontend-design` per miglioramenti visivi.

#### 4A: Audit visivo completo con Chrome
Per OGNI pagina/vista:
- [ ] Desktop 1440px — screenshot + verifica layout
- [ ] Tablet 768px — screenshot + verifica layout
- [ ] Mobile 375px — screenshot + verifica layout

Pagine da auditare:
1. Sito: index, chi-siamo, kit, corsi, negozio, scuole, beta-test, login
2. Tutor: login, vetrina, experiment picker, simulatore (Vol1 + Vol3), sidebar, chat, whiteboard, teacher dashboard
3. Mobile: tutte le viste sopra

#### 4B: Fix responsive issues trovate
- Chat overlay mobile: ridurre a max 60% altezza schermo
- Toolbar simulatore: adattare per touch
- Font sizes: verificare >= 14px ovunque
- Touch targets: >= 44px

#### 4C: Frontend-design skill
Usare la skill per:
- VetrinaSimulatore: galleria con animazioni, Apple-quality
- ExperimentPicker: cards con preview immagine esperimento
- Login page: design moderno e pulito
- Teacher Dashboard: interfaccia semplice e chiara

#### 4D: Whiteboard V3 test
- [ ] Aprire Whiteboard nel browser
- [ ] Testare: disegno, selezione, spostamento, ridimensionamento, cancellazione
- [ ] Screenshot prima/dopo ogni operazione
- [ ] Fix immediato se rotto

---

### SPRINT 5: AI INTEGRATION + AUDIT FINALE

#### 5A: Galileo AI + Esperimenti
- Chat Galileo deve essere consapevole dell'esperimento corrente
- Quando lo studente è su "LED base", Galileo suggerisce domande pertinenti
- Integration con QUALSIASI AI backend (non solo n8n) via API standard

#### 5B: Volume bypass guard
```javascript
// In NewElabSimulator.jsx, quando carica un esperimento:
if (!hasVolumeAccess(experimentVolume)) {
  // Redirect a ExperimentPicker
  // Non caricare l'esperimento
}
```

#### 5C: Build + console audit
- `npm run build` → 0 errori
- 0 console.log inappropriati
- Chunk sizes verificati

#### 5D: Deploy + post-deploy screenshots
- Deploy Vercel
- Deploy Netlify (se sito modificato)
- Screenshot post-deploy OGNI pagina critica

#### 5E: Report finale + MEMORY update
- Score onesti con motivazione
- Issues rimasti documentati
- HONESTY NOTE: cosa testato vs cosa no

---

## CHAIN OF VERIFICATION — CHECKLIST SESSIONE 32

### Sprint 1: Allineamento
- [ ] PDF volumi disponibili O mappatura confermata dall'utente
- [ ] OGNI componente: volumeAvailableFrom corretto vs libro
- [ ] 18 quiz Vol2 scritti e inseriti
- [ ] Build 0 errori dopo modifiche

### Sprint 2: Teacher-Student
- [ ] studentService.js → server-side
- [ ] auth-list-classes funzionante (non 500)
- [ ] Teacher vede dati studenti nel browser (screenshot)
- [ ] Class report con dati reali

### Sprint 3: 3 Modalità
- [ ] Almeno 3 esperimenti con buildMode testato
- [ ] UI selezione modalità visibile (screenshot)
- [ ] "Monta tu" funziona con step e feedback (screenshot)
- [ ] Sandbox filtrata per volume (già OK da S31)

### Sprint 4: Frontend
- [ ] Screenshot desktop 1440px per OGNI pagina
- [ ] Screenshot tablet 768px per OGNI pagina
- [ ] Screenshot mobile 375px per OGNI pagina
- [ ] Chat overlay mobile < 60% altezza
- [ ] Font >= 14px verificato
- [ ] frontend-design skill usata per VetrinaSimulatore

### Sprint 5: Finale
- [ ] Build 0 errori
- [ ] 0 console.log inappropriati
- [ ] Deploy Vercel + Netlify
- [ ] Screenshot post-deploy
- [ ] Score onesti con delta vs session 31

---

## TEST ACCOUNTS

| Ruolo | Email | Password | RBAC |
|-------|-------|----------|------|
| Admin | `debug@test.com` | `Xk9#mL2!nR4` | Tutto |
| Teacher | `teacher@elab.test` | `Pw8&jF3@hT6!cZ1` | Tutor + Area Docente |
| Student | `student@elab.test` | `Ry5!kN7#dM2$wL9` | Solo Tutor |
| Admin | `marro.andrea96@gmail.com` | `Bz4@qW8!fJ3#xV6` | Tutto |

**Codici licenza test**:
- `ELAB-VOL1-2026` → Vol1
- `ELAB-VOL2-2026` → Vol2
- `ELAB-VOL3-2026` → Vol3
- `ELAB-BUNDLE-ALL` → Tutti

---

## DEPLOY

```bash
# Vercel (ELAB Tutor)
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes

# Netlify (Sito Pubblico) — solo se modificato
cd "VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13
```

---

## NOTE PER CLAUDE

1. **RALPH LOOP OBBLIGATORIO**: plan → build → verify (Chrome) → deploy → report
2. **CLAUDE IN CHROME OBBLIGATORIO**: OGNI fix → screenshot. MAI dichiarare "fatto" senza screenshot
3. **FRONTEND-DESIGN SKILL**: Usare per VetrinaSimulatore, ExperimentPicker, Login, Teacher Dashboard
4. **SKILL CREATOR**: Creare skill specifiche se servono (es. "experiment-verifier")
5. **NO ARROTONDAMENTI**: Score onesti con motivazione. Se qualcosa non è testato, dirlo
6. **PDF = VERITÀ**: La mappatura componenti-volume viene dai LIBRI, non dal codice precedente
7. **SERVER-SIDE FIRST**: Il teacher deve poter usare il dashboard PER DAVVERO
8. **MOBILE FIRST**: Testare SEMPRE su 375px oltre che desktop
9. **NanoBreakout**: Semicerchio LEFT, ala RIGHT, SULLA breadboard. SEMPRE.
10. **Griglia**: 7.5px pitch per breadboard
11. **Font**: Oswald + Open Sans + Fira Code (tutor) / Roboto + Poppins (sito)
12. **WCAG**: fontSize >= 14px, touch targets >= 44px
13. **Memory**: `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md`
14. **Report onesto**: `sessioni/report/REPORT-ONESTO-STATO-PROGETTO.md`

---

## OUTPUT ATTESI FINE SESSIONE

1. **Report finale onesto** con score aggiornati
2. **Screenshots di OGNI fix** (non screenshot = non fatto)
3. **MEMORY.md aggiornato** con stato reale
4. **Continuation string** per sessione successiva
5. **Build 0 errori + deploy**
