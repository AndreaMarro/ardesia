# Collaudo dell’edizione 1.0.0

**Officina di Fisica · Andrea Marro · 21 novembre 2026**

## Contenuti scientifici

| Oggetto verificato | Metodo ed esito |
|---|---|
| Programma MUR 2026/27 | 7 unità, 38 voci, 105 obiettivi collegati a lezioni, esempi, esercizi e verifiche mirate. Tutti i riferimenti della matrice risolvono. |
| Catalogo di partenza | 790 record con ID stabili. I cinque microcorsi hanno ciascuno 100 quesiti aggiuntivi di 100 famiglie e 21–23 esempi svolti. C6 condivide gli ID dei cinque moduli e aggiunge raccordi, problemi misti e tre prove. |
| Calcoli pubblicati | Ricalcolate tutte le 258 chiavi numeriche. Le verifiche dei cinque moduli e di C6 includono 35 soluzioni quantitative a scelta delle simulazioni. I controlli degli esempi coprono 117 esempi guidati, con confronti di valori, unità, segni, figure e ragionamenti pertinenti. |
| Composizione e asset | 719 blocchi formula composti con KaTeX. 135 tavole scientifiche SVG nell’edizione, oltre alle figure calcolate dal banco interattivo. Il catalogo verifica esistenza, formato e riferimenti. |
| Simulazioni d’esame | Tre fascicoli originali di 31 quesiti. Controllati ordine, cinque alternative per le 21 scelte, 10 completamenti, correzione differita, scadenza e punteggio. Il confronto testuale trova zero enunciati identici nelle 56.730 coppie fascicolo/modulo e nelle 4.278 coppie interne. La revisione per argomento e modello integra questo confronto testuale. |
| Recupero | 513 situazioni di studio distribuite su 56 competenze. La scheda mostra difficoltà, svolgimento e attività collegata. Il nuovo caso cambia famiglia. Consultare la soluzione registra un’esposizione alla versione esatta; un tentativo assistito conserva tale indicazione. |

I ricalcoli per i gruppi C1/C2, C3/C4 e C5/C6 coprono 103, 94 e 60 risposte numeriche. La prova del lotto controlla la risposta calorimetrica aggiuntiva. I conteggi includono le dieci nuove schede di esempi con 31 risultati verificati. [Inventario](inventario.md) · [Matrice per obiettivo](inventario-copertura.csv) · [Revisione dei fascicoli](revisione-simulazioni.md) · [Fonti e condizioni di riuso](fonti-e-licenze.md)

I 117 esempi e le otto lezioni con più figure offrono anche la lettura **Un passaggio alla volta**. Per tutti i 125 materiali sono stati controllati l’ordine dei blocchi e l’assenza di salti. Nel browser il ritorno al testo integrale e il confronto del registro studente coprono esempi sintetici, un esempio condiviso fra corsi e la costruzione ottica. [Lettore](../static/js/lettura.js) · [Prova browser](../tests/browser.mjs)

## I cinque banchi

| Banco | Ipotesi e riscontro riproducibile |
|---|---|
| C1 · Forze | Blocco inizialmente fermo su piano orizzontale, attrito di Coulomb e coefficiente dinamico pari a 0,75 volte lo statico. Sotto soglia l’attrito bilancia la trazione. Al distacco la forza risultante produce l’accelerazione attesa. |
| C2 · Condotto | Liquido newtoniano, tubo rigido cilindrico, moto stazionario laminare. Pressione, viscosità e lunghezza fissate. Dimezzare il raggio riduce la portata a 1/16. Vengono verificati proporzionalità, pressione nulla e regime nel dominio proposto. La mini-storia pubblica usa lo stesso modello del laboratorio. |
| C3 · Gas | Gas ideale monoatomico, trasformazioni d’equilibrio. Il lavoro è positivo in espansione. La prova chiude il bilancio ΔU = Q − W e verifica isocora, isoterma, isobara e adiabatica reversibile. |
| C4 · Circuito | Generatore ideale continuo e due resistori ohmici. Si confrontano correnti di ramo, cadute di potenziale e potenza. A tensione nulla la corrente si annulla. |
| C5 · Lente | Lente sottile convergente, raggi parassiali. Si verificano immagine reale, virtuale e all’infinito. Con l’oggetto nel fuoco, i raggi emergono paralleli e il banco indica ∞. |

I controlli lavorano sugli stessi modelli usati dall’interfaccia. Le prove sui casi limite sono leggibili nel repository. [Modelli](../static/js/models.js) · [Parametri e intervalli](../static/lab-models.json) · [Verifiche dei modelli](../tests/models.test.js)

## Uso normale e manutenzione

- **Studente.** Registrazione, ordine di verifica, conferma amministrativa, accesso al corso, lettura, risposta numerica e progresso. Un secondo client ritrova l’attività salvata. La suite HTTP controlla il riavvio su SQLite, la separazione fra studenti, gli aiuti e il riuso del progresso nel corso completo.
- **Allenamento ed esame.** Verifiche intermedie e finali, diagnosi, recupero e nuovo problema. Nelle simulazioni sono controllati omissione, correzione, scadenza lato server, risultati e rilascio degli svolgimenti.
- **Ordini.** Modalità verifica con €1 fittizio. Controllati richieste simultanee, duplicati, acquisto già presente, incasso diverso, annullamento e offerte digitali, con incontri e combinate. L’abilitazione segue il riscontro manuale dell’autore. Il registro conserva l’operazione.
- **Autore.** La prova browser crea un corso, aggiunge contenuti e figure, modifica i blocchi, recupera una bozza interrotta e controlla l’anteprima. Seguono pubblicazione, riordino, ripristino, ritiro, importazione con allegati, esportazione e configurazione di un laboratorio. La prova di lotto importa, controlla e pubblica due record conservando un tentativo anteriore.
- **Permessi ed edizioni.** Le prove esercitano le API con ruoli distinti. I file riservati e i CSV editoriali richiedono autorizzazione. Cambiare una versione o un esempio collegato rende obsoleti i fascicoli che ne dipendono. La rigenerazione restituisce un’edizione allineata.
- **Browser e dispositivi.** Google Chrome su macOS. Vista desktop 1440 × 960 e viewport emulati tablet 810 × 1080 e telefono 390 × 844. Provati focus da tastiera, salto al contenuto, alternativa numerica agli slider e assenza di overflow orizzontale nei percorsi esaminati. La ripresa su un altro dispositivo è stata esercitata con sessioni indipendenti sullo stesso server. Le prove mobili sono emulazioni.
- **Stampa.** L’edizione comprende 13 fascicoli, 411 pagine A4 e 153 destinazioni di indice controllate. Tutte le pagine riportano il piè di pagina. L’audit confronta gli ID, le chiavi e le pagine con il catalogo, controlla margini, foliazione, indice, link, font, caratteri e impronte. Il verbale distingue i controlli sull’intero lotto dall’ispezione visiva dei campioni. [Verbale dei PDF](verifica-pdf.md) · [Pagina di Poiseuille](verifiche/poiseuille-stampa.png)

## Ripetere le prove

I comandi e i requisiti sono nella guida di avvio. Le prove del browser e del server creano archivi temporanei. Il collaudo macOS accetta lo ZIP o una cartella, verifica i due comandi anche a server fermo e usa una porta libera riservata al test. [Prova di installazione](../tests/installazione_mac.py) Le verifiche sui calcoli usano le schede dell’edizione distribuita, quindi si possono ripetere anche a installazione ferma. [Comandi](../README.md) · [Prove funzionali](../tests/) · [Processo dell’autore](guida-autore.md)

## Stato editoriale e commerciale

La banca è stata prodotta e revisionata con assistenza di modelli. Le verifiche automatiche e i ricalcoli sono distinti dallo stato di pubblicazione e dalla revisione scientifica umana, ancora da svolgere. L’efficacia formativa richiede osservazioni con studenti reali. L’edizione consegnata funziona localmente. Hosting pubblico del servizio studenti, HTTPS, dati bancari, prezzi e condizioni commerciali reali richiedono la configurazione di Andrea. [Configurazione e avvio](../README.md)
