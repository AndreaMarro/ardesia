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
