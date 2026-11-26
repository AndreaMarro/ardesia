# infer-attenuation-coefficient-249 — note di autoria

16 candidati astra/1 DRAFT. Calcoli proposti dall’autore per una revisione distinta, non una certificazione scientifica propria. SCI propria, approvazione umana e UI del prodotto NOT_RUN. Nessuna modifica al registro o alla pubblicazione.

Fonte Ardesia `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-01.json`, SHA `609dec0246ff1cd1b89afed2ea7258c0f65ff8e853735ce9196fe24829fc1233`. Tutti gli 80 prompt B245–249 sono stati letti prima dei candidati; estrazione allowlist id/prompt/familyId/lawFamily, senza opzioni, chiavi o soluzioni originali.

La primaria indipendente A dei nostri 80 è congelata prima della prima scrittura: commit `b3932757`, SHA `6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08`. Ricevuti solo SHA e percorso, mai aperta. La nostra primaria A240–244 è congelata in `8a82a325`, SHA `8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d`, prima dei candidati A.

Catalogo reale letto al pin Cric `5d1dc8dc7b601aef959d10d564c75462be74708d`: `officina-di-fisica/content/C5.json`, SHA `dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422`. C5-L07 copre fotoni e attenuazione; prerequisito L06 e fondazioni L02/L04 mantenuti dove pertinenti. Il caso autonomo 247-03 sull’indice usa C5-L06, senza ereditare l’assorbitore.

Riferimenti primari controllati per le leggi, senza riprodurne testi o esercizi: [OpenStax, relazioni del fotone](https://openstax.org/books/university-physics-volume-3/pages/6-key-equations); [NIST, attenuazione esponenziale](https://physics.nist.gov/PhysRefData/XrayMassCoef/chap2.html). Il coefficiente NIST di massa è distinto dal coefficiente lineare μ qui assegnato: usando x=ρd, i due esponenti coincidono. I valori h e c nei quesiti sono dati di esercizio dichiarati, non valori esatti della natura. Nessun consiglio clinico.

Una sola pipeline esistente: assemble_family/law_steps, due assembly identiche, import canonico su SQLite temporaneo 16 salvati poi 0 nuovi/16 invariati. I 991 pubblicati rimangono byte-identici e nessun live head è creato. Operazioni sequenziali sotto mutex condiviso con guardia ≥2 GiB; importatore mantenuto al budget originale di 60 s. Le ricevute attestano soltanto exit reali, non una review scientifica.

Geometria d’autore per il revisore (coordinate intrinseche SVG, non unità fisiche o pixel CSS): Pannello 1: origine x150, cinque coordinate per mW/m²; barre64/32/16/8/4 lunghe320/160/80/40/20. Percorsi0,1/4,1/2,3/4,1cm perμ=4ln2cm⁻¹; zero indica incidente. Pannello 2:80 coordinate per cm⁻¹; a4/1/5/2 in barre320/80/200 con origine x150. Pannello 3 autonomo:10 coordinate per unità del segnale, letture24/16/12 in barre240/160/120; segmento grigio80 comune perB8, ampiezza iniziale32, coefficientea1cm⁻¹. Il fondo non è sottratto dalle altezze totali. Figura intera640×1600 e XML effettivamente letti, etichette e proporzioni senza occlusioni.

Il PNG nativo a piena altezza è stato effettivamente aperto e letto dall’autore, confrontandolo con XML. Resa asset-only; nessuna UI responsive del prodotto o accettazione scientifica anticipata.

## AR-u7-infer-attenuation-coefficient-01 — Quattro dimezzamenti in un centimetro

Ipotesi e percorso manuale d’autore: Il rapporto fra intensità iniziale e finale vale 64/4=16=2⁴. L’esponente αx è quindi quattro. Essendo x=1, α=4 e a=4 cm⁻¹. Il coefficiente fisico μ è a ln 2; non si deve identificare a con μ né valutare ln 2 in forma decimale.

Passaggi: I_0/I=16;  16=2^4;  \alpha x=4;  a=4\,\mathrm{cm^{-1}};  \mu=(4\ln2)\,\mathrm{cm^{-1}}

Risposta proposta: 4 cm⁻¹.

Distrattori: Sedici copia il rapporto delle intensità senza ricavarne l’esponente. Due conterebbe due dimezzamenti, che darebbero I=16 mW/m²; otto predirebbe I=1/4 mW/m².

## AR-u7-infer-attenuation-coefficient-02 — Dividere per ln 2 non cambia la dimensione

Ipotesi e percorso manuale d’autore: ln 2 è un numero puro. Il rapporto conserva quindi la dimensione inversa di una lunghezza di μ. Perché a moltiplicato per d sia un esponente numerico, le unità di lunghezza devono essere coerenti.

Passaggi: [\ln2]=1;  [a]=[\mu];  [a]=L^{-1}

Risposta proposta: cm⁻¹.

Distrattori: Il numero normalizzato α è adimensionale, ma la grandezza a richiesta non lo è. cm misura d, W/m² l’intensità e J un’energia.

## AR-u7-infer-attenuation-coefficient-03 — L’inversa usa un rapporto di intensità

Ipotesi e percorso manuale d’autore: Il logaritmo in base due del rapporto I₀/I restituisce l’esponente αx. Divido per x, positivo, e ottengo α. In forma fisica a=ln(I₀/I)/(d ln 2), con unità inversa di lunghezza. Il logaritmo agisce su un rapporto senza unità, non su una singola intensità dimensionata.

Passaggi: \log_2(I_0/I)=\alpha x;  \alpha=\frac{\log_2(I_0/I)}{x};  a=\frac{\ln(I_0/I)}{d\ln2}

Risposta proposta: α = log₂(I₀ / I) / x.

Distrattori: Invertire il rapporto dentro il logaritmo produrrebbe un coefficiente negativo. Moltiplicare per x anziché dividerlo cambia l’inversa; usare il rapporto senza logaritmo confonde base ed esponente. Il quadrato dello spessore non compare nella legge.

## AR-u7-infer-attenuation-coefficient-04 — Più trasmissione implica meno attenuazione

Ipotesi e percorso manuale d’autore: In A il rapporto 64/4=2⁴ richiede α=4. In B, 64/16=2² richiede α=2. Alla stessa lunghezza, la maggiore intensità sopravvissuta corrisponde al coefficiente minore. Il rapporto è un mezzo, ma non perché a sia semplicemente inverso di I: qui conta il logaritmo.

Passaggi: \alpha_A=\log_2 16;  \alpha_A=4;  \alpha_B=\log_2 4;  \alpha_B=2

Risposta proposta: Da 4 cm⁻¹ a 2 cm⁻¹.

Distrattori: Sedici rende il coefficiente direttamente proporzionale all’intensità. Uno seguirebbe una semplice proporzionalità inversa al suo aumento di quattro; quattro ignora la nuova misura. Un coefficiente negativo amplificherebbe il fascio.

## AR-u7-infer-attenuation-coefficient-05 — Ricostruire la misura trasmessa

Ipotesi e percorso manuale d’autore: Il prodotto ad dà quattro. La legge diretta contiene quindi quattro dimezzamenti dell’intensità incidente: 64 diviso sedici è 4 mW/m². L’inversione del problema non cambia la legge di propagazione.

Passaggi: \alpha x=4;  I=\frac{64}{2^4}\,\mathrm{mW/m^2};  I=4\,\mathrm{mW/m^2}

Risposta proposta: 4 mW/m².

Distrattori: Sedici mW/m² corrisponderebbe ad αx=2; 1024 cambierebbe il segno dell’esponente e darebbe amplificazione. Sessantaquattro omette del tutto lo strato.

## AR-u7-infer-attenuation-coefficient-06 — Il percorso da una perdita assegnata

Ipotesi e percorso manuale d’autore: Il rapporto 64/4 fornisce esponente totale quattro. Dividendo per a=4 cm⁻¹ ricavo un centimetro. La positività del logaritmo e del coefficiente rende la lunghezza strettamente positiva.

Passaggi: \log_2(I_0/I)=4;  d=\frac{4}{4\,\mathrm{cm^{-1}}};  d=1\,\mathrm{cm}

Risposta proposta: 1 cm.

Distrattori: Quattro centimetri darebbero sedici dimezzamenti e una trasmissione molto minore. Un quarto centimetro darebbe I=32 mW/m²; due darebbe I=1/4 mW/m².

## AR-u7-infer-attenuation-coefficient-07 — La stessa perdita su un percorso doppio

Ipotesi e percorso manuale d’autore: Entrambe le prove richiedono esponente totale quattro. Per accumularlo su due centimetri basta a_B=2 cm⁻¹, contro 4 cm⁻¹ in A. Il rapporto è un mezzo. Qui cambiano i materiali o le loro condizioni fra prove; non si impone lo stesso μ.

Passaggi: a_A=4\,\mathrm{cm^{-1}};  a_B=2\,\mathrm{cm^{-1}};  a_B/a_A=\frac12

Risposta proposta: 1/2.

Distrattori: Due inverte il confronto e uno imporrebbe erroneamente lo stesso materiale nonostante le misure assegnate. Un quarto e quattro aggiungono un quadrato assente.

## AR-u7-infer-attenuation-coefficient-08 — Lo scarto del coefficiente proposto

Ipotesi e percorso manuale d’autore: Il coefficiente corretto è 4 cm⁻¹. Sottraendo nell’ordine dato si trova +4 cm⁻¹: la proposta sovrastima l’attenuazione per unità di lunghezza. Il fattore due fra i due coefficienti è invece adimensionale.

Passaggi: \delta a=(8-4)\,\mathrm{cm^{-1}};  \delta a=4\,\mathrm{cm^{-1}}

Risposta proposta: 4 cm⁻¹.

Distrattori: −4 cm⁻¹ scambia l’ordine; due è il rapporto. Otto ripete la proposta e zero non controlla che otto dimezzamenti a un centimetro darebbero I=1/4 mW/m².

## AR-u7-infer-attenuation-coefficient-09 — Tornare all’intensità, non al logaritmo

Ipotesi e percorso manuale d’autore: Dal numero di dimezzamenti ad ricostruisco la frazione che sopravvive, 2 elevato a meno ad, e la moltiplico per I₀. Il prodotto ad è senza unità se a e d sono coerenti; a=μ/ln 2 è una grandezza fisica, non il solo numero α.

Passaggi: a=\mu/\ln2;  \mu d=(ad)\ln2;  I=I_0 2^{-ad}

Risposta proposta: I = I₀ 2^(−ad).

Distrattori: Il segno positivo amplifica. Dividere per ad sostituisce l’esponenziale con un reciproco; sottrarre ad da I₀ somma grandezze di dimensioni diverse. L’inverso di I₀ non ha unità di intensità.

## AR-u7-infer-attenuation-coefficient-10 — Cambiare misura e spessore

Ipotesi e percorso manuale d’autore: L’intensità incidente resta la stessa. Il logaritmo nuovo è log₂[I₀/(κ₁I_A)]=L−log₂κ₁; lo spessore nuovo moltiplica il denominatore per κ₂. Dividendo i coefficienti ottengo la frazione indicata. Il vincolo I_B<I₀ rende positivo anche il numeratore.

Passaggi: L=\log_2(I_0/I_A);  L_B=L-\log_2\kappa_1;  a_B/a_A=\frac{L_B}{\kappa_2L}

Risposta proposta: (L − log₂ κ₁) / (κ₂ L).

Distrattori: κ₁/κ₂ presume una dipendenza lineare dall’intensità trasmessa che non esiste. Il segno più confonde il rapporto dentro il logaritmo, mentre scambiare i due fattori non risolve quella non linearità.

## AR-u7-infer-attenuation-coefficient-11 — Due misure inverse nello stesso riferimento

Ipotesi e percorso manuale d’autore: A richiede quattro dimezzamenti in un centimetro, quindi a_A=4 cm⁻¹. B ne richiede due in due centimetri, quindi a_B=1 cm⁻¹. Il rapporto è un quarto: entrambe le modifiche riducono il coefficiente inferito.

Passaggi: a_A=4\,\mathrm{cm^{-1}};  a_B=1\,\mathrm{cm^{-1}};  a_B/a_A=\frac14

Risposta proposta: 1/4.

Distrattori: Un mezzo considera solo uno dei cambiamenti; quattro inverte il rapporto. Due rende diretta la dipendenza dal percorso e uno ignora tutti i dati nuovi.

## AR-u7-infer-attenuation-coefficient-12 — Media dei coefficienti ricostruiti

Ipotesi e percorso manuale d’autore: Ricostruisco separatamente i coefficienti 4 e 1 cm⁻¹ e solo dopo applico i pesi un mezzo. La media è 5/2 cm⁻¹. Non serve calcolare il logaritmo del rapporto fra 64 e l’intensità media 10: quello sarebbe il modello a parametri medi, non la media richiesta.

Passaggi: \overline a=\frac{4+1}{2}\,\mathrm{cm^{-1}};  \overline a=\frac52\,\mathrm{cm^{-1}}

Risposta proposta: (5/2) cm⁻¹.

Distrattori: Cinque somma senza dimezzare; 3/2 è la semidifferenza. Quattro e uno ripetono una sola prova. La media dei coefficienti non si identifica con un’intensità media attenuata.

## AR-u7-infer-attenuation-coefficient-13 — Il percorso che rende a quattro volte minore

Ipotesi e percorso manuale d’autore: Il coefficiente bersaglio è 1 cm⁻¹. La nuova misura richiede due dimezzamenti: d_B=2/(1 cm⁻¹)=2 cm. Rispetto al centimetro iniziale il percorso deve raddoppiare. Il rapporto target sui coefficienti non è quello sui percorsi.

Passaggi: a_B=1\,\mathrm{cm^{-1}};  \log_2(64/16)=2;  d_B=2\,\mathrm{cm};  d_B/d_A=2

Risposta proposta: 2.

Distrattori: Uno darebbe a_B=2 cm⁻¹, quattro darebbe 1/2 cm⁻¹. Un quarto copia il bersaglio dell’uscita e un mezzo inverte il rapporto dei percorsi.

## AR-u7-infer-attenuation-coefficient-14 — La taratura del coefficiente è un’altra legge

Ipotesi e percorso manuale d’autore: Il coefficiente fisico a e il guadagno del display g sono diversi. Il riferimento dà α=4, quindi g=3. La nuova lettura D=3 dà α=1. Su due centimetri l’esponente αx=2 lascia passare 64/4=16 mW/m².

Passaggi: g=12/4;  g=3;  \alpha=3/3;  \alpha=1;  I=\frac{64}{2^2}\,\mathrm{mW/m^2};  I=16\,\mathrm{mW/m^2}

Risposta proposta: 16 mW/m².

Distrattori: Un mW/m² tratterebbe D=3 come α=3: a due centimetri darebbe sei dimezzamenti e display nove, non tre. Quattro mW/m² darebbe α=2 e D=6 alla nuova profondità.

## AR-u7-infer-attenuation-coefficient-15 — Togliere il fondo del display

Ipotesi e percorso manuale d’autore: I riferimenti danno α_A=4 e α_B=1. Dalle differenze g=(9−3)/(4−1)=2 e poi b=1. La nuova lettura cinque indica α_C=2. Sul centimetro di C si hanno due dimezzamenti e I_C=16 mW/m².

Passaggi: g=\frac{9-3}{4-1};  g=2;  b=1;  \alpha_C=\frac{5-1}{2};  \alpha_C=2;  I_C=16\,\mathrm{mW/m^2}

Risposta proposta: 16 mW/m².

Distrattori: Ignorare il fondo darebbe α=5/2, non due. Quattro mW/m² predirebbe D=9 e 32 mW/m² predirebbe D=3: nessuno dei due ricostruisce la lettura cinque.

## AR-u7-infer-attenuation-coefficient-16 — Tre spessori eliminano un fondo ignoto

Ipotesi e percorso manuale d’autore: Sottraggo letture a spessori equidistanti: il fondo B scompare. Ponendo q=exp[−μ(1 cm)], le differenze sono A q(1−q)=8 e A q²(1−q)=4. Il loro rapporto dà q=1/2, un dimezzamento per centimetro. Dunque a=1 cm⁻¹. Come controllo, A=32 e B=8 riproducono tutte e tre le letture.

Passaggi: \Delta_1=24-16;  \Delta_1=8;  \Delta_2=16-12;  \Delta_2=4;  q=\Delta_2/\Delta_1;  q=\frac12;  a=1\,\mathrm{cm^{-1}}

Risposta proposta: 1 cm⁻¹.

Distrattori: Usare 16/24 o 12/16 direttamente mantiene il fondo dentro i rapporti e non ricostruisce una progressione geometrica del solo segnale attenuato. Un coefficiente due darebbe q=1/4, incompatibile con il rapporto quattro su otto. Il fondo e l’ampiezza non sono i valori fissati degli altri quesiti.
