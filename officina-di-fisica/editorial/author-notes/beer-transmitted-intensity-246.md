# beer-transmitted-intensity-246 — note di autoria

16 candidati astra/1 DRAFT. Calcoli proposti dall’autore per una revisione distinta, non una certificazione scientifica propria. SCI propria, approvazione umana e UI del prodotto NOT_RUN. Nessuna modifica al registro o alla pubblicazione.

Fonte Ardesia `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-01.json`, SHA `609dec0246ff1cd1b89afed2ea7258c0f65ff8e853735ce9196fe24829fc1233`. Tutti gli 80 prompt B245–249 sono stati letti prima dei candidati; estrazione allowlist id/prompt/familyId/lawFamily, senza opzioni, chiavi o soluzioni originali.

La primaria indipendente A dei nostri 80 è congelata prima della prima scrittura: commit `b3932757`, SHA `6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08`. Ricevuti solo SHA e percorso, mai aperta. La nostra primaria A240–244 è congelata in `8a82a325`, SHA `8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d`, prima dei candidati A.

Catalogo reale letto al pin Cric `5d1dc8dc7b601aef959d10d564c75462be74708d`: `officina-di-fisica/content/C5.json`, SHA `dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422`. C5-L07 copre fotoni e attenuazione; prerequisito L06 e fondazioni L02/L04 mantenuti dove pertinenti. Il caso autonomo 247-03 sull’indice usa C5-L06, senza ereditare l’assorbitore.

Riferimenti primari controllati per le leggi, senza riprodurne testi o esercizi: [OpenStax, relazioni del fotone](https://openstax.org/books/university-physics-volume-3/pages/6-key-equations); [NIST, attenuazione esponenziale](https://physics.nist.gov/PhysRefData/XrayMassCoef/chap2.html). Il coefficiente NIST di massa è distinto dal coefficiente lineare μ qui assegnato: usando x=ρd, i due esponenti coincidono. I valori h e c nei quesiti sono dati di esercizio dichiarati, non valori esatti della natura. Nessun consiglio clinico.

Una sola pipeline esistente: assemble_family/law_steps, due assembly identiche, import canonico su SQLite temporaneo 16 salvati poi 0 nuovi/16 invariati. I 991 pubblicati rimangono byte-identici e nessun live head è creato. Operazioni sequenziali sotto mutex condiviso con guardia ≥2 GiB; importatore mantenuto al budget originale di 60 s. Le ricevute attestano soltanto exit reali, non una review scientifica.

Geometria d’autore per il revisore (coordinate intrinseche SVG, non unità fisiche o pixel CSS): Pannello 1: barre da x150, cinque coordinate per mW/m², lunghezze320/160/80/40 per64/32/16/8. Pannello 2: origine(150,1010),110 coordinate/cm e cinque coordinate/(mW/m²); curva64·2^(−x) con punti a1/2/3cm e32/16/8mW/m². d=0 è riferimento incidente. Pannello 3: riquadri indicano due mezze aree uguali in vista trasversale, non spessori disegnati in scala; barre8/4/6 lunghe240/120/180 da x150. PNG intero640×1600 e XML effettivamente letti, nessuna occlusione rilevata.

Il PNG nativo a piena altezza è stato effettivamente aperto e letto dall’autore, confrontandolo con XML. Resa asset-only; nessuna UI responsive del prodotto o accettazione scientifica anticipata.

## AR-u7-beer-transmitted-intensity-01 — Ogni centimetro dimezza ciò che arriva

Ipotesi e percorso manuale d’autore: L’esponente è il prodotto adimensionale μd. Per un centimetro vale ln 2 e il fattore esponenziale è un mezzo. L’intensità trasmessa è perciò 32 mW/m²: si dimezza il flusso energetico per area, non si sottrae un numero fisso per ogni centimetro successivo.

Passaggi: \mu d=\ln2;  e^{-\ln2}=\frac12;  I=64\cdot\frac12\,\mathrm{mW/m^2};  I=32\,\mathrm{mW/m^2}

Risposta proposta: 32 mW/m².

Distrattori: Sessantaquattro ignora la lastra; 128 cambierebbe il segno dell’esponente e produrrebbe amplificazione senza sorgenti. Sedici corrisponde a due centimetri, non a uno.

## AR-u7-beer-transmitted-intensity-02 — Potenza per area

Ipotesi e percorso manuale d’autore: Un’intensità è una potenza per area. Il prefisso milli produce mW/m² senza cambiare la dimensione W·m⁻². Il coefficiente μ, distinto da I, ha invece dimensione inversa di una lunghezza.

Passaggi: I=P/A;  [I]=\mathrm{W/m^2}

Risposta proposta: W/m².

Distrattori: W è potenza totale e J energia; m⁻¹ appartiene al coefficiente di attenuazione, mentre s⁻¹ è un tasso temporale. Non sono alternative dimensionalmente equivalenti all’intensità.

## AR-u7-beer-transmitted-intensity-03 — I fotoni che proseguono

Ipotesi e percorso manuale d’autore: Nel modello di assorbimento alcuni fotoni sono rimossi dal fascio diretto. Quelli che vengono trasmessi conservano la frequenza e quindi l’energia hf. A parità di sezione, la potenza per area minore dipende dal tasso medio di fotoni che riescono a passare. Non si sta descrivendo diffusione inelastica o fluorescenza raccolta.

Passaggi: E_\gamma=hf;  I=\dot n_Ahf

Risposta proposta: Minore tasso di fotoni, stessa energia di ciascun fotone trasmesso.

Distrattori: La perdita continua di una frazione dell’energia di ciascun fotone non è il modello di rimozione per assorbimento. Un dimezzamento della frequenza cambierebbe lo spettro; h non è un parametro del materiale e non aumenta l’energia dei superstiti.

## AR-u7-beer-transmitted-intensity-04 — La sorgente dimezzata

Ipotesi e percorso manuale d’autore: Il materiale lascia passare la medesima frazione un mezzo in entrambe le prove. Se l’intensità incidente si dimezza, anche quella trasmessa si dimezza: 16 mW/m². La linearità vale rispetto a I₀ a d e μ fissati, pur essendo la dipendenza dallo spessore esponenziale.

Passaggi: I_A=32\,\mathrm{mW/m^2};  I_B=32\cdot\frac12\,\mathrm{mW/m^2};  I_B=16\,\mathrm{mW/m^2}

Risposta proposta: Da 32 a 16 mW/m².

Distrattori: Sessantaquattro invertirebbe la proporzionalità alla sorgente. Otto applicherebbe un ulteriore dimezzamento da spessore che qui non cambia; trentadue ignora il nuovo ingresso.

## AR-u7-beer-transmitted-intensity-05 — Risolvere all’indietro per la sorgente

Ipotesi e percorso manuale d’autore: Moltiplico l’intensità finale per exp(μd), che qui è due. Per ricostruire una misura dopo perdite positive la sorgente deve avere intensità maggiore della trasmessa. Il risultato 64 mW/m², reinserito nella legge diretta, dà esattamente 32.

Passaggi: I_0=I e^{\mu d};  I_0=32\cdot2\,\mathrm{mW/m^2};  I_0=64\,\mathrm{mW/m^2}

Risposta proposta: 64 mW/m².

Distrattori: Sedici applica di nuovo l’attenuazione invece di invertirla. Trentadue presuppone spessore nullo o μ nullo, entrambi esclusi; 128 predirebbe 64 mW/m² in uscita.

## AR-u7-beer-transmitted-intensity-06 — Riconoscere una potenza di due

Ipotesi e percorso manuale d’autore: Il rapporto I₀/I è due. La relazione 2ˣ=I₀/I richiede x=1, senza una valutazione numerica di logaritmi. L’inversa generale d=ln(I₀/I)/μ è positiva perché I₀>I>0; il rapporto dentro il logaritmo non ha unità.

Passaggi: 2^x=I_0/I;  2^x=2;  x=1;  d=1\,\mathrm{cm}

Risposta proposta: 1 cm.

Distrattori: Due centimetri darebbero 16 mW/m², mentre mezzo centimetro darebbe 32√2 mW/m². Zero non attenuerebbe il fascio; uno soddisfa il rapporto assegnato.

## AR-u7-beer-transmitted-intensity-07 — Raddoppiare lo spessore non annulla il fascio

Ipotesi e percorso manuale d’autore: A trasmette un mezzo dell’incidente, B un quarto. Sono 32 e 16 mW/m²; rispetto ad A l’ulteriore centimetro dimezza ancora. Il rapporto B/A è un mezzo, mentre un quarto sarebbe la trasmittanza assoluta di B.

Passaggi: I_A=32\,\mathrm{mW/m^2};  I_B=16\,\mathrm{mW/m^2};  I_B/I_A=\frac12

Risposta proposta: 1/2.

Distrattori: Due inverte il confronto; un quarto confronta B con la sorgente anziché con A. Zero sottrarrebbe una perdita assoluta costante, incompatibile con l’esponenziale.

## AR-u7-beer-transmitted-intensity-08 — Lo scarto non è l’intensità incidente

Ipotesi e percorso manuale d’autore: La misura prevista è 32 mW/m². La proposta ripete l’intensità incidente e la sovrastima di 64−32=32 mW/m². Lo scarto è una differenza con unità, mentre il rapporto proposta/corretto è due.

Passaggi: \delta I=(64-32)\,\mathrm{mW/m^2};  \delta I=32\,\mathrm{mW/m^2}

Risposta proposta: 32 mW/m².

Distrattori: Il segno meno cambia l’ordine della sottrazione. Due è un fattore puro, 64 ripete la proposta e zero ne omette la verifica fisica.

## AR-u7-beer-transmitted-intensity-09 — L’inversa esponenziale

Ipotesi e percorso manuale d’autore: La legge diretta moltiplica I₀ per exp(−μd). Divido per quel fattore, sempre positivo, e ottengo I₀=I exp(μd). Nella forma con x=d/(1 cm), equivale a I₀=I·2ˣ: il segno positivo compare nell’inversa, non nella propagazione diretta.

Passaggi: I=I_0e^{-\mu d};  I_0=I e^{\mu d};  I_0=I\,2^x

Risposta proposta: I₀ = I exp(μd).

Distrattori: Il segno negativo applica una seconda attenuazione. Il reciproco dell’intensità non ne ha la dimensione; μd è adimensionale ma non può sostituire l’esponenziale. Adimensionale non significa fisicamente equivalente.

## AR-u7-beer-transmitted-intensity-10 — Scalare anche lo spessore

Ipotesi e percorso manuale d’autore: Scrivo le due leggi esponenziali e divido. La modifica dell’intensità incidente produce κ₁; la differenza di spessore produce exp[−μ(d_B−d_A)]. Per il materiale assegnato quel secondo fattore è 2 elevato a meno δ. δ può avere anche segno negativo se B è più sottile, benché entrambi gli spessori restino positivi.

Passaggi: \delta=(\kappa_2-1)x_A;  \frac{I_B}{I_A}=\kappa_1e^{-\mu(d_B-d_A)};  \frac{I_B}{I_A}=\kappa_1 2^{-\delta}

Risposta proposta: κ₁ 2^(−δ).

Distrattori: Il prodotto κ₁κ₂ e il quoziente κ₁/κ₂ trattano lo spessore come una semplice potenza anziché un esponente. κ₁ non modifica μ e non va trasferito dentro l’esponente. La somma non vale uno per prove identiche.

## AR-u7-beer-transmitted-intensity-11 — Una sorgente minore e una lastra più spessa

Ipotesi e percorso manuale d’autore: A dà 32 mW/m², B dà 32/4=8 mW/m². Il dimezzamento della sorgente si combina con quello dovuto al centimetro aggiuntivo: il rapporto è un quarto. La trasmittanza di B è un quarto dell’incidente B, ma qui la stessa cifra emerge da un confronto diverso.

Passaggi: I_A=32\,\mathrm{mW/m^2};  I_B=8\,\mathrm{mW/m^2};  I_B/I_A=\frac14

Risposta proposta: 1/4.

Distrattori: Un mezzo considera solo una delle due modifiche; quattro inverte il rapporto. Un ottavo è I_B/I₀,A, non I_B/I_A, e uno ignora entrambe.

## AR-u7-beer-transmitted-intensity-12 — Media delle uscite attenuate

Ipotesi e percorso manuale d’autore: Le uscite sono 32 e 8 mW/m²; la media con pesi uguali vale 20 mW/m². Il modello agli ingressi medi, I₀=48 mW/m² e x=3/2, darebbe invece 48/(2√2)=12√2 mW/m². L’espressione radicale è esatta, ma non è la media richiesta.

Passaggi: \overline I=\frac{32+8}{2}\,\mathrm{mW/m^2};  \overline I=20\,\mathrm{mW/m^2};  I_{\rm dati\ medi}=12\sqrt2\,\mathrm{mW/m^2}

Risposta proposta: 20 mW/m².

Distrattori: Quaranta somma senza dividere per due; dodici è la semidifferenza e otto copia B. La media delle uscite non può essere sostituita da un esponenziale degli ingressi medi.

## AR-u7-beer-transmitted-intensity-13 — Il bersaglio richiede un secondo dimezzamento

Ipotesi e percorso manuale d’autore: L’obiettivo è 8 mW/m². Dalla sorgente nuova di 32 mW/m² deve passare un quarto: occorrono due dimezzamenti e quindi d_B=2 cm. Rispetto al centimetro iniziale il rapporto è due. La sorgente minore ha già contribuito al calo, ma non basta da sola.

Passaggi: I_B=8\,\mathrm{mW/m^2};  2^{x_B}=32/8;  2^{x_B}=4;  x_B=2;  d_B/d_A=2

Risposta proposta: 2.

Distrattori: Uno darebbe 16 mW/m², quattro darebbe 2 mW/m². Un mezzo inverte il rapporto degli spessori e un quarto copia il fattore delle uscite.

## AR-u7-beer-transmitted-intensity-14 — Decodificare prima dell’inversa

Ipotesi e percorso manuale d’autore: Il riferimento ha i=32, quindi g=3. La lettura 24 indica i=8, non 24 mW/m². A due centimetri la trasmittanza è un quarto: l’intensità incidente che produce 8 mW/m² è 32 mW/m².

Passaggi: g=96/32;  g=3;  i=24/3;  i=8;  I_0=8\cdot4\,\mathrm{mW/m^2};  I_0=32\,\mathrm{mW/m^2}

Risposta proposta: 32 mW/m².

Distrattori: Novantasei tratterebbe il display come intensità trasmessa e predirebbe D=72. Otto omette il recupero della perdita e 128 predirebbe D=96 alla nuova profondità.

## AR-u7-beer-transmitted-intensity-15 — L’offset non è un’intensità trasmessa

Ipotesi e percorso manuale d’autore: I riferimenti trasmettono 32 e 8 mW/m². La differenza delle letture fissa g=48/24=2, poi b=1. La lettura 33 corrisponde a i_C=16. Per un centimetro l’incidente è il doppio, cioè 32 mW/m².

Passaggi: g=\frac{65-17}{32-8};  g=2;  b=1;  i_C=\frac{33-1}{2};  i_C=16;  I_{0,C}=32\,\mathrm{mW/m^2}

Risposta proposta: 32 mW/m².

Distrattori: Trentatré mW/m² omette l’offset e ricostruirebbe D=34; 64 omette il guadagno dopo aver sottratto b. Sedici copia l’uscita trasmessa, senza invertire il fattore un mezzo.

## AR-u7-beer-transmitted-intensity-16 — Due metà del fascio, due spessori

Ipotesi e percorso manuale d’autore: Non si deve attenuare lo spessore medio. Le due metà hanno uguale area: se la prima trasmette J, la seconda trasmette J/2. Il rivelatore misura (J+J/2)/2=3J/4. Da 6 mW/m² ricavo J=8 mW/m²; la prima metà ha quindi subito tre dimezzamenti da 64 a 8, cioè d=3 cm.

Passaggi: J=64\,2^{-x}\,\mathrm{mW/m^2};  I_{\rm media}=\frac{J+J/2}{2};  I_{\rm media}=\frac34J;  J=8\,\mathrm{mW/m^2};  2^x=8;  d=3\,\mathrm{cm}

Risposta proposta: 3 cm.

Distrattori: Due centimetri darebbero media 12 mW/m², quattro darebbero 3 mW/m². Usare d+1/2 cm direttamente nell’esponenziale equivale a confondere media delle intensità e intensità allo spessore medio. La potenza totale raccolta è la somma sulle due mezze aree.
