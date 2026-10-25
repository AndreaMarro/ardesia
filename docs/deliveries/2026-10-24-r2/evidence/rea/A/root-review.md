# Review indipendente della UI root — esito circoscritto

Nessun edit ai file root. Lettura di ScalarExperienceEpisode, api/PredictionEvidence/Classroom, HydrostaticModel/PublicHydrostaticLab, PublicExperience/exporter e stili. I manifest e i solver restano Core; non è un audit completo di sicurezza o schema.

Due finding concreti segnalati e risolti dal proprietario:

- Privato senza campioni: HydrostaticModel prometteva/descriveva una curva mai renderizzata. Il copy ora distingue schema+valore dal grafico pubblico; DOM reale con graphs0 e caption coerente verificato.
- Ultimo indizio: il pulsante diventava native disabled, con focus BODY dopo Enter a390 e1440. Due negativi reali registrati. Dopo fix root aria-disabled+guard, controprova7checkPASS/0finding, focus BUTTON conservato; nessuna nuova consegna nel rerun del solo focus.

Primo browser su API reale, student04 sintetico:9check utili e4ricevute (errore, correzione, assoluta, trasferimento). Valori19620/120945/114335Pa e completamento/reset/focus titolo coerenti; nessun pageerror. Fonte audio non presente: nessun replay attestato. Entry Hydro riconoscibile e a piena larghezza a390; nessun overflow. Non è stata dichiarata una review del pubblico5442: assegnata dal root a un altro revisore, per evitare duplicati.

Due probe indipendenti fuori repo PASS sul sorgente finale riletto (test del componente con API controllata, distinti dalle ricevute API reali): cambio della head di una fonte mantiene old-revision in sourceRefs e lessonPassageRef; risposta tardiva dell'edizione precedente non popola la nuova UI né invoca il vecchio refresh. I primi due errori di configurazione del runner sono conservati in work; non sono finding prodotto. Log finale scalar-probes-final.log. Niente nuova suite completa, oltre la340PASS già conclusa prima della richiesta root di non ripeterla.

Tre sorgenti root rilette e immutate prima/dopo i probe finali:

| File | SHA256 |
|---|---|
| ScalarExperienceEpisode.tsx | 752f18d6ed75b672dccc998331ece0490827b3960491500fbb89c003d154de9e |
| HydrostaticModel.tsx | f7f9419fdffc1d875df81d77b0cf6043a9330bb9c361ee8c5c265ebc02fac22d |
| Classroom.tsx | 577f783e65b78abbc7ab0e611448f34e199c12cf528da2ca2b0224d4d2f3d4c4 |

Metadati ridotti, negativi, fix verification e limiti in root-review.json. Screenshot originali del prodotto inclusi; nessun raw donor, token o stato autenticato in questa selezione. Il root mantiene la responsabilità di CI/artifact finale e del percorso docente→Studio→studente→revisione.
