# Didattica adattiva e assistenza multimodale

## Una competenza osservabile

L’obiettivo è «dato un grafico velocità-tempo a tratti costanti, prevedere la posizione finale relativa alla partenza e giustificare il segno in metri». Un risultato numerico, una giustificazione e un trasferimento si possono osservare separatamente. Il prerequisito locale è distinguere durata, velocità con segno e verso. La prova formativa espone la strategia al docente e dà alla persona un prossimo gesto concreto. [Fonte C1-Q027 v2](../../../../officina-di-fisica/content/C1.json) · [Constructive alignment, Biggs](https://doi.org/10.1007/BF00138871)

| Evidenza | Interpretazione limitata | Feedback o sequenza proposta |
| --- | --- | --- |
| Nessun tentativo o risposta omessa | Evidenza insufficiente | Scegli figura, tabella o testo; il tentativo può essere ripreso. |
| Scelta della posizione prima del calcolo | Ipotesi iniziale, potenzialmente casuale | Conservare previsione e confrontarla con +12 m e −10 m. |
| Risposta 22 m | Nel caso specifico il numero coincide con la distanza totale | Chiedere quale area è sotto l’asse. Consentire di verificare il verso del secondo contributo. |
| +2 m dopo un indizio | Risoluzione assistita documentabile | Una nuova occasione indipendente prepara un’evidenza più informativa. |
| −2 m sul caso a 7 s | Trasferimento vicino nello stesso tipo di moto | Chiedere il segno quando un grafico triangolare sostituisce un rettangolo. Una famiglia diversa richiede controllo editoriale. |
| Spiegazione su un caso nuovo a distanza di giorni | Evidenza differita | Registrare famiglia, aiuto, esito e revisione. Offrire una nuova occasione o un prerequisito mirato. |

## Progressione e tracciamento

Il motore esistente verifica che il grafo delle lezioni sia aciclico e che i nodi richiesti esistano. Un lotto che introduce un ciclo viene rifiutato. L’osservazione si aggrega oggi sulla competenza/lezione. Entro la finestra degli ultimi cinque problemi di famiglie distinte, il tentativo autonomo più recente di ciascuna famiglia prevale. Due famiglie fallite portano a «da consolidare». Almeno tre corrette e almeno il 75% di successi portano a «risultati stabili». Gli aiuti rimangono contati separatamente. La data proposta per riprovare è a 7 giorni se stabile, 3 in presenza di successo senza errori, altrimenti 1. Il motore può suggerire prerequisito, esempio, laboratorio o altra pratica e restituisce una motivazione. La finestra è una regola editoriale da calibrare. [Traccia osservabile](../../../../officina-di-fisica/server/domain/assessment.py) · [Grafo e sequenza](../../../../officina-di-fisica/server/domain/pathway.py)

Per la direzione selezionata, mantenere il tracciamento comprensibile. Mostrare «tre famiglie risolte in autonomia» e lasciare sempre l’indice accessibile. Non aumentare la padronanza per tempo sullo schermo, numero di rotazioni della camera o fiducia auto-riferita. Il laboratorio contribuisce con risposte verificabili. Quando errore e aiuto cadono nella stessa famiglia, la pratica guidata conserva il proprio carattere. Un grafo più fine distinguerebbe abilità oggi contenute nella stessa lezione; ogni nuovo arco va motivato dall’autore e verificato su un campione di esercizi.

**Esempio di sequenza.** Dalla misura +2 m si passa a un problema con 7 s di ritorno. Chi ottiene 26 m può estrarre la coppia +12/−14 usando un indizio. L’esito assistito lascia aperta una prova automatica su una famiglia diversa. Chi spiega in autonomia il segno può programmare il richiamo oppure continuare sul grafico successivo. Nell’eventuale richiamo a sette giorni si chiede prima di ricostruire il criterio, poi si riapre la fonte. I prototipi attivano il trasferimento immediato; calendari, notifiche e aggiornamenti dello storico richiedono una PR successiva.

La letteratura su retrieval e spaziatura motiva un richiamo a distanza. L’intervallo va confrontato con obiettivo e tempo alla verifica. Il modello probabilistico di Corbett e Anderson può essere un comparatore sperimentale solo dopo calibrazione su dati appropriati, separazione per studente fra training e test e confronto con la regola interpretabile. Misure candidate sono Brier score, curva di calibrazione, tasso di falsi «stabili» e ritenzione a 7 giorni. L’esperienza di programmazione studiata nel lavoro originale è diversa da un corso italiano di fisica. [Karpicke e Roediger](https://learninglab.psych.purdue.edu/downloads/2007/2007_Karpicke_Roediger_JML.pdf) · [Cepeda et al.](https://digitalcommons.usf.edu/psy_facpub/1766/) · [Corbett e Anderson](https://doi.org/10.1007/BF01099821)

## Dal caso al fenomeno

Per `0 ≤ t ≤ 4` la posizione vale `3t` metri. Per `4 < t ≤ 4 + d` vale `12 − 2(t − 4)` metri, con durata del ritorno `d` fra 0 e 8 s. All’inversione istantanea idealizzata la posizione è continua. La distanza totale vale `12 + 2d` m, lo spostamento `12 − 2d` m. A `d = 0, 5, 6, 7, 8` gli esiti sono `+12, +2, 0, −2, −4` m. Le unità derivano da `m/s × s = m`. Le due aree si distinguono anche per tratteggio e segno. La timeline controlla il tempo fisico. La camera modifica la proiezione dello stesso punto. Il test integra il cammino mezzo secondo alla volta con un calcolo separato e confronta ogni posizione e distanza. [Modello](prototipi/moto.js) · [Verifica numerica e browser](verifica/collaudo.mjs)

## Tre usi possibili dell’AI

| Concept | Input scelto dalla persona | Possibile orchestrazione editoriale | Fallback che già si può provare |
| --- | --- | --- | --- |
| Passo | Errore e richiesta di indizio | Autore seleziona oggetto pubblicato → recupero di un passaggio → proposta di domanda graduata → controllo del riferimento → approvazione. | Indizio scritto e riscontro deterministico. |
| Campo | Dato, intervallo e rappresentazione desiderata | Un agente di proposta seleziona un modello installato. Un verificatore indipendente esegue dominio, dimensioni ed estremi. La bozza conserva parametri, versione e risultato atteso. | Il modello locale genera grafico, tabella, timeline e vista spaziale. |
| Margine | Numeri trascritti; in una futura prova il solo ritaglio scelto del foglio | Eventuale OCR locale → mostra la trascrizione modificabile → conferma umana → normalizzazione delle unità → suggerimento legato alla fonte. Un segno incerto torna a chi scrive. | Stampa, campi modificabili, controllo della prima riga incongruente e fonte aperta. |

L’orchestrazione è una macchina a stati proposta: selezione dello scopo → ricerca → lettura della versione esatta → proposta strutturata → verifica → revisione umana → eventuale pubblicazione con un atto separato. Un solo coordinatore può chiamare strumenti di lettura. Il verificatore è codice e l’ultimo passaggio usa il flusso autore esistente. Non occorrono tre servizi né agenti in autonomia permanente. Già oggi la ricerca editoriale lavora con parole, alias e prerequisiti su estratti di lezioni approvate. Il catalogo studente è separato: l’indice editoriale suggerisce una possibilità di riuso del lessico, con corpus e autorizzazioni specifici. [Workspace editoriale](../../../../officina-di-fisica/server/editorial/service.py) · [Schema delle proposte](../../../../officina-di-fisica/contracts/proposal-v1.schema.json)

| Contratto candidato | Input / output | Limite ed esito di errore |
| --- | --- | --- |
| Lettura di una fonte | ID, revisione, indice del passaggio → testo e riferimento | Permesso sul corso; se la revisione cambia, riaprire e riesaminare. L’API editoriale attuale copre lezioni, l’estensione ai quesiti richiede un contratto esplicito. |
| Scene scientifiche controllate | ID e digest di un motore approvato, parametri ammessi → campioni con unità, geometrie e etichette | Parametri fuori dominio, unità incompatibili o risultato discordante bloccano la proposta. Vietare codice arbitrario generato all’interno della scena. |
| Trascrizione facoltativa | Ritaglio scelto → tre quantità con segno, unità, regioni dubbie | Se incerto, richiedere conferma per quella riga. Foto e testo libero fuori da log e corpus. Input manuale sempre presente. |
| Proposta editoriale | Passaggio, strategia, fonte versione → bozza circoscritta | Nessun diritto di scrittura dell’assistente sul pubblicato. Budget esaurito, timeout o provider indisponibile restituiscono il percorso deterministico. |

Gli adapter locali e cloud esistono già per l’autore. Un provider esterno dovrebbe ricevere solo i passaggi pubblicabili scelti e un contratto strutturato. Il modello non decide punteggi, padronanza, accessi o diagnosi. Prima di valutare un servizio online con scrittura manuale servono una scelta specifica su trattamento, conservazione e consenso. In questa consegna i tre prototipi eseguono calcolo e feedback locali e nessun modello remoto riceve risposte degli studenti. [Adapter dei provider](../../../../officina-di-fisica/server/adapters/providers.py) · [MCP e strumenti](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
