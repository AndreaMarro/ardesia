# Prossimo incarico: completare i quattro microcorsi di Fisica

## Addendum operativo corrente — S00, 26 ottobre 2026

Il proprietario ha adottato esplicitamente «Esegui S00 in questa A». La306 è
MERGED su `37e0fe828e47b7c81784c2eb48a1b9776dd859ed`, CI post-merge40242587363
e readiness40242587350 SUCCESS: non rifare quella convergenza. Il mandato V2
prevede12 stream concorrenti, una PR implementativa attiva per stream, nessun
limite globale di3. S00 integra/distribuisce e aggiorna RUNLOG/NEXT; S02 shell,
S10 API/auth/schema/storage. Non creare nuove chat dalla sessione S00.

Leggere [handoff S00](../../handoffs/swarm-v2/S00/README.md) e registro dei writer,
poi rendezvous [commenti306](https://github.com/AndreaMarro/ardesia/pull/306).
I ruoli proposti non provano che tutte le chat abbiano START osservato. Rileggere
PR307/308/309 e successive sulla head effettiva, senza ereditarne il verde.
Room è temporaneamente di S07 per l'adapter opzionale; Courses di S09 per il mount
tutor; RootApp resta S00. Deleghe e coda sono nei commenti6404992331/6405061639.
Host8GiB: un solo slot pesante alla volta, niente processi altrui terminati.

Primo batch S00: export **privato esplicito** Web `/`+Studio `/studio/`, registro
operatore `/ops/release/`; pubblico e review editoriale restano separati. Il
backend non configurato risponde503, non un finto login. La CSP privata richiede
MathJax locale dal lock esistente. Stato corrente e prove terminali vanno letti
nell'handoff/PR: implementazione e26 test pipeline non equivalgono a integrazione
o beta remota. SSO Vercel resta un gate operatore distinto dai permessi Core.

Il prossimo risultato deve collegare consumer pronti alla main attraverso check
del merge-tree, poi CI post-merge e preview protetta effettiva. «Studia da solo»
richiede contratto S06/S10, fonti esatte, submit/receipt/feedback e cold/revoca;
nessun nuovo ledger. Mantieni espliciti0/52,0/57,0/33,0/58 completamenti e gli
obiettivi validi sotto. Il vecchio conteggio0PR era storico, non stato attuale.

Aggiornato il 25 ottobre 2026. #304 e#305 sono integrate: non ripartire dal vecchio blocco review. L’incremento corrente è nella sola [PR306](https://github.com/AndreaMarro/ardesia/pull/306), prodotto `05d2bc9911aff3862906ac5a71769bc726dfbcea`; i commit successivi aggiungono prove e memoria. Prima di lavorare leggere il [registro con esito terminale e CI post-merge](https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6404424520), verificare main/PR/Vercel attuali e rigenerare `python3 bin/state/project_state.py`. Una consegna datata non certifica il presente.

Leggere [consegna e rollback](four-courses-2026-10-25/README.md), [matrice dei quattro corsi](../../matrici/QUATTRO_CORSI.md), [200 schede](four-courses-2026-10-25/objective-evidence.json), ultimo RUNLOG, AGENTS, CANON-INDEX, ADR-0004 e protocollo memoria. Conservare il denominatore 52/57/33/58: **zero obiettivi con accettazione completa**. Le43 lezioni e38 famiglie DRAFT nella review protetta e i5 esempi pubblici non sono quattro corsi completi.

Pubblico: https://ardesia-fisica-preview.vercel.app/corsi/ , deployment `dpl_7BQB2RrpkNdAsFgQ4MktHgfdnS1z`. Review completa con SSO: https://ardesia-fisica-preview-t4tqijqvx-andreas-projects-6d4e9791.vercel.app/corsi/ , deployment `dpl_4tSUVdLjeyQpVqY6eNKF9G1abXp7`. Share temporanei revocati; nessun access file in Git. Non rimuovere SSO. L’autorizzazione pubblica riguarda solo gli esempi originali verificati, non kit o banca di4.000 DRAFT. Rollback: `dpl_8aUFbXrEZKpAjf8vRj1wBmK8fyfr`, sul solo progetto Fisica.

A resta unico integratore/deployer e writer della memoria comune. B cura modelli/strumenti; il ruolo DeepSeek contenuti, controprove e Goodnotes, con file e worktree separati. Handoff in `handoffs/codex-a`, `handoffs/codex-b`, `handoffs/deepseek/2026-10-25`. Conservare attribuzione e provenienza. Sette check strict, enforceAdmins e conversazioni risolte restano obbligatori; policy single-maintainer autorizzata, nessuna review umana inventata o uso di --admin. Nessun secondo Core, database, grader, ledger o autorità di sessione.

## Ordine di lavoro

1. **P0 — Accettazione per tutti i 200 obiettivi.** Primo passo: partire da U1-01 nella matrice e collegare una prova qualitativa a consegna, feedback e attività diversa attraverso i contratti Core esistenti. Le38 lezioni qualitative sono consultabili, ma non hanno ancora attività canoniche consegnabili dedicate. Dipendenze: docente/editor, contratto di evidenza e pubblicazione esplicita. Accettazione: spiegazione, pratica, feedback, transfer, correttezza scientifica e percorso UI verificati per ogni target, con distinzione fra assistenza e autonomia. Evidenza: schede, ricevute, revisioni e approvazioni umane delle versioni effettive; mai cambiare false in true per una metrica.
2. **P0 — Continuità Core remota.** Primo passo: identificare o predisporre Study API/Auth/Storage nel perimetro autorizzato; Render Ardesia attuale contiene solo statici, non usare ELAB come Ardesia. Dipendenze: provider e costi consentiti, identità, backup. Accettazione: due browser, docente→studente→review, riapertura, revoca, isolamento e restore. Evidenza: backend reale e ricevute/digest; il workflow HTTP locale su 5 modelli e 4 edizioni già verde non certifica il remoto.
3. **P1 — Revisione esatta e plugin.** Primo passo: estendere il contratto canonico ActivityEvidence per lessonRef/fase e scegliere un oggetto mancante dalla matrice. I cinque modelli attuali sono first-party nel bundle, non plugin installabili. Dipendenze: schema, capability, versioni, licenza e ownership B. Accettazione: installazione, mount, revoca, round-trip e consumer funzionanti. Evidenza: RED/GREEN, UI, controprove scientifiche e REA, con costo totale misurato oppure UNKNOWN.
4. **P1 — Qualità umana e compatibilità.** Primo passo: ascoltare le quattro clip e verificare Safari/device reale; correggere «Unità richiesta: .» nella review qualitativa. Dipendenze: operatore, dati sintetici e permessi. Accettazione: testo/audio comprensibili e recuperabili, focus/font/movimento ridotto corretti. Evidenza: gesti e limiti espliciti. Goodnotes osservato solo nei metadati della versione 7.1.30: non dichiarare Goodnotes6, UI o replay collaudati.

Prima della consegna aggiornare RUNLOG con risultati, errori/correzioni, alternative, prove e limiti; terminare con 3–5 task che abbiano primo passo, dipendenze, accettazione ed evidenza. Aggiornare NEXT e provenienza. Il mandato resta aperto finché tutti e quattro i corsi non superano i criteri. Non creare una nuova PR per prolungare artificialmente un’attività aperta: verificare prima l’esito effettivo della 306.


## Addendum S00 successivo — 26 ottobre 2026, candidata2c522f96

308 e307 sono MERGED, main992d1a0b e CI post-merge40251190531SUCCESS. Il vecchio stato delle loro draft è storico.314 ha fonte2c522f96,7requiredSUCCESS,27pipeline/10Studio mirati e791browser locali; uploadVercel ancora in corso e nessun nuovo deployment attestato a questo checkpoint. Leggere il rapportoS00/rendezvous306 per esito terminale e URL effettivi, senza ereditare un verde da un'altraSHA. Sorgenti runtime del build pulite, i commit successivi di memoria non cambiano i suoi asset.

Prima chiudere314 attraverso provaHTTPS/merge/postmerge e ricevuta provider, poi integrare i consumer già pronti dalla main aggiornata. S10START rimane non osservato: gli installer condivisi richiedono writer esplicito, non endpoint finti. La finestra S01perJSXGraph è stata rilasciata; patch manifest/lock1.14.0 autoreS00 consegnata e verificata dall'owner. FontLiberation1.05legacy nonOFL e source esatto non verificato: Studio solo preview interna, nessuna pubblicazione implicita. Pubblico5demo invariato, quattro corsi ancora0/200accettazioni complete.

Ricordare, leggere e aggiornare lo storico senza modificare il passato: voci e conclusioni precedenti rimangono, smentite aggiunte datate con prove. Handoff di ogni owner e appendici aS00, RUNLOG/NEXT un solo writer. Non chiamare DONE unaPR aperta, una chiusura senza integrazione, una demo mock o unaCI di altrahead.


## Addendum S00 — preview HTTPS effettiva,26 ottobre2026

La314 ha ora una preview protetta reale: https://ardesia-fisica-preview-kpdx7h80d-andreas-projects-6d4e9791.vercel.app/ops/release/ , deploymentdpl_CESVaUARu9iX9zZuwZSqRjj8W1U8, fonte2c522f96.796controlli HTTPS PASS; grant revocato e file privato cancellato,302 versoSSO verificato. La vecchia nota upload in corso resta storica. Non confondere READY provider con beta: API503, nessun backend remoto o ACL studente certificato. Produzione invariata; Studio solo interna per limite Liberationlegacy. Receipt/runner in handoffs/swarm-v2/S00/; rileggere esito terminale314 e CI post-merge prima di ripartire.

S00 ha congelato la317 su2e9cea03 e prende il raccordo installer API, RootApp e typedreader science-resource nella STESSA PR dopo314 terminale. Nessun nuovo ramo dipendente o PR per prolungarla. Prima prove sulla composizione finale, poi integrazione e distribuzione pertinente.309/316,311/318/319 e calendario320 seguono per consumer, non ordine dei numeri. Delega S09 limitata alla patch3500827e… già consegnata, nessuna reinstallazione dei node_modules condivisi. Conservare0/52,0/57,0/33,0/58 e i5task dell'ultima voce RUNLOG; storico append-only, smentite datate e provate.


### S00: correzione successiva alla prova796

La prova796 resta storica sulla build4. Review visuale indipendente trovaP2 banner sovrapposto: CSS corretto e RED reale conservato, nuovo build/GREEN richiesti prima del merge314. Gate locale2311PASS/2FAIL non va nascosto dietro7requiredCIverdi; controprova mostra errore di commit durante test/SHA compilata e52miratiPASS aHEADferma. MathJax15,7s contro15s non completamente attribuito. Leggere nuovo handoff/rendezvous314 e mantenereHEADimmutabile durante test. Nessuna soglia,gate ocronologia modificata; quattro corsi ancora0/200.
