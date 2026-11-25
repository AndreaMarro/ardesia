# Revisione indipendente force-uniform-electric-field-195

Primaria completa degli 80 prompt U6-01 letti e risolti prima di candidati, opzioni e chiavi: SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9, copia byte-identica in u6-independent-195-199-fixtures-20261125/primary-source-only.md. Originale ROOT primary-electric-195-199-before-candidates-20261125.md. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, shard U6-01 SHA256 a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. Nessuna esposizione alle chiavi U6 altrui prima della primaria; messaggi successivi di consegna limitati a SHA, file e ipotesi generali.

Successivamente ho letto integralmente e individualmente ogni campo dei sedici record finali: consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie, confrontando i dati con la derivazione primaria. Sono stati letti tutto l’XML e il rendering nativo integrale dell’SVG effettivamente prodotto con exit 0 sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB. Il pin finale letto è 2614da11a5874026739addb6e3e508109833b723. La fixture è copia esatta dei byte Git e dell’asset verificato contro il payload; non sostituisce l’integrazione ROOT.

Riletti catalogo reale C4-L01/L02/L03/L04 e competenze richiamate: forze e campi distinti, campo prescritto vs induzione in conduttore, lavoro elettrostatico con segni e potenziale con riferimento comune. Per il lavoro/energia la competenza C1-L007 è pertinente; nessuna dipendenza da C1-L006 aggiunta. Ogni eccezione ha ipotesi individuali e non eredita tacitamente un ramo di segno opposto.

Gli oracoli SymPy derivano leggi, inverse, fattori, tarature e vincoli; Pint/Fraction controllano unità e prefissi esatti. Il decoder AST dedicato electric_exact_literals.py legge i lessemi numerici originali e non ricostruisce decimali da float binari. Il suo SHA256 è vincolato nel verificatore e riportato in ogni record, con rifiuto se cambia; nessuno dei decoder legacy o entropy_state_review è modificato. Nessun modulo autore importato o usato per ottenere le risposte.

## Prova individuale

### AR-u6-force-uniform-electric-field-01

Legge vettoriale F=qE, con q>0: forza nello stesso verso del campo. 1 μC·1 kN/C=10⁻⁶·10³ N=1 mN, quindi i numeri nelle unità date si moltiplicano. q=2 ed E=3 danno F=6 mN.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 6 N omette milli;2 o 3 copiano un dato;12 mN duplica un fattore. Il campo assegnato non si ricalcola come una nuova interazione fra sorgenti.

Esito indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-force-uniform-electric-field-02

Forza ha dimensione M L t⁻²: N o un prefisso, come mN, è compatibile. Una carica C e un campo N/C non sono forze singolarmente. Nessuna alternativa è stata aperta.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: μC è carica,kN/C e mN/C sono campi,J energia;solo mN è forza.

Esito indipendente: mN. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-force-uniform-electric-field-03

La sfera conduttrice isolata conserva carica totale zero: non c’è contatto né terra. Gli elettroni si ridistribuiscono, con eccesso negativo sulla parte vicina alla carica positiva e difetto positivo sulla parte lontana. In equilibrio il campo nel metallo è nullo e la superficie equipotenziale; la polarizzazione non crea una carica netta né fa attraversare elettroni dal corpo esterno.

Ipotesi: Caso concettuale autonomo: sfera metallica inizialmente neutra e isolata da terra; corpo positivo esterno avvicinato senza contatto. Nessuno scambio di carica con esterno, riequilibrio elettrostatico, carica totale nulla conservata e campo totale nullo nel materiale metallico. Non si applica il modello della carica di prova in campo esterno prescritto.

Distrattori e controprove: Neutra non significa assenza di ridistribuzione: il campo interno di equilibrio è nullo, non quello esterno. Senza contatto o terra non cambia la carica totale.

Esito indipendente: La sfera resta neutra nel complesso; gli elettroni si ridistribuiscono e il campo nel metallo è nullo. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-force-uniform-electric-field-04

E resta 3 kN/C; dimezzare q da 2 a 1 μC porta F da 6 a 3 mN. È una proporzione lineare fra prove nel medesimo campo assegnato.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 12 rende inversa q;6 ignora il cambio;1 copia q_B;9 non è il prodotto 1·3.

Esito indipendente: Da 6 a 3 mN. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-force-uniform-electric-field-05

q=F/E:6 mN/(3 kN/C)=2 μC. La conversione mN/kN/C produce 10⁻⁶ C; E>0 rende lecita la divisione.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: F·E non ha unitàC;E/F dàC⁻¹;copie dei numeri non ricostruiscono qE=6 mN.

Esito indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-force-uniform-electric-field-06

E=F/q:6 mN/(2 μC)=3 kN/C. Non si divide la carica per la forza, che darebbe dimensione inversa del campo.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: Fq non è campo;3 N/C perde kilo;copie 2 e 6 non sono il quoziente corretto.

Esito indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-force-uniform-electric-field-07

A:2·3=6 mN. B:2·1=2 mN. Rapporto 2/6=1/3, puro. La carica resta uguale, cambia soltanto il campo.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 3 è reciproco;1 ignoraE;1/9 introduce quadrato;segno meno impossibile per questi moduli.

Esito indipendente: 1/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-force-uniform-electric-field-08

Proposta 12 mN meno corretto 6 mN=+6 mN. Il rapporto della proposta col corretto sarebbe 2, senza unità, e risponde a un’altra domanda.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: −6 inverte ordine;12 copia proposta;0 accetta errore;2 è rapporto puro.

Esito indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-force-uniform-electric-field-09

Da F=qE si isola q=F/E, usando unità coerenti. In forma numerica q[μC]=F[mN]/E[kN/C]. Moduli positivi e denominatore non nullo.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: F/E dàC;E/F dàC⁻¹;F/E² ha un fattore inverso di campo aggiunto;F²/E dàN C.

Esito indipendente: q = F/E. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-force-uniform-electric-field-10

Sostituzione q_B=κ₁q_A, E_B=κ₂E_A: F_B=κ₁κ₂F_A, quindi rapportoκ₁κ₂. Carica e campo compaiono entrambi al primo grado.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: Quozienti invertono una dipendenza, somma dà 2 per prove identiche, quadrato suκ₁ cambia la legge.

Esito indipendente: κ₁ κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-force-uniform-electric-field-11

A=6 mN. B=1·4=4 mN. Rapporto 4/6=2/3; il fattore 1/2 della carica e 4/3 del campo si moltiplicano.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 3/2 reciproco,1/2 segueq,4/3 segueE,1 presume compensazione inesistente.

Esito indipendente: 2/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-force-uniform-electric-field-12

Media delle forze(6+4)/2=5 mN. Ai dati medi q=3/2 μC ed E=7/2 kN/C, il prodotto sarebbe 21/4 mN: la differenza è−1/4 mN. Non si media prima il prodotto dei parametri.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 21/4 mN usa dati medi;10 omette metà;1 è metà differenza;6 copia A.

Esito indipendente: 5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-force-uniform-electric-field-13

Il bersaglio(2/3)·6=4 mN e q_B=1 μC richiedono E_B=4 kN/C. Rapporto E_B/E_A=4/3, non il rapporto delle forze.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 3/4 reciproco,2/3 omette q cambiata;2 darebbe F 6 mN;4 copia E_B anziché rapporto.

Esito indipendente: 4/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-force-uniform-electric-field-14

Il riferimento F_A=6 mN e lettura 18 danno guadagno 3 mN⁻¹. Lettura 12 indica 4 mN. Dividendo per E_B=4 kN/C si trova q_B=1 μC.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 3μC usa D come forza;2μC prediceD 24;4 copia F_B senza dividereE.

Esito indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-force-uniform-electric-field-15

Riferimenti 6 e 4 mN con letture 13 e 9: guadagno(13−9)/(6−4)=2 mN⁻¹, offset 1. Lettura 41 dà F_C=(41−1)/2=20 mN; E_C=5 kN/C implica q_C=4 μC.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 41/10μC omette offset e prediceD 42;2 e 5μC dannoD 21 e 51;20 copia forza.

Esito indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-force-uniform-electric-field-16

Vincolo nei numeri q=(2/3)E, coefficiente fisico(2/3) μC/(kN/C), solo fra prove. La legge dà 6=(2/3)E², dunque E²=9. Radici±3; soltanto E=3 kN/C rispetta E>0 e q>0, con q=2 μC.

Ipotesi: Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Vincolo soltanto fra preparazioni, non legge temporale entro la singola prova.

Distrattori e controprove: −3 violaq,E positivi;9 copiaquadrato;2 dà 8/3 mN e 6 dà 24 mN.

Esito indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura, integrità e limiti

XML e PNG nativo integrale letti. Campo e forza concordi per la prova positiva, frecce schematiche con unità diverse e punte separate. Barre 6/4/5 mN con larghezze 240/160/200, scala comune 40 coordinate/mN e origine 130; zero a 104 non attraversato. Pannello autonomo della sfera isolata: corpo positivo separato, redistribuzione schematica con netta 0 e campo nel metallo 0; non è una misura quantitativa del numero di elettroni.

Il rendering è asset-only. UI del prodotto e layout a 320 px NOT_RUN in questa review; nessun marker UI generato o copiato. L’approvazione umana rimane NOT_RUN, publication DRAFT e publicationAction NONE. Nessun candidato, registro, ledger, runtime o Git ROOT modificato.

Verifier SHA256 f8d64ab6ae08d7f0fc57900d956e09278a535129175d6f552444a9ea0096d9e8. Decoder SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc. Package canonico SHA256 83a89d708fbd1b610d2e4322a06ca6ca318d39ae5dab9ea3e9239695faf19820. Binding canonico SHA256 a57b6e954fedbb8091a8fe29ac048523d27baeea6ad84e658c81a6ea87dff0db. Report SHA256 0bb8a20ddf7b1f59921401ff3b118edb3725b57edfacc0bb964692aaea1eb95a.

## Controlli automatici effettivamente conclusi

Il test comune dei primi 32 ID è terminato con exit 0: 12 test in 1,822 s, 50 mutazioni dei pacchetti respinte e due guasti costitutivi rilevati. In 32 casi una chiave errata è stata provata con binding, token e pin di edizione aggiornati soltanto in memoria: il rifiuto deriva dagli oracoli matematici e non soltanto dagli hash. Sono state provate 200 configurazioni Hypothesis, identità canoniche dei report fresh e salvati, precisione lessicale dei decimali e rifiuto della deriva SHA del decoder. Nessuna suite completa o UI del prodotto eseguita localmente. Log autentico electric-195-196-independent-tests-20261125.txt.
