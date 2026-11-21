# Il banco autore di Officina di Fisica

Sul Mac che ospita il servizio, apri **Area autore.command**. Il comando avvia l’Officina se necessario e apre nel browser un accesso personale monouso. Se il collegamento è scaduto, riapri il comando. Se hai già configurato una password autore, puoi anche entrare dal sito e scegliere **Il mio studio → Banco autore**.

## Correggere una lezione e pubblicarla

1. In **Materiali**, cerca il titolo o il codice. I filtri per corso, tipo e stato permettono di restringere l’archivio.
2. Apri il titolo del materiale. Correggi il paragrafo o la formula nel blocco interessato. La pulsantiera della formula inserisce frazioni, potenze, indici e radici al cursore. Puoi sostituire direttamente numeri e lettere.
3. Scegli **Anteprima** e rileggi il passaggio accanto alla figura. Per riprendere il lavoro, chiudi l’anteprima.
4. Con **Salva bozza** crei una versione sul server, disponibile anche da un secondo dispositivo con accesso autore. Durante la digitazione il browser conserva inoltre una copia locale. Dopo un’interruzione, riapri lo stesso materiale nello stesso browser e scegli **Leggi la copia** oppure **Riprendi questa copia**. Per un materiale ancora privo di bozza sul server, riapri **Crea un materiale** e il tipo scelto inizialmente.
5. Apri **Rivedi e pubblica**. La pagina mostra versione, contenuto e corsi interessati. Conferma con **Pubblica v…**. Le nuove aperture usano questa edizione. I tentativi già registrati conservano il riferimento alla versione originaria.

Se un’altra sessione salva una versione più recente, il server segnala il conflitto. Riapri la scheda, confronta la copia locale con il testo sul server e salva la correzione concordata. **Storico delle versioni → Ripristina in bozza** crea una nuova bozza da un’edizione precedente. **Ritira dal catalogo** chiede una conferma prima di sospendere la disponibilità pubblica del materiale.

## Aggiungere corsi, sezioni e attività

In **Materiali → Crea un materiale**, scegli **Corso**, **Sezione**, **Lezione**, **Esempio svolto**, **Quesito** o **Laboratorio**. Il codice generato identifica stabilmente la scheda. Puoi cambiarlo prima del primo salvataggio. Per una correzione futura torna sullo stesso codice.

- **Corso e sezione.** Compila il titolo e, per un corso, la descrizione del catalogo. In **Organizzazione e riutilizzo** puoi includere corsi esistenti. Per una sezione scegli il corso principale. Nelle lezioni e negli esercizi usa il medesimo nome nel campo **Sezione nel corso**. Rinominando una sezione già utilizzata prepari insieme le bozze dei materiali da spostare.
- **Lezione.** Componi una sequenza di testo, formula, figura e attività collegate. Sotto **Organizzazione e riutilizzo** puoi scegliere prerequisiti e altri corsi nei quali proporre la stessa scheda. C6 eredita già i contenuti dei cinque microcorsi inclusi.
- **Esempio svolto.** Inserisci la consegna, la lezione di riferimento e la difficoltà. Componi nei blocchi dello svolgimento la spiegazione, le figure e i conti. Nell’anteprima usa **Un passaggio alla volta** per verificare come si leggono separatamente. Ogni figura resta con la didascalia. Un nuovo blocco formula o un paragrafo tra due calcoli può iniziare un passaggio. **Mostra tutto** ripristina la pagina integrale. La famiglia raggruppa problemi con lo stesso ragionamento. Per una variante numerica conserva la famiglia del problema di origine.
- **Quesito.** Aggiungi consegna, svolgimento e modalità di risposta. Per una scelta multipla scrivi un’alternativa per riga e seleziona quella corretta. Per un completamento puoi elencare grafie equivalenti. Per un numero inserisci valore, unità e tolleranza assoluta. Scrivi il suggerimento, il feedback e il tipo di errore. Nel campo di recupero scegli una lezione o un laboratorio dall’elenco.
- **Laboratorio.** Scegli uno dei cinque modelli, imposta i valori iniziali nei limiti indicati e compila previsione, osservazione e interpretazione. L’anteprima mostra disegno e letture per quella configurazione iniziale. La competenza collegata guida la verifica successiva.

**Figure e allegati.** Seleziona **Figura → Aggiungi blocco**, scegli un PNG, JPEG, WebP o SVG e scrivi una didascalia che spieghi dove guardare. Per sostituire il disegno usa lo stesso selettore. Un singolo caricamento ammette fino a 4 MiB. Per un PDF scegli **Allegato** e assegna il titolo del download. Un PDF caricato resta un documento allegato. Per un quesito, un disegno necessario a capire il testo va tra **Figure e formule prima della risposta**. Le figure che spiegano la soluzione appartengono allo **Svolgimento**.

**Ordine.** Le frecce accanto ai blocchi ne cambiano la successione. Per ordinare più schede apri **Materiali → Riordina i materiali**, scegli corso, tipo ed eventualmente sezione. Usa le frecce e salva l’ordine in bozza. Nell’archivio puoi selezionare più bozze, scegliere **Rivedi la selezione** e pubblicarle insieme. Includi nello stesso gruppo eventuali materiali nuovi che si richiamano a vicenda.

Il feedback, la categoria e il collegamento di recupero di ogni quesito di studio alimentano anche **Errori e recupero** nella pagina del corso. Inserisci un’indicazione che lo studente possa applicare leggendo la situazione. Dopo la pubblicazione, la scheda aggiornata compare anche nei percorsi che condividono il quesito. I fascicoli d’esame riservano gli svolgimenti alla consegna.

## Importare un lotto preparato da Astra o Codex

1. In **Importa ed esporta → Scarica archivio JSON** ottieni le schede di lavoro e i file caricati. Se devi correggere un lotto, parti da questa esportazione e mantieni solo i record interessati e gli asset necessari.
2. Un pacchetto ha schema `astra/1`, elenco `records` ed eventuale elenco `assets`. Per un nuovo contenuto usa un ID nuovo e `baseVersion` uguale a 0. Per una correzione conserva ID e `baseVersion` dell’esportazione aggiornata. La versione di partenza consente di individuare modifiche concorrenti.
3. Carica il JSON o incollalo. **Controlla il lotto** segnala gli ID e i riferimenti da correggere. **Importa in bozza** ripete il controllo e salva l’intero lotto in una transazione. Un errore mantiene il lotto fuori dall’archivio.
4. Apri le bozze, controlla calcoli, unità, figure e distrattori. Pubblica soltanto dopo la revisione. Il pacchetto dimostrativo `docs/lotti/lotto-001.json` contiene l’esempio del galleggiante e il quesito dei due termometri già presenti nell’edizione consegnata. Per aggiornare quelle due schede esporta le loro versioni correnti.

## Aggiornare i fascicoli scaricabili

Dopo la pubblicazione scegli **Edizioni PDF**. Cerca il corso e il fascicolo con stato **Da rigenerare** e premi **Rigenera**. Il servizio usa le schede pubblicate. Al termine compare **Allineato** e puoi scegliere **Scarica**. **Aggiorna stato** ripete la lettura. Il download nel percorso dello studente usa lo stesso fascicolo. Una modifica a una scheda condivisa può interessare più volumi.

## Registrare un incasso

In **Ordini e incassi**, apri **Coordinate, offerte e modalità di vendita**. La modalità **Verifica** consente di provare l’intero passaggio con un importo fittizio. Per attivare i bonifici reali inserisci intestatario, IBAN, condizioni commerciali, prezzi e causale con `{ordine}`. Compila le inclusioni per le offerte con incontri. Per lasciare un’offerta chiusa, lascia vuoto il relativo prezzo.

Quando arriva un bonifico, individua l’ordine **in attesa** confrontando codice, studente, causale e importo con il movimento sul conto. Inserisci l’**Importo riscontrato**, spunta la verifica dell’effettivo accredito e premi **Conferma accredito**. Un importo diverso viene registrato e lascia l’ordine in attesa. Una conferma corrispondente attiva i materiali delle offerte digitale e combinata. L’offerta di soli incontri registra l’incasso per gli incontri. Lo studente ritrova ordine e accessi in **Il mio studio**. Per riscontrare l’operazione apri **Registro operazioni**.

## Come ripetere le prove

Dalla cartella dell’applicazione, con Python 3, Node e Chrome disponibili, esegui `npm ci` e `node tests/editor.mjs`. Il collaudo apre un archivio temporaneo e usa i controlli dell’interfaccia per creare, modificare, recuperare, riordinare, pubblicare, esportare e ritirare materiali. Include caricamenti, recupero della copia locale, formule e anteprima di laboratorio. Per le prove HTTP su accessi, tentativi e bonifici usa `python3 -m unittest discover -s tests -p test_workflows.py`. Le prove di interfaccia usano Chrome con viewport emulati.

Da **Edizioni PDF** puoi anche scaricare l’inventario dei record pubblicati e la matrice MUR in formato CSV. I due pulsanti leggono l’edizione presente nel database al momento della richiesta.
