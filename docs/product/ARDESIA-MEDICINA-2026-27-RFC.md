# ARDESIA | Piattaforma didattica universale, verticale Semestre Filtro Fisica 2026/27
**RFC di prodotto e architettura v0.1 — 17 ottobre 2026 — DRAFT, NON IMPLEMENTATO.**
**Base verificata:** main b124eee04acc8062c27284f23c5d9108e3767c27, ultimo commit 23/08/2026. Lavori più avanzati in PR #259, #256–258 **closed without merge**: non assumere che siano presenti in main. Nessun deploy, merge, dato studente reale, chiamata modello o prova UX compiuta da questa RFC.

## 0. Decisione

ARDESIA non è una banca quiz, né una piattaforma specifica di Medicina. È un **ambiente didattico paper-first, local-first e plugin-native**, con LessonOS come memoria fattuale, evidenza e continuità e un Core MCP avanzato come interfaccia programmabile, sicura e provider-neutral. Ogni docente deve poter lavorare sulla lavagna, assegnare un'attività, ricevere un elaborato, correggerlo rapidamente e ritrovare gli errori/osservazioni verificati alla lezione successiva.

**Primo verticale commerciale:** Fisica del semestre aperto di Medicina/Odontoiatria/Veterinaria in italiano, a.a. 2026/2027; successivo allargamento a Biologia e Chimica tramite revisori disciplinari. **Scalabilità curricolare:** Analisi, Elettrotecnica, Fisica Tecnica, discipline non-STEM, esami differenti tramite CoursePack e adapter di verifica, senza fork della Core app.

**Fuori dai claim iniziali:** promesse di ammissione, predizione probabilità successo, diagnosi automatica della persona, correzione affidabile al 100%, parità con GoodNotes o generico "rivoluzionario" prima di prove indipendenti. Si misura efficacia; non la si dichiara.

## 1. Fonti normative: versione e confini

- Legge 14 marzo 2025 n.26 e D.Lgs. 15 maggio 2025 n.71: quadro del semestre aperto, sostitutivo del vecchio test italiano.
- [D.M. 941 del 10/07/2026, allegati 1–5](https://www.mur.gov.it/it/atti-e-normativa/decreto-ministeriale-n-941-del-10-7-2026): accesso e modalità; norma specifica per a.a. 2026/27.
- [D.D. 249 del 13/07/2026](https://www.mur.gov.it/it/atti-e-normativa/decreto-direttoriale-n-249-del-13-7-2026): appelli 10 dicembre 2026 e 11 gennaio 2027.
- [MUR, comunicato 13/07/2026](https://www.mur.gov.it/it/news/lunedi-13072026/medicina-al-le-iscrizioni-al-semestre-aperto): tre insegnamenti da 6 CFU; 31 quesiti per prova (21 risposta multipla + 10 completamento), 50 minuti ciascuna; corretta +1, errata -0,1, omessa 0; pubblicazioni esiti 23/12/2026 e 20/01/2027. Lode e soglie/graduatorie vanno trattate da un modulo normativo separato previa lettura integrale di DM/allegati, non dedotte dal calcolo dei quiz.
- [Syllabus MUR Fisica giugno 2026](https://www.mur.gov.it/sites/default/files/2026-06/Syllabus_FISICA_%20finale%202026.pdf); [pagina MUR dei tre Syllabus](https://www.mur.gov.it/it/news/venerdi-19062026/semestre-aperto-aa-2026-2027): Fisica 7 unità, CFU 0,2 / 1,4 / 1,2 / 0,4 / 1,0 / 1,2 / 0,6, totale 6, con quote minime esercitazioni 20%/25%/25%/20%/30%/30%/20%. Riferimenti alle applicazioni biomediche.
- Il semestre italiano in lingua italiana non deve essere confuso con IMAT/percorsi in inglese, disciplinati da atti differenti (es. D.M. 1005/2026). Norme dell'a.a. successivo richiedono una nuova release CoursePack.

**Qualità fonti:** riferimenti ufficiali controllati mediante pubblicazioni indicizzate; al momento della stesura il fetch diretto del PDF MUR restituisce HTTP 403 al lettore: la trascrizione contenutistica completa e la certificazione di ogni sotto-argomento devono essere rieseguite su copie integrali affidabili prima di qualificare il pack come VERIFIED. Versionare source URL, giorno di verifica, checksum del documento acquisito, revisione e reviewer. Le quote CFU non equivalgono a una quota ministeriale vincolante di domande d'esame.

## 2. Mercato: ipotesi competitiva, non esclusività

Il MUR/CRUI/CISIA offre contenuti, quesiti e simulazioni **gratis**: https://www.mur.gov.it/it/news/martedi-01092026/medicina-semestre-aperto-online-le-prime-esercitazioni-prepararsi-agli-esami
Alpha Test commercializza migliaia di quiz, simulazione e tutor IA; anche concorrenti minori commercializzano spaced repetition e quaderno degli errori. Non rivendicare queste caratteristiche come originalità esclusiva.

**Differenziazione da verificare:** una soluzione manoscritta su lavagna/foto -> revisione del procedimento guidata da rubric e docente -> evidenza di *dove* il ragionamento si interrompe -> esercizio isomorfo ma diverso -> continuità fino a una nuova lezione -> materiale formativo generato dall'attività originale, senza copiare o pubblicare i dati privati dello studente. Un insegnante può adottare il flusso in meno di 5 minuti senza conoscere la tecnologia sottostante.

**Offerta separabile:** (1) accesso studente gratuito con invio/consultazione e studio su quiz base; (2) abbonamento tutor per workflow, spazi, revisione, portabilità; (3) pacchetti/course creators condivisibili o vendibili tramite il marketplace in fase successiva; (4) scuole/licenze di équipe. Rispettare la direzione originaria zero commissioni sulle lezioni; eventuale prezzo-base storico intorno a €15/mese e marketplace 70/30 sono IPOTESI/CANON DA VALIDARE, non listini approvati. La computazione AI può essere a quote incluse con limiti/consenso e costo visibile; evitare sussidi illimitati.

## 3. Una sola app, tre superfici

Conservare la navigazione oggi presente: **Lezione | Continuità | Materiali**. Niente nuovo shell per Medicina, niente seconda memoria, niente dashboard che sostituisca la lavagna.

**Studente su mobile:** link personale/QR -> prima schermata utile -> carica foto/PDF o risponde a un quiz -> vede ricevuta duratura -> riceve esito (verificato o "in revisione") -> trova esercizio di recupero e lezione collegata. Accesso senza app installata; sessione limitata revocabile e login magic link/passkey quando serve consultare dati privati. La condivisione di un link non deve autorizzare lettura incrociata o accesso infinito.

**Tutor su desktop/iPad:** apri/aula -> lavagna -> coda "Da correggere" con allegato originale, OCR confermabile, draft IA accanto, punti critici evidenziati, rubric e soluzione di controllo -> Approva/Modifica/Richiedi chiarimento -> invia feedback -> proposta di ripasso -> PDF/pack. Solo stati docente approvati pubblicano una correzione definitiva.

**Altro insegnante:** crea spazio in pochi passaggi, scegli materia/curriculum, importi materiali tuoi, inviti uno studente, correggi primo elaborato. Il primo flusso deve funzionare senza configurare un MCP, prompt, terminale, JSON, SHA, UID o provider.

**Principi UX/UI:** carta/penna prima di qualsiasi chatbot; density progressive disclosure; pulsanti chiari, azione primaria per schermata, 44x44 CSS px min touch (60–80 su LIM secondo UX spec), contrasto verificato WCAG 2.2 AA, feedback immediato, undo e salvataggio duraturo, tasto "Rivedi originale", nessun upload perso in caso di cambio pagina. Responsive iPad/macos touch/Pencil test reale; non dichiarare supporto nativo prima di prova fisica.

## 4. Architettura: contratti prima dei plugin

**Strati:**
1. Core Ardesia: identity/multi-tenant/grant, lesson/room, board/pencil, immutable event log, storage/export, evidence provenance, permissions, consent, notification, billing/metering, course plugin registry.
2. LessonOS: input versionati, concetti, errori osservati, correzioni, eventi di review, note, materiali, proiezioni derivate, richiamo pedagogico; event-log fonte di verità, proiezioni ricostruibili.
3. ToolHost: plugin eseguibili isolati per disciplina/strumento; non proprietari di login, dashboard, fatturazione o memoria.
4. CoursePack: curriculum+versione+rubriche+domande originali+strategie di studio+criteri prova; NON monta una sua app.
5. MCP Core API: porta stabile a strumenti, risorse, pipeline e AI; non possiede la fonte dei dati. Abilitare trasporti locali (stdio/loopback) e remoto HTTPS autenticato separatamente.

**Contratti versionati minimi**:
- CoursePack(id, version, academicYear, locale, normRefs[], topicGraph, assessmentProfiles[], contentLicence, verifierCapability).
- AssessmentSpec(questionTypes, counts, duration, scoring, allowedSupport, markingPolicy).
- ProblemSpec(id, topicIds[], prerequisiteIds[], canonicalSolution, distractors, variants, unitRules, answerRubric, provenance, verifiedBy).
- Submission(id, tenantId, actorId, taskId, sourceFiles[], checksum[], receivedAt, consentSnapshot).
- GradeDraft(id, submissionHash, extractedSteps[], rubricFindings[], verificationEvidence[], uncertainty[], modelProvider, modelVersion, promptVersion, createdAt).
- TeacherDecision(id, draftHash, reviewerId, action APPROVE|REVISE|REJECT|ASK_CLARIFICATION, notes, timestamp).
- LearningEvent(kind, actorScope, errorId, conceptId, evidence[], reviewerStatus, sourceHash) in envelope canonico v2.
- Derived views: timeline, next-action, review queue, student pack; NO shadow database of skills, error memory or scores.

**MCP tools suggeriti (non dichiarati esistenti):** lesson.open/read, resource.attach, exercise.submit/read, grade.prepare_draft, grade.verify, review.commit, learning.observation.append, course.syllabus.read, practice.variants.generate, continuity.next_actions, material.export. Payload JSON schema rigorosi, idempotency key, versioni, ACL per scope, quote, audit receipt, cancellazione e data export. **I tool di IA non devono bypassare la revisione docente né scrivere fatti "verified"**. Il Core applica la policy; il modello può proporre.

**IA modulari:** provider-neutral; OpenAI via API opzionale, modelli locali (es. Ollama/LM Studio) e altri provider possibili, con benchmark di qualità separati e fallback. Evitare credential/browser session scraping di ChatGPT. Router per task, budget per invio, cost ledger per modello, privacy esplicita (opt-in per dati verso cloud). Se in un vecchio AGENTS appare "ZERO-LLM", NON nascondere il conflitto: la nuova direttiva owner ammette assistenza IA opzionale verificata; aggiornare formalmente il contratto prodotto nella PR tecnica apposita, mantenendo determinismo del nucleo.

## 5. Fisica verticale: errori verificabili, non profili predittivi

I sette moduli del Syllabus, CFU e quota esercitazioni vivono nel manifest JSON datato e sostituibile. Non hard-codare pesi/norme nel core.

**Prima sezione**: meccanica dei fluidi + meccanica + metodi, poi termo, elettromagnetismo, onde, radiazioni. Non proclamare "copertura completa" senza matrice sottotemi/revisione esperto.

**Esempio:** quiz Bernoulli errato -> osservazione: legge fisica? unità? stazionarietà? segni? algebra? -> richiesta di chiarimento se foto ambigua -> feedback docente su passaggio concreto -> variazione di dati e geometria -> nuovo esercizio per trasferimento -> evento di recupero osservabile. Non etichettare la persona come "debole", non mostrare mastery opache, non inferire probabilità d'ammissione.

**Modalità Allenamento:** hints graduati, schemi, unità, feedback sul procedimento, differenziazione per metodo, tutor IA contestualizzato quando consentito.
**Modalità Esame:** 31 domande, 50 minuti, 21 multiple, 10 completamento, punteggio legato a norma 2026/27, timer robusto, nessun suggerimento durante, correzione solo dopo consegna; verificare le regole ufficiali di completamento e di 30L prima di fissare normalizzazioni.
**Matematica verificabile:** prima rubric deterministiche e risolutori indipendenti (es. SymPy, Pint/unit check), poi spiegazione del modello; confronto su soluzioni originali non viste, mutazioni fisiche e metamorfiche, convenzioni dichiarate. Affermazioni certe solo con witness.

## 6. Ricerca scientifica e ipotesi

- Latimier et al. meta-analisi (2021), DOI 10.1007/s10648-020-09572-8: spaced retrieval vs massed retrieval, g~0.74 nel campione aggregato; nessuna superiorità generale dimostrata dell'intervallo crescente rispetto all'uniforme. Motivo per partire da un piano semplice, misurare e poi personalizzare.
- Marchisio et al., 2018, DOI 10.1109/COMPSAC.2018.00178: assessment formativo STEM + feedback interattivo, 553 studenti nelle tre sperimentazioni; il feedback deve essere *utilizzato* dallo studente, non solo mostrato.
- Yang et al., preprint arXiv 2025, DOI 10.48550/arxiv.2507.01431: claim di risparmio tempo 65% in Pensieve è riportato dagli autori, **non un risultato replicato per Ardesia**; benchmark analogo con tutor reali obbligatorio.
- Per le fotografie e gli schemi manoscritti: segnalare incertezza, OCR/transcription editabile, test strutturali e review manuale. Nessuna correzione deterministica del disegno basata solo sull'apparenza.

## 7. Presenza del verticale storico da dismettere temporaneamente

**Direttiva owner 17/10/2026:** togliere il marchio e i riferimenti del precedente verticale dal prodotto Ardesia corrente: UI, onboarding, landing, catalogo pubblico, esempi preinstallati, release claims, immagini e bundle distribuiti, route di accesso. **Non cancellare history Git, evidenze, diritti, attribuzioni e licenze**. Non rendere irrintracciabili vecchi contributi o contaminare le prove storiche. Il codice archiviato può restare in branch/tag storici e va escluso dai build/runtime correnti solo dopo un gate misurato.

Criteri: (a) nessun marchio o richiamo al vecchio verticale nelle schermate/asset della build retail; (b) nessun import dal vecchio sottosistema nell'entry/Core/Studio/MCP; (c) il vecchio percorso non è navigabile in produzione e il suo asset non è scaricabile; (d) il test del golden path lavagna→compito→review→timeline→materiale resta verde; (e) snapshot dati precedenti apribili o rifiutati esplicitamente senza perdita; (f) CI e SBOM senza regressioni. Utilizzare una PR **separata di decoupling runtime**, non eliminare in un colpo solo centinaia di file integrati o falsificare la storia in documenti storici. Nessuna rimozione completa è attestata dalla presente PR documentale.

## 8. Backlog ordinato per prove, non per numero di feature

P0 — Ripristinare lo stato veritiero di main, dichiarare quali PR sono archiviate, identificare un unico candidato minimo; generare stato da bin/state/project_state.py dove l'ambiente lo consente. Niente cherry-pick indiscriminato.

P1 — Isolare il verticale pregresso dalla build/prodotto, conservando history+evidence e sostituendo i donor necessari con adapter first-party neutri; test import boundaries e no-brand surface.

P2 — Core CoursePack generico con convalida normativa e syllabus Fisica 2026/27; matrice 7 unità/sottotemi/quiz/soluzioni/errori/prerequisiti; almeno due esercizi con soluzioni indipendenti e recensione umana.

P3 — Upload smartphone/teacher inbox online sicura: target 3 azioni per inviare, receipt duraturo; auth, ACL, idempotency, retry, file malware/size checks, storage safe, trust boundary locale/remoto e retention.

P4 — Draft di correzione IA + rubrica + conferma docente; tool MCP con permessi non bypassabili, record del costo, test su casi negativi e scansioni illegibili.

P5 — Continuità errori→ripasso→nuovo esercizio→risultato documentato; student pack/PDF approvato e portabile; sicurezza, accessibilità, performance.

P6 — Self-service tutor e packaging mercato: onboarding, importo, fatture/abbonamenti, diritti, équipe, marketplace con licenze e permessi; mantenere zero fee sulle lezioni.

**No scope creep:** prima una lezione completa REALMENTE USATA, poi feature nuove. Nessuna generazione massiva senza verificatori e contenuti legali.

## 9. Definizione di fatto e prove richieste

1. **Docente nuovo**: crea aula, assegna esercizio e invita studente senza supporto umano; metrica time-to-first-value p50/p95, obiettivo esplorativo <5 minuti, non un risultato acquisito.
2. **Studente nuovo**: apre link e invia foto leggibile in ≤3 azioni evidenti; screenreader, touch, mobile 375px/iPad/desktop. Nessuna schermata gergo tecnico, UUID, SHA o .lesson.
3. **Persistenza**: after submit ack, kill browser, riapri, stessa foto/attività/timeline presente; salvataggio rifiutato = errore visibile e possibilità retry, non successo apparente.
4. **Correzione**: 100 casi pilota con categorie invalid input, ambiguità, multi-step, errori di segno, unità, simboli; campione holdout non visto dal prompt/tuning; errori critici e falsi OK misurati. Supporto umano obbligatorio fino a validazione.
5. **Pedagogia**: randomizzazione e confronto con flusso manuale su item diversi e pre/post test ritardato; misurare accuratezza, tempo docente per correzione, completamenti, ritorno e soddisfazione, non soltanto numero quiz.
6. **Sicurezza**: tenant A non legge B; revoca share, URL expiry, upload under quota, no PII in log/telemetria/corpi provider non autorizzati, policy retention/export/delete, audit tracciabile.
7. **Engineering**: typecheck, unit, integration, E2E browser e dispositivi target, review indipendente, CI exact SHA, controllo costo/perf, release canary con rollback e osservabilità.
8. **Commerciale**: test willingness-to-pay con tutor terzi, misurare conversione attivazione, retention, margine lordo dopo API+storage+support; differenziare paid dal servizio MUR gratuito; zero falsa affiliazione ministeriale.

## 10. Regola per le decisioni future

Una funzione entra nel Core **solo se utile trasversalmente**; se è fisica o medicina appartiene al CoursePack; se è un calcolatore/simulatore ad un Plugin; se è una sequenza vendibile a un Workflow. La memoria non viene duplicata. Qualunque attività che non migliora il golden path utente, correttezza didattica, privacy o mercato deve essere posticipata o abbandonata. Adottare progressi di rami storici solo con prova di compatibilità e integrazione esplicita.