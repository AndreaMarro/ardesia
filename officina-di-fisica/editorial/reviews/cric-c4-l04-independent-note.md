# Revisione indipendente cric-c4-l04

Dieci problemi distinti, risolti prima delle candidate nella primaria C4 Q021-040 commit eaf13e0e0c782adb98d767193e39a35ec3970bab, SHA 16fddaa0a20d4180bd14648b2a47700896a9a77490e80b1daaa92efe189b31c5. Modello realmente eseguito prima dei candidati, SHA fce51a4709cd21f6f8519cad68fdd333123fc0cb14e6ae2c74f1112fc9ece962, con Git-inputs e snapshot verbatim dichiarati. Tutte le sue funzioni conservano AST identico. Nessun modulo autore importato.

Tutti i 10 record finali 74a3f8efce2282e47bb08d21bb382ad9c1ca5312 letti per intero: dati, risposte, opzioni, hint, blocchi, formule, errori e metadati. Lezione reale C4-L04 letta nel catalogo pinned; identità/versioni/famiglie/difficoltà/prerequisiti/exam controllati individualmente. I risultati numerici derivano dalla primaria, non dalle chiavi.

Tre pannelli letti integralmente nel nuovo PNG640×1540: bacchetta negativa a sinistra della sfera, segni positivi sul lato vicino e negativi lontano; simboli di superficie dichiarati non densità. Due porzioni−6/+6 nC sommano zero. Piastre con separazione comune180 e carica libera fissata; frecce del campo90 e30 rappresentano12 e4 kV/m alla stessa scala. Dielettrico riempie lo spazio e nessuna freccia nascosta.

Il decoder canonico mantiene il lessema decimale senza float intermedi. Le grandezze orientate, le conversioni dei prefissi e i rapporti puri sono distinti; le opzioni equivalenti sono confrontate con la loro dimensione. Le risposte numeric JSON devono essere interi esatti; i risultati frazionari sono scelte letterali esatte, non float.

Le mutazioni ostili rinnovano binding, hash, token e pin soltanto nel test e lasciano ripristinate le firme finali. EXACT_ORACLE e AI_CONCEPTUAL sono modalità separate. Nuova resa nativa è asset-only: nessuna UI prodotto o approvazione umana; stati DRAFT/NOT_RUN.

## C4-Q031

Ipotesi: Neutral isolated metal sphere, negative rod does not touch; electrostatic equilibrium.

Derivazione: Il lato vicino è positivo per induzione: la bacchetta negativa respinge elettroni verso il lato più lontano. La sfera isolata conserva carica netta nulla, quindi la carica positiva vicina è compensata da carica negativa altrove.

Distrattori: Negative rod repels electrons away; no transferred protons or net positive sphere charge.

Didattica: Separate local induced sign from globally conserved charge.

Modalità: AI_CONCEPTUAL; esito True; firma 2457d4d03081e286f0f71f2400f07b473666de049123013bdc88bd54e0c151c8.

## C4-Q032

Ipotesi: Bound charges respond by induced dipoles or partial permanent-dipole alignment; no free conduction needed.

Derivazione: È polarizzazione. I dipoli possono formarsi o orientarsi; questo non richiede una corrente di conduzione libera attraverso l’intero isolante.

Distrattori: Grounding, nuclear fusion and compulsory field cancellation are different processes.

Didattica: Local bound-charge response distinguished from macroscopic conduction.

Modalità: AI_CONCEPTUAL; esito True; firma ab7d5a91f229a753a74bf423e3b55c043c5a9f9bacb92190262472e7967521e8.

## C4-Q033

Ipotesi: Isolated neutral sphere, two surface parts exhaust charge; no cavity or volume charges.

Derivazione: La carica netta della sfera isolata è zero. Con −6,0 nC sulla parte indicata, il resto deve portare +6,0 nC, data l’assenza di altri contributi nel volume o nella cavità. Il risultato è integrale sulla superficie restante, non uniforme punto per punto.

Distrattori: Zero remainder leaves−6 total;−6 remainder gives−12 total; equal areas unnecessary.

Didattica: Integrated signed charge does not assume uniform surface density.

Modalità: EXACT_ORACLE; esito True; firma 90a4878d0210b8bf35c07f2d342b6b5b2d238a981486feadf107520d581afad1.

## C4-Q034

Ipotesi: Ground remains connected while positive rod is removed, then disconnected after equilibrium; no other sources.

Derivazione: Allontanando prima la bacchetta mentre permane il contatto con la terra si elimina l’induzione mantenendo il potenziale di riferimento. La carica eccedente può fluire alla terra; idealmente la sfera torna neutra e resta tale dopo aver tolto il filo, in assenza di altre sorgenti.

Distrattori: Disconnecting ground before removing rod is a different ordering that can trap negative charge.

Didattica: Order of grounding actions is the physical constraint.

Modalità: AI_CONCEPTUAL; esito True; firma 283f199da56954bfc5719f5f8824bdc6b029786f4b1fe5ea4824b358602b99cd.

## C4-Q035

Ipotesi: One continuous conductor in electrostatic equilibrium, common potential 42 V relative to Earth.

Derivazione: In un singolo conduttore continuo in equilibrio elettrostatico il potenziale è uniforme. V_B=V_A=42 V rispetto alla terra, dunque V_B−V_A=0 V. Equipotenziale non significa necessariamente a potenziale zero.

Distrattori: 42 is common potential relative to Earth;−42 assumes unspecified zero atB;84 adds potentials.

Didattica: Equipotential is not synonymous with zero potential.

Modalità: EXACT_ORACLE; esito True; firma 675232f0d0cb105f794c3aed43a9fe630ae303c70cc9ce0cab5bedfb47f927ec.

## C4-Q036

Ipotesi: Conducting connection to a large charge reservoir approximating fixed reference potential.

Derivazione: La parola è terra. Il collegamento permette scambio di carica con un grande serbatoio che impone il potenziale di riferimento; non garantisce da solo carica totale nulla in presenza di sorgenti esterne.

Distrattori: Infinite resistance prevents the required exchange, vacuum/fusion/uniform motion do not name the connection.

Didattica: Reservoir potential condition differs from isolation.

Modalità: AI_CONCEPTUAL; esito True; firma e3343635bcbb40de014912c302d68a22156038d21c67d87c01ee3ef2c042c988.

## C4-Q037

Ipotesi: Regular conductor surface at electrostatic equilibrium; field immediately outside.

Derivazione: La componente tangenziale del campo appena esterno è nulla: altrimenti le cariche libere superficiali si muoverebbero e non vi sarebbe equilibrio elettrostatico. La componente normale può invece essere non nulla.

Distrattori: External normal field need not vanish; tangential field would move surface carriers.

Didattica: Normal/tangential decomposition requires regular surface and equilibrium.

Modalità: AI_CONCEPTUAL; esito True; firma f257718f30c275a5a7fcf4ae35423f0fd20181c647441ba44b24e48cd5a55ccf.

## C4-Q038

Ipotesi: Resistive wire with nonzero DC and nonzero measured voltage drop is not electrostatic equilibrium.

Derivazione: Sarebbe errato applicare la regola di equipotenzialità elettrostatica al filo resistivo percorso da corrente, imponendo E=0 o caduta di tensione nulla lungo di esso. La conduzione stazionaria con resistività positiva richiede un campo interno e può dissipare potenza.

Distrattori: Time-independent current is not rest of charge carriers; using the measured drop is consistent.

Didattica: State the domain of an equilibrium rule before applying it.

Modalità: AI_CONCEPTUAL; esito True; firma ee79e247b7e9c09105e013f322ac4fb5c9332e7522692ee2f9c74a217e24e5bd.

## C4-Q039

Ipotesi: Isolated large plates, free charge fixed, complete linear homogeneous dielectric epsilon_r 3, edge effects neglected.

Derivazione: Le cariche libere restano fisse e il dielettrico riempie tutto lo spazio. Per piastre ideali E_f=E_i/ε_r=12/3=4 kV/m. Il generatore scollegato non impone tensione costante; la polarizzazione riduce il campo nel modello lineare.

Distrattori: 36 multiplies rather than divides epsilon_r;12 leaves field unchanged; finite epsilon is not a conductor.

Didattica: Fixed-free-charge boundary condition controls the dielectric response.

Modalità: EXACT_ORACLE; esito True; firma 0d1315ab45201cff3ac85213714af725acdbfb15939258ffbfbf8741d71f02cc.

## C4-Q040

Ipotesi: Insulating polarizable material described by bound charges and permittivity.

Derivazione: È un dielettrico. Nel linguaggio del condensatore è un isolante polarizzabile, distinto da una connessione conduttrice che metterebbe in contatto elettrico le armature.

Distrattori: A voltage source, point source, ideal conductor or superconductor does not name the insulating response.

Didattica: Name material response and its constitutive parameter.

Modalità: AI_CONCEPTUAL; esito True; firma 4d41ae9d9b4b18ce2814d688d0d7dfed68ffa044a383cf08c36b8179f5dc707e.
