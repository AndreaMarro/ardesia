# two-layer-transmission-248 — note di autoria

16 candidati astra/1 DRAFT. Calcoli proposti dall’autore per una revisione distinta, non una certificazione scientifica propria. SCI propria, approvazione umana e UI del prodotto NOT_RUN. Nessuna modifica al registro o alla pubblicazione.

Fonte Ardesia `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-01.json`, SHA `609dec0246ff1cd1b89afed2ea7258c0f65ff8e853735ce9196fe24829fc1233`. Tutti gli 80 prompt B245–249 sono stati letti prima dei candidati; estrazione allowlist id/prompt/familyId/lawFamily, senza opzioni, chiavi o soluzioni originali.

La primaria indipendente A dei nostri 80 è congelata prima della prima scrittura: commit `b3932757`, SHA `6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08`. Ricevuti solo SHA e percorso, mai aperta. La nostra primaria A240–244 è congelata in `8a82a325`, SHA `8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d`, prima dei candidati A.

Catalogo reale letto al pin Cric `5d1dc8dc7b601aef959d10d564c75462be74708d`: `officina-di-fisica/content/C5.json`, SHA `dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422`. C5-L07 copre fotoni e attenuazione; prerequisito L06 e fondazioni L02/L04 mantenuti dove pertinenti. Il caso autonomo 247-03 sull’indice usa C5-L06, senza ereditare l’assorbitore.

Riferimenti primari controllati per le leggi, senza riprodurne testi o esercizi: [OpenStax, relazioni del fotone](https://openstax.org/books/university-physics-volume-3/pages/6-key-equations); [NIST, attenuazione esponenziale](https://physics.nist.gov/PhysRefData/XrayMassCoef/chap2.html). Il coefficiente NIST di massa è distinto dal coefficiente lineare μ qui assegnato: usando x=ρd, i due esponenti coincidono. I valori h e c nei quesiti sono dati di esercizio dichiarati, non valori esatti della natura. Nessun consiglio clinico.

Una sola pipeline esistente: assemble_family/law_steps, due assembly identiche, import canonico su SQLite temporaneo 16 salvati poi 0 nuovi/16 invariati. I 991 pubblicati rimangono byte-identici e nessun live head è creato. Operazioni sequenziali sotto mutex condiviso con guardia ≥2 GiB; importatore mantenuto al budget originale di 60 s. Le ricevute attestano soltanto exit reali, non una review scientifica.

Geometria d’autore per il revisore (coordinate intrinseche SVG, non unità fisiche o pixel CSS): Pannello 1: lastre e linea del fascio schematiche, senza scala metrica. Barre riferite alla stessa I₀ da x150 lunghe400/200/50 perT1,1/2,1/8. Pannello 2: origine x150,1920 coordinate per unità T; barre1/8,1/64,9/128 lunghe240/30/135. Pannello 3: d₁=1cm fisso, origine(150,1450),110 coordinate/cm per d₂ e640 coordinate per T; curva2^(−1−2x₂), punti(1cm,1/8),(2cm,1/32); bordo(0,1/2) aperto. PNG intero640×1600 e XML effettivamente letti; nessuna intersezione o taglio rilevato.

Il PNG nativo a piena altezza è stato effettivamente aperto e letto dall’autore, confrontandolo con XML. Resa asset-only; nessuna UI responsive del prodotto o accettazione scientifica anticipata.

## AR-u7-two-layer-transmission-01 — Il secondo strato riceve soltanto ciò che passa

Ipotesi e percorso manuale d’autore: Il primo strato trasmette un mezzo della sorgente; il secondo trasmette un quarto di ciò che riceve dal primo. La frazione complessiva è il prodotto, 1/8. Non si sommano le trasmittanze: il secondo strato non riceve di nuovo tutta l’intensità I₀.

Passaggi: T_1=2^{-1};  T_1=\frac12;  T_2=2^{-2};  T_2=\frac14;  T=T_1T_2;  T=\frac18

Risposta proposta: 1/8.

Distrattori: Un quarto considera il solo secondo strato e un mezzo il solo primo. Tre quarti somma due frazioni riferite a intensità incidenti diverse; 1/16 aggiungerebbe un dimezzamento non presente.

## AR-u7-two-layer-transmission-02 — Una frazione senza unità

Ipotesi e percorso manuale d’autore: Nel quoziente si cancellano due intensità espresse nella stessa unità. La trasmittanza è un numero puro fra zero e uno. Non coincide con un’intensità e non ha l’unità inversa di lunghezza del coefficiente μ.

Passaggi: T=I_{\rm finale}/I_0;  [T]=1;  0<T<1

Risposta proposta: 1, adimensionale.

Distrattori: W/m² è l’unità dei due termini prima del quoziente; cm e cm⁻¹ appartengono a spessore e coefficiente. J è energia, non una frazione di trasmissione.

## AR-u7-two-layer-transmission-03 — Gli esponenti si sommano

Ipotesi e percorso manuale d’autore: La prima attenuazione è exp(−μ₁d₁), la seconda exp(−μ₂d₂). Il prodotto degli esponenziali ha come esponente la somma dei due spessori ottici. Con i coefficienti assegnati risulta T=2 elevato a meno x₁−2x₂; il due distingue i due materiali.

Passaggi: T=e^{-\mu_1d_1}e^{-\mu_2d_2};  T=e^{-(\mu_1d_1+\mu_2d_2)};  T=2^{-x_1-2x_2}

Risposta proposta: T = 2^(−x₁ − 2x₂).

Distrattori: Sommare le trasmittanze non descrive strati in successione. Omettere il fattore due rende i coefficienti uguali; cambiare segno dà amplificazione. Il prodotto x₁x₂ non nasce dalla somma degli spessori ottici.

## AR-u7-two-layer-transmission-04 — Un centimetro in più nel primo strato

Ipotesi e percorso manuale d’autore: L’esponente totale passa da 1+2=3 a 2+2=4. Il centimetro aggiuntivo è del primo materiale e introduce un solo dimezzamento. La trasmittanza passa perciò da 1/8 a 1/16, rimanendo positiva.

Passaggi: T_A=2^{-3};  T_A=\frac18;  T_B=2^{-4};  T_B=\frac1{16}

Risposta proposta: Da 1/8 a 1/16.

Distrattori: Un quarto aumenta la trasmissione nonostante lo spessore maggiore. 1/32 assegnerebbe al primo centimetro il coefficiente doppio del secondo materiale; zero tratterebbe la perdita come sottrazione assoluta.

## AR-u7-two-layer-transmission-05 — Ricavare il primo percorso

Ipotesi e percorso manuale d’autore: La misura T=2⁻³ fissa lo spessore ottico totale in unità ln 2 a tre. Il secondo strato contribuisce due; resta x₁=1, quindi un centimetro nel primo strato. Il residuo è positivo, come deve essere nel dominio dato.

Passaggi: x_1+2x_2=3;  x_1+2=3;  x_1=1;  d_1=1\,\mathrm{cm}

Risposta proposta: 1 cm.

Distrattori: Tre centimetri ignora il contributo del secondo strato e darebbe T=1/32. Due centimetri darebbe 1/16; zero darebbe 1/4 e violerebbe anche il percorso strettamente positivo.

## AR-u7-two-layer-transmission-06 — Il coefficiente doppio pesa nell’inversa

Ipotesi e percorso manuale d’autore: Dall’esponente totale tre tolgo x₁=1; il residuo due corrisponde a 2x₂, non a x₂. Dividendo per due si ricava x₂=1. L’unità fisica di d₂ resta il centimetro.

Passaggi: 1+2x_2=3;  2x_2=2;  x_2=1;  d_2=1\,\mathrm{cm}

Risposta proposta: 1 cm.

Distrattori: Due centimetri omette la divisione per il coefficiente relativo due e darebbe T=1/32. Tre centimetri darebbe 1/128; mezzo centimetro darebbe 1/4.

## AR-u7-two-layer-transmission-07 — Il secondo strato raddoppia

Ipotesi e percorso manuale d’autore: L’esponente passa da tre a cinque: il centimetro aggiuntivo nel secondo materiale aggiunge due dimezzamenti. T_A=1/8 e T_B=1/32, quindi il rapporto finale/iniziale è un quarto. 1/32 è la trasmittanza assoluta finale, non il rapporto fra le due.

Passaggi: T_A=\frac18;  T_B=\frac1{32};  T_B/T_A=\frac14

Risposta proposta: 1/4.

Distrattori: Quattro inverte il rapporto; un mezzo usa il coefficiente del primo materiale. Uno ignora lo spessore aggiuntivo.

## AR-u7-two-layer-transmission-08 — Uno scarto fra frazioni

Ipotesi e percorso manuale d’autore: Il valore corretto è 1/8. Sottraggo la frazione corretta dalla proposta: 1/4−1/8=1/8. Anche lo scarto è adimensionale, ma resta distinto dal rapporto, che varrebbe due.

Passaggi: T=\frac18;  \delta T=\frac14-\frac18;  \delta T=\frac18

Risposta proposta: 1/8.

Distrattori: −1/8 cambia l’ordine. Due è il quoziente proposto/corretto; 1/4 ripete la proposta e zero la accetta senza il primo strato.

## AR-u7-two-layer-transmission-09 — Il residuo nell’esponente

Ipotesi e percorso manuale d’autore: Prendo il logaritmo in base due del reciproco della trasmittanza: ottengo x₁+2x₂. Tolgo il contributo noto del secondo strato. Il residuo deve essere strettamente positivo; equivalentemente T deve essere minore di 2 elevato a −2x₂. Il logaritmo ha argomento adimensionale.

Passaggi: \log_2(1/T)=x_1+2x_2;  x_1=\log_2(1/T)-2x_2;  d_1=x_1\,\mathrm{cm}

Risposta proposta: x₁ = log₂(1/T) − 2x₂.

Distrattori: Sommare 2x₂ anziché sottrarlo conterebbe due volte il materiale noto. log₂ T è negativo; dividere per 2x₂ confonde somma di contributi e prodotto. La positività del residuo è una verifica fisica dell’inversa.

## AR-u7-two-layer-transmission-10 — Confrontare due esponenti

Ipotesi e percorso manuale d’autore: Il rapporto di due potenze di due si ottiene sottraendo gli esponenti. Il primo strato aggiunge δ₁ al percorso normalizzato; il secondo aggiunge δ₂ con coefficiente relativo due. Il rapporto è quindi 2 elevato a meno δ₁−2δ₂. Anche variazioni negative sono possibili, purché i percorsi finali restino positivi.

Passaggi: \delta_1=(\kappa_1-1)x_{1,A};  \delta_2=(\kappa_2-1)x_{2,A};  T_B/T_A=2^{-\delta_1-2\delta_2}

Risposta proposta: 2^(−δ₁ − 2δ₂).

Distrattori: Il prodotto o quoziente dei fattori di lunghezza non è una legge di scala per una trasmittanza esponenziale. Il segno positivo inverte il rapporto e omettere il due rende identici i materiali.

## AR-u7-two-layer-transmission-11 — Raddoppiare entrambi i percorsi

Ipotesi e percorso manuale d’autore: L’esponente totale raddoppia da tre a sei. T_A=1/8 e T_B=1/64; dividendo si ottiene un ottavo. In questo confronto particolare T_B=T_A², ma il rapporto fra le due è T_A, non il suo quadrato.

Passaggi: T_A=2^{-3};  T_B=2^{-6};  T_B/T_A=2^{-3};  T_B/T_A=\frac18

Risposta proposta: 1/8.

Distrattori: Otto è il reciproco. Un mezzo o un quarto omette una parte dell’incremento ottico; 1/64 copia la trasmittanza finale assoluta.

## AR-u7-two-layer-transmission-12 — Media di due trasmittanze

Ipotesi e percorso manuale d’autore: I valori da mediare sono 1/8 e 1/64. La somma è 9/64 e la media 9/128. Inserire gli spessori medi 3/2 cm in ciascuno strato darebbe invece 2 elevato a −9/2, cioè √2/32: un valore esatto ma riferito a una terza preparazione, non alla statistica richiesta.

Passaggi: \overline T=\frac{1/8+1/64}{2};  \overline T=\frac9{128};  T_{\rm dati\ medi}=\frac{\sqrt2}{32}

Risposta proposta: 9/128.

Distrattori: 9/64 omette il peso un mezzo. 7/128 è la semidifferenza, 1/64 copia B. L’esponenziale non scambia in generale l’ordine con la media aritmetica.

## AR-u7-two-layer-transmission-13 — Distribuire un bersaglio fra i materiali

Ipotesi e percorso manuale d’autore: Il bersaglio è T_B=1/64, quindi l’esponente totale deve essere sei. Il primo percorso normalizzato è due: restano quattro unità ottiche al secondo materiale, cioè x₂,B=2. Il rapporto rispetto al suo centimetro iniziale è due.

Passaggi: T_B=\frac1{64};  x_{1,B}+2x_{2,B}=6;  2x_{2,B}=4;  x_{2,B}=2;  d_{2,B}/d_{2,A}=2

Risposta proposta: 2.

Distrattori: Tre centimetri nel secondo materiale darebbero T_B=1/256. Uno darebbe 1/16; un ottavo copia il bersaglio delle trasmittanze anziché il rapporto dei percorsi.

## AR-u7-two-layer-transmission-14 — Un display proporzionale alla frazione

Ipotesi e percorso manuale d’autore: Il riferimento T=1/8 fissa g=3. La nuova lettura corrisponde a T=1/64 e dunque a esponente totale sei. Il secondo materiale contribuisce quattro, lasciando x₁=2. La lettura del display non è direttamente una trasmittanza.

Passaggi: g=\frac{3/8}{1/8};  g=3;  T=\frac{3/64}{3};  T=\frac1{64};  x_1+4=6;  d_1=2\,\mathrm{cm}

Risposta proposta: 2 cm.

Distrattori: Sei centimetri nel primo materiale darebbero T=1/1024 e D=3/1024. Uno darebbe D=3/32, non 3/64; quattro darebbe D=3/256. La sostituzione diretta controlla l’inversa senza approssimare logaritmi.

## AR-u7-two-layer-transmission-15 — Sottrarre il fondo della taratura

Ipotesi e percorso manuale d’autore: Le trasmittanze di riferimento sono 1/8 e 1/64. Le differenze delle letture e dei riferimenti danno g=2; poi b=1. D_C=9/8 lascia, tolto il fondo e diviso per due, T_C=1/16. L’esponente quattro meno il contributo due del secondo strato dà x₁,C=2.

Passaggi: g=\frac{5/4-33/32}{1/8-1/64};  g=2;  b=1;  T_C=\frac{9/8-1}{2};  T_C=\frac1{16};  d_{1,C}=2\,\mathrm{cm}

Risposta proposta: 2 cm.

Distrattori: Ignorare b farebbe interpretare D_C/2=9/16 come trasmittanza: è persino maggiore di 1/4, limite superiore con d₂=1 cm e d₁>0. Quattro centimetri darebbero D=33/32 e uno D=5/4, non 9/8.

## AR-u7-two-layer-transmission-16 — Stessi percorsi, coefficienti diversi

Ipotesi e percorso manuale d’autore: Il vincolo rende uguali i percorsi geometrici, non i contributi ottici: il secondo vale il doppio del primo. Se x=x₁=x₂, l’esponente totale è 3x. Da 2⁻³ˣ=2⁻³ segue x=1, unica soluzione positiva.

Passaggi: x_1=x_2; x_2=x;  T=2^{-3x};  3x=3;  x=1;  d_2=1\,\mathrm{cm}

Risposta proposta: 1 cm.

Distrattori: Tre centimetri darebbero 1/512 e mezzo centimetro darebbe 1/(2√2), non 1/8. Il vincolo e la misura sono indipendenti: non rimane una famiglia di scale libere.
