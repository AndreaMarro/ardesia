# Quale problema vale la pena risolvere?

Analisi del 23 novembre 2026. La domanda di acquisto e la disponibilità a pagare restano aperte. Il committente ha detto «non le trovo» a proposito delle simulazioni e ha chiesto un laboratorio per ogni voce. È un segnale diretto sulla reperibilità. Un solo segnale, anche ripetuto, non stima la frequenza del problema nella popolazione.

## Metodo ed evidenze

| Tipo | Origine | Cosa autorizza a concludere |
| --- | --- | --- |
| Osservazione diretta | Walkthrough nel browser dell’app sul Mac, da home a C1, al catalogo e alle sei voci di «Leggere il movimento nel tempo». Replica automatica con archivio temporaneo, desktop e smartphone emulato. | Disponibilità e denominazione dei controlli, passaggi, esiti delle ricerche, comportamento ospite. |
| Documento di prodotto | Sorgenti e prove della 1.1.0, compresi storico delle revisioni, esempi, contratti e collaudo di 181 banchi. | Capacità riutilizzabili e relativi confini. |
| Valutazione esperta | Euristiche di Nielsen, classificazione locale della gravità, COGA, confronto visivo con Taste Skill. | Priorità di indagine. Un difetto cromatico secondo una skill è un giudizio di stile. |
| Benchmark documentale | Manuali pubblici dei produttori. | Capacità che i produttori descrivono. Prestazioni comparative, prezzi e risultati degli studenti richiedono misure apposite. |
| Ipotesi | Jobs, stime di costo, punteggi, effetti di ritenzione, riconoscibilità dei nomi. | Previsioni da smentire con il protocollo di scelta. Partecipanti osservati in questa iterazione: **0**. |

[Percorsi e ricerche misurati](prove/navigazione.json) · [Revisione canonica](../../../../officina-di-fisica/docs/architettura/README.md) · [Euristiche di Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) · [Indicazioni cognitive W3C](https://www.w3.org/TR/coga-usable/)

## Architettura dell’informazione e walkthrough

| Intento in parole dello studente | Percorso esistente | Attrito verificabile | Conseguenza da provare |
| --- | --- | --- | --- |
| «Voglio studiare tutto» | Home → C1 → Inizia dalle lezioni | In C1 due titoli descrivono chiaramente studio completo e preparazione rapida. A 390 × 844 il bordo inferiore del comando per le lezioni cade a 557 px e quello per gli esercizi prioritari a 868 px. Il secondo richiede un breve scorrimento per essere visto per intero. | Conservare l’autonomia di scegliere l’indice anche in un percorso guidato. |
| «Voglio capire perché 22 m è sbagliato» | C1 → esercizi prioritari → Aree di segno opposto → prova → correzione per passaggi | Il testo distingue distanza e spostamento e le quattro figure spiegano i segni. Per arrivarci occorre riconoscere prima la famiglia del problema. | Verificare se un ingresso dal proprio errore riduce i tentativi di navigazione. |
| «Voglio vedere che cosa succede» | Home → C1 → Simulazioni 3D di C1 → Leggere il movimento nel tempo → Grafici cinematici | Il catalogo C1 dichiara 42 simulazioni in 10 lezioni. La ricerca `aree con segno` dà zero, `grafici cinematici` dà uno, `spostamento` dà due risultati. La ricerca filtra titoli, sintesi e riferimenti già presenti. | Un alias editoriale e un collegamento dal feedback sono due ipotesi distinte da testare. |
| «Posso provare questo banco?» | Dall’indice pubblico aprire la voce `SIM-C1-L003-06` come ospite | La voce è elencata. L’API del materiale richiede l’accesso al percorso. La home ha anche un esperimento dimostrativo direttamente utilizzabile. | Rendere comprensibile **prima** dell’apertura il tipo di accesso. Misurare la comprensione distintamente dal diritto di accesso. |
| «Posso trasferire ciò che ho scritto?» | C6 → fascicoli e correzioni, oppure lezione → quaderno digitale | Il prodotto distribuisce fascicoli e conserva i tentativi digitali. Nel percorso esaminato manca un comando che attribuisca il segno sbagliato a una specifica riga trascritta del proprio foglio. | Provare una correzione della prima riga incoerente, conservando il lavoro intermedio. |

Tra home e catalogo, «Simulazioni» può riferirsi a una prova d’esame oppure a un fenomeno. L’aggiunta di «3D», «d’esame» o del fenomeno aiuta nei punti di scelta. In C2 e C6 l’avvio presenta tre categorie, mentre C1 usa due itinerari e un accesso trasversale al metodo. La copertura dei contenuti è già ampia. Il problema prodotto è stabilire quale indizio consenta alla persona di scegliere l’oggetto giusto. [Navigazione corrente](../../../../officina-di-fisica/static/js/app.js) · [Indice e ricerca](../../../../officina-di-fisica/static/js/banchi/catalogo.js) · [Schermate della baseline](verifica.md)

## Valutazione euristica

Scala di gravità locale: 0 forza da proteggere, 1 attrito reversibile, 2 rallentamento plausibile, 3 arresto osservato del cammino indicato. La colonna «riscontro» identifica esattamente cosa è successo. La frequenza sul campo è sconosciuta.

| Principio | Gravità | Riscontro | Evidenza di decisione da raccogliere |
| --- | ---: | --- | --- |
| Corrispondenza con il linguaggio della persona | 3 | Usare la frase della consegna `aree con segno` arresta la ricerca del banco C1. | Trovare il fenomeno con parole proprie in ≤30 s. Registrare lessico e falsi positivi. |
| Visibilità dello stato | 2 | Il catalogo permette di scegliere la voce prima che emerga il requisito di accesso. | Prima del clic, prevedere correttamente cosa si aprirà in 8 prove su 10. |
| Coerenza e riconoscimento | 2 | Lab, banco, simulazione e simulazione d’esame ricorrono nella stessa esperienza. | Card sort aperto e tree test su «provare una legge» e «fare una prova a tempo». |
| Controllo e libertà | 0 | La persona può scegliere studio/esame e leggere la soluzione tutta insieme o per passaggi. | Riprendere senza perdere punto o grafico al ritorno dal banco. |
| Prevenzione e recupero dall’errore | 0/2 | In Q027 è disponibile la spiegazione del 22. Nel catalogo una ricerca vuota propone un altro termine senza suggerire «grafici cinematici». | Dal risultato vuoto al banco corretto in una scelta. |
| Carico visivo e gerarchia | 1 | Nel C1 di riferimento Taste misura un titolo di 81 px sul desktop e spazi ridotti sui bordi del telefono. | Prima scelta comprensibile a 320 px, 200% testo e con lettura sequenziale. |
| Flessibilità d’uso | 0 | Le misure hanno unità, testo e tavola 2D in alternativa al WebGL. | Ripetere lo stesso confronto con il solo testo e da tastiera. |
| Aiuto nel contesto | 2 | Il passo successivo è già calcolato sulla competenza, ma l’ingresso principale si organizza per corso o tipo di attività. | Chiedere «perché proprio questo esercizio?» dopo un’interruzione. |

Cric è riconoscibile sulla copertina e il suo controllo cambia posa. Il walkthrough distingue questa interazione dalla dimostrazione scientifica che si apre con «Prova un esperimento». Le proposte esplorano segni autonomi. Nel test di marca si può presentare separatamente la firma «Officina di Fisica» con e senza Cric e misurare attribuzione e comprensione del comando.

## Tre lavori, tre proposte di valore

| Concept | Quando → progresso desiderato | Frizione / risultato atteso | Meccanismo di valore | Chi potrebbe sceglierlo e perché potrebbe abbandonarlo |
| --- | --- | --- | --- | --- |
| **Passo** | Dopo una risposta incerta, ritrovare il prossimo passo e completarlo con poco tempo. | Timore di perdersi nell’indice. Voglio sapere dove ho cambiato idea e potermi fermare. | Previsione in parole, aiuto a richiesta, spiegazione e nuova domanda con un dato diverso. | Studio individuale pre-esame. Chi desidera esplorare potrebbe percepire la sequenza come prescrittiva. |
| **Campo** | Quando formula e grafico dicono poco, modificare una condizione e osservare un esito spiegabile. | Il gesto sull’oggetto deve corrispondere a una misura leggibile e a un’unità. | Previsione fissata, durata variabile, misura, pista spaziale e tabella sullo stesso stato. | Studente o docente che lavora su un fenomeno. Troppe viste simultanee o controlli piccoli scoraggerebbero l’uso. |
| **Margine** | Dopo un conto sul foglio, scoprire la prima riga da rivedere e conservare il proprio ragionamento. | Ricopiare tutto costa tempo. Voglio un riscontro controllabile con la fonte aperta accanto. | Scheda stampabile, trascrizione di tre quantità, feedback sulla prima incoerenza, trasferimento. | Ripasso su carta e correzione con un docente. Chi usa soltanto il telefono può ritenere la trascrizione superflua. |

Le ipotesi coprono aspetti funzionali, emotivi e sociali. Avere una risposta da mostrare al docente, scegliere di riprovare in privato e ritrovare un punto di interruzione sono esiti diversi. Per rilevarli si chiede di raccontare un episodio recente con materiali reali, prima di mostrare i prototipi. [Jobs to Be Done](https://www.christenseninstitute.org/theory/jobs-to-be-done/) · [Value Proposition Canvas](https://www.strategyzer.com/library/the-value-proposition-canvas)

## Posizionamento e alternative concrete

| Alternativa | Che cosa offre secondo il produttore | Dove compete | Ipotesi di differenziazione / prova che può smentirla |
| --- | --- | --- | --- |
| Khan Academy | Nel nuovo ambiente di classe le Unit Missions rendono visibili le abilità da portare a livello proficient. L’esperienza individuale classica può differire. | Guida e progressione di Passo. | Il recupero in italiano su una famiglia d’errore della prova locale deve aiutare ad agire entro 30 s. Se gli studenti preferiscono una normale lista di esercizi, il vantaggio si riduce. [Khan Academy](https://support.khanacademy.org/hc/en-us/articles/47216131257997-Why-don-t-I-see-Course-Mastery-in-the-reimagined-Khan-Academy-experience) |
| PhET | The Moving Man collega posizione, velocità e accelerazione in una simulazione del moto. PhET documenta separatamente il proprio lavoro sull’inclusione. | Manipolazione di Campo. | Accedere allo specifico paragrafo, registrare previsione e spiegare il segno su un dato nuovo. Una buona simulazione esiste già: un semplice carrello animato avrebbe poca differenziazione. [PhET](https://phet.colorado.edu/en/simulations/moving-man) · [Inclusive design](https://phet.colorado.edu/en/inclusive-design) |
| Brilliant | Interazioni con input matematici e oggetti manipolabili all’interno dei problemi. | Ciclo breve di Passo e verifica attiva di Campo. | Riportare la stessa evidenza in laboratorio, quesito e fascicolo revisionati. Verificare se gli utenti attraversano davvero i formati. [Brilliant](https://brilliant.org/help/features/how-do-i-use-interactives-on-brilliant/) |
| Gemini Notebook di Google, documentazione già associata a NotebookLM | La chat consente di usare fonti selezionate e seguire le citazioni. | Lavoro su fonti e assistenza multimodale di Margine. | Isolare deterministicamente la prima riga errata e citarne la revisione. Misurare la correzione indipendente del problema successivo. [Google](https://support.google.com/gemininotebook/answer/16179559) |
| Foglio, penna e docente | Alternativa d’uso da osservare con chi ripassa su carta. | Margine e costo opportunità di tutti e tre i prodotti. | Misurare tempo di trascrizione, spiegazione del segno e preferenza di riuso rispetto alla stessa scheda da sola. |

Il posizionamento proposto per Campo è un banco di fisica per chi prepara un esame e vuole mettere alla prova un’idea prima di leggere la correzione. Per Passo il prodotto acquistato è una sessione di recupero. Per Margine è un quaderno correggibile con criteri esposti. La combinazione tra catalogo italiano versionato, verifica numerica e possibilità di risalire alla voce di lezione offre una base concreta per la differenziazione. La willingness-to-pay e la preferenza di marca richiedono osservazione diretta.
