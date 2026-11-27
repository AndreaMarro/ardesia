# Confronto indipendente delle sezioni Cric

Questa preparazione è tecnica e in sola lettura. Non assembla nuovi pacchetti, non modifica il registro, non riscrive report scientifici e non pubblica contenuti nell’applicazione. Il target locale di 21 test è passato dopo un RED reale; la suite completa del progetto resta al Root, secondo il vincolo di risorse e ownership già assegnato. Non si rivendica un esito della suite completa.

Il problema nasce nel ramo Cric di `assemble_family`: il merge fra metadati originali e riga d’autore sovrascrive `section` con il parametro del cohort. Il percorso canonico è conservare la sezione del record Git originale per ID, mantenendo la pipeline di assembly/import esistente. Una guardia del ramo Cric deve respingere un override che la cambi; il ramo Ardesia deve rimanere byte-identico. La correzione dell’assembler è del Root, non di questo modulo.

## API pura pronta

`assert_section_only(before_package, before_bindings, after_package, after_bindings, originals, *, source_ref)`

`originals` è una mappa `id -> record originale completo` letta dal pin Git, senza aggiungere metadati al record. Il confronto verifica checksum candidati e originali, provenienza, versioni individuali, identità e ordine. Confronta tutti i campi tramite JSON canonico tipizzato: `1`, `1.0` e `true` non sono intercambiabili. Esclude soltanto `section` al primo livello del singolo candidato. Asset, envelope, blocchi, unità, risposte, hint e feedback restano identici; nei binding può cambiare soltanto `candidateSha256`. La nuova sezione deve coincidere con l’originale.

Il risultato contiene `checkedIds`, `changedIds`, `unchangedIds` e per ciascun ID `oldCandidateSha256`, `newCandidateSha256`, `nonSectionPayloadSha256`, `sourceSha256`, `oldSection`, `newSection`. `scientificApproval` e `humanApproval` sono `NOT_RUN`, `publicationAction` è `NONE`. È una verifica d’identità tecnica: non sostituisce l’oracolo né genera firme scientifiche.

`plan_section_corrections(audit, packages, bindings, originals)`

Le mappe `packages` e `bindings` contengono i byte JSON originali per batch. Il planner verifica il checksum del package indicato nell’audit e la copertura di tutti i delta effettivi nel pacchetto. Raggruppa soltanto i batch esistenti C1–C5 registrati e restituisce percorsi, checksum e cambi di sezione. Non ripartiziona ID e non scrive package o binding.

## Ponte canonico proposto

La proprietà opzionale di spec `sectionReconciliationSha256` può puntare al certificato deterministico `editorial/reviews/section-reconciliation-v1/<batch>/certificate.json`. Senza questa proprietà il percorso storico resta rigorosamente invariato. File mancanti, symlink, percorsi esterni, schema non tipizzato o checksum errati devono fallire chiusi.

Il certificato deve ancorare i byte di package/binding scientificamente revisionati e del relativo report bare, il modulo verificatore e il contratto scientifico, il package/binding correnti e le origini Git. Il validatore richiama il verificatore originario, immutato, sui vecchi oggetti: `verify(old_package, old_bindings)`; applica `assert_record_identity` contro quegli stessi vecchi oggetti e confronta il risultato fresco con il report bare storico. Verificatore, dipendenze e report storici mantengono i loro hash effettivi. Le chiavi non sono una scorciatoia per questa verifica.

Solo dopo richiama `assert_section_only` sui quattro payload e sulle origini Git. Il certificato va ricalcolato, non accettato perché dichiara `sectionOnly=true`. Tutti gli ID e tutti i campi sono confrontati. Le due identità rimangono esplicite: l’oracolo storico parla del vecchio candidato; il certificato tecnico lega il nuovo candidato al suo contenuto scientifico immutato e alla sezione originale.

Il compilatore può emettere una firma composita nuova, separata per dominio, che includa almeno ID, nuovo checksum candidato, vecchio checksum candidato, vecchia firma scientifica, SHA del report storico, SHA del certificato e SHA della fonte. La firma storica resta soltanto nell’anchor scientifico. Il record composito deve dichiarare il suo tipo e non presentare la firma vecchia come firma scientifica del nuovo payload. Non si riscrivono o ritaggano i report bare; l’evidenza compilata conserva entrambi gli anchor e le rispettive provenienze.

Le guardie di ritiro di accettazione restano prima e dopo la verifica, anche nel ramo del ponte. Import canonico e anteprime reali devono essere nuovi e legati al nuovo package e al runtime/protocollo corrente. I marker dei package cambiati sono invalidi; quelli degli altri pacchetti restano riusabili soltanto tramite il runner canonico. Nessun release o credito UI viene assegnato da questa preparazione.

Un vecchio DRAFT già materializzato localmente è un caso distinto: il ponte non autorizza sovrascrittura né promozione. Serve dimostrare il conflitto deterministico e la conservazione delle edizioni tramite l’editor/importatore canonico. Un eventuale cambiamento di versione o baseVersion non rientra nel certificato section-only, che lo respinge; richiederebbe una procedura separata esplicita.

## Ricevuta sui dati reali

Il dry-run ha letto l’audit congelato 6b746e3dafc8e86d6671865644c1e57fe1868f46 e gli originali Cric 5d1dc8dc7b601aef959d10d564c75462be74708d. Ha trovato 250 delta nei 25 package esistenti, con 10 ID per package. Ha escluso 75 righe C6 storiche non pertinenti. Per ciascuno dei 250 candidati ha creato un clone esclusivamente in memoria, ripristinato la sezione originale e ricalcolato il checksum del binding; il confronto indipendente ha accettato il solo campo ammesso. Non sono stati scritti package corretti. I checksum dei 25 package, 25 binding e 25 report bare Root sono stati ricontrollati invariati a fine esecuzione. Le snapshot Git sono verbatim e dichiarate in git-inputs.json; non sono nuove edizioni.

Questo dry-run non è un nuovo esito scientifico o una prova di import/preview. Il ponte canonico Root sarà sottoposto a review distinta sulla sua SHA immutabile: rigetto di contenuti non-section con checksum rinnovati, prova fresca sull’anchor storico, identità composita distinta, compatibilità senza certificato e conflitto conservativo del DRAFT già materializzato.
