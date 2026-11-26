# Revisione distinta cric-c3-l07

Dieci problemi originali distinti. Primaria manuale e modello computazionale sono stati congelati prima delle chiavi. Ogni record originale e candidato è stato letto per intero, insieme alle lezioni pertinenti. I cinque nuovi SVG sono stati controllati in XML e in cinque PNG indipendenti interi, acquisiti con processo reale terminato a zero. I nove SVG originali sono stati riletti integralmente in XML.

Gli oracoli indipendenti verificano 10/10 record di questo cohort. Il target comune ha concluso 21 test con exit 0. Le letture manuali, i test e le immagini non costituiscono una prova UI del prodotto o un’approvazione umana. Stato DRAFT; integrazione e credito rimangono di competenza Root.

## C3-Q061

Ipotesi e dominio: Gas perfetto chiuso, volume fisso, capacità termica positiva; pressione assoluta crescente.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: A volume fisso e quantità di gas perfetto costante vale p/T=costante. Salire nel grafico p–V implica p maggiore e T maggiore. Per capacità termica positiva aumenta anche U; il lavoro di volume resta nullo. Prima delle opzioni non seleziono una coppia testuale esclusiva, ma derivo tutte queste proprietà.

Confronto delle alternative: L’ascissa immutata esclude espansione. A p/T costante una pressione crescente esclude temperatura costante o calante.

Verifica: AI_CONCEPTUAL; firma `66cb9ecdcb596f27001168f25f17d02bcaea9cddced63b9e589f811958530d66`.

## C3-Q062

Ipotesi e dominio: Gas perfetto chiuso, Q=0; capacità TOTALE costante a volume costante usata come derivata di U rispetto T, non vincolo isocoro del processo.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Trasformazione adiabatica: Q=0. I 200 J compiuti dal gas sono lavoro uscente, quindi ΔU=−200 J. La capacità totale costante 25 J/K dà ΔT=ΔU/C_V=−8 K. Non si introduce una massa o una capacità specifica assente.

Confronto delle alternative: Il segno +8 K inverte il verso del lavoro. Q=0 non significa ΔU=0; la capacità totale non va moltiplicata ancora per una massa.

Verifica: EXACT_ORACLE; firma `40cae3dc480b262372a2009e73bfb12e7510be3c10d443f160f4d46c66f64948`.

## C3-Q063

Ipotesi e dominio: Successione lenta di equilibri con p invariata e V variabile.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: La trasformazione a pressione costante è isobara. Non è necessariamente isoterma; per un gas perfetto chiuso con p costante, un aumento di V richiede un aumento di T assoluta.

Confronto delle alternative: Isocora, isoterma e adiabatica sono vincoli distinti. La pressione costante non chiude da sola un ciclo.

Verifica: AI_CONCEPTUAL; firma `2b4eb1d27f88e8a31a655ddd7040587b1ebdad75d177c3154d3896a019451394`.

## C3-Q064

Ipotesi e dominio: Quasi staticità possibile con dissipazione di attrito attiva; reversibilità complessiva assente.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Il moto lentissimo può approssimare una trasformazione quasi statica, ma gli attriti attivi la rendono irreversibile. La lentezza non elimina la dissipazione o la produzione di entropia. Non si conclude reversibilità dal solo procedere lento.

Confronto delle alternative: La lentezza non cancella la produzione di entropia. L’attrito non implica automaticamente isolamento termico o lavoro nullo.

Verifica: AI_CONCEPTUAL; firma `638db6c23a6ec72f84f528318851bb07603b445e55dd3c20e82ac7c73e23a508`.

## C3-Q065

Ipotesi e dominio: Ampolla rigida, nessun lavoro ulteriore, capacità totale 12 J/K e Q 72 J; non si aggiunge una massa.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: La rigidità esclude il lavoro di volume; con il solo riscaldamento ΔU=Q=72 J. Con capacità totale a volume costante 12 J/K l’aumento è ΔT=72/12=6 K. Non si moltiplica per una massa non data.

Confronto delle alternative: Il prodotto 72·12 non ha dimensione kelvin. 12 copia il parametro della capacità; zero nega l’aumento energetico.

Verifica: EXACT_ORACLE; firma `76cc04046461f905f54a7aab90ce47454e1fed89d14433d537447f8959282da9`.

## C3-Q066

Ipotesi e dominio: Gas perfetto di quantità e composizione fissate, estremi alla stessa T; U(T).

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Per gas perfetto chiuso U dipende soltanto da T. Nell’isoterma ΔT=0, dunque la variazione di U è nulla. Questo non impone Q=W=0: durante un’espansione possono essere entrambi positivi ed uguali.

Confronto delle alternative: La temperatura invariata impone ΔU=0 nel gas perfetto; calore e lavoro possono restare non nulli. Un volume non è un’energia.

Verifica: AI_CONCEPTUAL; firma `e1696457b6b2a7cb22283390343d57f8515c1e0b95929dad3db35b95850f252c`.

## C3-Q067

Ipotesi e dominio: Gas perfetto chiuso, espansione isobara quasi statica, R 8,314 prescritta e solo lavoro di volume.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: In isobara quasi statica del gas perfetto W=pΔV=nRΔT. Con n=1/2 mol, R=8,314=4157/500 J/(mol·K) e ΔT=20 K, W=4157/50 J=83,14 J. Il valore di R è l’approssimazione prescritta, non viene sostituito silenziosamente con 8.

Confronto delle alternative: 8,314 copia il numero di R; 831,4 aggiunge un fattore dieci; 166,28 usa una mole invece di mezza. Zero richiederebbe un diverso vincolo.

Verifica: EXACT_ORACLE; firma `d731ceafbd9701e2ac6d5d6465e52796ef66fa5cd3467e77ed11a78436cccf1a`.

## C3-Q068

Ipotesi e dominio: Stato iniziale comune, stesso volume finale maggiore, percorsi reversibili; capacità positive e gas perfetto.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Dallo stesso stato e per V_f>V_i, l’isoterma mantiene T iniziale; l’adiabatica reversibile raffredda il gas. Con capacità termiche positive, γ>1: per V>V_i il rapporto p_iso/p_ad=(V/V_i)^(γ−1)>1. Integrando p dV sullo stesso intervallo si ottiene W_iso>W_ad. Stesso volume finale non significa stesso stato finale o stesso calore.

Confronto delle alternative: Gli stessi estremi di volume non uguagliano integrali con pressioni diverse. L’isoterma resta sopra l’adiabatica dopo lo stato iniziale.

Verifica: AI_CONCEPTUAL; firma `451ea11bb8c41df14a6cb92856f50659cb950ead0031f215163173f11a96aa23`.

## C3-Q069

Ipotesi e dominio: Adiabatica reversibile, gamma 3/2 costante, pressioni e volumi positivi.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Per l’adiabatica reversibile pV^γ è costante. Con V_f/V_i=4 e γ=3/2, p_i/p_f=4^(3/2)=(√4)³=8. Il rapporto inverso sarebbe 1/8. Il gas resta nel regime ideale con γ costante assegnato.

Confronto delle alternative: Quattro corrisponde a γ=1; due prende soltanto la radice; 1/8 è il rapporto inverso.

Verifica: EXACT_ORACLE; firma `8bb070f24cf41cecf5ecf054ab351b28be1b43fa6909918e8e41999332416c54`.

## C3-Q070

Ipotesi e dominio: Gas PERFETTO chiuso isotermo, lavoro uscente positivo, energie macroscopiche ferme: il bagno deve fornire Q=W.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Nel modello di gas perfetto chiuso, una lenta espansione isoterma ha ΔU=0 e W>0, quindi deve ricevere Q=W dal bagno: il contatto deve permettere scambio termico, non essere isolante. La reversibilità termica è il limite con differenza infinitesima di temperatura. Il testo originale non dichiara esplicitamente gas perfetto: non estendo Q=W a ogni gas reale, per il quale U può dipendere anche da V. Questo punto va verificato nella candidata autonoma.

Confronto delle alternative: Un’adiabatica con lavoro uscente positivo ridurrebbe U. Ricevere materia non è necessario e contraddirebbe la chiusura.

Verifica: AI_CONCEPTUAL; firma `4236d92e65c4a75962e1ce8a9c50a1078bac7fc701abaa736ed62fcfe62e4b13`.
