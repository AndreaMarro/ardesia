"""Assemble the C3 heat-exchange and first-law draft editions."""

import argparse
import json
from pathlib import Path

from tools.corpus_engineering.pipeline import digest


SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH = 'experiment-c3-heat-exchange-reading-20261127'
FIRST_LAW_BATCH = 'experiment-c3-first-law-reading-20261127'


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
            formula(r'P=kA\frac{\Delta T}{L},\quad kA\Delta T=(1\ \mathrm{W/(m\,K)})(0{,}01\ \mathrm{m^2})(20\ \mathrm K)=0{,}20\ \mathrm{W\,m}'),
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
    parser.add_argument('--first-law', action='store_true')
    args = parser.parse_args()
    scope = (FIRST_LAW_BATCH, FIRST_LAW, 'C3-L06') if args.first_law else (BATCH, EDITIONS, 'C3-L05')
    assemble(args.original, args.directory, *scope)
