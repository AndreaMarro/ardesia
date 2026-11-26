# cric-c2-l008 — dieci problemi Cric distinti

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C2.json, SHA7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23. Letti individualmente soltanto enunciati e metadati allowlist, insieme alle lezioni C2-L006–L010 e ai loro prerequisiti reali. Nessuna risposta, opzione, soluzione o figura originale usata per derivare le nuove risposte.

Primarie reciproche prima dei candidati: B sui cinquanta A001–050, commit9dc54dba, SHA34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237; A sui cinquanta B051–100, commit026127465e30476b3e8bdb874d9bd98520a0b8d2, SHAa51ecd2856370b38a67fd59f09b4dbce23eda319c27e5d379428b9fd67b1dc92. La primaria A è stata ricevuta soltanto come hash/percorso e non aperta durante l’autoria. Modello B per futura review A congelato in e37686eb, SHA02b2341e89122709fcddfb6a48318d3d87ded5385cbbfada9e69edaad05007dc, prima di aprire qualunque candidato A C2.

Sono dieci problemi differenti, non sedici variazioni di una famiglia artificiale. ID, corso, skill, famiglia, difficoltà, prerequisiti, ordine, flag exam e versione individuale originali conservati. Nuova version=baseVersion+1. Procedura manuale esatta, ipotesi fisiche e distrattori scritti per ciascun compito.

Unico assembler/importatore canonico; nessuna seconda ETL. Dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}. Il file helper è copiato byte-esatto per l’esecuzione e non attribuito a questa autoria.

Due assembly effettive identiche e import canonico entro il budget originale60 s: dieci salvati DRAFT, poi zero salvati/dieci invariati in SQLite temporaneo. I991 pubblicati e tutti i live head storici restano byte-invariati. Operazioni reali terminali0/null signal sotto mutex e guardia ≥2 GiB. Il PNG nativo completo è stato aperto e letto insieme all’XML: prova asset-only, non UI prodotto. Nessuna propria review scientifica, approvazione umana o pubblicazione: SCI/UI prodotto/human NOT_RUN, DRAFT.

## C2-Q071 — La pompa mantiene la portata

Versione 2, base 1; famiglia la-pompa-mantiene-la-portata; difficoltà 2.

Modello e passaggi: Con portata controllata non tengo fissa la pressione: Δp=R_hQ e R_h cresce come r⁻⁴. Nel rapporto restano le quattro potenze del rapporto inverso dei raggi: (3/2)⁴=81/16. Il tubo più stretto richiede una maggiore caduta, coerente con un rapporto superiore a uno.

Leggi e calcolo manuale: \Delta p=\frac{8\eta LQ}{\pi r^4};  \frac{\Delta p_B}{\Delta p_A}=\left(\frac{r_A}{r_B}\right)^4;  \frac{\Delta p_B}{\Delta p_A}=\frac{81}{16}

Risposta d’autore proposta: 81/16.

Distrattori e limiti: 16/81 inverte le prove; 9/4 usa solo il quadrato, 3/2 solo la prima potenza. Sedici sarebbe il fattore per un raggio dimezzato, non per 3 mm che diventano 2 mm.

## C2-Q072 — Viscosità e lunghezza cambiano insieme

Versione 2, base 1; famiglia lunghezza-e-viscosita-cambiano-insieme; difficoltà 2.

Modello e passaggi: La portata è inversamente proporzionale al prodotto ηL quando r e Δp sono controllati. Il nuovo prodotto è (1/2)·3=3/2 del precedente, quindi Q_B/Q_A=2/3. Moltiplico 9 per 2/3 e ottengo 6 mL/s: dimezzare la viscosità aiuta il flusso, ma il triplo della lunghezza ha l’effetto opposto.

Leggi e calcolo manuale: Q\propto\frac1{\eta L};  \frac{Q_B}{Q_A}=\frac{\eta_A L_A}{\eta_B L_B};  \frac{Q_B}{Q_A}=\frac23;  Q_B=6\,\mathrm{mL/s}

Risposta d’autore proposta: 6 mL/s.

Distrattori e limiti: 18 mL/s considera soltanto la viscosità; 3 mL/s soltanto la lunghezza. 27/2 mL/s moltiplica per il nuovo prodotto ηL invece di usarne l’inverso. Nove ignorerebbe entrambe le variazioni.

## C2-Q073 — Che cosa misura la pendenza

Versione 2, base 1; famiglia scegliere-la-pendenza-pertinente; difficoltà 2.

Modello e passaggi: Una pendenza è variazione verticale divisa per quella orizzontale. Poiché Δp=R_hQ e la retta passa per l’origine, il coefficiente è la resistenza idraulica, con unità Pa·s/m³ se Q è in m³/s. Anche la geometria contribuisce a R_h: la pendenza non misura la sola viscosità senza altri dati.

Leggi e calcolo manuale: \Delta p=R_hQ;  \frac{\Delta(\Delta p)}{\Delta Q}=R_h;  [R_h]=\mathrm{Pa\,s/m^3}

Risposta d’autore proposta: La resistenza idraulica R_h=Δp/Q.

Distrattori e limiti: La conduttanza sarebbe la pendenza del grafico con assi scambiati. La potenza è un prodotto, non un rapporto. La portata è una coordinata e non una proprietà costante della retta.

## C2-Q074 — Triplicare Q cambiando soltanto il raggio

Versione 2, base 1; famiglia quanto-raggio-serve; difficoltà 2.

Modello e passaggi: Con i parametri controllati Q è proporzionale a r⁴. Quindi Q_B/Q_A=α⁴=3. L’unica radice fisica per un rapporto di raggi positivi è la radice quarta di tre. Non serve valutarla in decimale: il controllo manuale consiste nel riportarla alla quarta e ottenere tre.

Leggi e calcolo manuale: \alpha=\frac{r_B}{r_A}>0;  \alpha^4=3;  \alpha=\sqrt[4]{3}

Risposta d’autore proposta: ⁴√3.

Distrattori e limiti: Tre porterebbe Q a 81 volte il valore iniziale; √3 la porterebbe a nove volte. I due fattori minori di uno ridurrebbero la portata invece di triplicarla.

## C2-Q075 — Mettere il diametro al posto del raggio

Versione 2, base 1; famiglia diametro-inserito-al-posto-del-raggio; difficoltà 2.

Modello e passaggi: Raggio e diametro hanno la stessa dimensione ma valori diversi. Sostituire d=2r nel numeratore porta (2r)⁴=16r⁴, quindi il risultato errato è sedici volte quello corretto. Il controllo dimensionale da solo non riconosce questo errore: serve il rapporto geometrico.

Leggi e calcolo manuale: d=2r;  \frac{Q_{\rm errata}}{Q_{\rm corretta}}=\left(\frac dr\right)^4;  \frac{Q_{\rm errata}}{Q_{\rm corretta}}=16

Risposta d’autore proposta: Viene sovrastimata di un fattore 16.

Distrattori e limiti: Due usa la prima potenza e quattro il quadrato. La sottostima avrebbe il verso opposto, perché nel numeratore è stata inserita una lunghezza maggiore. Unità uguali non implicano numeri uguali.

## C2-Q076 — Dalla resistenza misurata alla caduta

Versione 3, base 2; famiglia la-caduta-misurata; difficoltà 2.

Modello e passaggi: R_h è espresso usando m³, perciò converto 2,5 mL/s in (5/2)·10⁻⁶ m³/s. Moltiplicando 8 per 5/2 ottengo 20 e le potenze danno 10²: 2000 Pa. Infine divido per 1000 Pa/kPa, ottenendo 2 kPa.

Leggi e calcolo manuale: Q=\frac52\,10^{-6}\,\mathrm{m^3/s};  \Delta p=R_hQ;  \Delta p=2000\,\mathrm{Pa};  \Delta p=2\,\mathrm{kPa}

Risposta d’autore proposta: 2 kPa.

Distrattori e limiti: 2000 è il coefficiente in pascal, non in kilopascal. Saltare la conversione mL→m³ introdurrebbe un fattore un milione. Dividere Q per R_h non ricostruisce una pressione e inverte la relazione assegnata.

## C2-Q077 — Una proprietà del materiale

Versione 2, base 1; famiglia una-proprieta-che-raddoppia-la-resistenza; difficoltà 1.

Modello e passaggi: Nella resistenza R_h=8ηL/(πr⁴), il coefficiente η entra linearmente. Se la geometria resta fissa e η raddoppia, raddoppia R_h. Pa·s identifica la viscosità dinamica, distinta dalla viscosità cinematica η/ρ che ha unità m²/s.

Leggi e calcolo manuale: R_h=\frac{8\eta L}{\pi r^4};  \eta_B=2\eta_A;  R_{h,B}=2R_{h,A}

Risposta d’autore proposta: La viscosità dinamica η.

Distrattori e limiti: La densità non compare in questa relazione di resistenza. La tensione superficiale ha unità N/m. Il raggio è geometria e agisce alla quarta inversa; la velocità media non è il coefficiente materiale richiesto.

## C2-Q078 — Prima dell’uso del profilo sviluppato

Versione 2, base 1; famiglia tubetto-corto-appena-dopo-un-raccordo; difficoltà 3.

Modello e passaggi: All’ingresso il profilo può ancora evolvere lungo il tubo: la viscosità diffonde l’effetto della parete verso il centro. La parabola di Poiseuille vale nel tratto sviluppato, dove la forma del profilo non cambia più lungo l’asse di un tubo uniforme. Essere laminare non basta a garantire questa condizione geometrica e dinamica.

Leggi e calcolo manuale: \text{tratto sviluppato: }\partial_xv_x(r)=0;  v(r)=v_{\max}\left(1-\frac{r^2}{R^2}\right)

Risposta d’autore proposta: Che il profilo sia pienamente sviluppato nel tratto di misura.

Distrattori e limiti: Pressione nulla e densità nulla non sono requisiti del profilo. Una velocità uniforme sarebbe incompatibile con la parabola sviluppata e l’aderenza a una parete ferma. Il regime laminare può avere un tratto d’ingresso ancora in evoluzione.

## C2-Q079 — La potenza che sostiene il flusso

Versione 2, base 1; famiglia potenza-fornita-dal-salto-di-pressione; difficoltà 3.

Modello e passaggi: Durante una durata Δt attraversa il tubo un volume ΔV=QΔt. Il lavoro netto delle pressioni è ΔpΔV; dividendo per Δt ottengo P=ΔpQ. Converto 3 kPa in 3000 Pa: il prodotto è 12·10⁻³ W, cioè 12 mW. Con velocità e quota invariate questa potenza sostiene la dissipazione meccanica.

Leggi e calcolo manuale: W=\Delta p\,\Delta V;  \Delta V=Q\Delta t;  P=\Delta p\,Q;  P=12\,10^{-3}\,\mathrm W;  P=12\,\mathrm{mW}

Risposta d’autore proposta: 12 mW.

Distrattori e limiti: 0,012 è il coefficiente in watt, non in milliwatt. Una somma fra pressione e portata non è una potenza. Δp/Q è la resistenza idraulica: il prodotto e il rapporto hanno ruoli e unità diversi.

## C2-Q080 — Pressioni uguali in un tubo passivo

Versione 2, base 1; famiglia pressioni-ai-due-estremi-uguali; difficoltà 2.

Modello e passaggi: Per un tubo finito con raggio e viscosità positivi, R_h è positiva e finita. La differenza Δp è zero, dunque Q=Δp/R_h=0. Questo è il risultato stazionario del modello passivo: non descrive un transitorio iniziale né un trascinamento da pareti mobili, esclusi dall’enunciato.

Leggi e calcolo manuale: \Delta p=0;  R_h>0;  Q=\frac{\Delta p}{R_h};  Q=0

Risposta d’autore proposta: Q=0.

Distrattori e limiti: Una portata orientata non nulla richiederebbe una forzante presente nel bilancio. Una portata infinita non segue da una resistenza finita positiva. La legge collega esplicitamente Q alla differenza di pressione, non alle pressioni assolute prese separatamente.
