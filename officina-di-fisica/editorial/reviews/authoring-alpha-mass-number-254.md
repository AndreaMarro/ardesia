# Authoring DRAFT — alpha-mass-number-254

Tutti gli 80 prompt originali A250–254 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U7-02. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U7-02 SHA256 43ad92dba82bc16829a60f11071965f30bf0d8e115def3c1dc5eb2a3e229aeb7. Le quantità statistiche sono distinte dai conteggi di eventi di un singolo nucleo; esponenti sempre adimensionali e parametri costanti entro una preparazione.

Entrambe le primarie sono state congelate prima dell’autoria: A per B255–259 SHA 5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4 su d0628ef617dc36ac03d018a854de21fdb3da4f28; B per A250–254 SHA 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2 su 7518f76e54b9d05ab1b03548e6113339afd40db9, mai aperta dall’autore A. Nessun candidato, opzione, chiave, hint, solutionSteps o SVG B255–259 letto durante l’autoria A.

Letta integralmente la lezione reale C5-L08 «Una popolazione di nuclei che cambia nel tempo» al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, comprese formule e figura storica C5-emivita.svg. Copre esplicitamente popolazione media, emivita, attività, alfa/beta/gamma e condizioni del rivelatore. Skill primaria C5-L08, prerequisiti reali C1-L001/C5-L08. Nessun ID inventato.

Autore soltanto: DRAFT, SCI distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Import canonico ROOT in sola lettura su SQLite temporaneo con timeout originale: 16 nuovi e poi 0 nuovi/16 invariati; 991 pubblicati e storico conservati. Nessun credito di integrazione attribuito dall’autore.

SVG-only effettivamente renderizzato in browser nativo, XML e PNG completo letti dopo exit 0 reale del processo. Mutex condiviso e guardia ≥2 GiB rispettati. UI prodotto locale vietata e NOT_RUN; replay a 320px riservato al runner canonico. Le figure mostrano grandezze fisiche e non metriche in pixel.

## AR-u7-alpha-mass-number-01 — Quattro nucleoni escono per evento

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. Con A₀=220 e n=1, quanto vale A_f?

Procedimento d’autore: Una particella α porta quattro nucleoni fuori dal nucleo genitore. Per un evento tolgo quattro al numero iniziale: A_f=220−4=216. Questo è un bilancio di conteggi, non la sottrazione di 4 kg o la stima dell’energia di decadimento.

Formule: A_f=A_0-4n;  A_f=220-4;  A_f=216.

Distrattori e controprove: 219 sottrae un solo nucleone, 218 sottrae soltanto i due protoni e 224 aggiunge i nucleoni emessi al figlio. Il valore 55 divide per quattro e non rappresenta il numero di massa residuo.

Hint: Conta protoni e neutroni che compongono la particella α.

Fonte SHA256 2bcef111ef50c5484325930d326ed38668e06e350282ddcae679262d204813c4. Candidato SHA256 a74d8dec8436fe70951cac688c5dd8369f55b4fd9bd9b0c57c3e4c7b725a2cb8. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-02 — Il numero di massa è un conteggio

Quale indicazione di unità è adatta al numero di massa A_f di un nucleo?

Procedimento d’autore: A conta protoni più neutroni ed è un intero puro. La massa fisica del nucleo è una grandezza diversa e risente anche dell’energia di legame: non si identifica A con un valore esatto in kg.

Formule: A=Z+N_{\rm neutroni};  [A]=1.

Distrattori e controprove: kg è massa fisica, C carica, Bq attività e J energia. Il nome numero di massa non assegna al conteggio la dimensione di una massa.

Hint: Distingui il numero di nucleoni dalla massa effettiva del nucleo.

Fonte SHA256 1ad0adad9773080a509e915a87a3800cf6edfaf21eabe24facd86ee491331f07. Candidato SHA256 ff48f738de150916aab747e2dc3df0547d8289fac3abc93c4e58ad9cb67101ac. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-03 — Alfa: cambiano due numeri nucleari

Caso autonomo: in un decadimento α, come cambiano numero di massa A e numero atomico Z del nucleo figlio?

Procedimento d’autore: L’α è un nucleo di elio: due protoni e due neutroni, carica +2e. Il figlio ha perciò quattro nucleoni e due protoni in meno. Il nucleone e la carica totali sono conservati includendo la particella emessa.

Formule: {}^A_ZX\longrightarrow{}^{A-4}_{Z-2}Y+{}^4_2\mathrm{He};  A_f=A-4;  Z_f=Z-2.

Distrattori e controprove: Scambiare quattro e due confonde nucleoni e protoni. Mantenere A invariato sarebbe incompatibile con l’emissione di quattro nucleoni; aumentare Z avrebbe il segno opposto al bilancio di carica. Una semplice γ lascerebbe entrambi invariati.

Hint: Considera separatamente il numero totale di nucleoni e quello di protoni.

Fonte SHA256 08125d953e4aa1fc70c310dded0e6e5f592a066dc03c30469d028320b8bbdf76. Candidato SHA256 d0f1fc4d9843c1cfcd1467270a884045cbe7a485b7f98986a33dde9ddec5f292. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-04 — Cambia soltanto il nucleo iniziale

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. A usa A₀=220,n=1; B usa A₀=224,n=1. Come cambia A_f?

Procedimento d’autore: Il numero di α è uguale e in entrambi i casi escono quattro nucleoni. L’ingresso maggiore di quattro produce un figlio maggiore di quattro: da 216 a 220. Non si moltiplica la sottrazione per il rapporto degli ingressi.

Formule: A_{f,A}=220-4;  A_{f,A}=216;  A_{f,B}=224-4;  A_{f,B}=220.

Distrattori e controprove: 212 diminuisce il figlio invece di aumentarlo. 224 ignora l’emissione, 216 ignora il nuovo genitore e 432 raddoppia l’uscita senza una ragione fisica.

Hint: La stessa sottrazione si applica a entrambi gli ingressi.

Fonte SHA256 9b45d5fc15eb7209d85bf2589f38da401c9813a2dd9720bacc8308be16ce6976. Candidato SHA256 5679450d1d99d1cf9270073b6a615910f07cffca32bcd6372b59e76f4d82ce39. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-05 — Ricostruire A iniziale

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. A_f=216 e n=1. Quanto vale A₀?

Procedimento d’autore: Riporto sul nucleo iniziale i quattro nucleoni per ogni α: A₀=A_f+4n. Con un evento aggiungo quattro e ricavo 220. La verifica 220−4=216 chiude il bilancio.

Formule: A_0=A_f+4n;  A_0=216+4;  A_0=220.

Distrattori e controprove: 212 sottrae ancora invece di invertire. 217 aggiunge un solo nucleone; 864 moltiplica per quattro. L’inversa deve restituire un numero maggiore del figlio.

Hint: Nell’inversa i nucleoni emessi vanno riaggiunti.

Fonte SHA256 72aae3033b04f560cd12c3c36ae88978af94594338222945d5368a8b189ece9b. Candidato SHA256 64c76ff6be31ab4d3758cfa8e8aec45cfaa389fc56c511c1194dacbd39200535. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-06 — Contare eventi alfa

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. A₀=220 e A_f=216. Quanto vale n?

Procedimento d’autore: La differenza dei numeri di massa è quattro. Ogni evento ne sottrae quattro, quindi n=(220−216)/4=1. La divisione deve restituire un intero positivo: una differenza non divisibile per quattro non descriverebbe una catena di sole α.

Formule: n=\frac{A_0-A_f}{4};  n=\frac{220-216}{4};  n=1.

Distrattori e controprove: Quattro conta i nucleoni persi invece degli eventi. 55 divide il solo A₀ per quattro e 16 moltiplica la differenza per quattro. Il numero frazionario di eventi non è ammesso.

Hint: Dividi la perdita di nucleoni per quanti ne porta via ciascuna α.

Fonte SHA256 67423815b9e150f476b35f73760998c67b4bd69daad897ecd58f4a1ce3fe83ba. Candidato SHA256 79e20a25d73b9b0426e7cb0e36f07133761335e4611489f2042c354e09c0f2d5. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-07 — Una alfa in più sullo stesso ingresso

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. A usa A₀=220,n=1. B mantiene A₀=220 e usa n=2. Quanto vale A_f,B/A_f,A?

Procedimento d’autore: A dà 216 e B dà 220−8=212. Il rapporto finale/iniziale è 212/216=53/54. Raddoppiare gli eventi non dimezza il figlio: il numero di massa iniziale resta una parte della differenza.

Formule: A_{f,A}=216;  A_{f,B}=212;  A_{f,B}/A_{f,A}=\frac{53}{54}.

Distrattori e controprove: 54/53 inverte il rapporto. Un mezzo confonde il raddoppio di n con una proporzionalità inversa dell’uscita; uno ignora l’evento aggiuntivo e due fa aumentare il numero residuo.

Hint: Calcola entrambe le perdite prima di formare il rapporto dei figli.

Fonte SHA256 6c398df62fb22d78f53d4c2b3e09af3226a62749e9712e64495f03e0d9723936. Candidato SHA256 b585f87339794c86577565d8a59063e1d010d44e1d507017c2f11e3fe7193b17. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-08 — Il numero proposto è troppo grande

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. Con A₀=220,n=1 si propone A_f=432. Quanto vale proposta meno corretto?

Procedimento d’autore: Il corretto è 216. La proposta è maggiore di 432−216=216. È anche maggiore del genitore, impossibile per il figlio della catena α dichiarata: il controllo di dominio individua subito il verso fisico dell’errore.

Formule: \delta A_f=432-216;  \delta A_f=216.

Distrattori e controprove: −216 inverte l’ordine, due è il rapporto proposto/corretto, 432 copia la proposta e zero non ne verifica il bilancio.

Hint: Un conteggio di nucleoni persi non può far crescere A_f oltre A₀.

Fonte SHA256 6743df156a0616ef0f8ca88713bd0a2bbdf2595c4e19a584f1fd2ac44e7985bd. Candidato SHA256 bdb2895769fa7c8e8aedc74b7e5c28ca28380fe5b9b1025749b545a669cc7765. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-09 — L’inversa simbolica della catena

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. A_f e n sono noti. Quale relazione isola A₀?

Procedimento d’autore: Sommo 4n a entrambi i membri di A_f=A₀−4n. Il conteggio iniziale recuperato è A_f+4n, con A_f e n interi positivi. Il risultato non autorizza da solo una previsione energetica di una catena reale.

Formule: A_f+4n=A_0;  A_0=A_f+4n.

Distrattori e controprove: Il segno meno ripete la perdita. I quozienti non rappresentano una somma di nucleoni; aggiungere n confonde eventi e nucleoni rimossi per evento.

Hint: Isola A₀ prima di inserire eventuali numeri.

Fonte SHA256 142ad3ed32336ec4120a4adcdd5a7b9386ff45a353e527a29fd5801a42b40e6a. Candidato SHA256 4a5c2e7937bcfe9b0a84b890c76debbd526dadb4d112652642fe45c4a31acfb3. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-10 — Due fattori in una differenza

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. Fra prove A₀,B=κ₁A₀,A e n_B=κ₂n_A. Entrambi gli stati rispettano integralità e compatibilità. Definiamo R=A_f,B/A_f,A e nei simboli seguenti A₀,n appartengono ad A. Quanto vale R?

Procedimento d’autore: Sostituisco i fattori nei due termini della differenza, senza raccoglierli come un prodotto. Resta il rapporto indicato. Il nuovo stato richiede κ₁A₀>4κ₂n e tutti i nuovi conteggi interi positivi; fattori positivi da soli non bastano.

Formule: R=\frac{\kappa_1A_0-4\kappa_2n}{A_0-4n}.

Distrattori e controprove: Prodotto e quoziente dei fattori ignorano il contributo sottratto. Il segno più aggiunge al figlio i nucleoni emessi e la somma dei fattori darebbe due per preparazioni identiche.

Hint: Conserva la differenza e ricontrolla la compatibilità del secondo stato.

Fonte SHA256 f9ffee2d3986e5e3b61146632fb5c5d212f4208153f2e062668f878dc7219f80. Candidato SHA256 ac03bbf01b3b2761ce1e762466666e475b78e91f22bb15d387a83fec08ac2e1b. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-11 — Due catene con nuclei iniziali pesanti

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. A: A₀=220,n=1. B: A₀=228,n=2. Quanto vale A_f,B/A_f,A?

Procedimento d’autore: A ha A_f=216. B perde otto nucleoni da 228 e ha A_f=220. Il rapporto 220/216 si riduce a 55/54. Sono catene assegnate differenti; non si impone lo stesso A₀ né si sommano i loro eventi.

Formule: A_{f,A}=216;  A_{f,B}=228-8;  A_{f,B}=220;  A_{f,B}/A_{f,A}=\frac{55}{54}.

Distrattori e controprove: 54/55 inverte il confronto. 57/55 è il rapporto 228/220 dei genitori iniziali, non dei figli; due copia il rapporto degli eventi e uno presume una compensazione non esatta.

Hint: Ricava i due numeri di massa finali prima del loro quoziente.

Fonte SHA256 a71ebb54023a69e23d1fbb4ea192d833951285cccbb2518dfaeacae2de8a6704. Candidato SHA256 e33d0919fa185e2d0be348ed341a9057a73764584b16154fb68ac2ff6fb3b83f. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-12 — Una media statistica di numeri di massa

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. A: A₀=220,n=1. B: A₀=228,n=2. Qual è la media aritmetica dei due A_f con uguali pesi?

Procedimento d’autore: I numeri finali sono 216 e 220: media 218. La legge affine darebbe lo stesso risultato inserendo formalmente A₀ medio 224 e n medio 3/2. Ma n=3/2 non è una singola catena: la coincidenza algebrica non cancella il dominio intero degli eventi.

Formule: \overline A_f=\frac{216+220}{2};  \overline A_f=218.

Distrattori e controprove: 436 è la somma, due la semidifferenza, 216 e 220 ripetono una sola catena. Una statistica fra preparazioni non va reinterpretata come un evento frazionario.

Hint: Media prima i risultati delle due catene effettivamente assegnate.

Fonte SHA256 eaf088adc1ffb4fa50a2e4cddb425a81cadd61cc2cecd8e5bda99b7978ddcd5d. Candidato SHA256 67f956d8e80c6346c3c7cfc03736a0a15a1fc6806ffaa07e871530463df8337c. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-13 — Gli eventi necessari nel nuovo ingresso

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. A ha A₀=220,n_A=1. B deve avere A₀=228 e A_f,B=(55/54)A_f,A. Quanto vale n_B/n_A?

Procedimento d’autore: Il bersaglio è (55/54)·216=220. Per scendere da 228 a 220 occorre perdere otto nucleoni, cioè due α. Rispetto all’unico evento di A il rapporto è due, e tutti i conteggi restano interi.

Formule: A_{f,B}=220;  n_B=\frac{228-220}{4};  n_B=2;  n_B/n_A=2.

Distrattori e controprove: Uno darebbe A_f,B=224, non 220. Un mezzo inverte il rapporto e i fattori 55/54 o 54/55 appartengono ai numeri di massa finali, non al conteggio degli eventi.

Hint: Trasforma il bersaglio in una perdita di nucleoni e poi in eventi interi.

Fonte SHA256 0340704e4f9e4a0d588264838328cc26a899ad2ff52e94cac25edbdbfdf7f5d3. Candidato SHA256 5bbb46c95395b81120f0dff8a15039e559b7c0aa5ad6a7ffcbf209618b556c8a. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-14 — Tarare il display del numero finale

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. Un display continuo D=g A_f legge 648 con A₀=220,n=1. In B legge 660 e si conosce n=2. Quanto vale A₀,B?

Procedimento d’autore: Il riferimento A_f=216 fissa g=648/216=3. La lettura 660 indica A_f,B=220. Per ricostruire l’inizio aggiungo gli otto nucleoni emessi: A₀,B=228. La continuità del display non rende frazionari i numeri nucleari.

Formule: g=3;  A_{f,B}=660/3;  A_{f,B}=220;  A_{0,B}=220+8;  A_{0,B}=228.

Distrattori e controprove: 668 leggerebbe D direttamente come A_f e poi aggiungerebbe otto; reinserito darebbe D=1980. 220 copia il figlio e 212 sottrae ancora i nucleoni emessi invece di riaggiungerli.

Hint: Prima decodifica il figlio, poi ricostruisci il genitore.

Fonte SHA256 f1d0e6c098029216bfa7a589f7904ee7049054becbf36c8f8ebf17ba4b600897. Candidato SHA256 91a2ba7eba87c1068fb395eb94df5552407729cce63d7c156f3cbc2ff369034a. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-15 — Offset e conteggio di nucleoni

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. D=g A_f+b. A: A₀=220,n=1,D=433. B: A₀=228,n=2,D=441. C: n=1,D=441. Quanto vale A₀,C?

Procedimento d’autore: A e B hanno A_f=216 e 220. Le differenze danno g=(441−433)/(220−216)=2 e b=1. In C la lettura uguale a B indica lo stesso figlio A_f=220, ma un solo evento: il genitore è 224, diverso da quello di B.

Formule: g=2;  b=1;  A_{f,C}=\frac{441-1}{2};  A_{f,C}=220;  A_{0,C}=224.

Distrattori e controprove: 449/2 omette l’offset e non è un numero di massa intero; 444 omette il guadagno dopo aver sottratto b. 220 copia il figlio senza i quattro nucleoni emessi. La stessa lettura finale non impone lo stesso genitore se cambia n.

Hint: Separa il modello del display dal bilancio della catena.

Fonte SHA256 44fcf0244b5e69bef91646b873e540bf226d500d7695b8282eca27916e9c58ee. Candidato SHA256 4f62150df002b45aae2975dd345560acbbf3aa463aa7987298e82903065afcd2. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-alpha-mass-number-16 — Un vincolo che fissa un solo conteggio

Si studia il bilancio dei nucleoni in una catena assegnata di n decadimenti α, senza altre trasformazioni. A₀ e n sono interi positivi, A₀>4n. I numeri atomici e gli stati energetici compatibili con tutti i passaggi sono assunti nei dati: tale compatibilità non si deduce dalla sola disuguaglianza A₀>4n. Ogni α emessa è un nucleo di elio con due protoni e due neutroni. A_f è il numero di massa del figlio finale, non la sua massa in kg. Le prove riguardano preparazioni distinte. Fra preparazioni A₀=220n. Si misura A_f=216. Quanto vale n?

Procedimento d’autore: Sostituendo il vincolo, A_f=220n−4n=216n. La misura 216 impone n=1 e quindi A₀=220. Non è una misura ridondante: identifica una sola coppia intera positiva nel dominio assegnato.

Formule: A_f=216n;  216n=216;  n=1;  A_0=220.

Distrattori e controprove: Due eventi darebbero A_f=432, non 216. 216 copia il risultato senza dividere per il coefficiente; un mezzo viola l’integralità. Non rimane una scala continua libera.

Hint: Inserisci il vincolo prima di controllare quante soluzioni intere restano.

Fonte SHA256 e53a3b4f8221d5efa2f368954b2c62ee7022b2f0ead0968c6ec117c86c34ea19. Candidato SHA256 81a01e6185c21399edfb2787c8f46cdc5b0bc4e8925e5d4e3702028fa4b43a17. Skill reale C5-L08. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 b095efae7ac87676c6a5ed1a60430b61c2e4d5702b2950ae4caaefad11d8661e. Package file SHA256 c522029d84de051096d037d4168a313e11ab316c46301b0ba2f1cb072592f807. Binding file SHA256 16bb43a1299ed28c365953312d56041333f915aaa99e84ee2a5197ef4edd9134. Strutturale SHA256 388f89222601ca07bbaf92fb9270fc7ddb772395e3c16487179c86a9deebbaf3. Manifest asset-only SHA256 0e0b35d5cc6f0b1edc0cb3c5e8d123035e7f40b1f586a4d789c69fa41d9627c0.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B deve leggere questi finali contro la propria primaria distinta prima del congelamento scientifico.

Parametrizzazione esplicita della nuova edizione: nei casi 11–15 il secondo genitore iniziale passa dal valore 10 della fonte al valore 228. I compiti rimangono rapporto, media, inversa e tarature con conteggi interi; il target del 13 è 55/54 e la lettura del 14 è 660. Nel 15 i riferimenti 433 e 441 corrispondono a figli 216 e 220; la prova C mantiene lettura 441 e n=1. La scelta di genitori iniziali pesanti evita di suggerire esempi di catene leggere specifiche senza dati energetici. Non si identifica un isotopo né si deduce l’accessibilità energetica da A₀>4n: resta un’ipotesi dichiarata. I binding mantengono i veri hash originali per la provenienza, senza trattare il nuovo testo come la fonte immutabile.

Nota geometrica d’autore: i quattro cerchi schematici rappresentano due protoni e due neutroni, non raggi nucleari in scala. I punti del pannello centrale hanno x=150+110n e y=1000−25(4n), per n interi 1/2/3 e perdite 4/8/12; l’origine aperta è un riferimento di bordo. Le barre finali 324/330/327 rappresentano i numeri finali assoluti 216/220/218, con origine comune a zero e scala 3/2 coordinate per nucleone, senza troncamento dell’asse. La prima resa con lettere p/n scure è conservata con manifest; sono cambiate solo fill e font-size delle quattro lettere, coordinate e altre geometrie identiche. Nuove due assembly/import e nuovo PNG nativo completo 640×1600 terminati davvero0 e letti con XML; nessuna sovrapposizione osservata, SCI distinta NOT_RUN dall’autore.
