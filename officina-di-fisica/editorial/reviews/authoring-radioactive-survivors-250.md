# Authoring DRAFT — radioactive-survivors-250

Tutti gli 80 prompt originali A250–254 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U7-02. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U7-02 SHA256 43ad92dba82bc16829a60f11071965f30bf0d8e115def3c1dc5eb2a3e229aeb7. Le quantità statistiche sono distinte dai conteggi di eventi di un singolo nucleo; esponenti sempre adimensionali e parametri costanti entro una preparazione.

Entrambe le primarie sono state congelate prima dell’autoria: A per B255–259 SHA 5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4 su d0628ef617dc36ac03d018a854de21fdb3da4f28; B per A250–254 SHA 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2 su 7518f76e54b9d05ab1b03548e6113339afd40db9, mai aperta dall’autore A. Nessun candidato, opzione, chiave, hint, solutionSteps o SVG B255–259 letto durante l’autoria A.

Letta integralmente la lezione reale C5-L08 «Una popolazione di nuclei che cambia nel tempo» al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, comprese formule e figura storica C5-emivita.svg. Copre esplicitamente popolazione media, emivita, attività, alfa/beta/gamma e condizioni del rivelatore. Skill primaria C5-L08, prerequisiti reali C1-L001/C5-L08. Nessun ID inventato.

Autore soltanto: DRAFT, SCI distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Import canonico ROOT in sola lettura su SQLite temporaneo con timeout originale: 16 nuovi e poi 0 nuovi/16 invariati; 991 pubblicati e storico conservati. Nessun credito di integrazione attribuito dall’autore.

SVG-only effettivamente renderizzato in browser nativo, XML e PNG completo letti dopo exit 0 reale del processo. Mutex condiviso e guardia ≥2 GiB rispettati. UI prodotto locale vietata e NOT_RUN; replay a 320px riservato al runner canonico. Le figure mostrano grandezze fisiche e non metriche in pixel.

## AR-u7-radioactive-survivors-01 — Dopo una sola emivita

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. Con n₀=64 e t=1 h, quanto vale N nelle unità 10⁶ nuclei? Inserisci n.

Procedimento d’autore: Un’ora è una emivita, quindi la frazione media sopravvissuta è 1/2. Dei 64 milioni iniziali ne restano in media 32 milioni. L’esponente è u=1, non una durata dimensionata lasciata dentro la potenza.

Formule: u=\frac{t}{1\,\mathrm h};  u=1;  n=64\,2^{-1};  n=32.

Distrattori e controprove: 64 milioni ignorerebbe il decadimento; 128 crescerebbe senza una sorgente di nuclei. Sedici milioni richiederebbe due emivite. Il valore atteso non significa che ogni prova restituisca esattamente 32 milioni.

Hint: Conta quante emivite trascorrono, poi dimezza.

Fonte SHA256 3d4a9982b87d2f5d88c303bd43fd6b8fcb74792b0d5d5cfacbcb35033245cf23. Candidato SHA256 0517fb903908b419d69824e591faed380da3e99cd2ab2d074450261f8b05706c. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-02 — Un conteggio medio non è un tasso

Quale indicazione di unità è adatta al numero medio di nuclei genitori residui N?

Procedimento d’autore: Un numero di nuclei è un conteggio puro. Si può usare il milione di nuclei come scala, senza introdurre una nuova dimensione. Un valore atteso può essere non intero: non è un singolo esito sperimentale frazionario.

Formule: [N]=1;  n=\frac{N}{10^6\,\mathrm{nuclei}}.

Distrattori e controprove: Bq e nuclei/s descrivono tassi di trasformazione, non una popolazione. Il secondo è tempo e il joule energia. Non si aggiunge un secondo al numero di nuclei per il solo fatto che cambia nel tempo.

Hint: Distingui quanti genitori rimangono da quanti si trasformano al secondo.

Fonte SHA256 8cd76dbdae067859d21e9acdab99fedd145e1e2c123c75082c6eedd908284bea. Candidato SHA256 86cc49732b3a2c71f911ce207ed9054f31ad1f27bf9e823edd8e3cad41c90f4d. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-03 — Che cosa dice una emivita di due ore

Caso autonomo: un radionuclide ha T½=2 h, senza nuova produzione di nuclei genitori. Quale significato statistico è corretto?

Procedimento d’autore: L’emivita fissa la frazione media residua dopo ciascun intervallo di due ore. Non assegna un orario a ogni nucleo. Dopo quattro ore il modello dà ancora un quarto della popolazione media iniziale, non zero.

Formule: N(2\,\mathrm h)=N_0/2;  N(4\,\mathrm h)=N_0/4.

Distrattori e controprove: La vita del singolo nucleo è casuale. Per una sola specie senza produzione l’attività segue la popolazione e si dimezza, non raddoppia. L’emivita è proprietà del radionuclide nelle condizioni del modello, non della quantità di campione.

Hint: L’emivita riguarda una frazione statistica, non un tempo di scadenza individuale.

Fonte SHA256 b99b8bb4de89b653a523eeed77cbb6bdfab4a24dce071a61d564d56a5269aee0. Candidato SHA256 6d049c112d6ca93cf77ac777e40998ec3f8d6b3506dbdeda01ed0030f1bb65e7. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-04 — Dimezzare il campione iniziale

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. A ha n₀=64 e t=1 h; B ha n₀=32 allo stesso tempo. Come cambia N?

Procedimento d’autore: La frazione residua resta un mezzo. A dà 32 milioni, B dà 16 milioni. Il decadimento è esponenziale nel tempo ma lineare nella popolazione iniziale a tempo ed emivita fissati.

Formule: n_A=64/2;  n_A=32;  n_B=32/2;  n_B=16.

Distrattori e controprove: 64 inverte la dipendenza dal campione iniziale; otto introduce un ulteriore dimezzamento. Trentadue ignora il nuovo ingresso, mentre zero non segue da una frazione residua positiva a tempo finito.

Hint: Mantieni uguale la frazione sopravvissuta nelle due preparazioni.

Fonte SHA256 4bd965d363c87d9687341d6fac113685f2dafa8f1f4fdba73561e8fdecb6e4be. Candidato SHA256 20b2a17576356c58fa744aa09b1bdaf3b24d738afe9ee9254c30a1e1ce9e19b4. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-05 — Ricostruire la popolazione iniziale

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. Dopo 1 h si osserva il valore medio n=32. Quanto vale N₀ nelle unità 10⁶ nuclei?

Procedimento d’autore: La legge moltiplica n₀ per un mezzo. Per invertirla moltiplico n per due: n₀=64. Reinserendo questo valore si recuperano i 32 milioni medi finali; la popolazione iniziale deve essere maggiore della residua.

Formule: n_0=n\,2^u;  n_0=32\cdot2;  n_0=64.

Distrattori e controprove: Sedici applica un’altra perdita invece di invertirla. Trentadue richiederebbe tempo nullo, escluso qui; 128 predirebbe 64 milioni residui dopo un’ora.

Hint: Per ricostruire l’inizio, dividi per la frazione che sopravvive.

Fonte SHA256 5a5f8870f2f2281840c813b66a6f743df0fccea29997f03ce38802c0db9ae360. Candidato SHA256 5f29cf02c763f8eef13ac4c885be1d02eafed1ef58e3b9858df950bb9b7c9a12. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-06 — Il tempo da un rapporto esatto

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. n₀=64 e n=32. Quanto vale t in ore?

Procedimento d’autore: Il rapporto iniziale/residuo è due, dunque 2^u=2. Si riconosce u=1 senza approssimare logaritmi. La formula generale t=T½ log₂(N₀/N) richiede 0<N<N₀ per un tempo strettamente positivo.

Formule: 2^u=64/32;  2^u=2;  u=1;  t=1\,\mathrm h.

Distrattori e controprove: Due ore darebbero 16 milioni residui. Mezz’ora darebbe 32√2 milioni, non 32. Tempo zero non cambierebbe la popolazione.

Hint: Riconosci l’esponente della potenza di due.

Fonte SHA256 790d1bcd28a8098a2e2c1aafd9ed839d8ff75ca47a181a4823bd66f08c1813d8. Candidato SHA256 12cd9e49e2fc7bc8d3796fecd42d30fccdf63a38c16a8d44b5b8df24b1113e37. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-07 — Un’altra ora con lo stesso campione iniziale

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. A ha n₀=64, t=1 h; B ha n₀=64, t=2 h. Quanto vale N_B/N_A?

Procedimento d’autore: A conserva un mezzo dell’inizio, B un quarto. Le uscite sono 32 e 16 milioni: il rapporto B/A è un mezzo. Un quarto sarebbe invece N_B/N₀, un altro confronto.

Formule: n_A=32;  n_B=16;  N_B/N_A=\frac12.

Distrattori e controprove: Due inverte il rapporto. Un quarto usa l’inizio come denominatore, uno ignora l’ora aggiuntiva e zero sostituisce un calo esponenziale con una scomparsa completa a tempo finito.

Hint: Scrivi prima entrambe le popolazioni residue.

Fonte SHA256 aeb60473393624d3092c1358c7ea0c5ee621a81dafe595532e27d47bc356f528. Candidato SHA256 7094176d0760d29292aa378740b5e5cb2d405724ab50a7e9ebcfbde6cb8224bf. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-08 — Lo scarto di una proposta senza decadimenti

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. Con n₀=64 e t=1 h viene proposto N=64 milioni. Quanto vale proposta meno corretto?

Procedimento d’autore: La legge dà 32 milioni medi residui. La proposta ripete l’inizio e supera il corretto di 64−32=32 milioni. Il rapporto due è puro e non risponde alla domanda sullo scarto nella scala del conteggio.

Formule: \delta n=64-32;  \delta n=32.

Distrattori e controprove: −32 cambia l’ordine della sottrazione; due è un rapporto. Sessantaquattro copia la proposta e zero la accetta senza confrontarla col modello.

Hint: Sottrai nel verso richiesto, usando la stessa scala di conteggio.

Fonte SHA256 cdb0bc1c609e89913664c5c6597ae9757beafd06ce4fc1e2127afbb5c26ec9ed. Candidato SHA256 90fc3d8e3c6e55f0f37414594bb038f83d8c92bcbc98283780ddf100367f1010. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-09 — L’inversa simbolica conserva il tempo puro

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. N e t sono noti. Quale formula isola N₀ con u=t/(1 h)?

Procedimento d’autore: Divido N=N₀2^(−u) per la frazione positiva 2^(−u). L’inversa è N₀=N2^u. Il tempo entra soltanto tramite il rapporto adimensionale u; non si eleva due a una grandezza espressa in ore senza normalizzarla.

Formule: N_0=N\,2^u;  u=\frac{t}{1\,\mathrm h}.

Distrattori e controprove: Il segno negativo riapplica il decadimento. Il reciproco del conteggio non ricostruisce la popolazione e u o 1/u non sostituiscono l’esponenziale. Per u>0 l’inversa deve restituire N₀>N.

Hint: Inverti il fattore esponenziale, senza cambiarlo in un fattore lineare.

Fonte SHA256 ef3da607972f21c7f4ee293cfdd1fac94a5588f7e29b1c31ab4a3014524190b8. Candidato SHA256 c9e3b9874a6009c0736e01f945a57d4b2e9aeeff21991b2444c0c82d62c4c2c9. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-10 — Cambiano popolazione iniziale e durata

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. Fra prove N₀,B=κ₁N₀,A e t_B=κ₂t_A, con fattori positivi. Definiamo δ=(κ₂−1)u_A. Quanto vale N_B/N_A?

Procedimento d’autore: Il rapporto degli ingressi produce κ₁. Nel rapporto delle frazioni residue si sottraggono gli esponenti: u_B−u_A=(κ₂−1)u_A=δ. La modifica del tempo agisce nell’esponente, non come un semplice inverso della durata.

Formule: \delta=(\kappa_2-1)u_A;  N_B/N_A=\kappa_1 2^{-\delta}.

Distrattori e controprove: Prodotto e quoziente κ₁κ₂ o κ₁/κ₂ non sono leggi esponenziali nel tempo. κ₁ non cambia l’emivita e non entra nell’esponente. La somma darebbe due per preparazioni identiche.

Hint: Forma il rapporto di due potenze prima di semplificarne gli esponenti.

Fonte SHA256 d3a101f78d5bf819962f5020a5e2f90f339793599289b634fe1fc9a7c6c058ff. Candidato SHA256 4e3a401156d2362849182826468de1c477ab87cdfb5b985c4a2b3688ced9dbec. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-11 — Meno genitori iniziali e più tempo

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. A: n₀=64, t=1 h. B: n₀=32, t=2 h. Quanto vale N_B/N_A?

Procedimento d’autore: A conserva 32 milioni. B conserva un quarto di 32, cioè 8 milioni. Il rapporto 8/32 è un quarto: sia il dimezzamento iniziale sia l’ora aggiuntiva forniscono un fattore un mezzo.

Formule: n_A=32;  n_B=8;  N_B/N_A=\frac14.

Distrattori e controprove: Un mezzo considera una sola modifica; quattro inverte il confronto. Un ottavo è N_B/N₀,A, non il rapporto con N_A; uno ignora entrambi gli effetti.

Hint: Ogni preparazione ha la propria popolazione iniziale.

Fonte SHA256 e41adcc260e7a9405ac95cca38031de30d735787f274dfa9e22d23d4aacedcba. Candidato SHA256 8b82ca1bb99e3607c1c40a55f1bdb76bc63b229c7bbe44d14d1aa27cdb684c2f. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-12 — Media fra due popolazioni attese

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. A: n₀=64, t=1 h. B: n₀=32, t=2 h. Qual è la media aritmetica dei due N con pesi uguali?

Procedimento d’autore: Le uscite sono 32 e 8 milioni. La semisomma è 20 milioni. Ai dati medi n₀=48 e u=3/2, la legge darebbe invece 48/(2√2)=12√2 milioni. Non serve decimalizzare la radice per riconoscere le due operazioni diverse.

Formule: \overline n=\frac{32+8}{2};  \overline n=20;  n_{\rm dati\ medi}=12\sqrt2.

Distrattori e controprove: Quaranta è la somma, dodici la semidifferenza e otto ripete B. Il valore 12√2 è esatto, ma si riferisce a una terza preparazione agli ingressi medi, non alla media richiesta.

Hint: Esegui il decadimento in ciascuna prova prima di fare statistica.

Fonte SHA256 553810f763631d514493e19d3f9b41aca2eee044d0d8c36797c6e19b227fae24. Candidato SHA256 653fc39845536e8fcd6215454590bd883617e15ffc0d8d8cbd68265c5882d7ed. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-13 — Il tempo per il bersaglio ridotto

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. A: n₀=64, t_A=1 h. In B si prepara n₀=32 e si vuole N_B=N_A/4. Quanto vale t_B/t_A?

Procedimento d’autore: A dà 32 milioni, quindi il bersaglio è 8 milioni. Dal nuovo inizio di 32 milioni deve sopravvivere un quarto: occorrono due emivite, cioè t_B=2 h. Il rapporto delle durate è due.

Formule: n_B=8;  2^{u_B}=32/8;  u_B=2;  t_B/t_A=2.

Distrattori e controprove: Un’ora darebbe 16 milioni e quattro ore ne darebbero 2. Un mezzo inverte il rapporto delle durate e un quarto copia il rapporto delle uscite.

Hint: Confronta il bersaglio con la nuova popolazione iniziale, non con quella di A.

Fonte SHA256 9e3434c49df8717022724d5da646ad0dacb0948bc9a9dab14270c70aaca68076. Candidato SHA256 518092b282e61342b27c9b9c3f2c0ecedcc68c67dbe20fc8783b4be8a32ef53f. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-14 — Taratura proporzionale del conteggio medio

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. Un display continuo D=g n legge 96 per n₀=64 e t=1 h. In B legge 24 dopo 2 h. Quanto vale N₀,B nelle unità 10⁶ nuclei?

Procedimento d’autore: Il riferimento produce n=32 e fissa g=96/32=3. La lettura 24 indica n_B=8. In due ore sopravvive un quarto: l’inizio era n₀,B=8·4=32. Il numero sul display non è già un numero di milioni di nuclei.

Formule: g=3;  n_B=24/3;  n_B=8;  n_{0,B}=32.

Distrattori e controprove: 96 milioni tratterebbe D come n e predirebbe D=72 dopo due ore. Otto omette la ricostruzione iniziale; 128 darebbe D=96 nello stesso intervallo.

Hint: Elimina il guadagno prima dell’inversa del decadimento.

Fonte SHA256 d998204d688d7d69b15f96fe65cf227aabe1c20e196b6806fabcf3edcee0b8f0. Candidato SHA256 d54ea392d0794a61c5490769564a1acbba978f188cff929b10d0acde424c8f95. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-15 — Guadagno e offset prima del conteggio

Un campione chiuso contiene un solo radionuclide genitore, senza nuovi apporti o produzione di genitori. N₀ è il numero iniziale e N(t) il numero medio atteso di genitori non ancora decaduti; non è la previsione deterministica di un singolo conteggio. L’emivita è T½=1 h. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e n=N/(10⁶ nuclei). Quindi n=n₀ 2^(−u). Le preparazioni confrontate sono distinte e hanno dati finiti. D=g n+b. A: n₀=64, t=1 h, D=65. B: n₀=32, t=2 h, D=17. C: t=1 h, D=33. Quanto vale N₀,C nelle unità 10⁶ nuclei?

Procedimento d’autore: I riferimenti hanno n=32 e 8. Il guadagno è (65−17)/(32−8)=2 e l’offset è 1. La lettura 33 corrisponde a n_C=16; un’ora prima la popolazione era doppia, n₀,C=32.

Formule: g=\frac{65-17}{32-8};  g=2;  b=1;  n_C=\frac{33-1}{2};  n_C=16;  n_{0,C}=32.

Distrattori e controprove: 33 milioni omette l’offset e ricostruirebbe D=34. Sessantaquattro omette il guadagno dopo aver tolto b; sedici copia il residuo, senza tornare all’istante iniziale.

Hint: Ricostruisci due leggi distinte: display e decadimento.

Fonte SHA256 8fdf041f056cd31a901dea2791239ed4d105599df34d749770a84609899d9e48. Candidato SHA256 726bd06f5a72b1389f089e75662eced23c0258d0ef77b1cd8a7591b2ec621563. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-survivors-16 — Due tempi rivelano anche l’emivita

Caso autonomo: un campione chiuso ha un solo genitore radioattivo, emivita costante sconosciuta e nessuna nuova produzione. Si misurano valori medi N(1 h)=48 milioni e N(3 h)=12 milioni. Quanto vale N₀ nelle unità 10⁶ nuclei?

Procedimento d’autore: Definisco q come frazione media sopravvissuta in un’ora: 0<q<1. Allora 48=n₀q e 12=n₀q³. Dividendo, q²=12/48=1/4. Il ramo positivo dà q=1/2: l’emivita risulta 1 h dai dati, non era stata assunta. Quindi n₀=48/(1/2)=96.

Formule: q^2=\frac{12}{48};  q=\frac12;  n_0=\frac{48}{q};  n_0=96.

Distrattori e controprove: 48 milioni copia la prima misura e ignora l’ora già trascorsa. 192 milioni a q=1/2 darebbe N(1 h)=96 milioni. Il ramo q=−1/2 non è una probabilità di sopravvivenza; non si accetta una radice negativa.

Hint: Forma il rapporto fra le due letture: copre due ore, non una.

Fonte SHA256 efd00b80149da7ffe53f07bc544c50bfc005b65df3fad4a8483fcf05fcbac963. Candidato SHA256 eb70bec39bc18248f94736521a2bd3c3eb2d53a14a21a3415fd5455d2e5a7e0a. Skill reale C5-L08. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 17d4e56567224fc449f9afb792efc2aa02061fa5cf3f99ee160e1f7c7b5e1239. Package file SHA256 419659d939f02fdb7a5f01bf69eaab16f2a13c8c38c724c57b14680dd291bfda. Binding file SHA256 b093959044081060848abf4b533186399b3a6be132e90c215825ae503facc812. Strutturale SHA256 c772db4e25f3bc3bc35bc3008b5b830f49bb8d495b1c7183854bbc87c7a6ef1b. Manifest asset-only SHA256 a2bd70471c15bc6130816d1ee460d69fcc43354867731932ef571e1c980d05d4.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B deve leggere questi finali contro la propria primaria distinta prima del congelamento scientifico.

Nota geometrica d’autore: le barre iniziali 320/160/80/40 rappresentano 64/32/16/8 milioni alla stessa scala 5 coordinate per milione. La curva usa x=150+110 t[h] e y=1000−5 N[milioni], con punti esatti (0,64),(1,32),(2,16),(3,8). Nel pannello finale le barre 288/144/36 rappresentano 96/48/12 milioni alla nuova scala comune 3; il cambio di preparazione è dichiarato. La tinta ocra distingue la ricostruzione iniziale dalle due misure blu. Tutte le etichette e gli assi sono stati letti nel PNG nativo completo 640 × 1600 e nel XML, senza sovrapposizioni osservate. Coordinate tecniche solo in questa nota, mai metriche responsive visibili allo studente.
