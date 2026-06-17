# Research Cycle 6 — 24/03/2026
**Mode**: RESEARCH  
**Score iniziale**: 0.8873 (build_pass=1.0, galileo_tag=0.8, gulpease=0.93, identity=1.0, content=1.0, ipad=0.675, lighthouse=0.62)

## 1. Analisi Mercato EdTech Italia 2026

### Competitor Diretti (Simulatori + AI)
**INSIGHT CRITICO**: Non esiste ancora un player consolidato che integri simulatore elettronica + AI tutor per scuole medie italiane. 

**Minacce future**:
- **Tinkercad + AI (Autodesk)**: rischio massimo. Tinkercad è già lo standard nelle scuole italiane. Se Autodesk aggiunge AI tutoring → competitor mortale.
- **Editori scolastici (Zanichelli, DeAgostini)**: potrebbero sviluppare/acquisire soluzione simile integrata nei libri digitali.

### Gap di Mercato per ELAB
1. **Gap Pedagogico**: Tinkercad è sandbox senza guida. ELAB offre percorso strutturato.
2. **Gap Valutazione**: Difficile per insegnanti correggere 25 progetti diversi. ELAB può dare dashboard automatica.
3. **Gap Curricolare**: Tool internazionali generici vs. allineamento Indicazioni Nazionali italiane.
4. **Gap Accessibilità**: Laboratorio virtuale vs. costi elevati kit fisici Arduino/Lego.

### Trend Emergenti 2026
- AI come co-pilota pedagogico (post-ChatGPT)
- Fondi PNRR per digitalizzazione "Scuola 4.0" 
- Aspettativa di personalizzazione avanzata
- Focus su apprendimento ibrido fisico/virtuale

## 2. Psychological Barriers Insegnanti Inesperti

### Paure Principali (Basato su ricerca pedagogica)
1. **Deficit conoscenza tecnica**: terrore di errori davanti alla classe
2. **Ansia domande impreviste**: "cosa faccio se chiede X?"
3. **Complessità cognitiva**: tradurre astratto in concreto per 10-14 anni
4. **Paura tecnologia**: timore di "rompere" simulazioni
5. **Pianificazione**: incertezza su progressione didattica

### Technological Instructional Overhead (TIO)
**Paper chiave trovato**: "Measuring the viability of maker technology adoption within classrooms" (2023)

> "For many teachers, the question of integrating making and technology within their classroom becomes 'is it worth the effort?' With few teachers expert in maker technologies before entering the classroom, issues of cognitive load associated with technology adoption are of high importance."

**Implicazione per ELAB**: Il "worth the effort" è il momento critico. ELAB deve dimostrare valore immediato con overhead minimo.

## 3. Customer Journey UX per Insegnanti

### Onboarding Ideale
1. **Demo protettiva**: sandbox sicura dove "non può rompersi nulla"
2. **Primo successo rapido**: LED si accende in <2 minuti
3. **Supporto progressivo**: da guida dettagliata a suggerimenti minimi
4. **Validazione esperta**: "anche i prof di università iniziano da qui"

### Microinteractions Critiche
- **Feedback immediato**: azione ricevuta e processata
- **Errori costruttivi**: "Cosa potremmo provare?" vs "Hai sbagliato"  
- **Progressi visibili**: badge/achievements per insegnante
- **Supporto just-in-time**: Galileo risponde in <5s

### Primo Aha Moment
**Scenario**: Insegnante prova primo circuito LED → si accende → Galileo spiega perché solo in un verso → insegnante capisce di aver imparato qualcosa di nuovo.

**Design**: Celebrare il momento con messaggio personalizzato "Complimenti! I tuoi studenti scopriranno la polarità nello stesso modo."

## 4. Implementazione nel Sistema Attuale

### Già Implementato ✅
- **teacher.yml prompt**: supporto pre-lezione strutturato
- **Curriculum YAML**: 62/62 esperimenti con teacher_briefing 
- **Vocabulary progression**: termini consentiti/vietati per capitolo
- **Common mistakes**: errori tipici + reazioni suggerite

### Gap da Colmare 🔄
1. **Modalità teacher separata**: attualmente prompting, serve UI dedicata
2. **Dashboard insegnante**: tracking progressi classe, report automatici
3. **Progressive disclosure**: UI si adatta a competenza insegnante
4. **Onboarding guidato**: primo successo in 2-3 click
5. **Latenza <5s**: attualmente 19s = inutilizzabile per ansia insegnante

## 5. Academic Research Found

### Paper 1: Technological Instructional Overhead (2023)
- **Concept**: TIO = cognitive load + practical considerations for technology adoption
- **Relevance**: Framework per misurare "worth the effort" di ELAB
- **Citation**: 1 (nuovo, high potential)

### Paper 2: AI Adoption in STEM Education (2025) 
- **Citation**: 22 (trend emergente)
- **Focus**: Model per adozione AI da parte insegnanti STEM
- **Relevance**: Galileo rientra esattamente in questo modello

## 6. Priorità Ricerca per Prossimi Cicli

### Immediate (P0)
1. **User research**: interviste 5-10 prof tecnologia scuole medie  
2. **Competitor monitoring**: alerting su Tinkercad + AI developments
3. **TIO measurement**: quantificare cognitive load ELAB vs alternative

### Medium-term (P1)
1. **Pilot school program**: validation con 2-3 istituti partner
2. **Teacher training materials**: video/guide per first-time use
3. **Success metrics**: definire KPIs per teacher mastery journey

## 7. Raccomandazioni Immediate

### Per IMPROVE mode
1. **Fix latenza SUBITO**: 19s → <5s (Groq, VPS migration, keep-alive)
2. **Fix iPad buttons**: 13 bottoni <44px su vetrina Netlify  
3. **Teacher onboarding**: modal guide per primo accesso
4. **Success celebration**: feedback quando insegnante completa primo esperimento

### Per future RESEARCH cycles  
1. **Teacher interviews**: capire veri pain points on-field
2. **Competitive intelligence**: monitoring continuo Tinkercad/Autodesk
3. **Academic partnerships**: collaborazione con univ. per validation studies

---

**Next Actions**: Fix blockers tecnici (latenza, iPad) per abilitare user research reale con insegnanti.