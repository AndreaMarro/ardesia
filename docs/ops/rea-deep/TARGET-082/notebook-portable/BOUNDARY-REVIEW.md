# Review indipendente — confine portabile del quaderno

Esito: **nessun finding bloccante individuato nel perimetro esaminato**.

Revisione in sola lettura dei due validatori TypeScript, confrontati con `scientific_notebook.py`, `portable.py` e i casi di `notebook-portable-model.test.ts`. Letti gli AGENTS pertinenti; lo stato generato e il contesto HEAD `12296e6be225be7571be88ca55b67bd3fd30784d` sono stati forniti dal coordinatore. Non ho modificato il prodotto, eseguito suite, browser o processi di altri agenti. Questo controllo non equivale a una review cross-family del wrapper esterno.

## Invarianti verificate nel codice

- Gli oggetti dello snapshot scientifico hanno chiavi esatte, versioni e coordinate esplicite; non vengono normalizzati schemi ignoti.
- Annotazioni, pagine, rettangoli, testi e ID sono limitati prima di raggiungere il renderer. Rifiuto di NaN/infinito, geometrie fuori pagina, ID duplicati, NUL e surrogati isolati nei contenuti.
- I testi derivati devono corrispondere esattamente allo stato conservato. Le annotazioni e i rettangoli vengono copiati, evitando alias con il JSON di input.
- La selezione delle risorse usa la coppia risorsa/revisione. I duplicati discordanti falliscono; nessuna sostituzione con la testa corrente.
- Un quaderno mantiene identico binding asset/SHA/pagine attraverso le revisioni; un asset incluso deve avere esattamente identità, SHA e MIME attesi. Vengono rifiutati asset duplicati e conteggi byte non interi, negativi o oltre i limiti.
- Il parser conserva l'edizione come metadato; non conferisce permessi né produce lookup sul Core.
- Le dichiarazioni hash rimangono dichiarazioni: la verifica canonica Python e la verifica dei byte devono continuare nel percorso `/notebook/inspect` e nel decoder locale. La mancata ricostruzione dell'hash Python in JavaScript è corretta, soprattutto per i token numerici.

## Probe isolati eseguiti

1. Import diretto di `scientificNotebookSnapshot.ts` con Node 24 e confronto con il vero `validate_state` Python.
2. Titoli U+0085 rifiutati, U+180E/BOM/U+200B accettati, surrogato alto isolato rifiutato: risultati concordi tra i due validatori.
3. Stato sintetico con 200 annotazioni, ID di 64 caratteri, 18.000 caratteri di controllo U+0001 nei contenuti e coordinate decimali lunghe: entrambi accettano. Testo derivato: 19.801 punti di codice. Encoding JS: 153.035 byte; encoding Python: 151.435 byte. Questo prova la distinzione tra le due codifiche nel caso eseguito, non la loro equivalenza generale né il limite massimo possibile.
4. Prima variante con 91 caratteri di controllo per annotazione: rifiutata dal validatore JS perché il testo derivato raggiunge 20.001 punti di codice. Non è stata dichiarata un'accettazione valida.

## Limiti e osservazioni non bloccanti

- Il caso del modello «originale assente» prova soltanto la conservazione dello snapshot nella proiezione locale. Il Core corrente chiama `inspect_snapshot(..., asset_index)` e rifiuta sempre un PDF scientifico assente, anche se `omissions` lo cita. Di conseguenza una riapertura riuscita con fallback per PDF mancante non è dimostrata da quel test e non è raggiungibile nell'attuale flusso che richiede `/inspect` positivo. È una distinzione da mantenere nella documentazione e nelle affermazioni sui test, non un motivo per indebolire l'integrità.
- L'assenza di ACL nell'import è intenzionale. Coerenza dei metadati identitari dichiarati e autenticità canonica non sono sinonimi: l'artefatto resta non firmato.
- Non ho eseguito `notebook-portable-model.test.ts`; i casi sono stati letti. Nessuna affermazione sul renderer PDF, cleanup dei worker, decodifica locale, ciclo browser o suite complessive rientra in questa review.

## File osservati e SHA-256

- `apps/studio/src/study/scientificNotebookSnapshot.ts`: `4cd4f1d81ce150f28a719f80310ac7d293d059c3f0f32f7a511cd40cd0e11eb2`
- `apps/studio/src/study/notebookPreview.ts`: `0562b8815dff13c6b061ba675d2c15a328cc8e016ee17bda3c6b9d182efdb4ed`
- `apps/web/src/__tests__/notebook-portable-model.test.ts`: `865719a1e3372339706b67ee77d1dc8f1f341b10c3c4e63c1f57472d5867f637`
- `packages/engine/lessonos/study/scientific_notebook.py`: `75b2eeac6b1b66b2df1e49b203ea0edc02e4a2f2989c56e96073c2a8ff668914`
- `packages/engine/lessonos/study/portable.py`: `efcc324ea5124d9ed25053b3629d699934a85536e98cb42c22229a6cfdfd509e`
