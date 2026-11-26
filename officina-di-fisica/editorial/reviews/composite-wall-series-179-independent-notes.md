# composite-wall-series-179 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 178–182 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u5-transfer-178-182-primary-source-only.md, SHA256 c94597eaf8e1bf35eace5928002151d2b6bc85dfe886e3a4322180ecf4ccbe5c. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG ROOT confrontati con i byte finali dell’autore alla SHA eebdbfb3f4d1ddc5f1ff9b748b976d59dee307ca. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

## AR-u5-composite-wall-series-01

Derivazione e calcolo manuale: R₁=1/(1·1)=1 K/W, R₂=2/(2·1)=1 K/W; P=60/(1+1)=30 W. Cadute 30 K ciascuna.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: 60 W usa un solo strato; 120 somma due percorsi paralleli col salto intero, incompatibili con serie.

Didattica: Legge motivata dalle ipotesi prima del risultato, con unità conservate.

Figura: SVG integrale XML/render asset-only letti: sezioni 120 ×120 e 240 ×120 rappresentano L₁=1 m, L₂=2 m, lato 1 m, scala comune 120 unità/m. Profilo 60→30→0 K continuo ai confini x=0, 1, 3 m; cadute 30 K in tratti 120/240, pendenza seconda metà della prima. Barre 30/15/45/2 W lunghe 240/120/180, origine comunex 130, 8 unità/W. Assi ed etichette non si attraversano.

Modalità EXACT_ORACLE. Risultato indipendente: `30`. Firma: `f6c1466756db8913d82cab1ac240bb3de7d6b9069ad8971f80de33c637cc6aa9`.

## AR-u5-composite-wall-series-02

Derivazione e calcolo manuale: K diviso K/W dà W, energia per tempo.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: J energia, K/W resistenza, W/K conduttanza, W/(m·K) conducibilità.

Didattica: Distinzione fra potenza, energia, proprietà del materiale e grandezze di rete.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `W`. Firma: `9600bf26c9771199274e0f503e27624a810b807b7bb6a072a9c88207f2a31f44`.

## AR-u5-composite-wall-series-03

Derivazione e calcolo manuale: Stazionarietà impone P comune; ΔT=PR₁+PR₂, quindi P=ΔT/(R₁+R₂).

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: ΔT·R ha K²/W; due quozienti conΔT intero sono parallelo; differenza può annullarsi; reciproco non potenza.

Didattica: Legge o meccanismo fisico ricostruiti separatamente dalla chiave.

Figura: SVG integrale XML/render asset-only letti: sezioni 120 ×120 e 240 ×120 rappresentano L₁=1 m, L₂=2 m, lato 1 m, scala comune 120 unità/m. Profilo 60→30→0 K continuo ai confini x=0, 1, 3 m; cadute 30 K in tratti 120/240, pendenza seconda metà della prima. Barre 30/15/45/2 W lunghe 240/120/180, origine comunex 130, 8 unità/W. Assi ed etichette non si attraversano.

Modalità AI_CONCEPTUAL. Risultato indipendente: `P = ΔT / (R₁ + R₂)`. Firma: `99116cae40422ba561f793f1a31af0a650f65bb7d357a928d5c0b81b23af2dca`.

## AR-u5-composite-wall-series-04

Derivazione e calcolo manuale: A: R_tot 2 e P=30; B: R_tot 3 e P=20 W. Cambia soltanto R₁.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: 15 raddoppia anche R₂ invariata; 60 e 40 vanno contro aumento di resistenza; 30 ignora cambiamento.

Didattica: Confronto controllato fra prove mantenendo fissi i parametri dichiarati.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 30 a 20 W`. Firma: `5363b3eb9c9e58770fecfe6a67397ae201a3d497407f6a3fa769b70e0b53f382`.

## AR-u5-composite-wall-series-05

Derivazione e calcolo manuale: R_tot 60/30=2 K/W; sottraggo R₂=1, moltiplico residuo 1 per k₁ A: L₁=1 m.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: L₁=2 omette secondo strato. Residuo negativo non è spessore; sottrarre direttamente L₂ da R_tot è eterogeneo.

Didattica: Inversa derivata prima della sostituzione, con dominio strettamente positivo.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `102e7b8267b7fbb4a5aeff9590348b3552c9ac42b73cd3052f75d6738680941d`.

## AR-u5-composite-wall-series-06

Derivazione e calcolo manuale: R_tot 2−R₁=1 K/W; L₂=k₂ A·1=2 m.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: L₂=1 usa k₁ e nonk 2; 4 omette R₁. k non è resistenza.

Didattica: Seconda inversa e verifica dimensionale del residuo o del denominatore.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `c6e96209864ad5111bd42772a97b500a90c9633eaa372a7e34d95cc514eb89d4`.

## AR-u5-composite-wall-series-07

Derivazione e calcolo manuale: B con L₂=4 ha R_tot 3 e P=20; rapporto 20/30=2/3.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: 1/2 dimentica R₁ fisso; 3/2 è reciproco; 2 rende diretta potenza con spessore; 1 ignora B.

Didattica: Le due prove ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2/3`. Firma: `989fe9e9e2cb4f6a89b6b3f8403ae06f45ca27e536f5612441f122f9d2734a90`.

## AR-u5-composite-wall-series-08

Derivazione e calcolo manuale: Proposta 60−corretta 30=+30 W.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: −30 inverte ordine, 60 copia proposta, zero accettaerrore, 2 W confonde rapporto.

Didattica: Ordine dello scarto mantenuto e distinto da un rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `30`. Firma: `dc528b0078f0076c805e765ba5292bee48394e3b9207fe2fc91d2d9a259ae984`.

## AR-u5-composite-wall-series-09

Derivazione e calcolo manuale: R₁=ΔT/P−R₂>0; L₁=k₁ A(ΔT/P−R₂), con unità m.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: Più aggiunge stratonoto; P/ΔT è conduttanza; dividere per k A ha dimensione errata; omissione R₂ perde uno strato.

Didattica: Inversa simbolica con geometria e divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `L₁ = k₁ A (ΔT/P − R₂)`. Firma: `43b297ba5365f87b2f4a7a4d9a2c6170d1e1995da093bdc863264b77a48d9c45`.

## AR-u5-composite-wall-series-10

Derivazione e calcolo manuale: R_B=a R₁+b R₂; P_B/P_A=(R₁+R₂)/(a R₁+b R₂). Fattore comune dà 1/a.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: Rapporto opposto rende P crescente con R; soli fattori non pesano le resistenze, somma non preserva identità.

Didattica: Scalature sostituite nel modello completo, senza cancellare pesi diversi.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `(R₁ + R₂) / (κ₁ R₁ + κ₂ R₂)`. Firma: `29cc015ea44bf2cc1764f81fbefb3d857be76b2eb1f461f9b0abdc7f7b5d2b74`.

## AR-u5-composite-wall-series-11

Derivazione e calcolo manuale: A30 W, B15 W per resistenze entrambe doppie; rapporto 1/2.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: 2 inverte rapporto; 1/4 raddoppia due volte il totale; 4 e 1 non seguono inversa.

Didattica: Entrambi gli ingressi variati inclusi nel medesimo bilancio.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1/2`. Firma: `dfb5aab284571b021c882fcc6ee5e611c479550130433910c35888f72346cec7`.

## AR-u5-composite-wall-series-12

Derivazione e calcolo manuale: (30+15)/2=45/2 W. Ai mezzi spessori 3/2 e 3 m il totale è3 K/W e P=20 W.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: 20 usa ingressi medi; 45 non dimezza; 15/2 dimezza differenza; 30 ignora B.

Didattica: Media delle uscite distinta dalla risposta agli ingressi medi.

Figura: SVG integrale XML/render asset-only letti: sezioni 120 ×120 e 240 ×120 rappresentano L₁=1 m, L₂=2 m, lato 1 m, scala comune 120 unità/m. Profilo 60→30→0 K continuo ai confini x=0, 1, 3 m; cadute 30 K in tratti 120/240, pendenza seconda metà della prima. Barre 30/15/45/2 W lunghe 240/120/180, origine comunex 130, 8 unità/W. Assi ed etichette non si attraversano.

Modalità EXACT_ORACLE. Risultato indipendente: `45/2`. Firma: `0dab36a8009e2ca6b8defb6e16a2f0acc84f8cc03bbd8aba66b4faa60b3930e0`.

## AR-u5-composite-wall-series-13

Derivazione e calcolo manuale: Target 15 W richiede R_tot 4; L₁ B2 dà R₁ B2, residuo R₂ B2 e L₂ B4 m; rapporto 2.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: 1/2 inverte; 4 copia metri; 1 dà P=20; 15 copia watt.

Didattica: Bersaglio decodificato prima dell’inversa; ingresso distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `b10863fb3f8267f161e7bc66642ff485850431e3f2dcfa4416a99255c5afdf35`.

## AR-u5-composite-wall-series-14

Derivazione e calcolo manuale: q=90/30=3 W⁻¹; S45→15 W, R_tot 4; L₂ B4→R₂ B2, residuo 2→L₁ B2 m.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: 45 usato come W dà R_tot 4/3<R₂=2, residuo negativo: serve decodifica.

Didattica: Display continuo tarato prima di invertire la relazione fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `c01fd7368046b449c39fddee8b5d2bd0c5cad13bacfeabd03520430a2d91b9a8`.

## AR-u5-composite-wall-series-15

Derivazione e calcolo manuale: q=(61−31)/(30−15)=2 W⁻¹, b=1; S41→20 W, R_tot 3, R₂=1, L₁=2 m.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: 79/41 ometteb: P=41/2 e S42, non 41.1 torna ad A; 3 dà S31; 20 copia P.

Didattica: Offset e guadagno ricavati da due riferimenti, poi applicati anche alla prova incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `2131ccad4c27bd826dca9c84f356149367fa28983a080609f2b6555c54d6ead4`.

## AR-u5-composite-wall-series-16

Derivazione e calcolo manuale: L₁=L₂/2 e k₂=2 k₁ danno R₁=R₂, R_tot=L₂/(k₁ A). P=30 impone R_tot 2 e L₂=2 m, unico.

Ipotesi e dominio: Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.

Distrattori: 1 copia L₁; 4 dà 15 W; 30 copia P. Rapporto da solo non determina scala, ma P misurata sì.

Didattica: Vincolo fra preparazioni sostituito prima di decidere ramo e unicità.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `8a29d5ddbd4d45e4abcf35e6404cc616fcee7f4b037ecf25fc13a7042b09cb3c`.
