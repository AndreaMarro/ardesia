# GDPR Compliance — ELAB Tutor per Scuole Italiane

**Autore**: Andrea Marro
**Data**: 27/03/2026
**Versione**: 1.0
**Stato**: Gap Analysis + Piano di Rimedio

---

## 1. Contesto Normativo (Verificato)

### Fonti di riferimento
- **GDPR** (Reg. UE 2016/679) — Art. 5, 6, 8, 9, 24, 25, 35, 36, 44-49
- **AI Act** (Reg. UE 2024/1689) — attivo dal 02/02/2025, obbligo AI Literacy per personale scolastico
- **Linee Guida MIM** — D.M. 9 agosto 2025, n. 166: uso AI nelle istituzioni scolastiche
- **Vademecum Garante** — "La scuola a prova di privacy" (edizione 2025)
- **Piano Ispettivo Garante 2026** — per la prima volta include uso AI nelle scuole (min. 40 ispezioni con GdF)

### Ruoli GDPR nella scuola
| Ruolo | Soggetto |
|-------|----------|
| **Titolare del trattamento** | Istituzione Scolastica (Dirigente Scolastico) |
| **Responsabile del trattamento** | ELAB Tutor (Andrea Marro / Futurista Srl) |
| **Sub-responsabili** | Anthropic, Render, Hostinger, Vercel |
| **DPO** | RPD dell'istituto o dell'ambito territoriale |
| **Interessati** | Studenti (minori 8-14 anni), docenti |

---

## 2. Flussi di Dati Attuali

### 2.1 Cosa raccoglie ELAB Tutor

| Dato | Dove transita | Persistenza | Dati personali? |
|------|---------------|-------------|-----------------|
| Messaggi chat (testo libero) | Render (US) → Anthropic (US) | Sessione (non persistiti lato server) | **Potenzialmente SI** (se l'utente scrive nomi, info personali) |
| Stato circuito (JSON) | Render (US) | Sessione | NO (dati tecnici) |
| Codice Arduino (C++) | Hostinger n8n (EU) | Sessione | NO |
| Session ID (`sim-{ts}-{random}`) | localStorage (browser) | Locale | NO (pseudonimo, non collegabile) |
| Eventi analytics | Hostinger n8n (EU) | Server-side | NO (solo se consenso accettato) |
| Età utente | sessionStorage (browser) | Sessione browser | SI (dato sensibile per minori) |
| Dati admin (nome, email) | Hostinger n8n → Notion (US) | Persistente | **SI** |

### 2.2 Provider e Giurisdizione

| Provider | Servizio | Sede | DPA disponibile? | EU Data Residency? |
|----------|----------|------|-------------------|---------------------|
| **Anthropic** | LLM (Claude) | USA | SI (incluso in ToS commerciali, con SCCs Module 2/3) | NO (processing in US su AWS) |
| **Render** | Nanobot hosting | USA | SI (render.com/dpa, certificato EU-US DPF dal 06/01/2025) | NO (server US, ma DPF certificato) |
| **Hostinger** | n8n workflows | EU (Lituania) | SI | **SI** |
| **Vercel** | Frontend hosting | USA | SI | Parziale (Edge EU disponibile) |
| **Notion** | Database admin | USA | SI | NO |

### 2.3 Flusso visuale dei dati

```
[Browser studente/docente]
    │
    ├─► localStorage (consenso, sessione, codice) — LOCALE, nessun trasferimento
    │
    ├─► Hostinger n8n (EU) — compilazione, analytics, GDPR webhook
    │       └─► Notion (US) — solo dati admin (nome, email docente)
    │
    └─► Render (US, DPF certified) — chat Galileo
            └─► Anthropic (US, SCCs) — LLM processing
                    └─► Nessuna persistenza (API stateless, no training su dati utente)
```

---

## 3. Gap Analysis

### 3.1 Cosa ELAB ha GIA' implementato (VERIFIED nel codice)

| Requisito GDPR | Stato | File |
|----------------|-------|------|
| Consent Banner (età-adattivo) | ✅ | `ConsentBanner.jsx` |
| Privacy Policy completa (GDPR-K + COPPA) | ✅ | `PrivacyPolicy.jsx` (v2.0) |
| Diritto alla cancellazione (Art. 17) | ✅ | `DataDeletion.jsx` + `gdprService.js` |
| Diritto alla portabilità (Art. 20) | ✅ | `gdprService.js` → `requestDataExport()` |
| Diritto alla rettifica (Art. 16) | ✅ | `gdprService.js` → `requestDataCorrection()` |
| Revoca consenso (Art. 7) | ✅ | `gdprService.js` → `revokeConsent()` |
| Meccanismo consenso genitori (COPPA) | ✅ | `gdprService.js` → `requestParentalConsent()` |
| Analytics gated su consenso | ✅ | `AnalyticsWebhook.js` → `hasAnalyticsConsent()` |
| Data minimization helper | ✅ | `gdprService.js` → `minimizeData()` |
| Pulizia dati locali | ✅ | `gdprService.js` → `clearLocalData()` |
| Data retention check (2 anni) | ✅ | `gdprService.js` → `isDataExpired()` |

### 3.2 GAP CRITICI (bloccanti per vendita a scuole)

#### GAP-1: DPIA non redatta
- **Severità**: BLOCKER
- **Requisito**: Art. 35 GDPR — obbligatoria quando trattamento su larga scala di dati di minori + uso AI
- **Stato**: Nessun documento DPIA esiste
- **Piano**: Redigere DPIA con template Garante italiano, includere: descrizione trattamento, necessità/proporzionalità, rischi per interessati, misure di mitigazione
- **Responsabile**: Andrea Marro (predispone), poi validazione con DPO dell'istituto adottante
- **Deadline suggerita**: Prima della prima vendita a scuola

#### GAP-2: DPA non firmati con sub-responsabili
- **Severità**: BLOCKER
- **Requisito**: Art. 28 GDPR — contratto scritto obbligatorio con ogni responsabile del trattamento
- **Stato**: DPA disponibili presso i provider ma NON firmati/attivati
- **Piano**:
  - Anthropic: attivare DPA (incluso automaticamente nei Commercial ToS, verificare accettazione)
  - Render: firmare DPA su render.com/dpa
  - Vercel: attivare DPA enterprise
  - Hostinger: verificare DPA incluso nel contratto hosting
- **Deadline suggerita**: Entro 2 settimane

#### GAP-3: Trasferimento dati extra-UE non documentato
- **Severità**: HIGH
- **Requisito**: Art. 44-49 GDPR — trasferimenti verso paesi terzi richiedono garanzie adeguate
- **Stato attuale**:
  - Render: certificato EU-US DPF (valido dal 06/01/2025) + SCCs → **coperto**
  - Anthropic: SCCs Module 2/3 nel DPA → **coperto** (se DPA attivato)
  - Notion: verificare DPA e SCCs → **da verificare**
- **Piano**: Documentare ogni trasferimento con base giuridica (DPF o SCCs) nel registro trattamenti
- **Alternativa a medio termine**: Mistral AI (Francia, EU-native) come fallback per modalità "EU-only"

#### GAP-4: Registro dei trattamenti assente
- **Severità**: HIGH
- **Requisito**: Art. 30 GDPR — obbligatorio per trattamenti non occasionali
- **Stato**: Non esiste un registro formale
- **Piano**: Creare registro con: finalità, categorie interessati, categorie dati, destinatari, trasferimenti extra-UE, termini cancellazione, misure sicurezza

#### GAP-5: Verifica effettiva consenso genitori
- **Severità**: MEDIUM
- **Requisito**: Art. 8 GDPR — consenso genitore per minori <16 anni (Italia: <14 anni)
- **Stato**: Meccanismo implementato nel codice (`requestParentalConsent()`) ma il webhook backend potrebbe non essere attivo/testato
- **Piano**: Verificare che il flusso end-to-end funzioni: richiesta → email genitore → token → verifica

#### GAP-6: Pseudonimizzazione debole — ✅ FIXATO (C19)
- **Severità**: LOW
- **Requisito**: Art. 25 GDPR — privacy by design
- **Stato**: ✅ `pseudonymizeUserId()` ora usa SHA-256 via Web Crypto API con salt fisso (irreversibile)
- **Fix**: `gdprService.js` riga 386 — funzione ora async, ritorna hash hex troncato a 16 char

---

## 4. Piano di Rimedio

### Fase 1 — Documentazione (prima della vendita)
| # | Azione | Effort | Output |
|---|--------|--------|--------|
| 1 | Redigere DPIA con template Garante | 2-3 giorni | `automa/docs/DPIA-ELAB-TUTOR.pdf` |
| 2 | Firmare DPA con Anthropic, Render, Vercel | 1 giorno | Copie firmate archiviate |
| 3 | Creare Registro Trattamenti (Art. 30) | 1 giorno | `automa/docs/REGISTRO-TRATTAMENTI.md` |
| 4 | Preparare Informativa per genitori (italiano semplice) | 1 giorno | Template PDF per le scuole |
| 5 | Preparare modulo consenso genitori | 0.5 giorni | Template PDF/digitale |

### Fase 2 — Tecnica (entro 1 mese)
| # | Azione | Effort | Output |
|---|--------|--------|--------|
| 6 | Verificare flusso consenso genitori end-to-end | 2 ore | Test report |
| 7 | ✅ Sostituire `btoa()` con SHA-256 in `pseudonymizeUserId()` | 1 ora | Fixato C19 — gdprService.js |
| 8 | Aggiungere audit log per richieste GDPR (export/delete/revoke) | 4 ore | Log strutturato |
| 9 | Implementare data retention automatica (auto-delete dopo 2 anni) | 2 ore | Cron job o check periodico |

### Fase 3 — EU Data Residency (entro 3 mesi)
| # | Azione | Effort | Output |
|---|--------|--------|--------|
| 10 | Integrare Mistral AI come provider LLM EU-native | 1 settimana | Fallback EU nel nanobot |
| 11 | Aggiungere flag "Modalità EU-only" per scuole | 2 giorni | Toggle in impostazioni scuola |
| 12 | Migrare dati admin da Notion a soluzione EU | 1 settimana | DB EU (es. Supabase EU) |

---

## 5. Cosa dire al Dirigente Scolastico (FAQ)

### "I dati dei miei studenti vanno in America?"
**Risposta onesta**: I messaggi della chat transitano su server USA (Anthropic/Render) ma:
- Non vengono salvati permanentemente (API stateless)
- Anthropic non usa i dati per addestrare i modelli (contrattuale)
- Render è certificato EU-US Data Privacy Framework
- Il codice Arduino viene compilato su server EU (Hostinger, Lituania)
- Nessun dato personale identificativo viene richiesto agli studenti per usare il simulatore

### "Serve il consenso dei genitori?"
**Risposta**: Sì, per l'uso della chat AI serve consenso informato. ELAB include già un sistema di consenso con verifica età. Per uso scolastico, il consenso può essere raccolto dalla scuola tramite il modulo che forniamo.

### "E se il Garante fa un'ispezione?"
**Risposta**: Con la documentazione completa (DPIA, DPA firmati, registro trattamenti, moduli consenso), la scuola è in regola. ELAB fornisce tutta la documentazione necessaria come parte del pacchetto scuola.

### "Posso usare ELAB senza la chat AI?"
**Risposta**: Sì. Il simulatore di circuiti funziona interamente nel browser, senza inviare dati a nessun server. La chat AI (Galileo) è opzionale e può essere disattivata.

---

## 6. Checklist per Vendita a Scuola

- [ ] DPIA redatta e firmata
- [ ] DPA firmati con tutti i sub-responsabili (Anthropic, Render, Vercel, Hostinger)
- [ ] Registro trattamenti compilato
- [ ] Informativa privacy per genitori (italiano semplice, Gulpease ≥60)
- [ ] Modulo consenso genitori (cartaceo + digitale)
- [ ] Nomina ELAB come Responsabile del trattamento (Art. 28)
- [ ] Test end-to-end flusso consenso genitori funzionante
- [ ] Modalità "solo simulatore" (senza AI) documentata come opzione zero-data
- [ ] Documentazione trasferimenti extra-UE con basi giuridiche

---

## 7. Fonti Verificate

- [Ispezioni Garante Privacy 2026: controlli sull'IA nelle scuole](https://dsgaonline.it/2026/02/06/ispezioni-garante-privacy-2026-controlli-sullia-nelle-scuole/)
- [Linee Guida AI Scuola MIM 2026](https://www.maioralabs.it/2026/01/linee-guida-intelligenza-artificiale-scuola-2026/)
- [AI Act, GDPR e strumenti regolatori per la scuola](https://giustoscuola.it/archivio-notizie/3846-la-scuola-e-l-intelligenza-artificiale-quadro-normativo-e-linee-guida-mim-ai-act-gdpr-e-strumenti-regolatori-per-la-scuola.html)
- [Vademecum Garante "La scuola a prova di privacy"](https://picomputers.it/scuola-a-prova-di-privacy-vademecum-garante-2025/)
- [GDPR nelle scuole: adempimenti](https://www.agendadigitale.eu/sicurezza/privacy/gdpr-nelle-scuole-che-fare-soggetti-coinvolti-e-adempimenti/)
- [5 passi per software GDPR-compliant a scuola](https://www.orizzontescuola.it/i-software-da-usare-a-scuola-devono-essere-rispettosi-del-gdpr-5-passi-per-non-sbagliare/)
- [Anthropic DPA (Privacy Center)](https://privacy.claude.com/en/articles/7996862-how-do-i-view-and-sign-your-data-processing-addendum-dpa)
- [Render DPA](https://render.com/dpa)
- [Render EU-US DPF Certification](https://render.com/changelog/render-achieves-certification-under-the-eu-us-data-privacy-framework)
- [Mistral AI: alternativa EU GDPR-native](https://weventure.de/en/blog/mistral)
- [Mistral AI for Education](https://openeducat.org/ai/providers/mistral/)
