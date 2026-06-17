# Kit GDPR per EdTech Italiana — Cosa Serve per Vendere alle Scuole

> Research Report — ELAB Researcher Agent — 09/04/2026 15:20
> Topic: Kit documentale GDPR/AI Act per vendere software AI alle scuole italiane

---

## 1. Contesto Normativo: 3 Leggi da Rispettare

| Normativa | Requisito per ELAB | Deadline |
|-----------|--------------------|-----------|
| **GDPR (2016/679)** | DPA art.28 + informativa + DPIA | Obbligatorio ora |
| **AI Act (2024/1689)** | Trasparenza AI, supervisione umana, no profiling | In vigore |
| **Linee Guida MIM (DM 166/2025)** | Privacy by design, consenso <14 anni, opt-out training | Sperimentazione 2025-2027 |

### Linee Guida MIM per AI nelle Scuole (DM 166 del 09/08/2025)

Il MIM ha pubblicato le linee guida ufficiali per l'AI nelle scuole:
- **Sotto 14 anni**: NESSUN uso di AI senza consenso parentale
- **14-18 anni**: autonomia ma informazione trasparente
- **Privacy by design e by default**: obbligatorio
- **Minimizzazione dati**: raccogliere solo il necessario
- **Diritto opt-out**: nessun dato studente puo' essere usato per training AI
- **Supervisione umana**: sempre presente, il docente controlla
- **Fornitori certificati**: il fornitore deve dimostrare compliance

Fonte: [MIM Linee Guida AI Scuola](https://www.mim.gov.it/documents/20182/0/MIM_Linee+guida+IA+nella+Scuola_09_08_2025-signed.pdf), [GoStudent analisi](https://www.gostudent.org/it-it/blog/nuove-linee-guida-per-uso-ia-nelle-scuole), [UNICA MIM](https://unica.istruzione.gov.it/portale/en/linee-guida-ia)

---

## 2. Kit Documentale: I 6 Documenti che ELAB DEVE Avere

### Documento 1: Nomina a Responsabile del Trattamento (DPA Art. 28)

**Cos'e'**: Contratto tra la scuola (Titolare) e ELAB (Responsabile) che regola il trattamento dati.
**Chi lo firma**: Il DS della scuola + il legale rappresentante di ELAB (Omaric/Andrea).
**Contenuti obbligatori** (Art. 28 par. 3 GDPR):
- Oggetto e durata del trattamento
- Natura e finalita' del trattamento
- Tipo di dati personali trattati
- Categorie di interessati (studenti 8-14, docenti)
- Obblighi e diritti del Titolare
- Misure di sicurezza tecniche e organizzative
- Gestione sub-responsabili (Supabase, Render, etc.)
- Obbligo notifica data breach entro 72 ore
- Restituzione/cancellazione dati a fine contratto

**Modello disponibile**: [Consiglio Nazionale Forense - Template DPA](https://www.consiglionazionaleforense.it/documents/20182/0/tem025a_modello_nomina_responsabile_trattamento_gdpr.docx), [Orizzonte Scuola - Modello](https://www.orizzontescuola.it/nomina-a-responsabile-del-trattamento-ex-art-28-rgpd-ue-2016-679-modello/)

### Documento 2: Informativa Privacy per Genitori/Studenti (Art. 13-14)

**Cos'e'**: Documento che spiega ai genitori quali dati raccoglie ELAB e perche'.
**Lingua**: Italiano semplice, comprensibile da un genitore non tecnico.
**Contenuti obbligatori**:
- Identita' del Titolare (la scuola) e del Responsabile (ELAB/Omaric)
- Dati raccolti: nome utente (pseudonimo), progressi, errori, tempo, interazioni chat
- Dati NON raccolti: video, audio, foto, geolocalizzazione, biometria
- Finalita': supporto didattico, monitoraggio progressi
- Base giuridica: consenso parentale (art. 6.1.a per <14 anni)
- Durata conservazione: fine anno scolastico + 1 anno
- Diritti: accesso, rettifica, cancellazione, portabilita', opposizione
- Come esercitare i diritti: email DPO scuola + email ELAB
- Trasferimenti extra-UE: Supabase (EU region), no transfer US

### Documento 3: DPIA — Valutazione d'Impatto (Art. 35)

**Cos'e'**: Analisi dei rischi del trattamento dati per gli studenti.
**Obbligatoria quando**: dati di minori + AI + larga scala (2+ criteri EDPB = DPIA obbligatoria).
**ELAB soddisfa TUTTI e 3**: minori (8-14) + AI (Galileo chat) + potenzialmente larga scala (scuole intere).
**Contenuti**:
- Descrizione sistematica del trattamento
- Valutazione necessita' e proporzionalita'
- Valutazione rischi per diritti e liberta'
- Misure di mitigazione
- Rischio residuo accettabile

**Strumento consigliato dal Garante**: [Software CNIL per DPIA](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/8581268) (gratuito, in italiano)

Fonte: [Garante Privacy DPIA](https://www.garanteprivacy.it/valutazione-d-impatto-della-protezione-dei-dati-dpia-), [Garante DPIA requisiti](https://www.garanteprivacy.it/regolamentoue/dpia)

### Documento 4: Registro dei Trattamenti (Art. 30)

**Cos'e'**: Elenco di tutti i trattamenti dati che ELAB effettua.
**Contenuti per trattamento**:
- Nome: es. "Tracciamento progressi studente"
- Finalita': supporto didattico
- Categorie dati: pseudonimo, punteggi, tempo, errori
- Categorie interessati: studenti 8-14
- Destinatari: docente (dashboard), Supabase (storage)
- Termine cancellazione: fine a.s. + 12 mesi
- Misure sicurezza: AES-256-GCM, HTTPS, pseudonimizzazione

### Documento 5: Scheda Tecnica GDPR/AI Act Compliance

**Cos'e'**: One-pager tecnico per il DPO della scuola.
**Contenuti**:
- Architettura dati: dove sono i dati, come viaggiano
- Crittografia: AES-256-GCM per dati sensibili (crypto.js)
- Pseudonimizzazione: SHA-256 per userId (gdprService.js)
- Data minimization: solo dati necessari
- AI: modelli usati (DeepSeek, Gemini, etc.), nessun training su dati studenti
- Safety filter: filtro contenuti per minori (aiSafetyFilter.js)
- PII detection: blocco email, telefono, CF nella chat (contentFilter.js)
- Retention: cancellazione automatica dopo periodo configurabile
- Data breach: notifica entro 72 ore

### Documento 6: Modulo Consenso Parentale

**Cos'e'**: Modulo che il genitore firma per autorizzare l'uso di ELAB.
**Requisiti MIM**:
- Sotto 14 anni: consenso parentale OBBLIGATORIO
- Deve spiegare: cosa fa ELAB, quali dati raccoglie, chi li vede
- Deve includere: casella opt-out per dati usati dall'AI
- Deve essere SEPARATO dal consenso generico della scuola

---

## 3. Sub-Responsabili: Chi Tocca i Dati

ELAB deve dichiarare TUTTI i sub-responsabili nel DPA:

| Sub-Responsabile | Servizio | Localizzazione | Dati trattati |
|-----------------|----------|----------------|---------------|
| **Supabase** | Database, Edge Functions | EU (Frankfurt) | Sessioni, progressi, chat |
| **Vercel** | Frontend hosting | EU (configurabile) | Nessun dato personale (statico) |
| **Render** | AI Nanobot API | EU/US | Messaggi chat (transitorio) |
| **DeepSeek** | AI provider | Cina | Messaggi chat (transitorio) |
| **Gemini (Google)** | AI provider | US/EU | Messaggi chat (transitorio) |
| **Hostinger/n8n** | Compiler | EU | Codice Arduino (no PII) |

**PROBLEMA CRITICO**: DeepSeek e' in Cina. Gemini puo' processare in US.
Serve: clausole contrattuali standard (SCC) o conferma che i dati NON vengono trasferiti.
**Soluzione pratica**: Il Nanobot Render puo' anonimizzare i messaggi prima di inviarli ai provider AI (rimuovere nomi, email, PII). Documentare che nessun dato personale raggiunge provider extra-UE.

---

## 4. Checklist Vendor Compliance 2026

Basata su [CyberNut Vendor Compliance Checklist 2026](https://www.cybernut.com/blog/vendor-compliance-2026-checklist-evaluating-edtech-vendors-under-new-privacy-laws):

| Requisito | Stato ELAB | Azione |
|-----------|-----------|--------|
| DPA Art. 28 firmato | **MANCANTE** | Creare template |
| Informativa genitori | **MANCANTE** | Scrivere in IT semplice |
| DPIA completata | **MANCANTE** | Usare tool CNIL |
| Registro trattamenti | **MANCANTE** | Compilare |
| Scheda tecnica GDPR | **PARZIALE** (crypto.js esiste) | Documentare |
| Consenso parentale | **PARZIALE** (gdprService ha il flusso) | Creare modulo |
| Data breach plan | **MANCANTE** | Definire procedura |
| Audit trail | **PARZIALE** (logger esiste) | Strutturare |
| Data retention policy | **PARZIALE** (isDataExpired esiste) | Documentare |
| Safety filter per minori | **PRESENTE** (aiSafetyFilter.js) | Fix 4 regex bug |
| PII detection | **PRESENTE** (contentFilter.js) | OK |
| Encryption at rest | **PRESENTE** (AES-256-GCM) | OK |
| Encryption in transit | **PRESENTE** (HTTPS ovunque) | OK |

---

## 5. Action Items Concreti

### Immediati (prima di vendere)
1. **Creare DPA template** — basato su modello CNF + clausole per scuole
2. **Scrivere informativa genitori** — 1 pagina, italiano semplice
3. **Compilare DPIA** — usare software CNIL (gratuito dal Garante)
4. **Fix 4 regex safety** — P1 gia' assegnato al Builder

### Entro Maggio 2026
5. **Registro trattamenti** — elencare tutti i trattamenti in formato tabellare
6. **Scheda tecnica** — 1 pagina per DPO scuola
7. **Modulo consenso parentale** — con opt-out AI
8. **Piano data breach** — procedura notifica 72h

### Entro Settembre 2026 (inizio a.s.)
9. **Pagina /privacy su elabtutor.school** — informativa pubblica
10. **API GDPR** — export/delete dati studente (gdprService gia' pronto)
11. **Certificazione AGID** — per catalogo software PA

Fonte: [1EdTech DPSA Template](https://www.1edtech.org/resource/dpsa), [TeachTools DPA Checklist](https://teachtools.co/blog/vendor-data-processing-agreement-checklist-for-schools), [Federprivacy SCC](https://www.federprivacy.org/strumenti/accesso-ristretto/dalla-commissione-ue-le-clausole-contrattuali-tipo-per-titolari-e-responsabili-del-trattamento)
