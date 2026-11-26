# Revisione indipendente radioactive-decayed-count-252

Primaria prompt-only 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: 58e478edc733fb198a7711e2a5fdfa8c7f46d3537f331562cf531737f04ed4bc. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione 5a55fce680ea1b430045fd56a3f27a313924f250, separata dalle prove automatiche.

Il catalogo C5 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; C5-L08 copre popolazioni, attività, emivita e trasformazioni α/β/γ; C1-L001 offre le fondazioni dimensionali effettive. I prerequisiti della lezione L08 nel catalogo sono vuoti.

XML e PNG indipendente 640×1600 letti per intero. Primo pannello a scala5 per milione, segmenti160+160 e80+240, entrambi totali64. Curva origine(150,1000),110 coordinate/h e5 per milione: c=64(1−2^(−t/h)), punti32/48/56 a y840/760/720. Terzo pannello a scala20 per milione: residui4/2 e cumulativi12/14, somme320 uguali per16. Nessuna sovrapposizione residua.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

I modelli pre-key restano preservati con i loro 25 controlli fonte e 600 rifiuti finiti/esatti reali. Dopo la lettura è stato aggiunto soltanto strict=True a sympify nel guardiano numerico per respingere stringhe senza valutarle: formule costitutive, inverse e taratura restano identiche in AST. La primaria originale non viene riscritta; la sua parola bilineare in25012 è corretta nella nota finale come lineare in N₀ ed esponenziale nel tempo. Nei25411–15 i nuovi dati del candidato sono ricalcolati separatamente, conservando i diversi risultati della fonte originale nella primaria.

Rilettura finale5a55fce6: definizione n₀ nel25016; rimozione della legge dal prompt25203; parentesi sul solo distrattore25212 e definizione n₀/u nel25216. Strictdiff limita i cambi ai quattro record indicati, nessuna chiave corretta, formula o asset mutato. I native conservano i veri ref precedenti sugli stessi byte, senza retag.

## AR-u7-radioactive-decayed-count-01

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: Conservo i genitori originari: N_dec=N₀−N=N₀(1−2^(−t/T½)). Dopo 1 h resta metà di 64, quindi sono decaduti 32 milioni; non aggiungo le trasformazioni dei figli.

Distrattori: 64 conta anche i sopravvissuti, 16 non è il cumulativo a un’ora e zero ignora le trasformazioni. Residuo e cumulativo coincidono soltanto al dato di un’emivita.

Didattica: Legge motivata e valore medio distinto da singolo esito.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma ec0dfede164b0fed2f940b80b5e9eddfe1c1da8dec4cb6fe0f1dd4eec2daebc1.

## AR-u7-radioactive-decayed-count-02

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: È un conteggio cumulativo di genitori trasformati, quindi numero puro etichettato nuclei, eventualmente 10⁶ nuclei. Bq è invece un tasso e non il cumulativo.

Distrattori: Bq e nuclei/s sono tassi; s è tempo e J energia. Il cumulativo conta eventi senza dividerli per una durata.

Didattica: Unità ricostruita e conteggio distinto dal tasso.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma e2faabaebfeb9eed2d759b038435ae3542f51c4eb2e2a91411d2267ffbd67d75.

## AR-u7-radioactive-decayed-count-03

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: La popolazione residua èN₀ 2^(−t/T½). La sottraggo dalla popolazione iniziale: N_dec=N₀[1−2^(−t/T½)]. Per t>0 è strettamente fra 0 eN₀ e cresce versoN₀ senza superarlo. Riletto finale 5 a 55 fce 6: il prompt non fornisce più la stessa legge richiesta nella scelta; soluzione e chiave identiche. Nel finale il prompt non anticipa più la formula che lo studente deve riconoscere.

Distrattori: Il solo esponenziale è il residuo. Il segno più e la divisione superano l’inizio; la legge lineare nel tempo non satura al conteggio iniziale.

Didattica: Caso autonomo o legge riconosciuta senza risposta già anticipata.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 95f17cf147229e51becfa0410a4f26579b1d5d60fd87d63b9e173e9c95b5112d.

## AR-u7-radioactive-decayed-count-04

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: A 1 h il fattore trasformato è 1/2. Dimezzare N₀ dimezza N_dec da 32 a 16 milioni: la dipendenza dalla popolazione iniziale è lineare.

Distrattori: 64 inverte il fattore del campione iniziale; 8 aggiunge una perdita e 32 ignora il nuovo inizio. Zero non è il valore medio con dati positivi.

Didattica: Confronto controllato a un parametro fissato.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 92693c2279b91c16ff2c86912b4520e0724f9cf5a9232ec3960368b196aba802.

## AR-u7-radioactive-decayed-count-05

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: Divido il cumulativo per la frazione trasformata: N₀=32/(1−1/2)=64 milioni. Il denominatore non è la frazione residua per tempi generali, benché coincida qui a un’emivita.

Distrattori: 16 ripete il fattore trasformato, 32 presume tutto trasformato e 128 produrrebbe 64. Al tempo zero l’inversa divide per zero ed è esclusa.

Didattica: Prima inversa reinserita nella relazione diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma ee6b352fb3f07c9fa171c5076435912f79a4321dacf6b834cf66c08dd0a666e4.

## AR-u7-radioactive-decayed-count-06

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: 32/64=1/2 è la frazione già trasformata, perciò la frazione residua è ancora 1/2. Quindi t=1 h. In generale t=−T½ log₂(1−N_dec/N₀), con 0<N_dec<N₀.

Distrattori: Due ore danno 48 milioni, tempo zero ne dà zero, mezz’ora dà 64−32√2. Il logaritmo richiede il complemento fra zero e uno.

Didattica: Seconda inversa con denominatori e domini verificati.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 6d2da4698302da76b85975aee2644cb4a0d36b7f0695594bff57a951eebf4d00.

## AR-u7-radioactive-decayed-count-07

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: A 1 h N_dec=32; a 2 h 64(1−1/4)=48 milioni. Il rapporto è 48/32=3/2, distinto dal rapporto dei residui 1/2.

Distrattori: 2/3 inverte B/A; 1/2 confronta i residui; due assume una crescita lineare temporale e uno ignora l’intervallo ulteriore.

Didattica: Due uscite calcolate prima del rapporto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma d60d235537077dbdabe29b659a082384a324fcf49e3e602005edc21039761dbd.

## AR-u7-radioactive-decayed-count-08

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: Il proposto 64 meno il corretto 32 vale+32 milioni. A un tempo finito nel modello esponenziale non sono ancora trasformati tutti i genitori in media.

Distrattori: −32 inverte la sottrazione; due è rapporto, 64 la proposta e zero una sua accettazione. Lo scarto è fra due cumulativi nella stessa scala.

Didattica: Differenza ordinata distinta dal rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma d41cc3aeaa427c09df4d0cd72d7102b8f8e73954ddf9b28d46cd480595e0b434.

## AR-u7-radioactive-decayed-count-09

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: Isolo N₀=N_dec/[1−2^(−t/T½)]. Con t>0 il denominatore èpositivo e minore di 1. Scrivere t nell’esponente richiede che sia il suo valore numerico in unità T½.

Distrattori: Moltiplicare per il complemento riduce ancora il conteggio. N_dec 2^u inverte il residuo e coincide solo a u=1; reciproci e durata lineare non ricostruiscono l’inizio.

Didattica: Inversa simbolica e dimensioni esplicite.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 933a33d0d9a0514686c18e3e0d6bf03c887e3b3f5165870f7ac09a0d508f581b.

## AR-u7-radioactive-decayed-count-10

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: Il rapporto èκ₁[1−2^(−κ₂t/T½)]/[1−2^(−t/T½)]. Non è il rapporto delle frazioni residue: occorre preservare entrambi i termini 1−esponenziale.

Distrattori: I soli fattori κ non conservano il complemento. κ₁q^(κ₂−1) è il rapporto dei residui; il reciproco scambia A e B.

Didattica: Fattori nella legge effettiva, non in un’analogia impropria.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma b96f0223e518d8954cec3b9ca7ab154b2fce38dc85f7cdb0989e8af6d5a5df1f.

## AR-u7-radioactive-decayed-count-11

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: A ha 32 milioni trasformati; B ne ha 32·3/4=24. Il rapporto è 24/32=3/4, dato il dimezzamento di N₀ e l’aumento del tempo.

Distrattori: Un mezzo segue solo l’inizio; 3/2 solo la frazione trasformata; 4/3 è il reciproco e uno presume una compensazione inesatta.

Didattica: Entrambi i nuovi ingressi considerati.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma afa54bf77af3e4e310f5aa4df0bfd8207246074899b1e9f474132683c812bc61.

## AR-u7-radioactive-decayed-count-12

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: La media è(32+24)/2=28 milioni. Le medie degli ingressi 48 milioni e 3/2 h darebbero 48−12√2 milioni, non 28; si mediano le letture già calcolate. Riletto anche il solo distrattore con parentesi(48−12√2) nel finale 5 a 55 fce 6, chiave e formule identiche.

Distrattori: 56 somma, quattro prende la semidifferenza e 24 ripete B. 48−12√2 è il modello agli ingressi medi; 400 e 288 distinguono esattamente i quadrati rilevanti.

Didattica: Media delle uscite e ammissibilità degli ingressi medi distinte.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 2c5409026d931fce3ee87fc3c7d6add7e833d9e86fe5e2efd2e472d8fa2c7ef7.

## AR-u7-radioactive-decayed-count-13

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: Il target è(3/4)·32=24 milioni. Con N₀, B 32 la frazione trasformata deve essere 3/4, dunque residua 1/4 e t_B=2 h. Il rapporto dei tempi è 2.

Distrattori: Un’ora darebbe 16 milioni. Un mezzo inverte le durate; 3/4 copia il target delle uscite e 3/2 il rapporto delle frazioni trasformate.

Didattica: Bersaglio ricostruito prima dell’inversa.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 65d79cb7b0410a66f4fcc18d267f1e25fc1ac68e81fdb2d6722481eb02c90381.

## AR-u7-radioactive-decayed-count-14

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: Il guadagno è 96/32=3. La nuova lettura 72 dàN_dec 24 milioni. A 2 h la frazione trasformata è 3/4, dunque N₀=24·4/3=32 milioni.

Distrattori: 96 milioni segue sia dal display non decodificato sia dall’uso del residuo 1/4 e predice D=216. Ventiquattro non ricostruisce ancora l’inizio.

Didattica: Guadagno rimosso prima del bilancio fisico.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 79b4fa66d247058d4e96a7afab6d9644103cc0ebc6256f9fa1f23c8defb7d0e8.

## AR-u7-radioactive-decayed-count-15

Ipotesi: Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.

Derivazione manuale: Riferimenti fisici 32 e 24 milioni: a=(65−49)/(32−24)=2 e b=1. La lettura 33 dà 16 milioni trasformati; con 1 h N₀=32 milioni.

Distrattori: 33 milioni omette b e predice D=34; 64 omette g dopo b; 16 è il cumulativo, non la popolazione iniziale.

Didattica: Due riferimenti distinti identificano guadagno e offset.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 0d9018f5ffa300db84314a0a7769e175905bcf48f7217b363c23ff454f9f2ea8.

## AR-u7-radioactive-decayed-count-16

Ipotesi: Caso autonomo: emivita 1 h assegnata, N₀ ignoto e due cumulativi medi 12/14 milioni a distanza 1 h. Niente contributi dei figli. n₀ e u=t/(1 h) ora definiti prima dell’uso nel finale 5 a 55 fce 6.

Derivazione manuale: Fra i due istanti si trasformano 14−12=2 milioni. In una emivita questi sono metà dei genitori ancora presenti al primo istante, che sono quindi 4 milioni. N₀=12+4=16; la frazione residua 4/16=1/4 impone t=2 h. Controllo all’ora 3: 16−2=14 milioni.

Distrattori: Un’ora dal campione ricostruito darebbe 8 milioni; quattro ore ne darebbero 15. Il rapporto 14/12 non è una frazione di sopravvivenza.

Didattica: Vincolo o caso autonomo risolto prima di decidere unicità e dominio.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 5e15255a20fb522fedfaf6316c9365bb9dfa0edcb39715215f84a0d114ba4168.
