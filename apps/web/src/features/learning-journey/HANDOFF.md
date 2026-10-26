# S20 → S00 / S03 / S06 / S17

## Stato della consegna

Base effettiva e remoto verificati: `a00f2f40091aecf69e58ebaba42cf70d748e4066`. Namespace esclusivo `apps/web/src/features/learning-journey/`. PR implementativa unica, nessun merge/deploy S20. I file applicativi condivisi sul disco sono identici alla base; hash in `evidence/source-manifest-final.json`.

Il consumer è stato eseguito **dentro App e ProductShell reali** con i raccordi proposti applicati dal plugin di build, sul servizio Study API originale locale e identità sintetiche. Questo non equivale a un mount già integrato in main. La vista resta spenta finché S00 non compone patch e flag.

## Consegna concreta a S00

1. `mount-classroom.patch`: lazy mount in Classroom, partecipazione/ruolo/Poiseuille/flag; filtro checkpoint nel read boundary `useCourseWorkspace`. Nessun App/API/CSS globale/manifest/lock edit. Applicare insieme, dopo riconciliazione con i consumer già integrati dagli altri stream.
2. `s02-navigation.patch`: primo hunk **originale e attribuito a S02**, estratto dal pin `28d70a5`, per Back/Forward. S02 conferma riuso solo nella composizione QA e consegna a S00; niente secondo `enabledViews`. Non duplicare un raccordo S02 già applicato. Le due patch hanno superato `git apply --check` sulla base a00.
3. Impostare `VITE_S20_LEARNING_JOURNEY=1` soltanto dopo il gate della composizione. Il flag non conferisce autorizzazioni; ogni lettura/scrittura usa cookie e controlli Core esistenti.
4. Rieseguire i runner sulla propria head immutabile, poi CI/merge tree/postmerge e ambiente pertinente. Il risultato locale non certifica remoto, PostgreSQL/RLS o studenti reali.

Il precedente file `mount-classroom.patch` a un solo hunk, mai consegnato esternamente come pronto, è superato dal file corrente a due raccordi. I FAIL dei primi runner restano nello storico compresso; nessuna vecchia prova è trasformata in PASS.

## Prove finali e limiti

| Prova | Risultato | Evidenza |
|---|---|---|
| Percorso App compilata + API originale | 21 gruppi PASS, 0 errori runtime inattesi | `evidence/journey/browser-result.json`, screenshot |
| Recovery, CAS, primo create perso, source 404, help A→fonte B, ricevuta alterata, touch | 8 gruppi PASS, 0 pageerror | `evidence/recovery/recovery-result.json` |
| Tastiera/mouse | focus trap, restore, Escape annidato, slider, sorgente e invio PASS | runner journey; ulteriore prova Escape 5/5 dopo primo fix insufficiente |
| Viewport | 360/390/820/1440, nessun overflow orizzontale; touch emulato 390 | screenshot e runner |
| Core/HTTP esistenti pertinenti | 11 PASS, warning deprecazione Starlette testclient | `evidence/core-http.log.gz` |
| Typecheck finale | exit 0 | `evidence/typecheck-verified.log.gz`; comando ha proseguito verso Vitest |
| Modello S20 | 8 test PASS nel blocco Web finale | test `model.test.ts`, log Web finale |
| Regressioni Web | checkpoint precedente 31 PASS; ultima ripetizione 25 PASS / 6 FAIL | entrambi i raw conservati; FAIL su attese session-boundary/classroom sotto sovrapposizione processi, nessuna soglia alzata |
| Build composto | PASS | `evidence/build-composed-final.log.gz` |
| Baseline main senza patch | walkthrough eseguito; ripresa step assente, ricevuta riaperta in 3 azioni | `evidence/baseline/baseline-result.json` |
| Review distinta | finding corretti; nessun blocker residuo identificato | `REVIEW.md`; harness del reviewer isolati, non Core reale |
| CI della PR | da rileggere sulla head esatta, separata dalle prove locali | Checks GitHub; stato successivo nella PR/consegna finale |

S00 ha chiesto una finestra CPU/RAM esclusiva dopo i FAIL locali: nessun nuovo job locale pesante avviato dopo la richiesta. Processi propri chiusi, nessun processo altrui terminato. La ripetizione Web finale resta FAIL e non viene sostituita dal checkpoint precedente o dal risultato browser. Il verde CI, se successivo, sarà una prova separata sulla propria head.

NOT_RUN: Safari/VoiceOver, device fisico, test con studenti, efficacia didattica, backend remoto/PG/RLS, autosalvataggio dopo crash del browser. Lo scroll esatto non è sincronizzato; si ripristinano problema/passaggio e fonti/ricevute. I testi restano DRAFT, nessuna verifica scientifica umana attestata. Nessun FSRS/planner o grading nuovo; nessun `completed` parallelo.

## Confronto UX e costo

La baseline main possiede già il ciclo guidato previsione→modello→nuova prova; S20 lo riconosce e non dichiara di averlo inventato. Nel walkthrough la baseline perde episodio/secondo passo al refresh. Per ritrovare la ricevuta dal corso dopo refresh: “Il mio lavoro” → “Consegne e feedback” → “Originali, versione e ricevuta”, tre azioni osservate. S20 riapre direttamente ricevuta e fonte del passo salvato, zero comandi aggiuntivi dopo il caricamento. La seconda prova si apre con un comando e campi vuoti. L'esplorazione facoltativa richiede due cambi di fase espliciti, in cambio di separazione chiara tra previsione, aiuto e risposta. Non è un confronto di tempi o una prova con utenti.

Chunk S20: JS 28.195 byte / gzip 9.046; CSS 6.938 / gzip 2.095. Costi esclusi: moduli condivisi già presenti (SourceViewer, Radix, React, PhysicsLab) e MathLive on demand. MathLive non richiesto all'apertura, verificato nel browser; chunk esistente pesante dichiarato dal build, nessuna soglia bundle indebolita. Il manifest conserva hash e misure, non solo nomi di file. Nessuna dipendenza nuova né lock cambiato.

Ledger visuale: gerarchia serif/obiettivo coerente con la shell; palette verde e fondo esistenti; fonte in fascia aperta; controlli omogenei e >=44px; modello SI riusato; mobile in ordine di lettura; focus visibile; formule native MathLive e fallback LaTeX; movimento ridotto. Screenshot finali ispezionati con view_image (desktop, mobile, concentrazione) e confrontati con la base. Copy ammessa dal design: obiettivo, Prevedi/Sperimenta/Spiega/feedback, fonte, salva, aiuto, concentrazione; nessun CTA di capacità assente. La concentrazione può conservare lo scroll corrente del suo pannello; non è un errore di clipping della pagina.

## Contratti verso gli owner

- **S03**: il primo consumer usa `poiseuille-boundary-v1` e parametri/step del CoursePack emesso da main. Prima di estendere ad altre esperienze usare descriptor/versione canonici e modello autorizzato, senza un catalogo S20 parallelo. Nessuna certificazione contenuti derivata dal confronto numerico.
- **S06**: #309 congelata `350d65a4…` è stata ricevuta; installer e consumer già montati nel branch S06, non ancora assunti come main. `independentStudy` è NOT_AVAILABLE in S20. Dopo integrazione S00, adapter deve puntare a comandi/piano/receipts S06; niente secondo scheduler, rating o undo.
- **S17**: `lessonReplay` è NOT_AVAILABLE. Il lettore fonte recupera oggi la revisione Core; una trascrizione dichiarata non dimostra byte media disponibili. Il futuro adapter deve verificare identità lezione/sessione/hash e media reali prima di rendere il comando visibile.
- **S00**: writer unico dei raccordi e RUNLOG/NEXT comuni. Questo file fornisce l'appendice, non modifica i registri condivisi. S05/S08/S11/S01 restano semantiche future quando mostrate, nessun import da PR non integrate.

## Appendice proposta RUNLOG/NEXT — preservare la storia

Decisioni: composizione sopra main, Radix già presente e riuso ampio dei consumer esistenti; scartati quattro framework UI, nuova shell e archivio browser parallelo. REA sul distribuito Radix statica parziale con primo timeout preservato; osservazione di flussi ufficiali JupyterLab documentale, tentativo IAB fallito conservato. Nessun claim runtime del donor da analisi statica.

Errori/apprendimenti: cache di bozza e CAS devono condividere la stessa baseline; pending si congela solo dopo verifica della capacità serializzata; ogni aiuto osservato deve sopravvivere a I/O e transfer; ricevuta richiede binding al contesto completo. Test asincroni devono attendere il vero unmount/stato finale senza aumentare timeout. Runner e prodotto hanno FAIL distinti conservati in evidence.

Prossime attività prioritarie, writer S00:

1. **P0 composizione:** primo passo rileggere base/head e applicare mount+filtro, riusando il raccordo S02 già corrente; dipendenza writer S00 e ordine consumer esistenti; accettazione journey raggiungibile dalla App; prova runner sulla head composta e CI esatta.
2. **P0 gate Web:** primo passo esaminare FAIL locali e controlli CI della head S20 senza job sovrapposti; dipendenza finestra CPU concordata; accettazione stessi test standard verdi, senza aumentare soglie; prova raw + SHA.
3. **P0 remote:** primo passo usare ambiente sintetico del backend S10 autorizzato; dipendenza cookie/revoca/migrazioni esistenti; accettazione cold reopen, peer403 e revoca401 remoti; prova HTTP/browser separata da locale.
4. **P1 S06/S17:** primo passo installare gli adapter solo dopo merge dei contratti owner; dipendenze #309 e media/replay verificati; accettazione nessun comando fittizio, fonti/receipt esatti; prova integrata e capability NOT_AVAILABLE quando assente.
5. **P1 UX osservata:** primo passo walkthrough con tutor/studente e Safari/VoiceOver; dipendenza contenuto/ambiente approvati; accettazione compito recuperabile e nessun blocco critico; prova di osservazione umana distinta dal runner.
