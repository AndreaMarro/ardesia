# Revisione indipendente AI — lessons-momentum-fluids-013

Lettura integrale di **C1-L009, C1-L010, C2-L001 e C2-L002**, tutti effettivamente esistenti, versione 1, `kind=lesson`. Esaminati tutti i **26 blocchi**, formule e didascalie, XML e anteprime individuali delle quattro figure. Revisore AI distinto dall'autore storico e dagli autori delle bozze; nessun modulo di authoring o chiave usato come oracolo. **4 originali PASS, 0 FAIL, 59 controlli esatti** con SymPy 1.14.0, Pint 0.25.2 e frazioni. Nessuna modifica a fonti, candidati, asset, registro o checkpoint. `humanApproval=NOT_RUN`, `publicationAction=NONE`, originali conservati.

Provenienza verificata contro Git `5d1dc8dc7b601aef959d10d564c75462be74708d` e contro il checkpoint letto `bdd6171e789ceb7c06961ed7f9501545e818e011723291e5664de613c4c627ed`: i quattro record risultavano `ACCOUNTED` e revisione manuale `NOT_RUN`, senza dedurre l'esistenza dal solo nome atteso. I percorsi corretti sono distinti:

- `officina-di-fisica/content/C1.json`, SHA256 `0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf`.
- `officina-di-fisica/content/C2.json`, SHA256 `7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23`.

| ID | SHA256 canonico del record integralmente letto | Esito / controlli |
|---|---|---|
| C1-L009 | `6da3e8d798cea99aedcdd24660d192e25a13ff20a0777a2394f88b67ac7c378c` | PASS / 16 |
| C1-L010 | `3b2ada176b273a262f7bbbbbb0d4a064163450799252680eb63049360d9e08b0` | PASS / 13 |
| C2-L001 | `9f40cad727f6e4532a5c05eb73182493b739ba4c052d2c59aedecc710f1a157a` | PASS / 14 |
| C2-L002 | `d8d27ee72e253975ef7dd8655928a7db901aefe3905ee0cdf608324cf7de7d6f` | PASS / 16 |

## C1-L009 — impulso, urti e quantità di moto

Letti e verificati quantità di moto vettoriale, impulso della risultante, forza media, area con segno, scelta del sistema, cancellazione delle interazioni interne, isolamento impulsivo anche di una singola componente, velocità con segno e distinzione fra urto elastico e anelastico. La conservazione non è applicata senza verificare l'impulso esterno; l'energia cinetica non è dichiarata conservata in ogni urto.

**Numeri effettivamente presenti nella figura**, non introdotti dal revisore: picco 40 N a 0,10 s, estremi 0 e 0,20 s. Forza crescente `400t` e decrescente `80−400t`; ciascun integrale vale 2 N·s, quindi J=4 N·s. A mano: area `(1/2)·(1/5)·40=4`, forza media `4/(1/5)=20 N`, inferiore al picco. N·s e kg·m/s hanno le stesse dimensioni. La pulsazione invertita produce −4 N·s; il segno appartiene alla componente scelta.

Sommando due equazioni di Newton a masse costanti, `dp_tot/dt=Fext1+Fext2`: il termine interno appare con segni opposti e si cancella. Per corpi che restano attaccati ricavo `vf=(m1u1+m2u2)/(m1+m2)`. La perdita di energia cinetica è `m1m2(u1−u2)²/[2(m1+m2)]`, non negativa. **Prova costruita dal revisore**, non esercizio assegnato: m1=2 kg, m2=1 kg, u1=+3 m/s, u2=−1 m/s danno p=5 kg·m/s, vf=5/3 m/s, Ki=19/2 J, Kf=25/6 J e perdita 16/3 J. Per l'urto elastico la soluzione non banale è ricavata eliminando una velocità tramite quantità di moto e risolvendo l'uguaglianza delle energie: entrambe le conservazioni vengono poi controllate simbolicamente.

`C1-impulso.svg`: triangolo simmetrico, due metà orizzontali di 176 px, etichette temporali e picco coerenti. Lo scarto di 2 px fra bordo della campitura e asse è sovrapposizione grafica dello spessore dei tratti, non un dato che assegni forza residua agli estremi. Non è richiesta una valutazione numerica di funzioni trascendenti. Il grafico serve a integrare la forza variabile e non a sostituire il picco alla media.

## C1-L010 — centro di massa e leve

Verificati media delle coordinate pesata con le masse, costruzione per ciascun asse, moto del centro di massa, rigidità ideale, distinzione fra equilibrio traslazionale e rotazionale, braccio perpendicolare e segno dei momenti. Da `xCM=(m1x1+m2x2)/M` ricavo, per derivate e somma delle equazioni, `M aCM=ΣFesterne`. La traslazione comune dell'origine trasla xCM della stessa quantità. Il dominio è un sistema classico chiuso a masse costanti in riferimento inerziale, con M>0.

Il prodotto vettoriale dà `tau_z=rx Fy−ry Fx` e l'identità `|r×F|²=r²F²−(r·F)²`. Nel piano, con asse perpendicolare al foglio, ciò dà `|tau|=rF sin(alpha)=Fb`. Una forza applicata lontano da O può avere momento zero se la sua retta passa per O; il testo dice correttamente «può» far ruotare, senza affermare che basti la distanza. Cambiare polo sottrae `d×ΣF`, dunque non cambia la condizione di momento totale nullo quando ΣF=0. La reazione di una cerniera ideale ha momento nullo rispetto alla cerniera; non viene introdotta una coppia vincolare non assegnata.

**Prove del revisore**, non numeri della lezione: masse 1 e 3 kg alle coordinate 0 e 4 m danno xCM=3 m. Con bracci muscolare 0,04 m e del carico 0,24 m, carico 10 N e peso dell'arto trascurato nel solo esempio costruito, servono 60 N muscolari. I momenti ±2,4 N·m si annullano; serve anche reazione verticale −50 N per avere ΣFy=0. Non basta il bilancio dei momenti da solo.

`C1-leva.svg`: O a x=91, forza muscolare verticale verso l'alto a x=153 e carico verso il basso a x=465. Braccio muscolare visibilmente più corto. Annotazioni b1/b2 e frecce sono schematiche: non è dichiarata una scala metrica, una scala N/px o un compito di misura dai pixel. L'estremo della linea tratteggiata non assegna un braccio numerico; le lunghezze delle frecce non vengono usate come rapporti di forza. Il supporto implica una reazione, non disegnata come vettore: non tratto le due sole frecce come diagramma completo quantitativo. Il testo impone entrambe le componenti della risultante e il momento, e dichiara esplicitamente direzione del tendine e peso dell'arto come limiti per una previsione biomeccanica reale. Nessuna calibrazione su studenti è ricavata da questi controlli tecnici.

## C2-L001 — massa, densità, pressione e riferimenti

Letti confronto fra siringa con gas e liquido, risposta a sforzo di taglio, forme e superficie libera, incomprimibilità approssimata sotto variazioni moderate di pressione, densità media/locale, distribuzione di forza normale, scalarità della pressione e riferimenti assoluto/relativo. La descrizione è introduttiva, non una classificazione universale di tutti i materiali non newtoniani. Il solido «può» sostenere taglio statico; non viene affermato che ogni materiale solido sia perfettamente elastico.

Verificate `rho=m/V` con V>0 e unità kg/m³; per un campione omogeneo suddiviso massa e volume si riducono dello stesso fattore. **Prova del revisore**: 40 g/50 mL=800 kg/m³. La trazione normale ha direzione data dalla normale di superficie, `−p n`; p resta scalare. Due facce opposte alla stessa pressione atmosferica si compensano; con pressioni uniformi diverse la risultante è `(p1−p2)A`, non la somma. L'ipotesi di uniformità è esplicita prima di usare F=pA. Pa=N/m²=kg/(m·s²). **Prova del revisore**: 20 kPa su 2 cm² danno `(20000)(2/10000)=4 N`. Pressione relativa `pabs−patm` e ricostruzione `pabs=prel+patm` sono coerenti con il riferimento al vuoto.

Per controllare il significato del contrasto fluido/solido, uso due modelli illustrativi aggiunti: fluido newtoniano con taglio costante τ ha deformazione `τt/μ` e velocità di deformazione persistente; solido elastico con modulo di taglio G ammette equilibrio a deformazione finita `τ/G`. Questi controlli non diventano nuove richieste allo studente né sono presentati come leggi di ogni sostanza. Nessuna figura e nessun esercizio numerico assegnato in questo record.

## C2-L002 — colonna idrostatica, manometro e barometro

Verificati cilindro immaginario in quiete, compensazione laterale, equazione verticale e divisione per la sezione positiva: `pbasso A−palto A−rho A h g=0`, quindi `pbasso−palto=rho g h`. La pressione non dipende dalla forma del recipiente; la sezione si cancella. Con profondità positiva verso il basso il gradiente è +ρg, con quota positiva verso l'alto è −ρg. Il testo richiede liquido fermo, densità uniforme e g quasi costante; l'uguaglianza a pari quota è qualificata dallo stesso liquido connesso in equilibrio. Strati diversi si sommano separatamente.

**Prove del revisore**, non dati assegnati: con g=10 m/s², strato di 800 kg/m³ alto 0,10 m e strato di 1000 kg/m³ alto 0,20 m danno 800+2000=2800 Pa. Una lunghezza inclinata di 0,10 m a 30° ha dislivello verticale 0,05 m, non 0,10 m; con ρ=1000 e g=10 l'incremento è 500 Pa. Tutte le quantità si trattano come frazioni esatte.

Nel tubo a U il gas a sinistra abbassa l'interfaccia rispetto al ramo atmosferico: alla quota inferiore `pgas=patm+rho g Delta_h`, quindi pressione relativa positiva. **Prova del revisore**: ρ=1000 kg/m³, g=10 m/s², Δh=0,02 m danno 200 Pa relativi e 100200 Pa assoluti per patm assegnata pari a 100000 Pa. Le altezze nel gas e le correzioni capillari non sono dati del modello introduttivo. Torricelli ha bilancio completo `patm=pvapore+rho g H`; il testo dichiara di trascurare la piccola pressione di vapore prima di scrivere `patm≈rho g H`. Non trasformo un'approssimazione tacita in identità esatta. Un controllo giocattolo con ρ=13600, g assegnata 10 e H=3/4 m dà 102000 Pa, senza rivendicare una calibrazione terrestre misurata.

`C2-colonna.svg`: superficie y=61, A a y=126, h verticale verso il basso e quota tratteggiata passante per A; corretto confronto verticale. `C2-manometro.svg`: interfaccia gas sinistra y=104 e atmosferica destra y=64, Δh fra questi livelli; la quota inferiore tratteggiata confronta lo stesso liquido nei due rami. Il dislivello di 40 px verifica il verso, non assegna una lunghezza fisica perché manca una scala metrica. Entrambe le didascalie sono coerenti.

## Prove, hash e limiti

Quattro asset congelati e confrontati con Git, senza modificarli:

- C1-impulso.svg: `da0e022c6e42c1509d6a7c3f5721cc633f046ff164b2ab06878cab7b931f8402`
- C1-leva.svg: `e708c2fc539832a2dc4f5de2015f9b3cba8584883f3a7900ba2e1ad74a6f1d41`
- C2-colonna.svg: `cb4402efed8b277b255f7e8019f634ad90f691557fc5bfeceb1b69598e9d6944`
- C2-manometro.svg: `6422c8e2f436ca33deee8b7d18294ffed0c4095e40d3fba6205dd616ea0bd90c`

**5/5 test PASS, exit 0, 2,127 s**: identità e riproducibilità dei quattro record, riscontro dei due veri file sorgente e quattro SVG contro Git, rifiuto di ciascuna lezione alterata/omessa, rifiuto di ciascun asset assente o modificato, distinzione fra numeri della figura dell'impulso e prove costruite dal revisore. I report originali/effective coincidono perché non servono nuove edizioni per questi quattro record.

Questo è un giudizio AI sulle edizioni precisamente lette. Non certifica altri record, famiglie di quesiti, prove con studenti, usabilità browser o pubblicazione. Non si dichiara correttezza perché manca una risposta o perché passa una fixture tecnica.

- Verificatore SHA256: `d8d69d031166c9ad0a7e1f89f46c4fc6a63cf321569e6680d97c120d2745ac4e`.
- Test SHA256: `f7062cfe49dfadc89f742779262b2becddd0cce84bddfdf7b477c8c5ce4c0e1e`.
- Entrambi i report SHA256 file: `62e835fd1ecfff44b10d65d7fc6b0c729afd6640640a9de5673118ecca81697d`.
- Digest canonico JSON di ciascun report: `774122a8a0dd1fa3bfee2c885a560fdf322988f2ad526c873a6d8e70711c4590`.
- Contratto SHA256 letto dal report: `a410c96a54250969592294c9aa7755294ec970a6ffee0aed6374debd6b33fe60`.
