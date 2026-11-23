# Tre sistemi di prodotto

Tutti e tre aprono C1-Q027 v2 e propongono un secondo caso con ritorno di 7 s. Si può provare l’intero passaggio dall’errore alla verifica anche scollegati. Ogni nome è un’ipotesi di lavoro, in attesa di ricerca sulla riconoscibilità e sulla disponibilità del marchio. Nel prodotto selezionato «Officina di Fisica» potrebbe identificare l’editore e la provenienza dei contenuti. Le tre alternative sono autonome.

## Passo

**Promessa e architettura di marca.** «Sapere cosa provare adesso». Un marchio unico per le sessioni. I domini sono denominati per esteso, ad esempio «Fisica · Moto». Le tappe usano verbi. Il segno a gradini indica una successione; accanto c’è sempre il nome. La voce si rivolge in seconda persona con una sola domanda per volta.

**Modello di navigazione.** In una versione estesa: sessione di oggi → singola attività → riscontro → nuovo caso → promemoria facoltativo. L’indice delle lezioni resta disponibile come via diretta. Nel prototipo la colonna «La sessione» mostra Prevedi, Controlla e Trasferisci. Sotto 741 px la colonna diventa «Passo n di 3». Il pulsante Confronto riporta alla scelta e la scheda conserva il punto raggiunto.

| Momento del viaggio | Compito e azione | Risposta dell’interfaccia | Stato d’errore o ripresa |
| --- | --- | --- | --- |
| Inizio | Leggere il moto, prevedere dove ci si ferma. | Grafico delle due aree, tre radio a testo pieno, un pulsante principale. | Invio vuoto sposta il focus alla prima opzione e indica cosa scegliere. |
| Dubbio | Aprire «Mi serve un indizio». | Mostra un criterio geometrico prima del numero. | È sempre possibile scegliere una risposta e proseguire. |
| Controllo | Confermare la previsione. | Mostra +12, −10 e +2 m. Se previsione e misura differiscono invita a confrontare le superfici. Focus sul nuovo stato. | Un ritorno alla scelta o un reload della scheda conservano la tappa. |
| Trasferimento | Ricalcolare con 7 s di ritorno. | Un campo, unità esposta, riscontro sul segno e distinzione dai 26 m camminati. | Si può correggere e ricominciare. |

**Tassonomia.** Sessione contiene un indicatore ordinato e una sola attività. L’attività compone domanda, figura con nome accessibile, gruppo di scelte, indizio a scomparsa, riscontro e comando successivo. Stato selezionato visibile con radio e bordo. Una lettura assistita resta distinta dall’evidenza di lavoro autonomo nel modello proposto. [Schermata desktop](prove/passo-desktop.webp) · [Schermata mobile](prove/passo-mobile.webp) · [Controllo](prove/passo-controllo-mobile.webp)

## Campo

**Promessa e architettura di marca.** «Fai una previsione e misurala». Marchio per una famiglia di banchi, nominati per fenomeno, come «Banco del moto». Marchio compatto a traccia di oscilloscopio. Le grandezze, le unità e l’oggetto misurato identificano ogni esperienza. Il 3D ha un compito preciso: riferire la posizione finale al punto di partenza anche cambiando vista.

**Modello di navigazione.** In una versione estesa: cerca il fenomeno o entra dal paragrafo → apri il banco → fissa la previsione → misura → confronta → rientra nella lezione. Il prototipo inizia al banco. Sul desktop grafico e console sono affiancati, con la pista sotto. Tra 741 e 850 px il grafico precede una console a due colonne. A 740 px e meno la lettura segue un’unica colonna.

| Momento del viaggio | Compito e azione | Risposta dell’interfaccia | Stato d’errore o ripresa |
| --- | --- | --- | --- |
| Configurazione | Scegliere da 0 a 8 s di ritorno. | Range, tasti ±, valore espresso in secondi, grafico e tabella concordano. Zero secondi azzera l’area del ritorno. | Agli estremi il relativo pulsante è disabilitato. |
| Previsione | «Fissa la previsione» → prima, alla o dopo la partenza. | La posizione sulla pista resta a zero fino alla misura. | Un invio vuoto conserva durata e grafico. |
| Misura | «Misura la posizione». | Calcolo firmato, posizione, timeline manuale. La pista spaziale si apre a richiesta; tre viste si scelgono anche da tastiera. | Cambiare durata invalida previsione e conclusione precedenti. |
| Confronto | Spostare il cursore al secondo 4, poi alla fine. Provare 6 s di ritorno. | Il riferimento spaziale colloca il cursore a +12 m, poi a +2 m nel caso base. A 6 s finisce a 0 m. | Tabella e valori testuali restano utilizzabili. La nuova prova con 7 s chiede una risposta indipendente. |

**Tassonomia.** Banco contiene strumenti, rappresentazioni, previsione, misura e trasferimento. La console è un componente con etichetta, unità e limiti. Il cursore temporale e la camera sono controlli distinti. La camera modifica solo la proiezione. La pista del prototipo proietta coordinate 3D in SVG; nel prodotto esistono già WebGL e tavola 2D sincronizzati da riusare. [Schermata desktop](prove/campo-desktop.webp) · [Schermata mobile](prove/campo-mobile.webp) · [Pista spaziale](prove/campo-pista-desktop.webp)

## Margine

**Promessa e architettura di marca.** «Ritrova il primo passaggio da correggere». Marca editoriale con quaderni per disciplina, schede per attività e margini di revisione. Il marchio richiama la piega di un foglio. Titoli serif, unità e riferimenti a vista. La voce dell’autore distingue consegna, aiuto e fonte.

**Modello di navigazione.** In una versione estesa: quaderno → scheda con ID/revisione → lavoro su carta oppure nei campi → revisione → problema di trasferimento. Nel prototipo la doppia pagina allinea «Consegna» e «Il tuo quaderno». Sul telefono la consegna precede la trascrizione. La stampa produce una scheda con spazi per il conto, il controllo e l’ID.

| Momento del viaggio | Compito e azione | Risposta dell’interfaccia | Stato d’errore o ripresa |
| --- | --- | --- | --- |
| Preparazione | Aprire o stampare la consegna. | Il grafico e le grandezze rimangono disponibili su carta. «Leggi la fonte» apre il testo del quesito v2. | La digitazione diretta offre lo stesso obiettivo a chi non usa la penna. |
| Esecuzione | Trascrivere andata, ritorno e spostamento. | Campi etichettati in metri, virgola e segno meno tipografico accettati. | Il valore vuoto resta distinto da zero. |
| Revisione | Inviare `12, 10, 22`. | La prima incongruenza è il verso del ritorno. Il focus torna a quel campo e le altre righe restano disponibili. | Correggere −10 e +2, quindi riaprire la verifica. |
| Trasferimento | Affrontare il caso con 7 s. | Confronto esplicito tra distanza e posizione. Possibilità di ricominciare. | Il prototipo memorizza nella scheda solo stati e brevi valori numerici. |

**Tassonomia.** Quaderno → scheda → pagina di consegna e pagina di lavoro → riga con quantità, unità e messaggio → fonte versionata. La stampa ha una composizione dedicata. L’acquisizione da fotografia e il riconoscimento della grafia sono oggetto di fattibilità successiva. [Schermata desktop](prove/margine-desktop.webp) · [Schermata mobile](prove/margine-mobile.webp) · [Primo segno da rivedere](prove/margine-errore-mobile.webp)

## Token e specifiche di interazione

| Ruolo semantico | Passo | Campo | Margine |
| --- | --- | --- | --- |
| `ground / paper` | `#f8fbf8 / #fff` | `#101923 / #16212e` | `#faf6ed / #fefbf4` |
| `ink / muted` | `#0e3327 / #4c5651` | `#f1f5f7 / #c1ced7` | `#48283b / #604956` |
| `action / on-action` | `#104b38 / #fff` | `#f0ba56 / #171b21` | `#522a3f / #fff` |
| `plus / minus` | `#1a754c / #304d41` | `#79e0db / #f0ba56` | `#634455 / #93432e` |
| `focus / edge` | `#8d3800 / #728e80` | `#a1edff / #84949e` | `#155371 / #907681` |
| Tipo e geometria | Work Sans, progressione verticale, raggio 5 px. | Work Sans con cifre tabulari, scala misurabile e pannelli da strumento. | Baskervville per titolo, testo e consegna, Work Sans per controlli e riscontro. Piega centrale e rigatura in stampa. |
| Spaziatura e gerarchia | Misura di lettura centrale, una scelta primaria. | Grafico prima della console nella sequenza DOM. | Due superfici per leggere e scrivere, una colonna sul telefono. |

Token condivisi definiscono un margine fluido 18–48 px, bersagli primari di almeno 44 px, focus a 3 px e larghezza massima 1168 px. Lo stato numerico si legge anche da segni, unità e tratteggi opposti. Il testo continuo parte da 16 px. I titoli scalano fluidamente, con massimo di 52 px per i primi due concept e 68 px per la testata editoriale. I caratteri sono incorporati localmente con licenze OFL. [CSS dei token e dei componenti](prototipi/schermo.css) · [Brief delle tavole](riferimenti/brief.md)

Il passaggio di fase sposta il focus sul titolo del riscontro; un errore di compilazione lo riporta al controllo interessato. Gli stati vuoto, selezionato, aiuto, errore, misurato, corretto e ripresa hanno comportamento esplicito. I pulsanti hanno feedback di pressione e i dati cambiano su azione. Il prototipo non avvia un cronometro. Su telefono la tastiera completa consente di scrivere il segno meno anche quando il tastierino numerico della piattaforma lo omette.

## Requisiti di inclusione da accettare nella direzione scelta

| Bisogno dichiarabile senza diagnosi | Decisione di design | Test di accettazione |
| --- | --- | --- |
| Decodificare testo e simboli | Testo selezionabile, frasi brevi, unità accanto alla grandezza, parole e cifre alternate, definizione di «spostamento». | A 200% di testo e 320 CSS px nessuna perdita dell’azione o dei valori. Rileggere con VoiceOver/TalkBack in italiano. |
| Regolare attenzione e interruzioni | Nessuna scadenza imposta nella pratica, fenomeno mosso dalla persona, un feedback per volta, indizio richiesto. | Interrompere dopo un tentativo, riaprire la stessa scheda e ritrovare dato, tappa e risposta. |
| Alleggerire memoria di lavoro e pianificazione | Dati vicini alla domanda, progressione nominata, tabella al posto del grafico, numeri disponibili dopo la previsione. | Descrivere il prossimo gesto dopo un’interruzione; completare senza ricordare da un’altra pagina la durata. |
| Usare modalità diverse di azione | Tastiera, tocco, penna e trascrizione secondo preferenza. Pulsanti ± come alternativa al trascinamento. | Tab/Shift+Tab/Invio, controllo senza drag, ordine di lettura coerente, focus visibile e scoperto. |
| Percepire il fenomeno senza colore o profondità | Segni, tratteggi, assi con unità e nome testuale dell’SVG. La vista spaziale ha una posizione scritta sincronizzata. | Interpretare il caso con immagine disattivata e modalità ad alto contrasto. |
| Esercitare scelta | Scelta diretta di modalità, indizio e uscita. Nessun raggruppamento per DSA, ADHD o velocità di risposta. | Domandare che cosa aiuta e quando; offrire i controlli a tutti indipendentemente dal profilo. |

I riferimenti espliciti sono WCAG 2.2 AA, in particolare 1.1.1, 1.3.1, 1.4.1/3/4/10/11, 2.1.1, 2.4.3/7/11, 2.5.7/8, 3.3.1/2 e 4.1.3. L’obiettivo di 44 px per i comandi principali supera il minimo AA di 24 CSS px previsto da 2.5.8 fatte salve le relative eccezioni. La valutazione con utenti di tecnologie assistive e telefono fisico rimane aperta. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [CAST UDL 3.0](https://udlguidelines.cast.org/) · [W3C COGA](https://www.w3.org/TR/coga-usable/)
