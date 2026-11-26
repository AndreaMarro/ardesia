# photon-packet-wavelength-245 — note di autoria

16 candidati astra/1 DRAFT. Calcoli proposti dall’autore per una revisione distinta, non una certificazione scientifica propria. SCI propria, approvazione umana e UI del prodotto NOT_RUN. Nessuna modifica al registro o alla pubblicazione.

Fonte Ardesia `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-01.json`, SHA `609dec0246ff1cd1b89afed2ea7258c0f65ff8e853735ce9196fe24829fc1233`. Tutti gli 80 prompt B245–249 sono stati letti prima dei candidati; estrazione allowlist id/prompt/familyId/lawFamily, senza opzioni, chiavi o soluzioni originali.

La primaria indipendente A dei nostri 80 è congelata prima della prima scrittura: commit `b3932757`, SHA `6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08`. Ricevuti solo SHA e percorso, mai aperta. La nostra primaria A240–244 è congelata in `8a82a325`, SHA `8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d`, prima dei candidati A.

Catalogo reale letto al pin Cric `5d1dc8dc7b601aef959d10d564c75462be74708d`: `officina-di-fisica/content/C5.json`, SHA `dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422`. C5-L07 copre fotoni e attenuazione; prerequisito L06 e fondazioni L02/L04 mantenuti dove pertinenti. Il caso autonomo 247-03 sull’indice usa C5-L06, senza ereditare l’assorbitore.

Riferimenti primari controllati per le leggi, senza riprodurne testi o esercizi: [OpenStax, relazioni del fotone](https://openstax.org/books/university-physics-volume-3/pages/6-key-equations); [NIST, attenuazione esponenziale](https://physics.nist.gov/PhysRefData/XrayMassCoef/chap2.html). Il coefficiente NIST di massa è distinto dal coefficiente lineare μ qui assegnato: usando x=ρd, i due esponenti coincidono. I valori h e c nei quesiti sono dati di esercizio dichiarati, non valori esatti della natura. Nessun consiglio clinico.

Una sola pipeline esistente: assemble_family/law_steps, due assembly identiche, import canonico su SQLite temporaneo 16 salvati poi 0 nuovi/16 invariati. I 991 pubblicati rimangono byte-identici e nessun live head è creato. Operazioni sequenziali sotto mutex condiviso con guardia ≥2 GiB; importatore mantenuto al budget originale di 60 s. Le ricevute attestano soltanto exit reali, non una review scientifica.

Geometria d’autore per il revisore (coordinate intrinseche SVG, non unità fisiche o pixel CSS): Pannello 1: periodo 300 coordinate per 660 nm e 150 per 330 nm, stessa scala orizzontale; profili schematici con ampiezza verticale non quantitativa. Pannello 2: origine x=150, 25 coordinate per E_*; barre 3,12,15/2 E_* lunghe 75,300,187.5. Pannello 3: origine (150,1480),120 coordinate per 660 nm e80 coordinate per fotone; soli punti (660 nm,1),(1320 nm,2),(1980 nm,3), senza segmento continuo che autorizzi N frazionari. Tutte le etichette e la figura intera 640×1600 sono state lette.

Il PNG nativo a piena altezza è stato effettivamente aperto e letto dall’autore, confrontandolo con XML. Resa asset-only; nessuna UI responsive del prodotto o accettazione scientifica anticipata.

## AR-u7-photon-packet-wavelength-01 — Dal singolo fotone al pacchetto

Ipotesi e percorso manuale d’autore: La frequenza nel vuoto è c/λ₀ e ciascun fotone porta energia hc/λ₀. Il pacchetto somma N contributi uguali. Prima converto i nanometri in metri: il prodotto hc assegnato è 1,98×10⁻²⁵ J·m. Dividendo per 660×10⁻⁹ m si trovano tre unità E_*. Il fattore 1980 della forma numerica contiene proprio questa conversione.

Passaggi: E=\frac{Nhc}{\lambda_0};  hc=1{,}98\times10^{-25}\,\mathrm{J\,m};  e=\frac{1980N}{\ell};  e=\frac{1980}{660};  e=3

Risposta proposta: 3 10⁻¹⁹ J.

Distrattori: Sei corrisponderebbe a due fotoni con questa lunghezza d’onda, non a uno. 1/3 è il reciproco del valore normalizzato richiesto; 1980 omette la divisione per ℓ. Un valore in joule va distinto dal suo numero e nelle unità E_*.

## AR-u7-photon-packet-wavelength-02 — La dimensione dell’energia

Ipotesi e percorso manuale d’autore: Il numero di fotoni è adimensionale. Moltiplicare N per l’energia hc/λ₀ mantiene la dimensione di un’energia: un joule. Anche 10⁻¹⁹ J è un’unità energetica di scala diversa; non è una frequenza né una potenza.

Passaggi: [h]=\mathrm{J\,s};  [c/\lambda_0]=\mathrm{s^{-1}};  [E]=\mathrm J

Risposta proposta: J.

Distrattori: Hz misura una frequenza, W e J/s sono potenze equivalenti, nm una lunghezza. La presenza della lunghezza d’onda nel denominatore della legge non rende l’energia una lunghezza.

## AR-u7-photon-packet-wavelength-03 — Una legge fisica, due forme

Ipotesi e percorso manuale d’autore: La relazione di Planck vale per ogni fotone e la somma sul pacchetto è lineare nel conteggio. Sostituire λ₀=ℓ·10⁻⁹ m in Nhc/λ₀ e dividere per E_* produce e=1980N/ℓ. Il numero ℓ è adimensionale; se si scrive invece λ₀ come grandezza fisica occorre mantenere hc con le sue unità.

Passaggi: E=\frac{Nhc}{\lambda_0};  \lambda_0=\ell\,\mathrm{nm};  e=\frac{1980N}{\ell}

Risposta proposta: e = 1980 N / ℓ.

Distrattori: Moltiplicare per ℓ renderebbe più energetici i fotoni di lunghezza d’onda maggiore. I reciproci scambiano la dipendenza da N, mentre N² introdurrebbe un’interazione assente nel modello di somma di energie.

## AR-u7-photon-packet-wavelength-04 — Raddoppiare un conteggio

Ipotesi e percorso manuale d’autore: L’energia di ciascun fotone resta 3 E_*. Nel secondo pacchetto si sommano due contributi uguali: 6 E_*. Entrambi i conteggi sono interi e la lunghezza d’onda non cambia. Il confronto non descrive la divisione dell’energia di un singolo fotone in due parti.

Passaggi: E_A=3E_*;  E_B=2\cdot3E_*;  E_B=6E_*;  E_B/E_A=2

Risposta proposta: Da 3 E_* a 6 E_*.

Distrattori: 3/2 E_* segue una dipendenza inversa dal conteggio; 12 E_* introduce il quadrato del fattore due. Tre ignora il secondo fotone e zero contraddice N>0 ed energia positiva.

## AR-u7-photon-packet-wavelength-05 — L’inversa deve restituire un intero

Ipotesi e percorso manuale d’autore: Isolo il conteggio nella legge dell’energia. Ogni fotone a 660 nm porta 3 E_*; il rapporto fra l’energia totale e quella di un fotone vale uno. Il valore positivo ottenuto è anche intero, condizione essenziale per un pacchetto concreto.

Passaggi: N=\frac{E\lambda_0}{hc};  N=\frac{e\ell}{1980};  N=\frac{3\cdot660}{1980};  N=1

Risposta proposta: 1 1.

Distrattori: Tre copia il numero e dell’energia, mentre due predirebbe 6 E_*. Il risultato 1/3 non sarebbe un conteggio ammissibile in questo quesito e non ricostruirebbe l’energia assegnata.

## AR-u7-photon-packet-wavelength-06 — Ricostruire la lunghezza d’onda

Ipotesi e percorso manuale d’autore: A conteggio noto, la lunghezza d’onda è Nhc/E. Nella forma normalizzata ℓ=1980N/e, quindi ℓ=660. L’inversa dà la lunghezza d’onda nel vuoto: sostituire una lunghezza nel mezzo richiederebbe conoscere anche l’indice.

Passaggi: \lambda_0=\frac{Nhc}{E};  \ell=\frac{1980N}{e};  \ell=660;  \lambda_0=660\,\mathrm{nm}

Risposta proposta: 660 nm.

Distrattori: 330 nm darebbe 6 E_* e 1320 nm darebbe (3/2) E_* con un fotone. 1980 nm darebbe E_*, non 3 E_*. La verifica diretta evita di attribuire un’unità di energia al numero 660.

## AR-u7-photon-packet-wavelength-07 — Stesso conteggio, metà lunghezza d’onda

Ipotesi e percorso manuale d’autore: Con lo stesso numero di fotoni, dimezzare λ₀ raddoppia la frequenza e l’energia. Le due uscite sono 3 E_* e 6 E_*. Il quoziente finale su iniziale è due e non porta unità.

Passaggi: e_A=3;  e_B=6;  E_B/E_A=6/3;  E_B/E_A=2

Risposta proposta: 2.

Distrattori: Un mezzo segue direttamente λ₀ anziché il suo inverso; quattro aggiunge un quadrato. Uno ignora il cambiamento e 330 ripete un dato di lunghezza senza formare un rapporto.

## AR-u7-photon-packet-wavelength-08 — Il segno di uno scarto energetico

Ipotesi e percorso manuale d’autore: La legge indipendente dà 3 E_*. La proposta di 6 E_* è maggiore: sottraggo nell’ordine indicato e trovo +3 E_*. Il rapporto delle due energie sarebbe invece due, una quantità diversa dallo scarto.

Passaggi: E=3E_*;  \delta E=(6-3)E_*;  \delta E=3E_*

Risposta proposta: 3 E_*.

Distrattori: −3 E_* inverte la sottrazione; due è un rapporto puro. Sei copia la proposta e zero la accetta senza confrontarla con Nhc/λ₀.

## AR-u7-photon-packet-wavelength-09 — Isolare il conteggio senza perdere hc

Ipotesi e percorso manuale d’autore: Da Eλ₀=Nhc divido per hc, strettamente positivo. Eλ₀ e hc hanno entrambi unità J·m, perciò N è un numero puro. L’inversa deve poi essere confrontata con il dominio intero del conteggio; non basta una soluzione reale.

Passaggi: E\lambda_0=Nhc;  N=\frac{E\lambda_0}{hc};  [N]=1

Risposta proposta: N = E λ₀ / (h c).

Distrattori: E/(hcλ₀) ha dimensione m⁻²; hc/(Eλ₀) è il reciproco del conteggio, non la sua inversa algebrica richiesta. Eλ₀/h ha unità di velocità. Moltiplicare per hc anziché dividerlo non isola N.

## AR-u7-photon-packet-wavelength-10 — Scalare due parametri con conteggi ammessi

Ipotesi e percorso manuale d’autore: La legge è diretta in N e inversa in λ₀. Sostituisco i due fattori e cancello hc insieme ai dati iniziali: resta κ₁/κ₂. κ₁ non deve essere per forza intero; deve però trasformare il conteggio iniziale in un altro intero positivo.

Passaggi: E_B=\frac{\kappa_1N_Ahc}{\kappa_2\lambda_{0,A}};  E_B/E_A=\frac{\kappa_1}{\kappa_2}

Risposta proposta: κ₁ / κ₂.

Distrattori: Il prodotto rende diretta la dipendenza dalla lunghezza d’onda. Il quoziente inverso scambia i due stati. Il quadrato di κ₁ non è nella somma di energie e la somma darebbe due per prove identiche.

## AR-u7-photon-packet-wavelength-11 — Due modifiche che aumentano l’energia

Ipotesi e percorso manuale d’autore: In B ci sono due fotoni e ciascuno è due volte più energetico. Si passa da 3 E_* a 12 E_*: il rapporto è quattro. I due fattori si moltiplicano perché il dimezzamento della lunghezza d’onda agisce al denominatore.

Passaggi: e_A=3;  e_B=\frac{1980\cdot2}{330};  e_B=12;  E_B/E_A=4

Risposta proposta: 4.

Distrattori: Due considera una sola modifica; un quarto inverte il rapporto. Uno tratterebbe N e λ₀ come fattori diretti compensanti, mentre tre copia l’energia iniziale normalizzata.

## AR-u7-photon-packet-wavelength-12 — Media di energie, non di conteggi

Ipotesi e percorso manuale d’autore: Calcolo prima le energie fisiche dei due pacchetti, 3 E_* e 12 E_*. La loro media è (15/2) E_*. Non occorre che un’energia media sia un multiplo intero di una stessa energia di fotone, perché le due lunghezze d’onda sono diverse. I dati medi avrebbero N=3/2, che non descrive un singolo pacchetto; la loro sostituzione formale darebbe 6 E_*, comunque diversa dalla media richiesta.

Passaggi: \overline E=\frac{3+12}{2}E_*;  \overline E=\frac{15}{2}E_*;  N_{\rm medio}=\frac32;  e_{\rm dati\ medi}=6

Risposta proposta: (15/2) E_*.

Distrattori: Sei deriva dalla sostituzione formale degli ingressi medi, con conteggio non intero. Quindici somma senza dimezzare; 9/2 è la semidifferenza e dodici ripete B. La media delle letture è una statistica fra preparazioni.

## AR-u7-photon-packet-wavelength-13 — La lunghezza richiesta da un bersaglio

Ipotesi e percorso manuale d’autore: Il bersaglio energetico è 12 E_*. Con N=2, ℓ_B=1980·2/12=330. Rispetto ai 660 nm iniziali, il rapporto delle lunghezze è un mezzo. Non è necessario approssimare alcuna costante oltre ai valori già assegnati.

Passaggi: e_B=12;  \ell_B=330;  \lambda_{0,B}/\lambda_{0,A}=\frac12

Risposta proposta: 1/2.

Distrattori: Due invertirebbe il rapporto e darebbe E_B=E_A; quattro darebbe metà dell’energia iniziale. Un quarto darebbe fattore energetico otto, mentre uno darebbe soltanto due.

## AR-u7-photon-packet-wavelength-14 — Il display non conta direttamente fotoni

Ipotesi e percorso manuale d’autore: Il riferimento produce e=3, dunque g=3. La lettura nuova 36 corrisponde a e=12. A 330 nm ogni fotone porta 6 E_*: il numero è 12/6=2, intero positivo. La continuità del display non trasforma il conteggio fisico in una variabile continua.

Passaggi: g=9/3;  g=3;  e_B=36/3;  e_B=12;  N_B=\frac{12\cdot330}{1980};  N_B=2

Risposta proposta: 2 1.

Distrattori: Sei fotoni darebbero e=36 e D=108: è l’errore di leggere il display come energia normalizzata. Uno darebbe D=18; trentasei copia il display senza la taratura o la conversione fisica.

## AR-u7-photon-packet-wavelength-15 — Due riferimenti separano guadagno e offset

Ipotesi e percorso manuale d’autore: A e B hanno e=3 e 12. La differenza delle letture dà g=(25−7)/(12−3)=2; il riferimento A fissa b=1. D_C=13 corrisponde a e_C=6. A 660 nm ciascun fotone porta 3 E_* e il conteggio è due.

Passaggi: g=\frac{25-7}{12-3};  g=2;  b=1;  e_C=\frac{13-1}{2};  e_C=6;  N_C=2

Risposta proposta: 2 1.

Distrattori: 13/6 omette l’offset e non è neppure un conteggio intero; quattro omette il guadagno dopo aver tolto b e predirebbe D=25. Sei copia il numero energetico senza dividerlo per l’energia del fotone.

## AR-u7-photon-packet-wavelength-16 — Una scala libera, ma soltanto su conteggi interi

Ipotesi e percorso manuale d’autore: Sostituendo il vincolo, e=1980N/(660N)=3: la misura non aggiunge un’equazione indipendente. L’integralità resta però essenziale. Per ogni intero N≥1 si può scegliere λ₀=(660 nm)N; per esempio (1,660 nm) e (2,1320 nm). Ci sono infinite coppie enumerabili, non un continuo di valori di N.

Passaggi: \ell=660N;  e=\frac{1980N}{660N};  e=3;  N\in\{1,2,3,\ldots\}

Risposta proposta: Infinite coppie discrete, con N intero positivo.

Distrattori: Una o due coppie richiederebbero un dato indipendente che fissi la scala. La risposta “Nessuna coppia” è smentita dagli esempi. Tutte le coppie reali positive includerebbe frazioni di fotone, escluse dal modello di pacchetto.
