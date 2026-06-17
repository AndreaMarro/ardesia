# CTO TECHNICAL ANALYSIS v2 — ELAB Tutor Platform
## Ottica: Prodotto venduto alle scuole, usato dagli insegnanti
## Session 69 — Architecture Review + Resource Impact + Evolution Roadmap

**Date**: 2026-03-04
**Analyst**: Claude Opus 4.6 (CTO perspective)
**Lente**: ELAB è un prodotto per la scuola. L'utente primario è l'INSEGNANTE — anche completamente inesperto di elettronica. L'obiettivo è orizzontalizzare la didattica: qualunque docente, di qualunque materia, deve poter insegnare i concetti del volume ELAB con scioltezza, divertendosi, trasformandosi simultaneamente in studente e insegnante. Gli studenti con i kit sono l'utente secondario.

**Codebase**: 162 JS/JSX files (79,235 LOC), 2,466-line FastAPI backend, 34 Netlify Functions

---

# PART 1 — STATE OF THE ART ANALYSIS (Ottica Insegnante)

## 1.1 La Domanda Fondamentale

> Un professore di storia, 55 anni, zero competenze tecniche, apre ELAB per la prima volta su un proiettore in classe. In quanto tempo riesce a spiegare cos'è un LED ai suoi studenti, sentendosi sicuro di sé?

**Risposta onesta: non ce la fa da solo.** Non perché il prodotto sia rotto, ma perché manca il **ponte** tra "piattaforma tecnicamente eccellente" e "strumento che un non-tecnico usa con fiducia".

## 1.2 Cosa Vede l'Insegnante — Percorso Utente

### Primo contatto: VetrinaSimulatore (Landing Page)
| Aspetto | Score | Dettaglio |
|---------|-------|-----------|
| Impatto visivo | **8.5/10** | Counter animati (69 esperimenti, 21 componenti), card feature ben progettate |
| Proposta di valore | **7/10** | Chiara per un tecnico ("simulatore Arduino"), meno chiara per un prof di storia |
| Call-to-action | **6/10** | Richiede codice licenza prima di provare — nessun "demo gratuita" visibile |
| Onboarding | **2/10** | Zero. Nessun video introduttivo, nessun "Come funziona in 2 minuti" |

**Problema critico**: Il prof arriva sulla landing, legge "simulatore circuiti", capisce che è qualcosa di tecnico, e si chiede: **"Ma io che c'entro? Come lo uso in classe?"**. Non c'è nessun messaggio tipo: *"Anche se non sai nulla di elettronica, ELAB ti guida passo passo. In 10 minuti sarai pronto per la tua prima lezione."*

### Secondo passo: Login → Dashboard Insegnante (TeacherDashboard)
| Tab | Score insegnante | Problema |
|-----|-----------------|----------|
| Il Giardino (piante) | **7/10** | Metafora bella ma va spiegata — nessun help text |
| Meteo Classe | **5/10** | "Confusione 6.3/10" — troppo astratto per un non-tecnico |
| Attività | **7/10** | Tabella chiara, ma senza contesto ("3 esperimenti fatti" — è tanto o poco?) |
| Dettaglio Studente | **8/10** | Utile per intervento 1:1, ben fatto |
| Nudge | **5/10** | Nessun template — il prof deve scrivere da zero |
| Documentazione | **3/10** | Quasi vuota, nessun video, nessun quick-start |
| Le mie Classi | **6/10** | Funzionale ma incompleto |

**Punteggio complessivo Dashboard**: **5.5/10** — Componenti buoni ma senza il tessuto connettivo che un non-tecnico ha bisogno.

### Terzo passo: Simulatore → Esperimento → Galileo
| Aspetto | Score insegnante | Dettaglio |
|---------|-----------------|----------|
| ExperimentPicker | **9/10** | Funnel a 3 step, colori per volume, badge difficoltà — intuitivo |
| ExperimentGuide | **8.5/10** | Passi numerati, "Cosa Osservare", concetto chiave — eccellente |
| Simulatore (uso base) | **7/10** | Funziona, ma il prof non sa PERCHÉ cliccando "Play" il LED si accende |
| Galileo AI | **3/10 per insegnanti** | Parla come se l'utente fosse un bambino di 10 anni. Non sa spiegare COME INSEGNARE |

---

## 1.3 IL PROBLEMA GALILEO: Un Tutor Studente, Non un Assistente Didattico

Questo è il **single biggest gap** dell'intera piattaforma.

### Cosa dice il system prompt (shared.yml):
```
Accompagni studenti 8-14 anni. Rispondi SEMPRE in italiano, chiaro, concreto, entusiasta.
```

### Cosa legge il tutor.yml:
```
DUE utenti: STUDENTI (curiosi, principianti) e INSEGNANTI (anche non tecnici)
```

Ma poi **ZERO contenuto specifico per insegnanti**. Nessuna riga. La sezione pedagogy descrive 4 livelli di intervento (L1-L4: Socratico, Diretto, Proattivo, Metacognitivo) — tutti tarati su **studenti**, non su adulti che devono insegnare.

### Test: "Come spiego ai miei studenti cos'è un LED?"

**Cosa Galileo risponderebbe oggi**: Un'analogia per bambini ("LED = rubinetto con luce") con tono entusiasta da animatore estivo.

**Cosa un insegnante HA BISOGNO di sentirsi dire**:
1. *"Non preoccuparti se l'elettronica è nuova per te — ti spiego tutto quello che serve"*
2. *"Il LED è un componente che emette luce quando la corrente lo attraversa. Per spiegarlo ai tuoi studenti, inizia così: mostra l'esperimento 6.1, fallo partire, e chiedi 'Cosa succede se giro il LED al contrario?'"*
3. *"Errore comune: il 70% degli studenti confonde anodo e catodo. Quando fai la demo, enfatizza che il gambo lungo è il + (positivo)"*
4. *"Tempo necessario: 15 minuti. Materiale: kit Vol1 + proiettore. Attività follow-up: Quiz in-app automatico"*

**Questo gap è LA ragione per cui un insegnante non adotterebbe ELAB.**

---

## 1.4 Performance — L'Insegnante sul Proiettore in Classe

| Scenario | Tempo | Verdetto |
|----------|-------|----------|
| Primo caricamento (WiFi 10 Mbps) | **4-6 secondi** | ⚠️ Accettabile ma con flash font |
| Primo caricamento (WiFi 5 Mbps scuola) | **6-10 secondi** | ❌ Troppo lento per demo live |
| Caricamento esperimento (dopo primo visit) | **<1 secondo** | ✅ Eccellente |
| Simulazione circuito semplice (LED) | **60 FPS** | ✅ Fluido |
| Simulazione circuito complesso (15+ componenti) | **30-50 FPS** | ⚠️ Lag visibile su hardware vecchio |
| Galileo text response | **6-8 secondi** | ⚠️ L'insegnante aspetta davanti alla classe |
| Galileo vision response | **12-30 secondi** | ❌ Inaccettabile per demo live |

### Colli di bottiglia performance
1. **Immagini mascotte non ottimizzate**: `robot_thinking.png` (2.6 MB) + `robot_excited.png` (1.9 MB) = **4.5 MB di PNG** — in WebP sarebbero 600 KB totali
2. **Font da Google CDN**: School WiFi spesso throttla Google → 2-5s di font swap
3. **Nessun Service Worker**: WiFi scuola cade durante la lezione → sito completamente inaccessibile
4. **Nessun caching offline**: Il prof non può pre-caricare la lezione a casa

### Cosa significa per la vendita
Un dirigente scolastico che vede una demo su proiettore con 8 secondi di caricamento e font che tremolano pensa: *"Questo non funziona"*. La prima impressione è tutto. **Le performance non sono un nice-to-have, sono il biglietto da visita.**

---

## 1.5 Usabilità del Simulatore — Per Chi Non Sa Nulla

| Aspetto | Score | Dettaglio |
|---------|-------|-----------|
| Selezione esperimento | **9/10** | Volume → Capitolo → Esperimento. Intuitivo, colorato, badge chiari |
| Montaggio guidato ("Passo Passo") | **9/10** | Ogni click piazza un componente nella posizione esatta del libro |
| Montaggio libero ("Già Montato") | **8/10** | Circuito appare pre-montato. L'insegnante preme Play. Funziona |
| Toolbar | **7/10** | Tanti pulsanti. L'insegnante non sa quale serve. Fix S66 aiuta (overflow menu) |
| Wire routing | **8.5/10** | Curve Catmull-Rom belle. Ma l'insegnante non sa cos'è un wire |
| CircuitSolver output | **6/10** | Calcola V/I/R ma non spiega PERCHÉ quei valori |
| Errore circuito | **5/10** | "Cortocircuito rilevato" — e poi? L'insegnante non sa come fixarlo |
| Compilazione Arduino | **7/10** | Funziona, ma l'editor CodeMirror è intimidante per un non-tecnico |

### Score complessivo simulatore per insegnante inesperto: **7.5/10**

Il simulatore è tecnicamente eccellente. Ma manca il layer di **spiegazione umana** su PERCHÉ le cose succedono. L'insegnante preme Play, il LED si accende, e pensa: *"OK, e adesso? Cosa dico alla classe?"*

---

## 1.6 Architettura Tecnica — Riepilogo (Stesso di v1 con priorità aggiornate)

| Layer | Score tecnico | Score per insegnante | Gap |
|-------|--------------|---------------------|-----|
| Frontend (React+Vite) | 7.5 | **8.0** | Code splitting eccellente, UI pulita |
| Backend (FastAPI/Render) | 6.0 | **5.0** | Singola istanza = se cade in classe, lezione rovinata |
| AI Galileo | 7.0 | **3.0** | **Il gap più grande**: non sa fare il teacher coach |
| Data (Notion API) | 4.0 | **4.0** | 30 studenti loggano insieme → rate limit → crash silenzioso |
| Automazione (n8n) | 3.5 | **3.5** | Email non funziona → prof non può resettare password |
| Simulazione | 8.5 | **7.5** | Eccellente tecnicamente, manca il "perché" pedagogico |
| Sicurezza | 9.8 | **9.8** | Nessun problema |

### Score Complessivo Piattaforma (Ottica Insegnante-Scuola)

| Metrica | Score |
|---------|-------|
| **Funzionalità tecnica** | 8.8/10 |
| **Usabilità per insegnante inesperto** | 5.5/10 |
| **Readiness per vendita alle scuole** | 4.5/10 |
| **Differenziazione competitiva** | 8.0/10 (nessun competitor ha Galileo + simulatore + kit fisico) |

> Il prodotto è tecnicamente maturo ma **non è ancora confezionato per la vendita scolastica**. La differenziazione c'è (Galileo + kit fisico è unico). Ma l'esperienza del primo contatto dell'insegnante è fragile.

---

# PART 2 — BOTTLENECK CRITICI (Ottica Insegnante-Scuola)

## B1: Galileo Non Sa Fare il Coach Didattico (SEVERITY: CRITICAL)

**Cosa**: Galileo è progettato per studenti 8-14 anni. Quando un insegnante chiede "Come insegno questo?", riceve una risposta da bambino, non una strategia didattica.

**Impatto sulla vendita**: L'insegnante prova Galileo, si sente trattato come un ragazzino, e pensa *"Questo non fa per me"*. L'orizzontalizzazione fallisce: solo i prof già tecnici useranno ELAB.

**Fix**: Creare un `teacher_mode` in Galileo. Quando l'utente è un insegnante (ruolo già nel sistema auth), il system prompt cambia:
- Tono: professionale, peer-to-peer, rispettoso dell'adulto
- Contenuto: strategie didattiche, errori comuni degli studenti, timing lezione, suggerimenti di presentazione
- Struttura: "Come insegnare X" → (1) Concetto chiave (2) Analogia consigliata (3) Esperimento da mostrare (4) Domanda da fare alla classe (5) Errore comune da prevenire

**Complessità fix**: MEDIO — nuovo file `teacher.yml` + routing basato su ruolo utente (già presente in auth)

## B2: Zero Onboarding per l'Insegnante (SEVERITY: CRITICAL)

**Cosa**: L'insegnante apre ELAB e vede 7 tab nella TeacherDashboard, un simulatore con 20+ pulsanti, e nessuna guida. Non esiste:
- Video introduttivo ("ELAB in 2 minuti")
- Modal di benvenuto ("Inizia da qui")
- Tutorial interattivo ("La tua prima lezione")
- Quick-start guide

**Impatto sulla vendita**: Il dirigente scolastico compra 30 licenze. 25 insegnanti aprono ELAB, non capiscono da dove iniziare, e non lo aprono mai più. Tasso di abbandono: stimato 70% senza onboarding.

**Fix**:
1. Modal "Welcome" al primo login insegnante (1 giorno)
2. "La tua prima lezione in 5 passi" — guided tutorial (3 giorni)
3. Video YouTube di 3 minuti embeddato nella landing (1 giorno produzione)

**Complessità fix**: BASSO — è UI/UX, non architettura

## B3: Nessun Lesson Planner (SEVERITY: HIGH)

**Cosa**: L'insegnante non può:
- Creare una sequenza di lezioni ("Lunedì: Esp 6.1-6.3, Mercoledì: Esp 7.1")
- Assegnare esperimenti agli studenti con scadenza
- Pianificare un percorso trimestrale
- Vedere "dove siamo" nel programma

**Impatto sull'orizzontalizzazione**: Senza un planner, ogni insegnante deve reinventare il percorso didattico. Questo è esattamente ciò che l'orizzontalizzazione dovrebbe ELIMINARE. ELAB deve dire: *"Ecco il percorso consigliato per il primo trimestre. 12 lezioni, 45 minuti ciascuna. Premi 'Inizia'."*

**Fix**: Aggiungere tab "Le mie Lezioni" nella TeacherDashboard con percorsi pre-costruiti + personalizzabili.

**Complessità fix**: MEDIO-ALTO — 5-7 giorni, richiede backend (salvataggio lezioni)

## B4: Performance Primo Caricamento (SEVERITY: HIGH)

**Cosa**: 6-10 secondi per caricare il sito su WiFi scolastico. Immagini mascotte 4.5 MB. Font da CDN Google lento in scuole.

**Impatto**: Demo davanti al dirigente scolastico — 8 secondi di schermo bianco = *"Questo non funziona bene"*. First impression distrutta.

**Fix**:
1. WebP mascotte: 4.5 MB → 600 KB (2 ore)
2. Font self-hosted invece di Google CDN (1 ora)
3. Service Worker per caching offline (2 giorni)

**Complessità fix**: BASSO — zero rischio

## B5: Galileo Troppo Lento per Demo Live (SEVERITY: HIGH)

**Cosa**: 6-8 secondi per risposta testo, 12-30 secondi per vision. L'insegnante sta davanti alla classe, chiede qualcosa a Galileo, e aspetta. 25 studenti guardano lo schermo vuoto.

**Impatto**: L'insegnante impara a NON usare Galileo in classe, usandolo solo come strumento di preparazione. Perde il 50% del valore del prodotto.

**Fix priorità**:
1. Streaming responses (mostra token man mano che arrivano) — 3 giorni
2. Pre-caching delle risposte più comuni per esperimento — 2 giorni
3. "Risposta rapida" mode: risposta più corta (100 token max) per demo live — 1 giorno

**Complessità fix**: MEDIO

## B6: Email Non Funziona (SEVERITY: HIGH per scuole)

**Cosa**: Password reset, inviti classe, codici licenza via email — tutti non verificati/non funzionanti.

**Impatto sulla vendita**: La segreteria della scuola distribuisce 30 licenze. Un insegnante dimentica la password. Non può resetarla. Chiama la segreteria. La segreteria chiama Andrea. Non scala.

**Fix**: Integrare Resend ($0/mese per 100 email/giorno). Verificare con test E2E reale.

**Complessità fix**: BASSO — 1-2 giorni

## B7: Storage Sessioni Effimero (SEVERITY: MEDIUM in ottica scuola)

**Cosa**: Le conversazioni Galileo spariscono ad ogni redeploy di Nanobot.

**Impatto**: Se l'insegnante prepara la lezione martedì sera chiedendo cose a Galileo, e mercoledì mattina i dati sono spariti per un deploy notturno, perde il contesto. Meno critico del B1-B6 perché l'insegnante non dipende dalla cronologia (gli studenti sì, eventualmente).

**Fix**: Redis/Upstash (invariato da v1 — $0, 2 giorni)

## B8: Notion Rate Limit in Classe (SEVERITY: MEDIUM)

**Cosa**: 30 studenti che loggano simultaneamente → 30+ chiamate Notion API → rate limit 3 req/s → timeout silenzioso per alcuni studenti.

**Impatto**: "Prof, a me non carica!" — 5 studenti su 30 non riescono ad accedere. L'insegnante perde 5 minuti di lezione per troubleshooting che non sa fare.

**Fix**: Retry con backoff su notionService.js (1 giorno). A medio termine: cache Redis dei dati utente per evitare hit su Notion.

---

# PART 3 — RESOURCE IMPACT RANKING (Ottica Insegnante-Scuola)

La domanda per ogni risorsa non è più "è tecnicamente valida?" ma: **"Aiuta un insegnante inesperto a usare ELAB con più fiducia e efficacia?"**

## HIGH IMPACT

### 1. n8n Workflows Library (52.5K ⭐)
| Attributo | Valore |
|-----------|--------|
| **Perché importa per la scuola** | ELAB usa già n8n. La libreria ha workflow pre-costruiti per **email transazionali** (B6), **reminder automatici**, e **notifiche**. Un insegnante che riceve una mail ben formattata ("La tua classe ha completato 80% degli esperimenti questa settimana!") si sente supportato. |
| **Uso concreto** | (1) Workflow email reset password → fix B6 immediato. (2) Workflow "report settimanale classe" via email a insegnante → engagement senza login. (3) Workflow reminder studente ("Non hai fatto esperimenti questa settimana!") |
| **Effort** | 1-2 giorni per workflow |
| **Rischio** | Basso — import JSON in n8n esistente |
| **Impatto sull'insegnante** | L'insegnante riceve informazioni senza dover aprire la dashboard. ELAB lavora per lui. |

### 2. MCP Memory Service (1.4K ⭐)
| Attributo | Valore |
|-----------|--------|
| **Perché importa per la scuola** | Con memoria persistente, Galileo può dire all'insegnante: *"La settimana scorsa hai spiegato i resistori. Oggi ti consiglio il capitolo sui circuiti in serie — è la naturale continuazione"*. Senza memoria, ogni sessione riparte da zero e l'insegnante deve ricordarsi da solo dove è arrivato. |
| **Uso concreto** | Memoria per insegnante: percorso didattico, punti deboli degli studenti, esperimenti già spiegati. Galileo diventa un ASSISTENTE CONTINUATIVO, non un chatbot usa-e-getta. |
| **Effort** | 3-5 giorni |
| **Rischio** | Medio — +100 MB Docker, serve persistent volume ($1/mo) |
| **Impatto sull'insegnante** | Trasformativo. L'insegnante sente che Galileo "lo conosce" e sa dove sono i suoi studenti. |

### 3. Graphiti (23.3K ⭐)
| Attributo | Valore |
|-----------|--------|
| **Perché importa per la scuola** | Knowledge graph temporale per tracciare il percorso di apprendimento degli studenti nel tempo. L'insegnante può dire: *"Mostrami cosa hanno capito i miei studenti del capitolo 6"* e Galileo interroga il grafo. |
| **Uso concreto** | Grafo studente: nodi = concetti (LED, Ohm, serie/parallelo), archi = "ha capito dopo Esp 6.3". Query: "Quali studenti non hanno ancora afferrato la legge di Ohm?" → lista nomi. |
| **Effort** | 5-7 giorni (Neo4j/Kuzu + integrazione) |
| **Rischio** | Alto — infrastruttura aggiuntiva (Neo4j free tier limitato). Considerare fase 2 dopo MCP Memory. |
| **Impatto sull'insegnante** | Alto a lungo termine. Permette report intelligenti tipo: "Il 60% della classe ha capito i LED ma solo il 30% i resistori → dedica la prossima lezione ai resistori". |

## MEDIUM IMPACT

### 4. Claude Code Toolkit (629 ⭐)
| **Perché** | Accelera lo sviluppo di ELAB (solo sviluppatore: Andrea Marro). Hooks pre-commit, audit automatici, workflow repeatable = meno bug in produzione = meno crash durante le lezioni. |
| **Effort** | 1 giorno |
| **Impatto sull'insegnante** | Indiretto — meno bug, deploy più sicuri |

### 5. MemoryGraph (160 ⭐)
| **Perché** | Alternativa più leggera a Graphiti (Python + SQLite, nessuna infrastruttura extra). Relazioni "ha imparato", "è simile a", "causa" — adatte al tracking didattico. |
| **Effort** | 2-3 giorni |
| **Rischio** | 160 stelle = progetto piccolo, rischio abbandono |
| **Impatto** | Buon plan B se Graphiti è troppo pesante |

### 6. AutoMem MCP (39 ⭐)
| **Perché** | "Learning preference tracking" si adatta a: "Questo insegnante preferisce analogie visive", "Questa classe risponde meglio ai quiz che ai testi lunghi". |
| **Effort** | 4-5 giorni |
| **Rischio** | Infrastruttura pesante (FalkorDB + Qdrant), star count basso |
| **Impatto** | Medio — MCP Memory Service (#2) copre la stessa area con meno complessità |

### 7. Ruflo (18.7K ⭐)
| **Perché** | Token optimization (30-50% riduzione) e orchestrazione multi-agente. Utile SOLO quando ELAB scala a centinaia di scuole e i costi API diventano significativi. |
| **Effort** | 10-15 giorni (rewrite parziale) |
| **Rischio** | Over-engineering per la scala attuale |
| **Impatto** | Basso oggi, potenzialmente alto a 500+ DAU |

## LOW IMPACT (per l'ottica scuola)

### 8. RAG CLI (30 ⭐)
| **Perché LOW** | ELAB ha già la knowledge base statica. Un insegnante non cerca nella documentazione — chiede a Galileo. RAG sarebbe invisibile all'utente finale. |

### 9. Sim Studio (26.8K ⭐)
| **Perché LOW** | Workflow builder per AI. ELAB non ne ha bisogno — ha già 4 specialist che funzionano. Risolve un problema che non esiste per gli insegnanti. |

### 10. Advanced Memory MCP (6 ⭐)
| **Perché LOW** | 6 stelle, enterprise features non necessarie. MCP Memory Service è superiore in tutto. |

### 11. Awesome Claude Plugins (834 plugin)
| **Perché LOW** | Catalogo di referenze, nessun valore diretto per insegnanti. |

### 12. ToolSDK MCP Registry (166 ⭐)
| **Perché LOW** | Registry di server MCP — utile per sviluppatori, invisibile per insegnanti. |

---

# PART 4 — TOP 5 ARCHITECTURE IMPROVEMENTS (30-60 Giorni)

## Miglioramento 1: Galileo Teacher Mode (Settimana 1-2)
### Risolve: B1 (il gap più grande), Orizzontalizzazione
### PRIORITÀ ASSOLUTA

**Cosa**: Creare un `teacher.yml` specialist prompt che si attiva quando il ruolo utente è "teacher" (già presente nel sistema auth).

**Perché**: Senza questo, ELAB è un simulatore con un chatbot per bambini. Con questo, ELAB diventa l'**unica piattaforma che trasforma un prof di storia in un insegnante di elettronica**. Questo è il moat competitivo. Questo è ciò che si vende alle scuole.

**Come**:

1. **Nuovo file `nanobot/prompts/teacher.yml`**:
```yaml
identity: |
  Sei Galileo, l'assistente didattico di ELAB Tutor.
  Stai parlando con un INSEGNANTE, non con uno studente.
  Trattalo come un collega professionista che sta imparando qualcosa di nuovo.
  Il tuo obiettivo: renderlo sicuro di sé davanti alla classe.

tone: |
  - Professionale ma caldo — peer-to-peer, mai condiscendente
  - "Non preoccuparti se è la prima volta — ti guido io"
  - Mai usare tono da animatore estivo
  - Conciso: l'insegnante ha poco tempo per prepararsi

response_structure: |
  Quando l'insegnante chiede "Come spiego X?":
  1. CONCETTO CHIAVE (2 frasi: cos'è, perché importa)
  2. ANALOGIA CONSIGLIATA (da usare con la classe)
  3. ESPERIMENTO DA MOSTRARE (numero + link diretto)
  4. DOMANDA DA FARE ALLA CLASSE (engagement)
  5. ERRORE COMUNE ("Il 60% degli studenti pensa che...")
  6. TEMPO STIMATO (es. "15 minuti con montaggio, 10 senza")

classroom_tips: |
  Per ogni argomento, includi:
  - Come aprire la lezione (ice-breaker)
  - Come gestire la domanda "A cosa serve?"
  - Come passare dall'esperimento al concetto teorico
  - Come verificare la comprensione (quiz in-app)
```

2. **Routing in `server.py`**:
```python
def get_specialist(intent, user_role):
    if user_role == 'teacher':
        return load_prompt('teacher.yml')  # sempre teacher mode
    return load_prompt(f'{intent}.yml')    # studente: specialist routing
```

3. **Passare il ruolo utente da frontend a backend**: Aggiungere `userRole` nel payload `/chat` (già disponibile in AuthContext).

**Costo**: $0
**Effort**: 3-4 giorni (prompt design + routing + test)
**Rischio**: BASSO — aggiunge un path, non modifica quelli esistenti
**Impatto sulla vendita**: **ENORME** — questo è ciò che differenzia ELAB da qualunque altro simulatore

## Miglioramento 2: Onboarding Insegnante + Quick Start (Settimana 1)
### Risolve: B2 (zero onboarding)

**Cosa**: Modal di benvenuto al primo login + "La tua prima lezione" guided tour.

**Perché**: Il 70% degli insegnanti che comprano un software didattico lo abbandonano se non capiscono come usarlo in 5 minuti. L'onboarding non è UX — è **retention**.

**Come**:
1. **Welcome Modal** (primo login insegnante):
   - "Benvenuto in ELAB! Ecco cosa puoi fare:"
   - 3 card: "Prepara una lezione" / "Esplora il simulatore" / "Chiedi a Galileo"
   - Pulsante "Inizia il tutorial" → guided tour

2. **"La Tua Prima Lezione" — Tutorial 5 step**:
   - Step 1: "Scegli il Volume 1, Capitolo 6, Esperimento 1"
   - Step 2: "Premi 'Già Montato' — il circuito appare pronto"
   - Step 3: "Premi ▶ Play — il LED si accende!"
   - Step 4: "Chiedi a Galileo: 'Come spiego questo alla classe?'" (RICHIEDE Galileo Teacher Mode)
   - Step 5: "Complimenti! Sei pronto per la tua prima lezione"

3. **"Percorsi Consigliati"** — 3 percorsi pre-costruiti:
   - "Il mio primo trimestre con Vol1" (12 lezioni, 45 min)
   - "Workshop intensivo Vol1" (6 lezioni, 90 min)
   - "Introduzione Express" (3 lezioni, 60 min)

**Costo**: $0
**Effort**: 3-4 giorni (UI + percorsi pre-costruiti)
**Rischio**: ZERO
**Impatto sulla vendita**: Altissimo — la differenza tra "ho provato e funziona" e "ho provato e non ho capito"

## Miglioramento 3: Performance — Immagini + Font + Caching (Settimana 1)
### Risolve: B4 (performance primo caricamento)

**Cosa**: Ottimizzare il primo caricamento per proiettori scolastici.

**Perché**: La demo davanti al dirigente scolastico deve funzionare IMMEDIATAMENTE. 8 secondi di caricamento = vendita persa.

**Come**:
1. **Immagini WebP** (2 ore):
   - `robot_thinking.png`: 2.6 MB → ~250 KB WebP
   - `robot_excited.png`: 1.9 MB → ~200 KB WebP
   - `logo-omaric-elab.png`: 1 MB → ~150 KB WebP
   - Tag `<picture>` con fallback PNG per browser vecchi

2. **Font self-hosted** (1 ora):
   - Scaricare Oswald, Open Sans, Fira Code in `/public/fonts/`
   - Eliminare dipendenza da Google CDN (spesso lento nelle scuole)
   - `@font-face` con `font-display: swap` + subset solo caratteri italiani

3. **Service Worker base** (2 giorni):
   - Cache statica: CSS, JS bundles, font, immagini mascotte
   - L'insegnante carica ELAB a casa la sera prima → in classe funziona anche con WiFi instabile
   - Offline fallback: pagina "Connessione interrotta — i dati salvati sono al sicuro"

**Costo**: $0
**Effort**: 2-3 giorni
**Rischio**: ZERO
**Impatto**: Primo caricamento da 6-10s → 2-4s. Demo davanti al dirigente impeccabile.

## Miglioramento 4: Email Funzionante + Report Settimanale (Settimana 2-3)
### Risolve: B6 (email rotta) + Engagement insegnante

**Cosa**: (A) Far funzionare le email transazionali. (B) Aggiungere report settimanale automatico via email.

**Perché**:
- (A) Senza reset password, la segreteria scolastica diventa help desk. Non scala.
- (B) Un insegnante che riceve ogni venerdì un'email tipo "Questa settimana la tua classe ha completato 12 esperimenti. 3 studenti hanno bisogno di attenzione." si sente supportato e continua ad usare ELAB.

**Come**:
1. **Resend** (provider email): $0 per 100 email/giorno. API semplice. Setup 2 ore.
2. **Template email**:
   - Reset password (già scritto, solo da collegare)
   - Invito classe (nuovo template)
   - Report settimanale (n8n workflow → Resend API)
3. **n8n workflow "Report Settimanale"**: Query Notion per dati classe → template HTML → invio via Resend

**Costo**: $0 (100 email/giorno gratis)
**Effort**: 3-4 giorni
**Rischio**: Basso
**Impatto sulla vendita**: L'insegnante riceve valore da ELAB anche senza aprirlo. Passive engagement = retention.

## Miglioramento 5: Streaming Risposte Galileo (Settimana 3-4)
### Risolve: B5 (Galileo troppo lento per demo live)

**Cosa**: Mostrare le risposte di Galileo token per token (streaming), invece di aspettare la risposta completa.

**Perché**: L'insegnante chiede qualcosa a Galileo davanti alla classe. Oggi: 6-8 secondi di "Galileo sta pensando..." → risposta completa. Con streaming: testo che appare immediatamente, parola per parola. L'insegnante e la classe leggono insieme. L'attesa percepita passa da 8 secondi a 0 secondi.

**Come**:
1. **Backend**: FastAPI già supporta `StreamingResponse`. Modificare `/chat` per restituire SSE (Server-Sent Events) con token incrementali.
2. **Frontend**: `ChatOverlay.jsx` legge lo stream con `EventSource` o `fetch` + `ReadableStream`. Ogni chunk viene appendato al messaggio corrente.
3. **Action tag buffering**: Le `[AZIONE:play]` devono essere bufferizzate e eseguite solo quando il tag è completo (non a metà streaming).

**Costo**: $0
**Effort**: 4-5 giorni (backend SSE + frontend reader + action tag buffer + test)
**Rischio**: MEDIO — il buffering delle action tag è delicato. Richiede test accurati.
**Impatto sull'insegnante**: Galileo sembra istantaneo. L'insegnante lo usa con fiducia davanti alla classe.

---

# SUMMARY TABLE

| # | Miglioramento | Risolve | Effort | Costo | Impatto Scuola |
|---|---------------|---------|--------|-------|----------------|
| 1 | **Galileo Teacher Mode** | B1 | 3-4 giorni | $0 | **CRITICO** — senza questo, il prodotto non si vende |
| 2 | **Onboarding Insegnante** | B2 | 3-4 giorni | $0 | **CRITICO** — senza questo, il 70% abbandona |
| 3 | **Performance (WebP, font, SW)** | B4 | 2-3 giorni | $0 | **ALTO** — demo impeccabile = vendita chiusa |
| 4 | **Email + Report Settimanale** | B6 | 3-4 giorni | $0 | **ALTO** — engagement passivo = retention |
| 5 | **Streaming Galileo** | B5 | 4-5 giorni | $0 | **ALTO** — Galileo istantaneo = usato in classe |

**Effort totale**: ~16-20 giorni
**Costo infrastruttura aggiuntivo**: $0
**Score piattaforma atteso dopo implementazione**: 5.5/10 → **8.5/10** (ottica insegnante)

---

# EXECUTIVE RECOMMENDATION

## Il Problema Reale

ELAB Tutor è un prodotto tecnicamente impressionante (69 esperimenti, simulatore Union-Find, AI multi-provider, 995/995 test pass) costruito da un ingegnere per altri ingegneri.

Ma **non è confezionato per chi deve comprarlo e usarlo**: dirigenti scolastici e insegnanti non tecnici.

Il simulatore funziona. Il circuit solver è eccellente. I 21 componenti SVG sono bellissimi. Il quiz system è completo. Ma quando un prof di lettere apre ELAB per la prima volta, vede un software tecnico senza guida, un chatbot che lo tratta come un bambino, e nessun aiuto su come usare tutto questo in classe.

## La Soluzione

**Due settimane di lavoro cambiano tutto:**

1. **Galileo Teacher Mode** trasforma un chatbot-per-bambini nel **primo AI teaching assistant per l'elettronica in Italia**. Nessun competitor ha questo. Nessuno. È il moat.

2. **Onboarding** trasforma "software complicato" in "facile come aprire YouTube".

3. **Performance** trasforma "lento sul proiettore" in "demo perfetta davanti al collegio docenti".

4. **Email/Report** trasforma "lo apro quando mi ricordo" in "ELAB mi cerca ogni venerdì con i risultati".

5. **Streaming** trasforma "aspetto 8 secondi imbarazzanti" in "Galileo risponde subito, la classe legge insieme".

## Il Messaggio di Vendita (dopo i 5 fix)

> *"ELAB Tutor è l'unica piattaforma che trasforma qualunque insegnante in un docente di elettronica. Apri il simulatore, chiedi a Galileo come spiegare un argomento, e lui ti guida passo passo — come un collega esperto al tuo fianco. Anche se non hai mai visto un circuito in vita tua."*

Questo messaggio oggi non è credibile. Dopo i 5 miglioramenti, lo è.

---

## Nota sulle risorse della v1

Le raccomandazioni infrastrutturali della v1 (Redis sessions, CI/CD, cascade token) restano valide come **fase 2** (giorni 30-60). Ma la priorità è chiara:

**Fase 1 (giorni 1-20)**: Miglioramenti 1-5 di questa analisi → il prodotto si vende
**Fase 2 (giorni 21-40)**: Redis + CI/CD → il prodotto non crasha
**Fase 3 (giorni 41-60)**: Student memory + learning graphs → il prodotto evolve

L'ordine è fondamentale: prima vendi, poi stabilizza, poi innova.

---

*CTO Analysis v2 — Ottica Insegnante/Scuola*
*Generated by Claude Opus 4.6 — Session 69, 04/03/2026*
*Basato su: PDR S68, CODE-AUDIT S68, analisi teacher-facing features, prompt audit Galileo, performance audit classroom*
