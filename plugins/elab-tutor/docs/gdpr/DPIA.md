# Valutazione d'Impatto sulla Protezione dei Dati (DPIA)

## ELAB Tutor — Piattaforma Educativa STEM

| Campo | Valore |
|---|---|
| **Titolare del trattamento** | Andrea Marro / ELAB STEM, in partnership con Omaric Elettronica S.r.l. (Strambino, TO) |
| **DPO / Referente privacy** | Andrea Marro — privacy@elab-stem.com |
| **Data redazione** | 29 marzo 2026 |
| **Versione** | 1.0 |
| **Stato** | In vigore |
| **Prossima revisione** | 29 settembre 2026 (semestrale) |
| **Riferimenti normativi** | Reg. (UE) 2016/679 (GDPR), Art. 35; Linee Guida EDPB WP248 rev.01; D.Lgs. 196/2003 e s.m.i.; Provvedimento Garante Privacy 467/2018; Linee guida Garante per la scuola 2023 |

---

## Indice

1. [Descrizione del trattamento](#1-descrizione-del-trattamento)
2. [Necessita e proporzionalita](#2-necessita-e-proporzionalita)
3. [Dati personali trattati](#3-dati-personali-trattati)
4. [Flussi dati](#4-flussi-dati)
5. [Valutazione dei rischi](#5-valutazione-dei-rischi)
6. [Misure di sicurezza implementate](#6-misure-di-sicurezza-implementate)
7. [Misure da implementare (gap analysis)](#7-misure-da-implementare-gap-analysis)
8. [Consultazione preventiva](#8-consultazione-preventiva)
9. [Conclusione e piano d'azione](#9-conclusione-e-piano-dazione)

---

## 1. Descrizione del trattamento

### 1.1 Natura e finalita del trattamento

ELAB Tutor e una piattaforma educativa STEM per l'apprendimento dell'elettronica e della programmazione Arduino, destinata a studenti di eta compresa tra 8 e 14 anni. Il trattamento dei dati personali e strettamente funzionale all'erogazione del servizio educativo e comprende:

- **Simulatore di circuiti**: ambiente visuale interattivo con 67 esperimenti organizzati in 3 volumi didattici (38 + 18 + 11 esperimenti), che include un solver DC (KCL/MNA), emulazione CPU ATmega328p, editor codice, e componenti SVG interattivi.
- **Tutor AI "UNLIM" (Galileo)**: assistente pedagogico basato su intelligenza artificiale che guida gli studenti attraverso gli esperimenti con risposte in italiano, analogie adatte all'eta, e comandi attuabili sul simulatore.
- **Giochi didattici**: quattro modalita di gioco (Trova il Guasto, Prevedi e Spiega, Circuito Misterioso, Controlla Circuito) con tracciamento dei punteggi.
- **Teacher Dashboard**: pannello per docenti con gestione classi, studenti, e progressi.
- **Sistema di autenticazione**: registrazione e login con ruoli (studente, docente, admin).

### 1.2 Categorie di interessati

| Categoria | Eta tipica | Numerosita attesa | Note |
|---|---|---|---|
| **Studenti** | 8-14 anni | 1.000-50.000 (proiezione PNRR) | **Minori** - Art. 8 GDPR, tutela rafforzata |
| **Docenti** | 25-65 anni | 100-5.000 | Titolari di account con ruolo "teacher" |
| **Genitori/Tutori** | 25-65 anni | 1.000-50.000 | Consenso parentale per minori <16 anni |

### 1.3 Ambito del trattamento

- **Territoriale**: Italia, mercato scolastico (MePA - Mercato Elettronico della Pubblica Amministrazione).
- **Temporale**: anno scolastico, con conservazione dati per massimo 2 anni (730 giorni, come da `isDataExpired()` in `gdprService.js`).
- **Canale di distribuzione**: licenza annuale (500-1.000 EUR/anno) abbinata a kit hardware (75 EUR), vendita tramite MePA a cura di Davide Fagherazzi. Deadline fondi PNRR: 30/06/2026.

### 1.4 Obbligo di effettuare la DPIA

La presente DPIA e obbligatoria ai sensi dell'Art. 35, par. 1 e 3, del GDPR e del Provvedimento del Garante n. 467/2018 ("Elenco delle tipologie di trattamenti soggetti al requisito di una valutazione d'impatto sulla protezione dei dati"), in quanto il trattamento:

- Riguarda **dati di minori** (criterio 7 Linee Guida EDPB WP248);
- Comporta **valutazione o attribuzione di punteggio** (scoring didattico, criterio 1);
- Utilizza **nuove tecnologie** (AI generativa per tutor, criterio 8);
- E effettuato su **larga scala** nel contesto scolastico (criterio 5);
- Comporta un **trattamento sistematico** di dati relativi a soggetti vulnerabili (criterio 7).

La combinazione di almeno due criteri rende la DPIA obbligatoria.

---

## 2. Necessita e proporzionalita

### 2.1 Base giuridica del trattamento

Il trattamento si fonda sulle seguenti basi giuridiche, distinte per finalita:

| Finalita | Base giuridica | Articolo GDPR |
|---|---|---|
| Erogazione servizio educativo | Esecuzione del contratto (licenza scolastica) | Art. 6(1)(b) |
| Gestione account e autenticazione | Esecuzione del contratto | Art. 6(1)(b) |
| Tracciamento progressi didattici | Legittimo interesse del titolare (miglioramento didattico) + consenso parentale per minori | Art. 6(1)(f) + Art. 8 |
| Analytics anonimizzati | Consenso esplicito | Art. 6(1)(a) |
| Interazione con tutor AI | Esecuzione del contratto + consenso parentale | Art. 6(1)(b) + Art. 8 |
| Sicurezza della piattaforma | Legittimo interesse | Art. 6(1)(f) |

### 2.2 Consenso dei minori (Art. 8 GDPR)

Il GDPR, all'Art. 8, prevede che per i servizi della societa dell'informazione offerti direttamente a minori, il consenso sia lecito se il minore ha almeno 16 anni. Per minori sotto i 16 anni (soglia italiana ex D.Lgs. 101/2018, Art. 2-quinquies), il consenso deve essere prestato o autorizzato dal titolare della responsabilita genitoriale.

L'implementazione nel codice (`gdprService.js`, righe 282-332) prevede:
- Rilevazione dell'eta tramite `sessionStorage` (`elab_user_age`);
- Se eta < 16: stato `parental_required`, con invio email al genitore via webhook GDPR;
- Se eta < 13: applicazione aggiuntiva dei requisiti COPPA (funzione `isCOPPAApplicable()`);
- Verifica del consenso parentale tramite token (`verifyParentalConsent()`);
- Stato finale `parental_verified` solo dopo conferma del genitore.

### 2.3 Principio di minimizzazione (Art. 5(1)(c))

Il trattamento e limitato ai dati strettamente necessari:
- **Nessun dato biometrico** raccolto;
- **Nessun dato di categoria particolare** (Art. 9) trattato;
- **Pseudonimizzazione** degli ID utente tramite SHA-256 con salt (`pseudonymizeUserId()` in `gdprService.js`, righe 388-395);
- **Funzione di minimizzazione** esplicita (`minimizeData()` in `gdprService.js`, righe 373-381) che filtra i dati ai soli campi consentiti;
- **Device ID** generato localmente (`crypto.randomUUID()`) senza raccolta di fingerprint del dispositivo;
- **Chat**: le domande degli studenti sono troncate a 100 caratteri nel log locale (`logChatInteraction()` in `studentTracker.js`, riga 197).

### 2.4 Principio di limitazione della conservazione (Art. 5(1)(e))

- Dati locali (`localStorage`): retention massima 730 giorni (2 anni), verificata da `isDataExpired()`;
- Token di autenticazione: scadenza automatica con buffer di 1 minuto (`TOKEN_EXPIRY_BUFFER`);
- Session ID analytics: limitato alla sessione browser (`sessionStorage`);
- Backup server: eliminazione entro 30 giorni dalla richiesta di cancellazione (come comunicato nell'interfaccia `DataDeletion.jsx`).

---

## 3. Dati personali trattati

### 3.1 Tabella dati — localStorage

| Chiave | Dato | Cat. Art. 9 | Base giuridica | Finalita | Conservazione |
|---|---|---|---|---|---|
| `elab_device_id` | UUID dispositivo (crypto.randomUUID) | No | Art. 6(1)(b) | Identificazione pseudonima dell'utente | Fino a cancellazione manuale o clearLocalData() |
| `elab_student_name` | Nome visualizzato studente | No | Art. 6(1)(b) | Teacher Dashboard | Fino a cancellazione |
| `elab_auth_token` | Token HMAC (payload base64 + firma) | No | Art. 6(1)(b) | Autenticazione sessione | Scadenza automatica (refresh timer) |
| `elab_tutor_session` | ID sessione tutor (tutor-{timestamp}-{random}) | No | Art. 6(1)(b) | Continuita conversazione AI | Fino a cancellazione |
| `elab_consent_v2` | Stato consenso ('accepted'/'rejected') | No | Art. 6(1)(a) | Registro del consenso | Permanente |
| `elab_gdpr_consent` | Oggetto JSON consenso GDPR (status, timestamp, version, eta) | No | Art. 6(1)(c) | Prova del consenso (accountability) | Permanente |
| `elab_student_data` | Dati studente: sessioni, attivita (tipo+dettaglio), esperimenti (durata, completamento), punteggi gioco | No | Art. 6(1)(b) + Art. 8 | Tracciamento progresso didattico | 730 giorni |
| `elab_reflections` | Riflessioni dello studente (max 200) | No | Art. 6(1)(b) | Apprendimento riflessivo | 730 giorni |
| `elab_consent` | Legacy: stato consenso analytics ('accepted'/'rejected') | No | Art. 6(1)(a) | Consent gating analytics | Permanente |

### 3.2 Tabella dati — sessionStorage

| Chiave | Dato | Cat. Art. 9 | Base giuridica | Finalita | Conservazione |
|---|---|---|---|---|---|
| `elab-sim-session` | ID sessione simulatore (sim-{timestamp}-{random}) | No | Art. 6(1)(b) | Raggruppamento eventi analytics | Durata sessione browser |
| `elab_user_age` | Eta dichiarata dall'utente | No | Art. 6(1)(b) + Art. 8 | Determinazione soglia consenso parentale | Durata sessione browser |
| `elab_rate_minute` / `elab_rate_minute_start` | Contatore rate limiting chat (numero messaggi, timestamp inizio finestra) | No | Art. 6(1)(f) | Sicurezza: anti-abuse | Durata sessione browser |
| `elab_auth_ratelimit` | Stato rate limiting login (tentativi, lockout) | No | Art. 6(1)(f) | Sicurezza: anti-bruteforce | Durata sessione browser |
| `unlim_session` | ID sessione UNLIM per immagini | No | Art. 6(1)(b) | Continuita sessione AI vision | Durata sessione browser |

### 3.3 Dati raccolti in fase di registrazione (server-side via authService)

| Dato | Cat. Art. 9 | Base giuridica | Finalita | Note |
|---|---|---|---|---|
| Nome e cognome | No | Art. 6(1)(b) | Identificazione utente | Inviato al server auth |
| Email | No | Art. 6(1)(b) | Login, comunicazioni, recupero password | Minuscolo forzato |
| Password | No | Art. 6(1)(b) | Autenticazione | Min 8 char, 1 maiuscola, 1 numero, 1 speciale; hash server-side |
| Ruolo (student/teacher/admin) | No | Art. 6(1)(b) | Gestione permessi | |
| Tipo utente (family/school) | No | Art. 6(1)(b) | Differenziazione licenza | |
| Username (studenti) | No | Art. 6(1)(b) | Login semplificato per minori | Creato dal docente |
| Codice classe (6 caratteri) | No | Art. 6(1)(b) | Associazione studente-classe | |

### 3.4 Dati inviati al tutor AI (per ogni interazione chat)

| Dato | Cat. Art. 9 | Base giuridica | Finalita |
|---|---|---|---|
| Messaggio dello studente (testo libero) | No* | Art. 6(1)(b) | Risposta pedagogica personalizzata |
| sessionId (tutor-{ts}-{random}) | No | Art. 6(1)(b) | Continuita conversazione |
| experimentId (es. v1-cap3-esp1) | No | Art. 6(1)(b) | Contestualizzazione risposta |
| circuitState (oggetto JSON stato circuito) | No | Art. 6(1)(b) | Diagnosi e suggerimenti circuitali |
| simulatorContext (contesto simulatore) | No | Art. 6(1)(b) | Arricchimento risposta |
| images (array base64 + mimeType) | No* | Art. 6(1)(b) | Analisi visuale lavagna/circuito |

*Nota: il testo libero e le immagini potrebbero contenere incidentalmente dati personali (es. foto con volti, nomi nel testo). E attivo un filtro di moderazione contenuti (`isMessageBlocked()`) e un filtro di sicurezza AI (`filterAIResponse()`) per mitigare questo rischio.

### 3.5 Dati analytics (inviati SOLO con consenso)

Nove tipologie di eventi, inviati tramite `sendAnalyticsEvent()` in `AnalyticsWebhook.js`:

| Evento | Dati inclusi | Cat. Art. 9 |
|---|---|---|
| `experiment_loaded` | experimentId, timestamp, sessionId | No |
| `simulation_started` | timestamp, sessionId | No |
| `simulation_paused` | timestamp, sessionId | No |
| `simulation_reset` | timestamp, sessionId | No |
| `component_interacted` | componentId, action, timestamp, sessionId | No |
| `code_viewed` | timestamp, sessionId | No |
| `serial_used` | timestamp, sessionId | No |
| `volume_selected` | volumeId, timestamp, sessionId | No |
| `simulator_error` | errorDetails, timestamp, sessionId | No |

Tutti gli eventi sono inviati in modalita **fire-and-forget** (`navigator.sendBeacon` o `fetch` con `keepalive: true`) e **non contengono identificativi persistenti dell'utente** (solo il sessionId di sessione browser, non riconducibile all'identita).

---

## 4. Flussi dati

### 4.1 Diagramma dei flussi

```
BROWSER (client)
  |
  |-- [1] Chat AI ---------> VITE_N8N_CHAT_URL (n8n webhook, Hostinger)
  |                              --> Anthropic API (Claude) [US]
  |
  |-- [2] Nanobot ----------> VITE_NANOBOT_URL (Render.com) [EU/US]
  |                              --> Gemini API (Google) [US]
  |
  |-- [3] Analytics --------> VITE_ANALYTICS_WEBHOOK (n8n, Hostinger)
  |                              [SOLO con consenso]
  |
  |-- [4] Auth -------------> VITE_AUTH_URL (Netlify Functions)
  |                              --> Notion API (database utenti) [US]
  |
  |-- [5] Compilazione -----> VITE_COMPILE_URL (server standalone)
  |                              [Solo codice Arduino, no dati personali]
  |
  |-- [6] GDPR webhook -----> VITE_N8N_GDPR_URL (n8n, Hostinger)
  |                              --> Notion API [US]
  |
  |-- [7] Local (opz.) -----> localhost:8000 (Ollama locale)
  |                              [100% offline, nessun dato esce]
  |
  |-- [8] localStorage -----> Solo browser locale
  |-- [9] sessionStorage ----> Solo sessione browser corrente
```

### 4.2 Dettaglio endpoint e localizzazione

| # | Endpoint (env var) | Provider hosting | Localizzazione server | Dati trasferiti | Trasferimento extra-UE |
|---|---|---|---|---|---|
| 1 | `VITE_N8N_CHAT_URL` | Hostinger (n8n self-hosted) | EU (Lituania) | Messaggio studente, sessionId, immagini base64, experimentId | Si: n8n inoltra ad Anthropic API (US) |
| 2 | `VITE_NANOBOT_URL` | Render.com | EU (Francoforte) / US (Oregon) | Messaggio, sessionId, circuitState, experimentId, immagini | Si: nanobot puo usare Gemini API (US) |
| 3 | `VITE_ANALYTICS_WEBHOOK` | Hostinger (n8n) | EU (Lituania) | Evento anonimizzato, sessionId di sessione, timestamp | No |
| 4 | `VITE_AUTH_URL` | Netlify Functions | US (AWS) | Nome, email, password (hash), ruolo | Si: Netlify e Notion API in US |
| 5 | `VITE_COMPILE_URL` | Server dedicato | EU | Solo codice sorgente Arduino | No (nessun dato personale) |
| 6 | `VITE_N8N_GDPR_URL` | Hostinger (n8n) | EU (Lituania) | userId, azione GDPR, timestamp | Si: Notion API per archiviazione |
| 7 | `localhost:8000` | Locale (Ollama) | Locale (nessun trasferimento) | Messaggio, circuitState | No |

### 4.3 Trasferimenti extra-UE (Capo V GDPR, Artt. 44-49)

I seguenti trasferimenti verso paesi terzi (USA) sono identificati:

| Destinatario | Paese | Meccanismo di trasferimento | Dati trasferiti |
|---|---|---|---|
| **Anthropic** (Claude API) | USA | Standard Contractual Clauses (SCCs) + DPF certification | Messaggi studenti, contesto esperimento |
| **Google** (Gemini API) | USA | SCCs + DPF certification | Messaggi studenti, immagini |
| **Netlify** (Auth Functions) | USA | SCCs + DPF certification | Credenziali utente, profili |
| **Notion** (Database) | USA | SCCs + DPF certification | Profili utente, classi, licenze, log GDPR |
| **Render.com** (Nanobot) | USA/EU | SCCs (se instanza US) | Messaggi, circuitState |

**Nota critica**: la Corte di Giustizia UE nella sentenza Schrems II (C-311/18) ha invalidato il Privacy Shield. Il Data Privacy Framework (DPF) adottato dalla Commissione UE il 10/07/2023 (Decisione di adeguatezza C(2023) 4745) e attualmente in vigore per trasferimenti verso aziende US autocertificate. Occorre verificare periodicamente la validita del DPF e la certificazione dei fornitori.

---

## 5. Valutazione dei rischi

### 5.1 Metodologia

Si adotta la matrice probabilita x impatto raccomandata dalle Linee Guida EDPB WP248, con scala a 4 livelli:

- **Probabilita**: Trascurabile (1), Bassa (2), Media (3), Alta (4)
- **Impatto**: Trascurabile (1), Basso (2), Medio (3), Alto (4)
- **Rischio** = Probabilita x Impatto: Basso (1-4), Medio (5-8), Alto (9-12), Critico (13-16)

### 5.2 Matrice dei rischi

| # | Rischio | Probabilita | Impatto | Rischio (PxI) | Livello | Misure mitigazione |
|---|---|---|---|---|---|---|
| R1 | **Data breach dati minori** — accesso non autorizzato ai dati in localStorage o durante il trasferimento | 2 (Bassa) | 4 (Alto) | 8 | **Medio** | HTTPS obbligatorio, token HMAC, dati locali pseudonimizzati, nessun dato sensibile Art. 9 |
| R2 | **Profilazione minori non autorizzata** — utilizzo dei dati di apprendimento per finalita diverse da quelle educative | 1 (Trascurabile) | 4 (Alto) | 4 | **Basso** | Minimizzazione dati, nessuna cessione a terzi, analytics solo con consenso, no advertising |
| R3 | **Trasferimento extra-UE non conforme** — invalidazione DPF o mancata sottoscrizione SCCs da parte dei fornitori | 2 (Bassa) | 3 (Medio) | 6 | **Medio** | Verifica periodica DPF, predisposizione fallback locale (Ollama), SCCs con tutti i provider |
| R4 | **Accesso non autorizzato ad account** — compromissione credenziali docente/admin | 2 (Bassa) | 3 (Medio) | 6 | **Medio** | Rate limiting (5 tentativi / 15 min lockout), password policy forte, token con scadenza |
| R5 | **Perdita dati localStorage** — cancellazione accidentale del browser | 3 (Media) | 2 (Basso) | 6 | **Medio** | Sync periodico con server (studentService), session recovery, backup lato server |
| R6 | **Contenuto inappropriato nel testo libero** — studente inserisce dati personali sensibili nel messaggio al tutor AI | 3 (Media) | 2 (Basso) | 6 | **Medio** | Content moderation (`isMessageBlocked()`), AI safety filter, troncamento log a 100 char, no persistenza messaggi lato client |
| R7 | **Immagini con dati personali** — foto della lavagna contengono volti o nomi | 2 (Bassa) | 3 (Medio) | 6 | **Medio** | Immagini non persistite lato client, elaborate in memoria, transit encryption (HTTPS) |
| R8 | **Computer scolastico condiviso** — accesso ai dati del precedente utente | 3 (Media) | 2 (Basso) | 6 | **Medio** | Session ID in sessionStorage (non persiste), funzione clearLocalData(), logout pulisce token |
| R9 | **Indisponibilita servizio** — downtime del tutor AI o del server auth durante le lezioni | 3 (Media) | 2 (Basso) | 6 | **Medio** | Fallback chain a 4 livelli (locale -> nanobot -> webhook -> knowledge base), simulatore funziona offline |
| R10 | **Mancato consenso parentale** — minore utilizza il servizio senza consenso del genitore | 2 (Bassa) | 3 (Medio) | 6 | **Medio** | Flusso consenso parentale implementato, verifica email genitore, banner eta-adattato |

### 5.3 Rischi residui

Dopo l'applicazione delle misure di mitigazione, nessun rischio raggiunge il livello "Critico" (>=13). I rischi residui piu significativi sono:

- **R1 (Data breach)**: rischio residuo **Medio** — mitigabile ulteriormente con crittografia localStorage e audit log (vedi Sezione 7);
- **R3 (Trasferimento extra-UE)**: rischio residuo **Medio** — dipendente dalla stabilita normativa del DPF; predisposto fallback locale.

---

## 6. Misure di sicurezza implementate

### 6.1 Misure tecniche (gia presenti nel codice)

| Misura | Implementazione | File sorgente | Art. GDPR |
|---|---|---|---|
| **Consent gating** | Gli analytics sono inviati SOLO se `localStorage.getItem('elab_consent') === 'accepted'`. Funzione `hasAnalyticsConsent()` verificata prima di ogni invio. | `AnalyticsWebhook.js:20-26` | Art. 6(1)(a), 7 |
| **Pseudonimizzazione SHA-256** | L'ID utente viene hashato con salt fisso (`elab-tutor-2026`) tramite `crypto.subtle.digest('SHA-256')`, troncato a 16 caratteri hex. Irreversibile. | `gdprService.js:388-395` | Art. 25(1), 32(1)(a) |
| **Rate limiting chat** | Intervallo minimo 3 secondi tra messaggi, massimo 10 messaggi/minuto. Contatori in `sessionStorage`. | `api.js:282-362` | Art. 32(1)(b) |
| **Rate limiting auth** | Massimo 5 tentativi login, poi lockout 15 minuti. Stato in `sessionStorage`. | `authService.js:60-99` | Art. 32(1)(b) |
| **Token HMAC con scadenza** | Token autenticazione con payload base64 + HMAC signature. Scadenza automatica con buffer 1 minuto. Auto-refresh 10 minuti prima della scadenza. | `authService.js:15-38, 349-381` | Art. 32(1)(b) |
| **Password policy** | Minimo 8 caratteri, 1 maiuscola, 1 numero, 1 carattere speciale. Validazione client-side e server-side. | `authService.js:327-341` | Art. 32(1)(b) |
| **Content moderation** | Funzione `isMessageBlocked()` che blocca messaggi inappropriati prima dell'invio al tutor AI. | `api.js:526-528` | Art. 25(2) |
| **AI safety filter** | Funzione `filterAIResponse()` che filtra le risposte dell'AI prima della visualizzazione. | `api.js:8` (import) | Art. 25(2) |
| **Cancellazione dati locale** | Funzione `clearLocalData()` che rimuove tutte le chiavi `elab_*` da localStorage e sessionStorage. | `gdprService.js:197-234` | Art. 17 |
| **Fire-and-forget analytics** | Analytics inviati con `navigator.sendBeacon` — non bloccano l'UI, non persistono, errori silenziosi. Nessun retry. | `AnalyticsWebhook.js:47-65` | Art. 25(2) |
| **Session ID effimero** | Il session ID analytics (`elab-sim-session`) e in `sessionStorage` — si cancella alla chiusura del tab. | `AnalyticsWebhook.js:71-78` | Art. 25(1) |
| **Diritto all'oblio (Art. 17)** | Componente `DataDeletion.jsx` con flusso a 3 step (motivo -> conferma "ELIMINA" -> password). Elimina dati locali + richiesta webhook backend. | `DataDeletion.jsx:22-252` | Art. 17 |
| **Diritto alla portabilita (Art. 20)** | Funzione `requestDataExport()` che richiede esportazione dati via webhook GDPR. | `gdprService.js:118-125` | Art. 20 |
| **Diritto alla rettifica (Art. 16)** | Funzione `requestDataCorrection()` via webhook GDPR. | `gdprService.js:159-166` | Art. 16 |
| **Revoca consenso (Art. 7(3))** | Funzione `revokeConsent()` che aggiorna stato locale e notifica il backend. | `gdprService.js:173-188` | Art. 7(3) |
| **Minimizzazione dati** | Funzione `minimizeData(data, allowedFields)` che filtra i dati ai soli campi esplicitamente consentiti. | `gdprService.js:373-381` | Art. 5(1)(c) |
| **Retention policy** | Funzione `isDataExpired(date, maxDays=730)` per verificare la scadenza dei dati (default 2 anni). | `gdprService.js:404-408` | Art. 5(1)(e) |
| **Consenso parentale** | Flusso completo: richiesta via email (`requestParentalConsent()`), verifica token (`verifyParentalConsent()`), stati intermedi tracciati. | `gdprService.js:287-332` | Art. 8 |
| **Banner consenso eta-adattato** | Testo semplificato per bambini ("biscottini"), nota COPPA per genitori, link privacy policy. | `ConsentBanner.jsx:87-129` | Art. 12(1), 8 |
| **HTTPS** | Tutti gli endpoint in produzione sono HTTPS (Vercel, Netlify, Render, n8n su Hostinger). | Configurazione env vars | Art. 32(1)(a) |
| **Troncamento log** | I messaggi chat nel log locale sono troncati a 100 caratteri. | `studentTracker.js:197` | Art. 5(1)(c) |
| **Fallback chain** | 4 livelli di fallback (locale -> nanobot -> webhook -> knowledge base) garantiscono funzionamento anche in caso di indisponibilita. | `api.js:559-567` | Art. 32(1)(b) |

### 6.2 Misure organizzative

| Misura | Stato |
|---|---|
| Formazione GDPR per il titolare | Completata (auto-formazione) |
| Registro dei trattamenti (Art. 30) | Presente (questo documento + architettura documentata) |
| Politica di gestione data breach (Art. 33-34) | Da formalizzare (vedi Sezione 7) |
| Contratti con responsabili del trattamento (Art. 28) | Da formalizzare (vedi Sezione 7) |
| Privacy policy pubblica | Accessibile da `/privacy` (link in ConsentBanner e DataDeletion) |
| Nomina DPO (Art. 37) | Non obbligatoria per micro-impresa; il titolare assume il ruolo di referente privacy |

---

## 7. Misure da implementare (gap analysis)

### 7.1 Gap critici (priorita alta)

| # | Gap | Rischio correlato | Art. GDPR | Azione richiesta | Tempistica |
|---|---|---|---|---|---|
| G1 | **DPA (Data Processing Agreement) con i fornitori cloud** | R3 | Art. 28 | Stipulare DPA con Anthropic, Google (Gemini), Notion, Netlify, Render, Hostinger. Verificare inclusione SCCs e/o adesione al DPF. | Entro 30/04/2026 |
| G2 | **Transfer Impact Assessment (TIA)** per ogni trasferimento extra-UE | R3 | Art. 46 | Effettuare TIA per ciascun fornitore US, valutando la legislazione locale (FISA 702, EO 12333) e le misure supplementari. | Entro 30/04/2026 |
| G3 | **Piano di risposta a data breach** | R1 | Art. 33-34 | Redigere procedura formale: rilevazione -> valutazione -> notifica Garante (72h) -> comunicazione interessati. Includere contatti (DPO, Garante, ISP). | Entro 31/05/2026 |
| G4 | **Crittografia dati localStorage** | R1, R8 | Art. 32(1)(a) | Implementare crittografia AES-256-GCM per le chiavi sensibili in localStorage (elab_student_data, elab_auth_token). Derivare la chiave da un segreto specifico del dispositivo. | Entro 30/06/2026 |

### 7.2 Gap importanti (priorita media)

| # | Gap | Rischio correlato | Art. GDPR | Azione richiesta | Tempistica |
|---|---|---|---|---|---|
| G5 | **Audit log server-side** | R1, R4 | Art. 5(2) | Implementare logging degli accessi (login/logout, modifiche profilo, richieste GDPR, accessi admin) con retention 1 anno. | Entro 30/06/2026 |
| G6 | **Cancellazione automatica dati scaduti** | R2 | Art. 5(1)(e) | Implementare un cron job che esegua `isDataExpired()` e cancelli i dati oltre i 730 giorni sia lato client (al login) che lato server. | Entro 30/06/2026 |
| G7 | **Informativa privacy completa Art. 13** | R10 | Art. 13 | Redigere informativa completa con tutti i campi obbligatori (identita titolare, finalita, base giuridica, destinatari, trasferimenti extra-UE, diritti, periodo conservazione, diritto reclamo Garante). Versione semplificata per minori. | Entro 30/04/2026 |
| G8 | **Verifica del consenso parentale rafforzata** | R10 | Art. 8 | Integrare metodo di verifica piu robusto del semplice click su email (es. firma digitale, documento identita genitore, o videochiamata). Il Garante italiano raccomanda "ragionevoli sforzi". | Entro 30/06/2026 |

### 7.3 Gap desiderabili (priorita bassa)

| # | Gap | Rischio correlato | Art. GDPR | Azione richiesta | Tempistica |
|---|---|---|---|---|---|
| G9 | **Cookie policy separata** | -- | Art. 13, Direttiva ePrivacy | Separare la cookie policy dall'informativa privacy, dettagliando i cookie tecnici e le chiavi localStorage/sessionStorage. | Entro Q3 2026 |
| G10 | **DPIA review automatizzata** | -- | Art. 35(11) | Implementare un processo di revisione della DPIA ad ogni modifica significativa del trattamento (nuovi endpoint, nuovi dati raccolti, nuovi fornitori). | Continuo |
| G11 | **Privacy dashboard per genitori** | R10 | Art. 12, 15 | Creare un pannello dove i genitori possano visualizzare i dati raccolti sul figlio, esportarli, o richiederne la cancellazione in autonomia. | Entro Q4 2026 |
| G12 | **Penetration test** | R1, R4 | Art. 32(1)(d) | Commissionare un penetration test su tutti gli endpoint esposti, con focus sull'autenticazione e i webhook. | Entro Q4 2026 |

---

## 8. Consultazione preventiva

### 8.1 Necessita di consultazione preventiva (Art. 36)

Ai sensi dell'Art. 36, par. 1, del GDPR, il titolare e tenuto a consultare l'autorita di controllo (Garante per la protezione dei dati personali) prima del trattamento qualora la DPIA indichi che il trattamento presenterebbe un **rischio elevato** in assenza di misure adottate dal titolare per attenuare il rischio.

**Valutazione**: sulla base dell'analisi condotta nella Sezione 5:

- Nessun rischio raggiunge il livello "Critico" (>=13);
- I rischi residui piu elevati sono di livello "Medio" (6-8);
- Sono gia implementate misure tecniche sostanziali (consent gating, pseudonimizzazione, rate limiting, flusso consenso parentale, diritto all'oblio);
- Sono pianificate misure aggiuntive (DPA, TIA, crittografia, audit log) con tempistiche definite.

**Conclusione**: allo stato attuale, **non si ritiene necessaria la consultazione preventiva** del Garante ai sensi dell'Art. 36. Tuttavia, considerata la sensibilita del trattamento (minori, AI generativa, contesto scolastico), si raccomanda:

1. Un **confronto informale** con il Garante tramite il servizio di consulenza (URP) per validare l'approccio;
2. La **notifica proattiva** in caso di data breach che coinvolga dati di minori, anche sotto la soglia dei 72 ore, data la vulnerabilita degli interessati;
3. Il **monitoraggio** delle Linee Guida del Garante sulle piattaforme educative e sull'AI nelle scuole (attese per il 2026-2027).

### 8.2 Registro presso il Garante

Il titolare, essendo una micro-impresa con meno di 250 dipendenti, non e obbligato alla tenuta del registro dei trattamenti ai sensi dell'Art. 30, par. 5, **salvo che** il trattamento presenti un rischio per i diritti e le liberta degli interessati, non sia occasionale, o includa categorie particolari di dati.

**Valutazione**: il trattamento di dati di minori in modo sistematico e non occasionale rende il registro dei trattamenti **obbligatorio**. La presente DPIA, unitamente alla documentazione tecnica del progetto, costituisce il registro di fatto. Si raccomanda la formalizzazione in un documento separato conforme all'Art. 30.

---

## 9. Conclusione e piano d'azione

### 9.1 Sintesi

La piattaforma ELAB Tutor presenta un **profilo di rischio complessivo Medio**, adeguato al contesto di utilizzo scolastico, con le seguenti considerazioni principali:

**Punti di forza**:
- Architettura privacy-by-design con consent gating, pseudonimizzazione, e minimizzazione dei dati implementati nel codice;
- Nessun dato di categoria particolare (Art. 9) trattato;
- Flusso completo per i diritti dell'interessato (cancellazione, portabilita, rettifica, revoca consenso);
- Consenso parentale implementato con stati intermedi e verifica;
- Analytics condizionati al consenso esplicito;
- Fallback locale (Ollama) che permette funzionamento senza trasferimenti dati.

**Punti di attenzione**:
- Trasferimenti extra-UE verso fornitori US (Anthropic, Google, Notion, Netlify) che richiedono DPA e TIA formali;
- Assenza di crittografia dei dati in localStorage (rischio su computer condivisi);
- Piano di risposta a data breach non ancora formalizzato;
- Informativa privacy Art. 13 da completare con tutti i requisiti formali.

### 9.2 Piano d'azione

| Priorita | Azione | Responsabile | Scadenza | Stato |
|---|---|---|---|---|
| **CRITICA** | G1: Stipulare DPA con tutti i fornitori cloud | Andrea Marro | 30/04/2026 | Da avviare |
| **CRITICA** | G2: Effettuare TIA per trasferimenti extra-UE | Andrea Marro | 30/04/2026 | Da avviare |
| **CRITICA** | G7: Redigere informativa privacy Art. 13 completa | Andrea Marro | 30/04/2026 | Da avviare |
| **ALTA** | G3: Redigere piano risposta data breach | Andrea Marro | 31/05/2026 | Da avviare |
| **ALTA** | G4: Implementare crittografia localStorage | Andrea Marro | 30/06/2026 | Da avviare |
| **ALTA** | G5: Implementare audit log server-side | Andrea Marro | 30/06/2026 | Da avviare |
| **MEDIA** | G6: Cancellazione automatica dati scaduti | Andrea Marro | 30/06/2026 | Da avviare |
| **MEDIA** | G8: Verifica consenso parentale rafforzata | Andrea Marro | 30/06/2026 | Da avviare |
| **BASSA** | G9: Cookie policy separata | Andrea Marro | Q3 2026 | Da avviare |
| **BASSA** | G10: DPIA review automatizzata | Andrea Marro | Continuo | Da avviare |
| **BASSA** | G11: Privacy dashboard genitori | Andrea Marro | Q4 2026 | Da avviare |
| **BASSA** | G12: Penetration test | Andrea Marro | Q4 2026 | Da avviare |

### 9.3 Revisione della DPIA

La presente DPIA sara riesaminata:

- **Ogni 6 mesi** (prossima revisione: 29/09/2026);
- **Ad ogni modifica significativa** del trattamento (nuovi endpoint, nuovi dati, nuovi fornitori, nuove funzionalita AI);
- **In caso di data breach** che coinvolga i dati trattati;
- **A seguito di provvedimenti** del Garante o sentenze della CGUE rilevanti.

### 9.4 Approvazione

| Ruolo | Nome | Data | Firma |
|---|---|---|---|
| Titolare del trattamento | Andrea Marro | 29/03/2026 | _________________ |
| Referente privacy | Andrea Marro | 29/03/2026 | _________________ |

---

*Documento redatto in conformita con le Linee Guida EDPB WP248 rev.01 sulla valutazione d'impatto (Art. 35 GDPR), il Provvedimento del Garante n. 467/2018, e la Delibera del Garante del 22/02/2018.*

*Tutti i riferimenti al codice sorgente si intendono relativi alla versione della piattaforma alla data di redazione (29/03/2026).*
