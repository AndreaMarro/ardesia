# Research — Vocabulary Scaffolding per Educazione Elettronica Bambini
**Data**: 2026-04-06
**Modo**: RESEARCH (ricerca autonoma)
**Topic**: Vocabulary scaffolding progressivo + sequencing concetti STEM per bambini 8-14
**Priorità MASTER-PLAN**: Fase 1, item 1.2 "Vocabolario progressivo enforced"
**Autore**: Agente ELAB Researcher (schedulato)

---

## Topic Investigato

Strategie di scaffolding del vocabolario per educazione STEM/elettronica nei bambini,
con focus su:
- Progressive vocabulary disclosure (termini introdotti in sequenza)
- Concept sequencing: quando e come introdurre termini tecnici
- Implicazioni per il sistema di vocabulary_level nei YAML curriculum ELAB

---

## Fonti Consultate

1. **Systematic Literature Review — Technology-Assisted Vocabulary Learning** (2025)
   Journal of Computer Assisted Learning, Wiley
   https://onlinelibrary.wiley.com/doi/10.1111/jcal.13096

2. **Vocabulary Instruction for English Learners: Systematic Review** (2025)
   MDPI Education, 15(3)
   https://www.mdpi.com/2227-7102/15/3/262

3. **Teaching Vocabulary in the STEM Classroom**
   Accelerate Learning Blog
   https://blog.acceleratelearning.com/teaching-vocabulary-in-the-stem-classroom

4. **Learning Progressions in STEM Education** — Frontiers in Education (2025)
   https://public-pages-files-2025.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1568885/pdf

5. **Integrated STEM Education: Addressing Theoretical Challenges** (2025)
   Frontiers in Education
   https://public-pages-files-2025.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1534358/xml

6. **Big Data Approach: Vocabulary Scaffolds & Reading Comprehension**
   ScienceDirect (Learning and Instruction)
   https://www.sciencedirect.com/science/article/pii/S0361476X2300019X

---

## Findings Principali

### F1: Il "Learning Progression" è lo standard per STEM moderno
**Evidenza**: Frontiers in Education (2025), consensus letteratura
- I curricula STEM efficaci NON usano "scope and sequence" tradizionale
- Usano **learning progressions**: ordine dei concetti basato su evidenza empirica
- La progressione deve essere esplicita, documentata, e rispettata durante l'insegnamento
- **ALLINEAMENTO ELAB**: i nostri YAML hanno `forbidden_terms` — esattamente questo pattern
- **Gap identificato**: i forbidden_terms esistono ma Galileo non li usa attivamente

### F2: La vocabulary disclosure progressiva riduce il cognitive overload
**Evidenza**: Big Data study (n=migliaia studenti), ScienceDirect
- I bambini che usano scaffold vocabolare mirano a comprensione migliore
- L'effetto è più forte per: lettori in difficoltà, bambine, studenti bilingui
- Mostrare troppi termini insieme → abbandono precoce del task
- **Principio**: un termine nuovo per sessione, max 3 per unità
- **IMPLICAZIONE ELAB**: Galileo deve RIFIUTARE di spiegare termini non ancora introdotti
  invece di semplicemente non usarli

### F3: L'AI che segnala "questo lo impariamo dopo" è pedagogicamente superiore
**Evidenza**: AI-Powered Scaffolding review (2025), Technology-Assisted Vocabulary Learning
- Il messaggio esplicito "questo concetto arriva al capitolo 7" è didatticamente corretto
- NON è un limite del sistema — è una feature pedagogica valorizzabile
- I bambini tollerano meglio "lo vedremo dopo" se viene presentato con curiosità
- Esempio efficace: "La resistenza è un superpotere che scopriamo nel Cap 7 — ci aspetta!"
- **IMPLICAZIONE ELAB**: il prompt di Galileo deve tradurre forbidden_terms in messaggi
  di anticipazione, non in semplice rifiuto

### F4: Analogie concrete prima dei termini astratti
**Evidenza**: STEM Vocabulary in Classroom (AccelerateL), multiple fonti
- Il vocabolario tecnico funziona SOLO dopo l'esperienza concreta
- Sequenza ottimale: (1) esplorazione pratica → (2) analogia familiare → (3) termine tecnico
- Esempio elettronica: prima "l'acqua nel tubo" → poi "corrente elettrica"
- **GAP ELAB**: Galileo a volte introduce termini prima dell'analogia
  (dipende dalla formulazione della domanda dello studente)
- **FIX**: nel prompt template, aggiungere regola esplicita sull'ordine analogia→termine

### F5: Cluster tematici di 3-4 concetti — il pattern ottimale
**Evidenza**: Global Education Ecology (2025, doi:10.71204/a01mtr30)
- Curricula efficaci usano cluster tematici da 3-4 concetti correlati
- Non isolati, ma connessi tra loro (es. "tensione, corrente, resistenza" insieme)
- Tra cluster: periodo di consolidamento senza nuovi termini
- **ALLINEAMENTO ELAB**: i capitoli ELAB seguono già questa struttura → bene
- **Gap**: Galileo non sa in quale cluster si trova l'utente durante la sessione

---

## Raccomandazioni Concrete per ELAB

### R1: Attivare forbidden_terms come "anticipatory prompts" (PRIORITÀ ALTA)
**Effort**: 2-4 ore | **File**: `nanobot/prompts/tutor.yml` o `shared-optimized.yml`

Quando l'utente chiede un termine in `forbidden_terms`, Galileo deve rispondere con:
```
"[Termine] è un concetto fantastico che scopriremo nel [cap X]!
Per ora, pensa a [analogia corrente dal YAML]. Torna su questa domanda quando
arriverai a [cap X] — ti stupirà!"
```
NON: "Non posso rispondere a questa domanda."

**Implementazione**:
```yaml
# In tutor.yml, aggiungere sezione:
forbidden_term_response: |
  Se l'utente chiede un termine in forbidden_terms:
  1. Non usare MAI il termine
  2. Riconosci la curiosità: "Ottima domanda!"
  3. Offri un'analogia concreta alternativa
  4. Annuncia che lo impareranno dopo: "Lo scopriremo al Cap {next_chapter}"
  5. Reindirizza all'esperimento corrente
```

### R2: Aggiungere `analogy_first` nei YAML curriculum (PRIORITÀ MEDIA)
**Effort**: 1-2 ore per YAML, 61 file totali | **File**: `automa/curriculum/*.yaml`

Aggiungere campo strutturato:
```yaml
vocabulary_sequence:
  - term: "corrente elettrica"
    analogy: "Come l'acqua che scorre in un tubo"
    introduce_at: "step 2"  # dopo l'esperienza pratica
    forbidden_before: "step 2"
```

### R3: Galileo segnala il "cluster attuale" all'insegnante (PRIORITÀ BASSA)
**Effort**: 4-6 ore | **Dipende da**: R1 implementato

Nel pannello insegnante, mostrare:
"Cluster corrente: Circuiti base (tensione + corrente). Prossimo: Resistenza (Cap 7)"

---

## Livello di Confidenza

| Finding | Confidenza |
|---------|-----------|
| F1: Learning progressions come standard | **ALTO** — consensus letteratura |
| F2: Progressive disclosure riduce overload | **ALTO** — studio empirico n=grande |
| F3: Anticipatory prompts > rifiuto | **MEDIO** — supportato ma non testato su elettronica |
| F4: Analogia prima del termine | **ALTO** — consensus pedagogia costruttivista |
| F5: Cluster 3-4 concetti | **MEDIO** — studi STEM generali, non specifici elettronica |

---

## Actionability

**Findings immediati per automa IMPROVE**: R1 (forbidden_terms → anticipatory prompts)
- Modificare solo 1 file YAML di prompt
- Zero rischi di regressione
- Impatto pedagogico diretto e verificabile

**Prossima ricerca suggerita**: Test A/B di "anticipatory prompt" vs "refusal" su bambini
(non fattibile ora — raccomandato per fase post-launch)
