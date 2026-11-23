# Decisione proposta e condizioni per cambiarla

**Portare Campo alla prima prova con studenti.** È la direzione che valorizza meglio il patrimonio già costruito: la persona può formulare una previsione, vedere il fenomeno associato alla voce di lezione e controllare la propria spiegazione. Il catalogo dispone già di 181 esperienze, e il walkthrough ha riprodotto l’insuccesso di una ricerca pertinente. La proposta più piccola da validare in seguito è un ingresso da C1-Q027 al banco adatto, con le parole dello studente e il tipo di accesso visibile. Non è stata scelta una nuova identità per il prodotto.

Passo è l’alternativa più forte quando lo scopo primario è recuperare dopo un errore con poche scelte. Margine diventa la candidata da provare per prima in un contesto in cui il docente corregge regolarmente svolgimenti cartacei. Il suo vantaggio dipende dalla frequenza di quella pratica e dal costo reale della trascrizione. La raccomandazione si riferisce a quale ipotesi testare, prima di commissionare un’estensione al catalogo.

## Matrice decisionale

Scala da 1 a 5. **I punteggi sono giudizi previsionali**. I controlli software, il percorso ospite e i calcoli economici documentati sono gli elementi osservabili che li informano. Una prova automatica non misura comprensione, preferenza o carico mentale. Il totale è `Σ(peso × voto) / 100`. I pesi assegnano centralità all’apprendimento tramite laboratorio, coerentemente con la richiesta espressa sui banchi per voce.

| Criterio | Peso | Passo | Campo | Margine | Misura che può sostituire il giudizio |
| --- | ---: | ---: | ---: | ---: | --- |
| Usabilità | 13 | 5 | 4 | 4 | % che completa avvio, correzione e trasferimento senza aiuto del moderatore; tempo mediano al primo gesto corretto. |
| Accessibilità cognitiva | 17 | 5 | 4 | 4 | % che ritrova la tappa e sa spiegare il passo successivo dopo interruzione; richieste di aiuto e sforzo percepito 1–7. |
| Efficacia pedagogica | 23 | 4 | 5 | 4 | % di risposte corrette **con spiegazione del segno**, su un caso nuovo a 7 giorni; controllo del livello di entrata. |
| Riconoscibilità visiva | 14 | 3 | 5 | 5 | % che riassocia alla direzione corretta una schermata con nome e marchio coperti dopo un distrattore. |
| Fattibilità tecnica | 11 | 5 | 4 | 4 | Giornate effettive per la prima verticale, dipendenze nuovi servizi e bug bloccanti in test d’integrazione. |
| Manutenibilità | 7 | 5 | 4 | 4 | Tempo per correggere unità/testo, numero di fonti autorevoli da aggiornare e regressioni introdotte. |
| Estensibilità | 10 | 4 | 5 | 3 | Seconda attività in un’altra area, numero di modifiche al core, giornate e riuso del contratto esistente. |
| Economia unitaria | 5 | 5 | 4 | 3 | Euro per sessione arrivata alla risposta di trasferimento: scenario di 100 attività e 10.000 avvii. |
| **Totale pesato** | **100** | **4,39** | **4,47** | **3,99** | La distanza Campo–Passo è **0,08/5**. |

**Motivazione dei voti.** Passo ha un’azione dominante, un indice di tre tappe e usa la strategia di recupero già esposta. Per questo ci aspettiamo buona ripresa e basso costo di manutenzione. La sequenza è anche facile da confondere con altri strumenti di pratica. Campo lega una sola variazione fisica a più viste con una verifica numerica ripetibile. Aumentano i controlli da comprendere e i casi limite da collaudare. Il suo vantaggio didattico è ancora un’ipotesi. Margine ha una forma riconoscibile e individua la prima riga incongruente. La scheda con tre quantità si estende con meno immediatezza a problemi qualitativi o geometrici. La stampa introduce un ulteriore ambiente di test. [Prove tecniche](verifica.md) · [Ipotesi economiche](fattibilita.md)

### Come misurare i voti

Per le percentuali di successo e di riconoscimento usare 1/2/3/4/5 per `<50 / 50–64 / 65–74 / 75–89 / ≥90%`. Per l’efficacia valutare anche il divario rispetto alla baseline con intervallo d’incertezza e difficoltà equivalente. Per la fattibilità, i livelli 5/4/3/2/1 corrispondono a `≤2 / ≤4 / ≤7 / ≤12 / >12` giornate per una verticale completa. Per manutenzione, una correzione revisionata che richiede `≤0,5 / ≤1 / ≤2 / ≤4 / >4` giornate vale 5/4/3/2/1. Per estensione il livello 5 richiede un nuovo argomento, nessuna modifica al core e ≤2 giornate; il livello 4 consente ≤4 giornate senza modifica; il 3 un’aggiunta compatibile al contratto; il 2 tocca due confini esistenti; l’1 implica rottura di compatibilità. Per economia i tagli superiori sono 0,20/0,36/0,50/1,00 €/esito, dal 5 al 2. Tutte queste soglie sono convenzioni decisionali da concordare prima della raccolta.

### Sensibilità alle priorità

| Scenario | Pesi nello stesso ordine della matrice | Passo | Campo | Margine |
| --- | --- | ---: | ---: | ---: |
| Priorità al laboratorio | 13/17/23/14/11/7/10/5 | 4,39 | **4,47** | 3,99 |
| Priorità al recupero e alla ripresa | 22/25/16/5/12/8/6/6 | **4,68** | 4,27 | 3,93 |
| Priorità alla riconoscibilità | 12/15/17/24/7/8/8/9 | 4,27 | **4,49** | 4,07 |

Se l’efficacia di Campo passa da 5 a 4 a pesi iniziali invariati, il totale scende a 4,24 e Passo va in testa. La prossima decisione dipende più dal trasferimento realmente osservato che dal decimale del punteggio. Se la carta è un requisito essenziale del contesto, va trattata come criterio di ammissibilità e va avviato un confronto Margine/scheda cartacea sul campo. [Dati e scenari](verifica/matrice.json) · [Calcolo ripetibile](verifica/decisione.py)

## Protocollo di validazione prima dell’adozione

Nel confronto successivo sono stati ripercorsi sei momenti uguali per le tre direzioni. I rilievi sulla pista, sul grafico da 5 s e sulla ripresa dell’errore precisano la raccomandazione per il prossimo incremento. [Revisione annotata](revisione/README.md)

1. **Discovery.** Proponiamo 6–8 colloqui con studenti che usano almeno due modalità tra carta, piattaforme e simulazioni, più 2 docenti che osservano il lavoro intermedio. Chiedere l’ultimo episodio concreto, cosa hanno cercato, quale alternativa hanno scelto e cosa è rimasto sul foglio. Raccogliere bisogni d’uso volontari; conservare verbali pseudonimi e aggregare le conclusioni.
2. **Findability.** Pilot di 12 persone con sei ordini bilanciati dei tre concept. Far trovare il banco partendo dal nome del problema, leggere il grafico e riprendere dopo una breve distrazione scelta con la persona. Usare casi isomorfi equivalenti assegnati a rotazione per evitare di insegnare la risposta attraverso l’ordine. Separare accesso ospite e accesso abilitato. Registrare denominatore, rinunce e aiuti. Obiettivi iniziali: almeno 10/12 trovano il banco entro 30 s e almeno 10/12 sanno riprendere senza intervento.
3. **Trasferimento.** Rubrica da 0 a 2: 0 se il segno resta errato, 1 per numero corretto senza spiegazione, 2 per esito e spiegazione delle aree corretti. Due valutatori correggono indipendentemente un campione e riconciliano i disaccordi. Dopo il pilot, confrontare la candidata con la versione canonica in gruppi distinti con pretest, dose equivalente e verifica immediata e a 7 giorni. Fissare prima la differenza di interesse (proposta 10 punti percentuali), stimare il campione dal tasso baseline e riportare intervalli e abbandoni. Il pilot qualitativo orienta la revisione; la stima dell’effetto richiede il confronto dimensionato.
4. **Inclusione e marca.** Proporre tastiera, lettura sequenziale e testo ingrandito a chi li usa tutti i giorni. Osservare con consenso una postazione reale e lo smartphone quando disponibile. Verificare la comprensione delle alternative alla scena e del segno senza colore. Per la marca nascondere il nome e ripetere il riconoscimento dopo un compito distrattore.
5. **Decisione.** Scegliere una verticale quando il percorso essenziale si completa senza blocchi di accessibilità, la scoperta del banco raggiunge la soglia concordata e la spiegazione sul caso nuovo è almeno comparabile alla baseline. Privilegiare Passo se la prova smentisce il vantaggio didattico ipotizzato per Campo o se il mandato privilegia il recupero rapido. Rivalutare costi e disposizione a pagare su un’offerta reale prima di estendere o prezzare la direzione.

Il dossier termina alla decisione su quale esperimento autorizzare. [Roadmap per PR atomiche](fattibilita.md)
