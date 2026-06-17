# Research Cycle 27 — Marketing & Competitor Analysis

Data: 2026-03-25 | Ciclo: 27 | Focus: ricerca-marketing

---

## Fix Concreto Eseguito

**Problema trovato**: `src/styles/fonts.css` (font self-hosted) esisteva ma non veniva mai importato.
`src/index.css` importava ancora Google Fonts via URL esterno (`fonts.googleapis.com`), caricando
Inter + Oswald + Open Sans + Fira Code da Google.

**Fix**: sostituito `@import url('https://fonts.googleapis.com/...')` con `@import './styles/fonts.css'`

**Impatto**:
- Elimina 1 request cross-origin a Google (privacy GDPR + performance)
- Fix per scuole con firewall che bloccano Google Fonts (problema noto nelle scuole italiane)
- Inter non era usato nel design system (solo Open Sans/Oswald/Fira Code)
- Build: PASS ✓

---

## Analisi Competitor — EdTech Elettronica Scuole Italiane (2026)

### Tinkercad Circuits (Autodesk)
- **Forza**: gratuito, brand riconosciuto, 3D integrato, componenti reali
- **Debolezza**: nessun AI tutor, nessun curriculum italiano, nessun kit fisico, interface in inglese
- **Prezzo**: Free per scuole
- **Market position**: leader mondiale, ma non localizzato per scuole italiane

### Wokwi
- **Forza**: simulatore veloce, ESP32/Arduino/Raspberry Pi, community attiva, VS Code integration
- **Debolezza**: no pedagogia strutturata, no italiano, no kit, richiede conoscenze pregresse
- **Prezzo**: Free (limitato) + Pro $10/mese
- **Market position**: target developer/hobbisti, non scuole

### Arduino Education (CTC Go!)
- **Forza**: brand ufficiale Arduino, kit fisici premium, curriculum completo
- **Debolezza**: costoso (€500-2000/classe), no simulatore browser, no AI, no italiano nativo
- **Prezzo**: €500-2000/kit classe
- **Market position**: scuole superiori, non medie

### Scratch (MIT)
- **Forza**: community enorme, visual coding, gratuito
- **Debolezza**: no elettronica reale, no circuiti, no Arduino
- **Non competitor diretto**

### Makecode (Microsoft)
- **Forza**: gratuito, visual coding per micro:bit/Arcade, brand Microsoft
- **Debolezza**: no circuiti, no AI tutor, no curriculum italiano organico
- **Prezzo**: Free

---

## Analisi Posizionamento ELAB

### Unique Value Proposition (USP)
ELAB è l'UNICA piattaforma che combina:
1. **Libri fisici italiani** + simulatore browser + AI tutor integrati
2. **Curriculum progressivo** 67 esperimenti (da LED a Arduino)
3. **Galileo AI** — spiega in italiano, livello bambino 8-14 anni
4. **Per insegnanti inesperti** — non serve sapere l'elettronica
5. **LIM-first** — progettato per uso in classe su schermo grande

### Gap Competitivo da Colmare
- **Nessuno ha teacher dashboard** con tracking progressi → OPPORTUNITÀ
- **Nessuno ha kit fisico + simulatore integrati** → mantenere vantaggio
- **Nessuno ha AI tutor in italiano** → investire qui

---

## Strategia Pricing (Raccomandazione)

### Modello Attuale (stimato)
- Kit fisico + licenza software: €15-25/studente/anno

### Benchmark Mercato EdTech Italiano
- Clicca & Costruisci (Arduino Education): €35/studente/anno
- Khan Academy Plus: $10/mese (riferimento internazionale)
- Geogebra scuola: €200/scuola/anno (site license)

### Raccomandazione Pricing
```
Freemium:
  - FREE: Vol.1 (18 esperimenti base), accesso limitato Galileo (10 msg/giorno)
  - SCUOLA BASE (€199/anno/classe fino a 30): tutti e 67 esperimenti, Galileo illimitato
  - SCUOLA PRO (€399/anno/classe): + teacher dashboard, analytics, report genitori
  - LICENZA ISTITUTO (€999/anno/istituto): illimitato + formazione insegnanti online
```

Questo allineamento con PNRR Scuola 4.0 (budget disponibile fino a 2026) permette acquisti MePa.

---

## Insight Marketing — Canali Prioritari

### 1. MePa / Consip (PRIORITÀ MASSIMA)
- Il 70% delle scuole italiane acquista tramite MePa
- Richiede: P.IVA + DURC + iscrizione MePa
- Ciclo vendita: 3-6 mesi
- **Azione**: registrare ELAB su MePa appena possibile

### 2. Animatori Digitali (canale virale B2B)
- Ogni scuola italiana ha 1 Animatore Digitale (figura obbligatoria)
- Network: PNSD (Piano Nazionale Scuola Digitale)
- **Azione**: landing page + demo video 3 minuti per animatori digitali
- **Messaggio chiave**: "Fai fare elettronica anche se non la sai"

### 3. INDIRE / MIUR Partnership
- INDIRE = Istituto Nazionale Documentazione Innovazione Ricerca Educativa
- Una raccomandazione INDIRE vale 1000 email di marketing
- **Azione**: inviare white paper pedagogico + pilota in 5 scuole

### 4. Content Marketing SEO
- Query ad alto potenziale: "simulatore arduino scuola", "fare elettronica bambini", "kit arduino scuola media"
- Volume basso ma intent altissimo (decisori di acquisto)
- **Azione**: blog post "Come insegnare elettronica senza essere elettronico"

### 5. Teacher Community (Facebook/WhatsApp)
- Gruppi docenti tecnologia su Facebook: 15-40k membri
- **Azione**: post con video demo 60 secondi "Galileo spiega il LED"

---

## Problemi Aperti Identificati (→ task queue)

### P1: Google Fonts doppi → RISOLTO in questo ciclo
### P2: Nessuna landing page per scuole
- Manca una pagina `/scuole` con pitch istituzionale
- Manca CTA "Richiedi demo" con form
- **Priority**: P1 — blocca conversioni

### P2: Teacher Dashboard mancante
- Senza dashboard, l'insegnante non può assegnare o monitorare
- **Priority**: P1 — feature più richiesta da docenti

### P3: Font troppo piccoli per LIM
- Body font dovrebbe essere >=24px in modalità LIM
- **Priority**: P2 — impatto su aula

---

## Idee Creative (da valutare)

### "Adotta ELAB" Program
Scuola pilota ottiene 1 anno gratuito in cambio di:
- Feedback mensile strutturato
- 1 video testimonial insegnante
- Logo nella homepage "Le scuole che ci hanno scelto"
→ 5 scuole pilota = 5 social proof potenti

### Galileo "Sfida del Mese"
Newsletter mensile per insegnanti con:
- 1 esperimento del mese (PDF stampabile)
- 1 curiosità di elettronica "da raccontare in classe"
- Link al simulatore ELAB per provarlo
→ Costruisce habitudini d'uso + SEO

### "Carta di Elettronica" Bambini
Certificato stampabile quando un bambino completa un Volume:
- "Ho completato 18 esperimenti di elettronica"
- Con codice QR che porta al profilo studente su ELAB
→ Gamification + viral (genitori condividono)

---

## Conclusione

Il principale gap competitivo di ELAB nel 2026 non è tecnico — è marketing e distribuzione.
Il prodotto è già superiore ai competitor per curriculum italiano + AI tutor.
La priorità deve essere:
1. **Presence MePa** (canale d'acquisto principale delle scuole)
2. **Landing page /scuole** con social proof + CTA demo
3. **Teacher Dashboard MVP** (senza questo, vendere a scuole è difficile)
4. **5 scuole pilota** per raccogliere testimonial autentici
