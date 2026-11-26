# Authoring DRAFT — photon-packet-frequency-241

Tutti gli 80 prompt originali A240–244 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U7-01. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U7-01 SHA256 609dec0246ff1cd1b89afed2ea7258c0f65ff8e853735ce9196fe24829fc1233. Ogni caso autonomo è conservato, senza imporre il modello numerico comune: frequenza all’interfaccia 24003, velocità di fase 24004, ordinamento fotonico 24103, soglia a un fotone 24203 e geometria EM 24303. Conteggi N interi e tassi medi sono distinti. Le unità di misura scalate non sono confuse con quantità adimensionali: ogni coefficiente numerico è definito dalla normalizzazione.

Prima di qualunque candidato sono state congelate entrambe le primarie. B per A240–244: SHA 8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d su 8a82a32527171b68346cf30a933552b2a5f9366f, mai aperta dall’autore. A per B245–249: SHA 6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08 su b3932757. Nessuna opzione, chiave, soluzione, SVG o modulo autore B245–249 letto durante l’autoria A.

Lettura integrale delle lezioni reali C5-L06 e C5-L07 al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d: interfaccia stazionaria, campi EM, energia per fotone, potenza e frazione trasmessa. Primaria C5-L06 per 240/243 e C5-L07 per 241/242/244; prerequisiti reali del catalogo. Nessuna competenza inventata.

Autore soltanto: DRAFT, revisione scientifica distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Import canonico ROOT in sola lettura su SQLite temporaneo: 16 nuovi e poi 0 nuovi/16 invariati; 991 pubblicati e storico conservati. Non è una seconda pipeline e non attribuisce credito di integrazione o SCI.

Asset SVG-only realmente renderizzato in browser nativo, XML e PNG completo effettivamente letti dopo exit 0 reale del processo. Mutex condiviso e guardia ≥2 GiB rispettati. Nessuna UI prodotto locale: test a 320px e relativo marker NOT_RUN e riservati al runner canonico. I testi visibili mostrano grandezze fisiche, non pixel o altre metriche ingegneristiche.

## AR-u7-photon-packet-frequency-01 — Cinque fotoni della stessa frequenza

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. Con N=5 e u=1, quanto vale E in unità q_E? Inserisci il coefficiente e.

Procedimento d’autore: Ogni fotone ha energia hf; il pacchetto ne contiene N, dunque E=Nhf. Sostituendo la scala di frequenza si trova e=(33/5)Nu. Per N=5 il fattore cinque si cancella: e=33, cioè E=33q_E. Il valore prescritto di h non va sostituito con una costante più precisa a metà calcolo.

Formule: E=Nhf;  e=\frac{33}{5}Nu;  e=33;  E=33q_E.

Distrattori e controprove: 33/5 è l’energia numerica di un solo fotone, non di cinque. Sessantasei raddoppia il pacchetto senza dato;165 omette il divisore cinque nel coefficiente. L’energia per fotone e quella totale sono distinte.

Hint: Moltiplica l’energia di un fotone per il conteggio N.

Fonte SHA256 40d56e0ec62a3684bd11ec15758214094b00675ed796e19da1f52e646db7d0d6. Candidato SHA256 39c18e0610339d4c9050cb77cd01530751d20a0544febbec55a310b10a892dbf. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-02 — Energia fisica e unità scelta

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. Quale unità è dimensionalmente adatta a E?

Procedimento d’autore: L’energia di un fotone è h f: J·s per s⁻¹ dà J. Anche E è un’energia, espressa qui in multipli di q_E. Soltanto e=E/q_E è un numero puro; la normalizzazione non elimina la dimensione dell’energia fisica.

Formule: [hf]=\mathrm J;  [E]=\mathrm J;  [e]=1.

Distrattori e controprove: Hz è frequenza, W potenza, s tempo. Il simbolo1 è adatto a e, non a E. Il conteggio N non cambia l’unità joule.

Hint: Distingui E dal suo coefficiente numerico e.

Fonte SHA256 27b2ddca1c16a45b89b73ffc907dc5a5eddec21bd7d32a7987a0839f96bd2576. Candidato SHA256 4e180099f6c32fd2a99287bff49edfd97461df32c148d163e0d57e409fe1d63d. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-03 — Ordinare l’energia dei singoli fotoni

Caso autonomo nel vuoto: fra le bande convenzionali indicate, quale ordinamento va da fotoni meno energetici a fotoni più energetici?

Procedimento d’autore: Per un singolo fotone E_γ=hf: una frequenza maggiore significa energia maggiore. Le quattro bande scelte si ordinano come radio, infrarosso, visibile, ultravioletto. Non si confrontano potenze totali di sorgenti né numero di fotoni. Le microonde sono spesso incluse nelle radiofrequenze; qui non serve introdurle come banda separata.

Formule: E_\gamma=hf;  f_2>f_1\ \Longrightarrow\ E_{\gamma,2}>E_{\gamma,1}.

Distrattori e controprove: L’ordine inverso scambia la dipendenza diretta da f. Mettere il visibile prima dell’infrarosso o le radio dopo l’infrarosso rompe l’ordine delle frequenze. Non si impone un ordinamento universale fra X e gamma, che possono sovrapporsi: non compaiono nelle alternative.

Hint: Ordina le frequenze e usa E_γ proporzionale a f.

Fonte SHA256 920712487526bd8b14bb977745933eb207e9a7ae7d2de0043ea7494d5c80913f. Candidato SHA256 1e8bef138db0d7c7e8e0fb356c5d0fe9a0b00932b3459fd211318bc6590fb657. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-04 — Due volte i fotoni, stessa energia per fotone

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. u resta1 e N passa da5 a10. Come cambia E?

Procedimento d’autore: La frequenza di ogni fotone è invariata, quindi hf resta uguale. Raddoppiare N da5 a10 raddoppia l’energia totale: e passa da33 a66. Entrambi i conteggi sono interi ammessi; non è l’energia del singolo fotone a raddoppiare.

Formule: e_A=33;  e_B=66;  E_B/E_A=2.

Distrattori e controprove: 33/2 inverte la dipendenza da N.132 applica il quadrato del raddoppio;330 copia il numero10 senza il coefficiente corretto.33 ignora i fotoni aggiunti.

Hint: Mantieni f fissa e varia soltanto N.

Fonte SHA256 f62f896e80e61b202e32f9c3f6e913ee7f9b1efc807dcafc210ce5765b0c6f45. Candidato SHA256 ac724f499500ced547596e3ad0d63933a5d60cde9d37b0f28ac0e9b0a882e918. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-05 — Il conteggio ricavato dall’energia

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. e=33 e u=1. Quanto vale N?

Procedimento d’autore: Moltiplico e=(33/5)Nu per5 e divido per33u positivo. N=5e/(33u)=5. La verifica dell’intero è parte del dominio: un risultato non intero non descriverebbe questo pacchetto monocromatico ideale.

Formule: N=\frac{5e}{33u};  N=5.

Distrattori e controprove: Uno omette il fattore cinque del coefficiente;33 copia il numero dell’energia senza dividerlo per quella di un fotone. Dieci darebbe e66, non33.

Hint: Ricostruisci l’energia per fotone prima di contare i fotoni.

Fonte SHA256 d9a2b95f03d6443124841664f2b3db46b2937b8e6421637b68e0c43d3dad3017. Candidato SHA256 edd39e5cc0675fd54f87023f5dbea727b838f5024483396a4c943bf99cdd594e. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-06 — La frequenza in unità di 10¹⁴ Hz

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. e=33 e N=5. Quanto vale f in unità di 10¹⁴ Hz? Inserisci il coefficiente u.

Procedimento d’autore: Isolo u=5e/(33N). Con i dati, numeratore e denominatore sono entrambi165: u=1. La frequenza fisica è f=10¹⁴ Hz. Non si deve assegnare hertz al coefficiente u e poi moltiplicarlo ancora per una frequenza.

Formule: u=\frac{5e}{33N};  u=1;  f=10^{14}\,\mathrm{Hz}.

Distrattori e controprove: Cinque copia il conteggio N e darebbe e165.1/5 omette il fattore cinque al numeratore e darebbe e33/5.33 copia l’energia numerica senza l’inversa.

Hint: La risposta u è il coefficiente della frequenza, non f in hertz.

Fonte SHA256 d68dfafec2ea21dba01e3bf1a96d955c00c8cf8cb27b03afe6a3e092780a6ed9. Candidato SHA256 9d06536bc45bf54bc3e1494671cb8edfd23fcc177b5cce07da3a8dce4df32663. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-07 — La frequenza doppia

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. A usa N=5,u=1; B mantiene N e usa u=2. Quanto vale E_B/E_A?

Procedimento d’autore: Raddoppiare f raddoppia l’energia di ciascun fotone. Con N invariato, e passa da33 a66 e il rapporto totale è due. Il numero di fotoni non è cambiato.

Formule: e_A=33;  e_B=66;  E_B/E_A=2.

Distrattori e controprove: Mezzo inverte il confronto, quattro introduce un quadrato e uno ignora la frequenza. Cinque copia il conteggio, che qui si cancella.

Hint: Nel rapporto si cancellano N e h.

Fonte SHA256 c8bc28c35dd053b4515a5bcc67173f89cd3954b7f4d75522ac3015cf5f5f29a5. Candidato SHA256 dfe770bb6e6ea0ebc74a311c8014c4b14eeec27b1e43aec3fff6750dea8bfdb7. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-08 — Lo scarto è ancora un’energia

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. Con N=5,u=1 si propone E=66q_E. Quanto vale proposta meno corretto?

Procedimento d’autore: Il corretto è33q_E. La proposta supera il valore fisico di66q_E−33q_E=33q_E. Il rapporto puro due non è uno scarto e non porta l’unità energetica q_E.

Formule: E=33q_E;  \delta E=(66-33)q_E;  \delta E=33q_E.

Distrattori e controprove: −33q_E inverte l’ordine,66q_E ripete la proposta e0q_E la accetta. Due è il rapporto delle due energie, senza dimensione.

Hint: Sottrai le energie mantenendo q_E.

Fonte SHA256 a0f230d4050ccb819c1095af027c782d8497563faafdce12ab3604b546bac1c7. Candidato SHA256 0f4e95c8c137eb644f59a8c1f4e0253cf071ad045ff03fea2b95aa3c652e66f8. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-09 — L’inversa generale per N

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. E e f sono noti. Quale relazione isola N?

Procedimento d’autore: Nell’uguaglianza E=N(hf), il prodotto hf è l’energia di un fotone. Divido E per quel prodotto: N=E/(hf). Il rapporto di due energie è puro, ma per essere un conteggio di questo modello deve anche risultare intero positivo.

Formule: N=\frac E{hf};  [N]=1.

Distrattori e controprove: Ehf ha dimensione di energia al quadrato. hf/E è il reciproco del conteggio; Ef/h non isola N e E/f non è puro. Il valore numerico di h assegnato non permette di eliminarlo dalla legge dimensionale.

Hint: Dividi l’energia totale per l’energia di un fotone.

Fonte SHA256 72456e1f6a08104edd2c641669e0ac5219692ff233e1ff7b589b275dd0575740. Candidato SHA256 321133920a382c1e1f3c3b6b558bae0c9bb039040e1e41b0c99fc0966ebc1c26. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-10 — Due fattori, con conteggi ammessi

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. Fra preparazioni N_B=κ₁N_A e u_B=κ₂u_A, con fattori positivi e N_A,N_B interi. Quanto vale E_B/E_A?

Procedimento d’autore: L’energia è un prodotto di N e f. La normalizzazione della frequenza è la stessa e h si cancella: il rapporto èκ₁κ₂. Non serveκ₁ intero in assoluto; serve cheκ₁N_A sia un conteggio intero positivo.

Formule: E_B/E_A=\kappa_1\kappa_2.

Distrattori e controprove: I quozienti invertono una dipendenza diretta. Il quadrato di κ₁ non appartiene alla somma di energie di fotoni identici; la somma darebbe due per fattori unitari invece di uno.

Hint: Controlla sia il prodotto dei fattori sia l’intero N finale.

Fonte SHA256 1efef5c8ad3c7edc9282e74d2daa6e36e148829e88f6642e92f2570cb31d0102. Candidato SHA256 57edd187f87a3def03a9fde1fb64dc69e43e597c75e8df81cb454502965e5826. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-11 — Conteggio doppio e frequenza doppia

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. A ha N=5,u=1; B ha N=10,u=2. Quanto vale E_B/E_A?

Procedimento d’autore: A ha e33. B ha e=(33/5)·10·2=132. Il rapporto132/33=4 combina i due raddoppiamenti. L’energia per fotone è doppia e i fotoni sono anche il doppio.

Formule: e_A=33;  e_B=132;  E_B/E_A=4.

Distrattori e controprove: Un quarto inverte il rapporto; due segue un solo cambiamento. Uno immagina una compensazione che non esiste; dieci copia il conteggio finale.

Hint: Separa l’effetto sul singolo fotone da quello sul numero.

Fonte SHA256 949461f1fc892c6a47386c2a30fa7e909f5eaf6eb44721d4545f492554d2ba0b. Candidato SHA256 e2c268399233db29c9a5e89a9cdbf29db7fd67187eebb9d49d98f13604164b0d. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-12 — Media di due pacchetti fisici

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. A usa N=5,u=1 e B usa N=10,u=2. Qual è il coefficiente e medio delle due energie, con pesi uguali?

Procedimento d’autore: Le energie numeriche sono33 e132. La semisomma è165/2: la media fisica è(165/2)q_E. Le medie degli ingressi darebbero N=15/2, non un conteggio ammesso per un singolo pacchetto; la valutazione formale297/4 non va presentata come terza preparazione fisica.

Formule: \overline e=\frac{33+132}{2};  \overline e=\frac{165}{2};  \overline E=\frac{165}{2}q_E.

Distrattori e controprove: 297/4 è soltanto l’estensione algebrica ai dati medi, con N non intero.165 somma senza dimezzare;99/2 è la semidifferenza e132 ripete solo B. La media di energie non deve essere essa stessa l’energia di un pacchetto con il conteggio medio.

Hint: Media le due energie già ricavate, non i conteggi per una nuova prova.

Fonte SHA256 3b0215c9d9ff2df2890081e08a26691858be77a6d19f350b587a96ebf88fc70e. Candidato SHA256 552d75dcfaae5b60454c80c71c3047b9474fd6e97554c88ef56e38e20c1467a1. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-13 — La frequenza necessaria al bersaglio

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. A ha N_A=5,u_A=1. B usa N_B=10 e deve avere E_B=4E_A. Quanto vale u_B/u_A?

Procedimento d’autore: Il bersaglio è e_B132. Con N_B10, la legge dà e_B=66u_B: serve u_B2 e quindi rapporto due. Il conteggio doppio fornisce già un fattore due, il rimanente viene dall’energia per fotone.

Formule: e_B=132;  66u_B=132;  u_B=2;  u_B/u_A=2.

Distrattori e controprove: Mezzo inverte il confronto; quattro copia l’aumento dell’energia totale ignorando N. Uno darebbe e66, non132; cinque copia il numero iniziale di fotoni.

Hint: Dividi il fattore energetico richiesto per quello del conteggio.

Fonte SHA256 5c80256817380b2afbe4757beac1ab91b59736751222b7c9b37f5d432973638f. Candidato SHA256 7ffc6a9d84734b8c5a5384f7011ae5c3e117c29dabc3b13c478986ddb0d5cfbb. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-14 — Tarare prima di ricavare il conteggio

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. Il display continuo adimensionale D=a_cal e, senza offset, legge99 per N=5,u=1. Una prova con u=2 legge396. Quanto vale N?

Procedimento d’autore: Il riferimento ha e33 e fissa a_cal=99/33=3. La lettura396 dà e132. Ogni fotone della nuova frequenza ha energia numerica66/5: N=132/(66/5)=10. Il display continuo non conta direttamente fotoni.

Formule: a_{\rm cal}=3;  e=132;  N=\frac{5e}{33u};  N=10.

Distrattori e controprove: Trenta usa D396 come e e salta il guadagno, dando la lettura prevista1188. Venti ignora la frequenza doppia; cinque ripete il riferimento. Il risultato finale deve essere intero, anche se D è una lettura continua.

Hint: Decodifica e, poi dividi per l’energia numerica di un fotone.

Fonte SHA256 1d5275679aed4c6eae4e1acec2c6efbb738768e0c2ff8f6106caa99d50b38550. Candidato SHA256 54a0ad93cd530e53d7bb47c4372ff94829d79c97c98bc4dd5c544efce2182620. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-15 — Due riferimenti per eliminare l’offset

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. D=a_cal e+b_cal è continuo. A:N=5,u=1,D=67. B:N=10,u=2,D=265. C:u=1,D=133. Quanto vale N_C?

Procedimento d’autore: I riferimenti danno e33 ed e132. Guadagno(265−67)/(132−33)=198/99=2, offset uno. D_C133 decodifica e_C66; con u1 segue N_C=5·66/33=10. Sottrarre l’offset prima del guadagno evita un conteggio incompatibile.

Formule: a_{\rm cal}=2;  b_{\rm cal}=1;  e_C=66;  N_C=10.

Distrattori e controprove: Omettere b darebbe N=665/66, non intero e non ricostruirebbe D133. Venti salta il guadagno dopo aver tolto b; cinque ripete A. Qui il controllo del conteggio aiuta a rilevare una taratura usata male.

Hint: Ricostruisci due energie di riferimento prima di usare le letture.

Fonte SHA256 3a2e843ec39bc88113a1b4ac4352b5d2b052e36772b381c4110628540dabf6b7. Candidato SHA256 91bfcc7ea009d10552ecbbd0a8036ce960cc8eeae1641d14acb6f4ef1d2eeba1. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-packet-frequency-16 — Il vincolo rende quadratica la frequenza

Un pacchetto ideale contiene N fotoni monocromatici, con N intero positivo. La frequenza è f=u·10¹⁴ Hz, dove u>0 è un coefficiente numerico puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto del modello. Definisco q_E=10⁻²⁰ J ed e=E/q_E: e è il valore numerico dell’energia totale in questa unità, mentre E è l’energia fisica. Confronti e tarature riguardano pacchetti distinti e conservano N intero. Fra preparazioni N=5u, con N intero; si misura e=33. Quanto vale u nel dominio positivo?

Procedimento d’autore: Sostituisco N=5u nella legge e=(33/5)Nu e ottengo e=33u². La misura33 impone u²=1. Le radici algebriche sono alternative, ma il ramo u>0 seleziona u1, quindi f10¹⁴ Hz e N5 intero. Non è una variazione temporale del numero di fotoni nello stesso pacchetto.

Formule: e=33u^2;  u^2=1;  u=1;  N=5.

Distrattori e controprove: −1 viola la frequenza positiva e rende N negativo. Cinque darebbe e825;1/5 darebbe e33/25. La misura assoluta non lascia una scala libera.

Hint: Sostituisci il vincolo prima di estrarre la radice positiva.

Fonte SHA256 70a5cc2bcb294eb5f078cc997fa8e0a852c424d384cd8d84b1f24caf8fc1aeb6. Candidato SHA256 e309df8100c80d8fa34444f308ab2249394b1ae4b1a5db7848bb43f5d9a5a813. Skill reale C5-L07. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 aee8e1818e35909640ebbf830333c0c009dd11ad55a849d872d2058426d13cd6. Package file SHA256 f0df25eb43c5fb531da3ffd56430e5620c5b4220168af080301f4128bf8ba586. Binding file SHA256 2f046ef0df60b86553dfeb4a0400c6d48df1dd856de17e0b39e9cd025a502fff. Strutturale SHA256 df78d3eff4703be09249bf147b3e844d8057e2df1f6e04708bfed9b11a34794f. Manifest asset-only SHA256 8bf72ca173ebd209609056d05cb66ef82a6d6268598d6cde74684b24eb70dc95.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B deve leggere questi finali contro la propria primaria distinta prima del congelamento scientifico.

Lettura geometrica d’autore: il primo gruppo ha esattamente5 cerchi e il secondo10, di identico raggio perché i simboli non codificano energie individuali differenti. La frequenza del primo pannello è u1 per entrambi; il secondo pacchetto del terzo pannello usa invece u2, dichiarato nella sua intestazione. Le barre66/264/165 coordinate da origine150 rappresentano33/132/165/2 unità q_E, scala comune2 coordinate/q_E. Non si attribuisce a un cerchio un’area proporzionale all’energia e non si conta15/2 fotoni in una nuova preparazione. L’arrow centrale è un passaggio di calcolo, non una traiettoria. XML e PNG completo effettivamente letti; le coordinate restano nella nota tecnica.
