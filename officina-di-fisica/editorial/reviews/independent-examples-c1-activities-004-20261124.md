# Lettura indipendente degli originali C1-E009–C1-E016

Revisore AI separato dall'autore degli originali e dall'integratore. Letti individualmente tutti gli enunciati e blocchi dalla revisione Cric `5d1dc8dc7b601aef959d10d564c75462be74708d`, percorso `officina-di-fisica/content/C1.json`; SHA-256 del file originale `0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf`. Nessun originale o candidato modificato. Gli hash seguenti sono stati fissati dopo la lettura, non dedotti da una chiave di risposta.

Esito: **8 originali PASS_AI_EXACT, 0 FAIL, 0 nuove edizioni richieste da questa lettura**. Tutti richiedono calcoli effettivi: `EXACT_MANUAL_CALCULATION`, mai `NO_STUDENT_CALCULATION`. Nessuna approvazione umana, nessuna pubblicazione: `humanApproval=NOT_RUN`, `publicationAction=NONE`, `originalEditionRetained=true`. E014 è già versione 2 nel riferimento storico; non viene riportato artificialmente a versione 1.

## Controlli individuali

### C1-E009 — Una spinta e una resistenza

SHA record `dc86fc860c30006fc3a5d25bd950e922077a371a55d9030e42bf55574b8a1695`, versione 1. Newton orizzontale: risultante `10−6=4 N`, poi `4/4=1 m/s²`. La normale compensa il peso; non serve un valore di g per il risultato orizzontale. Moto già verso destra e accelerazione positiva implicano aumento della rapidità. Ipotesi del modello: massa costante, riferimento inerziale, piano e tiro orizzontali, contatto mantenuto. Pitfall implicito: usare soltanto la trazione darebbe `2,5 m/s²`; usare attrito concorde darebbe `4 m/s²`. Non ci sono opzioni a scelta multipla.

Figura: quattro forze, versi corretti, normale e peso uguali in lunghezza. La caption limita il disegno a direzioni e versi: le lunghezze delle frecce orizzontali non costituiscono una scala quantitativa da cui ricavare forze. PASS.

### C1-E010 — La bilancia durante l'avvio

SHA record `e98cbb30546f7e519a5eab3db8839adc5031535cf44fb83e63b0e7b81bf8821f`, versione 1. Nel riferimento del suolo `N−mg=ma`: `g+a=9,8+1,5=11,3 m/s²`, `6×11,3=66+1,8=67,8 N`. Peso `6×(10−0,2)=58,8 N`; risultante `67,8−58,8=9 N=6×1,5`. La cassa resta in contatto e condivide l'accelerazione data. Normale è forza, non massa né peso invariato; nel riferimento inerziale non va aggiunta un'altra forza fittizia. Nessuna scelta multipla.

Figura: normale verso l'alto più lunga del peso, accelerazione esterna distinta dalle due forze sulla cassa. Lunghezze 81/70 px qualitativamente corrette e compatibili con il rapporto 67,8/58,8 alla risoluzione del disegno. PASS.

### C1-E011 — Partirà davvero la scatola?

SHA record `4d6042e3255513074c58ab9506e4cb22a08940dbfab276d086e7d94104d23858`, versione 1. `N=8×10=80 N`; soglia statica `(40/100)×80=32 N`. La quiete richiede `f_s=−20 N`, ammissibile perché `20<32`, con margine 12 N; accelerazione zero. L'attrito statico si adatta, non assume sempre il massimo. Usare 32 N come forza effettiva produrrebbe falsa accelerazione all'indietro `−12/8 m/s²`; usare `μ_d=0,30` sarebbe selezionare il regime di scorrimento assente. Piano e tiro orizzontali sono esplicitati; scatola inizialmente ferma. Nessuna figura/opzione. PASS.

### C1-E012 — Misurare la rigidità in verticale

SHA record `5028c3cbda1d0c5063bf599af0601f064a4d4620327fb8c20a1f5b1977de7e37`, versione 1. `150 g=3/20 kg`, `3 cm=3/100 m`; equilibrio `kx=mg`. Quindi `k=(3/20)(49/5)/(3/100)=49 N/m` cancellando il fattore 3 e semplificando 100/100. A 1 cm il richiamo è `49/100=0,49 N`. Unità controllate con Pint: forza divisa lunghezza, non forza né massa. Presupposto esplicitato nel testo: medesimo intervallo elastico lineare; allungamento dalla lunghezza naturale, non lunghezza totale. Pitfall: conversione dei cm omessa produce fattore 100 errato. Nessuna figura/opzione. PASS.

### C1-E013 — Sollevare alla stessa velocità

SHA record `6ade4da8ce703237e74507ca793e7749054375717edc7755d08f63dfac681a2b`, versione 1. Velocità costante implica tensione `12×10=120 N`. Lavoro tensione `120×3/2=180 J`, potenza media `180/3=60 W`. Controcontrollo: velocità `(3/2)/3=1/2 m/s`, dunque `T v=60 W`; peso compie `−180 J`, lavoro netto zero coerente con cinetica costante. L'energia potenziale della configurazione carico–Terra cresce di 180 J. È potenza meccanica sul carico, non consumo elettrico dell'argano; nessun rendimento implicito. Nessuna figura/opzione. PASS.

### C1-E014 — Dal lavoro alla velocità finale

SHA record `459f015486eb5c372f5b3a1d4871bcba9f7e154d8f64b529411fbb4aff564872`, versione 2. Integrale della risultante costante: `L=4×3=12 J`. Energia iniziale `(1/2)×2×1²=1 J`, finale `13 J`; `v_f²=2×13/2=13 m²/s²`. Il verso resta positivo perché la risultante accelera concordemente al moto: `v_f=+√13 m/s`. Verifica cinematica indipendente: `a=4/2=2 m/s²`, `v_i²+2as=1+12=13`.

La risposta simbolica esatta è già presente e ammissibile; `v_f≃3,61 m/s` è una successiva approssimazione esplicita. Procedura manuale: `9<13<16`; per controllare l'arrotondamento, `721²=519841<520000<522729=723²`. Dividendo per 40000 si ottiene `3,605²<13<3,615²`, quindi `3,605<√13<3,615`. Nessuna necessità di calcolatrice né requisito di eliminare il radicale. Pitfall: trascurare l'energia iniziale darebbe `√12` invece di `√13`. Nessuna figura/opzione. PASS.

### C1-E015 — Discesa con perdita nota

SHA record `9d515d5810a20bb0b2bd02db31525ef8d3edd335cac1265d15e4f9ae255bcaa8`, versione 1. Quota `1,8=9/5 m`: `mgh=2×10×9/5=36 J`; lavoro dissipativo totale `−11 J`, quindi `K_B=25 J`; `v_B=√(2×25/2)=√25=5 m/s`. Senza attrito `√36=6 m/s`, coerente con il decremento. Si assume pista fissa con normale perpendicolare al moto e che il blocco compia la discesa descritta. Non si pretende di ricostruire la distribuzione locale dell'attrito dal solo lavoro totale. Pitfall: segno positivo della perdita o uso della lunghezza del piano al posto del dislivello.

Figura: quota h verticale e livello zero alla base, A sopra B; nessuna scala metrica dichiarata. Il simbolo sollevato sopra la pista distingue il corpo dallo sfondo, non assegna un secondo dislivello né trasforma il modello in rotolamento. PASS.

### C1-E016 — La molla lancia il cursore

SHA record `b22750f9423aabb67dc536c4416362c038c43bead0485d3ec1ff42b9431c98d1`, versione 1. `x_i=−1/25 m`, `x_i²=1/625 m²`; `(k/m)=250/(1/10)=2500 s⁻²`. Energia: `v_f²=2500/625=4 m²/s²`, rapidità `2 m/s`. Controcontrollo: energia iniziale `(1/2)×250/625=1/5 J`, finale `(1/2)×(1/10)×4=1/5 J`. Molla ideale lineare, guida orizzontale liscia, partenza da fermo; peso e normale non lavorano. Rapidità non negativa; il verso va desunto dal richiamo, non dal quadrato. Pitfall: mantenere il segno meno nella compressione quadratica o dimenticare la conversione cm→m. Nessuna figura/opzione. PASS.

## Figure e provenienza

SVG letti dal Git fissato, confrontati byte per byte con `static/figures` e anche resi/visionati localmente tramite Quick Look. Questo rendering delle tre immagini non equivale a prove browser complete dei record o della pagina a tutte le larghezze.

| Figura | SHA-256 |
|---|---|
| C1-forze.svg | `23032966207743fa88c6b6c4491a80d13b9da68c1e913bd4ebd8719f610c620a` |
| C1-ascensore.svg | `94d0a446107d71a2b193ede59de57c73d4c26db7fe2dbc81e6f64dcb4cd2c8e1` |
| C1-energia.svg | `13899393ff8432b08112f3766b163b4223d5d6f3d3541630b24f5a56faa1d21b` |

## Oracolo, controprove e limiti

`examples_c1b_activity_verifier.py` usa SymPy, Fraction e Pint con razionali esatti: equazioni di Newton risolte, integrale del lavoro costante, bilanci energetici, conversioni SI e dimensioni. Non importa moduli autore né legge una chiave per ricavare i risultati. I 36 controlli comprendono 35 uguaglianze esatte e il controllo manuale della sola approssimazione dichiarata di E014.

Eseguiti: tutti i 36 controlli PASS; replay deterministico con byte canonici uguali; modifica dell'enunciato di ciascuno degli otto originali → giudizio FAIL del relativo record; omissione di ciascun ID → eccezione; directory figure vuota → FAIL precisamente dei tre esempi figurati; invarianti NONE/NOT_RUN/false per failedPublishedEdition e versione storica E014=2 verificati. Non sono stati eseguiti test con studenti, prove sperimentali o approvazioni umane. Nessun candidato o nuova edizione è stato scritto o auto-verificato.

Hash dello snapshot di consegna (i report sono identici perché nessuna revisione è necessaria):

| Artefatto | SHA-256 byte |
|---|---|
| examples_c1b_activity_verifier.py | `69778cbd9f6acec05bc9b63a6830d947a6a812f160265362bf08a640224324e8` |
| examples-c1-activities-004-originals.json | `77ca9e1d7d7963f2ccdf1a638d98dfec3166536330420a9e8ae3822d5089ecfc` |
| examples-c1-activities-004.json | `77ca9e1d7d7963f2ccdf1a638d98dfec3166536330420a9e8ae3822d5089ecfc` |

Digest canonico dei due report: `a9818f49f705079a15b1c57afdbecbe75f8f99ad452b34c8250c38d2a19713a1`. Il contratto condiviso può evolvere: eventuali report rigenerati devono dichiarare il suo hash corrente, senza trasformare questi hash datati in attestazioni di future versioni.
