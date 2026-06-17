# DPIA — Data Protection Impact Assessment
# ELAB Tutor — Versione 1.0 (DRAFT)

**Data**: 30/03/2026
**Titolare del trattamento**: Andrea Marro (sviluppatore unico)
**Responsabile della protezione dati**: Da nominare
**Riferimento normativo**: Reg. UE 2016/679 (GDPR), Art. 35
**Template**: Basato su linee guida GPDP italiano (Garante Privacy)

> **NOTA**: Questo documento è un DRAFT tecnico. Richiede revisione legale
> da parte di un DPO qualificato prima di essere considerato completo.

---

## 1. Descrizione del Trattamento

### 1.1 Natura del trattamento
ELAB Tutor è una piattaforma educativa web per l'insegnamento dell'elettronica e Arduino
a studenti di età compresa tra 8 e 14 anni. Il sistema raccoglie e tratta dati relativi
al progresso didattico degli studenti.

### 1.2 Finalità
- Tracciamento del progresso didattico individuale degli studenti
- Visualizzazione aggregata dei dati per i docenti (Teacher Dashboard)
- Personalizzazione del percorso educativo tramite AI tutor (Galileo)
- Generazione di report per la scuola (conformità PNRR)

### 1.3 Ambito
- **Utenti**: Studenti (8-14 anni), docenti, dirigenti scolastici
- **Territorio**: Italia (scuole primarie e secondarie di primo grado)
- **Canale**: Web application (browser), utilizzabile su LIM scolastiche

### 1.4 Contesto
Il sistema è destinato all'uso in contesto scolastico, dove gli studenti sono minori.
I dati sono trattati per finalità educative, nell'ambito del rapporto scuola-famiglia.

---

## 2. Base Giuridica

### 2.1 Base principale
- **Art. 6(1)(e) GDPR**: Esecuzione di un compito di interesse pubblico (istruzione)
- **Art. 6(1)(b) GDPR**: Esecuzione del contratto di licenza con la scuola

### 2.2 Minori (Art. 8 GDPR)
- Per studenti sotto i 14 anni: consenso genitoriale richiesto
- Il consenso è raccolto tramite la scuola (rapporto scuola-famiglia preesistente)
- La scuola funge da garante del consenso in base al proprio regolamento

### 2.3 Categorie particolari
I dati emotivi (mood, confusione) potrebbero essere considerati dati relativi alla salute
(Art. 9). Base giuridica aggiuntiva: Art. 9(2)(g) — interesse pubblico rilevante nel
settore dell'istruzione.

---

## 3. Dati Trattati

### 3.1 Categorie di dati personali

| Categoria | Dati specifici | Sensibilità | Retention |
|-----------|---------------|-------------|-----------|
| Identificativi | userId, email, nome | Bassa | 730 giorni |
| Didattici | Esperimenti completati, durata, errori | Bassa | 730 giorni |
| Emotivi | Mood (energico, confuso, frustrato...), livello confusione 0-10 | Media | 730 giorni |
| Sessione | Timestamp inizio/fine, durata, attività | Bassa | 730 giorni |
| Cognitivi | Concetti esplorati, meraviglie, difficoltà | Media | 730 giorni |
| Diario | Riflessioni scritte dallo studente | Media | 730 giorni |

### 3.2 Dati NON raccolti
- Dati biometrici
- Geolocalizzazione
- Immagini o video dello studente
- Dati di navigazione esterni alla piattaforma
- Cookie di profilazione o marketing

### 3.3 Flusso dei dati
```
Studente (browser) → localStorage (cifrato AES-256-GCM)
                    → Server EU Frankfurt (SQLite, cifrato in transito via HTTPS)
Docente → Server EU → Dashboard (dati aggregati della classe)
```

---

## 4. Misure di Sicurezza (Art. 32 GDPR)

### 4.1 Cifratura
- **In transito**: HTTPS/TLS su tutti gli endpoint
- **A riposo (client)**: AES-256-GCM con chiave derivata da PBKDF2 (100.000 iterazioni)
- **A riposo (server)**: SQLite su server EU con accesso autenticato

### 4.2 Autenticazione
- Token HMAC-SHA256 con verifica server-side
- Rate limiting: 30 richieste/minuto per IP
- Lockout dopo 5 tentativi falliti (15 minuti)
- Token con scadenza temporale

### 4.3 Controllo accessi
- Studenti: accesso solo ai propri dati
- Docenti: accesso ai dati aggregati della propria classe
- Admin: accesso completo con audit log
- CORS whitelist per origini autorizzate

### 4.4 Audit e monitoraggio
- Ogni richiesta API loggata: timestamp, userId, azione, endpoint, IP, status code
- Audit log conservato 730 giorni
- Accesso audit log solo per admin e il diretto interessato

### 4.5 Minimizzazione
- Solo dati strettamente necessari alla funzione didattica
- Nessun tracciamento cross-site
- Nessun cookie di terze parti

### 4.6 Data retention
- Retention massima: 730 giorni (2 anni scolastici)
- Cleanup automatico dei dati scaduti
- Diritto all'oblio implementato (DELETE /api/student/:id)

---

## 5. Diritti degli Interessati

### 5.1 Diritti implementati

| Diritto | Articolo | Implementazione |
|---------|----------|----------------|
| Accesso | Art. 15 | GET /api/sync (propri dati) |
| Rettifica | Art. 16 | POST /api/sync (aggiornamento) |
| Cancellazione | Art. 17 | DELETE /api/student/:id |
| Portabilità | Art. 20 | Export CSV dalla Teacher Dashboard |
| Opposizione | Art. 21 | Disattivazione account |

### 5.2 Diritti da implementare
- Notifica al Garante in caso di data breach (Art. 33) — processo da definire
- Registro dei trattamenti formale (Art. 30) — questo DPIA è una base

---

## 6. Valutazione dei Rischi

### 6.1 Matrice rischi

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|------------|---------|-------------|
| Accesso non autorizzato ai dati studente | Bassa | Alto | HMAC auth, CORS, rate limiting |
| Perdita dati server | Bassa | Medio | Backup SQLite, fallback localStorage |
| Intercettazione dati in transito | Molto bassa | Alto | HTTPS obbligatorio |
| Accesso a localStorage su dispositivo condiviso | Media | Medio | Cifratura AES-256-GCM |
| Data breach con esposizione dati emotivi | Bassa | Alto | Cifratura, minimizzazione, audit |
| Profilazione inappropriata del minore | Bassa | Alto | No ML su dati individuali, solo aggregati |

### 6.2 Rischio residuo
Il rischio residuo è considerato ACCETTABILE dato:
- I dati trattati sono prevalentemente didattici
- Le misure di sicurezza sono adeguate al rischio
- Il server è in EU (Frankfurt) per conformità GDPR
- Non vi è trasferimento dati extra-UE

---

## 7. Responsabile Esterno del Trattamento

### 7.1 Sub-responsabili

| Fornitore | Servizio | Sede | DPA |
|-----------|----------|------|-----|
| Render.com | Hosting server dati | Frankfurt (EU) | Da stipulare |
| Vercel | Hosting frontend (statico) | EU Edge | Da stipulare |
| Hostinger | n8n (AI backend) | EU | Da stipulare |

### 7.2 Azioni necessarie
- [ ] Stipulare DPA con Render.com
- [ ] Stipulare DPA con Vercel
- [ ] Stipulare DPA con Hostinger
- [ ] Verificare clausole contrattuali standard (SCC) se applicabile

---

## 8. Conclusioni e Azioni

### 8.1 Stato attuale
La piattaforma implementa misure tecniche significative per la protezione dei dati:
- Cifratura end-to-end (AES-256-GCM client + HTTPS)
- Autenticazione robusta (HMAC-SHA256)
- Audit logging completo
- Data retention automatica (730 giorni)
- Diritto all'oblio funzionante
- Server in EU (Frankfurt)

### 8.2 Azioni pendenti (P0)
1. Stipulare DPA con sub-responsabili (Render, Vercel, Hostinger)
2. Nomina DPO (se richiesto per il numero di trattamenti)
3. Pubblicazione privacy policy accessibile dall'app
4. Procedura notifica data breach (Art. 33)
5. Revisione legale di questo DPIA

### 8.3 Azioni pendenti (P1)
6. Consenso genitoriale digitale con verifica email
7. Registro trattamenti formale (Art. 30)
8. Test penetrazione da terza parte
9. Formazione operatori (docenti) sulla protezione dati

---

**Firma titolare**: _______________
**Data**: ___/___/2026
**Prossima revisione**: Entro 6 mesi dalla prima pubblicazione
