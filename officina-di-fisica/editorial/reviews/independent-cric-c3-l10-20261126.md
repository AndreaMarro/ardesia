# Revisione distinta cric-c3-l10

Dieci problemi originali distinti. Primaria manuale e modello computazionale sono stati congelati prima delle chiavi. Ogni record originale e candidato è stato letto per intero, insieme alle lezioni pertinenti. I cinque nuovi SVG sono stati controllati in XML e in cinque PNG indipendenti interi, acquisiti con processo reale terminato a zero. I nove SVG originali sono stati riletti integralmente in XML.

Gli oracoli indipendenti verificano 10/10 record di questo cohort. Il target comune ha concluso 21 test con exit 0. Le letture manuali, i test e le immagini non costituiscono una prova UI del prodotto o un’approvazione umana. Stato DRAFT; integrazione e credito rimangono di competenza Root.

## C3-Q091

Ipotesi e dominio: Serbatoio ideale isoterma 320 K; calore riferito al serbatoio−640 J, non al corpo ricevente.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Per la sorgente ideale a T=320 K il calore ricevuto è −640 J. La variazione di entropia è ΔS=Q_sorgente/T=−2 J/K. Il segno negativo del singolo serbatoio non viola il principio sull’intero sistema isolato.

Confronto delle alternative: Il modulo +2 J/K perde il verso. Temperatura costante non implica entropia costante; −640 J è energia.

Verifica: EXACT_ORACLE; firma `624bec7f41fe8f020dc9dce19066781d2723d5ca18d0fc0141632ecbf010d66f`.

## C3-Q092

Ipotesi e dominio: Fluido ciclico, insieme completo isolato con irreversibilità; variazione del fluido e produzione totale distinte.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Il fluido torna allo stesso stato: ΔS_fluido=0 anche se il ciclo è irreversibile. La produzione di entropia è positiva per irreversibilità effettive; l’entropia totale di fluido più ambiente aumenta. Non si confonde una produzione interna con la variazione della funzione di stato sul ciclo.

Confronto delle alternative: L’entropia del solo fluido non dà il bilancio dell’insieme. La produzione positiva può essere trasferita all’ambiente senza accumularsi nel fluido.

Verifica: AI_CONCEPTUAL; firma `82ac0024782af15d4650d5ad90f8bdc29de6f66640fe4f6c95bdd8c2003278a1`.

## C3-Q093

Ipotesi e dominio: Definizione termodinamica dS=deltaQrev/T: dimensione energia/temperatura, non energia o potenza.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: L’unità SI dell’entropia è J/K, energia divisa per temperatura assoluta. È distinta da J·K e da un numero puro; dimensionalmente M L² T⁻² Θ⁻¹.

Confronto delle alternative: K/J è il reciproco. J è energia; W/K ha un fattore tempo in più al denominatore; N/K manca di un fattore lunghezza.

Verifica: EXACT_ORACLE; firma `50a16d9ff8563effedf8abea9909e53538fcb51c7658d2203274e058a8855ed1`.

## C3-Q094

Ipotesi e dominio: Massa 0,010 kg, L 100000 J/kg, fusione reversibile isoterma 250 K.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: m=10 g=1/100 kg e L_f=100 kJ/kg=100000 J/kg. Alla fusione reversibile isoterma il calore è mL_f=1000 J. A 250 K la variazione del materiale è +1000/250=+4 J/K. Non aggiungo un riscaldamento sensibile non dato.

Confronto delle alternative: 1000 J è energia, non entropia. Zero ignora la fase; 4000 J/K usa 10 kg invece di 10 g; il segno opposto descriverebbe la solidificazione inversa.

Verifica: EXACT_ORACLE; firma `55cb6f35f43e9b5d409eb3e3cb5625546a1b6c39d20ee05ffc4c1781c515d544`.

## C3-Q095

Ipotesi e dominio: Stessi stati di equilibrio dello stesso sistema e modelli noti; cammino reversibile di riferimento distinto dal cammino reale.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: L’entropia è funzione di stato. Si può scegliere un percorso reversibile equivalente che colleghi gli stessi stati e calcolare ∫δQ_rev/T. Non si deve usare necessariamente il calore reale del processo rapido diviso per una temperatura scelta; un processo adiabatico irreversibile può avere ΔS>0.

Confronto delle alternative: Il calore reale diviso per la temperatura iniziale non è l’integrale reversibile. La rapidità non impone ΔS=0 e cambiare gli estremi cambia il problema.

Verifica: AI_CONCEPTUAL; firma `955e26d02b254dab8bbd8309b45b5db0a5db38925b0a9608ffc6d04863f5f733`.

## C3-Q096

Ipotesi e dominio: Conteggi interi positivi equiprobabili; logaritmo naturale di un rapporto adimensionale.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Per microstati accessibili equiprobabili vale S=k_B lnΩ. Il rapporto è Ω_f/Ω_i=48/12=4, quindi ΔS/k_B=ln 4=2 ln 2. Il risultato si lascia esatto, senza approssimare il logaritmo naturale con un calcolatore.

Confronto delle alternative: ln 36 usa la differenza; ln 60 la somma; quattro omette il logaritmo; −ln 4 scambia gli stati.

Verifica: EXACT_ORACLE; firma `4d49459802b6146d8c273d04a1fe9243c822b4115f05e9c26bce294d09908dc9`.

## C3-Q097

Ipotesi e dominio: Una configurazione microscopica individuale, non il suo conteggio o il macrostato.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Una singola configurazione microscopica compatibile con il macrostato è un microstato. Un macrostato descrive proprietà aggregate ed è compatibile con molti microstati; non è il nome della singola configurazione.

Confronto delle alternative: Il calore non è una configurazione. Macrostato e microstato sono concetti diversi; temperatura e rendimento non specificano una configurazione completa.

Verifica: AI_CONCEPTUAL; firma `088b394a04ec03b69f717d671868648ba5ea108a68fab34afe3014d4d1703751`.

## C3-Q098

Ipotesi e dominio: Due serbatoi ideali 360/300 K,90 J trasferiti e insieme isolato senza altri effetti; produzione uguale alla somma delle variazioni.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: La sorgente calda cambia entropia di −90/360=−1/4 J/K, quella fredda di +90/300=3/10 J/K. Per il trasferimento diretto senza altri scambi la produzione totale è 3/10−1/4=1/20 J/K=0,05 J/K, positiva. Non si sommano i due moduli positivi.

Confronto delle alternative: Il segno negativo inverte i versi; 11/20 J/K somma i moduli. 1/4 e 3/10 J/K omettono uno dei serbatoi.

Verifica: EXACT_ORACLE; firma `46b026c38edf6eafc58ab5947eb307f6fde1d6b78b9cbd6104840f15494f0b07`.

## C3-Q099

Ipotesi e dominio: Intero sistema ISOLATO, processo macroscopico spontaneo; niente sottosistemi lasciati fuori dal confine.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Per l’intero sistema isolato nel modello termodinamico macroscopico deve valere ΔS_tot≥0. La diminuzione spontanea macroscopica di 4 J/K è incompatibile: bisogna rivedere il modello o il confine del sistema. Questo non riguarda il segno possibile della sola entropia di un sottosistema o le fluttuazioni microscopiche.

Confronto delle alternative: Conservare energia non autorizza entropia totale isolata negativa. La lentezza non cancella il vincolo e un sottosistema non coincide con l’insieme.

Verifica: AI_CONCEPTUAL; firma `45b1314ae1bb040cd4770fd697d9980b433cf3d26bd7d5cb5550a55f1067ae62`.

## C3-Q100

Ipotesi e dominio: Capacità TOTALE costante 30 J/K,250→300 K, percorso reversibile senza fase, solo riscaldamento a volume fisso.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Con capacità totale costante C=30 J/K e percorso reversibile a volume fisso, δQ_rev=C dT. Integro fra temperature assolute: ΔS=C ln(T_f/T_i)=30 ln(300/250)=30 ln(6/5) J/K. Il risultato è positivo ed esatto. Per controllo manuale 1/300<1/T<1/250 nell’intervallo interno, quindi 5<ΔS/(J/K)<6. Non uso tutto Q=1500 J diviso per un’unica temperatura come uguaglianza.

Confronto delle alternative: 6 e 5 J/K sono limiti, non l’integrale. Il logaritmo inverso dà segno negativo; 1500 copia il numero del calore senza integrare 1/T.

Verifica: EXACT_ORACLE; firma `4b0e5268d91cf6d519f226af62fca82bc52b81ccc7bbe11108e41a6f50652973`.
