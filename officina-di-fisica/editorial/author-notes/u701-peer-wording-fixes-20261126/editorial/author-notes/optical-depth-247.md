# optical-depth-247 — note di autoria

16 candidati astra/1 DRAFT. Calcoli proposti dall’autore per una revisione distinta, non una certificazione scientifica propria. SCI propria, approvazione umana e UI del prodotto NOT_RUN. Nessuna modifica al registro o alla pubblicazione.

Fonte Ardesia `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-01.json`, SHA `609dec0246ff1cd1b89afed2ea7258c0f65ff8e853735ce9196fe24829fc1233`. Tutti gli 80 prompt B245–249 sono stati letti prima dei candidati; estrazione allowlist id/prompt/familyId/lawFamily, senza opzioni, chiavi o soluzioni originali.

La primaria indipendente A dei nostri 80 è congelata prima della prima scrittura: commit `b3932757`, SHA `6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08`. Ricevuti solo SHA e percorso, mai aperta. La nostra primaria A240–244 è congelata in `8a82a325`, SHA `8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d`, prima dei candidati A.

Catalogo reale letto al pin Cric `5d1dc8dc7b601aef959d10d564c75462be74708d`: `officina-di-fisica/content/C5.json`, SHA `dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422`. C5-L07 copre fotoni e attenuazione; prerequisito L06 e fondazioni L02/L04 mantenuti dove pertinenti. Il caso autonomo 247-03 sull’indice usa C5-L06, senza ereditare l’assorbitore.

Riferimenti primari controllati per le leggi, senza riprodurne testi o esercizi: [OpenStax, relazioni del fotone](https://openstax.org/books/university-physics-volume-3/pages/6-key-equations); [NIST, attenuazione esponenziale](https://physics.nist.gov/PhysRefData/XrayMassCoef/chap2.html). Il coefficiente NIST di massa è distinto dal coefficiente lineare μ qui assegnato: usando x=ρd, i due esponenti coincidono. I valori h e c nei quesiti sono dati di esercizio dichiarati, non valori esatti della natura. Nessun consiglio clinico.

Una sola pipeline esistente: assemble_family/law_steps, due assembly identiche, import canonico su SQLite temporaneo 16 salvati poi 0 nuovi/16 invariati. I 991 pubblicati rimangono byte-identici e nessun live head è creato. Operazioni sequenziali sotto mutex condiviso con guardia ≥2 GiB; importatore mantenuto al budget originale di 60 s. Le ricevute attestano soltanto exit reali, non una review scientifica.

Geometria d’autore per il revisore (coordinate intrinseche SVG, non unità fisiche o pixel CSS): Pannello 1: due percorsi da x150,80 coordinate/cm; rettangoli160/240 per2/3cm, altezza e colore schematici. Pannello 2: origine x150,50 coordinate per unità τ; barre2/6/4 lunghe100/300/200. Pannello 3: origine(150,1460),120 coordinate/cm e70 coordinate/τ; curva τ=x²/2, punto(390,1320) per2cm eτ2, origine aperta. La prima resa nativa autentica, pur terminale0 nelle asserzioni tecniche, mostrava la label del punto attraversata dalla curva: oldpackage/binding/SVG/PNG/ricevute sono preservati byte-exact in initial-point-label-overlap. Spostato soltanto quel testo da(404,1300) a(260,1285); curva/assi/dati invariati, poi nuove dueassembly/import e nuovo native completo640×1580 realmente0 e letto senza intersezioni. Nessun vecchio esito visuale attribuito alla nuova versione.

Il PNG nativo a piena altezza è stato effettivamente aperto e letto dall’autore, confrontandolo con XML. Resa asset-only; nessuna UI responsive del prodotto o accettazione scientifica anticipata.

## AR-u7-optical-depth-01 — Un esponente non ha unità

Ipotesi e percorso manuale d’autore: Il coefficiente misura l’attenuazione per unità di lunghezza. Moltiplicandolo per lo spessore percorso nella stessa unità si cancellano i centimetri: τ=2. Questo numero entra nell’esponenziale, mentre la frazione trasmessa è e⁻² e non il numero due.

Passaggi: \tau=\mu d;  \tau=(1\,\mathrm{cm^{-1}})(2\,\mathrm{cm});  \tau=2;  I/I_0=e^{-2}

Risposta proposta: 2 1.

Distrattori: Quattro introdurrebbe un quadrato assente e un mezzo invertirebbe il prodotto. Due centimetri sarebbe uno spessore geometrico, non l’esponente adimensionale; e⁻² è invece la trasmittanza.

## AR-u7-optical-depth-02 — Spessore ottico e dimensione

Ipotesi e percorso manuale d’autore: La dimensione inversa di μ si cancella con quella di d. Uno spessore ottico è un numero puro, benché il nome contenga la parola spessore. Anche la trasmittanza è adimensionale, ma è un’altra funzione, exp(−τ).

Passaggi: [\mu]=L^{-1};  [d]=L;  [\tau]=1

Risposta proposta: 1, adimensionale.

Distrattori: cm misura d, cm⁻¹ misura μ, W/m² un’intensità e s un intervallo temporale. Il nome della quantità non basta a deciderne l’unità.

## AR-u7-optical-depth-03 — Indice da parametri relativi assegnati

Ipotesi e percorso manuale d’autore: Uso soltanto la relazione fornita per questo mezzo e scelgo l’indice positivo. Il prodotto dei parametri relativi vale nove; la radice positiva è tre. μᵣ è qui la permeabilità relativa e non il coefficiente di attenuazione μ degli altri quesiti: i simboli appartengono a due casi distinti.

Passaggi: \varepsilon_r\mu_r=9\cdot1;  n=\sqrt9;  n=3

Risposta proposta: 3 1.

Distrattori: Nove omette la radice e un terzo ne prende il reciproco. −3 non è il ramo di indice positivo dichiarato. Nessuna lunghezza geometrica o intensità è necessaria a questo caso autonomo.

## AR-u7-optical-depth-04 — Tre volte il coefficiente

Ipotesi e percorso manuale d’autore: A spessore fisso τ è direttamente proporzionale a μ. Il prodotto passa da uno per due a tre per due, quindi da due a sei. La trasmittanza diminuirebbe da e⁻² a e⁻⁶: la sua variazione non è lo stesso rapporto lineare dello spessore ottico.

Passaggi: \tau_A=1\cdot2;  \tau_A=2;  \tau_B=3\cdot2;  \tau_B=6

Risposta proposta: Da 2 a 6.

Distrattori: 2/3 seguirebbe una dipendenza inversa e diciotto il quadrato del fattore tre. Tre copia il nuovo coefficiente come se fosse τ; due ignora il cambiamento di materiale.

## AR-u7-optical-depth-05 — Il coefficiente da τ e d

Ipotesi e percorso manuale d’autore: Divido lo spessore ottico per quello geometrico. Il rapporto 2/(2 cm) vale 1 cm⁻¹, positivo. La verifica μd=2 recupera l’esponente misurato e mantiene l’unità inversa di lunghezza.

Passaggi: \mu=\frac{\tau}{d};  \mu=\frac{2}{2\,\mathrm{cm}};  \mu=1\,\mathrm{cm^{-1}}

Risposta proposta: 1 cm⁻¹.

Distrattori: Quattro corrisponde al prodotto dei numeri anziché al quoziente e predirebbe τ=8. Due cm⁻¹ darebbe τ=4; un mezzo cm⁻¹ darebbe τ=1.

## AR-u7-optical-depth-06 — Lo spessore geometrico dall’esponente

Ipotesi e percorso manuale d’autore: Il coefficiente è per centimetro: per accumulare spessore ottico due occorrono due centimetri. Nell’inversa d=τ/μ, dividere per cm⁻¹ restituisce una lunghezza. Non si deve identificare τ e d per il solo fatto che in questo esempio hanno lo stesso numero.

Passaggi: d=\frac{\tau}{\mu};  d=\frac{2}{1\,\mathrm{cm^{-1}}};  d=2\,\mathrm{cm}

Risposta proposta: 2 cm.

Distrattori: Un mezzo cm darebbe τ=1/2, uno darebbe τ=1 e quattro darebbe τ=4. L’uguaglianza numerica τ=2 e d/(cm)=2 dipende dal coefficiente scelto.

## AR-u7-optical-depth-07 — Dimezzare la lunghezza percorsa

Ipotesi e percorso manuale d’autore: Gli spessori ottici sono due e uno. Il rapporto B/A è un mezzo perché il materiale è lo stesso e τ è lineare in d. Il rapporto delle intensità trasmesse sarebbe invece e: diminuire il percorso riduce le perdite, ma è un confronto su un’altra grandezza.

Passaggi: \tau_A=2;  \tau_B=1;  \tau_B/\tau_A=\frac12

Risposta proposta: 1/2.

Distrattori: Due inverte il rapporto; un quarto applica un quadrato non previsto. Uno ignora il nuovo d ed e confronta le trasmittanze anziché gli esponenti.

## AR-u7-optical-depth-08 — Sovrastimare lo spessore ottico

Ipotesi e percorso manuale d’autore: Il prodotto corretto vale due. La proposta quattro lo supera di due: lo scarto ordinato è +2 e resta adimensionale. Un eventuale errore sulla trasmittanza sarebbe diverso e avrebbe una dipendenza esponenziale.

Passaggi: \tau=2;  \delta\tau=4-2;  \delta\tau=2

Risposta proposta: 2.

Distrattori: −2 cambia l’ordine, quattro ripete la proposta e un mezzo è il rapporto corretto/proposto. Zero accetterebbe una τ non coerente con il prodotto assegnato.

## AR-u7-optical-depth-09 — L’inversa conserva l’unità di μ

Ipotesi e percorso manuale d’autore: Divido τ=μd per d, positivo. L’inversa μ=τ/d restituisce un inverso di lunghezza e la sostituzione ricostruisce il medesimo spessore ottico. Se si dispone invece della trasmittanza T, prima bisogna ricavare τ=−ln T.

Passaggi: \tau=\mu d;  \mu=\frac{\tau}{d};  [\mu]=L^{-1}

Risposta proposta: μ = τ / d.

Distrattori: τd e d/τ hanno dimensione di lunghezza. exp(−τ)/d conserva la dimensione richiesta ma non la legge fisica; −τ/d produrrebbe μ<0 nel dominio assegnato. La sola analisi dimensionale non basta.

## AR-u7-optical-depth-10 — Due fattori moltiplicativi

Ipotesi e percorso manuale d’autore: Sostituisco entrambi i fattori nel prodotto μd. Dividendo per μ_A d_A, strettamente positivo, si cancellano i dati iniziali e rimane κ₁κ₂. È la legge di scala dello spessore ottico, non quella della trasmittanza, che richiederebbe il rapporto degli esponenziali.

Passaggi: \tau_B=(\kappa_1\mu_A)(\kappa_2d_A);  \tau_B/\tau_A=\kappa_1\kappa_2

Risposta proposta: κ₁ κ₂.

Distrattori: I quozienti rendono inverso uno dei due fattori diretti. Il quadrato di κ₁ modifica il modello; la somma darebbe due quando nessuna preparazione cambia.

## AR-u7-optical-depth-11 — Cambiano materiale e percorso

Ipotesi e percorso manuale d’autore: A ha τ=2 e B ha τ=6. Il coefficiente raddoppia e lo spessore cresce di un fattore 3/2: il prodotto dei fattori è tre. Sei è il valore finale, non il rapporto col valore iniziale.

Passaggi: \tau_A=2;  \tau_B=2\cdot3;  \tau_B=6;  \tau_B/\tau_A=3

Risposta proposta: 3.

Distrattori: Un terzo inverte il confronto; due segue soltanto μ e 3/2 soltanto d. Copiare sei dimentica di dividere per τ_A.

## AR-u7-optical-depth-12 — Prima i prodotti, poi la media

Ipotesi e percorso manuale d’autore: I prodotti sono due e sei: la loro media vale quattro. Il prodotto degli ingressi medi sarebbe (3/2 cm⁻¹)(5/2 cm)=15/4, diverso da quattro. Mediare due esponenti non è neppure la stessa operazione che mediare le intensità trasmesse.

Passaggi: \overline\tau=\frac{2+6}{2};  \overline\tau=4;  \tau_{\rm dati\ medi}=\frac{15}{4}

Risposta proposta: 4.

Distrattori: 15/4 usa i parametri medi; otto somma senza dimezzare. Due e sei ripetono una sola preparazione, omettendo il peso dell’altra.

## AR-u7-optical-depth-13 — Il percorso richiesto da τ tripla

Ipotesi e percorso manuale d’autore: Il bersaglio è τ_B=6. Con coefficiente 2 cm⁻¹ bastano tre centimetri: d_B=τ_B/μ_B=3 cm. Rispetto ai due centimetri iniziali il rapporto richiesto è 3/2.

Passaggi: \tau_B=6;  d_B=3\,\mathrm{cm};  d_B/d_A=\frac32

Risposta proposta: 3/2.

Distrattori: Due terzi inverte il confronto. Tre copia il fattore dell’uscita, due il coefficiente nuovo come semplice numero; uno produrrebbe soltanto τ_B=4.

## AR-u7-optical-depth-14 — Tarare una misura adimensionale

Ipotesi e percorso manuale d’autore: Il riferimento ha τ=2, così g=3. La nuova lettura indica τ=6. Dividendo per lo spessore geometrico di tre centimetri ricavo μ=2 cm⁻¹. Il fatto che τ e D siano entrambi adimensionali non autorizza a identificarli.

Passaggi: g=6/2;  g=3;  \tau=18/3;  \tau=6;  \mu=2\,\mathrm{cm^{-1}}

Risposta proposta: 2 cm⁻¹.

Distrattori: Sei cm⁻¹ tratterebbe il display 18 come τ e darebbe D=54. Un cm⁻¹ produrrebbe D=9 e tre cm⁻¹ produrrebbe D=27 allo stesso spessore.

## AR-u7-optical-depth-15 — Separare due numeri strumentali

Ipotesi e percorso manuale d’autore: I due esponenti di riferimento sono due e sei. Le differenze danno g=(13−5)/(6−2)=2, poi b=1. D_C=9 corrisponde a τ_C=4. A uno spessore di un centimetro il coefficiente è quindi 4 cm⁻¹.

Passaggi: g=\frac{13-5}{6-2};  g=2;  b=1;  \tau_C=\frac{9-1}{2};  \tau_C=4;  \mu_C=4\,\mathrm{cm^{-1}}

Risposta proposta: 4 cm⁻¹.

Distrattori: 9/2 cm⁻¹ omette l’offset e predirebbe D=10. Otto omette il guadagno dopo aver tolto b; nove copia la lettura senza nessuna delle due correzioni.

## AR-u7-optical-depth-16 — Un vincolo fra preparazioni

Ipotesi e percorso manuale d’autore: Il vincolo lega il coefficiente al percorso scelto in prove diverse, non alla posizione interna in una stessa lastra. Ogni lastra rimane omogenea. Se x=d/(1 cm), allora μ=(x/2) cm⁻¹ e τ=x²/2. La misura dà x²=4; il dominio d>0 seleziona x=2, senza il ramo negativo.

Passaggi: x=\frac{d}{1\,\mathrm{cm}};  \tau=\frac{x^2}{2};  x^2=4;  x=2;  d=2\,\mathrm{cm}

Risposta proposta: 2 cm.

Distrattori: −2 cm viola lo spessore positivo; quattro cm darebbe τ=8 e uno cm darebbe τ=1/2. Il dato assoluto τ non è ridondante con questo vincolo e fissa un’unica scala positiva.
