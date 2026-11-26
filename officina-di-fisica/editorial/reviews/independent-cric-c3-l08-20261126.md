# Revisione distinta cric-c3-l08

Dieci problemi originali distinti. Primaria manuale e modello computazionale sono stati congelati prima delle chiavi. Ogni record originale e candidato è stato letto per intero, insieme alle lezioni pertinenti. I cinque nuovi SVG sono stati controllati in XML e in cinque PNG indipendenti interi, acquisiti con processo reale terminato a zero. I nove SVG originali sono stati riletti integralmente in XML.

Gli oracoli indipendenti verificano 10/10 record di questo cohort. Il target comune ha concluso 21 test con exit 0. Le letture manuali, i test e le immagini non costituiscono una prova UI del prodotto o un’approvazione umana. Stato DRAFT; integrazione e credito rimangono di competenza Root.

## C3-Q071

Ipotesi e dominio: Ciclo semplice quasi statico, assi Vdestra/palto, orientazione oraria; base e altezza sono differenze positive.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Nel piano con V verso destra e p verso l’alto, la percorrenza oraria dà lavoro uscente positivo. L’area triangolare è (1/2)·4 L·60 kPa=120 J. Non si usa tutto il rettangolo circoscritto e non si sommano i valori assoluti dei lavori dei tratti.

Confronto delle alternative: 240 J è l’area del rettangolo e−120 J il verso inverso. Il ritorno di U non annulla il lavoro ciclico.

Verifica: EXACT_ORACLE; firma `c39ece2a8b0096449781e64739db0429d008c67450339ff1b5889c4908dc86d4`.

## C3-Q072

Ipotesi e dominio: Identico contorno ripercorso, solo orientazione invertita.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Invertire il verso di percorrenza cambia il segno dell’integrale chiuso ∮p dV e conserva il suo modulo. Una curva oraria positiva diventa antioraria negativa; non cambiano soltanto i nomi degli stati.

Confronto delle alternative: Non compare una nuova area o un fattore due: cambia soltanto il segno dell’integrale orientato.

Verifica: AI_CONCEPTUAL; firma `13a14ecd39c88f9c449fc11fba2ab93626a5225bba57ce0b3a08043e8d521570`.

## C3-Q073

Ipotesi e dominio: Ritorno allo stato termodinamico intero, non soltanto allo stesso volume.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Una sequenza completa che riporta il fluido al suo stato iniziale è un ciclo. Il ritorno allo stato non obbliga calore e lavoro netti ad essere nulli, perché non sono funzioni di stato.

Confronto delle alternative: Un ciclo non è per definizione una singola isoterma o un processo senza scambi.

Verifica: AI_CONCEPTUAL; firma `b2d8800d7950828b41adc47833119b7e79214947f33673dec72a4315ad01eafe`.

## C3-Q074

Ipotesi e dominio: 24 J per ciclo identico,150 cicli in 60 s, media sul periodo; nessuna ipotesi di potenza istantanea costante.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: La frequenza dei cicli è 150/60=5/2 s⁻¹. Con 24 J per ciclo, P_media=24·5/2=60 W. Il minuto va convertito in secondi; non sono 3600 W.

Confronto delle alternative: 3600 copia il valore numerico del lavoro del minuto; manca la divisione per 60 s. 24 J per ciclo non sono 24 W; 0,16 non rappresenta lavoro totale diviso durata.

Verifica: EXACT_ORACLE; firma `c64165235d402b4ea5473233bd288a8ce1ad031b61905182a81987515b0dae50`.

## C3-Q075

Ipotesi e dominio: Calore entrante positivo, cessione negativa; il saldo è distinto dai singoli moduli.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Con calore entrante positivo, il calore netto è +400−300=+100 J. Per un ciclo del gas ΔU=0, quindi anche il lavoro netto uscente è 100 J. 700 J sarebbe la somma dei moduli, non lo scambio netto.

Confronto delle alternative: 700 J somma i moduli; −100 J inverte il segno; 400 J omette la cessione. La variazione ciclica di U è distinta dal calore netto.

Verifica: EXACT_ORACLE; firma `c19d2169fa5163aa34d3b01c1848f69308c37bbdd6a6c28c1a6a7a3e35040570`.

## C3-Q076

Ipotesi e dominio: Tre cicli IDENTICI:1,8 kJ è lavoro totale e 2,0 kJ è ingresso per ciascun ciclo; Qc richiesto come modulo.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Il lavoro per ciclo è 1,8/3=0,6 kJ. Per ΔU_ciclo=0, il modulo ceduto è Q_c=Q_h−W=2,0−0,6=1,4 kJ per ciclo. Non si sottraggono 1,8 kJ totali dai 2,0 kJ di un singolo ciclo.

Confronto delle alternative: 0,2 kJ mescola lavoro di tre cicli e calore di uno; 0,6 kJ è lavoro; 2,6 kJ somma invece di sottrarre; 4,2 kJ è il totale ceduto in tre cicli.

Verifica: EXACT_ORACLE; firma `6ffddbea8bbab3f548c1b2340f55a61e9a95ca5f7b3684be9cdbddddabf2b980`.

## C3-Q077

Ipotesi e dominio: Curva semplice chiusa in diagramma pV con convenzione di lavoro uscente.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: La percorrenza oraria di una curva semplice chiusa dà ∮p dV>0 con gli assi assegnati. L’espansione avviene mediamente alla pressione maggiore e la compressione a quella minore. La convenzione opposta sul lavoro invertirebbe il nome del segno, ma qui il lavoro del gas è uscente positivo.

Confronto delle alternative: Il verso antiorario dà lavoro negativo. Un segmento verticale ha dV=0 e non racchiude da solo un’area.

Verifica: AI_CONCEPTUAL; firma `4a66b13f137050096b1467ce4e247a66bc5e3e590f9263c7397a655b48a99829`.

## C3-Q078

Ipotesi e dominio: Ciclo rettangolare orario; differenza delle pressioni 50 kPa non pressione assoluta di un ramo.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: L’area del rettangolo è Δp·ΔV. Poiché 1 kPa·L=1 J, ΔV=150/50=3 L. I 50 kPa sono la separazione fra isobare, non la loro pressione assoluta.

Confronto delle alternative: Il prodotto 150·50 non dà un volume. Un intervallo di 1/3 L ricostruisce 50/3 J; zero annulla l’area.

Verifica: EXACT_ORACLE; firma `ffced099edd1d64632855df5408a1692f41b0a66066bcf560bbf38cf43a4efdc`.

## C3-Q079

Ipotesi e dominio: Fluido torna allo stesso stato anche se il ciclo è irreversibile; entropia del solo fluido distinta da quella dell’insieme.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Tornando allo stesso stato termodinamico ogni funzione di stato del fluido ha variazione nulla: in particolare ΔU=0 e ΔS=0, e ritornano anche p,V,T. Calore e lavoro di ciclo possono invece essere non nulli. Prima di vedere le opzioni non considero esclusiva una coppia: qualunque coppia di vere funzioni di stato avrebbe questa proprietà.

Confronto delle alternative: Calore e lavoro non sono funzioni di stato. La produzione irreversibile non impone un aumento dell’entropia finale del solo fluido ciclico.

Verifica: AI_CONCEPTUAL; firma `4923cc1c03ce73edf4010fd174ebfcd184102934698213a63cab3d6436e1c531`.

## C3-Q080

Ipotesi e dominio: Stato ciclico di tutte le energie, due apporti e una cessione con segni; lavoro uscente può risultare negativo.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Il calore netto entrante è 80+50−170=−40 J. Su un ciclo ΔU=0, dunque W_gas=Q_netto=−40 J. Il ciclo richiede 40 J di lavoro esterno; prendere il solo modulo perderebbe il segno richiesto.

Confronto delle alternative: 40 J inverte il verso; 300 J somma i moduli; 130 J omette la cessione. Zero confonde il lavoro con ΔU.

Verifica: EXACT_ORACLE; firma `37ead1e5a91db66ef7863eaf0e52d4b5b33b62001222f55dc5dea60d3788a92c`.
