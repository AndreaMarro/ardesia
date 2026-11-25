# convective-loss-182 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 178–182 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u5-transfer-178-182-primary-source-only.md, SHA256 c94597eaf8e1bf35eace5928002151d2b6bc85dfe886e3a4322180ecf4ccbe5c. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG ROOT confrontati con i byte finali dell’autore alla SHA a2699006ba266cc06c0ef42ad08edab752f7f2f0. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

Finding182-03: il distrattore ΔT/(hA) ha dimensione K²/W, non il reciproco di una potenza. Riletto il fix autore a2699006ba266cc06c0ef42ad08edab752f7f2f0: solo feedback/error03 e binding mutati; altri15, risposte, formule e SVG identici. Nessun finding residuo.

## AR-u5-convective-loss-01

Derivazione e calcolo manuale: ΔT=(30−20) K=10 K; h A=5 W/K e P=50 W.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: 150 usa 30 al posto del salto 10; 5 copia h; 10 copia intervallo; nessun offset 273, 15 per differenze.

Didattica: Legge motivata dalle ipotesi prima del risultato, con unità conservate.

Figura: SVG integrale XML e rendering asset-only letti: schema caldo 30 °C verso aria 20 °C con freccia energetica. Retta a h=5 fissato: limite aperto(20 °C, 0 W), punti(30, 50), (40, 100), scale 20 unità/grado e 2 unità/W. Barre finali 50/200/125 W lunghe 80/320/200 dal comune x130 (8/5 unità/W); B cambia anche h e non appartiene alla medesima retta centrale. Testi e assi separati.

Modalità EXACT_ORACLE. Risultato indipendente: `50`. Firma: `bcde7e9e342ca1e63cbcc534b67f6211207c36cf3021ffcf908642bb7d21f7b1`.

## AR-u5-convective-loss-02

Derivazione e calcolo manuale: [h][A][ΔT]=(W/(m²·K))m²K=W, energia trasferita per tempo.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: J energia, W/(m²·K) coefficiente, m² area, K intervallo. Non si ricava energia senza durata.

Didattica: Distinzione fra potenza, energia, proprietà del materiale e grandezze di rete.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `W`. Firma: `853d8727adeae8687f79f7fb3634a8d30b75b78011fc2f997f893b81e1b0b2f6`.

## AR-u5-convective-loss-03

Derivazione e calcolo manuale: La legge assegnata usa la differenza rispetto all’aria: P=h AΔT, non h A T_s. Il distrattore ΔT/(h A) ha K²/W, non W né W⁻¹.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: T_s da sola dipende dallo zero della scala; h A/ΔT ha W/K²; ΔT/(h A) ha K²/W; hΔT/A altera la dipendenza dall’area.

Didattica: Legge o meccanismo fisico ricostruiti separatamente dalla chiave.

Figura: SVG integrale XML e rendering asset-only letti: schema caldo 30 °C verso aria 20 °C con freccia energetica. Retta a h=5 fissato: limite aperto(20 °C, 0 W), punti(30, 50), (40, 100), scale 20 unità/grado e 2 unità/W. Barre finali 50/200/125 W lunghe 80/320/200 dal comune x130 (8/5 unità/W); B cambia anche h e non appartiene alla medesima retta centrale. Testi e assi separati.

Modalità AI_CONCEPTUAL. Risultato indipendente: `P = h A ΔT`. Firma: `2fdae18d19c4d63cd169e35df5db142871424f9186659c02bc43e90584ef839a`.

## AR-u5-convective-loss-04

Derivazione e calcolo manuale: A cede 50 W, B con h doppio e stesso salto cede 100 W: rapporto 2.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: 25 rende inversa dipendenza; 200 introduce quadrato; 300 usa lettura 30 anziché salto 10.

Didattica: Confronto controllato fra prove mantenendo fissi i parametri dichiarati.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 50 a 100 W`. Firma: `1ef824856ee6d97f00b185f960683d1e047e8286aaf73a8b40e7eb2ddbf0b46d`.

## AR-u5-convective-loss-05

Derivazione e calcolo manuale: h=P/(AΔT)=50/(1·10)=5 W/(m²·K), divisore positivo.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: 5/3 divide per 30 anziché 10; 50 copia P; moltiplicare perΔT sbaglia dimensione.

Didattica: Inversa derivata prima della sostituzione, con dominio strettamente positivo.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `5`. Firma: `2816df8d95937fc3dceab3734c3438dc5e15b77e36fd32b63b566711583e6d53`.

## AR-u5-convective-loss-06

Derivazione e calcolo manuale: ΔT=P/(h A)=10 K; aggiungo riferimento 20 °C e ottengo 30 °C, non 10 °C.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: 10 °C perde riferimento e viola ramo caldo; 20 annulla salto; 303, 15 è stesso punto in K, non °C.

Didattica: Seconda inversa e verifica dimensionale del residuo o del denominatore.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `30`. Firma: `c70b19c3265888fc34b199d71319d694b20af1146a6947f73c30c2a9e4dfb829`.

## AR-u5-convective-loss-07

Derivazione e calcolo manuale: A ha salto 10 K e P=50 W; B salto 20 K e P=100 W: rapporto 2, diverso dalle letture 40/30.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: 4/3 usa letture; 1/2 inverte; 4 introduce quadrato; 1 ignora nuovo salto.

Didattica: Le due prove ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `49691c8efb27324d17c590c9044d360c918ef248866aecd80eaec2a8ad9e7f0a`.

## AR-u5-convective-loss-08

Derivazione e calcolo manuale: Proposta 100 meno corretto 50 dà+50 W, rapporto 2 non è differenza.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: −50 inverte ordine; 100 copia proposta; zero accetta; 2 è puro rapporto.

Didattica: Ordine dello scarto mantenuto e distinto da un rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `50`. Firma: `b43439fef6dfc35e7dafc0a11deab1cc12c3c3bbedeaa496f674fc2019b9f22e`.

## AR-u5-convective-loss-09

Derivazione e calcolo manuale: P=h AΔT implica h=P/(AΔT), ΔT=(θ_s−20) K>0 e area positiva.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: Moltiplicare per area o salto altera dimensione; AΔT/P è reciproco di h; T_s puntuale non sostituisce intervallo.

Didattica: Inversa simbolica con geometria e divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `h = P / (A ΔT)`. Firma: `4798f0bd959e8cf2ce13a64dde5dd2e55d619d687730c8043ad872306bd83d3e`.

## AR-u5-convective-loss-10

Derivazione e calcolo manuale: B ha salto(bθ_s−20) K, non b(θ_s−20) K; rapporto a(bθ_s−20)/(θ_s−20), entrambi i salti positivi.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: ab scala il salto e non la lettura; rapporto termico inverso sbaglia dipendenza; a/b perde l’aria; somma non segue prodotto.

Didattica: Scalature sostituite nel modello completo, senza cancellare pesi diversi.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `κ₁ (κ₂ θ_s − 20) / (θ_s − 20)`. Firma: `328e3cff35e75573b1b9feeee1ba90f1be19f2e6a6ed85a9bd585575639ba1c2`.

## AR-u5-convective-loss-11

Derivazione e calcolo manuale: A50 W; B10·(40−20)=200 W; rapporto 4.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: 2 usa un solo cambiamento; 4/3 usa letture, 8/3 aggiunge h a questo errore; 1/4 è reciproco.

Didattica: Entrambi gli ingressi variati inclusi nel medesimo bilancio.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4`. Firma: `26f859eddc47cd786805c1047d38281ba4506379ba1ac8113224df7987533b13`.

## AR-u5-convective-loss-12

Derivazione e calcolo manuale: (50+200)/2=125 W. Ai dati medi h=15/2 eθ35 il salto 15 K dà 225/2 W, diverso.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: 225/2 usa dati medi; 250 non dimezza; 75 dimezza differenza; 50 ignora B.

Didattica: Media delle uscite distinta dalla risposta agli ingressi medi.

Figura: SVG integrale XML e rendering asset-only letti: schema caldo 30 °C verso aria 20 °C con freccia energetica. Retta a h=5 fissato: limite aperto(20 °C, 0 W), punti(30, 50), (40, 100), scale 20 unità/grado e 2 unità/W. Barre finali 50/200/125 W lunghe 80/320/200 dal comune x130 (8/5 unità/W); B cambia anche h e non appartiene alla medesima retta centrale. Testi e assi separati.

Modalità EXACT_ORACLE. Risultato indipendente: `125`. Firma: `39e5ee1ed29098788edaa2bc72710d9dedf2d02936bd0010fe4b93bbdc3fad74`.

## AR-u5-convective-loss-13

Derivazione e calcolo manuale: Target 200 W e h B10 richiedono salto 20 K, lettura 40 °C: rapporto numerico 40/30=4/3, non 2.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: 2 è rapporto dei salti; 3/4 inverte letture; 4 copia rapporto potenze; 1 non aumenta uscita abbastanza.

Didattica: Bersaglio decodificato prima dell’inversa; ingresso distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4/3`. Firma: `e369ecf27fc4b02080af3570e89251565ec899b4c0db446b0d68e8cb4a895fdf`.

## AR-u5-convective-loss-14

Derivazione e calcolo manuale: q=150/50=3 W⁻¹; S600→200 W; T_s40 dà salto 20 K, quindi h B10 W/(m²·K).

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: 600 come watt darebbe h=30; h=5 predice S300; 20 copia salto.

Didattica: Display continuo tarato prima di invertire la relazione fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `10`. Firma: `295a5971f1a32e47412981881dfbc6f28cec88efb57e3a25d5ab8bf9aa7f7c74`.

## AR-u5-convective-loss-15

Derivazione e calcolo manuale: q=(401−101)/(200−50)=2 W⁻¹, b=1; S201→100 W; salto 10 K, h C10 W/(m²·K).

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: 201/20 omette b e predice S202; h=5 torna ad A; 20 predice 401; 100 predice 2001.

Didattica: Offset e guadagno ricavati da due riferimenti, poi applicati anche alla prova incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `10`. Firma: `71a07eca66180448589d3b244012ebaef91c3cf321ccd4e852a29728030edc3e`.

## AR-u5-convective-loss-16

Derivazione e calcolo manuale: P₀=βA·1 K=(1/6) W, P=P₀θ(θ−20). θ²−20θ−300=(θ−30)(θ+10); solo 30>20 e h=5>0.

Ipotesi e dominio: Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.

Distrattori: −10 viola ramo caldo e rende h negativo, non è esclusa perché tutti i Celsius negativi siano impossibili.10 è sotto aria; 50 e 300 non soddisfano potenza.

Didattica: Vincolo fra preparazioni sostituito prima di decidere ramo e unicità.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `30`. Firma: `4a7434254c4565d16383b60c97ce87be3a7675542c326f149a47e21d5264f0be`.
