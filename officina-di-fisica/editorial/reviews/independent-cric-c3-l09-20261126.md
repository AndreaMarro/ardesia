# Revisione distinta cric-c3-l09

Dieci problemi originali distinti. Primaria manuale e modello computazionale sono stati congelati prima delle chiavi. Ogni record originale e candidato è stato letto per intero, insieme alle lezioni pertinenti. I cinque nuovi SVG sono stati controllati in XML e in cinque PNG indipendenti interi, acquisiti con processo reale terminato a zero. I nove SVG originali sono stati riletti integralmente in XML.

Gli oracoli indipendenti verificano 10/10 record di questo cohort. Il target comune ha concluso 21 test con exit 0. Le letture manuali, i test e le immagini non costituiscono una prova UI del prodotto o un’approvazione umana. Stato DRAFT; integrazione e credito rimangono di competenza Root.

## C3-Q081

Ipotesi e dominio: Macchina CICLICA con soli due serbatoi ideali costanti; temperature Celsius convertite in kelvin con 273,15 esatto.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Il limite di Carnot usa temperature assolute. Con la conversione esatta T/K=t/°C+273,15 si hanno T_h=450,15 K e T_c=300,15 K. Quindi η_max=(150/450,15)=1000/3001 e il valore percentuale è (100000/3001)%, circa 33,3% ad una cifra decimale. Usare 273 come approssimazione dichiarata darebbe 1/3, ma non lo sostituisco silenziosamente alla conversione esatta. Il rapporto diretto fra letture Celsius non è un rendimento termodinamico. Nella nuova edizione candidata le letture sono 176,85 e 26,85 °C: sommare 273,15 separatamente dà 450 e 300 K. Lo stesso modello indipendente fornisce 100·(1−300/450)=100/3%. Il vecchio risultato 100000/3001% resta il controllo della diversa preparazione originale, non viene ritaggato.

Confronto delle alternative: 50% divide il salto per la temperatura fredda; 200/3% è il complemento; 75% supera Carnot; zero richiederebbe sorgenti uguali. Le letture Celsius non formano il rapporto fisico.

Verifica: EXACT_ORACLE; firma `e4e935ecefb08002f51b161578fa5bfe0e79e949b93779afc0281da8804a4adc`.

## C3-Q082

Ipotesi e dominio: Vincolo simultaneo: ciclo, una sola sorgente, conversione integrale e nessun altro effetto.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Kelvin–Planck vieta un dispositivo ciclico il cui unico effetto sia assorbire calore da una sola sorgente e convertirlo integralmente in lavoro. Non vieta Q=W in un processo non ciclico, che cambia lo stato del sistema. La qualificazione di ciclo e di unico effetto è essenziale; non invento l’opzione non ancora vista.

Confronto delle alternative: Lavoro dissipato per attrito, frigorifero alimentato e trasferimento caldo-freddo non hanno il solo effetto vietato da Kelvin–Planck.

Verifica: AI_CONCEPTUAL; firma `daa38570486c402a3e6461c7229ae56c0c54fc387f3a9db8e3efd24e5c4352b3`.

## C3-Q083

Ipotesi e dominio: Motore reversibile con due sorgenti positive;0≤eta<1 e caldo almeno freddo.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Per motore reversibile tra due sorgenti ideali η=1−T_c/T_h. Con η=2/5 e T_c=300 K, T_c/T_h=3/5 e T_h=300/(3/5)=500 K. Il dominio è T_h>T_c>0 e 0<η<1.

Confronto delle alternative: 750 K divide per il rendimento; 180 K moltiplica il complemento e inverte caldo e freddo; 300 K darebbe rendimento nullo.

Verifica: EXACT_ORACLE; firma `5faf3b97459e13e1d65ca9d38319ed853dd3e8b97ae2ebecaf64be75610ade60`.

## C3-Q084

Ipotesi e dominio: Due raccordi adiabatici E reversibili nel Carnot, distinti dalle isoterme di scambio.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Le due trasformazioni reversibili senza scambio di calore sono adiabatiche; nel ciclo reversibile sono anche isentropiche. Non sono genericamente isocore o isobare, e una trasformazione soltanto adiabatica non è sempre isentropica se irreversibile.

Confronto delle alternative: Isobare e isocore non impongono Q=0. Un’isoterma non collega due temperature diverse e l’attrito attivo nega la reversibilità.

Verifica: AI_CONCEPTUAL; firma `6b9943ff82114c9c5d4fcc1d0472ff2b8b978b56f7030b7cdc8b0a6cb9a8608e`.

## C3-Q085

Ipotesi e dominio: Frigorifero ciclico con lavoro entrante, calori come moduli e bilancio Qh=Qc+Win.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Il frigorifero trasferisce calore dal freddo al caldo consumando lavoro o producendo un altro effetto compensatore: non è il trasferimento come unico effetto proibito da Clausius. Nel ciclo semplice Q_h=Q_c+W_in. Non si trasforma il principio in divieto assoluto di trasferire calore al caldo.

Confronto delle alternative: La conservazione energetica non basta al secondo principio. Il lavoro esterno è l’altro effetto che accompagna il trasferimento freddo-caldo.

Verifica: AI_CONCEPTUAL; firma `dc694c827a6ee3eb9ee919ad3bb696fe98be891fafc41f016f79b52c2b8246b6`.

## C3-Q086

Ipotesi e dominio: Rendimento effettivo e potenze medie riferiti agli stessi cicli/durata; kW convertiti in W.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Il rendimento è potenza meccanica utile divisa per potenza termica assorbita. Con η=0,22=11/50 e 1,50 kW=1500 W, P_utile=1500·11/50=330 W. Non si usa il limite reversibile come rendimento effettivo, perché qui quello effettivo è già dato.

Confronto delle alternative: 0,33 W conserva il numero in kW senza conversione; 1500 W richiede rendimento unitario; 1170 W è calore ceduto. Dividere per il rendimento darebbe lavoro oltre l’ingresso.

Verifica: EXACT_ORACLE; firma `088ff6575f84e70e4534779178f3bc5385f95fe7ea24c6ac367142e613ebf820`.

## C3-Q087

Ipotesi e dominio: Stesse due sorgenti e soli scambi termici con esse; A reversibile, B con produzione interna netta positiva e lavoro utile positivo.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Per motori ciclici tra le stesse due sorgenti ideali il reversibile raggiunge η_Carnot. Un motore con produzione positiva di entropia per attriti ha rendimento inferiore, o al più il limite se si considera dissipazione nulla. Non si può confrontare il lavoro assoluto di A e B senza confrontare anche i calori assorbiti; vale il confronto dei rendimenti.

Confronto delle alternative: Il riscaldamento da attrito non aumenta l’efficienza. La ciclicità non significa rendimento uno e la reversibilità non significa rendimento zero.

Verifica: AI_CONCEPTUAL; firma `289d87ed8a8455d6a69bcc7cef70d130977aa297a21a2dcde0edc81d28f5cbe6`.

## C3-Q088

Ipotesi e dominio: Macchina CICLICA che opera SOLTANTO fra 600/300 K, Qh 900 J per ciclo; minimoQc raggiunto nel limite reversibile.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Per una macchina termica ciclica fra T_h=600 K e T_c=300 K, il secondo principio impone Q_c/T_c−Q_h/T_h≥0. Con Q_h=900 J, il modulo minimo ceduto è Q_c,min=900·300/600=450 J, raggiunto solo al limite reversibile. Il testo breve non esplicita il ciclo: questo requisito va confermato nella candidata; non applico il limite a processi che immagazzinino energia nello stato finale.

Confronto delle alternative: Calore ceduto nullo richiederebbe rendimento uno. 300 J copia il numero della temperatura; 900 J darebbe lavoro nullo. Il minimo 450 J deriva dal vincolo ciclico.

Verifica: EXACT_ORACLE; firma `15fcb1deb9e8b7366756dd41f8e17ebedd8de5ea4f8889476632cb5f0581d765`.

## C3-Q089

Ipotesi e dominio: Lavoro NETTO e calore caldo per lo stesso ciclo; rapporto adimensionale.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: La parola è lavoro: rendimento= W_netto/Q_h. Q_h è il calore assorbito dalla sorgente calda, come quantità positiva, non il calore netto Q_h−Q_c che su un ciclo coinciderebbe con W.

Confronto delle alternative: Il rapporto fra calore ceduto e assorbito è il complemento. Temperatura e volume non sono energie; le variazioni di stato cicliche non sono il lavoro utile.

Verifica: AI_CONCEPTUAL; firma `ae87b55cbd688486d8d4f9896a0c79bf66fa3376ed6f68c04ff240bd7fbafe02`.

## C3-Q090

Ipotesi e dominio: Bilancio ciclico frigorifero, lavoro entrante 50 J, caldo 200 J, freddo positivo 150 J.

Derivazione e procedura manuale: Derivazione nella primaria congelata PRIMA delle chiavi: Il bilancio del frigorifero ciclico dà Q_c=Q_h−W_in=200−50=150 J. Il coefficiente frigorifero è Q_c/W_in=150/50=3. Il rapporto Q_h/W_in=4 è il coefficiente della pompa di calore, non quello richiesto.

Confronto delle alternative: Quattro è il COP della pompa di calore; 1/3 il rapporto inverso. Il bilancio 150+50=200 J esclude creazione di energia.

Verifica: EXACT_ORACLE; firma `fe6d05990b32eeed5cdf554d1b4aa54e18d3383de12beb8228d81e206c2eef24`.
