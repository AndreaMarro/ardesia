# Revisione distinta cric-c4-l10

Dieci problemi Cric distinti. La primaria e il modello Root sono congelati prima delle candidate. La precedente esposizione limitata Root al valore di Q091 rimane dichiarata e la compensazione source-only A db4f4c7e la precede. A ha risolto e riletto separatamente tutti i cinquanta prompt in 83337ef8 prima del modello Root e dei candidati; il nuovo boundary numerico e il modello sono stati eseguiti e congelati in 2bd7ec24 prima di aprire le candidate.

Sono stati letti integralmente ogni originale e candidato, tutti i cinque SVG candidati in XML e in cinque nuove PNG native indipendenti intere, diciotto SVG originali e le lezioni reali C4-L06–L10. Il target comune ha eseguito 19 test con exit 0. Nessun browser del prodotto, import o approvazione umana è attribuito al peer. Stato DRAFT; Root resta unico integratore.

## C4-Q091

Ipotesi e dominio: Campo uniforme, area positiva, normale scelta e angolo 60° dalla normale; flusso orientato positivo.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Con la normale scelta,
Φ=BAcos 60°=(3/10)(2/100)(1/2)Wb=3/1000 Wb=3 mWb. Il segno è positivo rispetto
a quella normale. La formula, la conversione e il controllo Pint sono derivati
qui, ma avevo già visto il valore 3 nel vecchio test edizioni: serve la risoluzione
source-only distinta A richiesta, prima di dichiarare cecità completa del percorso. La limitata esposizione Root resta dichiarata. La risoluzione A db 4 f 4 c 7 e dal solo prompt precede sia il modello Root sia le candidate; il confronto esatto conferma +3 mWb.

Confronto delle alternative: 6 mWb omette coseno, −3 inverte normale; sin 60° non proiezione normale, sin 30° dal piano invece equivalente.

Verifica: EXACT_ORACLE; firma `d7c08daf9b0fcefd935067d76c3e567d53b0c72f7c1f671e8bb184256cc5553d`.

## C4-Q092

Ipotesi e dominio: Spira ferma, B e geometria costanti; induzione di quel campo distinta da eventuali altre sorgenti elettriche.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Φ è costante perché campo, area e orientamento non cambiano e la
spira è ferma. Faraday dà ℰ=−dΦ/dt=0. Non serve che Φ stesso sia zero.

Confronto delle alternative: BA è flusso Wb, non f.e.m. V; R non crea variazione di flusso, altre sorgenti non sono induzione di quel campo.

Verifica: AI_CONCEPTUAL; firma `7f3f9d095cafb9a36e83748848791ed58cffb16fb395707ade51392eaa7e1854`.

## C4-Q093

Ipotesi e dominio: Verso di percorrenza associato alla normale tramite mano destra; Lenz contrasta variazione e non sempre campo esterno.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Lenz. La risposta indotta si oppone alla variazione del flusso
che la produce, non necessariamente al campo esterno preso isolatamente.

Confronto delle alternative: Ohm, Joule, Coulomb e Snell identificano leggi differenti e non orientazione dell’induzione.

Verifica: AI_CONCEPTUAL; firma `90d6ff174a7c0f4b1abe92cd7273e04c54d67c864bce6afa0512e2c0b5236683`.

## C4-Q094

Ipotesi e dominio: 80 spire identiche con stessa variazione per spira; modulo della media orientata distinto dalla media dei moduli.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: |ℰmedia|=N|ΔΦ/Δt|, dunque il tasso medio per spira è
1,6/80=16/800=1/50 Wb/s=0,020 Wb/s. È un tasso medio: senza andamento temporale
non si conosce il valore istantaneo della derivata in ogni istante.

Confronto delle alternative: 128 moltiplica per N, 1,6 attribuisce bobina a singola spira, 0,20 errore dieci; media non derivata istantanea.

Verifica: EXACT_ORACLE; firma `e87661fa94b9980f7938624c345d6e7dbcbcd550827f3e565d36a28c63a2e602`.

## C4-Q095

Ipotesi e dominio: Stessa corrente e stesso istante, soli osservatori su lati opposti; nessuna inversione fisica della corrente.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Oraria dall’altro lato. Il moto fisico della carica non cambia;
cambia il lato da cui si guarda e quindi il nome dell’orientamento apparente.

Confronto delle alternative: Ancora antioraria conserva riferimento vecchio; zero/alternato inventano cambi fisici da osservazione.

Verifica: AI_CONCEPTUAL; firma `4b2bf70d678a476fd9eb75e2289ed1c245065e108ab61bde2c6746fcf31b193f`.

## C4-Q096

Ipotesi e dominio: Normale materiale seguita nel mezzo giro, una spira, estremi concorde/discorde; media non richiede velocità angolare costante.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Prima Φᵢ=BA=0,005 Wb, dopo Φf=−BA=−0,005 Wb.
ΔΦ=−0,010 Wb e |ℰmedia|=0,010/0,10=0,10 V. Il mezzo giro cambia il segno del
flusso; usare soltanto BA per la variazione perderebbe il fattore due.

Confronto delle alternative: 0,050 V usa BA, zero confonde moduli con flussi orientati; 0,0050 V copia coefficiente BA senza variazione/durata.

Verifica: EXACT_ORACLE; firma `e6bf8b791831b688add36b80ccb38d401919c39dae1b91a499ed6d51b391ae33`.

## C4-Q097

Ipotesi e dominio: Interruzione isolante ideale impedisce conduzione continua lungo intero anello; f.e.m., tensioni e transitori non automaticamente nulli.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Manca una corrente di conduzione che percorra continuamente
l’intera spira aperta attraverso l’interruzione isolante. Non per questo
scompaiono il campo elettrico indotto o la f.e.m.; restano possibili fenomeni
transitori, accumulo di carica e contributi di spostamento nel gap.

Confronto delle alternative: Apertura non annulla B imposto, dΦ/dt, f.e.m. o tutte le tensioni; manca soltanto la conduzione completa.

Verifica: AI_CONCEPTUAL; firma `99ccd3a8034f9e603e263e213cdbed1f6d18af8708cf2572a985c06aa926f8bb`.

## C4-Q098

Ipotesi e dominio: Singola spira chiusa puramente resistiva con R costante positiva e autoinduzione trascurabile; flusso monotono per uguagliare modulo netto e passaggi nello stesso verso.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Con resistenza costante e autoinduzione trascurabile,
I=−(1/R)dΦ/dt. Integrando, la carica netta ha modulo |ΔΦ|/R=0,030/5 C
=0,006 C=6 mC. La monotonia evita di confondere questo modulo con una somma
di passaggi di carica in versi alternati.

Confronto delle alternative: 150 mC copia numericamente ΔΦR con dimensione errata; 0,006 mC omette conversione; inversioni di andamento distinguono netto e totale transitato.

Verifica: EXACT_ORACLE; firma `18fa8304ebdf1a4960eb261bf2bca318be3321aab2b2e65275c0c8e26f3eaada`.

## C4-Q099

Ipotesi e dominio: Ingresso in regione B entrante, area immersa crescente; spira resistiva chiusa e autoinduzione trascurabile, vista frontale fissata.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Durante l’ingresso aumenta il flusso entrante nel foglio.
L’induzione richiede un contributo uscente: la corrente è antioraria vista
dal davanti. Questa risposta si oppone all’ingresso e richiede lavoro esterno.

Confronto delle alternative: Orario rinforza aumento entrante; uniformità interna non mantiene area immersa; fase interamente dentro ha induzione nulla e non è quella chiesta.

Verifica: AI_CONCEPTUAL; firma `7702642c8eec684c1b27d9ab464b97da74318915f409f83feec814cb8449aff8`.

## C4-Q100

Ipotesi e dominio: Una spira, rampa 4 ms seguita da plateau 4 ms; media sull’intero intervallo 8 ms, nessuna inversione del segno.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Nei primi 4 ms il modulo della f.e.m. è 8 mWb/4 ms=2 V, nei successivi 4 ms
è zero. Sull’intero intervallo: |ℰmedia|=8 mWb/8 ms=1 V. I due prefissi milli si
cancellano. Usare 2 V risponderebbe soltanto al primo tratto, non agli 8 ms richiesti.

Confronto delle alternative: 2 V limita alla rampa, zero al plateau; 0,001 converte un solo milli; media orientata negativa e modulo positivo.

Verifica: EXACT_ORACLE; firma `89a1b82bfe8b2c8df460fc8e45634be7b6d9f3a707f6499d58b71fae4bb7d68d`.
