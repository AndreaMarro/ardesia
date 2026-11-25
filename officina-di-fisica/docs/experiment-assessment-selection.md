# Selezione didattica delle verifiche sperimentali

Una nuova edizione `astra/1` di una simulazione può specificare `assessmentSelection`:

```json
{"schemaVersion":"1.0.0","points":[0,2]}
```

I due numeri sono valori del controllo già installato: devono essere finiti, distinti, entro il dominio e sulla sua griglia. Lo schema è `contracts/experiment-assessment-v1.schema.json`; dominio Python e consumer JavaScript verificano anche i vincoli rispetto al controllo. Il secondo valore governa sia il problema sia l’invito a ripetere la misura nel quarto passaggio.

La selezione non contiene risposte o formule eseguibili. La misura attesa viene sempre dalla legge fisica installata. Restano immutabili apparato, legge, unità, controllo, riferimenti originali e gli altri campi fisici protetti. In assenza del nuovo campo si conserva esattamente la selezione precedente: secondo riferimento e punto mediano residuo.

La modifica passa dall’importatore esistente, che crea una bozza in una nuova versione e conserva l’edizione pubblicata e la storia. La validazione strutturale non sostituisce risoluzione indipendente, verifica della fattibilità manuale o approvazione umana. Nessuna pubblicazione automatica è aggiunta.

Le letture numeriche non usano più punti come separatori delle migliaia: una lettura copiata resta compatibile con il campo risposta esistente. Precisione, separatore decimale e tolleranze non cambiano. Le sole proiezioni geometriche a quadratura esatta restituiscono zero esatto; le piccole componenti non nulle non vengono azzerate con una soglia globale.

La validazione `uniqueItems` usa l’[uguaglianza del modello JSON Schema 2020-12](https://json-schema.org/draft/2020-12/json-schema-core#section-4.2.2): `1` e `1.0` coincidono; un booleano e un numero sono distinti. Il controllo comprende anche oggetti e array annidati, entro il limite di profondità esistente.
