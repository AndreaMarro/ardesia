# Prove della candidata Cric 5a590742

Questi file provengono dall’artefatto del [run 46045340845](https://github.com/AndreaMarro/ardesia/actions/runs/46045340845). Il job principale e le dodici verifiche delle simulazioni risultano **SUCCESS**. Il run ha eseguito il merge commit `cf0ad6a1ee62fc281cda10bdf9569732d1f5b3ae`, il cui albero `cbde95d1bab260acc81b6d257bcae9ca5f760375` è identico alla head della PR `5a590742485335e191dca2ecfbf53381224491bf`.

Il [manifest](manifest.json) conserva dimensioni e SHA-256 degli estratti, dell’artefatto scaricato e del pacchetto installabile. I file sono copiati senza ritoccare le immagini o riscrivere i report originali. Sono dati sintetici, su database temporanei: indirizzi localhost, token di raccolta e nota `PRIVATE-NOTE` non appartengono a una sessione reale del proprietario. Le immagini delle raccolte mostrano la vista del docente; il test verifica separatamente che la nota personale non venga consegnata al visitatore.

## Che cosa dimostrano

Il [report delle risorse](report.json) registra otto controlli del percorso completo e cinque audit automatici senza violazioni rilevate, su Chrome `158.0.8127.36`. Il docente apre lo strumento senza previsione obbligatoria, modifica i parametri con la tastiera, mantiene i comandi in concentrazione e riapre lo stesso caso in un altro contesto. Salvataggio, reload, isolamento fra account, raccolta, lezione collegata, revoca, nuovo token e rimozione dei contenuti privati dopo logout sono esercitati. I registri di tentativi ed eventi di laboratorio restano identici prima e dopo l’esplorazione.

La prova usa `r=2,2 mm`, `t=0,1 s` e vista `diagram`. Non dimostra ogni combinazione di parametri, ogni vista della camera o il consumer delle risorse su ogni browser. Le dodici simulazioni native su Chromium/WebKit e gli scenari multidisciplinari hanno ambiti distinti; il [report dell’architettura](architecture-report.json) conserva le proprie misure e gli audit.

La CI ha inoltre superato 285 test JavaScript, due contratti con compilazione TypeScript, 102 test Python, browser principale, editor, controlli del lettore e dei banchi, packaging riproducibile e verifica dei fascicoli. Il gate scientifico esteso del corpus è un workflow separato: questo dossier non ne deduce il risultato e non costituisce approvazione umana alla pubblicazione.

## Immagini esaminate

| File | Stato mostrato | Dimensione |
| --- | --- | --- |
| [01-resources.png](01-resources.png) | Catalogo dei dieci strumenti e ingresso al caso pilota. | 1440 × 1732 |
| [02-reproducible-case.png](02-reproducible-case.png) | Caso di Poiseuille modificato, collegamento selezionato, vista 2D e controlli. | 1440 × 1775 |
| [03-collection.png](03-collection.png) | Raccolta privata del docente con condivisione attivata. | 1440 × 1671 |
| [04-case-320.png](04-case-320.png) | Lo stesso caso a larghezza 320 pixel. | 320 × 2928 |
| [05-collection-320.png](05-collection-320.png) | Editor della raccolta a larghezza 320 pixel. | 320 × 2052 |

## Revisione visiva e limiti

La gerarchia del catalogo, la distinzione fra apertura dello strumento e raccolte, e la presentazione dei moduli conservano colori, caratteri e illustrazioni di Cric. Nei viewport collaudati non compare scorrimento orizzontale della pagina. Le azioni della raccolta e i relativi campi rimangono raggiungibili sullo schermo stretto. Questa è un’ispezione di immagini e prove eseguite da agenti, non un test di comprensibilità con persone.

Rimangono interventi concreti, da trattare prima di definire conclusa la qualità del prodotto:

1. **Scorrimento nel banco mobile.** Nello screenshot a 320 pixel la scena, la spiegazione e i parametri occupano sezioni distanti. Ridurre il tragitto tra modifica del parametro e osservazione del risultato, mantenendo accessibilità e tutte le funzioni. Verificare la scelta con un compito reale di confronto fra due casi.
2. **Leggibilità della tavola sul telefono.** Il disegno si riduce e alcune etichette diventano piccole. Le letture numeriche sono disponibili fuori dal disegno, ma occorre verificare la comprensione con zoom, rappresentazioni alternative e tecnologia assistiva. L’assenza di overflow non prova leggibilità sufficiente.
3. **Etichetta dell’istante.** Nella vista desktop aperta, `Istante (s)` viene disposto su più righe perché la label del componente temporale contiene testo e uno span dentro un layout a griglia. Rifinire la disposizione nel consumer composto e verificarne il nome accessibile, coordinando un’eventuale correzione del componente nativo con il revisore scientifico.
4. **Orientamento nell’uso libero.** La spiegazione conserva il contatore del banco guidato (`Esplora · 3/5`). Valutare un’etichetta più coerente con l’uso libero, preservando l’accesso ai passaggi e senza confondere il contatore con progresso o competenza.
5. **Continuità oltre il caso.** Il ritorno diretto alla raccolta è implementato dal caso. Lezione e pratica richiedono ancora il completamento del contratto di origine; il legame deve restare ritrovabile lungo l’intero percorso.

Gli audit delle risorse contengono anche risultati `incomplete`: controllo manuale del contrasto in catalogo e banco, e `label-content-name-mismatch` nella raccolta desktop. Sono conservati nel report. Zero violazioni rilevate automaticamente non equivale a conformità WCAG complessiva. La verifica manuale con tecnologie assistive, la comprensibilità cognitiva e l’efficacia didattica restano separate.

## Riprodurre

Da `officina-di-fisica/` della candidata, con i prerequisiti descritti nel [handoff](../../HANDOFF-ASTRA-CLAUDE.md):

```sh
node tests/browser-resources.mjs
node tests/browser-discipline.mjs
node tests/browser-architecture.mjs
python3 tools/package_release.py var/cric-candidate.zip --verify
```

Il primo comando produce di nuovo `var/arch/browser/resources/`. Il test dell’architettura include a sua volta i percorsi delle discipline e delle risorse. Per l’esito completo usare i comandi del workflow della candidata; per il corpus scientifico leggere il workflow e i registri dedicati.
