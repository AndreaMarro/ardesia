# Formula composer — S14, 26 ottobre 2026

Il docente deve poter costruire una formula senza perdere l'espressione quando
inserisce una struttura o quando il canvas restituisce un errore. Si riusano
MathLive 0.111.1 e il consumer Formula della Room esistenti.

Alternative esaminate: usare le API native MathLive per selezione, history e
tastiera (ADAPT, scelta di questa sessione); aggiungere un altro editor (DEFER,
duplica capacità e dipendenze); riscrivere editing/history (DEFER, nessun valore
rispetto alla libreria MIT già nel lock). Goodnotes è riferimento funzionale,
senza riuso di codice o asset proprietari. REA sui suoi metadati non prova la UI.

I template si inseriscono nella selezione con placeholder nativi. Annulla/ripeti
e tastiera usano comandi della libreria. Una sola richiesta d'inserimento può
essere in corso; campo e azioni di modifica/chiusura sono bloccati fino all'esito.
Un errore resta visibile e conserva la bozza, consentendo un retry esplicito.
Il risultato tardivo di una vista smontata non chiude una vista successiva.
La copia LaTeX dà conferma o errore e non chiude il composer.

Ownership delegata da S00 alla chat 01a175a6: MathComposer.tsx, namespace test
formula-composer e handoff S14/formula-composer. Room resta di S07: la correzione
di insertMath viene consegnata come patch, finché il writer non la applica.
latexToImage, Vite, font e dipendenze restano invariati. Nessun secondo archivio:
il canvas salva le immagini nel WorkspaceStore/bundle.lesson già esistente.

Accettazione: RED/GREEN su pending/error/retry/unmount; test reale MathLive di
selezione/history/tastiera; typecheck/build e consumer Room con salvataggio e
riapertura. Il batch non è DONE finché manca il raccordo Room. Integrazione e
rilascio spettano a S00; browser solo nella finestra host rilasciata.
