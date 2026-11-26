# Revisione distinta cric-c2-l007

Dieci problemi originali distinti. Primaria e modello pre-key congelati prima delle chiavi; nessun modulo autore B o primaria opposta aperti. Edizione finale confrontata byte per byte con Git. Lettura individuale completa; figura nuova controllata in XML e in un PNG indipendente intero.

Verdetti AI degli oracoli: 10/10. Il target comune effettivo è 19/19; non è una prova UI del prodotto né un’approvazione umana. Integrazione canonica Root ancora da eseguire.

## C2-Q061

Ipotesi e dominio: Osservazione locale di filamento ordinato: suggerisce regime laminare senza dedurre viscosità nulla, globalità o stazionarietà.

Calcolo e controllo manuale: Un filamento ordinato e strati che scorrono affiancati suggeriscono regime laminare nel tratto osservato. Non è una certificazione universale di ogni sezione o istante: la formulazione suggerito è locale. Una corrente stazionaria non è per definizione laminare e una grande velocità non basta da sola a diagnosticare turbolenza.

Confronto delle risposte errate: Viscosità positiva è compatibile con strati ordinati; non si conclude quiete o non stazionarietà da questa sola osservazione.

Verifica: AI_CONCEPTUAL; firma `d6e381846569d66c3b9216ba4cd391d13a06eb86eb768405794832260415293e`.

## C2-Q062

Ipotesi e dominio: Tubo circolare, fluido newtoniano incomprimibile, regime laminare sviluppato, parete aderente; lettura assiale 14/25 m/s è massimo e media pesata per area.

Calcolo e controllo manuale: Per Poiseuille in tubo circolare, laminare newtoniano stazionario sviluppato e con aderenza, v(r)=v_max[1−(r/R)²]. La media sulla sezione è (2/R²)∫₀ᴿv(r)r dr=v_max/2. Con v_max=0,56=14/25 m/s, la media è 7/25=0,28 m/s. Non è la media temporale del valore sull’asse.

Confronto delle risposte errate: 0,56 è il massimo,1,12 il suo doppio,0,14 un quarto. Il valore di parete zero non è la media d’area 7/25.

Verifica: EXACT_ORACLE; firma `4d6087baa3eece8e191803d7a2dd455e3ead318db2dee44246f9655e8cd0d06e`.

## C2-Q063

Ipotesi e dominio: Velocità longitudinale confrontata in punti trasversalmente distinti allo stesso istante; distanza 1/2000 m, non un tempo.

Calcolo e controllo manuale: Il gradiente medio trasversale in modulo è Δv/Δy. Converto 0,50 mm in 1/2000 m e 0,020 m/s in 1/50 m/s: (1/50)/(1/2000)=40 s⁻¹. Non è un’accelerazione, perché il denominatore è una distanza e non un intervallo di tempo. Non serve assumere che il gradiente locale sia uniforme oltre i due punti.

Confronto delle risposte errate: Usare 0,50 come m anziché mm dà 0,04 s⁻¹; invertire il quoziente dà secondi. Un gradiente spaziale non è un’accelerazione.

Verifica: EXACT_ORACLE; firma `e19f551c5d081f944f5997fbfa619e136780cac611d2ae98ab39dc4d8c56dee3`.

## C2-Q064

Ipotesi e dominio: Moduli positivi di sforzo 18/5 Pa e gradiente 12 s⁻¹; temperatura/composizione fissate e viscosità dinamica newtoniana.

Calcolo e controllo manuale: Nel modello newtoniano τ=η γ̇. L’inversa è η=τ/γ̇: (18/5 Pa)/(12 s⁻¹)=3/10 Pa·s. Si tratta di viscosità dinamica; la viscosità cinematica avrebbe unità m²/s e richiederebbe anche la densità. La divisione manuale 3,6/12 è esatta.

Confronto delle risposte errate: 43,2 è il prodotto numerico 3,6·12 e 10/3 il reciproco.0,30 Pa ha dimensione di sforzo, non viscosità.

Verifica: EXACT_ORACLE; firma `b48cecb255bb98a9d533a8ffc9ca3ae3ad8dc8598a7ee7ac71b805f36c4df372`.

## C2-Q065

Ipotesi e dominio: Campo uniforme e assenza degli altri gradienti di deformazione: taglio viscoso nullo, senza inferire pressione nulla o viscosità nulla.

Calcolo e controllo manuale: Nel tratto di velocità uniforme il gradiente trasversale è zero. Lo sforzo viscoso di taglio dovuto a quel gradiente è dunque τ=η·0=0, anche con η non nulla. Non segue che la pressione o ogni componente del tensore degli sforzi sia nulla; la conclusione riguarda solo il contributo di taglio assegnato.

Confronto delle risposte errate: Un gradiente zero annulla il prodotto senza annullare η. La pressione normale non determina il taglio.

Verifica: AI_CONCEPTUAL; firma `7ac24435b97754885e43d8f3c8ee92d9ab97fae9417b976404cde1d58c4e7bcf`.

## C2-Q066

Ipotesi e dominio: Parete ferma e aderenza nel riferimento della parete; conclusione locale all’interfaccia, non sulla media o sul gradiente.

Calcolo e controllo manuale: L’aderenza impone uguaglianza fra velocità del fluido a contatto e della parete. Poiché la parete è ferma, il valore locale è zero nel suo riferimento. Non si deduce che tutto il liquido sia fermo o che il gradiente alla parete sia nullo. Con una parete mobile cambierebbe il valore di velocità di contatto.

Confronto delle risposte errate: La condizione impone la velocità della parete al contatto; massimo o media altrove non sostituiscono quel valore.

Verifica: AI_CONCEPTUAL; firma `d7fa40f51dc9c6f1e4604d18e2cb7238df6c4606cce2d5604d9a82a64927ef84`.

## C2-Q067

Ipotesi e dominio: v_max>0, r∈[0, R] e R>0: derivata radiale in modulo cresce fino al bordo; r non esteso fuori dal tubo.

Calcolo e controllo manuale: Derivo il profilo v(r)=v_max(1−r²/R²): dv/dr=−2 v_max r/R². Il modulo cresce linearmente da zero sull’asse al massimo sulla parete r=R. Non confondere il massimo della velocità, sull’asse, con quello del suo gradiente. La velocità nulla alla parete non elimina lo sforzo di taglio.

Confronto delle risposte errate: Sull’asse la pendenza è zero pur essendo massima v. Il modulo 2 v_max r/R² non è uniforme e non va esteso oltreR.

Verifica: AI_CONCEPTUAL; firma `80c9b537a6a41cd4fa0bc173be14e43e00bd699d229f9b272df7969a4956f21d`.

## C2-Q068

Ipotesi e dominio: Dominio autonomo v_max>0 ora esplicito nella candidata finale riletta; r/R 4/5 e rapporto locale non media areale.

Calcolo e controllo manuale: La frazione locale è v/v_max=1−(r/R)². Con r/R=0,80=4/5: 1−16/25=9/25=0,36. Le unità si cancellano e non serve conoscere R. Il quadrato del rapporto non è direttamente la frazione di velocità, ma il termine che va sottratto da uno.

Confronto delle risposte errate: 4/5 è la coordinata,1/5 omette il quadrato,16/25 è il termine da sottrarre;1/2 è media d’area.

Verifica: EXACT_ORACLE; firma `6923f334e945889f5dc06832a2a6b8608d66d1ab497c97844761f504a31562d8`.

## C2-Q069

Ipotesi e dominio: Gradiente raddoppiato e sforzo cresciuto 13/10, prove controllate; si dubita solo del coefficiente costante nel campo misurato, non si identifica una reologia completa.

Calcolo e controllo manuale: Con η newtoniana costante, raddoppiare γ̇ dovrebbe raddoppiare τ. Il fattore osservato 1,3 contraddice quella proporzionalità nelle condizioni controllate. La viscosità apparente nel secondo punto sarebbe η_2/η_1=1,3/2=13/20, minore: è messa in dubbio l’ipotesi di viscosità indipendente dal gradiente, non l’esistenza stessa della viscosità. Non si deduce da soli due punti un’intera legge reologica.

Confronto delle risposte errate: η apparente cambia di 13/20, quindi non può essere lo stesso coefficiente costante. Massa, pascal e velocità restano definiti.

Verifica: AI_CONCEPTUAL; firma `2a5497d1e02046e2ec927740e90e4c9358e3719de12a3abd198692a4e0e93cc3`.

## C2-Q070

Ipotesi e dominio: La candidata finale esplicita A>0 e moduloU>0; η positiva e distanze positive, Couette sviluppato aderente senza gradiente di pressione; rapporto fra forze non nullo.

Calcolo e controllo manuale: Nel Couette lineare ideale, F=η A V_rel/h. A η, area e velocità relativa non nulla fissate, F_2/F_1=h_1/h_2=1/(5/2)=2/5. Se V_rel fosse zero il rapporto fra due forze nulle non sarebbe definito: la futura candidata deve restare nel ramo di scorrimento. Si confrontano preparazioni con distanze costanti entro ciascuna prova.

Confronto delle risposte errate: 5/2 inverte la dipendenza dalla distanza;25/4 ne fa un quadrato non previsto,1 ignora il cambio e 1/5 non ricostruisce le due distanze.

Verifica: EXACT_ORACLE; firma `65c95455604b5acbd2ea93eab4237b70012486e008f43411646a4aec7580f1fd`.
