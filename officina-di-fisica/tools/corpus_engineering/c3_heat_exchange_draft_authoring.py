"""Assemble the the calculator-free C3 experimental drafts by family."""

import argparse
import json
from pathlib import Path

from tools.corpus_engineering.pipeline import digest


SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH = 'experiment-c3-heat-exchange-reading-20261127'
FIRST_LAW_BATCH = 'experiment-c3-first-law-reading-20261127'
PATHS_BATCH = 'experiment-c3-thermal-paths-reading-20261127'
CYCLES_BATCH = 'experiment-c3-thermal-cycles-reading-20261127'
ENGINES_BATCH = 'experiment-c3-engines-reading-20261127'
ENTROPY_BATCH = 'experiment-c3-entropy-reading-20261127'


def text(value):
    return {'type': 'text', 'text': value}


def formula(value):
    return {'type': 'formula', 'text': value}


EDITIONS = {
    'SIM-C3-L05-01': {
        'points': [2, 8],
        'transferPrompt': 'Una parete di spessore {x} e area 0,01 m² ha k = 1 W/(m·K). Le due facce differiscono di 20 K. Quale potenza termica attraversa la parete?',
        'blocks': [
            text('Segna la faccia calda e quella fredda dello stesso materiale. Nella conduzione stazionaria monodimensionale, con conducibilità costante e perdite laterali trascurate, la temperatura cambia linearmente nello spessore. La pendenza del profilo vale ΔT/L in modulo. Il flusso di calore va dalla faccia più calda a quella più fredda.'),
            formula(r'P=kA\frac{\Delta T}{L}'),
            text('Calcola prima il prodotto kAΔT. Moltiplica 1 per 0,01 e poi per 20. Riunendo W/(m·K), m² e K, rimangono W·m.'),
            formula(r'kA\Delta T=0{,}20\ \mathrm{W\,m}'),
            text('Disegna i due profili con la stessa differenza di temperatura. A 2 cm, cioè 0,02 m, il conto è 0,20/0,02 = 20/2 = 10 W. Con 8 cm, cioè 0,08 m, dividi 20 per 8 e ottieni 5/2 = 2,5 W. La seconda pendenza è un quarto della prima perché lo spessore è quadruplicato.'),
            text('Per risalire allo spessore inverti la legge. Con P = 2,5 W, dividi 0,20 W·m per 2,5 W e trovi 0,08 m, pari a 8 cm. La misura è in watt perché il kelvin si cancella nella legge e dopo la divisione dei metri rimane soltanto la potenza.'),
        ],
    },
    'SIM-C3-L05-02': {
        'points': [2, 3.5],
        'transferPrompt': 'Nello scambiatore passano {x} d’acqua. Ogni grammo cede 42 J all’altro circuito. Quanti watt trasferisce l’acqua?',
        'blocks': [
            text('Segui una piccola massa d’acqua dall’ingresso caldo all’uscita più fredda. La portata dice quanti grammi attraversano la sezione ogni secondo. Se ciascun grammo si raffredda di 10 K, cede 4,2 J/(g·K) × 10 K = 42 J/g. Il conto vale per un flusso stazionario senza cambiamento di fase e con calore specifico preso costante.'),
            formula(r'P=\dot m c\Delta T=\dot m(42\ \mathrm{J/g})'),
            text('Disegna una freccia per il flusso d’acqua e una seconda dal circuito caldo a quello freddo per il calore ceduto. A 2 g/s transitano due porzioni da un grammo ogni secondo. Due volte 42 danno 84 J/s, cioè 84 W. A 3,5 g/s moltiplica per 3 + 1/2 e somma 126 + 21 = 147 W.'),
            text('Per ricavare la portata da una potenza di 147 W, dividi 147 J/s per 42 J/g. Ne risultano 7/2 g/s. Il grammo si cancella nella legge diretta e ricompare in quella inversa. A pari raffreddamento, il maggior trasferimento deriva da più acqua che attraversa il circuito nello stesso tempo.'),
        ],
    },
    'SIM-C3-L05-03': {
        'points': [200, 400],
        'formula': 'P/A = εσ(T⁴ − Tₐ⁴), con ε = 1, Tₐ = 300 K e σ ≃ 5,67 × 10⁻⁸ W/(m²·K⁴)',
        'transferPrompt': 'Una piastra nera a {x} scambia radiazione con un grande ambiente nero a 300 K. Qual è il flusso radiativo netto per metro quadrato, positivo se esce dalla piastra?',
        'blocks': [
            text('Disegna due frecce opposte. La piastra emette verso l’ambiente e l’ambiente stesso irradia verso la piastra. Nel modello nero e con tutta la vista occupata da un ambiente uniforme, il flusso netto uscente è la differenza fra quei due contributi. Usa temperature assolute in kelvin e trascura gli altri canali di scambio.'),
            formula(r'j=\sigma(T^4-T_a^4),\qquad T_a=300\ \mathrm K,\qquad \sigma\simeq5{,}67\times10^{-8}\ \mathrm{W\,m^{-2}\,K^{-4}}'),
            text('A 200 K raccogli (100 K)⁴ = 10⁸ K⁴. Rimane 2⁴ − 3⁴ = 16 − 81 = −65. Il fattore 10⁸ cancella quello nella costante. Per moltiplicare 5,67 per 65, somma 5,67 × 60 = 340,2 e 5,67 × 5 = 28,35. Con il segno ottieni −368,55 W/m². Nel tuo disegno prevale la freccia entrante. Il banco mostra il risultato netto, anch’esso entrante.'),
            text('A 400 K il fattore intero diventa 4⁴ − 3⁴ = 256 − 81 = 175. Fai 5,67 × (200 − 25). Da 1.134 togli 141,75, che è un quarto di 567. Rimangono 992,25 W/m² e nel tuo disegno prevale la freccia uscente. A 300 K le due frecce del tuo disegno hanno uguale modulo. Nel banco scompare la freccia del flusso netto. Entrambi gli scambi continuano.'),
            text('Per isolare la temperatura, somma Tₐ⁴ a j/σ e prendi la radice quarta positiva. Per trovare l’equilibrio basta porre j = 0. Ottieni T⁴ = Tₐ⁴ e quindi T = 300 K, senza calcolare alcuna radice numerica.'),
        ],
    },
}


FIRST_LAW = {
    'SIM-C3-L06-01': {
        'points': [30, -5],
        'transferPrompt': 'Per il gas, il calore con segno è {x}. Il gas compie 10 J di lavoro sull’esterno. Qual è la variazione della sua energia interna?',
        'blocks': [
            text('Prendi il gas come sistema e disegna il contorno attorno al pistone. Usa Q positivo quando il gas riceve calore e W positivo quando il gas fa lavoro sull’esterno. Per questo sistema chiuso, trascurando variazioni di energia cinetica e potenziale del gas nel suo insieme, l’energia che rimane è il saldo dei due trasferimenti.'),
            formula(r'\Delta U=Q-W,\qquad W=10\ \mathrm J'),
            text('Con Q = 30 J disegna una freccia entrante da 30 J e una uscente da 10 J. Rimangono 20 J nel gas. Poi imposta Q = −5 J. Questa volta anche il calore esce. Ottieni −5 − 10 = −15 J, cioè l’energia interna diminuisce di 15 J. Tutti i termini del bilancio sono in joule.'),
            text('Per risalire al calore da ΔU = −15 J, aggiungi il lavoro compiuto dal gas. Risulta Q = −15 + 10 = −5 J, coerente con la freccia uscente. A Q = 10 J la variazione è zero perché il calore entrante copre esattamente il lavoro uscente.'),
        ],
    },
    'SIM-C3-L06-02': {
        'points': [20, -10],
        'transferPrompt': 'Per una quantità fissa di gas ideale vale nCᵥ = 12 J/K. Se la sua temperatura cambia di {x}, quale variazione con segno ha l’energia interna?',
        'blocks': [
            text('Nel modello di gas ideale l’energia interna dipende dalla temperatura per una quantità fissa di gas. Il pistone bloccato serve a visualizzare un caso senza lavoro di espansione. La stessa relazione per ΔU vale anche per un altro percorso fra le stesse temperature, se la capacità termica del gas rimane costante.'),
            formula(r'\Delta U=nC_v\Delta T=(12\ \mathrm{J/K})\Delta T'),
            text('Traccia una scala con la temperatura iniziale a zero delle variazioni. Sposta il cursore di +20 K. Conta 12 J per ciascun kelvin, ossia 120 J per dieci kelvin. Per venti ottieni 240 J. Scendi invece di 10 K e ottieni −120 J. Nella legge il kelvin si cancella.'),
            text('Per decifrare −120 J dividi per 12 J/K. La temperatura di arrivo è 10 K sotto quella di partenza. Il segno descrive una differenza. Il grafico non implica che la temperatura assoluta o l’energia interna siano negative.'),
        ],
    },
    'SIM-C3-L06-03': {
        'points': [20, -20],
        'transferPrompt': 'Il gas ha una variazione di energia interna di +10 J. Il lavoro compiuto dal gas, con il segno del banco, è {x}. Quale calore con segno deve attraversare il confine?',
        'blocks': [
            text('Segui l’energia attraverso il confine del gas. In questa convenzione, W è positivo se il gas spinge l’ambiente e negativo se l’ambiente comprime il gas. Qui ti è assegnato un aumento di energia interna di 10 J e devi decidere quanta energia attraversa il confine sotto forma di calore.'),
            formula(r'\Delta U=Q-W,\qquad Q=\Delta U+W=(10\ \mathrm J)+W'),
            text('Con W = +20 J traccia 20 J di lavoro in uscita e 10 J di aumento al centro del disegno. In entrata devono passare 30 J di calore. Con W = −20 J il lavoro è invece 20 J in entrata. Solo 10 J rimangono nel gas. La differenza esce come calore e Q = 10 − 20 = −10 J.'),
            text('Per controllare il secondo caso fai Q − W = −10 − (−20) = +10 J. Il segno negativo del calore descrive un’uscita e non cambia il verso della compressione. A W = −10 J il lavoro entrante è esattamente l’aumento richiesto e Q vale zero.'),
        ],
    },
    'SIM-C3-L06-04': {
        'points': [1.5, -0.75],
        'transferPrompt': 'Il gas cambia volume di {x} con pressione di lavoro costante di 100 kPa. Quale lavoro con segno compie sull’ambiente?',
        'blocks': [
            text('Sul diagramma p–V disegna una retta orizzontale alla pressione di lavoro di 100 kPa. Per il moto quasi statico del pistone del banco, il lavoro del gas è l’integrale della pressione in funzione del volume. La pressione resta costante, quindi basta il rettangolo con base pari alla variazione di volume e il verso indicato dalla freccia.'),
            formula(r'W=\int_{V_i}^{V_f}p\,dV=p(V_f-V_i),\qquad 1\ \mathrm{kPa\,L}=10^3\ \mathrm{Pa}\times10^{-3}\ \mathrm{m^3}=1\ \mathrm J'),
            text('Sposta il pistone verso destra di 1,5 L. Il rettangolo orientato vale 100 × 1,5 = +150 J. Per la compressione disegna il percorso da destra a sinistra. La base è −0,75 L e 100 × (−3/4) = −75 J. Entrambi i rettangoli hanno area geometrica positiva, ma l’orientamento decide il segno dell’integrale.'),
            text('Se misuri −75 J, dividi per 100 kPa e trovi −0,75 L. La pressione positiva produce lavoro negativo perché il volume diminuisce. Parlare di lavoro fatto sul gas invertirebbe il segno rispetto alla grandezza chiesta.'),
        ],
    },
}


PATHS = {
    'SIM-C3-L07-01': {
        'points': [1, 2],
        'formula': 'W = Σ pₑ,ᵢ ΔVᵢ, con pₑ,ᵢ = (100 kPa·L)/Vᵢ al termine di ciascun tratto',
        'transferPrompt': 'Il pistone passa da 1 L a 2 L in {x} espansioni uguali. In ogni tratto mantieni la pressione esterna pari a (100 kPa·L) diviso per il volume finale del tratto. Quanti joule di lavoro ottieni? Per un decimale periodico arrotonda al centesimo.',
        'blocks': [
            text('Sul piano p–V segna gli equilibri a 1 L e a 2 L sull’isoterma pV = 100 kPa·L. Il lavoro di ogni espansione dipende dal carico esterno contro cui si muove il pistone. Con salti finiti, scegli un carico costante in ogni tratto e usa la pressione di equilibrio del suo estremo destro. Il rettangolo mostra il lavoro sul carico.'),
            formula(r'W=\sum_i p_{{\rm est},i}\Delta V_i,\qquad p_{{\rm est},i}=\frac{100\ \mathrm{kPa\,L}}{V_i},\qquad 1\ \mathrm{kPa\,L}=1\ \mathrm J'),
            text('Con un solo tratto, il carico è 100/2 = 50 kPa. La base è 1 L e il rettangolo vale 50 J. Per due tratti inserisci il punto intermedio a 3/2 L. Il primo carico vale 200/3 kPa, il secondo 50 kPa. Le due basi misurano mezzo litro ciascuna.'),
            text('Le aree sono 100/3 J e 25 J. Somma con denominatore tre e ottieni (100 + 75)/3 = 175/3 J. Poiché 3 × 58 = 174, resta 1/3 J. Scrivi 58,33 J arrotondando il tre periodico al centesimo. La somma dei due rettangoli supera il rettangolo singolo di 25/3 J.'),
            text('Continua il disegno con rettangoli sempre più stretti. L’isoterma decresce, quindi i rettangoli all’estremo destro stanno sotto la curva. Nel limite la differenza di pressione che guida ciascun passo tende a zero e il lavoro si avvicina a 100 ln 2 J. Le due consegne richiedono soltanto le aree dei rettangoli.'),
        ],
    },
    'SIM-C3-L07-02': {
        'points': [2, 4],
        'transferPrompt': 'Una quantità fissa di gas ideale resta in equilibrio termico alla stessa temperatura, con pV = 100 kPa·L. Se il volume finale è {x}, quale pressione assoluta ottieni?',
        'blocks': [
            text('Nel disegno il pistone è a contatto con un termostato. Una quantità fissa di gas ideale alla stessa temperatura conserva il prodotto pressione per volume. Colloca i punti di equilibrio sul piano p–V. Spostare il pistone verso un volume maggiore riduce la pressione, seguendo un’iperbole.'),
            formula(r'p_2V_2=p_1V_1=100\ \mathrm{kPa\,L},\qquad p_2=\frac{100\ \mathrm{kPa\,L}}{V_2}'),
            text('A 2 L dividi 100 per 2 e ottieni 50 kPa. A 4 L dividi per 4 e leggi 25 kPa. I litri si cancellano. Controlla i due punti ricostruendo i prodotti 50 × 2 e 25 × 4. Entrambi valgono 100 kPa·L.'),
            text('Se conosci invece 25 kPa, isola il volume e dividi 100 kPa·L per 25 kPa. Ritrovi 4 L. Raddoppiare il volume da 2 a 4 L dimezza la pressione pur lasciando la temperatura invariata. Usa una pressione assoluta nella legge del gas ideale.'),
        ],
    },
    'SIM-C3-L07-03': {
        'points': [250, 400],
        'transferPrompt': 'Nel cilindro rigido chiuso il gas ideale era a 150 kPa e 300 K. A {x}, quale pressione assoluta prevedi?',
        'blocks': [
            text('Blocca il pistone e disegna due punti sopra la stessa tacca di volume. Per una quantità fissa di gas ideale, a volume costante il rapporto p/T rimane uguale fra gli equilibri. La temperatura è assoluta, perché i rapporti fra temperature in gradi Celsius sposterebbero lo zero fisico.'),
            formula(r'\frac{p_2}{T_2}=\frac{p_1}{T_1}=\frac{150\ \mathrm{kPa}}{300\ \mathrm K}=\frac12\ \mathrm{kPa/K}'),
            text('Prendi metà di 250 e leggi 125 kPa. Poi prendi metà di 400 e leggi 200 kPa. Segna i due punti su una retta nel piano p–T. Nella rappresentazione p–V restano sulla stessa verticale, quindi la variazione di volume è zero e il pistone non compie lavoro di espansione.'),
            text('Se il manometro assoluto legge 200 kPa, dividi per mezzo kPa/K. Dividere per un mezzo raddoppia la lettura numerica e dà 400 K. L’aumento di pressione avviene a volume fisso perché il gas si scalda, senza spostare il pistone.'),
        ],
    },
    'SIM-C3-L07-04': {
        'points': [250, 450],
        'transferPrompt': 'Un gas ideale chiuso occupa 3 L a 300 K. Si porta a {x} mantenendo la stessa pressione assoluta mediante un pistone libero. Quale volume misura?',
        'blocks': [
            text('Mantieni lo stesso carico sul pistone e aspetta l’equilibrio dopo ogni cambio di temperatura. Se il pistone scorre senza attrito apprezzabile e la quantità di gas resta fissa, la pressione resta quella imposta dal carico e dall’atmosfera. Nella legge del gas ideale rimane costante il rapporto fra volume e temperatura.'),
            formula(r'\frac{V_2}{T_2}=\frac{V_1}{T_1}=\frac{3\ \mathrm L}{300\ \mathrm K}=\frac{1}{100}\ \mathrm{L/K}'),
            text('Disegna sullo stesso cilindro tre tacche per il pistone a 250, 300 e 450 K. Dividendo 250 per 100 ottieni 2,5 L. La tacca centrale è 3 L e a 450 K ottieni 4,5 L. Sul piano p–V i tre equilibri stanno sulla stessa orizzontale perché la pressione è fissata.'),
            text('Per tornare da 4,5 L alla temperatura, moltiplica per 100 K/L e ottieni 450 K. In questo modello il gas più caldo occupa più volume, quindi durante l’espansione il pistone compie lavoro sul carico. Il rapporto va calcolato usando kelvin.'),
        ],
    },
}
CYCLES = {
    'SIM-C3-L08-01': {
        'points': [1, 2.5],
        'formula': 'W per ciclo orario = (p alta − p bassa) ΔV, con p alta − p bassa = 60 kPa',
        'transferPrompt': 'Il ciclo rettangolare orario ha isobare distanti 60 kPa e varia di volume di {x} fra i rami verticali. Quanto lavoro produce in un giro?',
        'blocks': [
            text('Traccia il lato alto verso destra e quello basso verso sinistra. Sul ramo alto il gas si espande e dà un lavoro positivo. Sul ramo basso si comprime a una pressione minore e il lavoro ha segno negativo. Nei lati verticali il volume resta uguale e il lavoro di volume è zero.'),
            formula(r'W=p_{\rm alta}\Delta V-p_{\rm bassa}\Delta V=(60\ \mathrm{kPa})\Delta V'),
            text('Il rettangolo rimasto ha altezza 60 kPa. Se la larghezza è 1 L, l’area orientata vale 60 kPa·L = 60 J. Se è 2,5 L, fai 60 × (2 + 1/2) = 120 + 30 = 150 J. La conversione usa 1 kPa·L = 1 J.'),
            text('Se conosci 150 J e l’altezza è 60 kPa, dividi 150 per 60 e trovi 5/2 L. Invertendo il giro scambi le pressioni a cui avvengono espansione e compressione. Il rettangolo ha la stessa area geometrica e il lavoro netto cambia segno.'),
        ],
    },
    'SIM-C3-L08-02': {
        'points': [40, 85],
        'formula': 'ΔU per ciclo = 0. W = Q entrante − Q ceduto, con Q entrante = 100 J',
        'transferPrompt': 'Il fluido di un motore assorbe 100 J e cede {x} alla sorgente fredda in un giro completo. Qual è il lavoro netto erogato?',
        'blocks': [
            text('Disegna la sorgente calda, il motore e la sorgente fredda. In un giro completo il fluido torna allo stesso stato. L’energia interna è una funzione di stato, quindi la differenza fra fine e inizio è zero. Il lavoro ottenuto equivale al calore netto entrato nel fluido.'),
            formula(r'0=Q_{\rm caldo}-Q_{\rm freddo}-W,\qquad W=(100\ \mathrm J)-Q_{\rm freddo}'),
            text('Traccia 100 J in entrata e 40 J in uscita verso il serbatoio freddo. Rimangono 60 J di lavoro. Nel secondo giro esemplificato escono 85 J come calore e il lavoro utile è 100 − 85 = 15 J. Nei due disegni le due frecce in uscita riportano insieme a 100 J.'),
            text('Se misuri 15 J all’albero, ricavi che 85 J sono stati ceduti. Questo bilancio ricostruisce il trasferimento di energia. La realizzazione fisica del rendimento richiede anche temperature delle sorgenti compatibili con il secondo principio.'),
        ],
    },
    'SIM-C3-L08-03': {
        'points': [2, 6],
        'transferPrompt': 'Il contatore indica {x} giri completi e identici. In ciascun giro il motore eroga 20 J. Quanto lavoro ha trasferito all’esterno?',
        'blocks': [
            text('Segui la freccia lungo un giro chiuso e segna una tacca dopo il ritorno allo stato iniziale. L’energia interna del fluido torna al valore di partenza. L’albero però ha già ricevuto 20 J dall’intero giro. Se il percorso e le condizioni si ripetono, il contributo al lavoro resta lo stesso.'),
            formula(r'W_{\rm totale}=N W_{\rm giro}=N(20\ \mathrm J)'),
            text('Per due giri aggiungi 20 + 20 = 40 J. Per sei giri puoi raggruppare tre coppie di giri da 40 J ciascuna e trovare 120 J. Segna le tacche a 20 J di distanza su una scala del lavoro cumulato. Il contatore è un numero puro.'),
            text('Se il totale è 120 J, dividi per i 20 J per giro e ritrovi sei giri completi. Per ricavare una potenza media servirebbe anche il tempo trascorso. Qui il contatore misura direttamente quanta energia è stata trasferita come lavoro.'),
        ],
    },
}


ENGINES = {
    'SIM-C3-L09-01': {
        'points': [20, 60],
        'transferPrompt': 'Un frigorifero reversibile preleva {x} da un serbatoio a 300 K. L’altro serbatoio è a 450 K. Quanto calore deve cedere alla sorgente calda nel caso limite?',
        'blocks': [
            text('Nel disegno il frigorifero sottrae calore al serbatoio freddo e ne cede al caldo. Entrambi i valori sono moduli positivi. In un giro reversibile la variazione di entropia complessiva dei due serbatoi è zero. Il frigorifero torna allo stato di partenza, quindi il rapporto fra calore e temperatura ha lo stesso valore sui due lati.'),
            formula(r'\frac{Q_h}{T_h}=\frac{Q_c}{T_c},\qquad Q_h=Q_c\frac{450\ \mathrm K}{300\ \mathrm K}=\frac32 Q_c'),
            text('Accanto alla freccia da 20 J sul lato freddo, scrivi il valore del lato caldo. Moltiplicare per 3/2 equivale ad aggiungere una metà. Ottieni 20 + 10 = 30 J. Con 60 J ottieni 60 + 30 = 90 J. Il kelvin si cancella nel rapporto delle temperature.'),
            text('Il lavoro entrante è Qₕ − Q𝒸, cioè 10 J nel primo caso e 30 J nel secondo. Se la macchina ideale cede 90 J al caldo, moltiplica per 2/3 e ritrovi 60 J sottratti al freddo. Per lo stesso calore sottratto e le stesse temperature, una macchina irreversibile richiede più lavoro.'),
        ],
    },
    'SIM-C3-L09-02': {
        'points': [50, 150],
        'transferPrompt': 'Una macchina termica assorbe {x} per ciclo e ha rendimento del 30%. Quanto lavoro consegna all’albero?',
        'blocks': [
            text('La freccia entrante riporta il calore ricevuto dal caldo. La macchina funziona in ciclo, quindi quell’energia si divide fra lavoro utile e calore ceduto al freddo. Il 30% significa che tre decimi del calore ricevuto vanno nel ramo del lavoro.'),
            formula(r'\eta=\frac{W}{Q_h}=\frac{3}{10},\qquad W=\frac{3Q_h}{10},\qquad Q_c=Q_h-W'),
            text('Per 50 J dividi prima per dieci e poi moltiplica per tre. Fai 5 × 3 = 15 J e traccia una freccia da 35 J verso il freddo. Con 150 J il conto è 15 × 3 = 45 J, mentre alla sorgente fredda restano 105 J. Le due frecce in uscita fanno sempre la somma iniziale.'),
            text('Per risalire al calore in ingresso da 45 J di lavoro, dividi per tre e moltiplica per dieci. Ottieni 150 J. Con le sorgenti a 600 e 300 K del banco, il limite reversibile è 1 − 300/600 = 1/2. Il 30% assegnato rispetta questo limite.'),
        ],
    },
    'SIM-C3-L09-03': {
        'points': [15, 45],
        'formula': 'η = W/Q entrante, con Q entrante = 100 J. Il rendimento percentuale vale 100η',
        'transferPrompt': 'Il motore assorbe 100 J in un giro completo e consegna {x} di lavoro. Qual è il suo rendimento in percentuale?',
        'blocks': [
            text('Prendi come riferimento la freccia del calore assorbito, che vale 100 J. Il rendimento è la parte di quel calore che arriva all’albero. Dividi joule per joule e ottieni una frazione senza unità. Per esprimerla in percentuale, indica quante parti utili corrispondono a cento parti assorbite.'),
            formula(r'\eta=\frac{W}{100\ \mathrm J},\qquad \eta\cdot100\ \text{è il valore percentuale}'),
            text('Accanto alla freccia da 100 J disegna un ramo lavoro da 15 J e uno calore ceduto da 85 J. Il rendimento è 15/100, cioè 15%. Nel secondo disegno 45 J di lavoro danno 45%. La stessa uguaglianza fra i numeri vale perché il riferimento è proprio 100 J.'),
            text('Da 45% del calore noto risali al lavoro moltiplicando i 100 J per 45/100. Restano 55 J per il serbatoio freddo. Per le sorgenti assegnate, 300 e 600 K, il massimo reversibile è 50%. Il risultato del banco resta entro questo limite.'),
        ],
    },
    'SIM-C3-L09-04': {
        'points': [250, 400],
        'formula': 'η reversibile = 1 − T fredda/(500 K). Esprimi il risultato in percentuale',
        'transferPrompt': 'Un motore ciclico scambia calore con una sorgente calda a 500 K e una fredda a {x}. Qual è il suo massimo rendimento percentuale?',
        'blocks': [
            text('Disegna due serbatoi a temperatura assoluta fissata. In un ciclo reversibile i calori scambiati, presi in modulo, stanno fra loro come le temperature assolute. La differenza fra il calore assorbito e quello ceduto fornisce lavoro. Questo rapporto dà il limite di Carnot per la coppia di sorgenti.'),
            formula(r'\frac{Q_c}{Q_h}=\frac{T_c}{T_h},\qquad \eta_{\rm rev}=1-\frac{T_c}{T_h},\qquad T_h=500\ \mathrm K'),
            text('Con 250 K in basso, 250/500 = 1/2. Su 100 J assorbiti, 50 J vanno al freddo e 50 diventano lavoro. Il limite è 50%. Con 400 K, dividi 400 per 500 e ottieni 4/5. Rimangono 1/5 per il lavoro, ossia il 20%. Mostra le due partizioni con la stessa freccia entrante da 100 J.'),
            text('Se il limite è 20% e il caldo resta a 500 K, il rapporto delle temperature è 1 − 1/5 = 4/5. Quattro quinti di 500 sono 400 K. Quando le temperature coincidono il rapporto è uno, tutto il calore torna al serbatoio freddo e il lavoro netto si annulla.'),
        ],
    },
}
ENTROPY = {
    'SIM-C3-L10-01': {
        'points': [-30, 60],
        'transferPrompt': 'Nel percorso reversibile a temperatura costante di 300 K il corpo scambia un calore con segno di {x}. Qual è la variazione della sua entropia?',
        'blocks': [
            text('Fissa il confine attorno al corpo. Il calore è positivo se entra nel corpo e negativo se esce. Il banco idealizza un percorso reversibile a 300 K. L’entropia si ottiene integrando il calore reversibile diviso per la temperatura. Essendo costante, la temperatura si porta fuori dall’integrale.'),
            formula(r'\Delta S=\int\frac{\delta Q_{\rm rev}}{T}=\frac{Q_{\rm rev}}{300\ \mathrm K}'),
            text('Disegna una freccia uscente da 30 J. La variazione per il corpo è −30/300 = −1/10 J/K, cioè −0,1 J/K. Poi traccia la freccia entrante da 60 J. Dividi 60 per 300 e trovi 1/5 J/K, cioè 0,2 J/K. Il segno segue quello dell’energia che attraversa il confine.'),
            text('Per ritrovare il calore da 0,2 J/K moltiplica per 300 K e ottieni 60 J. Nel percorso reversibile il serbatoio alla stessa temperatura varia di entropia con segno opposto. Qui si chiede la variazione del corpo. Per due stati fissati, un altro percorso reversibile darebbe la stessa variazione di entropia.'),
        ],
    },
    'SIM-C3-L10-02': {
        'points': [30, 90],
        'transferPrompt': 'Da un serbatoio a 600 K passano {x} a uno a 300 K. Entrambi mantengono la loro temperatura. Quanto aumenta l’entropia della coppia?',
        'blocks': [
            text('Disegna la parte calda e quella fredda dentro un unico confine. La stessa energia Q esce dalla prima ed entra nella seconda. I serbatoi sono abbastanza grandi da mantenere le temperature. Per ciascuno, la variazione di entropia si calcola fra i suoi stati di equilibrio alla stessa temperatura, anche se lo scambio diretto fra i due è irreversibile.'),
            formula(r'\Delta S_{\rm tot}=-\frac{Q}{600\ \mathrm K}+\frac{Q}{300\ \mathrm K}=\frac{Q}{600\ \mathrm K}'),
            text('La sorgente fredda guadagna il doppio dell’entropia che perde quella calda, perché ha metà della temperatura assoluta. Per 30 J hai 30/600 = 1/20 J/K, cioè 0,05 J/K. Per 90 J il valore è il triplo, 0,15 J/K. L’energia trasferita è uguale da un lato e dall’altro, mentre i due contributi di entropia hanno moduli diversi.'),
            text('Risali da 0,15 J/K moltiplicando per 600 K. Tre ventesimi di 600 sono 90 J. Il segno positivo indica produzione di entropia per lo scambio spontaneo rispetto al confine che comprende entrambi i serbatoi.'),
        ],
    },
    'SIM-C3-L10-03': {
        'points': [2, 4],
        'transferPrompt': 'Le quattro particelle A, B, C e D occupano due metà. Se le particelle nella metà sinistra sono {x}, quante assegnazioni delle identità alle due metà producono quel conteggio?',
        'blocks': [
            text('Disegna due riquadri e usa quattro lettere diverse per le particelle. Nel modello ciascuna particella occupa una metà. Se conosci quali sono a sinistra, le rimanenti sono a destra. Il banco raggruppa tutte le assegnazioni che hanno lo stesso numero a sinistra.'),
            formula(r'\Omega(k)=\binom{4}{k}=\frac{4!}{k!(4-k)!}'),
            text('Per due a sinistra scrivi le coppie AB, AC, AD, BC, BD e CD. Hai sei configurazioni. AB e BA sono lo stesso gruppo, perché la posizione all’interno della metà resta fuori da questo conteggio. Con tutte e quattro a sinistra c’è un solo gruppo possibile.'),
            text('Controlla il conto moltiplicando 4 × 3 per le scelte ordinate e dividendo per due per eliminare i doppi ordini. Se invece osservi quattro configurazioni compatibili, il numero a sinistra può essere uno oppure tre. Nel modello con assegnazioni equiprobabili, maggiore molteplicità corrisponde a maggiore entropia del conteggio. Per le due risposte basta contare le configurazioni.'),
        ],
    },
    'SIM-C3-L10-04': {
        'points': [-60, 30],
        'transferPrompt': 'Fra due serbatoi a 600 e 300 K, il calore assegnato nel verso dal caldo al freddo vale {x}. Quale variazione totale di entropia risulta per la coppia, con il segno?',
        'blocks': [
            text('Disegna una freccia dal serbatoio a 600 K verso quello a 300 K e usala per definire Q positivo. Con Q negativo la freccia effettiva si inverte. In entrambi i casi scrivi le variazioni dei due serbatoi usando le loro temperature assolute costanti.'),
            formula(r'\Delta S_{\rm coppia}=-\frac{Q}{600\ \mathrm K}+\frac{Q}{300\ \mathrm K}=\frac{Q}{600\ \mathrm K}'),
            text('A Q = −60 J il caldo riceve 60 J e il freddo ne perde 60. La somma è −60/600 = −0,1 J/K. A Q = +30 J, la freccia segue il verso spontaneo e il conto è 30/600 = 0,05 J/K. Per risalire al calore da una variazione di entropia moltiplica per 600 K e conserva il segno.'),
            text('Il risultato negativo segnala che il semplice scambio ipotizzato fra i soli due serbatoi non può avvenire spontaneamente. In un frigorifero reale entra lavoro e il calore ceduto al caldo supera quello sottratto al freddo. Il bilancio di quella macchina va fatto con entrambi i calori e con tutti i sistemi coinvolti.'),
        ],
    },
}


def write(path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + '\n', encoding='utf-8')


def assemble(original, directory, batch, editions, prerequisite):
    sources = {row['id']: row for row in json.loads(original.read_bytes())}
    records, bindings = [], []
    for key, edition in editions.items():
        source = sources[key]
        if (source['kind'], source['course'], source['version']) != ('experiment', 'C3', 1):
            raise ValueError('Unexpected source edition: ' + key)
        record = {
            **source, **{field: value for field, value in edition.items() if field != 'points'},
            'prerequisites': [prerequisite], 'baseVersion': 1, 'version': 2,
            'review': 'Candidata DRAFT. Revisione distinta e approvazione umana in attesa.',
            'assessmentSelection': {'schemaVersion': '1.0.0', 'points': edition['points']},
        }
        bindings.append({'id': key, 'sourceId': key, 'sourceRef': SOURCE_REF,
                         'sourceSha256': digest(source), 'candidateSha256': digest(record), 'assetChecksums': {}})
        records.append(record)
    write(directory/(batch+'.json'), {'schema':'astra/1','assets':[],'records':records})
    write(directory/(batch+'-bindings.json'), bindings)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('original', type=Path)
    parser.add_argument('directory', type=Path)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--first-law', action='store_true')
    mode.add_argument('--paths', action='store_true')
    mode.add_argument('--cycles', action='store_true')
    mode.add_argument('--engines', action='store_true')
    mode.add_argument('--entropy', action='store_true')
    args = parser.parse_args()
    if args.first_law:
        scope = FIRST_LAW_BATCH, FIRST_LAW, 'C3-L06'
    elif args.paths:
        scope = PATHS_BATCH, PATHS, 'C3-L07'
    elif args.cycles:
        scope = CYCLES_BATCH, CYCLES, 'C3-L08'
    elif args.engines:
        scope = ENGINES_BATCH, ENGINES, 'C3-L09'
    elif args.entropy:
        scope = ENTROPY_BATCH, ENTROPY, 'C3-L10'
    else:
        scope = BATCH, EDITIONS, 'C3-L05'
    assemble(args.original, args.directory, *scope)
