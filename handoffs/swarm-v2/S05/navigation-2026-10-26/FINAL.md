# Verifica del raccordo autorizzato · 26 ottobre 2026

La prop App è **APPLICATA e TESTATA** nella315, fonte prodotto
`d91e71e513c144054c168dd7599f782bcc9465f5`; Appblob
`f7e4528dda752ca523f76eca6d34c615b46f58cc`. Il mandato puntuale umano e il
checkpoint iniziale sono nel README. I precedenti rapporti che dichiaravano
la patch NON APPLICATA rimangono fonti storiche, non stato corrente.

L'unico delta di prodotto da b6cba73 è `enabledViews={views}`. S02 Shell e
namespace memoria/Core sono invariati. La nuova disponibilità abilita la
destinazione nel menu e nella ricerca, usando le route montate. La memoria
era già prima del gate edizioni: ora si raggiunge anche senza URL manuale.

## Verifiche effettive

- Primo test discriminante:2FAIL/10PASS perché la destinazione mancava.
  Dopo la prop,35UI/adapter/shellPASS (20S05+15S02).
- CIWebd91FAIL per `exact` in due getByRole di TestingLibrary: opzione non
  tipata, proveniente dalla sintassi Playwright. Rimossa solo nei test; nome
  stringa è già confronto esatto, aspettative invariate. Nessun cast/ignore.
- La ripetizione dell'intero blocco è33PASS/2timeout sotto sovrapposizione
  osservata di processi; **non dichiarata verde** né attribuita alla base.
  Esecuzione isolata dei due nuovi casi:2PASS/10non selezionati, timeout
  standard invariati. Typecheck locale successivo **exit0**. La CI della
  nuova head deve verificare nuovamente il blocco completo.
- Nuovo browser reale: **18controlliPASS**, zero console/pageerror inattesi,
  Chromium cached **148.0.7778.96**, cookie e SQLite canonici. Quattro casi
  desktop: docente/studente, con/senza corso; due casi390px: entrambi i ruoli
  senza corso. Per ognuno menu→memoria, ricerca con Invio→memoria+focus,
  coldreload+assenza overflow. Touch emulato, non device fisico.
- Tempo dell'intero smoke browser **19609.959ms**, misura singola sotto
  carico condiviso; non benchmark di rendering, p95 o efficacia didattica.
  Non sono stati aumentati timeout o terminati processi altrui.

Log byte-originali in gzip con roundtrip/digest nel manifest; screenshot e
risultati nel sottofolder evidence. Inventario verifica i byte del prodotto
contro d91: il commit successivo cambia solo due opzioni di test e conserva
prove/memoria. La fonte osservata non viene trasferita a un nuovo prodotto
senza confronto. DB, token, cookie e fixtureaccessi restano fuori dalla consegna.

Il primo tentativo di staging ha trovato index.lock perché lo sparse-checkout
di questa stessa sessione era ancora attivo: nessun lock rimosso, nessun commit
parziale; attesa la conclusione e verificato l'indice prima del commitd91.
È un errore di orchestrazione conservato, non un conflitto con un altro writer.

S02 ha consegnato una propria prova QA con prop e modifica della cronologia:
non contata fra questi18PASS. Il suo finding preesistente replaceState/Back è
una proposta separata aS00, **non modificata qui**, perché la delega umana
copre solo enabledViews. Non si dichiara Back/Forward collaudato da S05.

Browser chiuso dal finally del runner. API11163 e Vite11165 propri terminati
dopo verifica cwd+commandline; slot e porte5425/5426 rilasciati al checkpoint
6411775272. Nessun ulteriore browser/compiler/build/suite locale pianificato.

## Stato e appendice per S00

**READY_FOR_INTEGRATION lato S05**, subordinato alla CI esatta della nuova
head. Main/316/315 non integrati o distribuiti da questa sessione. Il vecchio
raccordo App pendente è ora risolto con delega esplicita; non chiedere di
applicarlo una seconda volta. Conservare il delta App di una riga durante
la composizione con S06 e le altre route realmente montate.

RUNLOG/NEXT rimangono al writerS00: appendere questa correzione datata,
preservando FAIL/PASS e motivazioni dei checkpoint precedenti.

1. **P0 CI e integrazione:** primo passo verificare head finale315 e tutti i
   check, poi316→315 con merge tree/postmerge e menu/ricerca reali. Dipendenza
   S00 e contrattoS02; accettazione SHA/CI/percorso verificati, nessun verde
   ereditato o chiusura per sola ancestry. Raccordo App già incluso.
2. **P0 backend autorizzato:** prima prova due browser con Auth/Storage veri,
   revoca, isolamento, cold e backup. DipendenzaS10/ambiente; accettazione
   ricevute/versioni/restore e fonte esatta. Locale sintetico non è remoto.
3. **P1 cronologia Root:** S00 valuta la propostaS02 pushState per vista
   diversa e nessun duplicato su vista corrente; accettazione Back/Forward
   e focus su composizione finale, test discriminante e browser. Non inclusa
   nella delegaS05 di una sola prop.
4. **P1 scala/portabilità/manutenzione:** misurare carriere realistiche e
   raccordare gli originali al notebookCore; registry/licenze aS12/S15.
   Accettazione backup/import autorizzati, rollback del renderer e digest
   rintracciabili, nessun secondo archivio o vettoriale senza bisogno misurato.
