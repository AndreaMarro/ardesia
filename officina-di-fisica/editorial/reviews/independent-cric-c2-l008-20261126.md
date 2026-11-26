# Revisione distinta cric-c2-l008

Dieci problemi originali distinti. Primaria e modello pre-key congelati prima delle chiavi; nessun modulo autore B o primaria opposta aperti. Edizione finale confrontata byte per byte con Git. Lettura individuale completa; figura nuova controllata in XML e in un PNG indipendente intero.

Verdetti AI degli oracoli: 10/10. Il target comune effettivo è 19/19; non è una prova UI del prodotto né un’approvazione umana. Integrazione canonica Root ancora da eseguire.

## C2-Q071

Ipotesi e dominio: Q positiva imposta uguale, viscosità e lunghezza comuni; due raggi 3 e 2 mm nel regime di Poiseuille, cadute entrambe positive.

Calcolo e controllo manuale: Poiseuille dà Δp=8 ηLQ/(πr⁴). Con Q imposto e stessa η, L, il rapporto è Δp_2/Δp_1=(r_1/r_2)⁴=(3/2)⁴=81/16. I millimetri si cancellano nel rapporto. Il regime laminare sviluppato deve restare valido in entrambe le prove: non si estende la legge dopo una transizione non specificata.

Confronto delle risposte errate: 16/81 scambia le prove;9/4 e 3/2 cambiano l’esponente.16 corrisponde a raggio dimezzato, non al passaggio 3 → 2.

Verifica: EXACT_ORACLE; firma `6235b53e81f185aacf4bf4d199eaeca2bd36cfc942ba440b9f9e192728aad86e`.

## C2-Q072

Ipotesi e dominio: Stesso r e stessa Δp, Q_A 9 mL/s; confronto fra preparazioni con η_B/η_A 1/2 eL_B/L_A 3, entrambi nel regime del modello.

Calcolo e controllo manuale: A raggio e Δp fissati, Q è inversamente proporzionale a ηL. La seconda preparazione ha prodotto (η_1/2)(3 L_1)=(3/2)η_1 L_1: Q_2/Q_1=2/3. Quindi 9·2/3=6 mL/s. Il dimezzamento della viscosità e l’allungamento triplo non si sommano come cambiamenti additivi.

Confronto delle risposte errate: 18 considera solo η e 3 soloL;27/2 moltiplica per 3/2 invece che dividerlo. Nove ignora entrambi.

Verifica: EXACT_ORACLE; firma `1357fd30b322cb685d339c4f4d6513aeedbee0ae26a272153d9661eb8e343992`.

## C2-Q073

Ipotesi e dominio: Grafico Δp verticale eQ orizzontale, geometria e η fissate; coefficiente angolare della legge lineare, definito anche tramite incrementi.

Calcolo e controllo manuale: Nel grafico con Δp verticale e Q orizzontale la pendenza è Δp/Q=R_h=8 ηL/(πr⁴), in Pa·s/m³. La conduttanza 1/R_h sarebbe la pendenza con gli assi scambiati. Il modello è lineare passivo con R_h positiva, non una curva generica che autorizzi ogni regime.

Confronto delle risposte errate: Scambiare assi dà conduttanza, non resistenza; il prodotto ΔpQ è potenza e la sola η non include la geometria.

Verifica: AI_CONCEPTUAL; firma `f6d82dc74856e564aa122330b17239667e23bcbe27550ea03b60714e6bf73ac3`.

## C2-Q074

Ipotesi e dominio: Raggi positivi e Δp>0, η eL fissi; rapporto α positivo con α⁴3 e richiesta esatta, senza decimali non manuali.

Calcolo e controllo manuale: A η, L, Δp fissati, Q_2/Q_1=(r_2/r_1)⁴. Per ottenere tre pongo il rapporto dei raggi alla quarta uguale a tre: r_2/r_1=⁴√3, radice reale positiva. È un risultato esatto e manualmente definito; non occorre un’approssimazione decimale. Usare il fattore tre direttamente sul raggio moltiplicherebbe Q per 81.

Confronto delle risposte errate: 3⁴81 e(√3)⁴9 non sono 3.1/3 e 1/⁴√3 riducono Q; la radice quarta positiva è unica.

Verifica: EXACT_ORACLE; firma `a1e1e4921445ed8f2ca0e4caec254c199d9f294ae227c259370c9f2e1c53cd55`.

## C2-Q075

Ipotesi e dominio: La candidata finale esplicita Δp>0; due lunghezze d 2 r e r non nulle e regime di Poiseuille, rapporto di portate definito.

Calcolo e controllo manuale: Il diametro è d=2 r. Inserirlo nel posto del raggio cambia il quarto grado da r⁴ a(2 r)⁴=16 r⁴: il calcolo sovrastima Q di un fattore 16, a dati fisici invariati. Il flusso reale non cambia perché si è commesso un errore di sostituzione; il risultato errato non è un aumento del 16 per cento.

Confronto delle risposte errate: L’uguaglianza delle unità non elimina il rapporto d/r 2. Prima e seconda potenza danno 2/4, la quarta dà 16 e non 1/16.

Verifica: AI_CONCEPTUAL; firma `7e5cdb9f7baf714dd85d19bab2454030b51a78b9ac46b3fa8388ade740b3e6f2`.

## C2-Q076

Ipotesi e dominio: Resistenza assegnata in Pa·s/m³ e portata positiva in mL/s; prefisso di volume convertito prima del prodotto, risposta in kPa.

Calcolo e controllo manuale: Uso Δp=R_hQ e converto 2,5 mL/s in (5/2)·10⁻⁶ m³/s. Il prodotto (8·10⁸)(5/2·10⁻⁶)=20·10²=2000 Pa, cioè 2 kPa. Le unità Pa·s/m³ per m³/s danno Pa; trascurare il prefisso milli e il volume in metri cubi introdurrebbe un fattore enorme.

Confronto delle risposte errate: 2000 è il numero in Pa; omettere 10⁻⁶ m³/mL moltiplica per un milione. Q/R non ha dimensione di pressione.

Verifica: EXACT_ORACLE; firma `f3f690015a725ebac2e9771a9dedb0f01e2e11ac200203a25dc8cb1cc3c157dd`.

## C2-Q077

Ipotesi e dominio: Geometria fissa, fluido newtoniano nelle ipotesi di Poiseuille; la proprietà in Pa·s è dinamica, distinta da η/ρ.

Calcolo e controllo manuale: La proprietà è la viscosità dinamica η, espressa in Pa·s. A geometria fissata R_h=8 ηL/(πr⁴) è direttamente proporzionale a η. La viscosità cinematica ν ha altre unità e non è identificabile dal solo nome generico viscosità senza distinguere il simbolo e l’unità.

Confronto delle risposte errate: ρ non compare nel coefficiente di Poiseuille, γ ha N/m e il raggio è geometria; la cinematica η/ρ ha m²/s.

Verifica: AI_CONCEPTUAL; firma `ed952b596c978e530c6f6fba5703cb6696074bed850867b0773ee6dce420fe04`.

## C2-Q078

Ipotesi e dominio: Regione d’ingresso distinta da tratto sviluppato; laminare da solo non implica parabola assestata, nessuna conclusione clinica.

Calcolo e controllo manuale: All’ingresso brusco il profilo può essere ancora in sviluppo: prima di usare la parabola occorre verificare il pieno sviluppo idrodinamico del tratto. Laminarità, Newtonianità, stazionarietà e aderenza restano necessarie ma non sostituiscono quella verifica. Deducendo η da una velocità locale con una parabola non ancora raggiunta si confonderebbe la struttura del profilo con il coefficiente del liquido.

Confronto delle risposte errate: Il tratto d’ingresso può essere laminare senza profilo sviluppato. Pressione nulla e densità nulla non sono criteri; la parabola non è un profilo uniforme.

Verifica: AI_CONCEPTUAL; firma `6d575cc89b7c921f43465473101d417320d01a9fd1c6f112dde07fb4ef8e99b5`.

## C2-Q079

Ipotesi e dominio: Pareti ferme, stesso contributo cinetico e quota ai due estremi, stato stazionario; lavoro netto di pressione per volume trasportato, risposta 12 mW.

Calcolo e controllo manuale: La potenza idraulica fornita dalla caduta di pressione è Δp Q. Converto 3,0 kPa in 3000 Pa: 3000·4·10⁻⁶=12·10⁻³ W=3/250 W, cioè 12 mW. Le sezioni uguali e il tubo orizzontale eliminano differenze dei termini cinetici e di quota nel bilancio fra estremi; questa non è automaticamente la potenza elettrica della pompa senza rendimento. La candidata chiede mW: 3/250 W moltiplicati per 1000 danno 12 mW, senza approssimazione.

Confronto delle risposte errate: 0,012 W è 12 mW;Δp/Q è resistenza, non potenza. Pressione e portata non si sommano come energie.

Verifica: EXACT_ORACLE; firma `5270ccf6a64ab24f71634ec12cafb3919241c38c71e8edfba7a2c12750fd99a9`.

## C2-Q080

Ipotesi e dominio: Resistenza finita positiva, tubo orizzontale passivo a pareti ferme, limite stazionario e nessun’altra forzante; ammette Δp 0 eQ 0.

Calcolo e controllo manuale: Con resistenza finita positiva nel modello passivo di Poiseuille, Δp=R_hQ. Identica pressione statica ai due estremi orizzontali impone Δp=0 e quindi Q=0. Non si può mantenere un profilo di Poiseuille non nullo senza gradiente di pressione o altra sorgente di moto. La conclusione non va trasferita al diverso modello inviscido o a pareti in movimento.

Confronto delle risposte errate: Con resistenza finita positiva, zero differenza dàzero flusso stazionario. Non si inferiscono transitori, pareti mobili o pressioni assolute nulle.

Verifica: AI_CONCEPTUAL; firma `8994af4309c5d60b73ec7b4c1575b6659a5672246dd1cc3c4acc9cd2f7ed45c9`.
