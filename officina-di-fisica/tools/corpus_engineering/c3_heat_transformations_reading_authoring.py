"""Six additive C3 experiment drafts. Author material, awaiting independent review."""
from copy import deepcopy
from fractions import Fraction
from hashlib import sha256
import json
from pathlib import Path
import subprocess

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH = 'officina-di-fisica/content/esperienze-C3.json'
BATCH = 'experiment-c3-heat-transformations-reading-20261127'
IDS = ('SIM-C3-L03-01', 'SIM-C3-L03-03', 'SIM-C3-L03-04',
       'SIM-C3-L04-01', 'SIM-C3-L04-02', 'SIM-C3-L04-03')

def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)

def digest(value):
    return sha256(canonical(value).encode()).hexdigest()

def text(value):
    return {'type': 'text', 'text': value}

def formula(value):
    return {'type': 'formula', 'text': value}

BLOCKS = {
'SIM-C3-L03-01': [
 text('Considera il campione come un unico sistema con capacità termica C = 50 J/K, costante nell’intervallo studiato. Il riscaldamento non cambia la fase del materiale. Trascuriamo dispersioni e lavoro meccanico: l’energia trasferita come calore aumenta l’energia interna del campione.'),
 formula(r'Q=C\,\Delta T'),
 text('Il controllo assegna un aumento di temperatura, non la temperatura assoluta. Per ogni kelvin aggiunto occorrono 50 joule. Un aumento di 8 K richiede otto gruppi da 50: fai 5 per 8 e aggiungi lo zero, ottenendo 400 J.'),
 formula(r'Q(8\,\mathrm{K})=400\,\mathrm{J}'),
 text('Il secondo compito assegna 6 K: 50 per 6 dà 300 J. Puoi controllare anche per differenza: passando da 8 a 6 K togli due gruppi da 50 J, quindi 100 J. Le unità J/K per K restituiscono joule.'),
 formula(r'Q(6\,\mathrm{K})=300\,\mathrm{J}'),
 formula(r'\Delta T=\frac{Q}{C}'),
 text('Per l’inversa dividi l’energia per 50 J/K: 300 J danno 6 K. La capacità termica riguarda tutto il campione; non va moltiplicata di nuovo per una massa. A variazione nulla il calore di questo modello è zero. La salita del termometro e il colore aiutano a confrontare gli stati; usa le letture per i valori numerici.'),
],
'SIM-C3-L03-03': [
 text('Confronta due prove sulla stessa mole di gas ideale, ripartendo dallo stesso stato. In una il volume è bloccato; nell’altra la pressione esterna e quella del gas restano uguali e costanti durante un’espansione quasi statica. Trascuriamo altri lavori. Per il gas ideale l’energia interna dipende solo dalla temperatura, quindi lo stesso aumento di temperatura produce lo stesso aumento di energia interna nelle due prove.'),
 formula(r'Q_p=nC_p\Delta T'),
 formula(r'Q_v=nC_v\Delta T'),
 formula(r'C_p-C_v=R'),
 text('Le capacità Cp e Cv sono molari e sono assunte costanti nell’intervallo considerato. La differenza fra i calori è il lavoro di espansione della prova a pressione costante. Qui n = 1 mol e il valore di lavoro assegnato per R è 8,314 J/(mol·K), una costante arrotondata. I conti seguenti sono esatti rispetto a questo dato del modello.'),
 formula(r'Q_p-Q_v=nR\Delta T'),
 text('Per 10 K, moltiplicare 8,314 per 10 sposta la virgola di un posto: servono 83,14 J in più. Per 11 K aggiungi una volta 8,314 al risultato precedente: 83,140 + 8,314 = 91,454 J. Somma le colonne mantenendo tre cifre decimali.'),
 formula(r'\Delta Q(10\,\mathrm{K})=83{,}14\,\mathrm{J}'),
 formula(r'\Delta Q(11\,\mathrm{K})=91{,}454\,\mathrm{J}'),
 text('Inserisci 83,14 e 91,454 nei due compiti. La lettura abbreviata del banco può mostrare 91,45 J; non cambia il conto con i dati assegnati. Le unità mol e K si cancellano nel prodotto nRΔT. Il numero calcolato è il calore in più a pressione costante, non uno dei due calori totali né una capacità termica.'),
 formula(r'\Delta T=\frac{\Delta Q}{nR}'),
 text('L’inversa restituisce 10 K da 83,14 J e 11 K da 91,454 J. Il pistone richiama la possibilità di espansione nella prova a pressione costante; le sue dimensioni grafiche non forniscono da sole Cp o Cv. Per separare i due calori totali occorrerebbe conoscere anche una delle due capacità molari.'),
],
'SIM-C3-L03-04': [
 text('Mescola acqua a 80 °C con 200 g di acqua a 20 °C. Il recipiente è isolato e ha capacità termica trascurabile; non c’è evaporazione e il calore specifico dell’acqua è assunto uguale e costante nei due campioni. All’equilibrio il calore perso dall’acqua calda uguaglia quello acquistato dall’acqua fredda.'),
 formula(r'mc(T_h-T_f)=m_c c(T_f-T_c)'),
 text('Nelle differenze di temperatura il grado Celsius ha la stessa ampiezza del kelvin. Elimina il fattore comune c e raccogli i termini con Tf. Nella formula numerica seguente m è il numero di grammi caldi e Tf è la lettura in °C. La media è pesata con le masse: una semplice media fra 80 e 20 è valida soltanto quando le masse sono uguali.'),
 formula(r'T_f=\frac{80m+4000}{m+200}'),
 text('Nel primo compito m = 200 g: le masse sono uguali e la media fra 80 e 20 è 50 °C. Anche il bilancio torna: entrambi i campioni cambiano temperatura di 30 K, con versi opposti.'),
 formula(r'T_f(200\,\mathrm g)=50\,{}^\circ\mathrm C'),
 text('Nel secondo compito m = 175 g. Fai 80 per 175: 8 per 175 è 1400, quindi il prodotto è 14000. Aggiungi 20 per 200, cioè 4000. Dividi 18000 per 375: 375 per 48 è 375 per (50 meno 2), cioè 18750 meno 750 = 18000. Il risultato è esattamente 48 °C.'),
 formula(r'T_f(175\,\mathrm g)=48\,{}^\circ\mathrm C'),
 text('A 48 °C l’acqua calda perde 32 K e quella fredda ne guadagna 28: 175 per 32 e 200 per 28 danno entrambi 5600 g·K. Il risultato sta fra 20 e 80 °C e, avendo più acqua fredda, è sotto 50 °C. La scatola e il colore del calorimetro sono una rappresentazione schematica: il bilancio usa masse e letture.'),
 formula(r'm=200\,\frac{T_f-20}{80-T_f}'),
 text('Per risalire al numero di grammi caldi dalla lettura finale in °C usa questa inversa numerica nel dominio 20 °C < Tf < 80 °C. Con 48 °C il rapporto è 28/32 = 7/8: sette ottavi di 200 g sono 175 g. Non usare l’inversa a 80 °C, dove il denominatore si annulla.'),
],
'SIM-C3-L04-01': [
 text('Il banco parte da 100 g di ghiaccio puro già alla temperatura di fusione, circa 0 °C alla pressione atmosferica. Assumiamo pressione costante, dispersioni trascurabili e un calore latente di lavoro Lf = 334 J/g. Finché coesistono ghiaccio e acqua, il calore fornito cambia la massa delle fasi e non la temperatura.'),
 formula(r'Q=m_f L_f'),
 formula(r'm_f=\frac{Q}{L_f}'),
 text('Il controllo dell’energia usa kilojoule, mentre Lf è in joule per grammo: moltiplica prima i kJ per 1000. Il primo compito assegna 16,7 kJ, cioè 16700 J. Poiché 334 per 5 è 1670, 334 per 50 è 16700: sono fusi 50 g.'),
 formula(r'm_f(16{,}7\,\mathrm{kJ})=50\,\mathrm g'),
 text('Il secondo compito mostra 18,37 kJ, cioè 18370 J. Dopo i primi 50 g restano 18370 meno 16700 = 1670 J, sufficienti per altri 5 g. In totale sono 55 g. Controlla moltiplicando 334 per 55: 16700 + 1670 = 18370 J.'),
 formula(r'm_f(18{,}37\,\mathrm{kJ})=55\,\mathrm g'),
 text('Inserisci 50 e 55, nelle unità g indicate dai compiti. Il limite del banco è 33,4 kJ, pari a 33400 J: fonde tutti i 100 g. Una massa fusa non può superare quella iniziale. La relazione usata qui non descrive il riscaldamento dell’acqua dopo la completa fusione.'),
 text('Il riscaldatore del banco fornisce 1,67 kJ ogni secondo: le due energie corrispondono rispettivamente a 10 e 11 s. Durante l’animazione la massa già fusa cresce fino al valore finale; il compito chiede la massa al termine dell’energia assegnata. Il tempo zero non va confuso con la fine della prova. Le quantità delle due fasi nel disegno sono schematiche.'),
],
'SIM-C3-L04-02': [
 text('Fissa il sistema nell’acqua che cambia fase. Alla temperatura di coesistenza e alla pressione scelta, evaporare richiede calore entrante, condensare cede calore all’esterno. Nel banco la massa trasformata ha segno: positiva verso il vapore, negativa verso il liquido. Il calore Q è positivo quando l’acqua lo assorbe.'),
 formula(r'Q=m_s L_v'),
 text('Il valore di lavoro assegnato è Lv = 2,26 kJ/g, approssimazione del calore latente dell’acqua vicino all’ebollizione atmosferica. Nella moltiplicazione i grammi si cancellano. Per il primo compito, +3 g, fai 2 per 3 = 6 e 0,26 per 3 = 0,78; la somma dà +6,78 kJ.'),
 formula(r'Q(+3\,\mathrm g)=+6{,}78\,\mathrm{kJ}'),
 text('Il secondo compito assegna massa trasformata zero: nessuna acqua cambia fase e il calore latente scambiato è 0 kJ. Questa conclusione riguarda il cambio di fase del modello; non afferma che qualunque processo con massa trasformata nulla abbia calore nullo.'),
 formula(r'Q(0\,\mathrm g)=0\,\mathrm{kJ}'),
 text('Per interpretare il riferimento negativo, −2 g corrispondono a condensazione e Q = −4,52 kJ: l’acqua cede 4,52 kJ all’ambiente. Scrivere +4,52 darebbe il modulo, perdendo il verso dello scambio. La massa fisica totale rimane positiva; il segno riguarda soltanto la quantità trasformata nel verso convenzionale.'),
 formula(r'm_s=\frac{Q}{L_v}'),
 text('Nell’inversa −4,52 kJ divisi per 2,26 kJ/g danno −2 g. La rappresentazione delle particelle aiuta a distinguere le fasi; usa il segno del controllo e il bilancio per stabilire se l’acqua assorbe o cede energia.'),
],
'SIM-C3-L04-03': [
 text('Considera 100 g di ghiaccio inizialmente a −10 °C, a pressione atmosferica, con dispersioni trascurabili. I valori di lavoro del modello sono c del ghiaccio = 2 J/(g·K) e calore latente L = 340 J/g, entrambi arrotondati. Prima occorre portare il ghiaccio a 0 °C; solo l’energia successiva può fonderlo.'),
 formula(r'Q_0=mc_i\Delta T'),
 formula(r'Q_0=2000\,\mathrm J=2\,\mathrm{kJ}'),
 text('Il primo tratto usa 100 per 2 per 10 = 2000 J. Se l’energia totale è al più 2 kJ, la massa fusa resta zero. Durante la fusione sottrai prima questi 2 kJ, converti l’energia rimanente in joule e dividi per 340 J/g.'),
 formula(r'm_f=\frac{1000(Q-2)}{340}\,\mathrm g'),
 text('In questa formula Q indica il valore numerico dell’energia in kJ e la formula centrale vale soltanto per 2 < Q < 36. Per fondere tutti i 100 g occorrono altri 100 per 340 = 34000 J = 34 kJ, quindi la soglia totale è 36 kJ. Oltre tale soglia restano fusi 100 g: l’ulteriore energia scalda l’acqua, senza creare altra massa.'),
 formula(r'm_f=0\quad(Q\leq2)'),
 formula(r'm_f=100\,\mathrm g\quad(Q\geq36)'),
 text('Nel primo compito Q = 19 kJ: tolti 2 restano 17 kJ, cioè 17000 J. Dato che 340 per 50 = 17000, la massa fusa è 50 g. Nel secondo Q = 28 kJ: restano 26 kJ e 26000/340 = 1300/17 g.'),
 formula(r'm_f(19\,\mathrm{kJ})=50\,\mathrm g'),
 formula(r'm_f(28\,\mathrm{kJ})=\frac{1300}{17}\,\mathrm g'),
 text('Per scrivere un numero decimale senza calcolatrice fai la divisione: 17 per 76 = 1292, resta 8. Porta uno zero: 80 diviso 17 dà 4, resta 12. Porta un altro zero: 120 diviso 17 dà 7, resta 1. Quindi 76,47 è il risultato troncato ai centesimi; la cifra successiva è 0. L’errore è esattamente 1/1700 g, meno di un millesimo di grammo.'),
 formula(r'\frac{1300}{17}\,\mathrm g\approx76{,}47\,\mathrm g'),
 text('Inserisci 50 e 76,47 nei due ingressi numerici, dove l’unità g è già indicata. Il banco abbrevia la seconda lettura a 76,47 g. La frazione resta il risultato esatto rispetto ai dati, ma il campo richiede un numero e non l’espressione 1300/17.'),
 formula(r'Q=2+\frac{340m_f}{1000}'),
 text('Per risalire all’energia nella sola coesistenza, inserisci in questa inversa la massa in grammi e ottieni Q in kJ. Una massa fusa di 0 o 100 g non determina invece un’unica energia: identifica un intero tratto del grafico. Il riscaldatore fornisce 2 kJ/s: inizia a fondere a 1 s e completa la fusione a 18 s. Le energie assegnate finiscono a 9,5 e 14 s. Durante l’animazione distingui la massa già fusa da quella finale richiesta dal compito.'),
],
}

INTERPRETATIONS = {
'SIM-C3-L03-01': 'A capacità termica totale costante, senza cambiamenti di fase, dispersioni o lavoro meccanico, il calore assorbito è proporzionale all’aumento di temperatura. Confronta le letture dei diversi stati.',
'SIM-C3-L03-03': 'Per la stessa mole di gas ideale e lo stesso aumento di temperatura, l’energia interna varia ugualmente nelle due prove. La prova quasi statica a pressione costante richiede in più il lavoro di espansione nRΔT; quella a volume costante non compie lavoro di volume.',
'SIM-C3-L03-04': 'Il recipiente è isolato, di capacità trascurabile, e i due campioni sono acqua con uguale calore specifico, senza evaporazione. La temperatura di equilibrio è una media pesata con le masse e rimane fra le due temperature iniziali.',
'SIM-C3-L04-01': 'Parti da 100 g di ghiaccio puro già a circa 0 °C alla pressione atmosferica. Con Lf = 334 J/g e dispersioni trascurabili, il calore riduce la massa solida fino alla completa fusione. Durante la coesistenza la temperatura resta circa costante.',
'SIM-C3-L04-02': 'Il sistema è l’acqua alla temperatura di coesistenza. La massa trasformata è positiva per evaporazione e negativa per condensazione; Q è positivo se l’acqua assorbe calore. Il valore di lavoro del calore latente è 2,26 kJ/g.',
'SIM-C3-L04-03': 'Per 100 g di ghiaccio a −10 °C, i primi 2 kJ scaldano il solido fino a 0 °C. Con L = 340 J/g, altri 34 kJ fondono tutto. Durante la coesistenza cresce la massa fusa; dopo 36 kJ l’acqua si scalda e la massa fusa resta 100 g.',
}

MANUAL = {
'SIM-C3-L03-01': [(Fraction(8), Fraction(400), '400'), (Fraction(6), Fraction(300), '300')],
'SIM-C3-L03-03': [(Fraction(10), Fraction(4157, 50), '83.14'), (Fraction(11), Fraction(45727, 500), '91.454')],
'SIM-C3-L03-04': [(Fraction(200), Fraction(50), '50'), (Fraction(175), Fraction(48), '48')],
'SIM-C3-L04-01': [(Fraction(167, 10), Fraction(50), '50'), (Fraction(1837, 100), Fraction(55), '55')],
'SIM-C3-L04-02': [(Fraction(3), Fraction(339, 50), '6.78'), (Fraction(0), Fraction(0), '0')],
'SIM-C3-L04-03': [(Fraction(19), Fraction(50), '50'), (Fraction(28), Fraction(1300, 17), '76.47')],
}

def build():
    raw = subprocess.check_output(['git', 'show', SOURCE_REF+':'+SOURCE_PATH], cwd=APP.parent, env=None)
    sources = {r['id']: r for r in json.loads(raw)}
    rows, bindings = [], []
    for key in IDS:
        source = sources[key]
        row = deepcopy(source)
        row.update(version=source['version']+1, baseVersion=source['version'], blocks=BLOCKS[key],
                   interpretation=INTERPRETATIONS[key], prerequisites=source.get('prerequisites', []),
                   review='Candidata DRAFT. Revisione distinta e approvazione umana in attesa.')
        # No selection override: retain both assignments actually compiled by b999.
        rows.append(row)
        bindings.append({'id':key,'sourceId':key,'sourceRef':SOURCE_REF,'sourceSha256':digest(source),
                         'candidateSha256':digest(row),'assetChecksums':{}})
    return {'schema':'astra/1','records':rows,'assets':[]}, bindings

def write():
    package, bindings = build()
    target = APP/'editorial/batches'
    target.mkdir(parents=True, exist_ok=True)
    for name, value in [(BATCH,package),(BATCH+'-bindings',bindings)]:
        (target/(name+'.json')).write_text(json.dumps(value,ensure_ascii=False,sort_keys=True,indent=2)+'\n')
    return package, bindings

if __name__ == '__main__':
    package, _ = write()
    print(canonical({'batch':BATCH,'records':len(package['records']),'packageCanonicalSha256':digest(package),
                     'activityCredit':0,'independentReview':'PENDING','humanApproval':'NOT_RUN'}))
