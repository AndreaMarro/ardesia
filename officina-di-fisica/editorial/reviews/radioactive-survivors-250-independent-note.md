# Revisione indipendente radioactive-survivors-250

Primaria prompt-only 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: 58e478edc733fb198a7711e2a5fdfa8c7f46d3537f331562cf531737f04ed4bc. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione 5a55fce680ea1b430045fd56a3f27a313924f250, separata dalle prove automatiche.

Il catalogo C5 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; C5-L08 copre popolazioni, attività, emivita e trasformazioni α/β/γ; C1-L001 offre le fondazioni dimensionali effettive. I prerequisiti della lezione L08 nel catalogo sono vuoti.

XML e PNG indipendente 640×1600 letti per intero. Prime barre da x150 a scala5 coordinate per milione:320/160/80/40 per64/32/16/8. Curva origine(150,1000),110 coordinate/h e5 per milione, N=64·2^(−t/h), punti t0/1/2/3 a y680/840/920/960. Pannello finale di altro campione a scala3 per milione:288/144/36 per96/48/12. Nessuna etichetta attraversata, assi/legende completi.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

I modelli pre-key restano preservati con i loro 25 controlli fonte e 600 rifiuti finiti/esatti reali. Dopo la lettura è stato aggiunto soltanto strict=True a sympify nel guardiano numerico per respingere stringhe senza valutarle: formule costitutive, inverse e taratura restano identiche in AST. La primaria originale non viene riscritta; la sua parola bilineare in25012 è corretta nella nota finale come lineare in N₀ ed esponenziale nel tempo. Nei25411–15 i nuovi dati del candidato sono ricalcolati separatamente, conservando i diversi risultati della fonte originale nella primaria.

Rilettura finale5a55fce6: definizione n₀ nel25016; rimozione della legge dal prompt25203; parentesi sul solo distrattore25212 e definizione n₀/u nel25216. Strictdiff limita i cambi ai quattro record indicati, nessuna chiave corretta, formula o asset mutato. I native conservano i veri ref precedenti sugli stessi byte, senza retag.

## AR-u7-radioactive-survivors-01

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: Per un solo genitore senza apporto, ciascuna emivita dimezza il valore medio. Pongo x=t/(1 h): N=N₀ 2^(−x). Con x=1, 64/2=32 milioni. Il valore medio non è la garanzia che ogni singolo campione dia esattamente quel conteggio.

Distrattori: 64 omette il dimezzamento; 128 richiederebbe apporti; 16 appartiene a due emivite. Il valore atteso non è un conteggio deterministico.

Didattica: Legge motivata e valore medio distinto da singolo esito.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 487d3e4db069f8e1ab3bfce73556fa5554ec22e7c33fd008d6814c170ac1230a.

## AR-u7-radioactive-survivors-02

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: N è un conteggio di nuclei: dimensionalmente è un numero puro, con etichetta nuclei o multipli come 10⁶ nuclei. Bq invece misura trasformazioni per secondo e non una popolazione.

Distrattori: Bq e nuclei/s sono tassi, s tempo e J energia. Nuclei o milioni di nuclei etichettano un conteggio adimensionale.

Didattica: Unità ricostruita e conteggio distinto dal tasso.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 1f43b26ca09a6a589b71882fed2f7f8c5f2160c284671f13f056f2201c084625.

## AR-u7-radioactive-survivors-03

Ipotesi: Caso autonomo: un solo genitore con emivita 2 h, senza nuova produzione. Metà residuo medio ogni 2 h; non una scadenza deterministica di ogni nucleo.

Derivazione manuale: Dopo due ore il numero medio di nuclei genitori non decaduti è metà del valore iniziale. Non significa che tutti decadano dopo due ore, né che un singolo nucleo abbia una scadenza deterministica.

Distrattori: Una scadenza uguale per ogni nucleo è falsa; dopo quattro ore resta un quarto in media. Attività e popolazione si dimezzano senza nuova produzione.

Didattica: Caso autonomo o legge riconosciuta senza risposta già anticipata.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma da38914dd03a70b887de5ee89cf88481140d5a54e0b50d4a8afbd86f02977b0c.

## AR-u7-radioactive-survivors-04

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: A tempo identico il fattore esponenziale è identico. Portare N₀ da 64 a 32 milioni moltiplica N per 1/2: da 32 a 16 milioni.

Distrattori: 64 inverte la dipendenza dall’inizio; 8 aggiunge una perdita; 32 ignora il nuovo ingresso. Il modello non dà zero a tempo finito.

Didattica: Confronto controllato a un parametro fissato.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 3e5bbadb7c3682936ef4e1ec600f147d632e527bfdb5d0af640dcedbc7f5ea0a.

## AR-u7-radioactive-survivors-05

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: Da N=N₀/2 con t=1 h moltiplico entrambi i membri per 2: N₀=2 N=64 milioni. Popolazione iniziale maggiore del residuo, come richiesto da t>0.

Distrattori: 16 ripete il dimezzamento anziché invertirlo; 32 come inizio richiederebbe tempo nullo; 128 darebbe 64 milioni dopo un’ora.

Didattica: Prima inversa reinserita nella relazione diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 3e5b9f3d6a357a579f8923bdc9a1302a546a37b197723b832c8abba098050b81.

## AR-u7-radioactive-survivors-06

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: 32/64=1/2=2^(−x), dunque x=1 e t=1 h. Più in generale t=T½ log₂(N₀/N), positivo soltanto per 0<N<N₀.

Distrattori: Due ore danno 16 milioni; mezz’ora dà 32√2 milioni. Un tempo positivo richiede un residuo strettamente fra zero e inizio.

Didattica: Seconda inversa con denominatori e domini verificati.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma dda5941e499df483cf99e1977bcb32a9d26d7962aa03a764b53f13143470e519.

## AR-u7-radioactive-survivors-07

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: A pari N₀ il rapporto è 2^(−2)/2^(−1)=1/2. Le letture sono 16 e 32 milioni: il tempo raddoppiato non dimezza sempre N per una legge inversa, qui aggiunge una sola emivita.

Distrattori: Due inverte B/A; 1/4 confronta B con N₀; uno ignora l’ora aggiuntiva e zero confonde media esponenziale e scomparsa completa.

Didattica: Due uscite calcolate prima del rapporto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma f8fad40cc80fad6df52a4d4d4c6833fcc9f2dde7ccc1708db6a328c374ddd1c5.

## AR-u7-radioactive-survivors-08

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: Il proposto 64 meno il corretto 32 vale+32 milioni. Il segno positivo indica una sovrastima; non si prende il valore assoluto senza richiesta.

Distrattori: −32 inverte la sottrazione; due è un rapporto; 64 ripete la proposta e zero non la confronta col modello.

Didattica: Differenza ordinata distinta dal rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 605175debe8d21c31f261ed9fe66dc2295f6876473aea97d921658a111149f58.

## AR-u7-radioactive-survivors-09

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: Moltiplico N=N₀ 2^(−t/T½) per 2^(t/T½): N₀=N 2^(t/T½). L’esponente è adimensionale; con t numerico in ore e T½=1 h si abbrevia N 2^t.

Distrattori: Il segno negativo riapplica il decadimento. Il reciproco del conteggio e le espressioni lineari nel tempo non ricostruiscono N₀.

Didattica: Inversa simbolica e dimensioni esplicite.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 8fdff3c1bbf38a08d2f955fd238f150bdfebc3f548ed422fd2a2ccc7e7cc7316.

## AR-u7-radioactive-survivors-10

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: Il quoziente completo è κ₁ 2^(−(κ₂−1)t/T½). Non diventa κ₁/κ₂: il tempo entra in un esponente. Entrambe le preparazioni devono conservare t>0 e popolazione positiva.

Distrattori: Prodotti e quozienti dei soli fattori non conservano l’esponenziale. κ₁ scala l’inizio e non l’emivita; la somma fallisce per prove identiche.

Didattica: Fattori nella legge effettiva, non in un’analogia impropria.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma a715ca617745edfcf475e5442f9e56acc4bd669b71c3529b43dde8158878b5fd.

## AR-u7-radioactive-survivors-11

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: A dà 32 milioni; B dà 32/4=8 milioni. Quindi N_B/N_A=8/32=1/4: si compongono dimezzamento della popolazione e un’ulteriore emivita.

Distrattori: Un mezzo trascura una delle due modifiche; quattro inverte il rapporto; un ottavo usa N₀, A al denominatore. Le uscite sono 8 e 32.

Didattica: Entrambi i nuovi ingressi considerati.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 41d3e30b8d0252daf474531e1e8196f4c9da0bde20a0f1bcd0c5d5cf71c7a687.

## AR-u7-radioactive-survivors-12

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: Le uscite indipendenti sono 32 e 8 milioni; media 20. Agli ingressi medi 48 milioni e 3/2 h si ottiene 12√2, diverso da 20. La legge è lineare in N₀ ma esponenziale nel tempo: la parola bilineare nella primaria congelata era impropria, qui corretta senza cambiare alcun conto o modificare la primaria.

Distrattori: 40 somma, 12 prende la semidifferenza e 8 ripete B. 12√2 è il modello agli ingressi medi, distinto dalla media 20.

Didattica: Media delle uscite e ammissibilità degli ingressi medi distinte.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma bdd6f4d8bb2153b1fb631f11237956b10f0ef0cf5cd9edd3825558f608ecb5f7.

## AR-u7-radioactive-survivors-13

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: Il target è 32/4=8 milioni. Con N₀, B=32 occorre 2^(−x_B)=1/4, dunque t_B=2 h e t_B/t_A=2.

Distrattori: Un’ora dà 16 milioni e quattro ore ne danno 2. Un mezzo inverte le durate; un quarto copia il fattore delle uscite.

Didattica: Bersaglio ricostruito prima dell’inversa.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 9750f056a42f89dde2f6d38cd8523b8b9cbfc4b4b844e5994298acf8d015f408.

## AR-u7-radioactive-survivors-14

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: Il riferimento fisico è 32 milioni: il guadagno è 96/32=3 unità strumentali per milione. La nuova lettura 24 corrisponde a 8 milioni residui; a 2 h N₀=4·8=32 milioni.

Distrattori: 96 milioni da display non decodificato darebbe D=72. Otto è il residuo, non l’inizio; 128 darebbe D=96.

Didattica: Guadagno rimosso prima del bilancio fisico.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma c89f4b5bc83dc55765dc2edd7c943f818065e9e0d9764dc925e0a39ca0bf6133.

## AR-u7-radioactive-survivors-15

Ipotesi: Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.

Derivazione manuale: Le uscite fisiche dei riferimenti sono 32 e 8 milioni. Sottraggo: a=(65−17)/(32−8)=2, poi b=65−2·32=1. La prova 33 dàN=(33−1)/2=16 milioni e a 1 h N₀=32 milioni.

Distrattori: 33 milioni omette l’offset e predice D=34; 64 omette il guadagno dopo b; 16 si ferma al residuo.

Didattica: Due riferimenti distinti identificano guadagno e offset.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma db237e7b46dd94ecfd25ecdf2728746e18db399a5d7c1ec2c0439db861bba8ce.

## AR-u7-radioactive-survivors-16

Ipotesi: Caso autonomo con emivita ignota costante e misure medie a 1 h e 3 h. q è la frazione oraria positiva minore di uno. n₀=N₀/(10⁶ nuclei) è definito nel finale 5a55fce6; non si importa l’emivita di un’ora dal prefisso degli altri quesiti.

Derivazione manuale: Fra 1 e 3 h il rapporto residuo è 12/48=1/4: due ore sono due emivite, dunque T½=1 h. Retrocedendo dall’ora 1 all’origine moltiplico 48 per 2: N₀=96 milioni. È una ricostruzione di medie esponenziali, non una misura certa di singole vite. Riletto 5 a 55 fce 6: sola definizione n₀ nel primo testo; altre 15, chiavi, formule eSVG identici.

Distrattori: 48 copia la prima misura; 192 darebbe 96 milioni all’ora uno. Il ramo q negativo non è una frazione di sopravvivenza.

Didattica: Vincolo o caso autonomo risolto prima di decidere unicità e dominio.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 6c44658239d41fdb1e1914d0d73ebac03ee120876d45f535af7e32189d06a269.
