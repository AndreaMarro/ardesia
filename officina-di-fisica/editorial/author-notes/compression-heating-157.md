# compression-heating-157 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-01.json; SHA256 del file sorgente 3eed8f64e97002c31d1e55bb612508d5e71766fee62f3d02fc6c3e994b6be863. Letti individualmente tutti gli 80 prompt e le ipotesi assegnate 153–157 prima della scrittura. Rilette le lezioni reali C3-L01, L02, L03, L06 e L07. Si usa il solo assemble_family esistente, course C3, unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Queste sono note di calcolo dell’autore per la futura revisione distinta: non contengono firme scientifiche o approvazioni.

Sono mantenuti i parametri numerici dei quesiti sorgente. I trasferimenti Q e W sono distinti dalle funzioni di stato. Le convenzioni di segno e le unità sono esplicite nei prompt; i confronti riguardano prove separate. Capacità totale, capacità molare e calore specifico sono distinti quando presenti. Il vincolo fra parametri della prova16 riguarda preparazioni diverse e non introduce una legge variabile lungo il processo.

SVG letto integralmente in XML e rendering nativo; scale e posizioni delle etichette controllate dall’autore. Formula steps separati usando law_steps. Due assembly confrontati, legami source/candidate/provenance riletti e import canonico in SQLite temporaneo, senza pubblicazione. Le anteprime usano browser-batches, helper di resume e browser-drafts canonici immutati in uno snapshot privato del runtime integratore, con package d’autore e un piccolo registro privato che dichiara esattamente i loro ID. Report e completion sono copiati byte per byte solo dopo il vero exit0; il marker non viene costruito da report precedenti. Tali controlli sono tecnici e non costituiscono revisione scientifica indipendente.

## 01 — Due modi di fornire energia al gas

Entrambi gli scambi portano energia nel sistema. Il lavoro compiuto dal gas è meno trenta joule; sottraendolo nel primo principio aggiungiamo trenta al calore venti. L’aumento interno è cinquanta joule. La parola compressione non autorizza a sottrarre L_on, perché quel simbolo indica già il lavoro positivo ricevuto.

Passaggi: `W_{\rm by}=-30\,\mathrm J\qquad \Delta U=Q-W_{\rm by}\qquad \Delta U=20\,\mathrm J-(-30\,\mathrm J)\qquad \Delta U=50\,\mathrm J`

Errori e controllo: Meno dieci J deriva da Q−L_on e tratta il lavoro entrante come uscente. Dieci J rovescia quella differenza; venti e trenta J omettono rispettivamente lavoro o calore.

## 02 — L’unità dell’aumento interno

Il primo principio somma o sottrae quantità di energia, quindi ΔU si misura in joule. La convenzione del lavoro cambia il segno con cui lo si inserisce, non la dimensione fisica.

Passaggi: `[\Delta U]=[Q]=[L_{\rm on}]=\mathrm J`

Errori e controllo: K è temperatura, N forza e J/K capacità termica. Il watt è una potenza, non il lavoro ricevuto durante l’intero processo.

## 03 — Riconoscere la legge con lavoro entrante

Il lavoro del gas W_by è l’opposto del lavoro ricevuto L_on. Sostituire questa relazione in ΔU=Q−W_by produce un doppio meno, quindi una somma. Nel dominio assegnato entrambi i contributi sono positivi e ΔU è maggiore di ciascuno preso separatamente.

Passaggi: `W_{\rm by}=-L_{\rm on}\qquad \Delta U=Q-(-L_{\rm on})\qquad \Delta U=Q+L_{\rm on}`

Errori e controllo: Q−L_on usa la convenzione giusta per lavoro uscente con il simbolo sbagliato. L_on−Q trasforma il calore entrante in un’uscita. Raddoppiare o dimezzare la somma non conserva l’energia trasferita.

## 04 — Più calore con la stessa compressione

A guadagna venti più trenta, cioè cinquanta joule. B guadagna quaranta più trenta, cioè settanta. L’incremento aggiuntivo di venti joule di calore aumenta ΔU di venti, senza raddoppiare il contributo meccanico che è rimasto uguale.

Passaggi: `\Delta U_A=50\,\mathrm J\qquad \Delta U_B=(40+30)\,\mathrm J\qquad \Delta U_B=70\,\mathrm J`

Errori e controllo: Cento raddoppia anche il lavoro ricevuto, che non cambia. Cinquanta ignora il calore nuovo; dieci e meno dieci sottraggono contributi che nel modello entrano entrambi.

## 05 — Il calore come parte dell’aumento

La compressione ha già fornito trenta dei cinquanta joule di aumento. Il resto proviene dal calore: cinquanta meno trenta sono venti. Il valore positivo è coerente con l’energia termica entrante assegnata.

Passaggi: `Q=\Delta U-L_{\rm on}\qquad Q=(50-30)\,\mathrm J\qquad Q=20\,\mathrm J`

Errori e controllo: Ottanta J aggiungerebbero ancora il lavoro che è già incluso nell’aumento totale. Trenta J copiano L_on e cinquanta J attribuiscono al solo calore tutto l’aumento.

## 06 — La compressione dal bilancio

L’aumento totale contiene venti joule ricevuti come calore. La parte restante, trenta joule, è lavoro ricevuto dall’ambiente. Se si volesse il lavoro compiuto dal gas, il suo valore orientato sarebbe invece meno trenta joule.

Passaggi: `L_{\rm on}=\Delta U-Q\qquad L_{\rm on}=30\,\mathrm J\qquad W_{\rm by}=-30\,\mathrm J`

Errori e controllo: Meno trenta J risponderebbero alla domanda su W_by, non a quella su L_on>0. Settanta aggiungerebbero il calore all’aumento anziché separarne i contributi.

## 07 — Più lavoro di compressione

Le somme sono cinquanta e settanta joule. Settanta su cinquanta si riduce a sette quinti. Il rapporto cinque terzi dei soli lavori non basta perché il calore resta presente in entrambe le somme.

Passaggi: `\Delta U_A=50\,\mathrm J\qquad \Delta U_B=70\,\mathrm J\qquad \Delta U_B/\Delta U_A=\frac75`

Errori e controllo: Cinque settimi inverte le prove; cinque terzi ignora Q. Due assume un raddoppio della somma e uno ignora il lavoro aggiuntivo.

## 08 — Lo scarto di una proposta di 100 J

Il bilancio dà cinquanta joule di aumento. La proposta cento supera il risultato di cinquanta joule. Il lavoro entrante è già contato una volta: non si aggiunge una seconda volta l’intera somma dei trasferimenti.

Passaggi: `\Delta U=(20+30)\,\mathrm J\qquad \Delta U=50\,\mathrm J\qquad e=(100-50)\,\mathrm J\qquad e=50\,\mathrm J`

Errori e controllo: Meno cinquanta scambia l’ordine, cento copia la proposta e zero la accetta. Venticinque dimezza ancora uno scarto già ricavato correttamente.

## 09 — L’inversa del calore con compressione

Partiamo dalla somma ΔU=Q+L_on. Per trovare il solo calore sottraiamo il lavoro ricevuto dall’aumento totale. La compatibilità con Q>0 impone ΔU>L_on. Se una lettura non rispettasse tale disuguaglianza, non descriverebbe il riscaldamento con calore entrante dichiarato.

Passaggi: `Q=\Delta U-L_{\rm on}\qquad Q>0\ \Longrightarrow\ \Delta U>L_{\rm on}`

Errori e controllo: Sommare L_on conterebbe due volte quel trasferimento. Invertire la differenza renderebbe negativo Q nel dominio dichiarato. I fattori due alterano il bilancio anche se conservano l’unità di energia.

## 10 — Scalare due trasferimenti entranti

Aumentiamo separatamente ciascun contributo positivo e poi formiamo il rapporto delle somme. Il denominatore Q+L_on è sempre positivo nel modello. Il rapporto è una media dei due fattori pesata dalle quote energetiche iniziali, non il loro prodotto: se entrambi valgono κ, l’intera somma viene moltiplicata soltanto per κ.

Passaggi: `\Delta U_A=Q+L_{\rm on}\qquad \Delta U_B=\kappa_1Q+\kappa_2L_{\rm on}\qquad \frac{\Delta U_B}{\Delta U_A}=\frac{\kappa_1Q+\kappa_2L_{\rm on}}{Q+L_{\rm on}}`

Errori e controllo: Il meno al numeratore inverte il verso del lavoro. Q−L_on al denominatore non è l’aumento di A e può perfino annullarsi per ingressi leciti. Il prodotto quadra erroneamente un fattore comune; scambiare κ₁ e κ₂ li applica agli ingressi sbagliati.

## 11 — Due entrate cambiano insieme

A aumenta U di cinquanta joule e B di novanta. Il rapporto novanta su cinquanta si riduce a nove quinti. Nessuno dei due fattori dei singoli ingressi rappresenta da solo il rapporto delle somme.

Passaggi: `\Delta U_A=50\,\mathrm J\qquad \Delta U_B=90\,\mathrm J\qquad \Delta U_B/\Delta U_A=\frac95`

Errori e controllo: Cinque noni è il reciproco; due è il rapporto dei calori e cinque terzi quello dei lavori ricevuti. Novanta è il numero di joule del secondo aumento, non un rapporto adimensionale.

## 12 — Media di due aumenti interni

Gli aumenti sono cinquanta e novanta joule. La semisomma vale settanta joule. La stessa risposta si ottiene sommando il calore medio trenta e il lavoro medio quaranta: la somma lineare conserva questa media.

Passaggi: `\overline{\Delta U}=\frac{50+90}{2}\,\mathrm J\qquad \overline{\Delta U}=70\,\mathrm J\qquad \overline Q+\overline{L_{\rm on}}=(30+40)\,\mathrm J`

Errori e controllo: Centoquaranta è la somma e trentacinque dimezza nuovamente. Quaranta è il solo lavoro medio e trenta il solo calore medio: ciascuno omette un’entrata.

## 13 — Il lavoro per un aumento fissato

Il bersaglio è novanta joule. Quaranta arrivano già come calore, quindi servono cinquanta joule di lavoro entrante. Cinquanta diviso trenta dà cinque terzi, con entrambi i lavori positivi.

Passaggi: `\Delta U_B=90\,\mathrm J\qquad L_{{\rm on},B}=90\,\mathrm J-40\,\mathrm J\qquad L_{{\rm on},B}=50\,\mathrm J\qquad L_{{\rm on},B}/L_{{\rm on},A}=\frac53`

Errori e controllo: Tre quinti è il reciproco e nove quinti il bersaglio dell’aumento totale. Due richiederebbe sessanta joule di lavoro e produrrebbe cento joule di aumento. Cinquanta copia il lavoro numerico invece del rapporto.

## 14 — Dal display all’apporto termico

La prima prova aumenta U di cinquanta joule e fissa q=3 J⁻¹. La lettura duecentosettanta corrisponde a novanta joule. Cinquanta sono già forniti dal lavoro di compressione, perciò il calore è la differenza, quaranta joule.

Passaggi: `\Delta U_A=50\,\mathrm J\qquad q=3\,\mathrm{J^{-1}}\qquad \Delta U_B=90\,\mathrm J\qquad Q_B=\Delta U_B-L_{{\rm on},B}\qquad Q_B=40\,\mathrm J`

Errori e controllo: Novanta J copierebbero l’aumento totale. Sommare ancora il lavoro darebbe centoquaranta J; usare il display grezzo come energia darebbe duecentoventi J dopo la sottrazione.

## 15 — Guadagno e offset prima del calore

Gli aumenti dei riferimenti sono cinquanta e novanta joule. Ottanta unità di display su quaranta joule danno q=2 J⁻¹; poi b=1. La lettura di C, tolto uno e divisa per due, significa settanta joule. Sottraiamo i trenta forniti dal lavoro e troviamo quaranta joule di calore.

Passaggi: `q=\frac{181-101}{(90-50)\,\mathrm J}\qquad q=2\,\mathrm{J^{-1}}\qquad b=1\qquad \Delta U_C=70\,\mathrm J\qquad Q_C=70\,\mathrm J-30\,\mathrm J\qquad Q_C=40\,\mathrm J`

Errori e controllo: Settanta J sono l’aumento totale, prima di togliere L_on. Venti J produrrebbero S=101 e ottanta J S=221. 81/2 J omette l’offset e ricostruisce S=142 anziché 141.

## 16 — Un vincolo fra i due ingressi

Il primo principio diventa ΔU=(2/3)L_on+L_on=(5/3)L_on. Cinquanta joule per tre quinti danno trenta joule di lavoro ricevuto. Il calore è due terzi di trenta, cioè venti joule; la loro somma ricostruisce cinquanta.

Passaggi: `\Delta U=\frac23L_{\rm on}+L_{\rm on}\qquad \Delta U=\frac53L_{\rm on}\qquad L_{\rm on}=\frac35\Delta U\qquad L_{\rm on}=30\,\mathrm J\qquad Q=20\,\mathrm J`

Errori e controllo: Meno trenta viola il verso assegnato. Cinquanta copia ΔU e venti copia Q. Settantacinque divide per due terzi come se l’aumento fosse il solo calore, omettendo il lavoro nella somma.

## Pulizia dei processi di test su macOS

Le 48 asserzioni UI erano riuscite e il report era stato scritto, ma ciò non è stato trattato come esito terminale. lsof ha identificato il socket del mio renderer ancora ereditato da tre helper crashpad/GoogleUpdater orfani con PPID 1, avviati insieme al suo Chrome. Dopo verifica puntuale di endpoint, PPID e comando, sono stati inviati SIGTERM soltanto a quei tre helper. Il renderer è rimasto intatto ed è poi terminato realmente con exit0; solo allora il runner ha creato completion.json. Il JSON completo del cleanup è conservato accanto a questa nota. Nessun report, protocollo, assert o renderer è stato modificato per ottenere l’esito. Questa è pulizia tecnica di risorse, distinta dalla revisione scientifica, ancora NOT_RUN per l’autore.
