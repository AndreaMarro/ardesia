# Authoring DRAFT — coulomb-force-190

Letti individualmente tutti gli 80 prompt A190–194 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-01 SHA256 a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. I compiti e gli ID originali sono conservati e si rendono espliciti segni, domini, conversioni e svolgimenti. Riletti i testi reali C4-L01/L02/L03 per Coulomb, campo vettoriale e potenziale scalare. Prima dei candidati A, il revisore distinto B ha confermato primaria prompt-only 80 SHA256 12031f00b348d12feff99b677c4031308ed67876612eec5d77fb98df866b037a; quella primaria non è stata aperta dall’autore. La primaria A dei futuri 80 B195–199 è congelata separatamente SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9, senza esposizione U6 a chiavi altrui.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u6-coulomb-force-01 — Convertire la distanza prima del quadrato

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. Con Q=1 μC e r=3 cm, quanto vale F in N?

Procedimento d’autore: Tre centimetri sono 3·10⁻² m e il loro quadrato è 9·10⁻⁴ m². Il prodotto delle cariche è 10⁻¹² C². Nella legge di Coulomb il numeratore vale 9·10⁻³ N·m²: dividendo per 9·10⁻⁴ m² si ottiene 10 N. La stessa operazione nei numeri normalizzati è 90/9.

Passaggi: r=3\cdot10^{-2}\,\mathrm m;  r^2=9\cdot10^{-4}\,\mathrm{m^2};  k_eQq=9\cdot10^{-3}\,\mathrm{N\,m^2};  F=10\,\mathrm N.

Distrattori: Novanta N omette il quadrato della distanza numerica tre; 30 N divide per tre invece che per nove. Usare 3 come distanza in metri nella formula SI darebbe 10⁻³ N, un errore di 10⁴ dovuto ai centimetri al quadrato. Il segno delle cariche stabilisce il verso, non rende negativo il modulo.

Hint: Converti centimetri in metri prima di elevare al quadrato, oppure usa le variabili normalizzate dichiarate.

Fonte canonica SHA256 8796a5ef61daa63b14b6efc339d8436640005999a60c7f618dc2298073bbb46f. Candidato SHA256 8a91883c91b276d634c6f729b695a1bea9170ca1c702278f739fdd269930791e. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-02 — La legge restituisce una forza

Per due cariche puntiformi si usa F=k_e|Qq|/r², con k_e in N·m²/C². Quale unità esprime F?

Procedimento d’autore: Il prodotto Qq cancella i coulomb al quadrato del denominatore di k_e. Dividere per r² cancella poi i metri quadrati: resta il newton. Il lavoro di una forza si riferisce a uno spostamento; qui si chiede una forza.

Passaggi: [F]=\frac{\mathrm{N\,m^2}}{\mathrm{C^2}}\frac{\mathrm{C^2}}{\mathrm{m^2}};  [F]=\mathrm N.

Distrattori: J misura energia, C carica e V potenziale. N/C è invece il campo elettrico: per ottenere la forza occorrerebbe moltiplicarlo per la carica di prova.

Hint: Segui entrambe le cancellazioni, delle cariche e della distanza.

Fonte canonica SHA256 e008c3311354f7ef3acaef860a818c183c9202ab04fdced62abce1fba92cf312. Candidato SHA256 be4c785544aa8543d25f14ac0ae232bf038d910ceb262cd675b6d2ed610fa1f4. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-03 — La distanza compare due volte

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. Quale legge dà f usando u e ρ?

Procedimento d’autore: Nelle unità SI compaiono due cariche e il quadrato della distanza. Inserendo Q=u·10⁻⁶ C, q=10⁻⁶ C e r=ρ·10⁻² m, il coefficiente è 9·10⁹·10⁻¹²/10⁻⁴=90. Il numero f vale dunque 90u/ρ²; la forza fisica è quel numero moltiplicato per 1 N.

Passaggi: Q=u\cdot10^{-6}\,\mathrm C;  r=\rho\cdot10^{-2}\,\mathrm m;  f=\frac{90u}{\rho^2};  F=f\cdot1\,\mathrm N.

Distrattori: Dividere per ρ soltanto perde un fattore distanza. Moltiplicare per ρ² fa crescere la forza allontanando le cariche. Mettere u al denominatore inverte la dipendenza da Q; il coefficiente nove omette un fattore dieci nella conversione.

Hint: Non sostituire numeri in centimetri dentro una formula SI senza il coefficiente di conversione.

Fonte canonica SHA256 6606ae6b8d95a2d1aa345198a06a5a36d71413a82b681b084ac89d93d1e5899e. Candidato SHA256 617933572a5684a3755f101c63bb5dfaef9e81834c0389f3a14e880aa31d2107. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-04 — Una carica doppia a distanza uguale

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. A ha Q=1 μC, C ha Q=2 μC; entrambe hanno r=3 cm. Come cambia F?

Procedimento d’autore: La distanza e la carica q non cambiano. Il numeratore di Coulomb è quindi doppio e il denominatore resta nove nei numeri normalizzati: da 90/9=10 N a 180/9=20 N. Questa proporzione confronta due configurazioni, senza supporre che Q cambi mentre si osserva lo stesso moto.

Passaggi: f_A=\frac{90}{9};  f_C=\frac{180}{9};  F_A=10\,\mathrm N;  F_C=20\,\mathrm N.

Distrattori: Cinque N rende inversa la dipendenza da Q. Quaranta N usa il quadrato della carica variabile, ma q è fissata. Dieci N ignora il nuovo Q e zero non segue da due cariche positive a distanza finita.

Hint: Mantieni q e r fissi e confronta soltanto il numeratore.

Fonte canonica SHA256 b37bdbcdeaa5219fe817065e90245ee000468ddf54bea41a9b6fbcb8bbf77ddf. Candidato SHA256 ae8f08820db3dad89185708724b3f73a2b03f44064c301d2c968b4196797c4b2. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-05 — La carica dal modulo della forza

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. Si misura F=10 N e si conosce r=3 cm. Quanto vale Q in μC?

Procedimento d’autore: Isolando la carica variabile nella relazione normalizzata si trova u=fρ²/90. Con f=10 e ρ²=9, il rapporto 90/90 vale uno. Quindi Q=1 μC, che reinserita nella legge restituisce 10 N.

Passaggi: u=\frac{f\rho^2}{90};  u=\frac{10\cdot9}{90};  u=1;  Q=1\,\mu\mathrm C.

Distrattori: Un terzo μC darebbe soltanto 10/3 N: si ottiene usando fρ/90 invece di fρ²/90 nell’inversa. Tre μC darebbero 30 N; dieci μC copierebbero il numero della forza e darebbero 100 N. La carica non ha unità newton.

Hint: Moltiplica la forza per il quadrato della distanza normalizzata prima di dividere per 90.

Fonte canonica SHA256 4face97e193333341e0be193ee6a251d3ea85cee6acdfcd23e8f1f0f50e57984. Candidato SHA256 ae3ce67aafd3be1162139ca0c9980a483c8d5be34ba56f7e047c06d3278fe191. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-06 — La distanza è la radice positiva

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. Si misura F=10 N e si conosce Q=1 μC. Quanto vale r in cm?

Procedimento d’autore: Dalla legge f=90u/ρ² ricaviamo ρ²=90u/f=9. Le radici algebriche sono ±3, ma ρ rappresenta una distanza positiva: si prende ρ=3 e dunque r=3 cm. Il numero nove è il quadrato della distanza normalizzata, non la distanza stessa.

Passaggi: \rho^2=\frac{90u}{f};  \rho^2=9;  \rho=3;  r=3\,\mathrm{cm}.

Distrattori: Nove cm dimentica la radice e darebbe 10/9 N. −3 cm non è una distanza ammessa. Un terzo cm capovolge il rapporto e produrrebbe una forza molto maggiore della misura.

Hint: Risolvi prima per ρ², poi seleziona il ramo della distanza positiva.

Fonte canonica SHA256 a564d430764182a0dec5f1ddd859941102da8c808ced276e6051302d8946ff91. Candidato SHA256 3059e5e37fe659be961ad4660660225411ab460a05d634f85a20a203cd0e24e2. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-07 — Distanza doppia, forza divisa per quattro

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. A ha Q=1 μC e r_A=3 cm. C mantiene Q e ha r_C=6 cm. Quanto vale F_C/F_A?

Procedimento d’autore: La distanza raddoppia, perciò il suo quadrato cresce di quattro. La forza A è 10 N; quella C è 90/36=5/2 N. Il rapporto (5/2)/10 è 1/4. Il verso resta repulsivo, ma il modulo si riduce.

Passaggi: \frac{F_C}{F_A}=\left(\frac{r_A}{r_C}\right)^2;  \frac{F_C}{F_A}=\left(\frac36\right)^2;  \frac{F_C}{F_A}=\frac14.

Distrattori: Un mezzo perde il quadrato. Due o quattro rendono diretta una dipendenza che è inversa; uno ignora il cambiamento della separazione. Il rapporto è puro, non una distanza in centimetri.

Hint: Forma il rapporto delle distanze nell’ordine inverso e poi elevalo al quadrato.

Fonte canonica SHA256 236d2f5f9f6e836b95ebd7c796b5cf890e5d8992c316ceec9e8675548182291a. Candidato SHA256 650ddd10c79e521cf7953a5b291884a45a898c37293de1163670ce93aa7aec30. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-08 — Scarto di una forza sovrastimata

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. Con Q=1 μC e r=3 cm si propone F=20 N. Quanto vale proposta meno risultato corretto?

Procedimento d’autore: La relazione dà F=10 N. La proposta la supera di 20−10=10 N, quindi lo scarto richiesto è positivo. Il numero due è il rapporto proposta/corretta e non la differenza fra forze.

Passaggi: F=10\,\mathrm N;  e=(20-10)\,\mathrm N;  e=10\,\mathrm N.

Distrattori: −10 N inverte l’ordine della sottrazione; venti copia la proposta; zero la accetta. Due senza unità misura un’altra quantità.

Hint: Ricalcola il modulo prima di sottrarre e non confondere errore con rapporto.

Fonte canonica SHA256 34cccc4b3bb28f16b784ac3442478a00ccd798069e334d9cf70e50189fe0080f. Candidato SHA256 5821ac0b46f7d2a738d7521991c854708b203c27d2f825ea92f9437b4c90d51c. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-09 — Isolare Q nella formula fisica

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. Sono noti F e r. Quale relazione fisica isola Q?

Procedimento d’autore: Moltiplichiamo F=k_eQq/r² per r² e dividiamo per k_eq, entrambi positivi. Si ottiene Q=Fr²/(k_eq). In SI il rapporto ha unità N·m² diviso N·m²/C, cioè C. Se si vuole il numero in μC bisogna infine convertire i coulomb oppure usare u=fρ²/90.

Passaggi: Fr^2=k_eQq;  Q=\frac{Fr^2}{k_eq};  [Q]=\mathrm C.

Distrattori: La prima alternativa errata perde un fattore r. Il reciproco ha unità C⁻¹, non C. Il due al denominatore dimezza senza ragione la carica; tenere r² al denominatore non inverte la legge di Coulomb.

Hint: Cancella prima il denominatore r² e poi i fattori che moltiplicano Q.

Fonte canonica SHA256 227b69b138e90a61daf8ba411c37a85a5df3563869757debf7325fdc2c8013e8. Candidato SHA256 90c3c3a7b6c49eaddcd9d784a97b111797e13975903695c74634b9116dd5d812. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-10 — Due cambiamenti nella legge inversa al quadrato

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. C ha Q_C=κ₁Q_A e r_C=κ₂r_A, con κ₁,κ₂>0. Quale legge generale dà F_C/F_A?

Procedimento d’autore: Sostituendo nella legge, Q porta un fattore κ₁ al numeratore e r² porta κ₂² al denominatore. Tutti i coefficienti comuni si cancellano e resta κ₁/κ₂². Un fattore due su Q non ha lo stesso effetto di un fattore due su r.

Passaggi: F_C=\frac{k_e\kappa_1Q_Aq}{\kappa_2^2r_A^2};  \frac{F_C}{F_A}=\frac{\kappa_1}{\kappa_2^2}.

Distrattori: κ₁/κ₂ perde il quadrato della distanza; il prodotto ne inverte la dipendenza. κ₂²/κ₁ è il reciproco del confronto. Elevare κ₁ al quadrato cambierebbe anche la carica q, che qui resta fissata.

Hint: Metti i due fattori nei posti originali della legge prima di semplificare.

Fonte canonica SHA256 dc6447063ad713a0f24935a06d057f915a29177050e025d4b1f48afc4ba97e64. Candidato SHA256 b62d8f0bec5da29c5e5882a4f6b947288db564f6acaebbcb4be5458585c77c51. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-11 — Più carica e minore separazione

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. A ha Q=1 μC e r=3 cm. C ha Q=2 μC e r=1 cm. Quanto vale F_C/F_A?

Procedimento d’autore: A dà 10 N. C ha u=2 e ρ=1, quindi F_C=180 N. Il rapporto è 180/10=18: un fattore due dalla carica e un fattore nove dalla separazione ridotta a un terzo. Il nove proviene dal quadrato, non da una carica aggiuntiva.

Passaggi: F_A=10\,\mathrm N;  F_C=180\,\mathrm N;  \frac{F_C}{F_A}=18.

Distrattori: Due segue soltanto Q; nove segue soltanto r. Sei usa la prima potenza della distanza e 1/18 capovolge il confronto. Centottanta è il numero della forza C in N, non il rapporto.

Hint: Calcola ciascuna configurazione oppure moltiplica i fattori due e nove.

Fonte canonica SHA256 eb47c361a41e31fbbf53f3c7ea88b56e373097ffc340192fce4063ba65f7de36. Candidato SHA256 1a55768ddbffa4ac2ebca5b34a2a5002c96995eb92caa905491a597bedd19819. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-12 — Media dei moduli misurati

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. A usa Q=1 μC, r=3 cm; C usa Q=2 μC, r=1 cm. Qual è la media aritmetica delle due F con uguale peso?

Procedimento d’autore: Le forze sono 10 e 180 N. La metà della somma 190 N è 95 N. Se si mediassero prima Q e r si avrebbero Q=3/2 μC e r=2 cm: la legge darebbe 90·(3/2)/4=135/4 N. La dipendenza inversa al quadrato non conserva quella media dei parametri.

Passaggi: \overline F=\frac{10+180}{2}\,\mathrm N;  \overline F=95\,\mathrm N;  F_{\rm dati\ medi}=\frac{135}{4}\,\mathrm N.

Distrattori: 135/4 N usa i dati medi. Centonovanta N non dimezza la somma; 85 N è metà della differenza; dieci N ignora la seconda prova. Non si sommano forze di due configurazioni diverse come se fossero applicate allo stesso corpo.

Hint: Risolvi le due configurazioni prima di fare la media statistica.

Fonte canonica SHA256 4f375c68a6e60b8a6230ea0abc736d7c34d11d2ce9bd2bf275c117f14368538e. Candidato SHA256 f5f72510d4172f086d94c96b22065c39bf560b7596f5cfaf2f0b8c2631c1b418. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-13 — Il bersaglio di forza fissa la nuova distanza

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. A ha Q=1 μC e r_A=3 cm. C ha Q=2 μC e deve avere F_C=18F_A. Quanto vale r_C/r_A?

Procedimento d’autore: Il bersaglio è 180 N. Con u_C=2, la legge impone ρ_C²=180/180=1: il ramo positivo dà r_C=1 cm. Il rapporto con 3 cm iniziali è 1/3. Si ricava prima la distanza, poi si forma il rapporto richiesto.

Passaggi: F_C=180\,\mathrm N;  \rho_C^2=1;  r_C=1\,\mathrm{cm};  r_C/r_A=\frac13.

Distrattori: Tre è il reciproco. Un nono è il rapporto dei quadrati, non delle distanze. Due copia il fattore della carica e diciotto quello della forza: nessuno ricostruisce la separazione necessaria.

Hint: Isola il quadrato della nuova distanza e scegli la radice positiva prima del rapporto.

Fonte canonica SHA256 d1dc424115467ce0bc8b8bfdbb9b168e952bf95466ce98ce86b81a636469c211. Candidato SHA256 1dc7850422946be658cc58c85957ad8a6705ef7b5593c1241ccabcb7eea55abc. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-14 — Dal display alla forza e alla carica

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. D=aF è un display continuo adimensionale, a>0. A con Q=1 μC, r=3 cm dà D=30. C ha r=1 cm e D=540. Quanto vale Q_C in μC?

Procedimento d’autore: Il riferimento esercita 10 N, quindi a=3 N⁻¹. D=540 indica F_C=180 N. Alla distanza 1 cm la relazione è f_C=90u_C: u_C=180/90=2 e Q_C=2 μC. Il guadagno strumentale non è la costante di Coulomb.

Passaggi: a=3\,\mathrm{N^{-1}};  F_C=180\,\mathrm N;  u_C=2;  Q_C=2\,\mu\mathrm C.

Distrattori: Sei μC usa il display come se fosse già una forza in N. Uno μC predirebbe D=270, non 540. Diciotto copia il rapporto delle forze ignorando la separazione diversa.

Hint: Togli il guadagno del display prima dell’inversa per Q.

Fonte canonica SHA256 105a908813a755c36f5ef3afe34129cb65dec88af32ba2b516efdf3b6609d02c. Candidato SHA256 ce87494399fe683dd1b3153c3a203dbd7f93d798a1089828d32caceb4ff6853d. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-15 — Offset prima dell’inversa di Coulomb

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. Il display continuo adimensionale è D=aF+b, a>0. Riferimento A: Q=1 μC, r=3 cm, D=21. Riferimento C: Q=2 μC, r=1 cm, D=361. Prova E: r=3 cm, D=41. Quanto vale Q_E?

Procedimento d’autore: Le due forze di riferimento sono 10 e 180 N. Il guadagno è (361−21)/(180−10)=2 N⁻¹ e l’offset b=1. La prova E ha F_E=(41−1)/2=20 N. A 3 cm vale F_E=10u_E N: Q_E=2 μC.

Passaggi: a=2\,\mathrm{N^{-1}};  b=1;  F_E=20\,\mathrm N;  Q_E=2\,\mu\mathrm C.

Distrattori: 41/20 μC omette b e predice D=42. Un μC torna al riferimento D=21. Quattro μC toglie b senza dividere per a e predice D=81; venti μC copia il numero della forza e predice D=401.

Hint: Ricostruisci prima la forza dal display affine, poi usa la distanza della prova E.

Fonte canonica SHA256 e3bbc9139a81519be0bc381f9b46a5ca7e3133ce6787810a98da9f61c9fde2c7. Candidato SHA256 0549efea97e45561d5e57793441587838428f933f5544afc10341d2b284facb6. Revisione indipendente e human NOT_RUN.

## AR-u6-coulomb-force-16 — Un vincolo fra carica e separazione

Nel vuoto, due cariche puntiformi positive sono mantenute a distanza r>0. La carica fissa è q=1 μC, l’altra è Q>0. Si usa il valore di modello k_e=9×10⁹ N·m²/C². F indica il modulo della forza esercitata da q su Q; il verso è repulsivo lungo la congiungente. Definiamo u=Q/(1 μC), ρ=r/(1 cm) e f=F/(1 N), tutti numeri puri. Le conversioni nella legge F=k_e Qq/r² danno f=90u/ρ². In ciascuna prova cariche e geometria sono assegnate; si confrontano configurazioni mantenute, non una legge di moto delle cariche. Fra configurazioni si impone Q=γr, con γ=(1/3) μC/cm, ossia u=ρ/3. Si misura F=10 N. Quanto vale r?

Procedimento d’autore: Inserendo u=ρ/3 nella legge, f=90(ρ/3)/ρ²=30/ρ, perché ρ>0 consente una cancellazione. La misura f=10 dà 10ρ=30 e ρ=3, quindi r=3 cm e Q=1 μC. Il vincolo riduce un quadrato, ma la forza continua a dipendere dalla scala della separazione; non è ridondante.

Passaggi: f=\frac{30}{\rho};  10\rho=30;  \rho=3;  r=3\,\mathrm{cm}.

Distrattori: La distanza negativa è esclusa. A 1 cm il vincolo darebbe 30 N; a 9 cm darebbe 10/3 N. La funzione 30/ρ è strettamente decrescente per ρ>0, quindi la misura non lascia infinite soluzioni. Q=γr confronta preparazioni diverse, non una carica che cresce durante il moto.

Hint: Sostituisci il vincolo prima di risolvere e non cancellare il fattore distanza rimasto.

Fonte canonica SHA256 8352f999361b11d78578024fcff4d5d72a1d41f007fbb029b30521cd3c71bae2. Candidato SHA256 98df2c8d37288933ce0ae73e1e58b24e26af9bcea7e5be77a689f9138b6cadd0. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 94e2c6dc17f92f8dc5b10a7ac81bf970f143b7532c17c4df819e9e7ef83dc374. Package file SHA256 a365d2c7bcf3697a70a31bc0289961aee9479e881b581a438b9fd0b0d8a629f2. Binding file SHA256 e6af318be701be8c1ee2aeea687d8f2e15acc5306fa2038e2bf58a0d6765ad90. Prova strutturale SHA256 18d6bdea35371ba5a3b8d8af1ac9db208e86b2b280ab6cd817cf3a5569d74b0e. Asset-only manifest SHA256 0bafb9ac59ec3cd1fca8813064cc825ea330da7148fce62e4d05923ba2f13476.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.

## Correzioni dopo rilievi del revisore distinto

Il revisore B ha rilevato due attribuzioni testuali imprecise. Nel 02 il confronto tra forza ed energia è sostituito dal richiamo al lavoro riferito a uno spostamento: non si afferma più che ogni energia richieda un percorso. Nel 05 l’alternativa 1/3 μC è confutata per sostituzione, F=10/3 N; l’eventuale errore algebrico corrisponde a usare fρ/90 al posto di fρ²/90, non a dividere perρ. Le vecchie edizioni dei cinque file modificati sono archiviate con manifest in coulomb-force-190-before-feedback02-05-20261125.

Assert effettivi: soltanto blocks02 e blocks/error05, con binding02/05, sono cambiati; gli altri 14 record, tutte le formule, risposte e SVG sono identici. Nuova doppia assembly byte-identica e import canonico 16→0/16, 991 pubblicati invariati. Il rendering nativo precedente resta valido per gli stessi byte SVG e non è un nuovo replay del prodotto. UI prodotto e nuova revisione scientifica indipendente restano NOT_RUN per l’autore; firma riservata a B dopo rilettura.
