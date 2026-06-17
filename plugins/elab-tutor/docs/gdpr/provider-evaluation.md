# Valutazione Provider AI per Conformità GDPR — ELAB Tutor

**Versione:** 1.0
**Data:** 29 marzo 2026
**Autore:** Andrea Marro
**Contesto:** ELAB Tutor — piattaforma EdTech per bambini 8-14 anni, scuole italiane
**Scopo:** Valutazione comparativa dei provider AI per conformità GDPR, vendita su MePA (PA), deadline PNRR 30/06/2026

---

## Indice

1. [Contesto Normativo](#1-contesto-normativo)
2. [Stack Attuale ELAB Tutor](#2-stack-attuale-elab-tutor)
3. [Tabella Comparativa Provider](#3-tabella-comparativa-provider)
4. [Analisi Dettagliata per Provider](#4-analisi-dettagliata-per-provider)
5. [EU AI Act — Implicazioni per EdTech](#5-eu-ai-act--implicazioni-per-edtech)
6. [Linee Guida Garante Privacy — IA nelle Scuole](#6-linee-guida-garante-privacy--ia-nelle-scuole)
7. [Raccomandazioni Operative](#7-raccomandazioni-operative)
8. [Piano di Migrazione](#8-piano-di-migrazione)
9. [Fonti e Riferimenti](#9-fonti-e-riferimenti)

---

## 1. Contesto Normativo

### 1.1 GDPR e Minori (Art. 8)

Il Regolamento (UE) 2016/679, Art. 8, stabilisce che il trattamento di dati personali di minori di 16 anni (in Italia la soglia è abbassata a 14 anni dal D.Lgs. 101/2018) richiede il consenso del titolare della responsabilità genitoriale. ELAB Tutor, rivolgendosi a studenti di 8-14 anni, opera interamente nella fascia che richiede consenso parentale.

**Implicazioni pratiche:**
- Ogni provider AI che riceve dati degli studenti deve essere qualificato come **Responsabile del trattamento** (Art. 28 GDPR)
- È obbligatorio un **DPA** (Data Processing Agreement/Addendum) con ogni sub-responsabile
- I dati non possono essere utilizzati per finalità diverse (es. training dei modelli)
- La **minimizzazione dei dati** (Art. 5(1)(c)) è particolarmente stringente per i minori
- Il diritto alla cancellazione (Art. 17) deve essere esercitabile in modo semplice

### 1.2 Trasferimenti Extra-UE (Art. 44-49)

Il trasferimento di dati personali verso Paesi terzi (es. USA) è lecito solo se:
- Esiste una decisione di adeguatezza (EU-US Data Privacy Framework, luglio 2023)
- Sono in vigore Standard Contractual Clauses (SCCs) aggiornate
- Il Titolare ha condotto una Transfer Impact Assessment (TIA)

**Nota critica:** Il Data Privacy Framework (DPF) UE-USA è attualmente oggetto di contestazioni e la sua stabilità a lungo termine non è garantita. Le SCCs rimangono il meccanismo più solido.

### 1.3 Contesto PA e MePA

Per la vendita su MePA alla Pubblica Amministrazione italiana, il fornitore deve dimostrare:
- Conformità GDPR documentata
- DPIA (Valutazione d'Impatto sulla Protezione dei Dati) completata
- Registro dei trattamenti aggiornato (Art. 30)
- Nomina formale dei Responsabili del trattamento (Art. 28)
- Misure tecniche e organizzative adeguate (Art. 32)

---

## 2. Stack Attuale ELAB Tutor

| Servizio | URL/Endpoint | Server | Rischio GDPR |
|----------|-------------|--------|--------------|
| **Chat AI (Anthropic Claude)** | `VITE_N8N_CHAT_URL` → n8n Hostinger | Hostinger (Lituania UE) → Anthropic API (USA) | **ALTO** — dati studenti inviati a server USA |
| **Nanobot (Google Gemini)** | `VITE_NANOBOT_URL` → Render | Render (USA) → Google Gemini API (USA) | **ALTO** — doppio trasferimento extra-UE |
| **Ollama locale** | `VITE_LOCAL_API_URL` → localhost | Hardware scuola (locale) | **NULLO** — nessun trasferimento dati |
| **Compilazione Arduino** | `VITE_COMPILE_URL` → n8n Hostinger | Hostinger (Lituania UE) | **BASSO** — solo codice, no dati personali |
| **Analytics** | `VITE_ANALYTICS_WEBHOOK` → n8n | Hostinger (Lituania UE) | **MEDIO** — potenziali dati di utilizzo |
| **Auth** | `VITE_AUTH_URL` → Netlify | Netlify (USA/UE) | **MEDIO** — credenziali utente |
| **GDPR webhook** | `VITE_N8N_GDPR_URL` → n8n Hostinger | Hostinger (Lituania UE) | **BASSO** — gestione diritti interessati |

### Criticità immediate identificate:

1. **Anthropic Claude via n8n**: i prompt degli studenti (contenenti potenzialmente dati personali, domande sulla vita scolastica, interazioni personali) transitano verso server Anthropic negli USA
2. **Google Gemini via Render**: doppio hop USA (Render) → USA (Google), senza DPA specifico per uso educativo
3. **Render.com**: server negli USA, nessuna opzione di hosting EU per il piano gratuito
4. **Netlify Auth**: potenziale hosting USA per le funzioni serverless di autenticazione

---

## 3. Tabella Comparativa Provider

| Criterio | Anthropic (Claude) | Google (Gemini) | Mistral AI | Ollama (locale) |
|----------|-------------------|-----------------|------------|-----------------|
| **Sede legale** | USA (San Francisco) | USA (Mountain View) | **Francia (Parigi)** | N/A (open source) |
| **Server location** | USA (primari) | USA/UE (configurabile via Vertex AI) | **UE: Svezia (primario), Irlanda (backup)** | **Locale — hardware scuola** |
| **DPA disponibile** | Sì — incluso nei Commercial Terms | Sì — automatico per Workspace for Education | **Sì** — [legal.mistral.ai/terms/data-processing-addendum](https://legal.mistral.ai/terms/data-processing-addendum) | N/A — nessun trasferimento |
| **SCCs (Standard Contractual Clauses)** | Sì — Moduli 2 e 3, legge irlandese | Sì — integrato nei contratti EEA | **Sì** — per sub-responsabili extra-UE | N/A |
| **Certificazioni** | SOC 2 Type II, ISO 27001:2022, ISO 42001:2023 | SOC 1/2/3, ISO 27001, 27701, 27017, 27018, **42001** | SOC 2 Type II, ISO 27001, **ISO 27701** | N/A |
| **Art. 28 GDPR (nomina responsabile)** | Sì — via DPA nei Commercial Terms | Sì — via Google Cloud DPA | **Sì** — DPA dedicato | N/A — no data processor |
| **Data retention** | API: 7 giorni (opt-in 30gg); Consumer: fino a 5 anni | Vertex AI: zero retention configurabile; Free tier: dati usati per training | **La Plateforme API: non usati per training**; Le Chat: opt-in training default | **Zero** — tutto in locale |
| **Sub-processors list** | Disponibile su richiesta via Trust Center ([trust.anthropic.com](https://trust.anthropic.com)) | Disponibile pubblicamente | **Disponibile**: [trust.mistral.ai/subprocessors](https://trust.mistral.ai/subprocessors) | N/A |
| **Costo stimato (1000 richieste, ~500 token/richiesta)** | Haiku 4.5: ~$0.003/req → **~$3/1000 req** | Flash 2.5: ~$0.0008/req → **~$0.80/1000 req** | Small 3.1: ~$0.00007/req → **~$0.07/1000 req** | **€0** (solo costo hardware ~€800-1200 una tantum) |
| **Latenza media** | 200-500ms (API diretta) | 100-300ms (Flash) | 150-400ms (La Plateforme) | 500-2000ms (dipende da hardware) |
| **Qualità risposta EdTech bambini** | **Eccellente** — tono naturale, sicurezza superiore | **Buona** — multimodale, safety filters robusti | **Buona** — modelli europei, miglioramento rapido | **Variabile** — dipende dal modello (Qwen, Llama, Mistral) |
| **Supporto italiano** | Non disponibile | Disponibile per Workspace for Education | Non disponibile (francese/inglese) | Community |
| **EU AI Act readiness** | In corso — ISO 42001 ottenuta | **Avanzato** — ISO 42001 (primo al mondo), DPIA guide pubblicate | **Nativo UE** — soggetto direttamente al regolamento | N/A — responsabilità del deployer |
| **Adeguatezza per minori (Art. 8 GDPR)** | Richiede DPA commerciale + TIA | Workspace for Education: **COPPA/FERPA compliant** | Richiede configurazione enterprise (La Plateforme) | **Massima** — nessun dato esce dal dispositivo |
| **Soggetto a CLOUD Act USA** | **Sì** | **Sì** | **No** — giurisdizione francese | **No** |
| **Training con dati utente (API)** | **No** (API: mai) | **No** (Vertex AI/paid: mai) | **No** (La Plateforme API: mai) | **No** |
| **Zero Data Retention disponibile** | Sì — su approvazione enterprise | Sì — Vertex AI configurabile | Non documentato pubblicamente per API | **Intrinseco** |

---

## 4. Analisi Dettagliata per Provider

### 4.1 Anthropic Claude

**Stato attuale in ELAB:** Provider primario per UNLIM (chat AI Galileo), utilizzato via webhook n8n su Hostinger.

**Punti di forza GDPR:**
- DPA con SCCs incluso automaticamente nei Commercial Terms of Service
- API data retention ridotta a 7 giorni (settembre 2025)
- I dati API non sono mai utilizzati per il training
- Certificazioni solide: SOC 2 Type II, ISO 27001, ISO 42001
- Crittografia AES-256 at rest, TLS 1.2+ in transit
- Zero Data Retention disponibile per clienti enterprise

**Criticità GDPR:**
- **Sede USA** — soggetto al CLOUD Act e ad ordini di tribunali statunitensi
- Nessun data center in UE — tutti i dati transitano negli USA
- La lista sub-processors non è pubblicamente accessibile (richiede accesso al Trust Center)
- Cambio policy settembre 2025: account consumer (Free/Pro) → dati usati per training con retention fino a 5 anni
- Per uso con minori serve obbligatoriamente il tier **Commercial/API** (non Consumer)
- Transfer Impact Assessment (TIA) necessaria per giustificare il trasferimento verso USA

**Costo stimato per ELAB (budget €50/mese):**
- Con Haiku 4.5 ($1/M input, $5/M output): ~15.000-20.000 richieste/mese → adeguato
- Con Sonnet 4.6 ($3/M input, $15/M output): ~5.000-7.000 richieste/mese → limitato

**Riferimenti:**
- DPA: [support.claude.com/en/articles/7996862](https://support.claude.com/en/articles/7996862-how-do-i-view-and-sign-your-data-processing-addendum-dpa)
- Privacy Center: [privacy.claude.com](https://privacy.claude.com)
- Trust Center: [trust.anthropic.com](https://trust.anthropic.com)

---

### 4.2 Google Gemini

**Stato attuale in ELAB:** Provider secondario via Nanobot server su Render, proxy verso Gemini API.

**Punti di forza GDPR:**
- Certificazioni leader di settore: SOC 1/2/3, ISO 27001/27701/27017/27018/42001
- Google Workspace for Education: protezioni enterprise-grade **gratuite** per le scuole, con COPPA e FERPA compliance
- DPA automatico per utenti EEA
- Vertex AI consente di scegliere la regione UE per il data processing
- DPIA support guide pubblicata ufficialmente
- Google Ireland Ltd. come entità di riferimento per utenti EEA/UK

**Criticità GDPR:**
- **Il Nanobot server attuale su Render (USA) bypassa tutte le protezioni** — i dati transitano USA (Render) → USA (Gemini) senza DPA
- Il tier gratuito dell'API Gemini usa i dati per il training dei modelli
- La conformità GDPR piena richiede Vertex AI (Google Cloud) o Workspace for Education, non il semplice Gemini API
- Sede USA — soggetto al CLOUD Act
- Complessità architetturale: migrare a Vertex AI richiede account Google Cloud con billing

**Costo stimato per ELAB (budget €50/mese):**
- Gemini 2.5 Flash ($0.30/M input, $2.50/M output): ~100.000+ richieste/mese → **ottimo rapporto qualità/prezzo**
- Gemini 2.5 Flash-Lite ($0.10/M input, $0.40/M output): ~500.000+ richieste/mese → **eccezionale**
- Free tier: 1.000 richieste/giorno gratuite → utile per sviluppo

**Riferimenti:**
- Privacy Hub Gemini Apps: [support.google.com/gemini/answer/13594961](https://support.google.com/gemini/answer/13594961)
- Vertex AI Pricing: [cloud.google.com/vertex-ai/generative-ai/pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)
- DPIA Support: [workspace.google.com/blog/identity-and-security/dpia-support-for-google-workspace-with-gemini](https://workspace.google.com/blog/identity-and-security/dpia-support-for-google-workspace-with-gemini)
- Data Protection for Education: [blog.google/outreach-initiatives/education/gemini-enterprise-grade-data-protection/](https://blog.google/outreach-initiatives/education/gemini-enterprise-grade-data-protection/)

---

### 4.3 Mistral AI

**Stato attuale in ELAB:** Non utilizzato. Candidato ideale per migrazione EU-first.

**Punti di forza GDPR:**
- **Sede in Francia (Parigi)** — giurisdizione UE diretta, soggetto a CNIL
- **Non soggetto al CLOUD Act USA**
- Data center primari in **Svezia e Irlanda** (UE)
- DPA pubblicamente accessibile: [legal.mistral.ai/terms/data-processing-addendum](https://legal.mistral.ai/terms/data-processing-addendum)
- Lista sub-processors pubblica: [trust.mistral.ai/subprocessors](https://trust.mistral.ai/subprocessors)
- Certificazioni: SOC 2 Type II, ISO 27001, **ISO 27701** (privacy management)
- API La Plateforme: dati **mai usati per training**
- Modelli open-weight disponibili per self-hosting (massimo controllo)
- Audit on-site annuale previsto nel DPA
- SCCs per qualsiasi sub-processor extra-UE
- Infrastruttura propria Mistral Compute (18.000 GPU NVIDIA in Francia) dal giugno 2025

**Criticità GDPR:**
- USA processing aggiunto a febbraio 2025 per alcune funzionalità (disattivabile per enterprise)
- ISO 27001 era "in progress" fino a ottobre 2025 (ora completata)
- Le Chat (consumer) usa i dati per training per default (opt-out richiesto)
- Reclamo alla CNIL (febbraio 2025) per procedura di opt-out non conforme per utenti free
- Supporto clienti solo in francese/inglese — nessun supporto italiano dedicato
- Ecosistema meno maturo rispetto a Google/Anthropic

**Costo stimato per ELAB (budget €50/mese):**
- Mistral Small 3.1 ($0.03/M input, $0.11/M output): **1.000.000+ richieste/mese** → straordinariamente economico
- Mistral Medium 3 ($0.40/M input, $2.00/M output): ~50.000 richieste/mese → eccellente
- Mistral Nemo ($0.02/M input): modello più economico per task semplici

**Riferimenti:**
- DPA: [legal.mistral.ai/terms/data-processing-addendum](https://legal.mistral.ai/terms/data-processing-addendum)
- Privacy Policy: [legal.mistral.ai/terms/privacy-policy](https://legal.mistral.ai/terms/privacy-policy)
- Sub-processors: [trust.mistral.ai/subprocessors](https://trust.mistral.ai/subprocessors)
- Compliance Center: [help.mistral.ai/en/collections/789670](https://help.mistral.ai/en/collections/789670-regulatory-compliance-and-certification)
- Data Storage Info: [help.mistral.ai/en/articles/347629](https://help.mistral.ai/en/articles/347629-where-do-you-store-my-data-or-my-organization-s-data)

---

### 4.4 Ollama (Self-hosted locale)

**Stato attuale in ELAB:** Configurato come opzione locale (`VITE_LOCAL_API_URL`), utilizzato con modello galileo-brain-v13 (Qwen3.5-2B Q5_K_M) su VPS o hardware scuola.

**Punti di forza GDPR:**
- **Conformità GDPR intrinseca**: nessun dato lascia l'infrastruttura controllata
- Zero data processor esterni — nessun DPA necessario
- Nessun trasferimento transfrontaliero
- Piena sovranità sui dati (Art. 5(1)(f) — integrità e riservatezza)
- Audit trail completamente sotto controllo
- Conforme all'Art. 25 GDPR (Privacy by Design e by Default)
- Conforme all'Art. 32 GDPR (misure tecniche adeguate) se hardware adeguatamente protetto
- Nessuna dipendenza da policy esterne di terze parti
- Costo operativo: **€0** (solo investimento hardware iniziale ~€800-1200)

**Criticità GDPR:**
- La **responsabilità della sicurezza** ricade interamente sul Titolare (scuola/ELAB)
- Necessario garantire: crittografia disco, accesso fisico controllato, aggiornamenti di sicurezza
- Qualità delle risposte inferiore ai modelli cloud (modello 2B parametri vs 100B+ dei cloud)
- Latenza variabile (500-2000ms) e dipendente dall'hardware disponibile
- Manutenzione e aggiornamenti a carico del deployer
- Se il server Ollama è esposto sulla rete senza autenticazione, diventa un rischio di sicurezza

**Configurazione consigliata per massima compliance:**
- Bind Ollama a `localhost` o rete interna della scuola
- Crittografia del disco (FileVault/BitLocker/LUKS)
- Nessuna esposizione su Internet
- Log locali senza dati personali identificativi
- Aggiornamenti regolari del sistema operativo e di Ollama

**Riferimenti:**
- Privacy Policy Ollama: [ollama.com/privacy](https://ollama.com/privacy)
- Guida GDPR self-hosted AI: [dev.to/aiengineeringat/running-ai-locally-in-2026-a-gdpr-compliant-guide](https://dev.to/aiengineeringat/running-ai-locally-in-2026-a-gdpr-compliant-guide-oml)

---

## 5. EU AI Act — Implicazioni per EdTech

### 5.1 Timeline

| Data | Obbligo |
|------|---------|
| 1 agosto 2024 | Entrata in vigore dell'AI Act |
| **2 febbraio 2025** | Pratiche vietate + obblighi di AI literacy → **già in vigore** |
| 2 agosto 2025 | Governance e obblighi per modelli GPAI |
| **2 agosto 2026** | **Obblighi completi per sistemi AI ad alto rischio** |

### 5.2 ELAB Tutor come sistema ad alto rischio?

L'**Allegato III** dell'AI Act elenca l'"educazione e formazione professionale" come categoria ad alto rischio (categoria 3). Sono considerati ad alto rischio i sistemi AI che:

- Determinano l'accesso all'istruzione
- Valutano le prestazioni degli studenti
- Assegnano risorse educative

**Analisi per ELAB Tutor:**

| Funzionalità ELAB | Classificazione probabile | Motivazione |
|-------------------|--------------------------|-------------|
| Galileo (tutor AI assistivo) | **Rischio limitato** (non alto) | Non determina accesso, non valuta prestazioni, assiste lo studente |
| Simulatore circuiti | **Rischio minimo** | Strumento tecnico, nessuna decisione su persone |
| Eventuale scoring/valutazione studenti | **Rischio ALTO** | Se influenza voti o percorsi formativi → Allegato III cat. 3 |
| Report continui per insegnanti | **Rischio ALTO potenziale** | Se usati per decisioni educative formali |

**Raccomandazione:** Mantenere Galileo come **assistente** senza funzioni di valutazione formale. Se si introducono funzionalità di scoring o report che influenzano decisioni educative, ELAB ricadrebbe negli obblighi di alto rischio (Art. 6(2) + Allegato III), richiedendo:
- Sistema di gestione della qualità (Art. 17)
- Gestione del rischio (Art. 9)
- Governance dei dati (Art. 10)
- Documentazione tecnica (Art. 11)
- Trasparenza (Art. 13)
- Supervisione umana (Art. 14)
- Accuratezza, robustezza, cybersecurity (Art. 15)

### 5.3 Pratiche vietate (già in vigore dal 2 febbraio 2025)

- **Riconoscimento delle emozioni** degli studenti — VIETATO
- Sistemi di manipolazione che sfruttano la vulnerabilità dei minori — VIETATO
- Social scoring — VIETATO
- Categorizzazione biometrica — VIETATO

**Per ELAB:** Assicurarsi che Galileo non tenti mai di inferire lo stato emotivo dello studente e non manipoli comportamenti sfruttando l'età.

### 5.4 Obbligo di AI Literacy (già in vigore)

Dal 2 febbraio 2025, i provider e deployer di sistemi AI devono garantire un livello sufficiente di "AI literacy" al personale e agli utenti. Per ELAB ciò significa:
- Documentazione chiara per gli insegnanti su come funziona Galileo
- Trasparenza sul fatto che lo studente sta interagendo con un'AI
- Materiale informativo per i genitori

---

## 6. Linee Guida Garante Privacy — IA nelle Scuole

### 6.1 Parere del Garante (4 agosto 2025)

Il Garante Privacy ha approvato le Linee Guida del MIM (Ministero dell'Istruzione e del Merito) sull'uso dell'Intelligenza Artificiale nelle scuole. I tre pilastri sono:

1. **Trasparenza**: le scuole devono informare chiaramente studenti e famiglie sull'uso di AI
2. **Protezione dei dati**: misure tecniche adeguate, no riuso dei dati per training
3. **Diritto di non partecipazione**: lo studente (o il genitore) può rifiutare l'interazione con sistemi AI

### 6.2 Obblighi per fornitori esterni (come ELAB)

Quando la scuola ricorre a fornitori esterni, deve pretendere:
- **Impostazioni privacy adeguate** per i minori
- **Assenza di riuso dei dati per training** dei modelli AI
- **Chiarezza su conservazione e log** delle interazioni
- **Tracciabilità degli accessi**
- **Divieto di riconoscimento delle emozioni**
- Uso preferenziale di **dati sintetici** dove possibile
- **Rigore nella valutazione delle piattaforme esterne**, soprattutto se cloud e non UE

### 6.3 Vademecum "La scuola a prova di privacy"

Il Garante ha aggiornato il vademecum con una sezione dedicata all'AI, allineandosi alle Linee Guida MIM 2025. Il vademecum è uno strumento operativo per istituzioni scolastiche, docenti, studenti e famiglie.

**Riferimenti:**
- Garante Privacy — Sezione Scuola: [garanteprivacy.it/temi/scuola](https://www.garanteprivacy.it/temi/scuola)
- Parere 4 agosto 2025: [garanteprivacy.it/docweb/10162698](https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/10162698)
- Vademecum aggiornato: [garanteprivacy.it/docweb/9887111](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9887111)
- GDPR Istruzione: [gdpristruzione.it](https://www.gdpristruzione.it/)

---

## 7. Raccomandazioni Operative

### 7.1 Breve termine (entro giugno 2026 — deadline PNRR)

**Priorità CRITICA — azioni immediate:**

1. **Implementare la fallback chain GDPR-compliant:**
   ```
   Ollama locale (GDPR nativo) → Mistral EU (La Plateforme) → Anthropic US (ultimo resort)
   ```

2. **Migrare il Nanobot da Render (USA) a Hostinger UE o Mistral diretto:**
   - Il server Nanobot su Render.com non ha DPA adeguato per dati di minori
   - Sostituire Google Gemini free tier con Mistral Small 3.1 su La Plateforme (costo: ~€2-5/mese per volumi ELAB)

3. **Firmare il DPA Anthropic Commercial:**
   - Assicurarsi che l'account Anthropic sia di tipo **Commercial/API** (non Consumer)
   - Il DPA è incluso automaticamente nei Commercial Terms
   - Documentare la scelta con una Transfer Impact Assessment (TIA)

4. **Preparare la documentazione GDPR per MePA:**
   - DPIA (Valutazione d'Impatto) per il trattamento AI con dati di minori
   - Registro dei trattamenti aggiornato con tutti i provider
   - Informativa privacy specifica per genitori/tutori
   - Modulo di consenso parentale per l'interazione con AI

5. **Configurare Ollama locale come provider di default:**
   - Il modello galileo-brain-v13 è già funzionante
   - Per le scuole con hardware adeguato, nessun dato esce dalla scuola
   - Documentare come "Privacy by Design" (Art. 25 GDPR)

### 7.2 Medio termine (6-12 mesi — post PNRR)

1. **Migrazione primaria a Mistral AI La Plateforme:**
   - Provider EU nativo, non soggetto a CLOUD Act
   - Costo 10-50x inferiore ad Anthropic per volumi equivalenti
   - Modello Small 3.1 (24B) offre qualità sufficiente per tutoring bambini
   - DPA e sub-processors list pubblicamente disponibili

2. **Valutare Google Vertex AI con regione EU:**
   - Se serve multimodalità (immagini dei circuiti, voce)
   - Certificazioni superiori (ISO 42001 per AI Act)
   - Costo competitivo con Flash models

3. **Potenziare il modello locale Galileo Brain:**
   - Fine-tuning su dataset educativo italiano più ampio
   - Testare modelli più grandi (7B-14B) se le scuole hanno hardware GPU
   - Obiettivo: 80%+ delle richieste gestite localmente

4. **Implementare logging e audit trail GDPR-compliant:**
   - Log delle interazioni AI senza dati personali identificativi
   - Retention dei log allineata alla policy (es. 30 giorni)
   - Meccanismo di cancellazione su richiesta dell'interessato

### 7.3 Strategia di fallback chain

```
┌─────────────────────────────────────────────────────┐
│                  RICHIESTA STUDENTE                   │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  1. OLLAMA LOCALE (galileo-brain)                    │
│  GDPR: ★★★★★ | Costo: €0 | Latenza: 500-2000ms    │
│  → Se disponibile e richiesta semplice              │
└────────────────────┬────────────────────────────────┘
                     │ fallback (se non disponibile o qualità insufficiente)
                     ▼
┌─────────────────────────────────────────────────────┐
│  2. MISTRAL AI — La Plateforme (EU)                  │
│  GDPR: ★★★★☆ | Costo: ~€5/mese | Latenza: 150-400ms│
│  → Provider EU, DPA, no CLOUD Act                    │
└────────────────────┬────────────────────────────────┘
                     │ fallback (se Mistral non disponibile)
                     ▼
┌─────────────────────────────────────────────────────┐
│  3. ANTHROPIC CLAUDE — API Commercial (US)           │
│  GDPR: ★★★☆☆ | Costo: ~€30/mese | Latenza: 200-500ms│
│  → Qualità superiore, ma trasferimento extra-UE      │
│  → Richiede TIA documentata                          │
└──────────────────────────────────────────────────────┘
```

**Logica:**
- L'80%+ delle richieste dovrebbe essere gestito da Ollama locale (costo zero, GDPR nativo)
- Il 15% da Mistral EU (qualità elevata, conformità UE nativa)
- Il 5% da Anthropic (solo per richieste complesse che richiedono il modello migliore)

---

## 8. Piano di Migrazione

### Fase 1 — Immediata (entro aprile 2026)

| Azione | Effort | Impatto GDPR |
|--------|--------|--------------|
| Registrarsi su Mistral La Plateforme e ottenere API key | 1h | Alto |
| Implementare adapter Mistral in `api.js` (formato OpenAI-compatible) | 4h | Alto |
| Spostare Nanobot da Render a Hostinger UE o eliminare in favore di Mistral | 2h | Critico |
| Verificare che l'account Anthropic sia Commercial (non Consumer) | 1h | Critico |
| Documentare la fallback chain nel Registro dei trattamenti | 2h | Alto |

### Fase 2 — Pre-PNRR (entro giugno 2026)

| Azione | Effort | Impatto GDPR |
|--------|--------|--------------|
| Completare la DPIA per il trattamento AI con dati di minori | 8h | Obbligatorio per PA |
| Redigere informativa privacy specifica per genitori | 4h | Obbligatorio |
| Preparare modulo consenso parentale per interazione AI | 2h | Obbligatorio |
| Testare la fallback chain in ambiente di produzione | 4h | Alto |
| Creare pagina "Privacy e AI" nel sito ELAB | 4h | Medio |

### Fase 3 — Consolidamento (Q3-Q4 2026)

| Azione | Effort | Impatto GDPR |
|--------|--------|--------------|
| Migrazione primaria a Mistral come provider cloud default | 8h | Alto |
| Fine-tuning Galileo Brain su dataset più ampio | 20h | Medio |
| Valutazione Google Vertex AI con regione EU per multimodalità | 8h | Medio |
| Audit GDPR completo con DPO esterno | 16h | Alto |
| Preparazione per obblighi AI Act alto rischio (agosto 2026) | 20h | Critico se applicabile |

---

## 9. Fonti e Riferimenti

### Normativa

- [Regolamento (UE) 2016/679 — GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [Regolamento (UE) 2024/1689 — AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)
- [Allegato III AI Act — Sistemi ad alto rischio](https://artificialintelligenceact.eu/annex/3/)
- [D.Lgs. 101/2018 — Adeguamento italiano GDPR](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2018-08-10;101)

### Garante Privacy

- [Garante Privacy — Sezione Scuola](https://www.garanteprivacy.it/temi/scuola)
- [Parere Linee Guida MIM su IA nelle scuole (4 agosto 2025)](https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/10162698)
- [Newsletter Garante 10 settembre 2025](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/10163470)
- [Vademecum "La scuola a prova di privacy"](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9887111)
- [GDPR Istruzione — Portale dedicato](https://www.gdpristruzione.it/)

### Provider — Documentazione GDPR

**Anthropic:**
- [DPA e Commercial Terms](https://support.claude.com/en/articles/7996862-how-do-i-view-and-sign-your-data-processing-addendum-dpa)
- [Privacy Center](https://privacy.claude.com)
- [Trust Center](https://trust.anthropic.com)
- [Certificazioni](https://support.claude.com/en/articles/10015870-what-certifications-has-anthropic-obtained)
- [Data Retention Policy](https://privacy.claude.com/en/articles/8956058-i-have-a-zero-data-retention-agreement-with-anthropic-what-products-does-it-apply-to)

**Google Gemini:**
- [Privacy Hub Gemini Apps](https://support.google.com/gemini/answer/13594961)
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)
- [DPIA Support for Workspace with Gemini](https://workspace.google.com/blog/identity-and-security/dpia-support-for-google-workspace-with-gemini)
- [Enterprise Data Protection for Education](https://blog.google/outreach-initiatives/education/gemini-enterprise-grade-data-protection/)
- [Generative AI Privacy Hub — Workspace](https://support.google.com/a/answer/15706919)

**Mistral AI:**
- [Data Processing Addendum](https://legal.mistral.ai/terms/data-processing-addendum)
- [Privacy Policy](https://legal.mistral.ai/terms/privacy-policy)
- [Sub-processors List](https://trust.mistral.ai/subprocessors)
- [Data Storage FAQ](https://help.mistral.ai/en/articles/347629-where-do-you-store-my-data-or-my-organization-s-data)
- [DPA FAQ](https://help.mistral.ai/en/articles/347641-where-can-i-consult-your-dpa-data-processing-agreement)
- [Compliance & Certifications](https://help.mistral.ai/en/collections/789670-regulatory-compliance-and-certification)
- [SOC 2 / ISO 27001 Status](https://help.mistral.ai/en/articles/347638-do-you-have-soc2-or-iso27001-certification)

**Ollama:**
- [Privacy Policy](https://ollama.com/privacy)
- [Guida GDPR self-hosted AI (2026)](https://dev.to/aiengineeringat/running-ai-locally-in-2026-a-gdpr-compliant-guide-oml)

### Analisi di terze parti

- [Mistral AI GDPR Compliance Guide — WAIMAKERS](https://www.waimakers.com/en/resources/gdpr-compliance/mistral-ai)
- [Mistral AI: Data Protection — WeVenture](https://weventure.de/en/blog/mistral)
- [Claude GDPR Compliance — Agentive AIQ](https://agentiveaiq.com/blog/is-claude-gdpr-compliant-what-businesses-must-know)
- [Gemini Compliance 2025 — DataStudios](https://www.datastudios.org/post/gemini-compliance-gdpr-hipaa-and-global-standards-in-2025)
- [EU AI Act and EdTech — FeedbackFruits](https://feedbackfruits.com/blog/from-regulation-to-innovation-what-the-eu-ai-act-means-for-edtech)
- [EU AI Act and EdTech — BABL AI](https://babl.ai/navigating-the-new-frontier-the-impact-of-the-eu-ai-act-on-educational-technology/)
- [Federprivacy — Linee Guida MIM](https://www.federprivacy.org/informazione/garante-privacy/ok-del-garante-privacy-alle-linee-guida-del-ministero-dell-istruzione-per-l-ia-negli-istituti-scolastici)

---

## Sintesi Esecutiva

| | Conformità GDPR | Costo/mese | Qualità | Raccomandazione |
|---|---|---|---|---|
| **Ollama locale** | ★★★★★ | €0 | Sufficiente | **Default per tutte le scuole** |
| **Mistral AI** | ★★★★☆ | ~€5 | Buona | **Provider cloud primario** |
| **Google Gemini** | ★★★☆☆ | ~€3 | Buona | Valutare solo via Vertex AI EU |
| **Anthropic Claude** | ★★★☆☆ | ~€30 | Eccellente | Solo come fallback ultimo resort |

**La strategia ottimale per ELAB Tutor è: Ollama locale (default) → Mistral EU (cloud) → Anthropic (fallback).**

Questa architettura garantisce che la stragrande maggioranza dei dati degli studenti non lasci mai l'infrastruttura della scuola, che i dati che necessitano di elaborazione cloud rimangano in UE (Mistral), e che il ricorso a provider USA sia limitato ai casi strettamente necessari con documentazione adeguata (TIA + DPA).

---

*Documento redatto il 29 marzo 2026. Le informazioni sui provider sono basate su ricerche effettuate alla data di redazione e potrebbero essere soggette a modifiche. Si raccomanda di verificare periodicamente le policy dei provider e di consultare un DPO qualificato per la validazione finale della conformità.*
