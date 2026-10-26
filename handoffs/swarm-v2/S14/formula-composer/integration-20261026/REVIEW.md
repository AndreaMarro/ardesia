# Review tecnica indipendente del raccordo Formula

Revisore: agente autore dell'integrazione media S08/S17 (`/root/vercel_recon`).
Si tratta di review tecnica di codice, non di approvazione umana o scientifica.

## Delta 88e468a → 7f7623a

Il revisore ha verificato che canvas e journal vengono catturati prima dell'await
e ricontrollati prima di `addImages` e `recordMathInsert`. Gli errori tardivi non
scrivono lo storageError di un nuovo contesto. Il pending viene rilasciato in
finally, il trigger duplicato è bloccato e il menu mobile si chiude.
`queueSceneWrite`, `preserveEditorial` e `addLessonMoment` sono invariati.
Nessuna violazione dimostrata del contratto nella delta letta.

## Delta 7f7623a → 4ba6c2b

Il posizionamento legge il canvas catturato dopo il fence di identità, esclude
gli elementi cancellati, usa i bounds comprensivi di rotazione di Excalidraw e
aggiunge la formula sotto bottom+24. Non modifica le voci di scena precedenti.
Writer unico e consenso restano invariati. Nessun finding dimostrato.

Il revisore ha segnalato che il fit immediato dipende dall'applicazione di
`updateScene`; la prova browser del build finale verifica l'esito pratico:
formula e annotazione separate e visibili, elemento originale uguale, capitolo
preservato e round-trip portabile riuscito. Report e schermate sono conservati
in `evidence/`, con SHA prodotto `4ba6c2b489965e5e0e63c8d9a9b90efd5fc9c1cb`.

## Strumento storico

`apps/studio/bin/review.sh` invoca uno script esterno in `$HOME/lessonos` e imposta
`REVIEW_REPO=$HOME/maestro-studio`: non punta a questo worktree. Non è stato
eseguito fingendo che producesse review di questa SHA. S00 mantiene la review
e i gate dell'integrazione finale.
