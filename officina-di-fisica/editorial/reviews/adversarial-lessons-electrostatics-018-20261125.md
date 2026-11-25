# Controreview indipendente AI — lessons-electrostatics-018

Letti autonomamente i quattro originali **C4-L01..C4-L04** alla revisione `5d1dc8dc7b601aef959d10d564c75462be74708d` prima di confrontare il verificatore dell'integratore. Esaminati tutti i **27 blocchi**, formule, testo e didascalie, quattro SVG come XML e in anteprime individuali complete. Poi letti integralmente modulo, test e giudizi del lotto018. **Nessun finding scientifico concreto o blocco residuo** nell'ambito esaminato. Non ho modificato fonti, modulo/test/report dell'integratore, candidati, asset, registro o checkpoint.

Questa nota è una seconda lettura AI distinta dal revisore del primo report; non è approvazione umana, pubblicazione o calibrazione su studenti. Non trasforma i controlli numerici costruiti in richieste che il materiale non contiene.

## C4-L01 — cariche e forza

Fonte e ipotesi adeguate: cariche puntiformi ferme nel vuoto, oggetti piccoli rispetto alla distanza, r>0, forza lungo la congiungente. Il modulo usa il valore assoluto del prodotto; attrazione/repulsione segue i segni. Le due forze sono su corpi distinti, uguali e opposte in elettrostatica. La conservazione della carica è algebrica e l'elettrizzazione ordinaria trasferisce elettroni senza modificare i nuclei.

Controllati indipendentemente il gradiente negativo dell'energia kq1q2/r e il fattore quattro dimezzando r. Il probe dell'integratore usa esplicitamente k assegnato9·10^9, diverso dalla costante tabulata sorgente≈8,99·10^9: per2µC,3µC e30cm il primo dà3/5N, il secondo899/1500N. Lo scarto è1/1500N. Non c'è falsa identità: sono coefficienti diversi in una prova del revisore, non un calcolo imposto dalla lezione o un risultato della fonte. Il valore approssimato di e è distinto da quello SI esatto nei controlli.

Figura `C4-coulomb.svg`: carica positiva sinistra e negativa destra; entrambe le frecce sono rivolte verso l'altra carica, aste uguali106px, quote fra i centri e punte presenti. Nessuna forza viene cancellata nel diagramma di un singolo corpo e nessuna lunghezza è convertita in newton senza scala.

## C4-L02 — campo, segno e moto

La prova positiva è dichiarata piccola, con perturbazione trascurabile. Il verso di E è quello della forza su prova positiva; q negativa inverte la forza. Il versore radiale va dalla sorgente all'osservazione, perciò q sorgente negativa inverte il campo. Sovrapposizione vettoriale e componenti non sono confuse con somma dei moduli. La condizione di campo non nullo qualifica correttamente il divieto d'incrocio delle linee.

Ho ricontrollato gli avversi: due sorgenti positive uguali a distanze opposte hanno E nullo al punto medio ma V non nullo; sorgenti opposte hanno invece V nullo e campi concordi. Questi esempi impediscono di trasferire la regola scalare del potenziale al campo. Il probe−2µC in4N/C dà−8µN; diviso2mg=2·10^-6kg dà−4m/s², senza errore fra milligrammi e grammi.

Il moto richiede campo uniforme, altre forze trascurabili e regime non relativistico, tutti presenti. La parabola richiede velocità trasversale non nulla: il verificatore conserva questa condizione nell'eliminazione del tempo. La componente perpendicolare resta uniforme. Figura `C4-campo.svg`: piastre+ a sinistra/− a destra, E a destra e forza sulla carica negativa a sinistra. Etichette e punte non sono ambigue.

## C4-L03 — potenziale ed energia

La sorgente definisce prima DeltaV=VB−VA, poi DeltaU=qDeltaV e lavoro del campo=−DeltaU. Il riferimento comune può essere traslato senza cambiare DeltaV. Potenziale scalare con segni conservati, coppie d'energia contate una sola volta e moto governato da sola forza elettrica sono qualificati correttamente. DeltaV=−E·Deltar è limitato al campo uniforme.

Indipendentemente ho assemblato tre cariche alle coordinate0,r,2r sommando solo coppie i<j. La somma coincide con metà della somma qiVi **escludendo il potenziale proprio**: il verificatore lo fa correttamente, senza autoenergia singolare o doppio conteggio. Per una carica positiva3µC che attraversa−20V, DeltaU=−60µJ e DeltaK=+60µJ; q negativa cambia il segno. Cambiare entrambi i potenziali della stessa costante lascia invariato il risultato.

Figura `C4-potenziale.svg`: quattro equipotenziali a distanza grafica114px, valori60,40,20,0V. Il gradiente è costante e negativo verso destra, E verso destra e perpendicolare alle linee. Il passo di−20V è un dato effettivo della figura; non si ricava però N/C fisico dai pixel senza lunghezza in metri.

## C4-L04 — conduttore, induzione e dielettrico

Le precisazioni che avrebbero potuto invalidare il modello sono presenti: campo nullo nel **materiale conduttore all'equilibrio elettrostatico**, non in ogni cavità; potenziale uniforme per materiale collegato in equilibrio, non per un filo resistivo percorso da corrente. Il riferimento al filo con corrente continua riconosce correttamente la possibile caduta di potenziale. Conduttore isolato e collegamento a terra sono condizioni diverse: la carica totale si conserva solo nel primo caso privo di scambi.

La riduzione dielettrica è limitata a piastre e **carica libera fissata**, non a tensione fissata. Ricontrollato con er=2,3,4,7: a Q fissata E passa a E0/er. A V fissata e distanza costante E=V/d rimane invece uguale, mentre cambia la carica necessaria;6V su2cm danno300V/m qualunque sia er nel modello uniforme. Il probe resistivo2ohm·3A/2m dà3V/m e non contraddice l'equilibrio elettrostatico, perché non è quel regime.

Figura `C4-materiali.svg`: tre segni− a sinistra e tre+ a destra del conduttore, campo applicato verso destra; campo indotto verso sinistra, E interno nullo. Sei dipoli legati nel dielettrico, ciascuno− a sinistra/+ a destra; entrambi i campioni restano neutri. Non si assegna una neutralità locale uniforme al conduttore né si fanno migrare cariche legate fino all'esterno.

## Codice, prove e limiti

I quattro hash sorgente e quelli degli asset coincidono con Git e con i pin letti. Il verificatore richiede lezioni presenti, interi record immutabili e riferimenti/byte degli asset esatti. Controlla sia lista matematica non vuota sia tutti gli esiti positivi, evitando il PASS da `all([])`. I test esercitano mutazioni di testo, assenza di fonte e figura, byte alterati, controlli matematici vuoti/falliti, geometria dei disegni e40 esempi razionali indipendenti. Ho rieseguito **5/5 test PASS, exit0,4,132s**; nessun risultato con studenti o pubblicazione creato.

La review numerica non è una dimostrazione formale automatica di ogni frase naturale: il dominio è coperto dalla lettura integrale e dalle controprove esplicite. Gli hash congelano l'edizione letta; cambi di fonte o verificatore richiedono nuova evidenza. Questa seconda lettura corrobora il giudizio4PASS originale entro l'ambito dichiarato, senza sostituire una decisione umana di pubblicazione.

SHA256 esatti al momento della lettura:

- Modulo dell'integratore: `c3540bf90360529d6e9dc59c1b67499b62ef7970dcc4ecf05fda8a128afbb898`.
- Test dell'integratore: `9cc716e85bddf6dc33c250e6cd1af36bf8cabe1d05cdca68fb043527a319b1ee`.
- Entrambi i report018: `f918a75fc2d9d91d1fce19ef46272a387b59e0ac803465e71d7efaf23cead2b8`.
- Nota individuale del primo revisore: `03c6b854fda510a1d562958592556448269a5ece244b115716d6979a79b5c502`.
- File fonteC4.json: `19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c`.

Nessun nuovo file di scienza o test dell'integratore è stato modificato dal controrevisore; soltanto questa nota è stata aggiunta.
