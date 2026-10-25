# Ardesia: candidato Teaching OS e demo continua

24 ottobre2026. Base immutabile: draft[#298](https://github.com/AndreaMarro/ardesia/pull/298), `f456ade218acee1a8b65f5dc24e9220681658b11`; nuova branch `codex/ardesia-convergence-rea-deep-20261024`. Le PR#297/#298 sono state rilette prima del lavoro e prima della consegna: aperte/draft, non integrate; nessun successore concorrente rilevato. La CI verde della base non è la CI di questo incremento. Il ramo conserva il prefisso escluso dall'autodeploy. Nessun merge/deploy/DNS/produzione o dato reale.

Codice prodotto congelato: `375dbe8d50ce46fab1e47704d73e548c797da09c`; sourceTreeSha256 `95f3fe6faadd52ac412a8f8de8f065429e6402e743aa935bba9d7c311fa2df92`, 1586 file e758 asset nel pacchetto locale. La successiva memoria non modifica il runtime.

## Risultato utilizzabile

**Pubblico:** landing → microcorso Fluidi → `/esperienza/` → previsione numerica prima del risultato → raggio controllabile → vincolo Δp/Q → trasporto medio e grafico → recupero con testo/audio originale sintetico → nuova prova → ritorno al contatto del medesimo percorso. Il contatto rimane manifestazione d'interesse; non crea iscrizione, account, invito, accesso o pagamento. La demo pubblica non persiste una valutazione dello studente e non si presenta come beta autenticata.

**Privato locale:** Aula docente → episodio → Apri la lavagna → seleziona un oggetto vero → consenso/cattura/stop → invia proposta ad Aula → completa spiegazione → conferma condivisione. La conferma crea una fonte Core versionata; il descrittore viaggia nel canale effimero senza cookie/token. Aula e Studio sono serviti sulla medesima origine, Studio a `/studio/`. Lo studente recupera fonte e revisione esatte; la prova diversa, la consegna e il diario riusano il Core esistente. Il copia/incolla resta una compatibilità secondaria, non il percorso principale.

La lavagna torna dominante: pannello autore laterale su desktop e inferiore su telefono; selezione e annotazione usano gli oggetti esistenti. Fit e highlight sono sulla versione registrata. Il consenso salvato non avvia il microfono. Tempo, selezione dell'oggetto e dichiarazione del docente sono distinti; nessuna inferenza semantica automatica implementata.

## Come riprodurre

Servono i runtime e i lock esistenti: Node26.5.1 per Web/build integrato; Studio CI usa Node22, distinto dal gate locale congelato Node26.5.1. Python3.13 e lock API/Engine per suite; generatore pubblico e marketing usano stdlib. Installare le dipendenze dai lock secondo AGENTS, senza chiavi provider.

```sh
# Dalla root: output nuovo, fuori repository; il comando non pubblica nulla.
python3 bin/build_teaching_candidate.py --include-private --output /absolute/fresh/candidate
python3 bin/web/serve_teaching_candidate.py --directory /absolute/fresh/candidate/public --port 5414
```

Aprire `http://127.0.0.1:5414/`, scegliere Fluidi e il collegamento alla lezione interattiva. Inserire4, osservare16, cambiare vincolo a portata, formulare0,0625, recuperare il passaggio e scegliere un problema diverso. Il focus va alla nuova previsione; con raggio dimezzato e portata fissata il risultato atteso è16.

```sh
# Ambiente usa solo identità sintetiche. Credenziali restano nella directory privata.
services/study-api/.venv/bin/python bin/study-demo/seed_course_capabilities.py --data-dir /absolute/private/qa
services/study-api/.venv/bin/python bin/study-demo/serve.py --data-dir /absolute/private/qa --no-seed --frontend-dir /absolute/fresh/candidate/beta/web --studio-dir /absolute/fresh/candidate/beta/studio --port 5412
```

Aprire5412 e accedere con il tutor sintetico del file locale `demo-access.json` (non incluso nell'artefatto e mai da pubblicare); seguire il percorso privato sopra. Poi accedere con studente sintetico. Il runner[run-bridge.cjs](evidence/poiseuille/run-bridge.cjs) usa gli stessi controlli reali con uno stream WebAudio sintetico e MediaRecorder nativo; non richiede hardware, provider, fixture JSON incollata o route mocking. I trace originali con sessioni restano nel workspace privato. Il[verbale di validazione](validation.md) distingue run, revisioni e limiti.

## Recupero storico e REA

La[ricognizione storica](historical-recovery.md) segue le serie PR richieste, i sorgenti e i repository accessibili. Non viene ripresentato come greenfield ciò che esiste: sessioni/CAS/media/journal, Core, PhysicsLab, CoursePack, consegne/revisioni/diario. LessonGraph/PathMemory/Delta/Debt e StudentTrace/ProofSession specialistici sono capacità distinte, non tutte già alimentate dal percorso Study. L'adapter storico#248 accetta reader2 senza un gate adeguato e non riconosce le nuove sessioni media: non viene trapiantato alla cieca. Il consumer Engine corrente resta un limite esplicito dei bundle AUDIO-V2, da affrontare come prossimo incremento versionato.

Tre missioni reali, tre ticket a13campi: [A: progressione Mathigon](evidence/rea/A/A-transfer-ticket.json), [B: scrittura/selezione e NoteReplay documentato](evidence/rea/B/B-transfer-ticket.json), [C: CircuitJS stato/stop/reset](evidence/rea/C/C-transfer-ticket.json). La nuova interazione trasferita con RED/GREEN è la progressione da tastiera alla previsione del problema successivo. B è anche confronto successivo all'implementazione; C verifica un contratto di visualizzazione/run-state, non ricostruisce un simulatore di circuiti. Non vengono conteggiate tre osservazioni come tre funzioni ricostruite.

REA6.7.0 via CLI effettiva, Node26.5.1; MCP REA non esposto in questa sessione. Doctor healthy per il perimetro browser ma environment_healthy false per provider nativi non disponibili: nessuna modifica globale per far diventare verde una diagnosi estranea al lavoro. Originali donor e screenshot rimangono in work, referenziati da ID/digest; nel repo solo contratti, verifiche e immagini del nostro prodotto. Goodnotes solo documentazione ufficiale pubblica, runtime non osservato. A conserva una ricevuta incompleta per eventi di rete tardivi, sebbene i gesti di tastiera siano completati. Costi complessivi e risparmio REA rispetto al metodo diretto: UNKNOWN motivato nei ticket.

## Confini e prossimo sviluppo

L'audio di una lezione privata resta nel suo archivio locale o nel bundle importato: un URL non distribuisce i byte, non concede permessi remoti e non è garanzia di disponibilità da un altro dispositivo. I test nativi usano audio sintetico; hardware, FSA e smartphone fisico non certificati. Nessuna efficacia didattica misurata con studenti reali; assistenza e autonomia rimangono etichette basate sulle ricevute, non sulla sola correttezza.

La pubblicazione commerciale rimane un'operazione separata: artefatto/checklist pronti, contenuti segnalati in revisione, auth remota/RLS non certificati. La demo e il funnel di interesse sono utilizzabili senza quelle promesse. [Checklist di rilascio](release-checklist.md).

Il writer MCP `feedback.propose_private_revision` della RFC#293 è differito a una slice dipendente. Questo incremento chiude prima i confini pubblici e il bridge; introdurre contestualmente nuove revisioni private e cambiare la pubblicazione del feedback richiederebbe la matrice W01–W18 e una review dedicata del CAS/digest. Le quattro letture sono conservate e ritestate; non si dichiara alcun writer o host commerciale collaudato.
