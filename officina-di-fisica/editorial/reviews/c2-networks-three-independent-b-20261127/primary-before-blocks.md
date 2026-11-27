# C2 reti — primaria indipendente tre ID, prima dei blocchi DRAFT

Fonte installata1b72b71a68a6023ab1c9fa189733947b03029914: soli prompt/dati/controlli e punti neutrali. Letta integralmente la sola lezione C2-L009, che richiede flussi stazionari incomprimibili e resistenze idrauliche lineari positive. Non ho aperto package, references, blocchi o ricevute autore6d8148. Disclosure: conoscenze generali e precedenti revisioni degli altri banchi C2; precedente esposizione accidentale L00801/02 già dichiarata lì. Nessuna esposizione nuova a chiavi di reti/superfici. Non rivendico assenza di qualsiasi familiarità storica con il corso; qui la derivazione è separata dai nuovi blocchi e dalle loro risposte.

## SIM-C2-L009-01

Due rami fra gli stessi nodi hanno uguale caduta di pressione e portate che si sommano. Con R1=2 e R2=x, misurate entrambe in kPa·s/mL, 1/Req=1/2+1/x, quindi Req=2x/(2+x). A x=2:4/4=1 kPa·s/mL. A x=6:12/8=3/2=1,5 kPa·s/mL. Non è una portata. Il risultato sta sotto il minore dei due rami; la serie invece avrebbe2+x e non è la topologia assegnata. Inversa x=2Req/(2−Req), valida0<Req<2; le due uscite ricostruiscono2 e6. Il limite x→∞ tende a2 dal basso, senza aggiungere una nuova resistenza in serie. Serve resistenza finita positiva, non un'affermazione su pressioni assolute. Entrambe le consegne richiedono una frazione riducibile e una divisione manuale esatta.

## SIM-C2-L009-02

Il generatore mantiene la stessa caduta Δp=12kPa fra i nodi; il ramo inferiore R=3 porta4mL/s. Nel superiore Q=12/x mL/s, per cui x=3→4 e x=6→2. Il ramo inferiore non cambia: le portate totali sarebbero8 e6mL/s, ma la consegna chiede solo quella superiore. Le unità kPa si cancellano in kPa/(kPa·s/mL). Inversa x=12/Q, per Q>0. Aumentare la resistenza superiore riduce quella portata ma non dimezza necessariamente il totale. Nessuna legge di conservazione impone portate uguali a due rami paralleli di resistenza diversa.

## SIM-C2-L009-03

Due resistenze in serie con ingresso10kPa, uscita0kPa, monte2 e valle x condividono la portata Q=10/(2+x)mL/s. Il nodo sta sopra l'uscita della caduta sul tratto a valle: p_n=0+Qx=10x/(2+x)kPa. A x=2:20/4=5kPa, Q=5/2mL/s e cadute5+5. A x=6:60/8=15/2=7,5kPa, Q=5/4mL/s e cadute2,5+7,5. Controllo10−2Q coincide con Qx. Aumentando la resistenza a valle diminuisce Q ma cresce p_n; il valore è una pressione relativa al medesimo riferimento0kPa, non la pressione assoluta atmosferica. Inversa x=2p_n/(10−p_n), sul ramo0<p_n<10, restituisce2 e6. Nessuna compressibilità o pompa aggiuntiva fra i resistori è inclusa nel modello lineare.

Il modello indipendente seguente verifica frazioni, inverse e conversioni senza importare il consumer. La prova CPU successiva confronterà sia il pubblicato sia il DRAFT con gli stessi input reali. Nessuna chiusura UI, raster o occlusione è derivabile da questa primaria. Human NOT_RUN, publication NONE, credito0.
