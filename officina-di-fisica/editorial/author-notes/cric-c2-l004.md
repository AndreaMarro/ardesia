# cric-c2-l004

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C2.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C2-Q031

Compito: Un corpo rigido di forma irregolare, completamente immerso senza contatti, esclude 75 cm³ d’acqua. Usa ρ=1000 kg/m³ e g=10 m/s²; trascura la spinta dell’aria e la capillarità. Qual è il modulo della spinta idrostatica?

Procedimento: Per Archimede la spinta è il peso del liquido spostato. Il volume escluso è 75·10⁻⁶ m³, quindi la massa d’acqua equivalente è 1000·75·10⁻⁶=0,075 kg. Moltiplicando per g ottengo 0,75 N. La forma irregolare non impedisce il calcolo se il volume immerso è noto.

Passaggi esatti: `V=75\cdot10^{-6}\,\mathrm{m^3}\qquad m_f=\rho V=0{,}075\,\mathrm{kg}\qquad S=\rho gV\qquad S=\frac34\,\mathrm N`.

Distrattori: 7,5 N e 0,075 N differiscono di un fattore dieci dalla spinta corretta. 75 N e 750 N trattano il numero dei cm³ senza convertirne l’unità nel prodotto SI. Non si usa il volume totale del recipiente né serve conoscere la massa del corpo per ottenere la spinta.

Aiuto: Trova il peso dei 75 cm³ d’acqua che occuperebbero il posto del corpo.

Famiglia: `un-volume-totalmente-immerso`; difficoltà 2; versione 2/base 1.

## C2-Q032

Compito: Una sfera rigida completamente immersa, lontana dalle pareti, viene portata più in basso in un liquido omogeneo e incomprimibile in quiete. Densità e g sono costanti. Come cambia il modulo della spinta?

Procedimento: La spinta vale ρgV per un corpo completamente immerso. Densità, g e volume escluso non cambiano, dunque la risultante resta uguale. In profondità crescono le pressioni su tutta la superficie, ma il loro contributo comune non cambia la risultante verticale su una superficie chiusa.

Passaggi esatti: `S_1=\rho gV\qquad S_2=\rho gV\qquad S_2=S_1`.

Distrattori: La proporzionalità con la profondità confonde pressione locale e spinta risultante. Una pressione maggiore non implica una spinta minore. Il contatto con l’aria non è necessario per Archimede; pressione e forza hanno inoltre unità diverse. La rigidità esclude una contrazione del volume con la profondità.

Aiuto: Elenca i fattori di ρgV e verifica quali sono cambiati.

Famiglia: `scendere-piu-in-profondita`; difficoltà 2; versione 2/base 1.

## C2-Q033

Compito: Un galleggiante rigido di massa 0,12 kg e volume 200 cm³ è fermo e completamente sott’acqua, senza toccare pareti. Usa ρ=1000 kg/m³ e g=10 m/s². Oltre a peso e spinta si applica una forza verticale verso il basso. Qual è il suo modulo?

Procedimento: La spinta verso l’alto è 1000·10·200·10⁻⁶=2 N. Il peso verso il basso vale 0,12·10=1,2 N. All’equilibrio, scegliendo l’alto positivo, S−P−F=0: serve F=S−P=0,8 N verso il basso. La domanda chiede un modulo, che non è negativo.

Passaggi esatti: `S=2\,\mathrm N\qquad P=1{,}2\,\mathrm N\qquad S-P-F=0\qquad F=\frac45\,\mathrm N`.

Distrattori: 2 N è la sola spinta e 1,2 N il solo peso. 3,2 N somma due forze di verso opposto invece di trovare la differenza da equilibrare. −0,80 N non è un modulo: il verso verso il basso è già indicato separatamente.

Aiuto: Disegna tre forze e imponi che la somma orientata sia zero.

Famiglia: `tenere-un-galleggiante-sommerso`; difficoltà 3; versione 2/base 1.

## C2-Q034

Compito: Lo stesso cubetto rigido galleggia liberamente, senza altri vincoli, prima in acqua e poi in un olio meno denso. Non affonda in nessuno dei due; trascura aria e capillarità. Dove è maggiore il volume immerso?

Procedimento: In entrambi gli equilibri il peso è lo stesso e viene sostenuto dalla spinta: ρ_f gV_i=mg. Isolando V_i=m/ρ_f, una densità del liquido minore richiede un volume immerso maggiore. L’ipotesi che galleggi in entrambi garantisce che quel volume resti geometricamente disponibile.

Passaggi esatti: `V_{i,a}=\frac m{\rho_a}\qquad V_{i,o}=\frac m{\rho_o}\qquad \rho_o<\rho_a\qquad V_{i,o}>V_{i,a}`.

Distrattori: La maggiore densità dell’acqua permette di sostenere lo stesso peso con meno volume. Peso uguale significa spinta uguale, non volume uguale se cambia ρ_f. L’immersione totale non è richiesta per un corpo galleggiante, e liquidi diversi possono entrambi sostenerlo.

Aiuto: La massa del liquido spostato deve essere la stessa: quale volume serve al liquido meno denso?

Famiglia: `un-cubetto-fra-acqua-e-olio`; difficoltà 2; versione 2/base 1.

## C2-Q035

Compito: Una sfera omogenea rigida ha la stessa densità del liquido omogeneo in cui è totalmente immersa. Lontana da pareti e superficie, senza altri vincoli, può restare ferma a qualunque profondità. Come si chiama questo galleggiamento?

Procedimento: La massa della sfera è ρV e quindi il suo peso ρVg coincide con la spinta ρgV. Un piccolo spostamento verticale non cambia nessuno dei due moduli nel modello omogeneo e rigido: non appare una forza di richiamo o di allontanamento. Si parla di galleggiamento neutro, riferito qui alla traslazione verticale.

Passaggi esatti: `\rho_c=\rho_f\qquad P=\rho_c Vg\qquad S=\rho_f Vg\qquad S-P=0`.

Distrattori: L’assenza di forza risultante non significa assenza di spinta o di peso: entrambi sono non nulli per V, ρ e g positivi. Non c’è un obbligo di emergere. Senza variazioni della densità o del volume il piccolo spostamento non genera l’instabilità verticale proposta.

Aiuto: Confronta il peso con la spinta prima e dopo un piccolo spostamento verticale.

Famiglia: `sospensione-senza-appoggio`; difficoltà 1; versione 2/base 1.

## C2-Q036

Compito: Un piccolo pontone di massa 5 kg può spostare al massimo 0,018 m³ d’acqua, di densità 1000 kg/m³, al livello geometrico consentito. In equilibrio libero, trascurando aria e capillarità, quale massa aggiuntiva può sostenere al limite?

Procedimento: Al livello massimo la massa d’acqua spostata vale ρV_max=1000·0,018=18 kg. Questa massa deve uguagliare la massa totale di pontone e carico: 5+m_c=18. Il carico aggiuntivo è quindi 13 kg. Il fattore g si cancella fra spinta e peso; qui si chiede una massa, non una forza.

Passaggi esatti: `\rho V_{\max}g=(m_p+m_c)g\qquad m_c=\rho V_{\max}-m_p\qquad m_c=(18-5)\,\mathrm{kg}\qquad m_c=13\,\mathrm{kg}`.

Distrattori: 18 kg è la massa totale sostenibile e include già il pontone. 23 kg somma invece di sottrarre la sua massa. 5 kg copia il solo pontone; 130 kg confonde la massa richiesta con il valore numerico in newton del suo peso se si usasse g=10. Oltre il limite non è garantito il galleggiamento ammesso dalla geometria.

Aiuto: Dal totale ρV_max sottrai la massa già occupata dal pontone.

Famiglia: `portata-di-carico-di-un-pontone`; difficoltà 2; versione 2/base 1.

## C2-Q037

Compito: Due corpi rigidi di uguale volume esterno ma masse m₂>m₁ sono totalmente immersi nello stesso liquido omogeneo. Entrambi affonderebbero e sono tenuti fermi dall’alto da dinamometri ideali. Che cosa misurano?

Procedimento: Lo stesso volume immerso nello stesso liquido produce la stessa spinta S. Per ogni corpo in equilibrio T+S=mg, quindi T=mg−S. Sottraendo, T₂−T₁=(m₂−m₁)g>0. L’ipotesi che entrambi affonderebbero rende positive le tensioni richieste dall’alto.

Passaggi esatti: `T_1=m_1g-S\qquad T_2=m_2g-S\qquad T_2-T_1=(m_2-m_1)g>0`.

Distrattori: Volumi uguali rendono uguali le spinte, non i pesi. La massa del corpo non aumenta la spinta in questo modello a volume fissato. Leggere il peso completo ignora S; leggere zero richiederebbe S=mg, contrario al fatto che i due corpi affonderebbero liberamente.

Aiuto: Sottrai le due equazioni di equilibrio: quale termine comune scompare?

Famiglia: `due-solidi-dello-stesso-volume`; difficoltà 2; versione 3/base 2.

## C2-Q038

Compito: Un corpo rigido di volume 100 cm³ è libero e fermo, totalmente immerso all’interfaccia di acqua e olio immiscibili, con acqua sotto l’olio. Esclude 60 cm³ d’acqua di densità 1,0 g/cm³ e 40 cm³ d’olio di densità 0,8 g/cm³. Trascurando aria e forze capillari, quale massa ha?

Procedimento: La spinta complessiva è il peso dei due volumi di liquido esclusi. Le masse equivalenti sono 60·1,0=60 g e 40·0,8=32 g. In equilibrio libero il peso del corpo coincide con la loro somma moltiplicata per g; eliminando g ottengo m=60+32=92 g. Non va assegnata al corpo una sola densità del fluido su tutto il volume.

Passaggi esatti: `m=\rho_aV_a+\rho_oV_o\qquad m=60\,\mathrm g+32\,\mathrm g\qquad m=92\,\mathrm g`.

Distrattori: 100 g tratta tutto il volume come acqua; 80 g lo tratta tutto come olio. 90 g usa la media aritmetica delle densità su volumi che non sono uguali. 28 g sottrae i contributi di due spinte entrambe rivolte verso l’alto. I volumi assegnati sommano correttamente a 100 cm³.

Aiuto: Calcola la massa di ciascun liquido spostato e somma i contributi.

Famiglia: `galleggiamento-alla-superficie-di-due-liquidi`; difficoltà 3; versione 2/base 1.

## C2-Q039

Compito: Un galleggiante di massa 60 g è in equilibrio libero in un liquido omogeneo di densità 1,20 g/cm³. Trascurando aria e capillarità, quale volume di liquido sposta?

Procedimento: La spinta uguaglia il peso: ρ_f gV_i=mg. Cancello g e isolo V_i=m/ρ_f. Usando grammi e centimetri cubi in modo coerente, il conto è 60/1,20=6000/120=50 cm³. Si trova il volume immerso che esclude liquido, non necessariamente il volume totale del galleggiante.

Passaggi esatti: `\rho_f V_i=m\qquad V_i=\frac m{\rho_f}\qquad V_i=\frac{60}{1{,}20}\,\mathrm{cm^3}\qquad V_i=50\,\mathrm{cm^3}`.

Distrattori: 72 moltiplica massa per densità e non ha dimensioni di volume. 60 cm³ suppone acqua di densità 1 g/cm³ invece del liquido dato. 0,05 cm³ e 50000 cm³ introducono fattori mille errati. L’equilibrio non permette di ricavare il volume emerso senza un ulteriore dato geometrico.

Aiuto: Dividi la massa per la densità, lasciando che i grammi si cancellino.

Famiglia: `un-areometro-sale-di-poco`; difficoltà 2; versione 2/base 1.

## C2-Q040

Compito: Una ciotola metallica aperta, con interno asciutto e bordo sopra l’acqua, galleggia; una pallina compatta dello stesso metallo affonda. Trascurando aria e capillarità, quale differenza lo spiega?

Procedimento: La spinta dipende dal volume di liquido escluso, mentre il peso dipende dalla massa totale. Le pareti della ciotola possono racchiudere un volume esterno ampio senza avere tutta quella massa di metallo. Finché l’interno resta asciutto e il bordo emerge, può quindi spostare una massa d’acqua uguale alla propria prima di sommergersi. Nella pallina compatta il volume escluso coincide con quello del metallo.

Passaggi esatti: `S=\rho_f gV_i\qquad S=P\qquad V_i=m/\rho_f`.

Distrattori: La forma non cambia da sola la densità intrinseca del metallo. Anche la pallina riceve una spinta verso l’alto, ma insufficiente al suo peso. Il carattere cavo non garantisce il galleggiamento se entra acqua o se il carico supera la capacità geometrica.

Aiuto: Confronta massa totale e massimo volume che il corpo riesce a escludere mantenendo asciutto l’interno.

Famiglia: `una-ciotola-pesante-galleggia`; difficoltà 2; versione 2/base 1.
