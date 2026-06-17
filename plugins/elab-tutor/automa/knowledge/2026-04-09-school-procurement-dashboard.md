# Italian School EdTech Procurement & Teacher Dashboard Requirements 2026

> Research Report — ELAB Researcher Agent — 09/04/2026
> Topic: How Italian schools buy EdTech + what Teacher Dashboard needs to have

---

## 1. How Italian Schools Actually Buy Software

### Decision Chain (chi decide)

| Ruolo | Potere | Note |
|-------|--------|------|
| **Dirigente Scolastico (DS)** | Approva acquisti, firma contratti | Ha budget autonomo fino a soglia |
| **DSGA** | Istruisce procedure acquisto, gestisce MePA | Gatekeeper amministrativo |
| **Animatore Digitale** | Propone strumenti, valuta tecnicamente | Influencer chiave per EdTech |
| **Team Innovazione** | Supporta Animatore, testa prodotti | 3 docenti per scuola |
| **Collegio Docenti** | Approva piano digitale (PTOF) | Voto collegiale |

**Insight critico**: Il vero decisore NON e' il DS ma l'**Animatore Digitale** che propone e testa. Il DS firma. Il DSGA esegue l'acquisto su MePA.

### Procedura di Acquisto

1. L'Animatore Digitale identifica il bisogno e propone lo strumento
2. Il Team Innovazione testa (trial gratuito essenziale)
3. Il DS approva l'inserimento nel PTOF/piano digitale
4. Il DSGA verifica la disponibilita' su MePA
5. Acquisto tramite MePA (obbligatorio per PA) o affidamento diretto (sotto soglia €5.000)
6. Documentazione caricata su piattaforma PNRR se finanziato

### Soglie di Acquisto (Codice Appalti D.Lgs 36/2023)

- **< €5.000**: Affidamento diretto semplificato (il DS decide)
- **€5.000 - €140.000**: Affidamento diretto con confronto preventivi
- **> €140.000**: Procedura negoziata (raro per software didattico)

**Per ELAB**: Il pricing €20/classe/mese = ~€200/anno per classe. Una scuola con 10 classi = €2.000/anno. Sotto soglia €5.000 = il DS puo' comprare SENZA gara.

### Fondi Disponibili

- **PNRR Scuola 4.0**: Almeno 60% del budget deve andare in dotazioni digitali (inclusi software, app, contenuti). Scadenza rendicontazione: 30/06/2026.
- **DM 219/2025**: 100M€ per AI nelle scuole. Scadenza candidatura: 17/04/2026.
- **Fondi di Istituto**: Budget annuale autonomo per materiale didattico.

Fonte: [PNRR Scuola 4.0 FAQ](https://www.assoedu.it/pnrr-scuola-4-0-le-faq-pubblicate-dal-mim/), [MIM PNRR](https://pnrr.istruzione.it/wp-content/uploads/2026/03/m_pi.AOOGABMI.REGISTRO-UFFICIALEU.0073226.27-03-2026.pdf)

---

## 2. Garante Privacy 2026: AI nelle Scuole sotto Ispezione

### Piano Ispettivo 1° Semestre 2026 (Provvedimento n.797, 30/12/2025)

**CRITICO per ELAB**: Il Garante ha incluso l'AI in ambito scolastico tra i target delle 40+ ispezioni del 2026. Le verifiche riguardano:

1. **DPIA obbligatoria** — Valutazione d'Impatto sulla Protezione dei Dati per strumenti AI che trattano dati di minori
2. **Informative alle famiglie** — Chiare, complete, comprensibili
3. **Contratti con fornitori** — DPA (Data Processing Agreement) con misure tecniche adeguate
4. **Trasparenza algoritmi** — Come funziona l'AI, quali dati usa, dove li conserva

### Documenti che le scuole devono avere

- Informativa privacy aggiornata (art. 13-14 GDPR)
- DPIA per strumenti AI (art. 35 GDPR)
- Registro trattamenti (art. 30 GDPR)
- Contratto/DPA con ogni fornitore software (art. 28 GDPR)
- Autorizzazioni specifiche al personale

### Azione per ELAB

ELAB **DEVE** fornire alle scuole:
- Template DPA pre-compilato
- Informativa privacy per famiglie (in italiano semplice)
- Documentazione tecnica su dove e come i dati sono trattati
- Scheda tecnica "GDPR compliance" da allegare all'ordine

**Senza questi documenti, nessun DS comprera' ELAB nel 2026.** Le ispezioni del Garante rendono i DS molto cauti.

Fonte: [Federprivacy - Piano Ispezioni 2026](https://www.federprivacy.org/informazione/garante-privacy/garante-privacy-varato-il-piano-delle-ispezioni-del-1-semestre-2026-sotto-la-lente-data-breach-whistleblowing-telemarketing-e-ai-in-ambito-scolastico), [DSGA Online - Ispezioni AI](https://dsgaonline.it/2026/02/06/ispezioni-garante-privacy-2026-controlli-sullia-nelle-scuole/), [Garante Privacy FAQ Scuola](https://www.garanteprivacy.it/home/faq/scuola-e-privacy)

---

## 3. Registro Elettronico: Il Muro da Superare

### Mercato Dominato da 4 Player

| Piattaforma | Quote stimate | Note |
|-------------|--------------|------|
| **ClasseViva (Spaggiari)** | ~40% | Dominante, lock-in forte |
| **Argo DidUp** | ~25% | In crescita, migrazioni da Axios |
| **Axios** | ~15% | In declino, problemi tecnici |
| **Nuvola (Madisoft)** | ~10% | Open, API migliori |
| **MasterCom** | ~5% | Nicchia |
| Altri | ~5% | Frammentazione |

### Problema Interoperabilita'

L'Antitrust ha indagato Argo e Axios per aver bloccato l'export dei dati verso registri elettronici concorrenti. Questo significa che le scuole sono spesso **locked in** al proprio registro.

### Strategia ELAB

ELAB NON deve competere col registro elettronico. Deve essere **complementare**:
- **Zero integrazione necessaria** — ELAB funziona standalone
- **Export CSV** per importare voti/progressi nel registro
- **Codice classe** (gia' implementato) — il docente crea la classe in ELAB senza sincronizzare col registro
- **Futuro**: API di export compatibile con formato ClasseViva/Argo (CSV specifico)

Fonte: [Antitrust indagine registri](https://www.corrierecomunicazioni.it/digital-economy/scuola-l-antitrust-indaga-sui-registri-elettronici/), [Argo](https://www.portaleargo.it/), [Registro Elettronico novita' 2026](https://www.ersaf.it/edunews/registro-elettronico-scuola-novita-dal-2026-accesso-esclusivo-tramite-spid-o-cie-per-i-genitori-degli-alunni-delle-medie/)

---

## 4. Teacher Dashboard: Requisiti Minimi per Vendere

### Funzionalita' Obbligatorie (basate su ricerca mercato)

| Feature | Priorita' | Stato ELAB |
|---------|-----------|------------|
| **Lista studenti con progressi** | P0 | Parziale (localStorage) |
| **Esperimenti completati per studente** | P0 | Parziale |
| **Export CSV** | P0 | Non implementato |
| **Vista classe aggregata** | P1 | Non implementato |
| **Errori frequenti della classe** | P1 | classProfile.js ha i dati |
| **Tempo speso per esperimento** | P1 | Tracciato in sessioni |
| **Notifiche nudge al docente** | P2 | nudgeService esiste |
| **Report stampabile** | P2 | Non implementato |
| **Multi-classe** | P2 | Struttura Supabase pronta |

### Design Requirements (da ricerca UX education dashboards)

1. **Semplicita'**: Docenti hanno ~5 minuti per guardare la dashboard. Max 3 click per qualsiasi dato.
2. **Real-time non serve**: Aggiornamento ogni fine sessione e' sufficiente.
3. **Mobile-friendly**: Molti docenti controllano da telefono.
4. **Codice colore**: Verde/Giallo/Rosso per stato studente (come semaforo).
5. **Zero configurazione**: La dashboard deve funzionare appena il docente crea la classe.

### Benchmark Competitor

- **TinkerCAD Classrooms**: Lista studenti, progetto completato si/no, nessun analytics avanzato
- **Arduino Cloud for Education**: Progressi codice, errori compilazione, tempo
- **CampuStore/WeSchool**: Completamento moduli, quiz scores, export

**ELAB puo' superarli tutti** con: confusione tracking (unico nel mercato), errori pattern, suggerimenti AI per il docente.

Fonte: [Teacher Dashboard Design](https://luminusdatasolutions.com/blog/2025/03/student-data-dashboards-in-5-simple-steps/), [LMS Dashboard 2026](https://multipurposethemes.com/blog/why-lms-dashboard-2026-is-changing-digital-learning-forever/), [Student Progress Tracking](https://skolera.com/en/blog/tracking-student-progress-software/), [Learning Analytics for Teachers](https://www.mdpi.com/2227-7102/13/12/1190)

---

## 5. Pricing Strategy per il Mercato Italiano

### Modelli che Funzionano nell'EdTech

| Modello | Pro | Contro | Adatto a ELAB? |
|---------|-----|--------|----------------|
| **Freemium** | 92% docenti scoprono via trial gratuito | Conversione bassa (2-5%) | SI per acquisizione |
| **Per-studente/anno** | Scalabile, allineato a budget scuola | Complesso da tracciare | NO (ELAB e' per classe) |
| **Per-classe/mese** | Semplice, prevedibile | Richiede valore continuo | SI — modello attuale €20/classe/mese |
| **Licenza annuale** | Un pagamento, semplice per DSGA | Cash flow irregolare | SI come alternativa |
| **Outcome-based** | Innovativo, allineato a risultati | Difficile da misurare | FUTURO |

### Raccomandazione Pricing ELAB

1. **Trial gratuito 30 giorni** — senza carta di credito, senza limiti
2. **Piano Classe**: €200/anno (= €20/mese x 10 mesi scolastici) — sotto soglia affidamento diretto
3. **Piano Scuola**: €1.500/anno (fino a 10 classi) — sconto volume
4. **Piano PNRR**: €3.000/anno (illimitato) — prezzo per bando, include formazione

Il 92% dei docenti scopre EdTech tramite trial gratuito (EdSurge). Senza free trial, ELAB non entra nelle scuole.

Fonte: [EdTech Pricing Models](https://www.getmonetizely.com/articles/edtech-pricing-models-monetizing-education-technology-effectively), [EdTech Pricing Guide](https://medium.com/edulift/how-to-price-your-edtech-product-3-lessons-from-successful-startups-6d6bc91dba7b)

---

## 6. Mercato EdTech Italia: Numeri Reali

- **€2.7 miliardi** — valore mercato EdTech Italia
- **~11.000 dipendenti** nel settore
- **€74M raccolti** da startup EdTech nel 2024 (+174%)
- **68% startup** targettizza B2B enterprise, non scuole
- **45% soluzioni** gia' AI-powered
- **60% startup early-stage** costruite su AI generativa

**Opportunita' ELAB**: La maggior parte delle startup EdTech punta alle aziende, non alle scuole. ELAB punta alle scuole = meno competizione diretta nel segmento K-8/K-14.

Fonte: [Rapporto EdTech 2026](https://blog.skills.it/rapporto-edtech-2026-trend-futuro-formazione), [EdTech Italia aziende vs scuole](https://techbusiness.it/edtech-italia-2026-rapporto-aziende-imprese-scuole/), [Osservatori EdTech](https://www.osservatori.net/comunicato/hr-innovation-practice/mercato-edtech-italia/)

---

## 7. CampuStore: Il Modello da Studiare (e Non Imitare)

CampuStore e' il distributore dominante di EdTech nelle scuole italiane:
- **30+ anni** di attivita'
- **10.000+ prodotti** in catalogo
- Modello **Long Tail** (come Amazon per la scuola)
- Partner ufficiale **Arduino Education**
- Presente su **MePA**

### Perche' ELAB NON deve passare da CampuStore

1. CampuStore prende margine del 30-40%
2. ELAB ha gia' la filiera (Omaric hardware + Giovanni vendite + Davide MePA)
3. CampuStore venderebbe ELAB come "uno dei 10.000 prodotti" — nessuna attenzione speciale
4. Il team ELAB puo' vendere diretto + MePA con margini migliori

### Cosa Imparare da CampuStore

- **Formazione inclusa**: Ogni prodotto ha webinar/corso per docenti
- **Supporto post-vendita**: Help desk dedicato per scuole
- **PNRR compliance**: Kit documentazione per rendicontazione
- **Catalogo MePA**: Presenza obbligatoria

Fonte: [CampuStore Arduino](https://www.campustore.it/elettronica-e-fablab/arduino.html), [Italian EdTech Market Paper](https://epaa.asu.edu/index.php/epaa/article/download/8657/3569/43749)

---

## Action Items Concreti per ELAB

### Immediati (prima del 17/04/2026)
1. **Candidatura DM 219/2025** — Andrea deve agire subito (100M€ per AI scuole)
2. **Preparare kit GDPR** — DPA template + informativa famiglie + scheda tecnica
3. **Dashboard MVP P0** — Lista studenti + progressi + export CSV (senza questo, nessuna vendita)

### Entro Giugno 2026
4. **MePA** — Verificare con Davide lo stato iscrizione (senza MePA = no vendite PA)
5. **Trial gratuito 30gg** — Implementare onboarding senza carta di credito
6. **Export CSV** — Formato compatibile con i registri elettronici principali
7. **Formazione docenti** — 1 webinar "come usare ELAB in classe" (30 min)

### Q3-Q4 2026
8. **Piano PNRR** — Pacchetto €3.000/anno con documentazione per rendicontazione
9. **API export** — Formato ClasseViva/Argo per import voti
10. **Certificazione AGID** — Per catalogo software PA
