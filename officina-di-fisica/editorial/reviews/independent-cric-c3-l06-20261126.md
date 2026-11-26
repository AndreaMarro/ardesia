# Revisione distinta cric-c3-l06

Dieci problemi originali distinti. Primaria manuale e modello computazionale sono stati congelati prima delle chiavi. Ogni record originale e candidato è stato letto per intero, insieme alle lezioni pertinenti. I cinque nuovi SVG sono stati controllati in XML e in cinque PNG indipendenti interi, acquisiti con processo reale terminato a zero. I nove SVG originali sono stati riletti integralmente in XML.

Gli oracoli indipendenti verificano 10/10 record di questo cohort. Il target comune ha concluso 21 test con exit 0. Le letture manuali, i test e le immagini non costituiscono una prova UI del prodotto o un’approvazione umana. Stato DRAFT; integrazione e credito rimangono di competenza Root.

## C3-Q051

Ipotesi e dominio: Sistema chiuso, soli lavori del pistone contro pressione esterna costante; energie macroscopiche senza variazione.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Uso Q entrante positivo e W uscente positivo. Il lavoro contro la pressione esterna costante è W=p_ext(V_f−V_i)=120 kPa·0,5 L=60 J, perché kPa·L=J. Per sistema chiuso con solo questo lavoro e variazioni macroscopiche trascurabili, ΔU=Q−W=35−60=−25 J. Non serve attribuire al gas la pressione interna uniforme durante un’espansione irreversibile.

Confronto delle alternative: 95 J somma impropriamente i trasferimenti; 35 J omette il lavoro e −60 J omette il calore. La verifica è ΔU+W=Q.

Verifica: EXACT_ORACLE; firma `a8d39fb389f7c7e5b5a936ff62bf6547c75dab7088263168707618a5b6c59592`.

## C3-Q052

Ipotesi e dominio: Liquido chiuso in recipiente rigido adiabatico; albero capace di lavoro entrante; stati finali fermi alla stessa quota.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Il contenitore rigido annulla il lavoro di volume ma non quello dell’albero dell’agitatore. L’isolamento termico dà Q=0; il lavoro fatto sul liquido può aumentare U. Con W uscente, l’albero compie W<0 e ΔU=−W>0, trascurate altre variazioni energetiche. Adiabatico non significa energia interna costante quando c’è lavoro.

Confronto delle alternative: Calore nullo non esclude lavoro. La rigidità elimina soltanto il lavoro di volume e la chiusura soltanto lo scambio di materia.

Verifica: AI_CONCEPTUAL; firma `30bd21f0d81f02c56be2886af35bed2a1f902d110d1f64286f23cd276c59aa77`.

## C3-Q053

Ipotesi e dominio: Compressione contro pressione positiva, convenzione del lavoro compiuto dal gas.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: La pressione esterna è positiva e la compressione ha dV<0. Il lavoro del gas W=∫p_ext dV è negativo. Il lavoro fatto sul gas è invece positivo: non si scambiano le due convenzioni.

Confronto delle alternative: Il lavoro fatto sul gas ha modulo positivo, ma il lavoro uscente W è negativo. Il segno del calore resta da determinare.

Verifica: AI_CONCEPTUAL; firma `e4aebde203fab58f79be3c0f745f0967a3051c40978514c32990cc5952c84bcf`.

## C3-Q054

Ipotesi e dominio: Sistema chiuso, lavoro uscente positivo e calore entrante positivo; nessuna variazione macroscopica.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Da ΔU=Q−W ricavo Q=ΔU+W=−75+120=45 J. Il gas riceve calore positivo pur diminuendo U, perché il lavoro uscente è maggiore del calore entrante.

Confronto delle alternative: Sottrarre ancora il lavoro dà −195 J; sommare i moduli dà 195 J. Nessuno ricostruisce ΔU=Q−W=−75 J.

Verifica: EXACT_ORACLE; firma `72c882fa29eddad9a0ebe7bc922e0d2531fb295351b8ea9e3d08c634aac76b8e`.

## C3-Q055

Ipotesi e dominio: Cammino quasi statico lineare in p(V), equilibrio meccanico al limite; solo lavoro pV.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Con pressione lineare la media fra gli estremi è (200+100)/2=150 kPa. L’incremento di volume è 3 L. Il lavoro quasi statico è l’area del trapezio: W=150·3=450 J, positivo per espansione. Si assumono pressione utile al lavoro di confine e attriti/altre forme di lavoro controllati.

Confronto delle alternative: 300 e 600 J sono i rettangoli limite; 150 J è soltanto il triangolo. Il verso opposto dà−450 J.

Verifica: EXACT_ORACLE; firma `67091814364cf2721213b8ba540f31f7b090bd350ad386769e96e4d750c66cbf`.

## C3-Q056

Ipotesi e dominio: I soli estremi di pressione non fissano volumi o integrale di percorso.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Non basta. W dipende dall’intero percorso p(V), non solo dalle pressioni agli estremi. Perfino con stessi stati finali una via a 100 kPa da 1 a 2 L dà 100 J; una via che sale isocoricamente a 200 kPa, si espande fra gli stessi volumi e poi scende isocoricamente dà 200 J. I tratti a volume fisso non aggiungono lavoro.

Confronto delle alternative: Una differenza di pressione non è un lavoro. Il lavoro non è funzione di stato e non è necessariamente nullo nei processi lenti.

Verifica: AI_CONCEPTUAL; firma `20312963891ba5f323f7d042bdde9f79e4e68678e2f1efa18b7fa103358a2085`.

## C3-Q057

Ipotesi e dominio: Energia interna come funzione di stato microscopica, distinta dal trasporto macroscopico.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: La funzione di stato richiesta è l’energia interna. Comprende le energie microscopiche, distinte dalla traslazione o dall’energia potenziale macroscopica dell’intero corpo. Non è il calore, che descrive un trasferimento.

Confronto delle alternative: Calore e lavoro sono trasferimenti. La pressione non è un’energia e la sola energia del centro di massa non descrive i contributi microscopici.

Verifica: AI_CONCEPTUAL; firma `7e32fdf5808833fc1034b57b20d7a437dbce46852226347a60f8dcb72bda1380`.

## C3-Q058

Ipotesi e dominio: Pressione esterna costante normale sul pistone; sezione e corsa in SI; avanzamento uscente.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: A=25·10⁻⁴ m² e s=4·10⁻² m, dunque ΔV=A s=10⁻⁴ m³=0,1 L. Contro 100 kPa il lavoro del gas è 10 J. Il verso verso l’esterno determina il segno positivo. L’area non va convertita come una lunghezza.

Confronto delle alternative: Un litro darebbe 100 J; 100 litri darebbero 10000 J. Un pistone che rientra cambia il segno del lavoro.

Verifica: EXACT_ORACLE; firma `f56689a5460e18e6af649aa2807ee39a45dd657688fdb1dde61740091819b561`.

## C3-Q059

Ipotesi e dominio: Stesso stato fisico, osservatori inerziali galileiani; nessuna accelerazione fisica o riscaldamento.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Il solo cambio di riferimento modifica l’energia cinetica macroscopica della traslazione, non U nel modello non relativistico. Sotto una trasformazione galileiana v_i→v_i−u e V_CM→V_CM−u, le differenze v_i−V_CM che entrano nelle energie interne restano identiche. Non si è realmente riscaldato il recipiente o eseguita un’accelerazione.

Confronto delle alternative: Cambiare osservatore non cambia materia, temperatura o energia interna dello stesso stato; può cambiare l’energia cinetica del centro di massa.

Verifica: AI_CONCEPTUAL; firma `db5998c3ca54471aae8901262bfcc291d7c3de39489c12f2f31555acd795b4c5`.

## C3-Q060

Ipotesi e dominio: Sistema chiuso adiabatico, solo lavoro energeticamente rilevante; aumento U positivo.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Q=0 e ΔU=180 J. Dalla convenzione ΔU=Q−W risulta W=−180 J: occorrono 180 J di lavoro entrante. Un valore +180 J farebbe invece diminuire U.

Confronto delle alternative: Un lavoro uscente di 180 J porterebbe ΔU=−180 J. Il lavoro nullo darebbe ΔU=0 e 360 J non ricostruirebbero il dato.

Verifica: EXACT_ORACLE; firma `07b73fd09f8fc028c5a56943b09fcb0dc010c329e3659596f19a4d768586b2e1`.
