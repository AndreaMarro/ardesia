# Ardesia — criteri di accettazione visuali e 3D

**Stato:** contract progettuale. Non certifica alcuna feature implementata. **Data:** 27 ottobre 2026.

## Il problema osservato

La review del 27 ottobre ha evidenziato: una Room su Excalidraw con toolbar `raccolta / formula / media / sim / lezioni`, pagine dei corsi pubblici e privati separate, un Core hosted non configurato nel rilascio integrato, 43 lezioni DRAFT e 0/200 obiettivi editorialmente accettati. Le PR e i test esistenti dimostrano sviluppo e protezione dalle regressioni, non completezza del prodotto.

### Severità (valutazione qualitativa, non misurazione statistica)

| Problema | Impatto | Significato |
|---|---|---|
| eLab e `sim` residui | **P0** | Rimuovere eLab come prodotto e superficie Ardesia; disaccoppiare dipendenze prima delle cancellazioni. Nessun `sim` come sostituto di eLab. |
| Lavagna ricca solo sulla carta | **P0** | La scena corrente non mostra naturalmente quaderno, oggetti scientifici, evidenze e continuità. |
| Separazione catalogo/edizioni/corsi | **P0** | Manca un ingresso didattico unico che conduca alla lezione attiva. |
| Simulazioni 3D non credibili o irrilevanti | **P0** | Tre fenomeni manipolabili con solver, controlli e misure; non solo rendering. |
| Stile incoerente fra superfici | **P1** | Un unico design system, non copia integrale di un mockup. |
| Core remoto e collaborazione assenti | **P0 al rilascio beta** | Client locale non equivale a collaborazione funzionante per studenti reali. |

## Cosa significa DONE per la lavagna

- [ ] Schermata iniziale comprensibile senza tutorial: obiettivo della lezione, penna, inserisci, undo, salva, materiali, attività.
- [ ] Aspetto chiaro, editoriale, coerente: gerarchia tipografica, scala spaziature, superfici carta, palette semantica riservata a significati (errori, prove, concetti), icone coerenti. Evitare 9 pannelli permanenti.
- [ ] Scrittura naturale e fluida (penna, evidenziatore, gomma, selezione), export e riapertura verificati su desktop+iPad emulato; test su device fisico quando disponibile.
- [ ] Oggetto educativo scientifico trascinabile nella pagina; formula, grafico, esperimento, domanda, audio e fonte possono coesistere.
- [ ] L'oggetto è editabile e produce output osservabile: modifico parametri → varia il fenomeno e il grafico → salvo uno stato → rientro e lo trovo identico.
- [ ] Audio e annotazioni riferiscono gli oggetti esatti, non una registrazione scollegata.
- [ ] In una lezione condivisa il docente può concedere la scrittura e il sistema evita conflitti, duplicazioni, fughe di contenuti privati.
- [ ] Nessun riferimento user-facing a `eLab` oppure a una modalità `sim` legacy. La sola persistenza di vecchi artefatti rimane gestita da migrazioni esplicite.

## Cosa significa DONE per i corsi

- [ ] Catalogo pubblico e workspace personale utilizzano lo stesso riferimento stabile di corso e lezione.
- [ ] Studente: seleziona corso → entra nella lezione → manipola → prova → riceve feedback → riapre tentativo e passo corretto.
- [ ] Docente: crea da materiali → verifica contenuto → pubblica → assegna → legge evidenze → riusa e aggiorna corso.
- [ ] Nessun corso esposto come completo quando `editorialStatus === DRAFT` o senza controllo scientifico attestato.
- [ ] Navigazione unica; il ritorno dalla lavagna al corso conserva stato, lezione e permessi.
- [ ] Niente finti checkout, finti utenti o contenuti «rilasciati» senza validazione.

## Cosa significa DONE per le simulazioni fisiche 3D

Ogni modulo deve presentare un **contratto scientifico**:
`modelId/version`, grandezze + unità, ipotesi e intervallo di validità, equazioni e integratore, condizioni iniziali, conservazioni/limiti, test numerici, performance, output strutturato, stato serializzabile e provenienza.

- [ ] 3D deve fornire reale orbit/pan/zoom, selezione di oggetti, manipolazione parametri e feedback leggibile.
- [ ] Confronto simultaneo con equazioni, grafici quantitativi e valori misurati.
- [ ] Simulazioni 3D diverse mantengono lo stesso contratto di inserimento, accessibilità, salvataggio e collegamento LessonOS.
- [ ] Per ogni modulo: almeno un test analitico, un test numerico, un test di edge case, un test browser di ingresso e riapertura e un smoke sul deployment Vercel.
- [ ] Strumenti riusati da terzi richiedono verifica licenza (codice, asset e dipendenze separati), aggiornabilità e attribution.
- [ ] Un video GLB o GIF non viene registrato come «simulazione» finché il modello non cambia al variare dei parametri.

## REA: scorecard di importazione

| Campo | Esito minimo |
|---|---|
| Provenienza | Repo, commit/tag, licenza, dipendenze |
| Utilità | Fenomeno e obiettivo didattico specifici |
| Correttezza | Solver riproducibile, unità, limiti, test |
| UX | Manipolabile con mouse, touch e tastiera; non richiede 10 menu |
| Integrazione | Consumer Ardesia canonico, nessuna nuova session authority |
| Persistenza | Stato e revisione riaperti dopo reload |
| Deployment | URL, SHA e walkthrough verificati |
| Manutenibilità | Owner del modulo e percorso aggiornamento upstream |

**Esito «recuperato»** solo se tutte le righe sono soddisfatte. Altrimenti `RESEARCHED` o `PROTOTYPE`, mai `DONE`.

## Nota di ambito
Questo file raccoglie decisioni visive e requisiti: non modifica runtime, route, versioni, privacy o infrastruttura. Il controllo dei dati rimane distinto da qualsiasi anteprima o immagine generata.
