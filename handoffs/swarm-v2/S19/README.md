# S19 — handoff Circuit Lab

**Stato:** prima tranche implementata e provata localmente; integrazione nei consumer principali e nei file condivisi di competenza S00 ancora pendente. Nessuna dichiarazione di rilascio o Product Verified. Una sola PR implementativa dello stream, branch `codex/s19-kirchhoff-dc-20261026`, base verificata `a00f2f40091aecf69e58ebaba42cf70d748e4066`.

Il laboratorio offre circuito modificabile, domanda/previsione, fino a32passi strutturati, KCL/Ohm e altri controlli upstream supportati, equazioni e schema Kirchhoff, revisione privata Core, ricevuta di consegna, review→LessonOS, JSON/SPICE/CircuitikZ e circuito di trasferimento. Nessun nuovo solver, grader comune, DB, login o ledger. Il consumer ha lo stesso cookie/client/sessionBoundary Ardesia.

## Prove e provenienza

- [Validazione e fallimenti conservati](validation.md):90test Python/Core e87scientifici upstream;22browser reali PASS nella finestra S00, dopo timeout sotto carico preservati.
- [Acquisizione e diritti](ACQUISITION_PACKET.md), [dipendenze](dependency-provenance.json), [review indipendente](REVIEW.md).
- [Design](DESIGN.md), [piano e decisioni](PLAN.md), [istruzioni riproducibili](../../../plugins/s19-circuit-lab/README.md).
- Screenshot desktop/touch in evidence. I24casi finali CI includono due prove di indisponibilità aggiunte dopo lo slot; non attribuire loro automaticamente i22PASS precedenti.

## Raccordo minimo a S00 — stessa PR

1. Rileggere base/head e writer. `integration.patch` è la candidata corrente: registra il pack S19, chiama install(app,store_dependency,authenticate) prima degli static mount, rende opzionalmente idempotente revise_resource usando execute_command Core. Firma storica/caller senza key, CAS, guardie dei resource kind e revoca restano. `consumer.patch` aggiunge il link specialistico nelle edizioni appropriate. Applicare nella stessa PR o aggiornare le patch nella stessa consegna se i file sono cambiati; nessuna seconda PR artificiale.
2. Installare la dipendenza con engine.lock+script e il package S19 in editable; costruire `web/dist` normale, privo del test host. Non assumere che pip install di una wheel upstream senza MCP web già compilata funzioni. Rendere esplicita la distribuzione sorgente autorizzata; ToolHost wheel/manifest firmato è futuro.
3. Montare `/s19/circuit-lab/?edition=<id>`, nel prodotto privato con la stessa sessione. La API e il browser di prova sono realmente quelli Core, ma l'Aula della main non è stata modificata da S19. `entryActivityId=null` impedisce il dispatch numerico improprio. Il modello due-resistori `dc-resistance-v1` è intatto.
4. Trattare `kind=s19-circuit` come fonte tipizzata, con resourceId/revisionId precisi: il reader può collegare il laboratorio, evitando di presentare JSON come una normale nota o modificarlo con il generico editor. Non forzare netlist simboliche nei parameters numerici science-resource schema1 di S01. Studio può citare gli stessi riferimenti, senza un secondo documento autoritativo.
5. Eseguire gate sulla composizione definitiva/merge tree e CI post-merge, poi un percorso Corsi→Lab→save→reload→submit→review, peer/revoca. S19 non modifica i registri comuni: [appendice memoria per S00](MEMORY_APPENDIX.md).

Il test composer applica le patch solo a copie temporanee dei tre moduli reali, oppure riconosce il loro esatto stato già integrato. Non monkeypatcha risolutore, auth o storage. Il test host controllato separa il contratto del componente dall'Entry e usa trasporto Core reale. Una prova su queste copie non certifica l'integrazione della main.

## S03 e S13

**S03 — contenuto:** CoursePack `s19-circuit-dc-v1@1`, attività `s19-kirchhoff-dc-v1`. Lezione originale su nodi/KCL e transfer I+R paralleli. DRAFT, revisione umana assente; non è un corso completo. Preservare distinzione fra previsione, assistenza, passo corretto e autonomia. Nessun answer key duplicato nel pack.

**S13 — simulazione:** nessuna dipendenza 3D o ELAB. Input R/V/I e orientazioni fanno fede; le coordinate sono presentazione. Un eventuale simulatore invia una nuova revisione di input e invalida i risultati, senza produrre un proprio VERIFIED o solver MNA comune.

**S01 — compatibilità:** capability/version/hash del runtime effettivo, distinto dal contratto di risorsa numerica. Kirchhoff SourceSnapshot e pin installato impediscono di rietichettare byte già caricati; gli input restano disponibili senza esito se il motore non è utilizzabile. Nessuna attesa del prototipo14strumenti.

## Checkpoint di ripresa — 26 ottobre 2026

La head implementativa `f80dc4d2998d83ff8f7c4fd3116bd75c5021873c` della [PR325](https://github.com/AndreaMarro/ardesia/pull/325) ha CI S19 verde:37Python/24browser, inclusi la controprova source/pyc e i casi di indisponibilità. Tutti i sette controlli richiesti sono SUCCESS sulla stessa head; [snapshot e log](evidence/ci-f80dc4d-summary.json), [dettaglio additivo](validation.md#ripresa-dopo-interruzione--26-ottobre-2026). I90/87/22locali rimangono prove storiche distinte.

Precisazione che supera la precedente frase S01: SourceSnapshot da solo può accettare una cache pyc timestamp stale. La correzione S19 verifica i byte Python contro i Gitblob del pin e li congela prima degli import, compila direttamente quei byte e rifiuta import Kirchhoff precedenti non controllati. Il test sul package installato riproduce la baseline vulnerabile e risolve il partitore8V con il confine protetto.

S00 resta il writer della composizione principale e dei registri condivisi. Le patch minimali di questo handoff sono ancora candidate, da rileggere sulla base scelta da S00; il verde della PR non attesta main integrata, distribuzione remota o approvazione umana del contenuto. Nessun test pesante locale rilanciato durante la ripresa.

### Checkpoint successivo: nuova base e raccordo da riallineare

Su head documentale `5e080e3`, la lane S19 del run40371391113 fallisce prima della collection: la main e95a80b successiva a317 aggiunge science_library nello stesso contesto della patch installer. Il verde f80 sulla basea00 rimane storico e non copre questa composizione. [Failure conservato](evidence/ci-5e080e3-failure.json), [diagnosi e sequenza](validation.md#cambio-della-base-durante-la-ripresa). S00 chiede di attendere il candidato immutabile309 prima del riallineamento esclusivo di patch/handoff; guard stretta del composer invariata, file condivisi intatti.

### Preparazione locale successiva: candidato309 fissato

Ricevuto da S00 il candidato `9da49952491445b93349e3f7b7f75bb9e323e074`. Patch installer aggiornata solo localmente al contesto esatto science_library; consumer patch invariata. I tre hash del manifest S00 coincidono; entrambe le patch passano check/apply/check inverso su copie del candidato e i tre moduli Python composti passano sintassi. [Prove leggere](evidence/patch-candidate-9da4995.json). Composer, runtime e file condivisi intatti. Preparazione non committata né pubblicata: attendere main309 effettiva prima del push325 e della CI completa; nessun test pesante locale e nessuna attribuzione dei vecchi verdi a questo candidato.

### Conferma successiva richiesta dal proprietario

S00 e GitHub confermano309 ancora OPEN/DRAFT e main e95a80b, senza merge. S00 prepara la successiva head locale50b07bea nella stessa309 e comunicherà la main effettiva dopo gate e merge; app.py riferito invariato. [Checkpoint verificato](evidence/main309-status.json). Raccordo S19 conservato localmente; condizione per commit/push325 e CI nuova ancora non soddisfatta.

### Seguito proattivo autorizzato dal proprietario

Attivato il controllo periodico di questa chat `s19-riallinea-pr-325-dopo-merge-309`, ogni5minuti, silenzioso a stato invariato. Appena309 è effettivamente in main e S00 ne conferma la SHA, ricontrolla i file esatti, completa il riallineamento nel solo namespaceS19, pubblica nella stessa325 e legge tutta la CI della nuova head. Mantiene guard e storico, evita test pesanti locali senza finestraS00 e si disattiva a lavoro concluso. Il checkpoint operativo aggiornato rimane negli outputs della chat.

### Main309 confermata: riallineamento pronto al push

PR309 MERGED e main effettiva `d7dc3917d695c80d027c91df21577e06ec649232`, confermate da S00 e GitHub. Riletti i file esatti: tre pin del manifest coincidono e app.py è identico al candidato9da. Patch aggiornate verificate sulla main integrata con check/apply/check inverso e sintassi dei tre moduli Python composti; nessun test pesante locale. [Prova del merge](evidence/main309-merged.json), [prova delle patch](evidence/patch-main-d7dc3917.json). Il riallineamento pubblica solo namespaceS19 nella stessa325; composer e file condivisi intatti. Leggere la nuova CI effettiva prima di dichiarare i gate verdi; integrazione principale S19, merge325 e deploy restano diS00.
